package com.htt.management.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name={"htt.auth.enabled","htt.customers.enabled"},havingValue="true")
public class CustomerAccountConfiguration {
    @Bean @ConditionalOnMissingBean(KeycloakAccounts.class)
    @ConditionalOnProperty(name="htt.auth.local-enabled",havingValue="false",matchIfMissing=true)
    KeycloakAccounts keycloakAccounts(AuthenticationProperties auth,ObjectMapper json,
            @Value("${htt.keycloak.accounts.client-id:}") String client,@Value("${htt.keycloak.accounts.client-secret:}") String secret) {
        return new KeycloakAccounts(auth.portal().issuer(),client,secret,json);
    }
    @Bean CustomerAccountStore customerAccountStore(JdbcTemplate jdbc,ObjectMapper json,CustomerManagementAccess access) { return new CustomerAccountStore(jdbc,json,access); }
    @Bean CustomerAccountService customerAccountService(CustomerManagementAccess access,CustomerAccountStore store,org.springframework.beans.factory.ObjectProvider<KeycloakAccounts> keycloak,org.springframework.beans.factory.ObjectProvider<LocalAuthentication> local,PlatformTransactionManager manager) {
        return new CustomerAccountService(access,store,keycloak.getIfAvailable(),local.getIfAvailable(),manager);
    }
}
