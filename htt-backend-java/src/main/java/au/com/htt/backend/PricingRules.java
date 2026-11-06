package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class PricingRules {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final IdempotentWrite writes;private final StaffAudit audit;
    PricingRules(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,IdempotentWrite writes,StaffAudit audit){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.writes=writes;this.audit=audit;}
    @GetMapping("/api/v1/pricing/price-lists")
    ResponseEntity<String> priceLists(@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        var scope=access(token,request,"pricing.manage.read");return read(scope,request,()->jdbc.sql("SELECT id,code,currency,inclusive,version FROM pricing.price_lists WHERE company_id=:company ORDER BY code").param("company",scope.companyId()).query(rows::row).list());
    }
    @GetMapping({"/api/v1/pricing/standard-prices","/api/v1/pricing/floors"})
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){
        boolean floor=request.getRequestURI().endsWith("/floors");var scope=access(token,request,floor?"pricing.floor.read":"pricing.manage.read");
        return read(scope,request,()->{
            int p=page==null?1:page,size=pageSize==null?25:pageSize;
            require(p>=1 && p<=100000 && size>=1 && size<=100,"page","page must be 1..100000 and pageSize 1..100.");
            var items=jdbc.sql("SELECT * FROM "+table(floor)+" WHERE company_id=:company ORDER BY created_at,id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("size",size).param("offset",(p-1)*size).query(rows::row).list();
            return QuoteDrafts.map("items",items,"page",p,"pageSize",size);
        });
    }
    @GetMapping({"/api/v1/pricing/standard-prices/{id}","/api/v1/pricing/floors/{id}"})
    ResponseEntity<String> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id){
        boolean floor=request.getRequestURI().contains("/floors/");var scope=access(token,request,floor?"pricing.floor.read":"pricing.manage.read");return read(scope,request,()->row(scope,table(floor),id,false));
    }
    @PostMapping("/api/v1/pricing/standard-prices")
    ResponseEntity<String> createStandard(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Standard input){return standard(token,request,null,input);}
    @PutMapping("/api/v1/pricing/standard-prices/{id}")
    ResponseEntity<String> updateStandard(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Standard input){return standard(token,request,id,input);}
    @PostMapping("/api/v1/pricing/floors")
    ResponseEntity<String> createFloor(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Floor input){return floor(token,request,null,input);}
    @PutMapping("/api/v1/pricing/floors/{id}")
    ResponseEntity<String> updateFloor(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Floor input){return floor(token,request,id,input);}
    private ResponseEntity<String> standard(Jwt token,HttpServletRequest request,UUID id,Standard input){
        var scope=access(token,request,"pricing.write");requiredAmount(input.amount,request);
        var result=staff.inCompany(scope,rid(request),()->{
            require(!input.effectiveFrom.toInstant().equals(MIN.toInstant()) && (input.effectiveTo==null || input.effectiveTo.isAfter(input.effectiveFrom)),"effectiveTo","Provide a nonempty [start,end) interval.");amount(input.amount);
            var start=utc(input.effectiveFrom);var end=input.effectiveTo==null?null:utc(input.effectiveTo);
            var body=QuoteDrafts.map("productUnitId",input.productUnitId,"amount",input.amount,"effectiveFrom",start,"effectiveTo",end,"active",input.active);
            return mutate(scope,request,id,false,body,(doc,before)->{
                if(before!=null)same(before,input.productUnitId);unit(scope,input.productUnitId,input.active);
                if(input.active){var floor=jdbc.sql("SELECT amount FROM pricing.price_floor_rules WHERE company_id=:company AND product_unit_id=:unit AND active").param("company",scope.companyId()).param("unit",input.productUnitId).query(BigDecimal.class).optional();
                    if(floor.isPresent() && input.amount.compareTo(floor.get())<0)throw new StaffScope.Failure(422,"price_below_floor","Price needs review against the configured floor.");}
                String sql=id==null?"INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from,effective_to,active,created_by) SELECT :id,:company,id,:unit,:amount,:start,CAST(:end AS timestamptz),:active,:actor FROM pricing.price_lists WHERE company_id=:company AND code='STANDARD' AND currency='AUD'":"UPDATE pricing.price_list_items SET amount=:amount,effective_from=:start,effective_to=CAST(:end AS timestamptz),active=:active WHERE company_id=:company AND id=:id";
                jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("unit",input.productUnitId).param("amount",input.amount).param("start",microseconds(start)).param("end",microseconds(end)).param("active",input.active).param("actor",scope.actorId()).update();
            });
        });return response(result);
    }
    private ResponseEntity<String> floor(Jwt token,HttpServletRequest request,UUID id,Floor input){
        var scope=access(token,request,"pricing.floor.write");requiredAmount(input.amount,request);var result=staff.inCompany(scope,rid(request),()->{
            amount(input.amount);var body=QuoteDrafts.map("productUnitId",input.productUnitId,"amount",input.amount,"active",input.active);
            return mutate(scope,request,id,true,body,(doc,before)->{
                if(before!=null)same(before,input.productUnitId);unit(scope,input.productUnitId,input.active);
                String sql=id==null?"INSERT INTO pricing.price_floor_rules(id,company_id,product_unit_id,amount,active,created_by) VALUES(:id,:company,:unit,:amount,:active,:actor)":"UPDATE pricing.price_floor_rules SET amount=:amount,active=:active WHERE company_id=:company AND id=:id";
                jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("unit",input.productUnitId).param("amount",input.amount).param("active",input.active).param("actor",scope.actorId()).update();
            });
        });return response(result);
    }
    private IdempotentWrite.StoredResponse mutate(StaffScope.CompanyAccess scope,HttpServletRequest request,UUID id,boolean floor,Map<String,Object> body,Mutation mutation){
        return mutate(scope,request,id,table(floor),body,mutation);
    }
    IdempotentWrite.StoredResponse mutate(StaffScope.CompanyAccess scope,HttpServletRequest request,UUID id,String table,Map<String,Object> body,Mutation mutation){
        if(!Set.of("pricing.price_list_items","pricing.price_floor_rules","pricing.customer_price_rules","pricing.promotions","catalog.uoms","catalog.product_categories","core.regions","catalog.warehouses","catalog.products","catalog.product_units","crm.customers","crm.suppliers","crm.customer_branches","crm.contacts").contains(table))throw new IllegalArgumentException("Unregistered pricing table");
        String canonical=QuotePricing.canonical(body);Long expected=id==null?null:version(request.getHeader("If-Match"));
        String requestBody=id==null?canonical:"{\"expected\":"+expected+",\"body\":"+canonical+"}";
        return writes.execute(scope,(id==null?"POST ":"PUT ")+request.getRequestURI(),request.getHeader("Idempotency-Key"),requestBody,()->{
            UUID doc=id==null?UUID.randomUUID():id;Map<String,Object> before=id==null?null:row(scope,table,doc,true);
            if(before!=null && ((Number)before.get("version")).longValue()!=expected)throw new StaffScope.Failure(409,"version_conflict","The resource changed. Refresh and retry with a new key.");
            mutation.run(doc,before);var after=row(scope,table,doc,false);
            audit.record(scope,"foundation.master_data_changed",table,doc,rid(request),QuoteDrafts.map("before",auditBefore(before),"after",auditAfter(body),"version",after.get("version")));
            return new IdempotentWrite.StoredResponse(id==null?201:200,json.writeValueAsString(QuoteDrafts.map("id",doc,"version",after.get("version"))));
        });
    }
    private Map<String,Object> auditAfter(Map<String,Object> body){
        var result=new LinkedHashMap<String,Object>();
        for(var entry:body.entrySet()) {
            String key=Character.toUpperCase(entry.getKey().charAt(0))+entry.getKey().substring(1);
            result.put(key,auditAfterValue(entry.getValue()));
        }
        return result;
    }
    @SuppressWarnings("unchecked")
    private Object auditAfterValue(Object value){
        if(value instanceof OffsetDateTime)return json.readTree(QuotePricing.canonical(QuoteDrafts.map("value",value))).get("value");
        if(value instanceof Map<?,?> map)return auditAfter((Map<String,Object>)map);
        if(value instanceof List<?> list)return list.stream().map(this::auditAfterValue).toList();
        return value;
    }
    @SuppressWarnings("unchecked")
    private static Map<String,Object> auditBefore(Map<String,Object> row){
        if(row==null)return null;
        var result=new LinkedHashMap<String,Object>(row);for(String field:List.of("amount","fixedPrice","discountPercent","reorderPoint","conversionToBase","quantityStep","creditLimit","latitude","longitude"))if(row.get(field)!=null)result.put(field,new BigDecimal(row.get(field).toString()));
        if(row.get("items") instanceof List<?> items)result.put("items",items.stream().map(item->auditBefore((Map<String,Object>)item)).toList());
        return result;
    }
    void unit(StaffScope.CompanyAccess scope,UUID id,boolean active){
        jdbc.sql("SELECT u.id FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=:company AND u.id=:id AND (NOT :active OR (u.active AND m.active AND p.status='ACTIVE' AND p.sell_enabled)) FOR UPDATE OF u")
            .param("company",scope.companyId()).param("id",id).param("active",active).query(UUID.class).optional().orElseThrow(PricingRules::notFound);
    }
    private Map<String,Object> row(StaffScope.CompanyAccess scope,String table,UUID id,boolean lock){return jdbc.sql("SELECT * FROM "+table+" WHERE company_id=:company AND id=:id"+(lock?" FOR UPDATE":"")).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(PricingRules::notFound);}
    private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> work){return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(work.get())));}
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request,String permission){return staff.require(token,request.getHeader("X-Company-Id"),permission);}
    private static String table(boolean floor){return floor?"pricing.price_floor_rules":"pricing.price_list_items";}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse response){return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());}
    private static void same(Map<String,Object> before,UUID unit){require(unit.equals(before.get("productUnitId")),"product_unit_id","Rule ownership and product unit are immutable; deactivate and create a new rule.");}
    private static void require(boolean valid,String field,String text){if(!valid)throw new BranchQuery.InvalidFilter(field,text);}
    private static void amount(BigDecimal amount){SupplierBills.amount(amount,"amount",8,"999999999999.99999999");}
    private static long version(String tag){try {String text=tag==null?"":tag.replaceAll("^\\\"+|\\\"+$","");if(text.matches("[0-9]+")){long value=Long.parseLong(text);if(value>0)return value;}}catch(NumberFormatException ignored){}throw new StaffScope.Failure(428,"version_required","Supply If-Match with a positive current version.");}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    static OffsetDateTime utc(OffsetDateTime time){return time.withOffsetSameInstant(ZoneOffset.UTC).withNano(time.getNano()/100*100);}
    private static final UUID ZERO=new UUID(0,0);private static final OffsetDateTime MIN=OffsetDateTime.parse("0001-01-01T00:00:00Z");
    @FunctionalInterface interface Mutation {void run(UUID id,Map<String,Object> before);}
    static OffsetDateTime microseconds(OffsetDateTime t){return t==null?null:t.withNano(t.getNano()/1000*1000);}
    static void requiredAmount(BigDecimal amount,HttpServletRequest request){if(amount==null)throw new org.springframework.http.converter.HttpMessageNotReadableException("Amount required",new org.springframework.http.server.ServletServerHttpRequest(request));}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Standard {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public OffsetDateTime effectiveFrom=MIN;
        public OffsetDateTime effectiveTo;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Floor {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;
    }
}
