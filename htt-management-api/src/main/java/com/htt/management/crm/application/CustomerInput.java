package com.htt.management.crm.application;

import com.htt.management.crm.domain.CustomerRules;
import com.htt.management.crm.domain.CustomerRules.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Write contract. No balance, generated code or credential fields. */
public record CustomerInput(Long version, String businessName, String tradingName, String abn,
        String businessType, Status status, String email, String phone, String website, PricingTier pricingTier,
        Boolean creditHold, BigDecimal creditLimit, String currency, PaymentTermsType paymentTermsType,
        Integer paymentTermsDays, String internalNotes, Address billingAddress,
        List<LocationInput> locations, List<ContactInput> contacts) {
    public Profile profile(String workspaceCurrency, Address billing, List<Location> addresses, List<Contact> people) {
        if (currency != null && !currency.equals(workspaceCurrency)) throw new InvalidCustomer("currency");
        return new Profile(businessName, tradingName, abn, businessType, status == null ? Status.ACTIVE : status,
                email, phone, website, pricingTier, Boolean.TRUE.equals(creditHold),
                creditLimit == null ? BigDecimal.ZERO : creditLimit, workspaceCurrency,
                new PaymentTerms(paymentTermsType, paymentTermsDays == null ? 0 : paymentTermsDays),
                internalNotes, billing, addresses, people);
    }
    public record LocationInput(Long version, String id, String name, String addressLine1, String addressLine2,
            String suburb, String state, String postcode, String country, String phone, Boolean isPrimary) {
        public Location domain() { return new Location(id == null ? "loc_" + UUID.randomUUID() : id, name,
                new Address(addressLine1,addressLine2,suburb,state,postcode,country), phone, Boolean.TRUE.equals(isPrimary)); }
    }
    public record ContactInput(Long version, String id, String firstName, String lastName, String jobTitle,
            String email, String phone, String mobile, String locationId, Boolean isPrimary, Boolean isAccounting) {
        public Contact domain() { return new Contact(id == null ? "con_" + UUID.randomUUID() : id, firstName,lastName,
                jobTitle,email,phone,mobile,locationId,Boolean.TRUE.equals(isPrimary),Boolean.TRUE.equals(isAccounting)); }
    }
}
