package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class AsyncAttachmentBodyTest {
    @Test void graceAndMinimumRate() {
        long second=AsyncAttachmentBody.SECOND;
        assertNull(AsyncAttachmentBody.check(5*second,0));
        assertNull(AsyncAttachmentBody.check(6*second,240));
        var slow=AsyncAttachmentBody.check(6*second,239);
        assertEquals(400,slow.status);
        assertEquals("invalid_request",slow.code);
    }
    @Test void absoluteDeadlineOverridesHealthyThroughput() {
        long second=AsyncAttachmentBody.SECOND;
        assertNull(AsyncAttachmentBody.check(29*second,100000));
        var expired=AsyncAttachmentBody.check(30*second,100000);
        assertEquals(500,expired.status);
        assertEquals("internal_error",expired.code);
    }
}
