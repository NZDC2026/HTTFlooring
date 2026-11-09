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
        return http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/crm/cards/*", "/api/v1/crm/cards/jobs/*/retry", "/api/v1/crm/cards/jobs/*/confirm", "/api/v1/crm/contact-imports", "/api/v1/crm/contact-imports/*/confirm", "/api/v1/crm/mobile/devices", "/api/v1/crm/mobile/devices/*", "/api/v1/crm/mobile/devices/*/operations", "/api/v1/crm/drafts", "/api/v1/crm/drafts/*", "/api/v1/crm/drafts/*/submit", "/api/v1/crm/drafts/*/review", "/api/v1/product-barcodes", "/api/v1/product-barcodes/*", "/api/v1/settings/business", "/api/v1/settings/document-numbering/*", "/api/v1/reports/saved", "/api/v1/reports/saved/*", "/api/v1/reports/saved/*/favourite", "/api/v1/reports/settings", "/api/v1/reports/packs", "/api/v1/sales-analytics/checkpoints", "/api/v1/sales-orders/*/sales-attribution", "/api/v1/customers/*/statements", "/api/v1/operating-report-runs", "/api/v1/operating-report-runs/*/export", "/api/v1/accounting/fiscal-years", "/api/v1/accounting/periods/*/close", "/api/v1/accounting/periods/*/reopen", "/api/v1/accounting/fiscal-years/*/close", "/api/v1/accounting/fiscal-years/*/reopen", "/api/v1/accounting/retained-earnings", "/api/v1/accounting/bas-periods", "/api/v1/accounting/bas-periods/*/method", "/api/v1/accounting/bas-periods/*/finalize", "/api/v1/accounting/bas-periods/*/reopen", "/api/v1/accounting/bas-periods/*/record-lodgement", "/api/v1/accounting/bas-classifications/*/*", "/api/v1/accounting/cash-flow/scopes/*", "/api/v1/accounting/cash-flow/journals/*/classification", "/api/v1/bank-accounts/*/feed-connections", "/api/v1/bank-feed-connections/*/verify", "/api/v1/bank-feed-connections/*/sync", "/api/v1/bank-feed-connections/*/revoke", "/api/v1/bank-feed-connections/*/retry", "/api/v1/bank-rules", "/api/v1/bank-rules/*", "/api/v1/bank-statement-lines/*/rule-preview", "/api/v1/bank-rule-previews/*/execute", "/api/v1/bank-accounts/*/statements/import", "/api/v1/bank-accounts/*/statements/import-csv", "/api/v1/bank-statement-lines/*/matches", "/api/v1/bank-matches/*/release", "/api/v1/bank-statements/*/reconcile", "/api/v1/bank-statements/*/void", "/api/v1/bank-reconciliations/*/reopen", "/api/v1/bank-transactions", "/api/v1/bank-transfers", "/api/v1/bank-statement-lines/*/classify", "/api/v1/bank-transactions/*/reverse", "/api/v1/bank-accounts", "/api/v1/bank-accounts/*", "/api/v1/inventory/transit-transfers", "/api/v1/inventory/transit-transfers/*/receipts", "/api/v1/inventory/transit-transfers/*/returns", "/api/v1/inventory/transit-transfers/*/shortages", "/api/v1/warehouse/bins", "/api/v1/warehouse/bins/*", "/api/v1/warehouse/location-moves", "/api/v1/warehouse/picks/*/short-pick-reasons", "/api/v1/warehouse/bin-counts", "/api/v1/warehouse/bin-counts/*/positions", "/api/v1/warehouse/bin-counts/*/submit", "/api/v1/warehouse/bin-counts/*/cancel", "/api/v1/accounting/bin-counts/*/recount", "/api/v1/accounting/bin-counts/*/approve", "/api/v1/accounting/bin-counts/*/post", "/api/v1/inventory/stock-counts", "/api/v1/inventory/stock-counts/*/submit", "/api/v1/inventory/stock-counts/*/post", "/api/v1/inventory/stock-counts/*/cancel", "/api/v1/inventory/transfers", "/api/v1/inventory/write-offs", "/api/v1/customers/*/contacts", "/api/v1/customers/*/contacts/*", "/api/v1/suppliers/*/contacts", "/api/v1/suppliers/*/contacts/*", "/api/v1/customers/*/branches", "/api/v1/customers/*/branches/*", "/api/v1/customers/*", "/api/v1/suppliers", "/api/v1/suppliers/*", "/api/v1/warehouses", "/api/v1/warehouses/*", "/api/v1/products/*", "/api/v1/products/*/units", "/api/v1/products/*/units/*", "/api/v1/uoms", "/api/v1/uoms/*", "/api/v1/product-categories", "/api/v1/product-categories/*", "/api/v1/regions", "/api/v1/regions/*", "/api/v1/pricing/promotions", "/api/v1/pricing/promotions/*", "/api/v1/pricing/customer-prices", "/api/v1/pricing/customer-prices/*", "/api/v1/pricing/standard-prices", "/api/v1/pricing/standard-prices/*", "/api/v1/pricing/floors", "/api/v1/pricing/floors/*", "/api/v1/quotes/*/approve-and-convert", "/api/v1/sales-orders", "/api/v1/quotes/*", "/api/v1/quotes/*/submit", "/api/v1/quotes", "/api/v1/supplier-bills/*/amount-credits", "/api/v1/supplier-expense-bills", "/api/v1/supplier-expense-bills/*/credits", "/api/v1/supplier-refunds/*/reverse", "/api/v1/supplier-refunds/*/correct", "/api/v1/supplier-refund-reversals/*/correct", "/api/v1/supplier-refunds", "/api/v1/purchase-receipts/*/returns", "/api/v1/supplier-bills/*/credits", "/api/v1/supplier-credits/*/apply", "/api/v1/supplier-credit-applications/*/unapply", "/api/v1/crm/collaboration", "/api/v1/documents/*/attachments", "/api/v1/customers", "/api/v1/customers/*/status", "/api/v1/products", "/api/v1/sales-orders/*/cancel", "/api/v1/sales-orders/*/invoices", "/api/v1/customers/*/receipts", "/api/v1/warehouse/picks/*/cancel", "/api/v1/warehouse/picks/*/confirm", "/api/v1/warehouse/orders/*/picks", "/api/v1/purchase-orders", "/api/v1/purchase-orders/*", "/api/v1/purchase-orders/*/confirm", "/api/v1/purchase-orders/*/close", "/api/v1/purchase-orders/*/receipts", "/api/v1/supplier-bills", "/api/v1/supplier-bills/with-variance", "/api/v1/suppliers/*/payments", "/api/v1/supplier-advances/*/apply",
                        "/api/v1/supplier-payments/*/reverse", "/api/v1/supplier-advance-applications/*/unapply", "/api/v1/supplier-payments/*/reallocate",
                        "/api/v1/supplier-payment-reversals/*/reapply"))
                .securityContext(context -> context.securityContextRepository(
                        new org.springframework.security.web.context.RequestAttributeSecurityContextRepository()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> {
                    requests.requestMatchers(HttpMethod.GET, "/health/live", "/health/ready").permitAll();
                    if (staffConfigured && !databaseUrl.isBlank()) {
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/documents/*/pdf").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/files/*/revoke").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/document-jobs/*/retry").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/files/*/content").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/documents/*/files", "/api/v1/documents/*/jobs", "/api/v1/document-jobs/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/push/jobs/*/retry").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/mobile/devices/*/push-subscription").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/messages/*/read", "/api/v1/crm/notes/*/follow", "/api/v1/crm/notification-preferences").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/messages", "/api/v1/crm/messages/*", "/api/v1/crm/messages/*/push", "/api/v1/crm/notes/*/follow", "/api/v1/crm/notification-preferences", "/api/v1/crm/mobile/devices/*/push-subscription").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/mobile/devices/*/task-operations").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/tasks", "/api/v1/crm/tasks/*/start", "/api/v1/crm/tasks/*/complete", "/api/v1/crm/tasks/*/cancel", "/api/v1/crm/tasks/*/reopen", "/api/v1/crm/tasks/*/delete").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/tasks/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/tasks", "/api/v1/crm/tasks/*", "/api/v1/crm/tasks/*/history", "/api/v1/crm/task-assignees", "/api/v1/crm/action-centre").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/mobile/devices/*/collaboration-operations").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/geocode-jobs/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/branches/*/geocode", "/api/v1/crm/geocode-jobs/*/retry").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/branches/*/navigation").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/branches/*/coordinates").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/collaboration/*/checkout", "/api/v1/crm/collaboration/*/cancel").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/collaboration/*").authenticated();
                        requests.requestMatchers(HttpMethod.DELETE, "/api/v1/crm/collaboration/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/collaboration/*/remove").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/collaboration", "/api/v1/crm/collaboration/*", "/api/v1/crm/collaboration/*/history").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/cards/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/cards/jobs/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/cards/jobs/*/retry", "/api/v1/crm/cards/jobs/*/confirm").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/contact-imports", "/api/v1/crm/contact-imports/*/confirm").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/mobile/devices", "/api/v1/crm/mobile/devices/*/operations").authenticated();
                        requests.requestMatchers(HttpMethod.DELETE, "/api/v1/crm/mobile/devices/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/mobile/devices/*/changes").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/crm/drafts", "/api/v1/crm/drafts/*/submit", "/api/v1/crm/drafts/*/review").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/crm/drafts/*").authenticated();
                        requests.requestMatchers(HttpMethod.DELETE, "/api/v1/crm/drafts/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/crm/drafts", "/api/v1/crm/drafts/*", "/api/v1/crm/drafts/*/duplicates").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/customers/*/catalog", "/api/v1/search/customers", "/api/v1/search/products", "/api/v1/search/branches", "/api/v1/search/contacts").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/products/*/barcodes").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/product-barcodes").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/product-barcodes/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/settings/business", "/api/v1/settings/document-numbering/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/settings/business", "/api/v1/settings/document-numbering", "/api/v1/supplier-refund-reversals/*", "/api/v1/supplier-refunds", "/api/v1/supplier-refunds/*", "/api/v1/purchase-returns/*", "/api/v1/accounting/purchase-returns/*", "/api/v1/warehouse/purchase-receipts/*/return-sources", "/api/v1/supplier-credits", "/api/v1/supplier-credits/*", "/api/v1/supplier-credit-applications/*", "/api/v1/supplier-credit-unapplications/*", "/api/v1/supplier-credits/*/applications", "/api/v1/me", "/api/v1/crm/map/branches",
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
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/bank-accounts/*/statements", "/api/v1/bank-statements/*", "/api/v1/bank-statements/*/source", "/api/v1/bank-statement-lines/*/candidates", "/api/v1/bank-reconciliations/*", "/api/v1/bank-accounts/*/cash-clearing").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-accounts/*/statements/import", "/api/v1/bank-accounts/*/statements/import-csv").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-statement-lines/*/matches", "/api/v1/bank-matches/*/release", "/api/v1/bank-statements/*/reconcile", "/api/v1/bank-statements/*/void", "/api/v1/bank-reconciliations/*/reopen").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-rules", "/api/v1/bank-statement-lines/*/rule-preview", "/api/v1/bank-rule-previews/*/execute").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/bank-rules/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/bank-accounts/*/feed-connections", "/api/v1/bank-feed-connections/*", "/api/v1/bank-feed-connections/*/jobs").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-accounts/*/feed-connections", "/api/v1/bank-feed-connections/*/verify", "/api/v1/bank-feed-connections/*/sync", "/api/v1/bank-feed-connections/*/revoke", "/api/v1/bank-feed-connections/*/retry").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/accounting/reports/profit-and-loss", "/api/v1/accounting/reports/balance-sheet", "/api/v1/accounting/reports/receivables-aging", "/api/v1/accounting/reports/payables-aging").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/accounting/reports/cash-flow", "/api/v1/accounting/cash-flow/scopes", "/api/v1/accounting/cash-flow/journals/*").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/accounting/cash-flow/scopes/*", "/api/v1/accounting/cash-flow/journals/*/classification").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/accounting/reports/gst-bas", "/api/v1/accounting/bas-periods", "/api/v1/accounting/bas-periods/*", "/api/v1/accounting/bas-periods/*/history", "/api/v1/accounting/bas-snapshots/*", "/api/v1/accounting/bas-classifications/*/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/accounting/bas-periods", "/api/v1/accounting/bas-periods/*/finalize", "/api/v1/accounting/bas-periods/*/reopen", "/api/v1/accounting/bas-periods/*/record-lodgement").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/accounting/bas-periods/*/method", "/api/v1/accounting/bas-classifications/*/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/accounting/fiscal-years", "/api/v1/accounting/periods", "/api/v1/accounting/periods/*/preflight", "/api/v1/accounting/fiscal-years/*/preflight", "/api/v1/accounting/periods/*/history", "/api/v1/accounting/period-close-snapshots/*", "/api/v1/accounting/fiscal-years/*/history", "/api/v1/accounting/retained-earnings").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/accounting/fiscal-years", "/api/v1/accounting/periods/*/close", "/api/v1/accounting/periods/*/reopen", "/api/v1/accounting/fiscal-years/*/close", "/api/v1/accounting/fiscal-years/*/reopen").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/accounting/retained-earnings").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/customers/*/statement-preview", "/api/v1/customer-statements/*", "/api/v1/customers/*/statements", "/api/v1/accounting/reports/operating", "/api/v1/operating-report-runs", "/api/v1/operating-report-runs/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/customers/*/statements", "/api/v1/operating-report-runs", "/api/v1/operating-report-runs/*/export").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/sales-analytics/trends", "/api/v1/sales-analytics/facts", "/api/v1/sales-analytics/pending-returns", "/api/v1/sales-analytics/reconciliation", "/api/v1/sales-analytics/checkpoints/*", "/api/v1/sales-orders/*/sales-attribution").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/sales-analytics/checkpoints").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/sales-orders/*/sales-attribution").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/reports/saved", "/api/v1/reports/saved/*", "/api/v1/reports/settings", "/api/v1/reports/packs", "/api/v1/reports/packs/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/reports/saved", "/api/v1/reports/packs").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/reports/saved/*", "/api/v1/reports/saved/*/favourite", "/api/v1/reports/settings").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/bank-rules", "/api/v1/bank-rules/*", "/api/v1/bank-rules/*/revisions", "/api/v1/bank-rule-previews/*", "/api/v1/bank-rule-exceptions").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/bank-transactions", "/api/v1/bank-transactions/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-transactions", "/api/v1/bank-transfers", "/api/v1/bank-statement-lines/*/classify", "/api/v1/bank-transactions/*/reverse").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/accounting/general-ledger", "/api/v1/accounting/trial-balance", "/api/v1/accounting/journals/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/bank-accounts", "/api/v1/bank-accounts/options", "/api/v1/bank-accounts/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/bank-accounts").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/bank-accounts/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/inventory/transit-transfers", "/api/v1/inventory/transit-transfers/*", "/api/v1/inventory/transit-events/*", "/api/v1/accounting/transit-transfers", "/api/v1/accounting/transit-transfers/*", "/api/v1/accounting/transit-events/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/inventory/transit-transfers", "/api/v1/inventory/transit-transfers/*/receipts", "/api/v1/inventory/transit-transfers/*/returns", "/api/v1/inventory/transit-transfers/*/shortages").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/warehouse/bins", "/api/v1/warehouse/positions", "/api/v1/warehouse/lot-trace", "/api/v1/warehouse/scan").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/warehouse/bins", "/api/v1/warehouse/location-moves", "/api/v1/warehouse/picks/*/short-pick-reasons").authenticated();
                        requests.requestMatchers(HttpMethod.PUT, "/api/v1/warehouse/bins/*").authenticated();
                        requests.requestMatchers(HttpMethod.GET, "/api/v1/warehouse/bin-counts", "/api/v1/warehouse/bin-counts/*", "/api/v1/accounting/bin-counts/*").authenticated();
                        requests.requestMatchers(HttpMethod.POST, "/api/v1/warehouse/bin-counts", "/api/v1/warehouse/bin-counts/*/positions", "/api/v1/warehouse/bin-counts/*/submit", "/api/v1/warehouse/bin-counts/*/cancel", "/api/v1/accounting/bin-counts/*/recount", "/api/v1/accounting/bin-counts/*/approve", "/api/v1/accounting/bin-counts/*/post").authenticated();
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
