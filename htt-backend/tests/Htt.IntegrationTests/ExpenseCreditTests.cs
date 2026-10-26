using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class ExpenseCreditTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Bill,Guid Line,Guid Account,Guid Tax,DateOnly Today,decimal Gross);
    private async Task<Data> Expense(HttpClient c,string basis="CASH",bool registered=true,decimal net=100,decimal tax=10,bool? recoverable=null)
    {
        await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=@registered WHERE id=@company",("company",db.Company),("basis",basis),("registered",registered));
        var sid=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Expense credit supplier",null));
        var acct=(Guid)(await S("INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(@company,'6060','Operating expense','EXPENSE') RETURNING id",("company",db.Company)))!;
        var tc=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;
        var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!,System.Globalization.CultureInfo.InvariantCulture);
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(sid,Code(),today,today.AddDays(30),today,[new(acct,"Original operating expense",net,tax,tc,recoverable)],"Verified invoice",today)),HttpStatusCode.Created);
        return new(sid,b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid(),acct,tc,today,net+tax);
    }
    private static ExpenseCreditInput Input(Data d,decimal? amount=null,string? reference=null)=>new(reference??Code(),"Verified supplier adjustment note",[new(d.Line,amount??d.Gross)]);
    private static Task<HttpResponseMessage> Credit(HttpClient c,Data d,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",Input(d,amount,reference),key:key);
    private static Task<HttpResponseMessage> Refund(HttpClient c,Guid line,decimal amount,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,reference??Code(),"Verified incoming expense refund",CreditLineId:line),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),Allocations:[new(d.Line,amount)]));
    private static Guid Cid(JsonElement e)=>e.GetProperty("credit").GetProperty("id").GetGuid();
    private static Guid Clid(JsonElement e)=>e.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Guid Fid(JsonElement e)=>e.GetProperty("refund").GetProperty("id").GetGuid();
    private static Task<JsonElement> Ap(HttpClient c,Data d)=>Get(c,$"/accounting/ap?supplierId={d.Supplier}");
    private static Task<JsonElement> Gst(HttpClient c,Data d)=>Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");
    private static async Task Consistent(HttpClient c){var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches pb JOIN accounting.journal_entries je ON je.company_id=pb.company_id AND je.posting_batch_id=pb.id JOIN accounting.journal_lines l ON l.company_id=je.company_id AND l.journal_entry_id=je.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE pb.company_id=@company AND pb.source_document_id=@doc AND a.code=@code",("company",db.Company),("doc",doc),("code",code)));
    [Theory]
    [InlineData("CASH",0)][InlineData("CASH",55)][InlineData("CASH",110)]
    [InlineData("NON_CASH",0)][InlineData("NON_CASH",55)][InlineData("NON_CASH",110)]
    public async Task Partial_credit_reverses_original_expense_AP_and_tax_and_refunds_only_paid_excess(string basis,decimal paid)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,basis);if(paid>0)await Expect(await Pay(c,d,paid),HttpStatusCode.Created);
        var cr=await Expect(await Credit(c,d,55),HttpStatusCode.Created);Assert.Equal("EXPENSE",cr.GetProperty("credit").GetProperty("creditType").GetString());Assert.StartsWith("SC-",cr.GetProperty("credit").GetProperty("number").GetString());Assert.Equal(JsonValueKind.Null,cr.GetProperty("lines")[0].GetProperty("returnLineId").ValueKind);Assert.Equal(JsonValueKind.Null,cr.GetProperty("lines")[0].GetProperty("quantity").ValueKind);
        Assert.Equal(50,await Journal(Cid(cr),"6060","credit"));Assert.Equal(55,await Journal(Cid(cr),"2000","debit"));Assert.Equal(5,await Journal(Cid(cr),basis=="CASH"?"1410":"1300","credit"));Assert.Equal(0,await Journal(Cid(cr),"1600","credit"));Assert.Equal(Math.Max(0,55-paid),D((await Ap(c,d)).GetProperty("outstandingAmount")));Assert.Equal(Math.Max(0,paid-55),D(cr.GetProperty("lines")[0].GetProperty("refundableAmount")));await Consistent(c);
        if(paid>55){var rf=await Expect(await Refund(c,Clid(cr),55),HttpStatusCode.Created);Assert.Equal(55,await Journal(Fid(rf),"1000","debit"));Assert.Equal(55,await Journal(Fid(rf),"2000","credit"));Assert.Equal(basis=="CASH"?5:0,await Journal(Fid(rf),"1300","credit"));}
        else await Expect(await Refund(c,Clid(cr),1),HttpStatusCode.Conflict);
        Assert.Equal(basis=="NON_CASH"||paid>=55?5:0,D((await Gst(c,d)).GetProperty("attributedTax")));await Consistent(c);
        foreach(var table in new[]{"purchase.orders","purchase.receipts","purchase.returns","accounting.grni_items","inventory.stock_movements"})Assert.Equal(0L,await S($"SELECT count(*) FROM {table} WHERE company_id=@company",("company",db.Company)));
        Assert.Equal(Cid(cr),Cid(await Get(c,$"/supplier-credits/{Cid(cr)}")));Assert.Single((await Get(c,$"/supplier-credits?supplierId={d.Supplier}")).GetProperty("items").EnumerateArray());
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",false)][InlineData("NON_CASH",true)]
    public async Task Full_credit_and_refund_reverse_all_expense_and_tax_after_direct_or_advance_settlement(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,basis);
        if(advance){var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,Notes:"Expense deposit")),HttpStatusCode.Created);var aid=p.GetProperty("advances")[0].GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.Line,110)])),HttpStatusCode.Created);}
        else await Expect(await Pay(c,d,110),HttpStatusCode.Created);
        var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);Assert.Equal(110,D((await Ap(c,d)).GetProperty("availableCredit")));await Consistent(c);var rf=await Expect(await Refund(c,Clid(cr),110),HttpStatusCode.Created);Assert.StartsWith("SR-",rf.GetProperty("refund").GetProperty("number").GetString());Assert.Equal(0,D((await Ap(c,d)).GetProperty("availableCredit")));Assert.Equal(0,D((await Ap(c,d)).GetProperty("outstandingAmount")));var g=await Gst(c,d);Assert.Equal(0,D(g.GetProperty("attributedTax")));Assert.Equal(0,D(g.GetProperty("pendingRefundTax")));Assert.Equal(0,D(g.GetProperty("pendingPaymentTax")));Assert.Equal(0,D((await Get(c,$"/suppliers/{d.Supplier}/advances")).GetProperty("availableAmount")));await Consistent(c);await Expect(await Refund(c,Clid(cr),1),HttpStatusCode.Conflict);await Expect(await Pay(c,d,1),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Unpaid_full_credit_cancels_AP_without_creating_refundable_cash(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,basis);var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);Assert.Equal(0,D((await Ap(c,d)).GetProperty("outstandingAmount")));Assert.Equal(0,D((await Gst(c,d)).GetProperty("attributedTax")));await Expect(await Refund(c,Clid(cr),1),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData(false,null)][InlineData(true,false)]
    public async Task Nonrecoverable_GST_reverses_as_expense_and_never_creates_input_adjustment(bool registered,bool? recoverable)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,registered:registered,recoverable:recoverable);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);Assert.Equal(110,await Journal(Cid(cr),"6060","credit"));Assert.Equal(0,await Journal(Cid(cr),"1410","credit"));await Expect(await Refund(c,Clid(cr),110),HttpStatusCode.Created);Assert.Equal(0,D((await Gst(c,d)).GetProperty("attributedTax")));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Payment_and_advance_application_after_credit_obey_reduced_AP_and_GST(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,27.5m),HttpStatusCode.Created);await Expect(await Credit(c,d,55),HttpStatusCode.Created);Assert.Equal(27.5m,D((await Ap(c,d)).GetProperty("outstandingAmount")));
        if(advance){var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(55,"BANK_TRANSFER",Code(),55,Notes:"Expense deposit")),HttpStatusCode.Created);var aid=p.GetProperty("advances")[0].GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.Line,55)])),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.Line,27.5m)])),HttpStatusCode.Created);Assert.Equal(27.5m,D((await Get(c,$"/suppliers/{d.Supplier}/advances")).GetProperty("availableAmount")));}
        else {await Expect(await Pay(c,d,55),HttpStatusCode.Conflict);await Expect(await Pay(c,d,27.5m),HttpStatusCode.Created);}
        Assert.Equal(5,D((await Gst(c,d)).GetProperty("attributedTax")));await Consistent(c);
    }
    [Fact]
    public async Task Partial_credit_and_refund_rounding_absorbs_last_cent_without_stock_or_tax_loss()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,net:0.05m,tax:0.01m);await Expect(await Pay(c,d,0.06m),HttpStatusCode.Created);
        foreach(var tax in new[]{0m,0.01m,0m}){var cr=await Expect(await Credit(c,d,0.02m),HttpStatusCode.Created);Assert.Equal(tax,D(cr.GetProperty("credit").GetProperty("tax")));await Consistent(c);await Expect(await Refund(c,Clid(cr),0.02m),HttpStatusCode.Created);await Consistent(c);}
        Assert.Equal(0,D((await Gst(c,d)).GetProperty("attributedTax")));await Expect(await Credit(c,d,0.01m),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Zero_value_source_can_be_closed_once_without_empty_journal_or_cash_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,net:0,tax:0);var cr=await Expect(await Credit(c,d,0),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,cr.GetProperty("credit").GetProperty("journalEntryId").ValueKind);await Expect(await Credit(c,d,0),HttpStatusCode.Conflict);await Expect(await Refund(c,Clid(cr),0.01m),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_credit_or_refund_expenses(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);var staff=await Staff(db,role);using var denied=api.Authenticated(staff.Subject);await Expect(await Credit(denied,d),HttpStatusCode.Forbidden);await Expect(await Refund(denied,Clid(cr),110),HttpStatusCode.Forbidden);await Expect(await denied.GetAsync($"/api/v1/supplier-credits/{Cid(cr)}"),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("purchase.bills.read")][InlineData("purchase.credits.read")][InlineData("purchase.expense_credits.post")]
    public async Task Revocation_prevents_cached_credit_response(string capability)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var input=Input(d);var key=Code();await Expect(await Send(f,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",input,key:key),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",capability));await Expect(await Send(f,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",input,key:key),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Expense_credit_capability_is_separate_from_old_stock_credit_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.expense_credits.post' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Credit(f,d),HttpStatusCode.Forbidden);await S("INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT @company,id,'purchase.expense_credits.post' FROM identity.roles WHERE company_id=@company AND code='FINANCE';DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.credits.post' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Credit(f,d),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Anonymous_portal_and_other_company_cannot_credit_or_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var denied in new[]{anon,portal}){Assert.Equal(HttpStatusCode.Unauthorized,(await Credit(denied,d)).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await Refund(denied,Clid(cr),110)).StatusCode);}using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Credit(other,d),HttpStatusCode.NotFound);await Expect(await Refund(other,Clid(cr),110),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Concurrent_same_key_credit_and_refund_execute_only_once_and_changed_payload_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var key=Code();var reference=Code();var all=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Credit(c,d,key:key,reference:reference)));var credits=new List<JsonElement>();foreach(var r in all)credits.Add(await Expect(r,HttpStatusCode.Created));Assert.Single(credits.Select(Cid).Distinct());await Expect(await Credit(c,d,55,key,reference),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action='purchase.supplier_credited'",("company",db.Company),("id",Cid(credits[0]))));
        key=Code();reference=Code();var refunds=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Refund(c,Clid(credits[0]),110,key,reference)));var ids=new List<Guid>();foreach(var r in refunds)ids.Add(Fid(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Refund(c,Clid(credits[0]),55,key,reference),HttpStatusCode.Conflict);Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action='purchase.supplier_refunded'",("company",db.Company),("id",ids[0])));await Consistent(c);
    }
    [Fact]
    public async Task Different_keys_cannot_overcredit_or_overrefund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var r=await Task.WhenAll(Credit(c,d),Credit(c,d));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);var cr=await Expect(r.Single(x=>x.StatusCode==HttpStatusCode.Created),HttpStatusCode.Created);var refunds=await Task.WhenAll(Refund(c,Clid(cr),110),Refund(c,Clid(cr),110));Assert.Single(refunds,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(refunds,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Two_partial_credits_can_consume_one_remainder_without_losing_updates()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var r=await Task.WhenAll(Credit(c,d,55),Credit(c,d,55));foreach(var x in r)await Expect(x,HttpStatusCode.Created);Assert.Equal(0,D((await Ap(c,d)).GetProperty("outstandingAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Credit_competes_with_payment_or_advance_without_overpaying_remaining_AP(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);Guid aid=default;
        if(advance){var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,Notes:"Expense deposit")),HttpStatusCode.Created);aid=p.GetProperty("advances")[0].GetProperty("id").GetGuid();}
        var results=await Task.WhenAll(Credit(c,d,55),advance?Send(c,HttpMethod.Post,$"/supplier-advances/{aid}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.Line,110)])):Pay(c,d,110));await Expect(results[0],HttpStatusCode.Created);Assert.Contains(results[1].StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});var ap=await Ap(c,d);Assert.Equal(results[1].StatusCode==HttpStatusCode.Created?55:0,D(ap.GetProperty("availableCredit")));Assert.Equal(results[1].StatusCode==HttpStatusCode.Created?0:55,D(ap.GetProperty("outstandingAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData("negative")][InlineData("precision")][InlineData("missing_amount")][InlineData("zero")][InlineData("over")][InlineData("blank_reference")][InlineData("blank_reason")][InlineData("duplicate")][InlineData("empty")][InlineData("too_many")][InlineData("foreign_line")][InlineData("other_bill")][InlineData("inactive_account")][InlineData("closed")]
    public async Task Invalid_credit_is_atomic_and_does_not_consume_number(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var input=Input(d);var l=input.Lines![0];input=scenario switch{
            "negative"=>input with{Lines=[l with{Amount=-1}]},"precision"=>input with{Lines=[l with{Amount=1.001m}]},"missing_amount"=>input with{Lines=[l with{Amount=null}]},"zero"=>input with{Lines=[l with{Amount=0}]},"over"=>input with{Lines=[l with{Amount=111}]},"blank_reference"=>input with{Reference=" "},"blank_reason"=>input with{Reason=" "},"duplicate"=>input with{Lines=[l,l]},"empty"=>input with{Lines=[]},"too_many"=>input with{Lines=Enumerable.Range(0,51).Select(_=>new ExpenseCreditLineInput(Guid.NewGuid(),1)).ToArray()},"foreign_line"=>input with{Lines=[l with{BillLineId=Guid.NewGuid()}]},"other_bill"=>input with{Lines=[l,new(Guid.NewGuid(),1)]},_=>input};
        if(scenario=="inactive_account")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Account));if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_CREDIT'",("company",db.Company));var r=await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",input);Assert.Contains(r.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity,HttpStatusCode.NotFound,HttpStatusCode.Conflict});Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_CREDIT'",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM purchase.supplier_credit_notes WHERE company_id=@company",("company",db.Company)));Assert.Equal(110,D((await Ap(c,d)).GetProperty("outstandingAmount")));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Late_audit_failure_rolls_back_credit_or_refund_and_original_key_can_retry(bool refund)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);JsonElement cr=default;if(refund)cr=await Expect(await Credit(c,d),HttpStatusCode.Created);var action=refund?"purchase.supplier_refunded":"purchase.supplier_credited";var kind=refund?"SUPPLIER_REFUND":"SUPPLIER_CREDIT";var key=Code();var reference=Code();var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",kind));var before=(await Gst(c,d)).GetRawText();
        await S("CREATE FUNCTION public.fail_expense_contra() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected expense contra failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_expense_contra BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_expense_contra()");
        try{await Expect(refund?await Refund(c,Clid(cr),110,key,reference):await Credit(c,d,key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",kind)));Assert.Equal(before,(await Gst(c,d)).GetRawText());await Consistent(c);}
        finally{await S("DROP TRIGGER test_expense_contra ON platform.audit_events;DROP FUNCTION public.fail_expense_contra()");}
        await Expect(refund?await Refund(c,Clid(cr),110,key,reference):await Credit(c,d,key:key,reference:reference),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Original_accounts_and_tax_snapshot_survive_remapping_and_supplier_deactivation()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);
        await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'2010','New AP','LIABILITY','AP'),(@company,'1310','New input','ASSET','GST');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP';UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1310') WHERE company_id=@company;UPDATE accounting.accounts SET name='Renamed expense' WHERE company_id=@company AND id=@acct;UPDATE accounting.tax_rates SET rate=0.2 WHERE company_id=@company AND tax_code_id=@tax;UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("acct",d.Account),("tax",d.Tax),("supplier",d.Supplier));
        var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);Assert.Equal(100,await Journal(Cid(cr),"6060","credit"));Assert.Equal("Operating expense",cr.GetProperty("lines")[0].GetProperty("snapshot").GetProperty("expenseAccountName").GetString());Assert.Equal(10,D(cr.GetProperty("credit").GetProperty("tax")));Assert.Equal(0,await Journal(Cid(cr),"2010","debit"));var rf=await Expect(await Refund(c,Clid(cr),110),HttpStatusCode.Created);Assert.Equal(10,await Journal(Fid(rf),"1300","credit"));Assert.Equal(0,await Journal(Fid(rf),"1310","credit"));await Consistent(c);
    }
    [Fact]
    public async Task SQL_checks_membership_and_posted_credit_tables_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var staff=await Staff(db,"WAREHOUSE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);await using(var session=new CompanySession(source)){await session.BeginAsync(db.Company,access.ActorId,"denied-expense-credit",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT purchase.post_expense_credit(@bill,'DIRECT','Reason','[]'::jsonb)",default,("bill",d.Bill)));Assert.Equal("42501",e.SqlState);}
        var cr=await Expect(await Credit(c,d),HttpStatusCode.Created);foreach(var statement in new[]{"UPDATE purchase.supplier_credit_notes SET reason='change' WHERE company_id=@company AND id=@id RETURNING id","DELETE FROM purchase.supplier_credit_notes WHERE company_id=@company AND id=@id RETURNING id","UPDATE purchase.supplier_credit_lines SET expense_amount=0 WHERE company_id=@company AND credit_note_id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,statement,default,("company",db.Company),("id",Cid(cr))));Assert.Contains(e.SqlState,new[]{"42501","23514"});}
    }

    [Fact]
    public async Task Real_other_bill_and_cross_company_lines_cannot_be_credited_against_local_bill()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);
        var second=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.Account,"Other bill expense",100,10,d.Tax)],"Verified",d.Today)),HttpStatusCode.Created);var secondLine=second.GetProperty("lines")[0].GetProperty("id").GetGuid();
        await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Wrong bill",[new(secondLine,110)])),HttpStatusCode.NotFound);
        using var other=api.Authenticated(company:db.OtherCompany);var sid=await Create(other,"/suppliers",new SupplierMaintenance(Code(),"Other company",null));var account=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5000'",("company",db.OtherCompany)))!;var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='FRE'",("company",db.OtherCompany)))!;
        var otherToday=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.OtherCompany)))!,System.Globalization.CultureInfo.InvariantCulture);var ob=await Expect(await Send(other,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(sid,Code(),otherToday,otherToday,otherToday,[new(account,"Foreign expense",100,0,tax)])),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Cross company",[new(ob.GetProperty("lines")[0].GetProperty("id").GetGuid(),100)])),HttpStatusCode.NotFound);Assert.Equal(220,D((await Ap(c,d)).GetProperty("outstandingAmount")));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Multiline_taxable_free_and_nonrecoverable_expenses_reverse_original_allocations(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c,basis);var free=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='FRE'",("company",db.Company)))!;
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.Account,"Taxable",100,10,d.Tax),new(d.Account,"Free",20,0,free),new(d.Account,"Nonrecoverable",30,3,d.Tax,false)],"Verified",d.Today)),HttpStatusCode.Created);var bid=b.GetProperty("bill").GetProperty("id").GetGuid();var allocations=b.GetProperty("lines").EnumerateArray().Select(x=>new SupplierPaymentAllocation(x.GetProperty("id").GetGuid(),D(x.GetProperty("net"))+D(x.GetProperty("tax")))).ToArray();await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(163,"BANK_TRANSFER",Code(),Allocations:allocations)),HttpStatusCode.Created);
        var input=new ExpenseCreditInput(Code(),"Verified multiline adjustment",allocations.Select(x=>new ExpenseCreditLineInput(x.BillLineId,x.Amount)).ToArray());var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{bid}/credits",input),HttpStatusCode.Created);Assert.Equal(153,await Journal(Cid(cr),"6060","credit"));Assert.Equal(13,D(cr.GetProperty("credit").GetProperty("tax")));foreach(var line in cr.GetProperty("lines").EnumerateArray())await Expect(await Refund(c,line.GetProperty("id").GetGuid(),D(line.GetProperty("gross"))),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Refund_post_revocation_blocks_cached_response_and_credit_replay_does_not_repost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var key=Code();var reference=Code();var cr=await Expect(await Credit(c,d,key:key,reference:reference),HttpStatusCode.Created);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var refundKey=Code();var refundReference=Code();await Expect(await Refund(f,Clid(cr),110,refundKey,refundReference),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.refunds.post' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Refund(f,Clid(cr),110,refundKey,refundReference),HttpStatusCode.Forbidden);Assert.Equal(Cid(cr),Cid(await Expect(await Credit(c,d,key:key,reference:reference),HttpStatusCode.Created)));Assert.Equal(0,D((await Ap(c,d)).GetProperty("availableCredit")));await Consistent(c);
    }
    [Fact]
    public async Task Refund_and_further_credit_serialize_without_losing_paid_or_tax_balances()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);await Expect(await Pay(c,d,110),HttpStatusCode.Created);var cr=await Expect(await Credit(c,d,55),HttpStatusCode.Created);var results=await Task.WhenAll(Refund(c,Clid(cr),55),Credit(c,d,55));await Expect(results[0],HttpStatusCode.Created);var second=await Expect(results[1],HttpStatusCode.Created);await Consistent(c);await Expect(await Refund(c,Clid(second),55),HttpStatusCode.Created);Assert.Equal(0,D((await Gst(c,d)).GetProperty("attributedTax")));await Consistent(c);
    }
    [Fact]
    public async Task Different_staff_cannot_reuse_supplier_credit_reference_on_other_expense_bill()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.Account,"Second",100,10,d.Tax)],"Verified",d.Today)),HttpStatusCode.Created);var e=d with{Bill=b.GetProperty("bill").GetProperty("id").GetGuid(),Line=b.GetProperty("lines")[0].GetProperty("id").GetGuid()};var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var reference=Code();var r=await Task.WhenAll(Credit(c,d,reference:reference.ToUpperInvariant()),Credit(f,e,reference:" "+reference.ToLowerInvariant()+" "));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(110,D((await Ap(c,d)).GetProperty("outstandingAmount")));await Consistent(c);
    }
    private async Task<(Guid Bill,Guid ReturnLine)> PhysicalCreditSource(HttpClient c,Data d)
    {
        var sales=await Setup(db,c,0);var product=await Get(c,$"/products/{sales.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{sales.Product}",new ProductMaintenance(product.GetProperty("sku").GetString()!,"Procured service",product.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(d.Supplier,sales.Warehouse,[new(sales.BoxUnit,2,10)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);var receipt=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),2),HttpStatusCode.Created);
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(receipt.GetProperty("lines")[0].GetProperty("id").GetGuid(),2,20,2)],"Verified",d.Today)),HttpStatusCode.Created);var ret=await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{receipt.GetProperty("receipt").GetProperty("id").GetGuid()}/returns",new PurchaseReturnInput(Code(),"Accepted service cancellation",[new(receipt.GetProperty("lines")[0].GetProperty("id").GetGuid(),2,b.GetProperty("lines")[0].GetProperty("id").GetGuid())])),HttpStatusCode.Created);return(b.GetProperty("bill").GetProperty("id").GetGuid(),ret.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    [Fact]
    public async Task Expense_and_receipt_credits_share_reference_uniqueness_and_old_route_cannot_fake_expense_return()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Expense(c);var physical=await PhysicalCreditSource(c,d);await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{physical.Bill}/credits",Input(d)),HttpStatusCode.NotFound);await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{d.Bill}/credits",new SupplierCreditInput(Code(),"Wrong source",[new(physical.ReturnLine,2)])),HttpStatusCode.NotFound);
        var reference=Code();var r=await Task.WhenAll(Credit(c,d,reference:reference),Send(c,HttpMethod.Post,$"/supplier-bills/{physical.Bill}/credits",new SupplierCreditInput(" "+reference.ToLowerInvariant()+" ","Verified stock-source adjustment",[new(physical.ReturnLine,2)])));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
}
