package com.htt.management.notification;

import com.htt.management.identity.AccessAudit;
import com.htt.management.identity.AccessRepository;
import com.htt.management.identity.AccessSnapshot;
import com.htt.management.identity.VerifiedToken;
import com.htt.management.identity.VerifiedUser;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import static com.htt.management.notification.NotificationModels.*;

public class NotificationAccess {
    private final AccessRepository repository;
    private final AccessAudit audit;
    public NotificationAccess(AccessRepository repository,AccessAudit audit) { this.repository=repository; this.audit=audit; }

    public boolean allowed(String permission) {
        var request=((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
        Session session=sessionOrNull();
        var authentication=SecurityContextHolder.getContext().getAuthentication();
        boolean allowed=session!=null && authentication.getPrincipal() instanceof VerifiedUser user
                && permitted(session,user.access(),permission);
        audit.record(request,permission,session==null ? null : session.companyId(),null,allowed ? "ALLOW" : "DENY");
        return allowed;
    }
    public Session session() {
        Session session=sessionOrNull();
        if (session==null) throw new AccessDeniedException("Access is denied.");
        return session;
    }
    public boolean current(Session session) {
        if (!session.token().expiresAt().isAfter(Instant.now())) return false;
        var access=repository.resolve(session.token().issuer(),session.token().subject(),session.realm());
        return access!=null && access.actorId().equals(session.userId())
                && !session.token().issuedAt().isBefore(access.tokensValidAfter())
                && permitted(session,access,"notification:read");
    }
    private boolean permitted(Session session,AccessSnapshot snapshot,String permission) {
        return snapshot.companies().stream().anyMatch(member -> member.companyId().equals(session.companyId())
                && member.permissions().contains(permission)
                && !member.grants().isEmpty()
                && (session.realm()!=AccessSnapshot.Realm.CUSTOMER || member.grants().stream().anyMatch(grant ->
                    grant.id().equals(session.grantId()) && grant.scope()!=AccessSnapshot.Scope.COMPANY)));
    }
    private Session sessionOrNull() {
        var authentication=SecurityContextHolder.getContext().getAuthentication();
        if (authentication==null || !(authentication.getPrincipal() instanceof VerifiedUser user)
                || !(authentication.getDetails() instanceof VerifiedToken token)) return null;
        var request=((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
        try {
            UUID company=UUID.fromString(request.getHeader("X-Company-Id"));
            UUID grant=user.realm()==AccessSnapshot.Realm.CUSTOMER ? UUID.fromString(request.getHeader("X-Portal-Grant-Id")) : null;
            return new Session(company,user.access().actorId(),grant,user.realm(),token);
        } catch (IllegalArgumentException | NullPointerException exception) { return null; }
    }
}
