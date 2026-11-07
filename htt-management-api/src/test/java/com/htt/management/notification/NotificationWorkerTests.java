package com.htt.management.notification;

import com.htt.management.platform.events.*;
import com.rabbitmq.client.Channel;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NotificationWorkerTests {
    static NotificationSettings settings(int attempts) {
        return new NotificationSettings(true,true,attempts,60,1000,1000,10,2,15000,5000,
                Map.of("test.activity",new NotificationSettings.Template("Activity","An activity occurred.")));
    }
    static DomainEvent event(UUID company,UUID user,UUID customer,UUID branch) {
        return new DomainEvent(UUID.randomUUID(),1,"test.activity",company,UUID.randomUUID(),customer,branch,List.of(user),Map.of(),Instant.now());
    }
    @Test void publishRequiresBusinessTransaction() {
        var jdbc=mock(JdbcTemplate.class);
        assertThatThrownBy(() -> new DomainEvents(jdbc,new JsonMapper()).publish(event(UUID.randomUUID(),UUID.randomUUID(),null,null)))
                .isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(jdbc);
    }
    @Test void outboxOnlyCompletesAfterPublishAndKeepsFailureForRetry() {
        var store=mock(OutboxStore.class); var broker=mock(NotificationBroker.class);
        var entry=new OutboxStore.Claimed(UUID.randomUUID(),"{}",UUID.randomUUID(),1);
        when(store.claim(anyInt(),anyInt())).thenReturn(List.of(entry));
        new OutboxRelay(store,broker,settings(3)).tick();
        var ordered=inOrder(broker,store); ordered.verify(broker).publish("{}",entry.id().toString()); ordered.verify(store).published(entry);
        reset(broker,store);
        when(store.claim(anyInt(),anyInt())).thenReturn(List.of(entry));
        doThrow(new IllegalStateException("test failure")).when(broker).publish(anyString(),anyString());
        new OutboxRelay(store,broker,settings(3)).tick();
        verify(store,never()).published(any()); verify(store).failed(eq(entry),eq(false),any(),eq("IllegalStateException"));
    }
    @Test void consumerRetriesThenDeadLettersAndNeverAcksAnUnconfirmedTransfer() throws Exception {
        var store=mock(NotificationStore.class); var broker=mock(NotificationBroker.class); var channel=mock(Channel.class);
        var consumer=new NotificationConsumer(store,broker,settings(2),new JsonMapper());
        var properties=new MessageProperties(); properties.setDeliveryTag(7);
        Message invalid=new Message("invalid-json".getBytes(),properties);
        consumer.onMessage(invalid,channel);
        var ordered=inOrder(store,broker,channel);
        ordered.verify(store).consumerFailure(isNull(),eq(1),eq(false),anyString());
        ordered.verify(broker).retry(invalid,1); ordered.verify(channel).basicAck(7,false);
        reset(channel); properties.setHeader("htt-attempt",1);
        consumer.onMessage(invalid,channel); verify(broker).dead(invalid,2); verify(channel).basicAck(7,false);
        reset(channel); doThrow(new IllegalStateException("broker down")).when(broker).dead(any(),anyInt());
        assertThatThrownBy(() -> consumer.onMessage(invalid,channel)).isInstanceOf(IllegalStateException.class);
        verify(channel,never()).basicAck(anyLong(),anyBoolean());
    }
    @Test void duplicateConsumptionStillAcksAndDoesNotBypassCommitFailure() throws Exception {
        var json=new JsonMapper(); var store=mock(NotificationStore.class); var broker=mock(NotificationBroker.class); var channel=mock(Channel.class);
        var event=event(UUID.randomUUID(),UUID.randomUUID(),null,null);
        var properties=new MessageProperties(); properties.setDeliveryTag(9);
        Message message=new Message(json.writeValueAsBytes(event),properties);
        var consumer=new NotificationConsumer(store,broker,settings(3),json);
        when(store.consume(eq(event),anyString(),any())).thenReturn(false);
        consumer.onMessage(message,channel); verify(channel).basicAck(9,false); verifyNoInteractions(broker);
        reset(channel);
        when(store.consume(eq(event),anyString(),any())).thenThrow(new IllegalStateException("commit failed"));
        consumer.onMessage(message,channel);
        verify(broker).retry(message,1); verify(channel).basicAck(9,false);
    }
    @Test void mandatoryReturnAndNegativeConfirmAreFailures() {
        RabbitTemplate rabbit=mock(RabbitTemplate.class);
        doAnswer(call -> {
            CorrelationData correlation=call.getArgument(3);
            correlation.getFuture().complete(new CorrelationData.Confirm(false,"test nack")); return null;
        }).when(rabbit).send(anyString(),anyString(),any(Message.class),any(CorrelationData.class));
        assertThatThrownBy(() -> new NotificationBroker(rabbit,1000).publish("{}","event")).isInstanceOf(IllegalStateException.class);
        doAnswer(call -> {
            CorrelationData correlation=call.getArgument(3);
            correlation.setReturned(new org.springframework.amqp.core.ReturnedMessage(call.getArgument(2),312,"NO_ROUTE","x","r"));
            correlation.getFuture().complete(new CorrelationData.Confirm(true,null)); return null;
        }).when(rabbit).send(anyString(),anyString(),any(Message.class),any(CorrelationData.class));
        assertThatThrownBy(() -> new NotificationBroker(rabbit,1000).publish("{}","event")).isInstanceOf(IllegalStateException.class);
    }
    @Test void providerRetryIsBoundedAndFakeIsExplicitlySimulated() {
        var store=mock(NotificationStore.class); var provider=mock(NotificationChannel.class);
        when(provider.name()).thenReturn("FCM");
        var notice=new NotificationModels.Notice(UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID(),null,null,1,"Title","Body",Instant.now(),null);
        var task=new NotificationModels.Delivery(UUID.randomUUID(),UUID.randomUUID(),2,"FCM",UUID.randomUUID(),notice,"test-only-token");
        when(store.claimDeliveries(anyInt(),anyInt())).thenReturn(List.of(task)); when(store.stillEligible(task)).thenReturn(true);
        doThrow(new IllegalStateException("provider down")).when(provider).send(task);
        new DeliveryWorker(store,settings(2),List.of(provider)).tick();
        verify(store).finish(eq(task),eq("DEAD"),any(),eq("IllegalStateException"));
        assertThat(new FakePushProvider().send(task)).isEqualTo(NotificationChannel.Result.SIMULATED);
        reset(provider);
        when(provider.name()).thenReturn("FCM");
        doThrow(new NotificationChannel.PermanentFailure(NotificationChannel.PermanentReason.INVALID_DEVICE)).when(provider).send(task);
        new DeliveryWorker(store,settings(2),List.of(provider)).tick();
        verify(store).permanentFailure(task,NotificationChannel.PermanentReason.INVALID_DEVICE);
    }

    @Test void equivalentJsonEnvelopesHaveTheSameIdempotencyHash() throws Exception {
        var store=mock(NotificationStore.class); var broker=mock(NotificationBroker.class); var channel=mock(Channel.class); var json=new JsonMapper();
        var event=event(UUID.randomUUID(),UUID.randomUUID(),null,null);
        var consumer=new NotificationConsumer(store,broker,settings(3),json);
        consumer.onMessage(new Message(json.writeValueAsBytes(event),new MessageProperties()),channel);
        consumer.onMessage(new Message(json.writerWithDefaultPrettyPrinter().writeValueAsBytes(event),new MessageProperties()),channel);
        var hashes=org.mockito.ArgumentCaptor.forClass(String.class);
        verify(store,times(2)).consume(eq(event),hashes.capture(),any());
        assertThat(hashes.getAllValues().get(0)).isEqualTo(hashes.getAllValues().get(1));
    }
}
