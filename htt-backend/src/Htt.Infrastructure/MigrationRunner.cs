using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using Npgsql;

namespace Htt.Infrastructure;

public static class MigrationRunner
{
    public static async Task ApplyAsync(string connectionString, CancellationToken token = default)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(token);
        await using var gate = new NpgsqlCommand("SELECT pg_advisory_lock(4848545441)", connection);
        await gate.ExecuteNonQueryAsync(token);
        try
        {
            await using (var history = new NpgsqlCommand("""
                CREATE TABLE IF NOT EXISTS public.htt_schema_history(
                  name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());
                REVOKE ALL ON public.htt_schema_history FROM PUBLIC;
                """, connection)) await history.ExecuteNonQueryAsync(token);
            var assembly = typeof(MigrationRunner).Assembly;
            foreach (var name in assembly.GetManifestResourceNames().Where(n => n.EndsWith(".sql", StringComparison.Ordinal)).Order(StringComparer.Ordinal))
            {
                await using var stream = assembly.GetManifestResourceStream(name)!;
                using var read = new StreamReader(stream);
                var sql = await read.ReadToEndAsync(token);
                var digest = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sql)));
                await using (var check = new NpgsqlCommand("SELECT sha256 FROM public.htt_schema_history WHERE name=@name", connection))
                {
                    check.Parameters.AddWithValue("name", name);
                    var applied = await check.ExecuteScalarAsync(token) as string;
                    if (applied is not null)
                    {
                        if (applied != digest) throw new InvalidOperationException($"Applied migration changed: {name}");
                        continue;
                    }
                }
                await using var transaction = await connection.BeginTransactionAsync(token);
                await using (var execute = new NpgsqlCommand(sql, connection, transaction) { CommandTimeout = 120 })
                    await execute.ExecuteNonQueryAsync(token);
                await using (var record = new NpgsqlCommand("INSERT INTO public.htt_schema_history(name,sha256) VALUES(@name,@hash)", connection, transaction))
                {
                    record.Parameters.AddWithValue("name", name);
                    record.Parameters.AddWithValue("hash", digest);
                    await record.ExecuteNonQueryAsync(token);
                }
                await transaction.CommitAsync(token);
                Console.WriteLine($"Applied {name}");
            }
        }
        finally
        {
            await using var release = new NpgsqlCommand("SELECT pg_advisory_unlock(4848545441)", connection);
            await release.ExecuteNonQueryAsync(CancellationToken.None);
        }
    }
}
