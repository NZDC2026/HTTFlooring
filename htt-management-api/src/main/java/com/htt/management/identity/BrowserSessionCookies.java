package com.htt.management.identity;

import java.time.Duration;
import java.util.List;
import org.springframework.http.ResponseCookie;

/** Root cookies work across canonical and compatibility routes; retire old path-scoped copies. */
final class BrowserSessionCookies {
    private BrowserSessionCookies() { }
    static String read(jakarta.servlet.http.HttpServletRequest request,AccessSnapshot.Realm realm,boolean secure) {
        String value=null;
        if(request.getCookies()!=null)for(var cookie:request.getCookies())if(cookie.getName().equals(name(realm,secure))) {
            if(value!=null)throw new org.springframework.security.authentication.BadCredentialsException("Ambiguous refresh cookie");
            value=cookie.getValue();
        }
        return value;
    }
    static String name(AccessSnapshot.Realm realm,boolean secure) {
        return (secure?"__Host-":"")+"htt-"+(realm==AccessSnapshot.Realm.CUSTOMER?"portal":"staff")+"-refresh";
    }
    static String value(AccessSnapshot.Realm realm,boolean secure,String value,Duration duration,String path) {
        return ResponseCookie.from(name(realm,secure),value).httpOnly(true).secure(secure).sameSite("Strict")
                .path(path).maxAge(duration.isNegative()?Duration.ZERO:duration).build().toString();
    }
    static List<String> legacyPaths(AccessSnapshot.Realm realm) {
        return realm==AccessSnapshot.Realm.CUSTOMER?List.of("/api/portal/v1/auth","/api/v1/customer/auth"):List.of("/api/v1/auth","/api/v1/user/auth");
    }
    static List<String> expired(AccessSnapshot.Realm realm,boolean secure) {
        var values=new java.util.ArrayList<String>();values.add(value(realm,secure,"",Duration.ZERO,"/"));
        if(!secure)for(String path:legacyPaths(realm))values.add(value(realm,false,"",Duration.ZERO,path));
        return values;
    }
}
