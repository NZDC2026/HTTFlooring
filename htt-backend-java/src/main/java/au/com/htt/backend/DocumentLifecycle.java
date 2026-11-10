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
class DocumentLifecycle {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 DocumentLifecycle(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 record Input(String reason){}
 @GetMapping("/api/v1/documents/trash")
 ResponseEntity<String> list(@RequestParam(required=false) String documentType,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){Integer p=LedgerFields.integer(page),n=LedgerFields.integer(pageSize);return read(token,request,"SELECT platform.trash_items(CAST(:type AS text),:page,:size)::text",QuoteDrafts.map("type",documentType,"page",p==null?1:p,"size",n==null?25:n));}
 @GetMapping("/api/v1/documents/{id}/lifecycle")
 ResponseEntity<String> lifecycle(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"SELECT platform.trash_view(:id)::text",Map.of("id",id));}
 @PostMapping("/api/v1/documents/{id}/trash")
 ResponseEntity<String> trash(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,false,token,request);}
 @DeleteMapping("/api/v1/documents/{id}")
 ResponseEntity<String> delete(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,false,token,request);}
 @PostMapping("/api/v1/documents/{id}/restore")
 ResponseEntity<String> restore(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,true,token,request);}
 private ResponseEntity<String> change(UUID id,Input input,boolean restore,Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),restore?"documents.trash.restore":"documents.trash.write");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
  var result=staff.inCompany(scope,rid,()->{
   String reason=MasterDataChecks.text(input.reason(),"reason",2000);
   long version=version(request.getHeader("If-Match"),true),business=version(request.getHeader("X-Document-Version"),false);String action=restore?"RESTORE":"TRASH";
   jdbc.sql("SELECT platform.trash_access(:id,'READ'),platform.trash_access(:id,:action)").param("id",id).param("action",action).query((rs,n)->0).single();
   return writes.execute(scope,action+" /documents/"+id,request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version,"businessVersion",business,"reason",reason)),()->{
    String body=jdbc.sql("SELECT platform.change_visibility(:id,:version,:business,:restore,:reason)::text").params(QuoteDrafts.map("id",id,"version",version,"business",business,"restore",restore,"reason",reason)).query(String.class).single();
    audit.record(scope,restore?"documents.restored":"documents.trashed","document",id,rid,QuoteDrafts.map("reason",reason,"documentVersion",business,"lifecycleVersion",version+1));return new IdempotentWrite.StoredResponse(200,body);
   });
  });return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
 }
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String sql,Map<String,?> args){var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.trash.read");return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->jdbc.sql(sql).params(args).query(String.class).single()));}
 private static long version(String raw,boolean lifecycle){String value=raw==null?"":raw;if(lifecycle){int a=0,b=value.length();while(a<b&&value.charAt(a)=='"')a++;while(b>a&&value.charAt(b-1)=='"')b--;value=value.substring(a,b);}try{if(!value.matches("[0-9]+"))throw new NumberFormatException();long n=Long.parseLong(value);if(n<1)throw new NumberFormatException();return n;}catch(NumberFormatException e){throw new StaffScope.Failure(428,lifecycle?"lifecycle_version_required":"document_version_required",lifecycle?"Supply If-Match as the current lifecycleVersion.":"Supply X-Document-Version as the current business document version.");}}
 static void visible(JdbcClient jdbc){
  var context=org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();if(!(context instanceof org.springframework.web.context.request.ServletRequestAttributes attrs))return;var request=attrs.getRequest();
  Object pattern=request.getAttribute(org.springframework.web.servlet.HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
  if(pattern instanceof String p&&(p.equals("/api/v1/documents/{id}/lifecycle")||p.equals("/api/v1/documents/{id}/trash")||p.equals("/api/v1/documents/{id}/restore")||p.equals("/api/v1/documents/{id}")&&request.getMethod().equals("DELETE")))return;
  String path=request.getRequestURI().toLowerCase(Locale.ROOT);if(List.of("/api/v1/quotes/","/api/v1/sales-orders/","/api/v1/warehouse/orders/","/api/v1/sales-invoices/","/api/v1/sales-credit-notes/","/api/v1/purchase-orders/","/api/v1/warehouse/purchase-orders/","/api/v1/documents/").stream().noneMatch(path::startsWith))return;
  Object vars=request.getAttribute(org.springframework.web.servlet.HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);if(!(vars instanceof Map<?,?> values))return;Object id=values.get("id");UUID uuid=WarehouseDetails.scanId(id==null?null:id.toString());if(uuid==null)return;
  if(!jdbc.sql("SELECT platform.document_visible(:id)").param("id",uuid).query(Boolean.class).single())throw new StaffScope.Failure(404,"not_found","Document is unavailable in this scope.");
 }
}
