package com.htt.management.notification;

/** Explicit fake for Android/iOS FCM integration. No network request and no claim of device delivery. */
public class FakePushProvider implements NotificationChannel {
    @Override public String name() { return "FCM"; }
    @Override public Result send(NotificationModels.Delivery delivery) { return Result.SIMULATED; }
}
