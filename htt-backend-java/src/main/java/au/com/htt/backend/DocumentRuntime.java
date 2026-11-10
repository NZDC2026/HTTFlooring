package au.com.htt.backend;

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import tools.jackson.databind.JsonNode;

final class DocumentRuntime {
    static final int MAX=10*1024*1024;
    static final class WorkException extends Exception {
        final String code,state;
        WorkException(String code,String state){super(code);this.code=code;this.state=state;}
    }
    static String env(String key){return System.getenv().getOrDefault(key,"");}
    static byte[] bounded(InputStream in,int limit) throws IOException {
        byte[] b=in.readNBytes(limit+1);if(b.length>limit)throw new IOException("Output limit");return b;
    }
    static byte[] pdf(JsonNode payload) throws Exception {
        Path dir=Files.createTempDirectory("htt-pdf-");Process process=null;
        ExecutorService readers=Executors.newFixedThreadPool(2);
        try {
            for(String name:List.of("render_pdf.py","render_report_pack.py")) {
                try(var in=DocumentRuntime.class.getResourceAsStream("/Documents/"+name)) {
                    if(in==null)throw new WorkException("pdf_runtime_unavailable","FAILED");
                    Files.copy(in,dir.resolve(name));
                }
            }
            var builder=new ProcessBuilder(env("HTT_PYTHON").isBlank()?"python3":env("HTT_PYTHON"),dir.resolve("render_pdf.py").toString());
            builder.environment().put("PYTHONDONTWRITEBYTECODE","1");
            process=builder.start();final Process running=process;
            Future<byte[]> output=readers.submit(()->bounded(running.getInputStream(),MAX));
            Future<byte[]> errors=readers.submit(()->bounded(running.getErrorStream(),4096));
            try(var stdin=process.getOutputStream()){stdin.write(payload.toString().getBytes(StandardCharsets.UTF_8));}
            if(!process.waitFor(40,TimeUnit.SECONDS))throw new WorkException("pdf_timeout","RETRY");
            byte[] result=output.get(1,TimeUnit.SECONDS);errors.get(1,TimeUnit.SECONDS);
            if(process.exitValue()!=0)throw new WorkException("pdf_render_failed","FAILED");
            if(result.length<5||!new String(result,0,5,StandardCharsets.US_ASCII).equals("%PDF-"))throw new WorkException("pdf_invalid_output","FAILED");
            return result;
        }catch(IOException e){throw new WorkException("pdf_runtime_unavailable","FAILED");}
        catch(ExecutionException e){throw new WorkException("pdf_output_limit","FAILED");}
        finally {
            if(process!=null&&process.isAlive()){process.descendants().forEach(ProcessHandle::destroyForcibly);process.destroyForcibly();}
            readers.shutdownNow();
            try(var files=Files.walk(dir)){for(Path f:files.sorted(Comparator.reverseOrder()).toList())Files.deleteIfExists(f);}
        }
    }
    static String safe(String value) {
        int i=0;while(i<value.length()&&(value.charAt(i)>=9&&value.charAt(i)<=13||value.charAt(i)==0x85||Character.isSpaceChar(value.charAt(i))||"\ufeff\u200b\u2060".indexOf(value.charAt(i))>=0))i++;
        return i<value.length()&&("=+-@".indexOf(value.charAt(i))>=0||"\t\r\n".indexOf(value.charAt(0))>=0)?"'"+value:value;
    }
    static void row(StringBuilder out,List<String> cells) throws WorkException {
        for(int i=0;i<cells.size();i++){if(i>0)out.append(',');out.append('"').append(cells.get(i).replace("\"","\"\"")).append('"');}
        out.append("\r\n");if(out.length()>MAX)throw new WorkException("export_snapshot_invalid","FAILED");
    }
    static byte[] csv(JsonNode data) throws WorkException {
        try {
            var columns=data.get("columns");var rows=data.get("rows");
            if(!columns.isArray()||!rows.isArray()||columns.size()<1||columns.size()>20||rows.size()>5000)throw new IllegalArgumentException();
            StringBuilder out=new StringBuilder("\ufeff");
            row(out,List.of("HTT REPORT",safe(data.get("kind").asText())));
            row(out,List.of("Snapshot SHA256",data.get("snapshotHash").asText()));
            var metadata=data.deepCopy();var object=(tools.jackson.databind.node.ObjectNode)metadata;
            object.remove(List.of("rows","columns","filename"));
            row(out,List.of("Metadata",safe(legacyJson(object))));row(out,List.of());
            var labels=new ArrayList<String>();for(var col:columns)labels.add(safe(col.get("label").asText()));row(out,labels);
            for(var item:rows){var cells=new ArrayList<String>();for(var col:columns){var v=item.get(col.get("key").asText());String value=v==null||v.isNull()?"":v.isString()?v.asText():v.toString();
                if(value.indexOf(0)>=0)throw new IllegalArgumentException();
                if(!value.isEmpty()&&"decimal".equals(col.get("type").asText())){if(!value.matches("[+-]?[0-9]+(?:\\.[0-9]+)?"))throw new IllegalArgumentException();value=new BigDecimal(value).toPlainString();}else value=safe(value);cells.add(value);}row(out,cells);}
            byte[] result=out.toString().getBytes(StandardCharsets.UTF_8);if(result.length>MAX)throw new IllegalArgumentException();return result;
        }catch(RuntimeException e){throw new WorkException("export_snapshot_invalid","FAILED");}
    }
    static String legacyJson(JsonNode node) {
        if(node.isString())return CollaborationCreate.legacyString(node.asText());
        if(node.isArray()){var values=new ArrayList<String>();for(var value:node)values.add(legacyJson(value));return "["+String.join(",",values)+"]";}
        if(node.isObject()){var values=new ArrayList<String>();for(var entry:node.properties())values.add(CollaborationCreate.legacyString(entry.getKey())+":"+legacyJson(entry.getValue()));return "{"+String.join(",",values)+"}";}
        return node.toString();
    }
    static final ScheduledExecutorService SCAN_TIMER=Executors.newSingleThreadScheduledExecutor(task->{var t=new Thread(task,"htt-scan-deadline");t.setDaemon(true);return t;});
    static boolean scan(byte[] data) throws Exception {
        if(env("HTT_CLAMAV_HOST").isBlank())throw new WorkException("scanner_unconfigured","FAILED");
        try(var socket=new Socket()){
            var deadline=SCAN_TIMER.schedule(()->{try{socket.close();}catch(IOException ignored){}},30,TimeUnit.SECONDS);
            try {
            socket.connect(new InetSocketAddress(env("HTT_CLAMAV_HOST"),Integer.parseInt(env("HTT_CLAMAV_PORT").isBlank()?"3310":env("HTT_CLAMAV_PORT"))),5000);socket.setSoTimeout(30000);
            var out=new DataOutputStream(socket.getOutputStream());out.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));
            for(int offset=0;offset<data.length;offset+=8192){int count=Math.min(8192,data.length-offset);out.writeInt(count);out.write(data,offset,count);}out.writeInt(0);out.flush();
            var reply=new ByteArrayOutputStream();int b;while(reply.size()<1024&&(b=socket.getInputStream().read())>0)reply.write(b);
            String result=reply.toString(StandardCharsets.UTF_8);if(result.equals("stream: OK"))return true;if(result.startsWith("stream: ")&&result.endsWith(" FOUND"))return false;throw new WorkException("scanner_error","RETRY");
            }finally{deadline.cancel(false);}
        }catch(IOException e){throw new WorkException("scanner_unavailable","RETRY");}
    }
    static String mail(UUID id,JsonNode payload) throws Exception {
        return mail(id,payload,System.getenv(),ProviderRuntime::http);
    }
    static String mail(UUID id,JsonNode payload,Map<String,String> settings,ProviderRuntime.Transport transport) throws Exception {
        if(settings.getOrDefault("HTT_MAIL_API_KEY","").isBlank())throw new WorkException("mail_unconfigured","FAILED");
        var request=HttpRequest.newBuilder(URI.create("https://api.resend.com/emails")).timeout(Duration.ofSeconds(30))
            .header("Authorization","Bearer "+settings.getOrDefault("HTT_MAIL_API_KEY","")).header("Content-Type","application/json")
            .header("Idempotency-Key","htt-document/"+id.toString().replace("-",""))
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString())).build();
        try {
            var response=transport.send(request,16384);
            int status=response.status();if(status==429||status>=500)throw new WorkException("mail_provider_temporary","RETRY");
            if(status==409)throw new WorkException("mail_idempotency_conflict","UNKNOWN");
            if(status<200||status>=300)throw new WorkException("mail_provider_rejected","FAILED");
            JsonNode receipt=response.json();var provider=receipt==null?null:receipt.get("id");
            if(provider==null||!provider.isString()||provider.asText().isBlank()||provider.asText().length()>200)throw new WorkException("mail_receipt_invalid","UNKNOWN");return provider.asText();
        }catch(ProviderRuntime.LimitException e){
            if(e.status==409)throw new WorkException("mail_idempotency_conflict","UNKNOWN");
            if(e.status>=300)throw new WorkException("mail_provider_rejected","FAILED");
            throw new WorkException("mail_receipt_invalid","UNKNOWN");
        }catch(IOException|InterruptedException e){throw new WorkException("mail_outcome_unknown","UNKNOWN");}
    }
}
