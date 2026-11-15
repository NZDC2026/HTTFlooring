package com.htt.management.identity;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class LocalAuthenticationTests {
    @Test void loginNamesAreNormalizedWithoutMergingBusinessProfiles() {
        assertThat(LocalAuthentication.normalize("  Staff@HTT-DEMO.invalid ")).isEqualTo("staff@htt-demo.invalid");
        assertThatThrownBy(()->LocalAuthentication.normalize("a b@demo.invalid")).isInstanceOf(ResponseStatusException.class);
    }
    @Test void passwordsRejectBcryptTruncationAndShortNewSecrets() {
        LocalAuthentication.validateNewPassword("Long enough test secret");
        assertThatThrownBy(()->LocalAuthentication.validateNewPassword("short")).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->LocalAuthentication.validateNewPassword("x".repeat(73))).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->LocalAuthentication.validateNewPassword("\u4e2d".repeat(25))).isInstanceOf(ResponseStatusException.class);
    }
    @Test void requestRecordsDoNotExposePasswordsThroughToString() {
        assertThat(new LocalAuthenticationController.Login("email","secret").toString()).doesNotContain("secret","email");
        assertThat(new LocalAuthenticationController.PasswordChange("old-secret","new-secret").toString()).doesNotContain("secret");
    }
}
