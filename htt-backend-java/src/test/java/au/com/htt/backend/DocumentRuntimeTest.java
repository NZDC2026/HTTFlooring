package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.nio.charset.StandardCharsets;

class DocumentRuntimeTest {
    @Test void spreadsheetInjectionAndDecimals() throws Exception {
        var data=DocumentExecutor.JSON.readTree("""
            {"kind":"TRIAL_BALANCE","snapshotHash":"synthetic","columns":[{"key":"name","label":"Name","type":"text"},{"key":"amount","label":"Amount","type":"decimal"}],"rows":[{"name":"  =HYPERLINK(1)","amount":"-1.20"},{"name":"\\u200b@SUM(1)","amount":"0.00"}]}
            """);
        var result=DocumentRuntime.csv(data);String csv=new String(result,StandardCharsets.UTF_8);
        assertEquals('\ufeff',csv.charAt(0));assertTrue(csv.contains("\"'  =HYPERLINK(1)\",\"-1.20\""));
        assertTrue(csv.contains("\"'\u200b@SUM(1)\",\"0.00\""));
    }
    @Test void invalidDecimalNeverBecomesFormula() throws Exception {
        var data=DocumentExecutor.JSON.readTree("""
            {"kind":"TEST","snapshotHash":"synthetic","columns":[{"key":"v","label":"Value","type":"decimal"}],"rows":[{"v":"=1+1"}]}
            """);
        var failure=assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.csv(data));
        assertEquals("export_snapshot_invalid",failure.code);assertEquals("FAILED",failure.state);
    }
    @Test void outputReaderRejectsOversize() {
        assertEquals("'\u0085=1+1",DocumentRuntime.safe("\u0085=1+1"));
        assertThrows(java.io.IOException.class,()->DocumentRuntime.bounded(new java.io.ByteArrayInputStream(new byte[17]),16));
    }
    @Test void unconfiguredScannerDoesNotAcceptFile() {
        if(DocumentRuntime.env("HTT_CLAMAV_HOST").isBlank()) {
            var failure=assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.scan(new byte[]{1}));
            assertEquals("scanner_unconfigured",failure.code);assertEquals("FAILED",failure.state);
        }
    }
    @Test void unconfiguredMailDoesNotSend() throws Exception {
        if(DocumentRuntime.env("HTT_MAIL_API_KEY").isBlank()) {
            var failure=assertThrows(DocumentRuntime.WorkException.class,()->DocumentRuntime.mail(java.util.UUID.randomUUID(),DocumentExecutor.JSON.readTree("{}")));
            assertEquals("mail_unconfigured",failure.code);assertEquals("FAILED",failure.state);
        }
    }
}
