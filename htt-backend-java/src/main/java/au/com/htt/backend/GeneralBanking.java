package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class GeneralBanking {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    GeneralBanking(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    private static final List<String> READ_CAPS=List.of("accounting.bank_transactions.read","accounting.banks.read","accounting.ledger.read","accounting.gst.read","purchase.input_gst.read");
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap,boolean classify){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);
        for(String permission:READ_CAPS)if(!CrmParties.has(scope,permission))throw new StaffScope.Failure(403,"permission_denied","General banking, directory, ledger and GST read permissions required.");
        if(!cap.equals("accounting.bank_transactions.read")){
            var needed=new ArrayList<>(List.of(cap,"accounting.banks.use","accounting.cash_flow.classify","accounting.reports.read"));if(classify)needed.addAll(List.of("accounting.bank_transactions.post","accounting.bank_statements.read","accounting.bank_statements.match"));
            for(String permission:needed)if(!CrmParties.has(scope,permission))throw new StaffScope.Failure(403,"permission_denied","General banking command and related cash/report permissions required.");
        }return scope;
    }
    @GetMapping("/api/v1/bank-transactions/{id}")
    ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.read",false);return read(scope,request,()->detail(scope,id));}
    @GetMapping("/api/v1/bank-transactions")
    ResponseEntity<String> list(@RequestParam(required=false) UUID bankAccountId,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.read",false);return read(scope,request,()->{
        int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=query("SELECT h.*,d.number,d.version,EXISTS(SELECT 1 FROM accounting.bank_transaction_reversals v WHERE v.company_id=h.company_id AND v.original_id=h.id)AS reversed FROM accounting.bank_transactions h JOIN platform.documents d ON d.company_id=h.company_id AND d.id=h.id WHERE h.company_id=:company AND(CAST(:bank AS uuid) IS NULL OR h.bank_account_id=:bank OR h.counter_bank_account_id=:bank)ORDER BY h.occurred_on DESC,h.id LIMIT :size OFFSET :offset",scope,QuoteDrafts.map("bank",bankAccountId,"size",size,"offset",(p-1)*size)).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);
    });}
    @PostMapping("/api/v1/bank-transactions")
    ResponseEntity<String> post(@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.post",false);return response(staff.inCompany(scope,rid(request),()->{
        var x=validate(input);return writes.execute(scope,"POST /bank-transactions",request.getHeader("Idempotency-Key"),QuotePricing.canonical(x),()->{UUID id=postSql(scope,x,null,null);audit.record(scope,"accounting.general_bank_posted","bank_transaction",id,rid(request),Map.of());return stored(201,detail(scope,id));});
    }));}
    @PostMapping("/api/v1/bank-transfers")
    ResponseEntity<String> transfer(@RequestBody Transfer input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.transfer",false);return response(staff.inCompany(scope,rid(request),()->{
        check(!input.fromBankAccountId.equals(ZERO)&&!input.toBankAccountId.equals(ZERO)&&!input.fromBankAccountId.equals(input.toBankAccountId)&&input.transferredOn.getYear()>=2,"banks","Distinct company banks and date required.");amount(input.amount,"amount",2);check(input.amount.signum()>0,"amount","Positive AUD cents required.");if(input.boundaryActivity!=null)choice(input.boundaryActivity,"boundaryActivity",CATEGORIES);
        String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);var x=QuoteDrafts.map("fromBankAccountId",input.fromBankAccountId,"toBankAccountId",input.toBankAccountId,"transferredOn",input.transferredOn,"amount",input.amount,"reference",reference,"reason",reason,"boundaryActivity",input.boundaryActivity);
        return writes.execute(scope,"POST /bank-transfers",request.getHeader("Idempotency-Key"),QuotePricing.canonical(x),()->{
            UUID id=query("SELECT accounting.post_general_banking('TRANSFER',:bank,:other,:date,:reference,:reason,'[]',:amount,CAST(:category AS text),false,NULL,NULL)",scope,QuoteDrafts.map("bank",input.fromBankAccountId,"other",input.toBankAccountId,"date",input.transferredOn,"reference",reference,"reason",reason,"amount",input.amount,"category",input.boundaryActivity)).query(UUID.class).single();audit.record(scope,"accounting.bank_transferred","bank_transaction",id,rid(request),Map.of());return stored(201,detail(scope,id));
        });
    }));}
    @PostMapping("/api/v1/bank-statement-lines/{id}/classify")
    ResponseEntity<String> classify(@PathVariable UUID id,@RequestBody Classification input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.classify",true);return response(staff.inCompany(scope,rid(request),()->{
        var line=query("SELECT bank_account_id,transaction_date,amount FROM accounting.bank_statement_lines WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query((row,n)->new StatementLine(row.getObject("bank_account_id",UUID.class),row.getObject("transaction_date",LocalDate.class),row.getBigDecimal("amount"))).optional().orElseThrow(GeneralBanking::missing);long version=WarehouseDetails.version(request.getHeader("If-Match"));
        var command=new Input();command.kind=line.amount().signum()>0?"RECEIVE":"PAY";command.bankAccountId=line.bank();command.occurredOn=line.date();command.reference=input.reference;command.reason=input.reason;command.noPriorPostingConfirmed=input.noPriorPostingConfirmed;command.lines=input.lines;command.taxInvoiceReference=input.taxInvoiceReference;command.taxInvoiceHeldOn=input.taxInvoiceHeldOn;var x=validate(command);
        return writes.execute(scope,"POST /bank-statement-lines/"+id+"/classify",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"x",x)),()->{UUID doc=postSql(scope,x,id,version);audit.record(scope,"accounting.bank_line_classified","bank_transaction",doc,rid(request),QuoteDrafts.map("statementLineId",id));return stored(201,detail(scope,doc));});
    }));}
    @PostMapping("/api/v1/bank-transactions/{id}/reverse")
    ResponseEntity<String> reverse(@PathVariable UUID id,@RequestBody Reversal input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"accounting.bank_transactions.reverse",false);return response(staff.inCompany(scope,rid(request),()->{
        detail(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);var x=QuoteDrafts.map("reference",reference,"reason",reason);
        return writes.execute(scope,"POST /bank-transactions/"+id+"/reverse",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"x",x)),()->{
            UUID reversal=query("SELECT accounting.reverse_general_banking(:id,:version,:ref,:reason)",scope,QuoteDrafts.map("id",id,"version",version,"ref",reference,"reason",reason)).query(UUID.class).single();audit.record(scope,"accounting.general_bank_reversed","bank_transaction",id,rid(request),QuoteDrafts.map("reversalId",reversal));return stored(200,detail(scope,id));
        });
    }));}
    private Map<String,Object> validate(Input x){
        choice(x.kind,"kind",Set.of("RECEIVE","PAY"));check(x.occurredOn.getYear()>=2&&!x.bankAccountId.equals(ZERO),"date","Valid cash date and bank required.");check(x.noPriorPostingConfirmed,"noPriorPostingConfirmed","Confirm there is no prior invoice, tax claim or ledger posting; otherwise use existing invoice/settlement flows.");
        String reference=text(x.reference,"reference",200),reason=text(x.reason,"reason",2000);var lines=lines(x.lines);String evidence=optional(x.taxInvoiceReference,"taxInvoiceReference",500);return QuoteDrafts.map("kind",x.kind,"bankAccountId",x.bankAccountId,"occurredOn",x.occurredOn,"reference",reference,"reason",reason,"noPriorPostingConfirmed",x.noPriorPostingConfirmed,"lines",lines,"taxInvoiceReference",evidence,"taxInvoiceHeldOn",x.taxInvoiceHeldOn);
    }
    private List<Map<String,Object>> lines(List<Line> input){
        check(input!=null&&!input.isEmpty()&&input.size()<=50&&input.stream().allMatch(Objects::nonNull),"lines","Supply 1..50 settled lines.");var result=new ArrayList<Map<String,Object>>();
        for(var x:input){check(!x.accountId.equals(ZERO)&&!x.taxCodeId.equals(ZERO),"lines","Company account and tax code IDs required.");amount(x.net,"net",2);amount(x.tax,"tax",2);check(x.net.signum()>0&&x.tax.signum()>=0,"lines","Positive net and nonnegative tax required.");if(x.recoverableTax!=null){amount(x.recoverableTax,"recoverableTax",2);check(x.recoverableTax.compareTo(x.tax)<=0,"recoverableTax","Claim cannot exceed tax.");}amount(x.inputTaxedPercent,"inputTaxedPercent",4);check(x.inputTaxedPercent.compareTo(new BigDecimal("100"))<=0,"inputTaxedPercent","Use 0..100.");choice(x.basClass,"basClass",BAS);choice(x.cashFlowCategory,"cashFlowCategory",CATEGORIES);String description=text(x.description,"description",500);
            result.add(QuoteDrafts.map("accountId",x.accountId,"description",description,"net",x.net,"tax",x.tax,"taxCodeId",x.taxCodeId,"basClass",x.basClass,"cashFlowCategory",x.cashFlowCategory,"recoverableTax",x.recoverableTax,"inputTaxedPercent",x.inputTaxedPercent));
        }return result;
    }
    private UUID postSql(StaffScope.CompanyAccess scope,Map<String,Object> x,UUID statement,Long version){var args=QuoteDrafts.map("kind",x.get("kind"),"bank",x.get("bankAccountId"),"date",x.get("occurredOn"),"reference",x.get("reference"),"reason",x.get("reason"),"lines",QuotePricing.value(x.get("lines")),"confirm",x.get("noPriorPostingConfirmed"),"evidence",x.get("taxInvoiceReference"),"held",x.get("taxInvoiceHeldOn"),"statement",statement,"version",version);
        return query("SELECT accounting.post_general_banking(:kind,:bank,NULL,:date,:reference,:reason,CAST(:lines AS jsonb),NULL,NULL,:confirm,CAST(:evidence AS text),CAST(:held AS date),CAST(:statement AS uuid),CAST(:version AS bigint))",scope,args).query(UUID.class).single();
    }
    private Object detail(StaffScope.CompanyAccess scope,UUID id){String body=query(DETAIL_SQL,scope,QuoteDrafts.map("id",id)).query(String.class).optional().orElseThrow(GeneralBanking::missing);return json.readTree(body);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static void amount(BigDecimal value,String field,int precision){SupplierBills.amount(value,field,precision,"999999999999999999.99");}
    private static void choice(String value,String field,Set<String> choices){check(value!=null&&choices.contains(value),field,"Invalid "+field+".");}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,Object> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private IdempotentWrite.StoredResponse stored(int status,Object value){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(value));}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private record StatementLine(UUID bank,LocalDate date,BigDecimal amount){}
    private static final UUID ZERO=new UUID(0,0);private static final LocalDate MIN=LocalDate.of(1,1,1);
    private static final Set<String> CATEGORIES=Set.of("OPERATING","INVESTING","FINANCING"),BAS=Set.of("TAXABLE","EXPORT","OTHER_GST_FREE","INPUT_TAXED","CAPITAL","NON_CAPITAL","EXCLUDED");
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID accountId=ZERO;
        public String description;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal net=BigDecimal.ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal tax=BigDecimal.ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID taxCodeId=ZERO;
        public String basClass;public String cashFlowCategory="OPERATING";public BigDecimal recoverableTax;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal inputTaxedPercent=BigDecimal.ZERO;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static class Classification {public String reference;public String reason;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean noPriorPostingConfirmed;public List<Line> lines;public String taxInvoiceReference;public LocalDate taxInvoiceHeldOn;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input extends Classification {public String kind;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID bankAccountId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate occurredOn=MIN;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Transfer {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID fromBankAccountId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID toBankAccountId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate transferredOn=MIN;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;public String reference;public String reason;public String boundaryActivity;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Reversal {public String reference;public String reason;}
    private static final String DETAIL_SQL = """
SELECT jsonb_build_object('transaction',jsonb_build_object('id',h.id,'companyId',h.company_id,'kind',h.kind,'bankAccountId',h.bank_account_id,'counterBankAccountId',h.counter_bank_account_id,'occurredOn',h.occurred_on,'reference',h.reference,'reason',h.reason,'gstBasis',h.gst_basis,'gstRegistered',h.gst_registered,'gross',h.gross::text,'journalEntryId',h.journal_entry_id,'statementLineId',h.statement_line_id,'createdAt',h.created_at,'createdBy',h.created_by,'number',d.number,'version',d.version,'state',CASE WHEN EXISTS(SELECT 1 FROM accounting.bank_transaction_reversals v WHERE v.company_id=h.company_id AND v.original_id=h.id)THEN'REVERSED'ELSE'POSTED'END),'lines',coalesce((SELECT jsonb_agg(jsonb_build_object('id',l.id,'lineNo',l.line_no,'accountId',l.account_id,'description',l.description,'net',l.net::text,'tax',l.tax::text,'recoverableTax',l.recoverable_tax::text,'taxCodeId',l.tax_code_id,'taxCategory',l.tax_category,'taxRate',l.tax_rate::text,'taxAccountId',l.tax_account_id,'basClass',l.bas_class,'inputTaxedPercent',l.input_taxed_percent::text,'cashFlowCategory',l.cash_flow_category,'snapshot',l.snapshot)ORDER BY line_no)FROM accounting.bank_transaction_lines l WHERE l.company_id=h.company_id AND l.transaction_id=h.id),'[]'::jsonb),'reversal',(SELECT jsonb_build_object('id',v.id,'originalId',v.original_id,'reference',v.reference,'reason',v.reason,'journalEntryId',v.journal_entry_id,'createdAt',v.created_at,'createdBy',v.created_by)FROM accounting.bank_transaction_reversals v WHERE v.company_id=h.company_id AND v.original_id=h.id),'activeMatches',coalesce((SELECT jsonb_agg(DISTINCT m.id)FROM accounting.active_bank_matches m JOIN accounting.bank_match_allocations a ON a.company_id=m.company_id AND a.match_id=m.id JOIN accounting.journal_lines l ON l.company_id=a.company_id AND l.id=a.journal_line_id WHERE l.company_id=h.company_id AND l.journal_entry_id=h.journal_entry_id),'[]'::jsonb))::text AS result FROM accounting.bank_transactions h JOIN platform.documents d ON d.company_id=h.company_id AND d.id=h.id WHERE h.company_id=:company AND h.id=:id
""";
}
