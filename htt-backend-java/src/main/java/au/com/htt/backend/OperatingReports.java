package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
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
class OperatingReports {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    OperatingReports(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/customers/{id}/statement-preview")
    ResponseEntity<String> preview(@PathVariable UUID id,@RequestParam String from,@RequestParam String to,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.statements.read");LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);return read(scope,request,()->{range(start,end);return value("SELECT accounting.statement_snapshot(:id,:from,:to)::text",scope,QuoteDrafts.map("id",id,"from",start,"to",end));});
    }
    @GetMapping("/api/v1/customer-statements/{id}")
    ResponseEntity<String> statement(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.statements.read");return read(scope,request,()->statement(scope,id));}
    @GetMapping("/api/v1/customers/{id}/statements")
    ResponseEntity<String> statements(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.statements.read");return read(scope,request,()->{customer(scope,id);var args=page(page,pageSize);args.put("id",id);return paged(query("SELECT id,from_date,to_date,sha256,created_at,created_by FROM accounting.customer_statements WHERE company_id=:company AND customer_id=:id ORDER BY created_at DESC,id LIMIT :size OFFSET :offset",scope,args).query(rows::row).list(),args);});
    }
    @PostMapping("/api/v1/customers/{id}/statements")
    ResponseEntity<String> captureStatement(@PathVariable UUID id,@RequestBody Dates input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.statements.read");return response(staff.inCompany(scope,rid(request),()->{range(input.from,input.to);customer(scope,id);
            return writes.execute(scope,"POST /customers/"+id+"/statements",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"x",QuoteDrafts.map("from",input.from,"to",input.to))),()->{
                UUID result=query("SELECT accounting.capture_statement(:id,:from,:to)",scope,QuoteDrafts.map("id",id,"from",input.from,"to",input.to)).query(UUID.class).single();audit.record(scope,"accounting.statement_captured","customer_statement",result,rid(request),Map.of());return stored(201,statement(scope,result));
            });
        }));
    }
    @GetMapping("/api/v1/accounting/reports/operating")
    ResponseEntity<String> live(@RequestParam String kind,@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String partyId,@RequestParam(required=false) String warehouseId,@RequestParam(required=false) String bankAccountId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.operating.read");LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);UUID party=LedgerFields.uuid(partyId),warehouse=LedgerFields.uuid(warehouseId),bank=LedgerFields.uuid(bankAccountId);
        return read(scope,request,()->{var args=validate(kind,start,end,party,warehouse,bank);args.putAll(page(page,pageSize));return value(LIVE,scope,args);});
    }
    @GetMapping("/api/v1/operating-report-runs")
    ResponseEntity<String> runs(@RequestParam String kind,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.operating.read");return read(scope,request,()->{kind(kind);requireReport(scope,kind);var args=page(page,pageSize);args.put("kind",kind);return paged(query("SELECT id,kind,from_date,to_date,sha256,created_at,created_by FROM accounting.operating_report_runs WHERE company_id=:company AND kind=:kind ORDER BY created_at DESC,id LIMIT :size OFFSET :offset",scope,args).query(rows::row).list(),args);});
    }
    @GetMapping("/api/v1/operating-report-runs/{id}")
    ResponseEntity<String> frozen(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"reports.operating.read");return read(scope,request,()->{var row=run(scope,id);return QuoteDrafts.map("id",id,"version",row.get("version"),"kind",row.get("kind"),"snapshot",row.get("snapshot"),"sha256",row.get("sha256"),"createdAt",row.get("createdAt"));});}
    @PostMapping("/api/v1/operating-report-runs")
    ResponseEntity<String> capture(@RequestBody Report input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.operating.read");return response(staff.inCompany(scope,rid(request),()->{
            var args=validate(input.kind,input.from,input.to,input.partyId,input.warehouseId,input.bankAccountId);requireReport(scope,input.kind);
            var x=QuoteDrafts.map("kind",input.kind,"from",input.from,"to",input.to,"partyId",input.partyId,"warehouseId",input.warehouseId,"bankAccountId",input.bankAccountId);
            return writes.execute(scope,"POST /operating-report-runs",request.getHeader("Idempotency-Key"),QuotePricing.canonical(x),()->{
                UUID id=query("SELECT accounting.capture_operating_report(:kind,:from,:to,CAST(:party AS uuid),CAST(:warehouse AS uuid),CAST(:bank AS uuid))",scope,args).query(UUID.class).single();
                audit.record(scope,"reports.operating_captured","operating_report",id,rid(request),Map.of());var row=run(scope,id);return stored(201,QuoteDrafts.map("id",id,"version",row.get("version"),"sha256",row.get("sha256"),"snapshot",row.get("snapshot")));
            });
        }));
    }
    @PostMapping("/api/v1/operating-report-runs/{id}/export")
    ResponseEntity<String> export(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.operating.export");return response(staff.inCompany(scope,rid(request),()->{
            run(scope,id);authorize(scope,id,"EXPORT");long version=WarehouseDetails.version(request.getHeader("If-Match"));
            return writes.execute(scope,"POST /operating-report-runs/"+id+"/export",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version)),()->{
                check(version==1,"version","Frozen report version is 1.");Object payload=value("SELECT accounting.report_export_payload(:id)::text",scope,QuoteDrafts.map("id",id));
                var args=QuoteDrafts.map("id",id,"payload",json.writeValueAsString(payload),"actor",scope.actorId());
                var created=query("INSERT INTO platform.document_jobs(company_id,document_id,source_version,kind,payload,created_by)VALUES(:company,:id,1,'EXPORT',CAST(:payload AS jsonb),:actor)ON CONFLICT(company_id,document_id,source_version)WHERE kind='EXPORT'DO NOTHING RETURNING id",scope,args).query(UUID.class).optional();
                UUID job=created.orElseGet(()->query("SELECT id FROM platform.document_jobs WHERE company_id=:company AND document_id=:id AND source_version=1 AND kind='EXPORT'",scope,QuoteDrafts.map("id",id)).query(UUID.class).single());
                if(created.isPresent())audit.record(scope,"reports.export_requested","document_job",job,rid(request),QuoteDrafts.map("reportId",id));return stored(202,QuoteDrafts.map("id",job,"documentId",id,"sourceVersion",1));
            });
        }));
    }
    private Object statement(StaffScope.CompanyAccess scope,UUID id){var row=query("SELECT id,customer_id,snapshot,sha256,created_at FROM accounting.customer_statements WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(OperatingReports::missing);authorize(scope,id,"READ");return QuoteDrafts.map("id",id,"version",1,"customerId",row.get("customerId"),"snapshot",row.get("snapshot"),"sha256",row.get("sha256"),"createdAt",row.get("createdAt"));}
    private Map<String,Object> run(StaffScope.CompanyAccess scope,UUID id){var row=query("SELECT r.*,d.version FROM accounting.operating_report_runs r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=:company AND r.id=:id",scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(OperatingReports::missing);requireReport(scope,(String)row.get("kind"));return row;}
    private void customer(StaffScope.CompanyAccess scope,UUID id){query("SELECT accounting.require_statement_customer(:id)",scope,QuoteDrafts.map("id",id)).query((r,n)->0).single();}
    private void authorize(StaffScope.CompanyAccess scope,UUID id,String action){query("SELECT platform.require_document_access(:id,:action)",scope,QuoteDrafts.map("id",id,"action",action)).query((r,n)->0).single();}
    private void requireReport(StaffScope.CompanyAccess scope,String kind){query("SELECT accounting.require_operating_report(:kind)",scope,QuoteDrafts.map("kind",kind)).query((r,n)->0).single();}
    private static Map<String,Object> validate(String kind,LocalDate from,LocalDate to,UUID party,UUID warehouse,UUID bank){range(from,to);kind(kind);check((party==null||Set.of("PURCHASING","ARAP").contains(kind))&&(warehouse==null||kind.equals("INVENTORY"))&&(bank==null||kind.equals("BANKING")),"filters","A filter is only accepted by its report family.");return QuoteDrafts.map("kind",kind,"from",from,"to",to,"party",party,"warehouse",warehouse,"bank",bank);}
    private static void kind(String kind){check(kind!=null&&Set.of("PURCHASING","ARAP","INVENTORY","BANKING","SALES").contains(kind),"kind","Invalid kind.");}
    private static void range(LocalDate from,LocalDate to){check(from.getYear()>=2&&to.isAfter(from)&&ChronoUnit.DAYS.between(from,to)<=366,"range","Use a half-open interval of 1..366 days.");}
    private Object value(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query((r,n)->json.readTree(r.getString(1))).optional().orElseThrow(OperatingReports::missing);}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private static Object paged(Object items,Map<String,Object> args){return QuoteDrafts.map("items",items,"page",args.get("page"),"pageSize",args.get("size"));}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static class Dates {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate from=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate to=LocalDate.of(1,1,1);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Report extends Dates {public String kind;public UUID partyId;public UUID warehouseId;public UUID bankAccountId;}
    private static final String LIVE = """
WITH report AS MATERIALIZED(SELECT accounting.operating_report(:kind,:from,:to,CAST(:party AS uuid),CAST(:warehouse AS uuid),CAST(:bank AS uuid))AS body)SELECT(body-'rows'||jsonb_build_object('totalCount',jsonb_array_length(body->'rows'),'page',:page,'pageSize',:size,'rows',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body->'rows')WITH ORDINALITY z(e,n)WHERE n>:offset AND n<=:offset+:size),'[]'::jsonb)))::text AS result FROM report
""";
}
