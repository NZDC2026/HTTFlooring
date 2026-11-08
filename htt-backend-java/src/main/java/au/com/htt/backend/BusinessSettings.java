package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class BusinessSettings {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final StaffAudit audit;
    BusinessSettings(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/settings/business")
    ResponseEntity<String> business(@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"settings.business.read");return read(scope,request,()->one("SELECT p.*,(now() AT TIME ZONE c.timezone)::date::text AS business_date,((now() AT TIME ZONE c.timezone)::date+p.quote_valid_days)::text AS default_quote_expires_on,c.timezone,c.base_currency AS currency FROM core.business_preferences p JOIN core.companies c ON c.id=p.company_id WHERE p.company_id=:company",scope,Map.of()));
    }
    @GetMapping("/api/v1/settings/document-numbering")
    ResponseEntity<String> numbering(@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"settings.business.read");return read(scope,request,()->QuoteDrafts.map("items",query("SELECT id,document_type,prefix,next_value,version FROM platform.document_sequences WHERE company_id=:company ORDER BY document_type",scope,Map.of()).query(rows::row).list()));
    }
    @PutMapping("/api/v1/settings/business")
    ResponseEntity<String> configure(@RequestBody Business input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"settings.business.write");return response(staff.inCompany(scope,rid(request),()->{
            long expected=WarehouseDetails.version(request.getHeader("If-Match"));
            check(input.salesTermsDays>=0&&input.salesTermsDays<=365&&input.purchaseTermsDays>=0&&input.purchaseTermsDays<=365&&input.quoteValidDays>=1&&input.quoteValidDays<=365,"terms","Terms or quote validity out of range.");
            String dispatch=input.defaultDispatchMode;check(dispatch!=null&&Set.of("PICKUP","DELIVERY").contains(dispatch),"defaultDispatchMode","Invalid defaultDispatchMode.");
            String notes=optional(input.notes,"notes",2000);if(notes==null)notes="";
            var d=QuoteDrafts.map("salesTermsDays",input.salesTermsDays,"purchaseTermsDays",input.purchaseTermsDays,"quoteValidDays",input.quoteValidDays,"defaultDispatchMode",dispatch,"notes",notes);
            var auditData=QuoteDrafts.map("SalesTermsDays",input.salesTermsDays,"PurchaseTermsDays",input.purchaseTermsDays,"QuoteValidDays",input.quoteValidDays,"DefaultDispatchMode",dispatch,"Notes",notes);
            return writes.execute(scope,"PUT /settings/business",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("expected",expected,"d",d)),()->{
                query("SELECT core.configure_business(:version,:sales,:purchase,:quote,:dispatch,:notes)",scope,QuoteDrafts.map("version",expected,"sales",input.salesTermsDays,"purchase",input.purchaseTermsDays,"quote",input.quoteValidDays,"dispatch",dispatch,"notes",d.get("notes"))).query((r,n)->0).single();
                audit.record(scope,"settings.business_changed","business_preferences",scope.companyId(),rid(request),auditData);
                return stored(200,one("SELECT * FROM core.business_preferences WHERE company_id=:company",scope,Map.of()));
            });
        }));
    }
    @PutMapping("/api/v1/settings/document-numbering/{type}")
    ResponseEntity<String> configureNumber(@PathVariable String type,@RequestBody Numbering input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"settings.business.write");return response(staff.inCompany(scope,rid(request),()->{
            long expected=WarehouseDetails.version(request.getHeader("If-Match"));String prefix=upper(text(input.prefix,"prefix",20));
            check(input.nextValue>=1&&input.nextValue<=999999999999L&&prefix.matches("[A-Z0-9][A-Z0-9_-]*"),"prefix","Invalid numbering prefix/counter.");
            return writes.execute(scope,"PUT /settings/document-numbering/"+type,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("expected",expected,"prefix",prefix,"nextValue",input.nextValue)),()->{
                query("SELECT core.configure_numbering(:type,:version,:prefix,:next)",scope,QuoteDrafts.map("type",type,"version",expected,"prefix",prefix,"next",input.nextValue)).query((r,n)->0).single();
                var row=one("SELECT id,document_type,prefix,next_value,version FROM platform.document_sequences WHERE company_id=:company AND document_type=:type",scope,Map.of("type",type));
                audit.record(scope,"settings.numbering_changed","document_sequence",UUID.fromString(row.get("id").toString()),rid(request),QuoteDrafts.map("type",type,"prefix",prefix,"NextValue",input.nextValue));return stored(200,row);
            });
        }));
    }
    private Map<String,Object> one(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Record not found."));}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,Supplier<Object> body){return response(staff.inCompany(scope,rid(request),()->stored(200,body.get())));}
    private static IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,QuotePricing.value(body));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Business {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public int salesTermsDays;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public int purchaseTermsDays;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public int quoteValidDays;
        public String defaultDispatchMode;public String notes="";
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Numbering {public String prefix;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public long nextValue;}
}
