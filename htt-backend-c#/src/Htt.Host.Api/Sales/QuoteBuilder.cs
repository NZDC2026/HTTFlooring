using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.Modules.Foundation;
using Htt.SharedKernel;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.Sales;

public sealed record QuoteLineInput(Guid ProductUnitId, decimal? Quantity = null, decimal? RequestedArea = null, decimal? UnitPrice = null, decimal DiscountPercent = 0);
public sealed record QuoteInput(Guid CustomerId, Guid CustomerBranchId, Guid WarehouseId, QuoteLineInput[] Lines, DateOnly? ExpiresOn = null, string? Notes = null);
public sealed record ReviewInput(string Reason);
internal sealed record QuoteContext(DateOnly Today, Dictionary<string, object?> Customer, Dictionary<string, object?> Branch, object Snapshot);
internal sealed record BuiltLine(QuoteLineInput Input, Guid ProductId, string ItemType, decimal Quantity, decimal BaseQuantity, decimal UnitPrice, decimal TaxRate, bool Inclusive, LineAmounts Amounts, object Snapshot, string Signature);
internal sealed record BuiltQuote(QuoteInput Input, QuoteContext Context, List<BuiltLine> Lines, decimal Net, decimal Tax, decimal Gross, DateTimeOffset PricingAt);

internal static class QuoteBuilder
{
    public static async Task<QuoteContext> Context(HttpContext h, CompanySession s, Guid customer, Guid branch, Guid warehouse, CancellationToken ct)
    {
        await Customer(h, s, customer, ct);
        var c = await One(s, "SELECT c.*,p.legal_name,p.abn FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE c.company_id=@company AND c.id=@id FOR SHARE OF c,p", ct, new DbArg("id", customer));
        if ((string)c["status"]! != "ACTIVE") throw new BusinessException("customer_on_hold", "Customer must be active before quoting or conversion.", 409);
        var b = await One(s, "SELECT * FROM crm.customer_branches WHERE company_id=@company AND id=@id AND customer_id=@customer AND active FOR SHARE", ct, new DbArg("id", branch), new DbArg("customer", customer));
        Check.Address((string)b["country"]!, b["state"] as string, b["postcode"] as string);
        await Warehouse(h, s, warehouse, ct);
        var today = (string)(await One(s, "SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone,'YYYY-MM-DD') AS today FROM core.companies WHERE id=@company", ct))["today"]!;
        var snapshot = new { customerId = customer, legalName = c["legal_name"], abn = c["abn"], branchId = branch, branchName = b["name"], addressLine1 = b["address_line1"], suburb = b["suburb"], state = b["state"], postcode = b["postcode"], country = b["country"] };
        return new(DateOnly.Parse(today, System.Globalization.CultureInfo.InvariantCulture), c, b, snapshot);
    }
    public static async Task Warehouse(HttpContext h, CompanySession s, Guid warehouse, CancellationToken ct)
    {
        var a = Access(h);
        await One(s, """
            SELECT w.id FROM catalog.warehouses w WHERE w.company_id=@company AND w.id=@id AND w.active AND w.kind='SELLABLE'
            AND (@all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=@membership)) FOR SHARE
            """, ct, new DbArg("id", warehouse), new DbArg("all", a.Has("warehouses.all")), new DbArg("membership", a.MembershipId));
    }
    public static QuoteInput Normalize(QuoteInput d, DateOnly today)
    {
        Check.That(d.Lines is not null && d.Lines.Length is >= 1 and <= 50 && d.Lines.All(l => l is not null && l.ProductUnitId != Guid.Empty), "lines", "Quote requires 1..50 valid product-unit lines.");
        var expiry = d.ExpiresOn ?? today.AddDays(30);
        Check.That(expiry >= today, "expiresOn", "Quote expiry must not precede the company business date.");
        foreach (var l in d.Lines!)
        {
            Check.That((l.Quantity is not null) != (l.RequestedArea is not null), "quantity", "Supply quantity or requestedArea, exactly one.");
            var quantity = l.Quantity ?? l.RequestedArea!.Value; Check.Amount(quantity, "quantity", 6); Check.That(quantity > 0, "quantity", "Quantity must be positive.");
            if (l.UnitPrice is { } price) Check.Amount(price, "unitPrice");
            Check.That(l.DiscountPercent is >= 0 and <= 100 && decimal.Round(l.DiscountPercent, 6) == l.DiscountPercent, "discountPercent", "Discount must be 0..100 with at most six decimals.");
        }
        return d with { ExpiresOn = expiry, Notes = Check.Optional(d.Notes, "notes", 2000) ?? "" };
    }
    public static async Task<BuiltQuote> Build(HttpContext h, CompanySession s, QuoteInput input, CancellationToken ct)
    {
        var context = await Context(h, s, input.CustomerId, input.CustomerBranchId, input.WarehouseId, ct);
        if(input.ExpiresOn is null){var defaults=await One(s,"SELECT quote_valid_days FROM core.business_preferences WHERE company_id=@company",ct);input=input with{ExpiresOn=context.Today.AddDays((int)defaults["quote_valid_days"]!)};}
        var d = Normalize(input, context.Today);
        // Price maintenance locks the same units before changing rules. Stabilize this quote without locking unrelated products.
        foreach (var unit in d.Lines.Select(x => x.ProductUnitId).Distinct().Order())
            await One(s, "SELECT u.id FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id WHERE u.company_id=@company AND u.id=@id AND u.active AND p.status='ACTIVE' AND p.sell_enabled FOR SHARE OF u,p", ct, new DbArg("id", unit));
        var now = DateTimeOffset.UtcNow; var lines = new List<BuiltLine>();
        foreach (var inputLine in d.Lines)
        {
            var f = await QuotePricing.Resolve(s, d.CustomerId, inputLine.ProductUnitId, now, ct, false); var data = f.Data;
            var conversion = (decimal)data["conversion_to_base"]!; var step = (decimal)data["quantity_step"]!;
            var whole = (bool)data["whole_packs"]!; var code = (string)data["unit_code"]!;
            if (whole && code == "BOX") Check.That(decimal.Truncate(step) == step, "quantityStep", "Whole-box units require an integer step.");
            decimal quantity;
            if (inputLine.RequestedArea is { } area)
            {
                Check.That(code == "BOX" && (string)data["base_unit_code"]! == "M2", "requestedArea", "Area input requires a BOX selling unit with M2 base unit.");
                quantity = decimal.Ceiling(area / (conversion * step)) * step;
            }
            else quantity = inputLine.Quantity!.Value;
            Check.That(quantity % step == 0 && (!whole || code != "BOX" || decimal.Truncate(quantity) == quantity), "quantity", "Quantity must respect the configured selling step and whole-pack policy.");
            var baseQuantity = quantity * conversion; Check.Amount(baseQuantity, "baseQuantity", 6);
            if (whole && code != "BOX")
            {
                var pack = await Read(s, "SELECT u.conversion_to_base FROM catalog.product_units u JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=@company AND u.product_id=@product AND u.active AND m.code='BOX'", ct, new DbArg("product", (Guid)data["product_id"]!));
                if (pack.Count > 0) Check.That(baseQuantity % (decimal)pack[0]["conversion_to_base"]! == 0, "quantity", "Use full packs or enter requestedArea with the BOX unit.");
            }
            var manual = inputLine.UnitPrice is { } supplied && supplied != f.UnitPrice || inputLine.DiscountPercent != 0;
            if (manual && !Access(h).Has("sales.quotes.price.override")) throw new BusinessException("permission_denied", "Quote price override is not permitted.", 403);
            var unitPrice = decimal.Round((inputLine.UnitPrice ?? f.UnitPrice) * (1 - inputLine.DiscountPercent / 100), 8, MidpointRounding.AwayFromZero);
            if (f.Floor is { } floor && unitPrice < floor) throw new BusinessException("price_below_floor", "Quote selling price is below the permitted floor.");
            var inclusive = (bool)data["inclusive"]!; var taxRate = (decimal)data["rate"]!;
            var amounts = Calculations.Tax(quantity * unitPrice, taxRate, inclusive);
            Check.Amount(amounts.Gross, "gross", 2);
            var snapshot = new
            {
                sku = data["sku"],
                name = data["name"],
                unitCode = code,
                conversionToBase = conversion,
                quantityStep = step,
                requestedArea = inputLine.RequestedArea,
                quantity,
                baseQuantity,
                unitPrice,
                taxRate,
                inclusive,
                taxCode = data["tax_code"],
                priceSource = manual ? "MANUAL" : f.Source,
                priceRuleId = f.RuleId,
                discountPercent = inputLine.DiscountPercent,
                standardUnitPrice = data["amount"]
            };
            lines.Add(new(inputLine, (Guid)data["product_id"]!, (string)data["item_type"]!, quantity, baseQuantity, unitPrice, taxRate, inclusive, amounts, snapshot, f.Signature));
        }
        var net = lines.Sum(l => l.Amounts.Net); var tax = lines.Sum(l => l.Amounts.Tax); Check.Amount(net + tax, "gross", 2);
        return new(d, context, lines, net, tax, net + tax, now);
    }
}
