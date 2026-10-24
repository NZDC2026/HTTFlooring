using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.MasterData;

public sealed record LookupMaintenance(string Code, string Name, bool Active = true);
public sealed record WarehouseMaintenance(string Code, string Name, Guid? RegionId = null, string Kind = "SELLABLE", bool Active = true);
public sealed record ProductMaintenance(string Sku, string Name, Guid TaxCodeId, Guid? CategoryId = null, string ItemType = "STOCK", string Status = "ACTIVE", bool WholePacks = true, bool BuyEnabled = true, bool SellEnabled = true, decimal ReorderPoint = 0);
public sealed record ProductUnitMaintenance(Guid UomId, decimal ConversionToBase, decimal QuantityStep = 1, bool Active = true);

internal static class CatalogMaintenanceEndpoints
{
    public static void MapCatalog(RouteGroupBuilder group)
    {
        Lookup(group, "/uoms", "catalog.uoms", "catalog.read", "catalog.write");
        Lookup(group, "/product-categories", "catalog.product_categories", "catalog.read", "catalog.write");
        Lookup(group, "/regions", "core.regions", "warehouses.read", "warehouses.write");
        group.MapGet("/warehouses", async (HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize); var access = Access(h);
            return Results.Ok(new { items = (await Read(s, """
                SELECT w.* FROM catalog.warehouses w WHERE w.company_id=@company
                AND (@all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=@membership))
                ORDER BY w.code,w.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("all", access.Has("warehouses.all")), new DbArg("membership", access.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("warehouses.read"));
        group.MapGet("/warehouses/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(PublicRow(await Warehouse(h, s, id, ct)))).WithMetadata(new Permission("warehouses.read"));
        group.MapPost("/warehouses", CreateWarehouse).WithMetadata(new Permission("warehouses.write"));
        group.MapPut("/warehouses/{id:guid}", UpdateWarehouse).WithMetadata(new Permission("warehouses.write"));
        group.MapGet("/products/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(PublicRow(await One(s, "SELECT * FROM catalog.products WHERE company_id=@company AND id=@id", ct, new DbArg("id", id)))))
            .WithMetadata(new Permission("catalog.read"));
        group.MapPut("/products/{id:guid}", UpdateProduct).WithMetadata(new Permission("catalog.write"));
        group.MapPost("/products/{productId:guid}/units", CreateProductUnit).WithMetadata(new Permission("catalog.write"));
        group.MapPut("/products/{productId:guid}/units/{id:guid}", UpdateProductUnit).WithMetadata(new Permission("catalog.write"));
    }
    private static void Lookup(RouteGroupBuilder group, string path, string table, string readPermission, string writePermission)
    {
        group.MapGet(path, async (CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, $"SELECT id,code,name,active,version FROM {table} WHERE company_id=@company ORDER BY code,id LIMIT @size OFFSET @offset", ct, new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission(readPermission));
        group.MapGet(path + "/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(PublicRow(await One(s, $"SELECT id,code,name,active,version FROM {table} WHERE company_id=@company AND id=@id", ct, new DbArg("id", id)))))
            .WithMetadata(new Permission(readPermission));
        group.MapPost(path, async (LookupMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) =>
        {
            var d = input with { Code = Check.Code(input.Code), Name = Check.Text(input.Name, "name") };
            return await Create(h, s, idem, table, d, async id => { await Read(s, $"INSERT INTO {table}(id,company_id,code,name,active,created_by) VALUES(@id,@company,@code,@name,@active,@actor)", ct, new DbArg("id", id), new DbArg("code", d.Code), new DbArg("name", d.Name), new DbArg("active", d.Active)); }, ct);
        }).WithMetadata(new Permission(writePermission));
        group.MapPut(path + "/{id:guid}", async (Guid id, LookupMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) =>
        {
            var d = input with { Code = Check.Code(input.Code), Name = Check.Text(input.Name, "name") };
            return await Update(h, s, idem, table, id, d, async _ =>
            {
                if (table == "catalog.uoms" && !d.Active && (await Read(s, "SELECT id FROM catalog.product_units WHERE company_id=@company AND uom_id=@id AND active LIMIT 1", ct, new DbArg("id", id))).Count > 0)
                    throw new BusinessException("unit_in_use", "Deactivate dependent product units before the UOM.", 409);
                await Read(s, $"UPDATE {table} SET code=@code,name=@name,active=@active WHERE company_id=@company AND id=@id", ct, new DbArg("id", id), new DbArg("code", d.Code), new DbArg("name", d.Name), new DbArg("active", d.Active));
            }, ct);
        }).WithMetadata(new Permission(writePermission));
    }
    private static WarehouseMaintenance Normalize(WarehouseMaintenance d) => d with { Code = Check.Code(d.Code), Name = Check.Text(d.Name, "name"), Kind = Check.OneOf(d.Kind, "kind", "SELLABLE", "QUARANTINE", "TRANSIT") };
    private static async Task<Dictionary<string, object?>> Warehouse(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var access = Access(h);
        return await One(s, "SELECT w.* FROM catalog.warehouses w WHERE w.company_id=@company AND w.id=@id AND (@all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=@membership))", ct, new DbArg("id", id), new DbArg("all", access.Has("warehouses.all")), new DbArg("membership", access.MembershipId));
    }
    private static async Task<IResult> CreateWarehouse(WarehouseMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        if (!Access(h).Has("warehouses.all")) throw new BusinessException("permission_denied", "Creating warehouses requires company-wide warehouse scope.", 403);
        return await Create(h, s, idem, "catalog.warehouses", d, async id =>
        {
            if (d.RegionId is { } region) await Reference(s, "core.regions", region, ct, true);
            await Read(s, "INSERT INTO catalog.warehouses(id,company_id,code,name,region_id,kind,active,created_by) VALUES(@id,@company,@code,@name,@region,@kind,@active,@actor)", ct, WarehouseArgs(d, id));
        }, ct);
    }
    private static async Task<IResult> UpdateWarehouse(Guid id, WarehouseMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Warehouse(h, s, id, ct);
        return await Update(h, s, idem, "catalog.warehouses", id, d, async before =>
        {
            Check.That((string)before["kind"]! == d.Kind, "kind", "Warehouse purpose is immutable; use stock transfer for reclassification.");
            if (d.RegionId is { } region) await Reference(s, "core.regions", region, ct, true);
            await Read(s, "UPDATE catalog.warehouses SET code=@code,name=@name,region_id=@region,active=@active WHERE company_id=@company AND id=@id", ct, WarehouseArgs(d, id));
        }, ct);
    }
    private static DbArg[] WarehouseArgs(WarehouseMaintenance d, Guid id) => [new DbArg("id", id), new DbArg("code", d.Code), new DbArg("name", d.Name), new DbArg("region", d.RegionId, NpgsqlDbType.Uuid), new DbArg("kind", d.Kind), new DbArg("active", d.Active)];
    private static async Task<IResult> UpdateProduct(Guid id, ProductMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = input with { Sku = Check.Code(input.Sku, "sku"), Name = Check.Text(input.Name, "name"), ItemType = Check.OneOf(input.ItemType, "itemType", "STOCK", "NON_STOCK", "SERVICE"), Status = Check.OneOf(input.Status, "status", "ACTIVE", "INACTIVE"), ReorderPoint = Check.Amount(input.ReorderPoint, "reorderPoint", 6) };
        return await Update(h, s, idem, "catalog.products", id, d, async _ =>
        {
            await Reference(s, "accounting.tax_codes", d.TaxCodeId, ct);
            if (d.CategoryId is { } category) await Reference(s, "catalog.product_categories", category, ct, true);
            await Read(s, "UPDATE catalog.products SET sku=@sku,name=@name,item_type=@type,status=@status,tax_code_id=@tax,category_id=@category,whole_packs=@whole,buy_enabled=@buy,sell_enabled=@sell,reorder_point=@reorder WHERE company_id=@company AND id=@id", ct, new DbArg("id", id), new DbArg("sku", d.Sku), new DbArg("name", d.Name), new DbArg("type", d.ItemType), new DbArg("status", d.Status), new DbArg("tax", d.TaxCodeId), new DbArg("category", d.CategoryId, NpgsqlDbType.Uuid), new DbArg("whole", d.WholePacks), new DbArg("buy", d.BuyEnabled), new DbArg("sell", d.SellEnabled), new DbArg("reorder", d.ReorderPoint));
        }, ct);
    }
    private static ProductUnitMaintenance Normalize(ProductUnitMaintenance d)
    {
        Check.Amount(d.ConversionToBase, "conversionToBase", 6); Check.Amount(d.QuantityStep, "quantityStep", 6);
        Check.That(d.ConversionToBase > 0 && d.QuantityStep > 0, "conversionToBase", "Conversion and quantity step must be positive.");
        return d;
    }
    private static async Task<IResult> CreateProductUnit(Guid productId, ProductUnitMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Reference(s, "catalog.products", productId, ct);
        return await Create(h, s, idem, "catalog.product_units", d, async id =>
        {
            await Reference(s, "catalog.uoms", d.UomId, ct, true);
            await Read(s, "INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base,quantity_step,active,created_by) VALUES(@id,@company,@product,@uom,@conversion,@step,@active,@actor)", ct, UnitArgs(d, id, productId));
        }, ct);
    }
    private static async Task<IResult> UpdateProductUnit(Guid productId, Guid id, ProductUnitMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        await One(s, "SELECT id FROM catalog.product_units WHERE company_id=@company AND product_id=@product AND id=@id", ct, new DbArg("product", productId), new DbArg("id", id));
        return await Update(h, s, idem, "catalog.product_units", id, d, async before =>
        {
            Check.That((Guid)before["uom_id"]! == d.UomId, "uomId", "Product unit identity cannot be changed.");
            if (d.ConversionToBase != (decimal)before["conversion_to_base"]! || d.QuantityStep != (decimal)before["quantity_step"]!)
            {
                var used = await Read(s, "SELECT 1 FROM pricing.price_list_items WHERE company_id=@company AND product_unit_id=@id UNION ALL SELECT 1 FROM pricing.customer_price_rules WHERE company_id=@company AND product_unit_id=@id UNION ALL SELECT 1 FROM pricing.promotion_items WHERE company_id=@company AND product_unit_id=@id UNION ALL SELECT 1 FROM pricing.price_floor_rules WHERE company_id=@company AND product_unit_id=@id LIMIT 1", ct, new DbArg("id", id));
                if (used.Count > 0) throw new BusinessException("unit_in_use", "Conversion and step are locked once referenced by pricing. Add a new product/unit instead.", 409);
            }
            if (d.Active) await Reference(s, "catalog.uoms", d.UomId, ct, true);
            await Read(s, "UPDATE catalog.product_units SET conversion_to_base=@conversion,quantity_step=@step,active=@active WHERE company_id=@company AND product_id=@product AND id=@id", ct, UnitArgs(d, id, productId));
        }, ct);
    }
    private static DbArg[] UnitArgs(ProductUnitMaintenance d, Guid id, Guid product) => [new DbArg("id", id), new DbArg("product", product), new DbArg("uom", d.UomId), new DbArg("conversion", d.ConversionToBase), new DbArg("step", d.QuantityStep), new DbArg("active", d.Active)];
}
