package com.htt.management.identity;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import static com.htt.management.identity.AccessSnapshot.*;

/** Shared action + ownership gate. Future order use cases must call requireCreateOrder inside their transaction. */
public class ResourceAccess {
    private final AccessRepository repository;
    private final AccessAudit audit;

    public ResourceAccess(AccessRepository repository, AccessAudit audit) {
        this.repository = repository;
        this.audit = audit;
    }

    public boolean isStaff() { return realm(Realm.STAFF); }
    public boolean isCustomer() { return realm(Realm.CUSTOMER); }

    private boolean realm(Realm expected) {
        VerifiedUser user = currentUser();
        return decision("identity:me", null, user != null && user.realm() == expected);
    }

    public boolean canReadCustomer(UUID id) { return canRead(ResourceKind.CUSTOMER, id, "customer:read"); }
    public boolean canReadBranch(UUID id) { return canRead(ResourceKind.BRANCH, id, "branch:read"); }
    public boolean canReadOrder(UUID id) { return canRead(ResourceKind.ORDER, id, "order:read"); }

    private boolean canRead(ResourceKind kind, UUID id, String permission) {
        ResourceOwner owner = id == null ? null : repository.findResource(kind, id);
        return decision(permission, id, allowed(owner, permission, false));
    }

    public boolean canCreateOrder(UUID customerId, UUID branchId) {
        ResourceOwner customer = customerId == null ? null : repository.findResource(ResourceKind.CUSTOMER, customerId);
        ResourceOwner branch = branchId == null ? null : repository.findResource(ResourceKind.BRANCH, branchId);
        boolean sameCustomer = customer != null && branch != null
                && customer.companyId().equals(branch.companyId()) && customerId.equals(branch.customerId());
        return decision("order:create", branchId, sameCustomer && allowed(branch, "order:create", true));
    }

    public void requireCreateOrder(UUID customerId, UUID branchId) {
        if (!canCreateOrder(customerId, branchId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access is denied.");
        }
    }

    private boolean allowed(ResourceOwner owner, String permission, boolean formalOrder) {
        VerifiedUser user = currentUser();
        UUID company = headerId("X-Company-Id");
        if (user == null || owner == null || !owner.companyId().equals(company)) return false;
        CompanyAccess member = user.access().companies().stream()
                .filter(candidate -> candidate.companyId().equals(company)).findFirst().orElse(null);
        if (member == null || !member.permissions().contains(permission)) return false;
        // Kind is an explicit server-managed eligibility attribute, independent of role names.
        if (formalOrder && (user.realm() != Realm.STAFF || member.memberKind() != MemberKind.MANAGEMENT)) return false;
        UUID portalGrant = user.realm() == Realm.CUSTOMER ? headerId("X-Portal-Grant-Id") : null;
        return member.grants().stream().anyMatch(grant -> {
            if (user.realm() == Realm.CUSTOMER
                    && (!grant.id().equals(portalGrant) || grant.scope() == Scope.COMPANY)) return false;
            if (grant.scope() == Scope.COMPANY) return true;
            if (!owner.customerId().equals(grant.customerId())) return false;
            if (grant.scope() == Scope.CUSTOMER) return true;
            // A branch grant permits its parent customer summary, never another branch's contents.
            return owner.branchId() == null || grant.branchIds().contains(owner.branchId());
        });
    }

    private boolean decision(String action, UUID resource, boolean allowed) {
        audit.record(request(), action, headerId("X-Company-Id"), resource, allowed ? "ALLOW" : "DENY");
        return allowed;
    }

    static VerifiedUser currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof VerifiedUser user ? user : null;
    }

    private static UUID headerId(String name) {
        String value = request().getHeader(name);
        try { return value == null ? null : UUID.fromString(value); }
        catch (IllegalArgumentException ignored) { return null; }
    }

    private static HttpServletRequest request() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}
