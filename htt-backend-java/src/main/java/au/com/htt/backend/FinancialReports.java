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
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class FinancialReports {
    private final StaffScope staff;private final JdbcClient jdbc;
    FinancialReports(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
    @GetMapping("/api/v1/accounting/reports/profit-and-loss")
    ResponseEntity<String> profit(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String includeZero,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);boolean zeros=LedgerFields.bool(includeZero);
        return read(scope,request,()->{LedgerReads.dates(start,end);return query(PROFIT,scope,QuoteDrafts.map("from",start,"to",end,"zeros",zeros));});
    }
    @GetMapping("/api/v1/accounting/reports/balance-sheet")
    ResponseEntity<String> balance(@RequestParam String asOf,@RequestParam(required=false) String fiscalYearStart,@RequestParam(required=false) String includeZero,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate date=LedgerFields.date(asOf),start=fiscalYearStart==null||fiscalYearStart.isEmpty()?null:LedgerFields.date(fiscalYearStart);boolean zeros=LedgerFields.bool(includeZero);
        return read(scope,request,()->{asOf(date);if(start!=null)check(start.getYear()>=2&&!start.isAfter(date)&&ChronoUnit.DAYS.between(start,date)<=365,"fiscalYearStart","Fiscal-year start must be within the preceding year.");return query(BALANCE,scope,QuoteDrafts.map("date",date,"start",start,"zeros",zeros));});
    }
    @GetMapping("/api/v1/accounting/reports/receivables-aging")
    ResponseEntity<String> ar(@RequestParam String asOf,@RequestParam(required=false) String partyId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return aging("AR",asOf,partyId,page,pageSize,token,request);}
    @GetMapping("/api/v1/accounting/reports/payables-aging")
    ResponseEntity<String> ap(@RequestParam String asOf,@RequestParam(required=false) String partyId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return aging("AP",asOf,partyId,page,pageSize,token,request);}
    private ResponseEntity<String> aging(String side,String asOf,String partyId,String page,String pageSize,Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate date=LedgerFields.date(asOf);UUID party=LedgerFields.uuid(partyId);Integer p=LedgerFields.integer(page),s=LedgerFields.integer(pageSize);
        return read(scope,request,()->{asOf(date);int requested=p==null?1:p,size=s==null?25:s;check(requested>=1&&requested<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
            if(party!=null&&jdbc.sql("SELECT id FROM crm.parties WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",party).query(UUID.class).optional().isEmpty())throw new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");
            return query(AGING,scope,QuoteDrafts.map("side",side,"date",date,"party",party,"page",requested,"size",size,"offset",(requested-1)*size));
        });
    }
    private static void asOf(LocalDate value){check(value.getYear()>=2,"asOf","A valid inclusive reporting date is required.");}
    private String query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args).query(String.class).single();}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.reports.read");if(!CrmParties.has(scope,"accounting.ledger.read"))throw new StaffScope.Failure(403,"permission_denied","Ledger read permission required.");return scope;}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),work));}
    private static final String PROFIT = """
WITH amounts AS MATERIALIZED(
              SELECT a.id,a.code,a.name,a.kind,a.active,coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date>=:from AND j.posting_date<:to),0) AS signed_profit
              FROM accounting.accounts a LEFT JOIN accounting.journal_lines l ON l.company_id=a.company_id AND l.account_id=a.id LEFT JOIN accounting.business_journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id
              WHERE a.company_id=:company AND a.kind IN('REVENUE','EXPENSE') GROUP BY a.id
            ), totals AS(SELECT coalesce(sum(signed_profit)FILTER(WHERE kind='REVENUE'),0) AS revenue,coalesce(-sum(signed_profit)FILTER(WHERE kind='EXPENSE'),0) AS expenses FROM amounts)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','ACCRUAL_GL','snapshotAt',statement_timestamp(),'from',:from,'to',:to,
              'totals',jsonb_build_object('revenue',revenue::text,'expenses',expenses::text,'netProfit',(revenue-expenses)::text),
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',id,'code',code,'name',name,'kind',kind,'active',active,'amount',(CASE WHEN kind='REVENUE' THEN signed_profit ELSE -signed_profit END)::text)ORDER BY kind DESC,code,id) FROM amounts WHERE :zeros OR signed_profit<>0),'[]'::jsonb))::text AS result FROM totals
""";
    private static final String BALANCE = """
WITH year_start AS(SELECT coalesce(CAST(:start AS date),(SELECT starts_on FROM accounting.fiscal_years WHERE company_id=:company AND starts_on<=:date AND ends_on>:date ORDER BY starts_on DESC LIMIT 1),make_date(extract(year FROM :date::date)::int-CASE WHEN extract(month FROM :date::date)<7 THEN 1 ELSE 0 END,7,1)) AS starts_on), amounts AS MATERIALIZED(
              SELECT a.id,a.code,a.name,a.kind,a.control_kind,a.active,coalesce(sum(l.debit-l.credit)FILTER(WHERE j.posting_date<=:date),0) AS signed_balance,
                coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date<(SELECT starts_on FROM year_start)),0) AS prior_profit,
                coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date>=(SELECT starts_on FROM year_start) AND j.posting_date<=:date),0) AS current_profit
              FROM accounting.accounts a LEFT JOIN accounting.journal_lines l ON l.company_id=a.company_id AND l.account_id=a.id LEFT JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE a.company_id=:company GROUP BY a.id
            ), totals AS(SELECT coalesce(sum(signed_balance)FILTER(WHERE kind='ASSET'),0) AS assets,coalesce(-sum(signed_balance)FILTER(WHERE kind='LIABILITY'),0) AS liabilities,coalesce(-sum(signed_balance)FILTER(WHERE kind='EQUITY'),0) AS posted_equity,
              coalesce(sum(prior_profit)FILTER(WHERE kind IN('REVENUE','EXPENSE')),0) AS prior_earnings,coalesce(sum(current_profit)FILTER(WHERE kind IN('REVENUE','EXPENSE')),0) AS current_earnings FROM amounts)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','ACCRUAL_GL','snapshotAt',statement_timestamp(),'asOf',:date,'fiscalYearStart',(SELECT starts_on FROM year_start),
              'totals',jsonb_build_object('assets',assets::text,'liabilities',liabilities::text,'postedEquity',posted_equity::text,'priorUnclosedEarnings',prior_earnings::text,'currentYearEarnings',current_earnings::text,'equity',(posted_equity+prior_earnings+current_earnings)::text,'liabilitiesAndEquity',(liabilities+posted_equity+prior_earnings+current_earnings)::text,'difference',(assets-liabilities-posted_equity-prior_earnings-current_earnings)::text),
              'status',CASE WHEN assets=liabilities+posted_equity+prior_earnings+current_earnings THEN 'BALANCED' ELSE 'UNBALANCED' END,
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',id,'code',code,'name',name,'kind',kind,'controlKind',control_kind,'active',active,'amount',(CASE WHEN kind='ASSET' THEN signed_balance ELSE -signed_balance END)::text)ORDER BY kind,code,id) FROM amounts WHERE kind IN('ASSET','LIABILITY','EQUITY') AND(:zeros OR signed_balance<>0)),'[]'::jsonb))::text AS result FROM totals
""";
    private static final String AGING = """
WITH documents AS MATERIALIZED(
              SELECT i.company_id,'AR'::text AS side,i.id,i.party_id,i.customer_id AS counterparty_id,i.invoice_date,i.due_on,l.id AS line_id FROM sales.invoices i JOIN sales.invoice_lines l ON l.company_id=i.company_id AND l.invoice_id=i.id WHERE i.company_id=:company AND :side='AR'
              UNION ALL
              SELECT b.company_id,'AP',b.id,b.party_id,b.supplier_id,b.invoice_date,b.due_on,l.id FROM purchase.bills b JOIN purchase.bill_lines l ON l.company_id=b.company_id AND l.bill_id=b.id WHERE b.company_id=:company AND :side='AP'
            ), movements AS MATERIALIZED(
              SELECT m.item_line_id,sum(m.amount) AS balance FROM accounting.report_open_item_movements m JOIN accounting.report_control_dates d ON d.company_id=m.company_id AND d.source_document_id=m.source_document_id AND d.side=m.side WHERE m.company_id=:company AND m.side=:side AND d.posting_date<=:date GROUP BY m.item_line_id
            ), items AS MATERIALIZED(
              SELECT d.id,d.party_id,d.counterparty_id,d.invoice_date,d.due_on,sum(greatest(m.balance,0)) AS outstanding,sum(greatest(-m.balance,0)) AS credit,sum(m.balance) AS net
              FROM documents d JOIN movements m ON m.item_line_id=d.line_id WHERE(CAST(:party AS uuid) IS NULL OR d.party_id=:party) GROUP BY d.id,d.party_id,d.counterparty_id,d.invoice_date,d.due_on HAVING bool_or(m.balance<>0)
            ), totals AS(
              SELECT count(*) AS count,coalesce(sum(outstanding)FILTER(WHERE due_on>=:date),0) AS current,coalesce(sum(outstanding)FILTER(WHERE :date-due_on BETWEEN 1 AND 30),0) AS d30,coalesce(sum(outstanding)FILTER(WHERE :date-due_on BETWEEN 31 AND 60),0) AS d60,coalesce(sum(outstanding)FILTER(WHERE :date-due_on BETWEEN 61 AND 90),0) AS d90,coalesce(sum(outstanding)FILTER(WHERE :date-due_on>90),0) AS older,coalesce(sum(outstanding),0) AS gross,coalesce(sum(credit),0) AS credits,coalesce(sum(net),0) AS net FROM items
            ), control AS(
              SELECT coalesce(sum(CASE WHEN :side='AR' THEN l.debit-l.credit ELSE l.credit-l.debit END),0) AS balance FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=:company AND a.control_kind=:side AND j.posting_date<=:date AND(CAST(:party AS uuid) IS NULL OR l.party_id=:party)
            ), paged AS(SELECT i.*,p.legal_name,d.number FROM items i JOIN crm.parties p ON p.company_id=:company AND p.id=i.party_id JOIN platform.documents d ON d.company_id=:company AND d.id=i.id ORDER BY i.due_on,i.id LIMIT :size OFFSET :offset)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','POSTING_DATE','snapshotAt',statement_timestamp(),'asOf',:date,'side',:side,'partyId',CAST(:party AS uuid),'page',:page,'pageSize',:size,'totalCount',t.count,
              'totals',jsonb_build_object('current',t.current::text,'days1To30',t.d30::text,'days31To60',t.d60::text,'days61To90',t.d90::text,'daysOver90',t.older::text,'outstanding',t.gross::text,'availableCredit',t.credits::text,'netBalance',t.net::text,'controlBalance',c.balance::text,'difference',(t.net-c.balance)::text),
              'status',CASE WHEN t.net=c.balance THEN 'RECONCILED' ELSE 'UNRECONCILED' END,
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('documentId',id,'number',number,'partyId',party_id,'counterpartyId',counterparty_id,'partyName',legal_name,'invoiceDate',invoice_date,'dueOn',due_on,'daysOverdue',greatest(:date-due_on,0),'bucket',CASE WHEN due_on>=:date THEN 'CURRENT' WHEN :date-due_on<=30 THEN '1_30' WHEN :date-due_on<=60 THEN '31_60' WHEN :date-due_on<=90 THEN '61_90' ELSE 'OVER_90' END,'outstanding',outstanding::text,'availableCredit',credit::text,'netBalance',net::text)ORDER BY due_on,id) FROM paged),'[]'::jsonb))::text AS result FROM totals t CROSS JOIN control c
""";
}
