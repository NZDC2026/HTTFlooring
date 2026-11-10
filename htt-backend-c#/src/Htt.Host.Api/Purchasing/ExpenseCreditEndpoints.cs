using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record ExpenseCreditLineInput(Guid BillLineId,decimal? Amount);
public sealed record SupplierAmountCreditLine(Guid BillLineId,decimal Net,decimal Tax,string Description);
public sealed record SupplierAmountCreditInput(string Reference,string Reason,IReadOnlyList<SupplierAmountCreditLine>? Lines);
public sealed record ExpenseCreditInput(string Reference,string Reason,IReadOnlyList<ExpenseCreditLineInput>? Lines);

internal static class ExpenseCreditEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/supplier-bills/{id:guid}/amount-credits",Amount).WithMetadata(new Permission("purchase.credits.adjust"));
        g.MapPost("/supplier-expense-bills/{id:guid}/credits",Post).WithMetadata(new Permission("purchase.expense_credits.post"));
    }
    private static async Task<IResult> Amount(Guid id,SupplierAmountCreditInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        if(!Access(h).Has("purchase.bills.read")||!Access(h).Has("purchase.credits.read"))throw new Htt.SharedKernel.BusinessException("permission_denied","Bill and credit read access required.",403);
        await One(s,"SELECT id FROM purchase.bills WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        Check.That(input.Lines is{Count:>=1 and <=50}&&input.Lines.All(x=>x is not null&&x.BillLineId!=Guid.Empty)&&input.Lines.Select(x=>x.BillLineId).Distinct().Count()==input.Lines.Count,"lines","Distinct bill lines required.");
        foreach(var l in input.Lines!){Check.Amount(l.Net,"net",2);Check.Amount(l.Tax,"tax",2);Check.That(l.Net+l.Tax>0,"amount","Positive gross required.");}
        var lines=input.Lines!.Select(x=>x with{Description=Check.Text(x.Description,"description",500)}).OrderBy(x=>x.BillLineId).ToArray();
        var result=await idem.ExecuteAsync($"POST /supplier-bills/{id}/amount-credits",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>{var row=await One(s,"SELECT purchase.post_amount_credit(@id,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var doc=(Guid)row["id"]!;await Sql.AuditAsync(s,"purchase.amount_credit_posted","supplier_credit",doc,h.TraceIdentifier,ct,new{billId=id,reference,reason});return ApiJson.Stored(await PurchaseReturnEndpoints.CreditView(doc,s,ct));},ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Post(Guid id,ExpenseCreditInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        if(!Access(h).Has("purchase.bills.read") || !Access(h).Has("purchase.credits.read"))throw new Htt.SharedKernel.BusinessException("permission_denied","Expense credit posting requires bill and credit reading permission.",403);
        await One(s,"SELECT id FROM purchase.bills WHERE company_id=@company AND id=@id AND bill_type='EXPENSE'",ct,new DbArg("id",id));
        var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.BillLineId!=Guid.Empty && x.Amount is not null) && input.Lines.Select(x=>x.BillLineId).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct expense bill lines and explicit gross credit amounts.");
        var lines=input.Lines!.OrderBy(x=>x.BillLineId).ToArray();foreach(var l in lines)Check.Amount(l.Amount!.Value,"amount",2);
        var result=await idem.ExecuteAsync($"POST /supplier-expense-bills/{id}/credits",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT purchase.post_expense_credit(@bill,@reference,@reason,@lines) AS id",ct,new DbArg("bill",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var cid=(Guid)row["id"]!;
            await Sql.AuditAsync(s,"purchase.supplier_credited","supplier_credit",cid,h.TraceIdentifier,ct,new{billId=id,reference,creditType="EXPENSE"});return ApiJson.Stored(await PurchaseReturnEndpoints.CreditView(cid,s,ct));
        },ct);return ApiJson.Result(result);
    }
}
