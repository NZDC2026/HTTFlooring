package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

class ProviderRuntimeTest {
    @Test void boundedHttpDoesNotFollowRedirectOrLoseFailureStatus() throws Exception {
        var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        var reached=new java.util.concurrent.atomic.AtomicBoolean();
        server.createContext("/redirect",x->{x.getResponseHeaders().add("Location","/must-not-send");x.sendResponseHeaders(307,-1);x.close();});
        server.createContext("/must-not-send",x->{reached.set(true);x.sendResponseHeaders(200,-1);x.close();});
        server.createContext("/busy",x->{byte[] body="not JSON".getBytes();x.sendResponseHeaders(503,body.length);x.getResponseBody().write(body);x.close();});
        server.createContext("/large",x->{byte[] body=new byte[1024];x.sendResponseHeaders(200,body.length);x.getResponseBody().write(body);x.close();});
        server.start();
        try {
            String base="http://127.0.0.1:"+server.getAddress().getPort();
            assertEquals(307,ProviderRuntime.http(HttpRequest.newBuilder(URI.create(base+"/redirect")).POST(HttpRequest.BodyPublishers.ofString("synthetic")).build(),1024).status());
            assertFalse(reached.get());
            assertEquals(503,ProviderRuntime.http(HttpRequest.newBuilder(URI.create(base+"/busy")).GET().build(),1024).status());
            assertThrows(java.io.IOException.class,()->ProviderRuntime.http(HttpRequest.newBuilder(URI.create(base+"/large")).GET().build(),16));
        } finally {server.stop(0);}
    }
    @Test void gatewayRejectsUnsafeConfiguredEndpoints() {
        for(String uri:List.of("http://gateway.invalid/","https://user:secret@gateway.invalid/","https://gateway.invalid/?key=secret","https://gateway.invalid/#fragment")) {
            var e=assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.gateway(uri,"synthetic","feed_gateway_unconfigured",true));
            assertEquals("FAILED",e.state);
        }
    }
    @Test void disabledAdaptersNeverContactProviders() throws Exception {
        var payload=DocumentExecutor.JSON.readTree("{}");
        assertEquals("card_ocr_unconfigured",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.card(UUID.randomUUID(),payload)).code);
        assertEquals("geocoder_unconfigured",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.geocode(payload)).code);
        assertEquals("feed_gateway_unconfigured",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.feed(payload)).code);
        assertEquals("push_unconfigured",ProviderRuntime.push(payload).error());
    }
}
