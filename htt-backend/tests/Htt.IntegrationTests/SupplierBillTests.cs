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

public sealed class SupplierBillTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,SalesData Sales,Guid ReceiptLine,Guid Receipt,decimal Quantity,decimal Net,decimal Tax,DateOnly Today)
    {
        public SupplierBillInput Bill(string? invoice=null)=>new(Supplier,invoice??Code(),Today,Today.AddDays(30),Today,[new(ReceiptLine,Quantity,Net,Tax)],"verified-document-ref",Today);
    }
    private async Task<Data> SetupBill(HttpClient c,bool registered=true,string basis="NON_CASH",decimal qty=2,decimal cost=10,bool? recoverable=null,string itemType="STOCK",Guid? supplier=null)
    {
        await S("UPDATE core.companies SET gst_registered=@registered,gst_basis=@basis WHERE id=@company",("company",db.Company),("registered",registered),("basis",basis));
        var d=await Setup(db,c,0);var sid=supplier??await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier bill test",null));
        if(itemType!="STOCK")
        {
            var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Bought service",p.GetProperty("taxCodeId").GetGuid(),ItemType:itemType,WholePacks:false),1),HttpStatusCode.OK);
        }
        var draft=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(sid,d.Warehouse,[new(d.BoxUnit,qty,cost,RecoverableGst:recoverable)])),HttpStatusCode.Created);
        var id=draft.GetProperty("order").GetProperty("id").GetGuid();var po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{id}/confirm",version:1),HttpStatusCode.OK);
        var r=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{id}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty)]),po.GetProperty("order").GetProperty("version").GetInt64()),HttpStatusCode.Created);
        return new(sid,d,r.GetProperty("lines")[0].GetProperty("id").GetGuid(),r.GetProperty("receipt").GetProperty("id").GetGuid(),qty,D(r.GetProperty("receipt").GetProperty("net")),D(r.GetProperty("receipt").GetProperty("tax")),DateOnly.Parse(r.GetProperty("receipt").GetProperty("businessDate").GetString()!,System.Globalization.CultureInfo.InvariantCulture));
    }
    private static Task<HttpResponseMessage> Post(HttpClient c,SupplierBillInput input,string? key=null)=>Send(c,HttpMethod.Post,"/supplier-bills",input,key:key);
    private static Guid Id(JsonElement b)=>b.GetProperty("bill").GetProperty("id").GetGuid();
    private async Task<decimal> Journal(Guid bill,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(jl.{side}),0) FROM purchase.bills b JOIN accounting.journal_lines jl ON jl.company_id=b.company_id AND jl.journal_entry_id=b.journal_entry_id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE b.company_id=@company AND b.id=@bill AND a.code=@code",("company",db.Company),("bill",bill),("code",code)));
    private async Task<decimal> Outstanding(HttpClient c,Data d)=>D((await Get(c,$"/accounting/grni?supplierId={d.Supplier}")).GetProperty("accruedAmount"));
    [Fact]
    public async Task Matched_invoice_clears_GRNI_posts_AP_and_input_GST_without_changing_inventory()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);var id=Id(b);
        Assert.StartsWith("SB-",b.GetProperty("bill").GetProperty("number").GetString());Assert.Equal("POSTED",b.GetProperty("bill").GetProperty("state").GetString());Assert.Equal(2,b.GetProperty("bill").GetProperty("version").GetInt64());
        Assert.Equal(20,await Journal(id,"2100","debit"));Assert.Equal(2,await Journal(id,"1300","debit"));Assert.Equal(22,await Journal(id,"2000","credit"));Assert.Equal(0,await Journal(id,"1200","debit"));Assert.Equal(0,await Outstanding(c,d));
        var ap=await Get(c,$"/accounting/ap?supplierId={d.Supplier}");Assert.Equal(22,D(ap.GetProperty("outstandingAmount")));var gst=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(2,D(gst.GetProperty("attributedTax")));Assert.Equal(0,D(gst.GetProperty("pendingPaymentTax")));
        Assert.Equal(20m,await S("SELECT value FROM inventory.stock_values v JOIN inventory.stock_balances b ON b.company_id=v.company_id AND b.id=v.stock_balance_id WHERE b.company_id=@company AND b.product_id=@product",("company",db.Company),("product",d.Sales.Product)));
        Assert.Equal(0,(await Get(c,$"/accounting/grni/unmatched?supplierId={d.Supplier}")).GetProperty("items").GetArrayLength());Assert.Equal(id,Id(await Get(c,$"/supplier-bills/{id}")));
    }
    [Fact]
    public async Task Cash_basis_defers_input_GST_until_supplier_payment_and_preserves_mapping()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis:"CASH");var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);Assert.Equal(2,await Journal(Id(b),"1410","debit"));Assert.Equal(0,await Journal(Id(b),"1300","debit"));
        var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from=2090-01-01&to=2090-02-01");Assert.Equal(0,D(g.GetProperty("attributedTax")));Assert.Equal(2,D(g.GetProperty("pendingPaymentTax")));Assert.Equal(JsonValueKind.Null,g.GetProperty("items")[0].GetProperty("attributionDate").ValueKind);Assert.NotEqual(JsonValueKind.Null,g.GetProperty("items")[0].GetProperty("inputAccountId").ValueKind);
    }
    [Theory]
    [InlineData(false,null,22)]
    [InlineData(true,false,22)]
    public async Task Nonrecoverable_tax_is_already_in_GRNI_and_is_not_claimed_twice(bool registered,bool? recoverable,decimal expected)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,registered,recoverable:recoverable);var b=await Expect(await Post(c,d.Bill() with {TaxInvoiceReference=null,TaxInvoiceHeldOn=null}),HttpStatusCode.Created);
        Assert.Equal(expected,await Journal(Id(b),"2100","debit"));Assert.Equal(expected,await Journal(Id(b),"2000","credit"));Assert.Equal(0,await Journal(Id(b),"1300","debit"));Assert.Equal(0,await Outstanding(c,d));
    }
    [Fact]
    public async Task Partial_matches_allocate_cumulative_rounding_and_clear_the_final_cent()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,qty:3,cost:0.05m);var taxParts=new[]{0.01m,0m,0.01m};
        for(int k=0;k<3;k++){var input=d.Bill() with{Lines=[new(d.ReceiptLine,1,0.05m,taxParts[k])]};await Expect(await Post(c,input),HttpStatusCode.Created);Assert.Equal(0.15m-(k+1)*0.05m,await Outstanding(c,d));}
        Assert.Equal(0.17m,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));Assert.Equal(0.02m,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));
    }
    [Theory]
    [InlineData("NON_STOCK")]
    [InlineData("SERVICE")]
    public async Task Accepted_expenses_use_the_same_match_without_duplicate_expense(string itemType)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,itemType:itemType);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);Assert.Equal(0,await Journal(Id(b),"5100","debit"));Assert.Equal(20,await Journal(Id(b),"2100","debit"));Assert.Equal(0,await Outstanding(c,d));
    }
    [Fact]
    public async Task Zero_value_receipt_still_has_unique_match_AP_and_tax_trace_without_empty_journal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,cost:0);var b=await Expect(await Post(c,d.Bill() with{TaxInvoiceReference=null,TaxInvoiceHeldOn=null}),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,b.GetProperty("bill").GetProperty("journalEntryId").ValueKind);Assert.Equal(1,b.GetProperty("lines").GetArrayLength());await Expect(await Post(c,d.Bill()),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task One_bill_can_match_multiple_receipts_and_orders_of_one_supplier()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);var b=await Expect(await Post(c,d.Bill() with{Lines=[new(d.ReceiptLine,2,20,2),new(e.ReceiptLine,2,20,2)]}),HttpStatusCode.Created);Assert.Equal(2,b.GetProperty("lines").GetArrayLength());Assert.Equal(44,await Journal(Id(b),"2000","credit"));Assert.Equal(0,await Outstanding(c,d));
    }
    [Fact]
    public async Task Concurrent_same_key_returns_one_identical_bill_and_one_audit_event()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Bill();var key=Code();var all=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Post(c,input,key)));var bodies=new List<string>();Guid id=default;
        foreach(var r in all){var b=await Expect(r,HttpStatusCode.Created);bodies.Add(b.GetRawText());id=Id(b);}Assert.All(bodies,b=>Assert.True(System.Text.Json.Nodes.JsonNode.DeepEquals(System.Text.Json.Nodes.JsonNode.Parse(bodies[0]),System.Text.Json.Nodes.JsonNode.Parse(b))));Assert.Equal(0,await Outstanding(c,d));Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action='purchase.bill_posted'",("company",db.Company),("id",id)));
        await Expect(await Post(c,input with{Notes="different payload"},key),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Different_keys_competing_for_same_receipt_cannot_double_AP_or_overmatch()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var all=await Task.WhenAll(Post(c,d.Bill()),Post(c,d.Bill()));Assert.Single(all,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(all,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal(22,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));
    }
    [Fact]
    public async Task Concurrent_disjoint_partial_matches_both_succeed_and_close_exactly()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Bill() with{Lines=[new(d.ReceiptLine,1,10,1)]};var results=await Task.WhenAll(Post(c,input),Post(c,input with{SupplierInvoice=Code()}));foreach(var r in results)await Expect(r,HttpStatusCode.Created);Assert.Equal(0,await Outstanding(c,d));
    }
    [Fact]
    public async Task Opposite_input_order_for_two_shared_receipts_has_no_deadlock_or_overmatch()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);var input=d.Bill() with{Lines=[new(d.ReceiptLine,1,10,1),new(e.ReceiptLine,1,10,1)]};var r=await Task.WhenAll(Post(c,input),Post(c,input with{SupplierInvoice=Code(),Lines=input.Lines!.Reverse().ToArray()}));foreach(var response in r)await Expect(response,HttpStatusCode.Created);Assert.Equal(0,await Outstanding(c,d));
    }
    [Fact]
    public async Task Supplier_invoice_number_is_unique_case_insensitive_across_actors_and_receipts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c,supplier:d.Supplier);var (sub,_)=await Staff(db,"FINANCE");using var finance=api.Authenticated(sub);var no=Code();var r=await Task.WhenAll(Post(c,d.Bill(no.ToUpperInvariant())),Post(finance,e.Bill(" "+no.ToLowerInvariant()+" ")));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(20,await Outstanding(c,d));
    }
    [Theory]
    [InlineData("PROCUREMENT")]
    [InlineData("WAREHOUSE")]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    public async Task Non_financial_roles_cannot_post_or_read_bills_AP_or_GST(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);var (sub,_)=await Staff(db,role);using var staff=api.Authenticated(sub);
        await Expect(await Post(staff,d.Bill()),HttpStatusCode.Forbidden);foreach(var path in new[]{"/supplier-bills",$"/supplier-bills/{Id(b)}","/accounting/ap","/accounting/purchase-gst"})await Expect(await staff.GetAsync("/api/v1"+path),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_posts_and_reads_without_physical_warehouse_scope()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var (sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);await Expect(await Post(f,d.Bill()),HttpStatusCode.Created);Assert.Single((await Get(f,$"/supplier-bills?supplierId={d.Supplier}")).GetProperty("items").EnumerateArray());await Expect(await f.GetAsync($"/api/v1/purchase-receipts/{d.Receipt}"),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Foreign_company_and_wrong_supplier_sources_are_rejected_without_matches()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var e=await SetupBill(c);await Expect(await Post(c,d.Bill() with{Lines=e.Bill().Lines}),HttpStatusCode.NotFound);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Post(other,d.Bill()),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);await Expect(await other.GetAsync($"/api/v1/supplier-bills/{Id(b)}"),HttpStatusCode.NotFound);Assert.Equal(0,(await Get(other,"/supplier-bills")).GetProperty("items").GetArrayLength());
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    [InlineData(0.0000001)]
    [InlineData(3)]
    public async Task Invalid_or_excess_quantity_never_mutates_GRNI(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);await Expect(await Post(c,d.Bill() with{Lines=[new(d.ReceiptLine,qty,20,2)]}),qty==3?HttpStatusCode.Conflict:HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));
    }
    [Fact]
    public async Task Net_tax_variance_missing_evidence_duplicate_lines_and_bad_dates_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var i=d.Bill();var bad=new[]{i with{Lines=[new(d.ReceiptLine,2,19,2)]},i with{Lines=[new(d.ReceiptLine,2,20,1)]},i with{TaxInvoiceReference=null,TaxInvoiceHeldOn=null},i with{TaxInvoiceHeldOn=null},i with{Lines=[i.Lines![0],i.Lines[0]]},i with{Lines=[]},i with{InvoiceDate=i.PostingDate.AddDays(1)},i with{DueOn=i.InvoiceDate.AddDays(-1)},i with{PostingDate=i.PostingDate.AddDays(1)},i with{SupplierInvoice=" "},i with{InvoiceDate=default},i with{Lines=[new(d.ReceiptLine,2,null,2)]}};
        foreach(var input in bad)await Expect(await Post(c,input),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));
    }
    [Fact]
    public async Task Disabled_AP_mapping_rolls_back_and_same_key_is_retryable_after_repair()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var i=d.Bill();var key=Code();await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='2000'",("company",db.Company));try{await Expect(await Post(c,i,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='2000'",("company",db.Company));}await Expect(await Post(c,i,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Closed_posting_period_rejects_bill_without_creating_AP()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Post(c,d.Bill()),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
    }
    [Fact]
    public async Task Late_audit_failure_rolls_back_bill_matches_AP_GST_journal_and_sequence()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var i=d.Bill();var key=Code();var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company));
        await S("CREATE FUNCTION public.bill_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='purchase.bill_posted' AND NEW.company_id='"+db.Company+"'::uuid THEN RAISE EXCEPTION 'injected' USING ERRCODE='23514'; END IF;RETURN NEW;END $$; CREATE TRIGGER test_bill_audit BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.bill_audit_failure()");
        try{await Expect(await Post(c,i,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));Assert.Equal(0,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM purchase.bills WHERE company_id=@company AND supplier_id=@supplier",("company",db.Company),("supplier",d.Supplier)));}
        finally{await S("DROP TRIGGER test_bill_audit ON platform.audit_events;DROP FUNCTION public.bill_audit_failure()");}await Expect(await Post(c,i,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Direct_writes_and_mutation_of_posted_bill_are_blocked()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);
        await using(var s=await db.SessionAsync()){var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE purchase.bills SET notes='tampered' WHERE id=@id",default,("id",Id(b))));Assert.Equal("42501",e.SqlState);}
        var immutable=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",Id(b))));Assert.Equal("23514",immutable.SqlState);
        var transition=await Assert.ThrowsAsync<BusinessException>(()=>CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,"CASH",DatabaseFixture.Issuer,db.Subject));Assert.Equal("tax_transition_required",transition.Code);
    }
    [Fact]
    public async Task No_idempotency_key_is_rejected_before_financial_effect()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);using var request=new HttpRequestMessage(HttpMethod.Post,"/api/v1/supplier-bills"){Content=System.Net.Http.Json.JsonContent.Create(d.Bill())};await Expect(await c.SendAsync(request),HttpStatusCode.BadRequest);Assert.Equal(20,await Outstanding(c,d));
    }

    [Theory]
    [InlineData("1300","NON_CASH")]
    [InlineData("1410","CASH")]
    [InlineData("2100","NON_CASH")]
    public async Task Disabled_tax_or_original_GRNI_account_fails_atomically(string code,string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis:basis);
        await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));
        try{await Expect(await Post(c,d.Bill()),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,await Outstanding(c,d));}
        finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));}
        await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Supplier_inactivation_or_registration_change_rejects_bill_and_retry_succeeds()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Bill();var key=Code();
        await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));
        try{await Expect(await Post(c,input,key),HttpStatusCode.UnprocessableEntity);}finally{await S("UPDATE crm.suppliers SET status='ACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));}
        await S("UPDATE core.companies SET gst_registered=false WHERE id=@company",("company",db.Company));
        try{await Expect(await Post(c,input,key),HttpStatusCode.UnprocessableEntity);}finally{await S("UPDATE core.companies SET gst_registered=true WHERE id=@company",("company",db.Company));}
        Assert.Equal(20,await Outstanding(c,d));await Expect(await Post(c,input,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Noncash_GST_uses_invoice_evidence_date_and_date_filtered_reports_do_not_claim_twice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Bill() with{InvoiceDate=d.Today.AddDays(-3),TaxInvoiceHeldOn=d.Today.AddDays(-1)};
        await Expect(await Post(c,input),HttpStatusCode.Created);
        var old=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from={d.Today.AddDays(-1):yyyy-MM-dd}&to={d.Today.AddDays(-1):yyyy-MM-dd}");Assert.Equal(2,D(old.GetProperty("attributedTax")));
        var now=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from={d.Today:yyyy-MM-dd}");Assert.Equal(0,D(now.GetProperty("attributedTax")));Assert.Equal(0,now.GetProperty("items").GetArrayLength());
    }
    [Fact]
    public async Task Direct_SQL_command_checks_member_permission_even_with_valid_source_data()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var (sub,_)=await Staff(db,"WAREHOUSE");
        await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,sub,default)).Single(x=>x.CompanyId==db.Company);
        await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"direct-bill-test",default);
        var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT purchase.post_bill(@supplier,'DIRECT',current_date,current_date,current_date,NULL,NULL,'','[]'::jsonb)",default,("supplier",d.Supplier)));Assert.Equal("42501",e.SqlState);
    }
    [Fact]
    public async Task Partial_match_exposes_remaining_GRNI_quantity_and_amount_and_unrelated_supplier_can_reuse_number()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c);var input=d.Bill() with{Lines=[new(d.ReceiptLine,1,10,1)]};await Expect(await Post(c,input),HttpStatusCode.Created);
        var row=(await Get(c,$"/accounting/grni/unmatched?supplierId={d.Supplier}")).GetProperty("items")[0];Assert.Equal(1,D(row.GetProperty("unmatchedQuantity")));Assert.Equal(10,D(row.GetProperty("unmatchedNet")));Assert.Equal(1,D(row.GetProperty("unmatchedTax")));Assert.Equal(10,D(row.GetProperty("outstandingGrni")));
        var e=await SetupBill(c);await Expect(await Post(c,e.Bill(input.SupplierInvoice)),HttpStatusCode.Created);Assert.Equal(10,await Outstanding(c,d));
    }
}
