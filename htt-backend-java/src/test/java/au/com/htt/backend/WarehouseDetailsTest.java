package au.com.htt.backend;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class WarehouseDetailsTest {
 @Test void binVersionUsesLegacyIntegerParsing(){for(String s:new String[]{"1","\"1\""," +001 ","\"\"1\"\"","\t+1\r"})assertEquals(1,WarehouseDetails.version(s));for(String s:new String[]{"0","-1","1.0","1 1","9223372036854775808","\u00a01\u00a0"})assertEquals(428,assertThrows(StaffScope.Failure.class,()->WarehouseDetails.version(s)).status);}
 @Test void scannerSupportsLegacyGuidFormatsWithoutJavaShortGroupAcceptance(){String d="00112233-4455-6677-8899-aabbccddeeff";UUID id=UUID.fromString(d);for(String s:new String[]{d,d.toUpperCase(),d.replace("-",""),"{"+d+"}","("+d+")","{0x00112233,0x4455,0x6677,{0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff}}"})assertEquals(id,WarehouseDetails.scanId(s));for(String s:new String[]{"{00112233445566778899aabbccddeeff}","1-1-1-1-1","bad"})assertNull(WarehouseDetails.scanId(s));}
 @Test void scannerMatchesIndependentInstalledDotnetOracle()throws Exception{try(var stream=getClass().getResourceAsStream("/warehouse-guid-oracle.json")){var cases=tools.jackson.databind.json.JsonMapper.builder().build().readTree(stream);assertEquals(11,cases.size());for(var item:cases){var actual=WarehouseDetails.scanId(item.get("value").asText());if(item.get("valid").asBoolean())assertEquals(UUID.fromString(item.get("parsed").asText()),actual,item.toString());else assertNull(actual,item.toString());}}}
}
