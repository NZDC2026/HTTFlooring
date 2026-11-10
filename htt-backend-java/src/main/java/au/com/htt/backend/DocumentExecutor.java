package au.com.htt.backend;

import java.sql.*;
import java.util.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

final class DocumentExecutor {
    static final JsonMapper JSON=JsonMapper.builder().enable(tools.jackson.databind.cfg.JsonNodeFeature.USE_BIG_DECIMAL_FOR_FLOATS).disable(tools.jackson.databind.cfg.JsonNodeFeature.STRIP_TRAILING_BIGDECIMAL_ZEROES).build();
    record Failure(String code,String state) {}
    static boolean processOne() throws Exception {
        UUID id,lease;String kind;
        try(var c=WorkerMain.connect();var s=c.createStatement();var r=s.executeQuery("select id,lease_token,kind from platform.claim_document_job()")) {
            if(!r.next())return false;id=r.getObject(1,UUID.class);lease=r.getObject(2,UUID.class);kind=r.getString(3);
        }
        String state="SUCCEEDED",error=null,provider=null;byte[] bytes=null;boolean sending=false;
        try {
            JsonNode payload=JSON.readTree((String)WorkerMain.scalar("select platform.load_document_work(?,?)::text",id,lease));
            switch(kind) {
                case "PDF" -> bytes=DocumentRuntime.pdf(payload);
                case "EXPORT" -> bytes=DocumentRuntime.csv(payload);
                case "SCAN" -> {if(!DocumentRuntime.scan(Base64.getDecoder().decode(payload.get("content").asText()))){state="REJECTED";error="malware_detected";}}
                case "EMAIL" -> {sending=true;provider=DocumentRuntime.mail(id,payload);}
                default -> {state="FAILED";error="unsupported_work";}
            }
        } catch(DocumentRuntime.WorkException e){state=e.state;error=e.code;}
          catch(SQLException e){if(Set.of("42501","HD409","HT404").contains(e.getSQLState())){state="FAILED";error="document_access_changed";}else{state="RETRY";error="document_worker_unavailable";}}
          catch(Exception e){state=sending?"UNKNOWN":"RETRY";error=sending?"mail_outcome_unknown":"document_worker_unavailable";}
        // Independent connection/query deadline ensures completion survives interrupted work.
        WorkerMain.scalar("select platform.finish_document_work(?,?,?,?,?,?)",id,lease,state,error,bytes,provider);
        return true;
    }
}
