using Htt.Infrastructure;
using Htt.Infrastructure.Documents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

var builder = Host.CreateApplicationBuilder(args);
var connection = builder.Configuration.GetSection("ConnectionStrings")["Database"]
    ?? throw new InvalidOperationException("Set ConnectionStrings__Database to the restricted htt_worker login.");
if (new NpgsqlConnectionStringBuilder(connection).Username != "htt_worker")
    throw new InvalidOperationException("Worker must use the restricted htt_worker login.");
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();
builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connection));
var documentOptions=builder.Configuration.GetSection("Documents").Get<DocumentOptions>()??new DocumentOptions();
builder.Services.AddSingleton(documentOptions);
builder.Services.AddSingleton<IPdfRenderer,ReportLabPdfRenderer>();
builder.Services.AddSingleton<IFileScanner,ClamAvFileScanner>();
builder.Services.AddSingleton<IDocumentMailer>(_=>new ResendDocumentMailer(documentOptions,new HttpClient(new SocketsHttpHandler{AllowAutoRedirect=false})));
builder.Services.AddSingleton<DocumentWorker>();
builder.Services.AddHostedService<DocumentWorkHost>();
builder.Services.AddHostedService<FoundationWorker>();
await builder.Build().RunAsync();

internal sealed class FoundationWorker(NpgsqlDataSource source, ILogger<FoundationWorker> logger) : BackgroundService
{
    private static readonly HashSet<string> Supported = ["documents.trashed", "documents.restored", "portal.access_created", "portal.access_changed", "portal.product_published", "documents.pdf_requested", "documents.email_requested", "documents.attachment_uploaded", "documents.attachment_revoked", "documents.work_retried", "foundation.company_created", "foundation.customer_created", "foundation.customer_status_changed", "foundation.product_created", "foundation.master_data_changed", "sales.quote_drafted", "sales.quote_submitted", "sales.quote_returned", "sales.order_confirmed", "sales.order_cancelled", "sales.invoice_posted", "accounting.tax_configured", "accounting.customer_received", "accounting.advance_applied", "inventory.sales_returned", "sales.credit_posted", "sales.customer_credit_applied", "sales.customer_credit_unapplied", "accounting.customer_refunded", "purchase.order_drafted", "purchase.order_confirmed", "purchase.order_closed", "purchase.goods_received", "purchase.bill_posted", "purchase.supplier_paid", "purchase.goods_returned", "purchase.supplier_credit_applied", "purchase.supplier_credit_unapplied", "purchase.supplier_credited", "purchase.supplier_refunded", "purchase.supplier_advance_applied", "inventory.transit_dispatched", "inventory.transit_received", "inventory.transit_returned", "inventory.transit_shortage_posted", "inventory.transferred", "inventory.written_off", "inventory.count_started", "inventory.count_submitted", "inventory.count_posted", "inventory.count_cancelled", "inventory.picked", "inventory.dispatched", "inventory.pick_cancelled", "inventory.valuation_opened", "inventory.opening_recorded"];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(2));
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await PollAsync(stoppingToken); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (NpgsqlException) { logger.LogWarning("Outbox database unavailable; polling will retry."); }
            if (!await timer.WaitForNextTickAsync(stoppingToken)) break;
        }
    }

    private async Task PollAsync(CancellationToken token)
    {
        var jobs = new List<(Guid Id, Guid Lease, string Type)>();
        await using var connection = await source.OpenConnectionAsync(token);
        await using (var claim = new NpgsqlCommand("SELECT id,lease_token,event_type FROM platform.claim_outbox(20)", connection))
        await using (var reader = await claim.ExecuteReaderAsync(token))
            while (await reader.ReadAsync(token)) jobs.Add((reader.GetGuid(0), reader.GetGuid(1), reader.GetString(2)));
        foreach (var (id, lease, type) in jobs)
        {
            // Stage A's only subscriber is a diagnostic event sink. No email or financial effect is simulated.
            var error = Supported.Contains(type) ? null : "No handler registered for event type.";
            if (error is null) logger.LogInformation("Foundation event {EventId} {EventType} consumed", id, type);
            await using var finish = new NpgsqlCommand("SELECT platform.finish_outbox(@id,@lease,@error)", connection);
            finish.Parameters.AddWithValue("id", id);
            finish.Parameters.AddWithValue("lease", lease);
            finish.Parameters.AddWithValue("error", NpgsqlTypes.NpgsqlDbType.Text, (object?)error ?? DBNull.Value);
            if (!(bool)(await finish.ExecuteScalarAsync(token))!) logger.LogWarning("Lease expired for event {EventId}; completion not applied", id);
        }
    }
}

internal sealed class DocumentWorkHost(DocumentWorker worker,ILogger<DocumentWorkHost> logger):BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while(!ct.IsCancellationRequested)
        {
            try { if(await worker.ProcessOneAsync(ct))continue; }
            catch(OperationCanceledException) when(ct.IsCancellationRequested){break;}
            catch(Exception e) {logger.LogWarning("Document worker unavailable ({ExceptionType}); durable work remains queued or leased",e.GetType().Name);}
            try {await Task.Delay(TimeSpan.FromSeconds(2),ct);}catch(OperationCanceledException) when(ct.IsCancellationRequested){break;}
        }
    }
}
