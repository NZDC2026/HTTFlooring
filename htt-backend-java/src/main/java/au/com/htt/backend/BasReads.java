package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
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
class BasReads {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;
    BasReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;}
    @GetMapping("/api/v1/accounting/reports/gst-bas")
    ResponseEntity<String> report(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@RequestParam(required=false) String reportingMethod,@RequestParam(required=false) String calculationMethod,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);return read(scope,request,()->{
            check(start.getYear()>=2&&end.isAfter(start)&&ChronoUnit.DAYS.between(start,end)<=366,"to","Use a half-open interval of 1..366 days.");
            String reporting=reportingMethod==null?"SIMPLER":reportingMethod,calculation=calculationMethod==null?"ACCOUNTS":calculationMethod;
            check(Set.of("SIMPLER","FULL").contains(reporting),"reportingMethod","Invalid reporting method.");check(Set.of("ACCOUNTS","WORKSHEET").contains(calculation),"calculationMethod","Invalid calculation method.");check(reporting.equals("FULL")||calculation.equals("ACCOUNTS"),"calculationMethod","Worksheet requires FULL reporting.");
            var args=page(page,pageSize);args.putAll(QuoteDrafts.map("from",start,"to",end,"reporting",reporting,"calculation",calculation));return value(REPORT,scope,args);
        });
    }
    @GetMapping("/api/v1/accounting/bas-periods")
    ResponseEntity<String> list(@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->QuoteDrafts.map("items",query(LIST,scope,page(page,pageSize)).query(rows::row).list()));}
    @GetMapping("/api/v1/accounting/bas-periods/{id}")
    ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->period(scope,id));}
    @GetMapping("/api/v1/accounting/bas-periods/{id}/history")
    ResponseEntity<String> history(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{period(scope,id);var args=QuoteDrafts.map("id",id);return QuoteDrafts.map("methods",query(METHODS,scope,args).query(rows::row).list(),"snapshots",query(SNAPSHOTS,scope,args).query(rows::row).list(),"events",query(EVENTS,scope,args).query(rows::row).list());});}
    @GetMapping("/api/v1/accounting/bas-snapshots/{id}")
    ResponseEntity<String> snapshot(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{var args=page(page,pageSize);args.put("id",id);return value(SNAPSHOT,scope,args);});}
    @GetMapping("/api/v1/accounting/bas-classifications/{kind}/{id}")
    ResponseEntity<String> classification(@PathVariable String kind,@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{target(scope,kind,id);return value(CLASSIFICATION,scope,QuoteDrafts.map("kind",kind,"id",id));});}
    Map<String,Object> period(StaffScope.CompanyAccess scope,UUID id){return query(PERIOD,scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(BasReads::missing);}
    void target(StaffScope.CompanyAccess scope,String kind,UUID id){check(Set.of("TAX_CODE","EXPENSE_ACCOUNT","BILL_LINE").contains(kind),"kind","Invalid kind.");String table=kind.equals("TAX_CODE")?"accounting.tax_codes":kind.equals("EXPENSE_ACCOUNT")?"accounting.accounts":"purchase.bill_lines";String filter=kind.equals("EXPENSE_ACCOUNT")?" AND kind='EXPENSE' AND control_kind IS NULL":"";if(query("SELECT id FROM "+table+" WHERE company_id=:company AND id=:id"+filter,scope,QuoteDrafts.map("id",id)).query(UUID.class).optional().isEmpty())throw missing();}
    private Object value(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query((r,n)->json.readTree(r.getString("result"))).optional().orElseThrow(BasReads::missing);}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.bas.read");for(String cap:List.of("accounting.ledger.read","accounting.gst.read","purchase.input_gst.read"))if(!CrmParties.has(scope,cap))throw new StaffScope.Failure(403,"permission_denied","BAS, ledger and both GST reading permissions required.");return scope;}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->json.writeValueAsString(work.get())));}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private static final String PERIOD = """
SELECT p.*,k.state,k.version,k.current_snapshot_id FROM accounting.bas_effective_periods p JOIN accounting.bas_period_controls k ON k.company_id=p.company_id AND k.id=p.id WHERE p.company_id=:company AND p.id=:id
""";
    private static final String LIST = """
SELECT p.*,k.state,k.version,k.current_snapshot_id FROM accounting.bas_effective_periods p JOIN accounting.bas_period_controls k ON k.company_id=p.company_id AND k.id=p.id WHERE p.company_id=:company ORDER BY p.from_date,p.id LIMIT :size OFFSET :offset
""";
    private static final String METHODS = """
SELECT * FROM accounting.bas_method_changes WHERE company_id=:company AND period_id=:id ORDER BY version
""";
    private static final String SNAPSHOTS = """
SELECT id,revision,financial_hash,source_hash,reason,created_at,created_by FROM accounting.bas_snapshots WHERE company_id=:company AND period_id=:id ORDER BY revision
""";
    private static final String EVENTS = """
SELECT * FROM accounting.bas_period_events WHERE company_id=:company AND period_id=:id ORDER BY created_at,id
""";
    private static final String SNAPSHOT = """
SELECT jsonb_build_object('id',s.id,'periodId',s.period_id,'revision',s.revision,'financialHash',s.financial_hash,'sourceHash',s.source_hash,'report',s.report,'totalCount',(SELECT count(*) FROM accounting.bas_snapshot_items WHERE company_id=s.company_id AND snapshot_id=s.id),'items',coalesce((SELECT jsonb_agg(payload ORDER BY source_type,source_id) FROM(SELECT source_type,source_id,payload FROM accounting.bas_snapshot_items WHERE company_id=s.company_id AND snapshot_id=s.id ORDER BY source_type,source_id LIMIT :size OFFSET :offset)x),'[]'::jsonb))::text AS result FROM accounting.bas_snapshots s WHERE s.company_id=:company AND s.id=:id
""";
    private static final String CLASSIFICATION = """
SELECT jsonb_build_object('targetKind',:kind,'targetId',:id,'revision',coalesce((SELECT revision FROM accounting.bas_latest_classifications WHERE company_id=:company AND target_kind=:kind AND target_id=:id),0),'history',coalesce((SELECT jsonb_agg(to_jsonb(x)||jsonb_build_object('input_taxed_percent',x.input_taxed_percent::text) ORDER BY revision) FROM accounting.bas_classifications x WHERE company_id=:company AND target_kind=:kind AND target_id=:id),'[]'::jsonb))::text AS result
""";
    private static final String REPORT = """
WITH report AS MATERIALIZED(SELECT accounting.bas_report(:from,:to,:reporting,:calculation) AS body),sources AS MATERIALIZED(SELECT * FROM accounting.bas_report_sources(:from,:to,:reporting,:calculation)) SELECT(body||jsonb_build_object('page',:page,'pageSize',:size,'totalCount',(SELECT count(*) FROM sources),'items',coalesce((SELECT jsonb_agg(payload ORDER BY source_type,source_id) FROM(SELECT * FROM sources ORDER BY source_type,source_id LIMIT :size OFFSET :offset)x),'[]'::jsonb)))::text AS result FROM report
""";
}
