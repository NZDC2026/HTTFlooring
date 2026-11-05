package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class QuoteTransitions {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    QuoteTransitions(StaffScope staff, JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.staff = staff;
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    @PostMapping("/api/v1/quotes/{id}/return-to-draft")
    ResponseEntity<String> returnToDraft(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody OrderWrites.Review input) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.quotes.approve");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response = staff.inCompany(scope, requestId, () -> {
            String reason = input.reason() == null ? "" : input.reason().strip();
            if (reason.isEmpty() || reason.length() > 2000) {
                throw new BranchQuery.InvalidFilter("reason", "reason must contain 1..2000 characters.");
            }
            long expected = OrderWrites.version(request.getHeader("If-Match"));
            quote(scope, id, false);
            String canonical = "{\"reason\":" + CollaborationCreate.legacyString(reason)
                    + ",\"expected\":" + expected + "}";
            return writes.execute(scope, "POST /quotes/" + id + "/return-to-draft",
                    request.getHeader("Idempotency-Key"), canonical, () -> {
                Quote quote = quote(scope, id, true);
                if (quote.version() != expected) {
                    throw new StaffScope.Failure(409, "version_conflict", "Document changed; refresh before retrying.");
                }
                if (!"SUBMITTED".equals(quote.status())) {
                    throw new StaffScope.Failure(409, "quote_not_submitted", "Only unconverted submitted quotes can be returned.");
                }
                jdbc.sql("""
                        UPDATE platform.approval_requests SET state='STALE'
                        WHERE company_id=:company AND document_id=:id AND document_version=:expected AND state='PENDING'
                        """).param("company", scope.companyId()).param("id", id).param("expected", expected).update();
                jdbc.sql("UPDATE sales.quotes SET status='DRAFT' WHERE company_id=:company AND id=:id")
                        .param("company", scope.companyId()).param("id", id).update();
                long version = jdbc.sql("""
                        UPDATE platform.documents SET state='DRAFT'
                        WHERE company_id=:company AND id=:id RETURNING version
                        """).param("company", scope.companyId()).param("id", id).query(Long.class).single();
                audit.record(scope, "sales.quote_returned", "quote", id, requestId,
                        Map.of("reason", reason, "previousVersion", expected, "version", version));
                return new IdempotentWrite.StoredResponse(200, "{\"id\":\"" + id + "\",\"number\":"
                        + (quote.number() == null ? "null" : CollaborationCreate.legacyString(quote.number()))
                        + ",\"status\":\"DRAFT\",\"version\":" + version + "}");
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    private Quote quote(StaffScope.CompanyAccess scope, UUID id, boolean lock) {
        return jdbc.sql("""
                SELECT d.number,d.version,q.status FROM sales.quotes q
                JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.id
                WHERE q.company_id=:company AND q.id=:id AND EXISTS(
                    SELECT 1 FROM crm.customers c WHERE c.company_id=q.company_id AND c.id=q.customer_id
                    AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                        WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership)))
                """ + (lock ? " FOR UPDATE OF d,q" : ""))
                .param("company", scope.companyId()).param("id", id)
                .param("all", List.of(scope.permissions()).contains("customers.all"))
                .param("membership", scope.membershipId())
                .query((row, index) -> new Quote(row.getString(1), row.getLong(2), row.getString(3)))
                .optional().orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
    }

    private record Quote(String number, long version, String status) {}
}
