using System.Globalization;
using System.Net.Mail;
using System.Text.Json;
using System.Text.RegularExpressions;
using Htt.Infrastructure;
using Htt.SharedKernel;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Host.Api.MasterData;

internal readonly record struct DbArg(string Name, object? Value, NpgsqlDbType? Type = null);

internal static partial class Check
{
    [GeneratedRegex("^[A-Z0-9][A-Z0-9_-]{0,39}$", RegexOptions.CultureInvariant)] private static partial Regex CodeRegex();
    [GeneratedRegex("^[0-9]{4}$", RegexOptions.CultureInvariant)] private static partial Regex PostcodeRegex();
    public static void That(bool condition, string field, string message)
    {
        if (!condition) throw new BusinessException("invalid_master_data", message, 422,
            new Dictionary<string, string[]> { [field] = [message] });
    }
    public static string Text(string? value, string field, int length = 200)
    {
        var text = value?.Trim() ?? "";
        That(text.Length > 0 && text.Length <= length, field, $"{field} must contain 1..{length} characters.");
        return text;
    }
    public static string? Optional(string? value, string field, int length = 200)
    {
        var text = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        That(text is null || text.Length <= length, field, $"{field} exceeds {length} characters.");
        return text;
    }
    public static string Code(string? value, string field = "code")
    {
        var result = (value ?? "").Trim().ToUpperInvariant();
        That(CodeRegex().IsMatch(result), field, $"{field} must be 1..40 ASCII letters, digits, underscores or hyphens.");
        return result;
    }
    public static string OneOf(string? value, string field, params string[] choices)
    {
        That(value is not null && choices.Contains(value, StringComparer.Ordinal), field, $"Invalid {field}.");
        return value!;
    }
    public static decimal Amount(decimal value, string field = "amount", int decimals = 8)
    {
        var max = decimals == 8 ? 999999999999.99999999m : decimals == 6 ? 99999999999999.999999m : 999999999999999999.99m;
        That(value >= 0 && value <= max && decimal.Round(value, decimals) == value, field, $"{field} must be nonnegative, within the storage limit, and have at most {decimals} decimals.");
        return value;
    }
    public static void Dates(DateTimeOffset start, DateTimeOffset? end)
        => That(start != default && (end is null || end > start), "effectiveTo", "Provide a nonempty [start,end) interval.");
    public static string? Email(string? value)
    {
        var result = Optional(value, "email", 254);
        That(result is null || MailAddress.TryCreate(result, out var mail) && mail.Address == result, "email", "Invalid email address.");
        return result;
    }
    public static string? Phone(string? value, string field)
    {
        var result = Optional(value, field, 40);
        That(result is null || result.Any(char.IsAsciiDigit) && result.All(c => char.IsAsciiDigit(c) || "+(). -xextEXT#".Contains(c)), field, $"Invalid {field} number.");
        return result;
    }
    public static Guid[] BranchIds(Guid[]? ids)
    {
        ids ??= [];
        That(ids.Length <= 50 && ids.All(x => x != Guid.Empty) && ids.Distinct().Count() == ids.Length, "branchIds", "Supply at most 50 distinct nonempty branch IDs.");
        return ids.Order().ToArray();
    }
    public static void Address(string country, string? state, string? postcode)
    {
        That(country.Length == 2 && country.All(c => c is >= 'A' and <= 'Z'), "country", "Use a two-letter country code.");
        if (country != "AU") return;
        That(new[] { "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA" }.Contains(state), "state", "An Australian state/territory is required.");
        That(postcode is not null && PostcodeRegex().IsMatch(postcode), "postcode", "Australian postcode must contain four digits.");
    }
}

internal static class MasterDataSupport
{
    private static readonly HashSet<string> Tables = ["crm.customers", "crm.customer_branches", "crm.contacts", "crm.suppliers", "catalog.warehouses", "core.regions", "catalog.products", "catalog.product_units", "catalog.uoms", "catalog.product_categories", "pricing.price_list_items", "pricing.customer_price_rules", "pricing.promotions", "pricing.price_floor_rules"];
    public static CompanyAccess Access(HttpContext http) => (CompanyAccess)http.Items[typeof(CompanyAccess)]!;
    public static (int Offset, int Size) Page(int? page, int? pageSize)
    {
        Check.That((page ?? 1) is >= 1 and <= 100000 && (pageSize ?? 25) is >= 1 and <= 100, "page", "page must be 1..100000 and pageSize 1..100.");
        return (((page ?? 1) - 1) * (pageSize ?? 25), pageSize ?? 25);
    }
    public static object PublicRow(Dictionary<string, object?> row) => row.ToDictionary(x => Camel(x.Key), x => x.Value);
    private static string Camel(string key)
    {
        var pieces = key.Split('_');
        return pieces[0] + string.Concat(pieces.Skip(1).Select(x => char.ToUpperInvariant(x[0]) + x[1..]));
    }
    public static async Task<List<Dictionary<string, object?>>> Read(CompanySession s, string sql, CancellationToken ct, params DbArg[] args)
    {
        await using var command = new NpgsqlCommand(sql, s.Connection, s.Transaction);
        command.Parameters.AddWithValue("company", s.CompanyId);
        command.Parameters.AddWithValue("actor", s.ActorId);
        foreach (var arg in args)
        {
            var parameter = arg.Type is { } type ? command.Parameters.Add(arg.Name, type) : command.Parameters.AddWithValue(arg.Name, arg.Value!);
            if (arg.Type is not null) parameter.Value = arg.Value ?? DBNull.Value;
        }
        await using var reader = await command.ExecuteReaderAsync(ct);
        var rows = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync(ct))
        {
            var row = new Dictionary<string, object?>();
            for (var i = 0; i < reader.FieldCount; i++) row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            rows.Add(row);
        }
        return rows;
    }
    public static async Task<Dictionary<string, object?>> One(CompanySession s, string sql, CancellationToken ct, params DbArg[] args)
        => (await Read(s, sql, ct, args)).SingleOrDefault() ?? throw new BusinessException("not_found", "Resource is unavailable in this scope.", 404);
    public static async Task Reference(CompanySession s, string table, Guid id, CancellationToken ct, bool active = false)
    {
        // All identifiers originate in endpoint code, never in client JSON or URL values.
        if (!Tables.Contains(table) && table is not ("pricing.price_lists" or "accounting.tax_codes")) throw new InvalidOperationException("Unregistered reference table.");
        await One(s, $"SELECT id FROM {table} WHERE company_id=@company AND id=@ref" + (active ? " AND active FOR SHARE" : ""), ct, new DbArg("ref", id));
    }
    public static async Task<Guid> Customer(HttpContext http, CompanySession s, Guid customer, CancellationToken ct)
    {
        var access = Access(http);
        var row = await One(s, """
            SELECT c.id,c.party_id FROM crm.customers c WHERE c.company_id=@company AND c.id=@customer
            AND (@all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=@membership))
            """, ct, new DbArg("customer", customer), new DbArg("all", access.Has("customers.all")), new DbArg("membership", access.MembershipId));
        return (Guid)row["party_id"]!;
    }
    public static async Task<IResult> Create<T>(HttpContext http, CompanySession s, Idempotency idem, string table, T body,
        Func<Guid, Task> write, CancellationToken ct)
    {
        if (!Tables.Contains(table)) throw new InvalidOperationException("Unregistered mutation table.");
        var response = await idem.ExecuteAsync("POST " + http.Request.Path, http.Request.Headers["Idempotency-Key"].ToString(), JsonSerializer.Serialize(body, ApiJson.Options), async () =>
        {
            var id = Guid.NewGuid();
            await write(id);
            var after = await One(s, $"SELECT * FROM {table} WHERE company_id=@company AND id=@id", ct, new DbArg("id", id));
            await Sql.AuditAsync(s, "foundation.master_data_changed", table, id, http.TraceIdentifier, ct, new { before = (object?)null, after = body, version = after["version"] });
            return ApiJson.Stored(new { id, version = after["version"] });
        }, ct);
        return ApiJson.Result(response);
    }
    public static async Task<IResult> Update<T>(HttpContext http, CompanySession s, Idempotency idem, string table, Guid id, T body,
        Func<Dictionary<string, object?>, Task> write, CancellationToken ct)
    {
        if (!Tables.Contains(table)) throw new InvalidOperationException("Unregistered mutation table.");
        var tag = http.Request.Headers.IfMatch.ToString();
        if (!long.TryParse(tag.Trim('"'), NumberStyles.None, CultureInfo.InvariantCulture, out var expected) || expected < 1)
            throw new BusinessException("version_required", "Supply If-Match with a positive current version.", 428);
        var response = await idem.ExecuteAsync("PUT " + http.Request.Path, http.Request.Headers["Idempotency-Key"].ToString(), JsonSerializer.Serialize(new { expected, body }, ApiJson.Options), async () =>
        {
            var before = await One(s, $"SELECT * FROM {table} WHERE company_id=@company AND id=@id FOR UPDATE", ct, new DbArg("id", id));
            if ((long)before["version"]! != expected) throw new BusinessException("version_conflict", "The resource changed. Refresh and retry with a new key.", 409);
            await write(before);
            var after = await One(s, $"SELECT version FROM {table} WHERE company_id=@company AND id=@id", ct, new DbArg("id", id));
            await Sql.AuditAsync(s, "foundation.master_data_changed", table, id, http.TraceIdentifier, ct, new { before = PublicRow(before), after = body, version = after["version"] });
            return ApiJson.Stored(new { id, version = after["version"] }, 200);
        }, ct);
        return ApiJson.Result(response);
    }
}
