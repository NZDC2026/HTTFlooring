using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Htt.Host.Api.Accounting;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class BankStatementTests:IAsyncLifetime
{
 private readonly DatabaseFixture db=new();public Task InitializeAsync()=>db.InitializeAsync();public Task DisposeAsync()=>db.DisposeAsync();
 private Task<object?> S(string sql,params(string,object)[]args)=>db.OwnerScalarAsync(sql,args);
 private async Task<DateOnly> Today()=>DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!);
 private static Guid Id(JsonElement e)=>e.GetProperty("id").GetGuid();private static Guid Sid(JsonElement e)=>Id(e.GetProperty("statement"));private static long V(JsonElement e)=>e.GetProperty("statement").GetProperty("version").GetInt64();private static Guid Line(JsonElement e,int index=0)=>Id(e.GetProperty("lines")[index]);
 private async Task<Guid> Bank(HttpClient c)=>await Create(c,"/bank-accounts",new BankAccountInput(Code(),"Statement bank","BANK","062000",Random.Shared.NextInt64(100000,9999999999).ToString(System.Globalization.CultureInfo.InvariantCulture),"HTT Flooring"));
 private sealed record Payment(Guid Supplier,Guid PaymentId,Guid Advance,Guid CashLine);
 private async Task<Payment> Pay(HttpClient c,Guid bank,decimal amount=22,DateOnly? date=null,Guid? supplier=null)
 {
  var sup=supplier??await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Bank statement supplier",null));var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{sup}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),amount,PaidOn:date,Notes:"Statement test prepayment",BankAccountId:bank)),HttpStatusCode.Created);var id=Id(p.GetProperty("payment"));var cash=(await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items").EnumerateArray().Single(x=>x.GetProperty("sourceDocumentId").GetGuid()==id).GetProperty("id").GetGuid();return new(sup,id,Id(p.GetProperty("advances")[0]),cash);
 }
 private static Task<HttpResponseMessage> Import(HttpClient c,Guid bank,BankStatementImportInput input,string? key=null)=>Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/statements/import",input,key:key);
 private async Task<BankStatementImportInput> Input(decimal[]amounts,DateOnly? date=null,decimal opening=0,string? reference=null,string? external=null)
 {
  var dt=date??await Today();return new(reference??Code(),dt,dt,opening,opening+amounts.Sum(),amounts.Select((x,i)=>new BankStatementLineInput(dt,x,"Bank merchant",Code(),external is null?Code():external+"-"+i)).ToArray());
 }
 private static Task<HttpResponseMessage> Match(HttpClient c,JsonElement statement,Guid cash,decimal amount,string? key=null,string? reference=null,int lineIndex=0)=>Send(c,HttpMethod.Post,$"/bank-statement-lines/{Line(statement,lineIndex)}/matches",new BankMatchInput(reference??Code(),"Verified cash source",[new(cash,amount)]),V(statement),key);
 private static Task<HttpResponseMessage> Reconcile(HttpClient c,JsonElement statement,IReadOnlyList<BankCashAllocationInput>? opening=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/bank-statements/{Sid(statement)}/reconcile",new BankReconcileInput(reference??Code(),"Statement balances verified",opening),V(statement),key);
 private static Task<JsonElement> View(HttpClient c,Guid id)=>Get(c,$"/bank-statements/{id}");
 private static async Task Consistent(HttpClient c)=>Assert.Equal("CONSISTENT",(await Get(c,"/accounting/reconciliation")).GetProperty("status").GetString());
 [Fact] public async Task Import_match_finalize_reopen_release_and_rematch_preserve_money_and_snapshots()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var journals=await S("SELECT count(*) FROM accounting.journal_entries WHERE company_id=@company",("company",db.Company));var statement=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var matched=await Expect(await Match(c,statement,pay.CashLine,22),HttpStatusCode.Created);var mid=Id(matched);statement=matched.GetProperty("statement");Assert.Equal("MATCHED",statement.GetProperty("lines")[0].GetProperty("status").GetString());var closed=await Expect(await Reconcile(c,statement),HttpStatusCode.Created);var rid=Id(closed);statement=closed.GetProperty("statement");Assert.Equal("RECONCILED",statement.GetProperty("statement").GetProperty("state").GetString());var snapshot=await Get(c,$"/bank-reconciliations/{rid}");Assert.Equal(-22,D(snapshot.GetProperty("reconciliation").GetProperty("bookClosing")));Assert.Empty(snapshot.GetProperty("outstanding").EnumerateArray());var reopened=await Expect(await Send(c,HttpMethod.Post,$"/bank-reconciliations/{rid}/reopen",new BankClearingChangeInput(Code(),"Correct clearing"),V(statement)),HttpStatusCode.OK);statement=reopened.GetProperty("statement");var released=await Expect(await Send(c,HttpMethod.Post,$"/bank-matches/{mid}/release",new BankClearingChangeInput(Code(),"Wrong selection"),V(statement)),HttpStatusCode.OK);statement=released.GetProperty("statement");Assert.Equal("UNMATCHED",statement.GetProperty("lines")[0].GetProperty("status").GetString());Assert.Single((await Get(c,$"/bank-reconciliations/{rid}")).GetProperty("matches").EnumerateArray());var again=await Expect(await Match(c,statement,pay.CashLine,22),HttpStatusCode.Created);await Expect(await Reconcile(c,again.GetProperty("statement")),HttpStatusCode.Created);Assert.Equal(journals,await S("SELECT count(*) FROM accounting.journal_entries WHERE company_id=@company",("company",db.Company)));await Consistent(c);
 }
 [Fact] public async Task CSV_quotes_Australian_dates_BOM_and_private_source_roundtrip_are_supported()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var csv=$"\uFEFFdate,amount,description,reference,externalId\r\n{today:dd/MM/yyyy},-22.00,\"Merchant, \"\"Sydney\"\"\nshop\",REF,EXT-1\r\n";var bytes=Encoding.UTF8.GetBytes(csv);using var request=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/bank-accounts/{bank}/statements/import-csv?reference={Code()}&fromDate={today:yyyy-MM-dd}&toDate={today:yyyy-MM-dd}&openingBalance=0&closingBalance=-22");request.Headers.Add("Idempotency-Key",Code());request.Content=new ByteArrayContent(bytes);request.Content.Headers.ContentType=new("text/csv");var result=await Expect(await c.SendAsync(request),HttpStatusCode.Created);Assert.Equal("Merchant, \"Sydney\"\nshop",result.GetProperty("lines")[0].GetProperty("description").GetString());using var source=await c.GetAsync($"/api/v1/bank-statements/{Sid(result)}/source");Assert.Equal(HttpStatusCode.OK,source.StatusCode);Assert.Equal(bytes,await source.Content.ReadAsByteArrayAsync());
 }
 [Fact] public async Task Same_file_different_keys_is_deduplicated_without_duplicate_import_audit()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22]);var a=await Expect(await Import(c,bank,input),HttpStatusCode.Created);var b=await Expect(await Import(c,bank,input),HttpStatusCode.Created);Assert.Equal(Sid(a),Sid(b));Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='accounting.bank_statement_imported'",("company",db.Company)));await Expect(await Import(c,bank,input with{Reference=Code()}),HttpStatusCode.Conflict);
 }
 [Fact] public async Task Partial_and_bulk_matches_cannot_overallocate_either_side()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var one=await Pay(c,bank,10);var two=await Pay(c,bank,12);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var first=await Expect(await Match(c,st,one.CashLine,10),HttpStatusCode.Created);st=first.GetProperty("statement");Assert.Equal("PARTIAL",st.GetProperty("lines")[0].GetProperty("status").GetString());var candidates=await Get(c,$"/bank-statement-lines/{st.GetProperty("lines")[0].GetProperty("id").GetGuid()}/candidates");Assert.True(candidates.GetProperty("items")[0].GetProperty("exactAmount").GetBoolean());await Expect(await Reconcile(c,st),HttpStatusCode.Conflict);var second=await Expect(await Match(c,st,two.CashLine,12),HttpStatusCode.Created);await Expect(await Reconcile(c,second.GetProperty("statement")),HttpStatusCode.Created);await Consistent(c);
 }
 [Fact] public async Task Opening_cleared_entries_and_historical_outstanding_are_explicit()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var cleared=await Pay(c,bank,100,today.AddDays(-2));var outstanding=await Pay(c,bank,20,today.AddDays(-1));var st=await Expect(await Import(c,bank,await Input([],today,opening:-100)),HttpStatusCode.Created);await Expect(await Reconcile(c,st),HttpStatusCode.Conflict);var closed=await Expect(await Reconcile(c,st,[new(cleared.CashLine,100)]),HttpStatusCode.Created);var snap=await Get(c,$"/bank-reconciliations/{Id(closed)}");Assert.Equal(-120,D(snap.GetProperty("reconciliation").GetProperty("bookClosing")));Assert.Equal(20,D(snap.GetProperty("reconciliation").GetProperty("outstandingPayments")));Assert.Equal(outstanding.CashLine,snap.GetProperty("outstanding")[0].GetProperty("journalLineId").GetGuid());await Consistent(c);
 }
 [Fact] public async Task Reconciled_period_blocks_backdated_cash_posting_until_reopened()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var matched=await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created);var closed=await Expect(await Reconcile(c,matched.GetProperty("statement")),HttpStatusCode.Created);var input=new SupplierPaymentInput(5,"BANK_TRANSFER",Code(),5,Notes:"New advance",BankAccountId:bank);var key=Code();await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{pay.Supplier}/payments",input,key:key),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/bank-reconciliations/{Id(closed)}/reopen",new BankClearingChangeInput(Code(),"Allow current-day corrections"),V(closed.GetProperty("statement"))),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{pay.Supplier}/payments",input,key:key),HttpStatusCode.Created);await Consistent(c);
 }
 [Fact] public async Task External_ids_prevent_overlapping_file_duplicates_and_void_releases_the_key()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22],external:"BANK-ID");var st=await Expect(await Import(c,bank,input),HttpStatusCode.Created);var duplicate=input with{Reference=Code(),Lines=input.Lines!.Select(x=>x with{Description="Different export text"}).ToArray()};await Expect(await Import(c,bank,duplicate),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/bank-statements/{Sid(st)}/void",new BankClearingChangeInput(Code(),"Incorrect import header"),V(st)),HttpStatusCode.OK);var replacement=await Expect(await Import(c,bank,duplicate),HttpStatusCode.Created);Assert.NotEqual(Sid(st),Sid(replacement));Assert.Equal("VOID",(await View(c,Sid(st))).GetProperty("statement").GetProperty("state").GetString());
 }
 [Fact] public async Task Repeated_identical_rows_without_external_ids_are_retained_and_flagged()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var st=await Expect(await Import(c,bank,new(Code(),today,today,0,-44,[new(today,-22,"Same","REF"),new(today,-22,"Same","REF")])),HttpStatusCode.Created);Assert.Equal(2,st.GetProperty("lines").GetArrayLength());Assert.All(st.GetProperty("lines").EnumerateArray(),x=>Assert.Equal(1,x.GetProperty("possibleDuplicateCount").GetInt32()));
 }
 [Theory][InlineData("SALES")][InlineData("OFFICE")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")]
 public async Task Non_finance_cannot_import_match_or_read_statement_source(string role)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var staff=await Staff(db,role);using var other=api.Authenticated(staff.Subject);await Expect(await other.GetAsync($"/api/v1/bank-statements/{Sid(st)}"),HttpStatusCode.Forbidden);await Expect(await other.GetAsync($"/api/v1/bank-statements/{Sid(st)}/source"),HttpStatusCode.Forbidden);await Expect(await Import(other,bank,await Input([-5])),HttpStatusCode.Forbidden);await Expect(await Match(other,st,Guid.NewGuid(),22),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Foreign_bank_statement_and_cash_entry_cannot_cross_company_or_account()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var different=await Bank(c);var pay=await Pay(c,different);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.NotFound);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/bank-statements/{Sid(st)}"),HttpStatusCode.NotFound);await Expect(await Import(other,bank,await Input([-22])),HttpStatusCode.NotFound);await Consistent(c);
 }
 [Fact] public async Task Same_key_concurrent_import_creates_one_statement_source_and_audit()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22]);var key=Code();var replies=await Task.WhenAll(Import(c,bank,input,key),Import(c,bank,input,key));var first=await Expect(replies[0],HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(first,await Expect(replies[1],HttpStatusCode.Created)));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND action='accounting.bank_statement_imported'",("company",db.Company)));
 }
 [Fact] public async Task Different_keys_racing_for_one_cash_entry_cannot_clear_it_twice()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var a=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var b=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var replies=await Task.WhenAll(Match(c,a,pay.CashLine,22),Match(c,b,pay.CashLine,22));Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Conflict);var cash=(await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items")[0];Assert.Equal(22,D(cash.GetProperty("reservedAmount")));await Consistent(c);
 }
 [Fact] public async Task Same_key_concurrent_match_and_reconciliation_post_once()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var key=Code();var reference=Code();var replies=await Task.WhenAll(Match(c,st,pay.CashLine,22,key,reference),Match(c,st,pay.CashLine,22,key,reference));var first=await Expect(replies[0],HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(first,await Expect(replies[1],HttpStatusCode.Created)));st=first.GetProperty("statement");key=Code();reference=Code();var closes=await Task.WhenAll(Reconcile(c,st,key:key,reference:reference),Reconcile(c,st,key:key,reference:reference));var closed=await Expect(closes[0],HttpStatusCode.Created);Assert.True(JsonElement.DeepEquals(closed,await Expect(closes[1],HttpStatusCode.Created)));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.bank_reconciliations WHERE company_id=@company",("company",db.Company)));await Consistent(c);
 }
 [Fact] public async Task Different_keys_reconcile_only_the_current_version_once()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);st=(await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");var replies=await Task.WhenAll(Reconcile(c,st),Reconcile(c,st));Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Conflict);
 }
 [Fact] public async Task Empty_statement_periods_can_be_consecutive_and_only_latest_can_reopen()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var first=await Expect(await Import(c,bank,await Input([],today.AddDays(-2))),HttpStatusCode.Created);var r1=await Expect(await Reconcile(c,first),HttpStatusCode.Created);var second=await Expect(await Import(c,bank,await Input([],today.AddDays(-1))),HttpStatusCode.Created);var r2=await Expect(await Reconcile(c,second),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/bank-reconciliations/{Id(r1)}/reopen",new BankClearingChangeInput(Code(),"Earlier period"),V(r1.GetProperty("statement"))),HttpStatusCode.Conflict);await Expect(await Send(c,HttpMethod.Post,$"/bank-reconciliations/{Id(r2)}/reopen",new BankClearingChangeInput(Code(),"Latest period"),V(r2.GetProperty("statement"))),HttpStatusCode.OK);
 }
 [Fact] public async Task Carry_forward_balance_period_gaps_and_opening_reuse_are_rejected()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var st=await Expect(await Import(c,bank,await Input([],today.AddDays(-2))),HttpStatusCode.Created);await Expect(await Reconcile(c,st),HttpStatusCode.Created);var gap=await Expect(await Import(c,bank,await Input([],today)),HttpStatusCode.Created);await Expect(await Reconcile(c,gap),HttpStatusCode.Conflict);var wrong=await Expect(await Import(c,bank,await Input([],today.AddDays(-1),opening:1)),HttpStatusCode.Created);await Expect(await Reconcile(c,wrong),HttpStatusCode.Conflict);
 }
 [Fact] public async Task One_cash_entry_can_be_split_between_statement_lines()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-10,-12])),HttpStatusCode.Created);st=(await Expect(await Match(c,st,pay.CashLine,10),HttpStatusCode.Created)).GetProperty("statement");st=(await Expect(await Match(c,st,pay.CashLine,12,lineIndex:1),HttpStatusCode.Created)).GetProperty("statement");await Expect(await Reconcile(c,st),HttpStatusCode.Created);await Consistent(c);
 }
 [Fact] public async Task Many_cash_entries_can_be_bulk_matched_to_one_deposit_line()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var a=await Pay(c,bank,10);var b=await Pay(c,bank,12);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var matched=await Expect(await Send(c,HttpMethod.Post,$"/bank-statement-lines/{Line(st)}/matches",new BankMatchInput(Code(),"Batch settlement",[new(a.CashLine,10),new(b.CashLine,12)]),V(st)),HttpStatusCode.Created);await Expect(await Reconcile(c,matched.GetProperty("statement")),HttpStatusCode.Created);await Consistent(c);
 }
 [Fact] public async Task Positive_supplier_refund_and_negative_payment_match_their_own_directions()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank,22);var refunded=await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(11,Code(),"Returned advance",AdvanceId:pay.Advance,BankAccountId:bank)),HttpStatusCode.Created);var refundCash=(await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items").EnumerateArray().Single(x=>x.GetProperty("sourceDocumentId").GetGuid()==Id(refunded.GetProperty("refund"))).GetProperty("id").GetGuid();var st=await Expect(await Import(c,bank,await Input([-22,11])),HttpStatusCode.Created);await Expect(await Match(c,st,refundCash,11),HttpStatusCode.Conflict);st=(await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");st=(await Expect(await Match(c,st,refundCash,11,lineIndex:1),HttpStatusCode.Created)).GetProperty("statement");await Expect(await Reconcile(c,st),HttpStatusCode.Created);await Consistent(c);
 }
 [Theory][InlineData(-1)][InlineData(0)][InlineData(22.001)][InlineData(23)]
 public async Task Invalid_or_excessive_match_amount_does_not_reserve_cash(decimal amount)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var res=await Match(c,st,pay.CashLine,amount);Assert.True(res.StatusCode is HttpStatusCode.UnprocessableEntity or HttpStatusCode.Conflict);Assert.Equal(0,D((await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items")[0].GetProperty("reservedAmount")));Assert.Equal(1,V(await View(c,Sid(st))));
 }
 [Theory][InlineData("date,amount,description\n2026-01-01,12.999,Row")][InlineData("date,amount,description\n2026-01-01,12,\"unclosed")][InlineData("date,amount,amount\n2026-01-01,12,Row")][InlineData("date,amount,description\n01/31/2026,12,Row")]
 public async Task Malformed_CSV_is_rejected_without_persisting_rows(string csv)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();using var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/bank-accounts/{bank}/statements/import-csv?reference={Code()}&fromDate={today:yyyy-MM-dd}&toDate={today:yyyy-MM-dd}&openingBalance=0&closingBalance=12");req.Headers.Add("Idempotency-Key",Code());req.Content=new StringContent(csv,Encoding.UTF8,"text/csv");await Expect(await c.SendAsync(req),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));
 }
 [Theory][InlineData(1)][InlineData(2)]
 public async Task Unbalanced_header_or_out_of_period_rows_are_atomic(int mode)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22]);input=mode==1?input with{ClosingBalance=-21}:input with{Lines=[input.Lines![0] with{Date=input.ToDate.AddDays(1)}]};await Expect(await Import(c,bank,input),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));
 }
 [Fact] public async Task Revoked_read_or_command_permission_blocks_successful_key_replay()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22]);var key=Code();await Expect(await Import(c,bank,input,key),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code='accounting.bank_statements.read'",("company",db.Company));await Expect(await Import(c,bank,input,key),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Late_import_audit_failure_rolls_back_source_external_keys_and_idempotency()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([-22]);var key=Code();await S($"CREATE FUNCTION accounting.test_statement_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='{db.Company}'::uuid AND NEW.action='accounting.bank_statement_imported' THEN RAISE EXCEPTION 'Injected audit failure' USING ERRCODE='HR422';END IF;RETURN NEW;END $$;CREATE TRIGGER test_statement_audit_failure BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION accounting.test_statement_audit_failure()");try{await Expect(await Import(c,bank,input,key),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_external_keys WHERE company_id=@company",("company",db.Company)));}finally{await S("DROP TRIGGER test_statement_audit_failure ON platform.audit_events;DROP FUNCTION accounting.test_statement_audit_failure()");}await Expect(await Import(c,bank,input,key),HttpStatusCode.Created);
 }

 [Fact] public async Task Reopened_period_new_cash_does_not_rewrite_the_old_outstanding_snapshot()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);st=(await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");var closed=await Expect(await Reconcile(c,st),HttpStatusCode.Created);var rid=Id(closed);var opened=await Expect(await Send(c,HttpMethod.Post,$"/bank-reconciliations/{rid}/reopen",new BankClearingChangeInput(Code(),"New cash correction"),V(closed.GetProperty("statement"))),HttpStatusCode.OK);var extra=await Pay(c,bank,5,supplier:pay.Supplier);var reclosed=await Expect(await Reconcile(c,opened.GetProperty("statement")),HttpStatusCode.Created);var old=await Get(c,$"/bank-reconciliations/{rid}");var current=await Get(c,$"/bank-reconciliations/{Id(reclosed)}");Assert.Equal(-22,D(old.GetProperty("reconciliation").GetProperty("bookClosing")));Assert.Empty(old.GetProperty("outstanding").EnumerateArray());Assert.Equal(-27,D(current.GetProperty("reconciliation").GetProperty("bookClosing")));Assert.Equal(extra.CashLine,current.GetProperty("outstanding")[0].GetProperty("journalLineId").GetGuid());await Consistent(c);
 }
 [Fact] public async Task Prior_period_outstanding_payment_can_clear_in_the_next_statement()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var pay=await Pay(c,bank,22,today.AddDays(-1));var first=await Expect(await Import(c,bank,await Input([],today.AddDays(-1))),HttpStatusCode.Created);var r1=await Expect(await Reconcile(c,first),HttpStatusCode.Created);var second=await Expect(await Import(c,bank,await Input([-22],today)),HttpStatusCode.Created);second=(await Expect(await Match(c,second,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");var r2=await Expect(await Reconcile(c,second),HttpStatusCode.Created);Assert.Single((await Get(c,$"/bank-reconciliations/{Id(r1)}")).GetProperty("outstanding").EnumerateArray());Assert.Empty((await Get(c,$"/bank-reconciliations/{Id(r2)}")).GetProperty("outstanding").EnumerateArray());await Consistent(c);
 }
 [Fact] public async Task Book_entry_after_statement_end_is_not_a_match_candidate()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22],(await Today()).AddDays(-1))),HttpStatusCode.Created);Assert.Empty((await Get(c,$"/bank-statement-lines/{Line(st)}/candidates")).GetProperty("items").EnumerateArray());await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Conflict);
 }
 [Theory][InlineData("accounting.bank_statements.read")][InlineData("accounting.banks.read")][InlineData("accounting.ledger.read")][InlineData("accounting.bank_statements.match")]
 public async Task Cached_match_rechecks_each_relevant_financial_permission(string permission)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var key=Code();var reference=Code();await Expect(await Match(c,st,pay.CashLine,22,key,reference),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission",("company",db.Company),("permission",permission));await Expect(await Match(c,st,pay.CashLine,22,key,reference),HttpStatusCode.Forbidden);
 }
 [Fact] public async Task Same_key_reopen_and_release_have_single_immutable_facts()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);var matched=await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created);var mid=Id(matched);var closed=await Expect(await Reconcile(c,matched.GetProperty("statement")),HttpStatusCode.Created);var input=new BankClearingChangeInput(Code(),"Fix match");var key=Code();var replies=await Task.WhenAll(Send(c,HttpMethod.Post,$"/bank-reconciliations/{Id(closed)}/reopen",input,V(closed.GetProperty("statement")),key),Send(c,HttpMethod.Post,$"/bank-reconciliations/{Id(closed)}/reopen",input,V(closed.GetProperty("statement")),key));var opened=await Expect(replies[0],HttpStatusCode.OK);Assert.True(JsonElement.DeepEquals(opened,await Expect(replies[1],HttpStatusCode.OK)));input=new(Code(),"Release match");key=Code();var releases=await Task.WhenAll(Send(c,HttpMethod.Post,$"/bank-matches/{mid}/release",input,V(opened.GetProperty("statement")),key),Send(c,HttpMethod.Post,$"/bank-matches/{mid}/release",input,V(opened.GetProperty("statement")),key));var released=await Expect(releases[0],HttpStatusCode.OK);Assert.True(JsonElement.DeepEquals(released,await Expect(releases[1],HttpStatusCode.OK)));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.bank_match_releases WHERE company_id=@company",("company",db.Company)));Assert.Equal(1L,await S("SELECT count(*) FROM accounting.bank_reconciliation_reopens WHERE company_id=@company",("company",db.Company)));
 }
 [Fact] public async Task Maximum_5000_row_import_is_atomic_and_paginated()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var rows=Enumerable.Range(0,5000).Select(n=>new BankStatementLineInput(today,-.01m,"Card merchant","ROW-"+n,"EXT-"+n)).ToArray();var st=await Expect(await Import(c,bank,new(Code(),today,today,0,-50,rows)),HttpStatusCode.Created);Assert.Equal(5000,st.GetProperty("statement").GetProperty("lineCount").GetInt32());Assert.Equal(25,st.GetProperty("lines").GetArrayLength());Assert.Equal(5000,st.GetProperty("unmatchedCount").GetInt32());Assert.Equal(5000L,await S("SELECT count(*) FROM accounting.bank_external_keys WHERE company_id=@company",("company",db.Company)));var page=await Get(c,$"/bank-statements/{Sid(st)}?page=50&pageSize=100");Assert.Equal(5000,page.GetProperty("lines")[99].GetProperty("lineNo").GetInt32());
 }
 [Fact] public async Task Oversized_and_invalid_UTF8_CSV_are_rejected_before_persistence()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();foreach(var size in new[]{1,2*1024*1024+1}){using var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/bank-accounts/{bank}/statements/import-csv?reference={Code()}&fromDate={today:yyyy-MM-dd}&toDate={today:yyyy-MM-dd}&openingBalance=0&closingBalance=0");req.Headers.Add("Idempotency-Key",Code());req.Content=new ByteArrayContent(Enumerable.Repeat((byte)255,size).ToArray());req.Content.Headers.ContentType=new("text/csv");await Expect(await c.SendAsync(req),size==1?HttpStatusCode.UnprocessableEntity:HttpStatusCode.RequestEntityTooLarge);}Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));
 }
 [Fact] public async Task Inactive_bank_can_finish_historical_reconciliation_without_new_money()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);await S("UPDATE accounting.bank_accounts SET active=false WHERE company_id=@company AND id=@id",("company",db.Company),("id",bank));var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);st=(await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");await Expect(await Reconcile(c,st),HttpStatusCode.Created);await Consistent(c);
 }
 [Fact] public async Task Application_SQL_cannot_mutate_imported_rows_or_old_snapshots()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);await using(var session=await db.SessionAsync()){var ex=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"UPDATE accounting.bank_statement_lines SET amount=-21 WHERE id=@id",default,("id",Line(st))));Assert.Equal("42501",ex.SqlState);}await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE accounting.bank_statement_lines SET description='Changed' WHERE company_id=@company AND id=@id",("company",db.Company),("id",Line(st))));Assert.Equal(-22,D((await View(c,Sid(st))).GetProperty("lines")[0].GetProperty("amount")));
 }
 [Theory][InlineData(true)][InlineData(false)]
 public async Task Concurrent_cash_posting_and_finalize_serialize_before_the_closed_date_watermark(bool cashFirst)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var pay=await Pay(c,bank);var st=await Expect(await Import(c,bank,await Input([-22])),HttpStatusCode.Created);st=(await Expect(await Match(c,st,pay.CashLine,22),HttpStatusCode.Created)).GetProperty("statement");await using var con=new NpgsqlConnection(db.Owner);await con.OpenAsync();await using var tx=await con.BeginTransactionAsync();await using var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true);SELECT accounting.lock_bank_reconciliation(@bank)",con,tx);cmd.Parameters.AddWithValue("company",db.Company);cmd.Parameters.AddWithValue("bank",bank);await cmd.ExecuteNonQueryAsync();
  async Task Blocked(int n){var ready=false;for(var retry=0;retry<50;retry++){if(Convert.ToInt32(await S("SELECT count(*) FROM pg_stat_activity WHERE @pid=ANY(pg_blocking_pids(pid))",("pid",con.ProcessID)))>=n){ready=true;break;}await Task.Delay(20);}Assert.True(ready,"Both commands must queue behind the same bank reconciliation lock.");}
  Task<HttpResponseMessage> Post()=>Send(c,HttpMethod.Post,$"/suppliers/{pay.Supplier}/payments",new SupplierPaymentInput(5,"BANK_TRANSFER",Code(),5,Notes:"Concurrent cash",BankAccountId:bank));Task<HttpResponseMessage> money;Task<HttpResponseMessage> reconcile;
  if(cashFirst){money=Post();await Blocked(1);reconcile=Reconcile(c,st);}else{reconcile=Reconcile(c,st);await Blocked(1);money=Post();}await Blocked(2);await tx.CommitAsync();var closed=await Expect(await reconcile,HttpStatusCode.Created);await Expect(await money,cashFirst?HttpStatusCode.Created:HttpStatusCode.Conflict);var snap=await Get(c,$"/bank-reconciliations/{Id(closed)}");Assert.Equal(cashFirst?-27:-22,D(snap.GetProperty("reconciliation").GetProperty("bookClosing")));Assert.Equal(cashFirst?5:0,D(snap.GetProperty("reconciliation").GetProperty("outstandingPayments")));await Consistent(c);
 }

 [Theory][InlineData("openingBalance",false)][InlineData("closingBalance",false)][InlineData("openingBalance",true)][InlineData("closingBalance",true)]
 public async Task Statement_balances_must_be_explicit_numbers_even_for_zero_activity(string field,bool explicitNull)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=await Input([]);var node=JsonSerializer.SerializeToNode(input,new JsonSerializerOptions(JsonSerializerDefaults.Web))!.AsObject();if(explicitNull)node[field]=null;else node.Remove(field);await Expect(await Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/statements/import",node),HttpStatusCode.BadRequest);Assert.Equal(0L,await S("SELECT count(*) FROM accounting.bank_statements WHERE company_id=@company",("company",db.Company)));
 }

}
