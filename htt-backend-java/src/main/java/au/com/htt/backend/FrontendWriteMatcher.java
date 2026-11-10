package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.util.matcher.RequestMatcher;
/** Only explicit new bearer-authenticated API commands; legacy/session CSRF policy is unchanged. */
final class FrontendWriteMatcher implements RequestMatcher {
    public boolean matches(HttpServletRequest request) {
        String auth=request.getHeader("Authorization");
        return "POST".equals(request.getMethod())&&auth!=null&&auth.startsWith("Bearer ")
            && (request.getRequestURI().matches("/api/v1/products/[0-9a-fA-F-]{36}/costing-policy")
                || request.getRequestURI().matches("/api/v1/documents/[0-9a-fA-F-]{36}/dispatch-schedule"));
    }
}
