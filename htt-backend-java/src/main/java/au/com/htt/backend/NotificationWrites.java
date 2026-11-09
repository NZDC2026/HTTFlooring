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
class NotificationWrites {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 NotificationWrites(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 @PutMapping("/api/v1/crm/messages/{id}/read")
 ResponseEntity<String> mark(@PathVariable UUID id,@RequestBody Read input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  required(input.read);var scope=access(token,request,"crm.notifications.read");return response(staff.inCompany(scope,rid(request),()->{
   value("SELECT crm.message_json(:id)::text",Map.of("id",id));long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return write(scope,request,"read",id,QuoteDrafts.map("id",id,"version",version,"read",input.read),()->value("SELECT crm.mark_message(:id,:v,:read)::text",Map.of("id",id,"v",version,"read",input.read)));
  }));
 }
 @PutMapping("/api/v1/crm/notes/{id}/follow")
 ResponseEntity<String> follow(@PathVariable UUID id,@RequestBody Follow input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  required(input.enabled);var scope=access(token,request,"crm.notifications.read");return response(staff.inCompany(scope,rid(request),()->{
   jdbc.sql("SELECT crm.require_collab(:id,false)").param("id",id).query((r,n)->0).single();long version=initial(request.getHeader("If-Match"));
   return write(scope,request,"follow",id,QuoteDrafts.map("id",id,"version",version,"enabled",input.enabled),()->value("SELECT crm.follow_note(:id,:enabled,:v)::text",Map.of("id",id,"enabled",input.enabled,"v",version)));
  }));
 }
 @PutMapping("/api/v1/crm/notification-preferences")
 ResponseEntity<String> preferences(@RequestBody Preferences input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  required(input.pushEnabled,input.tasksPush,input.notesPush);var scope=access(token,request,"crm.push.write");return response(staff.inCompany(scope,rid(request),()->{
   long version=initial(request.getHeader("If-Match"));var x=QuoteDrafts.map("pushEnabled",input.pushEnabled,"tasksPush",input.tasksPush,"notesPush",input.notesPush);
   return write(scope,request,"preferences",new UUID(0,0),QuoteDrafts.map("version",version,"x",x),()->value("SELECT crm.set_preferences(:v,:push,:tasks,:notes)::text",Map.of("v",version,"push",input.pushEnabled,"tasks",input.tasksPush,"notes",input.notesPush)));
  }));
 }
 @PutMapping("/api/v1/crm/mobile/devices/{device}/push-subscription")
 ResponseEntity<String> subscribe(@PathVariable UUID device,@RequestBody Subscription input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  required(input.enabled);var scope=access(token,request,"crm.push.write");return response(staff.inCompany(scope,rid(request),()->{
   jdbc.sql("SELECT crm.require_mobile_device(:device)").param("device",device).query((r,n)->0).single();
   au.com.htt.backend.MasterDataChecks.check(input.token!=null&&input.token.length()>=20&&input.token.length()<=4096&&input.token.chars().noneMatch(c->Character.isISOControl(c)||c>=9&&c<=13||c==0x85||Character.isSpaceChar(c)),"token","Valid FCM registration token required.");
   au.com.htt.backend.MasterDataChecks.check(input.platform!=null&&Set.of("ANDROID","IOS","WEB").contains(input.platform),"platform","Invalid platform.");
   long version=initial(request.getHeader("If-Match"));var x=QuoteDrafts.map("token",input.token,"platform",input.platform,"enabled",input.enabled);
   return write(scope,request,"subscribe",device,QuoteDrafts.map("device",device,"version",version,"x",x),()->value("SELECT crm.set_subscription(:device,:v,:token,:platform,:enabled)::text",Map.of("device",device,"v",version,"token",input.token,"platform",input.platform,"enabled",input.enabled)));
  }));
 }
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Subscription {public String token;public String platform;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean enabled;}
 @PostMapping("/api/v1/crm/push/jobs/{id}/retry")
 ResponseEntity<String> retry(@PathVariable UUID id,@RequestBody Retry input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  required(input.acceptDuplicateDelivery);var scope=access(token,request,"crm.push.write");return response(staff.inCompany(scope,rid(request),()->{
   au.com.htt.backend.MasterDataChecks.check(input.expectedState!=null&&Set.of("FAILED","UNKNOWN").contains(input.expectedState),"expectedState","Invalid expectedState.");
   jdbc.sql("SELECT crm.require_push_retry(:id)").param("id",id).query((r,n)->0).single();
   var x=QuoteDrafts.map("expectedState",input.expectedState,"acceptDuplicateDelivery",input.acceptDuplicateDelivery);
   return write(scope,request,"retry",id,QuoteDrafts.map("id",id,"x",x),()->{
    jdbc.sql("SELECT crm.retry_push(:id,:state,:ack)").param("id",id).param("state",input.expectedState).param("ack",input.acceptDuplicateDelivery).query((r,n)->0).single();
    return QuotePricing.value(QuoteDrafts.map("id",id,"state","RETRY"));
   });
  }));
 }
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Retry {public String expectedState;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean acceptDuplicateDelivery;}
 private IdempotentWrite.StoredResponse write(StaffScope.CompanyAccess scope,HttpServletRequest request,String action,UUID id,Object body,java.util.function.Supplier<String> run){
  return writes.execute(scope,"POST /crm/task-notifications/"+action,request.getHeader("Idempotency-Key"),QuotePricing.value(body),()->{
   String value=run.get();audit.record(scope,"crm.tasks_"+action,"crm_task_notification",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(200,value);
  });
 }
 static long initial(String header){
  try{String raw=header==null?"":header;int a=0,b=raw.length();while(a<b&&raw.charAt(a)==34)a++;while(b>a&&raw.charAt(b-1)==34)b--;String value=raw.substring(a,b).replaceAll("^[\\x09-\\x0D ]+|[\\x09-\\x0D ]+$","");if(!value.matches("[+-]?[0-9]+"))throw new NumberFormatException();long n=Long.parseLong(value);if(n<0)throw new NumberFormatException();return n;}catch(NumberFormatException invalid){throw new StaffScope.Failure(428,"version_required","Supply If-Match, using 0 for first registration.");}
 }
 private static void required(Boolean... values){for(Boolean value:values)if(value==null)throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");}
 private String value(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Read {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean read;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Follow {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean enabled;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Preferences {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean pushEnabled;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean tasksPush;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Boolean notesPush;}
}
