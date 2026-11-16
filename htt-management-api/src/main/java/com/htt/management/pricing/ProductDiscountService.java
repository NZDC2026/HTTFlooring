package com.htt.management.pricing;

import com.htt.management.identity.CustomerManagementAccess;
import com.htt.management.identity.CustomerPricingAccess;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

class ProductDiscountService {
    private final ProductDiscountStore store;
    private final CustomerManagementAccess management;
    private final CustomerPricingAccess portal;
    ProductDiscountService(ProductDiscountStore store,CustomerManagementAccess management,CustomerPricingAccess portal) {
        this.store=store;this.management=management;this.portal=portal;
    }
    public record Input(BigDecimal discountPercent,Long version) { }
    public record Discount(String subjectId,UUID productId,String discountPercent,long version) { }

    @Transactional(timeout=5)
    public Discount set(String subject,UUID product,Input input) {
        var context=management.require("pricing:discount:write");
        validate(input);
        store.context(context.companyId(),context.actorId());
        var target=store.subject(context.companyId(),subject);
        management.requireCustomer(context,target.customer(),"pricing:discount:write");
        store.product(context.companyId(),product);
        var before=store.rule(context.companyId(),target.id(),product,true);
        var after=store.set(context.companyId(),target.id(),product,input.discountPercent().setScale(4),input.version());
        store.audit(context.companyId(),target.id(),product,context.actorId(),"SET",before,after);
        return new Discount(subject,product,after.percent().toPlainString(),after.version());
    }
    @Transactional(readOnly=true,timeout=5)
    public Discount read(String subject,UUID product) {
        var context=management.require("pricing:discount:read");
        store.context(context.companyId(),context.actorId());
        var target=store.subject(context.companyId(),subject);
        management.requireCustomer(context,target.customer(),"pricing:discount:read");
        store.product(context.companyId(),product);
        var rule=store.rule(context.companyId(),target.id(),product,false);
        if(rule==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return new Discount(subject,product,rule.percent().toPlainString(),rule.version());
    }
    @Transactional(timeout=5)
    public void remove(String subject,UUID product,long version) {
        var context=management.require("pricing:discount:write");
        if(version<1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        store.context(context.companyId(),context.actorId());
        var target=store.subject(context.companyId(),subject);
        management.requireCustomer(context,target.customer(),"pricing:discount:write");
        var before=store.rule(context.companyId(),target.id(),product,true);
        if(before==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        store.remove(context.companyId(),target.id(),product,version);
        store.audit(context.companyId(),target.id(),product,context.actorId(),"REMOVE",before,null);
    }
    @Transactional(readOnly=true,timeout=5)
    public List<ProductDiscountStore.Effective> resolve(List<UUID> products) {
        var context=portal.requireOwn();
        if(products==null||products.isEmpty()||products.size()>100||products.stream().anyMatch(java.util.Objects::isNull)
                ||products.stream().distinct().count()!=products.size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        var rows=store.resolve(context.companyId(),context.subjectId(),context.customerId(),products);
        if(rows.size()!=products.size()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var indexed=rows.stream().collect(java.util.stream.Collectors.toMap(ProductDiscountStore.Effective::productId,r->r));
        return products.stream().map(indexed::get).toList();
    }
    static void validate(Input input) {
        if(input==null||input.version()==null||input.version()<0||input.discountPercent()==null
                ||input.discountPercent().signum()<0||input.discountPercent().compareTo(new BigDecimal("100"))>0
                ||input.discountPercent().stripTrailingZeros().scale()>4)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid discount input");
    }
}
