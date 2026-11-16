package com.htt.management.crm;

import com.htt.management.crm.domain.CustomerRules;
import com.htt.management.crm.domain.CustomerRules.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class CustomerRulesTests {
    private final Address address = new Address("1 Synthetic Street", null, "Melbourne", "VIC", "3000", "Australia");

    private Profile profile(String type, PricingTier tier, Status status, boolean hold,
            List<Location> locations, List<Contact> contacts) {
        return new Profile(" Test Customer ", null, "12 345 678 901", type, status, null, null,
                "www.abcflooring.com.au", tier, hold, new BigDecimal("1000"), "AUD",
                new PaymentTerms(PaymentTermsType.DAYS, 30), null, null, locations, contacts).withDefaults();
    }
    private Contact contact(String id, String location, boolean primary, boolean accounting) {
        return new Contact(id, "Test", "Person", "Accountant", "person@example.invalid", null, null, location, primary, accounting);
    }

    @Test void defaultsComeFromFlagsAndFirstRowsNotJobTitles() {
        var input = profile("Flooring Retailer", null, Status.ACTIVE, false,
                List.of(new Location("loc_001", "Delivery", address, null, false)),
                List.of(contact("con_001", "loc_001", false, false)));
        assertThat(input.businessName()).isEqualTo("Test Customer");
        assertThat(input.abn()).isEqualTo("12345678901");
        assertThat(input.pricingTier()).isEqualTo(PricingTier.STANDARD);
        assertThat(input.creditLimit()).isEqualByComparingTo("1000.00");
        assertThat(input.primaryLocationId()).isEqualTo("loc_001");
        assertThat(input.primaryContactId()).isEqualTo("con_001");
        assertThat(input.contacts().getFirst().isAccounting()).isFalse();
        assertThat(input.billingAddress()).isNull();
    }

    @Test void statusAndCreditHoldAreIndependent() {
        for (Status status : Status.values()) for (boolean hold : new boolean[]{false, true}) {
            var input = profile("Builder", PricingTier.STANDARD, status, hold, List.of(), List.of());
            assertThat(input.status()).isEqualTo(status);
            assertThat(input.creditHold()).isEqualTo(hold);
        }
    }

    @Test void nonRetailerCannotReceivePrivilegedPricing() {
        for (String type : CustomerRules.BUSINESS_TYPES) for (PricingTier tier : PricingTier.values()) {
            if (type.equals("Flooring Retailer") || tier == PricingTier.STANDARD)
                assertThatCode(() -> profile(type, tier, Status.ACTIVE, false, List.of(), List.of())).doesNotThrowAnyException();
            else assertThatThrownBy(() -> profile(type, tier, Status.ACTIVE, false, List.of(), List.of()))
                    .isInstanceOf(InvalidCustomer.class).hasMessageContaining("pricingTier");
        }
    }

    @Test void duplicatedDefaultsAccountingContactsAndIdentifiersAreRejected() {
        var location = new Location("loc_001", "Delivery", address, null, true);
        assertThatThrownBy(() -> profile("Builder", null, Status.ACTIVE, false,
                List.of(location, location), List.of())).isInstanceOf(InvalidCustomer.class);
        assertThatThrownBy(() -> profile("Builder", null, Status.ACTIVE, false,
                List.of(location, new Location("loc_002", "Second", address, null, true)), List.of()))
                .hasMessageContaining("locations.isPrimary");
        assertThatThrownBy(() -> profile("Builder", null, Status.ACTIVE, false, List.of(),
                List.of(contact("con_001", null, true, false), contact("con_002", null, true, false))))
                .hasMessageContaining("contacts.isPrimary");
        assertThatThrownBy(() -> profile("Builder", null, Status.ACTIVE, false, List.of(),
                List.of(contact("con_001", null, false, true), contact("con_002", null, false, true))))
                .hasMessageContaining("contacts.isAccounting");
    }

    @Test void contactCannotReferenceAnAddressOutsideItsAggregate() {
        assertThatThrownBy(() -> profile("Builder", null, Status.ACTIVE, false, List.of(),
                List.of(contact("con_001", "loc_another_customer", false, false))))
                .hasMessageContaining("contacts.locationId");
    }

    @Test void paymentTypesValidateBoundariesAndLegacyDefaults() {
        assertThat(new PaymentTerms(null, 0).type()).isEqualTo(PaymentTermsType.COD);
        assertThat(new PaymentTerms(null, 30).type()).isEqualTo(PaymentTermsType.DAYS);
        assertThatThrownBy(() -> new PaymentTerms(PaymentTermsType.COD, 1)).isInstanceOf(InvalidCustomer.class);
        for (int days : new int[]{-1, 366}) assertThatThrownBy(() -> new PaymentTerms(PaymentTermsType.DAYS, days)).isInstanceOf(InvalidCustomer.class);
        for (int days : new int[]{0, 32}) assertThatThrownBy(() -> new PaymentTerms(PaymentTermsType.DAY_OF_MONTH, days)).isInstanceOf(InvalidCustomer.class);
        assertThatCode(() -> new PaymentTerms(PaymentTermsType.DAYS, 365)).doesNotThrowAnyException();
    }

    @Test void dueDatesUseNextMonthAndHandleLeapYearsAndYearBoundaries() {
        var end = new PaymentTerms(PaymentTermsType.DAY_OF_MONTH, 31);
        assertThat(end.dueDate(LocalDate.of(2024, 1, 20))).isEqualTo(LocalDate.of(2024, 2, 29));
        assertThat(end.dueDate(LocalDate.of(2025, 1, 20))).isEqualTo(LocalDate.of(2025, 2, 28));
        assertThat(end.dueDate(LocalDate.of(2026, 3, 1))).isEqualTo(LocalDate.of(2026, 4, 30));
        assertThat(end.dueDate(LocalDate.of(2026, 12, 1))).isEqualTo(LocalDate.of(2027, 1, 31));
        assertThat(new PaymentTerms(PaymentTermsType.DAYS, 30).dueDate(LocalDate.of(2026, 1, 31)))
                .isEqualTo(LocalDate.of(2026, 3, 2));
    }

    @Test void moneyCannotBeNegativeOverflowOrSilentlyRounded() {
        for (String value : new String[]{"-0.01", "0.001", "100000000000000000"})
            assertThatThrownBy(() -> CustomerRules.money(new BigDecimal(value))).isInstanceOf(InvalidCustomer.class);
        assertThat(CustomerRules.money(new BigDecimal("99999999999999999.99"))).isEqualByComparingTo("99999999999999999.99");
    }

    @Test void businessIdsAreStringsAndLoginNamesNormalizeWithoutInferringIdentity() {
        for (String id : List.of("cus_001", "loc_001", "con_001", "cus_" + java.util.UUID.randomUUID()))
            assertThat(CustomerRules.businessId(id)).isEqualTo(id);
        for (String id : List.of("a".repeat(101), "../customer", "x/y"))
            assertThatThrownBy(() -> CustomerRules.businessId(id)).isInstanceOf(InvalidCustomer.class);
        assertThat(CustomerRules.loginName(" Customer@Example.Invalid ")).isEqualTo("customer@example.invalid");
    }

    @Test void addressesAbnAndWebsiteAreValidatedWithoutInventingMissingData() {
        assertThatThrownBy(() -> new Address("one", null, "", "VIC", "3000", "AU")).isInstanceOf(InvalidCustomer.class);
        assertThatThrownBy(() -> CustomerRules.abn("1234")).isInstanceOf(InvalidCustomer.class);
        assertThat(CustomerRules.abn("12\u00a0345 678 901")).isEqualTo("12345678901");
        assertThat(CustomerRules.website("www.abcflooring.com.au")).isEqualTo("www.abcflooring.com.au");
        for (String site : List.of("javascript:alert(1)", "https://user:secret@example.invalid", "not a website"))
            assertThatThrownBy(() -> CustomerRules.website(site)).isInstanceOf(InvalidCustomer.class);
    }
}
