package com.htt.management.platform.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class DatabaseConfiguration {

    /** API startup validates only. Apply reviewed migrations explicitly with the migration account. */
    @Bean
    FlywayMigrationStrategy validateDatabaseMigrations() {
        return Flyway::validate;
    }
}
