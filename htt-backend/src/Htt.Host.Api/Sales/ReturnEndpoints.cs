using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record SalesReturnLineInput(Guid StockMovementId, decimal Quantity, Guid? InvoiceLineId = null);
public sealed record SalesReturnInput(Guid WarehouseId, string Disposition, string Reason, IReadOnlyList<SalesReturnLineInput>? Lines);
public sealed record CreditNoteLineInput(Guid InvoiceLineId, decimal Quantity, Guid? ReturnLineId = null);
public sealed record CreditNoteInput(string Reason, IReadOnlyList<CreditNoteLineInput>? Lines);
public sealed record CustomerRefundInput(decimal Amount, string Reference, string Reason, Guid? CreditLineId = null, Guid? AdvanceId = null, bool CancelOrder = false);

internal static class ReturnEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        CustomerCreditApplicationEndpoints.Map(g);
        g.MapGet("/warehouse/orders/{id:guid}/returnable", async (Guid id, CompanySession s, CancellationToken ct) =>
        {
            await WarehouseOrder(s, id, "inventory.returns.read", ct);
            return Results.Ok(new { orderId = id, movements = (await Read(s, """
                SELECT m.id AS stock_movement_id,pl.order_line_id,pl.quantity,m.quantity AS base_quantity,ol.snapshot->>'sku' AS sku,ol.snapshot->>'name' AS name,ol.snapshot->>'unitCode' AS unit_code,
                 coalesce((SELECT sum(quantity) FROM inventory.sales_return_lines WHERE company_id=m.company_id AND stock_movement_id=m.id),0) AS returned_quantity
                FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id JOIN sales.order_lines ol ON ol.company_id=pl.company_id AND ol.id=pl.order_line_id WHERE ol.company_id=@company AND ol.order_id=@id ORDER BY m.id
                """, ct, new DbArg("id", id))).Select(PublicRow), invoiceLines = (await Read(s, "SELECT l.id,l.order_line_id,d.number AS invoice_number,l.quantity,coalesce((SELECT sum(quantity) FROM inventory.sales_return_lines WHERE company_id=l.company_id AND invoice_line_id=l.id),0) AS returned_quantity FROM sales.invoice_lines l JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id WHERE i.company_id=@company AND i.order_id=@id ORDER BY l.id", ct, new DbArg("id", id))).Select(PublicRow) });
        }).WithMetadata(new Permission("inventory.returns.read"));
        g.MapPost("/sales-orders/{id:guid}/returns", Receive).WithMetadata(new Permission("inventory.returns.write"));
        g.MapGet("/warehouse/returns/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(await ReturnView(s, id, ct))).WithMetadata(new Permission("inventory.returns.read"));
        g.MapPost("/sales-invoices/{id:guid}/credit-notes", Credit).WithMetadata(new Permission("sales.credits.write"));
        g.MapGet("/sales-credit-notes/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await CreditView(h, s, id, ct))).WithMetadata(new Permission("sales.credits.read"));
        g.MapGet("/sales-invoices/{id:guid}/creditable", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Invoice(h, s, id, ct);
            return Results.Ok(new { invoiceId = id, lines = (await Read(s, "SELECT il.id,il.quantity,il.net,il.tax,il.gross,il.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=il.company_id AND invoice_line_id=il.id),0) AS creditable_quantity FROM sales.invoice_lines il WHERE il.company_id=@company AND il.invoice_id=@id ORDER BY il.id", ct, new DbArg("id", id))).Select(PublicRow), returns = (await Read(s, "SELECT rl.id,rl.invoice_line_id,rl.quantity,rl.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=rl.company_id AND return_line_id=rl.id),0) AS creditable_quantity FROM inventory.sales_return_lines rl JOIN sales.invoice_lines il ON il.company_id=rl.company_id AND il.id=rl.invoice_line_id WHERE il.company_id=@company AND il.invoice_id=@id ORDER BY rl.id", ct, new DbArg("id", id))).Select(PublicRow) });
        }).WithMetadata(new Permission("sales.credits.read"));
        g.MapGet("/sales-invoices/{id:guid}/credit-notes", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Invoice(h, s, id, ct); return Results.Ok(new { items = (await Read(s, "SELECT cn.id,d.number,cn.reason,cn.net,cn.tax,cn.gross FROM sales.credit_notes cn JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=@company AND cn.invoice_id=@id ORDER BY cn.created_at,cn.id", ct, new DbArg("id", id))).Select(PublicRow) });
        }).WithMetadata(new Permission("sales.credits.read"));
        g.MapPost("/customers/{id:guid}/refunds", Refund).WithMetadata(new Permission("accounting.refunds.write"));
        g.MapGet("/customer-refunds/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await RefundView(h, s, id, ct))).WithMetadata(new Permission("accounting.refunds.read"));
        g.MapGet("/customers/{id:guid}/refunds", async (Guid id, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, id, ct); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, "SELECT r.id,d.number,r.credit_line_id,r.advance_id,r.amount,r.gst_amount,r.reference,r.reason FROM accounting.customer_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.customer_id=@id ORDER BY r.created_at DESC,r.id LIMIT @size OFFSET @offset", ct, new DbArg("id", id), new DbArg("offset", offset), new DbArg("size", size))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("accounting.refunds.read"));
    }
    private static async Task<Dictionary<string, object?>> WarehouseOrder(CompanySession s, Guid id, string permission, CancellationToken ct)
    {
        var o = await One(s, "SELECT warehouse_id FROM sales.orders WHERE company_id=@company AND id=@id", ct, new DbArg("id", id));
        await Read(s, "SELECT inventory.require_access(@permission,@wh)", ct, new DbArg("permission", permission), new DbArg("wh", (Guid)o["warehouse_id"]!)); return o;
    }
    private static async Task<Dictionary<string, object?>> Invoice(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var i = await One(s, "SELECT i.*,d.number FROM sales.invoices i JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id WHERE i.company_id=@company AND i.id=@id", ct, new DbArg("id", id));
        await Customer(h, s, (Guid)i["customer_id"]!, ct); return i;
    }
    private static void Quantity(decimal qty) { Check.Amount(qty, "quantity", 6); Check.That(qty > 0, "quantity", "Positive quantity required."); }
    private static async Task<IResult> Receive(Guid id, SalesReturnInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await WarehouseOrder(s, id, "inventory.returns.write", ct);
        var disposition = Check.OneOf(input.Disposition, "disposition", "RESTOCK", "QUARANTINE"); var reason = Check.Text(input.Reason, "reason", 2000);
        var lines = input.Lines;
        Check.That(lines is { Count: >= 1 and <= 50 } && lines.All(l => l is not null && l.StockMovementId != Guid.Empty && l.InvoiceLineId != Guid.Empty) && lines.Select(l => (l.StockMovementId, l.InvoiceLineId)).Distinct().Count() == lines.Count, "lines", "Supply distinct return movement/invoice pairs.");
        foreach (var l in lines!) Quantity(l.Quantity); var sorted = lines!.OrderBy(l => l.StockMovementId).ThenBy(l => l.InvoiceLineId).ToArray();
        var response = await idem.ExecuteAsync($"POST /sales-orders/{id}/returns", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { input.WarehouseId, disposition, reason, lines = sorted }), async () =>
        {
            var row = await One(s, "SELECT inventory.receive_sales_return(@order,@warehouse,@disposition,@reason,@lines) AS id", ct, new DbArg("order", id), new DbArg("warehouse", input.WarehouseId), new DbArg("disposition", disposition), new DbArg("reason", reason), new DbArg("lines", Json(sorted), NpgsqlDbType.Jsonb));
            var returned = (Guid)row["id"]!; await Sql.AuditAsync(s, "inventory.sales_returned", "sales_return", returned, h.TraceIdentifier, ct, new { orderId = id, disposition, reason });
            return ApiJson.Stored(await ReturnView(s, returned, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<object> ReturnView(CompanySession s, Guid id, CancellationToken ct)
    {
        var r = await One(s, "SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM inventory.sales_returns r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.id=@id", ct, new DbArg("id", id));
        await WarehouseOrder(s, (Guid)r["order_id"]!, "inventory.returns.read", ct);
        await Read(s, "SELECT inventory.require_access('inventory.returns.read',@wh)", ct, new DbArg("wh", (Guid)r["warehouse_id"]!));
        return new { id, number = r["number"], state = r["state"], version = r["version"], orderId = r["order_id"], warehouseId = r["warehouse_id"], disposition = r["disposition"], reason = r["reason"], businessDate = r["business_date"], lines = (await Read(s, "SELECT id,stock_movement_id,order_line_id,invoice_line_id,quantity,base_quantity FROM inventory.sales_return_lines WHERE company_id=@company AND return_id=@id ORDER BY id", ct, new DbArg("id", id))).Select(PublicRow) };
    }
    private static async Task<IResult> Credit(Guid id, CreditNoteInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await Invoice(h, s, id, ct); var reason = Check.Text(input.Reason, "reason", 2000); var lines = input.Lines;
        Check.That(lines is { Count: >= 1 and <= 50 } && lines.All(l => l is not null && l.InvoiceLineId != Guid.Empty && l.ReturnLineId != Guid.Empty) && lines.Select(l => l.InvoiceLineId).Distinct().Count() == lines.Count, "lines", "Supply distinct credit invoice lines.");
        foreach (var l in lines!) Quantity(l.Quantity); var sorted = lines!.OrderBy(l => l.InvoiceLineId).ToArray();
        var response = await idem.ExecuteAsync($"POST /sales-invoices/{id}/credit-notes", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { reason, lines = sorted }), async () =>
        {
            var row = await One(s, "SELECT sales.post_credit_note(@invoice,@reason,@lines) AS id", ct, new DbArg("invoice", id), new DbArg("reason", reason), new DbArg("lines", Json(sorted), NpgsqlDbType.Jsonb));
            var credit = (Guid)row["id"]!; await Sql.AuditAsync(s, "sales.credit_posted", "credit_note", credit, h.TraceIdentifier, ct, new { invoiceId = id, reason });
            return ApiJson.Stored(await CreditView(h, s, credit, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<object> CreditView(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var cn = await One(s, "SELECT cn.*,d.number,d.state,d.version,d.business_date::text FROM sales.credit_notes cn JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=@company AND cn.id=@id", ct, new DbArg("id", id));
        var invoice = await Invoice(h, s, (Guid)cn["invoice_id"]!, ct);
        return new { id, number = cn["number"], state = cn["state"], version = cn["version"], invoiceId = cn["invoice_id"], invoiceNumber = invoice["number"], businessDate = cn["business_date"], title = (string)invoice["title"]! == "TAX_INVOICE" ? "ADJUSTMENT_NOTE" : "CREDIT_NOTE", issuer = Element(invoice["issuer_snapshot"]!), customer = Element(invoice["customer_snapshot"]!), reason = cn["reason"], net = cn["net"], tax = cn["tax"], gross = cn["gross"], lines = (await Read(s, "SELECT cl.id,cl.invoice_line_id,cl.return_line_id,cl.quantity,cl.net,cl.tax,cl.gross,cl.unallocated_amount AS unrefunded_credit,cl.unallocated_amount,cl.applied_amount,cl.refunded_amount,cl.available_apply_amount FROM sales.customer_credit_line_balances cl WHERE cl.company_id=@company AND cl.credit_note_id=@id ORDER BY cl.id", ct, new DbArg("id", id))).Select(PublicRow) };
    }
    private static async Task<IResult> Refund(Guid id, CustomerRefundInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await Customer(h, s, id, ct); Check.Amount(input.Amount, "amount", 2); Check.That(input.Amount > 0 && (input.CreditLineId is null) != (input.AdvanceId is null) && input.CreditLineId != Guid.Empty && input.AdvanceId != Guid.Empty, "source", "Select exactly one credit line or advance and positive amount.");
        var reference = Check.Text(input.Reference, "reference", 200); var reason = Check.Text(input.Reason, "reason", 2000);
        if (input.CreditLineId is { } cl) await One(s, "SELECT cl.id FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE cl.company_id=@company AND cl.id=@id AND i.customer_id=@customer", ct, new DbArg("id", cl), new DbArg("customer", id));
        else await One(s, "SELECT a.id FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=@company AND a.id=@id AND r.customer_id=@customer", ct, new DbArg("id", input.AdvanceId), new DbArg("customer", id));
        var response = await idem.ExecuteAsync($"POST /customers/{id}/refunds", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { input.Amount, reference, reason, input.CreditLineId, input.AdvanceId, input.CancelOrder }), async () =>
        {
            var row = await One(s, "SELECT accounting.post_customer_refund(@credit,@advance,@amount,@reference,@reason,@cancel) AS id", ct, new DbArg("credit", input.CreditLineId, NpgsqlDbType.Uuid), new DbArg("advance", input.AdvanceId, NpgsqlDbType.Uuid), new DbArg("amount", input.Amount), new DbArg("reference", reference), new DbArg("reason", reason), new DbArg("cancel", input.CancelOrder));
            var refund = (Guid)row["id"]!; await Sql.AuditAsync(s, "accounting.customer_refunded", "customer_refund", refund, h.TraceIdentifier, ct, new { customerId = id, input.Amount, reference, reason });
            return ApiJson.Stored(await RefundView(h, s, refund, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<object> RefundView(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var r = await One(s, "SELECT r.*,d.number,d.state,d.version,d.business_date::text FROM accounting.customer_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.id=@id", ct, new DbArg("id", id));
        await Customer(h, s, (Guid)r["customer_id"]!, ct); return PublicRow(r);
    }
}
