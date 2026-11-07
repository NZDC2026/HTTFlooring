package com.htt.management.inventory.contract;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Internal provider port. Call only after action, company, product, customer/branch and warehouse checks.
 * This is not an authenticated application service and must never be injected directly into a controller.
 */
public interface InventorySource {
    InventoryAvailability read(Query query);

    record Query(UUID companyId, UUID productId, Set<UUID> warehouseIds) {
        public Query {
            Objects.requireNonNull(companyId);
            Objects.requireNonNull(productId);
            warehouseIds = Set.copyOf(warehouseIds);
            if (warehouseIds.isEmpty()) throw new IllegalArgumentException("Expected an authorized warehouse scope.");
        }
    }
}
