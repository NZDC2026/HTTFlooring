using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class CustomerRefundCorrectionTests : IAsyncLifetime
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
    private static async Task<Inv> Invoice(HttpClient c,SalesData d,decimal price=100,bool prepay=false,bool stock=false,decimal? advanceAmount=null)
    {
        var q=await Submitted(c,d.Draft(1) with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();Guid advance=default;var prepaid=advanceAmount??price*1.1m;
        if(prepay){var p=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(prepaid,"BANK_TRANSFER",Code(),[],[new(line,prepaid)])),HttpStatusCode.Created);advance=p.GetProperty("advances")[0].GetProperty("id").GetGuid();}
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
    private static async Task Consistent(HttpClient c){var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
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
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Credit_refund_reversal_and_amount_correction_restore_AR_credit_and_GST(string basis,bool atomic)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var original=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();JsonElement corrected;
        if(atomic)corrected=await Expect(await CorrectRefund(c,original,55,credit:d.CreditLine),HttpStatusCode.Created);else{var v=await Expect(await ReverseRefund(c,original),HttpStatusCode.Created);Assert.StartsWith("CFR-",v.GetProperty("reversal").GetProperty("number").GetString());Assert.Equal(-110,D((await Get(c,$"/customers/{d.Sales.Customer}/credit")).GetProperty("receivable")));Assert.Equal(110,D((await Cl(c,d)).GetProperty("availableApplyAmount")));await Consistent(c);corrected=await Expect(await ReplaceRefund(c,Rv(v),55,credit:d.CreditLine),HttpStatusCode.Created);}
        Assert.Equal(-55,D((await Get(c,$"/customers/{d.Sales.Customer}/credit")).GetProperty("receivable")));Assert.Equal(55,D((await Cl(c,d)).GetProperty("availableApplyAmount")));Assert.Equal(basis=="CASH"?5:0,await Gst(d.Sales.Customer));Assert.Equal(original,corrected.GetProperty("refund").GetProperty("originalRefundId").GetGuid());Assert.Equal("REVERSED",(await Get(c,$"/customer-refunds/{original}")).GetProperty("refundStatus").GetString());await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Advance_refund_correction_restores_available_funds_without_reopening_cancelled_order(string basis,bool cancel)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,basis,stock:true);var original=(await Expect(await RefundPrepayment(c,d,cancel:cancel),HttpStatusCode.Created)).GetProperty("id").GetGuid();var status=(await Get(c,$"/sales-orders/{d.Order}")).GetProperty("state").GetString();var r=await Expect(await ReverseRefund(c,original),HttpStatusCode.Created);Assert.Equal(110,await AdvanceAvailable(d.Advance));Assert.Equal(status,(await Get(c,$"/sales-orders/{d.Order}")).GetProperty("state").GetString());Assert.Equal(cancel?0:2.2m,await Reserved(c,d.Sales));Assert.Equal(basis=="NON_CASH"&&cancel?0:10,await Gst(d.Sales.Customer));await Consistent(c);await Expect(await ReplaceRefund(c,Rv(r),55,advance:d.Advance),HttpStatusCode.Created);Assert.Equal(55,await AdvanceAvailable(d.Advance));Assert.Equal(basis=="CASH"?5:cancel?0:10,await Gst(d.Sales.Customer));Assert.Equal(status,(await Get(c,$"/sales-orders/{d.Order}")).GetProperty("state").GetString());await Consistent(c);
    }
    [Fact]
    public async Task Cash_advance_reversal_recalculates_tax_after_later_refund_instead_of_negating_zero_original_tax()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,price:0.05m);var first=(await Expect(await RefundPrepayment(c,d,0.02m),HttpStatusCode.Created)).GetProperty("id").GetGuid();var second=(await Expect(await RefundPrepayment(c,d,0.02m),HttpStatusCode.Created)).GetProperty("id").GetGuid();Assert.Equal(0,await Gst(d.Sales.Customer));await Expect(await ReverseRefund(c,first),HttpStatusCode.Created);Assert.Equal(0.01m,await Gst(d.Sales.Customer));Assert.Equal(0.04m,await AdvanceAvailable(d.Advance));await Expect(await ReverseRefund(c,second),HttpStatusCode.Created);Assert.Equal(0.01m,await Gst(d.Sales.Customer));Assert.Equal(0.06m,await AdvanceAvailable(d.Advance));await Consistent(c);
    }    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Correcting_to_larger_valid_amount_consumes_only_available_customer_credit(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var id=(await Expect(await Refund(c,d,55),HttpStatusCode.Created)).GetProperty("id").GetGuid();var r=await Expect(await CorrectRefund(c,id,110,credit:d.CreditLine),HttpStatusCode.Created);Assert.Equal(110,D(r.GetProperty("refund").GetProperty("amount")));Assert.Equal(0,D((await Cl(c,d)).GetProperty("availableApplyAmount")));Assert.Equal(0,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Restored_credit_or_cancelled_advance_cannot_be_corrected_out_after_funding_another_order(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Guid reversal;Guid? credit=null;Guid? ad=null;SalesData d;
        if(advance){var p=await Prepay(c);d=p.Sales;ad=p.Advance;var id=(await Expect(await RefundPrepayment(c,p,cancel:true),HttpStatusCode.Created)).GetProperty("id").GetGuid();reversal=Rv(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));}else{var p=await Source(c);d=p.Sales;credit=p.CreditLine;var id=(await Expect(await Refund(c,p,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();reversal=Rv(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));}
        await S("UPDATE crm.customers SET credit_limit=0 WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Customer));var q=await Submitted(c,d.Draft(1)with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:100)]});await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);var result=await Send(c,HttpMethod.Post,$"/customer-refund-reversals/{reversal}/correct",new CustomerRefundCorrectionInput(Code(),"Correction must preserve order funding",110,credit,ad,CancelOrder:advance));await Expect(result,HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Reversed_advance_refund_allows_original_receipt_reversal_but_old_correction_cannot_spend_void_funds(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,basis);var id=(await Expect(await RefundPrepayment(c,d,cancel:true),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));await Expect(await Reverse(c,d.Receipt),HttpStatusCode.Created);Assert.Equal(0,await AdvanceAvailable(d.Advance));await Expect(await ReplaceRefund(c,v,110,advance:d.Advance),HttpStatusCode.NotFound);Assert.Equal(0,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Refund_reversal_restores_credit_funds_for_transfer_and_replacement_cannot_double_spend_them(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var refund=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,refund),HttpStatusCode.Created));var t=await Invoice(c,d.Sales);var a=App(await Expect(await Apply(c,d,t),HttpStatusCode.Created));await Expect(await ReplaceRefund(c,v,110,credit:d.CreditLine),HttpStatusCode.Conflict);await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await Receive(c,d.Sales,t),HttpStatusCode.Created);await Expect(await ReplaceRefund(c,v,110,credit:d.CreditLine),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Correct_credit_refund_to_restored_advance_after_unapplying_original_settlement(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,prepay:true);var ad=(Guid)(await S("SELECT id FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@id",("company",db.Company),("id",d.Invoice.OrderLine)))!;var app=(Guid)(await S("SELECT id FROM accounting.advance_applications WHERE company_id=@company AND advance_id=@id",("company",db.Company),("id",ad)))!;var refund=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,refund),HttpStatusCode.Created));await Expect(await Unapply(c,app),HttpStatusCode.Created);await Expect(await ReplaceRefund(c,v,110,credit:d.CreditLine),HttpStatusCode.Conflict);await Expect(await ReplaceRefund(c,v,110,advance:ad),HttpStatusCode.Created);Assert.Equal(0,await AdvanceAvailable(ad));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Atomic_correction_can_move_refund_to_another_source_of_same_customer(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,basis);var i=await Invoice(c,d.Sales);await Expect(await Receive(c,d.Sales,i),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i),HttpStatusCode.Created);var line=cn.GetProperty("lines")[0].GetProperty("id").GetGuid();var id=(await Expect(await RefundPrepayment(c,d),HttpStatusCode.Created)).GetProperty("id").GetGuid();var result=await Expect(await CorrectRefund(c,id,110,credit:line),HttpStatusCode.Created);Assert.Equal(line,result.GetProperty("refund").GetProperty("creditLineId").GetGuid());Assert.Equal(110,await AdvanceAvailable(d.Advance));Assert.Equal(0,await Balance(i.Line,"refundable_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Reversal_and_correction_preserve_original_bank_and_record_the_amount_difference()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var refund=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1010','New bank','ASSET','BANK');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1010') WHERE company_id=@company AND purpose='BANK'",("company",db.Company));var r=await Expect(await CorrectRefund(c,refund,55,credit:d.CreditLine),HttpStatusCode.Created);Assert.Equal(110,await Journal(r.GetProperty("reversalId").GetGuid(),"1000","debit"));Assert.Equal(55,await Journal(r.GetProperty("refund").GetProperty("id").GetGuid(),"1000","credit"));Assert.Equal(0,await Journal(r.GetProperty("refund").GetProperty("id").GetGuid(),"1010","credit"));await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Concurrent_same_key_executes_once_and_changed_payload_conflicts(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var original=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var key=Code();var reference=Code();var revReference=Code();Func<string,string,Task<HttpResponseMessage>> send=operation switch{"reverse"=>(k,r)=>ReverseRefund(c,original,k,r),"correct"=>(k,r)=>CorrectRefund(c,original,55,credit:d.CreditLine,key:k,reference:r,revReference:revReference),_=>(k,r)=>Task.FromResult<HttpResponseMessage>(null!)};if(operation=="replace"){var v=Rv(await Expect(await ReverseRefund(c,original),HttpStatusCode.Created));send=(k,r)=>ReplaceRefund(c,v,55,credit:d.CreditLine,key:k,reference:r);}var all=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>send(key,reference)));var ids=new List<Guid>();foreach(var response in all){var body=await Expect(response,HttpStatusCode.Created);ids.Add(body.GetProperty(operation=="reverse"?"reversal":"refund").GetProperty("id").GetGuid());}Assert.Single(ids.Distinct());await Expect(await send(key,"Changed reference"),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Different_keys_cannot_duplicate_same_refund_correction(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var original=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(c,original);else if(operation=="correct")send=()=>CorrectRefund(c,original,55,credit:d.CreditLine);else{var v=Rv(await Expect(await ReverseRefund(c,original),HttpStatusCode.Created));send=()=>ReplaceRefund(c,v,55,credit:d.CreditLine);}var all=await Task.WhenAll(send(),send());Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Restored_funds_cannot_be_spent_by_receipt_reversal_and_replacement_refund_concurrently(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Task<HttpResponseMessage>[] actions;
        if(advance){var d=await Prepay(c);var rf=(await Expect(await RefundPrepayment(c,d),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));actions=[Reverse(c,d.Receipt),ReplaceRefund(c,v,110,advance:d.Advance)];}else{var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var receipt=(Guid)(await S("SELECT receipt_id FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",d.Invoice.Line)))!;var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));actions=[Reverse(c,receipt),ReplaceRefund(c,v,110,credit:d.CreditLine)];}var all=await Task.WhenAll(actions);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict||x.StatusCode==HttpStatusCode.NotFound);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_reverse_or_correct(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var id=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var staff=await Staff(db,role,d.Sales);using var f=api.Authenticated(staff.Subject);await Expect(await ReverseRefund(f,id),HttpStatusCode.Forbidden);await Expect(await CorrectRefund(f,id,55,credit:d.CreditLine),HttpStatusCode.Forbidden);var v=Rv(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));await Expect(await ReplaceRefund(f,v,55,credit:d.CreditLine),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("reverse","accounting.refunds.reverse")][InlineData("reverse","accounting.refunds.read")][InlineData("reverse","accounting.receivables.read")]
    [InlineData("correct","accounting.refunds.correct")][InlineData("correct","accounting.refunds.reverse")][InlineData("correct","accounting.refunds.write")][InlineData("correct","accounting.refunds.read")][InlineData("correct","accounting.receivables.read")]
    [InlineData("replace","accounting.refunds.correct")][InlineData("replace","accounting.refunds.write")]
    public async Task Revocation_blocks_cached_financial_response(string operation,string permission)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var rr=Code();Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(f,rf,key,reference);else if(operation=="correct")send=()=>CorrectRefund(f,rf,55,credit:d.CreditLine,key:key,reference:reference,revReference:rr);else{var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));send=()=>ReplaceRefund(f,v,55,credit:d.CreditLine,key:key,reference:reference);}await Expect(await send(),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(await send(),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Customer_assignment_revocation_hides_cached_mutation_and_reversal_history()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var staff=await Staff(db,"FINANCE",d.Sales);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='customers.all' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var v=Rv(await Expect(await ReverseRefund(f,rf,key,reference),HttpStatusCode.Created));await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@id",("company",db.Company),("id",staff.Membership));await Expect(await ReverseRefund(f,rf,key,reference),HttpStatusCode.NotFound);await Expect(await ReplaceRefund(f,v,55,credit:d.CreditLine),HttpStatusCode.NotFound);await Expect(await f.GetAsync($"/api/v1/customer-refund-reversals/{v}"),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Anonymous_portal_and_other_company_cannot_read_or_modify_refund_corrections()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));using var other=api.Authenticated(company:db.OtherCompany);await Expect(await ReverseRefund(other,rf),HttpStatusCode.NotFound);await Expect(await ReplaceRefund(other,v,55,credit:d.CreditLine),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/customer-refund-reversals/{v}"),HttpStatusCode.NotFound);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var client in new[]{anon,portal})Assert.Equal(HttpStatusCode.Unauthorized,(await ReverseRefund(client,rf)).StatusCode);
    }
    [Theory]
    [InlineData("negative")][InlineData("zero")][InlineData("precision")][InlineData("over")][InlineData("none")][InlineData("both")][InlineData("unknown")][InlineData("customer")][InlineData("closed")][InlineData("reference")][InlineData("reason")][InlineData("inactive_bank")]
    public async Task Invalid_atomic_correction_preserves_original_refund_and_does_not_consume_numbers(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var input=new CustomerRefundAtomicCorrectionInput(Code(),Code(),"Correct refund",55,CreditLineId:d.CreditLine);input=scenario switch{"negative"=>input with{Amount=-1},"zero"=>input with{Amount=0},"precision"=>input with{Amount=55.001m},"over"=>input with{Amount=111},"none"=>input with{CreditLineId=null},"both"=>input with{AdvanceId=Guid.NewGuid()},"unknown"=>input with{CreditLineId=Guid.NewGuid()},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},_=>input};if(scenario=="customer"){var other=await Source(c);input=input with{CreditLineId=other.CreditLine};}if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_bank")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1000'",("company",db.Company));var state=await Exposure(c,d.Sales);var tax=await Gst(d.Sales.Customer);var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var result=await Send(c,HttpMethod.Post,$"/customer-refunds/{rf}/correct",input);Assert.Contains(result.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity,HttpStatusCode.Conflict,HttpStatusCode.NotFound});Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(tax,await Gst(d.Sales.Customer));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.customer_refund_reversals WHERE company_id=@company",("company",db.Company)));
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Late_audit_failure_rolls_back_bank_AR_GST_credit_numbers_and_outbox_and_retries(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var key=Code();var reference=Code();var rr=Code();Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(c,rf,key,reference);else if(operation=="correct")send=()=>CorrectRefund(c,rf,55,credit:d.CreditLine,key:key,reference:reference,revReference:rr);else{var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));send=()=>ReplaceRefund(c,v,55,credit:d.CreditLine,key:key,reference:reference);}var state=await Exposure(c,d.Sales);var tax=await Gst(d.Sales.Customer);var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var events=await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company));var action=operation=="reverse"?"accounting.customer_refund_reversed":"accounting.customer_refund_corrected";await S("CREATE FUNCTION public.fail_customer_refund() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected refund failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_customer_refund BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_customer_refund()");try{await Expect(await send(),HttpStatusCode.UnprocessableEntity);Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(tax,await Gst(d.Sales.Customer));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(events,await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company)));await Consistent(c);}finally{await S("DROP TRIGGER test_customer_refund ON platform.audit_events;DROP FUNCTION public.fail_customer_refund()");}await Expect(await send(),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Old_refund_key_after_reversal_never_reactivates_original_bank_payment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c);var key=Code();var reference=Code();var old=(await Expect(await RefundPrepayment(c,d,key:key,reference:reference),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await ReverseRefund(c,old),HttpStatusCode.Created);Assert.Equal(old,(await Expect(await RefundPrepayment(c,d,key:key,reference:reference),HttpStatusCode.Created)).GetProperty("id").GetGuid());Assert.Equal(110,await AdvanceAvailable(d.Advance));Assert.Equal("REVERSED",(await Get(c,$"/customer-refunds/{old}")).GetProperty("refundStatus").GetString());await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Restored_prepaid_balance_can_be_applied_or_refunded_but_not_both(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,basis);var old=(await Expect(await RefundPrepayment(c,d),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,old),HttpStatusCode.Created));var version=(await Get(c,$"/sales-orders/{d.Order}/invoiceable")).GetProperty("version").GetInt64();var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{d.Order}/invoices",new InvoiceInput([new(d.OrderLine,1)],"Completed service"),version),HttpStatusCode.Created);var line=invoice.GetProperty("lines")[0].GetProperty("id").GetGuid();var all=await Task.WhenAll(Send(c,HttpMethod.Post,$"/customer-advances/{d.Advance}/apply",new AdvanceApplicationInput(Code(),[new(line,110)])),ReplaceRefund(c,v,110,advance:d.Advance));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Cancelled_order_refund_correction_does_not_restore_commitment_or_reserve_stock(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Prepay(c,basis,stock:true);var old=(await Expect(await RefundPrepayment(c,d,cancel:true),HttpStatusCode.Created)).GetProperty("id").GetGuid();var before=await S("SELECT released_amount FROM sales.credit_commitments WHERE company_id=@company AND order_id=@id",("company",db.Company),("id",d.Order));var date=await S("SELECT cancelled_at FROM sales.orders WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Order));await Expect(await CorrectRefund(c,old,55,advance:d.Advance,cancel:true),HttpStatusCode.Created);Assert.Equal(before,await S("SELECT released_amount FROM sales.credit_commitments WHERE company_id=@company AND order_id=@id",("company",db.Company),("id",d.Order)));Assert.Equal(date,await S("SELECT cancelled_at FROM sales.orders WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Order)));Assert.Equal(0,await Reserved(c,d.Sales));Assert.Equal(55,await AdvanceAvailable(d.Advance));await Consistent(c);
    }
    [Fact]
    public async Task SQL_commands_recheck_member_permissions_and_reversal_facts_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rv(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var user=await Staff(db,"OFFICE",d.Sales);await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,user.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT accounting.reverse_customer_refund(@id,'DIRECT','Reason')","SELECT accounting.replace_customer_refund(@id,NULL,NULL,1,'DIRECT','Reason',false)"}){await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"denied-refund",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",rf)));Assert.Equal("42501",e.SqlState);}foreach(var sql in new[]{"UPDATE accounting.customer_refund_reversals SET reason='edit' WHERE company_id=@company AND id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",v)));Assert.Contains(e.SqlState,new[]{"42501","23514"});}await Consistent(c);
    }

    [Fact]
    public async Task Credit_refund_reversal_rebases_current_tax_after_a_later_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,price:0.05m);var first=(await Expect(await Refund(c,d,0.02m),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Refund(c,d,0.02m),HttpStatusCode.Created);Assert.Equal(0,await Gst(d.Sales.Customer));var v=await Expect(await ReverseRefund(c,first),HttpStatusCode.Created);Assert.Equal(0.01m,await Gst(d.Sales.Customer));Assert.Equal(0.01m,D(v.GetProperty("gstAdjustments")[0].GetProperty("gstAmount")));await Expect(await ReplaceRefund(c,Rv(v),0.04m,credit:d.CreditLine),HttpStatusCode.Created);Assert.Equal(0,await Gst(d.Sales.Customer));await Consistent(c);
    }
    [Fact]
    public async Task Stock_return_and_credit_remain_in_place_when_refund_is_reversed()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,stock:true);var old=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var stock=await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company));var value=await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company));var v=Rv(await Expect(await ReverseRefund(c,old),HttpStatusCode.Created));Assert.Equal(stock,await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company)));Assert.Equal(value,await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company)));Assert.Equal(0,await Journal(v,"1200","debit"));Assert.Equal(0,await Journal(v,"5000","debit"));Assert.Equal(110,D((await Cl(c,d)).GetProperty("availableApplyAmount")));await Consistent(c);
    }

    private async Task<HttpResponseMessage> Visibility(HttpClient c,Guid id,bool restore=false,long life=1)
    {
        var business=Convert.ToInt64(await S("SELECT version FROM platform.documents WHERE company_id=@company AND id=@id",("company",db.Company),("id",id)));using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{id}/"+(restore?"restore":"trash"));request.Headers.Add("Idempotency-Key",Code());request.Headers.Add("If-Match",$"\"{life}\"");request.Headers.Add("X-Document-Version",business.ToString());request.Content=System.Net.Http.Json.JsonContent.Create(new{reason="Reviewed refund source visibility"});return await c.SendAsync(request);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Archived_refund_sources_require_visibility_restore_before_funds_return(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Guid source;Guid rf;if(advance){var d=await Prepay(c);source=d.Order;rf=(await Expect(await RefundPrepayment(c,d,cancel:true),HttpStatusCode.Created)).GetProperty("id").GetGuid();}else{var d=await Source(c);source=d.Invoice.Id;rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();}await Expect(await Visibility(c,source),HttpStatusCode.OK);await Expect(await ReverseRefund(c,rf),HttpStatusCode.Conflict);await Expect(await Visibility(c,source,true,2),HttpStatusCode.OK);await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Concurrent_invoice_archive_and_refund_reversal_cannot_hide_restored_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=(await Expect(await Refund(c,d,110),HttpStatusCode.Created)).GetProperty("id").GetGuid();var all=await Task.WhenAll(Visibility(c,d.Invoice.Id),ReverseRefund(c,rf));Assert.Single(all,x=>x.StatusCode is HttpStatusCode.OK or HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }

}
