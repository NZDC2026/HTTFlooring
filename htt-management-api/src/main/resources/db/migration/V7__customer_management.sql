-- Additive: external business identifiers do not replace existing UUID authorization keys.
ALTER TABLE crm.customer
 ADD COLUMN business_id varchar(100), ADD COLUMN trading_name varchar(120),
 ADD COLUMN business_type varchar(40) NOT NULL DEFAULT 'Other',
 ADD COLUMN business_status varchar(16) NOT NULL DEFAULT 'ACTIVE',
 ADD COLUMN website varchar(200), ADD COLUMN pricing_tier varchar(16) NOT NULL DEFAULT 'STANDARD',
 ADD COLUMN credit_hold boolean NOT NULL DEFAULT false,
 ADD COLUMN credit_limit numeric(19,2) NOT NULL DEFAULT 0 CHECK(credit_limit>=0),
 ADD COLUMN currency varchar(3),
 ADD COLUMN payment_terms_type varchar(16) NOT NULL DEFAULT 'COD',
 ADD COLUMN payment_terms_days integer NOT NULL DEFAULT 0,
 ADD COLUMN internal_notes varchar(500);
UPDATE crm.customer SET business_id='cus_'||id::text;
ALTER TABLE crm.customer ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE crm.customer ALTER COLUMN business_id SET DEFAULT ('cus_'||gen_random_uuid()::text);
ALTER TABLE crm.customer ADD UNIQUE(business_id);
ALTER TABLE crm.customer ADD CHECK(business_status IN ('ACTIVE','ON_HOLD','INACTIVE')),
 ADD CHECK(business_type IN ('Flooring Retailer','Builder','Developer','Designer','Architect','Installer','End Customer','Other')),
 ADD CHECK(pricing_tier IN ('STANDARD','VIP','VVIP','CONTAINER')),
 ADD CHECK(business_type='Flooring Retailer' OR pricing_tier='STANDARD'),
 ADD CHECK((payment_terms_type='COD' AND payment_terms_days=0)
 OR (payment_terms_type='DAYS' AND payment_terms_days BETWEEN 0 AND 365)
 OR (payment_terms_type='DAY_OF_MONTH' AND payment_terms_days BETWEEN 1 AND 31));
-- Preserve legacy fields without guessing missing currency, splitting names, or changing ABNs.
ALTER TABLE crm.customer ADD CONSTRAINT customer_new_field_limits CHECK
 (length(business_name)<=120 AND (abn IS NULL OR abn ~ '^[0-9]{11}$') AND length(phone)<=40) NOT VALID;

CREATE TABLE crm.customer_workspace (
 company_id uuid PRIMARY KEY REFERENCES identity.company(id),
 region varchar(8) NOT NULL CHECK(region ~ '^[A-Z]{2,8}$'),
 currency varchar(3) NOT NULL CHECK(currency ~ '^[A-Z]{3}$'),
 next_number bigint NOT NULL DEFAULT 1 CHECK(next_number>0)
);
COMMENT ON TABLE crm.customer_workspace IS 'Explicit trusted company configuration; no region inference from client headers or addresses.';

CREATE TABLE crm.customer_billing_address (
 company_id uuid NOT NULL, customer_id uuid PRIMARY KEY,
 address_line1 varchar(160) NOT NULL CHECK(btrim(address_line1)<>''), address_line2 varchar(160),
 suburb varchar(100) NOT NULL CHECK(btrim(suburb)<>''), state varchar(50) NOT NULL CHECK(btrim(state)<>''),
 postcode varchar(20) NOT NULL CHECK(btrim(postcode)<>''), country varchar(100) NOT NULL CHECK(btrim(country)<>''),
 FOREIGN KEY(company_id,customer_id) REFERENCES crm.customer(company_id,id)
);
CREATE TABLE crm.customer_location (
 id uuid PRIMARY KEY, business_id varchar(100) NOT NULL UNIQUE,
 company_id uuid NOT NULL, customer_id uuid NOT NULL, name varchar(100) NOT NULL CHECK(btrim(name)<>''),
 address_line1 varchar(160) NOT NULL CHECK(btrim(address_line1)<>''), address_line2 varchar(160),
 suburb varchar(100) NOT NULL CHECK(btrim(suburb)<>''), state varchar(50) NOT NULL CHECK(btrim(state)<>''),
 postcode varchar(20) NOT NULL CHECK(btrim(postcode)<>''), country varchar(100) NOT NULL CHECK(btrim(country)<>''),
 phone varchar(40), is_primary boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id,customer_id,id), FOREIGN KEY(company_id,customer_id) REFERENCES crm.customer(company_id,id)
);
CREATE UNIQUE INDEX customer_location_primary ON crm.customer_location(customer_id) WHERE is_primary;
ALTER TABLE crm.customer_contact ALTER COLUMN name TYPE varchar(241);
ALTER TABLE crm.customer_contact
 ADD COLUMN business_id varchar(100), ADD COLUMN first_name varchar(160), ADD COLUMN last_name varchar(80),
 ADD COLUMN job_title varchar(100), ADD COLUMN mobile varchar(40), ADD COLUMN location_id uuid,
 ADD COLUMN is_primary boolean NOT NULL DEFAULT false, ADD COLUMN is_accounting boolean NOT NULL DEFAULT false;
UPDATE crm.customer_contact SET business_id='con_'||id::text;
ALTER TABLE crm.customer_contact ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE crm.customer_contact ALTER COLUMN business_id SET DEFAULT ('con_'||gen_random_uuid()::text);
ALTER TABLE crm.customer_contact ADD UNIQUE(business_id), ADD UNIQUE(company_id,customer_id,id),
 ADD FOREIGN KEY(company_id,customer_id,location_id) REFERENCES crm.customer_location(company_id,customer_id,id);
CREATE UNIQUE INDEX customer_contact_primary ON crm.customer_contact(customer_id) WHERE is_primary;
CREATE UNIQUE INDEX customer_contact_accounting ON crm.customer_contact(customer_id) WHERE is_accounting;

ALTER TABLE crm.customer_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.customer_billing_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.customer_location ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_workspace USING(identity.has_company_access(company_id));
CREATE POLICY company_scope ON crm.customer_billing_address USING(identity.has_company_access(company_id));
CREATE POLICY company_scope ON crm.customer_location USING(identity.has_company_access(company_id));
GRANT SELECT,INSERT,UPDATE ON crm.customer,crm.customer_contact,crm.customer_location,crm.customer_billing_address TO "${runtime_role}";
GRANT DELETE ON crm.customer_billing_address TO "${runtime_role}";
GRANT SELECT ON crm.customer_workspace TO "${runtime_role}";
GRANT UPDATE(next_number) ON crm.customer_workspace TO "${runtime_role}";

INSERT INTO identity.permission(code) VALUES ('customer:create'),('customer:update'),('customer:status'),
 ('customer:account:create'),('customer:account:status'),('customer:account:reset');

CREATE TABLE platform.customer_change_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 company_id uuid NOT NULL, customer_id uuid NOT NULL, actor_id uuid NOT NULL REFERENCES identity.user_account(id),
 action varchar(100) NOT NULL, version bigint NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(company_id,customer_id) REFERENCES crm.customer(company_id,id)
);
ALTER TABLE platform.customer_change_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.customer_change_audit USING(identity.has_company_access(company_id));
GRANT INSERT ON platform.customer_change_audit TO "${runtime_role}";
GRANT USAGE ON SEQUENCE platform.customer_change_audit_id_seq TO "${runtime_role}";
