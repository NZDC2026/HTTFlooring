package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
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
class BankFeeds {
    private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
    BankFeeds(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;this.json=json;}
    @GetMapping("/api/v1/bank-accounts/{id}/feed-connections")
    ResponseEntity<String> list(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"read");return read(scope,request,()->{require(scope,id,"read");var args=page(page,pageSize);args.put("bank",id);var items=query("SELECT bankfeeds.view_connection(id)::text AS body FROM bankfeeds.connections WHERE company_id=:company AND bank_account_id=:bank ORDER BY created_at DESC,id LIMIT :size OFFSET :offset",scope,args).query((r,n)->json.readTree(r.getString("body"))).list();return QuoteDrafts.map("items",items,"page",args.get("page"),"pageSize",args.get("size"));});
    }
    @GetMapping("/api/v1/bank-feed-connections/{id}")
    ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"read");return read(scope,request,()->value(scope,"SELECT bankfeeds.view_connection(:id)::text",QuoteDrafts.map("id",id)));}
    @GetMapping("/api/v1/bank-feed-connections/{id}/jobs")
    ResponseEntity<String> jobs(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"read");return read(scope,request,()->{var args=page(page,pageSize);args.put("id",id);return value(scope,"SELECT bankfeeds.job_list(:id,:size,:offset)::text",args);});}
    @PostMapping("/api/v1/bank-accounts/{id}/feed-connections")
    ResponseEntity<String> create(@PathVariable UUID id,@RequestBody Connect input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"manage");return response(staff.inCompany(scope,rid(request),()->{
            require(scope,id,"manage");importPermission(scope);var body=QuoteDrafts.map("grantReference",input.grantReference,"startDate",input.startDate,"autoSync",input.autoSync);
            return writes.execute(scope,"POST /bank-accounts/"+id+"/feed-connections",request.getHeader("Idempotency-Key"),QuotePricing.canonical(body),()->{
                UUID feed=query("SELECT bankfeeds.create_connection(:bank,CAST(:grant AS text),:start,:auto)",scope,QuoteDrafts.map("bank",id,"grant",input.grantReference,"start",input.startDate,"auto",input.autoSync)).query(UUID.class).single();
                audit.record(scope,"accounting.bank_feed_created","bank_feed",feed,rid(request),QuoteDrafts.map("bankAccountId",id,"environment","SANDBOX"));return stored(201,QuoteDrafts.map("id",feed,"state","PENDING","environment","SANDBOX","liveConnection",false));
            });
        }));
    }
    @PostMapping("/api/v1/bank-feed-connections/{id}/verify")
    ResponseEntity<String> verify(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,"VERIFY",null,token,request);}
    @PostMapping("/api/v1/bank-feed-connections/{id}/sync")
    ResponseEntity<String> sync(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,"SYNC",null,token,request);}
    @PostMapping("/api/v1/bank-feed-connections/{id}/revoke")
    ResponseEntity<String> revoke(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,"REVOKE",null,token,request);}
    @PostMapping("/api/v1/bank-feed-connections/{id}/retry")
    ResponseEntity<String> retry(@PathVariable UUID id,@RequestBody Retry input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return command(id,"RETRY",input,token,request);}
    private ResponseEntity<String> command(UUID id,String action,Retry input,Jwt token,HttpServletRequest request){
        String permission=action.equals("SYNC")?"sync":"manage";var scope=access(token,request,permission);return response(staff.inCompany(scope,rid(request),()->{
            UUID bank=query("SELECT bank_account_id FROM bankfeeds.connections WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
            require(scope,bank,permission);if(action.equals("SYNC")||action.equals("VERIFY"))importPermission(scope);
            if(action.equals("RETRY"))query("SELECT bankfeeds.authorize_retry(:id,CAST(:job AS uuid))",scope,QuoteDrafts.map("id",id,"job",input.jobId)).query((r,n)->0).single();
            long version=WarehouseDetails.version(request.getHeader("If-Match"));Object x=input==null?null:QuoteDrafts.map("jobId",input.jobId,"reason",input.reason,"acknowledgeUnknown",input.acknowledgeUnknown);
            return writes.execute(scope,"POST /bank-feed-connections/"+id+"/"+action,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("version",version,"input",x)),()->{
                UUID job=query("SELECT bankfeeds.command(:id,:version,:action,CAST(:job AS uuid),:ack,:reason)",scope,QuoteDrafts.map("id",id,"version",version,"action",action,"job",input==null?null:input.jobId,"ack",input!=null&&input.acknowledgeUnknown,"reason",input==null||input.reason==null?"":input.reason)).query(UUID.class).single();
                audit.record(scope,"accounting.bank_feed_queued","bank_feed_job",job,rid(request),QuoteDrafts.map("connectionId",id,"action",action,"reason",input==null?null:input.reason));return stored(202,QuoteDrafts.map("id",job,"connectionId",id,"kind",action));
            });
        }));
    }
    private void importPermission(StaffScope.CompanyAccess scope){query("SELECT crm.require_mobile('accounting.bank_statements.import')",scope,Map.of()).query((r,n)->0).single();}
    private void require(StaffScope.CompanyAccess scope,UUID bank,String permission){query("SELECT bankfeeds.require_access(:permission,:bank)",scope,QuoteDrafts.map("permission","accounting.bank_feeds."+permission,"bank",bank)).query((r,n)->0).single();}
    private Object value(StaffScope.CompanyAccess scope,String sql,Map<String,?> args){return json.readTree(query(sql,scope,args).query(String.class).single());}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),"accounting.bank_feeds."+permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Connect {public String grantReference;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate startDate=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean autoSync;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Retry {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID jobId=new UUID(0,0);public String reason;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean acknowledgeUnknown;}
}
