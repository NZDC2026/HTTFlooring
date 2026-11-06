package au.com.htt.backend;

import java.net.URI;
import java.time.Duration;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "server.address=127.0.0.1")
class ApiSmokeTest {
    @LocalServerPort
    int port;

    @Test
    @Timeout(20)
    void exposesLivenessAndDeniesUnmigratedRoutes() throws Exception {
        try (var client = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(3)).build()) {
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
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).timeout(Duration.ofSeconds(5)).build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
