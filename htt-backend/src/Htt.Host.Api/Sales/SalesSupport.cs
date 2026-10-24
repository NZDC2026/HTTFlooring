using System.Globalization;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.Sales;

internal static class SalesSupport
{
    public static string Json(object value) => JsonSerializer.Serialize(value, ApiJson.Options);
    public static JsonElement Element(object value)
    {
        using var document = JsonDocument.Parse((string)value); return document.RootElement.Clone();
    }
    public static long Version(HttpContext h)
    {
        if (!long.TryParse(h.Request.Headers.IfMatch.ToString().Trim('"'), NumberStyles.None, CultureInfo.InvariantCulture, out var version) || version < 1)
            throw new BusinessException("version_required", "Supply If-Match with the current document version.", 428);
        return version;
    }
    public static void Match(Dictionary<string, object?> d, long expected)
    {
        if ((long)d["version"]! != expected) throw new BusinessException("version_conflict", "Document changed; refresh before retrying.", 409);
    }
    public static async Task<Dictionary<string, object?>> Quote(HttpContext h, CompanySession s, Guid id, bool write, CancellationToken ct)
    {
        var row = await One(s, """
            SELECT d.number,d.state,d.version,d.created_by AS owner_id,q.*,q.expires_on::text AS expires_on
            FROM sales.quotes q JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.id
            WHERE q.company_id=@company AND q.id=@id
            """ + (write ? " FOR UPDATE OF d,q" : ""), ct, new DbArg("id", id));
        await Customer(h, s, (Guid)row["customer_id"]!, ct);
        return row;
    }
    public static void Owner(HttpContext h, CompanySession s, Dictionary<string, object?> d)
    {
        if ((Guid)d["owner_id"]! != s.ActorId && !Access(h).Has("sales.quotes.manage.all"))
            throw new BusinessException("permission_denied", "Only the draft owner or office operations may modify this quote.", 403);
    }
    public static async Task<Dictionary<string, object?>> Order(HttpContext h, CompanySession s, Guid id, bool write, CancellationToken ct)
    {
        var row = await One(s, "SELECT d.number,d.state,d.version,o.* FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.id=@id" + (write ? " FOR UPDATE OF d" : ""), ct, new DbArg("id", id));
        await Customer(h, s, (Guid)row["customer_id"]!, ct); return row;
    }
    public static async Task<object> QuoteView(CompanySession s, Dictionary<string, object?> q, CancellationToken ct)
    {
        var lines = await Read(s, "SELECT l.id,dl.line_no,l.snapshot,l.net,l.tax,l.gross FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.quote_id=@id ORDER BY dl.line_no", ct, new DbArg("id", (Guid)q["id"]!));
        return new { id = q["id"], number = q["number"], status = q["status"], version = q["version"], customerId = q["customer_id"], customerBranchId = q["customer_branch_id"], warehouseId = q["warehouse_id"], expiresOn = q["expires_on"], notes = q["notes"], customer = Element(q["customer_snapshot"]!), net = q["net"], tax = q["tax"], gross = q["gross"], pricingAt = q["pricing_at"], lines = lines.Select(l => new { id = l["id"], lineNo = l["line_no"], snapshot = Element(l["snapshot"]!), net = l["net"], tax = l["tax"], gross = l["gross"] }) };
    }
}
