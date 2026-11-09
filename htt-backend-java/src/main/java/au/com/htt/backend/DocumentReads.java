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
class DocumentReads {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;
 DocumentReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows){this.staff=staff;this.jdbc=jdbc;this.rows=rows;}
 @GetMapping("/api/v1/documents/{id}/files")
 ResponseEntity<String> files(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return read(scope,request,()->{authorize(id);var args=page(page,pageSize);var items=query("SELECT f.id,f.content_type,f.size_bytes,f.sha256,f.state,f.version,a.filename,a.kind,a.source_version,f.created_at FROM platform.file_assets a JOIN platform.files f ON f.company_id=a.company_id AND f.id=a.file_id WHERE a.company_id=:company AND a.document_id=:id AND a.revoked_at IS NULL ORDER BY f.created_at DESC,f.id LIMIT :size OFFSET :offset",scope,QuoteDrafts.map("id",id,"size",args[1],"offset",args[2])).query(rows::row).list();return QuoteDrafts.map("items",items,"page",args[0],"pageSize",args[1]);});
 }
 @GetMapping("/api/v1/documents/{id}/jobs")
 ResponseEntity<String> jobs(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return read(scope,request,()->{authorize(id);var args=page(page,pageSize);var items=query(JOBS+" WHERE company_id=:company AND document_id=:id ORDER BY created_at DESC,id LIMIT :size OFFSET :offset",scope,QuoteDrafts.map("id",id,"size",args[1],"offset",args[2])).query(rows::row).list();return QuoteDrafts.map("items",items,"page",args[0],"pageSize",args[1]);});
 }
 @GetMapping("/api/v1/document-jobs/{id}")
 ResponseEntity<String> job(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=access(token,request);return read(scope,request,()->{var row=query(JOBS+" WHERE company_id=:company AND id=:id",scope,Map.of("id",id)).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));authorize((UUID)row.get("documentId"));return row;});
 }
 private static int[] page(String page,String size){Integer p=LedgerFields.integer(page),s=LedgerFields.integer(size);int number=p==null?1:p,count=s==null?25:s;check(number>=1&&number<=100000&&count>=1&&count<=100,"page","page must be 1..100000 and pageSize 1..100.");return new int[]{number,count,(number-1)*count};}
 private void authorize(UUID id){jdbc.sql("SELECT platform.require_document_access(:id,'READ')").param("id",id).query((r,n)->0).single();}
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){return staff.require(token,request.getHeader("X-Company-Id"),"documents.files.read");}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(QuotePricing.value(body.get())));}
 private static final String JOBS="SELECT id,document_id,source_version,kind,state,attempts,total_attempts,available_at,output_file_id,provider_id,last_error,completed_at,created_at,version FROM platform.document_jobs";
}
