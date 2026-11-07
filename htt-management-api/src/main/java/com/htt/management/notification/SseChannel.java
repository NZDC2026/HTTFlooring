package com.htt.management.notification;

import tools.jackson.databind.ObjectMapper;

/** Publish an ephemeral wake-up to every API instance; durable content stays in PostgreSQL. */
public class SseChannel implements NotificationChannel {
    private final NotificationBroker broker;
    private final ObjectMapper json;
    public SseChannel(NotificationBroker broker,ObjectMapper json) { this.broker=broker; this.json=json; }
    @Override public String name() { return "SSE"; }
    @Override public Result send(NotificationModels.Delivery delivery) {
        broker.wakeup(json.writeValueAsBytes(new NotificationModels.Wakeup(delivery.notice().companyId(),delivery.notice().userId())));
        return Result.SENT;
    }
}
