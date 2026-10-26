using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record ExpenseBillLineInput(Guid ExpenseAccountId,string Description,decimal? Net,decimal? Tax,Guid TaxCodeId,bool? RecoverableGst=null);
public sealed record ExpenseBillInput(Guid SupplierId,string SupplierInvoice,DateOnly InvoiceDate,DateOnly DueOn,DateOnly PostingDate,
    ExpenseBillLineInput[] Lines,string? TaxInvoiceReference=null,DateOnly? TaxInvoiceHeldOn=null,string? Notes=null);
internal static class ExpenseBillEndpoints
{
    public static void Map(RouteGroupBuilder g)=>g.MapPost("/supplier-expense-bills",Post).WithMetadata(new Permission("purchase.expense_bills.post"));
    private static async Task<IResult> Post(ExpenseBillInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        if(!Access(h).Has("purchase.bills.read"))throw new BusinessException("permission_denied","Expense bill posting requires bill reading permission.",403);
        await One(s,"SELECT id FROM crm.suppliers WHERE company_id=@company AND id=@id",ct,new DbArg("id",input.SupplierId));
        var invoice=Check.Text(input.SupplierInvoice,"supplierInvoice",200);var evidence=Check.Optional(input.TaxInvoiceReference,"taxInvoiceReference",500);var notes=Check.Optional(input.Notes,"notes",2000)??"";
        Check.That(input.InvoiceDate!=default && input.DueOn!=default && input.PostingDate!=default,"invoiceDate","Invoice, due and posting dates are required.");
        Check.That(input.Lines is{Length:>=1 and <=50} && input.Lines.All(x=>x is not null && x.ExpenseAccountId!=Guid.Empty && x.TaxCodeId!=Guid.Empty && x.Net is not null && x.Tax is not null),"lines","Supply 1..50 explicit expense-account, description, net/tax and tax-code lines.");
        var lines=input.Lines!.Select(x=>x with{Description=Check.Text(x.Description,"description",2000)}).ToArray();foreach(var l in lines){Check.Amount(l.Net!.Value,"net",2);Check.Amount(l.Tax!.Value,"tax",2);}
        var response=await idem.ExecuteAsync("POST /supplier-expense-bills",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{input.SupplierId,supplierInvoice=invoice,input.InvoiceDate,input.DueOn,input.PostingDate,lines,taxInvoiceReference=evidence,input.TaxInvoiceHeldOn,notes}),async()=>
        {
            var r=await One(s,"SELECT purchase.post_expense_bill(@supplier,@invoice,@date,@due,@posting,@evidence,@held,@notes,@lines) AS id",ct,new DbArg("supplier",input.SupplierId),new DbArg("invoice",invoice),new DbArg("date",input.InvoiceDate),new DbArg("due",input.DueOn),new DbArg("posting",input.PostingDate),new DbArg("evidence",evidence,NpgsqlDbType.Text),new DbArg("held",input.TaxInvoiceHeldOn,NpgsqlDbType.Date),new DbArg("notes",notes),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var id=(Guid)r["id"]!;
            await Sql.AuditAsync(s,"purchase.bill_posted","supplier_bill",id,h.TraceIdentifier,ct,new{input.SupplierId,supplierInvoice=invoice,billType="EXPENSE"});return ApiJson.Stored(await SupplierBillEndpoints.View(id,s,ct));
        },ct);return ApiJson.Result(response);
    }
}
