package com.htt.management.crm.api;

import com.htt.management.crm.application.CustomerBranches;
import com.htt.management.crm.application.ListCustomerBranches;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty(name = {"htt.auth.enabled", "htt.portal.branches-enabled"}, havingValue = "true")
public class PortalBranchController {
    private final ListCustomerBranches branches;
    public PortalBranchController(ListCustomerBranches branches) { this.branches = branches; }

    @GetMapping("/api/portal/v1/branches")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "portal")
    @PreAuthorize("@resourceAccess.isCustomer()")
    public ResponseEntity<CustomerBranches> list(
            @RequestHeader(value = "X-Company-Id", required = false) String company,
            @RequestHeader(value = "X-Portal-Grant-Id", required = false) String grant) {
        var context = PortalBranchContext.fromHeaders(company, grant);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(branches.read(context.companyId(), context.grantId()));
    }
}
