package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class NotificationReads {
 private final StaffScope staff;private final JdbcClient jdbc;
 NotificationReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/crm/messages")
 ResponseEntity<String> messages(@RequestParam(required=false) String unread,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.notifications.read");boolean onlyUnread=LedgerFields.bool(unread);Integer p=LedgerFields.integer(page),s=LedgerFields.integer(pageSize);
  return read(scope,request,()->{int number=p==null?1:p,size=s==null?25:s;check(number>=1&&number<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return value("SELECT crm.message_list(:unread,:size,:offset)::text",Map.of("unread",onlyUnread,"size",size,"offset",(number-1)*size));});
 }
 @GetMapping("/api/v1/crm/messages/{id}")
 ResponseEntity<String> message(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.notifications.read");return read(scope,request,()->value("SELECT crm.message_json(:id)::text",Map.of("id",id)));}
 @GetMapping("/api/v1/crm/messages/{id}/push")
 ResponseEntity<String> push(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.notifications.read");return read(scope,request,()->value("SELECT crm.push_status(:id)::text",Map.of("id",id)));}
 @GetMapping("/api/v1/crm/notes/{id}/follow")
 ResponseEntity<String> follow(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.notifications.read");return read(scope,request,()->value("SELECT crm.follow_view(:id)::text",Map.of("id",id)));}
 @GetMapping("/api/v1/crm/notification-preferences")
 ResponseEntity<String> preferences(@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.push.write");return read(scope,request,()->value("SELECT crm.preferences_view()::text",Map.of()));}
 @GetMapping("/api/v1/crm/mobile/devices/{device}/push-subscription")
 ResponseEntity<String> subscription(@PathVariable UUID device,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.push.write");return read(scope,request,()->value("SELECT crm.subscription_view(:device)::text",Map.of("device",device)));}
 private String value(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body.get()));}
}
