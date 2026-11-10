using System.Net;
using System.Text.Json;
using Htt.Host.Api.Inventory;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class TransitTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private sealed record Data(SalesData Sales,Guid Destination);
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private async Task<Data> SetupStock(HttpClient c,decimal qty=10,decimal? value=100,string kind="SELLABLE")
    {
        var d=await Setup(db,c,qty);if(qty>0 && value is{} v)await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,v,Code(),DatabaseFixture.Issuer,db.Subject);
        return new(d,await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Transit destination",Kind:kind)));
    }
    private static Task<HttpResponseMessage> Dispatch(HttpClient c,Data d,decimal qty=2,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,"/inventory/transit-transfers",new TransitDispatchInput(d.Sales.Warehouse,d.Destination,reference??Code(),"Carrier dispatch verified",[new(d.Sales.Product,qty)]),key:key);
    private static Guid Tid(JsonElement r)=>r.GetProperty("transfer").GetProperty("id").GetGuid();
    private static Guid Line(JsonElement r)=>r.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Guid Eid(JsonElement r)=>r.GetProperty("event").GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Event(HttpClient c,JsonElement ship,string kind="receipts",decimal qty=2,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/{kind}",new TransitEventInput(reference??Code(),"Verified actual transit disposition",[new(Line(ship),qty)]),key:key);
    private static Task<JsonElement> Track(HttpClient c,JsonElement ship)=>Get(c,$"/accounting/transit-transfers/{Tid(ship)}");
    private async Task<(decimal Qty,decimal Reserved,decimal Value)> Balance(Data d,Guid? w=null)
    {
        await using var s=await db.SessionAsync();var row=(await Sql.RowsAsync(s,"SELECT b.on_hand,b.reserved,v.value FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.warehouse_id=@wh AND b.product_id=@product",default,("company",db.Company),("wh",w??d.Sales.Warehouse),("product",d.Sales.Product))).SingleOrDefault();return row is null?(0,0,0):((decimal)row["on_hand"]!,(decimal)row["reserved"]!,row["value"] is decimal v?v:-1);
    }
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(jl.{side}),0) FROM accounting.posting_batches pb JOIN accounting.journal_entries je ON je.company_id=pb.company_id AND je.posting_batch_id=pb.id JOIN accounting.journal_lines jl ON jl.company_id=je.company_id AND jl.journal_entry_id=je.id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE pb.company_id=@company AND pb.source_document_id=@doc AND a.code=@code",("company",db.Company),("doc",doc),("code",code)));
    [Fact]
    public async Task Dispatch_moves_source_to_unsellable_transit_and_receipt_clears_to_destination()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);Assert.StartsWith("TT-",ship.GetProperty("transfer").GetProperty("number").GetString());Assert.Equal("IN_TRANSIT",ship.GetProperty("transfer").GetProperty("state").GetString());Assert.Equal((8m,0m,80m),await Balance(d));Assert.Equal((0m,0m,0m),await Balance(d,d.Destination));Assert.Equal(20,await Journal(Tid(ship),"1250","debit"));Assert.Equal(20,await Journal(Tid(ship),"1200","credit"));Assert.Equal(20,D(ship.GetProperty("lines")[0].GetProperty("remainingCost")));
        var receipt=await Expect(await Event(c,ship),HttpStatusCode.Created);Assert.StartsWith("TIR-",receipt.GetProperty("event").GetProperty("number").GetString());Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));Assert.Equal(20,await Journal(Eid(receipt),"1200","debit"));Assert.Equal(20,await Journal(Eid(receipt),"1250","credit"));var final=await Track(c,ship);Assert.Equal("CLOSED",final.GetProperty("transfer").GetProperty("state").GetString());Assert.Equal(0,D(final.GetProperty("lines")[0].GetProperty("remainingQuantity")));Assert.Equal(0,D(final.GetProperty("lines")[0].GetProperty("remainingCost")));Assert.Equal(Eid(receipt),(await Get(c,$"/accounting/transit-events/{Eid(receipt)}")).GetProperty("event").GetProperty("id").GetGuid());
    }
    [Fact]
    public async Task Partial_receipts_keep_unreceived_cost_in_transit_and_shortage_requires_explicit_event()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d,5),HttpStatusCode.Created);await Expect(await Event(c,ship,qty:2),HttpStatusCode.Created);var partial=await Track(c,ship);Assert.Equal("PARTIAL",partial.GetProperty("transfer").GetProperty("state").GetString());Assert.Equal(3,D(partial.GetProperty("lines")[0].GetProperty("remainingQuantity")));Assert.Equal(30,D(partial.GetProperty("lines")[0].GetProperty("remainingCost")));Assert.Equal(0,D(partial.GetProperty("lines")[0].GetProperty("shortageQuantity")));var loss=await Expect(await Event(c,ship,"shortages",3),HttpStatusCode.Created);Assert.StartsWith("TIA-",loss.GetProperty("event").GetProperty("number").GetString());Assert.Equal(30,await Journal(Eid(loss),"5500","debit"));Assert.Equal(30,await Journal(Eid(loss),"1250","credit"));Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());await Expect(await Event(c,ship,qty:1),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Returned_undelivered_stock_uses_frozen_cost_and_does_not_create_loss()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d,4),HttpStatusCode.Created);await Expect(await Event(c,ship,qty:1),HttpStatusCode.Created);var returned=await Expect(await Event(c,ship,"returns",3),HttpStatusCode.Created);Assert.Equal(30,await Journal(Eid(returned),"1200","debit"));Assert.Equal(30,await Journal(Eid(returned),"1250","credit"));Assert.Equal(0,await Journal(Eid(returned),"5500","debit"));Assert.Equal((9m,0m,90m),await Balance(d));Assert.Equal((1m,0m,10m),await Balance(d,d.Destination));Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
    [Fact]
    public async Task Mixed_receipt_shortage_and_return_consume_last_cent_exactly()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,3,0.02m);var ship=await Expect(await Dispatch(c,d,3),HttpStatusCode.Created);var r=await Expect(await Event(c,ship,qty:1),HttpStatusCode.Created);var loss=await Expect(await Event(c,ship,"shortages",1),HttpStatusCode.Created);var back=await Expect(await Event(c,ship,"returns",1),HttpStatusCode.Created);Assert.Equal(0.01m,await Journal(Eid(r),"1200","debit"));Assert.Equal(0,await Journal(Eid(loss),"5500","debit"));Assert.Equal(0.01m,await Journal(Eid(back),"1200","debit"));var f=await Track(c,ship);Assert.Equal(0,D(f.GetProperty("lines")[0].GetProperty("remainingCost")));Assert.Equal(1,D(f.GetProperty("lines")[0].GetProperty("receivedQuantity")));Assert.Equal(1,D(f.GetProperty("lines")[0].GetProperty("shortageQuantity")));Assert.Equal(1,D(f.GetProperty("lines")[0].GetProperty("returnedQuantity")));
    }
    [Fact]
    public async Task Destination_merges_incoming_frozen_cost_into_existing_average()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);await StockOpening.InitializeAsync(db.Owner,db.Company,d.Destination,d.Sales.Product,2,"Destination opening",DatabaseFixture.Issuer,db.Subject);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Destination,d.Sales.Product,60,"Destination value",DatabaseFixture.Issuer,db.Subject);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await Expect(await Event(c,ship),HttpStatusCode.Created);Assert.Equal((4m,0m,80m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Quarantine_destination_preserves_cost_without_sellable_availability()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,kind:"QUARANTINE");var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await Expect(await Event(c,ship),HttpStatusCode.Created);Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));var availability=(await Get(c,$"/inventory/availability?warehouseId={d.Destination}&productId={d.Sales.Product}")).GetProperty("items");Assert.Equal(0,D(availability[0].GetProperty("available")));
    }
    [Fact]
    public async Task Zero_cost_shipment_still_tracks_all_quantities_and_requires_open_period()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,value:0);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,ship.GetProperty("transfer").GetProperty("journalEntryId").ValueKind);var received=await Expect(await Event(c,ship,qty:1),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,received.GetProperty("event").GetProperty("journalEntryId").ValueKind);await Expect(await Event(c,ship,"shortages",1),HttpStatusCode.Created);Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
    [Fact]
    public async Task Shipment_protects_reserved_stock_and_unvalued_stock_is_not_free()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,4.4m,40);var q=await Submitted(c,d.Sales.Draft(1));await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);await Expect(await Dispatch(c,d,3),HttpStatusCode.Conflict);await Expect(await Dispatch(c,d,2.2m),HttpStatusCode.Created);Assert.Equal((2.2m,2.2m,20m),await Balance(d));var unvalued=await SetupStock(c,value:null);await Expect(await Dispatch(c,unvalued),HttpStatusCode.UnprocessableEntity);
    }
    [Theory]
    [InlineData("receipts")]
    [InlineData("returns")]
    [InlineData("shortages")]
    public async Task Dispatched_cost_is_frozen_after_account_mapping_changes(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var code=action=="receipts"?"1261":action=="returns"?"1262":"1263";
        await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,@code,'New transit control','ASSET','INVENTORY');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code=@code) WHERE company_id=@company AND purpose='INVENTORY_TRANSIT'",("company",db.Company),("code",code));try{var e=await Expect(await Event(c,ship,action),HttpStatusCode.Created);Assert.Equal(20,await Journal(Eid(e),"1250","credit"));Assert.Equal(0,await Journal(Eid(e),code,"credit"));}finally{await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1250') WHERE company_id=@company AND purpose='INVENTORY_TRANSIT'",("company",db.Company));}
    }
    [Fact]
    public async Task Closed_original_dispatch_period_does_not_block_current_receipt()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);
        var today=(DateOnly)(await S("SELECT(now() AT TIME ZONE timezone)::date FROM core.companies WHERE id=@company",("company",db.Company)))!;var old=new DateOnly(today.Year,today.Month,1).AddDays(-1);
        await S("WITH fy AS(INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) SELECT @company,@label,make_date(extract(year FROM @date::date)::int-CASE WHEN extract(month FROM @date::date)<7 THEN 1 ELSE 0 END,7,1),(make_date(extract(year FROM @date::date)::int-CASE WHEN extract(month FROM @date::date)<7 THEN 1 ELSE 0 END,7,1)+interval '1 year')::date WHERE NOT EXISTS(SELECT 1 FROM accounting.fiscal_years WHERE company_id=@company AND starts_on<=@date AND ends_on>@date) RETURNING id) SELECT count(*) FROM fy",("company",db.Company),("label",Code()),("date",old));
        await S("INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,date_trunc('month',@date::date)::date,(date_trunc('month',@date::date)+interval '1 month')::date FROM accounting.fiscal_years WHERE company_id=@company AND starts_on<=@date AND ends_on>@date AND NOT EXISTS(SELECT 1 FROM accounting.periods WHERE company_id=@company AND starts_on<=@date AND ends_on>@date)",("company",db.Company),("date",old));
        var assembly=typeof(MigrationRunner).Assembly;await using var stream=assembly.GetManifestResourceStream(assembly.GetManifestResourceNames().Single(n=>n.EndsWith(".014_inventory_control.sql",StringComparison.Ordinal)))!;using var reader=new StreamReader(stream);var resource=await reader.ReadToEndAsync();var begin=resource.IndexOf("CREATE FUNCTION inventory.control_today()",StringComparison.Ordinal);var finish=resource.IndexOf("CREATE FUNCTION inventory.control_warehouse",begin,StringComparison.Ordinal);var original=resource[begin..finish].Replace("CREATE FUNCTION","CREATE OR REPLACE FUNCTION",StringComparison.Ordinal);
        // Owner-only test clock scoped to this fixture company; production has no date override or bypass.
        var overridden=original.Replace("SELECT(now() AT TIME ZONE timezone)::date INTO d",$"SELECT CASE WHEN id='{db.Company}'::uuid THEN date '{old:yyyy-MM-dd}' ELSE(now() AT TIME ZONE timezone)::date END INTO d",StringComparison.Ordinal);JsonElement ship;
        await S(overridden);try{ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);}finally{await S(original);}
        await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",old));
        try{Assert.Equal(old.ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture),ship.GetProperty("transfer").GetProperty("businessDate").GetString());var receipt=await Expect(await Event(c,ship),HttpStatusCode.Created);Assert.Equal(today.ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture),receipt.GetProperty("event").GetProperty("businessDate").GetString());Assert.Equal(20,await Journal(Tid(ship),"1250","debit"));Assert.Equal(20,await Journal(Eid(receipt),"1250","credit"));}
        finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",old));}
    }
    [Fact]
    public async Task Source_and_destination_staff_can_operate_their_leg_without_other_warehouse_scope()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var(source,_)=await Staff(db,"WAREHOUSE",d.Sales);var(dest,_)=await Staff(db,"WAREHOUSE",d.Sales with{Warehouse=d.Destination});using var sender=api.Authenticated(source);using var receiver=api.Authenticated(dest);var ship=await Expect(await Dispatch(sender,d),HttpStatusCode.Created);Assert.False(ship.GetProperty("transfer").TryGetProperty("shippedCost",out _));Assert.False(ship.GetProperty("lines")[0].TryGetProperty("valueBefore",out _));Assert.False(ship.GetProperty("lines")[0].TryGetProperty("quantityBefore",out _));await Expect(await Event(sender,ship),HttpStatusCode.Forbidden);await Expect(await Event(receiver,ship,"returns"),HttpStatusCode.Forbidden);var view=await Get(receiver,$"/inventory/transit-transfers/{Tid(ship)}");Assert.Equal(Tid(ship),Tid(view));var r=await Expect(await Event(receiver,ship,qty:1),HttpStatusCode.Created);Assert.False(r.GetProperty("lines")[0].TryGetProperty("quantityAfter",out _));Assert.False(r.GetProperty("lines")[0].TryGetProperty("cost",out _));await Expect(await Event(receiver,ship,"shortages",1),HttpStatusCode.Forbidden);await Expect(await Event(sender,ship,"returns",1),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Unassigned_warehouse_staff_cannot_read_or_receive_transfer()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var(sub,_)=await Staff(db,"WAREHOUSE");using var staff=api.Authenticated(sub);await Expect(await staff.GetAsync($"/api/v1/inventory/transit-transfers/{Tid(ship)}"),HttpStatusCode.Forbidden);await Expect(await staff.GetAsync($"/api/v1/inventory/transit-transfers?warehouseId={d.Destination}"),HttpStatusCode.Forbidden);await Expect(await Event(staff,ship),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_can_resolve_loss_and_read_cost_without_physical_dispatch_or_receipt_rights()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);await Expect(await Dispatch(f,d),HttpStatusCode.Forbidden);await Expect(await Event(f,ship),HttpStatusCode.Forbidden);var queue=await Get(f,$"/accounting/transit-transfers?warehouseId={d.Destination}&state=IN_TRANSIT");Assert.Equal(20,D(queue.GetProperty("remainingCost")));await Expect(await Event(f,ship,"shortages"),HttpStatusCode.Created);Assert.Equal("CLOSED",(await Track(f,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
    [Theory]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    [InlineData("PROCUREMENT")]
    public async Task Unrelated_roles_have_no_transit_mutation_permissions(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var(sub,_)=await Staff(db,role);using var staff=api.Authenticated(sub);await Expect(await Dispatch(staff,d),HttpStatusCode.Forbidden);await Expect(await Event(staff,ship),HttpStatusCode.Forbidden);await Expect(await Event(staff,ship,"shortages"),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Same_key_parallel_dispatch_and_receipt_each_execute_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var key=Code();var reference=Code();var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Dispatch(c,d,key:key,reference:reference)));var ships=new List<JsonElement>();foreach(var r in results)ships.Add(await Expect(r,HttpStatusCode.Created));Assert.Single(ships.Select(Tid).Distinct());await Expect(await Dispatch(c,d,3,key,reference),HttpStatusCode.Conflict);key=Code();reference=Code();var arrivals=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Event(c,ships[0],key:key,reference:reference)));var ids=new List<Guid>();foreach(var r in arrivals)ids.Add(Eid(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));
    }
    [Theory]
    [InlineData("shortages")]
    [InlineData("returns")]
    public async Task Same_key_parallel_resolution_does_not_double_clear_transit(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var key=Code();var reference=Code();var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Event(c,ship,action,key:key,reference:reference)));var ids=new List<Guid>();foreach(var r in results)ids.Add(Eid(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Event(c,ship,action,1,key,reference),HttpStatusCode.Conflict);Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
    [Fact]
    public async Task Different_keys_compete_for_last_in_transit_quantity_without_overreceipt()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var results=await Task.WhenAll(Event(c,ship),Event(c,ship));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Concurrent_partial_receipts_both_succeed_and_preserve_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);foreach(var r in await Task.WhenAll(Event(c,ship,qty:1),Event(c,ship,qty:1)))await Expect(r,HttpStatusCode.Created);Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));Assert.Equal(0,D((await Track(c,ship)).GetProperty("transfer").GetProperty("remainingCost")));
    }
    [Theory]
    [InlineData("shortages")]
    [InlineData("returns")]
    public async Task Receipt_and_resolution_cannot_consume_same_in_transit_quantity(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var results=await Task.WhenAll(Event(c,ship),Event(c,ship,action));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
    [Fact]
    public async Task Concurrent_dispatch_and_sales_issue_share_stock_lock_and_preserve_reserved_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,4.4m,40);var q=await Submitted(c,d.Sales.Draft(1));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new PickInput([new(line,1)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();var r=await Task.WhenAll(Dispatch(c,d,2.2m),Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer","Transit race"),1));await Expect(r[0],HttpStatusCode.Created);await Expect(r[1],HttpStatusCode.OK);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal((0m,0m,0m),await Balance(d,d.Destination));var ship=await Expect(r[0],HttpStatusCode.Created);Assert.Equal(20,D(ship.GetProperty("transfer").GetProperty("remainingCost")));
    }
    [Fact]
    public async Task Source_change_after_dispatch_does_not_reprice_outstanding_shipment()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"New cost supplier",null));
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(supplier,d.Sales.Warehouse,[new(d.Sales.BaseUnit,2,30)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),2),HttpStatusCode.Created);
        Assert.Equal((10m,0m,146m),await Balance(d));var receipt=await Expect(await Event(c,ship),HttpStatusCode.Created);Assert.Equal(20,await Journal(Eid(receipt),"1250","credit"));Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Duplicate_dispatch_and_partial_receipt_reference_are_rejected_across_keys_and_staff()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var reference=Code();var ship=await Expect(await Dispatch(c,d,reference:reference.ToUpperInvariant()),HttpStatusCode.Created);await Expect(await Dispatch(c,d,reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);var(sub,_)=await Staff(db,"WAREHOUSE",d.Sales with{Warehouse=d.Destination});using var receiver=api.Authenticated(sub);reference=Code();await Expect(await Event(c,ship,qty:1,reference:reference.ToUpperInvariant()),HttpStatusCode.Created);await Expect(await Event(receiver,ship,qty:1,reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);Assert.Equal(1,D((await Track(c,ship)).GetProperty("lines")[0].GetProperty("remainingQuantity")));
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.0000001)]
    [InlineData(11)]
    public async Task Invalid_or_excess_shipment_quantities_never_change_stock(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);await Expect(await Dispatch(c,d,qty),qty==11?HttpStatusCode.Conflict:HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));
    }
    [Fact]
    public async Task Wrong_transfer_line_cross_company_and_non_stock_destinations_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var e=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var otherShip=await Expect(await Dispatch(c,e),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/receipts",new TransitEventInput(Code(),"Wrong source",[new(Line(otherShip),1)])),HttpStatusCode.NotFound);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/accounting/transit-transfers/{Tid(ship)}"),HttpStatusCode.NotFound);await Expect(await Event(other,ship),HttpStatusCode.NotFound);await Expect(await Dispatch(other,d),HttpStatusCode.UnprocessableEntity);var transit=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Not physical destination",Kind:"TRANSIT"));await Expect(await Send(c,HttpMethod.Post,"/inventory/transit-transfers",new TransitDispatchInput(d.Sales.Warehouse,transit,Code(),"Reason",[new(d.Sales.Product,1)])),HttpStatusCode.UnprocessableEntity);
    }
    [Theory]
    [InlineData("dispatch")]
    [InlineData("receipts")]
    [InlineData("returns")]
    [InlineData("shortages")]
    public async Task Closed_period_and_inactive_control_account_roll_back_complete_action(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=action=="dispatch"?default:await Expect(await Dispatch(c,d),HttpStatusCode.Created);Task<HttpResponseMessage> Execute()=>action=="dispatch"?Dispatch(c,d):Event(c,ship,action);var before=await Balance(d);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Balance(d));}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1250'",("company",db.Company));try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Balance(d));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='1250'",("company",db.Company));}await Expect(await Execute(),HttpStatusCode.Created);
    }
    [Theory]
    [InlineData("dispatch")]
    [InlineData("receipts")]
    [InlineData("returns")]
    [InlineData("shortages")]
    public async Task Late_audit_failure_rolls_back_stock_transit_journal_sequence_and_idempotency(string action)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=action=="dispatch"?default:await Expect(await Dispatch(c,d),HttpStatusCode.Created);var eventType=action=="dispatch"?"inventory.transit_dispatched":action=="receipts"?"inventory.transit_received":action=="returns"?"inventory.transit_returned":"inventory.transit_shortage_posted";var dtype=action=="dispatch"?"TRANSIT_DISPATCH":action=="receipts"?"TRANSIT_RECEIPT":"TRANSIT_ADJUSTMENT";var before=await Balance(d);var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",dtype));var key=Code();var reference=Code();Task<HttpResponseMessage> Execute()=>action=="dispatch"?Dispatch(c,d,key:key,reference:reference):Event(c,ship,action,key:key,reference:reference);
        await S("CREATE FUNCTION public.fail_transit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+eventType+"' THEN RAISE EXCEPTION 'Injected transit failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_transit BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_transit()");try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal(before,await Balance(d));Assert.Equal((0m,0m,0m),await Balance(d,d.Destination));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",dtype)));if(action!="dispatch")Assert.Equal(20,D((await Track(c,ship)).GetProperty("transfer").GetProperty("remainingCost")));}finally{await S("DROP TRIGGER test_transit ON platform.audit_events;DROP FUNCTION public.fail_transit()");}await Expect(await Execute(),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Misconfigured_same_transit_and_inventory_account_is_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1200') WHERE company_id=@company AND purpose='INVENTORY_TRANSIT'",("company",db.Company));try{await Expect(await Dispatch(c,d),HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));}finally{await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1250') WHERE company_id=@company AND purpose='INVENTORY_TRANSIT'",("company",db.Company));}
    }
    [Fact]
    public async Task App_cannot_mutate_posted_source_and_direct_SQL_permission_is_enforced()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await using(var s=await db.SessionAsync()){var denied=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE inventory.transit_transfer_lines SET cost=0 WHERE transfer_id=@id",default,("id",Tid(ship))));Assert.Equal("42501",denied.SqlState);}var immutable=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",Tid(ship))));Assert.Equal("23514",immutable.SqlState);var(sub,_)=await Staff(db,"WAREHOUSE",d.Sales);await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,sub,default)).Single(x=>x.CompanyId==db.Company);await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"direct-shortage",default);var error=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT inventory.post_transit_event(@id,'SHORTAGE','DIRECT','Reason','[]'::jsonb)",default,("id",Tid(ship))));Assert.Equal("42501",error.SqlState);
    }
    [Fact]
    public async Task Missing_key_duplicate_lines_zero_arrival_and_future_free_fields_cannot_forge_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);using var req=new HttpRequestMessage(HttpMethod.Post,"/api/v1/inventory/transit-transfers"){Content=System.Net.Http.Json.JsonContent.Create(new TransitDispatchInput(d.Sales.Warehouse,d.Destination,Code(),"Reason",[new(d.Sales.Product,2)]))};await Expect(await c.SendAsync(req),HttpStatusCode.BadRequest);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await Expect(await Event(c,ship,qty:0),HttpStatusCode.UnprocessableEntity);await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/receipts",new TransitEventInput(Code(),"Reason",[new(Line(ship),1),new(Line(ship),1)])),HttpStatusCode.UnprocessableEntity);
        var receipt=await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/receipts",new{reference=Code(),reason="Actual arrival",lines=new[]{new{transferLineId=Line(ship),quantity=2,cost=999}},warehouseId=d.Sales.Warehouse,cost=999,businessDate="2099-01-01"}),HttpStatusCode.Created);Assert.Equal(20,await Journal(Eid(receipt),"1250","credit"));Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));
    }

    [Fact]
    public async Task Independent_shipments_into_same_pool_merge_without_lost_quantity_or_value()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var source=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Second source"));await StockOpening.InitializeAsync(db.Owner,db.Company,source,d.Sales.Product,10,"Second opening",DatabaseFixture.Issuer,db.Subject);await StockValuation.InitializeAsync(db.Owner,db.Company,source,d.Sales.Product,300,"Second valuation",DatabaseFixture.Issuer,db.Subject);var e=new Data(d.Sales with{Warehouse=source},d.Destination);var first=await Expect(await Dispatch(c,d),HttpStatusCode.Created);var second=await Expect(await Dispatch(c,e),HttpStatusCode.Created);
        foreach(var r in await Task.WhenAll(Event(c,first),Event(c,second)))await Expect(r,HttpStatusCode.Created);Assert.Equal((4m,0m,80m),await Balance(d,d.Destination));Assert.Equal(0,D((await Track(c,first)).GetProperty("transfer").GetProperty("remainingCost")));Assert.Equal(0,D((await Track(c,second)).GetProperty("transfer").GetProperty("remainingCost")));
    }
    [Fact]
    public async Task Multi_SKU_later_overreceipt_rolls_back_earlier_arrival_and_new_destination_pools()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var other=await SetupStock(c);await StockOpening.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,other.Sales.Product,10,"Second product",DatabaseFixture.Issuer,db.Subject);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,other.Sales.Product,200,"Second product value",DatabaseFixture.Issuer,db.Subject);
        var ship=await Expect(await Send(c,HttpMethod.Post,"/inventory/transit-transfers",new TransitDispatchInput(d.Sales.Warehouse,d.Destination,Code(),"Multiple product dispatch",[new(d.Sales.Product,2),new(other.Sales.Product,2)])),HttpStatusCode.Created);var lines=ship.GetProperty("lines").EnumerateArray().OrderBy(x=>x.GetProperty("productId").GetGuid()).ToArray();
        await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/receipts",new TransitEventInput(Code(),"Last product wrong",[new(lines[0].GetProperty("id").GetGuid(),1),new(lines[1].GetProperty("id").GetGuid(),3)])),HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m),await Balance(d,d.Destination));Assert.Equal((0m,0m,0m),await Balance(other,d.Destination));var view=await Track(c,ship);Assert.Equal(60,D(view.GetProperty("transfer").GetProperty("remainingCost")));Assert.Equal(0,view.GetProperty("events").GetArrayLength());
        await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{Tid(ship)}/receipts",new TransitEventInput(Code(),"Correct receipt",lines.Select(x=>new TransitEventLine(x.GetProperty("id").GetGuid(),2)).ToArray())),HttpStatusCode.Created);Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));Assert.Equal((2m,0m,40m),await Balance(other,d.Destination));
    }
    [Fact]
    public async Task Unvalued_destination_rejects_receipt_then_retry_updates_revision_and_invalidates_old_count()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await StockOpening.InitializeAsync(db.Owner,db.Company,d.Destination,d.Sales.Product,2,"Unvalued destination opening",DatabaseFixture.Issuer,db.Subject);var key=Code();var reference=Code();await Expect(await Event(c,ship,key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,D((await Track(c,ship)).GetProperty("transfer").GetProperty("remainingCost")));await StockValuation.InitializeAsync(db.Owner,db.Company,d.Destination,d.Sales.Product,60,"Destination value initialized",DatabaseFixture.Issuer,db.Subject);
        var count=await Expect(await Send(c,HttpMethod.Post,"/inventory/stock-counts",new StockCountInput(d.Destination,Code(),"Destination count",[d.Sales.Product])),HttpStatusCode.Created);var id=count.GetProperty("count").GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new StockCountSubmission([new(d.Sales.Product,2)]),1),HttpStatusCode.OK);await Expect(await Event(c,ship,key:key,reference:reference),HttpStatusCode.Created);Assert.Equal((4m,0m,80m),await Balance(d,d.Destination));await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/post",version:2),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Inactive_destination_blocks_arrival_but_allows_actual_source_return_without_losing_transit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var ship=await Expect(await Dispatch(c,d),HttpStatusCode.Created);await S("UPDATE catalog.warehouses SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Destination));await Expect(await Event(c,ship),HttpStatusCode.UnprocessableEntity);Assert.Equal(20,D((await Track(c,ship)).GetProperty("transfer").GetProperty("remainingCost")));await Expect(await Event(c,ship,"returns"),HttpStatusCode.Created);Assert.Equal((10m,0m,100m),await Balance(d));Assert.Equal("CLOSED",(await Track(c,ship)).GetProperty("transfer").GetProperty("state").GetString());
    }
}
