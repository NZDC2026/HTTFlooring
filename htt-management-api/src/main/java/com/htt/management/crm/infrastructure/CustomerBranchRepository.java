package com.htt.management.crm.infrastructure;

import com.htt.management.crm.application.CustomerBranches;
import com.htt.management.identity.contract.CustomerBranchScope;
import java.sql.Timestamp;
import java.util.UUID;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;

public class CustomerBranchRepository {
    private final JdbcTemplate jdbc;

    public CustomerBranchRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public CustomerBranches list(CustomerBranchScope scope) {
        if (!TransactionSynchronizationManager.isActualTransactionActive())
            throw new IllegalStateException("Branch reads require the authorized use-case transaction.");
        jdbc.queryForObject("select set_config('htt.company_id',?,true)", String.class, scope.companyId().toString());
        jdbc.queryForObject("select set_config('htt.actor_id',?,true)", String.class, scope.actorId().toString());
        var items = jdbc.query(connection -> {
            var statement = connection.prepareStatement("""
                    select id, code, name, address_line1, city, state, postcode, country_code
                    from crm.customer_branch
                    where company_id=? and customer_id=? and id=any(?) and status='ACTIVE'
                    order by code, id
                    """);
            statement.setObject(1, scope.companyId());
            statement.setObject(2, scope.customerId());
            statement.setArray(3, connection.createArrayOf("uuid", scope.branchIds().toArray()));
            return statement;
        }, (row, number) -> {
            // Missing migration data is not an empty list or a made-up branch code/address/country.
            if (row.getString("code") == null || row.getString("address_line1") == null || row.getString("country_code") == null)
                throw new DataRetrievalFailureException("Portal branch migration data is incomplete.");
            return new CustomerBranches.Branch(row.getObject("id", UUID.class), row.getString("code"), row.getString("name"),
                    row.getString("address_line1"), row.getString("city"), row.getString("state"), row.getString("postcode"), row.getString("country_code"));
        });
        var time = jdbc.queryForObject("select statement_timestamp()", Timestamp.class);
        return new CustomerBranches(scope.customerId(), scope.grantId(), items, time.toInstant());
    }
}
