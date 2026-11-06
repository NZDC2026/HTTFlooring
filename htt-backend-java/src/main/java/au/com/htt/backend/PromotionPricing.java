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
class PromotionPricing {
    private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final JsonMapper json;private final PricingRules rules;
    PromotionPricing(StaffScope staff,JdbcClient jdbc,LegacyRows rows,JsonMapper json,PricingRules rules){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.json=json;this.rules=rules;}
    @GetMapping("/api/v1/pricing/promotions")
    ResponseEntity<String> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestParam(required=false) Integer page,@RequestParam(required=false) Integer pageSize){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.manage.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->{
            int p=page==null?1:page,size=pageSize==null?25:pageSize;require(p>=1&&p<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
            var items=jdbc.sql("SELECT * FROM pricing.promotions WHERE company_id=:company ORDER BY created_at,id LIMIT :size OFFSET :offset").param("company",scope.companyId()).param("size",size).param("offset",(p-1)*size).query(rows::row).list();
            return json.writeValueAsString(QuoteDrafts.map("items",items,"page",p,"pageSize",size));
        }));
    }
    @GetMapping("/api/v1/pricing/promotions/{id}")
    ResponseEntity<String> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.manage.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->{
            var parent=jdbc.sql("SELECT * FROM pricing.promotions WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(PromotionPricing::notFound);
            return json.writeValueAsString(QuoteDrafts.map("promotion",parent,"items",items(scope,id)));
        }));
    }
    @PostMapping("/api/v1/pricing/promotions")
    ResponseEntity<String> create(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Input input){return write(token,request,null,input);}
    @PutMapping("/api/v1/pricing/promotions/{id}")
    ResponseEntity<String> update(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Input input){return write(token,request,id,input);}
    private ResponseEntity<String> write(Jwt token,HttpServletRequest request,UUID id,Input input){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.write");
        if(input.items!=null)for(var item:input.items)if(item!=null)PricingRules.requiredAmount(item.amount,request);
        var response=staff.inCompany(scope,rid(request),()->{
            require(!input.startsAt.toInstant().equals(MIN.toInstant()) && input.endsAt.isAfter(input.startsAt),"effectiveTo","Provide a nonempty [start,end) interval.");
            require(input.items!=null && input.items.size()<101 && (!input.active || !input.items.isEmpty()) && input.items.stream().allMatch(i->i!=null && !ZERO.equals(i.productUnitId)) && input.items.stream().map(i->i.productUnitId).distinct().count()==input.items.size(),"items","Active promotions need 1..100 distinct product units.");
            for(var item:input.items)SupplierBills.amount(item.amount,"amount",8,"999999999999.99999999");
            String name=SupplierBills.text(input.name,"name",200,true);var start=PricingRules.utc(input.startsAt);var end=PricingRules.utc(input.endsAt);
            var sorted=input.items.stream().sorted(Comparator.comparing(i->i.productUnitId.toString())).toList();
            var body=QuoteDrafts.map("name",name,"startsAt",start,"endsAt",end,"items",sorted.stream().map(i->QuoteDrafts.map("productUnitId",i.productUnitId,"amount",i.amount)).toList(),"active",input.active);
            return rules.mutate(scope,request,id,"pricing.promotions",body,(doc,before)->{
                for(var item:sorted){
                    rules.unit(scope,item.productUnitId,input.active);
                    if(input.active){var floor=jdbc.sql("SELECT amount FROM pricing.price_floor_rules WHERE company_id=:company AND product_unit_id=:unit AND active").param("company",scope.companyId()).param("unit",item.productUnitId).query(BigDecimal.class).optional();
                        if(floor.isPresent() && item.amount.compareTo(floor.get())<0)throw new StaffScope.Failure(422,"price_below_floor","Price needs review against the configured floor.");}
                }
                if(before!=null)before.put("items",items(scope,doc));
                String sql=id==null?"INSERT INTO pricing.promotions(id,company_id,name,starts_at,ends_at,active,created_by) VALUES(:id,:company,:name,:start,:end,:active,:actor)":"UPDATE pricing.promotions SET name=:name,starts_at=:start,ends_at=:end,active=:active WHERE company_id=:company AND id=:id";
                jdbc.sql(sql).param("id",doc).param("company",scope.companyId()).param("name",name).param("start",PricingRules.microseconds(start)).param("end",PricingRules.microseconds(end)).param("active",input.active).param("actor",scope.actorId()).update();
                jdbc.sql("UPDATE pricing.promotion_items SET active=false WHERE company_id=:company AND promotion_id=:id").param("company",scope.companyId()).param("id",doc).update();
                for(var item:sorted)jdbc.sql("INSERT INTO pricing.promotion_items(company_id,promotion_id,product_unit_id,amount,active,created_by) VALUES(:company,:id,:unit,:amount,true,:actor) ON CONFLICT(company_id,promotion_id,product_unit_id) DO UPDATE SET amount=EXCLUDED.amount,active=true")
                    .param("company",scope.companyId()).param("id",doc).param("unit",item.productUnitId).param("amount",item.amount).param("actor",scope.actorId()).update();
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    private List<Map<String,Object>> items(StaffScope.CompanyAccess scope,UUID id){return jdbc.sql("SELECT id,product_unit_id,amount,active,version FROM pricing.promotion_items WHERE company_id=:company AND promotion_id=:id ORDER BY product_unit_id").param("company",scope.companyId()).param("id",id).query(rows::row).list();}
    private static void require(boolean value,String field,String message){if(!value)throw new BranchQuery.InvalidFilter(field,message);}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final UUID ZERO=new UUID(0,0);private static final OffsetDateTime MIN=OffsetDateTime.parse("0001-01-01T00:00:00Z");
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Input {
        public String name;public List<Item> items;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public OffsetDateTime startsAt=MIN;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public OffsetDateTime endsAt=MIN;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public boolean active=true;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Item {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount;
    }
}
