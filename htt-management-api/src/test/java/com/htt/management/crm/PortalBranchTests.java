package com.htt.management.crm;

import com.htt.management.crm.application.CustomerBranches;
import com.htt.management.crm.infrastructure.CustomerBranchRepository;
import com.htt.management.crm.api.PortalBranchRateLimit;
import com.htt.management.identity.*;
import com.htt.management.identity.contract.CustomerBranchScope;
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
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.TransactionSystemException;
import static com.htt.management.identity.AccessSnapshot.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"htt.auth.enabled=true", "htt.portal.branches-enabled=true",
        "htt.auth.staff.issuer=https://staff.example.invalid", "htt.auth.staff.audience=staff-api", "htt.auth.staff.jwk-set-uri=https://staff.example.invalid/certs",
        "htt.auth.portal.issuer=https://portal.example.invalid", "htt.auth.portal.audience=portal-api", "htt.auth.portal.jwk-set-uri=https://portal.example.invalid/certs"})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class PortalBranchTests {
    static final UUID ACTOR=UUID.randomUUID(), COMPANY=UUID.randomUUID(), CUSTOMER=UUID.randomUUID(), GRANT=UUID.randomUUID(), BRANCH=UUID.randomUUID();
    static final String PATH="/api/portal/v1/branches", ISSUER="https://portal.example.invalid";
    static final Instant TIME=Instant.parse("2026-11-07T00:00:00Z");
    static final KeyPair KEY=keyPair();
    final CustomerBranchScope scope=new CustomerBranchScope(ACTOR,COMPANY,GRANT,CUSTOMER,Set.of(BRANCH));
    @Autowired MockMvc mvc;
    @MockitoBean AccessRepository identity;
    @MockitoBean AccessAudit audit;
    @MockitoBean CustomerBranchRepository data;
    @MockitoBean PortalBranchRateLimit limiter;
    @MockitoBean PlatformTransactionManager transactions;
    @MockitoBean(name="portalJwtDecoder") JwtDecoder portal;
    @MockitoBean(name="staffJwtDecoder") JwtDecoder staff;

    @BeforeEach void prepare() {
        when(limiter.allow(anyString(),anyString())).thenReturn(true);
        var decoder=NimbusJwtDecoder.withPublicKey((RSAPublicKey)KEY.getPublic()).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(ISSUER), jwt ->
                jwt.getAudience().contains("portal-api") ? OAuth2TokenValidatorResult.success()
                        : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"))));
        when(portal.decode(anyString())).thenAnswer(invocation -> decoder.decode(invocation.getArgument(0)));
        when(identity.resolve(eq(ISSUER),eq("subject"),eq(Realm.CUSTOMER))).thenReturn(new AccessSnapshot(ACTOR,"Test",Instant.EPOCH,
                List.of(new CompanyAccess(COMPANY,"Test",UUID.randomUUID(),MemberKind.CUSTOMER,Set.of(),Set.of("branch:read"),List.of()))));
        when(identity.customerBranchScope(ACTOR,COMPANY,GRANT)).thenReturn(scope);
        when(transactions.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        when(data.list(scope)).thenReturn(new CustomerBranches(CUSTOMER,GRANT,List.of(new CustomerBranches.Branch(
                BRANCH,"MAIN","Main store","1 Test Street","Sydney","NSW","2000","AU")),TIME));
    }

    @Test void legacySuccessShapeAndReadOnlyTransactionArePreserved() throws Exception {
        mvc.perform(get(PATH).accept("text/plain").header("Authorization","Bearer "+token("portal-api")).header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(content().json("""
                        {"customerId":"%s","grantId":"%s","items":[{"id":"%s","code":"MAIN","name":"Main store",
                         "addressLine1":"1 Test Street","suburb":"Sydney","state":"NSW","postcode":"2000","country":"AU"}],"dataAsOf":"2026-11-07T00:00:00Z"}
                        """.formatted(CUSTOMER,GRANT,BRANCH),org.springframework.test.json.JsonCompareMode.STRICT));
        verify(transactions).getTransaction(argThat(definition -> definition.isReadOnly()
                && definition.getIsolationLevel()==org.springframework.transaction.TransactionDefinition.ISOLATION_REPEATABLE_READ));
        verify(audit).record(any(),eq("branch:read"),eq(COMPANY),eq(GRANT),eq("ALLOW"));
    }

    @ParameterizedTest @ValueSource(strings={"", "not-a-guid", "1-1-1-1-1", "00000000-0000-0000-0000-000000000000", "a,b"})
    void invalidContextKeepsLegacy400(String invalid) throws Exception {
        for (boolean companyInvalid : List.of(true,false)) {
            mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                    .header("X-Company-Id",companyInvalid ? invalid : COMPANY).header("X-Portal-Grant-Id",companyInvalid ? GRANT : invalid))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("portal_context_required"))
                    .andExpect(jsonPath("$.retryable").value(false)).andExpect(jsonPath("$.fieldErrors").isEmpty());
        }
        verifyNoInteractions(data);
    }

    @Test void missingContextKeepsLegacy400() throws Exception {
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("portal_context_required"));
        verifyNoInteractions(data);
    }

    @ParameterizedTest @ValueSource(strings={"D","N","B","P","X"})
    void legacyGuidHeaderFormatsRemainAccepted(String form) throws Exception {
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",guid(COMPANY,form)).header("X-Portal-Grant-Id",guid(GRANT,form)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.grantId").value(GRANT.toString()));
    }

    @Test void anonymousQueryTokenAndWrongAudienceCannotReadBranches() throws Exception {
        mvc.perform(get(PATH)).andExpect(status().isUnauthorized());
        mvc.perform(get(PATH).param("access_token",token("portal-api"))).andExpect(status().isUnauthorized());
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("staff-api")))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(data);
    }

    @Test void foreignGrantOrCompanyHasNoDataAndUsesLegacy403() throws Exception {
        for (boolean companyForeign : List.of(true,false)) {
            mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                    .header("X-Company-Id",companyForeign ? UUID.randomUUID() : COMPANY)
                    .header("X-Portal-Grant-Id",companyForeign ? GRANT : UUID.randomUUID())
                    .header("X-Role","ADMIN").param("customerId",CUSTOMER.toString()))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("scope_denied"));
        }
        verifyNoInteractions(data);
    }

    @Test void emptyExplicitScopeStaysAnEmptyList() throws Exception {
        var empty=new CustomerBranchScope(ACTOR,COMPANY,GRANT,CUSTOMER,Set.of());
        when(identity.customerBranchScope(ACTOR,COMPANY,GRANT)).thenReturn(empty);
        when(data.list(empty)).thenReturn(new CustomerBranches(CUSTOMER,GRANT,List.of(),TIME));
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items").isEmpty());
    }

    @Test void storageFailureIsLegacy503WithoutSqlOrCustomerData() throws Exception {
        when(data.list(scope)).thenThrow(new DataAccessResourceFailureException("SECRET SQL AND CUSTOMER DATA"));
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("database_unavailable"))
                .andExpect(jsonPath("$.retryable").value(true)).andExpect(jsonPath("$.message").value(
                        "The service is temporarily unavailable; check the operation result before retrying."));
    }

    @Test void exhaustedWindowKeepsLegacyEmpty429AndDoesNotReadData() throws Exception {
        when(limiter.allow(ISSUER,"subject")).thenReturn(false);
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isTooManyRequests()).andExpect(content().string(""));
        verifyNoInteractions(data);
    }

    @Test void transactionFailureIs503AndUnexpectedFailureIsLegacy500() throws Exception {
        when(transactions.getTransaction(any())).thenThrow(new TransactionSystemException("test fault"));
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("database_unavailable"));
        doReturn(mock(TransactionStatus.class)).when(transactions).getTransaction(any());
        when(data.list(scope)).thenThrow(new IllegalStateException("test fault"));
        mvc.perform(get(PATH).header("Authorization","Bearer "+token("portal-api"))
                .header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT))
                .andExpect(status().isInternalServerError()).andExpect(jsonPath("$.code").value("internal_error"));
    }

    private static String token(String audience) throws Exception {
        var jwt=new SignedJWT(new JWSHeader(JWSAlgorithm.RS256),new JWTClaimsSet.Builder().issuer(ISSUER).subject("subject")
                .audience(audience).issueTime(Date.from(Instant.now().minusSeconds(1))).expirationTime(Date.from(Instant.now().plusSeconds(300))).build());
        jwt.sign(new RSASSASigner((RSAPrivateKey)KEY.getPrivate()));
        return jwt.serialize();
    }
    private static KeyPair keyPair() {
        try { var generator=KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); return generator.generateKeyPair(); }
        catch (Exception failure) { throw new IllegalStateException(failure); }
    }
    private static String guid(UUID value,String form) {
        String text=value.toString();
        return switch (form) {
            case "N" -> text.replace("-","");
            case "B" -> "{"+text+"}";
            case "P" -> "("+text+")";
            case "X" -> {
                String compact=text.replace("-","");
                var bytes=new java.util.ArrayList<String>();
                for (int i=16;i<32;i+=2) bytes.add("0x"+compact.substring(i,i+2));
                yield "{0x"+compact.substring(0,8)+",0x"+compact.substring(8,12)+",0x"+compact.substring(12,16)+",{"+String.join(",",bytes)+"}}";
            }
            default -> text;
        };
    }
}
