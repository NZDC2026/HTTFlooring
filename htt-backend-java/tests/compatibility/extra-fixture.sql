SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);
INSERT INTO catalog.uoms(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000001','ALT','Synthetic Alternative Unit');
INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000016',0,'2026-01-01');
INSERT INTO crm.customer_credit_exposures(company_id,customer_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011');
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES
 ('00000000-0000-0000-0000-000000000001','PICK','PK-'),
 ('00000000-0000-0000-0000-000000000001','PURCHASE_ORDER','PO-'),
 ('00000000-0000-0000-0000-000000000001','PURCHASE_RECEIPT','PR-') ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind) VALUES ('00000000-0000-0000-0000-000000000047','00000000-0000-0000-0000-000000000001','TEST_GRNI','Synthetic GRNI','LIABILITY','GRNI');
INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES ('00000000-0000-0000-0000-000000000001','GRNI','00000000-0000-0000-0000-000000000047');

SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.quotes.approve') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','QUOTE','Q-') ON CONFLICT DO NOTHING;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','purchase.input_gst.read') ON CONFLICT DO NOTHING;
INSERT INTO accounting.tax_codes(id,company_id,code,name,category) VALUES ('00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000001','TEST_GST10','Synthetic GST 10%','TAXABLE');
INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000053',0.1,'2026-01-01');
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind) VALUES ('00000000-0000-0000-0000-000000000054','00000000-0000-0000-0000-000000000001','TEST_GST_INPUT','Synthetic GST Input','ASSET','GST');
INSERT INTO accounting.tax_account_mappings(company_id,tax_code_id,input_account_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000053','00000000-0000-0000-0000-000000000054');
UPDATE core.companies SET gst_registered=true,abn='10000000000' WHERE id='00000000-0000-0000-0000-000000000001';
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind) VALUES ('00000000-0000-0000-0000-000000000055','00000000-0000-0000-0000-000000000001','TEST_GST_DEFERRED','Synthetic Deferred GST Input','ASSET','GST');
INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES ('00000000-0000-0000-0000-000000000001','GST_INPUT_DEFERRED','00000000-0000-0000-0000-000000000055');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.advances.apply') ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind) VALUES
 ('00000000-0000-0000-0000-000000000056','00000000-0000-0000-0000-000000000001','TEST_CUSTOMER_ADV','Synthetic Customer Advances','LIABILITY'),
 ('00000000-0000-0000-0000-000000000057','00000000-0000-0000-0000-000000000001','TEST_ADV_CLEAR','Synthetic Advance GST Clearing','ASSET');
INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES
 ('00000000-0000-0000-0000-000000000001','CUSTOMER_ADVANCES','00000000-0000-0000-0000-000000000056'),
 ('00000000-0000-0000-0000-000000000001','GST_ADVANCE_CLEARING','00000000-0000-0000-0000-000000000057');
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','ADVANCE_APPLICATION','AA-');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.advances.unapply'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.receipts.reverse') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES
 ('00000000-0000-0000-0000-000000000001','ADVANCE_UNAPPLICATION','AAU-'),
 ('00000000-0000-0000-0000-000000000001','RECEIPT_REVERSAL','RCR-');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.receipts.reapply') ON CONFLICT DO NOTHING;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.refunds.read'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.refunds.write') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','CUSTOMER_REFUND','CRF-');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.refunds.reverse') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','CUSTOMER_REFUND_REVERSAL','CFR-');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.refunds.correct') ON CONFLICT DO NOTHING;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.credits.read'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.credits.write') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','CREDIT_NOTE','CN-');
INSERT INTO crm.parties(id,company_id,legal_name) VALUES ('00000000-0000-0000-0000-000000000071','00000000-0000-0000-0000-000000000001','Synthetic Credit-only Customer');
INSERT INTO crm.customers(id,company_id,party_id,code,credit_limit) VALUES ('00000000-0000-0000-0000-000000000072','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000071','CREDIT_ONLY',100000);
INSERT INTO crm.customer_credit_exposures(company_id,customer_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000072');
INSERT INTO crm.customer_branches(id,company_id,customer_id,code,name,address_line1,suburb,state,postcode) VALUES ('00000000-0000-0000-0000-000000000073','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000072','CREDIT_TEST','Synthetic Credit Branch','20 Test Street','Sydney','NSW','2000');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.credits.adjust') ON CONFLICT DO NOTHING;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','inventory.returns.read'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','inventory.returns.write') ON CONFLICT DO NOTHING;
INSERT INTO catalog.warehouses(id,company_id,code,name,kind) VALUES ('00000000-0000-0000-0000-000000000074','00000000-0000-0000-0000-000000000001','QUARANTINE_TEST','Synthetic Quarantine','QUARANTINE');
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','SALES_RETURN','RT-');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','accounting.gst.read') ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind) VALUES ('00000000-0000-0000-0000-000000000075','00000000-0000-0000-0000-000000000001','TEST_GST_OUTPUT','Synthetic Output GST','LIABILITY','GST');
UPDATE accounting.tax_account_mappings SET output_account_id='00000000-0000-0000-0000-000000000075' WHERE company_id='00000000-0000-0000-0000-000000000001' AND tax_code_id='00000000-0000-0000-0000-000000000053';
INSERT INTO catalog.products(id,company_id,sku,name,item_type,base_uom_id,tax_code_id,whole_packs) VALUES ('00000000-0000-0000-0000-000000000076','00000000-0000-0000-0000-000000000001','SERVICE_GST_TEST','Synthetic Taxable Service','SERVICE','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000053',false);
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base) VALUES ('00000000-0000-0000-0000-000000000077','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000076','00000000-0000-0000-0000-000000000015',1);
INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from) VALUES ('00000000-0000-0000-0000-000000000078','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000077',50,'2026-01-01');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.credits.apply'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','sales.credits.unapply') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES
 ('00000000-0000-0000-0000-000000000001','CUSTOMER_CREDIT_APPLICATION','CCA-'),
 ('00000000-0000-0000-0000-000000000001','CUSTOMER_CREDIT_UNAPPLICATION','CCU-');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004',p
FROM unnest(ARRAY['purchase.returns.post','purchase.returns.read','purchase.credits.post','purchase.credits.read','purchase.credits.apply','purchase.credits.unapply']) p ON CONFLICT DO NOTHING;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000100','https://localhost:15443','test-credit-no-bills','Synthetic Credit Without Bill Read');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000100');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000001','CREDIT_NO_BILLS','Synthetic Credit Without Bill Read');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000102',p
FROM unnest(ARRAY['purchase.credits.read','purchase.credits.apply','purchase.credits.unapply']) p;

INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES
 ('00000000-0000-0000-0000-000000000001','PURCHASE_RETURN','PRT-'),
 ('00000000-0000-0000-0000-000000000001','SUPPLIER_CREDIT','SC-'),
 ('00000000-0000-0000-0000-000000000001','SUPPLIER_CREDIT_APPLICATION','SCA-'),
 ('00000000-0000-0000-0000-000000000001','SUPPLIER_CREDIT_UNAPPLICATION','SCU-') ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind) VALUES
 ('00000000-0000-0000-0000-000000000110','00000000-0000-0000-0000-000000000001','TEST_RETURN_CLEARING','Synthetic purchase return clearing','ASSET'),
 ('00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000001','TEST_RETURN_VARIANCE','Synthetic purchase return variance','EXPENSE');
INSERT INTO accounting.account_mappings(company_id,purpose,account_id) VALUES
 ('00000000-0000-0000-0000-000000000001','PURCHASE_RETURN_CLEARING','00000000-0000-0000-0000-000000000110'),
 ('00000000-0000-0000-0000-000000000001','PURCHASE_RETURN_VARIANCE','00000000-0000-0000-0000-000000000111');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000120','https://localhost:15443','test-return-no-cost','Synthetic Return Access');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000120');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000122','00000000-0000-0000-0000-000000000001','TEST_RETURN_NO_COST','Synthetic Return Access');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000122');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000122','purchase.returns.read');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000122','warehouses.all');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000123','https://localhost:15443','test-return-unassigned','Synthetic Return Access');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000124','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000123');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000125','00000000-0000-0000-0000-000000000001','TEST_RETURN_UNASSIGNED','Synthetic Return Access');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000124','00000000-0000-0000-0000-000000000125');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000125','purchase.returns.read');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004',p FROM unnest(ARRAY['purchase.refunds.post','purchase.refunds.read']) p ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','SUPPLIER_REFUND','SR-') ON CONFLICT DO NOTHING;
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000130','https://localhost:15443','test-refund-no-bank','Synthetic Supplier Refund Without Bank Choice');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000131','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000130');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000132','00000000-0000-0000-0000-000000000001','REFUND_NO_BANK','Synthetic Refund Without Bank Choice');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000131','00000000-0000-0000-0000-000000000132');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000132',p FROM unnest(ARRAY['purchase.refunds.post','purchase.refunds.read']) p;

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001',r,p FROM unnest(ARRAY['00000000-0000-0000-0000-000000000004'::uuid,'00000000-0000-0000-0000-000000000132'::uuid]) r CROSS JOIN unnest(ARRAY['purchase.refunds.reverse','purchase.refunds.correct']) p ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES ('00000000-0000-0000-0000-000000000001','SUPPLIER_REFUND_REVERSAL','SFR-') ON CONFLICT DO NOTHING;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000150','https://localhost:15443','test-refund-no-post','Synthetic Supplier Refund Authority');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000151','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000150');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000152','00000000-0000-0000-0000-000000000001','TEST_REFUND_NO_POST','Synthetic Refund Authority');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000151','00000000-0000-0000-0000-000000000152');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000152','purchase.refunds.read');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000152','purchase.bills.read');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000152','purchase.refunds.reverse');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000152','purchase.refunds.correct');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000153','https://localhost:15443','test-refund-no-reverse','Synthetic Supplier Refund Authority');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000154','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000153');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000155','00000000-0000-0000-0000-000000000001','TEST_REFUND_NO_REVERSE','Synthetic Refund Authority');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000154','00000000-0000-0000-0000-000000000155');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000155','purchase.refunds.read');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000155','purchase.bills.read');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000155','purchase.refunds.post');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000155','purchase.refunds.correct');

INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind) VALUES ('00000000-0000-0000-0000-000000000160','00000000-0000-0000-0000-000000000001','TEST_REFUND_ALT_BANK','Synthetic alternate refund bank','ASSET','BANK');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001',r,p FROM unnest(ARRAY['00000000-0000-0000-0000-000000000004'::uuid,'00000000-0000-0000-0000-000000000132'::uuid]) r CROSS JOIN unnest(ARRAY['purchase.expense_bills.post','purchase.expense_credits.post','purchase.credits.adjust']) p ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind) VALUES ('00000000-0000-0000-0000-000000000170','00000000-0000-0000-0000-000000000001','TEST_SUPPLIER_EXPENSE','Synthetic supplier expense','EXPENSE');

INSERT INTO catalog.uoms(id,company_id,code,name) VALUES
 ('00000000-0000-0000-0000-000000000180','00000000-0000-0000-0000-000000000001','M2','Synthetic square metres'),
 ('00000000-0000-0000-0000-000000000181','00000000-0000-0000-0000-000000000001','BOX','Synthetic whole box');
INSERT INTO catalog.products(id,company_id,sku,name,item_type,base_uom_id,tax_code_id,whole_packs) VALUES
 ('00000000-0000-0000-0000-000000000182','00000000-0000-0000-0000-000000000001','QUOTE_BOX_TEST','Synthetic Café & Box','STOCK','00000000-0000-0000-0000-000000000180','00000000-0000-0000-0000-000000000053',true);
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base,quantity_step) VALUES
 ('00000000-0000-0000-0000-000000000183','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000182','00000000-0000-0000-0000-000000000180',1,.5),
 ('00000000-0000-0000-0000-000000000184','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000182','00000000-0000-0000-0000-000000000181',2.25,1);
INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from) VALUES
 ('00000000-0000-0000-0000-000000000185','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000183',25,'2026-01-01'),
 ('00000000-0000-0000-0000-000000000186','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000184',50,'2026-01-01');
INSERT INTO pricing.price_floor_rules(id,company_id,product_unit_id,amount) VALUES ('00000000-0000-0000-0000-000000000187','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000184',45);
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES
 ('00000000-0000-0000-0000-000000000190','https://localhost:15443','test-quote-office','Synthetic Quote Office'),
 ('00000000-0000-0000-0000-000000000193','https://localhost:15443','test-quote-other','Synthetic Other Quote Writer');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES
 ('00000000-0000-0000-0000-000000000191','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000190'),
 ('00000000-0000-0000-0000-000000000194','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000193');
INSERT INTO identity.roles(id,company_id,code,name) VALUES
 ('00000000-0000-0000-0000-000000000192','00000000-0000-0000-0000-000000000001','QUOTE_OFFICE_TEST','Synthetic Quote Office'),
 ('00000000-0000-0000-0000-000000000195','00000000-0000-0000-0000-000000000001','QUOTE_OTHER_TEST','Synthetic Other Quote Writer');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000191','00000000-0000-0000-0000-000000000192'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000194','00000000-0000-0000-0000-000000000195');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001',r,p FROM unnest(ARRAY['00000000-0000-0000-0000-000000000192'::uuid,'00000000-0000-0000-0000-000000000195'::uuid]) r CROSS JOIN unnest(ARRAY['sales.quotes.read','sales.quotes.write','customers.all','warehouses.all']) p;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000192',p FROM unnest(ARRAY['sales.quotes.manage.all','sales.quotes.price.override','pricing.write']) p;

INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000195','sales.orders.create');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000192','pricing.floor.write');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000192',p FROM unnest(ARRAY['pricing.manage.read','pricing.floor.read']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000200','https://localhost:15443','test-pricing-scoped','Synthetic Assigned Customer Pricing');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000200');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000001','PRICING_SCOPED_TEST','Synthetic Assigned Customer Pricing');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000202',p FROM unnest(ARRAY['pricing.manage.read','pricing.write']) p;
INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000002');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000192',p FROM unnest(ARRAY['catalog.read','catalog.write','warehouses.read','warehouses.write']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000210','https://localhost:15443','test-warehouse-scoped','Synthetic Assigned Warehouse');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000211','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000210');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000212','00000000-0000-0000-0000-000000000001','WAREHOUSE_SCOPED_TEST','Synthetic Assigned Warehouse');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000211','00000000-0000-0000-0000-000000000212');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000212',p FROM unnest(ARRAY['warehouses.read','warehouses.write']) p;
INSERT INTO core.regions(id,company_id,code,name,active) VALUES
 ('00000000-0000-0000-0000-000000000215','00000000-0000-0000-0000-000000000001','CATALOG_REGION_TEST','Synthetic region',true),
 ('00000000-0000-0000-0000-000000000216','00000000-0000-0000-0000-000000000001','CATALOG_REGION_OFF','Synthetic inactive region',false);
INSERT INTO catalog.product_categories(id,company_id,code,name,active) VALUES
 ('00000000-0000-0000-0000-000000000217','00000000-0000-0000-0000-000000000001','CATALOG_CATEGORY_TEST','Synthetic category',true),
 ('00000000-0000-0000-0000-000000000218','00000000-0000-0000-0000-000000000001','CATALOG_CATEGORY_OFF','Synthetic inactive category',false);
INSERT INTO catalog.uoms(id,company_id,code,name,active) VALUES
 ('00000000-0000-0000-0000-000000000219','00000000-0000-0000-0000-000000000001','CATALOG_UNIT_TEST','Synthetic alternate unit',true),
 ('00000000-0000-0000-0000-000000000225','00000000-0000-0000-0000-000000000001','CATALOG_UNIT_OFF','Synthetic inactive unit',false);
INSERT INTO catalog.warehouses(id,company_id,code,name,kind) VALUES ('00000000-0000-0000-0000-000000000220','00000000-0000-0000-0000-000000000001','CATALOG_SCOPE_TEST','Synthetic assigned warehouse','SELLABLE');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000211','00000000-0000-0000-0000-000000000220');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000230','https://localhost:15443','test-crm-office','Synthetic CRM fixture');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000231','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000230');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000232','00000000-0000-0000-0000-000000000001','CRM_TEST_230','Synthetic CRM fixture');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000231','00000000-0000-0000-0000-000000000232');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000232',p FROM unnest(ARRAY['customers.read','customers.write','customers.credit.write','customers.all','suppliers.read','suppliers.write']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000233','https://localhost:15443','test-crm-limited','Synthetic CRM fixture');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000234','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000233');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000235','00000000-0000-0000-0000-000000000001','CRM_TEST_233','Synthetic CRM fixture');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000234','00000000-0000-0000-0000-000000000235');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000235',p FROM unnest(ARRAY['customers.read','customers.write','customers.all']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000236','https://localhost:15443','test-supplier-only','Synthetic CRM fixture');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000237','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000236');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000238','00000000-0000-0000-0000-000000000001','CRM_TEST_236','Synthetic CRM fixture');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000237','00000000-0000-0000-0000-000000000238');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000238',p FROM unnest(ARRAY['suppliers.read','suppliers.write']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000239','https://localhost:15443','test-crm-scoped','Synthetic CRM fixture');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000240','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000239');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000241','00000000-0000-0000-0000-000000000001','CRM_TEST_239','Synthetic CRM fixture');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000240','00000000-0000-0000-0000-000000000241');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000241',p FROM unnest(ARRAY['customers.read','customers.write','suppliers.read','suppliers.write']) p;

INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000240','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000002');
INSERT INTO crm.parties(id,company_id,legal_name) VALUES ('00000000-0000-0000-0000-000000000250','00000000-0000-0000-0000-000000000001','Synthetic shared CRM party');
INSERT INTO crm.customers(id,company_id,party_id,code,status,credit_limit,payment_terms_days) VALUES ('00000000-0000-0000-0000-000000000251','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000250','SHARED_CRM_TEST','ON_HOLD',100,30);
INSERT INTO crm.suppliers(id,company_id,party_id,code,status,payment_terms_days) VALUES ('00000000-0000-0000-0000-000000000252','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000250','SHARED_SUPPLIER_TEST','ACTIVE',30);

INSERT INTO crm.customer_branches(id,company_id,customer_id,code,name,address_line1,state,postcode) VALUES
 ('00000000-0000-0000-0000-000000000260','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','CONTACT_LINK_TEST','Synthetic contact branch','1 Synthetic Contact Street','NSW','2000'),
 ('00000000-0000-0000-0000-000000000261','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000251','SHARED_CONTACT_LINK_TEST','Synthetic shared contact branch','2 Synthetic Contact Street','NSW','2000');

SELECT identity.seed_inventory_control_roles('00000000-0000-0000-0000-000000000001');
INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id) VALUES ('00000000-0000-0000-0000-000000000270','00000000-0000-0000-0000-000000000001','ZZ_CONTROL_270','Synthetic inventory control product','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base) VALUES ('00000000-0000-0000-0000-000000000273','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000270','00000000-0000-0000-0000-000000000015',1);
INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id) VALUES ('00000000-0000-0000-0000-000000000274','00000000-0000-0000-0000-000000000001','ZZ_CONTROL_274','Synthetic inventory control product','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base) VALUES ('00000000-0000-0000-0000-000000000277','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000274','00000000-0000-0000-0000-000000000015',1);
INSERT INTO catalog.warehouses(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000001','ZZ_CONTROL_271','Synthetic inventory control warehouse');
INSERT INTO catalog.warehouses(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000272','00000000-0000-0000-0000-000000000001','ZZ_CONTROL_272','Synthetic inventory control warehouse');
INSERT INTO inventory.stock_openings(company_id,warehouse_id,product_id,quantity,reference,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000270',100,'Synthetic control opening 270','00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000270',100,'00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_openings(company_id,warehouse_id,product_id,quantity,reference,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000274',50,'Synthetic control opening 274','00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000274',50,'00000000-0000-0000-0000-000000000002');
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000280','https://localhost:15443','test-inventory-finance','Synthetic inventory role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000281','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000280');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000282','00000000-0000-0000-0000-000000000001','INV_CONTROL_280','Synthetic inventory role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000281','00000000-0000-0000-0000-000000000282');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000282',p FROM unnest(ARRAY['inventory.transfers.post','inventory.transfers.read','inventory.control.read','inventory.cost.read','inventory.writeoffs.post','warehouses.all']) p;
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000283','https://localhost:15443','test-inventory-operator','Synthetic inventory role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000284','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000283');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000285','00000000-0000-0000-0000-000000000001','INV_CONTROL_283','Synthetic inventory role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000284','00000000-0000-0000-0000-000000000285');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000285',p FROM unnest(ARRAY['inventory.transfers.post','inventory.transfers.read']) p;
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000284','00000000-0000-0000-0000-000000000271');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000284','00000000-0000-0000-0000-000000000272');
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000286','https://localhost:15443','test-inventory-post-only','Synthetic inventory role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000287','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000286');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000288','00000000-0000-0000-0000-000000000001','INV_CONTROL_286','Synthetic inventory role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000287','00000000-0000-0000-0000-000000000288');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000288',p FROM unnest(ARRAY['inventory.transfers.post','warehouses.all']) p;
INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000289','https://localhost:15443','test-inventory-one-warehouse','Synthetic inventory role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000290','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000289');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000291','00000000-0000-0000-0000-000000000001','INV_CONTROL_289','Synthetic inventory role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000290','00000000-0000-0000-0000-000000000291');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000291',p FROM unnest(ARRAY['inventory.transfers.post','inventory.transfers.read']) p;
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000290','00000000-0000-0000-0000-000000000271');
