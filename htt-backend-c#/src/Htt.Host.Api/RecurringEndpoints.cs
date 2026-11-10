using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api;
public sealed record RecurringTemplateInput(string Name,string Kind,string Frequency,int Every,DateOnly StartsOn,DateOnly EndsOn,int MaxOccurrences,JsonElement Payload);
public sealed record RecurringChangeInput(string Action,string Reason,JsonElement? Payload=null);
public sealed record RecurringReviewInput(string Action,string Reason,JsonElement? Evidence=null);
internal static class RecurringEndpoints
{
 static async Task<string> Body(CompanySession s,string sql,CancellationToken ct,params DbArg[]args)=>(string)(await One(s,sql,ct,args))["body"]!;
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/recurring/templates",async(int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(o,n)=Page(page,pageSize);return Results.Content(await Body(s,"SELECT recurring.list('TEMPLATES',NULL,@size,@offset)::text AS body",ct,new DbArg("size",n),new DbArg("offset",o)),"application/json");}).WithMetadata(new Permission("recurring.read"));
  g.MapGet("/recurring/templates/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT recurring.template_view(@id)::text AS body",ct,new DbArg("id",id)),"application/json")).WithMetadata(new Permission("recurring.read"));
  g.MapGet("/recurring/runs",async(Guid? templateId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(o,n)=Page(page,pageSize);return Results.Content(await Body(s,"SELECT recurring.list('RUNS',@id,@size,@offset)::text AS body",ct,new DbArg("id",templateId,NpgsqlDbType.Uuid),new DbArg("size",n),new DbArg("offset",o)),"application/json");}).WithMetadata(new Permission("recurring.read"));
  g.MapGet("/recurring/runs/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT recurring.run_view(@id)::text AS body",ct,new DbArg("id",id)),"application/json")).WithMetadata(new Permission("recurring.read"));
  g.MapPost("/recurring/templates",async(RecurringTemplateInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
  {
   Check.That(x.Payload.ValueKind==JsonValueKind.Object,"payload","Supply a recurring source object.");
   await Read(s,"SELECT crm.require_mobile('recurring.read'),recurring.validate_payload(@kind,@payload)",ct,new DbArg("kind",x.Kind),new DbArg("payload",x.Payload.GetRawText(),NpgsqlDbType.Jsonb));
   var r=await idem.ExecuteAsync("POST /recurring/templates",h.Request.Headers["Idempotency-Key"].ToString(),Json(x),async()=>{
    var id=(Guid)(await One(s,"SELECT recurring.create_template(@name,@kind,@frequency,@every,@start,@end,@max,@payload)AS id",ct,new DbArg("name",x.Name,NpgsqlDbType.Text),new DbArg("kind",x.Kind,NpgsqlDbType.Text),new DbArg("frequency",x.Frequency,NpgsqlDbType.Text),new DbArg("every",x.Every),new DbArg("start",x.StartsOn),new DbArg("end",x.EndsOn),new DbArg("max",x.MaxOccurrences),new DbArg("payload",x.Payload.GetRawText(),NpgsqlDbType.Jsonb)))["id"]!;
    await Sql.AuditAsync(s,"recurring.template_created","recurring_template",id,h.TraceIdentifier,ct);return new StoredResponse(201,await Body(s,"SELECT recurring.template_view(@id)::text AS body",ct,new DbArg("id",id)));},ct);return ApiJson.Result(r);
  }).WithMetadata(new Permission("recurring.write"));
  g.MapPost("/recurring/templates/{id:guid}/change",async(Guid id,RecurringChangeInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
  {
   await Read(s,"SELECT recurring.template_view(@id)",ct,new DbArg("id",id));var version=Version(h);var r=await idem.ExecuteAsync($"POST /recurring/templates/{id}/change",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,x}),async()=>{
    await Read(s,"SELECT recurring.change_template(@id,@version,@action,@payload,@reason)",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("action",x.Action,NpgsqlDbType.Text),new DbArg("payload",x.Payload?.GetRawText(),NpgsqlDbType.Jsonb),new DbArg("reason",x.Reason,NpgsqlDbType.Text));await Sql.AuditAsync(s,"recurring.template_changed","recurring_template",id,h.TraceIdentifier,ct,new{x.Action,x.Reason});return new StoredResponse(200,await Body(s,"SELECT recurring.template_view(@id)::text AS body",ct,new DbArg("id",id)));},ct);return ApiJson.Result(r);
  }).WithMetadata(new Permission("recurring.write"));
  g.MapPost("/recurring/runs/{id:guid}/review",async(Guid id,RecurringReviewInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
  {
   // Recheck the original posting capability before cached approval results as well as inside SQL.
   var view=Element(await Body(s,"SELECT recurring.run_view(@id)::text AS body",ct,new DbArg("id",id)));
   if(x.Action=="APPROVE")await Read(s,view.GetProperty("kind").GetString()switch{"INVOICE"=>"SELECT crm.require_mobile('sales.invoices.write')","EXPENSE_BILL"=>"SELECT crm.require_mobile('purchase.expense_bills.post')",_=>"SELECT accounting.require_general_banking('accounting.bank_transactions.post')"},ct);
   var version=Version(h);var r=await idem.ExecuteAsync($"POST /recurring/runs/{id}/review",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,x}),async()=>new StoredResponse(200,await Body(s,"SELECT recurring.review(@id,@version,@action,@evidence,@reason)::text AS body",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("action",x.Action,NpgsqlDbType.Text),new DbArg("evidence",x.Evidence?.GetRawText(),NpgsqlDbType.Jsonb),new DbArg("reason",x.Reason,NpgsqlDbType.Text))),ct);return ApiJson.Result(r);
  }).WithMetadata(new Permission("recurring.review"));
 }
}
