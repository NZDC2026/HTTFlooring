using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class ReceiptTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private async Task<(SalesData Data,Guid Order,Guid Line)> Order(HttpClient c,string basis="CASH",decimal price=22,decimal quantity=2,string? taxCode=null)
    {
        // Fixture companies host independent test customers with both tax bases; owner setup changes the test-only default.
        await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));
        var d=await Setup(db,c,0);var p=await Get(c,$"/products/{d.Product}");var tax=p.GetProperty("taxCodeId").GetGuid();
        if(taxCode is not null)tax=(await Get(c,"/foundation")).GetProperty("taxCodes").EnumerateArray().Single(t=>t.GetProperty("code").GetString()==taxCode).GetProperty("id").GetGuid();
        await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Installation",tax,ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var q=await Submitted(c,d.Draft(quantity) with{Lines=[new(d.BoxUnit,Quantity:quantity,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        return(d,o,(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static async Task<JsonElement> Bill(HttpClient c,Guid order,Guid line,decimal quantity=2)
    {
        var v=(await Get(c,$"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64();
        return await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/invoices",new InvoiceInput([new(line,quantity)],"Work completed"),v),HttpStatusCode.Created);
    }
    private static Guid InvoiceLine(JsonElement invoice)=>invoice.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Receipt(HttpClient c,Guid customer,decimal amount,Guid? invoice=null,Guid? orderLine=null,string? key=null,string? reference=null,DateOnly? date=null)=>
        Send(c,HttpMethod.Post,$"/customers/{customer}/receipts",new CustomerReceiptInput(amount,"BANK_TRANSFER",reference??Code(),invoice is {} i?[new(i,amount)]:[],orderLine is {} l?[new(l,amount)]:[],date),key:key);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Guid advance,Guid invoiceLine,decimal amount,string? key=null,string? reference=null)=>
        Send(c,HttpMethod.Post,$"/customer-advances/{advance}/apply",new AdvanceApplicationInput(reference??Code(),[new(invoiceLine,amount)]),key:key);
    private static Guid Advance(JsonElement receipt)=>receipt.GetProperty("advances")[0].GetProperty("id").GetGuid();
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private async Task<(decimal Ar,decimal Advances,decimal Exposure)> Credit(HttpClient c,Guid customer)
    {
        var x=await Get(c,$"/customers/{customer}/credit");return(D(x.GetProperty("receivable")),D(x.GetProperty("availableAdvances")),D(x.GetProperty("exposure")));
    }
    private Task<object?> Tax(Guid customer)=>S("""
        SELECT coalesce(sum(g.gst_amount),0) FROM accounting.gst_attributions g LEFT JOIN accounting.customer_receipts r ON r.company_id=g.company_id AND r.id=g.receipt_id
        LEFT JOIN sales.invoice_lines il ON il.company_id=g.company_id AND il.id=g.invoice_line_id LEFT JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id
        WHERE g.company_id=@company AND coalesce(r.customer_id,i.customer_id)=@customer
        """,("company",db.Company),("customer",customer));
    private Task<object?> GL(string code)=>S("SELECT coalesce(sum(l.credit-l.debit),0) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND a.code=@code",("company",db.Company),("code",code));
    [Fact]
    public async Task Cash_receipts_reduce_AR_release_credit_and_attribute_only_paid_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var il=InvoiceLine(i);
        Assert.Equal(0m,await Tax(d.Customer));var r=await Expect(await Receipt(c,d.Customer,12.1m,il),HttpStatusCode.Created);
        Assert.Equal((36.3m,0m,36.3m),await Credit(c,d.Customer));Assert.Equal(1.1m,await Tax(d.Customer));Assert.Equal("POSTED",r.GetProperty("state").GetString());
        await Expect(await Receipt(c,d.Customer,36.3m,il),HttpStatusCode.Created);Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));Assert.Equal(4.4m,await Tax(d.Customer));
        var ar=(await Get(c,$"/customers/{d.Customer}/receivables")).GetProperty("items")[0];Assert.Equal(48.4m,D(ar.GetProperty("paid")));Assert.Equal(0m,D(ar.GetProperty("outstanding")));
        await Expect(await Receipt(c,d.Customer,0.01m,il),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("CASH",2.2)]
    [InlineData("NON_CASH",4.4)]
    public async Task Advances_attribute_at_receipt_and_apply_without_duplicate_tax_or_credit_release(string basis,decimal expectedTax)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,basis);
        var beforeGst=(decimal)(await GL("2200"))!;var beforeClearing=(decimal)(await GL("1400"))!;
        var r=await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created);var ad=Advance(r);
        Assert.Equal(expectedTax,await Tax(d.Customer));Assert.Equal((0m,24.2m,24.2m),await Credit(c,d.Customer));
        var i=await Bill(c,o,l);Assert.Equal((48.4m,24.2m,24.2m),await Credit(c,d.Customer));
        await Expect(await Apply(c,ad,InvoiceLine(i),24.2m),HttpStatusCode.Created);Assert.Equal((24.2m,0m,24.2m),await Credit(c,d.Customer));Assert.Equal(expectedTax,await Tax(d.Customer));
        await Expect(await Receipt(c,d.Customer,24.2m,InvoiceLine(i)),HttpStatusCode.Created);Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));Assert.Equal(4.4m,await Tax(d.Customer));
        Assert.Equal(beforeGst+4.4m,await GL("2200"));Assert.Equal(beforeClearing,await GL("1400"));
        Assert.Equal(0m,D((await Get(c,$"/customers/{d.Customer}/advances")).GetProperty("items")[0].GetProperty("available")));
    }
    [Fact]
    public async Task Non_cash_first_partial_advance_attributes_whole_uninvoiced_supply_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,"NON_CASH");
        await Expect(await Receipt(c,d.Customer,1,orderLine:l),HttpStatusCode.Created);Assert.Equal(4.4m,await Tax(d.Customer));
        await Expect(await Receipt(c,d.Customer,1,orderLine:l),HttpStatusCode.Created);Assert.Equal(4.4m,await Tax(d.Customer));
        await Bill(c,o,l,1);Assert.Equal(4.4m,await Tax(d.Customer));await Bill(c,o,l,1);Assert.Equal(4.4m,await Tax(d.Customer));
    }
    [Fact]
    public async Task Partial_advances_and_partial_invoices_preserve_cent_rounding_and_GST_date()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,price:0.05m,quantity:3);
        var date=DateOnly.Parse((string)(await S("SELECT to_char(now() AT TIME ZONE timezone,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!);
        var r=await Expect(await Receipt(c,d.Customer,0.03m,orderLine:l,date:date),HttpStatusCode.Created);Assert.Equal(0m,await Tax(d.Customer));
        var i=await Bill(c,o,l,1);var app=await Expect(await Apply(c,Advance(r),InvoiceLine(i),0.03m),HttpStatusCode.Created);Assert.Equal(0.01m,await Tax(d.Customer));
        Assert.Equal(date,await S("SELECT attribution_date FROM accounting.gst_attributions WHERE company_id=@company AND source_document_id=@id AND kind='ADVANCE_APPLIED'",("company",db.Company),("id",app.GetProperty("id").GetGuid())));
        Assert.Equal(1L,await S("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@id AND posting_kind='CASH_GST_ROUNDING'",("company",db.Company),("id",app.GetProperty("id").GetGuid())));
        await Expect(await Receipt(c,d.Customer,0.03m,InvoiceLine(i)),HttpStatusCode.Created);
        var second=await Bill(c,o,l,2);await Expect(await Receipt(c,d.Customer,D(second.GetProperty("gross")),InvoiceLine(second)),HttpStatusCode.Created);Assert.Equal(0.02m,await Tax(d.Customer));
    }
    [Fact]
    public async Task Concurrent_same_key_receipts_have_one_financial_effect()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var key=Code();var reference=Code();
        var results=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference)));
        var rows=await Task.WhenAll(results.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Single(rows.Select(r=>r.GetProperty("id").GetGuid()).Distinct());Assert.Equal((24.2m,0m,24.2m),await Credit(c,d.Customer));Assert.Equal(2.2m,await Tax(d.Customer));
        await Expect(await Receipt(c,d.Customer,12.1m,InvoiceLine(i),key:key,reference:reference),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task External_reference_prevents_duplicate_bank_receipt_across_keys_and_staff()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var reference=Code();
        var results=await Task.WhenAll(Receipt(c,d.Customer,12.1m,InvoiceLine(i),reference:reference),Receipt(f,d.Customer,12.1m,InvoiceLine(i),reference:reference.ToLowerInvariant()));
        Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal((36.3m,0m,36.3m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Concurrent_receipts_cannot_overpay_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);
        var results=await Task.WhenAll(Receipt(c,d.Customer,48.4m,InvoiceLine(i)),Receipt(c,d.Customer,48.4m,InvoiceLine(i)));
        Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));Assert.Equal(4.4m,await Tax(d.Customer));
    }
    [Fact]
    public async Task Concurrent_advance_applications_cannot_spend_same_balance_twice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var ad=Advance(await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created));var i=await Bill(c,o,l);
        var results=await Task.WhenAll(Apply(c,ad,InvoiceLine(i),24.2m),Apply(c,ad,InvoiceLine(i),24.2m));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);
        Assert.Equal((24.2m,0m,24.2m),await Credit(c,d.Customer));Assert.Equal(2.2m,await Tax(d.Customer));
    }
    [Fact]
    public async Task Same_key_advance_application_replays_exactly_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var ad=Advance(await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created));var i=await Bill(c,o,l);var key=Code();var reference=Code();
        var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Apply(c,ad,InvoiceLine(i),12.1m,key,reference)));var rows=await Task.WhenAll(results.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Single(rows.Select(r=>r.GetProperty("id").GetGuid()).Distinct());
        Assert.Equal((36.3m,12.1m,24.2m),await Credit(c,d.Customer));await Expect(await Apply(c,ad,InvoiceLine(i),24.2m,key,reference),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Receipt_and_advance_application_racing_for_last_invoice_balance_have_one_winner()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var ad=Advance(await Expect(await Receipt(c,d.Customer,48.4m,orderLine:l),HttpStatusCode.Created));var i=await Bill(c,o,l);
        var results=await Task.WhenAll(Receipt(c,d.Customer,48.4m,InvoiceLine(i)),Apply(c,ad,InvoiceLine(i),48.4m));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);
        Assert.Equal(0m,(await Credit(c,d.Customer)).Ar);
    }
    [Fact]
    public async Task Partial_receipts_on_different_invoices_of_same_customer_do_not_lose_AR_updates()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var a=await Bill(c,o,l,1);var b=await Bill(c,o,l,1);
        var results=await Task.WhenAll(Receipt(c,d.Customer,24.2m,InvoiceLine(a)),Receipt(c,d.Customer,24.2m,InvoiceLine(b)));await Task.WhenAll(results.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Mixed_receipt_allocates_existing_invoice_and_prepays_remaining_order_amount()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var a=await Bill(c,o,l,1);
        var r=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(36.3m,"CARD",Code(),[new(InvoiceLine(a),12.1m)],[new(l,24.2m)])),HttpStatusCode.Created);
        Assert.Equal((12.1m,24.2m,12.1m),await Credit(c,d.Customer));Assert.Equal(3.3m,await Tax(d.Customer));Assert.Equal(24.2m,D(r.GetProperty("advanceAmount")));
    }
    [Fact]
    public async Task Prepaid_order_cannot_be_cancelled_and_advance_cannot_exceed_uninvoiced_contract()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);
        await Expect(await Receipt(c,d.Customer,49,orderLine:l),HttpStatusCode.Conflict);await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created);
        await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/cancel",new ReviewInput("Prepaid"),1),HttpStatusCode.Conflict);
        await Expect(await Receipt(c,d.Customer,24.21m,orderLine:l),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Concurrent_advance_and_order_cancellation_cannot_both_commit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);
        var results=await Task.WhenAll(Receipt(c,d.Customer,24.2m,orderLine:l),Send(c,HttpMethod.Post,$"/sales-orders/{o}/cancel",new ReviewInput("Cancel race"),1));
        Assert.Equal(1,results.Count(r=>r.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK));
    }
    [Fact]
    public async Task Receipt_can_be_posted_to_frozen_customer_and_releases_real_credit_capacity()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);
        await S("UPDATE crm.customers SET status='ON_HOLD',credit_limit=1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Customer));
        await Expect(await Receipt(c,d.Customer,48.4m,InvoiceLine(i)),HttpStatusCode.Created);Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));
    }
    [Theory]
    [InlineData("FRE")]
    [InlineData("N-T")]
    public async Task Zero_tax_receipts_and_advances_do_not_create_GST(string code)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,taxCode:code);var ad=Advance(await Expect(await Receipt(c,d.Customer,22,orderLine:l),HttpStatusCode.Created));var i=await Bill(c,o,l);
        await Expect(await Apply(c,ad,InvoiceLine(i),22),HttpStatusCode.Created);await Expect(await Receipt(c,d.Customer,22,InvoiceLine(i)),HttpStatusCode.Created);Assert.Equal(0m,await Tax(d.Customer));Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Closed_period_and_bad_bank_mapping_fail_without_recording_money()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var key=Code();var reference=Code();
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));
        try{await Expect(await Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference),HttpStatusCode.UnprocessableEntity);}
        finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
        await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1000'",("company",db.Company));
        try{await Expect(await Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal((48.4m,0m,48.4m),await Credit(c,d.Customer));}
        finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='1000'",("company",db.Company));}
        await Expect(await Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference),HttpStatusCode.Created);
    }
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Late_failure_rolls_back_settlement_projection_GL_GST_and_key(bool application)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);Guid ad=Guid.Empty;
        if(application)ad=Advance(await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created));var i=await Bill(c,o,l);var before=await Credit(c,d.Customer);var tax=await Tax(d.Customer);var key=Code();var reference=Code();
        await S("""
            CREATE FUNCTION accounting.test_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action IN ('accounting.customer_received','accounting.advance_applied') THEN RAISE EXCEPTION 'injected failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
            CREATE TRIGGER test_fail_receipt BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION accounting.test_fail_receipt()
            """);
        try{var r=application?await Apply(c,ad,InvoiceLine(i),24.2m,key,reference):await Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference);await Expect(r,HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Credit(c,d.Customer));Assert.Equal(tax,await Tax(d.Customer));}
        finally{await S("DROP TRIGGER test_fail_receipt ON platform.audit_events;DROP FUNCTION accounting.test_fail_receipt()");}
        var success=application?await Apply(c,ad,InvoiceLine(i),24.2m,key,reference):await Receipt(c,d.Customer,24.2m,InvoiceLine(i),key:key,reference:reference);await Expect(success,HttpStatusCode.Created);
    }
    [Fact]
    public async Task Warehouse_and_sales_cannot_record_money_or_read_GST_and_foreign_customers_are_isolated()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var staff=await Staff(db,"WAREHOUSE",d);using var w=api.Authenticated(staff.Subject);
        await Expect(await Receipt(w,d.Customer,1,InvoiceLine(i)),HttpStatusCode.Forbidden);Assert.Equal(HttpStatusCode.Forbidden,(await w.GetAsync($"/api/v1/customers/{d.Customer}/advances")).StatusCode);
        var sales=await Staff(db,"SALES",d);using var s=api.Authenticated(sales.Subject);await Expect(await Receipt(s,d.Customer,1,InvoiceLine(i)),HttpStatusCode.Forbidden);
        var finance=await Staff(db,"FINANCE");using var f=api.Authenticated(finance.Subject);var r=await Expect(await Receipt(f,d.Customer,1,InvoiceLine(i)),HttpStatusCode.Created);
        using var other=api.Authenticated(company:db.OtherCompany);Assert.Equal(HttpStatusCode.NotFound,(await other.GetAsync($"/api/v1/customer-receipts/{r.GetProperty("id").GetGuid()}")).StatusCode);
        var another=await Setup(db,c,0);await Expect(await Receipt(c,another.Customer,1,InvoiceLine(i)),HttpStatusCode.NotFound);
        var date=i.GetProperty("invoiceDate").GetString();Assert.Equal(HttpStatusCode.Forbidden,(await s.GetAsync($"/api/v1/accounting/gst-attributions?from={date}&to={DateOnly.Parse(date!).AddDays(1):yyyy-MM-dd}")).StatusCode);
    }
    [Fact]
    public async Task Advances_cannot_be_applied_to_different_order_lines_or_customers()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var ad=Advance(await Expect(await Receipt(c,d.Customer,24.2m,orderLine:l),HttpStatusCode.Created));
        var q=await Submitted(c,d.Draft());var o2=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var l2=(await Get(c,$"/sales-orders/{o2}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var i2=await Bill(c,o2,l2);
        await Expect(await Apply(c,ad,InvoiceLine(i2),24.2m),HttpStatusCode.UnprocessableEntity);
        var(d2,o3,l3)=await Order(c);var i3=await Bill(c,o3,l3);await Expect(await Apply(c,ad,InvoiceLine(i3),24.2m),HttpStatusCode.NotFound);
        Assert.Equal(24.2m,(await Credit(c,d.Customer)).Advances);Assert.Equal(48.4m,(await Credit(c,d2.Customer)).Ar);
    }
    [Fact]
    public async Task Immutable_ledgers_and_direct_function_permission_are_enforced()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var r=await Expect(await Receipt(c,d.Customer,1,InvoiceLine(i)),HttpStatusCode.Created);
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE accounting.customer_receipts SET amount=0 WHERE company_id=@company",default,("company",db.Company)));
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE platform.documents SET number='HACK' WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",r.GetProperty("id").GetGuid())));
        var staff=await Staff(db,"SALES",d);var actor=(Guid)(await S("SELECT id FROM identity.users WHERE issuer=@issuer AND subject=@subject",("issuer",DatabaseFixture.Issuer),("subject",staff.Subject)))!;
        await using var source=NpgsqlDataSource.Create(db.App);await using var scope=new CompanySession(source);await scope.BeginAsync(db.Company,actor,"direct-receipt",default);
        var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(scope,"SELECT accounting.post_receipt(@customer,1,'CASH','x',NULL,'[]'::jsonb,'[]'::jsonb)",default,("customer",d.Customer)));Assert.Equal("42501",e.SqlState);
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.001)]
    public async Task Invalid_money_is_rejected(decimal amount)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);await Expect(await Receipt(c,d.Customer,amount,InvoiceLine(i)),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Wrong_splits_duplicate_lines_future_dates_and_missing_keys_do_not_post()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var il=InvoiceLine(i);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(2,"CASH",Code(),[new(il,1)])),HttpStatusCode.UnprocessableEntity);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(2,"CASH",Code(),[new(il,1),new(il,1)])),HttpStatusCode.UnprocessableEntity);
        await Expect(await Receipt(c,d.Customer,1,il,date:new DateOnly(2099,1,1)),HttpStatusCode.UnprocessableEntity);
        using var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/customers/{d.Customer}/receipts"){Content=System.Net.Http.Json.JsonContent.Create(new CustomerReceiptInput(1,"CASH",Code(),[new(il,1)]))};await Expect(await c.SendAsync(req),HttpStatusCode.BadRequest);
        Assert.Equal((48.4m,0m,48.4m),await Credit(c,d.Customer));
    }
    private async Task<DateOnly> PriorMonth()
    {
        // Ensure a genuine earlier open period even when the fixture is bootstrapped in July.
        await S("""
            INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on)
            SELECT @company,'settlement-prior-'||starts_on::text,(starts_on-interval '1 year')::date,starts_on FROM accounting.fiscal_years
             WHERE company_id=@company AND starts_on=(SELECT max(starts_on) FROM accounting.fiscal_years WHERE company_id=@company)
            ON CONFLICT(company_id,label) DO NOTHING;
            INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on)
            SELECT @company,f.id,s::date,(s+interval '1 month')::date FROM accounting.fiscal_years f CROSS JOIN LATERAL generate_series(f.starts_on,f.ends_on-interval '1 month',interval '1 month') s
             WHERE f.company_id=@company ON CONFLICT(company_id,starts_on) DO NOTHING
            """,("company",db.Company));
        return (DateOnly)(await S("SELECT (date_trunc('month',now() AT TIME ZONE timezone)-interval '1 month')::date FROM core.companies WHERE id=@company",("company",db.Company)))!;
    }
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Advance_GST_stays_in_original_month_and_closed_period_blocks_only_real_tax_adjustment(bool rounding)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,price:rounding?0.05m:22,quantity:rounding?3:2);var date=await PriorMonth();
        var amount=rounding?0.03m:24.2m;var r=await Expect(await Receipt(c,d.Customer,amount,orderLine:l,date:date),HttpStatusCode.Created);var i=await Bill(c,o,l,rounding?1:2);
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",date));
        var key=Code();var reference=Code();
        try
        {
            var result=await Apply(c,Advance(r),InvoiceLine(i),amount,key,reference);
            if(rounding){await Expect(result,HttpStatusCode.UnprocessableEntity);Assert.Equal(0m,await Tax(d.Customer));}
            else{var app=await Expect(result,HttpStatusCode.Created);Assert.Equal(date,await S("SELECT attribution_date FROM accounting.gst_attributions WHERE company_id=@company AND source_document_id=@id AND kind='ADVANCE_APPLIED'",("company",db.Company),("id",app.GetProperty("id").GetGuid())));Assert.Equal(2.2m,await Tax(d.Customer));}
        }
        finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",date));}
        if(rounding){await Expect(await Apply(c,Advance(r),InvoiceLine(i),amount,key,reference),HttpStatusCode.Created);Assert.Equal(0.01m,await Tax(d.Customer));}
    }
    [Fact]
    public async Task GST_basis_change_with_existing_advances_requires_explicit_transition_workflow()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,_,l)=await Order(c);await Expect(await Receipt(c,d.Customer,1,orderLine:l),HttpStatusCode.Created);
        var error=await Assert.ThrowsAsync<Htt.SharedKernel.BusinessException>(()=>CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,"NON_CASH",DatabaseFixture.Issuer,db.Subject));Assert.Equal(409,error.StatusCode);
    }
    [Fact]
    public async Task Backdated_cash_receipt_uses_actual_cash_date_not_invoice_or_posting_request_date()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);var date=await PriorMonth();
        var r=await Expect(await Receipt(c,d.Customer,24.2m,InvoiceLine(i),date:date),HttpStatusCode.Created);
        Assert.Equal(date,await S("SELECT attribution_date FROM accounting.gst_attributions WHERE company_id=@company AND source_document_id=@id AND kind='CASH_RECEIPT'",("company",db.Company),("id",r.GetProperty("id").GetGuid())));
        Assert.Equal(2.2m,await Tax(d.Customer));
    }
    [Fact]
    public async Task Paid_AR_releases_capacity_for_the_next_real_order()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c);var i=await Bill(c,o,l);
        await S("UPDATE crm.customers SET credit_limit=60 WHERE company_id=@company AND id=@customer",("company",db.Company),("customer",d.Customer));
        var q=await Submitted(c,d.Draft());await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Conflict);
        await Expect(await Receipt(c,d.Customer,48.4m,InvoiceLine(i)),HttpStatusCode.Created);await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);
        Assert.Equal((0m,0m,48.4m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Non_cash_invoice_racing_advance_receipt_does_not_double_attribute_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Order(c,"NON_CASH");
        var receiptTask=Receipt(c,d.Customer,24.2m,orderLine:l);var invoiceTask=Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(l,2)],"Completed"),1);
        await Task.WhenAll(receiptTask,invoiceTask);await Expect(await invoiceTask,HttpStatusCode.Created);var r=await receiptTask;
        Assert.Contains(r.StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});Assert.Equal(4.4m,await Tax(d.Customer));
        Assert.Equal((48.4m,r.StatusCode==HttpStatusCode.Created?24.2m:0m,r.StatusCode==HttpStatusCode.Created?24.2m:48.4m),await Credit(c,d.Customer));
    }
}
