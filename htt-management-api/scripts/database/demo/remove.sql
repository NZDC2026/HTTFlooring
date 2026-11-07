-- Only this fixture's identifiers; no CASCADE, TRUNCATE or audit deletion.
-- Any later dependent business data or external identity binding blocks removal atomically.
DELETE FROM identity.grant_branch WHERE grant_id IN
 (SELECT pg_temp.demo_id(actor || '-grant') FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM identity.resource_grant WHERE id IN
 (SELECT pg_temp.demo_id(actor || '-grant') FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM identity.member_role WHERE role_id IN
 (SELECT pg_temp.demo_id(actor || '-role') FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM identity.role_permission WHERE role_id IN
 (SELECT pg_temp.demo_id(actor || '-role') FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM identity.role WHERE id IN
 (SELECT pg_temp.demo_id(actor || '-role') FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM crm.customer_branch WHERE id IN (pg_temp.demo_id('branch-a1'),pg_temp.demo_id('branch-a2'),pg_temp.demo_id('branch-b1'));
DELETE FROM crm.customer WHERE id IN (pg_temp.demo_id('customer-a'),pg_temp.demo_id('customer-b'));
DELETE FROM identity.company_member WHERE user_id IN
 (SELECT pg_temp.demo_id(actor) FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor))
 AND company_id IN (pg_temp.demo_id('company-a'),pg_temp.demo_id('company-b'));
DELETE FROM identity.user_account WHERE id IN
 (SELECT pg_temp.demo_id(actor) FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) a(actor));
DELETE FROM identity.company WHERE id IN (pg_temp.demo_id('company-a'),pg_temp.demo_id('company-b'));
