using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Htt.SharedKernel;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class InvoicingTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private Task Configure(bool registered = true, string basis = "NON_CASH") => CompanyTaxSettings.ConfigureAsync(db.Owner, db.Company, registered, basis, DatabaseFixture.Issuer, db.Subject);
    private async Task<(SalesData Data, Guid Order, Guid Line)> Prepare(HttpClient c, decimal quantity = 2, bool dispatch = true, bool service = false, decimal? price = null, string? taxCode = null)
    {
        await Configure(); var data = await Setup(db, c);
        if (service || taxCode is not null)
        {
            var product = await Get(c, $"/products/{data.Product}"); var tax = product.GetProperty("taxCodeId").GetGuid();
            if (taxCode is not null) tax = (await Get(c, "/foundation")).GetProperty("taxCodes").EnumerateArray().Single(t => t.GetProperty("code").GetString() == taxCode).GetProperty("id").GetGuid();
            await Expect(await Send(c, HttpMethod.Put, $"/products/{data.Product}", new ProductMaintenance(product.GetProperty("sku").GetString()!, "Billing product", tax, ItemType: service ? "SERVICE" : "STOCK", WholePacks: !service), 1), HttpStatusCode.OK);
        }
        var q = await Submitted(c, data.Draft(quantity) with { Lines = [new(data.BoxUnit, Quantity: quantity, UnitPrice: price)] });
        var order = (await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var line = (await Get(c, $"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();
        if (dispatch && !service)
        {
            await StockValuation.InitializeAsync(db.Owner, db.Company, data.Warehouse, data.Product, 100, "Billing opening", DatabaseFixture.Issuer, db.Subject);
            await Dispatch(c, order, line, quantity);
        }
        return (data, order, line);
    }
    private static async Task<long> Version(HttpClient c, Guid order) => (await Get(c, $"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64();
    private static async Task Dispatch(HttpClient c, Guid order, Guid line, decimal quantity)
    {
        var version = await Version(c, order);
        var pick = (await Expect(await Send(c, HttpMethod.Post, $"/warehouse/orders/{order}/picks", new PickInput([new(line, quantity)]), version), HttpStatusCode.Created)).GetProperty("id").GetGuid();
        await Expect(await Send(c, HttpMethod.Post, $"/warehouse/picks/{pick}/confirm", new DispatchInput("PICKUP", "Customer", "Signed docket"), 1), HttpStatusCode.OK);
    }
    private static Task<HttpResponseMessage> Bill(HttpClient c, Guid order, Guid line, decimal qty, long version, string? key = null, string? reference = null) =>
        Send(c, HttpMethod.Post, $"/sales-orders/{order}/invoices", new InvoiceInput([new(line, qty)], reference), version, key);
    private Task<object?> Scalar(string sql, params (string, object)[] args) => db.OwnerScalarAsync(sql, args);
    private Task<object?> Count(Guid order) => Scalar("SELECT count(*) FROM sales.invoices WHERE company_id=@company AND order_id=@order", ("company", db.Company), ("order", order));
    private async Task<(decimal Ar, decimal Unbilled, decimal Exposure)> Credit(HttpClient c, Guid customer)
    {
        var r = await Get(c, $"/customers/{customer}/credit"); return (D(r.GetProperty("receivable")), D(r.GetProperty("unbilledOrders")), D(r.GetProperty("exposure")));
    }
    [Fact]
    public async Task Partial_invoices_move_credit_to_AR_and_post_balanced_revenue_GST_without_touching_stock()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (data, o, l) = await Prepare(c);
        Assert.Equal((0m,48.4m,48.4m), await Credit(c, data.Customer));
        var invoice = await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Created); var id = invoice.GetProperty("id").GetGuid();
        Assert.Equal("POSTED", invoice.GetProperty("state").GetString()); Assert.Equal("TAX_INVOICE", invoice.GetProperty("title").GetString());
        Assert.Equal("51824753556", invoice.GetProperty("issuer").GetProperty("abn").GetString()); Assert.Equal(24.2m, D(invoice.GetProperty("gross")));
        Assert.Equal((24.2m,24.2m,48.4m), await Credit(c, data.Customer));
        var journal = invoice.GetProperty("journalEntryId").GetGuid();
        Assert.Equal(24.2m, await Scalar("SELECT sum(debit) FROM accounting.journal_lines WHERE company_id=@company AND journal_entry_id=@j", ("company", db.Company), ("j", journal)));
        Assert.Equal(22m, await Scalar("SELECT sum(l.credit) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND l.journal_entry_id=@j AND a.kind='REVENUE'", ("company", db.Company), ("j", journal)));
        Assert.Equal(2.2m, await Scalar("SELECT sum(l.credit) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND l.journal_entry_id=@j AND a.control_kind='GST'", ("company", db.Company), ("j", journal)));
        Assert.Equal(1L, await Scalar("SELECT count(*) FROM accounting.journal_lines l JOIN crm.customers c ON c.company_id=l.company_id AND c.party_id=l.party_id WHERE c.company_id=@company AND c.id=@customer AND l.journal_entry_id=@j AND l.debit=24.2", ("company", db.Company), ("customer", data.Customer), ("j", journal)));
        var gst = await Get(c, $"/sales-invoices/{id}/gst"); Assert.Equal(2.2m, D(gst.GetProperty("entries")[0].GetProperty("tax")));
        var second = await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Created); Assert.NotEqual(invoice.GetProperty("number").GetString(), second.GetProperty("number").GetString());
        Assert.Equal((48.4m,0m,48.4m), await Credit(c, data.Customer));
        Assert.Equal(17.6m, await Scalar("SELECT on_hand FROM inventory.stock_balances WHERE company_id=@company AND product_id=@product", ("company", db.Company), ("product", data.Product)));
        var ar = await Get(c, $"/customers/{data.Customer}/receivables"); Assert.Equal(2, ar.GetProperty("items").GetArrayLength());
        Assert.Equal(0m, D((await Get(c, $"/sales-orders/{o}/invoiceable")).GetProperty("lines")[0].GetProperty("availableQuantity")));
        Assert.Equal(30, DateOnly.Parse(invoice.GetProperty("dueOn").GetString()!).DayNumber-DateOnly.Parse(invoice.GetProperty("invoiceDate").GetString()!).DayNumber);
    }
    [Fact]
    public async Task Stock_must_be_dispatched_and_only_dispatched_remainder_is_invoiceable()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o, l) = await Prepare(c, dispatch:false);
        await Expect(await Bill(c, o, l, 1, 1), HttpStatusCode.Conflict); Assert.Equal(0L, await Count(o));
        await StockValuation.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 100, "Billing opening", DatabaseFixture.Issuer, db.Subject);
        await Dispatch(c, o, l, 1); await Expect(await Bill(c, o, l, 2, await Version(c, o)), HttpStatusCode.Conflict);
        await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Created);
        await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Conflict);
        await Dispatch(c, o, l, 1); await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Created);
        Assert.Equal((48.4m,0m,48.4m), await Credit(c, d.Customer));
    }
    [Fact]
    public async Task Concurrent_same_key_replays_one_invoice_and_mismatched_key_rejects()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o, l) = await Prepare(c); var v = await Version(c, o); var key = Code();
        var results = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => Bill(c, o, l, 1, v, key)));
        var rows = await Task.WhenAll(results.Select(r => Expect(r, HttpStatusCode.Created))); Assert.Single(rows.Select(r => r.GetProperty("id").GetGuid()).Distinct());
        Assert.Equal(1L, await Count(o)); Assert.Equal((24.2m,24.2m,48.4m), await Credit(c, d.Customer));
        await Expect(await Bill(c, o, l, 2, v, key), HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Concurrent_different_keys_cannot_double_bill_or_release_credit_twice()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o, l) = await Prepare(c); var v = await Version(c, o);
        var results = await Task.WhenAll(Bill(c, o, l, 2, v), Bill(c, o, l, 2, v));
        Assert.Single(results, r => r.StatusCode==HttpStatusCode.Created); Assert.Single(results, r => r.StatusCode==HttpStatusCode.Conflict);
        Assert.Equal(1L, await Count(o)); Assert.Equal((48.4m,0m,48.4m), await Credit(c, d.Customer));
        await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Different_orders_same_customer_serialize_AR_projection_and_preserve_total_exposure()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o1, l1) = await Prepare(c);
        var q = await Submitted(c, d.Draft()); var o2 = (await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var l2 = (await Get(c, $"/sales-orders/{o2}")).GetProperty("lines")[0].GetProperty("id").GetGuid(); await Dispatch(c, o2, l2, 2);
        var v1 = await Version(c, o1); var v2 = await Version(c, o2);
        var results = await Task.WhenAll(Bill(c, o1, l1, 2, v1), Bill(c, o2, l2, 2, v2)); await Task.WhenAll(results.Select(r => Expect(r, HttpStatusCode.Created)));
        Assert.Equal((96.8m,0m,96.8m), await Credit(c, d.Customer));
        var invoices = await Get(c, $"/sales-invoices?customerId={d.Customer}"); Assert.Equal(2, invoices.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("number").GetString()).Distinct().Count());
    }
    [Fact]
    public async Task Billing_does_not_create_new_credit_capacity_for_a_competing_order()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o, l) = await Prepare(c);
        await Scalar("UPDATE crm.customers SET credit_limit=50 WHERE company_id=@company AND id=@customer", ("company", db.Company), ("customer", d.Customer));
        var q = await Submitted(c, d.Draft()); var v = await Version(c, o);
        var results = await Task.WhenAll(Bill(c, o, l, 2, v), Approve(c, q.Id, q.Version));
        Assert.Equal(HttpStatusCode.Created, results[0].StatusCode); Assert.Equal(HttpStatusCode.Conflict, results[1].StatusCode);
        Assert.Equal((48.4m,0m,48.4m), await Credit(c, d.Customer));
    }
    [Fact]
    public async Task Cumulative_net_and_GST_rounding_exhaust_exact_approved_order_totals()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d, o, l) = await Prepare(c, quantity:3, price:0.05m);
        var invoices = new List<JsonElement>();
        for(var i=0;i<3;i++) invoices.Add(await Expect(await Bill(c, o, l, 1, await Version(c, o)), HttpStatusCode.Created));
        Assert.Equal(0.15m,invoices.Sum(r=>D(r.GetProperty("net")))); Assert.Equal(0.02m,invoices.Sum(r=>D(r.GetProperty("tax"))));
        Assert.Equal((0.17m,0m,0.17m),await Credit(c,d.Customer));
    }
    [Theory]
    [InlineData("FRE")]
    [InlineData("N-T")]
    public async Task Zero_tax_items_have_no_GST_credit_and_plain_invoice_when_unregistered(string taxCode)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var (d,o,l)=await Prepare(c,taxCode:taxCode); await Configure(false);
        var i=await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);
        Assert.Equal("INVOICE",i.GetProperty("title").GetString()); Assert.Equal(0m,D(i.GetProperty("tax"))); Assert.Equal((44m,0m,44m),await Credit(c,d.Customer));
        Assert.Equal(0m,await Scalar("SELECT coalesce(sum(g.tax),0) FROM accounting.sales_gst_entries g JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id WHERE l.company_id=@company AND l.invoice_id=@id",("company",db.Company),("id",i.GetProperty("id").GetGuid())));
    }
    [Fact]
    public async Task Free_invoice_consumes_quantity_without_zero_amount_journal()
    {
        await using var api = new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c,price:0);
        var i=await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);
        Assert.Equal(0m,D(i.GetProperty("gross")));Assert.Equal(JsonValueKind.Null,i.GetProperty("journalEntryId").ValueKind);
        Assert.Equal((0m,0m,0m),await Credit(c,d.Customer));await Expect(await Bill(c,o,l,1,await Version(c,o)),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Cash_GST_basis_is_frozen_as_invoice_tax_ledger_and_not_a_BAS_allocation()
    {
        await using var api = new TestApi(db); using var c=api.Authenticated();var(_,o,l)=await Prepare(c);await Configure(basis:"CASH");
        var i=await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);var id=i.GetProperty("id").GetGuid();await Configure();
        Assert.Equal("CASH",(await Get(c,$"/sales-invoices/{id}/gst")).GetProperty("gstBasis").GetString());
        Assert.Equal("CASH",await Scalar("SELECT gst_basis FROM accounting.sales_gst_entries WHERE company_id=@company AND invoice_line_id=@id",("company",db.Company),("id",i.GetProperty("lines")[0].GetProperty("id").GetGuid())));
    }
    [Fact]
    public async Task Unverified_GST_registration_rejects_taxable_invoice_and_same_key_can_retry_after_setup()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(_,o,l)=await Prepare(c);await Configure(false);var key=Code();var v=await Version(c,o);
        var failure=await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.UnprocessableEntity);Assert.Equal("invoice_validation",failure.GetProperty("code").GetString());Assert.Equal(0L,await Count(o));
        await Configure();await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Service_billing_requires_office_fulfilment_reference_and_blocks_whole_order_cancellation()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c,service:true);
        await Expect(await Bill(c,o,l,1,1),HttpStatusCode.UnprocessableEntity);
        await Expect(await Bill(c,o,l,1,1,reference:"Installation completed WO-123"),HttpStatusCode.Created);
        await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/cancel",new ReviewInput("Cannot cancel billed service"),await Version(c,o)),HttpStatusCode.Conflict);
        Assert.Equal((24.2m,24.2m,48.4m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Invoice_racing_service_order_cancellation_has_one_committed_winner()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c,service:true);
        var results=await Task.WhenAll(Bill(c,o,l,2,1,reference:"Work completed"),Send(c,HttpMethod.Post,$"/sales-orders/{o}/cancel",new ReviewInput("Cancel race"),1));
        Assert.Equal(1,results.Count(r=>r.StatusCode is HttpStatusCode.OK or HttpStatusCode.Created));
        Assert.Equal(results[0].StatusCode==HttpStatusCode.Created?(48.4m,0m,48.4m):(0m,0m,0m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Closed_period_and_invalid_account_mappings_leave_invoice_and_credit_unchanged()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);var v=await Version(c,o);var key=Code();
        await Scalar("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));
        try{await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,48.4m,48.4m),await Credit(c,d.Customer));}
        finally{await Scalar("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
        await Scalar("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='2200'",("company",db.Company));
        try{await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await Count(o));}
        finally{await Scalar("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='2200'",("company",db.Company));}
        await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Late_audit_failure_rolls_back_invoice_sequence_AR_GST_credit_and_idempotency()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);var key=Code();var v=await Version(c,o);
        var before=await Scalar("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='INVOICE'",("company",db.Company));
        await Scalar("""
            CREATE FUNCTION sales.test_fail_invoice() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='sales.invoice_posted' THEN RAISE EXCEPTION 'injected invoice failure' USING ERRCODE='23514'; END IF;RETURN NEW;END $$;
            CREATE TRIGGER test_fail_invoice BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION sales.test_fail_invoice()
            """);
        try
        {
            await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await Count(o));Assert.Equal((0m,48.4m,48.4m),await Credit(c,d.Customer));
            Assert.Equal(before,await Scalar("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='INVOICE'",("company",db.Company)));
            Assert.Equal(0L,await Scalar("SELECT count(*) FROM accounting.receivable_items WHERE company_id=@company AND customer_id=@customer",("company",db.Company),("customer",d.Customer)));
            Assert.Equal(v,await Version(c,o));
        }
        finally{await Scalar("DROP TRIGGER test_fail_invoice ON platform.audit_events;DROP FUNCTION sales.test_fail_invoice()");}
        await Expect(await Bill(c,o,l,2,v,key),HttpStatusCode.Created);Assert.Equal((48.4m,0m,48.4m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Invoice_permissions_customer_assignment_and_company_isolation_are_enforced()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);var v=await Version(c,o);
        var warehouse=await Staff(db,"WAREHOUSE",d);using var w=api.Authenticated(warehouse.Subject);await Expect(await Bill(w,o,l,2,v),HttpStatusCode.Forbidden);
        var sales=await Staff(db,"SALES",d);using var s=api.Authenticated(sales.Subject);await Expect(await Bill(s,o,l,2,v),HttpStatusCode.Forbidden);
        var finance=await Staff(db,"FINANCE");using var f=api.Authenticated(finance.Subject);var i=await Expect(await Bill(f,o,l,2,v),HttpStatusCode.Created);var id=i.GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.OK,(await s.GetAsync($"/api/v1/sales-invoices/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await s.GetAsync($"/api/v1/customers/{d.Customer}/receivables")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await w.GetAsync($"/api/v1/sales-invoices/{id}/gst")).StatusCode);
        var outsider=await Staff(db,"SALES");using var unassigned=api.Authenticated(outsider.Subject);Assert.Equal(HttpStatusCode.NotFound,(await unassigned.GetAsync($"/api/v1/sales-invoices/{id}")).StatusCode);
        Assert.Equal(0,(await Get(unassigned,"/sales-invoices")).GetProperty("items").GetArrayLength());
        using var other=api.Authenticated(company:db.OtherCompany);Assert.Equal(HttpStatusCode.NotFound,(await other.GetAsync($"/api/v1/sales-invoices/{id}")).StatusCode);
        await Expect(await Bill(other,o,l,2,v),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Direct_definer_invocation_also_checks_actor_permission_and_customer_scope()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);var staff=await Staff(db,"SALES",d);
        var actor=(Guid)(await Scalar("SELECT id FROM identity.users WHERE issuer=@issuer AND subject=@subject",("issuer",DatabaseFixture.Issuer),("subject",staff.Subject)))!;
        await using var source=NpgsqlDataSource.Create(db.App);await using var s=new CompanySession(source);await s.BeginAsync(db.Company,actor,"direct-invoice-test",default);
        var error=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"SELECT sales.post_invoice(@order,2,@lines::jsonb,NULL)",default,("order",o),("lines",JsonSerializer.Serialize(new[]{new{orderLineId=l,quantity=2}}))));Assert.Equal("42501",error.SqlState);
    }
    [Fact]
    public async Task Posted_invoice_and_receivable_records_are_immutable_and_credit_cannot_be_released_without_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(_,o,l)=await Prepare(c);var i=await Expect(await Bill(c,o,l,1,await Version(c,o)),HttpStatusCode.Created);var id=i.GetProperty("id").GetGuid();
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE sales.invoices SET gross=0 WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",id)));
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE platform.documents SET number='EDIT' WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",id)));
        await using(var s=await db.SessionAsync())
        {
            await Sql.RowsAsync(s,"UPDATE sales.credit_commitments SET released_amount=amount WHERE company_id=@company AND order_id=@order",default,("company",db.Company),("order",o));
            await Assert.ThrowsAsync<PostgresException>(()=>s.Transaction.CommitAsync());
        }
        Assert.Equal(24.2m,await Scalar("SELECT released_amount FROM sales.credit_commitments WHERE company_id=@company AND order_id=@order",("company",db.Company),("order",o)));
    }
    [Fact]
    public async Task Client_prices_totals_accounts_dates_and_issuer_cannot_override_posted_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(_,o,l)=await Prepare(c);
        var i=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new{lines=new[]{new{orderLineId=l,quantity=2,unitPrice=0,tax=0}},gross=0,invoiceDate="2000-01-01",number="HACK",issuer=new{name="HACK"},arAccountId=Guid.NewGuid()},await Version(c,o)),HttpStatusCode.Created);
        Assert.Equal(48.4m,D(i.GetProperty("gross")));Assert.NotEqual("HACK",i.GetProperty("number").GetString());Assert.NotEqual("HACK",i.GetProperty("issuer").GetProperty("name").GetString());Assert.NotEqual("2000-01-01",i.GetProperty("invoiceDate").GetString());
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    [InlineData(0.0000001)]
    public async Task Invalid_invoice_quantities_are_rejected_without_side_effects(decimal quantity)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(_,o,l)=await Prepare(c);
        await Expect(await Bill(c,o,l,quantity,await Version(c,o)),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await Count(o));
    }
    [Fact]
    public async Task Missing_headers_duplicates_foreign_lines_and_stale_versions_do_not_issue_invoice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(_,o,l)=await Prepare(c);var v=await Version(c,o);
        await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(l,1)])),(HttpStatusCode)428);
        using(var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/sales-orders/{o}/invoices"))
        {
            req.Content=System.Net.Http.Json.JsonContent.Create(new InvoiceInput([new(l,1)]));req.Headers.TryAddWithoutValidation("If-Match",$"\"{v}\"");await Expect(await c.SendAsync(req),HttpStatusCode.BadRequest);
        }
        await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(l,1),new(l,1)]),v),HttpStatusCode.UnprocessableEntity);
        await Expect(await Bill(c,o,Guid.NewGuid(),1,v),HttpStatusCode.NotFound);await Expect(await Bill(c,o,l,1,v+1),HttpStatusCode.Conflict);Assert.Equal(0L,await Count(o));
    }
    [Fact]
    public async Task Tax_configuration_requires_authorized_member_and_ABN()
    {
        var staff=await Staff(db,"WAREHOUSE");await Assert.ThrowsAsync<BusinessException>(()=>CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,"NON_CASH",DatabaseFixture.Issuer,staff.Subject));
        await Assert.ThrowsAsync<BusinessException>(()=>CompanyTaxSettings.ConfigureAsync(db.Owner,db.OtherCompany,true,"NON_CASH",DatabaseFixture.Issuer,db.Subject));
        await Assert.ThrowsAsync<BusinessException>(()=>Configure(basis:"INVALID"));
    }
    [Fact]
    public async Task On_hold_customer_with_reduced_limit_can_be_billed_for_existing_delivery_without_new_exposure()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);
        await Scalar("UPDATE crm.customers SET status='ON_HOLD',credit_limit=1 WHERE company_id=@company AND id=@customer",("company",db.Company),("customer",d.Customer));
        await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);Assert.Equal((48.4m,0m,48.4m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Later_price_tax_and_customer_changes_do_not_reprice_invoice_or_rewrite_snapshots()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);
        await Scalar("UPDATE accounting.tax_rates SET rate=0.15 WHERE company_id=@company AND tax_code_id=(SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST');UPDATE crm.parties SET legal_name='Changed after approval' WHERE company_id=@company AND id=(SELECT party_id FROM crm.customers WHERE company_id=@company AND id=@customer)",("company",db.Company),("customer",d.Customer));
        try
        {
            var i=await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);
            Assert.Equal(48.4m,D(i.GetProperty("gross")));Assert.Equal(0.1m,D(i.GetProperty("lines")[0].GetProperty("taxRate")));Assert.Equal("Stage B customer",i.GetProperty("customer").GetProperty("legalName").GetString());
        }
        finally{await Scalar("UPDATE accounting.tax_rates SET rate=0.1 WHERE company_id=@company AND tax_code_id=(SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST')",("company",db.Company));}
    }
    [Fact]
    public async Task Existing_AR_and_advances_are_preserved_when_credit_commitment_is_reclassified()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c);
        await Scalar("UPDATE crm.customer_credit_exposures SET receivable=10,available_advances=5 WHERE company_id=@company AND customer_id=@customer",("company",db.Company),("customer",d.Customer));
        await Expect(await Bill(c,o,l,2,await Version(c,o)),HttpStatusCode.Created);Assert.Equal((58.4m,0m,53.4m),await Credit(c,d.Customer));
    }
    [Fact]
    public async Task Dispatch_and_invoice_racing_share_order_lock_and_can_retry_using_current_version()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var(d,o,l)=await Prepare(c,dispatch:false);
        await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,100,"Billing opening",DatabaseFixture.Issuer,db.Subject);
        await Dispatch(c,o,l,1);var v=await Version(c,o);
        var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{o}/picks",new PickInput([new(l,1)]),v),HttpStatusCode.Created)).GetProperty("id").GetGuid();
        var key=Code();var results=await Task.WhenAll(Bill(c,o,l,1,v,key),Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("DELIVERY","Carrier","Consignment"),1));
        await Expect(results[1],HttpStatusCode.OK);
        if(results[0].StatusCode==HttpStatusCode.Conflict)await Expect(await Bill(c,o,l,1,await Version(c,o)),HttpStatusCode.Created);
        else await Expect(results[0],HttpStatusCode.Created);
        await Expect(await Bill(c,o,l,1,await Version(c,o)),HttpStatusCode.Created);Assert.Equal((48.4m,0m,48.4m),await Credit(c,d.Customer));
        Assert.Equal(17.6m,await Scalar("SELECT on_hand FROM inventory.stock_balances WHERE company_id=@company AND product_id=@product",("company",db.Company),("product",d.Product)));
    }
}
