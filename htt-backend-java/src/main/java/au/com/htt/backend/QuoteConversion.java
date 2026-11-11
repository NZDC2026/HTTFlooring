package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class QuoteConversion {
    private final StaffScope staff;private final JdbcClient jdbc;private final QuoteDrafts drafts;private final LegacyRows rows;
    private final IdempotentWrite writes;private final StaffAudit audit;private final OrderConfirmation confirmation;private final JsonMapper json;
    QuoteConversion(StaffScope staff,JdbcClient jdbc,QuoteDrafts drafts,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,OrderConfirmation confirmation,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.drafts=drafts;this.rows=rows;this.writes=writes;this.audit=audit;this.confirmation=confirmation;this.json=json;
    }
    @PostMapping("/api/v1/quotes/{id}/approve-and-convert")
    ResponseEntity<String> convert(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody OrderWrites.Review input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.quotes.approve");String rid=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,rid,()->{
            long expected=OrderWrites.version(request.getHeader("If-Match"));String reason=SupplierBills.text(input.reason(),"reason",2000,true);drafts.quote(scope,id,false);
            return writes.execute(scope,"POST /quotes/"+id+"/approve-and-convert",request.getHeader("Idempotency-Key"),"{\"expected\":"+expected+",\"reason\":"+CollaborationCreate.legacyString(reason)+"}",()->{
                var q=drafts.quote(scope,id,true);
                if("CONVERTED".equals(q.get("status"))) {
                    var existing=jdbc.sql("SELECT o.id,d.number,d.version,o.approved_quote_version FROM sales.orders o JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=:company AND o.source_quote_id=:id")
                        .param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(QuoteConversion::notFound);
                    if(((Number)existing.get("approvedQuoteVersion")).longValue()!=expected)throw new StaffScope.Failure(409,"version_conflict","This quote was converted from another version.");
                    return stored(200,existing.get("id"),existing.get("number"),existing.get("version"),id,true);
                }
                if(((Number)q.get("version")).longValue()!=expected)throw new StaffScope.Failure(409,"version_conflict","Document changed; refresh before retrying.");
                if(!"SUBMITTED".equals(q.get("status")))throw new StaffScope.Failure(409,"quote_not_submitted","Submit the quote before office approval.");
                UUID customer=(UUID)q.get("customerId"),branch=(UUID)q.get("customerBranchId"),warehouse=(UUID)q.get("warehouseId");
                jdbc.sql("SELECT id FROM crm.customers WHERE company_id=:company AND id=:id FOR UPDATE").param("company",scope.companyId()).param("id",customer).query(UUID.class).optional().orElseThrow(QuoteConversion::notFound);
                var context=drafts.context(scope,customer,branch,warehouse);
                if(jdbc.sql("SELECT sales.quote_conversion_expired(:id)").param("id",id).query(Boolean.class).single())throw new StaffScope.Failure(409,"quote_expired","Return the quote to draft and refresh its validity before approval.");
                UUID approval=jdbc.sql("SELECT id FROM platform.approval_requests WHERE company_id=:company AND document_id=:id AND document_version=:version AND state='PENDING' FOR UPDATE")
                    .param("company",scope.companyId()).param("id",id).param("version",expected).query(UUID.class).optional().orElseThrow(QuoteConversion::notFound);
                var lines=jdbc.sql("SELECT l.*,dl.line_no FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=:company AND l.quote_id=:id ORDER BY dl.line_no")
                    .param("company",scope.companyId()).param("id",id).query(rows::row).list();
                for(UUID unit:lines.stream().map(l->(UUID)l.get("productUnitId")).distinct().sorted(Comparator.comparing(UUID::toString)).toList()) {
                    var current=jdbc.sql("SELECT u.conversion_to_base,p.item_type FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id WHERE u.company_id=:company AND u.id=:id AND u.active AND m.active AND p.status='ACTIVE' AND p.sell_enabled FOR SHARE OF u,p")
                        .param("company",scope.companyId()).param("id",unit).query(rows::row).optional().orElseThrow(QuoteConversion::notFound);
                    var floor=jdbc.sql("SELECT amount FROM pricing.price_floor_rules WHERE company_id=:company AND product_unit_id=:id AND active").param("company",scope.companyId()).param("id",unit).query(BigDecimal.class).optional();
                    for(var line:lines)if(unit.equals(line.get("productUnitId"))) {
                        if(!Objects.equals(current.get("itemType"),line.get("itemType")) || number(line,"quantity").multiply(number(current,"conversionToBase")).compareTo(number(line,"baseQuantity"))!=0)
                            throw new StaffScope.Failure(409,"product_changed","Return the quote to draft after product or unit changes.");
                        if(floor.isPresent() && number(line,"unitPrice").compareTo(floor.get())<0)throw new StaffScope.Failure(409,"price_below_floor","Current floor policy requires a refreshed quote.");
                    }
                }
                var frozen=lines.stream().map(l->new OrderConfirmation.Line(((Number)l.get("lineNo")).intValue(),(UUID)l.get("id"),(UUID)l.get("productId"),(UUID)l.get("productUnitId"),(String)l.get("itemType"),number(l,"quantity"),number(l,"baseQuantity"),number(l,"unitPrice"),number(l,"net"),number(l,"tax"),number(l,"gross"),l.get("snapshot").toString())).toList();
                var confirmed=confirmation.confirm(scope,new OrderConfirmation.Request(customer,branch,warehouse,context.today(),context.creditLimit(),q.get("customerSnapshot").toString(),number(q,"net"),number(q,"tax"),number(q,"gross"),frozen,id,expected,null,(String)q.get("notes"),OffsetDateTime.parse(q.get("pricingAt").toString())));
                jdbc.sql("UPDATE platform.approval_requests SET state='APPROVED' WHERE company_id=:company AND id=:approval").param("company",scope.companyId()).param("approval",approval).update();
                jdbc.sql("INSERT INTO platform.approval_actions(company_id,request_id,actor_id,action,reason) VALUES(:company,:approval,:actor,'APPROVE',:reason)")
                    .param("company",scope.companyId()).param("approval",approval).param("actor",scope.actorId()).param("reason",reason).update();
                jdbc.sql("UPDATE sales.quotes SET status='CONVERTED' WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).update();
                jdbc.sql("UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=:company AND id=:id").param("company",scope.companyId()).param("id",id).update();
                audit.record(scope,"sales.order_confirmed","sales_order",confirmed.id(),rid,Map.of("sourceQuoteId",id,"sourceQuoteVersion",expected,"reason",reason,"number",confirmed.number()));
                return stored(201,confirmed.id(),confirmed.number(),confirmed.version(),id,false);
            });
        });return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }
    private IdempotentWrite.StoredResponse stored(int status,Object order,Object number,Object version,UUID quote,boolean already) {
        return new IdempotentWrite.StoredResponse(status,json.writeValueAsString(QuoteDrafts.map("orderId",order,"number",number,"version",version,"sourceQuoteId",quote,"alreadyConverted",already)));
    }
    private static BigDecimal number(Map<String,Object> row,String name){return new BigDecimal(row.get(name).toString());}
    private static StaffScope.Failure notFound(){return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
}
