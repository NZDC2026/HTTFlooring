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
class BinCounts {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    BinCounts(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/warehouse/bin-counts")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam UUID warehouseId,@RequestParam(required=false) String state,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"inventory.bin_counts.read");return read(scope,request,()->{
        check(state==null||Set.of("OPEN","SUBMITTED","RECOUNT","RECOUNT_SUBMITTED","APPROVED","POSTED","CANCELLED").contains(state),"state","Invalid state.");
        jdbc.sql("SELECT inventory.require_bin_list(:warehouse)").param("warehouse",warehouseId).query((row,n)->0).single();int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql("SELECT id,warehouse_id,state,version,current_round,created_by,created_at FROM inventory.bin_counts WHERE company_id=:company AND warehouse_id=:warehouse AND(CAST(:state AS text) IS NULL OR state=:state)ORDER BY created_at DESC,id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("warehouse",warehouseId).param("state",state).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);});}
    @GetMapping("/api/v1/warehouse/bin-counts/{id}")
    ResponseEntity<String> warehouseView(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.read");return read(scope,request,()->view(id,false));}
    @GetMapping("/api/v1/accounting/bin-counts/{id}")
    ResponseEntity<String> financialView(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.review");return read(scope,request,()->view(id,true));}
    @PostMapping("/api/v1/warehouse/bin-counts")
    ResponseEntity<String> start(@RequestBody InventoryCounts.Start input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.capture");return response(staff.inCompany(scope,rid(request),()->{
        String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);check(!input.warehouseId.equals(ZERO)&&input.productIds!=null&&!input.productIds.isEmpty()&&input.productIds.size()<=50&&input.productIds.stream().allMatch(id->!id.equals(ZERO))&&new HashSet<>(input.productIds).size()==input.productIds.size(),"products","Warehouse and 1..50 distinct stock products required.");
        jdbc.sql("SELECT inventory.require_access('inventory.bin_counts.capture',:warehouse),inventory.require_access('inventory.bin_counts.read',:warehouse)").param("warehouse",input.warehouseId).query((row,n)->0).single();
        var products=input.productIds.stream().sorted(Comparator.comparing(UUID::toString)).toList();var body=QuoteDrafts.map("warehouseId",input.warehouseId,"reference",reference,"reason",reason,"products",products);
        return writes.execute(scope,"POST /warehouse/bin-counts",request.getHeader("Idempotency-Key"),QuotePricing.canonical(body),()->{
            UUID id=jdbc.sql("SELECT inventory.start_bin_count(:warehouse,:reference,:reason,ARRAY(SELECT value::uuid FROM jsonb_array_elements_text(CAST(:products AS jsonb))))").param("warehouse",input.warehouseId).param("reference",reference).param("reason",reason).param("products",QuotePricing.value(products)).query(UUID.class).single();
            audit.record(scope,"inventory.bin_count_started","bin_count",id,rid(request),Map.of());return stored(201,view(id,false));
        });}));}
    @PostMapping("/api/v1/warehouse/bin-counts/{id}/submit")
    ResponseEntity<String> submit(@PathVariable UUID id,@RequestBody Submission input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.capture");return response(staff.inCompany(scope,rid(request),()->{
        check(input.lines!=null&&!input.lines.isEmpty()&&input.lines.size()<=500&&input.lines.stream().allMatch(l->l!=null&&!l.lineId.equals(ZERO)&&l.quantity!=null)&&input.lines.stream().map(l->l.lineId).distinct().count()==input.lines.size(),"lines","Count every position exactly once, including zero.");
        for(var l:input.lines)SupplierBills.amount(l.quantity,"quantity",6,"99999999999999.999999");
        var lines=input.lines.stream().sorted(Comparator.comparing(l->l.lineId.toString())).map(l->QuoteDrafts.map("lineId",l.lineId,"quantity",l.quantity)).toList();return command(scope,id,"CAPTURE","submit",QuoteDrafts.map("lines",lines),request,v->jdbc.sql("SELECT inventory.submit_bin_count(:id,:version,CAST(:lines AS jsonb))").param("id",id).param("version",v).param("lines",QuotePricing.value(lines)).query((row,n)->0).single());
    }));}
    @PostMapping("/api/v1/accounting/bin-counts/{id}/recount")
    ResponseEntity<String> recount(@PathVariable UUID id,@RequestBody Recount input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.review");return response(staff.inCompany(scope,rid(request),()->{
        check(!input.counterId.equals(ZERO),"counterId","Assigned counter required.");String reason=text(input.reason,"reason",2000);return command(scope,id,"REVIEW","recount",QuoteDrafts.map("counterId",input.counterId,"reason",reason),request,v->jdbc.sql("SELECT inventory.review_bin_count(:id,:version,'RECOUNT',:reason,:counter,'[]')").param("id",id).param("version",v).param("reason",reason).param("counter",input.counterId).query((row,n)->0).single());
    }));}
    @PostMapping("/api/v1/accounting/bin-counts/{id}/approve")
    ResponseEntity<String> approve(@PathVariable UUID id,@RequestBody Decision input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.review");return response(staff.inCompany(scope,rid(request),()->{
        String reason=text(input.reason,"reason",2000);var values=input.gainValues==null?List.<Gain>of():input.gainValues;check(values.size()<=50&&values.stream().allMatch(l->l!=null&&!l.productId.equals(ZERO))&&values.stream().map(l->l.productId).distinct().count()==values.size(),"gainValues","Distinct SKU gain values required.");for(var l:values)SupplierBills.amount(l.gainValue,"gainValue",2,"999999999999999999.99");
        var normalized=values.stream().map(l->QuoteDrafts.map("productId",l.productId,"gainValue",l.gainValue)).toList();return command(scope,id,"REVIEW","approve",QuoteDrafts.map("reason",reason,"values",normalized),request,v->jdbc.sql("SELECT inventory.review_bin_count(:id,:version,'APPROVE',:reason,NULL,CAST(:values AS jsonb))").param("id",id).param("version",v).param("reason",reason).param("values",QuotePricing.value(normalized)).query((row,n)->0).single());
    }));}
    @PostMapping("/api/v1/accounting/bin-counts/{id}/post")
    ResponseEntity<String> post(@PathVariable UUID id,@RequestBody Decision input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.post");return response(staff.inCompany(scope,rid(request),()->{
        check(input.gainValues==null||input.gainValues.isEmpty(),"gainValues","Values are approved before posting.");String reason=text(input.reason,"reason",2000);return command(scope,id,"POST","post",QuoteDrafts.map("reason",reason),request,v->jdbc.sql("SELECT inventory.post_bin_count(:id,:version,:reason)").param("id",id).param("version",v).param("reason",reason).query((row,n)->0).single());
    }));}
    @PostMapping("/api/v1/warehouse/bin-counts/{id}/cancel")
    ResponseEntity<String> cancel(@PathVariable UUID id,@RequestBody Decision input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.read");return response(staff.inCompany(scope,rid(request),()->{
        String reason=text(input.reason,"reason",2000);return command(scope,id,"CANCEL","cancel",QuoteDrafts.map("reason",reason),request,v->jdbc.sql("SELECT inventory.cancel_bin_count(:id,:version,:reason)").param("id",id).param("version",v).param("reason",reason).query((row,n)->0).single());
    }));}
    @PostMapping("/api/v1/warehouse/bin-counts/{id}/positions")
    ResponseEntity<String> discover(@PathVariable UUID id,@RequestBody Discovery input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"inventory.bin_counts.capture");return response(staff.inCompany(scope,rid(request),()->{
        check(!input.productId.equals(ZERO)&&!input.binId.equals(ZERO),"position","Selected product and warehouse bin required.");String lot=text(input.lotCode,"lotCode",80);return command(scope,id,"CAPTURE","discover",QuoteDrafts.map("productId",input.productId,"binId",input.binId,"lot",lot),request,v->jdbc.sql("SELECT inventory.discover_bin_count_position(:id,:version,:product,:bin,:lot)").param("id",id).param("version",v).param("product",input.productId).param("bin",input.binId).param("lot",lot).query((row,n)->0).single());
    }));}
    private IdempotentWrite.StoredResponse command(StaffScope.CompanyAccess scope,UUID id,String access,String action,Map<String,Object> body,HttpServletRequest request,Command execute){
        jdbc.sql("SELECT inventory.require_bin_actor(:id,:action)").param("id",id).param("action",access).query((row,n)->0).single();long version=InventoryCounts.version(request.getHeader("If-Match"));
        return writes.execute(scope,"POST /bin-counts/"+id+"/"+action,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"body",body)),()->{
            execute.run(version);audit.record(scope,"inventory.bin_count_"+action,"bin_count",id,rid(request),Map.of());return stored(200,view(id,access.equals("REVIEW")||access.equals("POST")));
        });
    }
    private Object view(UUID id,boolean financial){return json.readTree(jdbc.sql("SELECT inventory.bin_count_view(:id,:financial)::text").param("id",id).param("financial",financial).query(String.class).single());}
    private IdempotentWrite.StoredResponse stored(int status,Object value){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(value));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    @FunctionalInterface private interface Command {void run(long version);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Reading {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID lineId=ZERO;public BigDecimal quantity;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Submission {public List<Reading> lines;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Recount {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID counterId=ZERO;public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Gain {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal gainValue=BigDecimal.ZERO;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Decision {public String reason;public List<Gain> gainValues;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Discovery {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID binId=ZERO;public String lotCode;}
}
