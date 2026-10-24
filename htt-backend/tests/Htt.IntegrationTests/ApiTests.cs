using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Htt.Host.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace Htt.IntegrationTests;

public sealed class TestApi(DatabaseFixture db) : WebApplicationFactory<Program>
{
    public static readonly SymmetricSecurityKey Key = new(Encoding.UTF8.GetBytes("test-only-signing-material-at-least-32-bytes-long"));
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:Database", db.App);
        builder.UseSetting("Authentication:Authority", DatabaseFixture.Issuer);
        builder.UseSetting("Authentication:Audience", "htt-test-api");
        builder.ConfigureServices(services => services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(new() { Issuer = DatabaseFixture.Issuer });
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = DatabaseFixture.Issuer,
                ValidateAudience = true, ValidAudience = "htt-test-api", ValidateLifetime = true,
                ValidateIssuerSigningKey = true, IssuerSigningKey = Key, ClockSkew = TimeSpan.Zero
            };
        }));
    }

    public HttpClient Authenticated(string? subject = null, string? audience = null, Guid? company = null)
    {
        // Sign a fresh short-lived token per request so host sleep does not expire an entire test workflow.
        var client = CreateDefaultClient(new TestTokenHandler(subject ?? db.Subject, audience ?? "htt-test-api"));
        client.DefaultRequestHeaders.Add("X-Company-Id", (company ?? db.Company).ToString());
        return client;
    }

    private sealed class TestTokenHandler(string subject, string audience) : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var token = new JwtSecurityToken(DatabaseFixture.Issuer, audience,
                [new Claim("sub", subject)], notBefore: now.AddMinutes(-1), expires: now.AddMinutes(5),
                signingCredentials: new SigningCredentials(Key, SecurityAlgorithms.HmacSha256));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
            return base.SendAsync(request, cancellationToken);
        }
    }
}

public sealed class ApiTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Api_rejects_unsigned_wrong_audience_and_unknown_company_access()
    {
        await using var app = new TestApi(db);
        using var anonymous = app.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health/ready")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/v1/customers")).StatusCode);
        var unsigned = new JwtSecurityToken(DatabaseFixture.Issuer,"htt-test-api",[new Claim("sub",db.Subject)],expires:DateTime.UtcNow.AddMinutes(5));
        anonymous.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",new JwtSecurityTokenHandler().WriteToken(unsigned));
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/v1/customers")).StatusCode);
        using var wrongAudience = app.Authenticated(audience: "other-client");
        Assert.Equal(HttpStatusCode.Unauthorized, (await wrongAudience.GetAsync("/api/v1/customers")).StatusCode);
        using var unknown = app.Authenticated(subject: "unregistered");
        Assert.Equal(HttpStatusCode.Forbidden, (await unknown.GetAsync("/api/v1/customers")).StatusCode);
        using var crossCompany = app.Authenticated(company: Guid.NewGuid());
        Assert.Equal(HttpStatusCode.Forbidden, (await crossCompany.GetAsync("/api/v1/customers")).StatusCode);
    }

    [Fact]
    public async Task Signed_expired_token_is_rejected()
    {
        await using var app = new TestApi(db); using var client = app.CreateClient();
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(DatabaseFixture.Issuer, "htt-test-api", [new Claim("sub", db.Subject)],
            notBefore: now.AddMinutes(-10), expires: now.AddMinutes(-5),
            signingCredentials: new SigningCredentials(TestApi.Key, SecurityAlgorithms.HmacSha256));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        client.DefaultRequestHeaders.Add("X-Company-Id", db.Company.ToString());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/customers")).StatusCode);
    }

    [Fact]
    public async Task Customer_commands_replay_and_validate_optimistic_version()
    {
        await using var app = new TestApi(db);
        using var client = app.Authenticated();
        var key = Guid.NewGuid().ToString();
        client.DefaultRequestHeaders.Add("Idempotency-Key", key);
        var input = new CustomerDraft("C" + Guid.NewGuid().ToString("N")[..12], "Customer one", "51824753556", 1000, 30);
        var first = await client.PostAsJsonAsync("/api/v1/customers", input);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var id = (await first.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        var second = await client.PostAsJsonAsync("/api/v1/customers", input);
        Assert.Equal(id, (await second.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid());
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/v1/customers", input with { LegalName = "Changed" })).StatusCode);
        client.DefaultRequestHeaders.Remove("Idempotency-Key");
        client.DefaultRequestHeaders.Add("Idempotency-Key", Guid.NewGuid().ToString());
        client.DefaultRequestHeaders.IfMatch.Add(new EntityTagHeaderValue("\"1\""));
        var update = await client.PatchAsJsonAsync($"/api/v1/customers/{id}/status", new CustomerState("ON_HOLD"));
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        client.DefaultRequestHeaders.Remove("Idempotency-Key");
        client.DefaultRequestHeaders.Add("Idempotency-Key", Guid.NewGuid().ToString());
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/v1/customers/{id}/status", new CustomerState("ACTIVE"))).StatusCode);
        var list = await client.GetFromJsonAsync<JsonElement>("/api/v1/customers?search=" + input.Code);
        Assert.Equal("ON_HOLD", list.GetProperty("items")[0].GetProperty("status").GetString());
        Assert.Equal("1000.00", list.GetProperty("items")[0].GetProperty("creditLimit").GetString());
    }

    [Fact]
    public async Task Product_failure_rolls_back_and_successful_units_keep_base_conversion()
    {
        await using var app = new TestApi(db);
        using var client = app.Authenticated();
        var setup = await client.GetFromJsonAsync<JsonElement>("/api/v1/foundation");
        var units = setup.GetProperty("units").EnumerateArray().ToArray();
        var baseId = units.Single(u => u.GetProperty("code").GetString() == "M2").GetProperty("id").GetGuid();
        var boxId = units.Single(u => u.GetProperty("code").GetString() == "BOX").GetProperty("id").GetGuid();
        var tax = setup.GetProperty("taxCodes").EnumerateArray().Single(u => u.GetProperty("code").GetString() == "GST").GetProperty("id").GetGuid();
        var sku = "P" + Guid.NewGuid().ToString("N")[..12];
        client.DefaultRequestHeaders.Add("Idempotency-Key", Guid.NewGuid().ToString());
        var draft = new ProductDraft(sku, "Test floor", baseId, tax, true, [new(baseId, 1), new(boxId, 2.2m)]);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await client.PostAsJsonAsync("/api/v1/products", draft with { TaxCodeId = Guid.NewGuid() })).StatusCode);
        Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM catalog.products WHERE company_id=@company AND sku=@sku", ("company", db.Company), ("sku", sku)));
        var created = await client.PostAsJsonAsync("/api/v1/products", draft);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        var found = await client.GetFromJsonAsync<JsonElement>($"/api/v1/products/{id}/units");
        Assert.Equal(2, found.GetArrayLength());
        Assert.Contains(found.EnumerateArray(), u => u.GetProperty("conversionToBase").GetString() == "2.200000");
    }

    [Fact]
    public async Task Sales_cannot_write_customers_or_read_unassigned_customer_rows()
    {
        var subject = "sales-" + Guid.NewGuid();
        await db.OwnerScalarAsync("""
            WITH u AS (INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@subject,'Sales') RETURNING id),
            m AS (INSERT INTO identity.memberships(company_id,user_id) SELECT @company,id FROM u RETURNING id)
            INSERT INTO identity.membership_roles(company_id,membership_id,role_id)
            SELECT @company,m.id,r.id FROM m JOIN identity.roles r ON r.company_id=@company AND r.code='SALES' RETURNING id
            """, ("issuer", DatabaseFixture.Issuer), ("subject", subject), ("company", db.Company));
        await using var app = new TestApi(db);
        using var client = app.Authenticated(subject);
        var result = await client.GetFromJsonAsync<JsonElement>("/api/v1/customers");
        Assert.Empty(result.GetProperty("items").EnumerateArray());
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/customers", new CustomerDraft("NO", "No", null))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/accounting/accounts")).StatusCode);
    }

    [Fact]
    public async Task Price_resolves_customer_promotion_and_floor_using_server_time()
    {
        await using var app = new TestApi(db);
        using var client = app.Authenticated();
        var setup = await client.GetFromJsonAsync<JsonElement>("/api/v1/foundation");
        var uom = setup.GetProperty("units").EnumerateArray().Single(u => u.GetProperty("code").GetString()=="M2").GetProperty("id").GetGuid();
        var tax = setup.GetProperty("taxCodes").EnumerateArray().Single(t => t.GetProperty("code").GetString()=="GST").GetProperty("id").GetGuid();
        client.DefaultRequestHeaders.Add("Idempotency-Key",Guid.NewGuid().ToString());
        var customerResponse = await client.PostAsJsonAsync("/api/v1/customers",new CustomerDraft("C"+Guid.NewGuid().ToString("N")[..12],"Price customer",null));
        var customer=(await customerResponse.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        client.DefaultRequestHeaders.Remove("Idempotency-Key");
        client.DefaultRequestHeaders.Add("Idempotency-Key",Guid.NewGuid().ToString());
        var productResponse=await client.PostAsJsonAsync("/api/v1/products",new ProductDraft("P"+Guid.NewGuid().ToString("N")[..12],"Price floor",uom,tax,true,[new(uom,1)]));
        var product=(await productResponse.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        var unit=(Guid)(await db.OwnerScalarAsync("SELECT id FROM catalog.product_units WHERE company_id=@company AND product_id=@product",("company",db.Company),("product",product)))!;
        await db.OwnerScalarAsync("""
            INSERT INTO pricing.price_list_items(company_id,price_list_id,product_unit_id,amount,effective_from)
            SELECT @company,id,@unit,100,now()-interval '1 day' FROM pricing.price_lists WHERE company_id=@company AND code='STANDARD';
            INSERT INTO pricing.customer_price_rules(company_id,customer_id,product_unit_id,method,fixed_price,effective_from)
            VALUES(@company,@customer,@unit,'FIXED_PRICE',90,now()-interval '1 day');
            WITH p AS(INSERT INTO pricing.promotions(company_id,name,starts_at,ends_at)
            VALUES(@company,'Expired',now()-interval '2 days',now()-interval '1 day') RETURNING id)
            INSERT INTO pricing.promotion_items(company_id,promotion_id,product_unit_id,amount) SELECT @company,id,@unit,50 FROM p;
            """,("company",db.Company),("customer",customer),("unit",unit));
        var path=$"/api/v1/pricing/resolve?customerId={customer}&productUnitId={unit}";
        var price=await client.GetFromJsonAsync<JsonElement>(path);
        Assert.Equal("CUSTOMER",price.GetProperty("source").GetString());
        Assert.Equal(90m,decimal.Parse(price.GetProperty("unitPrice").GetString()!,System.Globalization.CultureInfo.InvariantCulture));
        await db.OwnerScalarAsync("""
            WITH p AS(INSERT INTO pricing.promotions(company_id,name,starts_at,ends_at)
            VALUES(@company,'Active',now()-interval '1 hour',now()+interval '1 hour') RETURNING id)
            INSERT INTO pricing.promotion_items(company_id,promotion_id,product_unit_id,amount) SELECT @company,id,@unit,80 FROM p
            """,("company",db.Company),("unit",unit));
        var promotional=await client.GetFromJsonAsync<JsonElement>(path);
        Assert.Equal("PROMOTION",promotional.GetProperty("source").GetString());
        await db.OwnerScalarAsync("INSERT INTO pricing.price_floor_rules(company_id,product_unit_id,amount) VALUES(@company,@unit,85)",("company",db.Company),("unit",unit));
        Assert.Equal(HttpStatusCode.UnprocessableEntity,(await client.GetAsync(path)).StatusCode);
    }
}
