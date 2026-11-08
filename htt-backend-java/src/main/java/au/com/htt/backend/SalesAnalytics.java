package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
class SalesAnalytics {
    private final StaffScope staff;private final JdbcClient jdbc;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    SalesAnalytics(StaffScope staff,JdbcClient jdbc,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.json=json;this.writes=writes;this.audit=audit;}
    @GetMapping({"/api/v1/sales-analytics/trends","/api/v1/sales-analytics/facts","/api/v1/sales-analytics/pending-returns"})
    ResponseEntity<String> pages(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String customerId,@RequestParam(required=false) String branchId,@RequestParam(required=false) String productId,@RequestParam(required=false) String salespersonId,@RequestParam(required=false) String bucket,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.sales.read");boolean trends=request.getRequestURI().endsWith("/trends"),facts=request.getRequestURI().endsWith("/facts");Filter f=new Filter();f.from=LedgerFields.date(from);f.to=LedgerFields.date(to);f.customerId=LedgerFields.uuid(customerId);f.branchId=LedgerFields.uuid(branchId);f.productId=LedgerFields.uuid(productId);f.salespersonId=LedgerFields.uuid(salespersonId);f.bucket=trends&&bucket!=null?bucket:"MONTH";
        return read(scope,request,()->{var args=page(page,pageSize);args.put("filter",QuotePricing.canonical(validate(f)));args.put("to",f.to);return value(trends?TRENDS:facts?FACTS:PENDING,scope,args);});
    }
    @GetMapping("/api/v1/sales-analytics/reconciliation")
    ResponseEntity<String> reconciliation(@RequestParam String from,@RequestParam String to,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"reports.sales.reconcile");Filter f=new Filter();f.from=LedgerFields.date(from);f.to=LedgerFields.date(to);return read(scope,request,()->{validate(f);return value("SELECT sales.sales_reconciliation(:from,:to)::text",scope,QuoteDrafts.map("from",f.from,"to",f.to));});}
    @GetMapping("/api/v1/sales-analytics/checkpoints/{id}")
    ResponseEntity<String> checkpoint(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"reports.operating.read");return read(scope,request,()->value("SELECT sales.checkpoint_json(:id)::text",scope,QuoteDrafts.map("id",id)));}
    @GetMapping("/api/v1/sales-orders/{id}/sales-attribution")
    ResponseEntity<String> attribution(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"reports.sales.read");return read(scope,request,()->value("SELECT sales.attribution_view(:id)::text",scope,QuoteDrafts.map("id",id)));}
    @PostMapping("/api/v1/sales-analytics/checkpoints")
    ResponseEntity<String> capture(@RequestBody Filter input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.operating.read");return response(staff.inCompany(scope,rid(request),()->{
            var filter=validate(input);query("SELECT sales.require_analytics_customer(CAST(:customer AS uuid))",scope,QuoteDrafts.map("customer",input.customerId)).query((r,n)->0).single();query("SELECT accounting.require_operating_report('SALES')",scope,Map.of()).query((r,n)->0).single();
            return writes.execute(scope,"POST /sales-analytics/checkpoints",request.getHeader("Idempotency-Key"),QuotePricing.canonical(filter),()->{
                UUID id=query("SELECT sales.capture_analytics(CAST(:filter AS jsonb))",scope,QuoteDrafts.map("filter",QuotePricing.canonical(filter))).query(UUID.class).single();audit.record(scope,"sales.analytics_checkpoint","operating_report",id,rid(request),Map.of());return stored(201,value("SELECT sales.checkpoint_json(:id)::text",scope,QuoteDrafts.map("id",id)));
            });
        }));
    }
    @PutMapping("/api/v1/sales-orders/{id}/sales-attribution")
    ResponseEntity<String> assign(@PathVariable UUID id,@RequestBody Attribution input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"sales.attribution.assign");return response(staff.inCompany(scope,rid(request),()->{
            value("SELECT sales.attribution_view(:id)::text",scope,QuoteDrafts.map("id",id));check(!input.salespersonId.equals(ZERO),"salespersonId","Salesperson ID required.");String reason=text(input.reason,"reason",2000);long version=WarehouseDetails.version(request.getHeader("If-Match"));
            query("SELECT sales.require_attribution_actor(:id,:user)",scope,QuoteDrafts.map("id",id,"user",input.salespersonId)).query((r,n)->0).single();
            return writes.execute(scope,"PUT /sales-orders/sales-attribution",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"salespersonId",input.salespersonId,"reason",reason)),()->{
                Object result=value("SELECT sales.assign_attribution(:id,:v,:user,:reason)::text",scope,QuoteDrafts.map("id",id,"v",version,"user",input.salespersonId,"reason",reason));audit.record(scope,"sales.attribution_assigned","sales_order",id,rid(request),Map.of());return stored(200,result);
            });
        }));
    }
    private static Map<String,Object> validate(Filter f){check(f.from.getYear()>=3&&f.to.isAfter(f.from)&&ChronoUnit.DAYS.between(f.from,f.to)<=366,"range","Use a half-open interval of 1..366 days, from year 3.");check(f.bucket!=null&&Set.of("DAY","MONTH").contains(f.bucket),"bucket","Invalid bucket.");for(UUID id:new UUID[]{f.customerId,f.branchId,f.productId,f.salespersonId})check(id==null||!id.equals(ZERO),"ids","Nonempty IDs required.");return QuoteDrafts.map("from",f.from,"to",f.to,"customerId",f.customerId,"branchId",f.branchId,"productId",f.productId,"salespersonId",f.salespersonId,"bucket",f.bucket);}
    private Object value(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query((r,n)->json.readTree(r.getString(1))).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Filter {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate from=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate to=LocalDate.of(1,1,1);public UUID customerId;public UUID branchId;public UUID productId;public UUID salespersonId;public String bucket="MONTH";}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Attribution {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID salespersonId=ZERO;public String reason;}
    private static final String TRENDS = """
WITH result AS MATERIALIZED(SELECT sales.analytics_report(CAST(:filter AS jsonb))body)SELECT(body-'rows'-'sourceFacts'-'mvccSnapshot'||jsonb_build_object('totalCount',jsonb_array_length(body->'rows'),'page',:page,'pageSize',:size,'rows',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body->'rows')WITH ORDINALITY a(e,n)WHERE n>:offset AND n<=:offset+:size),'[]'::jsonb)))::text AS body FROM result
""";
    private static final String PENDING = """
WITH result AS MATERIALIZED(SELECT sales.pending_credit_returns(CAST(:filter AS jsonb))body)SELECT jsonb_build_object('asOfExclusive',:to,'totalCount',jsonb_array_length(body),'page',:page,'pageSize',:size,'items',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body)WITH ORDINALITY a(e,n)WHERE n>:offset AND n<=:offset+:size),'[]'::jsonb))::text AS body FROM result
""";
    private static final String FACTS = """
WITH result AS MATERIALIZED(SELECT sales.analytics_facts(CAST(:filter AS jsonb))body)SELECT jsonb_build_object('snapshotAt',statement_timestamp(),'basis','POSTING_DATE','totalCount',jsonb_array_length(body),'page',:page,'pageSize',:size,'items',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body)WITH ORDINALITY a(e,n)WHERE n>:offset AND n<=:offset+:size),'[]'::jsonb))::text AS body FROM result
""";
}
