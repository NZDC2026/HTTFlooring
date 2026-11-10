using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class CustomerCreditApplicationTests : IAsyncLifetime
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
    private async Task<decimal> Gst(Guid customer)=>Convert.ToDecimal(await S("SELECT coalesce(sum(v),0) FROM(SELECT g.gst_amount AS v FROM accounting.gst_attributions g JOIN sales.invoice_lines il ON il.company_id=g.company_id AND il.id=g.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE i.company_id=@company AND i.customer_id=@customer UNION ALL SELECT g.gst_amount FROM accounting.gst_adjustments g JOIN sales.invoice_lines il ON il.company_id=g.company_id AND il.id=g.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE i.company_id=@company AND i.customer_id=@customer)q",("company",db.Company),("customer",customer)));
    private async Task<decimal> Journal(Guid id,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches b JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.source_document_id=@id AND a.code=@code",("company",db.Company),("id",id),("code",code)));
    private static async Task<string> Exposure(HttpClient c,SalesData d)=>(await Get(c,$"/customers/{d.Customer}/credit")).GetRawText();
    [Theory]
    [InlineData("CASH","CASH")][InlineData("CASH","NON_CASH")][InlineData("NON_CASH","CASH")][InlineData("NON_CASH","NON_CASH")]
    public async Task Transfers_and_unapplications_restore_invoice_balances_without_changing_customer_credit_or_accrual_GST_GL(string sourceBasis,string targetBasis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,sourceBasis);await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",targetBasis));var t=await Invoice(c,d.Sales);var state=await Exposure(c,d.Sales);var before=await Gst(d.Sales.Customer);var r=await Expect(await Apply(c,d,t),HttpStatusCode.Created);Assert.StartsWith("CCA-",r.GetProperty("application").GetProperty("number").GetString());Assert.Equal(110,await Journal(App(r),"1100","debit"));Assert.Equal(110,await Journal(App(r),"1100","credit"));Assert.Equal(0,await Journal(App(r),"1000","debit"));Assert.Equal(0,await Journal(App(r),"2200","debit"));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(10,await Gst(d.Sales.Customer));await Consistent(c);
        var u=await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.StartsWith("CCU-",u.GetProperty("unapplication").GetProperty("number").GetString());Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));Assert.Equal(110,D((await Cl(c,d)).GetProperty("availableApplyAmount")));Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(before,await Gst(d.Sales.Customer));Assert.Equal("UNAPPLIED",(await Get(c,$"/customer-credit-applications/{App(r)}")).GetProperty("application").GetProperty("applicationStatus").GetString());await Consistent(c);
    }

    [Fact]
    public async Task Original_unpaid_credit_cannot_be_spent_twice_on_another_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false);var t=await Invoice(c,d.Sales);await Expect(await Apply(c,d,t),HttpStatusCode.Conflict);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Partial_multitarget_application_is_canonical_and_whole_unapplication_restores_each_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var e=await Invoice(c,d.Sales);var input=new CustomerCreditApplicationInput(Code(),"Two invoices",[new(d.CreditLine,t.Line,55),new(d.CreditLine,e.Line,55)]);var key=Code();var a=await Expect(await Send(c,HttpMethod.Post,$"/sales-credit-notes/{d.Credit}/apply",input,key:key),HttpStatusCode.Created);var before=await Exposure(c,d.Sales);Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));Assert.Equal(55,await Balance(e.Line,"outstanding_amount"));var b=await Expect(await Send(c,HttpMethod.Post,$"/sales-credit-notes/{d.Credit}/apply",input with{Lines=input.Lines!.Reverse().ToArray()},key:key),HttpStatusCode.Created);Assert.Equal(App(a),App(b));await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));Assert.Equal(110,await Balance(e.Line,"outstanding_amount"));Assert.Equal(before,await Exposure(c,d.Sales));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Advance_settled_source_supports_transfer_and_unapply_without_restoring_used_advance(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,prepay:true);var t=await Invoice(c,d.Sales);var before=await Exposure(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(before,await Exposure(c,d.Sales));Assert.Equal(0,D((await Get(c,$"/customers/{d.Sales.Customer}/credit")).GetProperty("availableAdvances")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Existing_receipt_or_advance_settles_only_residual_invoice_and_remains_valid_after_unapply(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var t=await Invoice(c,d.Sales,prepay:advance,advanceAmount:advance?55:null);var a=await Expect(await Apply(c,d,t,55),HttpStatusCode.Created);
        if(advance){var id=(Guid)(await S("SELECT id FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@line",("company",db.Company),("line",t.OrderLine)))!;await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{id}/apply",new AdvanceApplicationInput(Code(),[new(t.Line,56)])),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{id}/apply",new AdvanceApplicationInput(Code(),[new(t.Line,55)])),HttpStatusCode.Created);}
        else{await Expect(await Receive(c,d.Sales,t,56),HttpStatusCode.Conflict);await Expect(await Receive(c,d.Sales,t,55),HttpStatusCode.Created);}var before=await Exposure(c,d.Sales);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(before,await Exposure(c,d.Sales));Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));await Expect(await Receive(c,d.Sales,t,55),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Noncash_last_cent_receipt_after_credit_does_not_inherit_all_tax_into_cash_allocation()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,"NON_CASH");var t=await Invoice(c,d.Sales);await Expect(await Apply(c,d,t,109),HttpStatusCode.Created);await Expect(await Receive(c,d.Sales,t,1),HttpStatusCode.Created);Assert.Equal(0.09m,await S("SELECT gst_amount FROM accounting.payment_allocations WHERE company_id=@company AND invoice_line_id=@line",("company",db.Company),("line",t.Line)));await Consistent(c);
    }
    [Fact]
    public async Task Undo_uses_current_GST_after_later_cash_receipt_not_original_transfer_tax()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales,0.05m);var a=await Expect(await Apply(c,d,t,0.02m),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"cash_tax_balance"));await Expect(await Receive(c,d.Sales,t,0.02m),HttpStatusCode.Created);Assert.Equal(0.01m,await Balance(t.Line,"cash_tax_balance"));var state=await Exposure(c,d.Sales);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(0.04m,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Target_credited_funds_can_be_returned_to_source_unless_already_refunded(bool refund)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);var cn=await Expect(await Credit(c,t),HttpStatusCode.Created);var td=d with{Invoice=t,Credit=cn.GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};if(refund)await Expect(await Refund(c,td,110),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),refund?HttpStatusCode.Conflict:HttpStatusCode.Created);Assert.Equal(refund?0:110,D((await Cl(c,d)).GetProperty("availableApplyAmount")));await Consistent(c);
    }
    [Fact]
    public async Task Downstream_transfer_must_be_unapplied_before_upstream_credit_can_be_unapplied()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);var cn=await Expect(await Credit(c,t),HttpStatusCode.Created);var td=d with{Invoice=t,Credit=cn.GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var u=await Invoice(c,d.Sales);var b=await Expect(await Apply(c,td,u),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Conflict);await Expect(await Undo(c,App(b)),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Cross_invoice_credit_never_releases_credit_limit_a_second_time_even_during_new_order_approval()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);await S("UPDATE crm.customers SET credit_limit=0 WHERE company_id=@company AND id=@customer",("company",db.Company),("customer",d.Sales.Customer));var t=await Invoice(c,d.Sales);var state=await Exposure(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);Assert.Equal(state,await Exposure(c,d.Sales));var q=await Submitted(c,d.Sales.Draft(1) with{Lines=[new(d.Sales.BoxUnit,Quantity:1,UnitPrice:1)]});await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Conflict);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Conflict);Assert.Equal(state,await Exposure(c,d.Sales));await Consistent(c);
    }
    [Fact]
    public async Task Refund_after_unapply_cannot_remove_credit_funding_a_confirmed_order()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Expect(await Receive(c,d.Sales,t),HttpStatusCode.Created);await S("UPDATE crm.customers SET credit_limit=0 WHERE company_id=@company AND id=@customer",("company",db.Company),("customer",d.Sales.Customer));var q=await Submitted(c,d.Sales.Draft(1) with{Lines=[new(d.Sales.BoxUnit,Quantity:1,UnitPrice:100)]});await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);await Expect(await Refund(c,d,110),HttpStatusCode.Conflict);Assert.Equal(-110,D((await Get(c,$"/customers/{d.Sales.Customer}/credit")).GetProperty("receivable")));await Consistent(c);
    }
    [Fact]
    public async Task Credit_line_capacity_prevents_refunding_one_note_already_used_while_another_note_has_funds()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var other=await Invoice(c,d.Sales);await Expect(await Receive(c,d.Sales,other),HttpStatusCode.Created);var cn=await Expect(await Credit(c,other),HttpStatusCode.Created);var extra=d with{Invoice=other,Credit=cn.GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);await Expect(await Refund(c,d,110),HttpStatusCode.Conflict);await Expect(await Refund(c,extra,110),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Expect(await Refund(c,d,110),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Concurrent_same_key_application_and_unapplication_execute_once_and_changed_payload_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var key=Code();var reference=Code();var all=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Apply(c,d,t,key:key,reference:reference)));var ids=new List<Guid>();foreach(var r in all)ids.Add(App(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Apply(c,d,t,55,key,reference),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='sales.customer_credit_applied'",("company",db.Company)));key=Code();reference=Code();var uu=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Undo(c,ids[0],key,reference)));var ui=new List<Guid>();foreach(var r in uu)ui.Add(Unapp(await Expect(r,HttpStatusCode.Created)));Assert.Single(ui.Distinct());await Expect(await Undo(c,ids[0],key,"changed"),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='sales.customer_credit_unapplied'",("company",db.Company)));await Consistent(c);
    }
    [Fact]
    public async Task Different_keys_cannot_duplicate_application_or_unapplication()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var all=await Task.WhenAll(Apply(c,d,t),Apply(c,d,t));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);var a=App(await Expect(all.Single(x=>x.StatusCode==HttpStatusCode.Created),HttpStatusCode.Created));all=await Task.WhenAll(Undo(c,a),Undo(c,a));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Two_partial_applications_do_not_lose_updates_and_can_be_unapplied_independently()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var all=await Task.WhenAll(Apply(c,d,t,55),Apply(c,d,t,55));var ids=new List<Guid>();foreach(var r in all)ids.Add(App(await Expect(r,HttpStatusCode.Created)));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Expect(await Undo(c,ids[0]),HttpStatusCode.Created);Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));await Expect(await Undo(c,ids[1]),HttpStatusCode.Created);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Bank_refund_and_transfer_compete_for_same_note_with_sufficient_global_customer_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var e=await Invoice(c,d.Sales,200);await Expect(await Receive(c,d.Sales,e),HttpStatusCode.Created);await Expect(await Credit(c,e),HttpStatusCode.Created);var t=await Invoice(c,d.Sales);var all=await Task.WhenAll(Apply(c,d,t),Refund(c,d,110));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Receipt_competes_with_credit_application_for_last_invoice_balance()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var all=await Task.WhenAll(Apply(c,d,t),Receive(c,d.Sales,t));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Target_refund_competes_with_unapply_without_creating_unbacked_source_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);var cn=await Expect(await Credit(c,t),HttpStatusCode.Created);var td=d with{Invoice=t,Credit=cn.GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var all=await Task.WhenAll(Undo(c,App(a)),Refund(c,td,110));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Replaying_original_key_after_unapply_never_reactivates_transfer()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var key=Code();var reference=Code();var a=await Expect(await Apply(c,d,t,key:key,reference:reference),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(App(a),App(await Expect(await Apply(c,d,t,key:key,reference:reference),HttpStatusCode.Created)));Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));var b=await Expect(await Apply(c,d,t),HttpStatusCode.Created);Assert.NotEqual(App(a),App(b));await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_default_roles_cannot_apply_or_unapply(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);var staff=await Staff(db,role,d.Sales);using var f=api.Authenticated(staff.Subject);await Expect(await Apply(f,d,t),HttpStatusCode.Forbidden);await Expect(await Undo(f,App(a)),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("sales.credits.apply",false)][InlineData("sales.credits.unapply",true)][InlineData("sales.credits.read",false)][InlineData("accounting.receivables.read",false)][InlineData("sales.credits.read",true)][InlineData("accounting.receivables.read",true)]
    public async Task Revocation_blocks_cached_mutation_response(string permission,bool undo)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var a=await Expect(await Apply(f,d,t,key:undo?null:key,reference:undo?null:reference),HttpStatusCode.Created);if(undo)await Expect(await Undo(f,App(a),key,reference),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(undo?await Undo(f,App(a),key,reference):await Apply(f,d,t,key:key,reference:reference),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Assigned_customer_scope_applies_to_read_write_and_cached_replay()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var staff=await Staff(db,"FINANCE",d.Sales);using var f=api.Authenticated(staff.Subject);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='customers.all' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));var key=Code();var reference=Code();var a=await Expect(await Apply(f,d,t,key:key,reference:reference),HttpStatusCode.Created);await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@member",("company",db.Company),("member",staff.Membership));await Expect(await Apply(f,d,t,key:key,reference:reference),HttpStatusCode.NotFound);await Expect(await Undo(f,App(a)),HttpStatusCode.NotFound);await Expect(await f.GetAsync($"/api/v1/customer-credit-applications/{App(a)}"),HttpStatusCode.NotFound);await Expect(await f.GetAsync($"/api/v1/sales-credit-notes/{d.Credit}/applications"),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Anonymous_portal_and_other_company_cannot_operate_or_read()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var f in new[]{anon,portal}){Assert.Equal(HttpStatusCode.Unauthorized,(await Apply(f,d,t)).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await Undo(f,App(a))).StatusCode);}using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Apply(other,d,t),HttpStatusCode.NotFound);await Expect(await Undo(other,App(a)),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/customer-credit-applications/{App(a)}"),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Other_customer_target_is_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var e=await SetupCustomer(c);var t=await Invoice(c,e);await Expect(await Apply(c,d,t),HttpStatusCode.NotFound);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("negative")][InlineData("zero")][InlineData("precision")][InlineData("missing")][InlineData("over")][InlineData("empty")][InlineData("duplicate")][InlineData("too_many")][InlineData("reference")][InlineData("reason")][InlineData("unknown_credit")][InlineData("unknown_invoice")][InlineData("same_invoice")][InlineData("closed")][InlineData("inactive_ar")]
    public async Task Invalid_transfer_is_atomic_and_does_not_consume_number(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var input=Input(d,t);var l=input.Lines![0];input=scenario switch{"negative"=>input with{Lines=[l with{Amount=-1}]},"zero"=>input with{Lines=[l with{Amount=0}]},"precision"=>input with{Lines=[l with{Amount=1.001m}]},"missing"=>input with{Lines=[l with{Amount=null}]},"over"=>input with{Lines=[l with{Amount=111}]},"empty"=>input with{Lines=[]},"duplicate"=>input with{Lines=[l,l]},"too_many"=>input with{Lines=Enumerable.Range(0,51).Select(_=>l with{InvoiceLineId=Guid.NewGuid()}).ToArray()},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},"unknown_credit"=>input with{Lines=[l with{CreditLineId=Guid.NewGuid()}]},"unknown_invoice"=>input with{Lines=[l with{InvoiceLineId=Guid.NewGuid()}]},"same_invoice"=>input with{Lines=[l with{InvoiceLineId=d.Invoice.Line}]},_=>input};if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_ar")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1100'",("company",db.Company));var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CUSTOMER_CREDIT_APPLICATION'",("company",db.Company));var state=await Exposure(c,d.Sales);var r=await Send(c,HttpMethod.Post,$"/sales-credit-notes/{d.Credit}/apply",input);Assert.Contains(r.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity,HttpStatusCode.Conflict,HttpStatusCode.NotFound});Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='CUSTOMER_CREDIT_APPLICATION'",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM sales.credit_applications WHERE company_id=@company",("company",db.Company)));Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Late_audit_failure_rolls_back_all_credit_GST_and_AR_effects_and_same_key_retries(bool undo)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);Guid app=default;if(undo)app=App(await Expect(await Apply(c,d,t),HttpStatusCode.Created));var action=undo?"sales.customer_credit_unapplied":"sales.customer_credit_applied";var kind=undo?"CUSTOMER_CREDIT_UNAPPLICATION":"CUSTOMER_CREDIT_APPLICATION";var state=await Exposure(c,d.Sales);var amount=await Balance(t.Line,"outstanding_amount");var gst=await Gst(d.Sales.Customer);var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@kind",("company",db.Company),("kind",kind));var key=Code();var reference=Code();await S("CREATE FUNCTION public.fail_customer_credit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected customer credit failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_customer_credit BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_customer_credit()");
        try{await Expect(undo?await Undo(c,app,key,reference):await Apply(c,d,t,key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal(state,await Exposure(c,d.Sales));Assert.Equal(amount,await Balance(t.Line,"outstanding_amount"));Assert.Equal(gst,await Gst(d.Sales.Customer));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@kind",("company",db.Company),("kind",kind)));await Consistent(c);}
        finally{await S("DROP TRIGGER test_customer_credit ON platform.audit_events;DROP FUNCTION public.fail_customer_credit()");}await Expect(undo?await Undo(c,app,key,reference):await Apply(c,d,t,key:key,reference:reference),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Original_AR_accounts_are_frozen_and_no_revenue_or_GST_GL_is_posted()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1110','Target AR','ASSET','AR');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1110') WHERE company_id=@company AND purpose='AR'",("company",db.Company));var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);Assert.Equal(110,await Journal(App(a),"1100","debit"));Assert.Equal(110,await Journal(App(a),"1110","credit"));Assert.Equal(0,await Journal(App(a),"4000","debit"));var u=await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(110,await Journal(Unapp(u),"1100","credit"));Assert.Equal(110,await Journal(Unapp(u),"1110","debit"));await Consistent(c);
    }
    [Theory]
    [InlineData(true)][InlineData(false)]
    public async Task Stock_and_service_credit_sources_and_targets_work_without_duplicate_inventory_posting(bool stockSource)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,stock:stockSource);Inv target;if(stockSource){var other=await SetupCustomer(c);target=await Invoice(c,other with{Customer=d.Sales.Customer,Branch=d.Sales.Branch});}else{var other=await SetupCustomer(c,stock:true);target=await Invoice(c,other with{Customer=d.Sales.Customer,Branch=d.Sales.Branch},stock:true);}var state=await Exposure(c,d.Sales);var a=await Expect(await Apply(c,d,target),HttpStatusCode.Created);Assert.Equal(0,await Journal(App(a),"1200","debit"));Assert.Equal(0,await Journal(App(a),"5000","credit"));await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(state,await Exposure(c,d.Sales));await Consistent(c);
    }
    [Fact]
    public async Task SQL_checks_actual_member_permission_and_posted_application_is_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=await Expect(await Apply(c,d,t),HttpStatusCode.Created);var staff=await Staff(db,"WAREHOUSE",d.Sales);await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT sales.apply_customer_credit(@id,'DIRECT','Reason','[]'::jsonb)","SELECT sales.unapply_customer_credit(@id,'DIRECT','Reason')"}){await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"denied-customer-credit",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",sql.Contains("unapply",StringComparison.Ordinal)?App(a):d.Credit)));Assert.Equal("42501",e.SqlState);}foreach(var sql in new[]{"UPDATE sales.credit_applications SET reason='edit' WHERE company_id=@company AND id=@id RETURNING id","DELETE FROM sales.credit_application_lines WHERE company_id=@company AND application_id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",App(a))));Assert.Contains(e.SqlState,new[]{"42501","23514"});}
    }
    [Fact]
    public async Task Repeated_sales_role_seeding_does_not_expand_office_financial_authority()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);await S("SELECT identity.seed_sales_roles(@company);SELECT identity.seed_customer_credit_application_roles(@company)",("company",db.Company));var staff=await Staff(db,"OFFICE",d.Sales);using var f=api.Authenticated(staff.Subject);await Expect(await Apply(f,d,t),HttpStatusCode.Forbidden);Assert.Equal(0L,await S("SELECT count(*) FROM identity.role_permissions p JOIN identity.roles r ON r.company_id=p.company_id AND r.id=p.role_id WHERE p.company_id=@company AND r.code='OFFICE' AND p.permission_code IN('sales.credits.apply','sales.credits.unapply')",("company",db.Company)));
    }
    [Fact]
    public async Task Active_transfer_prevents_archiving_fully_credited_target_until_whole_unapplication()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Invoice(c,d.Sales);var a=App(await Expect(await Apply(c,d,t),HttpStatusCode.Created));await Expect(await Credit(c,t),HttpStatusCode.Created);async Task<HttpResponseMessage> Trash(){var version=Convert.ToInt64(await S("SELECT version FROM platform.documents WHERE company_id=@company AND id=@id",("company",db.Company),("id",t.Id)));using var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{t.Id}/trash");req.Headers.Add("Idempotency-Key",Code());req.Headers.Add("If-Match","\"1\"");req.Headers.Add("X-Document-Version",version.ToString());req.Content=System.Net.Http.Json.JsonContent.Create(new{reason="Completed cancellation"});return await c.SendAsync(req);}await Expect(await Trash(),HttpStatusCode.Conflict);await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await Trash(),HttpStatusCode.OK);await Consistent(c);
    }

    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Fractional_refunds_keep_cumulative_GST_correct_with_or_without_transfer_history(bool history)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,price:0.05m);if(history){var t=await Invoice(c,d.Sales,0.05m);var a=App(await Expect(await Apply(c,d,t,0.02m),HttpStatusCode.Created));await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await Credit(c,t),HttpStatusCode.Created);}foreach(var amount in new[]{0.02m,0.02m,0.02m})await Expect(await Refund(c,d,amount),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Invoice.Line,"cash_tax_balance"));Assert.Equal(0,await Gst(d.Sales.Customer));await Consistent(c);
    }

}
