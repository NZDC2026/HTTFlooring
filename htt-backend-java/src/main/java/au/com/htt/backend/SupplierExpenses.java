package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class SupplierExpenses {
    private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;
    private final StaffAudit audit;private final JsonMapper json;private final SupplierBills bills;private final PurchaseReturns credits;
    SupplierExpenses(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,StaffAudit audit,JsonMapper json,SupplierBills bills,PurchaseReturns credits) {
        this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.audit=audit;this.json=json;this.bills=bills;this.credits=credits;
    }
    @PostMapping("/api/v1/supplier-expense-bills")
    ResponseEntity<String> post(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@RequestBody Bill input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.expense_bills.post");
        String rid=requestId(request);
        var result=staff.inCompany(scope,rid,()->{
            if (!List.of(scope.permissions()).contains("purchase.bills.read")) throw new StaffScope.Failure(403,"permission_denied","Expense bill posting requires bill reading permission.");
            exists(scope,"SELECT id FROM crm.suppliers WHERE company_id=:company AND id=:id",input.supplierId);
            String invoice=text(input.supplierInvoice,"supplierInvoice",200),evidence=optional(input.taxInvoiceReference,"taxInvoiceReference",500),notes=optional(input.notes,"notes",2000);
            if (notes==null) notes="";
            require(validDate(input.invoiceDate) && validDate(input.dueOn) && validDate(input.postingDate),"invoiceDate","Invoice, due and posting dates are required.");
            require(input.lines!=null && !input.lines.isEmpty() && input.lines.size()<=50 && input.lines.stream().allMatch(l->l!=null && valid(l.expenseAccountId) && valid(l.taxCodeId) && l.net!=null && l.tax!=null),
                "lines","Supply 1..50 explicit expense-account, description, net/tax and tax-code lines.");
            for (var line:input.lines) line.description=text(line.description,"description",2000);
            for (var line:input.lines) {amount(line.net,"net");amount(line.tax,"tax");}
            String items=input.lines.stream().map(l->"{\"expenseAccountId\":"+value(l.expenseAccountId)+",\"description\":"+value(l.description)+",\"net\":"+value(l.net.toPlainString())
                +",\"tax\":"+value(l.tax.toPlainString())+",\"taxCodeId\":"+value(l.taxCodeId)+",\"recoverableGst\":"+(l.recoverableGst==null?"null":l.recoverableGst.toString())+"}").collect(Collectors.joining(",","[","]"));
            String canonical="{\"supplierId\":"+value(input.supplierId)+",\"supplierInvoice\":"+value(invoice)+",\"invoiceDate\":"+value(input.invoiceDate)+",\"dueOn\":"+value(input.dueOn)
                +",\"postingDate\":"+value(input.postingDate)+",\"lines\":"+items+",\"taxInvoiceReference\":"+value(evidence)+",\"taxInvoiceHeldOn\":"+value(input.taxInvoiceHeldOn)+",\"notes\":"+value(notes)+"}";
            String finalNotes=notes;
            return writes.execute(scope,"POST /supplier-expense-bills",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID id=jdbc.sql("SELECT purchase.post_expense_bill(:supplier,:invoice,:date,:due,:posting,CAST(:evidence AS text),CAST(:held AS date),:notes,CAST(:lines AS jsonb))")
                    .param("supplier",input.supplierId).param("invoice",invoice).param("date",input.invoiceDate).param("due",input.dueOn).param("posting",input.postingDate)
                    .param("evidence",evidence).param("held",input.taxInvoiceHeldOn).param("notes",finalNotes).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.bill_posted","supplier_bill",id,rid,Map.of("SupplierId",input.supplierId,"supplierInvoice",invoice,"billType","EXPENSE"));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(bills.view(scope,id)));
            });
        });return response(result);
    }
    @PostMapping("/api/v1/supplier-expense-bills/{id}/credits")
    ResponseEntity<String> credit(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody Credit input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.expense_credits.post");String rid=requestId(request);
        var result=staff.inCompany(scope,rid,()->{
            if (!List.of(scope.permissions()).containsAll(List.of("purchase.bills.read","purchase.credits.read"))) throw new StaffScope.Failure(403,"permission_denied","Expense credit posting requires bill and credit reading permission.");
            exists(scope,"SELECT id FROM purchase.bills WHERE company_id=:company AND id=:id AND bill_type='EXPENSE'",id);
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50 && lines.stream().allMatch(l->l!=null && valid(l.billLineId) && l.amount!=null)
                && lines.stream().map(l->l.billLineId).distinct().count()==lines.size(),"lines","Supply 1..50 distinct expense bill lines and explicit gross credit amounts.");
            var sorted=lines.stream().sorted(Comparator.comparing(l->l.billLineId.toString())).toList();for (var line:sorted) amount(line.amount,"amount");
            String items=sorted.stream().map(l->"{\"billLineId\":"+value(l.billLineId)+",\"amount\":"+value(l.amount.toPlainString())+"}").collect(Collectors.joining(",","[","]"));
            String canonical="{\"id\":"+value(id)+",\"reference\":"+value(reference)+",\"reason\":"+value(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /supplier-expense-bills/"+id+"/credits",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT purchase.post_expense_credit(:id,:reference,:reason,CAST(:lines AS jsonb))").param("id",id).param("reference",reference).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.supplier_credited","supplier_credit",doc,rid,Map.of("billId",id,"reference",reference,"creditType","EXPENSE"));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(credits.creditView(scope,doc)));
            });
        });return response(result);
    }
    @PostMapping("/api/v1/supplier-bills/{id}/amount-credits")
    ResponseEntity<String> amountCredit(@AuthenticationPrincipal Jwt token,HttpServletRequest request,@PathVariable UUID id,@RequestBody AmountCredit input) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"purchase.credits.adjust");String rid=requestId(request);
        var result=staff.inCompany(scope,rid,()->{
            if (!List.of(scope.permissions()).containsAll(List.of("purchase.bills.read","purchase.credits.read"))) throw new StaffScope.Failure(403,"permission_denied","Bill and credit read access required.");
            exists(scope,"SELECT id FROM purchase.bills WHERE company_id=:company AND id=:id",id);
            String reference=text(input.reference(),"reference",200),reason=text(input.reason(),"reason",2000);
            var lines=input.lines();
            require(lines!=null && !lines.isEmpty() && lines.size()<=50 && lines.stream().allMatch(l->l!=null && valid(l.billLineId))
                && lines.stream().map(l->l.billLineId).distinct().count()==lines.size(),"lines","Distinct bill lines required.");
            for (var line:lines) {amount(line.net,"net");amount(line.tax,"tax");require(line.net.add(line.tax).signum()>0,"amount","Positive gross required.");}
            for (var line:lines) line.description=text(line.description,"description",500);
            var sorted=lines.stream().sorted(Comparator.comparing(l->l.billLineId.toString())).toList();
            String items=sorted.stream().map(l->"{\"billLineId\":"+value(l.billLineId)+",\"net\":"+value(l.net.toPlainString())+",\"tax\":"+value(l.tax.toPlainString())+",\"description\":"+value(l.description)+"}").collect(Collectors.joining(",","[","]"));
            String canonical="{\"id\":"+value(id)+",\"reference\":"+value(reference)+",\"reason\":"+value(reason)+",\"lines\":"+items+"}";
            return writes.execute(scope,"POST /supplier-bills/"+id+"/amount-credits",request.getHeader("Idempotency-Key"),canonical,()->{
                UUID doc=jdbc.sql("SELECT purchase.post_amount_credit(:id,:reference,:reason,CAST(:lines AS jsonb))").param("id",id).param("reference",reference).param("reason",reason).param("lines",items).query(UUID.class).single();
                audit.record(scope,"purchase.amount_credit_posted","supplier_credit",doc,rid,Map.of("billId",id,"reference",reference,"reason",reason));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(credits.creditView(scope,doc)));
            });
        });return response(result);
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) record AmountCredit(String reference,String reason,List<AmountLine> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class AmountLine {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID billLineId=ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal net=BigDecimal.ZERO;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal tax=BigDecimal.ZERO;
        public String description;
    }
    private void exists(StaffScope.CompanyAccess scope,String sql,UUID id) {jdbc.sql(sql).param("company",scope.companyId()).param("id",id).query(UUID.class).optional().orElseThrow(()->new StaffScope.Failure(404,"not_found","Resource is unavailable in this scope."));}
    private static final UUID ZERO=new UUID(0,0);private static final LocalDate MIN=LocalDate.of(1,1,1);
    private static boolean valid(UUID id) {return id!=null && !ZERO.equals(id);}private static boolean validDate(LocalDate date) {return date!=null && !MIN.equals(date);}
    private static void require(boolean valid,String field,String message) {if (!valid) throw new BranchQuery.InvalidFilter(field,message);}
    private static String text(String s,String field,int max) {return SupplierBills.text(s,field,max,true);}
    private static String optional(String s,String field,int max) {return SupplierBills.text(s,field,max,false);}
    private static void amount(BigDecimal n,String field) {SupplierBills.amount(n,field,2,"999999999999999999.99");}
    private static String value(Object o) {return SupplierBills.value(o);}private static String requestId(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse r) {return ResponseEntity.status(r.status()).contentType(MediaType.APPLICATION_JSON).body(r.body());}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Bill {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID supplierId=ZERO;
        public String supplierInvoice;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate invoiceDate=MIN;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate dueOn=MIN;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate postingDate=MIN;
        public List<Line> lines;public String taxInvoiceReference;public LocalDate taxInvoiceHeldOn;public String notes;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID expenseAccountId=ZERO;
        public String description;public BigDecimal net;public BigDecimal tax;
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID taxCodeId=ZERO;
        public Boolean recoverableGst;
    }
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true) record Credit(String reference,String reason,List<Allocation> lines) {}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Allocation {
        @com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public UUID billLineId=ZERO;
        public BigDecimal amount;
    }
}
