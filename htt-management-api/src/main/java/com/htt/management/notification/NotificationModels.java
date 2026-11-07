package com.htt.management.notification;

import com.htt.management.identity.AccessSnapshot;
import com.htt.management.identity.VerifiedToken;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class NotificationModels {
    private NotificationModels() {}
    public record Session(UUID companyId, UUID userId, UUID grantId, AccessSnapshot.Realm realm, VerifiedToken token) {}
    public record Notice(UUID id, UUID companyId, UUID userId, UUID customerId, UUID branchId, long cursor,
            String title, String body, Instant createdAt, Instant readAt) {}
    public record History(List<Notice> items, long nextCursor, long highWatermark, boolean hasMore) {}
    public record Delivery(UUID id, UUID leaseId, int attempt, String channel, UUID targetId, Notice notice, String deviceToken) {}
    public record Wakeup(UUID companyId, UUID userId) {}
}
