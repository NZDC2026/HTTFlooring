using System.Net;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.Accounting;
using Htt.Host.Api.Inventory;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Htt.Infrastructure.BankFeeds;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class StageDAcceptanceTests:IAsyncLifetime
{
 readonly DatabaseFixture db=new();public async Task InitializeAsync(){await db.InitializeAsync();await S("UPDATE recurring.templates SET state='PAUSED'WHERE state='ACTIVE';UPDATE bankfeeds.connections SET auto_sync=false;UPDATE bankfeeds.jobs SET state='CANCELLED',lease_token=NULL,lease_until=NULL WHERE state IN('PENDING','PROCESSING','RETRY','UNKNOWN')");}public Task DisposeAsync()=>db.DisposeAsync();
 Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
 static Guid Id(JsonElement e)=>e.GetProperty("id").GetGuid();
 async Task<DateOnly> Today()=>DateOnly.Parse((string)(await S("SELECT((now()AT TIME ZONE timezone)::date)::text FROM core.companies WHERE id=@c",("c",db.Company)))!);
 static JsonElement E(object value)=>JsonSerializer.SerializeToElement(value,ApiJson.Options);
 static JsonElement Data(JsonElement e)=>e.GetProperty("data");
 static async Task AssertBooks(HttpClient c){await FinancialReportAssertions.Check(c);var r=await Get(c,"/accounting/reconciliation");Assert.Equal("CONSISTENT",r.GetProperty("status").GetString());Assert.All(r.GetProperty("checks").EnumerateArray(),x=>Assert.Equal(0,x.GetProperty("mismatchCount").GetInt32()));}
 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task All_D_modules_share_actual_books_while_payroll_sandbox_remains_separate(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();
  await CompanyTaxSettings.ConfigureAsync(db.Owner,db.Company,true,basis,DatabaseFixture.Issuer,db.Subject);
  var finance=await Staff(db,"FINANCE");using var f=api.Authenticated(finance.Subject);
  var today=await Today();var range=$"from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}";
  var d=await Setup(db,c,22);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,100,Code(),DatabaseFixture.Issuer,db.Subject);
  var bank=await Create(c,"/bank-accounts",new BankAccountInput(Code(),"Stage C acceptance bank","BANK","062000","12345678","HTT test"));
  var q=await Submitted(c,d.Draft(3)with{Lines=[new(d.BoxUnit,Quantity:3,UnitPrice:100)]});
  var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
  var line=Id((await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0]);
  var pick=Id(await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{order}/picks",new PickInput([new(line,3)]),1),HttpStatusCode.Created));
  await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick}/confirm",new DispatchInput("PICKUP","Acceptance customer",Code()),1),HttpStatusCode.OK);
  var version=(await Get(c,$"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64();
  var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/invoices",new InvoiceInput([new(line,3)],"Supplied"),version),HttpStatusCode.Created);
  var receiptInput=new CustomerReceiptInput(330,"BANK_TRANSFER",Code(),[new(Id(invoice.GetProperty("lines")[0]),330)],BankAccountId:bank);var receiptKey=Code();
  var receipt=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",receiptInput,key:receiptKey),HttpStatusCode.Created);
  var replay=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",receiptInput,key:receiptKey),HttpStatusCode.Created);Assert.Equal(Id(receipt),Id(replay));
  var expense=(Guid)(await S("INSERT INTO accounting.accounts(company_id,code,name,kind)VALUES(@c,@code,'Acceptance operating expense','EXPENSE')RETURNING id",("c",db.Company),("code",Code())))!;
  var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@c AND code='GST'",("c",db.Company)))!;
  var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Acceptance supplier",null));
  var tpl=await Create(c,"/recurring/templates",new RecurringTemplateInput("D acceptance service","EXPENSE_BILL","DAY",1,today,today,1,E(new{supplierId=supplier,lines=new[]{new{expenseAccountId=expense,description="Operating service",net=100,tax=10,taxCodeId=tax,recoverableGst=true}}})));
  await Expect(await Send(c,HttpMethod.Post,$"/recurring/templates/{tpl}/change",new RecurringChangeInput("RESUME","Approved schedule"),1),HttpStatusCode.OK);
  await using(var con=new NpgsqlConnection(db.Worker)){await con.OpenAsync();await using var cmd=new NpgsqlCommand("SELECT recurring.tick()",con);Assert.Equal(1,await cmd.ExecuteScalarAsync());}
  var proposal=(await Get(c,$"/recurring/runs?templateId={tpl}")).GetProperty("items")[0];var evidence=E(new{supplierInvoice=Code(),invoiceDate=today,dueOn=today,postingDate=today,taxInvoiceReference="Verified invoice",taxInvoiceHeldOn=today});var rk=Code();
  var approved=await Expect(await Send(f,HttpMethod.Post,$"/recurring/runs/{Id(proposal)}/review",new RecurringReviewInput("APPROVE","Independent review",evidence),proposal.GetProperty("version").GetInt64(),rk),HttpStatusCode.OK);Assert.Equal("APPROVED",approved.GetProperty("state").GetString());
  var repeat=await Expect(await Send(f,HttpMethod.Post,$"/recurring/runs/{Id(proposal)}/review",new RecurringReviewInput("APPROVE","Independent review",evidence),proposal.GetProperty("version").GetInt64(),rk),HttpStatusCode.OK);Assert.Equal(approved.GetRawText(),repeat.GetRawText());
  var bill=await Get(c,$"/supplier-bills/{approved.GetProperty("documentId").GetGuid()}");
  var billLine=Id(bill.GetProperty("lines")[0]);
  await Expect(await Send(c,HttpMethod.Put,$"/accounting/bas-classifications/BILL_LINE/{billLine}",new BasClassificationInput("AUTO","NON_CAPITAL",null,"Reviewed"),0),HttpStatusCode.OK);
  var payment=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(110,"BANK_TRANSFER",Code(),Allocations:[new(billLine,110)],BankAccountId:bank)),HttpStatusCode.Created);
  await AssertBooks(c);
  var charge=Guid.NewGuid();var liability=Guid.NewGuid();var clearing=Guid.NewGuid();
  foreach(var(a,kind)in new[]{(charge,"EXPENSE"),(liability,"LIABILITY"),(clearing,"LIABILITY")})await S("INSERT INTO accounting.accounts(company_id,id,code,name,kind)VALUES(@c,@id,@code,'Acceptance incentive mapping',@kind)",("c",db.Company),("id",a),("code",Code()),("kind",kind));
  var program=await Create(c,"/incentives/programs",new IncentiveProgramInput("COMMISSION","Approved acceptance contract",UserId:db.Actor));
  var policy=await Create(c,$"/incentives/programs/{program}/policies",new IncentivePolicyInput(0,today,today.AddDays(1),JsonSerializer.SerializeToElement(new{basis="NET_SALES",formula="TIER_PERCENT_NET",tierMode="WHOLE_AMOUNT",thresholdUnit="AUD_NET",window="FIXED_WINDOW",windowFrom=today,windowTo=today.AddDays(1),tiers=new[]{new{from=0m,rate=5m},new{from=200m,rate=10m}},expenseAccountId=charge,liabilityAccountId=liability,settlementMode="CLEARING",clearingAccountId=clearing,taxTreatment="EXTERNAL_PAYROLL",taxReviewReference="Acceptance approved mapping",deductRebates=true,retroactiveAcknowledged=false,recoverableGst=false})));
  await Expect(await Send(f,HttpMethod.Post,$"/incentives/policies/{policy}/approve",new IncentiveReviewInput("Independent approval")),HttpStatusCode.OK);
  var period=await Create(c,"/incentives/periods",new IncentivePeriodInput(today,today.AddDays(1)));
  var run=await Create(c,"/incentives/runs",new IncentiveRunInput(program,period,today,today,"Accrue actual sale",[Id(invoice)]));
  var accountingPeriod=(Guid)(await S("SELECT id FROM accounting.periods WHERE company_id=@c AND starts_on<=@today AND ends_on>@today",("c",db.Company),("today",today)))!;
  var preflight=await Get(c,$"/accounting/periods/{accountingPeriod}/preflight");Assert.Contains(preflight.GetProperty("issues").EnumerateArray(),x=>x.GetString()=="INCENTIVE_ACCRUAL_PENDING");
  await Expect(await Send(f,HttpMethod.Post,$"/incentives/runs/{run}/approve",version:1),HttpStatusCode.OK);
  preflight=await Get(c,$"/accounting/periods/{accountingPeriod}/preflight");Assert.DoesNotContain(preflight.GetProperty("issues").EnumerateArray(),x=>x.GetString()=="INCENTIVE_ACCRUAL_PENDING");
  Assert.Contains(preflight.GetProperty("issues").EnumerateArray(),x=>x.GetString()=="PERIOD_NOT_ENDED");
  var claim=(Guid)(await S("SELECT id FROM incentives.claims WHERE company_id=@c AND program_id=@p",("c",db.Company),("p",program)))!;
  await Expect(await Send(c,HttpMethod.Post,"/incentives/settlements",new IncentiveSettlementInput(claim,30,0,today,Code(),"Approved external payroll transfer","External batch evidence",E(Array.Empty<object>()))),HttpStatusCode.Created);
  await AssertBooks(c);
  var beforeFeed=await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company));
  var feed=await Create(c,$"/bank-accounts/{bank}/feed-connections",new BankFeedConnectInput(Code(),today,false));
  var consent=new{companyId=db.Company,bankAccountId=bank,environment="SANDBOX",consentStatus="ACTIVE",consentExpiresAt=DateTimeOffset.UtcNow.AddDays(20),accountFingerprint=await S("SELECT encode(sha256(convert_to(bsb||':'||account_number,'UTF8')),'hex')FROM accounting.bank_accounts WHERE company_id=@c AND id=@b",("c",db.Company),("b",bank)),remoteAccountId="d-final-bank"};
  await Feed(consent);var feedView=await Get(c,$"/bank-feed-connections/{feed}");
  var job=await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/sync",version:feedView.GetProperty("version").GetInt64()),HttpStatusCode.Accepted);
  var payload=System.Text.Json.Nodes.JsonNode.Parse(E(consent).GetRawText())!.AsObject();payload["batchId"]="d-final-batch";payload["nextCursor"]="d-final-cursor";payload["statement"]=JsonSerializer.SerializeToNode(new{fromDate=today,toDate=today,openingBalance=0,closingBalance=220,lines=new[]{new{date=today,amount=330m,description="Receipt",reference=receiptInput.Reference,externalId="d-final-r",status="BOOKED"},new{date=today,amount=-110m,description="Supplier payment",reference="AP",externalId="d-final-p",status="BOOKED"}}});
  await Feed(payload);feedView=await Get(c,$"/bank-feed-connections/{feed}");Assert.False(feedView.GetProperty("liveConnection").GetBoolean());
  var statementId=feedView.GetProperty("jobs").EnumerateArray().Single(j=>Id(j)==Id(job)).GetProperty("statementId").GetGuid();Assert.Equal(beforeFeed,await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company)));
  var cash=(await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items").EnumerateArray().ToArray();
  foreach(var(source,amount)in new[]{(Id(receipt),330m),(Id(payment.GetProperty("payment")),110m)})
  {var cashId=cash.Single(x=>x.GetProperty("sourceDocumentId").GetGuid()==source).GetProperty("id").GetGuid();var stmt=await Get(c,$"/bank-statements/{statementId}");var stmtLine=Id(stmt.GetProperty("lines").EnumerateArray().Single(x=>Math.Abs(D(x.GetProperty("amount")))==amount));var sv=stmt.GetProperty("statement").GetProperty("version").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/bank-statement-lines/{stmtLine}/matches",new BankMatchInput(Code(),"Actual bank match",[new(cashId,amount)]),sv),HttpStatusCode.Created);}
  var live=await Get(c,$"/bank-statements/{statementId}");await Expect(await Send(c,HttpMethod.Post,$"/bank-statements/{statementId}/reconcile",new BankReconcileInput(Code(),"Fully matched real source documents"),live.GetProperty("statement").GetProperty("version").GetInt64()),HttpStatusCode.Created);
  var full=await Get(c,"/accounting/reports/gst-bas?reportingMethod=FULL&calculationMethod=ACCOUNTS&"+range);Assert.Equal("RECONCILED",full.GetProperty("ledgerStatus").GetString());var labels=full.GetProperty("financial").GetProperty("full");Assert.Equal(30,D(labels.GetProperty("1A")));Assert.Equal(10,D(labels.GetProperty("1B")));Assert.Equal(20,D(labels.GetProperty("netGst")));
  var dashboard=Data(await Get(c,"/workbench/finance?"+range));Assert.Equal(140,D(dashboard.GetProperty("profitLoss").GetProperty("totals").GetProperty("netProfit")));Assert.Equal(0,D(dashboard.GetProperty("financialPosition").GetProperty("totals").GetProperty("difference")));Assert.Equal(0,D(dashboard.GetProperty("receivables").GetProperty("totals").GetProperty("netBalance")));Assert.Equal(0,D(dashboard.GetProperty("payables").GetProperty("totals").GetProperty("netBalance")));
  var hub=Data(await Get(c,"/workbench/banks")).GetProperty("items").EnumerateArray().Single(x=>Id(x)==bank);Assert.Equal(220,D(hub.GetProperty("bookBalance")));Assert.Equal(0,hub.GetProperty("unmatchedLines").GetInt32());Assert.Equal("RECONCILED",hub.GetProperty("latestStatement").GetProperty("state").GetString());
  var staff=await Staff(db,"SALES",d);using var sales=api.Authenticated(staff.Subject);var customer=Data(await Get(sales,$"/workbench/customers/{d.Customer}?"+range));Assert.Equal("FORBIDDEN",customer.GetProperty("receivables").GetProperty("status").GetString());Assert.Empty(customer.GetProperty("rebates").GetProperty("data").EnumerateArray());
  var warehouseStaff=await Staff(db,"WAREHOUSE",d);using var warehouse=api.Authenticated(warehouseStaff.Subject);var stock=Data(await Get(warehouse,"/workbench/warehouse")).GetProperty("items")[0];Assert.Equal(15.4m,D(stock.GetProperty("quantitiesByBaseUnit")[0].GetProperty("on_hand")));Assert.DoesNotContain("cost",stock.GetRawText(),StringComparison.OrdinalIgnoreCase);
  var snapshot=await Expect(await Send(c,HttpMethod.Post,"/reports/packs",new ReportPackInput("D final frozen books",new[]{E(new{definition=new{kind="PROFIT_LOSS",filters=new{from=today,to=today.AddDays(1)}}}),E(new{definition=new{kind="BALANCE_SHEET",filters=new{asOf=today}}})})),HttpStatusCode.Created);
  Assert.Equal(140,D(snapshot.GetProperty("snapshot").GetProperty("sections")[0].GetProperty("metadata").GetProperty("totals").GetProperty("netProfit")));
  var number=(string)(await S("SELECT number FROM platform.documents WHERE company_id=@c AND id=@id",("c",db.Company),("id",Id(invoice))))!;var found=await Get(c,"/search?q="+Uri.EscapeDataString(number)+"&kind=INVOICE");Assert.Contains(found.GetProperty("items").EnumerateArray(),row=>Id(row)==Id(invoice));
  var beforePayroll=await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company));
  await Expect(await f.GetAsync("/api/v1/payroll/records?kind=RUN"),HttpStatusCode.Forbidden);
  using var payrollReviewer=api.Authenticated((await Staff(db,"ADMIN")).Subject);
  var employee=await Payroll(c,"EMPLOYEE",new{code=Code(),name="D-AUDIT-PRIVATE-PAYROLL",employmentType="CASUAL",startDate=today});
  await Payroll(c,"SETTINGS",new{provider="SANDBOX",rulesVersion="audit-fixture-not-statutory",fixtureHourlyCents=3000,fixturePaygCents=1000,fixtureSuperCents=2000});
  var sheet=await Payroll(c,"TIMESHEET",new{employeeId=Id(employee),date=today,minutes=480,category="ORDINARY"});sheet=await PayrollAction(c,sheet,"submit");sheet=await PayrollAction(payrollReviewer,sheet,"approve");
  var pr=await Payroll(c,"RUN",new{from=today,to=today,payDate=today,timesheetIds=new[]{Id(sheet)}});pr=await PayrollAction(c,pr,"calculate");pr=await PayrollAction(payrollReviewer,pr,"approve");pr=await PayrollAction(c,pr,"lock");pr=await PayrollAction(c,pr,"stp_preview");Assert.False(pr.GetProperty("atoLodged").GetBoolean());Assert.False(pr.GetProperty("paid").GetBoolean());
  var payrollReport=await Get(c,$"/payroll/report?from={today:yyyy-MM-dd}&to={today:yyyy-MM-dd}");Assert.Equal(0,payrollReport.GetProperty("balanceDifferenceCents").GetInt64());Assert.Equal(24000,payrollReport.GetProperty("grossCents").GetInt64());
  Assert.Equal(beforePayroll,await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company)));Assert.Equal(30m,(decimal)(await S("SELECT coalesce(sum(debit-credit),0)FROM accounting.journal_lines WHERE company_id=@c AND account_id=@a",("c",db.Company),("a",clearing)))!*-1);
  Assert.Equal(snapshot.GetRawText(),(await Get(c,$"/reports/packs/{Id(snapshot)}")).GetRawText());Assert.Empty((await Get(c,"/search?q=D-AUDIT-PRIVATE-PAYROLL")).GetProperty("items").EnumerateArray());
  await AssertBooks(c);Assert.Equal(0L,await S("SELECT count(*)FROM incentives.control_balances()WHERE expected<>actual"));
 }
 sealed class Gateway(JsonElement response):IBankFeedGateway{public Task<JsonElement> ExecuteAsync(JsonElement request,CancellationToken ct)=>Task.FromResult(response);}
 async Task Feed(object response){await using var source=NpgsqlDataSource.Create(db.Worker);Assert.True(await new BankFeedWorker(source,new Gateway(E(response))).ProcessOneAsync());}
 async Task<JsonElement> Payroll(HttpClient c,string kind,object body)=>await Expect(await Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput(kind,E(body))),HttpStatusCode.Created);
 async Task<JsonElement> PayrollAction(HttpClient c,JsonElement record,string action)=>await Expect(await Send(c,HttpMethod.Post,$"/payroll/records/{Id(record)}/{action}",version:record.GetProperty("version").GetInt64()),HttpStatusCode.OK);
}
