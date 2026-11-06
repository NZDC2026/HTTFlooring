package com.htt.management.platform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class OpenApiConfiguration {

    @Bean
    OpenAPI openAPI() {
        return new OpenAPI().info(new Info()
                .title("HTT Management API")
                .version("0.0.1-SNAPSHOT")
                .description("Stage 1 infrastructure baseline; business APIs are not implemented."));
    }
}
