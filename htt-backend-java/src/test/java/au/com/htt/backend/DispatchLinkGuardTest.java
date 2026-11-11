package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;
class DispatchLinkGuardTest {
    MockHttpServletRequest request(){var r=new MockHttpServletRequest("POST","/api/dispatch-portal");r.addHeader("X-HTT-Request","1");r.setContentType("application/json");r.setContent("{}".getBytes(java.nio.charset.StandardCharsets.UTF_8));return r;}
    @Test void boundsPublicBodyAndRequiresExplicitJsonRequest() throws Exception {
        var guard=new DispatchLinkSecurity.Guard();var r=request();r.setContent(new byte[10001]);var response=new MockHttpServletResponse();var reached=new AtomicBoolean();
        guard.doFilter(r,response,(a,b)->reached.set(true));assertEquals(413,response.getStatus());assertFalse(reached.get());
        r=request();r.removeHeader("X-HTT-Request");response=new MockHttpServletResponse();guard.doFilter(r,response,(a,b)->fail("Missing anti-cross-site header reached controller"));assertEquals(415,response.getStatus());
        r=request();r.setContentType("application/jsonp");response=new MockHttpServletResponse();guard.doFilter(r,response,(a,b)->fail("JSONP reached controller"));assertEquals(415,response.getStatus());
    }
    @Test void rateLimitUsesConnectionAddressAndDoesNotTrustForwardedHeaders() throws Exception {
        var guard=new DispatchLinkSecurity.Guard();var reached=new java.util.concurrent.atomic.AtomicInteger();
        for(int i=0;i<31;i++){var r=request();r.addHeader("X-Forwarded-For","different-"+i);var s=new MockHttpServletResponse();guard.doFilter(r,s,(a,b)->reached.incrementAndGet());if(i==30)assertEquals(429,s.getStatus());}
        assertEquals(30,reached.get());
    }
}
