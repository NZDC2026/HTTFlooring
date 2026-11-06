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
class SupplierRefundCorrections {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    private final SupplierRefunds refunds;
    SupplierRefundCorrections(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json,SupplierRefunds refunds) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;this.refunds=refunds;
    }
    @PostMapping("/api/v1/supplier-refunds/{id}/reverse")
    ResponseEntity<String> reverse(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Review input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.reverse");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            access(scope,false,false);source(scope,id,false);
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            String canonical="{\"id\":"+value(id)+",\"reference\":"+value(reference)+",\"reason\":"+value(reason)+"}";
            return writes.execute(scope,"POST /supplier-refunds/"+id+"/reverse",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT purchase.reverse_supplier_refund(:id,:reference,:reason)")
                    .param("id",id).param("reference",reference).param("reason",reason).query(UUID.class).single();
                audit.record(scope,"purchase.supplier_refund_reversed","supplier_refund_reversal",doc,requestId,Map.of("refundId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,doc)));
            });
        });
        return response(result);
    }
    @PostMapping("/api/v1/supplier-refunds/{id}/correct")
    ResponseEntity<String> correctOriginal(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody AtomicInput input) {
        return correct(token,request,id,input,input.reversalReference);
    }
    @PostMapping("/api/v1/supplier-refund-reversals/{id}/correct")
    ResponseEntity<String> correctReversal(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Input input) {
        return correct(token,request,id,input,null);
    }
    private ResponseEntity<String> correct(Jwt token,HttpServletRequest request,UUID id,Input input,String rawReversal) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.correct");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            boolean atomic=rawReversal!=null;
            access(scope,true,atomic);
            UUID supplier=source(scope,id,!atomic);
            String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
            String revReference=atomic?text(rawReversal,"reversalReference",200):null;
            BigDecimal amount=input.amount;
            require(amount.signum()>=0 && amount.compareTo(new BigDecimal("999999999999999999.99"))<=0 && amount.stripTrailingZeros().scale()<=2,
                "amount","amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
            require(amount.signum()>0 && (input.creditLineId==null)!=(input.advanceId==null) && !ZERO.equals(input.creditLineId) && !ZERO.equals(input.advanceId),
                "source","Choose exactly one source and positive cents.");
            String sql=input.creditLineId!=null?"""
                SELECT cl.id FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes i ON i.company_id=cl.company_id AND i.id=cl.credit_note_id
                WHERE cl.company_id=:company AND cl.id=:source AND i.supplier_id=:supplier
                """:"SELECT a.id FROM accounting.supplier_advances a WHERE a.company_id=:company AND a.id=:source AND a.supplier_id=:supplier";
            jdbc.sql(sql).param("company",scope.companyId()).param("supplier",supplier).param("source",input.creditLineId!=null?input.creditLineId:input.advanceId)
                .query(UUID.class).optional().orElseThrow(SupplierRefundCorrections::notFound);
            String route=atomic?"POST /supplier-refunds/"+id+"/correct":"POST /supplier-refund-reversals/"+id+"/correct";
            String canonical="{\"id\":"+value(id)+",\"reference\":"+value(reference)+",\"reason\":"+value(reason)+",\"revReference\":"+value(revReference)
                +",\"amount\":"+value(amount.toPlainString())+",\"creditLineId\":"+value(input.creditLineId)+",\"advanceId\":"+value(input.advanceId)+"}";
            return writes.execute(scope,route,request.getHeader("Idempotency-Key"),canonical,()->{
                String args="CAST(:credit AS uuid),CAST(:advance AS uuid),:amount,:reference,:reason";
                var command=jdbc.sql(atomic?"SELECT purchase.correct_supplier_refund(:id,:revReference,"+args+")":"SELECT purchase.replace_supplier_refund(:id,"+args+")")
                    .param("id",id).param("credit",input.creditLineId).param("advance",input.advanceId).param("amount",amount).param("reference",reference).param("reason",reason);
                if (atomic) command.param("revReference",revReference);
                UUID doc=command.query(UUID.class).single();
                UUID reversal=jdbc.sql("SELECT reversal_id FROM accounting.supplier_refund_corrections WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",doc).query(UUID.class).single();
                if (atomic) audit.record(scope,"purchase.supplier_refund_reversed","supplier_refund_reversal",reversal,requestId,Map.of("refundId",id,"reference",revReference));
                audit.record(scope,"purchase.supplier_refund_corrected","supplier_refund",doc,requestId,Map.of("reversalId",reversal,"reference",reference,"Amount",amount));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(Map.of("refund",refunds.view(scope,doc),"reversalId",reversal)));
            });
        });
        return response(result);
    }
    @GetMapping("/api/v1/supplier-refund-reversals/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.read");
        return staff.inCompany(scope,requestId(request),()->view(scope,id));
    }
    private UUID source(StaffScope.CompanyAccess scope,UUID id,boolean reversal) {
        return jdbc.sql(reversal?"SELECT supplier_id FROM accounting.supplier_refund_reversals WHERE company_id=:company AND id=:id"
                :"SELECT supplier_id FROM accounting.supplier_refunds WHERE company_id=:company AND id=:id")
            .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(SupplierRefundCorrections::notFound);
    }
    private Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id) {
        var header=jdbc.sql("""
            SELECT v.*,d.number,d.state,d.business_date::text,x.id AS replacement_refund_id FROM accounting.supplier_refund_reversals v
            JOIN platform.documents d ON d.company_id=v.company_id AND d.id=v.id
            LEFT JOIN accounting.supplier_refund_corrections x ON x.company_id=v.company_id AND x.reversal_id=v.id WHERE v.company_id=:company AND v.id=:id
            """).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(SupplierRefundCorrections::notFound);
        var gst=jdbc.sql("SELECT bill_line_id,amount,gst_amount,gst_basis,adjustment_date::text FROM accounting.purchase_gst_adjustments WHERE company_id=:company AND refund_reversal_id=:id ORDER BY bill_line_id")
            .param("company",scope.companyId()).param("id",id).query(rows::row).list();
        return Map.of("reversal",header,"gstAdjustments",gst);
    }
    private static void access(StaffScope.CompanyAccess scope,boolean correct,boolean atomic) {
        var permissions=List.of(scope.permissions());
        if (!permissions.containsAll(List.of("purchase.refunds.read","purchase.bills.read"))
                || (correct && !permissions.contains("purchase.refunds.post")) || (atomic && !permissions.contains("purchase.refunds.reverse")))
            throw new StaffScope.Failure(403,"permission_denied","Refund correction requires refund/bill access and the applicable write/reversal authority.");
    }
    private static final UUID ZERO=new UUID(0,0);
    private static void require(boolean test,String field,String message) {if (!test) throw new BranchQuery.InvalidFilter(field,message);}
    private static String text(String value,String field,int limit) {String s=value==null?"":value.strip();require(!s.isEmpty() && s.length()<=limit,field,field+" must contain 1.."+limit+" characters.");return s;}
    private static String value(Object value) {return SupplierBills.value(value);}
    private static StaffScope.Failure notFound() {return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result) {return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    record Review(String reference,String reason) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static class Input {
        public String reference;
        public String reason;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;
        public UUID creditLineId;
        public UUID advanceId;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class AtomicInput extends Input {public String reversalReference;}
}
