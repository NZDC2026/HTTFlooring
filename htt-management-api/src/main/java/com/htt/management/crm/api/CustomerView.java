package com.htt.management.crm.api;

import com.htt.management.crm.domain.Customer;
import com.htt.management.crm.domain.CustomerRules.*;
import java.time.Instant;
import java.util.List;

/** External projection: no internal UUIDs, mutable balances, credentials or internal account identifiers. */
public record CustomerView(String id,String code,String businessName,String tradingName,String abn,String businessType,
        Status status,String email,String phone,String website,PricingTier pricingTier,boolean creditHold,String creditLimit,
        String currency,PaymentTermsType paymentTermsType,int paymentTermsDays,String internalNotes,Address billingAddress,
        List<LocationView> locations,List<Contact> contacts,String primaryLocationId,String primaryContactId,
        String currentBalance,String overdueBalance,long version,Instant createdAt,Instant updatedAt) {
    public record LocationView(String id,String name,String addressLine1,String addressLine2,String suburb,String state,
            String postcode,String country,String phone,boolean isPrimary) {
        static LocationView of(Location l) { var a=l.address();return new LocationView(l.id(),l.name(),a.addressLine1(),a.addressLine2(),
                a.suburb(),a.state(),a.postcode(),a.country(),l.phone(),l.isPrimary()); }
    }
    public static CustomerView of(Customer c) {
        var p=c.profile();
        // No ledger module exists yet: only newly managed zero-ledger customers are supported by this projection.
        return new CustomerView(c.businessId(),c.code(),p.businessName(),p.tradingName(),p.abn(),p.businessType(),p.status(),p.email(),p.phone(),p.website(),
                p.pricingTier(),p.creditHold(),p.creditLimit().toPlainString(),p.currency(),p.paymentTerms().type(),p.paymentTerms().days(),p.internalNotes(),
                p.billingAddress(),p.locations().stream().map(LocationView::of).toList(),p.contacts(),p.primaryLocationId(),p.primaryContactId(),
                "0.00","0.00",c.version(),c.createdAt(),c.updatedAt());
    }
}
