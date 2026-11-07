-- Synthetic fixtures only. Never included in Flyway or application startup.
INSERT INTO identity.company(id,code,name) VALUES
 (pg_temp.demo_id('company-a'),'HTT-DEMO-A','[DEMO] Company A'),
 (pg_temp.demo_id('company-b'),'HTT-DEMO-B','[DEMO] Company B');

INSERT INTO identity.user_account(id,display_name)
SELECT pg_temp.demo_id(actor),'[DEMO] ' || actor
FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) AS actors(actor);

INSERT INTO identity.company_member(company_id,user_id,member_kind)
SELECT pg_temp.demo_id(company),pg_temp.demo_id(actor),kind
FROM (VALUES ('company-a','manager','MANAGEMENT'),('company-a','sales','SALES'),
 ('company-a','customer-a','CUSTOMER'),('company-b','customer-b','CUSTOMER')) AS members(company,actor,kind);

INSERT INTO crm.customer(id,company_id,code,business_name,email)
SELECT pg_temp.demo_id(customer),pg_temp.demo_id(company),code,name,email
FROM (VALUES ('customer-a','company-a','DEMO-CUSTOMER-A','[DEMO] Customer A','customer-a@example.invalid'),
 ('customer-b','company-b','DEMO-CUSTOMER-B','[DEMO] Customer B','customer-b@example.invalid'))
 AS customers(customer,company,code,name,email);

INSERT INTO crm.customer_branch(id,company_id,customer_id,code,name,address_line1,city,state,postcode,country_code)
SELECT pg_temp.demo_id(branch),pg_temp.demo_id(company),pg_temp.demo_id(customer),code,name,
 '[DEMO] Synthetic address - not for delivery','Melbourne','VIC','3000','AU'
FROM (VALUES ('branch-a1','company-a','customer-a','DEMO-A1','[DEMO] A authorised branch'),
 ('branch-a2','company-a','customer-a','DEMO-A2','[DEMO] A unassigned branch'),
 ('branch-b1','company-b','customer-b','DEMO-B1','[DEMO] B authorised branch'))
 AS branches(branch,company,customer,code,name);

INSERT INTO identity.role(company_id,id,code)
SELECT pg_temp.demo_id(company),pg_temp.demo_id(actor || '-role'),'DEMO-' || upper(actor)
FROM (VALUES ('company-a','manager'),('company-a','sales'),('company-a','customer-a'),
 ('company-b','customer-b')) AS roles(company,actor);

INSERT INTO identity.member_role(company_id,user_id,role_id)
SELECT company_id,user_id,pg_temp.demo_id(actor || '-role')
FROM (VALUES ('manager'),('sales'),('customer-a'),('customer-b')) AS actors(actor)
JOIN identity.company_member ON user_id=pg_temp.demo_id(actor);

INSERT INTO identity.role_permission(company_id,role_id,permission_code)
SELECT role.company_id,role.id,p.permission
FROM identity.role role
JOIN (VALUES ('manager','branch:read'),('manager','customer:read'),('manager','order:read'),
 ('manager','order:create'),('sales','branch:read'),('sales','customer:read'),('sales','order:read'),
 ('customer-a','branch:read'),('customer-b','branch:read')) AS p(actor,permission)
 ON role.id=pg_temp.demo_id(p.actor || '-role');

INSERT INTO identity.resource_grant(id,company_id,user_id,scope,customer_id)
SELECT pg_temp.demo_id(actor || '-grant'),pg_temp.demo_id(company),pg_temp.demo_id(actor),scope,
 CASE WHEN customer IS NULL THEN NULL ELSE pg_temp.demo_id(customer) END
FROM (VALUES ('manager','company-a','COMPANY',NULL),('sales','company-a','BRANCH','customer-a'),
 ('customer-a','company-a','BRANCH','customer-a'),('customer-b','company-b','BRANCH','customer-b'))
 AS grants(actor,company,scope,customer);

INSERT INTO identity.grant_branch(grant_id,company_id,customer_id,branch_id)
SELECT pg_temp.demo_id(actor || '-grant'),pg_temp.demo_id(company),pg_temp.demo_id(customer),pg_temp.demo_id(branch)
FROM (VALUES ('sales','company-a','customer-a','branch-a1'),
 ('customer-a','company-a','customer-a','branch-a1'),('customer-b','company-b','customer-b','branch-b1'))
 AS branches(actor,company,customer,branch);
