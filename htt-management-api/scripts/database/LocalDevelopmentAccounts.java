import java.sql.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Opt-in persistent synthetic accounts. Never changes an existing password or real membership. */
class LocalDevelopmentAccounts {
    public static void main(String[] args)throws Exception {
        String url="jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";
        if(args.length!=0||!"true".equals(System.getenv("HTT_DEVELOPMENT_DATA"))||!url.equals(System.getenv("HTT_DB_URL"))
                ||!"htt_management_migrator".equals(System.getenv("HTT_DB_MIGRATION_USERNAME"))) throw new IllegalStateException("Explicit development Main target required");
        var encoder=new BCryptPasswordEncoder(12);
        try(var db=DriverManager.getConnection(url,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try {
                try(var s=db.createStatement()) {s.execute("set local lock_timeout='3s'");s.execute("select pg_advisory_xact_lock(744610010)");}
                try(var s=db.createStatement();var r=s.executeQuery("select count(*) from platform.flyway_schema_history where success and version='10'")) {
                    r.next();if(r.getInt(1)!=1)throw new IllegalStateException("Validated V10 required");
                }
                for(String label:new String[]{"manager","sales","customer-a","customer-b"}) {
                    boolean staff=label.equals("manager")||label.equals("sales");
                    String companyLabel=label.equals("customer-b")?"B":"A",realm=staff?"STAFF":"CUSTOMER",login=label+"@htt-demo.invalid";
                    java.util.UUID actor,company;
                    try(var s=db.prepareStatement("select u.id,m.company_id from identity.user_account u join identity.company_member m on m.user_id=u.id join identity.company c on c.id=m.company_id where u.display_name=? and c.code=? and c.name=?")) {
                        s.setString(1,"[DEMO] "+label);s.setString(2,"HTT-DEMO-"+companyLabel);s.setString(3,"[DEMO] Company "+companyLabel);
                        try(var r=s.executeQuery()){if(!r.next())throw new IllegalStateException("Expected existing marked DEMO actor");actor=r.getObject(1,java.util.UUID.class);company=r.getObject(2,java.util.UUID.class);if(r.next())throw new IllegalStateException("Ambiguous DEMO actor");}
                    }
                    try(var s=db.prepareStatement("select login_name,realm from identity.password_credential where actor_id=?")) {
                        s.setObject(1,actor);try(var r=s.executeQuery()){if(r.next()) {
                            if(!login.equals(r.getString(1))||!realm.equals(r.getString(2)))throw new IllegalStateException("Existing credential differs");
                            System.out.println("Preserved existing local DEMO credential: "+label);continue;
                        }}
                    }
                    String password=System.getenv("HTT_DEMO_PASSWORD_"+label.toUpperCase(java.util.Locale.ROOT).replace('-','_'));
                    if(password==null||password.length()<24)throw new IllegalStateException("Private generated demo password required");
                    try(var s=db.prepareStatement("insert into identity.external_identity(issuer,subject,user_id,realm) values ('https://identity.htt.invalid/local',?,?,?) on conflict do nothing")) {
                        s.setString(1,actor.toString());s.setObject(2,actor);s.setString(3,realm);s.executeUpdate();
                    }
                    if(staff)try(var s=db.prepareStatement("insert into identity.employee(business_id,company_id,actor_id,display_name) values (?,?,?,?) on conflict(company_id,actor_id) do nothing")) {
                        s.setString(1,"emp_demo_"+label);s.setObject(2,company);s.setObject(3,actor);s.setString(4,"[DEMO] "+label);s.executeUpdate();
                    }
                    try(var s=db.prepareStatement("insert into identity.password_credential(actor_id,login_name,realm,password_hash,issuer,subject) values (?,?,?,?,'https://identity.htt.invalid/local',?)")) {
                        s.setObject(1,actor);s.setString(2,login);s.setString(3,realm);s.setString(4,encoder.encode(password));s.setString(5,actor.toString());s.executeUpdate();
                    }
                    System.out.println("Prepared local DEMO account: "+label+" (password not displayed)");
                }
                db.commit();System.out.println("Persistent local DEMO accounts committed; no financial/stock/notification writes.");
            }catch(Exception failure){db.rollback();if(failure instanceof SQLException sql)throw new IllegalStateException("Rolled back; SQLSTATE="+sql.getSQLState());throw failure;}
        }
    }
}
