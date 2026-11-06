package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
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
class CustomerCorrections {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final ReceiptOperations receipts;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;

    CustomerCorrections(StaffScope staff, JdbcClient jdbc, LegacyRows rows, ReceiptOperations receipts,
            IdempotentWrite writes, StaffAudit audit, JsonMapper json) {
        this.staff=staff;
        this.jdbc=jdbc;
        this.rows=rows;
        this.receipts=receipts;
        this.writes=writes;
        this.audit=audit;
        this.json=json;
    }

    @PostMapping("/api/v1/customer-receipts/{id}/reverse")
    ResponseEntity<String> reverse(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Correction input) {
        return correct(token,request,id,input,false);
    }

    @PostMapping("/api/v1/advance-applications/{id}/unapply")
    ResponseEntity<String> unapply(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id, @RequestBody Correction input) {
        return correct(token,request,id,input,true);
    }

    @PostMapping("/api/v1/receipt-reversals/{id}/reapply")
    ResponseEntity<String> reapply(@AuthenticationPrincipal Jwt token, HttpServletRequest request,
            @PathVariable UUID id,@RequestBody Reassignment input) {
        return reassign(token,request,id,input,false);
    }

    @PostMapping("/api/v1/customer-receipts/{id}/reallocate")
    ResponseEntity<String> reallocate(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @PathVariable UUID id,@RequestBody Reassignment input) {
        return reassign(token,request,id,input,true);
    }

    private ResponseEntity<String> reassign(Jwt token,HttpServletRequest request,UUID id,Reassignment input,boolean reallocating) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),
                reallocating?"accounting.receipts.reverse":"accounting.receipts.reapply");
        String requestId=requestId(request);
        var response=staff.inCompany(scope,requestId,()->{
            var permissions=List.of(scope.permissions());
            if (!permissions.containsAll(List.of("accounting.receipts.read","accounting.receivables.read",
                    "accounting.receipts.reapply","accounting.receipts.write"))) {
                throw new StaffScope.Failure(403,"permission_denied",
                        "Settlement correction requires receipt and receivable access, and reapplication authority when applicable.");
            }
            UUID customer=jdbc.sql(reallocating
                    ?"SELECT customer_id FROM accounting.customer_receipts WHERE company_id=:company AND id=:id"
                    :"SELECT customer_id FROM accounting.receipt_reversals WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",id).query(UUID.class).optional()
                    .orElseThrow(CustomerCorrections::notFound);
            receipts.requireCustomer(scope,customer);
            String reference=text(input.reference(),"reference",200);
            String reversalReference=reallocating?text(input.reversalReference(),"reversalReference",200):null;
            String reason=text(input.reason(),"reason",2000);
            var allocations=input.allocations()==null?List.<ReceiptOperations.Allocation>of():input.allocations();
            var advances=input.advances()==null?List.<ReceiptOperations.Advance>of():input.advances();
            require(allocations.size()<=50 && allocations.stream().allMatch(a->a!=null && validId(a.invoiceLineId()))
                    && allocations.stream().map(ReceiptOperations.Allocation::invoiceLineId).distinct().count()==allocations.size(),
                    "allocations","Supply up to 50 distinct invoice lines.");
            require(advances.size()<=50 && advances.stream().allMatch(a->a!=null && validId(a.orderLineId()))
                    && advances.stream().map(ReceiptOperations.Advance::orderLineId).distinct().count()==advances.size(),
                    "advances","Supply up to 50 distinct order lines.");
            allocations.forEach(a->ReceiptOperations.amount(a.amount(),"Allocation must be positive."));
            advances.forEach(a->ReceiptOperations.amount(a.amount(),"Advance must be positive."));
            String items=allocations.stream().sorted(java.util.Comparator.comparing(a->a.invoiceLineId().toString()))
                    .map(a->line("invoiceLineId",a.invoiceLineId(),a.amount())).collect(java.util.stream.Collectors.joining(",","[","]"));
            String prepaid=advances.stream().sorted(java.util.Comparator.comparing(a->a.orderLineId().toString()))
                    .map(a->line("orderLineId",a.orderLineId(),a.amount())).collect(java.util.stream.Collectors.joining(",","[","]"));
            String canonical="{\"id\":\""+id+"\""+(reallocating?",\"reversalReference\":"+CollaborationCreate.legacyString(reversalReference):"")
                    +",\"reference\":"+CollaborationCreate.legacyString(reference)+",\"reason\":"+CollaborationCreate.legacyString(reason)
                    +",\"allocations\":"+items+",\"advances\":"+prepaid+"}";
            String route=reallocating?"POST /customer-receipts/"+id+"/reallocate":"POST /receipt-reversals/"+id+"/reapply";
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),canonical,()->{
                var sql=jdbc.sql(reallocating
                        ?"SELECT accounting.reallocate_receipt(:id,:reversal,:reference,:reason,CAST(:items AS jsonb),CAST(:advances AS jsonb))"
                        :"SELECT accounting.reapply_receipt(:id,:reference,:reason,CAST(:items AS jsonb),CAST(:advances AS jsonb))")
                        .param("id",id).param("reference",reference).param("reason",reason).param("items",items).param("advances",prepaid);
                if (reallocating) sql.param("reversal",reversalReference);
                UUID doc=sql.query(UUID.class).single();
                UUID reversal=reallocating?jdbc.sql("SELECT reversal_id FROM accounting.receipt_reapplications WHERE company_id=:company AND id=:id")
                        .param("company",scope.companyId()).param("id",doc).query(UUID.class).single():id;
                if (reallocating) {
                    audit.record(scope,"accounting.customer_receipt_reversed","receipt_reversal",reversal,requestId,
                            Map.of("receiptId",id,"reference",reversalReference));
                }
                audit.record(scope,"accounting.customer_receipt_reapplied","customer_receipt",doc,requestId,
                        Map.of("reversalId",reversal,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,"{\"receipt\":"+receipts.view(scope,doc)
                        +",\"reversalId\":\""+reversal+"\"}");
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    private static boolean validId(UUID id) {
        return id!=null && !new UUID(0,0).equals(id);
    }

    private static void require(boolean valid,String field,String message) {
        if (!valid) throw new BranchQuery.InvalidFilter(field,message);
    }

    private static String line(String field,UUID id,java.math.BigDecimal amount) {
        return "{\""+field+"\":\""+id+"\",\"amount\":\""+amount.toPlainString()+"\"}";
    }

    record Reassignment(String reversalReference,String reference,String reason,
            List<ReceiptOperations.Allocation> allocations,List<ReceiptOperations.Advance> advances) {}

    @GetMapping("/api/v1/receipt-reversals/{id}")
    Map<String,Object> reversal(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        return read(token,request,id,false);
    }

    @GetMapping("/api/v1/advance-unapplications/{id}")
    Map<String,Object> unapplication(@AuthenticationPrincipal Jwt token, HttpServletRequest request, @PathVariable UUID id) {
        return read(token,request,id,true);
    }

    private Map<String,Object> read(Jwt token, HttpServletRequest request, UUID id, boolean undo) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.receipts.read");
        return staff.inCompany(scope,requestId(request),()->view(scope,id,undo));
    }

    private ResponseEntity<String> correct(Jwt token, HttpServletRequest request, UUID id, Correction input, boolean undo) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),
                undo?"accounting.advances.unapply":"accounting.receipts.reverse");
        String requestId=requestId(request);
        var response=staff.inCompany(scope,requestId,()->{
            var permissions=List.of(scope.permissions());
            if (!permissions.contains("accounting.receipts.read") || !permissions.contains("accounting.receivables.read")) {
                throw new StaffScope.Failure(403,"permission_denied",
                        "Settlement correction requires receipt and receivable access, and reapplication authority when applicable.");
            }
            UUID customer=jdbc.sql(undo?"""
                    SELECT r.customer_id FROM accounting.advance_applications a
                    JOIN accounting.customer_advances ad ON ad.company_id=a.company_id AND ad.id=a.advance_id
                    JOIN accounting.customer_receipts r ON r.company_id=ad.company_id AND r.id=ad.receipt_id
                    WHERE a.company_id=:company AND a.id=:id
                    """:"SELECT customer_id FROM accounting.customer_receipts WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",id).query(UUID.class).optional()
                    .orElseThrow(CustomerCorrections::notFound);
            receipts.requireCustomer(scope,customer);
            String reference=text(input.reference(),"reference",200);
            String reason=text(input.reason(),"reason",2000);
            String route=undo?"POST /advance-applications/"+id+"/unapply":"POST /customer-receipts/"+id+"/reverse";
            String canonical="{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+"}";
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql(undo?"SELECT accounting.unapply_advance(:id,:reference,:reason)"
                        :"SELECT accounting.reverse_receipt(:id,:reference,:reason)")
                        .param("id",id).param("reference",reference).param("reason",reason).query(UUID.class).single();
                audit.record(scope,undo?"accounting.advance_unapplied":"accounting.customer_receipt_reversed",
                        undo?"advance_unapplication":"receipt_reversal",doc,requestId,
                        Map.of(undo?"applicationId":"receiptId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,doc,undo)));
            });
        });
        return ResponseEntity.status(response.status()).contentType(MediaType.APPLICATION_JSON).body(response.body());
    }

    private Map<String,Object> view(StaffScope.CompanyAccess scope, UUID id, boolean undo) {
        String sql=undo?"""
                SELECT x.*,d.number,d.state,d.business_date::text FROM accounting.advance_unapplications x
                JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id
                WHERE x.company_id=:company AND x.id=:id
                """:"""
                SELECT x.*,d.number,d.state,d.business_date::text,p.id AS replacement_receipt_id
                FROM accounting.receipt_reversals x JOIN platform.documents d ON d.company_id=x.company_id AND d.id=x.id
                LEFT JOIN accounting.receipt_reapplications p ON p.company_id=x.company_id AND p.reversal_id=x.id
                WHERE x.company_id=:company AND x.id=:id
                """;
        var header=jdbc.sql(sql).param("company",scope.companyId()).param("id",id)
                .query(rows::row).optional().orElseThrow(CustomerCorrections::notFound);
        receipts.requireCustomer(scope,(UUID)header.get("customerId"));
        UUID original=(UUID)header.get(undo?"applicationId":"receiptId");
        var allocations=jdbc.sql("""
                SELECT invoice_line_id,amount,gst_amount,receipt_id,advance_id FROM accounting.payment_allocations
                WHERE company_id=:company AND source_document_id=:id ORDER BY invoice_line_id
                """).param("company",scope.companyId()).param("id",original).query(rows::row).list();
        var gst=jdbc.sql("""
                SELECT invoice_line_id,advance_id,amount,gst_amount,gst_basis,adjustment_date::text,kind
                FROM accounting.gst_adjustments WHERE company_id=:company AND settlement_reversal_id=:id
                ORDER BY invoice_line_id,advance_id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
        return Map.of(undo?"unapplication":"reversal",header,"allocations",allocations,"gstAdjustments",gst);
    }

    private static String text(String value,String field,int limit) {
        String result=value==null?"":value.strip();
        if (result.isEmpty() || result.length()>limit) {
            throw new BranchQuery.InvalidFilter(field,field+" must contain 1.."+limit+" characters.");
        }
        return result;
    }

    private static StaffScope.Failure notFound() {
        return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");
    }

    private static String requestId(HttpServletRequest request) {
        return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);
    }

    record Correction(String reference,String reason) {}
}
