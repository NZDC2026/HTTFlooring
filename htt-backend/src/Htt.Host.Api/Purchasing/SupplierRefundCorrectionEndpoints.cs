using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record SupplierRefundReversalInput(string Reference,string Reason);
public sealed record SupplierRefundCorrectionInput(string Reference,string Reason,decimal Amount,Guid? CreditLineId=null,Guid? AdvanceId=null);
public sealed record SupplierRefundAtomicCorrectionInput(string ReversalReference,string Reference,string Reason,decimal Amount,Guid? CreditLineId=null,Guid? AdvanceId=null);
internal static class SupplierRefundCorrectionEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/supplier-refunds/{id:guid}/reverse",Reverse).WithMetadata(new Permission("purchase.refunds.reverse"));
        g.MapPost("/supplier-refunds/{id:guid}/correct",async(Guid id,SupplierRefundAtomicCorrectionInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,new(input.Reference,input.Reason,input.Amount,input.CreditLineId,input.AdvanceId),input.ReversalReference,h,s,idem,ct)).WithMetadata(new Permission("purchase.refunds.correct"));
        g.MapPost("/supplier-refund-reversals/{id:guid}/correct",async(Guid id,SupplierRefundCorrectionInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,input,null,h,s,idem,ct)).WithMetadata(new Permission("purchase.refunds.correct"));
        g.MapGet("/supplier-refund-reversals/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,h,s,ct))).WithMetadata(new Permission("purchase.refunds.read"));
    }
    private static void ReadAccess(HttpContext h,bool correct=false,bool atomic=false)
    {
        var a=Access(h);if(!a.Has("purchase.refunds.read")||!a.Has("purchase.bills.read")||(correct&&!a.Has("purchase.refunds.post"))||(atomic&&!a.Has("purchase.refunds.reverse")))throw new BusinessException("permission_denied","Refund correction requires refund/bill access and the applicable write/reversal authority.",403);
    }
    private static async Task<Guid> Source(Guid id,bool reversal,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var row=await One(s,reversal?"SELECT supplier_id FROM accounting.supplier_refund_reversals WHERE company_id=@company AND id=@id":"SELECT supplier_id FROM accounting.supplier_refunds WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var supplier=(Guid)row["supplier_id"]!;return supplier;
    }
    private static async Task<IResult> Reverse(Guid id,SupplierRefundReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await Source(id,false,h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var response=await idem.ExecuteAsync($"POST /supplier-refunds/{id}/reverse",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var r=await One(s,"SELECT purchase.reverse_supplier_refund(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)r["id"]!;await Sql.AuditAsync(s,"purchase.supplier_refund_reversed","supplier_refund_reversal",doc,h.TraceIdentifier,ct,new{refundId=id,reference});return ApiJson.Stored(await View(doc,h,s,ct));
        },ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Correct(Guid id,SupplierRefundCorrectionInput input,string? reversalReference,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var atomic=reversalReference is not null;ReadAccess(h,true,atomic);var supplier=await Source(id,!atomic,h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);var revReference=atomic?Check.Text(reversalReference!,"reversalReference",200):null;Check.Amount(input.Amount,"amount",2);Check.That(input.Amount>0&&(input.CreditLineId is null)!=(input.AdvanceId is null)&&input.CreditLineId!=Guid.Empty&&input.AdvanceId!=Guid.Empty,"source","Choose exactly one source and positive cents.");
        if(input.CreditLineId is { } cl)await One(s,"SELECT cl.id FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes i ON i.company_id=cl.company_id AND i.id=cl.credit_note_id WHERE cl.company_id=@company AND cl.id=@id AND i.supplier_id=@supplier",ct,new DbArg("id",cl),new DbArg("supplier",supplier));
        else await One(s,"SELECT a.id FROM accounting.supplier_advances a WHERE a.company_id=@company AND a.id=@id AND a.supplier_id=@supplier",ct,new DbArg("id",input.AdvanceId),new DbArg("supplier",supplier));
        var route=atomic?$"POST /supplier-refunds/{id}/correct":$"POST /supplier-refund-reversals/{id}/correct";
        var response=await idem.ExecuteAsync(route,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,revReference,input.Amount,input.CreditLineId,input.AdvanceId}),async()=>
        {
            var args=new List<DbArg>{new("id",id),new("reference",reference),new("reason",reason),new("credit",input.CreditLineId,NpgsqlDbType.Uuid),new("advance",input.AdvanceId,NpgsqlDbType.Uuid),new("amount",input.Amount)};if(atomic)args.Add(new("revReference",revReference!));var r=await One(s,atomic?"SELECT purchase.correct_supplier_refund(@id,@revReference,@credit,@advance,@amount,@reference,@reason) AS id":"SELECT purchase.replace_supplier_refund(@id,@credit,@advance,@amount,@reference,@reason) AS id",ct,args.ToArray());var doc=(Guid)r["id"]!;var link=await One(s,"SELECT reversal_id FROM accounting.supplier_refund_corrections WHERE company_id=@company AND id=@id",ct,new DbArg("id",doc));var reversal=(Guid)link["reversal_id"]!;
            if(atomic)await Sql.AuditAsync(s,"purchase.supplier_refund_reversed","supplier_refund_reversal",reversal,h.TraceIdentifier,ct,new{refundId=id,reference=revReference});await Sql.AuditAsync(s,"purchase.supplier_refund_corrected","supplier_refund",doc,h.TraceIdentifier,ct,new{reversalId=reversal,reference,input.Amount});return ApiJson.Stored(new{refund=await PurchaseReturnEndpoints.RefundData(doc,s,ct),reversalId=reversal});
        },ct);return ApiJson.Result(response);
    }
    private static async Task<object> View(Guid id,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var r=await One(s,"SELECT v.*,d.number,d.state,d.business_date::text,x.id AS replacement_refund_id FROM accounting.supplier_refund_reversals v JOIN platform.documents d ON d.company_id=v.company_id AND d.id=v.id LEFT JOIN accounting.supplier_refund_corrections x ON x.company_id=v.company_id AND x.reversal_id=v.id WHERE v.company_id=@company AND v.id=@id",ct,new DbArg("id",id));var gst=(await Read(s,"SELECT bill_line_id,amount,gst_amount,gst_basis,adjustment_date::text FROM accounting.purchase_gst_adjustments WHERE company_id=@company AND refund_reversal_id=@id ORDER BY bill_line_id",ct,new DbArg("id",id))).Select(PublicRow);return new{reversal=PublicRow(r),gstAdjustments=gst};
    }
}
