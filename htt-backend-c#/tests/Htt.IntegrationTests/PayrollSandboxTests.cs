using System.Net;
using System.Text.Json;
using Htt.Host.Api;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;
namespace Htt.IntegrationTests;
public sealed class PayrollSandboxTests:IAsyncLifetime
{
 readonly DatabaseFixture db=new();public Task InitializeAsync()=>db.InitializeAsync();public Task DisposeAsync()=>db.DisposeAsync();
 static JsonElement E(object x)=>JsonSerializer.SerializeToElement(x);
 static Guid Id(JsonElement x)=>x.GetProperty("id").GetGuid();static long V(JsonElement x)=>x.GetProperty("version").GetInt64();
 Task<JsonElement> New(HttpClient c,string kind,object body,string? key=null)=>Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput(kind,E(body)),key:key),HttpStatusCode.Created);
 static async Task<JsonElement> Expect(Task<HttpResponseMessage> t,HttpStatusCode status)=>await SalesFlowSupport.Expect(await t,status);
 Task<JsonElement> Act(HttpClient c,JsonElement r,string action,HttpStatusCode status=HttpStatusCode.OK,string? key=null)=>Expect(Send(c,HttpMethod.Post,$"/payroll/records/{Id(r)}/{action}",version:V(r),key:key),status);
 async Task<JsonElement> Employee(HttpClient c)=>await New(c,"EMPLOYEE",new{code=Code(),name="Sandbox employee",employmentType="FULL_TIME",startDate="2026-01-01"});
 async Task<JsonElement> Sheet(HttpClient c)=>await New(c,"TIMESHEET",new{employeeId=Id(await Employee(c)),date="2026-10-01",minutes=480,category="ORDINARY"});
 async Task<HttpClient> Reviewer(TestApi api){var user=await Staff(db,"ADMIN");return api.Authenticated(user.Subject);}
 async Task<JsonElement> Ready(HttpClient c,HttpClient reviewer)
 {
  await New(c,"SETTINGS",new{provider="SANDBOX",rulesVersion="fixture-v1-NOT-STATUTORY",fixtureHourlyCents=3000,fixturePaygCents=1000,fixtureSuperCents=2000});
  var t=await Act(c,await Sheet(c),"submit");t=await Act(reviewer,t,"approve");
  var run=await New(c,"RUN",new{from="2026-10-01",to="2026-10-07",payDate="2026-10-08",timesheetIds=new[]{Id(t)}});
  return await Act(c,run,"calculate");
 }
 [Fact]public async Task Sandbox_lifecycle_freezes_snapshots_and_never_posts_or_pays_or_lodges()
 {
  await using var api=new TestApi(db);using var c=api.Authenticated();using var reviewer=await Reviewer(api);
  var run=await Ready(c,reviewer);var result=run.GetProperty("body").GetProperty("results")[0];Assert.Equal(24000,result.GetProperty("grossCents").GetInt64());Assert.Equal(23000,result.GetProperty("netCents").GetInt64());
  run=await Act(reviewer,run,"approve");run=await Act(c,run,"lock");run=await Act(c,run,"stp_preview");Assert.Equal("SANDBOX_ACKNOWLEDGED",run.GetProperty("state").GetString());Assert.False(run.GetProperty("atoLodged").GetBoolean());Assert.False(run.GetProperty("paid").GetBoolean());
  Assert.Equal(0L,await db.OwnerScalarAsync("SELECT count(*)FROM accounting.journal_entries WHERE company_id=@c",("c",db.Company)));
  Assert.Equal(5L,await db.OwnerScalarAsync("SELECT count(*)FROM payroll.history WHERE company_id=@c AND record_id=@r",("c",db.Company),("r",Id(run))));
 }
 [Fact]public async Task Review_requires_different_actor_and_current_permission()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var t=await Act(c,await Sheet(c),"submit");await Act(c,t,"approve",HttpStatusCode.Forbidden);using var f=api.Authenticated((await Staff(db,"FINANCE")).Subject);await Act(f,t,"approve",HttpStatusCode.Forbidden);}
 [Theory][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("FINANCE")]
 public async Task Ordinary_roles_cannot_read_private_payroll(string role)
 {await using var api=new TestApi(db);using var c=api.Authenticated();var e=await Employee(c);using var staff=api.Authenticated((await Staff(db,role)).Subject);await Expect(staff.GetAsync($"/api/v1/payroll/records/{Id(e)}"),HttpStatusCode.Forbidden);}
 [Fact]public async Task Other_company_cannot_access_or_reference_employee()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var e=await Employee(c);using var other=api.Authenticated(company:db.OtherCompany);await Expect(other.GetAsync($"/api/v1/payroll/records/{Id(e)}"),HttpStatusCode.NotFound);await Expect(Send(other,HttpMethod.Post,"/payroll/records",new PayrollInput("TIMESHEET",E(new{employeeId=Id(e),date="2026-10-01",minutes=60,category="ORDINARY"}))),HttpStatusCode.NotFound);}
 [Theory][InlineData("tfn")][InlineData("bankAccount")][InlineData("taxRate")][InlineData("medicalNotes")]
 public async Task Secrets_and_unrecognized_fields_are_rejected(string key)
 {await using var api=new TestApi(db);using var c=api.Authenticated();var body=new Dictionary<string,object>{{"code",Code()},{"name","Private"},{"employmentType","CASUAL"},{"startDate","2026-01-01"},{key,"DO-NOT-STORE"}};await Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput("EMPLOYEE",E(body))),HttpStatusCode.UnprocessableEntity);Assert.Equal(0L,await db.OwnerScalarAsync("SELECT count(*)FROM payroll.records WHERE company_id=@c",("c",db.Company)));}
 [Theory][InlineData(-1)][InlineData(0)][InlineData(1441)]
 public async Task Invalid_minutes_do_not_create_timesheet(int minutes)
 {await using var api=new TestApi(db);using var c=api.Authenticated();var e=await Employee(c);await Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput("TIMESHEET",E(new{employeeId=Id(e),date="2026-10-01",minutes,category="ORDINARY"}))),HttpStatusCode.UnprocessableEntity);}
 [Fact]public async Task Same_key_concurrency_has_single_record_and_changed_payload_conflicts()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var key=Code();var input=new PayrollInput("EMPLOYEE",E(new{code=Code(),name="One",employmentType="CASUAL",startDate="2026-01-01"}));var rs=await Task.WhenAll(Enumerable.Range(0,3).Select(_=>Send(c,HttpMethod.Post,"/payroll/records",input,key:key)));var ids=new List<Guid>();foreach(var r in rs)ids.Add(Id(await SalesFlowSupport.Expect(r,HttpStatusCode.Created)));Assert.Single(ids.Distinct());await Expect(Send(c,HttpMethod.Post,"/payroll/records",input with{Body=E(new{})},key:key),HttpStatusCode.Conflict);}
 [Fact]public async Task Replay_after_permission_revocation_is_denied()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var key=Code();var input=new PayrollInput("EMPLOYEE",E(new{code=Code(),name="One",employmentType="CASUAL",startDate="2026-01-01"}));await Expect(Send(c,HttpMethod.Post,"/payroll/records",input,key:key),HttpStatusCode.Created);await db.OwnerScalarAsync("DELETE FROM identity.role_permissions WHERE company_id=@c AND permission_code='payroll.read'",("c",db.Company));await Expect(Send(c,HttpMethod.Post,"/payroll/records",input,key:key),HttpStatusCode.Forbidden);}
 [Fact]public async Task Concurrent_state_changes_have_one_winner_and_stale_version_conflicts()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var t=await Sheet(c);var rs=await Task.WhenAll(Enumerable.Range(0,2).Select(_=>Send(c,HttpMethod.Post,$"/payroll/records/{Id(t)}/submit",version:V(t))));Assert.Single(rs,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(rs,x=>x.StatusCode==HttpStatusCode.Conflict);}
 [Fact]public async Task Approved_inputs_and_frozen_runs_cannot_be_edited()
 {await using var api=new TestApi(db);using var c=api.Authenticated();using var reviewer=await Reviewer(api);var run=await Ready(c,reviewer);await Expect(Send(c,HttpMethod.Put,$"/payroll/records/{Id(run)}",new PayrollInput("RUN",E(new{})),version:V(run)),HttpStatusCode.Conflict);await Act(c,run,"lock",HttpStatusCode.Conflict);}
 [Fact]public async Task Consumed_timesheet_cannot_be_calculated_twice_and_failed_attempt_rolls_back()
 {await using var api=new TestApi(db);using var c=api.Authenticated();using var reviewer=await Reviewer(api);var run=await Ready(c,reviewer);var b=run.GetProperty("body");var second=await New(c,"RUN",new{from="2026-10-01",to="2026-10-07",payDate="2026-10-08",timesheetIds=b.GetProperty("timesheetIds")});await Act(c,second,"calculate",HttpStatusCode.Conflict);Assert.Equal("DRAFT",(await Get(c,$"/payroll/records/{Id(second)}")).GetProperty("state").GetString());}
 [Theory][InlineData("htt_app")][InlineData("htt_worker")][InlineData("htt_portal")]
 public async Task Roles_cannot_write_payroll_tables_directly(string role)
 {Assert.False((bool)(await db.OwnerScalarAsync("SELECT has_table_privilege(@role,'payroll.records','UPDATE')",("role",role)))!);}

 [Fact]public async Task Frozen_report_balances_and_does_not_include_unlocked_runs()
 {await using var api=new TestApi(db);using var c=api.Authenticated();using var reviewer=await Reviewer(api);var run=await Ready(c,reviewer);var path="/payroll/report?from=2026-10-01&to=2026-10-31";Assert.Equal(0,(await Get(c,path)).GetProperty("runCount").GetInt64());run=await Act(reviewer,run,"approve");run=await Act(c,run,"lock");var report=await Get(c,path);Assert.Equal(24000,report.GetProperty("grossCents").GetInt64());Assert.Equal(0,report.GetProperty("balanceDifferenceCents").GetInt64());Assert.False(report.GetProperty("ledgerPosted").GetBoolean());}
 [Fact]public async Task Sandbox_ack_retry_is_idempotent_and_new_key_cannot_repeat_locked_transition()
 {await using var api=new TestApi(db);using var c=api.Authenticated();using var reviewer=await Reviewer(api);var run=await Ready(c,reviewer);run=await Act(reviewer,run,"approve");run=await Act(c,run,"lock");var key=Code();var first=await Act(c,run,"stp_preview",key:key);var retry=await Act(c,run,"stp_preview",key:key);Assert.Equal(first.GetRawText(),retry.GetRawText());await Act(c,run,"stp_preview",HttpStatusCode.Conflict);}
 [Theory][InlineData("LIVE")][InlineData("ATO")][InlineData("")]
 public async Task Real_provider_cannot_be_enabled(string provider)
 {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput("SETTINGS",E(new{provider,rulesVersion="v1",fixtureHourlyCents=3000,fixturePaygCents=0,fixtureSuperCents=0}))),HttpStatusCode.UnprocessableEntity);}
 [Theory][InlineData("bad-date")][InlineData("2026-99-01")][InlineData("infinity")]
 public async Task Invalid_employee_date_is_validation_error(string date)
 {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput("EMPLOYEE",E(new{code=Code(),name="One",employmentType="CASUAL",startDate=date}))),HttpStatusCode.UnprocessableEntity);}
 [Fact]public async Task Cumulative_daily_hours_cannot_exceed_one_day()
 {await using var api=new TestApi(db);using var c=api.Authenticated();var e=await Employee(c);var input=new PayrollInput("TIMESHEET",E(new{employeeId=Id(e),date="2026-10-01",minutes=800,category="ORDINARY"}));await Expect(Send(c,HttpMethod.Post,"/payroll/records",input),HttpStatusCode.Created);await Expect(Send(c,HttpMethod.Post,"/payroll/records",input),HttpStatusCode.UnprocessableEntity);}
 [Fact]public async Task Invalid_run_references_are_rejected_before_calculation()
 {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(Send(c,HttpMethod.Post,"/payroll/records",new PayrollInput("RUN",E(new{from="2026-10-01",to="2026-10-07",payDate="2026-10-08",timesheetIds=new[]{"not-a-uuid"}}))),HttpStatusCode.UnprocessableEntity);}
}
