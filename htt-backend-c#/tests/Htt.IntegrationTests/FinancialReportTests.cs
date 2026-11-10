using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class FinancialReportTests:IAsyncLifetime
{
 private readonly DatabaseFixture db=new();public Task InitializeAsync()=>db.InitializeAsync();public Task DisposeAsync()=>db.DisposeAsync();
 private Task<object?> S(string sql,params(string,object)[]args)=>db.OwnerScalarAsync(sql,args);
 private async Task<DateOnly> Today()=>DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!);
 private static decimal T(JsonElement e,string field)=>D(e.GetProperty("totals").GetProperty(field));
 private async Task<JsonElement> Aging(HttpClient c,string side,DateOnly? date=null,string suffix="")=>await Get(c,$"/accounting/reports/{side}-aging?asOf={date??await Today():yyyy-MM-dd}{suffix}");
 private async Task<JsonElement> Profit(HttpClient c,DateOnly? from=null,DateOnly? to=null)=>await Get(c,$"/accounting/reports/profit-and-loss?from={from??await Today():yyyy-MM-dd}&to={to??(await Today()).AddDays(1):yyyy-MM-dd}");
 private async Task<JsonElement> Balance(HttpClient c,DateOnly? date=null)=>await Get(c,$"/accounting/reports/balance-sheet?asOf={date??await Today():yyyy-MM-dd}");
 private async Task<(SalesData Data,Guid Invoice,Guid Line,Guid OrderLine)> Invoice(HttpClient c,string basis="NON_CASH")
 {
  await CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,basis,DatabaseFixture.Issuer,db.Subject);var d=await Setup(db,c,0);var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Report service",p.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);
  var q=await Submitted(c,d.Draft(1)with{Lines=[new(d.BoxUnit,Quantity:1,UnitPrice:100)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var ol=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var v=(await Get(c,$"/sales-orders/{o}/invoiceable")).GetProperty("version").GetInt64();var i=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(ol,1)],"Service completed"),v),HttpStatusCode.Created);return(d,i.GetProperty("id").GetGuid(),i.GetProperty("lines")[0].GetProperty("id").GetGuid(),ol);
 }
 private async Task<(Guid Supplier,Guid Bill,Guid Line,Guid Expense)> Bill(HttpClient c,DateOnly? date=null,DateOnly? due=null)
 {
  await CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,"NON_CASH",DatabaseFixture.Issuer,db.Subject);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Report supplier",null));var account=(Guid)(await S("INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(@company,@code,'Report expense','EXPENSE') RETURNING id",("company",db.Company),("code",Code())))!;var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;var dt=date??await Today();var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(supplier,Code(),dt,due??dt.AddDays(30),dt,[new(account,"Expense",100,10,tax)],Code(),dt)),HttpStatusCode.Created);return(supplier,b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid(),account);
 }
 [Fact] public async Task Empty_reports_have_exact_zero_totals_and_no_write_side_effects()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var before=await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company));Assert.Equal(0,T(await Profit(c),"netProfit"));Assert.Equal("BALANCED",(await Balance(c)).GetProperty("status").GetString());foreach(var side in new[]{"receivables","payables"}){var a=await Aging(c,side);Assert.Equal("RECONCILED",a.GetProperty("status").GetString());Assert.Empty(a.GetProperty("items").EnumerateArray());}Assert.Equal(before,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company",("company",db.Company)));
 }
 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task Revenue_expenses_GST_and_open_items_agree_with_financial_statements(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await Invoice(c,basis);var bill=await Bill(c);var p=await Profit(c);Assert.Equal(100,T(p,"revenue"));Assert.Equal(100,T(p,"expenses"));Assert.Equal(0,T(p,"netProfit"));var ar=await Aging(c,"receivables");var ap=await Aging(c,"payables");Assert.Equal(110,T(ar,"outstanding"));Assert.Equal(110,T(ap,"outstanding"));Assert.Equal(sale.Invoice,ar.GetProperty("items")[0].GetProperty("documentId").GetGuid());await FinancialReportAssertions.Check(c);
 }
 [Theory][InlineData(0,"current")][InlineData(1,"days1To30")][InlineData(30,"days1To30")][InlineData(31,"days31To60")][InlineData(60,"days31To60")][InlineData(61,"days61To90")][InlineData(90,"days61To90")][InlineData(91,"daysOver90")]
 public async Task Due_date_buckets_have_exact_inclusive_boundaries(int overdue,string bucket)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var today=await Today();await Bill(c,due:today);var a=await Aging(c,"payables",today.AddDays(overdue));Assert.Equal(110,T(a,bucket));Assert.Equal(overdue,a.GetProperty("items")[0].GetProperty("daysOverdue").GetInt32());Assert.Equal(110,T(a,"controlBalance"));
 }
 [Fact] public async Task Historical_AP_uses_posting_date_not_supplier_invoice_date_or_current_balance()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var today=await Today();var b=await Bill(c,today.AddDays(-2));Assert.Equal(110,T(await Aging(c,"payables",today.AddDays(-1)),"outstanding"));await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{b.Supplier}/payments",new SupplierPaymentInput(55,"BANK_TRANSFER",Code(),Allocations:[new(b.Line,55)])),HttpStatusCode.Created);Assert.Equal(55,T(await Aging(c,"payables"),"outstanding"));Assert.Equal(110,T(await Aging(c,"payables",today.AddDays(-1)),"outstanding"));await FinancialReportAssertions.Check(c);
 }
 [Fact] public async Task Credits_do_not_hide_gross_overdue_and_aging_pagination_keeps_full_totals()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var s=await Invoice(c);await Expect(await Send(c,HttpMethod.Post,$"/customers/{s.Data.Customer}/receipts",new CustomerReceiptInput(110,"BANK_TRANSFER",Code(),[new(s.Line,110)])),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/sales-invoices/{s.Invoice}/amount-credit-notes",new AmountCreditInput("Adjustment",[new(s.Line,20,2,"Credit")])),HttpStatusCode.Created);await Invoice(c);var a=await Aging(c,"receivables",(await Today()).AddDays(121),"&pageSize=1");Assert.Equal(110,T(a,"outstanding"));Assert.Equal(22,T(a,"availableCredit"));Assert.Equal(88,T(a,"netBalance"));Assert.Equal(110,T(a,"daysOver90"));Assert.Single(a.GetProperty("items").EnumerateArray());Assert.Equal(2,a.GetProperty("totalCount").GetInt64());var page=await Aging(c,"receivables",(await Today()).AddDays(121),"&pageSize=1&page=2");Assert.Equal(88,T(page,"netBalance"));Assert.NotEqual(a.GetProperty("items")[0].GetProperty("documentId").GetGuid(),page.GetProperty("items")[0].GetProperty("documentId").GetGuid());await FinancialReportAssertions.Check(c);
 }
 [Theory][InlineData("SALES")][InlineData("OFFICE")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")]
 public async Task Non_finance_roles_cannot_read_any_financial_report(string role)
 {
  await using var api=new TestApi(db);var(subject,_)=await Staff(db,role);using var c=api.Authenticated(subject:subject);var date=await Today();foreach(var path in new[]{$"profit-and-loss?from={date:yyyy-MM-dd}&to={date.AddDays(1):yyyy-MM-dd}",$"balance-sheet?asOf={date:yyyy-MM-dd}",$"receivables-aging?asOf={date:yyyy-MM-dd}",$"payables-aging?asOf={date:yyyy-MM-dd}"})await Expect(await c.GetAsync("/api/v1/accounting/reports/"+path),HttpStatusCode.Forbidden);
 }
 [Theory][InlineData("accounting.reports.read")][InlineData("accounting.ledger.read")]
 public async Task Revoked_permissions_are_checked_on_every_read(string permission)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();await Balance(c);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission",("company",db.Company),("permission",permission));await Expect(await c.GetAsync($"/api/v1/accounting/reports/balance-sheet?asOf={await Today():yyyy-MM-dd}"),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Company_scope_and_party_filters_do_not_disclose_other_company_balances()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var sale=await Invoice(c);var party=(Guid)(await S("SELECT party_id FROM crm.customers WHERE company_id=@company AND id=@id",("company",db.Company),("id",sale.Data.Customer)))!;Assert.Equal(110,T(await Aging(c,"receivables",suffix:$"&partyId={party}"),"netBalance"));using var other=api.Authenticated(company:db.OtherCompany);Assert.Equal(0,T(await Profit(other),"revenue"));await Expect(await other.GetAsync($"/api/v1/accounting/reports/receivables-aging?asOf={await Today():yyyy-MM-dd}&partyId={party}"),HttpStatusCode.NotFound);Assert.Empty((await Aging(other,"receivables")).GetProperty("items").EnumerateArray());
 }
 [Theory][InlineData("profit-and-loss?from=2026-01-01&to=2026-01-01")][InlineData("profit-and-loss?from=2025-01-01&to=2026-01-03")][InlineData("balance-sheet?asOf=0001-01-02")][InlineData("balance-sheet?asOf=2026-10-01&fiscalYearStart=2026-10-02")][InlineData("receivables-aging?asOf=bad")][InlineData("payables-aging?asOf=0001-01-01")]
 public async Task Invalid_date_ranges_fail_without_server_errors(string query)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();using var response=await c.GetAsync("/api/v1/accounting/reports/"+query);Assert.Contains(response.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity});
 }
 [Fact] public async Task Uncommitted_payment_is_never_half_visible_in_reports()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var b=await Bill(c);await using(var session=await db.SessionAsync())
  {
   await Sql.RowsAsync(session,"SELECT purchase.post_supplier_payment(@supplier,55,0,'BANK_TRANSFER',@reference,NULL,'Report transaction',jsonb_build_array(jsonb_build_object('billLineId',@line,'amount',55))) AS id",default,("supplier",b.Supplier),("reference",Code()),("line",b.Line));
   var reads=await Task.WhenAll(Enumerable.Range(0,6).Select(_=>Aging(c,"payables")));Assert.All(reads,a=>{Assert.Equal(110,T(a,"netBalance"));Assert.Equal("RECONCILED",a.GetProperty("status").GetString());});await session.Transaction.CommitAsync();
  }
  Assert.Equal(55,T(await Aging(c,"payables"),"netBalance"));await FinancialReportAssertions.Check(c);
 }
 [Fact] public async Task Inactive_expense_accounts_and_exact_cents_remain_in_statements()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var b=await Bill(c);await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",b.Expense));var pl=await Profit(c);Assert.Equal(100,T(pl,"expenses"));Assert.False(pl.GetProperty("items").EnumerateArray().Single(x=>x.GetProperty("accountId").GetGuid()==b.Expense).GetProperty("active").GetBoolean());await FinancialReportAssertions.Check(c);
 }
 private async Task Journal(DateOnly date,string debit,string credit,decimal amount,Guid? party=null)
 {
  var doc=(Guid)(await S("INSERT INTO platform.documents(company_id,document_type,business_date,created_by) VALUES(@company,'REPORT_TEST',@date,@actor) RETURNING id",("company",db.Company),("date",date),("actor",db.Actor)))!;
  await using var session=await db.SessionAsync();await Sql.RowsAsync(session,"SELECT accounting.post_journal(@doc,1,'REPORT_TEST',@date,'Reporting test journal',jsonb_build_array(jsonb_build_object('accountId',(SELECT id FROM accounting.accounts WHERE company_id=core.current_company() AND code=@debit),'partyId',nullif(@party::uuid,'00000000-0000-0000-0000-000000000000'::uuid),'debit',@amount),jsonb_build_object('accountId',(SELECT id FROM accounting.accounts WHERE company_id=core.current_company() AND code=@credit),'partyId',nullif(@party::uuid,'00000000-0000-0000-0000-000000000000'::uuid),'credit',@amount))) AS id",default,("doc",doc),("date",date),("debit",debit),("credit",credit),("amount",amount),("party",party??Guid.Empty));await session.Transaction.CommitAsync();
 }
 [Fact] public async Task Profit_and_balance_sheet_include_unclosed_earnings_without_writing_closing_journals()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();await Invoice(c);var p=await Profit(c);Assert.Equal(100,T(p,"revenue"));Assert.Equal(0,T(p,"expenses"));Assert.Equal(100,T(p,"netProfit"));var b=await Balance(c);Assert.Equal(110,T(b,"assets"));Assert.Equal(10,T(b,"liabilities"));Assert.Equal(100,T(b,"currentYearEarnings"));Assert.Equal(100,T(b,"equity"));Assert.Equal(0,T(b,"difference"));Assert.Equal(0,T(await Profit(c,to:await Today(),from:(await Today()).AddDays(-1)),"revenue"));Assert.Equal(0,T(await Balance(c,(await Today()).AddDays(-1)),"assets"));
 }
 [Fact] public async Task Prior_year_unclosed_profit_is_separate_from_configured_current_year_and_retained_equity()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var today=await Today();var fy=new DateOnly(today.Month>=7?today.Year:today.Year-1,7,1);var prior=fy.AddDays(-1);
  await S("WITH y AS(INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) VALUES(@company,@label,@date,@end) RETURNING id) INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,@date,@end FROM y",("company",db.Company),("label",Code()),("date",prior),("end",fy));
  await Journal(prior,"1200","4000",50.03m);await Journal(today,"1200","4000",10.02m);await Journal(today,"5000","1200",2.01m);await Journal(today,"1200","3000",20);
  var b=await Balance(c);Assert.Equal(50.03m,T(b,"priorUnclosedEarnings"));Assert.Equal(8.01m,T(b,"currentYearEarnings"));Assert.Equal(20,T(b,"postedEquity"));Assert.Equal(78.04m,T(b,"assets"));Assert.Equal(78.04m,T(b,"equity"));Assert.Equal(8.01m,T(await Profit(c,fy,today.AddDays(1)),"netProfit"));Assert.Equal("BALANCED",b.GetProperty("status").GetString());
 }
 [Fact] public async Task Historical_credits_and_payment_reversal_restore_only_their_effective_dates()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var today=await Today();var b=await Bill(c,today.AddDays(-2));var payment=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{b.Supplier}/payments",new SupplierPaymentInput(55,"BANK_TRANSFER",Code(),Allocations:[new(b.Line,55)])),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{b.Bill}/amount-credits",new SupplierAmountCreditInput(Code(),"Invoice correction",[new(b.Line,10,1,"Price adjustment")])),HttpStatusCode.Created);Assert.Equal(44,T(await Aging(c,"payables"),"outstanding"));Assert.Equal(110,T(await Aging(c,"payables",today.AddDays(-1)),"outstanding"));await Expect(await Send(c,HttpMethod.Post,$"/supplier-payments/{payment.GetProperty("payment").GetProperty("id").GetGuid()}/reverse",new SupplierSettlementReversalInput(Code(),"Wrong payment")),HttpStatusCode.Created);Assert.Equal(99,T(await Aging(c,"payables"),"outstanding"));Assert.Equal(110,T(await Aging(c,"payables",today.AddDays(-1)),"outstanding"));
 }
 [Fact] public async Task Unmapped_control_journal_is_flagged_instead_of_silently_dropped_from_aging()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var b=await Bill(c);var party=(Guid)(await S("SELECT party_id FROM crm.suppliers WHERE company_id=@company AND id=@id",("company",db.Company),("id",b.Supplier)))!;await Journal(await Today(),"5000","2000",1,party);var a=await Aging(c,"payables");Assert.Equal("UNRECONCILED",a.GetProperty("status").GetString());Assert.Equal(110,T(a,"netBalance"));Assert.Equal(111,T(a,"controlBalance"));Assert.Equal(-1,T(a,"difference"));
 }
 [Fact] public async Task Readers_during_payment_commit_observe_one_consistent_snapshot_per_response()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var b=await Bill(c);await using var session=await db.SessionAsync();await Sql.RowsAsync(session,"SELECT purchase.post_supplier_payment(@supplier,55,0,'BANK_TRANSFER',@reference,NULL,'Concurrent report',jsonb_build_array(jsonb_build_object('billLineId',@line,'amount',55))) AS id",default,("supplier",b.Supplier),("reference",Code()),("line",b.Line));
  var first=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);var reading=Task.Run(async()=>{var all=new List<JsonElement>();for(var i=0;i<24;i++){all.Add(await Aging(c,"payables"));if(i==0)first.SetResult();await Task.Delay(3);}return all;});var gate=await Task.WhenAny(first.Task,reading);if(gate==reading)await reading;await first.Task.WaitAsync(TimeSpan.FromSeconds(20));await session.Transaction.CommitAsync();var reports=await reading;Assert.Contains(reports,x=>T(x,"netBalance")==110);Assert.Contains(reports,x=>T(x,"netBalance")==55);Assert.All(reports,x=>{Assert.Equal("RECONCILED",x.GetProperty("status").GetString());Assert.Contains(T(x,"netBalance"),new[]{110m,55m});Assert.Equal(T(x,"netBalance"),D(x.GetProperty("items")[0].GetProperty("netBalance")));});
 }
 [Fact] public async Task Finance_role_can_read_reports_and_zero_account_visibility_is_explicit()
 {
  await using var api=new TestApi(db);var(subject,_)=await Staff(db,"FINANCE");using var c=api.Authenticated(subject:subject);Assert.Empty((await Profit(c)).GetProperty("items").EnumerateArray());var dt=await Today();Assert.NotEmpty((await Get(c,$"/accounting/reports/profit-and-loss?from={dt:yyyy-MM-dd}&to={dt.AddDays(1):yyyy-MM-dd}&includeZero=true")).GetProperty("items").EnumerateArray());Assert.NotEmpty((await Get(c,$"/accounting/reports/balance-sheet?asOf={dt:yyyy-MM-dd}&includeZero=true")).GetProperty("items").EnumerateArray());await FinancialReportAssertions.Check(c);
 }
 [Fact] public async Task Concurrent_expense_commit_keeps_profit_lines_totals_and_balance_sheet_whole()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var b=await Bill(c);var date=await Today();var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;
  await using var session=await db.SessionAsync();await Sql.RowsAsync(session,"SELECT purchase.post_expense_bill(@supplier,@reference,@date,@date,@date,'Verified invoice',@date,'Concurrent expense',jsonb_build_array(jsonb_build_object('expenseAccountId',@account,'description','Expense','net',100,'tax',10,'taxCodeId',@tax,'recoverableGst',true))) AS id",default,("supplier",b.Supplier),("reference",Code()),("date",date),("account",b.Expense),("tax",tax));
  var first=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);var reading=Task.Run(async()=>{var seen=new List<decimal>();for(var i=0;i<16;i++){var pl=await Profit(c);Assert.Equal(T(pl,"expenses"),pl.GetProperty("items").EnumerateArray().Where(x=>x.GetProperty("kind").GetString()=="EXPENSE").Sum(x=>D(x.GetProperty("amount"))));seen.Add(T(pl,"expenses"));var bs=await Balance(c);Assert.Equal("BALANCED",bs.GetProperty("status").GetString());Assert.Contains(T(bs,"currentYearEarnings"),new[]{-100m,-200m});if(i==0)first.SetResult();await Task.Delay(3);}return seen;});var gate=await Task.WhenAny(first.Task,reading);if(gate==reading)await reading;await first.Task.WaitAsync(TimeSpan.FromSeconds(20));await session.Transaction.CommitAsync();var values=await reading;Assert.Contains(100m,values);Assert.Contains(200m,values);Assert.All(values,x=>Assert.Contains(x,new[]{100m,200m}));await FinancialReportAssertions.Check(c);
 }
}
