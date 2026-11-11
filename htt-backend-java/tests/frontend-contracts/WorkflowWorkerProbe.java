package au.com.htt.backend;
import java.util.*;
import java.net.http.HttpHeaders;
/** Synthetic database + fake provider. Never uses the production transport. */
public final class WorkflowWorkerProbe {
 public static void main(String[] args) throws Exception {
  var settings=Map.of("HTT_MAIL_API_KEY","synthetic-never-sent");var calls=new java.util.concurrent.atomic.AtomicInteger();
  ProviderRuntime.Transport fake=(r,limit)->{
   if(!r.headers().firstValue("Idempotency-Key").orElseThrow().startsWith("htt-document/"))throw new AssertionError("No durable key");
   var bytes=new java.io.ByteArrayOutputStream();var complete=new java.util.concurrent.CompletableFuture<byte[]>();
   r.bodyPublisher().orElseThrow().subscribe(new java.util.concurrent.Flow.Subscriber<java.nio.ByteBuffer>() {
    public void onSubscribe(java.util.concurrent.Flow.Subscription s){s.request(Long.MAX_VALUE);}
    public void onNext(java.nio.ByteBuffer b){byte[] part=new byte[b.remaining()];b.get(part);bytes.writeBytes(part);}
    public void onError(Throwable t){complete.completeExceptionally(t);}
    public void onComplete(){complete.complete(bytes.toByteArray());}
   });
   var payload=DocumentExecutor.JSON.readTree(complete.get(2,java.util.concurrent.TimeUnit.SECONDS));
   if(payload.has("attachments"))for(var attachment:payload.get("attachments")){
    String key=r.headers().firstValue("Idempotency-Key").orElseThrow().substring("htt-document/".length());
    if(!attachment.get("filename").asText().replace("-","").equals(key+".pdf"))throw new AssertionError("Preview attachment identity differs from mail");
    byte[] pdf=Base64.getDecoder().decode(attachment.get("content").asText());
    if(pdf.length<5||!new String(pdf,0,5,java.nio.charset.StandardCharsets.US_ASCII).equals("%PDF-"))throw new AssertionError("Attachment is not a PDF");
   }
   calls.incrementAndGet();return new ProviderRuntime.Reply(200,DocumentExecutor.JSON.readTree("{\"id\":\"synthetic-provider-"+calls.get()+"\"}"),HttpHeaders.of(Map.of(),(a,b)->true));
  };
  if(!DispatchMailExecutor.one(settings,fake))throw new AssertionError("No dispatch mail claimed");
  if(!ReminderMailExecutor.one(settings,fake))throw new AssertionError("No invoice reminder claimed");
  if(!ReminderMailExecutor.one(settings,fake))throw new AssertionError("No statement reminder claimed");
  if(calls.get()!=3)throw new AssertionError("Rendering failed before fake-provider call: "+calls);
  System.out.println("WORKER_PROBE_PASSED: three synthetic sends accepted; real HTTP transport never invoked");
 }
}
