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
class CatalogMaintenance {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules mutations;
    CatalogMaintenance(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules mutations){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.mutations=mutations;}
    @GetMapping("/api/v1/warehouses")
    ResponseEntity<String> warehouses(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){var scope=access(token,request,"warehouses.read");return read(scope,request,()->{
        int p=page==null?1:page,s=pageSize==null?25:pageSize;check(p>=1&&p<=100000&&s>=1&&s<=100,"page","page must be 1..100000 and pageSize 1..100.");
        var items=jdbc.sql("SELECT w.* FROM catalog.warehouses w WHERE w.company_id=:company AND "+WAREHOUSE_SCOPE+" ORDER BY w.code,w.id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("all",has(scope,"warehouses.all")).param("membership",scope.membershipId()).param("size",s).param("offset",(p-1)*s).query(rows::row).list();return QuoteDrafts.map("items",items,"page",p,"pageSize",s);});}
    @GetMapping("/api/v1/warehouses/{id}")
    ResponseEntity<String> warehouse(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"warehouses.read");return read(scope,request,()->warehouse(scope,id));}
    @PostMapping("/api/v1/warehouses")
    ResponseEntity<String> createWarehouse(@RequestBody Warehouse body,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return warehouseWrite(null,body,token,request);}
    @PutMapping("/api/v1/warehouses/{id}")
    ResponseEntity<String> updateWarehouse(@PathVariable UUID id,@RequestBody Warehouse body,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return warehouseWrite(id,body,token,request);}
    private ResponseEntity<String> warehouseWrite(UUID id,Warehouse input,Jwt token,HttpServletRequest request){var scope=access(token,request,"warehouses.write");return response(staff.inCompany(scope,rid(request),()->{
        String code=code(input.code,"code"),name=text(input.name,"name",200);check(Set.of("SELLABLE","QUARANTINE","TRANSIT").contains(input.kind==null?"":input.kind),"kind","Invalid kind.");
        if(id==null&&!has(scope,"warehouses.all"))throw new StaffScope.Failure(403,"permission_denied","Creating warehouses requires company-wide warehouse scope.");
        if(id!=null)warehouse(scope,id);
        var body=QuoteDrafts.map("code",code,"name",name,"regionId",input.regionId,"kind",input.kind,"active",input.active);
        return mutations.mutate(scope,request,id,"catalog.warehouses",body,(doc,before)->{
            if(before!=null)check(input.kind.equals(before.get("kind")),"kind","Warehouse purpose is immutable; use stock transfer for reclassification.");
            if(input.regionId!=null)reference(scope,"core.regions",input.regionId,true);
            String sql=id==null?"INSERT INTO catalog.warehouses(id,company_id,code,name,region_id,kind,active,created_by) VALUES(:id,:company,:code,:name,CAST(:region AS uuid),:kind,:active,:actor)":"UPDATE catalog.warehouses SET code=:code,name=:name,region_id=CAST(:region AS uuid),active=:active WHERE company_id=:company AND id=:id";
            jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("code",code).param("name",name).param("region",input.regionId).param("kind",input.kind).param("active",input.active).param("actor",scope.actorId()).update();
        });}));}
    @GetMapping("/api/v1/products/{id}")
    ResponseEntity<String> product(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"catalog.read");return read(scope,request,()->jdbc.sql("SELECT * FROM catalog.products WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(CatalogMaintenance::notFound));}
    @PutMapping("/api/v1/products/{id}")
    ResponseEntity<String> updateProduct(@PathVariable UUID id,@RequestBody Product input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){var scope=access(token,request,"catalog.write");return response(staff.inCompany(scope,rid(request),()->{
        String sku=code(input.sku,"sku"),name=text(input.name,"name",200);check(Set.of("STOCK","NON_STOCK","SERVICE").contains(input.itemType==null?"":input.itemType),"itemType","Invalid itemType.");check(Set.of("ACTIVE","INACTIVE").contains(input.status==null?"":input.status),"status","Invalid status.");amount(input.reorderPoint,"reorderPoint");
        var body=QuoteDrafts.map("sku",sku,"name",name,"taxCodeId",input.taxCodeId,"categoryId",input.categoryId,"itemType",input.itemType,"status",input.status,"wholePacks",input.wholePacks,"buyEnabled",input.buyEnabled,"sellEnabled",input.sellEnabled,"reorderPoint",input.reorderPoint);
        return mutations.mutate(scope,request,id,"catalog.products",body,(doc,before)->{
            reference(scope,"accounting.tax_codes",input.taxCodeId,false);if(input.categoryId!=null)reference(scope,"catalog.product_categories",input.categoryId,true);
            jdbc.sql("UPDATE catalog.products SET sku=:sku,name=:name,item_type=:type,status=:status,tax_code_id=:tax,category_id=CAST(:category AS uuid),whole_packs=:whole,buy_enabled=:buy,sell_enabled=:sell,reorder_point=:reorder WHERE company_id=:company AND id=:id").param("id",doc).param("company",scope.companyId()).param("sku",sku).param("name",name).param("type",input.itemType).param("status",input.status).param("tax",input.taxCodeId).param("category",input.categoryId).param("whole",input.wholePacks).param("buy",input.buyEnabled).param("sell",input.sellEnabled).param("reorder",input.reorderPoint).update();
        });}));}
    @PostMapping("/api/v1/products/{productId}/units")
    ResponseEntity<String> createUnit(@PathVariable UUID productId,@RequestBody Unit input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return unitWrite(productId,null,input,token,request);}
    @PutMapping("/api/v1/products/{productId}/units/{id}")
    ResponseEntity<String> updateUnit(@PathVariable UUID productId,@PathVariable UUID id,@RequestBody Unit input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){return unitWrite(productId,id,input,token,request);}
    private ResponseEntity<String> unitWrite(UUID product,UUID id,Unit input,Jwt token,HttpServletRequest request){var scope=access(token,request,"catalog.write");return response(staff.inCompany(scope,rid(request),()->{
        amount(input.conversionToBase,"conversionToBase");amount(input.quantityStep,"quantityStep");check(input.conversionToBase.signum()>0&&input.quantityStep.signum()>0,"conversionToBase","Conversion and quantity step must be positive.");
        if(id==null)reference(scope,"catalog.products",product,false);else jdbc.sql("SELECT id FROM catalog.product_units WHERE company_id=:company AND product_id=:product AND id=:id").param("company",scope.companyId()).param("product",product).param("id",id).query(UUID.class).optional().orElseThrow(CatalogMaintenance::notFound);
        var body=QuoteDrafts.map("uomId",input.uomId,"conversionToBase",input.conversionToBase,"quantityStep",input.quantityStep,"active",input.active);
        return mutations.mutate(scope,request,id,"catalog.product_units",body,(doc,before)->{
            if(before!=null){check(input.uomId.equals(before.get("uomId")),"uomId","Product unit identity cannot be changed.");
                if(input.conversionToBase.compareTo(new BigDecimal(before.get("conversionToBase").toString()))!=0||input.quantityStep.compareTo(new BigDecimal(before.get("quantityStep").toString()))!=0){
                    boolean used=jdbc.sql("SELECT 1 FROM pricing.price_list_items WHERE company_id=:company AND product_unit_id=:id UNION ALL SELECT 1 FROM pricing.customer_price_rules WHERE company_id=:company AND product_unit_id=:id UNION ALL SELECT 1 FROM pricing.promotion_items WHERE company_id=:company AND product_unit_id=:id UNION ALL SELECT 1 FROM pricing.price_floor_rules WHERE company_id=:company AND product_unit_id=:id LIMIT 1").param("company",scope.companyId()).param("id",doc).query(Integer.class).optional().isPresent();if(used)throw new StaffScope.Failure(409,"unit_in_use","Conversion and step are locked once referenced by pricing. Add a new product/unit instead.");}
            }
            if(id==null||input.active)reference(scope,"catalog.uoms",input.uomId,true);
            String sql=id==null?"INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base,quantity_step,active,created_by) VALUES(:id,:company,:product,:uom,:conversion,:step,:active,:actor)":"UPDATE catalog.product_units SET conversion_to_base=:conversion,quantity_step=:step,active=:active WHERE company_id=:company AND product_id=:product AND id=:id";
            jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("product",product).param("uom",input.uomId).param("conversion",input.conversionToBase).param("step",input.quantityStep).param("active",input.active).param("actor",scope.actorId()).update();
        });}));}
    private static final String WAREHOUSE_SCOPE="(:all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=:membership))";
    private Map<String,Object> warehouse(StaffScope.CompanyAccess scope,UUID id){return jdbc.sql("SELECT w.* FROM catalog.warehouses w WHERE w.company_id=:company AND w.id=:id AND "+WAREHOUSE_SCOPE).param("company",scope.companyId()).param("id",id).param("all",has(scope,"warehouses.all")).param("membership",scope.membershipId()).query(rows::row).optional().orElseThrow(CatalogMaintenance::notFound);}
    private void reference(StaffScope.CompanyAccess scope,String table,UUID id,boolean active){if(!Set.of("core.regions","accounting.tax_codes","catalog.product_categories","catalog.products","catalog.uoms").contains(table))throw new IllegalArgumentException("Unknown reference table");jdbc.sql("SELECT id FROM "+table+" WHERE company_id=:company AND id=:id"+(active?" AND active FOR SHARE":"")).param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(CatalogMaintenance::notFound);}
    private static void amount(BigDecimal value,String field){SupplierBills.amount(value,field,6,"99999999999999.999999");}
    private static boolean has(StaffScope.CompanyAccess scope,String permission){return List.of(scope.permissions()).contains(permission);}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Warehouse {public String code;public String name;public UUID regionId;public String kind="SELLABLE";@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Product {public String sku;public String name;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID taxCodeId=ZERO;public UUID categoryId;public String itemType="STOCK";public String status="ACTIVE";@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean wholePacks=true;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean buyEnabled=true;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean sellEnabled=true;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal reorderPoint=BigDecimal.ZERO;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Unit {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID uomId=ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal conversionToBase=BigDecimal.ZERO;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal quantityStep=BigDecimal.ONE;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;}
}
