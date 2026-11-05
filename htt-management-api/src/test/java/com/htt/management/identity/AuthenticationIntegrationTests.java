package com.htt.management.identity;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import static com.htt.management.identity.AccessSnapshot.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real RSA signatures, JWT validation, HTTP filters and method security; storage is replaced with controlled fixtures. */
@SpringBootTest(properties = {
        "htt.auth.enabled=true",
        "htt.auth.staff.issuer=https://staff.example.invalid", "htt.auth.staff.audience=staff-api",
        "htt.auth.staff.jwk-set-uri=https://staff.example.invalid/jwks", "htt.auth.staff.mode=OIDC",
        "htt.auth.portal.issuer=https://portal.example.invalid", "htt.auth.portal.audience=portal-api",
        "htt.auth.portal.jwk-set-uri=https://portal.example.invalid/jwks", "htt.auth.portal.mode=OIDC"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Import(AuthenticationIntegrationTests.ProtectedResources.class)
class AuthenticationIntegrationTests {
    private static final UUID ACTOR = UUID.randomUUID();
    private static final UUID COMPANY = UUID.randomUUID();
    private static final UUID OTHER_COMPANY = UUID.randomUUID();
    private static final UUID CUSTOMER = UUID.randomUUID();
    private static final UUID OTHER_CUSTOMER = UUID.randomUUID();
    private static final UUID BRANCH = UUID.randomUUID();
    private static final UUID OTHER_BRANCH = UUID.randomUUID();
    private static final UUID FOREIGN_BRANCH = UUID.randomUUID();
    private static final UUID OTHER_CUSTOMER_BRANCH = UUID.randomUUID();
    private static final UUID ORDER = UUID.randomUUID();
    private static final UUID OTHER_ORDER = UUID.randomUUID();
    private static final UUID GRANT = UUID.randomUUID();
    private static final KeyPair KEY = keyPair();
    @Autowired MockMvc mvc;
    @Autowired AuthenticationProperties properties;
    @MockitoBean AccessRepository repository;
    @MockitoBean AccessAudit audit;
    @MockitoBean(name = "staffJwtDecoder") JwtDecoder staff;
    @MockitoBean(name = "portalJwtDecoder") JwtDecoder portal;

    @BeforeEach
    void setUp() {
        delegateToRealDecoder(staff, properties.staff());
        delegateToRealDecoder(portal, properties.portal());
        when(repository.findResource(ResourceKind.CUSTOMER, CUSTOMER)).thenReturn(new ResourceOwner(COMPANY, CUSTOMER, null));
        when(repository.findResource(ResourceKind.CUSTOMER, OTHER_CUSTOMER)).thenReturn(new ResourceOwner(COMPANY, OTHER_CUSTOMER, null));
        when(repository.findResource(ResourceKind.BRANCH, BRANCH)).thenReturn(new ResourceOwner(COMPANY, CUSTOMER, BRANCH));
        when(repository.findResource(ResourceKind.BRANCH, OTHER_BRANCH)).thenReturn(new ResourceOwner(COMPANY, CUSTOMER, OTHER_BRANCH));
        when(repository.findResource(ResourceKind.BRANCH, FOREIGN_BRANCH)).thenReturn(new ResourceOwner(OTHER_COMPANY, OTHER_CUSTOMER, FOREIGN_BRANCH));
        when(repository.findResource(ResourceKind.BRANCH, OTHER_CUSTOMER_BRANCH)).thenReturn(new ResourceOwner(COMPANY, OTHER_CUSTOMER, OTHER_CUSTOMER_BRANCH));
        when(repository.findResource(ResourceKind.ORDER, ORDER)).thenReturn(new ResourceOwner(COMPANY, CUSTOMER, BRANCH));
        when(repository.findResource(ResourceKind.ORDER, OTHER_ORDER)).thenReturn(new ResourceOwner(COMPANY, CUSTOMER, OTHER_BRANCH));
        identity(Realm.STAFF, MemberKind.MANAGEMENT, Set.of("customer:read", "branch:read", "order:read", "order:create"));
        identity(Realm.CUSTOMER, MemberKind.CUSTOMER, Set.of("customer:read", "branch:read", "order:read", "order:create"));
    }

    @Test
    void anonymousRequestIs401WithUniformErrorAndAudit() throws Exception {
        mvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"))
                .andExpect(jsonPath("$.requestId").isNotEmpty()).andExpect(header().string("WWW-Authenticate", "Bearer"));
        verify(audit).record(any(), eq("authentication"), isNull(), isNull(), eq("DENY"));
    }

    @ParameterizedTest
    @EnumSource(value = MemberKind.class, names = {"CUSTOMER", "SALES", "UNCLASSIFIED", "OPERATIONS"})
    void nonManagersCannotCreateEvenWithPermissionAndAdminRole(MemberKind kind) throws Exception {
        identity(Realm.STAFF, kind, Set.of("order:create"));
        mvc.perform(createOrder(staffToken(), BRANCH)).andExpect(status().isForbidden());
        mvc.perform(convertQuote(staffToken())).andExpect(status().isForbidden());
    }

    @Test
    void managerNeedsExplicitPermissionAndOwnedCustomerBranch() throws Exception {
        String token = staffToken();
        mvc.perform(createOrder(token, BRANCH)).andExpect(status().isOk());
        mvc.perform(convertQuote(token)).andExpect(status().isOk());
        mvc.perform(createOrder(token, OTHER_BRANCH)).andExpect(status().isForbidden());
        mvc.perform(createOrder(token, FOREIGN_BRANCH)).andExpect(status().isForbidden());
        mvc.perform(createOrder(token, OTHER_CUSTOMER_BRANCH)).andExpect(status().isForbidden());
        identity(Realm.STAFF, MemberKind.MANAGEMENT, Set.of("sales.orders.create"));
        mvc.perform(createOrder(token, BRANCH)).andExpect(status().isForbidden());
        verify(audit, atLeastOnce()).record(any(), eq("order:create"), eq(COMPANY), eq(BRANCH), eq("ALLOW"));
    }

    @Test
    void customerScopeAndPortalGrantAreEnforced() throws Exception {
        String token = token(Realm.CUSTOMER);
        mvc.perform(portalGet("customers/" + CUSTOMER, token, GRANT)).andExpect(status().isOk());
        mvc.perform(portalGet("customers/" + OTHER_CUSTOMER, token, GRANT)).andExpect(status().isForbidden());
        mvc.perform(portalGet("branches/" + BRANCH, token, GRANT)).andExpect(status().isOk());
        mvc.perform(portalGet("branches/" + OTHER_BRANCH, token, GRANT)).andExpect(status().isForbidden());
        mvc.perform(portalGet("orders/" + ORDER, token, GRANT)).andExpect(status().isOk());
        mvc.perform(portalGet("orders/" + OTHER_ORDER, token, GRANT)).andExpect(status().isForbidden());
        mvc.perform(portalGet("branches/" + BRANCH, token, UUID.randomUUID())).andExpect(status().isForbidden());
        mvc.perform(get("/api/portal/v1/branches/" + BRANCH).header("Authorization", "Bearer " + token)
                .header("X-Company-Id", COMPANY)).andExpect(status().isForbidden());
        mvc.perform(post("/api/portal/v1/sales-orders").header("Authorization", "Bearer " + token)
                .header("X-Company-Id", COMPANY).header("X-Portal-Grant-Id", GRANT)
                .contentType("application/json").content(orderBody(BRANCH))).andExpect(status().isForbidden());
    }

    @Test
    void salesCannotReadAnotherCustomerBranchOrCompany() throws Exception {
        identity(Realm.STAFF, MemberKind.SALES, Set.of("customer:read", "branch:read", "order:read"));
        String token = staffToken();
        mvc.perform(staffGet("customers/" + CUSTOMER, token)).andExpect(status().isOk());
        mvc.perform(staffGet("customers/" + OTHER_CUSTOMER, token)).andExpect(status().isForbidden());
        mvc.perform(staffGet("branches/" + OTHER_BRANCH, token)).andExpect(status().isForbidden());
        mvc.perform(staffGet("branches/" + FOREIGN_BRANCH, token)).andExpect(status().isForbidden());
        mvc.perform(staffGet("orders/" + OTHER_ORDER, token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/branches/" + BRANCH).header("Authorization", "Bearer " + token)
                .header("X-Company-Id", OTHER_COMPANY)).andExpect(status().isForbidden());
    }

    @Test
    void disabledUserRevocationAndScopeChangesApplyToSameTokenOnNextRequest() throws Exception {
        String token = staffToken();
        mvc.perform(createOrder(token, BRANCH)).andExpect(status().isOk());
        identity(Realm.STAFF, MemberKind.MANAGEMENT, Set.of());
        mvc.perform(createOrder(token, BRANCH)).andExpect(status().isForbidden());
        when(repository.resolve(properties.staff().issuer(), "subject", Realm.STAFF)).thenReturn(null);
        mvc.perform(staffGet("me", token)).andExpect(status().isUnauthorized());
        AccessSnapshot original = snapshot(MemberKind.MANAGEMENT, Set.of("order:create"));
        when(repository.resolve(properties.staff().issuer(), "subject", Realm.STAFF)).thenReturn(
                new AccessSnapshot(ACTOR, "Test", Instant.now().plusSeconds(1), original.companies()));
        mvc.perform(staffGet("me", token)).andExpect(status().isUnauthorized());
        var member = original.companies().getFirst();
        when(repository.resolve(properties.staff().issuer(), "subject", Realm.STAFF)).thenReturn(new AccessSnapshot(
                ACTOR, "Test", Instant.EPOCH, List.of(new CompanyAccess(COMPANY, "Test", member.membershipId(),
                MemberKind.MANAGEMENT, Set.of(), Set.of("order:create"), List.of()))));
        mvc.perform(createOrder(token, BRANCH)).andExpect(status().isForbidden());
    }

    @Test
    void spoofedIdentityRoleAndClientHeadersDoNotGrantAccess() throws Exception {
        identity(Realm.STAFF, MemberKind.SALES, Set.of("order:create"));
        mvc.perform(createOrder(staffToken(), BRANCH).header("X-Role", "ADMIN")
                .header("X-Client", "htt-management").header("X-User-Id", ACTOR)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/sales-orders").header("X-Role", "ADMIN")
                .contentType("application/json").content(orderBody(BRANCH))).andExpect(status().isUnauthorized());
    }

    @Test
    void meResponseKeepsExistingEmployeeAndPortalSelectionContracts() throws Exception {
        mvc.perform(staffGet("me", staffToken())).andExpect(status().isOk())
                .andExpect(jsonPath("$.companies[0].actorId").value(ACTOR.toString()))
                .andExpect(jsonPath("$.companies[0].companyId").value(COMPANY.toString()))
                .andExpect(jsonPath("$.companies[0].membershipId").isNotEmpty());
        mvc.perform(get("/api/portal/v1/me").header("Authorization", "Bearer " + token(Realm.CUSTOMER)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.contexts[0].grantId").value(GRANT.toString()))
                .andExpect(jsonPath("$.contexts[0].customerId").value(CUSTOMER.toString()))
                .andExpect(jsonPath("$.dataAsOf").isNotEmpty())
                .andExpect(jsonPath("$.contexts[0].dataAsOf").doesNotExist());
    }

    @Test
    void rejectsWrongAudienceIssuerSignatureExpiredTokenAndCrossRealmTokens() throws Exception {
        JWTClaimsSet valid = claims(Realm.STAFF).build();
        List<String> invalid = List.of(
                signed(new JWTClaimsSet.Builder(valid).audience("wrong").build(), KEY),
                signed(new JWTClaimsSet.Builder(valid).issuer("https://wrong.example.invalid").build(), KEY),
                signed(new JWTClaimsSet.Builder(valid).expirationTime(Date.from(Instant.now().minusSeconds(120))).build(), KEY),
                signed(new JWTClaimsSet.Builder(valid).claim("token_use", "id").build(), KEY),
                signed(new JWTClaimsSet.Builder(valid).issueTime(null).build(), KEY),
                signed(valid, keyPair()), token(Realm.CUSTOMER));
        for (String token : invalid) mvc.perform(staffGet("me", token)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/portal/v1/me").header("Authorization", "Bearer " + staffToken())).andExpect(status().isUnauthorized());
        verifyNoInteractions(repository);
    }

    @Test
    void cognitoRequiresAccessTokenAndMatchingClientId() throws Exception {
        var cognito = new AuthenticationProperties.Provider(properties.staff().issuer(), "staff-api",
                properties.staff().jwkSetUri(), AuthenticationProperties.Mode.COGNITO);
        delegateToRealDecoder(staff, cognito);
        String valid = signed(claims(Realm.STAFF).audience(List.of()).claim("client_id", "staff-api")
                .claim("token_use", "access").build(), KEY);
        mvc.perform(staffGet("me", valid)).andExpect(status().isOk());
        mvc.perform(staffGet("me", signed(claims(Realm.STAFF).claim("client_id", "staff-api")
                .claim("token_use", "id").build(), KEY))).andExpect(status().isUnauthorized());
    }

    @Test
    void missingMethodPolicyIsDeniedAndStorageFailureIs503() throws Exception {
        String token = staffToken();
        mvc.perform(staffGet("unguarded", token)).andExpect(status().isForbidden());
        when(repository.resolve(anyString(), anyString(), any())).thenThrow(new DataAccessResourceFailureException("test outage"));
        mvc.perform(staffGet("me", token)).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SERVICE_UNAVAILABLE"));
    }

    @Test
    void auditFailureMustPreventOrderAction() throws Exception {
        doThrow(new DataAccessResourceFailureException("test outage")).when(audit)
                .record(any(), eq("order:create"), any(), any(), anyString());
        mvc.perform(createOrder(staffToken(), BRANCH)).andExpect(status().isServiceUnavailable());
    }

    @Test
    void keyProviderOutageFailsClosedWith503() throws Exception {
        doThrow(new org.springframework.security.oauth2.jwt.JwtException("test JWKS outage"))
                .when(staff).decode(anyString());
        mvc.perform(staffGet("me", staffToken())).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SERVICE_UNAVAILABLE"));
        verifyNoInteractions(repository);
    }

    @Test
    void companyWideGrantIsExplicitAndCannotBroadenPortalAccess() throws Exception {
        Grant companyGrant = new Grant(GRANT, 1, Scope.COMPANY, null, null, null, Set.of());
        CompanyAccess member = new CompanyAccess(COMPANY, "Company", UUID.randomUUID(), MemberKind.MANAGEMENT,
                Set.of(), Set.of("branch:read", "order:create"), List.of(companyGrant));
        AccessSnapshot access = new AccessSnapshot(ACTOR, "Test", Instant.EPOCH, List.of(member));
        when(repository.resolve(properties.staff().issuer(), "subject", Realm.STAFF)).thenReturn(access);
        mvc.perform(createOrder(staffToken(), OTHER_BRANCH)).andExpect(status().isOk());
        mvc.perform(createOrder(staffToken(), FOREIGN_BRANCH)).andExpect(status().isForbidden());
        // Defense in depth even if a storage fixture accidentally returns a company-wide portal grant.
        when(repository.resolve(properties.portal().issuer(), "subject", Realm.CUSTOMER)).thenReturn(access);
        mvc.perform(portalGet("branches/" + BRANCH, token(Realm.CUSTOMER), GRANT)).andExpect(status().isForbidden());
    }

    private void identity(Realm realm, MemberKind kind, Set<String> permissions) {
        String issuer = realm == Realm.STAFF ? properties.staff().issuer() : properties.portal().issuer();
        when(repository.resolve(issuer, "subject", realm)).thenReturn(snapshot(kind, permissions));
    }

    private static AccessSnapshot snapshot(MemberKind kind, Set<String> permissions) {
        Grant grant = new Grant(GRANT, 1, Scope.BRANCH, CUSTOMER, "C001", "Customer", Set.of(BRANCH));
        return new AccessSnapshot(ACTOR, "Test", Instant.EPOCH, List.of(new CompanyAccess(COMPANY, "Company",
                UUID.randomUUID(), kind, Set.of("ADMIN", "SALES"), permissions, List.of(grant))));
    }

    private void delegateToRealDecoder(JwtDecoder mock, AuthenticationProperties.Provider provider) {
        NimbusJwtDecoder real = NimbusJwtDecoder.withPublicKey((RSAPublicKey) KEY.getPublic()).build();
        real.setJwtValidator(IdentityConfiguration.validators(provider));
        doAnswer(invocation -> real.decode(invocation.getArgument(0))).when(mock).decode(anyString());
    }

    private JWTClaimsSet.Builder claims(Realm realm) {
        var provider = realm == Realm.STAFF ? properties.staff() : properties.portal();
        return new JWTClaimsSet.Builder().issuer(provider.issuer()).subject("subject").audience(provider.audience())
                .issueTime(Date.from(Instant.now().minusSeconds(1))).expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .claim("roles", List.of("ADMIN")).claim("scope", "order:create");
    }

    private String staffToken() throws Exception { return token(Realm.STAFF); }
    private String token(Realm realm) throws Exception { return signed(claims(realm).build(), KEY); }
    private static String signed(JWTClaimsSet claims, KeyPair key) throws Exception {
        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
        jwt.sign(new RSASSASigner((RSAPrivateKey) key.getPrivate()));
        return jwt.serialize();
    }

    private static KeyPair keyPair() {
        try { var generator = KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); return generator.generateKeyPair(); }
        catch (java.security.GeneralSecurityException exception) { throw new IllegalStateException(exception); }
    }

    private static MockHttpServletRequestBuilder staffGet(String path, String token) {
        return get("/api/v1/" + path).header("Authorization", "Bearer " + token).header("X-Company-Id", COMPANY);
    }
    private static MockHttpServletRequestBuilder portalGet(String path, String token, UUID grant) {
        return get("/api/portal/v1/" + path).header("Authorization", "Bearer " + token)
                .header("X-Company-Id", COMPANY).header("X-Portal-Grant-Id", grant);
    }
    private static MockHttpServletRequestBuilder createOrder(String token, UUID branch) {
        return post("/api/v1/sales-orders").header("Authorization", "Bearer " + token).header("X-Company-Id", COMPANY)
                .contentType("application/json").content(orderBody(branch));
    }
    private static MockHttpServletRequestBuilder convertQuote(String token) {
        return post("/api/v1/quotes/" + UUID.randomUUID() + "/approve-and-convert")
                .header("Authorization", "Bearer " + token).header("X-Company-Id", COMPANY)
                .contentType("application/json").content(orderBody(BRANCH));
    }
    private static String orderBody(UUID branch) { return "{\"customerId\":\"" + CUSTOMER + "\",\"branchId\":\"" + branch + "\"}"; }

    /** Test-only handlers exercise the same gate for direct creation and quote conversion. No production order API is added. */
    @RestController
    static class ProtectedResources {
        record OrderRequest(UUID customerId, UUID branchId) {}
        @GetMapping({"/api/v1/customers/{id}", "/api/portal/v1/customers/{id}"})
        @PreAuthorize("@resourceAccess.canReadCustomer(#id)")
        String customer(@PathVariable UUID id) { return "authorized"; }
        @GetMapping({"/api/v1/branches/{id}", "/api/portal/v1/branches/{id}"})
        @PreAuthorize("@resourceAccess.canReadBranch(#id)")
        String branch(@PathVariable UUID id) { return "authorized"; }
        @GetMapping({"/api/v1/orders/{id}", "/api/portal/v1/orders/{id}"})
        @PreAuthorize("@resourceAccess.canReadOrder(#id)")
        String order(@PathVariable UUID id) { return "authorized"; }
        @PostMapping({"/api/v1/sales-orders", "/api/v1/quotes/{id}/approve-and-convert", "/api/portal/v1/sales-orders"})
        @PreAuthorize("@resourceAccess.canCreateOrder(#body.customerId(), #body.branchId())")
        String create(@RequestBody OrderRequest body) { return "authorized; no order persisted"; }
        @GetMapping("/api/v1/unguarded")
        String unguarded() { return "must never be reached"; }
    }
}
