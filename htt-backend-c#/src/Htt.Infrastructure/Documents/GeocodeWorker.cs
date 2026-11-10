using System.Net;
using System.Text.Json;
using Npgsql;
using NpgsqlTypes;
namespace Htt.Infrastructure.Documents;
public sealed class GeocodeOptions{public string? ApiKey{get;set;}}
public interface IBranchGeocoder{Task<JsonElement> LocateAsync(JsonElement address,CancellationToken ct);}
public sealed class GoogleBranchGeocoder(GeocodeOptions options,HttpClient client):IBranchGeocoder
{
 public async Task<JsonElement> LocateAsync(JsonElement address,CancellationToken ct)
 {
  if(string.IsNullOrWhiteSpace(options.ApiKey))throw new DocumentWorkException("geocoder_unconfigured",WorkFailure.Permanent);
  var country=address.GetProperty("country").GetString()!;if(country.Length!=2||!country.All(char.IsAsciiLetter))throw new DocumentWorkException("geocode_invalid_address",WorkFailure.Permanent);
  var uri="https://maps.googleapis.com/maps/api/geocode/json?address="+Uri.EscapeDataString(address.GetProperty("address").GetString()!)+"&components="+Uri.EscapeDataString("country:"+country)+"&key="+Uri.EscapeDataString(options.ApiKey);
  using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(20));
  try{using var response=await client.GetAsync(uri,HttpCompletionOption.ResponseHeadersRead,timeout.Token);if(response.StatusCode==HttpStatusCode.TooManyRequests||(int)response.StatusCode>=500)throw new DocumentWorkException("geocode_transient",WorkFailure.Retry);if(!response.IsSuccessStatusCode)throw new DocumentWorkException("geocode_provider_rejected",WorkFailure.Permanent);
   await using var stream=await response.Content.ReadAsStreamAsync(timeout.Token);using var buffer=new MemoryStream();var bytes=new byte[4096];int n;while((n=await stream.ReadAsync(bytes,timeout.Token))>0){if(buffer.Length+n>65536)throw new DocumentWorkException("geocode_output_limit",WorkFailure.Permanent);await buffer.WriteAsync(bytes.AsMemory(0,n),timeout.Token);}using var json=JsonDocument.Parse(buffer.ToArray());var root=json.RootElement;var status=root.GetProperty("status").GetString();if(status is"OVER_QUERY_LIMIT"or"UNKNOWN_ERROR")throw new DocumentWorkException("geocode_transient",WorkFailure.Retry);if(status!="OK")throw new DocumentWorkException(status=="ZERO_RESULTS"?"geocode_no_result":"geocode_provider_rejected",WorkFailure.Permanent);var results=root.GetProperty("results");if(results.GetArrayLength()!=1)throw new DocumentWorkException("geocode_ambiguous",WorkFailure.Permanent);var r=results[0];if(r.TryGetProperty("partial_match",out var partial)&&partial.GetBoolean())throw new DocumentWorkException("geocode_partial_match",WorkFailure.Permanent);
   if(!r.GetProperty("address_components").EnumerateArray().Any(x=>x.GetProperty("types").EnumerateArray().Any(t=>t.GetString()=="country")&&string.Equals(x.GetProperty("short_name").GetString(),country,StringComparison.OrdinalIgnoreCase)))throw new DocumentWorkException("geocode_country_mismatch",WorkFailure.Permanent);
   var geom=r.GetProperty("geometry");var location=geom.GetProperty("location");var lat=location.GetProperty("lat").GetDecimal();var lng=location.GetProperty("lng").GetDecimal();var precision=geom.GetProperty("location_type").GetString();var place=r.GetProperty("place_id").GetString();if(lat is<-90 or>90||lng is<-180 or>180||precision is not("ROOFTOP"or"RANGE_INTERPOLATED"or"GEOMETRIC_CENTER"or"APPROXIMATE")||string.IsNullOrEmpty(place)||place.Length>300)throw new DocumentWorkException("geocode_invalid_output",WorkFailure.Permanent);
   return JsonSerializer.SerializeToElement(new{latitude=decimal.Round(lat,7),longitude=decimal.Round(lng,7),precision,placeId=place});
  }catch(OperationCanceledException)when(!ct.IsCancellationRequested){throw new DocumentWorkException("geocode_timeout",WorkFailure.Retry);}catch(HttpRequestException){throw new DocumentWorkException("geocode_unavailable",WorkFailure.Retry);}catch(Exception e)when(e is JsonException or KeyNotFoundException or InvalidOperationException or FormatException){throw new DocumentWorkException("geocode_invalid_output",WorkFailure.Permanent);}
 }
}
public sealed class GeocodeWorker(NpgsqlDataSource source,IBranchGeocoder geocoder)
{
 public async Task<bool> ProcessOneAsync(CancellationToken ct=default)
 {
  Guid id,lease;await using(var con=await source.OpenConnectionAsync(ct))await using(var cmd=new NpgsqlCommand("SELECT job_id,lease FROM crm.claim_geocode()",con))await using(var rd=await cmd.ExecuteReaderAsync(ct)){if(!await rd.ReadAsync(ct))return false;id=rd.GetGuid(0);lease=rd.GetGuid(1);}
  string state="SUCCEEDED";string? error=null;JsonElement? result=null;
  try{await using var con=await source.OpenConnectionAsync(ct);await using var cmd=new NpgsqlCommand("SELECT crm.load_geocode(@id,@lease)::text",con);cmd.Parameters.AddWithValue("id",id);cmd.Parameters.AddWithValue("lease",lease);using var address=JsonDocument.Parse((string)(await cmd.ExecuteScalarAsync(ct))!);result=await geocoder.LocateAsync(address.RootElement,ct);}
  catch(DocumentWorkException e){state=e.Failure==WorkFailure.Retry?"RETRY":"FAILED";error=e.Code;}catch(PostgresException e)when(e.SqlState is"42501"or"HT404"){state="FAILED";error="geocode_access_changed";}catch(PostgresException e)when(e.SqlState=="HR409"){state="STALE";error="address_changed";}catch(Exception e)when(e is not OutOfMemoryException){state="RETRY";error="geocode_worker_unavailable";}
  using var timeout=new CancellationTokenSource(TimeSpan.FromSeconds(10));await using var finish=await source.OpenConnectionAsync(timeout.Token);await using var done=new NpgsqlCommand("SELECT crm.finish_geocode(@id,@lease,@state,@error,@data)",finish);done.Parameters.AddWithValue("id",id);done.Parameters.AddWithValue("lease",lease);done.Parameters.AddWithValue("state",state);done.Parameters.AddWithValue("error",NpgsqlDbType.Text,(object?)error??DBNull.Value);done.Parameters.AddWithValue("data",NpgsqlDbType.Jsonb,(object?)result?.GetRawText()??DBNull.Value);
  try{await done.ExecuteScalarAsync(timeout.Token);}catch(PostgresException e)when(e.SqlState is"HR422"or"23514"){done.Parameters["state"].Value="FAILED";done.Parameters["error"].Value="geocode_invalid_output";done.Parameters["data"].Value=DBNull.Value;await done.ExecuteScalarAsync(timeout.Token);}return true;
 }
}
