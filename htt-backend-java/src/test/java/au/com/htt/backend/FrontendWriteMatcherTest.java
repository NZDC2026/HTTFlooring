package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;
class FrontendWriteMatcherTest {
 @Test void csrfExceptionRequiresExplicitBearerCommand() {
  var matcher=new FrontendWriteMatcher();String uri="/api/v1/products/00000000-0000-0000-0000-000000000001/costing-policy";
  var request=new MockHttpServletRequest("POST",uri);assertFalse(matcher.matches(request));
  request.addHeader("Authorization","Bearer synthetic");assertTrue(matcher.matches(request));
  request.setMethod("GET");assertFalse(matcher.matches(request));request.setMethod("POST");
  request.setRequestURI("/api/v1/documents/00000000-0000-0000-0000-000000000001/dispatch-schedule");assertTrue(matcher.matches(request));
  request.removeHeader("Authorization");assertFalse(matcher.matches(request));request.addHeader("Authorization","Bearer synthetic");
  request.setRequestURI("/api/security");assertFalse(matcher.matches(request));request.setRequestURI("/api/v1/other-command");assertFalse(matcher.matches(request));
 }
}
