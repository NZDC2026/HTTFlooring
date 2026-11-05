package au.com.htt.backend;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class InvoiceOperations {
    private static final BigDecimal MAX_QUANTITY = new BigDecimal("99999999999999.999999");
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    InvoiceOperations(JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    String read(StaffScope.CompanyAccess scope, UUID id) {
        documentVisible(id);
        return view(scope, id);
    }

    IdempotentWrite.StoredResponse issue(StaffScope.CompanyAccess scope, UUID order, Input input, String ifMatch,
            String key, String requestId) {
        documentVisible(order);
        long expected = OrderWrites.version(ifMatch);
        String reference = input.fulfilmentReference() == null ? "" : input.fulfilmentReference().strip();
        if (reference.length() > 200) {
            throw new BranchQuery.InvalidFilter("fulfilmentReference", "fulfilmentReference exceeds 200 characters.");
        }
        var lines = input.lines();
        if (lines == null || lines.isEmpty() || lines.size() > 50
                || lines.stream().anyMatch(line -> line == null || line.orderLineId() == null
                        || line.orderLineId().equals(new UUID(0, 0)))
                || lines.stream().map(Line::orderLineId).distinct().count() != lines.size()) {
            throw new StaffScope.Failure(422, "invalid_invoice", "Supply 1..50 distinct nonempty order lines.");
        }
        for (var line : lines) {
            BigDecimal quantity = line.quantity() == null ? BigDecimal.ZERO : line.quantity();
            if (quantity.signum() < 0 || quantity.compareTo(MAX_QUANTITY) > 0 || quantity.stripTrailingZeros().scale() > 6) {
                throw new BranchQuery.InvalidFilter("quantity",
                        "quantity must be nonnegative, within the storage limit, and have at most 6 decimals.");
            }
            if (quantity.signum() == 0) {
                throw new BranchQuery.InvalidFilter("quantity", "Positive invoice quantity is required.");
            }
        }
        scoped("""
                SELECT o.id FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id
                WHERE o.company_id=:company AND o.id=:id AND (:allCustomers OR EXISTS(
                    SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=o.company_id
                      AND a.customer_id=o.customer_id AND a.membership_id=:membership))
                """, scope).param("id", order).query(UUID.class).optional().orElseThrow(InvoiceOperations::unavailable);

        String lineJson = lines.stream().sorted(Comparator.comparing(line -> line.orderLineId().toString()))
                .map(line -> "{\"orderLineId\":\"" + line.orderLineId() + "\",\"quantity\":\""
                        + line.quantity().toPlainString() + "\"}")
                .collect(Collectors.joining(",", "[", "]"));
        String nullableReference = reference.isEmpty() ? null : reference;
        String canonical = "{\"expected\":" + expected + ",\"reference\":"
                + (nullableReference == null ? "null" : CollaborationCreate.legacyString(nullableReference))
                + ",\"lines\":" + lineJson + "}";
        return writes.execute(scope, "POST /sales-orders/" + order + "/invoices", key, canonical, () -> {
            UUID invoice = jdbc.sql("SELECT sales.post_invoice(:order,:version,CAST(:lines AS jsonb),CAST(:reference AS text))")
                    .param("order", order).param("version", expected).param("lines", lineJson)
                    .param("reference", nullableReference).query(UUID.class).single();
            audit.record(scope, "sales.invoice_posted", "sales_invoice", invoice, requestId,
                    Map.of("orderId", order, "sourceOrderVersion", expected));
            return new IdempotentWrite.StoredResponse(201, view(scope, invoice));
        });
    }

    private String view(StaffScope.CompanyAccess scope, UUID id) {
        return scoped("""
                SELECT jsonb_build_object(
                    'id',i.id,'number',d.number,'version',d.version,'state',d.state,'orderId',i.order_id,
                    'customerId',i.customer_id,'title',i.title,'invoiceDate',i.invoice_date,'dueOn',i.due_on,
                    'currency','AUD','issuer',i.issuer_snapshot,'customer',i.customer_snapshot,'gstBasis',i.gst_basis,
                    'fulfilmentReference',i.fulfilment_reference,'net',i.net::text,'tax',i.tax::text,'gross',i.gross::text,
                    'journalEntryId',r.journal_entry_id,
                    'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',l.id,'lineNo',dl.line_no,'orderLineId',l.order_line_id,'quantity',l.quantity::text,
                        'baseQuantity',l.base_quantity::text,'net',l.net::text,'tax',l.tax::text,'gross',l.gross::text,
                        'taxCodeId',l.tax_code_id,'taxRate',l.tax_rate::text,'snapshot',l.snapshot) ORDER BY dl.line_no)
                        FROM sales.invoice_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id
                        WHERE l.company_id=i.company_id AND l.invoice_id=i.id),'[]'::jsonb))::text
                FROM sales.invoices i JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id
                JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id
                WHERE i.company_id=:company AND i.id=:id AND (:allCustomers OR EXISTS(
                    SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=i.company_id
                      AND a.customer_id=i.customer_id AND a.membership_id=:membership))
                """, scope).param("id", id).query(String.class).optional().orElseThrow(InvoiceOperations::unavailable);
    }

    private void documentVisible(UUID id) {
        if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id", id).query(Boolean.class).single()) {
            throw new StaffScope.Failure(404, "not_found", "Document is unavailable in this scope.");
        }
    }

    private JdbcClient.StatementSpec scoped(String sql, StaffScope.CompanyAccess scope) {
        return jdbc.sql(sql).param("company", scope.companyId()).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"));
    }

    private static StaffScope.Failure unavailable() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }

    record Input(List<Line> lines, String fulfilmentReference) {}
    record Line(UUID orderLineId, BigDecimal quantity) {}
}
