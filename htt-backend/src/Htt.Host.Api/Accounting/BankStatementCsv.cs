using System.Globalization;
using System.Text;
using Htt.Host.Api.MasterData;
using Htt.SharedKernel;
namespace Htt.Host.Api.Accounting;
internal static class BankStatementCsv
{
    internal const int MaxBytes=2*1024*1024;
    internal static BankStatementLineInput[] Parse(byte[] bytes)
    {
        Check.That(bytes.Length<=MaxBytes,"file","CSV exceeds 2 MiB.");string text;try{text=new UTF8Encoding(false,true).GetString(bytes).TrimStart('\uFEFF');}catch(DecoderFallbackException){throw new BusinessException("invalid_csv","CSV must be valid UTF-8.",422);}
        Check.That(!text.Contains('\0'),"file","CSV contains NUL.");var records=new List<string[]>();var row=new List<string>();var field=new StringBuilder();bool quoted=false,afterQuote=false;
        void Field(){row.Add(field.ToString());field.Clear();afterQuote=false;}
        void Row(){Field();if(row.Count!=1||row[0].Length!=0)records.Add(row.ToArray());row.Clear();Check.That(records.Count<=5001,"lines","CSV exceeds 5000 rows.");}
        for(var i=0;i<text.Length;i++)
        {
            var ch=text[i];if(quoted){if(ch=='"'){if(i+1<text.Length&&text[i+1]=='"'){field.Append('"');i++;}else{quoted=false;afterQuote=true;}}else field.Append(ch);continue;}
            if(ch=='"'){Check.That(field.Length==0&&!afterQuote,"file","Unexpected CSV quote.");quoted=true;}
            else if(ch==',')Field();else if(ch is '\r' or '\n'){if(ch=='\r'&&i+1<text.Length&&text[i+1]=='\n')i++;Row();}else{Check.That(!afterQuote,"file","Unexpected text after closing quote.");field.Append(ch);}
        }
        Check.That(!quoted,"file","Unclosed CSV quote.");if(field.Length>0||row.Count>0||afterQuote)Row();Check.That(records.Count>0,"file","CSV header required.");var header=records[0].Select(x=>x.Trim().ToLowerInvariant()).ToArray();Check.That(header.Distinct().Count()==header.Length&&header.All(x=>new[]{"date","amount","description","reference","externalid"}.Contains(x))&&new[]{"date","amount","description"}.All(header.Contains),"header","Use date,amount,description and optional reference,externalId headers.");
        var result=new List<BankStatementLineInput>();foreach(var values in records.Skip(1))
        {
            Check.That(values.Length==header.Length,"file","CSV column count differs from header.");string Value(string name){var index=Array.IndexOf(header,name);return index<0?"":values[index];}
            Check.That(DateOnly.TryParseExact(Value("date").Trim(),["yyyy-MM-dd","dd/MM/yyyy"],CultureInfo.InvariantCulture,DateTimeStyles.None,out var date),"date","Use ISO or Australian dd/MM/yyyy dates.");Check.That(decimal.TryParse(Value("amount").Trim(),NumberStyles.AllowLeadingSign|NumberStyles.AllowDecimalPoint,CultureInfo.InvariantCulture,out var amount),"amount","Use a signed decimal amount without currency symbols or thousands separators.");result.Add(new(date,amount,Value("description"),Value("reference"),string.IsNullOrWhiteSpace(Value("externalid"))?null:Value("externalid")));
        }return result.ToArray();
    }
}
