using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using System.Text;
using Htt.Host.Api.Accounting;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Htt.Infrastructure.BankFeeds;
using Npgsql;
using NpgsqlTypes;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class BankFeedTests:IAsyncLifetime
{
 readonly DatabaseFixture db=new();public async Task InitializeAsync(){await db.InitializeAsync();await S("UPDATE bankfeeds.jobs SET state='CANCELLED',lease_token=NULL,lease_until=NULL WHERE state IN('PENDING','PROCESSING','RETRY','UNKNOWN');UPDATE bankfeeds.connections SET auto_sync=false");}public Task DisposeAsync()=>db.DisposeAsync();
 Task<object?> S(string sql,params(string,object)[] a)=>db.OwnerScalarAsync(sql,a);
 static Guid Id(JsonElement e)=>e.GetProperty("id").GetGuid();
 async Task<DateOnly> Today()=>DateOnly.Parse((string)(await S("SELECT ((now()AT TIME ZONE timezone)::date)::text FROM core.companies WHERE id=@c",("c",db.Company)))!);
 async Task<Guid> Bank(HttpClient c)=>await Create(c,"/bank-accounts",new BankAccountInput(Code(),"Feed bank","BANK","062000",Random.Shared.NextInt64(10000000,99999999).ToString(),"HTT"));
 async Task<Guid> Connect(HttpClient c,Guid bank,bool auto=false,DateOnly? start=null,string? key=null)=>Id(await Expect(await Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/feed-connections",new BankFeedConnectInput(Code(),start??await Today(),auto),key:key),HttpStatusCode.Created));
 Task<JsonElement> View(HttpClient c,Guid feed)=>Get(c,$"/bank-feed-connections/{feed}");
 async Task<Guid> Queue(HttpClient c,Guid feed,string kind,string? key=null)=>Id(await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/{kind}",version:(await View(c,feed)).GetProperty("version").GetInt64(),key:key),HttpStatusCode.Accepted));
 async Task<object> Consent(Guid bank)=>new{companyId=db.Company,bankAccountId=bank,environment="SANDBOX",consentStatus="ACTIVE",consentExpiresAt=DateTimeOffset.UtcNow.AddDays(20),accountFingerprint=await S("SELECT encode(sha256(convert_to(bsb||':'||account_number,'UTF8')),'hex')FROM accounting.bank_accounts WHERE company_id=@c AND id=@b",("c",db.Company),("b",bank)),remoteAccountId="remote-bank"};
 async Task<JsonObject> Batch(Guid bank,DateOnly date,string batch="batch-1",string cursor="cursor-1",decimal opening=0,decimal amount=-22,string external="bank-tx-1")
 {var o=JsonSerializer.SerializeToNode(await Consent(bank))!.AsObject();o["nextCursor"]=cursor;o["batchId"]=batch;o["statement"]=JsonSerializer.SerializeToNode(new{fromDate=date,toDate=date,openingBalance=opening,closingBalance=opening+amount,lines=new[]{new{date,amount,description="Bank booked item",reference="bank-reference",externalId=external,status="BOOKED"}}});return o;}
 sealed class Gateway(Func<JsonElement,Task<JsonElement>> f):IBankFeedGateway{public List<JsonElement> Requests{get;}=[];public async Task<JsonElement> ExecuteAsync(JsonElement request,CancellationToken ct){Requests.Add(request.Clone());return await f(request);}}
 async Task<bool> Work(object result)
 {await using var source=NpgsqlDataSource.Create(db.Worker);var gateway=new Gateway(_=>Task.FromResult(JsonSerializer.SerializeToElement(result)));return await new BankFeedWorker(source,gateway).ProcessOneAsync();}
 async Task<Gateway> Fail(FeedFailure failure)
 {await using var source=NpgsqlDataSource.Create(db.Worker);var g=new Gateway(_=>throw new BankFeedException("sandbox_failure",failure));Assert.True(await new BankFeedWorker(source,g).ProcessOneAsync());return g;}
 async Task<Guid> Active(HttpClient c,Guid bank,bool auto=false,DateOnly? start=null){var id=await Connect(c,bank,auto,start);Assert.True(await Work(await Consent(bank)));Assert.Equal("ACTIVE",(await View(c,id)).GetProperty("state").GetString());return id;}
 async Task<(Guid Id,Guid Lease)> Claim()
 {await using var con=new NpgsqlConnection(db.Worker);await con.OpenAsync();await using var cmd=new NpgsqlCommand("SELECT job_id,lease FROM bankfeeds.claim()",con);await using var rd=await cmd.ExecuteReaderAsync();Assert.True(await rd.ReadAsync());return(rd.GetGuid(0),rd.GetGuid(1));}
 async Task<bool> Finish((Guid Id,Guid Lease) j,object result)
 {await using var con=new NpgsqlConnection(db.Worker);await con.OpenAsync();await using var cmd=new NpgsqlCommand("SELECT bankfeeds.finish(@id,@lease,'SUCCEEDED',NULL,@data)",con);cmd.Parameters.AddWithValue("id",j.Id);cmd.Parameters.AddWithValue("lease",j.Lease);cmd.Parameters.AddWithValue("data",NpgsqlDbType.Jsonb,JsonSerializer.Serialize(result));return(bool)(await cmd.ExecuteScalarAsync())!;}
 [Fact]public async Task Verify_then_sync_creates_only_bank_evidence_and_reuses_existing_match_and_reconciliation()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);var today=await Today();
  var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Feed payment supplier",null));await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{supplier}/payments",new SupplierPaymentInput(22,"BANK_TRANSFER",Code(),22,Notes:"Feed test prepayment",BankAccountId:bank)),HttpStatusCode.Created);
  var before=await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company));var job=await Queue(c,feed,"sync");Assert.True(await Work(await Batch(bank,today)));
  var status=await View(c,feed);Assert.False(status.GetProperty("liveConnection").GetBoolean());var done=status.GetProperty("jobs").EnumerateArray().Single(x=>Id(x)==job);Assert.Equal("SUCCEEDED",done.GetProperty("state").GetString());var sid=done.GetProperty("statementId").GetGuid();
  var statement=await Get(c,$"/bank-statements/{sid}");var line=Id(statement.GetProperty("lines")[0]);var cash=Id((await Get(c,$"/bank-accounts/{bank}/cash-clearing")).GetProperty("items")[0]);
  Assert.Equal(before,await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company)));
  await Expect(await Send(c,HttpMethod.Post,$"/bank-statement-lines/{line}/matches",new BankMatchInput(Code(),"Verified feed item",[new(cash,22)]),1),HttpStatusCode.Created);
  var version=(await Get(c,$"/bank-statements/{sid}")).GetProperty("statement").GetProperty("version").GetInt64();
  await Expect(await Send(c,HttpMethod.Post,$"/bank-statements/{sid}/reconcile",new BankReconcileInput(Code(),"Feed balance verified"),version),HttpStatusCode.Created);
  await FinancialReportAssertions.Check(c);Assert.Equal("CONSISTENT",(await Get(c,"/accounting/reconciliation")).GetProperty("status").GetString());
  var hub=(await Get(c,"/workbench/banks")).GetProperty("data");Assert.Equal("SANDBOX_ONLY",hub.GetProperty("feeds").GetProperty("status").GetString());Assert.False(hub.GetProperty("feeds").GetProperty("liveConnection").GetBoolean());
  var history=await Get(c,$"/bank-feed-connections/{feed}/jobs?pageSize=1");Assert.Equal(2,history.GetProperty("totalCount").GetInt32());Assert.Single(history.GetProperty("items").EnumerateArray());
  var text=status.GetRawText();Assert.DoesNotContain("grantReference",text);Assert.DoesNotContain("accountFingerprint",text);Assert.DoesNotContain("cursor-1",text);
 }
 [Fact]public async Task Same_batch_and_old_completion_do_not_duplicate_lines_or_advance_balances_twice()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);var batch=await Batch(bank,await Today());await Queue(c,feed,"sync");var lease=await Claim();Assert.True(await Finish(lease,batch));Assert.False(await Finish(lease,batch));
  await Queue(c,feed,"sync");batch["nextCursor"]="cursor-2";Assert.True(await Work(batch));Assert.Equal(1L,await S("SELECT count(*)FROM accounting.bank_statement_lines WHERE company_id=@c",("c",db.Company)));
  Assert.Equal(1L,await S("SELECT count(*)FROM bankfeeds.batches WHERE company_id=@c",("c",db.Company)));
 }
 [Theory][InlineData("balance")][InlineData("pending")][InlineData("external")][InlineData("gap")][InlineData("account")][InlineData("environment")][InlineData("cursor")][InlineData("date")][InlineData("infinite_expiry")][InlineData("timezone_expiry")]
 public async Task Invalid_provider_batch_is_atomic_and_keeps_cursor_unchanged(string kind)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");var b=await Batch(bank,await Today());
  switch(kind){case"balance":b["statement"]!["closingBalance"]=9;break;case"pending":b["statement"]!["lines"]![0]!["status"]="PENDING";break;case"external":b["statement"]!["lines"]![0]!["externalId"]=null;break;case"gap":b["statement"]!["fromDate"]=(await Today()).AddDays(-1).ToString("yyyy-MM-dd");break;case"account":b["accountFingerprint"]=new string('a',64);break;case"environment":b["environment"]="LIVE";break;case"cursor":b["nextCursor"]="";break;case"date":b["statement"]!["toDate"]="bad-date";break;case"infinite_expiry":b["consentExpiresAt"]="infinity";break;case"timezone_expiry":b["consentExpiresAt"]="2099-01-01T00:00:00";break;}
  Assert.True(await Work(b));Assert.Equal("FAILED",(await View(c,feed)).GetProperty("jobs")[0].GetProperty("state").GetString());Assert.Equal(0L,await S("SELECT count(*)FROM accounting.bank_statements WHERE company_id=@c",("c",db.Company)));Assert.Equal("",await S("SELECT cursor FROM bankfeeds.connections WHERE id=@id",("id",feed)));
 }
 [Theory][InlineData("PENDING")][InlineData("EXPIRED")][InlineData("REVOKED")]
 public async Task Consent_not_active_never_enables_sync(string state)
 {await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Connect(c,bank);var result=JsonSerializer.SerializeToNode(await Consent(bank))!;result["consentStatus"]=state;await Work(result);Assert.NotEqual("ACTIVE",(await View(c,feed)).GetProperty("state").GetString());await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/sync",version:(await View(c,feed)).GetProperty("version").GetInt64()),HttpStatusCode.Conflict);}
 [Fact]public async Task Expiry_and_bank_identity_changes_are_rechecked_before_network_call()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");await S("UPDATE bankfeeds.connections SET consent_expires_at=now()-interval '1 second'WHERE id=@id",("id",feed));
  var called=await Fail(FeedFailure.Retry);Assert.Empty(called.Requests);Assert.Equal("EXPIRED",(await View(c,feed)).GetProperty("state").GetString());
 }
 [Theory][InlineData("accounting.bank_feeds.sync")][InlineData("accounting.bank_statements.import")][InlineData("accounting.ledger.read")]
 public async Task Revoked_underlying_authority_prevents_queued_import(string permission)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code=@p",("c",db.Company),("p",permission));var g=await Fail(FeedFailure.Retry);Assert.Empty(g.Requests);Assert.Equal(0L,await S("SELECT count(*)FROM accounting.bank_statements WHERE company_id=@c",("c",db.Company)));
 }
 [Fact]public async Task Permission_revocation_during_provider_call_is_rechecked_at_commit()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");var lease=await Claim();await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='accounting.bank_statements.import'",("c",db.Company));Assert.True(await Finish(lease,await Batch(bank,await Today())));Assert.Equal(0L,await S("SELECT count(*)FROM accounting.bank_statements WHERE company_id=@c",("c",db.Company)));
 }
 [Fact]public async Task Revocation_fences_inflight_sync_before_remote_call_and_unknown_requires_acknowledged_retry()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");var old=await Claim();var revoke=await Queue(c,feed,"revoke");Assert.False(await Finish(old,await Batch(bank,await Today())));await Fail(FeedFailure.Unknown);var view=await View(c,feed);Assert.Equal("REVOKING",view.GetProperty("state").GetString());
  await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='accounting.bank_statements.import'",("c",db.Company));var v=view.GetProperty("version").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/retry",new BankFeedRetryInput(revoke,"Review remote result"),v),HttpStatusCode.Conflict);
  await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/retry",new BankFeedRetryInput(revoke,"Gateway idempotency reviewed",true),v),HttpStatusCode.Accepted);await Work(new{environment="SANDBOX",revoked=true});Assert.Equal("REVOKED",(await View(c,feed)).GetProperty("state").GetString());
 }
 [Fact]public async Task Expired_revoke_lease_is_unknown_and_is_never_automatically_sent_twice()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);var job=await Queue(c,feed,"revoke");var lease=await Claim();await S("UPDATE bankfeeds.jobs SET lease_until=now()-interval '1 second'WHERE id=@id",("id",job));Assert.False(await Work(new{environment="SANDBOX",revoked=true}));Assert.False(await Finish(lease,new{environment="SANDBOX",revoked=true}));Assert.Equal("UNKNOWN",(await View(c,feed)).GetProperty("jobs")[0].GetProperty("state").GetString());
 }
 [Fact]public async Task Retry_backoff_is_bounded_and_failed_jobs_need_operator_review()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Connect(c,bank);for(int n=0;n<5;n++){await Fail(FeedFailure.Retry);if(n<4)await S("UPDATE bankfeeds.jobs SET available_at=now()WHERE connection_id=@id",("id",feed));}
  Assert.Equal("FAILED",(await View(c,feed)).GetProperty("jobs")[0].GetProperty("state").GetString());Assert.False(await Work(await Consent(bank)));
 }
 [Fact]public async Task Automatic_sync_schedules_one_due_job_and_does_not_auto_book()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank,true);await S("UPDATE bankfeeds.connections SET next_sync_at=now()-interval '1 second'WHERE id=@id",("id",feed));Assert.True(await Work(await Batch(bank,await Today())));Assert.False(await Work(await Batch(bank,await Today())));Assert.Equal(0L,await S("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company)));
 }
 [Fact]public async Task Concurrent_connection_creation_and_sync_requests_have_one_winner_and_idempotent_replay()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var input=new BankFeedConnectInput(Code(),await Today());var key=Code();var all=await Task.WhenAll(Enumerable.Range(0,3).Select(_=>Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/feed-connections",input,key:key)));var ids=new List<Guid>();foreach(var x in all)ids.Add(Id(await Expect(x,HttpStatusCode.Created)));Assert.Single(ids.Distinct());var feed=ids[0];await Work(await Consent(bank));var version=(await View(c,feed)).GetProperty("version").GetInt64();var sync=await Task.WhenAll(Enumerable.Range(0,2).Select(_=>Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/sync",version:version)));Assert.Equal(1,sync.Count(x=>x.StatusCode==HttpStatusCode.Accepted));Assert.Equal(1,sync.Count(x=>x.StatusCode==HttpStatusCode.Conflict));
 }
 [Fact]public async Task Tenant_roles_and_cached_replay_never_bypass_current_permission()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/bank-feed-connections/{feed}"),HttpStatusCode.NotFound);var sales=await Staff(db,"SALES");using var user=api.Authenticated(sales.Subject);await Expect(await user.GetAsync($"/api/v1/bank-feed-connections/{feed}"),HttpStatusCode.Forbidden);
  var key=Code();var v=(await View(c,feed)).GetProperty("version").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/sync",version:v,key:key),HttpStatusCode.Accepted);await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='accounting.bank_statements.import'",("c",db.Company));await Expect(await Send(c,HttpMethod.Post,$"/bank-feed-connections/{feed}/sync",version:v,key:key),HttpStatusCode.Forbidden);
 }
 [Theory][InlineData("htt_app","bankfeeds.claim()")][InlineData("htt_app","bankfeeds.finish(uuid,uuid,text,text,jsonb)")][InlineData("htt_portal","bankfeeds.view_connection(uuid)")][InlineData("htt_worker","bankfeeds.command(uuid,bigint,text,uuid,boolean,text)")]
 public async Task Database_roles_cannot_cross_gateway_boundaries(string role,string fn)
 {Assert.False((bool)(await S("SELECT has_function_privilege(@role,@fn,'EXECUTE')",("role",role),("fn",fn)))!);}
 [Fact]public async Task Manual_overlap_is_rejected_but_matching_and_reconciliation_remain_available()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");await Work(await Batch(bank,await Today()));var today=await Today();await Expect(await Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/statements/import",new BankStatementImportInput(Code(),today,today,0,-22,[new(today,-22,"same interval","ref",Code())])),HttpStatusCode.Conflict);
 }
 [Fact]public async Task Consecutive_windows_chain_actual_balances_and_changed_old_batch_is_not_silently_replaced()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var today=await Today();var feed=await Active(c,bank,start:today.AddDays(-1));var first=await Batch(bank,today.AddDays(-1));await Queue(c,feed,"sync");await Work(first);await Queue(c,feed,"sync");await Work(await Batch(bank,today,"batch-2","cursor-2",-22,-11,"bank-tx-2"));Assert.Equal(2L,await S("SELECT count(*)FROM accounting.bank_statements WHERE company_id=@c",("c",db.Company)));
  first["statement"]!["lines"]![0]!["description"]="changed source";first["nextCursor"]="cursor-3";await Queue(c,feed,"sync");await Work(first);Assert.Equal("FAILED",(await View(c,feed)).GetProperty("jobs")[0].GetProperty("state").GetString());Assert.Equal("cursor-2",await S("SELECT cursor FROM bankfeeds.connections WHERE id=@id",("id",feed)));
 }

 [Fact]public async Task Two_workers_claim_only_one_job_and_read_lease_recovery_fences_the_old_worker()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Connect(c,bank);var first=await Claim();Assert.False(await Work(await Consent(bank)));
  await S("UPDATE bankfeeds.jobs SET lease_until=now()-interval '1 second'WHERE id=@id",("id",first.Id));var second=await Claim();Assert.Equal(first.Id,second.Id);Assert.NotEqual(first.Lease,second.Lease);Assert.False(await Finish(first,await Consent(bank)));Assert.True(await Finish(second,await Consent(bank)));Assert.Equal("ACTIVE",(await View(c,feed)).GetProperty("state").GetString());
 }
 [Fact]public async Task Revocation_completes_even_if_the_requester_loses_import_permission_after_request()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"revoke");await S("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='accounting.bank_statements.import'",("c",db.Company));await Work(new{environment="SANDBOX",revoked=true});Assert.Equal("REVOKED",(await View(c,feed)).GetProperty("state").GetString());
 }
 [Fact]public async Task Bank_binding_edit_after_request_never_calls_provider_for_the_changed_account()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");await S("UPDATE accounting.bank_accounts SET account_number='987654321'WHERE company_id=@c AND id=@b",("c",db.Company),("b",bank));var g=await Fail(FeedFailure.Retry);Assert.Empty(g.Requests);
 }
 [Fact]public async Task Tenant_binding_in_provider_result_is_verified_before_activation()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Connect(c,bank);var response=JsonSerializer.SerializeToNode(await Consent(bank))!;response["companyId"]=db.OtherCompany;await Work(response);Assert.Equal("PENDING",(await View(c,feed)).GetProperty("state").GetString());Assert.Equal("FAILED",(await View(c,feed)).GetProperty("jobs")[0].GetProperty("state").GetString());
 }
 [Fact]public async Task Duplicate_transaction_id_rolls_back_the_whole_batch_and_cursor()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");var b=await Batch(bank,await Today());var lines=b["statement"]!["lines"]!.AsArray();lines.Add(lines[0]!.DeepClone());b["statement"]!["closingBalance"]=-44;await Work(b);Assert.Equal(0L,await S("SELECT count(*)FROM accounting.bank_statement_lines WHERE company_id=@c",("c",db.Company)));Assert.Equal("",await S("SELECT cursor FROM bankfeeds.connections WHERE id=@id",("id",feed)));
 }
 [Fact]public async Task Empty_heartbeat_refreshes_consent_without_fabricating_a_statement_or_balance()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=await Bank(c);var feed=await Active(c,bank);await Queue(c,feed,"sync");var b=JsonSerializer.SerializeToNode(await Consent(bank))!;b["nextCursor"]="heartbeat-1";await Work(b);Assert.Equal(0L,await S("SELECT count(*)FROM accounting.bank_statements WHERE company_id=@c",("c",db.Company)));Assert.Equal("heartbeat-1",await S("SELECT cursor FROM bankfeeds.connections WHERE id=@id",("id",feed)));
 }
 [Fact]public async Task Raw_app_sql_cannot_read_grant_handles_or_write_feed_state()
 {
  await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,"SELECT grant_reference FROM bankfeeds.connections",default));Assert.Equal("42501",e.SqlState);
 }
 [Theory][InlineData("BANK","short")][InlineData("CASH","valid-grant-handle")]
 public async Task Invalid_grant_or_non_bank_account_is_rejected(string kind,string grant)
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();var bank=kind=="BANK"?await Bank(c):await Create(c,"/bank-accounts",new BankAccountInput(Code(),"Cash box","CASH"));await Expect(await Send(c,HttpMethod.Post,$"/bank-accounts/{bank}/feed-connections",new BankFeedConnectInput(grant,await Today())),kind=="CASH"?HttpStatusCode.NotFound:HttpStatusCode.UnprocessableEntity);
 }
}
