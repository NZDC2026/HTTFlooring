package com.htt.management.notification;

import com.htt.management.notification.NotificationModels.Delivery;

public interface NotificationChannel {
    enum Result { SENT, SIMULATED }
    enum PermanentReason { INVALID_DEVICE, PROVIDER_REJECTED }
    final class PermanentFailure extends RuntimeException {
        private final PermanentReason reason;
        public PermanentFailure(PermanentReason reason) { super(reason.name()); this.reason=reason; }
        public PermanentReason reason() { return reason; }
    }
    String name();
    Result send(Delivery delivery);
}
