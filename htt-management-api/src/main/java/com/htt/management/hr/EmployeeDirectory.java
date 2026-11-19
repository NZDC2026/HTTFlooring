package com.htt.management.hr;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htt.management.identity.AccessAudit;
import com.htt.management.identity.AccessSnapshot;
import com.htt.management.identity.VerifiedUser;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@Service
@ConditionalOnProperty(name = {"htt.auth.enabled", "htt.employees.enabled"}, havingValue = "true")
public class EmployeeDirectory {
    private static final String READ = "payroll:read";
    private static final String MANAGE = "payroll:manage";
    private static final String SENSITIVE = "payroll:sensitive:read";
    private static final String DIRECTORY_FIELDS =
            "id,employee_code,full_name,position,employment_type,start_date,status";
    private static final String SEARCH = """
            where company_id=? and (strpos(lower(full_name),lower(?))>0
                or strpos(lower(coalesce(position,'')),lower(?))>0 or strpos(lower(employee_code),lower(?))>0)
            """;
    private final JdbcTemplate jdbc;
    private final AccessAudit audit;
    private final ObjectMapper json;

    public EmployeeDirectory(JdbcTemplate jdbc, AccessAudit audit, ObjectMapper json) {
        this.jdbc = jdbc;
        this.audit = audit;
        this.json = json;
    }

    public enum Filter { ACTIVE, LEFT, ALL }
    public record Summary(UUID id, String employeeCode, String fullName, String position,
            String employmentType, LocalDate startDate, String status, String loginStatus, String myobStatus) {}
    public record Counts(long current, long left, long all) {}
    public record Page(List<Summary> items, int offset, int limit, long total, Counts counts) {}
    public record Detail(UUID id, String employeeCode, String fullName, String position,
            String employmentType, String employmentCategory, LocalDate startDate, LocalDate endDate,
            String status, String loginStatus, String myobStatus,
            @JsonInclude(JsonInclude.Include.NON_NULL) PrivateDetails sensitive) {}
    public record PrivateDetails(String mobile, String address, String email, String emergencyContact,
            String payBasis, String payRate, String commissionPercent) {
        @Override public String toString() { return "PrivateDetails[redacted]"; }
    }

    @Transactional(timeout = 10)
    public Summary create(VerifiedUser user, HttpServletRequest request, UUID company, UUID operation,
            CreateEmployeeRequest input) {
        require(user, request, company, null, MANAGE);
        if ((input.payBasis() == null) != (input.payRate() == null)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "Pay basis and rate must be supplied together.");
        }
        UUID actor = user.access().actorId();
        String hash = fingerprint(input);
        // Serialize only callers retrying this request. The counter separately serializes new numbers per company.
        jdbc.queryForObject("select pg_advisory_xact_lock(hashtextextended(?,0))", Object.class,
                "hr.employee:" + company + ":" + actor + ":" + operation);
        if (!permitted(company, MANAGE)) throw new AccessDeniedException("Access is denied.");
        var prior = jdbc.query("select " + DIRECTORY_FIELDS + ",request_hash from hr.employee"
                        + " where company_id=? and created_by=? and request_id=?",
                (r, n) -> new Replay(summary(r), r.getString("request_hash")), company, actor, operation);
        if (!prior.isEmpty()) {
            var replay = prior.getFirst();
            if (!hash.equals(replay.hash())) throw new ResponseStatusException(HttpStatus.CONFLICT);
            return replay.employee();
        }

        long number = jdbc.queryForObject("""
                insert into hr.employee_number(company_id,last_number) values (?,1)
                on conflict(company_id) do update set last_number=hr.employee_number.last_number+1
                returning last_number
                """, Long.class, company);
        UUID id = UUID.randomUUID();
        String code = String.format(Locale.ROOT, "EMP-%06d", number);
        jdbc.update("""
                insert into hr.employee(id,company_id,employee_code,full_name,position,start_date,
                    employment_type,employment_category,created_by,updated_by,request_id,request_hash)
                values (?,?,?,?,?,?,?,?,?,?,?,?)
                """, id, company, code, input.fullName(), input.position(), input.startDate(),
                input.employmentType().name(), input.employmentCategory().name(), actor, actor, operation, hash);
        jdbc.update("""
                insert into hr.employee_private(company_id,employee_id,mobile,address,email,emergency_contact,
                    pay_basis,pay_rate,commission_percent) values (?,?,?,?,?,?,?,?,?)
                """, company, id, input.mobile(), input.address(), input.email(), input.emergencyContact(),
                input.payBasis() == null ? null : input.payBasis().name(), input.payRate(), input.commissionPercent());
        return new Summary(id, code, input.fullName(), input.position(), input.employmentType().name(),
                input.startDate(), "ACTIVE", "NOT_LINKED", "NOT_LINKED");
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ, timeout = 10)
    public Page list(VerifiedUser user, HttpServletRequest request, UUID company, Filter status,
            String query, int offset, int limit) {
        require(user, request, company, null, READ);
        String q = query.strip();
        Counts counts = jdbc.queryForObject("""
                select count(*) filter (where status='ACTIVE'),
                       count(*) filter (where status='LEFT'), count(*)
                from hr.employee
                """ + SEARCH, (r, n) -> new Counts(r.getLong(1), r.getLong(2), r.getLong(3)), company, q, q, q);
        List<Summary> items = jdbc.query("select " + DIRECTORY_FIELDS + " from hr.employee " + SEARCH
                        + " and (?='ALL' or status=?) order by employee_code,id limit ? offset ?",
                (r, n) -> summary(r), company, q, q, q, status.name(), status.name(), limit, offset);
        long total = switch (status) {
            case ACTIVE -> counts.current();
            case LEFT -> counts.left();
            case ALL -> counts.all();
        };
        return new Page(items, offset, limit, total, counts);
    }

    @Transactional(timeout = 10)
    public Detail detail(VerifiedUser user, HttpServletRequest request, UUID company, UUID id) {
        var member = require(user, request, company, id, READ);
        var employees = jdbc.query("select " + DIRECTORY_FIELDS
                        + ",end_date,employment_category from hr.employee where company_id=? and id=?",
                (r, n) -> new Employment(summary(r), r.getString("employment_category"),
                        r.getObject("end_date", LocalDate.class)), company, id);
        if (employees.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        PrivateDetails sensitive = null;
        if (!member.readOnly() && member.permits(SENSITIVE, false) && permitted(company, SENSITIVE)) {
            audit.record(request, SENSITIVE, company, id, "ALLOW");
            sensitive = jdbc.query("""
                    select mobile,address,email,emergency_contact,pay_basis,pay_rate,commission_percent
                    from hr.employee_private where company_id=? and employee_id=?
                    """, (r, n) -> new PrivateDetails(r.getString("mobile"), r.getString("address"),
                    r.getString("email"), r.getString("emergency_contact"), r.getString("pay_basis"),
                    decimal(r.getBigDecimal("pay_rate")), decimal(r.getBigDecimal("commission_percent"))),
                    company, id).stream().findFirst().orElse(null);
        }
        var employment = employees.getFirst();
        var s = employment.summary();
        return new Detail(s.id(), s.employeeCode(), s.fullName(), s.position(), s.employmentType(),
                employment.category(), s.startDate(), employment.endDate(), s.status(), s.loginStatus(), s.myobStatus(), sensitive);
    }

    private AccessSnapshot.CompanyAccess require(VerifiedUser user, HttpServletRequest request,
            UUID company, UUID employee, String action) {
        var member = user == null || user.realm() != AccessSnapshot.Realm.STAFF ? null
                : user.access().companies().stream().filter(c -> company.equals(c.companyId())).findFirst().orElse(null);
        boolean allowed = member != null && member.memberKind() != AccessSnapshot.MemberKind.CUSTOMER
                && member.memberKind() != AccessSnapshot.MemberKind.SALES && member.permits(action, action.equals(MANAGE))
                && member.usableGrants().stream().anyMatch(g -> g.scope() == AccessSnapshot.Scope.COMPANY);
        if (allowed) {
            jdbc.queryForObject("select set_config('htt.company_id',?,true)", String.class, company.toString());
            jdbc.queryForObject("select set_config('htt.actor_id',?,true)", String.class, user.access().actorId().toString());
            allowed = permitted(company, action);
        }
        audit.record(request, action, company, employee, allowed ? "ALLOW" : "DENY");
        if (!allowed) throw new AccessDeniedException("Access is denied.");
        return member;
    }

    private boolean permitted(UUID company, String action) {
        return Boolean.TRUE.equals(jdbc.queryForObject("select hr.permitted(?,?)", Boolean.class, company, action));
    }

    private String fingerprint(CreateEmployeeRequest input) {
        // Canonicalize decimal scale so 2.5 and 2.50 represent the same request.
        var canonical = new CreateEmployeeRequest(input.fullName(), input.position(), input.mobile(), input.address(),
                input.email(), input.startDate(), input.employmentType(), input.employmentCategory(), input.payBasis(),
                scale(input.payRate()), scale(input.commissionPercent()), input.emergencyContact());
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json.writeValueAsBytes(canonical)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static BigDecimal scale(BigDecimal value) { return value == null ? null : value.setScale(2); }
    private static String decimal(BigDecimal value) { return value == null ? null : value.toPlainString(); }

    private static Summary summary(ResultSet r) throws SQLException {
        return new Summary(r.getObject("id", UUID.class), r.getString("employee_code"), r.getString("full_name"),
                r.getString("position"), r.getString("employment_type"), r.getObject("start_date", LocalDate.class),
                r.getString("status"), "NOT_LINKED", "NOT_LINKED");
    }
    private record Replay(Summary employee, String hash) {}
    private record Employment(Summary summary, String category, LocalDate endDate) {}
}
