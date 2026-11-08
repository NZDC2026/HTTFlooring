package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;
class LegacyRawJsonTest {
    @Test void nativeJsonElementOracle() throws Exception {
        var mapper=new JsonMapper();
        try(var input=getClass().getResourceAsStream("/json-element-oracle.json")){
            for(var row:mapper.readTree(input)){
                String source=row.get("raw").asString();var raw=mapper.readValue(source,LegacyRawJson.class);
                assertEquals(row.get("objectValid").asBoolean(),raw.validObject(),source);
                assertEquals(row.get("element").asString(),raw.canonical(),source);
                var saved=QuoteDrafts.map("name"," café + name ","definition",raw,"visibility","PRIVATE","active",true);
                assertEquals(row.get("canonical").asString(),LegacyRawJson.value(QuoteDrafts.map("version",0L,"x",saved)),source);
                assertEquals(row.get("pack").asString(),LegacyRawJson.value(QuoteDrafts.map("title"," Pack café ","items",java.util.List.of(raw))),source);
            }
        }
    }
}
