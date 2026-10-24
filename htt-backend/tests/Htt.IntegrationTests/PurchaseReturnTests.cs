using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class PurchaseReturnTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,SalesData Sales,Guid Receipt,Guid ReceiptLine,Guid? Bill,Guid? BillLine,DateOnly Today,decimal Qty,decimal Net,decimal Tax);
    private async Task<Data> SetupReturn(HttpClient c,bool billed=true,string basis="CASH",bool registered=true,decimal qty=2,decimal cost=10,string itemType="STOCK",Guid? supplier=null)
    {
        await S("UPDATE core.companies SET gst_registered=@registered,gst_basis=@basis WHERE id=@company",("company",db.Company),("registered",registered),("basis",basis));
        var d=await Setup(db,c,0);var sid=supplier??await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier returns",null));
        if(itemType!="STOCK"){var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Accepted service",p.GetProperty("taxCodeId").GetGuid(),ItemType:itemType,WholePacks:false),1),HttpStatusCode.OK);}
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(sid,d.Warehouse,[new(d.BoxUnit,qty,cost)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);
        var r=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty)]),2),HttpStatusCode.Created);var today=DateOnly.Parse(r.GetProperty("receipt").GetProperty("businessDate").GetString()!,System.Globalization.CultureInfo.InvariantCulture);
        var data=new Data(sid,d,r.GetProperty("receipt").GetProperty("id").GetGuid(),r.GetProperty("lines")[0].GetProperty("id").GetGuid(),null,null,today,qty,D(r.GetProperty("receipt").GetProperty("net")),D(r.GetProperty("receipt").GetProperty("tax")));
        return billed?await Bill(c,data,qty,data.Net,data.Tax):data;
    }
    private static async Task<Data> Bill(HttpClient c,Data d,decimal qty,decimal net,decimal tax)
    {
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,Code(),d.Today,d.Today.AddDays(30),d.Today,[new(d.ReceiptLine,qty,net,tax)],"Verified original",d.Today)),HttpStatusCode.Created);return d with{Bill=b.GetProperty("bill").GetProperty("id").GetGuid(),BillLine=b.GetProperty("lines")[0].GetProperty("id").GetGuid()};
    }
    private static Task<HttpResponseMessage> Return(HttpClient c,Data d,decimal? qty=null,string? key=null,string? reference=null,bool unbilled=false)=>Send(c,HttpMethod.Post,$"/purchase-receipts/{d.Receipt}/returns",new PurchaseReturnInput(reference??Code(),"Damaged / supplier accepted return",[new(d.ReceiptLine,qty??d.Qty,unbilled?null:d.BillLine)]),key:key);
    private static Guid Rid(JsonElement r)=>r.GetProperty("return").GetProperty("id").GetGuid();
    private static Guid Rline(JsonElement r)=>r.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Guid Cid(JsonElement r)=>r.GetProperty("credit").GetProperty("id").GetGuid();
    private static Guid Cline(JsonElement r)=>r.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private static Guid Fid(JsonElement r)=>r.GetProperty("refund").GetProperty("id").GetGuid();
    private static Task<HttpResponseMessage> Credit(HttpClient c,Data d,Guid line,decimal qty=2,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-bills/{d.Bill}/credits",new SupplierCreditInput(reference??Code(),"Verified supplier adjustment note",[new(line,qty)]),key:key);
    private static Task<HttpResponseMessage> Refund(HttpClient c,Guid? credit,decimal amount=22,Guid? advance=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,reference??Code(),"Verified incoming refund",credit,advance),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,decimal amount=22)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),Allocations:[new(d.BillLine!.Value,amount)]));
    private static async Task<JsonElement> Prepay(HttpClient c,Data d,decimal amount=22)=>await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),amount,Notes:"Deposit")),HttpStatusCode.Created);
    private static Guid Aid(JsonElement p)=>p.GetProperty("advances")[0].GetProperty("id").GetGuid();
    private static async Task<decimal> AP(HttpClient c,Data d)=>D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount"));
    private static async Task<decimal> GRNI(HttpClient c,Data d)=>D((await Get(c,$"/accounting/grni?supplierId={d.Supplier}")).GetProperty("accruedAmount"));
    private static async Task<decimal> Available(HttpClient c,Data d)=>D((await Get(c,$"/suppliers/{d.Supplier}/advances")).GetProperty("availableAmount"));
    private static Task<JsonElement> GST(HttpClient c,Data d)=>Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(jl.{side}),0) FROM accounting.posting_batches pb JOIN accounting.journal_entries je ON je.company_id=pb.company_id AND je.posting_batch_id=pb.id JOIN accounting.journal_lines jl ON jl.company_id=je.company_id AND jl.journal_entry_id=je.id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE pb.company_id=@company AND pb.source_document_id=@doc AND a.code=@code",("company",db.Company),("doc",doc),("code",code)));
    private async Task<(decimal,decimal)> Stock(Data d)
    {
        await using var s=await db.SessionAsync();var row=(await Sql.RowsAsync(s,"SELECT b.on_hand,v.value FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.product_id=@product",default,("company",db.Company),("product",d.Sales.Product))).SingleOrDefault();return row is null?(0,0):((decimal)row["on_hand"]!,(decimal)row["value"]!);
    }
    [Theory]
    [InlineData(true,20)]
    [InlineData(false,22)]
    public async Task Unbilled_return_removes_stock_and_GRNI_without_AP_or_GST(bool registered,decimal value)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false,registered:registered);var r=await Expect(await Return(c,d),HttpStatusCode.Created);Assert.StartsWith("PRT-",r.GetProperty("return").GetProperty("number").GetString());Assert.Equal((0m,0m),await Stock(d));Assert.Equal(0,await GRNI(c,d));Assert.Equal(value,await Journal(Rid(r),"2100","debit"));Assert.Equal(value,await Journal(Rid(r),"1200","credit"));Assert.Equal(0,await AP(c,d));Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));
        await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.ReceiptLine,2,d.Net,d.Tax)],"original",d.Today)),HttpStatusCode.Conflict);Assert.Equal(0,(await Get(c,$"/accounting/grni/unmatched?supplierId={d.Supplier}")).GetProperty("items").GetArrayLength());
    }
    [Fact]
    public async Task Partially_billed_receipt_returns_unbilled_remainder_and_billed_portion_separately()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);d=await Bill(c,d,1,10,1);await Expect(await Return(c,d,1,unbilled:true),HttpStatusCode.Created);Assert.Equal(0,await GRNI(c,d));Assert.Equal(11,await AP(c,d));var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r),1),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));Assert.Equal((0m,0m),await Stock(d));Assert.Equal(11,D(credit.GetProperty("credit").GetProperty("gross")));
    }
    [Fact]
    public async Task Return_before_bill_preserves_remaining_match_and_rounding()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false,qty:3,cost:0.05m);await Expect(await Return(c,d,1),HttpStatusCode.Created);Assert.Equal(0.10m,await GRNI(c,d));d=await Bill(c,d,2,0.10m,0.01m);Assert.Equal(0,await GRNI(c,d));Assert.Equal(0.11m,await AP(c,d));
    }
    [Theory]
    [InlineData("CASH")]
    [InlineData("NON_CASH")]
    public async Task Unpaid_credit_clears_AP_and_tax_but_cannot_generate_cash_refund(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,basis:basis);var r=await Expect(await Return(c,d),HttpStatusCode.Created);Assert.Equal(20,await Journal(Rid(r),"1600","debit"));Assert.Equal(22,await AP(c,d));var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);Assert.StartsWith("SC-",credit.GetProperty("credit").GetProperty("number").GetString());Assert.Equal(22,await Journal(Cid(credit),"2000","debit"));Assert.Equal(20,await Journal(Cid(credit),"1600","credit"));Assert.Equal(2,await Journal(Cid(credit),basis=="CASH"?"1410":"1300","credit"));Assert.Equal(0,await AP(c,d));Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(0,D((await GST(c,d)).GetProperty("pendingPaymentTax")));await Expect(await Refund(c,Cline(credit)),HttpStatusCode.Conflict);await Expect(await Pay(c,d),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("CASH",2)]
    [InlineData("NON_CASH",0)]
    public async Task Paid_credit_creates_refundable_vendor_balance_and_actual_refund_reverses_bank_and_GST(string basis,decimal gst)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,basis:basis);await Expect(await Pay(c,d),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);Assert.Equal(22,D(credit.GetProperty("lines")[0].GetProperty("refundableAmount")));Assert.Equal(22,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("availableCredit")));var before=await GST(c,d);Assert.Equal(gst,D(before.GetProperty("attributedTax")));Assert.Equal(gst,D(before.GetProperty("pendingRefundTax")));
        var f=await Expect(await Refund(c,Cline(credit)),HttpStatusCode.Created);Assert.StartsWith("SR-",f.GetProperty("refund").GetProperty("number").GetString());Assert.Equal(22,await Journal(Fid(f),"1000","debit"));Assert.Equal(22,await Journal(Fid(f),"2000","credit"));Assert.Equal(gst,await Journal(Fid(f),"1300","credit"));Assert.Equal(gst,await Journal(Fid(f),"1410","debit"));Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(0,D((await GST(c,d)).GetProperty("pendingRefundTax")));Assert.Equal(Fid(f),(await Get(c,$"/supplier-refunds/{Fid(f)}")).GetProperty("refund").GetProperty("id").GetGuid());Assert.True((long)(await S("SELECT count(*) FROM accounting.reversal_links WHERE company_id=@company",("company",db.Company)))!>=3);
    }
    [Fact]
    public async Task Partial_paid_full_credit_refunds_only_actual_paid_portion()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d,11),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);await Expect(await Refund(c,Cline(credit),22),HttpStatusCode.Conflict);var f=await Expect(await Refund(c,Cline(credit),11),HttpStatusCode.Created);Assert.Equal(1,await Journal(Fid(f),"1300","credit"));Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(0,await AP(c,d));
    }
    [Fact]
    public async Task Half_credit_against_half_paid_bill_is_fully_settled_without_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d,11),HttpStatusCode.Created);var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r),1),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));Assert.Equal(0,D(credit.GetProperty("lines")[0].GetProperty("refundableAmount")));Assert.Equal(1,D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(0,D((await GST(c,d)).GetProperty("pendingPaymentTax")));await Expect(await Refund(c,Cline(credit),1),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Further_payment_after_partial_credit_obeys_reduced_AP_and_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d,5.5m),HttpStatusCode.Created);var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);await Expect(await Credit(c,d,Rline(r),1),HttpStatusCode.Created);Assert.Equal(5.5m,await AP(c,d));await Expect(await Pay(c,d,5.5m),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));Assert.Equal(1,D((await GST(c,d)).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Multiple_partial_returns_credits_and_refunds_absorb_tax_and_cost_tail_cents()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,qty:3,cost:0.05m);await Expect(await Pay(c,d,0.17m),HttpStatusCode.Created);var amounts=new[]{0.06m,0.05m,0.06m};for(var i=0;i<3;i++){var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r),1),HttpStatusCode.Created);await Expect(await Refund(c,Cline(credit),amounts[i]),HttpStatusCode.Created);}Assert.Equal((0m,0m),await Stock(d));Assert.Equal(0,await AP(c,d));Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Moving_average_cost_difference_is_explicit_variance_not_hidden_repricing()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(d.Supplier,d.Sales.Warehouse,[new(d.Sales.BoxUnit,2,20)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),2),HttpStatusCode.Created);
        var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);Assert.Equal((6.6m,45m),await Stock(d));Assert.Equal(10,await Journal(Rid(r),"2100","debit"));Assert.Equal(15,await Journal(Rid(r),"1200","credit"));Assert.Equal(5,await Journal(Rid(r),"5200","debit"));
    }
    [Theory]
    [InlineData("SERVICE")]
    [InlineData("NON_STOCK")]
    public async Task Accepted_service_cancellation_reverses_original_expense_then_credit(string itemType)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,itemType:itemType);var r=await Expect(await Return(c,d),HttpStatusCode.Created);Assert.Equal(20,await Journal(Rid(r),"5100","credit"));Assert.Equal((0m,0m),await Stock(d));await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));
    }
    [Fact]
    public async Task Reserved_stock_cannot_be_returned_to_supplier()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var q=await Submitted(c,d.Sales.Draft(2));await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created);await Expect(await Return(c,d),HttpStatusCode.Conflict);Assert.Equal((4.4m,20m),await Stock(d));
    }
    [Fact]
    public async Task Zero_cost_return_and_credit_remain_auditable_without_empty_journal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,cost:0);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,r.GetProperty("return").GetProperty("journalEntryId").ValueKind);Assert.Equal(JsonValueKind.Null,credit.GetProperty("credit").GetProperty("journalEntryId").ValueKind);Assert.Equal((0m,0m),await Stock(d));await Expect(await Refund(c,Cline(credit),1),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Unallocated_prepaid_refund_reduces_asset_without_AP_or_tax_and_blocks_overapply()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var p=await Prepay(c,d);var f=await Expect(await Refund(c,null,11,Aid(p)),HttpStatusCode.Created);Assert.Equal(11,await Journal(Fid(f),"1000","debit"));Assert.Equal(11,await Journal(Fid(f),"1500","credit"));Assert.Equal(0,await Journal(Fid(f),"1300","credit"));Assert.Equal(11,await Available(c,d));await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{Aid(p)}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.BillLine!.Value,22)])),HttpStatusCode.Conflict);await Expect(await Refund(c,null,11,Aid(p)),HttpStatusCode.Created);Assert.Equal(0,await Available(c,d));
    }
    [Fact]
    public async Task Refunding_credit_paid_by_prepaid_application_does_not_restore_prepaid_twice()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var p=await Prepay(c,d);await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{Aid(p)}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.BillLine!.Value,22)])),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);await Expect(await Refund(c,Cline(credit)),HttpStatusCode.Created);Assert.Equal(0,await Available(c,d));await Expect(await Refund(c,null,1,Aid(p)),HttpStatusCode.Conflict);Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Same_key_parallel_return_executes_once_and_changed_payload_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);var key=Code();var reference=Code();var results=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Return(c,d,key:key,reference:reference)));var ids=new List<Guid>();foreach(var r in results)ids.Add(Rid(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());Assert.Equal((0m,0m),await Stock(d));await Expect(await Return(c,d,1,key,reference),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Different_keys_cannot_overreturn_same_receipt()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);var r=await Task.WhenAll(Return(c,d),Return(c,d));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await GRNI(c,d));
    }
    [Fact]
    public async Task Concurrent_unbilled_return_and_bill_matching_cannot_claim_same_quantity()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);var results=await Task.WhenAll(Return(c,d),Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,Code(),d.Today,d.Today,d.Today,[new(d.ReceiptLine,2,20,2)],"verified",d.Today)));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Same_key_credit_and_refund_each_execute_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var key=Code();var reference=Code();var cr=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Credit(c,d,Rline(r),key:key,reference:reference)));var credits=new List<JsonElement>();foreach(var item in cr)credits.Add(await Expect(item,HttpStatusCode.Created));Assert.Single(credits.Select(Cid).Distinct());key=Code();reference=Code();var refunds=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Refund(c,Cline(credits[0]),key:key,reference:reference)));var ids=new List<Guid>();foreach(var item in refunds)ids.Add(Fid(await Expect(item,HttpStatusCode.Created)));Assert.Single(ids.Distinct());
    }
    [Fact]
    public async Task Different_keys_cannot_double_credit_or_overrefund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credits=await Task.WhenAll(Credit(c,d,Rline(r)),Credit(c,d,Rline(r)));Assert.Single(credits,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(credits,x=>x.StatusCode==HttpStatusCode.Conflict);var credit=await Expect(credits.Single(x=>x.StatusCode==HttpStatusCode.Created),HttpStatusCode.Created);var refunds=await Task.WhenAll(Refund(c,Cline(credit)),Refund(c,Cline(credit)));Assert.Single(refunds,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(refunds,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Refund_and_prepaid_application_compete_for_same_available_asset()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var p=await Prepay(c,d);var results=await Task.WhenAll(Refund(c,null,22,Aid(p)),Send(c,HttpMethod.Post,$"/supplier-advances/{Aid(p)}/apply",new SupplierAdvanceApplicationInput(Code(),[new(d.BillLine!.Value,22)])));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(0,await Available(c,d));
    }
    [Fact]
    public async Task Credit_and_payment_race_cannot_leave_overpaid_outstanding_or_wrong_cash_GST()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var results=await Task.WhenAll(Credit(c,d,Rline(r)),Pay(c,d));await Expect(results[0],HttpStatusCode.Created);Assert.Contains(results[1].StatusCode,new[]{HttpStatusCode.Created,HttpStatusCode.Conflict});Assert.Equal(0,await AP(c,d));var g=await GST(c,d);Assert.Equal(results[1].StatusCode==HttpStatusCode.Created?2m:0m,D(g.GetProperty("pendingRefundTax")));
    }
    [Theory]
    [InlineData("WAREHOUSE")]
    [InlineData("PROCUREMENT")]
    public async Task Warehouse_scope_returns_hide_cost_and_do_not_grant_financial_contra_permissions(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var(sub,member)=await Staff(db,role);using var staff=api.Authenticated(sub);if(role=="WAREHOUSE"){await Expect(await Return(staff,d),HttpStatusCode.Forbidden);await S("INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(@company,@member,@warehouse)",("company",db.Company),("member",member),("warehouse",d.Sales.Warehouse));}
        var r=await Expect(await Return(staff,d),HttpStatusCode.Created);Assert.Equal(role=="PROCUREMENT",r.GetProperty("lines")[0].TryGetProperty("cost",out _));await Expect(await Credit(staff,d,Rline(r)),HttpStatusCode.Forbidden);await Expect(await Refund(staff,Guid.NewGuid()),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    public async Task Non_authorized_roles_cannot_execute_any_procurement_contra(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var(sub,_)=await Staff(db,role);using var staff=api.Authenticated(sub);await Expect(await Return(staff,d),HttpStatusCode.Forbidden);await Expect(await Credit(staff,d,Guid.NewGuid()),HttpStatusCode.Forbidden);await Expect(await Refund(staff,Guid.NewGuid()),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_credits_and_refunds_without_physical_return_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);await Expect(await Return(f,d),HttpStatusCode.Forbidden);Assert.Equal(Rid(r),(await Get(f,$"/accounting/purchase-returns/{Rid(r)}")).GetProperty("return").GetProperty("id").GetGuid());var credit=await Expect(await Credit(f,d,Rline(r)),HttpStatusCode.Created);await Expect(await Refund(f,Cline(credit)),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Cross_company_and_wrong_bill_sources_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var e=await SetupReturn(c);await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{d.Receipt}/returns",new PurchaseReturnInput(Code(),"wrong source",[new(e.ReceiptLine,1,e.BillLine)])),HttpStatusCode.NotFound);var r=await Expect(await Return(c,d),HttpStatusCode.Created);await Expect(await Credit(c,e,Rline(r)),HttpStatusCode.NotFound);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Return(other,d),HttpStatusCode.NotFound);await Expect(await Credit(other,d,Rline(r)),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/accounting/purchase-returns/{Rid(r)}"),HttpStatusCode.NotFound);
    }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(0.5)]
    [InlineData(0.0000001)]
    [InlineData(3)]
    public async Task Invalid_return_quantity_or_excess_never_changes_stock(decimal qty)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);await Expect(await Return(c,d,qty),qty==3?HttpStatusCode.Conflict:HttpStatusCode.UnprocessableEntity);Assert.Equal((4.4m,20m),await Stock(d));
    }
    [Fact]
    public async Task Closed_period_prevents_all_contra_operations_and_retry_is_possible()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var p=await Prepay(c,d);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Return(c,d),HttpStatusCode.UnprocessableEntity);await Expect(await Refund(c,null,1,Aid(p)),HttpStatusCode.UnprocessableEntity);}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}var r=await Expect(await Return(c,d),HttpStatusCode.Created);await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));try{await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.UnprocessableEntity);}finally{await S("UPDATE accounting.periods SET state='OPEN' WHERE company_id=@company",("company",db.Company));}await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);
    }
    [Theory]
    [InlineData("return")]
    [InlineData("credit")]
    [InlineData("refund")]
    public async Task Late_audit_failure_rolls_back_stock_AP_GST_and_sequence_and_same_key_retries(string stage)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);JsonElement r=default,credit=default;if(stage=="refund")await Expect(await Pay(c,d),HttpStatusCode.Created);if(stage!="return")r=await Expect(await Return(c,d),HttpStatusCode.Created);if(stage=="refund")credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);var type=stage=="return"?"PURCHASE_RETURN":stage=="credit"?"SUPPLIER_CREDIT":"SUPPLIER_REFUND";var action=stage=="return"?"purchase.goods_returned":stage=="credit"?"purchase.supplier_credited":"purchase.supplier_refunded";var key=Code();var reference=Code();var sequence=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",type));var beforeStock=await Stock(d);var beforeAP=await AP(c,d);var beforeGST=await GST(c,d);
        Task<HttpResponseMessage> Execute()=>stage=="return"?Return(c,d,key:key,reference:reference):stage=="credit"?Credit(c,d,Rline(r),key:key,reference:reference):Refund(c,Cline(credit),key:key,reference:reference);
        await S("CREATE FUNCTION public.fail_purchase_contra() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'injected contra failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_purchase_contra BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_purchase_contra()");try{await Expect(await Execute(),HttpStatusCode.UnprocessableEntity);Assert.Equal(beforeStock,await Stock(d));Assert.Equal(beforeAP,await AP(c,d));Assert.Equal(D(beforeGST.GetProperty("attributedTax")),D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(sequence,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type=@type",("company",db.Company),("type",type)));}finally{await S("DROP TRIGGER test_purchase_contra ON platform.audit_events;DROP FUNCTION public.fail_purchase_contra()");}await Expect(await Execute(),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Posted_contra_registry_and_lines_are_immutable_and_missing_key_is_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/purchase-receipts/{d.Receipt}/returns"){Content=System.Net.Http.Json.JsonContent.Create(new PurchaseReturnInput(Code(),"Return",[new(d.ReceiptLine,2,d.BillLine)]))};await Expect(await c.SendAsync(request),HttpStatusCode.BadRequest);var r=await Expect(await Return(c,d),HttpStatusCode.Created);await using(var s=await db.SessionAsync()){var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE purchase.return_lines SET quantity=0 WHERE id=@id",default,("id",Rline(r))));Assert.Equal("42501",e.SqlState);}var immutable=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id",("company",db.Company),("id",Rid(r))));Assert.Equal("23514",immutable.SqlState);
    }

    [Fact]
    public async Task Cash_credit_rebases_rounding_and_future_payment_uses_remaining_tax_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,qty:3,cost:0.05m);await Expect(await Pay(c,d,0.05m),HttpStatusCode.Created);Assert.Equal(0.01m,D((await GST(c,d)).GetProperty("attributedTax")));
        var r=await Expect(await Return(c,d,1),HttpStatusCode.Created);await Expect(await Credit(c,d,Rline(r),1),HttpStatusCode.Created);Assert.Equal(0,D((await GST(c,d)).GetProperty("attributedTax")));Assert.Equal(0.01m,D((await GST(c,d)).GetProperty("pendingPaymentTax")));await Expect(await Pay(c,d,0.06m),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));Assert.Equal(0.01m,D((await GST(c,d)).GetProperty("attributedTax")));
    }
    [Fact]
    public async Task Duplicate_return_and_credit_references_are_supplier_unique_across_sources()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var e=await SetupReturn(c,supplier:d.Supplier);var reference=Code();var r=await Expect(await Return(c,d,reference:reference.ToUpperInvariant()),HttpStatusCode.Created);await Expect(await Return(c,e,reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);var er=await Expect(await Return(c,e),HttpStatusCode.Created);reference=Code();await Expect(await Credit(c,d,Rline(r),reference:reference.ToUpperInvariant()),HttpStatusCode.Created);await Expect(await Credit(c,e,Rline(er),reference:" "+reference.ToLowerInvariant()+" "),HttpStatusCode.Conflict);Assert.Equal(22,await AP(c,d));
    }
    [Fact]
    public async Task Duplicate_incoming_refund_reference_is_unique_across_suppliers_and_staff()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var e=await SetupReturn(c);var p=await Prepay(c,d);var ep=await Prepay(c,e);var(sub,_)=await Staff(db,"FINANCE");using var f=api.Authenticated(sub);var reference=Code();var results=await Task.WhenAll(Refund(c,null,22,Aid(p),reference:reference.ToUpperInvariant()),Refund(f,null,22,Aid(ep),reference:" "+reference.ToLowerInvariant()+" "));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(22,await Available(c,d)+await Available(c,e));
    }
    [Fact]
    public async Task Purchase_return_and_sales_issue_share_balance_lock_and_preserve_cost()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c,false);var q=await Submitted(c,d.Sales.Draft(1));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new Htt.Host.Api.Sales.PickInput([new(line,1)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();
        var results=await Task.WhenAll(Return(c,d,1),Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new Htt.Host.Api.Sales.DispatchInput("PICKUP","Customer","Competing supplier return"),1));await Expect(results[0],HttpStatusCode.Created);await Expect(results[1],HttpStatusCode.OK);Assert.Equal((0m,0m),await Stock(d));Assert.Equal(10,await GRNI(c,d));
    }
    [Fact]
    public async Task Original_return_clearing_account_is_used_after_mapping_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var r=await Expect(await Return(c,d),HttpStatusCode.Created);
        await S("INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(@company,'1601','Replacement return clearing','ASSET');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1601') WHERE company_id=@company AND purpose='PURCHASE_RETURN_CLEARING'",("company",db.Company));
        try{var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);Assert.Equal(20,await Journal(Cid(credit),"1600","credit"));Assert.Equal(0,await Journal(Cid(credit),"1601","credit"));}
        finally{await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1600') WHERE company_id=@company AND purpose='PURCHASE_RETURN_CLEARING'",("company",db.Company));}
    }
    [Fact]
    public async Task Original_credit_tax_account_and_bank_must_remain_active_for_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d),HttpStatusCode.Created);var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);var key=Code();var reference=Code();
        foreach(var code in new[]{"1000","1300","1410"}){await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));try{await Expect(await Refund(c,Cline(credit),key:key,reference:reference),HttpStatusCode.UnprocessableEntity);Assert.Equal(2,D((await GST(c,d)).GetProperty("attributedTax")));}finally{await S("UPDATE accounting.accounts SET active=true WHERE company_id=@company AND code=@code",("company",db.Company),("code",code));}}
        await Expect(await Refund(c,Cline(credit),key:key,reference:reference),HttpStatusCode.Created);
    }
    [Fact]
    public async Task SQL_credit_command_checks_membership_permission_and_refund_validation_precedes_writes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);var(sub,_)=await Staff(db,"WAREHOUSE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,sub,default)).Single(x=>x.CompanyId==db.Company);await using(var s=new CompanySession(source)){await s.BeginAsync(db.Company,access.ActorId,"direct-credit",default);var denied=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"SELECT purchase.post_supplier_credit(@bill,'DIRECT','Reason','[]'::jsonb)",default,("bill",d.Bill!.Value)));Assert.Equal("42501",denied.SqlState);}
        var p=await Prepay(c,d);foreach(var input in new[]{new SupplierRefundInput(1,Code(),"Reason"),new SupplierRefundInput(1,Code(),"Reason",Guid.NewGuid(),Aid(p)),new SupplierRefundInput(0,Code(),"Reason",AdvanceId:Aid(p)),new SupplierRefundInput(1,Code(),"Reason",AdvanceId:Aid(p),ReceivedOn:d.Today.AddDays(1)),new SupplierRefundInput(1,Code(),"Reason",AdvanceId:Aid(p),ReceivedOn:d.Today.AddDays(-1))})await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",input),HttpStatusCode.UnprocessableEntity);Assert.Equal(22,await Available(c,d));
    }
    [Fact]
    public async Task Inactive_supplier_can_still_return_credit_and_recover_existing_paid_debt()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);await Expect(await Pay(c,d),HttpStatusCode.Created);await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@supplier",("company",db.Company),("supplier",d.Supplier));var r=await Expect(await Return(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,Rline(r)),HttpStatusCode.Created);await Expect(await Refund(c,Cline(credit)),HttpStatusCode.Created);Assert.Equal(0,await AP(c,d));
    }

    [Fact]
    public async Task Misconfigured_return_clearing_control_account_is_rejected_before_stock_commit()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupReturn(c);
        await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1100') WHERE company_id=@company AND purpose='PURCHASE_RETURN_CLEARING'",("company",db.Company));
        try{await Expect(await Return(c,d),HttpStatusCode.UnprocessableEntity);Assert.Equal((4.4m,20m),await Stock(d));Assert.Equal(22,await AP(c,d));}
        finally{await S("UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1600') WHERE company_id=@company AND purpose='PURCHASE_RETURN_CLEARING'",("company",db.Company));}
    }
}
