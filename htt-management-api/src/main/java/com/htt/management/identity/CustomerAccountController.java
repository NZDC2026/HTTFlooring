package com.htt.management.identity;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/accounts")
@PreAuthorize("@resourceAccess.isStaff()")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
public class CustomerAccountController {
    private final CustomerAccountService service;
    private final tools.jackson.databind.ObjectMapper json;
    public CustomerAccountController(CustomerAccountService service,tools.jackson.databind.ObjectMapper json) { this.service=service;this.json=json; }
    @PostMapping public ResponseEntity<CustomerAccountService.View> create(@PathVariable String customerId,
            @RequestHeader("Idempotency-Key") UUID key,@RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(content=@io.swagger.v3.oas.annotations.media.Content(
                schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=CustomerAccountService.Create.class))) tools.jackson.databind.JsonNode body) {
        if(!body.isObject()) throw new IllegalArgumentException("Invalid account input");
        var allowed=java.util.Set.of("accountType","contactId","loginName","email","subject","permissions","branchIds","password");
        for(var property:body.properties()) if(!allowed.contains(property.getKey())) throw new IllegalArgumentException("Invalid account field");
        var input=json.treeToValue(body,CustomerAccountService.Create.class);
        var result=service.create(customerId,key,input);
        return ResponseEntity.created(URI.create("/api/v1/customers/"+customerId+"/accounts/"+result.id())).body(result);
    }
    @GetMapping public List<CustomerAccountService.View> list(@PathVariable String customerId) { return service.list(customerId); }
    public record StatusInput(Long version,String status) { }
    @PatchMapping("/{accountId}/status") public CustomerAccountService.View status(@PathVariable String customerId,@PathVariable String accountId,@RequestBody StatusInput input) {
        if(input.version()==null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST);
        return service.status(customerId,accountId,input.version(),input.status());
    }
    @PostMapping("/{accountId}/password-reset") public ResponseEntity<Void> reset(@PathVariable String customerId,@PathVariable String accountId) {
        service.reset(customerId,accountId);return ResponseEntity.accepted().build();
    }
}
