package com.htt.management.notification;

import org.springframework.scheduling.annotation.Scheduled;

public class OutboxRelay {
    private final OutboxStore store;
    private final NotificationBroker broker;
    private final NotificationSettings settings;
    public OutboxRelay(OutboxStore store,NotificationBroker broker,NotificationSettings settings) {
        this.store=store; this.broker=broker; this.settings=settings;
    }
    @Scheduled(fixedDelayString="${htt.notification.poll-ms:1000}")
    public void tick() {
        for (var entry : store.claim(10,settings.leaseSeconds())) {
            try { broker.publish(entry.payload(),entry.id().toString()); store.published(entry); }
            catch (RuntimeException exception) {
                store.failed(entry,entry.attempt()>=settings.maxAttempts(),settings.nextAttempt(entry.attempt()),exception.getClass().getSimpleName());
            }
        }
    }
}
