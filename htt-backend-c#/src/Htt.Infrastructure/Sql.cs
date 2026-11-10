using System.Text.Json;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Infrastructure;

public static class Sql
{
    public static async Task<List<Dictionary<string, object?>>> RowsAsync(CompanySession session, string sql,
        CancellationToken token, params (string Name, object Value)[] args)
    {
        await using var cmd = new NpgsqlCommand(sql, session.Connection, session.Transaction);
        foreach (var (name, value) in args) cmd.Parameters.AddWithValue(name, value);
        await using var reader = await cmd.ExecuteReaderAsync(token);
        var rows = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync(token))
        {
            var row = new Dictionary<string, object?>();
            for (var i = 0; i < reader.FieldCount; i++) row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            rows.Add(row);
        }
        return rows;
    }

    public static async Task AuditAsync(CompanySession session, string action, string entityType, Guid id, string requestId, CancellationToken token, object? details = null)
    {
        await using var command = new NpgsqlCommand("""
            INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
            VALUES(@company,@actor,@action,@type,@id,@request,@details);
            INSERT INTO platform.outbox_events(company_id,event_type,payload,created_by)
            VALUES(@company,@action,@payload,@actor);
            """, session.Connection, session.Transaction);
        command.Parameters.AddWithValue("company", session.CompanyId);
        command.Parameters.AddWithValue("actor", session.ActorId);
        command.Parameters.AddWithValue("action", action);
        command.Parameters.AddWithValue("type", entityType);
        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("request", requestId);
        command.Parameters.AddWithValue("details", NpgsqlDbType.Jsonb, JsonSerializer.Serialize(details ?? new { }));
        command.Parameters.AddWithValue("payload", NpgsqlDbType.Jsonb, JsonSerializer.Serialize(new { entityId = id, entityType }));
        await command.ExecuteNonQueryAsync(token);
    }
}
