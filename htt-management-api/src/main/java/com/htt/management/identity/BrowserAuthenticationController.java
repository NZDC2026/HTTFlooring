package com.htt.management.identity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

/** Browser-only cookie endpoints. Business APIs still accept access Bearer tokens only. */
@RestController
@PreAuthorize("permitAll()")
@ConditionalOnProperty(name={"htt.auth.enabled","htt.auth.local-enabled"},havingValue="true")
public class BrowserAuthenticationController {
    private final LocalAuthentication authentication;
    private final AccessAudit audit;
    private final boolean secure;
    public BrowserAuthenticationController(LocalAuthentication authentication,AccessAudit audit,
            @Value("${htt.auth.cookie-secure:true}") boolean secure,Environment environment) {
        if(!secure&&!environment.matchesProfiles("development","test")) throw new IllegalStateException("Insecure cookies are restricted to development/test");
        this.authentication=authentication;this.audit=audit;this.secure=secure;
    }
    @GetMapping({"/api/v1/auth/csrf","/api/portal/v1/auth/csrf"})
    public ResponseEntity<Map<String,String>> csrf(HttpServletRequest request) {
        var csrf=(CsrfToken)request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok().header("Cache-Control","no-store").body(Map.of("headerName",csrf.getHeaderName(),"csrfToken",csrf.getToken()));
    }
    @PostMapping({"/api/v1/auth/browser-login","/api/portal/v1/auth/browser-login"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="First GET /auth/csrf in this identity domain; send the returned csrfToken and cookies")
    public ResponseEntity<LocalAuthentication.LoginResult> login(@RequestBody LocalAuthenticationController.Login input,
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
    @PostMapping({"/api/v1/auth/refresh","/api/portal/v1/auth/refresh"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="Use csrfToken from GET /auth/csrf; browser sends the HttpOnly refresh cookie")
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
    @PostMapping({"/api/v1/auth/browser-logout","/api/portal/v1/auth/browser-logout"})
    @io.swagger.v3.oas.annotations.Parameter(name="X-HTT-CSRF",in=io.swagger.v3.oas.annotations.enums.ParameterIn.HEADER,required=true,
            description="Required even when the access token has expired")
    public ResponseEntity<Void> logout(HttpServletRequest request,HttpServletResponse response) {
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
        return request.getRequestURI().substring(request.getContextPath().length()).startsWith("/api/portal/")?AccessSnapshot.Realm.CUSTOMER:AccessSnapshot.Realm.STAFF;
    }
    private String name(AccessSnapshot.Realm realm) {return (secure?"__Host-":"")+"htt-"+(realm==AccessSnapshot.Realm.CUSTOMER?"portal":"staff")+"-refresh";}
    private String refreshCookie(HttpServletRequest request,AccessSnapshot.Realm realm) {
        String value=null;
        if(request.getCookies()!=null) for(var cookie:request.getCookies()) if(cookie.getName().equals(name(realm))) {
            if(value!=null) throw new BadCredentialsException("Ambiguous refresh cookie");value=cookie.getValue();
        }
        return value;
    }
    private void cookie(HttpServletResponse response,AccessSnapshot.Realm realm,String value,Duration duration) {
        String path=secure?"/":realm==AccessSnapshot.Realm.CUSTOMER?"/api/portal/v1/auth":"/api/v1/auth";
        response.addHeader(HttpHeaders.SET_COOKIE,ResponseCookie.from(name(realm),value).httpOnly(true).secure(secure)
                .sameSite("Strict").path(path).maxAge(duration.isNegative()?Duration.ZERO:duration).build().toString());
    }
}
