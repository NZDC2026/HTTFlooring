package com.htt.management;

import com.htt.management.identity.AccessRepository;
import com.htt.management.identity.AccessSnapshot;
import com.htt.management.identity.AccessAudit;
import com.htt.management.platform.web.RequestIdFilter;
import com.htt.management.platform.events.DomainEvent;
import com.htt.management.platform.events.DomainEvents;
import com.htt.management.notification.OutboxStore;
import com.htt.management.notification.NotificationStore;
import com.htt.management.notification.NotificationModels;
import com.htt.management.notification.NotificationSettings;
import com.htt.management.inventory.contract.InventoryAvailability;
import com.htt.management.inventory.contract.InventorySource;
import com.htt.management.inventory.infrastructure.PostgresInventorySource;
import java.time.Clock;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import java.util.Set;
import java.time.Instant;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.exception.FlywayValidateException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.json.JsonMapper;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Explicit container or dedicated validation target. Never falls back to the main database. */
class PostgresBaselineIT {
    private static final java.util.Set<UUID> CUSTOMER_HTTP_REQUESTS=java.util.concurrent.ConcurrentHashMap.newKeySet();
    private static final List<String> TABLES = List.of("identity.company", "identity.user_account",
            "identity.company_member", "crm.customer", "crm.customer_branch", "crm.customer_contact",
            "catalog.unit_of_measure", "catalog.product", "inventory.warehouse");
    private static PostgreSQLContainer container;
    private static String url;
    private static String appUser;
    private static String appPassword;
    private static String migrationUser;
    private static String migrationPassword;

    @BeforeAll
    static void prepareDatabase() throws Exception {
        switch (System.getProperty("htt.test.database", "container")) {
            case "container" -> prepareContainer();
            case "dedicated" -> prepareDedicatedDatabase();
            default -> throw new IllegalArgumentException("htt.test.database must be container or dedicated.");
        }
        migrations(migrationUser, migrationPassword).migrate();
    }

    @AfterAll
    static void stopContainer() {
        if (container != null) { container.close(); }
    }

    @Test
    void migrationsAreRepeatableAndRuntimeValidationRejectsPendingChanges() {
        var flyway = migrations(migrationUser, migrationPassword);
        assertThat(flyway.migrate().migrationsExecuted).isZero();
        assertThat(flyway.info().applied()).hasSize(12);
        assertThat(flyway.info().pending()).isEmpty();
        assertThat(migrations(appUser, appPassword).validateWithResult().validationSuccessful).isTrue();
        var pending = Flyway.configure().dataSource(url, appUser, appPassword)
                .defaultSchema("platform").createSchemas(false).cleanDisabled(true)
                .locations("classpath:db/migration", "classpath:db/pending")
                .placeholders(Map.of("runtime_role", appUser)).load();
        assertThatThrownBy(pending::validate).isInstanceOf(FlywayValidateException.class);
    }

    @Test
    void runtimeRoleCannotChangeSchemaDataOrMigrationHistory() throws Exception {
        try (var connection = appConnection()) {
            connection.setAutoCommit(false);
            for (String table : TABLES) { assertThat(count(connection, table)).isZero(); }
            assertThat(scalar(connection, "SELECT count(*) FROM pg_roles WHERE rolname = current_user "
                    + "AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls OR rolreplication)"))
                    .isZero();
            assertThat(scalar(connection, "SELECT has_database_privilege(current_database(), 'CREATE')::int "
                    + "+ has_database_privilege(current_database(), 'TEMP')::int "
                    + "+ has_schema_privilege('public', 'CREATE')::int")).isZero();
            expectSqlState(connection, "42501", "CREATE TABLE platform.unauthorized (id integer)");
            expectSqlState(connection, "42501", "UPDATE platform.flyway_schema_history SET success = false");
            expectSqlState(connection, "42501", "INSERT INTO crm.customer(company_id, code, business_name) "
                    + "VALUES (gen_random_uuid(), 'TEST', 'TEST')");
            expectSqlState(connection, "42501", "TRUNCATE crm.customer");
            connection.rollback();
        }
    }

    @Test
    void companyAndActorContextPreventCrossCompanyReadsAndResetAfterTransaction() throws Exception {
        try (var fixture = new Fixture(); var connection = appConnection()) {
            connection.setAutoCommit(false);
            setContext(connection, fixture.company[0], fixture.actor[0]);
            for (String table : TABLES) { assertThat(count(connection, table)).as(table).isEqualTo(1); }
            setContext(connection, fixture.company[1], fixture.actor[0]);
            assertThat(count(connection, "crm.customer")).isZero();
            setContext(connection, fixture.company[1], fixture.actor[1]);
            assertThat(count(connection, "crm.customer")).isEqualTo(1);
            connection.commit();
            assertThat(count(connection, "crm.customer")).isZero();
            assertThat(count(connection, "identity.user_account")).isZero();
            connection.rollback();
            try (var migration = migrationConnection()) {
                execute(migration, "UPDATE identity.company_member SET status = 'DISABLED' WHERE user_id = ?", fixture.actor[0]);
            }
            setContext(connection, fixture.company[0], fixture.actor[0]);
            assertThat(count(connection, "crm.customer")).isZero();
            connection.rollback();
        }
    }

    @Test
    void foreignKeysAndChecksRejectInvalidMasterData() throws Exception {
        try (var fixture = new Fixture(); var connection = migrationConnection()) {
            connection.setAutoCommit(false);
            expectSqlState(connection, "23503", "INSERT INTO crm.customer_branch(company_id, customer_id, name) VALUES (?, ?, 'TEST')",
                    fixture.company[0], fixture.customer[1]);
            expectSqlState(connection, "23503", "INSERT INTO catalog.product(company_id, sku, name, base_unit_id) VALUES (?, 'INVALID-UNIT', 'TEST', ?)",
                    fixture.company[0], fixture.unit[1]);
            expectSqlState(connection, "23503", "INSERT INTO crm.customer_contact(company_id, customer_id, branch_id, name) VALUES (?, ?, ?, 'TEST')",
                    fixture.company[0], fixture.customer[0], fixture.branch[1]);
            expectSqlState(connection, "23514", "UPDATE crm.customer SET version = 0 WHERE id = ?", fixture.customer[0]);
            expectSqlState(connection, "23514", "UPDATE crm.customer_branch SET latitude = 100, longitude = 0 WHERE id = ?", fixture.branch[0]);
            expectSqlState(connection, "23505", "INSERT INTO crm.customer(company_id, code, business_name) "
                    + "SELECT company_id, code, business_name FROM crm.customer WHERE id = ?", fixture.customer[0]);
            connection.rollback();
        }
    }

    @Test
    void verifiedIdentityResolvesCurrentRolesScopesAndRevocationThroughRuntimeRole() throws Exception {
        try (var fixture = new Fixture(); var migration = migrationConnection(); var runtime = appConnection()) {
            UUID role = UUID.randomUUID();
            UUID extraRole = UUID.randomUUID();
            UUID grant = UUID.randomUUID();
            String subject = fixture.actor[0].toString();
            execute(migration, "UPDATE identity.company_member SET member_kind = 'MANAGEMENT' WHERE user_id = ?", fixture.actor[0]);
            execute(migration, "INSERT INTO identity.external_identity(issuer, subject, user_id, realm) VALUES ('https://test.invalid', ?, ?, 'STAFF')", subject, fixture.actor[0]);
            for (UUID roleId : List.of(role, extraRole)) {
                execute(migration, "INSERT INTO identity.role(company_id, id, code) VALUES (?, ?, ?)", fixture.company[0], roleId, roleId.toString());
                execute(migration, "INSERT INTO identity.member_role(company_id, user_id, role_id) VALUES (?, ?, ?)", fixture.company[0], fixture.actor[0], roleId);
            }
            execute(migration, "INSERT INTO identity.role_permission(company_id, role_id, permission_code) VALUES (?, ?, 'order:create')", fixture.company[0], role);
            execute(migration, "INSERT INTO identity.role_permission(company_id, role_id, permission_code) VALUES (?, ?, 'order:read')", fixture.company[0], extraRole);
            execute(migration, "INSERT INTO identity.resource_grant(id, company_id, user_id, scope, customer_id) VALUES (?, ?, ?, 'BRANCH', ?)", grant, fixture.company[0], fixture.actor[0], fixture.customer[0]);
            execute(migration, "INSERT INTO identity.grant_branch(grant_id, company_id, customer_id, branch_id) VALUES (?, ?, ?, ?)", grant, fixture.company[0], fixture.customer[0], fixture.branch[0]);

            var repository = new AccessRepository(new JdbcTemplate(new SingleConnectionDataSource(runtime, true)), new JsonMapper());
            var access = repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF);
            assertThat(access.actorId()).isEqualTo(fixture.actor[0]);
            assertThat(access.companies()).hasSize(1);
            assertThat(access.companies().getFirst().roles()).hasSize(2);
            assertThat(access.companies().getFirst().permissions()).containsExactlyInAnyOrder("order:create", "order:read");
            assertThat(access.companies().getFirst().grants().getFirst().branchIds()).containsExactly(fixture.branch[0]);
            assertThat(repository.resolve("https://wrong.invalid", subject, AccessSnapshot.Realm.STAFF)).isNull();
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.CUSTOMER)).isNull();
            assertThat(repository.findResource(AccessSnapshot.ResourceKind.BRANCH, fixture.branch[0]).customerId()).isEqualTo(fixture.customer[0]);
            assertThat(repository.findResource(AccessSnapshot.ResourceKind.ORDER, UUID.randomUUID())).isNull();

            execute(migration, "DELETE FROM identity.role_permission WHERE role_id = ?", role);
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF)
                    .companies().getFirst().permissions()).containsExactly("order:read");
            execute(migration, "UPDATE identity.resource_grant SET enabled = false WHERE id = ?", grant);
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF)
                    .companies().getFirst().grants()).isEmpty();
            execute(migration, "UPDATE identity.user_account SET status = 'DISABLED' WHERE id = ?", fixture.actor[0]);
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF)).isNull();
            execute(migration, "UPDATE identity.user_account SET status = 'ACTIVE' WHERE id = ?", fixture.actor[0]);
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF)
                    .tokensValidAfter()).isAfter(access.tokensValidAfter());
            execute(migration, "UPDATE identity.company_member SET status = 'DISABLED' WHERE user_id = ?", fixture.actor[0]);
            assertThat(repository.resolve("https://test.invalid", subject, AccessSnapshot.Realm.STAFF).companies()).isEmpty();
        }
    }

    @Test
    void securityTablesRejectRuntimeMutationAndCrossCompanyGrantAssignment() throws Exception {
        try (var fixture = new Fixture(); var migration = migrationConnection(); var runtime = appConnection()) {
            migration.setAutoCommit(false);
            runtime.setAutoCommit(false);
            UUID role = UUID.randomUUID();
            UUID grant = UUID.randomUUID();
            execute(migration, "INSERT INTO identity.role(company_id, id, code) VALUES (?, ?, 'TEST')", fixture.company[0], role);
            expectSqlState(migration, "23503", "INSERT INTO identity.member_role(company_id, user_id, role_id) VALUES (?, ?, ?)", fixture.company[1], fixture.actor[1], role);
            execute(migration, "INSERT INTO identity.resource_grant(id, company_id, user_id, scope, customer_id) VALUES (?, ?, ?, 'BRANCH', ?)", grant, fixture.company[0], fixture.actor[0], fixture.customer[0]);
            expectSqlState(migration, "23503", "INSERT INTO identity.grant_branch(grant_id, company_id, customer_id, branch_id) VALUES (?, ?, ?, ?)", grant, fixture.company[0], fixture.customer[0], fixture.branch[1]);
            expectSqlState(runtime, "42501", "UPDATE identity.company_member SET member_kind = 'MANAGEMENT'");
            expectSqlState(runtime, "42501", "INSERT INTO identity.permission(code) VALUES ('unauthorized')");
            expectSqlState(runtime, "42501", "SELECT * FROM identity.external_identity");
            expectSqlState(runtime, "42501", "SELECT * FROM platform.access_audit");
            expectSqlState(runtime, "42501", "DELETE FROM platform.access_audit");
            execute(runtime, "SELECT identity.append_access_audit(?, ?, ?, 'order:create', ?, 'DENY')",
                    UUID.randomUUID().toString(), fixture.actor[0], fixture.company[0], fixture.branch[0]);
            migration.rollback();
            runtime.rollback();
        }
    }

    @Test
    void authorizationAuditSurvivesOuterTransactionRollback() throws Exception {
        try (var context = new AnnotationConfigApplicationContext(); var migration = migrationConnection()) {
            context.register(AuditTransactions.class);
            context.registerBean(DataSource.class, () -> new DriverManagerDataSource(url, appUser, appPassword));
            context.registerBean(JdbcTemplate.class, () -> new JdbcTemplate(context.getBean(DataSource.class)));
            context.registerBean(JdbcTransactionManager.class, () -> new JdbcTransactionManager(context.getBean(DataSource.class)));
            context.registerBean(AccessAudit.class, () -> new AccessAudit(context.getBean(JdbcTemplate.class)));
            context.refresh();
            var request = new MockHttpServletRequest();
            new RequestIdFilter().doFilter(request, new MockHttpServletResponse(), (req, res) -> {});
            String requestId = RequestIdFilter.requestId(request);
            var outer = new TransactionTemplate(context.getBean(JdbcTransactionManager.class));
            try {
                assertThatThrownBy(() -> outer.executeWithoutResult(status -> {
                    context.getBean(JdbcTemplate.class).queryForObject("select 1", Integer.class);
                    context.getBean(AccessAudit.class).record(request, "order:create", null, null, "DENY");
                    throw new IllegalStateException("Test business rollback");
                })).isInstanceOf(IllegalStateException.class).hasMessage("Test business rollback");
                try (var statement = migration.prepareStatement("SELECT count(*) FROM platform.access_audit WHERE request_id = ?::uuid AND outcome = 'DENY'")) {
                    statement.setString(1, requestId);
                    try (var result = statement.executeQuery()) { result.next(); assertThat(result.getInt(1)).isEqualTo(1); }
                }
            } finally {
                execute(migration, "DELETE FROM platform.access_audit WHERE request_id = ?::uuid", requestId);
            }
        }
    }

    @org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods = false)
    @EnableTransactionManagement
    static class AuditTransactions {}

    @Test
    void outboxJoinsBusinessRollbackAndLeasesPreventStaleCompletion() throws Exception {
        try (var fixture=new Fixture(); var migration=migrationConnection()) {
            var source=new DriverManagerDataSource(url,appUser,appPassword);
            var jdbc=new JdbcTemplate(source);
            var tx=new TransactionTemplate(new JdbcTransactionManager(source));
            var publisher=new DomainEvents(jdbc,new JsonMapper());
            var outbox=new OutboxStore(jdbc,tx);
            var event=notificationEvent(fixture,UUID.randomUUID());
            tx.executeWithoutResult(status -> {
                jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,fixture.company[0].toString());
                jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,fixture.actor[0].toString());
                publisher.publish(event); status.setRollbackOnly();
            });
            assertThat(count(migration,"platform.domain_outbox")).isZero();
            tx.executeWithoutResult(status -> {
                jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,fixture.company[0].toString());
                jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,fixture.actor[0].toString()); publisher.publish(event);
            });
            var first=outbox.claim(10,60).getFirst(); assertThat(outbox.claim(10,60)).isEmpty();
            execute(migration,"update platform.domain_outbox set lease_until=now()-interval '1 second' where id=?",event.id());
            var second=outbox.claim(10,60).getFirst();
            assertThat(second.attempt()).isEqualTo(2);
            outbox.published(first);
            assertThat(scalar(migration,"select count(*) from platform.domain_outbox where state='IN_FLIGHT'")).isEqualTo(1);
            outbox.published(second); assertThat(outbox.claim(10,60)).isEmpty();
        }
    }

    @Test
    void notificationInboxScopesHistoryAndDeliveryStatesUseRealDatabase() throws Exception {
        try (var fixture=new Fixture(); var migration=migrationConnection()) {
            UUID grant=notificationGrants(fixture,migration);
            var source=new DriverManagerDataSource(url,appUser,appPassword);
            var store=new NotificationStore(new JdbcTemplate(source),new TransactionTemplate(new JdbcTransactionManager(source)));
            var session=new NotificationModels.Session(fixture.company[0],fixture.actor[0],grant,AccessSnapshot.Realm.CUSTOMER,null);
            UUID device=store.registerDevice(session,"ANDROID","test-only-not-a-real-device");
            assertThat(device).isNotNull();
            var event=notificationEvent(fixture,UUID.randomUUID());
            var template=new NotificationSettings.Template("Test notice","Test only.");
            assertThat(store.consume(event,"first",template)).isTrue();
            assertThat(store.consume(event,"first",template)).isFalse();
            assertThatThrownBy(() -> store.consume(event,"different",template)).isInstanceOf(IllegalArgumentException.class);
            var history=store.history(session,0,100);
            assertThat(history.items()).hasSize(1); assertThat(history.nextCursor()).isEqualTo(1);
            assertThat(store.markRead(session,history.items().getFirst().id())).isTrue();
            var other=new NotificationModels.Session(fixture.company[1],fixture.actor[1],null,AccessSnapshot.Realm.STAFF,null);
            assertThat(store.history(other,0,100).items()).isEmpty();
            assertThat(store.markRead(other,history.items().getFirst().id())).isFalse();
            var wrongGrant=new NotificationModels.Session(fixture.company[0],fixture.actor[0],UUID.randomUUID(),AccessSnapshot.Realm.CUSTOMER,null);
            assertThat(store.history(wrongGrant,0,100).items()).isEmpty();
            var deliveries=store.claimDeliveries(10,60); assertThat(deliveries).hasSize(2);
            for (var delivery : deliveries) store.finish(delivery,delivery.channel().equals("FCM") ? "SIMULATED" : "SENT",Instant.now(),null);
            assertThat(store.claimDeliveries(10,60)).isEmpty();
            assertThat(scalar(migration,"select count(*) from notification.delivery where state='SIMULATED'")).isEqualTo(1);
            store.consume(notificationEvent(fixture,UUID.randomUUID()),"next",template);
            for (var delivery : store.claimDeliveries(10,60)) {
                if (delivery.channel().equals("FCM")) {
                    assertThat(store.stillEligible(delivery)).isTrue();
                    store.permanentFailure(delivery,com.htt.management.notification.NotificationChannel.PermanentReason.INVALID_DEVICE);
                    assertThat(store.stillEligible(delivery)).isFalse();
                } else store.finish(delivery,"SENT",Instant.now(),null);
            }
            assertThat(scalar(migration,"select count(*) from notification.device where enabled")).isZero();
            execute(migration,"update identity.resource_grant set enabled=false where id=?",grant);
            assertThat(store.history(session,0,100).items()).isEmpty();
        }
    }

    @Test
    void concurrentRecipientsGetCommitOrderedCursorsAndCompensationPages() throws Exception {
        try (var fixture=new Fixture(); var migration=migrationConnection()) {
            UUID grant=notificationGrants(fixture,migration);
            var source=new DriverManagerDataSource(url,appUser,appPassword);
            var store=new NotificationStore(new JdbcTemplate(source),new TransactionTemplate(new JdbcTransactionManager(source)));
            var template=new NotificationSettings.Template("Test notice","Test only.");
            try (var executor=java.util.concurrent.Executors.newFixedThreadPool(2)) {
                var first=executor.submit(() -> store.consume(notificationEvent(fixture,UUID.randomUUID()),"one",template));
                var second=executor.submit(() -> store.consume(notificationEvent(fixture,UUID.randomUUID()),"two",template));
                assertThat(first.get(10,java.util.concurrent.TimeUnit.SECONDS)).isTrue();
                assertThat(second.get(10,java.util.concurrent.TimeUnit.SECONDS)).isTrue();
            }
            var session=new NotificationModels.Session(fixture.company[0],fixture.actor[0],grant,AccessSnapshot.Realm.CUSTOMER,null);
            var page=store.history(session,0,1); assertThat(page.hasMore()).isTrue(); assertThat(page.nextCursor()).isEqualTo(1);
            var next=store.history(session,page.nextCursor(),1); assertThat(next.hasMore()).isFalse(); assertThat(next.items().getFirst().cursor()).isEqualTo(2);
            assertThat(next.nextCursor()).isEqualTo(2);
        }
    }

    private static DomainEvent notificationEvent(Fixture fixture,UUID id) {
        return new DomainEvent(id,1,"test.activity",fixture.company[0],UUID.randomUUID(),fixture.customer[0],fixture.branch[0],
                List.of(fixture.actor[0],fixture.actor[1]),Map.of(),Instant.now());
    }
    private static UUID notificationGrants(Fixture fixture,Connection migration) throws SQLException {
        UUID role=UUID.randomUUID(),grant=UUID.randomUUID();
        execute(migration,"update identity.company_member set member_kind='CUSTOMER' where company_id=? and user_id=?",fixture.company[0],fixture.actor[0]);
        execute(migration,"insert into identity.role(company_id,id,code) values (?,?,'NOTIFICATION TEST ONLY')",fixture.company[0],role);
        execute(migration,"insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,'notification:read'),(?,?,'notification:device')",fixture.company[0],role,fixture.company[0],role);
        execute(migration,"insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",fixture.company[0],fixture.actor[0],role);
        execute(migration,"insert into identity.resource_grant(id,company_id,user_id,scope,customer_id) values (?,?,?,'BRANCH',?)",grant,fixture.company[0],fixture.actor[0],fixture.customer[0]);
        execute(migration,"insert into identity.grant_branch(grant_id,company_id,customer_id,branch_id) values (?,?,?,?)",grant,fixture.company[0],fixture.customer[0],fixture.branch[0]);
        return grant;
    }

    @Test
    void applicationStartsWithReadOnlyRoleAndDatabaseReadiness() throws Exception {
        try (var context = new SpringApplicationBuilder(HttManagementApiApplication.class).run(
                "--spring.profiles.active=database", "--server.address=127.0.0.1", "--server.port=0",
                "--spring.datasource.url=" + url, "--spring.datasource.username=" + appUser,
                "--spring.datasource.password=" + appPassword,
                "--spring.flyway.placeholders.runtime_role=" + appUser)) {
            try (var connection = context.getBean(DataSource.class).getConnection()) {
                assertThat(connection.getMetaData().getUserName()).isEqualTo(appUser);
            }
            assertThat(context.containsBean("entityManagerFactory")).isTrue();
            int port = context.getEnvironment().getRequiredProperty("local.server.port", Integer.class);
            try (var client = HttpClient.newHttpClient()) {
                var response = client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port
                        + "/actuator/health/readiness")).GET().build(), HttpResponse.BodyHandlers.ofString());
                assertThat(response.statusCode()).isEqualTo(200);
                assertThat(response.body()).isEqualTo("{\"status\":\"UP\"}");
            }
        }
    }

    private static void prepareDedicatedDatabase() throws Exception {
        url = required("HTT_DB_URL");
        var address = URI.create(url.substring("jdbc:".length()));
        if (!url.startsWith("jdbc:postgresql://") || !"192.168.10.174".equals(address.getHost())
                || address.getPort() != 5432 || !"/htt_management_validation".equals(address.getPath())) {
            throw new IllegalArgumentException("Dedicated tests only accept the authorized htt_management_validation database.");
        }
        appUser = required("HTT_DB_USERNAME");
        appPassword = required("HTT_DB_PASSWORD");
        migrationUser = required("HTT_DB_MIGRATION_USERNAME");
        migrationPassword = required("HTT_DB_MIGRATION_PASSWORD");
        if (!appUser.equals("htt_management_validation_app") || !migrationUser.equals("htt_management_validation_migrator")) {
            throw new IllegalArgumentException("Dedicated validation credentials do not match the target.");
        }
        try (var connection = migrationConnection(); var statement = connection.createStatement();
                var result = statement.executeQuery("SELECT shobj_description(oid, 'pg_database') FROM pg_database "
                        + "WHERE datname = current_database()")) {
            result.next();
            assertThat(result.getString(1)).isEqualTo("htt-management-api dedicated validation; synthetic data only");
        }
    }

    private static void prepareContainer() throws Exception {
        var factory = DockerClientFactory.instance();
        var endpoint = factory.getTransportConfig().getDockerHost();
        boolean localSocket = ("unix".equals(endpoint.getScheme()) && endpoint.getHost() == null)
                || ("npipe".equals(endpoint.getScheme()) && endpoint.getHost() == null
                    && endpoint.getPath().startsWith("//./pipe/"));
        if ((!localSocket && !isLoopback(endpoint.getHost())) || !isLoopback(factory.dockerHostIpAddress())) {
            throw new IllegalStateException("Container tests require local Docker and a loopback database host.");
        }
        container = new PostgreSQLContainer("postgres:17-alpine")
                .withDatabaseName("htt_baseline_test").withUsername("htt_test_admin").withPassword("test-only");
        container.start();
        url = container.getJdbcUrl();
        appUser = "htt_test_app";
        appPassword = UUID.randomUUID().toString();
        migrationUser = "htt_test_migrator";
        migrationPassword = UUID.randomUUID().toString();
        try (var admin = DriverManager.getConnection(url, container.getUsername(), container.getPassword())) {
            execute(admin, "CREATE ROLE " + appUser + " LOGIN PASSWORD '" + appPassword + "'");
            execute(admin, "CREATE ROLE " + migrationUser + " LOGIN PASSWORD '" + migrationPassword + "'");
            execute(admin, "ALTER DATABASE htt_baseline_test OWNER TO " + migrationUser);
            execute(admin, "REVOKE ALL ON DATABASE htt_baseline_test FROM PUBLIC");
            execute(admin, "GRANT CONNECT ON DATABASE htt_baseline_test TO " + appUser);
            execute(admin, "REVOKE ALL ON SCHEMA public FROM PUBLIC");
            execute(admin, "CREATE SCHEMA platform AUTHORIZATION " + migrationUser);
        }
    }

    private static Flyway migrations(String user, String password) {
        return Flyway.configure().dataSource(url, user, password).defaultSchema("platform")
                .createSchemas(false).cleanDisabled(true).baselineOnMigrate(false).validateMigrationNaming(true)
                .placeholders(Map.of("runtime_role", appUser)).load();
    }

    private static Connection migrationConnection() throws SQLException { return DriverManager.getConnection(url, migrationUser, migrationPassword); }
    private static Connection appConnection() throws SQLException { return DriverManager.getConnection(url, appUser, appPassword); }
    private static long count(Connection connection, String table) throws SQLException { return scalar(connection, "SELECT count(*) FROM " + table); }

    private static long scalar(Connection connection, String sql) throws SQLException {
        try (var statement = connection.createStatement(); var result = statement.executeQuery(sql)) {
            result.next();
            return result.getLong(1);
        }
    }

    private static void setContext(Connection connection, UUID company, UUID actor) throws SQLException {
        execute(connection, "SELECT set_config('htt.company_id', ?, true), set_config('htt.actor_id', ?, true)", company.toString(), actor.toString());
    }

    private static void execute(Connection connection, String sql, Object... parameters) throws SQLException {
        try (var statement = connection.prepareStatement(sql)) {
            for (int i = 0; i < parameters.length; i++) { statement.setObject(i + 1, parameters[i]); }
            statement.execute();
        }
    }

    private static void expectSqlState(Connection connection, String expected, String sql, Object... parameters) throws SQLException {
        var savepoint = connection.setSavepoint();
        try {
            assertThatThrownBy(() -> execute(connection, sql, parameters)).isInstanceOfSatisfying(SQLException.class,
                    exception -> assertThat(exception.getSQLState()).isEqualTo(expected));
        } finally { connection.rollback(savepoint); }
    }

    private static boolean isLoopback(String host) {
        return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host) || "[::1]".equals(host);
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException("Missing environment variable " + name); }
        return value;
    }

    @Test
    void sharedInventoryReadersSeeTheSameCommittedWarehouseBalance() throws Exception {
        try (var fixture = new Fixture(); var writer = migrationConnection()) {
            execute(writer, "INSERT INTO inventory.stock_balance(company_id,product_id,warehouse_id,base_unit_id,on_hand,reserved,damaged) VALUES (?,?,?,?,12,2,1)",
                    fixture.company[0], fixture.product[0], fixture.warehouse[0], fixture.unit[0]);
            var jdbc = new JdbcTemplate(new DriverManagerDataSource(url, appUser, appPassword));
            var query = new InventorySource.Query(fixture.company[0], fixture.product[0], Set.of(fixture.warehouse[0]));
            // Three consumers of the same source, not an assertion that the three frontend apps are connected.
            var readers = List.of(new PostgresInventorySource(jdbc, Clock.systemUTC()),
                    new PostgresInventorySource(jdbc, Clock.systemUTC()), new PostgresInventorySource(jdbc, Clock.systemUTC()));
            for (var reader : readers) assertThat(readStock(jdbc, reader, fixture, query).warehouses().getFirst().available()).isEqualByComparingTo("9");
            writer.setAutoCommit(false);
            execute(writer, """
                    WITH changed AS (
                      UPDATE inventory.stock_balance SET on_hand=on_hand-2 WHERE company_id=? AND product_id=? AND warehouse_id=? AND version=1
                      RETURNING *)
                    INSERT INTO inventory.stock_movement(company_id,product_id,warehouse_id,base_unit_id,base_unit_code,movement_type,
                      on_hand_delta,on_hand_after,reserved_after,damaged_after,balance_version,source_type,source_id,source_line_id,idempotency_key,actor_id,reason)
                    SELECT company_id,product_id,warehouse_id,base_unit_id,'TEST','ISSUE',-2,on_hand,reserved,damaged,version,
                      'TEST_ONLY',gen_random_uuid(),gen_random_uuid(),'test-issue',?,'Synthetic posting transaction' FROM changed
                    """, fixture.company[0], fixture.product[0], fixture.warehouse[0], fixture.actor[0]);
            assertThat(readStock(jdbc, readers.getFirst(), fixture, query).warehouses().getFirst().available()).isEqualByComparingTo("9");
            writer.commit();
            for (var reader : readers) assertThat(readStock(jdbc, reader, fixture, query).warehouses().getFirst().available()).isEqualByComparingTo("7");
            assertThat(scalar(writer, "SELECT count(*) FROM inventory.stock_movement WHERE idempotency_key='test-issue'")).isEqualTo(1);
            expectSqlState(writer, "23505", "INSERT INTO inventory.stock_movement SELECT gen_random_uuid(),company_id,product_id,warehouse_id,base_unit_id,base_unit_code,movement_type,on_hand_delta,reserved_delta,damaged_delta,on_hand_after,reserved_after,damaged_after,balance_version,source_type,source_id,source_line_id,idempotency_key,actor_id,reason,occurred_at FROM inventory.stock_movement WHERE idempotency_key='test-issue'");
            writer.rollback();
        }
    }

    @Test
    void inventoryUnknownZeroAndCompanyIsolationAreDistinct() throws Exception {
        try (var fixture = new Fixture(); var writer = migrationConnection()) {
            var jdbc = new JdbcTemplate(new DriverManagerDataSource(url, appUser, appPassword));
            var reader = new PostgresInventorySource(jdbc, Clock.systemUTC());
            var query = new InventorySource.Query(fixture.company[0], fixture.product[0], Set.of(fixture.warehouse[0]));
            var unknown = readStock(jdbc, reader, fixture, query).warehouses().getFirst();
            assertThat(unknown.knowledge()).isEqualTo(InventoryAvailability.Knowledge.UNKNOWN);
            assertThat(unknown.available()).isNull();
            execute(writer, "INSERT INTO inventory.stock_balance(company_id,product_id,warehouse_id,base_unit_id,on_hand) VALUES (?,?,?,?,0)",
                    fixture.company[0], fixture.product[0], fixture.warehouse[0], fixture.unit[0]);
            var zero = readStock(jdbc, reader, fixture, query).warehouses().getFirst();
            assertThat(zero.knowledge()).isEqualTo(InventoryAvailability.Knowledge.KNOWN);
            assertThat(zero.available()).isEqualByComparingTo("0");
            assertThatThrownBy(() -> readStock(jdbc, reader, fixture,
                    new InventorySource.Query(fixture.company[1], fixture.product[1], Set.of(fixture.warehouse[1]))))
                    .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
            assertThatThrownBy(() -> readStock(jdbc, reader, fixture,
                    new InventorySource.Query(fixture.company[0], fixture.product[0], Set.of(fixture.warehouse[0], fixture.warehouse[1]))))
                    .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
            assertThatThrownBy(() -> reader.read(query)).isInstanceOf(IllegalStateException.class);
            try (var runtime = appConnection()) {
                runtime.setAutoCommit(false);
                setContext(runtime, fixture.company[0], fixture.actor[0]);
                expectSqlState(runtime, "42501", "UPDATE inventory.stock_balance SET on_hand=999");
                expectSqlState(runtime, "42501", "DELETE FROM inventory.stock_movement");
                runtime.rollback();
            }
        }
    }

    @Test
    void inventoryConstraintsPreventCrossCompanyQuantitiesOversellingAndUnitDrift() throws Exception {
        try (var fixture = new Fixture(); var writer = migrationConnection()) {
            writer.setAutoCommit(false);
            expectSqlState(writer, "23503", "INSERT INTO inventory.stock_balance(company_id,product_id,warehouse_id,base_unit_id,on_hand) VALUES (?,?,?,?,5)",
                    fixture.company[0], fixture.product[0], fixture.warehouse[1], fixture.unit[0]);
            execute(writer, "INSERT INTO inventory.stock_balance(company_id,product_id,warehouse_id,base_unit_id,on_hand,reserved) VALUES (?,?,?,?,5,2)",
                    fixture.company[0], fixture.product[0], fixture.warehouse[0], fixture.unit[0]);
            expectSqlState(writer, "23514", "UPDATE inventory.stock_balance SET on_hand=1 WHERE company_id=?", fixture.company[0]);
            expectSqlState(writer, "23514", "UPDATE inventory.stock_balance SET damaged=4 WHERE company_id=?", fixture.company[0]);
            expectSqlState(writer, "23514", "UPDATE inventory.stock_balance SET base_unit_id=? WHERE company_id=?", fixture.unit[1], fixture.company[0]);
            UUID boxUnit = UUID.randomUUID();
            execute(writer, "INSERT INTO catalog.unit_of_measure(id,company_id,code,name) VALUES (?,?,'BOX','Test box')", boxUnit, fixture.company[0]);
            execute(writer, "INSERT INTO catalog.product_unit(company_id,product_id,unit_id,base_unit_id,conversion_to_base,quantity_step) VALUES (?,?,?,?,2.2,1)",
                    fixture.company[0], fixture.product[0], boxUnit, fixture.unit[0]);
            expectSqlState(writer, "23514", "INSERT INTO catalog.product_unit(company_id,product_id,unit_id,base_unit_id,conversion_to_base,quantity_step) VALUES (?,?,?,?,2,1)",
                    fixture.company[0], fixture.product[0], fixture.unit[0], fixture.unit[0]);
            expectSqlState(writer, "23503", "UPDATE catalog.product SET base_unit_id=? WHERE id=?", boxUnit, fixture.product[0]);
            writer.rollback();
        }
    }

    private static InventoryAvailability readStock(JdbcTemplate jdbc, PostgresInventorySource source, Fixture fixture, InventorySource.Query query) {
        var transaction = new TransactionTemplate(new JdbcTransactionManager(jdbc.getDataSource()));
        return transaction.execute(status -> {
            jdbc.queryForObject("SELECT set_config('htt.company_id',?,true)", String.class, fixture.company[0].toString());
            jdbc.queryForObject("SELECT set_config('htt.actor_id',?,true)", String.class, fixture.actor[0].toString());
            return source.read(query);
        });
    }

    @Test
    void customerManagementHttpTransactionsScopesAndVersions() throws Exception {
        UUID role=UUID.randomUUID(),grant=UUID.randomUUID();
        var json=new JsonMapper();
        try(var fixture=new Fixture();var writer=migrationConnection()) {
            execute(writer,"update identity.company_member set member_kind='MANAGEMENT' where company_id=? and user_id=?",fixture.company[0],fixture.actor[0]);
            execute(writer,"insert into crm.customer_workspace(company_id,region,currency) values (?,'VIC','AUD')",fixture.company[0]);
            execute(writer,"insert into identity.external_identity(issuer,subject,user_id,realm) values ('https://staff.example.invalid',?,?,'STAFF')",fixture.actor[0].toString(),fixture.actor[0]);
            execute(writer,"insert into identity.role(company_id,id,code) values (?,?,'CUSTOMER MANAGEMENT TEST ONLY')",fixture.company[0],role);
            for(String action:List.of("customer:read","customer:create","customer:update","customer:status","customer:account:create","customer:account:status","customer:account:reset"))
                execute(writer,"insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,?)",fixture.company[0],role,action);
            execute(writer,"insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",fixture.company[0],fixture.actor[0],role);
            execute(writer,"insert into identity.resource_grant(id,company_id,user_id,scope) values (?,?,?,'COMPANY')",grant,fixture.company[0],fixture.actor[0]);
            try(var application=new SpringApplicationBuilder(PortalTokens.class,HttManagementApiApplication.class).run(
                    "--spring.profiles.active=database","--server.port=0","--server.address=127.0.0.1","--logging.level.root=WARN",
                    "--spring.datasource.url="+url,"--spring.datasource.username="+appUser,"--spring.datasource.password="+appPassword,
                    "--spring.flyway.placeholders.runtime_role="+appUser,"--htt.auth.enabled=true","--htt.customers.enabled=true",
                    "--htt.auth.staff.issuer=https://staff.example.invalid","--htt.auth.staff.audience=staff-api","--htt.auth.staff.jwk-set-uri=https://staff.example.invalid/certs",
                    "--htt.auth.portal.issuer=https://portal.example.invalid","--htt.auth.portal.audience=portal-api","--htt.auth.portal.jwk-set-uri=https://portal.example.invalid/certs",
                    "--htt.portal.login.client-id=htt-api-swagger","--htt.portal.login.redirect-uris=http://localhost:8070/swagger-ui/oauth2-redirect.html");
                    var client=HttpClient.newHttpClient()) {
                String origin="http://127.0.0.1:"+application.getEnvironment().getRequiredProperty("local.server.port");
                String token=PortalTokens.token(fixture.actor[0],true), base="/api/v1/customers";
                execute(writer,"update crm.customer set business_id='cus_001' where id=?",fixture.customer[0]);
                var legacy=json.readTree(customerHttp(client,origin,token,fixture.company[0],"GET",base+"/cus_001",null).body());
                assertThat(legacy.path("id").asString()).isEqualTo("cus_001");
                assertThat(legacy.path("code").asString()).isEqualTo("TEST");
                assertThat(legacy.path("primaryContactId").isNull()).isTrue();
                String location="loc_"+UUID.randomUUID(),contact="con_"+UUID.randomUUID();
                String body="""
                    {"businessName":"Test retailer","businessType":"Flooring Retailer","status":"ACTIVE","abn":"12 345 678 901",
                    "creditLimit":"1200.50","currency":"AUD","paymentTermsType":"DAY_OF_MONTH","paymentTermsDays":31,
                    "website":"www.example.invalid","billingAddress":{"addressLine1":"1 Test","suburb":"Melbourne","state":"VIC","postcode":"3000","country":"Australia"},
                    "locations":[{"id":"%s","name":"Delivery","addressLine1":"2 Test","suburb":"Melbourne","state":"VIC","postcode":"3000","country":"Australia"}],
                    "contacts":[{"id":"%s","firstName":"Test","lastName":"Contact","email":"test@example.invalid","locationId":"%s"}]}
                    """.formatted(location,contact,location).strip();
                var created=customerHttp(client,origin,token,fixture.company[0],"POST",base,body);
                assertThat(created.statusCode()).as(created.body()).isEqualTo(201);
                var saved=json.readTree(created.body());String id=saved.path("id").asString();
                assertThat(saved.path("primaryLocationId").asString()).isEqualTo(location);
                assertThat(saved.path("primaryContactId").asString()).isEqualTo(contact);
                var subjectReply=customerHttp(client,origin,token,fixture.company[0],"GET",base+"/"+id+"/subjects",null);
                assertThat(subjectReply.statusCode()).as(subjectReply.body()).isEqualTo(200);
                var subjects=json.readTree(subjectReply.body());assertThat(subjects.size()).isEqualTo(2);
                assertThat(subjects.get(0).path("type").asString()).isEqualTo("COMPANY");
                assertThat(subjects.get(0).path("id").asString()).isEqualTo(id);
                assertThat(subjects.get(1).path("type").asString()).isEqualTo("CONTACT");
                assertThat(subjects.get(1).path("id").asString()).isEqualTo(contact);
                assertThat(subjects.get(1).path("parentCustomerId").asString()).isEqualTo(id);
                assertThat(customerHttp(client,origin,null,fixture.company[0],"GET",base+"/"+id+"/subjects",null).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,token,fixture.company[1],"GET",base+"/"+id+"/subjects",null).statusCode()).isEqualTo(403);
                assertThat(saved.path("creditLimit").asString()).isEqualTo("1200.50");
                assertThat(saved.path("currentBalance").asString()).isEqualTo("0.00");
                assertThat(saved.path("code").asString()).startsWith("VIC-CUST-");
                var examples=json.readTree(java.nio.file.Files.readString(java.nio.file.Path.of("docs/examples/customer-management-samples.json")));
                int exampleLocations=0,exampleContacts=0;
                assertThat(examples.path("customers").size()).isEqualTo(5);
                for(var sample:examples.path("customers")) {
                    var sampleReply=customerHttp(client,origin,token,fixture.company[0],"POST",base,sample.path("request").toString());
                    assertThat(sampleReply.statusCode()).as(sampleReply.body()).isEqualTo(201);
                    var sampleSaved=json.readTree(sampleReply.body());
                    exampleLocations+=sampleSaved.path("locations").size();exampleContacts+=sampleSaved.path("contacts").size();
                    assertThat(sampleSaved.path("pricingTier").asString()).isEqualTo("STANDARD");
                    assertThat(sampleSaved.path("creditHold").asBoolean()).isFalse();
                    for(var sampleContact:sampleSaved.path("contacts")) assertThat(sampleContact.path("isAccounting").asBoolean()).isFalse();
                    if(!sample.path("request").has("billingAddress")) assertThat(sampleSaved.path("billingAddress").isNull()).isTrue();
                }
                assertThat(exampleLocations).isEqualTo(6);assertThat(exampleContacts).isEqualTo(7);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"GET",base+"/"+id,null).statusCode()).isEqualTo(200);
                assertThat(json.readTree(customerHttp(client,origin,token,fixture.company[0],"GET",base,null).body()).size()).isGreaterThanOrEqualTo(1);

                String update="{\"businessName\":\"Changed\",\"businessType\":\"Builder\",\"version\":1,\"creditLimit\":\"0.00\"}";
                var updated=customerHttp(client,origin,token,fixture.company[0],"PUT",base+"/"+id,update);
                assertThat(updated.statusCode()).as(updated.body()).isEqualTo(200);
                assertThat(json.readTree(updated.body()).path("contacts").size()).isEqualTo(1);
                assertThat(json.readTree(updated.body()).path("locations").size()).isEqualTo(1);
                assertThat(json.readTree(updated.body()).path("billingAddress").isNull()).isFalse();
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PUT",base+"/"+id,update).statusCode()).isEqualTo(409);
                String path=base+"/"+id;
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PATCH",path+"/status","{\"version\":2,\"status\":\"ON_HOLD\"}").statusCode()).isEqualTo(200);
                String locationBody="{\"version\":3,\"id\":\"loc_second\",\"name\":\"Second\",\"addressLine1\":\"3 Test\",\"suburb\":\"Melbourne\",\"state\":\"VIC\",\"postcode\":\"3000\",\"country\":\"Australia\",\"isPrimary\":true}";
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",path+"/locations",locationBody).statusCode()).isEqualTo(201);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PUT",path+"/locations/loc_second",locationBody.replace("\"version\":3","\"version\":4")).statusCode()).isEqualTo(200);
                String person="{\"version\":5,\"id\":\"con_second\",\"firstName\":\"Finance\",\"isAccounting\":true}";
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",path+"/contacts",person).statusCode()).isEqualTo(201);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PUT",path+"/contacts/con_second",person.replace("\"version\":5","\"version\":6")).statusCode()).isEqualTo(200);

                String race="{\"version\":7,\"status\":\"ACTIVE\"}";
                var raceA=java.util.concurrent.CompletableFuture.supplyAsync(()->{
                    try{return customerHttp(client,origin,token,fixture.company[0],"PATCH",path+"/status",race).statusCode();}
                    catch(Exception e){throw new RuntimeException(e);}});
                var raceB=java.util.concurrent.CompletableFuture.supplyAsync(()->{
                    try{return customerHttp(client,origin,token,fixture.company[0],"PATCH",path+"/status",race).statusCode();}
                    catch(Exception e){throw new RuntimeException(e);}});
                assertThat(List.of(raceA.get(),raceB.get())).containsExactlyInAnyOrder(200,409);
                var duplicate=customerHttp(client,origin,token,fixture.company[0],"POST",base,body);
                assertThat(duplicate.statusCode()).as(duplicate.body()).isEqualTo(409);
                assertThat(json.readTree(customerHttp(client,origin,token,fixture.company[0],"GET",base+"?search=Test%20retailer",null).body()).size()).isZero();

                for(String bad:List.of(body.replace("1200.50","-1"),body.replace("Flooring Retailer","Unknown"),body.replace("31","32"),
                        body.replace("\"status\":\"ACTIVE\"","\"status\":\"UNKNOWN\""),body.replace("\"country\":\"Australia\"","\"country\":\"\""),
                        body.substring(0,body.length()-1)+",\"currentBalance\":9}"))
                    assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",base,bad).statusCode()).isEqualTo(400);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"GET",base+"?limit=0",null).statusCode()).isEqualTo(400);
                writer.setAutoCommit(false);
                try {
                    expectSqlState(writer,"23505","update crm.customer_location set is_primary=true where business_id=?",location);
                    expectSqlState(writer,"23505","update crm.customer_contact set is_accounting=true where business_id=?",contact);
                    UUID foreignLocation=UUID.randomUUID();
                    execute(writer,"insert into crm.customer_location(id,business_id,company_id,customer_id,name,address_line1,suburb,state,postcode,country) values (?,?,?,?,'Foreign','1 Test','Test','VIC','3000','AU')",
                            foreignLocation,"loc_"+foreignLocation,fixture.company[0],fixture.customer[0]);
                    expectSqlState(writer,"23503","update crm.customer_contact set location_id=? where business_id=?",foreignLocation,contact);
                } finally { writer.rollback();writer.setAutoCommit(true); }
                String parallelBody="{\"businessName\":\"Parallel\",\"businessType\":\"Builder\"}";
                var parallelA=java.util.concurrent.CompletableFuture.supplyAsync(()->{
                    try{return customerHttp(client,origin,token,fixture.company[0],"POST",base,parallelBody);}catch(Exception e){throw new RuntimeException(e);}});
                var parallelB=java.util.concurrent.CompletableFuture.supplyAsync(()->{
                    try{return customerHttp(client,origin,token,fixture.company[0],"POST",base,parallelBody);}catch(Exception e){throw new RuntimeException(e);}});
                var resultA=parallelA.get();var resultB=parallelB.get();
                assertThat(resultA.statusCode()).isEqualTo(201);assertThat(resultB.statusCode()).isEqualTo(201);
                assertThat(json.readTree(resultA.body()).path("code").asString()).isNotEqualTo(json.readTree(resultB.body()).path("code").asString());
                String accountPath=path+"/accounts";
                UUID operation=UUID.randomUUID();
                String mainRequest="{\"accountType\":\"CUSTOMER\",\"loginName\":\"Primary@Example.Invalid\",\"email\":\"primary@example.invalid\",\"permissions\":[\"customer:read\",\"branch:read\"]}";
                var mainReply=customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,mainRequest,operation);
                assertThat(mainReply.statusCode()).as(mainReply.body()).isEqualTo(201);
                String account=json.readTree(mainReply.body()).path("id").asString();
                assertThat(mainReply.body()).doesNotContain("password_hash","clientSecret","subject");
                assertThat(json.readTree(mainReply.body()).path("loginName").asString()).isEqualTo("primary@example.invalid");
                assertThat(json.readTree(customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,mainRequest,operation).body()).path("id").asString()).isEqualTo(account);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,mainRequest.replace("Primary@","Other@"),operation).statusCode()).isEqualTo(409);
                String personRequest="{\"accountType\":\"CONTACT\",\"contactId\":\""+contact+"\",\"loginName\":\"contact@example.invalid\",\"permissions\":[\"branch:read\"]}";
                var personReply=customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,personRequest,UUID.randomUUID());
                assertThat(personReply.statusCode()).as(personReply.body()).isEqualTo(201);
                String personAccount=json.readTree(personReply.body()).path("id").asString();
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,personRequest,UUID.randomUUID()).statusCode()).isEqualTo(409);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",accountPath,personRequest.replace("branch:read","order:create"),UUID.randomUUID()).statusCode()).isEqualTo(400);
                UUID mainSubject,personSubject;
                try(var query=writer.prepareStatement("select subject from identity.customer_account where business_id=?")) {
                    query.setString(1,account);try(var r=query.executeQuery()){r.next();mainSubject=UUID.fromString(r.getString(1));}
                    query.setString(1,personAccount);try(var r=query.executeQuery()){r.next();personSubject=UUID.fromString(r.getString(1));}
                }
                String mainToken=PortalTokens.token(mainSubject),personToken=PortalTokens.token(personSubject);
                execute(writer,"update crm.customer set business_status='INACTIVE',credit_hold=true where business_id=?",id);
                assertThat(customerHttp(client,origin,mainToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null).statusCode()).isEqualTo(200);
                var personMe=customerHttp(client,origin,personToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null);
                assertThat(json.readTree(personMe.body()).path("contactId").asString()).isEqualTo(contact);
                assertThat(json.readTree(personMe.body()).path("customerSubjectId").asString()).isEqualTo(contact);
                var wrongRealm=customerHttp(client,origin,personToken,fixture.company[0],"GET",path,null);
                assertThat(wrongRealm.statusCode()).isEqualTo(401);deleteRequestAudit(writer,wrongRealm);
                String oidc="{\"redirectUri\":\"http://localhost:8070/swagger-ui/oauth2-redirect.html\",\"state\":\""+"s".repeat(40)+"\",\"codeChallenge\":\""+"c".repeat(43)+"\"}";
                assertThat(customerHttp(client,origin,null,fixture.company[0],"GET","/api/portal/v1/auth/config",null).statusCode()).isEqualTo(200);
                for(String action:List.of("login","forgot-password","reset-password")) {
                    var flow=customerHttp(client,origin,null,fixture.company[0],"POST","/api/portal/v1/auth/"+action,oidc);
                    assertThat(flow.statusCode()).as(flow.body()).isEqualTo(200);
                    assertThat(json.readTree(flow.body()).path("authorizationUrl").asString()).contains("code_challenge_method=S256","state=");
                    assertThat(json.readTree(flow.body()).path("completed").asBoolean()).isFalse();
                }
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/portal/v1/auth/login",oidc.replace("localhost:8070","evil.invalid")).statusCode()).isEqualTo(400);
                assertThat(customerHttp(client,origin,mainToken,fixture.company[0],"POST","/api/portal/v1/auth/change-password",oidc).body()).contains("kc_action=UPDATE_PASSWORD");
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PATCH",accountPath+"/"+account+"/status","{\"version\":1,\"status\":\"DISABLED\"}").statusCode()).isEqualTo(200);
                var stopped=customerHttp(client,origin,mainToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null);
                assertThat(stopped.statusCode()).isEqualTo(401);deleteRequestAudit(writer,stopped);
                assertThat(customerHttp(client,origin,personToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null).statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PATCH",accountPath+"/"+account+"/status","{\"version\":1,\"status\":\"ACTIVE\"}").statusCode()).isEqualTo(409);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PATCH",accountPath+"/"+account+"/status","{\"version\":2,\"status\":\"ACTIVE\"}").statusCode()).isEqualTo(200);
                Instant freshIssuedAt;
                try(var q=writer.prepareStatement("select u.status,u.tokens_valid_after from identity.user_account u join identity.customer_account a on a.actor_id=u.id where a.business_id=?")) {
                    q.setString(1,account);try(var r=q.executeQuery()){r.next();assertThat(r.getString(1)).isEqualTo("ACTIVE");freshIssuedAt=r.getTimestamp(2).toInstant().plusSeconds(1);}
                }
                mainToken=PortalTokens.token(mainSubject,false,freshIssuedAt);
                assertThat(customerHttp(client,origin,mainToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null).statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",accountPath+"/"+personAccount+"/password-reset","{}").statusCode()).isEqualTo(202);
                assertThat(customerHttp(client,origin,mainToken,fixture.company[0],"POST","/api/portal/v1/auth/logout","{}").statusCode()).isEqualTo(204);
                var loggedOut=customerHttp(client,origin,mainToken,fixture.company[0],"GET","/api/portal/v1/auth/me",null);
                assertThat(loggedOut.statusCode()).isEqualTo(401);deleteRequestAudit(writer,loggedOut);
                var remote=(TestKeycloakAccounts)application.getBean(com.htt.management.identity.KeycloakAccounts.class);
                remote.failRemote=true;
                var pending=customerHttp(client,origin,token,fixture.company[0],"PATCH",accountPath+"/"+account+"/status","{\"version\":3,\"status\":\"DISABLED\"}");
                assertThat(pending.statusCode()).isEqualTo(503);
                var accountList=json.readTree(customerHttp(client,origin,token,fixture.company[0],"GET",accountPath,null).body());
                boolean pendingFound=false;
                for(var entry:accountList) if(entry.path("id").asString().equals(account)) {
                    pendingFound=true;assertThat(entry.path("syncStatus").asString()).isEqualTo("PENDING");assertThat(entry.path("status").asString()).isEqualTo("DISABLED");
                }
                assertThat(pendingFound).isTrue();remote.failRemote=false;
                assertThat(customerHttp(client,origin,token,fixture.company[0],"PATCH",accountPath+"/"+account+"/status","{\"version\":4,\"status\":\"ACTIVE\"}").statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,token,fixture.company[1],"GET",path,null).statusCode()).isEqualTo(403);
                execute(writer,"update identity.resource_grant set scope='CUSTOMER',customer_id=? where id=?",fixture.customer[0],grant);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"GET",path,null).statusCode()).isEqualTo(403);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"GET",base+"?search=Changed",null).body()).isEqualTo("[]");
                for(var call:List.of(new String[]{"PUT",path,update},new String[]{"PATCH",path+"/status","{\"version\":8,\"status\":\"ACTIVE\"}"},
                        new String[]{"POST",path+"/locations",locationBody},new String[]{"PUT",path+"/locations/loc_second",locationBody},
                        new String[]{"POST",path+"/contacts",person},new String[]{"PUT",path+"/contacts/con_second",person},
                        new String[]{"GET",accountPath,null},new String[]{"POST",accountPath,mainRequest},
                        new String[]{"PATCH",accountPath+"/"+account+"/status","{\"version\":5,\"status\":\"ACTIVE\"}"}))
                    assertThat(customerHttp(client,origin,token,fixture.company[0],call[0],call[1],call[2],UUID.randomUUID()).statusCode())
                        .as("scope denied %s %s",call[0],call[1]).isEqualTo(403);
                execute(writer,"update identity.company_member set member_kind='SALES' where company_id=? and user_id=?",fixture.company[0],fixture.actor[0]);
                assertThat(customerHttp(client,origin,token,fixture.company[0],"POST",base,body).statusCode()).isEqualTo(403);
                for(String method:List.of("GET","POST","PUT","PATCH")) {
                    var denied=customerHttp(client,origin,null,fixture.company[0],method,method.equals("POST")?base:path,method.equals("GET")?null:body);
                    assertThat(denied.statusCode()).isEqualTo(401);deleteRequestAudit(writer,denied);
                }
            }
        }
    }
    @Test
    void localPasswordAuthenticationScopesRevocationAndAccountCreation() throws Exception {
        try(var fixture=new Fixture();var writer=migrationConnection()) {
            String password="Test-only long password 42";
            var encoder=new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
            var json=new tools.jackson.databind.ObjectMapper();
            var roles=new UUID[]{UUID.randomUUID(),UUID.randomUUID()};
            for(int i=0;i<2;i++) {
                String realm=i==0?"STAFF":"CUSTOMER",login="local-"+fixture.actor[i]+"@test.invalid";
                execute(writer,"update identity.company_member set member_kind=? where company_id=? and user_id=?",i==0?"MANAGEMENT":"CUSTOMER",fixture.company[i],fixture.actor[i]);
                execute(writer,"insert into identity.external_identity(issuer,subject,user_id,realm) values ('https://identity.htt.invalid/local',?,?,?)",fixture.actor[i].toString(),fixture.actor[i],realm);
                execute(writer,"insert into identity.password_credential(actor_id,login_name,realm,password_hash,issuer,subject) values (?,?,?,?,'https://identity.htt.invalid/local',?)",fixture.actor[i],login,realm,encoder.encode(password),fixture.actor[i].toString());
                execute(writer,"insert into identity.role(company_id,id,code) values (?,?,'LOCAL-TEST')",fixture.company[i],roles[i]);
                execute(writer,"insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",fixture.company[i],fixture.actor[i],roles[i]);
                execute(writer,"insert into identity.role_permission(company_id,role_id,permission_code) select ?,?,code from identity.permission",fixture.company[i],roles[i]);
                if(i==0) {
                    execute(writer,"insert into identity.employee(business_id,company_id,actor_id,display_name) values (?,?,?,'TEST EMPLOYEE')","emp_"+fixture.actor[i],fixture.company[i],fixture.actor[i]);
                    execute(writer,"insert into identity.resource_grant(company_id,user_id,scope) values (?,?,'COMPANY')",fixture.company[i],fixture.actor[i]);
                } else execute(writer,"insert into identity.resource_grant(company_id,user_id,scope,customer_id) values (?,?,'CUSTOMER',?)",fixture.company[i],fixture.actor[i],fixture.customer[i]);
            }
            try(var application=new SpringApplicationBuilder(HttManagementApiApplication.class).run(
                    "--spring.profiles.active=database,development","--server.port=0","--spring.flyway.enabled=false",
                    "--htt.auth.local-enabled=true","--spring.datasource.url="+url,"--spring.datasource.username="+appUser,
                    "--spring.datasource.password="+appPassword,"--logging.level.root=ERROR")) {
                assertThat(application.getBeansOfType(com.htt.management.identity.KeycloakAccounts.class)).isEmpty();
                String origin="http://127.0.0.1:"+application.getEnvironment().getProperty("local.server.port");
                var client=HttpClient.newHttpClient();
                String staffLogin="local-"+fixture.actor[0]+"@test.invalid",customerLogin="local-"+fixture.actor[1]+"@test.invalid";
                String staffBody=json.writeValueAsString(Map.of("email",staffLogin.toUpperCase(java.util.Locale.ROOT),"password",password));
                String portalBody=json.writeValueAsString(Map.of("email",customerLogin,"password",password));
                var staff=customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/user/auth/login",staffBody);
                assertThat(staff.statusCode()).as(staff.body()).isEqualTo(200);
                String staffToken=json.readTree(staff.body()).get("accessToken").asText();
                var portal=customerHttp(client,origin,null,fixture.company[1],"POST","/api/v1/customer/auth/login",portalBody);
                assertThat(portal.statusCode()).as(portal.body()).isEqualTo(200);
                String portalToken=json.readTree(portal.body()).get("accessToken").asText();
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/customer/auth/login",staffBody).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,null,fixture.company[1],"POST","/api/v1/user/auth/login",portalBody).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login",staffBody).statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,null,fixture.company[1],"POST","/api/portal/v1/auth/login",portalBody).statusCode()).isEqualTo(200);
                var schemaReply=client.send(HttpRequest.newBuilder(URI.create(origin+"/v3/api-docs")).GET().build(),HttpResponse.BodyHandlers.ofString());
                assertThat(schemaReply.statusCode()).isEqualTo(200);
                var schema=json.readTree(schemaReply.body()).path("paths");
                assertThat(schema.has("/api/v1/customer/auth/login")).isTrue();
                assertThat(schema.has("/api/v1/user/auth/login")).isTrue();
                assertThat(schema.has("/api/v1/auth/login")).isFalse();
                assertThat(schema.has("/api/portal/v1/auth/login")).isFalse();

                assertThat(scalar(writer,"select count(*) from platform.access_audit where action='auth:login' and outcome='ALLOW' and actor_id='"+fixture.actor[0]+"'::uuid")).isEqualTo(2);
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"GET","/api/v1/me",null).statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,portalToken,fixture.company[1],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(200);
                UUID savedGrant;
                try(var q=writer.prepareStatement("select id from identity.resource_grant where user_id=?")) {
                    q.setObject(1,fixture.actor[1]);try(var r=q.executeQuery()){r.next();savedGrant=r.getObject(1,UUID.class);}
                }
                execute(writer,"update identity.resource_grant set enabled=false where id=?",savedGrant);
                assertThat(customerHttp(client,origin,portalToken,fixture.company[1],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(401);
                execute(writer,"update identity.resource_grant set enabled=true where id=?",savedGrant);
                execute(writer,"insert into identity.company_member(company_id,user_id,member_kind) values (?,?,'CUSTOMER')",fixture.company[0],fixture.actor[1]);
                assertThat(customerHttp(client,origin,portalToken,fixture.company[1],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(401);
                execute(writer,"delete from identity.company_member where company_id=? and user_id=?",fixture.company[0],fixture.actor[1]);
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,portalToken,fixture.company[0],"GET","/api/v1/me",null).statusCode()).isEqualTo(401);
                String customerId;try(var q=writer.prepareStatement("select business_id from crm.customer where id=?")){q.setObject(1,fixture.customer[0]);try(var r=q.executeQuery()){r.next();customerId=r.getString(1);}}
                assertThat(customerHttp(client,origin,portalToken,fixture.company[0],"GET","/api/v1/customers/"+customerId,null).statusCode()).isEqualTo(401);
                String accountPath="/api/v1/customers/"+customerId+"/accounts";
                String accountBody=json.writeValueAsString(Map.of("accountType","CUSTOMER","loginName","new-"+fixture.actor[0]+"@test.invalid","password",password,"permissions",List.of("customer:read")));
                var created=customerHttp(client,origin,staffToken,fixture.company[0],"POST",accountPath,accountBody,UUID.randomUUID());
                assertThat(created.statusCode()).as(created.body()).isEqualTo(201);
                assertThat(json.readTree(created.body()).get("passwordManagedByKeycloak").asBoolean()).isFalse();
                assertThat(created.body()).doesNotContain(password,"passwordHash");
                String childLogin=json.writeValueAsString(Map.of("email","new-"+fixture.actor[0]+"@test.invalid","password",password));
                var child=customerHttp(client,origin,null,fixture.company[0],"POST","/api/portal/v1/auth/login",childLogin);
                assertThat(child.statusCode()).as(child.body()).isEqualTo(200);
                String childToken=json.readTree(child.body()).get("accessToken").asText();
                var childMe=customerHttp(client,origin,childToken,fixture.company[0],"GET","/api/portal/v1/me",null);
                assertThat(childMe.statusCode()).as(childMe.body()).isEqualTo(200);
                var subjectIdentity=customerHttp(client,origin,childToken,fixture.company[0],"GET","/api/portal/v1/auth/customer-subject",null);
                assertThat(subjectIdentity.statusCode()).as(subjectIdentity.body()).isEqualTo(200);
                assertThat(json.readTree(subjectIdentity.body()).path("customerSubjectId").asString()).isEqualTo(customerId);
                assertThat(json.readTree(subjectIdentity.body()).path("accountType").asString()).isEqualTo("CUSTOMER");
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"GET","/api/portal/v1/auth/customer-subject",null).statusCode()).isEqualTo(401);
                // Use a real portal credential on another customer's grant: ABAC, not just realm isolation.
                UUID foreignGrant;
                try(var q=writer.prepareStatement("select id from identity.resource_grant where user_id=?")) {
                    q.setObject(1,fixture.actor[1]);try(var r=q.executeQuery()){r.next();foreignGrant=r.getObject(1,UUID.class);}
                }
                assertThat(portalBranches(client,origin,childToken,fixture.company[1],foreignGrant).statusCode()).isEqualTo(403);
                String contactBusinessId;
                try(var q=writer.prepareStatement("select business_id from crm.customer_contact where customer_id=? limit 1")) {
                    q.setObject(1,fixture.customer[0]);try(var r=q.executeQuery()){r.next();contactBusinessId=r.getString(1);}
                }
                String personPassword="Independent contact password 42",personEmail="person-"+fixture.actor[0]+"@test.invalid";
                String personBody=json.writeValueAsString(Map.of("accountType","CONTACT","contactId",contactBusinessId,"loginName",personEmail,"password",personPassword,"permissions",List.of("customer:read")));
                var personCreated=customerHttp(client,origin,staffToken,fixture.company[0],"POST",accountPath,personBody,UUID.randomUUID());
                assertThat(personCreated.statusCode()).as(personCreated.body()).isEqualTo(201);
                String wrongPassword=json.writeValueAsString(Map.of("email",personEmail,"password",password));
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/portal/v1/auth/login",wrongPassword).statusCode()).isEqualTo(401);
                var personLogin=customerHttp(client,origin,null,fixture.company[0],"POST","/api/portal/v1/auth/login",json.writeValueAsString(Map.of("email",personEmail,"password",personPassword)));
                assertThat(personLogin.statusCode()).as(personLogin.body()).isEqualTo(200);
                String personToken=json.readTree(personLogin.body()).get("accessToken").asText();
                var personIdentity=customerHttp(client,origin,personToken,fixture.company[1],"GET","/api/portal/v1/auth/customer-subject",null);
                assertThat(personIdentity.statusCode()).as(personIdentity.body()).isEqualTo(200);
                assertThat(json.readTree(personIdentity.body()).path("customerSubjectId").asString()).isEqualTo(contactBusinessId);
                assertThat(json.readTree(personIdentity.body()).path("customerId").asString()).isEqualTo(customerId);
                assertThat(json.readTree(personIdentity.body()).path("accountType").asString()).isEqualTo("CONTACT");
                String accountId=json.readTree(created.body()).get("id").asText();
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"PATCH",accountPath+"/"+accountId+"/status","{\"version\":1,\"status\":\"DISABLED\"}").statusCode()).isEqualTo(200);
                assertThat(customerHttp(client,origin,childToken,fixture.company[0],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login",staffBody.replace(password,"wrong-password")).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login","{\"email\":\"invalid\",\"password\":\"x\"}").statusCode()).isEqualTo(400);
                String changed=json.writeValueAsString(Map.of("currentPassword",password,"newPassword","Changed test password 42"));
                assertThat(customerHttp(client,origin,portalToken,fixture.company[1],"POST","/api/portal/v1/auth/change-password",changed).statusCode()).isEqualTo(204);
                assertThat(customerHttp(client,origin,portalToken,fixture.company[1],"GET","/api/portal/v1/me",null).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,null,fixture.company[1],"POST","/api/portal/v1/auth/login",portalBody).statusCode()).isEqualTo(401);
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"POST","/api/v1/auth/logout",null).statusCode()).isEqualTo(204);
                assertThat(customerHttp(client,origin,staffToken,fixture.company[0],"GET","/api/v1/me",null).statusCode()).isEqualTo(401);
                var fresh=customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login",staffBody);
                assertThat(fresh.statusCode()).isEqualTo(200);
                String freshToken=json.readTree(fresh.body()).get("accessToken").asText();
                execute(writer,"update identity.login_session set expires_at=created_at+interval '1 millisecond' where token_hash=?",com.htt.management.identity.LocalAuthentication.digest(freshToken));
                assertThat(customerHttp(client,origin,freshToken,fixture.company[0],"GET","/api/v1/me",null).statusCode()).isEqualTo(401);
                for(int i=0;i<6;i++) customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login",staffBody);
                assertThat(customerHttp(client,origin,null,fixture.company[0],"POST","/api/v1/auth/login",staffBody).statusCode()).isEqualTo(429);
            } finally {
                // Automated isolation is separate from the persistent manual acceptance fixture.
                execute(writer,"delete from identity.login_session where actor_id in (select actor_id from identity.customer_account where company_id in (?,?)) or actor_id in (?,?)",fixture.company[0],fixture.company[1],fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.password_credential where actor_id in (select actor_id from identity.customer_account where company_id in (?,?)) or actor_id in (?,?)",fixture.company[0],fixture.company[1],fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.employee where company_id in (?,?)",fixture.company[0],fixture.company[1]);
                execute(writer,"delete from identity.login_rate_bucket");
            }
        }
    }

    @Test
    void unifiedCustomerSubjectOwnershipAndTransactionRollback() throws Exception {
        try(var fixture=new Fixture();var writer=migrationConnection()) {
            writer.setAutoCommit(false);
            UUID root=UUID.randomUUID(),person=UUID.randomUUID();
            execute(writer,"insert into crm.customer(id,company_id,code,business_name) values (?,?,'SUBJECT-TEST','Subject Test')",root,fixture.company[0]);
            expectSqlState(writer,"23514","update crm.customer set company_id=? where id=?",fixture.company[1],root);
            execute(writer,"insert into crm.customer_contact(id,company_id,customer_id,name) values (?,?,?,'Subject Person')",person,fixture.company[0],root);
            assertThat(scalar(writer,"select count(*) from crm.customer_subject where root_customer_id='"+root+"'::uuid")).isEqualTo(2);
            expectSqlState(writer,"23503","insert into crm.customer_subject(id,company_id,business_id,subject_type,parent_customer_id) values (gen_random_uuid(),?,'test-cross-company','CONTACT',?)",fixture.company[1],root);
            expectSqlState(writer,"23503","insert into crm.customer_subject(id,company_id,business_id,subject_type,parent_customer_id) values (gen_random_uuid(),?,'test-contact-parent','CONTACT',?)",fixture.company[0],person);
            expectSqlState(writer,"23514","update crm.customer_contact set customer_id=? where id=?",fixture.customer[0],person);
            expectSqlState(writer,"23514","update crm.customer_subject set parent_customer_id=? where id=?",fixture.customer[0],person);
            expectSqlState(writer,"23514","update crm.customer_subject set subject_type='COMPANY',parent_customer_id=null where id=?",person);
            expectSqlState(writer,"23503","update crm.customer set company_id=? where id=?",fixture.company[1],root);
            writer.rollback();
            assertThat(scalar(writer,"select count(*) from crm.customer_subject where id in ('"+root+"'::uuid,'"+person+"'::uuid)")).isZero();
            assertThat(scalar(writer,"select count(*) from crm.customer where id='"+root+"'::uuid")).isZero();
            writer.rollback();
        }
    }

    private static HttpResponse<String> customerHttp(HttpClient client,String origin,String token,UUID company,String method,String path,String body)throws Exception {
        return customerHttp(client,origin,token,company,method,path,body,null);
    }
    private static HttpResponse<String> customerHttp(HttpClient client,String origin,String token,UUID company,String method,String path,String body,UUID operation)throws Exception {
        var builder=HttpRequest.newBuilder(URI.create(origin+path)).timeout(java.time.Duration.ofSeconds(15))
                .header("X-Company-Id",company.toString());
        if(token!=null) builder.header("Authorization","Bearer "+token);
        if(body!=null) builder.header("Content-Type","application/json");
        if(operation!=null) builder.header("Idempotency-Key",operation.toString());
        var reply=client.send(builder.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
        reply.headers().firstValue("X-Request-Id").ifPresent(value->CUSTOMER_HTTP_REQUESTS.add(UUID.fromString(value)));
        return reply;
    }

    private static HttpResponse<String> browserHttp(HttpClient client,String origin,String method,String path,String body,String csrf)throws Exception {
        // Each cookie operation follows the documented bootstrap flow, including after an authentication failure.
        if(method.equals("POST")&&csrf!=null&&!csrf.equals("forged")) {
            String prefix=path.substring(0,path.lastIndexOf('/'));
            var bootstrap=browserHttp(client,origin,"GET",prefix+"/csrf",null,null);
            csrf=new tools.jackson.databind.ObjectMapper().readTree(bootstrap.body()).get("csrfToken").asText();
        }
        var request=HttpRequest.newBuilder(URI.create(origin+path)).timeout(java.time.Duration.ofSeconds(15));
        if(body!=null)request.header("Content-Type","application/json");
        if(csrf!=null)request.header("X-HTT-CSRF",csrf);
        var reply=client.send(request.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
        reply.headers().firstValue("X-Request-Id").ifPresent(v->CUSTOMER_HTTP_REQUESTS.add(UUID.fromString(v)));
        return reply;
    }
    private static String refreshCookie(java.net.CookieManager cookies,String name) {
        return cookies.getCookieStore().getCookies().stream().filter(c->c.getName().equals(name)).findFirst().orElseThrow().getValue();
    }
    @Test
    void browserPersistentSessionsRequireCsrfRotateAndRevokeFamilies() throws Exception {
        try(var fixture=new Fixture();var writer=migrationConnection()) {
            var encoder=new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
            var json=new tools.jackson.databind.ObjectMapper();String password="Persistent test password 42";
            UUID portalGrant=UUID.randomUUID();
            for(int i=0;i<2;i++) {
                String realm=i==0?"STAFF":"CUSTOMER";
                execute(writer,"update identity.company_member set member_kind=? where company_id=? and user_id=?",i==0?"MANAGEMENT":"CUSTOMER",fixture.company[i],fixture.actor[i]);
                execute(writer,"insert into identity.external_identity(issuer,subject,user_id,realm) values ('https://identity.htt.invalid/local',?,?,?)",fixture.actor[i].toString(),fixture.actor[i],realm);
                execute(writer,"insert into identity.password_credential(actor_id,login_name,realm,password_hash,issuer,subject) values (?,?,?,?,'https://identity.htt.invalid/local',?)",fixture.actor[i],"browser-"+fixture.actor[i]+"@test.invalid",realm,encoder.encode(password),fixture.actor[i].toString());
                if(i==0)execute(writer,"insert into identity.employee(business_id,company_id,actor_id,display_name) values (?,?,?,'TEST EMPLOYEE')","emp_"+fixture.actor[i],fixture.company[i],fixture.actor[i]);
                else execute(writer,"insert into identity.resource_grant(id,company_id,user_id,scope,customer_id) values (?,?,?,'CUSTOMER',?)",portalGrant,fixture.company[i],fixture.actor[i],fixture.customer[i]);
            }
            try(var application=new SpringApplicationBuilder(HttManagementApiApplication.class).run(
                    "--spring.profiles.active=database,development","--server.port=0","--spring.flyway.enabled=false",
                    "--htt.auth.local-enabled=true","--spring.datasource.url="+url,"--spring.datasource.username="+appUser,
                    "--spring.datasource.password="+appPassword,"--logging.level.root=ERROR")) {
                String origin="http://127.0.0.1:"+application.getEnvironment().getProperty("local.server.port");
                var cookies=new java.net.CookieManager(null,java.net.CookiePolicy.ACCEPT_ALL);
                var client=HttpClient.newBuilder().cookieHandler(cookies).build();
                String base="/api/v1/auth",portal="/api/portal/v1/auth";
                String body=json.writeValueAsString(Map.of("email","browser-"+fixture.actor[0]+"@test.invalid","password",password));
                assertThat(browserHttp(client,origin,"POST",base+"/browser-login",body,null).statusCode()).isEqualTo(403);
                cookies.getCookieStore().removeAll();
                var bootstrap=browserHttp(client,origin,"GET",base+"/csrf",null,null);
                assertThat(bootstrap.statusCode()).as(bootstrap.body()).isEqualTo(200);
                assertThat(bootstrap.headers().allValues("Set-Cookie").toString()).contains("HttpOnly","SameSite=Strict","Path=/");
                String csrf=json.readTree(bootstrap.body()).get("csrfToken").asText();
                assertThat(browserHttp(client,origin,"POST",base+"/browser-login",body,"forged").statusCode()).isEqualTo(403);
                var login=browserHttp(client,origin,"POST",base+"/browser-login",body,csrf);
                assertThat(login.statusCode()).as(login.body()).isEqualTo(200);
                assertThat(login.headers().allValues("Set-Cookie").toString()).contains("HttpOnly","SameSite=Strict","Path=/api/v1/auth","Max-Age=").doesNotContain("Domain=");
                assertThat(login.body()).doesNotContain("htr_",password);
                String token=json.readTree(login.body()).get("accessToken").asText();
                String firstRefresh=refreshCookie(cookies,"htt-staff-refresh");
                assertThat(browserHttp(client,origin,"GET",base+"/me",null,null).statusCode()).isEqualTo(401);
                java.time.Instant fixedDeadline;
                try(var q=writer.prepareStatement("select expires_at,extract(epoch from expires_at-created_at) from identity.refresh_family where actor_id=? and revoked_at is null")) {
                    q.setObject(1,fixture.actor[0]);try(var r=q.executeQuery()){r.next();fixedDeadline=r.getObject(1,java.time.OffsetDateTime.class).toInstant();assertThat(r.getDouble(2)).isBetween(604799d,604801d);}
                }
                execute(writer,"update identity.login_session set expires_at=created_at+interval '1 millisecond' where token_hash=?",com.htt.management.identity.LocalAuthentication.digest(token));
                // A new client has no access token but retains the persistent cookie jar.
                var reopened=HttpClient.newBuilder().cookieHandler(cookies).build();
                assertThat(browserHttp(reopened,origin,"POST",base+"/refresh",null,null).statusCode()).isEqualTo(403);
                var refreshed=browserHttp(reopened,origin,"POST",base+"/refresh",null,csrf);
                assertThat(refreshed.statusCode()).as(refreshed.body()).isEqualTo(200);
                String nextToken=json.readTree(refreshed.body()).get("accessToken").asText();
                assertThat(refreshCookie(cookies,"htt-staff-refresh")).isNotEqualTo(firstRefresh);
                assertThat(customerHttp(client,origin,nextToken,fixture.company[0],"GET",base+"/me",null).statusCode()).isEqualTo(200);
                try(var q=writer.prepareStatement("select expires_at from identity.refresh_family where actor_id=? and revoked_at is null")) {
                    q.setObject(1,fixture.actor[0]);try(var r=q.executeQuery()){r.next();assertThat(r.getObject(1,java.time.OffsetDateTime.class).toInstant()).isEqualTo(fixedDeadline);}
                }
                var auth=application.getBean(com.htt.management.identity.LocalAuthentication.class);
                assertThatThrownBy(()->auth.refresh(firstRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF)).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
                assertThat(customerHttp(client,origin,nextToken,fixture.company[0],"GET",base+"/me",null).statusCode()).isEqualTo(401);
                var replay=browserHttp(client,origin,"POST",base+"/refresh",null,csrf);
                assertThat(replay.statusCode()).isEqualTo(401);assertThat(replay.headers().allValues("Set-Cookie").toString()).contains("Max-Age=0");
                // Concurrent refresh has one winner; reuse then invalidates even the winning access token.
                login=browserHttp(client,origin,"POST",base+"/browser-login",body,csrf);
                assertThat(login.statusCode()).as(login.body()).isEqualTo(200);
                String concurrentRefresh=refreshCookie(cookies,"htt-staff-refresh");
                var gate=new java.util.concurrent.CountDownLatch(1);
                var task=(java.util.function.Supplier<com.htt.management.identity.LocalAuthentication.BrowserSession>)()->{
                    try{gate.await();return auth.refresh(concurrentRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF);}
                    catch(org.springframework.security.authentication.BadCredentialsException denied){return null;}
                    catch(InterruptedException failure){throw new IllegalStateException(failure);}
                };
                var a=java.util.concurrent.CompletableFuture.supplyAsync(task);var b=java.util.concurrent.CompletableFuture.supplyAsync(task);gate.countDown();
                var ar=a.get();var br=b.get();assertThat((ar==null?0:1)+(br==null?0:1)).isLessThanOrEqualTo(1);
                try(var q=writer.prepareStatement("select count(*),count(*) filter(where consumed_at is not null),bool_and(f.revoked_at is not null) from identity.refresh_token t join identity.refresh_family f on f.id=t.family_id where f.id=(select family_id from identity.refresh_token where token_hash=?)")) {
                    q.setString(1,com.htt.management.identity.LocalAuthentication.digest(concurrentRefresh));
                    try(var r=q.executeQuery()){r.next();assertThat(r.getInt(1)).isEqualTo(2);assertThat(r.getInt(2)).isEqualTo(1);assertThat(r.getBoolean(3)).isTrue();}
                }
                if(ar!=null||br!=null) {
                    String winner=(ar==null?br:ar).login().accessToken();
                    assertThat(customerHttp(client,origin,winner,fixture.company[0],"GET",base+"/me",null).statusCode()).isEqualTo(401);
                }
                // Expired persistent family cannot refresh or authorize even a still-live access token.
                login=browserHttp(client,origin,"POST",base+"/browser-login",body,csrf);assertThat(login.statusCode()).isEqualTo(200);
                execute(writer,"update identity.refresh_family set expires_at=created_at+interval '1 millisecond' where actor_id=? and revoked_at is null",fixture.actor[0]);
                assertThat(browserHttp(client,origin,"POST",base+"/refresh",null,csrf).statusCode()).isEqualTo(401);
                // Cookie-only logout works after the access token expires and revokes the whole family.
                login=browserHttp(client,origin,"POST",base+"/browser-login",body,csrf);assertThat(login.statusCode()).isEqualTo(200);
                String logoutToken=json.readTree(login.body()).get("accessToken").asText();String logoutRefresh=refreshCookie(cookies,"htt-staff-refresh");
                execute(writer,"update identity.login_session set expires_at=created_at+interval '1 millisecond' where token_hash=?",com.htt.management.identity.LocalAuthentication.digest(logoutToken));
                assertThat(browserHttp(client,origin,"POST",base+"/browser-logout",null,null).statusCode()).isEqualTo(403);
                var out=browserHttp(client,origin,"POST",base+"/browser-logout",null,csrf);
                assertThat(out.statusCode()).isEqualTo(204);assertThat(out.headers().allValues("Set-Cookie").toString()).contains("Max-Age=0");
                assertThat(customerHttp(client,origin,logoutToken,fixture.company[0],"GET",base+"/me",null).statusCode()).isEqualTo(401);
                assertThatThrownBy(()->auth.refresh(logoutRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF)).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
                // Password changes invalidate every persistent family without relying on cookies being deleted.
                login=browserHttp(client,origin,"POST",base+"/browser-login",body,csrf);assertThat(login.statusCode()).isEqualTo(200);
                String changeToken=json.readTree(login.body()).get("accessToken").asText();String changeRefresh=refreshCookie(cookies,"htt-staff-refresh");
                String change=json.writeValueAsString(Map.of("currentPassword",password,"newPassword","Changed persistent password 42"));
                assertThat(customerHttp(client,origin,changeToken,fixture.company[0],"POST",base+"/change-password",change).statusCode()).isEqualTo(204);
                assertThatThrownBy(()->auth.refresh(changeRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF)).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
                String changedBody=body.replace(password,"Changed persistent password 42");
                login=browserHttp(client,origin,"POST",base+"/browser-login",changedBody,csrf);assertThat(login.statusCode()).isEqualTo(200);
                String bearerLogout=json.readTree(login.body()).get("accessToken").asText();String bearerRefresh=refreshCookie(cookies,"htt-staff-refresh");
                var nativeOut=customerHttp(client,origin,bearerLogout,fixture.company[0],"POST",base+"/logout",null);
                assertThat(nativeOut.statusCode()).isEqualTo(204);assertThat(nativeOut.headers().allValues("Set-Cookie").toString()).contains("Max-Age=0");
                assertThatThrownBy(()->auth.refresh(bearerRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF)).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
                // Portal cookie is isolated from staff; revoked ownership cannot be restored by refresh.
                String portalBody=json.writeValueAsString(Map.of("email","browser-"+fixture.actor[1]+"@test.invalid","password",password));
                var portalLogin=browserHttp(client,origin,"POST",portal+"/browser-login",portalBody,csrf);
                assertThat(portalLogin.statusCode()).as(portalLogin.body()).isEqualTo(200);
                String portalRefresh=refreshCookie(cookies,"htt-portal-refresh");
                assertThatThrownBy(()->auth.refresh(portalRefresh,com.htt.management.identity.AccessSnapshot.Realm.STAFF)).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
                execute(writer,"update identity.resource_grant set enabled=false where id=?",portalGrant);
                assertThat(browserHttp(client,origin,"POST",portal+"/refresh",null,csrf).statusCode()).isEqualTo(401);
                execute(writer,"update identity.resource_grant set enabled=true where id=?",portalGrant);
                portalLogin=browserHttp(client,origin,"POST",portal+"/browser-login",portalBody,csrf);assertThat(portalLogin.statusCode()).isEqualTo(200);
                execute(writer,"update identity.user_account set status='DISABLED' where id=?",fixture.actor[1]);
                assertThat(browserHttp(client,origin,"POST",portal+"/refresh",null,csrf).statusCode()).isEqualTo(401);
                execute(writer,"update identity.refresh_family set created_at=clock_timestamp()-interval '8 days',expires_at=clock_timestamp()-interval '2 days' where id=(select family_id from identity.refresh_token where token_hash=?)",com.htt.management.identity.LocalAuthentication.digest(concurrentRefresh));
                try(var cleanup=writer.createStatement()) {
                    cleanup.execute(java.nio.file.Files.readString(java.nio.file.Path.of("scripts/database/purge-expired-browser-sessions.sql")));
                }
                try(var q=writer.prepareStatement("select count(*) from identity.refresh_token where token_hash=?")) {
                    q.setString(1,com.htt.management.identity.LocalAuthentication.digest(concurrentRefresh));try(var r=q.executeQuery()){r.next();assertThat(r.getInt(1)).isZero();}
                }
                assertThat(scalar(writer,"select count(*) from identity.refresh_family where actor_id='"+fixture.actor[0]+"'::uuid")).isPositive();
            } finally {
                execute(writer,"delete from identity.login_session where actor_id in (?,?)",fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.refresh_token where family_id in (select id from identity.refresh_family where actor_id in (?,?))",fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.refresh_family where actor_id in (?,?)",fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.password_credential where actor_id in (?,?)",fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.employee where actor_id in (?,?)",fixture.actor[0],fixture.actor[1]);
                execute(writer,"delete from identity.login_rate_bucket");
            }
        }
    }

    @Test
    void portalBranchSliceMatchesLegacyProjectionWithRealAuthenticationAndPostgres() throws Exception {
        UUID grant=UUID.randomUUID(), otherGrant=UUID.randomUUID(), companyGrant=UUID.randomUUID(), role=UUID.randomUUID();
        UUID otherCustomer=UUID.randomUUID(), otherBranch=UUID.randomUUID(), extra=UUID.randomUUID(), hidden=UUID.randomUUID(), archived=UUID.randomUUID();
        try (var fixture=new Fixture(); var writer=migrationConnection()) {
            writer.setAutoCommit(false);
            execute(writer,"update identity.company_member set member_kind='CUSTOMER' where company_id=? and user_id=?",fixture.company[0],fixture.actor[0]);
            execute(writer,"insert into identity.company_member(company_id,user_id,member_kind) values (?,?,'CUSTOMER')",fixture.company[0],fixture.actor[1]);
            execute(writer,"insert into identity.role(company_id,id,code) values (?,?,'PORTAL BRANCH TEST ONLY')",fixture.company[0],role);
            execute(writer,"insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,'branch:read')",fixture.company[0],role);
            for (UUID user : fixture.actor) {
                execute(writer,"insert into identity.member_role(company_id,user_id,role_id) values (?,?,?)",fixture.company[0],user,role);
                execute(writer,"insert into identity.external_identity(issuer,subject,user_id,realm) values ('https://portal.example.invalid',?,?,'CUSTOMER')",user.toString(),user);
            }
            execute(writer,"update crm.customer_branch set code='B20',name='Main',address_line1='1 Test Street',city='Sydney',state='NSW',postcode='2000',country_code='AU' where id=?",fixture.branch[0]);
            execute(writer,"insert into crm.customer(id,company_id,code,business_name) values (?,?,'OTHER-TEST','Test only')",otherCustomer,fixture.company[0]);
            for (UUID branch : List.of(otherBranch,extra,hidden,archived)) {
                execute(writer,"insert into crm.customer_branch(id,company_id,customer_id,code,name,address_line1,city,state,postcode,country_code) values (?,?,?,?,?,'2 Test Street','Melbourne','VIC','3000','AU')",
                        branch,fixture.company[0],branch.equals(otherBranch) ? otherCustomer : fixture.customer[0],
                        branch.equals(extra) ? "A10" : branch.toString(),branch.equals(extra) ? "Extra" : "Test only");
            }
            execute(writer,"update crm.customer_branch set status='ARCHIVED' where id=?",archived);
            execute(writer,"insert into identity.resource_grant(id,company_id,user_id,scope,customer_id) values (?,?,?,'BRANCH',?),(?,?,?,'BRANCH',?)",
                    grant,fixture.company[0],fixture.actor[0],fixture.customer[0],otherGrant,fixture.company[0],fixture.actor[1],otherCustomer);
            execute(writer,"insert into identity.resource_grant(id,company_id,user_id,scope) values (?,?,?,'COMPANY')",companyGrant,fixture.company[0],fixture.actor[0]);
            for (UUID branch : List.of(fixture.branch[0],extra,archived))
                execute(writer,"insert into identity.grant_branch(grant_id,company_id,customer_id,branch_id) values (?,?,?,?)",grant,fixture.company[0],fixture.customer[0],branch);
            execute(writer,"insert into identity.grant_branch(grant_id,company_id,customer_id,branch_id) values (?,?,?,?)",otherGrant,fixture.company[0],otherCustomer,otherBranch);
            expectSqlState(writer,"23505","update crm.customer_branch set code='A10' where id=?",fixture.branch[0]);
            writer.commit();
            writer.setAutoCommit(true);
            String token=PortalTokens.token(fixture.actor[0]), otherToken=PortalTokens.token(fixture.actor[1]);
            try (var application=new SpringApplicationBuilder(PortalTokens.class,HttManagementApiApplication.class).run(
                    "--spring.profiles.active=database", "--server.port=0", "--server.address=127.0.0.1", "--logging.level.root=WARN",
                    "--spring.datasource.url="+url, "--spring.datasource.username="+appUser, "--spring.datasource.password="+appPassword,
                    "--spring.flyway.placeholders.runtime_role="+appUser, "--htt.auth.enabled=true", "--htt.portal.branches-enabled=true",
                    "--htt.auth.staff.issuer=https://staff.example.invalid", "--htt.auth.staff.audience=staff-api", "--htt.auth.staff.jwk-set-uri=https://staff.example.invalid/certs",
                    "--htt.auth.portal.issuer=https://portal.example.invalid", "--htt.auth.portal.audience=portal-api", "--htt.auth.portal.jwk-set-uri=https://portal.example.invalid/certs");
                    var client=HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build()) {
                String origin="http://127.0.0.1:"+application.getEnvironment().getRequiredProperty("local.server.port");
                var anonymous=portalBranches(client,origin,null,fixture.company[0],grant);
                assertThat(anonymous.statusCode()).isEqualTo(401);
                deleteRequestAudit(writer,anonymous);
                var response=portalBranches(client,origin,token,fixture.company[0],grant);
                assertThat(response.statusCode()).isEqualTo(200);
                var json=new JsonMapper().readTree(response.body());
                Instant.parse(json.path("dataAsOf").asString());
                assertThat(json).isEqualTo(new JsonMapper().readTree("""
                        {"customerId":"%s","grantId":"%s","items":[
                         {"id":"%s","code":"A10","name":"Extra","addressLine1":"2 Test Street","suburb":"Melbourne","state":"VIC","postcode":"3000","country":"AU"},
                         {"id":"%s","code":"B20","name":"Main","addressLine1":"1 Test Street","suburb":"Sydney","state":"NSW","postcode":"2000","country":"AU"}],"dataAsOf":"%s"}
                        """.formatted(fixture.customer[0],grant,extra,fixture.branch[0],json.path("dataAsOf").asString())));
                assertThat(portalBranches(client,origin,token,fixture.company[0],otherGrant).statusCode()).isEqualTo(403);
                assertThat(portalBranches(client,origin,otherToken,fixture.company[0],grant).statusCode()).isEqualTo(403);
                assertThat(portalBranches(client,origin,token,fixture.company[1],grant).statusCode()).isEqualTo(403);
                assertThat(portalBranches(client,origin,token,fixture.company[0],companyGrant).statusCode()).isEqualTo(403);
                var otherJson=new JsonMapper().readTree(portalBranches(client,origin,otherToken,fixture.company[0],otherGrant).body());
                assertThat(otherJson.path("customerId").asString()).isEqualTo(otherCustomer.toString());
                assertThat(otherJson.path("items").size()).isEqualTo(1);

                execute(writer,"update identity.resource_grant set scope='CUSTOMER' where id=?",grant);
                assertThat(new JsonMapper().readTree(portalBranches(client,origin,token,fixture.company[0],grant).body()).path("items").size()).isEqualTo(2);
                execute(writer,"update crm.customer_branch set status='ARCHIVED' where id in (?,?)",fixture.branch[0],extra);
                var empty=portalBranches(client,origin,token,fixture.company[0],grant);
                assertThat(empty.statusCode()).isEqualTo(200);
                assertThat(new JsonMapper().readTree(empty.body()).path("items").size()).isZero();
                // Also preserve empty BRANCH grants, which resolve_access deliberately omits from its summary.
                execute(writer,"update identity.resource_grant set scope='BRANCH' where id=?",grant);
                assertThat(portalBranches(client,origin,token,fixture.company[0],grant).statusCode()).isEqualTo(200);
                execute(writer,"update crm.customer_branch set status='ACTIVE' where id in (?,?)",fixture.branch[0],extra);
                execute(writer,"update crm.customer_branch set code=null where id=?",fixture.branch[0]);
                var incomplete=portalBranches(client,origin,token,fixture.company[0],grant);
                assertThat(incomplete.statusCode()).isEqualTo(503);
                assertThat(new JsonMapper().readTree(incomplete.body()).path("code").asString()).isEqualTo("database_unavailable");
                execute(writer,"update crm.customer_branch set code='B20' where id=?",fixture.branch[0]);
                execute(writer,"delete from identity.role_permission where company_id=? and role_id=? and permission_code='branch:read'",fixture.company[0],role);
                assertThat(portalBranches(client,origin,token,fixture.company[0],grant).statusCode()).isEqualTo(403);
                execute(writer,"insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,'branch:read')",fixture.company[0],role);
                execute(writer,"update identity.resource_grant set enabled=false where id=?",grant);
                assertThat(portalBranches(client,origin,token,fixture.company[0],grant).statusCode()).isEqualTo(403);
                execute(writer,"update identity.resource_grant set enabled=true where id=?",grant);
                execute(writer,"update crm.customer set status='ARCHIVED' where id=?",fixture.customer[0]);
                assertThat(portalBranches(client,origin,token,fixture.company[0],grant).statusCode()).isEqualTo(403);
                execute(writer,"update crm.customer set status='ACTIVE' where id=?",fixture.customer[0]);
                assertThat(portalBranches(client,origin,token,fixture.company[0],grant).statusCode()).isEqualTo(200);
                execute(writer,"update identity.user_account set status='DISABLED' where id=?",fixture.actor[0]);
                var disabled=portalBranches(client,origin,token,fixture.company[0],grant);
                assertThat(disabled.statusCode()).isEqualTo(401);
                deleteRequestAudit(writer,disabled);
                assertThat(scalar(writer,"select count(*) from platform.access_audit where action='branch:read' and outcome='DENY' and actor_id='"+fixture.actor[0]+"'::uuid")).isGreaterThan(0);
            }
        }
    }

    private static HttpResponse<String> portalBranches(HttpClient client,String origin,String token,UUID company,UUID grant) throws Exception {
        var request=HttpRequest.newBuilder(URI.create(origin+"/api/portal/v1/branches"))
                .timeout(java.time.Duration.ofSeconds(10)).header("X-Company-Id",company.toString()).header("X-Portal-Grant-Id",grant.toString());
        if (token!=null) request.header("Authorization","Bearer "+token);
        return client.send(request.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    private static void deleteRequestAudit(Connection writer,HttpResponse<?> response) throws SQLException {
        execute(writer,"delete from platform.access_audit where request_id=?::uuid",response.headers().firstValue("X-Request-Id").orElseThrow());
    }

    @TestConfiguration(proxyBeanMethods=false)
    static class PortalTokens {
        @Bean @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name="htt.customers.enabled",havingValue="true")
        com.htt.management.identity.KeycloakAccounts keycloakAccounts() { return new TestKeycloakAccounts(); }
        static final KeyPair KEY=keyPair();
        @Bean("staffJwtDecoder") JwtDecoder staff() { return decoder("https://staff.example.invalid","staff-api"); }
        @Bean("portalJwtDecoder") JwtDecoder portal() { return decoder("https://portal.example.invalid","portal-api"); }
        private static JwtDecoder decoder(String issuer,String audience) {
            var decoder=NimbusJwtDecoder.withPublicKey((RSAPublicKey)KEY.getPublic()).build();
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer),jwt ->
                    jwt.getAudience().contains(audience) && jwt.getIssuedAt()!=null && jwt.getExpiresAt()!=null
                            ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"))));
            return decoder;
        }
        static String token(UUID user) throws Exception {
            return token(user,false);
        }
        static String token(UUID user,boolean staff) throws Exception {
            return token(user,staff,Instant.now().minusSeconds(1));
        }
        static String token(UUID user,boolean staff,Instant issuedAt) throws Exception {
            var jwt=new SignedJWT(new JWSHeader(JWSAlgorithm.RS256),new JWTClaimsSet.Builder().issuer("https://portal.example.invalid")
                    .issuer(staff?"https://staff.example.invalid":"https://portal.example.invalid")
                    .subject(user.toString()).audience(staff?"staff-api":"portal-api").issueTime(Date.from(issuedAt))
                    .expirationTime(Date.from(Instant.now().plusSeconds(300))).build());
            jwt.sign(new RSASSASigner((RSAPrivateKey)KEY.getPrivate()));
            return jwt.serialize();
        }
        private static KeyPair keyPair() {
            try { var generator=KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); return generator.generateKeyPair(); }
            catch (Exception failure) { throw new IllegalStateException(failure); }
        }
    }

    static class TestKeycloakAccounts extends com.htt.management.identity.KeycloakAccounts {
        volatile boolean failRemote;
        private final java.util.Set<String> revoked=java.util.concurrent.ConcurrentHashMap.newKeySet();
        TestKeycloakAccounts() { super("https://portal.example.invalid/realms/customer","test-client","test-only",new JsonMapper()); }
        @Override public String issuer() { return "https://portal.example.invalid"; }
        @Override public User ensure(String login,String email,String subject,UUID operation) {
            return new User(subject==null?UUID.nameUUIDFromBytes(operation.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString():subject,login,true);
        }
        @Override public void enabled(String subject,boolean enabled) {
            if(failRemote) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE);
            if(enabled) revoked.remove(subject);else revoked.add(subject);
        }
        @Override public void logout(String subject) { revoked.add(subject); }
        @Override public void reset(String subject) { revoked.add(subject); }
        @Override public boolean active(String token) {
            try { return !revoked.contains(SignedJWT.parse(token).getJWTClaimsSet().getSubject()); }
            catch(Exception failure) { throw new IllegalArgumentException("Invalid test token"); }
        }
    }

    private static final class Fixture implements AutoCloseable {
        final UUID[] company = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] actor = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] customer = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] unit = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] branch = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] product = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] warehouse = {UUID.randomUUID(), UUID.randomUUID()};

        Fixture() throws SQLException {
            try (var connection = migrationConnection()) {
                connection.setAutoCommit(false);
                for (int i = 0; i < 2; i++) {
                    execute(connection, "INSERT INTO identity.company(id, code, name) VALUES (?, ?, 'TEST ONLY')", company[i], company[i].toString());
                    execute(connection, "INSERT INTO identity.user_account(id, display_name) VALUES (?, 'TEST ONLY')", actor[i]);
                    execute(connection, "INSERT INTO identity.company_member(company_id, user_id) VALUES (?, ?)", company[i], actor[i]);
                    execute(connection, "INSERT INTO crm.customer(id, company_id, code, business_name) VALUES (?, ?, 'TEST', 'TEST ONLY')", customer[i], company[i]);
                    execute(connection, "INSERT INTO crm.customer_branch(id, company_id, customer_id, name) VALUES (?, ?, ?, 'TEST ONLY')", branch[i], company[i], customer[i]);
                    execute(connection, "INSERT INTO crm.customer_contact(company_id, customer_id, branch_id, name) VALUES (?, ?, ?, 'TEST ONLY')", company[i], customer[i], branch[i]);
                    execute(connection, "INSERT INTO catalog.unit_of_measure(id, company_id, code, name) VALUES (?, ?, 'TEST', 'TEST ONLY')", unit[i], company[i]);
                    execute(connection, "INSERT INTO catalog.product(id, company_id, sku, name, base_unit_id) VALUES (?, ?, 'TEST', 'TEST ONLY', ?)", product[i], company[i], unit[i]);
                    execute(connection, "INSERT INTO inventory.warehouse(id, company_id, code, name) VALUES (?, ?, 'TEST', 'TEST ONLY')", warehouse[i], company[i]);
                }
                connection.commit();
            }
        }

        @Override
        public void close() throws SQLException {
            try (var connection = migrationConnection()) {
                connection.setAutoCommit(false);
                for(UUID request:CUSTOMER_HTTP_REQUESTS) execute(connection,"delete from platform.access_audit where request_id=?",request);
                var accountActors=new java.util.ArrayList<UUID>();
                try(var q=connection.prepareStatement("select actor_id from identity.customer_account where company_id in (?,?)")) {
                    q.setObject(1,company[0]);q.setObject(2,company[1]);try(var r=q.executeQuery()){while(r.next())accountActors.add(r.getObject(1,UUID.class));}
                }
                for(UUID accountActor:accountActors) execute(connection,"delete from platform.access_audit where actor_id=?",accountActor);
                execute(connection,"delete from identity.customer_account where company_id in (?,?)",company[0],company[1]);
                for(UUID accountActor:accountActors) execute(connection,"delete from identity.external_identity where user_id=?",accountActor);
                execute(connection,"DELETE FROM platform.access_audit WHERE selected_company_id IN (?,?) OR actor_id IN (?,?)",company[0],company[1],actor[0],actor[1]);
                execute(connection,"DELETE FROM notification.audit WHERE company_id IN (?,?) OR event_id IN (SELECT id FROM platform.domain_outbox WHERE company_id IN (?,?))",company[0],company[1],company[0],company[1]);
                execute(connection,"DELETE FROM notification.delivery WHERE message_id IN (SELECT id FROM notification.message WHERE company_id IN (?,?))",company[0],company[1]);
                for (String table : List.of("notification.message","notification.recipient_cursor","notification.device","notification.inbox","platform.domain_outbox")) {
                    execute(connection,"DELETE FROM "+table+" WHERE company_id IN (?,?)",company[0],company[1]);
                }
                for (String table : List.of("platform.customer_change_audit","crm.customer_billing_address","crm.customer_workspace","inventory.stock_movement", "inventory.stock_balance", "catalog.product_barcode", "catalog.product_unit", "identity.grant_branch", "identity.resource_grant", "identity.member_role",
                        "identity.role_permission", "identity.role", "inventory.warehouse", "catalog.product", "catalog.unit_of_measure",
                        "crm.customer_contact", "crm.customer_location", "crm.customer_branch", "crm.customer", "identity.company_member")) {
                    execute(connection, "DELETE FROM " + table + " WHERE company_id IN (?, ?)", company[0], company[1]);
                }
                execute(connection, "DELETE FROM identity.company WHERE id IN (?, ?)", company[0], company[1]);
                execute(connection, "DELETE FROM identity.external_identity WHERE user_id IN (?, ?)", actor[0], actor[1]);
                execute(connection, "DELETE FROM identity.user_account WHERE id IN (?, ?)", actor[0], actor[1]);
                for(UUID accountActor:accountActors) execute(connection,"delete from identity.user_account where id=?",accountActor);
                connection.commit();
                CUSTOMER_HTTP_REQUESTS.clear();
            }
        }
    }
}
