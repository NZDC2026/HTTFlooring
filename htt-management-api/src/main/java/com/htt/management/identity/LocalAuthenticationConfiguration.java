package com.htt.management.identity;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name={"htt.auth.enabled","htt.auth.local-enabled"},havingValue="true")
class LocalAuthenticationConfiguration {
    @Bean LocalAuthentication localAuthentication(JdbcTemplate jdbc,ObjectMapper json) { return new LocalAuthentication(jdbc,json); }
}
