package au.com.htt.backend;
import java.util.*;
import java.util.stream.Collectors;
import tools.jackson.core.*;
import tools.jackson.databind.*;
import tools.jackson.databind.annotation.JsonDeserialize;

/** Ordered JSON token canonicalization matching the recorded System.Text.Json oracle. */
@JsonDeserialize(using=LegacyRawJson.Reader.class)
record LegacyRawJson(String canonical,boolean object,boolean clean) {
    boolean validObject(){return object&&clean;}
    static String value(Object value){
        if(value instanceof LegacyRawJson raw)return raw.canonical();
        if(value instanceof Map<?,?> map)return map.entrySet().stream().map(e->CollaborationCreate.legacyString((String)e.getKey())+":"+value(e.getValue())).collect(Collectors.joining(",","{","}"));
        if(value instanceof List<?> list)return list.stream().map(LegacyRawJson::value).collect(Collectors.joining(",","[","]"));
        return QuotePricing.value(value);
    }
    static final class Reader extends ValueDeserializer<LegacyRawJson> {
        @Override public LegacyRawJson deserialize(JsonParser p,DeserializationContext c){return read(p,c);}
        @Override public LegacyRawJson getNullValue(DeserializationContext c){return new LegacyRawJson("null",false,true);}
        private static boolean clean(String text){return text.chars().noneMatch(Character::isISOControl);}
        private LegacyRawJson read(JsonParser p,DeserializationContext c){
            JsonToken token=p.currentToken();
            if(token==JsonToken.START_OBJECT){
                var parts=new ArrayList<String>();boolean clean=true;
                while(p.nextToken()!=JsonToken.END_OBJECT){
                    if(p.currentToken()!=JsonToken.PROPERTY_NAME)return c.reportInputMismatch(LegacyRawJson.class,"JSON property required.");
                    String name=p.currentName();p.nextToken();LegacyRawJson child=read(p,c);
                    clean&=clean(name)&&child.clean();parts.add(CollaborationCreate.legacyString(name)+":"+child.canonical());
                }
                return new LegacyRawJson(String.join(",",parts).transform(x->"{"+x+"}"),true,clean);
            }
            if(token==JsonToken.START_ARRAY){
                var parts=new ArrayList<String>();boolean clean=true;
                while(p.nextToken()!=JsonToken.END_ARRAY){LegacyRawJson child=read(p,c);parts.add(child.canonical());clean&=child.clean();}
                return new LegacyRawJson("["+String.join(",",parts)+"]",false,clean);
            }
            if(token==JsonToken.VALUE_STRING){String text=p.getString();return new LegacyRawJson(CollaborationCreate.legacyString(text),false,clean(text));}
            if(token==JsonToken.VALUE_NUMBER_INT||token==JsonToken.VALUE_NUMBER_FLOAT)return new LegacyRawJson(p.getText(),false,true);
            if(token==JsonToken.VALUE_TRUE||token==JsonToken.VALUE_FALSE||token==JsonToken.VALUE_NULL)return new LegacyRawJson(token.asString(),false,true);
            return c.reportInputMismatch(LegacyRawJson.class,"JSON value required.");
        }
    }
}
