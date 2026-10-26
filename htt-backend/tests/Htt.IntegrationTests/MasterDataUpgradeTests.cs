using System.Security.Cryptography;
using System.Text;
using Htt.Infrastructure;
using Npgsql;
using Xunit;

namespace Htt.IntegrationTests;

public sealed class MasterDataUpgradeTests(DatabaseFixture db) : IClassFixture<DatabaseFixture>
{
    [Theory]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    [InlineData(6)]
    [InlineData(7)]
    [InlineData(8)]
    [InlineData(9)]
    [InlineData(10)]
    [InlineData(11)]
    [InlineData(12)]
    [InlineData(13)]
    [InlineData(14)]
    [InlineData(15)]
    [InlineData(16)]
    [InlineData(17)]
    [InlineData(18)]
    [InlineData(19)]
    [InlineData(20)]
    [InlineData(21)]
    [InlineData(22)]
    [InlineData(23)]
    public async Task Existing_stage_A_database_upgrades_without_rewriting_history_or_losing_legacy_branches(int originalVersion)
    {
        var name = "htt_upgrade_test_" + Guid.NewGuid().ToString("N");
        var adminString = new NpgsqlConnectionStringBuilder(db.Owner) { Database = "postgres", Pooling = false }.ConnectionString;
        await using var admin = new NpgsqlConnection(adminString); await admin.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE DATABASE \"{name}\"", admin)) await create.ExecuteNonQueryAsync();
        var owner = new NpgsqlConnectionStringBuilder(db.Owner) { Database = name, Pooling = false }.ConnectionString;
        try
        {
            await using (var con = new NpgsqlConnection(owner))
            {
                await con.OpenAsync();
                await using (var history = new NpgsqlCommand("CREATE TABLE public.htt_schema_history(name text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())", con)) await history.ExecuteNonQueryAsync();
                var assembly = typeof(MigrationRunner).Assembly;
                foreach (var resource in assembly.GetManifestResourceNames().Where(n => n.EndsWith(".sql", StringComparison.Ordinal)).Order(StringComparer.Ordinal).Take(originalVersion))
                {
                    await using var stream = assembly.GetManifestResourceStream(resource)!; using var reader = new StreamReader(stream); var sql = await reader.ReadToEndAsync();
                    await using var tx = await con.BeginTransactionAsync();
                    await using (var command = new NpgsqlCommand(sql, con, tx)) await command.ExecuteNonQueryAsync();
                    await using (var record = new NpgsqlCommand("INSERT INTO public.htt_schema_history(name,sha256) VALUES(@name,@hash)", con, tx))
                    {
                        record.Parameters.AddWithValue("name", resource); record.Parameters.AddWithValue("hash", Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sql)))); await record.ExecuteNonQueryAsync();
                    }
                    await tx.CommitAsync();
                }
                await using var legacy = new NpgsqlCommand("""
                    INSERT INTO core.companies(id,name) VALUES('10000000-0000-0000-0000-000000000001','Legacy company');
                    INSERT INTO identity.roles(company_id,code,name) VALUES('10000000-0000-0000-0000-000000000001','ADMIN','Legacy admin');
                    SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false);
                    INSERT INTO crm.parties(id,company_id,legal_name) VALUES('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Legacy party');
                    INSERT INTO crm.customers(id,company_id,party_id,code) VALUES('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','OLD');
                    INSERT INTO crm.customer_branches(company_id,customer_id,code,name,address_line1,state,postcode) VALUES('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','OLD','Legacy branch','Original address',@state,@postcode);
                    INSERT INTO crm.customer_credit_exposures(company_id,customer_id,receivable,unbilled_orders,available_advances) VALUES('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',20,10,5);
                    """, con);
                legacy.Parameters.AddWithValue("state", NpgsqlTypes.NpgsqlDbType.Text, originalVersion >= 4 ? (object)"NSW" : DBNull.Value);
                legacy.Parameters.AddWithValue("postcode", NpgsqlTypes.NpgsqlDbType.Text, originalVersion >= 4 ? (object)"2000" : DBNull.Value);
                await legacy.ExecuteNonQueryAsync();
                if (originalVersion >= 4)
                {
                    await using var seed = new NpgsqlCommand("SELECT identity.seed_master_data_roles('10000000-0000-0000-0000-000000000001')", con);
                    await seed.ExecuteNonQueryAsync();
                }
                if (originalVersion >= 10)
                {
                    await using var receipt = new NpgsqlCommand("""
                        DO $old$ DECLARE c uuid:='10000000-0000-0000-0000-000000000001';actor uuid;member uuid;rid uuid;unit uuid;tax uuid;prod uuid;pu uuid;wh uuid;sup uuid;fy uuid;grni uuid;oid uuid;line uuid;ver bigint;
                        BEGIN
                        INSERT INTO identity.users(issuer,subject,display_name) VALUES('upgrade','buyer','Legacy buyer') RETURNING id INTO actor;
                        PERFORM set_config('htt.actor_id',actor::text,true);
                        INSERT INTO identity.memberships(company_id,user_id) VALUES(c,actor) RETURNING id INTO member;
                        SELECT id INTO rid FROM identity.roles WHERE company_id=c AND code='ADMIN';
                        INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES(c,member,rid);
                        PERFORM identity.seed_purchasing_roles(c);
                        INSERT INTO catalog.uoms(company_id,code,name) VALUES(c,'PIECE','Piece') RETURNING id INTO unit;
                        INSERT INTO accounting.tax_codes(company_id,code,name,category) VALUES(c,'FRE','Free','GST_FREE') RETURNING id INTO tax;
                        INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES(c,tax,0,'2000-07-01');
                        INSERT INTO catalog.products(company_id,sku,name,item_type,base_uom_id,tax_code_id) VALUES(c,'OLD-SERVICE','Legacy accepted service','SERVICE',unit,tax) RETURNING id INTO prod;
                        INSERT INTO catalog.product_units(company_id,product_id,uom_id,conversion_to_base) VALUES(c,prod,unit,1) RETURNING id INTO pu;
                        INSERT INTO catalog.warehouses(company_id,code,name) VALUES(c,'OLD-WH','Legacy warehouse') RETURNING id INTO wh;
                        INSERT INTO crm.suppliers(company_id,party_id,code) VALUES(c,'20000000-0000-0000-0000-000000000001','OLD-SUP') RETURNING id INTO sup;
                        INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(c,'2100','GRNI','LIABILITY','GRNI') RETURNING id INTO grni;
                        INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES(c,'GRNI',grni);
                        INSERT INTO accounting.fiscal_years(company_id,label,starts_on,ends_on) VALUES(c,'legacy',current_date-10,current_date+10) RETURNING id INTO fy;
                        INSERT INTO accounting.periods(company_id,fiscal_year_id,starts_on,ends_on) VALUES(c,fy,current_date-10,current_date+10);
                        oid:=purchase.save_order(NULL,NULL,sup,wh,NULL,'Legacy order',jsonb_build_array(jsonb_build_object('productUnitId',pu,'quantity',1,'unitCost',10)));
                        SELECT version INTO ver FROM platform.documents WHERE company_id=c AND id=oid;
                        PERFORM purchase.confirm_order(oid,ver);
                        SELECT version INTO ver FROM platform.documents WHERE company_id=c AND id=oid;
                        SELECT id INTO line FROM purchase.order_lines WHERE company_id=c AND order_id=oid;
                        PERFORM purchase.receive_order(oid,ver,'LEGACY-RECEIPT','',jsonb_build_array(jsonb_build_object('orderLineId',line,'quantity',1)));
                        END $old$;
                        """, con);
                    await receipt.ExecuteNonQueryAsync();
                    if(originalVersion>=11)
                    {
                        await using var oldBill=new NpgsqlCommand("""
                            SELECT set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false);
                            SELECT identity.seed_supplier_bill_roles(core.current_company());
                            INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(core.current_company(),'2000','AP','LIABILITY','AP');
                            INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT company_id,'AP',id FROM accounting.accounts WHERE company_id=core.current_company() AND code='2000';
                            SELECT purchase.post_bill(r.supplier_id,'LEGACY-BILL',d.business_date,d.business_date+30,d.business_date,NULL,NULL,'Original 011 invoice',jsonb_build_array(jsonb_build_object('receiptLineId',rl.id,'quantity',1,'net',10,'tax',0))) FROM purchase.receipt_lines rl JOIN purchase.receipts r ON r.id=rl.receipt_id JOIN platform.documents d ON d.id=r.id;
                            """,con);await oldBill.ExecuteNonQueryAsync();
                    }
                    if(originalVersion==12)
                    {
                        await using var oldPayment=new NpgsqlCommand("""
                            SELECT identity.seed_supplier_payment_roles(core.current_company());
                            INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(core.current_company(),'1000','Bank','ASSET','BANK');
                            INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT company_id,'BANK',id FROM accounting.accounts WHERE company_id=core.current_company() AND code='1000';
                            SELECT purchase.post_supplier_payment(b.supplier_id,11,1,'BANK_TRANSFER','ORIGINAL-PAYMENT',d.business_date,'Next shipment deposit',jsonb_build_array(jsonb_build_object('billLineId',bl.id,'amount',10))) FROM purchase.bills b JOIN purchase.bill_lines bl ON bl.bill_id=b.id JOIN platform.documents d ON d.id=b.id;
                            """,con);await oldPayment.ExecuteNonQueryAsync();
                    }
                }
                if(originalVersion>=13)
                {
                    await using var oldStock=new NpgsqlCommand("""
                        DO $stock$ DECLARE c uuid:=core.current_company();p uuid;pu uuid;u uuid;tax uuid;w uuid;sup uuid;oid uuid;ver bigint;line uuid;inv uuid;BEGIN
                        INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(c,'1200','Inventory','ASSET','INVENTORY') RETURNING id INTO inv;
                        INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES(c,'INVENTORY',inv);
                        SELECT id INTO u FROM catalog.uoms WHERE company_id=c AND code='PIECE';SELECT id INTO tax FROM accounting.tax_codes WHERE company_id=c AND code='FRE';SELECT id INTO w FROM catalog.warehouses WHERE company_id=c AND code='OLD-WH';SELECT id INTO sup FROM crm.suppliers WHERE company_id=c AND code='OLD-SUP';
                        INSERT INTO catalog.products(company_id,sku,name,base_uom_id,tax_code_id) VALUES(c,'OLD-STOCK','Legacy valued stock',u,tax) RETURNING id INTO p;
                        INSERT INTO catalog.product_units(company_id,product_id,uom_id,conversion_to_base) VALUES(c,p,u,1) RETURNING id INTO pu;
                        oid:=purchase.save_order(NULL,NULL,sup,w,NULL,'Legacy stock',jsonb_build_array(jsonb_build_object('productUnitId',pu,'quantity',10,'unitCost',10)));SELECT version INTO ver FROM platform.documents WHERE id=oid;PERFORM purchase.confirm_order(oid,ver);SELECT version INTO ver FROM platform.documents WHERE id=oid;SELECT id INTO line FROM purchase.order_lines WHERE order_id=oid;
                        PERFORM purchase.receive_order(oid,ver,'OLD-STOCK-RECEIPT','',jsonb_build_array(jsonb_build_object('orderLineId',line,'quantity',10)));
                        END $stock$;
                        """,con);await oldStock.ExecuteNonQueryAsync();
                }
                if(originalVersion>=21)
                {
                    await using var expense=new NpgsqlCommand("""
                        SELECT identity.seed_expense_bill_roles(core.current_company()),identity.seed_supplier_payment_roles(core.current_company()),identity.seed_purchase_return_roles(core.current_company());
                        INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(core.current_company(),'6060','Legacy expense','EXPENSE');
                        INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(core.current_company(),'1000','Bank','ASSET','BANK');
                        INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT company_id,'BANK',id FROM accounting.accounts WHERE company_id=core.current_company() AND code='1000';
                        SELECT purchase.post_expense_bill(s.id,'LEGACY-EXPENSE',current_date,current_date+30,current_date,NULL,NULL,'Original 021 expense',jsonb_build_array(jsonb_build_object('expenseAccountId',a.id,'description','Legacy operating expense','net',20,'tax',0,'taxCodeId',t.id))) FROM crm.suppliers s JOIN accounting.accounts a ON a.company_id=s.company_id AND a.code='6060' JOIN accounting.tax_codes t ON t.company_id=s.company_id AND t.code='FRE' WHERE s.company_id=core.current_company();
                        SELECT purchase.post_supplier_payment(b.supplier_id,10,0,'BANK_TRANSFER','LEGACY-EXPENSE-PAYMENT',current_date,'',jsonb_build_array(jsonb_build_object('billLineId',bl.id,'amount',10))) FROM purchase.bills b JOIN purchase.bill_lines bl ON bl.company_id=b.company_id AND bl.bill_id=b.id WHERE b.company_id=core.current_company() AND b.supplier_invoice='LEGACY-EXPENSE';
                        """,con);await expense.ExecuteNonQueryAsync();
                }
                if(originalVersion==22)
                {
                    await using var oldCredit=new NpgsqlCommand("""
                        SELECT purchase.post_expense_credit(b.id,'LEGACY-EXPENSE-CREDIT','Original 022 adjustment',jsonb_build_array(jsonb_build_object('billLineId',bl.id,'amount',20))) FROM purchase.bills b JOIN purchase.bill_lines bl ON bl.bill_id=b.id WHERE b.supplier_invoice='LEGACY-EXPENSE';
                        """,con);await oldCredit.ExecuteNonQueryAsync();
                }
                if(originalVersion==18)
                {
                    await using var oldDeleted=new NpgsqlCommand("""
                        INSERT INTO platform.documents(id,company_id,document_type,business_date,deleted_at,deleted_by,created_by)
                        SELECT '90000000-0000-0000-0000-000000000001',core.current_company(),'QUOTE',current_date,now(),id,id FROM identity.users WHERE issuer='upgrade' AND subject='buyer';
                        INSERT INTO sales.quotes(id,company_id,customer_id,customer_branch_id,warehouse_id,expires_on,customer_snapshot,net,tax,gross,pricing_at,created_by)
                        SELECT '90000000-0000-0000-0000-000000000001',core.current_company(),'30000000-0000-0000-0000-000000000001',b.id,w.id,current_date+10,'{}',0,0,0,now(),u.id
                        FROM crm.customer_branches b CROSS JOIN catalog.warehouses w CROSS JOIN identity.users u WHERE b.code='OLD' AND w.code='OLD-WH' AND u.issuer='upgrade' AND u.subject='buyer';
                        """,con);await oldDeleted.ExecuteNonQueryAsync();
                }
                if(originalVersion==23)
                {
                    await using var oldSales=new NpgsqlCommand("""
                        DO $old$ DECLARE c uuid:=core.current_company();a uuid;pa uuid;cu uuid;br uuid;pu uuid;prod uuid;wh uuid;o uuid;l uuid;i uuid;il uuid;n int;BEGIN
                        SELECT id INTO a FROM identity.users WHERE issuer='upgrade' AND subject='buyer';PERFORM set_config('htt.actor_id',a::text,true);PERFORM identity.seed_receipt_roles(c);PERFORM identity.seed_return_roles(c);
                        INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code='ADMIN' ON CONFLICT DO NOTHING;
                        INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(c,'1100','AR','ASSET','AR'),(c,'4000','Revenue','REVENUE',NULL);
                        INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,CASE code WHEN '1100' THEN 'AR' ELSE 'REVENUE' END,id FROM accounting.accounts WHERE company_id=c AND code IN('1100','4000');
                        INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SALES_ORDER','SO-'),(c,'INVOICE','INV-') ON CONFLICT DO NOTHING;
                        INSERT INTO crm.parties(company_id,legal_name) VALUES(c,'Legacy sales customer') RETURNING id INTO pa;INSERT INTO crm.customers(company_id,party_id,code,credit_limit) VALUES(c,pa,'OLD-SALES',1000) RETURNING id INTO cu;INSERT INTO crm.customer_credit_exposures(company_id,customer_id) VALUES(c,cu);
                        INSERT INTO crm.customer_branches(company_id,customer_id,code,name,address_line1,state,postcode) VALUES(c,cu,'OLD-SALES','Original store','10 Test St','NSW','2000') RETURNING id INTO br;
                        SELECT id INTO wh FROM catalog.warehouses WHERE company_id=c AND code='OLD-WH';SELECT p.id,u.id INTO prod,pu FROM catalog.products p JOIN catalog.product_units u ON u.company_id=p.company_id AND u.product_id=p.id WHERE p.company_id=c AND p.sku='OLD-SERVICE';
                        FOR n IN 1..2 LOOP
                         o:=gen_random_uuid();l:=gen_random_uuid();INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(o,c,'SALES_ORDER',sales.next_number('SALES_ORDER'),current_date,'CONFIRMED',a);
                         INSERT INTO sales.orders(id,company_id,order_origin,creation_reason,pricing_at,customer_id,customer_branch_id,warehouse_id,customer_snapshot,net,tax,gross,approved_by,created_by) VALUES(o,c,'DIRECT','Legacy sale',now(),cu,br,wh,'{}',10,0,10,a,a);
                         INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(l,c,o,1,a);
                         INSERT INTO sales.order_lines(id,company_id,order_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_price,net,tax,gross,snapshot,created_by) VALUES(l,c,o,prod,pu,'SERVICE',1,1,10,10,0,10,'{"taxRate":0,"taxCode":"FRE","quantity":1,"baseQuantity":1,"unitPrice":10,"quantityStep":1}',a);
                         PERFORM sales.lock_credit(cu);INSERT INTO sales.credit_decisions(company_id,order_id,customer_id,credit_limit,receivable,unbilled_before,advances,order_amount,exposure_after,created_by) SELECT c,o,cu,1000,receivable,unbilled_orders,available_advances,10,greatest(0,receivable+unbilled_orders+10-available_advances),a FROM crm.customer_credit_exposures WHERE company_id=c AND customer_id=cu;INSERT INTO sales.credit_commitments(company_id,order_id,customer_id,amount,created_by) VALUES(c,o,cu,10,a);UPDATE crm.customer_credit_exposures SET unbilled_orders=unbilled_orders+10 WHERE company_id=c AND customer_id=cu;
                         i:=sales.post_invoice(o,1,jsonb_build_array(jsonb_build_object('orderLineId',l,'quantity',1)),'LEGACY-SALES-'||n);SELECT id INTO il FROM sales.invoice_lines WHERE company_id=c AND invoice_id=i;
                         IF n=1 THEN PERFORM accounting.post_receipt(cu,10,'BANK_TRANSFER','LEGACY-CUSTOMER-RECEIPT',(SELECT invoice_date FROM sales.invoices WHERE id=i),jsonb_build_array(jsonb_build_object('invoiceLineId',il,'amount',10)),'[]');PERFORM sales.post_credit_note(i,'LEGACY-CUSTOMER-CREDIT',jsonb_build_array(jsonb_build_object('invoiceLineId',il,'quantity',1)));END IF;
                        END LOOP;END $old$;
                        """,con);await oldSales.ExecuteNonQueryAsync();
                }
            }
            await MigrationRunner.ApplyAsync(owner);
            await MigrationRunner.ApplyAsync(owner);
            await using var check = new NpgsqlConnection(owner); await check.OpenAsync();
            await using var count = new NpgsqlCommand("SELECT count(*) FROM public.htt_schema_history", check); Assert.Equal(24L, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT receivable FROM crm.customer_credit_exposures"; Assert.Equal(20m, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT unbilled_orders FROM crm.customer_credit_exposures"; Assert.Equal(10m, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT available_advances FROM crm.customer_credit_exposures"; Assert.Equal(5m, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT count(*) FROM crm.customer_branches WHERE code='OLD'"; Assert.Equal(1L, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT count(*) FROM identity.roles WHERE code='OFFICE'"; Assert.Equal(1L, await count.ExecuteScalarAsync());
            count.CommandText = "SELECT count(*) FROM identity.role_permissions p JOIN identity.roles r ON r.id=p.role_id WHERE r.code='ADMIN' AND p.permission_code='pricing.floor.write'"; Assert.Equal(1L, await count.ExecuteScalarAsync());
            count.CommandText="SELECT count(*) FROM identity.role_permissions WHERE permission_code IN('documents.trash.read','documents.trash.write','documents.trash.restore') AND role_id=(SELECT id FROM identity.roles WHERE code='ADMIN')";Assert.Equal(3L,await count.ExecuteScalarAsync());
            if(originalVersion==23)
            {
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT available_apply_amount FROM sales.customer_credit_line_balances";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sales.apply_customer_credit(cn.id,'UPGRADED-CUSTOMER-APPLY','Old paid credit',jsonb_build_array(jsonb_build_object('creditLineId',cl.id,'invoiceLineId',il.id,'amount',10))) FROM sales.credit_notes cn JOIN sales.credit_note_lines cl ON cl.credit_note_id=cn.id CROSS JOIN sales.invoices i JOIN sales.invoice_lines il ON il.invoice_id=i.id WHERE i.fulfilment_reference='LEGACY-SALES-2'";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(outstanding_amount) FROM sales.invoice_line_balances";Assert.Equal(0m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sales.unapply_customer_credit(id,'UPGRADED-CUSTOMER-UNDO','Restore old balances') FROM sales.credit_applications";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(outstanding_amount) FROM sales.invoice_line_balances";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(amount) FROM accounting.payment_allocations";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT receivable FROM crm.customer_credit_exposures e JOIN crm.customers c ON c.id=e.customer_id WHERE c.code='OLD-SALES'";Assert.Equal(0m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==22)
            {
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT refundable_amount FROM purchase.supplier_credit_line_balances cl JOIN purchase.supplier_credit_notes cn ON cn.id=cl.credit_note_id WHERE cn.reference='LEGACY-EXPENSE-CREDIT'";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.apply_supplier_credit(cn.id,'UPGRADED-APPLY','Verified old credit transfer',jsonb_build_array(jsonb_build_object('creditLineId',cl.id,'billLineId',bl.id,'amount',10))) FROM purchase.supplier_credit_notes cn JOIN purchase.supplier_credit_lines cl ON cl.credit_note_id=cn.id JOIN purchase.bills b ON b.supplier_invoice='LEGACY-BILL' JOIN purchase.bill_lines bl ON bl.bill_id=b.id WHERE cn.reference='LEGACY-EXPENSE-CREDIT'";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT outstanding_amount FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.id=bl.bill_id WHERE b.supplier_invoice='LEGACY-BILL'";Assert.Equal(0m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.unapply_supplier_credit(id,'UPGRADED-UNAPPLY','Verified old transfer correction') FROM purchase.credit_applications WHERE reference='UPGRADED-APPLY'";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT outstanding_amount FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.id=bl.bill_id WHERE b.supplier_invoice='LEGACY-BILL'";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT expense_amount FROM purchase.bills WHERE supplier_invoice='LEGACY-EXPENSE'";Assert.Equal(20m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT gross FROM purchase.supplier_credit_notes WHERE reference='LEGACY-EXPENSE-CREDIT'";Assert.Equal(20m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==21)
            {
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT expense_amount FROM purchase.bills WHERE supplier_invoice='LEGACY-EXPENSE' AND bill_type='EXPENSE'";Assert.Equal(20m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT outstanding_amount FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.id=bl.bill_id WHERE b.supplier_invoice='LEGACY-EXPENSE'";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.post_expense_credit(b.id,'UPGRADED-EXPENSE-CREDIT','Verified old expense adjustment',jsonb_build_array(jsonb_build_object('billLineId',bl.id,'amount',20))) FROM purchase.bills b JOIN purchase.bill_lines bl ON bl.bill_id=b.id WHERE b.supplier_invoice='LEGACY-EXPENSE'";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.receive_supplier_refund(cl.id,NULL,10,'UPGRADED-EXPENSE-REFUND','Verified incoming old expense refund',NULL) FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes cn ON cn.id=cl.credit_note_id WHERE cn.reference='UPGRADED-EXPENSE-CREDIT'";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT net_paid_amount FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.id=bl.bill_id WHERE b.supplier_invoice='LEGACY-EXPENSE'";Assert.Equal(0m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT expense_amount FROM purchase.bills WHERE supplier_invoice='LEGACY-EXPENSE'";Assert.Equal(20m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==18)
            {
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT platform.document_visible('90000000-0000-0000-0000-000000000001')";Assert.Equal(false,await count.ExecuteScalarAsync());
                count.CommandText="SELECT platform.trash_items('QUOTE',1,25)->>'totalItems'";Assert.Equal("1",await count.ExecuteScalarAsync());
                count.CommandText="SELECT platform.change_visibility('90000000-0000-0000-0000-000000000001',1,1,true,'Review old marker')";var denied=await Assert.ThrowsAsync<PostgresException>(()=>count.ExecuteScalarAsync());Assert.Equal("HX409",denied.SqlState);
            }
            if (originalVersion == 10)
            {
                count.CommandText="SELECT sum(amount) FROM accounting.grni_items";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT count(*) FROM purchase.receipts";Assert.Equal(1L,await count.ExecuteScalarAsync());
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(core.current_company(),'2000','AP','LIABILITY','AP');INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT company_id,'AP',id FROM accounting.accounts WHERE company_id=core.current_company() AND code='2000'";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT purchase.post_bill(r.supplier_id,'OLD-INVOICE',d.business_date,d.business_date+30,d.business_date,NULL,NULL,'Migrated receipt',jsonb_build_array(jsonb_build_object('receiptLineId',rl.id,'quantity',1,'net',10,'tax',0))) FROM purchase.receipt_lines rl JOIN purchase.receipts r ON r.id=rl.receipt_id JOIN platform.documents d ON d.id=r.id";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(amount) FROM accounting.ap_items";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(grni_amount) FROM purchase.bill_lines";Assert.Equal(10m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==11)
            {
                count.CommandText="SELECT sum(amount) FROM accounting.ap_items";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(outstanding_amount) FROM accounting.ap_balances";Assert.Equal(10m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(core.current_company(),'1000','Bank','ASSET','BANK');INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT company_id,'BANK',id FROM accounting.accounts WHERE company_id=core.current_company() AND code='1000'";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT purchase.post_supplier_payment(b.supplier_id,11,1,'BANK_TRANSFER','MIGRATED-PAYMENT',d.business_date,'Next shipment',jsonb_build_array(jsonb_build_object('billLineId',bl.id,'amount',10))) FROM purchase.bills b JOIN purchase.bill_lines bl ON bl.bill_id=b.id JOIN platform.documents d ON d.id=b.id";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(outstanding_amount) FROM accounting.ap_balances";Assert.Equal(0m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(available) FROM accounting.supplier_advance_balances";Assert.Equal(1m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==12)
            {
                count.CommandText="SELECT sum(amount) FROM accounting.supplier_payments";Assert.Equal(11m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(available) FROM accounting.supplier_advance_balances";Assert.Equal(1m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT purchase.return_goods(r.id,'MIGRATED-RETURN','Supplier accepted cancellation',jsonb_build_array(jsonb_build_object('receiptLineId',rl.id,'billLineId',bl.id,'quantity',1))) FROM purchase.receipts r JOIN purchase.receipt_lines rl ON rl.receipt_id=r.id JOIN purchase.bill_lines bl ON bl.receipt_line_id=rl.id";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.post_supplier_credit(bl.bill_id,'MIGRATED-CREDIT','Verified credit',jsonb_build_array(jsonb_build_object('returnLineId',rl.id,'quantity',1))) FROM purchase.return_lines rl JOIN purchase.bill_lines bl ON bl.id=rl.bill_line_id";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.receive_supplier_refund(id,NULL,10,'MIGRATED-REFUND','Received refund',NULL) FROM purchase.supplier_credit_lines";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT purchase.receive_supplier_refund(NULL,id,1,'MIGRATED-DEPOSIT-REFUND','Deposit returned',NULL) FROM accounting.supplier_advances";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(available_credit) FROM accounting.ap_balances";Assert.Equal(0m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(available) FROM accounting.supplier_advance_balances";Assert.Equal(0m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==13)
            {
                count.CommandText="SELECT sum(on_hand) FROM inventory.stock_balances";Assert.Equal(10m,await count.ExecuteScalarAsync());count.CommandText="SELECT sum(value) FROM inventory.stock_values";Assert.Equal(100m,await count.ExecuteScalarAsync());count.CommandText="SELECT revision FROM inventory.stock_balances";Assert.Equal(1L,await count.ExecuteScalarAsync());
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="INSERT INTO catalog.warehouses(company_id,code,name) VALUES(core.current_company(),'NEW-WH','New warehouse')";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT inventory.post_control('TRANSFER',b.warehouse_id,(SELECT id FROM catalog.warehouses WHERE code='NEW-WH'),'MIGRATED-TRANSFER','Confirmed handover',jsonb_build_array(jsonb_build_object('productId',b.product_id,'quantity',2))) FROM inventory.stock_balances b";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT inventory.start_count(w.id,'MIGRATED-COUNT','Physical count',ARRAY[p.id]) FROM catalog.warehouses w CROSS JOIN catalog.products p WHERE w.code='OLD-WH' AND p.sku='OLD-STOCK'";var cid=(Guid)(await count.ExecuteScalarAsync())!;
                count.CommandText=$"SELECT inventory.submit_count('{cid}',1,jsonb_build_array(jsonb_build_object('productId',id,'countedQuantity',7))) FROM catalog.products WHERE sku='OLD-STOCK'";await count.ExecuteNonQueryAsync();count.CommandText=$"SELECT inventory.post_count('{cid}',2)";Assert.Equal(cid,await count.ExecuteScalarAsync());
                count.CommandText="SELECT sum(on_hand) FROM inventory.stock_balances";Assert.Equal(9m,await count.ExecuteScalarAsync());count.CommandText="SELECT sum(value) FROM inventory.stock_values";Assert.Equal(90m,await count.ExecuteScalarAsync());
            }
            if(originalVersion==14)
            {
                count.CommandText="SELECT sum(on_hand) FROM inventory.stock_balances";Assert.Equal(10m,await count.ExecuteScalarAsync());count.CommandText="SELECT sum(value) FROM inventory.stock_values";Assert.Equal(100m,await count.ExecuteScalarAsync());
                count.CommandText="SELECT set_config('htt.company_id','10000000-0000-0000-0000-000000000001',false),set_config('htt.actor_id',(SELECT id::text FROM identity.users WHERE issuer='upgrade' AND subject='buyer'),false)";await count.ExecuteNonQueryAsync();
                count.CommandText="INSERT INTO catalog.warehouses(company_id,code,name) VALUES(core.current_company(),'NEW-TRANSIT','Destination')";await count.ExecuteNonQueryAsync();
                count.CommandText="SELECT inventory.dispatch_transit(b.warehouse_id,(SELECT id FROM catalog.warehouses WHERE code='NEW-TRANSIT'),'UPGRADE-TRANSIT','Carrier dispatch',jsonb_build_array(jsonb_build_object('productId',b.product_id,'quantity',2))) FROM inventory.stock_balances b";var transfer=(Guid)(await count.ExecuteScalarAsync())!;
                count.CommandText=$"SELECT inventory.post_transit_event('{transfer}','RECEIPT','UPGRADE-ARRIVAL','Actual receipt',jsonb_build_array(jsonb_build_object('transferLineId',id,'quantity',1))) FROM inventory.transit_transfer_lines";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText=$"SELECT inventory.post_transit_event('{transfer}','SHORTAGE','UPGRADE-SHORT','Loss verified',jsonb_build_array(jsonb_build_object('transferLineId',id,'quantity',1))) FROM inventory.transit_transfer_lines";Assert.IsType<Guid>(await count.ExecuteScalarAsync());
                count.CommandText="SELECT state FROM inventory.transit_transfer_balances";Assert.Equal("CLOSED",await count.ExecuteScalarAsync());count.CommandText="SELECT remaining_cost FROM inventory.transit_transfer_balances";Assert.Equal(0m,await count.ExecuteScalarAsync());count.CommandText="SELECT sum(on_hand) FROM inventory.stock_balances";Assert.Equal(9m,await count.ExecuteScalarAsync());count.CommandText="SELECT sum(value) FROM inventory.stock_values";Assert.Equal(90m,await count.ExecuteScalarAsync());
            }
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE \"{name}\" WITH (FORCE)", admin); await drop.ExecuteNonQueryAsync();
        }
    }
}
