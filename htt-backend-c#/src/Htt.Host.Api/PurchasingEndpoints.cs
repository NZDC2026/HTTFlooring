using Htt.Host.Api.Purchasing;

namespace Htt.Host.Api;

public static class PurchasingEndpoints
{
    public static void MapPurchasing(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        PurchaseEndpoints.Map(group);
        SupplierBillEndpoints.Map(group);
        SupplierPaymentEndpoints.Map(group);
        PurchaseReturnEndpoints.Map(group);
    }
}
