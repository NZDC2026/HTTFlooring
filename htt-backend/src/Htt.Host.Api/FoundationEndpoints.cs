using System.Text.Json;
using System.Text.RegularExpressions;
using Htt.Infrastructure;
using Htt.Modules.Foundation;
using Htt.SharedKernel;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Host.Api;

public sealed record CustomerDraft(string Code, string LegalName, string? Abn, decimal CreditLimit = 0, int PaymentTermsDays = 30);
public sealed record CustomerState(string Status);
public sealed record UnitDraft(Guid UomId, decimal ConversionToBase, decimal QuantityStep = 1);
public sealed record ProductDraft(string Sku, string Name, Guid BaseUomId, Guid TaxCodeId, bool WholePacks, UnitDraft[] Units);

public static partial class FoundationEndpoints
{
    [GeneratedRegex("^[A-Z0-9][A-Z0-9_-]{0,39}$", RegexOptions.CultureInvariant)]
    private static partial Regex CodePattern();
    private static CompanyAccess Access(HttpContext http) => (CompanyAccess)http.Items[typeof(CompanyAccess)]!;

    public static void MapFoundation(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        group.MapGet("/foundation", async (CompanySession session, CancellationToken token) => Results.Ok(new
        {
            companies = await Sql.RowsAsync(session, "SELECT id,name,abn,country,base_currency,timezone,financial_year_start_month,gst_basis,gst_registered FROM core.companies", token),
            units = await Sql.RowsAsync(session, "SELECT id,code,name,active,version FROM catalog.uoms ORDER BY code", token),
            taxCodes = await Sql.RowsAsync(session, "SELECT id,code,name,category FROM accounting.tax_codes ORDER BY code", token),
            serverTime = DateTimeOffset.UtcNow
        })).WithMetadata(new Permission("foundation.read"));

        group.MapGet("/customers", ListCustomers).WithMetadata(new Permission("customers.read"));
        group.MapPost("/customers", CreateCustomer).WithMetadata(new Permission("customers.write"));
        group.MapPatch("/customers/{id:guid}/status", ChangeCustomerStatus).WithMetadata(new Permission("customers.write"));
        group.MapGet("/products", async (FoundationDbContext db, CompanySession session, int? page, int? pageSize, CancellationToken token) =>
        {
            var (skip, size) = Pagination(page, pageSize);
            var items = await db.Products.AsNoTracking().Where(p => p.CompanyId == session.CompanyId)
                .OrderBy(p => p.Sku).ThenBy(p => p.Id).Skip(skip).Take(size)
                .Select(p => new { p.Id, p.Sku, p.Name, p.ItemType, p.Status, p.BaseUomId, p.WholePacks, p.Version }).ToListAsync(token);
            return Results.Ok(new { items, page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("catalog.read"));
        group.MapPost("/products", CreateProduct).WithMetadata(new Permission("catalog.write"));
        group.MapGet("/products/{id:guid}/units", async (Guid id, FoundationDbContext db, CompanySession session, CancellationToken token) =>
            Results.Ok(await db.ProductUnits.AsNoTracking().Where(u => u.CompanyId == session.CompanyId && u.ProductId == id)
                .OrderBy(u => u.Id).Select(u => new { u.Id, u.UomId, u.ConversionToBase, u.QuantityStep, u.Active, u.Version }).ToListAsync(token)))
            .WithMetadata(new Permission("catalog.read"));
        group.MapGet("/accounting/accounts", async (CompanySession session, CancellationToken token) =>
            Results.Ok(await Sql.RowsAsync(session, "SELECT id,code,name,kind,control_kind FROM accounting.accounts ORDER BY code", token)))
            .WithMetadata(new Permission("accounting.read"));
        group.MapGet("/accounting/tax-rates", async (CompanySession session, CancellationToken token) =>
            Results.Ok(await Sql.RowsAsync(session, "SELECT t.code,r.rate,r.effective_from,r.effective_to FROM accounting.tax_rates r JOIN accounting.tax_codes t ON t.company_id=r.company_id AND t.id=r.tax_code_id ORDER BY t.code,r.effective_from", token)))
            .WithMetadata(new Permission("accounting.read"));
        group.MapGet("/pricing/resolve", ResolvePrice).WithMetadata(new Permission("pricing.read"));
        group.MapGet("/audit", async (CompanySession session, int? page, int? pageSize, CancellationToken token) =>
        {
            var (skip, size) = Pagination(page, pageSize);
            return Results.Ok(await Sql.RowsAsync(session, "SELECT id,actor_id,action,entity_type,entity_id,request_id,created_at FROM platform.audit_events ORDER BY created_at DESC,id DESC LIMIT @size OFFSET @skip", token, ("size", size), ("skip", skip)));
        }).WithMetadata(new Permission("audit.read"));
    }

    private static (int Skip, int Size) Pagination(int? page, int? size)
    {
        if ((page ?? 1) is < 1 or > 100000 || (size ?? 25) is < 1 or > 100)
            throw new BusinessException("invalid_pagination", "Page must be 1..100000; pageSize must be 1..100.", 400);
        return (((page ?? 1) - 1) * (size ?? 25), size ?? 25);
    }

    private static async Task<IResult> ListCustomers(HttpContext http, FoundationDbContext db, CompanySession session,
        string? search, int? page, int? pageSize, CancellationToken token)
    {
        var (skip, size) = Pagination(page, pageSize);
        if (search?.Length > 100) throw new BusinessException("invalid_search", "Search is limited to 100 characters.", 400);
        var access = Access(http);
        var all = access.Has("customers.all");
        var customers = db.Customers.FromSqlInterpolated($"""
            SELECT c.* FROM crm.customers c WHERE c.company_id={session.CompanyId}
            AND ({all} OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                 WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id={access.MembershipId}))
            """);
        var query = from c in customers.AsNoTracking()
                    join p in db.Parties.AsNoTracking() on new { c.CompanyId, Id = c.PartyId } equals new { p.CompanyId, p.Id }
                    select new { c.Id, c.Code, p.LegalName, p.Abn, c.Status, c.CreditLimit, c.PaymentTermsDays, c.Version };
        if (!string.IsNullOrWhiteSpace(search))
        {
            var text = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Code.ToLower().Contains(text) || x.LegalName.ToLower().Contains(text));
        }
        return Results.Ok(new { items = await query.OrderBy(x => x.Code).ThenBy(x => x.Id).Skip(skip).Take(size).ToListAsync(token), page = page ?? 1, pageSize = size });
    }

    private static async Task<IResult> CreateCustomer(CustomerDraft draft, HttpContext http, CompanySession session, Idempotency idempotency, CancellationToken token)
    {
        var code = (draft.Code ?? "").Trim().ToUpperInvariant();
        if (!CodePattern().IsMatch(code) || string.IsNullOrWhiteSpace(draft.LegalName) || draft.LegalName.Length > 200
            || draft.CreditLimit < 0 || decimal.Round(draft.CreditLimit, 2) != draft.CreditLimit || draft.PaymentTermsDays is < 0 or > 365)
            throw new BusinessException("invalid_customer", "Provide a code, legal name, nonnegative two-decimal credit limit, and valid terms.");
        var abn = string.IsNullOrWhiteSpace(draft.Abn) ? null : AustralianBusinessNumber.Normalize(draft.Abn);
        var normalized = draft with { Code = code, LegalName = draft.LegalName.Trim(), Abn = abn };
        if ((draft.CreditLimit > 0 || draft.PaymentTermsDays != 30) && !Access(http).Has("customers.credit.write"))
            throw new BusinessException("permission_denied", "Initial credit and nondefault terms require credit permission.", 403);
        var response = await idempotency.ExecuteAsync("POST /customers", http.Request.Headers["Idempotency-Key"].ToString(), JsonSerializer.Serialize(normalized), async () =>
        {
            var id = Guid.NewGuid();
            var party = Guid.NewGuid();
            await using var command = new NpgsqlCommand("""
                INSERT INTO crm.parties(id,company_id,legal_name,abn,created_by) VALUES(@party,@company,@name,@abn,@actor);
                INSERT INTO crm.customers(id,company_id,party_id,code,credit_limit,payment_terms_days,created_by)
                  VALUES(@id,@company,@party,@code,@credit,@terms,@actor);
                INSERT INTO crm.customer_credit_exposures(company_id,customer_id,created_by) VALUES(@company,@id,@actor);
                """, session.Connection, session.Transaction);
            command.Parameters.AddWithValue("party", party);
            command.Parameters.AddWithValue("company", session.CompanyId);
            command.Parameters.AddWithValue("actor", session.ActorId);
            command.Parameters.AddWithValue("name", normalized.LegalName);
            command.Parameters.AddWithValue("abn", NpgsqlDbType.Varchar, (object?)abn ?? DBNull.Value);
            command.Parameters.AddWithValue("id", id);
            command.Parameters.AddWithValue("code", code);
            command.Parameters.AddWithValue("credit", normalized.CreditLimit);
            command.Parameters.AddWithValue("terms", normalized.PaymentTermsDays);
            await command.ExecuteNonQueryAsync(token);
            await Sql.AuditAsync(session, "foundation.customer_created", "customer", id, http.TraceIdentifier, token);
            return ApiJson.Stored(new { id, version = 1 });
        }, token);
        return ApiJson.Result(response);
    }

    private static async Task<IResult> ChangeCustomerStatus(Guid id, CustomerState draft, HttpContext http, CompanySession session, Idempotency idempotency, CancellationToken token)
    {
        if (draft.Status is not ("ACTIVE" or "ON_HOLD" or "INACTIVE")) throw new BusinessException("invalid_status", "Invalid customer status.");
        if (!long.TryParse(http.Request.Headers.IfMatch.ToString().Trim('"'), out var version) || version < 1)
            throw new BusinessException("version_required", "Supply If-Match with the current resource version.", 428);
        var response = await idempotency.ExecuteAsync($"PATCH /customers/{id}/status", http.Request.Headers["Idempotency-Key"].ToString(),
            JsonSerializer.Serialize(new { id, version, draft.Status }), async () =>
            {
                var access = Access(http);
                await MasterData.MasterDataSupport.Customer(http, session, id, token);
                var current = await MasterData.MasterDataSupport.One(session,"SELECT status FROM crm.customers WHERE company_id=@company AND id=@id FOR UPDATE",token,new MasterData.DbArg("id",id));
                if ((string)current["status"]! == "ON_HOLD" && draft.Status != "ON_HOLD" && !access.Has("customers.credit.write"))
                    throw new BusinessException("permission_denied","Releasing a customer hold requires credit permission.",403);
                var result = await Sql.RowsAsync(session, """
                    WITH prior AS (
                      SELECT c.id,c.status,c.version FROM crm.customers c WHERE c.company_id=@company AND c.id=@id AND c.version=@version
                      AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=@membership))
                      FOR UPDATE
                    )
                    UPDATE crm.customers c SET status=@status FROM prior p WHERE c.company_id=@company AND c.id=p.id
                    RETURNING c.id,c.version,p.status AS previous_status,p.version AS previous_version
                    """, token, ("status", draft.Status), ("company", session.CompanyId), ("id", id), ("version", version),
                    ("all", access.Has("customers.all")), ("membership", access.MembershipId));
                if (result.Count == 0) throw new BusinessException("version_conflict", "Resource unavailable or changed; refresh before retrying.", 409);
                await Sql.AuditAsync(session, "foundation.customer_status_changed", "customer", id, http.TraceIdentifier, token,
                    new { previousStatus = result[0]["previous_status"], status = draft.Status, previousVersion = result[0]["previous_version"], version = result[0]["version"] });
                return ApiJson.Stored(new { id, version = result[0]["version"] }, 200);
            }, token);
        return ApiJson.Result(response);
    }

    private static async Task<IResult> CreateProduct(ProductDraft draft, HttpContext http, CompanySession session, Idempotency idempotency, CancellationToken token)
    {
        var sku = (draft.Sku ?? "").Trim().ToUpperInvariant();
        if (!CodePattern().IsMatch(sku) || string.IsNullOrWhiteSpace(draft.Name) || draft.Name.Length > 200
            || draft.Units is null || draft.Units.Length is < 1 or > 20 || draft.Units.Any(u => u is null || u.ConversionToBase <= 0 || u.QuantityStep <= 0
                || decimal.Round(u.ConversionToBase, 6) != u.ConversionToBase || decimal.Round(u.QuantityStep, 6) != u.QuantityStep)
            || draft.Units.Select(u => u.UomId).Distinct().Count() != draft.Units.Length
            || !draft.Units.Any(u => u.UomId == draft.BaseUomId && u.ConversionToBase == 1))
            throw new BusinessException("invalid_product", "Provide SKU, name and unique positive units, including base-unit conversion 1 (max six decimals).");
        var normalized = draft with { Sku = sku, Name = draft.Name.Trim(), Units = draft.Units.OrderBy(x => x.UomId).ToArray() };
        var response = await idempotency.ExecuteAsync("POST /products", http.Request.Headers["Idempotency-Key"].ToString(), JsonSerializer.Serialize(normalized), async () =>
        {
            var id = Guid.NewGuid();
            foreach (var unit in normalized.Units)
                await MasterData.MasterDataSupport.Reference(session,"catalog.uoms",unit.UomId,token,true);
            await using (var command = new NpgsqlCommand("""
                INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id,whole_packs,created_by)
                VALUES(@id,@company,@sku,@name,@base,@tax,@whole,@actor)
                """, session.Connection, session.Transaction))
            {
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("company", session.CompanyId);
                command.Parameters.AddWithValue("actor", session.ActorId);
                command.Parameters.AddWithValue("sku", normalized.Sku);
                command.Parameters.AddWithValue("name", normalized.Name);
                command.Parameters.AddWithValue("base", draft.BaseUomId);
                command.Parameters.AddWithValue("tax", draft.TaxCodeId);
                command.Parameters.AddWithValue("whole", draft.WholePacks);
                await command.ExecuteNonQueryAsync(token);
            }
            foreach (var unit in normalized.Units)
            {
                await using var command = new NpgsqlCommand("""
                    INSERT INTO catalog.product_units(company_id,product_id,uom_id,conversion_to_base,quantity_step,created_by)
                    VALUES(@company,@product,@uom,@conversion,@step,@actor)
                    """, session.Connection, session.Transaction);
                command.Parameters.AddWithValue("company", session.CompanyId);
                command.Parameters.AddWithValue("product", id);
                command.Parameters.AddWithValue("uom", unit.UomId);
                command.Parameters.AddWithValue("conversion", unit.ConversionToBase);
                command.Parameters.AddWithValue("step", unit.QuantityStep);
                command.Parameters.AddWithValue("actor", session.ActorId);
                await command.ExecuteNonQueryAsync(token);
            }
            await Sql.AuditAsync(session, "foundation.product_created", "product", id, http.TraceIdentifier, token);
            return ApiJson.Stored(new { id, version = 1 });
        }, token);
        return ApiJson.Result(response);
    }

    private static async Task<IResult> ResolvePrice(Guid customerId, Guid productUnitId, HttpContext http, CompanySession session, CancellationToken token)
    {
        var access = Access(http);
        var customers = await Sql.RowsAsync(session, """
            SELECT id FROM crm.customers c WHERE id=@customer AND
            (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=@membership))
            """, token, ("customer", customerId), ("all", access.Has("customers.all")), ("membership", access.MembershipId));
        if (customers.Count == 0) return Results.NotFound();
        var price = await Sales.QuotePricing.Resolve(session, customerId, productUnitId, DateTimeOffset.UtcNow, token);
        return Results.Ok(price.Public(customerId, productUnitId));
    }
}
