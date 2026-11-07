package com.htt.management.identity.contract;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** Server-resolved ownership and explicit branch IDs for one customer's selected grant. */
public record CustomerBranchScope(UUID actorId, UUID companyId, UUID grantId, UUID customerId, Set<UUID> branchIds) {
    public CustomerBranchScope {
        Objects.requireNonNull(actorId);
        Objects.requireNonNull(companyId);
        Objects.requireNonNull(grantId);
        Objects.requireNonNull(customerId);
        branchIds = Set.copyOf(branchIds);
    }
}
