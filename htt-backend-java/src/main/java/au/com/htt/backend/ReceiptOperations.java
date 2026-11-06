package au.com.htt.backend;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class ReceiptOperations {
    private static final UUID EMPTY = new UUID(0, 0);
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("999999999999999999.99");
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    ReceiptOperations(JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    IdempotentWrite.StoredResponse post(StaffScope.CompanyAccess scope, UUID customer, Input input,
            String key, String requestId) {
        requireCustomer(scope, customer);
        var allocations = input.allocations() == null ? List.<Allocation>of() : input.allocations();
        require(allocations.size() <= 50 && allocations.stream().allMatch(a -> a != null && validId(a.invoiceLineId()))
                && allocations.stream().map(Allocation::invoiceLineId).distinct().count() == allocations.size(),
                "allocations", "Supply up to 50 distinct invoice lines.");
        var advances = input.advances() == null ? List.<Advance>of() : input.advances();
        BigDecimal split = BigDecimal.ZERO;
        for (var allocation : allocations) {
            split = split.add(amount(allocation.amount(), "Allocation must be positive."));
        }
        require(advances.size() <= 50 && advances.stream().allMatch(a -> a != null && validId(a.orderLineId()))
                && advances.stream().map(Advance::orderLineId).distinct().count() == advances.size(),
                "advances", "Supply up to 50 distinct order lines.");
        for (var advance : advances) {
            split = split.add(amount(advance.amount(), "Advance must be positive."));
        }
        var total = amount(input.amount(), "Receipt must equal allocations plus advances.");
        require(total.compareTo(split) == 0, "amount", "Receipt must equal allocations plus advances.");
        require(input.method() != null && List.of("BANK_TRANSFER", "CARD", "CASH").contains(input.method()),
                "method", "Invalid method.");
        String reference = input.reference() == null ? "" : input.reference().strip();
        require(!reference.isEmpty() && reference.length() <= 200, "reference", "reference must contain 1..200 characters.");
        UUID bank = input.bankAccountId();
        if (bank != null) {
            require(validId(bank), "bankAccountId", "A company cash account ID is required.");
            if (!List.of(scope.permissions()).contains("accounting.banks.use")) {
                throw new StaffScope.Failure(403, "permission_denied", "Cash-account selection permission required.");
            }
        }

        String allocationJson = allocations.stream().sorted(Comparator.comparing(a -> a.invoiceLineId().toString()))
                .map(a -> splitLine("invoiceLineId", a.invoiceLineId(), a.amount()))
                .collect(Collectors.joining(",", "[", "]"));
        String advanceJson = advances.stream().sorted(Comparator.comparing(a -> a.orderLineId().toString()))
                .map(a -> splitLine("orderLineId", a.orderLineId(), a.amount()))
                .collect(Collectors.joining(",", "[", "]"));
        String canonical = "{\"amount\":\"" + total.toPlainString() + "\",\"method\":\"" + input.method()
                + "\",\"reference\":" + CollaborationCreate.legacyString(reference) + ",\"receivedOn\":"
                + (input.receivedOn() == null ? "null" : "\"" + input.receivedOn() + "\"")
                + ",\"allocations\":" + allocationJson + ",\"advances\":" + advanceJson
                + (bank == null ? "" : ",\"bankAccountId\":\"" + bank + "\"") + "}";
        return writes.execute(scope, "POST /customers/" + customer + "/receipts", key, canonical, () -> {
            String args = ":customer,:amount,:method,:reference,CAST(:date AS date),"
                    + "CAST(:allocations AS jsonb),CAST(:advances AS jsonb)";
            var statement = jdbc.sql(bank == null
                    ? "SELECT accounting.post_receipt(" + args + ")"
                    : "SELECT accounting.post_receipt_to_bank(" + args + ",:bank)")
                    .param("customer", customer).param("amount", total).param("method", input.method())
                    .param("reference", reference).param("date", input.receivedOn())
                    .param("allocations", allocationJson).param("advances", advanceJson);
            if (bank != null) {
                statement.param("bank", bank);
            }
            UUID id = statement.query(UUID.class).single();
            audit.record(scope, "accounting.customer_received", "customer_receipt", id, requestId,
                    Map.of("customerId", customer, "Amount", total, "reference", reference));
            return new IdempotentWrite.StoredResponse(201, view(scope, id));
        });
    }

    record ApplicationInput(String reference, List<Allocation> allocations) {}

    IdempotentWrite.StoredResponse apply(StaffScope.CompanyAccess scope, UUID advance,
            ApplicationInput input, String key, String requestId) {
        requireAdvance(scope, advance);
        var allocations = input.allocations();
        require(allocations != null && !allocations.isEmpty() && allocations.size() <= 50
                && allocations.stream().allMatch(a -> a != null && validId(a.invoiceLineId()))
                && allocations.stream().map(Allocation::invoiceLineId).distinct().count() == allocations.size(),
                "allocations", "Supply up to 50 distinct invoice lines.");
        for (var allocation : allocations) {
            amount(allocation.amount(), "Allocation must be positive.");
        }
        String reference = input.reference() == null ? "" : input.reference().strip();
        require(!reference.isEmpty() && reference.length() <= 200, "reference", "reference must contain 1..200 characters.");
        String lines = allocations.stream().sorted(Comparator.comparing(a -> a.invoiceLineId().toString()))
                .map(a -> splitLine("invoiceLineId", a.invoiceLineId(), a.amount()))
                .collect(Collectors.joining(",", "[", "]"));
        String canonical = "{\"reference\":" + CollaborationCreate.legacyString(reference)
                + ",\"allocations\":" + lines + "}";
        return writes.execute(scope, "POST /customer-advances/" + advance + "/apply", key, canonical, () -> {
            UUID id = jdbc.sql("SELECT accounting.apply_advance(:advance,:reference,CAST(:lines AS jsonb))")
                    .param("advance",advance).param("reference",reference).param("lines",lines).query(UUID.class).single();
            audit.record(scope,"accounting.advance_applied","advance_application",id,requestId,
                    Map.of("advanceId",advance,"reference",reference));
            return new IdempotentWrite.StoredResponse(201,applicationView(scope,id));
        });
    }

    private void requireAdvance(StaffScope.CompanyAccess scope, UUID id) {
        UUID customer = jdbc.sql("""
                SELECT r.customer_id FROM accounting.customer_advances a
                JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id
                WHERE a.company_id=:company AND a.id=:id
                """).param("company",scope.companyId()).param("id",id).query(UUID.class)
                .optional().orElseThrow(ReceiptOperations::unavailable);
        requireCustomer(scope,customer);
    }

    String applicationView(StaffScope.CompanyAccess scope, UUID id) {
        UUID advance = jdbc.sql("SELECT advance_id FROM accounting.advance_applications WHERE company_id=:company AND id=:id")
                .param("company",scope.companyId()).param("id",id).query(UUID.class)
                .optional().orElseThrow(ReceiptOperations::unavailable);
        requireAdvance(scope,advance);
        return jdbc.sql("""
                SELECT jsonb_build_object('id',a.id,'number',d.number,'state',d.state,'version',d.version,
                    'applicationStatus',CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END,
                    'unapplicationId',u.id,'advanceId',a.advance_id,'amount',a.amount::text,'reference',a.reference,
                    'allocations',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'invoiceLineId',p.invoice_line_id,'amount',p.amount::text,'gstAmount',p.gst_amount::text,
                        'receiptId',p.receipt_id,'advanceId',p.advance_id) ORDER BY p.invoice_line_id)
                        FROM accounting.payment_allocations p WHERE p.company_id=a.company_id AND p.source_document_id=a.id),'[]'::jsonb))::text
                FROM accounting.advance_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id
                LEFT JOIN accounting.advance_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id
                WHERE a.company_id=:company AND a.id=:id
                """).param("company",scope.companyId()).param("id",id).query(String.class).single();
    }

    private static String splitLine(String field, UUID id, BigDecimal amount) {
        return "{\"" + field + "\":\"" + id + "\",\"amount\":\"" + amount.toPlainString() + "\"}";
    }

    static BigDecimal amount(BigDecimal value, String positiveMessage) {
        var amount = value == null ? BigDecimal.ZERO : value;
        require(amount.signum() >= 0 && amount.compareTo(MAX_AMOUNT) <= 0 && amount.stripTrailingZeros().scale() <= 2,
                "amount", "amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
        require(amount.signum() > 0, "amount", positiveMessage);
        return amount;
    }

    private static boolean validId(UUID id) {
        return id != null && !EMPTY.equals(id);
    }

    private static void require(boolean condition, String field, String message) {
        if (!condition) {
            throw new BranchQuery.InvalidFilter(field, message);
        }
    }

    record Input(BigDecimal amount, String method, String reference, List<Allocation> allocations,
            List<Advance> advances, LocalDate receivedOn, UUID bankAccountId) {}
    record Allocation(UUID invoiceLineId, BigDecimal amount) {}
    record Advance(UUID orderLineId, BigDecimal amount) {}

    List<Map<String, Object>> list(StaffScope.CompanyAccess scope, UUID customer, int page, int size) {
        requireCustomer(scope, customer);
        return jdbc.sql("""
                SELECT r.id,d.number,r.received_on::text AS "receivedOn",r.method,r.reference,
                    r.amount::text,r.allocated_amount::text AS "allocatedAmount",r.advance_amount::text AS "advanceAmount",
                    CASE WHEN EXISTS(SELECT 1 FROM accounting.receipt_reversals x
                        WHERE x.company_id=r.company_id AND x.receipt_id=r.id)
                      THEN 'REVERSED' ELSE 'ACTIVE' END AS "settlementStatus"
                FROM accounting.customer_receipts r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                WHERE r.company_id=:company AND r.customer_id=:id ORDER BY r.created_at DESC,r.id LIMIT :size OFFSET :offset
                """).param("company", scope.companyId()).param("id", customer)
                .param("size", size).param("offset", SalesRead.offset(page, size)).query().listOfRows();
    }

    String view(StaffScope.CompanyAccess scope, UUID id) {
        return jdbc.sql("""
                SELECT jsonb_build_object(
                    'id',r.id,'number',d.number,'state',d.state,'version',d.version,'customerId',r.customer_id,
                    'bankAccountId',r.bank_account_id,'receivedOn',r.received_on,'method',r.method,'reference',r.reference,
                    'amount',r.amount::text,'allocatedAmount',r.allocated_amount::text,'advanceAmount',r.advance_amount::text,
                    'settlementStatus',CASE WHEN x.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END,
                    'reversalId',x.id,'originalReceiptId',p.original_receipt_id,
                    'allocations',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'invoiceLineId',a.invoice_line_id,'amount',a.amount::text,'gstAmount',a.gst_amount::text,
                        'receiptId',a.receipt_id,'advanceId',a.advance_id) ORDER BY a.invoice_line_id)
                        FROM accounting.payment_allocations a WHERE a.company_id=r.company_id AND a.source_document_id=r.id),'[]'::jsonb),
                    'advances',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',a.id,'orderLineId',a.order_line_id,'amount',a.amount::text,'gstAmount',a.gst_amount::text,
                        'gstBasis',a.gst_basis) ORDER BY a.id)
                        FROM accounting.customer_advances a WHERE a.company_id=r.company_id AND a.receipt_id=r.id),'[]'::jsonb))::text
                FROM accounting.customer_receipts r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                LEFT JOIN accounting.receipt_reversals x ON x.company_id=r.company_id AND x.receipt_id=r.id
                LEFT JOIN accounting.receipt_reapplications p ON p.company_id=r.company_id AND p.id=r.id
                WHERE r.company_id=:company AND r.id=:id
                    AND (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                       WHERE a.company_id=r.company_id AND a.customer_id=r.customer_id AND a.membership_id=:membership))
                """).param("company", scope.companyId()).param("id", id).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                .query(String.class).optional().orElseThrow(ReceiptOperations::unavailable);
    }

    Receivables receivables(StaffScope.CompanyAccess scope, UUID customer, int page, int size) {
        requireCustomer(scope, customer);
        int offset = SalesRead.offset(page, size);
        var totals = jdbc.sql("""
                SELECT receivable::text,unbilled_orders::text,available_advances::text
                FROM crm.customer_credit_exposures WHERE company_id=:company AND customer_id=:id
                """).param("company", scope.companyId()).param("id", customer)
                .query((row, index) -> new Totals(row.getString(1), row.getString(2), row.getString(3)))
                .optional().orElseThrow(ReceiptOperations::unavailable);
        var items = jdbc.sql("""
                SELECT r.id,r.invoice_id AS "invoiceId",d.number,i.invoice_date::text AS "invoiceDate",
                 r.due_on::text AS "dueOn",r.amount::text,r.journal_entry_id AS "journalEntryId",
                 coalesce((SELECT sum(p.amount) FROM accounting.active_payment_allocations p JOIN sales.invoice_lines il
                     ON il.company_id=p.company_id AND il.id=p.invoice_line_id
                     WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0)::text AS paid,
                 coalesce((SELECT sum(cl.gross) FROM sales.credit_note_lines cl JOIN sales.invoice_lines il
                     ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id
                     WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0)::text AS credited,
                 coalesce((SELECT sum(rf.amount) FROM accounting.active_customer_refunds rf JOIN sales.credit_note_lines cl
                     ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id JOIN sales.invoice_lines il
                     ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id
                     WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0)::text AS refunded,
                 coalesce((SELECT sum(outstanding_amount) FROM sales.invoice_line_balances
                     WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0)::text AS outstanding,
                 coalesce((SELECT sum(refundable_amount) FROM sales.invoice_line_balances
                     WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0)::text AS "creditBalance",
                 coalesce((SELECT sum(credit_received_amount) FROM sales.invoice_line_balances
                     WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0)::text AS "creditReceived",
                 coalesce((SELECT sum(credit_used_amount) FROM sales.invoice_line_balances
                     WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0)::text AS "creditUsed"
                FROM accounting.receivable_items r JOIN sales.invoices i ON i.company_id=r.company_id AND i.id=r.invoice_id
                JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id
                WHERE r.company_id=:company AND r.customer_id=:id ORDER BY r.due_on,r.id LIMIT :size OFFSET :offset
                """).param("company", scope.companyId()).param("id", customer)
                .param("size", size).param("offset", offset).query().listOfRows();
        return new Receivables(customer, "AUD", totals.receivable(), totals.unbilledOrders(), totals.availableAdvances(),
                items, page, size);
    }

    record Receivables(UUID customerId, String currency, String receivable, String unbilledOrders,
            String availableAdvances, List<Map<String, Object>> items, int page, int pageSize) {}
    private record Totals(String receivable, String unbilledOrders, String availableAdvances) {}

    void requireCustomer(StaffScope.CompanyAccess scope, UUID customer) {
        jdbc.sql("""
                SELECT c.id FROM crm.customers c WHERE c.company_id=:company AND c.id=:id
                AND (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                    WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))
                """).param("company", scope.companyId()).param("id", customer).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                .query(UUID.class).optional().orElseThrow(ReceiptOperations::unavailable);
    }

    private static StaffScope.Failure unavailable() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }
}
