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
    org.springdoc.core.customizers.OpenApiCustomizer canonicalAuthenticationPaths(Environment environment) {
        return api->{
            if(environment.getProperty("htt.auth.local-enabled",Boolean.class,false)&&api.getPaths()!=null) {
                api.getPaths().keySet().removeIf(path->path.startsWith("/api/v1/auth/")||path.startsWith("/api/portal/v1/auth/"));
                // One Java handler can serve both realms; publish each route under its actual identity domain.
                api.getPaths().forEach((path,item)->{
                    String tag=path.startsWith("/api/v1/customer/auth/")?"客户认证":
                            path.startsWith("/api/v1/user/auth/")?"员工认证":null;
                    if(tag!=null)item.readOperations().forEach(operation->operation.setTags(java.util.List.of(tag)));
                });
            }
        };
    }
    @Bean
    OpenAPI openAPI(Environment environment) {
        OpenAPI api = new OpenAPI().info(new Info()
                .title("HTT Management API")
                .version("0.0.1-SNAPSHOT")
                .description("Shared HTT APIs. Each operation requires verified identity, permissions and resource scope."));
        if (environment.matchesProfiles("development")) {
            Components components = new Components();
            for (String realm : new String[]{"staff", "portal"}) {
                if (environment.getProperty("htt.auth.local-enabled",Boolean.class,false)) {
                    components.addSecuritySchemes(realm,new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")
                            .description("Java login accessToken; no Keycloak or client secret"));
                    continue;
                }
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
