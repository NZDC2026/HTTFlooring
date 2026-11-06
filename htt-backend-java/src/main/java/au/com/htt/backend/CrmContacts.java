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
class CrmContacts {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules mutations;private final CrmParties parties;
    CrmContacts(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules mutations,CrmParties parties){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.mutations=mutations;this.parties=parties;}
    @GetMapping("/api/v1/{kind:customers|suppliers}/{parentId}/contacts")
    ResponseEntity<String> list(@PathVariable String kind,@PathVariable UUID parentId,@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,kind+".read");return read(scope,request,()->{
        UUID party=parent(scope,parentId,kind.equals("customers"));int p=page==null?1:page,size=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql(SELECT+" WHERE c.company_id=:company AND c.party_id=:party ORDER BY c.name,c.id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("party",party).param("size",size).param("offset",(p-1)*size).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",size);});}
    @GetMapping("/api/v1/{kind:customers|suppliers}/{parentId}/contacts/{id}")
    ResponseEntity<String> detail(@PathVariable String kind,@PathVariable UUID parentId,@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,kind+".read");return read(scope,request,()->{UUID party=parent(scope,parentId,kind.equals("customers"));return contact(scope,party,id);});}
    @PostMapping("/api/v1/{kind:customers|suppliers}/{parentId}/contacts")
    ResponseEntity<String> create(@PathVariable String kind,@PathVariable UUID parentId,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(kind,parentId,null,input,token,request);}
    @PutMapping("/api/v1/{kind:customers|suppliers}/{parentId}/contacts/{id}")
    ResponseEntity<String> update(@PathVariable String kind,@PathVariable UUID parentId,@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(kind,parentId,id,input,token,request);}
    private ResponseEntity<String> write(String kind,UUID parent,UUID id,Input input,Jwt token,HttpServletRequest request){boolean customer=kind.equals("customers");var scope=access(token,request,kind+".write");var response=staff.inCompany(scope,rid(request),()->{
        String name=text(input.name,"name",200),email=ContactFields.email(input.email),phone=ContactFields.phone(input.phone,"phone"),mobile=ContactFields.phone(input.mobile,"mobile"),job=optional(input.jobTitle,"jobTitle",100);var branches=ContactFields.branches(input.branchIds);
        var body=QuoteDrafts.map("name",name,"email",email,"phone",phone,"mobile",mobile,"jobTitle",job,"isAccounting",input.isAccounting,"active",input.active,"branchIds",branches);
        UUID party=parent(scope,parent,customer);if(id!=null)contact(scope,party,id);
        return mutations.mutate(scope,request,id,"crm.contacts",body,(doc,before)->{
            check(customer||branches.isEmpty(),"branchIds","Supplier contacts cannot be linked through customer branch management.");
            for(UUID branch:branches)jdbc.sql("SELECT id FROM crm.customer_branches WHERE company_id=:company AND customer_id=:parent AND id=:id AND active").param("company",scope.companyId()).param("parent",parent).param("id",branch).query(UUID.class).optional().orElseThrow(CrmContacts::notFound);
            parties.sharedParty(scope,party,customer);
            if(before!=null){var previous=jdbc.sql("SELECT customer_branch_id FROM crm.contact_branch_links WHERE company_id=:company AND contact_id=:id ORDER BY customer_branch_id").param("company",scope.companyId()).param("id",doc).query(UUID.class).list();before.put("branchIds",previous);if(!customer&&!previous.isEmpty())throw new StaffScope.Failure(409,"customer_contact_route_required","Maintain branch-linked contacts through their customer route.");}
            String sql=id==null?"INSERT INTO crm.contacts(id,company_id,party_id,name,email,phone,mobile,job_title,is_accounting,active,created_by) VALUES(:id,:company,:party,:name,CAST(:email AS text),CAST(:phone AS text),CAST(:mobile AS text),CAST(:job AS text),:accounting,:active,:actor)":"UPDATE crm.contacts SET name=:name,email=CAST(:email AS text),phone=CAST(:phone AS text),mobile=CAST(:mobile AS text),job_title=CAST(:job AS text),is_accounting=:accounting,active=:active WHERE company_id=:company AND id=:id AND party_id=:party";
            jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("party",party).param("name",name).param("email",email).param("phone",phone).param("mobile",mobile).param("job",job).param("accounting",input.isAccounting).param("active",input.active).param("actor",scope.actorId()).update();
            jdbc.sql("DELETE FROM crm.contact_branch_links WHERE company_id=:company AND contact_id=:id").param("company",scope.companyId()).param("id",doc).update();
            for(UUID branch:branches)jdbc.sql("INSERT INTO crm.contact_branch_links(company_id,contact_id,customer_branch_id,created_by) VALUES(:company,:contact,:branch,:actor)").param("company",scope.companyId()).param("contact",doc).param("branch",branch).param("actor",scope.actorId()).update();
        });});return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());}
    private UUID parent(StaffScope.CompanyAccess scope,UUID id,boolean customer){return customer?parties.customerParty(scope,id):jdbc.sql("SELECT party_id FROM crm.suppliers WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(CrmContacts::notFound);}
    private Map<String,Object> contact(StaffScope.CompanyAccess scope,UUID party,UUID id){return jdbc.sql(SELECT+" WHERE c.company_id=:company AND c.id=:id AND c.party_id=:party").param("company",scope.companyId()).param("id",id).param("party",party).query(rows::row).optional().orElseThrow(CrmContacts::notFound);}
    private static final String SELECT="SELECT c.*,ARRAY(SELECT l.customer_branch_id FROM crm.contact_branch_links l WHERE l.company_id=c.company_id AND l.contact_id=c.id ORDER BY l.customer_branch_id) AS branch_ids FROM crm.contacts c";
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String name;public String email;public String phone;public String mobile;public String jobTitle;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean isAccounting=false;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;@com.fasterxml.jackson.annotation.JsonSetter(contentNulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public List<UUID> branchIds;}
}
