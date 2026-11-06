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

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class CatalogLookups {
    private final StaffScope staff; private final JdbcClient jdbc; private final LegacyRows rows; private final JsonMapper json; private final PricingRules mutations;
    CatalogLookups(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules mutations){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.mutations=mutations;}
    private record Kind(String table,String read,String write) {}
    private static Kind kind(String name){return switch(name){case "uoms"->new Kind("catalog.uoms","catalog.read","catalog.write");case "product-categories"->new Kind("catalog.product_categories","catalog.read","catalog.write");case "regions"->new Kind("core.regions","warehouses.read","warehouses.write");default->throw new IllegalArgumentException("Unknown lookup");};}
    @GetMapping("/api/v1/{kind:uoms|product-categories|regions}")
    ResponseEntity<String> list(@PathVariable String kind,@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){
        var type=kind(kind);var scope=staff.require(token,request.getHeader("X-Company-Id"),type.read());
        return read(scope,request,()->{int p=page==null?1:page,s=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&s>=1&&s<=100,"page","page must be 1..100000 and pageSize 1..100.");
            var items=jdbc.sql("SELECT id,code,name,active,version FROM "+type.table()+" WHERE company_id=:company ORDER BY code,id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("size",s).param("offset",(p-1)*s).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",s);});
    }
    @GetMapping("/api/v1/{kind:uoms|product-categories|regions}/{id}")
    ResponseEntity<String> detail(@PathVariable String kind,@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var type=kind(kind);var scope=staff.require(token,request.getHeader("X-Company-Id"),type.read());return read(scope,request,()->jdbc.sql("SELECT id,code,name,active,version FROM "+type.table()+" WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.")));
    }
    @PostMapping("/api/v1/{kind:uoms|product-categories|regions}")
    ResponseEntity<String> create(@PathVariable String kind,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(kind,null,input,token,request);}
    @PutMapping("/api/v1/{kind:uoms|product-categories|regions}/{id}")
    ResponseEntity<String> update(@PathVariable String kind,@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return write(kind,id,input,token,request);}
    private ResponseEntity<String> write(String name,UUID id,Input input,Jwt token,HttpServletRequest request){
        var type=kind(name);var scope=staff.require(token,request.getHeader("X-Company-Id"),type.write());
        var response=staff.inCompany(scope,rid(request),()->{
            String code=MasterDataChecks.code(input.code,"code"),text=MasterDataChecks.text(input.name,"name",200);
            var body=QuoteDrafts.map("code",code,"name",text,"active",input.active);
            return mutations.mutate(scope,request,id,type.table(),body,(doc,before)->{
                if(before!=null&&name.equals("uoms")&&!input.active){var used=jdbc.sql("SELECT id FROM catalog.product_units WHERE company_id=:company AND uom_id=:id AND active LIMIT 1").param("company",scope.companyId()).param("id",doc).query(UUID.class).optional();if(used.isPresent())throw new StaffScope.Failure(409,"unit_in_use","Deactivate dependent product units before the UOM.");}
                String sql=id==null?"INSERT INTO "+type.table()+"(id,company_id,code,name,active,created_by) VALUES(:id,:company,:code,:name,:active,:actor)":"UPDATE "+type.table()+" SET code=:code,name=:name,active=:active WHERE company_id=:company AND id=:id";
                jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("code",code).param("name",text).param("active",input.active).param("actor",scope.actorId()).update();
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static void check(boolean valid,String field,String message){if(!valid)throw new BranchQuery.InvalidFilter(field,message);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String code;public String name;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
}
