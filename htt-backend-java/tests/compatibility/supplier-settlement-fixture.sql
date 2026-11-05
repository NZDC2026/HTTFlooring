BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004',p
FROM unnest(ARRAY['purchase.bills.read','purchase.bills.post','purchase.payments.read','purchase.payments.post']) p ON CONFLICT DO NOTHING;
INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind)
VALUES ('00000000-0000-0000-0000-000000000048','00000000-0000-0000-0000-000000000001','TEST_AP','Fixture AP','LIABILITY','AP') ON CONFLICT DO NOTHING;
INSERT INTO accounting.account_mappings(company_id,purpose,account_id)
VALUES ('00000000-0000-0000-0000-000000000001','AP','00000000-0000-0000-0000-000000000048') ON CONFLICT DO NOTHING;
INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES
 ('00000000-0000-0000-0000-000000000001','SUPPLIER_BILL','SB-'),
 ('00000000-0000-0000-0000-000000000001','SUPPLIER_PAYMENT','SP-') ON CONFLICT DO NOTHING;
COMMIT;
