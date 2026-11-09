package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class NotificationWritesTest {
 @Test void initialVersionRetainsSourceZeroAndQuoteWhitespaceRules(){
  assertEquals(0,NotificationWrites.initial("\"0\""));assertEquals(1,NotificationWrites.initial("\" +001 \""));
  for(String invalid:new String[]{null,"","-1","1.0","9223372036854775808"," \"0\" "})assertEquals(428,assertThrows(StaffScope.Failure.class,()->NotificationWrites.initial(invalid)).status);
 }
}
