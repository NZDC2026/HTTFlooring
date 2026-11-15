package com.htt.management.crm.domain;

import java.time.Instant;
import java.util.UUID;

/** Aggregate identity uses internal UUIDs; external clients only receive businessId. */
public record Customer(UUID id, UUID companyId, String businessId, String code, long version,
        Instant createdAt, Instant updatedAt, CustomerRules.Profile profile) { }
