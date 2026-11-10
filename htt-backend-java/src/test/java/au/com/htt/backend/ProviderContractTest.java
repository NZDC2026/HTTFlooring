package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;
import java.net.http.*;
class ProviderContractTest {
    static ProviderRuntime.Reply reply(int code,String json) throws Exception {
        return new ProviderRuntime.Reply(code,json==null?null:DocumentExecutor.JSON.readTree(json),HttpHeaders.of(Map.of(),(a,b)->true));
    }
    @Test void ocrGatewayNormalizesSuggestionAndClassifiesErrors() throws Exception {
        var config=Map.of("HTT_CARD_OCR_ENDPOINT","https://gateway.invalid/ocr","HTT_CARD_OCR_API_KEY","synthetic");
        var data=DocumentExecutor.JSON.readTree("{\"content\":\"AQ==\",\"contentType\":\"image/png\"}");var id=UUID.randomUUID();
        var result=ProviderRuntime.card(id,data,config,(request,limit)->{
            assertEquals("POST",request.method());assertEquals("NEVER",HttpClient.Redirect.NEVER.name());assertEquals(16000,limit);
            assertEquals("Bearer synthetic",request.headers().firstValue("Authorization").orElseThrow());
            return reply(200,"{\"name\":\"\u00a0Alice\u0085\",\"email\":\"alice@example.invalid\"}");
        });assertEquals("Alice",result.get("name").asText());assertEquals(0,result.get("branchIds").size());
        assertEquals("RETRY",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.card(id,data,config,(r,l)->reply(429,null))).state);
        assertEquals("FAILED",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.card(id,data,config,(r,l)->reply(200,"{}"))).state);
    }
    @Test void revokeUncertaintyDiffersFromReadFailure() throws Exception {
        var config=Map.of("HTT_BANKFEEDS_ENABLED","true","HTT_BANKFEEDS_ENDPOINT","https://gateway.invalid/feed","HTT_BANKFEEDS_API_KEY","synthetic");
        for(String kind:List.of("REVOKE","SYNC")) {
            var data=DocumentExecutor.JSON.createObjectNode().put("kind",kind).put("operationId",UUID.randomUUID().toString());
            var failure=assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.feed(data,config,(request,limit)->{
                assertEquals(data.get("operationId").asText(),request.headers().firstValue("Idempotency-Key").orElseThrow());
                assertEquals("1",request.headers().firstValue("X-HTT-Gateway-Version").orElseThrow());return reply(503,null);
            }));assertEquals(kind.equals("REVOKE")?"UNKNOWN":"RETRY",failure.state);
            assertEquals("FAILED",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.feed(data,config,(r,l)->{throw new ProviderRuntime.LimitException(400);})).state);
            assertEquals(kind.equals("REVOKE")?"UNKNOWN":"FAILED",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.feed(data,config,(r,l)->{throw new ProviderRuntime.LimitException(200);})).state);
        }
    }
    @Test void geocodeRejectsPartialAndMismatchedCountries() throws Exception {
        var config=Map.of("HTT_GEOCODE_API_KEY","synthetic");var address=DocumentExecutor.JSON.readTree("{\"address\":\"synthetic address\",\"country\":\"AU\"}");
        String valid="{\"status\":\"OK\",\"results\":[{\"address_components\":[{\"types\":[\"country\"],\"short_name\":\"AU\"}],\"geometry\":{\"location\":{\"lat\":-33.12345678,\"lng\":151.1},\"location_type\":\"ROOFTOP\"},\"place_id\":\"synthetic\"}]}";
        var result=ProviderRuntime.geocode(address,config,(r,l)->reply(200,valid));assertEquals("-33.1234568",result.get("latitude").asText());
        assertEquals("geocode_country_mismatch",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.geocode(address,config,(r,l)->reply(200,valid.replace("\"AU\"","\"NZ\"")))).code);
        assertEquals("geocode_partial_match",assertThrows(DocumentRuntime.WorkException.class,()->ProviderRuntime.geocode(address,config,(r,l)->reply(200,valid.replace("\"place_id\"","\"partial_match\":true,\"place_id\"")))).code);
    }
}
