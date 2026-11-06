package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.*;
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
class DirectOrders {
    private final StaffScope staff;private final JdbcClient jdbc;private final QuoteDrafts drafts;private final LegacyRows rows;
    private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;private final OrderConfirmation confirmation;
    DirectOrders(StaffScope staff,JdbcClient jdbc,QuoteDrafts drafts,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json,OrderConfirmation confirmation) {
        this.staff=staff;this.jdbc=jdbc;this.drafts=drafts;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;this.confirmation=confirmation;
    }
    @PostMapping("/api/v1/sales-orders")
    ResponseEntity<String> create(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.orders.create");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,rid,()->{
            if(!List.of(scope.permissions()).contains("sales.orders.read"))throw new StaffScope.Failure(403,"permission_denied","Direct order creation requires order reading permission.");
            drafts.customer(scope,input.customerId);
            jdbc.sql("SELECT w.id FROM catalog.warehouses w WHERE w.company_id=:company AND w.id=:id AND (:all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=:membership))")
                .param("company",scope.companyId()).param("id",input.warehouseId).param("all",List.of(scope.permissions()).contains("warehouses.all")).param("membership",scope.membershipId()).query(UUID.class).optional().orElseThrow(DirectOrders::notFound);
            String reason=SupplierBills.text(input.reason,"reason",2000,true),notes=SupplierBills.text(input.notes,"notes",2000,false);if(notes==null)notes="";
            QuoteDrafts.validateLines(input.lines);
            String canonical=QuotePricing.canonical(QuoteDrafts.map("customerId",input.customerId,"customerBranchId",input.customerBranchId,"warehouseId",input.warehouseId,
                "lines",input.lines.stream().map(QuoteDrafts::lineMap).toList(),"reason",reason,"notes",notes));
            String finalNotes=notes;
            return writes.execute(scope,"POST /sales-orders",request.getHeader("Idempotency-Key"),canonical,()->{
                jdbc.sql("SELECT id FROM crm.customers WHERE company_id=:company AND id=:id FOR UPDATE").param("company",scope.companyId()).param("id",input.customerId).query(UUID.class).optional().orElseThrow(DirectOrders::notFound);
                var quote=new QuoteDrafts.Input();quote.customerId=input.customerId;quote.customerBranchId=input.customerBranchId;quote.warehouseId=input.warehouseId;quote.lines=input.lines;quote.notes=finalNotes;
                var built=drafts.build(scope,quote);
                var lines=java.util.stream.IntStream.range(0,built.lines().size()).mapToObj(i->{var l=built.lines().get(i);return new OrderConfirmation.Line(i+1,null,l.product(),l.input().productUnitId,l.type(),l.qty(),l.base(),l.price(),l.net(),l.tax(),l.gross(),QuotePricing.canonical(l.snapshot()));}).toList();
                var confirmed=confirmation.confirm(scope,new OrderConfirmation.Request(input.customerId,input.customerBranchId,input.warehouseId,built.today(),built.creditLimit(),QuotePricing.canonical(built.snapshot()),built.net(),built.tax(),built.gross(),lines,null,null,reason,finalNotes,built.at()));
                UUID id=confirmed.id();var doc=QuoteDrafts.map("number",confirmed.number(),"version",confirmed.version());
                audit.record(scope,"sales.order_confirmed","sales_order",id,rid,Map.of("orderOrigin","DIRECT","reason",reason,"number",doc.get("number")));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(QuoteDrafts.map("orderId",id,"number",doc.get("number"),"version",doc.get("version"),"state","CONFIRMED","orderOrigin","DIRECT","sourceQuoteId",null)));
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    private static BigDecimal number(Map<String,Object> row,String name){return new BigDecimal(row.get(name).toString());}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Input {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerBranchId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID warehouseId=new UUID(0,0);
        public List<QuoteDrafts.Line> lines;public String reason,notes;
    }
}
