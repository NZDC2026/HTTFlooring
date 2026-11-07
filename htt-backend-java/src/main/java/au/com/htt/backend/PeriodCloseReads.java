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
class PeriodCloseReads {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;
    PeriodCloseReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;}
    @GetMapping("/api/v1/accounting/fiscal-years")
    ResponseEntity<String> years(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->QuoteDrafts.map("items",query(YEARS,scope,Map.of()).query(rows::row).list()));}
    @GetMapping("/api/v1/accounting/periods")
    ResponseEntity<String> periods(@RequestParam(required=false) String fiscalYearId,@AuthenticationPrincipal Jwt token,HttpServletRequest request){UUID year=LedgerFields.uuid(fiscalYearId);return read(token,request,scope->QuoteDrafts.map("items",query(PERIODS,scope,QuoteDrafts.map("year",year)).query(rows::row).list()));}
    @GetMapping("/api/v1/accounting/periods/{id}/preflight")
    ResponseEntity<String> periodPlan(@PathVariable UUID id,@RequestParam(required=false) String basNotApplicableConfirmed,@AuthenticationPrincipal Jwt token,HttpServletRequest request){boolean na=LedgerFields.bool(basNotApplicableConfirmed);return read(token,request,scope->value(PERIOD_PLAN,scope,QuoteDrafts.map("id",id,"na",na)));}
    @GetMapping("/api/v1/accounting/fiscal-years/{id}/preflight")
    ResponseEntity<String> yearPlan(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->value(YEAR_PLAN,scope,QuoteDrafts.map("id",id)));}
    @GetMapping("/api/v1/accounting/periods/{id}/history")
    ResponseEntity<String> periodHistory(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->{period(scope,id);var args=QuoteDrafts.map("id",id);return QuoteDrafts.map("snapshots",query(SNAPSHOT_LIST,scope,args).query(rows::row).list(),"events",query(EVENTS,scope,args).query(rows::row).list());});}
    @GetMapping("/api/v1/accounting/period-close-snapshots/{id}")
    ResponseEntity<String> snapshot(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->value(SNAPSHOT,scope,QuoteDrafts.map("id",id)));}
    @GetMapping("/api/v1/accounting/fiscal-years/{id}/history")
    ResponseEntity<String> yearHistory(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->{year(scope,id);return value(YEAR_HISTORY,scope,QuoteDrafts.map("id",id));});}
    @GetMapping("/api/v1/accounting/retained-earnings")
    ResponseEntity<String> retained(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->value(RETAINED,scope,Map.of()));}
    Map<String,Object> period(StaffScope.CompanyAccess scope,UUID id){return query(PERIOD,scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(PeriodCloseReads::missing);}
    Map<String,Object> year(StaffScope.CompanyAccess scope,UUID id){return query(YEAR,scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(PeriodCloseReads::missing);}
    private Object value(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query((r,n)->json.readTree(r.getString("result"))).optional().orElseThrow(PeriodCloseReads::missing);}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private ResponseEntity<String> read(Jwt token,HttpServletRequest request,java.util.function.Function<StaffScope.CompanyAccess,Object> work){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.periods.read");for(String cap:List.of("accounting.bas.read","accounting.ledger.read","accounting.gst.read","purchase.input_gst.read","accounting.reconciliation.read"))if(!CrmParties.has(scope,cap))throw new StaffScope.Failure(403,"permission_denied","Accounting close requires period, reconciliation, ledger, BAS and GST read permissions.");return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->json.writeValueAsString(work.apply(scope))));}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final String PERIOD = """
SELECT * FROM accounting.periods WHERE company_id=:company AND id=:id
""";
    private static final String YEAR = """
SELECT y.*,k.state,k.version,k.current_closing_id FROM accounting.fiscal_years y JOIN accounting.fiscal_year_controls k USING(company_id,id) WHERE y.company_id=:company AND y.id=:id
""";
    private static final String YEARS = """
SELECT y.*,k.state,k.version,k.current_closing_id FROM accounting.fiscal_years y JOIN accounting.fiscal_year_controls k USING(company_id,id) WHERE y.company_id=:company ORDER BY starts_on,id
""";
    private static final String PERIODS = """
SELECT * FROM accounting.periods WHERE company_id=:company AND(CAST(:year AS uuid) IS NULL OR fiscal_year_id=:year)ORDER BY starts_on,id
""";
    private static final String PERIOD_PLAN = """
SELECT accounting.period_preflight(:id,:na)::text AS result
""";
    private static final String YEAR_PLAN = """
SELECT accounting.year_close_plan(:id)::text AS result
""";
    private static final String SNAPSHOT_LIST = """
SELECT id,revision,financial_hash,reference,reason,created_at,created_by FROM accounting.period_close_snapshots WHERE company_id=:company AND period_id=:id ORDER BY revision
""";
    private static final String EVENTS = """
SELECT * FROM accounting.period_close_events WHERE company_id=:company AND period_id=:id ORDER BY period_version
""";
    private static final String SNAPSHOT = """
SELECT(to_jsonb(x))::text AS result FROM accounting.period_close_snapshots x WHERE company_id=:company AND id=:id
""";
    private static final String YEAR_HISTORY = """
SELECT jsonb_build_object('closings',coalesce((SELECT jsonb_agg(to_jsonb(x)||jsonb_build_object('profit',x.profit::text)ORDER BY revision) FROM accounting.year_end_closings x WHERE company_id=:company AND fiscal_year_id=:id),'[]'::jsonb),'reversals',coalesce((SELECT jsonb_agg(to_jsonb(r)ORDER BY r.created_at,r.id) FROM accounting.year_end_reversals r JOIN accounting.year_end_closings c ON c.company_id=r.company_id AND c.id=r.closing_id WHERE c.company_id=:company AND c.fiscal_year_id=:id),'[]'::jsonb))::text AS result
""";
    private static final String RETAINED = """
SELECT jsonb_build_object('accountId',(SELECT account_id FROM accounting.account_mappings WHERE company_id=:company AND purpose='RETAINED_EARNINGS'),'version',coalesce((SELECT version FROM accounting.account_mappings WHERE company_id=:company AND purpose='RETAINED_EARNINGS'),0))::text AS result
""";
}
