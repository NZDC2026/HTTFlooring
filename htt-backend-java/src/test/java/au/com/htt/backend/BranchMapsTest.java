package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class BranchMapsTest {
 @Test void escapeUsesRfc3986Utf8(){assertEquals("cafe%20%2B%20~%2A%2C%2F%3F%26",BranchMaps.escape("cafe + ~*,/?&"));assertEquals("caf%C3%A9%20%F0%9F%8F%A0",BranchMaps.escape("café 🏠"));assertEquals("-33.8688000%2C151.2093000",BranchMaps.escape("-33.8688000,151.2093000"));}
}
