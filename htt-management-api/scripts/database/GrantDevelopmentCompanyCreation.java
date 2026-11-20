import java.sql.*;
import java.util.UUID;

/** Explicit opt-in for the already prepared group-admin DEMO account only. Never assigns company roles. */
class GrantDevelopmentCompanyCreation {
    public static void main(String[] args)throws Exception {
        String url="jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";
        if(args.length!=0||!url.equals(System.getenv("HTT_DB_URL"))||!"htt_management_migrator".equals(System.getenv("HTT_DB_MIGRATION_USERNAME")))
            throw new IllegalStateException("Explicit Main development credentials required");
        try(var db=DriverManager.getConnection(url,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try(var q=db.createStatement();var r=q.executeQuery("select shobj_description(oid,'pg_database') from pg_database where datname=current_database()")) {
                r.next();if(!"htt-management-api shared development/test; synthetic fixtures only".equals(r.getString(1)))throw new IllegalStateException("Development marker required");
            }
            try(var q=db.createStatement();var r=q.executeQuery("select pg_try_advisory_xact_lock(744610016)")) {
                r.next();if(!r.getBoolean(1))throw new IllegalStateException("Another configuration/test is running");
            }
            try(var q=db.createStatement();var r=q.executeQuery("select count(*) from platform.flyway_schema_history where success and version='16'")) {
                r.next();if(r.getInt(1)!=1)throw new IllegalStateException("Validated V16 required");
            }
            UUID actor;
            try(var q=db.prepareStatement("""
                select u.id from identity.user_account u join identity.password_credential p on p.actor_id=u.id
                where u.display_name='[DEMO ACCESS] group-admin' and u.status='ACTIVE'
                 and p.login_name='group-admin@htt-demo.invalid' and p.realm='STAFF'
                 and exists(select 1 from identity.employee e join identity.company c on c.id=e.company_id
                    where e.actor_id=u.id and e.status='ACTIVE' and c.status='ACTIVE')
                 and exists(select 1 from identity.company_member m join identity.company c on c.id=m.company_id
                    where m.user_id=u.id and m.status='ACTIVE' and m.access_profile='GROUP_READER' and c.status='ACTIVE')
                for update of u
                """ );var r=q.executeQuery()) {
                if(!r.next())throw new IllegalStateException("Expected active, marked group-admin fixture missing");
                actor=r.getObject(1,UUID.class);if(r.next())throw new IllegalStateException("Ambiguous group-admin fixture");
            }
            int changed;
            try(var q=db.prepareStatement("""
                insert into identity.platform_grant(actor_id,permission_code,reason) values (?,'company:create','[DEMO ACCESS] Explicit company creation authorization')
                on conflict(actor_id,permission_code) do nothing
                """)) {q.setObject(1,actor);changed=q.executeUpdate();}
            if(changed==0)try(var q=db.prepareStatement("select enabled from identity.platform_grant where actor_id=? and permission_code='company:create'")) {
                q.setObject(1,actor);try(var r=q.executeQuery()){r.next();if(!r.getBoolean(1))throw new IllegalStateException("Grant was explicitly revoked; refusing to restore it");}
            }
            if(changed==1)try(var q=db.prepareStatement("select identity.append_access_audit(?,null,null,'company:create:grant',?,'ALLOW')")) {
                q.setString(1,UUID.randomUUID().toString());q.setObject(2,actor);q.execute();
            }
            db.commit();System.out.println("group-admin@htt-demo.invalid: company:create "+(changed==1?"granted":"preserved")+". Business read-only scopes unchanged.");
        } catch(SQLException failure){throw new IllegalStateException("Development grant failed; SQLSTATE="+failure.getSQLState());}
    }
}
