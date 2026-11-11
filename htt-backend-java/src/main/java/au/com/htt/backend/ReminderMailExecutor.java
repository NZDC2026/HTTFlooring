package au.com.htt.backend;
import java.util.*;
import tools.jackson.databind.node.ObjectNode;
final class ReminderMailExecutor {
    static boolean enabled(){return "true".equalsIgnoreCase(System.getenv("HTT_INVOICE_REMINDERS_ENABLED"))&&!DocumentRuntime.env("HTT_MAIL_API_KEY").isBlank();}
    static void heartbeat() throws Exception {if(enabled())WorkerMain.scalar("select accounting.reminder_tick_ready()");}
    static void tick() throws Exception {
        if(!enabled())return;
        for(int i=0;i<10;i++)if(!one())break;
    }
    static boolean one() throws Exception {return one(System.getenv(),ProviderRuntime::http);}
    static boolean one(Map<String,String> settings,ProviderRuntime.Transport transport) throws Exception {
        String raw=(String)WorkerMain.scalar("select accounting.claim_reminder_mail()::text");if(raw==null)return false;
        var job=DocumentExecutor.JSON.readTree(raw);UUID id=UUID.fromString(job.get("id").asText()),lease=UUID.fromString(job.get("lease").asText());
        String outcome="ACCEPTED",error=null,provider=null;boolean sending=false;
        try {
            byte[] pdf=DocumentRuntime.pdf(job.get("pdf"));
            String fresh=(String)WorkerMain.scalar("select accounting.load_reminder_mail(?,?)::text",id,lease);
            if(fresh==null)return true;
            ObjectNode payload=(ObjectNode)DocumentExecutor.JSON.readTree(fresh);
            payload.putArray("attachments").addObject().put("filename",id+".pdf").put("content",Base64.getEncoder().encodeToString(pdf));
            sending=true;provider=DocumentRuntime.mail(id,payload,settings,transport);
        }catch(DocumentRuntime.WorkException e){outcome=Set.of("UNKNOWN","RETRY").contains(e.state)&&sending?"UNKNOWN":"FAILED";error=e.code;}
        catch(Exception e){outcome=sending?"UNKNOWN":"FAILED";error=sending?"mail_outcome_unknown":"pdf_render_failed";}
        WorkerMain.scalar("select accounting.finish_reminder_mail(?,?,?,?,?)",id,lease,outcome,error,provider);return true;
    }
}
