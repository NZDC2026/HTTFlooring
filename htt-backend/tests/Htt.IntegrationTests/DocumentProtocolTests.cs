using System.Buffers.Binary;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Htt.Infrastructure.Documents;
using Xunit;

namespace Htt.IntegrationTests;

public sealed class DocumentProtocolTests
{
    private sealed class Handler(Func<HttpRequestMessage,Task<HttpResponseMessage>> send):HttpMessageHandler
    {protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>send(request);}
    private static JsonElement Message()=>JsonSerializer.SerializeToElement(new{from="documents@htt-test.invalid",to=new[]{"customer@htt-test.invalid"},subject="Document",text="Attached",attachments=new[]{new{filename="Q-v2.pdf",content=Convert.ToBase64String("%PDF-test"u8)}}});
    [Fact]
    public async Task Resend_adapter_uses_stable_idempotency_payload_and_provider_receipt()
    {
        var keys=new List<string>();var payloads=new List<string>();var calls=0;
        using var client=new HttpClient(new Handler(async r=>
        {Assert.Equal("https://api.resend.com/emails",r.RequestUri!.ToString());Assert.Equal("Bearer",r.Headers.Authorization!.Scheme);keys.Add(r.Headers.GetValues("Idempotency-Key").Single());payloads.Add(await r.Content!.ReadAsStringAsync());return new(++calls==1?HttpStatusCode.ServiceUnavailable:HttpStatusCode.OK){Content=new StringContent("{\"id\":\"provider-accepted\"}")};}));
        var mailer=new ResendDocumentMailer(new(){MailApiKey="test-key-not-a-live-key"},client);var id=Guid.NewGuid();
        var error=await Assert.ThrowsAsync<DocumentWorkException>(()=>mailer.SendAsync(id,Message(),default));Assert.Equal(WorkFailure.Retry,error.Failure);
        Assert.Equal("provider-accepted",await mailer.SendAsync(id,Message(),default));Assert.Equal(keys[0],keys[1]);Assert.Equal(payloads[0],payloads[1]);Assert.Contains(id.ToString("N"),keys[0]);
        using var json=JsonDocument.Parse(payloads[0]);Assert.Equal("%PDF-test",Encoding.UTF8.GetString(Convert.FromBase64String(json.RootElement.GetProperty("attachments")[0].GetProperty("content").GetString()!)));
    }
    [Theory]
    [InlineData(429,WorkFailure.Retry)]
    [InlineData(503,WorkFailure.Retry)]
    [InlineData(400,WorkFailure.Permanent)]
    [InlineData(401,WorkFailure.Permanent)]
    [InlineData(409,WorkFailure.Unknown)]
    public async Task Provider_errors_are_classified_without_persisting_response_secrets(int status,WorkFailure expected)
    {
        using var client=new HttpClient(new Handler(_=>Task.FromResult(new HttpResponseMessage((HttpStatusCode)status){Content=new StringContent("private diagnostic should not enter job error")})));
        var mailer=new ResendDocumentMailer(new(){MailApiKey="test-key"},client);var e=await Assert.ThrowsAsync<DocumentWorkException>(()=>mailer.SendAsync(Guid.NewGuid(),Message(),default));Assert.Equal(expected,e.Failure);Assert.DoesNotContain("private",e.Message);
    }
    [Theory]
    [InlineData("not-json")]
    [InlineData("{}")]
    [InlineData("{\"id\":null}")]
    public async Task Successful_response_without_valid_receipt_is_unknown_not_safely_retryable(string body)
    {
        using var client=new HttpClient(new Handler(_=>Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(body)})));
        var mailer=new ResendDocumentMailer(new(){MailApiKey="test-key"},client);var e=await Assert.ThrowsAsync<DocumentWorkException>(()=>mailer.SendAsync(Guid.NewGuid(),Message(),default));Assert.Equal(WorkFailure.Unknown,e.Failure);
    }
    [Fact]
    public async Task Lost_transport_acknowledgement_is_unknown()
    {
        using var client=new HttpClient(new Handler(_=>throw new HttpRequestException("Connection reset after upload")));
        var e=await Assert.ThrowsAsync<DocumentWorkException>(()=>new ResendDocumentMailer(new(){MailApiKey="test-key"},client).SendAsync(Guid.NewGuid(),Message(),default));Assert.Equal(WorkFailure.Unknown,e.Failure);
    }
    [Theory]
    [InlineData("stream: OK\0",true)]
    [InlineData("stream: Eicar-Test-Signature FOUND\0",false)]
    public async Task Clamd_INSTREAM_protocol_transmits_exact_bytes_and_checks_scan_result(string reply,bool clean)
    {
        var listener=new TcpListener(IPAddress.Loopback,0);listener.Start();var port=((IPEndPoint)listener.LocalEndpoint).Port;
        using var timeout=new CancellationTokenSource(TimeSpan.FromSeconds(10));var body=Enumerable.Range(0,20000).Select(x=>(byte)(x%256)).ToArray();
        var server=Task.Run(async()=>
        {
            using var peer=await listener.AcceptTcpClientAsync(timeout.Token);await using var stream=peer.GetStream();var intro=new byte[10];await stream.ReadExactlyAsync(intro,timeout.Token);Assert.Equal("zINSTREAM\0",Encoding.ASCII.GetString(intro));using var received=new MemoryStream();var length=new byte[4];
            while(true){await stream.ReadExactlyAsync(length,timeout.Token);var count=BinaryPrimitives.ReadInt32BigEndian(length);if(count==0)break;Assert.InRange(count,1,8192);var chunk=new byte[count];await stream.ReadExactlyAsync(chunk,timeout.Token);received.Write(chunk);}
            Assert.Equal(body,received.ToArray());await stream.WriteAsync(Encoding.ASCII.GetBytes(reply),timeout.Token);
        },timeout.Token);
        try{var scanner=new ClamAvFileScanner(new(){ClamAvHost="127.0.0.1",ClamAvPort=port});Assert.Equal(clean,await scanner.IsCleanAsync(body,timeout.Token));await server;}
        finally{listener.Stop();}
    }
    [Fact]
    public async Task Unavailable_scanner_is_retryable_and_unconfigured_scanner_is_not_silently_clean()
    {
        var listener=new TcpListener(IPAddress.Loopback,0);listener.Start();var port=((IPEndPoint)listener.LocalEndpoint).Port;listener.Stop();
        var error=await Assert.ThrowsAsync<DocumentWorkException>(()=>new ClamAvFileScanner(new(){ClamAvHost="127.0.0.1",ClamAvPort=port}).IsCleanAsync([1],default));Assert.Equal(WorkFailure.Retry,error.Failure);
        error=await Assert.ThrowsAsync<DocumentWorkException>(()=>new ClamAvFileScanner(new()).IsCleanAsync([1],default));Assert.Equal("scanner_unconfigured",error.Code);
    }
}
