package com.htt.management.identity;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty(name = "htt.auth.enabled", havingValue = "true")
public class CurrentUserController {
    public record Company(UUID actorId, UUID companyId, String companyName, UUID membershipId, Set<String> permissions) {}
    public record StaffSession(List<Company> companies) {}
    public record Context(UUID companyId, String companyName, UUID grantId, long grantVersion,
            UUID customerId, String customerCode, String customerName) {}
    public record PortalSession(List<Context> contexts, Instant dataAsOf) {}

    @GetMapping("/api/v1/me")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "staff")
    @PreAuthorize("@resourceAccess.isStaff()")
    public StaffSession staff(@AuthenticationPrincipal VerifiedUser user) {
        return new StaffSession(user.access().companies().stream().map(company -> new Company(
                user.access().actorId(), company.companyId(), company.companyName(), company.membershipId(),
                company.permissions())).toList());
    }

    @GetMapping("/api/portal/v1/me")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "portal")
    @PreAuthorize("@resourceAccess.isCustomer()")
    public PortalSession portal(@AuthenticationPrincipal VerifiedUser user) {
        Instant now = Instant.now();
        return new PortalSession(user.access().companies().stream().flatMap(company -> company.grants().stream()
                .filter(grant -> grant.customerId() != null)
                .map(grant -> new Context(company.companyId(), company.companyName(), grant.id(), grant.version(),
                        grant.customerId(), grant.customerCode(), grant.customerName()))).toList(), now);
    }
}
