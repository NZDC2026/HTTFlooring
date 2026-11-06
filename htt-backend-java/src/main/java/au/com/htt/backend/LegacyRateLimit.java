package au.com.htt.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.LongSupplier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
class LegacyRateLimit {
    static final int PERMITS=300;
    static final long WINDOW=TimeUnit.MINUTES.toNanos(1);
    private final ConcurrentHashMap<Key,Bucket> buckets=new ConcurrentHashMap<>();
    private final AtomicLong calls=new AtomicLong();
    private final LongSupplier clock;
    LegacyRateLimit() {this(System::nanoTime);}
    LegacyRateLimit(LongSupplier clock) {this.clock=clock;}

    boolean acquire(String policy,String partition) {
        boolean[] accepted={false};
        buckets.compute(new Key(policy,partition),(key,current)->{
            long now=clock.getAsLong();
            var bucket=current==null?new Bucket(now):current;
            long elapsed=now-bucket.start;
            if (elapsed>=WINDOW) {
                bucket.start+=(elapsed/WINDOW)*WINDOW;
                bucket.used=0;
            }
            bucket.touched=now;
            accepted[0]=bucket.used<PERMITS;
            if (accepted[0]) bucket.used++;
            return bucket;
        });
        if ((calls.incrementAndGet()&1023)==0) {
            buckets.forEach((key,value)->buckets.computeIfPresent(key,(k,current)->
                    clock.getAsLong()-current.touched>10*WINDOW?null:current));
        }
        return accepted[0];
    }
    private record Key(String policy,String partition) {}
    private static final class Bucket {
        long start,touched;
        int used;
        Bucket(long now) {start=now;touched=now;}
    }
    static final class Filter extends OncePerRequestFilter {
        private final LegacyRateLimit limiter;
        private final boolean portal;
        Filter(LegacyRateLimit limiter,boolean portal) {this.limiter=limiter;this.portal=portal;}
        @Override protected String getAlreadyFilteredAttributeName() {
            return getClass().getName()+"."+(portal?"portal":"staff")+".FILTERED";
        }
        @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)
                throws ServletException,IOException {
            String prefix=portal?"/api/portal/v1/":"/api/v1/";
            var authentication=SecurityContextHolder.getContext().getAuthentication();
            String path=request.getRequestURI().substring(request.getContextPath().length());
            if (path.startsWith(prefix) && authentication instanceof JwtAuthenticationToken token
                    && authentication.isAuthenticated()) {
                String subject=token.getToken().getSubject();
                String remote=request.getRemoteAddr()==null?"unknown":request.getRemoteAddr();
                String identity=subject==null?remote:subject;
                String issuer=token.getToken().getClaimAsString("iss");
                String partition=portal?(issuer==null?"":issuer)+":"+identity:identity;
                if (!limiter.acquire(portal?"portal":"api",partition)) {
                    response.setStatus(429);
                    return;
                }
            }
            chain.doFilter(request,response);
        }
    }
}
