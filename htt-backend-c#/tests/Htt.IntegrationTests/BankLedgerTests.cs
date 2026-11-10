using System.Net;
using System.Text.Json;
using Htt.Host.Api.Accounting;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class BankLedgerTests:IAsyncLifetime
{
 private readonly DatabaseFixture db=new();public Task InitializeAsync()=>db.InitializeAsync();public Task DisposeAsync()=>db.DisposeAsync();
 private Task<object?> S(string sql,params(string,object)[]args)=>db.OwnerScalarAsync(sql,args);
 private static BankAccountInput Bank(string? code=null)=>new(code??Code(),"Operating bank","BANK","062-000",Random.Shared.NextInt64(100000,99999999999).ToString(System.Globalization.CultureInfo.InvariantCulture)+"6789","HTT Flooring");
 private static Guid Id(JsonElement e)=>e.GetProperty("id").GetGuid();
 private async Task<JsonElement> Add(HttpClient c,BankAccountInput? input=null)=>await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input??Bank()),HttpStatusCode.Created);
 private async Task<decimal> BankBalance(HttpClient c,Guid id)=>D((await Get(c,$"/bank-accounts/{id}")).GetProperty("signedBalance"));
 private async Task<DateOnly> Today()=>DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!);
 private static async Task Consistent(HttpClient c)=>Assert.Equal("CONSISTENT",(await Get(c,"/accounting/reconciliation")).GetProperty("status").GetString());
 private async Task<(SalesData Sales,Guid Line)> Order(HttpClient c,string basis="CASH")
 {
  await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=true WHERE id=@company",("company",db.Company),("basis",basis));var d=await Setup(db,c,22);await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,220,"Bank test stock",DatabaseFixture.Issuer,db.Subject);var q=await Submitted(c,d.Draft(1));var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();return(d,(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid());
 }
 private static Task<HttpResponseMessage> Receive(HttpClient c,SalesData d,Guid line,Guid? bank,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(22,"BANK_TRANSFER",reference??Code(),Advances:[new(line,22)],BankAccountId:bank),key:key);
 private static Task<HttpResponseMessage> Default(HttpClient c,JsonElement current,Guid id,string? key=null)=>Send(c,HttpMethod.Put,"/bank-accounts/default",new BankDefaultInput(id),current.GetProperty("defaultMappingVersion").GetInt64(),key);
 [Fact] public async Task Directory_has_legacy_default_and_new_identity_is_immutable_with_versioned_updates()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var initial=(await Get(c,"/bank-accounts")).GetProperty("items");Assert.Single(initial.EnumerateArray());Assert.Equal("LEGACY",initial[0].GetProperty("kind").GetString());var input=Bank();var key=Code();var first=await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input,key:key),HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(first,await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input,key:key),HttpStatusCode.Created)));var id=Id(first);var version=first.GetProperty("version").GetInt64();await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{id}",input with{AccountNumber="999999"},version),HttpStatusCode.Conflict);var updated=await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{id}",input with{Name="Renamed"},version),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{id}",input,version),HttpStatusCode.Conflict);Assert.Equal(input.AccountNumber,updated.GetProperty("accountNumber").GetString());
 }
 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task Four_cash_flows_use_selected_accounts_and_remain_balanced(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=Id(await Add(c));var b=Id(await Add(c));var(d,line)=await Order(c,basis);var receipt=await Expect(await Receive(c,d,line,a),HttpStatusCode.Created);Assert.Equal(a,receipt.GetProperty("bankAccountId").GetGuid());var advance=receipt.GetProperty("advances")[0].GetProperty("id").GetGuid();var refund=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/refunds",new CustomerRefundInput(22,Code(),"Verified bank refund",AdvanceId:advance,CancelOrder:true,BankAccountId:b)),HttpStatusCode.Created);Assert.Equal(b,refund.GetProperty("bankAccountId").GetGuid());Assert.Equal(22,await BankBalance(c,a));Assert.Equal(-22,await BankBalance(c,b));
  var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier",null));var paid=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(44,"BANK_TRANSFER",Code(),44,Notes:"Verified advance",BankAccountId:b)),HttpStatusCode.Created);var aid=paid.GetProperty("advances")[0].GetProperty("id").GetGuid();var received=await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(11,Code(),"Supplier overpayment returned",AdvanceId:aid,BankAccountId:a)),HttpStatusCode.Created);Assert.Equal(a,received.GetProperty("refund").GetProperty("bankAccountId").GetGuid());Assert.Equal(33,await BankBalance(c,a));Assert.Equal(-66,await BankBalance(c,b));await Consistent(c);var today=await Today();var tb=await Get(c,$"/accounting/trial-balance?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&includeZero=true");Assert.Equal("BALANCED",tb.GetProperty("status").GetString());Assert.Equal(0,D(tb.GetProperty("totals").GetProperty("difference")));
 }
 [Fact] public async Task Reversal_and_reapplication_keep_original_bank_after_default_change_and_profile_deactivation()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();var a=await Add(c,input);var b=await Add(c);var(d,line)=await Order(c);var receipt=await Expect(await Receive(c,d,line,Id(a)),HttpStatusCode.Created);await Expect(await Default(c,b,Id(b)),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(a)}",input with{Active=false},a.GetProperty("version").GetInt64()),HttpStatusCode.OK);var reversed=await Expect(await Send(c,HttpMethod.Post,$"/customer-receipts/{Id(receipt)}/reverse",new SettlementReversalInput(Code(),"Correction")),HttpStatusCode.Created);Assert.Equal(0,await BankBalance(c,Id(a)));var repl=await Expect(await Send(c,HttpMethod.Post,$"/receipt-reversals/{reversed.GetProperty("reversal").GetProperty("id").GetGuid()}/reapply",new ReceiptReapplicationInput(Code(),"Reapply original funds",Advances:[new(line,22)])),HttpStatusCode.Created);Assert.Equal(Id(a),repl.GetProperty("receipt").GetProperty("bankAccountId").GetGuid());Assert.Equal(22,await BankBalance(c,Id(a)));Assert.Equal(0,await BankBalance(c,Id(b)));await Consistent(c);
 }
 [Fact] public async Task Ledger_pagination_running_totals_journal_trace_and_next_day_opening_match_GL()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=Id(await Add(c));var(d,line)=await Order(c);await Expect(await Receive(c,d,line,a),HttpStatusCode.Created);var today=await Today();var query=$"/accounting/general-ledger?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&accountId={a}";var ledger=await Get(c,query+"&pageSize=1");Assert.Equal(0,D(ledger.GetProperty("openingSigned")));Assert.Equal(22,D(ledger.GetProperty("closingSigned")));var row=ledger.GetProperty("items")[0];Assert.Equal(22,D(row.GetProperty("runningSigned")));var detail=await Get(c,$"/accounting/journals/{row.GetProperty("journalId").GetGuid()}");Assert.True(detail.GetProperty("lines").GetArrayLength()>=2);var second=await Get(c,query+"&pageSize=1&page=2");Assert.Empty(second.GetProperty("items").EnumerateArray());Assert.Equal(22,D(second.GetProperty("closingSigned")));var next=await Get(c,$"/accounting/general-ledger?from={today.AddDays(1):yyyy-MM-dd}&to={today.AddDays(2):yyyy-MM-dd}&accountId={a}");Assert.Equal(22,D(next.GetProperty("openingSigned")));Assert.Equal(0,D(next.GetProperty("periodDebit")));await Consistent(c);
 }
 [Theory][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")]
 public async Task Non_finance_cannot_read_or_write_bank_details_or_ledger(string role)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var staff=await Staff(db,role);using var other=api.Authenticated(staff.Subject);await Expect(await other.GetAsync("/api/v1/bank-accounts"),HttpStatusCode.Forbidden);await Expect(await Send(other,HttpMethod.Post,"/bank-accounts",Bank()),HttpStatusCode.Forbidden);var today=await Today();await Expect(await other.GetAsync($"/api/v1/accounting/trial-balance?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}"),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Office_can_select_masked_bank_options_but_cannot_read_balances_or_full_identity()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Add(c);var staff=await Staff(db,"OFFICE");using var office=api.Authenticated(staff.Subject);var options=await Get(office,"/bank-accounts/options");var item=options.GetProperty("items").EnumerateArray().Single(x=>Id(x)==Id(bank));Assert.Equal("****6789",item.GetProperty("accountNumberMasked").GetString());Assert.False(item.TryGetProperty("accountNumber",out _));await Expect(await office.GetAsync($"/api/v1/bank-accounts/{Id(bank)}"),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Same_key_concurrent_receipts_post_once_and_different_bank_same_key_conflicts()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=Id(await Add(c));var b=Id(await Add(c));var(d,line)=await Order(c);var key=Code();var reference=Code();var replies=await Task.WhenAll(Receive(c,d,line,a,key,reference),Receive(c,d,line,a,key,reference));var first=await Expect(replies[0],HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(first,await Expect(replies[1],HttpStatusCode.Created)));Assert.Equal(22,await BankBalance(c,a));await Expect(await Receive(c,d,line,b,key,reference),HttpStatusCode.Conflict);await Consistent(c);
 }
 [Fact] public async Task Default_mapping_changes_are_versioned_and_concurrent_writes_do_not_overwrite()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Add(c);var b=await Add(c);var replies=await Task.WhenAll(Default(c,a,Id(a)),Default(c,b,Id(b)));Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Conflict);
 }
 [Theory][InlineData("12","123")][InlineData("ABCDEF","123")][InlineData("062000","letters")]
 public async Task Invalid_bank_identity_does_not_create_GL_account(string bsb,string number)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank()with{Bsb=bsb,AccountNumber=number};await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.accounts WHERE company_id=@company AND code=@code",("company",db.Company),("code",input.Code)));
 }
 [Fact] public async Task Foreign_or_inactive_bank_is_rejected_without_cash_or_GST_changes()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();var a=await Add(c,input);var(d,line)=await Order(c);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(a)}",input with{Active=false},a.GetProperty("version").GetInt64()),HttpStatusCode.OK);await Expect(await Receive(c,d,line,Id(a)),HttpStatusCode.UnprocessableEntity);using var other=api.Authenticated(company:db.OtherCompany);var foreign=Id(await Add(other));await Expect(await Receive(c,d,line,foreign),HttpStatusCode.UnprocessableEntity);Assert.Equal(0,await BankBalance(c,Id(a)));var today=await Today();await Expect(await c.GetAsync($"/api/v1/accounting/general-ledger?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&accountId={foreign}"),HttpStatusCode.NotFound);await Consistent(c);
 }
 [Fact] public async Task Duplicate_physical_bank_account_is_not_split_between_GL_accounts()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();await Add(c,input);await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input with{Code=Code()}),HttpStatusCode.Conflict);
 }
 [Fact] public async Task Late_audit_failure_rolls_back_directory_GL_and_idempotency_then_same_key_retries()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();var key=Code();await S($"CREATE FUNCTION accounting.test_bank_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='{db.Company}'::uuid AND NEW.action='accounting.bank_created' THEN RAISE EXCEPTION 'Injected bank audit failure' USING ERRCODE='HR422';END IF;RETURN NEW;END $$;CREATE TRIGGER test_bank_audit_failure BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION accounting.test_bank_audit_failure()");try{await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input,key:key),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.accounts WHERE company_id=@company AND code=@code",("company",db.Company),("code",input.Code)));}finally{await S("DROP TRIGGER test_bank_audit_failure ON platform.audit_events;DROP FUNCTION accounting.test_bank_audit_failure()");}await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",input,key:key),HttpStatusCode.Created);
 }
 [Fact] public async Task Selection_permission_is_rechecked_before_cached_receipt_response()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=Id(await Add(c));var(d,line)=await Order(c);var key=Code();var reference=Code();await Expect(await Receive(c,d,line,bank,key,reference),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='accounting.banks.use'",("company",db.Company));await Expect(await Receive(c,d,line,bank,key,reference),HttpStatusCode.Forbidden);Assert.Equal(22,await BankBalance(c,bank));
 }
 [Fact] public async Task Default_account_selection_and_omitted_bank_replay_keep_existing_request_contract()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Add(c);var b=await Add(c);await Expect(await Default(c,a,Id(a)),HttpStatusCode.OK);var(d,line)=await Order(c);var key=Code();var reference=Code();var first=await Expect(await Receive(c,d,line,null,key,reference),HttpStatusCode.Created);Assert.Equal(Id(a),first.GetProperty("bankAccountId").GetGuid());var current=await Get(c,$"/bank-accounts/{Id(b)}");await Expect(await Default(c,current,Id(b)),HttpStatusCode.OK);Assert.True(JsonElement.DeepEquals(first,await Expect(await Receive(c,d,line,null,key,reference),HttpStatusCode.Created)));Assert.Equal(22,await BankBalance(c,Id(a)));Assert.Equal(0,await BankBalance(c,Id(b)));
 }
 [Theory][InlineData(0)][InlineData(367)]
 public async Task Report_date_ranges_are_bounded(int days)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var today=await Today();foreach(var path in new[]{"general-ledger","trial-balance"})await Expect(await c.GetAsync($"/api/v1/accounting/{path}?from={today:yyyy-MM-dd}&to={today.AddDays(days):yyyy-MM-dd}"),HttpStatusCode.UnprocessableEntity);
 }
 [Fact] public async Task Report_running_balance_continues_across_pages_and_period_opening_is_not_reset()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=Id(await Add(c));var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Opening supplier",null));var today=await Today();foreach(var date in new[]{today.AddDays(-1),today})await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(11,"BANK_TRANSFER",Code(),11,PaidOn:date,Notes:"Period test",BankAccountId:a)),HttpStatusCode.Created);var range=$"/accounting/general-ledger?from={today.AddDays(-1):yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&accountId={a}&pageSize=1";var one=await Get(c,range);var two=await Get(c,range+"&page=2");Assert.Equal(-11,D(one.GetProperty("items")[0].GetProperty("runningSigned")));Assert.Equal(-22,D(two.GetProperty("items")[0].GetProperty("runningSigned")));Assert.Equal(-22,D(two.GetProperty("closingSigned")));var period=await Get(c,$"/accounting/general-ledger?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&accountId={a}");Assert.Equal(-11,D(period.GetProperty("openingSigned")));Assert.Equal(11,D(period.GetProperty("periodCredit")));await Consistent(c);
 }

 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task Supplier_payment_reversal_and_reapply_use_original_account(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));var input=Bank();var a=await Add(c,input);var b=await Add(c);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier",null));var paid=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(44,"BANK_TRANSFER",Code(),44,Notes:"Advance",BankAccountId:Id(a))),HttpStatusCode.Created);await Expect(await Default(c,b,Id(b)),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(a)}",input with{Active=false},a.GetProperty("version").GetInt64()),HttpStatusCode.OK);var rev=await Expect(await Send(c,HttpMethod.Post,$"/supplier-payments/{paid.GetProperty("payment").GetProperty("id").GetGuid()}/reverse",new SupplierSettlementReversalInput(Code(),"Correction")),HttpStatusCode.Created);var replacement=await Expect(await Send(c,HttpMethod.Post,$"/supplier-payment-reversals/{rev.GetProperty("reversal").GetProperty("id").GetGuid()}/reapply",new SupplierPaymentReapplicationInput(Code(),"Reapply original funds",44)),HttpStatusCode.Created);Assert.Equal(Id(a),replacement.GetProperty("payment").GetProperty("bankAccountId").GetGuid());Assert.Equal(-44,await BankBalance(c,Id(a)));Assert.Equal(0,await BankBalance(c,Id(b)));await Consistent(c);
 }
 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task Customer_refund_reversal_and_correction_preserve_original_selected_bank(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var a=await Add(c);var input=Bank();var b=await Add(c,input);var(d,line)=await Order(c,basis);var received=await Expect(await Receive(c,d,line,Id(a)),HttpStatusCode.Created);var advance=received.GetProperty("advances")[0].GetProperty("id").GetGuid();var refunded=await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/refunds",new CustomerRefundInput(22,Code(),"Refund",AdvanceId:advance,CancelOrder:true,BankAccountId:Id(b))),HttpStatusCode.Created);await Expect(await Default(c,a,Id(a)),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(b)}",input with{Active=false},b.GetProperty("version").GetInt64()),HttpStatusCode.OK);var rev=await Expect(await Send(c,HttpMethod.Post,$"/customer-refunds/{Id(refunded)}/reverse",new CustomerRefundReversalInput(Code(),"Correction")),HttpStatusCode.Created);Assert.Equal(0,await BankBalance(c,Id(b)));var corrected=await Expect(await Send(c,HttpMethod.Post,$"/customer-refund-reversals/{rev.GetProperty("reversal").GetProperty("id").GetGuid()}/correct",new CustomerRefundCorrectionInput(Code(),"Correct amount",11,AdvanceId:advance)),HttpStatusCode.Created);Assert.Equal(Id(b),corrected.GetProperty("refund").GetProperty("bankAccountId").GetGuid());Assert.Equal(-11,await BankBalance(c,Id(b)));Assert.Equal(22,await BankBalance(c,Id(a)));await Consistent(c);
 }
 [Theory][InlineData("CASH")][InlineData("NON_CASH")]
 public async Task Supplier_refund_reversal_and_correction_preserve_original_selected_bank(string basis)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));var a=await Add(c);var input=Bank();var b=await Add(c,input);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier",null));var paid=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(44,"BANK_TRANSFER",Code(),44,Notes:"Advance",BankAccountId:Id(a))),HttpStatusCode.Created);var advance=paid.GetProperty("advances")[0].GetProperty("id").GetGuid();var refunded=await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(11,Code(),"Refund",AdvanceId:advance,BankAccountId:Id(b))),HttpStatusCode.Created);await Expect(await Default(c,a,Id(a)),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(b)}",input with{Active=false},b.GetProperty("version").GetInt64()),HttpStatusCode.OK);var rev=await Expect(await Send(c,HttpMethod.Post,$"/supplier-refunds/{refunded.GetProperty("refund").GetProperty("id").GetGuid()}/reverse",new SupplierRefundReversalInput(Code(),"Correction")),HttpStatusCode.Created);var corrected=await Expect(await Send(c,HttpMethod.Post,$"/supplier-refund-reversals/{rev.GetProperty("reversal").GetProperty("id").GetGuid()}/correct",new SupplierRefundCorrectionInput(Code(),"Correct amount",7,AdvanceId:advance)),HttpStatusCode.Created);Assert.Equal(Id(b),corrected.GetProperty("refund").GetProperty("bankAccountId").GetGuid());Assert.Equal(7,await BankBalance(c,Id(b)));Assert.Equal(-44,await BankBalance(c,Id(a)));await Consistent(c);
 }
 [Fact] public async Task Uncommitted_posting_is_absent_from_ledger_and_trial_balance_until_commit()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=Id(await Add(c));var(d,line)=await Order(c);await using var session=await db.SessionAsync();await Sql.RowsAsync(session,"SELECT accounting.post_receipt_to_bank(@customer,22,'BANK_TRANSFER',@reference,NULL,'[]'::jsonb,jsonb_build_array(jsonb_build_object('orderLineId',@line,'amount',22)),@bank) AS id",default,("customer",d.Customer),("reference",Code()),("line",line),("bank",bank));var today=await Today();var path=$"/accounting/general-ledger?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}&accountId={bank}";Assert.Equal(0,D((await Get(c,path)).GetProperty("closingSigned")));Assert.Equal("BALANCED",(await Get(c,$"/accounting/trial-balance?from={today:yyyy-MM-dd}&to={today.AddDays(1):yyyy-MM-dd}")).GetProperty("status").GetString());await session.Transaction.CommitAsync();Assert.Equal(22,D((await Get(c,path)).GetProperty("closingSigned")));await Consistent(c);
 }
 [Fact] public async Task Cash_profile_classification_and_financial_identity_cannot_be_modified_by_app_SQL()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=Id(await Add(c));await using(var session=await db.SessionAsync()){var error=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"UPDATE accounting.bank_accounts SET account_number='99999' WHERE id=@id",default,("id",bank)));Assert.Equal("42501",error.SqlState);}var ex=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE accounting.accounts SET control_kind=NULL WHERE company_id=@company AND id=@id",("company",db.Company),("id",bank)));Assert.Equal("HR409",ex.SqlState);
 }

 [Fact] public async Task Legacy_directory_can_be_disabled_without_inventing_bank_details()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var legacy=(await Get(c,"/bank-accounts")).GetProperty("items")[0];var updated=await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(legacy)}",new BankAccountInput(legacy.GetProperty("code").GetString()!,"Legacy closed","LEGACY",Active:false),legacy.GetProperty("version").GetInt64()),HttpStatusCode.OK);Assert.False(updated.GetProperty("active").GetBoolean());Assert.Equal(JsonValueKind.Null,updated.GetProperty("accountNumber").ValueKind);var(d,line)=await Order(c);await Expect(await Receive(c,d,line,null),HttpStatusCode.UnprocessableEntity);Assert.Equal(0,await BankBalance(c,Id(legacy)));await Consistent(c);
 }
 [Fact] public async Task Account_deactivation_wins_a_lock_wait_without_posting_cash_or_GST()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=Id(await Add(c));var(d,line)=await Order(c);await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();await using var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true);SELECT id FROM accounting.bank_accounts WHERE company_id=@company AND id=@id FOR UPDATE",con,tx);cmd.Parameters.AddWithValue("company",db.Company);cmd.Parameters.AddWithValue("id",bank);await cmd.ExecuteNonQueryAsync();var pending=Receive(c,d,line,bank);var blocked=false;for(var n=0;n<40;n++){if(Convert.ToBoolean(await S("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE @pid=ANY(pg_blocking_pids(pid)))",("pid",con.ProcessID)))){blocked=true;break;}await Task.Delay(25);}Assert.True(blocked);cmd.CommandText="UPDATE accounting.bank_accounts SET active=false WHERE company_id=@company AND id=@id";await cmd.ExecuteNonQueryAsync();await tx.CommitAsync();await Expect(await pending,HttpStatusCode.UnprocessableEntity);Assert.Equal(0,await BankBalance(c,bank));await Consistent(c);
 }

 [Fact] public async Task Write_permission_without_read_cannot_use_mutation_to_disclose_bank_balances()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();var first=await Add(c,input);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='accounting.banks.read'",("company",db.Company));await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(first)}",input with{Name="Changed"},first.GetProperty("version").GetInt64()),HttpStatusCode.Forbidden);await Expect(await Send(c,HttpMethod.Post,"/bank-accounts",Bank()),HttpStatusCode.Forbidden);
 }

 [Fact] public async Task Holder_rename_keeps_physical_identity_and_existing_cash_journal()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var input=Bank();var bank=await Add(c,input);var(d,line)=await Order(c);var receipt=await Expect(await Receive(c,d,line,Id(bank)),HttpStatusCode.Created);var changed=await Expect(await Send(c,HttpMethod.Put,$"/bank-accounts/{Id(bank)}",input with{AccountHolder="HTT Flooring Pty Ltd"},bank.GetProperty("version").GetInt64()),HttpStatusCode.OK);Assert.Equal("HTT Flooring Pty Ltd",changed.GetProperty("accountHolder").GetString());Assert.Equal(input.AccountNumber,changed.GetProperty("accountNumber").GetString());Assert.Equal(22,await BankBalance(c,Id(bank)));Assert.Equal(Id(bank),(await Get(c,$"/customer-receipts/{Id(receipt)}")).GetProperty("bankAccountId").GetGuid());await Consistent(c);
 }

}
