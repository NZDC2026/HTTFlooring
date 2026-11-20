import java.sql.*;
import java.util.UUID;

/** Explicitly confirmed DEMO mapping only: A=Melbourne, B=Sydney. Does not seed production data. */
class SetDevelopmentCompanyCities {
    public static void main(String[] args) throws Exception {
        String url="jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";
        if(args.length!=0||!url.equals(System.getenv("HTT_DB_URL"))
                ||!"htt_management_migrator".equals(System.getenv("HTT_DB_MIGRATION_USERNAME")))
            throw new IllegalStateException("Explicit Main development credentials required");
        try(var db=DriverManager.getConnection(url,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try(var q=db.createStatement();var r=q.executeQuery("select shobj_description(oid,'pg_database') from pg_database where datname=current_database()")) {
                r.next();if(!"htt-management-api shared development/test; synthetic fixtures only".equals(r.getString(1)))throw new IllegalStateException("Development marker required");
            }
            try(var q=db.createStatement();var r=q.executeQuery("select pg_try_advisory_xact_lock(744610016)")) {
                r.next();if(!r.getBoolean(1))throw new IllegalStateException("Another development configuration/test is running");
            }
            try(var q=db.createStatement();var r=q.executeQuery("select count(*) from platform.flyway_schema_history where success and version='15'")) {
                r.next();if(r.getInt(1)!=1)throw new IllegalStateException("Apply and validate V15 first");
            }
            String[] suffixes={"A","B"},cities={"Melbourne","Sydney"};
            UUID[] ids=new UUID[2];boolean[] change=new boolean[2];
            for(int i=0;i<2;i++)try(var q=db.prepareStatement("select id,city from identity.company where code=? and name=? and status='ACTIVE' for update")) {
                q.setString(1,"HTT-DEMO-"+suffixes[i]);q.setString(2,"[DEMO] Company "+suffixes[i]);
                try(var r=q.executeQuery()) {
                    if(!r.next())throw new IllegalStateException("Expected marked DEMO company missing");
                    ids[i]=r.getObject(1,UUID.class);String current=r.getString(2);
                    if(current!=null&&!current.equals(cities[i]))throw new IllegalStateException("Existing city differs; refusing overwrite");
                    change[i]=current==null;
                    if(r.next())throw new IllegalStateException("Ambiguous DEMO company");
                }
            }
            for(int i=0;i<2;i++)if(change[i]) {
                try(var q=db.prepareStatement("update identity.company set city=?,version=version+1,updated_at=clock_timestamp() where id=? and city is null")) {
                    q.setString(1,cities[i]);q.setObject(2,ids[i]);
                    if(q.executeUpdate()!=1)throw new IllegalStateException("Concurrent company change");
                }
                try(var q=db.prepareStatement("select identity.append_access_audit(?,null,?,'company:city:update',?,'ALLOW')")) {
                    q.setString(1,UUID.randomUUID().toString());q.setObject(2,ids[i]);q.setObject(3,ids[i]);q.execute();
                }
            }
            db.commit();
            for(int i=0;i<2;i++)System.out.println("HTT-DEMO-"+suffixes[i]+" = "+cities[i]+(change[i]?" (updated)":" (preserved)"));
        } catch(SQLException failure) {
            throw new IllegalStateException("City configuration failed; SQLSTATE="+failure.getSQLState());
        }
    }
}
