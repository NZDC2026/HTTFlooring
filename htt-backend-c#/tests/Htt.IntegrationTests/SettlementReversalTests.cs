using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SettlementReversalTests : IAsyncLifetime
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
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Receipt_reverse_and_reapply_preserve_history_and_correct_AR_credit_and_GST(string basis,bool atomic)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c,basis);var one=await Invoice(c,d);var two=await Invoice(c,d);var rc=await Expect(await Receive(c,d,one),HttpStatusCode.Created);var id=rc.GetProperty("id").GetGuid();var before=await Exposure(c,d);JsonElement result;
        if(atomic)result=await Expect(await Reallocate(c,id,two),HttpStatusCode.Created);else{var v=await Expect(await Reverse(c,id),HttpStatusCode.Created);Assert.Equal(110,await Balance(one.Line,"outstanding_amount"));Assert.Equal(220,D((await Get(c,$"/customers/{d.Customer}/credit")).GetProperty("receivable")));await Consistent(c);result=await Expect(await Reapply(c,Rev(v),two),HttpStatusCode.Created);}
        Assert.Equal(before,await Exposure(c,d));Assert.Equal(110,await Balance(one.Line,"outstanding_amount"));Assert.Equal(0,await Balance(two.Line,"outstanding_amount"));Assert.Equal(basis=="CASH"?10:20,await Gst(d.Customer));Assert.Equal("REVERSED",(await Get(c,$"/customer-receipts/{id}")).GetProperty("settlementStatus").GetString());Assert.Equal(id,result.GetProperty("receipt").GetProperty("originalReceiptId").GetGuid());Assert.Equal(110,D(rc.GetProperty("amount")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Advance_unapply_restores_funds_and_reapply_to_another_invoice_without_double_credit_release(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c,basis);var a=await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created);var before=await Exposure(c,d.Sales);var gst=await Gst(d.Sales.Customer);var u=await Expect(await Unapply(c,a.GetProperty("id").GetGuid()),HttpStatusCode.Created);Assert.StartsWith("AAU-",u.GetProperty("unapplication").GetProperty("number").GetString());Assert.Equal(220,await Available(d.Advance));Assert.Equal(110,await Balance(d.One.Line,"outstanding_amount"));Assert.Equal(gst,await Gst(d.Sales.Customer));await Consistent(c);await Expect(await PayAdvance(c,d.Advance,d.Two),HttpStatusCode.Created);Assert.Equal(before,await Exposure(c,d.Sales));Assert.Equal(0,await Balance(d.Two.Line,"outstanding_amount"));Assert.Equal(110,await Balance(d.One.Line,"outstanding_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Advance_receipt_can_reverse_after_unapply_even_when_invoices_have_cleared_prepaid_GST(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c,basis);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Reverse(c,d.Receipt),HttpStatusCode.Conflict);await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await Reverse(c,d.Receipt),HttpStatusCode.Created);Assert.Equal(0,await Available(d.Advance));await Expect(await PayAdvance(c,d.Advance,d.Two),HttpStatusCode.NotFound);Assert.Equal(basis=="CASH"?0:20,await Gst(d.Sales.Customer));await Consistent(c);
    }    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Receipt_used_by_cross_invoice_credit_requires_downstream_unapplication_first(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var rid=(Guid)(await S("SELECT receipt_id FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",d.Invoice.Line)))!;var t=await Invoice(c,d.Sales);var a=App(await Expect(await Apply(c,d,t),HttpStatusCode.Created));await Expect(await Reverse(c,rid),HttpStatusCode.Conflict);await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await Reverse(c,rid),HttpStatusCode.Created);Assert.Equal(0,D((await Cl(c,d)).GetProperty("availableApplyAmount")));await Expect(await Apply(c,d,t),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Credit_refunds_prevent_removing_original_receipt_or_advance_funding(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();if(advance){var d=await AdvanceSource(c);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();var cn=await Expect(await Credit(c,d.One),HttpStatusCode.Created);await Expect(await Credit(c,d.Two),HttpStatusCode.Created);var line=cn.GetProperty("lines")[0].GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(55,Code(),"Actual outgoing refund",CreditLineId:line)),HttpStatusCode.Created);await Expect(await Unapply(c,a),HttpStatusCode.Conflict);await Consistent(c);}else{var d=await Source(c);var rid=(Guid)(await S("SELECT receipt_id FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",d.Invoice.Line)))!;await Expect(await Refund(c,d,55),HttpStatusCode.Created);await Expect(await Reverse(c,rid),HttpStatusCode.Conflict);await Consistent(c);}
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Restored_advance_can_be_refunded_and_receipt_cannot_then_be_voided(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c,basis);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(220,Code(),"Actual outgoing refund",AdvanceId:d.Advance)),HttpStatusCode.Created);Assert.Equal(0,await Available(d.Advance));await Expect(await Reverse(c,d.Receipt),HttpStatusCode.Conflict);await Expect(await PayAdvance(c,d.Advance,d.Two),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Effective_credit_capacity_prevents_double_release_but_correction_may_reveal_an_overdue_credit_exposure()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var one=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("UPDATE crm.customers SET credit_limit=0 WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Customer));await Expect(await Reverse(c,rid),HttpStatusCode.Created);Assert.Equal(110,D((await Get(c,$"/customers/{d.Customer}/credit")).GetProperty("receivable")));var q=await Submitted(c,d.Draft(1)with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:1)]});await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Replacement_preserves_original_bank_even_if_current_bank_mapping_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var one=await Invoice(c,d);var two=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1010','New Bank','ASSET','BANK');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1010') WHERE company_id=@company AND purpose='BANK'",("company",db.Company));var result=await Expect(await Reallocate(c,rid,two),HttpStatusCode.Created);var replacement=result.GetProperty("receipt").GetProperty("id").GetGuid();var reversal=result.GetProperty("reversalId").GetGuid();Assert.Equal(110,await Journal(reversal,"1000","credit"));Assert.Equal(110,await Journal(replacement,"1000","debit"));Assert.Equal(0,await Journal(replacement,"1010","debit"));await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reapply")][InlineData("reallocate")]
    public async Task Concurrent_same_key_executes_once_and_changed_payload_conflicts(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var key=Code();var reference=Code();Guid target;Inv inv;Func<string,string,Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var d=await AdvanceSource(c);target=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();send=(k,r)=>Unapply(c,target,k,r);}
        else{var d=await SetupCustomer(c);var one=await Invoice(c,d);inv=await Invoice(c,d);target=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();if(operation=="reapply"){target=Rev(await Expect(await Reverse(c,target),HttpStatusCode.Created));send=(k,r)=>Reapply(c,target,inv,key:k,reference:r);}else if(operation=="reallocate"){var rr=Code();send=(k,r)=>Reallocate(c,target,inv,k,r,rr);}else send=(k,r)=>Reverse(c,target,k,r);}
        var all=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>send(key,reference)));var bodies=new List<string>();foreach(var response in all)bodies.Add((await Expect(response,HttpStatusCode.Created)).GetProperty(operation=="unapply"?"unapplication":operation=="reverse"?"reversal":"receipt").GetProperty("id").GetGuid().ToString());Assert.Single(bodies.Distinct());await Expect(await send(key,"Changed reference"),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reapply")][InlineData("reallocate")]
    public async Task Different_keys_cannot_duplicate_corrections(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Func<Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var d=await AdvanceSource(c);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();send=()=>Unapply(c,a);}
        else{var d=await SetupCustomer(c);var one=await Invoice(c,d);var two=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();if(operation=="reapply"){var v=Rev(await Expect(await Reverse(c,rid),HttpStatusCode.Created));send=()=>Reapply(c,v,two);}else if(operation=="reallocate")send=()=>Reallocate(c,rid,two);else send=()=>Reverse(c,rid);}
        var all=await Task.WhenAll(send(),send());Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Concurrent_receipt_replacement_and_independent_receipt_cannot_overpay_target()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var one=await Invoice(c,d);var two=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();var all=await Task.WhenAll(Reallocate(c,rid,two),Receive(c,d,two));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await Balance(two.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Original_idempotency_keys_after_unapplication_do_not_reactivate_old_allocations()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c);var key=Code();var reference=Code();var a=(await Expect(await PayAdvance(c,d.Advance,d.One,key:key,reference:reference),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Unapply(c,a),HttpStatusCode.Created);Assert.Equal(a,(await Expect(await PayAdvance(c,d.Advance,d.One,key:key,reference:reference),HttpStatusCode.Created)).GetProperty("id").GetGuid());Assert.Equal(110,await Balance(d.One.Line,"outstanding_amount"));Assert.Equal(220,await Available(d.Advance));await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_reverse_unapply_or_reapply(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();var staff=await Staff(db,role,d.Sales);using var f=api.Authenticated(staff.Subject);await Expect(await Reverse(f,d.Receipt),HttpStatusCode.Forbidden);await Expect(await Unapply(f,a),HttpStatusCode.Forbidden);await Expect(await Reallocate(f,d.Receipt,d.One),HttpStatusCode.Forbidden);await Expect(await Unapply(c,a),HttpStatusCode.Created);var v=Rev(await Expect(await Reverse(c,d.Receipt),HttpStatusCode.Created));await Expect(await Reapply(f,v,d.One),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("reverse","accounting.receipts.reverse")][InlineData("reverse","accounting.receipts.read")][InlineData("reverse","accounting.receivables.read")]
    [InlineData("unapply","accounting.advances.unapply")][InlineData("unapply","accounting.receipts.read")][InlineData("unapply","accounting.receivables.read")]
    [InlineData("reapply","accounting.receipts.reapply")][InlineData("reapply","accounting.receipts.write")][InlineData("reapply","accounting.receipts.read")][InlineData("reapply","accounting.receivables.read")]
    public async Task Revoked_permission_blocks_cached_correction(string operation,string permission)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();Func<Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var d=await AdvanceSource(c);var a=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();send=()=>Unapply(f,a,key,reference);}else{var d=await SetupCustomer(c);var one=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();if(operation=="reapply"){var v=Rev(await Expect(await Reverse(c,rid),HttpStatusCode.Created));send=()=>Reapply(f,v,one,key:key,reference:reference);}else send=()=>Reverse(f,rid,key,reference);}await Expect(await send(),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(await send(),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Customer_scope_revocation_blocks_cached_write_and_read_and_portal_and_other_company_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var one=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();var staff=await Staff(db,"FINANCE",d);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='customers.all' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var v=Rev(await Expect(await Reverse(f,rid,key,reference),HttpStatusCode.Created));await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@id",("company",db.Company),("id",staff.Membership));await Expect(await Reverse(f,rid,key,reference),HttpStatusCode.NotFound);await Expect(await f.GetAsync($"/api/v1/receipt-reversals/{v}"),HttpStatusCode.NotFound);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Reverse(other,rid),HttpStatusCode.NotFound);await Expect(await Reapply(other,v,one),HttpStatusCode.NotFound);using var portal=api.Authenticated(audience:"htt-test-portal");using var anon=api.CreateClient();foreach(var client in new[]{portal,anon})Assert.Equal(HttpStatusCode.Unauthorized,(await Reverse(client,rid)).StatusCode);
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reallocate")]
    public async Task Late_audit_failure_rolls_back_and_same_key_retries(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Guid doc;Func<Task<HttpResponseMessage>> send;SalesData customer;var key=Code();var reference=Code();
        if(operation=="unapply"){var d=await AdvanceSource(c);customer=d.Sales;doc=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();send=()=>Unapply(c,doc,key,reference);}else{var d=await SetupCustomer(c);customer=d;var one=await Invoice(c,d);var two=await Invoice(c,d);doc=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();var rr=Code();send=operation=="reverse"?()=>Reverse(c,doc,key,reference):()=>Reallocate(c,doc,two,key,reference,rr);}
        var action=operation switch{"unapply"=>"accounting.advance_unapplied","reallocate"=>"accounting.customer_receipt_reapplied",_=>"accounting.customer_receipt_reversed"};var before=await Exposure(c,customer);var gst=await Gst(customer.Customer);var audit=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company));var sequence=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));await S("CREATE FUNCTION public.fail_settlement() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected settlement failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_settlement BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_settlement()");try{await Expect(await send(),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Exposure(c,customer));Assert.Equal(gst,await Gst(customer.Customer));Assert.Equal(audit,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company)));Assert.Equal(sequence,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));await Consistent(c);}finally{await S("DROP TRIGGER test_settlement ON platform.audit_events;DROP FUNCTION public.fail_settlement()");}await Expect(await send(),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("empty")][InlineData("negative")][InlineData("precision")][InlineData("duplicate")][InlineData("customer")][InlineData("unknown")][InlineData("closed")][InlineData("reference")][InlineData("reason")]
    public async Task Invalid_reallocation_does_not_reverse_original_receipt(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var one=await Invoice(c,d);var two=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,one),HttpStatusCode.Created)).GetProperty("id").GetGuid();var input=new ReceiptReallocationInput(Code(),Code(),"Correct receipt",[new(two.Line,110)]);input=scenario switch{"empty"=>input with{Allocations=[]},"negative"=>input with{Allocations=[new(two.Line,-1)]},"precision"=>input with{Allocations=[new(two.Line,110.001m)]},"duplicate"=>input with{Allocations=[new(two.Line,55),new(two.Line,55)]},"unknown"=>input with{Allocations=[new(Guid.NewGuid(),110)]},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},_=>input};if(scenario=="customer"){var e=await SetupCustomer(c);var t=await Invoice(c,e);input=input with{Allocations=[new(t.Line,110)]};}if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));var state=await Exposure(c,d);var response=await Send(c,HttpMethod.Post,$"/customer-receipts/{rid}/reallocate",input);Assert.Contains(response.StatusCode,new[]{HttpStatusCode.Conflict,HttpStatusCode.NotFound,HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity});Assert.Equal(state,await Exposure(c,d));Assert.Equal(0,await Balance(one.Line,"outstanding_amount"));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.receipt_reversals WHERE company_id=@company",("company",db.Company)));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Refund_and_settlement_reversal_cannot_both_spend_same_credited_funds(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Task<HttpResponseMessage>[] actions;
        if(advance){var d=await AdvanceSource(c);var app=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();var cn=await Expect(await Credit(c,d.One),HttpStatusCode.Created);await Expect(await Credit(c,d.Two),HttpStatusCode.Created);var line=cn.GetProperty("lines")[0].GetProperty("id").GetGuid();actions=[Unapply(c,app),Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(55,Code(),"Actual refund",CreditLineId:line))];}
        else{var d=await Source(c);var rid=(Guid)(await S("SELECT receipt_id FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",d.Invoice.Line)))!;actions=[Reverse(c,rid),Refund(c,d,55)];}var all=await Task.WhenAll(actions);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Refunding_restored_advance_competes_with_new_application(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c,basis);var app=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Unapply(c,app),HttpStatusCode.Created);var all=await Task.WhenAll(PayAdvance(c,d.Advance,d.Two),Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(220,Code(),"Actual refund",AdvanceId:d.Advance)));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Fractional_advance_unapplication_after_refund_keeps_tax_and_remaining_funds_bounded()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await AdvanceSource(c,price:0.05m);var app=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(0.02m,Code(),"Actual partial refund",AdvanceId:d.Advance)),HttpStatusCode.Created);var tax=await Gst(d.Sales.Customer);await Expect(await Unapply(c,app),HttpStatusCode.Created);Assert.Equal(0.09m,await Available(d.Advance));Assert.Equal(tax,await Gst(d.Sales.Customer));await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created);Assert.Equal(0.03m,await Available(d.Advance));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Mixed_direct_and_uninvoiced_advance_receipt_reverses_and_reapplies_atomically(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c,basis);var inv=await Invoice(c,d);var q=await Submitted(c,d.Draft(1)with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:100)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var ol=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var original=(await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(220,"BANK_TRANSFER",Code(),[new(inv.Line,110)],[new(ol,110)])),HttpStatusCode.Created)).GetProperty("id").GetGuid();var before=await Exposure(c,d);var tax=await Gst(d.Customer);var replacement=await Expect(await Send(c,HttpMethod.Post,$"/customer-receipts/{original}/reallocate",new ReceiptReallocationInput(Code(),Code(),"Correct mixed payment",[new(inv.Line,110)],[new(ol,110)])),HttpStatusCode.Created);Assert.Equal(before,await Exposure(c,d));Assert.Equal(tax,await Gst(d.Customer));var receipt=replacement.GetProperty("receipt");Assert.Equal(220,D(receipt.GetProperty("amount")));Assert.Equal(110,await Available(receipt.GetProperty("advances")[0].GetProperty("id").GetGuid()));await Consistent(c);
    }
    [Fact]
    public async Task SQL_checks_membership_and_new_events_and_originals_remain_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupCustomer(c);var inv=await Invoice(c,d);var rid=(await Expect(await Receive(c,d,inv),HttpStatusCode.Created)).GetProperty("id").GetGuid();var v=Rev(await Expect(await Reverse(c,rid),HttpStatusCode.Created));var staff=await Staff(db,"OFFICE",d);await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT accounting.reverse_receipt(@id,'DIRECT','Reason')","SELECT accounting.unapply_advance(@id,'DIRECT','Reason')","SELECT accounting.reapply_receipt(@id,'DIRECT','Reason','[]','[]')"}){await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"denied-reversal",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",rid)));Assert.Equal("42501",e.SqlState);}foreach(var sql in new[]{"UPDATE accounting.receipt_reversals SET reason='edit' WHERE company_id=@company AND id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",v)));Assert.Contains(e.SqlState,new[]{"42501","23514"});}await Consistent(c);
    }

    [Theory]
    [InlineData("CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Corrections_use_current_period_without_reopening_original_receipt_period(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var previous=DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(-1);await S("INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) SELECT @company,'historical-correction-test',@date-interval '1 day',@date+interval '1 day' WHERE NOT EXISTS(SELECT 1 FROM accounting.periods WHERE company_id=@company AND starts_on<=@date AND ends_on>@date)",("company",db.Company),("date",previous));await S("INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,starts_on,ends_on FROM accounting.fiscal_years WHERE company_id=@company AND label='historical-correction-test'",("company",db.Company));
        if(advance){var d=await AdvanceSource(c,basis,receivedOn:previous);var app=(await Expect(await PayAdvance(c,d.Advance,d.One),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",previous));await Expect(await Unapply(c,app),HttpStatusCode.Created);await Expect(await PayAdvance(c,d.Advance,d.Two),HttpStatusCode.Created);await Consistent(c);}
        else{var d=await SetupCustomer(c,basis);var one=await Invoice(c,d);var rid=(await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(110,"BANK_TRANSFER",Code(),[new(one.Line,110)],ReceivedOn:previous)),HttpStatusCode.Created)).GetProperty("id").GetGuid();await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",previous));await Expect(await Reallocate(c,rid,one),HttpStatusCode.Created);await Consistent(c);}
    }

    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Repeated_corrections_then_credit_transfer_use_effective_tax_and_funds_only(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Inv inv;SalesData d;
        if(advance){var source=await AdvanceSource(c,basis);d=source.Sales;inv=source.One;for(var n=0;n<3;n++){var a=(await Expect(await PayAdvance(c,source.Advance,inv),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Unapply(c,a),HttpStatusCode.Created);}await Expect(await PayAdvance(c,source.Advance,inv),HttpStatusCode.Created);}
        else{d=await SetupCustomer(c,basis);inv=await Invoice(c,d);var receipt=(await Expect(await Receive(c,d,inv),HttpStatusCode.Created)).GetProperty("id").GetGuid();for(var n=0;n<3;n++)receipt=(await Expect(await Reallocate(c,receipt,inv),HttpStatusCode.Created)).GetProperty("receipt").GetProperty("id").GetGuid();}
        var cn=await Expect(await Credit(c,inv),HttpStatusCode.Created);var target=await Invoice(c,d);var transfer=await Expect(await Send(c,HttpMethod.Post,$"/sales-credit-notes/{cn.GetProperty("id").GetGuid()}/apply",new CustomerCreditApplicationInput(Code(),"Use effective settled credit",[new(cn.GetProperty("lines")[0].GetProperty("id").GetGuid(),target.Line,110)])),HttpStatusCode.Created);Assert.Equal(0,await Balance(target.Line,"outstanding_amount"));await Expect(await Undo(c,App(transfer)),HttpStatusCode.Created);await Consistent(c);
    }

}
