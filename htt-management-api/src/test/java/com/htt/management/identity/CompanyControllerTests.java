package com.htt.management.identity;

import com.htt.management.platform.web.ApiExceptionHandler;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** HTTP/validation contract only; real security and storage are covered by PostgreSQL integration tests. */
class CompanyControllerTests {
    private CompanyService service;
    private MockMvc mvc;
    @BeforeEach void prepare() {
        service=mock(CompanyService.class);
        mvc=MockMvcBuilders.standaloneSetup(new CompanyController(service)).setControllerAdvice(new ApiExceptionHandler()).build();
    }
    @Test void creationReturnsMetadataAndNoStore()throws Exception {
        UUID id=UUID.randomUUID(),key=UUID.randomUUID();
        when(service.create(eq(key),any())).thenReturn(new CompanyService.Company(id,"HTT-TEST","Synthetic Company","Sydney","ACTIVE",1,Instant.EPOCH,Instant.EPOCH));
        mvc.perform(post("/api/v1/companies").header("Idempotency-Key",key).contentType("application/json")
                .content("{\"code\":\"HTT-TEST\",\"name\":\"Synthetic Company\",\"city\":\"Sydney\"}"))
                .andExpect(status().isCreated()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(jsonPath("$.id").value(id.toString())).andExpect(jsonPath("$.city").value("Sydney"));
    }
    @Test void invalidInputDoesNotReachCreationUseCase()throws Exception {
        mvc.perform(post("/api/v1/companies").header("Idempotency-Key",UUID.randomUUID()).contentType("application/json")
                .content("{\"code\":\"lowercase\",\"name\":\"\",\"city\":\"Sydney\"}"))
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        verifyNoInteractions(service);
    }
    @Test void idempotencyHeaderIsRequired()throws Exception {
        mvc.perform(post("/api/v1/companies").contentType("application/json")
                .content("{\"code\":\"HTT-TEST\",\"name\":\"Synthetic Company\",\"city\":\"Sydney\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
