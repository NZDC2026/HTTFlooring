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
        assertThat(flyway.info().applied()).hasSize(6);
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
            var jwt=new SignedJWT(new JWSHeader(JWSAlgorithm.RS256),new JWTClaimsSet.Builder().issuer("https://portal.example.invalid")
                    .subject(user.toString()).audience("portal-api").issueTime(Date.from(Instant.now().minusSeconds(1)))
                    .expirationTime(Date.from(Instant.now().plusSeconds(300))).build());
            jwt.sign(new RSASSASigner((RSAPrivateKey)KEY.getPrivate()));
            return jwt.serialize();
        }
        private static KeyPair keyPair() {
            try { var generator=KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); return generator.generateKeyPair(); }
            catch (Exception failure) { throw new IllegalStateException(failure); }
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
                execute(connection,"DELETE FROM platform.access_audit WHERE selected_company_id IN (?,?) OR actor_id IN (?,?)",company[0],company[1],actor[0],actor[1]);
                execute(connection,"DELETE FROM notification.audit WHERE company_id IN (?,?) OR event_id IN (SELECT id FROM platform.domain_outbox WHERE company_id IN (?,?))",company[0],company[1],company[0],company[1]);
                execute(connection,"DELETE FROM notification.delivery WHERE message_id IN (SELECT id FROM notification.message WHERE company_id IN (?,?))",company[0],company[1]);
                for (String table : List.of("notification.message","notification.recipient_cursor","notification.device","notification.inbox","platform.domain_outbox")) {
                    execute(connection,"DELETE FROM "+table+" WHERE company_id IN (?,?)",company[0],company[1]);
                }
                for (String table : List.of("inventory.stock_movement", "inventory.stock_balance", "catalog.product_barcode", "catalog.product_unit", "identity.grant_branch", "identity.resource_grant", "identity.member_role",
                        "identity.role_permission", "identity.role", "inventory.warehouse", "catalog.product", "catalog.unit_of_measure",
                        "crm.customer_contact", "crm.customer_branch", "crm.customer", "identity.company_member")) {
                    execute(connection, "DELETE FROM " + table + " WHERE company_id IN (?, ?)", company[0], company[1]);
                }
                execute(connection, "DELETE FROM identity.company WHERE id IN (?, ?)", company[0], company[1]);
                execute(connection, "DELETE FROM identity.external_identity WHERE user_id IN (?, ?)", actor[0], actor[1]);
                execute(connection, "DELETE FROM identity.user_account WHERE id IN (?, ?)", actor[0], actor[1]);
                connection.commit();
            }
        }
    }
}
