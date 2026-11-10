using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Xunit;

namespace Htt.IntegrationTests;

internal sealed record SalesData(Guid Customer, Guid Branch, Guid Warehouse, Guid Product, Guid BaseUnit, Guid BoxUnit, decimal BoxPrice = 22m)
{
    public QuoteInput Draft(decimal boxes = 2) => new(Customer, Branch, Warehouse, [new(BoxUnit, Quantity: boxes)]);
}
internal static class SalesFlowSupport
{
    public static string Code() => "B" + Guid.NewGuid().ToString("N")[..12];
    public static decimal D(JsonElement e) => e.ValueKind == JsonValueKind.String ? decimal.Parse(e.GetString()!, System.Globalization.CultureInfo.InvariantCulture) : e.GetDecimal();
    public static async Task<HttpResponseMessage> Send(HttpClient c, HttpMethod method, string path, object? body = null, long? version = null, string? key = null)
    {
        using var request = new HttpRequestMessage(method, "/api/v1" + path);
        if (body is not null) request.Content = JsonContent.Create(body, body.GetType());
        request.Headers.Add("Idempotency-Key", key ?? Guid.NewGuid().ToString());
        if (version is { } v) request.Headers.TryAddWithoutValidation("If-Match", $"\"{v}\"");
        return await c.SendAsync(request);
    }
    public static async Task<JsonElement> Expect(HttpResponseMessage response, HttpStatusCode status)
    {
        var json = await response.Content.ReadAsStringAsync(); Assert.True(response.StatusCode == status, $"Expected {status}, got {response.StatusCode}: {json}");
        return JsonDocument.Parse(json).RootElement.Clone();
    }
    public static Task<JsonElement> Get(HttpClient c, string path) => c.GetFromJsonAsync<JsonElement>("/api/v1" + path);
    public static async Task<Guid> Create(HttpClient c, string path, object body) => (await Expect(await Send(c, HttpMethod.Post, path, body), HttpStatusCode.Created)).GetProperty("id").GetGuid();
    public static async Task<(Guid Id, long Version)> Submitted(HttpClient c, QuoteInput draft)
    {
        var id = await Create(c, "/quotes", draft);
        var submitted = await Expect(await Send(c, HttpMethod.Post, $"/quotes/{id}/submit", version: 1), HttpStatusCode.OK);
        return (id, submitted.GetProperty("version").GetInt64());
    }
    public static Task<HttpResponseMessage> Approve(HttpClient c, Guid id, long version, string? key = null) => Send(c, HttpMethod.Post, $"/quotes/{id}/approve-and-convert", new ReviewInput("Office reviewed"), version, key);
    public static async Task<SalesData> Setup(DatabaseFixture db, HttpClient admin, decimal onHand = 22, decimal credit = 10000)
    {
        var customer = await Create(admin, "/customers", new CustomerDraft(Code(), "Stage B customer", null, credit));
        var branch = await Create(admin, $"/customers/{customer}/branches", new BranchMaintenance(Code(), "Sydney store", "10 Test Street", "Sydney", "NSW", "2000"));
        var warehouse = await Create(admin, "/warehouses", new WarehouseMaintenance(Code(), "Sales warehouse"));
        var f = await Get(admin, "/foundation"); var units = f.GetProperty("units").EnumerateArray().ToArray();
        var m2 = units.Single(u => u.GetProperty("code").GetString() == "M2").GetProperty("id").GetGuid();
        var box = units.Single(u => u.GetProperty("code").GetString() == "BOX").GetProperty("id").GetGuid();
        var tax = f.GetProperty("taxCodes").EnumerateArray().Single(t => t.GetProperty("code").GetString() == "GST").GetProperty("id").GetGuid();
        var product = await Create(admin, "/products", new ProductDraft(Code(), "Stage B floor", m2, tax, true, [new(m2, 1, 0.000001m), new(box, 2.2m)]));
        var pu = (await Get(admin, $"/products/{product}/units")).EnumerateArray().ToArray();
        var baseUnit = pu.Single(u => u.GetProperty("uomId").GetGuid() == m2).GetProperty("id").GetGuid();
        var boxUnit = pu.Single(u => u.GetProperty("uomId").GetGuid() == box).GetProperty("id").GetGuid();
        var start = DateTimeOffset.UtcNow.AddHours(-1);
        await Create(admin, "/pricing/standard-prices", new StandardPriceMaintenance(baseUnit, 10, start));
        await Create(admin, "/pricing/standard-prices", new StandardPriceMaintenance(boxUnit, 22, start));
        if (onHand > 0) await StockOpening.InitializeAsync(db.Owner, db.Company, warehouse, product, onHand, "test opening", DatabaseFixture.Issuer, db.Subject);
        return new(customer, branch, warehouse, product, baseUnit, boxUnit);
    }
    public static async Task<(string Subject, Guid Membership)> Staff(DatabaseFixture db, string role, SalesData? assignment = null)
    {
        var subject = "b-staff-" + Guid.NewGuid();
        var membership = (Guid)(await db.OwnerScalarAsync("""
            WITH u AS(INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@subject,'Stage B staff') RETURNING id),
            m AS(INSERT INTO identity.memberships(company_id,user_id) SELECT @company,id FROM u RETURNING id),
            link AS(INSERT INTO identity.membership_roles(company_id,membership_id,role_id) SELECT @company,m.id,r.id FROM m JOIN identity.roles r ON r.company_id=@company AND r.code=@role RETURNING membership_id)
            SELECT membership_id FROM link
            """, ("issuer", DatabaseFixture.Issuer), ("subject", subject), ("company", db.Company), ("role", role)))!;
        if (assignment is { } d) await db.OwnerScalarAsync("INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id) VALUES(@company,@membership,@customer);INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@membership,@warehouse)", ("company", db.Company), ("membership", membership), ("customer", d.Customer), ("warehouse", d.Warehouse));
        return (subject, membership);
    }
    public static async Task<decimal> Reserved(HttpClient c, SalesData d)
    {
        var rows = (await Get(c, $"/inventory/availability?warehouseId={d.Warehouse}&productId={d.Product}")).GetProperty("items");
        return rows.GetArrayLength() == 0 ? 0 : D(rows[0].GetProperty("reserved"));
    }
}
