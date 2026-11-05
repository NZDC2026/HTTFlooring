package com.htt.management.identity;

import com.htt.management.platform.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** An audit write must succeed before an authorization decision permits a business action. */
public class AccessAudit {
    private final JdbcTemplate jdbc;

    public AccessAudit(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(HttpServletRequest request, String action, UUID company, UUID resource, String outcome) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID actor = authentication != null && authentication.getPrincipal() instanceof VerifiedUser user
                ? user.access().actorId() : null;
        // Do not persist tokens, query strings, request bodies or client-supplied role names.
        jdbc.queryForObject("select identity.append_access_audit(?, ?, ?, ?, ?, ?)", Object.class,
                RequestIdFilter.requestId(request), actor, company, action, resource, outcome);
    }
}
