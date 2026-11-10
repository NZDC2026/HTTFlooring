package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal/v1")
@ConditionalOnProperty("htt.portal.database.url")
class PortalController {
    private final PortalDatabase database;

    PortalController(PortalDatabase database) {
        this.database = database;
    }

    @GetMapping("/me")
    ResponseEntity<String> me(@AuthenticationPrincipal Jwt token) {
        return query("SELECT portal.me(:iss,:sub)::text", identity(token));
    }

    @GetMapping("/branches")
    ResponseEntity<String> branches(@AuthenticationPrincipal Jwt token, HttpServletRequest request) {
        return query("SELECT portal.branches(:iss,:sub,:company,:grant)::text", scope(token, request));
    }

    @GetMapping("/warehouses")
    ResponseEntity<String> warehouses(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID branchId) {
        var args = scope(token, request);
        args.put("branch", branchId);
        return query("SELECT portal.warehouses(:iss,:sub,:company,:grant,:branch)::text", args);
    }

    @GetMapping("/products")
    ResponseEntity<String> products(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID branchId, @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize,
            @RequestParam(defaultValue = "sku") String sort, @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "ALL") String stockStatus) {
        var args = scope(token, request);
        args.putAll(Map.of("branch", branchId, "search", search.strip(), "page", page, "size", pageSize,
                "sort", sort, "stock", stockStatus));
        args.put("category", categoryId);
        return query("""
                SELECT portal.products(:iss,:sub,:company,:grant,:branch,:search,:page,:size,:sort,
                                       CAST(:category AS uuid),:stock)::text
                """, args);
    }

    @GetMapping("/products/{id}")
    ResponseEntity<String> product(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestParam UUID branchId) {
        var args = scope(token, request);
        args.putAll(Map.of("product", id, "branch", branchId));
        return query("SELECT portal.product(:iss,:sub,:company,:grant,:branch,:product)::text", args);
    }

    @GetMapping("/products/{id}/availability")
    ResponseEntity<String> availability(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestParam UUID branchId, @RequestParam(required = false) UUID warehouseId) {
        var args = scope(token, request);
        args.putAll(Map.of("product", id, "branch", branchId));
        args.put("warehouse", warehouseId);
        return query("""
                SELECT portal.availability(:iss,:sub,:company,:grant,:branch,:product,
                                           CAST(:warehouse AS uuid))::text
                """, args);
    }

    /** Customer document queries use the existing dedicated, read-only portal connection. */
    @GetMapping({"/quotes", "/orders", "/invoices", "/credit-notes", "/returns"})
    ResponseEntity<String> documents(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID branchId, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        return documents(token,request,branchId,null,page,pageSize);
    }

    @GetMapping({"/quotes/{id}", "/orders/{id}", "/invoices/{id}", "/credit-notes/{id}", "/returns/{id}"})
    ResponseEntity<String> document(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID branchId, @PathVariable UUID id) {
        return documents(token,request,branchId,id,1,1);
    }

    private ResponseEntity<String> documents(Jwt token,HttpServletRequest request,UUID branch,UUID id,int page,int size) {
        var args=scope(token,request);args.put("branch",branch);args.put("id",id);
        args.put("kind",documentKind(request.getRequestURI()));args.put("page",page);args.put("size",size);
        return query("SELECT portal.sales_documents(:iss,:sub,:company,:grant,:branch,:kind,CAST(:id AS uuid),:page,:size)::text",args);
    }

    static String documentKind(String uri) {
        String resource=uri.substring("/api/portal/v1/".length()).split("/",2)[0];
        return switch(resource) {
            case "quotes" -> "QUOTE";case "orders" -> "SALES_ORDER";case "invoices" -> "INVOICE";
            case "credit-notes" -> "CREDIT_NOTE";case "returns" -> "SALES_RETURN";
            default -> throw new IllegalArgumentException("Unsupported portal document resource");
        };
    }

    private ResponseEntity<String> query(String sql, Map<String, ?> args) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(database.read(sql, args));
    }

    private static Map<String, Object> identity(Jwt token) {
        String issuer = token.getClaimAsString("iss");
        String subject = token.getSubject();
        if (issuer == null || issuer.isBlank() || subject == null || subject.isBlank()) {
            throw new PortalFailure(401, "identity_missing", "A verified issuer and subject are required.");
        }
        return new HashMap<>(Map.of("iss", issuer, "sub", subject));
    }

    private static Map<String, Object> scope(Jwt token, HttpServletRequest request) {
        var args = identity(token);
        try {
            args.put("company", requiredUuid(request.getHeader("X-Company-Id")));
            args.put("grant", requiredUuid(request.getHeader("X-Portal-Grant-Id")));
        } catch (IllegalArgumentException invalid) {
            throw new PortalFailure(400, "portal_context_required",
                    "Select a company and portal grant using X-Company-Id and X-Portal-Grant-Id.");
        }
        return args;
    }

    private static UUID requiredUuid(String value) {
        var id = UUID.fromString(value == null ? "" : value.strip());
        if (id.equals(new UUID(0, 0))) {
            throw new IllegalArgumentException("Empty UUID");
        }
        return id;
    }

    @ExceptionHandler(PortalFailure.class)
    ResponseEntity<StaffApiErrors.ApiError> requestError(PortalFailure error, HttpServletRequest request) {
        return ResponseEntity.status(error.status).body(new StaffApiErrors.ApiError(
                error.code, error.getMessage(), (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID),
                false, Map.of()));
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<StaffApiErrors.ApiError> databaseError(DataAccessException error,
            HttpServletRequest request) {
        var cause = error.getMostSpecificCause();
        String state = cause instanceof SQLException sql ? sql.getSQLState() : null;
        if (state == null) {
            state = "";
        }
        return switch (state) {
            case "HC409" -> error(409, "portal_conflict", cause.getMessage(), request, false);
            case "HC422" -> error(422, "portal_validation", cause.getMessage(), request, false);
            case "42501" -> error(403, "scope_denied", "The database rejected this data scope.", request, false);
            case "HT404" -> error(404, "not_found", "Resource is unavailable in this scope.", request, false);
            default -> error(503, "database_unavailable",
                    "The service is temporarily unavailable; check the operation result before retrying.", request, true);
        };
    }

    private static ResponseEntity<StaffApiErrors.ApiError> error(int status, String code, String message,
            HttpServletRequest request, boolean retryable) {
        return ResponseEntity.status(status).body(new StaffApiErrors.ApiError(code, message,
                (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID), retryable, null));
    }

    private static final class PortalFailure extends RuntimeException {
        private final int status;
        private final String code;

        PortalFailure(int status, String code, String message) {
            super(message);
            this.status = status;
            this.code = code;
        }
    }
}
