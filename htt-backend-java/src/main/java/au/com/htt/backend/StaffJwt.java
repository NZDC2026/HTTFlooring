package au.com.htt.backend;

import java.net.URI;
import java.time.Duration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.SupplierJwtDecoder;

final class StaffJwt {
    private StaffJwt() {}

    static JwtDecoder decoder(String authority, String audience, String mode) {
        var issuer = URI.create(authority);
        if (!"https".equalsIgnoreCase(issuer.getScheme()) || issuer.getHost() == null
                || issuer.getUserInfo() != null || issuer.getQuery() != null || issuer.getFragment() != null
                || audience.isBlank()) {
            throw new IllegalArgumentException("Staff JWT requires an HTTPS issuer and audience or client ID");
        }
        var validator = validator(authority, audience, mode);
        return new SupplierJwtDecoder(() -> {
            var decoder = NimbusJwtDecoder.withIssuerLocation(authority).build();
            decoder.setJwtValidator(validator);
            return decoder;
        });
    }

    static OAuth2TokenValidator<Jwt> validator(String issuer, String audience, String mode) {
        OAuth2TokenValidator<Jwt> client = switch (mode) {
            case "Oidc" -> token -> result(token.getAudience() != null && token.getAudience().contains(audience));
            case "Cognito" -> token -> result("access".equals(token.getClaims().get("token_use"))
                    && audience.equals(token.getClaims().get("client_id")));
            default -> throw new IllegalArgumentException("Staff JWT mode must be Oidc or Cognito");
        };
        return new DelegatingOAuth2TokenValidator<>(
                new JwtIssuerValidator(issuer),
                new JwtTimestampValidator(Duration.ofSeconds(30)),
                token -> result(token.getExpiresAt() != null),
                client);
    }

    private static OAuth2TokenValidatorResult result(boolean valid) {
        return valid ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
    }
}
