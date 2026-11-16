package com.htt.management.identity;

import com.htt.management.identity.CustomerManagementAccess.Context;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

public class CustomerAccountStore {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final CustomerManagementAccess access;
    public CustomerAccountStore(JdbcTemplate jdbc,ObjectMapper json,CustomerManagementAccess access) { this.jdbc=jdbc;this.json=json;this.access=access; }
    public record Target(UUID customer,UUID contact) { }
    public record Account(UUID internalId,String id,UUID customer,UUID actor,String accountType,String issuer,String subject,
            String loginName,String status,String syncStatus,long version,String hash) { }
    public record PortalAccount(String id,String customerId,String contactId,String accountType,String loginName,String status,long version,String subject,String customerSubjectId) { }
    public void context(Context c) { context(c.actorId(),c.companyId()); }
    public void context(UUID actor,UUID company) {
        if(!TransactionSynchronizationManager.isActualTransactionActive()) throw new IllegalStateException("Transaction required");
        jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,company.toString());
        jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,actor.toString());
    }
    public Target target(Context context,String customer,String contact) {
        UUID id=jdbc.query("select id from crm.customer where company_id=? and business_id=?",(r,n)->r.getObject(1,UUID.class),context.companyId(),customer)
                .stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        access.requireCustomer(context,id,"customer:account:scope");
        UUID person=contact==null?null:jdbc.query("select id from crm.customer_contact where company_id=? and customer_id=? and business_id=?",
                (r,n)->r.getObject(1,UUID.class),context.companyId(),id,contact).stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new Target(id,person);
    }
    public Account byKey(UUID company,UUID operation) { return accounts("company_id=? and creation_key=?",company,operation).stream().findFirst().orElse(null); }
    public Account read(UUID company,String id) { return accounts("company_id=? and business_id=?",company,id).stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    public List<Account> list(UUID company,UUID customer) { return accounts("company_id=? and customer_id=?",company,customer); }
    private List<Account> accounts(String condition,Object...params) {
        return jdbc.query("select * from identity.customer_account where "+condition+" order by created_at,id",(r,n)->new Account(r.getObject("id",UUID.class),
                r.getString("business_id"),r.getObject("customer_id",UUID.class),r.getObject("actor_id",UUID.class),r.getString("account_type"),r.getString("issuer"),
                r.getString("subject"),r.getString("login_name"),r.getString("status"),r.getString("sync_status"),r.getLong("version"),r.getString("request_hash")),params);
    }
    public Account create(Context context,Target target,String kind,String issuer,String subject,String login,List<String> permissions,List<UUID> branches,UUID key,String hash) {
        UUID account=jdbc.query(connection->{
            var s=connection.prepareStatement("select identity.create_customer_account(?,?,?,?,?,?,?,?,?,?,?,?)");
            s.setObject(1,context.actorId());s.setObject(2,context.companyId());s.setObject(3,target.customer());s.setObject(4,target.contact());
            s.setString(5,kind);s.setString(6,issuer);s.setString(7,subject);s.setString(8,login);
            s.setArray(9,connection.createArrayOf("text",permissions.toArray()));s.setArray(10,connection.createArrayOf("uuid",branches.toArray()));
            s.setObject(11,key);s.setString(12,hash);return s;
        },r->{r.next();return r.getObject(1,UUID.class);});
        return accounts("company_id=? and id=?",context.companyId(),account).getFirst();
    }
    public void status(Context context,Account account,long expected,String status) {
        jdbc.queryForObject("select identity.set_customer_account_status(?,?,?,?,?)",Object.class,context.actorId(),context.companyId(),account.internalId(),expected,status);
    }
    public void confirm(Context context,Account account,long expected) {
        jdbc.queryForObject("select identity.confirm_customer_account_status(?,?,?,?)",Object.class,context.actorId(),context.companyId(),account.internalId(),expected);
    }
    public PortalAccount current(UUID actor) {
        String value=jdbc.queryForObject("select identity.current_customer_account(?)::text",String.class,actor);
        return value==null?null:json.readValue(value,PortalAccount.class);
    }
    public void revoke(UUID actor) { jdbc.queryForObject("select identity.revoke_customer_portal_tokens(?)",Object.class,actor); }
}
