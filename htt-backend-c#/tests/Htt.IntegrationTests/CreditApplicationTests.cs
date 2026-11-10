using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class CreditApplicationTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Bill,Guid Line,Guid Credit,Guid CreditLine,Guid Account,Guid Tax,DateOnly Today,decimal Gross);
    private async Task<Data> Source(HttpClient c,string basis="CASH",decimal net=100,decimal tax=10,bool paid=true,decimal? credit=null,bool recoverable=true)
    {
        await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=true WHERE id=@company",("company",db.Company),("basis",basis));
        var sid=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Credit application supplier",null));var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.Company)))!;var tc=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!,System.Globalization.CultureInfo.InvariantCulture);
        var d=new Data(sid,default,default,default,default,acct,tc,today,net+tax);var b=await Bill(c,d,net,tax,recoverable:recoverable);d=d with{Bill=b.Bill,Line=b.Line};if(paid && d.Gross>0)await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created);
        var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified original adjustment",[new(d.Line,credit??d.Gross)])),HttpStatusCode.Created);return d with{Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};
    }
    private static async Task<(Guid Bill,Guid Line)> Bill(HttpClient c,Data d,decimal net=100,decimal tax=10,bool recoverable=true)
    {
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today.AddDays(30),d.Today,[new(d.Account,"Expense settlement",net,tax,d.Tax,recoverable)],"Verified invoice",d.Today)),HttpStatusCode.Created);return(b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static SupplierCreditApplicationInput Input(Data d,Guid line,decimal? amount=null,string? reference=null)=>new(reference??Code(),"Apply verified available supplier credit",[new(d.CreditLine,line,amount??d.Gross)]);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Data d,Guid line,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",Input(d,line,amount,reference),key:key);
    private static Task<HttpResponseMessage> Undo(HttpClient c,Guid app,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credit-applications/{app}/unapply",new SupplierCreditUnapplicationInput(reference??Code(),"Verified allocation correction"),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,Guid line,decimal amount)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),Allocations:[new(line,amount)]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,Code(),"Verified incoming refund",CreditLineId:d.CreditLine));
    private static Guid App(JsonElement e)=>e.GetProperty("application").GetProperty("id").GetGuid();
    private static Guid Unapp(JsonElement e)=>e.GetProperty("unapplication").GetProperty("id").GetGuid();
    private static async Task Consistent(HttpClient c){
        await FinancialReportAssertions.Check(c);var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
    private static async Task<JsonElement> CreditLine(HttpClient c,Data d)=>(await Get(c,$"/supplier-credits/{d.Credit}")).GetProperty("lines").EnumerateArray().Single(x=>x.GetProperty("id").GetGuid()==d.CreditLine);
    private async Task<decimal> Balance(Guid line,string col)=>Convert.ToDecimal(await S($"SELECT {col} FROM purchase.bill_line_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",line)));
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches b JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.source_document_id=@id AND a.code=@code",("company",db.Company),("id",doc),("code",code)));
    [Theory]
    [InlineData("CASH","CASH")][InlineData("CASH","NON_CASH")][InlineData("NON_CASH","CASH")][InlineData("NON_CASH","NON_CASH")]
    public async Task Apply_and_unapply_transfer_AP_and_recalculate_each_frozen_GST_basis(string sourceBasis,string targetBasis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,sourceBasis);await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",targetBasis));var t=await Bill(c,d);var before=D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax"));var r=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var id=App(r);
        Assert.StartsWith("SCA-",r.GetProperty("application").GetProperty("number").GetString());Assert.Equal(110,await Journal(id,"2000","debit"));Assert.Equal(110,await Journal(id,"2000","credit"));Assert.Equal(0,await Journal(id,"1000","debit"));Assert.Equal(0,await Journal(id,"5100","credit"));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));Assert.Equal(0,D((await CreditLine(c,d)).GetProperty("refundableAmount")));Assert.Equal(110,D((await CreditLine(c,d)).GetProperty("appliedAmount")));Assert.Equal(10,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
        var u=await Expect(await Undo(c,id),HttpStatusCode.Created);Assert.StartsWith("SCU-",u.GetProperty("unapplication").GetProperty("number").GetString());Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));Assert.Equal(110,D((await CreditLine(c,d)).GetProperty("refundableAmount")));Assert.Equal(before,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));Assert.Equal("UNAPPLIED",(await Get(c,$"/supplier-credit-applications/{id}")).GetProperty("application").GetProperty("applicationStatus").GetString());Assert.Equal(Unapp(u),(await Get(c,$"/supplier-credit-unapplications/{Unapp(u)}")).GetProperty("unapplication").GetProperty("id").GetGuid());await Consistent(c);
    }

    [Fact]
    public async Task Unpaid_credit_already_reducing_source_AP_cannot_be_spent_again()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false);var t=await Bill(c,d);await Expect(await Apply(c,d,t.Line),HttpStatusCode.Conflict);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));Assert.Equal(0,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Partial_application_leaves_only_unspent_credit_refundable_and_unapply_restores_it(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,credit:55);var t=await Bill(c,d);var r=await Expect(await Apply(c,d,t.Line,27.5m),HttpStatusCode.Created);Assert.Equal(82.5m,await Balance(t.Line,"outstanding_amount"));Assert.Equal(27.5m,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Expect(await Refund(c,d,55),HttpStatusCode.Conflict);await Expect(await Refund(c,d,27.5m),HttpStatusCode.Created);await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.Equal(27.5m,D((await CreditLine(c,d)).GetProperty("refundableAmount")));Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task One_credit_line_can_settle_multiple_bills_and_line_order_is_canonical_for_replay()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var b=await Bill(c,d);var e=await Bill(c,d);var input=new SupplierCreditApplicationInput(Code(),"Multiple target bills",[new(d.CreditLine,b.Line,55),new(d.CreditLine,e.Line,55)]);var key=Code();var r=await Expect(await Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",input,key:key),HttpStatusCode.Created);Assert.Equal(2,r.GetProperty("lines").GetArrayLength());Assert.Equal(55,await Balance(b.Line,"outstanding_amount"));Assert.Equal(55,await Balance(e.Line,"outstanding_amount"));var replay=await Expect(await Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",input with{Lines=input.Lines!.Reverse().ToArray()},key:key),HttpStatusCode.Created);Assert.Equal(App(r),App(replay));await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.Equal(110,await Balance(b.Line,"outstanding_amount"));Assert.Equal(110,await Balance(e.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Undo_recomputes_target_tax_after_later_payment_instead_of_negating_original_zero_tax()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d,0.05m,0.01m);var r=await Expect(await Apply(c,d,t.Line,0.02m),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"cash_tax_balance"));await Expect(await Pay(c,d,t.Line,0.02m),HttpStatusCode.Created);Assert.Equal(0.01m,await Balance(t.Line,"cash_tax_balance"));await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(0.04m,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Undo_recomputes_source_pending_refund_tax_after_intervening_partial_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,net:0.05m,tax:0.01m);var t=await Bill(c,d,0.05m,0.01m);var r=await Expect(await Apply(c,d,t.Line,0.02m),HttpStatusCode.Created);await Expect(await Refund(c,d,0.02m),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Line,"cash_tax_balance"));await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.Equal(0.01m,await Balance(d.Line,"cash_tax_balance"));Assert.Equal(0.04m,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Expect(await Refund(c,d,0.04m),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Target_credit_may_be_unapplied_until_funds_have_been_refunded(bool refund)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var r=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{t.Bill}/credits",new ExpenseCreditInput(Code(),"Target cancellation",[new(t.Line,110)])),HttpStatusCode.Created);if(refund)await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Verified target refund",CreditLineId:cr.GetProperty("lines")[0].GetProperty("id").GetGuid())),HttpStatusCode.Created);
        await Expect(await Undo(c,App(r)),refund?HttpStatusCode.Conflict:HttpStatusCode.Created);Assert.Equal(refund?0:110,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Consistent(c);
    }
    [Fact]
    public async Task Downstream_credit_transfer_blocks_upstream_unapply_until_downstream_is_unapplied()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var u=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{t.Bill}/credits",new ExpenseCreditInput(Code(),"Target supplier credit",[new(t.Line,110)])),HttpStatusCode.Created);var e=d with{Bill=t.Bill,Line=t.Line,Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var b=await Expect(await Apply(c,e,u.Line),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Conflict);await Expect(await Undo(c,App(b)),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(110,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Consistent(c);
    }
    [Fact]
    public async Task Target_payment_and_prepaid_application_continue_to_use_remaining_AP()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line,55),HttpStatusCode.Created);await Expect(await Pay(c,d,t.Line,56),HttpStatusCode.Conflict);var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(55,"BANK_TRANSFER",Code(),55,Notes:"Target deposit")),HttpStatusCode.Created);var aid=p.GetProperty("advances")[0].GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(t.Line,55)])),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));await Expect(await Pay(c,d,t.Line,55),HttpStatusCode.Created);Assert.Equal(10,await Balance(t.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Theory]
    [InlineData(false,true)][InlineData(true,false)][InlineData(false,false)]
    public async Task Nonrecoverable_source_or_target_tax_is_not_claimed_by_transfer(bool sourceRecoverable,bool targetRecoverable)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,recoverable:sourceRecoverable);var t=await Bill(c,d,recoverable:targetRecoverable);var r=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);Assert.Equal(targetRecoverable?10:0,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(0,await Balance(d.Line,"cash_tax_balance"));await Expect(await Undo(c,App(r)),HttpStatusCode.Created);Assert.Equal(sourceRecoverable?10:0,await Balance(d.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Fact]
    public async Task Concurrent_same_key_application_and_unapplication_each_post_once_and_changed_body_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var key=Code();var reference=Code();var all=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Apply(c,d,t.Line,key:key,reference:reference)));var ids=new List<Guid>();foreach(var r in all)ids.Add(App(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Apply(c,d,t.Line,55,key,reference),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='purchase.supplier_credit_applied'",("company",db.Company)));key=Code();reference=Code();var undo=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Undo(c,ids[0],key,reference)));var uids=new List<Guid>();foreach(var r in undo)uids.Add(Unapp(await Expect(r,HttpStatusCode.Created)));Assert.Single(uids.Distinct());await Expect(await Undo(c,ids[0],key,"different"),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='purchase.supplier_credit_unapplied'",("company",db.Company)));await Consistent(c);
    }
    [Fact]
    public async Task Different_keys_cannot_double_apply_or_double_unapply()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var r=await Task.WhenAll(Apply(c,d,t.Line),Apply(c,d,t.Line));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);var app=App(await Expect(r.Single(x=>x.StatusCode==HttpStatusCode.Created),HttpStatusCode.Created));r=await Task.WhenAll(Undo(c,app),Undo(c,app));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Two_partial_applications_sum_correctly_and_can_be_unapplied_independently()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var all=await Task.WhenAll(Apply(c,d,t.Line,55),Apply(c,d,t.Line,55));var ids=new List<Guid>();foreach(var r in all)ids.Add(App(await Expect(r,HttpStatusCode.Created)));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));await Expect(await Undo(c,ids[0]),HttpStatusCode.Created);Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));await Expect(await Undo(c,ids[1]),HttpStatusCode.Created);Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Refund_and_application_cannot_consume_same_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var r=await Task.WhenAll(Apply(c,d,t.Line),Refund(c,d,110));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Payment_or_advance_competing_with_credit_application_cannot_overpay_target(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);Guid aid=default;if(advance){var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,Notes:"Deposit")),HttpStatusCode.Created);aid=p.GetProperty("advances")[0].GetProperty("id").GetGuid();}
        var r=await Task.WhenAll(Apply(c,d,t.Line),advance?Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(t.Line,110)])):Pay(c,d,t.Line,110));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));Assert.Equal(10,await Balance(t.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Fact]
    public async Task Refund_competing_with_unapply_obeys_target_fund_dependency()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{t.Bill}/credits",new ExpenseCreditInput(Code(),"Target credit",[new(t.Line,110)])),HttpStatusCode.Created);var e=d with{Bill=t.Bill,Line=t.Line,Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};var r=await Task.WhenAll(Undo(c,App(a)),Refund(c,e,110));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Old_application_key_after_unapply_does_not_reactivate_and_a_new_application_is_allowed()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var key=Code();var reference=Code();var a=await Expect(await Apply(c,d,t.Line,key:key,reference:reference),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(App(a),App(await Expect(await Apply(c,d,t.Line,key:key,reference:reference),HttpStatusCode.Created)));Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));var b=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);Assert.NotEqual(App(a),App(b));Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));Assert.Equal(2,(await Get(c,$"/supplier-credits/{d.Credit}/applications")).GetProperty("items").GetArrayLength());await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_apply_unapply_or_read(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var staff=await Staff(db,role);using var f=api.Authenticated(staff.Subject);await Expect(await Apply(f,d,t.Line),HttpStatusCode.Forbidden);await Expect(await Undo(f,App(a)),HttpStatusCode.Forbidden);await Expect(await f.GetAsync($"/api/v1/supplier-credit-applications/{App(a)}"),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("purchase.credits.apply",false)][InlineData("purchase.credits.unapply",true)][InlineData("purchase.credits.read",false)][InlineData("purchase.bills.read",false)][InlineData("purchase.credits.read",true)][InlineData("purchase.bills.read",true)]
    public async Task Revocation_blocks_cached_write_responses(string permission,bool undo)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var a=await Expect(await Apply(f,d,t.Line,key:undo?null:key,reference:undo?null:reference),HttpStatusCode.Created);if(undo)await Expect(await Undo(f,App(a),key,reference),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(undo?await Undo(f,App(a),key,reference):await Apply(f,d,t.Line,key:key,reference:reference),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Apply_and_unapply_are_independent_explicit_permissions()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code IN('purchase.credits.apply','purchase.credits.unapply') AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Apply(f,d,t.Line),HttpStatusCode.Forbidden);await S("INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT @company,id,'purchase.credits.apply' FROM identity.roles WHERE company_id=@company AND code='FINANCE'",("company",db.Company));var a=await Expect(await Apply(f,d,t.Line),HttpStatusCode.Created);await Expect(await Undo(f,App(a)),HttpStatusCode.Forbidden);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Anonymous_portal_and_cross_company_access_are_denied()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var denied in new[]{anon,portal}){Assert.Equal(HttpStatusCode.Unauthorized,(await Apply(denied,d,t.Line)).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await Undo(denied,App(a))).StatusCode);}using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Apply(other,d,t.Line),HttpStatusCode.NotFound);await Expect(await Undo(other,App(a)),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/supplier-credit-applications/{App(a)}"),HttpStatusCode.NotFound);
    }
    [Theory]
    [InlineData("negative")][InlineData("zero")][InlineData("precision")][InlineData("missing")][InlineData("over")][InlineData("empty")][InlineData("duplicate")][InlineData("too_many")][InlineData("reference")][InlineData("reason")][InlineData("unknown_credit")][InlineData("unknown_target")][InlineData("own_bill")][InlineData("closed")][InlineData("inactive_ap")]
    public async Task Invalid_application_rolls_back_everything_and_does_not_consume_number(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var input=Input(d,t.Line);var l=input.Lines![0];input=scenario switch{"negative"=>input with{Lines=[l with{Amount=-1}]},"zero"=>input with{Lines=[l with{Amount=0}]},"precision"=>input with{Lines=[l with{Amount=1.001m}]},"missing"=>input with{Lines=[l with{Amount=null}]},"over"=>input with{Lines=[l with{Amount=111}]},"empty"=>input with{Lines=[]},"duplicate"=>input with{Lines=[l,l]},"too_many"=>input with{Lines=Enumerable.Range(0,51).Select(_=>l with{BillLineId=Guid.NewGuid()}).ToArray()},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},"unknown_credit"=>input with{Lines=[l with{CreditLineId=Guid.NewGuid()}]},"unknown_target"=>input with{Lines=[l with{BillLineId=Guid.NewGuid()}]},"own_bill"=>input with{Lines=[l with{BillLineId=d.Line}]},_=>input};if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_ap")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='2000'",("company",db.Company));var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_CREDIT_APPLICATION'",("company",db.Company));var r=await Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",input);Assert.Contains(r.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity,HttpStatusCode.Conflict,HttpStatusCode.NotFound});Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_CREDIT_APPLICATION'",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM purchase.credit_applications WHERE company_id=@company",("company",db.Company)));Assert.Equal(110,await Balance(t.Line,"outstanding_amount"));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Late_audit_failure_rolls_back_application_or_unapplication_and_allows_same_key_retry(bool undo)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);Guid app=default;if(undo)app=App(await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created));var action=undo?"purchase.supplier_credit_unapplied":"purchase.supplier_credit_applied";var kind=undo?"SUPPLIER_CREDIT_UNAPPLICATION":"SUPPLIER_CREDIT_APPLICATION";var before=await Balance(t.Line,"outstanding_amount");var gst=await Balance(t.Line,"cash_tax_balance");var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",kind));var key=Code();var reference=Code();
        await S("CREATE FUNCTION public.fail_credit_application() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected credit application failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_credit_application BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_credit_application()");
        try{await Expect(undo?await Undo(c,app,key,reference):await Apply(c,d,t.Line,key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Balance(t.Line,"outstanding_amount"));Assert.Equal(gst,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",kind)));await Consistent(c);}
        finally{await S("DROP TRIGGER test_credit_application ON platform.audit_events;DROP FUNCTION public.fail_credit_application()");}
        await Expect(undo?await Undo(c,app,key,reference):await Apply(c,d,t.Line,key:key,reference:reference),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Original_AP_and_GST_accounts_survive_remapping_and_deactivated_supplier()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'2010','New AP','LIABILITY','AP'),(@company,'1310','New input','ASSET','GST');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP';UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1310') WHERE company_id=@company;UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);Assert.Equal(110,await Journal(App(a),"2000","debit"));Assert.Equal(0,await Journal(App(a),"2010","debit"));Assert.Equal(0,await Journal(App(a),"1310","debit"));await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Database_entrypoints_check_membership_and_application_tables_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);var staff=await Staff(db,"WAREHOUSE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT purchase.apply_supplier_credit(@id,'DIRECT','Reason','[]'::jsonb)","SELECT purchase.unapply_supplier_credit(@id,'DIRECT','Reason')"}){await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"denied-credit-application",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",sql.Contains("unapply",StringComparison.Ordinal)?App(a):d.Credit)));Assert.Equal("42501",e.SqlState);}
        foreach(var sql in new[]{"UPDATE purchase.credit_applications SET reason='change' WHERE company_id=@company AND id=@id RETURNING id","DELETE FROM purchase.credit_application_lines WHERE company_id=@company AND application_id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",App(a))));Assert.Contains(e.SqlState,new[]{"42501","23514"});}
    }

    [Fact]
    public async Task Credit_line_cap_prevents_refunding_applied_note_when_another_note_has_available_funds()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,credit:55);var second=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Second original credit",[new(d.Line,55)])),HttpStatusCode.Created);var e=d with{Credit=second.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=second.GetProperty("lines")[0].GetProperty("id").GetGuid()};var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line,55),HttpStatusCode.Created);await Expect(await Refund(c,d,55),HttpStatusCode.Conflict);await Expect(await Refund(c,e,55),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);await Expect(await Refund(c,d,55),HttpStatusCode.Created);Assert.Equal(0,await Balance(d.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Fact]
    public async Task Partial_refund_then_unapply_allows_real_payment_without_exceeding_original_cash_allocation_cap()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line,55),HttpStatusCode.Created);await Expect(await Pay(c,d,t.Line,55),HttpStatusCode.Created);var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{t.Bill}/credits",new ExpenseCreditInput(Code(),"Half cancelled",[new(t.Line,55)])),HttpStatusCode.Created);var e=d with{Bill=t.Bill,Line=t.Line,Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};await Expect(await Refund(c,e,55),HttpStatusCode.Created);await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(55,await Balance(t.Line,"outstanding_amount"));await Expect(await Pay(c,d,t.Line,55),HttpStatusCode.Created);Assert.Equal(5,await Balance(t.Line,"cash_tax_balance"));await Consistent(c);
    }
    [Fact]
    public async Task Different_original_AP_and_input_accounts_are_preserved_per_bill()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'2010','Target AP','LIABILITY','AP'),(@company,'1310','Target GST','ASSET','GST');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP';UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1310') WHERE company_id=@company",("company",db.Company));var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);Assert.Equal(110,await Journal(App(a),"2000","credit"));Assert.Equal(110,await Journal(App(a),"2010","debit"));Assert.Equal(10,await Journal(App(a),"1300","credit"));Assert.Equal(10,await Journal(App(a),"1310","debit"));var u=await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(110,await Journal(Unapp(u),"2000","debit"));Assert.Equal(110,await Journal(Unapp(u),"2010","credit"));Assert.Equal(10,await Journal(Unapp(u),"1300","debit"));Assert.Equal(10,await Journal(Unapp(u),"1310","credit"));await Consistent(c);
    }
    [Fact]
    public async Task Real_wrong_note_foreign_bill_and_other_supplier_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var otherNote=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{t.Bill}/credits",new ExpenseCreditInput(Code(),"Other note",[new(t.Line,55)])),HttpStatusCode.Created);var input=Input(d,t.Line) with{Lines=[new(otherNote.GetProperty("lines")[0].GetProperty("id").GetGuid(),t.Line,55)]};await Expect(await Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",input),HttpStatusCode.NotFound);
        var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Other supplier",null));var target=await Bill(c,d with{Supplier=supplier});await Expect(await Apply(c,d,target.Line),HttpStatusCode.NotFound);
        using var other=api.Authenticated(company:db.OtherCompany);var sid=await Create(other,"/suppliers",new SupplierMaintenance(Code(),"Other company",null));var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.OtherCompany)))!;var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.OtherCompany)))!;var date=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.OtherCompany)))!,System.Globalization.CultureInfo.InvariantCulture);var f=await Bill(other,d with{Supplier=sid,Account=acct,Tax=tax,Today=date},recoverable:false);await Expect(await Apply(c,d,f.Line),HttpStatusCode.NotFound);Assert.Equal(110,D((await CreditLine(c,d)).GetProperty("refundableAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData("closed")][InlineData("inactive_ap")][InlineData("inactive_input")][InlineData("reference")][InlineData("reason")]
    public async Task Failed_unapply_keeps_original_application_and_can_retry_after_fault_is_removed(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var a=await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created);if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario.StartsWith("inactive",StringComparison.Ordinal))await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code=@code",("company",db.Company),("code",scenario=="inactive_ap"?"2000":"1300"));var key=Code();var input=new SupplierCreditUnapplicationInput(scenario=="reference"?" ":Code(),scenario=="reason"?" ":"Verified correction");await Expect(await Send(c,HttpMethod.Post,$"/supplier-credit-applications/{App(a)}/unapply",input,key:key),HttpStatusCode.UnprocessableEntity);Assert.Equal(0,await Balance(t.Line,"outstanding_amount"));Assert.Equal(0L,await S("SELECT count(*) FROM purchase.credit_unapplications WHERE company_id=@company",("company",db.Company)));if(scenario=="closed")await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));if(scenario.StartsWith("inactive",StringComparison.Ordinal))await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code=@code",("company",db.Company),("code",scenario=="inactive_ap"?"2000":"1300"));input=input with{Reference=string.IsNullOrWhiteSpace(input.Reference)?Code():input.Reference,Reason="Verified correction"};await Expect(await Send(c,HttpMethod.Post,$"/supplier-credit-applications/{App(a)}/unapply",input,key:key),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Duplicate_references_are_unique_across_notes_and_actors_but_undo_references_have_their_own_namespace()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var t=await Bill(c,d);var e=await Bill(c,d);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var reference=Code();var r=await Task.WhenAll(Apply(c,d,t.Line,55,reference:reference.ToUpperInvariant()),Apply(f,d,e.Line,55,reference:" "+reference.ToLowerInvariant()+" "));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);var a=App(await Expect(r.Single(x=>x.StatusCode==HttpStatusCode.Created),HttpStatusCode.Created));await Expect(await Undo(c,a,reference:reference),HttpStatusCode.Created);await Consistent(c);
    }
    private async Task<(Guid Bill,Guid Line,Guid Receipt,Guid ReceiptLine)> Matched(HttpClient c,Data d)
    {
        var sales=await Setup(db,c,0);var p=await Get(c,$"/products/{sales.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{sales.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Procured service",p.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(d.Supplier,sales.Warehouse,[new(sales.BoxUnit,2,10)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);var pr=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),2),HttpStatusCode.Created);var rid=pr.GetProperty("receipt").GetProperty("id").GetGuid();var rl=pr.GetProperty("lines")[0].GetProperty("id").GetGuid();var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(rl,2,20,2)],"Verified",d.Today)),HttpStatusCode.Created);return(b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid(),rid,rl);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Receipt_and_expense_credit_sources_and_targets_interoperate(bool receiptSource)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var m=await Matched(c,d);Guid target;
        if(receiptSource){await Expect(await Pay(c,d,m.Line,22),HttpStatusCode.Created);var r=await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{m.Receipt}/returns",new PurchaseReturnInput(Code(),"Verified return",[new(m.ReceiptLine,2,m.Line)])),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{m.Bill}/credits",new SupplierCreditInput(Code(),"Verified supplier credit",[new(r.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)])),HttpStatusCode.Created);d=d with{Bill=m.Bill,Line=m.Line,Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid(),Gross=22};target=(await Bill(c,d,20,2)).Line;}
        else target=m.Line;
        var a=await Expect(await Apply(c,d,target,22),HttpStatusCode.Created);Assert.Equal(0,await Balance(target,"outstanding_amount"));await Expect(await Undo(c,App(a)),HttpStatusCode.Created);Assert.Equal(22,await Balance(target,"outstanding_amount"));await Consistent(c);
    }

    [Fact]
    public async Task Multiple_credit_lines_with_different_recoverability_settle_targets_using_target_tax_facts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.Account,"Recoverable",100,10,d.Tax),new(d.Account,"Nonrecoverable",50,5,d.Tax,false)],"Verified",d.Today)),HttpStatusCode.Created);var bid=b.GetProperty("bill").GetProperty("id").GetGuid();var bl=b.GetProperty("lines").EnumerateArray().Select(x=>(Id:x.GetProperty("id").GetGuid(),Gross:D(x.GetProperty("net"))+D(x.GetProperty("tax")))).ToArray();await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(165,"BANK_TRANSFER",Code(),Allocations:bl.Select(x=>new SupplierPaymentAllocation(x.Id,x.Gross)).ToArray())),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{bid}/credits",new ExpenseCreditInput(Code(),"Full multiline credit",bl.Select(x=>new ExpenseCreditLineInput(x.Id,x.Gross)).ToArray())),HttpStatusCode.Created);var t=await Bill(c,d);var u=await Bill(c,d,50,5);var lines=cn.GetProperty("lines").EnumerateArray().Select(x=>new SupplierCreditAllocation(x.GetProperty("id").GetGuid(),D(x.GetProperty("gross"))==110?t.Line:u.Line,D(x.GetProperty("gross")))).ToArray();var app=await Expect(await Send(c,HttpMethod.Post,$"/supplier-credits/{cn.GetProperty("credit").GetProperty("id").GetGuid()}/apply",new SupplierCreditApplicationInput(Code(),"Mixed source tax",lines)),HttpStatusCode.Created);Assert.Equal(10,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(5,await Balance(u.Line,"cash_tax_balance"));await Expect(await Undo(c,App(app)),HttpStatusCode.Created);Assert.Equal(0,await Balance(t.Line,"cash_tax_balance"));Assert.Equal(0,await Balance(u.Line,"cash_tax_balance"));await Consistent(c);
    }
}
