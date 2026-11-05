BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);
INSERT INTO core.companies (id,name) VALUES ('00000000-0000-0000-0000-000000000001','Synthetic HTT');
INSERT INTO identity.users (id,issuer,subject,display_name) VALUES
 ('00000000-0000-0000-0000-000000000002','https://localhost:15443','test-employee','Synthetic Employee'),
 ('00000000-0000-0000-0000-000000000005','https://localhost:15443','test-portal','Synthetic Portal');
SELECT set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);
INSERT INTO identity.memberships (id,company_id,user_id) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');
INSERT INTO identity.roles (id,company_id,code,name) VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','MAP_TEST','Synthetic Test');
INSERT INTO identity.membership_roles (company_id,membership_id,role_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004');
INSERT INTO identity.portal_principals(user_id) VALUES ('00000000-0000-0000-0000-000000000005');
INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004',p FROM unnest(ARRAY['accounting.banks.use','accounting.read','accounting.receipts.read','accounting.receipts.write','accounting.receivables.read','audit.read','catalog.read','catalog.write','crm.boards.write','crm.collaboration.read','crm.maps.read','crm.notes.write','crm.visits.write','customers.all','customers.read','customers.write','documents.attachments.write','documents.files.read','foundation.read','inventory.dispatch','inventory.opening.write','inventory.picks.read','inventory.picks.write','inventory.read','pricing.read','purchase.advances.apply','purchase.advances.unapply','purchase.ap.read','purchase.bills.post','purchase.bills.read','purchase.bills.variance.post','purchase.cost.read','purchase.grni.read','purchase.orders.close','purchase.orders.confirm','purchase.orders.read','purchase.orders.write','purchase.payments.post','purchase.payments.read','purchase.payments.reapply','purchase.payments.reverse','purchase.receipts.read','purchase.receipts.write','sales.credit.read','sales.invoices.read','sales.invoices.write','sales.orders.cancel','sales.orders.create','sales.orders.read','sales.quotes.read','sales.quotes.write','warehouses.all']) p;
SELECT identity.seed_business_preferences('00000000-0000-0000-0000-000000000001');
COMMIT;
