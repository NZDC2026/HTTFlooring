using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class AmountCreditTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Inv(Guid Id,Guid Line,Guid Order,Guid OrderLine,decimal Gross);
    private sealed record Data(SalesData Sales,Inv Invoice,Guid Credit,Guid CreditLine);
    private async Task<SalesData> SetupCustomer(HttpClient c,string basis="CASH",string taxCode="GST",bool stock=false)
    {
        await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));var d=await Setup(db,c,stock?22:0);var p=await Get(c,$"/products/{d.Product}");var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code=@code",("company",db.Company),("code",taxCode)))!;await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Service credit",tax,ItemType:stock?"STOCK":"SERVICE",WholePacks:stock),1),HttpStatusCode.OK);if(stock)await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,1000,"Credit opening",DatabaseFixture.Issuer,db.Subject);return d;
    }
    private static async Task<Inv> Invoice(HttpClient c,SalesData d,decimal price=100,bool prepay=false,bool stock=false,decimal? advanceAmount=null,DateOnly? receivedOn=null)
    {
        var q=await Submitted(c,d.Draft(1) with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();Guid advance=default;var prepaid=advanceAmount??price*1.1m;
        if(prepay){var p=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(prepaid,"BANK_TRANSFER",Code(),[],[new(line,prepaid)],receivedOn)),HttpStatusCode.Created);advance=p.GetProperty("advances")[0].GetProperty("id").GetGuid();}
        if(stock){var pick=await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{o}/picks",new PickInput([new(line,1)]),1),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick.GetProperty("id").GetGuid()}/confirm",new DispatchInput("PICKUP","Customer","Docket"),1),HttpStatusCode.OK);}
        var version=(await Get(c,$"/sales-orders/{o}/invoiceable")).GetProperty("version").GetInt64();var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(line,1)],"Completed service"),version),HttpStatusCode.Created);var result=new Inv(invoice.GetProperty("id").GetGuid(),invoice.GetProperty("lines")[0].GetProperty("id").GetGuid(),o,line,D(invoice.GetProperty("gross")));
        if(prepay&&advanceAmount is null)await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{advance}/apply",new AdvanceApplicationInput(Code(),[new(result.Line,result.Gross)])),HttpStatusCode.Created);return result;
    }
    private static Task<HttpResponseMessage> Receive(HttpClient c,SalesData d,Inv i,decimal? amount=null)=>Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(amount??i.Gross,"BANK_TRANSFER",Code(),[new(i.Line,amount??i.Gross)]));
    private static Task<HttpResponseMessage> Credit(HttpClient c,Inv i,decimal qty=1)=>Send(c,HttpMethod.Post,$"/sales-invoices/{i.Id}/credit-notes",new CreditNoteInput("Verified adjustment",[new(i.Line,qty)]));
    private async Task<Data> Source(HttpClient c,string basis="CASH",bool paid=true,decimal price=100,bool prepay=false,string taxCode="GST",bool stock=false)
    {
        var d=await SetupCustomer(c,basis,taxCode,stock);var i=await Invoice(c,d,price,prepay,stock);if(paid&&!prepay&&i.Gross>0)await Expect(await Receive(c,d,i),HttpStatusCode.Created);Guid? ret=null;if(stock){var moves=await Get(c,$"/warehouse/orders/{i.Order}/returnable");var r=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{i.Order}/returns",new SalesReturnInput(d.Warehouse,"RESTOCK","Verified goods return",[new(moves.GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid(),1,i.Line)])),HttpStatusCode.Created);ret=r.GetProperty("lines")[0].GetProperty("id").GetGuid();}var cn=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{i.Id}/credit-notes",new CreditNoteInput("Verified adjustment",[new(i.Line,1,ret)])),HttpStatusCode.Created);return new(d,i,cn.GetProperty("id").GetGuid(),cn.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static CustomerCreditApplicationInput Input(Data d,Inv t,decimal? amount=null,string? reference=null)=>new(reference??Code(),"Apply verified customer credit",[new(d.CreditLine,t.Line,amount??t.Gross)]);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Data d,Inv t,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/sales-credit-notes/{d.Credit}/apply",Input(d,t,amount,reference),key:key);
    private static Task<HttpResponseMessage> Undo(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customer-credit-applications/{id}/unapply",new CustomerCreditUnapplicationInput(reference??Code(),"Verified correction"),key:key);
    private static Guid App(JsonElement r)=>r.GetProperty("application").GetProperty("id").GetGuid();
    private static Guid Unapp(JsonElement r)=>r.GetProperty("unapplication").GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(amount,Code(),"Verified outgoing refund",CreditLineId:d.CreditLine));
    private static async Task<JsonElement> Cl(HttpClient c,Data d)=>(await Get(c,$"/sales-credit-notes/{d.Credit}")).GetProperty("lines").EnumerateArray().Single(x=>x.GetProperty("id").GetGuid()==d.CreditLine);
    private static async Task Consistent(HttpClient c){
        await FinancialReportAssertions.Check(c);var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
    private async Task<decimal> Balance(Guid id,string col)=>Convert.ToDecimal(await S($"SELECT {col} FROM sales.invoice_line_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",id)));
    private async Task<decimal> Gst(Guid customer)=>Convert.ToDecimal(await S("SELECT coalesce(sum(g.gst_amount),0) FROM(SELECT company_id,receipt_id,invoice_line_id,gst_amount FROM accounting.gst_attributions UNION ALL SELECT g.company_id,a.receipt_id,g.invoice_line_id,g.gst_amount FROM accounting.gst_adjustments g LEFT JOIN accounting.customer_advances a ON a.company_id=g.company_id AND a.id=g.advance_id)g LEFT JOIN accounting.customer_receipts r ON r.company_id=g.company_id AND r.id=g.receipt_id LEFT JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id LEFT JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id WHERE g.company_id=@company AND coalesce(r.customer_id,i.customer_id)=@customer",("company",db.Company),("customer",customer)));

    private async Task<decimal> Journal(Guid id,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches b JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.source_document_id=@id AND a.code=@code",("company",db.Company),("id",id),("code",code)));
    private static async Task<string> Exposure(HttpClient c,SalesData d)=>(await Get(c,$"/customers/{d.Customer}/credit")).GetRawText();
    private static Task<HttpResponseMessage> Reverse(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customer-receipts/{id}/reverse",new SettlementReversalInput(reference??Code(),"Correct erroneous receipt"),key:key);
    private static Task<HttpResponseMessage> Unapply(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/advance-applications/{id}/unapply",new SettlementReversalInput(reference??Code(),"Correct advance allocation"),key:key);
    private static Task<HttpResponseMessage> Reapply(HttpClient c,Guid reversal,Inv target,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/receipt-reversals/{reversal}/reapply",new ReceiptReapplicationInput(reference??Code(),"Correct receipt allocation",[new(target.Line,amount??target.Gross)]),key:key);
    private static Task<HttpResponseMessage> Reallocate(HttpClient c,Guid receipt,Inv target,string? key=null,string? reference=null,string? reversalReference=null)=>Send(c,HttpMethod.Post,$"/customer-receipts/{receipt}/reallocate",new ReceiptReallocationInput(reversalReference??Code(),reference??Code(),"Correct receipt allocation",[new(target.Line,target.Gross)]),key:key);
    private static Guid Rev(JsonElement r)=>r.GetProperty("reversal").GetProperty("id").GetGuid();
    private sealed record Advances(SalesData Sales,Guid Receipt,Guid Advance,Inv One,Inv Two);
    private async Task<Advances> AdvanceSource(HttpClient c,string basis="CASH",decimal price=100,DateOnly? receivedOn=null)
    {
        var d=await SetupCustomer(c,basis);var q=await Submitted(c,d.Draft(2)with{Lines=[new(d.BoxUnit,Quantity:2,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var ol=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var gross=D((await Get(c,$"/sales-orders/{o}")).GetProperty("gross"));var rc=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(gross,"BANK_TRANSFER",Code(),[],[new(ol,gross)],receivedOn)),HttpStatusCode.Created);
        async Task<Inv> Issue(){var version=(await Get(c,$"/sales-orders/{o}/invoiceable")).GetProperty("version").GetInt64();var inv=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(ol,1)],"Completed service"),version),HttpStatusCode.Created);return new(inv.GetProperty("id").GetGuid(),inv.GetProperty("lines")[0].GetProperty("id").GetGuid(),o,ol,D(inv.GetProperty("gross")));}var one=await Issue();var two=await Issue();return new(d,rc.GetProperty("id").GetGuid(),rc.GetProperty("advances")[0].GetProperty("id").GetGuid(),one,two);
    }
    private static Task<HttpResponseMessage> PayAdvance(HttpClient c,Guid ad,Inv i,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customer-advances/{ad}/apply",new AdvanceApplicationInput(reference??Code(),[new(i.Line,amount??i.Gross)]),key:key);
    private async Task<decimal> Available(Guid advance)=>Convert.ToDecimal(await S("SELECT available FROM accounting.customer_advance_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",advance)));
    private static Task<HttpResponseMessage> ReverseRefund(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customer-refunds/{id}/reverse",new CustomerRefundReversalInput(reference??Code(),"Correct erroneous refund"),key:key);
    private static Guid Rv(JsonElement r)=>r.GetProperty("reversal").GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> CorrectRefund(HttpClient c,Guid id,decimal amount,Guid? credit=null,Guid? advance=null,string? key=null,string? reference=null,string? revReference=null,bool cancel=false)=>Send(c,HttpMethod.Post,$"/customer-refunds/{id}/correct",new CustomerRefundAtomicCorrectionInput(revReference??Code(),reference??Code(),"Correct verified refund",amount,credit,advance,cancel),key:key);
    private static Task<HttpResponseMessage> ReplaceRefund(HttpClient c,Guid id,decimal amount,Guid? credit=null,Guid? advance=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customer-refund-reversals/{id}/correct",new CustomerRefundCorrectionInput(reference??Code(),"Replace corrected refund",amount,credit,advance),key:key);
    private sealed record Prepayment(SalesData Sales,Guid Order,Guid OrderLine,Guid Receipt,Guid Advance,decimal Amount);
    private async Task<Prepayment> Prepay(HttpClient c,string basis="CASH",decimal price=100,bool stock=false)
    {
        var d=await SetupCustomer(c,basis,stock:stock);var q=await Submitted(c,d.Draft(1)with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var order=await Get(c,$"/sales-orders/{o}");var line=order.GetProperty("lines")[0].GetProperty("id").GetGuid();var amount=D(order.GetProperty("gross"));var receipt=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(amount,"BANK_TRANSFER",Code(),[],[new(line,amount)])),HttpStatusCode.Created);return new(d,o,line,receipt.GetProperty("id").GetGuid(),receipt.GetProperty("advances")[0].GetProperty("id").GetGuid(),amount);
    }
    private static Task<HttpResponseMessage> RefundPrepayment(HttpClient c,Prepayment d,decimal? amount=null,bool cancel=false,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(amount??d.Amount,reference??Code(),"Verified outgoing refund",AdvanceId:d.Advance,CancelOrder:cancel),key:key);
    private async Task<decimal> AdvanceAvailable(Guid ad)=>Convert.ToDecimal(await S("SELECT available FROM accounting.customer_advance_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",ad)));
    private async Task<Data> Original(HttpClient c,string basis="CASH",decimal paid=0,bool prepay=false,bool stock=false,string taxCode="GST")
    {
        var d=await SetupCustomer(c,basis,taxCode,stock);var i=await Invoice(c,d,prepay:prepay,stock:stock);if(paid>0&&!prepay)await Expect(await Receive(c,d,i,paid),HttpStatusCode.Created);return new(d,i,default,default);
    }
    private static Task<HttpResponseMessage> Adjust(HttpClient c,Data d,decimal net=20,decimal tax=3,string? key=null,string reason="Verified price/tax adjustment")=>Send(c,HttpMethod.Post,$"/sales-invoices/{d.Invoice.Id}/amount-credit-notes",new AmountCreditInput(reason,[new(d.Invoice.Line,net,tax,"Approved price/tax correction")]),key:key);
    private static Data WithCredit(Data d,JsonElement c)=>d with{Credit=c.GetProperty("id").GetGuid(),CreditLine=c.GetProperty("lines")[0].GetProperty("id").GetGuid()};
    [Theory]
    [InlineData("CASH",0)][InlineData("CASH",55)][InlineData("CASH",110)][InlineData("NON_CASH",0)][InlineData("NON_CASH",55)][InlineData("NON_CASH",110)]
    public async Task Independent_net_and_tax_adjustments_restore_AR_credit_and_attribute_current_GST(string basis,decimal paid)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,paid);var cn=await Expect(await Adjust(c,d),HttpStatusCode.Created);Assert.Equal("AMOUNT",cn.GetProperty("creditType").GetString());Assert.Equal(JsonValueKind.Null,cn.GetProperty("lines")[0].GetProperty("quantity").ValueKind);Assert.Equal(20,D(cn.GetProperty("net")));Assert.Equal(3,D(cn.GetProperty("tax")));Assert.Equal(87-paid,Convert.ToDecimal(await S("SELECT receivable FROM crm.customer_credit_exposures WHERE company_id=@company AND customer_id=@id",("company",db.Company),("id",d.Sales.Customer))));Assert.Equal(23,await Journal(cn.GetProperty("id").GetGuid(),"1100","credit"));Assert.Equal(20,await Journal(cn.GetProperty("id").GetGuid(),"4000","debit"));Assert.Equal(3,await Journal(cn.GetProperty("id").GetGuid(),"2200","debit"));Assert.Equal(basis=="NON_CASH"?7:paid==0?0:paid==55?4.43m:10,await Gst(d.Sales.Customer));Assert.Equal(Math.Max(0,paid-87),await Balance(d.Invoice.Line,"refundable_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",0,5)][InlineData("CASH",20,0)][InlineData("NON_CASH",0,5)][InlineData("NON_CASH",20,0)]
    public async Task Tax_only_or_net_only_credit_refund_uses_explicit_tax_not_original_rate(string basis,decimal net,decimal tax)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110);d=WithCredit(d,await Expect(await Adjust(c,d,net,tax),HttpStatusCode.Created));await Expect(await Refund(c,d,net+tax),HttpStatusCode.Created);Assert.Equal(10-tax,await Gst(d.Sales.Customer));Assert.Equal(0,await Balance(d.Invoice.Line,"refundable_amount"));await Expect(await ReverseRefund(c,(Guid)(await S("SELECT id FROM accounting.customer_refunds WHERE company_id=@company AND credit_line_id=@id",("company",db.Company),("id",d.CreditLine)))!),HttpStatusCode.Created);Assert.Equal(basis=="CASH"?10:10-tax,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Quantity_credit_after_amount_adjustment_uses_only_remaining_net_tax_and_original_quantity(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110);await Expect(await Adjust(c,d),HttpStatusCode.Created);var qty=await Expect(await Credit(c,d.Invoice),HttpStatusCode.Created);Assert.Equal(80,D(qty.GetProperty("net")));Assert.Equal(7,D(qty.GetProperty("tax")));Assert.Equal(110,await Balance(d.Invoice.Line,"refundable_amount"));await Expect(await Adjust(c,d,1,0),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Later_receipt_uses_remaining_independent_tax_and_does_not_release_credit_twice(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,55);await Expect(await Adjust(c,d),HttpStatusCode.Created);await Expect(await Receive(c,d.Sales,d.Invoice,32),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Invoice.Line,"outstanding_amount"));Assert.Equal(7,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Advance_application_before_or_after_adjustment_and_refund_preserve_GST(string basis,bool alreadyApplied)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await SetupCustomer(c,basis);var i=await Invoice(c,sale,prepay:true,advanceAmount:alreadyApplied?null:110);var ad=(Guid)(await S("SELECT id FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@id",("company",db.Company),("id",i.OrderLine)))!;var d=new Data(sale,i,default,default);d=WithCredit(d,await Expect(await Adjust(c,d),HttpStatusCode.Created));
        if(alreadyApplied)await Expect(await Refund(c,d,23),HttpStatusCode.Created);else{var a=(await Expect(await PayAdvance(c,ad,i,87),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(23,await Available(ad));await Expect(await Send(c,HttpMethod.Post,$"/customers/{sale.Customer}/refunds",new CustomerRefundInput(23,Code(),"Unused prepayment refund",AdvanceId:ad)),HttpStatusCode.Created);await Consistent(c);await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await PayAdvance(c,ad,i,87),HttpStatusCode.Created);}
        Assert.Equal(7,await Gst(sale.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH","CASH")][InlineData("CASH","NON_CASH")][InlineData("NON_CASH","CASH")][InlineData("NON_CASH","NON_CASH")]
    public async Task Amount_credit_transfers_unapplies_refunds_and_reverses_refund_with_original_GST_policy(string basis,string targetBasis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110);d=WithCredit(d,await Expect(await Adjust(c,d),HttpStatusCode.Created));await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",targetBasis));var t=await Invoice(c,d.Sales,price:20);var before=await Exposure(c,d.Sales);var a=App(await Expect(await Apply(c,d,t,22),HttpStatusCode.Created));Assert.Equal(before,await Exposure(c,d.Sales));await Consistent(c);await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await Receive(c,d.Sales,t),HttpStatusCode.Created);var rf=(await Expect(await Refund(c,d,23),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(9,await Gst(d.Sales.Customer));var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));await Expect(await ReplaceRefund(c,v,23,credit:d.CreditLine),HttpStatusCode.Created);Assert.Equal(9,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Receipt_reversal_and_reapplication_after_amount_adjustment_do_not_make_unfunded_credit_refundable(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110);var rc=(Guid)(await S("SELECT receipt_id FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",d.Invoice.Line)))!;d=WithCredit(d,await Expect(await Adjust(c,d),HttpStatusCode.Created));await Expect(await Reverse(c,rc),HttpStatusCode.Created);Assert.Equal(87,await Balance(d.Invoice.Line,"outstanding_amount"));Assert.Equal(0,await Balance(d.Invoice.Line,"refundable_amount"));await Expect(await Refund(c,d,23),HttpStatusCode.Conflict);var t=await Invoice(c,d.Sales);var v=(Guid)(await S("SELECT id FROM accounting.receipt_reversals WHERE company_id=@company AND receipt_id=@id",("company",db.Company),("id",rc)))!;await Expect(await Reapply(c,v,t,110),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_post_free_amount_or_tax(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);var user=await Staff(db,role,d.Sales);using var staff=api.Authenticated(user.Subject);await Expect(await Adjust(staff,d),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("sales.credits.adjust")][InlineData("sales.credits.write")][InlineData("sales.credits.read")][InlineData("sales.invoices.read")]
    public async Task Revoked_permission_blocks_old_successful_idempotency_key(string permission)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);var user=await Staff(db,"FINANCE",d.Sales);using var staff=api.Authenticated(user.Subject);var key=Code();await Expect(await Adjust(staff,d,key:key),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(await Adjust(staff,d,key:key),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Customer_assignment_revocation_hides_cached_credit_response()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);var user=await Staff(db,"FINANCE",d.Sales);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='customers.all' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));using var staff=api.Authenticated(user.Subject);var key=Code();var id=(await Expect(await Adjust(staff,d,key:key),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@id",("company",db.Company),("id",user.Membership));await Expect(await Adjust(staff,d,key:key),HttpStatusCode.NotFound);Assert.Equal(HttpStatusCode.NotFound,(await staff.GetAsync($"/api/v1/sales-credit-notes/{id}")).StatusCode);
    }
    [Fact]
    public async Task Anonymous_portal_and_cross_company_requests_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Adjust(other,d),HttpStatusCode.NotFound);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var client in new[]{anon,portal})Assert.Equal(HttpStatusCode.Unauthorized,(await Adjust(client,d)).StatusCode);
    }
    [Theory]
    [InlineData("negative_net")][InlineData("negative_tax")][InlineData("zero")][InlineData("net_precision")][InlineData("tax_precision")][InlineData("over_net")][InlineData("over_tax")][InlineData("unknown")][InlineData("other_invoice")][InlineData("duplicate")][InlineData("empty")][InlineData("many")][InlineData("reason")][InlineData("description")][InlineData("closed")][InlineData("inactive_ar")]
    public async Task Invalid_credit_rolls_back_AR_tax_credit_and_number(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,paid:55);var line=new AmountCreditLineInput(d.Invoice.Line,20,3,"Verified adjustment");line=scenario switch{"negative_net"=>line with{Net=-1},"negative_tax"=>line with{Tax=-1},"zero"=>line with{Net=0,Tax=0},"net_precision"=>line with{Net=20.001m},"tax_precision"=>line with{Tax=3.001m},"over_net"=>line with{Net=101},"over_tax"=>line with{Tax=11},"unknown"=>line with{InvoiceLineId=Guid.NewGuid()},"description"=>line with{Description=" "},_=>line};if(scenario=="other_invoice"){var t=await Invoice(c,d.Sales);line=line with{InvoiceLineId=t.Line};}var input=new AmountCreditInput(scenario=="reason"?" ":"Verified correction",scenario switch{"duplicate"=>[line,line],"empty"=>[],"many"=>Enumerable.Range(0,51).Select(_=>line with{InvoiceLineId=Guid.NewGuid()}).ToArray(),_=>[line]});if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_ar")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1100'",("company",db.Company));var before=await Exposure(c,d.Sales);var tax=await Gst(d.Sales.Customer);var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CREDIT_NOTE'",("company",db.Company));var result=await Send(c,HttpMethod.Post,$"/sales-invoices/{d.Invoice.Id}/amount-credit-notes",input);Assert.Contains(result.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.NotFound,HttpStatusCode.Conflict,HttpStatusCode.UnprocessableEntity});Assert.Equal(before,await Exposure(c,d.Sales));Assert.Equal(tax,await Gst(d.Sales.Customer));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CREDIT_NOTE'",("company",db.Company)));Assert.Equal(0,await Balance(d.Invoice.Line,"credited_amount"));
    }
    [Fact]
    public async Task Same_key_concurrent_requests_post_once_and_changed_net_or_tax_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,paid:55);var key=Code();var all=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Adjust(c,d,key:key)));var ids=new List<Guid>();foreach(var response in all)ids.Add((await Expect(response,HttpStatusCode.Created)).GetProperty("id").GetGuid());Assert.Single(ids.Distinct());await Expect(await Adjust(c,d,20,4,key),HttpStatusCode.Conflict);Assert.Equal(23,await Balance(d.Invoice.Line,"credited_amount"));Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='sales.amount_credit_posted'",("company",db.Company)));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Different_keys_compete_for_remaining_net_or_tax_capacity(bool taxOnly)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);var all=await Task.WhenAll(Adjust(c,d,taxOnly?0:60,taxOnly?6:0),Adjust(c,d,taxOnly?0:60,taxOnly?6:0));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Late_audit_failure_rolls_back_credit_GST_journal_number_and_outbox_then_retries()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,paid:55);var key=Code();var state=await Exposure(c,d.Sales);var gst=await Gst(d.Sales.Customer);var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CREDIT_NOTE'",("company",db.Company));var events=await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company));await S("CREATE FUNCTION public.fail_amount_credit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='sales.amount_credit_posted' THEN RAISE EXCEPTION 'Injected failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_amount_credit BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_amount_credit()");try{await Expect(await Adjust(c,d,key:key),HttpStatusCode.UnprocessableEntity);Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(gst,await Gst(d.Sales.Customer));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CREDIT_NOTE'",("company",db.Company)));Assert.Equal(events,await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company)));await Consistent(c);}finally{await S("DROP TRIGGER test_amount_credit ON platform.audit_events;DROP FUNCTION public.fail_amount_credit()");}await Expect(await Adjust(c,d,key:key),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Stock_price_adjustment_does_not_move_stock_and_later_return_credits_only_remaining_money(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110,stock:true);var stock=await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company));var value=await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company));await Expect(await Adjust(c,d),HttpStatusCode.Created);Assert.Equal(stock,await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company)));Assert.Equal(value,await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company)));var moves=await Get(c,$"/warehouse/orders/{d.Invoice.Order}/returnable");var ret=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{d.Invoice.Order}/returns",new SalesReturnInput(d.Sales.Warehouse,"RESTOCK","Physical goods returned",[new(moves.GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid(),1,d.Invoice.Line)])),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{d.Invoice.Id}/credit-notes",new CreditNoteInput("Remaining original price after return",[new(d.Invoice.Line,1,ret.GetProperty("lines")[0].GetProperty("id").GetGuid())])),HttpStatusCode.Created);Assert.Equal(87,D(cn.GetProperty("gross")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Amount_credit_releases_only_actual_credit_for_new_orders(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis);await S("UPDATE crm.customers SET credit_limit=110 WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Customer));var key=Code();await Expect(await Adjust(c,d,key:key),HttpStatusCode.Created);await Expect(await Adjust(c,d,key:key),HttpStatusCode.Created);await Invoice(c,d.Sales,20);var q=await Submitted(c,d.Sales.Draft(1)with{Lines=[new(d.Sales.BoxUnit,Quantity:1,UnitPrice:1)]});await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task GST_free_line_allows_net_discount_but_never_creates_originally_unbilled_GST(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,taxCode:"FRE");await Expect(await Adjust(c,d,20,0),HttpStatusCode.Created);await Expect(await Adjust(c,d,0,.01m),HttpStatusCode.Conflict);Assert.Equal(0,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Quantity_and_amount_commands_cannot_concurrently_credit_more_than_original_invoice(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis);var all=await Task.WhenAll(Credit(c,d.Invoice),Adjust(c,d,60,6));if(all[0].StatusCode==HttpStatusCode.Created)Assert.Contains(all[1].StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});else throw new Xunit.Sdk.XunitException(await all[0].Content.ReadAsStringAsync());Assert.Equal(110,await Balance(d.Invoice.Line,"credited_amount"));await Consistent(c);
    }
    [Fact]
    public async Task SQL_permissions_and_immutable_credit_snapshots_are_enforced()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);var cn=await Expect(await Adjust(c,d),HttpStatusCode.Created);var user=await Staff(db,"OFFICE",d.Sales);await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,user.Subject,default)).Single(x=>x.CompanyId==db.Company);await using(var session=new CompanySession(source)){await session.BeginAsync(db.Company,access.ActorId,"denied-amount-credit",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT sales.post_amount_credit_note(@id,'Reason','[]')",default,("id",d.Invoice.Id)));Assert.Equal("42501",e.SqlState);}await using(var session=await db.SessionAsync()){var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"UPDATE sales.credit_note_lines SET tax=0 WHERE company_id=@company AND id=@id RETURNING id",default,("company",db.Company),("id",cn.GetProperty("lines")[0].GetProperty("id").GetGuid())));Assert.Contains(e.SqlState,new[]{"42501","23514"});}await Consistent(c);
    }
    [Fact]
    public async Task Legacy_sales_role_reseeding_cannot_grant_new_financial_authority()
    {
        await S("SELECT identity.seed_sales_roles(@company);SELECT identity.seed_sales_roles(@company)",("company",db.Company));Assert.Equal(0L,await S("SELECT count(*) FROM identity.role_permissions p JOIN identity.roles r ON r.company_id=p.company_id AND r.id=p.role_id WHERE p.company_id=@company AND p.permission_code='sales.credits.adjust' AND r.code NOT IN('ADMIN','FINANCE')",("company",db.Company)));
    }
    [Fact]
    public async Task Snapshot_preserves_original_accounts_after_mapping_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c);await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1110','New AR','ASSET','AR'),(@company,'4010','New revenue','REVENUE',NULL),(@company,'2210','New output GST','LIABILITY','GST');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code=CASE purpose WHEN 'AR' THEN '1110' ELSE '4010' END) WHERE company_id=@company AND purpose IN('AR','REVENUE');UPDATE accounting.tax_account_mappings SET output_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2210') WHERE company_id=@company",("company",db.Company));var id=(await Expect(await Adjust(c,d),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(23,await Journal(id,"1100","credit"));Assert.Equal(20,await Journal(id,"4000","debit"));Assert.Equal(3,await Journal(id,"2200","debit"));Assert.Equal(0,await Journal(id,"1110","credit"));await Consistent(c);
    }
    [Fact]
    public async Task Adjusted_advance_application_uses_current_tax_day_when_original_receipt_period_is_closed()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await SetupCustomer(c);var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!);var earlier=today.AddMonths(-1);await S("INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) SELECT @company,'amount-credit-previous',@date-interval '1 day',@date+interval '1 day' WHERE NOT EXISTS(SELECT 1 FROM accounting.periods WHERE company_id=@company AND starts_on<=@date AND ends_on>@date)",("company",db.Company),("date",earlier));await S("INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,starts_on,ends_on FROM accounting.fiscal_years WHERE company_id=@company AND label='amount-credit-previous'",("company",db.Company));var i=await Invoice(c,sale,prepay:true,advanceAmount:110,receivedOn:earlier);var ad=(Guid)(await S("SELECT id FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@id",("company",db.Company),("id",i.OrderLine)))!;var d=new Data(sale,i,default,default);await Expect(await Adjust(c,d),HttpStatusCode.Created);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",earlier));var a=(await Expect(await PayAdvance(c,ad,i,87),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(today,await S("SELECT attribution_date FROM accounting.gst_attributions WHERE company_id=@company AND source_document_id=@id AND invoice_line_id IS NOT NULL",("company",db.Company),("id",a)));await Expect(await Send(c,HttpMethod.Post,$"/customers/{sale.Customer}/refunds",new CustomerRefundInput(23,Code(),"Unused prepayment refund",AdvanceId:ad)),HttpStatusCode.Created);Assert.Equal(7,await Gst(sale.Customer));await Consistent(c);
    }
    [Fact]
    public async Task Arbitrary_credit_cent_rounding_survives_later_refund_reversal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await SetupCustomer(c);var i=await Invoice(c,sale,.05m);await Expect(await Receive(c,sale,i),HttpStatusCode.Created);var d=new Data(sale,i,default,default);d=WithCredit(d,await Expect(await Adjust(c,d,.01m,0),HttpStatusCode.Created));await Expect(await Refund(c,d,.01m),HttpStatusCode.Created);var taxCredit=WithCredit(d,await Expect(await Adjust(c,d,0,.01m),HttpStatusCode.Created));var rf=(await Expect(await Refund(c,taxCredit,.01m),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(0,await Gst(sale.Customer));await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created);Assert.Equal(.01m,await Gst(sale.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Multiple_invoice_lines_commit_atomically_and_invalid_second_line_leaves_no_partial_credit(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await SetupCustomer(c,basis);var q=await Submitted(c,sale.Draft(1)with{Lines=[new(sale.BoxUnit,Quantity:1,UnitPrice:100),new(sale.BoxUnit,Quantity:1,UnitPrice:50)]});var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var o=await Get(c,$"/sales-orders/{order}");var entries=o.GetProperty("lines").EnumerateArray().Select(x=>new InvoiceLineInput(x.GetProperty("id").GetGuid(),1)).ToArray();var inv=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/invoices",new InvoiceInput(entries,"Completed multi-line service"),(await Get(c,$"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64()),HttpStatusCode.Created);var lines=inv.GetProperty("lines").EnumerateArray().Select(x=>x.GetProperty("id").GetGuid()).ToArray();var valid=new[]{new AmountCreditLineInput(lines[0],10,1,"First correction"),new AmountCreditLineInput(lines[1],5,2,"Second correction")};await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{inv.GetProperty("id").GetGuid()}/amount-credit-notes",new AmountCreditInput("Invalid second",[valid[0],valid[1]with{Tax=100}])),HttpStatusCode.Conflict);Assert.Equal(0,await Balance(lines[0],"credited_amount"));var result=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{inv.GetProperty("id").GetGuid()}/amount-credit-notes",new AmountCreditInput("Verified multi-line",valid)),HttpStatusCode.Created);Assert.Equal(18,D(result.GetProperty("gross")));Assert.Equal(2,result.GetProperty("lines").GetArrayLength());await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Concurrent_amount_credit_and_full_receipt_obey_serial_balance_and_tax_rules(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis);var all=await Task.WhenAll(Adjust(c,d),Receive(c,d.Sales,d.Invoice));await Expect(all[0],HttpStatusCode.Created);Assert.Contains(all[1].StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});if(all[1].StatusCode==HttpStatusCode.Conflict)await Expect(await Receive(c,d.Sales,d.Invoice,87),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Invoice.Line,"outstanding_amount"));Assert.Equal(all[1].StatusCode==HttpStatusCode.Created&&basis=="CASH"?10:7,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Concurrent_tax_adjustment_and_existing_credit_refund_rebase_one_shared_invoice_GST_balance(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Original(c,basis,110);d=WithCredit(d,await Expect(await Adjust(c,d),HttpStatusCode.Created));var all=await Task.WhenAll(Adjust(c,d,0,2),Refund(c,d,23));foreach(var result in all)await Expect(result,HttpStatusCode.Created);Assert.Equal(2,await Balance(d.Invoice.Line,"refundable_amount"));Assert.Equal(basis=="CASH"?5.4m:5,await Gst(d.Sales.Customer));await Consistent(c);
    }
}
