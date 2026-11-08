package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class CrmDraftWrites {
 private static final UUID ZERO=new UUID(0,0);
 private final StaffScope staff;private final JdbcClient jdbc;private final CrmParties parties;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
 CrmDraftWrites(StaffScope staff,JdbcClient jdbc,CrmParties parties,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.parties=parties;this.writes=writes;this.audit=audit;this.json=json;}
 @PostMapping("/api/v1/crm/drafts")
 ResponseEntity<String> create(@RequestBody Draft input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.drafts.write");return response(staff.inCompany(scope,rid(request),()->{
   check(input.id!=null&&!input.id.equals(ZERO),"id","Stable client draft ID required.");check(input.kind!=null&&Set.of("CUSTOMER","BRANCH","CONTACT").contains(input.kind),"kind","Invalid kind.");
   check(input.kind.equals("CUSTOMER")==(input.customerId==null)&&!ZERO.equals(input.customerId),"customerId","Link branch/contact to an existing accessible customer.");
   var data=normalize(input.kind,input.data);query("SELECT crm.require_mobile('crm.drafts.read'),crm.require_mobile('crm.drafts.write')",scope,Map.of()).query((r,n)->0).single();
   if(input.customerId!=null)parties.customerParty(scope,input.customerId);
   return write(scope,request,"create",QuoteDrafts.map("id",input.id,"kind",input.kind,"customerId",input.customerId,"data",data),201,()->body("SELECT crm.create_mobile_draft(:id,:kind,CAST(:customer AS uuid),CAST(:data AS jsonb))::text",scope,QuoteDrafts.map("id",input.id,"kind",input.kind,"customer",input.customerId,"data",QuotePricing.value(data))));
  }));
 }
 @PutMapping("/api/v1/crm/drafts/{id}")
 ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Data input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.drafts.write");return response(staff.inCompany(scope,rid(request),()->{guard(scope,id,"WRITE");String kind=query("SELECT kind FROM crm.mobile_drafts WHERE company_id=:company AND id=:id",scope,Map.of("id",id)).query(String.class).single();return change(scope,request,id,"UPDATE",normalize(kind,input));}));
 }
 @PostMapping("/api/v1/crm/drafts/{id}/submit")
 ResponseEntity<String> submit(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,"SUBMIT",token,request);}
 @DeleteMapping("/api/v1/crm/drafts/{id}")
 ResponseEntity<String> delete(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,"DELETE",token,request);}
 private ResponseEntity<String> transition(UUID id,String action,Jwt token,HttpServletRequest request){var scope=access(token,request,"crm.drafts.write");return response(staff.inCompany(scope,rid(request),()->change(scope,request,id,action,null)));}
 private IdempotentWrite.StoredResponse change(StaffScope.CompanyAccess scope,HttpServletRequest request,UUID id,String action,Map<String,Object> data){
  guard(scope,id,"WRITE");long version=WarehouseDetails.version(request.getHeader("If-Match"));
  return write(scope,request,action,QuoteDrafts.map("id",id,"version",version,"data",data),200,()->body("SELECT crm.change_mobile_draft(:id,:v,:action,CAST(:data AS jsonb))::text",scope,QuoteDrafts.map("id",id,"v",version,"action",action,"data",data==null?null:QuotePricing.value(data))));
 }
 @PostMapping("/api/v1/crm/drafts/{id}/review")
 ResponseEntity<String> review(@PathVariable UUID id,@RequestBody Review input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.drafts.review");return response(staff.inCompany(scope,rid(request),()->{
   guard(scope,id,"REVIEW");long version=WarehouseDetails.version(request.getHeader("If-Match"));String reason=text(input.reason,"reason",2000);
   return write(scope,request,"review",QuoteDrafts.map("id",id,"version",version,"approve",input.approve,"reason",reason),200,()->body("SELECT crm.review_mobile_draft(:id,:v,:approve,:reason)::text",scope,QuoteDrafts.map("id",id,"v",version,"approve",input.approve,"reason",reason)));
  }));
 }
 @PostMapping("/api/v1/crm/mobile/devices")
 ResponseEntity<String> register(@RequestBody Device input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.mobile.sync");return response(staff.inCompany(scope,rid(request),()->{
   check(input.deviceId!=null&&!ZERO.equals(input.deviceId),"deviceId","Device ID required.");
   if(query("SELECT id FROM crm.mobile_devices WHERE company_id=:company AND id=:id",scope,Map.of("id",input.deviceId)).query(UUID.class).optional().isPresent())device(scope,input.deviceId);
   return write(scope,request,"device",QuoteDrafts.map("deviceId",input.deviceId),201,()->body("SELECT crm.register_mobile_device(:id)::text",scope,Map.of("id",input.deviceId)));
  }));
 }
 @DeleteMapping("/api/v1/crm/mobile/devices/{device}")
 ResponseEntity<String> revoke(@PathVariable UUID device,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.mobile.sync");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT id FROM crm.mobile_devices WHERE company_id=:company AND id=:device AND actor_id=:actor",scope,Map.of("device",device,"actor",scope.actorId())).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
   return write(scope,request,"device_revoke",QuoteDrafts.map("device",device),200,()->{query("SELECT crm.revoke_mobile_device(:device)",scope,Map.of("device",device)).query((r,n)->0).single();return QuotePricing.value(QuoteDrafts.map("deviceId",device,"active",false));});
  }));
 }
 @GetMapping("/api/v1/crm/mobile/devices/{device}/changes")
 ResponseEntity<String> pull(@PathVariable UUID device,@RequestParam(required=false) String after,@RequestParam(required=false) String auth,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.mobile.sync");Long cursor=mobileLong(after);Integer size=LedgerFields.integer(pageSize);
  return response(staff.inCompany(scope,rid(request),()->new IdempotentWrite.StoredResponse(200,body("SELECT crm.mobile_pull(:device,:after,CAST(:auth AS text),:size)::text",scope,QuoteDrafts.map("device",device,"after",cursor==null?0L:cursor,"auth",auth,"size",size==null?100:size)))));
 }
 @PostMapping("/api/v1/crm/mobile/devices/{device}/operations")
 ResponseEntity<String> push(@PathVariable UUID device,@RequestBody Operation input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.mobile.sync");return response(staff.inCompany(scope,rid(request),()->{
   device(scope,device);query("SELECT crm.require_mobile('crm.drafts.write')",scope,Map.of()).query((r,n)->0).single();
   check(input.operationId!=null&&!ZERO.equals(input.operationId)&&input.id!=null&&!ZERO.equals(input.id)&&input.sequence>0,"operation","Stable nonempty operation/draft IDs and increasing device sequence required.");
   check(input.action!=null&&Set.of("CREATE","UPDATE","SUBMIT","DELETE").contains(input.action),"action","Invalid action.");
   Map<String,Object> data=null;String kind=input.kind;
   if(input.action.equals("CREATE")){
    check(kind!=null&&Set.of("CUSTOMER","BRANCH","CONTACT").contains(kind),"kind","Invalid kind.");
    check(kind.equals("CUSTOMER")==(input.customerId==null)&&!ZERO.equals(input.customerId),"customerId","Link branch/contact to an existing accessible customer.");
    data=normalize(kind,input.data);if(input.customerId!=null)parties.customerParty(scope,input.customerId);
   }else{guard(scope,input.id,"WRITE");check(input.version!=null&&input.version>0,"version","Expected draft version required.");if(input.action.equals("UPDATE")){kind=query("SELECT kind FROM crm.mobile_drafts WHERE company_id=:company AND id=:id",scope,Map.of("id",input.id)).query(String.class).single();data=normalize(kind,input.data);}}
   var operation=QuoteDrafts.map("id",input.id,"action",input.action,"version",input.version,"kind",kind,"customerId",input.customerId,"data",data);
   return write(scope,request,"push",QuoteDrafts.map("device",device,"operationId",input.operationId,"sequence",input.sequence,"request",operation),200,()->body("SELECT crm.mobile_push(:device,:operation,:seq,CAST(:request AS jsonb))::text",scope,QuoteDrafts.map("device",device,"operation",input.operationId,"seq",input.sequence,"request",QuotePricing.value(operation))));
  }));
 }
 private void device(StaffScope.CompanyAccess scope,UUID device){query("SELECT crm.require_mobile_device(:device)",scope,Map.of("device",device)).query((r,n)->0).single();}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Device {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID deviceId=ZERO;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Operation {
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID operationId=ZERO;
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public long sequence;
  @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID id=ZERO;
  public String action;public Long version;public String kind;public UUID customerId;public Data data;
 }
 private static Long mobileLong(String value){if(value==null)return null;try{String text=trim(value);if(!text.matches("[+-]?[0-9]+"))throw new NumberFormatException();return Long.parseLong(text);}catch(NumberFormatException e){throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");}}
 @PostMapping("/api/v1/crm/contact-imports")
 ResponseEntity<String> importPreview(@RequestBody ContactImport input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_mobile('crm.drafts.write'),crm.require_mobile('crm.drafts.read')",scope,Map.of()).query((r,n)->0).single();parties.customerParty(scope,input.customerId);
   String consent=text(input.consentReference,"consentReference",200);check(input.selectedContacts!=null&&input.selectedContacts.size()>=1&&input.selectedContacts.size()<=100,"selectedContacts","Upload only 1..100 user-selected contacts.");
   var rows=input.selectedContacts.stream().map(d->normalize("CONTACT",d)).toList();
   return write(scope,request,"import-preview",QuoteDrafts.map("customerId",input.customerId,"consent",consent,"rows",rows),201,()->body("SELECT crm.preview_contact_import(:id,:customer,:consent,CAST(:rows AS jsonb))::text",scope,QuoteDrafts.map("id",UUID.randomUUID(),"customer",input.customerId,"consent",consent,"rows",QuotePricing.value(rows))));
  }));
 }
 @PostMapping("/api/v1/crm/contact-imports/{id}/confirm")
 ResponseEntity<String> importConfirm(@PathVariable UUID id,@RequestBody ImportConfirmation input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_contact_import(:id)",scope,Map.of("id",id)).query((r,n)->0).single();
   check(input.rows!=null&&input.rows.size()>=1&&input.rows.size()<=100&&input.rows.stream().allMatch(x->x!=null&&x>=0)&&new HashSet<>(input.rows).size()==input.rows.size(),"rows","Select distinct preview row indexes.");
   var rows=input.rows.stream().sorted().toList();
   return write(scope,request,"import-confirm",QuoteDrafts.map("id",id,"rows",rows),201,()->body("SELECT crm.confirm_contact_import(:id,ARRAY(SELECT jsonb_array_elements_text(CAST(:rows AS jsonb))::integer))::text",scope,Map.of("id",id,"rows",QuotePricing.value(rows))));
  }));
 }
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class ContactImport {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerId=ZERO;public String consentReference;public List<Data> selectedContacts;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class ImportConfirmation {@com.fasterxml.jackson.annotation.JsonSetter(contentNulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public List<Integer> rows;}
 @GetMapping("/api/v1/crm/cards/jobs/{id}")
 ResponseEntity<String> card(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->new IdempotentWrite.StoredResponse(200,body("SELECT crm.card_view(:id)::text",scope,Map.of("id",id)))));
 }
 @PostMapping("/api/v1/crm/cards/jobs/{id}/retry")
 ResponseEntity<String> cardRetry(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_card(:id)",scope,Map.of("id",id)).query((r,n)->0).single();
   return write(scope,request,"card_retry",QuoteDrafts.map("id",id),200,()->{query("SELECT crm.retry_card(:id)",scope,Map.of("id",id)).query((r,n)->0).single();return body("SELECT crm.card_view(:id)::text",scope,Map.of("id",id));});
  }));
 }
 @PostMapping("/api/v1/crm/cards/jobs/{id}/confirm")
 ResponseEntity<String> cardConfirm(@PathVariable UUID id,@RequestBody Data input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_card(:id)",scope,Map.of("id",id)).query((r,n)->0).single();var data=normalize("CONTACT",input);
   return write(scope,request,"card_confirm",QuoteDrafts.map("id",id,"data",data),201,()->body("SELECT crm.confirm_card(:id,CAST(:data AS jsonb))::text",scope,Map.of("id",id,"data",QuotePricing.value(data))));
  }));
 }
 @PostMapping(value="/api/v1/crm/cards/{customer}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 ResponseEntity<String> uploadCard(@PathVariable UUID customer,@RequestPart("file") org.springframework.web.multipart.MultipartFile file,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request,"crm.contacts.import");return response(staff.inCompany(scope,rid(request),()->{
   query("SELECT crm.require_mobile('crm.drafts.write'),crm.require_mobile('crm.drafts.read')",scope,Map.of()).query((r,n)->0).single();parties.customerParty(scope,customer);
   check(file.getSize()>0&&file.getSize()<=10485760,"file","Upload a selected card PNG/JPEG up to 10 MiB.");
   String type=file.getContentType();check(type!=null&&Set.of("image/png","image/jpeg").contains(type),"file","Card image required.");
   byte[] bytes;try(var stream=file.getInputStream()){bytes=stream.readNBytes(10485761);}catch(java.io.IOException failure){throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");}
   check(bytes.length<=10485760,"file","Card image too large.");
   String name=trim(file.getOriginalFilename());
   if(name.isEmpty()||name.length()>180||name.startsWith(".")||name.chars().anyMatch(c->Character.isISOControl(c)||"/\\\\:\\\"".indexOf(c)>=0))throw new StaffScope.Failure(422,"invalid_filename","Use a filename without paths or control characters (max 180).");
   String lower=name.toLowerCase(Locale.ROOT);boolean valid=type.equals("image/png")?lower.endsWith(".png")&&bytes.length>=8&&Arrays.equals(bytes,0,8,new byte[]{(byte)137,80,78,71,13,10,26,10},0,8):(lower.endsWith(".jpg")||lower.endsWith(".jpeg"))&&bytes.length>=4&&(bytes[0]&255)==255&&(bytes[1]&255)==216&&(bytes[bytes.length-2]&255)==255&&(bytes[bytes.length-1]&255)==217;
   if(!valid)throw new StaffScope.Failure(422,"unsupported_file","Upload a PDF, PNG or JPEG with matching filename, MIME and file signature.");
   String sha;try{sha=HexFormat.of().withUpperCase().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes));}catch(java.security.NoSuchAlgorithmException impossible){throw new IllegalStateException(impossible);}
   return write(scope,request,"card_queue",QuoteDrafts.map("customer",customer,"sha",sha,"type",type),202,()->{
    UUID id=query("SELECT crm.queue_card(:customer,:type,:bytes)",scope,Map.of("customer",customer,"type",type,"bytes",bytes)).query(UUID.class).single();
    return body("SELECT crm.card_view(:id)::text",scope,Map.of("id",id));
   });
  }));
 }
 private IdempotentWrite.StoredResponse write(StaffScope.CompanyAccess scope,HttpServletRequest request,String action,Object input,int status,Supplier<String> run){
  return writes.execute(scope,"POST /crm/"+action,request.getHeader("Idempotency-Key"),QuotePricing.value(input),()->{
   String body=run.get();var node=json.readTree(body);UUID id=ZERO;
   if(node.has("id"))id=UUID.fromString(node.get("id").asString());else if(node.has("deviceId"))id=UUID.fromString(node.get("deviceId").asString());else if(node.has("draft")&&node.get("draft").has("id"))id=UUID.fromString(node.get("draft").get("id").asString());
   audit.record(scope,"crm."+action.replace('-','_'),"crm_draft",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(status,body);
  });
 }
 static Map<String,Object> normalize(String kind,Data d){
  check(d!=null,"data","Draft details required.");String name=text(d.name,"name",200);
  String code=kind.equals("CUSTOMER")||kind.equals("BRANCH")?code(d.code,"code"):null;
  String abn=kind.equals("CUSTOMER")&&!trim(d.abn).isEmpty()?CustomerWrites.normalizeAbn(d.abn):null;
  String email=kind.equals("CONTACT")?ContactFields.email(d.email):null;if(email!=null)email=email.toLowerCase(Locale.ROOT);
  String phone=kind.equals("CONTACT")?phone(d.phone):null,mobile=kind.equals("CONTACT")?phone(d.mobile):null,job=kind.equals("CONTACT")?optional(d.jobTitle,"jobTitle",100):null;
  var branches=kind.equals("CONTACT")?ContactFields.branches(d.branchIds):List.<UUID>of();
  String address=kind.equals("BRANCH")?text(d.addressLine1,"addressLine1",300):null,suburb=kind.equals("BRANCH")?optional(d.suburb,"suburb",200):null,state=kind.equals("BRANCH")?upper(text(d.state,"state",3)):null,postcode=kind.equals("BRANCH")?text(d.postcode,"postcode",4):null;
  if(kind.equals("BRANCH")){check(Set.of("ACT","NSW","NT","QLD","SA","TAS","VIC","WA").contains(state),"state","An Australian state/territory is required.");check(postcode.matches("[0-9]{4}"),"postcode","Australian postcode must contain four digits.");}
  return QuoteDrafts.map("name",name,"code",code,"abn",abn,"email",email,"phone",phone,"mobile",mobile,"jobTitle",job,"addressLine1",address,"suburb",suburb,"state",state,"postcode",postcode,"branchIds",branches);
 }
 private static String phone(String value){String checked=ContactFields.phone(value,"phone");if(checked==null)return null;String compact=checked.replaceAll("[(). -]","");return compact.matches("0[0-9]{9}")?"+61"+compact.substring(1):compact;}
 private void guard(StaffScope.CompanyAccess scope,UUID id,String action){query("SELECT crm.require_mobile_draft(:id,:action)",scope,Map.of("id",id,"action",action)).query((r,n)->0).single();}
 private String body(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query(String.class).single();}
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Draft {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID id=ZERO;public String kind;public UUID customerId;public Data data;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Data {public String name;public String code;public String abn;public String email;public String phone;public String mobile;public String jobTitle;public String addressLine1;public String suburb;public String state;public String postcode;@com.fasterxml.jackson.annotation.JsonSetter(contentNulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public List<UUID> branchIds;}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Review {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean approve;public String reason;}
}
