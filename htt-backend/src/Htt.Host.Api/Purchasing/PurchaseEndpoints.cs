using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Purchasing;

public sealed record PurchaseLineInput(Guid ProductUnitId, decimal Quantity, decimal? UnitCost, Guid? TaxCodeId = null, bool? RecoverableGst = null);
public sealed record PurchaseOrderInput(Guid SupplierId, Guid WarehouseId, IReadOnlyList<PurchaseLineInput>? Lines, DateOnly? ExpectedOn = null, string? Notes = null);
public sealed record PurchaseReceiptLineInput(Guid OrderLineId, decimal Quantity);
public sealed record PurchaseReceiptInput(string Reference, IReadOnlyList<PurchaseReceiptLineInput>? Lines, string? Notes = null);
public sealed record PurchaseCloseInput(string Reason);

internal static class PurchaseEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/purchase-orders", async (PurchaseOrderInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) => await Save(null, input, h, s, idem, ct)).WithMetadata(new Permission("purchase.orders.write"));
        g.MapPut("/purchase-orders/{id:guid}", async (Guid id, PurchaseOrderInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) => await Save(id, input, h, s, idem, ct)).WithMetadata(new Permission("purchase.orders.write"));
        g.MapPost("/purchase-orders/{id:guid}/confirm", Confirm).WithMetadata(new Permission("purchase.orders.confirm"));
        g.MapPost("/purchase-orders/{id:guid}/close", Close).WithMetadata(new Permission("purchase.orders.close"));
        g.MapGet("/purchase-orders/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await OrderView(id, h, s, ct))).WithMetadata(new Permission("purchase.orders.read"));
        g.MapGet("/purchase-orders", async (Guid? supplierId, string? status, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            if (status is not null) Check.OneOf(status, "status", "DRAFT", "CONFIRMED", "CLOSED"); var (offset, size) = Page(page, pageSize); var cost = Access(h).Has("purchase.cost.read");
            var rows = await Read(s, "SELECT o.id,d.number,d.version,d.state,o.status,o.supplier_id,o.warehouse_id,o.expected_on::text,o.net,o.tax,o.gross,o.valuation_amount FROM purchase.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND (@supplier IS NULL OR o.supplier_id=@supplier) AND (@status IS NULL OR o.status=@status) ORDER BY o.created_at DESC,o.id LIMIT @size OFFSET @offset", ct, new DbArg("supplier", supplierId, NpgsqlDbType.Uuid), new DbArg("status", status, NpgsqlDbType.Text), new DbArg("offset", offset), new DbArg("size", size));
            return Results.Ok(new { items = rows.Select(r => PublicRow(Redact(r, cost))), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("purchase.orders.read"));
        g.MapGet("/warehouse/purchase-orders", async (Guid warehouseId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            await Warehouse(s, warehouseId, "purchase.receipts.read", ct); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, """
                SELECT o.id,d.number,d.version,o.supplier_id,o.supplier_snapshot->>'legalName' AS supplier_name,o.expected_on::text
                FROM purchase.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.warehouse_id=@warehouse AND o.status='CONFIRMED' AND EXISTS(
                 SELECT 1 FROM purchase.order_lines l WHERE l.company_id=o.company_id AND l.order_id=o.id AND l.quantity>coalesce((SELECT sum(quantity) FROM purchase.receipt_lines WHERE company_id=l.company_id AND order_line_id=l.id),0)) ORDER BY o.created_at,o.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("warehouse", warehouseId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("purchase.receipts.read"));
        g.MapGet("/warehouse/purchase-orders/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) =>
        {
            var o = await Header(id, s, ct); await Warehouse(s, (Guid)o["warehouse_id"]!, "purchase.receipts.read", ct);
            return Results.Ok(new { id, number = o["number"], version = o["version"], status = o["status"], warehouseId = o["warehouse_id"], supplier = Element(o["supplier_snapshot"]!), notes = o["notes"], lines = (await Lines(id, s, ct)).Select(r => PublicRow(Redact(r, false))) });
        }).WithMetadata(new Permission("purchase.receipts.read"));
        g.MapPost("/purchase-orders/{id:guid}/receipts", Receive).WithMetadata(new Permission("purchase.receipts.write"));
        g.MapGet("/purchase-receipts/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await ReceiptView(id, h, s, ct))).WithMetadata(new Permission("purchase.receipts.read"));
        g.MapGet("/accounting/grni/receipts/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await ReceiptView(id, h, s, ct, true))).WithMetadata(new Permission("purchase.grni.read"));
        g.MapGet("/accounting/grni", async (Guid? supplierId, Guid? warehouseId, int? page, int? pageSize, CompanySession s, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize);
            const string where = " WHERE g.company_id=@company AND (@supplier IS NULL OR g.supplier_id=@supplier) AND (@warehouse IS NULL OR r.warehouse_id=@warehouse)";
            var args = new DbArg[] { new("supplier", supplierId, NpgsqlDbType.Uuid), new("warehouse", warehouseId, NpgsqlDbType.Uuid), new("size", size), new("offset", offset) };
            var total = await One(s, "SELECT coalesce(sum(g.amount-coalesce((SELECT sum(bl.grni_amount) FROM purchase.bill_lines bl WHERE bl.company_id=g.company_id AND bl.grni_item_id=g.id),0)-coalesce((SELECT sum(rl.valuation_amount) FROM purchase.return_lines rl WHERE rl.company_id=g.company_id AND rl.receipt_line_id=g.receipt_line_id AND rl.bill_line_id IS NULL),0)),0) AS amount FROM accounting.grni_items g JOIN purchase.receipt_lines l ON l.company_id=g.company_id AND l.id=g.receipt_line_id JOIN purchase.receipts r ON r.company_id=l.company_id AND r.id=l.receipt_id" + where, ct, args);
            var rows = await Read(s, "SELECT g.id,g.receipt_line_id,r.id AS receipt_id,d.number,r.order_id,g.supplier_id,g.party_id,r.warehouse_id,d.business_date::text,g.amount,g.amount-coalesce((SELECT sum(bl.grni_amount) FROM purchase.bill_lines bl WHERE bl.company_id=g.company_id AND bl.grni_item_id=g.id),0)-coalesce((SELECT sum(rl.valuation_amount) FROM purchase.return_lines rl WHERE rl.company_id=g.company_id AND rl.receipt_line_id=g.receipt_line_id AND rl.bill_line_id IS NULL),0) AS outstanding_amount,g.debit_account_id,g.grni_account_id,g.journal_entry_id FROM accounting.grni_items g JOIN purchase.receipt_lines l ON l.company_id=g.company_id AND l.id=g.receipt_line_id JOIN purchase.receipts r ON r.company_id=l.company_id AND r.id=l.receipt_id JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id" + where + " ORDER BY d.business_date,g.id LIMIT @size OFFSET @offset", ct, args);
            return Results.Ok(new { currency = "AUD", accruedAmount = total["amount"], items = rows.Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("purchase.grni.read"));
    }
    private static Dictionary<string, object?> Redact(Dictionary<string, object?> row, bool cost)
    {
        if (!cost) foreach (var field in new[] { "unit_cost", "net", "tax", "gross", "valuation_amount", "tax_rate", "recoverable_gst", "value_after", "debit_account_id", "grni_account_id", "journal_entry_id" }) row.Remove(field);
        return row;
    }
    private static Task<List<Dictionary<string, object?>>> Warehouse(CompanySession s, Guid id, string permission, CancellationToken ct) => Read(s, "SELECT inventory.require_access(@permission,@id)", ct, new DbArg("permission", permission), new DbArg("id", id));
    private static Task<Dictionary<string, object?>> Header(Guid id, CompanySession s, CancellationToken ct) => One(s, "SELECT o.*,o.expected_on::text AS expected_on,d.number,d.state,d.version,d.business_date::text FROM purchase.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.id=@id", ct, new DbArg("id", id));
    private static Task<List<Dictionary<string, object?>>> Lines(Guid id, CompanySession s, CancellationToken ct) => Read(s, """
        SELECT l.id,dl.line_no,l.product_id,l.product_unit_id,l.item_type,l.quantity,l.base_quantity,l.unit_cost,l.net,l.tax,l.gross,l.valuation_amount,l.tax_rate,l.recoverable_gst,
         l.snapshot->>'sku' AS sku,l.snapshot->>'name' AS name,l.snapshot->>'unitCode' AS unit_code,(l.snapshot->>'conversionToBase')::numeric AS conversion_to_base,(l.snapshot->>'quantityStep')::numeric AS quantity_step,
         coalesce((SELECT sum(quantity) FROM purchase.receipt_lines WHERE company_id=l.company_id AND order_line_id=l.id),0) AS received_quantity
        FROM purchase.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.order_id=@id ORDER BY dl.line_no
        """, ct, new DbArg("id", id));
    private static async Task<object> OrderView(Guid id, HttpContext h, CompanySession s, CancellationToken ct)
    {
        var o = await Header(id, s, ct); var cost = Access(h).Has("purchase.cost.read"); var lines = await Lines(id, s, ct);
        foreach (var row in lines) { row["open_quantity"] = (string)o["status"]! == "CONFIRMED" ? (decimal)row["quantity"]! - (decimal)row["received_quantity"]! : 0m; row["closed_quantity"] = (string)o["status"]! == "CLOSED" ? (decimal)row["quantity"]! - (decimal)row["received_quantity"]! : 0m; }
        var header = new Dictionary<string, object?>(o); header.Remove("input"); header.Remove("supplier_snapshot"); header["supplier"] = Element(o["supplier_snapshot"]!);
        return new { order = PublicRow(Redact(header, cost)), lines = lines.Select(l => PublicRow(Redact(l, cost))) };
    }
    private static async Task<object> ReceiptView(Guid id, HttpContext h, CompanySession s, CancellationToken ct, bool financial = false)
    {
        var r = await One(s, "SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM purchase.receipts r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.id=@id", ct, new DbArg("id", id));
        if (!financial) await Warehouse(s, (Guid)r["warehouse_id"]!, "purchase.receipts.read", ct); var cost = financial || Access(h).Has("purchase.cost.read");
        var rows = await Read(s, "SELECT l.id,l.order_line_id,l.quantity,l.base_quantity,l.net,l.tax,l.valuation_amount,l.stock_balance_id,l.on_hand_after,l.value_after FROM purchase.receipt_lines l WHERE l.company_id=@company AND l.receipt_id=@id ORDER BY l.id", ct, new DbArg("id", id));
        return new { receipt = PublicRow(Redact(r, cost)), lines = rows.Select(l => PublicRow(Redact(l, cost))) };
    }
    private static PurchaseLineInput[] Normalize(PurchaseOrderInput input)
    {
        Check.That(input.SupplierId != Guid.Empty && input.WarehouseId != Guid.Empty && input.Lines is { Count: >= 1 and <= 50 } && input.Lines.All(l => l is not null && l.ProductUnitId != Guid.Empty && l.TaxCodeId != Guid.Empty) && input.Lines.Select(l => l.ProductUnitId).Distinct().Count() == input.Lines.Count, "lines", "Supplier, warehouse and 1..50 distinct product units required.");
        foreach (var l in input.Lines!) { Check.Amount(l.Quantity, "quantity", 6); Check.That(l.Quantity > 0 && l.UnitCost is not null, "unitCost", "Positive quantity and explicit unit cost required."); Check.Amount(l.UnitCost!.Value, "unitCost", 8); }
        return input.Lines!.OrderBy(l => l.ProductUnitId).ToArray();
    }
    private static async Task<IResult> Save(Guid? id, PurchaseOrderInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var lines = Normalize(input); var notes = Check.Optional(input.Notes, "notes", 2000) ?? ""; long? expected = id is null ? null : Version(h);
        var response = await idem.ExecuteAsync($"{(id is null ? "POST" : "PUT")} /purchase-orders" + (id is null ? "" : $"/{id}"), h.Request.Headers["Idempotency-Key"].ToString(), Json(new { id, expected, input.SupplierId, input.WarehouseId, input.ExpectedOn, notes, lines }), async () =>
        {
            var row = await One(s, "SELECT purchase.save_order(@id,@expected,@supplier,@warehouse,@date,@notes,@lines) AS id", ct, new DbArg("id", id, NpgsqlDbType.Uuid), new DbArg("expected", expected, NpgsqlDbType.Bigint), new DbArg("supplier", input.SupplierId), new DbArg("warehouse", input.WarehouseId), new DbArg("date", input.ExpectedOn, NpgsqlDbType.Date), new DbArg("notes", notes), new DbArg("lines", Json(lines), NpgsqlDbType.Jsonb)); var oid = (Guid)row["id"]!;
            await Sql.AuditAsync(s, "purchase.order_drafted", "purchase_order", oid, h.TraceIdentifier, ct); return ApiJson.Stored(await OrderView(oid, h, s, ct), id is null ? 201 : 200);
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Confirm(Guid id, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var response = await idem.ExecuteAsync($"POST /purchase-orders/{id}/confirm", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected }), async () =>
        {
            await Read(s, "SELECT purchase.confirm_order(@id,@expected)", ct, new DbArg("id", id), new DbArg("expected", expected)); await Sql.AuditAsync(s, "purchase.order_confirmed", "purchase_order", id, h.TraceIdentifier, ct); return ApiJson.Stored(await OrderView(id, h, s, ct), 200);
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Close(Guid id, PurchaseCloseInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var reason = Check.Text(input.Reason, "reason", 2000); var response = await idem.ExecuteAsync($"POST /purchase-orders/{id}/close", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, reason }), async () =>
        {
            await Read(s, "SELECT purchase.close_order(@id,@expected,@reason)", ct, new DbArg("id", id), new DbArg("expected", expected), new DbArg("reason", reason)); await Sql.AuditAsync(s, "purchase.order_closed", "purchase_order", id, h.TraceIdentifier, ct, new { reason }); return ApiJson.Stored(await OrderView(id, h, s, ct), 200);
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Receive(Guid id, PurchaseReceiptInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var reference = Check.Text(input.Reference, "reference", 200); var notes = Check.Optional(input.Notes, "notes", 2000) ?? "";
        Check.That(input.Lines is { Count: >= 1 and <= 50 } && input.Lines.All(l => l is not null && l.OrderLineId != Guid.Empty) && input.Lines.Select(l => l.OrderLineId).Distinct().Count() == input.Lines.Count, "lines", "Supply 1..50 distinct purchase order lines.");
        foreach (var l in input.Lines!) { Check.Amount(l.Quantity, "quantity", 6); Check.That(l.Quantity > 0, "quantity", "Positive quantity required."); } var lines = input.Lines!.OrderBy(l => l.OrderLineId).ToArray();
        var response = await idem.ExecuteAsync($"POST /purchase-orders/{id}/receipts", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, reference, notes, lines }), async () =>
        {
            var row = await One(s, "SELECT purchase.receive_order(@id,@expected,@reference,@notes,@lines) AS id", ct, new DbArg("id", id), new DbArg("expected", expected), new DbArg("reference", reference), new DbArg("notes", notes), new DbArg("lines", Json(lines), NpgsqlDbType.Jsonb)); var receipt = (Guid)row["id"]!;
            await Sql.AuditAsync(s, "purchase.goods_received", "purchase_receipt", receipt, h.TraceIdentifier, ct, new { orderId = id, reference }); return ApiJson.Stored(await ReceiptView(receipt, h, s, ct));
        }, ct); return ApiJson.Result(response);
    }
}
