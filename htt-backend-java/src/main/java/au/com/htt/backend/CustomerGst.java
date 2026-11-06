package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class CustomerGst {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final LegacyRows rows;
    private final ReceiptOperations receipts;
    CustomerGst(StaffScope staff,JdbcClient jdbc,LegacyRows rows,ReceiptOperations receipts) {
        this.staff=staff;this.jdbc=jdbc;this.rows=rows;this.receipts=receipts;
    }
    @GetMapping("/api/v1/accounting/gst-attributions")
    Map<String,Object> attributions(@AuthenticationPrincipal Jwt token,HttpServletRequest request,
            @RequestParam LocalDate from,@RequestParam LocalDate to,@RequestParam(required=false) UUID customerId,
            @RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="25") int pageSize) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.gst.read");
        return staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->{
            if (!to.isAfter(from) || ChronoUnit.DAYS.between(from,to)>366) {
                throw new BranchQuery.InvalidFilter("to","Use a half-open interval of at most 366 days.");
            }
            if (customerId!=null) receipts.requireCustomer(scope,customerId);
            int offset=SalesRead.offset(page,pageSize);
            var items=jdbc.sql("""
                    SELECT g.id,g.source_document_id,g.receipt_id,g.advance_id,g.invoice_line_id,g.kind,g.gst_basis,
                    g.attribution_date::text,g.tax_code_id,g.amount,g.gst_amount,coalesce(r.customer_id,i.customer_id) AS customer_id
                    FROM (SELECT id,company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount
                    FROM accounting.gst_attributions UNION ALL
                    SELECT g.id,g.company_id,g.source_document_id,ad.receipt_id,g.advance_id,g.invoice_line_id,g.kind,g.gst_basis,g.adjustment_date,g.tax_code_id,g.amount,g.gst_amount
                    FROM accounting.gst_adjustments g LEFT JOIN accounting.customer_advances ad ON ad.company_id=g.company_id AND ad.id=g.advance_id) g
                    LEFT JOIN accounting.customer_receipts r ON r.company_id=g.company_id AND r.id=g.receipt_id
                    LEFT JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id
                    LEFT JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id
                    WHERE g.company_id=:company AND g.attribution_date>=:from AND g.attribution_date<:to
                    AND (CAST(:customer AS uuid) IS NULL OR coalesce(r.customer_id,i.customer_id)=CAST(:customer AS uuid))
                    AND (:all OR EXISTS(SELECT 1 FROM identity.customer_assignments ca WHERE ca.company_id=g.company_id
                    AND ca.customer_id=coalesce(r.customer_id,i.customer_id) AND ca.membership_id=:membership))
                    ORDER BY g.attribution_date,g.id LIMIT :size OFFSET :offset
                    """).param("company",scope.companyId()).param("from",from).param("to",to).param("customer",customerId)
                    .param("all",List.of(scope.permissions()).contains("customers.all")).param("membership",scope.membershipId())
                    .param("size",pageSize).param("offset",offset).query(rows::row).list();
            return Map.of("from",from,"to",to,"items",items,"page",page,"pageSize",pageSize);
        });
    }
}
