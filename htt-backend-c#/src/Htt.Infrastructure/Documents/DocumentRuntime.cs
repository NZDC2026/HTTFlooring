using System.Buffers.Binary;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Htt.SharedKernel;

namespace Htt.Infrastructure.Documents;

public sealed class DocumentOptions
{
    public string PythonExecutable {get;set;}="python3";
    public string? FontPath {get;set;}
    public string? MailApiKey {get;set;}
    public string? MailFrom {get;set;}
    public string? ClamAvHost {get;set;}
    public int ClamAvPort {get;set;}=3310;
}
public enum WorkFailure { Retry, Permanent, Unknown }
public sealed class DocumentWorkException(string code,WorkFailure failure):Exception(code)
{public string Code {get;}=code;public WorkFailure Failure {get;}=failure;}
public interface IPdfRenderer { Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct); }
public interface IFileScanner { Task<bool> IsCleanAsync(byte[] bytes,CancellationToken ct); }
public interface IDocumentMailer { Task<string> SendAsync(Guid jobId,JsonElement message,CancellationToken ct); }

public static class FileRules
{
    public const int MaxBytes=10*1024*1024;
    public static string Filename(string? input)
    {
        var name=input?.Trim()??"";
        if(name.Length is <1 or >180 || name.StartsWith('.') || name.Any(c=>char.IsControl(c)||c is '/' or '\\' or ':' or '"'))
            throw new BusinessException("invalid_filename","Use a filename without paths or control characters (max 180).",422);
        return name;
    }
    public static void Validate(byte[] body,string type,string filename)
    {
        if(body.Length is <1 or >MaxBytes)throw new BusinessException("invalid_file_size","File size must be 1 byte..10 MiB.",422);
        var ext=Path.GetExtension(filename).ToLowerInvariant();
        var valid=type switch
        {
            "application/pdf"=>ext==".pdf" && body.AsSpan().StartsWith("%PDF-"u8) && body.AsSpan(Math.Max(0,body.Length-1024)).IndexOf("%%EOF"u8)>=0,
            "image/png"=>ext==".png" && body.AsSpan().StartsWith(new byte[]{137,80,78,71,13,10,26,10}),
            "image/jpeg"=>ext is ".jpg" or ".jpeg" && body.Length>=4 && body[0]==255 && body[1]==216 && body[^2]==255 && body[^1]==217,
            _=>false
        };
        if(!valid)throw new BusinessException("unsupported_file","Upload a PDF, PNG or JPEG with matching filename, MIME and file signature.",422);
    }
}

public sealed class ReportLabPdfRenderer(DocumentOptions options):IPdfRenderer
{
    public async Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct)
    {
        using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(40));
        var info=new ProcessStartInfo(options.PythonExecutable){RedirectStandardInput=true,RedirectStandardOutput=true,RedirectStandardError=true,UseShellExecute=false,CreateNoWindow=true};
        info.ArgumentList.Add(Path.Combine(AppContext.BaseDirectory,"Documents","render_pdf.py"));
        if(!string.IsNullOrWhiteSpace(options.FontPath))info.Environment["HTT_PDF_FONT"]=options.FontPath;
        using var process=new Process{StartInfo=info};
        try
        {
            if(!process.Start())throw new DocumentWorkException("pdf_runtime_unavailable",WorkFailure.Permanent);
            // No shell, URL loading or user-supplied process arguments. Input is bounded document JSON.
            using var output=new MemoryStream();
            var read=ReadBounded(process.StandardOutput.BaseStream,output,FileRules.MaxBytes,timeout.Token);
            var errors=ReadBounded(process.StandardError.BaseStream,new MemoryStream(),4096,timeout.Token);
            await process.StandardInput.WriteAsync(snapshot.GetRawText().AsMemory(),timeout.Token);process.StandardInput.Close();
            await Task.WhenAll(read,errors,process.WaitForExitAsync(timeout.Token));
            if(process.ExitCode!=0)throw new DocumentWorkException("pdf_render_failed",WorkFailure.Permanent);
            var bytes=output.ToArray();if(!bytes.AsSpan().StartsWith("%PDF-"u8))throw new DocumentWorkException("pdf_invalid_output",WorkFailure.Permanent);
            return bytes;
        }
        catch(OperationCanceledException) when(!ct.IsCancellationRequested){throw new DocumentWorkException("pdf_timeout",WorkFailure.Retry);}
        catch(System.ComponentModel.Win32Exception){throw new DocumentWorkException("pdf_runtime_unavailable",WorkFailure.Permanent);}
        finally {try{if(process.Id>0 && !process.HasExited)process.Kill(true);}catch(InvalidOperationException){} }
    }
    private static async Task ReadBounded(Stream input,Stream output,int limit,CancellationToken ct)
    {
        var buffer=new byte[8192];int read;while((read=await input.ReadAsync(buffer,ct))>0)
        {if(output.Length+read>limit)throw new DocumentWorkException("pdf_output_limit",WorkFailure.Permanent);await output.WriteAsync(buffer.AsMemory(0,read),ct);}
    }
}

public sealed class ClamAvFileScanner(DocumentOptions options):IFileScanner
{
    public async Task<bool> IsCleanAsync(byte[] bytes,CancellationToken ct)
    {
        if(string.IsNullOrWhiteSpace(options.ClamAvHost))throw new DocumentWorkException("scanner_unconfigured",WorkFailure.Permanent);
        using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(30));
        try
        {
            using var client=new TcpClient();await client.ConnectAsync(options.ClamAvHost,options.ClamAvPort,timeout.Token);await using var stream=client.GetStream();
            await stream.WriteAsync("zINSTREAM\0"u8.ToArray(),timeout.Token);var header=new byte[4];
            for(var offset=0;offset<bytes.Length;offset+=8192)
            {var size=Math.Min(8192,bytes.Length-offset);BinaryPrimitives.WriteInt32BigEndian(header,size);await stream.WriteAsync(header,timeout.Token);await stream.WriteAsync(bytes.AsMemory(offset,size),timeout.Token);}
            await stream.WriteAsync(new byte[4],timeout.Token);var reply=new List<byte>();var single=new byte[1];
            while(reply.Count<1024 && await stream.ReadAsync(single,timeout.Token)>0 && single[0]!=0)reply.Add(single[0]);
            var result=Encoding.UTF8.GetString(reply.ToArray());if(result=="stream: OK")return true;if(result.StartsWith("stream: ",StringComparison.Ordinal) && result.EndsWith(" FOUND",StringComparison.Ordinal))return false;
            throw new DocumentWorkException("scanner_error",WorkFailure.Retry);
        }
        catch(Exception e) when(e is SocketException or IOException || e is OperationCanceledException && !ct.IsCancellationRequested)
        {throw new DocumentWorkException("scanner_unavailable",WorkFailure.Retry);}
    }
}

public sealed class ResendDocumentMailer(DocumentOptions options,HttpClient client):IDocumentMailer
{
    public async Task<string> SendAsync(Guid jobId,JsonElement message,CancellationToken ct)
    {
        if(string.IsNullOrWhiteSpace(options.MailApiKey))throw new DocumentWorkException("mail_unconfigured",WorkFailure.Permanent);
        using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(30));
        using var request=new HttpRequestMessage(HttpMethod.Post,"https://api.resend.com/emails");
        request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",options.MailApiKey);
        request.Headers.Add("Idempotency-Key",$"htt-document/{jobId:N}");
        request.Content=new StringContent(message.GetRawText(),Encoding.UTF8,"application/json");
        try
        {
            using var response=await client.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,timeout.Token);
            if(response.StatusCode==HttpStatusCode.TooManyRequests || (int)response.StatusCode>=500)throw new DocumentWorkException("mail_provider_temporary",WorkFailure.Retry);
            if(response.StatusCode==HttpStatusCode.Conflict)throw new DocumentWorkException("mail_idempotency_conflict",WorkFailure.Unknown);
            if(!response.IsSuccessStatusCode)throw new DocumentWorkException("mail_provider_rejected",WorkFailure.Permanent);
            // 2xx means provider acceptance, not delivery to the recipient's inbox.
            await using var stream=await response.Content.ReadAsStreamAsync(timeout.Token);using var body=new MemoryStream();var buffer=new byte[4096];int count;
            while((count=await stream.ReadAsync(buffer,timeout.Token))>0){if(body.Length+count>16384)throw new DocumentWorkException("mail_receipt_invalid",WorkFailure.Unknown);body.Write(buffer,0,count);}
            using var receipt=JsonDocument.Parse(body.ToArray());
            if(!receipt.RootElement.TryGetProperty("id",out var id) || id.ValueKind!=JsonValueKind.String || string.IsNullOrWhiteSpace(id.GetString()) || id.GetString()!.Length>200)
                throw new DocumentWorkException("mail_receipt_invalid",WorkFailure.Unknown);
            return id.GetString()!;
        }
        catch(Exception e) when(e is HttpRequestException or IOException or JsonException || e is OperationCanceledException && !ct.IsCancellationRequested)
        {throw new DocumentWorkException("mail_outcome_unknown",WorkFailure.Unknown);}
    }
}
