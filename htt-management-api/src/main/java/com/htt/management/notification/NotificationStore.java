package com.htt.management.notification;

import com.htt.management.platform.events.DomainEvent;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import static com.htt.management.notification.NotificationModels.*;

/** All JDBC transactions are short; no broker/provider/HTTP calls occur inside this class. */
public class NotificationStore {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    public NotificationStore(JdbcTemplate jdbc, TransactionTemplate transactions) { this.jdbc=jdbc; this.transactions=transactions; }

    public boolean consume(DomainEvent event, String hash, NotificationSettings.Template template) {
        return worker(db -> {
            int inserted=db.update("insert into notification.inbox(event_id,company_id,payload_hash) values (?,?,?) on conflict do nothing",
                    event.id(),event.companyId(),hash);
            if (inserted==0) {
                String original=db.queryForObject("select payload_hash from notification.inbox where event_id=?",String.class,event.id());
                if (!hash.equals(original)) throw new IllegalArgumentException("Event ID reused with different payload.");
                audit(db,event.companyId(),event.id(),null,"CONSUME","DUPLICATE",0,null);
                return false;
            }
            // Stable lock order avoids deadlocks when concurrent events share several recipients.
            for (UUID user : event.recipients()) {
                if (!canReceive(db,user,event.companyId(),event.customerId(),event.branchId(),null)) {
                    audit(db,event.companyId(),event.id(),null,"RECIPIENT","DENIED",0,null); continue;
                }
                db.update("insert into notification.recipient_cursor(company_id,user_id) values (?,?) on conflict do nothing",event.companyId(),user);
                long cursor=db.queryForObject("update notification.recipient_cursor set last_cursor=last_cursor+1 where company_id=? and user_id=? returning last_cursor",
                        Long.class,event.companyId(),user);
                UUID message=UUID.randomUUID();
                db.update("""
                        insert into notification.message(id,event_id,company_id,user_id,customer_id,branch_id,cursor,event_type,title,body)
                        values (?,?,?,?,?,?,?,?,?,?)
                        """,message,event.id(),event.companyId(),user,event.customerId(),event.branchId(),cursor,event.type(),template.title(),template.body());
                delivery(db,message,"SSE",new UUID(0,0));
                List<UUID> devices=db.query("select id from notification.device where company_id=? and user_id=? and enabled order by id",
                        (row,n)->row.getObject(1,UUID.class),event.companyId(),user);
                for (UUID device : devices) delivery(db,message,"FCM",device);
                audit(db,event.companyId(),event.id(),message,"CONSUME","CREATED",0,null);
            }
            return true;
        });
    }

    public void consumerFailure(UUID eventId, int attempt, boolean dead, String error) {
        worker(db -> { audit(db,null,eventId,null,"CONSUME",dead ? "DEAD" : "RETRY",attempt,error); return null; });
    }

    public List<Delivery> claimDeliveries(int limit, int leaseSeconds) {
        return worker(db -> {
            UUID lease=UUID.randomUUID();
            return db.query("""
                    with candidates as (select id from notification.delivery
                        where (state='PENDING' and available_at<=now()) or (state='IN_FLIGHT' and lease_until<now())
                        order by available_at for update skip locked limit ?), claimed as (
                    update notification.delivery d set state='IN_FLIGHT',lease_id=?,lease_until=now()+make_interval(secs=>?),attempts=attempts+1
                    from candidates c where d.id=c.id returning d.*)
                    select m.*,d.id as delivery_id,d.attempts,d.channel,d.target_id,
                        case when device.enabled then device.token else null end as device_token
                    from claimed d join notification.message m on m.id=d.message_id
                    left join notification.device device on device.id=d.target_id
                    """,(row,n)->new Delivery(row.getObject("delivery_id",UUID.class),lease,row.getInt("attempts"),
                    row.getString("channel"),row.getObject("target_id",UUID.class),notice(row),row.getString("device_token")),limit,lease,leaseSeconds);
        });
    }

    public boolean stillEligible(Delivery delivery) {
        Notice notice=delivery.notice();
        return worker(db -> canReceive(db,notice.userId(),notice.companyId(),notice.customerId(),notice.branchId(),null)
                && (!delivery.channel().equals("FCM") || Boolean.TRUE.equals(db.queryForObject(
                    "select exists(select 1 from notification.device where id=? and company_id=? and user_id=? and enabled)",
                    Boolean.class,delivery.targetId(),notice.companyId(),notice.userId()))));
    }

    public void finish(Delivery delivery, String state, Instant next, String error) {
        worker(db -> {
            int changed=db.update("""
                    update notification.delivery set state=?,available_at=?,last_error=?,lease_id=null,lease_until=null,updated_at=now()
                    where id=? and lease_id=? and state='IN_FLIGHT'
                    """,state,Timestamp.from(next),error,delivery.id(),delivery.leaseId());
            if (changed>0) audit(db,delivery.notice().companyId(),null,delivery.notice().id(),delivery.channel(),state,delivery.attempt(),error);
            return null;
        });
    }

    public void permanentFailure(Delivery delivery,NotificationChannel.PermanentReason reason) {
        worker(db -> {
            int changed=db.update("update notification.delivery set state='DEAD',last_error=?,lease_id=null,lease_until=null,updated_at=now() where id=? and lease_id=? and state='IN_FLIGHT'",
                    reason.name(),delivery.id(),delivery.leaseId());
            if (changed>0) {
                if (reason==NotificationChannel.PermanentReason.INVALID_DEVICE && delivery.channel().equals("FCM"))
                    db.update("update notification.device set enabled=false,updated_at=now() where id=?",delivery.targetId());
                audit(db,delivery.notice().companyId(),null,delivery.notice().id(),delivery.channel(),"DEAD",delivery.attempt(),reason.name());
            }
            return null;
        });
    }

    public History history(Session session, long after, int limit) {
        if (after<0 || limit<1 || limit>200) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid notification cursor or limit.");
        return user(session,db -> {
            Long head=db.queryForObject("select coalesce((select last_cursor from notification.recipient_cursor where company_id=? and user_id=?),0)",
                    Long.class,session.companyId(),session.userId());
            if (after>head) throw new ResponseStatusException(HttpStatus.CONFLICT,"Cursor exceeds this recipient's history.");
            List<Notice> found=db.query("""
                    select * from notification.message where company_id=? and user_id=? and cursor>? and cursor<=?
                    order by cursor limit ?
                    """,(row,n)->notice(row),session.companyId(),session.userId(),after,head,limit+1);
            boolean more=found.size()>limit;
            List<Notice> page=more ? List.copyOf(found.subList(0,limit)) : List.copyOf(found);
            long next=more ? page.getLast().cursor() : head;
            return new History(page,next,head,more);
        });
    }

    public boolean markRead(Session session, UUID id) {
        return user(session,db -> db.update("update notification.message set read_at=coalesce(read_at,now()) where id=? and company_id=? and user_id=?",
                id,session.companyId(),session.userId())>0);
    }

    public UUID registerDevice(Session session, String platform, String token) {
        if (!("ANDROID".equals(platform)||"IOS".equals(platform)) || token==null || token.isBlank() || token.length()>4096)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid push device.");
        return user(session,db -> db.queryForObject("""
                insert into notification.device(id,company_id,user_id,platform,token,token_hash) values (?,?,?,?,?,?)
                on conflict(company_id,user_id,token_hash) do update set enabled=true,platform=excluded.platform,updated_at=now() returning id
                """,UUID.class,UUID.randomUUID(),session.companyId(),session.userId(),platform,token,hash(token)));
    }

    public void disableDevice(Session session, UUID id) {
        user(session,db -> db.update("update notification.device set enabled=false,updated_at=now() where id=? and company_id=? and user_id=?",
                id,session.companyId(),session.userId()));
    }

    private <T> T worker(Function<JdbcTemplate,T> work) {
        return transactions.execute(status -> { jdbc.execute("select set_config('htt.notification_worker','true',true)"); return work.apply(jdbc); });
    }
    private <T> T user(Session session, Function<JdbcTemplate,T> work) {
        return transactions.execute(status -> {
            jdbc.queryForObject("select set_config('htt.notification_worker','false',true)",String.class);
            jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,session.companyId().toString());
            jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,session.userId().toString());
            jdbc.queryForObject("select set_config('htt.portal_grant_id',?,true)",String.class,session.grantId()==null ? "" : session.grantId().toString());
            return work.apply(jdbc);
        });
    }
    private static boolean canReceive(JdbcTemplate db, UUID user, UUID company, UUID customer, UUID branch, UUID grant) {
        return Boolean.TRUE.equals(db.queryForObject("select notification.can_receive(?,?,?,?,?)",Boolean.class,user,company,customer,branch,grant));
    }
    private static void delivery(JdbcTemplate db, UUID message, String channel, UUID target) {
        db.update("insert into notification.delivery(id,message_id,channel,target_id) values (?,?,?,?)",UUID.randomUUID(),message,channel,target);
    }
    private static void audit(JdbcTemplate db, UUID company, UUID event, UUID message, String action, String outcome, int attempt, String error) {
        db.update("insert into notification.audit(company_id,event_id,message_id,action,outcome,attempt,error_code) values (?,?,?,?,?,?,?)",
                company,event,message,action,outcome,attempt,error);
    }
    private static Notice notice(ResultSet row) throws SQLException {
        Timestamp read=row.getTimestamp("read_at");
        return new Notice(row.getObject("id",UUID.class),row.getObject("company_id",UUID.class),row.getObject("user_id",UUID.class),
                row.getObject("customer_id",UUID.class),row.getObject("branch_id",UUID.class),row.getLong("cursor"),row.getString("title"),
                row.getString("body"),row.getTimestamp("created_at").toInstant(),read==null ? null : read.toInstant());
    }
    public static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
}
