package com.htt.management.identity;

import java.net.http.*;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Flow;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class KeycloakAccountsTests {
    private static final String ISSUER="https://identity.example.invalid/realms/customer";
    private static HttpResponse<String> reply(int status,String body) {
        return new StubResponse(status,body);
    }
    private record StubResponse(int statusCode,String body) implements HttpResponse<String> {
        public HttpRequest request() { return null; }
        public java.util.Optional<HttpResponse<String>> previousResponse() { return java.util.Optional.empty(); }
        public HttpHeaders headers() { return HttpHeaders.of(java.util.Map.of(),(a,b)->true); }
        public java.util.Optional<javax.net.ssl.SSLSession> sslSession() { return java.util.Optional.empty(); }
        public java.net.URI uri() { return java.net.URI.create(ISSUER); }
        public HttpClient.Version version() { return HttpClient.Version.HTTP_1_1; }
    }
    private KeycloakAccounts client(HttpClient http) { return new KeycloakAccounts(ISSUER,"test-client","test-only-secret",new JsonMapper(),http); }
    private static String body(HttpRequest request) {
        var text=new StringBuilder();
        request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<ByteBuffer>() {
            public void onSubscribe(Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(ByteBuffer bytes) { text.append(StandardCharsets.UTF_8.decode(bytes)); }
            public void onError(Throwable failure) { throw new AssertionError(failure); }
            public void onComplete() { }
        });return text.toString();
    }

    @Test void neverAcceptsUntrustedTransportOrCredentialUrls() {
        for(String issuer:List.of("http://identity.invalid/realms/test","https://user:secret@identity.invalid/realms/test",
                "https://identity.invalid/realms/test?server=other","https://identity.invalid/realms/test/../../admin"))
            assertThatThrownBy(()->new KeycloakAccounts(issuer,"x","x",new JsonMapper())).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void unconfiguredServiceFailsWithoutNetworkCalls() {
        var http=mock(HttpClient.class);var client=new KeycloakAccounts(ISSUER,"","",new JsonMapper(),http);
        assertThatThrownBy(()->client.ensure("test@example.invalid",null,null,UUID.randomUUID())).isInstanceOf(ResponseStatusException.class)
                .satisfies(f->assertThat(((ResponseStatusException)f).getStatusCode().value()).isEqualTo(503));
        verifyNoInteractions(http);
    }
    @Test void createsOwnedUserWithoutPasswordOrAutomaticActionEmail() throws Exception {
        var http=mock(HttpClient.class);UUID operation=UUID.randomUUID(),subject=UUID.randomUUID();
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
            .thenReturn(reply(200,"{\"access_token\":\"service-test-token\"}"),reply(200,"[]"),reply(201,""),
                reply(200,"[{\"id\":\""+subject+"\",\"enabled\":true,\"attributes\":{\"htt.account.key\":[\""+operation+"\"]}}]"));
        assertThat(client(http).ensure("test@example.invalid","test@example.invalid",null,operation).subject()).isEqualTo(subject.toString());
        var captor=ArgumentCaptor.forClass(HttpRequest.class);
        verify(http,times(4)).send(captor.capture(),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any());
        var create=captor.getAllValues().get(2);
        assertThat(create.method()).isEqualTo("POST");
        assertThat(body(create)).contains("UPDATE_PASSWORD","htt.account.key").doesNotContain("credentials","password_hash","test-only-secret");
        assertThat(captor.getAllValues()).noneMatch(r->r.uri().toString().contains("execute-actions-email"));
    }
    @Test void cannotAdoptExistingIdentityWithoutItsOperationOwnership() throws Exception {
        var http=mock(HttpClient.class);
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
            .thenReturn(reply(200,"{\"access_token\":\"test\"}"),reply(200,"[{\"id\":\""+UUID.randomUUID()+"\",\"enabled\":true,\"attributes\":{}}]"));
        assertThatThrownBy(()->client(http).ensure("existing@example.invalid",null,null,UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class).satisfies(f->assertThat(((ResponseStatusException)f).getStatusCode().value()).isEqualTo(409));
    }
    @Test void explicitSubjectMustMatchCanonicalUsernameAndEnabledUser() throws Exception {
        var http=mock(HttpClient.class);
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
            .thenReturn(reply(200,"{\"access_token\":\"test\"}"),reply(200,"{\"username\":\"another@example.invalid\",\"enabled\":true}"));
        assertThatThrownBy(()->client(http).ensure("expected@example.invalid",null,UUID.randomUUID().toString(),UUID.randomUUID())).isInstanceOf(ResponseStatusException.class);
    }
    @Test void disablePreservesUserRepresentationAndEndsSessions() throws Exception {
        var http=mock(HttpClient.class);
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
            .thenReturn(reply(200,"{\"access_token\":\"test\"}"),reply(200,"{\"username\":\"existing\",\"firstName\":\"Preserved\",\"enabled\":true}"),reply(204,""),reply(204,""));
        client(http).enabled(UUID.randomUUID().toString(),false);
        var captor=ArgumentCaptor.forClass(HttpRequest.class);verify(http,times(4)).send(captor.capture(),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any());
        assertThat(body(captor.getAllValues().get(2))).contains("Preserved","\"enabled\":false");
        assertThat(captor.getAllValues().get(3).uri().getPath()).endsWith("/logout");
    }
    @Test void resetDelegatesToBoundedKeycloakActionAndDoesNotReturnActionToken() throws Exception {
        var http=mock(HttpClient.class);
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
            .thenReturn(reply(200,"{\"access_token\":\"test\"}"),reply(200,"{\"requiredActions\":[\"VERIFY_EMAIL\"]}"),reply(204,""),reply(204,""),reply(204,""));
        client(http).reset(UUID.randomUUID().toString());
        var captor=ArgumentCaptor.forClass(HttpRequest.class);verify(http,times(5)).send(captor.capture(),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any());
        assertThat(body(captor.getAllValues().get(2))).contains("VERIFY_EMAIL","UPDATE_PASSWORD");
        assertThat(captor.getAllValues().get(3).uri().getPath()).endsWith("/logout");
        assertThat(captor.getAllValues().get(4).uri().getQuery()).isEqualTo("lifespan=900");
        assertThat(body(captor.getAllValues().get(4))).isEqualTo("[\"UPDATE_PASSWORD\"]");
    }
    @Test void introspectionFailsClosedAndDoesNotExposeRemoteBodies() throws Exception {
        var http=mock(HttpClient.class);
        when(http.send(any(HttpRequest.class),org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(reply(200,"{\"active\":false}"),reply(500,"private-remote-details"));
        assertThat(client(http).active("test-access-token")).isFalse();
        assertThatThrownBy(()->client(http).active("test-access-token")).isInstanceOf(ResponseStatusException.class)
                .hasMessageNotContaining("private-remote-details").hasMessageNotContaining("test-access-token").hasMessageNotContaining("test-only-secret");
    }
    @Test void transactionGuardPreventsEveryRemoteSideEffect() {
        var http=mock(HttpClient.class);
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try { assertThatThrownBy(()->client(http).reset(UUID.randomUUID().toString())).isInstanceOf(IllegalStateException.class); }
        finally { TransactionSynchronizationManager.setActualTransactionActive(false); }
        verifyNoInteractions(http);
    }
}
