using System.Net;
using System.Text;
using System.Text.Json;
using Htt.Infrastructure.BankFeeds;
using Xunit;
namespace Htt.IntegrationTests;
public sealed class BankFeedProtocolTests
{
 sealed class Handler(Func<HttpRequestMessage,CancellationToken,Task<HttpResponseMessage>> f):HttpMessageHandler
 {protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>f(request,ct);}
 static JsonElement Request(string kind)=>JsonSerializer.SerializeToElement(new{operationId=Guid.Parse("40000000-0000-0000-0000-000000000001"),kind,grantReference="opaque-sandbox-grant",environment="SANDBOX"});
 static BankFeedOptions Options(string endpoint="https://feed-gateway.invalid/v1/execute")=>new(){Enabled=true,Endpoint=endpoint,ApiKey="sandbox-test-only"};
 [Fact]public async Task Gateway_uses_only_fixed_endpoint_and_stable_operation_key_with_bounded_json_contract()
 {
  using var client=new HttpClient(new Handler(async(r,ct)=>{Assert.Equal(HttpMethod.Post,r.Method);Assert.Equal("https://feed-gateway.invalid/v1/execute",r.RequestUri!.AbsoluteUri);Assert.Equal("Bearer",r.Headers.Authorization!.Scheme);Assert.Equal("sandbox-test-only",r.Headers.Authorization.Parameter);Assert.Equal("40000000-0000-0000-0000-000000000001",r.Headers.GetValues("Idempotency-Key").Single());Assert.Equal("1",r.Headers.GetValues("X-HTT-Gateway-Version").Single());Assert.Contains("opaque-sandbox-grant",await r.Content!.ReadAsStringAsync(ct));return new(HttpStatusCode.OK){Content=new StringContent("{\"environment\":\"SANDBOX\",\"revoked\":true}")};}));
  Assert.True((await new HttpBankFeedGateway(Options(),client).ExecuteAsync(Request("REVOKE"),default)).GetProperty("revoked").GetBoolean());
 }
 [Theory][InlineData("http://gateway.invalid/path")][InlineData("https://user:pass@gateway.invalid/path")][InlineData("https://gateway.invalid/path?secret=1")][InlineData("https://gateway.invalid/path#fragment")][InlineData("not-url")]
 public async Task Invalid_gateway_configuration_never_sends_credentials(string endpoint)
 {
  using var client=new HttpClient(new Handler((_,_)=>throw new InvalidOperationException("Must not send")));var e=await Assert.ThrowsAsync<BankFeedException>(()=>new HttpBankFeedGateway(Options(endpoint),client).ExecuteAsync(Request("VERIFY"),default));Assert.Equal(FeedFailure.Failed,e.Failure);Assert.Equal("feed_gateway_unconfigured",e.Code);
 }
 [Theory][InlineData("VERIFY",429,FeedFailure.Retry)][InlineData("SYNC",503,FeedFailure.Retry)][InlineData("REVOKE",503,FeedFailure.Unknown)][InlineData("REVOKE",429,FeedFailure.Retry)][InlineData("VERIFY",401,FeedFailure.Failed)][InlineData("SYNC",403,FeedFailure.Failed)][InlineData("REVOKE",302,FeedFailure.Unknown)]
 public async Task Status_failures_do_not_expose_provider_body_and_revoke_uncertainty_is_distinct(string kind,int status,FeedFailure expected)
 {
  using var client=new HttpClient(new Handler((_,_)=>Task.FromResult(new HttpResponseMessage((HttpStatusCode)status){Content=new StringContent("private provider credentials")})));
  var e=await Assert.ThrowsAsync<BankFeedException>(()=>new HttpBankFeedGateway(Options(),client).ExecuteAsync(Request(kind),default));Assert.Equal(expected,e.Failure);Assert.DoesNotContain("private",e.Message);
 }
 [Theory][InlineData("VERIFY",FeedFailure.Retry)][InlineData("SYNC",FeedFailure.Retry)][InlineData("REVOKE",FeedFailure.Unknown)]
 public async Task Network_failure_is_safe_to_retry_only_for_read_operations(string kind,FeedFailure expected)
 {using var client=new HttpClient(new Handler((_,_)=>throw new HttpRequestException("secret network error")));var e=await Assert.ThrowsAsync<BankFeedException>(()=>new HttpBankFeedGateway(Options(),client).ExecuteAsync(Request(kind),default));Assert.Equal(expected,e.Failure);Assert.DoesNotContain("secret",e.Message);}
 [Theory][InlineData("VERIFY",FeedFailure.Failed)][InlineData("REVOKE",FeedFailure.Unknown)]
 public async Task Malformed_and_oversized_results_are_bounded(string kind,FeedFailure expected)
 {
  foreach(var text in new[]{"not-json","[]",new string('x',2097153)}){using var client=new HttpClient(new Handler((_,_)=>Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(text,Encoding.UTF8,"application/json")})));var e=await Assert.ThrowsAsync<BankFeedException>(()=>new HttpBankFeedGateway(Options(),client).ExecuteAsync(Request(kind),default));Assert.Equal(expected,e.Failure);}
 }
 [Fact]public async Task Default_disabled_runtime_makes_no_external_request()
 {using var client=new HttpClient(new Handler((_,_)=>throw new InvalidOperationException("Must not send")));var e=await Assert.ThrowsAsync<BankFeedException>(()=>new HttpBankFeedGateway(new(),client).ExecuteAsync(Request("VERIFY"),default));Assert.Equal("feed_gateway_unconfigured",e.Code);}
}
