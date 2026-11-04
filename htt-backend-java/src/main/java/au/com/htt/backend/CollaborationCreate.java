package au.com.htt.backend;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.Locale;
import java.util.UUID;
import tools.jackson.databind.JsonNode;

record CollaborationCreate(UUID id, String kind, UUID customerId, UUID branchId, JsonNode data) {
    private static final UUID EMPTY_ID = new UUID(0, 0);
    private static final java.time.format.DateTimeFormatter CAPTURED_AT = new DateTimeFormatterBuilder()
            .appendPattern("uuuu-MM-dd'T'HH:mm:ss").appendFraction(ChronoField.NANO_OF_SECOND, 0, 7, true)
            .appendOffset("+HH:MM", "+00:00").toFormatter(Locale.ROOT);

    boolean hasIds() {
        return id != null && !EMPTY_ID.equals(id) && customerId != null && !EMPTY_ID.equals(customerId)
                && branchId != null && !EMPTY_ID.equals(branchId);
    }

    String capability() {
        if (kind == null) {
            throw new BranchQuery.InvalidFilter("kind", "Invalid kind.");
        }
        return switch (kind) {
            case "VISIT" -> "crm.visits.write";
            case "NOTE" -> "crm.notes.write";
            case "BOARD" -> "crm.boards.write";
            default -> throw new BranchQuery.InvalidFilter("kind", "Invalid kind.");
        };
    }

    String normalizedData() {
        if (data == null || !data.isObject()) {
            throw invalidPayload();
        }
        return switch (kind) {
            case "NOTE" -> note();
            case "BOARD" -> board();
            default -> visit();
        };
    }

    private String note() {
        String text = text("text", 10000, true);
        String visibility = data.has("visibility") ? rawText("visibility") : "TEAM";
        if (visibility == null || !List.of("TEAM", "PRIVATE", "OFFICE").contains(visibility)) {
            throw new BranchQuery.InvalidFilter("visibility", "Invalid visibility.");
        }
        return "{\"text\":" + legacyString(text) + ",\"visibility\":" + legacyString(visibility) + "}";
    }

    private String board() {
        OffsetDateTime placed;
        UUID product;
        try {
            String date = rawText("placedAt");
            placed = date == null ? null : OffsetDateTime.parse(date);
            String id = rawText("productId");
            product = id == null ? null : UUID.fromString(id);
        } catch (RuntimeException invalid) {
            throw invalidPayload();
        }
        if (placed == null || placed.isAfter(OffsetDateTime.now().plusMinutes(5)) || EMPTY_ID.equals(product)) {
            throw new BranchQuery.InvalidFilter("placedAt", "Valid placement date and product required.");
        }
        return "{\"title\":" + legacyString(text("title", 200, true))
                + ",\"placedAt\":" + legacyString(CAPTURED_AT.format(placed.withOffsetSameInstant(ZoneOffset.UTC)))
                + ",\"productId\":" + (product == null ? "null" : legacyString(product.toString()))
                + ",\"description\":" + optionalString(text("description", 2000, false)) + "}";
    }

    private String rawText(String field) {
        var node = data.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isString()) {
            throw invalidPayload();
        }
        return node.asString();
    }

    private String text(String field, int limit, boolean required) {
        String raw = rawText(field);
        String value = raw == null ? "" : raw.strip();
        if (required && (value.isEmpty() || value.length() > limit)) {
            throw new BranchQuery.InvalidFilter(field, field + " must contain 1.." + limit + " characters.");
        }
        if (value.length() > limit) {
            throw new BranchQuery.InvalidFilter(field, field + " exceeds " + limit + " characters.");
        }
        return value;
    }

    private static String optionalString(String value) {
        return value == null || value.isEmpty() ? "null" : legacyString(value);
    }

    private static StaffScope.Failure invalidPayload() {
        return new StaffScope.Failure(422, "invalid_collaboration", "Supply the documented collaboration payload.");
    }

    private String visit() {
        var position = data == null ? null : data.get("checkIn");
        BigDecimal latitude;
        BigDecimal longitude;
        BigDecimal accuracy;
        OffsetDateTime captured;
        String purpose;
        try {
            latitude = decimal(position.get("latitude"));
            longitude = decimal(position.get("longitude"));
            accuracy = decimal(position.get("accuracyMetres"));
            captured = OffsetDateTime.parse(position.get("capturedAt").asString());
            var rawPurpose = data.get("purpose");
            if (rawPurpose != null && !rawPurpose.isNull() && !rawPurpose.isString()) {
                throw new IllegalArgumentException();
            }
            purpose = rawPurpose == null || rawPurpose.isNull() ? null : rawPurpose.asString().strip();
        } catch (RuntimeException invalid) {
            throw new StaffScope.Failure(422, "invalid_collaboration", "Supply the documented collaboration payload.");
        }
        var now = OffsetDateTime.now();
        if (latitude.abs().compareTo(BigDecimal.valueOf(90)) > 0
                || longitude.abs().compareTo(BigDecimal.valueOf(180)) > 0
                || latitude.stripTrailingZeros().scale() > 7 || longitude.stripTrailingZeros().scale() > 7
                || accuracy.compareTo(BigDecimal.ONE) < 0 || accuracy.compareTo(BigDecimal.valueOf(1000)) > 0
                || captured.isBefore(now.minusDays(7)) || captured.isAfter(now.plusMinutes(5))) {
            throw new BranchQuery.InvalidFilter("position",
                    "Provide coordinates, accuracy 1..1000m and capture time within past 7 days.");
        }
        if (purpose != null && purpose.length() > 2000) {
            throw new BranchQuery.InvalidFilter("purpose", "purpose exceeds 2000 characters.");
        }
        // Property order and string encoding are part of the legacy SHA-256 input.
        return "{\"checkIn\":{\"latitude\":\"" + latitude.toPlainString()
                + "\",\"longitude\":\"" + longitude.toPlainString()
                + "\",\"accuracyMetres\":\"" + accuracy.toPlainString()
                + "\",\"capturedAt\":" + legacyString(CAPTURED_AT.format(captured))
                + "},\"purpose\":" + (purpose == null || purpose.isEmpty() ? "null" : legacyString(purpose)) + "}";
    }

    String canonical(String normalized) {
        return "{\"id\":\"" + id + "\",\"kind\":" + legacyString(kind) + ",\"customerId\":\"" + customerId
                + "\",\"branchId\":\"" + branchId + "\",\"data\":" + normalized + "}";
    }

    private static BigDecimal decimal(JsonNode node) {
        if (node.isString() && !node.asString().matches("[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)")) {
            throw new IllegalArgumentException();
        }
        if (!node.isString() && !node.isNumber()) {
            throw new IllegalArgumentException();
        }
        var value = new BigDecimal(node.asString());
        if (value.precision() > 29 || value.scale() > 28 || value.scale() < -28) {
            throw new IllegalArgumentException();
        }
        return value;
    }

    static String legacyString(String value) {
        var result = new StringBuilder("\"");
        for (int index = 0; index < value.length(); index++) {
            char c = value.charAt(index);
            switch (c) {
                case '\\' -> result.append("\\\\");
                case '\b' -> result.append("\\b");
                case '\f' -> result.append("\\f");
                case '\n' -> result.append("\\n");
                case '\r' -> result.append("\\r");
                case '\t' -> result.append("\\t");
                default -> {
                    if (c < 32 || c > 126 || "\"&'+<>`".indexOf(c) >= 0) {
                        result.append(String.format(Locale.ROOT, "\\u%04X", (int) c));
                    } else {
                        result.append(c);
                    }
                }
            }
        }
        return result.append('"').toString();
    }
}
