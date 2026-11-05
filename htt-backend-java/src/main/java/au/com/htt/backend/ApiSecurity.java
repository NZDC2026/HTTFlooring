package au.com.htt.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
class ApiSecurity {
    @Bean
    SecurityFilterChain apiSecurityFilterChain(
            HttpSecurity http,
            @Value("${htt.staff.authority:}") String authority,
            @Value("${htt.staff.audience:}") String audience,
            @Value("${htt.staff.mode:Oidc}") String mode,
            @Value("${htt.staff.database.url:}") String databaseUrl) throws Exception {
        boolean staffConfigured = !authority.isBlank() || !audience.isBlank();
        if (staffConfigured) {
            var decoder = StaffJwt.decoder(authority, audience, mode);
            http.oauth2ResourceServer(server -> server.jwt(jwt -> jwt.decoder(decoder)));
        }
        return http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/crm/collaboration", "/api/v1/documents/*/attachments", "/api/v1/customers", "/api/v1/customers/*/status", "/api/v1/products", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices"))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> {
                    requests.requestMatchers(HttpMethod.GET, "/health/live", "/health/ready").permitAll();
                    if (staffConfigured && !databaseUrl.isBlank()) {
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/me", "/api/v1/crm/map/branches",
                                "/api/v1/accounting/accounts", "/api/v1/accounting/tax-rates", "/api/v1/audit",
                                "/api/v1/sales-orders/*/invoiceable", "/api/v1/sales-invoices", "/api/v1/sales-invoices/*",
                                "/api/v1/inventory/availability", "/api/v1/quotes", "/api/v1/quotes/*", "/api/v1/sales-orders", "/api/v1/sales-orders/*", "/api/v1/customers/*/credit",
                                "/api/v1/pricing/resolve", "/api/v1/foundation", "/api/v1/customers", "/api/v1/products", "/api/v1/products/*/units").authenticated();
                        requests.requestMatchers(HttpMethod.PATCH, "/api/v1/customers/*/status").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers", "/api/v1/products", "/api/v1/crm/collaboration", "/api/v1/documents/*/attachments").authenticated();
                    }
                    requests.anyRequest().denyAll();
                }).build();
    }
}
