using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class GlobalSearchTests : IAsyncLifetime
{
    readonly DatabaseFixture db = new();
    public Task InitializeAsync() => db.InitializeAsync();
    public Task DisposeAsync() => db.DisposeAsync();
    Task<object?> S(string sql, params (string,object)[] a) => db.OwnerScalarAsync(sql,a);
    static Guid Id(JsonElement e) => e.GetProperty("id").GetGuid();
    static JsonElement[] Items(JsonElement e) => e.GetProperty("items").EnumerateArray().ToArray();
    static Task<JsonElement> Search(HttpClient c,string q,string extra="") => Get(c,"/search?q="+Uri.EscapeDataString(q)+extra);
    [Theory]
    [InlineData("CUSTOMER")][InlineData("BRANCH")][InlineData("CONTACT")][InlineData("SUPPLIER")][InlineData("PRODUCT")]
    [InlineData("QUOTE")][InlineData("SALES_ORDER")][InlineData("INVOICE")][InlineData("PURCHASE_ORDER")]
    [InlineData("SUPPLIER_BILL")][InlineData("CUSTOMER_CREDIT")][InlineData("SUPPLIER_CREDIT")]
    public async Task Empty_authorized_kind_has_consistent_counts_and_no_writes(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();
        var before=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@c",("c",db.Company));
        var r=await Search(c,"no-match","&kind="+kind);Assert.Empty(Items(r));Assert.Equal(0,r.GetProperty("totalCount").GetInt32());
        Assert.Equal(db.Company,r.GetProperty("companyId").GetGuid());Assert.True(r.GetProperty("readOnly").GetBoolean());
        Assert.Equal(before,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@c",("c",db.Company)));
    }
    [Theory]
    [InlineData("")][InlineData("a")][InlineData("  ")][InlineData("ab\ncd")]
    [InlineData("ab&kind=unknown",true)][InlineData("ab&page=0",true)][InlineData("ab&pageSize=101",true)]
    [InlineData("ab&page=2147483647",true)][InlineData("ab&pageSize=0",true)]
    public async Task Invalid_search_is_rejected(string q,bool raw=false)
    {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(await c.GetAsync("/api/v1/search?q="+(raw?q:Uri.EscapeDataString(q))),HttpStatusCode.UnprocessableEntity);}
    [Fact]public async Task Missing_and_oversized_queries_are_rejected()
    {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(await c.GetAsync("/api/v1/search"),HttpStatusCode.UnprocessableEntity);await Expect(await c.GetAsync("/api/v1/search?q="+new string('x',101)),HttpStatusCode.UnprocessableEntity);}
    [Fact]public async Task Unauthenticated_and_revoked_gateway_permissions_are_denied()
    {
        await using var api=new TestApi(db);using var anon=api.CreateClient();Assert.Equal(HttpStatusCode.Unauthorized,(await anon.GetAsync("/api/v1/search?q=ab")).StatusCode);
        using var c=api.Authenticated();await Search(c,"ab");await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='search.global.read'",("c",db.Company));
        await Expect(await c.GetAsync("/api/v1/search?q=ab"),HttpStatusCode.Forbidden);
        await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT platform.global_search('ab')",default));Assert.Equal("42501",e.SqlState);
    }
    [Fact]public async Task Case_insensitive_literal_name_and_code_ranking_page_without_duplicates()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();
        var a=await Create(c,"/customers",new CustomerDraft("ALPHA","Other name",null));
        var b=await Create(c,"/customers",new CustomerDraft("ALPHA-2","Prefix code",null));
        var d=await Create(c,"/customers",new CustomerDraft("ZZZ","Alpha name",null));
        await Create(c,"/customers",new CustomerDraft("ZZZ2","Tail alpha",null));
        var pages=await Task.WhenAll(Enumerable.Range(1,4).Select(p=>Search(c," aLpHa ",$"&kind=CUSTOMER&pageSize=1&page={p}")));
        Assert.All(pages,x=>Assert.Equal(4,x.GetProperty("totalCount").GetInt32()));
        Assert.Equal(new[]{a,b,d},pages.Take(3).Select(x=>Id(Items(x).Single())));Assert.Equal(4,pages.Select(x=>Id(Items(x).Single())).Distinct().Count());
        Assert.Empty(Items(await Search(c,"alpha","&kind=CUSTOMER&page=9")));
        var literal=await Create(c,"/customers",new CustomerDraft(Code(),"Literal %_ marker",null));
        Assert.Equal(literal,Id(Items(await Search(c,"%_","&kind=CUSTOMER")).Single()));
        Assert.Empty(Items(await Search(c,"'; DROP TABLE crm.customers;--")));
    }
    [Fact]public async Task All_counts_and_names_are_filtered_before_paging_by_current_customer_assignment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Setup(db,c,0);var b=await Setup(db,c,0);
        var qa=await Create(c,"/quotes",a.Draft());var qb=await Create(c,"/quotes",b.Draft());
        var staff=await Staff(db,"SALES",a);using var user=api.Authenticated(staff.Subject);
        var r=await Search(user,"Stage B customer");var ids=Items(r).Select(Id).ToArray();Assert.Contains(a.Customer,ids);Assert.Contains(qa,ids);Assert.DoesNotContain(b.Customer,ids);Assert.DoesNotContain(qb,ids);
        Assert.Equal(2,r.GetProperty("totalCount").GetInt32());Assert.Equal(1,r.GetProperty("counts").GetProperty("QUOTE").GetInt32());
        await S("DELETE FROM identity.customer_assignments WHERE company_id=@c AND membership_id=@m",("c",db.Company),("m",staff.Membership));
        Assert.Empty(Items(await Search(user,"Stage B customer")));
    }
    [Fact]public async Task Underlying_permission_is_rechecked_even_when_search_is_allowed()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Search secret supplier",null));
        Assert.Single(Items(await Search(c,"Search secret supplier")));
        await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='suppliers.read'",("c",db.Company));
        Assert.Empty(Items(await Search(c,"Search secret supplier")));await Expect(await c.GetAsync("/api/v1/search?q=Search&kind=SUPPLIER"),HttpStatusCode.Forbidden);
    }
    [Fact]public async Task Company_and_unknown_company_context_never_leak_results()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Create(c,"/customers",new CustomerDraft(Code(),"Company private search",null));
        using var other=api.Authenticated(company:db.OtherCompany);Assert.Empty(Items(await Search(other,"Company private search")));
        using var unknown=api.Authenticated(company:Guid.NewGuid());await Expect(await unknown.GetAsync("/api/v1/search?q=Company"),HttpStatusCode.Forbidden);
    }
    [Fact]public async Task Branch_contact_product_and_supplier_links_have_no_financial_or_personal_payloads()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,0);
        var contact=await Create(c,$"/customers/{d.Customer}/contacts",new ContactMaintenance("GlobalDiscovery Contact",Email:"secret@example.invalid"));
        var r=Items(await Search(c,"GlobalDiscovery"));Assert.Equal(contact,Id(r.Single()));Assert.Equal(d.Customer,r[0].GetProperty("parentId").GetGuid());
        Assert.DoesNotContain("secret@",r[0].GetRawText());Assert.Equal($"/api/v1/customers/{d.Customer}",r[0].GetProperty("apiPath").GetString());
        Assert.Contains(Items(await Search(c,"Sydney store")),x=>Id(x)==d.Branch);
        Assert.Contains(Items(await Search(c,"Stage B floor")),x=>Id(x)==d.Product);
        var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"GlobalDiscovery supplier",null));
        foreach(var row in Items(await Search(c,"GlobalDiscovery"))){Assert.False(row.TryGetProperty("gross",out _));Assert.False(row.TryGetProperty("creditLimit",out _));}
        Assert.Contains(Items(await Search(c,"GlobalDiscovery")),x=>Id(x)==supplier);
    }
    [Fact]public async Task Trashed_draft_disappears_and_restore_reuses_original_search_identity()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,0);var quote=await Create(c,"/quotes",d.Draft());
        Assert.Equal(quote,Id(Items(await Search(c,"Stage B customer","&kind=QUOTE")).Single()));
        async Task Change(string action,long version){using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{quote}/{action}");request.Headers.Add("Idempotency-Key",Code());request.Headers.Add("If-Match",$"\"{version}\"");request.Headers.Add("X-Document-Version","1");request.Content=JsonContent.Create(new DocumentTrashInput("D01 search visibility"));await Expect(await c.SendAsync(request),HttpStatusCode.OK);}
        await Change("trash",1);Assert.Empty(Items(await Search(c,"Stage B customer","&kind=QUOTE")));await Change("restore",2);
        Assert.Equal(quote,Id(Items(await Search(c,"Stage B customer","&kind=QUOTE")).Single()));
    }
    [Fact]public async Task Concurrent_reloads_are_repeatable_without_audit_outbox_or_ledger_writes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Setup(db,c,0);
        const string sql="SELECT concat((SELECT count(*) FROM platform.audit_events WHERE company_id=@c),':',(SELECT count(*) FROM platform.outbox_events WHERE company_id=@c),':',(SELECT count(*) FROM accounting.journal_entries WHERE company_id=@c))";
        var before=await S(sql,("c",db.Company));var all=await Task.WhenAll(Enumerable.Range(0,8).Select(_=>Search(c,"Stage B")));
        Assert.Single(all.Select(x=>x.GetProperty("items").GetRawText()).Distinct());Assert.Equal(before,await S(sql,("c",db.Company)));
    }

    [Fact]public async Task Sales_documents_search_formal_number_and_links_resolve_to_authorized_details()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,0);
        await S("UPDATE core.companies SET gst_registered=true WHERE id=@c",("c",db.Company));
        var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Search service",p.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var q=await Submitted(c,d.Draft());var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var line=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();
        var v=(await Get(c,$"/sales-orders/{o}/invoiceable")).GetProperty("version").GetInt64();
        var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(line,2)],"D01-fulfilment-reference"),v),HttpStatusCode.Created);
        var credit=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{Id(invoice)}/amount-credit-notes",new AmountCreditInput("Search credit",[new(Id(invoice.GetProperty("lines")[0]),1,0.1m,"Adjustment")])),HttpStatusCode.Created);
        var expected=new Dictionary<string,Guid>{{"QUOTE",q.Id},{"SALES_ORDER",o},{"INVOICE",Id(invoice)},{"CUSTOMER_CREDIT",Id(credit)}};
        foreach(var pair in expected){var row=Items(await Search(c,"Stage B customer","&kind="+pair.Key)).Single();Assert.Equal(pair.Value,Id(row));var number=row.GetProperty("code").GetString()!;Assert.Contains(Items(await Search(c,number)),x=>Id(x)==pair.Value);await Expect(await c.GetAsync(row.GetProperty("apiPath").GetString()),HttpStatusCode.OK);}
        Assert.Equal(Id(invoice),Id(Items(await Search(c,"D01-fulfilment-reference")).Single()));
        await FinancialReportAssertions.Check(c);
    }
    [Fact]public async Task Purchase_order_expense_bill_and_credit_references_share_search_without_cost_disclosure()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,0);
        await S("UPDATE core.companies SET gst_registered=true WHERE id=@c",("c",db.Company));
        var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"D01 supplier",null));
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(supplier,d.Warehouse,[new(d.BoxUnit,2,10)])),HttpStatusCode.Created);
        var account=(Guid)(await S("INSERT INTO accounting.accounts(company_id,code,name,kind)VALUES(@c,'6060','Search expenses','EXPENSE')RETURNING id",("c",db.Company)))!;
        var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@c AND code='GST'",("c",db.Company)))!;
        var today=DateOnly.Parse((string)(await S("SELECT ((now()AT TIME ZONE timezone)::date)::text FROM core.companies WHERE id=@c",("c",db.Company)))!);
        var bill=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(supplier,"D01-VENDOR-INVOICE",today,today.AddDays(30),today,[new(account,"Search expenses",100,10,tax)],"Verified",today)),HttpStatusCode.Created);
        var credit=await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{Id(bill.GetProperty("bill"))}/amount-credits",new SupplierAmountCreditInput("D01-VENDOR-CREDIT","Correction",[new(Id(bill.GetProperty("lines")[0]),1,0.1m,"Search adjustment")])),HttpStatusCode.Created);
        var expected=new Dictionary<string,Guid>{{"PURCHASE_ORDER",Id(po.GetProperty("order"))},{"SUPPLIER_BILL",Id(bill.GetProperty("bill"))},{"SUPPLIER_CREDIT",Id(credit.GetProperty("credit"))}};
        foreach(var pair in expected){var row=Items(await Search(c,"D01 supplier","&kind="+pair.Key)).Single();Assert.Equal(pair.Value,Id(row));Assert.False(row.TryGetProperty("cost",out _));await Expect(await c.GetAsync(row.GetProperty("apiPath").GetString()),HttpStatusCode.OK);}
        Assert.Equal(expected["SUPPLIER_BILL"],Id(Items(await Search(c,"D01-VENDOR-INVOICE")).Single()));
        Assert.Equal(expected["SUPPLIER_CREDIT"],Id(Items(await Search(c,"D01-VENDOR-CREDIT")).Single()));await FinancialReportAssertions.Check(c);
    }
    [Fact]public async Task Snapshot_keeps_items_and_counts_consistent_when_another_customer_commits()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await Create(c,"/customers",new CustomerDraft(Code(),"SnapshotSearch first",null));
        await using var gate=new NpgsqlConnection(db.Owner);await gate.OpenAsync();long key=Random.Shared.NextInt64(1,long.MaxValue);
        await using(var take=new NpgsqlCommand("SELECT pg_advisory_lock(@key)",gate)){take.Parameters.AddWithValue("key",key);await take.ExecuteNonQueryAsync();}
        await using var reader=await db.SessionAsync();var query=Sql.RowsAsync(reader,"WITH gate AS MATERIALIZED(SELECT pg_advisory_xact_lock(@key)) SELECT platform.global_search('SnapshotSearch','CUSTOMER')::text AS body FROM gate",default,("key",key));
        try{bool waiting=false;for(int n=0;n<100;n++){waiting=(bool)(await S("SELECT cardinality(pg_blocking_pids(@pid))>0",("pid",reader.Connection.ProcessID)))!;if(waiting)break;await Task.Delay(10);}Assert.True(waiting);await Create(c,"/customers",new CustomerDraft(Code(),"SnapshotSearch second",null));}
        finally{await using var unlock=new NpgsqlCommand("SELECT pg_advisory_unlock(@key)",gate);unlock.Parameters.AddWithValue("key",key);await unlock.ExecuteNonQueryAsync();}
        var rows=await query;var old=JsonDocument.Parse((string)rows[0]["body"]!).RootElement;Assert.Equal(1,old.GetProperty("totalCount").GetInt32());Assert.Single(Items(old));
        var current=await Search(c,"SnapshotSearch","&kind=CUSTOMER");Assert.Equal(2,current.GetProperty("totalCount").GetInt32());Assert.Equal(2,Items(current).Length);
    }
    [Theory][InlineData("htt_portal")][InlineData("htt_worker")]
    public async Task Portal_and_worker_roles_cannot_call_global_search(string role)
    {Assert.False((bool)(await S("SELECT has_function_privilege(@role,'platform.global_search(text,text,integer,integer)','EXECUTE')",("role",role)))!);}
}
