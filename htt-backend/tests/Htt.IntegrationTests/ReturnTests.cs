using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class ReturnTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private sealed record Data(SalesData Sales,Guid Order,Guid Line,Guid Movement);
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private async Task<Data> SetupOrder(HttpClient c,bool stock=true,bool dispatch=true,string basis="CASH",decimal price=22,decimal quantity=2,string? taxCode=null)
    {
        // Owner test fixture supports independent scenarios under both bases.
        await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));
        var d=await Setup(db,c,stock?quantity*2.2m:0);
        if(!stock||taxCode is not null)
        {
            var p=await Get(c,$"/products/{d.Product}");var tax=p.GetProperty("taxCodeId").GetGuid();
            if(taxCode is not null)tax=(await Get(c,"/foundation")).GetProperty("taxCodes").EnumerateArray().Single(t=>t.GetProperty("code").GetString()==taxCode).GetProperty("id").GetGuid();
            await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Return test",tax,ItemType:stock?"STOCK":"SERVICE",WholePacks:stock),1),HttpStatusCode.OK);
        }
        var q=await Submitted(c,d.Draft(quantity) with{Lines=[new(d.BoxUnit,Quantity:quantity,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var line=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();Guid movement=Guid.Empty;
        if(stock&&dispatch)
        {
            await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,20.01m,"Return opening",DatabaseFixture.Issuer,db.Subject);
            var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{o}/picks",new PickInput([new(line,quantity)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();
            await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer","Docket"),1),HttpStatusCode.OK);
            movement=(await Get(c,$"/warehouse/orders/{o}/returnable")).GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid();
        }
        return new(d,o,line,movement);
    }
    private static async Task<JsonElement> Bill(HttpClient c,Data d,decimal qty=2)
    {
        var v=(await Get(c,$"/sales-orders/{d.Order}/invoiceable")).GetProperty("version").GetInt64();
        return await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{d.Order}/invoices",new InvoiceInput([new(d.Line,qty)],"Completed"),v),HttpStatusCode.Created);
    }
    private static Guid Id(JsonElement r)=>r.GetProperty("id").GetGuid();
    private static Guid IL(JsonElement r)=>r.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Return(HttpClient c,Data d,decimal qty=1,Guid? invoiceLine=null,string? key=null,Guid? warehouse=null,string disposition="RESTOCK")=>Send(c,HttpMethod.Post,$"/sales-orders/{d.Order}/returns",new SalesReturnInput(warehouse??d.Sales.Warehouse,disposition,"Customer returned inspected goods",[new(d.Movement,qty,invoiceLine)]),key:key);
    private static Task<HttpResponseMessage> Credit(HttpClient c,JsonElement invoice,decimal qty=1,Guid? returned=null,string? key=null)=>Send(c,HttpMethod.Post,$"/sales-invoices/{Id(invoice)}/credit-notes",new CreditNoteInput("Supply cancelled",[new(IL(invoice),qty,returned)]),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,JsonElement invoice,decimal amount)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/receipts",new CustomerReceiptInput(amount,"BANK_TRANSFER",Code(),[new(IL(invoice),amount)]));
    private static Task<HttpResponseMessage> Prepay(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/receipts",new CustomerReceiptInput(amount,"BANK_TRANSFER",Code(),[],[new(d.Line,amount)]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount,Guid? credit=null,Guid? advance=null,bool cancel=false,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(amount,reference??Code(),"Verified bank refund",credit,advance,cancel),key:key);
    private Task<object?> Balance(Data d,string column)=>S($"SELECT {column} FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.warehouse_id=@warehouse AND b.product_id=@product",("company",db.Company),("warehouse",d.Sales.Warehouse),("product",d.Sales.Product));
    private async Task<(decimal Ar,decimal Advances,decimal Unbilled,decimal Exposure)> CreditState(HttpClient c,Data d)
    {
        var x=await Get(c,$"/customers/{d.Sales.Customer}/credit");return(D(x.GetProperty("receivable")),D(x.GetProperty("availableAdvances")),D(x.GetProperty("unbilledOrders")),D(x.GetProperty("exposure")));
    }
    private Task<object?> Gst(Data d)=>S("""
        SELECT coalesce(sum(tax),0) FROM (
         SELECT g.gst_amount tax FROM accounting.gst_attributions g LEFT JOIN accounting.customer_receipts r ON r.company_id=g.company_id AND r.id=g.receipt_id LEFT JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id LEFT JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id WHERE g.company_id=@company AND coalesce(r.customer_id,i.customer_id)=@customer
         UNION ALL SELECT g.gst_amount FROM accounting.gst_adjustments g LEFT JOIN accounting.customer_advances ad ON ad.company_id=g.company_id AND ad.id=g.advance_id LEFT JOIN accounting.customer_receipts r ON r.company_id=ad.company_id AND r.id=ad.receipt_id LEFT JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id LEFT JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id WHERE g.company_id=@company AND coalesce(r.customer_id,i.customer_id)=@customer
        ) v
        """,("company",db.Company),("customer",d.Sales.Customer));
    [Theory]
    [InlineData("CASH")]
    [InlineData("NON_CASH")]
    public async Task Paid_return_credit_and_refund_reverse_stock_cost_revenue_AR_and_GST(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,basis:basis);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);
        var r=await Expect(await Return(c,d,1,IL(i)),HttpStatusCode.Created);Assert.Equal(2.2m,await Balance(d,"on_hand"));Assert.Equal(10.01m,await Balance(d,"value"));
        var cn=await Expect(await Credit(c,i,1,IL(r)),HttpStatusCode.Created);Assert.Equal(24.2m,D(cn.GetProperty("gross")));Assert.Equal((-24.2m,0m,0m,0m),await CreditState(c,d));
        Assert.Equal(basis=="CASH"?4.4m:2.2m,await Gst(d));var f=await Expect(await Refund(c,d,24.2m,IL(cn)),HttpStatusCode.Created);Assert.Equal("POSTED",f.GetProperty("state").GetString());
        Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));Assert.Equal(2.2m,await Gst(d));
        var r2=await Expect(await Return(c,d,1,IL(i)),HttpStatusCode.Created);var cn2=await Expect(await Credit(c,i,1,IL(r2)),HttpStatusCode.Created);await Expect(await Refund(c,d,24.2m,IL(cn2)),HttpStatusCode.Created);
        Assert.Equal(4.4m,await Balance(d,"on_hand"));Assert.Equal(20.01m,await Balance(d,"value"));Assert.Equal(0m,await Gst(d));Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));
        Assert.Equal(3L,await S("SELECT count(*) FROM accounting.reversal_links rl JOIN accounting.posting_batches b ON b.company_id=rl.company_id AND b.id=rl.contra_batch_id WHERE b.company_id=@company AND b.source_document_id IN (@r,@cn,@f)",("company",db.Company),("r",Id(r)),("cn",Id(cn)),("f",Id(f))));
        var ar=(await Get(c,$"/customers/{d.Sales.Customer}/receivables")).GetProperty("items")[0];Assert.Equal(48.4m,D(ar.GetProperty("credited")));Assert.Equal(48.4m,D(ar.GetProperty("refunded")));Assert.Equal(0m,D(ar.GetProperty("outstanding")));
    }
    [Fact]
    public async Task Uninvoiced_return_releases_commitment_and_cannot_be_invoiced_again()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);await Expect(await Return(c,d,1),HttpStatusCode.Created);
        Assert.Equal((0m,0m,24.2m,24.2m),await CreditState(c,d));var open=await Get(c,$"/sales-orders/{d.Order}/invoiceable");Assert.Equal(1m,D(open.GetProperty("lines")[0].GetProperty("availableQuantity")));
        await Bill(c,d,1);Assert.Equal((24.2m,0m,0m,24.2m),await CreditState(c,d));
        var v=(await Get(c,$"/sales-orders/{d.Order}/invoiceable")).GetProperty("version").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{d.Order}/invoices",new InvoiceInput([new(d.Line,1)]),v),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Mixed_invoice_and_unbilled_return_preserve_exact_order_rounding()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,price:0.05m,quantity:3);
        var i=await Bill(c,d,1);await Expect(await Return(c,d,1),HttpStatusCode.Created);var last=await Bill(c,d,1);
        Assert.Equal(0.17m,D(i.GetProperty("gross"))+D(last.GetProperty("gross"))+(decimal)(await S("SELECT cancelled_gross FROM inventory.sales_return_lines WHERE company_id=@company AND order_line_id=@line",("company",db.Company),("line",d.Line)))!);
        Assert.Equal(0m,(await CreditState(c,d)).Unbilled);
    }
    [Fact]
    public async Task Quarantine_return_restores_original_cost_without_creating_sellable_stock()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var wh=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Returns inspection",Kind:"QUARANTINE"));
        await Expect(await Return(c,d,2,warehouse:wh,disposition:"QUARANTINE"),HttpStatusCode.Created);
        var b=(await Get(c,$"/inventory/availability?warehouseId={wh}&productId={d.Sales.Product}")).GetProperty("items")[0];Assert.Equal(4.4m,D(b.GetProperty("onHand")));Assert.Equal(0m,D(b.GetProperty("available")));Assert.Equal(0m,await Balance(d,"on_hand"));
        await Expect(await Return(c,d,1,warehouse:wh,disposition:"RESTOCK"),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Original_issue_cost_is_used_even_if_remaining_inventory_cost_pool_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);
        await S("UPDATE inventory.stock_balances SET on_hand=10 WHERE company_id=@company AND product_id=@product;UPDATE inventory.stock_values SET value=1000 WHERE company_id=@company AND stock_balance_id IN(SELECT id FROM inventory.stock_balances WHERE company_id=@company AND product_id=@product)",("company",db.Company),("product",d.Sales.Product));
        await Expect(await Return(c,d,1),HttpStatusCode.Created);Assert.Equal(12.2m,await Balance(d,"on_hand"));Assert.Equal(1010.01m,await Balance(d,"value"));
    }
    [Fact]
    public async Task Stock_credit_requires_received_matching_billed_return_and_no_double_credit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var i=await Bill(c,d);
        await Expect(await Credit(c,i),HttpStatusCode.UnprocessableEntity);await Expect(await Return(c,d,1),HttpStatusCode.Conflict);
        var r=await Expect(await Return(c,d,1,IL(i)),HttpStatusCode.Created);await Expect(await Credit(c,i,2,IL(r)),HttpStatusCode.Conflict);await Expect(await Credit(c,i,1,IL(r)),HttpStatusCode.Created);await Expect(await Credit(c,i,1,IL(r)),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("CASH")]
    [InlineData("NON_CASH")]
    public async Task Unpaid_service_credit_cancels_AR_but_cannot_fabricate_refundable_cash(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false,basis:basis);var i=await Bill(c,d);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);
        Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));Assert.Equal(0m,await Gst(d));await Expect(await Refund(c,d,1,IL(cn)),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Partial_paid_full_credit_refunds_only_received_amount_and_exact_cash_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);await Expect(await Pay(c,d,i,12.1m),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);
        Assert.Equal((-12.1m,0m,0m,0m),await CreditState(c,d));await Expect(await Refund(c,d,12.11m,IL(cn)),HttpStatusCode.Conflict);await Expect(await Refund(c,d,12.1m,IL(cn)),HttpStatusCode.Created);Assert.Equal(0m,await Gst(d));
    }
    [Fact]
    public async Task Credited_invoice_accepts_only_remaining_net_charge_and_caps_advance_application()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var pre=await Expect(await Prepay(c,d,24.2m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();var i=await Bill(c,d);await Expect(await Credit(c,i,1),HttpStatusCode.Created);
        await Expect(await Pay(c,d,i,24.21m),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{ad}/apply",new AdvanceApplicationInput(Code(),[new(IL(i),24.2m)])),HttpStatusCode.Created);
        await Expect(await Pay(c,d,i,0.01m),HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));Assert.Equal(2.2m,await Gst(d));
    }
    [Theory]
    [InlineData("CASH")]
    [InlineData("NON_CASH")]
    public async Task Advance_refund_with_cancel_reverses_tax_funding_and_order_reservations(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,dispatch:false,basis:basis);var pre=await Expect(await Prepay(c,d,24.2m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();
        await Expect(await Refund(c,d,24.2m,advance:ad,cancel:true),HttpStatusCode.Created);Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));Assert.Equal(0m,await Gst(d));Assert.Equal(0m,await Reserved(c,d.Sales));
        Assert.Equal("CANCELLED",(await Get(c,$"/sales-orders/{d.Order}")).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Partial_advance_refund_then_application_cannot_reuse_refunded_money_or_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var pre=await Expect(await Prepay(c,d,48.4m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();
        await Expect(await Refund(c,d,24.2m,advance:ad),HttpStatusCode.Created);Assert.Equal(2.2m,await Gst(d));var i=await Bill(c,d);
        await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{ad}/apply",new AdvanceApplicationInput(Code(),[new(IL(i),48.4m)])),HttpStatusCode.Conflict);
        await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{ad}/apply",new AdvanceApplicationInput(Code(),[new(IL(i),24.2m)])),HttpStatusCode.Created);Assert.Equal((24.2m,0m,0m,24.2m),await CreditState(c,d));Assert.Equal(2.2m,await Gst(d));
    }
    [Fact]
    public async Task Concurrent_return_commands_cannot_exceed_original_shipment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var r=await Task.WhenAll(Return(c,d,2),Return(c,d,2));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(4.4m,await Balance(d,"on_hand"));
    }
    [Fact]
    public async Task Concurrent_credits_cannot_duplicate_one_return()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var i=await Bill(c,d);var ret=await Expect(await Return(c,d,2,IL(i)),HttpStatusCode.Created);
        var r=await Task.WhenAll(Credit(c,i,2,IL(ret)),Credit(c,i,2,IL(ret)));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));
    }
    [Fact]
    public async Task Concurrent_refunds_cannot_double_spend_invoice_overpayment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);
        var r=await Task.WhenAll(Refund(c,d,48.4m,IL(cn)),Refund(c,d,48.4m,IL(cn)));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));Assert.Equal(0m,await Gst(d));
    }
    [Theory]
    [InlineData("return")]
    [InlineData("credit")]
    [InlineData("refund")]
    public async Task Same_key_concurrent_commands_replay_one_result(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:kind=="return");JsonElement i=default,cn=default;
        if(kind!="return")i=await Bill(c,d);if(kind=="refund"){await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);}
        var key=Code();var reference=Code();var tasks=Enumerable.Range(0,4).Select(_=>kind=="return"?Return(c,d,1,key:key):kind=="credit"?Credit(c,i,1,key:key):Refund(c,d,24.2m,IL(cn),key:key,reference:reference));
        var rows=await Task.WhenAll((await Task.WhenAll(tasks)).Select(x=>Expect(x,HttpStatusCode.Created)));Assert.Single(rows.Select(Id).Distinct());
        var mismatch=kind=="return"?await Return(c,d,2,key:key):kind=="credit"?await Credit(c,i,2,key:key):await Refund(c,d,12.1m,IL(cn),key:key,reference:reference);Assert.Equal(HttpStatusCode.Conflict,mismatch.StatusCode);
    }
    [Fact]
    public async Task Different_staff_or_keys_with_same_bank_reference_cannot_record_refund_twice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var reference=Code();
        var r=await Task.WhenAll(Refund(c,d,12.1m,IL(cn),reference:reference),Refund(f,d,12.1m,IL(cn),reference:reference.ToLowerInvariant()));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(-36.3m,(await CreditState(c,d)).Ar);
    }
    [Fact]
    public async Task Refund_advance_racing_application_cannot_use_same_funds_twice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var pre=await Expect(await Prepay(c,d,24.2m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();var i=await Bill(c,d);
        var r=await Task.WhenAll(Refund(c,d,24.2m,advance:ad),Send(c,HttpMethod.Post,$"/customer-advances/{ad}/apply",new AdvanceApplicationInput(Code(),[new(IL(i),24.2m)])));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0m,(await CreditState(c,d)).Advances);
    }
    [Fact]
    public async Task Credit_and_receipt_racing_never_collect_more_than_net_charge()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);
        var r=await Task.WhenAll(Credit(c,i,2),Pay(c,d,i,48.4m));await Expect(r[0],HttpStatusCode.Created);Assert.Contains(r[1].StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});Assert.Equal(r[1].StatusCode==HttpStatusCode.Created?-48.4m:0m,(await CreditState(c,d)).Ar);
    }
    [Theory]
    [InlineData("inventory.sales_returned")]
    [InlineData("sales.credit_posted")]
    [InlineData("accounting.customer_refunded")]
    public async Task Late_audit_failure_rolls_back_inventory_finance_tax_and_retry_key(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:action=="inventory.sales_returned");JsonElement i=default,cn=default;
        if(action!="inventory.sales_returned")i=await Bill(c,d);if(action=="accounting.customer_refunded"){await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);}
        var before=await CreditState(c,d);var tax=await Gst(d);var key=Code();var reference=Code();
        await S($"CREATE FUNCTION accounting.test_fail_contra() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='{action}' THEN RAISE EXCEPTION 'injected failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_fail_contra BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION accounting.test_fail_contra()");
        try{var result=action=="inventory.sales_returned"?await Return(c,d,1,key:key):action=="sales.credit_posted"?await Credit(c,i,1,key:key):await Refund(c,d,24.2m,IL(cn),key:key,reference:reference);await Expect(result,HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await CreditState(c,d));Assert.Equal(tax,await Gst(d));if(action=="inventory.sales_returned"){Assert.Equal(0m,await Balance(d,"on_hand"));Assert.Equal(0m,await Balance(d,"value"));}}
        finally{await S("DROP TRIGGER test_fail_contra ON platform.audit_events;DROP FUNCTION accounting.test_fail_contra()");}
        var success=action=="inventory.sales_returned"?await Return(c,d,1,key:key):action=="sales.credit_posted"?await Credit(c,i,1,key:key):await Refund(c,d,24.2m,IL(cn),key:key,reference:reference);await Expect(success,HttpStatusCode.Created);
    }
    [Fact]
    public async Task Warehouse_scopes_hide_money_office_cannot_refund_and_cross_company_sources_are_denied()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var i=await Bill(c,d);var worker=await Staff(db,"WAREHOUSE",d.Sales);using var w=api.Authenticated(worker.Subject);
        var ret=await Expect(await Return(w,d,1,IL(i)),HttpStatusCode.Created);Assert.DoesNotContain("cost",ret.GetRawText(),StringComparison.OrdinalIgnoreCase);Assert.DoesNotContain("gross",ret.GetRawText(),StringComparison.OrdinalIgnoreCase);
        await Expect(await Credit(w,i,1,IL(ret)),HttpStatusCode.Forbidden);var cn=await Expect(await Credit(c,i,1,IL(ret)),HttpStatusCode.Created);
        var office=await Staff(db,"OFFICE");using var off=api.Authenticated(office.Subject);await Expect(await Refund(off,d,1,IL(cn)),HttpStatusCode.Forbidden);
        var outsider=await Staff(db,"WAREHOUSE");using var unassigned=api.Authenticated(outsider.Subject);Assert.Equal(HttpStatusCode.Forbidden,(await unassigned.GetAsync($"/api/v1/warehouse/returns/{Id(ret)}")).StatusCode);
        using var other=api.Authenticated(company:db.OtherCompany);Assert.Equal(HttpStatusCode.NotFound,(await other.GetAsync($"/api/v1/sales-credit-notes/{Id(cn)}")).StatusCode);
        var sales=await Staff(db,"SALES",d.Sales);using var s=api.Authenticated(sales.Subject);Assert.Equal(HttpStatusCode.OK,(await s.GetAsync($"/api/v1/sales-credit-notes/{Id(cn)}")).StatusCode);await Expect(await Credit(s,i,1,IL(ret)),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Closed_period_blocks_contra_transactions_without_touching_original_records()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));
        try{await Expect(await Return(c,d,1,IL(i)),HttpStatusCode.UnprocessableEntity);Assert.Equal(0m,await Balance(d,"on_hand"));}
        finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
        Assert.Equal("POSTED",(await Get(c,$"/sales-invoices/{Id(i)}")).GetProperty("state").GetString());
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    public async Task Return_quantities_respect_original_unit_step(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c);await Expect(await Return(c,d,qty),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Non_cash_unbilled_return_reverses_remaining_prepaid_GST_after_money_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,basis:"NON_CASH");var pre=await Expect(await Prepay(c,d,24.2m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();
        await Expect(await Return(c,d,2),HttpStatusCode.Conflict);await Expect(await Refund(c,d,24.2m,advance:ad),HttpStatusCode.Created);Assert.Equal(4.4m,await Gst(d));
        await Expect(await Return(c,d,2),HttpStatusCode.Created);Assert.Equal(0m,await Gst(d));Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));
    }
    [Fact]
    public async Task Advance_refund_removing_required_credit_cover_must_cancel_unfulfilled_order()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,dispatch:false);var pre=await Expect(await Prepay(c,d,24.2m),HttpStatusCode.Created);var ad=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();
        await S("UPDATE crm.customers SET credit_limit=0 WHERE company_id=@company AND id=@customer",("company",db.Company),("customer",d.Sales.Customer));
        await Expect(await Refund(c,d,24.2m,advance:ad),HttpStatusCode.Conflict);await Expect(await Refund(c,d,24.2m,advance:ad,cancel:true),HttpStatusCode.Created);Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));
    }
    [Theory]
    [InlineData("FRE")]
    [InlineData("N-T")]
    public async Task Zero_tax_credit_and_refund_do_not_create_negative_GST(string code)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false,taxCode:code);var i=await Bill(c,d);await Expect(await Pay(c,d,i,44),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);
        await Expect(await Refund(c,d,44,IL(cn)),HttpStatusCode.Created);Assert.Equal(0m,await Gst(d));Assert.Equal((0m,0m,0m,0m),await CreditState(c,d));
    }
    [Fact]
    public async Task Zero_amount_credit_still_closes_quantity_and_cannot_fabricate_cash()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false,price:0);var i=await Bill(c,d);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);Assert.Equal(0m,D(cn.GetProperty("gross")));
        await Expect(await Credit(c,i,1),HttpStatusCode.Conflict);await Expect(await Refund(c,d,0.01m,IL(cn)),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Posted_contra_documents_are_immutable_and_direct_SQL_still_checks_refund_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);var f=await Expect(await Refund(c,d,24.2m,IL(cn)),HttpStatusCode.Created);
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE platform.documents SET number='HACK' WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",Id(cn))));
        await using(var s=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"DELETE FROM accounting.customer_refunds WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",Id(f))));
        var staff=await Staff(db,"SALES",d.Sales);var actor=(Guid)(await S("SELECT id FROM identity.users WHERE issuer=@issuer AND subject=@subject",("issuer",DatabaseFixture.Issuer),("subject",staff.Subject)))!;
        await using var source=NpgsqlDataSource.Create(db.App);await using var scope=new CompanySession(source);await scope.BeginAsync(db.Company,actor,"direct-refund",default);
        var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(scope,"SELECT accounting.post_customer_refund(@credit,NULL,1,'BANK-REF','reason',false)",default,("credit",IL(cn))));Assert.Equal("42501",e.SqlState);
    }
    [Fact]
    public async Task GST_query_includes_negative_refund_adjustment_with_customer_scope()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupOrder(c,stock:false);var i=await Bill(c,d);await Expect(await Pay(c,d,i,48.4m),HttpStatusCode.Created);var cn=await Expect(await Credit(c,i,2),HttpStatusCode.Created);var rf=await Expect(await Refund(c,d,48.4m,IL(cn)),HttpStatusCode.Created);
        var date=DateOnly.Parse(rf.GetProperty("businessDate").GetString()!);var data=await Get(c,$"/accounting/gst-attributions?from={date:yyyy-MM-dd}&to={date.AddDays(1):yyyy-MM-dd}&customerId={d.Sales.Customer}&pageSize=100");var rows=data.GetProperty("items").EnumerateArray().ToArray();
        Assert.Contains(rows,r=>r.GetProperty("kind").GetString()=="CREDIT_REFUND"&&D(r.GetProperty("gstAmount"))==-4.4m);Assert.Equal(0m,rows.Sum(r=>D(r.GetProperty("gstAmount"))));Assert.All(rows,r=>Assert.Equal(d.Sales.Customer,r.GetProperty("customerId").GetGuid()));
    }
}
