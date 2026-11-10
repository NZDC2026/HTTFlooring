package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class CsvOracleTest {
    @Test void byteExactLegacyExporterOracle() throws Exception {
        try(var input=getClass().getResourceAsStream("/stage4/csv-input.json");var expected=getClass().getResourceAsStream("/stage4/native-report.csv")) {
            assertArrayEquals(expected.readAllBytes(),DocumentRuntime.csv(DocumentExecutor.JSON.readTree(input.readAllBytes())));
        }
    }
}
