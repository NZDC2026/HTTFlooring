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
class TaskReads {
 private final StaffScope staff;private final JdbcClient jdbc;
 TaskReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/crm/tasks")
 ResponseEntity<String> list(@RequestParam(required=false) String assigneeId,@RequestParam(required=false) String customerId,@RequestParam(required=false) String state,@RequestParam(required=false) String dueBefore,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.tasks.read");var assignee=LedgerFields.uuid(assigneeId);var customer=LedgerFields.uuid(customerId);var due=QueryOffsetFields.parse(dueBefore);
  return read(scope,request,()->{
   check(state==null||Set.of("OPEN","IN_PROGRESS","COMPLETED","CANCELLED").contains(state),"state","Invalid state.");var args=page(page,pageSize);
   String filter=QuotePricing.value(QuoteDrafts.map("assigneeId",assignee,"customerId",customer,"state",state,"dueBefore",due,"offset",args[2],"size",args[1]));
   return paged(value("SELECT crm.task_list(CAST(:filter AS jsonb))::text",Map.of("filter",filter)),args);
  });
 }
 @GetMapping("/api/v1/crm/task-assignees")
 ResponseEntity<String> assignees(@RequestParam(required=false) String customerId,@RequestParam(required=false) String q,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.tasks.write");var customer=LedgerFields.uuid(customerId);
  return read(scope,request,()->{String search=optional(q,"q",100);var args=page(page,pageSize);return paged(value("SELECT crm.task_assignees(CAST(:customer AS uuid),CAST(:q AS text),:size,:offset)::text",QuoteDrafts.map("customer",customer,"q",search,"size",args[1],"offset",args[2])),args);});
 }
 @GetMapping("/api/v1/crm/tasks/{id}")
 ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.tasks.read");return read(scope,request,()->value("SELECT crm.task_json(:id)::text",Map.of("id",id)));}
 @GetMapping("/api/v1/crm/tasks/{id}/history")
 ResponseEntity<String> history(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.tasks.read");return read(scope,request,()->value("SELECT crm.task_history_view(:id)::text",Map.of("id",id)));}
 @GetMapping("/api/v1/crm/action-centre")
 ResponseEntity<String> centre(@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.tasks.read");return read(scope,request,()->value("SELECT crm.action_centre()::text",Map.of()));}
 private static int[] page(String page,String size){Integer p=LedgerFields.integer(page),s=LedgerFields.integer(size);int number=p==null?1:p,count=s==null?25:s;check(number>=1&&number<=100000&&count>=1&&count<=100,"page","page must be 1..100000 and pageSize 1..100.");return new int[]{number,count,(number-1)*count};}
 private static String paged(String items,int[] page){return "{\"items\":"+items+",\"page\":"+page[0]+",\"pageSize\":"+page[1]+"}";}
 private String value(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body.get()));}
}
