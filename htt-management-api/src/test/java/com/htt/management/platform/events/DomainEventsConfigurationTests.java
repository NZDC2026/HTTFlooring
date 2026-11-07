package com.htt.management.platform.events;

import com.htt.management.notification.NotificationConfiguration;
import com.htt.management.notification.NotificationStore;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class DomainEventsConfigurationTests {
    @Test
    void businessPublisherExistsWithNotificationDisabledAndDoesNotConnectToInfrastructure() {
        var source = mock(javax.sql.DataSource.class);
        JdbcTemplate jdbc = new JdbcTemplate(source);
        new ApplicationContextRunner()
                .withUserConfiguration(DomainEventsConfiguration.class, NotificationConfiguration.class)
                .withBean(JdbcTemplate.class, () -> jdbc)
                .withBean(ObjectMapper.class, JsonMapper::new)
                .withPropertyValues("htt.notification.enabled=false")
                .run(context -> {
                    assertThat(context).hasSingleBean(DomainEvents.class).doesNotHaveBean(NotificationStore.class);
                    verifyNoInteractions(source);
                });
    }

    @Test
    void infrastructureFreeStartupDoesNotInstantiateAnUnusedPublisher() {
        new ApplicationContextRunner().withUserConfiguration(DomainEventsConfiguration.class)
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBeanFactory().containsSingleton("domainEvents")).isFalse();
                });
    }
}
