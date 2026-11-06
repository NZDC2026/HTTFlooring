package com.htt.management;

import com.htt.management.identity.AccessRepository;
import com.htt.management.identity.AccessSnapshot;
import com.htt.management.identity.AccessAudit;
import com.htt.management.platform.web.RequestIdFilter;
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
        assertThat(flyway.info().applied()).hasSize(3);
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

    private static final class Fixture implements AutoCloseable {
        final UUID[] company = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] actor = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] customer = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] unit = {UUID.randomUUID(), UUID.randomUUID()};
        final UUID[] branch = {UUID.randomUUID(), UUID.randomUUID()};

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
                    execute(connection, "INSERT INTO catalog.product(company_id, sku, name, base_unit_id) VALUES (?, 'TEST', 'TEST ONLY', ?)", company[i], unit[i]);
                    execute(connection, "INSERT INTO inventory.warehouse(company_id, code, name) VALUES (?, 'TEST', 'TEST ONLY')", company[i]);
                }
                connection.commit();
            }
        }

        @Override
        public void close() throws SQLException {
            try (var connection = migrationConnection()) {
                connection.setAutoCommit(false);
                for (String table : List.of("identity.grant_branch", "identity.resource_grant", "identity.member_role",
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
