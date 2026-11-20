package com.htt.management.identity;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class CompanyServiceTests {
    @AfterEach void clear() {SecurityContextHolder.clearContext();RequestContextHolder.resetRequestAttributes();}
    @Test void companyScopedPermissionAndRoleNamesCannotGrantPlatformCreation() {
        var member=new AccessSnapshot.CompanyAccess(UUID.randomUUID(),"Test",UUID.randomUUID(),AccessSnapshot.MemberKind.MANAGEMENT,
                Set.of("SUPER_ADMIN"),Set.of("company:create"),List.of());
        var user=new VerifiedUser(new AccessSnapshot(UUID.randomUUID(),"Test",Instant.EPOCH,List.of(member)),AccessSnapshot.Realm.STAFF);
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(user,null,List.of()));
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));
        var jdbc=mock(JdbcTemplate.class);var service=new CompanyService(jdbc,new ObjectMapper(),mock(AccessAudit.class));
        assertThatThrownBy(()->service.create(UUID.randomUUID(),new CompanyService.Create("TEST","Test","Sydney"))).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc);
    }
    @Test void customerRealmCannotUseAnAccidentallyReturnedGlobalGrant() {
        var user=new VerifiedUser(new AccessSnapshot(UUID.randomUUID(),"Test",Instant.EPOCH,List.of(),Set.of("company:create")),AccessSnapshot.Realm.CUSTOMER);
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(user,null,List.of()));
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));
        var jdbc=mock(JdbcTemplate.class);var service=new CompanyService(jdbc,new ObjectMapper(),mock(AccessAudit.class));
        assertThatThrownBy(()->service.create(UUID.randomUUID(),new CompanyService.Create("TEST","Test","Sydney"))).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(jdbc);
    }
    @Test void requestHashSeparatesFieldBoundaries() {
        assertThat(CompanyService.hash(new CompanyService.Create("TEST","A:B","C")))
                .isNotEqualTo(CompanyService.hash(new CompanyService.Create("TEST","A","B:C")));
    }
}
