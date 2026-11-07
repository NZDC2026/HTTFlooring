import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Explicit developer fixture tool. No application startup hook and no authentication bypass. */
class DemoData {
    public static void main(String[] args) throws Exception {
        if (args.length != 2 || !java.util.Set.of("seed", "check", "remove", "rehearse", "bind", "unbind").contains(args[0])
                || !java.util.Set.of("main", "validation").contains(args[1])) {
            throw new IllegalArgumentException("Usage: DemoData.java seed|check|remove|rehearse|bind|unbind main|validation");
        }
        boolean main = args[1].equals("main");
        if (main && args[0].equals("rehearse")) {
            throw new IllegalStateException("Automated rehearsals are restricted to validation.");
        }
        if (main && !args[0].equals("check") && !"true".equals(System.getenv("HTT_DEVELOPMENT_DATA"))) {
            throw new IllegalStateException("Main fixture writes require explicit development-data opt-in. Never use in production.");
        }
        String database = main ? "htt_management" : "htt_management_validation";
        String url = "jdbc:postgresql://192.168.10.174:5432/" + database
                + "?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";
        if (!url.equals(System.getenv("HTT_DB_URL"))
                || !(database + "_migrator").equals(System.getenv("HTT_DB_MIGRATION_USERNAME"))) {
            throw new IllegalStateException("Loaded credentials do not match the explicit HTT target. Other databases are prohibited.");
        }
        try (Connection db = DriverManager.getConnection(url, System.getenv("HTT_DB_MIGRATION_USERNAME"),
                System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try {
                execute(db, "SET LOCAL lock_timeout = '3s'; SET LOCAL statement_timeout = '15s'");
                execute(db, "SELECT pg_advisory_xact_lock(744610007)");
                try (var s = db.createStatement(); var r = s.executeQuery("SELECT current_database(), current_user, "
                        + "(SELECT count(*) FROM platform.flyway_schema_history WHERE success AND version IN ('1','2','3','4','5','6'))")) {
                    r.next();
                    if (!database.equals(r.getString(1)) || !(database + "_migrator").equals(r.getString(2)) || r.getInt(3) != 6) {
                        throw new IllegalStateException("Unexpected database, owner or migration state.");
                    }
                }
                execute(db, "CREATE FUNCTION pg_temp.demo_id(label text) RETURNS uuid LANGUAGE sql IMMUTABLE "
                        + "AS $$ SELECT md5('htt-demo-v1:' || label)::uuid $$");
                switch (args[0]) {
                    case "seed" -> { script(db, "seed"); check(db); }
                    case "check" -> check(db);
                    case "remove" -> script(db, "remove");
                    case "bind", "unbind" -> { bindings(db, args[0].equals("bind")); check(db); }
                    case "rehearse" -> {
                        script(db, "seed"); check(db); script(db, "remove");
                        try (var s = db.createStatement(); var r = s.executeQuery("SELECT count(*) FROM identity.company "
                                + "WHERE id IN (pg_temp.demo_id('company-a'),pg_temp.demo_id('company-b'))")) {
                            r.next(); if (r.getInt(1) != 0) throw new IllegalStateException("Removal failed.");
                        }
                        db.rollback();
                        System.out.println("Seed/check/remove rehearsal passed; all writes rolled back.");
                        return;
                    }
                }
                db.commit();
                System.out.println(args[0] + " committed in " + database + ". Identity provider is managed separately.");
            } catch (Exception failure) {
                db.rollback();
                if (failure instanceof SQLException sql) {
                    throw new IllegalStateException("Demo operation rolled back; SQLSTATE=" + sql.getSQLState());
                }
                throw failure;
            }
        }
    }

    private static void script(Connection db, String name) throws Exception {
        execute(db, Files.readString(Path.of("scripts/database/demo/" + name + ".sql")));
    }

    private static void execute(Connection db, String sql) throws SQLException {
        try (var s = db.createStatement()) { s.execute(sql); }
    }

    private static void bindings(Connection db, boolean bind) throws Exception {
        var subjects = new java.util.Properties();
        try (var reader = Files.newBufferedReader(Path.of(".cache/keycloak-demo-bindings.txt"))) { subjects.load(reader); }
        var labels = java.util.Set.of("manager", "sales", "customer-a", "customer-b");
        if (!subjects.stringPropertyNames().equals(labels)
                || subjects.values().stream().distinct().count() != 4) {
            throw new IllegalArgumentException("Expected exactly four distinct demo subjects.");
        }
        for (String label : labels) {
            String subject = subjects.getProperty(label);
            if (!java.util.UUID.fromString(subject).toString().equals(subject)) {
                throw new IllegalArgumentException("Unexpected Keycloak subject format.");
            }
            boolean staff = label.equals("manager") || label.equals("sales");
            String issuer = "https://192.168.10.174:18443/realms/" + (staff ? "htt-staff" : "htt-customer");
            String realm = staff ? "STAFF" : "CUSTOMER";
            if (bind) {
                try (var s = db.prepareStatement("INSERT INTO identity.external_identity(issuer,subject,user_id,realm) "
                        + "SELECT ?,?,id,? FROM identity.user_account WHERE id=pg_temp.demo_id(?) AND display_name=? "
                        + "ON CONFLICT (issuer,subject) DO NOTHING")) {
                    s.setString(1, issuer); s.setString(2, subject); s.setString(3, realm);
                    s.setString(4, label); s.setString(5, "[DEMO] " + label); s.executeUpdate();
                }
                try (var s = db.prepareStatement("SELECT count(*) FROM identity.external_identity "
                        + "WHERE issuer=? AND subject=? AND user_id=pg_temp.demo_id(?) AND realm=? AND enabled")) {
                    s.setString(1, issuer); s.setString(2, subject); s.setString(3, label); s.setString(4, realm);
                    try (var r = s.executeQuery()) {
                        r.next(); if (r.getInt(1) != 1) throw new IllegalStateException("Identity binding conflict; no accounts overwritten.");
                    }
                }
            } else {
                try (var s = db.prepareStatement("DELETE FROM identity.external_identity "
                        + "WHERE issuer=? AND subject=? AND user_id=pg_temp.demo_id(?) AND realm=?")) {
                    s.setString(1, issuer); s.setString(2, subject); s.setString(3, label); s.setString(4, realm);
                    s.executeUpdate();
                }
            }
        }
    }

    private static void check(Connection db) throws SQLException {
        for (String actor : new String[]{"manager", "sales", "customer-a", "customer-b"}) {
            try (var s = db.prepareStatement("SELECT u.id,u.display_name,m.company_id,m.member_kind,g.id "
                    + "FROM identity.user_account u JOIN identity.company_member m ON m.user_id=u.id "
                    + "JOIN identity.resource_grant g ON g.user_id=u.id AND g.company_id=m.company_id "
                    + "WHERE u.id=pg_temp.demo_id(?)")) {
                s.setString(1, actor);
                try (var r = s.executeQuery()) {
                    if (!r.next()) throw new IllegalStateException("Missing fixture: " + actor);
                    System.out.println(actor + " actor=" + r.getString(1) + " company=" + r.getString(3)
                            + " kind=" + r.getString(4) + " grant=" + r.getString(5));
                    if (r.next()) throw new IllegalStateException("Unexpected additional membership/grant: " + actor);
                }
            }
        }
        // Exercise the same narrow authorization function as the production branch query.
        for (String actor : new String[]{"customer-a", "customer-b"}) {
            try (var s = db.prepareStatement("SELECT jsonb_array_length(identity.portal_branch_scope("
                    + "pg_temp.demo_id(?),pg_temp.demo_id(?),pg_temp.demo_id(?))->'branchIds')")) {
                s.setString(1, actor);
                s.setString(2, actor.equals("customer-a") ? "company-a" : "company-b");
                s.setString(3, actor + "-grant");
                try (var r = s.executeQuery()) {
                    r.next(); if (r.getObject(1) == null || r.getInt(1) != 1) {
                        throw new IllegalStateException("Unexpected authorised branch scope: " + actor);
                    }
                }
            }
        }
        try (var s = db.createStatement(); var r = s.executeQuery("SELECT "
                + "identity.portal_branch_scope(pg_temp.demo_id('customer-a'),pg_temp.demo_id('company-b'),pg_temp.demo_id('customer-b-grant')) IS NULL, "
                + "NOT EXISTS (SELECT 1 FROM identity.role_permission WHERE role_id IN "
                + "(pg_temp.demo_id('sales-role'),pg_temp.demo_id('customer-a-role'),pg_temp.demo_id('customer-b-role')) AND permission_code='order:create')")) {
            r.next(); if (!r.getBoolean(1) || !r.getBoolean(2)) throw new IllegalStateException("Demo isolation check failed.");
        }
        System.out.println("Branch scope and cross-company denial verified; customer/sales have no order:create.");
    }
}
