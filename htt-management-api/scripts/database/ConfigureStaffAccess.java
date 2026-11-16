import java.sql.DriverManager;
import java.util.Arrays;
import java.util.Properties;
import java.util.UUID;

/** Explicit development maintenance; uses existing accounts, never creates passwords or employee profiles. */
class ConfigureStaffAccess {
    public static void main(String[] args) throws Exception {
        if(args.length!=6) throw new IllegalArgumentException("Expected profile, actor, companies, customers, roles-or-keep, reason");
        String url=required("HTT_DB_URL");
        if(!url.startsWith("jdbc:postgresql://192.168.10.174:5432/htt_management?")
                ||url.matches("(?i).*([?&])(user|password)=.*")||!required("HTT_DB_MIGRATION_USERNAME").equals("htt_management_migrator"))
            throw new IllegalArgumentException("Only the documented dedicated development credentials are accepted");
        var properties=new Properties();properties.setProperty("user",required("HTT_DB_MIGRATION_USERNAME"));
        properties.setProperty("password",required("HTT_DB_MIGRATION_PASSWORD"));
        UUID actor=UUID.fromString(args[1]);
        var companies=ids(args[2]);var customers=ids(args[3]);
        UUID[] roles=args[4].equals("keep")?null:ids(args[4]);
        if(companies.length==0) throw new IllegalArgumentException("Explicit company IDs required");
        try(var connection=DriverManager.getConnection(url,properties)) {
            connection.setAutoCommit(false);
            try(var query=connection.createStatement();var r=query.executeQuery("select current_database(),shobj_description(oid,'pg_database') from pg_database where datname=current_database()")) {
                r.next();if(!r.getString(1).equals("htt_management")||!"htt-management-api shared development/test; synthetic fixtures only".equals(r.getString(2)))
                    throw new IllegalStateException("Development database marker required");
            }
            try(var query=connection.createStatement();var r=query.executeQuery("select pg_try_advisory_xact_lock(744610016)")) {
                r.next();if(!r.getBoolean(1))throw new IllegalStateException("Another development configuration/test is running");
            }
            Arrays.sort(companies);
            for(UUID company:companies)try(var statement=connection.prepareStatement("select identity.configure_staff_access(?,?,?,?,?,?)")) {
                statement.setObject(1,actor);statement.setObject(2,company);statement.setString(3,args[0]);
                statement.setArray(4,connection.createArrayOf("uuid",customers));
                if(roles==null)statement.setNull(5,java.sql.Types.ARRAY);else statement.setArray(5,connection.createArrayOf("uuid",roles));
                statement.setString(6,args[5]);statement.execute();
            }
            connection.commit();
            System.out.println("Configured "+args[0]+" for actor "+actor+" in "+companies.length+" explicitly selected companies. No passwords changed.");
        }
    }
    private static UUID[] ids(String value) {
        return value.equals("-")?new UUID[0]:Arrays.stream(value.split(",",-1)).map(UUID::fromString).distinct().toArray(UUID[]::new);
    }
    private static String required(String name) {
        String value=System.getenv(name);if(value==null||value.isBlank())throw new IllegalStateException("Missing environment "+name);return value;
    }
}
