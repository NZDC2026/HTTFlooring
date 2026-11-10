using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Htt.Infrastructure;
using Htt.SharedKernel;
using Htt.Host.Api.MasterData;

namespace Htt.Host.Api.Sales;

internal sealed record PriceFacts(decimal UnitPrice, decimal? Floor, string Source, Guid RuleId, string Signature,
    Dictionary<string, object?> Data, DateTimeOffset PricingAt)
{
    public object Public(Guid customerId, Guid productUnitId) => new
    {
        customerId,
        productUnitId,
        currency = "AUD",
        unitPrice = UnitPrice,
        source = Source,
        ruleId = RuleId,
        inclusive = Data["inclusive"],
        taxCode = Data["tax_code"],
        taxRate = Data["rate"],
        conversionToBase = Data["conversion_to_base"],
        quantityStep = Data["quantity_step"],
        pricingAt = PricingAt
    };
}

internal static class QuotePricing
{
    public static async Task<PriceFacts> Resolve(CompanySession session, Guid customerId, Guid productUnitId, DateTimeOffset now, CancellationToken token, bool enforceFloor = true)
    {
        var rows = await MasterDataSupport.Read(session, """
            SELECT li.amount,li.id AS standard_rule,pl.inclusive,cu.fixed_price,cu.discount_percent,cu.id AS customer_rule,
              promo.amount AS promotion_price,promo.id AS promotion_rule,f.amount AS floor_price,tr.rate,
              u.conversion_to_base,u.quantity_step,t.code AS tax_code,u.version AS unit_version,p.version AS product_version,
              p.id AS product_id,p.sku,p.name,p.item_type,p.whole_packs,m.code AS unit_code,bu.code AS base_unit_code,
              li.version AS standard_version,cu.version AS customer_version,promo.version AS promotion_version,
              f.version AS floor_version,tr.version AS tax_version,tr.id AS tax_rule
            FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id AND p.status='ACTIVE' AND p.sell_enabled
            JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id AND m.active
            JOIN catalog.uoms bu ON bu.company_id=p.company_id AND bu.id=p.base_uom_id
            JOIN pricing.price_lists pl ON pl.company_id=u.company_id AND pl.code='STANDARD' AND pl.currency='AUD'
            JOIN pricing.price_list_items li ON li.company_id=u.company_id AND li.price_list_id=pl.id AND li.product_unit_id=u.id
              AND li.active AND li.effective_from<=@at AND (li.effective_to IS NULL OR li.effective_to>@at)
            JOIN accounting.tax_codes t ON t.company_id=p.company_id AND t.id=p.tax_code_id
            JOIN accounting.tax_rates tr ON tr.company_id=t.company_id AND tr.tax_code_id=t.id
              AND tr.effective_from<=(@at AT TIME ZONE (SELECT timezone FROM core.companies))::date
              AND (tr.effective_to IS NULL OR tr.effective_to>(@at AT TIME ZONE (SELECT timezone FROM core.companies))::date)
            LEFT JOIN pricing.customer_price_rules cu ON cu.company_id=u.company_id AND cu.customer_id=@customer AND cu.product_unit_id=u.id
              AND cu.active AND cu.effective_from<=@at AND (cu.effective_to IS NULL OR cu.effective_to>@at)
            LEFT JOIN pricing.price_floor_rules f ON f.company_id=u.company_id AND f.product_unit_id=u.id AND f.active
            LEFT JOIN LATERAL (
              SELECT pi.amount,pr.id,pr.version+pi.version AS version FROM pricing.promotion_items pi JOIN pricing.promotions pr ON pr.company_id=pi.company_id AND pr.id=pi.promotion_id
              WHERE pi.company_id=u.company_id AND pi.product_unit_id=u.id AND pi.active AND pr.active AND pr.starts_at<=@at AND pr.ends_at>@at
              ORDER BY pi.amount,pr.id LIMIT 1) promo ON true
            WHERE u.id=@unit AND u.active
            """, token, new DbArg("customer", customerId), new DbArg("unit", productUnitId), new DbArg("at", now));
        if (rows.Count == 0) throw new BusinessException("price_unavailable", "No effective standard price or tax rate exists for this product unit.");
        var row = rows.Single(); var amount = (decimal)row["amount"]!; var source = "STANDARD"; var rule = (Guid)row["standard_rule"]!;
        if (row["customer_rule"] is Guid customerRule)
        {
            amount = row["fixed_price"] is decimal fixedPrice ? fixedPrice : amount * (1 - (decimal)row["discount_percent"]! / 100m);
            source = "CUSTOMER"; rule = customerRule;
        }
        if (row["promotion_price"] is decimal promotion && promotion < amount) { amount = promotion; source = "PROMOTION"; rule = (Guid)row["promotion_rule"]!; }
        if (enforceFloor && row["floor_price"] is decimal floor && amount < floor) throw new BusinessException("price_below_floor", "The effective price needs office review before use.");
        var signature = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(row, ApiJson.Options))));
        return new(decimal.Round(amount, 8, MidpointRounding.AwayFromZero), row["floor_price"] as decimal?, source, rule, signature, row, now);
    }
}
