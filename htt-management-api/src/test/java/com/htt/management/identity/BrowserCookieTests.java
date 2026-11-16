package com.htt.management.identity;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class BrowserCookieTests {
    @Test void productionCookiesUseHostPrefixRootPathAndSecure() {
        var controller=new BrowserAuthenticationController(mock(LocalAuthentication.class),mock(AccessAudit.class),true,new MockEnvironment());
        var request=new MockHttpServletRequest("POST","/api/v1/auth/browser-logout");
        var response=new MockHttpServletResponse();
        controller.logout(request,response);
        assertThat(response.getHeader("Set-Cookie")).contains("__Host-htt-staff-refresh=","Path=/;","Secure","HttpOnly","SameSite=Strict","Max-Age=0").doesNotContain("Domain=");
    }
    @Test void insecureCookieConfigurationIsRejectedOutsideDevelopmentAndTest() {
        assertThatThrownBy(()->new BrowserAuthenticationController(mock(LocalAuthentication.class),mock(AccessAudit.class),false,new MockEnvironment()))
                .isInstanceOf(IllegalStateException.class);
    }
}
