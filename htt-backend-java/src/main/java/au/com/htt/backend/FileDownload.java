package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class FileDownload {
 private final StaffScope staff;private final JdbcClient jdbc;
 FileDownload(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/files/{id}/content")
 ResponseEntity<byte[]> content(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.files.read");
  return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->{
   var asset=jdbc.sql("SELECT a.document_id,a.filename,f.content_type FROM platform.file_assets a JOIN platform.files f ON f.company_id=a.company_id AND f.id=a.file_id WHERE a.company_id=:company AND a.file_id=:id AND a.revoked_at IS NULL").param("company",scope.companyId()).param("id",id).query((r,n)->new Asset((UUID)r.getObject(1),r.getString(2),r.getString(3))).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
   jdbc.sql("SELECT platform.require_document_access(:id,'READ')").param("id",asset.documentId()).query((r,n)->0).single();
   byte[] body=jdbc.sql("SELECT platform.read_private_file(:id)").param("id",id).query(byte[].class).single();
   return ResponseEntity.ok().contentType(MediaType.parseMediaType(asset.type())).contentLength(body.length).header("Content-Security-Policy","sandbox; default-src 'none'").header("Content-Disposition",disposition(asset.filename())).body(body);
  });
 }
 private record Asset(UUID documentId,String filename,String type){}
 private static boolean token(int c){return c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||c==96||"!#$%&'*+-.^_|~".indexOf(c)>=0;}
 static String disposition(String filename){
  StringBuilder ascii=new StringBuilder();for(char c:filename.toCharArray())ascii.append(c<32||c>126?'_':c);
  String fallback=ascii.toString();if(fallback.isEmpty()||!fallback.chars().allMatch(FileDownload::token))fallback=String.valueOf((char)34)+fallback+String.valueOf((char)34);
  StringBuilder encoded=new StringBuilder();
  for(byte raw:filename.getBytes(StandardCharsets.UTF_8)){int c=raw&255;if(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||c==96||"!#$&+-.^_|~".indexOf(c)>=0)encoded.append((char)c);else encoded.append('%').append("0123456789ABCDEF".charAt(c>>>4)).append("0123456789ABCDEF".charAt(c&15));}
  return "attachment; filename="+fallback+"; filename*=UTF-8''"+encoded;
 }
}
