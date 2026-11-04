package au.com.htt.backend;

import java.util.Map;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class StaffAudit {
    private final JdbcClient jdbc;
    private final JsonMapper json;

    StaffAudit(JdbcClient jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    void record(StaffScope.CompanyAccess scope, String action, String entity, UUID id,
            String requestId, Map<String, ?> details) {
        jdbc.sql("""
                INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
                VALUES (:company,:actor,:action,:entity,:id,:request,CAST(:details AS jsonb))
                """).param("company", scope.companyId()).param("actor", scope.actorId())
                .param("action", action).param("entity", entity).param("id", id)
                .param("request", requestId).param("details", json.writeValueAsString(details)).update();
        jdbc.sql("""
                INSERT INTO platform.outbox_events(company_id,event_type,payload,created_by)
                VALUES (:company,:action,jsonb_build_object('entityId',CAST(:id AS text),
                    'entityType',CAST(:entity AS text)),:actor)
                """).param("company", scope.companyId()).param("actor", scope.actorId())
                .param("action", action).param("id", id).param("entity", entity).update();
    }
}
