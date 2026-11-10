package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/** Operational delivery metadata has its own version; posted financial documents stay immutable. */
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class DispatchScheduleApi {
    private final StaffScope staff;
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    DispatchScheduleApi(StaffScope staff, JdbcClient jdbc, IdempotentWrite writes) {
        this.staff=staff; this.jdbc=jdbc; this.writes=writes;
    }
    record Schedule(LocalDate expectedDispatchDate, Boolean deliveryBooked, Boolean awaitingCollection, String reason) {}

    @GetMapping("/api/v1/documents/{id}/dispatch-schedule")
    ResponseEntity<String> read(@PathVariable UUID id,@AuthenticationPrincipal Jwt token,HttpServletRequest request) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"customers.read");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(request),()->view(id)));
    }

    @PostMapping("/api/v1/documents/{id}/dispatch-schedule")
    ResponseEntity<String> update(@PathVariable UUID id,@RequestBody Schedule input,@AuthenticationPrincipal Jwt token,HttpServletRequest request) {
        var scope=staff.require(token,request.getHeader("X-Company-Id"),"customers.read");
        var result=staff.inCompany(scope,rid(request),()->{
            // The database also checks the document-specific write permission and customer assignment.
            long version=WarehouseDetails.version(request.getHeader("If-Match"));
            String reason=MasterDataChecks.text(input.reason(),"reason",1000);
            MasterDataChecks.check(reason.length()>=3,"reason","A reason of 3..1000 characters is required.");
            String canonical=LegacyRawJson.value(QuoteDrafts.map("id",id,"version",version,"date",input.expectedDispatchDate(),"deliveryBooked",input.deliveryBooked(),"awaitingCollection",input.awaitingCollection(),"reason",reason));
            return writes.execute(scope,"POST /documents/"+id+"/dispatch-schedule",request.getHeader("Idempotency-Key"),canonical,()->{
                String body=jdbc.sql("SELECT sales.set_dispatch_schedule(:id,:version,:date,:booked,:collection,:reason)::text")
                    .param("id",id).param("version",version).param("date",input.expectedDispatchDate(),java.sql.Types.DATE)
                    .param("booked",input.deliveryBooked(),java.sql.Types.BOOLEAN).param("collection",input.awaitingCollection(),java.sql.Types.BOOLEAN)
                    .param("reason",reason).query(String.class).single();
                return new IdempotentWrite.StoredResponse(200,body);
            });
        });
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
    private String view(UUID id) {return jdbc.sql("SELECT sales.dispatch_view(:id)::text").param("id",id).query(String.class).single();}
    private static String rid(HttpServletRequest request) {return (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID);}
}
