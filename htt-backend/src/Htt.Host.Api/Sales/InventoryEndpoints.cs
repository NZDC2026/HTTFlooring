using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.Sales;

internal static class InventoryEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/inventory/availability", async (Guid warehouseId, Guid? productId, HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize); var a = Access(h);
            var warehouse = await One(s, "SELECT w.id,w.kind,w.active FROM catalog.warehouses w WHERE w.company_id=@company AND w.id=@id AND (@all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=@membership))", ct, new DbArg("id", warehouseId), new DbArg("all", a.Has("warehouses.all")), new DbArg("membership", a.MembershipId));
            var rows = await Read(s, "SELECT b.product_id,p.sku,bu.code AS base_unit_code,b.on_hand,b.reserved,CASE WHEN @sellable AND p.status='ACTIVE' AND p.sell_enabled AND p.item_type='STOCK' THEN b.on_hand-b.reserved ELSE 0 END AS available FROM inventory.stock_balances b JOIN catalog.products p ON p.company_id=b.company_id AND p.id=b.product_id JOIN catalog.uoms bu ON bu.company_id=p.company_id AND bu.id=p.base_uom_id WHERE b.company_id=@company AND b.warehouse_id=@warehouse AND (@product IS NULL OR b.product_id=@product) ORDER BY p.sku,b.id LIMIT @size OFFSET @offset", ct, new DbArg("warehouse", warehouseId), new DbArg("sellable", (string)warehouse["kind"]! == "SELLABLE" && (bool)warehouse["active"]!), new DbArg("product", productId, NpgsqlTypes.NpgsqlDbType.Uuid), new DbArg("size", size), new DbArg("offset", offset));
            return Results.Ok(new { warehouseId, warehouseKind = warehouse["kind"], items = rows.Select(PublicRow), page = page ?? 1, pageSize = size, dataAsOf = DateTimeOffset.UtcNow });
        }).WithMetadata(new Permission("inventory.read"));
        g.MapGet("/customers/{id:guid}/credit", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, id, ct);
            return Results.Ok(PublicRow(await One(s, "SELECT c.id AS customer_id,'AUD'::text AS currency,c.status,c.credit_limit,e.receivable,e.unbilled_orders,e.available_advances,GREATEST(0,e.receivable+e.unbilled_orders-e.available_advances) AS exposure,c.credit_limit-GREATEST(0,e.receivable+e.unbilled_orders-e.available_advances) AS available_credit FROM crm.customers c JOIN crm.customer_credit_exposures e ON e.company_id=c.company_id AND e.customer_id=c.id WHERE c.company_id=@company AND c.id=@id", ct, new DbArg("id", id))));
        }).WithMetadata(new Permission("sales.credit.read"));
    }
}
