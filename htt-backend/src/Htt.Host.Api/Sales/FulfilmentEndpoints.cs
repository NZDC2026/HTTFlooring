using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record PickLineInput(Guid OrderLineId, decimal Quantity);
public sealed record PickInput(IReadOnlyList<PickLineInput>? Lines);
public sealed record DispatchInput(string Mode, string Recipient, string Reference);

internal static class FulfilmentEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/warehouse/orders", async (Guid warehouseId, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Warehouse(s, warehouseId, "inventory.picks.read", ct);
            var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, """
                SELECT o.id,d.number,d.version,o.customer_snapshot FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id
                WHERE o.company_id=@company AND o.warehouse_id=@warehouse AND d.state='CONFIRMED' AND EXISTS(
                 SELECT 1 FROM sales.order_lines l WHERE l.company_id=o.company_id AND l.order_id=o.id AND l.item_type='STOCK' AND l.base_quantity>
                 coalesce((SELECT sum(pl.base_quantity) FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id AND p.state='DISPATCHED'),0))
                ORDER BY o.created_at,o.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("warehouse", warehouseId), new DbArg("size", size), new DbArg("offset", offset))).Select(r => new { id = r["id"], number = r["number"], version = r["version"], customer = Element(r["customer_snapshot"]!) }), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("inventory.picks.read"));
        g.MapGet("/warehouse/orders/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) =>
        {
            var o = await ScopedOrder(s, id, "inventory.picks.read", false, ct);
            var lines = await Read(s, """
                SELECT l.id,l.product_id,l.product_unit_id,l.quantity,l.base_quantity,l.snapshot->>'sku' AS sku,l.snapshot->>'name' AS name,l.snapshot->>'unitCode' AS unit_code,
                 coalesce(sum(pl.quantity) FILTER(WHERE p.state='PICKED'),0) AS picked_quantity,
                 coalesce(sum(pl.quantity) FILTER(WHERE p.state='DISPATCHED'),0) AS dispatched_quantity
                FROM sales.order_lines l LEFT JOIN inventory.pick_lines pl ON pl.company_id=l.company_id AND pl.order_line_id=l.id
                LEFT JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id
                WHERE l.company_id=@company AND l.order_id=@id AND l.item_type='STOCK' GROUP BY l.id ORDER BY l.id
                """, ct, new DbArg("id", id));
            var picks = await Read(s, "SELECT p.id,p.state,d.number,d.version FROM inventory.picks p JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=p.company_id AND d.id=p.id WHERE p.company_id=@company AND p.order_id=@id ORDER BY p.created_at,p.id", ct, new DbArg("id", id));
            return Results.Ok(new { id, number = o["number"], version = o["version"], state = o["state"], warehouseId = o["warehouse_id"], customer = Element(o["customer_snapshot"]!), lines = lines.Select(PublicRow), picks = picks.Select(PublicRow) });
        }).WithMetadata(new Permission("inventory.picks.read"));
        g.MapPost("/warehouse/orders/{id:guid}/picks", Create).WithMetadata(new Permission("inventory.picks.write"));
        g.MapGet("/warehouse/picks/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(await View(s, id, ct))).WithMetadata(new Permission("inventory.picks.read"));
        g.MapPost("/warehouse/picks/{id:guid}/confirm", Confirm).WithMetadata(new Permission("inventory.dispatch"));
        g.MapPost("/warehouse/picks/{id:guid}/cancel", Cancel).WithMetadata(new Permission("inventory.picks.write"));
        g.MapGet("/inventory/valuation", async (Guid warehouseId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            await Warehouse(s, warehouseId, "inventory.cost.read", ct); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, "SELECT b.product_id,b.on_hand,v.value,v.stock_balance_id IS NOT NULL AS initialized,CASE WHEN b.on_hand>0 THEN v.value/b.on_hand END AS average_unit_cost FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=@company AND b.warehouse_id=@wh ORDER BY b.product_id LIMIT @size OFFSET @offset", ct, new DbArg("wh", warehouseId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("inventory.cost.read"));
    }
    private static Task<List<Dictionary<string, object?>>> Warehouse(CompanySession s, Guid id, string permission, CancellationToken ct) =>
        Read(s, "SELECT inventory.require_access(@permission,@id)", ct, new DbArg("permission", permission), new DbArg("id", id));
    private static async Task<Dictionary<string, object?>> ScopedOrder(CompanySession s, Guid id, string permission, bool write, CancellationToken ct)
    {
        var o = await One(s, "SELECT d.number,d.version,d.state,o.warehouse_id,o.customer_snapshot FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.id=@id", ct, new DbArg("id", id));
        await Warehouse(s, (Guid)o["warehouse_id"]!, permission, ct);
        if (write) o = await One(s, "SELECT d.number,d.version,d.state,o.warehouse_id,o.customer_snapshot FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.id=@id FOR UPDATE OF d", ct, new DbArg("id", id));
        return o;
    }
    private static async Task<Dictionary<string, object?>> ScopedPick(CompanySession s, Guid id, string permission, CancellationToken ct)
    {
        var p = await One(s, "SELECT p.*,d.number,d.version FROM inventory.picks p JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=p.company_id AND d.id=p.id WHERE p.company_id=@company AND p.id=@id", ct, new DbArg("id", id));
        await ScopedOrder(s, (Guid)p["order_id"]!, permission, false, ct); return p;
    }
    private static async Task<object> View(CompanySession s, Guid id, CancellationToken ct)
    {
        var p = await ScopedPick(s, id, "inventory.picks.read", ct);
        return new { id, orderId = p["order_id"], number = p["number"], version = p["version"], state = p["state"], mode = p["mode"], recipient = p["recipient"], reference = p["reference"], confirmedAt = p["confirmed_at"], lines = (await Read(s, "SELECT order_line_id,quantity,base_quantity FROM inventory.pick_lines WHERE company_id=@company AND pick_id=@id ORDER BY order_line_id", ct, new DbArg("id", id))).Select(PublicRow) };
    }
    private static async Task<IResult> Create(Guid id, PickInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h);
        if (input.Lines is null || input.Lines.Count is < 1 or > 50 || input.Lines.Select(l => l.OrderLineId).Distinct().Count() != input.Lines.Count)
            throw new BusinessException("invalid_pick", "Supply 1–50 distinct stock order lines.");
        foreach (var l in input.Lines) if (l.Quantity <= 0 || l.Quantity > 99999999999999.999999m || decimal.Round(l.Quantity, 6) != l.Quantity) throw new BusinessException("invalid_quantity", "Positive sales-unit quantities with at most six decimals required.");
        await ScopedOrder(s, id, "inventory.picks.write", false, ct);
        var response = await idem.ExecuteAsync($"POST /warehouse/orders/{id}/picks", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, lines = input.Lines.OrderBy(l => l.OrderLineId) }), async () =>
        {
            var o = await ScopedOrder(s, id, "inventory.picks.write", true, ct); Match(o, expected);
            if ((string)o["state"]! != "CONFIRMED") throw new BusinessException("order_not_confirmed", "Only confirmed orders can be picked.", 409);
            var pick = Guid.NewGuid();
            await Read(s, "INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) SELECT @id,@company,'PICK',inventory.next_number('PICK'),(now() AT TIME ZONE timezone)::date,'CONFIRMED',@actor FROM core.companies WHERE id=@company;INSERT INTO inventory.picks(id,company_id,order_id,created_by) VALUES(@id,@company,@order,@actor)", ct, new DbArg("id", pick), new DbArg("order", id));
            foreach (var l in input.Lines.OrderBy(l => l.OrderLineId))
            {
                var line = await One(s, "SELECT quantity,base_quantity FROM sales.order_lines WHERE company_id=@company AND order_id=@order AND id=@line AND item_type='STOCK'", ct, new DbArg("order", id), new DbArg("line", l.OrderLineId));
                var baseQty = l.Quantity * (decimal)line["base_quantity"]! / (decimal)line["quantity"]!;
                if (decimal.Round(baseQty, 6) != baseQty) throw new BusinessException("invalid_base_quantity", "Quantity cannot be represented in base units.");
                await Read(s, "INSERT INTO inventory.pick_lines(company_id,pick_id,order_line_id,quantity,base_quantity) VALUES(@company,@pick,@line,@quantity,@base)", ct, new DbArg("pick", pick), new DbArg("line", l.OrderLineId), new DbArg("quantity", l.Quantity), new DbArg("base", baseQty));
            }
            await Sql.AuditAsync(s, "inventory.picked", "pick", pick, h.TraceIdentifier, ct, new { orderId = id });
            return ApiJson.Stored(await View(s, pick, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Confirm(Guid id, DispatchInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var mode = Check.OneOf(input.Mode, "mode", "PICKUP", "DELIVERY");
        var recipient = Check.Text(input.Recipient, "recipient", 200); var reference = Check.Text(input.Reference, "reference", 200);
        await ScopedPick(s, id, "inventory.dispatch", ct);
        var response = await idem.ExecuteAsync($"POST /warehouse/picks/{id}/confirm", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, mode, recipient, reference }), async () =>
        {
            await Read(s, "SELECT inventory.confirm_pick(@id,@version,@mode,@recipient,@reference)", ct, new DbArg("id", id), new DbArg("version", expected), new DbArg("mode", mode), new DbArg("recipient", recipient), new DbArg("reference", reference));
            await Sql.AuditAsync(s, "inventory.dispatched", "pick", id, h.TraceIdentifier, ct, new { mode, recipient, reference });
            return ApiJson.Stored(await View(s, id, ct), 200);
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Cancel(Guid id, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); await ScopedPick(s, id, "inventory.picks.write", ct);
        var response = await idem.ExecuteAsync($"POST /warehouse/picks/{id}/cancel", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected }), async () =>
        {
            await Read(s, "SELECT inventory.cancel_pick(@id,@version)", ct, new DbArg("id", id), new DbArg("version", expected));
            await Sql.AuditAsync(s, "inventory.pick_cancelled", "pick", id, h.TraceIdentifier, ct);
            return ApiJson.Stored(await View(s, id, ct), 200);
        }, ct); return ApiJson.Result(response);
    }
}
