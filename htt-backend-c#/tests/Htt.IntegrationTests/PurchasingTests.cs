using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class PurchasingTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private sealed record Data(SalesData Sales,Guid Supplier)
    {
        public PurchaseOrderInput Draft(decimal qty=2,decimal cost=10.005m,bool? recoverable=null)=>new(Supplier,Sales.Warehouse,[new(Sales.BoxUnit,qty,cost,RecoverableGst:recoverable)]);
    }
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private async Task<Data> SetupPurchase(HttpClient c,bool registered=true,decimal opening=0,string itemType="STOCK",string? taxCode=null,string warehouseKind="SELLABLE")
    {
        await S("UPDATE core.companies SET gst_registered=@registered WHERE id=@company",("company",db.Company),("registered",registered));
        var d=await Setup(db,c,opening);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Test flooring supplier",null));
        if(itemType!="STOCK"||taxCode is not null)
        {
            var p=await Get(c,$"/products/{d.Product}");var tax=p.GetProperty("taxCodeId").GetGuid();
            if(taxCode is not null)tax=(await Get(c,"/foundation")).GetProperty("taxCodes").EnumerateArray().Single(t=>t.GetProperty("code").GetString()==taxCode).GetProperty("id").GetGuid();
            await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Purchased item",tax,ItemType:itemType,WholePacks:itemType=="STOCK"),1),HttpStatusCode.OK);
        }
        if(warehouseKind!="SELLABLE") d=d with{Warehouse=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Receiving quarantine",Kind:warehouseKind))};
        return new(d,supplier);
    }
    private static Guid Id(JsonElement view)=>view.GetProperty("order").GetProperty("id").GetGuid();
    private static Guid Line(JsonElement view)=>view.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static long V(JsonElement view)=>view.GetProperty("order").GetProperty("version").GetInt64();
    private static async Task<JsonElement> Draft(HttpClient c,PurchaseOrderInput input,string? key=null)=>await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",input,key:key),HttpStatusCode.Created);
    private static async Task<JsonElement> Confirm(HttpClient c,JsonElement draft,string? key=null)=>await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(draft)}/confirm",version:V(draft),key:key),HttpStatusCode.OK);
    private static async Task<JsonElement> PO(HttpClient c,Guid id)=>await Get(c,$"/purchase-orders/{id}");
    private static Task<HttpResponseMessage> Receive(HttpClient c,Guid order,Guid line,decimal qty,long version,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/purchase-orders/{order}/receipts",new PurchaseReceiptInput(reference??Code(),[new(line,qty)]),version,key);
    private static Guid ReceiptId(JsonElement r)=>r.GetProperty("receipt").GetProperty("id").GetGuid();
    private async Task<(decimal Qty,decimal Reserved,decimal Value)> Balance(Data d)
    {
        await using var s=await db.SessionAsync();var row=(await Sql.RowsAsync(s,"SELECT b.on_hand,b.reserved,v.value FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.warehouse_id=@wh AND b.product_id=@product",default,("company",db.Company),("wh",d.Sales.Warehouse),("product",d.Sales.Product))).SingleOrDefault();
        return row is null?(0m,0m,0m):((decimal)row["on_hand"]!,(decimal)row["reserved"]!,row["value"] is decimal val?val:-1m);
    }
    private Task<object?> Accrued(Data d)=>S("SELECT coalesce(sum(amount),0) FROM accounting.grni_items WHERE company_id=@company AND supplier_id=@supplier",("company",db.Company),("supplier",d.Supplier));
    [Fact]
    public async Task Draft_confirm_partial_receipts_update_stock_value_and_GRNI_atomically_without_AP_or_GST_claim()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var draft=await Draft(c,d.Draft());Assert.Equal(JsonValueKind.Null,draft.GetProperty("order").GetProperty("number").ValueKind);Assert.Equal(0m,await Accrued(d));
        var po=await Confirm(c,draft);Assert.StartsWith("PO-",po.GetProperty("order").GetProperty("number").GetString());Assert.Equal(Line(draft),Line(po));
        var first=await Expect(await Receive(c,Id(po),Line(po),1,V(po)),HttpStatusCode.Created);Assert.Equal((2.2m,0m,10.01m),await Balance(d));Assert.Equal(10.01m,await Accrued(d));
        var updated=await PO(c,Id(po));var second=await Expect(await Receive(c,Id(po),Line(po),1,V(updated)),HttpStatusCode.Created);Assert.Equal((4.4m,0m,20.01m),await Balance(d));Assert.Equal(20.01m,await Accrued(d));
        Assert.NotEqual(first.GetProperty("receipt").GetProperty("number").GetString(),second.GetProperty("receipt").GetProperty("number").GetString());
        Assert.Equal(20.01m,await S("SELECT sum(jl.credit) FROM accounting.journal_lines jl JOIN accounting.journal_entries j ON j.company_id=jl.company_id AND j.id=jl.journal_entry_id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id JOIN accounting.grni_items g ON g.company_id=j.company_id AND g.journal_entry_id=j.id WHERE g.company_id=@company AND g.supplier_id=@supplier AND a.control_kind='GRNI'",("company",db.Company),("supplier",d.Supplier)));
        Assert.Equal(0L,await S("SELECT count(*) FROM accounting.journal_lines jl JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE jl.company_id=@company AND a.control_kind IN('AP','GST') AND jl.journal_entry_id IN(SELECT journal_entry_id FROM accounting.grni_items WHERE company_id=@company AND supplier_id=@supplier)",("company",db.Company),("supplier",d.Supplier)));
        Assert.Equal(0,(await Get(c,$"/warehouse/purchase-orders?warehouseId={d.Sales.Warehouse}")).GetProperty("items").GetArrayLength());
        var ledger=await Get(c,$"/accounting/grni?supplierId={d.Supplier}");Assert.Equal(20.01m,D(ledger.GetProperty("accruedAmount")));Assert.Equal(2,ledger.GetProperty("items").GetArrayLength());
    }
    [Theory]
    [InlineData(false,null,22)]
    [InlineData(true,false,22)]
    [InlineData(true,true,20)]
    public async Task Nonrecoverable_GST_is_capitalised_and_recoverable_GST_is_only_an_estimate(bool registered,bool? recoverable,decimal expected)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,registered);var po=await Confirm(c,await Draft(c,d.Draft(cost:10,recoverable:recoverable)));
        await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);Assert.Equal((4.4m,0m,expected),await Balance(d));Assert.Equal(expected,await Accrued(d));
    }
    [Fact]
    public async Task Unregistered_company_cannot_declare_recoverable_input_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,false);await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",d.Draft(recoverable:true)),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Partial_receipt_rounding_preserves_net_tax_and_capitalised_cost_to_the_last_cent()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,false);var po=await Confirm(c,await Draft(c,d.Draft(3,0.05m)));
        for(var k=0;k<3;k++){var current=await PO(c,Id(po));await Expect(await Receive(c,Id(po),Line(po),1,V(current)),HttpStatusCode.Created);}
        Assert.Equal((6.6m,0m,0.17m),await Balance(d));Assert.Equal(0.17m,await Accrued(d));
    }
    [Theory]
    [InlineData("FRE")]
    [InlineData("N-T")]
    public async Task Zero_tax_purchases_preserve_net_inventory_cost(string code)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,taxCode:code);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);Assert.Equal((4.4m,0m,20m),await Balance(d));Assert.Equal(0m,D(po.GetProperty("order").GetProperty("tax")));
    }
    [Theory]
    [InlineData("SERVICE")]
    [InlineData("NON_STOCK")]
    public async Task Nonstock_acceptance_accrues_expense_and_never_creates_inventory(string itemType)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,itemType:itemType);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var r=await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);
        Assert.Equal(JsonValueKind.Null,r.GetProperty("lines")[0].GetProperty("stockBalanceId").ValueKind);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal(20m,await Accrued(d));
        Assert.Equal(20m,await S("SELECT sum(l.debit) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND a.code='5100' AND l.journal_entry_id IN(SELECT journal_entry_id FROM accounting.grni_items WHERE company_id=@company AND supplier_id=@supplier)",("company",db.Company),("supplier",d.Supplier)));
    }
    [Fact]
    public async Task New_receipt_recalculates_average_with_existing_value_and_sales_issue_uses_new_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,opening:4.4m);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,d.Sales.Product,20,"Known opening",DatabaseFixture.Issuer,db.Subject);
        var po=await Confirm(c,await Draft(c,d.Draft(cost:20)));await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);Assert.Equal((8.8m,0m,60m),await Balance(d));
        var q=await Submitted(c,d.Sales.Draft(1));var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var l=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();
        var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{o}/picks",new PickInput([new(l,1)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer","Docket"),1),HttpStatusCode.OK);
        Assert.Equal((6.6m,0m,45m),await Balance(d));
    }
    [Fact]
    public async Task Existing_quantity_without_value_fails_closed_then_same_key_can_retry_after_valuation()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,opening:4.4m);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var key=Code();var reference=Code();
        await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.UnprocessableEntity);Assert.Equal((4.4m,0m,-1m),await Balance(d));Assert.Equal(0m,await Accrued(d));
        await StockValuation.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,d.Sales.Product,20,"Opening reconciled",DatabaseFixture.Issuer,db.Subject);await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.Created);Assert.Equal((8.8m,0m,40m),await Balance(d));
    }
    [Fact]
    public async Task Quarantine_receipt_carries_value_but_does_not_create_sellable_availability()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,warehouseKind:"QUARANTINE");var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);
        Assert.Equal((4.4m,0m,20m),await Balance(d));Assert.Equal(0m,D((await Get(c,$"/inventory/availability?warehouseId={d.Sales.Warehouse}")).GetProperty("items")[0].GetProperty("available")));
    }
    [Fact]
    public async Task Free_stock_still_has_quantity_and_GRNI_trace_without_zero_journal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:0)));var r=await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);
        Assert.Equal((4.4m,0m,0m),await Balance(d));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.grni_items WHERE company_id=@company AND supplier_id=@supplier AND amount=0 AND journal_entry_id IS NULL",("company",db.Company),("supplier",d.Supplier)));
        Assert.Equal(0L,await S("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@id",("company",db.Company),("id",ReceiptId(r))));
    }
    [Fact]
    public async Task Draft_update_requires_current_version_and_confirmation_freezes_source_content()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var draft=await Draft(c,d.Draft());var updated=await Expect(await Send(c,HttpMethod.Put,$"/purchase-orders/{Id(draft)}",d.Draft(3,12),V(draft)),HttpStatusCode.OK);Assert.Equal(36m,D(updated.GetProperty("order").GetProperty("net")));
        await Expect(await Send(c,HttpMethod.Put,$"/purchase-orders/{Id(draft)}",d.Draft(),V(draft)),HttpStatusCode.Conflict);var po=await Confirm(c,updated);
        await Expect(await Send(c,HttpMethod.Put,$"/purchase-orders/{Id(po)}",d.Draft(),V(po)),HttpStatusCode.Conflict);Assert.Equal(36m,D((await PO(c,Id(po))).GetProperty("order").GetProperty("net")));
    }
    [Fact]
    public async Task Inactive_supplier_or_buy_disabled_product_is_revalidated_before_confirmation()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var draft=await Draft(c,d.Draft());
        await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(draft)}/confirm",version:V(draft)),HttpStatusCode.UnprocessableEntity);
        await S("UPDATE crm.suppliers SET status='ACTIVE' WHERE company_id=@company AND id=@supplier;UPDATE catalog.products SET buy_enabled=false WHERE company_id=@company AND id=@product",("company",db.Company),("supplier",d.Supplier),("product",d.Sales.Product));await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(draft)}/confirm",version:V(draft)),HttpStatusCode.UnprocessableEntity);
        Assert.Equal(JsonValueKind.Null,(await PO(c,Id(draft))).GetProperty("order").GetProperty("number").ValueKind);
    }
    [Fact]
    public async Task Changes_after_confirmation_do_not_reprice_or_reconvert_receipts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));
        await S("UPDATE catalog.product_units SET conversion_to_base=3,quantity_step=2 WHERE company_id=@company AND id=@unit;UPDATE crm.parties SET legal_name='Changed supplier' WHERE company_id=@company AND id=(SELECT party_id FROM crm.suppliers WHERE company_id=@company AND id=@supplier)",("company",db.Company),("unit",d.Sales.BoxUnit),("supplier",d.Supplier));
        await Expect(await Receive(c,Id(po),Line(po),1,V(po)),HttpStatusCode.Created);Assert.Equal((2.2m,0m,10m),await Balance(d));Assert.Equal("Test flooring supplier",(await PO(c,Id(po))).GetProperty("order").GetProperty("supplier").GetProperty("legalName").GetString());
    }
    [Fact]
    public async Task Registration_change_requires_new_purchase_policy_instead_of_silent_cost_change()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));await S("UPDATE core.companies SET gst_registered=false WHERE id=@company",("company",db.Company));
        await Expect(await Receive(c,Id(po),Line(po),2,V(po)),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Same_key_parallel_draft_confirmation_and_receipt_execute_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var key=Code();var drafts=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Draft(c,d.Draft(cost:10),key)));Assert.Single(drafts.Select(Id).Distinct());var draft=drafts[0];key=Code();
        var orders=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Confirm(c,draft,key)));Assert.Single(orders.Select(x=>x.GetProperty("order").GetProperty("number").GetString()).Distinct());var po=orders[0];key=Code();var reference=Code();
        var receipts=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Receive(c,Id(po),Line(po),1,V(po),key,reference)));var rows=await Task.WhenAll(receipts.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Single(rows.Select(ReceiptId).Distinct());Assert.Equal((2.2m,0m,10m),await Balance(d));
        await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Different_keys_cannot_overreceive_same_purchase_order()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var results=await Task.WhenAll(Receive(c,Id(po),Line(po),2,V(po)),Receive(c,Id(po),Line(po),2,V(po)));
        Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal((4.4m,0m,20m),await Balance(d));await Expect(await Receive(c,Id(po),Line(po),1,V(await PO(c,Id(po)))),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Independent_orders_sharing_product_cost_pool_do_not_lose_quantity_or_value()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var a=await Confirm(c,await Draft(c,d.Draft(cost:10)));var b=await Confirm(c,await Draft(c,d.Draft(cost:20)));
        var results=await Task.WhenAll(Receive(c,Id(a),Line(a),2,V(a)),Receive(c,Id(b),Line(b),2,V(b)));await Task.WhenAll(results.Select(r=>Expect(r,HttpStatusCode.Created)));Assert.Equal((8.8m,0m,60m),await Balance(d));Assert.Equal(60m,await Accrued(d));
    }
    [Fact]
    public async Task Repeated_SKU_in_two_purchase_units_updates_one_cost_pool_in_a_batch()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,new PurchaseOrderInput(d.Supplier,d.Sales.Warehouse,[new(d.Sales.BaseUnit,2.2m,5),new(d.Sales.BoxUnit,1,11)])));
        var lines=po.GetProperty("lines").EnumerateArray().Select(l=>new PurchaseReceiptLineInput(l.GetProperty("id").GetGuid(),D(l.GetProperty("quantity")))).ToArray();await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/receipts",new PurchaseReceiptInput(Code(),lines),V(po)),HttpStatusCode.Created);Assert.Equal((4.4m,0m,22m),await Balance(d));Assert.Equal(22m,await Accrued(d));
    }
    [Fact]
    public async Task Same_supplier_delivery_reference_cannot_be_reposted_on_another_order_or_by_another_staff()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var a=await Confirm(c,await Draft(c,d.Draft(cost:10)));var b=await Confirm(c,await Draft(c,d.Draft(cost:10)));var staff=await Staff(db,"PROCUREMENT");using var buyer=api.Authenticated(staff.Subject);var reference=Code();
        var results=await Task.WhenAll(Receive(c,Id(a),Line(a),1,V(a),reference:reference),Receive(buyer,Id(b),Line(b),1,V(b),reference:reference.ToLowerInvariant()));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal((2.2m,0m,10m),await Balance(d));
    }
    [Fact]
    public async Task Close_remaining_quantity_keeps_received_stock_and_GRNI_and_blocks_new_receipts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));await Expect(await Receive(c,Id(po),Line(po),1,V(po)),HttpStatusCode.Created);var current=await PO(c,Id(po));
        var closed=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/close",new PurchaseCloseInput("Supplier cannot supply remainder"),V(current)),HttpStatusCode.OK);Assert.Equal("CLOSED",closed.GetProperty("order").GetProperty("status").GetString());Assert.Equal(1m,D(closed.GetProperty("lines")[0].GetProperty("closedQuantity")));Assert.Equal((2.2m,0m,10m),await Balance(d));Assert.Equal(10m,await Accrued(d));await Expect(await Receive(c,Id(po),Line(po),1,V(closed)),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Closing_order_and_receiving_race_has_one_current_version_winner()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var r=await Task.WhenAll(Receive(c,Id(po),Line(po),1,V(po)),Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/close",new PurchaseCloseInput("Close race"),V(po)));
        Assert.Equal(1,r.Count(x=>x.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(r[0].StatusCode==HttpStatusCode.Created?(2.2m,0m,10m):(0m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Closing_unreceived_draft_or_confirmed_order_has_no_financial_effect()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var draft=await Draft(c,d.Draft());var a=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(draft)}/close",new PurchaseCloseInput("Not required"),V(draft)),HttpStatusCode.OK);Assert.Equal("CANCELLED",a.GetProperty("order").GetProperty("state").GetString());var po=await Confirm(c,await Draft(c,d.Draft()));var b=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/close",new PurchaseCloseInput("Supplier cancelled"),V(po)),HttpStatusCode.OK);Assert.Equal("CANCELLED",b.GetProperty("order").GetProperty("state").GetString());Assert.Equal(0m,await Accrued(d));
    }
    [Fact]
    public async Task Closed_period_and_invalid_GRNI_mapping_rollback_receipt_and_allow_original_key_retry()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var key=Code();var reference=Code();
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.UnprocessableEntity);}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
        await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='2100'",("company",db.Company));try{await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal(0m,await Accrued(d));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='2100'",("company",db.Company));}
        await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Late_failure_rolls_back_receipt_number_stock_value_GRNI_and_idempotency()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));var before=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='PURCHASE_RECEIPT'",("company",db.Company));var key=Code();var reference=Code();
        await S("CREATE FUNCTION purchase.test_fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='purchase.goods_received' THEN RAISE EXCEPTION 'injected receipt failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_fail_receipt BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION purchase.test_fail_receipt()");
        try{await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal(0m,await Accrued(d));Assert.Equal(before,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='PURCHASE_RECEIPT'",("company",db.Company)));Assert.Equal(V(po),V(await PO(c,Id(po))));}
        finally{await S("DROP TRIGGER test_fail_receipt ON platform.audit_events;DROP FUNCTION purchase.test_fail_receipt()");}
        await Expect(await Receive(c,Id(po),Line(po),2,V(po),key,reference),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Warehouse_scope_hides_prices_buyers_can_confirm_and_finance_can_trace_GRNI_without_stock_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var buyer=await Staff(db,"PROCUREMENT");using var b=api.Authenticated(buyer.Subject);var po=await Confirm(b,await Draft(b,d.Draft(cost:10)));var worker=await Staff(db,"WAREHOUSE");
        await S("INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@member,@wh)",("company",db.Company),("member",worker.Membership),("wh",d.Sales.Warehouse));using var w=api.Authenticated(worker.Subject);
        var detail=await Get(w,$"/warehouse/purchase-orders/{Id(po)}");Assert.DoesNotContain("unitCost",detail.GetRawText());Assert.DoesNotContain("valuationAmount",detail.GetRawText());Assert.DoesNotContain("gross",detail.GetRawText());
        var receipt=await Expect(await Receive(w,Id(po),Line(po),2,V(po)),HttpStatusCode.Created);Assert.DoesNotContain("valuationAmount",receipt.GetRawText());Assert.DoesNotContain("valueAfter",receipt.GetRawText());
        Assert.Equal(HttpStatusCode.Forbidden,(await w.GetAsync($"/api/v1/purchase-orders/{Id(po)}")).StatusCode);Assert.Equal(HttpStatusCode.Forbidden,(await w.GetAsync("/api/v1/accounting/grni")).StatusCode);
        var finance=await Staff(db,"FINANCE");using var f=api.Authenticated(finance.Subject);Assert.Equal(HttpStatusCode.OK,(await f.GetAsync($"/api/v1/accounting/grni/receipts/{ReceiptId(receipt)}")).StatusCode);Assert.Equal(20m,D((await Get(f,$"/accounting/grni?supplierId={d.Supplier}")).GetProperty("accruedAmount")));
        var outsider=await Staff(db,"WAREHOUSE");using var u=api.Authenticated(outsider.Subject);Assert.Equal(HttpStatusCode.Forbidden,(await u.GetAsync($"/api/v1/warehouse/purchase-orders/{Id(po)}")).StatusCode);
    }
    [Fact]
    public async Task Sales_and_foreign_companies_cannot_issue_or_receive_purchase_orders()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var sales=await Staff(db,"SALES",d.Sales);using var s=api.Authenticated(sales.Subject);await Expect(await Send(s,HttpMethod.Post,"/purchase-orders",d.Draft()),HttpStatusCode.Forbidden);var po=await Confirm(c,await Draft(c,d.Draft()));await Expect(await Receive(s,Id(po),Line(po),1,V(po)),HttpStatusCode.Forbidden);
        using var other=api.Authenticated(company:db.OtherCompany);Assert.Equal(HttpStatusCode.NotFound,(await other.GetAsync($"/api/v1/purchase-orders/{Id(po)}")).StatusCode);await Expect(await Receive(other,Id(po),Line(po),1,V(po)),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Direct_database_commands_check_permissions_and_posted_receipts_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft()));var r=await Expect(await Receive(c,Id(po),Line(po),1,V(po)),HttpStatusCode.Created);
        await using(var scope=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(scope,"UPDATE purchase.order_lines SET unit_cost=0 WHERE company_id=@company",default,("company",db.Company)));
        await using(var scope=await db.SessionAsync())await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(scope,"UPDATE platform.documents SET number='HACK' WHERE company_id=@company AND id=@id",default,("company",db.Company),("id",ReceiptId(r))));
        var staff=await Staff(db,"SALES",d.Sales);var actor=(Guid)(await S("SELECT id FROM identity.users WHERE issuer=@issuer AND subject=@subject",("issuer",DatabaseFixture.Issuer),("subject",staff.Subject)))!;await using var source=NpgsqlDataSource.Create(db.App);await using var scoped=new CompanySession(source);await scoped.BeginAsync(db.Company,actor,"direct-purchase",default);
        var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(scoped,"SELECT purchase.confirm_order(@id,1)",default,("id",Id(po))));Assert.Equal("42501",e.SqlState);
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    [InlineData(0.0000001)]
    public async Task Invalid_purchase_or_receipt_quantities_cannot_affect_stock(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",d.Draft(qty)),HttpStatusCode.UnprocessableEntity);var po=await Confirm(c,await Draft(c,d.Draft()));await Expect(await Receive(c,Id(po),Line(po),qty,V(po)),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Malformed_price_missing_keys_duplicate_or_foreign_lines_fail_without_partial_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);
        await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(d.Supplier,d.Sales.Warehouse,[new(d.Sales.BoxUnit,1,null)])),HttpStatusCode.UnprocessableEntity);await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",d.Draft(cost:-1)),HttpStatusCode.UnprocessableEntity);
        var po=await Confirm(c,await Draft(c,d.Draft()));await Expect(await Receive(c,Id(po),Guid.NewGuid(),1,V(po)),HttpStatusCode.NotFound);await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/receipts",new PurchaseReceiptInput(Code(),[new(Line(po),1),new(Line(po),1)]),V(po)),HttpStatusCode.UnprocessableEntity);
        await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/receipts",new PurchaseReceiptInput(Code(),[new(Line(po),1)])),(HttpStatusCode)428);
        using var req=new HttpRequestMessage(HttpMethod.Post,"/api/v1/purchase-orders"){Content=System.Net.Http.Json.JsonContent.Create(d.Draft())};await Expect(await c.SendAsync(req),HttpStatusCode.BadRequest);Assert.Equal((0m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Client_cannot_override_authoritative_totals_number_cost_or_warehouse_during_receipt()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c);var po=await Confirm(c,await Draft(c,d.Draft(cost:10)));
        var r=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{Id(po)}/receipts",new{reference=Code(),lines=new[]{new{orderLineId=Line(po),quantity=2,unitCost=0,valuationAmount=0}},valuationAmount=0,number="HACK",warehouseId=Guid.NewGuid(),receivedOn="2000-01-01"},V(po)),HttpStatusCode.Created);
        Assert.Equal((4.4m,0m,20m),await Balance(d));Assert.NotEqual("HACK",r.GetProperty("receipt").GetProperty("number").GetString());Assert.NotEqual("2000-01-01",r.GetProperty("receipt").GetProperty("businessDate").GetString());
    }
    [Fact]
    public async Task Concurrent_purchase_receipt_and_sales_issue_preserve_reserved_stock_and_total_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupPurchase(c,opening:4.4m);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,d.Sales.Product,20,"Cost pool opening",DatabaseFixture.Issuer,db.Subject);
        var q=await Submitted(c,d.Sales.Draft(1));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();
        var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new PickInput([new(line,1)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();var po=await Confirm(c,await Draft(c,d.Draft(cost:20)));
        Assert.Equal((4.4m,2.2m,20m),await Balance(d));var results=await Task.WhenAll(Receive(c,Id(po),Line(po),2,V(po)),Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer","Concurrent issue"),1));await Expect(results[0],HttpStatusCode.Created);await Expect(results[1],HttpStatusCode.OK);
        var balance=await Balance(d);Assert.Equal(6.6m,balance.Qty);Assert.Equal(0m,balance.Reserved);Assert.Contains(balance.Value,new[]{45m,50m});
        var issued=(decimal)(await S("SELECT sum(m.cost) FROM inventory.stock_movements m JOIN inventory.stock_balances b ON b.company_id=m.company_id AND b.id=m.stock_balance_id WHERE b.company_id=@company AND b.product_id=@product",("company",db.Company),("product",d.Sales.Product)))!;Assert.Equal(60m,balance.Value+issued);Assert.Equal(40m,await Accrued(d));
    }
}
