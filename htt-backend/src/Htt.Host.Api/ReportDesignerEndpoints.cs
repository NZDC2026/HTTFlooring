using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api;
public sealed record SavedReportInput(string Name,JsonElement Definition,string Visibility="PRIVATE",bool Active=true);
public sealed record ReportFavouriteInput(bool Active);
public sealed record ReportFormatInput(JsonElement Format);
public sealed record ReportPackInput(string Title,JsonElement[] Items);
internal static class ReportDesignerEndpoints
{
 static async Task<string> Body(CompanySession s,string sql,CancellationToken ct,params DbArg[]a)=>(string)(await One(s,sql,ct,a))["body"]!;
 static void Object(JsonElement p)
 {
  Check.That(p.ValueKind==JsonValueKind.Object,"definition","Supply a JSON object.");
  static bool Clean(JsonElement value)=>value.ValueKind switch
  {
   JsonValueKind.Object=>value.EnumerateObject().All(x=>!x.Name.Any(char.IsControl)&&Clean(x.Value)),
   JsonValueKind.Array=>value.EnumerateArray().All(Clean),
   JsonValueKind.String=>!value.GetString()!.Any(char.IsControl),
   _=>true
  };
  Check.That(Clean(p),"definition","Control characters are not supported.");
 }
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/reports/saved",async(bool? favourites,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(o,n)=Page(page,pageSize);return Results.Content(await Body(s,"SELECT reporting.saved_list(@fav,@size,@offset)::text AS body",ct,new DbArg("fav",favourites??false),new DbArg("size",n),new DbArg("offset",o)),"application/json");}).WithMetadata(new Permission("reports.saved.read"));
  g.MapGet("/reports/saved/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT reporting.saved_view(@id)::text AS body",ct,new DbArg("id",id)),"application/json")).WithMetadata(new Permission("reports.saved.read"));
  g.MapPost("/reports/saved",async(SavedReportInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(null,x,h,s,idem,ct)).WithMetadata(new Permission("reports.saved.write"));
  g.MapPut("/reports/saved/{id:guid}",async(Guid id,SavedReportInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(id,x,h,s,idem,ct)).WithMetadata(new Permission("reports.saved.write"));
  g.MapPut("/reports/saved/{id:guid}/favourite",async(Guid id,ReportFavouriteInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
  {
   await Read(s,"SELECT reporting.saved_view(@id)",ct,new DbArg("id",id));var r=await idem.ExecuteAsync($"PUT /reports/saved/{id}/favourite",h.Request.Headers["Idempotency-Key"].ToString(),Json(x),async()=>{await Read(s,"SELECT reporting.favourite(@id,@active)",ct,new DbArg("id",id),new DbArg("active",x.Active));return new StoredResponse(200,await Body(s,"SELECT reporting.saved_view(@id)::text AS body",ct,new DbArg("id",id)));},ct);return ApiJson.Result(r);
  }).WithMetadata(new Permission("reports.saved.read"));
  g.MapGet("/reports/settings",async(CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT reporting.preferences(NULL,NULL)::text AS body",ct),"application/json")).WithMetadata(new Permission("reports.saved.read"));
  g.MapPut("/reports/settings",async(ReportFormatInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
  {
   Object(x.Format);Check.That(long.TryParse(h.Request.Headers.IfMatch.ToString().Trim('"'),out var version)&&version>=0,"version","Supply If-Match, initially zero.");await Read(s,"SELECT crm.require_mobile('reports.saved.read')",ct);
   var r=await idem.ExecuteAsync("PUT /reports/settings",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,x}),async()=>new StoredResponse(200,await Body(s,"SELECT reporting.preferences(@version,@format)::text AS body",ct,new DbArg("version",version),new DbArg("format",x.Format.GetRawText(),NpgsqlDbType.Jsonb))),ct);return ApiJson.Result(r);
  }).WithMetadata(new Permission("reports.saved.write"));
  g.MapGet("/reports/packs",async(int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(o,n)=Page(page,pageSize);return Results.Content(await Body(s,"SELECT reporting.pack_list(@size,@offset)::text AS body",ct,new DbArg("size",n),new DbArg("offset",o)),"application/json");}).WithMetadata(new Permission("reports.packs.create"));
  g.MapPost("/reports/packs",Capture).WithMetadata(new Permission("reports.packs.create"));
  g.MapGet("/reports/packs/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content(await Body(s,"SELECT reporting.pack_view(@id)::text AS body",ct,new DbArg("id",id)),"application/json")).WithMetadata(new Permission("reports.packs.create"));
 }
 static async Task<IResult> Save(Guid? id,SavedReportInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  Object(x.Definition);Check.That(!Check.Text(x.Name,"name",120).Any(char.IsControl),"name","Control characters are not supported.");var version=id.HasValue?Version(h):0;
  await Read(s,"SELECT reporting.require_definition(@def)",ct,new DbArg("def",x.Definition.GetRawText(),NpgsqlDbType.Jsonb));
  if(id.HasValue)await Read(s,"SELECT reporting.saved_view(@id)",ct,new DbArg("id",id.Value));
  if(x.Visibility=="COMPANY")await Read(s,"SELECT crm.require_mobile('reports.saved.share')",ct);
  var r=await idem.ExecuteAsync(id.HasValue?$"PUT /reports/saved/{id}":"POST /reports/saved",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,x}),async()=>{
   var saved=(Guid)(await One(s,"SELECT reporting.save(@id,@version,@name,@visibility,@active,@def)AS id",ct,new DbArg("id",id,NpgsqlDbType.Uuid),new DbArg("version",version),new DbArg("name",x.Name,NpgsqlDbType.Text),new DbArg("visibility",x.Visibility,NpgsqlDbType.Text),new DbArg("active",x.Active),new DbArg("def",x.Definition.GetRawText(),NpgsqlDbType.Jsonb)))["id"]!;
   await Sql.AuditAsync(s,"reports.saved_changed","saved_report",saved,h.TraceIdentifier,ct);return new StoredResponse(id.HasValue?200:201,await Body(s,"SELECT reporting.saved_view(@id)::text AS body",ct,new DbArg("id",saved)));},ct);return ApiJson.Result(r);
 }
 static async Task<IResult> Capture(ReportPackInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  Check.That(!Check.Text(x.Title,"title",120).Any(char.IsControl),"title","Control characters are not supported.");
  Check.That(x.Items is{Length:>=1 and <=8},"items","Select 1-8 reports.");foreach(var item in x.Items!){Object(item);await Read(s,"SELECT reporting.require_definition(reporting.resolve(@item))",ct,new DbArg("item",item.GetRawText(),NpgsqlDbType.Jsonb));}
  var r=await idem.ExecuteAsync("POST /reports/packs",h.Request.Headers["Idempotency-Key"].ToString(),Json(x),async()=>{
   var id=(Guid)(await One(s,"SELECT reporting.capture(@title,@items)AS id",ct,new DbArg("title",x.Title,NpgsqlDbType.Text),new DbArg("items",Json(x.Items),NpgsqlDbType.Jsonb)))["id"]!;
   await Sql.AuditAsync(s,"reports.pack_captured","report_pack",id,h.TraceIdentifier,ct);return new StoredResponse(201,await Body(s,"SELECT reporting.pack_view(@id)::text AS body",ct,new DbArg("id",id)));},ct);return ApiJson.Result(r);
 }
}
