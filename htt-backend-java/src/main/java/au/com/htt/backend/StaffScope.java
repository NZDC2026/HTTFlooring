package au.com.htt.backend;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class StaffScope {
    private final JdbcClient jdbc;
    private final TransactionTemplate transaction;

    StaffScope(JdbcClient jdbc, TransactionTemplate transaction) {
        this.jdbc = jdbc;
        this.transaction = transaction;
    }

    List<CompanyAccess> access(Jwt token) {
        String issuer = token.getClaimAsString("iss");
        String subject = token.getSubject();
        if (issuer == null || issuer.isBlank() || subject == null || subject.isBlank()) {
            throw new Failure(401, "identity_missing", "A verified issuer and subject are required.");
        }
        return jdbc.sql("""
                SELECT user_id, company_id, company_name, membership_id, permissions
                FROM identity.resolve_access(:issuer, :subject)
                """)
                .param("issuer", issuer)
                .param("subject", subject)
                .query((row, number) -> new CompanyAccess(
                        row.getObject("user_id", UUID.class),
                        row.getObject("company_id", UUID.class),
                        row.getString("company_name"),
                        row.getObject("membership_id", UUID.class),
                        (String[]) row.getArray("permissions").getArray()))
                .list();
    }

    CompanyAccess require(Jwt token, String selectedCompany, String permission) {
        UUID company;
        try {
            company = UUID.fromString(selectedCompany == null ? "" : selectedCompany.trim());
        } catch (IllegalArgumentException invalid) {
            throw new Failure(400, "company_required", "Supply a valid X-Company-Id header.");
        }
        var membership = access(token).stream()
                .filter(row -> row.companyId().equals(company)).findFirst()
                .orElseThrow(() -> new Failure(403, "company_forbidden",
                        "No active membership in the selected company."));
        if (!List.of(membership.permissions()).contains(permission)) {
            throw new Failure(403, "permission_denied", "This operation is not permitted.");
        }
        return membership;
    }

    <T> T inCompany(CompanyAccess membership, String requestId, Supplier<T> action) {
        return transaction.execute(status -> {
            jdbc.sql("""
                    SELECT set_config('htt.company_id', :company, true),
                           set_config('htt.actor_id', :actor, true),
                           set_config('htt.request_id', :request, true),
                           set_config('TimeZone', 'UTC', true),
                           set_config('lock_timeout', '3s', true),
                           set_config('statement_timeout', '10s', true)
                    """)
                    .param("company", membership.companyId().toString())
                    .param("actor", membership.actorId().toString())
                    .param("request", requestId)
                    .query((row, number) -> row.getString(1)).single();
            return action.get();
        });
    }

    record CompanyAccess(UUID actorId, UUID companyId, String companyName, UUID membershipId, String[] permissions) {}

    static final class Failure extends RuntimeException {
        final int status;
        final String code;

        Failure(int status, String code, String message) {
            super(message);
            this.status = status;
            this.code = code;
        }
    }
}
