package au.com.htt.backend;

import java.util.List;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class SalesRead {
    private final JdbcClient jdbc;

    SalesRead(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    List<Map<String, Object>> list(StaffScope.CompanyAccess scope, int offset, int size, boolean quote) {
        String query = quote ? """
                SELECT x.id,d.number,d.version,x.status,x.customer_id AS "customerId",
                    x.customer_branch_id AS "customerBranchId",x.warehouse_id AS "warehouseId",
                    x.expires_on::text AS "expiresOn",x.gross::text AS gross
                FROM sales.quotes x
                """ : """
                SELECT x.id,d.number,d.version,d.state,x.source_quote_id AS "sourceQuoteId",
                    x.order_origin AS "orderOrigin",x.customer_id AS "customerId",
                    x.warehouse_id AS "warehouseId",x.gross::text AS gross
                FROM sales.orders x
                """;
        return customerScope(query + """
                JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=x.company_id AND d.id=x.id
                WHERE x.company_id=:company AND (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments ca
                    WHERE ca.company_id=x.company_id AND ca.customer_id=x.customer_id AND ca.membership_id=:membership))
                ORDER BY x.created_at DESC,x.id LIMIT :size OFFSET :offset
                """, scope).param("offset", offset).param("size", size).query().listOfRows();
    }

    String document(StaffScope.CompanyAccess scope, UUID id, boolean quote) {
        if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id", id).query(Boolean.class).single()) {
            throw new StaffScope.Failure(404, "not_found", "Document is unavailable in this scope.");
        }
        String query = quote ? """
                SELECT jsonb_build_object(
                    'id',x.id,'number',d.number,'status',x.status,'version',d.version,'customerId',x.customer_id,
                    'customerBranchId',x.customer_branch_id,'warehouseId',x.warehouse_id,'expiresOn',x.expires_on,
                    'notes',x.notes,'customer',x.customer_snapshot,'net',x.net::text,'tax',x.tax::text,
                    'gross',x.gross::text,'pricingAt',(to_json(x.pricing_at AT TIME ZONE 'UTC') #>> '{}')||'Z',
                    'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',l.id,'lineNo',dl.line_no,'snapshot',l.snapshot,'net',l.net::text,'tax',l.tax::text,
                        'gross',l.gross::text) ORDER BY dl.line_no)
                        FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id
                        WHERE l.company_id=x.company_id AND l.quote_id=x.id),'[]'::jsonb))::text
                FROM sales.quotes x
                """ : """
                SELECT jsonb_build_object(
                    'id',x.id,'number',d.number,'version',d.version,'state',d.state,'sourceQuoteId',x.source_quote_id,
                    'orderOrigin',x.order_origin,'creationReason',x.creation_reason,'notes',x.notes,
                    'pricingAt',(to_json(x.pricing_at AT TIME ZONE 'UTC') #>> '{}')||'Z',
                    'customerId',x.customer_id,'warehouseId',x.warehouse_id,'customer',x.customer_snapshot,
                    'net',x.net::text,'tax',x.tax::text,'gross',x.gross::text,'cancelReason',x.cancel_reason,
                    'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',l.id,'lineNo',dl.line_no,'productId',l.product_id,'productUnitId',l.product_unit_id,
                        'quantity',l.quantity::text,'baseQuantity',l.base_quantity::text,'unitPrice',l.unit_price::text,
                        'net',l.net::text,'tax',l.tax::text,'gross',l.gross::text,'snapshot',l.snapshot) ORDER BY dl.line_no)
                        FROM sales.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id
                        WHERE l.company_id=x.company_id AND l.order_id=x.id),'[]'::jsonb))::text
                FROM sales.orders x
                """;
        return customerScope(query + """
                JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id
                WHERE x.company_id=:company AND x.id=:id AND (:allCustomers OR EXISTS(
                    SELECT 1 FROM identity.customer_assignments a
                    WHERE a.company_id=x.company_id AND a.customer_id=x.customer_id AND a.membership_id=:membership))
                """, scope).param("id", id).query(String.class).optional()
                .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
    }

    Map<String, Object> credit(StaffScope.CompanyAccess scope, UUID id) {
        var rows = customerScope("""
                SELECT c.id AS "customerId",'AUD'::text AS currency,c.status,c.credit_limit::text AS "creditLimit",
                    e.receivable::text,e.unbilled_orders::text AS "unbilledOrders",
                    e.available_advances::text AS "availableAdvances",
                    GREATEST(0,e.receivable+e.unbilled_orders-e.available_advances)::text AS exposure,
                    (c.credit_limit-GREATEST(0,e.receivable+e.unbilled_orders-e.available_advances))::text AS "availableCredit"
                FROM crm.customers c JOIN crm.customer_credit_exposures e ON e.company_id=c.company_id AND e.customer_id=c.id
                WHERE c.company_id=:company AND c.id=:id AND (:allCustomers OR EXISTS(
                    SELECT 1 FROM identity.customer_assignments a
                    WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))
                """, scope).param("id", id).query().listOfRows();
        if (rows.isEmpty()) {
            throw new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
        }
        return rows.getFirst();
    }

    Availability availability(StaffScope.CompanyAccess scope, UUID warehouse, UUID product,
            int page, int size, int offset) {
        var storage = jdbc.sql("""
                SELECT w.kind,w.active FROM catalog.warehouses w WHERE w.company_id=:company AND w.id=:warehouse
                AND (:allWarehouses OR EXISTS(SELECT 1 FROM identity.warehouse_scopes s
                    WHERE s.company_id=w.company_id AND s.warehouse_id=w.id AND s.membership_id=:membership))
                """).param("company", scope.companyId()).param("warehouse", warehouse)
                .param("allWarehouses", List.of(scope.permissions()).contains("warehouses.all"))
                .param("membership", scope.membershipId())
                .query((row, index) -> new Warehouse(row.getString(1), row.getBoolean(2))).optional()
                .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
        var items = jdbc.sql("""
                SELECT b.product_id AS "productId",p.sku,bu.code AS "baseUnitCode",
                    b.on_hand::text AS "onHand",b.reserved::text AS reserved,
                    (CASE WHEN :sellable AND p.status='ACTIVE' AND p.sell_enabled AND p.item_type='STOCK'
                     THEN b.on_hand-b.reserved ELSE 0 END)::text AS available
                FROM inventory.stock_balances b JOIN catalog.products p ON p.company_id=b.company_id AND p.id=b.product_id
                JOIN catalog.uoms bu ON bu.company_id=p.company_id AND bu.id=p.base_uom_id
                WHERE b.company_id=:company AND b.warehouse_id=:warehouse
                    AND (CAST(:product AS uuid) IS NULL OR b.product_id=CAST(:product AS uuid))
                ORDER BY p.sku,b.id LIMIT :size OFFSET :offset
                """).param("sellable", storage.active() && "SELLABLE".equals(storage.kind()))
                .param("company", scope.companyId()).param("warehouse", warehouse).param("product", product)
                .param("size", size).param("offset", offset).query().listOfRows();
        return new Availability(warehouse, storage.kind(), items, page, size, OffsetDateTime.now(ZoneOffset.UTC));
    }

    record Availability(UUID warehouseId, String warehouseKind, List<Map<String, Object>> items,
            int page, int pageSize, OffsetDateTime dataAsOf) {}
    private record Warehouse(String kind, boolean active) {}

    private JdbcClient.StatementSpec customerScope(String sql, StaffScope.CompanyAccess scope) {
        return jdbc.sql(sql).param("company", scope.companyId()).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"));
    }

    static int offset(int page, int size) {
        if (page < 1 || page > 100000 || size < 1 || size > 100) {
            throw new BranchQuery.InvalidFilter("page", "page must be 1..100000 and pageSize 1..100.");
        }
        return (page - 1) * size;
    }
}
