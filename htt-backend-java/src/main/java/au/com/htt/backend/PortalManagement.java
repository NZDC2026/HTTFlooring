package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;import java.math.BigDecimal;import java.net.URI;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.web.bind.annotation.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class PortalManagement {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;private final CrmParties parties;
 PortalManagement(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit,CrmParties parties){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;this.parties=parties;}
 record Branch(UUID branchId,UUID[] warehouseIds){}
 record Access(String issuer,String subject,String displayName,Boolean enabled,Branch[] branches){}
 record Update(Boolean enabled,Branch[] branches){}
 record Publication(Boolean published,Boolean allCustomers,String description,BigDecimal lowStockQuantity,UUID[] customerIds,String[] barcodes){}
 @GetMapping("/api/v1/portal-access/{id}")
 ResponseEntity<String> access(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"portal.access.read","SELECT portal.access_view(:id)::text",id);}
 @GetMapping("/api/v1/portal/catalog/products/{id}")
 ResponseEntity<String> product(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"portal.catalog.write","SELECT portal.publication_view(:id)::text",id);}
 @PostMapping("/api/v1/customers/{id}/portal-access")
 ResponseEntity<String> create(@PathVariable UUID id,@RequestBody Access x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"portal.access.manage");return response(staff.inCompany(scope,rid(request),()->{
   parties.customerParty(scope,id);String issuer=MasterDataChecks.text(x.issuer(),"issuer",500);
   boolean valid=false;try{URI u=URI.create(issuer);valid=u.isAbsolute()&&"https".equalsIgnoreCase(u.getScheme())&&u.getHost()!=null&&u.getUserInfo()==null&&u.getRawQuery()==null&&u.getRawFragment()==null;}catch(IllegalArgumentException ignored){}MasterDataChecks.check(valid,"issuer","Provide the exact HTTPS token issuer.");
   String subject=MasterDataChecks.text(x.subject(),"subject",255),display=MasterDataChecks.text(x.displayName(),"displayName",200);MasterDataChecks.check(subject.chars().noneMatch(Character::isISOControl)&&display.chars().noneMatch(Character::isISOControl),"subject","Identity fields cannot contain control characters.");
   if(x.enabled()==null)throw LedgerFields.invalid();var scopes=scopes(x.enabled(),x.branches());
   return writes.execute(scope,"POST /customers/"+id+"/portal-access",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"issuer",issuer,"subject",subject,"display",display,"enabled",x.enabled(),"scopes",scopes)),()->{
    UUID grant=jdbc.sql("SELECT portal.create_access(:customer,:issuer,:subject,:display,:enabled,CAST(:scopes AS jsonb))").params(QuoteDrafts.map("customer",id,"issuer",issuer,"subject",subject,"display",display,"enabled",x.enabled(),"scopes",QuotePricing.value(scopes))).query(UUID.class).single();
    audit.record(scope,"portal.access_created","portal_access",grant,rid(request),QuoteDrafts.map("customerId",id,"enabled",x.enabled(),"branchCount",scopes.size()));return new IdempotentWrite.StoredResponse(201,QuotePricing.value(QuoteDrafts.map("id",grant,"version",1)));
   });
  }));
 }
 @PutMapping("/api/v1/portal-access/{id}")
 ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Update x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"portal.access.manage");return response(staff.inCompany(scope,rid(request),()->{
   body("SELECT portal.access_view(:id)::text",Map.of("id",id));long version=WarehouseDetails.version(request.getHeader("If-Match"));if(x.enabled()==null)throw LedgerFields.invalid();var scopes=scopes(x.enabled(),x.branches());
   return writes.execute(scope,"PUT /portal-access/"+id,request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version,"enabled",x.enabled(),"scopes",scopes)),()->{
    jdbc.sql("SELECT portal.update_access(:id,:version,:enabled,CAST(:scopes AS jsonb))").params(QuoteDrafts.map("id",id,"version",version,"enabled",x.enabled(),"scopes",QuotePricing.value(scopes))).query((rs,n)->0).single();audit.record(scope,"portal.access_changed","portal_access",id,rid(request),QuoteDrafts.map("Enabled",x.enabled(),"branchCount",scopes.size()));return new IdempotentWrite.StoredResponse(200,QuotePricing.value(QuoteDrafts.map("id",id,"version",version+1)));
   });
  }));
 }
 @PostMapping("/api/v1/portal/catalog/products/{id}")
 ResponseEntity<String> publish(@PathVariable UUID id,@RequestBody Publication x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return publish(id,x,null,token,request);}
 @PutMapping("/api/v1/portal/catalog/products/{id}")
 ResponseEntity<String> revise(@PathVariable UUID id,@RequestBody Publication x,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return publish(id,x,WarehouseDetails.version(request.getHeader("If-Match")),token,request);}
 private ResponseEntity<String> publish(UUID id,Publication x,Long version,Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"portal.catalog.write");return response(staff.inCompany(scope,rid(request),()->{
   if(!CrmParties.has(scope,"catalog.write")||!CrmParties.has(scope,"customers.all"))throw new StaffScope.Failure(403,"forbidden","Catalogue publication requires catalogue maintenance and company-wide customer access.");
   if(x.published()==null||x.allCustomers()==null||x.lowStockQuantity()==null)throw LedgerFields.invalid();
   MasterDataChecks.check(x.customerIds()!=null&&x.customerIds().length<=100&&Arrays.stream(x.customerIds()).allMatch(PortalManagement::nonempty)&&new HashSet<>(Arrays.asList(x.customerIds())).size()==x.customerIds().length&&(!x.allCustomers()||x.customerIds().length==0),"customerIds","Choose allCustomers or an explicit distinct audience (max 100).");
   String description=MasterDataChecks.optional(x.description(),"description",2000);if(description==null)description="";var low=x.lowStockQuantity();MasterDataChecks.check(low.signum()>=0&&low.compareTo(new BigDecimal("99999999999999.999999"))<=0&&low.stripTrailingZeros().scale()<=6,"lowStockQuantity","lowStockQuantity must be nonnegative, within the storage limit, and have at most 6 decimals.");
   MasterDataChecks.check(x.barcodes()!=null&&x.barcodes().length<=20&&Arrays.stream(x.barcodes()).allMatch(b->b!=null&&b.length()>=1&&b.length()<=80),"barcodes","Supply up to 20 barcode strings.");
   var barcodes=Arrays.stream(x.barcodes()).map(MasterDataChecks::upper).sorted().toList();MasterDataChecks.check(new HashSet<>(barcodes).size()==barcodes.size()&&barcodes.stream().allMatch(b->b.matches("[A-Z0-9._-]+")),"barcodes","Barcodes must be unique ASCII letters/digits with . _ -.");
   var customers=Arrays.stream(x.customerIds()).sorted(Comparator.comparing(UUID::toString)).toList();String text=description;
   return writes.execute(scope,request.getMethod()+" /portal/catalog/products/"+id,request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version,"published",x.published(),"allCustomers",x.allCustomers(),"description",description,"low",low,"customers",customers,"barcodes",barcodes)),()->{
    jdbc.sql("SELECT portal.publish_product(:id,CAST(:version AS bigint),:published,:all,:description,:low,CAST(:customers AS uuid[]),CAST(:barcodes AS text[]))").params(QuoteDrafts.map("id",id,"version",version,"published",x.published(),"all",x.allCustomers(),"description",text,"low",low,"customers",customers.stream().map(UUID::toString).collect(java.util.stream.Collectors.joining(",","{","}")),"barcodes",String.join(",",barcodes).transform(v->"{"+v+"}"))).query((rs,n)->0).single();
    audit.record(scope,"portal.product_published","product",id,rid(request),QuoteDrafts.map("Published",x.published(),"AllCustomers",x.allCustomers(),"customerCount",customers.size()));return new IdempotentWrite.StoredResponse(version==null?201:200,QuotePricing.value(QuoteDrafts.map("productId",id,"version",version==null?1:version+1)));
   });
  }));
 }
 private static boolean nonempty(UUID id){return id!=null&&!id.equals(new UUID(0,0));}
 private static List<Object> scopes(boolean enabled,Branch[] input){
  boolean valid=input!=null&&input.length<=20&&(!enabled||input.length>0);var seen=new HashSet<UUID>();var result=new ArrayList<Object>();
  if(valid)for(Branch b:input){if(b==null||!nonempty(b.branchId())||!seen.add(b.branchId())||b.warehouseIds()==null||b.warehouseIds().length<1||b.warehouseIds().length>20||!Arrays.stream(b.warehouseIds()).allMatch(PortalManagement::nonempty)||new HashSet<>(Arrays.asList(b.warehouseIds())).size()!=b.warehouseIds().length){valid=false;break;}}
  MasterDataChecks.check(valid,"branches","Use up to 20 distinct branches with 1..20 explicit warehouses; enabled access cannot be empty.");
  Arrays.stream(input).sorted(Comparator.comparing(b->b.branchId().toString())).forEach(b->result.add(QuoteDrafts.map("branchId",b.branchId(),"warehouseIds",Arrays.stream(b.warehouseIds()).sorted(Comparator.comparing(UUID::toString)).toList())));return result;
 }
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String cap,String sql,UUID id){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->body(sql,Map.of("id",id))));}
 private String body(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
 private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r){return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
}
