package com.htt.management.identity;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Resolves the authenticated portal account, never a subject supplied by the browser. */
public class CustomerPricingAccess {
    private final JdbcTemplate jdbc;
    private final AccessAudit audit;
    public CustomerPricingAccess(JdbcTemplate jdbc,AccessAudit audit) { this.jdbc=jdbc;this.audit=audit; }
    public record Context(UUID actorId,UUID companyId,UUID subjectId,UUID customerId) { }

    public Context requireOwn() {
        if(!TransactionSynchronizationManager.isActualTransactionActive()) throw new IllegalStateException("Transaction required");
        var user=ResourceAccess.currentUser();
        Context result=null;
        if(user!=null&&user.realm()==AccessSnapshot.Realm.CUSTOMER&&user.access().companies().size()==1) {
            var company=user.access().companies().getFirst();
            if(company.permissions().contains("pricing:read-own")) {
                jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,company.companyId().toString());
                jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,user.access().actorId().toString());
                result=jdbc.query("""
                    select actor_id,company_id,customer_subject_id,customer_id from identity.customer_account
                    where actor_id=? and company_id=? and status='ACTIVE' and sync_status='READY'
                    """,(r,n)->new Context(r.getObject(1,UUID.class),r.getObject(2,UUID.class),r.getObject(3,UUID.class),r.getObject(4,UUID.class)),
                    user.access().actorId(),company.companyId()).stream().findFirst().orElse(null);
                Context account=result;
                if(account!=null&&company.grants().stream().noneMatch(g->g.scope()!=AccessSnapshot.Scope.COMPANY
                        &&account.customerId().equals(g.customerId()))) result=null;
            }
        }
        var request=((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
        audit.record(request,"pricing:read-own",result==null?null:result.companyId(),result==null?null:result.subjectId(),result==null?"DENY":"ALLOW");
        if(result==null) throw new AccessDeniedException("Access is denied.");
        return result;
    }
}
