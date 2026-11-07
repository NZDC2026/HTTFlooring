package com.htt.management.platform.events;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;

/** Publishing business facts is independent of whether notification consumers are running. */
@Configuration(proxyBeanMethods = false)
public class DomainEventsConfiguration {
    @Bean
    @Lazy // Infrastructure-free local startup needs no publisher; real business use still requires JDBC.
    DomainEvents domainEvents(JdbcTemplate jdbc, ObjectMapper json) {
        return new DomainEvents(jdbc, json);
    }
}
