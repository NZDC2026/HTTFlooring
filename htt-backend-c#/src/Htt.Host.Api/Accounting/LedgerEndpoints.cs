using Htt.Infrastructure;
using Htt.SharedKernel;
using Htt.Host.Api.MasterData;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Accounting;
internal static class LedgerEndpoints
{
    private static void Dates(DateOnly from,DateOnly to)=>Check.That(from!=DateOnly.MinValue&&to>from&&to.DayNumber-from.DayNumber<=366,"to","Use a half-open interval of 1..366 days.");
    private static async Task<IResult> Query(CompanySession s,string sql,CancellationToken ct,params DbArg[]args)=>Results.Content((string)(await One(s,sql,ct,args))["result"]!,"application/json");
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/accounting/general-ledger",Ledger).WithMetadata(new Permission("accounting.ledger.read"));
        g.MapGet("/accounting/trial-balance",TrialBalance).WithMetadata(new Permission("accounting.ledger.read"));
        g.MapGet("/accounting/journals/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>
        {
            await One(s,"SELECT id FROM accounting.journal_entries WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));return await Query(s,"""
              SELECT jsonb_build_object('currency','AUD','journal',jsonb_build_object('id',x.id,'postingDate',x.posting_date,'description',x.description,'postingBatchId',x.posting_batch_id,'sourceDocumentId',x.source_document_id,'sourceNumber',x.source_number,'documentType',x.document_type,'sourceVersion',x.source_version,'postingKind',x.posting_kind,'reversesBatchId',x.reverses_batch_id),'lines',coalesce((SELECT jsonb_agg(jsonb_build_object('id',l.id,'accountId',l.account_id,'accountCode',a.code,'accountName',a.name,'partyId',l.party_id,'sourceLineId',l.source_line_id,'debit',l.debit::text,'credit',l.credit::text) ORDER BY l.id) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND l.journal_entry_id=@id),'[]'::jsonb))::text AS result
              FROM(SELECT j.id,j.posting_date,j.description,b.id AS posting_batch_id,b.source_document_id,d.number AS source_number,d.document_type,b.source_version,b.posting_kind,b.reverses_batch_id FROM accounting.journal_entries j JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.source_document_id WHERE j.company_id=@company AND j.id=@id)x
              """,ct,new DbArg("id",id));
        }).WithMetadata(new Permission("accounting.ledger.read"));
    }
    private static async Task<IResult> Ledger(DateOnly from,DateOnly to,Guid? accountId,Guid? partyId,Guid? documentId,int? page,int? pageSize,CompanySession s,CancellationToken ct)
    {
        Dates(from,to);var(offset,size)=Page(page,pageSize);if(accountId is{}account)await One(s,"SELECT id FROM accounting.accounts WHERE company_id=@company AND id=@id",ct,new DbArg("id",account));if(partyId is{}party)await One(s,"SELECT id FROM crm.parties WHERE company_id=@company AND id=@id",ct,new DbArg("id",party));if(documentId is{}doc)await One(s,"SELECT id FROM platform.documents WHERE company_id=@company AND id=@id",ct,new DbArg("id",doc));
        return await Query(s,"""
          WITH scoped AS MATERIALIZED(
            SELECT l.id,l.account_id,a.code AS account_code,a.name AS account_name,l.party_id,l.source_line_id,l.debit,l.credit,j.id AS journal_id,j.posting_date,j.description,b.id AS posting_batch_id,b.source_document_id,d.number AS source_number,d.document_type,b.posting_kind,b.source_version,b.reverses_batch_id
            FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.source_document_id
            WHERE l.company_id=@company AND j.posting_date<@to AND(@account IS NULL OR l.account_id=@account)AND(@party IS NULL OR l.party_id=@party)AND(@document IS NULL OR b.source_document_id=@document)
          ), totals AS(SELECT coalesce(sum(debit-credit)FILTER(WHERE posting_date<@from),0) AS opening,coalesce(sum(debit)FILTER(WHERE posting_date>=@from),0) AS debits,coalesce(sum(credit)FILTER(WHERE posting_date>=@from),0) AS credits,count(*)FILTER(WHERE posting_date>=@from) AS count FROM scoped),
          running AS(SELECT x.*,t.opening+sum(x.debit-x.credit)OVER(ORDER BY x.posting_date,x.journal_id,x.id ROWS UNBOUNDED PRECEDING) AS running_signed FROM scoped x CROSS JOIN totals t WHERE x.posting_date>=@from),
          paged AS(SELECT * FROM running ORDER BY posting_date,journal_id,id LIMIT @size OFFSET @offset)
          SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','snapshotAt',statement_timestamp(),'from',@from,'to',@to,'page',@page,'pageSize',@size,'totalCount',t.count,'openingSigned',t.opening::text,'periodDebit',t.debits::text,'periodCredit',t.credits::text,'closingSigned',(t.opening+t.debits-t.credits)::text,'items',coalesce((SELECT jsonb_agg(jsonb_build_object('id',p.id,'accountId',p.account_id,'accountCode',p.account_code,'accountName',p.account_name,'partyId',p.party_id,'sourceLineId',p.source_line_id,'journalId',p.journal_id,'postingDate',p.posting_date,'description',p.description,'postingBatchId',p.posting_batch_id,'sourceDocumentId',p.source_document_id,'sourceNumber',p.source_number,'documentType',p.document_type,'postingKind',p.posting_kind,'sourceVersion',p.source_version,'reversesBatchId',p.reverses_batch_id,'debit',p.debit::text,'credit',p.credit::text,'runningSigned',p.running_signed::text) ORDER BY p.posting_date,p.journal_id,p.id) FROM paged p),'[]'::jsonb))::text AS result FROM totals t
          """,ct,new DbArg("from",from),new DbArg("to",to),new DbArg("account",accountId,NpgsqlDbType.Uuid),new DbArg("party",partyId,NpgsqlDbType.Uuid),new DbArg("document",documentId,NpgsqlDbType.Uuid),new DbArg("page",page??1),new DbArg("size",size),new DbArg("offset",offset));
    }
    private static async Task<IResult> TrialBalance(DateOnly from,DateOnly to,bool? includeZero,CompanySession s,CancellationToken ct)
    {
        Dates(from,to);return await Query(s,"""
          WITH sums AS MATERIALIZED(SELECT l.account_id,coalesce(sum(l.debit-l.credit)FILTER(WHERE j.posting_date<@from),0) AS opening,coalesce(sum(l.debit)FILTER(WHERE j.posting_date>=@from),0) AS debits,coalesce(sum(l.credit)FILTER(WHERE j.posting_date>=@from),0) AS credits FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE l.company_id=@company AND j.posting_date<@to GROUP BY l.account_id),
          rows AS(SELECT a.id,a.code,a.name,a.kind,a.control_kind,a.active,coalesce(s.opening,0) AS opening,coalesce(s.debits,0) AS debits,coalesce(s.credits,0) AS credits,coalesce(s.opening+s.debits-s.credits,0) AS closing FROM accounting.accounts a LEFT JOIN sums s ON s.account_id=a.id WHERE a.company_id=@company),
          totals AS(SELECT coalesce(sum(greatest(opening,0)),0) AS od,coalesce(sum(greatest(-opening,0)),0) AS oc,coalesce(sum(debits),0) AS pd,coalesce(sum(credits),0) AS pc,coalesce(sum(greatest(closing,0)),0) AS cd,coalesce(sum(greatest(-closing,0)),0) AS cc FROM rows)
          SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','snapshotAt',statement_timestamp(),'from',@from,'to',@to,'totals',jsonb_build_object('openingDebit',od::text,'openingCredit',oc::text,'periodDebit',pd::text,'periodCredit',pc::text,'closingDebit',cd::text,'closingCredit',cc::text,'difference',(cd-cc)::text),'status',CASE WHEN od=oc AND pd=pc AND cd=cc THEN 'BALANCED' ELSE 'UNBALANCED' END,'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',r.id,'code',r.code,'name',r.name,'kind',r.kind,'controlKind',r.control_kind,'active',r.active,'openingSigned',r.opening::text,'openingDebit',greatest(r.opening,0)::text,'openingCredit',greatest(-r.opening,0)::text,'periodDebit',r.debits::text,'periodCredit',r.credits::text,'closingSigned',r.closing::text,'closingDebit',greatest(r.closing,0)::text,'closingCredit',greatest(-r.closing,0)::text) ORDER BY r.code,r.id) FROM rows r WHERE @zeros OR r.opening<>0 OR r.debits<>0 OR r.credits<>0),'[]'::jsonb))::text AS result FROM totals
          """,ct,new DbArg("from",from),new DbArg("to",to),new DbArg("zeros",includeZero??false));
    }
}
