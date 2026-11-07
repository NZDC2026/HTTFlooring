package com.htt.management.inventory.contract;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** Source facts, not a promise to reserve or fulfil stock. HTTP adapters must serialize decimals as strings. */
public record InventoryAvailability(UUID companyId, UUID productId, List<WarehouseStock> warehouses,
        Instant observedAt) {
    public InventoryAvailability {
        Objects.requireNonNull(companyId);
        Objects.requireNonNull(productId);
        Objects.requireNonNull(observedAt);
        warehouses = List.copyOf(warehouses);
        if (warehouses.stream().map(WarehouseStock::warehouseId).distinct().count() != warehouses.size()) {
            throw new IllegalArgumentException("Expected distinct warehouses.");
        }
    }

    public enum Knowledge { KNOWN, UNKNOWN, STALE, SOURCE_UNAVAILABLE }

    /** available is supplied by the confirmed authority; no local formula or threshold is inferred. */
    public record WarehouseStock(UUID warehouseId, Knowledge knowledge, BigDecimal available,
            String unitCode, Instant sourceAsOf) {
        public WarehouseStock {
            Objects.requireNonNull(warehouseId);
            Objects.requireNonNull(knowledge);
            if (knowledge == Knowledge.KNOWN || knowledge == Knowledge.STALE) {
                if (available == null || unitCode == null || unitCode.isBlank() || sourceAsOf == null) {
                    throw new IllegalArgumentException("Known or stale stock requires quantity, unit and source time.");
                }
            } else if (available != null) {
                throw new IllegalArgumentException("Unknown or unavailable stock cannot carry a quantity.");
            }
            if (unitCode != null && unitCode.isBlank()) {
                throw new IllegalArgumentException("Unit must be absent or explicit.");
            }
        }
    }
}
