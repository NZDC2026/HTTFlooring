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
class CrmDraftReads {
 private final StaffScope staff;private final JdbcClient jdbc;
 CrmDraftReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/crm/drafts")
 ResponseEntity<String> list(@RequestParam(required=false) String state,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return read(scope,request,()->{
   check(state==null||Set.of("DRAFT","SUBMITTED","APPROVED","REJECTED","DELETED").contains(state),"state","Invalid state.");
   Integer p=LedgerFields.integer(page),s=LedgerFields.integer(pageSize);int number=p==null?1:p,size=s==null?25:s;
   check(number>=1&&number<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
   var items=query("SELECT crm.draft_json(id)::text AS body FROM crm.mobile_drafts WHERE company_id=:company AND(owner_id=:actor OR crm.mobile_reviewer())AND crm.mobile_customer_visible(customer_id)AND(CAST(:state AS text) IS NULL OR state=:state)ORDER BY updated_at DESC,id LIMIT :size OFFSET :offset",scope,QuoteDrafts.map("state",state,"size",size,"offset",(number-1)*size)).query(String.class).list();
   return "{\"items\":["+String.join(",",items)+"],\"page\":"+number+",\"pageSize\":"+size+"}";
  });
 }
 @GetMapping("/api/v1/crm/drafts/{id}")
 ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{guard(scope,id);return query("SELECT crm.draft_json(:id)::text",scope,Map.of("id",id)).query(String.class).single();});}
 @GetMapping("/api/v1/crm/drafts/{id}/duplicates")
 ResponseEntity<String> duplicates(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{guard(scope,id);return query("SELECT (SELECT crm.mobile_duplicates(kind,customer_id,data)FROM crm.mobile_drafts WHERE company_id=:company AND id=:id)::text",scope,Map.of("id",id)).query(String.class).single();});}
 private void guard(StaffScope.CompanyAccess scope,UUID id){query("SELECT crm.require_mobile_draft(:id,'READ')",scope,Map.of("id",id)).query((r,n)->0).single();}
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).param("actor",scope.actorId()).params(args);}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){return staff.require(token,request.getHeader("X-Company-Id"),"crm.drafts.read");}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body.get()));}
}
