package au.com.htt.backend;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class PriceRead {
    private final JdbcClient jdbc;
    private final QuotePricing pricing;

    PriceRead(JdbcClient jdbc,QuotePricing pricing) {
        this.jdbc=jdbc;
        this.pricing=pricing;
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
        var facts=pricing.resolve(customer,unit,now,true);
        var data=facts.data();
        return Optional.of(new Price(customer,unit,"AUD",facts.unitPrice().toPlainString(),facts.source(),facts.ruleId(),
                (Boolean)data.get("inclusive"),data.get("tax_code").toString(),((BigDecimal)data.get("rate")).toPlainString(),
                ((BigDecimal)data.get("conversion_to_base")).toPlainString(),((BigDecimal)data.get("quantity_step")).toPlainString(),now));
    }

    record Price(UUID customerId, UUID productUnitId, String currency, String unitPrice, String source, UUID ruleId,
            boolean inclusive, String taxCode, String taxRate, String conversionToBase, String quantityStep,
            OffsetDateTime pricingAt) {}

}
