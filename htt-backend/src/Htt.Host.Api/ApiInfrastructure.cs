using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Htt.Infrastructure;
using Htt.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace Htt.Host.Api;

public sealed record Permission(string Code);

public static class PrincipalIdentity
{
    public static (string Issuer, string Subject) External(ClaimsPrincipal principal)
    {
        var issuer = principal.FindFirstValue("iss");
        var subject = principal.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(subject))
            throw new BusinessException("identity_missing", "A verified issuer and subject are required.", 401);
        return (issuer, subject);
    }
}

public sealed class CompanyFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        if (!Guid.TryParse(http.Request.Headers["X-Company-Id"], out var company))
            throw new BusinessException("company_required", "Supply a valid X-Company-Id header.", 400);
        var (issuer, subject) = PrincipalIdentity.External(http.User);
        var services = http.RequestServices;
        var accesses = await services.GetRequiredService<AccessResolver>().ResolveAsync(issuer, subject, http.RequestAborted);
        var access = accesses.SingleOrDefault(a => a.CompanyId == company)
            ?? throw new BusinessException("company_forbidden", "No active membership in the selected company.", 403);
        var permission = http.GetEndpoint()!.Metadata.GetMetadata<Permission>()?.Code
            ?? throw new InvalidOperationException("Scoped endpoint missing explicit permission.");
        if (!access.Has(permission)) throw new BusinessException("permission_denied", "This operation is not permitted.", 403);
        http.Items[typeof(CompanyAccess)] = access;
        var session = services.GetRequiredService<CompanySession>();
        await session.BeginAsync(company, access.ActorId, http.TraceIdentifier, http.RequestAborted);
        await services.GetRequiredService<FoundationDbContext>().Database.UseTransactionAsync(session.Transaction, http.RequestAborted);
        await DocumentTrashEndpoints.CheckVisible(http, session, http.RequestAborted);
        var result = await next(context);
        if (result is IStatusCodeHttpResult { StatusCode: >= 400 })
            await session.Transaction.RollbackAsync(http.RequestAborted);
        else
            await session.Transaction.CommitAsync(http.RequestAborted);
        return result;
    }
}

public sealed class DecimalStringConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number && reader.TryGetDecimal(out var number)) return number;
        if (reader.TokenType == JsonTokenType.String && decimal.TryParse(reader.GetString(),
            NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var textNumber)) return textNumber;
        throw new JsonException("Expected a finite decimal number or invariant decimal string.");
    }
    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString(CultureInfo.InvariantCulture));
}

public static class ApiJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new DecimalStringConverter() }
    };

    public static StoredResponse Stored(object value, int status = 201) => new(status, JsonSerializer.Serialize(value, Options));
    public static IResult Result(StoredResponse value) => Results.Content(value.Json, "application/json", statusCode: value.StatusCode);
}
