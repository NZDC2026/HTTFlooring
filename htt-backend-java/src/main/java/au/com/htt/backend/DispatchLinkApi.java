package au.com.htt.backend;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.http.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

/** Token-authorized date updates only. No JWT, customer grants or financial write authority. */
@RestController
@ConditionalOnProperty("htt.portal.database.url")
class DispatchLinkApi {
    private final PortalDatabase db;
    DispatchLinkApi(PortalDatabase db){this.db=db;}
    @RequestMapping(value="/api/dispatch-portal",method={RequestMethod.POST,RequestMethod.OPTIONS})
    ResponseEntity<String> dispatch(HttpServletRequest request) {
        String origin=request.getHeader("Origin");
        if(origin==null||!"true".equals(db.read("SELECT portal.dispatch_origin(:origin)::text",Map.of("origin",origin))))return ResponseEntity.status(403).body("{\"ok\":false,\"error\":\"Origin unavailable\"}");
        var headers=new HttpHeaders();headers.set("Access-Control-Allow-Origin",origin);headers.set("Vary","Origin");headers.set("Cache-Control","no-store");headers.set("Referrer-Policy","no-referrer");headers.setContentType(MediaType.APPLICATION_JSON);
        if("OPTIONS".equals(request.getMethod())){headers.set("Access-Control-Allow-Methods","POST");headers.set("Access-Control-Allow-Headers","Content-Type, X-HTT-Request");return new ResponseEntity<>("",headers,204);}
        try {
            var input=JsonMapper.builder().build().readTree((byte[])request.getAttribute("htt.dispatch.body"));
            String action=input.path("action").asText();
            if(!Set.of("view","update").contains(action))throw new IllegalArgumentException();
            var args=input.path("input");String token=args.path("token").asText();
            boolean update=action.equals("update");LocalDate date=update?LocalDate.parse(args.path("expectedDate").asText()):null;
            var params=new HashMap<String,Object>();params.put("token",token);params.put("origin",origin);params.put("date",date);params.put("reason",update?args.path("reason").asText():null);params.put("update",update);
            String value=db.dispatch("SELECT portal.dispatch_link(:token,:origin,CAST(:date AS date),:reason,:update)::text",params);
            return new ResponseEntity<>("{\"ok\":true,\"value\":"+value+"}",headers,200);
        }catch(Exception e){return new ResponseEntity<>("{\"ok\":false,\"error\":\"Link unavailable or request changed. Refresh the link and check the date and reason.\"}",headers,200);}
    }
}
@Configuration(proxyBeanMethods=false)
class DispatchLinkSecurity {
    @Bean @Order(0)
    SecurityFilterChain dispatchChain(HttpSecurity http,@Value("${htt.portal.database.url:}") String url) throws Exception {
        // This isolated endpoint authenticates with a random single-document token, never browser cookies.
        return http.securityMatcher("/api/dispatch-portal").csrf(c->c.ignoringRequestMatchers("/api/dispatch-portal"))
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a->{if(!url.isBlank())a.requestMatchers(org.springframework.http.HttpMethod.POST,"/api/dispatch-portal").permitAll().requestMatchers(org.springframework.http.HttpMethod.OPTIONS,"/api/dispatch-portal").permitAll();a.anyRequest().denyAll();})
            .addFilterBefore(new Guard(),org.springframework.security.web.access.intercept.AuthorizationFilter.class).build();
    }
    static final class Guard extends OncePerRequestFilter {
        private final Map<String,long[]> buckets=new ConcurrentHashMap<>();
        protected void doFilterInternal(HttpServletRequest r,HttpServletResponse s,FilterChain chain)throws ServletException,IOException {
            long minute=System.currentTimeMillis()/60000;String ip=r.getRemoteAddr();
            synchronized(buckets){buckets.entrySet().removeIf(e->e.getValue()[0]!=minute);if(buckets.size()>=10000&&!buckets.containsKey(ip)){s.setStatus(429);return;}long[] b=buckets.computeIfAbsent(ip,k->new long[]{minute,0});if(++b[1]>30){s.setStatus(429);return;}}
            if("POST".equals(r.getMethod())){
                if(!"1".equals(r.getHeader("X-HTT-Request"))||r.getContentType()==null||!r.getContentType().split(";",2)[0].trim().equalsIgnoreCase("application/json")){s.setStatus(415);return;}
                byte[] body=r.getInputStream().readNBytes(10001);if(body.length>10000){s.setStatus(413);return;}r.setAttribute("htt.dispatch.body",body);
            }
            chain.doFilter(r,s);
        }
    }
}
