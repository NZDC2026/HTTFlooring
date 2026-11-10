package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class PayrollApi {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 PayrollApi(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 record Input(String kind,LegacyRawJson body){}
 @GetMapping("/api/v1/payroll/report")
 ResponseEntity<String> report(@RequestParam String from,@RequestParam String to,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT payroll.report(CAST(:from AS date),CAST(:to AS date))::text",QuoteDrafts.map("from",LedgerFields.date(from),"to",LedgerFields.date(to)));}
 @GetMapping("/api/v1/payroll/records")
 ResponseEntity<String> records(@RequestParam String kind,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var args=page(page,pageSize);args.put("kind",kind);return read(token,request,"SELECT payroll.list(:kind,:size,:offset)::text",args);}
 @GetMapping("/api/v1/payroll/records/{id}")
 ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT payroll.view(:id)::text",Map.of("id",id));}
 @PostMapping("/api/v1/payroll/records")
 ResponseEntity<String> create(@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(null,input,token,request);}
 @PutMapping("/api/v1/payroll/records/{id}")
 ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(id,input,token,request);}
 @PostMapping({"/api/v1/payroll/records/{id}/submit","/api/v1/payroll/records/{id}/calculate","/api/v1/payroll/records/{id}/approve","/api/v1/payroll/records/{id}/lock","/api/v1/payroll/records/{id}/stp_preview"})
 ResponseEntity<String> transition(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  String operation=request.getRequestURI().substring(request.getRequestURI().lastIndexOf('/')+1).toUpperCase(Locale.ROOT);
  var scope=staff.require(token,request.getHeader("X-Company-Id"),operation.equals("APPROVE")?"payroll.review":"payroll.write");String rid=rid(request);
  return response(staff.inCompany(scope,rid,()->{
   long version=WarehouseDetails.version(request.getHeader("If-Match"));requireRead();body("SELECT payroll.view(:id)::text",Map.of("id",id));
   return writes.execute(scope,"POST /payroll/records/"+id+"/"+operation,request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("version",version)),()->{
    String result=body("SELECT payroll.transition(:id,:version,:action)::text",QuoteDrafts.map("id",id,"version",version,"action",operation));
    audit.record(scope,"payroll.sandbox_changed","payroll_record",id,rid,Map.of());return new IdempotentWrite.StoredResponse(200,result);
   });
  }));
 }
 private ResponseEntity<String> save(UUID id,Input input,Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"payroll.write");String rid=rid(request);
  return response(staff.inCompany(scope,rid,()->{
   MasterDataChecks.check(input.body()!=null&&input.body().object(),"body","Supply a payroll object.");long version=id==null?0:WarehouseDetails.version(request.getHeader("If-Match"));
   requireRead();if(id!=null)body("SELECT payroll.view(:id)::text",Map.of("id",id));
   return writes.execute(scope,id==null?"POST /payroll/records":"PUT /payroll/records/"+id,request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("version",version,"x",QuoteDrafts.map("kind",input.kind(),"body",input.body()))),()->{
    UUID saved=jdbc.sql("SELECT payroll.save(CAST(:id AS uuid),CAST(:kind AS text),:version,CAST(:body AS jsonb))").params(QuoteDrafts.map("id",id,"kind",input.kind(),"version",version,"body",input.body().canonical())).query(UUID.class).single();
    audit.record(scope,"payroll.sandbox_changed","payroll_record",saved,rid,Map.of());return new IdempotentWrite.StoredResponse(id==null?201:200,body("SELECT payroll.view(:id)::text",Map.of("id",saved)));
   });
  }));
 }
 private void requireRead(){jdbc.sql("SELECT crm.require_mobile('payroll.read')").query((rs,n)->0).single();}
 private String body(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String sql,Map<String,?> args){var scope=staff.require(token,request.getHeader("X-Company-Id"),"payroll.read");return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->body(sql,args)));}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r){return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
 private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int n=a==null?1:a,size=b==null?25:b;MasterDataChecks.check(n>=1&&n<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("size",size,"offset",(n-1)*size);}
}
