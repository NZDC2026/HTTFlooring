using Htt.Host.Api.Sales;

namespace Htt.Host.Api;

public static class SalesEndpoints
{
    public static void MapSales(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        QuoteEndpoints.Map(group);
        OrderEndpoints.Map(group);
        InventoryEndpoints.Map(group);
        FulfilmentEndpoints.Map(group);
        InvoiceEndpoints.Map(group);
        ReceiptEndpoints.Map(group);
        ReturnEndpoints.Map(group);
    }
}
