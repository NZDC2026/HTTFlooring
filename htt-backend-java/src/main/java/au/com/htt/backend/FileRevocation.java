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
class FileRevocation {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 FileRevocation(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 @PostMapping("/api/v1/files/{id}/revoke")
 ResponseEntity<String> revoke(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.attachments.write");var result=staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->{
   UUID document=jdbc.sql("SELECT document_id FROM platform.file_assets WHERE company_id=:company AND file_id=:id").param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
   jdbc.sql("SELECT platform.require_document_access(:id,'UPLOAD')").param("id",document).query((r,n)->0).single();
   long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return writes.execute(scope,"POST /files/"+id+"/revoke",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version)),()->{
    jdbc.sql("SELECT platform.revoke_attachment(:id,:version)").param("id",id).param("version",version).query((r,n)->0).single();
    audit.record(scope,"documents.attachment_revoked","file",id,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),Map.of());return new IdempotentWrite.StoredResponse(200,QuotePricing.value(QuoteDrafts.map("id",id)));
   });
  });
  return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
 }
}
