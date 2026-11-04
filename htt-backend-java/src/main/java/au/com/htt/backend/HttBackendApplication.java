package au.com.htt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class HttBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HttBackendApplication.class, args);
    }
}
