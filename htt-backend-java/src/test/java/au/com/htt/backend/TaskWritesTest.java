package au.com.htt.backend;
import java.util.UUID;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class TaskWritesTest {
 @Test void typedCanonicalMatchesNativeOracle()throws Exception{
  try(var stream=getClass().getResourceAsStream("/task-canonical-oracle.json")){
   var cases=tools.jackson.databind.json.JsonMapper.builder().build().readTree(stream);
   for(var item:cases){var raw=tools.jackson.databind.json.JsonMapper.builder().build().readTree(item.get("data").asText());var d=new TaskWrites.Data();d.title=raw.get("title").asText();d.assigneeId=UUID.fromString(raw.get("assigneeId").asText());d.description=raw.get("description").isNull()?null:raw.get("description").asText();d.customerId=raw.get("customerId").isNull()?null:UUID.fromString(raw.get("customerId").asText());d.branchId=raw.get("branchId").isNull()?null:UUID.fromString(raw.get("branchId").asText());d.priority=raw.get("priority").asText();d.dueAt=raw.get("dueAt").isNull()?null:OffsetDateTime.parse(raw.get("dueAt").asText());d.reminderAt=raw.get("reminderAt").isNull()?null:OffsetDateTime.parse(raw.get("reminderAt").asText());
    var data=TaskWrites.normalize(d);UUID id=UUID.fromString("00000000-0000-0000-0000-000000000600");
    assertEquals(item.get("data").asText(),QuotePricing.value(data));assertEquals(item.get("create").asText(),QuotePricing.value(QuoteDrafts.map("id",id,"data",data)));assertEquals(item.get("update").asText(),QuotePricing.value(QuoteDrafts.map("id",id,"version",1L,"data",data)));assertEquals(item.get("change").asText(),QuotePricing.value(QuoteDrafts.map("id",id,"version",1L)));
   }
  }
 }
}
