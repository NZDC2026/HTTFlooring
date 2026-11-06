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
class CrmBranches {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules mutations;private final CrmParties parties;
    CrmBranches(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules mutations,CrmParties parties){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.mutations=mutations;this.parties=parties;}
    @GetMapping("/api/v1/customers/{customerId}/branches")
    ResponseEntity<String> list(@PathVariable UUID customerId,@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"customers.read");return read(scope,request,()->{
        parties.customerParty(scope,customerId);int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql("SELECT * FROM crm.customer_branches WHERE company_id=:company AND customer_id=:customer ORDER BY code,id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("customer",customerId).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);});}
    @GetMapping("/api/v1/customers/{customerId}/branches/{id}")
    ResponseEntity<String> detail(@PathVariable UUID customerId,@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"customers.read");return read(scope,request,()->{parties.customerParty(scope,customerId);return branch(scope,customerId,id);});}
    @PostMapping("/api/v1/customers/{customerId}/branches")
    ResponseEntity<String> create(@PathVariable UUID customerId,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(customerId,null,input,token,request);}
    @PutMapping("/api/v1/customers/{customerId}/branches/{id}")
    ResponseEntity<String> update(@PathVariable UUID customerId,@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(customerId,id,input,token,request);}
    private ResponseEntity<String> write(UUID customer,UUID id,Input input,Jwt token,HttpServletRequest request){var scope=access(token,request,"customers.write");var response=staff.inCompany(scope,rid(request),()->{
        String country=upper(input.country),state=optional(input.state,"state",100),postcode=optional(input.postcode,"postcode",20);if(state!=null)state=upper(state);
        check(country.matches("[A-Z]{2}"),"country","Use a two-letter country code.");if(country.equals("AU")){check(Set.of("ACT","NSW","NT","QLD","SA","TAS","VIC","WA").contains(state==null?"":state),"state","An Australian state/territory is required.");check(postcode!=null&&postcode.matches("[0-9]{4}"),"postcode","Australian postcode must contain four digits.");}
        var body=QuoteDrafts.map("code",code(input.code,"code"),"name",text(input.name,"name",200),"addressLine1",text(input.addressLine1,"addressLine1",300),"suburb",optional(input.suburb,"suburb",200),"state",state,"postcode",postcode,"country",country,"active",input.active);
        parties.customerParty(scope,customer);
        // This lock is also taken on retries, matching the original mobile/geocode change ordering.
        jdbc.sql("SELECT crm.prepare_branch_change(:customer)").param("customer",customer).query((row,n)->0).single();
        if(id!=null)branch(scope,customer,id);
        return mutations.mutate(scope,request,id,"crm.customer_branches",body,(doc,before)->{
            String sql=id==null?"INSERT INTO crm.customer_branches(id,company_id,customer_id,code,name,address_line1,suburb,state,postcode,country,active,created_by) VALUES(:id,:company,:customer,:code,:name,:address,CAST(:suburb AS text),CAST(:state AS text),CAST(:postcode AS text),:country,:active,:actor)":"UPDATE crm.customer_branches SET code=:code,name=:name,address_line1=:address,suburb=CAST(:suburb AS text),state=CAST(:state AS text),postcode=CAST(:postcode AS text),country=:country,active=:active WHERE company_id=:company AND id=:id AND customer_id=:customer";
            jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("customer",customer).param("code",body.get("code")).param("name",body.get("name")).param("address",body.get("addressLine1")).param("suburb",body.get("suburb")).param("state",body.get("state")).param("postcode",body.get("postcode")).param("country",body.get("country")).param("active",input.active).param("actor",scope.actorId()).update();
        });});return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());}
    private Map<String,Object> branch(StaffScope.CompanyAccess scope,UUID customer,UUID id){return jdbc.sql("SELECT * FROM crm.customer_branches WHERE company_id=:company AND customer_id=:customer AND id=:id").param("company",scope.companyId()).param("customer",customer).param("id",id).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String code;public String name;public String addressLine1;public String suburb;public String state;public String postcode;public String country="AU";@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
}
