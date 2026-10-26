using System.Net;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Infrastructure;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class SupplierRefundCorrectionTests : IAsyncLifetime
{
    private readonly DatabaseFixture db=new();
    public Task InitializeAsync()=>db.InitializeAsync();
    public Task DisposeAsync()=>db.DisposeAsync();
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private sealed record Data(Guid Supplier,Guid Bill,Guid Line,Guid Credit,Guid CreditLine,Guid Account,Guid Tax,DateOnly Today,decimal Gross);
    private async Task<Data> Source(HttpClient c,string basis="CASH",decimal net=100,decimal tax=10,bool paid=true,decimal? credit=null,bool recoverable=true,bool makeCredit=true)
    {
        await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=true WHERE id=@company",("company",db.Company),("basis",basis));
        var sid=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Credit application supplier",null));var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.Company)))!;var tc=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;var today=DateOnly.Parse((string)(await S("SELECT to_char((now() AT TIME ZONE timezone)::date,'YYYY-MM-DD') FROM core.companies WHERE id=@company",("company",db.Company)))!,System.Globalization.CultureInfo.InvariantCulture);
        var d=new Data(sid,default,default,default,default,acct,tc,today,net+tax);var b=await Bill(c,d,net,tax,recoverable:recoverable);d=d with{Bill=b.Bill,Line=b.Line};if(paid && d.Gross>0)await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created);
        if(!makeCredit)return d;
        var cr=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{d.Bill}/credits",new ExpenseCreditInput(Code(),"Verified original adjustment",[new(d.Line,credit??d.Gross)])),HttpStatusCode.Created);return d with{Credit=cr.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cr.GetProperty("lines")[0].GetProperty("id").GetGuid()};
    }
    private static async Task<(Guid Bill,Guid Line)> Bill(HttpClient c,Data d,decimal net=100,decimal tax=10,bool recoverable=true,DateOnly? held=null)
    {
        var b=await Expect(await Send(c,HttpMethod.Post,"/supplier-expense-bills",new ExpenseBillInput(d.Supplier,Code(),d.Today,d.Today.AddDays(30),d.Today,[new(d.Account,"Expense settlement",net,tax,d.Tax,recoverable)],"Verified invoice",held??d.Today)),HttpStatusCode.Created);return(b.GetProperty("bill").GetProperty("id").GetGuid(),b.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private static SupplierCreditApplicationInput Input(Data d,Guid line,decimal? amount=null,string? reference=null)=>new(reference??Code(),"Apply verified available supplier credit",[new(d.CreditLine,line,amount??d.Gross)]);
    private static Task<HttpResponseMessage> Apply(HttpClient c,Data d,Guid line,decimal? amount=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credits/{d.Credit}/apply",Input(d,line,amount,reference),key:key);
    private static Task<HttpResponseMessage> Undo(HttpClient c,Guid app,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-credit-applications/{app}/unapply",new SupplierCreditUnapplicationInput(reference??Code(),"Verified allocation correction"),key:key);
    private static Task<HttpResponseMessage> Pay(HttpClient c,Data d,Guid line,decimal amount)=>Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),PaidOn:d.Today,Allocations:[new(line,amount)]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,Data d,decimal amount)=>Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(amount,Code(),"Verified incoming refund",CreditLineId:d.CreditLine));
    private static Guid App(JsonElement e)=>e.GetProperty("application").GetProperty("id").GetGuid();
    private static Guid Unapp(JsonElement e)=>e.GetProperty("unapplication").GetProperty("id").GetGuid();
    private static async Task Consistent(HttpClient c){var r=await Get(c,"/accounting/reconciliation");Assert.True(r.GetProperty("status").GetString()=="CONSISTENT",r.GetRawText());}
    private static async Task<JsonElement> CreditLine(HttpClient c,Data d)=>(await Get(c,$"/supplier-credits/{d.Credit}")).GetProperty("lines").EnumerateArray().Single(x=>x.GetProperty("id").GetGuid()==d.CreditLine);
    private async Task<decimal> Balance(Guid line,string col)=>Convert.ToDecimal(await S($"SELECT {col} FROM purchase.bill_line_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",line)));
    private async Task<decimal> Journal(Guid doc,string code,string side)=>Convert.ToDecimal(await S($"SELECT coalesce(sum(l.{side}),0) FROM accounting.posting_batches b JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=@company AND b.source_document_id=@id AND a.code=@code",("company",db.Company),("id",doc),("code",code)));
    private static Task<HttpResponseMessage> Reverse(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-payments/{id}/reverse",new SupplierSettlementReversalInput(reference??Code(),"Correct supplier payment"),key:key);
    private static Task<HttpResponseMessage> Unapply(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-advance-applications/{id}/unapply",new SupplierSettlementReversalInput(reference??Code(),"Correct prepayment allocation"),key:key);
    private static Task<HttpResponseMessage> Reapply(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-payment-reversals/{id}/reapply",new SupplierPaymentReapplicationInput(reference??Code(),"Correct supplier allocation",Allocations:[new(target,amount)]),key:key);
    private static Task<HttpResponseMessage> Reallocate(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null,string? reversalReference=null)=>Send(c,HttpMethod.Post,$"/supplier-payments/{id}/reallocate",new SupplierPaymentReallocationInput(reversalReference??Code(),reference??Code(),"Correct supplier allocation",Allocations:[new(target,amount)]),key:key);
    private static Task<HttpResponseMessage> PayAdvance(HttpClient c,Guid id,Guid target,decimal amount=110,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-advances/{id}/apply",new SupplierAdvanceApplicationInput(reference??Code(),[new(target,amount)]),key:key);
    private static Guid Rev(JsonElement e)=>e.GetProperty("reversal").GetProperty("id").GetGuid();
    private static Guid Payment(JsonElement e)=>e.GetProperty("payment").GetProperty("id").GetGuid();
    private async Task<Guid> OriginalPayment(Data d)=>(Guid)(await S("SELECT payment_id FROM accounting.supplier_payment_allocations WHERE company_id=@company AND bill_line_id=@id ORDER BY id LIMIT 1",("company",db.Company),("id",d.Line)))!;
    private async Task<decimal> Available(Guid advance)=>Convert.ToDecimal(await S("SELECT available FROM accounting.supplier_advance_balances WHERE company_id=@company AND id=@id",("company",db.Company),("id",advance)));
    private static async Task<decimal> Gst(HttpClient c,Data d)=>D((await Get(c,$"/accounting/purchase-gst?supplierId={d.Supplier}")).GetProperty("attributedTax"));
    private static async Task<(Guid Payment,Guid Advance)> Advance(HttpClient c,Data d,decimal amount=220)
    {
        var p=await Expect(await Send(c,HttpMethod.Post,$"/suppliers/{d.Supplier}/payments",new SupplierPaymentInput(amount,"BANK_TRANSFER",Code(),amount,Notes:"Confirmed supplier prepayment")),HttpStatusCode.Created);return(Payment(p),p.GetProperty("advances")[0].GetProperty("id").GetGuid());
    }
    private static Task<HttpResponseMessage> ReverseRefund(HttpClient c,Guid id,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-refunds/{id}/reverse",new SupplierRefundReversalInput(reference??Code(),"Verified refund correction"),key:key);
    private static Task<HttpResponseMessage> CorrectRefund(HttpClient c,Guid id,Data d,decimal amount=55,Guid? advance=null,string? key=null,string? reference=null,string? rr=null)=>Send(c,HttpMethod.Post,$"/supplier-refunds/{id}/correct",new SupplierRefundAtomicCorrectionInput(rr??Code(),reference??Code(),"Verified refund correction",amount,CreditLineId:advance is null?d.CreditLine:null,AdvanceId:advance),key:key);
    private static Task<HttpResponseMessage> ReplaceRefund(HttpClient c,Guid id,Data d,decimal amount=55,Guid? advance=null,string? key=null,string? reference=null)=>Send(c,HttpMethod.Post,$"/supplier-refund-reversals/{id}/correct",new SupplierRefundCorrectionInput(reference??Code(),"Verified refund correction",amount,CreditLineId:advance is null?d.CreditLine:null,AdvanceId:advance),key:key);
    private static Guid RefundId(JsonElement e)=>e.GetProperty("refund").GetProperty("id").GetGuid();
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Credit_refund_reversal_and_correction_restore_AP_and_current_GST(string basis,bool atomic)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var id=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));Assert.Equal(0,await Balance(d.Line,"refundable_amount"));JsonElement corrected;
        if(atomic)corrected=await Expect(await CorrectRefund(c,id,d),HttpStatusCode.Created);else{var v=await Expect(await ReverseRefund(c,id),HttpStatusCode.Created);Assert.StartsWith("SFR-",v.GetProperty("reversal").GetProperty("number").GetString());Assert.Equal(110,await Balance(d.Line,"refundable_amount"));Assert.Equal(basis=="CASH"?10:0,await Gst(c,d));await Consistent(c);corrected=await Expect(await ReplaceRefund(c,Rev(v),d),HttpStatusCode.Created);}
        Assert.Equal(55,await Balance(d.Line,"refundable_amount"));Assert.Equal(basis=="CASH"?5:0,await Gst(c,d));Assert.Equal(id,(await Get(c,$"/supplier-refunds/{RefundId(corrected)}")).GetProperty("refund").GetProperty("originalRefundId").GetGuid());Assert.Equal("REVERSED",(await Get(c,$"/supplier-refunds/{id}")).GetProperty("refund").GetProperty("refundStatus").GetString());await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Advance_refund_reversal_and_correction_restore_prepaid_funds_without_GST(string basis,bool atomic)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var p=await Advance(c,d,110);var id=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Verified incoming refund",AdvanceId:p.Advance)),HttpStatusCode.Created));
        if(atomic)await Expect(await CorrectRefund(c,id,d,55,p.Advance),HttpStatusCode.Created);else{var v=Rev(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));Assert.Equal(110,await Available(p.Advance));await Consistent(c);await Expect(await ReplaceRefund(c,v,d,55,p.Advance),HttpStatusCode.Created);}
        Assert.Equal(55,await Available(p.Advance));Assert.Equal(basis=="CASH"?0:10,await Gst(c,d));await Expect(await Reverse(c,p.Payment),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Concurrent_same_key_executes_once_and_changed_payload_conflicts(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var original=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var key=Code();var reference=Code();var revReference=Code();Func<string,string,Task<HttpResponseMessage>> send=operation switch{"reverse"=>(k,r)=>ReverseRefund(c,original,k,r),"correct"=>(k,r)=>CorrectRefund(c,original,d,55,key:k,reference:r,rr:revReference),_=>(k,r)=>Task.FromResult<HttpResponseMessage>(null!)};if(operation=="replace"){var v=Rev(await Expect(await ReverseRefund(c,original),HttpStatusCode.Created));send=(k,r)=>ReplaceRefund(c,v,d,55,key:k,reference:r);}var all=await Task.WhenAll(Enumerable.Range(0,5).Select(_=>send(key,reference)));var ids=new List<Guid>();foreach(var response in all){var body=await Expect(response,HttpStatusCode.Created);ids.Add(body.GetProperty(operation=="reverse"?"reversal":"refund").GetProperty("id").GetGuid());}Assert.Single(ids.Distinct());await Expect(await send(key,"Changed reference"),HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Different_keys_cannot_duplicate_same_refund_correction(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var original=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(c,original);else if(operation=="correct")send=()=>CorrectRefund(c,original,d,55);else{var v=Rev(await Expect(await ReverseRefund(c,original),HttpStatusCode.Created));send=()=>ReplaceRefund(c,v,d,55);}var all=await Task.WhenAll(send(),send());Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(all,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("OFFICE")][InlineData("SALES")][InlineData("WAREHOUSE")][InlineData("PROCUREMENT")][InlineData("PRICING_MANAGER")]
    public async Task Nonfinancial_roles_cannot_reverse_or_correct(string role)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var id=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var staff=await Staff(db,role);using var f=api.Authenticated(staff.Subject);await Expect(await ReverseRefund(f,id),HttpStatusCode.Forbidden);await Expect(await CorrectRefund(f,id,d,55),HttpStatusCode.Forbidden);var v=Rev(await Expect(await ReverseRefund(c,id),HttpStatusCode.Created));await Expect(await ReplaceRefund(f,v,d,55),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("reverse","purchase.refunds.reverse")][InlineData("reverse","purchase.refunds.read")][InlineData("reverse","purchase.bills.read")]
    [InlineData("correct","purchase.refunds.correct")][InlineData("correct","purchase.refunds.reverse")][InlineData("correct","purchase.refunds.post")][InlineData("correct","purchase.refunds.read")][InlineData("correct","purchase.bills.read")]
    [InlineData("replace","purchase.refunds.correct")][InlineData("replace","purchase.refunds.post")]
    public async Task Revocation_blocks_cached_financial_response(string operation,string permission)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var staff=await Staff(db,"FINANCE");using var f=api.Authenticated(staff.Subject);var key=Code();var reference=Code();var rr=Code();Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(f,rf,key,reference);else if(operation=="correct")send=()=>CorrectRefund(f,rf,d,55,key:key,reference:reference,rr:rr);else{var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));send=()=>ReplaceRefund(f,v,d,55,key:key,reference:reference);}await Expect(await send(),HttpStatusCode.Created);await S("DELETE FROM identity.role_permissions WHERE company_id=@company AND permission_code=@permission AND role_id IN(SELECT id FROM identity.roles WHERE company_id=@company AND code='FINANCE')",("company",db.Company),("permission",permission));await Expect(await send(),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Anonymous_portal_and_other_company_cannot_read_or_modify_refund_corrections()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));using var other=api.Authenticated(company:db.OtherCompany);await Expect(await ReverseRefund(other,rf),HttpStatusCode.NotFound);await Expect(await ReplaceRefund(other,v,d,55),HttpStatusCode.NotFound);await Expect(await other.GetAsync($"/api/v1/supplier-refund-reversals/{v}"),HttpStatusCode.NotFound);using var anon=api.CreateClient();using var portal=api.Authenticated(audience:"htt-test-portal");foreach(var client in new[]{anon,portal})Assert.Equal(HttpStatusCode.Unauthorized,(await ReverseRefund(client,rf)).StatusCode);
    }
    [Theory]
    [InlineData("negative")][InlineData("zero")][InlineData("precision")][InlineData("over")][InlineData("none")][InlineData("both")][InlineData("unknown")][InlineData("supplier")][InlineData("closed")][InlineData("reference")][InlineData("reason")][InlineData("inactive_bank")]
    public async Task Invalid_atomic_correction_preserves_original_refund_and_does_not_consume_numbers(string scenario)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var input=new SupplierRefundAtomicCorrectionInput(Code(),Code(),"Correct refund",55,CreditLineId:d.CreditLine);input=scenario switch{"negative"=>input with{Amount=-1},"zero"=>input with{Amount=0},"precision"=>input with{Amount=55.001m},"over"=>input with{Amount=111},"none"=>input with{CreditLineId=null},"both"=>input with{AdvanceId=Guid.NewGuid()},"unknown"=>input with{CreditLineId=Guid.NewGuid()},"reference"=>input with{Reference=" "},"reason"=>input with{Reason=" "},_=>input};if(scenario=="supplier"){var other=await Source(c);input=input with{CreditLineId=other.CreditLine};}if(scenario=="closed")await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company",("company",db.Company));if(scenario=="inactive_bank")await S("UPDATE accounting.accounts SET active=false WHERE company_id=@company AND code='1000'",("company",db.Company));var state=await Balance(d.Line,"refundable_amount");var tax=await Gst(c,d);var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var result=await Send(c,HttpMethod.Post,$"/supplier-refunds/{rf}/correct",input);Assert.Contains(result.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.UnprocessableEntity,HttpStatusCode.Conflict,HttpStatusCode.NotFound});Assert.Equal(state,await Balance(d.Line,"refundable_amount"));Assert.Equal(tax,await Gst(c,d));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(0L,await S("SELECT count(*) FROM accounting.supplier_refund_reversals WHERE company_id=@company",("company",db.Company)));
    }
    [Theory]
    [InlineData("reverse")][InlineData("correct")][InlineData("replace")]
    public async Task Late_audit_failure_rolls_back_bank_AR_GST_credit_numbers_and_outbox_and_retries(string operation)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var key=Code();var reference=Code();var rr=Code();Func<Task<HttpResponseMessage>> send;if(operation=="reverse")send=()=>ReverseRefund(c,rf,key,reference);else if(operation=="correct")send=()=>CorrectRefund(c,rf,d,55,key:key,reference:reference,rr:rr);else{var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));send=()=>ReplaceRefund(c,v,d,55,key:key,reference:reference);}var state=await Balance(d.Line,"refundable_amount");var tax=await Gst(c,d);var seq=await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company));var events=await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company));var action=operation=="reverse"?"purchase.supplier_refund_reversed":"purchase.supplier_refund_corrected";await S("CREATE FUNCTION public.fail_supplier_refund() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.company_id='"+db.Company+"'::uuid AND NEW.action='"+action+"' THEN RAISE EXCEPTION 'Injected refund failure' USING ERRCODE='23514';END IF;RETURN NEW;END $$;CREATE TRIGGER test_supplier_refund BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION public.fail_supplier_refund()");try{await Expect(await send(),HttpStatusCode.UnprocessableEntity);Assert.Equal(state,await Balance(d.Line,"refundable_amount"));Assert.Equal(tax,await Gst(c,d));Assert.Equal(seq,await S("SELECT sum(next_value) FROM platform.document_sequences WHERE company_id=@company",("company",db.Company)));Assert.Equal(events,await S("SELECT count(*) FROM platform.outbox_events WHERE company_id=@company",("company",db.Company)));await Consistent(c);}finally{await S("DROP TRIGGER test_supplier_refund ON platform.audit_events;DROP FUNCTION public.fail_supplier_refund()");}await Expect(await send(),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Restored_funds_allow_original_payment_reversal_but_no_double_refund(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:!advance,makeCredit:!advance);Guid payment;Guid? aid=null;Guid rf;
        if(advance){var a=await Advance(c,d,110);payment=a.Payment;aid=a.Advance;rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual refund",AdvanceId:aid)),HttpStatusCode.Created));}else{payment=await OriginalPayment(d);rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));}
        await Expect(await Reverse(c,payment),HttpStatusCode.Conflict);var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));await Expect(await Reverse(c,payment),HttpStatusCode.Created);var failed=await ReplaceRefund(c,v,d,110,aid);Assert.Contains(failed.StatusCode,new[]{HttpStatusCode.Conflict,HttpStatusCode.NotFound});await Consistent(c);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Payment_reversal_and_replacement_refund_cannot_spend_same_restored_funds(bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:!advance,makeCredit:!advance);Guid payment;Guid? aid=null;Guid rf;if(advance){var a=await Advance(c,d,110);payment=a.Payment;aid=a.Advance;rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual refund",AdvanceId:aid)),HttpStatusCode.Created));}else{payment=await OriginalPayment(d);rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));}var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var results=await Task.WhenAll(Reverse(c,payment),ReplaceRefund(c,v,d,110,aid));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict||x.StatusCode==HttpStatusCode.NotFound);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Credit_transfer_and_replacement_refund_share_restored_funds(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var t=await Bill(c,d);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var a=App(await Expect(await Apply(c,d,t.Line),HttpStatusCode.Created));await Expect(await ReplaceRefund(c,v,d,110),HttpStatusCode.Conflict);await Expect(await Undo(c,a),HttpStatusCode.Created);await Expect(await ReplaceRefund(c,v,d,110),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Restored_advance_can_be_applied_unapplied_and_refunded(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var p=await Advance(c,d,110);var rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual refund",AdvanceId:p.Advance)),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var a=App(await Expect(await PayAdvance(c,p.Advance,d.Line),HttpStatusCode.Created));await Expect(await ReplaceRefund(c,v,d,110,p.Advance),HttpStatusCode.Conflict);await Expect(await Unapply(c,a),HttpStatusCode.Created);await Expect(await ReplaceRefund(c,v,d,110,p.Advance),HttpStatusCode.Created);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Advance_application_and_replacement_refund_compete_for_same_funds(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,paid:false,makeCredit:false);var p=await Advance(c,d,110);var rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual refund",AdvanceId:p.Advance)),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var results=await Task.WhenAll(PayAdvance(c,p.Advance,d.Line),ReplaceRefund(c,v,d,110,p.Advance));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Correction_can_change_amount_and_same_supplier_source(string basis,bool advance)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var rf=RefundId(await Expect(await Refund(c,d,55),HttpStatusCode.Created));Guid? aid=null;if(advance){var p=await Advance(c,d,110);aid=p.Advance;}var corrected=await Expect(await CorrectRefund(c,rf,d,110,aid),HttpStatusCode.Created);Assert.Equal(advance?110:0,await Balance(d.Line,"refundable_amount"));if(aid is{}a)Assert.Equal(0,await Available(a));await Consistent(c);await Expect(await ReverseRefund(c,RefundId(corrected)),HttpStatusCode.Created);await Consistent(c);
    }
    [Fact]
    public async Task Original_bank_and_source_AP_remain_frozen_after_mapping_changes()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));await S("INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(@company,'1010','New bank','ASSET','BANK'),(@company,'2010','New AP','LIABILITY','AP');UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='1010') WHERE company_id=@company AND purpose='BANK';UPDATE accounting.account_mappings SET account_id=(SELECT id FROM accounting.accounts WHERE company_id=@company AND code='2010') WHERE company_id=@company AND purpose='AP'",("company",db.Company));var result=await Expect(await CorrectRefund(c,rf,d),HttpStatusCode.Created);var v=result.GetProperty("reversalId").GetGuid();Assert.Equal(110,await Journal(v,"1000","credit"));Assert.Equal(110,await Journal(v,"2000","debit"));Assert.Equal(55,await Journal(RefundId(result),"1000","debit"));Assert.Equal(55,await Journal(RefundId(result),"2000","credit"));Assert.Equal(0,await Journal(RefundId(result),"1010","debit"));await Consistent(c);
    }
    [Fact]
    public async Task Cash_GST_reversal_recalculates_tail_cent_consumed_by_later_refund()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,net:.05m,tax:.01m);var first=RefundId(await Expect(await Refund(c,d,.02m),HttpStatusCode.Created));await Expect(await Refund(c,d,.02m),HttpStatusCode.Created);Assert.Equal(0,await Gst(c,d));var v=Rev(await Expect(await ReverseRefund(c,first),HttpStatusCode.Created));Assert.Equal(.01m,await Gst(c,d));Assert.Equal(.01m,await Journal(v,"1300","debit"));Assert.Equal(.04m,await Balance(d.Line,"refundable_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Old_refund_key_does_not_reactivate_reversed_money()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var key=Code();var input=new SupplierRefundInput(110,Code(),"Actual refund",CreditLineId:d.CreditLine);var rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",input,key:key),HttpStatusCode.Created));await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created);Assert.Equal(rf,RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",input,key:key),HttpStatusCode.Created)));Assert.Equal(110,await Balance(d.Line,"refundable_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Nonrecoverable_GST_is_not_restored_as_input_tax(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis,recoverable:false);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));await Expect(await CorrectRefund(c,rf,d),HttpStatusCode.Created);Assert.Equal(0,await Gst(c,d));Assert.Equal(55,await Balance(d.Line,"refundable_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH","CASH")][InlineData("CASH","NON_CASH")][InlineData("NON_CASH","CASH")][InlineData("NON_CASH","NON_CASH")]
    public async Task Correction_to_another_bill_uses_each_original_GST_policy(string basis,string targetBasis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));await S("UPDATE core.companies SET gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",targetBasis));var b=await Bill(c,d);await Expect(await Pay(c,d,b.Line,110),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{b.Bill}/credits",new ExpenseCreditInput(Code(),"Original target credit",[new(b.Line,110)])),HttpStatusCode.Created);var t=d with{Bill=b.Bill,Line=b.Line,Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};await Expect(await CorrectRefund(c,rf,t),HttpStatusCode.Created);Assert.Equal((basis=="CASH"?10:0)+(targetBasis=="CASH"?5:0),await Gst(c,d));Assert.Equal(110,await Balance(d.Line,"refundable_amount"));Assert.Equal(55,await Balance(t.Line,"refundable_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Credit_transfer_and_refund_correction_cannot_duplicate_restored_credit(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var b=await Bill(c,d);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var results=await Task.WhenAll(Apply(c,d,b.Line),ReplaceRefund(c,v,d,110));Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Created);Assert.Single(results,x=>x.StatusCode==HttpStatusCode.Conflict);await Consistent(c);
    }
    [Fact]
    public async Task Repeated_correction_chain_does_not_exhaust_immutable_historical_credit_totals()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));foreach(var amount in new[]{55m,110m,55m}){rf=RefundId(await Expect(await CorrectRefund(c,rf,d,amount),HttpStatusCode.Created));Assert.Equal(110-amount,await Balance(d.Line,"refundable_amount"));await Consistent(c);}Assert.Equal(1L,await S("SELECT count(*) FROM accounting.active_supplier_refunds WHERE company_id=@company",("company",db.Company)));Assert.Equal(4L,await S("SELECT count(*) FROM accounting.supplier_refunds WHERE company_id=@company",("company",db.Company)));
    }
    [Fact]
    public async Task SQL_commands_recheck_member_permissions_and_reversal_events_are_immutable()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c);var rf=RefundId(await Expect(await Refund(c,d,110),HttpStatusCode.Created));var v=Rev(await Expect(await ReverseRefund(c,rf),HttpStatusCode.Created));var staff=await Staff(db,"OFFICE");await using var source=NpgsqlDataSource.Create(db.App);var access=(await new AccessResolver(source).ResolveAsync(DatabaseFixture.Issuer,staff.Subject,default)).Single(x=>x.CompanyId==db.Company);foreach(var sql in new[]{"SELECT purchase.reverse_supplier_refund(@id,'DIRECT','Reason')","SELECT purchase.replace_supplier_refund(@id,NULL,NULL,1,'DIRECT','Reason')"}){await using var session=new CompanySession(source);await session.BeginAsync(db.Company,access.ActorId,"denied-supplier-refund",default);var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("id",rf)));Assert.Equal("42501",e.SqlState);}foreach(var sql in new[]{"UPDATE accounting.supplier_refund_reversals SET reason='edit' WHERE company_id=@company AND id=@id RETURNING id","UPDATE platform.documents SET business_date=business_date+1 WHERE company_id=@company AND id=@id RETURNING id"}){await using var session=await db.SessionAsync();var e=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(session,sql,default,("company",db.Company),("id",v)));Assert.Contains(e.SqlState,new[]{"42501","23514"});}await Consistent(c);
    }
    private async Task Configure(string basis="CASH",bool registered=true)=>await S("UPDATE core.companies SET gst_basis=@basis,gst_registered=@registered WHERE id=@company",("company",db.Company),("basis",basis),("registered",registered));
    private async Task<Guid> Supplier(HttpClient c)=>await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Supplier settlement test",null));
    private async Task<Data> SetupBill(HttpClient c,string basis="CASH",bool registered=true,Guid? supplier=null,decimal qty=2,decimal cost=10,int invoiceDays=0,int heldDays=0)
    {
        await Configure(basis,registered);var d=await Setup(db,c,0);var sid=supplier??await Supplier(c);
        var po=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(sid,d.Warehouse,[new(d.BoxUnit,qty,cost)])),HttpStatusCode.Created);var oid=po.GetProperty("order").GetProperty("id").GetGuid();
        po=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/confirm",version:1),HttpStatusCode.OK);
        var receipt=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{oid}/receipts",new PurchaseReceiptInput(Code(),[new(po.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty)]),2),HttpStatusCode.Created);
        var today=DateOnly.Parse(receipt.GetProperty("receipt").GetProperty("businessDate").GetString()!,System.Globalization.CultureInfo.InvariantCulture);
        var bill=await Expect(await Send(c,HttpMethod.Post,"/supplier-bills",new SupplierBillInput(sid,Code(),today.AddDays(invoiceDays),today.AddDays(30),today,[new(receipt.GetProperty("lines")[0].GetProperty("id").GetGuid(),qty,D(receipt.GetProperty("receipt").GetProperty("net")),D(receipt.GetProperty("receipt").GetProperty("tax")))],"verified-original",today.AddDays(heldDays))),HttpStatusCode.Created);
        var acct=(Guid)(await S("SELECT id FROM accounting.accounts WHERE company_id=@company AND code='5100'",("company",db.Company)))!;var tax=(Guid)(await S("SELECT id FROM accounting.tax_codes WHERE company_id=@company AND code='GST'",("company",db.Company)))!;
        return new(sid,bill.GetProperty("bill").GetProperty("id").GetGuid(),bill.GetProperty("lines")[0].GetProperty("id").GetGuid(),default,default,acct,tax,today,D(bill.GetProperty("bill").GetProperty("gross")));
    }

    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Stock_return_cost_GRNI_and_credit_are_retained_when_refund_is_corrected(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await SetupBill(c,basis);await Expect(await Pay(c,d,d.Line,d.Gross),HttpStatusCode.Created);var receipt=(Guid)(await S("SELECT r.receipt_id FROM purchase.receipt_lines r JOIN purchase.bill_lines bl ON bl.company_id=r.company_id AND bl.receipt_line_id=r.id WHERE bl.company_id=@company AND bl.id=@id",("company",db.Company),("id",d.Line)))!;var rl=(Guid)(await S("SELECT receipt_line_id FROM purchase.bill_lines WHERE company_id=@company AND id=@id",("company",db.Company),("id",d.Line)))!;var ret=await Expect(await Send(c,HttpMethod.Post,$"/purchase-receipts/{receipt}/returns",new PurchaseReturnInput(Code(),"Verified supplier return",[new(rl,2,d.Line)])),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-bills/{d.Bill}/credits",new SupplierCreditInput(Code(),"Verified returned goods",[new(ret.GetProperty("lines")[0].GetProperty("id").GetGuid(),2)])),HttpStatusCode.Created);d=d with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var rf=RefundId(await Expect(await Refund(c,d,d.Gross),HttpStatusCode.Created));var stock=await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company));var value=await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company));var result=await Expect(await CorrectRefund(c,rf,d,d.Gross/2),HttpStatusCode.Created);Assert.Equal(stock,await S("SELECT sum(on_hand) FROM inventory.stock_balances WHERE company_id=@company",("company",db.Company)));Assert.Equal(value,await S("SELECT sum(value) FROM inventory.stock_values WHERE company_id=@company",("company",db.Company)));Assert.Equal(0,await Journal(result.GetProperty("reversalId").GetGuid(),"1200","debit"));Assert.Equal(0,await Journal(RefundId(result),"2100","debit"));Assert.Equal(d.Gross,await Balance(d.Line,"credited_amount"));await Consistent(c);
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Correction_can_move_prepaid_refund_to_paid_supplier_credit(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,basis);var p=await Advance(c,d,110);var rf=RefundId(await Expect(await Send(c,HttpMethod.Post,"/supplier-refunds",new SupplierRefundInput(110,Code(),"Actual advance refund",AdvanceId:p.Advance)),HttpStatusCode.Created));await Expect(await CorrectRefund(c,rf,d,110),HttpStatusCode.Created);Assert.Equal(110,await Available(p.Advance));Assert.Equal(0,await Balance(d.Line,"refundable_amount"));await Consistent(c);
    }
    [Fact]
    public async Task Closed_source_invoice_period_is_preserved_and_correction_posts_in_current_open_period()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Source(c,paid:false,makeCredit:false);var date=d.Today.AddMonths(-1);await S("INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) SELECT @company,'supplier-refund-history',@date-interval '1 day',@date+interval '1 day' WHERE NOT EXISTS(SELECT 1 FROM accounting.periods WHERE company_id=@company AND starts_on<=@date AND ends_on>@date)",("company",db.Company),("date",date));await S("INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) SELECT @company,id,starts_on,ends_on FROM accounting.fiscal_years WHERE company_id=@company AND label='supplier-refund-history'",("company",db.Company));var b=await Bill(c,d with{Today=date});var old=d with{Today=date,Bill=b.Bill,Line=b.Line};await Expect(await Pay(c,old,old.Line,110),HttpStatusCode.Created);var cn=await Expect(await Send(c,HttpMethod.Post,$"/supplier-expense-bills/{old.Bill}/credits",new ExpenseCreditInput(Code(),"Verified original credit",[new(old.Line,110)])),HttpStatusCode.Created);
        // Credit notes use the current company day; use a current refund and close only its source invoice period.
        old=old with{Credit=cn.GetProperty("credit").GetProperty("id").GetGuid(),CreditLine=cn.GetProperty("lines")[0].GetProperty("id").GetGuid()};var rf=RefundId(await Expect(await Refund(c,old,110),HttpStatusCode.Created));await S("UPDATE accounting.periods SET state='CLOSED' WHERE company_id=@company AND starts_on<=@date AND ends_on>@date",("company",db.Company),("date",date));var result=await Expect(await CorrectRefund(c,rf,old),HttpStatusCode.Created);Assert.Equal(d.Today.ToString("yyyy-MM-dd"),(await Get(c,$"/supplier-refund-reversals/{result.GetProperty("reversalId").GetGuid()}")).GetProperty("reversal").GetProperty("businessDate").GetString());await Consistent(c);
    }
}
