package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class SupplierBills {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final LegacyRows rows;
    private final JsonMapper json;

    SupplierBills(StaffScope staff, JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit,
            LegacyRows rows, JsonMapper json) {
        this.staff = staff;
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
        this.rows = rows;
        this.json = json;
    }

    @GetMapping("/api/v1/supplier-bills/{id}")
    Map<String, Object> detail(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.bills.read");
        return staff.inCompany(scope, requestId(request), () -> view(scope, id));
    }

    @GetMapping("/api/v1/supplier-bills")
    StaffIdentityController.Page<Map<String, Object>> list(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(required = false) UUID supplierId, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.bills.read");
        int offset = SalesRead.offset(page, pageSize);
        var items = staff.inCompany(scope, requestId(request), () -> jdbc.sql("""
                SELECT b.id,d.number,d.state,d.version,b.supplier_id,b.supplier_invoice,b.invoice_date::text,
                  b.due_on::text,b.net,b.tax,b.gross,b.recoverable_tax,b.gst_basis,b.bill_type,b.expense_amount
                FROM purchase.bills b JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id
                WHERE b.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR b.supplier_id=CAST(:supplier AS uuid))
                ORDER BY b.created_at DESC,b.id LIMIT :size OFFSET :offset
                """).param("company", scope.companyId()).param("supplier", supplierId)
                .param("size", pageSize).param("offset", offset).query(rows::row).list());
        return new StaffIdentityController.Page<>(items, page, pageSize);
    }

    @GetMapping("/api/v1/accounting/ap")
    Map<String, Object> accountsPayable(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(required = false) UUID supplierId, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.ap.read");
        int offset = SalesRead.offset(page, pageSize);
        return staff.inCompany(scope, requestId(request), () -> {
            var totals = jdbc.sql("""
                    SELECT coalesce(sum(outstanding_amount),0)::text AS amount,
                      coalesce(sum(available_credit),0)::text AS available
                    FROM accounting.ap_balances
                    WHERE company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR supplier_id=CAST(:supplier AS uuid))
                    """).param("company", scope.companyId()).param("supplier", supplierId)
                    .query((row, index) -> Map.of("outstandingAmount", row.getString(1), "availableCredit", row.getString(2))).single();
            var items = jdbc.sql("""
                    SELECT a.id,a.bill_id,d.number,b.supplier_invoice,a.supplier_id,a.party_id,a.amount,a.paid_amount,
                      a.outstanding_amount,a.credited_amount,a.refunded_amount,a.net_paid_amount,a.net_amount,
                      a.available_credit,a.due_on::text,a.account_id,a.journal_entry_id
                    FROM accounting.ap_balances a JOIN purchase.bills b ON b.company_id=a.company_id AND b.id=a.bill_id
                    JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id
                    WHERE a.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR a.supplier_id=CAST(:supplier AS uuid))
                    ORDER BY a.due_on,a.id LIMIT :size OFFSET :offset
                    """).param("company", scope.companyId()).param("supplier", supplierId)
                    .param("size", pageSize).param("offset", offset).query(rows::row).list();
            return Map.of("currency", "AUD", "outstandingAmount", totals.get("outstandingAmount"),
                    "availableCredit", totals.get("availableCredit"), "items", items, "page", page, "pageSize", pageSize);
        });
    }

    @PostMapping("/api/v1/supplier-bills")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @RequestBody Input input) {
        return post(token, request, input, null);
    }

    @PostMapping("/api/v1/supplier-bills/with-variance")
    ResponseEntity<String> variance(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestBody Variance input) {
        return post(token, request, input.bill(), text(input.reason(), "reason", 2000, true));
    }

    private ResponseEntity<String> post(Jwt token, HttpServletRequest request, Input input, String variance) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"),
                variance == null ? "purchase.bills.post" : "purchase.bills.variance.post");
        if (variance != null && (!List.of(scope.permissions()).contains("purchase.bills.post")
                || !List.of(scope.permissions()).contains("purchase.bills.read"))) {
            throw new StaffScope.Failure(403, "permission_denied", "Bill posting and reading required.");
        }
        var result = staff.inCompany(scope, requestId(request), () -> {
            String invoice = text(input.supplierInvoice(), "supplierInvoice", 200, true);
            String evidence = text(input.taxInvoiceReference(), "taxInvoiceReference", 500, false);
            String notes = text(input.notes(), "notes", 2000, false);
            var lines = input.lines();
            require(input.supplierId() != null && !input.supplierId().equals(new UUID(0, 0))
                    && lines != null && !lines.isEmpty() && lines.size() <= 50
                    && lines.stream().allMatch(line -> line != null && line.receiptLineId() != null
                            && !line.receiptLineId().equals(new UUID(0, 0)))
                    && lines.stream().map(Line::receiptLineId).distinct().count() == lines.size(),
                    "lines", "Supplier and 1..50 distinct receipt lines required.");
            require(validDate(input.invoiceDate()) && validDate(input.dueOn()) && validDate(input.postingDate()),
                    "invoiceDate", "Invoice, due and posting dates are required.");
            for (var line : lines) {
                amount(line.quantity(), "quantity", 6, "99999999999999.999999");
                require(line.quantity().signum() > 0, "quantity", "Positive quantity required.");
                require(line.net() != null && line.tax() != null, "net", "Explicit net and tax amounts required.");
                amount(line.net(), "net", 2, "999999999999999999.99");
                amount(line.tax(), "tax", 2, "999999999999999999.99");
            }
            String lineJson = lines.stream().sorted(Comparator.comparing(line -> line.receiptLineId().toString()))
                    .map(line -> "{\"receiptLineId\":" + value(line.receiptLineId()) + ",\"quantity\":"
                            + value(line.quantity().toPlainString()) + ",\"net\":" + value(line.net().toPlainString())
                            + ",\"tax\":" + value(line.tax().toPlainString()) + "}")
                    .collect(Collectors.joining(",", "[", "]"));
            String canonical = "{\"supplierId\":" + value(input.supplierId()) + ",\"supplierInvoice\":" + value(invoice)
                    + ",\"invoiceDate\":" + value(input.invoiceDate()) + ",\"dueOn\":" + value(input.dueOn())
                    + ",\"postingDate\":" + value(input.postingDate()) + ",\"lines\":" + lineJson
                    + ",\"taxInvoiceReference\":" + value(evidence) + ",\"taxInvoiceHeldOn\":" + value(input.taxInvoiceHeldOn())
                    + ",\"notes\":" + value(notes == null ? "" : notes) + ",\"varianceReason\":" + value(variance) + "}";
            String route = variance == null ? "POST /supplier-bills" : "POST /supplier-bills/with-variance";
            return writes.execute(scope, route, request.getHeader("Idempotency-Key"), canonical, () -> {
                String args = ":supplier,:invoice,CAST(:date AS date),CAST(:due AS date),CAST(:posting AS date),"
                        + "CAST(:evidence AS text),CAST(:held AS date),:notes,CAST(:lines AS jsonb)";
                var command = jdbc.sql(variance == null ? "SELECT purchase.post_bill(" + args + ")"
                        : "SELECT purchase.post_bill_with_variance(" + args + ",:variance)")
                        .param("supplier", input.supplierId()).param("invoice", invoice).param("date", input.invoiceDate())
                        .param("due", input.dueOn()).param("posting", input.postingDate()).param("evidence", evidence)
                        .param("held", input.taxInvoiceHeldOn()).param("notes", notes == null ? "" : notes).param("lines", lineJson);
                if (variance != null) {
                    command.param("variance", variance);
                }
                UUID id = command.query(UUID.class).single();
                audit.record(scope, "purchase.bill_posted", "supplier_bill", id, requestId(request),
                        Map.of("SupplierId", input.supplierId(), "supplierInvoice", invoice));
                return new IdempotentWrite.StoredResponse(201, json.writeValueAsString(view(scope, id)));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    Map<String, Object> view(StaffScope.CompanyAccess scope, UUID id) {
        var header = jdbc.sql("""
                SELECT b.*,b.invoice_date::text,b.due_on::text,b.tax_invoice_held_on::text,d.number,d.state,d.version,d.business_date::text
                FROM purchase.bills b JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id
                WHERE b.company_id=:company AND b.id=:id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).optional()
                .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
        var lines = jdbc.sql("""
                SELECT v.id,v.receipt_line_id,v.grni_item_id,v.quantity,v.net,v.tax,v.grni_amount,v.recoverable_tax,
                  v.tax_code_id,v.tax_rate,l.cost_variance,l.receipt_net,l.receipt_tax,v.paid_amount,v.outstanding_amount,
                  v.credited_quantity,v.credited_amount,v.refunded_amount,v.net_paid_amount,v.remaining_gross,
                  v.refundable_amount,l.expense_account_id,l.description,l.expense_amount,v.credit_received_amount,v.credit_used_amount
                FROM purchase.bill_line_balances v JOIN purchase.bill_lines l ON l.company_id=v.company_id AND l.id=v.id
                WHERE v.company_id=:company AND v.bill_id=:id ORDER BY v.id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).list();
        return Map.of("bill", header, "lines", lines);
    }

    static String text(String input, String field, int limit, boolean required) {
        String value = input == null ? "" : input.strip();
        require(!required || !value.isEmpty(), field, field + " must contain 1.." + limit + " characters.");
        require(value.length() <= limit, field, required
                ? field + " must contain 1.." + limit + " characters." : field + " exceeds " + limit + " characters.");
        return value.isEmpty() && !required ? null : value;
    }

    static String value(Object input) {
        return input == null ? "null" : CollaborationCreate.legacyString(input.toString());
    }

    static void amount(BigDecimal value, String field, int scale, String max) {
        BigDecimal number = value == null ? BigDecimal.ZERO : value;
        require(number.signum() >= 0 && number.compareTo(new BigDecimal(max)) <= 0
                && number.stripTrailingZeros().scale() <= scale, field,
                field + " must be nonnegative, within the storage limit, and have at most " + scale + " decimals.");
    }

    static void require(boolean valid, String field, String message) {
        if (!valid) {
            throw new BranchQuery.InvalidFilter(field, message);
        }
    }

    private static boolean validDate(LocalDate value) {
        return value != null && !value.equals(LocalDate.of(1, 1, 1));
    }

    private static String requestId(HttpServletRequest request) {
        return (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }

    record Input(UUID supplierId, String supplierInvoice, LocalDate invoiceDate, LocalDate dueOn, LocalDate postingDate,
            List<Line> lines, String taxInvoiceReference, LocalDate taxInvoiceHeldOn, String notes) {}
    record Line(UUID receiptLineId, BigDecimal quantity, BigDecimal net, BigDecimal tax) {}
    record Variance(Input bill, String reason) {}
}
