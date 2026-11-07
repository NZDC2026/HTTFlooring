package com.htt.management.identity;

import com.htt.management.identity.contract.CustomerBranchScope;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Action and ownership gate shared by all callers of the customer branch-list use case. */
public class CustomerBranchAccess {
    private final AccessRepository repository;
    private final AccessAudit audit;

    public CustomerBranchAccess(AccessRepository repository, AccessAudit audit) {
        this.repository = repository;
        this.audit = audit;
    }

    public CustomerBranchScope require(UUID company, UUID grant) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomerBranchScope scope = null;
        if (authentication != null && authentication.getPrincipal() instanceof VerifiedUser user
                && user.realm() == AccessSnapshot.Realm.CUSTOMER) {
            // The narrow function rechecks member, action, customer and grant in this transaction.
            scope = repository.customerBranchScope(user.access().actorId(), company, grant);
            if (scope != null && (!scope.actorId().equals(user.access().actorId())
                    || !scope.companyId().equals(company) || !scope.grantId().equals(grant))) scope = null;
        }
        var request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        audit.record(request, "branch:read", company, grant, scope == null ? "DENY" : "ALLOW");
        if (scope == null) throw new AccessDeniedException("Access is denied.");
        return scope;
    }
}
