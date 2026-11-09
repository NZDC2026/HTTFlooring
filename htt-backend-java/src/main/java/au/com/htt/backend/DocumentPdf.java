package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class DocumentPdf {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
 DocumentPdf(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;}
 @PostMapping("/api/v1/documents/{id}/pdf")
 ResponseEntity<String> request(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"documents.pdf.request");var result=staff.inCompany(scope,rid(request),()->{
   authorize(id);long version=WarehouseDetails.version(request.getHeader("If-Match"));
   return writes.execute(scope,"POST /documents/"+id+"/pdf",request.getHeader("Idempotency-Key"),QuotePricing.value(QuoteDrafts.map("id",id,"version",version)),()->{
    var d=one("SELECT id,document_type,number,business_date::text,state,version FROM platform.documents WHERE company_id=:company AND id=:id AND deleted_at IS NULL FOR SHARE",scope,Map.of("id",id));
    authorize(id);
    if(((Number)d.get("version")).longValue()!=version)throw new StaffScope.Failure(409,"version_conflict","Document changed; refresh before requesting output.");
    if(!(d.get("number") instanceof String)||!Set.of("CONFIRMED","POSTED").contains(d.get("state")))throw new StaffScope.Failure(409,"document_not_final","Submit/confirm the document before generating or sending its PDF.");
    String payload=json.writeValueAsString(snapshot(scope,id,d));
    var inserted=query("INSERT INTO platform.document_jobs(company_id,document_id,source_version,kind,payload,created_by) VALUES(:company,:doc,:version,'PDF',CAST(:payload AS jsonb),:actor) ON CONFLICT(company_id,document_id,source_version) WHERE kind='PDF' DO NOTHING RETURNING id",scope,Map.of("doc",id,"version",version,"payload",payload,"actor",scope.actorId())).query(UUID.class).optional();
    UUID job=inserted.orElseGet(()->query("SELECT id FROM platform.document_jobs WHERE company_id=:company AND document_id=:doc AND source_version=:version AND kind='PDF'",scope,Map.of("doc",id,"version",version)).query(UUID.class).single());
    if(inserted.isPresent())audit.record(scope,"documents.pdf_requested","document_job",job,rid(request),QuoteDrafts.map("documentId",id,"sourceVersion",version));
    return new IdempotentWrite.StoredResponse(202,QuotePricing.value(QuoteDrafts.map("id",job,"documentId",id,"sourceVersion",version)));
   });
  });
  return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
 }
 private Object snapshot(StaffScope.CompanyAccess scope,UUID id,Map<String,Object> d){
  String kind=d.get("documentType").toString();var args=Map.of("id",id);
  if(kind.equals("REPORT_PACK"))return json.readTree(query(PACK,scope,args).query(String.class).single());
  if(kind.equals("CUSTOMER_STATEMENT"))return json.readTree(query(STATEMENT,scope,args).query(String.class).single());
  String issuer=query(ISSUER,scope,Map.of()).query(String.class).single();
  Map<String,Object> head;List<Map<String,Object>> lines;String title;
  if(kind.equals("QUOTE")){head=one(QUOTE_HEAD,scope,args);lines=query(QUOTE_LINES,scope,args).query(rows::row).list();title="QUOTATION";}
  else if(kind.equals("INVOICE")){head=one(INVOICE_HEAD,scope,args);issuer=head.get("issuer").toString();lines=query(INVOICE_LINES,scope,args).query(rows::row).list();title=head.get("title").equals("TAX_INVOICE")?"TAX INVOICE":"INVOICE";}
  else{head=one(ORDER_HEAD,scope,args);lines=query(ORDER_LINES,scope,args).query(rows::row).list();title="PURCHASE ORDER";}
  String number=d.get("number").toString();StringBuilder safe=new StringBuilder();for(int i=0;i<number.length()&&i<100;i++){char c=number.charAt(i);safe.append(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||c=='-'||c=='_'?c:'_');}
  var items=new ArrayList<Object>();
  for(var line:lines)items.add(QuoteDrafts.map("snapshot",json.readTree(line.get("snapshot").toString()),"quantity",line.get("quantity"),"unitPrice",line.get("unitPrice"),"net",line.get("net"),"tax",line.get("tax"),"gross",line.get("gross"),"taxRate",line.get("taxRate")));
  return QuoteDrafts.map("templateVersion",1,"filename",safe+"-v"+d.get("version")+".pdf","title",title,"number",number,"sourceVersion",d.get("version"),"businessDate",d.get("businessDate"),"term",head.get("term"),"termLabel",kind.equals("QUOTE")?"Valid until":kind.equals("INVOICE")?"Due date":"Expected delivery","currency","AUD","issuer",json.readTree(issuer),"party",json.readTree(head.get("party").toString()),"notes",head.get("notes"),"net",head.get("net"),"tax",head.get("tax"),"gross",head.get("gross"),"lines",items);
 }
 private void authorize(UUID id){jdbc.sql("SELECT platform.require_document_access(:id,'PDF')").param("id",id).query((r,n)->0).single();}
 private Map<String,Object> one(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
 private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 private static final String PACK = """
SELECT ((p->'snapshot')||jsonb_build_object('snapshotHash',p->>'sha256'))::text AS result FROM(SELECT reporting.pack_view(:id)p)v
""";
 private static final String STATEMENT = """
SELECT snapshot::text AS result FROM accounting.customer_statements WHERE company_id=:company AND id=:id
""";
 private static final String ISSUER = """
SELECT jsonb_build_object('name',name,'abn',abn,'country',country,'currency',base_currency,'gstRegistered',gst_registered)::text AS issuer FROM core.companies WHERE id=:company
""";
 private static final String QUOTE_HEAD = """
SELECT customer_snapshot::text AS party,notes,net,tax,gross,expires_on::text AS term FROM sales.quotes WHERE company_id=:company AND id=:id
""";
 private static final String QUOTE_LINES = """
SELECT l.snapshot::text AS snapshot,l.quantity,l.unit_price,l.net,l.tax,l.gross,l.tax_rate FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=:company AND l.quote_id=:id ORDER BY dl.line_no
""";
 private static final String INVOICE_HEAD = """
SELECT issuer_snapshot::text AS issuer,customer_snapshot::text AS party,''::text AS notes,net,tax,gross,due_on::text AS term,title FROM sales.invoices WHERE company_id=:company AND id=:id
""";
 private static final String INVOICE_LINES = """
SELECT l.snapshot::text AS snapshot,l.quantity,(l.snapshot->>'unitPrice')::numeric AS unit_price,l.net,l.tax,l.gross,l.tax_rate FROM sales.invoice_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=:company AND l.invoice_id=:id ORDER BY dl.line_no
""";
 private static final String ORDER_HEAD = """
SELECT supplier_snapshot::text AS party,notes,net,tax,gross,expected_on::text AS term FROM purchase.orders WHERE company_id=:company AND id=:id
""";
 private static final String ORDER_LINES = """
SELECT l.snapshot::text AS snapshot,l.quantity,l.unit_cost AS unit_price,l.net,l.tax,l.gross,l.tax_rate FROM purchase.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=:company AND l.order_id=:id ORDER BY dl.line_no
""";
}
