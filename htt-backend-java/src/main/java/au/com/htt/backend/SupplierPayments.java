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

    @PostMapping("/api/v1/supplier-advances/{id}/apply")
    ResponseEntity<String> apply(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Application input) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.advances.apply");
        var result = staff.inCompany(scope, requestId(request), () -> {
            String reference = SupplierBills.text(input.reference(), "reference", 200, true);
            String lines = applicationLines(input.allocations(), true);
            String canonical = "{\"id\":" + SupplierBills.value(id) + ",\"reference\":" + SupplierBills.value(reference)
                    + ",\"allocations\":" + lines + "}";
            return writes.execute(scope, "POST /supplier-advances/" + id + "/apply",
                    request.getHeader("Idempotency-Key"), canonical, () -> {
                UUID application = jdbc.sql("SELECT purchase.apply_supplier_advance(:id,:reference,CAST(:lines AS jsonb))")
                        .param("id", id).param("reference", reference).param("lines", lines).query(UUID.class).single();
                audit.record(scope, "purchase.supplier_advance_applied", "supplier_advance_application", application,
                        requestId(request), Map.of("advanceId", id, "reference", reference));
                return new IdempotentWrite.StoredResponse(201, json.writeValueAsString(applicationView(scope, application)));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @GetMapping("/api/v1/supplier-advance-applications/{id}")
    Map<String, Object> application(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.read");
        return staff.inCompany(scope, requestId(request), () -> applicationView(scope, id));
    }

    @PostMapping("/api/v1/supplier-payments/{id}/reverse")
    ResponseEntity<String> reverse(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Correction input) {
        return correct(token, request, id, input, false);
    }

    @PostMapping("/api/v1/supplier-advance-applications/{id}/unapply")
    ResponseEntity<String> unapply(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Correction input) {
        return correct(token, request, id, input, true);
    }

    private ResponseEntity<String> correct(Jwt token, HttpServletRequest request, UUID id, Correction input, boolean undo) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"),
                undo ? "purchase.advances.unapply" : "purchase.payments.reverse");
        if (!List.of(scope.permissions()).contains("purchase.payments.read")
                || !List.of(scope.permissions()).contains("purchase.bills.read")) {
            throw new StaffScope.Failure(403, "permission_denied",
                    "Supplier correction requires payment and bill access, with reapplication authority when applicable.");
        }
        var result = staff.inCompany(scope, requestId(request), () -> {
            String table = undo ? "accounting.supplier_advance_applications" : "accounting.supplier_payments";
            jdbc.sql("SELECT id FROM " + table + " WHERE company_id=:company AND id=:id")
                    .param("company", scope.companyId()).param("id", id).query(UUID.class).optional()
                    .orElseThrow(SupplierPayments::unavailable);
            String reference = SupplierBills.text(input.reference(), "reference", 200, true);
            String reason = SupplierBills.text(input.reason(), "reason", 2000, true);
            String route = undo ? "POST /supplier-advance-applications/" + id + "/unapply"
                    : "POST /supplier-payments/" + id + "/reverse";
            String canonical = "{\"id\":" + SupplierBills.value(id) + ",\"reference\":" + SupplierBills.value(reference)
                    + ",\"reason\":" + SupplierBills.value(reason) + "}";
            return writes.execute(scope, route, request.getHeader("Idempotency-Key"), canonical, () -> {
                String function = undo ? "purchase.unapply_supplier_advance" : "purchase.reverse_supplier_payment";
                UUID reversal = jdbc.sql("SELECT " + function + "(:id,:reference,:reason)")
                        .param("id", id).param("reference", reference).param("reason", reason).query(UUID.class).single();
                audit.record(scope, undo ? "purchase.supplier_advance_unapplied" : "purchase.supplier_payment_reversed",
                        undo ? "supplier_advance_unapplication" : "supplier_payment_reversal",
                        reversal, requestId(request), Map.of("sourceId", id, "reference", reference));
                return new IdempotentWrite.StoredResponse(201, json.writeValueAsString(correctionView(scope, reversal, undo)));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/supplier-payment-reversals/{id}/reapply")
    ResponseEntity<String> reapply(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Reapplication input) {
        return reapply(token, request, id, input, null);
    }

    @PostMapping("/api/v1/supplier-payments/{id}/reallocate")
    ResponseEntity<String> reallocate(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Reallocation input) {
        return reapply(token, request, id,
                new Reapplication(input.reference(), input.reason(), input.advanceAmount(), input.allocations()),
                input.reversalReference());
    }

    private ResponseEntity<String> reapply(Jwt token, HttpServletRequest request, UUID id,
            Reapplication input, String reversalReference) {
        boolean atomic = reversalReference != null;
        var scope = staff.require(token, request.getHeader("X-Company-Id"),
                atomic ? "purchase.payments.reverse" : "purchase.payments.reapply");
        var permissions = List.of(scope.permissions());
        if (!permissions.containsAll(List.of("purchase.payments.read", "purchase.bills.read",
                "purchase.payments.reapply", "purchase.payments.post"))) {
            throw new StaffScope.Failure(403, "permission_denied",
                    "Supplier correction requires payment and bill access, with reapplication authority when applicable.");
        }
        var result = staff.inCompany(scope, requestId(request), () -> {
            String table = atomic ? "accounting.supplier_payments" : "accounting.supplier_payment_reversals";
            jdbc.sql("SELECT id FROM " + table + " WHERE company_id=:company AND id=:id")
                    .param("company", scope.companyId()).param("id", id).query(UUID.class)
                    .optional().orElseThrow(SupplierPayments::unavailable);
            String reference = SupplierBills.text(input.reference(), "reference", 200, true);
            String reason = SupplierBills.text(input.reason(), "reason", 2000, true);
            String reversal = atomic ? SupplierBills.text(reversalReference, "reversalReference", 200, true) : null;
            String lines = applicationLines(input.allocations(), false);
            BigDecimal advance = input.advanceAmount() == null ? BigDecimal.ZERO : input.advanceAmount();
            SupplierBills.amount(advance, "advanceAmount", 2, "999999999999999999.99");
            String canonical = "{\"id\":" + SupplierBills.value(id) + ",\"reference\":" + SupplierBills.value(reference)
                    + ",\"reason\":" + SupplierBills.value(reason) + ",\"reversalReference\":" + SupplierBills.value(reversal)
                    + ",\"advanceAmount\":" + SupplierBills.value(advance.toPlainString()) + ",\"allocations\":" + lines + "}";
            String route = atomic ? "POST /supplier-payments/" + id + "/reallocate"
                    : "POST /supplier-payment-reversals/" + id + "/reapply";
            return writes.execute(scope, route, request.getHeader("Idempotency-Key"), canonical, () -> {
                String args = ":id," + (atomic ? ":reversal," : "") + ":reference,:reason,:advance,CAST(:lines AS jsonb)";
                var command = jdbc.sql("SELECT " + (atomic ? "purchase.reallocate_supplier_payment" :
                        "purchase.reapply_supplier_payment") + "(" + args + ")")
                        .param("id", id).param("reference", reference).param("reason", reason)
                        .param("advance", advance).param("lines", lines);
                if (atomic) {
                    command.param("reversal", reversal);
                }
                UUID payment = command.query(UUID.class).single();
                UUID reversed = jdbc.sql("""
                        SELECT reversal_id FROM accounting.supplier_payment_reapplications WHERE company_id=:company AND id=:id
                        """).param("company", scope.companyId()).param("id", payment).query(UUID.class).single();
                if (atomic) {
                    audit.record(scope, "purchase.supplier_payment_reversed", "supplier_payment_reversal", reversed,
                            requestId(request), Map.of("paymentId", id, "reference", reversal));
                }
                audit.record(scope, "purchase.supplier_payment_reapplied", "supplier_payment", payment,
                        requestId(request), Map.of("reversalId", reversed, "reference", reference));
                var body = new java.util.LinkedHashMap<>(view(scope, payment));
                body.put("reversalId", reversed);
                return new IdempotentWrite.StoredResponse(201, json.writeValueAsString(body));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    record Reapplication(String reference, String reason, BigDecimal advanceAmount, List<Allocation> allocations) {}
    record Reallocation(String reversalReference, String reference, String reason,
            BigDecimal advanceAmount, List<Allocation> allocations) {}

    @GetMapping("/api/v1/supplier-payment-reversals/{id}")
    Map<String, Object> reversal(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.read");
        return staff.inCompany(scope, requestId(request), () -> correctionView(scope, id, false));
    }

    @GetMapping("/api/v1/supplier-advance-unapplications/{id}")
    Map<String, Object> unapplication(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.payments.read");
        return staff.inCompany(scope, requestId(request), () -> correctionView(scope, id, true));
    }

    private Map<String, Object> applicationView(StaffScope.CompanyAccess scope, UUID id) {
        var header = jdbc.sql("""
                SELECT a.*,d.number,d.state,d.version,d.business_date::text,u.id AS unapplication_id,
                  CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status
                FROM accounting.supplier_advance_applications a JOIN platform.documents d
                  ON d.company_id=a.company_id AND d.id=a.id
                LEFT JOIN accounting.supplier_advance_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id
                WHERE a.company_id=:company AND a.id=:id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).optional()
                .orElseThrow(SupplierPayments::unavailable);
        return Map.of("application", header, "allocations", allocations(scope, id));
    }

    private Map<String, Object> correctionView(StaffScope.CompanyAccess scope, UUID id, boolean undo) {
        String query = undo ? """
                SELECT x.*,d.number,d.state,d.business_date::text FROM accounting.supplier_advance_unapplications x
                JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id
                WHERE x.company_id=:company AND x.id=:id
                """ : """
                SELECT x.*,d.number,d.state,d.business_date::text,p.id AS replacement_payment_id
                FROM accounting.supplier_payment_reversals x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id
                LEFT JOIN accounting.supplier_payment_reapplications p ON p.company_id=x.company_id AND p.reversal_id=x.id
                WHERE x.company_id=:company AND x.id=:id
                """;
        var header = jdbc.sql(query).param("company", scope.companyId()).param("id", id).query(rows::row)
                .optional().orElseThrow(SupplierPayments::unavailable);
        UUID source = (UUID) header.get(undo ? "applicationId" : "paymentId");
        var lines = jdbc.sql("""
                SELECT bill_line_id,amount,gst_amount,payment_id,advance_id
                FROM accounting.supplier_payment_allocations
                WHERE company_id=:company AND source_document_id=:id ORDER BY bill_line_id
                """).param("company", scope.companyId()).param("id", source).query(rows::row).list();
        var gst = jdbc.sql("""
                SELECT bill_line_id,amount,gst_amount,gst_basis,adjustment_date::text,kind
                FROM accounting.purchase_gst_adjustments
                WHERE company_id=:company AND settlement_reversal_id=:id ORDER BY bill_line_id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).list();
        return Map.of(undo ? "unapplication" : "reversal", header, "allocations", lines, "gstAdjustments", gst);
    }

    private List<Map<String, Object>> allocations(StaffScope.CompanyAccess scope, UUID id) {
        return jdbc.sql("""
                SELECT a.id,a.bill_line_id,bl.bill_id,a.amount,a.gst_amount,a.payment_id,a.advance_id
                FROM accounting.supplier_payment_allocations a JOIN purchase.bill_lines bl
                  ON bl.company_id=a.company_id AND bl.id=a.bill_line_id
                WHERE a.company_id=:company AND a.source_document_id=:id ORDER BY a.bill_line_id
                """).param("company", scope.companyId()).param("id", id).query(rows::row).list();
    }

    private static String applicationLines(List<Allocation> input, boolean required) {
        var lines = input == null ? List.<Allocation>of() : input;
        SupplierBills.require((!required || !lines.isEmpty()) && lines.size() <= 50 && lines.stream().allMatch(a -> a != null
                && a.billLineId() != null && !a.billLineId().equals(new UUID(0, 0)))
                && lines.stream().map(Allocation::billLineId).distinct().count() == lines.size(),
                "allocations", "Supply up to 50 distinct bill lines.");
        for (var line : lines) {
            SupplierBills.amount(line.amount(), "amount", 2, "999999999999999999.99");
            SupplierBills.require(line.amount() != null && line.amount().signum() > 0, "amount", "Allocation must be positive.");
        }
        return lines.stream().sorted(Comparator.comparing(a -> a.billLineId().toString()))
                .map(a -> "{\"billLineId\":" + SupplierBills.value(a.billLineId())
                    + ",\"amount\":" + SupplierBills.value(a.amount().toPlainString()) + "}")
                .collect(Collectors.joining(",", "[", "]"));
    }

    private static StaffScope.Failure unavailable() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }

    record Application(String reference, List<Allocation> allocations) {}
    record Correction(String reference, String reason) {}

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
