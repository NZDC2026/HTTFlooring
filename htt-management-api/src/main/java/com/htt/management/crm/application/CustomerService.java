package com.htt.management.crm.application;

import com.htt.management.crm.domain.Customer;
import com.htt.management.crm.domain.CustomerRules;
import com.htt.management.crm.domain.CustomerRules.*;
import com.htt.management.crm.infrastructure.CustomerRepository;
import com.htt.management.identity.CustomerManagementAccess;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

public class CustomerService {
    private final CustomerRepository repository;
    private final CustomerManagementAccess access;
    public CustomerService(CustomerRepository repository, CustomerManagementAccess access) { this.repository=repository;this.access=access; }

    @Transactional(timeout=10)
    public Customer create(CustomerInput input) {
        var context=access.require("customer:create");repository.context(context);
        if(input.version()!=null) throw new InvalidCustomer("version");
        var workspace=repository.workspace(context.companyId());
        var profile=input.profile(workspace.currency(),input.billingAddress(),locations(input),contacts(input)).withDefaults();
        UUID id=UUID.randomUUID();
        repository.create(context.companyId(),id,"cus_"+id,repository.nextCode(context.companyId()),profile);
        repository.audit(context,id,"customer:create",1);
        return repository.read(context.companyId(),id);
    }
    @Transactional(readOnly=true,timeout=5)
    public Customer read(String businessId) {
        var context=access.require("customer:read");repository.context(context);
        UUID id=repository.internalId(context.companyId(),CustomerRules.businessId(businessId),false);
        access.requireCustomer(context,id,"customer:read");
        return repository.read(context.companyId(),id);
    }
    @Transactional(readOnly=true,timeout=5)
    public List<com.htt.management.crm.domain.CustomerSubject> subjects(String businessId) {
        var context=access.require("customer:read");repository.context(context);
        UUID id=repository.internalId(context.companyId(),CustomerRules.businessId(businessId),false);
        access.requireCustomer(context,id,"customer:read");return repository.subjects(context.companyId(),id);
    }
    @Transactional(readOnly=true,timeout=10)
    public List<Customer> list(int offset,int limit,String search) {
        if(offset<0||limit<1||limit>100||search==null||search.length()>120) throw new InvalidCustomer("pagination");
        var context=access.require("customer:read");repository.context(context);
        return repository.list(context,offset,limit,search).stream().map(id->repository.read(context.companyId(),id)).toList();
    }
    @Transactional(timeout=10)
    public Customer update(String businessId,CustomerInput input,boolean billingSpecified) {
        var context=access.require("customer:update");repository.context(context);
        UUID id=repository.internalId(context.companyId(),CustomerRules.businessId(businessId),true);
        access.requireCustomer(context,id,"customer:update");
        var current=repository.read(context.companyId(),id);
        checkVersion(input.version(),current.version());
        var workspace=repository.workspace(context.companyId());
        var profile=input.profile(workspace.currency(),billingSpecified?input.billingAddress():current.profile().billingAddress(),
                mergeLocations(current.profile().locations(),locations(input)),mergeContacts(current.profile().contacts(),contacts(input))).withDefaults();
        repository.update(context.companyId(),id,current.version(),profile);
        repository.audit(context,id,"customer:update",current.version()+1);
        return repository.read(context.companyId(),id);
    }
    @Transactional(timeout=10)
    public Customer status(String businessId,long version,Status status) {
        if(status==null) throw new InvalidCustomer("status");
        var context=access.require("customer:status");repository.context(context);
        UUID id=repository.internalId(context.companyId(),CustomerRules.businessId(businessId),true);
        access.requireCustomer(context,id,"customer:status");
        var current=repository.read(context.companyId(),id);checkVersion(version,current.version());var p=current.profile();
        var next=new Profile(p.businessName(),p.tradingName(),p.abn(),p.businessType(),status,p.email(),p.phone(),p.website(),
                p.pricingTier(),p.creditHold(),p.creditLimit(),p.currency(),p.paymentTerms(),p.internalNotes(),p.billingAddress(),p.locations(),p.contacts());
        repository.update(context.companyId(),id,version,next);repository.audit(context,id,"customer:status",version+1);
        return repository.read(context.companyId(),id);
    }
    @Transactional(timeout=10)
    public Customer location(String customer,String pathId,CustomerInput.LocationInput input) {
        Customer current=lockedForChild(customer,input.version());
        if(pathId!=null && (input.id()!=null&&!pathId.equals(input.id()) || current.profile().locations().stream().noneMatch(l->l.id().equals(pathId))))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var location=new CustomerInput.LocationInput(input.version(),pathId==null?input.id():pathId,input.name(),input.addressLine1(),input.addressLine2(),
                input.suburb(),input.state(),input.postcode(),input.country(),input.phone(),input.isPrimary()).domain();
        if(pathId==null&&current.profile().locations().stream().anyMatch(l->l.id().equals(location.id()))) throw new ResponseStatusException(HttpStatus.CONFLICT);
        return saveChildren(current,mergeLocations(current.profile().locations(),List.of(location)),current.profile().contacts());
    }
    @Transactional(timeout=10)
    public Customer contact(String customer,String pathId,CustomerInput.ContactInput input) {
        Customer current=lockedForChild(customer,input.version());
        if(pathId!=null && (input.id()!=null&&!pathId.equals(input.id()) || current.profile().contacts().stream().noneMatch(c->c.id().equals(pathId))))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var contact=new CustomerInput.ContactInput(input.version(),pathId==null?input.id():pathId,input.firstName(),input.lastName(),input.jobTitle(),input.email(),
                input.phone(),input.mobile(),input.locationId(),input.isPrimary(),input.isAccounting()).domain();
        if(pathId==null&&current.profile().contacts().stream().anyMatch(c->c.id().equals(contact.id()))) throw new ResponseStatusException(HttpStatus.CONFLICT);
        return saveChildren(current,current.profile().locations(),mergeContacts(current.profile().contacts(),List.of(contact)));
    }
    private Customer lockedForChild(String customer,Long version) {
        var context=access.require("customer:update");repository.context(context);
        UUID id=repository.internalId(context.companyId(),CustomerRules.businessId(customer),true);
        access.requireCustomer(context,id,"customer:update");
        Customer current=repository.read(context.companyId(),id);checkVersion(version,current.version());return current;
    }
    private Customer saveChildren(Customer current,List<Location> locations,List<Contact> contacts) {
        var context=access.require("customer:update");var p=current.profile();
        var profile=new Profile(p.businessName(),p.tradingName(),p.abn(),p.businessType(),p.status(),p.email(),p.phone(),p.website(),p.pricingTier(),
                p.creditHold(),p.creditLimit(),p.currency(),p.paymentTerms(),p.internalNotes(),p.billingAddress(),locations,contacts).withDefaults();
        repository.update(current.companyId(),current.id(),current.version(),profile);
        repository.audit(context,current.id(),"customer:update",current.version()+1);return repository.read(current.companyId(),current.id());
    }
    private static List<Location> locations(CustomerInput input) { return input.locations()==null?List.of():input.locations().stream().map(CustomerInput.LocationInput::domain).toList(); }
    private static List<Contact> contacts(CustomerInput input) { return input.contacts()==null?List.of():input.contacts().stream().map(CustomerInput.ContactInput::domain).toList(); }
    private static void checkVersion(Long version,long actual) {
        if(version==null||version<1) throw new InvalidCustomer("version");
        if(version!=actual) throw new ResponseStatusException(HttpStatus.CONFLICT,"Customer version conflict");
    }
    private static List<Location> mergeLocations(List<Location> current,List<Location> updates) {
        if(updates.stream().filter(Location::isPrimary).count()>1) throw new InvalidCustomer("locations.isPrimary");
        var map=new LinkedHashMap<String,Location>();
        boolean replacePrimary=updates.stream().anyMatch(Location::isPrimary);
        for(var l:current) map.put(l.id(),replacePrimary?new Location(l.id(),l.name(),l.address(),l.phone(),false):l);
        var seen=new java.util.HashSet<String>();
        for(var l:updates) { if(!seen.add(l.id())) throw new InvalidCustomer("locations.id");map.put(l.id(),l); }
        return List.copyOf(map.values());
    }
    private static List<Contact> mergeContacts(List<Contact> current,List<Contact> updates) {
        if(updates.stream().filter(Contact::isPrimary).count()>1 || updates.stream().filter(Contact::isAccounting).count()>1) throw new InvalidCustomer("contacts.defaults");
        boolean primary=updates.stream().anyMatch(Contact::isPrimary),accounting=updates.stream().anyMatch(Contact::isAccounting);
        var map=new LinkedHashMap<String,Contact>();
        for(var c:current) map.put(c.id(),new Contact(c.id(),c.firstName(),c.lastName(),c.jobTitle(),c.email(),c.phone(),c.mobile(),c.locationId(),
                primary?false:c.isPrimary(),accounting?false:c.isAccounting()));
        var seen=new java.util.HashSet<String>();
        for(var c:updates) { if(!seen.add(c.id())) throw new InvalidCustomer("contacts.id");map.put(c.id(),c); }
        return List.copyOf(map.values());
    }
}
