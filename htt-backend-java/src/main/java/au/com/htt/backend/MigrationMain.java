package au.com.htt.backend;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.*;
import java.util.*;

/** Explicit owner-only process. Never called by API or worker startup. */
final class MigrationMain {
    public static void main(String[] args) throws Exception {
        String url=System.getenv("HTT_MIGRATION_DATABASE_URL");
        if(url==null||!url.startsWith("jdbc:postgresql:")||url.contains("?"))throw new IllegalArgumentException("Owner JDBC URL required");
        Properties properties=new Properties();properties.setProperty("user","htt_owner");
        properties.setProperty("password",System.getenv().getOrDefault("HTT_MIGRATION_DATABASE_PASSWORD",""));properties.setProperty("connectTimeout","5");
        try(var connection=DriverManager.getConnection(url,properties)) {
            try(var gate=connection.createStatement()){gate.execute("select pg_advisory_lock(4848545441)");}
            try {
                try(var history=connection.createStatement()){history.execute("create table if not exists public.htt_schema_history(name text primary key,sha256 text not null,applied_at timestamptz not null default now()); revoke all on public.htt_schema_history from public");}
                String index=resource("index.txt");
                for(String name:index.lines().toList()) {
                    String sql=resource(name);
                    String digest=HexFormat.of().withUpperCase().formatHex(MessageDigest.getInstance("SHA-256").digest(sql.getBytes(StandardCharsets.UTF_8)));
                    String historyName=name.compareTo("056_")>=0?"Htt.Java.Database.Migrations."+name:"Htt.Infrastructure.Database.Migrations."+name;
                    try(var check=connection.prepareStatement("select sha256 from public.htt_schema_history where name=?")) {
                        check.setString(1,historyName);try(var result=check.executeQuery()) {if(result.next()){if(!digest.equals(result.getString(1)))throw new IllegalStateException("Applied migration changed: "+name);continue;}}
                    }
                    connection.setAutoCommit(false);
                    try {
                        try(var execute=connection.createStatement()){execute.setQueryTimeout(120);execute.execute(sql);}
                        try(var insert=connection.prepareStatement("insert into public.htt_schema_history(name,sha256) values(?,?)")){insert.setString(1,historyName);insert.setString(2,digest);insert.executeUpdate();}
                        connection.commit();System.out.println("Applied "+name);
                    }catch(Exception e){connection.rollback();throw e;}finally{connection.setAutoCommit(true);}
                }
            }finally{try(var release=connection.createStatement()){release.execute("select pg_advisory_unlock(4848545441)");}}
        }
    }
    static String resource(String name) throws Exception {
        try(var in=MigrationMain.class.getResourceAsStream("/db/migration/"+name)) {
            if(in==null)throw new IllegalStateException("Missing migration "+name);
            return new String(in.readAllBytes(),StandardCharsets.UTF_8);
        }
    }
}
