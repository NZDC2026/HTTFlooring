package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
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
class BankAccounts {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    BankAccounts(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    private static final String VIEW="SELECT b.*,a.code,a.active AS gl_active,m.account_id=b.id AS is_default,m.version AS default_mapping_version,coalesce((SELECT sum(l.debit-l.credit)FROM accounting.journal_lines l WHERE l.company_id=b.company_id AND l.account_id=b.id),0)AS signed_balance FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id LEFT JOIN accounting.account_mappings m ON m.company_id=b.company_id AND m.purpose='BANK' WHERE b.company_id=:company";
    @GetMapping("/api/v1/bank-accounts")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"read");return read(scope,request,()->QuoteDrafts.map("currency","AUD","items",query(VIEW+" ORDER BY a.code,b.id",scope,Map.of()).query(rows::row).list()));}
    @GetMapping("/api/v1/bank-accounts/options")
    ResponseEntity<String> options(@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"use");return read(scope,request,()->QuoteDrafts.map("items",query("SELECT b.id,a.code,b.name,b.kind,b.currency,CASE WHEN b.account_number IS NOT NULL THEN '****'||right(b.account_number,4)END AS account_number_masked,m.account_id=b.id AS is_default FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id LEFT JOIN accounting.account_mappings m ON m.company_id=b.company_id AND m.purpose='BANK' WHERE b.company_id=:company AND b.active AND a.active ORDER BY a.code,b.id",scope,Map.of()).query(rows::row).list()));}
    @GetMapping("/api/v1/bank-accounts/{id}")
    ResponseEntity<String> detail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"read");return read(scope,request,()->view(scope,id));}
    @PostMapping("/api/v1/bank-accounts")
    ResponseEntity<String> create(@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(null,input,token,request);}
    @PutMapping("/api/v1/bank-accounts/{id}")
    ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(id,input,token,request);}
    @PutMapping("/api/v1/bank-accounts/default")
    ResponseEntity<String> defaultBank(@RequestBody Default input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"write");readAccess(scope);return response(staff.inCompany(scope,rid(request),()->{
        long version=WarehouseDetails.version(request.getHeader("If-Match"));
        return writes.execute(scope,"PUT /bank-accounts/default",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("version",version,"bankAccountId",input.bankAccountId)),()->{
            query("SELECT accounting.set_default_bank(:bank,:version)",scope,QuoteDrafts.map("bank",input.bankAccountId,"version",version)).query((row,n)->0).single();
            audit.record(scope,"accounting.bank_default_changed","bank_account",input.bankAccountId,rid(request),QuoteDrafts.map("BankAccountId",input.bankAccountId));return stored(200,query("SELECT account_id AS bank_account_id,version FROM accounting.account_mappings WHERE company_id=:company AND purpose='BANK'",scope,Map.of()).query(rows::row).single());
        });
    }));}
    private ResponseEntity<String> save(UUID id,Input input,Jwt token,HttpServletRequest request){var scope=access(token,request,"write");readAccess(scope);return response(staff.inCompany(scope,rid(request),()->{
        String code=code(input.code,"code"),name=text(input.name,"name",200),kind=input.kind;check(kind!=null&&Set.of("BANK","CASH","CARD_CLEARING","LEGACY").contains(kind),"kind","Invalid kind.");check(id!=null||!kind.equals("LEGACY"),"kind","New accounts require an explicit financial identity.");
        String bsb=input.bsb==null?null:input.bsb.replace("-","").replace(" ",""),number=input.accountNumber==null?null:input.accountNumber.replace(" ",""),holder=optional(input.accountHolder,"accountHolder",200);
        check(kind.equals("BANK")?bsb!=null&&bsb.matches("[0-9]{6}")&&number!=null&&number.matches("[0-9]{1,20}")&&holder!=null:bsb==null&&number==null&&holder==null,"bankIdentity","BANK requires six-digit BSB, numeric account number and account holder; cash/card clearing must omit bank details.");Long version=id==null?null:WarehouseDetails.version(request.getHeader("If-Match"));
        var body=QuoteDrafts.map("id",id,"version",version,"code",code,"name",name,"kind",kind,"bsb",bsb,"number",number,"holder",holder,"active",input.active);
        return writes.execute(scope,id==null?"POST /bank-accounts":"PUT /bank-accounts/"+id,request.getHeader("Idempotency-Key"),QuotePricing.canonical(body),()->{
            UUID bank=query("SELECT accounting.configure_bank(CAST(:id AS uuid),CAST(:version AS bigint),:code,:name,:kind,CAST(:bsb AS text),CAST(:number AS text),CAST(:holder AS text),:active)",scope,body).query(UUID.class).single();
            audit.record(scope,id==null?"accounting.bank_created":"accounting.bank_changed","bank_account",bank,rid(request),QuoteDrafts.map("code",code,"name",name,"kind",kind,"accountHolder",holder,"Active",input.active));return stored(id==null?201:200,view(scope,bank));
        });
    }));}
    private void readAccess(StaffScope.CompanyAccess scope){if(!CrmParties.has(scope,"accounting.banks.read"))throw new StaffScope.Failure(403,"permission_denied","Bank maintenance also requires directory read permission.");}
    private Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id){return query(VIEW+" AND b.id=:id",scope,QuoteDrafts.map("id",id)).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),"accounting.banks."+permission);}
    private IdempotentWrite.StoredResponse stored(int status,Object value){return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(value));}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String code;public String name;public String kind;public String bsb;public String accountNumber;public String accountHolder;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Default {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID bankAccountId=ZERO;}
}
