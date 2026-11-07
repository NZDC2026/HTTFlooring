package com.htt.management.notification;

import com.htt.management.platform.events.DomainEvent;
import com.rabbitmq.client.Channel;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.listener.api.ChannelAwareMessageListener;
import tools.jackson.databind.ObjectMapper;

public class NotificationConsumer implements ChannelAwareMessageListener {
    private static final tools.jackson.databind.ObjectMapper CANONICAL_JSON=tools.jackson.databind.json.JsonMapper.builder()
            .enable(tools.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS).build();
    private final NotificationStore store;
    private final NotificationBroker broker;
    private final NotificationSettings settings;
    private final ObjectMapper json;
    public NotificationConsumer(NotificationStore store,NotificationBroker broker,NotificationSettings settings,ObjectMapper json) {
        this.store=store; this.broker=broker; this.settings=settings; this.json=json;
    }
    @Override
    public void onMessage(Message message, Channel channel) throws Exception {
        long tag=message.getMessageProperties().getDeliveryTag();
        Object header=message.getMessageProperties().getHeader("htt-attempt");
        int attempt=header instanceof Number number ? Math.max(0,number.intValue()) : 0;
        UUID eventId=null;
        try {
            if (header!=null && !(header instanceof Number)) throw new IllegalArgumentException("Invalid retry header.");
            if (message.getBody().length>16384) throw new IllegalArgumentException("Event exceeds limit.");
            String body=new String(message.getBody(),StandardCharsets.UTF_8);
            DomainEvent event=json.readValue(body,DomainEvent.class);
            eventId=event.id();
            store.consume(event,NotificationStore.hash(CANONICAL_JSON.writeValueAsString(event)),settings.template(event.type()));
        } catch (RuntimeException exception) {
            boolean dead=attempt>=settings.maxAttempts()-1;
            // Persist the failure before broker operations. If either fails, the original stays unacknowledged.
            try {
                store.consumerFailure(eventId,attempt+1,dead,exception.getClass().getSimpleName());
                if (dead) broker.dead(message,attempt+1); else broker.retry(message,attempt+1);
            } catch (RuntimeException transferFailure) {
                // Avoid a hot requeue loop during a store/broker outage. No database transaction is held here.
                try { Thread.sleep(1000); }
                catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); throw interrupted; }
                throw transferFailure;
            }
        }
        // After database commit or confirmed transfer to a retry/dead queue. Never ACK in a finally block.
        channel.basicAck(tag,false);
    }
}
