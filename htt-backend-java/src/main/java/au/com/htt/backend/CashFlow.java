package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class CashFlow {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    CashFlow(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/accounting/reports/cash-flow")
    ResponseEntity<String> report(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.reports.read");LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);return read(scope,request,()->{LedgerReads.dates(start,end);var args=page(page,pageSize);args.putAll(QuoteDrafts.map("from",start,"to",end));return json.readTree(query(REPORT,scope,args).query(String.class).single());});
    }
    @GetMapping("/api/v1/accounting/cash-flow/scopes")
    ResponseEntity<String> scopes(@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.reports.read");return read(scope,request,()->QuoteDrafts.map("items",query(SCOPES,scope,Map.of()).query(rows::row).list()));}
    @GetMapping("/api/v1/accounting/cash-flow/journals/{id}")
    ResponseEntity<String> journal(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.reports.read");return read(scope,request,()->{journalExists(scope,id);return detail(scope,id);});}
    @PutMapping("/api/v1/accounting/cash-flow/scopes/{id}")
    ResponseEntity<String> configure(@PathVariable UUID id,@RequestBody ScopeInput input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.cash_flow.configure");return response(staff.inCompany(scope,rid(request),()->{
            scope(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));String reason=text(input.reason,"reason",2000);check(input.included!=null,"included","Explicit scope choice required.");
            return writes.execute(scope,"PUT /accounting/cash-flow/scopes/"+id,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"included",input.included,"reason",reason)),()->{
                query("SELECT accounting.configure_cash_scope(:id,:version,:included,:reason)",scope,QuoteDrafts.map("id",id,"version",version,"included",input.included,"reason",reason)).query((r,n)->0).single();
                audit.record(scope,"accounting.cash_scope_changed","bank_account",id,rid(request),QuoteDrafts.map("Included",input.included,"reason",reason));return stored(200,scope(scope,id));
            });
        }));
    }
    @PutMapping("/api/v1/accounting/cash-flow/journals/{id}/classification")
    ResponseEntity<String> classify(@PathVariable UUID id,@RequestBody Classification input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.cash_flow.classify");return response(staff.inCompany(scope,rid(request),()->{
            journalExists(scope,id);long version=version(request.getHeader("If-Match"));check(input.mode!=null&&Set.of("AUTO","CUSTOM").contains(input.mode),"mode","Invalid mode.");String reason=text(input.reason,"reason",2000);
            var raw=input.allocations==null?List.<Allocation>of():input.allocations;check(raw.size()<=100&&(input.mode.equals("AUTO")?raw.isEmpty():!raw.isEmpty())&&raw.stream().allMatch(x->x!=null&&!x.journalLineId.equals(ZERO)),"allocations","Supply bounded cash allocations; AUTO requires none.");
            var sorted=new ArrayList<>(raw);var distinct=new HashSet<String>();
            for(var line:sorted){check(line.category!=null&&Set.of("OPERATING","INVESTING","FINANCING","INTERNAL").contains(line.category),"category","Invalid category.");SupplierBills.amount(line.amount,"amount",2,"999999999999999999.99");check(line.amount.signum()>0,"amount","Positive AUD cents required.");check(distinct.add(line.journalLineId+":"+line.category),"allocations","Duplicate cash-line/category pair.");}
            sorted.sort(Comparator.comparing((Allocation x)->x.journalLineId.toString()).thenComparing(x->x.category));var items=sorted.stream().map(x->QuoteDrafts.map("journalLineId",x.journalLineId,"category",x.category,"amount",x.amount)).toList();
            return writes.execute(scope,"PUT /accounting/cash-flow/journals/"+id+"/classification",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"mode",input.mode,"reason",reason,"items",items)),()->{
                UUID cid=query("SELECT accounting.classify_cash_flow(:id,:version,:mode,:reason,CAST(:items AS jsonb))",scope,QuoteDrafts.map("id",id,"version",version,"mode",input.mode,"reason",reason,"items",QuotePricing.value(items))).query(UUID.class).single();
                audit.record(scope,"accounting.cash_flow_classified","cash_flow_classification",cid,rid(request),QuoteDrafts.map("journalId",id,"mode",input.mode,"reason",reason));return stored(200,QuoteDrafts.map("id",cid,"revision",version+1));
            });
        }));
    }
    private Map<String,Object> scope(StaffScope.CompanyAccess scope,UUID id){return query(SCOPE,scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(CashFlow::missing);}
    private void journalExists(StaffScope.CompanyAccess scope,UUID id){if(query("SELECT id FROM accounting.cash_flow_lines WHERE company_id=:company AND journal_entry_id=:id LIMIT 1",scope,QuoteDrafts.map("id",id)).query(UUID.class).optional().isEmpty())throw missing();}
    private Object detail(StaffScope.CompanyAccess scope,UUID id){return json.readTree(query(DETAIL,scope,QuoteDrafts.map("id",id)).query(String.class).single());}
    private static long version(String header){try{String value=MasterDataChecks.trim((header==null?"":header).replaceAll("^\\\"+|\\\"+$",""));if(!value.matches("[+-]?[0-9]+"))throw new NumberFormatException();long parsed=Long.parseLong(value);if(parsed<0)throw new NumberFormatException();return parsed;}catch(NumberFormatException error){throw new StaffScope.Failure(428,"version_required","Current If-Match required (zero for an unclassified journal).");}}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);for(String read:List.of("accounting.reports.read","accounting.ledger.read","accounting.banks.read"))if(!CrmParties.has(scope,read))throw new StaffScope.Failure(403,"permission_denied","Reports, ledger and bank reading permissions required.");return scope;}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class ScopeInput {public Boolean included;public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Classification {public String mode;public String reason;public List<Allocation> allocations;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Allocation {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID journalLineId=ZERO;public String category;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;}
    private static final String DETAIL = """
SELECT jsonb_build_object('journalId',:id,'revision',coalesce((SELECT revision FROM accounting.cash_flow_latest WHERE company_id=:company AND journal_entry_id=:id),0),'lines',coalesce((SELECT jsonb_agg(jsonb_build_object('journalLineId',l.id,'bankAccountId',l.bank_account_id,'postingDate',l.posting_date,'sourceDocumentId',l.source_document_id,'postingKind',l.posting_kind,'signedAmount',l.signed_amount::text,'isReversal',l.is_reversal,'allocations',(SELECT jsonb_agg(jsonb_build_object('category',e.category,'amount',e.amount::text,'signedAmount',e.signed_amount::text,'basis',e.basis,'sourceRevision',e.revision)ORDER BY e.category) FROM accounting.cash_flow_effective e WHERE e.company_id=l.company_id AND e.journal_line_id=l.id))ORDER BY l.id) FROM accounting.cash_flow_lines l WHERE l.company_id=:company AND l.journal_entry_id=:id),'[]'::jsonb),'history',coalesce((SELECT jsonb_agg(jsonb_build_object('id',c.id,'revision',c.revision,'mode',c.mode,'reason',c.reason,'createdAt',c.created_at,'allocations',(SELECT jsonb_agg(jsonb_build_object('journalLineId',a.journal_line_id,'category',a.category,'amount',a.amount::text)ORDER BY a.journal_line_id,a.category) FROM accounting.cash_flow_allocations a WHERE a.company_id=c.company_id AND a.classification_id=c.id))ORDER BY c.revision) FROM accounting.cash_flow_classifications c WHERE c.company_id=:company AND c.journal_entry_id=:id),'[]'::jsonb))::text AS result
""";
    private static final String REPORT = """
WITH raw AS MATERIALIZED(SELECT l.id,l.account_id,l.debit-l.credit AS signed_amount,j.posting_date FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id AND a.control_kind='BANK' JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE l.company_id=:company AND j.posting_date<:to),
   cash AS MATERIALIZED(SELECT * FROM accounting.cash_flow_lines WHERE company_id=:company AND posting_date<:to),
   flow AS MATERIALIZED(SELECT l.id AS journal_line_id,l.bank_account_id,l.journal_entry_id,l.posting_date,l.source_document_id,l.source_number,l.posting_kind,l.description,l.is_reversal,e.category,e.amount,e.signed_amount,e.basis,e.revision FROM cash l JOIN accounting.cash_flow_effective e ON e.company_id=l.company_id AND e.journal_line_id=l.id WHERE l.posting_date>=:from),
   activity AS MATERIALIZED(SELECT category,coalesce(sum(CASE WHEN NOT is_reversal AND signed_amount>0 THEN amount WHEN is_reversal AND signed_amount<0 THEN -amount ELSE 0 END),0) AS incoming,coalesce(sum(CASE WHEN NOT is_reversal AND signed_amount<0 THEN amount WHEN is_reversal AND signed_amount>0 THEN -amount ELSE 0 END),0) AS outgoing,coalesce(sum(signed_amount),0) AS net,count(*) AS count FROM flow GROUP BY category),
   amounts AS(SELECT coalesce(sum(signed_amount)FILTER(WHERE posting_date<:from),0) AS opening,coalesce(sum(signed_amount),0) AS closing FROM cash),
   controls AS(SELECT coalesce(sum(signed_amount),0) AS all_bank_closing,coalesce(sum(r.signed_amount)FILTER(WHERE sc.included=false),0) AS excluded_closing,(SELECT count(*) FROM accounting.bank_accounts b LEFT JOIN accounting.cash_flow_scopes s ON s.company_id=b.company_id AND s.bank_account_id=b.id WHERE b.company_id=:company AND s.bank_account_id IS NULL) AS missing_scope,(SELECT count(*) FROM accounting.cash_flow_scopes s WHERE s.company_id=:company AND s.review_required AND EXISTS(SELECT 1 FROM raw r WHERE r.account_id=s.bank_account_id)) AS pending_scope,
    (SELECT count(*) FROM cash l WHERE l.posting_date>=:from AND l.amount<>(SELECT coalesce(sum(amount),0) FROM flow f WHERE f.journal_line_id=l.id)) AS allocation_errors FROM raw r LEFT JOIN accounting.cash_flow_scopes sc ON sc.company_id=:company AND sc.bank_account_id=r.account_id),
   banks AS MATERIALIZED(SELECT b.id,b.name,b.kind,b.active,a.code,sc.included,sc.review_required,coalesce((SELECT sum(signed_amount) FROM raw WHERE account_id=b.id AND posting_date<:from),0) AS opening,coalesce((SELECT sum(signed_amount) FROM raw WHERE account_id=b.id),0) AS closing,EXISTS(SELECT 1 FROM raw WHERE account_id=b.id) AS used,
    br.id AS reconciliation_id,br.to_date AS reconciled_through,br.closing_balance AS statement_closing,br.book_closing AS snapshot_book,br.outstanding_deposits,br.outstanding_payments,
    (SELECT coalesce(sum(l.debit-l.credit),0) FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE l.company_id=:company AND l.account_id=b.id AND j.posting_date<=br.to_date) AS current_book_at_reconciliation
    FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id LEFT JOIN accounting.cash_flow_scopes sc ON sc.company_id=b.company_id AND sc.bank_account_id=b.id LEFT JOIN LATERAL(SELECT * FROM accounting.active_bank_reconciliations r WHERE r.company_id=b.company_id AND r.bank_account_id=b.id AND r.to_date<:to ORDER BY r.to_date DESC,r.id DESC LIMIT 1)br ON true WHERE b.company_id=:company),
   bank_status AS(SELECT count(*)FILTER(WHERE (used OR reconciliation_id IS NOT NULL) AND kind<>'CASH') AS eligible,count(*)FILTER(WHERE (used OR reconciliation_id IS NOT NULL) AND kind<>'CASH' AND reconciliation_id IS NOT NULL) AS available,count(*)FILTER(WHERE (used OR reconciliation_id IS NOT NULL) AND kind<>'CASH' AND reconciled_through=:to::date-1) AS matched,count(*)FILTER(WHERE reconciliation_id IS NOT NULL AND(current_book_at_reconciliation<>snapshot_book OR current_book_at_reconciliation-outstanding_deposits+outstanding_payments<>statement_closing)) AS errors FROM banks),
   totals AS(SELECT m.*,c.*,b.*,coalesce((SELECT net FROM activity WHERE category='OPERATING'),0) AS operating,coalesce((SELECT net FROM activity WHERE category='INVESTING'),0) AS investing,coalesce((SELECT net FROM activity WHERE category='FINANCING'),0) AS financing,coalesce((SELECT net FROM activity WHERE category='INTERNAL'),0) AS internal,coalesce((SELECT net FROM activity WHERE category='UNCLASSIFIED'),0) AS unclassified,coalesce((SELECT count FROM activity WHERE category='UNCLASSIFIED'),0) AS unclassified_count,(SELECT count(*) FROM flow) AS count FROM amounts m CROSS JOIN controls c CROSS JOIN bank_status b),
   assessed AS(SELECT *,closing-opening-operating-investing-financing-internal-unclassified AS movement_difference,closing-(all_bank_closing-excluded_closing) AS bank_scope_difference FROM totals),
   paged AS(SELECT * FROM flow ORDER BY posting_date,journal_entry_id,journal_line_id,category LIMIT :size OFFSET :offset)
   SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','method','DIRECT','snapshotAt',statement_timestamp(),'from',:from,'to',:to,'page',:page,'pageSize',:size,'totalCount',t.count,
    'status',CASE WHEN movement_difference<>0 OR bank_scope_difference<>0 OR internal<>0 OR allocation_errors>0 OR missing_scope>0 OR errors>0 THEN 'UNRECONCILED' WHEN unclassified_count>0 OR pending_scope>0 THEN 'INCOMPLETE' ELSE 'READY' END,
    'classificationStatus',CASE WHEN unclassified_count=0 AND allocation_errors=0 AND pending_scope=0 THEN 'COMPLETE' ELSE 'INCOMPLETE' END,
    'ledgerStatus',CASE WHEN movement_difference=0 AND bank_scope_difference=0 AND internal=0 AND allocation_errors=0 AND missing_scope=0 THEN 'RECONCILED' ELSE 'UNRECONCILED' END,
    'bankStatus',CASE WHEN errors>0 THEN 'UNRECONCILED' WHEN available=0 THEN 'NOT_AVAILABLE' WHEN matched<eligible THEN 'PARTIAL' ELSE 'RECONCILED' END,
    'totals',jsonb_build_object('openingCash',opening::text,'operatingNet',operating::text,'investingNet',investing::text,'financingNet',financing::text,'classifiedNetChange',(operating+investing+financing)::text,'unclassifiedNet',unclassified::text,'internalNet',internal::text,'netChange',(closing-opening)::text,'closingCash',closing::text,'movementDifference',movement_difference::text,'allBankClosing',all_bank_closing::text,'excludedBankClosing',excluded_closing::text,'bankScopeDifference',bank_scope_difference::text,'unclassifiedCount',unclassified_count,'allocationErrorCount',allocation_errors,'missingScopeCount',missing_scope,'scopeReviewRequiredCount',pending_scope),
    'activities',coalesce((SELECT jsonb_agg(jsonb_build_object('category',category,'inflow',incoming::text,'outflow',outgoing::text,'net',net::text,'allocationCount',count)ORDER BY category) FROM activity),'[]'::jsonb),
    'banks',coalesce((SELECT jsonb_agg(jsonb_build_object('bankAccountId',id,'code',code,'name',name,'kind',kind,'active',active,'included',included,'scopeReviewRequired',review_required,'openingSigned',opening::text,'closingSigned',closing::text,'reconciliationId',reconciliation_id,'reconciledThrough',reconciled_through,'statementClosing',statement_closing::text,'snapshotBookClosing',snapshot_book::text,'currentBookAtReconciliation',CASE WHEN reconciliation_id IS NOT NULL THEN current_book_at_reconciliation::text END,'outstandingDeposits',outstanding_deposits::text,'outstandingPayments',outstanding_payments::text,'reconciliationDifference',CASE WHEN reconciliation_id IS NOT NULL THEN(current_book_at_reconciliation-outstanding_deposits+outstanding_payments-statement_closing)::text END)ORDER BY code,id) FROM banks),'[]'::jsonb),
    'items',coalesce((SELECT jsonb_agg(jsonb_build_object('journalLineId',journal_line_id,'bankAccountId',bank_account_id,'journalId',journal_entry_id,'postingDate',posting_date,'sourceDocumentId',source_document_id,'sourceNumber',source_number,'postingKind',posting_kind,'description',description,'category',category,'amount',amount::text,'signedAmount',signed_amount::text,'isReversal',is_reversal,'inflowContribution',(CASE WHEN NOT is_reversal AND signed_amount>0 THEN amount WHEN is_reversal AND signed_amount<0 THEN -amount ELSE 0 END)::text,'outflowContribution',(CASE WHEN NOT is_reversal AND signed_amount<0 THEN amount WHEN is_reversal AND signed_amount>0 THEN -amount ELSE 0 END)::text,'basis',basis,'classificationRevision',revision)ORDER BY posting_date,journal_entry_id,journal_line_id,category) FROM paged),'[]'::jsonb))::text AS result FROM assessed t
""";
    private static final String SCOPE = """
SELECT s.*,b.name,b.kind,a.code FROM accounting.cash_flow_scopes s JOIN accounting.bank_accounts b ON b.company_id=s.company_id AND b.id=s.bank_account_id JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id WHERE s.company_id=:company AND s.bank_account_id=:id
""";
    private static final String SCOPES = """
SELECT s.*,b.name,b.kind,a.code,EXISTS(SELECT 1 FROM accounting.journal_lines l WHERE l.company_id=s.company_id AND l.account_id=s.bank_account_id) AND NOT s.review_required AS locked FROM accounting.cash_flow_scopes s JOIN accounting.bank_accounts b ON b.company_id=s.company_id AND b.id=s.bank_account_id JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id WHERE s.company_id=:company ORDER BY a.code,b.id
""";
}
