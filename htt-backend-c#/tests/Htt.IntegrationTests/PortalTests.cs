using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Portal;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class PortalTests(DatabaseFixture db):IClassFixture<DatabaseFixture>,IAsyncLifetime
{
    private sealed record Data(SalesData Sales,Guid Grant,string Subject,string Barcode)
    {public PortalBranchInput[] Scopes=>[new(Sales.Branch,[Sales.Warehouse])];}
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    public async Task InitializeAsync()=>await S("UPDATE portal.product_publications SET published=false WHERE company_id=@company",("company",db.Company));
    public Task DisposeAsync()=>Task.CompletedTask;
    private static PortalPublicationInput Publication(Data d,bool all=false,decimal low=5)=>new(true,all,"Public oak flooring description",low,all?[]:[d.Sales.Customer],[d.Barcode]);
    private static async Task<JsonElement> PGet(HttpClient c,string path)=>await Expect(await c.GetAsync("/api/portal/v1"+path),HttpStatusCode.OK);
    private static HttpClient Customer(TestApi api,DatabaseFixture db,Data d,Guid? company=null,Guid? grant=null,string? subject=null,string? audience=null)
    {var c=api.Authenticated(subject??d.Subject,audience??"htt-test-portal",company??db.Company);c.DefaultRequestHeaders.Add("X-Portal-Grant-Id",(grant??d.Grant).ToString());return c;}
    private static string Products(Data d,string extra="")=>$"/products?branchId={d.Sales.Branch}{extra}";
    private static string Stock(Data d,string extra="")=>$"/products/{d.Sales.Product}/availability?branchId={d.Sales.Branch}{extra}";
    private static Guid Id(JsonElement e)=>e.GetProperty("id").GetGuid();
    private async Task<Data> SetupPortal(HttpClient admin,decimal quantity=22,bool publish=true,string? subject=null)
    {
        var sales=await Setup(db,admin,quantity);if(quantity>0)await StockValuation.InitializeAsync(db.Owner,db.Company,sales.Warehouse,sales.Product,100,Code(),DatabaseFixture.Issuer,db.Subject);
        var sub=subject??"customer-"+Guid.NewGuid().ToString("N");
        var grant=await Expect(await Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",new PortalAccessInput(DatabaseFixture.Issuer,sub,"Portal customer",true,[new(sales.Branch,[sales.Warehouse])])),HttpStatusCode.Created);
        var d=new Data(sales,Id(grant),sub,"00"+Code().ToUpperInvariant());if(publish)await Expect(await Publish(admin,d),HttpStatusCode.Created);return d;
    }
    private static Task<HttpResponseMessage> Publish(HttpClient c,Data d,PortalPublicationInput? input=null,long? version=null,string? key=null)=>Send(c,version is null?HttpMethod.Post:HttpMethod.Put,$"/portal/catalog/products/{d.Sales.Product}",input??Publication(d),version,key);
    private static Task<HttpResponseMessage> Grant(HttpClient c,Data d,PortalAccessUpdate update,long version=1,string? key=null)=>Send(c,HttpMethod.Put,$"/portal-access/{d.Grant}",update,version,key);
    private static Task<Guid> Warehouse(HttpClient c,string kind="SELLABLE")=>Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Portal warehouse",Kind:kind));
    private static Task<Guid> Branch(HttpClient c,Guid customer)=>Create(c,$"/customers/{customer}/branches",new BranchMaintenance(Code(),"Other branch","20 Test St","Sydney","NSW","2000"));
    [Fact]
    public async Task Portal_me_branches_details_and_inventory_are_scoped_and_whitelisted()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var customer=Customer(api,db,d);
        var me=await PGet(customer,"/me");Assert.Single(me.GetProperty("contexts").EnumerateArray());Assert.Equal(d.Sales.Customer,me.GetProperty("contexts")[0].GetProperty("customerId").GetGuid());
        Assert.Equal(d.Sales.Branch,(await PGet(customer,"/branches")).GetProperty("items")[0].GetProperty("id").GetGuid());
        var catalogue=await PGet(customer,Products(d));Assert.Equal(1,catalogue.GetProperty("totalItems").GetInt32());Assert.Equal(22,D(catalogue.GetProperty("items")[0].GetProperty("available")));
        var detail=await PGet(customer,$"/products/{d.Sales.Product}?branchId={d.Sales.Branch}");Assert.Equal("Public oak flooring description",detail.GetProperty("description").GetString());Assert.Equal(2,detail.GetProperty("units").GetArrayLength());Assert.Equal(d.Barcode,detail.GetProperty("barcodes")[0].GetString());
        var stock=await PGet(customer,Stock(d));Assert.Equal(22,D(stock.GetProperty("available")));Assert.Single(stock.GetProperty("warehouses").EnumerateArray());Assert.Equal("IN_STOCK",stock.GetProperty("stockStatus").GetString());
        foreach(var text in new[]{me.GetRawText(),catalogue.GetRawText(),detail.GetRawText(),stock.GetRawText()})foreach(var secret in new[]{"creditLimit","receivable","onHand","reserved","unitCost","reorderPoint","taxCodeId","accountId","partyId","priceFloor","journal","createdBy"})Assert.DoesNotContain(secret,text,StringComparison.OrdinalIgnoreCase);
        using var response=await customer.GetAsync("/api/portal/v1"+Stock(d));Assert.Contains("no-store",response.Headers.CacheControl!.ToString());
    }
    [Fact]
    public async Task Multiple_customers_on_one_identity_require_explicit_context_selection()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var a=await SetupPortal(admin);var b=await SetupPortal(admin,subject:a.Subject);using var ca=Customer(api,db,a);using var cb=Customer(api,db,b);
        Assert.Equal(2,(await PGet(ca,"/me")).GetProperty("contexts").GetArrayLength());Assert.Equal(a.Sales.Product,(await PGet(ca,Products(a))).GetProperty("items")[0].GetProperty("id").GetGuid());
        Assert.Equal(b.Sales.Product,(await PGet(cb,Products(b))).GetProperty("items")[0].GetProperty("id").GetGuid());
        await Expect(await ca.GetAsync($"/api/portal/v1/products/{b.Sales.Product}?branchId={a.Sales.Branch}"),HttpStatusCode.NotFound);
    }
    [Theory]
    [InlineData("company")]
    [InlineData("grant")]
    [InlineData("subject")]
    public async Task Forged_portal_context_does_not_expand_access(string field)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var victim=await SetupPortal(admin);
        using var denied=Customer(api,db,d,company:field=="company"?db.OtherCompany:null,grant:field=="grant"?victim.Grant:null,subject:field=="subject"?"unknown-identity":null);
        await Expect(await denied.GetAsync("/api/portal/v1/branches"),HttpStatusCode.Forbidden);await Expect(await denied.GetAsync("/api/portal/v1"+Stock(d)),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("branch")]
    [InlineData("warehouse")]
    [InlineData("product")]
    public async Task Guessing_other_customer_resource_ids_returns_no_data(string field)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var victim=await SetupPortal(admin);using var c=Customer(api,db,d);
        var path=field switch{"branch"=>$"/products?branchId={victim.Sales.Branch}","warehouse"=>Stock(d,$"&warehouseId={victim.Sales.Warehouse}"),_=>$"/products/{victim.Sales.Product}?branchId={d.Sales.Branch}"};
        await Expect(await c.GetAsync("/api/portal/v1"+path),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Two_branches_of_same_customer_have_independent_warehouse_scopes()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var b=await Branch(admin,d.Sales.Customer);var w=await Warehouse(admin);
        await Expect(await Grant(admin,d,new(true,[new(d.Sales.Branch,[d.Sales.Warehouse]),new(b,[w])])),HttpStatusCode.OK);using var c=Customer(api,db,d);
        var branchStock=await PGet(c,$"/products/{d.Sales.Product}/availability?branchId={b}");Assert.Equal(0,D(branchStock.GetProperty("available")));Assert.Equal(w,branchStock.GetProperty("warehouses")[0].GetProperty("id").GetGuid());
        await Expect(await c.GetAsync($"/api/portal/v1/products/{d.Sales.Product}/availability?branchId={b}&warehouseId={d.Sales.Warehouse}"),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Multiwarehouse_inventory_includes_zero_balances_but_not_ungranted_stock()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var empty=await Warehouse(admin);var hidden=await Warehouse(admin);
        await StockOpening.InitializeAsync(db.Owner,db.Company,hidden,d.Sales.Product,999,"Hidden warehouse opening",DatabaseFixture.Issuer,db.Subject);
        await Expect(await Grant(admin,d,new(true,[new(d.Sales.Branch,[d.Sales.Warehouse,empty])])),HttpStatusCode.OK);using var c=Customer(api,db,d);var r=await PGet(c,Stock(d));
        Assert.Equal(22,D(r.GetProperty("available")));Assert.Equal(2,r.GetProperty("warehouses").GetArrayLength());Assert.DoesNotContain(r.GetProperty("warehouses").EnumerateArray(),x=>x.GetProperty("id").GetGuid()==hidden);
        var zero=await PGet(c,Stock(d,$"&warehouseId={empty}"));Assert.Equal("OUT_OF_STOCK",zero.GetProperty("stockStatus").GetString());Assert.Equal(0,D(zero.GetProperty("available")));
    }
    [Theory]
    [InlineData(0,"OUT_OF_STOCK")]
    [InlineData(2,"LOW_STOCK")]
    [InlineData(22,"IN_STOCK")]
    public async Task Stock_status_uses_public_threshold_and_authorized_quantity(decimal quantity,string expected)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin,quantity);using var c=Customer(api,db,d);
        Assert.Equal(expected,(await PGet(c,Stock(d))).GetProperty("stockStatus").GetString());Assert.Equal(1,(await PGet(c,Products(d,"&stockStatus="+expected))).GetProperty("totalItems").GetInt32());
    }
    [Fact]
    public async Task SKU_name_and_barcode_search_are_literal_case_insensitive_and_paginated()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);
        var product=await Get(admin,$"/products/{d.Sales.Product}");var sku=product.GetProperty("sku").GetString()!;
        foreach(var term in new[]{sku.ToLowerInvariant(),"stage b floor",d.Barcode.ToLowerInvariant()})Assert.Equal(1,(await PGet(c,Products(d,"&search="+Uri.EscapeDataString(term)))).GetProperty("totalItems").GetInt32());
        foreach(var term in new[]{"%","_","%' OR 1=1 --"})Assert.Equal(0,(await PGet(c,Products(d,"&search="+Uri.EscapeDataString(term)))).GetProperty("totalItems").GetInt32());
        Assert.Equal(0,(await PGet(c,Products(d,"&page=2&pageSize=1&sort=name"))).GetProperty("items").GetArrayLength());
        Assert.Equal(d.Sales.Product,(await PGet(c,Products(d,"&sort=availability_desc"))).GetProperty("items")[0].GetProperty("id").GetGuid());
    }
    [Theory]
    [InlineData("&page=0")]
    [InlineData("&pageSize=101")]
    [InlineData("&sort=unitCost")]
    [InlineData("&stockStatus=UNKNOWN")]
    public async Task Invalid_filters_are_validation_errors_not_unrestricted_queries(string query)
    {await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);await Expect(await c.GetAsync("/api/portal/v1"+Products(d,query)),HttpStatusCode.UnprocessableEntity);}
    [Theory]
    [InlineData("unpublished")]
    [InlineData("inactive")]
    [InlineData("sell-disabled")]
    [InlineData("different-audience")]
    public async Task Unavailable_products_disappear_from_search_details_and_inventory(string kind)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);
        if(kind=="inactive")await S("UPDATE catalog.products SET status='INACTIVE' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Product));
        else if(kind=="sell-disabled")await S("UPDATE catalog.products SET sell_enabled=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Product));
        else await Expect(await Publish(admin,d,Publication(d) with{Published=kind!="unpublished",CustomerIds=kind=="different-audience"?[]:[d.Sales.Customer]},1),HttpStatusCode.OK);
        Assert.Equal(0,(await PGet(c,Products(d))).GetProperty("totalItems").GetInt32());await Expect(await c.GetAsync("/api/portal/v1"+Stock(d)),HttpStatusCode.NotFound);await Expect(await c.GetAsync($"/api/portal/v1/products/{d.Sales.Product}?branchId={d.Sales.Branch}"),HttpStatusCode.NotFound);
    }
    [Theory]
    [InlineData("grant")]
    [InlineData("customer")]
    [InlineData("hold")]
    [InlineData("user")]
    [InlineData("branch")]
    [InlineData("warehouse")]
    public async Task Revocation_and_inactive_master_data_take_effect_on_next_request(string change)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);await PGet(c,Stock(d));
        switch(change)
        {
            case "grant":await Expect(await Grant(admin,d,new(false,[])),HttpStatusCode.OK);break;
            case "customer":case "hold":await S("UPDATE crm.customers SET status=@state WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Customer),("state",change=="hold"?"ON_HOLD":"INACTIVE"));break;
            case "user":await S("UPDATE identity.users SET active=false WHERE issuer=@issuer AND subject=@subject",("issuer",DatabaseFixture.Issuer),("subject",d.Subject));break;
            case "branch":await S("UPDATE crm.customer_branches SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Branch));break;
            case "warehouse":await S("UPDATE catalog.warehouses SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Sales.Warehouse));break;
        }
        await Expect(await c.GetAsync("/api/portal/v1"+Stock(d)),change=="branch"?HttpStatusCode.NotFound:HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    [InlineData("WAREHOUSE")]
    [InlineData("FINANCE")]
    public async Task Staff_without_management_permission_cannot_create_customer_grants(string role)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var staff=await Staff(db,role,d.Sales);using var c=api.Authenticated(staff.Subject);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/portal-access",new PortalAccessInput(DatabaseFixture.Issuer,Code(),"Unauthorized",true,d.Scopes)),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Grant_create_and_full_scope_update_are_idempotent_and_versioned()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var sales=await Setup(db,admin,0);var key=Guid.NewGuid().ToString();var input=new PortalAccessInput(DatabaseFixture.Issuer,Code(),"Customer",true,[new(sales.Branch,[sales.Warehouse])]);
        var a=await Expect(await Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",input,key:key),HttpStatusCode.Created);var b=await Expect(await Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",input,key:key),HttpStatusCode.Created);Assert.Equal(Id(a),Id(b));
        await Expect(await Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",input with{DisplayName="Different"},key:key),HttpStatusCode.Conflict);
        var d=new Data(sales,Id(a),input.Subject,Code());var update=new PortalAccessUpdate(false,[]);key=Guid.NewGuid().ToString();await Expect(await Grant(admin,d,update,key:key),HttpStatusCode.OK);await Expect(await Grant(admin,d,update,key:key),HttpStatusCode.OK);
        await Expect(await Grant(admin,d,update),HttpStatusCode.Conflict);Assert.Equal(2,(await Get(admin,$"/portal-access/{d.Grant}")).GetProperty("version").GetInt32());
    }
    [Fact]
    public async Task Concurrent_grant_updates_have_one_winner_and_atomic_scopes()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var w=await Warehouse(admin);
        var results=await Task.WhenAll(Grant(admin,d,new(true,[new(d.Sales.Branch,[w])])),Grant(admin,d,new(true,d.Scopes)));
        Assert.Single(results,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);using var c=Customer(api,db,d);Assert.Single((await PGet(c,$"/warehouses?branchId={d.Sales.Branch}")).GetProperty("items").EnumerateArray());
    }
    [Theory]
    [InlineData("other-customer")]
    [InlineData("quarantine")]
    [InlineData("empty")]
    [InlineData("duplicate")]
    public async Task Invalid_grants_roll_back_identity_creation_and_audit(string error)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var sales=await Setup(db,admin,0);var other=await Setup(db,admin,0);var sub=Code();
        var scopes=error switch{"empty"=>Array.Empty<PortalBranchInput>(),"duplicate"=>new[]{new PortalBranchInput(sales.Branch,[sales.Warehouse]),new PortalBranchInput(sales.Branch,[sales.Warehouse])},"quarantine"=>[new(sales.Branch,[await Warehouse(admin,"QUARANTINE")])],_=>[new PortalBranchInput(other.Branch,[sales.Warehouse])]};
        await Expect(await Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",new PortalAccessInput(DatabaseFixture.Issuer,sub,"Invalid",true,scopes)),HttpStatusCode.UnprocessableEntity);
        Assert.Equal(0L,await S("SELECT count(*) FROM identity.users WHERE issuer=@issuer AND subject=@sub",("issuer",DatabaseFixture.Issuer),("sub",sub)));
    }
    [Fact]
    public async Task Staff_identities_cannot_be_provisioned_for_portal_and_portal_users_cannot_get_memberships()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);
        await Expect(await Send(admin,HttpMethod.Post,$"/customers/{d.Sales.Customer}/portal-access",new PortalAccessInput(DatabaseFixture.Issuer,db.Subject,"Staff",true,d.Scopes)),HttpStatusCode.Conflict);
        var user=(Guid)(await S("SELECT id FROM identity.users WHERE issuer=@issuer AND subject=@sub",("issuer",DatabaseFixture.Issuer),("sub",d.Subject)))!;
        var e=await Assert.ThrowsAsync<PostgresException>(()=>S("INSERT INTO identity.memberships(company_id,user_id) VALUES(@company,@user)",("company",db.OtherCompany),("user",user)));Assert.Equal("23514",e.SqlState);
    }
    [Fact]
    public async Task Portal_tokens_never_access_staff_APIs_even_with_forged_staff_audience()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.GetAsync("/api/v1/customers")).StatusCode);using var forged=Customer(api,db,d,audience:"htt-test-api");await Expect(await forged.GetAsync("/api/v1/customers"),HttpStatusCode.Forbidden);
        using var staff=api.Authenticated();Assert.Equal(HttpStatusCode.Unauthorized,(await staff.GetAsync("/api/portal/v1/me")).StatusCode);using var staffPortal=api.Authenticated(audience:"htt-test-portal");await Expect(await staffPortal.GetAsync("/api/portal/v1/me"),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Publication_update_and_duplicate_barcode_failures_are_atomic()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var other=await SetupPortal(admin,publish:false);var conflict=Publication(other) with{Barcodes=[d.Barcode]};
        await Expect(await Publish(admin,other,conflict),HttpStatusCode.Conflict);await Expect(await admin.GetAsync($"/api/v1/portal/catalog/products/{other.Sales.Product}"),HttpStatusCode.NotFound);
        var key=Guid.NewGuid().ToString();var update=Publication(d) with{Description="Revised public description"};await Expect(await Publish(admin,d,update,1,key),HttpStatusCode.OK);await Expect(await Publish(admin,d,update,1,key),HttpStatusCode.OK);await Expect(await Publish(admin,d,update,1),HttpStatusCode.Conflict);
        using var c=Customer(api,db,d);Assert.Equal("Revised public description",(await PGet(c,$"/products/{d.Sales.Product}?branchId={d.Sales.Branch}")).GetProperty("description").GetString());
    }
    [Fact]
    public async Task Portal_database_login_has_only_whitelisted_functions_and_transactions_are_read_only()
    {
        await using var con=new NpgsqlConnection(db.Portal);await con.OpenAsync();await using var cmd=new NpgsqlCommand("SELECT rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb FROM pg_roles WHERE rolname=current_user",con);Assert.Equal(false,await cmd.ExecuteScalarAsync());
        foreach(var sql in new[]{"SELECT * FROM catalog.products","SELECT * FROM inventory.stock_balances","SELECT * FROM accounting.journal_lines","SELECT * FROM identity.customer_user_grants","SELECT identity.resolve_access('x','y')","SELECT * FROM portal.visible_products(gen_random_uuid(),gen_random_uuid())","SELECT portal.publication_view(gen_random_uuid())"})
        {cmd.CommandText=sql;var e=await Assert.ThrowsAsync<PostgresException>(()=>cmd.ExecuteScalarAsync());Assert.Equal("42501",e.SqlState);}
        await using var database=new PortalDatabase(db.Portal);await using var session=new PortalSession(database);await session.BeginAsync(default);
        Assert.Equal("on",await session.QueryAsync("SELECT current_setting('transaction_read_only')",default));await session.CommitAsync(default);
    }
    [Fact]
    public async Task Portal_reads_are_safe_to_repeat_and_never_create_commands_or_audit_events()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);var before=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company));
        var queries=await Task.WhenAll(Enumerable.Range(0,12).Select(_=>PGet(c,Stock(d))));Assert.All(queries,r=>Assert.Equal(22,D(r.GetProperty("available"))));
        Assert.Equal(before,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company)));
        Assert.Equal(HttpStatusCode.MethodNotAllowed,(await c.PostAsJsonAsync("/api/portal/v1/products",new{})).StatusCode);
    }
    [Fact]
    public async Task Committed_reservations_change_portal_availability_without_exposing_reservation_details()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);var q=await Submitted(admin,d.Sales.Draft(1));
        var before=await PGet(c,Stock(d));await Expect(await Approve(admin,q.Id,q.Version),HttpStatusCode.Created);var after=await PGet(c,Stock(d));Assert.Equal(22,D(before.GetProperty("available")));Assert.Equal(19.8m,D(after.GetProperty("available")));Assert.DoesNotContain("reserved",after.GetRawText(),StringComparison.OrdinalIgnoreCase);
    }
    [Fact]
    public async Task Uncommitted_stock_updates_are_invisible_and_each_multiwarehouse_response_is_one_snapshot()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var w=await Warehouse(admin);await StockOpening.InitializeAsync(db.Owner,db.Company,w,d.Sales.Product,10,Code(),DatabaseFixture.Issuer,db.Subject);await Expect(await Grant(admin,d,new(true,[new(d.Sales.Branch,[d.Sales.Warehouse,w])])),HttpStatusCode.OK);using var c=Customer(api,db,d);
        await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();await using var command=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true)",con,tx);command.Parameters.AddWithValue("company",db.Company);command.Parameters.AddWithValue("product",d.Sales.Product);await command.ExecuteNonQueryAsync();
        command.CommandText="UPDATE inventory.stock_balances SET on_hand=on_hand+1 WHERE company_id=@company AND product_id=@product";await command.ExecuteNonQueryAsync();
        var old=await PGet(c,Stock(d));Assert.Equal(32,D(old.GetProperty("available")));await tx.CommitAsync();var current=await PGet(c,Stock(d));Assert.Equal(34,D(current.GetProperty("available")));Assert.Equal(D(current.GetProperty("available")),current.GetProperty("warehouses").EnumerateArray().Sum(x=>D(x.GetProperty("available"))));
    }
    [Theory]
    [InlineData("anonymous")][InlineData("unsigned")][InlineData("issuer")][InlineData("audience")][InlineData("expired")][InlineData("signature")]
    public async Task Portal_requires_valid_signed_short_lived_tokens(string invalid)
    {
        await using var api=new TestApi(db);using var c=api.CreateClient();
        if(invalid!="anonymous")
        {
            var key=invalid=="signature"?new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("different-test-signing-key-at-least-32-characters")):TestApi.Key;
            var token=new JwtSecurityToken(invalid=="issuer"?"https://other.invalid":DatabaseFixture.Issuer,invalid=="audience"?"htt-test-api":"htt-test-portal",[new Claim("sub",db.Subject)],notBefore:DateTime.UtcNow.AddHours(-2),expires:DateTime.UtcNow.AddMinutes(invalid=="expired"?-1:5),signingCredentials:invalid=="unsigned"?null:new SigningCredentials(key,SecurityAlgorithms.HmacSha256));
            c.DefaultRequestHeaders.Authorization=new AuthenticationHeaderValue("Bearer",new JwtSecurityTokenHandler().WriteToken(token));
        }
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.GetAsync("/api/portal/v1/me")).StatusCode);
    }
    [Theory]
    [InlineData("access","htt-test-portal",200)][InlineData("id","htt-test-portal",401)][InlineData("access","htt-test-api",401)][InlineData("","htt-test-portal",401)]
    public async Task Cognito_accepts_only_access_tokens_for_the_portal_client(string use,string client,int expected)
    {
        await using var api=new TestApi(db,"Cognito");using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=api.CreateClient();
        var token=new JwtSecurityToken(DatabaseFixture.Issuer,null,[new Claim("sub",d.Subject),new Claim("token_use",use),new Claim("client_id",client)],notBefore:DateTime.UtcNow.AddMinutes(-1),expires:DateTime.UtcNow.AddMinutes(5),signingCredentials:new SigningCredentials(TestApi.Key,SecurityAlgorithms.HmacSha256));
        c.DefaultRequestHeaders.Authorization=new AuthenticationHeaderValue("Bearer",new JwtSecurityTokenHandler().WriteToken(token));Assert.Equal(expected,(int)(await c.GetAsync("/api/portal/v1/me")).StatusCode);
    }
    [Theory]
    [InlineData("PortalAuthentication:Audience","htt-test-api")][InlineData("PortalAuthentication:Authority","http://unsafe.invalid")][InlineData("PortalAuthentication:Mode","Unknown")][InlineData("ConnectionStrings:PortalDatabase","Host=localhost;Username=htt_app;Database=htt_test")]
    public async Task Unsafe_portal_configuration_fails_before_serving_requests(string key,string value)
    {
        await using var api=new TestApi(db,settings:new(){[key]=value});Assert.Throws<InvalidOperationException>(()=>api.CreateClient());
    }
    [Fact]
    public async Task Context_headers_are_mandatory_and_unprovisioned_identity_is_not_auto_enrolled()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=api.Authenticated(d.Subject,"htt-test-portal");
        await Expect(await c.GetAsync("/api/portal/v1/branches"),HttpStatusCode.BadRequest);c.DefaultRequestHeaders.Add("X-Portal-Grant-Id",d.Grant.ToString());c.DefaultRequestHeaders.Remove("X-Company-Id");await Expect(await c.GetAsync("/api/portal/v1/branches"),HttpStatusCode.BadRequest);
        var sub="not-enrolled-"+Code();using var unknown=api.Authenticated(sub,"htt-test-portal");await Expect(await unknown.GetAsync("/api/portal/v1/me"),HttpStatusCode.Forbidden);Assert.Equal(0L,await S("SELECT count(*) FROM identity.users WHERE subject=@sub",("sub",sub)));
    }
    [Fact]
    public async Task Concurrent_publication_updates_have_one_winner_and_replayed_commands_do_not_audit_twice()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var before=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='portal.product_published'",("company",db.Company));
        var results=await Task.WhenAll(Publish(admin,d,Publication(d) with{Description="One"},1),Publish(admin,d,Publication(d) with{Description="Two"},1));Assert.Equal(1,results.Count(x=>x.StatusCode==HttpStatusCode.OK));Assert.Equal(1,results.Count(x=>x.StatusCode==HttpStatusCode.Conflict));
        Assert.Equal((long)before!+1,(long)(await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='portal.product_published'",("company",db.Company)))!);
        var key=Guid.NewGuid().ToString();var input=Publication(d) with{Description="Three"};await Expect(await Publish(admin,d,input,2,key),HttpStatusCode.OK);await Expect(await Publish(admin,d,input,2,key),HttpStatusCode.OK);
        Assert.Equal((long)before!+2,(long)(await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='portal.product_published'",("company",db.Company)))!);
    }
    [Fact]
    public async Task Scope_replacement_is_atomic_during_parallel_reads()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var w=await Warehouse(admin);await StockOpening.InitializeAsync(db.Owner,db.Company,w,d.Sales.Product,7,Code(),DatabaseFixture.Issuer,db.Subject);using var c=Customer(api,db,d);
        var reads=Enumerable.Range(0,12).Select(_=>PGet(c,Stock(d))).ToArray();var update=Grant(admin,d,new(true,[new(d.Sales.Branch,[w])]));await Expect(await update,HttpStatusCode.OK);
        foreach(var result in await Task.WhenAll(reads)){Assert.Single(result.GetProperty("warehouses").EnumerateArray());Assert.Contains(D(result.GetProperty("available")),new decimal[]{22,7});}
        Assert.Equal(7,D((await PGet(c,Stock(d))).GetProperty("available")));
    }
    [Fact]
    public async Task Concurrent_same_key_provisioning_creates_one_grant_and_one_audit_event()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var sales=await Setup(db,admin,0);var key=Guid.NewGuid().ToString();var input=new PortalAccessInput(DatabaseFixture.Issuer,Code(),"Customer",true,[new(sales.Branch,[sales.Warehouse])]);
        var replies=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Send(admin,HttpMethod.Post,$"/customers/{sales.Customer}/portal-access",input,key:key)));var ids=new List<Guid>();foreach(var reply in replies)ids.Add(Id(await Expect(reply,HttpStatusCode.Created)));Assert.Single(ids.Distinct());
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='portal.access_created' AND entity_id=@id",("company",db.Company),("id",ids[0])));
    }
    [Fact]
    public async Task Legacy_grants_are_disabled_and_cannot_be_enabled_without_explicit_provisioning()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var sub=Code();var user=(Guid)(await S("INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@sub,'Legacy') RETURNING id",("issuer",DatabaseFixture.Issuer),("sub",sub)))!;
        var grant=(Guid)(await S("INSERT INTO identity.customer_user_grants(company_id,user_id,customer_id) VALUES(@company,@user,@customer) RETURNING id",("company",db.Company),("user",user),("customer",d.Sales.Customer)))!;
        Assert.Equal(false,await S("SELECT portal_enabled FROM identity.customer_user_grants WHERE id=@id",("id",grant)));using var c=Customer(api,db,d,grant:grant,subject:sub);await Expect(await c.GetAsync("/api/portal/v1/me"),HttpStatusCode.Forbidden);
        await Expect(await Send(admin,HttpMethod.Put,$"/portal-access/{grant}",new PortalAccessUpdate(true,d.Scopes),1),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Concurrent_staff_membership_prevents_customer_identity_provisioning()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var sub=Code();var user=(Guid)(await S("INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@sub,'Race') RETURNING id",("issuer",DatabaseFixture.Issuer),("sub",sub)))!;
        await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();await using var cmd=new NpgsqlCommand("INSERT INTO identity.memberships(company_id,user_id) VALUES(@company,@user)",con,tx);cmd.Parameters.AddWithValue("company",db.OtherCompany);cmd.Parameters.AddWithValue("user",user);await cmd.ExecuteNonQueryAsync();
        var create=Send(admin,HttpMethod.Post,$"/customers/{d.Sales.Customer}/portal-access",new PortalAccessInput(DatabaseFixture.Issuer,sub,"Race",true,d.Scopes));await tx.CommitAsync();await Expect(await create,HttpStatusCode.Conflict);
        Assert.Equal(0L,await S("SELECT count(*) FROM identity.portal_principals WHERE user_id=@user",("user",user)));
    }
    [Theory]
    [InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("FINANCE")][InlineData("PROCUREMENT")]
    public async Task Staff_without_catalogue_permission_cannot_publish_products(string role)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await SetupPortal(admin);var staff=await Staff(db,role,d.Sales);using var c=api.Authenticated(staff.Subject);await Expect(await Publish(c,d,Publication(d),1),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Host_disposal_releases_its_portal_connection_pool()
    {
        var name="portal-lifetime-"+Code();var connection=new NpgsqlConnectionStringBuilder(db.Portal){ApplicationName=name}.ConnectionString;
        await using var api=new TestApi(db,settings:new(){["ConnectionStrings:PortalDatabase"]=connection});using var admin=api.Authenticated();var d=await SetupPortal(admin);using var c=Customer(api,db,d);await PGet(c,Stock(d));
        async Task<long> Count()=> (long)(await S("SELECT count(*) FROM pg_stat_activity WHERE usename='htt_portal' AND application_name=@name",("name",name)))!;
        Assert.True(await Count()>0);await api.DisposeAsync();
        for(var i=0;i<20 && await Count()!=0;i++)await Task.Delay(25);
        Assert.Equal(0,await Count());
    }
}
