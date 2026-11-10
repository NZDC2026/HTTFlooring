using System.Net;
using System.Text.Json;
using Htt.Host.Api.Inventory;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class InventoryControlTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private sealed record Data(SalesData Sales,Guid Destination);
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private async Task<Data> SetupStock(HttpClient c,decimal quantity=10,decimal? value=100,string destinationKind="SELLABLE")
    {
        var d=await Setup(db,c,quantity);if(quantity>0 && value is{} v)await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,v,Code(),DatabaseFixture.Issuer,db.Subject);
        return new(d,await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Transfer destination",Kind:destinationKind)));
    }
    private static Task<HttpResponseMessage> Transfer(HttpClient c,Data d,decimal qty=2,Guid? from=null,Guid? to=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,"/inventory/transfers",new StockTransferInput(from??d.Sales.Warehouse,to??d.Destination,reference??Code(),"Confirmed physical handover",[new(d.Sales.Product,qty)]),key:key);
    private static Task<HttpResponseMessage> WriteOff(HttpClient c,Data d,decimal qty=2,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,"/inventory/write-offs",new StockWriteOffInput(d.Sales.Warehouse,reference??Code(),"Damage evidenced and disposal confirmed",[new(d.Sales.Product,qty)]),key:key);
    private static Task<HttpResponseMessage> Start(HttpClient c,Data d,string? key=null,string? reference=null,Guid? warehouse=null)=>Send(c,HttpMethod.Post,"/inventory/stock-counts",new StockCountInput(warehouse??d.Sales.Warehouse,reference??Code(),"Physical count evidence",[d.Sales.Product]),key:key);
    private static Guid CountId(JsonElement r)=>r.GetProperty("count").GetProperty("id").GetGuid();
    private static Guid OpId(JsonElement r)=>r.GetProperty("operation").GetProperty("id").GetGuid();
    private static long VersionOf(JsonElement r)=>r.GetProperty("count").GetProperty("version").GetInt64();
    private static Task<HttpResponseMessage> Submit(HttpClient c,Data d,Guid id,decimal qty,decimal? gain=null,long version=1,string? key=null)=>Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new StockCountSubmission([new(d.Sales.Product,qty,gain)]),version,key);
    private static Task<HttpResponseMessage> Post(HttpClient c,Guid id,long version=2,string? key=null)=>Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/post",version:version,key:key);
    private static async Task<Guid> SubmittedCount(HttpClient c,Data d,decimal qty,decimal? gain=null)
    {
        var sheet=await Expect(await Start(c,d),HttpStatusCode.Created);var id=CountId(sheet);await Expect(await Submit(c,d,id,qty,gain),HttpStatusCode.OK);return id;
    }
    private async Task<(decimal Qty,decimal Reserved,decimal Value)> Balance(Data d,Guid? warehouse=null)
    {
        await using var s=await db.SessionAsync();var r=(await Sql.RowsAsync(s,"SELECT b.on_hand,b.reserved,v.value FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.warehouse_id=@warehouse AND b.product_id=@product",default,("company",db.Company),("warehouse",warehouse??d.Sales.Warehouse),("product",d.Sales.Product))).SingleOrDefault();return r is null?(0,0,0):((decimal)r["on_hand"]!,(decimal)r["reserved"]!,r["value"] is decimal v?v:-1);
    }
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(jl.{side}),0) FROM accounting.posting_batches pb JOIN accounting.journal_entries je ON je.company_id=pb.company_id AND je.posting_batch_id=pb.id JOIN accounting.journal_lines jl ON jl.company_id=je.company_id AND jl.journal_entry_id=je.id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE pb.company_id=@company AND pb.source_document_id=@doc AND a.code=@code",("company",db.Company),("doc",doc),("code",code)));
    [Fact]
    public async Task Transfer_preserves_total_quantity_value_and_posts_balanced_inventory_reclassification()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var r=await Expect(await Transfer(c,d),HttpStatusCode.Created);Assert.StartsWith("TR-",r.GetProperty("operation").GetProperty("number").GetString());Assert.Equal((8m,0m,80m),await Balance(d));Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));Assert.Equal(20,await Journal(OpId(r),"1200","debit"));Assert.Equal(20,await Journal(OpId(r),"1200","credit"));Assert.Equal(2,r.GetProperty("lines").GetArrayLength());Assert.Equal(OpId(r),OpId(await Get(c,$"/inventory/transfers/{OpId(r)}")));
    }
    [Fact]
    public async Task Destination_average_merges_existing_value_and_source_last_unit_absorbs_cents()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,3,0.02m);await Expect(await Transfer(c,d,1),HttpStatusCode.Created);Assert.Equal((2m,0m,0.01m),await Balance(d));await Expect(await Transfer(c,d,2),HttpStatusCode.Created);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal((3m,0m,0.02m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Quarantine_transfer_has_value_but_is_not_available_for_sale()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,destinationKind:"QUARANTINE");await Expect(await Transfer(c,d),HttpStatusCode.Created);Assert.Equal((2m,0m,20m),await Balance(d,d.Destination));var rows=(await Get(c,$"/inventory/availability?warehouseId={d.Destination}&productId={d.Sales.Product}")).GetProperty("items");Assert.Equal(0,D(rows[0].GetProperty("available")));
    }
    [Theory]
    [InlineData(8,20,5300)]
    [InlineData(12,20,4100)]
    [InlineData(0,100,5300)]
    public async Task Count_difference_posts_loss_or_gain_at_snapshot_average(decimal actual,decimal amount,int code)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=await SubmittedCount(c,d,actual);var r=await Expect(await Post(c,id),HttpStatusCode.OK);Assert.Equal("POSTED",r.GetProperty("count").GetProperty("state").GetString());Assert.Equal((actual,0m,actual*10),await Balance(d));Assert.Equal(amount,await Journal(id,code.ToString(System.Globalization.CultureInfo.InvariantCulture),actual>10?"credit":"debit"));Assert.Equal(amount,await Journal(id,"1200",actual>10?"debit":"credit"));Assert.Equal(3,VersionOf(r));
    }
    [Theory]
    [InlineData(25)]
    [InlineData(0)]
    public async Task Empty_stock_gain_requires_explicit_financial_value(decimal value)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,0);var id=await SubmittedCount(c,d,2,value);await Expect(await Post(c,id),HttpStatusCode.OK);Assert.Equal((2m,0m,value),await Balance(d));Assert.Equal(value,await Journal(id,"4100","credit"));
    }
    [Fact]
    public async Task Missing_empty_gain_value_and_unauthorized_value_overrides_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var empty=await SetupStock(c,0);var id=await SubmittedCount(c,empty,2);await Expect(await Post(c,id),HttpStatusCode.UnprocessableEntity);Assert.Equal((0m,0m,0m),await Balance(empty));var d=await SetupStock(c);foreach(var qty in new[]{8m,10m,12m}){id=await SubmittedCount(c,d,qty,99);await Expect(await Post(c,id),HttpStatusCode.UnprocessableEntity);}Assert.Equal((10m,0m,100m),await Balance(d));
    }
    [Fact]
    public async Task No_difference_and_zero_cost_operations_still_have_audit_without_empty_journal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,value:0);var id=await SubmittedCount(c,d,10);await Expect(await Post(c,id),HttpStatusCode.OK);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.posting_batches WHERE company_id=@company AND source_document_id=@id",("company",db.Company),("id",id)));var t=await Expect(await Transfer(c,d),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,t.GetProperty("operation").GetProperty("journalEntryId").ValueKind);var w=await Expect(await WriteOff(c,d),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,w.GetProperty("operation").GetProperty("journalEntryId").ValueKind);Assert.Equal((6m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Writeoff_posts_damage_expense_and_cannot_write_off_reserved_stock()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,4.4m,40);var q=await Submitted(c,d.Sales.Draft(1));await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);var r=await Expect(await WriteOff(c,d,2.2m),HttpStatusCode.Created);Assert.Equal((2.2m,2.2m,20m),await Balance(d));Assert.Equal(20,await Journal(OpId(r),"5400","debit"));await Expect(await WriteOff(c,d,0.1m),HttpStatusCode.Conflict);await Expect(await Transfer(c,d,0.1m),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Count_loss_cannot_break_existing_reservations()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,4.4m,40);var q=await Submitted(c,d.Sales.Draft(1));await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);var id=await SubmittedCount(c,d,0);await Expect(await Post(c,id),HttpStatusCode.Conflict);Assert.Equal((4.4m,2.2m,40m),await Balance(d));
    }
    [Fact]
    public async Task Snapshot_rejects_quantity_ABA_even_when_quantity_and_value_return_to_original()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=await SubmittedCount(c,d,9);await Expect(await Transfer(c,d),HttpStatusCode.Created);await Expect(await Transfer(c,d,from:d.Destination,to:d.Sales.Warehouse),HttpStatusCode.Created);Assert.Equal((10m,0m,100m),await Balance(d));await Expect(await Post(c,id),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/cancel",version:2),HttpStatusCode.OK);var fresh=await SubmittedCount(c,d,9);await Expect(await Post(c,fresh),HttpStatusCode.OK);Assert.Equal((9m,0m,90m),await Balance(d));
    }
    [Fact]
    public async Task Value_only_change_and_reservation_change_invalidate_snapshot()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=await SubmittedCount(c,d,9);await S("UPDATE inventory.stock_values v SET value=value+1 FROM inventory.stock_balances b WHERE b.company_id=@company AND b.product_id=@product AND b.id=v.stock_balance_id AND v.company_id=b.company_id",("company",db.Company),("product",d.Sales.Product));await Expect(await Post(c,id),HttpStatusCode.Conflict);
        var e=await SetupStock(c,4.4m,40);id=await SubmittedCount(c,e,4.4m);var q=await Submitted(c,e.Sales.Draft(1));await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);await Expect(await Post(c,id),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Count_versions_full_submission_and_cancel_transitions_are_enforced()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var sheet=await Expect(await Start(c,d),HttpStatusCode.Created);var id=CountId(sheet);Assert.StartsWith("CT-",sheet.GetProperty("count").GetProperty("number").GetString());await Expect(await Post(c,id,1),HttpStatusCode.Conflict);await Expect(await Submit(c,d,id,9,version:2),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new StockCountSubmission([]),1),HttpStatusCode.UnprocessableEntity);await Expect(await Submit(c,d,id,9),HttpStatusCode.OK);await Expect(await Submit(c,d,id,8,version:2),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/cancel",version:2),HttpStatusCode.OK);await Expect(await Post(c,id,3),HttpStatusCode.Conflict);Assert.Equal((10m,0m,100m),await Balance(d));
    }
    [Fact]
    public async Task Same_key_start_submit_and_post_replay_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var key=Code();var reference=Code();var started=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Start(c,d,key,reference)));var sheets=new List<Guid>();foreach(var r in started)sheets.Add(CountId(await Expect(r,HttpStatusCode.Created)));Assert.Single(sheets.Distinct());var id=sheets[0];key=Code();foreach(var r in await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Submit(c,d,id,8,key:key))))await Expect(r,HttpStatusCode.OK);key=Code();foreach(var r in await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Post(c,id,key:key))))await Expect(r,HttpStatusCode.OK);Assert.Equal((8m,0m,80m),await Balance(d));await Expect(await Submit(c,d,id,7,key:key),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("TRANSFER")]
    [InlineData("WRITE_OFF")]
    public async Task Same_key_inventory_commands_apply_once_and_different_payload_conflicts(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var key=Code();var reference=Code();Task<HttpResponseMessage> Execute(decimal q)=>kind=="TRANSFER"?Transfer(c,d,q,key:key,reference:reference):WriteOff(c,d,q,key,reference);var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Execute(2)));var ids=new List<Guid>();foreach(var r in results)ids.Add(OpId(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(await Execute(3),HttpStatusCode.Conflict);Assert.Equal((8m,0m,80m),await Balance(d));
    }
    [Fact]
    public async Task Concurrent_transfer_and_writeoff_cannot_consume_the_same_last_stock()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,2,20);var results=await Task.WhenAll(Transfer(c,d),WriteOff(c,d));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal((0m,0m,0m),await Balance(d));
    }
    [Fact]
    public async Task Opposite_transfers_use_stable_lock_order_and_preserve_total_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);await Expect(await Transfer(c,d,5),HttpStatusCode.Created);var results=await Task.WhenAll(Transfer(c,d,2),Transfer(c,d,2,from:d.Destination,to:d.Sales.Warehouse));foreach(var r in results)await Expect(r,HttpStatusCode.Created);Assert.Equal((5m,0m,50m),await Balance(d));Assert.Equal((5m,0m,50m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Two_submitted_counts_cannot_overwrite_each_others_posting()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var a=await SubmittedCount(c,d,8);var b=await SubmittedCount(c,d,7);var results=await Task.WhenAll(Post(c,a),Post(c,b));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Contains((await Balance(d)).Qty,new[]{7m,8m});
    }
    [Fact]
    public async Task Count_post_and_cancel_race_has_one_valid_final_state()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=await SubmittedCount(c,d,8);var results=await Task.WhenAll(Post(c,id),Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/cancel",version:2));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Contains((await Balance(d)).Qty,new[]{8m,10m});
    }
    [Fact]
    public async Task Count_post_and_transfer_do_not_lose_a_committed_inventory_change()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=await SubmittedCount(c,d,9);var results=await Task.WhenAll(Post(c,id),Transfer(c,d,2));await Expect(results[1],HttpStatusCode.Created);Assert.Contains(results[0].StatusCode,new[]{HttpStatusCode.OK,HttpStatusCode.Conflict});var b=await Balance(d);Assert.Equal(results[0].StatusCode==HttpStatusCode.OK?7m:8m,b.Qty);Assert.Equal(b.Qty*10,b.Value);
    }
    [Fact]
    public async Task Transfers_competing_with_sales_issue_preserve_reservations_and_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,4.4m,40);var q=await Submitted(c,d.Sales.Draft(1));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new PickInput([new(line,1)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();var results=await Task.WhenAll(Transfer(c,d,2.2m),Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer","Concurrent transfer"),1));await Expect(results[0],HttpStatusCode.Created);await Expect(results[1],HttpStatusCode.OK);Assert.Equal((0m,0m,0m),await Balance(d));Assert.Equal((2.2m,0m,20m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Warehouse_requires_both_transfer_scopes_hides_cost_and_cannot_post_financial_losses()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var(sub,member)=await Staff(db,"WAREHOUSE",d.Sales);using var w=api.Authenticated(sub);await Expect(await Transfer(w,d),HttpStatusCode.Forbidden);await S("INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@member,@warehouse)",("company",db.Company),("member",member),("warehouse",d.Destination));var r=await Expect(await Transfer(w,d),HttpStatusCode.Created);Assert.False(r.GetProperty("operation").TryGetProperty("journalEntryId",out _));Assert.False(r.GetProperty("lines")[0].TryGetProperty("valueDelta",out _));var count=await Expect(await Start(w,d),HttpStatusCode.Created);Assert.False(count.GetProperty("lines")[0].TryGetProperty("snapshotValue",out _));await Expect(await Submit(w,d,CountId(count),7),HttpStatusCode.OK);await Expect(await Post(w,CountId(count)),HttpStatusCode.Forbidden);await Expect(await WriteOff(w,d),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_approves_submitted_count_and_writeoff_but_cannot_perform_physical_transfer_or_count_capture()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);await Expect(await Start(f,d),HttpStatusCode.Forbidden);await Expect(await Transfer(f,d),HttpStatusCode.Forbidden);var id=await SubmittedCount(c,d,9);await Expect(await Post(f,id),HttpStatusCode.OK);await Expect(await WriteOff(f,d),HttpStatusCode.Created);Assert.Equal((7m,0m,70m),await Balance(d));Assert.Equal(id,CountId(await Get(f,$"/accounting/stock-counts/{id}")));
    }
    [Theory]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    [InlineData("PROCUREMENT")]
    public async Task Other_roles_have_no_inventory_control_writes(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var(sub,_)=await Staff(db,role);using var staff=api.Authenticated(sub);await Expect(await Transfer(staff,d),HttpStatusCode.Forbidden);await Expect(await WriteOff(staff,d),HttpStatusCode.Forbidden);await Expect(await Start(staff,d),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Cross_company_and_transit_destinations_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Transfer(other,d),HttpStatusCode.UnprocessableEntity);var id=CountId(await Expect(await Start(c,d),HttpStatusCode.Created));await Expect(await Post(other,id),HttpStatusCode.NotFound);var transit=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Transit",Kind:"TRANSIT"));await Expect(await Transfer(c,d,to:transit),HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.0000001)]
    [InlineData(11)]
    public async Task Invalid_or_excess_transfer_quantity_has_no_effect(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);await Expect(await Transfer(c,d,qty),qty==11?HttpStatusCode.Conflict:HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));Assert.Equal((0m,0m,0m),await Balance(d,d.Destination));
    }
    [Fact]
    public async Task Missing_valuation_same_warehouse_duplicates_and_inactive_destination_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c,value:null);await Expect(await Transfer(c,d),HttpStatusCode.UnprocessableEntity);await Expect(await Start(c,d),HttpStatusCode.UnprocessableEntity);await Expect(await Transfer(c,d,to:d.Sales.Warehouse),HttpStatusCode.UnprocessableEntity);await Expect(await Send(c,HttpMethod.Post,"/inventory/write-offs",new StockWriteOffInput(d.Sales.Warehouse,Code(),"Reason",[new(d.Sales.Product,1),new(d.Sales.Product,1)])),HttpStatusCode.UnprocessableEntity);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Sales.Warehouse,d.Sales.Product,100,Code(),DatabaseFixture.Issuer,db.Subject);await S("UPDATE catalog.warehouses SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Destination));await Expect(await Transfer(c,d),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Duplicate_reference_is_company_unique_for_operations_but_count_reference_is_per_warehouse()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var reference=Code();await Expect(await Transfer(c,d,reference:reference.ToUpperInvariant()),HttpStatusCode.Created);await Expect(await Transfer(c,d,reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);reference=Code();var a=CountId(await Expect(await Start(c,d,reference:reference),HttpStatusCode.Created));var b=CountId(await Expect(await Start(c,d,reference:reference,warehouse:d.Destination),HttpStatusCode.Created));await Expect(await Submit(c,d,a,8),HttpStatusCode.OK);await Expect(await Submit(c,d,b,2),HttpStatusCode.OK);await Expect(await Post(c,a),HttpStatusCode.OK);await Expect(await Post(c,b),HttpStatusCode.OK);
    }
    [Theory]
    [InlineData("transfer")]
    [InlineData("count")]
    [InlineData("writeoff")]
    public async Task Closed_period_or_disabled_mapping_rolls_back(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=kind=="count"?await SubmittedCount(c,d,8):Guid.Empty;await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));Task<HttpResponseMessage> Execute()=>kind=="transfer"?Transfer(c,d):kind=="count"?Post(c,id):WriteOff(c,d);
        try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}
        await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1200'",("company",db.Company));try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code='1200'",("company",db.Company));}await Expect(await Execute(),kind=="count"?HttpStatusCode.OK:HttpStatusCode.Created);
    }
    [Theory]
    [InlineData("transfer")]
    [InlineData("count")]
    [InlineData("writeoff")]
    public async Task Late_audit_failure_rolls_back_quantity_value_revision_journal_sequence_and_success_key(string kind)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var id=kind=="count"?await SubmittedCount(c,d,8):Guid.Empty;var action=kind=="transfer"?"inventory.transferred":kind=="count"?"inventory.count_posted":"inventory.written_off";var dtype=kind=="transfer"?"STOCK_TRANSFER":kind=="count"?"STOCK_COUNT":"STOCK_WRITEOFF";var key=Code();var reference=Code();var before=await S("SELECT revision FROM inventory.stock_balances WHERE company_id=@company AND warehouse_id=@wh AND product_id=@product",("company",db.Company),("wh",d.Sales.Warehouse),("product",d.Sales.Product));var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",dtype));Task<HttpResponseMessage> Execute()=>kind=="transfer"?Transfer(c,d,key:key,reference:reference):kind=="count"?Post(c,id,key:key):WriteOff(c,d,key:key,reference:reference);
        await S("CREATE FUNCTION public.fail_stock_control() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected control failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_stock_control BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_stock_control()");
        try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal((10m,0m,100m),await Balance(d));Assert.Equal(before,await S("SELECT revision FROM inventory.stock_balances WHERE company_id=@company AND warehouse_id=@wh AND product_id=@product",("company",db.Company),("wh",d.Sales.Warehouse),("product",d.Sales.Product)));Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",dtype)));}
        finally{await S("DROP TRIGGER test_stock_control ON platform.audit_events;DROP FUNCTION public.fail_stock_control()");}await Expect(await Execute(),kind=="count"?HttpStatusCode.OK:HttpStatusCode.Created);
    }
    [Fact]
    public async Task Direct_SQL_commands_check_permissions_and_final_documents_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);var(sub,_)=await Staff(db,"SALES");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,sub,default)).Single(x=>x.CompanyId==db.Company);await using(var s=new CompanySession(source)){await s.BeginAsync(db.Company,access.ActorId,"direct-stock",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"SELECT inventory.post_control('WRITE_OFF',@wh,NULL,'DIRECT','Reason','[]'::jsonb)",default,("wh",d.Sales.Warehouse)));Assert.Equal("42501",e.SqlState);}
        var r=await Expect(await Transfer(c,d),HttpStatusCode.Created);await using(var s=await db.SessionAsync()){var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE inventory.operation_lines SET quantity_delta=0 WHERE operation_id=@id",default,("id",OpId(r))));Assert.Equal("42501",e.SqlState);}var immutable=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",OpId(r))));Assert.Equal("23514",immutable.SqlState);
    }
    [Fact]
    public async Task Missing_idempotency_or_version_is_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupStock(c);using var request=new HttpRequestMessage(HttpMethod.Post,"/api/v1/inventory/transfers"){Content=System.Net.Http.Json.JsonContent.Create(new StockTransferInput(d.Sales.Warehouse,d.Destination,Code(),"Reason",[new(d.Sales.Product,2)]))};await Expect(await c.SendAsync(request),HttpStatusCode.BadRequest);var id=CountId(await Expect(await Start(c,d),HttpStatusCode.Created));await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new StockCountSubmission([new(d.Sales.Product,9)])),(HttpStatusCode)428);await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new{lines=new[]{new{productId=d.Sales.Product}}},1),HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task Multi_SKU_opposite_transfers_lock_consistently_and_conserve_each_cost_pool()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var a=await SetupStock(c);var e=await SetupStock(c);var b=new Data(e.Sales with{Warehouse=a.Sales.Warehouse},a.Destination);await StockOpening.InitializeAsync(db.Owner,db.Company,b.Sales.Warehouse,b.Sales.Product,10,"Second SKU opening",DatabaseFixture.Issuer,db.Subject);await StockValuation.InitializeAsync(db.Owner,db.Company,b.Sales.Warehouse,b.Sales.Product,200,"Second SKU value",DatabaseFixture.Issuer,db.Subject);
        Task<HttpResponseMessage> Move(Guid from,Guid to,bool reverse)=>Send(c,HttpMethod.Post,"/inventory/transfers",new StockTransferInput(from,to,Code(),"Multiple SKU handover",reverse?[new(b.Sales.Product,2),new(a.Sales.Product,2)]:[new(a.Sales.Product,2),new(b.Sales.Product,2)]));
        await Expect(await Move(a.Sales.Warehouse,a.Destination,false),HttpStatusCode.Created);var results=await Task.WhenAll(Move(a.Sales.Warehouse,a.Destination,false),Move(a.Destination,a.Sales.Warehouse,true));foreach(var r in results)await Expect(r,HttpStatusCode.Created);Assert.Equal((8m,0m,80m),await Balance(a));Assert.Equal((2m,0m,20m),await Balance(a,a.Destination));Assert.Equal((8m,0m,160m),await Balance(b));Assert.Equal((2m,0m,40m),await Balance(b,b.Destination));
    }
    [Fact]
    public async Task Later_SKU_failure_rolls_back_prior_SKU_cost_and_quantity()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var a=await SetupStock(c);var e=await SetupStock(c);var b=new Data(e.Sales with{Warehouse=a.Sales.Warehouse},a.Destination);await StockOpening.InitializeAsync(db.Owner,db.Company,b.Sales.Warehouse,b.Sales.Product,10,"Second SKU opening",DatabaseFixture.Issuer,db.Subject);await StockValuation.InitializeAsync(db.Owner,db.Company,b.Sales.Warehouse,b.Sales.Product,100,"Second SKU value",DatabaseFixture.Issuer,db.Subject);var products=new[]{a.Sales.Product,b.Sales.Product}.Order().ToArray();await Expect(await Send(c,HttpMethod.Post,"/inventory/write-offs",new StockWriteOffInput(a.Sales.Warehouse,Code(),"Two SKU loss",[new(products[0],2),new(products[1],11)])),HttpStatusCode.Conflict);Assert.Equal((10m,0m,100m),await Balance(a));Assert.Equal((10m,0m,100m),await Balance(b));
    }
}
