using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record SupplierBillLineInput(Guid ReceiptLineId, decimal Quantity, decimal? Net, decimal? Tax);
public sealed record SupplierBillInput(Guid SupplierId, string SupplierInvoice, DateOnly InvoiceDate, DateOnly DueOn, DateOnly PostingDate,
    IReadOnlyList<SupplierBillLineInput>? Lines, string? TaxInvoiceReference = null, DateOnly? TaxInvoiceHeldOn = null, string? Notes = null);

internal static class SupplierBillEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        ExpenseBillEndpoints.Map(g);
        g.MapPost("/supplier-bills", Post).WithMetadata(new Permission("purchase.bills.post"));
        g.MapGet("/supplier-bills/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(await View(id, s, ct))).WithMetadata(new Permission("purchase.bills.read"));
        g.MapGet("/supplier-bills", async (Guid? supplierId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            var (offset,size)=Page(page,pageSize);
            return Results.Ok(new { items=(await Read(s,"SELECT b.id,d.number,d.state,d.version,b.supplier_id,b.supplier_invoice,b.invoice_date::text,b.due_on::text,b.net,b.tax,b.gross,b.recoverable_tax,b.gst_basis,b.bill_type,b.expense_amount FROM purchase.bills b JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id WHERE b.company_id=@company AND (@supplier IS NULL OR b.supplier_id=@supplier) ORDER BY b.created_at DESC,b.id LIMIT @size OFFSET @offset",ct,new DbArg("supplier",supplierId,NpgsqlDbType.Uuid),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow), page=page??1,pageSize=size });
        }).WithMetadata(new Permission("purchase.bills.read"));
        g.MapGet("/accounting/ap", async (Guid? supplierId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            var (offset,size)=Page(page,pageSize);var args=new DbArg[]{new("supplier",supplierId,NpgsqlDbType.Uuid),new("size",size),new("offset",offset)};
            var total=await One(s,"SELECT coalesce(sum(outstanding_amount),0) AS amount,coalesce(sum(available_credit),0) AS available_credit FROM accounting.ap_balances WHERE company_id=@company AND (@supplier IS NULL OR supplier_id=@supplier)",ct,args);
            return Results.Ok(new {currency="AUD",outstandingAmount=total["amount"],availableCredit=total["available_credit"],items=(await Read(s,"SELECT a.id,a.bill_id,d.number,b.supplier_invoice,a.supplier_id,a.party_id,a.amount,a.paid_amount,a.outstanding_amount,a.credited_amount,a.refunded_amount,a.net_paid_amount,a.net_amount,a.available_credit,a.due_on::text,a.account_id,a.journal_entry_id FROM accounting.ap_balances a JOIN purchase.bills b ON b.company_id=a.company_id AND b.id=a.bill_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id WHERE a.company_id=@company AND (@supplier IS NULL OR a.supplier_id=@supplier) ORDER BY a.due_on,a.id LIMIT @size OFFSET @offset",ct,args)).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.ap.read"));
        g.MapGet("/accounting/grni/unmatched", async (Guid supplierId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            var (offset,size)=Page(page,pageSize);
            return Results.Ok(new {items=(await Read(s,"""
                SELECT rl.id AS receipt_line_id,rl.receipt_id,d.number AS receipt_number,r.order_id,r.warehouse_id,rl.order_line_id,rl.quantity,rl.net,rl.tax,rl.valuation_amount,
                coalesce(m.quantity,0) AS matched_quantity,coalesce(ur.quantity,0) AS returned_unbilled_quantity,rl.quantity-coalesce(m.quantity,0)-coalesce(ur.quantity,0) AS unmatched_quantity,
                rl.net-coalesce(m.net,0)-coalesce(ur.net,0) AS unmatched_net,rl.tax-coalesce(m.tax,0)-coalesce(ur.tax,0) AS unmatched_tax,gi.amount-coalesce(m.grni_amount,0)-coalesce(ur.val,0) AS outstanding_grni
                FROM purchase.receipt_lines rl JOIN purchase.receipts r ON r.company_id=rl.company_id AND r.id=rl.receipt_id JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                JOIN accounting.grni_items gi ON gi.company_id=rl.company_id AND gi.receipt_line_id=rl.id
                LEFT JOIN LATERAL(SELECT sum(bl.quantity) AS quantity,sum(bl.net) AS net,sum(bl.tax) AS tax,sum(bl.grni_amount) AS grni_amount FROM purchase.bill_lines bl WHERE bl.company_id=rl.company_id AND bl.receipt_line_id=rl.id)m ON true
                LEFT JOIN LATERAL(SELECT sum(quantity) AS quantity,sum(net) AS net,sum(tax) AS tax,sum(valuation_amount) AS val FROM purchase.return_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id AND bill_line_id IS NULL)ur ON true
                WHERE rl.company_id=@company AND r.supplier_id=@supplier AND rl.quantity>coalesce(m.quantity,0)+coalesce(ur.quantity,0) ORDER BY d.business_date,rl.id LIMIT @size OFFSET @offset
                """,ct,new DbArg("supplier",supplierId),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.grni.read"));
    }
    internal static async Task<object> View(Guid id, CompanySession s, CancellationToken ct)
    {
        var b=await One(s,"SELECT b.*,b.invoice_date::text,b.due_on::text,b.tax_invoice_held_on::text,d.number,d.state,d.version,d.business_date::text FROM purchase.bills b JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id WHERE b.company_id=@company AND b.id=@id",ct,new DbArg("id",id));
        b["supplier_snapshot"]=Element(b["supplier_snapshot"]!);
        return new {bill=PublicRow(b),lines=(await Read(s,"SELECT v.id,v.receipt_line_id,v.grni_item_id,v.quantity,v.net,v.tax,v.grni_amount,v.recoverable_tax,v.tax_code_id,v.tax_rate,v.paid_amount,v.outstanding_amount,v.credited_quantity,v.credited_amount,v.refunded_amount,v.net_paid_amount,v.remaining_gross,v.refundable_amount,l.expense_account_id,l.description,l.expense_amount,v.credit_received_amount,v.credit_used_amount FROM purchase.bill_line_balances v JOIN purchase.bill_lines l ON l.company_id=v.company_id AND l.id=v.id WHERE v.company_id=@company AND v.bill_id=@id ORDER BY v.id",ct,new DbArg("id",id))).Select(PublicRow)};
    }
    private static async Task<IResult> Post(SupplierBillInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var invoice=Check.Text(input.SupplierInvoice,"supplierInvoice",200);var evidence=Check.Optional(input.TaxInvoiceReference,"taxInvoiceReference",500);var notes=Check.Optional(input.Notes,"notes",2000)??"";
        Check.That(input.SupplierId!=Guid.Empty && input.Lines is {Count:>=1 and <=50} && input.Lines.All(l=>l is not null && l.ReceiptLineId!=Guid.Empty) && input.Lines.Select(l=>l.ReceiptLineId).Distinct().Count()==input.Lines.Count,"lines","Supplier and 1..50 distinct receipt lines required.");
        Check.That(input.InvoiceDate!=default && input.DueOn!=default && input.PostingDate!=default,"invoiceDate","Invoice, due and posting dates are required.");
        foreach(var l in input.Lines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive quantity required.");Check.That(l.Net is not null && l.Tax is not null,"net","Explicit net and tax amounts required.");Check.Amount(l.Net!.Value,"net",2);Check.Amount(l.Tax!.Value,"tax",2);}
        var lines=input.Lines!.OrderBy(l=>l.ReceiptLineId).ToArray();
        var response=await idem.ExecuteAsync("POST /supplier-bills",h.Request.Headers["Idempotency-Key"].ToString(),Json(new {input.SupplierId,supplierInvoice=invoice,input.InvoiceDate,input.DueOn,input.PostingDate,lines,taxInvoiceReference=evidence,input.TaxInvoiceHeldOn,notes}),async()=>
        {
            var r=await One(s,"SELECT purchase.post_bill(@supplier,@invoice,@invoice_date,@due,@posting,@evidence,@held,@notes,@lines) AS id",ct,new DbArg("supplier",input.SupplierId),new DbArg("invoice",invoice),new DbArg("invoice_date",input.InvoiceDate),new DbArg("due",input.DueOn),new DbArg("posting",input.PostingDate),new DbArg("evidence",evidence,NpgsqlDbType.Text),new DbArg("held",input.TaxInvoiceHeldOn,NpgsqlDbType.Date),new DbArg("notes",notes),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var id=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"purchase.bill_posted","supplier_bill",id,h.TraceIdentifier,ct,new {input.SupplierId,supplierInvoice=invoice});return ApiJson.Stored(await View(id,s,ct));
        },ct);return ApiJson.Result(response);
    }
}
