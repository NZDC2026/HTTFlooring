using Htt.Host.Api.Accounting;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record PurchaseReturnLineInput(Guid ReceiptLineId,decimal Quantity,Guid? BillLineId=null);
public sealed record PurchaseReturnInput(string Reference,string Reason,IReadOnlyList<PurchaseReturnLineInput>? Lines);
public sealed record SupplierCreditLineInput(Guid ReturnLineId,decimal Quantity);
public sealed record SupplierCreditInput(string Reference,string Reason,IReadOnlyList<SupplierCreditLineInput>? Lines);
public sealed record SupplierRefundInput(decimal Amount,string Reference,string Reason,Guid? CreditLineId=null,Guid? AdvanceId=null,DateOnly? ReceivedOn=null,Guid? BankAccountId=null);

internal static class PurchaseReturnEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        ExpenseCreditEndpoints.Map(g);
        SupplierRefundCorrectionEndpoints.Map(g);
        CreditApplicationEndpoints.Map(g);
        g.MapPost("/purchase-receipts/{id:guid}/returns",Return).WithMetadata(new Permission("purchase.returns.post"));
        g.MapGet("/purchase-returns/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await ReturnView(id,h,s,ct,false))).WithMetadata(new Permission("purchase.returns.read"));
        g.MapGet("/accounting/purchase-returns/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await ReturnView(id,h,s,ct,true))).WithMetadata(new Permission("purchase.credits.read"));
        g.MapGet("/warehouse/purchase-receipts/{id:guid}/return-sources",async(Guid id,CompanySession s,CancellationToken ct)=>
        {
            var r=await One(s,"SELECT warehouse_id FROM purchase.receipts WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));await Read(s,"SELECT inventory.require_access('purchase.returns.read',@warehouse)",ct,new DbArg("warehouse",r["warehouse_id"]));
            return Results.Ok(new{items=(await Read(s,"""
                SELECT rl.id AS receipt_line_id,bl.id AS bill_line_id,bl.quantity-coalesce((SELECT sum(quantity) FROM purchase.return_lines WHERE company_id=bl.company_id AND bill_line_id=bl.id),0) AS available_quantity
                FROM purchase.receipt_lines rl JOIN purchase.bill_lines bl ON bl.company_id=rl.company_id AND bl.receipt_line_id=rl.id WHERE rl.company_id=@company AND rl.receipt_id=@id
                UNION ALL SELECT rl.id,NULL::uuid,rl.quantity-coalesce((SELECT sum(quantity) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id),0)-coalesce((SELECT sum(quantity) FROM purchase.return_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id AND bill_line_id IS NULL),0) FROM purchase.receipt_lines rl WHERE rl.company_id=@company AND rl.receipt_id=@id
                """,ct,new DbArg("id",id))).Select(PublicRow)});
        }).WithMetadata(new Permission("purchase.returns.read"));
        g.MapPost("/supplier-bills/{id:guid}/credits",Credit).WithMetadata(new Permission("purchase.credits.post"));
        g.MapGet("/supplier-credits/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await CreditView(id,s,ct))).WithMetadata(new Permission("purchase.credits.read"));
        g.MapGet("/supplier-credits",async(Guid? supplierId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT cn.id,cn.bill_id,cn.supplier_id,cn.reference,cn.net,cn.tax,cn.gross,cn.credit_type,cn.expense_amount,d.number,d.business_date::text FROM purchase.supplier_credit_notes cn JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=@company AND (@supplier IS NULL OR cn.supplier_id=@supplier) ORDER BY cn.created_at DESC,cn.id LIMIT @size OFFSET @offset",ct,new DbArg("supplier",supplierId,NpgsqlDbType.Uuid),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.credits.read"));
        g.MapPost("/supplier-refunds",Refund).WithMetadata(new Permission("purchase.refunds.post"));
        g.MapGet("/supplier-refunds/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await RefundView(id,s,ct))).WithMetadata(new Permission("purchase.refunds.read"));
        g.MapGet("/supplier-refunds",async(Guid? supplierId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT r.id,r.supplier_id,r.credit_line_id,r.advance_id,r.amount,r.gst_amount,r.received_on::text,r.reference,d.number,CASE WHEN EXISTS(SELECT 1 FROM accounting.supplier_refund_reversals v WHERE v.company_id=r.company_id AND v.refund_id=r.id) THEN 'REVERSED' ELSE 'ACTIVE' END AS refund_status FROM accounting.supplier_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND (@supplier IS NULL OR r.supplier_id=@supplier) ORDER BY r.created_at DESC,r.id LIMIT @size OFFSET @offset",ct,new DbArg("supplier",supplierId,NpgsqlDbType.Uuid),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.refunds.read"));
    }
    private static async Task<IResult> Return(Guid id,PurchaseReturnInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.ReceiptLineId!=Guid.Empty && x.BillLineId!=Guid.Empty) && input.Lines.Select(x=>(x.ReceiptLineId,x.BillLineId)).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct receipt/bill sources.");foreach(var l in input.Lines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive quantity required.");}
        var lines=input.Lines!.OrderBy(x=>x.ReceiptLineId).ThenBy(x=>x.BillLineId).ToArray();var result=await idem.ExecuteAsync($"POST /purchase-receipts/{id}/returns",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT purchase.return_goods(@id,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var rid=(Guid)row["id"]!;await Sql.AuditAsync(s,"purchase.goods_returned","purchase_return",rid,h.TraceIdentifier,ct,new{receiptId=id,reference});return ApiJson.Stored(await ReturnView(rid,h,s,ct,false));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Credit(Guid id,SupplierCreditInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.ReturnLineId!=Guid.Empty) && input.Lines.Select(x=>x.ReturnLineId).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct billed return lines.");foreach(var l in input.Lines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive quantity required.");}
        var lines=input.Lines!.OrderBy(x=>x.ReturnLineId).ToArray();var result=await idem.ExecuteAsync($"POST /supplier-bills/{id}/credits",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT purchase.post_supplier_credit(@id,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var cid=(Guid)row["id"]!;await Sql.AuditAsync(s,"purchase.supplier_credited","supplier_credit",cid,h.TraceIdentifier,ct,new{billId=id,reference});return ApiJson.Stored(await CreditView(cid,s,ct));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Refund(SupplierRefundInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        Check.That((input.CreditLineId is null)!=(input.AdvanceId is null) && input.CreditLineId!=Guid.Empty && input.AdvanceId!=Guid.Empty,"source","Supply exactly one credit line or prepayment source.");Check.Amount(input.Amount,"amount",2);Check.That(input.Amount>0,"amount","Positive refund amount required.");var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        BankingEndpoints.CheckChoice(h,input.BankAccountId);
        var result=await idem.ExecuteAsync("POST /supplier-refunds",h.Request.Headers["Idempotency-Key"].ToString(),BankingEndpoints.Body(new{input.CreditLineId,input.AdvanceId,input.Amount,reference,reason,input.ReceivedOn},input.BankAccountId),async()=>
        {
            var row=await One(s,input.BankAccountId is null?"SELECT purchase.receive_supplier_refund(@credit,@advance,@amount,@reference,@reason,@date) AS id":"SELECT purchase.receive_supplier_refund_to_bank(@credit,@advance,@amount,@reference,@reason,@date,@bank) AS id",ct,new DbArg("credit",input.CreditLineId,NpgsqlDbType.Uuid),new DbArg("advance",input.AdvanceId,NpgsqlDbType.Uuid),new DbArg("amount",input.Amount),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("date",input.ReceivedOn,NpgsqlDbType.Date),new DbArg("bank",input.BankAccountId,NpgsqlDbType.Uuid));var fid=(Guid)row["id"]!;await Sql.AuditAsync(s,"purchase.supplier_refunded","supplier_refund",fid,h.TraceIdentifier,ct,new{input.CreditLineId,input.AdvanceId,input.Amount,reference});return ApiJson.Stored(await RefundView(fid,s,ct));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> ReturnView(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool financial)
    {
        var r=await One(s,"SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM purchase.returns r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.id=@id",ct,new DbArg("id",id));if(!financial)await Read(s,"SELECT inventory.require_access('purchase.returns.read',@warehouse)",ct,new DbArg("warehouse",r["warehouse_id"]));var cost=financial || Access(h).Has("purchase.cost.read");
        var lines=await Read(s,"SELECT * FROM purchase.return_lines WHERE company_id=@company AND return_id=@id ORDER BY id",ct,new DbArg("id",id));if(!cost){r.Remove("journal_entry_id");foreach(var l in lines)foreach(var field in new[]{"net","tax","recoverable_tax","valuation_amount","cost","value_after","contra_account_id"})l.Remove(field);}return new{@return=PublicRow(r),lines=lines.Select(PublicRow)};
    }
    internal static async Task<object> CreditView(Guid id,CompanySession s,CancellationToken ct)
    {
        var c=await One(s,"SELECT cn.*,d.number,d.state,d.version,d.business_date::text FROM purchase.supplier_credit_notes cn JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=@company AND cn.id=@id",ct,new DbArg("id",id));
        var lines=await Read(s,"SELECT *,refundable_amount AS available_apply_amount FROM purchase.supplier_credit_line_balances WHERE company_id=@company AND credit_note_id=@id ORDER BY id",ct,new DbArg("id",id));
        foreach(var line in lines)if(line["snapshot"] is not null)line["snapshot"]=Element(line["snapshot"]!);
        return new{credit=PublicRow(c),lines=lines.Select(PublicRow)};
    }
    internal static async Task<object> RefundView(Guid id,CompanySession s,CancellationToken ct)=>new{refund=await RefundData(id,s,ct)};
    internal static async Task<object> RefundData(Guid id,CompanySession s,CancellationToken ct)=>PublicRow(await One(s,"SELECT r.*,r.received_on::text,d.number,d.state,d.version,v.id AS reversal_id,x.original_refund_id,CASE WHEN v.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS refund_status FROM accounting.supplier_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id LEFT JOIN accounting.supplier_refund_reversals v ON v.company_id=r.company_id AND v.refund_id=r.id LEFT JOIN accounting.supplier_refund_corrections x ON x.company_id=r.company_id AND x.id=r.id WHERE r.company_id=@company AND r.id=@id",ct,new DbArg("id",id)));
}
