package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
class CustomerRefunds {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final ReceiptOperations receipts;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;

    CustomerRefunds(StaffScope staff,JdbcClient jdbc,LegacyRows rows,ReceiptOperations receipts,
            IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.receipts=receipts;
        this.writes=writes;this.audit=audit;this.json=json;
    }

    @PostMapping("/api/v1/customers/{id}/refunds")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.write");
        String requestId=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,requestId,()->{
            receipts.requireCustomer(scope,id);
            BigDecimal amount=input.amount()==null?BigDecimal.ZERO:input.amount();
            require(amount.signum()>=0 && amount.compareTo(new BigDecimal("999999999999999999.99"))<=0
                    && amount.stripTrailingZeros().scale()<=2,"amount",
                    "amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
            require(amount.signum()>0 && (input.creditLineId()==null)!=(input.advanceId()==null)
                    && !new UUID(0,0).equals(input.creditLineId()) && !new UUID(0,0).equals(input.advanceId()),
                    "source","Select exactly one credit line or advance and positive amount.");
            String reference=text(input.reference(),"reference",200);
            String reason=text(input.reason(),"reason",2000);
            String source=input.creditLineId()!=null?"""
                    SELECT cl.id FROM sales.credit_note_lines cl
                    JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id
                    JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id
                    WHERE cl.company_id=:company AND cl.id=:source AND i.customer_id=:customer
                    """:"""
                    SELECT a.id FROM accounting.customer_advances a JOIN accounting.customer_receipts r
                    ON r.company_id=a.company_id AND r.id=a.receipt_id
                    WHERE a.company_id=:company AND a.id=:source AND r.customer_id=:customer
                    """;
            jdbc.sql(source).param("company",scope.companyId()).param("customer",id)
                    .param("source",input.creditLineId()!=null?input.creditLineId():input.advanceId())
                    .query(UUID.class).optional().orElseThrow(CustomerRefunds::notFound);
            UUID bank=input.bankAccountId();
            if (bank!=null) {
                require(!new UUID(0,0).equals(bank),"bankAccountId","A company cash account ID is required.");
                if (!List.of(scope.permissions()).contains("accounting.banks.use")) {
                    throw new StaffScope.Failure(403,"permission_denied","Cash-account selection permission required.");
                }
            }
            String canonical="{\"amount\":\""+amount.toPlainString()+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"creditLineId\":"+nullable(input.creditLineId())
                    +",\"advanceId\":"+nullable(input.advanceId())+",\"cancelOrder\":"+input.cancelOrder()
                    +(bank==null?"":",\"bankAccountId\":"+nullable(bank))+"}";
            return writes.execute(scope,"POST /customers/"+id+"/refunds",request.getHeader("Idempotency-Key"),canonical,()->{
                String args="CAST(:credit AS uuid),CAST(:advance AS uuid),:amount,:reference,:reason,:cancel";
                var sql=jdbc.sql(bank==null?"SELECT accounting.post_customer_refund("+args+")"
                        :"SELECT accounting.post_customer_refund_to_bank("+args+",:bank)")
                        .param("credit",input.creditLineId()).param("advance",input.advanceId()).param("amount",amount)
                        .param("reference",reference).param("reason",reason).param("cancel",input.cancelOrder());
                if (bank!=null) sql.param("bank",bank);
                UUID refund=sql.query(UUID.class).single();
                audit.record(scope,"accounting.customer_refunded","customer_refund",refund,requestId,
                        Map.of("customerId",id,"Amount",amount,"reference",reference,"reason",reason));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,refund)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    @PostMapping("/api/v1/customer-refunds/{id}/correct")
    ResponseEntity<String> correctOriginal(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody AtomicCorrectionInput input) {
        return correct(token,request,id,input,input.reversalReference);
    }

    @PostMapping("/api/v1/customer-refund-reversals/{id}/correct")
    ResponseEntity<String> correctReversal(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody CorrectionInput input) {
        return correct(token,request,id,input,null);
    }

    private ResponseEntity<String> correct(Jwt token,HttpServletRequest request,UUID id,CorrectionInput input,String rawReversal) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.correct");
        String requestId=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,requestId,()->{
            boolean atomic=rawReversal!=null;
            var permissions=List.of(scope.permissions());
            if (!permissions.containsAll(List.of("accounting.refunds.read","accounting.receivables.read","accounting.refunds.write"))
                    || (atomic && !permissions.contains("accounting.refunds.reverse"))) {
                throw new StaffScope.Failure(403,"permission_denied",
                        "Refund correction requires refund/receivable access and the applicable write/reversal authority.");
            }
            UUID customer=jdbc.sql(atomic
                    ?"SELECT customer_id FROM accounting.customer_refunds WHERE company_id=:company AND id=:id"
                    :"SELECT customer_id FROM accounting.customer_refund_reversals WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(CustomerRefunds::notFound);
            receipts.requireCustomer(scope,customer);
            String reference=text(input.reference(),"reference",200);
            String reason=text(input.reason(),"reason",2000);
            String revReference=atomic?text(rawReversal,"reversalReference",200):null;
            BigDecimal amount=input.amount()==null?BigDecimal.ZERO:input.amount();
            require(amount.signum()>=0 && amount.compareTo(new BigDecimal("999999999999999999.99"))<=0
                    && amount.stripTrailingZeros().scale()<=2,"amount",
                    "amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
            require(amount.signum()>0 && (input.creditLineId()==null)!=(input.advanceId()==null)
                    && !new UUID(0,0).equals(input.creditLineId()) && !new UUID(0,0).equals(input.advanceId()),
                    "source","Choose exactly one source and positive cents.");
            String source=input.creditLineId()!=null?"""
                    SELECT cl.id FROM sales.credit_note_lines cl
                    JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id
                    JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id
                    WHERE cl.company_id=:company AND cl.id=:source AND i.customer_id=:customer
                    """:"""
                    SELECT a.id FROM accounting.customer_advances a JOIN accounting.customer_receipts r
                    ON r.company_id=a.company_id AND r.id=a.receipt_id
                    WHERE a.company_id=:company AND a.id=:source AND r.customer_id=:customer
                    """;
            jdbc.sql(source).param("company",scope.companyId()).param("customer",customer)
                    .param("source",input.creditLineId()!=null?input.creditLineId():input.advanceId())
                    .query(UUID.class).optional().orElseThrow(CustomerRefunds::notFound);
            String route=atomic?"POST /customer-refunds/"+id+"/correct":"POST /customer-refund-reversals/"+id+"/correct";
            String canonical="{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"revReference\":"
                    +(revReference==null?"null":CollaborationCreate.legacyString(revReference))
                    +",\"amount\":\""+amount.toPlainString()+"\",\"creditLineId\":"+nullable(input.creditLineId())
                    +",\"advanceId\":"+nullable(input.advanceId())+",\"cancelOrder\":"+input.cancelOrder()+"}";
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),canonical,()->{
                String args="CAST(:credit AS uuid),CAST(:advance AS uuid),:amount,:reference,:reason,:cancel";
                var sql=jdbc.sql(atomic?"SELECT accounting.correct_customer_refund(:id,:revReference,"+args+")"
                        :"SELECT accounting.replace_customer_refund(:id,"+args+")")
                        .param("id",id).param("credit",input.creditLineId()).param("advance",input.advanceId())
                        .param("amount",amount).param("reference",reference).param("reason",reason).param("cancel",input.cancelOrder());
                if (atomic) sql.param("revReference",revReference);
                UUID doc=sql.query(UUID.class).single();
                UUID reversal=jdbc.sql("SELECT reversal_id FROM accounting.customer_refund_corrections WHERE company_id=:company AND id=:id")
                        .param("company",scope.companyId()).param("id",doc).query(UUID.class).single();
                if (atomic) {
                    audit.record(scope,"accounting.customer_refund_reversed","customer_refund_reversal",reversal,requestId,
                            Map.of("refundId",id,"reference",revReference));
                }
                audit.record(scope,"accounting.customer_refund_corrected","customer_refund",doc,requestId,
                        Map.of("reversalId",reversal,"reference",reference,"Amount",amount));
                return new IdempotentWrite.StoredResponse(201,"{\"refund\":"+json.writeValueAsString(view(scope,doc))
                        +",\"reversalId\":\""+reversal+"\"}");
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    @PostMapping("/api/v1/customer-refunds/{id}/reverse")
    ResponseEntity<String> reverse(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody Reversal input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.reverse");
        String requestId=(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        var response=staff.inCompany(scope,requestId,()->{
            if (!List.of(scope.permissions()).containsAll(List.of("accounting.refunds.read","accounting.receivables.read"))) {
                throw new StaffScope.Failure(403,"permission_denied",
                        "Refund correction requires refund/receivable access and the applicable write/reversal authority.");
            }
            UUID customer=jdbc.sql("SELECT customer_id FROM accounting.customer_refunds WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",id).query(UUID.class).optional()
                    .orElseThrow(CustomerRefunds::notFound);
            receipts.requireCustomer(scope,customer);
            String reference=text(input.reference(),"reference",200);
            String reason=text(input.reason(),"reason",2000);
            String canonical="{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+"}";
            return writes.execute(scope,"POST /customer-refunds/"+id+"/reverse",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT accounting.reverse_customer_refund(:id,:reference,:reason)")
                        .param("id",id).param("reference",reference).param("reason",reason).query(UUID.class).single();
                audit.record(scope,"accounting.customer_refund_reversed","customer_refund_reversal",doc,requestId,
                        Map.of("refundId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(reversalView(scope,doc)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    @GetMapping("/api/v1/customer-refund-reversals/{id}")
    Map<String,Object> reversal(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.read");
        return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->reversalView(scope,id));
    }

    private Map<String,Object> reversalView(StaffScope.CompanyAccess scope,UUID id) {
        var row=jdbc.sql("""
                SELECT v.*,d.number,d.state,d.business_date::text,x.id AS replacement_refund_id
                FROM accounting.customer_refund_reversals v JOIN platform.documents d ON d.company_id=v.company_id AND d.id=v.id
                LEFT JOIN accounting.customer_refund_corrections x ON x.company_id=v.company_id AND x.reversal_id=v.id
                WHERE v.company_id=:company AND v.id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row)
                .optional().orElseThrow(CustomerRefunds::notFound);
        receipts.requireCustomer(scope,(UUID)row.get("customerId"));
        var gst=jdbc.sql("""
                SELECT invoice_line_id,advance_id,amount,gst_amount,gst_basis,adjustment_date::text
                FROM accounting.gst_adjustments WHERE company_id=:company AND refund_reversal_id=:id
                ORDER BY invoice_line_id,advance_id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
        return Map.of("reversal",row,"gstAdjustments",gst);
    }

    record Reversal(String reference,String reason) {}

    @GetMapping("/api/v1/customer-refunds/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.read");
        return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->view(scope,id));
    }

    @GetMapping("/api/v1/customers/{id}/refunds")
    StaffIdentityController.Page<Map<String,Object>> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="25") int pageSize) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.refunds.read");
        return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->{
            receipts.requireCustomer(scope,id);
            int offset=SalesRead.offset(page,pageSize);
            var items=jdbc.sql("""
                    SELECT r.id,d.number,r.credit_line_id,r.advance_id,r.amount,r.gst_amount,r.reference,r.reason,
                    CASE WHEN EXISTS(SELECT 1 FROM accounting.customer_refund_reversals v
                    WHERE v.company_id=r.company_id AND v.refund_id=r.id) THEN 'REVERSED' ELSE 'ACTIVE' END AS refund_status
                    FROM accounting.customer_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                    WHERE r.company_id=:company AND r.customer_id=:id ORDER BY r.created_at DESC,r.id LIMIT :size OFFSET :offset
                    """).param("company",scope.companyId()).param("id",id).param("size",pageSize).param("offset",offset)
                    .query(rows::row).list();
            return new StaffIdentityController.Page<>(items,page,pageSize);
        });
    }

    Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id) {
        var row=jdbc.sql("""
                SELECT r.*,(SELECT l.account_id FROM accounting.posting_batches b
                JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id
                JOIN accounting.journal_lines l ON l.company_id=e.company_id AND l.journal_entry_id=e.id
                JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id
                WHERE b.company_id=r.company_id AND b.source_document_id=r.id AND b.posting_kind='CUSTOMER_REFUND'
                AND a.control_kind='BANK' AND l.credit>0 LIMIT 1) AS bank_account_id,
                d.number,d.state,d.version,d.business_date::text,v.id AS reversal_id,x.original_refund_id,
                CASE WHEN v.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS refund_status
                FROM accounting.customer_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                LEFT JOIN accounting.customer_refund_reversals v ON v.company_id=r.company_id AND v.refund_id=r.id
                LEFT JOIN accounting.customer_refund_corrections x ON x.company_id=r.company_id AND x.id=r.id
                WHERE r.company_id=:company AND r.id=:id
                """).param("company",scope.companyId()).param("id",id).query(rows::row)
                .optional().orElseThrow(CustomerRefunds::notFound);
        receipts.requireCustomer(scope,(UUID)row.get("customerId"));
        return row;
    }

    private static String nullable(UUID id) {return id==null?"null":"\""+id+"\"";}
    private static String text(String value,String field,int max) {
        String result=value==null?"":value.strip();
        require(!result.isEmpty() && result.length()<=max,field,field+" must contain 1.."+max+" characters.");
        return result;
    }
    private static void require(boolean valid,String field,String message) {
        if (!valid) throw new BranchQuery.InvalidFilter(field,message);
    }
    private static StaffScope.Failure notFound() {
        return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static class CorrectionInput {
        public BigDecimal amount;
        public String reference;
        public String reason;
        public UUID creditLineId;
        public UUID advanceId;
        public boolean cancelOrder;
        BigDecimal amount() { return amount; }
        String reference() { return reference; }
        String reason() { return reason; }
        UUID creditLineId() { return creditLineId; }
        UUID advanceId() { return advanceId; }
        boolean cancelOrder() { return cancelOrder; }
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class AtomicCorrectionInput extends CorrectionInput {
        public String reversalReference;
    }

    // Mutable binding retains the legacy default false for an omitted cancelOrder.
    // Explicit null still fails primitive binding, matching the legacy request parser.
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {
        public BigDecimal amount;
        public String reference;
        public String reason;
        public UUID creditLineId;
        public UUID advanceId;
        public boolean cancelOrder;
        public UUID bankAccountId;
        BigDecimal amount() { return amount; }
        String reference() { return reference; }
        String reason() { return reason; }
        UUID creditLineId() { return creditLineId; }
        UUID advanceId() { return advanceId; }
        boolean cancelOrder() { return cancelOrder; }
        UUID bankAccountId() { return bankAccountId; }
    }
}
