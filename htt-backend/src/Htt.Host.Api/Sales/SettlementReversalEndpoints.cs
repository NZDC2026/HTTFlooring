using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record SettlementReversalInput(string Reference,string Reason);
public sealed record ReceiptReapplicationInput(string Reference,string Reason,IReadOnlyList<ReceiptAllocationInput>? Allocations=null,IReadOnlyList<ReceiptAdvanceInput>? Advances=null);
public sealed record ReceiptReallocationInput(string ReversalReference,string Reference,string Reason,IReadOnlyList<ReceiptAllocationInput>? Allocations=null,IReadOnlyList<ReceiptAdvanceInput>? Advances=null);
internal static class SettlementReversalEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/customer-receipts/{id:guid}/reverse",Reverse).WithMetadata(new Permission("accounting.receipts.reverse"));
        g.MapPost("/receipt-reversals/{id:guid}/reapply",Reapply).WithMetadata(new Permission("accounting.receipts.reapply"));
        g.MapPost("/customer-receipts/{id:guid}/reallocate",Reallocate).WithMetadata(new Permission("accounting.receipts.reverse"));
        g.MapPost("/advance-applications/{id:guid}/unapply",Unapply).WithMetadata(new Permission("accounting.advances.unapply"));
        g.MapGet("/receipt-reversals/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,false,h,s,ct))).WithMetadata(new Permission("accounting.receipts.read"));
        g.MapGet("/advance-unapplications/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,true,h,s,ct))).WithMetadata(new Permission("accounting.receipts.read"));
    }
    private static void ReadAccess(HttpContext h,bool reapply=false)
    {
        var a=Access(h);if(!a.Has("accounting.receipts.read")||!a.Has("accounting.receivables.read")||(reapply&&(!a.Has("accounting.receipts.reapply")||!a.Has("accounting.receipts.write"))))throw new BusinessException("permission_denied","Settlement correction requires receipt and receivable access, and reapplication authority when applicable.",403);
    }
    private static async Task<Dictionary<string,object?>> Source(Guid id,string source,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var sql=source switch{"receipt"=>"SELECT id,customer_id FROM accounting.customer_receipts WHERE company_id=@company AND id=@id","reversal"=>"SELECT receipt_id AS id,customer_id FROM accounting.receipt_reversals WHERE company_id=@company AND id=@id",_=>"SELECT r.id,r.customer_id FROM accounting.advance_applications a JOIN accounting.customer_advances ad ON ad.company_id=a.company_id AND ad.id=a.advance_id JOIN accounting.customer_receipts r ON r.company_id=ad.company_id AND r.id=ad.receipt_id WHERE a.company_id=@company AND a.id=@id"};var row=await One(s,sql,ct,new DbArg("id",id));await Customer(h,s,(Guid)row["customer_id"]!,ct);return row;
    }
    private static (ReceiptAllocationInput[] Allocations,ReceiptAdvanceInput[] Advances) Lines(IReadOnlyList<ReceiptAllocationInput>? allocations,IReadOnlyList<ReceiptAdvanceInput>? advances)
    {
        var lines=ReceiptEndpoints.Allocations(allocations,false);advances??=[];Check.That(advances.Count<=50&&advances.All(x=>x is not null&&x.OrderLineId!=Guid.Empty)&&advances.Select(x=>x.OrderLineId).Distinct().Count()==advances.Count,"advances","Supply up to 50 distinct order lines.");foreach(var x in advances){Check.Amount(x.Amount,"amount",2);Check.That(x.Amount>0,"amount","Advance must be positive.");}return(lines,advances.OrderBy(x=>x.OrderLineId).ToArray());
    }
    private static async Task<IResult> Reverse(Guid id,SettlementReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await Source(id,"receipt",h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var response=await idem.ExecuteAsync($"POST /customer-receipts/{id}/reverse",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var row=await One(s,"SELECT accounting.reverse_receipt(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)row["id"]!;await Sql.AuditAsync(s,"accounting.customer_receipt_reversed","receipt_reversal",doc,h.TraceIdentifier,ct,new{receiptId=id,reference});return ApiJson.Stored(await View(doc,false,h,s,ct));
        },ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Unapply(Guid id,SettlementReversalInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await Source(id,"application",h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var response=await idem.ExecuteAsync($"POST /advance-applications/{id}/unapply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var row=await One(s,"SELECT accounting.unapply_advance(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)row["id"]!;await Sql.AuditAsync(s,"accounting.advance_unapplied","advance_unapplication",doc,h.TraceIdentifier,ct,new{applicationId=id,reference});return ApiJson.Stored(await View(doc,true,h,s,ct));
        },ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Reapply(Guid id,ReceiptReapplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h,true);await Source(id,"reversal",h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);var lines=Lines(input.Allocations,input.Advances);
        var response=await idem.ExecuteAsync($"POST /receipt-reversals/{id}/reapply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines.Allocations,lines.Advances}),async()=>
        {
            var row=await One(s,"SELECT accounting.reapply_receipt(@id,@reference,@reason,@items,@advances) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("items",Json(lines.Allocations),NpgsqlDbType.Jsonb),new DbArg("advances",Json(lines.Advances),NpgsqlDbType.Jsonb));var doc=(Guid)row["id"]!;await Sql.AuditAsync(s,"accounting.customer_receipt_reapplied","customer_receipt",doc,h.TraceIdentifier,ct,new{reversalId=id,reference});return ApiJson.Stored(new{receipt=await ReceiptEndpoints.ReceiptView(h,s,doc,ct),reversalId=id});
        },ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Reallocate(Guid id,ReceiptReallocationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h,true);await Source(id,"receipt",h,s,ct);var reference=Check.Text(input.Reference,"reference",200);var reversalReference=Check.Text(input.ReversalReference,"reversalReference",200);var reason=Check.Text(input.Reason,"reason",2000);var lines=Lines(input.Allocations,input.Advances);
        var response=await idem.ExecuteAsync($"POST /customer-receipts/{id}/reallocate",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reversalReference,reference,reason,lines.Allocations,lines.Advances}),async()=>
        {
            var row=await One(s,"SELECT accounting.reallocate_receipt(@id,@reversal,@reference,@reason,@items,@advances) AS id",ct,new DbArg("id",id),new DbArg("reversal",reversalReference),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("items",Json(lines.Allocations),NpgsqlDbType.Jsonb),new DbArg("advances",Json(lines.Advances),NpgsqlDbType.Jsonb));var doc=(Guid)row["id"]!;var relation=await One(s,"SELECT reversal_id FROM accounting.receipt_reapplications WHERE company_id=@company AND id=@id",ct,new DbArg("id",doc));var reversal=(Guid)relation["reversal_id"]!;await Sql.AuditAsync(s,"accounting.customer_receipt_reversed","receipt_reversal",reversal,h.TraceIdentifier,ct,new{receiptId=id,reference=reversalReference});await Sql.AuditAsync(s,"accounting.customer_receipt_reapplied","customer_receipt",doc,h.TraceIdentifier,ct,new{reversalId=reversal,reference});return ApiJson.Stored(new{receipt=await ReceiptEndpoints.ReceiptView(h,s,doc,ct),reversalId=reversal});
        },ct);return ApiJson.Result(response);
    }
    private static async Task<object> View(Guid id,bool undo,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var sql=undo?"SELECT x.*,d.number,d.state,d.business_date::text FROM accounting.advance_unapplications x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id WHERE x.company_id=@company AND x.id=@id":"SELECT x.*,d.number,d.state,d.business_date::text,p.id AS replacement_receipt_id FROM accounting.receipt_reversals x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id LEFT JOIN accounting.receipt_reapplications p ON p.company_id=x.company_id AND p.reversal_id=x.id WHERE x.company_id=@company AND x.id=@id";var header=await One(s,sql,ct,new DbArg("id",id));await Customer(h,s,(Guid)header["customer_id"]!,ct);var original=(Guid)header[undo?"application_id":"receipt_id"]!;var allocations=(await Read(s,"SELECT invoice_line_id,amount,gst_amount,receipt_id,advance_id FROM accounting.payment_allocations WHERE company_id=@company AND source_document_id=@id ORDER BY invoice_line_id",ct,new DbArg("id",original))).Select(PublicRow);var gst=(await Read(s,"SELECT invoice_line_id,advance_id,amount,gst_amount,gst_basis,adjustment_date::text,kind FROM accounting.gst_adjustments WHERE company_id=@company AND settlement_reversal_id=@id ORDER BY invoice_line_id,advance_id",ct,new DbArg("id",id))).Select(PublicRow);return undo?(object)new{unapplication=PublicRow(header),allocations,gstAdjustments=gst}:new{reversal=PublicRow(header),allocations,gstAdjustments=gst};
    }
}
