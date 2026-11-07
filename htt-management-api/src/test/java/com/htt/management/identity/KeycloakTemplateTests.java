package com.htt.management.identity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;

/** Static safety checks only: not evidence of a successful Keycloak import or real login. */
class KeycloakTemplateTests {
    private static final Path DIRECTORY = Path.of("deploy/keycloak");

    @Test
    void developmentDatabaseStaysPrivateAndItsExceptionDoesNotEnterProduction() throws Exception {
        var yaml = new Yaml(new SafeConstructor(new LoaderOptions()));
        var document = (java.util.Map<?, ?>) yaml.load(Files.readString(DIRECTORY.resolve("compose.development.yaml")));
        var services = (java.util.Map<?, ?>) document.get("services");
        var database = (java.util.Map<?, ?>) services.get("keycloak-db");
        assertThat(database.containsKey("ports")).isFalse();
        var keycloak = (java.util.Map<?, ?>) services.get("keycloak");
        var environment = (java.util.Map<?, ?>) keycloak.get("environment");
        assertThat(environment.get("KC_DB_URL")).isEqualTo("jdbc:postgresql://keycloak-db:5432/htt_keycloak?sslmode=disable");
        assertThat(environment.get("KC_HTTP_ENABLED")).isEqualTo("false");
        assertThat(Files.readString(DIRECTORY.resolve("compose.yaml"))).doesNotContain("HTT_KEYCLOAK_DEVELOPMENT");
        var properties = new java.util.Properties();
        try (var input = Files.newInputStream(DIRECTORY.resolve("api.development.env.example"))) { properties.load(input); }
        assertThat(properties.getProperty("HTT_AUTH_ENABLED")).isEqualTo("false");
        for (String prefix : new String[] {"HTT_STAFF", "HTT_PORTAL"}) {
            new AuthenticationProperties.Provider(properties.getProperty(prefix + "_ISSUER"),
                    properties.getProperty(prefix + "_AUDIENCE"), properties.getProperty(prefix + "_JWKS_URI"),
                    AuthenticationProperties.Mode.OIDC).validate();
        }
    }

    @Test
    void publicClientsUsePkceWithoutPasswordGrantSecretsOrWildcardRedirects() throws Exception {
        var ids = new HashSet<String>();
        for (String realm : new String[] {"htt-staff", "htt-customer"}) {
            JsonNode config = JsonMapper.builder().build().readTree(
                    Files.readString(DIRECTORY.resolve("realms/" + realm + "-realm.json")));
            assertThat(config.path("realm").asString()).isEqualTo(realm);
            assertThat(config.path("sslRequired").asString()).isEqualTo("all");
            assertThat(config.has("users")).isFalse();
            for (JsonNode client : config.path("clients")) {
                assertThat(ids.add(client.path("clientId").asString())).isTrue();
                assertThat(client.path("publicClient").asBoolean()).isTrue();
                assertThat(client.path("standardFlowEnabled").asBoolean()).isTrue();
                for (String disabled : new String[] {"implicitFlowEnabled", "directAccessGrantsEnabled", "serviceAccountsEnabled"}) {
                    assertThat(client.path(disabled).asBoolean()).as(disabled).isFalse();
                }
                assertThat(client.has("secret")).isFalse();
                assertThat(client.path("attributes").path("pkce.code.challenge.method").asString()).isEqualTo("S256");
                assertThat(client.path("redirectUris").size()).isEqualTo(1);
                assertThat(client.path("redirectUris").get(0).asString()).startsWith("${HTT_").endsWith("}").doesNotContain("*");
            }
        }
        assertThat(ids).containsExactlyInAnyOrder("htt-management-web", "htt-flooring-app", "htt-customer-portal");
    }

    @Test
    void bothStaffClientsTargetTheStaffApiAndPortalCannotTargetThatAudience() throws Exception {
        String api = Files.readString(DIRECTORY.resolve("api.env.example"));
        for (String realm : new String[] {"htt-staff", "htt-customer"}) {
            String audience = realm.equals("htt-staff") ? "htt-staff-api" : "htt-portal-api";
            String prefix = realm.equals("htt-staff") ? "HTT_STAFF" : "HTT_PORTAL";
            JsonNode config = JsonMapper.builder().build().readTree(
                    Files.readString(DIRECTORY.resolve("realms/" + realm + "-realm.json")));
            for (JsonNode client : config.path("clients")) {
                assertThat(client.path("protocolMappers").size()).isEqualTo(1);
                var mapper = client.path("protocolMappers").get(0);
                assertThat(mapper.path("protocolMapper").asString()).isEqualTo("oidc-audience-mapper");
                assertThat(mapper.path("config").path("included.custom.audience").asString()).isEqualTo(audience);
                assertThat(mapper.path("config").path("access.token.claim").asString()).isEqualTo("true");
                assertThat(mapper.path("config").path("id.token.claim").asString()).isEqualTo("false");
            }
            assertThat(api).contains(prefix + "_AUDIENCE=" + audience,
                    prefix + "_ISSUER=https://identity.example.invalid:18443/realms/" + realm,
                    prefix + "_JWKS_URI=https://identity.example.invalid:18443/realms/" + realm + "/protocol/openid-connect/certs");
        }
        assertThat(api).contains("HTT_AUTH_ENABLED=false");
    }

    @Test
    void composeRequiresExternalSecretsTlsAndAnExplicitImageAndKeepsManagementOnLoopback() throws Exception {
        String compose = Files.readString(DIRECTORY.resolve("compose.yaml"));
        var yaml = new Yaml(new SafeConstructor(new LoaderOptions()));
        var document = (java.util.Map<?, ?>) yaml.load(compose);
        var services = (java.util.Map<?, ?>) document.get("services");
        assertThat(services.keySet().toString()).isEqualTo("[keycloak]");
        assertThat(compose).contains("${KEYCLOAK_IMAGE:?", "KC_HTTP_ENABLED: \"false\"",
                "KC_HOSTNAME_STRICT: \"true\"", "127.0.0.1:${KEYCLOAK_MANAGEMENT_PORT", "--import-realm");
        assertThat(compose).doesNotContain("start-dev", "KC_DB_PASSWORD:", "KC_BOOTSTRAP_ADMIN_PASSWORD:", "0.0.0.0", "latest");
        String entrypoint = Files.readString(DIRECTORY.resolve("entrypoint.sh"));
        assertThat(entrypoint).contains("/htt_keycloak", "sslmode=verify-full", "exec /opt/keycloak/bin/kc.sh");
    }
}
