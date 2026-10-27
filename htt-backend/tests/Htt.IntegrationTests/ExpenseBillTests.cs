using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

// Every case owns a company so reconciliation includes only actual business postings.
public sealed class ExpenseBillTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params (string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Account,Guid Tax,DateOnly Today)
    {
        public ExpenseBillInput Bill()=>new(Supplier,Code(),Today,Today.AddDays(30),Today,[new(Account,"Operating expense",100,10,Tax)],"verified-tax-invoice",Today);
    }
    private async Task<Data> SetupExpense(HttpClient c,string basis="NON_CASH",bool registered=true)
    {
        await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=@registered WHERE id=@company",("company",db.Company),("basis",basis),("registered",registered));
        var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Independent expense supplier",null));
        var account=(Guid)(await S("INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(@company,'6060','Operating expenses','EXPENSE') RETURNING id",("company",db.Company)))!;
        var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;
        var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!,System.Globalization.CultureInfo.InvariantCulture);
        return new(supplier,account,tax,today);
    }
    private static Task<HttpResponseMessage> Post(HttpClient c,ExpenseBillInput b,string? key=null)=>Send(c,HttpMethod.Post,"/supplier-expense-bills",b,key:key);
    private static Guid Id(JsonElement b)=>b.GetProperty("bill").GetProperty("id").GetGuid();
    private static Guid Line(JsonElement b)=>b.GetProperty("lines")[0].GetProperty("id").GetGuid();
    private async Task<decimal> Journal(Guid id,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM purchase.bills b JOIN accounting.journal_lines l ON l.company_id=b.company_id AND l.journal_entry_id=b.journal_entry_id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.id=@id AND a.code=@code",("company",db.Company),("id",id),("code",code)));
    private static async Task Consistent(HttpClient c)
    {
        await FinancialReportAssertions.Check(c);
        var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());
    }
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,Guid line,decimal amount,string? key=null)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),Allocations:[new(line,amount)]),key:key);
    [Theory]
    [InlineData("NON_CASH","1300",10,0)]
    [InlineData("CASH","1410",0,10)]
    public async Task Independent_bill_posts_expense_AP_GST_without_procurement_or_inventory(string basis,string gstAccount,decimal attributed,decimal pending)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,basis);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);var id=Id(b);
        Assert.Equal("EXPENSE",b.GetProperty("bill").GetProperty("billType").GetString());Assert.Equal("POSTED",b.GetProperty("bill").GetProperty("state").GetString());Assert.StartsWith("SB-",b.GetProperty("bill").GetProperty("number").GetString());Assert.Equal(100,D(b.GetProperty("bill").GetProperty("expenseAmount")));
        Assert.Equal(JsonValueKind.Null,b.GetProperty("lines")[0].GetProperty("receiptLineId").ValueKind);Assert.Equal(JsonValueKind.Null,b.GetProperty("lines")[0].GetProperty("grniItemId").ValueKind);Assert.Equal(d.Account,b.GetProperty("lines")[0].GetProperty("expenseAccountId").GetGuid());
        Assert.Equal(100,await Journal(id,"6060","debit"));Assert.Equal(10,await Journal(id,gstAccount,"debit"));Assert.Equal(110,await Journal(id,"2000","credit"));Assert.Equal(0,await Journal(id,"2100","debit"));
        foreach(var table in new[]{"purchase.orders","purchase.receipts","accounting.grni_items","inventory.stock_balances","inventory.stock_movements"})Assert.Equal(0L,await S($"SELECT count(*) FROM {table} WHERE company_id=@company",("company",db.Company)));
        Assert.Equal(110,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(attributed,D(g.GetProperty("attributedTax")));Assert.Equal(pending,D(g.GetProperty("pendingPaymentTax")));
        Assert.Equal(id,Id(await Get(c,$"/supplier-bills/{id}")));Assert.Single((await Get(c,$"/supplier-bills?supplierId={d.Supplier}")).GetProperty("items").EnumerateArray());await Consistent(c);
    }
    [Theory]
    [InlineData("NON_CASH")]
    [InlineData("CASH")]
    public async Task Existing_partial_payments_release_AP_and_GST_once(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,basis);var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);
        var key=Code();await Expect(await Pay(c,d,Line(b),55,key),HttpStatusCode.Created);
        Assert.Equal(55,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));Assert.Equal(basis=="CASH"?5:10,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
        await Expect(await Pay(c,d,Line(b),55),HttpStatusCode.Created);Assert.Equal(0,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}");Assert.Equal(10,D(g.GetProperty("attributedTax")));Assert.Equal(0,D(g.GetProperty("pendingPaymentTax")));await Consistent(c);
        await Expect(await Pay(c,d,Line(b),1),HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData("NON_CASH")]
    [InlineData("CASH")]
    public async Task Existing_supplier_prepayment_can_be_applied_to_independent_expense(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,basis);
        var pre=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,Notes:"Expense deposit")),HttpStatusCode.Created);var advance=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();await Consistent(c);
        var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);var input=new SupplierAdvanceApplicationInput(Code(),[new(Line(b),110)]);var key=Code();var responses=await Task.WhenAll(Enumerable.Range(0,3).Select(_=>Send(c,HttpMethod.Post,$"/supplier-advances/{advance}/apply",input,key:key)));foreach(var r in responses)await Expect(r,HttpStatusCode.Created);
        Assert.Equal(0,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));Assert.Equal(0,D((await Get(c,$"/suppliers/{d.Supplier}/advances")).GetProperty("availableAmount")));Assert.Equal(10,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
    }
    [Theory]
    [InlineData(false,null)]
    [InlineData(true,false)]
    public async Task Nonrecoverable_GST_is_part_of_expense_without_claim(bool registered,bool? recoverable)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,registered:registered);var input=d.Bill() with{Lines=[new(d.Account,"Nonrecoverable",100,10,d.Tax,recoverable)],TaxInvoiceReference=null,TaxInvoiceHeldOn=null};var b=await Expect(await Post(c,input),HttpStatusCode.Created);
        Assert.Equal(110,await Journal(Id(b),"6060","debit"));Assert.Equal(0,await Journal(Id(b),"1300","debit"));await Expect(await Pay(c,d,Line(b),110),HttpStatusCode.Created);Assert.Equal(0,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
    }
    [Fact]
    public async Task Mixed_lines_allow_GST_free_and_nonrecoverable_expenses_and_freeze_descriptions()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var free=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='FRE'",("company",db.Company)))!;
        var b=await Expect(await Post(c,d.Bill() with{Lines=[new(d.Account," GST expense ",100,10,d.Tax),new(d.Account,"GST free",20,0,free),new(d.Account,"Private use",30,3,d.Tax,false)]}),HttpStatusCode.Created);
        Assert.Equal(153,await Journal(Id(b),"6060","debit"));Assert.Equal(10,await Journal(Id(b),"1300","debit"));Assert.Equal(163,await Journal(Id(b),"2000","credit"));Assert.Contains(b.GetProperty("lines").EnumerateArray(),x=>x.GetProperty("description").GetString()=="GST expense");await Consistent(c);
    }
    [Fact]
    public async Task Zero_value_bill_retains_trace_without_empty_journal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var b=await Expect(await Post(c,d.Bill() with{Lines=[new(d.Account,"Free expense",0,0,d.Tax)],TaxInvoiceReference=null,TaxInvoiceHeldOn=null}),HttpStatusCode.Created);Assert.Equal(JsonValueKind.Null,b.GetProperty("bill").GetProperty("journalEntryId").ValueKind);await Consistent(c);
    }
    [Theory]
    [InlineData("missing_net")][InlineData("missing_tax")][InlineData("negative")][InlineData("precision")][InlineData("wrong_tax")][InlineData("blank_description")][InlineData("missing_evidence")][InlineData("future")][InlineData("due")][InlineData("held")][InlineData("no_lines")][InlineData("too_many")][InlineData("foreign_account")][InlineData("foreign_tax")][InlineData("asset")][InlineData("inactive_account")][InlineData("inactive_supplier")][InlineData("closed_period")][InlineData("unregistered_recovery")]
    public async Task Invalid_input_rolls_back_bill_journal_AP_and_number(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var b=d.Bill();var l=b.Lines[0];
        b=scenario switch{
            "missing_net"=>b with{Lines=[l with{Net=null}]},"missing_tax"=>b with{Lines=[l with{Tax=null}]},"negative"=>b with{Lines=[l with{Net=-1}]},"precision"=>b with{Lines=[l with{Net=1.001m}]},"wrong_tax"=>b with{Lines=[l with{Tax=9}]},"blank_description"=>b with{Lines=[l with{Description=" "}]},"missing_evidence"=>b with{TaxInvoiceReference=null,TaxInvoiceHeldOn=null},"future"=>b with{PostingDate=d.Today.AddDays(1)},"due"=>b with{DueOn=d.Today.AddDays(-1)},"held"=>b with{TaxInvoiceHeldOn=d.Today.AddDays(1)},"no_lines"=>b with{Lines=[]},"too_many"=>b with{Lines=Enumerable.Repeat(l,51).ToArray()},"foreign_account"=>b with{Lines=[l with{ExpenseAccountId=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5000'",("company",db.OtherCompany)))!}]},"foreign_tax"=>b with{Lines=[l with{TaxCodeId=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.OtherCompany)))!}]},"asset"=>b with{Lines=[l with{ExpenseAccountId=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1300'",("company",db.Company)))!}]},_=>b};
        if(scenario=="inactive_account")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Account));
        if(scenario=="inactive_supplier")await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Supplier));
        if(scenario=="closed_period")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));
        if(scenario=="unregistered_recovery"){await S("UPDATE core.companies SET gst_registered=false WHERE id=@company",("company",db.Company));b=b with{Lines=[l with{RecoverableGst=true}]};}
        var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company));
        var r=await Post(c,b);Assert.True(r.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity,await r.Content.ReadAsStringAsync());Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company)));
        foreach(var table in new[]{"purchase.bills","accounting.ap_items","accounting.journal_entries","accounting.purchase_gst_entries"})Assert.Equal(0L,await S($"SELECT count(*) FROM {table} WHERE company_id=@company",("company",db.Company)));
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_post_independent_expenses(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,role);using var restricted=api.Authenticated(staff.Subject);await Expect(await Post(restricted,d.Bill()),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Finance_can_post_but_read_or_post_revocation_blocks_cached_replay()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var input=d.Bill();var key=Code();await Expect(await Post(f,input,key),HttpStatusCode.Created);
        await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.bills.read' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Post(f,input,key),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Anonymous_portal_and_cross_company_supplier_cannot_post()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");Assert.Equal(HttpStatusCode.Unauthorized,(await Post(anon,d.Bill())).StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await Post(portal,d.Bill())).StatusCode);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await Post(other,d.Bill()),HttpStatusCode.NotFound);
    }
    [Fact]
    public async Task Concurrent_same_key_is_one_bill_journal_AP_and_audit_and_changed_body_conflicts()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var b=d.Bill();var key=Code();var all=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Post(c,b,key)));var ids=new List<Guid>();foreach(var r in all)ids.Add(Id(await Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action='purchase.bill_posted'",("company",db.Company),("id",ids[0])));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.ap_items WHERE company_id=@company",("company",db.Company)));await Expect(await Post(c,b with{Notes="Changed"},key),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Different_keys_and_actors_cannot_duplicate_supplier_invoice_normalized_number()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var b=d.Bill();var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company));var results=await Task.WhenAll(Post(c,b),Post(f,b with{SupplierInvoice=" "+b.SupplierInvoice.ToLowerInvariant()+" "}));Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Created);Assert.Single(results,r=>r.StatusCode==HttpStatusCode.Conflict);Assert.Equal(Convert.ToInt64(seq)+1,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company)));await Consistent(c);
    }
    [Fact]
    public async Task Concurrent_payments_cannot_overallocate_expense_AP()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,"CASH");var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);var r=await Task.WhenAll(Pay(c,d,Line(b),110),Pay(c,d,Line(b),110));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);Assert.Equal(10,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
    }
    [Fact]
    public async Task Payment_and_advance_application_compete_for_one_AP_balance()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,"CASH");var pre=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,Notes:"Expense deposit")),HttpStatusCode.Created);var advance=pre.GetProperty("advances")[0].GetProperty("id").GetGuid();var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);
        var r=await Task.WhenAll(Pay(c,d,Line(b),110),Send(c,HttpMethod.Post,$"/supplier-advances/{advance}/apply",new SupplierAdvanceApplicationInput(Code(),[new(Line(b),110)])));Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(r,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Cash_GST_partial_payment_rounding_releases_the_last_cent()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,"CASH");var b=await Expect(await Post(c,d.Bill() with{Lines=[new(d.Account,"Rounding",0.05m,0.01m,d.Tax)]}),HttpStatusCode.Created);for(int i=0;i<3;i++)await Expect(await Pay(c,d,Line(b),0.02m),HttpStatusCode.Created);Assert.Equal(0.01m,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));await Consistent(c);
    }
    [Fact]
    public async Task Database_command_enforces_permission_and_tables_are_append_only()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,"WAREHOUSE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);await using(var session=new CompanySession(source)){await session.BeginAsync(db.Company,access.ActorId,"denied-expense",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT purchase.post_expense_bill(@supplier,'DIRECT',current_date,current_date,current_date,NULL,NULL,'','[]'::jsonb)",default,("supplier",d.Supplier)));Assert.Equal("42501",e.SqlState);}
        var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);foreach(var verb in new[]{"UPDATE purchase.bills SET notes='changed'","DELETE FROM purchase.bills"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,verb+" WHERE company_id=@company AND id=@id RETURNING id",default,("company",db.Company),("id",Id(b))));Assert.Contains(e.SqlState,new[]{"42501","23514"});}
    }

    [Fact]
    public async Task Late_audit_failure_rolls_back_every_posting_and_allows_same_key_retry()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var input=d.Bill();var key=Code();var seq=await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company));
        await S("CREATE FUNCTION public.fail_expense_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='purchase.bill_posted' THEN RAISE EXCEPTION 'Injected expense audit failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_expense_audit BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_expense_audit()");
        try{await Expect(await Post(c,input,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(seq,await S("SELECT next_value FROM platform.document_sequences WHERE company_id=@company AND document_type='SUPPLIER_BILL'",("company",db.Company)));foreach(var table in new[]{"purchase.bills","purchase.bill_lines","accounting.ap_items","accounting.journal_entries","accounting.purchase_gst_entries"})Assert.Equal(0L,await S($"SELECT count(*) FROM {table} WHERE company_id=@company",("company",db.Company)));}
        finally{await S("DROP TRIGGER test_expense_audit ON platform.audit_events;DROP FUNCTION public.fail_expense_audit()");}
        await Expect(await Post(c,input,key),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Existing_receipt_post_permission_does_not_grant_expense_post_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);
        await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.expense_bills.post' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Post(f,d.Bill()),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Expense_permission_is_independent_of_procurement_bill_post_permission()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);
        await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='purchase.bills.post' AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company));await Expect(await Post(f,d.Bill()),HttpStatusCode.Created);
    }
    [Fact]
    public async Task Concurrent_distinct_invoices_get_distinct_shared_numbers_and_exact_AP()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var r=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Post(c,d.Bill())));var numbers=new List<string>();foreach(var x in r)numbers.Add((await Expect(x,HttpStatusCode.Created)).GetProperty("bill").GetProperty("number").GetString()!);Assert.Equal(4,numbers.Distinct().Count());Assert.Equal(440,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));await Consistent(c);
    }
    [Fact]
    public async Task Replay_remains_identical_after_supplier_is_deactivated()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var b=d.Bill();var key=Code();var first=await Expect(await Post(c,b,key),HttpStatusCode.Created);await S("UPDATE crm.suppliers SET status='INACTIVE' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Supplier));var replay=await Expect(await Post(c,b,key),HttpStatusCode.Created);Assert.Equal(Id(first),Id(replay));await Expect(await Post(c,d.Bill()),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task Noncash_GST_uses_evidence_date_in_date_filtered_reports()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);await Expect(await Post(c,d.Bill() with{InvoiceDate=d.Today.AddDays(-3),TaxInvoiceHeldOn=d.Today.AddDays(-1)}),HttpStatusCode.Created);var g=await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from={d.Today.AddDays(-1):yyyy-MM-dd}&to={d.Today.AddDays(-1):yyyy-MM-dd}");Assert.Equal(10,D(g.GetProperty("attributedTax")));Assert.Equal(0,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}&from={d.Today:yyyy-MM-dd}")).GetProperty("attributedTax")));
    }
    private async Task<(Guid ReceiptLine,Guid BillLine)> MatchedService(HttpClient c,Data d,string? invoice=null)
    {
        var sales=await Setup(db,c,0);var product=await Get(c,$"/products/{sales.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{sales.Product}",new ProductMaintenance(product.GetProperty("sku").GetString()!,"Procured service",product.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
        var draft=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(d.Supplier,sales.Warehouse,[new(sales.BoxUnit,2,10)])),HttpStatusCode.Created);var id=draft.GetProperty("order").GetProperty("id").GetGuid();var po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{id}/confirm",version:1),HttpStatusCode.OK);var receipt=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{id}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)]),po.GetProperty("order").GetProperty("version").GetInt64()),HttpStatusCode.Created);var line=receipt.GetProperty("lines")[0].GetProperty("id").GetGuid();var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(d.Supplier,invoice??Code(),d.Today,d.Today.AddDays(30),d.Today,[new(line,2,20,2)],"Verified receipt invoice",d.Today)),HttpStatusCode.Created);Assert.Equal("RECEIPT",b.GetProperty("bill").GetProperty("billType").GetString());return(line,Line(b));
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task One_payment_or_advance_can_settle_both_matched_and_independent_bills(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,basis);var matched=await MatchedService(c,d);var expense=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);await Consistent(c);SupplierPaymentAllocation[] allocations=[new(matched.BillLine,22),new(Line(expense),110)];
        if(advance){var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(132,"BANK_TRANSFER",Code(),132,Notes:"Expense deposit")),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{p.GetProperty("advances")[0].GetProperty("id").GetGuid()}/apply",new SupplierAdvanceApplicationInput(Code(),allocations)),HttpStatusCode.Created);}
        else await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(132,"BANK_TRANSFER",Code(),Allocations:allocations)),HttpStatusCode.Created);
        Assert.Equal(0,D((await Get(c,$"/accounting/ap?supplierId={d.Supplier}")).GetProperty("outstandingAmount")));Assert.Equal(12,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));Assert.Equal(0,D((await Get(c,$"/accounting/grni?supplierId={d.Supplier}")).GetProperty("accruedAmount")));await Consistent(c);
    }
    [Fact]
    public async Task Supplier_invoice_uniqueness_spans_receipt_and_expense_bills_but_not_other_suppliers()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);var input=d.Bill();await MatchedService(c,d,input.SupplierInvoice);await Expect(await Post(c,input),HttpStatusCode.Conflict);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Other supplier",null));await Expect(await Post(c,input with{SupplierId=supplier}),HttpStatusCode.Created);await Consistent(c);
    }

    [Fact]
    public async Task Cash_prepayment_GST_waits_for_tax_invoice_evidence_date()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,"CASH");var pre=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),110,PaidOn:d.Today.AddDays(-3),Notes:"Expense deposit")),HttpStatusCode.Created);var b=await Expect(await Post(c,d.Bill() with{InvoiceDate=d.Today.AddDays(-4),TaxInvoiceHeldOn=d.Today.AddDays(-1)}),HttpStatusCode.Created);
        await Expect(await Send(c,HttpMethod.Post,$"/supplier-advances/{pre.GetProperty("advances")[0].GetProperty("id").GetGuid()}/apply",new SupplierAdvanceApplicationInput(Code(),[new(Line(b),110)])),HttpStatusCode.Created);var rows=(await Get(c,$"/accounting/purchase-gst-attributions?supplierId={d.Supplier}")).GetProperty("items");Assert.Single(rows.EnumerateArray());Assert.Equal(d.Today.AddDays(-1).ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture),rows[0].GetProperty("attributionDate").GetString());await Consistent(c);
    }
    [Fact]
    public async Task Payment_uses_original_GST_AP_accounts_after_mapping_and_expense_name_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c,"CASH");var b=await Expect(await Post(c,d.Bill()),HttpStatusCode.Created);
        await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'2010','New AP','LIABILITY','AP'),(@company,'1310','New input','ASSET','GST');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP';UPDATE accounting.tax_account_mappings SET input_account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1310') WHERE company_id=@company;UPDATE accounting.accounts SET name='Renamed expense' WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Account));
        await Expect(await Pay(c,d,Line(b),110),HttpStatusCode.Created);Assert.Equal(10,D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax")));Assert.Equal(0m,await S("SELECT coalesce(sum(l.debit),0) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=@company AND a.code IN('2010','1310')",("company",db.Company)));await Consistent(c);
    }
    [Fact]
    public async Task Supplier_invoice_date_selects_effective_tax_rate_and_frozen_bill_keeps_it()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupExpense(c);await S("UPDATE accounting.tax_rates SET effective_to=@date WHERE company_id=@company AND tax_code_id=@tax;INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES(@company,@tax,0.20,@date)",("company",db.Company),("tax",d.Tax),("date",d.Today));
        var b=await Expect(await Post(c,d.Bill() with{InvoiceDate=d.Today.AddDays(-1)}),HttpStatusCode.Created);Assert.Equal(10,await Journal(Id(b),"1300","debit"));await Expect(await Post(c,d.Bill()),HttpStatusCode.UnprocessableEntity);await Consistent(c);
    }
}
