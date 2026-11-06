package au.com.htt.backend;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class QuotePricingTest {
    private static final UUID STANDARD=UUID.fromString("00000000-0000-0000-0000-000000000025");
    private static final UUID CUSTOMER=UUID.fromString("00000000-0000-0000-0000-000000000026");
    private static final UUID PROMOTION=UUID.fromString("00000000-0000-0000-0000-000000000027");
    private static final OffsetDateTime AT=OffsetDateTime.parse("2026-11-06T00:00:00Z");
    private LinkedHashMap<String,Object> row() {
        var row=new LinkedHashMap<String,Object>();row.put("amount",new BigDecimal("50.00"));row.put("standard_rule",STANDARD);
        row.put("inclusive",false);row.put("customer_rule",null);row.put("sku","Café & <planks> ' \"");row.put("unit_version",3L);return row;
    }
    @Test void signatureMatchesIndependentDotnetSerializerOracle() {
        // Captured from .NET10 System.Text.Json Web + the original DecimalStringConverter.
        assertEquals("727A9394A2899F1D5A2ACAC7CA9060896EEF8D42DDCA9C748239E9B82C072812",QuotePricing.signature(row()));
        var changed=row();changed.put("unit_version",4L);
        assertNotEquals(QuotePricing.signature(row()),QuotePricing.signature(changed));
    }
    @Test void customerDiscountWinsBeforeCheaperPromotion() {
        var data=row();data.put("customer_rule",CUSTOMER);data.put("discount_percent",new BigDecimal("10"));
        data.put("promotion_price",new BigDecimal("44.00"));data.put("promotion_rule",PROMOTION);
        var facts=QuotePricing.calculate(data,AT,true);
        assertEquals(0,new BigDecimal("44").compareTo(facts.unitPrice()));assertEquals("PROMOTION",facts.source());assertEquals(PROMOTION,facts.ruleId());
        data.put("promotion_price",new BigDecimal("46"));facts=QuotePricing.calculate(data,AT,true);
        assertEquals(0,new BigDecimal("45").compareTo(facts.unitPrice()));assertEquals("CUSTOMER",facts.source());
    }
    @Test void fixedPriceOverridesDiscountAndEqualPromotionKeepsCustomerRule() {
        var data=row();data.put("customer_rule",CUSTOMER);data.put("fixed_price",new BigDecimal("40"));data.put("discount_percent",new BigDecimal("99"));
        data.put("promotion_price",new BigDecimal("40.00"));data.put("promotion_rule",PROMOTION);
        var facts=QuotePricing.calculate(data,AT,true);
        assertEquals(0,new BigDecimal("40").compareTo(facts.unitPrice()));assertEquals(CUSTOMER,facts.ruleId());assertEquals("CUSTOMER",facts.source());
    }
    @Test void draftFactsRetainFloorAndRoundAwayFromZeroAtEightPlaces() {
        var data=row();data.put("amount",new BigDecimal("1.234567895"));data.put("floor_price",new BigDecimal("2"));
        assertThrows(StaffScope.Failure.class,()->QuotePricing.calculate(data,AT,true));
        var facts=QuotePricing.calculate(data,AT,false);
        assertEquals(new BigDecimal("1.23456790"),facts.unitPrice());assertEquals(new BigDecimal("2"),facts.floor());assertEquals(AT,facts.pricingAt());
    }
}
