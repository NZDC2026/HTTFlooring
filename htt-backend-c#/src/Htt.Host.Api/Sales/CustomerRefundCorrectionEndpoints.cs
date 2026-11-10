using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record CustomerRefundReversalInput(string Reference,string Reason);
public sealed record CustomerRefundCorrectionInput(string Reference,string Reason,decimal Amount,Guid? CreditLineId=null,Guid? AdvanceId=null,bool CancelOrder=false);
public sealed record CustomerRefundAtomicCorrectionInput(string ReversalReference,string Reference,string Reason,decimal Amount,Guid? CreditLineId=null,Guid? AdvanceId=null,bool CancelOrder=false);
internal static class CustomerRefundCorrectionEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/customer-refunds/{id:guid}/reverse",Reverse).WithMetadata(new Permission("accounting.refunds.reverse"));
        g.MapPost("/customer-refunds/{id:guid}/correct",async(Guid id,CustomerRefundAtomicCorrectionInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,new(input.Reference,input.Reason,input.Amount,input.CreditLineId,input.AdvanceId,input.CancelOrder),input.ReversalReference,h,s,idem,ct)).WithMetadata(new Permission("accounting.refunds.correct"));
        g.MapPost("/customer-refund-reversals/{id:guid}/correct",async(Guid id,CustomerRefundCorrectionInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,input,null,h,s,idem,ct)).WithMetadata(new Permission("accounting.refunds.correct"));
        g.MapGet("/customer-refund-reversals/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,h,s,ct))).WithMetadata(new Permission("accounting.refunds.read"));
    }
    private static void ReadAccess(HttpContext h,bool correct=false,bool atomic=false)
    {
        var a=Access(h);if(!a.Has("accounting.refunds.read")||!a.Has("accounting.receivables.read")||(correct&&!a.Has("accounting.refunds.write"))||(atomic&&!a.Has("accounting.refunds.reverse")))throw new BusinessException("permission_denied","Refund correction requires refund/receivable access and the applicable write/reversal authority.",403);
    }
    private static async Task<Guid> Source(Guid id,bool reversal,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var row=await One(s,reversal?"SELECT customer_id FROM accounting.customer_refund_reversals WHERE company_id=@company AND id=@id":"SELECT customer_id FROM accounting.customer_refunds WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var customer=(Guid)row["customer_id"]!;await Customer(h,s,customer,ct);return customer;
    }
    private static async Task<IResult> Reverse(Guid id,CustomerRefundReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await Source(id,false,h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var response=await idem.ExecuteAsync($"POST /customer-refunds/{id}/reverse",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var r=await One(s,"SELECT accounting.reverse_customer_refund(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)r["id"]!;await Sql.AuditAsync(s,"accounting.customer_refund_reversed","customer_refund_reversal",doc,h.TraceIdentifier,ct,new{refundId=id,reference});return ApiJson.Stored(await View(doc,h,s,ct));
        },ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Correct(Guid id,CustomerRefundCorrectionInput input,string? reversalReference,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var atomic=reversalReference is not null;ReadAccess(h,true,atomic);var customer=await Source(id,!atomic,h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);var revReference=atomic?Check.Text(reversalReference!,"reversalReference",200):null;Check.Amount(input.Amount,"amount",2);Check.That(input.Amount>0&&(input.CreditLineId is null)!=(input.AdvanceId is null)&&input.CreditLineId!=Guid.Empty&&input.AdvanceId!=Guid.Empty,"source","Choose exactly one source and positive cents.");
        if(input.CreditLineId is { } cl)await One(s,"SELECT cl.id FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE cl.company_id=@company AND cl.id=@id AND i.customer_id=@customer",ct,new DbArg("id",cl),new DbArg("customer",customer));
        else await One(s,"SELECT a.id FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=@company AND a.id=@id AND r.customer_id=@customer",ct,new DbArg("id",input.AdvanceId),new DbArg("customer",customer));
        var route=atomic?$"POST /customer-refunds/{id}/correct":$"POST /customer-refund-reversals/{id}/correct";
        var response=await idem.ExecuteAsync(route,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,revReference,input.Amount,input.CreditLineId,input.AdvanceId,input.CancelOrder}),async()=>
        {
            var args=new List<DbArg>{new("id",id),new("reference",reference),new("reason",reason),new("credit",input.CreditLineId,NpgsqlDbType.Uuid),new("advance",input.AdvanceId,NpgsqlDbType.Uuid),new("amount",input.Amount),new("cancel",input.CancelOrder)};if(atomic)args.Add(new("revReference",revReference!));var r=await One(s,atomic?"SELECT accounting.correct_customer_refund(@id,@revReference,@credit,@advance,@amount,@reference,@reason,@cancel) AS id":"SELECT accounting.replace_customer_refund(@id,@credit,@advance,@amount,@reference,@reason,@cancel) AS id",ct,args.ToArray());var doc=(Guid)r["id"]!;var link=await One(s,"SELECT reversal_id FROM accounting.customer_refund_corrections WHERE company_id=@company AND id=@id",ct,new DbArg("id",doc));var reversal=(Guid)link["reversal_id"]!;
            if(atomic)await Sql.AuditAsync(s,"accounting.customer_refund_reversed","customer_refund_reversal",reversal,h.TraceIdentifier,ct,new{refundId=id,reference=revReference});await Sql.AuditAsync(s,"accounting.customer_refund_corrected","customer_refund",doc,h.TraceIdentifier,ct,new{reversalId=reversal,reference,input.Amount});return ApiJson.Stored(new{refund=await ReturnEndpoints.RefundView(h,s,doc,ct),reversalId=reversal});
        },ct);return ApiJson.Result(response);
    }
    private static async Task<object> View(Guid id,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var r=await One(s,"SELECT v.*,d.number,d.state,d.business_date::text,x.id AS replacement_refund_id FROM accounting.customer_refund_reversals v JOIN platform.documents d ON d.company_id=v.company_id AND d.id=v.id LEFT JOIN accounting.customer_refund_corrections x ON x.company_id=v.company_id AND x.reversal_id=v.id WHERE v.company_id=@company AND v.id=@id",ct,new DbArg("id",id));await Customer(h,s,(Guid)r["customer_id"]!,ct);var gst=(await Read(s,"SELECT invoice_line_id,advance_id,amount,gst_amount,gst_basis,adjustment_date::text FROM accounting.gst_adjustments WHERE company_id=@company AND refund_reversal_id=@id ORDER BY invoice_line_id,advance_id",ct,new DbArg("id",id))).Select(PublicRow);return new{reversal=PublicRow(r),gstAdjustments=gst};
    }
}
