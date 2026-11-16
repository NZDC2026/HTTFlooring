package com.htt.management.identity;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

/** Local credentials are created atomically; legacy external operations remain outside database transactions. */
public class CustomerAccountService {
    private final CustomerManagementAccess access;
    private final CustomerAccountStore store;
    private final KeycloakAccounts keycloak;
    private final LocalAuthentication local;
    private final TransactionTemplate transactions;
    public CustomerAccountService(CustomerManagementAccess access,CustomerAccountStore store,KeycloakAccounts keycloak,LocalAuthentication local,PlatformTransactionManager manager) {
        this.access=access;this.store=store;this.keycloak=keycloak;this.local=local;this.transactions=new TransactionTemplate(manager);this.transactions.setTimeout(10);
    }
    public record Create(String accountType,String contactId,String loginName,String email,String subject,List<String> permissions,List<UUID> branchIds,@com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY) String password) {
        @Override public String toString() {return "Create[redacted]";}
    }
    public record View(String id,String accountType,String loginName,String status,String syncStatus,long version,boolean passwordManagedByKeycloak) {
    }
    private record Prepared(CustomerManagementAccess.Context context,CustomerAccountStore.Target target,CustomerAccountStore.Account prior) { }
    public View create(String customer,UUID operation,Create request) {
        if(operation==null||request==null||request.loginName()==null) throw bad();
        String login=local==null?request.loginName().strip().toLowerCase(Locale.ROOT):LocalAuthentication.normalize(request.loginName());
        if(login.isEmpty()||login.length()>320||login.chars().anyMatch(Character::isWhitespace)) throw bad();
        if(!Set.of("CUSTOMER","CONTACT").contains(request.accountType()==null?"":request.accountType())
                || request.accountType().equals("CUSTOMER")&&request.contactId()!=null
                || request.accountType().equals("CONTACT")&&(request.contactId()==null||request.contactId().isBlank())) throw bad();
        if(request.email()!=null&&(!request.email().matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||request.email().length()>320)) throw bad();
        if(request.permissions()!=null&&request.permissions().stream().anyMatch(java.util.Objects::isNull)
                ||request.branchIds()!=null&&request.branchIds().stream().anyMatch(java.util.Objects::isNull)) throw bad();
        List<String> permissions=request.permissions()==null?List.of():request.permissions().stream().distinct().sorted().toList();
        Set<String> allowed=Set.of("customer:read","branch:read","notification:read","notification:device","customer:account:manage","pricing:read-own");
        if(permissions.size()>allowed.size()||!allowed.containsAll(permissions)
                || request.accountType().equals("CONTACT")&&permissions.contains("customer:account:manage")) throw bad();
        List<UUID> branches=request.branchIds()==null?List.of():request.branchIds().stream().distinct().sorted().toList();
        if(branches.size()>200) throw bad();
        String hash=hash(customer,request.accountType(),request.contactId(),login,request.email(),request.subject(),permissions,branches);
        Prepared prepared=transactions.execute(status->{
            var c=access.require("customer:account:create");store.context(c);
            var target=store.target(c,customer,request.contactId());
            var prior=store.byKey(c.companyId(),operation);
            if(prior!=null&&(!prior.hash().equals(hash)||!prior.customer().equals(target.customer()))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Idempotency conflict");
            return new Prepared(c,target,prior);
        });
        if(prepared.prior()!=null) return view(prepared.prior());
        if(local!=null) {
            if(request.subject()!=null) throw bad();
            String encoded=local.encodeNewPassword(request.password());
            return transactions.execute(status->{
                var c=access.require("customer:account:create");store.context(c);var target=store.target(c,customer,request.contactId());
                var a=store.create(c,target,request.accountType(),"https://identity.htt.invalid/local",UUID.randomUUID().toString(),login,permissions,branches,operation,hash);
                local.createCustomerCredential(c.actorId(),c.companyId(),a.actor(),encoded);return view(a);
            });
        }
        // A repeat operation may recover a previously created but unbound Keycloak user via its ownership attribute.
        var identity=keycloak.ensure(login,request.email(),request.subject(),operation);
        return transactions.execute(status->{
            var c=access.require("customer:account:create");store.context(c);
            var target=store.target(c,customer,request.contactId());
            return view(store.create(c,target,request.accountType(),keycloak.issuer(),identity.subject(),login,permissions,branches,operation,hash));
        });
    }
    public List<View> list(String customer) {
        return transactions.execute(status->{var c=access.require("customer:read");store.context(c);var target=store.target(c,customer,null);
            return store.list(c.companyId(),target.customer()).stream().map(this::view).toList();});
    }
    public View status(String customer,String account,long expected,String next) {
        if(expected<1||!Set.of("ACTIVE","DISABLED").contains(next==null?"":next)) throw bad();
        Prepared prepared=transactions.execute(status->{
            var c=access.require("customer:account:status");store.context(c);var target=store.target(c,customer,null);var a=store.read(c.companyId(),account);
            if(!a.customer().equals(target.customer())) throw new AccessDeniedException("Access is denied.");
            if(a.version()!=expected) throw new ResponseStatusException(HttpStatus.CONFLICT,"Account version conflict");
            store.status(c,a,expected,next);return new Prepared(c,target,store.read(c.companyId(),account));
        });
        if(keycloak!=null) keycloak.enabled(prepared.prior().subject(),next.equals("ACTIVE"));
        return transactions.execute(status->{
            var c=access.require("customer:account:status");store.context(c);var a=store.read(c.companyId(),account);
            if(a.version()!=prepared.prior().version()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Account operation superseded");
            store.confirm(c,a,a.version());return view(store.read(c.companyId(),account));
        });
    }
    public void reset(String customer,String account) {
        String subject=transactions.execute(status->{
            var c=access.require("customer:account:reset");store.context(c);var target=store.target(c,customer,null);var a=store.read(c.companyId(),account);
            if(!a.customer().equals(target.customer())||!a.status().equals("ACTIVE")) throw new AccessDeniedException("Access is denied.");
            return a.subject();
        });
        if(keycloak==null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Password recovery delivery is not configured");
        keycloak.reset(subject);
    }
    public CustomerAccountStore.PortalAccount me() {
        var user=portalUser();
        return transactions.execute(status->{
            var account=store.current(user.access().actorId());
            if(account==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Managed portal account not found");
            return account;
        });
    }
    public void logout() {
        var user=portalUser();var account=me();
        UUID company=user.access().companies().stream().flatMap(c->c.grants().stream().map(g->c.companyId())).findFirst().orElseThrow(()->new AccessDeniedException("Access is denied."));
        transactions.executeWithoutResult(status->{store.context(user.access().actorId(),company);store.revoke(user.access().actorId());});
        if(keycloak!=null) keycloak.logout(account.subject());
    }
    private View view(CustomerAccountStore.Account a) {return new View(a.id(),a.accountType(),a.loginName(),a.status(),a.syncStatus(),a.version(),local==null);}
    private static VerifiedUser portalUser() {
        var user=ResourceAccess.currentUser();
        if(user==null||user.realm()!=AccessSnapshot.Realm.CUSTOMER) throw new AccessDeniedException("Access is denied.");
        return user;
    }
    private static ResponseStatusException bad() { return new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid account input"); }
    private static String hash(Object...values) {
        try {
            var digest=MessageDigest.getInstance("SHA-256");
            for(Object value:values) { byte[] bytes=String.valueOf(value).getBytes(StandardCharsets.UTF_8);
                digest.update(java.nio.ByteBuffer.allocate(4).putInt(bytes.length).array());digest.update(bytes); }
            return HexFormat.of().formatHex(digest.digest());
        } catch(java.security.NoSuchAlgorithmException failure) { throw new IllegalStateException(failure); }
    }
}
