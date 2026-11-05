package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class WarehouseOrders {
    private static final String PICK_READ = "inventory.picks.read";
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    WarehouseOrders(StaffScope staff, JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.staff = staff;
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    @GetMapping("/api/v1/warehouse/orders")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @RequestParam UUID warehouseId, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int pageSize) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), PICK_READ);
        return json(staff.inCompany(scope, requestId(request), () -> {
            warehouse(warehouseId);
            return jdbc.sql("""
                    SELECT jsonb_build_object('items',COALESCE(jsonb_agg(
                        jsonb_build_object('id',p.id,'number',p.number,'version',p.version,'customer',p.customer_snapshot)
                        ORDER BY p.created_at,p.id),'[]'::jsonb),'page',CAST(:page AS int),'pageSize',CAST(:size AS int))::text
                    FROM (
                        SELECT o.id,d.number,d.version,o.customer_snapshot,o.created_at FROM sales.orders o
                        JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                        WHERE o.company_id=:company AND o.warehouse_id=:warehouse AND d.state='CONFIRMED' AND EXISTS(
                            SELECT 1 FROM sales.order_lines l WHERE l.company_id=o.company_id AND l.order_id=o.id
                            AND l.item_type='STOCK' AND l.base_quantity>COALESCE((
                                SELECT sum(pl.base_quantity) FROM inventory.pick_lines pl JOIN inventory.picks p
                                ON p.company_id=pl.company_id AND p.id=pl.pick_id
                                WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id AND p.state='DISPATCHED'),0))
                        ORDER BY o.created_at,o.id LIMIT :size OFFSET :offset
                    ) p
                    """).param("company", scope.companyId()).param("warehouse", warehouseId)
                    .param("page", page).param("size", pageSize).param("offset", SalesRead.offset(page, pageSize))
                    .query(String.class).single();
        }));
    }

    @GetMapping("/api/v1/warehouse/orders/{id}")
    ResponseEntity<String> detail(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), PICK_READ);
        return json(staff.inCompany(scope, requestId(request), () -> {
            if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id", id).query(Boolean.class).single()) {
                throw new StaffScope.Failure(404, "not_found", "Document is unavailable in this scope.");
            }
            UUID warehouse = jdbc.sql("""
                    SELECT o.warehouse_id FROM sales.orders o JOIN platform.documents d
                      ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                    WHERE o.company_id=:company AND o.id=:id
                    """).param("company", scope.companyId()).param("id", id).query(UUID.class).optional()
                    .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
            warehouse(warehouse);
            return jdbc.sql("""
                    SELECT jsonb_build_object('id',o.id,'number',d.number,'version',d.version,'state',d.state,
                      'warehouseId',o.warehouse_id,'customer',o.customer_snapshot,
                      'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',l.id,'productId',l.product_id,'productUnitId',l.product_unit_id,'quantity',l.quantity::text,
                        'baseQuantity',l.base_quantity::text,'sku',l.snapshot->>'sku','name',l.snapshot->>'name',
                        'unitCode',l.snapshot->>'unitCode','pickedQuantity',q.picked::text,
                        'dispatchedQuantity',q.dispatched::text) ORDER BY l.id)
                        FROM sales.order_lines l CROSS JOIN LATERAL (
                          SELECT coalesce(sum(pl.quantity) FILTER(WHERE p.state='PICKED'),0) AS picked,
                             coalesce(sum(pl.quantity) FILTER(WHERE p.state='DISPATCHED'),0) AS dispatched
                          FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id
                          WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id
                        ) q WHERE l.company_id=o.company_id AND l.order_id=o.id AND l.item_type='STOCK'),'[]'::jsonb),
                      'picks',COALESCE((SELECT jsonb_agg(jsonb_build_object(
                        'id',p.id,'state',p.state,'number',pd.number,'version',pd.version) ORDER BY p.created_at,p.id)
                        FROM inventory.picks p JOIN platform.documents pd ON platform.document_visible(pd.id)
                          AND pd.company_id=p.company_id AND pd.id=p.id
                        WHERE p.company_id=o.company_id AND p.order_id=o.id),'[]'::jsonb))::text
                    FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id
                    WHERE o.company_id=:company AND o.id=:id
                    """).param("company", scope.companyId()).param("id", id).query(String.class).single();
        }));
    }

    @PostMapping("/api/v1/warehouse/orders/{id}/picks")
    ResponseEntity<String> createPick(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody PickInput input) {
        String permission = "inventory.picks.write";
        var scope = staff.require(token, request.getHeader("X-Company-Id"), permission);
        var result = staff.inCompany(scope, requestId(request), () -> {
            long expected = OrderWrites.version(request.getHeader("If-Match"));
            var lines = input.lines();
            if (lines == null || lines.isEmpty() || lines.size() > 50
                    || lines.stream().anyMatch(line -> line == null || line.orderLineId() == null)
                    || lines.stream().map(PickLine::orderLineId).distinct().count() != lines.size()) {
                throw new StaffScope.Failure(422, "invalid_pick", "Supply 1–50 distinct stock order lines.");
            }
            var max = new BigDecimal("99999999999999.999999");
            for (var line : lines) {
                var quantity = line.quantity();
                if (quantity == null || quantity.signum() <= 0 || quantity.compareTo(max) > 0
                        || quantity.stripTrailingZeros().scale() > 6) {
                    throw new StaffScope.Failure(422, "invalid_quantity",
                            "Positive sales-unit quantities with at most six decimals required.");
                }
            }
            var order = pickOrder(scope, id, false);
            warehouse(order.warehouse(), permission);
            var sorted = lines.stream().sorted(Comparator.comparing(line -> line.orderLineId().toString())).toList();
            String canonical = "{\"expected\":" + expected + ",\"lines\":" + pickLinesJson(sorted) + "}";
            return writes.execute(scope, "POST /warehouse/orders/" + id + "/picks",
                    request.getHeader("Idempotency-Key"), canonical,
                    () -> storePick(scope, id, expected, sorted, lines, requestId(request)));
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }

    private IdempotentWrite.StoredResponse storePick(StaffScope.CompanyAccess scope, UUID orderId, long expected,
            List<PickLine> sorted, List<PickLine> input, String requestId) {
        var order = pickOrder(scope, orderId, true);
        if (order.version() != expected) {
            throw new StaffScope.Failure(409, "version_conflict", "Document changed; refresh before retrying.");
        }
        if (!"CONFIRMED".equals(order.state())) {
            throw new StaffScope.Failure(409, "order_not_confirmed", "Only confirmed orders can be picked.");
        }
        UUID pick = UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by)
                SELECT :pick,:company,'PICK',inventory.next_number('PICK'),(now() AT TIME ZONE timezone)::date,
                  'CONFIRMED',:actor FROM core.companies WHERE id=:company
                """).param("pick", pick).param("company", scope.companyId()).param("actor", scope.actorId()).update();
        jdbc.sql("INSERT INTO inventory.picks(id,company_id,order_id,created_by) VALUES (:pick,:company,:order,:actor)")
                .param("pick", pick).param("company", scope.companyId()).param("order", orderId)
                .param("actor", scope.actorId()).update();
        for (var line : sorted) {
            var quantities = jdbc.sql("""
                    SELECT quantity,base_quantity FROM sales.order_lines
                    WHERE company_id=:company AND order_id=:order AND id=:line AND item_type='STOCK'
                    """).param("company", scope.companyId()).param("order", orderId).param("line", line.orderLineId())
                    .query((row, index) -> new Quantities(row.getBigDecimal(1), row.getBigDecimal(2)))
                    .optional().orElseThrow(WarehouseOrders::unavailable);
            BigDecimal base;
            try {
                base = line.quantity().multiply(quantities.base()).divide(quantities.sales(), 6, RoundingMode.UNNECESSARY);
            } catch (ArithmeticException fractional) {
                throw new StaffScope.Failure(422, "invalid_base_quantity", "Quantity cannot be represented in base units.");
            }
            jdbc.sql("""
                    INSERT INTO inventory.pick_lines(company_id,pick_id,order_line_id,quantity,base_quantity)
                    VALUES (:company,:pick,:line,:quantity,:base)
                    """).param("company", scope.companyId()).param("pick", pick).param("line", line.orderLineId())
                    .param("quantity", line.quantity()).param("base", base).update();
        }
        jdbc.sql("SELECT inventory.assign_pick_positions(:pick,CAST(:lines AS jsonb))")
                .param("pick", pick).param("lines", pickLinesJson(input)).query((row, index) -> true).single();
        for (var line : input) {
            if (line.shortPickReason() != null) {
                recordShortage(scope, pick, line);
            }
        }
        audit.record(scope, "inventory.picked", "pick", pick, requestId, Map.of("orderId", orderId));
        return new IdempotentWrite.StoredResponse(201, pickView(scope, pick));
    }

    private void recordShortage(StaffScope.CompanyAccess scope, UUID pick, PickLine line) {
        String reason = line.shortPickReason().strip();
        if (reason.isEmpty() || reason.length() > 500) {
            throw new BranchQuery.InvalidFilter("shortPickReason", "shortPickReason must contain 1..500 characters.");
        }
        var missing = jdbc.sql("""
                SELECT l.quantity-COALESCE((SELECT sum(pl.quantity)
                    FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id
                    WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id AND p.state IN('PICKED','DISPATCHED')),0)
                FROM sales.order_lines l WHERE l.company_id=:company AND l.id=:line
                """).param("company", scope.companyId()).param("line", line.orderLineId())
                .query(BigDecimal.class).optional().orElseThrow(WarehouseOrders::unavailable);
        if (missing.signum() <= 0) {
            throw new BranchQuery.InvalidFilter("shortPickReason", "No short-picked remainder exists.");
        }
        jdbc.sql("""
                INSERT INTO inventory.pick_shortages(company_id,pick_id,order_line_id,missing_quantity,reason,created_by)
                VALUES (:company,:pick,:line,:missing,:reason,:actor)
                """).param("company", scope.companyId()).param("pick", pick).param("line", line.orderLineId())
                .param("missing", missing).param("reason", reason).param("actor", scope.actorId()).update();
    }

    private PickOrder pickOrder(StaffScope.CompanyAccess scope, UUID id, boolean lock) {
        return jdbc.sql("""
                SELECT d.state,d.version,o.warehouse_id FROM sales.orders o
                JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                WHERE o.company_id=:company AND o.id=:id
                """ + (lock ? " FOR UPDATE OF d" : "")).param("company", scope.companyId()).param("id", id)
                .query((row, index) -> new PickOrder(row.getString(1), row.getLong(2), row.getObject(3, UUID.class)))
                .optional().orElseThrow(WarehouseOrders::unavailable);
    }

    private static String pickLinesJson(List<PickLine> lines) {
        return lines.stream().map(line -> "{\"orderLineId\":\"" + line.orderLineId()
                + "\",\"quantity\":\"" + line.quantity().toPlainString()
                + "\",\"shortPickReason\":" + (line.shortPickReason() == null ? "null" :
                    CollaborationCreate.legacyString(line.shortPickReason()))
                + ",\"positions\":" + (line.positions() == null ? "null" : line.positions().stream()
                    .map(position -> position == null ? "null" : "{\"positionId\":\"" + position.positionId()
                        + "\",\"baseQuantity\":\"" + (position.baseQuantity() == null ? "0" : position.baseQuantity().toPlainString()) + "\"}")
                    .collect(Collectors.joining(",", "[", "]"))) + "}")
                .collect(Collectors.joining(",", "[", "]"));
    }

    record PickInput(List<PickLine> lines) {}
    record PickLine(UUID orderLineId, BigDecimal quantity, String shortPickReason, List<Position> positions) {}
    record Position(UUID positionId, BigDecimal baseQuantity) {}
    private record PickOrder(String state, long version, UUID warehouse) {}
    private record Quantities(BigDecimal sales, BigDecimal base) {}

    @GetMapping("/api/v1/warehouse/picks/{id}")
    ResponseEntity<String> pick(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        var scope = staff.require(token, request.getHeader("X-Company-Id"), PICK_READ);
        return json(staff.inCompany(scope, requestId(request), () -> pickView(scope, id)));
    }

    @PostMapping("/api/v1/warehouse/picks/{id}/cancel")
    ResponseEntity<String> cancelPick(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id) {
        String permission = "inventory.picks.write";
        var scope = staff.require(token, request.getHeader("X-Company-Id"), permission);
        var result = staff.inCompany(scope, requestId(request), () -> {
            long expected = OrderWrites.version(request.getHeader("If-Match"));
            scopedPick(scope, id, permission);
            return writes.execute(scope, "POST /warehouse/picks/" + id + "/cancel",
                    request.getHeader("Idempotency-Key"), "{\"expected\":" + expected + "}", () -> {
                jdbc.sql("SELECT inventory.cancel_pick(:id,:version)").param("id", id).param("version", expected)
                        .query((row, index) -> true).single();
                audit.record(scope, "inventory.pick_cancelled", "pick", id, requestId(request), Map.of());
                return new IdempotentWrite.StoredResponse(200, pickView(scope, id));
            });
        });
        return json(result.body());
    }

    @PostMapping("/api/v1/warehouse/picks/{id}/confirm")
    ResponseEntity<String> confirmPick(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Dispatch input) {
        String permission = "inventory.dispatch";
        var scope = staff.require(token, request.getHeader("X-Company-Id"), permission);
        var result = staff.inCompany(scope, requestId(request), () -> {
            long expected = OrderWrites.version(request.getHeader("If-Match"));
            String mode = input.mode() == null ? jdbc.sql("""
                    SELECT default_dispatch_mode FROM core.business_preferences WHERE company_id=:company
                    """).param("company", scope.companyId()).query(String.class).optional()
                    .orElseThrow(WarehouseOrders::unavailable) : input.mode();
            if (!List.of("PICKUP", "DELIVERY").contains(mode)) {
                throw new BranchQuery.InvalidFilter("mode", "Invalid mode.");
            }
            String recipient = requiredText(input.recipient(), "recipient");
            String reference = requiredText(input.reference(), "reference");
            scopedPick(scope, id, permission);
            String canonical = "{\"expected\":" + expected + ",\"mode\":"
                    + (input.mode() == null ? "null" : CollaborationCreate.legacyString(input.mode()))
                    + ",\"recipient\":" + CollaborationCreate.legacyString(recipient)
                    + ",\"reference\":" + CollaborationCreate.legacyString(reference) + "}";
            return writes.execute(scope, "POST /warehouse/picks/" + id + "/confirm",
                    request.getHeader("Idempotency-Key"), canonical, () -> {
                jdbc.sql("SELECT inventory.confirm_pick(:id,:version,:mode,:recipient,:reference)")
                        .param("id", id).param("version", expected).param("mode", mode)
                        .param("recipient", recipient).param("reference", reference).query((row, index) -> true).single();
                audit.record(scope, "inventory.dispatched", "pick", id, requestId(request),
                        Map.of("mode", mode, "recipient", recipient, "reference", reference));
                return new IdempotentWrite.StoredResponse(200, pickView(scope, id));
            });
        });
        return json(result.body());
    }

    private String pickView(StaffScope.CompanyAccess scope, UUID id) {
        scopedPick(scope, id, PICK_READ);
        return jdbc.sql("""
                SELECT jsonb_build_object(
                  'id',p.id,'orderId',p.order_id,'number',d.number,'version',d.version,'state',p.state,
                  'mode',p.mode,'recipient',p.recipient,'reference',p.reference,
                  'confirmedAt',(to_json(p.confirmed_at AT TIME ZONE 'UTC') #>> '{}')||'Z',
                  'positions',COALESCE((SELECT jsonb_agg(jsonb_build_object('pickLineId',a.pick_line_id,
                      'positionId',a.position_id,'quantity',a.quantity::text) ORDER BY a.id)
                      FROM inventory.pick_positions a JOIN inventory.pick_lines pl
                        ON pl.company_id=a.company_id AND pl.id=a.pick_line_id
                      WHERE a.company_id=p.company_id AND pl.pick_id=p.id),'[]'::jsonb),
                  'shortages',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'orderLineId',s.order_line_id,
                      'missingQuantity',s.missing_quantity::text,'reason',s.reason,
                      'createdAt',(to_json(s.created_at AT TIME ZONE 'UTC') #>> '{}')||'Z') ORDER BY s.created_at,s.id)
                      FROM inventory.pick_shortages s WHERE s.company_id=p.company_id AND s.pick_id=p.id),'[]'::jsonb),
                  'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object('orderLineId',l.order_line_id,
                      'quantity',l.quantity::text,'baseQuantity',l.base_quantity::text) ORDER BY l.order_line_id)
                      FROM inventory.pick_lines l WHERE l.company_id=p.company_id AND l.pick_id=p.id),'[]'::jsonb))::text
                FROM inventory.picks p JOIN platform.documents d ON d.company_id=p.company_id AND d.id=p.id
                WHERE p.company_id=:company AND p.id=:id
                """).param("company", scope.companyId()).param("id", id).query(String.class).optional()
                .orElseThrow(WarehouseOrders::unavailable);
    }

    private void scopedPick(StaffScope.CompanyAccess scope, UUID id, String permission) {
        UUID warehouse = jdbc.sql("""
                SELECT o.warehouse_id FROM inventory.picks p
                JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=p.company_id AND d.id=p.id
                JOIN sales.orders o ON o.company_id=p.company_id AND o.id=p.order_id
                JOIN platform.documents od ON platform.document_visible(od.id) AND od.company_id=o.company_id AND od.id=o.id
                WHERE p.company_id=:company AND p.id=:id
                """).param("company", scope.companyId()).param("id", id).query(UUID.class).optional()
                .orElseThrow(WarehouseOrders::unavailable);
        jdbc.sql("SELECT inventory.require_access(:permission,:id)").param("permission", permission)
                .param("id", warehouse).query((row, index) -> true).single();
    }

    private static String requiredText(String input, String field) {
        String value = input == null ? "" : input.strip();
        if (value.isEmpty() || value.length() > 200) {
            throw new BranchQuery.InvalidFilter(field, field + " must contain 1..200 characters.");
        }
        return value;
    }

    private static StaffScope.Failure unavailable() {
        return new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope.");
    }

    record Dispatch(String mode, String recipient, String reference) {}

    private void warehouse(UUID id) {
        warehouse(id, PICK_READ);
    }

    private void warehouse(UUID id, String permission) {
        jdbc.sql("SELECT inventory.require_access(:permission,:id)").param("permission", permission)
                .param("id", id).query((row, index) -> true).single();
    }

    private static String requestId(HttpServletRequest request) {
        return (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }

    private static ResponseEntity<String> json(String body) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
    }
}
