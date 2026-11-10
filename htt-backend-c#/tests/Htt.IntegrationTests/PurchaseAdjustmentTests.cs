using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class PurchaseAdjustmentTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Bill,Guid Line,Guid Credit,Guid CreditLine,Guid Account,Guid Tax,DateOnly Today,decimal Gross);
    private async Task<Data> Source(HttpClient c,string basis="CASH",decimal net=100,decimal tax=10,bool paid=true,decimal? credit=null,bool recoverable=true,bool makeCredit=true)
    {
        await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=true WHERE id=@company",("company",db.Company),("basis",basis));
        var sid=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Credit application supplier",null));var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.Company)))!;var tc=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!,System.Globalization.CultureInfo.InvariantCulture);
        var d=new Data(sid,default,default,default,default,acct,tc,today,net+tax);var b=await Bill(c,d,net,tax,recoverable:recoverable);d=d with{Bill=b.Bill,Line=b.Line};if(paid && d.Gross>0)await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created);
        if(!makeCredit)return d;
        var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified original adjustment",[new(d.Line,credit??d.Gross)])),HttpStatusCode.Created);return d with{Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};
    }
    private static async Task<(Guid Bill,Guid Line)> Bill(HttpClient c,Data d,decimal net=100,decimal tax=10,bool recoverable=true,DateOnly? held=null)
    {
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today.AddDays(30),d.Today,[new(d.Account,"Expense settlement",net,tax,d.Tax,recoverable)],"Verified invoice",held??d.Today)),HttpStatusCode.Created);return(b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static SupplierCreditApplicationInput Input(Data d,Guid line,decimal? amount=null,string? reference=null)=>new(reference??Code(),"Apply verified available supplier credit",[new(d.CreditLine,line,amount??d.Gross)]);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Data d,Guid line,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",Input(d,line,amount,reference),key:key);
    private static Task<HttpResponseMessage> Undo(HttpClient c,Guid app,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credit-applications/{app}/unapply",new SupplierCreditUnapplicationInput(reference??Code(),"Verified allocation correction"),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,Guid line,decimal amount)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),PaidOn:d.Today,Allocations:[new(line,amount)]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,Code(),"Verified incoming refund",CreditLineId:d.CreditLine));
    private static Guid App(JsonElement e)=>e.GetProperty("application").GetProperty("id").GetGuid();
    private static Guid Unapp(JsonElement e)=>e.GetProperty("unapplication").GetProperty("id").GetGuid();
    private static async Task Consistent(HttpClient c){
        await FinancialReportAssertions.Check(c);var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
    private static async Task<JsonElement> CreditLine(HttpClient c,Data d)=>(await Get(c,$"/supplier-credits/{d.Credit}")).GetProperty("lines").EnumerateArray().Single(x=>x.GetProperty("id").GetGuid()==d.CreditLine);
    private async Task<decimal> Balance(Guid line,string col)=>Convert.ToDecimal(await S($"SELECT {col} FROM purchase.bill_line_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",line)));
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches b JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.source_document_id=@id AND a.code=@code",("company",db.Company),("id",doc),("code",code)));
    private static Task<HttpResponseMessage> Reverse(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-payments/{id}/reverse",new SupplierSettlementReversalInput(reference??Code(),"Correct supplier payment"),key:key);
    private static Task<HttpResponseMessage> Unapply(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-advance-applications/{id}/unapply",new SupplierSettlementReversalInput(reference??Code(),"Correct prepayment allocation"),key:key);
    private static Task<HttpResponseMessage> Reapply(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-payment-reversals/{id}/reapply",new SupplierPaymentReapplicationInput(reference??Code(),"Correct supplier allocation",Allocations:[new(target,amount)]),key:key);
    private static Task<HttpResponseMessage> Reallocate(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null,string? reversalReference=null)=>Send(c,HttpMethod.Post,$"/supplier-payments/{id}/reallocate",new SupplierPaymentReallocationInput(reversalReference??Code(),reference??Code(),"Correct supplier allocation",Allocations:[new(target,amount)]),key:key);
    private static Task<HttpResponseMessage> PayAdvance(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-advances/{id}/apply",new SupplierAdvanceApplicationInput(reference??Code(),[new(target,amount)]),key:key);
    private static Guid Rev(JsonElement e)=>e.GetProperty("reversal").GetProperty("id").GetGuid();
    private static Guid Payment(JsonElement e)=>e.GetProperty("payment").GetProperty("id").GetGuid();
    private async Task<Guid> OriginalPayment(Data d)=>(Guid)(await S("SELECT payment_id FROM accounting.supplier_payment_allocations WHERE company_id=@company AND bill_line_id=@id ORDER BY id LIMIT 1",("company",db.Company),("id",d.Line)))!;
    private async Task<decimal> Available(Guid advance)=>Convert.ToDecimal(await S("SELECT available FROM accounting.supplier_advance_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",advance)));
    private static async Task<decimal> Gst(HttpClient c,Data d)=>D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax"));
    private static async Task<(Guid Payment,Guid Advance)> Advance(HttpClient c,Data d,decimal amount=220)
    {
        var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),amount,Notes:"Confirmed supplier prepayment")),HttpStatusCode.Created);return(Payment(p),p.GetProperty("advances")[0].GetProperty("id").GetGuid());
    }
    private static Task<HttpResponseMessage> ReverseRefund(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-refunds/{id}/reverse",new SupplierRefundReversalInput(reference??Code(),"Verified refund correction"),key:key);
    private static Task<HttpResponseMessage> CorrectRefund(HttpClient c,Guid id,Data d,decimal amount=55,Guid? advance=null,string? key=null,string? reference=null,string? rr=null)=>Send(c,HttpMethod.Post,$"/supplier-refunds/{id}/correct",new SupplierRefundAtomicCorrectionInput(rr??Code(),reference??Code(),"Verified refund correction",amount,CreditLineId:advance is null?d.CreditLine:null,AdvanceId:advance),key:key);
    private static Task<HttpResponseMessage> ReplaceRefund(HttpClient c,Guid id,Data d,decimal amount=55,Guid? advance=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-refund-reversals/{id}/correct",new SupplierRefundCorrectionInput(reference??Code(),"Verified refund correction",amount,CreditLineId:advance is null?d.CreditLine:null,AdvanceId:advance),key:key);
    private static Guid RefundId(JsonElement e)=>e.GetProperty("refund").GetProperty("id").GetGuid();
    private async Task Configure(string basis="CASH",bool registered=true)=>await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=@registered WHERE id=@company",("company",db.Company),("basis",basis),("registered",registered));
    private async Task<Guid> Supplier(HttpClient c)=>await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier settlement test",null));
    private async Task<Data> SetupBill(HttpClient c,string basis="CASH",bool registered=true,Guid? supplier=null,decimal qty=2,decimal cost=10,int invoiceDays=0,int heldDays=0)
    {
        await Configure(basis,registered);var d=await Setup(db,c,0);var sid=supplier??await Supplier(c);
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(sid,d.Warehouse,[new(d.BoxUnit,qty,cost)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();
        po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);
        var receipt=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty)]),2),HttpStatusCode.Created);
        var today=DateOnly.Parse(receipt.GetProperty("receipt").GetProperty("businessDate").GetString()!,System.Globalization.CultureInfo.InvariantCulture);
        var bill=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(sid,Code(),today.AddDays(invoiceDays),today.AddDays(30),today,[new(receipt.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty,D(receipt.GetProperty("receipt").GetProperty("net")),D(receipt.GetProperty("receipt").GetProperty("tax")))],"verified-original",today.AddDays(heldDays))),HttpStatusCode.Created);
        var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.Company)))!;var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;
        return new(sid,bill.GetProperty("bill").GetProperty("id").GetGuid(),bill.GetProperty("lines")[0].GetProperty("id").GetGuid(),default,default,acct,tax,today,D(bill.GetProperty("bill").GetProperty("gross")));
    }

    private static Task<HttpResponseMessage> AmountCredit(HttpClient c,Data d,decimal net=20,decimal tax=3,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-bills/{d.Bill}/amount-credits",new SupplierAmountCreditInput(reference??Code(),"Verified supplier price/tax adjustment",[new(d.Line,net,tax,"Verified supplier adjustment")]),key:key);
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Independent_expense_credit_uses_explicit_net_tax_and_shared_AP_GST(string basis,bool paid)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:paid,makeCredit:false);var cr=await Expect(await AmountCredit(c,d),HttpStatusCode.Created);Assert.Equal(20,D(cr.GetProperty("credit").GetProperty("net")));Assert.Equal(3,D(cr.GetProperty("credit").GetProperty("tax")));Assert.Equal(paid?0:87,await Balance(d.Line,"outstanding_amount"));d=d with{Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};if(paid){await Expect(await Refund(c,d,23),HttpStatusCode.Created);Assert.Equal(7,await Gst(c,d));}else Assert.Equal(basis=="CASH"?0:7,await Gst(c,d));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Stock_allowance_updates_value_and_later_return_credit_does_not_double_reduce_cost(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis);await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created);var cr=await Expect(await AmountCredit(c,d,4,.5m),HttpStatusCode.Created);Assert.Equal(16m,await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company)));await Consistent(c);
        var receipt=(Guid)(await S("SELECT r.receipt_id FROM purchase.receipt_lines r JOIN purchase.bill_lines bl ON bl.company_id=r.company_id AND bl.receipt_line_id=r.id WHERE bl.company_id=@company AND bl.id=@id",("company",db.Company),("id",d.Line)))!;var rl=(Guid)(await S("SELECT receipt_line_id FROM purchase.bill_lines WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Line)))!;var ret=await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{receipt}/returns",new PurchaseReturnInput(Code(),"Goods returned",[new(rl,2,d.Line)])),HttpStatusCode.Created);await Consistent(c);var quantity=await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{d.Bill}/credits",new SupplierCreditInput(Code(),"Remaining return credit",[new(ret.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)])),HttpStatusCode.Created);Assert.Equal(16,D(quantity.GetProperty("credit").GetProperty("net")));Assert.Equal(1.5m,D(quantity.GetProperty("credit").GetProperty("tax")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",0,24,2.4,24,0)][InlineData("NON_CASH",0,24,2.4,24,0)]
    [InlineData("CASH",2.2,24,2.4,12,2)][InlineData("NON_CASH",4.4,24,2.4,0,4)]
    [InlineData("CASH",0,16,1.6,16,0)][InlineData("NON_CASH",2.2,16,1.6,8,-2)]
    public async Task Actual_bill_price_variance_splits_inventory_and_sold_cost(string basis,decimal sold,decimal net,decimal tax,decimal value,decimal expense)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Configure(basis);var d=await Setup(db,c,0);var sid=await Supplier(c);
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(sid,d.Warehouse,[new(d.BoxUnit,2,10)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);
        var rec=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),2),HttpStatusCode.Created);
        if(sold>0){var q=await Submitted(c,d.Draft(sold/2.2m));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var o=await Get(c,$"/sales-orders/{order}");var pick=await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new Htt.Host.Api.Sales.PickInput([new(o.GetProperty("lines")[0].GetProperty("id").GetGuid(),sold/2.2m)]),1),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick.GetProperty("id").GetGuid()}/confirm",new Htt.Host.Api.Sales.DispatchInput("PICKUP","Customer","Docket"),1),HttpStatusCode.OK);}
        var today=DateOnly.Parse(rec.GetProperty("receipt").GetProperty("businessDate").GetString()!);var body=new SupplierBillInput(sid,Code(),today,today.AddDays(30),today,[new(rec.GetProperty("lines")[0].GetProperty("id").GetGuid(),2,net,tax)],"Tax invoice",today);
        await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",body),HttpStatusCode.UnprocessableEntity);
        var input=new SupplierBillVarianceInput(body,"Approved supplier price change");var key=Code();var attempts=await Task.WhenAll(Send(c,HttpMethod.Post,"/supplier-bills/with-variance",input,key:key),Send(c,HttpMethod.Post,"/supplier-bills/with-variance",input,key:key));var bill=await Expect(attempts[0],HttpStatusCode.Created);var replay=await Expect(attempts[1],HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(bill,replay));var id=bill.GetProperty("bill").GetProperty("id").GetGuid();Assert.Equal(net-20,D(bill.GetProperty("bill").GetProperty("costVariance")));Assert.Equal(value,Convert.ToDecimal(await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company))));Assert.Equal(expense,await Journal(id,"5120","debit")-await Journal(id,"5120","credit"));await Consistent(c);
    }
    [Fact]
    public async Task Independent_credit_concurrency_cannot_exceed_source_and_same_key_posts_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var key=Code();var reference=Code();var results=await Task.WhenAll(AmountCredit(c,d,60,6,key,reference),AmountCredit(c,d,60,6,key,reference));foreach(var res in results)await Expect(res,HttpStatusCode.Created);Assert.Equal(44,await Balance(d.Line,"outstanding_amount"));var race=await Task.WhenAll(AmountCredit(c,d,30,3),AmountCredit(c,d,30,3));Assert.Single(race,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(race,x=>x.StatusCode==HttpStatusCode.UnprocessableEntity||x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData(-1,0)][InlineData(0,-1)][InlineData(0,0)][InlineData(101,0)][InlineData(0,11)][InlineData(1.001,0)]
    public async Task Invalid_amount_credit_rolls_back(decimal net,decimal tax)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var res=await AmountCredit(c,d,net,tax);Assert.True(res.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity or HttpStatusCode.Conflict);Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Procurement_role_cannot_post_independent_financial_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var staff=await Staff(db,"PROCUREMENT");using var other=api.Authenticated(staff.Subject);await Expect(await AmountCredit(other,d),HttpStatusCode.Forbidden);Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));
    }

}
