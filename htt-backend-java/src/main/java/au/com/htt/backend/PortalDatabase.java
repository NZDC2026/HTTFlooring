package au.com.htt.backend;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@ConditionalOnProperty("htt.portal.database.url")
class PortalDatabase implements AutoCloseable {
    private final HikariDataSource source;
    private final JdbcClient jdbc;
    private final TransactionTemplate transaction;

    PortalDatabase(@Value("${htt.portal.database.url}") String url,
            @Value("${htt.portal.database.password:}") String password) {
        if (!url.startsWith("jdbc:postgresql:") || url.contains("?")) {
            throw new IllegalArgumentException("Use a PostgreSQL JDBC URL without query parameters");
        }
        source = new HikariDataSource();
        source.setJdbcUrl(url);
        source.setUsername("htt_portal");
        source.setPassword(password);
        source.setConnectionTimeout(5000);
        var manager = new JdbcTransactionManager(source);
        manager.setEnforceReadOnly(true);
        transaction = new TransactionTemplate(manager);
        transaction.setReadOnly(true);
        jdbc = JdbcClient.create(source);
    }

    String read(String sql, java.util.Map<String, ?> parameters) {
        return transaction.execute(status -> {
            jdbc.sql("SET LOCAL TimeZone = 'UTC'").update();
            jdbc.sql("SET LOCAL statement_timeout = '10s'").update();
            jdbc.sql("SET LOCAL lock_timeout = '3s'").update();
            return jdbc.sql(sql).params(parameters).query(String.class).single();
        });
    }

    @Override
    public void close() {
        source.close();
    }
}
