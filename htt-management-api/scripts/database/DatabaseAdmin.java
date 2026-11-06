import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/** Narrow bootstrap tool. Only creates new HTT databases/roles; never alters existing systems. */
class DatabaseAdmin {
    private static final String SERVER = "jdbc:postgresql://192.168.10.174:5432/";

    public static void main(String[] args) throws Exception {
        if (args.length != 2 || !args[0].equals("provision")) {
            throw new IllegalArgumentException("Usage: DatabaseAdmin.java provision main|validation");
        }
        String database = switch (args[1]) {
            case "main" -> "htt_management";
            case "validation" -> "htt_management_validation";
            default -> throw new IllegalArgumentException("Unsupported target; only main or validation is allowed.");
        };
        String app = database + "_app";
        String migrator = database + "_migrator";
        if (!app.equals(required("HTT_DB_USERNAME")) || !migrator.equals(required("HTT_DB_MIGRATION_USERNAME"))) {
            throw new IllegalStateException("Loaded credentials do not match the selected target.");
        }
        String appPassword = required("HTT_DB_PASSWORD");
        String migrationPassword = required("HTT_DB_MIGRATION_PASSWORD");
        if (appPassword.length() < 32 || migrationPassword.length() < 32) {
            throw new IllegalArgumentException("Use the generated database credentials.");
        }
        try (Connection admin = connect("postgres")) {
            // Existence is checked before any mutation. No password rotation, ownership takeover or DROP.
            try (var check = admin.prepareStatement("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ?) "
                    + "OR EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN (?, ?))")) {
                check.setString(1, database);
                check.setString(2, app);
                check.setString(3, migrator);
                try (var result = check.executeQuery()) {
                    result.next();
                    if (result.getBoolean(1)) {
                        throw new IllegalStateException("HTT target database/roles already exist; inspect rather than overwrite.");
                    }
                }
            }
            admin.setAutoCommit(false);
            try {
                execute(admin, roleSql(app, appPassword));
                execute(admin, roleSql(migrator, migrationPassword));
                admin.commit();
            } catch (SQLException failure) {
                admin.rollback();
                throw failure;
            }
            admin.setAutoCommit(true);
            // PostgreSQL CREATE DATABASE cannot run inside a transaction.
            execute(admin, "CREATE DATABASE " + database + " OWNER " + migrator + " TEMPLATE template0 ENCODING 'UTF8'");
            execute(admin, "REVOKE ALL ON DATABASE " + database + " FROM PUBLIC");
            execute(admin, "GRANT CONNECT ON DATABASE " + database + " TO " + app);
            execute(admin, "COMMENT ON DATABASE " + database + " IS " + literal(
                    args[1].equals("validation") ? "htt-management-api dedicated validation; synthetic data only"
                            : "htt-management-api main database"));
            for (String role : new String[]{app, migrator}) {
                execute(admin, "ALTER ROLE " + role + " IN DATABASE " + database + " SET search_path = pg_catalog");
                execute(admin, "ALTER ROLE " + role + " IN DATABASE " + database + " SET timezone = 'UTC'");
                execute(admin, "ALTER ROLE " + role + " IN DATABASE " + database + " SET lock_timeout = '3s'");
                execute(admin, "ALTER ROLE " + role + " IN DATABASE " + database + " SET idle_in_transaction_session_timeout = '30s'");
            }
            execute(admin, "ALTER ROLE " + app + " IN DATABASE " + database + " SET statement_timeout = '15s'");
            execute(admin, "ALTER ROLE " + migrator + " IN DATABASE " + database + " SET statement_timeout = '120s'");
        } catch (SQLException failure) {
            // Never print the CREATE ROLE statement or credentials, even on failure.
            throw new IllegalStateException("Database provisioning failed; SQLSTATE=" + failure.getSQLState()
                    + ". Inspect partial HTT resources before retrying.");
        }
        try (Connection admin = connect(database)) {
            admin.setAutoCommit(false);
            execute(admin, "REVOKE ALL ON SCHEMA public FROM PUBLIC");
            execute(admin, "CREATE SCHEMA platform AUTHORIZATION " + migrator);
            execute(admin, "REVOKE ALL ON SCHEMA platform FROM PUBLIC");
            admin.commit();
        }
        System.out.println("Provisioned " + database + " with separate app/migration roles. No business data was inserted.");
    }

    private static Connection connect(String database) throws SQLException {
        Properties properties = new Properties();
        properties.setProperty("user", "postgres");
        properties.setProperty("password", required("HTT_PG_ADMIN_PASSWORD"));
        properties.setProperty("connectTimeout", "5");
        properties.setProperty("socketTimeout", "30");
        properties.setProperty("sslmode", "prefer");
        properties.setProperty("ApplicationName", "htt-management-provision");
        return DriverManager.getConnection(SERVER + database, properties);
    }

    private static String roleSql(String role, String password) {
        return "CREATE ROLE " + role
                + " LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD " + literal(password);
    }

    private static String literal(String value) { return "'" + value.replace("'", "''") + "'"; }

    private static void execute(Connection connection, String sql) throws SQLException {
        try (var statement = connection.createStatement()) { statement.execute(sql); }
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException("Missing environment variable " + name); }
        return value;
    }
}
