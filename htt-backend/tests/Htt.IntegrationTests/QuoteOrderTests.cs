using System.Net;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class QuoteOrderTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Sales_quote_office_order_credit_and_stock_are_one_consistent_flow()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin);
        var salesUser = await Staff(db, "SALES", d); using var sales = api.Authenticated(salesUser.Subject);
        var officeUser = await Staff(db, "OFFICE"); using var office = api.Authenticated(officeUser.Subject);
        var id = await Create(sales, "/quotes", d.Draft()); var draft = await Get(sales, $"/quotes/{id}");
        Assert.Equal(System.Text.Json.JsonValueKind.Null, draft.GetProperty("number").ValueKind); Assert.Equal(0, await Reserved(admin, d));
        var q = await Expect(await Send(sales, HttpMethod.Post, $"/quotes/{id}/submit", version: 1), HttpStatusCode.OK);
        Assert.StartsWith("Q-", q.GetProperty("number").GetString()); Assert.Equal(0, await Reserved(admin, d));
        Assert.Equal(HttpStatusCode.Forbidden, (await Approve(sales, id, 2)).StatusCode);
        var order = await Expect(await Approve(office, id, 2), HttpStatusCode.Created); var orderId = order.GetProperty("orderId").GetGuid();
        Assert.StartsWith("SO-", order.GetProperty("number").GetString()); Assert.Equal(4.4m, await Reserved(admin, d));
        var credit = await Get(office, $"/customers/{d.Customer}/credit"); Assert.Equal(48.4m, D(credit.GetProperty("unbilledOrders")));
        var detail = await Get(sales, $"/sales-orders/{orderId}"); Assert.Equal(48.4m, D(detail.GetProperty("gross")));
        Assert.Equal("CONVERTED", (await Get(sales, $"/quotes/{id}")).GetProperty("status").GetString());
        Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@id", ("company", db.Company), ("id", orderId)));
    }
    [Fact]
    public async Task Submission_replay_freezes_snapshot_without_allocating_a_second_number()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var id = await Create(c, "/quotes", d.Draft()); var key = Guid.NewGuid().ToString();
        var first = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1, key: key), HttpStatusCode.OK);
        var next = await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'", ("company", db.Company));
        var replay = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1, key: key), HttpStatusCode.OK);
        Assert.Equal(first.GetProperty("number").GetString(), replay.GetProperty("number").GetString());
        Assert.Equal(next, await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'", ("company", db.Company)));
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Put, $"/quotes/{id}", d.Draft(), 2)).StatusCode);
        Assert.Equal(1L, await db.OwnerScalarAsync("SELECT count(*) FROM sales.quote_submissions WHERE company_id=@company AND quote_id=@id", ("company", db.Company), ("id", id)));
    }
    [Fact]
    public async Task Changed_pricing_requires_refresh_before_formal_submission()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var id = await Create(c, "/quotes", d.Draft());
        var price = (Guid)(await db.OwnerScalarAsync("SELECT id FROM pricing.price_list_items WHERE company_id=@company AND product_unit_id=@unit", ("company", db.Company), ("unit", d.BoxUnit)))!;
        await Expect(await Send(c, HttpMethod.Put, $"/pricing/standard-prices/{price}", new StandardPriceMaintenance(d.BoxUnit, 25, DateTimeOffset.UtcNow.AddHours(-1)), 1), HttpStatusCode.OK);
        var error = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1), HttpStatusCode.Conflict); Assert.Equal("price_changed", error.GetProperty("code").GetString());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, (await Get(c, $"/quotes/{id}")).GetProperty("number").ValueKind);
        await Expect(await Send(c, HttpMethod.Put, $"/quotes/{id}", d.Draft(), 1), HttpStatusCode.OK);
        await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 2), HttpStatusCode.OK);
    }
    [Fact]
    public async Task Office_return_and_resubmit_keeps_number_and_retains_submission_history()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var q = await Submitted(c, d.Draft());
        var number = (await Get(c, $"/quotes/{q.Id}")).GetProperty("number").GetString();
        await Expect(await Send(c, HttpMethod.Post, $"/quotes/{q.Id}/return-to-draft", new ReviewInput("Customer amended quantity"), q.Version), HttpStatusCode.OK);
        await Expect(await Send(c, HttpMethod.Put, $"/quotes/{q.Id}", d.Draft(3), 3), HttpStatusCode.OK);
        var submitted = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{q.Id}/submit", version: 4), HttpStatusCode.OK);
        Assert.Equal(number, submitted.GetProperty("number").GetString());
        Assert.Equal(2L, await db.OwnerScalarAsync("SELECT count(*) FROM sales.quote_submissions WHERE company_id=@company AND quote_id=@id", ("company", db.Company), ("id", q.Id)));
        await Expect(await Approve(c, q.Id, 5), HttpStatusCode.Created);
    }
    [Fact]
    public async Task Cancellation_releases_once_and_does_not_reopen_the_source_quote()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var q = await Submitted(c, d.Draft());
        var order = (await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created)).GetProperty("orderId").GetGuid(); var key = Guid.NewGuid().ToString();
        await Expect(await Send(c, HttpMethod.Post, $"/sales-orders/{order}/cancel", new ReviewInput("Customer cancelled"), 1, key), HttpStatusCode.OK);
        await Expect(await Send(c, HttpMethod.Post, $"/sales-orders/{order}/cancel", new ReviewInput("Customer cancelled"), 1, key), HttpStatusCode.OK);
        Assert.Equal(0, await Reserved(c, d)); Assert.Equal(0, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
        var duplicate = await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.OK); Assert.Equal(order, duplicate.GetProperty("orderId").GetGuid()); Assert.Equal(0, await Reserved(c, d));
    }
    [Fact]
    public async Task Area_input_rounds_to_full_boxes_and_retains_requested_and_covered_quantities()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 1000);
        var id = await Create(c, "/quotes", d.Draft() with { Lines = [new(d.BoxUnit, RequestedArea: 50)] });
        var line = (await Get(c, $"/quotes/{id}")).GetProperty("lines")[0].GetProperty("snapshot");
        Assert.Equal(23, D(line.GetProperty("quantity"))); Assert.Equal(50, D(line.GetProperty("requestedArea"))); Assert.Equal(50.6m, D(line.GetProperty("baseQuantity")));
    }
    [Theory]
    [InlineData(-1, 0)]
    [InlineData(0, 0)]
    [InlineData(1.5, 0)]
    [InlineData(1, 101)]
    public async Task Invalid_quantities_or_discounts_never_create_a_quote(decimal quantity, decimal discount)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/quotes", d.Draft() with { Lines = [new(d.BoxUnit, Quantity: quantity, DiscountPercent: discount)] })).StatusCode);
    }
    [Fact]
    public async Task Manual_discount_cannot_bypass_the_floor_at_draft_or_approval()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c);
        var floor = await Create(c, "/pricing/floors", new FloorMaintenance(d.BoxUnit, 20));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/quotes", d.Draft() with { Lines = [new(d.BoxUnit, Quantity: 1, UnitPrice: 21, DiscountPercent: 10)] })).StatusCode);
        var q = await Submitted(c, d.Draft());
        await Expect(await Send(c, HttpMethod.Put, $"/pricing/floors/{floor}", new FloorMaintenance(d.BoxUnit, 23), 1), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.Conflict, (await Approve(c, q.Id, q.Version)).StatusCode); Assert.Equal(0, await Reserved(c, d));
    }
    [Fact]
    public async Task Opening_is_authorized_once_and_preserves_quantity_precision()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 0);
        var id = await StockOpening.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 12.345678m, "opening", DatabaseFixture.Issuer, db.Subject);
        Assert.Equal(id, await StockOpening.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 12.345678m, "opening", DatabaseFixture.Issuer, db.Subject));
        await Assert.ThrowsAsync<Htt.SharedKernel.BusinessException>(() => StockOpening.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 13, "opening", DatabaseFixture.Issuer, db.Subject));
        var office = await Staff(db, "OFFICE"); await Assert.ThrowsAsync<Htt.SharedKernel.BusinessException>(() => StockOpening.InitializeAsync(db.Owner, db.Company, d.Warehouse, d.Product, 12.345678m, "opening", DatabaseFixture.Issuer, office.Subject));
    }
}
