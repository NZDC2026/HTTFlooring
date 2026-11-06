package com.htt.management.platform.security;

import com.htt.management.platform.web.ApiErrorWriter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, Environment environment,
            ApiErrorWriter errors, ObjectProvider<AuthenticationManagerResolver<HttpServletRequest>> managers,
            @Qualifier("identityEntryPoint") ObjectProvider<AuthenticationEntryPoint> entryPoints,
            @Qualifier("identityDeniedHandler") ObjectProvider<AccessDeniedHandler> deniedHandlers) throws Exception {
        var resolver = managers.getIfAvailable();
        AuthenticationEntryPoint entryPoint = entryPoints.getIfAvailable(() -> (request, response, exception) ->
                errors.write(request, response, 401, "AUTHENTICATION_REQUIRED", "Authentication is required."));
        AccessDeniedHandler deniedHandler = deniedHandlers.getIfAvailable(() -> (request, response, exception) ->
                errors.write(request, response, 403, "ACCESS_DENIED", "Access is denied."));
        http.authorizeHttpRequests(authorize -> {
            authorize.requestMatchers(HttpMethod.GET, "/actuator/health",
                    "/actuator/health/liveness", "/actuator/health/readiness").permitAll();
            if (environment.matchesProfiles("local")) {
                authorize.requestMatchers(HttpMethod.GET, "/v3/api-docs", "/v3/api-docs/**",
                        "/v3/api-docs.yaml", "/swagger-ui.html", "/swagger-ui/**").permitAll();
            }
            if (resolver != null) {
                authorize.requestMatchers("/api/v1/**", "/api/portal/v1/**").authenticated();
            }
            authorize.anyRequest().denyAll();
        });
        http.formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(entryPoint).accessDeniedHandler(deniedHandler));
        if (resolver != null) {
            http.oauth2ResourceServer(resource -> resource.authenticationManagerResolver(resolver)
                    .authenticationEntryPoint(entryPoint).accessDeniedHandler(deniedHandler));
            // Only these stateless Bearer APIs are exempt. No cookie/session authentication is accepted.
            http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/**", "/api/portal/v1/**"));
        }
        return http.build();
    }
}
