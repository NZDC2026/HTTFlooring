package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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
class SalesCredits {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final ReceiptOperations receipts;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    SalesCredits(StaffScope staff,JdbcClient jdbc,LegacyRows rows,ReceiptOperations receipts,
            IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.receipts=receipts;
        this.writes=writes;this.audit=audit;this.json=json;
    }

    @PostMapping("/api/v1/sales-invoices/{id}/amount-credit-notes")
    ResponseEntity<String> amountCredit(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody AmountInput input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.credits.adjust");
        String requestId=requestId(request);
        var response=staff.inCompany(scope,requestId,()->{
            if (!List.of(scope.permissions()).containsAll(List.of("sales.credits.write","sales.credits.read","sales.invoices.read"))) {
                throw new StaffScope.Failure(403,"permission_denied","Amount adjustments require credit write/read and invoice read access.");
            }
            invoice(scope,id);
            String reason=input.reason()==null?"":input.reason().strip();
            require(!reason.isEmpty() && reason.length()<=2000,"reason","reason must contain 1..2000 characters.");
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50
                    && lines.stream().allMatch(l->l!=null && valid(l.invoiceLineId))
                    && lines.stream().map(l->l.invoiceLineId).distinct().count()==lines.size(),"lines","Supply 1..50 distinct invoice lines.");
            for (var line:lines) {
                cents(line.net,"net");cents(line.tax,"tax");
                require(line.net.add(line.tax).signum()>0,"amount","Explicit nonnegative net/tax cents and positive gross required.");
            }
            var descriptions=new java.util.HashMap<UUID,String>();
            for (var line:lines) {
                String description=line.description==null?"":line.description.strip();
                require(!description.isEmpty() && description.length()<=500,"description","description must contain 1..500 characters.");
                descriptions.put(line.invoiceLineId,description);
            }
            String items=lines.stream().sorted(Comparator.comparing(l->l.invoiceLineId.toString()))
                    .map(l->"{\"invoiceLineId\":\""+l.invoiceLineId+"\",\"net\":\""+l.net.toPlainString()
                            +"\",\"tax\":\""+l.tax.toPlainString()+"\",\"description\":"
                            +CollaborationCreate.legacyString(descriptions.get(l.invoiceLineId))+"}")
                    .collect(Collectors.joining(",","[","]"));
            String canonical="{\"id\":\""+id+"\",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /sales-invoices/"+id+"/amount-credit-notes",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID credit=jdbc.sql("SELECT sales.post_amount_credit_note(:invoice,:reason,CAST(:lines AS jsonb))")
                        .param("invoice",id).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"sales.amount_credit_posted","credit_note",credit,requestId,Map.of("invoiceId",id,"reason",reason));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,credit)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    private static void cents(BigDecimal value,String field) {
        require(value!=null && value.signum()>=0 && value.compareTo(new BigDecimal("999999999999999999.99"))<=0
                && value.stripTrailingZeros().scale()<=2,field,field+" must be nonnegative, within the storage limit, and have at most 2 decimals.");
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    record AmountInput(String reason,List<AmountLine> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class AmountLine {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID invoiceLineId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public BigDecimal net=BigDecimal.ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public BigDecimal tax=BigDecimal.ZERO;
        public String description;
    }

    @PostMapping("/api/v1/sales-invoices/{id}/credit-notes")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.credits.write");
        String requestId=requestId(request);
        var response=staff.inCompany(scope,requestId,()->{
            invoice(scope,id);
            String reason=input.reason()==null?"":input.reason().strip();
            require(!reason.isEmpty() && reason.length()<=2000,"reason","reason must contain 1..2000 characters.");
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50
                    && lines.stream().allMatch(l->l!=null && valid(l.invoiceLineId()) && !new UUID(0,0).equals(l.returnLineId()))
                    && lines.stream().map(Line::invoiceLineId).distinct().count()==lines.size(),"lines","Supply distinct credit invoice lines.");
            for (var line:lines) {
                BigDecimal quantity=line.quantity()==null?BigDecimal.ZERO:line.quantity();
                require(quantity.signum()>=0 && quantity.compareTo(new BigDecimal("99999999999999.999999"))<=0
                        && quantity.stripTrailingZeros().scale()<=6,"quantity",
                        "quantity must be nonnegative, within the storage limit, and have at most 6 decimals.");
                require(quantity.signum()>0,"quantity","Positive quantity required.");
            }
            String items=lines.stream().sorted(Comparator.comparing(l->l.invoiceLineId().toString()))
                    .map(l->"{\"invoiceLineId\":\""+l.invoiceLineId()+"\",\"quantity\":\""+l.quantity().toPlainString()
                            +"\",\"returnLineId\":"+(l.returnLineId()==null?"null":"\""+l.returnLineId()+"\"")+"}")
                    .collect(Collectors.joining(",","[","]"));
            String canonical="{\"reason\":"+CollaborationCreate.legacyString(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /sales-invoices/"+id+"/credit-notes",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID credit=jdbc.sql("SELECT sales.post_credit_note(:invoice,:reason,CAST(:lines AS jsonb))")
                        .param("invoice",id).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"sales.credit_posted","credit_note",credit,requestId,Map.of("invoiceId",id,"reason",reason));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,credit)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    @GetMapping("/api/v1/sales-credit-notes/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.credits.read");
        return staff.inCompany(scope,requestId(request),()->view(scope,id));
    }

    @GetMapping("/api/v1/sales-invoices/{id}/credit-notes")
    Map<String,Object> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.credits.read");
        return staff.inCompany(scope,requestId(request),()->{
            invoice(scope,id);
            return Map.of("items",jdbc.sql("""
                    SELECT cn.id,d.number,cn.reason,cn.net,cn.tax,cn.gross,cn.credit_type
                    FROM sales.credit_notes cn JOIN platform.documents d ON platform.document_visible(d.id)
                    AND d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=:company AND cn.invoice_id=:id
                    ORDER BY cn.created_at,cn.id
                    """).param("company",scope.companyId()).param("id",id).query(rows::row).list());
        });
    }

    @GetMapping("/api/v1/sales-invoices/{id}/creditable")
    Map<String,Object> creditable(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"sales.credits.read");
        return staff.inCompany(scope,requestId(request),()->{
            invoice(scope,id);
            var lines=jdbc.sql("""
                    SELECT il.id,il.quantity,il.net,il.tax,il.gross,
                    il.net-coalesce((SELECT sum(net) FROM sales.credit_note_lines WHERE company_id=il.company_id AND invoice_line_id=il.id),0) AS creditable_net,
                    il.tax-coalesce((SELECT sum(tax) FROM sales.credit_note_lines WHERE company_id=il.company_id AND invoice_line_id=il.id),0) AS creditable_tax,
                    il.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=il.company_id AND invoice_line_id=il.id),0) AS creditable_quantity
                    FROM sales.invoice_lines il WHERE il.company_id=:company AND il.invoice_id=:id ORDER BY il.id
                    """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
            var returns=jdbc.sql("""
                    SELECT rl.id,rl.invoice_line_id,rl.quantity,
                    rl.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=rl.company_id AND return_line_id=rl.id),0) AS creditable_quantity
                    FROM inventory.sales_return_lines rl JOIN sales.invoice_lines il ON il.company_id=rl.company_id AND il.id=rl.invoice_line_id
                    WHERE il.company_id=:company AND il.invoice_id=:id ORDER BY rl.id
                    """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
            return Map.of("invoiceId",id,"lines",lines,"returns",returns);
        });
    }

    private Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id) {
        var cn=jdbc.sql("""
                SELECT cn.*,d.number,d.state,d.version,d.business_date::text FROM sales.credit_notes cn
                JOIN platform.documents d ON platform.document_visible(d.id) AND d.company_id=cn.company_id AND d.id=cn.id
                WHERE cn.company_id=:company AND cn.id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(SalesCredits::notFound);
        UUID invoiceId=(UUID)cn.get("invoiceId");
        var invoice=invoice(scope,invoiceId);
        Map<String,Object> result=new LinkedHashMap<>();
        for (String key:List.of("id","number","state","version","invoiceId","businessDate","reason","creditType","net","tax","gross")) {
            result.put(key,cn.get(key));
        }
        result.put("invoiceNumber",invoice.get("number"));
        result.put("title","TAX_INVOICE".equals(invoice.get("title"))?"ADJUSTMENT_NOTE":"CREDIT_NOTE");
        result.put("issuer",invoice.get("issuerSnapshot"));
        result.put("customer",invoice.get("customerSnapshot"));
        result.put("lines",jdbc.sql("""
                SELECT cl.id,cl.invoice_line_id,cl.return_line_id,cl.quantity,cl.net,cl.tax,cl.gross,src.credit_type,
                src.adjustment_snapshot->>'description' AS description,cl.unallocated_amount AS unrefunded_credit,
                cl.unallocated_amount,cl.applied_amount,cl.refunded_amount,cl.available_apply_amount
                FROM sales.customer_credit_line_balances cl JOIN sales.credit_note_lines src ON src.company_id=cl.company_id AND src.id=cl.id
                WHERE cl.company_id=:company AND cl.credit_note_id=:id ORDER BY cl.id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list());
        return result;
    }

    private Map<String,Object> invoice(StaffScope.CompanyAccess scope,UUID id) {
        var invoice=jdbc.sql("""
                SELECT i.*,d.number FROM sales.invoices i JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id
                WHERE i.company_id=:company AND i.id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(SalesCredits::notFound);
        receipts.requireCustomer(scope,(UUID)invoice.get("customerId"));
        return invoice;
    }
    private static boolean valid(UUID id) {return id!=null && !new UUID(0,0).equals(id);}
    private static void require(boolean valid,String field,String message) {
        if (!valid) throw new BranchQuery.InvalidFilter(field,message);
    }
    private static StaffScope.Failure notFound() {return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    record Input(String reason,List<Line> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID invoiceLineId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public BigDecimal quantity=BigDecimal.ZERO;
        public UUID returnLineId;
        UUID invoiceLineId() { return invoiceLineId; }
        BigDecimal quantity() { return quantity; }
        UUID returnLineId() { return returnLineId; }
    }
}
