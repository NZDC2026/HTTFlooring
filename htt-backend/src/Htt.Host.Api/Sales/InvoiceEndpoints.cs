using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record InvoiceLineInput(Guid OrderLineId, decimal Quantity);
public sealed record InvoiceInput(IReadOnlyList<InvoiceLineInput>? Lines, string? FulfilmentReference = null);

internal static class InvoiceEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/sales-orders/{id:guid}/invoiceable", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            var o = await Order(h, s, id, false, ct);
            var lines = await Read(s, """
                SELECT l.id,l.item_type,l.product_id,l.product_unit_id,l.quantity,l.base_quantity,l.net,l.tax,l.gross,l.snapshot,
                 coalesce((SELECT sum(il.quantity) FROM sales.invoice_lines il WHERE il.company_id=l.company_id AND il.order_line_id=l.id),0) AS invoiced_quantity,
                 CASE WHEN l.item_type='STOCK' THEN coalesce((SELECT sum(pl.quantity) FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id AND p.state='DISPATCHED'),0) ELSE l.quantity END-coalesce((SELECT sum(quantity) FROM inventory.sales_return_lines WHERE company_id=l.company_id AND order_line_id=l.id AND invoice_line_id IS NULL),0) AS eligible_quantity
                FROM sales.order_lines l WHERE l.company_id=@company AND l.order_id=@id ORDER BY l.id
                """, ct, new DbArg("id", id));
            return Results.Ok(new { orderId = id, number = o["number"], version = o["version"], state = o["state"], lines = lines.Select(l => new { id = l["id"], itemType = l["item_type"], quantity = l["quantity"], baseQuantity = l["base_quantity"], invoicedQuantity = l["invoiced_quantity"], availableQuantity = (string)o["state"]! == "CONFIRMED" ? (decimal)l["eligible_quantity"]! - (decimal)l["invoiced_quantity"]! : 0m, requiresFulfilmentReference = (string)l["item_type"]! != "STOCK", snapshot = Element(l["snapshot"]!), net = l["net"], tax = l["tax"], gross = l["gross"] }) });
        }).WithMetadata(new Permission("sales.invoices.read"));
        g.MapPost("/sales-orders/{id:guid}/invoices", Issue).WithMetadata(new Permission("sales.invoices.write"));
        g.MapGet("/sales-invoices/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await View(h, s, id, ct))).WithMetadata(new Permission("sales.invoices.read"));
        g.MapGet("/sales-invoices", async (Guid? customerId, Guid? orderId, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            if (customerId is { } customer) await Customer(h, s, customer, ct);
            if (orderId is { } order) await Order(h, s, order, false, ct);
            var (offset, size) = Page(page, pageSize); var a = Access(h);
            return Results.Ok(new { items = (await Read(s, """
                SELECT i.id,d.number,d.version,d.state,i.order_id,i.customer_id,i.invoice_date::text,i.due_on::text,i.net,i.tax,i.gross
                FROM sales.invoices i JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=i.company_id AND d.id=i.id
                WHERE i.company_id=@company AND (@customer IS NULL OR i.customer_id=@customer) AND (@order IS NULL OR i.order_id=@order)
                 AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=i.company_id AND ca.customer_id=i.customer_id AND ca.membership_id=@membership))
                ORDER BY i.created_at DESC,i.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("customer", customerId, NpgsqlDbType.Uuid), new DbArg("order", orderId, NpgsqlDbType.Uuid), new DbArg("all", a.Has("customers.all")), new DbArg("membership", a.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("sales.invoices.read"));
        g.MapGet("/customers/{id:guid}/receivables", async (Guid id, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, id, ct); var (offset, size) = Page(page, pageSize);
            var totals = await One(s, "SELECT receivable,unbilled_orders,available_advances FROM crm.customer_credit_exposures WHERE company_id=@company AND customer_id=@id", ct, new DbArg("id", id));
            var items = await Read(s, """
                SELECT r.id,r.invoice_id,d.number,i.invoice_date::text,r.due_on::text,r.amount,r.journal_entry_id,
                 coalesce((SELECT sum(p.amount) FROM accounting.active_payment_allocations p JOIN sales.invoice_lines il ON il.company_id=p.company_id AND il.id=p.invoice_line_id WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0) AS paid,
                 coalesce((SELECT sum(cl.gross) FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0) AS credited,
                 coalesce((SELECT sum(rf.amount) FROM accounting.active_customer_refunds rf JOIN sales.credit_note_lines cl ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE il.company_id=r.company_id AND il.invoice_id=r.invoice_id),0) AS refunded,
                 coalesce((SELECT sum(outstanding_amount) FROM sales.invoice_line_balances WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0) AS outstanding,
                 coalesce((SELECT sum(refundable_amount) FROM sales.invoice_line_balances WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0) AS credit_balance,
                 coalesce((SELECT sum(credit_received_amount) FROM sales.invoice_line_balances WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0) AS credit_received,
                 coalesce((SELECT sum(credit_used_amount) FROM sales.invoice_line_balances WHERE company_id=r.company_id AND invoice_id=r.invoice_id),0) AS credit_used
                FROM accounting.receivable_items r JOIN sales.invoices i ON i.company_id=r.company_id AND i.id=r.invoice_id JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id
                WHERE r.company_id=@company AND r.customer_id=@id ORDER BY r.due_on,r.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("id", id), new DbArg("size", size), new DbArg("offset", offset));
            return Results.Ok(new { customerId = id, currency = "AUD", receivable = totals["receivable"], unbilledOrders = totals["unbilled_orders"], availableAdvances = totals["available_advances"], items = items.Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("accounting.receivables.read"));
        g.MapGet("/sales-invoices/{id:guid}/gst", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            var invoice = await Header(h, s, id, ct);
            return Results.Ok(new { invoiceId = id, gstBasis = invoice["gst_basis"], invoiceDate = invoice["invoice_date"], entries = (await Read(s, "SELECT g.invoice_line_id,g.tax_code_id,g.tax_rate,g.net,g.tax,g.output_account_id FROM accounting.sales_gst_entries g JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id WHERE g.company_id=@company AND l.invoice_id=@id ORDER BY l.id", ct, new DbArg("id", id))).Select(PublicRow) });
        }).WithMetadata(new Permission("accounting.receivables.read"));
    }
    private static async Task<Dictionary<string, object?>> Header(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var i = await One(s, "SELECT i.*,i.invoice_date::text AS invoice_date,i.due_on::text AS due_on,d.number,d.version,d.state,r.journal_entry_id FROM sales.invoices i JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id WHERE i.company_id=@company AND i.id=@id", ct, new DbArg("id", id));
        await Customer(h, s, (Guid)i["customer_id"]!, ct); return i;
    }
    private static async Task<object> View(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var i = await Header(h, s, id, ct);
        var lines = await Read(s, "SELECT l.id,dl.line_no,l.order_line_id,l.quantity,l.base_quantity,l.net,l.tax,l.gross,l.tax_code_id,l.tax_rate,l.snapshot FROM sales.invoice_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.invoice_id=@id ORDER BY dl.line_no", ct, new DbArg("id", id));
        return new { id, number = i["number"], version = i["version"], state = i["state"], orderId = i["order_id"], customerId = i["customer_id"], title = i["title"], invoiceDate = i["invoice_date"], dueOn = i["due_on"], currency = "AUD", issuer = Element(i["issuer_snapshot"]!), customer = Element(i["customer_snapshot"]!), gstBasis = i["gst_basis"], fulfilmentReference = i["fulfilment_reference"], net = i["net"], tax = i["tax"], gross = i["gross"], journalEntryId = i["journal_entry_id"], lines = lines.Select(l => new { id = l["id"], lineNo = l["line_no"], orderLineId = l["order_line_id"], quantity = l["quantity"], baseQuantity = l["base_quantity"], net = l["net"], tax = l["tax"], gross = l["gross"], taxCodeId = l["tax_code_id"], taxRate = l["tax_rate"], snapshot = Element(l["snapshot"]!) }) };
    }
    private static async Task<IResult> Issue(Guid id, InvoiceInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var reference = Check.Optional(input.FulfilmentReference, "fulfilmentReference", 200);
        if (input.Lines is null || input.Lines.Count is < 1 or > 50 || input.Lines.Any(l => l is null || l.OrderLineId == Guid.Empty) || input.Lines.Select(l => l.OrderLineId).Distinct().Count() != input.Lines.Count)
            throw new BusinessException("invalid_invoice", "Supply 1..50 distinct nonempty order lines.");
        foreach (var l in input.Lines)
        {
            Check.Amount(l.Quantity, "quantity", 6); Check.That(l.Quantity > 0, "quantity", "Positive invoice quantity is required.");
        }
        await Order(h, s, id, false, ct);
        var lines = input.Lines.OrderBy(l => l.OrderLineId).ToArray();
        var response = await idem.ExecuteAsync($"POST /sales-orders/{id}/invoices", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, reference, lines }), async () =>
        {
            var invoice = await One(s, "SELECT sales.post_invoice(@order,@version,@lines,@reference) AS id", ct, new DbArg("order", id), new DbArg("version", expected), new DbArg("lines", Json(lines), NpgsqlDbType.Jsonb), new DbArg("reference", reference, NpgsqlDbType.Text));
            var invoiceId = (Guid)invoice["id"]!;
            await Sql.AuditAsync(s, "sales.invoice_posted", "sales_invoice", invoiceId, h.TraceIdentifier, ct, new { orderId = id, sourceOrderVersion = expected });
            return ApiJson.Stored(await View(h, s, invoiceId, ct));
        }, ct); return ApiJson.Result(response);
    }
}
