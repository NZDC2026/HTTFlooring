using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Htt.Infrastructure.Documents;
using Xunit;
namespace Htt.IntegrationTests;
public sealed class PushAdapterTests
{
 private sealed class Handler(Func<HttpRequestMessage,CancellationToken,Task<HttpResponseMessage>> run):HttpMessageHandler{public int Calls;protected override Task<HttpResponseMessage>SendAsync(HttpRequestMessage x,CancellationToken ct){Calls++;return run(x,ct);}}
 private static JsonElement Work()=>JsonSerializer.SerializeToElement(new{token="test-token-12345678901234567890",messageId=Guid.NewGuid().ToString(),companyId=Guid.NewGuid().ToString(),sourceType="TASK",sourceId=Guid.NewGuid().ToString(),title="Must not leave server",description="Private information"});
 private static HttpResponseMessage Response(int status,string body)=>new((HttpStatusCode)status){Content=new StringContent(body,Encoding.UTF8,"application/json")};
 private static PushOptions Options(){using var rsa=RSA.Create(2048);return new(){ProjectId="htt-test",ClientEmail="test@htt-test.iam.gserviceaccount.com",PrivateKeyPem=rsa.ExportPkcs8PrivateKeyPem()};}
 [Fact]public async Task Unconfigured_push_is_explicit_failure_with_no_network_call()
 {var h=new Handler((_,_)=>throw new InvalidOperationException());using var c=new HttpClient(h);var r=await new FirebasePushSender(new(),c).SendAsync(Work(),default);Assert.Equal("FAILED",r.State);Assert.Equal("push_unconfigured",r.Error);Assert.Equal(0,h.Calls);}
 [Fact]public async Task Service_account_JWT_is_signed_and_cached_and_only_generic_notification_is_sent()
 {var options=Options();using var rsa=RSA.Create();rsa.ImportFromPem(options.PrivateKeyPem!);var tokens=0;var sends=0;var h=new Handler(async(x,ct)=>{var body=await x.Content!.ReadAsStringAsync(ct);if(x.RequestUri!.Host=="oauth2.googleapis.com"){tokens++;var form=Uri.UnescapeDataString(body);var jwt=form[(form.IndexOf("assertion=",StringComparison.Ordinal)+10)..].Split('.');var sig=jwt[2].Replace('-','+').Replace('_','/');sig=sig.PadRight((sig.Length+3)/4*4,'=');Assert.True(rsa.VerifyData(Encoding.ASCII.GetBytes(jwt[0]+"."+jwt[1]),Convert.FromBase64String(sig),HashAlgorithmName.SHA256,RSASignaturePadding.Pkcs1));return Response(200,"{\"access_token\":\"test-access\",\"expires_in\":3600}");}sends++;Assert.Equal("Bearer",x.Headers.Authorization!.Scheme);Assert.Equal("test-access",x.Headers.Authorization.Parameter);Assert.Equal("https://fcm.googleapis.com/v1/projects/htt-test/messages:send",x.RequestUri.AbsoluteUri);Assert.DoesNotContain("Private information",body);Assert.DoesNotContain("Must not leave server",body);using var doc=JsonDocument.Parse(body);Assert.Equal("HTT update",doc.RootElement.GetProperty("message").GetProperty("notification").GetProperty("title").GetString());return Response(200,"{\"name\":\"projects/htt-test/messages/1\"}");});using var client=new HttpClient(h);var sender=new FirebasePushSender(options,client);Assert.Equal("SUCCEEDED",(await sender.SendAsync(Work(),default)).State);Assert.Equal("SUCCEEDED",(await sender.SendAsync(Work(),default)).State);Assert.Equal(1,tokens);Assert.Equal(2,sends);}
 [Theory][InlineData(429,"{}","RETRY")][InlineData(503,"{}","RETRY")][InlineData(403,"{\"error\":{}}","FAILED")][InlineData(404,"{\"error\":{\"details\":[{\"errorCode\":\"UNREGISTERED\"}]}}","FAILED")][InlineData(200,"{}","UNKNOWN")][InlineData(200,"not-json","UNKNOWN")]
 public async Task Provider_results_distinguish_safe_retry_permanent_rejection_and_uncertain_receipt(int status,string body,string expected)
 {var h=new Handler((x,_)=>Task.FromResult(x.RequestUri!.Host=="oauth2.googleapis.com"?Response(200,"{\"access_token\":\"test\",\"expires_in\":3600}"):Response(status,body)));using var c=new HttpClient(h);var r=await new FirebasePushSender(Options(),c).SendAsync(Work(),default);Assert.Equal(expected,r.State);if(status==404)Assert.Equal("push_token_unregistered",r.Error);}
 [Theory][InlineData(true)][InlineData(false)]public async Task Network_failure_before_or_after_send_has_different_retry_safety(bool oauth)
 {var h=new Handler((x,_)=>{if(oauth||x.RequestUri!.Host=="fcm.googleapis.com")throw new HttpRequestException();return Task.FromResult(Response(200,"{\"access_token\":\"test\",\"expires_in\":3600}"));});using var c=new HttpClient(h);Assert.Equal(oauth?"RETRY":"UNKNOWN",(await new FirebasePushSender(Options(),c).SendAsync(Work(),default)).State);}
 [Theory][InlineData(400,"FAILED")][InlineData(503,"RETRY")]
 public async Task OAuth_failures_do_not_call_FCM(int status,string expected)
 {var h=new Handler((x,_)=>{Assert.Equal("oauth2.googleapis.com",x.RequestUri!.Host);return Task.FromResult(Response(status,"{}"));});using var c=new HttpClient(h);Assert.Equal(expected,(await new FirebasePushSender(Options(),c).SendAsync(Work(),default)).State);Assert.Equal(1,h.Calls);}

 [Fact]public async Task Provider_retry_after_is_preserved_for_durable_backoff()
 {var h=new Handler((x,_)=>{if(x.RequestUri!.Host=="oauth2.googleapis.com")return Task.FromResult(Response(200,"{\"access_token\":\"test\",\"expires_in\":3600}"));var r=Response(429,"{}");r.Headers.RetryAfter=new System.Net.Http.Headers.RetryConditionHeaderValue(TimeSpan.FromHours(1));return Task.FromResult(r);});using var c=new HttpClient(h);var result=await new FirebasePushSender(Options(),c).SendAsync(Work(),default);Assert.Equal("RETRY",result.State);Assert.Equal(3600,result.RetryAfterSeconds);}
}
