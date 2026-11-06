package au.com.htt.backend;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tools.jackson.databind.json.JsonMapper;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties="server.address=127.0.0.1")
class PricingAuditSerializationTest {
    @Autowired JsonMapper json;
    @Test @Timeout(20) void originalAuditCreateIncludesExplicitNullBefore() {
        String text=json.writeValueAsString(QuoteDrafts.map("before",null,"after",QuoteDrafts.map("Amount",new java.math.BigDecimal("50.00")),"version",1));
        System.out.println("Synthetic audit serialization: "+text);
        var node=json.readTree(text);
        assertNotNull(node.get("before"));assertTrue(node.get("before").isNull());
        assertTrue(node.get("after").get("Amount").isNumber());
    }
}
