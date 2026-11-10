using System.Globalization;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api;

public sealed record DocumentTrashInput(string Reason);
internal sealed record LifecycleEndpoint;
internal static class DocumentTrashEndpoints
{
    public static void MapDocumentTrash(this WebApplication app)
    {
        var g=app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        g.MapGet("/documents/trash",async(string? documentType,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>Results.Content((string)(await One(s,"SELECT platform.trash_items(@type,@page,@size)::text AS result",ct,new DbArg("type",documentType,NpgsqlDbType.Text),new DbArg("page",page??1),new DbArg("size",pageSize??25)))["result"]!,"application/json")).WithMetadata(new Permission("documents.trash.read"),new LifecycleEndpoint());
        g.MapGet("/documents/{id:guid}/lifecycle",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content((string)(await One(s,"SELECT platform.trash_view(@id)::text AS result",ct,new DbArg("id",id)))["result"]!,"application/json")).WithMetadata(new Permission("documents.trash.read"),new LifecycleEndpoint());
        g.MapPost("/documents/{id:guid}/trash",async(Guid id,DocumentTrashInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Change(id,input,false,h,s,idem,ct)).WithMetadata(new Permission("documents.trash.write"),new LifecycleEndpoint());
        g.MapDelete("/documents/{id:guid}",async(Guid id,[Microsoft.AspNetCore.Mvc.FromBody]DocumentTrashInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Change(id,input,false,h,s,idem,ct)).WithMetadata(new Permission("documents.trash.write"),new LifecycleEndpoint());
        g.MapPost("/documents/{id:guid}/restore",async(Guid id,DocumentTrashInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Change(id,input,true,h,s,idem,ct)).WithMetadata(new Permission("documents.trash.restore"),new LifecycleEndpoint());
    }
    private static async Task<IResult> Change(Guid id,DocumentTrashInput input,bool restore,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reason=Check.Text(input.Reason,"reason",2000);
        if(!long.TryParse(h.Request.Headers.IfMatch.ToString().Trim('"'),NumberStyles.None,CultureInfo.InvariantCulture,out var version)||version<1)throw new BusinessException("lifecycle_version_required","Supply If-Match as the current lifecycleVersion.",428);
        if(!long.TryParse(h.Request.Headers["X-Document-Version"],NumberStyles.None,CultureInfo.InvariantCulture,out var businessVersion)||businessVersion<1)throw new BusinessException("document_version_required","Supply X-Document-Version as the current business document version.",428);
        var action=restore?"RESTORE":"TRASH";
        // Scope is checked even when replaying a cached command response.
        await One(s,"SELECT platform.trash_access(@id,'READ'),platform.trash_access(@id,@action)",ct,new DbArg("id",id),new DbArg("action",action));
        var result=await idem.ExecuteAsync($"{action} /documents/{id}",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,businessVersion,reason}),async()=>
        {
            var json=(string)(await One(s,"SELECT platform.change_visibility(@id,@version,@business,@restore,@reason)::text AS result",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("business",businessVersion),new DbArg("restore",restore),new DbArg("reason",reason)))["result"]!;
            await Sql.AuditAsync(s,restore?"documents.restored":"documents.trashed","document",id,h.TraceIdentifier,ct,new{reason,documentVersion=businessVersion,lifecycleVersion=version+1});return new StoredResponse(200,json);
        },ct);return ApiJson.Result(result);
    }
    public static async Task CheckVisible(HttpContext h,CompanySession s,CancellationToken ct)
    {
        if(h.GetEndpoint()!.Metadata.GetMetadata<LifecycleEndpoint>() is not null)return;
        var path=h.Request.Path.Value??"";
        if(!new[]{"/api/v1/quotes/","/api/v1/sales-orders/","/api/v1/warehouse/orders/","/api/v1/sales-invoices/","/api/v1/sales-credit-notes/","/api/v1/purchase-orders/","/api/v1/warehouse/purchase-orders/","/api/v1/documents/"}.Any(p=>path.StartsWith(p,StringComparison.OrdinalIgnoreCase)))return;
        if(Guid.TryParse(h.Request.RouteValues["id"]?.ToString(),out var id))
        {
            var row=await One(s,"SELECT platform.document_visible(@id) AS visible",ct,new DbArg("id",id));
            if(!(bool)row["visible"]!)throw new BusinessException("not_found","Document is unavailable in this scope.",404);
        }
    }
}
