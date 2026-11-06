package au.com.htt.backend;

import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class LegacyRateLimitTest {
    @Test void partitionsSubjectsAndPoliciesAndPreservesWindowAlignment() {
        var time=new AtomicLong();
        var limiter=new LegacyRateLimit(time::get);
        for (int i=0;i<300;i++) assertThat(limiter.acquire("api","a")).isTrue();
        assertThat(limiter.acquire("api","a")).isFalse();
        assertThat(limiter.acquire("api","b")).isTrue();
        assertThat(limiter.acquire("portal","a")).isTrue();
        time.set(LegacyRateLimit.WINDOW*2+LegacyRateLimit.WINDOW/2);
        for (int i=0;i<300;i++) assertThat(limiter.acquire("api","a")).isTrue();
        assertThat(limiter.acquire("api","a")).isFalse();
        time.set(LegacyRateLimit.WINDOW*3);
        assertThat(limiter.acquire("api","a")).isTrue();
    }
    @Test void filterCountsContextPathApiAndLeavesHealthUnlimited() throws Exception {
        var limiter=new LegacyRateLimit(()->0);
        var filter=new LegacyRateLimit.Filter(limiter,false);
        var jwt=org.springframework.security.oauth2.jwt.Jwt.withTokenValue("fixture")
                .header("alg","RS256").subject("employee").issuer("https://issuer.example.test").build();
        var context=org.springframework.security.core.context.SecurityContextHolder.getContext();
        context.setAuthentication(new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken(jwt,java.util.List.of()));
        assertThat(context.getAuthentication().isAuthenticated()).isTrue();
        var passed=new java.util.concurrent.atomic.AtomicInteger();
        try {
            for (int i=0;i<301;i++) {
                var request=new org.springframework.mock.web.MockHttpServletRequest("GET","/prefix/api/v1/me");
                request.setContextPath("/prefix");
                var response=new org.springframework.mock.web.MockHttpServletResponse();
                filter.doFilter(request,response,(req,res)->passed.incrementAndGet());
                assertThat(response.getStatus()).isEqualTo(i<300?200:429);
            }
            var health=new org.springframework.mock.web.MockHttpServletRequest("GET","/prefix/health/live");
            health.setContextPath("/prefix");
            filter.doFilter(health,new org.springframework.mock.web.MockHttpServletResponse(),(req,res)->passed.incrementAndGet());
            assertThat(passed.get()).isEqualTo(301);
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }

    @Test void concurrentRequestsCannotExceedThreeHundredPermits() throws Exception {
        var limiter=new LegacyRateLimit(()->0);
        try (var pool=Executors.newFixedThreadPool(12)) {
            var tasks=IntStream.range(0,600).mapToObj(i->(java.util.concurrent.Callable<Boolean>)()->limiter.acquire("api","same")).toList();
            long accepted=0;
            for (var result:pool.invokeAll(tasks)) if (result.get()) accepted++;
            assertThat(accepted).isEqualTo(300);
        }
    }
}
