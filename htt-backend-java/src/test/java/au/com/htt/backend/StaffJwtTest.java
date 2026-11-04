package au.com.htt.backend;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThat;

class StaffJwtTest {
    private static final String ISSUER = "https://identity.example.test/staff";

    @Test
    void checksIssuerAudienceAndExpiryInOidcMode() {
        var validator = StaffJwt.validator(ISSUER, "staff", "Oidc");
        assertThat(validator.validate(token().audience(List.of("staff")).build()).hasErrors()).isFalse();
        assertThat(validator.validate(token().audience(List.of("portal")).build()).hasErrors()).isTrue();
        assertThat(validator.validate(token().issuer("https://other.example.test")
                .audience(List.of("staff")).build()).hasErrors()).isTrue();
        var expired = token().issuedAt(Instant.now().minusSeconds(600))
                .expiresAt(Instant.now().minusSeconds(60)).audience(List.of("staff")).build();
        assertThat(validator.validate(expired).hasErrors()).isTrue();
    }

    @Test
    void requiresCognitoAccessTokenAndStaffClient() {
        var validator = StaffJwt.validator(ISSUER, "staff", "Cognito");
        assertThat(validator.validate(token().claim("token_use", "access")
                .claim("client_id", "staff").build()).hasErrors()).isFalse();
        assertThat(validator.validate(token().claim("token_use", "id")
                .claim("client_id", "staff").audience(List.of("staff")).build()).hasErrors()).isTrue();
        assertThat(validator.validate(token().claim("token_use", "access")
                .claim("client_id", "portal").build()).hasErrors()).isTrue();
    }

    private Jwt.Builder token() {
        var now = Instant.now();
        return Jwt.withTokenValue("synthetic").header("alg", "RS256").issuer(ISSUER)
                .subject("employee").issuedAt(now.minusSeconds(60)).expiresAt(now.plusSeconds(300));
    }
}
