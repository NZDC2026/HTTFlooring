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
class InventoryCounts {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    InventoryCounts(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @PostMapping("/api/v1/inventory/stock-counts")
    ResponseEntity<String> start(@RequestBody Start input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.counts.write");return response(staff.inCompany(scope,rid(request),()->{
        String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
        check(!input.warehouseId.equals(ZERO)&&input.productIds!=null&&!input.productIds.isEmpty()&&input.productIds.size()<=50&&input.productIds.stream().allMatch(id->!id.equals(ZERO))&&new HashSet<>(input.productIds).size()==input.productIds.size(),"productIds","Warehouse and 1..50 distinct stock products required.");
        var products=input.productIds.stream().sorted(Comparator.comparing(UUID::toString)).toList();String body=QuotePricing.canonical(QuoteDrafts.map("warehouseId",input.warehouseId,"reference",reference,"reason",reason,"products",products));
        return writes.execute(scope,"POST /inventory/stock-counts",request.getHeader("Idempotency-Key"),body,()->{
            // A JSON-to-array conversion keeps UUID typing explicit for the JDBC driver.
            UUID id=jdbc.sql("SELECT inventory.start_count(:warehouse,:reference,:reason,ARRAY(SELECT value::uuid FROM jsonb_array_elements_text(CAST(:products AS jsonb))))").param("warehouse",input.warehouseId).param("reference",reference).param("reason",reason).param("products",QuotePricing.value(products)).query(UUID.class).single();
            record(scope,"inventory.count_started",id,request);return stored(201,view(scope,id,false));
        });}));}
    @PostMapping("/api/v1/inventory/stock-counts/{id}/submit")
    ResponseEntity<String> submit(@PathVariable UUID id,@RequestBody Submission input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.counts.write");return response(staff.inCompany(scope,rid(request),()->{
        long expected=version(request.getHeader("If-Match"));
        check(input.lines!=null&&!input.lines.isEmpty()&&input.lines.size()<=50&&input.lines.stream().allMatch(l->l!=null&&!l.productId.equals(ZERO))&&input.lines.stream().map(l->l.productId).distinct().count()==input.lines.size(),"lines","Supply every count product exactly once.");
        for(var line:input.lines){check(line.countedQuantity!=null,"countedQuantity","Explicit physical counted quantity is required.");SupplierBills.amount(line.countedQuantity,"countedQuantity",6,"99999999999999.999999");if(line.gainValue!=null)SupplierBills.amount(line.gainValue,"gainValue",2,"999999999999999999.99");}
        var lines=input.lines.stream().sorted(Comparator.comparing(l->l.productId.toString())).map(l->QuoteDrafts.map("productId",l.productId,"countedQuantity",l.countedQuantity,"gainValue",l.gainValue)).toList();
        return writes.execute(scope,"POST /inventory/stock-counts/"+id+"/submit",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("expected",expected,"lines",lines)),()->{
            jdbc.sql("SELECT inventory.submit_count(:id,:expected,CAST(:lines AS jsonb))").param("id",id).param("expected",expected).param("lines",QuotePricing.value(lines)).query((row,n)->0).single();record(scope,"inventory.count_submitted",id,request);return stored(200,view(scope,id,false));
        });}));}
    @PostMapping("/api/v1/inventory/stock-counts/{id}/post")
    ResponseEntity<String> post(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,true,token,request);}
    @PostMapping("/api/v1/inventory/stock-counts/{id}/cancel")
    ResponseEntity<String> cancel(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,false,token,request);}
    private ResponseEntity<String> command(UUID id,boolean post,Jwt token,HttpServletRequest request){var scope=access(token,request,post?"inventory.counts.post":"inventory.counts.write");return response(staff.inCompany(scope,rid(request),()->{
        long expected=version(request.getHeader("If-Match"));String action=post?"post":"cancel";
        return writes.execute(scope,"POST /inventory/stock-counts/"+id+"/"+action,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("expected",expected)),()->{
            jdbc.sql("SELECT inventory."+(post?"post_count":"cancel_count")+"(:id,:expected)").param("id",id).param("expected",expected).query((row,n)->0).single();record(scope,post?"inventory.count_posted":"inventory.count_cancelled",id,request);return stored(200,view(scope,id,post));
        });}));}
    @GetMapping("/api/v1/inventory/stock-counts/{id}")
    ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.counts.read");return read(scope,request,()->view(scope,id,false));}
    @GetMapping("/api/v1/accounting/stock-counts/{id}")
    ResponseEntity<String> financial(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.control.read");return read(scope,request,()->view(scope,id,true));}
    @GetMapping("/api/v1/accounting/stock-counts")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) String state,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"inventory.control.read");return read(scope,request,()->{
        check(state==null||Set.of("OPEN","SUBMITTED","POSTED","CANCELLED").contains(state),"state","Invalid state.");int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql("SELECT c.*,d.number,d.version,d.business_date::text FROM inventory.counts c JOIN platform.documents d ON d.company_id=c.company_id AND d.id=c.id WHERE c.company_id=:company AND (CAST(:state AS text) IS NULL OR c.state=:state) ORDER BY c.created_at,c.id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("state",state).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);
    });}
    private Object view(StaffScope.CompanyAccess scope,UUID id,boolean financial){
        if(jdbc.sql("SELECT inventory.is_bin_count(:id)").param("id",id).query(Boolean.class).single())return json.readTree(jdbc.sql("SELECT inventory.bin_count_view(:id,:financial)::text").param("id",id).param("financial",financial).query(String.class).single());
        var header=jdbc.sql("SELECT c.*,d.number,d.version,d.business_date::text FROM inventory.counts c JOIN platform.documents d ON d.company_id=c.company_id AND d.id=c.id WHERE c.company_id=:company AND c.id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
        if(!financial)jdbc.sql("SELECT inventory.require_access('inventory.counts.read',:warehouse)").param("warehouse",header.get("warehouseId")).query((row,n)->0).single();
        var lines=jdbc.sql("SELECT * FROM inventory.count_lines WHERE company_id=:company AND count_id=:id ORDER BY product_id").param("company",scope.companyId()).param("id",id).query(rows::row).list();
        if(!financial&&!CrmParties.has(scope,"inventory.cost.read"))for(var line:lines){line.remove("snapshotValue");line.remove("gainValue");}
        return QuoteDrafts.map("count",header,"lines",lines);
    }
    private void record(StaffScope.CompanyAccess scope,String action,UUID id,HttpServletRequest request){audit.record(scope,action,"stock_count",id,rid(request),Map.of());}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    static long version(String tag){try{String text=tag==null?"":tag.replaceAll("^\"+|\"+$","");if(text.matches("[0-9]+")){long n=Long.parseLong(text);if(n>0)return n;}}catch(NumberFormatException ignored){}throw new StaffScope.Failure(428,"version_required","Supply If-Match with the current document version.");}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Start {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID warehouseId=ZERO;public String reference;public String reason;@com.fasterxml.jackson.annotation.JsonSetter(contentNulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public List<UUID> productIds;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Actual {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productId=ZERO;public BigDecimal countedQuantity;public BigDecimal gainValue;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Submission {public List<Actual> lines;}
}
