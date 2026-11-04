package au.com.htt.backend;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class IdempotentWrite {
    private final JdbcClient jdbc;

    IdempotentWrite(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // The caller holds the company transaction for the lock, domain write, and replay record.
    StoredResponse execute(StaffScope.CompanyAccess scope, String route, String key, String canonical,
            Supplier<StoredResponse> write) {
        if (key == null || key.isBlank() || key.length() > 128) {
            throw new StaffScope.Failure(400, "idempotency_key_required",
                    "Supply an Idempotency-Key of 1..128 characters.");
        }
        String hash = HexFormat.of().withUpperCase().formatHex(sha256(canonical.getBytes(StandardCharsets.UTF_8)));
        String lock = scope.companyId() + ":" + scope.actorId() + ":" + route + ":" + key;
        jdbc.sql("SELECT pg_advisory_xact_lock(hashtextextended(:lock,0))")
                .param("lock", lock).query((row, index) -> true).single();
        var prior = scoped("""
                SELECT request_hash,status_code,response_json::text
                FROM platform.idempotency_requests
                WHERE company_id=:company AND actor_id=:actor AND route=:route AND key=:key
                """, scope, route, key).query((row, index) ->
                new Replay(row.getString(1), new StoredResponse(row.getInt(2), row.getString(3)))).optional();
        if (prior.isPresent()) {
            if (!hash.equals(prior.get().hash())) {
                throw new StaffScope.Failure(409, "idempotency_conflict", "This key was already used with different input.");
            }
            return prior.get().response();
        }
        var response = write.get();
        scoped("""
                INSERT INTO platform.idempotency_requests
                    (company_id,actor_id,route,key,request_hash,response_json,status_code,created_by)
                VALUES (:company,:actor,:route,:key,:hash,CAST(:body AS jsonb),:status,:actor)
                """, scope, route, key).param("hash", hash).param("body", response.body())
                .param("status", response.status()).update();
        return response;
    }

    private JdbcClient.StatementSpec scoped(String sql, StaffScope.CompanyAccess scope, String route, String key) {
        return jdbc.sql(sql).param("company", scope.companyId()).param("actor", scope.actorId())
                .param("route", route).param("key", key);
    }

    static byte[] sha256(byte[] bytes) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(bytes);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    record StoredResponse(int status, String body) {}
    private record Replay(String hash, StoredResponse response) {}
}
