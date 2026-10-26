using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record SupplierSettlementReversalInput(string Reference,string Reason);
public sealed record SupplierPaymentReapplicationInput(string Reference,string Reason,decimal AdvanceAmount=0,IReadOnlyList<SupplierPaymentAllocation>? Allocations=null);
public sealed record SupplierPaymentReallocationInput(string ReversalReference,string Reference,string Reason,decimal AdvanceAmount=0,IReadOnlyList<SupplierPaymentAllocation>? Allocations=null);
internal static class SupplierSettlementReversalEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/supplier-payments/{id:guid}/reverse",async(Guid id,SupplierSettlementReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,input,false,h,s,idem,ct)).WithMetadata(new Permission("purchase.payments.reverse"));
        g.MapPost("/supplier-advance-applications/{id:guid}/unapply",async(Guid id,SupplierSettlementReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Correct(id,input,true,h,s,idem,ct)).WithMetadata(new Permission("purchase.advances.unapply"));
        g.MapPost("/supplier-payment-reversals/{id:guid}/reapply",async(Guid id,SupplierPaymentReapplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Reapply(id,input,null,h,s,idem,ct)).WithMetadata(new Permission("purchase.payments.reapply"));
        g.MapPost("/supplier-payments/{id:guid}/reallocate",async(Guid id,SupplierPaymentReallocationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Reapply(id,new(input.Reference,input.Reason,input.AdvanceAmount,input.Allocations),input.ReversalReference,h,s,idem,ct)).WithMetadata(new Permission("purchase.payments.reverse"));
        g.MapGet("/supplier-payment-reversals/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,false,s,ct))).WithMetadata(new Permission("purchase.payments.read"));
        g.MapGet("/supplier-advance-unapplications/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,true,s,ct))).WithMetadata(new Permission("purchase.payments.read"));
    }
    private static void ReadAccess(HttpContext h,bool reapply=false)
    {
        var a=Access(h);if(!a.Has("purchase.payments.read")||!a.Has("purchase.bills.read")||(reapply&&(!a.Has("purchase.payments.reapply")||!a.Has("purchase.payments.post"))))throw new BusinessException("permission_denied","Supplier correction requires payment and bill access, with reapplication authority when applicable.",403);
    }
    private static async Task<IResult> Correct(Guid id,SupplierSettlementReversalInput input,bool undo,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await One(s,undo?"SELECT id FROM accounting.supplier_advance_applications WHERE company_id=@company AND id=@id":"SELECT id FROM accounting.supplier_payments WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);var route=undo?$"POST /supplier-advance-applications/{id}/unapply":$"POST /supplier-payments/{id}/reverse";
        var result=await idem.ExecuteAsync(route,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var row=await One(s,undo?"SELECT purchase.unapply_supplier_advance(@id,@reference,@reason) AS id":"SELECT purchase.reverse_supplier_payment(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)row["id"]!;await Sql.AuditAsync(s,undo?"purchase.supplier_advance_unapplied":"purchase.supplier_payment_reversed",undo?"supplier_advance_unapplication":"supplier_payment_reversal",doc,h.TraceIdentifier,ct,new{sourceId=id,reference});return ApiJson.Stored(await View(doc,undo,s,ct));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Reapply(Guid id,SupplierPaymentReapplicationInput input,string? reversalReference,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h,true);var atomic=reversalReference is not null;await One(s,atomic?"SELECT id FROM accounting.supplier_payments WHERE company_id=@company AND id=@id":"SELECT id FROM accounting.supplier_payment_reversals WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);var reversal=atomic?Check.Text(reversalReference!,"reversalReference",200):null;var lines=SupplierPaymentEndpoints.Normalize(input.Allocations,false);Check.Amount(input.AdvanceAmount,"advanceAmount",2);var route=atomic?$"POST /supplier-payments/{id}/reallocate":$"POST /supplier-payment-reversals/{id}/reapply";
        var result=await idem.ExecuteAsync(route,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,reversalReference=reversal,input.AdvanceAmount,allocations=lines}),async()=>
        {
            var args=new List<DbArg>{new("id",id),new("reference",reference),new("reason",reason),new("advance",input.AdvanceAmount),new("lines",Json(lines),NpgsqlDbType.Jsonb)};if(atomic)args.Add(new("reversal",reversal!));var row=await One(s,atomic?"SELECT purchase.reallocate_supplier_payment(@id,@reversal,@reference,@reason,@advance,@lines) AS id":"SELECT purchase.reapply_supplier_payment(@id,@reference,@reason,@advance,@lines) AS id",ct,args.ToArray());var doc=(Guid)row["id"]!;var relation=await One(s,"SELECT reversal_id FROM accounting.supplier_payment_reapplications WHERE company_id=@company AND id=@id",ct,new DbArg("id",doc));var reversed=(Guid)relation["reversal_id"]!;
            if(atomic)await Sql.AuditAsync(s,"purchase.supplier_payment_reversed","supplier_payment_reversal",reversed,h.TraceIdentifier,ct,new{paymentId=id,reference=reversal});await Sql.AuditAsync(s,"purchase.supplier_payment_reapplied","supplier_payment",doc,h.TraceIdentifier,ct,new{reversalId=reversed,reference});return ApiJson.Stored(await SupplierPaymentEndpoints.PaymentView(doc,s,ct,reversed));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> View(Guid id,bool undo,CompanySession s,CancellationToken ct)
    {
        var header=await One(s,undo?"SELECT x.*,d.number,d.state,d.business_date::text FROM accounting.supplier_advance_unapplications x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id WHERE x.company_id=@company AND x.id=@id":"SELECT x.*,d.number,d.state,d.business_date::text,p.id AS replacement_payment_id FROM accounting.supplier_payment_reversals x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id LEFT JOIN accounting.supplier_payment_reapplications p ON p.company_id=x.company_id AND p.reversal_id=x.id WHERE x.company_id=@company AND x.id=@id",ct,new DbArg("id",id));var source=(Guid)header[undo?"application_id":"payment_id"]!;var lines=(await Read(s,"SELECT bill_line_id,amount,gst_amount,payment_id,advance_id FROM accounting.supplier_payment_allocations WHERE company_id=@company AND source_document_id=@id ORDER BY bill_line_id",ct,new DbArg("id",source))).Select(PublicRow);var gst=(await Read(s,"SELECT bill_line_id,amount,gst_amount,gst_basis,adjustment_date::text,kind FROM accounting.purchase_gst_adjustments WHERE company_id=@company AND settlement_reversal_id=@id ORDER BY bill_line_id",ct,new DbArg("id",id))).Select(PublicRow);return undo?(object)new{unapplication=PublicRow(header),allocations=lines,gstAdjustments=gst}:new{reversal=PublicRow(header),allocations=lines,gstAdjustments=gst};
    }
}
