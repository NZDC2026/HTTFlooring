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
class InventoryOperations {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    InventoryOperations(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @PostMapping("/api/v1/inventory/transfers")
    ResponseEntity<String> transfer(@RequestBody Transfer input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.transfers.post");check(!input.sourceWarehouseId.equals(ZERO)&&!input.destinationWarehouseId.equals(ZERO)&&!input.sourceWarehouseId.equals(input.destinationWarehouseId),"warehouse","Distinct source and destination required.");return post(scope,request,"TRANSFER",input.sourceWarehouseId,input.destinationWarehouseId,input.reference,input.reason,input.lines);}
    @PostMapping("/api/v1/inventory/write-offs")
    ResponseEntity<String> writeOff(@RequestBody WriteOff input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.writeoffs.post");check(!input.warehouseId.equals(ZERO),"warehouseId","Warehouse required.");return post(scope,request,"WRITE_OFF",input.warehouseId,null,input.reference,input.reason,input.lines);}
    private ResponseEntity<String> post(StaffScope.CompanyAccess scope,HttpServletRequest request,String kind,UUID from,UUID to,String inputReference,String inputReason,List<Line> inputLines){
        var result=staff.inCompany(scope,rid(request),()->{
            String reference=text(inputReference,"reference",200),reason=text(inputReason,"reason",2000);
            check(inputLines!=null&&!inputLines.isEmpty()&&inputLines.size()<=50&&inputLines.stream().allMatch(l->l!=null&&!l.productId.equals(ZERO))&&inputLines.stream().map(l->l.productId).distinct().count()==inputLines.size(),"lines","Supply 1..50 distinct stock products.");
            for(var line:inputLines){SupplierBills.amount(line.quantity,"quantity",6,"99999999999999.999999");check(line.quantity.signum()>0,"quantity","Positive base quantity required.");}
            var lines=inputLines.stream().sorted(Comparator.comparing(l->l.productId.toString())).map(l->QuoteDrafts.map("productId",l.productId,"quantity",l.quantity)).toList();
            String body=QuotePricing.canonical(QuoteDrafts.map("kind",kind,"from",from,"to",to,"reference",reference,"reason",reason,"lines",lines));
            return writes.execute(scope,"POST "+request.getRequestURI(),request.getHeader("Idempotency-Key"),body,()->{
                UUID id=jdbc.sql("SELECT inventory.post_control(:kind,:from,CAST(:to AS uuid),:reference,:reason,CAST(:lines AS jsonb))").param("kind",kind).param("from",from).param("to",to).param("reference",reference).param("reason",reason).param("lines",QuotePricing.value(lines)).query(UUID.class).single();
                audit.record(scope,kind.equals("TRANSFER")?"inventory.transferred":"inventory.written_off","inventory_operation",id,rid(request),QuoteDrafts.map("from",from,"to",to,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(operation(scope,id,!kind.equals("TRANSFER"))));
            });
        });return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
    @GetMapping("/api/v1/inventory/transfers/{id}")
    ResponseEntity<String> transferDetail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.transfers.read");return read(scope,request,()->operation(scope,id,false));}
    @GetMapping("/api/v1/accounting/inventory-operations/{id}")
    ResponseEntity<String> financialDetail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.control.read");return read(scope,request,()->operation(scope,id,true));}
    @GetMapping("/api/v1/accounting/inventory-operations")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) UUID warehouseId,@RequestParam(required=false) String kind,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"inventory.control.read");return read(scope,request,()->{
        check(kind==null||Set.of("TRANSFER","COUNT","WRITE_OFF").contains(kind),"kind","Invalid kind.");int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql("SELECT o.*,d.number,d.business_date::text FROM inventory.operations o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=:company AND (CAST(:warehouse AS uuid) IS NULL OR o.warehouse_id=:warehouse OR o.destination_id=:warehouse) AND (CAST(:kind AS text) IS NULL OR o.kind=:kind) ORDER BY o.created_at DESC,o.id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("warehouse",warehouseId).param("kind",kind).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);
    });}
    private Map<String,Object> operation(StaffScope.CompanyAccess scope,UUID id,boolean financial){
        var header=jdbc.sql("SELECT o.*,d.number,d.state,d.version,d.business_date::text FROM inventory.operations o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=:company AND o.id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
        if(!financial){check(header.get("kind").equals("TRANSFER"),"kind","Transfer view required.");warehouse((UUID)header.get("warehouseId"));warehouse((UUID)header.get("destinationId"));}
        boolean cost=financial||CrmParties.has(scope,"inventory.cost.read");
        var lines=jdbc.sql("SELECT * FROM inventory.operation_lines WHERE company_id=:company AND operation_id=:id ORDER BY warehouse_id,product_id").param("company",scope.companyId()).param("id",id).query(rows::row).list();
        if(!cost){header.remove("journalEntryId");for(var line:lines)for(String key:List.of("valueDelta","valueBefore","valueAfter"))line.remove(key);}
        return QuoteDrafts.map("operation",header,"lines",lines);
    }
    private void warehouse(UUID id){jdbc.sql("SELECT inventory.require_access('inventory.transfers.read',:id)").param("id",id).query((row,n)->0).single();}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal quantity=BigDecimal.ZERO;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Transfer {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID sourceWarehouseId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID destinationWarehouseId=ZERO;public String reference;public String reason;public List<Line> lines;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class WriteOff {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID warehouseId=ZERO;public String reference;public String reason;public List<Line> lines;}
}
