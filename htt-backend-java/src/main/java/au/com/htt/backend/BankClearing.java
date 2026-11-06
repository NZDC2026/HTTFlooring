package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
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
class BankClearing {
    private final StaffScope staff;private final JdbcClient jdbc;private final BankStatementReads reads;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
    BankClearing(StaffScope staff,JdbcClient jdbc,BankStatementReads reads,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.reads=reads;this.writes=writes;this.audit=audit;this.json=json;}
    @PostMapping("/api/v1/bank-statement-lines/{id}/matches")
    ResponseEntity<String> match(@PathVariable UUID id,@RequestBody Match input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"match");return response(staff.inCompany(scope,rid(request),()->{
        var source=query("SELECT bank_account_id,statement_id FROM accounting.bank_statement_lines WHERE company_id=:company AND id=:id",scope,QuoteDrafts.map("id",id)).query((r,n)->new Source(r.getObject("bank_account_id",UUID.class),r.getObject("statement_id",UUID.class))).optional().orElseThrow(BankClearing::missing);reads.bank(scope,source.bank());
        long expected=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);var rows=allocations(input.allocations,false,100);
        return writes.execute(scope,"POST /bank-statement-lines/"+id+"/matches",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason,"rows",rows)),()->{
            UUID mid=query("SELECT accounting.match_bank_line(:id,:expected,:reference,:reason,CAST(:items AS jsonb))",scope,QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason,"items",array(rows))).query(UUID.class).single();
            audit.record(scope,"accounting.bank_matched","bank_match",mid,rid(request),QuoteDrafts.map("statementLineId",id,"reference",reference));return stored(201,mid,reads.view(scope,source.statement()));
        });
    }));}
    @PostMapping("/api/v1/bank-statements/{id}/reconcile")
    ResponseEntity<String> reconcile(@PathVariable UUID id,@RequestBody Reconcile input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"reconcile");return response(staff.inCompany(scope,rid(request),()->{
        reads.bank(scope,reads.owner(scope,"accounting.bank_statements",id));long expected=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);var rows=allocations(input.openingAllocations,true,5000);
        return writes.execute(scope,"POST /bank-statements/"+id+"/reconcile",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason,"rows",rows)),()->{
            UUID result=query("SELECT accounting.finalize_bank_reconciliation(:id,:expected,:reference,:reason,CAST(:items AS jsonb))",scope,QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason,"items",array(rows))).query(UUID.class).single();
            audit.record(scope,"accounting.bank_reconciled","bank_reconciliation",result,rid(request),QuoteDrafts.map("statementId",id,"reference",reference));return stored(201,result,reads.view(scope,id));
        });
    }));}
    @PostMapping("/api/v1/bank-matches/{id}/release")
    ResponseEntity<String> release(@PathVariable UUID id,@RequestBody Change input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,"release",token,request);}
    @PostMapping("/api/v1/bank-statements/{id}/void")
    ResponseEntity<String> voidStatement(@PathVariable UUID id,@RequestBody Change input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,"void",token,request);}
    @PostMapping("/api/v1/bank-reconciliations/{id}/reopen")
    ResponseEntity<String> reopen(@PathVariable UUID id,@RequestBody Change input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return change(id,input,"reopen",token,request);}
    private ResponseEntity<String> change(UUID id,Change input,String op,Jwt token,HttpServletRequest request){
        var scope=access(token,request,op.equals("release")?"match":op);return response(staff.inCompany(scope,rid(request),()->{
            String select=op.equals("release")?"SELECT l.bank_account_id,l.statement_id FROM accounting.bank_matches m JOIN accounting.bank_statement_lines l ON l.company_id=m.company_id AND l.id=m.statement_line_id WHERE m.company_id=:company AND m.id=:id":op.equals("reopen")?"SELECT bank_account_id,statement_id FROM accounting.bank_reconciliations WHERE company_id=:company AND id=:id":"SELECT bank_account_id,id AS statement_id FROM accounting.bank_statements WHERE company_id=:company AND id=:id";
            var source=query(select,scope,QuoteDrafts.map("id",id)).query((r,n)->new Source(r.getObject("bank_account_id",UUID.class),r.getObject("statement_id",UUID.class))).optional().orElseThrow(BankClearing::missing);reads.bank(scope,source.bank());
            long expected=WarehouseDetails.version(request.getHeader("If-Match"));String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
            String route="POST /"+(op.equals("release")?"bank-matches":op.equals("reopen")?"bank-reconciliations":"bank-statements")+"/"+id+"/"+op;
            String function=op.equals("release")?"release_bank_match":op.equals("reopen")?"reopen_bank_reconciliation":"void_bank_statement";
            String action=op.equals("release")?"bank_match_released":op.equals("reopen")?"bank_reconciliation_reopened":"bank_statement_voided";
            String entity=op.equals("release")?"bank_match_release":op.equals("reopen")?"bank_reconciliation_reopen":"bank_statement";
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason)),()->{
                UUID changed=query("SELECT accounting."+function+"(:id,:expected,:reference,:reason)",scope,QuoteDrafts.map("id",id,"expected",expected,"reference",reference,"reason",reason)).query(UUID.class).single();
                audit.record(scope,"accounting."+action,entity,changed,rid(request),QuoteDrafts.map("statementId",source.statement(),"reference",reference,"reason",reason));return stored(200,changed,reads.view(scope,source.statement()));
            });
        }));
    }
    private static List<Map<String,Object>> allocations(List<Allocation> input,boolean empty,int limit){var lines=input==null?List.<Allocation>of():input;check(lines.size()<=limit&&(empty||!lines.isEmpty())&&lines.stream().allMatch(x->x!=null&&!x.journalLineId.equals(ZERO))&&lines.stream().map(x->x.journalLineId).distinct().count()==lines.size(),"allocations","Distinct cash-entry IDs and bounded allocations required.");var sorted=new ArrayList<>(lines);sorted.sort(Comparator.comparing(x->x.journalLineId.toString()));var result=new ArrayList<Map<String,Object>>();for(var line:sorted){SupplierBills.amount(line.amount,"amount",2,"999999999999999999.99");check(line.amount.signum()>0,"amount","Positive AUD cents required.");result.add(QuoteDrafts.map("journalLineId",line.journalLineId,"amount",line.amount));}return result;}
    private String array(List<Map<String,Object>> rows){return QuotePricing.value(rows);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String command){var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.bank_statements."+command);for(String cap:List.of("accounting.bank_statements.read","accounting.banks.read","accounting.ledger.read"))if(!CrmParties.has(scope,cap))throw new StaffScope.Failure(403,"permission_denied","Statement, bank-directory and ledger read permissions required.");return scope;}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private IdempotentWrite.StoredResponse stored(int status,UUID id,Object statement){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(QuoteDrafts.map("id",id,"statement",statement)));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result){return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private record Source(UUID bank,UUID statement){}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static class Change {public String reference;public String reason;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Match extends Change {public List<Allocation> allocations;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Reconcile extends Change {public List<Allocation> openingAllocations;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Allocation {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID journalLineId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;}
}
