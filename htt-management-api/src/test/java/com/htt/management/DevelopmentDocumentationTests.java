package com.htt.management;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@SpringBootTest(properties = {"htt.auth.enabled=false", "htt.portal.branches-enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles({"test", "development"})
class DevelopmentDocumentationTests {
    @Autowired MockMvc mvc;

    @Test
    void developmentDocumentsHaveTwoExplicitRealmsAndPkceWithoutSecrets() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.staff.flows.authorizationCode.authorizationUrl")
                        .value("https://192.168.10.174:18443/realms/htt-staff/protocol/openid-connect/auth"))
                .andExpect(jsonPath("$.components.securitySchemes.portal.flows.authorizationCode.tokenUrl")
                        .value("https://192.168.10.174:18443/realms/htt-customer/protocol/openid-connect/token"))
                .andExpect(jsonPath("$.components.securitySchemes.staff.flows.password").doesNotExist());
        mvc.perform(get("/v3/api-docs/swagger-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.persistAuthorization").value(false));
        mvc.perform(get("/swagger-ui/oauth2-redirect.html")).andExpect(status().isOk());
        mvc.perform(get("/swagger-ui/swagger-initializer.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("htt-api-swagger")))
                .andExpect(content().string(containsString("usePkceWithAuthorizationCodeGrant")));
    }

    @Test
    void exposingDocumentationDoesNotExposeBusinessOrManagementApis() throws Exception {
        for (String path : new String[]{"/api/v1/me", "/api/portal/v1/branches", "/actuator/env"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        }
    }
}
