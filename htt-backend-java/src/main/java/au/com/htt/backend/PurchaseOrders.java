package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class PurchaseOrders {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    PurchaseOrders(StaffScope staff, JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.staff = staff;
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    @PostMapping("/api/v1/purchase-orders")
    ResponseEntity<String> create(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestBody Draft draft) {
        return save(token, request, null, draft);
    }

    @PutMapping("/api/v1/purchase-orders/{id}")
    ResponseEntity<String> update(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Draft draft) {
        return save(token, request, id, draft);
    }

    private ResponseEntity<String> save(Jwt token, HttpServletRequest request, UUID id, Draft draft) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.orders.write");
        var result = staff.inCompany(scope, requestId(request), () -> {
            if (id != null) {
                requireVisible(id);
            }
            var lines = draft.lines();
            require(present(draft.supplierId()) && present(draft.warehouseId())
                    && lines != null && !lines.isEmpty() && lines.size() <= 50
                    && lines.stream().allMatch(line -> line != null && present(line.productUnitId())
                            && !new UUID(0, 0).equals(line.taxCodeId()))
                    && lines.stream().map(Line::productUnitId).distinct().count() == lines.size(), "lines",
                    "Supplier, warehouse and 1..50 distinct product units required.");
            for (var line : lines) {
                BigDecimal quantity = line.quantity() == null ? BigDecimal.ZERO : line.quantity();
                amount(quantity, "quantity", 6, "99999999999999.999999");
                require(quantity.signum() > 0 && line.unitCost() != null, "unitCost",
                        "Positive quantity and explicit unit cost required.");
                amount(line.unitCost(), "unitCost", 8, "999999999999.99999999");
            }
            String notes = draft.notes() == null ? "" : draft.notes().strip();
            require(notes.length() <= 2000, "notes", "notes exceeds 2000 characters.");
            Long expected = id == null ? null : OrderWrites.version(request.getHeader("If-Match"));
            String lineJson = lines.stream().sorted(Comparator.comparing(line -> line.productUnitId().toString()))
                    .map(Line::canonical).collect(Collectors.joining(",", "[", "]"));
            String canonical = "{\"id\":" + nullable(id) + ",\"expected\":" + expected
                    + ",\"supplierId\":" + nullable(draft.supplierId()) + ",\"warehouseId\":" + nullable(draft.warehouseId())
                    + ",\"expectedOn\":" + nullable(draft.expectedOn()) + ",\"notes\":" + nullable(notes)
                    + ",\"lines\":" + lineJson + "}";
            String route = id == null ? "POST /purchase-orders" : "PUT /purchase-orders/" + id;
            return writes.execute(scope, route, request.getHeader("Idempotency-Key"), canonical, () -> {
                UUID saved = jdbc.sql("""
                        SELECT purchase.save_order(CAST(:id AS uuid),CAST(:expected AS bigint),:supplier,:warehouse,
                            CAST(:date AS date),:notes,CAST(:lines AS jsonb))
                        """).param("id", id).param("expected", expected).param("supplier", draft.supplierId())
                        .param("warehouse", draft.warehouseId()).param("date", draft.expectedOn())
                        .param("notes", notes).param("lines", lineJson).query(UUID.class).single();
                audit.record(scope, "purchase.order_drafted", "purchase_order", saved, requestId(request), Map.of());
                return new IdempotentWrite.StoredResponse(id == null ? 201 : 200, view(scope, saved));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    @PostMapping("/api/v1/purchase-orders/{id}/confirm")
    ResponseEntity<String> confirm(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        return transition(token, request, id, null, false);
    }

    @PostMapping("/api/v1/purchase-orders/{id}/close")
    ResponseEntity<String> close(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Close input) {
        return transition(token, request, id, input.reason(), true);
    }

    private ResponseEntity<String> transition(Jwt token, HttpServletRequest request, UUID id, String input, boolean close) {
        String action = close ? "close" : "confirm";
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.orders." + action);
        var result = staff.inCompany(scope, requestId(request), () -> {
            requireVisible(id);
            long expected = OrderWrites.version(request.getHeader("If-Match"));
            String reason = input == null ? "" : input.strip();
            if (close) {
                require(!reason.isEmpty() && reason.length() <= 2000, "reason", "reason must contain 1..2000 characters.");
            }
            String canonical = "{\"expected\":" + expected + (close ? ",\"reason\":" + nullable(reason) : "") + "}";
            return writes.execute(scope, "POST /purchase-orders/" + id + "/" + action,
                    request.getHeader("Idempotency-Key"), canonical, () -> {
                var statement = jdbc.sql(close ? "SELECT purchase.close_order(:id,:expected,:reason)"
                        : "SELECT purchase.confirm_order(:id,:expected)").param("id", id).param("expected", expected);
                if (close) {
                    statement.param("reason", reason);
                }
                statement.query((row, index) -> true).single();
                audit.record(scope, close ? "purchase.order_closed" : "purchase.order_confirmed",
                        "purchase_order", id, requestId(request), close ? Map.of("reason", reason) : Map.of());
                return new IdempotentWrite.StoredResponse(200, view(scope, id));
            });
        });
        return json(result.body());
    }

    private void requireVisible(UUID id) {
        if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id", id).query(Boolean.class).single()) {
            throw new StaffScope.Failure(404, "not_found", "Document is unavailable in this scope.");
        }
    }

    private static boolean present(UUID value) {
        return value != null && !value.equals(new UUID(0, 0));
    }

    private static String nullable(Object value) {
        return value == null ? "null" : CollaborationCreate.legacyString(value.toString());
    }

    private static void amount(BigDecimal value, String field, int scale, String max) {
        require(value.signum() >= 0 && value.compareTo(new BigDecimal(max)) <= 0 && value.stripTrailingZeros().scale() <= scale,
                field, field + " must be nonnegative, within the storage limit, and have at most " + scale + " decimals.");
    }

    private static void require(boolean condition, String field, String message) {
        if (!condition) {
            throw new BranchQuery.InvalidFilter(field, message);
        }
    }

    record Draft(UUID supplierId, UUID warehouseId, List<Line> lines, LocalDate expectedOn, String notes) {}
    record Close(String reason) {}
    record Line(UUID productUnitId, BigDecimal quantity, BigDecimal unitCost, UUID taxCodeId, Boolean recoverableGst) {
        String canonical() {
            return "{\"productUnitId\":" + nullable(productUnitId) + ",\"quantity\":" + nullable(quantity.toPlainString())
                    + ",\"unitCost\":" + nullable(unitCost.toPlainString()) + ",\"taxCodeId\":" + nullable(taxCodeId)
                    + ",\"recoverableGst\":" + recoverableGst + "}";
        }
    }

    @GetMapping("/api/v1/purchase-orders")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam(required = false) UUID supplierId, @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.orders.read");
        if (status != null && !List.of("DRAFT", "CONFIRMED", "CLOSED").contains(status)) {
            throw new BranchQuery.InvalidFilter("status", "Invalid status.");
        }
        int offset = SalesRead.offset(page, pageSize);
        return json(staff.inCompany(scope, requestId(request), () -> jdbc.sql("""
                SELECT jsonb_build_object('items',COALESCE(jsonb_agg(
                    CASE WHEN :cost THEN p.body ELSE p.body-ARRAY['net','tax','gross','valuationAmount'] END
                    ORDER BY p.created_at DESC,p.id),'[]'::jsonb),
                    'page',CAST(:page AS int),'pageSize',CAST(:size AS int))::text
                FROM (SELECT o.id,o.created_at,jsonb_build_object(
                    'id',o.id,'number',d.number,'version',d.version,'state',d.state,'status',o.status,
                    'supplierId',o.supplier_id,'warehouseId',o.warehouse_id,'expectedOn',o.expected_on,
                    'net',o.net::text,'tax',o.tax::text,'gross',o.gross::text,'valuationAmount',o.valuation_amount::text) body
                    FROM purchase.orders o JOIN platform.documents d
                      ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                    WHERE o.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR o.supplier_id=CAST(:supplier AS uuid))
                      AND (CAST(:status AS text) IS NULL OR o.status=:status)
                    ORDER BY o.created_at DESC,o.id LIMIT :size OFFSET :offset) p
                """).param("cost", showCost(scope)).param("page", page).param("size", pageSize)
                .param("company", scope.companyId()).param("supplier", supplierId).param("status", status)
                .param("offset", offset).query(String.class).single()));
    }

    @GetMapping("/api/v1/purchase-orders/{id}")
    ResponseEntity<String> detail(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), "purchase.orders.read");
        return json(staff.inCompany(scope, requestId(request), () -> {
            requireVisible(id);
            return view(scope, id);
        }));
    }

    private String view(StaffScope.CompanyAccess scope, UUID id) {
        return jdbc.sql("""
                SELECT jsonb_build_object('order',
                    CASE WHEN :cost THEN h.body ELSE h.body-ARRAY['net','tax','gross','valuationAmount'] END,
                    'lines',COALESCE((SELECT jsonb_agg(CASE WHEN :cost THEN x.body ELSE
                        x.body-ARRAY['unitCost','net','tax','gross','valuationAmount','taxRate','recoverableGst'] END
                        ORDER BY x.line_no) FROM (
                        SELECT dl.line_no,jsonb_build_object('id',l.id,'lineNo',dl.line_no,'productId',l.product_id,
                            'productUnitId',l.product_unit_id,'itemType',l.item_type,'quantity',l.quantity::text,
                            'baseQuantity',l.base_quantity::text,'unitCost',l.unit_cost::text,'net',l.net::text,
                            'tax',l.tax::text,'gross',l.gross::text,'valuationAmount',l.valuation_amount::text,
                            'taxRate',l.tax_rate::text,'recoverableGst',l.recoverable_gst,'sku',l.snapshot->>'sku',
                            'name',l.snapshot->>'name','unitCode',l.snapshot->>'unitCode',
                            'conversionToBase',l.snapshot->>'conversionToBase','quantityStep',l.snapshot->>'quantityStep',
                            'receivedQuantity',r.qty::text,
                            'openQuantity',(CASE WHEN o.status='CONFIRMED' THEN l.quantity-r.qty ELSE 0 END)::text,
                            'closedQuantity',(CASE WHEN o.status='CLOSED' THEN l.quantity-r.qty ELSE 0 END)::text) body
                        FROM purchase.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id
                        CROSS JOIN LATERAL (SELECT COALESCE(sum(quantity),0) qty FROM purchase.receipt_lines
                            WHERE company_id=l.company_id AND order_line_id=l.id) r
                        WHERE l.company_id=o.company_id AND l.order_id=o.id) x),'[]'::jsonb))::text
                FROM purchase.orders o JOIN platform.documents d
                  ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                CROSS JOIN LATERAL (SELECT jsonb_build_object('id',o.id,'companyId',o.company_id,
                    'supplierId',o.supplier_id,'warehouseId',o.warehouse_id,'status',o.status,'expectedOn',o.expected_on,
                    'notes',o.notes,'gstRegistered',o.gst_registered,'net',o.net::text,'tax',o.tax::text,'gross',o.gross::text,
                    'valuationAmount',o.valuation_amount::text,
                    'closedAt',(to_json(o.closed_at AT TIME ZONE 'UTC') #>> '{}')||'Z','closeReason',o.close_reason,
                    'createdAt',(to_json(o.created_at AT TIME ZONE 'UTC') #>> '{}')||'Z','createdBy',o.created_by,
                    'number',d.number,'state',d.state,'version',d.version,'businessDate',d.business_date,
                    'supplier',o.supplier_snapshot) body) h
                WHERE o.company_id=:company AND o.id=:id
                """).param("cost", showCost(scope)).param("company", scope.companyId()).param("id", id)
                .query(String.class).optional().orElseThrow(() ->
                        new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
    }

    private static boolean showCost(StaffScope.CompanyAccess scope) {
        return List.of(scope.permissions()).contains("purchase.cost.read");
    }

    private static String requestId(HttpServletRequest request) {
        return (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }

    private static ResponseEntity<String> json(String body) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }
}
