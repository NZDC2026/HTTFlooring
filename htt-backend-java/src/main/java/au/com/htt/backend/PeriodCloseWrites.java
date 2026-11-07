package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
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
class PeriodCloseWrites {
    private final StaffScope staff;private final JdbcClient jdbc;private final PeriodCloseReads reads;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
    PeriodCloseWrites(StaffScope staff,JdbcClient jdbc,PeriodCloseReads reads,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.reads=reads;this.writes=writes;this.audit=audit;this.json=json;}
    @PostMapping("/api/v1/accounting/fiscal-years")
    ResponseEntity<String> create(@RequestBody Year input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.periods.manage");return response(staff.inCompany(scope,rid(request),()->{
            String label=text(input.label,"label",200);check(input.from.getYear()>=2&&input.from.getYear()<=9998&&input.from.getDayOfMonth()==1&&input.to.equals(input.from.plusYears(1)),"from","Supply one full fiscal year.");
            return writes.execute(scope,"POST /accounting/fiscal-years",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("label",label,"from",input.from,"to",input.to)),()->{
                UUID id=query("SELECT accounting.create_fiscal_year(:label,:from,:to)",scope,QuoteDrafts.map("label",label,"from",input.from,"to",input.to)).query(UUID.class).single();
                audit.record(scope,"accounting.fiscal_year_created","fiscal_year",id,rid(request),Map.of());return stored(201,reads.year(scope,id));
            });
        }));
    }
    @PutMapping("/api/v1/accounting/retained-earnings")
    ResponseEntity<String> retained(@RequestBody Retained input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting.periods.manage");return response(staff.inCompany(scope,rid(request),()->{
            long version=zeroVersion(request.getHeader("If-Match"));String reason=text(input.reason,"reason",2000);
            return writes.execute(scope,"PUT /accounting/retained-earnings",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("version",version,"accountId",input.accountId,"reason",reason)),()->{
                long next=query("SELECT accounting.configure_retained(:id,:version)",scope,QuoteDrafts.map("id",input.accountId,"version",version)).query(Long.class).single();
                audit.record(scope,"accounting.retained_earnings_configured","account",input.accountId,rid(request),QuoteDrafts.map("reason",reason));return stored(200,QuoteDrafts.map("accountId",input.accountId,"version",next));
            });
        }));
    }
    @PostMapping("/api/v1/accounting/periods/{id}/close")
    ResponseEntity<String> closePeriod(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,false,"close",input,token,request);}
    @PostMapping("/api/v1/accounting/periods/{id}/reopen")
    ResponseEntity<String> reopenPeriod(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,false,"reopen",input,token,request);}
    @PostMapping("/api/v1/accounting/fiscal-years/{id}/close")
    ResponseEntity<String> closeYear(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,true,"close",input,token,request);}
    @PostMapping("/api/v1/accounting/fiscal-years/{id}/reopen")
    ResponseEntity<String> reopenYear(@PathVariable UUID id,@RequestBody Action input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return transition(id,true,"reopen",input,token,request);}
    private ResponseEntity<String> transition(UUID id,boolean year,String action,Action input,Jwt token,HttpServletRequest request){
        var scope=access(token,request,"accounting."+(year?"years.":"periods.")+action);return response(staff.inCompany(scope,rid(request),()->{
            if(year)reads.year(scope,id);else reads.period(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
            check(!input.basNotApplicableConfirmed||!year&&action.equals("close"),"basNotApplicableConfirmed","This confirmation applies only to period close.");
            String route="POST /accounting/"+(year?"fiscal-years":"periods")+"/"+id+"/"+action;
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"reference",reference,"reason",reason,"basNotApplicableConfirmed",input.basNotApplicableConfirmed)),()->{
                String function=year?(action.equals("close")?"close_fiscal_year":"reopen_fiscal_year"):(action.equals("close")?"close_period":"reopen_period");
                var args=QuoteDrafts.map("id",id,"version",version,"reference",reference,"reason",reason);String extra="";
                if(!year&&action.equals("close")){extra=",:na";args.put("na",input.basNotApplicableConfirmed);}
                UUID evidence=query("SELECT accounting."+function+"(:id,:version,:reference,:reason"+extra+")",scope,args).query(UUID.class).single();
                audit.record(scope,"accounting."+(year?"year_":"period_")+action,"fiscal_"+(year?"year":"period"),id,rid(request),QuoteDrafts.map("reference",reference,"reason",reason,"BasNotApplicableConfirmed",input.basNotApplicableConfirmed));return stored(200,QuoteDrafts.map("entity",year?reads.year(scope,id):reads.period(scope,id),"evidenceId",evidence));
            });
        }));
    }
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);for(String read:List.of("accounting.periods.read","accounting.bas.read","accounting.ledger.read","accounting.gst.read","purchase.input_gst.read","accounting.reconciliation.read"))if(!CrmParties.has(scope,read))throw new StaffScope.Failure(403,"permission_denied","Accounting close requires period, reconciliation, ledger, BAS and GST read permissions.");return scope;}
    private static long zeroVersion(String header){try{String value=MasterDataChecks.trim((header==null?"":header).replaceAll("^\\\"+|\\\"+$",""));if(!value.matches("[+-]?[0-9]+"))throw new NumberFormatException();long version=Long.parseLong(value);if(version<0)throw new NumberFormatException();return version;}catch(NumberFormatException invalid){throw new StaffScope.Failure(428,"version_required","Current If-Match required.");}}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(body));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Year {public String label;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate from=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate to=LocalDate.of(1,1,1);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Retained {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID accountId=new UUID(0,0);public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Action {public String reference;public String reason;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean basNotApplicableConfirmed;}
}
