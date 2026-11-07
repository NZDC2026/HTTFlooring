package com.htt.management.notification;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import static com.htt.management.notification.NotificationModels.*;

/** Local connections only. Every instance receives broadcast wake-ups and also polls on heartbeat. */
public class SseHub {
    private final NotificationStore store;
    private final NotificationAccess access;
    private final NotificationSettings settings;
    private final Map<UUID,Client> clients=new ConcurrentHashMap<>();
    private final Map<String,Integer> perUser=new ConcurrentHashMap<>();
    private final ThreadPoolExecutor writers=new ThreadPoolExecutor(4,4,0,TimeUnit.SECONDS,new ArrayBlockingQueue<>(256),
            runnable -> { Thread thread=new Thread(runnable,"notification-sse-write"); thread.setDaemon(true); return thread; });
    private final java.util.concurrent.ScheduledExecutorService deadlines=Executors.newSingleThreadScheduledExecutor(
            runnable -> { Thread thread=new Thread(runnable,"notification-sse-deadline"); thread.setDaemon(true); return thread; });

    public SseHub(NotificationStore store,NotificationAccess access,NotificationSettings settings) {
        this.store=store; this.access=access; this.settings=settings;
    }
    public synchronized SseEmitter open(Session session,long after) {
        if (!access.current(session)) throw new org.springframework.security.access.AccessDeniedException("Access is denied.");
        store.history(session,after,1); // Validate cursor before committing streaming response headers.
        String key=session.companyId()+":"+session.userId();
        if (clients.size()>=settings.sseMaxConnections() || perUser.getOrDefault(key,0)>=settings.sseMaxPerUser())
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"SSE connection limit reached.");
        Client client=new Client(session,after,key);
        clients.put(client.id,client); perUser.merge(key,1,Integer::sum);
        client.emitter.onCompletion(() -> remove(client));
        client.emitter.onTimeout(() -> close(client));
        client.emitter.onError(error -> close(client));
        return client.emitter;
    }
    public void wakeup(Wakeup signal) {
        clients.values().stream().filter(client -> client.session.companyId().equals(signal.companyId())
                && client.session.userId().equals(signal.userId())).forEach(client -> client.dirty=true);
    }
    @Scheduled(fixedDelay=1000)
    public void tick() {
        long now=System.currentTimeMillis();
        for (Client client : clients.values()) {
            if ((client.dirty || now>=client.heartbeatAt) && client.running.compareAndSet(false,true)) {
                client.dirty=false;
                try { writers.execute(() -> drain(client)); }
                catch (java.util.concurrent.RejectedExecutionException exception) { close(client); }
            }
        }
    }
    private void drain(Client client) {
        var deadline=deadlines.schedule(() -> close(client),settings.writeTimeoutMs(),TimeUnit.MILLISECONDS);
        try {
            if (!clients.containsKey(client.id) || !access.current(client.session)) { close(client); return; }
            History history=store.history(client.session,client.cursor,100);
            // JDBC transactions have completed before the first socket write.
            for (Notice notice : history.items()) {
                client.emitter.send(SseEmitter.event().name("notification").id(Long.toString(notice.cursor())).data(notice));
                client.cursor=notice.cursor();
            }
            if (history.nextCursor()>client.cursor) {
                client.emitter.send(SseEmitter.event().name("cursor").id(Long.toString(history.nextCursor()))
                        .data(Map.of("cursor",history.nextCursor())));
                client.cursor=history.nextCursor();
            }
            client.emitter.send(SseEmitter.event().comment("heartbeat "+Instant.now()).reconnectTime(3000));
            client.heartbeatAt=System.currentTimeMillis()+settings.heartbeatMs();
            if (history.hasMore()) client.dirty=true;
        } catch (IOException | RuntimeException exception) { close(client); }
        finally { deadline.cancel(false); client.running.set(false); }
    }
    private synchronized void remove(Client client) {
        if (clients.remove(client.id,client)) perUser.computeIfPresent(client.key,(key,count)->count==1 ? null : count-1);
    }
    private void close(Client client) { remove(client); client.emitter.complete(); }
    public int connectionCount() { return clients.size(); }
    @PreDestroy
    public void shutdown() {
        clients.values().forEach(this::close); writers.shutdownNow(); deadlines.shutdownNow();
    }
    private static final class Client {
        final UUID id=UUID.randomUUID();
        final Session session;
        final String key;
        final SseEmitter emitter=new SseEmitter(TimeUnit.MINUTES.toMillis(15));
        final AtomicBoolean running=new AtomicBoolean();
        volatile boolean dirty=true;
        volatile long heartbeatAt;
        long cursor;
        Client(Session session,long cursor,String key) { this.session=session; this.cursor=cursor; this.key=key; }
    }
}
