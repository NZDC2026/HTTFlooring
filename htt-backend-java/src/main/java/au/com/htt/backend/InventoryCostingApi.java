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
class InventoryCostingApi {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final JsonMapper json;
    InventoryCostingApi(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.json=json;}
    record Policy(String method,String reason){}
    @GetMapping("/api/v1/products/{id}/costing-policy")
    ResponseEntity<String> policy(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(policy(scope,id))));
    }
    @PostMapping("/api/v1/products/{id}/costing-policy")
    ResponseEntity<String> configure(@PathVariable UUID id,@RequestBody Policy input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.costing.configure");
        var response=staff.inCompany(scope,rid(request),()->{
            policy(scope,id);long version=WarehouseDetails.version(request.getHeader("If-Match"));
            String reason=MasterDataChecks.text(input.reason(),"reason",2000);
            MasterDataChecks.check(reason.length()>=3&&input.method()!=null&&Set.of("FIFO","MOVING_WEIGHTED_AVERAGE").contains(input.method()),"method","Valid method and reason of 3..2000 characters required.");
            String canonical=LegacyRawJson.value(QuoteDrafts.map("id",id,"version",version,"method",input.method(),"reason",reason));
            return writes.execute(scope,"POST /products/"+id+"/costing-policy",request.getHeader("Idempotency-Key"),canonical,()->{
                jdbc.sql("SELECT inventory.set_costing_method(:id,:version,:method,:reason)").param("id",id).param("version",version).param("method",input.method()).param("reason",reason).query((r,n)->0).single();
                return new IdempotentWrite.StoredResponse(200,json.writeValueAsString(policy(scope,id)));
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    @GetMapping("/api/v1/warehouses/{warehouseId}/products/{productId}/batches")
    ResponseEntity<String> batches(@PathVariable UUID warehouseId,@PathVariable UUID productId,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->{
            jdbc.sql("SELECT inventory.require_access('inventory.read',:id)").param("id",warehouseId).query((r,n)->0).single();
            var policy=policy(scope,productId);
            var balances=jdbc.sql("SELECT id,on_hand FROM inventory.stock_balances WHERE company_id=:company AND warehouse_id=:warehouse AND product_id=:product").param("company",scope.companyId()).param("warehouse",warehouseId).param("product",productId).query(rows::row).optional();
            List<Map<String,Object>> items=new ArrayList<>();
            if(balances.isPresent()){
                var balance=balances.get();items.addAll(jdbc.sql("SELECT id,source_document_id,batch_number,income_date::text,quantity,value FROM inventory.stock_batches WHERE company_id=:company AND stock_balance_id=:id AND quantity>0 ORDER BY CASE WHEN :method<>'FIFO' THEN income_date END NULLS FIRST,sequence").param("company",scope.companyId()).param("id",balance.get("id")).param("method",policy.get("method")).query(rows::row).list());
                if(items.isEmpty()&&new java.math.BigDecimal(balance.get("onHand").toString()).signum()>0)items.add(QuoteDrafts.map("id","legacy:opening:"+balance.get("id"),"batchNumber","Not recorded","incomeDate",null,"quantity",balance.get("onHand"),"value",null));
            }
            if(!CrmParties.has(scope,"inventory.cost.read"))items.forEach(x->x.remove("value"));
            return json.writeValueAsString(QuoteDrafts.map("items",items,"productId",productId,"warehouseId",warehouseId,"costingMethod",policy.get("method"),"quantityUnit","BASE_UNIT"));
        }));
    }
    @GetMapping("/api/v1/inventory/commercial-reservations")
    ResponseEntity<String> commercialReservations(@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"inventory.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->jdbc.sql("SELECT inventory.commercial_reservations()::text").query(String.class).single()));
    }
    private Map<String,Object> policy(StaffScope.CompanyAccess scope,UUID id){return jdbc.sql("SELECT p.product_id,p.method,p.version,p.updated_at,c.base_uom_id FROM inventory.costing_policies p JOIN catalog.products c ON c.company_id=p.company_id AND c.id=p.product_id WHERE p.company_id=:company AND p.product_id=:id AND c.item_type='STOCK'").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Stock costing policy unavailable."));}
    private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
}
