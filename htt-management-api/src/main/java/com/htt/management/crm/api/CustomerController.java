package com.htt.management.crm.api;

import com.htt.management.crm.application.CustomerInput;
import com.htt.management.crm.application.CustomerService;
import com.htt.management.crm.domain.CustomerRules.InvalidCustomer;
import com.htt.management.crm.domain.CustomerRules.Status;
import java.net.URI;
import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@RestController
@RequestMapping("/api/v1/customers")
@PreAuthorize("@resourceAccess.isStaff()")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
public class CustomerController {
    private final CustomerService service;
    private final ObjectMapper json;
    public CustomerController(CustomerService service,ObjectMapper json) { this.service=service;this.json=json; }

    @PostMapping
    public ResponseEntity<CustomerView> create(@RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(content=@io.swagger.v3.oas.annotations.media.Content(
                schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=CustomerInput.class))) JsonNode body) {
        var result=CustomerView.of(service.create(customerInput(body)));
        return ResponseEntity.created(URI.create("/api/v1/customers/"+result.id())).body(result);
    }
    @GetMapping public List<CustomerView> list(@RequestParam(defaultValue="0") int offset,
            @RequestParam(defaultValue="50") int limit,@RequestParam(defaultValue="") String search) {
        return service.list(offset,limit,search).stream().map(CustomerView::of).toList();
    }
    @GetMapping("/{id}/subjects")
    public java.util.List<com.htt.management.crm.domain.CustomerSubject> subjects(@PathVariable String id) {return service.subjects(id);}
    @GetMapping("/{id}") public CustomerView read(@PathVariable String id) { return CustomerView.of(service.read(id)); }
    @PutMapping("/{id}") public CustomerView update(@PathVariable String id,@RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(content=@io.swagger.v3.oas.annotations.media.Content(
                schema=@io.swagger.v3.oas.annotations.media.Schema(implementation=CustomerInput.class))) JsonNode body) {
        return CustomerView.of(service.update(id,customerInput(body),body.has("billingAddress")));
    }
    public record StatusInput(Long version,Status status) { }
    @PatchMapping("/{id}/status") public CustomerView status(@PathVariable String id,@RequestBody StatusInput input) {
        if(input.version()==null||input.version()<1) throw new InvalidCustomer("version");
        return CustomerView.of(service.status(id,input.version(),input.status()));
    }
    @PostMapping("/{id}/locations") public ResponseEntity<CustomerView> location(@PathVariable String id,@RequestBody CustomerInput.LocationInput input) {
        return ResponseEntity.status(201).body(CustomerView.of(service.location(id,null,input)));
    }
    @PutMapping("/{id}/locations/{locationId}") public CustomerView locationUpdate(@PathVariable String id,@PathVariable String locationId,
            @RequestBody CustomerInput.LocationInput input) { return CustomerView.of(service.location(id,locationId,input)); }
    @PostMapping("/{id}/contacts") public ResponseEntity<CustomerView> contact(@PathVariable String id,@RequestBody CustomerInput.ContactInput input) {
        return ResponseEntity.status(201).body(CustomerView.of(service.contact(id,null,input)));
    }
    @PutMapping("/{id}/contacts/{contactId}") public CustomerView contactUpdate(@PathVariable String id,@PathVariable String contactId,
            @RequestBody CustomerInput.ContactInput input) { return CustomerView.of(service.contact(id,contactId,input)); }

    private CustomerInput customerInput(JsonNode body) {
        if(!body.isObject()) throw new InvalidCustomer("body");
        Set<String> fields=Set.of("version","businessName","tradingName","abn","businessType","status","email","phone","website",
                "pricingTier","creditHold","creditLimit","currency","paymentTermsType","paymentTermsDays","internalNotes","billingAddress","locations","contacts");
        for(var property:body.properties()) if(!fields.contains(property.getKey())) throw new InvalidCustomer(property.getKey());
        for(String forbidden:Set.of("id","code","currentBalance","overdueBalance","primaryLocationId","primaryContactId","password","password_hash"))
            if(body.has(forbidden)) throw new InvalidCustomer(forbidden);
        for(String field:List.of("locations","contacts")) if(body.hasNonNull(field)) {
            var entries=body.get(field);
            if(!entries.isArray()||entries.size()>200) throw new InvalidCustomer(field);
            for(var item:entries) if(!item.isObject()) throw new InvalidCustomer(field);
        }
        ObjectNode copy=(ObjectNode)body.deepCopy();
        if(copy.hasNonNull("billingAddress")) {
            var address=copy.get("billingAddress");
            if(!address.isObject()) throw new InvalidCustomer("billingAddress");
            boolean empty=true;
            for(String field:List.of("addressLine1","addressLine2","suburb","state","postcode","country"))
                if(address.hasNonNull(field)&&!address.get(field).asString().isBlank()) empty=false;
            if(empty) copy.putNull("billingAddress");
        }
        return json.treeToValue(copy,CustomerInput.class);
    }
}
