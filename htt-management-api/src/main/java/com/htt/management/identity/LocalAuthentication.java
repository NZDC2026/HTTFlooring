package com.htt.management.identity;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.ObjectMapper;

/** Local opaque sessions. Database functions provide the narrow pre-authentication RLS boundary. */
public class LocalAuthentication {
    public static final String SESSION_ISSUER="urn:htt:local-session";
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final PasswordEncoder passwords=new BCryptPasswordEncoder(12);
    private final SecureRandom random=new SecureRandom();
    private final String dummyHash=passwords.encode(UUID.randomUUID().toString());
    public LocalAuthentication(JdbcTemplate jdbc,ObjectMapper json) { this.jdbc=jdbc;this.json=json; }
    record Candidate(UUID actor,String passwordHash,long version) { }
    record Session(AccessSnapshot access,Instant issuedAt,Instant expiresAt) { }
    public record LoginResult(String accessToken,String tokenType,long expiresIn) {
        @Override public String toString() {return "LoginResult[redacted]";}
    }
    public record BrowserSession(LoginResult login,String refreshToken,Instant expiresAt) {
        @Override public String toString() {return "BrowserSession[redacted]";}
    }
    public BrowserSession browserLogin(String login,String password,AccessSnapshot.Realm realm,String source) {
        LoginResult result=login(login,password,realm,source);
        try {
            authenticate(result.accessToken(),realm);
            String refresh=secret("htr_");
            var expiry=jdbc.queryForObject("select identity.begin_browser_session(?,?,?)",java.time.OffsetDateTime.class,
                    digest(result.accessToken()),digest(refresh),realm.name());
            if(expiry==null) throw new BadCredentialsException("Session unavailable");
            return new BrowserSession(result,refresh,expiry.toInstant());
        } catch(RuntimeException failure) {logout(digest(result.accessToken()));throw failure;}
    }
    public BrowserSession refresh(String previous,AccessSnapshot.Realm realm) {
        requireRefresh(previous);
        String next=secret("htr_"),access=secret("htt_");
        // This statement commits before a replay rejection is thrown, so revocation is not rolled back.
        String value=jdbc.queryForObject("select identity.rotate_browser_session(?,?,?,?)::text",String.class,
                digest(previous),digest(next),digest(access),realm.name());
        var result=json.readTree(value);
        if(!"OK".equals(result.path("status").asText())) throw new BadCredentialsException("Refresh session unavailable");
        try { authenticate(access,realm); }
        catch(RuntimeException failure) {logoutBrowser(next,realm);throw failure;}
        Instant expiry=Instant.parse(result.path("expiresAt").asText());
        long remaining=Math.max(0,java.time.Duration.between(Instant.now(),expiry).getSeconds());
        return new BrowserSession(new LoginResult(access,"Bearer",Math.min(900,remaining)),next,expiry);
    }
    public void logoutBrowser(String refresh,AccessSnapshot.Realm realm) {
        requireRefresh(refresh);
        jdbc.queryForObject("select identity.logout_browser_session(?,?)",Object.class,digest(refresh),realm.name());
    }
    private static void requireRefresh(String token) {
        if(token==null||!token.matches("htr_[A-Za-z0-9_-]{43}")) throw new BadCredentialsException("Refresh session unavailable");
    }
    private String secret(String prefix) {
        byte[] bytes=new byte[32];random.nextBytes(bytes);return prefix+Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public LoginResult login(String login,String password,AccessSnapshot.Realm realm,String source) {
        String normalized=normalize(login);
        validatePasswordInput(password);
        // Both counters commit even when authentication is rejected. Never trust X-Forwarded-For here.
        boolean account=Boolean.TRUE.equals(jdbc.queryForObject("select identity.take_login_attempt(?,6)",Boolean.class,digest("account:"+normalized)));
        boolean address=Boolean.TRUE.equals(jdbc.queryForObject("select identity.take_login_attempt(?,40)",Boolean.class,digest("source:"+source)));
        if(!account||!address) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Too many login attempts");
        Candidate candidate=candidate(normalized,realm);
        boolean matches=passwords.matches(password,candidate==null?dummyHash:candidate.passwordHash());
        if(candidate==null||!matches) throw new BadCredentialsException("Invalid login credentials");
        byte[] secret=new byte[32];random.nextBytes(secret);
        String token="htt_"+Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
        if(!Boolean.TRUE.equals(jdbc.queryForObject("select identity.start_password_session(?,?,?,?)",Boolean.class,
                candidate.actor(),candidate.version(),realm.name(),digest(token)))) throw new BadCredentialsException("Invalid login credentials");
        return new LoginResult(token,"Bearer",900);
    }
    public UsernamePasswordAuthenticationToken authenticate(String token,AccessSnapshot.Realm realm) {
        if(token==null||!token.matches("htt_[A-Za-z0-9_-]{43}")) throw new BadCredentialsException("Invalid session");
        String hash=digest(token);
        String stored=jdbc.queryForObject("select identity.password_session_access(?,?)::text",String.class,hash,realm.name());
        Session session=stored==null?null:json.readValue(stored,Session.class);
        if(session==null||session.access()==null) throw new BadCredentialsException("Invalid session");
        if(realm==AccessSnapshot.Realm.CUSTOMER) {
            var companies=session.access().companies();
            if(companies.size()!=1 || companies.getFirst().grants().isEmpty()
                    || companies.getFirst().grants().stream().anyMatch(g->g.customerId()==null)
                    || companies.getFirst().grants().stream().map(AccessSnapshot.Grant::customerId).distinct().count()!=1)
                throw new BadCredentialsException("One authorized company and customer required");
        }
        var auth=UsernamePasswordAuthenticationToken.authenticated(new VerifiedUser(session.access(),realm),null,List.of());
        auth.setDetails(new VerifiedToken(SESSION_ISSUER,hash,session.issuedAt(),session.expiresAt()));
        return auth;
    }
    public record CustomerSubjectIdentity(String customerSubjectId,String customerId,String contactId,String accountType) { }
    public CustomerSubjectIdentity customerSubject(UUID actor) {
        String value=jdbc.queryForObject("select identity.current_customer_account(?)::text",String.class,actor);
        if(value==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Customer account is not linked");
        var data=json.readTree(value);
        if(!data.hasNonNull("customerSubjectId")) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Customer subject migration required");
        return new CustomerSubjectIdentity(data.get("customerSubjectId").asText(),data.get("customerId").asText(),
                data.hasNonNull("contactId")?data.get("contactId").asText():null,data.get("accountType").asText());
    }
    public void logout(String sessionHash) { jdbc.queryForObject("select identity.end_password_session(?)",Object.class,sessionHash); }
    public void changePassword(String sessionHash,VerifiedUser user,String current,String next) {
        validatePasswordInput(current);validateNewPassword(next);
        // Candidate lookup is by the verified actor, never by a client-supplied user ID.
        String stored=jdbc.queryForObject("select identity.password_session_access(?,?)::text",String.class,sessionHash,user.realm().name());
        if(stored==null) throw new BadCredentialsException("Invalid session");
        if(!Boolean.TRUE.equals(jdbc.queryForObject("select identity.take_login_attempt(?,6)",Boolean.class,digest("password-change:"+user.access().actorId()))))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Too many attempts");
        Candidate candidate=jdbc.queryForObject("select identity.password_session_candidate(?,?)::text",
                (r,n)->r.getString(1)==null?null:json.readValue(r.getString(1),Candidate.class),sessionHash,user.realm().name());
        if(candidate==null||!candidate.actor().equals(user.access().actorId())||!passwords.matches(current,candidate.passwordHash()))
            throw new BadCredentialsException("Invalid login credentials");
        if(!Boolean.TRUE.equals(jdbc.queryForObject("select identity.change_local_password(?,?,?)",Boolean.class,sessionHash,candidate.version(),passwords.encode(next))))
            throw new BadCredentialsException("Session changed");
    }
    private Candidate candidate(String login,AccessSnapshot.Realm realm) {
        String value=jdbc.queryForObject("select identity.password_login_candidate(?,?)::text",String.class,login,realm.name());
        return value==null?null:json.readValue(value,Candidate.class);
    }
    public String encodeNewPassword(String password) { validateNewPassword(password);return passwords.encode(password); }
    public void createCustomerCredential(UUID caller,UUID company,UUID actor,String encoded) {
        jdbc.queryForObject("select identity.create_local_customer_credential(?,?,?,?)",Object.class,caller,company,actor,encoded);
    }
    static String normalize(String login) {
        if(login==null||login.isBlank()||login.length()>320||!login.strip().matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email login required");
        return login.strip().toLowerCase(Locale.ROOT);
    }
    private static void validatePasswordInput(String value) {
        if(value==null||value.isEmpty()||value.getBytes(StandardCharsets.UTF_8).length>72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid password length");
    }
    static void validateNewPassword(String value) {
        validatePasswordInput(value);
        if(value.length()<12) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Password requires at least 12 characters");
    }
    public static String digest(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch(java.security.NoSuchAlgorithmException failure) { throw new IllegalStateException(failure); }
    }
}
