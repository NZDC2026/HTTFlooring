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
class DiscoverySearch {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final CrmParties parties;private final QuotePricing pricing;
 DiscoverySearch(StaffScope staff,JdbcClient jdbc,LegacyRows rows,CrmParties parties,QuotePricing pricing){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.parties=parties;this.pricing=pricing;}
 @GetMapping("/api/v1/search/customers")
 ResponseEntity<String> customers(@RequestParam(required=false) String q,@RequestParam(required=false) String status,@RequestParam(required=false) String sort,@RequestParam(required=false) String descending,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"customers.read");
  return read(scope,request,()->{var args=args(q,page,pageSize,scope);allowed(status,"status",Set.of("ACTIVE","ON_HOLD","INACTIVE"));args.put("status",status);return result(CUSTOMERS.replace("{order}",order(sort,descending,Map.of("code","code","name","legal_name"),"code")),scope,args);});
 }
 @GetMapping("/api/v1/search/products")
 ResponseEntity<String> products(@RequestParam(required=false) String q,@RequestParam(required=false) String status,@RequestParam(required=false) String sort,@RequestParam(required=false) String descending,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"catalog.read");
  return read(scope,request,()->{var args=args(q,page,pageSize,scope);allowed(status,"status",Set.of("ACTIVE","INACTIVE"));args.put("status",status);return result(PRODUCTS.replace("{order}",order(sort,descending,Map.of("sku","sku","name","name"),"sku")),scope,args);});
 }
 @GetMapping("/api/v1/search/{kind:branches|contacts}")
 ResponseEntity<String> related(@PathVariable String kind,@RequestParam(required=false) String q,@RequestParam(required=false) String customerId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"customers.read");UUID customer=LedgerFields.uuid(customerId);
  return read(scope,request,()->{var args=args(q,page,pageSize,scope);if(customer!=null)parties.customerParty(scope,customer);args.put("customer",customer);return result(kind.equals("branches")?BRANCHES:CONTACTS,scope,args);});
 }
 @GetMapping("/api/v1/customers/{customerId}/catalog")
 ResponseEntity<String> customerCatalog(@PathVariable UUID customerId,@RequestParam String warehouseId,@RequestParam(required=false) String q,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"pricing.read");UUID warehouse=LedgerFields.uuid(warehouseId);
  if(!CrmParties.has(scope,"catalog.read")||!CrmParties.has(scope,"inventory.read"))throw new StaffScope.Failure(403,"permission_denied","Catalog and inventory access required.");
  return read(scope,request,()->{
   parties.customerParty(scope,customerId);jdbc.sql("SELECT inventory.require_access('inventory.read',:warehouse)").param("warehouse",warehouse).query((r,n)->0).single();
   var args=args(q,page,pageSize,scope);args.put("warehouse",warehouse);
   var products=jdbc.sql(CATALOG).param("company",scope.companyId()).params(args).query(rows::row).list();
   var now=java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC);var items=new ArrayList<Object>();
   for(var row:products){Object price=null;String code=null;UUID unit=(UUID)row.get("productUnitId");
    try{var facts=pricing.resolve(customerId,unit,now,true);var data=facts.data();price=QuoteDrafts.map("customerId",customerId,"productUnitId",unit,"currency","AUD","unitPrice",facts.unitPrice(),"source",facts.source(),"ruleId",facts.ruleId(),"inclusive",data.get("inclusive"),"taxCode",data.get("tax_code"),"taxRate",data.get("rate"),"conversionToBase",data.get("conversion_to_base"),"quantityStep",data.get("quantity_step"),"pricingAt",now);}
    catch(StaffScope.Failure failure){if(failure.status!=404&&failure.status!=409&&failure.status!=422)throw failure;code=failure.code;}
    items.add(QuoteDrafts.map("product",row,"price",price,"priceUnavailableCode",code));
   }
   return QuoteDrafts.map("customerId",customerId,"warehouseId",warehouse,"items",items,"page",args.get("page"),"pageSize",args.get("size"),"dataAsOf",now);
  });
 }
 private Map<String,Object> args(String q,String page,String pageSize,StaffScope.CompanyAccess scope){
  String text=trim(q);check(text.length()<=100,"q","Search text must be at most 100 characters.");Integer p=LedgerFields.integer(page),s=LedgerFields.integer(pageSize);int number=p==null?1:p,size=s==null?25:s;check(number>=1&&number<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");
  return QuoteDrafts.map("q",text,"page",number,"size",size,"offset",(number-1)*size,"all",CrmParties.has(scope,"customers.all"),"member",scope.membershipId());
 }
 private static void allowed(String value,String field,Set<String> choices){check(value==null||choices.contains(value),field,"Invalid "+field+".");}
 private static String order(String sort,String descending,Map<String,String> names,String fallback){String key=sort==null?fallback:sort;check(names.containsKey(key),"sort","Unsupported sort field.");boolean desc=descending!=null&&LedgerFields.bool(descending);return names.get(key)+(desc?" DESC":" ASC")+",id";}
 private Object result(String sql,StaffScope.CompanyAccess scope,Map<String,Object> args){return QuoteDrafts.map("items",jdbc.sql(sql).param("company",scope.companyId()).params(args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));}
 private ResponseEntity<String> read(StaffScope.CompanyAccess scope,HttpServletRequest request,java.util.function.Supplier<Object> body){return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(QuotePricing.value(body.get())));}
 private static final String CUSTOMERS = """
SELECT c.id,c.code,c.status,p.legal_name,p.abn FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE c.company_id=:company AND (CAST(:status AS text) IS NULL OR c.status=:status) AND (:q='' OR strpos(lower(c.code||' '||p.legal_name||' '||coalesce(p.abn,'')),lower(:q))>0 OR EXISTS(SELECT 1 FROM crm.customer_branches cb WHERE cb.company_id=c.company_id AND cb.customer_id=c.id AND strpos(lower(cb.code||' '||cb.name||' '||cb.address_line1||' '||coalesce(cb.suburb,'')||' '||coalesce(cb.postcode,'')),lower(:q))>0) OR EXISTS(SELECT 1 FROM crm.contacts cc WHERE cc.company_id=c.company_id AND cc.party_id=c.party_id AND strpos(lower(cc.name||' '||coalesce(cc.email,'')||' '||coalesce(cc.phone,'')||' '||coalesce(cc.mobile,'')),lower(:q))>0)) AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=c.company_id AND ca.customer_id=c.id AND ca.membership_id=:member)) ORDER BY {order} LIMIT :size OFFSET :offset
""";
 private static final String PRODUCTS = """
SELECT p.id,p.sku,p.name,p.item_type,p.status,p.sell_enabled,p.buy_enabled FROM catalog.products p WHERE p.company_id=:company AND (CAST(:status AS text) IS NULL OR p.status=:status) AND (:q='' OR strpos(lower(p.sku||' '||p.name),lower(:q))>0 OR EXISTS(SELECT 1 FROM catalog.product_barcodes pb WHERE pb.company_id=p.company_id AND pb.product_id=p.id AND pb.barcode=:q) OR EXISTS(SELECT 1 FROM catalog.product_units u JOIN catalog.unit_barcodes b ON b.company_id=u.company_id AND b.product_unit_id=u.id WHERE u.company_id=p.company_id AND u.product_id=p.id AND b.active AND b.barcode=:q)) ORDER BY {order} LIMIT :size OFFSET :offset
""";
 private static final String BRANCHES = """
SELECT x.id,x.customer_id,x.code,x.name,x.address_line1,x.suburb,x.state,x.postcode,x.active FROM crm.customer_branches x JOIN crm.customers c ON c.company_id=x.company_id AND x.customer_id=c.id WHERE x.company_id=:company AND (CAST(:customer AS uuid) IS NULL OR c.id=:customer) AND (:q='' OR strpos(lower(x.code||' '||x.name||' '||x.address_line1||' '||coalesce(x.suburb,'')||' '||coalesce(x.postcode,'')),lower(:q))>0) AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=c.company_id AND ca.customer_id=c.id AND ca.membership_id=:member)) ORDER BY x.name,x.id LIMIT :size OFFSET :offset
""";
 private static final String CONTACTS = """
SELECT x.id,c.id AS customer_id,x.name,x.email,x.phone,x.mobile,x.job_title,x.is_accounting,x.active FROM crm.contacts x JOIN crm.customers c ON c.company_id=x.company_id AND x.party_id=c.party_id WHERE x.company_id=:company AND (CAST(:customer AS uuid) IS NULL OR c.id=:customer) AND (:q='' OR strpos(lower(x.name||' '||coalesce(x.email,'')||' '||coalesce(x.phone,'')||' '||coalesce(x.mobile,'')),lower(:q))>0) AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=c.company_id AND ca.customer_id=c.id AND ca.membership_id=:member)) ORDER BY x.name,x.id LIMIT :size OFFSET :offset
""";
 private static final String CATALOG = """
SELECT p.id AS product_id,p.sku,p.name,p.item_type,um.code AS unit_code,bu.code AS base_unit_code,u.id AS product_unit_id,coalesce(b.on_hand,0) AS on_hand,coalesce(b.reserved,0) AS reserved,CASE WHEN w.active AND w.kind='SELLABLE' AND p.item_type='STOCK' THEN greatest(0,coalesce(b.on_hand-b.reserved,0)) ELSE 0 END AS available FROM catalog.products p JOIN catalog.product_units u ON u.company_id=p.company_id AND u.product_id=p.id AND u.active JOIN catalog.uoms um ON um.company_id=u.company_id AND um.id=u.uom_id AND um.active JOIN catalog.uoms bu ON bu.company_id=p.company_id AND bu.id=p.base_uom_id JOIN catalog.warehouses w ON w.company_id=p.company_id AND w.id=:warehouse LEFT JOIN inventory.stock_balances b ON b.company_id=p.company_id AND b.product_id=p.id AND b.warehouse_id=w.id WHERE p.company_id=:company AND p.status='ACTIVE' AND p.sell_enabled AND (:q='' OR strpos(lower(p.sku||' '||p.name),lower(:q))>0 OR EXISTS(SELECT 1 FROM catalog.product_barcodes pb WHERE pb.company_id=p.company_id AND pb.product_id=p.id AND pb.barcode=:q) OR EXISTS(SELECT 1 FROM catalog.unit_barcodes bc WHERE bc.company_id=u.company_id AND bc.product_unit_id=u.id AND bc.active AND bc.barcode=:q)) ORDER BY p.sku,u.id LIMIT :size OFFSET :offset
""";
}
