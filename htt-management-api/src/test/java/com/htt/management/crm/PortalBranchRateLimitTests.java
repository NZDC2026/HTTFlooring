package com.htt.management.crm;

import com.htt.management.crm.api.PortalBranchRateLimit;
import java.time.Clock;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PortalBranchRateLimitTests {
    @Test void fixedWindowAllows300Rejects301AndResetsAfterOneMinute() {
        var time=new AtomicLong(0);
        var clock=mock(Clock.class);
        when(clock.millis()).thenAnswer(invocation -> time.get());
        var limiter=new PortalBranchRateLimit(clock,10);
        for (int i=0;i<300;i++) assertThat(limiter.allow("issuer","subject")).isTrue();
        assertThat(limiter.allow("issuer","subject")).isFalse();
        time.set(59_999);
        assertThat(limiter.allow("issuer","subject")).isFalse();
        time.set(60_000);
        assertThat(limiter.allow("issuer","subject")).isTrue();
    }

    @Test void subjectsAndIssuersHaveSeparateBudgetsAndIdleStateIsReclaimed() {
        var time=new AtomicLong(0);
        var clock=mock(Clock.class);
        when(clock.millis()).thenAnswer(invocation -> time.get());
        var limiter=new PortalBranchRateLimit(clock,2);
        for (int i=0;i<300;i++) assertThat(limiter.allow("issuer-a","subject")).isTrue();
        assertThat(limiter.allow("issuer-b","subject")).isTrue();
        assertThat(limiter.allow("issuer-a","other-subject")).isFalse(); // Bounded memory, no unbounded partition map.
        time.set(60_000);
        assertThat(limiter.allow("issuer-a","other-subject")).isTrue();
    }

    @Test void clockRollbackCannotCreateAFreshBudget() {
        var clock=mock(Clock.class);
        when(clock.millis()).thenReturn(1_000L);
        var limiter=new PortalBranchRateLimit(clock,1);
        for (int i=0;i<300;i++) limiter.allow("issuer","subject");
        when(clock.millis()).thenReturn(0L);
        assertThat(limiter.allow("issuer","subject")).isFalse();
    }
}
