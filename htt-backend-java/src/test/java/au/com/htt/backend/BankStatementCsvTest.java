package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;
class BankStatementCsvTest {
    @Test void nativeDecimalOracle() throws Exception {
        var json=new JsonMapper();try(var input=getClass().getResourceAsStream("/csv-decimal-oracle.json")){
            for(var row:json.readTree(input)){
                String value=MasterDataChecks.trim(row.get("input").asString());
                if(row.get("ok").asBoolean()){
                    var actual=BankStatementCsv.decimal(value);
                    assertEquals(row.get("value").asString(),actual.toPlainString(),value);
                    assertEquals(row.get("scale").asInt(),actual.scale(),value);
                }else {
                    var error=assertThrows(RuntimeException.class,()->BankStatementCsv.decimal(value),value);
                    assertTrue(error instanceof StaffScope.Failure || error instanceof BranchQuery.InvalidFilter,value);
                }
            }
        }
    }
}
