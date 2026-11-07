package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
class BasWrites {
    private final StaffScope staff;private final JdbcClient jdbc;private final BasReads reads;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
    BasWrites(StaffScope staff,JdbcClient jdbc,BasReads reads,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.reads=reads;this.writes=writes;this.audit=audit;this.json=json;}
    @PostMapping("/api/v1/accounting/bas-periods")
    ResponseEntity<String> create(@RequestBody Period input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"manage");return response(staff.inCompany(scope,rid(request),()->{
            String reference=text(input.reference,"reference",200);choice(input.cadence,"cadence",Set.of("MONTHLY","QUARTERLY","ANNUAL","CUSTOM"));choice(input.gstBasis,"gstBasis",Set.of("CASH","NON_CASH"));methods(input.reportingMethod,input.calculationMethod);
            check(input.registrationConfirmed&&input.from.getYear()>=2&&input.to.isAfter(input.from)&&ChronoUnit.DAYS.between(input.from,input.to)<=366,"from","Confirm GST registration and supply valid dates.");
            var x=QuoteDrafts.map("reference",reference,"from",input.from,"to",input.to,"cadence",input.cadence,"gstBasis",input.gstBasis,"reportingMethod",input.reportingMethod,"registrationConfirmed",input.registrationConfirmed,"dueOn",input.dueOn);
            if(input.reportingMethod.equals("FULL"))x.put("calculationMethod",input.calculationMethod);
            return writes.execute(scope,"POST /accounting/bas-periods",request.getHeader("Idempotency-Key"),QuotePricing.canonical(x),()->{
                UUID id=query("SELECT accounting.create_bas_period_full(:reference,:from,:to,:cadence,:basis,:method,:registered,CAST(:due AS date),:calculation)",scope,QuoteDrafts.map("reference",reference,"from",input.from,"to",input.to,"cadence",input.cadence,"basis",input.gstBasis,"method",input.reportingMethod,"registered",input.registrationConfirmed,"due",input.dueOn,"calculation",input.calculationMethod)).query(UUID.class).single();
                audit.record(scope,"accounting.bas_period_created","bas_period",id,rid(request),Map.of());return stored(201,reads.period(scope,id));
            });
        }));
    }
    @PutMapping("/api/v1/accounting/bas-periods/{id}/method")
    ResponseEntity<String> method(@PathVariable UUID id,@RequestBody Method input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"manage");return response(staff.inCompany(scope,rid(request),()->{
            reads.period(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));methods(input.reportingMethod,input.calculationMethod);String reason=text(input.reason,"reason",2000);
            return writes.execute(scope,"PUT /accounting/bas-periods/"+id+"/method",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"reportingMethod",input.reportingMethod,"calculationMethod",input.calculationMethod,"reason",reason)),()->{
                query("SELECT accounting.bas_change_method(:id,:version,:reporting,:calculation,:reason)",scope,QuoteDrafts.map("id",id,"version",version,"reporting",input.reportingMethod,"calculation",input.calculationMethod,"reason",reason)).query((r,n)->0).single();
                audit.record(scope,"accounting.bas_method_changed","bas_period",id,rid(request),QuoteDrafts.map("ReportingMethod",input.reportingMethod,"CalculationMethod",input.calculationMethod,"reason",reason));return stored(200,reads.period(scope,id));
            });
        }));
    }
    @PutMapping("/api/v1/accounting/bas-classifications/{kind}/{id}")
    ResponseEntity<String> classify(@PathVariable String kind,@PathVariable UUID id,@RequestBody Classification input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"classify");return response(staff.inCompany(scope,rid(request),()->{
            reads.target(scope,kind,id);long version=zeroVersion(request.getHeader("If-Match"));String reason=text(input.reason,"reason",2000);choice(input.salesClass,"salesClass",Set.of("AUTO","TAXABLE","EXPORT","OTHER_GST_FREE","INPUT_TAXED","EXCLUDED"));choice(input.purchaseClass,"purchaseClass",Set.of("AUTO","CAPITAL","NON_CAPITAL","EXCLUDED"));
            if(input.inputTaxedPercent!=null){SupplierBills.amount(input.inputTaxedPercent,"inputTaxedPercent",4,"999999999999999999.99");check(input.inputTaxedPercent.compareTo(new BigDecimal("100"))<=0,"inputTaxedPercent","Use a percentage in 0..100.");}
            return writes.execute(scope,"PUT /accounting/bas-classifications/"+kind+"/"+id,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("kind",kind,"id",id,"version",version,"salesClass",input.salesClass,"purchaseClass",input.purchaseClass,"inputTaxedPercent",input.inputTaxedPercent,"reason",reason)),()->{
                UUID cid=query("SELECT accounting.bas_classify(:kind,:id,:version,:sales,:purchase,CAST(:percent AS numeric),:reason)",scope,QuoteDrafts.map("kind",kind,"id",id,"version",version,"sales",input.salesClass,"purchase",input.purchaseClass,"percent",input.inputTaxedPercent,"reason",reason)).query(UUID.class).single();
                audit.record(scope,"accounting.bas_classified","bas_classification",cid,rid(request),QuoteDrafts.map("targetKind",kind,"targetId",id,"reason",reason));return stored(200,QuoteDrafts.map("id",cid,"revision",version+1));
            });
        }));
    }
    @PostMapping("/api/v1/accounting/bas-periods/{id}/finalize")
    ResponseEntity<String> finalizePeriod(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,"FINALIZED","finalize","finalize",input,token,request);}
    @PostMapping("/api/v1/accounting/bas-periods/{id}/reopen")
    ResponseEntity<String> reopen(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,"REOPENED","reopen","reopen",input,token,request);}
    @PostMapping("/api/v1/accounting/bas-periods/{id}/record-lodgement")
    ResponseEntity<String> lodged(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,"LODGED","record-lodgement","lodged",input,token,request);}
    private ResponseEntity<String> transition(UUID id,String action,String path,String cap,Action input,Jwt token,HttpServletRequest request){
        var scope=access(token,request,cap);return response(staff.inCompany(scope,rid(request),()->{
            reads.period(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);check(action.equals("LODGED")||input.lodgedOn==null,"lodgedOn","Lodgement date applies only to recording external lodgement.");
            return writes.execute(scope,"POST /accounting/bas-periods/"+id+"/"+path,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"reference",reference,"reason",reason,"lodgedOn",input.lodgedOn)),()->{
                UUID snapshot=query("SELECT accounting.bas_transition(:id,:version,:action,:reference,:reason,CAST(:date AS date))",scope,QuoteDrafts.map("id",id,"version",version,"action",action,"reference",reference,"reason",reason,"date",input.lodgedOn)).query(UUID.class).single();
                audit.record(scope,"accounting.bas_"+path.replace('-','_'),"bas_period",id,rid(request),QuoteDrafts.map("snapshotId",snapshot,"reference",reference,"reason",reason,"LodgedOn",input.lodgedOn));return stored(200,QuoteDrafts.map("period",reads.period(scope,id),"snapshotId",snapshot));
            });
        }));
    }
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.bas."+cap);for(String read:List.of("accounting.bas.read","accounting.ledger.read","accounting.gst.read","purchase.input_gst.read"))if(!CrmParties.has(scope,read))throw new StaffScope.Failure(403,"permission_denied","BAS, ledger and both GST reading permissions required.");return scope;}
    private static void methods(String reporting,String calculation){choice(reporting,"reportingMethod",Set.of("SIMPLER","FULL"));choice(calculation,"calculationMethod",Set.of("ACCOUNTS","WORKSHEET"));check(reporting.equals("FULL")||calculation.equals("ACCOUNTS"),"calculationMethod","Worksheet requires FULL reporting.");}
    private static void choice(String value,String field,Set<String> values){check(value!=null&&values.contains(value),field,"Invalid "+field+".");}
    private static long zeroVersion(String header){try{String value=MasterDataChecks.trim((header==null?"":header).replaceAll("^\\\"+|\\\"+$",""));if(!value.matches("[+-]?[0-9]+"))throw new NumberFormatException();long version=Long.parseLong(value);if(version<0)throw new NumberFormatException();return version;}catch(NumberFormatException invalid){throw new StaffScope.Failure(428,"version_required","Current If-Match required; use zero for an unclassified source.");}}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Period {public String reference;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate from=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate to=LocalDate.of(1,1,1);public String cadence;public String gstBasis;public String reportingMethod;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean registrationConfirmed;public LocalDate dueOn;public String calculationMethod="ACCOUNTS";}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Method {public String reportingMethod;public String calculationMethod;public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Classification {public String salesClass;public String purchaseClass;public BigDecimal inputTaxedPercent;public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Action {public String reference;public String reason;public LocalDate lodgedOn;}
}
