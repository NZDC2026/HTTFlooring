package com.htt.management.identity;

import java.util.UUID;
import com.htt.management.identity.contract.CustomerBranchScope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataRetrievalFailureException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.JacksonException;

/** Only narrow database functions may bypass RLS during identity bootstrap. */
public class AccessRepository {
    public boolean isManagedPortalAccount(java.util.UUID actor) {
        return Boolean.TRUE.equals(jdbc.queryForObject("select identity.is_managed_customer_account(?)",Boolean.class,actor));
    }
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public AccessRepository(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public AccessSnapshot resolve(String issuer, String subject, AccessSnapshot.Realm realm) {
        if (LocalAuthentication.SESSION_ISSUER.equals(issuer)) {
            String value=jdbc.queryForObject("select identity.password_session_access(?,?)::text",String.class,subject,realm.name());
            return value==null?null:json.treeToValue(json.readTree(value).get("access"),AccessSnapshot.class);
        }
        String result = jdbc.queryForObject("select identity.resolve_access(?, ?, ?)::text",
                String.class, issuer, subject, realm.name());
        return parse(result, AccessSnapshot.class);
    }

    public AccessSnapshot.ResourceOwner findResource(AccessSnapshot.ResourceKind kind, UUID id) {
        String result = jdbc.queryForObject("select identity.resource_owner(?, ?)::text",
                String.class, kind.name(), id);
        return parse(result, AccessSnapshot.ResourceOwner.class);
    }

    public CustomerBranchScope customerBranchScope(UUID actor, UUID company, UUID grant) {
        String result = jdbc.queryForObject("select identity.portal_branch_scope(?, ?, ?)::text", String.class, actor, company, grant);
        return parse(result, CustomerBranchScope.class);
    }

    private <T> T parse(String value, Class<T> type) {
        try { return value == null ? null : json.readValue(value, type); }
        catch (JacksonException exception) { throw new DataRetrievalFailureException("Invalid stored access state.", exception); }
    }
}
