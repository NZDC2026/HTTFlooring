package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;import java.time.LocalDate;import java.math.BigDecimal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.web.bind.annotation.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class IncentiveApi {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 IncentiveApi(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 record Program(String kind,String name,UUID customerId,UUID userId){}
 record Policy(long revision,LocalDate from,LocalDate to,LegacyRawJson config){}
 record Period(LocalDate from,LocalDate to){}
 record Run(UUID programId,UUID periodId,LocalDate valuationDate,LocalDate postingDate,String reason,UUID[] invoiceIds){}
 record Review(String reference){}
 record Enabled(Boolean enabled){}
 record Grant(UUID userId,Boolean active){}
 record PeriodReview(Boolean lock,String reference){}
 record Offset(UUID positiveClaimId,UUID negativeClaimId,BigDecimal amount,LocalDate postingDate,String reference,String reason){}
 record Settlement(UUID claimId,BigDecimal net,BigDecimal tax,LocalDate postingDate,String reference,String reason,String evidence,LegacyRawJson items,UUID priorSettlementId){}
 @PostMapping("/api/v1/incentives/programs")
 ResponseEntity<String> program(@RequestBody Program x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();return write(scope,request,"incentives.manage","POST /incentives/programs",id,QuoteDrafts.map("kind",x.kind(),"name",x.name(),"customerId",x.customerId(),"userId",x.userId()),"SELECT incentives.create_program(CAST(:id AS uuid),CAST(:kind AS text),CAST(:name AS text),CAST(:customer AS uuid),CAST(:user AS uuid))",QuoteDrafts.map("id",id,"kind",x.kind(),"name",x.name(),"customer",x.customerId(),"user",x.userId()),201);}));}
 @PutMapping("/api/v1/incentives/programs/{id}/enabled")
 ResponseEntity<String> enabled(@PathVariable UUID id,@RequestBody Enabled x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{long v=WarehouseDetails.version(request.getHeader("If-Match"));if(x.enabled()==null)throw LedgerFields.invalid();return write(scope,request,"incentives.manage","PUT /incentives/programs/enabled",id,QuoteDrafts.map("id",id,"v",v,"x",QuoteDrafts.map("enabled",x.enabled())),"SELECT incentives.set_program(:id,:v,:enabled)",QuoteDrafts.map("id",id,"v",v,"enabled",x.enabled()),200);}));}
 @PostMapping("/api/v1/incentives/programs/{program}/policies")
 ResponseEntity<String> policy(@PathVariable UUID program,@RequestBody Policy x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();MasterDataChecks.check(x.config()!=null&&x.config().object(),"config","Explicit policy object required.");return write(scope,request,"incentives.manage","POST /incentives/policies",id,QuoteDrafts.map("program",program,"x",QuoteDrafts.map("revision",x.revision(),"from",x.from()==null?null:x.from().toString(),"to",x.to()==null?null:x.to().toString(),"config",x.config())),"SELECT incentives.create_policy(:id,:program,:rev,CAST(:from AS date),CAST(:to AS date),CAST(:config AS jsonb))",QuoteDrafts.map("id",id,"program",program,"rev",x.revision(),"from",x.from(),"to",x.to(),"config",x.config().canonical()),201);}));}
 @PostMapping("/api/v1/incentives/policies/{id}/approve")
 ResponseEntity<String> approvePolicy(@PathVariable UUID id,@RequestBody Review x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.approve");return response(staff.inCompany(scope,rid(request),()->{return write(scope,request,"incentives.approve","POST /incentives/policies/approve",id,QuoteDrafts.map("id",id,"x",QuoteDrafts.map("reference",x.reference())),"SELECT incentives.approve_policy(:id,CAST(:ref AS text))",QuoteDrafts.map("id",id,"ref",x.reference()),200);}));}
 @PostMapping("/api/v1/incentives/periods")
 ResponseEntity<String> period(@RequestBody Period x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();return write(scope,request,"incentives.manage","POST /incentives/periods",id,QuoteDrafts.map("from",x.from()==null?null:x.from().toString(),"to",x.to()==null?null:x.to().toString()),"SELECT incentives.create_period(:id,CAST(:from AS date),CAST(:to AS date))",QuoteDrafts.map("id",id,"from",x.from(),"to",x.to()),201);}));}
 @PostMapping("/api/v1/incentives/periods/{id}/review")
 ResponseEntity<String> periodReview(@PathVariable UUID id,@RequestBody PeriodReview x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.approve");return response(staff.inCompany(scope,rid(request),()->{long v=WarehouseDetails.version(request.getHeader("If-Match"));if(x.lock()==null)throw LedgerFields.invalid();return write(scope,request,"incentives.approve","POST /incentives/periods/review",id,QuoteDrafts.map("id",id,"v",v,"x",QuoteDrafts.map("lock",x.lock(),"reference",x.reference())),"SELECT incentives.review_period(:id,:v,:lock,CAST(:ref AS text))",QuoteDrafts.map("id",id,"v",v,"lock",x.lock(),"ref",x.reference()),200);}));}
 @PostMapping("/api/v1/incentives/runs")
 ResponseEntity<String> run(@RequestBody Run x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();return write(scope,request,"incentives.manage","POST /incentives/runs",id,QuoteDrafts.map("programId",x.programId(),"periodId",x.periodId(),"valuationDate",x.valuationDate()==null?null:x.valuationDate().toString(),"postingDate",x.postingDate()==null?null:x.postingDate().toString(),"reason",x.reason(),"invoiceIds",x.invoiceIds()==null?null:Arrays.asList(x.invoiceIds())),"SELECT incentives.create_run(:id,CAST(:program AS uuid),CAST(:period AS uuid),CAST(:valuation AS date),CAST(:posting AS date),CAST(:reason AS text),CAST(:ids AS uuid[]))",QuoteDrafts.map("id",id,"program",x.programId(),"period",x.periodId(),"valuation",x.valuationDate(),"posting",x.postingDate(),"reason",x.reason(),"ids",uuidArray(x.invoiceIds())),201);}));}
 @PostMapping("/api/v1/incentives/settlements")
 ResponseEntity<String> settlement(@RequestBody Settlement x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.settle");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();if(x.net()==null||x.tax()==null)throw LedgerFields.invalid();MasterDataChecks.check(x.items()!=null&&x.items().canonical().startsWith("["),"items","Explicit settlement items array required.");jdbc.sql("SELECT incentives.require_settlement(CAST(:claim AS uuid))").param("claim",x.claimId()).query((rs,n)->0).single();return write(scope,request,"incentives.settle","POST /incentives/settlements",id,QuoteDrafts.map("claimId",x.claimId(),"net",x.net(),"tax",x.tax(),"postingDate",x.postingDate()==null?null:x.postingDate().toString(),"reference",x.reference(),"reason",x.reason(),"evidence",x.evidence(),"items",x.items(),"priorSettlementId",x.priorSettlementId()),"SELECT incentives.settle(:id,CAST(:claim AS uuid),CAST(:net AS numeric),CAST(:tax AS numeric),CAST(:date AS date),CAST(:ref AS text),CAST(:reason AS text),CAST(:evidence AS text),CAST(:items AS jsonb),CAST(:prior AS uuid))",QuoteDrafts.map("id",id,"claim",x.claimId(),"net",x.net(),"tax",x.tax(),"date",x.postingDate(),"ref",x.reference(),"reason",x.reason(),"evidence",x.evidence(),"items",x.items().canonical(),"prior",x.priorSettlementId()),201);}));}
 @PostMapping("/api/v1/incentives/offsets")
 ResponseEntity<String> offset(@RequestBody Offset x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.settle");return response(staff.inCompany(scope,rid(request),()->{UUID id=UUID.randomUUID();return write(scope,request,"incentives.settle","POST /incentives/offsets",id,QuoteDrafts.map("positiveClaimId",x.positiveClaimId(),"negativeClaimId",x.negativeClaimId(),"amount",x.amount(),"postingDate",x.postingDate()==null?null:x.postingDate().toString(),"reference",x.reference(),"reason",x.reason()),"SELECT incentives.offset_claims(:id,CAST(:positive AS uuid),CAST(:negative AS uuid),CAST(:amount AS numeric),CAST(:date AS date),CAST(:ref AS text),CAST(:reason AS text))",QuoteDrafts.map("id",id,"positive",x.positiveClaimId(),"negative",x.negativeClaimId(),"amount",x.amount(),"date",x.postingDate(),"ref",x.reference(),"reason",x.reason()),201);}));}
 @PutMapping("/api/v1/incentives/programs/{id}/display-grants")
 ResponseEntity<String> grant(@PathVariable UUID id,@RequestBody Grant x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
 var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.grants.manage");return response(staff.inCompany(scope,rid(request),()->{long v=grantVersion(request.getHeader("If-Match"));if(x.active()==null)throw LedgerFields.invalid();return write(scope,request,"incentives.grants.manage","PUT /incentives/display-grants",id,QuoteDrafts.map("id",id,"v",v,"x",QuoteDrafts.map("userId",x.userId(),"active",x.active())),"SELECT incentives.grant_display(:id,CAST(:user AS uuid),:active,:v)",QuoteDrafts.map("id",id,"user",x.userId(),"active",x.active(),"v",v),200);}));}
 @GetMapping("/api/v1/incentives/programs")
 ResponseEntity<String> programs(@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"incentives.read","SELECT incentives.list_programs(:offset,:size)",page(page,pageSize),false);}
 @GetMapping("/api/v1/incentives/ledger")
 ResponseEntity<String> ledger(@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"incentives.read","SELECT incentives.ledger_page(:offset,:size)",page(page,pageSize),false);}
 @GetMapping("/api/v1/incentives/me")
 ResponseEntity<String> me(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"incentives.self.read","SELECT incentives.personal()",Map.of(),true);}
 @GetMapping("/api/v1/incentives/programs/{id}")
 ResponseEntity<String> program_json(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"incentives.read","SELECT incentives.program_json(:id)",Map.of("id",id),false);}
 @GetMapping("/api/v1/incentives/runs/{id}")
 ResponseEntity<String> run_json(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"incentives.read","SELECT incentives.run_json(:id)",Map.of("id",id),false);}
 @PostMapping("/api/v1/incentives/runs/{id}/approve")
 ResponseEntity<String> approve(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.approve");return response(staff.inCompany(scope,rid(request),()->{long v=WarehouseDetails.version(request.getHeader("If-Match"));return write(scope,request,"incentives.approve","POST /incentives/runs/approve",id,QuoteDrafts.map("id",id,"v",v),"SELECT incentives.approve_run(:id,:v)",QuoteDrafts.map("id",id,"v",v),200);}));}
 @PostMapping("/api/v1/incentives/runs/{id}/reject")
 ResponseEntity<String> reject(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=staff.require(token,request.getHeader("X-Company-Id"),"incentives.manage");return response(staff.inCompany(scope,rid(request),()->{long v=WarehouseDetails.version(request.getHeader("If-Match"));return write(scope,request,"incentives.manage","POST /incentives/runs/reject",id,QuoteDrafts.map("id",id,"v",v),"SELECT incentives.reject_run(:id,:v)",QuoteDrafts.map("id",id,"v",v),200);}));}

 private IdempotentWrite.StoredResponse write(StaffScope.CompanyAccess scope,HttpServletRequest request,String cap,String route,UUID id,Object payload,String sql,Map<String,?> args,int status){
  jdbc.sql("SELECT incentives.require_access(:cap)").param("cap",cap).query((rs,n)->0).single();
  return writes.execute(scope,route,request.getHeader("Idempotency-Key"),LegacyRawJson.value(payload),()->{
   String body=jdbc.sql(sql+"::text").params(args).query(String.class).single();audit.record(scope,"incentives.changed","incentive",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(status,body);
  });
 }
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String cap,String sql,Map<String,?> args,boolean privateCache){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);String body=staff.inCompany(scope,rid(request),()->jdbc.sql(sql+"::text").params(args).query(String.class).single());var result=ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON);if(privateCache)result.cacheControl(CacheControl.noStore());return result.body(body);}
 private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int n=a==null?1:a,size=b==null?25:b;MasterDataChecks.check(n>=1&&n<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("size",size,"offset",(n-1)*size);}
 private static String uuidArray(UUID[] ids){return ids==null?null:Arrays.stream(ids).map(x->x==null?"NULL":x.toString()).collect(java.util.stream.Collectors.joining(",","{","}"));}
 private static long grantVersion(String input){try{String raw=input==null?"":input;int a=0,b=raw.length();while(a<b&&raw.charAt(a)==34)a++;while(b>a&&raw.charAt(b-1)==34)b--;String x=MasterDataChecks.trim(raw.substring(a,b));if(!x.matches("[+]?[0-9]+"))throw new NumberFormatException();long n=Long.parseLong(x);if(n<0)throw new NumberFormatException();return n;}catch(NumberFormatException ex){throw new StaffScope.Failure(428,"version_required","Supply If-Match with 0 for a new grant or its current version.");}}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r){return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
}
