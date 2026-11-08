package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.time.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class CollaborationReads {
 private final StaffScope staff;private final JdbcClient jdbc;
 CollaborationReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/crm/collaboration")
 ResponseEntity<String> list(@RequestParam(required=false) String kind,@RequestParam(required=false) String customerId,@RequestParam(required=false) String branchId,@RequestParam(required=false) String ownerId,@RequestParam(required=false) String state,@RequestParam(required=false) String from,@RequestParam(required=false) String to,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);UUID customer=LedgerFields.uuid(customerId),branch=LedgerFields.uuid(branchId),owner=LedgerFields.uuid(ownerId);OffsetDateTime start=date(from),end=date(to);Integer p=LedgerFields.integer(page),s=LedgerFields.integer(pageSize);
  return read(scope,request,()->{
   check(kind==null||Set.of("NOTE","BOARD","VISIT").contains(kind),"kind","Invalid kind.");check(state==null||Set.of("ACTIVE","DISPLAYED","REMOVED","OPEN","CLOSED","CANCELLED").contains(state),"state","Invalid state.");
   check(start==null||end==null||end.isAfter(start),"dates","Use a nonempty [from,to) interval.");int number=p==null?1:p,size=s==null?25:s;check(number>=1&&number<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
   var items=query(LIST,scope,QuoteDrafts.map("kind",kind,"customer",customer,"branch",branch,"owner",owner,"state",state,"from",start,"to",end,"size",size,"offset",(number-1)*size)).query(String.class).list();
   return "{\"items\":["+String.join(",",items)+"],\"page\":"+number+",\"pageSize\":"+size+"}";
  });
 }
 @GetMapping("/api/v1/crm/collaboration/{id}")
 ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{
  query("SELECT crm.require_collab(:id,false)",scope,Map.of("id",id)).query((r,n)->0).single();
  query("SELECT id FROM crm.collaboration_objects WHERE company_id=:company AND id=:id AND state<>'DELETED'",scope,Map.of("id",id)).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
  return query("SELECT crm.collab_json(:id)::text",scope,Map.of("id",id)).query(String.class).single();
 });}
 @GetMapping("/api/v1/crm/collaboration/{id}/history")
 ResponseEntity<String> history(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->query("SELECT crm.collab_history(:id)::text",scope,Map.of("id",id)).query(String.class).single());}
 private static OffsetDateTime date(String value){
  if(value==null)return null;String text=trim(value);
  try{return OffsetDateTime.parse(text).withOffsetSameInstant(ZoneOffset.UTC);}catch(java.time.format.DateTimeParseException ignored){}
  try{return LocalDateTime.parse(text).atOffset(ZoneOffset.UTC);}catch(java.time.format.DateTimeParseException ignored){}
  try{return LocalDate.parse(text).atStartOfDay().atOffset(ZoneOffset.UTC);}catch(java.time.format.DateTimeParseException ignored){}
  throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");
 }
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){return staff.require(token,request.getHeader("X-Company-Id"),"crm.collaboration.read");}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body.get()));}
 private static final String LIST = """
SELECT crm.collab_json(o.id)::text AS body FROM crm.collaboration_objects o WHERE o.company_id=:company AND o.state<>'DELETED'AND crm.collab_visible(o.id)AND(CAST(:kind AS text) IS NULL OR o.kind=:kind)AND(CAST(:customer AS uuid) IS NULL OR o.customer_id=:customer)AND(CAST(:branch AS uuid) IS NULL OR o.branch_id=:branch)AND(CAST(:owner AS uuid) IS NULL OR o.owner_id=:owner)AND(CAST(:state AS text) IS NULL OR o.state=:state)AND(CAST(:from AS timestamptz) IS NULL OR o.created_at>=:from)AND(CAST(:to AS timestamptz) IS NULL OR o.created_at<:to)ORDER BY o.created_at DESC,o.id LIMIT :size OFFSET :offset
""";
}
