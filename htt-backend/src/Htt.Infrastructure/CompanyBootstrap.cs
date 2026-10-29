using Htt.SharedKernel;
using Npgsql;

namespace Htt.Infrastructure;

public static class CompanyBootstrap
{
    // Owner CLI only. Never exposed as a public registration/first-user-becomes-admin endpoint.
    public static async Task<Guid> CreateAsync(string connectionString, string name, string? abn,
        string timezone, string issuer, string subject, CancellationToken token = default)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 200 || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(subject))
            throw new BusinessException("invalid_bootstrap", "Company name and verified external issuer/subject are required.");
        if (abn is not null) abn = AustralianBusinessNumber.Normalize(abn);
        var company = Guid.NewGuid();
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(token);
        await using var transaction = await connection.BeginTransactionAsync(token);
        await using var command = new NpgsqlCommand("""
            SELECT set_config('htt.company_id',@company_text,true);
            INSERT INTO core.companies(id,name,abn,timezone) VALUES(@company,@name,@abn,@timezone);
            INSERT INTO identity.users(issuer,subject,display_name) VALUES(@issuer,@subject,@name)
              ON CONFLICT(issuer,subject) DO NOTHING;
            """, connection, transaction);
        command.Parameters.AddWithValue("company", company);
        command.Parameters.AddWithValue("company_text", company.ToString());
        command.Parameters.AddWithValue("name", name.Trim());
        command.Parameters.AddWithValue("abn", NpgsqlTypes.NpgsqlDbType.Varchar, (object?)abn ?? DBNull.Value);
        command.Parameters.AddWithValue("timezone", timezone);
        command.Parameters.AddWithValue("issuer", issuer);
        command.Parameters.AddWithValue("subject", subject);
        await command.ExecuteNonQueryAsync(token);
        await using var seed = new NpgsqlCommand("""
            DO $seed$
            DECLARE c uuid:=core.current_company(); u uuid; m uuid; r uuid; gst uuid; zero_tax uuid; ignored uuid; fy uuid;
                    yr int; starts date; a_gst uuid; a_input uuid;
            BEGIN
              SELECT id INTO u FROM identity.users WHERE issuer=current_setting('htt.bootstrap_issuer') AND subject=current_setting('htt.bootstrap_subject');
              PERFORM set_config('htt.actor_id',u::text,true);
              INSERT INTO identity.memberships(company_id,user_id) VALUES(c,u) RETURNING id INTO m;
              INSERT INTO identity.roles(company_id,code,name) VALUES(c,'ADMIN','Company administrator') RETURNING id INTO r;
              INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES(c,m,r);
              INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r,code FROM identity.permissions;
              INSERT INTO identity.roles(company_id,code,name) VALUES(c,'SALES','Sales representative') RETURNING id INTO r;
              INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
                SELECT c,r,code FROM identity.permissions WHERE code IN ('foundation.read','customers.read','catalog.read','pricing.read');
              INSERT INTO identity.roles(company_id,code,name) VALUES(c,'WAREHOUSE','Warehouse operator') RETURNING id INTO r;
              INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
                SELECT c,r,code FROM identity.permissions WHERE code IN ('foundation.read','catalog.read');
              INSERT INTO catalog.uoms(company_id,code,name)
                SELECT c,code,name FROM (VALUES('M2','Square metre'),('BOX','Box'),('LM','Linear metre'),('PIECE','Piece'),('BUCKET','Bucket'),('HOUR','Hour'),('JOB','Job')) t(code,name);
              INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind)
                SELECT c,code,name,kind,control FROM (VALUES
                  ('1000','Bank','ASSET','BANK'),('1100','Accounts Receivable','ASSET','AR'),
                  ('1200','Inventory','ASSET','INVENTORY'),('1300','GST Input','ASSET','GST'),
                  ('2000','Accounts Payable','LIABILITY','AP'),('2100','Goods Received Not Invoiced','LIABILITY','GRNI'),
                  ('2200','GST Output','LIABILITY','GST'),('3000','Opening Equity','EQUITY',NULL),
                  ('4000','Sales','REVENUE',NULL),('5000','Cost of Goods Sold','EXPENSE',NULL)) t(code,name,kind,control);
              INSERT INTO accounting.account_mappings(company_id,purpose,account_id)
                SELECT c,purpose,a.id FROM (VALUES('BANK','1000'),('AR','1100'),('INVENTORY','1200'),('AP','2000'),('GRNI','2100'),('REVENUE','4000'),('COGS','5000')) v(purpose,code)
                JOIN accounting.accounts a ON a.company_id=c AND a.code=v.code;
              INSERT INTO accounting.tax_codes(company_id,code,name,category,report_mapping) VALUES(c,'GST','GST taxable','TAXABLE','GST_STANDARD') RETURNING id INTO gst;
              INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES(c,gst,0.10,'2000-07-01');
              INSERT INTO accounting.tax_codes(company_id,code,name,category) VALUES(c,'FRE','GST free','GST_FREE') RETURNING id INTO zero_tax;
              INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES(c,zero_tax,0,'2000-07-01');
              INSERT INTO accounting.tax_codes(company_id,code,name,category) VALUES(c,'N-T','Outside GST scope','OUT_OF_SCOPE') RETURNING id INTO ignored;
              INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES(c,ignored,0,'2000-07-01');
              SELECT id INTO a_gst FROM accounting.accounts WHERE company_id=c AND code='2200';
              SELECT id INTO a_input FROM accounting.accounts WHERE company_id=c AND code='1300';
              INSERT INTO accounting.tax_account_mappings(company_id,tax_code_id,output_account_id,input_account_id) VALUES(c,gst,a_gst,a_input);
              INSERT INTO pricing.price_lists(company_id,code) VALUES(c,'STANDARD');
              yr:=extract(year FROM current_date)::int-CASE WHEN extract(month FROM current_date)<7 THEN 1 ELSE 0 END;
              starts:=make_date(yr,7,1);
              INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) VALUES(c,yr||'-'||(yr+1),starts,(starts+interval '1 year')::date) RETURNING id INTO fy;
              INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on)
                SELECT c,fy,s::date,(s+interval '1 month')::date FROM generate_series(starts,starts+interval '11 months',interval '1 month') s;
              INSERT INTO platform.document_sequences(company_id,document_type,prefix)
                VALUES(c,'QUOTE','Q-'),(c,'SALES_ORDER','SO-'),(c,'INVOICE','INV-');
              PERFORM identity.seed_master_data_roles(c);
              PERFORM identity.seed_sales_roles(c);
              PERFORM identity.seed_fulfilment_roles(c);
              PERFORM identity.seed_invoicing_roles(c);
              PERFORM identity.seed_receipt_roles(c);
              PERFORM identity.seed_return_roles(c);
              PERFORM identity.seed_purchasing_roles(c);
              PERFORM identity.seed_supplier_bill_roles(c);
              PERFORM identity.seed_supplier_payment_roles(c);
              PERFORM identity.seed_purchase_return_roles(c);
              PERFORM identity.seed_inventory_control_roles(c);
              PERFORM identity.seed_transit_roles(c);
              PERFORM identity.seed_reconciliation_roles(c);
              PERFORM identity.seed_document_roles(c);
              PERFORM identity.seed_portal_roles(c);
              PERFORM identity.seed_trash_roles(c);
              PERFORM identity.seed_direct_order_roles(c);
              PERFORM identity.seed_expense_bill_roles(c);
              PERFORM identity.seed_expense_credit_roles(c);
              PERFORM identity.seed_credit_application_roles(c);
              PERFORM identity.seed_customer_credit_application_roles(c);
              PERFORM identity.seed_settlement_reversal_roles(c);
              PERFORM identity.seed_supplier_reversal_roles(c);
              PERFORM identity.seed_customer_refund_roles(c); PERFORM identity.seed_supplier_refund_roles(c); PERFORM identity.seed_amount_credit_roles(c); PERFORM identity.seed_purchase_adjustment_roles(c); PERFORM identity.seed_business_preferences(c); PERFORM identity.seed_location_roles(c); PERFORM identity.seed_bank_ledger_roles(c); PERFORM identity.seed_bank_reconciliation_roles(c); PERFORM identity.seed_financial_report_roles(c); PERFORM identity.seed_cash_flow_roles(c); PERFORM identity.seed_bas_roles(c); PERFORM identity.seed_period_close_roles(c);
              INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id)
                VALUES(c,u,'company.bootstrapped','company',c,'owner-cli');
              INSERT INTO platform.outbox_events(company_id,event_type,payload,created_by)
                VALUES(c,'foundation.company_created',jsonb_build_object('companyId',c),u);
            END $seed$;
            """, connection, transaction);
        await using (var context = new NpgsqlCommand("SELECT set_config('htt.bootstrap_issuer',@issuer,true),set_config('htt.bootstrap_subject',@subject,true)", connection, transaction))
        {
            context.Parameters.AddWithValue("issuer", issuer);
            context.Parameters.AddWithValue("subject", subject);
            await context.ExecuteNonQueryAsync(token);
        }
        await seed.ExecuteNonQueryAsync(token);
        await transaction.CommitAsync(token);
        return company;
    }
}
