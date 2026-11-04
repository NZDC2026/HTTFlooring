package au.com.htt.backend;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class PriceRead {
    private final JdbcClient jdbc;
    private final String quotePricing;

    PriceRead(JdbcClient jdbc) throws IOException {
        this.jdbc = jdbc;
        quotePricing = new ClassPathResource("price-read.sql").getContentAsString(StandardCharsets.UTF_8);
    }

    Optional<Price> resolve(StaffScope.CompanyAccess scope, UUID customer, UUID unit) {
        boolean visible = jdbc.sql("""
                SELECT EXISTS(SELECT 1 FROM crm.customers c WHERE id=:customer AND
                    (:allCustomers OR EXISTS(SELECT 1 FROM identity.customer_assignments a
                       WHERE a.company_id=c.company_id AND a.customer_id=c.id AND a.membership_id=:membership)))
                """).param("customer", customer).param("membership", scope.membershipId())
                .param("allCustomers", List.of(scope.permissions()).contains("customers.all"))
                .query(Boolean.class).single();
        if (!visible) {
            return Optional.empty();
        }

        var now = OffsetDateTime.now(ZoneOffset.UTC);
        var price = jdbc.sql(quotePricing).param("customer", customer).param("unit", unit).param("at", now)
                .query((row, index) -> new Inputs(row.getBigDecimal("amount"), row.getObject("standard_rule", UUID.class),
                        row.getBigDecimal("fixed_price"), row.getBigDecimal("discount_percent"),
                        row.getObject("customer_rule", UUID.class), row.getBigDecimal("promotion_price"),
                        row.getObject("promotion_rule", UUID.class), row.getBigDecimal("floor_price"),
                        row.getBoolean("inclusive"), row.getString("tax_code"), row.getBigDecimal("rate"),
                        row.getBigDecimal("conversion_to_base"), row.getBigDecimal("quantity_step")))
                .optional().orElseThrow(() -> new StaffScope.Failure(422, "price_unavailable",
                        "No effective standard price or tax rate exists for this product unit."));

        var amount = price.standard();
        var source = "STANDARD";
        var rule = price.standardRule();
        if (price.customerRule() != null) {
            amount = price.fixed() != null ? price.fixed()
                    : amount.multiply(BigDecimal.ONE.subtract(price.discount().movePointLeft(2)));
            source = "CUSTOMER";
            rule = price.customerRule();
        }
        if (price.promotion() != null && price.promotion().compareTo(amount) < 0) {
            amount = price.promotion();
            source = "PROMOTION";
            rule = price.promotionRule();
        }
        if (price.floor() != null && amount.compareTo(price.floor()) < 0) {
            throw new StaffScope.Failure(422, "price_below_floor", "The effective price needs office review before use.");
        }
        if (amount.scale() > 8) {
            amount = amount.setScale(8, RoundingMode.HALF_UP);
        }
        return Optional.of(new Price(customer, unit, "AUD", amount.toPlainString(), source, rule,
                price.inclusive(), price.taxCode(), price.rate().toPlainString(), price.conversion().toPlainString(),
                price.step().toPlainString(), now));
    }

    record Price(UUID customerId, UUID productUnitId, String currency, String unitPrice, String source, UUID ruleId,
            boolean inclusive, String taxCode, String taxRate, String conversionToBase, String quantityStep,
            OffsetDateTime pricingAt) {}

    private record Inputs(BigDecimal standard, UUID standardRule, BigDecimal fixed, BigDecimal discount,
            UUID customerRule, BigDecimal promotion, UUID promotionRule, BigDecimal floor, boolean inclusive,
            String taxCode, BigDecimal rate, BigDecimal conversion, BigDecimal step) {}
}
