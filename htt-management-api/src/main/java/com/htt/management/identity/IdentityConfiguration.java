package com.htt.management.identity;

import com.htt.management.platform.web.ApiErrorWriter;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.transaction.TransactionException;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "htt.auth.enabled", havingValue = "true")
@EnableConfigurationProperties(AuthenticationProperties.class)
public class IdentityConfiguration {
    @Bean
    AccessRepository accessRepository(JdbcTemplate jdbc, ObjectMapper json) { return new AccessRepository(jdbc, json); }

    @Bean
    AccessAudit accessAudit(JdbcTemplate jdbc) { return new AccessAudit(jdbc); }

    @Bean
    ResourceAccess resourceAccess(AccessRepository repository, AccessAudit audit) { return new ResourceAccess(repository, audit); }

    @Bean
    @ConditionalOnProperty(name = "htt.portal.branches-enabled", havingValue = "true")
    CustomerBranchAccess customerBranchAccess(AccessRepository repository, AccessAudit audit) {
        return new CustomerBranchAccess(repository, audit);
    }

    @Bean("staffJwtDecoder")
    @ConditionalOnMissingBean(name = "staffJwtDecoder")
    JwtDecoder staffJwtDecoder(AuthenticationProperties properties) { return decoder(properties.staff()); }

    @Bean("portalJwtDecoder")
    @ConditionalOnMissingBean(name = "portalJwtDecoder")
    JwtDecoder portalJwtDecoder(AuthenticationProperties properties) { return decoder(properties.portal()); }

    private static JwtDecoder decoder(AuthenticationProperties.Provider provider) {
        if (provider == null) throw new IllegalStateException("Both staff and portal identity providers must be configured.");
        provider.validate();
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(provider.jwkSetUri())
                .jwsAlgorithm(SignatureAlgorithm.RS256).build();
        decoder.setJwtValidator(validators(provider));
        return decoder;
    }

    static OAuth2TokenValidator<Jwt> validators(AuthenticationProperties.Provider provider) {
        OAuth2TokenValidator<Jwt> claims = jwt -> {
            boolean audience = provider.mode() == AuthenticationProperties.Mode.COGNITO
                    ? "access".equals(jwt.getClaimAsString("token_use"))
                        && provider.audience().equals(jwt.getClaimAsString("client_id"))
                    : jwt.getAudience().contains(provider.audience()) && !"id".equals(jwt.getClaimAsString("token_use"));
            boolean valid = audience && jwt.getSubject() != null && !jwt.getSubject().isBlank()
                    && jwt.getExpiresAt() != null && jwt.getIssuedAt() != null
                    && !jwt.getIssuedAt().isAfter(Instant.now().plusSeconds(30));
            return valid ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Token claims are invalid.", null));
        };
        return new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator(Duration.ofSeconds(30)),
                new JwtIssuerValidator(provider.issuer()), claims);
    }

    @Bean
    AuthenticationManagerResolver<HttpServletRequest> identityManagers(AuthenticationProperties properties,
            @Qualifier("staffJwtDecoder") JwtDecoder staffDecoder,
            @Qualifier("portalJwtDecoder") JwtDecoder portalDecoder, AccessRepository repository) {
        properties.staff().validate();
        properties.portal().validate();
        if (properties.staff().audience().equals(properties.portal().audience())) {
            throw new IllegalStateException("Staff and portal audiences must be distinct.");
        }
        AuthenticationManager staff = manager(staffDecoder, repository, AccessSnapshot.Realm.STAFF);
        AuthenticationManager portal = manager(portalDecoder, repository, AccessSnapshot.Realm.CUSTOMER);
        // Path selects the accepted token audience only. Database identity binding establishes the realm.
        return request -> request.getRequestURI().substring(request.getContextPath().length())
                .startsWith("/api/portal/") ? portal : staff;
    }

    private static AuthenticationManager manager(JwtDecoder decoder, AccessRepository repository, AccessSnapshot.Realm realm) {
        JwtAuthenticationProvider provider = new JwtAuthenticationProvider(decoder);
        provider.setJwtAuthenticationConverter(jwt -> {
            AccessSnapshot access;
            try { access = repository.resolve(jwt.getIssuer().toString(), jwt.getSubject(), realm); }
            catch (DataAccessException exception) {
                // Resource-server failure handling can serialize this without leaking a storage exception.
                throw new OAuth2AuthenticationException(new OAuth2Error("temporarily_unavailable"), exception);
            }
            if (access == null || jwt.getIssuedAt().isBefore(access.tokensValidAfter())) {
                throw new BadCredentialsException("Identity is unavailable or token has been revoked.");
            }
            // Ignore JWT role/scope claims. Action permissions come from current company membership.
            var authentication = UsernamePasswordAuthenticationToken.authenticated(new VerifiedUser(access, realm), null, List.of());
            authentication.setDetails(new VerifiedToken(jwt.getIssuer().toString(), jwt.getSubject(), jwt.getIssuedAt(), jwt.getExpiresAt()));
            return authentication;
        });
        return authentication -> {
            try { return provider.authenticate(authentication); }
            catch (AuthenticationServiceException exception) {
                throw new OAuth2AuthenticationException(new OAuth2Error("temporarily_unavailable"), exception);
            }
        };
    }

    @Bean("identityEntryPoint")
    AuthenticationEntryPoint identityEntryPoint(ApiErrorWriter errors, AccessAudit audit) {
        return (request, response, exception) -> {
            boolean unavailable = exception instanceof OAuth2AuthenticationException oauth
                    && "temporarily_unavailable".equals(oauth.getError().getErrorCode());
            try { audit.record(request, "authentication", null, null, "DENY"); }
            catch (DataAccessException | TransactionException failure) { unavailable = true; }
            if (!unavailable) response.setHeader("WWW-Authenticate", "Bearer");
            errors.write(request, response, unavailable ? 503 : 401,
                    unavailable ? "SERVICE_UNAVAILABLE" : "AUTHENTICATION_REQUIRED",
                    unavailable ? "Authentication is temporarily unavailable." : "Authentication is required.");
        };
    }

    @Bean("identityDeniedHandler")
    AccessDeniedHandler identityDeniedHandler(ApiErrorWriter errors, AccessAudit audit) {
        return (request, response, exception) -> {
            boolean unavailable = false;
            try { audit.record(request, "http:access", null, null, "DENY"); }
            catch (DataAccessException | TransactionException failure) { unavailable = true; }
            errors.write(request, response, unavailable ? 503 : 403,
                    unavailable ? "SERVICE_UNAVAILABLE" : "ACCESS_DENIED",
                    unavailable ? "Authorization is temporarily unavailable." : "Access is denied.");
        };
    }
}
