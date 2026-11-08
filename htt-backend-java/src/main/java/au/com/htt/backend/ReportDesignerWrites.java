package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class ReportDesignerWrites {
    private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final StaffAudit audit;
    ReportDesignerWrites(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;}
    @PostMapping("/api/v1/reports/saved")
    ResponseEntity<String> create(@RequestBody Saved input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(null,input,token,request);}
    @PutMapping("/api/v1/reports/saved/{id}")
    ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Saved input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return save(id,input,token,request);}
    private ResponseEntity<String> save(UUID id,Saved input,Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.saved.write");return response(staff.inCompany(scope,rid(request),()->{
            object(input.definition);name(input.name,"name");long version=id==null?0:WarehouseDetails.version(request.getHeader("If-Match"));
            query("SELECT reporting.require_definition(CAST(:def AS jsonb))",scope,QuoteDrafts.map("def",input.definition.canonical())).query((r,n)->0).single();
            if(id!=null)view(scope,id);if("COMPANY".equals(input.visibility))require(scope,"reports.saved.share");
            var x=QuoteDrafts.map("name",input.name,"definition",input.definition,"visibility",input.visibility,"active",input.active);
            return writes.execute(scope,id==null?"POST /reports/saved":"PUT /reports/saved/"+id,request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("version",version,"x",x)),()->{
                UUID result=query("SELECT reporting.save(CAST(:id AS uuid),:version,CAST(:name AS text),CAST(:visibility AS text),:active,CAST(:def AS jsonb))",scope,QuoteDrafts.map("id",id,"version",version,"name",input.name,"visibility",input.visibility,"active",input.active,"def",input.definition.canonical())).query(UUID.class).single();
                audit.record(scope,"reports.saved_changed","saved_report",result,rid(request),Map.of());return new IdempotentWrite.StoredResponse(id==null?201:200,view(scope,result));
            });
        }));
    }
    @PutMapping("/api/v1/reports/saved/{id}/favourite")
    ResponseEntity<String> favourite(@PathVariable UUID id,@RequestBody Favourite input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.saved.read");return response(staff.inCompany(scope,rid(request),()->{
            view(scope,id);return writes.execute(scope,"PUT /reports/saved/"+id+"/favourite",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("active",input.active)),()->{
                query("SELECT reporting.favourite(:id,:active)",scope,QuoteDrafts.map("id",id,"active",input.active)).query((r,n)->0).single();return new IdempotentWrite.StoredResponse(200,view(scope,id));
            });
        }));
    }
    @PutMapping("/api/v1/reports/settings")
    ResponseEntity<String> settings(@RequestBody Format input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.saved.write");return response(staff.inCompany(scope,rid(request),()->{
            object(input.format);Long version=zeroVersion(request.getHeader("If-Match"));check(version!=null,"version","Supply If-Match, initially zero.");require(scope,"reports.saved.read");
            return writes.execute(scope,"PUT /reports/settings",request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("version",version,"x",QuoteDrafts.map("format",input.format))),()->new IdempotentWrite.StoredResponse(200,body("SELECT reporting.preferences(:version,CAST(:format AS jsonb))::text",scope,QuoteDrafts.map("version",version,"format",input.format.canonical()))));
        }));
    }
    @PostMapping("/api/v1/reports/packs")
    ResponseEntity<String> capture(@RequestBody Pack input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"reports.packs.create");return response(staff.inCompany(scope,rid(request),()->{
            name(input.title,"title");check(input.items!=null&&input.items.size()>=1&&input.items.size()<=8,"items","Select 1-8 reports.");
            for(var item:input.items){object(item);query("SELECT reporting.require_definition(reporting.resolve(CAST(:item AS jsonb)))",scope,QuoteDrafts.map("item",item.canonical())).query((r,n)->0).single();}
            return writes.execute(scope,"POST /reports/packs",request.getHeader("Idempotency-Key"),LegacyRawJson.value(QuoteDrafts.map("title",input.title,"items",input.items)),()->{
                UUID id=query("SELECT reporting.capture(CAST(:title AS text),CAST(:items AS jsonb))",scope,QuoteDrafts.map("title",input.title,"items",LegacyRawJson.value(input.items))).query(UUID.class).single();
                audit.record(scope,"reports.pack_captured","report_pack",id,rid(request),Map.of());return new IdempotentWrite.StoredResponse(201,body("SELECT reporting.pack_view(:id)::text",scope,QuoteDrafts.map("id",id)));
            });
        }));
    }
    private static void object(LegacyRawJson input){check(input!=null&&input.validObject(),"definition","Supply a JSON object without control characters.");}
    private static void name(String raw,String field){String checked=text(raw,field,120);check(checked.chars().noneMatch(Character::isISOControl),field,"Control characters are not supported.");}
    private static Long zeroVersion(String header){try{String value=MasterDataChecks.trim((header==null?"":header).replaceAll("^\\\"+|\\\"+$",""));if(!value.matches("[+-]?[0-9]+"))return null;long version=Long.parseLong(value);return version>=0?version:null;}catch(NumberFormatException invalid){return null;}}
    private String view(StaffScope.CompanyAccess scope,UUID id){return body("SELECT reporting.saved_view(:id)::text",scope,QuoteDrafts.map("id",id));}
    private void require(StaffScope.CompanyAccess scope,String cap){query("SELECT crm.require_mobile(:cap)",scope,QuoteDrafts.map("cap",cap)).query((r,n)->0).single();}
    private String body(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query(String.class).single();}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Saved {public String name;public LegacyRawJson definition;public String visibility="PRIVATE";@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Favourite {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Format {public LegacyRawJson format;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Pack {public String title;public List<LegacyRawJson> items;}
}
