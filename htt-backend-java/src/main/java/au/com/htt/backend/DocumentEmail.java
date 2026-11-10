package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.core.env.Environment;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class DocumentEmail {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;private final String mailFrom;
 DocumentEmail(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json,Environment env){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;this.mailFrom=env.getProperty("htt.documents.mail-from","");}
 record Input(UUID pdfJobId,String[] to,String subject,String message,UUID[] attachmentIds){}
 @PostMapping("/api/v1/documents/{id}/emails")
 ResponseEntity<String> email(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.email.send");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
  var result=staff.inCompany(scope,rid,()->{
   authorize(id);long version=WarehouseDetails.version(request.getHeader("If-Match"));
   MasterDataChecks.check(input.to()!=null&&input.to().length>=1&&input.to().length<=10,"to","Supply 1..10 recipient addresses.");
   var recipientSet=new TreeSet<String>();for(String raw:input.to()){String address=ContactFields.email(raw);if(address==null)throw new StaffScope.Failure(422,"invalid_email","Recipient is required.");recipientSet.add(address.toLowerCase(Locale.ROOT));}var recipients=new ArrayList<>(recipientSet);
   String subject=MasterDataChecks.text(input.subject(),"subject",200);MasterDataChecks.check(subject.chars().noneMatch(Character::isISOControl),"subject","Subject cannot contain control characters.");
   String message=MasterDataChecks.text(input.message(),"message",10000);MasterDataChecks.check(message.chars().allMatch(c->!Character.isISOControl(c)||c==13||c==10||c==9),"message","Message contains invalid control characters.");
   var extra=input.attachmentIds()==null?new ArrayList<UUID>():new ArrayList<>(Arrays.asList(input.attachmentIds()));
   MasterDataChecks.check(extra.size()<=5&&new HashSet<>(extra).size()==extra.size()&&extra.stream().allMatch(x->x!=null&&!x.equals(new UUID(0,0))),"attachmentIds","Supply up to five distinct attachments.");extra.sort(Comparator.comparing(UUID::toString));
   return writes.execute(scope,"POST /documents/"+id+"/emails",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version,"pdfJobId",input.pdfJobId(),"recipients",recipients,"subject",subject,"message",message,"extra",extra)),()->{
    String sender=MasterDataChecks.trim(mailFrom);
    if(sender.isEmpty()||sender.length()>254||!ContactFields.address(sender))throw new StaffScope.Failure(503,"mail_not_configured","Configure the verified sender before queuing mail.");
    var d=one("SELECT number,state,version FROM platform.documents WHERE company_id=:company AND id=:id AND deleted_at IS NULL FOR SHARE",scope,Map.of("id",id));authorize(id);
    if(((Number)d.get("version")).longValue()!=version)throw new StaffScope.Failure(409,"version_conflict","Document changed; refresh before requesting output.");
    if(!(d.get("number") instanceof String)||!Set.of("CONFIRMED","POSTED").contains(d.get("state")))throw new StaffScope.Failure(409,"document_not_final","Submit/confirm the document before generating or sending its PDF.");
    var pdf=one("SELECT output_file_id FROM platform.document_jobs WHERE company_id=:company AND id=CAST(:job AS uuid) AND document_id=:doc AND source_version=:version AND kind='PDF' AND state='SUCCEEDED'",scope,QuoteDrafts.map("job",input.pdfJobId(),"doc",id,"version",version));UUID fid=(UUID)pdf.get("outputFileId");
    MasterDataChecks.check(!extra.contains(fid),"attachmentIds","The generated PDF is attached automatically.");var files=new ArrayList<UUID>();files.add(fid);files.addAll(extra);long total=0;
    for(UUID file:files){var f=one("SELECT x.size_bytes,a.kind FROM platform.file_assets a JOIN platform.files x ON x.company_id=a.company_id AND x.id=a.file_id WHERE a.company_id=:company AND a.file_id=:file AND a.document_id=:doc AND a.revoked_at IS NULL AND x.state='VERIFIED'",scope,Map.of("file",file,"doc",id));MasterDataChecks.check(file.equals(fid)||f.get("kind").equals("ATTACHMENT"),"attachmentIds","Additional files must be uploaded attachments.");total+=((Number)f.get("sizeBytes")).longValue();}
    MasterDataChecks.check(total<=15*1024*1024,"attachmentIds","Mail attachment total cannot exceed 15 MiB.");UUID job=UUID.randomUUID();String payload=json.writeValueAsString(QuoteDrafts.map("from",mailFrom,"to",recipients,"subject",subject,"text",message,"fileIds",files));
    jdbc.sql("INSERT INTO platform.document_jobs(id,company_id,document_id,source_version,kind,payload,created_by) VALUES(:id,:company,:doc,:version,'EMAIL',CAST(:payload AS jsonb),:actor)").param("id",job).param("company",scope.companyId()).param("doc",id).param("version",version).param("payload",payload).param("actor",scope.actorId()).update();
    audit.record(scope,"documents.email_requested","document_job",job,rid,QuoteDrafts.map("documentId",id,"sourceVersion",version,"pdfJobId",input.pdfJobId(),"recipientCount",recipients.size()));return new IdempotentWrite.StoredResponse(202,QuotePricing.value(QuoteDrafts.map("id",job,"documentId",id,"sourceVersion",version)));
   });
  });return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
 }
 private void authorize(UUID id){jdbc.sql("SELECT platform.require_document_access(:id,'EMAIL')").param("id",id).query((rs,n)->0).single();}
 private Map<String,Object> one(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
}
