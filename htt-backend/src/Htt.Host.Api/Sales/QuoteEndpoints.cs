using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

internal static class QuoteEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        g.MapPost("/quotes", CreateQuote).WithMetadata(new Permission("sales.quotes.write"));
        g.MapPut("/quotes/{id:guid}", UpdateQuote).WithMetadata(new Permission("sales.quotes.write"));
        g.MapPost("/quotes/{id:guid}/submit", Submit).WithMetadata(new Permission("sales.quotes.write"));
        g.MapPost("/quotes/{id:guid}/return-to-draft", ReturnToDraft).WithMetadata(new Permission("sales.quotes.approve"));
        g.MapGet("/quotes/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) => Results.Ok(await QuoteView(s, await Quote(h, s, id, false, ct), ct))).WithMetadata(new Permission("sales.quotes.read"));
        g.MapGet("/quotes", async (HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize); var a = Access(h);
            return Results.Ok(new { items = (await Read(s, """
                SELECT q.id,d.number,d.version,q.status,q.customer_id,q.customer_branch_id,q.warehouse_id,q.expires_on,q.gross
                FROM sales.quotes q JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.id
                WHERE q.company_id=@company AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=q.company_id AND ca.customer_id=q.customer_id AND ca.membership_id=@membership))
                ORDER BY q.created_at DESC,q.id LIMIT @size OFFSET @offset
                """, ct, new DbArg("all", a.Has("customers.all")), new DbArg("membership", a.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("sales.quotes.read"));
    }
    private static async Task<IResult> CreateQuote(QuoteInput d, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        await Customer(h, s, d.CustomerId, ct);
        var result = await idem.ExecuteAsync("POST /quotes", h.Request.Headers["Idempotency-Key"].ToString(), Json(d), async () =>
        {
            var built = await QuoteBuilder.Build(h, s, d, ct); var id = Guid.NewGuid();
            await Read(s, "INSERT INTO platform.documents(id,company_id,document_type,business_date,created_by) VALUES(@id,@company,'QUOTE',@today,@actor)", ct, new DbArg("id", id), new DbArg("today", built.Context.Today));
            await Save(s, id, built, true, ct);
            await Sql.AuditAsync(s, "sales.quote_drafted", "quote", id, h.TraceIdentifier, ct);
            return ApiJson.Stored(new { id, number = (string?)null, status = "DRAFT", version = 1 });
        }, ct); return ApiJson.Result(result);
    }
    private static async Task<IResult> UpdateQuote(Guid id, QuoteInput d, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var visible = await Quote(h, s, id, false, ct); Owner(h, s, visible); await Customer(h, s, d.CustomerId, ct);
        var response = await idem.ExecuteAsync($"PUT /quotes/{id}", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, d }), async () =>
        {
            var q = await Quote(h, s, id, true, ct); Match(q, expected); Owner(h, s, q);
            if ((string)q["status"]! != "DRAFT") throw new BusinessException("quote_frozen", "Office must return a submitted quote to draft before changes.", 409);
            var built = await QuoteBuilder.Build(h, s, d, ct); await Save(s, id, built, false, ct);
            var doc = await One(s, "UPDATE platform.documents SET business_date=@today WHERE company_id=@company AND id=@id RETURNING version", ct, new DbArg("today", built.Context.Today), new DbArg("id", id));
            await Sql.AuditAsync(s, "sales.quote_drafted", "quote", id, h.TraceIdentifier, ct, new { previousVersion = expected, version = doc["version"] });
            return ApiJson.Stored(new { id, version = doc["version"], status = "DRAFT" }, 200);
        }, ct); return ApiJson.Result(response);
    }
    private static async Task Save(CompanySession s, Guid id, BuiltQuote b, bool create, CancellationToken ct)
    {
        var args = new DbArg[] { new("id", id), new("customer", b.Input.CustomerId), new("branch", b.Input.CustomerBranchId), new("warehouse", b.Input.WarehouseId), new("expiry", b.Input.ExpiresOn!), new("notes", b.Input.Notes!), new("snapshot", Json(b.Context.Snapshot), NpgsqlDbType.Jsonb), new("net", b.Net), new("tax", b.Tax), new("gross", b.Gross), new("at", b.PricingAt) };
        if (create) await Read(s, "INSERT INTO sales.quotes(id,company_id,customer_id,customer_branch_id,warehouse_id,expires_on,notes,customer_snapshot,net,tax,gross,pricing_at,created_by) VALUES(@id,@company,@customer,@branch,@warehouse,@expiry,@notes,@snapshot,@net,@tax,@gross,@at,@actor)", ct, args);
        else
        {
            await Read(s, "UPDATE sales.quotes SET customer_id=@customer,customer_branch_id=@branch,warehouse_id=@warehouse,expires_on=@expiry,notes=@notes,customer_snapshot=@snapshot,net=@net,tax=@tax,gross=@gross,pricing_at=@at,submitted_by=NULL WHERE company_id=@company AND id=@id", ct, args);
            await Read(s, "DELETE FROM sales.quote_lines WHERE company_id=@company AND quote_id=@id;DELETE FROM platform.document_lines WHERE company_id=@company AND document_id=@id", ct, new DbArg("id", id));
        }
        var lineNo = 0;
        foreach (var l in b.Lines)
        {
            var lineId = Guid.NewGuid();
            await Read(s, """
                INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(@line,@company,@id,@no,@actor);
                INSERT INTO sales.quote_lines(id,company_id,quote_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_price,tax_rate,inclusive,net,tax,gross,input,snapshot,pricing_signature,created_by)
                VALUES(@line,@company,@id,@product,@unit,@type,@qty,@base,@price,@rate,@inclusive,@net,@tax,@gross,@input,@snapshot,@signature,@actor)
                """, ct, new DbArg("line", lineId), new DbArg("id", id), new DbArg("no", ++lineNo), new DbArg("product", l.ProductId), new DbArg("unit", l.Input.ProductUnitId), new DbArg("type", l.ItemType), new DbArg("qty", l.Quantity), new DbArg("base", l.BaseQuantity), new DbArg("price", l.UnitPrice), new DbArg("rate", l.TaxRate), new DbArg("inclusive", l.Inclusive), new DbArg("net", l.Amounts.Net), new DbArg("tax", l.Amounts.Tax), new DbArg("gross", l.Amounts.Gross), new DbArg("input", Json(l.Input), NpgsqlDbType.Jsonb), new DbArg("snapshot", Json(l.Snapshot), NpgsqlDbType.Jsonb), new DbArg("signature", l.Signature));
        }
    }
    private static async Task<IResult> Submit(Guid id, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); Owner(h, s, await Quote(h, s, id, false, ct));
        var result = await idem.ExecuteAsync($"POST /quotes/{id}/submit", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected }), async () =>
        {
            var q = await Quote(h, s, id, true, ct); Match(q, expected); Owner(h, s, q);
            if ((string)q["status"]! != "DRAFT") throw new BusinessException("quote_not_draft", "Only draft quotes can be submitted.", 409);
            var stored = await Read(s, "SELECT l.* FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.quote_id=@id ORDER BY dl.line_no", ct, new DbArg("id", id));
            var input = new QuoteInput((Guid)q["customer_id"]!, (Guid)q["customer_branch_id"]!, (Guid)q["warehouse_id"]!, stored.Select(l => System.Text.Json.JsonSerializer.Deserialize<QuoteLineInput>((string)l["input"]!, ApiJson.Options)!).ToArray(), DateOnly.Parse((string)q["expires_on"]!), q["notes"] as string);
            var built = await QuoteBuilder.Build(h, s, input, ct);
            if (stored.Count != built.Lines.Count || stored.Where((l, i) => (string)l["pricing_signature"]! != built.Lines[i].Signature).Any())
                throw new BusinessException("price_changed", "Pricing or product data changed; refresh the draft with PUT before submission.", 409);
            var doc = await One(s, "UPDATE platform.documents SET number=COALESCE(number,sales.next_number('QUOTE')),state='CONFIRMED',business_date=@today WHERE company_id=@company AND id=@id RETURNING number,version", ct, new DbArg("today", built.Context.Today), new DbArg("id", id));
            await Read(s, "UPDATE sales.quotes SET customer_snapshot=@snapshot,status='SUBMITTED',submitted_by=@actor WHERE company_id=@company AND id=@id", ct, new DbArg("snapshot", Json(built.Context.Snapshot), NpgsqlDbType.Jsonb), new DbArg("id", id));
            var view = await QuoteView(s, await Quote(h, s, id, false, ct), ct);
            await Read(s, "INSERT INTO sales.quote_submissions(company_id,quote_id,document_version,snapshot,created_by) VALUES(@company,@id,@version,@snapshot,@actor);INSERT INTO platform.approval_requests(company_id,document_id,document_version,requested_by,reason,created_by) VALUES(@company,@id,@version,@actor,'Quote submitted for office review',@actor)", ct, new DbArg("id", id), new DbArg("version", (long)doc["version"]!), new DbArg("snapshot", Json(view), NpgsqlDbType.Jsonb));
            await Sql.AuditAsync(s, "sales.quote_submitted", "quote", id, h.TraceIdentifier, ct, new { number = doc["number"], version = doc["version"] });
            return ApiJson.Stored(new { id, number = doc["number"], version = doc["version"], status = "SUBMITTED" }, 200);
        }, ct); return ApiJson.Result(result);
    }
    private static async Task<IResult> ReturnToDraft(Guid id, ReviewInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var reason = Check.Text(input.Reason, "reason", 2000); var expected = Version(h); await Quote(h, s, id, false, ct);
        var response = await idem.ExecuteAsync($"POST /quotes/{id}/return-to-draft", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { reason, expected }), async () =>
        {
            var q = await Quote(h, s, id, true, ct); Match(q, expected);
            if ((string)q["status"]! != "SUBMITTED") throw new BusinessException("quote_not_submitted", "Only unconverted submitted quotes can be returned.", 409);
            await Read(s, "UPDATE platform.approval_requests SET state='STALE' WHERE company_id=@company AND document_id=@id AND document_version=@expected AND state='PENDING';UPDATE sales.quotes SET status='DRAFT' WHERE company_id=@company AND id=@id", ct, new DbArg("id", id), new DbArg("expected", expected));
            var doc = await One(s, "UPDATE platform.documents SET state='DRAFT' WHERE company_id=@company AND id=@id RETURNING version", ct, new DbArg("id", id));
            await Sql.AuditAsync(s, "sales.quote_returned", "quote", id, h.TraceIdentifier, ct, new { reason, previousVersion = expected, version = doc["version"] });
            return ApiJson.Stored(new { id, number = q["number"], status = "DRAFT", version = doc["version"] }, 200);
        }, ct); return ApiJson.Result(response);
    }
}
