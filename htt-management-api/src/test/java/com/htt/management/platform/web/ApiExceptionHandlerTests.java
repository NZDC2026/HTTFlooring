package com.htt.management.platform.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiExceptionHandlerTests {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new ErrorTestController())
                .setControllerAdvice(new ApiExceptionHandler())
                .addFilters(new RequestIdFilter()).build();
    }

    @Test
    void malformedJsonDoesNotRevealParserDetailsOrRequestValues() throws Exception {
        mvc.perform(post("/test/errors").contentType(MediaType.APPLICATION_JSON).content("{secret:"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.fieldErrors").isEmpty())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .doesNotContain("secret", "Exception", "stackTrace"));
    }

    @Test
    void validationReportsFieldWithoutRejectedValue() throws Exception {
        mvc.perform(post("/test/errors").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("name"))
                .andExpect(jsonPath("$.fieldErrors[0].rejectedValue").doesNotExist());
    }

    @Test
    void unexpectedErrorIsOpaqueAndRequestIdMatchesHeader() throws Exception {
        mvc.perform(get("/test/errors/failure")).andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.retryable").value(false))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains(result.getResponse().getHeader("X-Request-Id"))
                        .doesNotContain("internal-database-detail"));
        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void methodMismatchKeepsAllowHeaderAndErrorContract() throws Exception {
        mvc.perform(get("/test/errors")).andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", "POST"))
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void missingEndpointUsesSameErrorContract() throws Exception {
        mvc.perform(get("/missing")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    // Test-only controller, never part of the production application scan.
    @RestController
    @Profile("error-contract-test")
    @RequestMapping("/test/errors")
    static class ErrorTestController {
        @PostMapping
        Input validate(@Valid @RequestBody Input input) { return input; }

        @GetMapping("/failure")
        void fail() { throw new IllegalStateException("internal-database-detail"); }
    }

    record Input(@NotBlank String name) { }
}
