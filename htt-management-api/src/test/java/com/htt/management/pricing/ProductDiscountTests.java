package com.htt.management.pricing;

import com.htt.management.identity.CustomerManagementAccess;
import com.htt.management.identity.CustomerPricingAccess;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductDiscountTests {
    @Test void percentagesAreExplicitReductionsWithAtMostFourDecimals() {
        for(String value:List.of("0","10","100","7.1234","0.00000"))
            ProductDiscountService.validate(new ProductDiscountService.Input(new BigDecimal(value),0L));
        for(String value:List.of("-0.1","100.0001","1.23456"))
            assertThatThrownBy(()->ProductDiscountService.validate(new ProductDiscountService.Input(new BigDecimal(value),0L)))
                    .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->ProductDiscountService.validate(new ProductDiscountService.Input(BigDecimal.TEN,-1L)))
                .isInstanceOf(ResponseStatusException.class);
    }
    @Test void storageFailureNeverBecomesZeroOrInheritedDiscount() {
        var store=mock(ProductDiscountStore.class);var access=mock(CustomerPricingAccess.class);
        var context=new CustomerPricingAccess.Context(UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID());
        when(access.requireOwn()).thenReturn(context);
        var products=List.of(UUID.randomUUID());
        when(store.resolve(context.companyId(),context.subjectId(),context.customerId(),products))
                .thenThrow(new DataAccessResourceFailureException("synthetic failure"));
        var service=new ProductDiscountService(store,mock(CustomerManagementAccess.class),access);
        assertThatThrownBy(()->service.resolve(products)).isInstanceOf(DataAccessResourceFailureException.class);
    }
    @Test void incompleteProductBatchIsRejectedRatherThanReturningPartialPrices() {
        var store=mock(ProductDiscountStore.class);var access=mock(CustomerPricingAccess.class);
        when(access.requireOwn()).thenReturn(new CustomerPricingAccess.Context(UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID()));
        var service=new ProductDiscountService(store,mock(CustomerManagementAccess.class),access);
        assertThatThrownBy(()->service.resolve(List.of(UUID.randomUUID()))).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->service.resolve(List.of())).isInstanceOf(ResponseStatusException.class);
    }
}
