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
            @Value("${htt.staff.database.url:}") String databaseUrl, LegacyRateLimit limiter) throws Exception {
        boolean staffConfigured = !authority.isBlank() || !audience.isBlank();
        if (staffConfigured) {
            var decoder = StaffJwt.decoder(authority, audience, mode);
            http.oauth2ResourceServer(server -> server.jwt(jwt -> jwt.decoder(decoder)));
        }
        return http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/inventory/stock-counts", "/api/v1/inventory/stock-counts/*/submit", "/api/v1/inventory/stock-counts/*/post", "/api/v1/inventory/stock-counts/*/cancel", "/api/v1/inventory/transfers", "/api/v1/inventory/write-offs", "/api/v1/customers/*/contacts", "/api/v1/customers/*/contacts/*", "/api/v1/suppliers/*/contacts", "/api/v1/suppliers/*/contacts/*", "/api/v1/customers/*/branches", "/api/v1/customers/*/branches/*", "/api/v1/customers/*", "/api/v1/suppliers", "/api/v1/suppliers/*", "/api/v1/warehouses", "/api/v1/warehouses/*", "/api/v1/products/*", "/api/v1/products/*/units", "/api/v1/products/*/units/*", "/api/v1/uoms", "/api/v1/uoms/*", "/api/v1/product-categories", "/api/v1/product-categories/*", "/api/v1/regions", "/api/v1/regions/*", "/api/v1/pricing/promotions", "/api/v1/pricing/promotions/*", "/api/v1/pricing/customer-prices", "/api/v1/pricing/customer-prices/*", "/api/v1/pricing/standard-prices", "/api/v1/pricing/standard-prices/*", "/api/v1/pricing/floors", "/api/v1/pricing/floors/*", "/api/v1/quotes/*/approve-and-convert", "/api/v1/sales-orders", "/api/v1/quotes/*", "/api/v1/quotes/*/submit", "/api/v1/quotes", "/api/v1/supplier-bills/*/amount-credits", "/api/v1/supplier-expense-bills", "/api/v1/supplier-expense-bills/*/credits", "/api/v1/supplier-refunds/*/reverse", "/api/v1/supplier-refunds/*/correct", "/api/v1/supplier-refund-reversals/*/correct", "/api/v1/supplier-refunds", "/api/v1/purchase-receipts/*/returns", "/api/v1/supplier-bills/*/credits", "/api/v1/supplier-credits/*/apply", "/api/v1/supplier-credit-applications/*/unapply", "/api/v1/crm/collaboration", "/api/v1/documents/*/attachments", "/api/v1/customers", "/api/v1/customers/*/status", "/api/v1/products", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers/*/receipts", "/api/v1/warehouse/picks/*/cancel", "/api/v1/warehouse/picks/*/confirm", "/api/v1/warehouse/orders/*/picks", "/api/v1/purchase-orders", "/api/v1/purchase-orders/*", "/api/v1/purchase-orders/*/confirm", "/api/v1/purchase-orders/*/close", "/api/v1/purchase-orders/*/receipts", "/api/v1/supplier-bills", "/api/v1/supplier-bills/with-variance", "/api/v1/suppliers/*/payments", "/api/v1/supplier-advances/*/apply",
                        "/api/v1/supplier-payments/*/reverse", "/api/v1/supplier-advance-applications/*/unapply", "/api/v1/supplier-payments/*/reallocate",
                        "/api/v1/supplier-payment-reversals/*/reapply"))
                .securityContext(context -> context.securityContextRepository(
                        new org.springframework.security.web.context.RequestAttributeSecurityContextRepository()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> {
                    requests.requestMatchers(HttpMethod.GET, "/health/live", "/health/ready").permitAll();
                    if (staffConfigured && !databaseUrl.isBlank()) {
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/supplier-refund-reversals/*", "/api/v1/supplier-refunds", "/api/v1/supplier-refunds/*", "/api/v1/purchase-returns/*", "/api/v1/accounting/purchase-returns/*", "/api/v1/warehouse/purchase-receipts/*/return-sources", "/api/v1/supplier-credits", "/api/v1/supplier-credits/*", "/api/v1/supplier-credit-applications/*", "/api/v1/supplier-credit-unapplications/*", "/api/v1/supplier-credits/*/applications", "/api/v1/me", "/api/v1/crm/map/branches",
                                "/api/v1/accounting/gst-attributions", "/api/v1/accounting/accounts", "/api/v1/accounting/tax-rates", "/api/v1/audit",
                                "/api/v1/sales-orders/*/invoiceable", "/api/v1/customers/*/receipts", "/api/v1/customers/*/refunds", "/api/v1/customer-refund-reversals/*", "/api/v1/customer-refunds/*", "/api/v1/receipt-reversals/*", "/api/v1/advance-unapplications/*", "/api/v1/advance-applications/*", "/api/v1/customer-receipts/*", "/api/v1/customers/*/receivables", "/api/v1/sales-invoices/*/gst",
                                "/api/v1/sales-invoices/*/creditable", "/api/v1/sales-invoices/*/credit-notes", "/api/v1/sales-credit-notes/*/applications", "/api/v1/customer-credit-applications/*", "/api/v1/customer-credit-unapplications/*", "/api/v1/sales-credit-notes/*", "/api/v1/sales-invoices", "/api/v1/sales-invoices/*",
                                "/api/v1/warehouse/orders/*/returnable", "/api/v1/warehouse/returns/*", "/api/v1/warehouse/picks/*", "/api/v1/warehouse/orders", "/api/v1/warehouse/orders/*", "/api/v1/supplier-advance-applications/*", "/api/v1/supplier-payment-reversals/*",
                                "/api/v1/supplier-advance-unapplications/*", "/api/v1/accounting/ap", "/api/v1/suppliers/*/payments", "/api/v1/supplier-payments/*", "/api/v1/supplier-bills", "/api/v1/supplier-bills/*", "/api/v1/purchase-orders", "/api/v1/purchase-orders/*", "/api/v1/purchase-receipts/*",
                                "/api/v1/accounting/grni/unmatched", "/api/v1/accounting/purchase-gst", "/api/v1/accounting/purchase-gst-attributions", "/api/v1/accounting/grni/receipts/*", "/api/v1/inventory/availability", "/api/v1/quotes", "/api/v1/quotes/*", "/api/v1/sales-orders", "/api/v1/sales-orders/*", "/api/v1/customers/*/credit",
                                "/api/v1/pricing/resolve", "/api/v1/foundation", "/api/v1/customers", "/api/v1/products", "/api/v1/products/*/units").authenticated();
                        requests.requestMatchers(HttpMethod.PATCH, "/api/v1/customers/*/status").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/purchase-orders/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/quotes/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/pricing/price-lists", "/api/v1/pricing/standard-prices", "/api/v1/pricing/standard-prices/*", "/api/v1/pricing/floors", "/api/v1/pricing/floors/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/pricing/standard-prices/*", "/api/v1/pricing/floors/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/pricing/customer-prices", "/api/v1/pricing/customer-prices/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/pricing/customer-prices/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/inventory/stock-counts/*", "/api/v1/accounting/stock-counts", "/api/v1/accounting/stock-counts/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/inventory/stock-counts", "/api/v1/inventory/stock-counts/*/submit", "/api/v1/inventory/stock-counts/*/post", "/api/v1/inventory/stock-counts/*/cancel").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/inventory/transfers/*", "/api/v1/accounting/inventory-operations", "/api/v1/accounting/inventory-operations/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/inventory/transfers", "/api/v1/inventory/write-offs").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/customers/*/contacts", "/api/v1/customers/*/contacts/*", "/api/v1/suppliers/*/contacts", "/api/v1/suppliers/*/contacts/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/customers/*/contacts", "/api/v1/suppliers/*/contacts").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/customers/*/contacts/*", "/api/v1/suppliers/*/contacts/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/customers/*/branches", "/api/v1/customers/*/branches/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/customers/*/branches").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/customers/*/branches/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/customers/*", "/api/v1/suppliers", "/api/v1/suppliers/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/suppliers").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/customers/*", "/api/v1/suppliers/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/warehouses", "/api/v1/warehouses/*", "/api/v1/products/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/warehouses", "/api/v1/products/*/units").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/warehouses/*", "/api/v1/products/*", "/api/v1/products/*/units/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/uoms", "/api/v1/uoms/*", "/api/v1/product-categories", "/api/v1/product-categories/*", "/api/v1/regions", "/api/v1/regions/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/uoms", "/api/v1/product-categories", "/api/v1/regions").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/uoms/*", "/api/v1/product-categories/*", "/api/v1/regions/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/pricing/promotions", "/api/v1/pricing/promotions/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/pricing/promotions/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/pricing/promotions", "/api/v1/pricing/customer-prices", "/api/v1/pricing/standard-prices", "/api/v1/pricing/floors", "/api/v1/quotes/*/approve-and-convert", "/api/v1/sales-orders", "/api/v1/quotes/*/submit", "/api/v1/quotes", "/api/v1/supplier-bills/*/amount-credits", "/api/v1/supplier-expense-bills", "/api/v1/supplier-expense-bills/*/credits", "/api/v1/supplier-refunds/*/reverse", "/api/v1/supplier-refunds/*/correct", "/api/v1/supplier-refund-reversals/*/correct", "/api/v1/supplier-refunds", "/api/v1/purchase-receipts/*/returns", "/api/v1/supplier-bills/*/credits", "/api/v1/supplier-credits/*/apply", "/api/v1/supplier-credit-applications/*/unapply", "/api/v1/supplier-payments/*/reallocate", "/api/v1/supplier-payment-reversals/*/reapply",
                                "/api/v1/supplier-advances/*/apply", "/api/v1/supplier-payments/*/reverse",
                                "/api/v1/supplier-advance-applications/*/unapply", "/api/v1/suppliers/*/payments", "/api/v1/supplier-bills", "/api/v1/supplier-bills/with-variance", "/api/v1/purchase-orders",
                                "/api/v1/purchase-orders/*/confirm", "/api/v1/purchase-orders/*/close",
                                "/api/v1/purchase-orders/*/receipts").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/sales-credit-notes/*/apply", "/api/v1/customer-credit-applications/*/unapply", "/api/v1/sales-orders/*/returns", "/api/v1/sales-invoices/*/amount-credit-notes", "/api/v1/sales-invoices/*/credit-notes", "/api/v1/customer-refunds/*/correct", "/api/v1/customer-refund-reversals/*/correct", "/api/v1/customer-refunds/*/reverse", "/api/v1/customers/*/refunds", "/api/v1/receipt-reversals/*/reapply", "/api/v1/customer-receipts/*/reallocate", "/api/v1/customer-receipts/*/reverse", "/api/v1/advance-applications/*/unapply", "/api/v1/customer-advances/*/apply", "/api/v1/quotes/*/return-to-draft", "/api/v1/warehouse/orders/*/picks", "/api/v1/warehouse/picks/*/cancel", "/api/v1/warehouse/picks/*/confirm", "/api/v1/customers/*/receipts", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers", "/api/v1/products", "/api/v1/crm/collaboration", "/api/v1/documents/*/attachments").authenticated();
                    }
                    requests.anyRequest().denyAll();
                }).addFilterAfter(new LegacyRateLimit.Filter(limiter,false),
                        org.springframework.security.web.access.intercept.AuthorizationFilter.class).build();
    }
}
