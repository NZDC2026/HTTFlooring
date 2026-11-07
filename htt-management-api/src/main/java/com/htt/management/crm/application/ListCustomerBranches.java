package com.htt.management.crm.application;

import com.htt.management.crm.infrastructure.CustomerBranchRepository;
import com.htt.management.identity.CustomerBranchAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

public class ListCustomerBranches {
    private final CustomerBranchAccess access;
    private final CustomerBranchRepository repository;

    public ListCustomerBranches(CustomerBranchAccess access, CustomerBranchRepository repository) {
        this.access = access;
        this.repository = repository;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ, timeout = 5)
    public CustomerBranches read(UUID company, UUID grant) {
        return repository.list(access.require(company, grant));
    }
}
