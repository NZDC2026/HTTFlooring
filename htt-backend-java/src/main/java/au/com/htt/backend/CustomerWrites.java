package au.com.htt.backend;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class CustomerWrites {
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    CustomerWrites(JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    IdempotentWrite.StoredResponse create(StaffScope.CompanyAccess scope, Draft draft, String key, String requestId) {
        int defaultTerms = scoped("SELECT sales_terms_days FROM core.business_preferences WHERE company_id=:company", scope)
                .query(Integer.class).optional().orElseThrow(CustomerWrites::unavailable);
        int terms = draft.paymentTermsDays() == null ? defaultTerms : draft.paymentTermsDays();
        String code = draft.code() == null ? "" : draft.code().strip().toUpperCase(Locale.ROOT);
        String name = draft.legalName();
        var credit = draft.creditLimit() == null ? BigDecimal.ZERO : draft.creditLimit();
        if (!code.matches("[A-Z0-9][A-Z0-9_-]{0,39}") || name == null || name.isBlank() || name.length() > 200
                || credit.signum() < 0 || credit.stripTrailingZeros().scale() > 2 || terms < 0 || terms > 365) {
            throw new StaffScope.Failure(422, "invalid_customer",
                    "Provide a code, legal name, nonnegative two-decimal credit limit, and valid terms.");
        }
        String abn = normalizeAbn(draft.abn());
        if ((credit.signum() > 0 || terms != defaultTerms) && !has(scope, "customers.credit.write")) {
            throw new StaffScope.Failure(403, "permission_denied", "Initial credit and nondefault terms require credit permission.");
        }
        String normalizedName = name.strip();
        String canonical = "{\"Code\":" + CollaborationCreate.legacyString(code)
                + ",\"LegalName\":" + CollaborationCreate.legacyString(normalizedName)
                + ",\"Abn\":" + (abn == null ? "null" : CollaborationCreate.legacyString(abn))
                + ",\"CreditLimit\":" + credit.toPlainString() + ",\"PaymentTermsDays\":" + draft.paymentTermsDays() + "}";
        return writes.execute(scope, "POST /customers", key, canonical, () -> {
            UUID id = UUID.randomUUID();
            UUID party = UUID.randomUUID();
            scoped("""
                    INSERT INTO crm.parties(id,company_id,legal_name,abn,created_by)
                    VALUES (:party,:company,:name,:abn,:actor)
                    """, scope).param("party", party).param("name", normalizedName).param("abn", abn)
                    .param("actor", scope.actorId()).update();
            scoped("""
                    INSERT INTO crm.customers(id,company_id,party_id,code,credit_limit,payment_terms_days,created_by)
                    VALUES (:id,:company,:party,:code,:credit,:terms,:actor)
                    """, scope).param("id", id).param("party", party).param("code", code)
                    .param("credit", credit).param("terms", terms).param("actor", scope.actorId()).update();
            scoped("""
                    INSERT INTO crm.customer_credit_exposures(company_id,customer_id,created_by)
                    VALUES (:company,:id,:actor)
                    """, scope).param("id", id).param("actor", scope.actorId()).update();
            audit.record(scope, "foundation.customer_created", "customer", id, requestId, Map.of());
            return response(201, id, 1);
        });
    }

    IdempotentWrite.StoredResponse changeStatus(StaffScope.CompanyAccess scope, UUID id, State state,
            String ifMatch, String key, String requestId) {
        String status = state.status();
        if (status == null || !List.of("ACTIVE", "ON_HOLD", "INACTIVE").contains(status)) {
            throw new StaffScope.Failure(422, "invalid_status", "Invalid customer status.");
        }
        long version = version(ifMatch);
        String canonical = "{\"id\":\"" + id + "\",\"version\":" + version + ",\"Status\":\"" + status + "\"}";
        return writes.execute(scope, "PATCH /customers/" + id + "/status", key, canonical, () -> {
            var previous = scoped("""
                    SELECT c.status,c.version FROM crm.customers c WHERE c.company_id=:company AND c.id=:id
                    AND (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                       WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))
                    FOR UPDATE
                    """, scope).param("id", id).param("allCustomers", has(scope, "customers.all"))
                    .param("membership", scope.membershipId())
                    .query((row, index) -> new Previous(row.getString(1), row.getLong(2))).optional()
                    .orElseThrow(CustomerWrites::unavailable);
            if ("ON_HOLD".equals(previous.status()) && !"ON_HOLD".equals(status) && !has(scope, "customers.credit.write")) {
                throw new StaffScope.Failure(403, "permission_denied", "Releasing a customer hold requires credit permission.");
            }
            if (previous.version() != version) {
                throw new StaffScope.Failure(409, "version_conflict", "Resource unavailable or changed; refresh before retrying.");
            }
            long updated = scoped("""
                    UPDATE crm.customers SET status=:status WHERE company_id=:company AND id=:id RETURNING version
                    """, scope).param("id", id).param("status", status).query(Long.class).single();
            audit.record(scope, "foundation.customer_status_changed", "customer", id, requestId,
                    Map.of("previousStatus", previous.status(), "status", status,
                            "previousVersion", previous.version(), "version", updated));
            return response(200, id, updated);
        });
    }

    private JdbcClient.StatementSpec scoped(String sql, StaffScope.CompanyAccess scope) {
        return jdbc.sql(sql).param("company", scope.companyId());
    }

    private static boolean has(StaffScope.CompanyAccess scope, String permission) {
        return List.of(scope.permissions()).contains(permission);
    }

    static String normalizeAbn(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }
        String value = input.replace(" ", "");
        if (!value.matches("[0-9]{11}")) {
            throw new StaffScope.Failure(422, "invalid_abn", "ABN must contain 11 ASCII digits.");
        }
        int[] weights = {10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        int sum = -10;
        for (int i = 0; i < weights.length; i++) {
            sum += (value.charAt(i) - '0') * weights[i];
        }
        if (sum % 89 != 0 || value.charAt(0) == '0') {
            throw new StaffScope.Failure(422, "invalid_abn", "ABN checksum is invalid.");
        }
        return value;
    }

    private static long version(String value) {
        try {
            long version = Long.parseLong(value == null ? "" : value.replaceAll("^\"+|\"+$", "").strip());
            if (version > 0) {
                return version;
            }
        } catch (NumberFormatException invalid) {
            // Use the legacy precondition error for malformed values.
        }
        throw new StaffScope.Failure(428, "version_required", "Supply If-Match with the current resource version.");
    }

    private static StaffScope.Failure unavailable() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }

    private static IdempotentWrite.StoredResponse response(int status, UUID id, long version) {
        return new IdempotentWrite.StoredResponse(status, "{\"id\":\"" + id + "\",\"version\":" + version + "}");
    }

    record Draft(String code, String legalName, String abn, BigDecimal creditLimit, Integer paymentTermsDays) {}
    record State(String status) {}
    private record Previous(String status, long version) {}
}
