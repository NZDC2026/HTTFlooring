package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;
import static au.com.htt.backend.MasterDataChecks.*;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class BankStatementImport {
    private final StaffScope staff;private final JdbcClient jdbc;private final BankStatementReads reads;private final IdempotentWrite writes;private final StaffAudit audit;private final JsonMapper json;
    BankStatementImport(StaffScope staff,JdbcClient jdbc,BankStatementReads reads,IdempotentWrite writes,StaffAudit audit,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.reads=reads;this.writes=writes;this.audit=audit;this.json=json;}
    @PostMapping("/api/v1/bank-accounts/{id}/statements/import")
    ResponseEntity<String> importJson(@PathVariable UUID id,@RequestBody Input input,@AuthenticationPrincipal Jwt token,HttpServletRequest request){
        return execute(id,input,"JSON",null,token,request);
    }
    @PostMapping("/api/v1/bank-accounts/{id}/statements/import-csv")
    ResponseEntity<String> importCsv(@PathVariable UUID id,@RequestParam String reference,@RequestParam String fromDate,@RequestParam String toDate,@RequestParam BigDecimal openingBalance,@RequestParam BigDecimal closingBalance,@AuthenticationPrincipal Jwt token,HttpServletRequest request) throws java.io.IOException {
        // Authorize before consuming raw source content.
        access(token,request);
        String type=request.getContentType();check(type!=null&&type.split(";")[0].trim().equalsIgnoreCase("text/csv"),"contentType","Use raw UTF-8 text/csv.");
        if(request.getContentLengthLong()>2097152)throw new StaffScope.Failure(413,"file_too_large","CSV exceeds 2 MiB.");
        byte[] bytes=request.getInputStream().readNBytes(2097153);if(bytes.length>2097152)throw new StaffScope.Failure(413,"file_too_large","CSV exceeds 2 MiB.");
        Input input=new Input();input.reference=reference;input.fromDate=LedgerFields.date(fromDate);input.toDate=LedgerFields.date(toDate);input.openingBalance=openingBalance;input.closingBalance=closingBalance;input.lines=BankStatementCsv.parse(bytes);
        return execute(id,input,"CSV",bytes,token,request);
    }
    private StaffScope.CompanyAccess access(Jwt token,HttpServletRequest request){
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.bank_statements.import");
        for(String permission:List.of("accounting.bank_statements.read","accounting.banks.read","accounting.ledger.read"))if(!CrmParties.has(scope,permission))throw new StaffScope.Failure(403,"permission_denied","Statement, bank-directory and ledger read permissions required.");
        return scope;
    }
    private ResponseEntity<String> execute(UUID id,Input input,String format,byte[] original,Jwt token,HttpServletRequest request){
        var scope=access(token,request);
        return response(staff.inCompany(scope,rid(request),()->{
            reads.bank(scope,id);String reference=text(input.reference,"reference",200);
            check(!input.fromDate.equals(LocalDate.of(1,1,1))&&!input.toDate.isBefore(input.fromDate)&&ChronoUnit.DAYS.between(input.fromDate,input.toDate)<=366,"dates","Use an inclusive statement period up to 367 calendar dates.");
            if(input.openingBalance==null||input.closingBalance==null)throw new StaffScope.Failure(400,"invalid_request","Opening and closing balances are required.");
            signed(input.openingBalance,"openingBalance");signed(input.closingBalance,"closingBalance");
            check(input.lines!=null&&input.lines.size()<=5000&&input.lines.stream().allMatch(Objects::nonNull),"lines","Supply 0..5000 statement rows.");
            var lines=new ArrayList<Map<String,Object>>();var externalIds=new HashSet<String>();BigDecimal total=input.openingBalance;
            for(var line:input.lines){signed(line.amount,"amount");check(line.amount.signum()!=0&&!line.date.isBefore(input.fromDate)&&!line.date.isAfter(input.toDate),"lines","Nonzero amount and date inside the statement required.");
                String description=Optional.ofNullable(optional(line.description,"description",1000)).orElse(""),ref=Optional.ofNullable(optional(line.reference,"reference",200)).orElse(""),external=optional(line.externalId,"externalId",200);
                check(external==null||externalIds.add(external),"externalId","Duplicate external IDs in file.");
                lines.add(QuoteDrafts.map("date",line.date,"amount",line.amount,"description",description,"reference",ref,"externalId",external));total=total.add(line.amount);
            }
            check(total.compareTo(input.closingBalance)==0,"closingBalance","Opening plus signed transactions must equal closing.");
            String lineJson=QuotePricing.value(lines);byte[] source=original==null?lineJson.getBytes(StandardCharsets.UTF_8):original;check(source.length<=2097152,"file","Import source exceeds 2 MiB.");
            String hash=sha(source);var canonical=QuoteDrafts.map("bank",id,"reference",reference,"fromDate",input.fromDate,"toDate",input.toDate,"openingBalance",input.openingBalance,"closingBalance",input.closingBalance,"format",format,"hash",hash,"lines",lines);
            return writes.execute(scope,"POST /bank-accounts/"+id+"/statements/import-"+format,request.getHeader("Idempotency-Key"),QuotePricing.canonical(canonical),()->{
                var imported=jdbc.sql("SELECT * FROM accounting.import_bank_statement(:bank,:reference,:from,:to,:opening,:closing,:format,:hash,CAST(:lines AS jsonb),:source)").param("bank",id).param("reference",reference).param("from",input.fromDate).param("to",input.toDate).param("opening",input.openingBalance).param("closing",input.closingBalance).param("format",format).param("hash",hash).param("lines",lineJson).param("source",source).query((r,n)->new Imported(r.getObject("id",UUID.class),r.getBoolean("created"))).single();
                if(imported.created())audit.record(scope,"accounting.bank_statement_imported","bank_statement",imported.id(),rid(request),QuoteDrafts.map("bank",id,"reference",reference,"hash",hash,"lineCount",lines.size()));
                return new IdempotentWrite.StoredResponse(201,json.writeValueAsString(reads.view(scope,imported.id())));
            });
        }));
    }
    private static void signed(BigDecimal amount,String field){check(amount!=null&&amount.abs().compareTo(new BigDecimal("999999999999999999.99"))<=0&&amount.stripTrailingZeros().scale()<=2,field,"Signed AUD cents within storage limits required.");}
    private static String sha(byte[] data){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));}catch(NoSuchAlgorithmException impossible){throw new IllegalStateException(impossible);}}
    private static String rid(HttpServletRequest request){return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
    private static ResponseEntity<String> response(IdempotentWrite.StoredResponse value){return ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON).body(value.body());}
    private record Imported(UUID id,boolean created){}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Input {public String reference;@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate fromDate=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate toDate=LocalDate.of(1,1,1);public BigDecimal openingBalance;public BigDecimal closingBalance;public List<Line> lines;}
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown=true)
    static final class Line {@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public LocalDate date=LocalDate.of(1,1,1);@com.fasterxml.jackson.annotation.JsonSetter(nulls=com.fasterxml.jackson.annotation.Nulls.FAIL) public BigDecimal amount=BigDecimal.ZERO;public String description;public String reference="";public String externalId;}
}
