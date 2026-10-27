using System.Text.Json.Nodes;
using Htt.Infrastructure;
using Htt.Host.Api.MasterData;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Accounting;
public sealed record BankAccountInput(string Code,string Name,string Kind,string? Bsb=null,string? AccountNumber=null,string? AccountHolder=null,bool Active=true);
public sealed record BankDefaultInput(Guid BankAccountId);
internal static class BankingEndpoints
{
    internal static void CheckChoice(HttpContext h,Guid? bank){if(bank is null)return;Check.That(bank!=Guid.Empty,"bankAccountId","A company cash account ID is required.");if(!Access(h).Has("accounting.banks.use"))throw new BusinessException("permission_denied","Cash-account selection permission required.",403);}
    internal static string Body(object legacy,Guid? bank){var json=Json(legacy);if(bank is null)return json;var node=JsonNode.Parse(json)!.AsObject();node["bankAccountId"]=bank.Value.ToString();return node.ToJsonString();}
    private static void ReadAccess(HttpContext h){if(!Access(h).Has("accounting.banks.read"))throw new BusinessException("permission_denied","Bank maintenance also requires directory read permission.",403);}
    private static long Version(HttpContext h){if(!long.TryParse(h.Request.Headers.IfMatch.ToString().Trim('"'),out var v)||v<1)throw new BusinessException("version_required","Current If-Match required.",428);return v;}
    private const string View="SELECT b.*,a.code,a.active AS gl_active,m.account_id=b.id AS is_default,m.version AS default_mapping_version,coalesce((SELECT sum(l.debit-l.credit) FROM accounting.journal_lines l WHERE l.company_id=b.company_id AND l.account_id=b.id),0) AS signed_balance FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id LEFT JOIN accounting.account_mappings m ON m.company_id=b.company_id AND m.purpose='BANK' WHERE b.company_id=@company";
    public static void Map(RouteGroupBuilder g)
    {
        g.MapGet("/bank-accounts",async(CompanySession s,CancellationToken ct)=>Results.Ok(new{currency="AUD",items=(await Read(s,View+" ORDER BY a.code,b.id",ct)).Select(PublicRow)})).WithMetadata(new Permission("accounting.banks.read"));
        g.MapGet("/bank-accounts/options",async(CompanySession s,CancellationToken ct)=>Results.Ok(new{items=(await Read(s,"SELECT b.id,a.code,b.name,b.kind,b.currency,CASE WHEN b.account_number IS NOT NULL THEN '****'||right(b.account_number,4) END AS account_number_masked,m.account_id=b.id AS is_default FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id LEFT JOIN accounting.account_mappings m ON m.company_id=b.company_id AND m.purpose='BANK' WHERE b.company_id=@company AND b.active AND a.active ORDER BY a.code,b.id",ct)).Select(PublicRow)})).WithMetadata(new Permission("accounting.banks.use"));
        g.MapGet("/bank-accounts/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(PublicRow(await One(s,View+" AND b.id=@id",ct,new DbArg("id",id))))).WithMetadata(new Permission("accounting.banks.read"));
        g.MapPost("/bank-accounts",async(BankAccountInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(null,input,h,s,idem,ct)).WithMetadata(new Permission("accounting.banks.write"));
        g.MapPut("/bank-accounts/{id:guid}",async(Guid id,BankAccountInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Save(id,input,h,s,idem,ct)).WithMetadata(new Permission("accounting.banks.write"));
        g.MapPut("/bank-accounts/default",async(BankDefaultInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
        {
            ReadAccess(h);var version=Version(h);var result=await idem.ExecuteAsync("PUT /bank-accounts/default",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{version,input.BankAccountId}),async()=>{await Read(s,"SELECT accounting.set_default_bank(@bank,@version)",ct,new DbArg("bank",input.BankAccountId),new DbArg("version",version));await Sql.AuditAsync(s,"accounting.bank_default_changed","bank_account",input.BankAccountId,h.TraceIdentifier,ct,new{input.BankAccountId});return ApiJson.Stored(PublicRow(await One(s,"SELECT account_id AS bank_account_id,version FROM accounting.account_mappings WHERE company_id=@company AND purpose='BANK'",ct)),200);},ct);return ApiJson.Result(result);
        }).WithMetadata(new Permission("accounting.banks.write"));
    }
    private static async Task<IResult> Save(Guid? id,BankAccountInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        ReadAccess(h);var code=Check.Code(input.Code);var name=Check.Text(input.Name,"name",200);var kind=Check.OneOf(input.Kind,"kind","BANK","CASH","CARD_CLEARING","LEGACY");Check.That(id is not null||kind!="LEGACY","kind","New accounts require an explicit financial identity.");var bsb=input.Bsb?.Replace("-","").Replace(" ","");var number=input.AccountNumber?.Replace(" ","");var holder=Check.Optional(input.AccountHolder,"accountHolder",200);
        Check.That(kind=="BANK"?bsb is{Length:6}&&bsb.All(char.IsAsciiDigit)&&number is{Length:>=1 and<=20}&&number.All(char.IsAsciiDigit)&&holder is not null:bsb is null&&number is null&&holder is null,"bankIdentity","BANK requires six-digit BSB, numeric account number and account holder; cash/card clearing must omit bank details.");long? version=id is null?null:Version(h);
        var route=id is null?"POST /bank-accounts":$"PUT /bank-accounts/{id}";var result=await idem.ExecuteAsync(route,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,code,name,kind,bsb,number,holder,input.Active}),async()=>
        {
            var row=await One(s,"SELECT accounting.configure_bank(@id,@version,@code,@name,@kind,@bsb,@number,@holder,@active) AS id",ct,new DbArg("id",id,NpgsqlDbType.Uuid),new DbArg("version",version,NpgsqlDbType.Bigint),new DbArg("code",code),new DbArg("name",name),new DbArg("kind",kind),new DbArg("bsb",bsb,NpgsqlDbType.Text),new DbArg("number",number,NpgsqlDbType.Text),new DbArg("holder",holder,NpgsqlDbType.Text),new DbArg("active",input.Active));var bank=(Guid)row["id"]!;
            await Sql.AuditAsync(s,id is null?"accounting.bank_created":"accounting.bank_changed","bank_account",bank,h.TraceIdentifier,ct,new{code,name,kind,accountHolder=holder,input.Active});return ApiJson.Stored(PublicRow(await One(s,View+" AND b.id=@id",ct,new DbArg("id",bank))),id is null?201:200);
        },ct);return ApiJson.Result(result);
    }
}
