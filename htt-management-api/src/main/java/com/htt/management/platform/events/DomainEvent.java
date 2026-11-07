package com.htt.management.platform.events;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/** Trusted business facts. No transport, device token or channel dependency. */
public record DomainEvent(UUID id, int version, String type, UUID companyId, UUID aggregateId,
        UUID customerId, UUID branchId, List<UUID> recipients, Map<String, String> data, Instant occurredAt) {
    public DomainEvent {
        Objects.requireNonNull(id); Objects.requireNonNull(companyId); Objects.requireNonNull(aggregateId);
        Objects.requireNonNull(occurredAt);
        if (version != 1 || type == null || !type.matches("[a-z][a-z0-9.]{0,99}")) throw new IllegalArgumentException("Unsupported event envelope.");
        if (branchId != null && customerId == null) throw new IllegalArgumentException("Branch requires customer.");
        recipients = recipients.stream().distinct().sorted().toList();
        if (recipients.isEmpty() || recipients.size() > 100) throw new IllegalArgumentException("Expected 1 to 100 recipients.");
        data = Map.copyOf(data);
    }
}
