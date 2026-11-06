package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
class CustomerPricing {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules rules;private final QuoteDrafts drafts;
    CustomerPricing(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules rules,QuoteDrafts drafts){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.rules=rules;this.drafts=drafts;}
    @GetMapping("/api/v1/pricing/customer-prices")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.manage.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->{
            int p=page==null?1:page,size=pageSize==null?25:pageSize;
            require(p>=1 && p<=100000 && size>=1 && size<=100,"page","page must be 1..100000 and pageSize 1..100.");
            var items=jdbc.sql("SELECT r.* FROM pricing.customer_price_rules r WHERE r.company_id=:company AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=r.company_id AND a.customer_id=r.customer_id AND a.membership_id=:membership)) ORDER BY r.created_at,r.id LIMIT :size OFFSET :offset")
                .param("company",scope.companyId()).param("all",List.of(scope.permissions()).contains("customers.all")).param("membership",scope.membershipId()).param("size",size).param("offset",(p-1)*size).query(rows::row).list();
            return json.writeValueAsString(QuoteDrafts.map("items",items,"page",p,"pageSize",size));
        }));
    }
    @GetMapping("/api/v1/pricing/customer-prices/{id}")
    ResponseEntity<String> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.manage.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->{
            var row=jdbc.sql("SELECT * FROM pricing.customer_price_rules WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(CustomerPricing::notFound);
            drafts.customer(scope,(UUID)row.get("customerId"));return json.writeValueAsString(row);
        }));
    }
    @PostMapping("/api/v1/pricing/customer-prices")
    ResponseEntity<String> create(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Input input){return write(token,request,null,input);}
    @PutMapping("/api/v1/pricing/customer-prices/{id}")
    ResponseEntity<String> update(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Input input){return write(token,request,id,input);}
    private ResponseEntity<String> write(Jwt token,HttpServletRequest request,UUID id,Input input){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.write");
        var response=staff.inCompany(scope,rid(request),()->{
            require(!input.effectiveFrom.toInstant().equals(MIN.toInstant()) && (input.effectiveTo==null || input.effectiveTo.isAfter(input.effectiveFrom)),"effectiveTo","Provide a nonempty [start,end) interval.");
            require("FIXED_PRICE".equals(input.method)||"DISCOUNT_PERCENT".equals(input.method),"method","Invalid method.");
            if("FIXED_PRICE".equals(input.method)) {
                require(input.fixedPrice!=null && input.discountPercent==null,"fixedPrice","Fixed pricing requires only fixedPrice.");
                SupplierBills.amount(input.fixedPrice,"fixedPrice",8,"999999999999.99999999");
            } else require(input.fixedPrice==null && input.discountPercent!=null && input.discountPercent.signum()>=0 && input.discountPercent.compareTo(new BigDecimal("100"))<=0 && input.discountPercent.stripTrailingZeros().scale()<=6,
                "discountPercent","Discount pricing requires only discountPercent, 0..100 with at most six decimals.");
            var start=PricingRules.utc(input.effectiveFrom);var end=input.effectiveTo==null?null:PricingRules.utc(input.effectiveTo);
            drafts.customer(scope,input.customerId);
            if(id!=null)jdbc.sql("SELECT id FROM pricing.customer_price_rules WHERE company_id=:company AND id=:id AND customer_id=:customer")
                .param("company",scope.companyId()).param("id",id).param("customer",input.customerId).query(UUID.class).optional().orElseThrow(CustomerPricing::notFound);
            var body=QuoteDrafts.map("customerId",input.customerId,"productUnitId",input.productUnitId,"method",input.method,"fixedPrice",input.fixedPrice,"discountPercent",input.discountPercent,"effectiveFrom",start,"effectiveTo",end,"active",input.active);
            return rules.mutate(scope,request,id,"pricing.customer_price_rules",body,(doc,before)->{
                if(before!=null){same(before,"customerId","customer_id",input.customerId);same(before,"productUnitId","product_unit_id",input.productUnitId);}
                rules.unit(scope,input.productUnitId,input.active);
                if(input.fixedPrice!=null && input.active) {
                    var floor=jdbc.sql("SELECT amount FROM pricing.price_floor_rules WHERE company_id=:company AND product_unit_id=:unit AND active").param("company",scope.companyId()).param("unit",input.productUnitId).query(BigDecimal.class).optional();
                    if(floor.isPresent() && input.fixedPrice.compareTo(floor.get())<0)throw new StaffScope.Failure(422,"price_below_floor","Price needs review against the configured floor.");
                }
                String sql=id==null?"INSERT INTO pricing.customer_price_rules(id,company_id,customer_id,product_unit_id,method,fixed_price,discount_percent,effective_from,effective_to,active,created_by) VALUES(:id,:company,:customer,:unit,:method,CAST(:fixed AS numeric),CAST(:discount AS numeric),:start,CAST(:end AS timestamptz),:active,:actor)":"UPDATE pricing.customer_price_rules SET method=:method,fixed_price=CAST(:fixed AS numeric),discount_percent=CAST(:discount AS numeric),effective_from=:start,effective_to=CAST(:end AS timestamptz),active=:active WHERE company_id=:company AND id=:id";
                jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("customer",input.customerId).param("unit",input.productUnitId).param("method",input.method).param("fixed",input.fixedPrice).param("discount",input.discountPercent).param("start",PricingRules.microseconds(start)).param("end",PricingRules.microseconds(end)).param("active",input.active).param("actor",scope.actorId()).update();
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    private static void same(Map<String,Object> row,String key,String field,UUID id){require(id.equals(row.get(key)),field,"Rule ownership and product unit are immutable; deactivate and create a new rule.");}
    private static void require(boolean valid,String field,String message){if(!valid)throw new BranchQuery.InvalidFilter(field,message);}
    private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final UUID ZERO=new UUID(0,0);private static final OffsetDateTime MIN=OffsetDateTime.parse("0001-01-01T00:00:00Z");
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Input {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=ZERO;
        public String method;public BigDecimal fixedPrice,discountPercent;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public OffsetDateTime effectiveFrom=MIN;
        public OffsetDateTime effectiveTo;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;
    }
}
