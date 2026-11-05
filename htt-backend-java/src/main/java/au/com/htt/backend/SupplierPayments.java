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
class SupplierPayments {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;

    SupplierPayments(StaffScope staff, JdbcClient jdbc, LegacyRows rows, IdempotentWrite writes,
            StaffAudit audit, JsonMapper json) {
        this.staff = staff;
        this.jdbc = jdbc;
        this.rows = rows;
        this.writes = writes;
        this.audit = audit;
        this.json = json;
    }

    @GetMapping("/api/v1/supplier-payments/{id}")
    Map<String, Object> detail(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.read");
        return staff.inCompany(scope, requestId(request), () -> view(scope, id));
    }

    @GetMapping("/api/v1/suppliers/{id}/payments")
    StaffIdentityController.Page<Map<String, Object>> list(@AuthenticationPrincipal Jwt token,
            HttpServletRequest request, @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.read");
        var items = staff.inCompany(scope, requestId(request), () -> {
            jdbc.sql("SELECT id FROM crm.suppliers WHERE company_id=:company AND id=:id")
                    .param("company", scope.companyId()).param("id", id).query(UUID.class).optional()
                    .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
            int offset = SalesRead.offset(page, pageSize);
            return jdbc.sql("""
                    SELECT p.id,d.number,d.state,d.version,p.paid_on::text,p.amount,p.allocated_amount,
                        p.advance_amount,p.method,p.reference,CASE WHEN EXISTS(
                            SELECT 1 FROM accounting.supplier_payment_reversals r
                            WHERE r.company_id=p.company_id AND r.payment_id=p.id)
                        THEN 'REVERSED' ELSE 'ACTIVE' END AS settlement_status
                    FROM accounting.supplier_payments p JOIN platform.documents d ON d.company_id=p.company_id AND d.id=p.id
                    WHERE p.company_id=:company AND p.supplier_id=:id
                    ORDER BY p.created_at DESC,p.id LIMIT :size OFFSET :offset
                    """).param("company", scope.companyId()).param("id", id).param("size", pageSize)
                    .param("offset", offset).query(rows::row).list();
        });
        return new StaffIdentityController.Page<>(items, page, pageSize);
    }

    @PostMapping("/api/v1/suppliers/{id}/payments")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Input input) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.post");
        var result = staff.inCompany(scope, requestId(request), () -> {
            var allocations = input.allocations() == null ? List.<Allocation>of() : input.allocations();
            SupplierBills.require(allocations.size() <= 50 && allocations.stream().allMatch(a -> a != null
                    && a.billLineId() != null && !a.billLineId().equals(new UUID(0, 0)))
                    && allocations.stream().map(Allocation::billLineId).distinct().count() == allocations.size(),
                    "allocations", "Supply up to 50 distinct bill lines.");
            BigDecimal allocated = BigDecimal.ZERO;
            for (var allocation : allocations) {
                var amount = allocation.amount() == null ? BigDecimal.ZERO : allocation.amount();
                SupplierBills.amount(amount, "amount", 2, "999999999999999999.99");
                SupplierBills.require(amount.signum() > 0, "amount", "Allocation must be positive.");
                allocated = allocated.add(amount);
            }
            BigDecimal amount = input.amount() == null ? BigDecimal.ZERO : input.amount();
            BigDecimal advance = input.advanceAmount() == null ? BigDecimal.ZERO : input.advanceAmount();
            SupplierBills.amount(amount, "amount", 2, "999999999999999999.99");
            SupplierBills.amount(advance, "advanceAmount", 2, "999999999999999999.99");
            SupplierBills.require(amount.signum() > 0 && amount.compareTo(advance.add(allocated)) == 0,
                    "amount", "Payment must equal allocations plus explicit advance amount.");
            SupplierBills.require(input.method() != null && List.of("BANK_TRANSFER", "CARD", "CASH").contains(input.method()),
                    "method", "Invalid method.");
            String reference = SupplierBills.text(input.reference(), "reference", 200, true);
            String optionalNotes = SupplierBills.text(input.notes(), "notes", 2000, false);
            String notes = optionalNotes == null ? "" : optionalNotes;
            SupplierBills.require(advance.signum() == 0 || !notes.isEmpty(), "notes", "Prepayment purpose is required.");
            UUID bank = input.bankAccountId();
            if (bank != null) {
                SupplierBills.require(!bank.equals(new UUID(0, 0)), "bankAccountId", "A company cash account ID is required.");
                if (!List.of(scope.permissions()).contains("accounting.banks.use")) {
                    throw new StaffScope.Failure(403, "permission_denied", "Cash-account selection permission required.");
                }
            }
            String lineJson = allocations.stream().sorted(Comparator.comparing(a -> a.billLineId().toString()))
                    .map(a -> "{\"billLineId\":" + SupplierBills.value(a.billLineId()) + ",\"amount\":"
                            + SupplierBills.value(a.amount().toPlainString()) + "}")
                    .collect(Collectors.joining(",", "[", "]"));
            String canonical = "{\"id\":" + SupplierBills.value(id) + ",\"amount\":" + SupplierBills.value(amount.toPlainString())
                    + ",\"advanceAmount\":" + SupplierBills.value(advance.toPlainString())
                    + ",\"method\":" + SupplierBills.value(input.method()) + ",\"reference\":" + SupplierBills.value(reference)
                    + ",\"paidOn\":" + SupplierBills.value(input.paidOn()) + ",\"notes\":" + SupplierBills.value(notes)
                    + ",\"allocations\":" + lineJson
                    + (bank == null ? "" : ",\"bankAccountId\":" + SupplierBills.value(bank)) + "}";
            return writes.execute(scope, "POST /suppliers/" + id + "/payments",
                    request.getHeader("Idempotency-Key"), canonical, () -> {
                String args = ":supplier,:amount,:advance,:method,:reference,CAST(:paid AS date),:notes,CAST(:lines AS jsonb)";
                var command = jdbc.sql(bank == null ? "SELECT purchase.post_supplier_payment(" + args + ")"
                        : "SELECT purchase.post_supplier_payment_to_bank(" + args + ",:bank)")
                        .param("supplier", id).param("amount", amount).param("advance", advance)
                        .param("method", input.method()).param("reference", reference).param("paid", input.paidOn())
                        .param("notes", notes).param("lines", lineJson);
                if (bank != null) {
                    command.param("bank", bank);
                }
                UUID payment = command.query(UUID.class).single();
                audit.record(scope, "purchase.supplier_paid", "supplier_payment", payment, requestId(request),
                        Map.of("supplierId", id, "Amount", amount, "reference", reference));
                return new IdempotentWrite.StoredResponse(201, json.writeValueAsString(view(scope, payment)));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    private Map<String, Object> view(StaffScope.CompanyAccess scope, UUID id) {
        var header = jdbc.sql("""
                SELECT p.*,p.paid_on::text,d.number,d.state,d.version,r.id AS reversal_id,x.original_payment_id,
                    CASE WHEN r.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS settlement_status
                FROM accounting.supplier_payments p JOIN platform.documents d ON d.company_id=p.company_id AND d.id=p.id
                LEFT JOIN accounting.supplier_payment_reversals r ON r.company_id=p.company_id AND r.payment_id=p.id
                LEFT JOIN accounting.supplier_payment_reapplications x ON x.company_id=p.company_id AND x.id=p.id
                WHERE p.company_id=:company AND p.id=:id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).optional()
                .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
        var allocations = jdbc.sql("""
                SELECT a.id,a.bill_line_id,bl.bill_id,a.amount,a.gst_amount,a.payment_id,a.advance_id
                FROM accounting.supplier_payment_allocations a JOIN purchase.bill_lines bl ON bl.company_id=a.company_id AND bl.id=a.bill_line_id
                WHERE a.company_id=:company AND a.source_document_id=:id ORDER BY a.bill_line_id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).list();
        var advances = jdbc.sql("""
                SELECT id,amount,available,account_id,gst_basis,gst_registered FROM accounting.supplier_advance_balances
                WHERE company_id=:company AND payment_id=:id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).list();
        return Map.of("payment", header, "allocations", allocations, "advances", advances);
    }

    private static String requestId(HttpServletRequest request) {
        return (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }

    record Input(BigDecimal amount, String method, String reference, BigDecimal advanceAmount,
            List<Allocation> allocations, LocalDate paidOn, String notes, UUID bankAccountId) {}
    record Allocation(UUID billLineId, BigDecimal amount) {}
}
