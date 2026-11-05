package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class PurchaseGst {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final String ledger;
    private final String attributions;
    private final String unmatched;

    PurchaseGst(StaffScope staff, JdbcClient jdbc, LegacyRows rows) throws IOException {
        this.staff = staff;
        this.jdbc = jdbc;
        this.rows = rows;
        ledger = load("purchase-gst-ledger.sql");
        attributions = load("purchase-gst-attributions.sql");
        unmatched = load("purchase-grni-unmatched.sql");
    }

    @GetMapping("/api/v1/accounting/purchase-gst")
    Map<String, Object> ledger(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(required=false) UUID supplierId, @RequestParam(required=false) LocalDate from,
            @RequestParam(required=false) LocalDate to, @RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.input_gst.read");
        return staff.inCompany(scope, requestId(request), () -> {
            validateDates(from, to);
            int offset = SalesRead.offset(page, pageSize);
            var total = query(ledger + " SELECT coalesce(sum(attributed_tax),0) AS attributed,coalesce(sum(pending_payment_tax),0) AS pending,coalesce(sum(pending_refund_tax),0) AS pending_refund FROM ledger",
                    scope,supplierId,from,to).query(rows::row).single();
            var items = query(ledger + " SELECT *,attribution_date::text FROM ledger WHERE attributed_tax<>0 OR pending_payment_tax>0 OR pending_refund_tax>0 OR (gst_basis='NON_CASH' AND attribution_date IS NULL) ORDER BY bill_id,id LIMIT :size OFFSET :offset",
                    scope,supplierId,from,to).param("size", pageSize).param("offset", offset).query(rows::row).list();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("currency", "AUD");
            result.put("attributedTax", total.get("attributed"));
            result.put("pendingPaymentTax", total.get("pending"));
            result.put("pendingRefundTax", total.get("pendingRefund"));
            result.put("items", items);
            result.put("page", page);
            result.put("pageSize", pageSize);
            return result;
        });
    }

    @GetMapping("/api/v1/accounting/purchase-gst-attributions")
    StaffIdentityController.Page<Map<String, Object>> attributions(@AuthenticationPrincipal Jwt token,
            HttpServletRequest request, @RequestParam(required=false) UUID supplierId,
            @RequestParam(required=false) LocalDate from, @RequestParam(required=false) LocalDate to,
            @RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.input_gst.read");
        return staff.inCompany(scope, requestId(request), () -> {
            validateDates(from, to);
            int offset = SalesRead.offset(page, pageSize);
            return new StaffIdentityController.Page<>(query(attributions,scope,supplierId,from,to)
                    .param("size",pageSize).param("offset",offset).query(rows::row).list(),page,pageSize);
        });
    }

    @GetMapping("/api/v1/accounting/grni/unmatched")
    StaffIdentityController.Page<Map<String, Object>> unmatched(@AuthenticationPrincipal Jwt token,
            HttpServletRequest request, @RequestParam UUID supplierId,
            @RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.grni.read");
        return staff.inCompany(scope, requestId(request), () -> {
            int offset = SalesRead.offset(page, pageSize);
            var items = jdbc.sql(unmatched).param("company",scope.companyId()).param("supplier",supplierId)
                    .param("size",pageSize).param("offset",offset).query(rows::row).list();
            return new StaffIdentityController.Page<>(items,page,pageSize);
        });
    }

    private JdbcClient.StatementSpec query(String sql, StaffScope.CompanyAccess scope,
            UUID supplier, LocalDate from, LocalDate to) {
        return jdbc.sql(sql).param("company",scope.companyId()).param("supplier",supplier)
                .param("from",from).param("to",to);
    }

    private static void validateDates(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BranchQuery.InvalidFilter("to", "End date must not precede start date.");
        }
    }

    private static String load(String name) throws IOException {
        return new ClassPathResource(name).getContentAsString(StandardCharsets.UTF_8);
    }

    private static String requestId(HttpServletRequest request) {
        return (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }
}
