using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;

namespace Htt.Host.Api.Portal;

internal sealed record PortalContext(string Issuer,string Subject,Guid Company,Guid Grant);
internal sealed record PortalScope(bool Required=true);
internal sealed class PortalFilter:IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context,EndpointFilterDelegate next)
    {
        var http=context.HttpContext;var(iss,sub)=PrincipalIdentity.External(http.User);var scope=http.GetEndpoint()!.Metadata.GetMetadata<PortalScope>()?.Required??true;
        Guid company=default,grant=default;
        if(scope && (!Guid.TryParse(http.Request.Headers["X-Company-Id"],out company)||company==Guid.Empty || !Guid.TryParse(http.Request.Headers["X-Portal-Grant-Id"],out grant)||grant==Guid.Empty))
            throw new BusinessException("portal_context_required","Select a company and portal grant using X-Company-Id and X-Portal-Grant-Id.",400);
        http.Items[typeof(PortalContext)]=new PortalContext(iss,sub,company,grant);
        var session=http.RequestServices.GetRequiredService<PortalSession>();await session.BeginAsync(http.RequestAborted);
        var result=await next(context);await session.CommitAsync(http.RequestAborted);return result;
    }
}

internal static class PortalEndpoints
{
    public static void MapPortal(this WebApplication app)
    {
        var group=app.MapGroup("/api/portal/v1").RequireAuthorization("customer-portal").RequireRateLimiting("portal").AddEndpointFilter<PortalFilter>();
        group.MapGet("/me",async(HttpContext h,PortalSession s,CancellationToken ct)=>
        {var c=Context(h);return Json(await s.QueryAsync("SELECT portal.me(@iss,@sub)::text",ct,("iss",c.Issuer,NpgsqlDbType.Text),("sub",c.Subject,NpgsqlDbType.Text)));}).WithMetadata(new PortalScope(false));
        group.MapGet("/branches",async(HttpContext h,PortalSession s,CancellationToken ct)=>Json(await Query(h,s,"SELECT portal.branches(@iss,@sub,@company,@grant)::text",ct)));
        group.MapGet("/warehouses",async(Guid branchId,HttpContext h,PortalSession s,CancellationToken ct)=>Json(await Query(h,s,"SELECT portal.warehouses(@iss,@sub,@company,@grant,@branch)::text",ct,("branch",branchId,NpgsqlDbType.Uuid))));
        group.MapGet("/products",async(Guid branchId,string? search,int? page,int? pageSize,string? sort,Guid? categoryId,string? stockStatus,HttpContext h,PortalSession s,CancellationToken ct)=>
            Json(await Query(h,s,"SELECT portal.products(@iss,@sub,@company,@grant,@branch,@search,@page,@size,@sort,@category,@status)::text",ct,
                ("branch",branchId,NpgsqlDbType.Uuid),("search",search?.Trim()??"",NpgsqlDbType.Text),("page",page??1,NpgsqlDbType.Integer),("size",pageSize??25,NpgsqlDbType.Integer),("sort",sort??"sku",NpgsqlDbType.Text),("category",categoryId,NpgsqlDbType.Uuid),("status",stockStatus??"ALL",NpgsqlDbType.Text))));
        group.MapGet("/products/{id:guid}",async(Guid id,Guid branchId,HttpContext h,PortalSession s,CancellationToken ct)=>Json(await Query(h,s,"SELECT portal.product(@iss,@sub,@company,@grant,@branch,@product)::text",ct,("branch",branchId,NpgsqlDbType.Uuid),("product",id,NpgsqlDbType.Uuid))));
        group.MapGet("/products/{id:guid}/availability",async(Guid id,Guid branchId,Guid? warehouseId,HttpContext h,PortalSession s,CancellationToken ct)=>Json(await Query(h,s,"SELECT portal.availability(@iss,@sub,@company,@grant,@branch,@product,@warehouse)::text",ct,("branch",branchId,NpgsqlDbType.Uuid),("product",id,NpgsqlDbType.Uuid),("warehouse",warehouseId,NpgsqlDbType.Uuid))));
    }
    private static PortalContext Context(HttpContext h)=>(PortalContext)h.Items[typeof(PortalContext)]!;
    private static IResult Json(string json)=>Results.Content(json,"application/json");
    private static Task<string> Query(HttpContext h,PortalSession s,string sql,CancellationToken ct,params(string,object?,NpgsqlDbType)[] args)
    {
        var c=Context(h);return s.QueryAsync(sql,ct,new[]{("iss",(object?)c.Issuer,NpgsqlDbType.Text),("sub",(object?)c.Subject,NpgsqlDbType.Text),("company",(object?)c.Company,NpgsqlDbType.Uuid),("grant",(object?)c.Grant,NpgsqlDbType.Uuid)}.Concat(args).ToArray());
    }
}
