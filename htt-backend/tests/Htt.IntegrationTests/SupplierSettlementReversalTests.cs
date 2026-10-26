using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SupplierSettlementReversalTests : IAsyncLifetime
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
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,Guid line,decimal amount)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),Allocations:[new(line,amount)]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,Code(),"Verified incoming refund",CreditLineId:d.CreditLine));
    private static Guid App(JsonElement e)=>e.GetProperty("application").GetProperty("id").GetGuid();
    private static Guid Unapp(JsonElement e)=>e.GetProperty("unapplication").GetProperty("id").GetGuid();
    private static async Task Consistent(HttpClient c){var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
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
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Payment_reversal_and_reapplication_restore_AP_and_recalculate_GST(string basis,bool atomic)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,makeCredit:false);var target=await Bill(c,d);var id=await OriginalPayment(d);var before=await Gst(c,d);JsonElement result;
        if(atomic)result=await Expect(await Reallocate(c,id,target.Line),HttpStatusCode.Created);else{var r=await Expect(await Reverse(c,id),HttpStatusCode.Created);Assert.StartsWith("SPR-",r.GetProperty("reversal").GetProperty("number").GetString());Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));await Consistent(c);result=await Expect(await Reapply(c,Rev(r),target.Line),HttpStatusCode.Created);}
        Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));Assert.Equal(0,await Balance(target.Line,"outstanding_amount"));Assert.Equal(before,await Gst(c,d));var replacement=Payment(result);Assert.Equal(id,(await Get(c,$"/supplier-payments/{replacement}")).GetProperty("payment").GetProperty("originalPaymentId").GetGuid());Assert.Equal("REVERSED",(await Get(c,$"/supplier-payments/{id}")).GetProperty("payment").GetProperty("settlementStatus").GetString());await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Prepayment_unapply_and_reapply_to_another_bill_restore_available_funds(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var t=await Bill(c,d);var p=await Advance(c,d);var app=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await Reverse(c,p.Payment),HttpStatusCode.Conflict);var u=await Expect(await Unapply(c,app),HttpStatusCode.Created);Assert.StartsWith("SAU-",u.GetProperty("unapplication").GetProperty("number").GetString());Assert.Equal(220,await Available(p.Advance));Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));await Expect(await PayAdvance(c,p.Advance,t.Line),HttpStatusCode.Created);Assert.Equal(110,await Available(p.Advance));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Advance_payment_can_reverse_after_unapplication_and_no_longer_fund_new_allocations(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var p=await Advance(c,d);var app=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await Unapply(c,app),HttpStatusCode.Created);await Expect(await Reverse(c,p.Payment),HttpStatusCode.Created);Assert.Equal(0,await Available(p.Advance));await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.NotFound);await Consistent(c);
    }    [Theory]
    [InlineData("CASH","NON_CASH")][InlineData("NON_CASH","CASH")]
    public async Task Reallocation_obeys_each_original_bill_GST_policy(string sourceBasis,string targetBasis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,sourceBasis,makeCredit:false);await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",targetBasis));var t=await Bill(c,d);await Expect(await Reallocate(c,await OriginalPayment(d),t.Line),HttpStatusCode.Created);Assert.Equal(sourceBasis=="CASH"?10:20,await Gst(c,d));await Consistent(c);
    }
    [Theory]
    [InlineData(true,false)][InlineData(false,true)][InlineData(false,false)]
    public async Task Recoverability_is_frozen_per_bill_and_never_copied_from_source(bool sourceRecoverable,bool targetRecoverable)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,recoverable:sourceRecoverable,makeCredit:false);var t=await Bill(c,d,recoverable:targetRecoverable);await Expect(await Reallocate(c,await OriginalPayment(d),t.Line),HttpStatusCode.Created);Assert.Equal(targetRecoverable?10:0,await Gst(c,d));await Consistent(c);
    }
    [Theory]
    [InlineData(false,false)][InlineData(false,true)][InlineData(true,false)][InlineData(true,true)]
    public async Task Downstream_credit_transfer_or_actual_refund_must_be_resolved_before_unfunding_source(bool advance,bool refund)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Data d;Guid source;
        if(advance){d=await Source(c,paid:false,makeCredit:false);var p=await Advance(c,d);source=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified credit",[new(d.Line,110)])),HttpStatusCode.Created);d=d with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};}
        else{d=await Source(c);source=await OriginalPayment(d);}if(refund){await Expect(await Refund(c,d,55),HttpStatusCode.Created);await Expect(advance?await Unapply(c,source):await Reverse(c,source),HttpStatusCode.Conflict);}else{var t=await Bill(c,d);var credit=App(await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created));await Expect(advance?await Unapply(c,source):await Reverse(c,source),HttpStatusCode.Conflict);await Expect(await Undo(c,credit),HttpStatusCode.Created);await Expect(advance?await Unapply(c,source):await Reverse(c,source),HttpStatusCode.Created);Assert.Equal(0,D((await CreditLine(c,d)).GetProperty("refundableAmount")));}await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Unapplied_prepaid_funds_may_be_refunded_but_cannot_then_reverse_original_payment(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(220,Code(),"Actual incoming refund",AdvanceId:p.Advance)),HttpStatusCode.Created);Assert.Equal(0,await Available(p.Advance));await Expect(await Reverse(c,p.Payment),HttpStatusCode.Conflict);await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Current_cash_rounding_is_recomputed_after_later_payment_before_unapplication()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,net:0.05m,tax:0.01m,paid:false,makeCredit:false);var p=await Advance(c,d,0.06m);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line,0.02m),HttpStatusCode.Created));await Expect(await Pay(c,d,d.Line,0.02m),HttpStatusCode.Created);Assert.Equal(0.01m,await Balance(d.Line,"cash_tax_balance"));await Expect(await Unapply(c,a),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Line,"cash_tax_balance"));Assert.Equal(0.04m,await Balance(d.Line,"outstanding_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Repeated_corrections_then_supplier_credit_transfer_only_use_effective_funds(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:!advance,makeCredit:false);
        if(advance){var p=await Advance(c,d);for(var n=0;n<3;n++){var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await Unapply(c,a),HttpStatusCode.Created);}await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created);}
        else{var id=await OriginalPayment(d);for(var n=0;n<3;n++)id=Payment(await Expect(await Reallocate(c,id,d.Line),HttpStatusCode.Created));}
        var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified credit",[new(d.Line,110)])),HttpStatusCode.Created);d=d with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var t=await Bill(c,d);var app=App(await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created));await Expect(await Undo(c,app),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Reapplied_fractional_credit_can_be_refunded_without_leaving_tax_tail()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,net:0.05m,tax:0.01m,makeCredit:false);await Expect(await Reallocate(c,await OriginalPayment(d),d.Line,0.06m),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified credit",[new(d.Line,0.06m)])),HttpStatusCode.Created);d=d with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};foreach(var amount in new[]{0.02m,0.02m,0.02m})await Expect(await Refund(c,d,amount),HttpStatusCode.Created);Assert.Equal(0,await Gst(c,d));await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reapply")][InlineData("reallocate")]
    public async Task Same_key_concurrency_executes_once_and_changed_payload_is_rejected(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var key=Code();var reference=Code();var d=await Source(c,paid:operation!="unapply",makeCredit:false);var t=await Bill(c,d);Func<string,string,Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));send=(k,r)=>Unapply(c,a,k,r);}else{var p=await OriginalPayment(d);if(operation=="reverse")send=(k,r)=>Reverse(c,p,k,r);else if(operation=="reapply"){var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));send=(k,r)=>Reapply(c,v,t.Line,key:k,reference:r);}else{var rr=Code();send=(k,r)=>Reallocate(c,p,t.Line,key:k,reference:r,reversalReference:rr);}}
        var all=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>send(key,reference)));var ids=new List<Guid>();foreach(var response in all){var e=await Expect(response,HttpStatusCode.Created);ids.Add(e.GetProperty(operation=="unapply"?"unapplication":operation=="reverse"?"reversal":"payment").GetProperty("id").GetGuid());}Assert.Single(ids.Distinct());await Expect(await send(key,"Changed reference"),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reapply")][InlineData("reallocate")]
    public async Task Different_keys_cannot_duplicate_same_fund_correction(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:operation!="unapply",makeCredit:false);var t=await Bill(c,d);Func<Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));send=()=>Unapply(c,a);}else{var p=await OriginalPayment(d);if(operation=="reverse")send=()=>Reverse(c,p);else if(operation=="reapply"){var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));send=()=>Reapply(c,v,t.Line);}else send=()=>Reallocate(c,p,t.Line);}var all=await Task.WhenAll(send(),send());Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Actual_refund_competes_with_source_payment_or_advance_reversal(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();Data d;Guid src;
        if(advance){d=await Source(c,paid:false,makeCredit:false);var p=await Advance(c,d);src=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified credit",[new(d.Line,110)])),HttpStatusCode.Created);d=d with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};}else{d=await Source(c);src=await OriginalPayment(d);}var all=await Task.WhenAll(advance?Unapply(c,src):Reverse(c,src),Refund(c,d,55));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Advance_refund_and_reapplication_compete_for_restored_balance()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var p=await Advance(c,d,110);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await Unapply(c,a),HttpStatusCode.Created);var all=await Task.WhenAll(PayAdvance(c,p.Advance,d.Line),Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual incoming refund",AdvanceId:p.Advance)));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task New_payment_and_reallocation_cannot_both_pay_last_target_balance()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,makeCredit:false);var t=await Bill(c,d);var all=await Task.WhenAll(Reallocate(c,await OriginalPayment(d),t.Line),Pay(c,d,t.Line,110));Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_are_denied_all_correction_commands(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));var user=await Staff(db,role);using var f=api.Authenticated(user.Subject);await Expect(await Reverse(f,p.Payment),HttpStatusCode.Forbidden);await Expect(await Unapply(f,a),HttpStatusCode.Forbidden);await Expect(await Reallocate(f,p.Payment,d.Line,220),HttpStatusCode.Forbidden);await Expect(await Unapply(c,a),HttpStatusCode.Created);var v=Rev(await Expect(await Reverse(c,p.Payment),HttpStatusCode.Created));await Expect(await Reapply(f,v,d.Line),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("reverse","purchase.payments.reverse")][InlineData("reverse","purchase.payments.read")][InlineData("reverse","purchase.bills.read")]
    [InlineData("unapply","purchase.advances.unapply")][InlineData("unapply","purchase.payments.read")][InlineData("unapply","purchase.bills.read")]
    [InlineData("reapply","purchase.payments.reapply")][InlineData("reapply","purchase.payments.post")][InlineData("reapply","purchase.payments.read")][InlineData("reapply","purchase.bills.read")]
    public async Task Revoked_permissions_block_cached_mutations(string operation,string permission)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:operation!="unapply",makeCredit:false);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();Func<Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));send=()=>Unapply(f,a,key,reference);}else{var p=await OriginalPayment(d);if(operation=="reverse")send=()=>Reverse(f,p,key,reference);else{var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));send=()=>Reapply(f,v,d.Line,key:key,reference:reference);}}await Expect(await send(),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(await send(),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("empty")][InlineData("negative")][InlineData("precision")][InlineData("duplicate")][InlineData("unknown")][InlineData("supplier")][InlineData("closed")][InlineData("reference")][InlineData("reason")][InlineData("inactive_bank")]
    public async Task Invalid_atomic_reallocation_preserves_original_payment_and_sequences(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,makeCredit:false);var t=await Bill(c,d);var p=await OriginalPayment(d);var input=new SupplierPaymentReallocationInput(Code(),Code(),"Correct allocation",Allocations:[new(t.Line,110)]);input=scenario switch{"empty"=>input with{Allocations=[]},"negative"=>input with{Allocations=[new(t.Line,-1)]},"precision"=>input with{Allocations=[new(t.Line,110.001m)]},"duplicate"=>input with{Allocations=[new(t.Line,55),new(t.Line,55)]},"unknown"=>input with{Allocations=[new(Guid.NewGuid(),110)]},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},_=>input};if(scenario=="supplier"){var e=await Source(c,paid:false,makeCredit:false);input=input with{Allocations=[new(e.Line,110)]};}if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_bank")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1000'",("company",db.Company));var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var result=await Send(c,HttpMethod.Post,$"/supplier-payments/{p}/reallocate",input);Assert.Contains(result.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.NotFound,HttpStatusCode.Conflict,HttpStatusCode.UnprocessableEntity});Assert.Equal(0,await Balance(d.Line,"outstanding_amount"));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.supplier_payment_reversals WHERE company_id=@company",("company",db.Company)));
    }
    [Theory]
    [InlineData("reverse")][InlineData("unapply")][InlineData("reapply")][InlineData("reallocate")]
    public async Task Late_audit_failure_rolls_back_postings_numbers_and_outbox_then_same_key_retries(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:operation!="unapply",makeCredit:false);var t=await Bill(c,d);var key=Code();var reference=Code();Func<Task<HttpResponseMessage>> send;
        if(operation=="unapply"){var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));send=()=>Unapply(c,a,key,reference);}else{var p=await OriginalPayment(d);if(operation=="reverse")send=()=>Reverse(c,p,key,reference);else if(operation=="reapply"){var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));send=()=>Reapply(c,v,t.Line,key:key,reference:reference);}else{var rr=Code();send=()=>Reallocate(c,p,t.Line,key:key,reference:reference,reversalReference:rr);}}
        var action=operation switch{"unapply"=>"purchase.supplier_advance_unapplied","reverse"=>"purchase.supplier_payment_reversed",_=>"purchase.supplier_payment_reapplied"};var before=await Balance(d.Line,"outstanding_amount");var tax=await Gst(c,d);var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var events=await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company));await S("CREATE FUNCTION public.fail_supplier_reversal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected reversal failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_supplier_reversal BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_supplier_reversal()");try{await Expect(await send(),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Balance(d.Line,"outstanding_amount"));Assert.Equal(tax,await Gst(c,d));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(events,await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company)));await Consistent(c);}finally{await S("DROP TRIGGER test_supplier_reversal ON platform.audit_events;DROP FUNCTION public.fail_supplier_reversal()");}await Expect(await send(),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Mixed_payment_reallocation_preserves_amount_and_prepaid_assets(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var t=await Bill(c,d);var p=Payment(await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(220,"BANK_TRANSFER",Code(),110,[new(d.Line,110)],Notes:"Mixed supplier payment")),HttpStatusCode.Created));var result=await Expect(await Send(c,HttpMethod.Post,$"/supplier-payments/{p}/reallocate",new SupplierPaymentReallocationInput(Code(),Code(),"Correct mixed allocation",110,[new(t.Line,110)])),HttpStatusCode.Created);Assert.Equal(110,D(result.GetProperty("advances")[0].GetProperty("available")));Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Original_bank_and_each_bill_AP_accounts_remain_frozen()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,makeCredit:false);await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1010','New Bank','ASSET','BANK'),(@company,'2010','New AP','LIABILITY','AP');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1010') WHERE company_id=@company AND purpose='BANK';UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP'",("company",db.Company));var t=await Bill(c,d);var result=await Expect(await Reallocate(c,await OriginalPayment(d),t.Line),HttpStatusCode.Created);var replacement=Payment(result);var reversal=result.GetProperty("reversalId").GetGuid();Assert.Equal(110,await Journal(reversal,"2000","credit"));Assert.Equal(110,await Journal(reversal,"1000","debit"));Assert.Equal(110,await Journal(replacement,"2010","debit"));Assert.Equal(110,await Journal(replacement,"1000","credit"));Assert.Equal(0,await Journal(replacement,"1010","credit"));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Old_keys_do_not_reactivate_reversed_payments_or_unapplied_advances(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var key=Code();var reference=Code();if(advance){var p=await Advance(c,d);var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line,key:key,reference:reference),HttpStatusCode.Created));await Expect(await Unapply(c,a),HttpStatusCode.Created);Assert.Equal(a,App(await Expect(await PayAdvance(c,p.Advance,d.Line,key:key,reference:reference),HttpStatusCode.Created)));Assert.Equal(220,await Available(p.Advance));}else{var input=new SupplierPaymentInput(110,"BANK_TRANSFER",reference,Allocations:[new(d.Line,110)]);var id=Payment(await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",input,key:key),HttpStatusCode.Created));await Expect(await Reverse(c,id),HttpStatusCode.Created);Assert.Equal(id,Payment(await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",input,key:key),HttpStatusCode.Created)));}Assert.Equal(110,await Balance(d.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Anonymous_portal_and_other_company_cannot_read_or_modify_supplier_corrections()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,makeCredit:false);var p=await OriginalPayment(d);var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Reverse(other,p),HttpStatusCode.NotFound);await Expect(await Reapply(other,v,d.Line),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/supplier-payment-reversals/{v}"),HttpStatusCode.NotFound);using var portal=api.Authenticated(audience:"htt-test-portal");using var anon=api.CreateClient();foreach(var client in new[]{portal,anon}){Assert.Equal(HttpStatusCode.Unauthorized,(await Reverse(client,p)).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync($"/api/v1/supplier-payment-reversals/{v}")).StatusCode);}
    }
    [Fact]
    public async Task SQL_checks_actual_membership_and_reversal_facts_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,makeCredit:false);var p=await OriginalPayment(d);var v=Rev(await Expect(await Reverse(c,p),HttpStatusCode.Created));var user=await Staff(db,"OFFICE");await using var dataSource=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(dataSource).ResolveAsync(DatabaseFixture.Issuer,user.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT purchase.reverse_supplier_payment(@id,'DIRECT','Reason')","SELECT purchase.unapply_supplier_advance(@id,'DIRECT','Reason')","SELECT purchase.reapply_supplier_payment(@id,'DIRECT','Reason',0,'[]')"}){await using var session=new CompanySession(dataSource);await session.BeginAsync(db.Company,access.ActorId,"denied-supplier-reversal",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",p)));Assert.Equal("42501",e.SqlState);}foreach(var sql in new[]{"UPDATE accounting.supplier_payment_reversals SET reason='edit' WHERE company_id=@company AND id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",v)));Assert.Contains(e.SqlState,new[]{"42501","23514"});}await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Closed_original_prepayment_period_does_not_block_current_unapply_and_reapply(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var previous=d.Today.AddMonths(-1);await S("INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) SELECT @company,'supplier-historical-correction',@date-interval '1 day',@date+interval '1 day' WHERE NOT EXISTS(SELECT 1 FROM accounting.periods WHERE company_id=@company AND starts_on<=@date AND ends_on>@date)",("company",db.Company),("date",previous));await S("INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,starts_on,ends_on FROM accounting.fiscal_years WHERE company_id=@company AND label='supplier-historical-correction'",("company",db.Company));var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,PaidOn:previous,Notes:"Historical prepayment")),HttpStatusCode.Created);var ad=p.GetProperty("advances")[0].GetProperty("id").GetGuid();var a=App(await Expect(await PayAdvance(c,ad,d.Line),HttpStatusCode.Created));await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",previous));await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await PayAdvance(c,ad,d.Line),HttpStatusCode.Created);await Consistent(c);
    }
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

    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Stock_receipt_bill_payments_reallocate_without_stock_cost_or_GRNI_mutation(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis);var id=Payment(await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created));var t=await Bill(c,d,20,2);var stock=await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company));var value=await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company));var replacement=Payment(await Expect(await Reallocate(c,id,t.Line,d.Gross),HttpStatusCode.Created));Assert.Equal(stock,await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company)));Assert.Equal(value,await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company)));Assert.Equal(0,await Journal(replacement,"1200","debit"));Assert.Equal(0,await Journal(replacement,"2100","debit"));await Consistent(c);
    }

}
