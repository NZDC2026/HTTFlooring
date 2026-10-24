using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Htt.SharedKernel;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Infrastructure;

public sealed record StoredResponse(int StatusCode, string Json);

public sealed class Idempotency(CompanySession session)
{
    // Runs inside the company transaction; even first-time concurrent requests serialize before executing.
    public async Task<StoredResponse> ExecuteAsync(string route, string key, string canonicalRequest,
        Func<Task<StoredResponse>> action, CancellationToken token)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length > 128)
            throw new BusinessException("idempotency_key_required", "Supply an Idempotency-Key of 1..128 characters.", 400);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonicalRequest)));
        await using (var gate = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended(@lock,0))", session.Connection, session.Transaction))
        {
            gate.Parameters.AddWithValue("lock", $"{session.CompanyId}:{session.ActorId}:{route}:{key}");
            await gate.ExecuteNonQueryAsync(token);
        }
        await using (var find = new NpgsqlCommand("""
            SELECT request_hash,status_code,response_json::text FROM platform.idempotency_requests
            WHERE company_id=@company AND actor_id=@actor AND route=@route AND key=@key
            """, session.Connection, session.Transaction))
        {
            AddScope(find, route, key);
            await using var reader = await find.ExecuteReaderAsync(token);
            if (await reader.ReadAsync(token))
            {
                if (reader.GetString(0) != hash)
                    throw new BusinessException("idempotency_conflict", "This key was already used with different input.", 409);
                return new(reader.GetInt32(1), reader.GetString(2));
            }
        }
        var response = await action();
        // Enforce valid JSON before committing business changes.
        using var document = JsonDocument.Parse(response.Json);
        await using var save = new NpgsqlCommand("""
            INSERT INTO platform.idempotency_requests(company_id,actor_id,route,key,request_hash,response_json,status_code,created_by)
            VALUES(@company,@actor,@route,@key,@hash,@response,@status,@actor)
            """, session.Connection, session.Transaction);
        AddScope(save, route, key);
        save.Parameters.AddWithValue("hash", hash);
        save.Parameters.AddWithValue("response", NpgsqlDbType.Jsonb, response.Json);
        save.Parameters.AddWithValue("status", response.StatusCode);
        await save.ExecuteNonQueryAsync(token);
        return response;
    }

    private void AddScope(NpgsqlCommand command, string route, string key)
    {
        command.Parameters.AddWithValue("company", session.CompanyId);
        command.Parameters.AddWithValue("actor", session.ActorId);
        command.Parameters.AddWithValue("route", route);
        command.Parameters.AddWithValue("key", key);
    }
}
