using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record SupplierCreditAllocation(Guid CreditLineId,Guid BillLineId,decimal? Amount);
public sealed record SupplierCreditApplicationInput(string Reference,string Reason,IReadOnlyList<SupplierCreditAllocation>? Lines);
public sealed record SupplierCreditUnapplicationInput(string Reference,string Reason);
internal static class CreditApplicationEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/supplier-credits/{id:guid}/apply",Apply).WithMetadata(new Permission("purchase.credits.apply"));
        g.MapPost("/supplier-credit-applications/{id:guid}/unapply",Unapply).WithMetadata(new Permission("purchase.credits.unapply"));
        g.MapGet("/supplier-credit-applications/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,s,ct,false))).WithMetadata(new Permission("purchase.credits.read"));
        g.MapGet("/supplier-credit-unapplications/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(id,s,ct,true))).WithMetadata(new Permission("purchase.credits.read"));
        g.MapGet("/supplier-credits/{id:guid}/applications",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await One(s,"SELECT id FROM purchase.supplier_credit_notes WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));
            var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT a.*,d.number,d.business_date::text,u.id AS unapplication_id FROM purchase.credit_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN purchase.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.credit_note_id=@id ORDER BY a.created_at DESC,a.id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("purchase.credits.read"));
    }
    private static void ReadAccess(HttpContext h){if(!Access(h).Has("purchase.credits.read") || !Access(h).Has("purchase.bills.read"))throw new BusinessException("permission_denied","Credit application requires bill and credit reading permission.",403);}
    private static async Task<IResult> Apply(Guid id,SupplierCreditApplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await One(s,"SELECT id FROM purchase.supplier_credit_notes WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.CreditLineId!=Guid.Empty && x.BillLineId!=Guid.Empty && x.Amount is not null) && input.Lines.Select(x=>(x.CreditLineId,x.BillLineId)).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct credit/target pairs and explicit positive amounts.");
        var lines=input.Lines!.OrderBy(x=>x.CreditLineId).ThenBy(x=>x.BillLineId).ToArray();foreach(var l in lines){Check.Amount(l.Amount!.Value,"amount",2);Check.That(l.Amount>0,"amount","Positive credit amount required.");}
        var result=await idem.ExecuteAsync($"POST /supplier-credits/{id}/apply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason,lines}),async()=>
        {
            var r=await One(s,"SELECT purchase.apply_supplier_credit(@id,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var doc=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"purchase.supplier_credit_applied","supplier_credit_application",doc,h.TraceIdentifier,ct,new{creditId=id,reference});return ApiJson.Stored(await View(doc,s,ct,false));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Unapply(Guid id,SupplierCreditUnapplicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);await One(s,"SELECT id FROM purchase.credit_applications WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);
        var result=await idem.ExecuteAsync($"POST /supplier-credit-applications/{id}/unapply",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,reference,reason}),async()=>
        {
            var r=await One(s,"SELECT purchase.unapply_supplier_credit(@id,@reference,@reason) AS id",ct,new DbArg("id",id),new DbArg("reference",reference),new DbArg("reason",reason));var doc=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"purchase.supplier_credit_unapplied","supplier_credit_unapplication",doc,h.TraceIdentifier,ct,new{applicationId=id,reference});return ApiJson.Stored(await View(doc,s,ct,true));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> View(Guid id,CompanySession s,CancellationToken ct,bool undo)
    {
        var sql=undo?"SELECT a.*,d.number,d.state,d.version,d.business_date::text FROM purchase.credit_unapplications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id WHERE a.company_id=@company AND a.id=@id":"SELECT a.*,d.number,d.state,d.version,d.business_date::text,u.id AS unapplication_id,CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status FROM purchase.credit_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN purchase.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.id=@id";
        var header=await One(s,sql,ct,new DbArg("id",id));var app=undo?(Guid)header["application_id"]!:id;var lines=(await Read(s,"SELECT * FROM purchase.credit_application_lines WHERE company_id=@company AND application_id=@id ORDER BY id",ct,new DbArg("id",app))).Select(PublicRow);
        var gst=(await Read(s,"SELECT bill_line_id,amount,gst_amount,gst_basis,kind,adjustment_date::text FROM accounting.purchase_gst_adjustments WHERE company_id=@company AND source_document_id=@id ORDER BY bill_line_id",ct,new DbArg("id",id))).Select(PublicRow);
        return undo?(object)new{unapplication=PublicRow(header),lines,gstAdjustments=gst}:new{application=PublicRow(header),lines,gstAdjustments=gst};
    }
}
