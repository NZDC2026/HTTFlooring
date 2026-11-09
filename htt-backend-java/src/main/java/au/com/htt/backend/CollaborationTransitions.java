package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class CollaborationTransitions {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;private final CrmParties parties;private final tools.jackson.databind.json.JsonMapper json;
 CollaborationTransitions(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit,tools.jackson.databind.json.JsonMapper json,CrmParties parties){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;this.json=json;this.parties=parties;}
 @PutMapping("/api/v1/crm/collaboration/{id}")
 ResponseEntity<String> update(@PathVariable UUID id,@RequestBody JsonNode input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,"UPDATE",input,null,token,request,"crm.collaboration.read");}
 @DeleteMapping("/api/v1/crm/collaboration/{id}")
 ResponseEntity<String> delete(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,"DELETE",null,null,token,request,"crm.collaboration.read");}
 @PostMapping("/api/v1/crm/collaboration/{id}/remove")
 ResponseEntity<String> remove(@PathVariable UUID id,@RequestBody Reason input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,"REMOVE",null,input.reason,token,request,"crm.boards.write");}
 @PostMapping("/api/v1/crm/collaboration/{id}/checkout")
 ResponseEntity<String> checkout(@PathVariable UUID id,@RequestBody JsonNode input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,"CHECKOUT",input,null,token,request,"crm.visits.write");}
 @PostMapping("/api/v1/crm/collaboration/{id}/cancel")
 ResponseEntity<String> cancel(@PathVariable UUID id,@RequestBody Reason input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,"CANCEL",null,input.reason,token,request,"crm.visits.write");}
 private ResponseEntity<String> change(UUID id,String action,JsonNode input,String reason,Jwt token,HttpServletRequest request,String cap){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_collab(:id,true)",scope,Map.of("id",id)).query((r,n)->0).single();
   String kind=query("SELECT kind FROM crm.collaboration_objects WHERE company_id=:company AND id=:id",scope,Map.of("id",id)).query(String.class).single();
   String data=normalize(id,kind,action,input,reason);
   long version=WarehouseDetails.version(request.getHeader("If-Match"));
   String lower=action.toLowerCase(Locale.ROOT),canonical="{\"id\":\""+id+"\",\"version\":"+version+",\"data\":"+data+"}";
   return writes.execute(scope,"POST /crm/collaboration/"+lower,request.getHeader("Idempotency-Key"),canonical,()->{
    String body=query("SELECT crm.collab_command(:id,:kind,CAST(NULL AS uuid),CAST(NULL AS uuid),:action,:v,CAST(:data AS jsonb))::text",scope,Map.of("id",id,"kind",kind,"action",action,"v",version,"data",data)).query(String.class).single();
    audit.record(scope,"crm.collaboration_"+lower,"crm_collaboration",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(200,body);
   });
  }));
 }
 @PostMapping("/api/v1/crm/mobile/devices/{device}/collaboration-operations")
 ResponseEntity<String> push(@PathVariable UUID device,@RequestBody Operation input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"crm.mobile.sync");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_mobile_device(:device),crm.require_mobile('crm.collaboration.read')",scope,Map.of("device",device)).query((r,n)->0).single();
   UUID zero=new UUID(0,0);check(input.operationId!=null&&!zero.equals(input.operationId)&&input.id!=null&&!zero.equals(input.id)&&input.sequence>0,"operation","Stable IDs and positive sequence required.");
   check(input.action!=null&&Set.of("CREATE","UPDATE","DELETE","CHECKOUT","CANCEL","REMOVE").contains(input.action),"action","Invalid action.");
   String kind=input.kind;
   if(input.action.equals("CREATE")){
    check(kind!=null&&Set.of("NOTE","BOARD","VISIT").contains(kind),"kind","Invalid kind.");check(input.customerId!=null&&!zero.equals(input.customerId),"customerId","Target customer required.");parties.customerParty(scope,input.customerId);
    query("SELECT crm.require_collab_customer(:customer)",scope,Map.of("customer",input.customerId)).query((r,n)->0).single();
    query("SELECT crm.require_mobile(:cap)",scope,Map.of("cap",kind.equals("NOTE")?"crm.notes.write":kind.equals("BOARD")?"crm.boards.write":"crm.visits.write")).query((r,n)->0).single();
   }else{query("SELECT crm.require_collab(:id,true)",scope,Map.of("id",input.id)).query((r,n)->0).single();kind=query("SELECT kind FROM crm.collaboration_objects WHERE company_id=:company AND id=:id",scope,Map.of("id",input.id)).query(String.class).single();check(input.version!=null&&input.version>0,"version","Expected version required.");}
   String reason=null;
   if(input.action.equals("CANCEL")||input.action.equals("REMOVE")){
    if(input.data==null||!input.data.isObject()||input.data.get("reason")!=null&&!input.data.get("reason").isNull()&&!input.data.get("reason").isString())throw new StaffScope.Failure(422,"invalid_collaboration","Supply the documented collaboration payload.");
    if(input.data.get("reason")!=null&&!input.data.get("reason").isNull())reason=input.data.get("reason").asString();
   }
   String data=normalize(input.id,kind,input.action,input.data,reason);
   String raw=QuotePricing.value(QuoteDrafts.map("domain","COLLABORATION","id",input.id,"kind",kind,"customerId",input.customerId,"branchId",input.branchId,"action",input.action,"version",input.version));
   String operation=raw.substring(0,raw.length()-1)+",\"data\":"+data+"}";
   String outer=QuotePricing.value(QuoteDrafts.map("device",device,"operationId",input.operationId,"sequence",input.sequence));
   String canonical=outer.substring(0,outer.length()-1)+",\"request\":"+operation+"}";
   return writes.execute(scope,"POST /crm/collaboration/push",request.getHeader("Idempotency-Key"),canonical,()->{
    String body=query("SELECT crm.collab_push(:device,:op,:seq,CAST(:request AS jsonb))::text",scope,Map.of("device",device,"op",input.operationId,"seq",input.sequence,"request",operation)).query(String.class).single();
    audit.record(scope,"crm.collaboration_push","crm_collaboration",input.id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(200,body);
   });
  }));
 }
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Operation {
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID operationId=new UUID(0,0);
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public long sequence;
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID id=new UUID(0,0);
  public String action;public String kind;public UUID customerId;public UUID branchId;public Long version;public JsonNode data;
 }
 private String normalize(UUID id,String kind,String action,JsonNode input,String reason){
  if(action.equals("CREATE"))return new CollaborationCreate(id,kind,null,null,input).normalizedData();
   String data;
   if(action.equals("DELETE"))data="{}";
   else if(action.equals("REMOVE")||action.equals("CANCEL"))data=QuotePricing.value(QuoteDrafts.map("reason",text(reason,"reason",2000)));
   else if(action.equals("CHECKOUT")){
    if(!kind.equals("VISIT")||input==null||!input.isObject())throw new StaffScope.Failure(422,"invalid_collaboration","Unsupported object operation.");
    var notes=input.get("notes");if(notes!=null&&!notes.isNull()&&!notes.isString())throw new StaffScope.Failure(422,"invalid_collaboration","Supply the documented collaboration payload.");
    String note=notes==null||notes.isNull()?null:trim(notes.asString());check(note==null||note.length()<=2000,"notes","notes exceeds 2000 characters.");
    var position=json.createObjectNode();position.set("checkIn",input.get("checkOut"));if(note==null)position.putNull("purpose");else position.put("purpose",note);
    data=new CollaborationCreate(id,"VISIT",null,null,position).normalizedData().replaceFirst("\"checkIn\":","\"checkOut\":").replaceFirst(",\"purpose\":",",\"notes\":");
   }
   else{if(kind.equals("VISIT"))throw new StaffScope.Failure(422,"invalid_collaboration","Unsupported object operation.");data=new CollaborationCreate(id,kind,null,null,input).normalizedData();}
  return data;
 }
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Reason {public String reason;}
}
