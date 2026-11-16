package com.htt.management.identity;

import java.util.UUID;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import static com.htt.management.identity.AccessSnapshot.*;

/** Explicit action/scope gate for customer management. Never derives eligibility from a client name. */
public class CustomerManagementAccess {
    private final AccessAudit audit;
    public CustomerManagementAccess(AccessAudit audit) { this.audit = audit; }
    public void requireCustomer(Context context,UUID customer,String action) {
        var request=((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
        boolean allowed=context.includes(customer);
        audit.record(request,action,context.companyId(),customer,allowed?"ALLOW":"DENY");
        if(!allowed) throw new AccessDeniedException("Access is denied.");
    }
    public record Context(UUID actorId, UUID companyId, boolean companyWide, Set<UUID> customers) {
        public boolean includes(UUID customer) { return companyWide || customers.contains(customer); }
    }
    public Context require(String action) {
        var request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        var user = ResourceAccess.currentUser();
        UUID company = null;
        try { company = UUID.fromString(request.getHeader("X-Company-Id")); } catch (RuntimeException ignored) { }
        CompanyAccess member = null;
        if (user != null && company != null) for (var candidate : user.access().companies())
            if (candidate.companyId().equals(company)) member = candidate;
        boolean read = action.equals("customer:read");
        boolean allowed = user != null && user.realm() == Realm.STAFF && member != null
                && member.permissions().contains(action) && (read || member.memberKind() == MemberKind.MANAGEMENT);
        boolean all = allowed && member.grants().stream().anyMatch(g -> g.scope() == Scope.COMPANY);
        if (action.equals("customer:create") && !all) allowed = false;
        audit.record(request, action, company, null, allowed ? "ALLOW" : "DENY");
        if (!allowed) throw new AccessDeniedException("Access is denied.");
        var customers = member.grants().stream().filter(g -> g.customerId() != null).map(Grant::customerId)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        return new Context(user.access().actorId(), company, all, customers);
    }
}
