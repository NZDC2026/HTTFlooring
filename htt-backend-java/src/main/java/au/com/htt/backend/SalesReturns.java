package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class SalesReturns {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    SalesReturns(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;
    }

    @GetMapping("/api/v1/warehouse/orders/{id}/returnable")
    Map<String,Object> returnable(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.returns.read");
        return staff.inCompany(scope,requestId(request),()->{
            order(scope,id,"inventory.returns.read");
            var movements=jdbc.sql("""
                    SELECT m.id AS stock_movement_id,pl.order_line_id,pl.quantity,m.quantity AS base_quantity,
                    ol.snapshot->>'sku' AS sku,ol.snapshot->>'name' AS name,ol.snapshot->>'unitCode' AS unit_code,
                    coalesce((SELECT sum(quantity) FROM inventory.sales_return_lines WHERE company_id=m.company_id AND stock_movement_id=m.id),0) AS returned_quantity
                    FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id
                    JOIN sales.order_lines ol ON ol.company_id=pl.company_id AND ol.id=pl.order_line_id
                    WHERE ol.company_id=:company AND ol.order_id=:id ORDER BY m.id
                    """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
            var invoiceLines=jdbc.sql("""
                    SELECT l.id,l.order_line_id,d.number AS invoice_number,l.quantity,
                    coalesce((SELECT sum(quantity) FROM inventory.sales_return_lines WHERE company_id=l.company_id AND invoice_line_id=l.id),0) AS returned_quantity
                    FROM sales.invoice_lines l JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id
                    JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id WHERE i.company_id=:company AND i.order_id=:id AND d.state='POSTED' AND platform.document_visible(i.id) ORDER BY l.id
                    """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
            var header=jdbc.sql("SELECT o.warehouse_id,o.customer_id,d.version,p.legal_name AS customer_name FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id JOIN crm.customers c ON c.company_id=o.company_id AND c.id=o.customer_id JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE o.company_id=:company AND o.id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).single();
            var result=new java.util.HashMap<String,Object>(header);result.put("orderId",id);result.put("movements",movements);result.put("invoiceLines",invoiceLines);return result;
        });
    }

    @PostMapping("/api/v1/sales-orders/{id}/returns")
    ResponseEntity<String> receive(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.returns.write");
        String requestId=requestId(request);
        var response=staff.inCompany(scope,requestId,()->{
            order(scope,id,"inventory.returns.write");
            require(input.disposition!=null && List.of("RESTOCK","QUARANTINE").contains(input.disposition),"disposition","Invalid disposition.");
            String reason=input.reason==null?"":input.reason.strip();
            require(!reason.isEmpty() && reason.length()<=2000,"reason","reason must contain 1..2000 characters.");
            var lines=input.lines;
            require(lines!=null && !lines.isEmpty() && lines.size()<=50
                    && lines.stream().allMatch(l->l!=null && !new UUID(0,0).equals(l.stockMovementId)
                        && !new UUID(0,0).equals(l.invoiceLineId))
                    && lines.stream().map(l->new Pair(l.stockMovementId,l.invoiceLineId)).distinct().count()==lines.size(),
                    "lines","Supply distinct return movement/invoice pairs.");
            for (var line:lines) {
                require(line.quantity.signum()>=0 && line.quantity.compareTo(new BigDecimal("99999999999999.999999"))<=0
                        && line.quantity.stripTrailingZeros().scale()<=6,"quantity",
                        "quantity must be nonnegative, within the storage limit, and have at most 6 decimals.");
                require(line.quantity.signum()>0,"quantity","Positive quantity required.");
            }
            var sorted=Comparator.comparing((Line l)->l.stockMovementId.toString())
                    .thenComparing(l->l.invoiceLineId==null?null:l.invoiceLineId.toString(),Comparator.nullsFirst(Comparator.naturalOrder()));
            String items=lines.stream().sorted(sorted).map(l->"{\"stockMovementId\":\""+l.stockMovementId
                    +"\",\"quantity\":\""+l.quantity.toPlainString()+"\",\"invoiceLineId\":"
                    +(l.invoiceLineId==null?"null":"\""+l.invoiceLineId+"\"")+"}").collect(Collectors.joining(",","[","]"));
            String canonical="{\"warehouseId\":\""+input.warehouseId+"\",\"disposition\":"+CollaborationCreate.legacyString(input.disposition)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /sales-orders/"+id+"/returns",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID returned=jdbc.sql("SELECT inventory.receive_sales_return(:order,:warehouse,:disposition,:reason,CAST(:lines AS jsonb))")
                        .param("order",id).param("warehouse",input.warehouseId).param("disposition",input.disposition)
                        .param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"inventory.sales_returned","sales_return",returned,requestId,
                        Map.of("orderId",id,"disposition",input.disposition,"reason",reason));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,returned)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    @GetMapping("/api/v1/warehouse/returns/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.returns.read");
        return staff.inCompany(scope,requestId(request),()->view(scope,id));
    }

    private Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id) {
        var header=jdbc.sql("""
                SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM inventory.sales_returns r
                JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=:company AND r.id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(SalesReturns::notFound);
        order(scope,(UUID)header.get("orderId"),"inventory.returns.read");
        access("inventory.returns.read",(UUID)header.get("warehouseId"));
        Map<String,Object> result=new LinkedHashMap<>();
        for (String key:List.of("id","number","state","version","orderId","warehouseId","disposition","reason","businessDate")) result.put(key,header.get(key));
        result.put("lines",jdbc.sql("""
                SELECT id,stock_movement_id,order_line_id,invoice_line_id,quantity,base_quantity FROM inventory.sales_return_lines
                WHERE company_id=:company AND return_id=:id ORDER BY id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list());
        return result;
    }
    private void order(StaffScope.CompanyAccess scope,UUID id,String permission) {
        UUID warehouse=jdbc.sql("SELECT warehouse_id FROM sales.orders WHERE company_id=:company AND id=:id AND platform.document_visible(id)")
                .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(SalesReturns::notFound);
        access(permission,warehouse);
    }
    private void access(String permission,UUID warehouse) {
        jdbc.sql("SELECT inventory.require_access(:permission,:wh)").param("permission",permission).param("wh",warehouse).query((r,i)->true).list();
    }
    private static void require(boolean valid,String field,String message) {if (!valid) throw new BranchQuery.InvalidFilter(field,message);}
    private static StaffScope.Failure notFound() {return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID warehouseId=new UUID(0,0);
        public String disposition;
        public String reason;
        public List<Line> lines;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID stockMovementId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public BigDecimal quantity=BigDecimal.ZERO;
        public UUID invoiceLineId;
    }
    private record Pair(UUID movement,UUID invoiceLine) {}
}
