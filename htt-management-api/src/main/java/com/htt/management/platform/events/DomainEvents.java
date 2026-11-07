package com.htt.management.platform.events;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.ObjectMapper;

/** Business use cases call this within their existing transaction and verified actor/company context. */
public class DomainEvents {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    public DomainEvents(JdbcTemplate jdbc, ObjectMapper json) { this.jdbc = jdbc; this.json = json; }

    public void publish(DomainEvent event) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("Publish domain events inside the business transaction.");
        }
        String payload = json.writeValueAsString(event);
        if (payload.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 16384) {
            throw new IllegalArgumentException("Event exceeds 16 KiB.");
        }
        jdbc.update("insert into platform.domain_outbox(id,company_id,event_type,payload) values (?,?,?,?::jsonb)",
                event.id(), event.companyId(), event.type(), payload);
    }
}
