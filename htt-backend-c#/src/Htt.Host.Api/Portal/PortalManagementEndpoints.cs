using System.Text.Json.Serialization;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Portal;

public sealed record PortalBranchInput(Guid BranchId,Guid[] WarehouseIds);
public sealed record PortalAccessInput(string Issuer,string Subject,string DisplayName,[property:JsonRequired] bool Enabled,PortalBranchInput[] Branches);
public sealed record PortalAccessUpdate([property:JsonRequired] bool Enabled,PortalBranchInput[] Branches);
public sealed record PortalPublicationInput([property:JsonRequired] bool Published,[property:JsonRequired] bool AllCustomers,string Description,[property:JsonRequired] decimal LowStockQuantity,Guid[] CustomerIds,string[] Barcodes);

internal static class PortalManagementEndpoints
{
    public static void MapPortalManagement(this WebApplication app)
    {
        var g=app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        g.MapPost("/customers/{id:guid}/portal-access",CreateAccess).WithMetadata(new Permission("portal.access.manage"));
        g.MapGet("/portal-access/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content((string)(await One(s,"SELECT portal.access_view(@id)::text AS result",ct,new DbArg("id",id)))["result"]!,"application/json")).WithMetadata(new Permission("portal.access.read"));
        g.MapPut("/portal-access/{id:guid}",UpdateAccess).WithMetadata(new Permission("portal.access.manage"));
        g.MapGet("/portal/catalog/products/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Content((string)(await One(s,"SELECT portal.publication_view(@id)::text AS result",ct,new DbArg("id",id)))["result"]!,"application/json")).WithMetadata(new Permission("portal.catalog.write"));
        g.MapPost("/portal/catalog/products/{id:guid}",async(Guid id,PortalPublicationInput draft,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Publish(id,null,draft,h,s,idem,ct)).WithMetadata(new Permission("portal.catalog.write"));
        g.MapPut("/portal/catalog/products/{id:guid}",async(Guid id,PortalPublicationInput draft,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Publish(id,Version(h),draft,h,s,idem,ct)).WithMetadata(new Permission("portal.catalog.write"));
    }
    private static PortalBranchInput[] Scopes(bool enabled,PortalBranchInput[]? branches)
    {
        Check.That(branches is{Length:<=20} && (!enabled||branches.Length>0) && branches.All(x=>x is not null && x.BranchId!=Guid.Empty && x.WarehouseIds is{Length:>=1 and <=20} && x.WarehouseIds.All(w=>w!=Guid.Empty) && x.WarehouseIds.Distinct().Count()==x.WarehouseIds.Length) && branches.Select(x=>x.BranchId).Distinct().Count()==branches.Length,"branches","Use up to 20 distinct branches with 1..20 explicit warehouses; enabled access cannot be empty.");
        return branches!.OrderBy(x=>x.BranchId).Select(x=>x with{WarehouseIds=x.WarehouseIds.Order().ToArray()}).ToArray();
    }
    private static async Task<IResult> CreateAccess(Guid id,PortalAccessInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        await Customer(h,s,id,ct);var issuer=Check.Text(input.Issuer,"issuer",500);Check.That(Uri.TryCreate(issuer,UriKind.Absolute,out var u)&&u.Scheme=="https" && string.IsNullOrEmpty(u.UserInfo)&&string.IsNullOrEmpty(u.Query)&&string.IsNullOrEmpty(u.Fragment),"issuer","Provide the exact HTTPS token issuer.");
        var subject=Check.Text(input.Subject,"subject",255);var display=Check.Text(input.DisplayName,"displayName",200);Check.That(!subject.Any(char.IsControl)&&!display.Any(char.IsControl),"subject","Identity fields cannot contain control characters.");var scopes=Scopes(input.Enabled,input.Branches);
        var result=await idem.ExecuteAsync($"POST /customers/{id}/portal-access",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,issuer,subject,display,input.Enabled,scopes}),async()=>
        {
            var grant=(Guid)(await One(s,"SELECT portal.create_access(@customer,@issuer,@subject,@display,@enabled,@scopes) AS id",ct,new DbArg("customer",id),new DbArg("issuer",issuer),new DbArg("subject",subject),new DbArg("display",display),new DbArg("enabled",input.Enabled),new DbArg("scopes",Json(scopes),NpgsqlDbType.Jsonb)))["id"]!;
            await Sql.AuditAsync(s,"portal.access_created","portal_access",grant,h.TraceIdentifier,ct,new{customerId=id,enabled=input.Enabled,branchCount=scopes.Length});return ApiJson.Stored(new{id=grant,version=1});
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> UpdateAccess(Guid id,PortalAccessUpdate input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        // Recheck row scope even for a cached idempotency response.
        await One(s,"SELECT portal.access_view(@id)",ct,new DbArg("id",id));var version=Version(h);var scopes=Scopes(input.Enabled,input.Branches);
        var result=await idem.ExecuteAsync($"PUT /portal-access/{id}",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,input.Enabled,scopes}),async()=>
        {await Read(s,"SELECT portal.update_access(@id,@version,@enabled,@scopes)",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("enabled",input.Enabled),new DbArg("scopes",Json(scopes),NpgsqlDbType.Jsonb));await Sql.AuditAsync(s,"portal.access_changed","portal_access",id,h.TraceIdentifier,ct,new{input.Enabled,branchCount=scopes.Length});return ApiJson.Stored(new{id,version=version+1},200);},ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Publish(Guid id,long? version,PortalPublicationInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        if(!Access(h).Has("catalog.write")||!Access(h).Has("customers.all"))throw new BusinessException("forbidden","Catalogue publication requires catalogue maintenance and company-wide customer access.",403);
        Check.That(input.CustomerIds is{Length:<=100} && input.CustomerIds.All(x=>x!=Guid.Empty) && input.CustomerIds.Distinct().Count()==input.CustomerIds.Length && (!input.AllCustomers || input.CustomerIds.Length==0),"customerIds","Choose allCustomers or an explicit distinct audience (max 100).");
        var description=Check.Optional(input.Description,"description",2000)??"";var low=Check.Amount(input.LowStockQuantity,"lowStockQuantity",6);
        Check.That(input.Barcodes is{Length:<=20} && input.Barcodes.All(x=>x is not null && x.Length is >=1 and <=80),"barcodes","Supply up to 20 barcode strings.");
        var barcodes=input.Barcodes.Select(x=>x.Trim().ToUpperInvariant()).Order(StringComparer.Ordinal).ToArray();Check.That(barcodes.Distinct().Count()==barcodes.Length && barcodes.All(x=>x.Length>0 && x.All(c=>char.IsAsciiLetterOrDigit(c)||c is '.' or '_' or '-')),"barcodes","Barcodes must be unique ASCII letters/digits with . _ -.");var customers=input.CustomerIds.Order().ToArray();
        var response=await idem.ExecuteAsync($"{h.Request.Method} /portal/catalog/products/{id}",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,input.Published,input.AllCustomers,description,low,customers,barcodes}),async()=>
        {await Read(s,"SELECT portal.publish_product(@id,@version,@published,@all,@description,@low,@customers,@barcodes)",ct,new DbArg("id",id),new DbArg("version",version,NpgsqlDbType.Bigint),new DbArg("published",input.Published),new DbArg("all",input.AllCustomers),new DbArg("description",description),new DbArg("low",low),new DbArg("customers",customers,NpgsqlDbType.Array|NpgsqlDbType.Uuid),new DbArg("barcodes",barcodes,NpgsqlDbType.Array|NpgsqlDbType.Text));await Sql.AuditAsync(s,"portal.product_published","product",id,h.TraceIdentifier,ct,new{input.Published,input.AllCustomers,customerCount=customers.Length});return ApiJson.Stored(new{productId=id,version=(version??0)+1},version is null?201:200);},ct);return ApiJson.Result(response);
    }
}
