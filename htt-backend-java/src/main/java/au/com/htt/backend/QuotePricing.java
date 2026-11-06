package au.com.htt.backend;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

/** Original quote pricing facts, including the stable cross-runtime pricing signature. */
@Component
@ConditionalOnProperty("htt.staff.database.url")
class QuotePricing {
    private final JdbcClient jdbc;
    private final String sql;
    QuotePricing(JdbcClient jdbc) throws IOException {
        this.jdbc=jdbc;
        sql=new ClassPathResource("quote-pricing-facts.sql").getContentAsString(StandardCharsets.UTF_8);
    }
    Facts resolve(UUID customer,UUID unit,OffsetDateTime at,boolean enforceFloor) {
        var data=jdbc.sql(sql).param("customer",customer).param("unit",unit).param("at",at).query((rs,index)->{
            var row=new LinkedHashMap<String,Object>();var metadata=rs.getMetaData();
            for (int i=1;i<=metadata.getColumnCount();i++) row.put(metadata.getColumnLabel(i),rs.getObject(i));
            return row;
        }).optional().orElseThrow(()->new StaffScope.Failure(422,"price_unavailable","No effective standard price or tax rate exists for this product unit."));
        return calculate(data,at,enforceFloor);
    }
    static Facts calculate(Map<String,Object> data,OffsetDateTime at,boolean enforceFloor) {
        BigDecimal amount=decimal(data,"amount");String source="STANDARD";UUID rule=(UUID)data.get("standard_rule");
        if (data.get("customer_rule") instanceof UUID customerRule) {
            amount=data.get("fixed_price") instanceof BigDecimal fixed?fixed:amount.multiply(BigDecimal.ONE.subtract(decimal(data,"discount_percent").movePointLeft(2)));
            source="CUSTOMER";rule=customerRule;
        }
        if (data.get("promotion_price") instanceof BigDecimal promotion && promotion.compareTo(amount)<0) {
            amount=promotion;source="PROMOTION";rule=(UUID)data.get("promotion_rule");
        }
        BigDecimal floor=(BigDecimal)data.get("floor_price");
        if (enforceFloor && floor!=null && amount.compareTo(floor)<0)
            throw new StaffScope.Failure(422,"price_below_floor","The effective price needs office review before use.");
        if (amount.scale()>8) amount=amount.setScale(8,RoundingMode.HALF_UP);
        return new Facts(amount,floor,source,rule,signature(data),data,at);
    }
    static BigDecimal decimal(Map<String,Object> data,String key) {return (BigDecimal)data.get(key);}
    static String canonical(Map<String,Object> data) {
        return data.entrySet().stream().map(e->CollaborationCreate.legacyString(e.getKey())+":"+value(e.getValue())).collect(Collectors.joining(",","{","}"));
    }
    @SuppressWarnings("unchecked")
    private static String value(Object value) {
        if (value instanceof Map<?,?> map) return canonical((Map<String,Object>)map);
        if (value instanceof java.util.List<?> list) return list.stream().map(QuotePricing::value).collect(Collectors.joining(",","[","]"));
        if (value instanceof java.time.OffsetDateTime time) {
            String base=time.format(java.time.format.DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss"));
            int ticks=time.getNano()/100;
            String fraction=ticks==0?"":"."+String.format(java.util.Locale.ROOT,"%07d",ticks).replaceFirst("0+$","");
            return "\""+base+fraction+(time.getOffset().equals(java.time.ZoneOffset.UTC)?"+00:00":time.getOffset().toString())+"\"";
        }
        if (value instanceof java.time.LocalDate date) return CollaborationCreate.legacyString(date.toString());
        if (value==null) return "null";
        if (value instanceof BigDecimal n) return CollaborationCreate.legacyString(n.toPlainString());
        if (value instanceof Boolean || value instanceof Integer || value instanceof Long || value instanceof Short) return value.toString();
        if (value instanceof String || value instanceof UUID) return CollaborationCreate.legacyString(value.toString());
        throw new IllegalArgumentException("Unsupported quote pricing fact type: "+value.getClass().getName());
    }
    static String signature(Map<String,Object> data) {
        try {return HexFormat.of().withUpperCase().formatHex(MessageDigest.getInstance("SHA-256").digest(canonical(data).getBytes(StandardCharsets.UTF_8)));}
        catch (NoSuchAlgorithmException impossible) {throw new IllegalStateException(impossible);}
    }
    record Facts(BigDecimal unitPrice,BigDecimal floor,String source,UUID ruleId,String signature,Map<String,Object> data,OffsetDateTime pricingAt) {}
}
