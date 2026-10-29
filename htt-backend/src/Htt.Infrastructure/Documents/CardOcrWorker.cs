using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;
using NpgsqlTypes;
namespace Htt.Infrastructure.Documents;
public interface ICardRecognizer {Task<JsonElement> RecognizeAsync(Guid operation,byte[] image,string type,CancellationToken ct);}
public sealed class CardOcrOptions{public string? Endpoint{get;set;}public string? ApiKey{get;set;}}
// Configured HTTPS OCR gateway; never accepts user URLs and never follows redirects.
public sealed class GatewayCardRecognizer(CardOcrOptions options,HttpClient client):ICardRecognizer
{
 public async Task<JsonElement> RecognizeAsync(Guid operation,byte[] image,string type,CancellationToken ct)
 {
  if(!Uri.TryCreate(options.Endpoint,UriKind.Absolute,out var endpoint)||endpoint.Scheme!="https"||!string.IsNullOrEmpty(endpoint.UserInfo)||string.IsNullOrWhiteSpace(options.ApiKey))throw new DocumentWorkException("card_ocr_unconfigured",WorkFailure.Permanent);
  using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(30));
  try{using var request=new HttpRequestMessage(HttpMethod.Post,endpoint){Content=JsonContent.Create(new{operationId=operation,contentType=type,content=Convert.ToBase64String(image)})};request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",options.ApiKey);using var response=await client.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,timeout.Token);if(response.StatusCode==HttpStatusCode.TooManyRequests||(int)response.StatusCode>=500)throw new DocumentWorkException("card_ocr_transient",WorkFailure.Retry);if(!response.IsSuccessStatusCode)throw new DocumentWorkException("card_ocr_rejected",WorkFailure.Permanent);await using var stream=await response.Content.ReadAsStreamAsync(timeout.Token);using var data=new MemoryStream();var buffer=new byte[4096];int n;while((n=await stream.ReadAsync(buffer,timeout.Token))>0){if(data.Length+n>16000)throw new DocumentWorkException("card_ocr_output_limit",WorkFailure.Permanent);await data.WriteAsync(buffer.AsMemory(0,n),timeout.Token);}using var parsed=JsonDocument.Parse(data.ToArray());var root=parsed.RootElement;var name=root.TryGetProperty("name",out var nm)&&nm.ValueKind==JsonValueKind.String?nm.GetString()?.Trim():null;if(string.IsNullOrEmpty(name)||name.Length>200)throw new DocumentWorkException("card_ocr_invalid_output",WorkFailure.Permanent);
   string? Field(string key,int max){if(!root.TryGetProperty(key,out var v)||v.ValueKind==JsonValueKind.Null)return null;if(v.ValueKind!=JsonValueKind.String||v.GetString()!.Length>max)throw new DocumentWorkException("card_ocr_invalid_output",WorkFailure.Permanent);return v.GetString();}
   return JsonSerializer.SerializeToElement(new{name,email=Field("email",254),phone=Field("phone",40),mobile=Field("mobile",40),jobTitle=Field("jobTitle",100),organization=Field("organization",200),storeName=Field("storeName",200),branchIds=Array.Empty<Guid>()});
  }catch(OperationCanceledException)when(!ct.IsCancellationRequested){throw new DocumentWorkException("card_ocr_timeout",WorkFailure.Retry);}catch(HttpRequestException){throw new DocumentWorkException("card_ocr_unavailable",WorkFailure.Retry);}catch(JsonException){throw new DocumentWorkException("card_ocr_invalid_output",WorkFailure.Permanent);}
 }
}
public sealed class CardOcrWorker(NpgsqlDataSource source,IFileScanner scanner,ICardRecognizer recognizer)
{
 public async Task<bool> ProcessOneAsync(CancellationToken ct=default)
 {
  Guid id,lease;await using(var con=await source.OpenConnectionAsync(ct))await using(var cmd=new NpgsqlCommand("SELECT job_id,lease FROM crm.claim_card()",con))await using(var rd=await cmd.ExecuteReaderAsync(ct)){if(!await rd.ReadAsync(ct))return false;id=rd.GetGuid(0);lease=rd.GetGuid(1);}
  string state="SUCCEEDED";string? error=null;JsonElement? suggestion=null;
  try{await using var con=await source.OpenConnectionAsync(ct);await using var cmd=new NpgsqlCommand("SELECT crm.load_card(@id,@lease)::text",con);cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("lease",lease);using var payload=JsonDocument.Parse((string)(await cmd.ExecuteScalarAsync(ct))!);var bytes=Convert.FromBase64String(payload.RootElement.GetProperty("content").GetString()!);if(!await scanner.IsCleanAsync(bytes,ct)){state="REJECTED";error="malware_detected";}else suggestion=await recognizer.RecognizeAsync(id,bytes,payload.RootElement.GetProperty("contentType").GetString()!,ct);
  }catch(DocumentWorkException e){state=e.Failure==WorkFailure.Retry?"RETRY":"FAILED";error=e.Code;}catch(PostgresException e)when(e.SqlState=="42501"){state="FAILED";error="card_access_changed";}catch(Exception e)when(e is not OutOfMemoryException){state="RETRY";error="card_worker_unavailable";}
  using var finishTimeout=new CancellationTokenSource(TimeSpan.FromSeconds(10));await using var finish=await source.OpenConnectionAsync(finishTimeout.Token);await using var done=new NpgsqlCommand("SELECT crm.finish_card(@id,@lease,@state,@error,@suggestion)",finish);done.Parameters.AddWithValue("id",id);done.Parameters.AddWithValue("lease",lease);done.Parameters.AddWithValue("state",state);done.Parameters.AddWithValue("error",NpgsqlDbType.Text,(object?)error??DBNull.Value);done.Parameters.AddWithValue("suggestion",NpgsqlDbType.Jsonb,suggestion?.GetRawText()??(object)DBNull.Value);
  try{await done.ExecuteScalarAsync(finishTimeout.Token);}catch(PostgresException e)when(e.SqlState is "HR422" or "23514"){done.Parameters["state"].Value="FAILED";done.Parameters["error"].Value="card_ocr_invalid_output";done.Parameters["suggestion"].Value=DBNull.Value;await done.ExecuteScalarAsync(finishTimeout.Token);}return true;
 }
}
