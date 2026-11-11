package au.com.htt.backend;
import java.security.SecureRandom;
import java.util.*;
import tools.jackson.databind.json.JsonMapper;
final class DispatchMailExecutor {
    private static final SecureRandom RANDOM=new SecureRandom();
    static boolean enabled(){return "true".equalsIgnoreCase(System.getenv("HTT_DISPATCH_FOLLOWUPS_ENABLED"))&&!DocumentRuntime.env("HTT_MAIL_API_KEY").isBlank();}
    static void heartbeat() throws Exception {if(enabled())WorkerMain.scalar("select sales.dispatch_tick_ready()");}
    static void tick() throws Exception {
        if(!enabled())return;
        WorkerMain.scalar("select sales.expire_dispatch_quotes()");
        for(int i=0;i<20;i++)if(!one())break;
    }
    static boolean one() throws Exception {return one(System.getenv(),ProviderRuntime::http);}
    static boolean one(Map<String,String> settings,ProviderRuntime.Transport transport) throws Exception {
        byte[] token=new byte[32];RANDOM.nextBytes(token);
        String raw=(String)WorkerMain.scalar("select sales.claim_dispatch_mail(?)::text",HexFormat.of().formatHex(token));
        if(raw==null)return false;
        var job=JsonMapper.builder().build().readTree(raw);
        UUID id=UUID.fromString(job.get("id").asText()),lease=UUID.fromString(job.get("lease").asText());
        String outcome="ACCEPTED",error=null,provider=null;
        try {
            String current=(String)WorkerMain.scalar("select sales.load_dispatch_mail(?,?)::text",id,lease);
            if(current==null)return true;
            provider=DocumentRuntime.mail(id,DocumentExecutor.JSON.readTree(current),settings,transport);
        }
        catch(DocumentRuntime.WorkException e){outcome=e.state;error=e.code;}
        catch(Exception e){outcome="UNKNOWN";error="mail_outcome_unknown";}
        WorkerMain.scalar("select sales.finish_dispatch_mail(?,?,?,?,?)",id,lease,outcome,error,provider);
        return true;
    }
}
