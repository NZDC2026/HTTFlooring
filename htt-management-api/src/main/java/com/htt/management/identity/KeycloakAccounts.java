package com.htt.management.identity;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Fixed trusted realm only. No remote request may run in a database transaction. */
public class KeycloakAccounts {
    private final String issuer,admin,clientId,clientSecret;
    private final HttpClient http;
    private final ObjectMapper json;
    public record User(String subject,String loginName,boolean enabled) { }
    public KeycloakAccounts(String issuer,String clientId,String clientSecret,ObjectMapper json) {
        this(issuer,clientId,clientSecret,json,HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build());
    }
    public KeycloakAccounts(String issuer,String clientId,String clientSecret,ObjectMapper json,HttpClient http) {
        URI uri=URI.create(issuer);
        if(!"https".equals(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||uri.getQuery()!=null||uri.getFragment()!=null
                || !uri.getPath().matches("/realms/[A-Za-z0-9_-]+")) throw new IllegalArgumentException("Fixed HTTPS Keycloak issuer required");
        this.issuer=issuer;this.admin=issuer.replace("/realms/","/admin/realms/");
        this.clientId=clientId;this.clientSecret=clientSecret;this.json=json;this.http=http;
    }
    public String issuer() { return issuer; }
    public User ensure(String login,String email,String suppliedSubject,UUID operation) {
        String token=token();
        if(suppliedSubject!=null) {
            String subject=UUID.fromString(suppliedSubject).toString();
            var found=call("GET",admin+"/users/"+subject,null,token);
            if(!login.equals(found.path("username").asString())||!found.path("enabled").asBoolean()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Identity does not match account");
            return new User(subject,login,true);
        }
        var found=call("GET",admin+"/users?username="+encode(login)+"&exact=true",null,token);
        if(found.isEmpty()) {
            var user=new java.util.LinkedHashMap<String,Object>();
            user.put("username",login);user.put("enabled",true);user.put("requiredActions",List.of("UPDATE_PASSWORD"));
            user.put("attributes",Map.of("htt.account.key",List.of(operation.toString())));
            if(email!=null&&!email.isBlank()) { user.put("email",email);user.put("emailVerified",false); }
            try { call("POST",admin+"/users",user,token); }
            catch(ResponseStatusException failure) { if(failure.getStatusCode().value()!=409) throw failure; }
            found=call("GET",admin+"/users?username="+encode(login)+"&exact=true",null,token);
        }
        if(found.size()!=1||!found.get(0).path("attributes").path("htt.account.key").path(0).asString().equals(operation.toString()))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Existing identity cannot be adopted");
        var user=found.get(0);
        if(!user.path("enabled").asBoolean()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Identity is disabled");
        return new User(UUID.fromString(user.path("id").asString()).toString(),login,true);
    }
    public void enabled(String subject,boolean enabled) {
        String token=token(),path=admin+"/users/"+UUID.fromString(subject);
        var user=call("GET",path,null,token);
        var body=(tools.jackson.databind.node.ObjectNode)user.deepCopy();body.put("enabled",enabled);
        call("PUT",path,body,token);
        if(!enabled) call("POST",path+"/logout",null,token);
    }
    public void logout(String subject) { call("POST",admin+"/users/"+UUID.fromString(subject)+"/logout",null,token()); }
    public void reset(String subject) {
        String token=token(),path=admin+"/users/"+UUID.fromString(subject);
        var user=(tools.jackson.databind.node.ObjectNode)call("GET",path,null,token).deepCopy();
        var actions=json.createArrayNode();
        if(user.path("requiredActions").isArray()) for(var action:user.path("requiredActions"))
            if(!action.asString().equals("UPDATE_PASSWORD")) actions.add(action.asString());
        actions.add("UPDATE_PASSWORD");user.set("requiredActions",actions);
        call("PUT",path,user,token);
        call("POST",path+"/logout",null,token);
        call("PUT",path+"/execute-actions-email?lifespan=900",List.of("UPDATE_PASSWORD"),token);
    }
    public boolean active(String accessToken) {
        if(clientId==null||clientId.isBlank()||clientSecret==null||clientSecret.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Keycloak introspection is not configured");
        return send(HttpRequest.newBuilder(URI.create(issuer+"/protocol/openid-connect/token/introspect"))
                .header("Content-Type","application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("client_id="+encode(clientId)+"&client_secret="+encode(clientSecret)+"&token="+encode(accessToken))))
                .path("active").asBoolean();
    }
    private String token() {
        if(clientId==null||clientId.isBlank()||clientSecret==null||clientSecret.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Keycloak account service is not configured");
        return send(HttpRequest.newBuilder(URI.create(issuer+"/protocol/openid-connect/token"))
                .header("Content-Type","application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials&client_id="+encode(clientId)+"&client_secret="+encode(clientSecret)))).path("access_token").asString();
    }
    private JsonNode call(String method,String uri,Object body,String token) {
        return send(HttpRequest.newBuilder(URI.create(uri)).header("Authorization","Bearer "+token).header("Content-Type","application/json")
                .method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))));
    }
    private JsonNode send(HttpRequest.Builder request) {
        if(TransactionSynchronizationManager.isActualTransactionActive()) throw new IllegalStateException("Keycloak HTTP inside transaction is prohibited");
        try {
            var reply=http.send(request.timeout(Duration.ofSeconds(10)).build(),HttpResponse.BodyHandlers.ofString());
            if(reply.statusCode()==409) throw new ResponseStatusException(HttpStatus.CONFLICT,"Identity conflict");
            if(reply.statusCode()<200||reply.statusCode()>=300) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Identity operation unavailable");
            if(reply.body().length()>1_000_000) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
            return reply.body().isBlank()?json.createObjectNode():json.readTree(reply.body());
        } catch(InterruptedException failure) {
            Thread.currentThread().interrupt();throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Identity operation interrupted");
        } catch(java.io.IOException failure) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Identity service unavailable"); }
    }
    private static String encode(String value) { return URLEncoder.encode(value,StandardCharsets.UTF_8); }
}
