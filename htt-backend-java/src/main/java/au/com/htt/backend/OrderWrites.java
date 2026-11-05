package au.com.htt.backend;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class OrderWrites {
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    OrderWrites(JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    IdempotentWrite.StoredResponse cancel(StaffScope.CompanyAccess scope, UUID id, Review input,
            String ifMatch, String key, String requestId) {
        if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id", id).query(Boolean.class).single()) {
            throw new StaffScope.Failure(404, "not_found", "Document is unavailable in this scope.");
        }
        long expected = version(ifMatch);
        String reason = input.reason() == null ? "" : input.reason().strip();
        if (reason.isEmpty() || reason.length() > 2000) {
            throw new BranchQuery.InvalidFilter("reason", "reason must contain 1..2000 characters.");
        }
        order(scope, id, false);
        String canonical = "{\"expected\":" + expected + ",\"reason\":" + CollaborationCreate.legacyString(reason) + "}";
        return writes.execute(scope, "POST /sales-orders/" + id + "/cancel", key, canonical, () -> {
            var order = order(scope, id, true);
            if (order.version() != expected) {
                throw conflict("version_conflict", "Document changed; refresh before retrying.");
            }
            if (!"CONFIRMED".equals(order.state())) {
                throw conflict("order_not_confirmed", "Only unfulfilled confirmed orders can be cancelled.");
            }
            boolean invoiced = scoped("""
                    SELECT EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=:company AND order_id=:id)
                    """, scope).param("id", id).query(Boolean.class).single();
            if (invoiced) {
                throw conflict("order_already_invoiced", "Invoiced orders require a credit-note workflow.");
            }
            scoped("SELECT id FROM crm.customers WHERE company_id=:company AND id=:id FOR UPDATE", scope)
                    .param("id", order.customer()).query(UUID.class).optional().orElseThrow(OrderWrites::notFound);
            jdbc.sql("SELECT id FROM sales.lock_credit(:id)").param("id", order.customer())
                    .query(UUID.class).optional().orElseThrow(OrderWrites::notFound);
            var reservations = scoped("""
                    SELECT r.id,r.consumed_quantity,b.product_id FROM inventory.stock_reservations r
                    JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id
                    JOIN inventory.stock_balances b ON b.company_id=r.company_id AND b.id=r.stock_balance_id
                    WHERE r.company_id=:company AND l.order_id=:id ORDER BY b.product_id,r.id
                    """, scope).param("id", id).query((row, index) -> new Reservation(
                    row.getObject(1, UUID.class), row.getBigDecimal(2).signum() > 0, row.getObject(3, UUID.class))).list();
            if (reservations.stream().anyMatch(Reservation::consumed)) {
                throw conflict("order_already_fulfilled", "Delivered stock requires a return workflow, not cancellation.");
            }
            var products = reservations.stream().map(Reservation::product).distinct()
                    .sorted(Comparator.comparing(UUID::toString)).toList();
            for (UUID product : products) {
                jdbc.sql("SELECT id FROM inventory.lock_balance(:warehouse,:product)")
                        .param("warehouse", order.warehouse()).param("product", product).query(UUID.class).list();
            }
            for (var reservation : reservations) {
                scoped("""
                        UPDATE inventory.stock_reservations SET released_quantity=quantity
                        WHERE company_id=:company AND id=:id
                        """, scope).param("id", reservation.id()).update();
            }
            scoped("""
                    UPDATE sales.credit_commitments SET released_amount=amount
                    WHERE company_id=:company AND order_id=:id
                    """, scope).param("id", id).update();
            scoped("""
                    UPDATE sales.orders SET cancelled_at=now(),cancel_reason=:reason
                    WHERE company_id=:company AND id=:id
                    """, scope).param("id", id).param("reason", reason).update();
            long version = scoped("""
                    UPDATE platform.documents SET state='CANCELLED'
                    WHERE company_id=:company AND id=:id RETURNING version
                    """, scope).param("id", id).query(Long.class).single();
            audit.record(scope, "sales.order_cancelled", "sales_order", id, requestId,
                    Map.of("reason", reason, "version", version));
            return new IdempotentWrite.StoredResponse(200, "{\"orderId\":\"" + id
                    + "\",\"state\":\"CANCELLED\",\"version\":" + version + "}");
        });
    }

    private Order order(StaffScope.CompanyAccess scope, UUID id, boolean lock) {
        return scoped("""
                SELECT d.state,d.version,o.customer_id,o.warehouse_id
                FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id
                WHERE o.company_id=:company AND o.id=:id AND (:allCustomers OR EXISTS(
                    SELECT 1 FROM identity.customer_assignments a
                    WHERE a.company_id=o.company_id AND a.customer_id=o.customer_id AND a.membership_id=:membership))
                """ + (lock ? " FOR UPDATE OF d" : ""), scope)
                .param("id", id).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                .query((row, index) -> new Order(row.getString(1), row.getLong(2),
                        row.getObject(3, UUID.class), row.getObject(4, UUID.class)))
                .optional().orElseThrow(OrderWrites::notFound);
    }

    private JdbcClient.StatementSpec scoped(String sql, StaffScope.CompanyAccess scope) {
        return jdbc.sql(sql).param("company", scope.companyId());
    }

    static long version(String header) {
        String value = header == null ? "" : header.replaceAll("^\"+|\"+$", "");
        try {
            if (value.matches("[0-9]+")) {
                long version = Long.parseLong(value);
                if (version > 0) {
                    return version;
                }
            }
        } catch (NumberFormatException invalid) {
            // Overflow uses the same precondition response as a missing version.
        }
        throw new StaffScope.Failure(428, "version_required", "Supply If-Match with the current document version.");
    }

    private static StaffScope.Failure conflict(String code, String message) {
        return new StaffScope.Failure(409, code, message);
    }

    private static StaffScope.Failure notFound() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }

    record Review(String reason) {}
    private record Order(String state, long version, UUID customer, UUID warehouse) {}
    private record Reservation(UUID id, boolean consumed, UUID product) {}
}
