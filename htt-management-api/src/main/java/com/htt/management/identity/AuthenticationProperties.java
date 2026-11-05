package com.htt.management.identity;

import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("htt.auth")
public record AuthenticationProperties(boolean enabled, Provider staff, Provider portal) {
    public enum Mode { OIDC, COGNITO }

    public record Provider(String issuer, String audience, String jwkSetUri, Mode mode) {
        public void validate() {
            if (issuer == null || audience == null || audience.isBlank() || jwkSetUri == null || mode == null) {
                throw new IllegalStateException("Authentication requires explicit issuer, audience, JWKS URI and mode.");
            }
            for (String value : new String[] {issuer, jwkSetUri}) {
                URI uri = URI.create(value);
                if (!"https".equals(uri.getScheme()) || uri.getHost() == null || uri.getUserInfo() != null
                        || uri.getFragment() != null || uri.getQuery() != null) {
                    throw new IllegalStateException("Trusted identity endpoints must be explicit HTTPS URLs.");
                }
            }
        }
    }
}
