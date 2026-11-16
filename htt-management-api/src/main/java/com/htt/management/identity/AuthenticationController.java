package com.htt.management.identity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;

/** Shared authentication endpoints; Swagger groups operations by customer or employee identity domain. */
@RestController
@ConditionalOnProperty(name={"htt.auth.enabled","htt.auth.local-enabled"},havingValue="true")
public class AuthenticationController {
    private final LocalAuthentication authentication;
    private final AccessAudit audit;
    private final boolean cookieSecure;
    public AuthenticationController(LocalAuthentication authentication,AccessAudit audit,
            @org.springframework.beans.factory.annotation.Value("${htt.auth.cookie-secure:true}") boolean cookieSecure,org.springframework.core.env.Environment environment) {
        if(!cookieSecure&&!environment.matchesProfiles("development","test"))
            throw new IllegalStateException("Insecure cookies are restricted to development/test");
        this.authentication=authentication;this.audit=audit;this.cookieSecure=cookieSecure;
    }
    public record Login(String email,@Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String password) {
        @Override public String toString() {return "Login[redacted]";}
    }
    public record PasswordChange(@Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String currentPassword,
                                 @Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String newPassword) {
        @Override public String toString() {return "PasswordChange[redacted]";}
    }
    @GetMapping({"/api/v1/user/auth/me","/api/v1/customer/auth/me","/api/v1/auth/me","/api/portal/v1/auth/me"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VerifiedUser> me() {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(ResourceAccess.currentUser());
    }
    @GetMapping({"/api/v1/customer/auth/customer-subject","/api/portal/v1/auth/customer-subject"})
    @PreAuthorize("@resourceAccess.isCustomer()")
    public ResponseEntity<LocalAuthentication.CustomerSubjectIdentity> customerSubject() {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(authentication.customerSubject(ResourceAccess.currentUser().access().actorId()));
    }
    @PostMapping("/api/v1/customer/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="Customer email/password login (15-minute access token)")
    public ResponseEntity<LocalAuthentication.LoginResult> customerLogin(@RequestBody Login input,HttpServletRequest request) {
        return login(input,request,AccessSnapshot.Realm.CUSTOMER);
    }
    @PostMapping("/api/v1/user/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="Employee email/password login (15-minute access token)")
    public ResponseEntity<LocalAuthentication.LoginResult> userLogin(@RequestBody Login input,HttpServletRequest request) {
        return login(input,request,AccessSnapshot.Realm.STAFF);
    }
    /** Compatibility aliases for existing clients; new integrations use the explicit identity-domain paths. */
    @PostMapping("/api/portal/v1/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Hidden
    public ResponseEntity<LocalAuthentication.LoginResult> legacyCustomerLogin(@RequestBody Login input,HttpServletRequest request) {
        return login(input,request,AccessSnapshot.Realm.CUSTOMER);
    }
    @PostMapping("/api/v1/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Hidden
    public ResponseEntity<LocalAuthentication.LoginResult> legacyUserLogin(@RequestBody Login input,HttpServletRequest request) {
        return login(input,request,AccessSnapshot.Realm.STAFF);
    }
    private ResponseEntity<LocalAuthentication.LoginResult> login(Login input,HttpServletRequest request,AccessSnapshot.Realm realm) {
        var context=SecurityContextHolder.getContext();
        var previous=context.getAuthentication();
        try {
            var result=authentication.login(input.email(),input.password(),realm,request.getRemoteAddr());
            // Attribute the successful login audit to the verified actor, never the submitted email.
            context.setAuthentication(authentication.authenticate(result.accessToken(),realm));
            audit.record(request,"auth:login",null,null,"ALLOW");
            return ResponseEntity.ok().header("Cache-Control","no-store").header("Pragma","no-cache").body(result);
        } catch(RuntimeException failure) {audit.record(request,"auth:login",null,null,"DENY");throw failure;}
        finally {context.setAuthentication(previous);}
    }
    @PostMapping({"/api/v1/user/auth/logout","/api/v1/customer/auth/logout","/api/v1/auth/logout","/api/portal/v1/auth/logout"})
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="Log out current session (Bearer or Cookie); no device type required",
            description="Bearer is verified before logout. Without Bearer, send refresh Cookie and X-HTT-CSRF obtained from /csrf. An expired/invalid Bearer is rejected; omit it for Cookie logout.")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        var user=ResourceAccess.currentUser();
        AccessSnapshot.Realm realm;
        if(user!=null) {
            realm=user.realm();authentication.logout(session().subject());
        } else {
            realm=realm(request);
            // SecurityFilterChain enforces CSRF before allowing cookie-only logout.
            String refresh=BrowserSessionCookies.read(request,realm,cookieSecure);
            if(refresh!=null)authentication.logoutBrowser(refresh,realm);
        }
        audit.record(request,"auth:logout",null,null,"ALLOW");
        return ResponseEntity.noContent().header("Cache-Control","no-store")
                .header("Set-Cookie",BrowserSessionCookies.expired(realm,cookieSecure).toArray(String[]::new)).build();
    }
    @PostMapping({"/api/v1/user/auth/change-password","/api/v1/customer/auth/change-password","/api/v1/auth/change-password","/api/portal/v1/auth/change-password"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> change(@RequestBody PasswordChange input,HttpServletRequest request) {
        try {
            authentication.changePassword(session().subject(),ResourceAccess.currentUser(),input.currentPassword(),input.newPassword());
            audit.record(request,"auth:change-password",null,null,"ALLOW");return ResponseEntity.noContent().header("Set-Cookie",BrowserSessionCookies.expired(ResourceAccess.currentUser().realm(),cookieSecure).toArray(String[]::new)).build();
        } catch(RuntimeException failure) {audit.record(request,"auth:change-password",null,null,"DENY");throw failure;}
    }
    private static VerifiedToken session() {
        Object details=SecurityContextHolder.getContext().getAuthentication().getDetails();
        if(!(details instanceof VerifiedToken token)||!LocalAuthentication.SESSION_ISSUER.equals(token.issuer()))
            throw new org.springframework.security.access.AccessDeniedException("Local session required");
        return token;
    }
    @io.swagger.v3.oas.annotations.Operation(summary="Get CSRF token for persistent-session operations")
    @GetMapping({"/api/v1/user/auth/csrf","/api/v1/customer/auth/csrf","/api/v1/auth/csrf","/api/portal/v1/auth/csrf"})
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String,String>> csrf(HttpServletRequest request) {
        var csrf=(CsrfToken)request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok().header("Cache-Control","no-store").body(Map.of("headerName",csrf.getHeaderName(),"csrfToken",csrf.getToken()));
    }
    @io.swagger.v3.oas.annotations.Operation(summary="Email/password login with a fixed seven-day persistent session",
            description="Returns an access token and sets an HttpOnly refresh cookie. First obtain CSRF from /csrf.")
    @PostMapping({"/api/v1/user/auth/browser-login","/api/v1/customer/auth/browser-login","/api/v1/auth/browser-login","/api/portal/v1/auth/browser-login"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="First GET /auth/csrf in this identity domain; send the returned csrfToken and cookies")
    @PreAuthorize("permitAll()")
    public ResponseEntity<LocalAuthentication.LoginResult> persistentLogin(@RequestBody Login input,
            HttpServletRequest request,HttpServletResponse response) {
        var realm=realm(request);
        LocalAuthentication.BrowserSession session=null;
        try {
            session=authentication.browserLogin(input.email(),input.password(),realm,request.getRemoteAddr());
            record(request,"auth:browser-login",session,realm);
            cookie(response,realm,session.refreshToken(),Duration.between(Instant.now(),session.expiresAt()));
            return result(session);
        } catch(RuntimeException failure) {
            if(session!=null) authentication.logoutBrowser(session.refreshToken(),realm);
            audit.record(request,"auth:browser-login",null,null,"DENY");throw failure;
        }
    }
    @io.swagger.v3.oas.annotations.Operation(summary="Refresh access token and rotate the persistent-session cookie")
    @PostMapping({"/api/v1/user/auth/refresh","/api/v1/customer/auth/refresh","/api/v1/auth/refresh","/api/portal/v1/auth/refresh"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="Use csrfToken from GET /auth/csrf; browser sends the HttpOnly refresh cookie")
    @PreAuthorize("permitAll()")
    public ResponseEntity<LocalAuthentication.LoginResult> refresh(HttpServletRequest request,HttpServletResponse response) {
        var realm=realm(request);
        try {
            var session=authentication.refresh(refreshCookie(request,realm),realm);
            try {
                record(request,"auth:refresh",session,realm);
                cookie(response,realm,session.refreshToken(),Duration.between(Instant.now(),session.expiresAt()));
                return result(session);
            } catch(RuntimeException failure) {authentication.logoutBrowser(session.refreshToken(),realm);throw failure;}
        } catch(BadCredentialsException failure) {
            cookie(response,realm,"",Duration.ZERO);audit.record(request,"auth:refresh",null,null,"DENY");throw failure;
        }
    }
    @io.swagger.v3.oas.annotations.Hidden
    @PostMapping({"/api/v1/user/auth/browser-logout","/api/v1/customer/auth/browser-logout","/api/v1/auth/browser-logout","/api/portal/v1/auth/browser-logout"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="Required even when the access token has expired")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> legacyCookieLogout(HttpServletRequest request,HttpServletResponse response) {
        var realm=realm(request);String token=refreshCookie(request,realm);
        if(token!=null) authentication.logoutBrowser(token,realm);
        audit.record(request,"auth:browser-logout",null,null,"ALLOW");cookie(response,realm,"",Duration.ZERO);
        return ResponseEntity.noContent().header("Cache-Control","no-store").build();
    }
    private void record(HttpServletRequest request,String action,LocalAuthentication.BrowserSession session,AccessSnapshot.Realm realm) {
        var context=SecurityContextHolder.getContext();var prior=context.getAuthentication();
        try {context.setAuthentication(authentication.authenticate(session.login().accessToken(),realm));audit.record(request,action,null,null,"ALLOW");}
        finally {context.setAuthentication(prior);}
    }
    private ResponseEntity<LocalAuthentication.LoginResult> result(LocalAuthentication.BrowserSession session) {
        return ResponseEntity.ok().header("Cache-Control","no-store").header("Pragma","no-cache").body(session.login());
    }
    private static AccessSnapshot.Realm realm(HttpServletRequest request) {
        String path=request.getRequestURI().substring(request.getContextPath().length());
        return path.startsWith("/api/portal/")||path.startsWith("/api/v1/customer/auth/")?AccessSnapshot.Realm.CUSTOMER:AccessSnapshot.Realm.STAFF;
    }
    private String refreshCookie(HttpServletRequest request,AccessSnapshot.Realm realm) {
        return BrowserSessionCookies.read(request,realm,cookieSecure);
    }
    private void cookie(HttpServletResponse response,AccessSnapshot.Realm realm,String value,Duration duration) {
        if(!cookieSecure)for(String path:BrowserSessionCookies.legacyPaths(realm))
            response.addHeader(HttpHeaders.SET_COOKIE,BrowserSessionCookies.value(realm,false,"",Duration.ZERO,path));
        response.addHeader(HttpHeaders.SET_COOKIE,BrowserSessionCookies.value(realm,cookieSecure,value,duration,"/"));
    }
}
