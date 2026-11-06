package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
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
class SupplierRefunds {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    SupplierRefunds(StaffScope staff,JdbcClient jdbc,LegacyRows rows,IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;
    }
    @PostMapping("/api/v1/supplier-refunds")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.post");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            require((input.creditLineId==null)!=(input.advanceId==null) && !ZERO.equals(input.creditLineId) && !ZERO.equals(input.advanceId),
                "source","Supply exactly one credit line or prepayment source.");
            BigDecimal amount=input.amount;
            require(amount.signum()>=0 && amount.compareTo(new BigDecimal("999999999999999999.99"))<=0 && amount.stripTrailingZeros().scale()<=2,
                "amount","amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
            require(amount.signum()>0,"amount","Positive refund amount required.");
            String reference=text(input.reference,"reference",200),reason=text(input.reason,"reason",2000);
            UUID bank=input.bankAccountId;
            if (bank!=null) {
                require(!ZERO.equals(bank),"bankAccountId","A company cash account ID is required.");
                if (!List.of(scope.permissions()).contains("accounting.banks.use")) throw new StaffScope.Failure(403,"permission_denied","Cash-account selection permission required.");
            }
            String canonical="{\"creditLineId\":"+SupplierBills.value(input.creditLineId)+",\"advanceId\":"+SupplierBills.value(input.advanceId)
                +",\"amount\":"+SupplierBills.value(amount.toPlainString())+",\"reference\":"+SupplierBills.value(reference)
                +",\"reason\":"+SupplierBills.value(reason)+",\"receivedOn\":"+SupplierBills.value(input.receivedOn)
                +(bank==null?"":",\"bankAccountId\":"+SupplierBills.value(bank))+"}";
            return writes.execute(scope,"POST /supplier-refunds",request.getHeader("Idempotency-Key"),canonical,()->{
                String args="CAST(:credit AS uuid),CAST(:advance AS uuid),:amount,:reference,:reason,CAST(:date AS date)";
                var sql=jdbc.sql(bank==null?"SELECT purchase.receive_supplier_refund("+args+")":"SELECT purchase.receive_supplier_refund_to_bank("+args+",:bank)")
                    .param("credit",input.creditLineId).param("advance",input.advanceId).param("amount",amount)
                    .param("reference",reference).param("reason",reason).param("date",input.receivedOn);
                if (bank!=null) sql.param("bank",bank);
                UUID id=sql.query(UUID.class).single();
                var details=new LinkedHashMap<String,Object>();
                details.put("CreditLineId",input.creditLineId);details.put("AdvanceId",input.advanceId);details.put("Amount",amount);details.put("reference",reference);
                audit.record(scope,"purchase.supplier_refunded","supplier_refund",id,requestId,details);
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(Map.of("refund",view(scope,id))));
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
    @GetMapping("/api/v1/supplier-refunds/{id}")
    Map<String,Object> detail(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.read");
        return staff.inCompany(scope,requestId(request),()->Map.of("refund",view(scope,id)));
    }
    @GetMapping("/api/v1/supplier-refunds")
    StaffIdentityController.Page<Map<String,Object>> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @RequestParam(required=false) UUID supplierId,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="25") int pageSize) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.refunds.read");
        return staff.inCompany(scope,requestId(request),()->{
            int offset=SalesRead.offset(page,pageSize);
            var items=jdbc.sql("""
                SELECT r.id,r.supplier_id,r.credit_line_id,r.advance_id,r.amount,r.gst_amount,r.received_on::text,r.reference,d.number,
                CASE WHEN EXISTS(SELECT 1 FROM accounting.supplier_refund_reversals v WHERE v.company_id=r.company_id AND v.refund_id=r.id) THEN 'REVERSED' ELSE 'ACTIVE' END AS refund_status
                FROM accounting.supplier_refunds r JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
                WHERE r.company_id=:company AND (CAST(:supplier AS uuid) IS NULL OR r.supplier_id=CAST(:supplier AS uuid)) ORDER BY r.created_at DESC,r.id LIMIT :size OFFSET :offset
                """).param("company",scope.companyId()).param("supplier",supplierId).param("size",pageSize).param("offset",offset).query(rows::row).list();
            return new StaffIdentityController.Page<>(items,page,pageSize);
        });
    }
    Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id) {
        return jdbc.sql("""
            SELECT r.*,r.received_on::text,d.number,d.state,d.version,v.id AS reversal_id,x.original_refund_id,
            CASE WHEN v.id IS NULL THEN 'ACTIVE' ELSE 'REVERSED' END AS refund_status FROM accounting.supplier_refunds r
            JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
            LEFT JOIN accounting.supplier_refund_reversals v ON v.company_id=r.company_id AND v.refund_id=r.id
            LEFT JOIN accounting.supplier_refund_corrections x ON x.company_id=r.company_id AND x.id=r.id
            WHERE r.company_id=:company AND r.id=:id
            """).param("company",scope.companyId()).param("id",id).query(rows::row).optional()
            .orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));
    }
    private static final UUID ZERO=new UUID(0,0);
    private static void require(boolean valid,String field,String message) {if (!valid) throw new BranchQuery.InvalidFilter(field,message);}
    private static String text(String value,String field,int limit) {
        String s=value==null?"":value.strip();require(!s.isEmpty() && s.length()<=limit,field,field+" must contain 1.."+limit+" characters.");return s;
    }
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;
        public String reference;
        public String reason;
        public UUID creditLineId;
        public UUID advanceId;
        public LocalDate receivedOn;
        public UUID bankAccountId;
    }
}
