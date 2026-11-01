using Htt.Infrastructure;
using Htt.Host.Api.MasterData;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Accounting;
public sealed record BankFeedConnectInput(string GrantReference,DateOnly StartDate,bool AutoSync=false);
public sealed record BankFeedRetryInput(Guid JobId,string Reason,bool AcknowledgeUnknown=false);
internal static class BankFeedEndpoints
{
    static async Task<Guid> Bank(Guid id,CompanySession s,CancellationToken ct) => (Guid)(await One(s,"SELECT bank_account_id FROM bankfeeds.connections WHERE company_id=@company AND id=@id",ct,new DbArg("id",id)))["bank_account_id"]!;
    static async Task Require(CompanySession s,Guid bank,string permission,CancellationToken ct) => _=await Read(s,"SELECT bankfeeds.require_access(@permission,@bank)",ct,new DbArg("permission",permission),new DbArg("bank",bank));
    static async Task<IResult> View(Guid id,CompanySession s,CancellationToken ct) => Results.Content((string)(await One(s,"SELECT bankfeeds.view_connection(@id)::text AS body",ct,new DbArg("id",id)))["body"]!,"application/json");
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/bank-accounts/{id:guid}/feed-connections",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Require(s,id,"accounting.bank_feeds.read",ct);var(offset,size)=Page(page,pageSize);
            var rows=await Read(s,"SELECT bankfeeds.view_connection(id)::text AS body FROM bankfeeds.connections WHERE company_id=@company AND bank_account_id=@bank ORDER BY created_at DESC,id LIMIT @size OFFSET @offset",ct,new DbArg("bank",id),new DbArg("size",size),new DbArg("offset",offset));
            return Results.Ok(new{items=rows.Select(x=>Element(x["body"]!)),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("accounting.bank_feeds.read"));
        g.MapGet("/bank-feed-connections/{id:guid}/jobs",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            var(offset,size)=Page(page,pageSize);var body=(string)(await One(s,"SELECT bankfeeds.job_list(@id,@size,@offset)::text AS body",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset)))["body"]!;return Results.Content(body,"application/json");
        }).WithMetadata(new Permission("accounting.bank_feeds.read"));
        g.MapGet("/bank-feed-connections/{id:guid}",View).WithMetadata(new Permission("accounting.bank_feeds.read"));
        g.MapPost("/bank-accounts/{id:guid}/feed-connections",async(Guid id,BankFeedConnectInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
        {
            await Require(s,id,"accounting.bank_feeds.manage",ct);
            // Always recheck source import permission before replaying a cached response.
            await Read(s,"SELECT crm.require_mobile('accounting.bank_statements.import')",ct);
            var result=await idem.ExecuteAsync($"POST /bank-accounts/{id}/feed-connections",h.Request.Headers["Idempotency-Key"].ToString(),Json(input),async()=>
            {
                var feed=(Guid)(await One(s,"SELECT bankfeeds.create_connection(@bank,@grant,@start,@auto) AS id",ct,new DbArg("bank",id),new DbArg("grant",input.GrantReference,NpgsqlDbType.Text),new DbArg("start",input.StartDate),new DbArg("auto",input.AutoSync)))["id"]!;
                await Sql.AuditAsync(s,"accounting.bank_feed_created","bank_feed",feed,h.TraceIdentifier,ct,new{bankAccountId=id,environment="SANDBOX"});
                return ApiJson.Stored(new{id=feed,state="PENDING",environment="SANDBOX",liveConnection=false});
            },ct);return ApiJson.Result(result);
        }).WithMetadata(new Permission("accounting.bank_feeds.manage"));
        foreach(var action in new[]{"verify","sync","revoke"})
        {
            var operation=action;
            g.MapPost("/bank-feed-connections/{id:guid}/"+operation,async(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Command(id,operation.ToUpperInvariant(),null,h,s,idem,ct))
                .WithMetadata(new Permission(operation=="sync"?"accounting.bank_feeds.sync":"accounting.bank_feeds.manage"));
        }
        g.MapPost("/bank-feed-connections/{id:guid}/retry",async(Guid id,BankFeedRetryInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Command(id,"RETRY",input,h,s,idem,ct)).WithMetadata(new Permission("accounting.bank_feeds.manage"));
    }
    static async Task<IResult> Command(Guid id,string action,BankFeedRetryInput? input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var bank=await Bank(id,s,ct);await Require(s,bank,action=="SYNC"?"accounting.bank_feeds.sync":"accounting.bank_feeds.manage",ct);
        if(action is "SYNC" or "VERIFY")await Read(s,"SELECT crm.require_mobile('accounting.bank_statements.import')",ct);
        if(action=="RETRY")await Read(s,"SELECT bankfeeds.authorize_retry(@id,@job)",ct,new DbArg("id",id),new DbArg("job",input?.JobId,NpgsqlDbType.Uuid));
        var version=Version(h);var result=await idem.ExecuteAsync($"POST /bank-feed-connections/{id}/{action}",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,input}),async()=>
        {
            var job=(Guid)(await One(s,"SELECT bankfeeds.command(@id,@version,@action,@job,@ack,@reason) AS id",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("action",action),new DbArg("job",input?.JobId,NpgsqlDbType.Uuid),new DbArg("ack",input?.AcknowledgeUnknown??false),new DbArg("reason",input?.Reason??"")))["id"]!;
            await Sql.AuditAsync(s,"accounting.bank_feed_queued","bank_feed_job",job,h.TraceIdentifier,ct,new{connectionId=id,action,reason=input?.Reason});
            return ApiJson.Stored(new{id=job,connectionId=id,kind=action},202);
        },ct);return ApiJson.Result(result);
    }
}
