package com.htt.management.platform.security;

import java.util.UUID;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiSecurityTests {

    @Autowired MockMvc mvc;
    @Autowired ApplicationContext context;

    @Test
    void testProfileDoesNotCreateDatabaseOrRabbitConnections() {
        assertThat(context.getBeansOfType(DataSource.class)).isEmpty();
        assertThat(context.getBeansOfType(Flyway.class)).isEmpty();
        assertThat(context.getBeansOfType(ConnectionFactory.class)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness"})
    void healthExposesOnlyStatus(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk())
                .andExpect(content().json("{\"status\":\"UP\"}"))
                .andExpect(jsonPath("$.components").doesNotExist())
                .andExpect(jsonPath("$.details").doesNotExist());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/me", "/api/v1/sales-orders", "/actuator/env",
            "/actuator/health/unknown", "/v3/api-docs", "/swagger-ui/index.html", "/login"})
    void anonymousRequestsAreDeniedWithoutLoginRedirect(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"))
                .andExpect(jsonPath("$.retryable").value(false))
                .andExpect(header().doesNotExist("Location"))
                .andExpect(header().doesNotExist("Set-Cookie"));
    }

    @Test
    void callerSuppliedRoleCompanyAndClientHeadersDoNotGrantAccess() throws Exception {
        mvc.perform(post("/api/v1/sales-orders").with(csrf())
                        .header("Authorization", "Bearer unverified-token")
                        .header("X-Role", "ADMIN").header("X-Company-Id", UUID.randomUUID())
                        .header("X-Client", "htt-management"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void evenAuthenticatedAdministratorCannotBypassUnimplementedPolicies() throws Exception {
        mvc.perform(post("/api/v1/sales-orders").with(user("manager").roles("ADMIN")).with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void csrfProtectionRemainsEnabled() throws Exception {
        mvc.perform(post("/api/v1/sales-orders").with(user("manager").roles("ADMIN")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void requestIdIsServerGeneratedAndMatchesErrorBody() throws Exception {
        var result = mvc.perform(get("/api/v1/me").header("X-Request-Id", "caller-controlled"))
                .andExpect(status().isUnauthorized()).andReturn();
        String requestId = result.getResponse().getHeader("X-Request-Id");
        assertThat(UUID.fromString(requestId)).isNotNull();
        mvc.perform(get("/api/v1/me")).andExpect(result2 ->
                assertThat(result2.getResponse().getHeader("X-Request-Id")).isNotEqualTo(requestId));
        assertThat(result.getResponse().getContentAsString()).contains("\"requestId\":\"" + requestId + "\"");
    }

    @Test
    void noGeneratedUserIsAvailable() {
        assertThat(context.getBeansOfType(UserDetailsService.class)).isEmpty();
    }
}
