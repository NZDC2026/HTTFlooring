package com.htt.management.crm.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Customer profile rules only; neither account eligibility nor accounting balances are derived here. */
public final class CustomerRules {
    private CustomerRules() { }
    public enum Status { ACTIVE, ON_HOLD, INACTIVE }
    public enum PricingTier { STANDARD, VIP, VVIP, CONTAINER }
    public enum PaymentTermsType { COD, DAYS, DAY_OF_MONTH }
    public static final Set<String> BUSINESS_TYPES = Set.of("Flooring Retailer", "Builder", "Developer",
            "Designer", "Architect", "Installer", "End Customer", "Other");

    public record Address(String addressLine1, String addressLine2, String suburb, String state,
            String postcode, String country) {
        public Address {
            addressLine1 = text(addressLine1, 160, "addressLine1", true);
            addressLine2 = text(addressLine2, 160, "addressLine2", false);
            suburb = text(suburb, 100, "suburb", true);
            state = text(state, 50, "state", true);
            postcode = text(postcode, 20, "postcode", true);
            country = text(country, 100, "country", true);
        }
    }

    public record Location(String id, String name, Address address, String phone, boolean isPrimary) {
        public Location {
            id = businessId(id);
            name = text(name, 100, "location.name", true);
            if (address == null) throw new InvalidCustomer("location.address");
            phone = text(phone, 40, "location.phone", false);
        }
        Location primary() { return new Location(id, name, address, phone, true); }
    }

    public record Contact(String id, String firstName, String lastName, String jobTitle, String email,
            String phone, String mobile, String locationId, boolean isPrimary, boolean isAccounting) {
        public Contact {
            id = businessId(id);
            firstName = text(firstName, 160, "contact.firstName", true);
            lastName = text(lastName, 80, "contact.lastName", false);
            jobTitle = text(jobTitle, 100, "contact.jobTitle", false);
            email = CustomerRules.email(email, "contact.email");
            phone = text(phone, 40, "contact.phone", false);
            mobile = text(mobile, 40, "contact.mobile", false);
            locationId = locationId == null || locationId.isBlank() ? null : businessId(locationId);
        }
        Contact primary() { return new Contact(id, firstName, lastName, jobTitle, email, phone, mobile,
                locationId, true, isAccounting); }
    }

    public record Profile(String businessName, String tradingName, String abn, String businessType,
            Status status, String email, String phone, String website, PricingTier pricingTier,
            boolean creditHold, BigDecimal creditLimit, String currency, PaymentTerms paymentTerms,
            String internalNotes, Address billingAddress, List<Location> locations, List<Contact> contacts) {
        public Profile {
            businessName = text(businessName, 120, "businessName", true);
            tradingName = text(tradingName, 120, "tradingName", false);
            abn = CustomerRules.abn(abn);
            if (!BUSINESS_TYPES.contains(businessType == null ? "" : businessType)) throw new InvalidCustomer("businessType");
            if (status == null) throw new InvalidCustomer("status");
            email = CustomerRules.email(email, "email");
            phone = text(phone, 40, "phone", false);
            website = CustomerRules.website(website);
            pricingTier = pricingTier == null ? PricingTier.STANDARD : pricingTier;
            if (!businessType.equals("Flooring Retailer") && pricingTier != PricingTier.STANDARD)
                throw new InvalidCustomer("pricingTier");
            creditLimit = money(creditLimit);
            if (currency == null || !currency.matches("[A-Z]{3}")) throw new InvalidCustomer("currency");
            try { java.util.Currency.getInstance(currency); }
            catch (IllegalArgumentException failure) { throw new InvalidCustomer("currency"); }
            if (paymentTerms == null) throw new InvalidCustomer("paymentTerms");
            internalNotes = text(internalNotes, 500, "internalNotes", false);
            locations = locations == null ? List.of() : List.copyOf(locations);
            contacts = contacts == null ? List.of() : List.copyOf(contacts);
            if(locations.size()>200||contacts.size()>200) throw new InvalidCustomer("customer.collections");
            uniqueIds(locations.stream().map(Location::id).toList(), "locations.id");
            uniqueIds(contacts.stream().map(Contact::id).toList(), "contacts.id");
            long primaryLocations = locations.stream().filter(Location::isPrimary).count();
            long primaryContacts = contacts.stream().filter(Contact::isPrimary).count();
            if (primaryLocations > 1) throw new InvalidCustomer("locations.isPrimary");
            if (primaryContacts > 1) throw new InvalidCustomer("contacts.isPrimary");
            if (contacts.stream().filter(Contact::isAccounting).count() > 1) throw new InvalidCustomer("contacts.isAccounting");
            Set<String> ids = new HashSet<>(locations.stream().map(Location::id).toList());
            if (contacts.stream().anyMatch(c -> c.locationId() != null && !ids.contains(c.locationId())))
                throw new InvalidCustomer("contacts.locationId");
        }
        /** Apply defaults only to commands, never manufacture stored flags during a query. */
        public Profile withDefaults() {
            var addresses=new java.util.ArrayList<>(locations);var people=new java.util.ArrayList<>(contacts);
            if(!addresses.isEmpty()&&addresses.stream().noneMatch(Location::isPrimary)) addresses.set(0,addresses.getFirst().primary());
            if(!people.isEmpty()&&people.stream().noneMatch(Contact::isPrimary)) people.set(0,people.getFirst().primary());
            return new Profile(businessName,tradingName,abn,businessType,status,email,phone,website,pricingTier,creditHold,
                    creditLimit,currency,paymentTerms,internalNotes,billingAddress,addresses,people);
        }
        public String primaryLocationId() { return locations.stream().filter(Location::isPrimary).map(Location::id).findFirst().orElse(null); }
        public String primaryContactId() { return contacts.stream().filter(Contact::isPrimary).map(Contact::id).findFirst().orElse(null); }
    }

    public record PaymentTerms(PaymentTermsType type, int days) {
        public PaymentTerms {
            type = type == null ? (days == 0 ? PaymentTermsType.COD : PaymentTermsType.DAYS) : type;
            if (type == PaymentTermsType.COD && days != 0
                    || type == PaymentTermsType.DAYS && (days < 0 || days > 365)
                    || type == PaymentTermsType.DAY_OF_MONTH && (days < 1 || days > 31))
                throw new InvalidCustomer("paymentTermsDays");
        }
        public LocalDate dueDate(LocalDate documentDate) {
            if (documentDate == null) throw new InvalidCustomer("documentDate");
            return switch (type) {
                case COD -> documentDate;
                case DAYS -> documentDate.plusDays(days);
                case DAY_OF_MONTH -> {
                    YearMonth month = YearMonth.from(documentDate).plusMonths(1);
                    yield month.atDay(Math.min(days, month.lengthOfMonth()));
                }
            };
        }
    }

    public static String businessId(String value) {
        String id = text(value, 100, "id", true);
        if (!id.matches("[A-Za-z0-9][A-Za-z0-9_-]{0,99}")) throw new InvalidCustomer("id");
        return id;
    }

    public static String loginName(String value) {
        String name = text(value, 320, "loginName", true).toLowerCase(Locale.ROOT);
        if (name.chars().anyMatch(Character::isWhitespace)) throw new InvalidCustomer("loginName");
        return name;
    }

    public static String abn(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.replaceAll("(?U)\\s", "");
        if (!normalized.matches("[0-9]{11}")) throw new InvalidCustomer("abn");
        return normalized;
    }

    public static BigDecimal money(BigDecimal value) {
        if (value == null || value.signum() < 0 || value.precision() - value.scale() > 17)
            throw new InvalidCustomer("creditLimit");
        try { return value.setScale(2, RoundingMode.UNNECESSARY); }
        catch (ArithmeticException failure) { throw new InvalidCustomer("creditLimit"); }
    }

    public static String website(String value) {
        String website = text(value, 200, "website", false);
        if (website == null) return null;
        try {
            var uri = java.net.URI.create(website.startsWith("www.") ? "https://" + website : website);
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null) throw new InvalidCustomer("website");
        } catch (IllegalArgumentException failure) { throw new InvalidCustomer("website"); }
        return website;
    }

    private static String email(String value, String field) {
        String email = text(value, 320, field, false);
        if (email != null && !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) throw new InvalidCustomer(field);
        return email;
    }
    private static String text(String value, int max, String field, boolean required) {
        String normalized = value == null ? null : value.strip();
        if (normalized == null || normalized.isEmpty()) {
            if (required) throw new InvalidCustomer(field);
            return null;
        }
        if (normalized.codePointCount(0, normalized.length()) > max) throw new InvalidCustomer(field);
        return normalized;
    }
    private static void uniqueIds(List<String> ids, String field) {
        if (new HashSet<>(ids).size() != ids.size()) throw new InvalidCustomer(field);
    }
    public static final class InvalidCustomer extends IllegalArgumentException {
        private final String field;
        public InvalidCustomer(String field) { super("Invalid customer field: " + field); this.field = field; }
        public String field() { return field; }
    }
}
