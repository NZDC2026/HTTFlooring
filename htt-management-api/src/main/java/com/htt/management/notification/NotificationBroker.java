package com.htt.management.notification;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

/** A confirm without a successful route is insufficient for durable work messages. */
public class NotificationBroker {
    public static final String EXCHANGE="htt.notification.events.v1";
    public static final String WORK="htt.notification.work.v1";
    public static final String DEAD="htt.notification.dead.v1";
    public static final String WAKEUP="htt.notification.wakeup.v1";
    private final RabbitTemplate rabbit;
    private final long timeoutMs;
    public NotificationBroker(RabbitTemplate rabbit,long timeoutMs) { this.rabbit=rabbit; this.timeoutMs=timeoutMs; }

    public void publish(String payload, String id) {
        MessageProperties properties=new MessageProperties();
        properties.setMessageId(id); properties.setContentType("application/json");
        properties.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
        send(EXCHANGE,WORK,new Message(payload.getBytes(StandardCharsets.UTF_8),properties),true);
    }
    public void retry(Message original, int attempt) { republish(original,"htt.notification.retry."+attempt+".v1",attempt); }
    public void dead(Message original, int attempt) { republish(original,DEAD,attempt); }
    private void republish(Message original,String route,int attempt) {
        MessageProperties properties=new MessageProperties();
        properties.setMessageId(original.getMessageProperties().getMessageId());
        properties.setContentType("application/json"); properties.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
        properties.setHeader("htt-attempt",attempt);
        send(EXCHANGE,route,new Message(original.getBody(),properties),true);
    }
    public void wakeup(byte[] payload) {
        // Ephemeral broadcast is only a hint. Zero connected API nodes is valid; history remains durable.
        send(WAKEUP,"",new Message(payload,new MessageProperties()),false);
    }
    private void send(String exchange,String route,Message message,boolean requireRoute) {
        CorrelationData correlation=new CorrelationData();
        try {
            rabbit.send(exchange,route,message,correlation);
            var confirm=correlation.getFuture().get(timeoutMs,TimeUnit.MILLISECONDS);
            if (!confirm.ack() || (requireRoute && correlation.getReturned()!=null)) {
                throw new IllegalStateException("Broker did not confirm a routed message.");
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt(); throw new IllegalStateException("Broker confirmation interrupted.",exception);
        } catch (java.util.concurrent.ExecutionException | java.util.concurrent.TimeoutException exception) {
            throw new IllegalStateException("Broker confirmation unavailable.",exception);
        }
    }
}
