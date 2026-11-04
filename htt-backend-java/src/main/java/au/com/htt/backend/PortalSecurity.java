package au.com.htt.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
class PortalSecurity {
    @Bean
    @Order(1)
    SecurityFilterChain portalChain(HttpSecurity http,
            @Value("${htt.portal.authority:}") String authority,
            @Value("${htt.portal.audience:}") String audience,
            @Value("${htt.portal.mode:Oidc}") String mode,
            @Value("${htt.portal.database.url:}") String databaseUrl,
            @Value("${htt.staff.audience:}") String staffAudience) throws Exception {
        boolean configured = !authority.isBlank() || !audience.isBlank();
        if (configured) {
            if (audience.equals(staffAudience) || databaseUrl.isBlank()) {
                throw new IllegalArgumentException("Portal requires a distinct audience and a dedicated database login");
            }
            var decoder = StaffJwt.decoder(authority, audience, mode);
            http.oauth2ResourceServer(server -> server.jwt(jwt -> jwt.decoder(decoder)));
        }
        return http.securityMatcher("/api/portal/v1/**")
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> {
                    if (configured) {
                        requests.requestMatchers(HttpMethod.GET, "/api/portal/v1/**").authenticated();
                    }
                    requests.anyRequest().denyAll();
                }).build();
    }
}
