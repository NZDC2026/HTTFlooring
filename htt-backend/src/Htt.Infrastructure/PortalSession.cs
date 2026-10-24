using Htt.SharedKernel;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Infrastructure;

public sealed class PortalDatabase:IAsyncDisposable
{
    private readonly NpgsqlDataSource? source;
    public PortalDatabase(string? connection)
    {
        ValidateConnection(connection);
        if(string.IsNullOrWhiteSpace(connection))return;
        source=NpgsqlDataSource.Create(connection);
    }
    public static void ValidateConnection(string? connection)
    {
        if(!string.IsNullOrWhiteSpace(connection)&&new NpgsqlConnectionStringBuilder(connection).Username!="htt_portal")throw new InvalidOperationException("Portal queries require the dedicated htt_portal login.");
    }
    public Task<NpgsqlConnection> OpenAsync(CancellationToken ct)=>source is null
        ?throw new BusinessException("portal_not_configured","The customer portal database is not configured.",503)
        :source.OpenConnectionAsync(ct).AsTask();
    public async ValueTask DisposeAsync(){if(source is not null)await source.DisposeAsync();}
}

public sealed class PortalSession(PortalDatabase database):IAsyncDisposable
{
    private NpgsqlConnection? connection;
    private NpgsqlTransaction? transaction;
    public async Task BeginAsync(CancellationToken ct)
    {
        connection=await database.OpenAsync(ct);transaction=await connection.BeginTransactionAsync(ct);
        await using var c=new NpgsqlCommand("SET TRANSACTION READ ONLY; SET LOCAL statement_timeout='10s'; SET LOCAL lock_timeout='3s'",connection,transaction);
        await c.ExecuteNonQueryAsync(ct);
    }
    public async Task<string> QueryAsync(string sql,CancellationToken ct,params(string Name,object? Value,NpgsqlDbType Type)[] args)
    {
        if(connection is null)throw new InvalidOperationException("Portal session not started.");
        await using var command=new NpgsqlCommand(sql,connection,transaction);
        foreach(var a in args)command.Parameters.AddWithValue(a.Name,a.Type,a.Value??DBNull.Value);
        return (string)(await command.ExecuteScalarAsync(ct))!;
    }
    public Task CommitAsync(CancellationToken ct)=>transaction!.CommitAsync(ct);
    public async ValueTask DisposeAsync(){if(transaction is not null)await transaction.DisposeAsync();if(connection is not null)await connection.DisposeAsync();}
}
