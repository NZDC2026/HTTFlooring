using System.Globalization;
using System.Text;
using System.Text.Json;
namespace Htt.Infrastructure.Documents;
public interface IReportExporter {Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct);}
public sealed class CsvReportExporter:IReportExporter
{
 public Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct)
 {
  try
  {
   var rows=snapshot.GetProperty("rows");var columns=snapshot.GetProperty("columns").EnumerateArray().ToArray();
   if(rows.GetArrayLength()>5000||columns.Length is<1 or>20)throw new FormatException();
   var text=new StringBuilder();
   static string Safe(string value){var start=new string(value.SkipWhile(c=>char.IsWhiteSpace(c)||c is '\uFEFF' or '\u200B' or '\u2060').ToArray());return start.Length>0&&("=+-@".Contains(start[0])||value[0] is '\t' or '\r' or '\n')?"'"+value:value;}
   static string Cell(string value)=>"\""+value.Replace("\"","\"\"")+"\"";
   void Row(IEnumerable<string> values){text.AppendJoin(',',values.Select(Cell));text.Append("\r\n");if(text.Length>FileRules.MaxBytes)throw new FormatException();}
   Row(["HTT REPORT",Safe(snapshot.GetProperty("kind").GetString()!)]);
   Row(["Snapshot SHA256",snapshot.GetProperty("snapshotHash").GetString()!]);
   var metadata=snapshot.EnumerateObject().Where(x=>x.Name is not("rows" or "columns" or "filename")).ToDictionary(x=>x.Name,x=>x.Value);
   Row(["Metadata",Safe(JsonSerializer.Serialize(metadata))]);Row([]);Row(columns.Select(x=>Safe(x.GetProperty("label").GetString()!)));
   foreach(var row in rows.EnumerateArray())
   {
    ct.ThrowIfCancellationRequested();Row(columns.Select(col=>{var key=col.GetProperty("key").GetString()!;if(!row.TryGetProperty(key,out var value)||value.ValueKind==JsonValueKind.Null)return "";var s=value.ValueKind==JsonValueKind.String?value.GetString()!:value.GetRawText();if(s.Any(x=>x=='\0'))throw new FormatException();if(col.GetProperty("type").GetString()=="decimal"){if(!decimal.TryParse(s,NumberStyles.AllowLeadingSign|NumberStyles.AllowDecimalPoint,CultureInfo.InvariantCulture,out var number))throw new FormatException();return number.ToString(CultureInfo.InvariantCulture);}return Safe(s);}));
   }
   var result=Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(text.ToString())).ToArray();if(result.Length>FileRules.MaxBytes)throw new FormatException();return Task.FromResult(result);
  }
  catch(Exception e)when(e is FormatException or KeyNotFoundException or InvalidOperationException or OverflowException){throw new DocumentWorkException("export_snapshot_invalid",WorkFailure.Permanent);}
 }
}
