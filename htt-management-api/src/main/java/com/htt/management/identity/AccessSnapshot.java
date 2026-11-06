package com.htt.management.identity;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Server-owned access state, reloaded for every authenticated request. */
public record AccessSnapshot(UUID actorId, String displayName, Instant tokensValidAfter,
        List<CompanyAccess> companies) {
    public AccessSnapshot {
        companies = List.copyOf(companies);
    }

    public enum Realm { STAFF, CUSTOMER }
    public enum MemberKind { UNCLASSIFIED, CUSTOMER, SALES, MANAGEMENT, OPERATIONS }
    public enum Scope { COMPANY, CUSTOMER, BRANCH }
    public enum ResourceKind { CUSTOMER, BRANCH, ORDER }

    public record CompanyAccess(UUID companyId, String companyName, UUID membershipId,
            MemberKind memberKind, Set<String> roles, Set<String> permissions, List<Grant> grants) {
        public CompanyAccess {
            roles = Set.copyOf(roles);
            permissions = Set.copyOf(permissions);
            grants = List.copyOf(grants);
        }
    }

    public record Grant(UUID id, long version, Scope scope, UUID customerId,
            String customerCode, String customerName, Set<UUID> branchIds) {
        public Grant { branchIds = Set.copyOf(branchIds); }
    }

    /** Ownership is loaded from storage, never inferred from a request body. */
    public record ResourceOwner(UUID companyId, UUID customerId, UUID branchId) {}
}
