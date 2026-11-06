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
class CrmParties {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules mutations;
    CrmParties(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules mutations){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.mutations=mutations;}
    @GetMapping("/api/v1/customers/{id}")
    ResponseEntity<String> customer(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"customers.read");return read(scope,request,()->{customerParty(scope,id);return jdbc.sql("SELECT c.id,c.code,c.status,c.credit_limit,c.payment_terms_days,c.version,p.legal_name,p.abn FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE c.company_id=:company AND c.id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(CrmParties::notFound);});}
    @PutMapping("/api/v1/customers/{id}")
    ResponseEntity<String> updateCustomer(@PathVariable UUID id,@RequestBody Customer input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"customers.write");
        if(input.creditLimit==null||input.paymentTermsDays==null)throw new org.springframework.http.converter.HttpMessageNotReadableException("Required credit limit and payment terms",new org.springframework.http.server.ServletServerHttpRequest(request));
        return response(staff.inCompany(scope,rid(request),()->{
            String code=code(input.code,"code"),name=text(input.legalName,"legalName",200),abn=abn(input.abn);
            check(Set.of("ACTIVE","ON_HOLD","INACTIVE").contains(input.status==null?"":input.status),"status","Invalid status.");SupplierBills.amount(input.creditLimit,"creditLimit",2,"999999999999999999.99");terms(input.paymentTermsDays);
            UUID party=customerParty(scope,id);var body=QuoteDrafts.map("code",code,"legalName",name,"abn",abn,"status",input.status,"creditLimit",input.creditLimit,"paymentTermsDays",input.paymentTermsDays);
            return mutations.mutate(scope,request,id,"crm.customers",body,(doc,before)->{
                boolean changesCredit=input.creditLimit.compareTo(new BigDecimal(before.get("creditLimit").toString()))!=0||input.paymentTermsDays.intValue()!=((Number)before.get("paymentTermsDays")).intValue()||("ON_HOLD".equals(before.get("status"))&&!"ON_HOLD".equals(input.status));
                if(changesCredit&&!has(scope,"customers.credit.write"))throw new StaffScope.Failure(403,"permission_denied","Credit limits, terms and hold releases require credit permission.");
                sharedParty(scope,party,true);before.put("party",partyRow(scope,party));updateParty(scope,party,name,abn);
                jdbc.sql("UPDATE crm.customers SET code=:code,status=:status,credit_limit=:credit,payment_terms_days=:terms WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",doc).param("code",code).param("status",input.status).param("credit",input.creditLimit).param("terms",input.paymentTermsDays).update();
            });}));}
    @GetMapping("/api/v1/suppliers")
    ResponseEntity<String> suppliers(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"suppliers.read");return read(scope,request,()->{
        int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql(SUPPLIER_SELECT+" WHERE su.company_id=:company ORDER BY su.code,su.id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);});}
    @GetMapping("/api/v1/suppliers/{id}")
    ResponseEntity<String> supplier(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"suppliers.read");return read(scope,request,()->jdbc.sql(SUPPLIER_SELECT+" WHERE su.company_id=:company AND su.id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(CrmParties::notFound));}
    @PostMapping("/api/v1/suppliers")
    ResponseEntity<String> createSupplier(@RequestBody Supplier input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return supplierWrite(null,input,token,request);}
    @PutMapping("/api/v1/suppliers/{id}")
    ResponseEntity<String> updateSupplier(@PathVariable UUID id,@RequestBody Supplier input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return supplierWrite(id,input,token,request);}
    private ResponseEntity<String> supplierWrite(UUID id,Supplier input,Jwt token,HttpServletRequest request){var scope=access(token,request,"suppliers.write");return response(staff.inCompany(scope,rid(request),()->{
        int days=input.paymentTermsDays==null?jdbc.sql("SELECT purchase_terms_days FROM core.business_preferences WHERE company_id=:company").param("company",scope.companyId()).query(Integer.class).optional().orElseThrow(CrmParties::notFound):input.paymentTermsDays;
        terms(days);String code=code(input.code,"code"),name=text(input.legalName,"legalName",200),abn=abn(input.abn);check(Set.of("ACTIVE","INACTIVE").contains(input.status==null?"":input.status),"status","Invalid status.");
        // The requested nullable terms, rather than the resolved default, are part of the legacy request identity and audit.
        var body=QuoteDrafts.map("code",code,"legalName",name,"abn",abn,"paymentTermsDays",input.paymentTermsDays,"status",input.status);
        return mutations.mutate(scope,request,id,"crm.suppliers",body,(doc,before)->{
            UUID party;if(before==null){party=UUID.randomUUID();jdbc.sql("INSERT INTO crm.parties(id,company_id,legal_name,abn,created_by) VALUES(:party,:company,:name,CAST(:abn AS varchar),:actor)").param("party",party).param("company",scope.companyId()).param("name",name).param("abn",abn).param("actor",scope.actorId()).update();
                jdbc.sql("INSERT INTO crm.suppliers(id,company_id,party_id,code,status,payment_terms_days,created_by) VALUES(:id,:company,:party,:code,:status,:terms,:actor)").param("id",doc).param("company",scope.companyId()).param("party",party).param("code",code).param("status",input.status).param("terms",days).param("actor",scope.actorId()).update();
            }else{party=(UUID)before.get("partyId");sharedParty(scope,party,false);before.put("party",partyRow(scope,party));updateParty(scope,party,name,abn);
                jdbc.sql("UPDATE crm.suppliers SET code=:code,status=:status,payment_terms_days=:terms WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",doc).param("code",code).param("status",input.status).param("terms",days).update();}
        });}));}
    UUID customerParty(StaffScope.CompanyAccess scope,UUID id){return jdbc.sql("SELECT c.party_id FROM crm.customers c WHERE c.company_id=:company AND c.id=:id AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))").param("company",scope.companyId()).param("id",id).param("all",has(scope,"customers.all")).param("membership",scope.membershipId()).query(UUID.class).optional().orElseThrow(CrmParties::notFound);}
    void sharedParty(StaffScope.CompanyAccess scope,UUID party,boolean customer){
        if(customer){boolean shared=jdbc.sql("SELECT id FROM crm.suppliers WHERE company_id=:company AND party_id=:party").param("company",scope.companyId()).param("party",party).query(UUID.class).optional().isPresent();if(shared&&!has(scope,"suppliers.write"))throw new StaffScope.Failure(403,"permission_denied","This shared customer/supplier party requires both maintenance permissions.");}
        else for(UUID id:jdbc.sql("SELECT id FROM crm.customers WHERE company_id=:company AND party_id=:party").param("company",scope.companyId()).param("party",party).query(UUID.class).list()){
            if(!has(scope,"customers.write"))throw new StaffScope.Failure(403,"permission_denied","This shared party also requires customer maintenance permission.");customerParty(scope,id);
        }
    }
    private Map<String,Object> partyRow(StaffScope.CompanyAccess scope,UUID party){return jdbc.sql("SELECT legal_name,abn FROM crm.parties WHERE company_id=:company AND id=:party FOR UPDATE").param("company",scope.companyId()).param("party",party).query(rows::row).optional().orElseThrow(CrmParties::notFound);}
    private void updateParty(StaffScope.CompanyAccess scope,UUID party,String name,String abn){jdbc.sql("UPDATE crm.parties SET legal_name=:name,abn=CAST(:abn AS varchar) WHERE company_id=:company AND id=:party").param("company",scope.companyId()).param("party",party).param("name",name).param("abn",abn).update();}
    private static String abn(String value){return trim(value).isEmpty()?null:CustomerWrites.normalizeAbn(value);}
    private static void terms(int days){check(days>=0&&days<=365,"paymentTermsDays","Terms must be 0..365 days.");}
    static boolean has(StaffScope.CompanyAccess scope,String permission){return List.of(scope.permissions()).contains(permission);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final String SUPPLIER_SELECT="SELECT su.id,su.code,su.status,su.payment_terms_days,su.version,p.legal_name,p.abn FROM crm.suppliers su JOIN crm.parties p ON p.company_id=su.company_id AND p.id=su.party_id";
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Customer {public String code;public String legalName;public String abn;public String status;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal creditLimit;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public Integer paymentTermsDays;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Supplier {public String code;public String legalName;public String abn;public Integer paymentTermsDays;public String status="ACTIVE";}
}
