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
class ReportDesignerReads {
    private final StaffScope staff;private final JdbcClient jdbc;
    ReportDesignerReads(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
    @GetMapping("/api/v1/reports/saved")
    ResponseEntity<String> saved(@RequestParam(required=false) String favourites,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        boolean fav=LedgerFields.bool(favourites);return read(token,request,"reports.saved.read",scope->{var args=page(page,pageSize);args.put("fav",fav);return query("SELECT reporting.saved_list(:fav,:size,:offset)::text",scope,args);});
    }
    @GetMapping("/api/v1/reports/saved/{id}")
    ResponseEntity<String> savedDetail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"reports.saved.read",scope->query("SELECT reporting.saved_view(:id)::text",scope,QuoteDrafts.map("id",id)));}
    @GetMapping("/api/v1/reports/settings")
    ResponseEntity<String> settings(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"reports.saved.read",scope->query("SELECT reporting.preferences(NULL,NULL)::text",scope,Map.of()));}
    @GetMapping("/api/v1/reports/packs")
    ResponseEntity<String> packs(@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"reports.packs.create",scope->query("SELECT reporting.pack_list(:size,:offset)::text",scope,page(page,pageSize)));}
    @GetMapping("/api/v1/reports/packs/{id}")
    ResponseEntity<String> pack(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return read(token,request,"reports.packs.create",scope->query("SELECT reporting.pack_view(:id)::text",scope,QuoteDrafts.map("id",id)));}
    private String query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args).query(String.class).single();}
    private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String cap,java.util.function.Function<StaffScope.CompanyAccess,String> work){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->work.apply(scope)));}
    private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int page=a==null?1:a,size=b==null?25:b;check(page>=1&&page<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",page,"size",size,"offset",(page-1)*size);}
}
