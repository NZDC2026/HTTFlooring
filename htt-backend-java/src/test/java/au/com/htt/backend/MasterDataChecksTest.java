package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class MasterDataChecksTest {
    @Test void normalizationMatchesDotnetOracle(){
        assertEquals("ABC",MasterDataChecks.code("\u00a0 abc \u0085","code"));
        assertEquals("S",MasterDataChecks.code("ſ","code"));
        for(String input:new String[]{"ß","ı","ﬀ","\u001cabc\u001c","ａ","ǰ","İ"})assertThrows(BranchQuery.InvalidFilter.class,()->MasterDataChecks.code(input,"code"));
        assertEquals("café",MasterDataChecks.text("\u0085 café\u00a0","name",200));
    }
}
