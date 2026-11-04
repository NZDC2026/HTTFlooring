package au.com.htt.backend;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty("htt.staff.database.url")
class StaffDatabase {
    @Bean(destroyMethod = "close")
    HikariDataSource staffDataSource(
            @Value("${htt.staff.database.url}") String url,
            @Value("${htt.staff.database.username:htt_app}") String username,
            @Value("${htt.staff.database.password:}") String password) {
        if (!url.startsWith("jdbc:postgresql:") || url.contains("?") || !"htt_app".equals(username)) {
            throw new IllegalArgumentException("Use a PostgreSQL JDBC URL without query parameters and the htt_app login");
        }
        var source = new HikariDataSource();
        source.setJdbcUrl(url);
        source.setUsername(username);
        source.setPassword(password);
        source.setConnectionTimeout(5000);
        source.addDataSourceProperty("options", "-c statement_timeout=10000");
        return source;
    }

    @Bean
    TransactionTemplate staffTransaction(HikariDataSource staffDataSource) {
        return new TransactionTemplate(new JdbcTransactionManager(staffDataSource));
    }

    @Bean
    JdbcClient staffJdbcClient(HikariDataSource staffDataSource) {
        return JdbcClient.create(staffDataSource);
    }
}
