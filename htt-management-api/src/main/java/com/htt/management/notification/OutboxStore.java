package com.htt.management.notification;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

/** Notification relay leases and delivery audit; business publishers only use DomainEvents. */
public class OutboxStore {
    public record Claimed(UUID id, String payload, UUID leaseId, int attempt) {}
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    public OutboxStore(JdbcTemplate jdbc, TransactionTemplate transactions) { this.jdbc = jdbc; this.transactions = transactions; }

    public List<Claimed> claim(int limit, int leaseSeconds) {
        return transactions.execute(status -> {
            worker();
            UUID lease = UUID.randomUUID();
            return jdbc.query("""
                    with candidates as (select id from platform.domain_outbox
                        where (state='PENDING' and available_at<=now()) or (state='IN_FLIGHT' and lease_until<now())
                        order by created_at for update skip locked limit ?)
                    update platform.domain_outbox o set state='IN_FLIGHT',lease_id=?,lease_until=now()+make_interval(secs=>?),attempts=attempts+1
                    from candidates c where o.id=c.id returning o.id,o.payload::text,o.attempts
                    """, (row,n) -> new Claimed(row.getObject(1,UUID.class),row.getString(2),lease,row.getInt(3)), limit,lease,leaseSeconds);
        });
    }

    public void published(Claimed entry) { finish(entry, true, false, Instant.now(), null); }
    public void failed(Claimed entry, boolean dead, Instant next, String error) { finish(entry,false,dead,next,error); }
    private void finish(Claimed entry, boolean published, boolean dead, Instant next, String error) {
        transactions.executeWithoutResult(status -> {
            worker();
            int changed = jdbc.update("""
                    update platform.domain_outbox set state=?,available_at=?,last_error=?,lease_id=null,lease_until=null,
                        published_at=case when ? then now() else null end
                    where id=? and lease_id=? and state='IN_FLIGHT'
                    """, published ? "PUBLISHED" : dead ? "DEAD" : "PENDING",java.sql.Timestamp.from(next),error,published,entry.id(),entry.leaseId());
            if (changed > 0) jdbc.update("insert into notification.audit(event_id,action,outcome,attempt,error_code) values (?,'OUTBOX',?,?,?)",
                    entry.id(),published ? "PUBLISHED" : dead ? "DEAD" : "RETRY",entry.attempt(),error);
        });
    }
    private void worker() { jdbc.execute("select set_config('htt.notification_worker','true',true)"); }
}
