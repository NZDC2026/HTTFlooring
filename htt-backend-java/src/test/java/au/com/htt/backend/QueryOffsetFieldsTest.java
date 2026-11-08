package au.com.htt.backend;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class QueryOffsetFieldsTest {
 @Test void matchesNativeMinimalApiOracle()throws Exception{
  assertNull(QueryOffsetFields.parse(null));
  try(var stream=getClass().getResourceAsStream("/offset-query-oracle.json")){
   var cases=tools.jackson.databind.json.JsonMapper.builder().build().readTree(stream);assertEquals(28,cases.size());
   for(var item:cases){String input=item.get("input").asText();if(item.get("status").asInt()==200)assertEquals(OffsetDateTime.parse(item.get("body").get("value").asText()),QueryOffsetFields.parse(input),item.toString());else assertEquals(400,assertThrows(StaffScope.Failure.class,()->QueryOffsetFields.parse(input),item.toString()).status);}
  }
 }
}
