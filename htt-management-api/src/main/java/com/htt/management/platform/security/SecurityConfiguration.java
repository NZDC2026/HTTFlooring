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
    private static final String[] AUTH_PREFIXES={"/api/v1/customer/auth","/api/v1/user/auth","/api/portal/v1/auth","/api/v1/auth"};

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
            if (environment.matchesProfiles("local", "development")) {
                authorize.requestMatchers(HttpMethod.GET, "/v3/api-docs", "/v3/api-docs/**",
                        "/v3/api-docs.yaml", "/swagger-ui.html", "/swagger-ui/**").permitAll();
            }
            if (resolver != null) {
                if(environment.getProperty("htt.auth.local-enabled",Boolean.class,false)) {
                    for(String prefix:AUTH_PREFIXES) {
                        authorize.requestMatchers(HttpMethod.GET,prefix+"/csrf").permitAll();
                        authorize.requestMatchers(HttpMethod.POST,prefix+"/login",prefix+"/browser-login",prefix+"/refresh",prefix+"/logout",prefix+"/browser-logout").permitAll();
                    }
                } else if(environment.getProperty("htt.customers.enabled",Boolean.class,false)) {
                    authorize.requestMatchers(HttpMethod.GET,"/api/portal/v1/auth/config").permitAll();
                    authorize.requestMatchers(HttpMethod.POST,"/api/portal/v1/auth/login","/api/portal/v1/auth/forgot-password","/api/portal/v1/auth/reset-password").permitAll();
                }
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
            if(environment.getProperty("htt.auth.local-enabled",Boolean.class,false)) {
                boolean secure=environment.getProperty("htt.auth.cookie-secure",Boolean.class,true);
                var tokens=new org.springframework.security.web.csrf.CookieCsrfTokenRepository();
                tokens.setCookieName(secure?"__Host-HTT-CSRF":"HTT-CSRF");
                tokens.setHeaderName("X-HTT-CSRF");
                tokens.setCookieCustomizer(cookie->cookie.httpOnly(true).secure(secure).path("/").sameSite("Strict"));
                http.csrf(csrf->csrf.csrfTokenRepository(tokens).requireCsrfProtectionMatcher(request->{
                    if(!request.getMethod().equals("POST")) return false;
                    String path=request.getRequestURI().substring(request.getContextPath().length());
                    boolean logout=java.util.Arrays.stream(AUTH_PREFIXES).anyMatch(prefix->path.equals(prefix+"/logout"));
                    if(logout) {
                        String authorization=request.getHeader("Authorization");
                        // A syntactic Bearer header only selects the Bearer authentication branch;
                        // Resource Server must verify it, and invalid tokens never fall back to cookies.
                        boolean bearer=authorization!=null&&authorization.regionMatches(true,0,"Bearer ",0,7);
                        return !bearer;
                    }
                    return java.util.Arrays.stream(AUTH_PREFIXES).anyMatch(prefix->java.util.Set.of(prefix+"/browser-login",prefix+"/refresh",prefix+"/browser-logout").contains(path));
                }));
            } else {
                // Historical stateless Bearer APIs do not accept cookie authentication.
                http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/**", "/api/portal/v1/**"));
            }
        }
        return http.build();
    }
}
