package com.htt.management.platform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class OpenApiConfiguration {

    @Bean
    OpenAPI openAPI(Environment environment) {
        OpenAPI api = new OpenAPI().info(new Info()
                .title("HTT Management API")
                .version("0.0.1-SNAPSHOT")
                .description("Shared HTT APIs. Each operation requires verified identity, permissions and resource scope."));
        if (environment.matchesProfiles("development")) {
            Components components = new Components();
            for (String realm : new String[]{"staff", "portal"}) {
                String issuer = environment.getRequiredProperty("htt.auth." + realm + ".issuer");
                components.addSecuritySchemes(realm, new SecurityScheme().type(SecurityScheme.Type.OAUTH2)
                        .flows(new OAuthFlows().authorizationCode(new OAuthFlow()
                                .authorizationUrl(issuer + "/protocol/openid-connect/auth")
                                .tokenUrl(issuer + "/protocol/openid-connect/token")
                                .scopes(new Scopes().addString("openid", "OpenID Connect login")))));
            }
            api.components(components);
        }
        return api;
    }
}
