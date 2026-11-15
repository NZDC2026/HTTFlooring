package com.htt.management.identity;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@ConditionalOnProperty(name={"htt.auth.enabled","htt.auth.local-enabled"},havingValue="true")
public class LocalAuthenticationController {
    private final LocalAuthentication authentication;
    private final AccessAudit audit;
    private final boolean cookieSecure;
    public LocalAuthenticationController(LocalAuthentication authentication,AccessAudit audit,
            @org.springframework.beans.factory.annotation.Value("${htt.auth.cookie-secure:true}") boolean cookieSecure) {
        this.authentication=authentication;this.audit=audit;this.cookieSecure=cookieSecure;
    }
    public record Login(String email,@Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String password) {
        @Override public String toString() {return "Login[redacted]";}
    }
    public record PasswordChange(@Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String currentPassword,
                                 @Schema(accessMode=Schema.AccessMode.WRITE_ONLY,format="password") String newPassword) {
        @Override public String toString() {return "PasswordChange[redacted]";}
    }
    @GetMapping({"/api/v1/auth/me","/api/portal/v1/auth/me"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VerifiedUser> me() {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(ResourceAccess.currentUser());
    }
    @GetMapping("/api/portal/v1/auth/customer-subject")
    @PreAuthorize("@resourceAccess.isCustomer()")
    public ResponseEntity<LocalAuthentication.CustomerSubjectIdentity> customerSubject() {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(authentication.customerSubject(ResourceAccess.currentUser().access().actorId()));
    }
    @PostMapping("/api/v1/customer/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="Customer email/password login",tags={"Customer authentication"})
    public ResponseEntity<LocalAuthentication.LoginResult> customerLogin(@RequestBody Login input,HttpServletRequest request) {
        return login(input,request,AccessSnapshot.Realm.CUSTOMER);
    }
    @PostMapping("/api/v1/user/auth/login")
    @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="Employee email/password login",tags={"Employee authentication"})
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
    @PostMapping({"/api/v1/auth/logout","/api/portal/v1/auth/logout"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authentication.logout(session().subject());audit.record(request,"auth:logout",null,null,"ALLOW");
        return ResponseEntity.noContent().header("Set-Cookie",expiredCookie()).build();
    }
    @PostMapping({"/api/v1/auth/change-password","/api/portal/v1/auth/change-password"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> change(@RequestBody PasswordChange input,HttpServletRequest request) {
        try {
            authentication.changePassword(session().subject(),ResourceAccess.currentUser(),input.currentPassword(),input.newPassword());
            audit.record(request,"auth:change-password",null,null,"ALLOW");return ResponseEntity.noContent().header("Set-Cookie",expiredCookie()).build();
        } catch(RuntimeException failure) {audit.record(request,"auth:change-password",null,null,"DENY");throw failure;}
    }
    private String expiredCookie() {
        boolean portal=ResourceAccess.currentUser().realm()==AccessSnapshot.Realm.CUSTOMER;
        String name=(cookieSecure?"__Host-":"")+"htt-"+(portal?"portal":"staff")+"-refresh";
        return org.springframework.http.ResponseCookie.from(name,"").httpOnly(true).secure(cookieSecure).sameSite("Strict")
                .path(cookieSecure?"/":portal?"/api/portal/v1/auth":"/api/v1/auth").maxAge(0).build().toString();
    }
    private static VerifiedToken session() {
        Object details=SecurityContextHolder.getContext().getAuthentication().getDetails();
        if(!(details instanceof VerifiedToken token)||!LocalAuthentication.SESSION_ISSUER.equals(token.issuer()))
            throw new org.springframework.security.access.AccessDeniedException("Local session required");
        return token;
    }
}
