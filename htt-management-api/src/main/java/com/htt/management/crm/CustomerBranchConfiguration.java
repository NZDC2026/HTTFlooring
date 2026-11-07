package com.htt.management.crm;

import com.htt.management.crm.application.ListCustomerBranches;
import com.htt.management.crm.infrastructure.CustomerBranchRepository;
import com.htt.management.identity.CustomerBranchAccess;
import com.htt.management.identity.VerifiedToken;
import com.htt.management.crm.api.PortalBranchRateLimit;
import java.time.Clock;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration(proxyBeanMethods = false)
@EnableTransactionManagement
@ConditionalOnProperty(name = {"htt.auth.enabled", "htt.portal.branches-enabled"}, havingValue = "true")
public class CustomerBranchConfiguration {
    @Bean PortalBranchRateLimit portalBranchRateLimit() { return new PortalBranchRateLimit(Clock.systemUTC(), 100_000); }
    @Bean WebMvcConfigurer portalBranchRateLimitRules(PortalBranchRateLimit limiter) {
        return new WebMvcConfigurer() {
            @Override public void addInterceptors(InterceptorRegistry registry) {
                registry.addInterceptor(new HandlerInterceptor() {
                    @Override public boolean preHandle(jakarta.servlet.http.HttpServletRequest request,
                            jakarta.servlet.http.HttpServletResponse response, Object handler) {
                        var authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication == null || !(authentication.getDetails() instanceof VerifiedToken token))
                            throw new org.springframework.security.access.AccessDeniedException("Access is denied.");
                        if (limiter.allow(token.issuer(), token.subject())) return true;
                        response.setStatus(429); // Legacy middleware returned an empty 429 response.
                        return false;
                    }
                }).addPathPatterns("/api/portal/v1/branches");
            }
        };
    }
    @Bean CustomerBranchRepository customerBranchRepository(JdbcTemplate jdbc) { return new CustomerBranchRepository(jdbc); }
    @Bean ListCustomerBranches listCustomerBranches(CustomerBranchAccess access, CustomerBranchRepository repository) {
        return new ListCustomerBranches(access, repository);
    }
}
