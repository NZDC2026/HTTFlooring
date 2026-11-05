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
        return http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/crm/collaboration", "/api/v1/documents/*/attachments", "/api/v1/customers", "/api/v1/customers/*/status", "/api/v1/products", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers/*/receipts", "/api/v1/warehouse/picks/*/cancel", "/api/v1/warehouse/picks/*/confirm", "/api/v1/warehouse/orders/*/picks", "/api/v1/purchase-orders", "/api/v1/purchase-orders/*", "/api/v1/purchase-orders/*/confirm", "/api/v1/purchase-orders/*/close", "/api/v1/purchase-orders/*/receipts", "/api/v1/supplier-bills", "/api/v1/supplier-bills/with-variance", "/api/v1/suppliers/*/payments", "/api/v1/supplier-advances/*/apply",
                        "/api/v1/supplier-payments/*/reverse", "/api/v1/supplier-advance-applications/*/unapply", "/api/v1/supplier-payments/*/reallocate",
                        "/api/v1/supplier-payment-reversals/*/reapply"))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> {
                    requests.requestMatchers(HttpMethod.GET, "/health/live", "/health/ready").permitAll();
                    if (staffConfigured && !databaseUrl.isBlank()) {
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/me", "/api/v1/crm/map/branches",
                                "/api/v1/accounting/accounts", "/api/v1/accounting/tax-rates", "/api/v1/audit",
                                "/api/v1/sales-orders/*/invoiceable", "/api/v1/customers/*/receipts", "/api/v1/receipt-reversals/*", "/api/v1/advance-unapplications/*", "/api/v1/advance-applications/*", "/api/v1/customer-receipts/*", "/api/v1/customers/*/receivables", "/api/v1/sales-invoices/*/gst",
                                "/api/v1/sales-invoices", "/api/v1/sales-invoices/*",
                                "/api/v1/warehouse/picks/*", "/api/v1/warehouse/orders", "/api/v1/warehouse/orders/*", "/api/v1/supplier-advance-applications/*", "/api/v1/supplier-payment-reversals/*",
                                "/api/v1/supplier-advance-unapplications/*", "/api/v1/accounting/ap", "/api/v1/suppliers/*/payments", "/api/v1/supplier-payments/*", "/api/v1/supplier-bills", "/api/v1/supplier-bills/*", "/api/v1/purchase-orders", "/api/v1/purchase-orders/*", "/api/v1/purchase-receipts/*",
                                "/api/v1/accounting/grni/unmatched", "/api/v1/accounting/purchase-gst", "/api/v1/accounting/purchase-gst-attributions", "/api/v1/accounting/grni/receipts/*", "/api/v1/inventory/availability", "/api/v1/quotes", "/api/v1/quotes/*", "/api/v1/sales-orders", "/api/v1/sales-orders/*", "/api/v1/customers/*/credit",
                                "/api/v1/pricing/resolve", "/api/v1/foundation", "/api/v1/customers", "/api/v1/products", "/api/v1/products/*/units").authenticated();
                        requests.requestMatchers(HttpMethod.PATCH, "/api/v1/customers/*/status").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/purchase-orders/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/supplier-payments/*/reallocate", "/api/v1/supplier-payment-reversals/*/reapply",
                                "/api/v1/supplier-advances/*/apply", "/api/v1/supplier-payments/*/reverse",
                                "/api/v1/supplier-advance-applications/*/unapply", "/api/v1/suppliers/*/payments", "/api/v1/supplier-bills", "/api/v1/supplier-bills/with-variance", "/api/v1/purchase-orders",
                                "/api/v1/purchase-orders/*/confirm", "/api/v1/purchase-orders/*/close",
                                "/api/v1/purchase-orders/*/receipts").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/customer-receipts/*/reverse", "/api/v1/advance-applications/*/unapply", "/api/v1/customer-advances/*/apply", "/api/v1/quotes/*/return-to-draft", "/api/v1/warehouse/orders/*/picks", "/api/v1/warehouse/picks/*/cancel", "/api/v1/warehouse/picks/*/confirm", "/api/v1/customers/*/receipts", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers", "/api/v1/products", "/api/v1/crm/collaboration", "/api/v1/documents/*/attachments").authenticated();
                    }
                    requests.anyRequest().denyAll();
                }).build();
    }
}
