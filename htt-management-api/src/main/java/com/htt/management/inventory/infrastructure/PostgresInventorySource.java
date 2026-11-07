package com.htt.management.inventory.infrastructure;

import com.htt.management.inventory.contract.InventoryAvailability;
import com.htt.management.inventory.contract.InventorySource;
import java.time.Clock;
import java.util.Objects;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Shared authoritative read. Caller must establish verified actor/company and exact warehouse scope in a transaction. */
public final class PostgresInventorySource implements InventorySource {
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public PostgresInventorySource(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = Objects.requireNonNull(jdbc);
        this.clock = Objects.requireNonNull(clock);
    }

    @Override
    public InventoryAvailability read(Query query) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("Inventory reads require an authorized transaction context.");
        }
        var rows = jdbc.query(connection -> {
            var statement = connection.prepareStatement("""
                    select w.id, u.code, s.available, s.updated_at
                    from inventory.warehouse w
                    join catalog.product p on p.company_id=w.company_id and p.id=? and p.status='ACTIVE'
                    join catalog.unit_of_measure u on u.company_id=p.company_id and u.id=p.base_unit_id and u.status='ACTIVE'
                    left join inventory.stock_balance s on s.company_id=w.company_id and s.product_id=p.id and s.warehouse_id=w.id
                    where w.company_id=? and w.id=any(?) and w.status='ACTIVE'
                    order by w.id
                    """);
            statement.setObject(1, query.productId());
            statement.setObject(2, query.companyId());
            statement.setArray(3, connection.createArrayOf("uuid", query.warehouseIds().toArray()));
            return statement;
        }, (row, number) -> {
            var quantity = row.getBigDecimal("available");
            var time = row.getTimestamp("updated_at");
            return new InventoryAvailability.WarehouseStock(row.getObject("id", UUID.class),
                    quantity == null ? InventoryAvailability.Knowledge.UNKNOWN : InventoryAvailability.Knowledge.KNOWN,
                    quantity, row.getString("code"), time == null ? null : time.toInstant());
        });
        // Do not return a partial total for a foreign, disabled or invisible product/warehouse.
        if (rows.size() != query.warehouseIds().size()) throw new AccessDeniedException("Inventory scope is not available.");
        return new InventoryAvailability(query.companyId(), query.productId(), rows, clock.instant());
    }
}
