using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record ReceiptAllocationInput(Guid InvoiceLineId, decimal Amount);
public sealed record ReceiptAdvanceInput(Guid OrderLineId, decimal Amount);
public sealed record CustomerReceiptInput(decimal Amount, string Method, string Reference, IReadOnlyList<ReceiptAllocationInput>? Allocations = null, IReadOnlyList<ReceiptAdvanceInput>? Advances = null, DateOnly? ReceivedOn = null);
public sealed record AdvanceApplicationInput(string Reference, IReadOnlyList<ReceiptAllocationInput>? Allocations);

internal static class ReceiptEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        SettlementReversalEndpoints.Map(g);
        g.MapPost("/customers/{id:guid}/receipts", Receive).WithMetadata(new Permission("accounting.receipts.write"));
        g.MapGet("/customer-receipts/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await ReceiptView(h, s, id, ct))).WithMetadata(new Permission("accounting.receipts.read"));
        g.MapGet("/customers/{id:guid}/receipts", async (Guid id, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, id, ct); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, "SELECT r.id,d.number,r.received_on::text,r.method,r.reference,r.amount,r.allocated_amount,r.advance_amount,CASE WHEN EXISTS(SELECT 1 FROM accounting.receipt_reversals x WHERE x.company_id=r.company_id AND x.receipt_id=r.id) THEN 'REVERSED' ELSE 'ACTIVE' END AS settlement_status FROM accounting.customer_receipts r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id WHERE r.company_id=@company AND r.customer_id=@id ORDER BY r.created_at DESC,r.id LIMIT @size OFFSET @offset", ct, new DbArg("id", id), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("accounting.receipts.read"));
        g.MapGet("/customers/{id:guid}/advances", async (Guid id, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, id, ct); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, """
                SELECT a.id,a.receipt_id,r.received_on::text,a.order_line_id,a.amount,a.gst_amount,a.gst_basis,a.tax_code_id,
                 a.available,a.applied_amount,a.refunded_amount,a.reversal_id
                FROM accounting.customer_advance_balances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE r.company_id=@company AND r.customer_id=@id ORDER BY r.created_at DESC,a.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("id", id), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("accounting.receipts.read"));
        g.MapPost("/customer-advances/{id:guid}/apply", Apply).WithMetadata(new Permission("accounting.advances.apply"));
        g.MapGet("/advance-applications/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await ApplicationView(h, s, id, ct))).WithMetadata(new Permission("accounting.receipts.read"));
        g.MapGet("/accounting/gst-attributions", async (DateOnly from, DateOnly to, Guid? customerId, int? page, int? pageSize, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            Check.That(to > from && to.DayNumber - from.DayNumber <= 366, "to", "Use a half-open interval of at most 366 days.");
            if (customerId is { } customer) await Customer(h, s, customer, ct);
            var a = Access(h); var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { from, to, items = (await Read(s, """
                SELECT g.id,g.source_document_id,g.receipt_id,g.advance_id,g.invoice_line_id,g.kind,g.gst_basis,g.attribution_date::text,g.tax_code_id,g.amount,g.gst_amount,
                 coalesce(r.customer_id,i.customer_id) AS customer_id
                FROM (SELECT id,company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount FROM accounting.gst_attributions
                 UNION ALL SELECT g.id,g.company_id,g.source_document_id,ad.receipt_id,g.advance_id,g.invoice_line_id,g.kind,g.gst_basis,g.adjustment_date,g.tax_code_id,g.amount,g.gst_amount FROM accounting.gst_adjustments g LEFT JOIN accounting.customer_advances ad ON ad.company_id=g.company_id AND ad.id=g.advance_id) g LEFT JOIN accounting.customer_receipts r ON r.company_id=g.company_id AND r.id=g.receipt_id
                LEFT JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id LEFT JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id
                WHERE g.company_id=@company AND g.attribution_date>=@from AND g.attribution_date<@to AND (@customer IS NULL OR coalesce(r.customer_id,i.customer_id)=@customer)
                 AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=g.company_id AND ca.customer_id=coalesce(r.customer_id,i.customer_id) AND ca.membership_id=@membership))
                ORDER BY g.attribution_date,g.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("from", from), new DbArg("to", to), new DbArg("customer", customerId, NpgsqlDbType.Uuid), new DbArg("all", a.Has("customers.all")), new DbArg("membership", a.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("accounting.gst.read"));
    }
    internal static ReceiptAllocationInput[] Allocations(IReadOnlyList<ReceiptAllocationInput>? lines, bool required)
    {
        lines ??= [];
        Check.That(lines.Count <= 50 && (!required || lines.Count > 0) && lines.All(l => l is not null && l.InvoiceLineId != Guid.Empty) && lines.Select(l => l.InvoiceLineId).Distinct().Count() == lines.Count, "allocations", "Supply up to 50 distinct invoice lines.");
        foreach (var l in lines) { Check.Amount(l.Amount, "amount", 2); Check.That(l.Amount > 0, "amount", "Allocation must be positive."); }
        return lines.OrderBy(l => l.InvoiceLineId).ToArray();
    }
    private static async Task<IResult> Receive(Guid id, CustomerReceiptInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await Customer(h, s, id, ct); var allocations = Allocations(input.Allocations, false); var advances = input.Advances ?? [];
        Check.That(advances.Count <= 50 && advances.All(l => l is not null && l.OrderLineId != Guid.Empty) && advances.Select(l => l.OrderLineId).Distinct().Count() == advances.Count, "advances", "Supply up to 50 distinct order lines.");
        foreach (var a in advances) { Check.Amount(a.Amount, "amount", 2); Check.That(a.Amount > 0, "amount", "Advance must be positive."); }
        Check.Amount(input.Amount, "amount", 2); Check.That(input.Amount > 0 && allocations.Sum(l => l.Amount) + advances.Sum(l => l.Amount) == input.Amount, "amount", "Receipt must equal allocations plus advances.");
        var method = Check.OneOf(input.Method, "method", "BANK_TRANSFER", "CARD", "CASH"); var reference = Check.Text(input.Reference, "reference", 200);
        var sortedAdvances = advances.OrderBy(l => l.OrderLineId).ToArray();
        var response = await idem.ExecuteAsync($"POST /customers/{id}/receipts", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { input.Amount, method, reference, input.ReceivedOn, allocations, advances = sortedAdvances }), async () =>
        {
            var row = await One(s, "SELECT accounting.post_receipt(@customer,@amount,@method,@reference,@date,@allocations,@advances) AS id", ct, new DbArg("customer", id), new DbArg("amount", input.Amount), new DbArg("method", method), new DbArg("reference", reference), new DbArg("date", input.ReceivedOn, NpgsqlDbType.Date), new DbArg("allocations", Json(allocations), NpgsqlDbType.Jsonb), new DbArg("advances", Json(sortedAdvances), NpgsqlDbType.Jsonb));
            var receipt = (Guid)row["id"]!; await Sql.AuditAsync(s, "accounting.customer_received", "customer_receipt", receipt, h.TraceIdentifier, ct, new { customerId = id, input.Amount, reference });
            return ApiJson.Stored(await ReceiptView(h, s, receipt, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Apply(Guid id, AdvanceApplicationInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await Advance(h, s, id, ct); var allocations = Allocations(input.Allocations, true); var reference = Check.Text(input.Reference, "reference", 200);
        var response = await idem.ExecuteAsync($"POST /customer-advances/{id}/apply", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { reference, allocations }), async () =>
        {
            var row = await One(s, "SELECT accounting.apply_advance(@advance,@reference,@lines) AS id", ct, new DbArg("advance", id), new DbArg("reference", reference), new DbArg("lines", Json(allocations), NpgsqlDbType.Jsonb));
            var application = (Guid)row["id"]!; await Sql.AuditAsync(s, "accounting.advance_applied", "advance_application", application, h.TraceIdentifier, ct, new { advanceId = id, reference });
            return ApiJson.Stored(await ApplicationView(h, s, application, ct));
        }, ct); return ApiJson.Result(response);
    }
    private static async Task Advance(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var r = await One(s, "SELECT r.customer_id FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=@company AND a.id=@id", ct, new DbArg("id", id));
        await Customer(h, s, (Guid)r["customer_id"]!, ct);
    }
    private static Task<List<Dictionary<string, object?>>> Allocated(CompanySession s, Guid id, CancellationToken ct) => Read(s, "SELECT invoice_line_id,amount,gst_amount,receipt_id,advance_id FROM accounting.payment_allocations WHERE company_id=@company AND source_document_id=@id ORDER BY invoice_line_id", ct, new DbArg("id", id));
    internal static async Task<object> ReceiptView(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var r = await One(s, "SELECT r.*,r.received_on::text AS received_on,d.number,d.state,d.version,x.id AS reversal_id,p.original_receipt_id,CASE WHEN x.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS settlement_status FROM accounting.customer_receipts r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id LEFT JOIN accounting.receipt_reversals x ON x.company_id=r.company_id AND x.receipt_id=r.id LEFT JOIN accounting.receipt_reapplications p ON p.company_id=r.company_id AND p.id=r.id WHERE r.company_id=@company AND r.id=@id", ct, new DbArg("id", id));
        await Customer(h, s, (Guid)r["customer_id"]!, ct);
        return new { id, number = r["number"], state = r["state"], version = r["version"], customerId = r["customer_id"], receivedOn = r["received_on"], method = r["method"], reference = r["reference"], amount = r["amount"], allocatedAmount = r["allocated_amount"], advanceAmount = r["advance_amount"], settlementStatus=r["settlement_status"],reversalId=r["reversal_id"],originalReceiptId=r["original_receipt_id"], allocations = (await Allocated(s, id, ct)).Select(PublicRow), advances = (await Read(s, "SELECT id,order_line_id,amount,gst_amount,gst_basis FROM accounting.customer_advances WHERE company_id=@company AND receipt_id=@id ORDER BY id", ct, new DbArg("id", id))).Select(PublicRow) };
    }
    private static async Task<object> ApplicationView(HttpContext h, CompanySession s, Guid id, CancellationToken ct)
    {
        var r = await One(s, "SELECT a.*,d.number,d.state,d.version,u.id AS unapplication_id,CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status FROM accounting.advance_applications a JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id LEFT JOIN accounting.advance_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id WHERE a.company_id=@company AND a.id=@id", ct, new DbArg("id", id));
        await Advance(h, s, (Guid)r["advance_id"]!, ct);
        return new { id, number = r["number"], state = r["state"], version = r["version"], applicationStatus=r["application_status"],unapplicationId=r["unapplication_id"],advanceId = r["advance_id"], amount = r["amount"], reference = r["reference"], allocations = (await Allocated(s, id, ct)).Select(PublicRow) };
    }
}
