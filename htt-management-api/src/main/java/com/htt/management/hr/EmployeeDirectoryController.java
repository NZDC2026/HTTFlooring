package com.htt.management.hr;

import com.htt.management.identity.VerifiedUser;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
@PreAuthorize("@resourceAccess.isStaff()")
@ConditionalOnProperty(name = {"htt.auth.enabled", "htt.employees.enabled"}, havingValue = "true")
@SecurityRequirement(name = "staff")
public class EmployeeDirectoryController {
    private final EmployeeDirectory directory;

    public EmployeeDirectoryController(EmployeeDirectory directory) { this.directory = directory; }

    @PostMapping
    public ResponseEntity<EmployeeDirectory.Summary> create(@AuthenticationPrincipal VerifiedUser user,
            HttpServletRequest request, @RequestHeader("X-Company-Id") UUID company,
            @RequestHeader("Idempotency-Key") UUID operation, @Valid @RequestBody CreateEmployeeRequest input) {
        var employee = directory.create(user, request, company, operation, input);
        return ResponseEntity.created(URI.create("/api/v1/employees/" + employee.id()))
                .cacheControl(CacheControl.noStore()).body(employee);
    }

    @GetMapping
    public ResponseEntity<EmployeeDirectory.Page> list(@AuthenticationPrincipal VerifiedUser user,
            HttpServletRequest request, @RequestHeader("X-Company-Id") UUID company,
            @RequestParam(defaultValue = "ACTIVE") EmployeeDirectory.Filter status,
            @RequestParam(defaultValue = "") @Size(max = 200) String q,
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(directory.list(user, request, company, status, q, offset, limit));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeDirectory.Detail> detail(@AuthenticationPrincipal VerifiedUser user,
            HttpServletRequest request, @RequestHeader("X-Company-Id") UUID company, @PathVariable UUID employeeId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(directory.detail(user, request, company, employeeId));
    }
}
