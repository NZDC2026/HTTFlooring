package au.com.htt.backend;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import tools.jackson.databind.json.JsonMapper;
class ContactFieldsTest {
    @Test void emailMatchesIndependentDotnetOracle() throws Exception {
        var mapper=JsonMapper.builder().build();
        try(var stream=getClass().getResourceAsStream("/contact-email-oracle.json")){
            var cases=mapper.readTree(stream);assertTrue(cases.size()>600);
            for(var item:cases){String input=item.get("input").isNull()?null:item.get("input").asText();
                if(item.get("valid").asBoolean()){String expected=item.get("value").isNull()?null:item.get("value").asText();assertEquals(expected,ContactFields.email(input),item.toString());}
                else assertThrows(BranchQuery.InvalidFilter.class,()->ContactFields.email(input),item.toString());
            }
        }
    }
    @Test void phoneAndBranchesRetainLegacyRules(){
        assertEquals("+61 (2) 1234 xEXT#5",ContactFields.phone(" +61 (2) 1234 xEXT#5 ","phone"));
        for(String phone:new String[]{"abc","１２３","1\t2"})assertThrows(BranchQuery.InvalidFilter.class,()->ContactFields.phone(phone,"phone"));
        assertTrue(ContactFields.branches(null).isEmpty());
        assertThrows(BranchQuery.InvalidFilter.class,()->ContactFields.branches(java.util.List.of(new java.util.UUID(0,0))));
    }
}
