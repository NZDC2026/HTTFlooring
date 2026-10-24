using System.Net;
using System.Text.Json;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class FulfilmentTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private static readonly DispatchInput Pickup = new("PICKUP", "Customer representative", "Signed docket 123");
    private static readonly DispatchInput Delivery = new("DELIVERY", "Test carrier", "Consignment 456");
    private static async Task<(Guid Order, Guid Line)> Order(HttpClient c, SalesData d, decimal quantity = 2)
    {
        var q = await Submitted(c, d.Draft(quantity));
        var o = (await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        return (o, (await Get(c, $"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static async Task<HttpResponseMessage> Pick(HttpClient c, Guid order, Guid line, decimal quantity = 1, string? key = null)
    {
        // Warehouse refreshes order version after each physical dispatch.
        var view = await c.GetAsync($"/api/v1/warehouse/orders/{order}");
        if (!view.IsSuccessStatusCode) return view;
        var version = JsonDocument.Parse(await view.Content.ReadAsStringAsync()).RootElement.GetProperty("version").GetInt64();
        return await Send(c, HttpMethod.Post, $"/warehouse/orders/{order}/picks", new PickInput([new(line, quantity)]), version, key);
    }
    private static async Task<Guid> PickId(HttpClient c, Guid order, Guid line, decimal quantity = 1) =>
        (await Expect(await Pick(c, order, line, quantity), HttpStatusCode.Created)).GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Confirm(HttpClient c, Guid pick, string? key = null, DispatchInput? input = null) =>
        Send(c, HttpMethod.Post, $"/warehouse/picks/{pick}/confirm", input ?? Pickup, 1, key);
    private Task<Guid> Value(SalesData d, decimal value = 100) => StockValuation.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, value, "Verified opening value", DatabaseFixture.Issuer, db.Subject);
    private async Task<(decimal Qty, decimal Reserved, decimal Value)> Balance(SalesData d)
    {
        await using var s = await db.SessionAsync();
        var r = (await Sql.RowsAsync(s, "SELECT b.on_hand,b.reserved,v.value FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.product_id=@product AND b.warehouse_id=@warehouse", default, ("company", db.Company), ("product", d.Product), ("warehouse", d.Warehouse))).Single();
        return ((decimal)r["on_hand"]!, (decimal)r["reserved"]!, r["value"] is decimal v ? v : -1);
    }
    [Theory]
    [InlineData("PICKUP")]
    [InlineData("DELIVERY")]
    public async Task Partial_handover_consumes_reservation_and_posts_cost_atomically(string mode)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 4.4m); await Value(d, 20.01m);
        var (order, line) = await Order(c, d); var p = await PickId(c, order, line);
        Assert.Equal((4.4m, 4.4m, 20.01m), await Balance(d));
        await Expect(await Confirm(c, p, input: mode == "PICKUP" ? Pickup : Delivery), HttpStatusCode.OK);
        Assert.Equal((2.2m, 2.2m, 10m), await Balance(d));
        var detail = await Get(c, $"/warehouse/orders/{order}"); Assert.Equal(1m, D(detail.GetProperty("lines")[0].GetProperty("dispatchedQuantity")));
        var p2 = await PickId(c, order, line); await Expect(await Confirm(c, p2), HttpStatusCode.OK);
        Assert.Equal((0m, 0m, 0m), await Balance(d));
        Assert.Equal(48.4m, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
        Assert.Equal(20.01m, await db.OwnerScalarAsync("SELECT sum(m.cost) FROM inventory.stock_movements m JOIN inventory.stock_balances b ON b.company_id=m.company_id AND b.id=m.stock_balance_id WHERE m.company_id=@company AND b.product_id=@product", ("company", db.Company), ("product", d.Product)));
        Assert.Equal(20.01m, await db.OwnerScalarAsync("SELECT sum(l.debit) FROM accounting.journal_lines l JOIN accounting.journal_entries j ON j.company_id=l.company_id AND j.id=l.journal_entry_id JOIN accounting.posting_batches pb ON pb.company_id=j.company_id AND pb.id=j.posting_batch_id WHERE pb.company_id=@company AND pb.posting_kind='STOCK_ISSUE' AND pb.source_document_id IN (@p,@p2)", ("company", db.Company), ("p", p), ("p2", p2)));
        Assert.Equal(0, (await Get(c, $"/warehouse/orders?warehouseId={d.Warehouse}")).GetProperty("items").GetArrayLength());
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Post, $"/sales-orders/{order}/cancel", new ReviewInput("Too late"), 3)).StatusCode);
    }
    [Fact]
    public async Task Unvalued_stock_fails_closed_then_can_retry_after_controlled_initialization()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var (o, l) = await Order(c, d); var p = await PickId(c, o, l); var key = Code();
        await Expect(await Confirm(c, p, key), HttpStatusCode.UnprocessableEntity); Assert.Equal((22m, 4.4m, -1m), await Balance(d));
        Assert.Equal("PICKED", (await Get(c, $"/warehouse/picks/{p}")).GetProperty("state").GetString());
        await Value(d); await Expect(await Confirm(c, p, key), HttpStatusCode.OK);
    }
    [Fact]
    public async Task Opening_valuation_is_authorized_immutable_and_idempotent()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c);
        var id = await Value(d); Assert.Equal(id, await Value(d));
        await Assert.ThrowsAsync<Htt.SharedKernel.BusinessException>(() => Value(d, 101));
        var staff = await Staff(db, "WAREHOUSE", d);
        await Assert.ThrowsAsync<Htt.SharedKernel.BusinessException>(() => StockValuation.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 100, "Verified opening value", DatabaseFixture.Issuer, staff.Subject));
        await using var s = await db.SessionAsync();
        await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(s, "UPDATE inventory.stock_values SET value=0 WHERE company_id=@company", default, ("company", db.Company)));
    }
    [Fact]
    public async Task Concurrent_same_key_create_and_confirm_have_one_physical_and_financial_effect()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); await Value(d); var (o, l) = await Order(c, d); var key = Code();
        var created = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => Pick(c, o, l, 1, key)));
        var rows = await Task.WhenAll(created.Select(r => Expect(r, HttpStatusCode.Created))); var p = rows[0].GetProperty("id").GetGuid(); Assert.All(rows, r => Assert.Equal(p, r.GetProperty("id").GetGuid()));
        key = Code(); var confirmed = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => Confirm(c, p, key)));
        await Task.WhenAll(confirmed.Select(r => Expect(r, HttpStatusCode.OK)));
        Assert.Equal((19.8m, 2.2m, 90m), await Balance(d));
        Assert.Equal(HttpStatusCode.Conflict, (await Confirm(c, p, key, Delivery)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Confirm(c, p)).StatusCode);
        Assert.Equal(1L, await db.OwnerScalarAsync("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@p AND posting_kind='STOCK_ISSUE'", ("company", db.Company), ("p", p)));
    }
    [Fact]
    public async Task Concurrent_overpicking_and_different_key_confirmation_cannot_double_consume()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); await Value(d); var (o, l) = await Order(c, d);
        var picks = await Task.WhenAll(Pick(c, o, l, 2), Pick(c, o, l, 2)); Assert.Single(picks, r => r.StatusCode == HttpStatusCode.Created); Assert.Single(picks, r => r.StatusCode == HttpStatusCode.UnprocessableEntity);
        var p = (await Expect(picks.Single(r => r.StatusCode == HttpStatusCode.Created), HttpStatusCode.Created)).GetProperty("id").GetGuid();
        var confirms = await Task.WhenAll(Confirm(c, p), Confirm(c, p)); Assert.Single(confirms, r => r.StatusCode == HttpStatusCode.OK); Assert.Single(confirms, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal((17.6m, 0m, 80m), await Balance(d));
    }
    [Fact]
    public async Task Different_orders_share_locked_cost_pool_and_exhaust_rounding_remainder()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 4.4m); await Value(d, 0.01m);
        var a = await Order(c, d, 1); var b = await Order(c, d, 1); var pa = await PickId(c, a.Order, a.Line); var pb = await PickId(c, b.Order, b.Line);
        var results = await Task.WhenAll(Confirm(c, pa), Confirm(c, pb)); await Task.WhenAll(results.Select(r => Expect(r, HttpStatusCode.OK)));
        Assert.Equal((0m, 0m, 0m), await Balance(d));
    }
    [Fact]
    public async Task Cancelled_pick_can_be_replaced_and_order_cancellation_retires_pending_picks()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var (o, l) = await Order(c, d); var p = await PickId(c, o, l, 2);
        await Expect(await Send(c, HttpMethod.Post, $"/warehouse/picks/{p}/cancel", version: 1), HttpStatusCode.OK);
        var replacement = await PickId(c, o, l, 2);
        await Expect(await Send(c, HttpMethod.Post, $"/sales-orders/{o}/cancel", new ReviewInput("Customer cancelled"), 1), HttpStatusCode.OK);
        Assert.Equal("CANCELLED", (await Get(c, $"/warehouse/picks/{replacement}")).GetProperty("state").GetString());
        Assert.Equal((22m, 0m, -1m), await Balance(d)); Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Confirm(c, replacement)).StatusCode);
    }
    [Fact]
    public async Task Dispatch_racing_order_cancel_has_one_winner()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); await Value(d); var (o, l) = await Order(c, d); var p = await PickId(c, o, l, 2);
        var results = await Task.WhenAll(Confirm(c, p), Send(c, HttpMethod.Post, $"/sales-orders/{o}/cancel", new ReviewInput("Cancel race"), 1));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.OK);
        var state = (await Get(c, $"/warehouse/picks/{p}")).GetProperty("state").GetString();
        Assert.Equal(state == "DISPATCHED" ? (17.6m, 0m, 80m) : (22m, 0m, 100m), await Balance(d));
    }
    [Fact]
    public async Task Closed_period_and_late_failure_roll_back_stock_journal_audit_and_idempotency()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); await Value(d); var (o, l) = await Order(c, d); var p = await PickId(c, o, l);
        await db.OwnerScalarAsync("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company", ("company", db.Company));
        try { await Expect(await Confirm(c, p), HttpStatusCode.UnprocessableEntity); Assert.Equal((22m, 4.4m, 100m), await Balance(d)); }
        finally { await db.OwnerScalarAsync("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company", ("company", db.Company)); }
        await db.OwnerScalarAsync("""
            CREATE FUNCTION inventory.test_fail_dispatch() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='inventory.dispatched' THEN RAISE EXCEPTION 'injected late failure' USING ERRCODE='23514'; END IF;RETURN NEW;END $$;
            CREATE TRIGGER test_fail_dispatch BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION inventory.test_fail_dispatch()
            """);
        var key = Code();
        try
        {
            await Expect(await Confirm(c, p, key), HttpStatusCode.UnprocessableEntity); Assert.Equal((22m, 4.4m, 100m), await Balance(d));
            Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@p", ("company", db.Company), ("p", p)));
            Assert.Equal("PICKED", (await Get(c, $"/warehouse/picks/{p}")).GetProperty("state").GetString());
        }
        finally { await db.OwnerScalarAsync("DROP TRIGGER test_fail_dispatch ON platform.audit_events;DROP FUNCTION inventory.test_fail_dispatch()"); }
        await Expect(await Confirm(c, p, key), HttpStatusCode.OK);
    }
    [Fact]
    public async Task Warehouse_permissions_are_independent_of_customer_assignment_and_hide_prices_and_costs()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var (o, l) = await Order(c, d);
        var staff = await Staff(db, "WAREHOUSE");
        await db.OwnerScalarAsync("INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@member,@warehouse)", ("company", db.Company), ("member", staff.Membership), ("warehouse", d.Warehouse));
        using var w = api.Authenticated(staff.Subject); var detail = await Get(w, $"/warehouse/orders/{o}"); var raw = detail.GetRawText();
        Assert.DoesNotContain("unitPrice", raw); Assert.DoesNotContain("gross", raw); Assert.DoesNotContain("cost", raw);
        var p = await PickId(w, o, l); await Value(d); await Expect(await Confirm(w, p), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.Forbidden, (await w.GetAsync($"/api/v1/inventory/valuation?warehouseId={d.Warehouse}")).StatusCode);
        var outsider = await Staff(db, "WAREHOUSE"); using var unassigned = api.Authenticated(outsider.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await unassigned.GetAsync($"/api/v1/warehouse/orders/{o}")).StatusCode);
        var sales = await Staff(db, "SALES", d); using var salesman = api.Authenticated(sales.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(salesman, HttpMethod.Post, $"/warehouse/orders/{o}/picks", new PickInput([new(l, 1)]), 1)).StatusCode);
        using var other = api.Authenticated(company: db.OtherCompany);
        Assert.Equal(HttpStatusCode.NotFound, (await other.GetAsync($"/api/v1/warehouse/picks/{p}")).StatusCode);
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    [InlineData(3)]
    public async Task Invalid_or_excess_pick_quantities_have_no_effect(decimal qty)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var (o, l) = await Order(c, d);
        await Expect(await Pick(c, o, l, qty), HttpStatusCode.UnprocessableEntity); Assert.Equal(4.4m, await Reserved(c, d));
    }
    [Theory]
    [InlineData("OTHER","Name","Ref")]
    [InlineData("PICKUP","","Ref")]
    [InlineData("DELIVERY","Carrier","")]
    public async Task Handover_requires_mode_recipient_and_reference(string mode, string recipient, string reference)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var (o, l) = await Order(c, d); var p = await PickId(c, o, l);
        await Expect(await Confirm(c, p, input: new(mode, recipient, reference)), HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Zero_valuation_is_explicit_and_movements_are_immutable()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); await Value(d, 0); var (o, l) = await Order(c, d); var p = await PickId(c, o, l);
        await Expect(await Confirm(c, p), HttpStatusCode.OK); Assert.Equal((19.8m, 2.2m, 0m), await Balance(d));
        Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@p", ("company", db.Company), ("p", p)));
        await using var s = await db.SessionAsync();
        await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(s, "UPDATE inventory.stock_movements SET cost=1 WHERE company_id=@company", default, ("company", db.Company)));
    }
    [Fact]
    public async Task Stale_versions_and_foreign_order_lines_do_not_create_work()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var a = await Order(c, d); var b = await Order(c, d);
        await Expect(await Send(c, HttpMethod.Post, $"/warehouse/orders/{a.Order}/picks", new PickInput([new(a.Line, 1)]), 2), HttpStatusCode.Conflict);
        await Expect(await Pick(c, a.Order, b.Line), HttpStatusCode.NotFound);
        await Expect(await Send(c, HttpMethod.Post, $"/warehouse/orders/{a.Order}/picks", new PickInput([]), 1), HttpStatusCode.UnprocessableEntity);
        Assert.Empty((await Get(c, $"/warehouse/orders/{a.Order}")).GetProperty("picks").EnumerateArray());
    }
}
