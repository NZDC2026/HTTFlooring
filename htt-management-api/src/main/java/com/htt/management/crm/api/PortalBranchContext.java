package com.htt.management.crm.api;

import java.util.Collections;
import java.util.UUID;
import java.util.regex.Pattern;

/** Header DTO. Accepts the D/N/B/P/X formats supported by the legacy Guid.TryParse filter. */
public record PortalBranchContext(UUID companyId, UUID grantId) {
    private static final String BYTE = "\\s*0x([0-9a-f]{1,2})\\s*";
    private static final Pattern HEX = Pattern.compile("\\{\\s*0x([0-9a-f]{1,8})\\s*,\\s*0x([0-9a-f]{1,4})\\s*,\\s*0x([0-9a-f]{1,4})\\s*,\\s*\\{"
            + String.join(",", Collections.nCopies(8, BYTE)) + "\\}\\s*\\}", Pattern.CASE_INSENSITIVE);

    public static PortalBranchContext fromHeaders(String company, String grant) {
        try { return new PortalBranchContext(parse(company), parse(grant)); }
        catch (IllegalArgumentException failure) { throw new Required(); }
    }

    private static UUID parse(String raw) {
        if (raw == null) throw new IllegalArgumentException();
        String text = raw.trim();
        var hex = HEX.matcher(text);
        UUID value;
        if (hex.matches()) {
            long high = (Long.parseUnsignedLong(hex.group(1), 16) << 32)
                    | (Long.parseUnsignedLong(hex.group(2), 16) << 16) | Long.parseUnsignedLong(hex.group(3), 16);
            long low = 0;
            for (int group = 4; group <= 11; group++) low = (low << 8) | Long.parseUnsignedLong(hex.group(group), 16);
            value = new UUID(high, low);
        } else {
            if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("(") && text.endsWith(")")))
                text = text.substring(1, text.length() - 1);
            if (text.matches("[0-9a-fA-F]{32}")) text = text.substring(0,8)+"-"+text.substring(8,12)+"-"
                    +text.substring(12,16)+"-"+text.substring(16,20)+"-"+text.substring(20);
            if (!text.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"))
                throw new IllegalArgumentException();
            value = UUID.fromString(text);
        }
        if (value.equals(new UUID(0,0))) throw new IllegalArgumentException();
        return value;
    }

    public static final class Required extends RuntimeException { }
}
