package com.htt.management.crm.infrastructure;

import com.htt.management.crm.domain.Customer;
import com.htt.management.crm.domain.CustomerRules.*;
import com.htt.management.identity.CustomerManagementAccess.Context;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

/** Customer aggregate persistence. All methods run inside the authorized use-case transaction. */
public class CustomerRepository {
    private final JdbcTemplate jdbc;
    public CustomerRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<com.htt.management.crm.domain.CustomerSubject> subjects(UUID company,UUID customer) {
        return jdbc.query("""
            select s.business_id,s.subject_type,parent.business_id as parent_id,
                case when s.subject_type='COMPANY' then c.business_name else contact.name end as display_name,
                case when s.subject_type='COMPANY' then c.email else contact.email end as email
            from crm.customer_subject s
            left join crm.customer_subject parent on parent.company_id=s.company_id and parent.id=s.parent_customer_id
            left join crm.customer c on c.company_id=s.company_id and c.id=s.id and s.subject_type='COMPANY'
            left join crm.customer_contact contact on contact.company_id=s.company_id and contact.id=s.id and s.subject_type='CONTACT'
            where s.company_id=? and s.root_customer_id=?
            order by case when s.subject_type='COMPANY' then 0 else 1 end,s.business_id
            """,(r,n)->new com.htt.management.crm.domain.CustomerSubject(r.getString("business_id"),
                com.htt.management.crm.domain.CustomerSubject.Type.valueOf(r.getString("subject_type")),r.getString("parent_id"),
                r.getString("display_name"),r.getString("email")),company,customer);
    }
    public void context(Context context) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) throw new IllegalStateException("Transaction required");
        jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,context.companyId().toString());
        jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,context.actorId().toString());
    }
    public record Workspace(String region, String currency) { }
    public Workspace workspace(UUID company) {
        return jdbc.query("select region,currency from crm.customer_workspace where company_id=?",
                (r,n)->new Workspace(r.getString(1),r.getString(2)),company).stream().findFirst()
                .orElseThrow(()->new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Customer workspace configuration required"));
    }
    public String nextCode(UUID company) {
        // One counter per company. Row lock also serializes legacy-code collision checks.
        for (int attempt=0;attempt<1000;attempt++) {
            String code=jdbc.queryForObject("update crm.customer_workspace set next_number=next_number+1 where company_id=? "
                    +"returning region||'-CUST-'||lpad((next_number-1)::text,greatest(4,length((next_number-1)::text)),'0')",String.class,company);
            if (code==null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
            if (Boolean.FALSE.equals(jdbc.queryForObject("select exists(select 1 from crm.customer where company_id=? and code=?)",Boolean.class,company,code))) return code;
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Customer numbering requires maintenance");
    }
    public UUID internalId(UUID company, String id, boolean lock) {
        return jdbc.query("select id from crm.customer where company_id=? and business_id=?"+(lock?" for update":""),
                (r,n)->r.getObject(1,UUID.class),company,id).stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    public void create(UUID company, UUID id, String businessId, String code, Profile p) {
        jdbc.update("insert into crm.customer(id,company_id,business_id,code,business_name) values(?,?,?,?,?)",id,company,businessId,code,p.businessName());
        write(company,id,p);
    }
    public void update(UUID company, UUID id, long expected, Profile p) {
        if (jdbc.update("update crm.customer set version=version+1,updated_at=clock_timestamp() where company_id=? and id=? and version=?",company,id,expected)!=1)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Customer version conflict");
        write(company,id,p);
    }
    private void write(UUID company, UUID id, Profile p) {
        jdbc.update("""
            update crm.customer set business_name=?,trading_name=?,abn=?,business_type=?,business_status=?,email=?,phone=?,website=?,
            pricing_tier=?,credit_hold=?,credit_limit=?,currency=?,payment_terms_type=?,payment_terms_days=?,internal_notes=?
            where company_id=? and id=?
            """,p.businessName(),p.tradingName(),p.abn(),p.businessType(),p.status().name(),p.email(),p.phone(),p.website(),
                p.pricingTier().name(),p.creditHold(),p.creditLimit(),p.currency(),p.paymentTerms().type().name(),p.paymentTerms().days(),p.internalNotes(),company,id);
        if (p.billingAddress()==null) jdbc.update("delete from crm.customer_billing_address where company_id=? and customer_id=?",company,id);
        else {
            Address a=p.billingAddress();
            jdbc.update("""
                insert into crm.customer_billing_address(company_id,customer_id,address_line1,address_line2,suburb,state,postcode,country)
                values(?,?,?,?,?,?,?,?) on conflict(customer_id) do update set address_line1=excluded.address_line1,
                address_line2=excluded.address_line2,suburb=excluded.suburb,state=excluded.state,postcode=excluded.postcode,country=excluded.country
                """,company,id,a.addressLine1(),a.addressLine2(),a.suburb(),a.state(),a.postcode(),a.country());
        }
        jdbc.update("update crm.customer_location set is_primary=false where company_id=? and customer_id=?",company,id);
        for (Location location:p.locations()) {
            Address a=location.address();
            // A globally colliding identifier can never reparent or overwrite another customer's row.
            int changed=jdbc.update("""
                insert into crm.customer_location(id,business_id,company_id,customer_id,name,address_line1,address_line2,suburb,state,postcode,country,phone,is_primary)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict(business_id) do update set name=excluded.name,address_line1=excluded.address_line1,
                address_line2=excluded.address_line2,suburb=excluded.suburb,state=excluded.state,postcode=excluded.postcode,country=excluded.country,
                phone=excluded.phone,is_primary=excluded.is_primary,updated_at=clock_timestamp()
                where customer_location.company_id=excluded.company_id and customer_location.customer_id=excluded.customer_id
                """,UUID.randomUUID(),location.id(),company,id,location.name(),a.addressLine1(),a.addressLine2(),a.suburb(),a.state(),a.postcode(),a.country(),location.phone(),location.isPrimary());
            if(changed!=1) throw new ResponseStatusException(HttpStatus.CONFLICT,"Address identifier unavailable");
        }
        jdbc.update("update crm.customer_contact set is_primary=false,is_accounting=false where company_id=? and customer_id=?",company,id);
        for(Contact c:p.contacts()) {
            UUID location=c.locationId()==null?null:jdbc.queryForObject("select id from crm.customer_location where company_id=? and customer_id=? and business_id=?",UUID.class,company,id,c.locationId());
            int changed=jdbc.update("""
                insert into crm.customer_contact(id,business_id,company_id,customer_id,name,first_name,last_name,job_title,email,phone,mobile,location_id,is_primary,is_accounting)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,?) on conflict(business_id) do update set name=excluded.name,first_name=excluded.first_name,
                last_name=excluded.last_name,job_title=excluded.job_title,email=excluded.email,phone=excluded.phone,mobile=excluded.mobile,
                location_id=excluded.location_id,is_primary=excluded.is_primary,is_accounting=excluded.is_accounting,
                version=customer_contact.version+1,updated_at=clock_timestamp()
                where customer_contact.company_id=excluded.company_id and customer_contact.customer_id=excluded.customer_id
                """,UUID.randomUUID(),c.id(),company,id,c.firstName()+(c.lastName()==null?"":" "+c.lastName()),c.firstName(),c.lastName(),
                c.jobTitle(),c.email(),c.phone(),c.mobile(),location,c.isPrimary(),c.isAccounting());
            if(changed!=1) throw new ResponseStatusException(HttpStatus.CONFLICT,"Contact identifier unavailable");
        }
    }
    public Customer read(UUID company, UUID id) {
        var billing=jdbc.query("select * from crm.customer_billing_address where company_id=? and customer_id=?",(r,n)->address(r),company,id);
        List<Location> locations=jdbc.query("select * from crm.customer_location where company_id=? and customer_id=? order by created_at,id",
                (r,n)->new Location(r.getString("business_id"),r.getString("name"),address(r),r.getString("phone"),r.getBoolean("is_primary")),company,id);
        List<Contact> contacts=jdbc.query("""
                select c.*,l.business_id as location_business_id from crm.customer_contact c left join crm.customer_location l on
                l.company_id=c.company_id and l.customer_id=c.customer_id and l.id=c.location_id
                where c.company_id=? and c.customer_id=? order by c.created_at,c.id
                """,(r,n)->new Contact(r.getString("business_id"),r.getString("first_name")==null?r.getString("name"):r.getString("first_name"),
                r.getString("last_name"),r.getString("job_title"),r.getString("email"),r.getString("phone"),r.getString("mobile"),
                r.getString("location_business_id"),r.getBoolean("is_primary"),r.getBoolean("is_accounting")),company,id);
        return jdbc.query("select c.*,coalesce(c.currency,w.currency) resolved_currency from crm.customer c left join crm.customer_workspace w on w.company_id=c.company_id where c.company_id=? and c.id=?",
                (r,n)->new Customer(id,company,r.getString("business_id"),r.getString("code"),r.getLong("version"),
                    r.getTimestamp("created_at").toInstant(),r.getTimestamp("updated_at").toInstant(),
                    new Profile(r.getString("business_name"),r.getString("trading_name"),r.getString("abn"),r.getString("business_type"),
                        Status.valueOf(r.getString("business_status")),r.getString("email"),r.getString("phone"),r.getString("website"),
                        PricingTier.valueOf(r.getString("pricing_tier")),r.getBoolean("credit_hold"),r.getBigDecimal("credit_limit"),r.getString("resolved_currency"),
                        new PaymentTerms(PaymentTermsType.valueOf(r.getString("payment_terms_type")),r.getInt("payment_terms_days")),
                        r.getString("internal_notes"),billing.isEmpty()?null:billing.getFirst(),locations,contacts)),company,id).stream().findFirst()
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    public List<UUID> list(Context context, int offset, int limit, String search) {
        return jdbc.query(connection->{
            var statement=connection.prepareStatement("select id from crm.customer where company_id=? and (? or id=any(?)) "
                    +"and (position(lower(?) in lower(business_name))>0 or position(lower(?) in lower(code))>0) order by code,id limit ? offset ?");
            statement.setObject(1,context.companyId());statement.setBoolean(2,context.companyWide());
            statement.setArray(3,connection.createArrayOf("uuid",context.customers().toArray()));
            statement.setString(4,search);statement.setString(5,search);statement.setInt(6,limit);statement.setInt(7,offset);return statement;
        },(r,n)->r.getObject(1,UUID.class));
    }
    public void audit(Context context, UUID customer, String action, long version) {
        jdbc.update("insert into platform.customer_change_audit(company_id,customer_id,actor_id,action,version) values(?,?,?,?,?)",
                context.companyId(),customer,context.actorId(),action,version);
    }
    private static Address address(ResultSet r) throws SQLException { return new Address(r.getString("address_line1"),
            r.getString("address_line2"),r.getString("suburb"),r.getString("state"),r.getString("postcode"),r.getString("country")); }
}
