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

INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000282',p FROM unnest(ARRAY['inventory.counts.read','inventory.counts.write','inventory.counts.post']) p;
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001',role,p FROM unnest(ARRAY['00000000-0000-0000-0000-000000000285'::uuid,'00000000-0000-0000-0000-000000000291'::uuid]) role CROSS JOIN unnest(ARRAY['inventory.counts.read','inventory.counts.write']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000300','https://localhost:15443','test-bin-counter','Synthetic blind count role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000300');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000001','BIN_TEST_300','Synthetic blind count role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000302');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000302',p FROM unnest(ARRAY['inventory.bin_counts.read','inventory.bin_counts.capture','inventory.counts.write','inventory.counts.read','inventory.bin_counts.review','inventory.cost.read','inventory.control.read','inventory.bin_counts.post','inventory.counts.post']) p;
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000271');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000303','https://localhost:15443','test-bin-recounter','Synthetic blind count role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000303');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000305','00000000-0000-0000-0000-000000000001','BIN_TEST_303','Synthetic blind count role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-000000000305');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000305',p FROM unnest(ARRAY['inventory.bin_counts.read','inventory.bin_counts.capture','inventory.counts.write','inventory.counts.read']) p;
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-000000000271');

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000306','https://localhost:15443','test-bin-reviewer','Synthetic blind count role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000307','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000306');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000308','00000000-0000-0000-0000-000000000001','BIN_TEST_306','Synthetic blind count role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000307','00000000-0000-0000-0000-000000000308');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000308',p FROM unnest(ARRAY['inventory.bin_counts.read','inventory.bin_counts.review','inventory.cost.read','inventory.control.read','inventory.bin_counts.post','inventory.counts.post']) p;

INSERT INTO identity.users(id,issuer,subject,display_name) VALUES ('00000000-0000-0000-0000-000000000309','https://localhost:15443','test-bin-incomplete-reviewer','Synthetic blind count role');
INSERT INTO identity.memberships(id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000310','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000309');
INSERT INTO identity.roles(id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000311','00000000-0000-0000-0000-000000000001','BIN_TEST_309','Synthetic blind count role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000310','00000000-0000-0000-0000-000000000311');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000311',p FROM unnest(ARRAY['inventory.bin_counts.read','inventory.bin_counts.review','inventory.cost.read','inventory.control.read','inventory.bin_counts.post']) p;
INSERT INTO inventory.bins(id,company_id,warehouse_id,code,name) VALUES ('00000000-0000-0000-0000-000000000350','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','BLIND_TEST','Synthetic discovery bin');

INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id) VALUES ('00000000-0000-0000-0000-000000000360','00000000-0000-0000-0000-000000000001','ZZ_BIN_ECONOMIC','Synthetic empty bin gain SKU','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base) VALUES ('00000000-0000-0000-0000-000000000363','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000360','00000000-0000-0000-0000-000000000015',1);
INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from) VALUES ('00000000-0000-0000-0000-000000000364','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000363',10,'2026-01-01');

INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000370','https://localhost:15443','test-location-writer','Synthetic locations role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000371','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000370');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000372','00000000-0000-0000-0000-000000000001','LOCATION_TEST_370','Synthetic locations role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000371','00000000-0000-0000-0000-000000000372');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000372','inventory.locations.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000372','inventory.locations.write');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000371','00000000-0000-0000-0000-000000000271');

INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000373','https://localhost:15443','test-location-reader','Synthetic locations role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000374','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000373');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000375','00000000-0000-0000-0000-000000000001','LOCATION_TEST_373','Synthetic locations role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000374','00000000-0000-0000-0000-000000000375');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000375','inventory.locations.read');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000374','00000000-0000-0000-0000-000000000271');

INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from)VALUES('00000000-0000-0000-0000-000000000379','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000273',10,'2026-01-01');

SELECT identity.seed_transit_roles('00000000-0000-0000-0000-000000000001');
INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id)VALUES('00000000-0000-0000-0000-000000000380','00000000-0000-0000-0000-000000000001','ZZ_TRANSIT_380','Synthetic transit stock','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base)VALUES('00000000-0000-0000-0000-000000000381','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000380','00000000-0000-0000-0000-000000000015',1);
INSERT INTO inventory.stock_openings(company_id,warehouse_id,product_id,quantity,reference,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000380',6,'Synthetic transit opening 380','00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000380',6,'00000000-0000-0000-0000-000000000002');
INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id)VALUES('00000000-0000-0000-0000-000000000384','00000000-0000-0000-0000-000000000001','ZZ_TRANSIT_384','Synthetic transit stock','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base)VALUES('00000000-0000-0000-0000-000000000385','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000384','00000000-0000-0000-0000-000000000015',1);
INSERT INTO inventory.stock_openings(company_id,warehouse_id,product_id,quantity,reference,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000384',6,'Synthetic transit opening 384','00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000384',6,'00000000-0000-0000-0000-000000000002');
INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id)VALUES('00000000-0000-0000-0000-000000000388','00000000-0000-0000-0000-000000000001','ZZ_TRANSIT_388','Synthetic transit stock','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000016');
INSERT INTO catalog.product_units(id,company_id,product_id,uom_id,conversion_to_base)VALUES('00000000-0000-0000-0000-000000000389','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000388','00000000-0000-0000-0000-000000000015',1);
INSERT INTO inventory.stock_openings(company_id,warehouse_id,product_id,quantity,reference,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000388',1,'Synthetic transit opening 388','00000000-0000-0000-0000-000000000002');
INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000271','00000000-0000-0000-0000-000000000388',1,'00000000-0000-0000-0000-000000000002');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000390','https://localhost:15443','test-transit-source','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000391','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000390');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000392','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_390','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000391','00000000-0000-0000-0000-000000000392');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000392','inventory.transit.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000392','inventory.transit.dispatch'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000392','inventory.transit.return');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000391','00000000-0000-0000-0000-000000000271');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000393','https://localhost:15443','test-transit-destination','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000394','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000393');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000395','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_393','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000394','00000000-0000-0000-0000-000000000395');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000395','inventory.transit.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000395','inventory.transit.receive');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000394','00000000-0000-0000-0000-000000000272');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000396','https://localhost:15443','test-transit-cost','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000397','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000396');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000398','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_396','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000397','00000000-0000-0000-0000-000000000398');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000398','inventory.transit.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000398','inventory.cost.read');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000397','00000000-0000-0000-0000-000000000271');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000399','https://localhost:15443','test-transit-finance','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000400','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000399');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000401','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_399','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000400','00000000-0000-0000-0000-000000000401');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000401','inventory.control.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000401','inventory.transit.resolve');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000402','https://localhost:15443','test-transit-outsider','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000403','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000402');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000404','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_402','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000403','00000000-0000-0000-0000-000000000404');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000404','inventory.transit.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000404','inventory.transit.dispatch'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000404','inventory.transit.receive'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000404','inventory.transit.return');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000403','00000000-0000-0000-0000-000000000014');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000405','https://localhost:15443','test-transit-dispatch-only','Synthetic transit actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000406','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000405');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000407','00000000-0000-0000-0000-000000000001','TRANSIT_TEST_405','Synthetic transit actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000406','00000000-0000-0000-0000-000000000407');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000407','inventory.transit.dispatch');
INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000406','00000000-0000-0000-0000-000000000271');

INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000410','00000000-0000-0000-0000-000000000001','ZZ_BANK_LEGACY','Synthetic legacy bank upgrade','ASSET','BANK');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000411','https://localhost:15443','test-bank-maintainer','Synthetic bank directory actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000412','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000411');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000413','00000000-0000-0000-0000-000000000001','BANK_TEST_411','Synthetic bank directory actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000412','00000000-0000-0000-0000-000000000413');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000413','accounting.banks.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000413','accounting.banks.write');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000414','https://localhost:15443','test-bank-reader','Synthetic bank directory actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000415','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000414');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000416','00000000-0000-0000-0000-000000000001','BANK_TEST_414','Synthetic bank directory actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000415','00000000-0000-0000-0000-000000000416');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000416','accounting.banks.read');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000417','https://localhost:15443','test-bank-write-only','Synthetic bank directory actor');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000418','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000417');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000419','00000000-0000-0000-0000-000000000001','BANK_TEST_417','Synthetic bank directory actor');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000418','00000000-0000-0000-0000-000000000419');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000419','accounting.banks.write');

INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000420','https://localhost:15443','test-ledger-reader','Synthetic dual-company ledger reader');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000421','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000420'),('00000000-0000-0000-0000-000000000424','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000420');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000422','00000000-0000-0000-0000-000000000001','LEDGER_TEST_MAIN','Synthetic ledger role'),('00000000-0000-0000-0000-000000000425','00000000-0000-0000-0000-000000000021','LEDGER_TEST_OTHER','Synthetic ledger role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000421','00000000-0000-0000-0000-000000000422'),('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000424','00000000-0000-0000-0000-000000000425');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000422','accounting.ledger.read'),('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000425','accounting.ledger.read');


SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000430','00000000-0000-0000-0000-000000000001','GENERAL_BANK_A','Synthetic general banking GENERAL_BANK_A','ASSET','BANK');
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000431','00000000-0000-0000-0000-000000000001','GENERAL_BANK_B','Synthetic general banking GENERAL_BANK_B','ASSET','BANK');
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000432','00000000-0000-0000-0000-000000000001','GENERAL_BANK_C','Synthetic general banking GENERAL_BANK_C','ASSET','BANK');
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000433','00000000-0000-0000-0000-000000000001','GENERAL_REVENUE','Synthetic general banking GENERAL_REVENUE','REVENUE',NULL);
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000434','00000000-0000-0000-0000-000000000001','GENERAL_EXPENSE','Synthetic general banking GENERAL_EXPENSE','EXPENSE',NULL);
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000435','00000000-0000-0000-0000-000000000001','GENERAL_CAPITAL','Synthetic general banking GENERAL_CAPITAL','ASSET',NULL);
UPDATE accounting.bank_accounts SET kind='CARD_CLEARING' WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='00000000-0000-0000-0000-000000000432';
INSERT INTO accounting.tax_codes(id,company_id,code,name,category)VALUES('00000000-0000-0000-0000-000000000436','00000000-0000-0000-0000-000000000001','GENERAL_OUT_SCOPE','Synthetic out of scope','OUT_OF_SCOPE');
INSERT INTO accounting.tax_rates(company_id,tax_code_id,rate,effective_from)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000436',0,'2026-01-01');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000450','https://localhost:15443','test-general-finance','Synthetic general bank role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000451','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000450');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000452','00000000-0000-0000-0000-000000000001','GENERAL_TEST_450','Synthetic general bank role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000451','00000000-0000-0000-0000-000000000452');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_transactions.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.banks.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.ledger.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','purchase.input_gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_transactions.post'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_transactions.transfer'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_transactions.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_transactions.reverse'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.banks.use'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.cash_flow.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.reports.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.match'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.import');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000453','https://localhost:15443','test-general-reader','Synthetic general bank role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000454','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000453');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000455','00000000-0000-0000-0000-000000000001','GENERAL_TEST_453','Synthetic general bank role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000454','00000000-0000-0000-0000-000000000455');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000455','accounting.bank_transactions.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000455','accounting.banks.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000455','accounting.ledger.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000455','accounting.gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000455','purchase.input_gst.read');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000456','https://localhost:15443','test-general-no-reports','Synthetic general bank role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000457','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000456');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000458','00000000-0000-0000-0000-000000000001','GENERAL_TEST_456','Synthetic general bank role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000457','00000000-0000-0000-0000-000000000458');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_transactions.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.banks.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.ledger.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','purchase.input_gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_transactions.post'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_transactions.transfer'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_transactions.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_transactions.reverse'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.banks.use'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.cash_flow.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_statements.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_statements.match'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000458','accounting.bank_statements.import');
INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000459','https://localhost:15443','test-general-no-ledger','Synthetic general bank role');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000460','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000459');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000461','00000000-0000-0000-0000-000000000001','GENERAL_TEST_459','Synthetic general bank role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000460','00000000-0000-0000-0000-000000000461');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_transactions.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.banks.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','purchase.input_gst.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_transactions.post'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_transactions.transfer'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_transactions.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_transactions.reverse'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.banks.use'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.cash_flow.classify'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.reports.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_statements.read'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_statements.match'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000461','accounting.bank_statements.import');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.reconcile'),('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.reopen');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_statements.void');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_rules.read');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_rules.manage');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_rules.preview');

INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000452','accounting.bank_rules.execute');

INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000462','https://localhost:15443','test-rule-auto','Synthetic rule auto authority');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000463','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000462');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000464','00000000-0000-0000-0000-000000000001','RULE_AUTO_TEST','Synthetic automatic rule role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000463','00000000-0000-0000-0000-000000000464');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT company_id,'00000000-0000-0000-0000-000000000464'::uuid,permission_code FROM identity.role_permissions WHERE company_id='00000000-0000-0000-0000-000000000001' AND role_id='00000000-0000-0000-0000-000000000452';
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000464','accounting.bank_rules.auto_execute');

INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000470','00000000-0000-0000-0000-000000000001','FEED_470','Synthetic feed BANK','ASSET','BANK');
UPDATE accounting.bank_accounts SET kind='BANK',bsb='123456',account_number='47000000',account_holder='Synthetic feed fixture' WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='00000000-0000-0000-0000-000000000470';

INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)VALUES('00000000-0000-0000-0000-000000000471','00000000-0000-0000-0000-000000000001','FEED_471','Synthetic feed BANK','ASSET','BANK');
UPDATE accounting.bank_accounts SET kind='BANK',bsb='123456',account_number='47100000',account_holder='Synthetic feed fixture' WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='00000000-0000-0000-0000-000000000471';

INSERT INTO identity.users(id,issuer,subject,display_name)VALUES('00000000-0000-0000-0000-000000000480','https://localhost:15443','test-feed-manager','Synthetic feed manager');
INSERT INTO identity.memberships(id,company_id,user_id)VALUES('00000000-0000-0000-0000-000000000481','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000480');
INSERT INTO identity.roles(id,company_id,code,name)VALUES('00000000-0000-0000-0000-000000000482','00000000-0000-0000-0000-000000000001','FEED_TEST','Synthetic feed role');
INSERT INTO identity.membership_roles(company_id,membership_id,role_id)VALUES('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000481','00000000-0000-0000-0000-000000000482');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT company_id,'00000000-0000-0000-0000-000000000482'::uuid,permission_code FROM identity.role_permissions WHERE company_id='00000000-0000-0000-0000-000000000001' AND role_id='00000000-0000-0000-0000-000000000452';
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT '00000000-0000-0000-0000-000000000001'::uuid,'00000000-0000-0000-0000-000000000482'::uuid,code FROM identity.permissions WHERE code IN('accounting.bank_feeds.read','accounting.bank_feeds.manage','accounting.bank_feeds.sync');
