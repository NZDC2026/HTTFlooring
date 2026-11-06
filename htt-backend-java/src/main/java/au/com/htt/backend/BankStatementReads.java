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
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class BankStatementReads {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;
    BankStatementReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;}
    private static final String READ="accounting.bank_statements.read";
    @GetMapping("/api/v1/bank-accounts/{id}/statements")
    ResponseEntity<String> statements(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return read(scope,request,()->{bank(scope,id);var args=page(page,pageSize);args.put("bank",id);return QuoteDrafts.map("items",query(STATEMENTS,scope,args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));});
    }
    @GetMapping("/api/v1/bank-statements/{id}")
    ResponseEntity<String> statement(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return read(scope,request,()->{bank(scope,owner(scope,"accounting.bank_statements",id));var args=page(page,pageSize);args.put("id",id);return json.readTree(query(VIEW,scope,args).query(String.class).single());});
    }
    @GetMapping("/api/v1/bank-statements/{id}/source")
    ResponseEntity<byte[]> source(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return staff.inCompany(scope,rid(request),()->{bank(scope,owner(scope,"accounting.bank_statements",id));
            return query("SELECT source_content,source_format FROM accounting.bank_statements WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query((r,n)->{
                boolean csv="CSV".equals(r.getString("source_format"));return ResponseEntity.ok().contentType(MediaType.parseMediaType(csv?"text/csv; charset=utf-8":"application/json")).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=statement-"+id+(csv?".csv":".json")).body(r.getBytes("source_content"));
            }).single();
        });
    }
    @GetMapping("/api/v1/bank-statement-lines/{id}/candidates")
    ResponseEntity<String> candidates(@PathVariable UUID id,@RequestParam(required=false) String q,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return read(scope,request,()->{
            var line=query(LINE,scope,QuoteDrafts.map("id",id)).query((r,n)->QuoteDrafts.map("bank",r.getObject("bank_account_id"),"amount",r.getBigDecimal("amount"),"date",r.getObject("transaction_date"),"to",r.getObject("to_date"),"state",r.getString("state"),"remaining",r.getBigDecimal("remaining"))).optional().orElseThrow(BankStatementReads::missing);
            bank(scope,(UUID)line.get("bank"));var args=page(page,pageSize);args.putAll(line);args.put("q",Optional.ofNullable(optional(q,"q",100)).orElse(""));
            return QuoteDrafts.map("items",query(CANDIDATES,scope,args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));
        });
    }
    @GetMapping("/api/v1/bank-accounts/{id}/cash-clearing")
    ResponseEntity<String> clearing(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return read(scope,request,()->{bank(scope,id);var args=page(page,pageSize);args.put("bank",id);return QuoteDrafts.map("currency","AUD","items",query(CASH,scope,args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));});
    }
    @GetMapping("/api/v1/bank-reconciliations/{id}")
    ResponseEntity<String> reconciliation(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);return read(scope,request,()->{bank(scope,owner(scope,"accounting.bank_reconciliations",id));var args=page(page,pageSize);args.put("id",id);
            return QuoteDrafts.map("reconciliation",query(RECON_HEADER,scope,args).query(rows::row).single(),"matches",query(RECON_MATCHES,scope,args).query(rows::row).list(),"openingAllocations",query(RECON_OPENING,scope,args).query(rows::row).list(),"outstanding",query(RECON_OUTSTANDING,scope,args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));});
    }
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){var scope=staff.require(token,request.getHeader("X-Company-Id"),READ);for(String permission:List.of("accounting.banks.read","accounting.ledger.read"))if(!CrmParties.has(scope,permission))throw new StaffScope.Failure(403,"permission_denied","Statement, bank-directory and ledger read permissions required.");return scope;}
    void bank(StaffScope.CompanyAccess scope,UUID id){query("SELECT accounting.require_bank_reconciliation_access(:permission,:bank)",scope,QuoteDrafts.map("permission",READ,"bank",id)).query((r,n)->0).single();}
    UUID owner(StaffScope.CompanyAccess scope,String table,UUID id){return query("SELECT bank_account_id FROM "+table+" WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query(UUID.class).optional().orElseThrow(BankStatementReads::missing);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    Object view(StaffScope.CompanyAccess scope,UUID id){var args=page(null,null);args.put("id",id);return json.readTree(query(VIEW,scope,args).query(String.class).single());}
    private static final String VIEW = """
WITH st AS(SELECT s.id,s.bank_account_id,s.reference,s.from_date,s.to_date,s.opening_balance,s.closing_balance,s.source_format,s.source_hash,s.line_count,c.state,c.version FROM accounting.bank_statements s JOIN accounting.bank_statement_controls c ON c.company_id=s.company_id AND c.id=s.id WHERE s.company_id=:company AND s.id=:id), lines AS MATERIALIZED(SELECT l.*,coalesce((SELECT sum(a.amount) FROM accounting.bank_match_allocations a JOIN accounting.active_bank_matches m ON m.company_id=a.company_id AND m.id=a.match_id WHERE m.company_id=l.company_id AND m.statement_line_id=l.id),0) AS matched FROM accounting.bank_statement_lines l WHERE l.company_id=:company AND l.statement_id=:id), paged AS(SELECT * FROM lines ORDER BY line_no LIMIT :size OFFSET :offset)
        SELECT jsonb_build_object('statement',jsonb_build_object('id',st.id,'bankAccountId',st.bank_account_id,'reference',st.reference,'fromDate',st.from_date,'toDate',st.to_date,'openingBalance',st.opening_balance::text,'closingBalance',st.closing_balance::text,'sourceFormat',st.source_format,'sourceHash',st.source_hash,'lineCount',st.line_count,'state',st.state,'version',st.version),'unmatchedCount',(SELECT count(*) FROM lines WHERE matched<abs(amount)),'reconciliations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',r.id,'active',u.id IS NULL,'createdAt',r.created_at) ORDER BY r.created_at,r.id) FROM accounting.bank_reconciliations r LEFT JOIN accounting.bank_reconciliation_reopens u ON u.company_id=r.company_id AND u.reconciliation_id=r.id WHERE r.company_id=:company AND r.statement_id=:id),'[]'::jsonb),'lines',coalesce((SELECT jsonb_agg(jsonb_build_object('id',l.id,'lineNo',l.line_no,'date',l.transaction_date,'amount',l.amount::text,'description',l.description,'reference',l.reference,'externalId',l.external_id,'possibleDuplicateCount',CASE WHEN l.external_id IS NOT NULL THEN 0 ELSE(SELECT count(*) FROM accounting.bank_statement_lines other JOIN accounting.bank_statement_controls oc ON oc.company_id=other.company_id AND oc.id=other.statement_id WHERE other.company_id=l.company_id AND other.bank_account_id=l.bank_account_id AND other.id<>l.id AND other.transaction_date=l.transaction_date AND other.amount=l.amount AND other.reference=l.reference AND other.description=l.description AND oc.state<>'VOID')END,'matchedAmount',l.matched::text,'status',CASE WHEN l.matched=0 THEN 'UNMATCHED' WHEN l.matched=abs(l.amount) THEN 'MATCHED' ELSE 'PARTIAL' END,'matches',coalesce((SELECT jsonb_agg(jsonb_build_object('id',m.id,'reference',m.reference,'released',u.id IS NOT NULL,'allocations',(SELECT jsonb_agg(jsonb_build_object('journalLineId',a.journal_line_id,'amount',a.amount::text) ORDER BY a.id) FROM accounting.bank_match_allocations a WHERE a.company_id=m.company_id AND a.match_id=m.id)) ORDER BY m.created_at,m.id) FROM accounting.bank_matches m LEFT JOIN accounting.bank_match_releases u ON u.company_id=m.company_id AND u.match_id=m.id WHERE m.company_id=l.company_id AND m.statement_line_id=l.id),'[]'::jsonb)) ORDER BY l.line_no) FROM paged l),'[]'::jsonb),'page',:page,'pageSize',:size,'snapshotAt',statement_timestamp())::text AS result FROM st
""";
    private static final String CANDIDATES = """
SELECT p.*,p.amount-p.reserved_amount AS available_amount,(p.amount-p.reserved_amount=:remaining) AS exact_amount FROM accounting.bank_cash_positions p WHERE p.company_id=:company AND p.bank_account_id=:bank AND :state='OPEN' AND :remaining>0 AND sign(p.signed_amount)=sign(:amount) AND p.posting_date<=:to AND p.amount>p.reserved_amount AND(:q='' OR strpos(lower(coalesce(p.source_number,'')||' '||p.description),lower(:q))>0) ORDER BY exact_amount DESC,abs(p.posting_date-:date),p.posting_date,p.id LIMIT :size OFFSET :offset
""";
    private static final String CASH = """
SELECT p.*,p.amount-p.reserved_amount AS available_amount,p.amount-p.cleared_amount AS uncleared_amount FROM accounting.bank_cash_positions p WHERE p.company_id=:company AND p.bank_account_id=:bank ORDER BY p.posting_date,p.id LIMIT :size OFFSET :offset
""";
    private static final String RECON_HEADER = """
SELECT r.*,u.id AS reopen_id FROM accounting.bank_reconciliations r LEFT JOIN accounting.bank_reconciliation_reopens u ON u.company_id=r.company_id AND u.reconciliation_id=r.id WHERE r.company_id=:company AND r.id=:id
""";
    private static final String RECON_MATCHES = """
SELECT m.match_id,a.journal_line_id,a.amount FROM accounting.bank_reconciliation_matches m JOIN accounting.bank_match_allocations a ON a.company_id=m.company_id AND a.match_id=m.match_id WHERE m.company_id=:company AND m.reconciliation_id=:id ORDER BY m.match_id,a.id LIMIT :size OFFSET :offset
""";
    private static final String RECON_OPENING = """
SELECT journal_line_id,amount FROM accounting.bank_opening_allocations WHERE company_id=:company AND reconciliation_id=:id ORDER BY id LIMIT :size OFFSET :offset
""";
    private static final String RECON_OUTSTANDING = """
SELECT o.journal_line_id,o.signed_remaining,p.posting_date,p.source_document_id,p.source_number,p.posting_kind FROM accounting.bank_reconciliation_outstanding o JOIN accounting.bank_cash_positions p ON p.company_id=o.company_id AND p.id=o.journal_line_id WHERE o.company_id=:company AND o.reconciliation_id=:id ORDER BY p.posting_date,o.id LIMIT :size OFFSET :offset
""";
    private static final String STATEMENTS = """
SELECT s.id,s.reference,s.from_date,s.to_date,s.opening_balance,s.closing_balance,s.source_format,s.source_hash,s.line_count,c.state,c.version,s.created_at FROM accounting.bank_statements s JOIN accounting.bank_statement_controls c ON c.company_id=s.company_id AND c.id=s.id WHERE s.company_id=:company AND s.bank_account_id=:bank ORDER BY s.to_date DESC,s.created_at DESC,s.id LIMIT :size OFFSET :offset
""";
    private static final String LINE = """
SELECT l.bank_account_id,l.amount,l.transaction_date,st.to_date,ctl.state,abs(l.amount)-coalesce((SELECT sum(a.amount) FROM accounting.active_bank_matches m JOIN accounting.bank_match_allocations a ON a.company_id=m.company_id AND a.match_id=m.id WHERE m.company_id=l.company_id AND m.statement_line_id=l.id),0) AS remaining FROM accounting.bank_statement_lines l JOIN accounting.bank_statements st ON st.company_id=l.company_id AND st.id=l.statement_id JOIN accounting.bank_statement_controls ctl ON ctl.company_id=l.company_id AND ctl.id=l.statement_id WHERE l.company_id=:company AND l.id=:id
""";
}
