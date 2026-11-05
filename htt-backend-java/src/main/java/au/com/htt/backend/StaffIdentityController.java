package au.com.htt.backend;

import java.util.List;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;
import java.util.Map;
import java.sql.SQLException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class StaffIdentityController {
    private final JdbcClient jdbc;

    private final StaffScope staff;
    private final JsonMapper json;
    private final IdempotentWrite writes;
    private final DocumentUpload uploads;
    private final CustomerWrites customers;
    private final StaffAudit audit;
    private final ProductWrites productWrites;
    private final PriceRead prices;
    private final SalesRead sales;
    private final OrderWrites orderWrites;
    private final InvoiceOperations invoiceOperations;

    StaffIdentityController(JdbcClient jdbc, StaffScope staff, JsonMapper json, IdempotentWrite writes, DocumentUpload uploads, CustomerWrites customers, StaffAudit audit, ProductWrites productWrites, PriceRead prices, SalesRead sales, OrderWrites orderWrites, InvoiceOperations invoiceOperations) {
        this.jdbc = jdbc;
        this.staff = staff;
        this.json = json;
        this.writes = writes;
        this.uploads = uploads;
        this.customers = customers;
        this.audit = audit;
        this.productWrites = productWrites;
        this.prices = prices;
        this.sales = sales;
        this.orderWrites = orderWrites;
        this.invoiceOperations = invoiceOperations;
    }

    @GetMapping("/api/v1/me")
    ResponseEntity<?> me(@AuthenticationPrincipal Jwt token) {
        return ResponseEntity.ok(new StaffIdentity(staff.access(token)));
    }

    @GetMapping("/api/v1/crm/map/branches")
    ResponseEntity<?> branches(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany,
            @ModelAttribute BranchQuery filter) {
        var membership = staff.require(token, selectedCompany, "crm.maps.read");
        var payload = filter.payload();
        String body = staff.inCompany(membership, requestId, () ->
                jdbc.sql("SELECT crm.map_branches(CAST(:filter AS jsonb))::text")
                    .param("filter", json.writeValueAsString(payload)).query(String.class).single());
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }

    @GetMapping("/api/v1/foundation")
    Foundation foundation(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany) {
        var scope = staff.require(token, selectedCompany, "foundation.read");
        return staff.inCompany(scope, requestId, () -> new Foundation(
                jdbc.sql("""
                        SELECT id,name,abn,country,base_currency,timezone,financial_year_start_month,gst_basis,gst_registered
                        FROM core.companies
                        """).query().listOfRows(),
                jdbc.sql("SELECT id,code,name,active,version FROM catalog.uoms ORDER BY code").query().listOfRows(),
                jdbc.sql("SELECT id,code,name,category FROM accounting.tax_codes ORDER BY code").query().listOfRows(),
                OffsetDateTime.now(ZoneOffset.UTC)));
    }

    @GetMapping("/api/v1/quotes")
    Page<Map<String, Object>> quotes(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        return salesPage(token, request, page, pageSize, true);
    }

    @GetMapping("/api/v1/sales-orders")
    Page<Map<String, Object>> orders(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        return salesPage(token, request, page, pageSize, false);
    }

    @GetMapping("/api/v1/quotes/{id}")
    ResponseEntity<String> quote(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        return salesDocument(token, request, id, true);
    }

    @GetMapping("/api/v1/sales-orders/{id}")
    ResponseEntity<String> order(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        return salesDocument(token, request, id, false);
    }

    private ResponseEntity<String> salesDocument(Jwt token, HttpServletRequest request, UUID id, boolean quote) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"),
                quote ? "sales.quotes.read" : "sales.orders.read");
        String body = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.document(scope, id, quote));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }

    private Page<Map<String, Object>> salesPage(Jwt token, HttpServletRequest request, int page, int size, boolean quote) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"),
                quote ? "sales.quotes.read" : "sales.orders.read");
        int offset = SalesRead.offset(page, size);
        var rows = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.list(scope, offset, size, quote));
        return new Page<>(rows, page, size);
    }

    @GetMapping("/api/v1/sales-orders/{id}/invoiceable")
    ResponseEntity<String> invoiceable(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.invoices.read");
        String body = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.invoiceable(scope, id));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }

    @GetMapping("/api/v1/sales-invoices/{id}")
    ResponseEntity<String> invoice(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.invoices.read");
        String body = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> invoiceOperations.read(scope, id));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }

    @PostMapping("/api/v1/sales-orders/{id}/invoices")
    ResponseEntity<String> issueInvoice(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestBody InvoiceOperations.Input input, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.invoices.write");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId, () -> invoiceOperations.issue(scope, id, input,
                request.getHeader("If-Match"), request.getHeader("Idempotency-Key"), requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @GetMapping("/api/v1/sales-invoices")
    Page<Map<String, Object>> invoices(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(required = false) UUID customerId, @RequestParam(required = false) UUID orderId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.invoices.read");
        var rows = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.invoices(scope, customerId, orderId, page, pageSize));
        return new Page<>(rows, page, pageSize);
    }

    @GetMapping("/api/v1/inventory/availability")
    SalesRead.Availability availability(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID warehouseId, @RequestParam(required = false) UUID productId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "inventory.read");
        int offset = SalesRead.offset(page, pageSize);
        return staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.availability(scope, warehouseId, productId, page, pageSize, offset));
    }

    @GetMapping("/api/v1/customers/{id}/credit")
    Map<String, Object> customerCredit(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.credit.read");
        return staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> sales.credit(scope, id));
    }

    @GetMapping("/api/v1/pricing/resolve")
    ResponseEntity<PriceRead.Price> resolvePrice(@AuthenticationPrincipal Jwt token,
            @RequestParam UUID customerId, @RequestParam UUID productUnitId, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "pricing.read");
        var price = staff.inCompany(scope, (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                () -> prices.resolve(scope, customerId, productUnitId));
        return ResponseEntity.of(price);
    }

    @GetMapping("/api/v1/accounting/accounts")
    List<Map<String, Object>> accounts(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany) {
        var scope = staff.require(token, selectedCompany, "accounting.read");
        return staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT id,code,name,kind,control_kind FROM accounting.accounts ORDER BY code
                """).query().listOfRows());
    }

    @GetMapping("/api/v1/accounting/tax-rates")
    List<Map<String, Object>> taxRates(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany) {
        var scope = staff.require(token, selectedCompany, "accounting.read");
        return staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT t.code,r.rate::text AS rate,r.effective_from::text AS effective_from,
                       r.effective_to::text AS effective_to
                FROM accounting.tax_rates r JOIN accounting.tax_codes t
                  ON t.company_id=r.company_id AND t.id=r.tax_code_id
                ORDER BY t.code,r.effective_from
                """).query().listOfRows());
    }

    @GetMapping("/api/v1/audit")
    List<Map<String, Object>> audit(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, selectedCompany, "audit.read");
        int offset = pageOffset(page, pageSize);
        return staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT id,actor_id,action,entity_type,entity_id,request_id,
                       to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS')
                           || rtrim(rtrim(to_char(created_at,'"."US'), '0'), '.') || 'Z' AS created_at
                FROM platform.audit_events ORDER BY created_at DESC,id DESC LIMIT :size OFFSET :offset
                """).param("size", pageSize).param("offset", offset).query().listOfRows());
    }

    @GetMapping("/api/v1/customers")
    Page<Customer> customers(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, selectedCompany, "customers.read");
        int offset = pageOffset(page, pageSize);
        if (search != null && search.length() > 100) {
            throw new StaffScope.Failure(400, "invalid_search", "Search is limited to 100 characters.");
        }
        String term = search == null ? "" : search.strip().toLowerCase(Locale.ROOT);
        var items = staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT c.id,c.code,p.legal_name,p.abn,c.status,c.credit_limit::text,c.payment_terms_days,c.version
                FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id
                WHERE c.company_id=:company
                  AND (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                    WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))
                  AND (strpos(lower(c.code),:term)>0 OR strpos(lower(p.legal_name),:term)>0)
                ORDER BY c.code,c.id LIMIT :size OFFSET :offset
                """).param("company", scope.companyId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                .param("membership", scope.membershipId()).param("term", term)
                .param("size", pageSize).param("offset", offset)
                .query((row, index) -> new Customer(row.getObject(1, UUID.class), row.getString(2),
                        row.getString(3), row.getString(4), row.getString(5), row.getString(6),
                        row.getInt(7), row.getLong(8))).list());
        return new Page<>(items, page, pageSize);
    }

    record Foundation(List<Map<String, Object>> companies, List<Map<String, Object>> units,
            List<Map<String, Object>> taxCodes, OffsetDateTime serverTime) {}
    record Customer(UUID id, String code, String legalName, String abn, String status,
            String creditLimit, int paymentTermsDays, long version) {}

    @GetMapping("/api/v1/products")
    Page<Product> products(@AuthenticationPrincipal Jwt token,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, selectedCompany, "catalog.read");
        int offset = pageOffset(page, pageSize);
        var items = staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT id,sku,name,item_type,status,base_uom_id,whole_packs,version
                FROM catalog.products WHERE company_id=:company
                ORDER BY sku,id LIMIT :size OFFSET :offset
                """).param("company", scope.companyId()).param("size", pageSize)
                .param("offset", offset)
                .query((row, index) -> new Product(row.getObject(1, UUID.class), row.getString(2),
                        row.getString(3), row.getString(4), row.getString(5), row.getObject(6, UUID.class),
                        row.getBoolean(7), row.getLong(8))).list());
        return new Page<>(items, page, pageSize);
    }

    @GetMapping("/api/v1/products/{id}/units")
    List<ProductUnit> units(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany) {
        var scope = staff.require(token, selectedCompany, "catalog.read");
        return staff.inCompany(scope, requestId, () -> jdbc.sql("""
                SELECT id,uom_id,conversion_to_base::text,quantity_step::text,active,version
                FROM catalog.product_units WHERE company_id=:company AND product_id=:id ORDER BY id
                """).param("company", scope.companyId()).param("id", id)
                .query((row, index) -> new ProductUnit(row.getObject(1, UUID.class), row.getObject(2, UUID.class),
                        row.getString(3), row.getString(4), row.getBoolean(5), row.getLong(6))).list());
    }

    private static int pageOffset(int page, int pageSize) {
        if (page < 1 || page > 100000 || pageSize < 1 || pageSize > 100) {
            throw new StaffScope.Failure(400, "invalid_pagination", "Page must be 1..100000; pageSize must be 1..100.");
        }
        return (page - 1) * pageSize;
    }

    record Page<T>(List<T> items, int page, int pageSize) {}
    record Product(UUID id, String sku, String name, String itemType, String status,
            UUID baseUomId, boolean wholePacks, long version) {}
    record ProductUnit(UUID id, UUID uomId, String conversionToBase, String quantityStep, boolean active, long version) {}

    @PostMapping("/api/v1/crm/collaboration")
    ResponseEntity<String> createCollaboration(@AuthenticationPrincipal Jwt token, @RequestBody CollaborationCreate visit,
            @RequestAttribute(ApiResponseHeaders.REQUEST_ID) String requestId,
            @RequestHeader(value = "X-Company-Id", required = false) String selectedCompany,
            @RequestHeader(value = "Idempotency-Key", required = false) String key) {
        var scope = staff.require(token, selectedCompany, "crm.collaboration.read");
        var result = staff.inCompany(scope, requestId, () -> {
            if (!visit.hasIds()) {
                throw new BranchQuery.InvalidFilter("id", "Object/customer IDs required.");
            }
            String capability = visit.capability();
            boolean visible = jdbc.sql("""
                    SELECT EXISTS(SELECT 1 FROM crm.customers c WHERE c.company_id=:company
                     AND c.id=:customer AND (:allCustomers OR EXISTS(
                        SELECT 1 FROM identity.customer_assignments a
                        WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership)))
                    """).param("company", scope.companyId()).param("customer", visit.customerId())
                    .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                    .param("membership", scope.membershipId()).query(Boolean.class).single();
            if (!visible) {
                throw new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
            }
            jdbc.sql("SELECT crm.require_collab_customer(:customer), crm.require_mobile(:capability)")
                    .param("customer", visit.customerId()).param("capability", capability).query((row, index) -> true).single();
            var data = visit.normalizedData();
            return writes.execute(scope, "POST /crm/collaboration/create", key, visit.canonical(data), () -> {
                var body = jdbc.sql("""
                        SELECT crm.collab_command(:id,:kind,:customer,:branch,'CREATE',NULL,CAST(:data AS jsonb))::text
                        """).param("id", visit.id()).param("kind", visit.kind()).param("customer", visit.customerId())
                        .param("branch", visit.branchId()).param("data", data).query(String.class).single();
                audit.record(scope, "crm.collaboration_create", "crm_collaboration", visit.id(), requestId, Map.of());
                return new IdempotentWrite.StoredResponse(201, body);
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/documents/{id}/attachments")
    ResponseEntity<String> uploadAttachment(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestParam String fileName, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "documents.attachments.write");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId, () -> uploads.upload(scope, id, fileName, request, requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/customers")
    ResponseEntity<String> createCustomer(@AuthenticationPrincipal Jwt token,
            @RequestBody CustomerWrites.Draft draft, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "customers.write");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId,
                () -> customers.create(scope, draft, request.getHeader("Idempotency-Key"), requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/products")
    ResponseEntity<String> createProduct(@AuthenticationPrincipal Jwt token,
            @RequestBody ProductWrites.Draft draft, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "catalog.write");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId,
                () -> productWrites.create(scope, draft, request.getHeader("Idempotency-Key"), requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/sales-orders/{id}/cancel")
    ResponseEntity<String> cancelOrder(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestBody OrderWrites.Review input, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "sales.orders.cancel");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId,
                () -> orderWrites.cancel(scope, id, input, request.getHeader("If-Match"),
                        request.getHeader("Idempotency-Key"), requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PatchMapping("/api/v1/customers/{id}/status")
    ResponseEntity<String> changeCustomerStatus(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestBody CustomerWrites.State state, HttpServletRequest request) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "customers.write");
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var result = staff.inCompany(scope, requestId,
                () -> customers.changeStatus(scope, id, state, request.getHeader("If-Match"),
                        request.getHeader("Idempotency-Key"), requestId));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @ExceptionHandler(StaffScope.Failure.class)
    ResponseEntity<ApiError> accessDenied(StaffScope.Failure failure, HttpServletRequest request) {
        return error(failure.status, failure.code, failure.getMessage(),
                (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID), false);
    }

    @ExceptionHandler(BranchQuery.InvalidFilter.class)
    ResponseEntity<ApiError> invalidFilter(BranchQuery.InvalidFilter invalid, HttpServletRequest request) {
        String message = invalid.getMessage();
        return ResponseEntity.unprocessableContent().body(new ApiError("invalid_master_data", message,
                (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID), false,
                Map.of(invalid.field, List.of(message))));
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiError> databaseUnavailable(DataAccessException exception, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        if (exception.getMostSpecificCause() instanceof SQLException sql && sql.getSQLState() != null) {
            return switch (sql.getSQLState()) {
                case "23505" -> sqlError(409, "duplicate", "The resource or operation already exists.", requestId, false);
                case "23503", "23514", "23P01", "22003" -> sqlError(422, "constraint_violation",
                        "A reference, effective interval, or business constraint is invalid.", requestId, false);
                case "42501" -> sqlError(403, "scope_denied", "The database rejected this data scope.", requestId, false);
                case "HT409" -> sqlError(409, "invoice_conflict",
                        "Order changed, is not confirmed, or quantity exceeds the delivered uninvoiced remainder.", requestId, false);
                case "HT422" -> sqlError(422, "invoice_validation", sqlMessage(sql), requestId, false);
                case "HT404" -> sqlError(404, "not_found", "Resource is unavailable in this scope.", requestId, false);
                case "HD409" -> sqlError(409, "document_conflict", sqlMessage(sql), requestId, false);
                case "HD422" -> sqlError(422, "document_validation", sqlMessage(sql), requestId, false);
                case "HR409" -> sqlError(409, "settlement_conflict", sqlMessage(sql), requestId, false);
                case "HR422" -> sqlError(422, "settlement_validation", sqlMessage(sql), requestId, false);
                case "55P03", "40001", "40P01" -> sqlError(409, "concurrent_operation",
                        "Another operation is in progress; retry with the same idempotency key.", requestId, true);
                default -> databaseUnavailable(requestId);
            };
        }
        return databaseUnavailable(requestId);
    }

    private static String sqlMessage(SQLException sql) {
        return sql.getMessage().lines().findFirst().orElse("").replaceFirst("^ERROR: ", "");
    }

    private static ResponseEntity<ApiError> sqlError(
            int status, String code, String message, String requestId, boolean retryable) {
        return ResponseEntity.status(status).body(new ApiError(code, message, requestId, retryable, null));
    }

    private static ResponseEntity<ApiError> databaseUnavailable(String requestId) {
        return error(503, "database_unavailable",
                "The service is temporarily unavailable; check the operation result before retrying.",
                requestId, true);
    }

    private static ResponseEntity<ApiError> error(
            int status, String code, String message, String requestId, boolean retryable) {
        return ResponseEntity.status(status).body(new ApiError(code, message, requestId, retryable, status == 503 ? null : Map.of()));
    }

    record ApiError(String code, String message, String requestId, boolean retryable, Object fieldErrors) {}

    record StaffIdentity(List<StaffScope.CompanyAccess> companies) {}
}
