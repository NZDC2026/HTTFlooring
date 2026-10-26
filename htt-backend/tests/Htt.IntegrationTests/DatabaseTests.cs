using System.Text.Json;
using Htt.Infrastructure;
using Npgsql;
using Xunit;

namespace Htt.IntegrationTests;

public sealed class DatabaseTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Migrations_are_repeatable_and_au_defaults_are_correct()
    {
        await MigrationRunner.ApplyAsync(db.Owner);
        Assert.Equal(32L, await db.OwnerScalarAsync("SELECT count(*) FROM public.htt_schema_history"));
        Assert.Equal("AUD", await db.OwnerScalarAsync("SELECT base_currency::text FROM core.companies WHERE id=@company", ("company", db.Company)));
        await using var session = await db.SessionAsync();
        var rows = await Sql.RowsAsync(session, "SELECT rate FROM accounting.tax_rates r JOIN accounting.tax_codes t ON t.company_id=r.company_id AND t.id=r.tax_code_id WHERE t.code='GST'", default);
        Assert.Equal(0.10m, rows.Single()["rate"]);
    }

    [Fact]
    public async Task App_login_is_restricted_and_connection_context_does_not_leak()
    {
        await using var connection = new NpgsqlConnection(db.App);
        await connection.OpenAsync();
        await using var cmd = new NpgsqlCommand("SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user", connection);
        Assert.False((bool)(await cmd.ExecuteScalarAsync())!);
        cmd.CommandText = "SELECT count(*) FROM accounting.accounts";
        Assert.Equal(0L, await cmd.ExecuteScalarAsync());
        await using (var session = await db.SessionAsync())
        {
            Assert.Equal(23, (await Sql.RowsAsync(session, "SELECT id FROM accounting.accounts", default)).Count);
            Assert.Empty(await Sql.RowsAsync(session, "SELECT id FROM accounting.accounts WHERE company_id=@other", default, ("other", db.OtherCompany)));
            await session.Transaction.CommitAsync();
        }
        cmd.CommandText = "SELECT count(*) FROM accounting.accounts";
        Assert.Equal(0L, await cmd.ExecuteScalarAsync());
    }

    [Fact]
    public async Task Composite_foreign_key_blocks_cross_company_party()
    {
        var party = Guid.NewGuid();
        await db.OwnerScalarAsync("INSERT INTO crm.parties(id,company_id,legal_name) VALUES(@id,@other,'other') RETURNING id", ("id", party), ("other", db.OtherCompany));
        await using var session = await db.SessionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(session,
            "INSERT INTO crm.customers(company_id,party_id,code) VALUES(@company,@party,'CROSS') RETURNING id", default, ("company", db.Company), ("party", party)));
        Assert.Equal("23503", error.SqlState);
    }

    [Fact]
    public async Task Unbalanced_journal_rolls_back_and_valid_journal_is_immutable()
    {
        var source = (Guid)(await db.OwnerScalarAsync("INSERT INTO platform.documents(company_id,document_type,business_date) VALUES(@company,'TEST',current_date) RETURNING id", ("company", db.Company)))!;
        var accounts = new List<Guid>();
        await using (var session = await db.SessionAsync())
            accounts.AddRange((await Sql.RowsAsync(session, "SELECT id FROM accounting.accounts WHERE code IN ('1000','3000') ORDER BY code", default)).Select(r => (Guid)r["id"]!));
        string Lines(decimal credit) => JsonSerializer.Serialize(new[] { new { accountId = accounts[0], debit = 100m, credit = 0m }, new { accountId = accounts[1], debit = 0m, credit } });
        async Task<Guid> Post(string lines)
        {
            await using var session = await db.SessionAsync();
            await using var cmd = new NpgsqlCommand("SELECT accounting.post_journal(@source,1,'TEST',current_date,'test',@lines::jsonb)", session.Connection, session.Transaction);
            cmd.Parameters.AddWithValue("source", source);
            cmd.Parameters.AddWithValue("lines", lines);
            var id = (Guid)(await cmd.ExecuteScalarAsync())!;
            await session.Transaction.CommitAsync();
            return id;
        }
        var invalid = await Assert.ThrowsAsync<PostgresException>(() => Post(Lines(99)));
        Assert.Equal("23514", invalid.SqlState);
        Assert.Equal(0L, await db.OwnerScalarAsync("SELECT count(*) FROM accounting.posting_batches WHERE source_document_id=@source", ("source", source)));
        var journal = await Post(Lines(100));
        await using var scope = await db.SessionAsync();
        var immutable = await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(scope, "UPDATE accounting.journal_lines SET debit=99 WHERE journal_entry_id=@id RETURNING id", default, ("id", journal)));
        Assert.Equal("42501", immutable.SqlState);
        var duplicate = await Assert.ThrowsAsync<PostgresException>(() => Post(Lines(100)));
        Assert.Equal("23505", duplicate.SqlState);
    }

    [Fact]
    public async Task Concurrent_idempotent_commands_execute_business_action_once()
    {
        var key = Guid.NewGuid().ToString();
        var executed = 0;
        async Task<StoredResponse> Execute()
        {
            await using var session = await db.SessionAsync();
            var result = await new Idempotency(session).ExecuteAsync("TEST", key, "same", async () =>
            {
                Interlocked.Increment(ref executed);
                await Sql.AuditAsync(session, "test.event", "test", Guid.NewGuid(), "test", default);
                return new StoredResponse(201, "{\"ok\":true}");
            }, default);
            await session.Transaction.CommitAsync();
            return result;
        }
        var results = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => Execute()));
        Assert.Equal(1, executed);
        Assert.All(results, r => Assert.True(JsonDocument.Parse(r.Json).RootElement.GetProperty("ok").GetBoolean()));
    }

    [Fact]
    public async Task Outbox_claims_are_exclusive_and_stale_lease_cannot_finish()
    {
        var connection = new NpgsqlConnectionStringBuilder(db.Worker);
        async Task<List<(Guid Id, Guid Lease)>> Claim()
        {
            await using var con = new NpgsqlConnection(connection.ConnectionString);
            await con.OpenAsync();
            await using var command = new NpgsqlCommand("SELECT id,lease_token FROM platform.claim_outbox(100)", con);
            await using var reader = await command.ExecuteReaderAsync();
            var results = new List<(Guid, Guid)>();
            while (await reader.ReadAsync()) results.Add((reader.GetGuid(0), reader.GetGuid(1)));
            return results;
        }
        var claims = await Task.WhenAll(Claim(), Claim());
        Assert.Empty(claims[0].Select(x => x.Id).Intersect(claims[1].Select(x => x.Id)));
        var job = claims.SelectMany(x => x).First();
        await using var worker = new NpgsqlConnection(connection.ConnectionString);
        await worker.OpenAsync();
        await using var finish = new NpgsqlCommand("SELECT platform.finish_outbox(@id,@lease,NULL)", worker);
        finish.Parameters.AddWithValue("id", job.Id);
        finish.Parameters.AddWithValue("lease", Guid.NewGuid());
        Assert.False((bool)(await finish.ExecuteScalarAsync())!);
        finish.Parameters["lease"].Value = job.Lease;
        Assert.True((bool)(await finish.ExecuteScalarAsync())!);
    }

    [Fact]
    public async Task Overlapping_tax_rates_are_rejected_by_database()
    {
        var error = await Assert.ThrowsAsync<PostgresException>(() => db.OwnerScalarAsync("""
            INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from)
            SELECT @company,id,0.15,'2025-01-01' FROM accounting.tax_codes WHERE company_id=@company AND code='GST' RETURNING id
            """, ("company", db.Company)));
        Assert.Equal("23P01", error.SqlState);
    }

    [Fact]
    public async Task Journal_cannot_post_outside_open_period()
    {
        var source = (Guid)(await db.OwnerScalarAsync("INSERT INTO platform.documents(company_id,document_type,business_date) VALUES(@company,'TEST_CLOSED',current_date) RETURNING id", ("company", db.Company)))!;
        await using var scope = await db.SessionAsync();
        var accounts = (await Sql.RowsAsync(scope, "SELECT id FROM accounting.accounts WHERE code IN ('1000','3000') ORDER BY code", default)).Select(x => (Guid)x["id"]!).ToArray();
        var json = JsonSerializer.Serialize(new[] { new { accountId=accounts[0], debit=1m, credit=0m }, new { accountId=accounts[1],debit=0m,credit=1m } });
        var error = await Assert.ThrowsAsync<PostgresException>(() => Sql.RowsAsync(scope,
            "SELECT accounting.post_journal(@source,1,'TEST',date '2090-01-01','closed',@lines::jsonb)", default, ("source",source),("lines",json)));
        Assert.Equal("23514",error.SqlState);
    }
}
