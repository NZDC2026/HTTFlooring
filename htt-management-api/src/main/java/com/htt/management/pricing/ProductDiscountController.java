package com.htt.management.pricing;

import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
@io.swagger.v3.oas.annotations.tags.Tag(name="客户商品折扣")
public class ProductDiscountController {
    private final ProductDiscountService service;
    public ProductDiscountController(ProductDiscountService service) { this.service=service; }

    @PutMapping("/api/v1/customer-subjects/{subjectId}/product-discounts/{productId}")
    @PreAuthorize("@resourceAccess.isStaff()")
    @io.swagger.v3.oas.annotations.Operation(summary="Set a subject/product discount; version 0 creates, positive version updates")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
    public ResponseEntity<ProductDiscountService.Discount> set(@PathVariable String subjectId,@PathVariable UUID productId,
            @RequestBody ProductDiscountService.Input input) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(service.set(subjectId,productId,input));
    }

    @GetMapping("/api/v1/customer-subjects/{subjectId}/product-discounts/{productId}")
    @PreAuthorize("@resourceAccess.isStaff()")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
    public ResponseEntity<ProductDiscountService.Discount> read(@PathVariable String subjectId,@PathVariable UUID productId) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(service.read(subjectId,productId));
    }

    @DeleteMapping("/api/v1/customer-subjects/{subjectId}/product-discounts/{productId}")
    @PreAuthorize("@resourceAccess.isStaff()")
    @io.swagger.v3.oas.annotations.Operation(summary="Remove an explicit rule; a contact then inherits the company rule")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
    public ResponseEntity<Void> remove(@PathVariable String subjectId,@PathVariable UUID productId,@RequestParam long version) {
        service.remove(subjectId,productId,version);return ResponseEntity.noContent().header("Cache-Control","no-store").build();
    }
    public record Query(List<UUID> productIds) { }
    @PostMapping("/api/portal/v1/product-discounts/resolve")
    @PreAuthorize("@resourceAccess.isCustomer()")
    @io.swagger.v3.oas.annotations.Operation(summary="Resolve up to 100 product discounts for the verified account; no subject/company selector")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="portal")
    public ResponseEntity<List<ProductDiscountStore.Effective>> resolve(@RequestBody Query query) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(service.resolve(query.productIds()));
    }
}
