package com.htt.management.notification;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("htt.notification")
public record NotificationSettings(boolean enabled, boolean workersEnabled, int maxAttempts, int leaseSeconds,
        long confirmTimeoutMs, long pollMs, int sseMaxConnections, int sseMaxPerUser,
        long heartbeatMs, long writeTimeoutMs, Map<String, Template> templates) {
    public record Template(String title, String body) {
        public Template {
            if (title == null || title.isBlank() || title.length()>200 || body==null || body.length()>1000)
                throw new IllegalArgumentException("Invalid notification template.");
        }
    }
    public NotificationSettings {
        templates = templates == null ? Map.of() : Map.copyOf(templates);
        if (enabled && (maxAttempts<1 || maxAttempts>10 || confirmTimeoutMs<100 || leaseSeconds*1000L<confirmTimeoutMs+10000
                || pollMs<100 || heartbeatMs<1000 || writeTimeoutMs<100 || sseMaxConnections<1 || sseMaxPerUser<1)) {
            throw new IllegalArgumentException("Invalid notification resource limits.");
        }
    }
    public Template template(String eventType) {
        Template template = templates.get(eventType);
        if (template == null) throw new IllegalArgumentException("No reviewed template for event type.");
        return template;
    }
    public Instant nextAttempt(int attempt) {
        return Instant.now().plusMillis(Math.min(60000L,1000L << Math.min(attempt,6)) + ThreadLocalRandom.current().nextLong(250));
    }
}
