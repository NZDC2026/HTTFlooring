package com.htt.management.identity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Authentication alone never opens a new API controller without an explicit method policy. */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "htt.auth.enabled", havingValue = "true")
class ApiPolicyConfiguration implements WebMvcConfigurer {
    private final AccessAudit audit;
    ApiPolicyConfiguration(AccessAudit audit) { this.audit = audit; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                if (!(handler instanceof HandlerMethod method)
                        || !(AnnotatedElementUtils.hasAnnotation(method.getMethod(), PreAuthorize.class)
                            || AnnotatedElementUtils.hasAnnotation(method.getBeanType(), PreAuthorize.class))) {
                    audit.record(request, "http:missing-policy", null, null, "DENY");
                    throw new AccessDeniedException("An explicit API policy is required.");
                }
                return true;
            }
        }).addPathPatterns("/api/**");
    }
}
