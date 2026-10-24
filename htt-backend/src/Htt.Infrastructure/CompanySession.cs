using Npgsql;

namespace Htt.Infrastructure;

public sealed class CompanySession(NpgsqlDataSource dataSource) : IAsyncDisposable
{
    public NpgsqlConnection Connection { get; } = dataSource.CreateConnection();
    public NpgsqlTransaction Transaction { get; private set; } = null!;
    public Guid CompanyId { get; private set; }
    public Guid ActorId { get; private set; }

    public async Task BeginAsync(Guid company, Guid actor, string requestId, CancellationToken cancellationToken)
    {
        CompanyId = company;
        ActorId = actor;
        await Connection.OpenAsync(cancellationToken);
        Transaction = await Connection.BeginTransactionAsync(cancellationToken);
        await using var command = new NpgsqlCommand("""
            SELECT set_config('htt.company_id',@company,true),set_config('htt.actor_id',@actor,true),
                   set_config('htt.request_id',@request,true),set_config('lock_timeout','3s',true),
                   set_config('statement_timeout','10s',true)
            """, Connection, Transaction);
        command.Parameters.AddWithValue("company", company.ToString());
        command.Parameters.AddWithValue("actor", actor.ToString());
        command.Parameters.AddWithValue("request", requestId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (Transaction is not null) await Transaction.DisposeAsync();
        await Connection.DisposeAsync();
    }
}
