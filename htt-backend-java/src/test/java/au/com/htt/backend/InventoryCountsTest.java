package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class InventoryCountsTest {
    @Test void versionMatchesLegacyNumberStylesNone(){
        assertEquals(1,InventoryCounts.version("\"1\""));assertEquals(1,InventoryCounts.version("\"\"1\"\""));
        for(String input:new String[]{"0"," 1 ","+1","-1","1,2","9223372036854775808",""}){
            var failure=assertThrows(StaffScope.Failure.class,()->InventoryCounts.version(input));assertEquals(428,failure.status);assertEquals("version_required",failure.code);
        }
    }
}
