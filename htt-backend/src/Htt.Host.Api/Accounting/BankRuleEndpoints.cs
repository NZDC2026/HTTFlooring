using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using Htt.Host.Api.MasterData;
using static Htt.Host.Api.Sales.SalesSupport;
namespace Htt.Host.Api.Accounting;

public sealed record BankRuleCondition(string Field,string Operator,string Value,decimal? MinGross=null,decimal? MaxGross=null);
public sealed record BankRuleAllocation(Guid AccountId,Guid TaxCodeId,string Description,string BasClass,decimal Percent=100,decimal RecoverablePercent=0,decimal InputTaxedPercent=0,string CashFlowCategory="OPERATING");
public sealed record BankRuleInput(string Name,Guid BankAccountId,string Kind,int Priority,bool Enabled,string ExecutionMode,BankRuleCondition Condition,IReadOnlyList<BankRuleAllocation> Lines);
public sealed record BankRulePreviewInput(string? TaxInvoiceReference=null,DateOnly? TaxInvoiceHeldOn=null);
public sealed record BankRuleExecuteInput(bool NoPriorPostingConfirmed,string Reason);
internal static class BankRuleEndpoints
{
 private static async Task Guard(CompanySession s,string cap,CancellationToken ct)=>await One(s,"SELECT accounting.require_bank_rules(@cap)",ct,new DbArg("cap",cap));
 private static BankRuleInput Validate(BankRuleInput x)
 {
  Check.That(x.BankAccountId!=Guid.Empty&&x.Priority is>=1 and<=10000&&x.Condition is not null,"rule","Bank, priority and condition required.");
  Check.OneOf(x.Kind,"kind","PAY","RECEIVE");Check.OneOf(x.ExecutionMode,"executionMode","SUGGEST","AUTO");
  Check.OneOf(x.Condition!.Field,"field","DESCRIPTION","REFERENCE");Check.OneOf(x.Condition.Operator,"operator","EQUALS","CONTAINS","STARTS_WITH");
  var value=Check.Text(x.Condition.Value,"value",200);Check.That(value.Length>=2,"value","Use at least two literal characters.");
  foreach(var amount in new[]{x.Condition.MinGross,x.Condition.MaxGross})if(amount is{} n){Check.Amount(n,"gross",2);Check.That(n>0,"gross","Positive amount required.");}
  Check.That(x.Condition.MinGross is null||x.Condition.MaxGross is null||x.Condition.MinGross<=x.Condition.MaxGross,"gross","Invalid gross range.");
  Check.That(x.Lines is{Count:>=1 and<=20}&&x.Lines.All(l=>l is not null),"lines","Supply 1..20 allocations.");
  var lines=x.Lines!.Select(l=>{Check.That(l.AccountId!=Guid.Empty&&l.TaxCodeId!=Guid.Empty,"lines","Company account and tax code required.");foreach(var n in new[]{l.Percent,l.RecoverablePercent,l.InputTaxedPercent}){Check.Amount(n,"percent",4);Check.That(n<=100,"percent","Use 0..100 percent.");}Check.That(l.Percent>0,"percent","Positive allocation required.");Check.OneOf(l.BasClass,"basClass","TAXABLE","EXPORT","OTHER_GST_FREE","INPUT_TAXED","CAPITAL","NON_CAPITAL","EXCLUDED");Check.OneOf(l.CashFlowCategory,"cashFlowCategory","OPERATING","INVESTING","FINANCING");return l with{Description=Check.Text(l.Description,"description",500)};}).ToArray();
  Check.That(lines.Sum(l=>l.Percent)==100,"percent","Allocation percentages must total 100.");
  return x with{Name=Check.Text(x.Name,"name"),Condition=x.Condition with{Value=value},Lines=lines};
 }
 private static async Task<System.Text.Json.JsonElement> Rule(CompanySession s,Guid id,CancellationToken ct)=>Element((await One(s,"SELECT jsonb_build_object('id',rule_id,'version',version,'createdAt',created_at,'createdBy',created_by,'definition',definition)::text AS result FROM accounting.bank_rules WHERE company_id=@company AND rule_id=@id",ct,new DbArg("id",id)))["result"]!);
 private static async Task<System.Text.Json.JsonElement> Preview(CompanySession s,Guid id,CancellationToken ct)=>Element((await One(s,"SELECT jsonb_build_object('id',p.id,'createdAt',p.created_at,'expiresAt',p.expires_at,'createdBy',p.created_by,'snapshot',p.snapshot,'taxInvoiceReference',p.tax_invoice_reference,'taxInvoiceHeldOn',p.tax_invoice_held_on,'executionId',(SELECT e.id FROM accounting.bank_rule_executions e WHERE e.company_id=p.company_id AND e.preview_id=p.id))::text AS result FROM accounting.bank_rule_previews p WHERE p.company_id=@company AND p.id=@id",ct,new DbArg("id",id)))["result"]!);
 private static object RuleRow(Dictionary<string,object?> row)
 {var result=(Dictionary<string,object?>)PublicRow(row);if(result.TryGetValue("definition",out var value)&&value is string json)result["definition"]=Element(json);return result;}
 public static void Map(RouteGroupBuilder g)
 {
  g=g.MapGroup("").AddEndpointFilter(async(c,next)=>{await Guard(c.HttpContext.RequestServices.GetRequiredService<CompanySession>(),"accounting.bank_rules.read",c.HttpContext.RequestAborted);return await next(c);});
  g.MapGet("/bank-rules/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Rule(s,id,ct))).WithMetadata(new Permission("accounting.bank_rules.read"));
  g.MapGet("/bank-rules",async(Guid? bankAccountId,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{var(offset,size)=Page(page,pageSize);var rows=await Read(s,"SELECT rule_id AS id,version,name,bank_account_id,kind,priority,enabled,execution_mode,definition,created_at FROM accounting.bank_rules WHERE company_id=@company AND(@bank IS NULL OR bank_account_id=@bank)ORDER BY priority,rule_id LIMIT @size OFFSET @offset",ct,new DbArg("bank",bankAccountId,NpgsqlDbType.Uuid),new DbArg("size",size),new DbArg("offset",offset));return Results.Ok(new{items=rows.Select(RuleRow),page=page??1,pageSize=size});}).WithMetadata(new Permission("accounting.bank_rules.read"));
  g.MapGet("/bank-rules/{id:guid}/revisions",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>{await Rule(s,id,ct);var(offset,size)=Page(page,pageSize);return Results.Ok(new{items=(await Read(s,"SELECT version,name,priority,enabled,execution_mode,definition,created_at,created_by FROM accounting.bank_rule_revisions WHERE company_id=@company AND rule_id=@id ORDER BY version DESC LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(RuleRow),page=page??1,pageSize=size});}).WithMetadata(new Permission("accounting.bank_rules.read"));
  g.MapPost("/bank-rules",Create).WithMetadata(new Permission("accounting.bank_rules.manage"));
  g.MapPut("/bank-rules/{id:guid}",Update).WithMetadata(new Permission("accounting.bank_rules.manage"));
  g.MapPost("/bank-statement-lines/{id:guid}/rule-preview",SavePreview).WithMetadata(new Permission("accounting.bank_rules.preview"));
  g.MapGet("/bank-rule-previews/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(await Preview(s,id,ct))).WithMetadata(new Permission("accounting.bank_rules.read"));
  g.MapPost("/bank-rule-previews/{id:guid}/execute",Execute).WithMetadata(new Permission("accounting.bank_rules.execute"));
  g.MapGet("/bank-rule-exceptions",Exceptions).WithMetadata(new Permission("accounting.bank_rules.read"));
 }
 private static Task<IResult> Create(BankRuleInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>Save(null,x,h,s,idem,ct);
 private static Task<IResult> Update(Guid id,BankRuleInput x,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>Save(id,x,h,s,idem,ct);
 private static async Task<IResult> Save(Guid? id,BankRuleInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  await Guard(s,"accounting.bank_rules.manage",ct);var x=Validate(input);long? version=id.HasValue?Version(h):null;
  var old=id.HasValue?await Rule(s,id.Value,ct):default;if(x.ExecutionMode=="AUTO"||id.HasValue&&old.GetProperty("definition").GetProperty("executionMode").GetString()=="AUTO")await Guard(s,"accounting.bank_rules.auto_execute",ct);
  var response=await idem.ExecuteAsync(id.HasValue?$"PUT /bank-rules/{id}":"POST /bank-rules",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,x}),async()=>{var rid=(Guid)(await One(s,"SELECT accounting.save_bank_rule(@id,@version,@data)AS id",ct,new DbArg("id",id,NpgsqlDbType.Uuid),new DbArg("version",version,NpgsqlDbType.Bigint),new DbArg("data",Json(x),NpgsqlDbType.Jsonb)))["id"]!;await Sql.AuditAsync(s,"accounting.bank_rule_saved","bank_rule",rid,h.TraceIdentifier,ct);return ApiJson.Stored(await Rule(s,rid,ct),id.HasValue?200:201);},ct);return ApiJson.Result(response);
 }
 private static async Task<IResult> SavePreview(Guid id,BankRulePreviewInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  await Guard(s,"accounting.bank_rules.preview",ct);var x=input with{TaxInvoiceReference=Check.Optional(input.TaxInvoiceReference,"taxInvoiceReference",500)};
  var response=await idem.ExecuteAsync($"POST /bank-statement-lines/{id}/rule-preview",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,x}),async()=>{var pid=(Guid)(await One(s,"SELECT accounting.preview_bank_rule(@id,@evidence,@held)AS id",ct,new DbArg("id",id),new DbArg("evidence",x.TaxInvoiceReference,NpgsqlDbType.Text),new DbArg("held",x.TaxInvoiceHeldOn,NpgsqlDbType.Date)))["id"]!;await Sql.AuditAsync(s,"accounting.bank_rule_previewed","bank_rule_preview",pid,h.TraceIdentifier,ct);return ApiJson.Stored(await Preview(s,pid,ct),201);},ct);return ApiJson.Result(response);
 }
 private static async Task<IResult> Execute(Guid id,BankRuleExecuteInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
 {
  await Guard(s,"accounting.bank_rules.execute",ct);foreach(var cap in new[]{"accounting.bank_transactions.post","accounting.bank_transactions.classify"})await One(s,"SELECT accounting.require_general_banking(@cap)",ct,new DbArg("cap",cap));
  var preview=await Preview(s,id,ct);if(preview.GetProperty("snapshot").GetProperty("executionMode").GetString()=="AUTO")await Guard(s,"accounting.bank_rules.auto_execute",ct);
  Check.That(input.NoPriorPostingConfirmed,"noPriorPostingConfirmed","Confirm there is no prior invoice, claim or posting; otherwise use existing matching/settlement flows.");var x=input with{Reason=Check.Text(input.Reason,"reason",2000)};
  var response=await idem.ExecuteAsync($"POST /bank-rule-previews/{id}/execute",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,x}),async()=>{var eid=(Guid)(await One(s,"SELECT accounting.execute_bank_rule(@id,@confirm,@reason)AS id",ct,new DbArg("id",id),new DbArg("confirm",x.NoPriorPostingConfirmed),new DbArg("reason",x.Reason)))["id"]!;await Sql.AuditAsync(s,"accounting.bank_rule_executed","bank_rule_execution",eid,h.TraceIdentifier,ct);return ApiJson.Stored(PublicRow(await One(s,"SELECT id,preview_id,source_document_id,reason,created_at,created_by FROM accounting.bank_rule_executions WHERE company_id=@company AND id=@id",ct,new DbArg("id",eid))),201);},ct);return ApiJson.Result(response);
 }
 private static async Task<IResult> Exceptions(Guid bankAccountId,DateOnly from,DateOnly to,string? status,int? page,int? pageSize,bool? includeClosed,CompanySession s,CancellationToken ct)
 {
  Check.That(bankAccountId!=Guid.Empty&&from.Year>=2&&to>from&&to.DayNumber-from.DayNumber<=366,"range","Bank and [from,to) range of at most 366 days required.");var(offset,size)=Page(page,pageSize);Check.That(size<=25,"pageSize","Exception pages are limited to 25 rows.");
  if(status is not null)Check.OneOf(status,"status","READY","NO_RULE","AMBIGUOUS_RULE","MATCHED","PARTIALLY_MATCHED","SOURCE_ALREADY_POSTED","ACCOUNTING_PERIOD_CLOSED","BAS_FROZEN","BANK_CUTOFF","BANK_REVIEW_REQUIRED","TAX_CONFIGURATION_REQUIRED","EXISTING_CASH_MATCH","INVALID_ACTION","AMOUNT_ROUNDING","NEEDS_TAX_EVIDENCE","INVALID_TAX_EVIDENCE","STATEMENT_CLOSED");
  await One(s,"SELECT accounting.require_bank_reconciliation_access('accounting.bank_statements.read',@bank),accounting.lock_bank_rules(false)",ct,new DbArg("bank",bankAccountId));
  var rows=await Read(s,"SELECT e.result::text AS result FROM accounting.bank_statement_lines l JOIN accounting.bank_statement_controls sc ON sc.company_id=l.company_id AND sc.id=l.statement_id CROSS JOIN LATERAL(SELECT accounting.evaluate_bank_rules(l.id,NULL,NULL)AS result OFFSET 0)e WHERE l.company_id=@company AND l.bank_account_id=@bank AND l.transaction_date>=@from AND l.transaction_date<@to AND(@closed OR sc.state='OPEN')AND(@status IS NULL AND e.result->>'status'NOT IN('READY','MATCHED')OR e.result->>'status'=@status)ORDER BY l.transaction_date,l.id LIMIT @size OFFSET @offset",ct,new DbArg("bank",bankAccountId),new DbArg("from",from),new DbArg("to",to),new DbArg("closed",includeClosed??false),new DbArg("status",status,NpgsqlDbType.Text),new DbArg("size",size+1),new DbArg("offset",offset));
  return Results.Ok(new{items=rows.Take(size).Select(x=>Element(x["result"]!)),page=page??1,pageSize=size,hasMore=rows.Count>size});
 }
}
