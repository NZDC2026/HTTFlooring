using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Xunit;

namespace Htt.IntegrationTests;

public sealed class MasterDataApiTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private static string Code() => "T" + Guid.NewGuid().ToString("N")[..12];
    private static async Task<HttpResponseMessage> Send(HttpClient c, HttpMethod method, string path, object input, long? version = null, string? key = null)
    {
        using var request = new HttpRequestMessage(method, "/api/v1" + path) { Content = JsonContent.Create(input, input.GetType()) };
        request.Headers.Add("Idempotency-Key", key ?? Guid.NewGuid().ToString());
        if (version is { } v) request.Headers.TryAddWithoutValidation("If-Match", $"\"{v}\"");
        return await c.SendAsync(request);
    }
    private static async Task<JsonElement> Ok(HttpResponseMessage response, HttpStatusCode status)
    {
        var content = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == status, $"Expected {status}, got {response.StatusCode}: {content}");
        return JsonDocument.Parse(content).RootElement.Clone();
    }
    private static async Task<Guid> Create(HttpClient c, string path, object input) =>
        (await Ok(await Send(c, HttpMethod.Post, path, input), HttpStatusCode.Created)).GetProperty("id").GetGuid();
    private static Task<JsonElement> Get(HttpClient c, string path) => c.GetFromJsonAsync<JsonElement>("/api/v1" + path);
    private static async Task<Guid> Customer(HttpClient c) => await Create(c, "/customers", new CustomerDraft(Code(), "Test customer", null));
    private static BranchMaintenance Branch(string? code = null) => new(code ?? Code(), "Sydney store", "10 Test Street", "Sydney", "NSW", "2000");
    private static async Task<(Guid Product, Guid BaseUnit, Guid BoxUnit, Guid M2, Guid Box, Guid Tax)> Product(HttpClient c)
    {
        var f = await Get(c, "/foundation");
        var units = f.GetProperty("units").EnumerateArray().ToArray();
        var m2 = units.Single(u => u.GetProperty("code").GetString() == "M2").GetProperty("id").GetGuid();
        var box = units.Single(u => u.GetProperty("code").GetString() == "BOX").GetProperty("id").GetGuid();
        var tax = f.GetProperty("taxCodes").EnumerateArray().Single(u => u.GetProperty("code").GetString() == "GST").GetProperty("id").GetGuid();
        var id = await Create(c, "/products", new ProductDraft(Code(), "Floor", m2, tax, true, [new(m2, 1), new(box, 2.2m)]));
        var productUnits = (await Get(c, $"/products/{id}/units")).EnumerateArray().ToArray();
        return (id, productUnits.Single(u => u.GetProperty("uomId").GetGuid() == m2).GetProperty("id").GetGuid(), productUnits.Single(u => u.GetProperty("uomId").GetGuid() == box).GetProperty("id").GetGuid(), m2, box, tax);
    }
    private async Task<(string Subject, Guid Membership)> Staff(string role)
    {
        var subject = "staff-" + Guid.NewGuid();
        var membership = (Guid)(await db.OwnerScalarAsync("""
            WITH u AS(INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@subject,'Test staff') RETURNING id),
            m AS(INSERT INTO identity.memberships(company_id,user_id) SELECT @company,id FROM u RETURNING id),
            link AS(INSERT INTO identity.membership_roles(company_id,membership_id,role_id)
             SELECT @company,m.id,r.id FROM m JOIN identity.roles r ON r.company_id=@company AND r.code=@role RETURNING membership_id)
            SELECT membership_id FROM link
            """, ("issuer", DatabaseFixture.Issuer), ("subject", subject), ("company", db.Company), ("role", role)))!;
        return (subject, membership);
    }

    [Fact]
    public async Task Branches_and_contacts_support_edit_disable_and_audited_link_replacement()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated();
        var customer = await Customer(c);
        var first = await Create(c, $"/customers/{customer}/branches", Branch());
        var second = await Create(c, $"/customers/{customer}/branches", Branch());
        var draft = new ContactMaintenance("Accounts person", "accounts@example.test", "+61 2 9000 0000", IsAccounting: true, BranchIds: [first, second]);
        var contact = await Create(c, $"/customers/{customer}/contacts", draft);
        var detail = await Get(c, $"/customers/{customer}/contacts/{contact}"); Assert.Equal(2, detail.GetProperty("branchIds").GetArrayLength());
        await Ok(await Send(c, HttpMethod.Put, $"/customers/{customer}/contacts/{contact}", draft with { Name = "Updated", BranchIds = [second], Active = false }, 1), HttpStatusCode.OK);
        detail = await Get(c, $"/customers/{customer}/contacts/{contact}"); Assert.False(detail.GetProperty("active").GetBoolean()); Assert.Single(detail.GetProperty("branchIds").EnumerateArray());
        await Ok(await Send(c, HttpMethod.Put, $"/customers/{customer}/branches/{first}", Branch() with { Active = false }, 1), HttpStatusCode.OK);
        Assert.False((await Get(c, $"/customers/{customer}/branches/{first}")).GetProperty("active").GetBoolean());
        var audit = (string)(await db.OwnerScalarAsync("SELECT details::text FROM platform.audit_events WHERE company_id=@company AND entity_id=@id ORDER BY created_at DESC LIMIT 1", ("company", db.Company), ("id", contact)))!;
        Assert.Contains("branchIds", audit); Assert.Contains("Updated", audit);
    }

    [Fact]
    public async Task Foreign_customer_branch_link_rolls_back_contact_and_idempotency_record()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated();
        var one = await Customer(c); var two = await Customer(c); var wrong = await Create(c, $"/customers/{two}/branches", Branch());
        var key = Guid.NewGuid().ToString(); var draft = new ContactMaintenance("Wrong branch", BranchIds: [wrong]);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(c, HttpMethod.Post, $"/customers/{one}/contacts", draft, key: key)).StatusCode);
        Assert.Empty((await Get(c, $"/customers/{one}/contacts")).GetProperty("items").EnumerateArray());
        await Ok(await Send(c, HttpMethod.Post, $"/customers/{one}/contacts", draft with { BranchIds = [] }, key: key), HttpStatusCode.Created);
    }

    [Theory]
    [InlineData("postcode", "12")]
    [InlineData("postcode", "")]
    [InlineData("state", "NZ")]
    [InlineData("country", "AUS")]
    [InlineData("name", " ")]
    [InlineData("code", "bad code!")]
    public async Task Invalid_branch_input_returns_field_errors_and_no_writes(string field, string value)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var customer = await Customer(c);
        var d = Branch(); d = field switch { "postcode" => d with { Postcode = value }, "state" => d with { State = value }, "country" => d with { Country = value }, "name" => d with { Name = value }, _ => d with { Code = value } };
        var error = await Ok(await Send(c, HttpMethod.Post, $"/customers/{customer}/branches", d), HttpStatusCode.UnprocessableEntity);
        Assert.True(error.GetProperty("fieldErrors").TryGetProperty(field, out _));
        Assert.Empty((await Get(c, $"/customers/{customer}/branches")).GetProperty("items").EnumerateArray());
    }

    [Theory]
    [InlineData("email", "not-an-email")]
    [InlineData("phone", "abc")]
    [InlineData("mobile", "no-number")]
    public async Task Invalid_contact_channels_rejected(string field, string value)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var customer = await Customer(c);
        var d = new ContactMaintenance("Person"); d = field switch { "email" => d with { Email = value }, "phone" => d with { Phone = value }, _ => d with { Mobile = value } };
        var error = await Ok(await Send(c, HttpMethod.Post, $"/customers/{customer}/contacts", d), HttpStatusCode.UnprocessableEntity);
        Assert.True(error.GetProperty("fieldErrors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task Supplier_lifecycle_and_contacts_do_not_require_owner_SQL()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated();
        var draft = new SupplierMaintenance(Code(), "Supplier", "51824753556", 45);
        var supplier = await Create(c, "/suppliers", draft);
        var contact = await Create(c, $"/suppliers/{supplier}/contacts", new ContactMaintenance("Supplier accounts", "supplier@example.test"));
        Assert.Equal("Supplier accounts", (await Get(c, $"/suppliers/{supplier}/contacts/{contact}")).GetProperty("name").GetString());
        await Ok(await Send(c, HttpMethod.Put, $"/suppliers/{supplier}", draft with { LegalName = "Updated supplier", Status = "INACTIVE" }, 1), HttpStatusCode.OK);
        Assert.Equal("INACTIVE", (await Get(c, $"/suppliers/{supplier}")).GetProperty("status").GetString());
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/suppliers", draft with { Code = Code(), Abn = "11111111111" })).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/suppliers", draft with { Code = Code(), PaymentTermsDays = -1 })).StatusCode);
    }

    [Fact]
    public async Task Sales_reads_only_assigned_customer_branches_and_contacts()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated();
        var own = await Customer(admin); var other = await Customer(admin); var branch = await Create(admin, $"/customers/{other}/branches", Branch());
        var contact = await Create(admin, $"/customers/{other}/contacts", new ContactMaintenance("Other person", BranchIds: [branch]));
        var staff = await Staff("SALES");
        await db.OwnerScalarAsync("INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id) VALUES(@company,@membership,@customer)", ("company", db.Company), ("membership", staff.Membership), ("customer", own));
        using var sales = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.OK, (await sales.GetAsync($"/api/v1/customers/{own}/branches")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await sales.GetAsync($"/api/v1/customers/{other}/branches/{branch}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await sales.GetAsync($"/api/v1/customers/{other}/contacts/{contact}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(sales, HttpMethod.Post, $"/customers/{own}/contacts", new ContactMaintenance("No"))).StatusCode);
    }

    [Theory]
    [InlineData("SALES", "/suppliers")]
    [InlineData("WAREHOUSE", "/suppliers")]
    [InlineData("PROCUREMENT", "/customers")]
    [InlineData("OFFICE", "/pricing/floors")]
    [InlineData("FINANCE", "/pricing/standard-prices")]
    public async Task Role_matrix_denies_ungranted_maintenance_reads(string role, string path)
    {
        await using var api = new TestApi(db); var staff = await Staff(role); using var c = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await c.GetAsync("/api/v1" + path)).StatusCode);
    }

    [Fact]
    public async Task Office_can_maintain_customer_but_not_raise_credit_or_release_finance_hold()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var id = await Customer(admin);
        var detail = await Get(admin, $"/customers/{id}"); var code = detail.GetProperty("code").GetString()!;
        var staff = await Staff("OFFICE"); using var office = api.Authenticated(staff.Subject);
        var draft = new CustomerMaintenance(code, "Office updated", null, "ACTIVE", 0, 30);
        await Ok(await Send(office, HttpMethod.Put, $"/customers/{id}", draft, 1), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(office, HttpMethod.Put, $"/customers/{id}", draft with { CreditLimit = 1000 }, 2)).StatusCode);
        await Ok(await Send(admin, HttpMethod.Put, $"/customers/{id}", draft with { Status = "ON_HOLD" }, 2), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(office, HttpMethod.Patch, $"/customers/{id}/status", new CustomerState("ACTIVE"), 3)).StatusCode);
    }

    [Fact]
    public async Task Warehouse_scope_edit_and_repurpose_protection()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated();
        var region = await Create(admin, "/regions", new LookupMaintenance(Code(), "NSW"));
        var draft = new WarehouseMaintenance(Code(), "Warehouse", region);
        var one = await Create(admin, "/warehouses", draft); var two = await Create(admin, "/warehouses", draft with { Code = Code() });
        var staff = await Staff("WAREHOUSE");
        await db.OwnerScalarAsync("INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@membership,@warehouse)", ("company", db.Company), ("membership", staff.Membership), ("warehouse", one));
        using var warehouse = api.Authenticated(staff.Subject);
        Assert.Single((await Get(warehouse, "/warehouses")).GetProperty("items").EnumerateArray());
        Assert.Equal(HttpStatusCode.NotFound, (await warehouse.GetAsync($"/api/v1/warehouses/{two}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(warehouse, HttpMethod.Put, $"/warehouses/{one}", draft, 1)).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(admin, HttpMethod.Put, $"/warehouses/{one}", draft with { Kind = "QUARANTINE" }, 1)).StatusCode);
        await Ok(await Send(admin, HttpMethod.Put, $"/warehouses/{one}", draft with { Active = false }, 1), HttpStatusCode.OK);
    }

    [Fact]
    public async Task Product_metadata_units_and_used_conversion_protection()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c);
        var category = await Create(c, "/product-categories", new LookupMaintenance(Code(), "Timber"));
        var updated = new ProductMaintenance(Code(), "Updated floor", p.Tax, category, ReorderPoint: 20);
        await Ok(await Send(c, HttpMethod.Put, $"/products/{p.Product}", updated, 1), HttpStatusCode.OK);
        Assert.Equal(category, (await Get(c, $"/products/{p.Product}")).GetProperty("categoryId").GetGuid());
        var uom = await Create(c, "/uoms", new LookupMaintenance(Code(), "Pallet"));
        var unit = await Create(c, $"/products/{p.Product}/units", new ProductUnitMaintenance(uom, 20));
        await Ok(await Send(c, HttpMethod.Put, $"/products/{p.Product}/units/{unit}", new ProductUnitMaintenance(uom, 22), 1), HttpStatusCode.OK);
        await Create(c, "/pricing/standard-prices", new StandardPriceMaintenance(unit, 100, DateTimeOffset.UtcNow.AddHours(-1)));
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Put, $"/products/{p.Product}/units/{unit}", new ProductUnitMaintenance(uom, 23), 2)).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Put, $"/products/{p.Product}/units/{p.BaseUnit}", new ProductUnitMaintenance(p.M2, 2), 1)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Put, $"/uoms/{uom}", new LookupMaintenance(Code(), "Pallet", false), 1)).StatusCode);
    }

    [Fact]
    public async Task Prices_can_be_managed_end_to_end_with_schedule_overlap_floor_and_deactivation()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c); var customer = await Customer(c);
        var now = DateTimeOffset.UtcNow; var start = now.AddHours(-1); var end = now.AddHours(2);
        var floor = await Create(c, "/pricing/floors", new FloorMaintenance(p.BaseUnit, 60));
        var standard = new StandardPriceMaintenance(p.BaseUnit, 100, start, end); var standardId = await Create(c, "/pricing/standard-prices", standard);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/pricing/standard-prices", standard with { EffectiveFrom = now })).StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Send(c, HttpMethod.Post, "/pricing/standard-prices", standard with { EffectiveFrom = end, EffectiveTo = end.AddHours(1), Amount = 50 })).StatusCode);
        var rule = new CustomerPriceMaintenance(customer, p.BaseUnit, "DISCOUNT_PERCENT", null, 10, start, end); var ruleId = await Create(c, "/pricing/customer-prices", rule);
        var promotion = new PromotionMaintenance("Test promo", start, end, [new(p.BaseUnit, 80)]); var promotionId = await Create(c, "/pricing/promotions", promotion);
        var path = $"/pricing/resolve?customerId={customer}&productUnitId={p.BaseUnit}";
        Assert.Equal("PROMOTION", (await Get(c, path)).GetProperty("source").GetString());
        await Ok(await Send(c, HttpMethod.Put, $"/pricing/promotions/{promotionId}", promotion with { Active = false }, 1), HttpStatusCode.OK);
        Assert.Equal("CUSTOMER", (await Get(c, path)).GetProperty("source").GetString());
        await Ok(await Send(c, HttpMethod.Put, $"/pricing/customer-prices/{ruleId}", rule with { Active = false }, 1), HttpStatusCode.OK);
        Assert.Equal("STANDARD", (await Get(c, path)).GetProperty("source").GetString());
        await Ok(await Send(c, HttpMethod.Put, $"/pricing/standard-prices/{standardId}", standard with { Active = false }, 1), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await c.GetAsync("/api/v1" + path)).StatusCode);
        await Create(c, "/pricing/standard-prices", standard with { Amount = 110 }); // Inactive interval no longer blocks replacement.
        await Ok(await Send(c, HttpMethod.Put, $"/pricing/floors/{floor}", new FloorMaintenance(p.BaseUnit, 60, false), 1), HttpStatusCode.OK);
    }

    [Fact]
    public async Task Invalid_promotion_item_rolls_back_entire_edit_and_old_items_remain()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c);
        var draft = new PromotionMaintenance("Original", DateTimeOffset.UtcNow.AddHours(-1), DateTimeOffset.UtcNow.AddHours(1), [new(p.BaseUnit, 50)]);
        var id = await Create(c, "/pricing/promotions", draft);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(c, HttpMethod.Put, $"/pricing/promotions/{id}", draft with { Name = "Wrong", Items = [new(Guid.NewGuid(), 30)] }, 1)).StatusCode);
        var detail = await Get(c, $"/pricing/promotions/{id}"); Assert.Equal("Original", detail.GetProperty("promotion").GetProperty("name").GetString()); Assert.Equal(1, detail.GetProperty("promotion").GetProperty("version").GetInt64());
        await Ok(await Send(c, HttpMethod.Put, $"/pricing/promotions/{id}", draft with { Items = [new(p.BoxUnit, 60)] }, 1), HttpStatusCode.OK);
        detail = await Get(c, $"/pricing/promotions/{id}"); Assert.Equal(2, detail.GetProperty("items").GetArrayLength()); Assert.Single(detail.GetProperty("items").EnumerateArray(), x => x.GetProperty("active").GetBoolean());
    }

    [Fact]
    public async Task Updates_require_version_replay_same_result_and_prevent_lost_updates()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated();
        var original = new SupplierMaintenance(Code(), "Original", null); var id = await Create(c, "/suppliers", original);
        Assert.Equal((HttpStatusCode)428, (await Send(c, HttpMethod.Put, $"/suppliers/{id}", original)).StatusCode);
        var key = Guid.NewGuid().ToString(); var updated = original with { LegalName = "Updated" };
        await Ok(await Send(c, HttpMethod.Put, $"/suppliers/{id}", updated, 1, key), HttpStatusCode.OK);
        Assert.Equal(2, (await Ok(await Send(c, HttpMethod.Put, $"/suppliers/{id}", updated, 1, key), HttpStatusCode.OK)).GetProperty("version").GetInt64());
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Put, $"/suppliers/{id}", updated with { LegalName = "Changed key payload" }, 1, key)).StatusCode);
        var results = await Task.WhenAll(Send(c, HttpMethod.Put, $"/suppliers/{id}", updated with { LegalName = "A" }, 2), Send(c, HttpMethod.Put, $"/suppliers/{id}", updated with { LegalName = "B" }, 2));
        Assert.Single(results, x => x.StatusCode == HttpStatusCode.OK); Assert.Single(results, x => x.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(3, (await Get(c, $"/suppliers/{id}")).GetProperty("version").GetInt64());
    }

    [Fact]
    public async Task Cross_company_references_and_resource_ids_cannot_be_used()
    {
        await using var api = new TestApi(db); using var a = api.Authenticated(); using var b = api.Authenticated(company: db.OtherCompany);
        var customer = await Customer(a); var foreign = await Customer(b); var branch = await Create(b, $"/customers/{foreign}/branches", Branch());
        Assert.Equal(HttpStatusCode.NotFound, (await Send(a, HttpMethod.Post, $"/customers/{customer}/contacts", new ContactMaintenance("Foreign", BranchIds: [branch]))).StatusCode);
        var foreignRegion = await Create(b, "/regions", new LookupMaintenance(Code(), "Other region"));
        Assert.Equal(HttpStatusCode.NotFound, (await Send(a, HttpMethod.Post, "/warehouses", new WarehouseMaintenance(Code(), "Wrong", foreignRegion))).StatusCode);
        var p = await Product(b);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(a, HttpMethod.Post, "/pricing/standard-prices", new StandardPriceMaintenance(p.BaseUnit, 100, DateTimeOffset.UtcNow))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await a.GetAsync($"/api/v1/customers/{foreign}")).StatusCode);
    }

    [Fact]
    public async Task Scoped_price_maintainer_cannot_enumerate_or_change_another_customers_rules()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var own = await Customer(admin); var other = await Customer(admin); var p = await Product(admin);
        var code = Code();
        await db.OwnerScalarAsync("""
            WITH r AS(INSERT INTO identity.roles(company_id,code,name) VALUES(@company,@code,'Scoped pricing') RETURNING id)
            INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
            SELECT @company,r.id,p FROM r CROSS JOIN unnest(ARRAY['pricing.manage.read','pricing.write','customers.read']) p
            """, ("company", db.Company), ("code", code));
        var staff = await Staff(code);
        await db.OwnerScalarAsync("INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id) VALUES(@company,@member,@customer)", ("company", db.Company), ("member", staff.Membership), ("customer", own));
        var draft = new CustomerPriceMaintenance(other, p.BaseUnit, "FIXED_PRICE", 100, null, DateTimeOffset.UtcNow.AddHours(-1));
        var otherRule = await Create(admin, "/pricing/customer-prices", draft);
        using var scoped = api.Authenticated(staff.Subject);
        Assert.Empty((await Get(scoped, "/pricing/customer-prices")).GetProperty("items").EnumerateArray());
        Assert.Equal(HttpStatusCode.NotFound, (await scoped.GetAsync($"/api/v1/pricing/customer-prices/{otherRule}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(scoped, HttpMethod.Put, $"/pricing/customer-prices/{otherRule}", draft, 1)).StatusCode);
        await Create(scoped, "/pricing/customer-prices", draft with { CustomerId = own });
        Assert.Single((await Get(scoped, "/pricing/customer-prices")).GetProperty("items").EnumerateArray());
    }

    [Fact]
    public async Task Shared_customer_supplier_party_cannot_be_changed_through_lower_privilege_supplier_route()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var customer = await Customer(admin);
        var supplier = (Guid)(await db.OwnerScalarAsync("INSERT INTO crm.suppliers(company_id,party_id,code) SELECT @company,party_id,@code FROM crm.customers WHERE company_id=@company AND id=@customer RETURNING id", ("company", db.Company), ("code", Code()), ("customer", customer)))!;
        var staff = await Staff("PROCUREMENT"); using var procurement = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(procurement, HttpMethod.Put, $"/suppliers/{supplier}", new SupplierMaintenance(Code(), "Overwritten shared party", null), 1)).StatusCode);
        Assert.Equal("Test customer", (await Get(admin, $"/customers/{customer}")).GetProperty("legalName").GetString());
    }

    [Theory]
    [InlineData("negative")]
    [InlineData("precision")]
    [InlineData("interval")]
    public async Task Invalid_price_amount_precision_and_interval_are_rejected(string scenario)
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c); var now = DateTimeOffset.UtcNow;
        var d = new StandardPriceMaintenance(p.BaseUnit, 100, now, now.AddHours(1));
        d = scenario switch { "negative" => d with { Amount = -1 }, "precision" => d with { Amount = 1.123456789m }, _ => d with { EffectiveTo = now } };
        var error = await Ok(await Send(c, HttpMethod.Post, "/pricing/standard-prices", d), HttpStatusCode.UnprocessableEntity);
        Assert.Equal("invalid_master_data", error.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Duplicate_supplier_code_rolls_back_party_and_missing_key_cannot_write()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var draft = new SupplierMaintenance(Code(), "Original", null);
        await Create(c, "/suppliers", draft);
        var count = await db.OwnerScalarAsync("SELECT count(*) FROM crm.parties WHERE company_id=@company", ("company", db.Company));
        Assert.Equal(HttpStatusCode.Conflict, (await Send(c, HttpMethod.Post, "/suppliers", draft with { LegalName = "Duplicate" })).StatusCode);
        Assert.Equal(count, await db.OwnerScalarAsync("SELECT count(*) FROM crm.parties WHERE company_id=@company", ("company", db.Company)));
        Assert.Equal(HttpStatusCode.BadRequest, (await c.PostAsJsonAsync("/api/v1/suppliers", draft with { Code = Code() })).StatusCode);
    }

    [Fact]
    public async Task Office_cannot_change_floor_and_inactive_product_unit_cannot_be_priced()
    {
        await using var api = new TestApi(db); using var admin = api.Authenticated(); var p = await Product(admin);
        var staff = await Staff("OFFICE"); using var office = api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(office, HttpMethod.Post, "/pricing/floors", new FloorMaintenance(p.BoxUnit, 1))).StatusCode);
        await Ok(await Send(admin, HttpMethod.Put, $"/products/{p.Product}/units/{p.BoxUnit}", new ProductUnitMaintenance(p.Box, 2.2m, Active: false), 1), HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(admin, HttpMethod.Post, "/pricing/standard-prices", new StandardPriceMaintenance(p.BoxUnit, 100, DateTimeOffset.UtcNow))).StatusCode);
    }

    [Fact]
    public async Task OpenApi_contains_the_maintenance_routes()
    {
        await using var api = new TestApi(db); using var c = api.CreateClient();
        var spec = await c.GetFromJsonAsync<JsonElement>("/openapi/v1.json"); var paths = spec.GetProperty("paths");
        Assert.True(paths.GetProperty("/api/v1/suppliers").TryGetProperty("post", out _));
        Assert.True(paths.GetProperty("/api/v1/warehouses/{id}").TryGetProperty("put", out _));
        Assert.True(paths.GetProperty("/api/v1/pricing/floors").TryGetProperty("post", out _));
        Assert.True(paths.GetProperty("/api/v1/customers/{customerId}/branches").TryGetProperty("post", out _));
    }

    [Fact]
    public async Task Omitted_financial_amounts_are_not_silently_treated_as_zero()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(c, HttpMethod.Post, "/pricing/floors", new { productUnitId = p.BaseUnit })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(c, HttpMethod.Post, "/pricing/standard-prices", new { productUnitId = p.BaseUnit, effectiveFrom = DateTimeOffset.UtcNow })).StatusCode);
        var customer = await Customer(c);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(c, HttpMethod.Put, $"/customers/{customer}", new { code = Code(), legalName = "Missing credit", status = "ACTIVE" }, 1)).StatusCode);
        Assert.Equal(1, (await Get(c, $"/customers/{customer}")).GetProperty("version").GetInt64());
    }

    [Fact]
    public async Task Unit_creation_rechecks_uom_after_concurrent_deactivation()
    {
        await using var api = new TestApi(db); using var c = api.Authenticated(); var p = await Product(c);
        var uom = await Create(c, "/uoms", new LookupMaintenance(Code(), "Concurrent UOM"));
        await using var scope = await db.SessionAsync();
        await Htt.Infrastructure.Sql.RowsAsync(scope, "UPDATE catalog.uoms SET active=false WHERE company_id=@company AND id=@id", default, ("company", db.Company), ("id", uom));
        var creating = Send(c, HttpMethod.Post, $"/products/{p.Product}/units", new ProductUnitMaintenance(uom, 10));
        var observed = false;
        for (var attempt = 0; attempt < 25 && !creating.IsCompleted; attempt++)
        {
            observed = (bool)(await db.OwnerScalarAsync("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND usename='htt_app' AND wait_event_type='Lock' AND query LIKE '%SELECT id FROM catalog.uoms%FOR SHARE%')"))!;
            if (observed) break;
            await Task.Delay(40);
        }
        await scope.Transaction.CommitAsync();
        var response = await creating;
        Assert.True(observed, "Creation must lock the validated UOM rather than reading a stale enabled flag.");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM catalog.product_units WHERE company_id=@company AND uom_id=@uom", ("company", db.Company), ("uom", uom)));
    }
}
