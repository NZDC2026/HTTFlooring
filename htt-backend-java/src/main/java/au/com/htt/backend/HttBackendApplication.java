package au.com.htt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class HttBackendApplication {
    public static void main(String[] args) {
        if ("migrate".equals(System.getenv("HTT_PROCESS_MODE"))) {
            try { MigrationMain.main(args); } catch (Exception e) { throw new IllegalStateException("Migration failed", e); }
            return;
        }
        if ("worker".equals(System.getenv("HTT_PROCESS_MODE"))) {
            try { WorkerMain.main(args); } catch (Exception e) { throw new IllegalStateException("Worker failed", e); }
            return;
        }
        SpringApplication.run(HttBackendApplication.class, args);
    }
}
