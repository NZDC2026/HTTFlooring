package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;
import java.net.http.*;
class DeliveryContractTest {
    @Test void mailUsesStableKeyAndPreservesUncertainReceipts() throws Exception {
        var id=UUID.randomUUID();var config=Map.of("HTT_MAIL_API_KEY","synthetic");var body=DocumentExecutor.JSON.readTree("{\"to\":[\"synthetic@example.invalid\"]}");
        assertEquals("synthetic-receipt",DocumentRuntime.mail(id,body,config,(request,limit)->{
            assertEquals("htt-document/"+id.toString().replace("-",""),request.headers().firstValue("Idempotency-Key").orElseThrow());
            assertEquals("api.resend.com",request.uri().getHost());assertEquals(16384,limit);
            return ProviderContractTest.reply(200,"{\"id\":\"synthetic-receipt\"}");
        }));
        assertEquals("UNKNOWN",assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.mail(id,body,config,(r,l)->ProviderContractTest.reply(200,"{}"))).state);
        assertEquals("UNKNOWN",assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.mail(id,body,config,(r,l)->{throw new java.io.IOException();})).state);
        assertEquals("RETRY",assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.mail(id,body,config,(r,l)->ProviderContractTest.reply(503,null))).state);
        assertEquals("FAILED",assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.mail(id,body,config,(r,l)->ProviderContractTest.reply(400,null))).state);
    }
    @Test void pushSignsOauthAndDoesNotExposeBusinessContent() throws Exception {
        var generator=java.security.KeyPairGenerator.getInstance("RSA");generator.initialize(2048);var pair=generator.generateKeyPair();
        String pem="-----BEGIN PRIVATE KEY-----\n"+Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded())+"\n-----END PRIVATE KEY-----";
        var config=Map.of("HTT_PUSH_PROJECT_ID","synthetic-project","HTT_PUSH_CLIENT_EMAIL","synthetic@example.invalid","HTT_PUSH_PRIVATE_KEY_PEM",pem);
        var work=DocumentExecutor.JSON.readTree("{\"token\":\"synthetic-device\",\"messageId\":\"m\",\"companyId\":\"c\",\"sourceType\":\"TASK\",\"sourceId\":\"s\"}");
        ProviderRuntime.token=null;var calls=new java.util.concurrent.atomic.AtomicInteger();
        var result=ProviderRuntime.push(work,config,(request,limit)->{
            calls.incrementAndGet();
            if(request.uri().getHost().equals("oauth2.googleapis.com"))return ProviderContractTest.reply(200,"{\"access_token\":\"synthetic-bearer\",\"expires_in\":3600}");
            assertEquals("Bearer synthetic-bearer",request.headers().firstValue("Authorization").orElseThrow());
            return ProviderContractTest.reply(200,"{\"name\":\"projects/synthetic/messages/1\"}");
        });assertEquals("SUCCEEDED",result.state());assertEquals(2,calls.get());
        var unknown=ProviderRuntime.push(work,config,(r,l)->{throw new java.io.IOException();});assertEquals("UNKNOWN",unknown.state());
        var unregistered=ProviderRuntime.push(work,config,(r,l)->ProviderContractTest.reply(400,"{\"error\":{\"details\":[{\"errorCode\":\"UNREGISTERED\"}]}}"));assertEquals("push_token_unregistered",unregistered.error());
        ProviderRuntime.token=null;
    }
}
