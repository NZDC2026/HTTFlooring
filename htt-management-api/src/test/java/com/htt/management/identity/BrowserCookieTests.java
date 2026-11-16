package com.htt.management.identity;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class BrowserCookieTests {
    @Test void developmentLoginUsesRootCookieAndClearsLegacyScopedCookies() {
        var auth=mock(LocalAuthentication.class);var environment=new MockEnvironment();environment.setActiveProfiles("development");
        var result=new LocalAuthentication.BrowserSession(new LocalAuthentication.LoginResult("access","Bearer",900),"refresh-secret",java.time.Instant.now().plusSeconds(604800));
        when(auth.browserLogin(anyString(),anyString(),eq(AccessSnapshot.Realm.CUSTOMER),anyString())).thenReturn(result);
        var controller=new AuthenticationController(auth,mock(AccessAudit.class),false,environment);
        var request=new MockHttpServletRequest("POST","/api/v1/customer/auth/browser-login");var response=new MockHttpServletResponse();
        controller.persistentLogin(new AuthenticationController.Login("test@example.invalid","password"),request,response);
        var cookies=response.getHeaders("Set-Cookie");assertThat(cookies).hasSize(3);
        assertThat(cookies.get(0)).contains("Path=/api/portal/v1/auth","Max-Age=0");
        assertThat(cookies.get(1)).contains("Path=/api/v1/customer/auth","Max-Age=0");
        assertThat(cookies.get(2)).contains("htt-portal-refresh=refresh-secret","Path=/;","HttpOnly","SameSite=Strict").doesNotContain("Domain=");
    }
    @Test void productionCookiesUseHostPrefixRootPathAndSecure() {
        var controller=new AuthenticationController(mock(LocalAuthentication.class),mock(AccessAudit.class),true,new MockEnvironment());
        var request=new MockHttpServletRequest("POST","/api/v1/auth/browser-logout");
        var response=new MockHttpServletResponse();
        controller.legacyCookieLogout(request,response);
        assertThat(response.getHeader("Set-Cookie")).contains("__Host-htt-staff-refresh=","Path=/;","Secure","HttpOnly","SameSite=Strict","Max-Age=0").doesNotContain("Domain=");
    }
    @Test void insecureCookieConfigurationIsRejectedOutsideDevelopmentAndTest() {
        assertThatThrownBy(()->new AuthenticationController(mock(LocalAuthentication.class),mock(AccessAudit.class),false,new MockEnvironment()))
                .isInstanceOf(IllegalStateException.class);
    }
}
