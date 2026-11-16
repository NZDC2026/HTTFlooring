package com.htt.management.pricing;

import com.htt.management.identity.CustomerManagementAccess;
import com.htt.management.identity.CustomerPricingAccess;
import com.htt.management.identity.AccessAudit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
class PricingConfiguration {
    @Bean CustomerPricingAccess customerPricingAccess(JdbcTemplate jdbc,AccessAudit audit) { return new CustomerPricingAccess(jdbc,audit); }
    @Bean ProductDiscountStore productDiscountStore(JdbcTemplate jdbc) { return new ProductDiscountStore(jdbc); }
    @Bean ProductDiscountService productDiscountService(ProductDiscountStore store,CustomerManagementAccess management,CustomerPricingAccess portal) {
        return new ProductDiscountService(store,management,portal);
    }
}
