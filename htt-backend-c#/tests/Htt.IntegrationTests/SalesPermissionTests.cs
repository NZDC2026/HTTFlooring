using System.Net;
using System.Net.Http.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SalesPermissionTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Quote_and_order_visibility_follow_customer_and_company_scope()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin); var q = await Submitted(admin, d.Draft());
        var order = (await Expect(await Approve(admin, q.Id, q.Version), HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var stranger = await Staff(db, "SALES"); using var sales = api.Authenticated(stranger.Subject);
        Assert.Empty((await Get(sales, "/quotes")).GetProperty("items").EnumerateArray()); Assert.Empty((await Get(sales, "/sales-orders")).GetProperty("items").EnumerateArray());
        Assert.Equal(HttpStatusCode.NotFound, (await sales.GetAsync($"/api/v1/quotes/{q.Id}")).StatusCode); Assert.Equal(HttpStatusCode.NotFound, (await sales.GetAsync($"/api/v1/sales-orders/{order}")).StatusCode);
        using var otherCompany = api.Authenticated(company: db.OtherCompany);
        Assert.Equal(HttpStatusCode.NotFound, (await otherCompany.GetAsync($"/api/v1/quotes/{q.Id}")).StatusCode); Assert.Equal(HttpStatusCode.NotFound, (await otherCompany.GetAsync($"/api/v1/sales-orders/{order}")).StatusCode);
        await using var scope = await db.SessionAsync(db.OtherCompany); Assert.Empty(await Sql.RowsAsync(scope, "SELECT id FROM inventory.stock_reservations WHERE company_id=@original", default, ("original", db.Company)));
    }
    [Fact]
    public async Task Sales_cannot_edit_another_owners_quote_or_use_unassigned_warehouse()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin); var id = await Create(admin, "/quotes", d.Draft());
        var staff = await Staff(db, "SALES", d); using var sales = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(sales, HttpMethod.Put, $"/quotes/{id}", d.Draft(), 1)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(sales, HttpMethod.Post, $"/quotes/{id}/submit", version: 1)).StatusCode);
        var unassigned = await Create(admin, "/warehouses", new WarehouseMaintenance(Code(), "Other warehouse"));
        Assert.Equal(HttpStatusCode.NotFound, (await Send(sales, HttpMethod.Post, "/quotes", d.Draft() with { WarehouseId = unassigned })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await sales.GetAsync($"/api/v1/inventory/availability?warehouseId={unassigned}")).StatusCode);
    }
    [Theory]
    [InlineData("WAREHOUSE")]
    [InlineData("PROCUREMENT")]
    [InlineData("FINANCE")]
    public async Task Non_sales_roles_cannot_create_or_approve_quotes(string role)
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin); var q = await Submitted(admin, d.Draft()); var staff = await Staff(db, role); using var c = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(c, HttpMethod.Post, "/quotes", d.Draft())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Approve(c, q.Id, q.Version)).StatusCode);
    }
    [Fact]
    public async Task Customer_hold_and_disabled_stock_location_block_conversion_without_side_effects()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var q = await Submitted(c, d.Draft());
        await Expect(await Send(c, HttpMethod.Patch, $"/customers/{d.Customer}/status", new CustomerState("ON_HOLD"), 1), HttpStatusCode.OK);
        var held = await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Conflict); Assert.Equal("customer_on_hold", held.GetProperty("code").GetString());
        await Expect(await Send(c, HttpMethod.Patch, $"/customers/{d.Customer}/status", new CustomerState("ACTIVE"), 2), HttpStatusCode.OK);
        var wh = await Get(c, $"/warehouses/{d.Warehouse}");
        await Expect(await Send(c, HttpMethod.Put, $"/warehouses/{d.Warehouse}", new WarehouseMaintenance(wh.GetProperty("code").GetString()!, "Disabled", Active: false), 1), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.NotFound, (await Approve(c, q.Id, q.Version)).StatusCode); Assert.Equal(0, await Reserved(c, d));
    }
    [Fact]
    public async Task Foreign_branch_and_expired_draft_and_missing_headers_are_rejected()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var other = await Setup(db, c);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(c, HttpMethod.Post, "/quotes", d.Draft() with { CustomerBranchId = other.Branch })).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/quotes", d.Draft() with { ExpiresOn = new DateOnly(2000, 1, 1) })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync("/api/v1/quotes", d.Draft())).StatusCode);
        var id = await Create(c, "/quotes", d.Draft()); Assert.Equal((HttpStatusCode)428, (await Send(c, HttpMethod.Post, $"/quotes/{id}/submit")).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/quotes", d.Draft() with { Lines = [new(d.BoxUnit, Quantity: 1, RequestedArea: 2)] })).StatusCode);
    }
    [Fact]
    public async Task Credit_and_stock_projections_cannot_be_edited_using_the_api_database_login()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var q = await Submitted(c, d.Draft()); await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created);
        await using var scope = await db.SessionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(scope, "UPDATE inventory.stock_balances SET reserved=0 WHERE company_id=@company AND warehouse_id=@warehouse RETURNING id", default, ("company", db.Company), ("warehouse", d.Warehouse)));
        Assert.Equal("42501", error.SqlState);
        await using var creditScope = await db.SessionAsync();
        var creditError = await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(creditScope, "UPDATE crm.customer_credit_exposures SET unbilled_orders=0 WHERE company_id=@company AND customer_id=@customer RETURNING id", default, ("company", db.Company), ("customer", d.Customer)));
        Assert.Equal("42501", creditError.SqlState);
    }
    [Fact]
    public async Task Non_stock_services_consume_credit_but_do_not_reserve_stock()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 0);
        var product = await Get(c, $"/products/{d.Product}");
        await Expect(await Send(c, HttpMethod.Put, $"/products/{d.Product}", new ProductMaintenance(product.GetProperty("sku").GetString()!, "Service", product.GetProperty("taxCodeId").GetGuid(), ItemType: "SERVICE", WholePacks: false), 1), HttpStatusCode.OK);
        var q = await Submitted(c, d.Draft()); await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Created);
        Assert.Equal(0, await Reserved(c, d)); Assert.Equal(48.4m, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
    }
    [Fact]
    public async Task Snapshot_does_not_expose_floor_and_client_totals_do_not_override_server_amounts()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin);
        await Create(admin, "/pricing/floors", new FloorMaintenance(d.BoxUnit, 18)); var staff = await Staff(db, "SALES", d); using var c = api.Authenticated(staff.Subject);
        var created = await Expect(await Send(c, HttpMethod.Post, "/quotes", new { customerId = d.Customer, customerBranchId = d.Branch, warehouseId = d.Warehouse, lines = new[] { new { productUnitId = d.BoxUnit, quantity = 2 } }, gross = 0, number = "Q-HACK" }), HttpStatusCode.Created);
        var id = created.GetProperty("id").GetGuid(); var detail = await Get(c, $"/quotes/{id}"); Assert.Equal(48.4m, D(detail.GetProperty("gross"))); Assert.DoesNotContain("\"floor", detail.GetRawText(), StringComparison.OrdinalIgnoreCase);
        var submitted = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1), HttpStatusCode.OK); Assert.NotEqual("Q-HACK", submitted.GetProperty("number").GetString());
    }

    [Fact]
    public async Task Host_disposal_releases_its_database_connection_pool()
    {
        var before = (long)(await db.OwnerScalarAsync("SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND usename='htt_app'"))!;
        for (var i = 0; i < 8; i++)
        {
            await using var api = new TestApi(db); using var c = api.Authenticated();
            await Get(c, "/foundation");
        }
        var after = (long)(await db.OwnerScalarAsync("SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND usename='htt_app'"))!;
        Assert.True(after <= before + 1, $"Disposed hosts must not leave pools open: before {before}, after {after}");
    }
}
