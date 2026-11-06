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
class BankRuleReads {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;
    BankRuleReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;}
    @GetMapping("/api/v1/bank-rules/{id}")
    ResponseEntity<String> rule(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->detail(scope,RULE,id));}
    @GetMapping("/api/v1/bank-rule-previews/{id}")
    ResponseEntity<String> preview(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,scope->detail(scope,PREVIEW,id));}
    @GetMapping("/api/v1/bank-rules")
    ResponseEntity<String> list(@RequestParam(required=false) String bankAccountId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        UUID bank=LedgerFields.uuid(bankAccountId);return read(token,request,scope->{var args=page(page,pageSize);args.put("bank",bank);return paged(query(LIST,scope,args).query(rows::row).list(),args);});
    }
    @GetMapping("/api/v1/bank-rules/{id}/revisions")
    ResponseEntity<String> revisions(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        return read(token,request,scope->{detail(scope,RULE,id);var args=page(page,pageSize);args.put("id",id);return paged(query(REVISIONS,scope,args).query(rows::row).list(),args);});
    }
    @GetMapping("/api/v1/bank-rule-exceptions")
    ResponseEntity<String> exceptions(@RequestParam String bankAccountId,@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String status,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@RequestParam(required=false) String includeClosed,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        UUID bank=LedgerFields.uuid(bankAccountId);LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);boolean closed=LedgerFields.bool(includeClosed);
        return read(token,request,scope->{
            check(bank!=null&&!bank.equals(new UUID(0,0))&&start.getYear()>=2&&end.isAfter(start)&&ChronoUnit.DAYS.between(start,end)<=366,"range","Bank and [from,to) range of at most 366 days required.");
            var args=page(page,pageSize);int size=(int)args.get("size");check(size<=25,"pageSize","Exception pages are limited to 25 rows.");
            if(status!=null)check(STATUSES.contains(status),"status","Invalid exception status.");
            query("SELECT accounting.require_bank_reconciliation_access('accounting.bank_statements.read',:bank),accounting.lock_bank_rules(false)",scope,QuoteDrafts.map("bank",bank)).query((r,n)->0).single();
            args.putAll(QuoteDrafts.map("bank",bank,"from",start,"to",end,"closed",closed,"status",status,"size",size+1));
            var result=query(EXCEPTIONS,scope,args).query((r,n)->json.readTree(r.getString("result"))).list();
            return QuoteDrafts.map("items",result.subList(0,Math.min(size,result.size())),"page",args.get("page"),"pageSize",size,"hasMore",result.size()>size);
        });
    }
    private static final Set<String> STATUSES=Set.of("READY","NO_RULE","AMBIGUOUS_RULE","MATCHED","PARTIALLY_MATCHED","SOURCE_ALREADY_POSTED","ACCOUNTING_PERIOD_CLOSED","BAS_FROZEN","BANK_CUTOFF","BANK_REVIEW_REQUIRED","TAX_CONFIGURATION_REQUIRED","EXISTING_CASH_MATCH","INVALID_ACTION","AMOUNT_ROUNDING","NEEDS_TAX_EVIDENCE","INVALID_TAX_EVIDENCE","STATEMENT_CLOSED");
    Object detail(StaffScope.CompanyAccess scope,String sql,UUID id){return query(sql,scope,QuoteDrafts.map("id",id)).query((r,n)->json.readTree(r.getString("result"))).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private static Object paged(Object items,Map<String,Object> args){return QuoteDrafts.map("items",items,"page",args.get("page"),"pageSize",args.get("size"));}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private ResponseEntity<String> read(Jwt token,HttpServletRequest request,java.util.function.Function<StaffScope.CompanyAccess,Object> work){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.bank_rules.read");return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->{
        query("SELECT accounting.require_bank_rules('accounting.bank_rules.read')",scope,Map.of()).query((r,n)->0).single();return json.writeValueAsString(work.apply(scope));
    }));}
    tools.jackson.databind.JsonNode ruleValue(StaffScope.CompanyAccess scope,UUID id){return (tools.jackson.databind.JsonNode)detail(scope,RULE,id);}
    tools.jackson.databind.JsonNode previewValue(StaffScope.CompanyAccess scope,UUID id){return (tools.jackson.databind.JsonNode)detail(scope,PREVIEW,id);}
    private static final String RULE = """
SELECT jsonb_build_object('id',rule_id,'version',version,'createdAt',created_at,'createdBy',created_by,'definition',definition)::text AS result FROM accounting.bank_rules WHERE company_id=:company AND rule_id=:id
""";
    private static final String PREVIEW = """
SELECT jsonb_build_object('id',p.id,'createdAt',p.created_at,'expiresAt',p.expires_at,'createdBy',p.created_by,'snapshot',p.snapshot,'taxInvoiceReference',p.tax_invoice_reference,'taxInvoiceHeldOn',p.tax_invoice_held_on,'executionId',(SELECT e.id FROM accounting.bank_rule_executions e WHERE e.company_id=p.company_id AND e.preview_id=p.id))::text AS result FROM accounting.bank_rule_previews p WHERE p.company_id=:company AND p.id=:id
""";
    private static final String LIST = """
SELECT rule_id AS id,version,name,bank_account_id,kind,priority,enabled,execution_mode,definition,created_at FROM accounting.bank_rules WHERE company_id=:company AND(CAST(:bank AS uuid) IS NULL OR bank_account_id=:bank)ORDER BY priority,rule_id LIMIT :size OFFSET :offset
""";
    private static final String REVISIONS = """
SELECT version,name,priority,enabled,execution_mode,definition,created_at,created_by FROM accounting.bank_rule_revisions WHERE company_id=:company AND rule_id=:id ORDER BY version DESC LIMIT :size OFFSET :offset
""";
    private static final String EXCEPTIONS = """
SELECT e.result::text AS result FROM accounting.bank_statement_lines l JOIN accounting.bank_statement_controls sc ON sc.company_id=l.company_id AND sc.id=l.statement_id CROSS JOIN LATERAL(SELECT accounting.evaluate_bank_rules(l.id,NULL,NULL)AS result OFFSET 0)e WHERE l.company_id=:company AND l.bank_account_id=:bank AND l.transaction_date>=:from AND l.transaction_date<:to AND(:closed OR sc.state='OPEN')AND(CAST(:status AS text) IS NULL AND e.result->>'status'NOT IN('READY','MATCHED')OR e.result->>'status'=:status)ORDER BY l.transaction_date,l.id LIMIT :size OFFSET :offset
""";
}
