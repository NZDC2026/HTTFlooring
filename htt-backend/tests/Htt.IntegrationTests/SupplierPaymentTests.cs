using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Htt.SharedKernel;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SupplierPaymentTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Bill,Guid Line,DateOnly Today,decimal Gross)
    {
        public SupplierPaymentInput Payment(decimal? amount=null,string? reference=null)=>new(amount??Gross,"BANK_TRANSFER",reference??Code(),Allocations:[new(Line,amount??Gross)]);
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
        return new(sid,bill.GetProperty("bill").GetProperty("id").GetGuid(),bill.GetProperty("lines")[0].GetProperty("id").GetGuid(),today,D(bill.GetProperty("bill").GetProperty("gross")));
    }
    private static Task<HttpResponseMessage> Pay(HttpClient c,Guid supplier,SupplierPaymentInput input,string? key=null)=>Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",input,key:key);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Guid advance,IReadOnlyList<SupplierPaymentAllocation> lines,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-advances/{advance}/apply",new SupplierAdvanceApplicationInput(reference??Code(),lines),key:key);
    private static Guid PaymentId(JsonElement r)=>r.GetProperty("payment").GetProperty("id").GetGuid();
    private static Guid AdvanceId(JsonElement r)=>r.GetProperty("advances")[0].GetProperty("id").GetGuid();
    private static Guid ApplicationId(JsonElement r)=>r.GetProperty("application").GetProperty("id").GetGuid();
    private static async Task<JsonElement> Prepay(HttpClient c,Guid supplier,decimal amount=22,DateOnly? date=null,string? key=null)=>await Expect(await Pay(c,supplier,new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),amount,PaidOn:date,Notes:"Purchase deposit pending invoice"),key),HttpStatusCode.Created);
    private static async Task<decimal> AP(HttpClient c,Guid supplier)=>D((await Get(c,$"/accounting/ap?supplierId={supplier}")).GetProperty("outstandingAmount"));
    private static async Task<decimal> Available(HttpClient c,Guid supplier)=>D((await Get(c,$"/suppliers/{supplier}/advances")).GetProperty("availableAmount"));
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(jl.{side}),0) FROM accounting.posting_batches pb JOIN accounting.journal_entries je ON je.company_id=pb.company_id AND je.posting_batch_id=pb.id JOIN accounting.journal_lines jl ON jl.company_id=je.company_id AND jl.journal_entry_id=je.id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE pb.company_id=@company AND pb.source_document_id=@doc AND a.code=@code",("company",db.Company),("doc",doc),("code",code)));
    [Theory]
    [InlineData("CASH",2)]
    [InlineData("NON_CASH",0)]
    public async Task Payment_reduces_AP_and_only_cash_basis_releases_deferred_input_GST(string basis,decimal tax)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis);var p=await Expect(await Pay(c,d.Supplier,d.Payment()),HttpStatusCode.Created);var id=PaymentId(p);
        Assert.StartsWith("SP-",p.GetProperty("payment").GetProperty("number").GetString());Assert.Equal("POSTED",p.GetProperty("payment").GetProperty("state").GetString());Assert.Equal(22,await Journal(id,"2000","debit"));Assert.Equal(22,await Journal(id,"1000","credit"));Assert.Equal(tax,await Journal(id,"1300","debit"));Assert.Equal(tax,await Journal(id,"1410","credit"));Assert.Equal(0,await AP(c,d.Supplier));
        var bill=await Get(c,$"/supplier-bills/{d.Bill}");Assert.Equal(22,D(bill.GetProperty("lines")[0].GetProperty("paidAmount")));Assert.Equal(0,D(bill.GetProperty("lines")[0].GetProperty("outstandingAmount")));
        var gst=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(2,D(gst.GetProperty("attributedTax")));Assert.Equal(0,D(gst.GetProperty("pendingPaymentTax")));Assert.Equal(1,(await Get(c,$"/accounting/purchase-gst-attributions?supplierId={d.Supplier}")).GetProperty("items").GetArrayLength());
        Assert.Equal(id,PaymentId(await Get(c,$"/supplier-payments/{id}")));
    }
    [Fact]
    public async Task Partial_payments_and_last_cent_rounding_clear_exact_AP_and_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,qty:3,cost:0.05m);
        foreach(var amount in new[]{0.05m,0.05m,0.07m})await Expect(await Pay(c,d.Supplier,d.Payment(amount)),HttpStatusCode.Created);
        Assert.Equal(0,await AP(c,d.Supplier));var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(0.02m,D(g.GetProperty("attributedTax")));Assert.Equal(0,D(g.GetProperty("pendingPaymentTax")));
    }
    [Fact]
    public async Task Mixed_payment_allocates_existing_bill_and_explicit_surplus_to_supplier_asset()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Expect(await Pay(c,d.Supplier,d.Payment() with{Amount=33,AdvanceAmount=11,Notes="Next shipment deposit"}),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(11,await Available(c,d.Supplier));Assert.Equal(11,await Journal(PaymentId(p),"1500","debit"));Assert.Equal(33,await Journal(PaymentId(p),"1000","credit"));
        var e=await SetupBill(c,supplier:d.Supplier);var app=await Expect(await Apply(c,AdvanceId(p),[new(e.Line,11)]),HttpStatusCode.Created);Assert.Equal(11,await AP(c,d.Supplier));Assert.Equal(0,await Available(c,d.Supplier));Assert.Equal(0,await Journal(ApplicationId(app),"1000","credit"));Assert.Equal(1,await Journal(ApplicationId(app),"1300","debit"));
    }
    [Theory]
    [InlineData("CASH",2)]
    [InlineData("NON_CASH",0)]
    public async Task Prepayment_before_bill_then_application_clears_asset_without_second_bank_movement(string basis,decimal tax)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Configure(basis);var supplier=await Supplier(c);var payment=await Prepay(c,supplier);Assert.Equal(22,await Available(c,supplier));Assert.Equal(0,await AP(c,supplier));Assert.Equal(0,await Journal(PaymentId(payment),"1300","debit"));
        var d=await SetupBill(c,basis,supplier:supplier);var app=await Expect(await Apply(c,AdvanceId(payment),[new(d.Line,22)]),HttpStatusCode.Created);Assert.StartsWith("SA-",app.GetProperty("application").GetProperty("number").GetString());var id=ApplicationId(app);Assert.Equal(22,await Journal(id,"2000","debit"));Assert.Equal(22,await Journal(id,"1500","credit"));Assert.Equal(tax,await Journal(id,"1300","debit"));Assert.Equal(0,await Journal(id,"1000","credit"));Assert.Equal(0,await AP(c,supplier));Assert.Equal(0,await Available(c,supplier));Assert.Equal(id,ApplicationId(await Get(c,$"/supplier-advance-applications/{id}")));
    }
    [Fact]
    public async Task Prepayment_GST_uses_original_payment_and_held_date_not_application_date()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,invoiceDays:-4,heldDays:-2);var p=await Prepay(c,d.Supplier,date:d.Today.AddDays(-3));await Expect(await Apply(c,AdvanceId(p),[new(d.Line,11)]),HttpStatusCode.Created);
        var day=d.Today.AddDays(-2).ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture);var g=await Get(c,$"/accounting/purchase-gst-attributions?supplierId={d.Supplier}&from={day}&to={day}");Assert.Equal(day,g.GetProperty("items")[0].GetProperty("attributionDate").GetString());Assert.Equal(1,D(g.GetProperty("items")[0].GetProperty("gstAmount")));Assert.Equal("PREPAYMENT_APPLICATION",g.GetProperty("items")[0].GetProperty("kind").GetString());
        var now=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from={d.Today:yyyy-MM-dd}");Assert.Equal(0,D(now.GetProperty("attributedTax")));Assert.Equal(1,D(now.GetProperty("pendingPaymentTax")));Assert.Equal(11,await Available(c,d.Supplier));
    }
    [Fact]
    public async Task One_payment_can_clear_multiple_bills_for_same_supplier()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);await Expect(await Pay(c,d.Supplier,new(44,"CARD",Code(),Allocations:[new(d.Line,22),new(e.Line,22)])),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(4,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Nonrecoverable_tax_is_not_released_on_payment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,registered:false);var p=await Expect(await Pay(c,d.Supplier,d.Payment()),HttpStatusCode.Created);Assert.Equal(0,await Journal(PaymentId(p),"1300","debit"));Assert.Equal(0,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));Assert.Equal(0,await AP(c,d.Supplier));
    }
    [Fact]
    public async Task Same_key_parallel_payments_replay_one_semantic_result_and_reject_changed_content()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Payment();var key=Code();var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Pay(c,d.Supplier,input,key)));var ids=new List<Guid>();foreach(var r in results)ids.Add(PaymentId(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Pay(c,d.Supplier,input with{Notes="changed"},key),HttpStatusCode.Conflict);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.supplier_payments WHERE company_id=@company AND supplier_id=@supplier",("company",db.Company),("supplier",d.Supplier)));
    }
    [Fact]
    public async Task Different_keys_racing_for_last_AP_balance_only_one_succeeds()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var r=await Task.WhenAll(Pay(c,d.Supplier,d.Payment()),Pay(c,d.Supplier,d.Payment()));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await AP(c,d.Supplier));
    }
    [Fact]
    public async Task Parallel_partial_payments_both_succeed_and_preserve_total_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var r=await Task.WhenAll(Pay(c,d.Supplier,d.Payment(11)),Pay(c,d.Supplier,d.Payment(11)));foreach(var item in r)await Expect(item,HttpStatusCode.Created);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(2,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Duplicate_bank_reference_is_unique_across_staff_and_suppliers()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);var reference=Code();var r=await Task.WhenAll(Pay(c,d.Supplier,d.Payment(reference:reference.ToUpperInvariant())),Pay(f,e.Supplier,e.Payment(reference:" "+reference.ToLowerInvariant()+" ")));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(22,await AP(c,d.Supplier)+await AP(c,e.Supplier));
    }
    [Fact]
    public async Task Same_key_concurrent_application_debits_advance_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);var key=Code();var reference=Code();var r=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Apply(c,AdvanceId(p),[new(d.Line,22)],key,reference)));var ids=new List<Guid>();foreach(var item in r)ids.Add(ApplicationId(await Expect(item,HttpStatusCode.Created)));Assert.Single(ids.Distinct());Assert.Equal(0,await Available(c,d.Supplier));Assert.Equal(0,await AP(c,d.Supplier));await Expect(await Apply(c,AdvanceId(p),[new(d.Line,11)],key,reference),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Different_bills_compete_for_one_advance_without_overspending()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);var p=await Prepay(c,d.Supplier);var r=await Task.WhenAll(Apply(c,AdvanceId(p),[new(d.Line,22)]),Apply(c,AdvanceId(p),[new(e.Line,22)]));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await Available(c,d.Supplier));Assert.Equal(22,await AP(c,d.Supplier));
    }
    [Fact]
    public async Task Payment_and_advance_application_racing_for_same_AP_cannot_double_clear()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);var r=await Task.WhenAll(Pay(c,d.Supplier,d.Payment()),Apply(c,AdvanceId(p),[new(d.Line,22)]));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(2,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Concurrent_multi_bill_allocations_with_opposite_input_order_complete_without_deadlock()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);var input=new SupplierPaymentInput(22,"BANK_TRANSFER",Code(),Allocations:[new(d.Line,11),new(e.Line,11)]);var r=await Task.WhenAll(Pay(c,d.Supplier,input),Pay(c,d.Supplier,input with{Reference=Code(),Allocations=input.Allocations!.Reverse().ToArray()}));foreach(var response in r)await Expect(response,HttpStatusCode.Created);Assert.Equal(0,await AP(c,d.Supplier));
    }
    [Theory]
    [InlineData("PROCUREMENT")]
    [InlineData("WAREHOUSE")]
    [InlineData("OFFICE")]
    [InlineData("SALES")]
    public async Task Nonfinancial_roles_cannot_pay_apply_or_read_settlements(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);var(sub,_)=await Staff(db,role);using var staff=api.Authenticated(sub);await Expect(await Pay(staff,d.Supplier,d.Payment()),HttpStatusCode.Forbidden);await Expect(await Apply(staff,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.Forbidden);foreach(var path in new[]{$"/supplier-payments/{PaymentId(p)}",$"/suppliers/{d.Supplier}/payments",$"/suppliers/{d.Supplier}/advances"})await Expect(await staff.GetAsync("/api/v1"+path),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_can_pay_without_warehouse_assignment_and_company_scope_remains_isolated()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);var p=await Expect(await Pay(f,d.Supplier,d.Payment()),HttpStatusCode.Created);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/supplier-payments/{PaymentId(p)}"),HttpStatusCode.NotFound);await Expect(await Pay(other,d.Supplier,d.Payment()),HttpStatusCode.NotFound);Assert.Equal(0,D((await Get(other,"/accounting/ap")).GetProperty("outstandingAmount")));
    }
    [Fact]
    public async Task Foreign_supplier_bill_and_advance_cannot_be_used_to_clear_another_supplier()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c);await Expect(await Pay(c,e.Supplier,d.Payment()),HttpStatusCode.NotFound);var p=await Prepay(c,e.Supplier);await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.NotFound);Assert.Equal(22,await AP(c,d.Supplier));Assert.Equal(22,await Available(c,e.Supplier));
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.001)]
    [InlineData(23)]
    public async Task Invalid_or_excess_allocations_do_not_mutate_balances(decimal amount)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);await Expect(await Pay(c,d.Supplier,d.Payment(amount)),amount==23?HttpStatusCode.Conflict:HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await AP(c,d.Supplier));
    }
    [Fact]
    public async Task Implicit_overpayment_missing_purpose_duplicate_lines_and_future_dates_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var i=d.Payment();foreach(var input in new[]{i with{Amount=23},i with{AdvanceAmount=1,Amount=23},i with{Allocations=[new(d.Line,11),new(d.Line,11)]},i with{PaidOn=d.Today.AddDays(1)},i with{Method="WIRE"},i with{Reference=" "},i with{PaidOn=DateOnly.MinValue}})await Expect(await Pay(c,d.Supplier,input),HttpStatusCode.UnprocessableEntity);await Expect(await Pay(c,d.Supplier,i with{PaidOn=d.Today.AddDays(-1)}),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await AP(c,d.Supplier));
    }
    [Theory]
    [InlineData("1000")]
    [InlineData("2000")]
    [InlineData("1300")]
    [InlineData("1410")]
    public async Task Invalid_original_or_bank_account_rolls_back_and_same_key_can_retry(string code)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Payment();var key=Code();await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));
        try{await Expect(await Pay(c,d.Supplier,input,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await AP(c,d.Supplier));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));}await Expect(await Pay(c,d.Supplier,input,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Inactive_prepaid_asset_blocks_application_without_losing_available_amount()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1500'",("company",db.Company));try{await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await Available(c,d.Supplier));Assert.Equal(22,await AP(c,d.Supplier));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='1500'",("company",db.Company));}
    }
    [Fact]
    public async Task Closed_period_blocks_payment_and_application_atomically()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Pay(c,d.Supplier,d.Payment()),HttpStatusCode.UnprocessableEntity);await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await AP(c,d.Supplier));Assert.Equal(22,await Available(c,d.Supplier));}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
    }
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Late_audit_failure_rolls_back_payment_or_application_AP_GST_and_sequence(bool application)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=application?await Prepay(c,d.Supplier):default;var key=Code();var reference=Code();var input=d.Payment(reference:reference);var kind=application?"SUPPLIER_ADVANCE_APPLICATION":"SUPPLIER_PAYMENT";var action=application?"purchase.supplier_advance_applied":"purchase.supplier_paid";
        var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@kind",("company",db.Company),("kind",kind));
        await S("CREATE FUNCTION public.fail_supplier_settlement() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected settlement failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_supplier_settlement BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_supplier_settlement()");
        try{await Expect(application?await Apply(c,AdvanceId(p),[new(d.Line,22)],key,reference):await Pay(c,d.Supplier,input,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await AP(c,d.Supplier));if(application)Assert.Equal(22,await Available(c,d.Supplier));var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(0,D(g.GetProperty("attributedTax")));Assert.Equal(2,D(g.GetProperty("pendingPaymentTax")));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@kind",("company",db.Company),("kind",kind)));}
        finally{await S("DROP TRIGGER test_supplier_settlement ON platform.audit_events;DROP FUNCTION public.fail_supplier_settlement()");}
        await Expect(application?await Apply(c,AdvanceId(p),[new(d.Line,22)],key,reference):await Pay(c,d.Supplier,input,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Prepayment_policy_is_frozen_and_tax_configuration_requires_controlled_transition()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Configure();var supplier=await Supplier(c);await Prepay(c,supplier);var error=await Assert.ThrowsAsync<BusinessException>(()=>CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,"NON_CASH",DatabaseFixture.Issuer,db.Subject));Assert.Equal("tax_transition_required",error.Code);
        var d=await SetupBill(c,supplier:supplier);var p=await Prepay(c,supplier);await Configure("NON_CASH");try{await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.UnprocessableEntity);}finally{await Configure();}
    }
    [Fact]
    public async Task App_cannot_directly_edit_settlements_and_SQL_command_still_checks_member_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Expect(await Pay(c,d.Supplier,d.Payment()),HttpStatusCode.Created);
        await using(var session=await db.SessionAsync()){var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"UPDATE accounting.supplier_payments SET amount=0 WHERE id=@id",default,("id",PaymentId(p))));Assert.Equal("42501",e.SqlState);}
        var immutable=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",PaymentId(p))));Assert.Equal("23514",immutable.SqlState);
        var(sub,_)=await Staff(db,"WAREHOUSE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,sub,default)).Single(x=>x.CompanyId==db.Company);await using var s=new CompanySession(source);await s.BeginAsync(db.Company,access.ActorId,"direct-payment",default);var denied=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"SELECT purchase.post_supplier_payment(@supplier,22,22,'BANK_TRANSFER','DIRECT',current_date,'Deposit','[]'::jsonb)",default,("supplier",d.Supplier)));Assert.Equal("42501",denied.SqlState);
    }
    [Fact]
    public async Task Missing_idempotency_key_is_rejected_without_payment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/suppliers/{d.Supplier}/payments"){Content=System.Net.Http.Json.JsonContent.Create(d.Payment())};await Expect(await c.SendAsync(request),HttpStatusCode.BadRequest);Assert.Equal(22,await AP(c,d.Supplier));
    }

    [Fact]
    public async Task Duplicate_application_reference_cannot_apply_twice_with_different_keys()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier,44);var reference=Code();await Expect(await Apply(c,AdvanceId(p),[new(d.Line,11)],reference:reference.ToUpperInvariant()),HttpStatusCode.Created);
        await Expect(await Apply(c,AdvanceId(p),[new(d.Line,11)],reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);Assert.Equal(11,await AP(c,d.Supplier));Assert.Equal(33,await Available(c,d.Supplier));
    }
    [Fact]
    public async Task Closed_old_payment_period_does_not_rewrite_GST_date_or_block_current_period_application()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var old=new DateOnly(d.Today.Year,d.Today.Month,1).AddDays(-1);var days=old.DayNumber-d.Today.DayNumber;
        // Use a second invoice whose original evidence was held in the payment period.
        var e=await SetupBill(c,supplier:d.Supplier,invoiceDays:days,heldDays:days);var p=await Prepay(c,d.Supplier,22,old);
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",old));
        try{var app=await Expect(await Apply(c,AdvanceId(p),[new(e.Line,22)]),HttpStatusCode.Created);Assert.Equal(d.Today.ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture),app.GetProperty("application").GetProperty("businessDate").GetString());
            var rows=(await Get(c,$"/accounting/purchase-gst-attributions?supplierId={d.Supplier}&from={old:yyyy-MM-dd}&to={old:yyyy-MM-dd}")).GetProperty("items");Assert.Equal(2,D(rows[0].GetProperty("gstAmount")));Assert.Equal(old.ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture),rows[0].GetProperty("attributionDate").GetString());}
        finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",old));}
    }
    [Fact]
    public async Task Remapped_AP_advance_and_input_accounts_do_not_change_original_settlement_sources()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);
        await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'2010','Replacement AP','LIABILITY','AP'),(@company,'1510','Replacement advance','ASSET',NULL),(@company,'1310','Replacement input','ASSET','GST'); UPDATE accounting.account_mappings m SET account_id=a.id FROM accounting.accounts a WHERE m.company_id=@company AND a.company_id=m.company_id AND ((m.purpose='AP' AND a.code='2010') OR (m.purpose='SUPPLIER_ADVANCES' AND a.code='1510')); UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1310') WHERE company_id=@company",("company",db.Company));
        try{var app=await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.Created);var id=ApplicationId(app);Assert.Equal(22,await Journal(id,"2000","debit"));Assert.Equal(22,await Journal(id,"1500","credit"));Assert.Equal(2,await Journal(id,"1300","debit"));Assert.Equal(0,await Journal(id,"2010","debit"));}
        finally{await S("UPDATE accounting.account_mappings m SET account_id=a.id FROM accounting.accounts a WHERE m.company_id=@company AND a.company_id=m.company_id AND ((m.purpose='AP' AND a.code='2000') OR (m.purpose='SUPPLIER_ADVANCES' AND a.code='1500')); UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1300') WHERE company_id=@company",("company",db.Company));}
    }
    [Fact]
    public async Task Incorrect_control_account_cannot_be_used_as_supplier_prepaid_asset()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Configure();var supplier=await Supplier(c);
        await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1100') WHERE company_id=@company AND purpose='SUPPLIER_ADVANCES'",("company",db.Company));
        try{await Expect(await Pay(c,supplier,new(22,"BANK_TRANSFER",Code(),22,Notes:"Deposit")),HttpStatusCode.UnprocessableEntity);Assert.Equal(0,await Available(c,supplier));}
        finally{await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1500') WHERE company_id=@company AND purpose='SUPPLIER_ADVANCES'",("company",db.Company));}
    }
    [Fact]
    public async Task Inactive_supplier_and_foreign_company_advance_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var p=await Prepay(c,d.Supplier);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Apply(other,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.NotFound);
        await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));
        try{await Expect(await Pay(c,d.Supplier,d.Payment()),HttpStatusCode.NotFound);await Expect(await Apply(c,AdvanceId(p),[new(d.Line,22)]),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await Available(c,d.Supplier));}
        finally{await S("UPDATE crm.suppliers SET status='ACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));}
    }
    [Fact]
    public async Task Zero_AP_bill_cannot_be_paid_and_no_unallocated_tax_is_claimed()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,cost:0);await Expect(await Pay(c,d.Supplier,d.Payment(1)),HttpStatusCode.Conflict);var p=await Prepay(c,d.Supplier,10);Assert.Equal(0,await AP(c,d.Supplier));Assert.Equal(10,await Available(c,d.Supplier));Assert.Equal(0,await Journal(PaymentId(p),"1300","debit"));
    }
}
