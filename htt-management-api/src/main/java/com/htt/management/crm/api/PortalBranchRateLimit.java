package com.htt.management.crm.api;

import java.time.Clock;
import java.util.HashMap;
import java.util.Map;

/** Legacy portal policy: 300 requests per issuer/subject per fixed minute, no queue; per instance. */
public class PortalBranchRateLimit {
    private static final long WINDOW_MS = 60_000;
    private final Clock clock;
    private final int maximumSubjects;
    private final Map<Subject, Window> windows = new HashMap<>();
    private long cleanupAt;

    public PortalBranchRateLimit(Clock clock, int maximumSubjects) {
        if (maximumSubjects < 1) throw new IllegalArgumentException("A bounded subject limit is required.");
        this.clock = clock;
        this.maximumSubjects = maximumSubjects;
    }

    public synchronized boolean allow(String issuer, String subject) {
        long now = clock.millis();
        if (now >= cleanupAt) {
            windows.values().removeIf(window -> now - window.started >= WINDOW_MS);
            cleanupAt = now + WINDOW_MS;
        }
        var key = new Subject(issuer, subject);
        Window window = windows.get(key);
        if (window == null) {
            if (windows.size() >= maximumSubjects) return false;
            window = new Window(now);
            windows.put(key, window);
        } else if (now - window.started >= WINDOW_MS) {
            window = new Window(now);
            windows.put(key, window);
        }
        if (window.requests >= 300) return false;
        window.requests++;
        return true;
    }

    private record Subject(String issuer, String subject) { }
    private static final class Window {
        final long started;
        int requests;
        Window(long started) { this.started = started; }
    }
}
