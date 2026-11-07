package com.htt.management.crm.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Read projection preserving portal.branches' existing JSON field names. */
public record CustomerBranches(UUID customerId, UUID grantId, List<Branch> items, Instant dataAsOf) {
    public CustomerBranches { items = List.copyOf(items); }

    public record Branch(UUID id, String code, String name, String addressLine1,
            String suburb, String state, String postcode, String country) { }
}
