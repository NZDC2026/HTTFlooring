package au.com.htt.backend;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PortalSalesDocumentsTest {
    @Test void forwardsVerifiedIdentityAndExplicitScopeToReadOnlyDatabase() {
        var db=mock(PortalDatabase.class);
        when(db.read(anyString(),anyMap())).thenReturn("{\"items\":[]}");
        var controller=new PortalController(db);
        UUID company=UUID.randomUUID(),grant=UUID.randomUUID(),branch=UUID.randomUUID(),invoice=UUID.randomUUID();
        var request=new MockHttpServletRequest("GET","/api/portal/v1/invoices/"+invoice);
        request.addHeader("X-Company-Id",company.toString());request.addHeader("X-Portal-Grant-Id",grant.toString());
        var token=Jwt.withTokenValue("synthetic").header("alg","RS256").claim("iss","https://issuer.example.invalid").subject("synthetic-customer").build();
        assertEquals(200,controller.document(token,request,branch,invoice).getStatusCode().value());
        verify(db).read(contains("portal.sales_documents"),argThat(args->company.equals(args.get("company"))&&grant.equals(args.get("grant"))&&branch.equals(args.get("branch"))&&invoice.equals(args.get("id"))&&"INVOICE".equals(args.get("kind"))&&"synthetic-customer".equals(args.get("sub"))));
    }
    @Test void missingContextNeverReachesDatabase() {
        var db=mock(PortalDatabase.class);var controller=new PortalController(db);
        var token=Jwt.withTokenValue("synthetic").header("alg","RS256").claim("iss","https://issuer.example.invalid").subject("customer").build();
        assertThrows(RuntimeException.class,()->controller.documents(token,new MockHttpServletRequest("GET","/api/portal/v1/invoices"),UUID.randomUUID(),1,25));
        verifyNoInteractions(db);
    }
}
