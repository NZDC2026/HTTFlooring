using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record CustomerCreditAllocation(Guid CreditLineId,Guid InvoiceLineId,decimal? Amount);
public sealed record CustomerCreditApplicationInput(string Reference,string Reason,IReadOnlyList<CustomerCreditAllocation>? Lines);
public sealed record CustomerCreditUnapplicationInput(string Reference,string Reason);
internal static class CustomerCreditApplicationEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/sales-credit-notes/{id:guid}/apply",Apply).WithMetadata(new Permission("sales.credits.apply"));
        g.MapPost("/customer-credit-applications/{id:guid}/unapply",Unapply).WithMetadata(new Permission("sales.credits.unapply"));
        g.MapGet("/customer-credit-applications/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,h,s,ct,false))).WithMetadata(new Permission("sales.credits.read"));
        g.MapGet("/customer-credit-unapplications/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,h,s,ct,true))).WithMetadata(new Permission("sales.credits.read"));
        g.MapGet("/sales-credit-notes/{id:guid}/applications",async(Guid id,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
        {
            var source=await One(s,"SELECT i.customer_id FROM sales.credit_notes n JOIN sales.invoices i ON i.company_id=n.company_id AND i.id=n.invoice_id WHERE n.company_id=@company AND n.id=@id",ct,new DbArg("id",id));await Customer(h,s,(Guid)source["customer_id"]!,ct);
            var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT a.*,d.number,d.business_date::text,u.id AS unapplication_id FROM sales.credit_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN sales.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.credit_note_id=@id ORDER BY a.created_at DESC,a.id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("sales.credits.read"));
    }
    private static void ReadAccess(HttpContext h){if(!Access(h).Has("sales.credits.read") || !Access(h).Has("accounting.receivables.read"))throw new BusinessException("permission_denied","Credit application requires invoice and credit reading permission.",403);}
    private static async Task<IResult> Apply(Guid id,CustomerCreditApplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);var source=await One(s,"SELECT i.customer_id FROM sales.credit_notes n JOIN sales.invoices i ON i.company_id=n.company_id AND i.id=n.invoice_id WHERE n.company_id=@company AND n.id=@id",ct,new DbArg("id",id));await Customer(h,s,(Guid)source["customer_id"]!,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.CreditLineId!=Guid.Empty && x.InvoiceLineId!=Guid.Empty && x.Amount is not null) && input.Lines.Select(x=>(x.CreditLineId,x.InvoiceLineId)).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct credit/target pairs and explicit positive amounts.");
        var lines=input.Lines!.OrderBy(x=>x.CreditLineId).ThenBy(x=>x.InvoiceLineId).ToArray();foreach(var l in lines){Check.Amount(l.Amount!.Value,"amount",2);Check.That(l.Amount>0,"amount","Positive credit amount required.");}
        var result=await idem.ExecuteAsync($"POST /sales-credit-notes/{id}/apply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>
        {
            var r=await One(s,"SELECT sales.apply_customer_credit(@id,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var doc=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"sales.customer_credit_applied","customer_credit_application",doc,h.TraceIdentifier,ct,new{creditId=id,reference});return ApiJson.Stored(await View(doc,h,s,ct,false));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Unapply(Guid id,CustomerCreditUnapplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);var source=await One(s,"SELECT customer_id FROM sales.credit_applications WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));await Customer(h,s,(Guid)source["customer_id"]!,ct);var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var result=await idem.ExecuteAsync($"POST /customer-credit-applications/{id}/unapply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var r=await One(s,"SELECT sales.unapply_customer_credit(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"sales.customer_credit_unapplied","customer_credit_unapplication",doc,h.TraceIdentifier,ct,new{applicationId=id,reference});return ApiJson.Stored(await View(doc,h,s,ct,true));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> View(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool undo)
    {
        var sql=undo?"SELECT a.*,d.number,d.state,d.version,d.business_date::text FROM sales.credit_unapplications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id WHERE a.company_id=@company AND a.id=@id":"SELECT a.*,d.number,d.state,d.version,d.business_date::text,u.id AS unapplication_id,CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status FROM sales.credit_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN sales.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.id=@id";
        var header=await One(s,sql,ct,new DbArg("id",id));await Customer(h,s,(Guid)header["customer_id"]!,ct);var app=undo?(Guid)header["application_id"]!:id;var lines=(await Read(s,"SELECT * FROM sales.credit_application_lines WHERE company_id=@company AND application_id=@id ORDER BY id",ct,new DbArg("id",app))).Select(PublicRow);
        var gst=(await Read(s,"SELECT invoice_line_id,amount,gst_amount,gst_basis,kind,adjustment_date::text FROM accounting.gst_adjustments WHERE company_id=@company AND source_document_id=@id ORDER BY invoice_line_id",ct,new DbArg("id",id))).Select(PublicRow);
        return undo?(object)new{unapplication=PublicRow(header),lines,gstAdjustments=gst}:new{application=PublicRow(header),lines,gstAdjustments=gst};
    }
}
