import java.sql.*;

/** Exact HTT development targets only. Read-only row-count inventory; no data export. */
class ConsolidateDevelopmentDatabase {
    static String url(String database) {return "jdbc:postgresql://192.168.10.174:5432/"+database+"?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api";}
    public static void main(String[] args)throws Exception {
        if(args.length!=2||!args[0].equals("inventory")||!java.util.Set.of("htt_management","htt_management_validation").contains(args[1]))throw new IllegalArgumentException("inventory exact HTT database");
        String db=args[1];
        if(!url(db).equals(System.getenv("HTT_DB_URL"))||!(db+"_migrator").equals(System.getenv("HTT_DB_MIGRATION_USERNAME")))throw new IllegalStateException("Target mismatch");
        try(var c=DriverManager.getConnection(url(db),System.getenv("HTT_DB_MIGRATION_USERNAME"),System.getenv("HTT_DB_MIGRATION_PASSWORD"))) {
            c.setAutoCommit(false);c.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);c.setReadOnly(true);
            try(var s=c.createStatement();var r=s.executeQuery("select version,description from platform.flyway_schema_history where success order by installed_rank")) {
                StringBuilder history=new StringBuilder();while(r.next())history.append(r.getString(1)).append(' ').append(r.getString(2)).append('\n');
                System.out.println(db+" history:\n"+history);
            }
            try(var s=c.createStatement();var r=s.executeQuery("select schemaname,tablename from pg_tables where schemaname in ('identity','crm','catalog','inventory','notification','platform') order by 1,2")) {
                while(r.next()) {
                    String table="\""+r.getString(1)+"\".\""+r.getString(2)+"\"";
                    long count;try(var q=c.createStatement();var result=q.executeQuery("select count(*) from "+table)){result.next();count=result.getLong(1);}
                    System.out.println(db+" "+table+" rows="+count);

                }
            }
            c.rollback();
        }
    }
}
