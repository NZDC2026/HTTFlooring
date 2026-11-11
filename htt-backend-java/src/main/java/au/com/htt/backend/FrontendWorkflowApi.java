package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@RestController
@ConditionalOnProperty("htt.staff.database.url")
class FrontendWorkflowApi {
    private final StaffScope staff;private final JdbcClient jdbc;private final IdempotentWrite writes;private final JsonMapper json;
    FrontendWorkflowApi(StaffScope staff,JdbcClient jdbc,IdempotentWrite writes,JsonMapper json){this.staff=staff;this.jdbc=jdbc;this.writes=writes;this.json=json;}
    record FollowupSettings(Boolean enabled,String from,String notificationEmail,String portalOrigin,String timezone){}
    record ReminderSettings(Boolean enabled,String from){}
    record Preview(String mode,List<UUID> ids,LocalDate fromDate,LocalDate toDate){}
    record Confirmation(Boolean confirmed){}
    record ReturnRequest(UUID orderId,UUID warehouseId,String reason,JsonNode handoverProof,List<ReturnLine> items){}
    record ReturnLine(UUID stockMovementId,UUID invoiceLineId,java.math.BigDecimal quantity,List<UUID> photoFileIds){}
    record Decision(String decision,String disposition,String reason){}

    @GetMapping("/api/v1/dispatch-followups/settings")
    ResponseEntity<String> followupSettings(@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"sales.followups.manage",()->scalar("SELECT sales.followup_settings()::text",Map.of()));}
    @PostMapping("/api/v1/dispatch-followups/settings")
    ResponseEntity<String> configureFollowups(@RequestBody FollowupSettings input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){
        return write(jwt,r,"sales.followups.manage",input,()->{
            String sender=ContactFields.email(input.from()),notice=ContactFields.email(input.notificationEmail());String origin=MasterDataChecks.trim(input.portalOrigin());
            if(!origin.isEmpty()){try{var uri=URI.create(origin);MasterDataChecks.check("https".equals(uri.getScheme())&&uri.getHost()!=null&&uri.getRawUserInfo()==null&&uri.getRawQuery()==null&&uri.getRawFragment()==null&&(uri.getPath().isEmpty()||uri.getPath().equals("/")),"portalOrigin","Use an HTTPS origin without a path or credentials.");}catch(IllegalArgumentException e){throw new BranchQuery.InvalidFilter("portalOrigin","Valid HTTPS origin required.");}}
            var args=new HashMap<String,Object>();args.put("version",version(r));args.put("enabled",input.enabled());args.put("sender",sender==null?"":sender);args.put("notice",notice==null?"":notice);args.put("origin",origin);args.put("zone",input.timezone());
            return scalar("SELECT sales.configure_followups(:version,:enabled,:sender,:notice,:origin,:zone)::text",args);
        });
    }
    @GetMapping("/api/v1/invoice-reminders/settings")
    ResponseEntity<String> reminderSettings(@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"sales.followups.manage",()->scalar("SELECT accounting.reminder_configuration()::text",Map.of()));}
    @PostMapping("/api/v1/invoice-reminders/settings")
    ResponseEntity<String> configureReminders(@RequestBody ReminderSettings input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return write(jwt,r,"sales.followups.manage",input,()->scalar("SELECT accounting.reminder_configuration(:version,:enabled,:sender)::text",QuoteDrafts.map("version",version(r),"enabled",input.enabled(),"sender",Objects.toString(ContactFields.email(input.from()),""))));}
    @GetMapping("/api/v1/invoice-reminders")
    ResponseEntity<String> reminderRows(@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"documents.email.send",()->"{\"rows\":"+scalar("SELECT accounting.reminder_rows()::text",Map.of())+"}");}
    @PostMapping("/api/v1/invoice-reminders/preview")
    ResponseEntity<String> preview(@RequestBody Preview input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return write(jwt,r,"documents.email.send",input,()->{
        MasterDataChecks.check(input.ids()!=null&&!input.ids().isEmpty()&&input.ids().size()<=100&&input.ids().stream().allMatch(Objects::nonNull)&&new HashSet<>(input.ids()).size()==input.ids().size(),"ids","Select 1..100 distinct invoice IDs.");
        MasterDataChecks.check(Set.of("INVOICE","STATEMENT").contains(Objects.toString(input.mode(),"")),"mode","Use INVOICE or STATEMENT.");
        LocalDate today=LocalDate.parse(scalar("SELECT (now() AT TIME ZONE timezone)::date::text FROM core.companies WHERE id=core.current_company()",Map.of()));
        var ids=input.ids().stream().map(UUID::toString).sorted().toList();
        UUID id=UUID.fromString(scalar("SELECT accounting.prepare_reminders(:mode,CAST(:ids AS uuid[]),CAST(:from AS date),CAST(:to AS date))::text",QuoteDrafts.map("mode",input.mode(),"ids","{"+String.join(",",ids)+"}","from",input.fromDate()==null?today.minusDays(365):input.fromDate(),"to",input.toDate()==null?today.plusDays(1):input.toDate())));
        return scalar("SELECT accounting.reminder_batch_view(:id)::text",Map.of("id",id));
    });}
    @GetMapping("/api/v1/invoice-reminders/batches/{id}")
    ResponseEntity<String> batch(@PathVariable UUID id,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"documents.email.send",()->scalar("SELECT accounting.reminder_batch_view(:id)::text",Map.of("id",id)));}
    @PostMapping("/api/v1/invoice-reminders/batches/{id}/queue")
    ResponseEntity<String> queue(@PathVariable UUID id,@RequestBody Confirmation input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return write(jwt,r,"documents.email.send",input,()->scalar("SELECT accounting.queue_reminders(:id,:confirmed)::text",QuoteDrafts.map("id",id,"confirmed",input.confirmed())));}

    @GetMapping("/api/v1/warehouse/return-requests")
    ResponseEntity<String> returns(@RequestParam UUID warehouseId,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"inventory.returns.read",()->scalar("SELECT inventory.return_request_list(:id)::text",Map.of("id",warehouseId)));}
    @GetMapping("/api/v1/warehouse/return-requests/{id}")
    ResponseEntity<String> returned(@PathVariable UUID id,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return read(jwt,r,"inventory.returns.read",()->scalar("SELECT inventory.return_request_view(:id)::text",Map.of("id",id)));}
    @PostMapping("/api/v1/warehouse/return-requests")
    ResponseEntity<String> submitReturn(@RequestBody ReturnRequest input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return write(jwt,r,"inventory.returns.write",input,()->{
        MasterDataChecks.check(input.orderId()!=null&&input.warehouseId()!=null,"orderId","Order and warehouse are required.");
        String id=scalar("SELECT inventory.submit_return_request(:doc,:warehouse,:reason,CAST(:proof AS jsonb),CAST(:items AS jsonb))::text",QuoteDrafts.map("doc",input.orderId(),"warehouse",input.warehouseId(),"reason",input.reason(),"proof",json.writeValueAsString(input.handoverProof()),"items",json.writeValueAsString(input.items())));
        return scalar("SELECT inventory.return_request_view(CAST(:id AS uuid))::text",Map.of("id",id));
    });}
    @PostMapping("/api/v1/warehouse/return-requests/{id}/decision")
    ResponseEntity<String> decide(@PathVariable UUID id,@RequestBody Decision input,@AuthenticationPrincipal Jwt jwt,HttpServletRequest r){return write(jwt,r,"inventory.returns.write",input,()->scalar("SELECT inventory.decide_return_request(:id,:version,:decision,:disposition,:reason)::text",QuoteDrafts.map("id",id,"version",version(r),"decision",input.decision(),"disposition",input.disposition(),"reason",input.reason())));}

    private String scalar(String sql,Map<String,?> args){return jdbc.sql(sql).params(args).query(String.class).single();}
    private ResponseEntity<String> read(Jwt jwt,HttpServletRequest r,String permission,Supplier<String> action){var scope=staff.require(jwt,r.getHeader("X-Company-Id"),permission);return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,rid(r),action));}
    private ResponseEntity<String> write(Jwt jwt,HttpServletRequest r,String permission,Object input,Supplier<String> action){
        var scope=staff.require(jwt,r.getHeader("X-Company-Id"),permission);
        var result=staff.inCompany(scope,rid(r),()->writes.execute(scope,"POST "+r.getRequestURI(),r.getHeader("Idempotency-Key"),json.writeValueAsString(QuoteDrafts.map("input",input,"ifMatch",r.getHeader("If-Match"))),()->new IdempotentWrite.StoredResponse(200,action.get())));
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
    private static long version(HttpServletRequest r){return WarehouseDetails.version(r.getHeader("If-Match"));}
    private static String rid(HttpServletRequest r){return (String)r.getAttribute(ApiResponseHeaders.REQUEST_ID);}
}
