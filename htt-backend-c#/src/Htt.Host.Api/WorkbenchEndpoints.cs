using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
namespace Htt.Host.Api;
internal static class WorkbenchEndpoints
{
    private static async Task<IResult> Query(string kind,object filter,HttpContext h,CompanySession s,CancellationToken ct)
    {
        h.Response.Headers.CacheControl="no-store";
        var row=await One(s,"SELECT workbench.query(@kind,@filter)::text AS body",ct,
            new DbArg("kind",kind),new DbArg("filter",JsonSerializer.Serialize(filter,ApiJson.Options),NpgsqlDbType.Jsonb));
        return Results.Content((string)row["body"]!,"application/json");
    }
    public static void Map(RouteGroupBuilder g)
    {
        g=g.MapGroup("/workbench");
        g.MapGet("/finance",async(DateOnly? from,DateOnly? to,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("FINANCE",new{from,to,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.finance.read"));
        g.MapGet("/sales",async(DateOnly? from,DateOnly? to,Guid? customerId,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("SALES",new{from,to,customerId,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.sales.read"));
        g.MapGet("/office",async(DateOnly? from,DateOnly? to,Guid? customerId,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("OFFICE",new{from,to,customerId,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.office.read"));
        g.MapGet("/customers/{id:guid}",async(Guid id,DateOnly? from,DateOnly? to,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("CUSTOMER",new{from,to,customerId=id,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.customers.read"));
        g.MapGet("/banks",async(DateOnly? asOf,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("BANKS",new{asOf,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.banks.read"));
        g.MapGet("/warehouse",async(Guid? warehouseId,int? page,int? pageSize,HttpContext h,CompanySession s,CancellationToken ct)=>
            await Query("WAREHOUSE",new{warehouseId,page,pageSize},h,s,ct)).WithMetadata(new Permission("workbench.warehouse.read"));
    }
}
