package com.htt.management.notification;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;

public class DeliveryWorker {
    private final NotificationStore store;
    private final NotificationSettings settings;
    private final Map<String,NotificationChannel> channels;
    public DeliveryWorker(NotificationStore store,NotificationSettings settings,List<NotificationChannel> channels) {
        this.store=store; this.settings=settings;
        this.channels=channels.stream().collect(Collectors.toUnmodifiableMap(NotificationChannel::name,Function.identity()));
    }
    @Scheduled(fixedDelayString="${htt.notification.poll-ms:1000}")
    public void tick() {
        for (var delivery : store.claimDeliveries(10,settings.leaseSeconds())) {
            try {
                if (!store.stillEligible(delivery) || (delivery.channel().equals("FCM") && delivery.deviceToken()==null)) {
                    store.finish(delivery,"SKIPPED",Instant.now(),"RECIPIENT_OR_DEVICE_DISABLED"); continue;
                }
                // No database transaction remains open while calling a provider or RabbitMQ.
                NotificationChannel channel=channels.get(delivery.channel());
                if (channel==null) throw new IllegalStateException("Channel not configured.");
                var result=channel.send(delivery);
                store.finish(delivery,result.name(),Instant.now(),null);
            } catch (NotificationChannel.PermanentFailure exception) {
                store.permanentFailure(delivery,exception.reason());
            } catch (RuntimeException exception) {
                store.finish(delivery,delivery.attempt()>=settings.maxAttempts() ? "DEAD" : "PENDING",
                        settings.nextAttempt(delivery.attempt()),exception.getClass().getSimpleName());
            }
        }
    }
}
