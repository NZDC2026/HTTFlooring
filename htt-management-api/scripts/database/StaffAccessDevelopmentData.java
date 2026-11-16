import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** Persistent, opt-in access fixtures. Existing accounts/passwords and edited fixture data are never reset. */
class StaffAccessDevelopmentData {
    private static final String PREFIX="htt-management-api:staff-access-demo:v1:";
    private static final String ISSUER="https://identity.htt.invalid/local";
    private static final String REASON="[DEMO ACCESS] Persistent manual acceptance fixture";
    private static final String[] LABELS={"group-admin","owner-a","owner-b","sales-multi"};
    private static final BCryptPasswordEncoder ENCODER=new BCryptPasswordEncoder(12);

    public static void main(String[] args) throws Exception {
        if(args.length!=1||!Set.of("inspect","seed").contains(args[0]))throw new IllegalArgumentException("Expected inspect or seed");
        String url=required("HTT_DB_URL");
        if(!url.equals("jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api")
                ||!required("HTT_DB_MIGRATION_USERNAME").equals("htt_management_migrator"))throw new IllegalStateException("Explicit development Main target required");
        boolean seed=args[0].equals("seed");
        if(seed&&!"true".equals(System.getenv("HTT_DEVELOPMENT_DATA")))throw new IllegalStateException("Development fixture opt-in required");
        try(var db=DriverManager.getConnection(url,required("HTT_DB_MIGRATION_USERNAME"),required("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try(var s=db.createStatement();var r=s.executeQuery("select shobj_description(oid,'pg_database') from pg_database where datname=current_database()")) {
                r.next();if(!"htt-management-api shared development/test; synthetic fixtures only".equals(r.getString(1)))throw new IllegalStateException("Development marker required");
            }
            try(var s=db.createStatement();var r=s.executeQuery("select pg_try_advisory_xact_lock(744610016)")) {
                r.next();if(!r.getBoolean(1))throw new IllegalStateException("Another configuration/test is running");
            }
            try(var s=db.createStatement();var r=s.executeQuery("select count(*) from platform.flyway_schema_history where success and version='14'")) {
                r.next();if(r.getInt(1)!=1)throw new IllegalStateException("Validated V14 required");
            }
            UUID a=company(db,"A"),b=company(db,"B");
            System.out.println("COMPANY_A="+a);System.out.println("COMPANY_B="+b);
            if(!seed) {inventory(db);db.rollback();return;}
            UUID assigned=customer(db,a,"assigned-a","DEMO-ACCESS-A-ASSIGNED");
            UUID unassigned=customer(db,a,"unassigned-a","DEMO-ACCESS-A-UNASSIGNED");
            UUID foreign=customer(db,b,"customer-b","DEMO-ACCESS-B");
            UUID support=role(db,a,"customer-support","customer:read");
            UUID price=role(db,a,"price-viewer","pricing:discount:read");
            for(String label:LABELS) {
                UUID actor=id(label),home=label.equals("owner-b")?b:a;
                boolean created=account(db,label,home);
                if(created) {
                    String profile=label.equals("group-admin")?"GROUP_READER":label.equals("sales-multi")?"SALES":"COMPANY_OWNER";
                    configure(db,actor,home,profile,label.equals("sales-multi")?new UUID[]{assigned}:new UUID[0],
                            label.equals("sales-multi")?new UUID[]{support,price}:new UUID[0]);
                    if(label.equals("group-admin"))configure(db,actor,b,profile,new UUID[0],new UUID[0]);
                }
                System.out.println("ACCOUNT_"+label.toUpperCase(Locale.ROOT).replace('-','_')+"="+actor);
            }
            db.commit();
            var manifest="""
                {
                  "companyA":"%s", "companyB":"%s",
                  "assignedCustomer":"cus_%s", "unassignedCustomer":"cus_%s", "companyBCustomer":"cus_%s",
                  "groupActor":"%s", "ownerAActor":"%s", "ownerBActor":"%s", "salesActor":"%s"
                }
                """.formatted(a,b,assigned,unassigned,foreign,id("group-admin"),id("owner-a"),id("owner-b"),id("sales-multi"));
            Files.createDirectories(Path.of(".local"));
            Files.writeString(Path.of(".local/staff-access-demo-manifest.json"),manifest,StandardCharsets.UTF_8);
            System.out.println("Persistent marked fixtures committed. Existing credentials retained. No financial, inventory or notification writes.");
        } catch(SQLException failure) {
            throw new IllegalStateException("Fixture transaction failed; SQLSTATE="+failure.getSQLState()+". Existing passwords were not reset.");
        }
    }
    private static void inventory(Connection db) throws SQLException {
        try(var q=db.prepareStatement("""
            select (select count(*) from identity.password_credential where actor_id=any(?) and realm='STAFF'),
             (select count(*) from identity.company_member where user_id=any(?) and status='ACTIVE'),
             (select count(*) from crm.customer where id=any(?)),
             (select count(*) from identity.member_role where user_id=?),
             (select count(*) from identity.resource_grant where user_id=? and scope='CUSTOMER' and enabled)
            """)) {
            var actors=db.createArrayOf("uuid",Arrays.stream(LABELS).map(StaffAccessDevelopmentData::id).toArray(UUID[]::new));
            q.setArray(1,actors);q.setArray(2,actors);
            q.setArray(3,db.createArrayOf("uuid",new UUID[]{id("customer-assigned-a"),id("customer-unassigned-a"),id("customer-customer-b")}));
            q.setObject(4,id("sales-multi"));q.setObject(5,id("sales-multi"));
            try(var r=q.executeQuery()) {
                r.next();String[] keys={"PROFILE_ACCOUNTS","PROFILE_MEMBERSHIPS","PROFILE_CUSTOMERS","SALES_ROLES","SALES_CUSTOMER_GRANTS"};
                for(int i=0;i<keys.length;i++)System.out.println(keys[i]+"="+r.getLong(i+1));
            }
        }
    }
    private static UUID company(Connection db,String suffix) throws SQLException {
        try(var q=db.prepareStatement("select c.id,w.currency from identity.company c left join crm.customer_workspace w on w.company_id=c.id where c.code=? and c.name=? and c.status='ACTIVE'")) {
            q.setString(1,"HTT-DEMO-"+suffix);q.setString(2,"[DEMO] Company "+suffix);
            try(var r=q.executeQuery()) {
                if(!r.next())throw new IllegalStateException("Marked DEMO company "+suffix+" missing");
                UUID result=r.getObject(1,UUID.class);
                if(!"AUD".equals(r.getString(2))||r.next())throw new IllegalStateException("Marked DEMO workspace differs or is incomplete");
                return result;
            }
        }
    }
    private static UUID customer(Connection db,UUID company,String label,String code) throws SQLException {
        UUID customer=id("customer-"+label);String name="[DEMO ACCESS] "+label;
        try(var q=db.prepareStatement("select company_id,business_id,business_name from crm.customer where id=?")) {
            q.setObject(1,customer);try(var r=q.executeQuery()) {
                if(r.next()) {
                    if(!company.equals(r.getObject(1,UUID.class))||!("cus_"+customer).equals(r.getString(2))||!name.equals(r.getString(3)))throw new IllegalStateException("Fixture customer collision");
                    return customer;
                }
            }
        }
        execute(db,"insert into crm.customer(id,company_id,business_id,code,business_name,currency,internal_notes) values (?,?,?,?,?,'AUD','Synthetic access fixture; not for trading, accounting or fulfilment')",
                customer,company,"cus_"+customer,code,name);
        return customer;
    }
    private static UUID role(Connection db,UUID company,String label,String permission) throws SQLException {
        UUID role=id("role-"+label);String code="DEMO-ACCESS-"+label.toUpperCase(Locale.ROOT);
        try(var q=db.prepareStatement("select company_id,code from identity.role where id=?")) {
            q.setObject(1,role);try(var r=q.executeQuery()) {
                if(r.next()) {
                    if(!company.equals(r.getObject(1,UUID.class))||!code.equals(r.getString(2)))throw new IllegalStateException("Fixture role collision");
                    return role;
                }
            }
        }
        execute(db,"insert into identity.role(company_id,id,code) values (?,?,?)",company,role,code);
        execute(db,"insert into identity.role_permission(company_id,role_id,permission_code) values (?,?,?)",company,role,permission);
        return role;
    }
    private static boolean account(Connection db,String label,UUID home) throws SQLException {
        UUID actor=id(label);String login=label+"@htt-demo.invalid",name="[DEMO ACCESS] "+label;
        String password=required("HTT_ACCESS_PASSWORD_"+label.toUpperCase(Locale.ROOT).replace('-','_'));
        try(var q=db.prepareStatement("select u.display_name,p.login_name,p.realm,p.password_hash from identity.user_account u left join identity.password_credential p on p.actor_id=u.id where u.id=?")) {
            q.setObject(1,actor);try(var r=q.executeQuery()) {
                if(r.next()) {
                    if(!name.equals(r.getString(1))||!login.equals(r.getString(2))||!"STAFF".equals(r.getString(3))||!ENCODER.matches(password,r.getString(4)))
                        throw new IllegalStateException("Existing fixture credential differs; refusing reset");
                    return false;
                }
            }
        }
        execute(db,"insert into identity.user_account(id,display_name) values (?,?)",actor,name);
        execute(db,"insert into identity.external_identity(issuer,subject,user_id,realm) values (?,?,?,'STAFF')",ISSUER,actor.toString(),actor);
        execute(db,"insert into identity.employee(id,business_id,company_id,actor_id,display_name) values (?,?,?,?,?)",id("employee-"+label),"emp_demo_access_"+label,home,actor,name);
        execute(db,"insert into identity.password_credential(actor_id,login_name,realm,password_hash,issuer,subject) values (?,?,'STAFF',?,?,?)",actor,login,ENCODER.encode(password),ISSUER,actor.toString());
        return true;
    }
    private static void configure(Connection db,UUID actor,UUID company,String profile,UUID[] customers,UUID[] roles) throws SQLException {
        try(var q=db.prepareStatement("select identity.configure_staff_access(?,?,?,?,?,?)")) {
            q.setObject(1,actor);q.setObject(2,company);q.setString(3,profile);q.setArray(4,db.createArrayOf("uuid",customers));
            q.setArray(5,db.createArrayOf("uuid",roles));q.setString(6,REASON);q.execute();
        }
    }
    private static UUID id(String label) {return UUID.nameUUIDFromBytes((PREFIX+label).getBytes(StandardCharsets.UTF_8));}
    private static void execute(Connection db,String sql,Object...values)throws SQLException {
        try(var q=db.prepareStatement(sql)){for(int i=0;i<values.length;i++)q.setObject(i+1,values[i]);q.executeUpdate();}
    }
    private static String required(String name) {String value=System.getenv(name);if(value==null||value.isBlank())throw new IllegalStateException("Missing environment "+name);return value;}
}
