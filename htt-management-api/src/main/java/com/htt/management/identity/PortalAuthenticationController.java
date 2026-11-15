package com.htt.management.identity;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** OIDC flow adapter: passwords and Keycloak action tokens never enter the Java application. */
@org.springframework.boot.autoconfigure.condition.ConditionalOnExpression("!${htt.auth.local-enabled:false}")
@RestController
@RequestMapping("/api/portal/v1/auth")
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
public class PortalAuthenticationController {
    private final CustomerAccountService accounts;
    private final String issuer,clientId;
    private final Set<String> redirects;
    public PortalAuthenticationController(CustomerAccountService accounts,AuthenticationProperties properties,
            @Value("${htt.portal.login.client-id:}") String clientId,@Value("${htt.portal.login.redirect-uris:}") String redirects) {
        this.accounts=accounts;this.issuer=properties.portal().issuer();this.clientId=clientId;
        this.redirects=redirects.isBlank()?Set.of():Set.copyOf(Arrays.asList(redirects.split(",")));
    }
    public record FlowInput(String redirectUri,String state,String codeChallenge,String nonce) { }
    public record Flow(String authorizationUrl,String provider,String operation,boolean completed) { }
    @GetMapping("/config") @PreAuthorize("permitAll()")
    public Map<String,Object> config() {
        configured();
        return Map.of("issuer",issuer,"clientId",clientId,"authorizationEndpoint",issuer+"/protocol/openid-connect/auth",
                "tokenEndpoint",issuer+"/protocol/openid-connect/token","endSessionEndpoint",issuer+"/protocol/openid-connect/logout",
                "codeChallengeMethod","S256","passwordsManagedBy","KEYCLOAK");
    }
    @PostMapping("/login") @PreAuthorize("permitAll()")
    @io.swagger.v3.oas.annotations.Operation(summary="获取 Keycloak 登录地址（不是邮箱密码校验接口）",
            description="采用授权码 + PKCE。请求中的 redirectUri、state、codeChallenge 由 OIDC 客户端生成。"
                +"邮箱（或已配置的登录名）和密码在跳转后的 Keycloak 登录页面填写，由 Keycloak 校验；本接口不接收密码、不直接返回 access token。"
                +"在 Swagger 中测试登录，请点击右上角 Authorize，选择 portal，再到 Keycloak 页面输入账号密码。"
                +"令牌取得后通过 Authorization: Bearer 调用业务 API。")
    public Flow login(@RequestBody FlowInput input) { return flow(input,"LOGIN",false); }
    @PostMapping("/forgot-password") @PreAuthorize("permitAll()")
    public Flow forgot(@RequestBody FlowInput input) {
        // Use Keycloak's recovery UI and action email. No username lookup or token issuance here.
        return flow(input,"KEYCLOAK_RECOVERY_UI",false);
    }
    @PostMapping("/reset-password") @PreAuthorize("permitAll()")
    public Flow reset(@RequestBody FlowInput input) {
        // Completion happens at Keycloak's single-use emailed action link, never at this adapter.
        return flow(input,"KEYCLOAK_ACTION_LINK_REQUIRED",false);
    }
    public record Identity(String id,String customerId,String contactId,String accountType,String loginName,String status,long version,String customerSubjectId) { }
    @GetMapping("/me") @PreAuthorize("@resourceAccess.isCustomer()")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="portal")
    public Identity me() {
        var a=accounts.me();return new Identity(a.id(),a.customerId(),a.contactId(),a.accountType(),a.loginName(),a.status(),a.version(),a.customerSubjectId());
    }
    @PostMapping("/logout") @PreAuthorize("@resourceAccess.isCustomer()")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="portal")
    public ResponseEntity<Void> logout() { accounts.logout();return ResponseEntity.noContent().build(); }
    @PostMapping("/change-password") @PreAuthorize("@resourceAccess.isCustomer()")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="portal")
    public Flow change(@RequestBody FlowInput input) {
        accounts.me();return flow(input,"UPDATE_PASSWORD",true);
    }
    @PostMapping("/change-password/complete") @PreAuthorize("@resourceAccess.isCustomer()")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name="portal")
    public ResponseEntity<Void> changeCompleted() {
        // The OIDC client calls this after successful Keycloak required-action completion.
        accounts.logout();return ResponseEntity.noContent().build();
    }
    private void configured() {
        if(clientId.isBlank()||redirects.isEmpty()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Portal OIDC client configuration required");
    }
    private Flow flow(FlowInput input,String operation,boolean changePassword) {
        configured();
        if(input==null||!redirects.contains(input.redirectUri())||input.state()==null||!input.state().matches("[A-Za-z0-9_-]{32,256}")
                ||input.codeChallenge()==null||!input.codeChallenge().matches("[A-Za-z0-9_-]{43}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid OIDC request");
        URI callback=URI.create(input.redirectUri());
        if(callback.getHost()==null||callback.getUserInfo()!=null||callback.getFragment()!=null
                ||!(callback.getScheme().equals("https")||callback.getScheme().equals("http")&&Set.of("localhost","127.0.0.1").contains(callback.getHost())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        String url=issuer+"/protocol/openid-connect/auth?client_id="+encode(clientId)+"&response_type=code&scope=openid&redirect_uri="+encode(input.redirectUri())
                +"&state="+encode(input.state())+"&code_challenge_method=S256&code_challenge="+input.codeChallenge()+"&prompt=login";
        if(input.nonce()!=null) {
            if(!input.nonce().matches("[A-Za-z0-9_-]{32,256}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            url+="&nonce="+input.nonce();
        }
        if(changePassword) url+="&kc_action=UPDATE_PASSWORD";
        return new Flow(url,"KEYCLOAK",operation,false);
    }
    private static String encode(String value) { return URLEncoder.encode(value,StandardCharsets.UTF_8); }
}
