package com.htt.management.notification;

import com.htt.management.platform.events.*;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.util.Date;
import com.htt.management.HttManagementApiApplication;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.rabbitmq.RabbitMQContainer;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Shared HTT development PostgreSQL and a disposable local RabbitMQ; fixture-only cleanup. */
class NotificationPipelineIT {
    static String databaseUrl,appUser,appPassword;
    static java.sql.Connection testGuard;
    static RabbitMQContainer rabbit;
    static CachingConnectionFactory connection;
    static RabbitTemplate template;
    static RabbitAdmin admin;
    static JdbcTemplate owner,jdbc;
    static NotificationStore store;
    static OutboxStore outbox;
    static DomainEvents events;
    static NotificationBroker broker;
    static TransactionTemplate transactions;
    static final JsonMapper JSON=new JsonMapper();
    static final UUID COMPANY=UUID.randomUUID(), USER=UUID.randomUUID();
    static final String STAFF_ISSUER="https://staff.example.invalid", PORTAL_ISSUER="https://portal.example.invalid";
    static final KeyPair KEY=keyPair();
    static final NotificationSettings SETTINGS=new NotificationSettings(true,true,3,60,3000,1000,10,2,15000,5000,
            Map.of("test.activity",new NotificationSettings.Template("Test notice","Test only.")));
    SimpleMessageListenerContainer listener;

    @BeforeAll static void start() {
        var factory=DockerClientFactory.instance();
        var endpoint=factory.getTransportConfig().getDockerHost();
        boolean socket=("unix".equals(endpoint.getScheme()) && endpoint.getHost()==null)
                || ("npipe".equals(endpoint.getScheme()) && endpoint.getHost()==null && endpoint.getPath().startsWith("//./pipe/"));
        if ((!socket && !loopback(endpoint.getHost())) || !loopback(factory.dockerHostIpAddress()))
            throw new IllegalStateException("Notification tests require local Docker only.");
        if(!"true".equals(System.getenv("HTT_TEST_ON_DEVELOPMENT_DATABASE")))throw new IllegalStateException("Explicit development-test opt-in required");
        databaseUrl=System.getenv("HTT_DB_URL");appUser=System.getenv("HTT_DB_USERNAME");appPassword=System.getenv("HTT_DB_PASSWORD");
        if(!"jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api".equals(databaseUrl)
                ||!"htt_management_app".equals(appUser)||!"htt_management_migrator".equals(System.getenv("HTT_DB_MIGRATION_USERNAME")))throw new IllegalStateException("Development database target mismatch");
        owner=new JdbcTemplate(new DriverManagerDataSource(databaseUrl,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD")));
        try {
            testGuard=java.sql.DriverManager.getConnection(databaseUrl,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"));
            try(var lock=testGuard.createStatement();var r=lock.executeQuery("select pg_try_advisory_lock(744610016)")){r.next();if(!r.getBoolean(1))throw new IllegalStateException("Another integration suite is running");}
        }catch(java.sql.SQLException failure){throw new IllegalStateException("Development test guard unavailable",failure);}
        if(!"htt-management-api shared development/test; synthetic fixtures only".equals(owner.queryForObject("select shobj_description(oid,'pg_database') from pg_database where datname=current_database()",String.class)))throw new IllegalStateException("Database is not marked development/test");
        if(owner.queryForObject("select (select count(*) from platform.domain_outbox)+(select count(*) from notification.delivery)+(select count(*) from notification.device)",Long.class)!=0)throw new IllegalStateException("Existing worker records; refuse global consumption");
        Flyway.configure().dataSource(databaseUrl,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))
                .defaultSchema("platform").createSchemas(false).cleanDisabled(true).placeholders(Map.of("runtime_role",appUser)).load().migrate();
        rabbit=new RabbitMQContainer(System.getProperty("htt.test.rabbit-image","rabbitmq:4.3-management-alpine"));rabbit.start();
        var source=new DriverManagerDataSource(databaseUrl,appUser,appPassword);
        jdbc=new JdbcTemplate(source); transactions=new TransactionTemplate(new JdbcTransactionManager(source));
        store=new NotificationStore(jdbc,transactions); outbox=new OutboxStore(jdbc,transactions); events=new DomainEvents(jdbc,JSON);
        connection=new CachingConnectionFactory(rabbit.getHost(),rabbit.getAmqpPort());
        connection.setUsername(rabbit.getAdminUsername()); connection.setPassword(rabbit.getAdminPassword());
        connection.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED); connection.setPublisherReturns(true);
        template=new RabbitTemplate(connection); template.setMandatory(true); admin=new RabbitAdmin(connection);
        topology(); broker=new NotificationBroker(template,3000);
        owner.update("insert into identity.company(id,code,name) values (?,'NOTIFICATION TEST','Test only')",COMPANY);
        owner.update("insert into identity.user_account(id,display_name) values (?,'Test only')",USER);
        owner.update("insert into identity.company_member(company_id,user_id,member_kind) values (?,?,'MANAGEMENT')",COMPANY,USER);
        UUID role=UUID.randomUUID();
        owner.update("insert into identity.role(company_id,id,code) values (?,?,'TEST')",COMPANY,role);
        owner.update("insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,'notification:read')",COMPANY,role);
        owner.update("insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",COMPANY,USER,role);
        owner.update("insert into identity.resource_grant(company_id,user_id,scope) values (?,?,'COMPANY')",COMPANY,USER);
    }
    @AfterEach void cleanup() {
        if (listener!=null) listener.stop();
        for (String name : List.of(NotificationBroker.WORK,NotificationBroker.DEAD,"htt.notification.retry.1.v1","htt.notification.retry.2.v1")) admin.purgeQueue(name);
        for (String table : List.of("notification.delivery","notification.message","notification.recipient_cursor","notification.device","notification.inbox","platform.domain_outbox","notification.audit"))
            if(table.equals("notification.delivery"))owner.update("delete from notification.delivery where message_id in (select id from notification.message where company_id=?)",COMPANY);
            else owner.update("delete from "+table+" where company_id=?",COMPANY);
    }
    @AfterAll static void stop() throws Exception {
        if(owner!=null) {
            owner.update("delete from platform.access_audit where actor_id=? or selected_company_id=?",USER,COMPANY);
            for(String table:List.of("identity.grant_branch","identity.resource_grant","identity.member_role","identity.role_permission","identity.role","identity.company_member"))owner.update("delete from "+table+" where company_id=?",COMPANY);
            owner.update("delete from identity.external_identity where user_id=?",USER);
            owner.update("delete from identity.user_account where id=?",USER);owner.update("delete from identity.company where id=?",COMPANY);
        }
        if(testGuard!=null)testGuard.close();
        if (connection!=null) connection.destroy(); if (rabbit!=null) rabbit.close();
    }
    @Test void committedOutboxPublishesConsumesAndDeduplicates() {
        listen(store); DomainEvent event=event();
        publish(event,false); new OutboxRelay(outbox,broker,SETTINGS).tick();
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> assertThat(count("notification.message")).isEqualTo(1));
        broker.publish(JSON.writeValueAsString(event),event.id().toString());
        // JSONB may reformat JSON, so replay the exact stored wire payload for a valid duplicate.
        String wire=owner.queryForObject("select payload::text from platform.domain_outbox where id=?",String.class,event.id());
        broker.publish(wire,event.id().toString());
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> assertThat(owner.queryForObject("select count(*) from notification.audit where outcome='DUPLICATE'",Long.class)).isGreaterThanOrEqualTo(1));
        assertThat(count("notification.message")).isEqualTo(1);
        assertThat(owner.queryForObject("select state from platform.domain_outbox",String.class)).isEqualTo("PUBLISHED");
    }
    @Test void rolledBackBusinessEventNeverReachesBroker() {
        publish(event(),true); new OutboxRelay(outbox,broker,SETTINGS).tick();
        assertThat(count("platform.domain_outbox")).isZero(); assertThat(template.receive(NotificationBroker.WORK,300)).isNull();
    }
    @Test void transientConsumerFailureRetriesThenSucceeds() {
        var failing=spy(store);
        doThrow(new IllegalStateException("test database fault")).doCallRealMethod().when(failing).consume(any(),anyString(),any());
        listen(failing); DomainEvent event=event(); broker.publish(JSON.writeValueAsString(event),event.id().toString());
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> assertThat(count("notification.message")).isEqualTo(1));
        assertThat(owner.queryForObject("select count(*) from notification.audit where outcome='RETRY'",Long.class)).isEqualTo(1);
        assertThat(admin.getQueueInfo(NotificationBroker.DEAD).getMessageCount()).isZero();
    }
    @Test void persistentFailureEndsInDurableDeadLetterQueue() {
        var failing=spy(store); doThrow(new IllegalStateException("persistent test fault")).when(failing).consume(any(),anyString(),any());
        listen(failing); DomainEvent event=event(); broker.publish(JSON.writeValueAsString(event),event.id().toString());
        await().atMost(Duration.ofSeconds(20)).untilAsserted(() -> assertThat(admin.getQueueInfo(NotificationBroker.DEAD).getMessageCount()).isEqualTo(1));
        assertThat(count("notification.message")).isZero();
        assertThat(owner.queryForObject("select count(*) from notification.audit where outcome='DEAD'",Long.class)).isEqualTo(1);
    }
    @Test void everyApiInstanceGetsFanoutWakeup() {
        String first=admin.declareQueue().getName(),second=admin.declareQueue().getName();
        try {
            for (String queue : List.of(first,second)) admin.declareBinding(new Binding(queue,Binding.DestinationType.QUEUE,NotificationBroker.WAKEUP,"",null));
            broker.wakeup(JSON.writeValueAsBytes(new NotificationModels.Wakeup(COMPANY,USER)));
            assertThat(template.receive(first,3000)).isNotNull(); assertThat(template.receive(second,3000)).isNotNull();
        } finally { admin.deleteQueue(first); admin.deleteQueue(second); }
    }
    @Test void unroutablePublishLeavesOutboxRetryable() {
        publish(event(),false); admin.deleteQueue(NotificationBroker.WORK);
        try {
            new OutboxRelay(outbox,broker,SETTINGS).tick();
            assertThat(owner.queryForObject("select state from platform.domain_outbox",String.class)).isEqualTo("PENDING");
        } finally { topology(); }
    }

    @Test void realHttpSseAuthenticatesIsolatesAndRecoversFromDurableHistory() throws Exception {
        var fixture=new PortalFixture();
        listen(store);
        try (var application=new SpringApplicationBuilder(TokenConfiguration.class,HttManagementApiApplication.class).run(
                "--server.port=0", "--server.address=127.0.0.1", "--logging.level.root=WARN",
                "--spring.datasource.url="+databaseUrl, "--spring.datasource.username="+appUser,
                "--spring.datasource.password="+appPassword, "--spring.datasource.hikari.maximum-pool-size=4",
                "--spring.flyway.placeholders.runtime_role="+appUser,
                "--spring.rabbitmq.host="+rabbit.getHost(), "--spring.rabbitmq.port="+rabbit.getAmqpPort(),
                "--spring.rabbitmq.username="+rabbit.getAdminUsername(), "--spring.rabbitmq.password="+rabbit.getAdminPassword(),
                "--htt.notification.enabled=true", "--htt.notification.workers-enabled=false", "--htt.notification.heartbeat-ms=1000",
                "--htt.auth.enabled=true", "--htt.auth.staff.issuer="+STAFF_ISSUER, "--htt.auth.staff.audience=staff-api",
                "--htt.auth.staff.jwk-set-uri="+STAFF_ISSUER+"/certs", "--htt.auth.portal.issuer="+PORTAL_ISSUER,
                "--htt.auth.portal.audience=portal-api", "--htt.auth.portal.jwk-set-uri="+PORTAL_ISSUER+"/certs");
                var client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            String origin="http://127.0.0.1:"+application.getEnvironment().getRequiredProperty("local.server.port");
            String tokenA=token(fixture.users[0].toString(),"portal-api"), tokenB=token(fixture.users[1].toString(),"portal-api");
            assertThat(get(client,origin,"/stream",null,fixture.grants[0],null).statusCode()).isEqualTo(401);
            assertThat(get(client,origin,"/stream?access_token=ignored",null,fixture.grants[0],null).statusCode()).isEqualTo(401);
            assertThat(get(client,origin,"",token(fixture.users[0].toString(),"wrong-api"),fixture.grants[0],null).statusCode()).isEqualTo(401);
            assertThat(get(client,origin,"",tokenA,fixture.grants[1],null).statusCode()).isEqualTo(403);
            assertThat(get(client,origin,"",tokenA,fixture.grants[0],UUID.randomUUID()).statusCode()).isEqualTo(403);
            var device=request(origin,"/devices",tokenA,fixture.grants[0],null)
                    .header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(
                            "{\"platform\":\"ANDROID\",\"token\":\"container-test-token\"}")).build();
            assertThat(client.send(device,HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(200);

            // Actual Spring publisher + business transaction -> Outbox -> Rabbit -> consumer -> PG/RLS.
            var appJdbc=application.getBean(JdbcTemplate.class);
            var appTransaction=new TransactionTemplate(application.getBean(org.springframework.transaction.PlatformTransactionManager.class));
            var publisher=application.getBean(DomainEvents.class);
            for (DomainEvent fact : List.of(fixture.event(0,fixture.branches[0],List.of(fixture.users[0],fixture.users[1])),
                    fixture.event(0,fixture.hiddenBranch,List.of(fixture.users[0])),
                    fixture.event(0,fixture.branches[0],List.of(fixture.users[0])),
                    fixture.event(1,fixture.branches[1],List.of(fixture.users[1])))) {
                appTransaction.executeWithoutResult(status -> {
                    appJdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,COMPANY.toString());
                    appJdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,USER.toString());
                    publisher.publish(fact);
                });
            }
            new OutboxRelay(outbox,broker,SETTINGS).tick();
            await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> assertThat(count("notification.inbox")).isEqualTo(4));
            var historyA=JSON.readTree(get(client,origin,"",tokenA,fixture.grants[0],null).body());
            var historyB=JSON.readTree(get(client,origin,"",tokenB,fixture.grants[1],null).body());
            assertThat(historyA.path("items").size()).isEqualTo(2);
            assertThat(historyB.path("items").size()).isEqualTo(1);
            for (var item : historyA.path("items")) assertThat(item.path("branchId").asString()).isEqualTo(fixture.branches[0].toString());
            assertThat(owner.queryForObject("select count(*) from notification.audit where action='RECIPIENT' and outcome='DENIED'",Long.class)).isEqualTo(2);
            String foreignId=historyB.path("items").get(0).path("id").asString();
            var crossRead=request(origin,"/"+foreignId+"/read",tokenA,fixture.grants[0],null)
                    .method("PATCH",HttpRequest.BodyPublishers.noBody()).build();
            assertThat(client.send(crossRead,HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(404);

            // The client persisted cursor 1 before disconnect. Both REST and SSE resume at cursor 2.
            var compensation=JSON.readTree(get(client,origin,"?after=1",tokenA,fixture.grants[0],null).body());
            assertThat(compensation.path("items").size()).isEqualTo(1);
            assertThat(compensation.path("items").get(0).path("cursor").asLong()).isEqualTo(2);
            var response=client.send(request(origin,"/stream",tokenA,fixture.grants[0],null)
                    .header("Accept","text/event-stream").header("Last-Event-ID","1").GET().build(),HttpResponse.BodyHandlers.ofInputStream());
            try (InputStream body=response.body(); var lines=new BufferedReader(new InputStreamReader(body,StandardCharsets.UTF_8))) {
                assertThat(response.statusCode()).isEqualTo(200);
                assertThat(response.headers().firstValue("X-Accel-Buffering")).contains("no");
                String frames=throughHeartbeat(lines);
                assertThat(frames).contains("event:notification","id:2","heartbeat").doesNotContain("id:1\n");
                new DeliveryWorker(store,SETTINGS,List.of(new FakePushProvider(),new SseChannel(broker,JSON))).tick();
                assertThat(owner.queryForObject("select count(*) from notification.delivery where channel='FCM' and state='SIMULATED'",Long.class)).isEqualTo(2);
                assertThat(owner.queryForObject("select count(*) from notification.delivery where channel='SSE' and state='SENT'",Long.class)).isEqualTo(3);
                owner.update("update identity.resource_grant set enabled=false where id=?",fixture.grants[0]);
                var hub=application.getBean(SseHub.class);
                hub.wakeup(new NotificationModels.Wakeup(COMPANY,fixture.users[0]));
                await().atMost(Duration.ofSeconds(5)).until(() -> hub.connectionCount()==0);
                assertThat(get(client,origin,"",tokenA,fixture.grants[0],null).statusCode()).isEqualTo(403);
            }
        }
    }

    private static HttpRequest.Builder request(String origin,String path,String token,UUID grant,UUID company) {
        var request=HttpRequest.newBuilder(URI.create(origin+"/api/portal/v1/notifications"+path))
                .timeout(Duration.ofSeconds(10)).header("X-Company-Id",(company==null ? COMPANY : company).toString())
                .header("X-Portal-Grant-Id",grant.toString());
        if (token!=null) request.header("Authorization","Bearer "+token);
        return request;
    }
    private static HttpResponse<String> get(HttpClient client,String origin,String path,String token,UUID grant,UUID company) throws Exception {
        return client.send(request(origin,path,token,grant,company).GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    private static String throughHeartbeat(BufferedReader lines) throws Exception {
        StringBuilder frames=new StringBuilder();
        for (int i=0;i<100;i++) {
            String line=lines.readLine();
            if (line==null) break;
            frames.append(line).append('\n');
            if (line.startsWith(":heartbeat")) return frames.toString();
        }
        throw new AssertionError("No SSE heartbeat after notification frames.");
    }
    private static KeyPair keyPair() {
        try { var generator=KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); return generator.generateKeyPair(); }
        catch (Exception failure) { throw new IllegalStateException(failure); }
    }
    private static String token(String subject,String audience) throws Exception {
        var jwt=new SignedJWT(new JWSHeader(JWSAlgorithm.RS256),new JWTClaimsSet.Builder().issuer(PORTAL_ISSUER)
                .subject(subject).audience(audience).issueTime(Date.from(Instant.now().minusSeconds(1)))
                .expirationTime(Date.from(Instant.now().plusSeconds(300))).build());
        jwt.sign(new RSASSASigner((RSAPrivateKey)KEY.getPrivate()));
        return jwt.serialize();
    }

    @TestConfiguration(proxyBeanMethods=false)
    static class TokenConfiguration {
        @Bean("staffJwtDecoder") JwtDecoder staffDecoder() { return decoder(STAFF_ISSUER,"staff-api"); }
        @Bean("portalJwtDecoder") JwtDecoder portalDecoder() { return decoder(PORTAL_ISSUER,"portal-api"); }
        private static JwtDecoder decoder(String issuer,String audience) {
            var decoder=NimbusJwtDecoder.withPublicKey((RSAPublicKey)KEY.getPublic()).build();
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer),jwt ->
                    jwt.getAudience().contains(audience) && jwt.getIssuedAt()!=null && jwt.getExpiresAt()!=null
                            ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"))));
            return decoder;
        }
    }
    private static class PortalFixture {
        final UUID[] users={UUID.randomUUID(),UUID.randomUUID()}, customers={UUID.randomUUID(),UUID.randomUUID()},
                branches={UUID.randomUUID(),UUID.randomUUID()}, grants={UUID.randomUUID(),UUID.randomUUID()};
        final UUID hiddenBranch=UUID.randomUUID();
        PortalFixture() {
            for (int i=0;i<2;i++) {
                UUID role=UUID.randomUUID();
                owner.update("insert into identity.user_account(id,display_name) values (?,'Container test only')",users[i]);
                owner.update("insert into identity.company_member(company_id,user_id,member_kind) values (?,?,'CUSTOMER')",COMPANY,users[i]);
                owner.update("insert into identity.external_identity(issuer,subject,user_id,realm) values (?,?,?,'CUSTOMER')",PORTAL_ISSUER,users[i].toString(),users[i]);
                owner.update("insert into crm.customer(id,company_id,code,business_name) values (?,?,?,'Container test only')",customers[i],COMPANY,customers[i].toString());
                owner.update("insert into crm.customer_branch(id,company_id,customer_id,name) values (?,?,?,'Container test only')",branches[i],COMPANY,customers[i]);
                owner.update("insert into identity.role(company_id,id,code) values (?,?,?)",COMPANY,role,role.toString());
                for (String permission : List.of("notification:read","notification:device"))
                    owner.update("insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,?)",COMPANY,role,permission);
                owner.update("insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",COMPANY,users[i],role);
                owner.update("insert into identity.resource_grant(id,company_id,user_id,scope,customer_id) values (?,?,?,'BRANCH',?)",grants[i],COMPANY,users[i],customers[i]);
                owner.update("insert into identity.grant_branch(grant_id,company_id,customer_id,branch_id) values (?,?,?,?)",grants[i],COMPANY,customers[i],branches[i]);
            }
            owner.update("insert into crm.customer_branch(id,company_id,customer_id,name) values (?,?,?,'Hidden test branch')",hiddenBranch,COMPANY,customers[0]);
        }
        DomainEvent event(int customer,UUID branch,List<UUID> recipients) {
            return new DomainEvent(UUID.randomUUID(),1,"test.activity",COMPANY,UUID.randomUUID(),customers[customer],branch,recipients,Map.of(),Instant.now());
        }
    }
    private void listen(NotificationStore target) {
        listener=new SimpleMessageListenerContainer(connection); listener.setQueueNames(NotificationBroker.WORK);
        listener.setAcknowledgeMode(AcknowledgeMode.MANUAL); listener.setPrefetchCount(1);
        listener.setMessageListener(new NotificationConsumer(target,broker,SETTINGS,JSON)); listener.start();
    }
    private void publish(DomainEvent event,boolean rollback) {
        transactions.executeWithoutResult(status -> {
            jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,COMPANY.toString());
            jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,USER.toString()); events.publish(event);
            if (rollback) status.setRollbackOnly();
        });
    }
    private static DomainEvent event() { return new DomainEvent(UUID.randomUUID(),1,"test.activity",COMPANY,UUID.randomUUID(),null,null,List.of(USER),Map.of(),Instant.now()); }
    private static long count(String table) { return owner.queryForObject("select count(*) from "+table,Long.class); }
    private static boolean loopback(String host) { return "localhost".equalsIgnoreCase(host)||"127.0.0.1".equals(host)||"::1".equals(host)||"[::1]".equals(host); }
    private static void topology() {
        for (Declarable declaration : new NotificationConfiguration().notificationTopology(SETTINGS).getDeclarables()) {
            if (declaration instanceof Queue queue) admin.declareQueue(queue);
            else if (declaration instanceof Exchange exchange) admin.declareExchange(exchange);
            else if (declaration instanceof Binding binding) admin.declareBinding(binding);
        }
    }
}
