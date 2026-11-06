package au.com.htt.backend;

import java.time.*;
import java.time.format.*;
import java.util.*;
import java.util.regex.Pattern;

final class LedgerFields {
    private LedgerFields(){}
    static StaffScope.Failure invalid(){return new StaffScope.Failure(400,"invalid_request","Invalid request body or parameters.");}
    static LocalDate date(String input){
        String value=MasterDataChecks.trim(input);LocalDate result=null;
        try{
            var yearFirst=Pattern.compile("([0-9]{4})([-/.])([0-9]{1,2})\\2([0-9]{1,2})").matcher(value);
            if(yearFirst.matches())result=LocalDate.of(Integer.parseInt(yearFirst.group(1)),Integer.parseInt(yearFirst.group(3)),Integer.parseInt(yearFirst.group(4)));
            else if(value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt].+"))result=LocalDateTime.parse(value,DateTimeFormatter.ISO_LOCAL_DATE_TIME).toLocalDate();
            else{
                var us=Pattern.compile("([0-9]{1,2})([-/.])([0-9]{1,2})\\2([0-9]{1,4})").matcher(value);
                if(us.matches()){int year=Integer.parseInt(us.group(4));if(us.group(4).length()<=2)year+=year<=49?2000:1900;result=LocalDate.of(year,Integer.parseInt(us.group(1)),Integer.parseInt(us.group(3)));}
                else for(String pattern:List.of("d MMM uuuu","d MMMM uuuu","MMM d uuuu","MMMM d uuuu","MMM d, uuuu","MMMM d, uuuu","EEE, dd MMM uuuu","EEEE, MMMM d, uuuu")){
                    try{result=LocalDate.parse(value,new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern(pattern).toFormatter(Locale.ENGLISH).withResolverStyle(ResolverStyle.STRICT));break;}catch(DateTimeParseException ignored){}
                }
            }
        }catch(DateTimeException|NumberFormatException ignored){}
        if(result==null||result.getYear()<1||result.getYear()>9999)throw invalid();return result;
    }
    static boolean bool(String input){
        if(input==null)return false;int a=0,b=input.length();while(a<b&&boolSpace(input.charAt(a)))a++;while(b>a&&boolSpace(input.charAt(b-1)))b--;String value=input.substring(a,b);
        if(value.chars().anyMatch(c->c>127))throw invalid();
        return switch(value.toLowerCase(Locale.ROOT)){case "true"->true;case "false"->false;default->throw invalid();};
    }
    private static boolean boolSpace(char c){return c==0||c>=9&&c<=13||c==0x85||Character.isSpaceChar(c);}
    static Integer integer(String input){
        if(input==null)return null;String value=input.replaceAll("^[\\x09-\\x0D ]+|[\\x09-\\x0D ]+$","");
        try{if(!value.matches("[+-]?[0-9]+"))throw new NumberFormatException();return Integer.parseInt(value);}catch(NumberFormatException invalid){throw invalid();}
    }
    static UUID uuid(String input){if(input==null)return null;UUID id=WarehouseDetails.scanId(input);if(id==null)throw invalid();return id;}
}
