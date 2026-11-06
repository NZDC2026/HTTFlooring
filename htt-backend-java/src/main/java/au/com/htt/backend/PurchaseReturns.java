package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
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
class PurchaseReturns {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    PurchaseReturns(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;
    }
    @PostMapping("/api/v1/purchase-receipts/{id}/returns")
    ResponseEntity<String> receive(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody ReturnInput input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.returns.post");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50
                && lines.stream().allMatch(l->l!=null && valid(l.receiptLineId) && !ZERO.equals(l.billLineId))
                && lines.stream().map(l->new Pair(l.receiptLineId,l.billLineId)).distinct().count()==lines.size(),
                "lines","Supply 1..50 distinct receipt/bill sources.");
            lines.forEach(l->quantity(l.quantity));
            var sort=Comparator.comparing((ReturnLine l)->l.receiptLineId.toString())
                .thenComparing(l->l.billLineId==null?null:l.billLineId.toString(),Comparator.nullsFirst(Comparator.naturalOrder()));
            String items=lines.stream().sorted(sort).map(l->"{\"receiptLineId\":\""+l.receiptLineId+"\",\"quantity\":\""
                +l.quantity.toPlainString()+"\",\"billLineId\":"+(l.billLineId==null?"null":"\""+l.billLineId+"\"")+"}")
                .collect(Collectors.joining(",","[","]"));
            return writes.execute(scope,"POST /purchase-receipts/"+id+"/returns",request.getHeader("Idempotency-Key"),body(id,reference,reason,items),()->{
                UUID doc=jdbc.sql("SELECT purchase.return_goods(:id,:reference,:reason,CAST(:lines AS jsonb))")
                    .param("id",id).param("reference",reference).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.goods_returned","purchase_return",doc,requestId,Map.of("receiptId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(returnView(scope,doc,false)));
            });
        });
        return response(result);
    }
    @GetMapping("/api/v1/purchase-returns/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.returns.read");
        return staff.inCompany(scope,requestId(request),()->returnView(scope,id,false));
    }
    @GetMapping("/api/v1/accounting/purchase-returns/{id}")
    Map<String,Object> financial(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.read");
        return staff.inCompany(scope,requestId(request),()->returnView(scope,id,true));
    }
    @GetMapping("/api/v1/warehouse/purchase-receipts/{id}/return-sources")
    Map<String,Object> sources(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.returns.read");
        return staff.inCompany(scope,requestId(request),()->{
            UUID warehouse=jdbc.sql("SELECT warehouse_id FROM purchase.receipts WHERE company_id=:company AND id=:id")
                .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(PurchaseReturns::notFound);
            warehouse(warehouse);
            var items=jdbc.sql("""
                SELECT rl.id AS receipt_line_id,bl.id AS bill_line_id,bl.quantity-coalesce((SELECT sum(quantity) FROM purchase.return_lines WHERE company_id=bl.company_id AND bill_line_id=bl.id),0) AS available_quantity
                FROM purchase.receipt_lines rl JOIN purchase.bill_lines bl ON bl.company_id=rl.company_id AND bl.receipt_line_id=rl.id WHERE rl.company_id=:company AND rl.receipt_id=:id
                UNION ALL SELECT rl.id,NULL::uuid,rl.quantity-coalesce((SELECT sum(quantity) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id),0)-coalesce((SELECT sum(quantity) FROM purchase.return_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id AND bill_line_id IS NULL),0) FROM purchase.receipt_lines rl WHERE rl.company_id=:company AND rl.receipt_id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
            return Map.of("items",items);
        });
    }
    @PostMapping("/api/v1/supplier-bills/{id}/credits")
    ResponseEntity<String> credit(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody CreditInput input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.post");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50 && lines.stream().allMatch(l->l!=null && valid(l.returnLineId))
                && lines.stream().map(l->l.returnLineId).distinct().count()==lines.size(),"lines","Supply 1..50 distinct billed return lines.");
            lines.forEach(l->quantity(l.quantity));
            String items=lines.stream().sorted(Comparator.comparing(l->l.returnLineId.toString())).map(l->"{\"returnLineId\":\""
                +l.returnLineId+"\",\"quantity\":\""+l.quantity.toPlainString()+"\"}").collect(Collectors.joining(",","[","]"));
            return writes.execute(scope,"POST /supplier-bills/"+id+"/credits",request.getHeader("Idempotency-Key"),body(id,reference,reason,items),()->{
                UUID doc=jdbc.sql("SELECT purchase.post_supplier_credit(:id,:reference,:reason,CAST(:lines AS jsonb))")
                    .param("id",id).param("reference",reference).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.supplier_credited","supplier_credit",doc,requestId,Map.of("billId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(creditView(scope,doc)));
            });
        });
        return response(result);
    }
    @GetMapping("/api/v1/supplier-credits/{id}")
    Map<String,Object> creditDetail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.read");
        return staff.inCompany(scope,requestId(request),()->creditView(scope,id));
    }
    @GetMapping("/api/v1/supplier-credits")
    StaffIdentityController.Page<Map<String,Object>> credits(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @RequestParam(required=false) UUID supplierId,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="25") int pageSize) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.read");
        return staff.inCompany(scope,requestId(request),()->{
            int offset=SalesRead.offset(page,pageSize);
            var items=jdbc.sql("""
                SELECT cn.id,cn.bill_id,cn.supplier_id,cn.reference,cn.net,cn.tax,cn.gross,cn.credit_type,cn.expense_amount,d.number,d.business_date::text
                FROM purchase.supplier_credit_notes cn JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id
                WHERE cn.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR cn.supplier_id=CAST(:supplier AS uuid))
                ORDER BY cn.created_at DESC,cn.id LIMIT :size OFFSET :offset
                """).param("company",scope.companyId()).param("supplier",supplierId).param("size",pageSize).param("offset",offset).query(rows::row).list();
            return new StaffIdentityController.Page<>(items,page,pageSize);
        });
    }
    private Map<String,Object> returnView(StaffScope.CompanyAccess scope,UUID id,boolean financial) {
        var header=jdbc.sql("""
            SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM purchase.returns r
            JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=:company AND r.id=:id
            """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(PurchaseReturns::notFound);
        if (!financial) warehouse((UUID)header.get("warehouseId"));
        boolean cost=financial || List.of(scope.permissions()).contains("purchase.cost.read");
        var lines=jdbc.sql("SELECT * FROM purchase.return_lines WHERE company_id=:company AND return_id=:id ORDER BY id")
            .param("company",scope.companyId()).param("id",id).query(rows::row).list();
        if (!cost) {
            header.remove("journalEntryId");
            for (var line:lines) for (String field:List.of("net","tax","recoverableTax","valuationAmount","cost","valueAfter","contraAccountId")) line.remove(field);
        }
        return Map.of("return",header,"lines",lines);
    }
    Map<String,Object> creditView(StaffScope.CompanyAccess scope,UUID id) {
        var header=jdbc.sql("""
            SELECT cn.*,d.number,d.state,d.version,d.business_date::text FROM purchase.supplier_credit_notes cn
            JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=:company AND cn.id=:id
            """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(PurchaseReturns::notFound);
        var lines=jdbc.sql("SELECT *,refundable_amount AS available_apply_amount FROM purchase.supplier_credit_line_balances WHERE company_id=:company AND credit_note_id=:id ORDER BY id")
            .param("company",scope.companyId()).param("id",id).query(rows::row).list();
        return Map.of("credit",header,"lines",lines);
    }
    private void warehouse(UUID id) {
        jdbc.sql("SELECT inventory.require_access('purchase.returns.read',:warehouse)").param("warehouse",id).query((row,index)->true).single();
    }
    private static final UUID ZERO=new UUID(0,0);
    private static boolean valid(UUID id) {return id!=null && !ZERO.equals(id);}
    private static void require(boolean test,String field,String message) {if (!test) throw new BranchQuery.InvalidFilter(field,message);}
    private static void quantity(BigDecimal value) {
        require(value.signum()>=0 && value.compareTo(new BigDecimal("99999999999999.999999"))<=0 && value.stripTrailingZeros().scale()<=6,
            "quantity","quantity must be nonnegative, within the storage limit, and have at most 6 decimals.");
        require(value.signum()>0,"quantity","Positive quantity required.");
    }
    private static String text(String value,String field,int limit) {
        String s=value==null?"":value.strip();require(!s.isEmpty() && s.length()<=limit,field,field+" must contain 1.."+limit+" characters.");return s;
    }
    private static String body(UUID id,String reference,String reason,String lines) {return "{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)+",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"lines\":"+lines+"}";}
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound() {return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r) {return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    record ReturnInput(String reference,String reason,List<ReturnLine> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    record CreditInput(String reference,String reason,List<CreditLine> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class ReturnLine {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID receiptLineId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal quantity=BigDecimal.ZERO;
        public UUID billLineId;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class CreditLine {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID returnLineId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal quantity=BigDecimal.ZERO;
    }
    private record Pair(UUID receipt,UUID bill) {}
}
