using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Sales;
public sealed record SalesAnalyticsFilter(DateOnly From,DateOnly To,Guid? CustomerId=null,Guid? BranchId=null,Guid? ProductId=null,Guid? SalespersonId=null,string Bucket="MONTH");
public sealed record SalesAttributionInput(Guid SalespersonId,string Reason);
internal static class SalesAnalyticsEndpoints
{
 private static async Task<object> Value(CompanySession s,string sql,CancellationToken ct,params DbArg[]args)=>Element((await One(s,sql+"::text AS body",ct,args))["body"]!);
 private static async Task<object> PageValue(CompanySession s,string sql,CancellationToken ct,params DbArg[]args)=>Element((await One(s,sql+"::text AS body FROM result",ct,args))["body"]!);
 private static SalesAnalyticsFilter Validate(SalesAnalyticsFilter x)
 {Check.That(x.From.Year>=3&&x.To>x.From&&x.To.DayNumber-x.From.DayNumber<=366,"range","Use a half-open interval of 1..366 days, from year 3.");Check.OneOf(x.Bucket,"bucket","DAY","MONTH");Check.That(x.CustomerId!=Guid.Empty&&x.BranchId!=Guid.Empty&&x.ProductId!=Guid.Empty&&x.SalespersonId!=Guid.Empty,"ids","Nonempty IDs required.");return x;}
 private static DbArg Filter(SalesAnalyticsFilter f)=>new("filter",Json(f),NpgsqlDbType.Jsonb);
 private static Task Guard(CompanySession s,SalesAnalyticsFilter f,CancellationToken ct)=>Read(s,"SELECT sales.require_analytics_customer(@customer)",ct,new DbArg("customer",f.CustomerId,NpgsqlDbType.Uuid));
 public static void Map(RouteGroupBuilder g)
 {
  g.MapGet("/sales-analytics/trends",async(DateOnly from,DateOnly to,Guid? customerId,Guid? branchId,Guid? productId,Guid? salespersonId,string? bucket,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var f=Validate(new(from,to,customerId,branchId,productId,salespersonId,bucket??"MONTH"));var(offset,size)=Page(page,pageSize);return Results.Ok(await PageValue(s,"WITH result AS MATERIALIZED(SELECT sales.analytics_report(@filter)body)SELECT(body-'rows'-'sourceFacts'-'mvccSnapshot'||jsonb_build_object('totalCount',jsonb_array_length(body->'rows'),'page',@page,'pageSize',@size,'rows',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body->'rows')WITH ORDINALITY a(e,n)WHERE n>@offset AND n<=@offset+@size),'[]'::jsonb)))",ct,Filter(f),new DbArg("page",page??1),new DbArg("size",size),new DbArg("offset",offset)));}).WithMetadata(new Permission("reports.sales.read"));
  g.MapGet("/sales-analytics/facts",Facts).WithMetadata(new Permission("reports.sales.read"));
  g.MapGet("/sales-analytics/pending-returns",async(DateOnly from,DateOnly to,Guid? customerId,Guid? branchId,Guid? productId,Guid? salespersonId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var f=Validate(new(from,to,customerId,branchId,productId,salespersonId));var(offset,size)=Page(page,pageSize);return Results.Ok(await PageValue(s,"WITH result AS MATERIALIZED(SELECT sales.pending_credit_returns(@filter)body)SELECT jsonb_build_object('asOfExclusive',@to,'totalCount',jsonb_array_length(body),'page',@page,'pageSize',@size,'items',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body)WITH ORDINALITY a(e,n)WHERE n>@offset AND n<=@offset+@size),'[]'::jsonb))",ct,Filter(f),new DbArg("to",to),new DbArg("page",page??1),new DbArg("size",size),new DbArg("offset",offset)));}).WithMetadata(new Permission("reports.sales.read"));
  g.MapGet("/sales-analytics/reconciliation",async(DateOnly from,DateOnly to,CompanySession s,CancellationToken ct)=>{Validate(new(from,to));return Results.Ok(await Value(s,"SELECT sales.sales_reconciliation(@from,@to)",ct,new DbArg("from",from),new DbArg("to",to)));}).WithMetadata(new Permission("reports.sales.reconcile"));
  g.MapPost("/sales-analytics/checkpoints",Capture).WithMetadata(new Permission("reports.operating.read"));
  g.MapGet("/sales-analytics/checkpoints/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT sales.checkpoint_json(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("reports.operating.read"));
  g.MapGet("/sales-orders/{id:guid}/sales-attribution",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Value(s,"SELECT sales.attribution_view(@id)",ct,new DbArg("id",id)))).WithMetadata(new Permission("reports.sales.read"));
  g.MapPut("/sales-orders/{id:guid}/sales-attribution",Assign).WithMetadata(new Permission("sales.attribution.assign"));
 }
 private static async Task<IResult> Facts(DateOnly from,DateOnly to,Guid? customerId,Guid? branchId,Guid? productId,Guid? salespersonId,int? page,int? pageSize,CompanySession s,CancellationToken ct)
 {var f=Validate(new(from,to,customerId,branchId,productId,salespersonId));var(offset,size)=Page(page,pageSize);return Results.Ok(await PageValue(s,"WITH result AS MATERIALIZED(SELECT sales.analytics_facts(@filter)body)SELECT jsonb_build_object('snapshotAt',statement_timestamp(),'basis','POSTING_DATE','totalCount',jsonb_array_length(body),'page',@page,'pageSize',@size,'items',coalesce((SELECT jsonb_agg(e ORDER BY n)FROM jsonb_array_elements(body)WITH ORDINALITY a(e,n)WHERE n>@offset AND n<=@offset+@size),'[]'::jsonb))",ct,Filter(f),new DbArg("page",page??1),new DbArg("size",size),new DbArg("offset",offset)));}
 private static async Task<IResult> Capture(SalesAnalyticsFilter input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {var f=Validate(input);await Guard(s,f,ct);await Read(s,"SELECT accounting.require_operating_report('SALES')",ct);var result=await idem.ExecuteAsync("POST /sales-analytics/checkpoints",h.Request.Headers["Idempotency-Key"].ToString(),Json(f),async()=>{var id=(Guid)(await One(s,"SELECT sales.capture_analytics(@filter)AS id",ct,Filter(f)))["id"]!;await Sql.AuditAsync(s,"sales.analytics_checkpoint","operating_report",id,h.TraceIdentifier,ct);return ApiJson.Stored(await Value(s,"SELECT sales.checkpoint_json(@id)",ct,new DbArg("id",id)),201);},ct);return ApiJson.Result(result);}
 private static async Task<IResult> Assign(Guid id,SalesAttributionInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {await Value(s,"SELECT sales.attribution_view(@id)",ct,new DbArg("id",id));Check.That(x.SalespersonId!=Guid.Empty,"salespersonId","Salesperson ID required.");var reason=Check.Text(x.Reason,"reason",2000);var version=Version(h);
  await Read(s,"SELECT sales.require_attribution_actor(@id,@user)",ct,new DbArg("id",id),new DbArg("user",x.SalespersonId));var result=await idem.ExecuteAsync("PUT /sales-orders/sales-attribution",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,x.SalespersonId,reason}),async()=>{var body=await Value(s,"SELECT sales.assign_attribution(@id,@v,@user,@reason)",ct,new DbArg("id",id),new DbArg("v",version),new DbArg("user",x.SalespersonId),new DbArg("reason",reason));await Sql.AuditAsync(s,"sales.attribution_assigned","sales_order",id,h.TraceIdentifier,ct);return ApiJson.Stored(body,200);},ct);return ApiJson.Result(result);}
}
