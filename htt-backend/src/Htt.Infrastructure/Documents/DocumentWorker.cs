using System.Text.Json;
using Npgsql;
using NpgsqlTypes;

namespace Htt.Infrastructure.Documents;

public sealed class DocumentWorker(NpgsqlDataSource source,IPdfRenderer renderer,IFileScanner scanner,IDocumentMailer mailer,IReportExporter? exporter=null)
{
    public async Task<bool> ProcessOneAsync(CancellationToken ct=default)
    {
        Guid id,lease;string kind;
        await using(var claim=await source.OpenConnectionAsync(ct))
        await using(var cmd=new NpgsqlCommand("SELECT id,lease_token,kind FROM platform.claim_document_job()",claim))
        await using(var reader=await cmd.ExecuteReaderAsync(ct))
        {if(!await reader.ReadAsync(ct))return false;id=reader.GetGuid(0);lease=reader.GetGuid(1);kind=reader.GetString(2);}
        var result="SUCCEEDED";string? error=null;byte[]? pdf=null;string? provider=null;var mailStarted=false;
        try
        {
            await using var load=await source.OpenConnectionAsync(ct);
            await using var cmd=new NpgsqlCommand("SELECT platform.load_document_work(@id,@lease)::text",load);cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("lease",lease);
            using var payload=JsonDocument.Parse((string)(await cmd.ExecuteScalarAsync(ct))!);
            switch(kind)
            {
                case "PDF":pdf=await renderer.RenderAsync(payload.RootElement,ct);break;
                case "EXPORT":pdf=await (exporter??new CsvReportExporter()).RenderAsync(payload.RootElement,ct);break;
                case "SCAN":
                    if(!await scanner.IsCleanAsync(Convert.FromBase64String(payload.RootElement.GetProperty("content").GetString()!),ct)){result="REJECTED";error="malware_detected";}break;
                case "EMAIL":mailStarted=true;provider=await mailer.SendAsync(id,payload.RootElement,ct);break;
                default:result="FAILED";error="unsupported_work";break;
            }
        }
        catch(DocumentWorkException e){result=e.Failure switch{WorkFailure.Retry=>"RETRY",WorkFailure.Unknown=>"UNKNOWN",_=>"FAILED"};error=e.Code;}
        catch(PostgresException e) when(e.SqlState is "42501" or "HD409" or "HT404"){result="FAILED";error="document_access_changed";}
        catch(Exception e) when(e is not OutOfMemoryException)
        {result=mailStarted?"UNKNOWN":"RETRY";error=mailStarted?"mail_outcome_unknown":"document_worker_unavailable";}
        // Use a short independent completion budget on cancellation; if this fails, lease recovery handles it.
        using var finishTimeout=new CancellationTokenSource(TimeSpan.FromSeconds(10));
        await using var finish=await source.OpenConnectionAsync(finishTimeout.Token);
        await using var complete=new NpgsqlCommand("SELECT platform.finish_document_work(@id,@lease,@result,@error,@pdf,@provider)",finish);
        complete.Parameters.AddWithValue("id",id);complete.Parameters.AddWithValue("lease",lease);complete.Parameters.AddWithValue("result",result);
        complete.Parameters.AddWithValue("error",NpgsqlDbType.Text,(object?)error??DBNull.Value);complete.Parameters.AddWithValue("pdf",NpgsqlDbType.Bytea,(object?)pdf??DBNull.Value);complete.Parameters.AddWithValue("provider",NpgsqlDbType.Text,(object?)provider??DBNull.Value);
        await complete.ExecuteScalarAsync(finishTimeout.Token);return true;
    }
}
