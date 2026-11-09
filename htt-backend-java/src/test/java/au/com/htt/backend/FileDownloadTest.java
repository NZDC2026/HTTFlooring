package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class FileDownloadTest {
 @Test void filenameHeadersMatchNativeResultsFileOracle()throws Exception{
  try(var stream=getClass().getResourceAsStream("/file-response-oracle.json")){
   var cases=tools.jackson.databind.json.JsonMapper.builder().build().readTree(stream);assertEquals(4,cases.size());for(var item:cases)assertEquals(item.get("disposition").asText(),FileDownload.disposition(item.get("filename").asText()),item.toString());
  }
 }
}
