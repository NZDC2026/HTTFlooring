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
class RecurringReads {
 private final StaffScope staff;private final JdbcClient jdbc;
 RecurringReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/recurring/templates")
 ResponseEntity<String> templates(@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT recurring.list('TEMPLATES',NULL,:size,:offset)::text",page(page,pageSize));}
 @GetMapping("/api/v1/recurring/runs")
 ResponseEntity<String> runs(@RequestParam(required=false) String templateId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var args=page(page,pageSize);args.put("id",LedgerFields.uuid(templateId));return read(token,request,"SELECT recurring.list('RUNS',CAST(:id AS uuid),:size,:offset)::text",args);}
 @GetMapping("/api/v1/recurring/templates/{id}")
 ResponseEntity<String> template(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT recurring.template_view(:id)::text",Map.of("id",id));}
 @GetMapping("/api/v1/recurring/runs/{id}")
 ResponseEntity<String> run(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT recurring.run_view(:id)::text",Map.of("id",id));}
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String sql,Map<String,?> args){var scope=staff.require(token,request.getHeader("X-Company-Id"),"recurring.read");return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->jdbc.sql(sql).params(args).query(String.class).single()));}
 private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int n=a==null?1:a,size=b==null?25:b;MasterDataChecks.check(n>=1&&n<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("size",size,"offset",(n-1)*size);}
}
