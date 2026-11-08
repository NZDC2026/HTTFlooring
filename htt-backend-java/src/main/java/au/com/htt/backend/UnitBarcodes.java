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
class UnitBarcodes {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final IdempotentWrite writes;private final StaffAudit audit;
    UnitBarcodes(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/products/{id}/barcodes")
    ResponseEntity<String> list(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"catalog.read");return response(staff.inCompany(scope,rid(request),()->stored(200,QuoteDrafts.map("items",query("SELECT b.* FROM catalog.unit_barcodes b JOIN catalog.product_units u ON u.company_id=b.company_id AND u.id=b.product_unit_id WHERE b.company_id=:company AND u.product_id=:id ORDER BY b.barcode,b.id",scope,Map.of("id",id)).query(rows::row).list()))));
    }
    @PostMapping("/api/v1/product-barcodes")
    ResponseEntity<String> create(@RequestBody Barcode input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"catalog.write");return response(staff.inCompany(scope,rid(request),()->{
            String code=text(input.barcode,"barcode",80);check(code.chars().allMatch(x->x>='!'&&x<='~')&&!code.regionMatches(true,0,"BIN:",0,4)&&!code.regionMatches(true,0,"LOT:",0,4),"barcode","Printable ASCII barcode required.");
            query("SELECT id FROM catalog.product_units WHERE company_id=:company AND id=:unit",scope,Map.of("unit",input.productUnitId)).query(UUID.class).optional().orElseThrow(UnitBarcodes::missing);
            return writes.execute(scope,"POST /product-barcodes",request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("productUnitId",input.productUnitId,"barcode",code,"active",input.active)),()->{
                var row=one("INSERT INTO catalog.unit_barcodes(company_id,product_unit_id,barcode,active,created_by) VALUES(:company,:unit,:barcode,:active,:actor) RETURNING *",scope,QuoteDrafts.map("unit",input.productUnitId,"barcode",code,"active",input.active,"actor",scope.actorId()));
                audit.record(scope,"catalog.barcode_created","product_barcode",UUID.fromString(row.get("id").toString()),rid(request),QuoteDrafts.map("ProductUnitId",input.productUnitId,"barcode",code));return stored(201,row);
            });
        }));
    }
    @PutMapping("/api/v1/product-barcodes/{id}")
    ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Status input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"catalog.write");return response(staff.inCompany(scope,rid(request),()->{
            long version=WarehouseDetails.version(request.getHeader("If-Match"));
            return writes.execute(scope,"PUT /product-barcodes/"+id,request.getHeader("Idempotency-Key"),QuotePricing.canonical(QuoteDrafts.map("id",id,"version",version,"active",input.active)),()->{
                var before=one("SELECT * FROM catalog.unit_barcodes WHERE company_id=:company AND id=:id FOR UPDATE",scope,Map.of("id",id));
                if(((Number)before.get("version")).longValue()!=version)throw new StaffScope.Failure(409,"version_conflict","Barcode changed.");
                var row=one("UPDATE catalog.unit_barcodes SET active=:active WHERE company_id=:company AND id=:id RETURNING *",scope,QuoteDrafts.map("id",id,"active",input.active));
                audit.record(scope,"catalog.barcode_changed","product_barcode",id,rid(request),QuoteDrafts.map("Active",input.active));return stored(200,row);
            });
        }));
    }
    private Map<String,Object> one(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return query(sql,scope,args).query(rows::row).optional().orElseThrow(UnitBarcodes::missing);}
    private static StaffScope.Failure missing(){return new StaffScope.Failure(404,"not_found","Record not found.");}
    private JdbcClient.StatementSpec query(String sql,StaffScope.CompanyAccess scope,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
    private static IdempotentWrite.StoredResponse stored(int status,Object body){return new IdempotentWrite.StoredResponse(status,QuotePricing.value(body));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String cap){return staff.require(token,request.getHeader("X-Company-Id"),cap);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Barcode {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=new UUID(0,0);public String barcode;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Status {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active;}
}
