using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Npgsql;
using NpgsqlTypes;
namespace Htt.Infrastructure.Documents;
public sealed class PushOptions
{
 public string? ProjectId{get;set;}
 public string? ClientEmail{get;set;}
 public string? PrivateKeyPem{get;set;}
}
public sealed record PushWorkResult(string State,string? Error=null,string? ProviderId=null,int RetryAfterSeconds=0);
public interface IPushSender{Task<PushWorkResult> SendAsync(JsonElement work,CancellationToken ct);}
// FCM HTTP v1. Credentials stay on the worker; notification text intentionally carries no business content.
public sealed class FirebasePushSender(PushOptions options,HttpClient client):IPushSender
{
 private readonly SemaphoreSlim tokenGate=new(1,1);private string? accessToken;private DateTimeOffset expires;
 private static string Base64(byte[] bytes)=>Convert.ToBase64String(bytes).TrimEnd('=').Replace('+','-').Replace('/','_');
 private static async Task<JsonDocument> Read(HttpResponseMessage response,CancellationToken ct)
 {await using var stream=await response.Content.ReadAsStreamAsync(ct);using var buffer=new MemoryStream();var bytes=new byte[4096];int n;while((n=await stream.ReadAsync(bytes,ct))>0){if(buffer.Length+n>65536)throw new JsonException("Provider output too large.");await buffer.WriteAsync(bytes.AsMemory(0,n),ct);}return JsonDocument.Parse(buffer.ToArray());}
 private async Task<string> Token(CancellationToken ct)
 {
  await tokenGate.WaitAsync(ct);try{if(accessToken is not null&&expires>DateTimeOffset.UtcNow.AddMinutes(2))return accessToken;
   using var rsa=RSA.Create();try{rsa.ImportFromPem(options.PrivateKeyPem!);}catch(ArgumentException){throw new DocumentWorkException("push_credentials_invalid",WorkFailure.Permanent);}var now=DateTimeOffset.UtcNow;
   var header=Base64(Encoding.UTF8.GetBytes("{\"alg\":\"RS256\",\"typ\":\"JWT\"}"));var claims=Base64(JsonSerializer.SerializeToUtf8Bytes(new{iss=options.ClientEmail,scope="https://www.googleapis.com/auth/firebase.messaging",aud="https://oauth2.googleapis.com/token",iat=now.ToUnixTimeSeconds(),exp=now.AddHours(1).ToUnixTimeSeconds()}));var unsigned=header+"."+claims;var assertion=unsigned+"."+Base64(rsa.SignData(Encoding.ASCII.GetBytes(unsigned),HashAlgorithmName.SHA256,RSASignaturePadding.Pkcs1));
   using var request=new HttpRequestMessage(HttpMethod.Post,"https://oauth2.googleapis.com/token"){Content=new FormUrlEncodedContent(new Dictionary<string,string>{{"grant_type","urn:ietf:params:oauth:grant-type:jwt-bearer"},{"assertion",assertion}})};using var response=await client.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
   if(response.StatusCode==HttpStatusCode.TooManyRequests||(int)response.StatusCode>=500)throw new DocumentWorkException("push_oauth_unavailable",WorkFailure.Retry);if(!response.IsSuccessStatusCode)throw new DocumentWorkException("push_credentials_rejected",WorkFailure.Permanent);
   using var result=await Read(response,ct);var value=result.RootElement.GetProperty("access_token").GetString();var seconds=result.RootElement.GetProperty("expires_in").GetInt32();if(string.IsNullOrEmpty(value)||value.Length>16384||seconds is<60 or>3600)throw new JsonException();accessToken=value;expires=now.AddSeconds(seconds);return value;
  }finally{tokenGate.Release();}
 }
 public async Task<PushWorkResult> SendAsync(JsonElement work,CancellationToken ct)
 {
  if(string.IsNullOrWhiteSpace(options.ProjectId)||!options.ProjectId.All(x=>char.IsAsciiLetterOrDigit(x)||x=='-')||string.IsNullOrWhiteSpace(options.ClientEmail)||string.IsNullOrWhiteSpace(options.PrivateKeyPem))return new("FAILED","push_unconfigured");
  using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(25));string bearer;
  try{bearer=await Token(timeout.Token);}catch(DocumentWorkException e){return new(e.Failure==WorkFailure.Retry?"RETRY":"FAILED",e.Code);}catch(Exception e)when(e is OperationCanceledException or HttpRequestException){return new("RETRY","push_oauth_unavailable");}catch(Exception e)when(e is JsonException or KeyNotFoundException or InvalidOperationException or CryptographicException){return new("FAILED","push_credentials_invalid");}
  var messageId=work.GetProperty("messageId").GetString()!;var payload=new{message=new{token=work.GetProperty("token").GetString(),notification=new{title="HTT update",body="Open HTT to view your update."},data=new Dictionary<string,string>{{"messageId",messageId},{"companyId",work.GetProperty("companyId").GetString()!},{"sourceType",work.GetProperty("sourceType").GetString()!},{"sourceId",work.GetProperty("sourceId").GetString()!}},android=new{collapse_key="htt-updates",ttl="3600s"},apns=new{headers=new Dictionary<string,string>{{"apns-collapse-id","htt-updates"},{"apns-expiration",DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture)}}},webpush=new{headers=new Dictionary<string,string>{{"TTL","3600"}},notification=new{tag="htt-updates"}}}};
  using var request=new HttpRequestMessage(HttpMethod.Post,"https://fcm.googleapis.com/v1/projects/"+options.ProjectId+"/messages:send"){Content=new StringContent(JsonSerializer.Serialize(payload),Encoding.UTF8,"application/json")};request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",bearer);
  try{using var response=await client.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,timeout.Token);if(response.StatusCode==HttpStatusCode.TooManyRequests||(int)response.StatusCode>=500)return new("RETRY","push_provider_unavailable",RetryAfterSeconds:(int)Math.Clamp((response.Headers.RetryAfter?.Delta??(response.Headers.RetryAfter?.Date-DateTimeOffset.UtcNow)??TimeSpan.Zero).TotalSeconds,0,86400));
   using var result=await Read(response,timeout.Token);if(response.IsSuccessStatusCode){var name=result.RootElement.GetProperty("name").GetString();return string.IsNullOrWhiteSpace(name)||name.Length>500?new("UNKNOWN","push_receipt_invalid"):new("SUCCEEDED",ProviderId:name);}
   if(result.RootElement.TryGetProperty("error",out var error)&&error.TryGetProperty("details",out var details)&&details.ValueKind==JsonValueKind.Array&&details.EnumerateArray().Any(x=>x.TryGetProperty("errorCode",out var code)&&code.GetString()=="UNREGISTERED"))return new("FAILED","push_token_unregistered");
   if(response.StatusCode==HttpStatusCode.Unauthorized){accessToken=null;return new("RETRY","push_authorization_expired");}return new("FAILED","push_provider_rejected");
  }catch(Exception e)when(e is HttpRequestException or OperationCanceledException){return new("UNKNOWN","push_delivery_uncertain");}catch(Exception e)when(e is JsonException or KeyNotFoundException or InvalidOperationException){return new("UNKNOWN","push_receipt_invalid");}
 }
}
public sealed class PushWorker(NpgsqlDataSource source,IPushSender sender)
{
 public async Task<bool> ProcessOneAsync(CancellationToken ct=default)
 {
  Guid id,lease;await using(var con=await source.OpenConnectionAsync(ct))await using(var cmd=new NpgsqlCommand("SELECT job_id,lease FROM crm.claim_push()",con))await using(var rd=await cmd.ExecuteReaderAsync(ct)){if(!await rd.ReadAsync(ct))return false;id=rd.GetGuid(0);lease=rd.GetGuid(1);}
  PushWorkResult result;bool sending=false;
  try{await using var con=await source.OpenConnectionAsync(ct);await using var cmd=new NpgsqlCommand("SELECT crm.load_push(@id,@lease)::text",con);cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("lease",lease);using var work=JsonDocument.Parse((string)(await cmd.ExecuteScalarAsync(ct))!);sending=true;result=await sender.SendAsync(work.RootElement,ct);}
  catch(PostgresException e)when(e.SqlState is"42501"or"HT404"){result=new("CANCELLED","push_access_changed");}
  catch(Exception e)when(e is not OutOfMemoryException){result=new(sending?"UNKNOWN":"RETRY",sending?"push_delivery_uncertain":"push_worker_unavailable");}
  using var timeout=new CancellationTokenSource(TimeSpan.FromSeconds(10));await using var finish=await source.OpenConnectionAsync(timeout.Token);await using var done=new NpgsqlCommand("SELECT crm.finish_push(@id,@lease,@state,@error,@provider,@retry)",finish);done.Parameters.AddWithValue("id",id);done.Parameters.AddWithValue("lease",lease);done.Parameters.AddWithValue("state",result.State);done.Parameters.AddWithValue("error",NpgsqlDbType.Text,(object?)result.Error??DBNull.Value);done.Parameters.AddWithValue("provider",NpgsqlDbType.Text,(object?)result.ProviderId??DBNull.Value);done.Parameters.AddWithValue("retry",result.RetryAfterSeconds);await done.ExecuteScalarAsync(timeout.Token);return true;
 }
 public async Task<int> DeliverRemindersAsync(CancellationToken ct=default)
 {await using var con=await source.OpenConnectionAsync(ct);await using var cmd=new NpgsqlCommand("SELECT crm.deliver_due_reminders(50)",con){CommandTimeout=30};return(int)(await cmd.ExecuteScalarAsync(ct))!;}
}
