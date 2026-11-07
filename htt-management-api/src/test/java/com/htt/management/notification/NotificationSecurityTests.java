package com.htt.management.notification;

import com.htt.management.identity.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import static com.htt.management.identity.AccessSnapshot.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import java.time.Duration;

/** Tests HTTP authorization/stream behavior. Signature verification is covered by AuthenticationIntegrationTests. */
@SpringBootTest(properties={"htt.auth.enabled=true","htt.notification.enabled=true","htt.notification.workers-enabled=false",
    "htt.auth.staff.issuer=https://staff.example.invalid","htt.auth.staff.audience=staff","htt.auth.staff.jwk-set-uri=https://staff.example.invalid/certs",
    "htt.auth.portal.issuer=https://portal.example.invalid","htt.auth.portal.audience=portal","htt.auth.portal.jwk-set-uri=https://portal.example.invalid/certs"})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class NotificationSecurityTests {
    static final UUID USER=UUID.randomUUID(), COMPANY=UUID.randomUUID(), GRANT=UUID.randomUUID(), CUSTOMER=UUID.randomUUID();
    @Autowired MockMvc mvc;
    @Autowired SseHub hub;
    @MockitoBean AccessRepository repository;
    @MockitoBean AccessAudit audit;
    @MockitoBean NotificationStore store;
    @MockitoBean JdbcTemplate jdbc;
    @MockitoBean PlatformTransactionManager manager;
    @MockitoBean CachingConnectionFactory factory;
    @MockitoBean RabbitAdmin notificationRabbitAdmin;
    @MockitoBean(name="notificationWakeups") SimpleMessageListenerContainer wakeups;
    @MockitoBean(name="staffJwtDecoder") JwtDecoder staff;
    @MockitoBean(name="portalJwtDecoder") JwtDecoder portal;
    @BeforeEach void prepare() {
        when(staff.decode(anyString())).thenReturn(jwt("https://staff.example.invalid"));
        when(portal.decode(anyString())).thenReturn(jwt("https://portal.example.invalid"));
        when(repository.resolve(anyString(),eq("subject"),any())).thenReturn(snapshot(Set.of("notification:read","notification:device")));
        when(store.history(any(),anyLong(),anyInt())).thenReturn(new NotificationModels.History(List.of(),0,0,false));
    }
    @AfterEach void cleanup() {
        when(repository.resolve(anyString(),anyString(),any())).thenReturn(null);
        hub.tick(); await().atMost(Duration.ofSeconds(3)).until(() -> hub.connectionCount()==0);
    }
    @Test void anonymousSseAndQueryStringTokenAreRejected() throws Exception {
        mvc.perform(get("/api/v1/notifications/stream")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/notifications/stream").param("access_token","test-token")).andExpect(status().isUnauthorized());
        verifyNoInteractions(store);
    }
    @Test void missingPermissionOrForeignCompanyIsForbidden() throws Exception {
        when(repository.resolve(anyString(),anyString(),any())).thenReturn(snapshot(Set.of()));
        mvc.perform(get("/api/v1/notifications/stream").accept("text/event-stream").header("Authorization","Bearer test-token").header("X-Company-Id",COMPANY))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        when(repository.resolve(anyString(),anyString(),any())).thenReturn(snapshot(Set.of("notification:read")));
        mvc.perform(get("/api/v1/notifications").header("Authorization","Bearer test-token").header("X-Company-Id",UUID.randomUUID()))
                .andExpect(status().isForbidden());
        verifyNoInteractions(store);
    }
    @Test void compensationQueryUsesVerifiedActorAndPortalGrant() throws Exception {
        mvc.perform(get("/api/portal/v1/notifications").param("after","12").param("limit","20")
                .header("Authorization","Bearer test-token").header("X-Company-Id",COMPANY).header("X-Portal-Grant-Id",GRANT)
                .header("X-User-Id",UUID.randomUUID())).andExpect(status().isOk()).andExpect(jsonPath("$.nextCursor").value(0));
        verify(store).history(argThat(session -> session.userId().equals(USER) && session.grantId().equals(GRANT)),eq(12L),eq(20));
        mvc.perform(get("/api/portal/v1/notifications").header("Authorization","Bearer test-token").header("X-Company-Id",COMPANY)
                .header("X-Portal-Grant-Id",UUID.randomUUID())).andExpect(status().isForbidden());
    }
    @Test void sseUsesLastEventIdAndClosesAfterRevocation() throws Exception {
        var notice=new NotificationModels.Notice(UUID.randomUUID(),COMPANY,USER,CUSTOMER,null,8,"Test notice","Test only.",Instant.now(),null);
        when(store.history(any(),eq(7L),anyInt())).thenReturn(new NotificationModels.History(List.of(notice),8,8,false));
        var result=mvc.perform(get("/api/v1/notifications/stream").header("Authorization","Bearer test-token")
                .header("X-Company-Id",COMPANY).header("Last-Event-ID","7"))
                .andExpect(status().isOk()).andExpect(request().asyncStarted()).andReturn();
        assertThat(hub.connectionCount()).isEqualTo(1);
        hub.tick(); await().atMost(Duration.ofSeconds(3)).until(() -> result.getResponse().getContentAsString().contains("heartbeat"));
        assertThat(result.getResponse().getContentAsString()).contains("id:8","event:notification","Test notice");
        verify(store,atLeastOnce()).history(any(),eq(7L),anyInt());
        when(repository.resolve(anyString(),anyString(),any())).thenReturn(null);
        hub.wakeup(new NotificationModels.Wakeup(COMPANY,USER)); hub.tick();
        await().atMost(Duration.ofSeconds(3)).until(() -> hub.connectionCount()==0);
    }
    @Test void perUserConnectionLimitIsEnforced() throws Exception {
        for (int i=0;i<2;i++) mvc.perform(get("/api/v1/notifications/stream").header("Authorization","Bearer test-token")
                .header("X-Company-Id",COMPANY)).andExpect(request().asyncStarted());
        mvc.perform(get("/api/v1/notifications/stream").header("Authorization","Bearer test-token").header("X-Company-Id",COMPANY))
                .andExpect(status().isTooManyRequests());
    }
    @Test void invalidCursorIs400AndCrossUserReadIs404() throws Exception {
        mvc.perform(get("/api/v1/notifications/stream").header("Authorization","Bearer test-token").header("X-Company-Id",COMPANY)
                .header("Last-Event-ID","invalid")).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/notifications/"+UUID.randomUUID()+"/read").header("Authorization","Bearer test-token")
                .header("X-Company-Id",COMPANY)).andExpect(status().isNotFound());
    }
    private static AccessSnapshot snapshot(Set<String> permissions) {
        return new AccessSnapshot(USER,"Test",Instant.EPOCH,List.of(new CompanyAccess(COMPANY,"Test",UUID.randomUUID(),MemberKind.CUSTOMER,
                Set.of(),permissions,List.of(new Grant(GRANT,1,Scope.CUSTOMER,CUSTOMER,"TEST","Test",Set.of())))));
    }
    private static Jwt jwt(String issuer) {
        return Jwt.withTokenValue("test-token").header("alg","RS256").issuer(issuer).subject("subject")
                .issuedAt(Instant.now().minusSeconds(1)).expiresAt(Instant.now().plusSeconds(300)).build();
    }
}
