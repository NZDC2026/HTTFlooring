using Htt.Infrastructure;
using Htt.Host.Api.MasterData;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Inventory;
public sealed record BinCountReading(Guid LineId,decimal? Quantity);
public sealed record BinCountSubmission(IReadOnlyList<BinCountReading>? Lines);
public sealed record BinCountRecount(Guid CounterId,string Reason);
public sealed record BinCountGain(Guid ProductId,decimal GainValue);
public sealed record BinCountDecision(string Reason,IReadOnlyList<BinCountGain>? GainValues=null);
public sealed record BinCountDiscover(Guid ProductId,Guid BinId,string LotCode);
internal static class BinCountEndpoints
{
 private static Task<List<Dictionary<string,object?>>> Guard(CompanySession s,Guid id,string action,CancellationToken ct)=>Read(s,"SELECT inventory.require_bin_actor(@id,@action)",ct,new DbArg("id",id),new DbArg("action",action));
 internal static async Task<object> View(CompanySession s,Guid id,bool financial,CancellationToken ct)=>Element((await One(s,"SELECT inventory.bin_count_view(@id,@financial)::text AS body",ct,new DbArg("id",id),new DbArg("financial",financial)))["body"]!);
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/warehouse/bin-counts",async(Guid warehouseId,string? state,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{if(state is not null)Check.OneOf(state,"state","OPEN","SUBMITTED","RECOUNT","RECOUNT_SUBMITTED","APPROVED","POSTED","CANCELLED");await Read(s,"SELECT inventory.require_bin_list(@wh)",ct,new DbArg("wh",warehouseId));var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT id,warehouse_id,state,version,current_round,created_by,created_at FROM inventory.bin_counts WHERE company_id=@company AND warehouse_id=@wh AND(@state IS NULL OR state=@state)ORDER BY created_at DESC,id LIMIT @size OFFSET @offset",ct,new DbArg("wh",warehouseId),new DbArg("state",state,NpgsqlDbType.Text),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});}).WithMetadata(new Permission("inventory.bin_counts.read"));
  g.MapPost("/warehouse/bin-counts",Start).WithMetadata(new Permission("inventory.bin_counts.capture"));
  g.MapGet("/warehouse/bin-counts/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(s,id,false,ct))).WithMetadata(new Permission("inventory.bin_counts.read"));
  g.MapGet("/accounting/bin-counts/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await View(s,id,true,ct))).WithMetadata(new Permission("inventory.bin_counts.review"));
  g.MapPost("/warehouse/bin-counts/{id:guid}/positions",Discover).WithMetadata(new Permission("inventory.bin_counts.capture"));
  g.MapPost("/warehouse/bin-counts/{id:guid}/submit",Submit).WithMetadata(new Permission("inventory.bin_counts.capture"));
  g.MapPost("/accounting/bin-counts/{id:guid}/recount",Recount).WithMetadata(new Permission("inventory.bin_counts.review"));
  g.MapPost("/accounting/bin-counts/{id:guid}/approve",Approve).WithMetadata(new Permission("inventory.bin_counts.review"));
  g.MapPost("/accounting/bin-counts/{id:guid}/post",Post).WithMetadata(new Permission("inventory.bin_counts.post"));
  g.MapPost("/warehouse/bin-counts/{id:guid}/cancel",Cancel).WithMetadata(new Permission("inventory.bin_counts.read"));
 }
 private static async Task<IResult> Start(StockCountInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {var reference=Check.Text(x.Reference,"reference");var reason=Check.Text(x.Reason,"reason",2000);Check.That(x.WarehouseId!=Guid.Empty&&x.ProductIds is{Count:>=1 and<=50}&&x.ProductIds.All(p=>p!=Guid.Empty)&&x.ProductIds.Distinct().Count()==x.ProductIds.Count,"products","Warehouse and 1..50 distinct stock products required.");await Read(s,"SELECT inventory.require_access('inventory.bin_counts.capture',@wh),inventory.require_access('inventory.bin_counts.read',@wh)",ct,new DbArg("wh",x.WarehouseId));var products=x.ProductIds!.Order().ToArray();var result=await idem.ExecuteAsync("POST /warehouse/bin-counts",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{x.WarehouseId,reference,reason,products}),async()=>{var id=(Guid)(await One(s,"SELECT inventory.start_bin_count(@wh,@ref,@reason,@products)AS id",ct,new DbArg("wh",x.WarehouseId),new DbArg("ref",reference),new DbArg("reason",reason),new DbArg("products",products,NpgsqlDbType.Array|NpgsqlDbType.Uuid)))["id"]!;await Sql.AuditAsync(s,"inventory.bin_count_started","bin_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await View(s,id,false,ct),201);},ct);return ApiJson.Result(result);}
 private static async Task<IResult> Submit(Guid id,BinCountSubmission input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.That(input.Lines is{Count:>=1 and<=500}&&input.Lines.All(l=>l is not null&&l.LineId!=Guid.Empty&&l.Quantity is not null)&&input.Lines.Select(l=>l.LineId).Distinct().Count()==input.Lines.Count,"lines","Count every position exactly once, including zero.");foreach(var l in input.Lines!)Check.Amount(l.Quantity!.Value,"quantity",6);var lines=input.Lines!.OrderBy(l=>l.LineId).ToArray();return await Command(id,"CAPTURE","submit",new{lines},h,s,idem,ct,async(version)=>await Read(s,"SELECT inventory.submit_bin_count(@id,@v,@lines)",ct,new DbArg("id",id),new DbArg("v",version),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb)));}
 private static Task<IResult> Recount(Guid id,BinCountRecount x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.That(x.CounterId!=Guid.Empty,"counterId","Assigned counter required.");var reason=Check.Text(x.Reason,"reason",2000);return Command(id,"REVIEW","recount",new{x.CounterId,reason},h,s,idem,ct,async(v)=>await Read(s,"SELECT inventory.review_bin_count(@id,@v,'RECOUNT',@reason,@counter,'[]')",ct,new DbArg("id",id),new DbArg("v",v),new DbArg("reason",reason),new DbArg("counter",x.CounterId)));}
 private static Task<IResult> Approve(Guid id,BinCountDecision input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {var reason=Check.Text(input.Reason,"reason",2000);var values=input.GainValues??[];Check.That(values.Count<=50&&values.All(l=>l is not null&&l.ProductId!=Guid.Empty)&&values.Select(l=>l.ProductId).Distinct().Count()==values.Count,"gainValues","Distinct SKU gain values required.");foreach(var l in values)Check.Amount(l.GainValue,"gainValue",2);return Command(id,"REVIEW","approve",new{reason,values},h,s,idem,ct,async(v)=>await Read(s,"SELECT inventory.review_bin_count(@id,@v,'APPROVE',@reason,NULL,@values)",ct,new DbArg("id",id),new DbArg("v",v),new DbArg("reason",reason),new DbArg("values",Json(values),NpgsqlDbType.Jsonb)));}
 private static Task<IResult> Post(Guid id,BinCountDecision x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.That(x.GainValues is null||x.GainValues.Count==0,"gainValues","Values are approved before posting.");var reason=Check.Text(x.Reason,"reason",2000);return Command(id,"POST","post",new{reason},h,s,idem,ct,async(v)=>await Read(s,"SELECT inventory.post_bin_count(@id,@v,@reason)",ct,new DbArg("id",id),new DbArg("v",v),new DbArg("reason",reason)));}
 private static Task<IResult> Cancel(Guid id,BinCountDecision x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {var reason=Check.Text(x.Reason,"reason",2000);return Command(id,"CANCEL","cancel",new{reason},h,s,idem,ct,async(v)=>await Read(s,"SELECT inventory.cancel_bin_count(@id,@v,@reason)",ct,new DbArg("id",id),new DbArg("v",v),new DbArg("reason",reason)));}
 private static Task<IResult> Discover(Guid id,BinCountDiscover x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {Check.That(x.ProductId!=Guid.Empty&&x.BinId!=Guid.Empty,"position","Selected product and warehouse bin required.");var lot=Check.Text(x.LotCode,"lotCode",80);return Command(id,"CAPTURE","discover",new{x.ProductId,x.BinId,lot},h,s,idem,ct,async(v)=>await Read(s,"SELECT inventory.discover_bin_count_position(@id,@v,@product,@bin,@lot)",ct,new DbArg("id",id),new DbArg("v",v),new DbArg("product",x.ProductId),new DbArg("bin",x.BinId),new DbArg("lot",lot)));}
 private static async Task<IResult> Command(Guid id,string access,string action,object body,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct,Func<long,Task> execute)
 {await Guard(s,id,access,ct);var version=Version(h);var response=await idem.ExecuteAsync("POST /bin-counts/"+id+"/"+action,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,body}),async()=>{await execute(version);await Sql.AuditAsync(s,"inventory.bin_count_"+action,"bin_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await View(s,id,access is "REVIEW" or "POST",ct),200);},ct);return ApiJson.Result(response);}
}
