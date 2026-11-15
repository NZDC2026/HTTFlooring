package com.htt.management.crm;

import com.htt.management.crm.application.CustomerService;
import com.htt.management.crm.infrastructure.CustomerRepository;
import com.htt.management.identity.CustomerManagementAccess;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration(proxyBeanMethods=false)
@EnableTransactionManagement
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
public class CustomerManagementConfiguration {
    @Bean CustomerRepository customerRepository(JdbcTemplate jdbc) { return new CustomerRepository(jdbc); }
    @Bean CustomerService customerService(CustomerRepository repository,CustomerManagementAccess access) { return new CustomerService(repository,access); }
    @Bean org.springdoc.core.customizers.OpenApiCustomizer customerCompanyHeader() {
        return api->{
            if(api.getPaths()==null) return;
            api.getPaths().forEach((path,item)->{
                if(path.startsWith("/api/v1/customers")) item.readOperations().forEach(operation->
                    operation.addParametersItem(new io.swagger.v3.oas.models.parameters.Parameter().name("X-Company-Id").in("header").required(true)
                        .description("Select an authorized company from employee /me. This header does not grant access.")
                        .schema(new io.swagger.v3.oas.models.media.StringSchema().format("uuid"))));
            });
        };
    }
}
