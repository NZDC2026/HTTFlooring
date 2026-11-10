package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;import java.util.function.Function;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class OperationalReads {
 private final StaffScope staff;private final JdbcClient jdbc;private final LegacyRows rows;private final CrmParties parties;private final JsonMapper json;
 OperationalReads(StaffScope staff,JdbcClient jdbc,LegacyRows rows,CrmParties parties,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.parties=parties;this.json=json;}
 @GetMapping("/api/v1/search")
 ResponseEntity<String> search(@RequestParam(required=false) String q,@RequestParam(required=false) String kind,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  Integer p=LedgerFields.integer(page),n=LedgerFields.integer(pageSize);var scope=staff.require(token,request.getHeader("X-Company-Id"),"search.global.read");
  return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->jdbc.sql("SELECT platform.global_search(CAST(:q AS text),CAST(:kind AS text),:page,:size)::text").params(QuoteDrafts.map("q",q,"kind",kind,"page",p==null?1:p,"size",n==null?25:n)).query(String.class).single()));
 }
 @GetMapping("/api/v1/inventory/valuation")
 ResponseEntity<String> valuation(@RequestParam UUID warehouseId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"inventory.cost.read",scope->{warehouse(warehouseId,"inventory.cost.read");var p=page(page,pageSize);p.put("wh",warehouseId);return list(scope,VALUATION,p);});
 }
 @GetMapping("/api/v1/customers/{id}/advances")
 ResponseEntity<String> customer(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"accounting.receipts.read",scope->{parties.customerParty(scope,id);var p=page(page,pageSize);p.put("id",id);return list(scope,CUSTOMER_ADVANCES,p);});
 }
 @GetMapping("/api/v1/suppliers/{id}/advances")
 ResponseEntity<String> supplier(@PathVariable UUID id,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"purchase.payments.read",scope->{one(scope,"SELECT id FROM crm.suppliers WHERE company_id=:company AND id=:id",Map.of("id",id));var p=page(page,pageSize);p.put("id",id);var total=one(scope,"SELECT coalesce(sum(available),0) AS available FROM accounting.supplier_advance_balances WHERE company_id=:company AND supplier_id=:id",p);var body=new LinkedHashMap<String,Object>();body.put("currency","AUD");body.put("availableAmount",total.get("available"));body.putAll(list(scope,SUPPLIER_ADVANCES,p));return body;});
 }
 @GetMapping("/api/v1/warehouse/purchase-orders")
 ResponseEntity<String> receiving(@RequestParam UUID warehouseId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"purchase.receipts.read",scope->{warehouse(warehouseId,"purchase.receipts.read");var p=page(page,pageSize);p.put("warehouse",warehouseId);return list(scope,RECEIVING,p);});
 }
 @GetMapping("/api/v1/warehouse/purchase-orders/{id}")
 ResponseEntity<String> receivingDetail(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"purchase.receipts.read",scope->{var head=one(scope,HEADER,Map.of("id",id));warehouse((UUID)head.get("warehouseId"),"purchase.receipts.read");var lines=query(scope,LINES,Map.of("id",id)).query(rows::row).list();for(var line:lines)for(String key:List.of("unitCost","net","tax","gross","valuationAmount","taxRate","recoverableGst","valueAfter","debitAccountId","grniAccountId","journalEntryId"))line.remove(key);return QuoteDrafts.map("id",id,"number",head.get("number"),"version",head.get("version"),"status",head.get("status"),"warehouseId",head.get("warehouseId"),"supplier",json.readTree(head.get("supplierSnapshot").toString()),"notes",head.get("notes"),"lines",lines);});
 }
 @GetMapping("/api/v1/accounting/grni")
 ResponseEntity<String> grni(@RequestParam(required=false) String supplierId,@RequestParam(required=false) String warehouseId,@RequestParam(required=false) String page,@RequestParam(required=false) String pageSize,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  return read(token,request,"purchase.grni.read",scope->{var p=page(page,pageSize);p.put("supplier",LedgerFields.uuid(supplierId));p.put("warehouse",LedgerFields.uuid(warehouseId));var total=one(scope,GRNI_TOTAL,p);var body=new LinkedHashMap<String,Object>();body.put("currency","AUD");body.put("accruedAmount",total.get("amount"));body.putAll(list(scope,GRNI_ROWS,p));return body;});
 }
 private void warehouse(UUID id,String cap){jdbc.sql("SELECT inventory.require_access(:cap,:id)").param("cap",cap).param("id",id).query((rs,n)->0).single();}
 private Map<String,Object> list(StaffScope.CompanyAccess scope,String sql,Map<String,Object> args){return QuoteDrafts.map("items",query(scope,sql,args).query(rows::row).list(),"page",args.get("page"),"pageSize",args.get("size"));}
 private Map<String,Object> one(StaffScope.CompanyAccess scope,String sql,Map<String,?> args){return query(scope,sql,args).query(rows::row).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
 private JdbcClient.StatementSpec query(StaffScope.CompanyAccess scope,String sql,Map<String,?> args){return jdbc.sql(sql).param("company",scope.companyId()).params(args);}
 private ResponseEntity<String> read(Jwt token,HttpServletRequest request,String cap,Function<StaffScope.CompanyAccess,Object> action){var scope=staff.require(token,request.getHeader("X-Company-Id"),cap);return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->json.writeValueAsString(action.apply(scope))));}
 private static Map<String,Object> page(String p,String s){Integer a=LedgerFields.integer(p),b=LedgerFields.integer(s);int n=a==null?1:a,size=b==null?25:b;MasterDataChecks.check(n>=1&&n<=100000&&size>=1&&size<=100,"page","page must be 1..100000 and pageSize 1..100.");return QuoteDrafts.map("page",n,"size",size,"offset",(n-1)*size);}
 private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
 private static final String VALUATION="""
SELECT b.product_id,b.on_hand,v.value,v.stock_balance_id IS NOT NULL AS initialized,CASE WHEN b.on_hand>0 THEN v.value/b.on_hand END AS average_unit_cost FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=:company AND b.warehouse_id=:wh ORDER BY b.product_id LIMIT :size OFFSET :offset
""";
 private static final String CUSTOMER_ADVANCES="""
SELECT a.id,a.receipt_id,r.received_on::text,a.order_line_id,a.amount,a.gst_amount,a.gst_basis,a.tax_code_id,
                 a.available,a.applied_amount,a.refunded_amount,a.reversal_id
                FROM accounting.customer_advance_balances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE r.company_id=:company AND r.customer_id=:id ORDER BY r.created_at DESC,a.id LIMIT :size OFFSET :offset
""";
 private static final String SUPPLIER_ADVANCES="""
SELECT a.*,p.paid_on::text FROM accounting.supplier_advance_balances a JOIN accounting.supplier_payments p ON p.company_id=a.company_id AND p.id=a.payment_id WHERE a.company_id=:company AND a.supplier_id=:id ORDER BY p.created_at DESC,a.id LIMIT :size OFFSET :offset
""";
 private static final String RECEIVING="""
SELECT o.id,d.number,d.version,o.supplier_id,o.supplier_snapshot->>'legalName' AS supplier_name,o.expected_on::text
                FROM purchase.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=:company AND o.warehouse_id=:warehouse AND o.status='CONFIRMED' AND EXISTS(
                 SELECT 1 FROM purchase.order_lines l WHERE l.company_id=o.company_id AND l.order_id=o.id AND l.quantity>coalesce((SELECT sum(quantity) FROM purchase.receipt_lines WHERE company_id=l.company_id AND order_line_id=l.id),0)) ORDER BY o.created_at,o.id LIMIT :size OFFSET :offset
""";
 private static final String HEADER="""
SELECT o.*,o.expected_on::text AS expected_on,d.number,d.state,d.version,d.business_date::text FROM purchase.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=:company AND o.id=:id
""";
 private static final String LINES="""
SELECT l.id,dl.line_no,l.product_id,l.product_unit_id,l.item_type,l.quantity,l.base_quantity,l.unit_cost,l.net,l.tax,l.gross,l.valuation_amount,l.tax_rate,l.recoverable_gst,
         l.snapshot->>'sku' AS sku,l.snapshot->>'name' AS name,l.snapshot->>'unitCode' AS unit_code,(l.snapshot->>'conversionToBase')::numeric AS conversion_to_base,(l.snapshot->>'quantityStep')::numeric AS quantity_step,
         coalesce((SELECT sum(quantity) FROM purchase.receipt_lines WHERE company_id=l.company_id AND order_line_id=l.id),0) AS received_quantity
        FROM purchase.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=:company AND l.order_id=:id ORDER BY dl.line_no
""";
 private static final String GRNI_TOTAL="""
SELECT coalesce(sum(g.amount-coalesce((SELECT sum(bl.grni_amount) FROM purchase.bill_lines bl WHERE bl.company_id=g.company_id AND bl.grni_item_id=g.id),0)-coalesce((SELECT sum(rl.valuation_amount) FROM purchase.return_lines rl WHERE rl.company_id=g.company_id AND rl.receipt_line_id=g.receipt_line_id AND rl.bill_line_id IS NULL),0)),0) AS amount FROM accounting.grni_items g JOIN purchase.receipt_lines l ON l.company_id=g.company_id AND l.id=g.receipt_line_id JOIN purchase.receipts r ON r.company_id=l.company_id AND r.id=l.receipt_id WHERE g.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR g.supplier_id=CAST(:supplier AS uuid)) AND (CAST(:warehouse AS uuid) IS NULL OR r.warehouse_id=CAST(:warehouse AS uuid))
""";
 private static final String GRNI_ROWS="""
SELECT g.id,g.receipt_line_id,r.id AS receipt_id,d.number,r.order_id,g.supplier_id,g.party_id,r.warehouse_id,d.business_date::text,g.amount,g.amount-coalesce((SELECT sum(bl.grni_amount) FROM purchase.bill_lines bl WHERE bl.company_id=g.company_id AND bl.grni_item_id=g.id),0)-coalesce((SELECT sum(rl.valuation_amount) FROM purchase.return_lines rl WHERE rl.company_id=g.company_id AND rl.receipt_line_id=g.receipt_line_id AND rl.bill_line_id IS NULL),0) AS outstanding_amount,g.debit_account_id,g.grni_account_id,g.journal_entry_id FROM accounting.grni_items g JOIN purchase.receipt_lines l ON l.company_id=g.company_id AND l.id=g.receipt_line_id JOIN purchase.receipts r ON r.company_id=l.company_id AND r.id=l.receipt_id JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=r.company_id AND d.id=r.id WHERE g.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR g.supplier_id=CAST(:supplier AS uuid)) AND (CAST(:warehouse AS uuid) IS NULL OR r.warehouse_id=CAST(:warehouse AS uuid)) ORDER BY d.business_date,g.id LIMIT :size OFFSET :offset
""";
}
