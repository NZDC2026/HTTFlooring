package com.htt.management.pricing;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

/** Owns discount rows; CRM and catalog are read only for identity and ownership checks. */
class ProductDiscountStore {
    private final JdbcTemplate jdbc;
    ProductDiscountStore(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    record Subject(UUID id,UUID customer) { }
    record Rule(BigDecimal percent,long version) { }
    record Effective(UUID productId,String discountPercent,String source) { }

    void context(UUID company,UUID actor) {
        jdbc.queryForObject("select set_config('htt.company_id',?,true)",String.class,company.toString());
        jdbc.queryForObject("select set_config('htt.actor_id',?,true)",String.class,actor.toString());
    }
    Subject subject(UUID company,String id) {
        return jdbc.query("select id,root_customer_id from crm.customer_subject where company_id=? and business_id=?",
                (r,n)->new Subject(r.getObject(1,UUID.class),r.getObject(2,UUID.class)),company,id).stream().findFirst()
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    void product(UUID company,UUID product) {
        if(!Boolean.TRUE.equals(jdbc.queryForObject("select exists(select 1 from catalog.product where company_id=? and id=? and status='ACTIVE')",
                Boolean.class,company,product))) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    Rule rule(UUID company,UUID subject,UUID product,boolean lock) {
        return jdbc.query("select discount_percent,version from pricing.product_discount where company_id=? and subject_id=? and product_id=? and enabled"+(lock?" for update":""),
                (r,n)->new Rule(r.getBigDecimal(1),r.getLong(2)),company,subject,product).stream().findFirst().orElse(null);
    }
    Rule set(UUID company,UUID subject,UUID product,BigDecimal percent,long version) {
        int changed=version==0?jdbc.update("""
            insert into pricing.product_discount(company_id,subject_id,product_id,discount_percent) values (?,?,?,?)
            on conflict(company_id,subject_id,product_id) do update
            set discount_percent=excluded.discount_percent,enabled=true,version=product_discount.version+1,updated_at=clock_timestamp()
            where not product_discount.enabled
            """,company,subject,product,percent):jdbc.update("""
            update pricing.product_discount set discount_percent=?,version=version+1,updated_at=clock_timestamp()
            where company_id=? and subject_id=? and product_id=? and version=? and enabled
            """,percent,company,subject,product,version);
        if(changed!=1) throw new ResponseStatusException(HttpStatus.CONFLICT,"Discount version conflict");
        return rule(company,subject,product,false);
    }
    void remove(UUID company,UUID subject,UUID product,long version) {
        // Retain the row and increasing version so a stale editor cannot overwrite a deleted/recreated rule.
        if(jdbc.update("update pricing.product_discount set enabled=false,version=version+1,updated_at=clock_timestamp() where company_id=? and subject_id=? and product_id=? and version=? and enabled",company,subject,product,version)!=1)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Discount version conflict");
    }
    void audit(UUID company,UUID subject,UUID product,UUID actor,String action,Rule before,Rule after) {
        jdbc.update("""
            insert into pricing.discount_audit(company_id,subject_id,product_id,actor_id,action,previous_percent,discount_percent,version)
            values (?,?,?,?,?,?,?,?)
            """,company,subject,product,actor,action,before==null?null:before.percent(),after==null?null:after.percent(),after==null?before.version()+1:after.version());
    }
    List<Effective> resolve(UUID company,UUID subject,UUID customer,List<UUID> products) {
        return jdbc.query("""
            select p.id,coalesce(person.discount_percent,root.discount_percent,0) as percent,
              case when person.subject_id is not null and ?<>? then 'CONTACT'
                   when coalesce(person.subject_id,root.subject_id) is not null then 'COMPANY' else 'NONE' end as source
            from catalog.product p
            left join pricing.product_discount person on person.company_id=p.company_id and person.product_id=p.id and person.subject_id=? and person.enabled
            left join pricing.product_discount root on root.company_id=p.company_id and root.product_id=p.id and root.subject_id=? and root.enabled
            where p.company_id=? and p.status='ACTIVE' and p.id=any(?)
            """,statement->{
                statement.setObject(1,subject);statement.setObject(2,customer);statement.setObject(3,subject);
                statement.setObject(4,customer);statement.setObject(5,company);
                statement.setArray(6,statement.getConnection().createArrayOf("uuid",products.toArray()));
            },(r,n)->new Effective(r.getObject("id",UUID.class),r.getBigDecimal("percent").toPlainString(),r.getString("source")));
    }
}
