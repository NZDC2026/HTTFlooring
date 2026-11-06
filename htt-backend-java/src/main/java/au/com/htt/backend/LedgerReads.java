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
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class LedgerReads {
    private final StaffScope staff;private final JdbcClient jdbc;
    LedgerReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
    @GetMapping("/api/v1/accounting/general-ledger")
    ResponseEntity<String> ledger(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String accountId,@RequestParam(required=false) String partyId,@RequestParam(required=false) String documentId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);UUID account=LedgerFields.uuid(accountId),party=LedgerFields.uuid(partyId),document=LedgerFields.uuid(documentId);Integer requestedPage=LedgerFields.integer(page),requestedSize=LedgerFields.integer(pageSize);
        return read(scope,request,()->{dates(start,end);int p=requestedPage==null?1:requestedPage,size=requestedSize==null?25:requestedSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
            if(account!=null)exists(scope,"accounting.accounts",account);if(party!=null)exists(scope,"crm.parties",party);if(document!=null)exists(scope,"platform.documents",document);
            return query(scope,LEDGER,QuoteDrafts.map("from",start,"to",end,"account",account,"party",party,"document",document,"page",p,"size",size,"offset",(p-1)*size));
        });
    }
    @GetMapping("/api/v1/accounting/trial-balance")
    ResponseEntity<String> trial(@RequestParam String from,@RequestParam String to,@RequestParam(required=false) String includeZero,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request);LocalDate start=LedgerFields.date(from),end=LedgerFields.date(to);boolean zeros=LedgerFields.bool(includeZero);
        return read(scope,request,()->{dates(start,end);return query(scope,TRIAL,QuoteDrafts.map("from",start,"to",end,"zeros",zeros));});
    }
    @GetMapping("/api/v1/accounting/journals/{id}")
    ResponseEntity<String> journal(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request);return read(scope,request,()->{exists(scope,"accounting.journal_entries",id);return query(scope,JOURNAL,QuoteDrafts.map("id",id));});}
    static void dates(LocalDate from,LocalDate to){check(!from.equals(LocalDate.of(1,1,1))&&to.isAfter(from)&&ChronoUnit.DAYS.between(from,to)<=366,"to","Use a half-open interval of 1..366 days.");}
    private void exists(StaffScope.CompanyAccess scope,String table,UUID id){if(jdbc.sql("SELECT id FROM "+table+" WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(UUID.class).optional().isEmpty())throw new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private String query(StaffScope.CompanyAccess scope,String sql,Map<String,Object> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args).query(String.class).single();}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){return staff.require(token,request.getHeader("X-Company-Id"),"accounting.ledger.read");}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<String> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),work));}
    private static final String JOURNAL = """
SELECT jsonb_build_object('currency','AUD','journal',jsonb_build_object('id',x.id,'postingDate',x.posting_date,'description',x.description,'postingBatchId',x.posting_batch_id,'sourceDocumentId',x.source_document_id,'sourceNumber',x.source_number,'documentType',x.document_type,'sourceVersion',x.source_version,'postingKind',x.posting_kind,'reversesBatchId',x.reverses_batch_id),'lines',coalesce((SELECT jsonb_agg(jsonb_build_object('id',l.id,'accountId',l.account_id,'accountCode',a.code,'accountName',a.name,'partyId',l.party_id,'sourceLineId',l.source_line_id,'debit',l.debit::text,'credit',l.credit::text) ORDER BY l.id) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=:company AND l.journal_entry_id=:id),'[]'::jsonb))::text AS result
              FROM(SELECT j.id,j.posting_date,j.description,b.id AS posting_batch_id,b.source_document_id,d.number AS source_number,d.document_type,b.source_version,b.posting_kind,b.reverses_batch_id FROM accounting.journal_entries j JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.source_document_id WHERE j.company_id=:company AND j.id=:id)x
""";
    private static final String LEDGER = """
WITH scoped AS MATERIALIZED(
            SELECT l.id,l.account_id,a.code AS account_code,a.name AS account_name,l.party_id,l.source_line_id,l.debit,l.credit,j.id AS journal_id,j.posting_date,j.description,b.id AS posting_batch_id,b.source_document_id,d.number AS source_number,d.document_type,b.posting_kind,b.source_version,b.reverses_batch_id
            FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.source_document_id
            WHERE l.company_id=:company AND j.posting_date<:to AND(CAST(:account AS uuid) IS NULL OR l.account_id=CAST(:account AS uuid))AND(CAST(:party AS uuid) IS NULL OR l.party_id=CAST(:party AS uuid))AND(CAST(:document AS uuid) IS NULL OR b.source_document_id=CAST(:document AS uuid))
          ), totals AS(SELECT coalesce(sum(debit-credit)FILTER(WHERE posting_date<:from),0) AS opening,coalesce(sum(debit)FILTER(WHERE posting_date>=:from),0) AS debits,coalesce(sum(credit)FILTER(WHERE posting_date>=:from),0) AS credits,count(*)FILTER(WHERE posting_date>=:from) AS count FROM scoped),
          running AS(SELECT x.*,t.opening+sum(x.debit-x.credit)OVER(ORDER BY x.posting_date,x.journal_id,x.id ROWS UNBOUNDED PRECEDING) AS running_signed FROM scoped x CROSS JOIN totals t WHERE x.posting_date>=:from),
          paged AS(SELECT * FROM running ORDER BY posting_date,journal_id,id LIMIT :size OFFSET :offset)
          SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','snapshotAt',statement_timestamp(),'from',:from,'to',:to,'page',:page,'pageSize',:size,'totalCount',t.count,'openingSigned',t.opening::text,'periodDebit',t.debits::text,'periodCredit',t.credits::text,'closingSigned',(t.opening+t.debits-t.credits)::text,'items',coalesce((SELECT jsonb_agg(jsonb_build_object('id',p.id,'accountId',p.account_id,'accountCode',p.account_code,'accountName',p.account_name,'partyId',p.party_id,'sourceLineId',p.source_line_id,'journalId',p.journal_id,'postingDate',p.posting_date,'description',p.description,'postingBatchId',p.posting_batch_id,'sourceDocumentId',p.source_document_id,'sourceNumber',p.source_number,'documentType',p.document_type,'postingKind',p.posting_kind,'sourceVersion',p.source_version,'reversesBatchId',p.reverses_batch_id,'debit',p.debit::text,'credit',p.credit::text,'runningSigned',p.running_signed::text) ORDER BY p.posting_date,p.journal_id,p.id) FROM paged p),'[]'::jsonb))::text AS result FROM totals t
""";
    private static final String TRIAL = """
WITH sums AS MATERIALIZED(SELECT l.account_id,coalesce(sum(l.debit-l.credit)FILTER(WHERE j.posting_date<:from),0) AS opening,coalesce(sum(l.debit)FILTER(WHERE j.posting_date>=:from),0) AS debits,coalesce(sum(l.credit)FILTER(WHERE j.posting_date>=:from),0) AS credits FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE l.company_id=:company AND j.posting_date<:to GROUP BY l.account_id),
          rows AS(SELECT a.id,a.code,a.name,a.kind,a.control_kind,a.active,coalesce(s.opening,0) AS opening,coalesce(s.debits,0) AS debits,coalesce(s.credits,0) AS credits,coalesce(s.opening+s.debits-s.credits,0) AS closing FROM accounting.accounts a LEFT JOIN sums s ON s.account_id=a.id WHERE a.company_id=:company),
          totals AS(SELECT coalesce(sum(greatest(opening,0)),0) AS od,coalesce(sum(greatest(-opening,0)),0) AS oc,coalesce(sum(debits),0) AS pd,coalesce(sum(credits),0) AS pc,coalesce(sum(greatest(closing,0)),0) AS cd,coalesce(sum(greatest(-closing,0)),0) AS cc FROM rows)
          SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','snapshotAt',statement_timestamp(),'from',:from,'to',:to,'totals',jsonb_build_object('openingDebit',od::text,'openingCredit',oc::text,'periodDebit',pd::text,'periodCredit',pc::text,'closingDebit',cd::text,'closingCredit',cc::text,'difference',(cd-cc)::text),'status',CASE WHEN od=oc AND pd=pc AND cd=cc THEN 'BALANCED' ELSE 'UNBALANCED' END,'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',r.id,'code',r.code,'name',r.name,'kind',r.kind,'controlKind',r.control_kind,'active',r.active,'openingSigned',r.opening::text,'openingDebit',greatest(r.opening,0)::text,'openingCredit',greatest(-r.opening,0)::text,'periodDebit',r.debits::text,'periodCredit',r.credits::text,'closingSigned',r.closing::text,'closingDebit',greatest(r.closing,0)::text,'closingCredit',greatest(-r.closing,0)::text) ORDER BY r.code,r.id) FROM rows r WHERE :zeros OR r.opening<>0 OR r.debits<>0 OR r.credits<>0),'[]'::jsonb))::text AS result FROM totals
""";
}
