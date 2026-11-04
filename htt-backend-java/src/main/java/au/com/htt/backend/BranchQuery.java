package au.com.htt.backend;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

record BranchQuery(UUID customerId, String state, String status, String geocodeState, Boolean hasBoards,
        String q, UUID salesperson, BigDecimal south, BigDecimal north, BigDecimal west, BigDecimal east,
        Integer page, Integer pageSize) {
    Filter payload() {
        allowed(state, "state", "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA");
        allowed(status, "status", "ACTIVE", "ON_HOLD", "INACTIVE");
        allowed(geocodeState, "geocodeState", "LOCATED", "UNLOCATED", "STALE", "PENDING", "FAILED");
        String search = q == null || q.isBlank() ? null : q.strip();
        require(search == null || search.length() <= 100, "q", "q exceeds 100 characters.");
        boolean noBounds = south == null && north == null && west == null && east == null;
        boolean validBounds = south != null && north != null && west != null && east != null
                && within(south, 90) && within(north, 90) && south.compareTo(north) <= 0
                && within(west, 180) && within(east, 180);
        require(noBounds || validBounds, "bounds",
                "Supply complete valid bounding box; west>east crosses the date line.");
        int number = page == null ? 1 : page;
        int size = pageSize == null ? 25 : pageSize;
        require(number >= 1 && number <= 100000 && size >= 1 && size <= 100,
                "page", "page must be 1..100000 and pageSize 1..100.");
        return new Filter(customerId, state, status, geocodeState, hasBoards, search, salesperson,
                south, north, west, east, (number - 1) * size, size);
    }

    private static boolean within(BigDecimal value, int limit) {
        return value.abs().compareTo(BigDecimal.valueOf(limit)) <= 0;
    }

    private static void allowed(String value, String field, String... choices) {
        require(value == null || List.of(choices).contains(value), field, "Invalid " + field + ".");
    }

    private static void require(boolean valid, String field, String message) {
        if (!valid) {
            throw new InvalidFilter(field, message);
        }
    }

    record Filter(UUID customerId, String state, String status, String geocodeState, Boolean hasBoards,
            String q, UUID salesperson, BigDecimal south, BigDecimal north, BigDecimal west, BigDecimal east,
            int offset, int size) {}

    static final class InvalidFilter extends RuntimeException {
        final String field;

        InvalidFilter(String field, String message) {
            super(message);
            this.field = field;
        }
    }
}
