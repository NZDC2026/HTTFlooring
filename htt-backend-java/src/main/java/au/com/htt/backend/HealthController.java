package au.com.htt.backend;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zaxxer.hikari.HikariDataSource;

@RestController
class HealthController {
    private final JdbcTemplate database;
    private final String readinessQuery;

    HealthController(ObjectProvider<HikariDataSource> sources) throws IOException {
        var source = sources.getIfAvailable();
        database = source == null ? null : new JdbcTemplate(source);
        if (database != null) {
            database.setQueryTimeout(3);
        }
        readinessQuery = new ClassPathResource("readiness.sql").getContentAsString(StandardCharsets.UTF_8);
    }

    @GetMapping("/health/live")
    Map<String, String> live() {
        return Map.of("status", "live");
    }

    @GetMapping("/health/ready")
    ResponseEntity<?> ready() {
        if (database != null) {
            try {
                if (Boolean.TRUE.equals(database.queryForObject(readinessQuery, Boolean.class))) {
                    return ResponseEntity.ok(Map.of("status", "ready"));
                }
            } catch (DataAccessException unavailable) {
                return ResponseEntity.status(503).build();
            }
        }
        return ResponseEntity.status(503).build();
    }
}
