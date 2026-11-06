package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Comparator;
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
class SupplierCreditApplications {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final IdempotentWrite writes;
    private final StaffAudit audit;
    private final JsonMapper json;
    SupplierCreditApplications(StaffScope staff,JdbcClient jdbc,LegacyRows rows,
            IdempotentWrite writes,StaffAudit audit,JsonMapper json) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.writes=writes;this.audit=audit;this.json=json;
    }
    @PostMapping("/api/v1/supplier-credits/{id}/apply")
    ResponseEntity<String> apply(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Input input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.apply");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            readAccess(scope);credit(scope,id);
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50
                    && lines.stream().allMatch(l->l!=null && valid(l.creditLineId) && valid(l.billLineId) && l.amount!=null)
                    && lines.stream().map(l->new Pair(l.creditLineId,l.billLineId)).distinct().count()==lines.size(),
                    "lines","Supply 1..50 distinct credit/target pairs and explicit positive amounts.");
            var sorted=lines.stream().sorted(Comparator.comparing((Line l)->l.creditLineId.toString()).thenComparing(l->l.billLineId.toString())).toList();
            for (var line:sorted) {
                require(line.amount.signum()>=0 && line.amount.compareTo(new BigDecimal("999999999999999999.99"))<=0
                        && line.amount.stripTrailingZeros().scale()<=2,"amount","amount must be nonnegative, within the storage limit, and have at most 2 decimals.");
                require(line.amount.signum()>0,"amount","Positive credit amount required.");
            }
            String items=sorted.stream().map(l->"{\"creditLineId\":\""+l.creditLineId+"\",\"billLineId\":\""+l.billLineId
                    +"\",\"amount\":\""+l.amount.toPlainString()+"\"}").collect(Collectors.joining(",","[","]"));
            String canonical="{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /supplier-credits/"+id+"/apply",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT purchase.apply_supplier_credit(:id,:reference,:reason,CAST(:lines AS jsonb))")
                        .param("id",id).param("reference",reference).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.supplier_credit_applied","supplier_credit_application",doc,requestId,Map.of("creditId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,doc,false)));
            });
        });
        return response(result);
    }
    @PostMapping("/api/v1/supplier-credit-applications/{id}/unapply")
    ResponseEntity<String> unapply(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Review input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.unapply");
        String requestId=requestId(request);
        var result=staff.inCompany(scope,requestId,()->{
            readAccess(scope);
            jdbc.sql("SELECT id FROM purchase.credit_applications WHERE company_id=:company AND id=:id")
                    .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(SupplierCreditApplications::notFound);
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            String canonical="{\"id\":\""+id+"\",\"reference\":"+CollaborationCreate.legacyString(reference)
                    +",\"reason\":"+CollaborationCreate.legacyString(reason)+"}";
            return writes.execute(scope,"POST /supplier-credit-applications/"+id+"/unapply",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT purchase.unapply_supplier_credit(:id,:reference,:reason)")
                        .param("id",id).param("reference",reference).param("reason",reason).query(UUID.class).single();
                audit.record(scope,"purchase.supplier_credit_unapplied","supplier_credit_unapplication",doc,requestId,Map.of("applicationId",id,"reference",reference));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(view(scope,doc,true)));
            });
        });
        return response(result);
    }
    @GetMapping("/api/v1/supplier-credit-applications/{id}")
    Map<String,Object> application(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        return read(token,request,id,false);
    }
    @GetMapping("/api/v1/supplier-credit-unapplications/{id}")
    Map<String,Object> unapplication(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id) {
        return read(token,request,id,true);
    }
    private Map<String,Object> read(Jwt token,HttpServletRequest request,UUID id,boolean undo) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.read");
        return staff.inCompany(scope,requestId(request),()->view(scope,id,undo));
    }
    @GetMapping("/api/v1/supplier-credits/{id}/applications")
    StaffIdentityController.Page<Map<String,Object>> list(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,
            @RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="25") int pageSize) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.read");
        return staff.inCompany(scope,requestId(request),()->{
            credit(scope,id);int offset=SalesRead.offset(page,pageSize);
            var items=jdbc.sql("""
                    SELECT a.*,d.number,d.business_date::text,u.id AS unapplication_id FROM purchase.credit_applications a
                    JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id
                    LEFT JOIN purchase.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id
                    WHERE a.company_id=:company AND a.credit_note_id=:id ORDER BY a.created_at DESC,a.id LIMIT :size OFFSET :offset
                    """).param("company",scope.companyId()).param("id",id).param("size",pageSize).param("offset",offset).query(rows::row).list();
            return new StaffIdentityController.Page<>(items,page,pageSize);
        });
    }
    private Map<String,Object> view(StaffScope.CompanyAccess scope,UUID id,boolean undo) {
        String sql=undo?"""
                SELECT a.*,d.number,d.state,d.version,d.business_date::text FROM purchase.credit_unapplications a
                JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id WHERE a.company_id=:company AND a.id=:id
                """:"""
                SELECT a.*,d.number,d.state,d.version,d.business_date::text,u.id AS unapplication_id,
                CASE WHEN u.id IS NULL THEN 'APPLIED' ELSE 'UNAPPLIED' END AS application_status FROM purchase.credit_applications a
                JOIN platform.documents d ON d.company_id=a.company_id AND d.id=a.id
                LEFT JOIN purchase.credit_unapplications u ON u.company_id=a.company_id AND u.application_id=a.id
                WHERE a.company_id=:company AND a.id=:id
                """;
        var header=jdbc.sql(sql).param("company",scope.companyId()).param("id",id).query(rows::row).optional().orElseThrow(SupplierCreditApplications::notFound);
        UUID app=undo?(UUID)header.get("applicationId"):id;
        var lines=jdbc.sql("SELECT * FROM purchase.credit_application_lines WHERE company_id=:company AND application_id=:id ORDER BY id")
                .param("company",scope.companyId()).param("id",app).query(rows::row).list();
        var gst=jdbc.sql("""
                SELECT bill_line_id,amount,gst_amount,gst_basis,kind,adjustment_date::text FROM accounting.purchase_gst_adjustments
                WHERE company_id=:company AND source_document_id=:id ORDER BY bill_line_id
                """).param("company",scope.companyId()).param("id",id).query(rows::row).list();
        return Map.of(undo?"unapplication":"application",header,"lines",lines,"gstAdjustments",gst);
    }
    private void credit(StaffScope.CompanyAccess scope,UUID id) {
        jdbc.sql("SELECT id FROM purchase.supplier_credit_notes WHERE company_id=:company AND id=:id")
                .param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(SupplierCreditApplications::notFound);
    }
    private static void readAccess(StaffScope.CompanyAccess scope) {
        if (!List.of(scope.permissions()).containsAll(List.of("purchase.credits.read","purchase.bills.read")))
            throw new StaffScope.Failure(403,"permission_denied","Credit application requires bill and credit reading permission.");
    }
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse result) {
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
    private static boolean valid(UUID id) {return id!=null && !new UUID(0,0).equals(id);}
    private static void require(boolean valid,String field,String message) {if (!valid) throw new BranchQuery.InvalidFilter(field,message);}
    private static String text(String value,String field,int max) {
        String s=value==null?"":value.strip();require(!s.isEmpty() && s.length()<=max,field,field+" must contain 1.."+max+" characters.");return s;
    }
    private static StaffScope.Failure notFound() {return new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope.");}
    private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    record Input(String reference,String reason,List<Line> lines) {}
    record Review(String reference,String reason) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID creditLineId=new UUID(0,0);
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL)
        public UUID billLineId=new UUID(0,0);
        public BigDecimal amount;
    }
    private record Pair(UUID credit,UUID bill) {}
}
