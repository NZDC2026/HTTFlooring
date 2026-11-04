package au.com.htt.backend;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiSmokeTest {
    @LocalServerPort
    int port;

    @Test
    void exposesLivenessAndDeniesUnmigratedRoutes() throws Exception {
        try (var client = HttpClient.newHttpClient()) {
            var live = get(client, "/health/live");
            assertThat(live.statusCode()).isEqualTo(200);
            assertThat(live.headers().firstValue("X-Request-Id")).isPresent();
            assertThat(live.headers().firstValue("Cache-Control")).contains("no-store");
            assertThat(live.body()).isEqualTo("{\"status\":\"live\"}");
            assertThat(get(client, "/health/ready").statusCode()).isEqualTo(503);
            assertThat(get(client, "/api/v1/me").statusCode()).isEqualTo(403);
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
