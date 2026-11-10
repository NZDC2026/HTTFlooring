using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class DirectOrderTests:IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private static DirectOrderInput Input(SalesData d,decimal boxes=2)=>new(d.Customer,d.Branch,d.Warehouse,[new(d.BoxUnit,Quantity:boxes)],"Office verified customer instruction","Deliver after confirmation");
    private static Task<HttpResponseMessage> Direct(HttpClient c,DirectOrderInput input,string? key=null)=>Send(c,HttpMethod.Post,"/sales-orders",input,key:key);
    private static Guid Id(JsonElement e)=>e.GetProperty("orderId").GetGuid();
    private Task<object?> Next()=>S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SALES_ORDER'",("company",db.Company));
    private Task<object?> Count(string table)=>S($"SELECT count(*) FROM {table} WHERE company_id=@company",("company",db.Company));
    private static async Task<(Guid Line,long Version)> OrderLine(HttpClient c,Guid id){var o=await Get(c,$"/sales-orders/{id}");return(o.GetProperty("lines")[0].GetProperty("id").GetGuid(),o.GetProperty("version").GetInt64());}
    [Fact]
    public async Task Office_creates_a_real_direct_order_without_quotes_approvals_or_Q_numbers()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,"OFFICE");using var c=api.Authenticated(staff.Subject);var quotes=await Count("sales.quotes");var approvals=await Count("platform.approval_requests");var qnext=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'",("company",db.Company));var before=(long)(await Next())!;
        var result=await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);var id=Id(result);Assert.StartsWith("SO-",result.GetProperty("number").GetString());Assert.Equal("DIRECT",result.GetProperty("orderOrigin").GetString());Assert.Equal(JsonValueKind.Null,result.GetProperty("sourceQuoteId").ValueKind);Assert.Equal(before+1,await Next());
        Assert.Equal(quotes,await Count("sales.quotes"));Assert.Equal(approvals,await Count("platform.approval_requests"));Assert.Equal(qnext,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='QUOTE'",("company",db.Company)));Assert.Equal(4.4m,await Reserved(admin,d));
        var o=await Get(admin,$"/sales-orders/{id}");Assert.Equal("CONFIRMED",o.GetProperty("state").GetString());Assert.Equal("DIRECT",o.GetProperty("orderOrigin").GetString());Assert.Equal(48.4m,D(o.GetProperty("gross")));Assert.Equal(Input(d).Reason,o.GetProperty("creationReason").GetString());Assert.Equal(Input(d).Notes,o.GetProperty("notes").GetString());Assert.Equal(48.4m,D((await Get(admin,$"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
        Assert.Equal(1L,await S("SELECT count(*) FROM sales.credit_decisions WHERE company_id=@company AND order_id=@id AND order_amount=48.4",("company",db.Company),("id",id)));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@id",("company",db.Company),("id",id)));
        Assert.Equal(0L,await S("SELECT count(*) FROM sales.order_lines WHERE company_id=@company AND order_id=@id AND source_quote_line_id IS NOT NULL",("company",db.Company),("id",id)));
    }
    [Theory]
    [InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("FINANCE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Non_office_roles_cannot_create_even_with_office_headers(string role)
    {await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,role,d);using var c=api.Authenticated(staff.Subject);c.DefaultRequestHeaders.Add("X-Role","OFFICE");await Expect(await Direct(c,Input(d)),HttpStatusCode.Forbidden);Assert.Equal(0,await Reserved(admin,d));}
    [Fact]
    public async Task Scoped_office_cannot_use_unassigned_customer_warehouse_or_other_company_ids()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var other=await Setup(db,admin);var user=await Staff(db,"OFFICE",d);using var c=api.Authenticated(user.Subject);
        await S("DELETE FROM identity.role_permissions rp USING identity.roles r WHERE rp.company_id=@company AND rp.role_id=r.id AND r.company_id=rp.company_id AND r.code='OFFICE' AND rp.permission_code IN('customers.all','warehouses.all')",("company",db.Company));
        try{await Expect(await Direct(c,Input(other)),HttpStatusCode.NotFound);await Expect(await Direct(c,Input(d) with{WarehouseId=other.Warehouse}),HttpStatusCode.NotFound);using var foreign=api.Authenticated(company:db.OtherCompany);await Expect(await Direct(foreign,Input(d)),HttpStatusCode.NotFound);await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);}
        finally{await S("INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT @company,id,p FROM identity.roles CROSS JOIN unnest(ARRAY['customers.all','warehouses.all']) p WHERE company_id=@company AND code='OFFICE' ON CONFLICT DO NOTHING",("company",db.Company));}
    }
    [Fact]
    public async Task Branch_from_a_different_customer_is_rejected_without_reservations()
    {await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var other=await Setup(db,c);var next=await Next();await Expect(await Direct(c,Input(d) with{CustomerBranchId=other.Branch}),HttpStatusCode.NotFound);Assert.Equal(next,await Next());Assert.Equal(0,await Reserved(c,d));}
    [Theory]
    [InlineData("hold")][InlineData("inactive-customer")][InlineData("branch")][InlineData("warehouse")][InlineData("quarantine")][InlineData("product")][InlineData("sell-disabled")][InlineData("unit")]
    public async Task Inactive_or_held_master_data_cannot_be_used_for_confirmation(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var next=await Next();
        switch(kind){case "hold":case "inactive-customer":await S("UPDATE crm.customers SET status=@status WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Customer),("status",kind=="hold"?"ON_HOLD":"INACTIVE"));break;case "branch":await S("UPDATE crm.customer_branches SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Branch));break;case "warehouse":await S("UPDATE catalog.warehouses SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Warehouse));break;case "quarantine":await S("UPDATE catalog.warehouses SET kind='QUARANTINE' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Warehouse));break;case "product":await S("UPDATE catalog.products SET status='INACTIVE' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Product));break;case "sell-disabled":await S("UPDATE catalog.products SET sell_enabled=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Product));break;case "unit":await S("UPDATE catalog.product_units SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.BoxUnit));break;}
        await Expect(await Direct(c,Input(d)),kind is "hold" or "inactive-customer"?HttpStatusCode.Conflict:HttpStatusCode.NotFound);Assert.Equal(next,await Next());Assert.Equal(0L,await Count("sales.orders"));
    }
    [Theory]
    [InlineData(0,0)][InlineData(-1,0)][InlineData(1.5,0)][InlineData(1,101)][InlineData(1,-1)]
    public async Task Invalid_quantity_or_discount_rolls_back_before_allocating_a_number(decimal quantity,decimal discount)
    {await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var next=await Next();await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,Quantity:quantity,DiscountPercent:discount)]}),HttpStatusCode.UnprocessableEntity);Assert.Equal(next,await Next());Assert.Equal(0,await Reserved(c,d));}
    [Fact]
    public async Task Area_rounding_and_duplicate_SKU_demand_share_the_existing_pack_and_reservation_rules()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,4.4m);var next=await Next();await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,Quantity:2),new(d.BoxUnit,Quantity:2)]}),HttpStatusCode.Conflict);Assert.Equal(next,await Next());Assert.Equal(0,await Reserved(c,d));var r=await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,RequestedArea:2.3m)]}),HttpStatusCode.Created);var line=(await Get(c,$"/sales-orders/{Id(r)}")).GetProperty("lines")[0];Assert.Equal(2,D(line.GetProperty("quantity")));Assert.Equal(4.4m,D(line.GetProperty("baseQuantity")));Assert.Equal(2.3m,D(line.GetProperty("snapshot").GetProperty("requestedArea")));
    }
    [Fact]
    public async Task Pricing_precedence_floor_and_override_permissions_are_reused()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var at=DateTimeOffset.UtcNow.AddHours(-1);await Create(admin,"/pricing/customer-prices",new CustomerPriceMaintenance(d.Customer,d.BoxUnit,"FIXED_PRICE",FixedPrice:20,DiscountPercent:null,EffectiveFrom:at));await Create(admin,"/pricing/floors",new FloorMaintenance(d.BoxUnit,19));
        var r=await Expect(await Direct(admin,Input(d)),HttpStatusCode.Created);Assert.Equal(44,D((await Get(admin,$"/sales-orders/{Id(r)}")).GetProperty("gross")));await Expect(await Direct(admin,Input(d) with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:18)]}),HttpStatusCode.UnprocessableEntity);
        var staff=await Staff(db,"OFFICE");using var c=api.Authenticated(staff.Subject);await S("DELETE FROM identity.role_permissions rp USING identity.roles r WHERE rp.company_id=@company AND rp.role_id=r.id AND r.code='OFFICE' AND r.company_id=rp.company_id AND rp.permission_code='sales.quotes.price.override'",("company",db.Company));
        try{await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:21)]}),HttpStatusCode.Forbidden);}
        finally{await S("INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT @company,id,'sales.quotes.price.override' FROM identity.roles WHERE company_id=@company AND code='OFFICE' ON CONFLICT DO NOTHING",("company",db.Company));}
    }
    [Fact]
    public async Task Client_totals_numbers_tax_and_provenance_cannot_override_authoritative_order_facts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var r=await Expect(await Send(c,HttpMethod.Post,"/sales-orders",new{customerId=d.Customer,customerBranchId=d.Branch,warehouseId=d.Warehouse,lines=new[]{new{productUnitId=d.BoxUnit,quantity=2,taxRate=0,gross=0}},reason="Office verified",gross=0,number="SO-FAKE",state="DRAFT",orderOrigin="QUOTE",sourceQuoteId=Guid.NewGuid()}),HttpStatusCode.Created);var o=await Get(c,$"/sales-orders/{Id(r)}");Assert.Equal(48.4m,D(o.GetProperty("gross")));Assert.Equal("CONFIRMED",o.GetProperty("state").GetString());Assert.Equal("DIRECT",o.GetProperty("orderOrigin").GetString());Assert.NotEqual("SO-FAKE",o.GetProperty("number").GetString());Assert.Equal(JsonValueKind.Null,o.GetProperty("sourceQuoteId").ValueKind);
    }
    [Fact]
    public async Task Credit_is_tax_inclusive_and_allows_exact_limit_but_never_over_limit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var low=await Setup(db,c,22,44);var next=await Next();await Expect(await Direct(c,Input(low)),HttpStatusCode.Conflict);Assert.Equal(next,await Next());Assert.Equal(0,await Reserved(c,low));var exact=await Setup(db,c,22,48.4m);await Expect(await Direct(c,Input(exact)),HttpStatusCode.Created);Assert.Equal(4.4m,await Reserved(c,exact));
    }
    [Fact]
    public async Task Idempotency_returns_one_order_without_repricing_or_reconfirming_cancelled_orders()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var key=Code();var next=(long)(await Next())!;var first=await Expect(await Direct(c,Input(d),key),HttpStatusCode.Created);var replay=await Expect(await Direct(c,Input(d),key),HttpStatusCode.Created);Assert.Equal(Id(first),Id(replay));await Expect(await Direct(c,Input(d) with{Notes="Different"},key),HttpStatusCode.Conflict);
        await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{Id(first)}/cancel",new ReviewInput("Customer cancelled"),1),HttpStatusCode.OK);await Expect(await Direct(c,Input(d),key),HttpStatusCode.Created);Assert.Equal(next+1,await Next());Assert.Equal(0,await Reserved(c,d));Assert.Equal("CANCELLED",(await Get(c,$"/sales-orders/{Id(first)}")).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Concurrent_same_key_creates_one_order_one_decision_one_commitment_and_one_audit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var key=Code();var responses=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Direct(c,Input(d),key)));var ids=(await Task.WhenAll(responses.Select(r=>Expect(r,HttpStatusCode.Created)))).Select(Id).Distinct().ToArray();Assert.Single(ids);Assert.Equal(4.4m,await Reserved(c,d));Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action='sales.order_confirmed'",("company",db.Company),("id",ids[0])));Assert.Equal(1L,await S("SELECT count(*) FROM sales.credit_decisions WHERE company_id=@company AND order_id=@id",("company",db.Company),("id",ids[0])));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Direct_and_quote_conversion_share_one_number_stream_and_one_customer_credit_lock(bool quoted)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,22,48.4m);var q=quoted?await Submitted(c,d.Draft()):default;var next=(long)(await Next())!;var replies=await Task.WhenAll(Direct(c,Input(d)),quoted?Approve(c,q.Id,q.Version):Direct(c,Input(d)));Assert.Single(replies,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(replies,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal(next+1,await Next());Assert.Equal(4.4m,await Reserved(c,d));Assert.Equal(48.4m,D((await Get(c,$"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Last_stock_is_shared_with_other_direct_orders_and_quoted_orders(bool quoted)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Setup(db,c,4.4m);var customer=await Create(c,"/customers",new CustomerDraft(Code(),"Second customer",null,10000));var branch=await Create(c,$"/customers/{customer}/branches",new BranchMaintenance(Code(),"Second store","20 Test St","Sydney","NSW","2000"));var b=a with{Customer=customer,Branch=branch};var q=quoted?await Submitted(c,b.Draft()):default;var r=await Task.WhenAll(Direct(c,Input(a)),quoted?Approve(c,q.Id,q.Version):Direct(c,Input(b)));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(4.4m,await Reserved(c,a));
    }
    [Fact]
    public async Task Parallel_direct_orders_allocate_distinct_formal_numbers()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Setup(db,c,44);var q1=await Submitted(c,a.Draft());var q2=await Submitted(c,a.Draft());var before=(long)(await Next())!;var replies=await Task.WhenAll(Enumerable.Range(0,3).Select(_=>Direct(c,Input(a))).Concat([Approve(c,q1.Id,q1.Version),Approve(c,q2.Id,q2.Version)]));var result=await Task.WhenAll(replies.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Equal(5,result.Select(x=>x.GetProperty("number").GetString()).Distinct().Count());Assert.Equal(before+5,await Next());Assert.Equal(22,await Reserved(c,a));
    }
    [Fact]
    public async Task Audit_failure_rolls_back_header_lines_credit_reservations_number_and_success_key()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var key=Code();var next=await Next();await S("CREATE FUNCTION sales.direct_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='sales.order_confirmed' THEN RAISE EXCEPTION 'injected direct failure';END IF;RETURN NEW;END $$;CREATE TRIGGER direct_test_failure BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION sales.direct_test_failure()");
        try{await Expect(await Direct(c,Input(d),key),HttpStatusCode.ServiceUnavailable);Assert.Equal(next,await Next());Assert.Equal(0L,await Count("sales.orders"));Assert.Equal(0,await Reserved(c,d));Assert.Equal(0L,await S("SELECT count(*) FROM platform.idempotency_requests WHERE company_id=@company AND key=@key",("company",db.Company),("key",key)));}
        finally{await S("DROP TRIGGER direct_test_failure ON platform.audit_events;DROP FUNCTION sales.direct_test_failure()");}
        await Expect(await Direct(c,Input(d),key),HttpStatusCode.Created);
    }
    [Theory]
    [InlineData("read",403)][InlineData("create",403)][InlineData("customer",404)][InlineData("warehouse",404)]
    public async Task Cache_replay_rechecks_customer_warehouse_and_create_read_permissions(string revoked,int status)
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,"OFFICE",d);using var c=api.Authenticated(staff.Subject);var key=Code();await Expect(await Direct(c,Input(d),key),HttpStatusCode.Created);
        var permission=revoked switch{"read"=>"sales.orders.read","create"=>"sales.orders.create","customer"=>"customers.all",_=>"warehouses.all"};
        await S("DELETE FROM identity.role_permissions p USING identity.roles r WHERE p.company_id=@company AND p.role_id=r.id AND r.company_id=p.company_id AND r.code='OFFICE' AND p.permission_code=@permission",("company",db.Company),("permission",permission));
        if(revoked=="customer")await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@member",("company",db.Company),("member",staff.Membership));
        if(revoked=="warehouse")await S("DELETE FROM identity.warehouse_scopes WHERE company_id=@company AND membership_id=@member",("company",db.Company),("member",staff.Membership));
        await Expect(await Direct(c,Input(d),key),(HttpStatusCode)status);Assert.Equal(1L,await Count("sales.orders"));
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Direct_orders_support_prepayment_dispatch_invoice_credit_refund_and_reconciliation(string basis,bool stock)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));var d=await Setup(db,c,stock?4.4m:0);
        if(!stock){var product=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(product.GetProperty("sku").GetString()!,"Direct service",product.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);}
        var order=await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);var id=Id(order);var(line,version)=await OrderLine(c,id);var receipt=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(48.4m,"BANK_TRANSFER",Code(),[],[new(line,48.4m)])),HttpStatusCode.Created);var advance=receipt.GetProperty("advances")[0].GetProperty("id").GetGuid();
        if(stock){await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,20.01m,Code(),DatabaseFixture.Issuer,db.Subject);var pick=await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{id}/picks",new PickInput([new(line,2)]),version),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick.GetProperty("id").GetGuid()}/confirm",new DispatchInput("PICKUP","Customer",Code()),1),HttpStatusCode.OK);}
        var iv=(await Get(c,$"/sales-orders/{id}/invoiceable")).GetProperty("version").GetInt64();var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/invoices",new InvoiceInput([new(line,2)],"Completed"),iv),HttpStatusCode.Created);var il=invoice.GetProperty("lines")[0].GetProperty("id").GetGuid();Assert.Equal(4.4m,D(invoice.GetProperty("tax")));await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{advance}/apply",new AdvanceApplicationInput(Code(),[new(il,48.4m)])),HttpStatusCode.Created);
        Guid? returned=null;if(stock){var movement=(await Get(c,$"/warehouse/orders/{id}/returnable")).GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid();var r=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/returns",new SalesReturnInput(d.Warehouse,"RESTOCK","Full inspected return",[new(movement,2,il)])),HttpStatusCode.Created);returned=r.GetProperty("lines")[0].GetProperty("id").GetGuid();}
        var credit=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{invoice.GetProperty("id").GetGuid()}/credit-notes",new CreditNoteInput("Cancelled supply",[new(il,2,returned)])),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/refunds",new CustomerRefundInput(48.4m,Code(),"Refund completed",credit.GetProperty("lines")[0].GetProperty("id").GetGuid())),HttpStatusCode.Created);
        var exposure=await Get(c,$"/customers/{d.Customer}/credit");Assert.Equal(0,D(exposure.GetProperty("receivable")));Assert.Equal(0,D(exposure.GetProperty("unbilledOrders")));Assert.Equal(0,D(exposure.GetProperty("availableAdvances")));var reconciliation=await Get(c,"/accounting/reconciliation");Assert.True(reconciliation.GetProperty("status").GetString()=="CONSISTENT",reconciliation.GetRawText());
    }
    [Fact]
    public async Task Multiple_SKUs_fail_atomically_when_one_has_no_stock_in_the_selected_warehouse()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var other=await Setup(db,c);var next=await Next();await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,Quantity:2),new(other.BoxUnit,Quantity:2)]}),HttpStatusCode.Conflict);Assert.Equal(0,await Reserved(c,d));Assert.Equal(next,await Next());Assert.Equal(0L,await Count("sales.orders"));Assert.Equal(0L,await Count("sales.credit_decisions"));
    }
    [Theory]
    [InlineData("reason",422)][InlineData("key",400)][InlineData("lines",422)][InlineData("ambiguous-quantity",422)]
    public async Task Required_metadata_and_line_validation_cannot_allocate_a_number(string invalid,int status)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var input=Input(d);if(invalid=="reason")input=input with{Reason=" "};if(invalid=="lines")input=input with{Lines=[]};if(invalid=="ambiguous-quantity")input=input with{Lines=[new(d.BoxUnit,Quantity:1,RequestedArea:1)]};var before=await Next();
        if(invalid=="key"){using var request=new HttpRequestMessage(HttpMethod.Post,"/api/v1/sales-orders"){Content=JsonContent.Create(input)};await Expect(await c.SendAsync(request),(HttpStatusCode)status);}else await Expect(await Direct(c,input),(HttpStatusCode)status);Assert.Equal(before,await Next());Assert.Equal(0L,await Count("sales.orders"));
    }
    [Fact]
    public async Task Zero_value_order_still_reserves_physical_quantity_without_adding_credit_exposure()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,4.4m,0);var r=await Expect(await Direct(c,Input(d) with{Lines=[new(d.BoxUnit,Quantity:2,UnitPrice:0)]}),HttpStatusCode.Created);Assert.Equal(0,D((await Get(c,$"/sales-orders/{Id(r)}")).GetProperty("gross")));Assert.Equal(4.4m,await Reserved(c,d));Assert.Equal(0,D((await Get(c,$"/customers/{d.Customer}/credit")).GetProperty("unbilledOrders")));
    }
    [Fact]
    public async Task Anonymous_and_customer_portal_tokens_cannot_call_the_office_creation_route()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);using var anonymous=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var c in new[]{anonymous,portal})Assert.Equal(HttpStatusCode.Unauthorized,(await c.PostAsJsonAsync("/api/v1/sales-orders",Input(d))).StatusCode);Assert.Equal(0L,await Count("sales.orders"));
    }
    [Fact]
    public async Task Database_insert_cannot_forge_direct_authority_for_a_sales_member()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,"SALES",d);var actor=(Guid)(await S("SELECT user_id FROM identity.memberships WHERE id=@id",("id",staff.Membership)))!;var id=Guid.NewGuid();await using var s=await db.SessionAsync();await Sql.RowsAsync(s,"SELECT set_config('htt.actor_id',@actor::text,true)",default,("actor",actor));await Sql.RowsAsync(s,"INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(@id,@company,'SALES_ORDER','SO-TEST',current_date,'CONFIRMED',@actor)",default,("id",id),("company",db.Company),("actor",actor));
        var denied=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"INSERT INTO sales.orders(id,company_id,order_origin,creation_reason,pricing_at,customer_id,customer_branch_id,warehouse_id,customer_snapshot,net,tax,gross,approved_by,created_by) VALUES(@id,@company,'DIRECT','Forged',now(),@customer,@branch,@warehouse,'{}',0,0,0,@actor,@actor)",default,("id",id),("company",db.Company),("actor",actor),("customer",d.Customer),("branch",d.Branch),("warehouse",d.Warehouse)));Assert.Equal("42501",denied.SqlState);
    }
    [Fact]
    public async Task Cancelled_direct_order_can_be_trashed_and_restored_without_reopening_reservations()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var r=await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);var id=Id(r);await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/cancel",new ReviewInput("Cancelled"),1),HttpStatusCode.OK);var life=await Get(c,$"/documents/{id}/lifecycle");var version=life.GetProperty("documentVersion").GetInt64();
        foreach(var restore in new[]{false,true}){using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{id}/"+(restore?"restore":"trash"));request.Headers.Add("If-Match",restore?"\"2\"":"\"1\"");request.Headers.Add("X-Document-Version",version.ToString());request.Headers.Add("Idempotency-Key",Code());request.Content=JsonContent.Create(new DocumentTrashInput("Visibility reviewed"));await Expect(await c.SendAsync(request),HttpStatusCode.OK);}Assert.Equal("CANCELLED",(await Get(c,$"/sales-orders/{id}")).GetProperty("state").GetString());Assert.Equal(0,await Reserved(c,d));
    }
    [Fact]
    public async Task Direct_order_tax_snapshot_survives_later_product_tax_changes_for_prepayment_and_invoicing()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await S("UPDATE core.companies SET gst_registered=true WHERE id=@company",("company",db.Company));var d=await Setup(db,c,0);var product=await Get(c,$"/products/{d.Product}");var sku=product.GetProperty("sku").GetString()!;await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(sku,"Frozen tax service",product.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var r=await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);var id=Id(r);var(line,version)=await OrderLine(c,id);var free=(await Get(c,"/foundation")).GetProperty("taxCodes").EnumerateArray().Single(x=>x.GetProperty("code").GetString()=="FRE").GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(sku,"Now tax free",free,ItemType:"SERVICE",WholePacks:false),2),HttpStatusCode.OK);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(48.4m,"BANK_TRANSFER",Code(),[],[new(line,48.4m)])),HttpStatusCode.Created);Assert.Equal(4.4m,await S("SELECT gst_amount FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@line",("company",db.Company),("line",line)));
        var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/invoices",new InvoiceInput([new(line,2)],"Completed"),version),HttpStatusCode.Created);Assert.Equal(4.4m,D(invoice.GetProperty("tax")));
    }
    [Fact]
    public async Task Confirmed_order_authoritative_facts_and_line_snapshots_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var r=await Expect(await Direct(c,Input(d)),HttpStatusCode.Created);var id=Id(r);
        foreach(var sql in new[]{"UPDATE sales.orders SET notes='rewritten' WHERE company_id=@company AND id=@id","UPDATE sales.order_lines SET unit_price=1 WHERE company_id=@company AND order_id=@id"}){var denied=await Assert.ThrowsAsync<PostgresException>(()=>S(sql,("company",db.Company),("id",id)));Assert.Equal("23514",denied.SqlState);}
    }
    [Fact]
    public async Task Quoted_order_retains_quote_tax_authority_when_historical_display_snapshot_differs()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();await S("UPDATE core.companies SET gst_registered=true WHERE id=@company",("company",db.Company));var d=await Setup(db,c,0);var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Historical service",p.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var q=await Submitted(c,d.Draft());
        // Simulate an old imported display snapshot at insertion, without disabling immutable-ledger triggers.
        await S("CREATE FUNCTION sales.direct_test_old_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.source_quote_line_id IS NOT NULL THEN NEW.snapshot:=jsonb_set(NEW.snapshot,'{taxRate}','\"0\"'::jsonb);END IF;RETURN NEW;END $$;CREATE TRIGGER direct_test_old_snapshot BEFORE INSERT ON sales.order_lines FOR EACH ROW EXECUTE FUNCTION sales.direct_test_old_snapshot()");
        Guid id;try{id=Id(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created));}finally{await S("DROP TRIGGER direct_test_old_snapshot ON sales.order_lines;DROP FUNCTION sales.direct_test_old_snapshot()");}
        var(line,version)=await OrderLine(c,id);await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(48.4m,"BANK_TRANSFER",Code(),[],[new(line,48.4m)])),HttpStatusCode.Created);Assert.Equal(4.4m,await S("SELECT gst_amount FROM accounting.customer_advances WHERE company_id=@company AND order_line_id=@line",("company",db.Company),("line",line)));
        var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/invoices",new InvoiceInput([new(line,2)],"Completed"),version),HttpStatusCode.Created);var gst=await Get(c,$"/sales-invoices/{invoice.GetProperty("id").GetGuid()}/gst");Assert.Equal(0.1m,D(gst.GetProperty("entries")[0].GetProperty("taxRate")));Assert.Equal(4.4m,D(invoice.GetProperty("tax")));
    }
}
