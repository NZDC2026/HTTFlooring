import java.sql.*;
import java.util.*;

/** Exact development targets only; never exports table contents or overwrites Main data. */
class RetireValidationDatabase {
    static Connection connect(String database)throws SQLException {
        var properties=new Properties();properties.setProperty("user","postgres");
        properties.setProperty("password",Objects.requireNonNull(System.getenv("HTT_PG_ADMIN_PASSWORD")));
        properties.setProperty("connectTimeout","5");properties.setProperty("socketTimeout","30");
        return DriverManager.getConnection("jdbc:postgresql://192.168.10.174:5432/"+database,properties);
    }
    public static void main(String[] args)throws Exception {
        if(args.length!=1||!Set.of("mark-development","retire").contains(args[0]))throw new IllegalArgumentException("mark-development|retire");
        try(var main=connect("htt_management");var validation=connect("htt_management_validation")) {
            for(var pair:Map.of("htt_management",main,"htt_management_validation",validation).entrySet()) {
                try(var s=pair.getValue().createStatement();var r=s.executeQuery("select pg_get_userbyid(datdba) from pg_database where datname=current_database()")) {
                    r.next();if(!r.getString(1).equals(pair.getKey()+"_migrator"))throw new IllegalStateException("Unexpected database ownership");
                }
            }
            if(!values(main,"select code from identity.permission order by code").equals(values(validation,"select code from identity.permission order by code")))throw new IllegalStateException("Permission catalogs differ; preserve source");
            if(!values(main,"select version||':'||script from platform.flyway_schema_history where success order by installed_rank").equals(values(validation,"select version||':'||script from platform.flyway_schema_history where success order by installed_rank")))throw new IllegalStateException("Apply validated migrations before retirement");
            try(var s=validation.createStatement();var r=s.executeQuery("select schemaname,tablename from pg_tables where schemaname not like 'pg_%' and schemaname<>'information_schema'")) {
                while(r.next()) {
                    String table=r.getString(1)+"."+r.getString(2);
                    if(Set.of("identity.permission","platform.flyway_schema_history").contains(table))continue;
                    try(var q=validation.createStatement();var rows=q.executeQuery("select count(*) from \""+r.getString(1)+"\".\""+r.getString(2)+"\"")){rows.next();if(rows.getLong(1)!=0)throw new IllegalStateException("Source contains records; refuse retirement: "+table);}
                }
            }
            if(args[0].equals("mark-development")) {
                try(var s=main.createStatement()){s.execute("COMMENT ON DATABASE htt_management IS 'htt-management-api shared development/test; synthetic fixtures only'");}
                System.out.println("Catalogs match; Validation has no unique data. Main marked as shared development/test.");return;
            }
        }
        try(var admin=connect("postgres");var s=admin.createStatement()) {
            s.execute("DROP DATABASE htt_management_validation WITH (FORCE)");
            // Retain roles without login rather than deleting globally scoped objects blindly.
            s.execute("ALTER ROLE htt_management_validation_app NOLOGIN");
            s.execute("ALTER ROLE htt_management_validation_migrator NOLOGIN");
            try(var r=s.executeQuery("select count(*) from pg_database where datname='htt_management_validation'")){r.next();if(r.getLong(1)!=0)throw new IllegalStateException("Retirement not confirmed");}
            System.out.println("Validation database removed; obsolete roles disabled. Main data retained.");
        }
    }
    static List<String> values(Connection c,String sql)throws SQLException {
        var values=new ArrayList<String>();try(var s=c.createStatement();var r=s.executeQuery(sql)){while(r.next())values.add(r.getString(1));}return values;
    }
}
