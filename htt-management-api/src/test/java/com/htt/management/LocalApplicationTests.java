package com.htt.management;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class LocalApplicationTests {

    @LocalServerPort int port;
    @Autowired ApplicationContext context;
    @Autowired ObjectMapper objectMapper;

    @Test
    void localProfileStartsWithoutDatabaseOrRabbitConnections() {
        assertThat(context.getBeansOfType(DataSource.class)).isEmpty();
        assertThat(context.getBeansOfType(Flyway.class)).isEmpty();
        assertThat(context.getBeansOfType(RabbitAdmin.class)).isEmpty();
        assertThat(context.getBeansOfType(ConnectionFactory.class)).isEmpty();
    }

    @Test
    void realHttpHealthAndOpenApiWorkOnLoopback() throws Exception {
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            var health = get(client, "/actuator/health/readiness");
            assertThat(health.statusCode()).isEqualTo(200);
            assertThat(objectMapper.readTree(health.body()).path("status").asString()).isEqualTo("UP");
            assertThat(health.headers().firstValue("X-Request-Id")).isPresent();

            var docs = get(client, "/v3/api-docs");
            assertThat(docs.statusCode()).isEqualTo(200);
            var schema = objectMapper.readTree(docs.body());
            assertThat(schema.path("info").path("title").asString()).isEqualTo("HTT Management API");
            assertThat(schema.path("paths").isEmpty()).isTrue();

            var swagger = get(client, "/swagger-ui/index.html");
            assertThat(swagger.statusCode()).isEqualTo(200);
            assertThat(swagger.body()).contains("Swagger UI");

            var denied = get(client, "/api/v1/me");
            assertThat(denied.statusCode()).isEqualTo(401);
            assertThat(objectMapper.readTree(denied.body()).path("code").asString())
                    .isEqualTo("AUTHENTICATION_REQUIRED");
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(15)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
}
