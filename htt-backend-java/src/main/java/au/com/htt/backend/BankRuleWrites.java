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
class BankRuleWrites {
    private final StaffScope staff;private final JdbcClient jdbc;private final BankRuleReads reads;private final IdempotentWrite writes;private final StaffAudit audit;private final LegacyRows rows;private final JsonMapper json;
    BankRuleWrites(StaffScope staff,JdbcClient jdbc,BankRuleReads reads,IdempotentWrite writes,StaffAudit audit,LegacyRows rows,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.reads=reads;this.writes=writes;this.audit=audit;this.rows=rows;this.json=json;}
    @PostMapping("/api/v1/bank-rules")
    ResponseEntity<String> create(@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(null,input,token,request);}
    @PutMapping("/api/v1/bank-rules/{id}")
    ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(id,input,token,request);}
    private ResponseEntity<String> save(UUID id,Input input,Jwt token,HttpServletRequest request){
        var scope=access(token,request,"manage");return response(staff.inCompany(scope,rid(request),()->{
            guard(scope,"manage");var x=validate(input);Long version=id==null?null:WarehouseDetails.version(request.getHeader("If-Match"));
            var old=id==null?null:reads.ruleValue(scope,id);
            if(input.executionMode.equals("AUTO")||old!=null&&old.get("definition").get("executionMode").asString().equals("AUTO"))guard(scope,"auto_execute");
            return writes.execute(scope,id==null?"POST /bank-rules":"PUT /bank-rules/"+id,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"x",x)),()->{
                UUID result=query("SELECT accounting.save_bank_rule(CAST(:id AS uuid),CAST(:version AS bigint),CAST(:data AS jsonb))",scope,QuoteDrafts.map("id",id,"version",version,"data",QuotePricing.canonical(x))).query(UUID.class).single();
                audit.record(scope,"accounting.bank_rule_saved","bank_rule",result,rid(request),Map.of());return stored(id==null?201:200,reads.ruleValue(scope,result));
            });
        }));
    }
    @PostMapping("/api/v1/bank-statement-lines/{id}/rule-preview")
    ResponseEntity<String> preview(@PathVariable UUID id,@RequestBody Preview input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"preview");return response(staff.inCompany(scope,rid(request),()->{
            guard(scope,"preview");String evidence=optional(input.taxInvoiceReference,"taxInvoiceReference",500);var x=QuoteDrafts.map("taxInvoiceReference",evidence,"taxInvoiceHeldOn",input.taxInvoiceHeldOn);
            return writes.execute(scope,"POST /bank-statement-lines/"+id+"/rule-preview",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"x",x)),()->{
                UUID result=query("SELECT accounting.preview_bank_rule(:id,CAST(:evidence AS text),CAST(:held AS date))",scope,QuoteDrafts.map("id",id,"evidence",evidence,"held",input.taxInvoiceHeldOn)).query(UUID.class).single();
                audit.record(scope,"accounting.bank_rule_previewed","bank_rule_preview",result,rid(request),Map.of());return stored(201,reads.previewValue(scope,result));
            });
        }));
    }
    @PostMapping("/api/v1/bank-rule-previews/{id}/execute")
    ResponseEntity<String> execute(@PathVariable UUID id,@RequestBody Execute input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"execute");return response(staff.inCompany(scope,rid(request),()->{
            guard(scope,"execute");for(String cap:List.of("accounting.bank_transactions.post","accounting.bank_transactions.classify"))query("SELECT accounting.require_general_banking(:cap)",scope,QuoteDrafts.map("cap",cap)).query((r,n)->0).single();
            var preview=reads.previewValue(scope,id);if(preview.get("snapshot").get("executionMode").asString("").equals("AUTO"))guard(scope,"auto_execute");
            check(input.noPriorPostingConfirmed,"noPriorPostingConfirmed","Confirm there is no prior invoice, claim or posting; otherwise use existing matching/settlement flows.");
            var x=QuoteDrafts.map("noPriorPostingConfirmed",input.noPriorPostingConfirmed,"reason",text(input.reason,"reason",2000));
            return writes.execute(scope,"POST /bank-rule-previews/"+id+"/execute",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"x",x)),()->{
                UUID result=query("SELECT accounting.execute_bank_rule(:id,:confirm,:reason)",scope,QuoteDrafts.map("id",id,"confirm",input.noPriorPostingConfirmed,"reason",x.get("reason"))).query(UUID.class).single();
                audit.record(scope,"accounting.bank_rule_executed","bank_rule_execution",result,rid(request),Map.of());return stored(201,query("SELECT id,preview_id,source_document_id,reason,created_at,created_by FROM accounting.bank_rule_executions WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",result)).query(rows::row).single());
            });
        }));
    }
    private static Map<String,Object> validate(Input x){
        check(!x.bankAccountId.equals(ZERO)&&x.priority>=1&&x.priority<=10000&&x.condition!=null,"rule","Bank, priority and condition required.");
        choice(x.kind,"kind",Set.of("PAY","RECEIVE"));choice(x.executionMode,"executionMode",Set.of("SUGGEST","AUTO"));
        var c=x.condition;choice(c.field,"field",Set.of("DESCRIPTION","REFERENCE"));choice(c.operator,"operator",Set.of("EQUALS","CONTAINS","STARTS_WITH"));String value=text(c.value,"value",200);check(value.length()>=2,"value","Use at least two literal characters.");
        for(var n:new BigDecimal[]{c.minGross,c.maxGross})if(n!=null){money(n,"gross",2);check(n.signum()>0,"gross","Positive amount required.");}
        check(c.minGross==null||c.maxGross==null||c.minGross.compareTo(c.maxGross)<=0,"gross","Invalid gross range.");
        check(x.lines!=null&&x.lines.size()>=1&&x.lines.size()<=20&&x.lines.stream().allMatch(Objects::nonNull),"lines","Supply 1..20 allocations.");
        var lines=new ArrayList<Map<String,Object>>();BigDecimal total=BigDecimal.ZERO;
        for(var line:x.lines){
            check(!line.accountId.equals(ZERO)&&!line.taxCodeId.equals(ZERO),"lines","Company account and tax code required.");
            for(var n:new BigDecimal[]{line.percent,line.recoverablePercent,line.inputTaxedPercent}){money(n,"percent",4);check(n.compareTo(new BigDecimal("100"))<=0,"percent","Use 0..100 percent.");}
            check(line.percent.signum()>0,"percent","Positive allocation required.");choice(line.basClass,"basClass",BAS);choice(line.cashFlowCategory,"cashFlowCategory",CATEGORIES);
            lines.add(QuoteDrafts.map("accountId",line.accountId,"taxCodeId",line.taxCodeId,"description",text(line.description,"description",500),"basClass",line.basClass,"percent",line.percent,"recoverablePercent",line.recoverablePercent,"inputTaxedPercent",line.inputTaxedPercent,"cashFlowCategory",line.cashFlowCategory));total=total.add(line.percent);
        }
        check(total.compareTo(new BigDecimal("100"))==0,"percent","Allocation percentages must total 100.");
        return QuoteDrafts.map("name",text(x.name,"name",200),"bankAccountId",x.bankAccountId,"kind",x.kind,"priority",x.priority,"enabled",x.enabled,"executionMode",x.executionMode,"condition",QuoteDrafts.map("field",c.field,"operator",c.operator,"value",value,"minGross",c.minGross,"maxGross",c.maxGross),"lines",lines);
    }
    private static void money(BigDecimal n,String field,int scale){SupplierBills.amount(n,field,scale,"999999999999999999.99");}
    private static void choice(String value,String field,Set<String> values){check(value!=null&&values.contains(value),field,"Invalid "+field+".");}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),"accounting.bank_rules."+cap);}
    private void guard(StaffScope.CompanyAccess scope,String cap){query("SELECT accounting.require_bank_rules(:cap)",scope,QuoteDrafts.map("cap","accounting.bank_rules."+cap)).query((r,n)->0).single();}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    private static final Set<String> BAS=Set.of("TAXABLE","EXPORT","OTHER_GST_FREE","INPUT_TAXED","CAPITAL","NON_CAPITAL","EXCLUDED"),CATEGORIES=Set.of("OPERATING","INVESTING","FINANCING");
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String name;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID bankAccountId=ZERO;public String kind;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public int priority;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean enabled;public String executionMode;public Condition condition;public List<Allocation> lines;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Condition {public String field;public String operator;public String value;public BigDecimal minGross;public BigDecimal maxGross;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Allocation {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID accountId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID taxCodeId=ZERO;public String description;public String basClass;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal percent=new BigDecimal("100");@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal recoverablePercent=BigDecimal.ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal inputTaxedPercent=BigDecimal.ZERO;public String cashFlowCategory="OPERATING";}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Preview {public String taxInvoiceReference;public LocalDate taxInvoiceHeldOn;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Execute {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean noPriorPostingConfirmed;public String reason;}
}
