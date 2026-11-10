using System.Net;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.Inventory;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Htt.Host.Api.Accounting;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class ReconciliationTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    private Task<object?> S(string sql, params (string,object)[] args) => db.OwnerScalarAsync(sql,args);
    private static Task<Guid> AcceptanceBank(HttpClient c)=>Create(c,"/bank-accounts",new BankAccountInput(Code(),"Acceptance cash account","CASH"));
    private static async Task<JsonElement> Consistent(HttpClient c)
    {
        await FinancialReportAssertions.Check(c);
        var report=await Expect(await c.GetAsync("/api/v1/accounting/reconciliation"),HttpStatusCode.OK);
        Assert.True(report.GetProperty("status").GetString()=="CONSISTENT",report.GetRawText());
        Assert.All(report.GetProperty("checks").EnumerateArray(),check=>Assert.Equal(0,check.GetProperty("mismatchCount").GetInt32()));
        return report;
    }
    private async Task<SalesData> Stock(HttpClient c,decimal quantity=22,decimal value=100)
    {
        var d=await Setup(db,c,quantity);
        await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,value,Code(),DatabaseFixture.Issuer,db.Subject);
        return d;
    }
    [Fact]
    public async Task New_company_reports_exact_zero_controls_and_no_mutations()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated(company:db.OtherCompany);
        var before=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.OtherCompany));
        var r=await Consistent(c);Assert.Equal(db.OtherCompany,r.GetProperty("companyId").GetGuid());
        var checks=r.GetProperty("checks").EnumerateArray().ToArray();Assert.Contains(checks,x=>x.GetProperty("code").GetString()=="gl.inventory");
        Assert.All(checks,x=>Assert.Equal(0,D(x.GetProperty("difference"))));
        await Consistent(c);Assert.Equal(before,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.OtherCompany)));
    }
    [Theory]
    [InlineData("CASH")]
    [InlineData("NON_CASH")]
    public async Task Sales_advance_dispatch_invoice_return_credit_and_refund_reconcile_after_each_step(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();
        await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));
        var d=await Stock(c);await Consistent(c);var receiptBank=await AcceptanceBank(c);var refundBank=await AcceptanceBank(c);
        var q=await Submitted(c,d.Draft(2));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var line=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();await Consistent(c);
        var receipt=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(24.2m,"BANK_TRANSFER",Code(),[],[new(line,24.2m)],BankAccountId:receiptBank)),HttpStatusCode.Created);
        var advance=receipt.GetProperty("advances")[0].GetProperty("id").GetGuid();await Consistent(c);
        var pick=(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new PickInput([new(line,2)]),1),HttpStatusCode.Created)).GetProperty("id").GetGuid();await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Customer",Code()),1),HttpStatusCode.OK);await Consistent(c);
        var version=(await Get(c,$"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64();
        var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/invoices",new InvoiceInput([new(line,2)],"Delivered"),version),HttpStatusCode.Created);
        var iid=invoice.GetProperty("id").GetGuid();var il=invoice.GetProperty("lines")[0].GetProperty("id").GetGuid();await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/customer-advances/{advance}/apply",new AdvanceApplicationInput(Code(),[new(il,24.2m)])),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(24.2m,"BANK_TRANSFER",Code(),[new(il,24.2m)],[],BankAccountId:receiptBank)),HttpStatusCode.Created);await Consistent(c);
        var movement=(await Get(c,$"/warehouse/orders/{order}/returnable")).GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid();
        var ret=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/returns",new SalesReturnInput(d.Warehouse,"RESTOCK","Accepted return",[new(movement,1,il)])),HttpStatusCode.Created);await Consistent(c);
        var credit=await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{iid}/credit-notes",new CreditNoteInput("Returned",[new(il,1,ret.GetProperty("lines")[0].GetProperty("id").GetGuid())])),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/refunds",new CustomerRefundInput(24.2m,Code(),"Verified refund",credit.GetProperty("lines")[0].GetProperty("id").GetGuid(),BankAccountId:refundBank)),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",true)]
    [InlineData("NON_CASH",true)]
    [InlineData("CASH",false)]
    public async Task Purchase_partial_match_prepay_return_credit_and_refund_reconcile(string basis,bool registered)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();
        await S("UPDATE core.companies SET gst_registered=@registered,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis),("registered",registered));
        var paymentBank=await AcceptanceBank(c);var refundBank=await AcceptanceBank(c);var d=await Setup(db,c,0);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Acceptance supplier",null));
        var prepay=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(22,"BANK_TRANSFER",Code(),22,Notes:"Deposit",BankAccountId:paymentBank)),HttpStatusCode.Created);await Consistent(c);
        var advance=prepay.GetProperty("advances")[0].GetProperty("id").GetGuid();
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(supplier,d.Warehouse,[new(d.BoxUnit,4,10)])),HttpStatusCode.Created);
        var oid=po.GetProperty("order").GetProperty("id").GetGuid();po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);
        var r=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),4)]),2),HttpStatusCode.Created);await Consistent(c);
        var rid=r.GetProperty("receipt").GetProperty("id").GetGuid();var rl=r.GetProperty("lines")[0].GetProperty("id").GetGuid();
        var today=DateOnly.Parse(r.GetProperty("receipt").GetProperty("businessDate").GetString()!);
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(supplier,Code(),today,today.AddDays(30),today,[new(rl,2,20,2)],registered?"Original invoice":null,registered?today:null)),HttpStatusCode.Created);await Consistent(c);
        var bid=b.GetProperty("bill").GetProperty("id").GetGuid();var bl=b.GetProperty("lines")[0].GetProperty("id").GetGuid();
        await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{advance}/apply",new SupplierAdvanceApplicationInput(Code(),[new(bl,11)])),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(11,"BANK_TRANSFER",Code(),Allocations:[new(bl,11)],BankAccountId:paymentBank)),HttpStatusCode.Created);await Consistent(c);
        var ret=await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{rid}/returns",new PurchaseReturnInput(Code(),"Accepted supplier return",[new(rl,1,bl)])),HttpStatusCode.Created);await Consistent(c);
        var credit=await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{bid}/credits",new SupplierCreditInput(Code(),"Adjustment note",[new(ret.GetProperty("lines")[0].GetProperty("id").GetGuid(),1)])),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(11,Code(),"Bank receipt verified",credit.GetProperty("lines")[0].GetProperty("id").GetGuid(),BankAccountId:refundBank)),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{rid}/returns",new PurchaseReturnInput(Code(),"Unbilled goods returned",[new(rl,1)])),HttpStatusCode.Created);await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(11,Code(),"Unused deposit refunded",AdvanceId:advance,BankAccountId:refundBank)),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Inventory_transfers_counts_and_transit_partial_arrivals_losses_and_returns_reconcile()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Stock(c,10,0.07m);
        var dest=await Create(c,"/warehouses",new WarehouseMaintenance(Code(),"Destination"));await Consistent(c);
        await Expect(await Send(c,HttpMethod.Post,"/inventory/transfers",new StockTransferInput(d.Warehouse,dest,Code(),"Handover",[new(d.Product,2)])),HttpStatusCode.Created);await Consistent(c);
        var transit=await Expect(await Send(c,HttpMethod.Post,"/inventory/transit-transfers",new TransitDispatchInput(d.Warehouse,dest,Code(),"Shipment",[new(d.Product,6)])),HttpStatusCode.Created);await Consistent(c);
        var tid=transit.GetProperty("transfer").GetProperty("id").GetGuid();var tl=transit.GetProperty("lines")[0].GetProperty("id").GetGuid();
        foreach(var (path,qty) in new[]{("receipts",2m),("returns",1m),("shortages",3m)})
        {await Expect(await Send(c,HttpMethod.Post,$"/inventory/transit-transfers/{tid}/{path}",new TransitEventInput(Code(),"Actual movement confirmed",[new(tl,qty)])),HttpStatusCode.Created);await Consistent(c);}
        await Expect(await Send(c,HttpMethod.Post,"/inventory/write-offs",new StockWriteOffInput(dest,Code(),"Damaged",[new(d.Product,1)])),HttpStatusCode.Created);await Consistent(c);
        var count=await Expect(await Send(c,HttpMethod.Post,"/inventory/stock-counts",new StockCountInput(dest,Code(),"Count evidence",[d.Product])),HttpStatusCode.Created);
        var id=count.GetProperty("count").GetProperty("id").GetGuid();
        await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/submit",new StockCountSubmission([new(d.Product,4)]),1),HttpStatusCode.OK);
        await Expect(await Send(c,HttpMethod.Post,$"/inventory/stock-counts/{id}/post",version:2),HttpStatusCode.OK);await Consistent(c);
    }
    [Theory]
    [InlineData("SALES")]
    [InlineData("OFFICE")]
    [InlineData("WAREHOUSE")]
    [InlineData("PROCUREMENT")]
    public async Task Nonfinancial_staff_cannot_read_company_financial_reconciliation(string role)
    {
        var staff=await Staff(db,role);await using var api=new TestApi(db);using var c=api.Authenticated(staff.Subject);
        Assert.Equal(HttpStatusCode.Forbidden,(await c.GetAsync("/api/v1/accounting/reconciliation")).StatusCode);
    }
    [Fact]
    public async Task Finance_can_read_and_company_scope_excludes_other_company_discrepancies()
    {
        var staff=await Staff(db,"FINANCE");await using var api=new TestApi(db);using var c=api.Authenticated(staff.Subject);await Consistent(c);
        using var forbidden=api.Authenticated(staff.Subject,company:db.OtherCompany);
        Assert.Equal(HttpStatusCode.Forbidden,(await forbidden.GetAsync("/api/v1/accounting/reconciliation")).StatusCode);
        using var anonymous=api.CreateClient();Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/v1/accounting/reconciliation")).StatusCode);
    }
    [Theory]
    [InlineData("stock.quantity","UPDATE inventory.stock_balances SET on_hand=on_hand+1 WHERE company_id=@company AND product_id=@product")]
    [InlineData("stock.value","UPDATE inventory.stock_values v SET value=value+1 FROM inventory.stock_balances b WHERE b.company_id=@company AND b.product_id=@product AND v.company_id=b.company_id AND v.stock_balance_id=b.id")]
    [InlineData("stock.reserved","UPDATE inventory.stock_balances SET reserved=reserved+1 WHERE company_id=@company AND product_id=@product")]
    [InlineData("credit.receivable","UPDATE crm.customer_credit_exposures SET receivable=receivable+1 WHERE company_id=@company AND customer_id=@customer")]
    [InlineData("credit.unbilled","UPDATE crm.customer_credit_exposures SET unbilled_orders=unbilled_orders+1 WHERE company_id=@company AND customer_id=@customer")]
    [InlineData("credit.advances","UPDATE crm.customer_credit_exposures SET available_advances=available_advances+1 WHERE company_id=@company AND customer_id=@customer")]
    public async Task Projection_drift_is_detected_without_modifying_ledgers(string check,string mutation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Stock(c);await Consistent(c);
        await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();
        await using var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true),set_config('htt.actor_id',@actor::text,true)",con,tx);
        cmd.Parameters.AddWithValue("company",db.Company);cmd.Parameters.AddWithValue("actor",db.Actor);cmd.Parameters.AddWithValue("product",d.Product);cmd.Parameters.AddWithValue("customer",d.Customer);await cmd.ExecuteNonQueryAsync();
        cmd.CommandText=mutation;await cmd.ExecuteNonQueryAsync();
        cmd.CommandText="SELECT count(*) FROM accounting.reconciliation_checks() WHERE check_code=@check AND expected<>actual";cmd.Parameters.AddWithValue("check",check);Assert.Equal(1L,await cmd.ExecuteScalarAsync());
        await tx.RollbackAsync();await Consistent(c);
    }
    [Fact]
    public async Task Missing_valuation_is_reported_even_if_zero_value_GL_would_balance()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,1);
        try {var r=await Get(c,"/accounting/reconciliation");Assert.Equal("MISMATCH",r.GetProperty("status").GetString());Assert.Contains(r.GetProperty("checks").EnumerateArray(),x=>x.GetProperty("code").GetString()=="stock.valuation_missing" && x.GetProperty("mismatchCount").GetInt32()>0);}
        finally{await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,0,Code(),DatabaseFixture.Issuer,db.Subject);}
        await Consistent(c);
    }
    [Fact]
    public async Task Opposite_customer_differences_do_not_cancel_and_diagnostics_are_bounded()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var ids=new List<Guid>();
        for(var i=0;i<22;i++)ids.Add(await Create(c,"/customers",new CustomerDraft(Code(),"Offset detection",null)));
        try
        {
            for(var i=0;i<ids.Count;i++)await S("UPDATE crm.customer_credit_exposures SET receivable=@amount WHERE company_id=@company AND customer_id=@customer",("company",db.Company),("customer",ids[i]),("amount",i<11?1m:-1m));
            var report=await Get(c,"/accounting/reconciliation");Assert.Equal("MISMATCH",report.GetProperty("status").GetString());
            var check=report.GetProperty("checks").EnumerateArray().Single(x=>x.GetProperty("code").GetString()=="credit.receivable");
            Assert.Equal(0,D(check.GetProperty("difference")));Assert.Equal(22,check.GetProperty("mismatchCount").GetInt32());
            Assert.True(check.GetProperty("issuesTruncated").GetBoolean());Assert.Equal(20,check.GetProperty("issues").GetArrayLength());
            Assert.All(check.GetProperty("issues").EnumerateArray(),issue=>Assert.Contains(issue.GetProperty("entityId").GetGuid(),ids));
            using var other=api.Authenticated(company:db.OtherCompany);await Consistent(other);
        }
        finally {foreach(var id in ids)await S("UPDATE crm.customer_credit_exposures SET receivable=0 WHERE company_id=@company AND customer_id=@customer",("company",db.Company),("customer",id));}
        await Consistent(c);
    }
    [Fact]
    public async Task Read_observes_committed_state_without_blocking_in_progress_stock_posting()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Stock(c,10,100);var before=await Consistent(c);
        await using var s=await db.SessionAsync();
        await Sql.RowsAsync(s,"SELECT inventory.post_control('WRITE_OFF',@warehouse,NULL,@reference,'Verified disposal',jsonb_build_array(jsonb_build_object('productId',@product,'quantity',1)))",default,("warehouse",d.Warehouse),("product",d.Product),("reference",Code()));
        var pending=await Consistent(c);
        static decimal Inventory(JsonElement r)=>D(r.GetProperty("checks").EnumerateArray().Single(x=>x.GetProperty("code").GetString()=="gl.inventory").GetProperty("actual"));
        Assert.Equal(Inventory(before),Inventory(pending));
        await s.Transaction.CommitAsync();var after=await Consistent(c);Assert.Equal(Inventory(before)-10,Inventory(after));
    }
    [Fact]
    public async Task Restricted_database_call_also_checks_financial_permission()
    {
        var staff=await Staff(db,"SALES");var actor=(Guid)(await S("SELECT user_id FROM identity.memberships WHERE company_id=@company AND id=@membership",("company",db.Company),("membership",staff.Membership)))!;
        await using var source=NpgsqlDataSource.Create(db.App);await using var s=new CompanySession(source);await s.BeginAsync(db.Company,actor,"denied-reconciliation",default);
        var error=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"SELECT * FROM accounting.reconciliation_checks()",default));Assert.Equal("42501",error.SqlState);
    }
    [Theory]
    [InlineData("1100","gl.receivable")]
    [InlineData("2000","gl.payable")]
    [InlineData("2100","gl.grni")]
    [InlineData("1200","gl.inventory")]
    [InlineData("1250","gl.transit")]
    [InlineData("2300","gl.customer_advances")]
    [InlineData("1500","gl.supplier_advances")]
    [InlineData("1600","gl.purchase_return_clearing")]
    public async Task Balanced_but_unsourced_control_postings_cannot_pass_reconciliation(string account,string check)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c,0);
        await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();
        await using var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true),set_config('htt.actor_id',@actor::text,true)",con,tx);
        cmd.Parameters.AddWithValue("company",db.Company);cmd.Parameters.AddWithValue("actor",db.Actor);cmd.Parameters.AddWithValue("account",account);cmd.Parameters.AddWithValue("customer",d.Customer);cmd.Parameters.AddWithValue("doc",Guid.NewGuid());await cmd.ExecuteNonQueryAsync();
        cmd.CommandText="""
            INSERT INTO platform.documents(id,company_id,document_type,business_date,state,created_by)
              VALUES(@doc,@company,'TEST_CONTROL',current_date,'CONFIRMED',@actor);
            SELECT accounting.post_journal(@doc,1,'TEST_CONTROL',current_date,'Balanced fault injection',jsonb_build_array(
              jsonb_build_object('accountId',ac.id,'partyId',c.party_id,'debit',1),
              jsonb_build_object('accountId',bank.id,'credit',1)))
            FROM accounting.accounts ac JOIN accounting.accounts bank ON bank.company_id=ac.company_id AND bank.code='1000'
            JOIN crm.customers c ON c.company_id=ac.company_id AND c.id=@customer WHERE ac.company_id=@company AND ac.code=@account
            """;await cmd.ExecuteNonQueryAsync();
        cmd.Parameters.AddWithValue("check",check);cmd.CommandText="SELECT count(*) FROM accounting.reconciliation_checks() WHERE check_code=@check AND expected<>actual";
        Assert.True((long)(await cmd.ExecuteScalarAsync())!>0);
        cmd.CommandText="SELECT count(*) FROM accounting.reconciliation_checks() WHERE check_code='journal.balance' AND expected<>actual";Assert.Equal(0L,await cmd.ExecuteScalarAsync());
        await tx.RollbackAsync();await Consistent(c);
    }
    [Theory]
    [InlineData("warehouse")]
    [InlineData("product")]
    [InlineData("sell-disabled")]
    public async Task Unavailable_stock_is_never_advertised_as_sellable(string disabled)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Stock(c,10,100);
        var sql=disabled switch
        {
            "warehouse"=>"UPDATE catalog.warehouses SET active=false WHERE company_id=@company AND id=@id",
            "product"=>"UPDATE catalog.products SET status='INACTIVE' WHERE company_id=@company AND id=@id",
            _=>"UPDATE catalog.products SET sell_enabled=false WHERE company_id=@company AND id=@id"
        };
        await S(sql,("company",db.Company),("id",disabled=="warehouse"?d.Warehouse:d.Product));
        var r=await Get(c,$"/inventory/availability?warehouseId={d.Warehouse}&productId={d.Product}");
        Assert.Equal(10,D(r.GetProperty("items")[0].GetProperty("onHand")));Assert.Equal(0,D(r.GetProperty("items")[0].GetProperty("available")));await Consistent(c);
    }
}
