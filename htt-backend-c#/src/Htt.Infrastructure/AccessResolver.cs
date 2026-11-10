using Npgsql;

namespace Htt.Infrastructure;

public sealed record CompanyAccess(Guid ActorId, Guid CompanyId, string CompanyName, Guid MembershipId, string[] Permissions)
{
    public bool Has(string permission) => Permissions.Contains(permission, StringComparer.Ordinal);
}

public sealed class AccessResolver(NpgsqlDataSource source)
{
    public async Task<IReadOnlyList<CompanyAccess>> ResolveAsync(string issuer, string subject, CancellationToken token)
    {
        await using var connection = await source.OpenConnectionAsync(token);
        await using var command = new NpgsqlCommand("SELECT * FROM identity.resolve_access(@issuer,@subject)", connection);
        command.Parameters.AddWithValue("issuer", issuer);
        command.Parameters.AddWithValue("subject", subject);
        await using var reader = await command.ExecuteReaderAsync(token);
        var result = new List<CompanyAccess>();
        while (await reader.ReadAsync(token))
            result.Add(new(reader.GetGuid(0), reader.GetGuid(1), reader.GetString(2), reader.GetGuid(3), reader.GetFieldValue<string[]>(4)));
        return result;
    }
}
