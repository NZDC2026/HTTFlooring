package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.time.*;
import java.time.format.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class TaskWrites {
 private static final UUID ZERO=new UUID(0,0);
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 TaskWrites(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 @PostMapping("/api/v1/crm/tasks")
 ResponseEntity<String> create(@RequestBody Create input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return response(staff.inCompany(scope,rid(request),()->{
   check(input.id!=null&&!ZERO.equals(input.id),"id","Stable task ID required.");var data=normalize(input.data);String serialized=QuotePricing.value(data);
   query("SELECT crm.task_create_guard(:id,CAST(:data AS jsonb))",Map.of("id",input.id,"data",serialized)).query((r,n)->0).single();
   return write(scope,request,input.id,"create",QuoteDrafts.map("id",input.id,"data",data),"CREATE",null,serialized,201);
  }));
 }
 @PutMapping("/api/v1/crm/tasks/{id}")
 ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Data input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return response(staff.inCompany(scope,rid(request),()->{
   guard(id);live(id);var data=normalize(input);String serialized=QuotePricing.value(data);query("SELECT crm.authorize_task_data(CAST(:data AS jsonb))",Map.of("data",serialized)).query((r,n)->0).single();
   long version=WarehouseDetails.version(request.getHeader("If-Match"));return write(scope,request,id,"update",QuoteDrafts.map("id",id,"version",version,"data",data),"UPDATE",version,serialized,200);
  }));
 }
 @PostMapping("/api/v1/crm/tasks/{id}/{action:start|complete|cancel|reopen|delete}")
 ResponseEntity<String> change(@PathVariable UUID id,@PathVariable String action,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return response(staff.inCompany(scope,rid(request),()->{
   guard(id);if(!action.equals("delete"))live(id);long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return write(scope,request,id,action,QuoteDrafts.map("id",id,"version",version),action.toUpperCase(Locale.ROOT),version,"{}",200);
  }));
 }
 private IdempotentWrite.StoredResponse write(StaffScope.CompanyAccess scope,HttpServletRequest request,UUID id,String action,Object input,String command,Long version,String data,int status){
  return writes.execute(scope,"POST /crm/task-notifications/"+action,request.getHeader("Idempotency-Key"),QuotePricing.value(input),()->{
   String body=query("SELECT crm.task_command(:id,:action,CAST(:version AS bigint),CAST(:data AS jsonb))::text",QuoteDrafts.map("id",id,"action",command,"version",version,"data",data)).query(String.class).single();
   audit.record(scope,"crm.tasks_"+action,"crm_task_notification",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(status,body);
  });
 }
 static Map<String,Object> normalize(Data d){
  check(d!=null,"data","Task details required.");check(d.assigneeId!=null&&!ZERO.equals(d.assigneeId)&&!ZERO.equals(d.customerId)&&!ZERO.equals(d.branchId),"ids","Supply nonempty IDs.");
  check(d.branchId==null||d.customerId!=null,"branchId","Customer required for branch.");
  check(d.reminderAt==null||d.dueAt!=null&&!d.reminderAt.isAfter(d.dueAt),"reminderAt","Reminder must not follow due time.");
  var min=OffsetDateTime.of(1,1,1,0,0,0,0,ZoneOffset.UTC);
  check(d.dueAt==null||!d.dueAt.isEqual(min),"dates","Valid timestamps required.");check(d.reminderAt==null||!d.reminderAt.isEqual(min),"dates","Valid timestamps required.");
  check(d.priority!=null&&Set.of("LOW","NORMAL","HIGH","URGENT").contains(d.priority),"priority","Invalid priority.");
  return QuoteDrafts.map("title",text(d.title,"title",200),"assigneeId",d.assigneeId,"description",optional(d.description,"description",10000),"customerId",d.customerId,"branchId",d.branchId,"priority",d.priority,"dueAt",time(d.dueAt),"reminderAt",time(d.reminderAt));
 }
 private static OffsetDateTime time(OffsetDateTime value){return value==null?null:value.withOffsetSameInstant(ZoneOffset.UTC);}
 private void guard(UUID id){query("SELECT crm.require_task(:id,true)",Map.of("id",id)).query((r,n)->0).single();}
 private void live(UUID id){query("SELECT crm.require_live_task(:id)",Map.of("id",id)).query((r,n)->0).single();}
 private JdbcClient.StatementSpec query(String sql,Map<String,?> args){return jdbc.sql(sql).params(args);}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){return staff.require(token,request.getHeader("X-Company-Id"),"crm.tasks.write");}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Create {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID id=ZERO;public Data data;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Data {public String title;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID assigneeId=ZERO;public String description;public UUID customerId;public UUID branchId;public String priority="NORMAL";public OffsetDateTime dueAt;public OffsetDateTime reminderAt;}
}
