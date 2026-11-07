package com.htt.management.inventory.infrastructure;

import com.htt.management.inventory.contract.InventoryAvailability;
import com.htt.management.inventory.contract.InventorySource;
import java.time.Clock;
import java.util.Objects;

/** Explicit fallback until a source is selected. No sample data, external calls or automatic Spring binding. */
public final class UnavailableInventorySource implements InventorySource {
    private final Clock clock;

    public UnavailableInventorySource(Clock clock) {
        this.clock = Objects.requireNonNull(clock);
    }

    @Override
    public InventoryAvailability read(Query query) {
        Objects.requireNonNull(query);
        var warehouses = query.warehouseIds().stream().sorted().map(id ->
                new InventoryAvailability.WarehouseStock(id,
                        InventoryAvailability.Knowledge.SOURCE_UNAVAILABLE, null, null, null)).toList();
        return new InventoryAvailability(query.companyId(), query.productId(), warehouses, clock.instant());
    }
}
