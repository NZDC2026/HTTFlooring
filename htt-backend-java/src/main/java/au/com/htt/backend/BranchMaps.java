package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class BranchMaps {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final StaffAudit audit;
 BranchMaps(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;}
 @GetMapping("/api/v1/crm/branches/{branch}/navigation")
 ResponseEntity<String> navigation(@PathVariable UUID branch,@RequestParam(required=false) String provider,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"crm.maps.read");return response(staff.inCompany(scope,rid(request),()->{
   String chosen=provider==null?"GOOGLE":provider;check(Set.of("GOOGLE","APPLE").contains(chosen),"provider","Invalid provider.");guard(scope,branch,false);
   var row=query("SELECT b.id,b.version,concat_ws(', ',b.address_line1,b.suburb,b.state,b.postcode,b.country)AS address,g.latitude,g.longitude,g.source,g.place_id FROM crm.customer_branches b LEFT JOIN crm.branch_geocodes g ON g.company_id=b.company_id AND g.branch_id=b.id AND g.branch_version=b.version AND(g.expires_at IS NULL OR g.expires_at>now())WHERE b.company_id=:company AND b.id=:branch",scope,Map.of("branch",branch)).query(rows::row).single();
   if(chosen.equals("APPLE")&&"GOOGLE".equals(row.get("source")))throw new StaffScope.Failure(409,"map_provider_conflict","Use Google Maps for Google-derived coordinates.");
   boolean coordinates=row.get("latitude")!=null;String destination=coordinates?row.get("latitude")+","+row.get("longitude"):row.get("address").toString();
   String uri=(chosen.equals("GOOGLE")?"https://www.google.com/maps/dir/?api=1&destination=":"https://maps.apple.com/?daddr=")+escape(destination);
   if(chosen.equals("GOOGLE")&&row.get("placeId") instanceof String place)uri+="&destination_place_id="+escape(place);
   return stored(200,QuoteDrafts.map("branchId",branch,"branchVersion",row.get("version"),"provider",chosen,"url",uri,"usesCoordinates",coordinates));
  }));
 }
 @PutMapping("/api/v1/crm/branches/{branch}/coordinates")
 ResponseEntity<String> coordinates(@PathVariable UUID branch,@RequestBody Coordinates input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  if(input.latitude==null||input.longitude==null)throw new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"crm.maps.manage");return response(staff.inCompany(scope,rid(request),()->{
   guard(scope,branch,true);check(input.latitude.abs().compareTo(BigDecimal.valueOf(90))<=0&&input.longitude.abs().compareTo(BigDecimal.valueOf(180))<=0&&input.latitude.stripTrailingZeros().scale()<=7&&input.longitude.stripTrailingZeros().scale()<=7,"coordinates","Use valid coordinates with at most 7 decimals.");
   String reason=text(input.reason,"reason",2000);long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return writes.execute(scope,"POST /crm/collaboration/coordinates",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("branch",branch,"version",version,"latitude",input.latitude,"longitude",input.longitude,"reason",reason)),()->{
    query("SELECT crm.set_branch_coordinates(:branch,:v,:lat,:lng,:reason)",scope,Map.of("branch",branch,"v",version,"lat",input.latitude,"lng",input.longitude,"reason",reason)).query((r,n)->0).single();
    audit.record(scope,"crm.collaboration_coordinates","crm_collaboration",branch,rid(request),Map.of());return stored(200,QuoteDrafts.map("branchId",branch,"branchVersion",version,"source","MANUAL"));
   });
  }));
 }
 static String escape(String value){StringBuilder out=new StringBuilder();for(byte raw:value.getBytes(StandardCharsets.UTF_8)){int c=raw&255;if(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||"-._~".indexOf(c)>=0)out.append((char)c);else out.append('%').append("0123456789ABCDEF".charAt(c>>>4)).append("0123456789ABCDEF".charAt(c&15));}return out.toString();}
 private void guard(StaffScope.CompanyAccess scope,UUID branch,boolean write){query("SELECT crm.require_branch(:branch,:write)",scope,Map.of("branch",branch,"write",write)).query((r,n)->0).single();}
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private static IdempotentWrite.StoredResponse stored(int status,Object data){return new IdempotentWrite.StoredResponse(status,QuotePricing.value(data));}
 private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
 static final class Coordinates {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal latitude;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal longitude;public String reason;}
}
