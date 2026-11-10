using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Npgsql;
using NpgsqlTypes;
namespace Htt.Infrastructure.BankFeeds;

public sealed class BankFeedOptions
{
    public bool Enabled { get; set; }
    public string? Endpoint { get; set; }
    public string? ApiKey { get; set; }
}
public enum FeedFailure { Retry, Failed, Unknown }
public sealed class BankFeedException(string code, FeedFailure failure) : Exception(code)
{
    public string Code { get; } = code;
    public FeedFailure Failure { get; } = failure;
}
public interface IBankFeedGateway
{
    Task<JsonElement> ExecuteAsync(JsonElement request, CancellationToken ct);
}
// HTT gateway v1, not a bank/provider-specific API. Credentials belong only to the worker.
public sealed class HttpBankFeedGateway(BankFeedOptions options, HttpClient client) : IBankFeedGateway
{
    public async Task<JsonElement> ExecuteAsync(JsonElement request, CancellationToken ct)
    {
        if (!options.Enabled || !Uri.TryCreate(options.Endpoint, UriKind.Absolute, out var uri)
            || uri.Scheme != "https" || uri.UserInfo.Length != 0 || uri.Query.Length != 0 || uri.Fragment.Length != 0
            || string.IsNullOrWhiteSpace(options.ApiKey))
            throw new BankFeedException("feed_gateway_unconfigured", FeedFailure.Failed);
        var mutation = request.GetProperty("kind").GetString() == "REVOKE";
        var uncertain = mutation ? FeedFailure.Unknown : FeedFailure.Retry;
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(20));
        using var message = new HttpRequestMessage(HttpMethod.Post, uri);
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);
        message.Headers.Add("Idempotency-Key", request.GetProperty("operationId").GetGuid().ToString());
        message.Headers.Add("X-HTT-Gateway-Version", "1");
        message.Content = new StringContent(request.GetRawText(), Encoding.UTF8, "application/json");
        try
        {
            using var response = await client.SendAsync(message, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
                throw new BankFeedException("feed_rate_limited", FeedFailure.Retry);
            if ((int)response.StatusCode >= 500)
                throw new BankFeedException("feed_gateway_unavailable", uncertain);
            if (!response.IsSuccessStatusCode)
                throw new BankFeedException("feed_gateway_rejected", mutation && (int)response.StatusCode is >= 300 and < 400 ? FeedFailure.Unknown : FeedFailure.Failed);
            await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
            using var buffer = new MemoryStream();var bytes = new byte[8192];int n;
            while ((n = await stream.ReadAsync(bytes, timeout.Token)) > 0)
            {
                if (buffer.Length + n > 2097152) throw new BankFeedException("feed_response_limit", mutation ? FeedFailure.Unknown : FeedFailure.Failed);
                await buffer.WriteAsync(bytes.AsMemory(0, n), timeout.Token);
            }
            using var json = JsonDocument.Parse(buffer.ToArray());
            if (json.RootElement.ValueKind != JsonValueKind.Object) throw new JsonException();
            return json.RootElement.Clone();
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested) { throw new BankFeedException("feed_gateway_timeout", uncertain); }
        catch (HttpRequestException) { throw new BankFeedException("feed_gateway_unavailable", uncertain); }
        catch (JsonException) { throw new BankFeedException("feed_invalid_response", mutation ? FeedFailure.Unknown : FeedFailure.Failed); }
    }
}
public sealed class BankFeedWorker(NpgsqlDataSource source, IBankFeedGateway gateway)
{
    public async Task<bool> ProcessOneAsync(CancellationToken ct = default)
    {
        Guid id, lease;string kind = "";
        await using (var con = await source.OpenConnectionAsync(ct))
        await using (var cmd = new NpgsqlCommand("SELECT job_id,lease FROM bankfeeds.claim()", con))
        await using (var rd = await cmd.ExecuteReaderAsync(ct))
        { if (!await rd.ReadAsync(ct)) return false;id = rd.GetGuid(0);lease = rd.GetGuid(1); }
        var state = "SUCCEEDED";string? error = null;JsonElement? data = null;
        try
        {
            await using var con = await source.OpenConnectionAsync(ct);
            await using var cmd = new NpgsqlCommand("SELECT bankfeeds.load(@id,@lease)::text", con);
            cmd.Parameters.AddWithValue("id", id);cmd.Parameters.AddWithValue("lease", lease);
            using var request = JsonDocument.Parse((string)(await cmd.ExecuteScalarAsync(ct))!);
            kind = request.RootElement.GetProperty("kind").GetString()!;
            data = await gateway.ExecuteAsync(request.RootElement, ct);
        }
        catch (BankFeedException e) { state = e.Failure switch { FeedFailure.Retry => "RETRY", FeedFailure.Unknown => "UNKNOWN", _ => "FAILED" };error = e.Code; }
        catch (PostgresException e) when (e.SqlState is "42501" or "HR409" or "HT404") { state = "FAILED";error = "feed_access_changed"; }
        catch (Exception e) when (e is not OutOfMemoryException)
        { state = kind == "REVOKE" ? "UNKNOWN" : "RETRY";error = "feed_worker_interrupted"; }
        // A shutdown after an external revoke still records uncertainty using an independent bounded token.
        using var finishTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        await using var finish = await source.OpenConnectionAsync(finishTimeout.Token);
        await using var done = new NpgsqlCommand("SELECT bankfeeds.finish(@id,@lease,@state,@error,@data)", finish);
        done.Parameters.AddWithValue("id", id);done.Parameters.AddWithValue("lease", lease);done.Parameters.AddWithValue("state", state);
        done.Parameters.AddWithValue("error", NpgsqlDbType.Text, (object?)error ?? DBNull.Value);
        done.Parameters.AddWithValue("data", NpgsqlDbType.Jsonb, (object?)data?.GetRawText() ?? DBNull.Value);
        await done.ExecuteScalarAsync(finishTimeout.Token);return true;
    }
}
