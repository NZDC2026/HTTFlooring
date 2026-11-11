package au.com.htt.backend;

import java.sql.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/** Separate process: never starts HTTP, staff or portal connection pools. */
public final class WorkerMain {
    static Connection connect() throws SQLException {
        String url=System.getenv("HTT_WORKER_DATABASE_URL");
        if(url==null || !url.startsWith("jdbc:postgresql:") || url.contains("?"))
            throw new IllegalArgumentException("A PostgreSQL worker URL without query parameters is required");
        Properties p=new Properties();p.setProperty("user","htt_worker");
        p.setProperty("password",System.getenv().getOrDefault("HTT_WORKER_DATABASE_PASSWORD",""));
        p.setProperty("connectTimeout","5");p.setProperty("socketTimeout","45");
        p.setProperty("options","-c statement_timeout=10000 -c TimeZone=UTC");
        return DriverManager.getConnection(url,p);
    }
    static Object scalar(String sql,Object... args) throws SQLException {
        try(var c=connect();var s=c.prepareStatement(sql)) {
            s.setQueryTimeout(10);
            for(int i=0;i<args.length;i++)s.setObject(i+1,args[i]);
            try(var rs=s.executeQuery()){return rs.next()?rs.getObject(1):null;}
        }
    }
    public static void main(String[] args) throws Exception {
        try(var c=connect();var s=c.createStatement();var rs=s.executeQuery("select current_user")) {
            rs.next();if(!"htt_worker".equals(rs.getString(1)))throw new IllegalStateException("Restricted worker login required");
        }
        var stop=new AtomicBoolean();
        var pool=Executors.newScheduledThreadPool(8);
        Runnable shutdown=()->{
            stop.set(true);pool.shutdown();
            try {if(!pool.awaitTermination(45,TimeUnit.SECONDS))pool.shutdownNow();}
            catch(InterruptedException e){pool.shutdownNow();Thread.currentThread().interrupt();}
        };
        Runtime.getRuntime().addShutdownHook(new Thread(shutdown));
        schedule(pool,stop,OutboxExecutor::process,2);
        schedule(pool,stop,DispatchMailExecutor::tick,60);
        schedule(pool,stop,ReminderMailExecutor::tick,60);
        schedule(pool,stop,()->{while(!stop.get()&&((Number)scalar("select recurring.tick()")).intValue()>0){}},30);
        schedule(pool,stop,()->scalar("select crm.deliver_due_reminders(50)"),15);
        schedule(pool,stop,()->{while(!stop.get()&&DocumentExecutor.processOne()){}},2);
        for(String queue:List.of("card","geocode","push"))
            schedule(pool,stop,()->{while(!stop.get()&&ProviderExecutor.process(queue)){}},2);
        if("true".equalsIgnoreCase(System.getenv("HTT_BANKFEEDS_ENABLED")))
            schedule(pool,stop,()->{while(!stop.get()&&ProviderExecutor.process("feed")){}},2);
        while(!stop.get())Thread.sleep(250);
        pool.awaitTermination(45,TimeUnit.SECONDS);
    }
    interface Work {void run() throws Exception;}
    static void schedule(ScheduledExecutorService pool,AtomicBoolean stop,Work work,int seconds) {
        pool.scheduleWithFixedDelay(()->{if(!stop.get())try{work.run();}catch(Exception e){
            // Do not expose payloads, credentials or database exception details.
            System.err.println("Worker iteration failed: "+e.getClass().getSimpleName());
        }},0,seconds,TimeUnit.SECONDS);
    }
}
