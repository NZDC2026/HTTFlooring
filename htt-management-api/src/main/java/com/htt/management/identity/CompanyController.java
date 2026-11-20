package com.htt.management.identity;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(name={"htt.auth.enabled","htt.companies.enabled"},havingValue="true")
@io.swagger.v3.oas.annotations.tags.Tag(name="公司管理（超级管理员）")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="staff")
public class CompanyController {
    private final CompanyService service;
    public CompanyController(CompanyService service) {this.service=service;}
    @PostMapping("/api/v1/companies")
    @PreAuthorize("@resourceAccess.isStaff()")
    @io.swagger.v3.oas.annotations.Operation(summary="Create an operating company with explicit global company:create authority",
            description="Requires Idempotency-Key UUID. No X-Company-Id is needed. Does not automatically assign employees, ownership, data access or financial configuration.")
    public ResponseEntity<CompanyService.Company> create(@RequestHeader("Idempotency-Key") UUID operation,@Valid @RequestBody CompanyService.Create input) {
        var result=service.create(operation,input);
        return ResponseEntity.status(201).header("Cache-Control","no-store").body(result);
    }
}
