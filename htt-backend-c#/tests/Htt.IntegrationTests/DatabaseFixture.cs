using Htt.Infrastructure;
using Npgsql;
using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace Htt.IntegrationTests;

public sealed class DatabaseFixture : IAsyncLifetime
{
    public const string Issuer = "https://htt-test.invalid";
    public string Subject { get; } = "test-admin-" + Guid.NewGuid();
    public string Owner { get; } = Environment.GetEnvironmentVariable("HTT_TEST_OWNER_CONNECTION")
        ?? throw new InvalidOperationException("Integration tests require an isolated PostgreSQL 17 database. Set HTT_TEST_OWNER_CONNECTION and HTT_TEST_APP_CONNECTION; tests are never silently skipped.");
    public string App { get; } = Environment.GetEnvironmentVariable("HTT_TEST_APP_CONNECTION")
        ?? throw new InvalidOperationException("Set HTT_TEST_APP_CONNECTION to the restricted htt_app test login.");
    public string Worker { get; } = Environment.GetEnvironmentVariable("HTT_TEST_WORKER_CONNECTION")
        ?? throw new InvalidOperationException("Set HTT_TEST_WORKER_CONNECTION to the restricted htt_worker test login.");
    public string Portal { get; } = Environment.GetEnvironmentVariable("HTT_TEST_PORTAL_CONNECTION")
        ?? throw new InvalidOperationException("Set HTT_TEST_PORTAL_CONNECTION to the dedicated htt_portal login.");
    public Guid Company { get; private set; }
    public Guid OtherCompany { get; private set; }
    public Guid Actor { get; private set; }

    public async Task InitializeAsync()
    {
        if (new NpgsqlConnectionStringBuilder(Owner).Database?.Contains("test", StringComparison.OrdinalIgnoreCase) != true)
            throw new InvalidOperationException("Refusing integration tests against a database without 'test' in its name.");
        await MigrationRunner.ApplyAsync(Owner);
        Company = await CompanyBootstrap.CreateAsync(Owner, "HTT test", "51824753556", "Australia/Sydney", Issuer, Subject);
        OtherCompany = await CompanyBootstrap.CreateAsync(Owner, "HTT other", null, "Australia/Perth", Issuer, Subject);
        await using var source = NpgsqlDataSource.Create(App);
        var access = await new AccessResolver(source).ResolveAsync(Issuer, Subject, default);
        Actor = access.Single(a => a.CompanyId == Company).ActorId;
    }

    public async Task DisposeAsync()
    {
        if (source is not null) await source.DisposeAsync();
    }

    public async Task<CompanySession> SessionAsync(Guid? company = null)
    {
        // Each session owns a pooled connection; fixture uses a single data source below for scoped sessions.
        var session = new CompanySession(Source);
        await session.BeginAsync(company ?? Company, Actor, "integration-test", default);
        return session;
    }

    private NpgsqlDataSource? source;
    private NpgsqlDataSource Source => source ??= NpgsqlDataSource.Create(App);

    public async Task<object?> OwnerScalarAsync(string sql, params (string, object)[] args)
    {
        await using var connection = new NpgsqlConnection(Owner);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await using var command = new NpgsqlCommand("SELECT set_config('htt.company_id',@scope,true);" + sql, connection, transaction);
        command.Parameters.AddWithValue("scope", Company.ToString());
        foreach (var (name, value) in args) command.Parameters.AddWithValue(name, value);
        // Use a separate setup command to ensure ExecuteScalar returns the caller's SELECT, not set_config.
        command.CommandText = "SELECT set_config('htt.company_id',@scope,true)";
        await command.ExecuteNonQueryAsync();
        command.CommandText = sql;
        var result = await command.ExecuteScalarAsync();
        await transaction.CommitAsync();
        return result;
    }
}
