using System.Net;
using System.Net.Http.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SalesConcurrencyTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Parallel_submissions_of_different_quotes_allocate_unique_numbers()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c);
        var ids = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => Create(c, "/quotes", d.Draft())));
        var before = (long)(await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'", ("company", db.Company)))!;
        var submitted = await Task.WhenAll(ids.Select(id => Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1)));
        var docs = await Task.WhenAll(submitted.Select(r => Expect(r, HttpStatusCode.OK)));
        Assert.Equal(8, docs.Select(x => x.GetProperty("number").GetString()).Distinct().Count());
        Assert.Equal(before + 8, await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'", ("company", db.Company)));
    }
    [Fact]
    public async Task Same_key_concurrent_submit_and_create_return_one_result()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var key = Guid.NewGuid().ToString();
        var drafts = await Task.WhenAll(Enumerable.Range(0, 6).Select(_ => Send(c, HttpMethod.Post, "/quotes", d.Draft(), key: key)));
        var ids = (await Task.WhenAll(drafts.Select(r => Expect(r, HttpStatusCode.Created)))).Select(q => q.GetProperty("id").GetGuid()).Distinct().ToArray(); Assert.Single(ids);
        key = Guid.NewGuid().ToString(); var id = ids[0];
        var submitted = await Task.WhenAll(Enumerable.Range(0, 6).Select(_ => Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1, key: key)));
        var results = await Task.WhenAll(submitted.Select(r => Expect(r, HttpStatusCode.OK))); Assert.Single(results.Select(x => x.GetProperty("number").GetString()).Distinct());
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 2, key: key)).StatusCode);
    }
    [Fact]
    public async Task Two_office_users_converting_same_quote_create_one_order_and_commitment()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var d = await Setup(db, admin); var q = await Submitted(admin, d.Draft());
        var one = await Staff(db, "OFFICE"); var two = await Staff(db, "OFFICE"); using var a = api.Authenticated(one.Subject); using var b = api.Authenticated(two.Subject);
        var results = await Task.WhenAll(Approve(a, q.Id, q.Version), Approve(b, q.Id, q.Version));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.Created); Assert.Single(results, r => r.StatusCode == HttpStatusCode.OK);
        var ids = await Task.WhenAll(results.Select(r => r.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>())); Assert.Single(ids.Select(x => x.GetProperty("orderId").GetGuid()).Distinct());
        Assert.Equal(4.4m, await Reserved(admin, d)); Assert.Equal(48.4m, D((await Get(admin, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
        Assert.Equal(1L, await db.OwnerScalarAsync("SELECT count(*) FROM platform.approval_actions a JOIN platform.approval_requests r ON r.company_id=a.company_id AND r.id=a.request_id WHERE r.company_id=@company AND r.document_id=@id AND a.action='APPROVE'", ("company", db.Company), ("id", q.Id)));
    }
    [Fact]
    public async Task Different_customers_competing_for_last_stock_cannot_oversell()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var one = await Setup(db, c, 4.4m);
        var customer = await Create(c, "/customers", new CustomerDraft(Code(), "Second customer", null, 10000));
        var branch = await Create(c, $"/customers/{customer}/branches", new BranchMaintenance(Code(), "Other store", "20 Test Street", "Sydney", "NSW", "2000"));
        var two = one with { Customer = customer, Branch = branch };
        var q1 = await Submitted(c, one.Draft()); var q2 = await Submitted(c, two.Draft());
        var results = await Task.WhenAll(Approve(c, q1.Id, q1.Version), Approve(c, q2.Id, q2.Version));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.Created); Assert.Single(results, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(4.4m, await Reserved(c, one));
        var total = D((await Get(c, $"/customers/{one.Customer}/credit")).GetProperty("unbilledOrders")) + D((await Get(c, $"/customers/{two.Customer}/credit")).GetProperty("unbilledOrders")); Assert.Equal(48.4m, total);
    }
    [Fact]
    public async Task Same_customer_orders_competing_for_credit_cannot_exceed_limit()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 100, 60);
        var one = await Submitted(c, d.Draft()); var two = await Submitted(c, d.Draft());
        var results = await Task.WhenAll(Approve(c, one.Id, one.Version), Approve(c, two.Id, two.Version));
        Assert.Single(results, r => r.StatusCode == HttpStatusCode.Created); Assert.Single(results, r => r.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(48.4m, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("exposure"))); Assert.Equal(4.4m, await Reserved(c, d));
    }
    [Fact]
    public async Task Repeated_product_in_different_units_is_aggregated_before_reserving()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 4.4m);
        var q = await Submitted(c, d.Draft() with { Lines = [new(d.BaseUnit, Quantity: 2.2m), new(d.BoxUnit, Quantity: 2)] });
        var error = await Expect(await Approve(c, q.Id, q.Version), HttpStatusCode.Conflict); Assert.Equal("insufficient_stock", error.GetProperty("code").GetString());
        Assert.Equal(0, await Reserved(c, d)); Assert.Equal(0, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
    }
    [Fact]
    public async Task Advances_are_applied_once_against_cumulative_exposure_and_tax_is_included()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c, 100, 45);
        var q = await Submitted(c, d.Draft()); Assert.Equal(HttpStatusCode.Conflict, (await Approve(c, q.Id, q.Version)).StatusCode); // net 44 fits, tax-inclusive 48.4 does not
        await db.OwnerScalarAsync("UPDATE crm.customer_credit_exposures SET receivable=20,available_advances=30 WHERE company_id=@company AND customer_id=@id", ("company", db.Company), ("id", d.Customer));
        var key = Guid.NewGuid().ToString(); await Expect(await Approve(c, q.Id, q.Version, key), HttpStatusCode.Created);
        Assert.Equal(38.4m, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("exposure")));
        var q2 = await Submitted(c, d.Draft()); Assert.Equal(HttpStatusCode.Conflict, (await Approve(c, q2.Id, q2.Version)).StatusCode);
    }
    [Fact]
    public async Task Failure_after_reservation_rolls_back_order_sequence_approval_credit_and_stock()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var d = await Setup(db, c); var q = await Submitted(c, d.Draft());
        var sequence = await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SALES_ORDER'", ("company", db.Company));
        var function = "test_fail_" + Guid.NewGuid().ToString("N");
        await db.OwnerScalarAsync($"CREATE FUNCTION sales.{function}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.customer_id='{d.Customer}'::uuid THEN RAISE EXCEPTION 'Injected failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER {function} BEFORE INSERT ON sales.credit_decisions FOR EACH ROW EXECUTE FUNCTION sales.{function}()");
        var key = Guid.NewGuid().ToString();
        try
        {
            Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Approve(c, q.Id, q.Version, key)).StatusCode);
            Assert.Equal(0, await Reserved(c, d)); Assert.Equal(0, D((await Get(c, $"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
            Assert.Equal("SUBMITTED", (await Get(c, $"/quotes/{q.Id}")).GetProperty("status").GetString());
            Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM sales.orders WHERE company_id=@company AND source_quote_id=@id", ("company", db.Company), ("id", q.Id)));
            Assert.Equal(sequence, await db.OwnerScalarAsync("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SALES_ORDER'", ("company", db.Company)));
        }
        finally { await db.OwnerScalarAsync($"DROP TRIGGER {function} ON sales.credit_decisions;DROP FUNCTION sales.{function}()"); }
        await Expect(await Approve(c, q.Id, q.Version, key), HttpStatusCode.Created);
    }
}
