package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class TransitTransfers {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    TransitTransfers(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @PostMapping("/api/v1/inventory/transit-transfers")
    ResponseEntity<String> dispatch(@RequestBody InventoryOperations.Transfer input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.transit.dispatch");return response(staff.inCompany(scope,rid(request),()->{
        check(!input.sourceWarehouseId.equals(ZERO)&&!input.destinationWarehouseId.equals(ZERO)&&!input.sourceWarehouseId.equals(input.destinationWarehouseId),"warehouse","Distinct source and destination required.");String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
        check(input.lines!=null&&!input.lines.isEmpty()&&input.lines.size()<=50&&input.lines.stream().allMatch(l->l!=null&&!l.productId.equals(ZERO))&&input.lines.stream().map(l->l.productId).distinct().count()==input.lines.size(),"lines","Supply 1..50 distinct stock products.");
        for(var line:input.lines)quantity(line.quantity,"Positive base quantity required.");
        var lines=input.lines.stream().sorted(Comparator.comparing(l->l.productId.toString())).map(l->QuoteDrafts.map("productId",l.productId,"quantity",l.quantity)).toList();
        return writes.execute(scope,"POST /inventory/transit-transfers",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("sourceWarehouseId",input.sourceWarehouseId,"destinationWarehouseId",input.destinationWarehouseId,"reference",reference,"reason",reason,"lines",lines)),()->{
            UUID id=query("SELECT inventory.dispatch_transit(:source,:destination,:reference,:reason,CAST(:lines AS jsonb))",scope,QuoteDrafts.map("source",input.sourceWarehouseId,"destination",input.destinationWarehouseId,"reference",reference,"reason",reason,"lines",QuotePricing.value(lines))).query(UUID.class).single();
            audit.record(scope,"inventory.transit_dispatched","transit_transfer",id,rid(request),QuoteDrafts.map("SourceWarehouseId",input.sourceWarehouseId,"DestinationWarehouseId",input.destinationWarehouseId,"reference",reference));return stored(transfer(scope,id,false));
        });
    }));}
    @PostMapping("/api/v1/inventory/transit-transfers/{id}/{action:receipts|returns|shortages}")
    ResponseEntity<String> event(@PathVariable UUID id,@PathVariable String action,@RequestBody Event input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        String kind=switch(action){case "receipts"->"RECEIPT";case "returns"->"RETURN";case "shortages"->"SHORTAGE";default->throw new IllegalArgumentException();};
        String permission=switch(kind){case "RECEIPT"->"receive";case "RETURN"->"return";default->"resolve";};var scope=access(token,request,"inventory.transit."+permission);
        return response(staff.inCompany(scope,rid(request),()->{
            String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
            check(input.lines!=null&&!input.lines.isEmpty()&&input.lines.size()<=50&&input.lines.stream().allMatch(l->l!=null&&!l.transferLineId.equals(ZERO))&&input.lines.stream().map(l->l.transferLineId).distinct().count()==input.lines.size(),"lines","Supply 1..50 distinct shipment lines.");
            for(var line:input.lines)quantity(line.quantity,"Positive actual base quantity required.");
            var lines=input.lines.stream().sorted(Comparator.comparing(l->l.transferLineId.toString())).map(l->QuoteDrafts.map("transferLineId",l.transferLineId,"quantity",l.quantity)).toList();
            return writes.execute(scope,"POST "+request.getRequestURI(),request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"kind",kind,"reference",reference,"reason",reason,"lines",lines)),()->{
                UUID eid=query("SELECT inventory.post_transit_event(:id,:kind,:reference,:reason,CAST(:lines AS jsonb))",scope,QuoteDrafts.map("id",id,"kind",kind,"reference",reference,"reason",reason,"lines",QuotePricing.value(lines))).query(UUID.class).single();
                String auditAction=switch(kind){case "RECEIPT"->"inventory.transit_received";case "RETURN"->"inventory.transit_returned";default->"inventory.transit_shortage_posted";};
                audit.record(scope,auditAction,"transit_event",eid,rid(request),QuoteDrafts.map("transferId",id,"reference",reference));return stored(eventView(scope,eid,kind.equals("SHORTAGE")));
            });
        }));
    }
    @GetMapping("/api/v1/{area:inventory|accounting}/{kind:transit-transfers|transit-events}/{id}")
    ResponseEntity<String> detail(@PathVariable String area,@PathVariable String kind,@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){boolean financial=area.equals("accounting");var scope=access(token,request,financial?"inventory.control.read":"inventory.transit.read");return read(scope,request,()->kind.equals("transit-transfers")?transfer(scope,id,financial):eventView(scope,id,financial));}
    @GetMapping("/api/v1/{area:inventory|accounting}/transit-transfers")
    ResponseEntity<String> list(@PathVariable String area,@RequestParam(required=false) UUID warehouseId,@RequestParam(required=false) String state,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){boolean financial=area.equals("accounting");var scope=access(token,request,financial?"inventory.control.read":"inventory.transit.read");return read(scope,request,()->{
        if(!financial){if(warehouseId==null)throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");query("SELECT inventory.require_access('inventory.transit.read',:warehouse)",scope,QuoteDrafts.map("warehouse",warehouseId)).query((row,n)->0).single();}
        check(state==null||Set.of("IN_TRANSIT","PARTIAL","CLOSED").contains(state),"state","Invalid state.");int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var args=QuoteDrafts.map("warehouse",warehouseId,"state",state,"size",size,"offset",(p-1)*size);String where=" WHERE t.company_id=:company AND(CAST(:warehouse AS uuid) IS NULL OR t.source_id=:warehouse OR t.destination_id=:warehouse)AND(CAST(:state AS text) IS NULL OR t.state=:state)";
        var items=list("SELECT t.*,d.number,d.business_date::text FROM inventory.transit_transfer_balances t JOIN platform.documents d ON d.company_id=t.company_id AND d.id=t.id"+where+" ORDER BY t.created_at,t.id LIMIT :size OFFSET :offset",scope,args);items.forEach(row->redact(row,financial));Object total=financial?one("SELECT coalesce(sum(t.remaining_cost),0) AS remaining_cost FROM inventory.transit_transfer_balances t"+where,scope,args).get("remainingCost"):null;
        return QuoteDrafts.map("currency","AUD","remainingCost",total,"items",items,"page",p,"pageSize",size);
    });}
    private Map<String,Object> header(StaffScope.CompanyAccess scope,UUID id){return one("SELECT t.*,d.number,d.state AS document_state,d.version,d.business_date::text FROM inventory.transit_transfer_balances t JOIN platform.documents d ON d.company_id=t.company_id AND d.id=t.id WHERE t.company_id=:company AND t.id=:id",scope,QuoteDrafts.map("id",id));}
    private void scope(StaffScope.CompanyAccess scope,Map<String,Object> header){
        boolean allowed=query("SELECT :all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes WHERE company_id=:company AND membership_id=:member AND warehouse_id IN(:source,:destination))",scope,QuoteDrafts.map("all",CrmParties.has(scope,"warehouses.all"),"member",scope.membershipId(),"source",header.get("sourceId"),"destination",header.get("destinationId"))).query(Boolean.class).single();
        if(!allowed)throw new StaffScope.Failure(403,"scope_denied","Transfer is outside assigned source/destination warehouses.");
    }
    private Map<String,Object> transfer(StaffScope.CompanyAccess scope,UUID id,boolean financial){
        var header=header(scope,id);if(!financial)scope(scope,header);boolean cost=financial||CrmParties.has(scope,"inventory.cost.read");
        var lines=list("SELECT * FROM inventory.transit_line_balances WHERE company_id=:company AND transfer_id=:id ORDER BY product_id",scope,QuoteDrafts.map("id",id));
        for(var line:lines){if(!financial)hidePool(line);redact(line,cost);}redact(header,cost);
        var events=list("SELECT e.id,e.kind,e.reference,e.reason,d.number,d.business_date::text FROM inventory.transit_events e JOIN platform.documents d ON d.company_id=e.company_id AND d.id=e.id WHERE e.company_id=:company AND e.transfer_id=:id ORDER BY e.created_at,e.id",scope,QuoteDrafts.map("id",id));return QuoteDrafts.map("transfer",header,"lines",lines,"events",events);
    }
    private Map<String,Object> eventView(StaffScope.CompanyAccess scope,UUID id,boolean financial){
        var event=one("SELECT e.*,d.number,d.state,d.version,d.business_date::text FROM inventory.transit_events e JOIN platform.documents d ON d.company_id=e.company_id AND d.id=e.id WHERE e.company_id=:company AND e.id=:id",scope,QuoteDrafts.map("id",id));var transfer=header(scope,(UUID)event.get("transferId"));if(!financial)scope(scope,transfer);boolean cost=financial||CrmParties.has(scope,"inventory.cost.read");redact(event,cost);
        var lines=list("SELECT el.*,tl.product_id FROM inventory.transit_event_lines el JOIN inventory.transit_transfer_lines tl ON tl.company_id=el.company_id AND tl.id=el.transfer_line_id WHERE el.company_id=:company AND el.event_id=:id ORDER BY tl.product_id",scope,QuoteDrafts.map("id",id));for(var line:lines){if(!financial)hidePool(line);redact(line,cost);}return QuoteDrafts.map("event",event,"lines",lines);
    }
    private static void redact(Map<String,Object> row,boolean cost){if(!cost)for(String key:List.of("cost","shippedCost","receivedCost","returnedCost","shortageCost","remainingCost","valueBefore","valueAfter","inventoryAccountId","transitAccountId","debitAccountId","journalEntryId"))row.remove(key);}
    private static void hidePool(Map<String,Object> row){for(String key:List.of("stockBalanceId","quantityBefore","quantityAfter","valueBefore","valueAfter","reservedAfter","revisionBefore","revisionAfter"))row.remove(key);}
    private static void quantity(BigDecimal value,String message){SupplierBills.amount(value,"quantity",6,"99999999999999.999999");check(value.signum()>0,"quantity",message);}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,Object> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private List<Map<String,Object>> list(String sql,StaffScope.CompanyAccess scope,Map<String,Object> args){return query(sql,scope,args).query(rows::row).list();}
    private Map<String,Object> one(String sql,StaffScope.CompanyAccess scope,Map<String,Object> args){return query(sql,scope,args).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private IdempotentWrite.StoredResponse stored(Object value){return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(value));}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    static final class Line {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID transferLineId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal quantity=BigDecimal.ZERO;}
    static final class Event {public String reference;public String reason;public List<Line> lines;}
}
