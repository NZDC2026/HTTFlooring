package com.htt.management.notification;

import com.htt.management.identity.AccessAudit;
import com.htt.management.identity.AccessRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name="htt.notification.enabled",havingValue="true")
@EnableConfigurationProperties(NotificationSettings.class)
@EnableScheduling
public class NotificationConfiguration {
    static TransactionTemplate transactions(PlatformTransactionManager manager) {
        TransactionTemplate template=new TransactionTemplate(manager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.setTimeout(10);
        return template;
    }
    @Bean OutboxStore outboxStore(JdbcTemplate jdbc,PlatformTransactionManager manager) { return new OutboxStore(jdbc,transactions(manager)); }
    @Bean NotificationStore notificationStore(JdbcTemplate jdbc,PlatformTransactionManager manager) { return new NotificationStore(jdbc,transactions(manager)); }
    @Bean ThreadPoolTaskScheduler taskScheduler() {
        var scheduler=new ThreadPoolTaskScheduler(); scheduler.setPoolSize(3); scheduler.setThreadNamePrefix("notification-schedule-"); return scheduler;
    }
    @Bean RabbitTemplate notificationRabbitTemplate(ConnectionFactory factory) {
        if (!(factory instanceof CachingConnectionFactory caching)) throw new IllegalStateException("Notification requires the RabbitMQ 0.9.1 connection factory.");
        caching.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED); caching.setPublisherReturns(true);
        RabbitTemplate template=new RabbitTemplate(factory); template.setMandatory(true); return template;
    }
    @Bean RabbitAdmin notificationRabbitAdmin(ConnectionFactory factory) { return new RabbitAdmin(factory); }
    @Bean Declarables notificationTopology(NotificationSettings settings) {
        List<Declarable> declarations=new ArrayList<>();
        var exchange=new DirectExchange(NotificationBroker.EXCHANGE,true,false);
        declarations.add(exchange); declarations.add(new FanoutExchange(NotificationBroker.WAKEUP,true,false));
        for (String name : List.of(NotificationBroker.WORK,NotificationBroker.DEAD)) {
            // RabbitMQ 4 quorum queues otherwise default to a finite redelivery limit.
            // A store/broker outage must not silently discard an unacknowledged event.
            declarations.add(QueueBuilder.durable(name).quorum().withArgument("x-delivery-limit",-1).build());
            declarations.add(new Binding(name,Binding.DestinationType.QUEUE,NotificationBroker.EXCHANGE,name,null));
        }
        for (int attempt=1;attempt<settings.maxAttempts();attempt++) {
            String name="htt.notification.retry."+attempt+".v1";
            declarations.add(QueueBuilder.durable(name).quorum().ttl((int)Math.min(60000,1000L<<attempt))
                    .deadLetterExchange(NotificationBroker.EXCHANGE).deadLetterRoutingKey(NotificationBroker.WORK)
                    .withArgument("x-dead-letter-strategy","at-least-once").withArgument("x-overflow","reject-publish").build());
            declarations.add(new Binding(name,Binding.DestinationType.QUEUE,NotificationBroker.EXCHANGE,name,null));
        }
        return new Declarables(declarations);
    }
    @Bean NotificationBroker notificationBroker(RabbitTemplate rabbit,NotificationSettings settings) { return new NotificationBroker(rabbit,settings.confirmTimeoutMs()); }
    @Bean NotificationChannel fakePushProvider() { return new FakePushProvider(); }
    @Bean NotificationChannel sseChannel(NotificationBroker broker,ObjectMapper json) { return new SseChannel(broker,json); }

    @Bean
    @ConditionalOnProperty(name="htt.notification.workers-enabled",havingValue="true")
    OutboxRelay outboxRelay(OutboxStore store,NotificationBroker broker,NotificationSettings settings) { return new OutboxRelay(store,broker,settings); }
    @Bean
    @ConditionalOnProperty(name="htt.notification.workers-enabled",havingValue="true")
    DeliveryWorker deliveryWorker(NotificationStore store,NotificationSettings settings,List<NotificationChannel> channels) { return new DeliveryWorker(store,settings,channels); }
    @Bean
    @ConditionalOnProperty(name="htt.notification.workers-enabled",havingValue="true")
    SimpleMessageListenerContainer notificationConsumer(ConnectionFactory factory,NotificationStore store,NotificationBroker broker,NotificationSettings settings,ObjectMapper json) {
        var container=new SimpleMessageListenerContainer(factory); container.setQueueNames(NotificationBroker.WORK);
        container.setAcknowledgeMode(AcknowledgeMode.MANUAL); container.setPrefetchCount(10); container.setConcurrentConsumers(1);
        container.setDefaultRequeueRejected(true); container.setRecoveryInterval(5000L);
        container.setMessageListener(new NotificationConsumer(store,broker,settings,json)); return container;
    }
    @Configuration(proxyBeanMethods=false)
    @ConditionalOnProperty(name={"htt.notification.enabled","htt.auth.enabled"},havingValue="true")
    static class ApiConfiguration {
        @Bean NotificationAccess notificationAccess(AccessRepository repository,AccessAudit audit) { return new NotificationAccess(repository,audit); }
        @Bean SseHub sseHub(NotificationStore store,NotificationAccess access,NotificationSettings settings) { return new SseHub(store,access,settings); }
        @Bean Queue notificationInstanceQueue() { return new Queue("htt.notification.instance."+UUID.randomUUID(),false,true,true); }
        @Bean Binding notificationInstanceBinding(Queue notificationInstanceQueue) {
            return new Binding(notificationInstanceQueue.getName(),Binding.DestinationType.QUEUE,NotificationBroker.WAKEUP,"",null);
        }
        @Bean SimpleMessageListenerContainer notificationWakeups(ConnectionFactory factory,Queue notificationInstanceQueue,SseHub hub,ObjectMapper json) {
            var container=new SimpleMessageListenerContainer(factory); container.setQueueNames(notificationInstanceQueue.getName()); container.setPrefetchCount(50);
            container.setMessageListener((MessageListener) message -> {
                try { hub.wakeup(json.readValue(message.getBody(),NotificationModels.Wakeup.class)); }
                catch (RuntimeException exception) { /* Wake-ups are hints; heartbeat queries durable history. */ }
            }); return container;
        }
    }
}
