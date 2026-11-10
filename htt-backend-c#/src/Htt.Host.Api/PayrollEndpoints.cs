using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api;
public sealed record PayrollInput(string Kind,JsonElement Body);
internal static class PayrollEndpoints
{
 static async Task<string> Body(CompanySession s,string sql,CancellationToken ct,params DbArg[] args)=>(string)(await One(s,sql,ct,args))["body"]!;
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/payroll/report",async(DateOnly from,DateOnly to,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT payroll.report(@from,@to)::text AS body",ct,new("from",from),new("to",to)),"application/json")).WithMetadata(new Permission("payroll.read"));
  g.MapGet("/payroll/records",async(string kind,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(o,n)=Page(page,pageSize);return Results.Content(await Body(s,"SELECT payroll.list(@kind,@n,@o)::text AS body",ct,new("kind",kind),new("n",n),new("o",o)),"application/json");}).WithMetadata(new Permission("payroll.read"));
  g.MapGet("/payroll/records/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT payroll.view(@id)::text AS body",ct,new DbArg("id",id)),"application/json")).WithMetadata(new Permission("payroll.read"));
  g.MapPost("/payroll/records",async(PayrollInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(null,x,h,s,idem,ct)).WithMetadata(new Permission("payroll.write"));
  g.MapPut("/payroll/records/{id:guid}",async(Guid id,PayrollInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(id,x,h,s,idem,ct)).WithMetadata(new Permission("payroll.write"));
  foreach(var action in new[]{"SUBMIT","CALCULATE","APPROVE","LOCK","STP_PREVIEW"})
  {
   var operation=action;
   g.MapPost($"/payroll/records/{{id:guid}}/{action.ToLowerInvariant()}",async(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
   {
    var version=Version(h);await Read(s,"SELECT crm.require_mobile('payroll.read')",ct);await Read(s,"SELECT payroll.view(@id)",ct,new DbArg("id",id));
    var r=await idem.ExecuteAsync($"POST /payroll/records/{id}/{operation}",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version}),async()=>
    {var result=await Body(s,"SELECT payroll.transition(@id,@version,@action)::text AS body",ct,new("id",id),new("version",version),new("action",operation));await Sql.AuditAsync(s,"payroll.sandbox_changed","payroll_record",id,h.TraceIdentifier,ct);return new StoredResponse(200,result);},ct);return ApiJson.Result(r);
   }).WithMetadata(new Permission(action=="APPROVE"?"payroll.review":"payroll.write"));
  }
 }
 static async Task<IResult> Save(Guid? id,PayrollInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  Check.That(x.Body.ValueKind==JsonValueKind.Object,"body","Supply a payroll object.");
  var version=id.HasValue?Version(h):0;await Read(s,"SELECT crm.require_mobile('payroll.read')",ct);
  if(id.HasValue)await Read(s,"SELECT payroll.view(@id)",ct,new DbArg("id",id.Value));
  var r=await idem.ExecuteAsync(id.HasValue?$"PUT /payroll/records/{id}":"POST /payroll/records",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,x}),async()=>
  {var saved=(Guid)(await One(s,"SELECT payroll.save(@id,@kind,@version,@body) AS id",ct,new("id",id,NpgsqlDbType.Uuid),new("kind",x.Kind,NpgsqlDbType.Text),new("version",version),new("body",x.Body.GetRawText(),NpgsqlDbType.Jsonb)))["id"]!;await Sql.AuditAsync(s,"payroll.sandbox_changed","payroll_record",saved,h.TraceIdentifier,ct);return new StoredResponse(id.HasValue?200:201,await Body(s,"SELECT payroll.view(@id)::text AS body",ct,new DbArg("id",saved)));},ct);return ApiJson.Result(r);
 }
}
