using Htt.Host.Api.MasterData;

namespace Htt.Host.Api;

public static class MasterDataEndpoints
{
    public static void MapMasterData(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        CrmMaintenanceEndpoints.MapCrm(group);
        CatalogMaintenanceEndpoints.MapCatalog(group);
        PricingMaintenanceEndpoints.MapPricing(group);
    }
}
