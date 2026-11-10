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
class WorkbenchReads {
 private final StaffScope staff;private final JdbcClient jdbc;private final JsonMapper json;
 WorkbenchReads(StaffScope staff,JdbcClient jdbc,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.json=json;}
 @GetMapping("/api/v1/workbench/finance")
 ResponseEntity<String> finance(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("FINANCE","workbench.finance.read",false,token,request,null);}
 @GetMapping("/api/v1/workbench/sales")
 ResponseEntity<String> sales(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("SALES","workbench.sales.read",true,token,request,null);}
 @GetMapping("/api/v1/workbench/office")
 ResponseEntity<String> office(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("OFFICE","workbench.office.read",true,token,request,null);}
 @GetMapping("/api/v1/workbench/customers/{id}")
 ResponseEntity<String> customer(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("CUSTOMER","workbench.customers.read",true,token,request,id);}
 @GetMapping("/api/v1/workbench/banks")
 ResponseEntity<String> banks(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("BANKS","workbench.banks.read",false,token,request,null);}
 @GetMapping("/api/v1/workbench/warehouse")
 ResponseEntity<String> warehouse(@AuthenticationPrincipal Jwt token,HttpServletRequest request){return query("WAREHOUSE","workbench.warehouse.read",false,token,request,null);}
 private ResponseEntity<String> query(String kind,String cap,boolean customer,Jwt token,HttpServletRequest request,UUID id){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);var filter=new LinkedHashMap<String,Object>();
  if(kind.equals("BANKS"))filter.put("asOf",date(request.getParameter("asOf")));
  else if(kind.equals("WAREHOUSE"))filter.put("warehouseId",LedgerFields.uuid(request.getParameter("warehouseId")));
  else{filter.put("from",date(request.getParameter("from")));filter.put("to",date(request.getParameter("to")));if(customer)filter.put("customerId",id==null?LedgerFields.uuid(request.getParameter("customerId")):id);}
  filter.put("page",LedgerFields.integer(request.getParameter("page")));filter.put("pageSize",LedgerFields.integer(request.getParameter("pageSize")));
  String body=staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->jdbc.sql("SELECT workbench.query(:kind,CAST(:filter AS jsonb))::text").param("kind",kind).param("filter",json.writeValueAsString(filter)).query(String.class).single());
  return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.APPLICATION_JSON).body(body);
 }
 private static Object date(String raw){return raw==null?null:LedgerFields.date(raw).toString();}
}
