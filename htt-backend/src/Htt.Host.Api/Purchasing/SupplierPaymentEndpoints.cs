using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record SupplierPaymentAllocation(Guid BillLineId,decimal Amount);
public sealed record SupplierPaymentInput(decimal Amount,string Method,string Reference,decimal AdvanceAmount=0,IReadOnlyList<SupplierPaymentAllocation>? Allocations=null,DateOnly? PaidOn=null,string? Notes=null);
public sealed record SupplierAdvanceApplicationInput(string Reference,IReadOnlyList<SupplierPaymentAllocation>? Allocations);

internal static class SupplierPaymentEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        SupplierSettlementReversalEndpoints.Map(g);
        g.MapPost("/suppliers/{id:guid}/payments",Post).WithMetadata(new Permission("purchase.payments.post"));
        g.MapGet("/supplier-payments/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await PaymentView(id,s,ct))).WithMetadata(new Permission("purchase.payments.read"));
        g.MapGet("/suppliers/{id:guid}/payments",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Supplier(id,s,ct);var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT p.id,d.number,d.state,d.version,p.paid_on::text,p.amount,p.allocated_amount,p.advance_amount,p.method,p.reference,CASE WHEN EXISTS(SELECT 1 FROM accounting.supplier_payment_reversals r WHERE r.company_id=p.company_id AND r.payment_id=p.id) THEN 'REVERSED' ELSE 'ACTIVE' END AS settlement_status FROM accounting.supplier_payments p JOIN platform.documents d ON d.company_id=p.company_id AND d.id=p.id WHERE p.company_id=@company AND p.supplier_id=@id ORDER BY p.created_at DESC,p.id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.payments.read"));
        g.MapGet("/suppliers/{id:guid}/advances",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Supplier(id,s,ct);var(offset,size)=Page(page,pageSize);var total=await One(s,"SELECT coalesce(sum(available),0) AS available FROM accounting.supplier_advance_balances WHERE company_id=@company AND supplier_id=@id",ct,new DbArg("id",id));
            return Results.Ok(new{currency="AUD",availableAmount=total["available"],items=(await Read(s,"SELECT a.*,p.paid_on::text FROM accounting.supplier_advance_balances a JOIN accounting.supplier_payments p ON p.company_id=a.company_id AND p.id=a.payment_id WHERE a.company_id=@company AND a.supplier_id=@id ORDER BY p.created_at DESC,a.id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.payments.read"));
        g.MapPost("/supplier-advances/{id:guid}/apply",Apply).WithMetadata(new Permission("purchase.advances.apply"));
        g.MapGet("/supplier-advance-applications/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await ApplicationView(id,s,ct))).WithMetadata(new Permission("purchase.payments.read"));
        MapGst(g);
    }
    private static Task<Dictionary<string,object?>> Supplier(Guid id,CompanySession s,CancellationToken ct)=>One(s,"SELECT id FROM crm.suppliers WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));
    internal static SupplierPaymentAllocation[] Normalize(IReadOnlyList<SupplierPaymentAllocation>? input,bool required)
    {
        input??=[];Check.That(input.Count<=50 && (!required || input.Count>0) && input.All(x=>x is not null && x.BillLineId!=Guid.Empty) && input.Select(x=>x.BillLineId).Distinct().Count()==input.Count,"allocations","Supply up to 50 distinct bill lines.");
        foreach(var item in input){Check.Amount(item.Amount,"amount",2);Check.That(item.Amount>0,"amount","Allocation must be positive.");}return input.OrderBy(x=>x.BillLineId).ToArray();
    }
    private static async Task<IResult> Post(Guid id,SupplierPaymentInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var lines=Normalize(input.Allocations,false);Check.Amount(input.Amount,"amount",2);Check.Amount(input.AdvanceAmount,"advanceAmount",2);
        Check.That(input.Amount>0 && input.Amount==input.AdvanceAmount+lines.Sum(x=>x.Amount),"amount","Payment must equal allocations plus explicit advance amount.");
        var method=Check.OneOf(input.Method,"method","BANK_TRANSFER","CARD","CASH");var reference=Check.Text(input.Reference,"reference",200);var notes=Check.Optional(input.Notes,"notes",2000)??"";
        Check.That(input.AdvanceAmount==0 || notes.Length>0,"notes","Prepayment purpose is required.");
        var result=await idem.ExecuteAsync($"POST /suppliers/{id}/payments",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,input.Amount,input.AdvanceAmount,method,reference,input.PaidOn,notes,allocations=lines}),async()=>
        {
            var row=await One(s,"SELECT purchase.post_supplier_payment(@supplier,@amount,@advance,@method,@reference,@paid,@notes,@lines) AS id",ct,new DbArg("supplier",id),new DbArg("amount",input.Amount),new DbArg("advance",input.AdvanceAmount),new DbArg("method",method),new DbArg("reference",reference),new DbArg("paid",input.PaidOn,NpgsqlDbType.Date),new DbArg("notes",notes),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var pid=(Guid)row["id"]!;
            await Sql.AuditAsync(s,"purchase.supplier_paid","supplier_payment",pid,h.TraceIdentifier,ct,new{supplierId=id,input.Amount,reference});return ApiJson.Stored(await PaymentView(pid,s,ct));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Apply(Guid id,SupplierAdvanceApplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var lines=Normalize(input.Allocations,true);var reference=Check.Text(input.Reference,"reference",200);
        var result=await idem.ExecuteAsync($"POST /supplier-advances/{id}/apply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,allocations=lines}),async()=>
        {
            var row=await One(s,"SELECT purchase.apply_supplier_advance(@id,@reference,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var aid=(Guid)row["id"]!;
            await Sql.AuditAsync(s,"purchase.supplier_advance_applied","supplier_advance_application",aid,h.TraceIdentifier,ct,new{advanceId=id,reference});return ApiJson.Stored(await ApplicationView(aid,s,ct));
        },ct);return ApiJson.Result(result);
    }
    internal static async Task<object> PaymentView(Guid id,CompanySession s,CancellationToken ct,Guid? reversalId=null)
    {
        var p=await One(s,"SELECT p.*,p.paid_on::text,d.number,d.state,d.version,r.id AS reversal_id,x.original_payment_id,CASE WHEN r.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS settlement_status FROM accounting.supplier_payments p JOIN platform.documents d ON d.company_id=p.company_id AND d.id=p.id LEFT JOIN accounting.supplier_payment_reversals r ON r.company_id=p.company_id AND r.payment_id=p.id LEFT JOIN accounting.supplier_payment_reapplications x ON x.company_id=p.company_id AND x.id=p.id WHERE p.company_id=@company AND p.id=@id",ct,new DbArg("id",id));
        var allocations=(await Allocations(id,s,ct)).Select(PublicRow);var advances=(await Read(s,"SELECT id,amount,available,account_id,gst_basis,gst_registered FROM accounting.supplier_advance_balances WHERE company_id=@company AND payment_id=@id",ct,new DbArg("id",id))).Select(PublicRow);return reversalId is null?(object)new{payment=PublicRow(p),allocations,advances}:new{payment=PublicRow(p),allocations,advances,reversalId};
    }
    private static Task<List<Dictionary<string,object?>>> Allocations(Guid id,CompanySession s,CancellationToken ct)=>Read(s,"SELECT a.id,a.bill_line_id,bl.bill_id,a.amount,a.gst_amount,a.payment_id,a.advance_id FROM accounting.supplier_payment_allocations a JOIN purchase.bill_lines bl ON bl.company_id=a.company_id AND bl.id=a.bill_line_id WHERE a.company_id=@company AND a.source_document_id=@id ORDER BY a.bill_line_id",ct,new DbArg("id",id));
    private static async Task<object> ApplicationView(Guid id,CompanySession s,CancellationToken ct)
    {
        var p=await One(s,"SELECT a.*,d.number,d.state,d.version,d.business_date::text,u.id AS unapplication_id,CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status FROM accounting.supplier_advance_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN accounting.supplier_advance_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.id=@id",ct,new DbArg("id",id));return new{application=PublicRow(p),allocations=(await Allocations(id,s,ct)).Select(PublicRow)};
    }
    private static void MapGst(RouteGroupBuilder g)
    {
        g.MapGet("/accounting/purchase-gst",async(Guid? supplierId,DateOnly? from,DateOnly? to,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            Check.That(from is null || to is null || from<=to,"to","End date must not precede start date.");var(offset,size)=Page(page,pageSize);
            var args=new DbArg[]{new("supplier",supplierId,NpgsqlDbType.Uuid),new("from",from,NpgsqlDbType.Date),new("to",to,NpgsqlDbType.Date),new("size",size),new("offset",offset)};
            const string cte="""
                WITH ledger AS(SELECT ge.id,ge.bill_line_id,bl.bill_id,b.supplier_id,b.supplier_invoice,ge.gst_basis,ge.tax_code_id,ge.tax_rate,ge.net,ge.tax,ge.recoverable_tax,ge.input_account_id,ge.debit_account_id,ge.attribution_date,
                CASE WHEN ge.gst_basis='CASH' THEN coalesce(a.in_period,0) ELSE CASE WHEN ge.attribution_date IS NOT NULL AND (@from IS NULL OR ge.attribution_date>=@from) AND (@to IS NULL OR ge.attribution_date<=@to) THEN ge.recoverable_tax ELSE 0 END+coalesce(a.in_period,0) END AS attributed_tax,
                CASE WHEN ge.gst_basis='CASH' THEN greatest(0,bl.remaining_tax-coalesce(a.total,0)) ELSE 0 END AS pending_payment_tax,CASE WHEN ge.gst_basis='CASH' THEN greatest(0,coalesce(a.total,0)-bl.remaining_tax) ELSE 0 END AS pending_refund_tax
                FROM accounting.purchase_gst_entries ge JOIN purchase.bill_line_balances bl ON bl.company_id=ge.company_id AND bl.id=ge.bill_line_id JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id
                LEFT JOIN LATERAL(SELECT sum(ga.gst_amount) AS total,sum(ga.gst_amount) FILTER(WHERE (@from IS NULL OR ga.attribution_date>=@from) AND (@to IS NULL OR ga.attribution_date<=@to)) AS in_period FROM(SELECT gst_amount,attribution_date FROM accounting.purchase_gst_attributions WHERE company_id=ge.company_id AND bill_line_id=ge.bill_line_id UNION ALL SELECT gst_amount,adjustment_date FROM accounting.purchase_gst_adjustments WHERE company_id=ge.company_id AND bill_line_id=ge.bill_line_id AND gst_basis=ge.gst_basis)ga)a ON true
                WHERE ge.company_id=@company AND (@supplier IS NULL OR b.supplier_id=@supplier))
                """;
            var total=await One(s,cte+" SELECT coalesce(sum(attributed_tax),0) AS attributed,coalesce(sum(pending_payment_tax),0) AS pending,coalesce(sum(pending_refund_tax),0) AS pending_refund FROM ledger",ct,args);
            var rows=await Read(s,cte+" SELECT *,attribution_date::text FROM ledger WHERE attributed_tax<>0 OR pending_payment_tax>0 OR pending_refund_tax>0 OR (gst_basis='NON_CASH' AND attribution_date IS NULL) ORDER BY bill_id,id LIMIT @size OFFSET @offset",ct,args);
            return Results.Ok(new{currency="AUD",attributedTax=total["attributed"],pendingPaymentTax=total["pending"],pendingRefundTax=total["pending_refund"],items=rows.Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.input_gst.read"));
        g.MapGet("/accounting/purchase-gst-attributions",async(Guid? supplierId,DateOnly? from,DateOnly? to,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            Check.That(from is null || to is null || from<=to,"to","End date must not precede start date.");var(offset,size)=Page(page,pageSize);
            var rows=await Read(s,"""
                SELECT x.id,x.source_document_id,x.bill_line_id,bl.bill_id,b.supplier_id,x.kind,x.attribution_date::text,x.amount,x.gst_amount FROM (
                SELECT ge.id,ge.company_id,bl.bill_id AS source_document_id,ge.bill_line_id,'BILL_CREDIT'::text AS kind,ge.attribution_date,bl.net+bl.tax AS amount,ge.recoverable_tax AS gst_amount FROM accounting.purchase_gst_entries ge JOIN purchase.bill_line_balances bl ON bl.company_id=ge.company_id AND bl.id=ge.bill_line_id WHERE ge.gst_basis='NON_CASH' AND ge.attribution_date IS NOT NULL
                UNION ALL SELECT ga.id,ga.company_id,ga.source_document_id,ga.bill_line_id,CASE WHEN pa.advance_id IS NULL THEN 'CASH_PAYMENT' ELSE 'PREPAYMENT_APPLICATION' END,ga.attribution_date,ga.amount,ga.gst_amount FROM accounting.purchase_gst_attributions ga JOIN accounting.supplier_payment_allocations pa ON pa.company_id=ga.company_id AND pa.id=ga.allocation_id
                UNION ALL SELECT id,company_id,source_document_id,bill_line_id,kind,adjustment_date,amount,gst_amount FROM accounting.purchase_gst_adjustments)x
                JOIN purchase.bill_lines bl ON bl.company_id=x.company_id AND bl.id=x.bill_line_id JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id
                WHERE x.company_id=@company AND (@supplier IS NULL OR b.supplier_id=@supplier) AND (@from IS NULL OR x.attribution_date>=@from) AND (@to IS NULL OR x.attribution_date<=@to) ORDER BY x.attribution_date,x.id LIMIT @size OFFSET @offset
                """,ct,new DbArg("supplier",supplierId,NpgsqlDbType.Uuid),new DbArg("from",from,NpgsqlDbType.Date),new DbArg("to",to,NpgsqlDbType.Date),new DbArg("size",size),new DbArg("offset",offset));
            return Results.Ok(new{items=rows.Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.input_gst.read"));
    }
}
