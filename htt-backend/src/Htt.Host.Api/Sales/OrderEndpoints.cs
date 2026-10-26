using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

internal static class OrderEndpoints
{
    public static void Map(RouteGroupBuilder g)
    {
        DirectOrderEndpoints.Map(g);
        g.MapPost("/quotes/{id:guid}/approve-and-convert", Convert).WithMetadata(new Permission("sales.quotes.approve"));
        g.MapPost("/sales-orders/{id:guid}/cancel", Cancel).WithMetadata(new Permission("sales.orders.cancel"));
        g.MapGet("/sales-orders/{id:guid}", async (Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            var o = await Order(h, s, id, false, ct);
            var lines = await Read(s, "SELECT l.id,dl.line_no,l.product_id,l.product_unit_id,l.quantity,l.base_quantity,l.unit_price,l.net,l.tax,l.gross,l.snapshot FROM sales.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.order_id=@id ORDER BY dl.line_no", ct, new DbArg("id", id));
            return Results.Ok(new { id, number = o["number"], version = o["version"], state = o["state"], sourceQuoteId = o["source_quote_id"], orderOrigin = o["order_origin"], creationReason = o["creation_reason"], notes = o["notes"], pricingAt = o["pricing_at"], customerId = o["customer_id"], warehouseId = o["warehouse_id"], customer = Element(o["customer_snapshot"]!), net = o["net"], tax = o["tax"], gross = o["gross"], cancelReason = o["cancel_reason"], lines = lines.Select(l => new { id = l["id"], lineNo = l["line_no"], productId = l["product_id"], productUnitId = l["product_unit_id"], quantity = l["quantity"], baseQuantity = l["base_quantity"], unitPrice = l["unit_price"], net = l["net"], tax = l["tax"], gross = l["gross"], snapshot = Element(l["snapshot"]!) }) });
        }).WithMetadata(new Permission("sales.orders.read"));
        g.MapGet("/sales-orders", async (HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize); var a = Access(h);
            return Results.Ok(new { items = (await Read(s, "SELECT o.id,d.number,d.version,d.state,o.source_quote_id,o.order_origin,o.customer_id,o.warehouse_id,o.gross FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=o.company_id AND ca.customer_id=o.customer_id AND ca.membership_id=@membership)) ORDER BY o.created_at DESC,o.id LIMIT @size OFFSET @offset", ct, new DbArg("all", a.Has("customers.all")), new DbArg("membership", a.MembershipId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("sales.orders.read"));
    }
    private static async Task<IResult> Convert(Guid id, ReviewInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var reason = Check.Text(input.Reason, "reason", 2000); await Quote(h, s, id, false, ct);
        var response = await idem.ExecuteAsync($"POST /quotes/{id}/approve-and-convert", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, reason }), async () =>
        {
            var q = await Quote(h, s, id, true, ct);
            if ((string)q["status"]! == "CONVERTED")
            {
                var existing = await One(s, "SELECT o.id,d.number,d.version,o.approved_quote_version FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.source_quote_id=@id", ct, new DbArg("id", id));
                if ((long)existing["approved_quote_version"]! != expected) throw new BusinessException("version_conflict", "This quote was converted from another version.", 409);
                return ApiJson.Stored(new { orderId = existing["id"], number = existing["number"], version = existing["version"], sourceQuoteId = id, alreadyConverted = true }, 200);
            }
            Match(q, expected);
            if ((string)q["status"]! != "SUBMITTED") throw new BusinessException("quote_not_submitted", "Submit the quote before office approval.", 409);
            var customer = (Guid)q["customer_id"]!; var warehouse = (Guid)q["warehouse_id"]!;
            await One(s, "SELECT id FROM crm.customers WHERE company_id=@company AND id=@id FOR UPDATE", ct, new DbArg("id", customer));
            var context = await QuoteBuilder.Context(h, s, customer, (Guid)q["customer_branch_id"]!, warehouse, ct);
            if (DateOnly.Parse((string)q["expires_on"]!) < context.Today) throw new BusinessException("quote_expired", "Return the quote to draft and refresh its validity before approval.", 409);
            var approval = await One(s, "SELECT id FROM platform.approval_requests WHERE company_id=@company AND document_id=@id AND document_version=@version AND state='PENDING' FOR UPDATE", ct, new DbArg("id", id), new DbArg("version", expected));
            var lines = await Read(s, "SELECT l.*,dl.line_no FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.quote_id=@id ORDER BY dl.line_no", ct, new DbArg("id", id));
            foreach (var unit in lines.Select(l => (Guid)l["product_unit_id"]!).Distinct().Order())
            {
                var current = await One(s, "SELECT u.conversion_to_base,p.item_type FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=@company AND u.id=@id AND u.active AND m.active AND p.status='ACTIVE' AND p.sell_enabled FOR SHARE OF u,p", ct, new DbArg("id", unit));
                var floor = (await Read(s, "SELECT amount FROM pricing.price_floor_rules WHERE company_id=@company AND product_unit_id=@id AND active", ct, new DbArg("id", unit))).SingleOrDefault();
                foreach (var line in lines.Where(l => (Guid)l["product_unit_id"]! == unit))
                {
                    if ((string)current["item_type"]! != (string)line["item_type"]! || (decimal)line["quantity"]! * (decimal)current["conversion_to_base"]! != (decimal)line["base_quantity"]!)
                        throw new BusinessException("product_changed", "Return the quote to draft after product or unit changes.", 409);
                    if (floor is not null && (decimal)line["unit_price"]! < (decimal)floor["amount"]!) throw new BusinessException("price_below_floor", "Current floor policy requires a refreshed quote.", 409);
                }
            }
            var frozen=lines.Select(l=>new ConfirmationLine((int)l["line_no"]!,(Guid)l["id"]!,(Guid)l["product_id"]!,(Guid)l["product_unit_id"]!,(string)l["item_type"]!,(decimal)l["quantity"]!,(decimal)l["base_quantity"]!,(decimal)l["unit_price"]!,(decimal)l["net"]!,(decimal)l["tax"]!,(decimal)l["gross"]!,(string)l["snapshot"]!)).ToArray();
            var confirmed=await OrderConfirmation.Confirm(s,context,customer,(Guid)q["customer_branch_id"]!,warehouse,(string)q["customer_snapshot"]!,(decimal)q["net"]!,(decimal)q["tax"]!,(decimal)q["gross"]!,frozen,id,expected,null,(string)q["notes"]!,new DateTimeOffset((DateTime)q["pricing_at"]!),ct);
            var order=confirmed.Id;
            await Read(s, """
                UPDATE platform.approval_requests SET state='APPROVED' WHERE company_id=@company AND id=@approval;
                INSERT INTO platform.approval_actions(company_id,request_id,actor_id,action,reason) VALUES(@company,@approval,@actor,'APPROVE',@reason);
                UPDATE sales.quotes SET status='CONVERTED' WHERE company_id=@company AND id=@quote;
                UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=@company AND id=@quote
                """, ct, new DbArg("approval", (Guid)approval["id"]!), new DbArg("reason", reason), new DbArg("quote", id));
            await Sql.AuditAsync(s, "sales.order_confirmed", "sales_order", order, h.TraceIdentifier, ct, new { sourceQuoteId = id, sourceQuoteVersion = expected, reason, number = confirmed.Number });
            return ApiJson.Stored(new { orderId = order, number = confirmed.Number, version = confirmed.Version, sourceQuoteId = id, alreadyConverted = false });
        }, ct); return ApiJson.Result(response);
    }
    private static async Task<IResult> Cancel(Guid id, ReviewInput input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var expected = Version(h); var reason = Check.Text(input.Reason, "reason", 2000); await Order(h, s, id, false, ct);
        var response = await idem.ExecuteAsync($"POST /sales-orders/{id}/cancel", h.Request.Headers["Idempotency-Key"].ToString(), Json(new { expected, reason }), async () =>
        {
            var o = await Order(h, s, id, true, ct); Match(o, expected);
            if ((string)o["state"]! != "CONFIRMED") throw new BusinessException("order_not_confirmed", "Only unfulfilled confirmed orders can be cancelled.", 409);
            if ((await Read(s, "SELECT id FROM sales.invoices WHERE company_id=@company AND order_id=@id LIMIT 1", ct, new DbArg("id", id))).Count > 0)
                throw new BusinessException("order_already_invoiced", "Invoiced orders require a credit-note workflow.", 409);
            await One(s, "SELECT id FROM crm.customers WHERE company_id=@company AND id=@id FOR UPDATE", ct, new DbArg("id", (Guid)o["customer_id"]!));
            await One(s, "SELECT id FROM sales.lock_credit(@id)", ct, new DbArg("id", (Guid)o["customer_id"]!));
            var reservations = await Read(s, "SELECT r.id,r.quantity,r.consumed_quantity,b.product_id FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id JOIN inventory.stock_balances b ON b.company_id=r.company_id AND b.id=r.stock_balance_id WHERE r.company_id=@company AND l.order_id=@id ORDER BY b.product_id,r.id", ct, new DbArg("id", id));
            if (reservations.Any(r => (decimal)r["consumed_quantity"]! > 0)) throw new BusinessException("order_already_fulfilled", "Delivered stock requires a return workflow, not cancellation.", 409);
            foreach (var product in reservations.Select(r => (Guid)r["product_id"]!).Distinct().Order()) await Read(s, "SELECT id FROM inventory.lock_balance(@warehouse,@product)", ct, new DbArg("warehouse", (Guid)o["warehouse_id"]!), new DbArg("product", product));
            foreach (var r in reservations) await Read(s, "UPDATE inventory.stock_reservations SET released_quantity=quantity WHERE company_id=@company AND id=@id", ct, new DbArg("id", (Guid)r["id"]!));
            await Read(s, "UPDATE sales.credit_commitments SET released_amount=amount WHERE company_id=@company AND order_id=@id;UPDATE sales.orders SET cancelled_at=now(),cancel_reason=@reason WHERE company_id=@company AND id=@id", ct, new DbArg("id", id), new DbArg("reason", reason));
            var doc = await One(s, "UPDATE platform.documents SET state='CANCELLED' WHERE company_id=@company AND id=@id RETURNING version", ct, new DbArg("id", id));
            await Sql.AuditAsync(s, "sales.order_cancelled", "sales_order", id, h.TraceIdentifier, ct, new { reason, version = doc["version"] });
            return ApiJson.Stored(new { orderId = id, state = "CANCELLED", version = doc["version"] }, 200);
        }, ct); return ApiJson.Result(response);
    }
}
