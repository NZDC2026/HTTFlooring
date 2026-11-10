package au.com.htt.backend;
import java.sql.*;
import java.util.*;
import tools.jackson.databind.JsonNode;

/** SQL functions own fencing, retry limits, access rechecks and durable state. */
final class ProviderExecutor {
    static boolean process(String queue) throws Exception {
        String schema=queue.equals("feed")?"bankfeeds":"crm";
        String suffix=queue.equals("feed")?"":"_"+queue;
        UUID id,lease;
        try(var c=WorkerMain.connect();var s=c.createStatement();var r=s.executeQuery("select job_id,lease from "+schema+".claim"+suffix+"()")) {
            if(!r.next())return false;id=r.getObject(1,UUID.class);lease=r.getObject(2,UUID.class);
        }
        String state="SUCCEEDED",error=null,provider=null,kind="";JsonNode data=null;boolean sending=false;int retry=0;
        try {
            JsonNode payload=DocumentExecutor.JSON.readTree((String)WorkerMain.scalar("select "+schema+".load"+suffix+"(?,?)::text",id,lease));
            switch(queue) {
                case "card" -> {
                    if(!DocumentRuntime.scan(Base64.getDecoder().decode(payload.get("content").asText()))){state="REJECTED";error="malware_detected";}
                    else data=ProviderRuntime.card(id,payload);
                }
                case "geocode" -> data=ProviderRuntime.geocode(payload);
                case "feed" -> {kind=payload.get("kind").asText();data=ProviderRuntime.feed(payload);}
                case "push" -> {sending=true;var result=ProviderRuntime.push(payload);state=result.state();error=result.error();provider=result.provider();retry=result.retry();}
                default -> throw new IllegalArgumentException();
            }
        }catch(DocumentRuntime.WorkException e){state=e.state;error=e.code;}
        catch(SQLException e){
            if(Set.of("42501","HT404").contains(e.getSQLState()) || queue.equals("feed")&&"HR409".equals(e.getSQLState())){state=queue.equals("push")?"CANCELLED":"FAILED";error=(queue.equals("card")?"card":queue.equals("feed")?"feed":queue)+"_access_changed";}
            else if(queue.equals("geocode")&&"HR409".equals(e.getSQLState())){state="STALE";error="address_changed";}
            else {state="RETRY";error=queue+"_worker_unavailable";}
        }catch(Exception e){state=sending||kind.equals("REVOKE")?"UNKNOWN":"RETRY";error=queue.equals("push")?(sending?"push_delivery_uncertain":"push_worker_unavailable"):queue.equals("feed")?"feed_worker_interrupted":queue+"_worker_unavailable";}
        if(queue.equals("push"))WorkerMain.scalar("select crm.finish_push(?,?,?,?,?,?)",id,lease,state,error,provider,retry);
        else {
            String sql="select "+schema+".finish"+suffix+"(?,?,?,?,?::jsonb)";
            try{WorkerMain.scalar(sql,id,lease,state,error,data==null?null:data.toString());}
            catch(SQLException e){if((queue.equals("card")||queue.equals("geocode"))&&Set.of("HR422","23514").contains(e.getSQLState()))WorkerMain.scalar(sql,id,lease,"FAILED",queue.equals("card")?"card_ocr_invalid_output":"geocode_invalid_output",null);else throw e;}
        }
        return true;
    }
}
