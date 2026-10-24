using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using System.Text.Json.Serialization;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.MasterData;

public sealed record StandardPriceMaintenance(Guid ProductUnitId, [property: JsonRequired] decimal Amount, DateTimeOffset EffectiveFrom, DateTimeOffset? EffectiveTo = null, bool Active = true);
public sealed record CustomerPriceMaintenance(Guid CustomerId, Guid ProductUnitId, string Method, decimal? FixedPrice, decimal? DiscountPercent, DateTimeOffset EffectiveFrom, DateTimeOffset? EffectiveTo = null, bool Active = true);
public sealed record PromotionItemMaintenance(Guid ProductUnitId, [property: JsonRequired] decimal Amount);
public sealed record PromotionMaintenance(string Name, DateTimeOffset StartsAt, DateTimeOffset EndsAt, PromotionItemMaintenance[] Items, bool Active = true);
public sealed record FloorMaintenance(Guid ProductUnitId, [property: JsonRequired] decimal Amount, bool Active = true);

internal static class PricingMaintenanceEndpoints
{
    public static void MapPricing(RouteGroupBuilder group)
    {
        group.MapGet("/pricing/price-lists", async (CompanySession s, CancellationToken ct) => Results.Ok((await Read(s, "SELECT id,code,currency,inclusive,version FROM pricing.price_lists WHERE company_id=@company ORDER BY code", ct)).Select(PublicRow)))
            .WithMetadata(new Permission("pricing.manage.read"));
        List(group, "/pricing/standard-prices", "pricing.price_list_items", "pricing.manage.read");
        List(group, "/pricing/promotions", "pricing.promotions", "pricing.manage.read");
        List(group, "/pricing/floors", "pricing.price_floor_rules", "pricing.floor.read");
        group.MapGet("/pricing/customer-prices", async (HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize); var access = Access(h);
            return Results.Ok(new { items = (await Read(s, "SELECT r.* FROM pricing.customer_price_rules r WHERE r.company_id=@company AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=r.company_id AND a.customer_id=r.customer_id AND a.membership_id=@membership)) ORDER BY r.created_at,r.id LIMIT @size OFFSET @offset", ct, new DbArg("all", access.Has("customers.all")), new DbArg("membership", access.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("pricing.manage.read"));
        group.MapGet("/pricing/customer-prices/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            var row = await One(s, "SELECT * FROM pricing.customer_price_rules WHERE company_id=@company AND id=@id", ct, new DbArg("id", id));
            await Customer(h, s, (Guid)row["customer_id"]!, ct); return Results.Ok(PublicRow(row));
        }).WithMetadata(new Permission("pricing.manage.read"));
        group.MapGet("/pricing/promotions/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(new
        {
            promotion = PublicRow(await One(s, "SELECT * FROM pricing.promotions WHERE company_id=@company AND id=@id", ct, new DbArg("id", id))),
            items = (await Read(s, "SELECT id,product_unit_id,amount,active,version FROM pricing.promotion_items WHERE company_id=@company AND promotion_id=@id ORDER BY product_unit_id", ct, new DbArg("id", id))).Select(PublicRow)
        })).WithMetadata(new Permission("pricing.manage.read"));
        group.MapPost("/pricing/standard-prices", CreateStandard).WithMetadata(new Permission("pricing.write"));
        group.MapPut("/pricing/standard-prices/{id:guid}", UpdateStandard).WithMetadata(new Permission("pricing.write"));
        group.MapPost("/pricing/customer-prices", CreateCustomerPrice).WithMetadata(new Permission("pricing.write"));
        group.MapPut("/pricing/customer-prices/{id:guid}", UpdateCustomerPrice).WithMetadata(new Permission("pricing.write"));
        group.MapPost("/pricing/promotions", CreatePromotion).WithMetadata(new Permission("pricing.write"));
        group.MapPut("/pricing/promotions/{id:guid}", UpdatePromotion).WithMetadata(new Permission("pricing.write"));
        group.MapPost("/pricing/floors", CreateFloor).WithMetadata(new Permission("pricing.floor.write"));
        group.MapPut("/pricing/floors/{id:guid}", UpdateFloor).WithMetadata(new Permission("pricing.floor.write"));
    }
    private static void List(RouteGroupBuilder group, string path, string table, string permission)
    {
        group.MapGet(path, async (CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, $"SELECT * FROM {table} WHERE company_id=@company ORDER BY created_at,id LIMIT @size OFFSET @offset", ct, new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission(permission));
        if (table == "pricing.promotions") return;
        group.MapGet(path + "/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(PublicRow(await One(s, $"SELECT * FROM {table} WHERE company_id=@company AND id=@id", ct, new DbArg("id", id)))))
            .WithMetadata(new Permission(permission));
    }
    private static StandardPriceMaintenance Normalize(StandardPriceMaintenance d)
    {
        Check.Dates(d.EffectiveFrom, d.EffectiveTo); Check.Amount(d.Amount);
        return d with { EffectiveFrom = d.EffectiveFrom.ToUniversalTime(), EffectiveTo = d.EffectiveTo?.ToUniversalTime() };
    }
    private static CustomerPriceMaintenance Normalize(CustomerPriceMaintenance d)
    {
        Check.Dates(d.EffectiveFrom, d.EffectiveTo); Check.OneOf(d.Method, "method", "FIXED_PRICE", "DISCOUNT_PERCENT");
        if (d.Method == "FIXED_PRICE")
        {
            Check.That(d.FixedPrice is not null && d.DiscountPercent is null, "fixedPrice", "Fixed pricing requires only fixedPrice."); Check.Amount(d.FixedPrice!.Value, "fixedPrice");
        }
        else
        {
            Check.That(d.FixedPrice is null && d.DiscountPercent is >= 0 and <= 100 && decimal.Round(d.DiscountPercent.Value, 6) == d.DiscountPercent, "discountPercent", "Discount pricing requires only discountPercent, 0..100 with at most six decimals.");
        }
        return d with { EffectiveFrom = d.EffectiveFrom.ToUniversalTime(), EffectiveTo = d.EffectiveTo?.ToUniversalTime() };
    }
    private static PromotionMaintenance Normalize(PromotionMaintenance d)
    {
        Check.Dates(d.StartsAt, d.EndsAt);
        Check.That(d.Items is not null && d.Items.Length < 101 && (!d.Active || d.Items.Length > 0) && d.Items.All(x => x is not null && x.ProductUnitId != Guid.Empty) && d.Items.Select(x => x.ProductUnitId).Distinct().Count() == d.Items.Length, "items", "Active promotions need 1..100 distinct product units.");
        foreach (var item in d.Items!) Check.Amount(item.Amount);
        return d with { Name = Check.Text(d.Name, "name"), StartsAt = d.StartsAt.ToUniversalTime(), EndsAt = d.EndsAt.ToUniversalTime(), Items = d.Items!.OrderBy(x => x.ProductUnitId).ToArray() };
    }
    private static async Task Unit(CompanySession s, Guid unit, bool active, CancellationToken ct)
    {
        await One(s, "SELECT u.id FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=@company AND u.id=@unit AND (NOT @active OR (u.active AND m.active AND p.status='ACTIVE' AND p.sell_enabled)) FOR UPDATE OF u", ct, new DbArg("unit", unit), new DbArg("active", active));
    }
    private static async Task Floor(CompanySession s, Guid unit, decimal amount, bool active, CancellationToken ct)
    {
        if (!active) return;
        var rows = await Read(s, "SELECT amount FROM pricing.price_floor_rules WHERE company_id=@company AND product_unit_id=@unit AND active", ct, new DbArg("unit", unit));
        if (rows.Count > 0 && amount < (decimal)rows[0]["amount"]!) throw new BusinessException("price_below_floor", "Price needs review against the configured floor.");
    }
    private static void Same(Dictionary<string, object?> before, string field, Guid value) => Check.That((Guid)before[field]! == value, field, "Rule ownership and product unit are immutable; deactivate and create a new rule.");
    private static async Task<IResult> CreateStandard(StandardPriceMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        return await Create(h, s, idem, "pricing.price_list_items", d, async id =>
        {
            await Unit(s, d.ProductUnitId, d.Active, ct); await Floor(s, d.ProductUnitId, d.Amount, d.Active, ct);
            await Read(s, "INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from,effective_to,active,created_by) SELECT @id,@company,id,@unit,@amount,@start,@end,@active,@actor FROM pricing.price_lists WHERE company_id=@company AND code='STANDARD' AND currency='AUD'", ct, StandardArgs(d, id));
        }, ct);
    }
    private static async Task<IResult> UpdateStandard(Guid id, StandardPriceMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        return await Update(h, s, idem, "pricing.price_list_items", id, d, async before =>
        {
            Same(before, "product_unit_id", d.ProductUnitId); await Unit(s, d.ProductUnitId, d.Active, ct); await Floor(s, d.ProductUnitId, d.Amount, d.Active, ct);
            await Read(s, "UPDATE pricing.price_list_items SET amount=@amount,effective_from=@start,effective_to=@end,active=@active WHERE company_id=@company AND id=@id", ct, StandardArgs(d, id));
        }, ct);
    }
    private static DbArg[] StandardArgs(StandardPriceMaintenance d, Guid id) => [new DbArg("id", id), new DbArg("unit", d.ProductUnitId), new DbArg("amount", d.Amount), new DbArg("start", d.EffectiveFrom), new DbArg("end", d.EffectiveTo, NpgsqlDbType.TimestampTz), new DbArg("active", d.Active)];
    private static async Task<IResult> CreateCustomerPrice(CustomerPriceMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Customer(h, s, d.CustomerId, ct);
        return await Create(h, s, idem, "pricing.customer_price_rules", d, async id =>
        {
            await Unit(s, d.ProductUnitId, d.Active, ct); if (d.FixedPrice is { } amount) await Floor(s, d.ProductUnitId, amount, d.Active, ct);
            await Read(s, "INSERT INTO pricing.customer_price_rules(id,company_id,customer_id,product_unit_id,method,fixed_price,discount_percent,effective_from,effective_to,active,created_by) VALUES(@id,@company,@customer,@unit,@method,@fixed,@discount,@start,@end,@active,@actor)", ct, CustomerArgs(d, id));
        }, ct);
    }
    private static async Task<IResult> UpdateCustomerPrice(Guid id, CustomerPriceMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Customer(h, s, d.CustomerId, ct);
        await One(s, "SELECT id FROM pricing.customer_price_rules WHERE company_id=@company AND id=@id AND customer_id=@customer", ct, new DbArg("id", id), new DbArg("customer", d.CustomerId));
        return await Update(h, s, idem, "pricing.customer_price_rules", id, d, async before =>
        {
            Same(before, "customer_id", d.CustomerId); Same(before, "product_unit_id", d.ProductUnitId);
            await Unit(s, d.ProductUnitId, d.Active, ct); if (d.FixedPrice is { } amount) await Floor(s, d.ProductUnitId, amount, d.Active, ct);
            await Read(s, "UPDATE pricing.customer_price_rules SET method=@method,fixed_price=@fixed,discount_percent=@discount,effective_from=@start,effective_to=@end,active=@active WHERE company_id=@company AND id=@id", ct, CustomerArgs(d, id));
        }, ct);
    }
    private static DbArg[] CustomerArgs(CustomerPriceMaintenance d, Guid id) => [new DbArg("id", id), new DbArg("customer", d.CustomerId), new DbArg("unit", d.ProductUnitId), new DbArg("method", d.Method), new DbArg("fixed", d.FixedPrice, NpgsqlDbType.Numeric), new DbArg("discount", d.DiscountPercent, NpgsqlDbType.Numeric), new DbArg("start", d.EffectiveFrom), new DbArg("end", d.EffectiveTo, NpgsqlDbType.TimestampTz), new DbArg("active", d.Active)];
    private static async Task<IResult> CreatePromotion(PromotionMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        return await Create(h, s, idem, "pricing.promotions", d, async id =>
        {
            await ValidateItems(s, d, ct);
            await Read(s, "INSERT INTO pricing.promotions(id,company_id,name,starts_at,ends_at,active,created_by) VALUES(@id,@company,@name,@start,@end,@active,@actor)", ct, PromotionArgs(d, id));
            await SaveItems(s, id, d.Items, ct);
        }, ct);
    }
    private static async Task<IResult> UpdatePromotion(Guid id, PromotionMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        return await Update(h, s, idem, "pricing.promotions", id, d, async before =>
        {
            await ValidateItems(s, d, ct);
            before["items"] = (await Read(s, "SELECT id,product_unit_id,amount,active,version FROM pricing.promotion_items WHERE company_id=@company AND promotion_id=@id ORDER BY product_unit_id", ct, new DbArg("id", id))).Select(PublicRow).ToArray();
            await Read(s, "UPDATE pricing.promotions SET name=@name,starts_at=@start,ends_at=@end,active=@active WHERE company_id=@company AND id=@id", ct, PromotionArgs(d, id));
            await SaveItems(s, id, d.Items, ct);
        }, ct);
    }
    private static async Task ValidateItems(CompanySession s, PromotionMaintenance d, CancellationToken ct)
    {
        // Sorted unit locks give promotions and other pricing writes a deterministic lock order.
        foreach (var item in d.Items) { await Unit(s, item.ProductUnitId, d.Active, ct); await Floor(s, item.ProductUnitId, item.Amount, d.Active, ct); }
    }
    private static async Task SaveItems(CompanySession s, Guid id, PromotionItemMaintenance[] items, CancellationToken ct)
    {
        await Read(s, "UPDATE pricing.promotion_items SET active=false WHERE company_id=@company AND promotion_id=@id", ct, new DbArg("id", id));
        foreach (var item in items)
            await Read(s, "INSERT INTO pricing.promotion_items(company_id,promotion_id,product_unit_id,amount,active,created_by) VALUES(@company,@id,@unit,@amount,true,@actor) ON CONFLICT(company_id,promotion_id,product_unit_id) DO UPDATE SET amount=EXCLUDED.amount,active=true", ct, new DbArg("id", id), new DbArg("unit", item.ProductUnitId), new DbArg("amount", item.Amount));
    }
    private static DbArg[] PromotionArgs(PromotionMaintenance d, Guid id) => [new DbArg("id", id), new DbArg("name", d.Name), new DbArg("start", d.StartsAt), new DbArg("end", d.EndsAt), new DbArg("active", d.Active)];
    private static async Task<IResult> CreateFloor(FloorMaintenance d, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        Check.Amount(d.Amount);
        return await Create(h, s, idem, "pricing.price_floor_rules", d, async id => { await Unit(s, d.ProductUnitId, d.Active, ct); await Read(s, "INSERT INTO pricing.price_floor_rules(id,company_id,product_unit_id,amount,active,created_by) VALUES(@id,@company,@unit,@amount,@active,@actor)", ct, FloorArgs(d, id)); }, ct);
    }
    private static async Task<IResult> UpdateFloor(Guid id, FloorMaintenance d, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        Check.Amount(d.Amount);
        return await Update(h, s, idem, "pricing.price_floor_rules", id, d, async before => { Same(before, "product_unit_id", d.ProductUnitId); await Unit(s, d.ProductUnitId, d.Active, ct); await Read(s, "UPDATE pricing.price_floor_rules SET amount=@amount,active=@active WHERE company_id=@company AND id=@id", ct, FloorArgs(d, id)); }, ct);
    }
    private static DbArg[] FloorArgs(FloorMaintenance d, Guid id) => [new DbArg("id", id), new DbArg("unit", d.ProductUnitId), new DbArg("amount", d.Amount), new DbArg("active", d.Active)];
}
