package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class QuoteDrafts {
    private final StaffScope staff;private final JdbcClient jdbc;private final QuotePricing pricing;private final LegacyRows rows;
    private final IdempotentWrite writes;private final StaffAudit audit;
    QuoteDrafts(StaffScope staff,JdbcClient jdbc,QuotePricing pricing,LegacyRows rows,IdempotentWrite writes,StaffAudit audit) {
        this.staff=staff;this.jdbc=jdbc;this.pricing=pricing;this.rows=rows;this.writes=writes;this.audit=audit;
    }
    @PostMapping("/api/v1/quotes")
    ResponseEntity<String> create(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.quotes.write");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,rid,()->{
            customer(scope,input.customerId);
            return writes.execute(scope,"POST /quotes",request.getHeader("Idempotency-Key"),canonical(input),()->{
                var built=build(scope,input);UUID id=UUID.randomUUID();
                jdbc.sql("INSERT INTO platform.documents(id,company_id,document_type,business_date,created_by) VALUES(:id,:company,'QUOTE',:today,:actor)")
                    .param("id",id).param("company",scope.companyId()).param("today",built.today).param("actor",scope.actorId()).update();
                save(scope,id,built);
                audit.record(scope,"sales.quote_drafted","quote",id,rid,Map.of());
                return new IdempotentWrite.StoredResponse(201,"{\"id\":\""+id+"\",\"number\":null,\"status\":\"DRAFT\",\"version\":1}");
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    void customer(StaffScope.CompanyAccess scope,UUID customer) {
        jdbc.sql("SELECT c.id FROM crm.customers c WHERE c.company_id=:company AND c.id=:id AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments a WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership))")
            .param("company",scope.companyId()).param("id",customer).param("all",has(scope,"customers.all")).param("membership",scope.membershipId()).query(UUID.class).optional().orElseThrow(QuoteDrafts::notFound);
    }
    Built build(StaffScope.CompanyAccess scope,Input input) {
        customer(scope,input.customerId);
        var c=jdbc.sql("SELECT c.*,p.legal_name,p.abn FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE c.company_id=:company AND c.id=:id FOR SHARE OF c,p")
            .param("company",scope.companyId()).param("id",input.customerId).query(rows::row).optional().orElseThrow(QuoteDrafts::notFound);
        if (!"ACTIVE".equals(c.get("status"))) throw new StaffScope.Failure(409,"customer_on_hold","Customer must be active before quoting or conversion.");
        var branch=jdbc.sql("SELECT * FROM crm.customer_branches WHERE company_id=:company AND id=:id AND customer_id=:customer AND active FOR SHARE")
            .param("company",scope.companyId()).param("id",input.customerBranchId).param("customer",input.customerId).query(rows::row).optional().orElseThrow(QuoteDrafts::notFound);
        String country=(String)branch.get("country"),state=(String)branch.get("state"),postcode=(String)branch.get("postcode");
        require(country!=null && country.matches("[A-Z]{2}"),"country","Use a two-letter country code.");
        if (country.equals("AU")) {require(state!=null && Set.of("ACT","NSW","NT","QLD","SA","TAS","VIC","WA").contains(state),"state","An Australian state/territory is required.");require(postcode!=null && postcode.matches("[0-9]{4}"),"postcode","Australian postcode must contain four digits.");}
        jdbc.sql("SELECT w.id FROM catalog.warehouses w WHERE w.company_id=:company AND w.id=:id AND w.active AND w.kind='SELLABLE' AND (:all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=:membership)) FOR SHARE")
            .param("company",scope.companyId()).param("id",input.warehouseId).param("all",has(scope,"warehouses.all")).param("membership",scope.membershipId()).query(UUID.class).optional().orElseThrow(QuoteDrafts::notFound);
        LocalDate today=jdbc.sql("SELECT (CURRENT_TIMESTAMP AT TIME ZONE timezone)::date FROM core.companies WHERE id=:company").param("company",scope.companyId()).query(LocalDate.class).single();
        LocalDate expiry=input.expiresOn;
        if (expiry==null) expiry=today.plusDays(jdbc.sql("SELECT quote_valid_days FROM core.business_preferences WHERE company_id=:company").param("company",scope.companyId()).query(Integer.class).single());
        require(input.lines!=null && !input.lines.isEmpty() && input.lines.size()<=50 && input.lines.stream().allMatch(l->l!=null && l.productUnitId!=null && !ZERO.equals(l.productUnitId)),"lines","Quote requires 1..50 valid product-unit lines.");
        require(!expiry.isBefore(today),"expiresOn","Quote expiry must not precede the company business date.");
        for (var l:input.lines) {
            require((l.quantity!=null)!=(l.requestedArea!=null),"quantity","Supply quantity or requestedArea, exactly one.");BigDecimal qty=l.quantity!=null?l.quantity:l.requestedArea;
            amount(qty,"quantity",6);require(qty.signum()>0,"quantity","Quantity must be positive.");if (l.unitPrice!=null) amount(l.unitPrice,"unitPrice",8);
            require(l.discountPercent.signum()>=0 && l.discountPercent.compareTo(new BigDecimal("100"))<=0 && l.discountPercent.stripTrailingZeros().scale()<=6,"discountPercent","Discount must be 0..100 with at most six decimals.");
        }
        String notes=SupplierBills.text(input.notes,"notes",2000,false);if(notes==null)notes="";
        for (UUID unit:input.lines.stream().map(l->l.productUnitId).distinct().sorted().toList()) jdbc.sql("SELECT u.id FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id WHERE u.company_id=:company AND u.id=:id AND u.active AND p.status='ACTIVE' AND p.sell_enabled FOR SHARE OF u,p")
            .param("company",scope.companyId()).param("id",unit).query(UUID.class).optional().orElseThrow(QuoteDrafts::notFound);
        OffsetDateTime at=OffsetDateTime.now(ZoneOffset.UTC);var lines=new ArrayList<BuiltLine>();BigDecimal net=BigDecimal.ZERO,tax=BigDecimal.ZERO;
        for (var l:input.lines) {
            var facts=pricing.resolve(input.customerId,l.productUnitId,at,false);var d=facts.data();BigDecimal conversion=number(d,"conversion_to_base"),step=number(d,"quantity_step");
            boolean whole=(Boolean)d.get("whole_packs");String code=(String)d.get("unit_code");
            if(whole && code.equals("BOX")) require(step.stripTrailingZeros().scale()<=0,"quantityStep","Whole-box units require an integer step.");
            BigDecimal quantity=l.quantity;
            if(l.requestedArea!=null) {require(code.equals("BOX") && "M2".equals(d.get("base_unit_code")),"requestedArea","Area input requires a BOX selling unit with M2 base unit.");quantity=l.requestedArea.divide(conversion.multiply(step),0,RoundingMode.CEILING).multiply(step);}
            require(quantity.remainder(step).signum()==0 && (!whole || !code.equals("BOX") || quantity.stripTrailingZeros().scale()<=0),"quantity","Quantity must respect the configured selling step and whole-pack policy.");
            BigDecimal base=quantity.multiply(conversion);amount(base,"baseQuantity",6);
            if(whole && !code.equals("BOX")) {
                var packs=jdbc.sql("SELECT u.conversion_to_base FROM catalog.product_units u JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=:company AND u.product_id=:product AND u.active AND m.code='BOX'")
                    .param("company",scope.companyId()).param("product",d.get("product_id")).query(BigDecimal.class).list();
                if(!packs.isEmpty())require(base.remainder(packs.getFirst()).signum()==0,"quantity","Use full packs or enter requestedArea with the BOX unit.");
            }
            boolean manual=(l.unitPrice!=null && l.unitPrice.compareTo(facts.unitPrice())!=0)||l.discountPercent.signum()!=0;
            if(manual && !has(scope,"sales.quotes.price.override"))throw new StaffScope.Failure(403,"permission_denied","Quote price override is not permitted.");
            BigDecimal price=(l.unitPrice==null?facts.unitPrice():l.unitPrice).multiply(BigDecimal.ONE.subtract(l.discountPercent.movePointLeft(2)));
            if(price.scale()>8)price=price.setScale(8,RoundingMode.HALF_UP);
            if(facts.floor()!=null && price.compareTo(facts.floor())<0)throw new StaffScope.Failure(422,"price_below_floor","Quote selling price is below the permitted floor.");
            BigDecimal rate=number(d,"rate");boolean inclusive=(Boolean)d.get("inclusive");var totals=tax(quantity.multiply(price),rate,inclusive);amount(totals[2],"gross",2);
            var snapshot=map("sku",d.get("sku"),"name",d.get("name"),"unitCode",code,"conversionToBase",conversion,"quantityStep",step,"requestedArea",l.requestedArea,"quantity",quantity,"baseQuantity",base,"unitPrice",price,"taxRate",rate,"inclusive",inclusive,"taxCode",d.get("tax_code"),"priceSource",manual?"MANUAL":facts.source(),"priceRuleId",facts.ruleId(),"discountPercent",l.discountPercent,"standardUnitPrice",d.get("amount"));
            lines.add(new BuiltLine(l,(UUID)d.get("product_id"),(String)d.get("item_type"),quantity,base,price,rate,inclusive,totals[0],totals[1],totals[2],snapshot,facts.signature()));net=net.add(totals[0]);tax=tax.add(totals[1]);
        }
        amount(net.add(tax),"gross",2);
        var snapshot=map("customerId",input.customerId,"legalName",c.get("legalName"),"abn",c.get("abn"),"branchId",input.customerBranchId,"branchName",branch.get("name"),"addressLine1",branch.get("addressLine1"),"suburb",branch.get("suburb"),"state",state,"postcode",postcode,"country",country);
        return new Built(input,today,expiry,notes,snapshot,lines,net,tax,net.add(tax),at);
    }
    void save(StaffScope.CompanyAccess scope,UUID id,Built b) {
        jdbc.sql("INSERT INTO sales.quotes(id,company_id,customer_id,customer_branch_id,warehouse_id,expires_on,notes,customer_snapshot,net,tax,gross,pricing_at,created_by) VALUES(:id,:company,:customer,:branch,:warehouse,:expiry,:notes,CAST(:snapshot AS jsonb),:net,:tax,:gross,:at,:actor)")
            .param("id",id).param("company",scope.companyId()).param("customer",b.input.customerId).param("branch",b.input.customerBranchId).param("warehouse",b.input.warehouseId).param("expiry",b.expiry).param("notes",b.notes).param("snapshot",QuotePricing.canonical(b.snapshot)).param("net",b.net).param("tax",b.tax).param("gross",b.gross).param("at",b.at).param("actor",scope.actorId()).update();
        int no=0;for(var l:b.lines) {
            UUID line=UUID.randomUUID();jdbc.sql("INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(:line,:company,:id,:no,:actor)").param("line",line).param("company",scope.companyId()).param("id",id).param("no",++no).param("actor",scope.actorId()).update();
            jdbc.sql("INSERT INTO sales.quote_lines(id,company_id,quote_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_price,tax_rate,inclusive,net,tax,gross,input,snapshot,pricing_signature,created_by) VALUES(:line,:company,:id,:product,:unit,:type,:qty,:base,:price,:rate,:inclusive,:net,:tax,:gross,CAST(:input AS jsonb),CAST(:snapshot AS jsonb),:signature,:actor)")
                .param("line",line).param("company",scope.companyId()).param("id",id).param("product",l.product).param("unit",l.input.productUnitId).param("type",l.type).param("qty",l.qty).param("base",l.base).param("price",l.price).param("rate",l.rate).param("inclusive",l.inclusive).param("net",l.net).param("tax",l.tax).param("gross",l.gross).param("input",QuotePricing.canonical(lineMap(l.input))).param("snapshot",QuotePricing.canonical(l.snapshot)).param("signature",l.signature).param("actor",scope.actorId()).update();
        }
    }
    static BigDecimal[] tax(BigDecimal amount,BigDecimal rate,boolean inclusive) {
        if(amount.signum()<0 || rate.signum()<0 || rate.compareTo(BigDecimal.ONE)>0)throw new StaffScope.Failure(422,"invalid_tax_input","Amount and rate are outside the supported range.");
        BigDecimal gross=inclusive?amount.setScale(2,RoundingMode.HALF_UP):BigDecimal.ZERO;
        BigDecimal net=inclusive?gross.divide(BigDecimal.ONE.add(rate),28,RoundingMode.HALF_EVEN).setScale(2,RoundingMode.HALF_UP):amount.setScale(2,RoundingMode.HALF_UP);
        BigDecimal tax=inclusive?gross.subtract(net):net.multiply(rate).setScale(2,RoundingMode.HALF_UP);return new BigDecimal[]{net,tax,net.add(tax)};
    }
    static Map<String,Object> map(Object... values) {var m=new LinkedHashMap<String,Object>();for(int i=0;i<values.length;i+=2)m.put((String)values[i],values[i+1]);return m;}
    static Map<String,Object> lineMap(Line l) {return map("productUnitId",l.productUnitId,"quantity",l.quantity,"requestedArea",l.requestedArea,"unitPrice",l.unitPrice,"discountPercent",l.discountPercent);}
    static String canonical(Input i) {return QuotePricing.canonical(map("customerId",i.customerId,"customerBranchId",i.customerBranchId,"warehouseId",i.warehouseId,"lines",i.lines==null?null:i.lines.stream().map(l->l==null?null:lineMap(l)).toList(),"expiresOn",i.expiresOn,"notes",i.notes));}
    private static boolean has(StaffScope.CompanyAccess scope,String p){return List.of(scope.permissions()).contains(p);}
    private static BigDecimal number(Map<String,Object>d,String k){return (BigDecimal)d.get(k);}
    private static void amount(BigDecimal n,String field,int scale){SupplierBills.amount(n,field,scale,scale==8?"999999999999.99999999":scale==6?"99999999999999.999999":"999999999999999999.99");}
    private static void require(boolean valid,String field,String message){if(!valid)throw new BranchQuery.InvalidFilter(field,message);}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static final UUID ZERO=new UUID(0,0);
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Input {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID customerBranchId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID warehouseId=ZERO;
        public List<Line> lines;public LocalDate expiresOn;public String notes;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID productUnitId=ZERO;
        public BigDecimal quantity,requestedArea,unitPrice;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal discountPercent=BigDecimal.ZERO;
    }
    record Built(Input input,LocalDate today,LocalDate expiry,String notes,Map<String,Object> snapshot,List<BuiltLine> lines,BigDecimal net,BigDecimal tax,BigDecimal gross,OffsetDateTime at) {}
    record BuiltLine(Line input,UUID product,String type,BigDecimal qty,BigDecimal base,BigDecimal price,BigDecimal rate,boolean inclusive,BigDecimal net,BigDecimal tax,BigDecimal gross,Map<String,Object> snapshot,String signature) {}
}
