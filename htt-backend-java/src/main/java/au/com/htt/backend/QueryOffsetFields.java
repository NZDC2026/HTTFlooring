package au.com.htt.backend;
import java.time.*;
import java.time.format.*;
import java.util.regex.Pattern;
final class QueryOffsetFields {
 private QueryOffsetFields(){}
 private static final Pattern TIME=Pattern.compile("^(.+?)[Tt ]([0-9]{1,2}):([0-9]{2})(?::([0-9]{2})(?:[.,]([0-9]{1,9}))?)?\\s*(Z|z|[+-][0-9]{2}:?[0-9]{2})?$");
 static OffsetDateTime parse(String input){
  if(input==null)return null;String value=MasterDataChecks.trim(input);if(value.isEmpty())throw LedgerFields.invalid();
  try{
   try{return checked(OffsetDateTime.parse(value,DateTimeFormatter.RFC_1123_DATE_TIME));}catch(DateTimeParseException ignored){}
   var match=TIME.matcher(value);
   if(!match.matches())return checked(LedgerFields.date(value).atStartOfDay().atOffset(ZoneOffset.UTC));
   LocalDate date=LedgerFields.date(match.group(1));int hour=Integer.parseInt(match.group(2)),minute=Integer.parseInt(match.group(3)),second=match.group(4)==null?0:Integer.parseInt(match.group(4));
   int nanos=match.group(5)==null?0:Integer.parseInt((match.group(5)+"000000000").substring(0,9));
   int ticks=nanos/100,remainder=nanos%100;if(remainder>50||remainder==50&&ticks%2==1)ticks++;
   String offset=match.group(6);ZoneOffset zone=offset==null||offset.equalsIgnoreCase("Z")?ZoneOffset.UTC:ZoneOffset.of(offset);
   if(Math.abs(zone.getTotalSeconds())>14*3600)throw LedgerFields.invalid();
   return checked(LocalDateTime.of(date,LocalTime.of(hour,minute,second)).plusNanos(ticks*100L).atOffset(zone));
  }catch(DateTimeException|NumberFormatException invalid){throw LedgerFields.invalid();}
 }
 private static OffsetDateTime checked(OffsetDateTime value){var utc=value.withOffsetSameInstant(ZoneOffset.UTC);if(value.getYear()<1||value.getYear()>9999||utc.getYear()<1||utc.getYear()>9999||Math.abs(value.getOffset().getTotalSeconds())>14*3600)throw LedgerFields.invalid();return utc;}
}
