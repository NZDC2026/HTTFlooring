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
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class RecurringWrites {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
 RecurringWrites(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;this.json=json;}
 record Template(String name,String kind,String frequency,int every,LocalDate startsOn,LocalDate endsOn,int maxOccurrences,LegacyRawJson payload){}
 record Change(String action,String reason,LegacyRawJson payload){}
 record Review(String action,String reason,LegacyRawJson evidence){}
 @PostMapping("/api/v1/recurring/templates")
 ResponseEntity<String> create(@RequestBody Template x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"recurring.write");String rid=rid(request);
  return response(staff.inCompany(scope,rid,()->{
   MasterDataChecks.check(x.payload()!=null&&x.payload().object(),"payload","Supply a recurring source object.");
   jdbc.sql("SELECT crm.require_mobile('recurring.read'),recurring.validate_payload(CAST(:kind AS text),CAST(:payload AS jsonb))").params(QuoteDrafts.map("kind",x.kind(),"payload",x.payload().canonical())).query((rs,n)->0).single();
   var canonical=QuoteDrafts.map("name",x.name(),"kind",x.kind(),"frequency",x.frequency(),"every",x.every(),"startsOn",x.startsOn()==null?null:x.startsOn().toString(),"endsOn",x.endsOn()==null?null:x.endsOn().toString(),"maxOccurrences",x.maxOccurrences(),"payload",x.payload());
   return writes.execute(scope,"POST /recurring/templates",request.getHeader("Idempotency-Key"),LegacyRawJson.value(canonical),()->{
    UUID id=jdbc.sql("SELECT recurring.create_template(CAST(:name AS text),CAST(:kind AS text),CAST(:frequency AS text),:every,CAST(:start AS date),CAST(:end AS date),:max,CAST(:payload AS jsonb))").params(QuoteDrafts.map("name",x.name(),"kind",x.kind(),"frequency",x.frequency(),"every",x.every(),"start",x.startsOn(),"end",x.endsOn(),"max",x.maxOccurrences(),"payload",x.payload().canonical())).query(UUID.class).single();
    audit.record(scope,"recurring.template_created","recurring_template",id,rid,Map.of());return new IdempotentWrite.StoredResponse(201,view("template",id));
   });
  }));
 }
 @PostMapping("/api/v1/recurring/templates/{id}/change")
 ResponseEntity<String> change(@PathVariable UUID id,@RequestBody Change x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"recurring.write");String rid=rid(request);
  return response(staff.inCompany(scope,rid,()->{
   view("template",id);long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return writes.execute(scope,"POST /recurring/templates/"+id+"/change",request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("version",version,"x",QuoteDrafts.map("action",x.action(),"reason",x.reason(),"payload",x.payload()))),()->{
    jdbc.sql("SELECT recurring.change_template(:id,:version,CAST(:action AS text),CAST(:payload AS jsonb),CAST(:reason AS text))").params(QuoteDrafts.map("id",id,"version",version,"action",x.action(),"payload",x.payload()==null?null:x.payload().canonical(),"reason",x.reason())).query((rs,n)->0).single();
    audit.record(scope,"recurring.template_changed","recurring_template",id,rid,QuoteDrafts.map("Action",x.action(),"Reason",x.reason()));return new IdempotentWrite.StoredResponse(200,view("template",id));
   });
  }));
 }
 @PostMapping("/api/v1/recurring/runs/{id}/review")
 ResponseEntity<String> review(@PathVariable UUID id,@RequestBody Review x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"recurring.review");String rid=rid(request);
  return response(staff.inCompany(scope,rid,()->{
   var source=json.readTree(view("run",id));
   if("APPROVE".equals(x.action())){String cap=switch(source.path("kind").asString()){case "INVOICE"->"sales.invoices.write";case "EXPENSE_BILL"->"purchase.expense_bills.post";default->"accounting.bank_transactions.post";};String sql=cap.startsWith("accounting.")?"SELECT accounting.require_general_banking(:cap)":"SELECT crm.require_mobile(:cap)";jdbc.sql(sql).param("cap",cap).query((rs,n)->0).single();}
   long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return writes.execute(scope,"POST /recurring/runs/"+id+"/review",request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("version",version,"x",QuoteDrafts.map("action",x.action(),"reason",x.reason(),"evidence",x.evidence()))),()->new IdempotentWrite.StoredResponse(200,jdbc.sql("SELECT recurring.review(:id,:version,CAST(:action AS text),CAST(:evidence AS jsonb),CAST(:reason AS text))::text").params(QuoteDrafts.map("id",id,"version",version,"action",x.action(),"evidence",x.evidence()==null?null:x.evidence().canonical(),"reason",x.reason())).query(String.class).single()));
  }));
 }
 private String view(String kind,UUID id){return jdbc.sql(kind.equals("template")?"SELECT recurring.template_view(:id)::text":"SELECT recurring.run_view(:id)::text").param("id",id).query(String.class).single();}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r){return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
 private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
}
