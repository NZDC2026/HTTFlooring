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
class DocumentRetry {
 private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
 DocumentRetry(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
 record Input(String reason){}
 @PostMapping("/api/v1/document-jobs/{id}/retry")
 ResponseEntity<String> retry(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.jobs.retry");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
  var result=staff.inCompany(scope,rid,()->{
   UUID document=jdbc.sql("SELECT document_id FROM platform.document_jobs WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
   jdbc.sql("SELECT platform.require_document_access(:id,'READ')").param("id",document).query((rs,n)->0).single();
   long version=WarehouseDetails.version(request.getHeader("If-Match"));
   String reason=MasterDataChecks.text(input.reason(),"reason",1000);
   return writes.execute(scope,"POST /document-jobs/"+id+"/retry",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version,"reason",reason)),()->{
    jdbc.sql("SELECT platform.retry_document_job(:id,:version,:reason)").param("id",id).param("version",version).param("reason",reason).query((rs,n)->0).single();
    audit.record(scope,"documents.work_retried","document_job",id,rid,QuoteDrafts.map("reason",reason));
    return new IdempotentWrite.StoredResponse(202,QuotePricing.value(QuoteDrafts.map("id",id)));
   });
  });
  return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
 }
}
