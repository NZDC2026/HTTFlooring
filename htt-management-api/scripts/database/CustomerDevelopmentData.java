import java.sql.*;

/** Explicit existing DEMO fixtures only. Does not create passwords, users, balances or notifications. */
class CustomerDevelopmentData {
    public static void main(String[] args)throws Exception {
        if(args.length!=0||!"true".equals(System.getenv("HTT_DEVELOPMENT_DATA"))) throw new IllegalArgumentException("Development opt-in required");
        String database="htt_management",url="jdbc:postgresql://192.168.10.174:5432/"+database+"?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";
        if(!url.equals(System.getenv("HTT_DB_URL"))||!(database+"_migrator").equals(System.getenv("HTT_DB_MIGRATION_USERNAME"))) throw new IllegalStateException("Main development fixture target mismatch");
        try(var db=DriverManager.getConnection(url,System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            db.setAutoCommit(false);
            try {
                try(var s=db.createStatement();var r=s.executeQuery("select count(*) from platform.flyway_schema_history where success and version in ('7','8','9')")) {
                    r.next();if(r.getInt(1)!=3)throw new IllegalStateException("Apply validated migrations first");
                }
                for(String suffix:new String[]{"A","B"}) {
                    String region=suffix.equals("A")?"VIC":"NSW";
                    try(var s=db.prepareStatement("select id from identity.company where code=? and name=?")) {
                        s.setString(1,"HTT-DEMO-"+suffix);s.setString(2,"[DEMO] Company "+suffix);
                        try(var r=s.executeQuery()) {
                            if(!r.next())throw new IllegalStateException("Expected existing marked DEMO company");
                            var company=r.getObject(1,java.util.UUID.class);
                            try(var insert=db.prepareStatement("insert into crm.customer_workspace(company_id,region,currency,next_number) "
                                    +"select ?,?,'AUD',count(*)+1 from crm.customer where company_id=? on conflict(company_id) do nothing")) {
                                insert.setObject(1,company);insert.setString(2,region);insert.setObject(3,company);insert.executeUpdate();
                            }
                            try(var check=db.prepareStatement("select region,currency from crm.customer_workspace where company_id=?")) {
                                check.setObject(1,company);try(var current=check.executeQuery()){current.next();if(!region.equals(current.getString(1))||!"AUD".equals(current.getString(2)))throw new IllegalStateException("Existing workspace differs; refusing overwrite");}
                            }
                            if(suffix.equals("A")) {
                                for(String permission:new String[]{"customer:read","customer:create","customer:update","customer:status","customer:account:create","customer:account:status","customer:account:reset"}) {
                                    try(var grant=db.prepareStatement("insert into identity.role_permission(company_id,role_id,permission_code) "
                                            +"select company_id,id,? from identity.role where company_id=? and code='DEMO-MANAGER' on conflict do nothing")) {
                                        grant.setString(1,permission);grant.setObject(2,company);if(grant.executeUpdate()==0) {
                                            try(var exists=db.prepareStatement("select count(*) from identity.role_permission p join identity.role r on r.company_id=p.company_id and r.id=p.role_id where r.company_id=? and r.code='DEMO-MANAGER' and p.permission_code=?")) {
                                                exists.setObject(1,company);exists.setString(2,permission);try(var row=exists.executeQuery()){row.next();if(row.getInt(1)!=1)throw new IllegalStateException("DEMO manager role missing");}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                db.commit();System.out.println("Existing marked DEMO workspaces and manager customer permissions configured. No real roles changed.");
            }catch(Exception failure){db.rollback();if(failure instanceof SQLException sql)throw new IllegalStateException("Setup rolled back; SQLSTATE="+sql.getSQLState());throw failure;}
        }
    }
}
