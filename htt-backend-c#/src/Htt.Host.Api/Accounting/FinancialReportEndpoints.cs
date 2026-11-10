using Htt.Infrastructure;
using Htt.SharedKernel;
using Htt.Host.Api.MasterData;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Accounting;
internal static class FinancialReportEndpoints
{
    private static async Task<IResult> Query(CompanySession s,string sql,CancellationToken ct,params DbArg[] args)
        =>Results.Content((string)(await One(s,sql,ct,args))["result"]!,"application/json");
    private static void AsOf(DateOnly date)=>Check.That(date.Year>=2,"asOf","A valid inclusive reporting date is required.");
    public static void Map(RouteGroupBuilder g)
    {
        g=g.MapGroup("/accounting/reports").AddEndpointFilter(async(context,next)=>
        {
            if(!Access(context.HttpContext).Has("accounting.ledger.read"))throw new BusinessException("permission_denied","Ledger read permission required.",403);
            return await next(context);
        });
        g.MapGet("/profit-and-loss",ProfitLoss).WithMetadata(new Permission("accounting.reports.read"));
        g.MapGet("/balance-sheet",BalanceSheet).WithMetadata(new Permission("accounting.reports.read"));
        g.MapGet("/receivables-aging",async(DateOnly asOf,Guid? partyId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>await Aging("AR",asOf,partyId,page,pageSize,s,ct)).WithMetadata(new Permission("accounting.reports.read"));
        g.MapGet("/payables-aging",async(DateOnly asOf,Guid? partyId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>await Aging("AP",asOf,partyId,page,pageSize,s,ct)).WithMetadata(new Permission("accounting.reports.read"));
    }
    private static async Task<IResult> ProfitLoss(DateOnly from,DateOnly to,bool? includeZero,CompanySession s,CancellationToken ct)
    {
        Check.That(from!=DateOnly.MinValue&&to>from&&to.DayNumber-from.DayNumber<=366,"to","Use a half-open interval of 1..366 days.");
        return await Query(s,"""
            WITH amounts AS MATERIALIZED(
              SELECT a.id,a.code,a.name,a.kind,a.active,coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date>=@from AND j.posting_date<@to),0) AS signed_profit
              FROM accounting.accounts a LEFT JOIN accounting.journal_lines l ON l.company_id=a.company_id AND l.account_id=a.id LEFT JOIN accounting.business_journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id
              WHERE a.company_id=@company AND a.kind IN('REVENUE','EXPENSE') GROUP BY a.id
            ), totals AS(SELECT coalesce(sum(signed_profit)FILTER(WHERE kind='REVENUE'),0) AS revenue,coalesce(-sum(signed_profit)FILTER(WHERE kind='EXPENSE'),0) AS expenses FROM amounts)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','ACCRUAL_GL','snapshotAt',statement_timestamp(),'from',@from,'to',@to,
              'totals',jsonb_build_object('revenue',revenue::text,'expenses',expenses::text,'netProfit',(revenue-expenses)::text),
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',id,'code',code,'name',name,'kind',kind,'active',active,'amount',(CASE WHEN kind='REVENUE' THEN signed_profit ELSE -signed_profit END)::text)ORDER BY kind DESC,code,id) FROM amounts WHERE @zeros OR signed_profit<>0),'[]'::jsonb))::text AS result FROM totals
            """,ct,new DbArg("from",from),new DbArg("to",to),new DbArg("zeros",includeZero??false));
    }
    private static async Task<IResult> BalanceSheet(DateOnly asOf,DateOnly? fiscalYearStart,bool? includeZero,CompanySession s,CancellationToken ct)
    {
        AsOf(asOf);
        if(fiscalYearStart is{} start)Check.That(start.Year>=2&&start<=asOf&&asOf.DayNumber-start.DayNumber<=365,"fiscalYearStart","Fiscal-year start must be within the preceding year.");
        return await Query(s,"""
            WITH year_start AS(SELECT coalesce(@start,(SELECT starts_on FROM accounting.fiscal_years WHERE company_id=@company AND starts_on<=@date AND ends_on>@date ORDER BY starts_on DESC LIMIT 1),make_date(extract(year FROM @date::date)::int-CASE WHEN extract(month FROM @date::date)<7 THEN 1 ELSE 0 END,7,1)) AS starts_on), amounts AS MATERIALIZED(
              SELECT a.id,a.code,a.name,a.kind,a.control_kind,a.active,coalesce(sum(l.debit-l.credit)FILTER(WHERE j.posting_date<=@date),0) AS signed_balance,
                coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date<(SELECT starts_on FROM year_start)),0) AS prior_profit,
                coalesce(sum(l.credit-l.debit)FILTER(WHERE j.posting_date>=(SELECT starts_on FROM year_start) AND j.posting_date<=@date),0) AS current_profit
              FROM accounting.accounts a LEFT JOIN accounting.journal_lines l ON l.company_id=a.company_id AND l.account_id=a.id LEFT JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id WHERE a.company_id=@company GROUP BY a.id
            ), totals AS(SELECT coalesce(sum(signed_balance)FILTER(WHERE kind='ASSET'),0) AS assets,coalesce(-sum(signed_balance)FILTER(WHERE kind='LIABILITY'),0) AS liabilities,coalesce(-sum(signed_balance)FILTER(WHERE kind='EQUITY'),0) AS posted_equity,
              coalesce(sum(prior_profit)FILTER(WHERE kind IN('REVENUE','EXPENSE')),0) AS prior_earnings,coalesce(sum(current_profit)FILTER(WHERE kind IN('REVENUE','EXPENSE')),0) AS current_earnings FROM amounts)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','ACCRUAL_GL','snapshotAt',statement_timestamp(),'asOf',@date,'fiscalYearStart',(SELECT starts_on FROM year_start),
              'totals',jsonb_build_object('assets',assets::text,'liabilities',liabilities::text,'postedEquity',posted_equity::text,'priorUnclosedEarnings',prior_earnings::text,'currentYearEarnings',current_earnings::text,'equity',(posted_equity+prior_earnings+current_earnings)::text,'liabilitiesAndEquity',(liabilities+posted_equity+prior_earnings+current_earnings)::text,'difference',(assets-liabilities-posted_equity-prior_earnings-current_earnings)::text),
              'status',CASE WHEN assets=liabilities+posted_equity+prior_earnings+current_earnings THEN 'BALANCED' ELSE 'UNBALANCED' END,
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('accountId',id,'code',code,'name',name,'kind',kind,'controlKind',control_kind,'active',active,'amount',(CASE WHEN kind='ASSET' THEN signed_balance ELSE -signed_balance END)::text)ORDER BY kind,code,id) FROM amounts WHERE kind IN('ASSET','LIABILITY','EQUITY') AND(@zeros OR signed_balance<>0)),'[]'::jsonb))::text AS result FROM totals
            """,ct,new DbArg("date",asOf),new DbArg("start",fiscalYearStart,NpgsqlDbType.Date),new DbArg("zeros",includeZero??false));
    }
    private static async Task<IResult> Aging(string side,DateOnly asOf,Guid? partyId,int? page,int? pageSize,CompanySession s,CancellationToken ct)
    {
        AsOf(asOf);var(offset,size)=Page(page,pageSize);
        if(partyId is{} party)await One(s,"SELECT id FROM crm.parties WHERE company_id=@company AND id=@id",ct,new DbArg("id",party));
        return await Query(s,"""
            WITH documents AS MATERIALIZED(
              SELECT i.company_id,'AR'::text AS side,i.id,i.party_id,i.customer_id AS counterparty_id,i.invoice_date,i.due_on,l.id AS line_id FROM sales.invoices i JOIN sales.invoice_lines l ON l.company_id=i.company_id AND l.invoice_id=i.id WHERE i.company_id=@company AND @side='AR'
              UNION ALL
              SELECT b.company_id,'AP',b.id,b.party_id,b.supplier_id,b.invoice_date,b.due_on,l.id FROM purchase.bills b JOIN purchase.bill_lines l ON l.company_id=b.company_id AND l.bill_id=b.id WHERE b.company_id=@company AND @side='AP'
            ), movements AS MATERIALIZED(
              SELECT m.item_line_id,sum(m.amount) AS balance FROM accounting.report_open_item_movements m JOIN accounting.report_control_dates d ON d.company_id=m.company_id AND d.source_document_id=m.source_document_id AND d.side=m.side WHERE m.company_id=@company AND m.side=@side AND d.posting_date<=@date GROUP BY m.item_line_id
            ), items AS MATERIALIZED(
              SELECT d.id,d.party_id,d.counterparty_id,d.invoice_date,d.due_on,sum(greatest(m.balance,0)) AS outstanding,sum(greatest(-m.balance,0)) AS credit,sum(m.balance) AS net
              FROM documents d JOIN movements m ON m.item_line_id=d.line_id WHERE(@party IS NULL OR d.party_id=@party) GROUP BY d.id,d.party_id,d.counterparty_id,d.invoice_date,d.due_on HAVING bool_or(m.balance<>0)
            ), totals AS(
              SELECT count(*) AS count,coalesce(sum(outstanding)FILTER(WHERE due_on>=@date),0) AS current,coalesce(sum(outstanding)FILTER(WHERE @date-due_on BETWEEN 1 AND 30),0) AS d30,coalesce(sum(outstanding)FILTER(WHERE @date-due_on BETWEEN 31 AND 60),0) AS d60,coalesce(sum(outstanding)FILTER(WHERE @date-due_on BETWEEN 61 AND 90),0) AS d90,coalesce(sum(outstanding)FILTER(WHERE @date-due_on>90),0) AS older,coalesce(sum(outstanding),0) AS gross,coalesce(sum(credit),0) AS credits,coalesce(sum(net),0) AS net FROM items
            ), control AS(
              SELECT coalesce(sum(CASE WHEN @side='AR' THEN l.debit-l.credit ELSE l.credit-l.debit END),0) AS balance FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND a.control_kind=@side AND j.posting_date<=@date AND(@party IS NULL OR l.party_id=@party)
            ), paged AS(SELECT i.*,p.legal_name,d.number FROM items i JOIN crm.parties p ON p.company_id=@company AND p.id=i.party_id JOIN platform.documents d ON d.company_id=@company AND d.id=i.id ORDER BY i.due_on,i.id LIMIT @size OFFSET @offset)
            SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD','basis','POSTING_DATE','snapshotAt',statement_timestamp(),'asOf',@date,'side',@side,'partyId',@party,'page',@page,'pageSize',@size,'totalCount',t.count,
              'totals',jsonb_build_object('current',t.current::text,'days1To30',t.d30::text,'days31To60',t.d60::text,'days61To90',t.d90::text,'daysOver90',t.older::text,'outstanding',t.gross::text,'availableCredit',t.credits::text,'netBalance',t.net::text,'controlBalance',c.balance::text,'difference',(t.net-c.balance)::text),
              'status',CASE WHEN t.net=c.balance THEN 'RECONCILED' ELSE 'UNRECONCILED' END,
              'items',coalesce((SELECT jsonb_agg(jsonb_build_object('documentId',id,'number',number,'partyId',party_id,'counterpartyId',counterparty_id,'partyName',legal_name,'invoiceDate',invoice_date,'dueOn',due_on,'daysOverdue',greatest(@date-due_on,0),'bucket',CASE WHEN due_on>=@date THEN 'CURRENT' WHEN @date-due_on<=30 THEN '1_30' WHEN @date-due_on<=60 THEN '31_60' WHEN @date-due_on<=90 THEN '61_90' ELSE 'OVER_90' END,'outstanding',outstanding::text,'availableCredit',credit::text,'netBalance',net::text)ORDER BY due_on,id) FROM paged),'[]'::jsonb))::text AS result FROM totals t CROSS JOIN control c
            """,ct,new DbArg("side",side),new DbArg("date",asOf),new DbArg("party",partyId,NpgsqlDbType.Uuid),new DbArg("page",page??1),new DbArg("size",size),new DbArg("offset",offset));
    }
}
