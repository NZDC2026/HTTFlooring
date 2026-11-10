-- Reviewed, versioned SQL is the migration source of truth; never edit an applied file.
CREATE SCHEMA core;
CREATE SCHEMA identity;
CREATE SCHEMA crm;
CREATE SCHEMA catalog;
CREATE SCHEMA pricing;
CREATE SCHEMA accounting;
CREATE SCHEMA platform;
REVOKE ALL ON SCHEMA core, identity, crm, catalog, pricing, accounting, platform FROM PUBLIC;

CREATE TABLE core.companies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
 abn varchar(11), country char(2) NOT NULL DEFAULT 'AU' CHECK(country = 'AU'),
 base_currency char(3) NOT NULL DEFAULT 'AUD' CHECK(base_currency = 'AUD'),
 timezone text NOT NULL DEFAULT 'Australia/Sydney', financial_year_start_month int NOT NULL DEFAULT 7 CHECK(financial_year_start_month BETWEEN 1 AND 12),
 gst_basis text NOT NULL DEFAULT 'NON_CASH' CHECK(gst_basis IN ('CASH','NON_CASH')),
 created_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version > 0)
);
CREATE TABLE identity.users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issuer text NOT NULL, subject text NOT NULL,
 display_name text NOT NULL, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(issuer,subject)
);
CREATE TABLE identity.permissions (code text PRIMARY KEY, description text NOT NULL);
INSERT INTO identity.permissions VALUES
 ('foundation.read','Read company foundation data'),('customers.read','Read assigned customers'),
 ('customers.write','Maintain customer master data'),('customers.all','Access all customers in company'),
 ('catalog.read','Read products and units'),('catalog.write','Maintain products and units'),
 ('pricing.read','Resolve prices'),('pricing.write','Maintain pricing rules'),
 ('inventory.cost.read','Read confidential product cost'),('accounting.read','Read accounts and tax setup'),
 ('identity.manage','Manage memberships and roles'),('audit.read','Read audit history');

CREATE FUNCTION core.current_company() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('htt.company_id',true),'')::uuid
$$;
CREATE FUNCTION core.current_actor() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('htt.actor_id',true),'')::uuid
$$;
CREATE FUNCTION core.valid_abn(value text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE total int := -10; weights int[] := ARRAY[10,1,3,5,7,9,11,13,15,17,19]; i int;
BEGIN
 IF value IS NULL THEN RETURN true; END IF;
 IF value !~ '^[1-9][0-9]{10}$' THEN RETURN false; END IF;
 FOR i IN 1..11 LOOP total := total + substring(value,i,1)::int * weights[i]; END LOOP;
 RETURN total % 89 = 0;
END $$;
ALTER TABLE core.companies ADD CONSTRAINT company_abn_valid CHECK(core.valid_abn(abn));
CREATE FUNCTION core.validate_timezone() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=NEW.timezone) THEN
  RAISE EXCEPTION 'Unknown IANA timezone' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER company_timezone BEFORE INSERT OR UPDATE ON core.companies FOR EACH ROW EXECUTE FUNCTION core.validate_timezone();
CREATE TABLE identity.memberships (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES identity.users(id), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,user_id)
);
CREATE TABLE identity.roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE identity.membership_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, role_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,role_id) REFERENCES identity.roles(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,role_id)
);
CREATE TABLE identity.role_permissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 role_id uuid NOT NULL, permission_code text NOT NULL REFERENCES identity.permissions(code),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,role_id) REFERENCES identity.roles(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,role_id,permission_code)
);
CREATE TABLE core.company_branches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, timezone text NOT NULL DEFAULT 'Australia/Sydney',
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE core.regions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE catalog.warehouses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, region_id uuid, kind text NOT NULL DEFAULT 'SELLABLE' CHECK(kind IN ('SELLABLE','QUARANTINE','TRANSIT')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code),FOREIGN KEY(company_id,region_id) REFERENCES core.regions(company_id,id) ON DELETE RESTRICT
);
CREATE TABLE identity.warehouse_scopes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, warehouse_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,warehouse_id)
);
CREATE TABLE crm.parties (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 legal_name text NOT NULL CHECK(length(legal_name) BETWEEN 1 AND 200), trading_name text, abn varchar(11) CHECK(core.valid_abn(abn)), country char(2) NOT NULL DEFAULT 'AU',
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
);
CREATE TABLE crm.customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, code text NOT NULL, status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ON_HOLD','INACTIVE')), credit_limit numeric(20,2) NOT NULL DEFAULT 0 CHECK(credit_limit>=0), payment_terms_days int NOT NULL DEFAULT 30 CHECK(payment_terms_days BETWEEN 0 AND 365),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,code),UNIQUE(company_id,party_id)
);
CREATE TABLE crm.suppliers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, code text NOT NULL, payment_terms_days int NOT NULL DEFAULT 30 CHECK(payment_terms_days BETWEEN 0 AND 365),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,code),UNIQUE(company_id,party_id)
);
CREATE TABLE crm.customer_branches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, code text NOT NULL, name text NOT NULL, address_line1 text NOT NULL, suburb text, state text, postcode text, country char(2) NOT NULL DEFAULT 'AU', latitude numeric(10,7), longitude numeric(10,7),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,customer_id,code),CHECK(latitude BETWEEN -90 AND 90),CHECK(longitude BETWEEN -180 AND 180)
);
CREATE TABLE crm.contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, name text NOT NULL, email text, phone text, job_title text, is_accounting boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT
);
CREATE TABLE crm.contact_branch_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 contact_id uuid NOT NULL, customer_branch_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,contact_id) REFERENCES crm.contacts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,contact_id,customer_branch_id)
);
CREATE TABLE identity.customer_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, customer_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,customer_id)
);
CREATE TABLE identity.customer_user_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES identity.users(id), customer_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,user_id,customer_id)
);
CREATE TABLE identity.customer_user_branch_scopes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 grant_id uuid NOT NULL, customer_branch_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,grant_id) REFERENCES identity.customer_user_grants(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,grant_id,customer_branch_id)
);
CREATE TABLE crm.customer_credit_exposures (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, receivable numeric(20,2) NOT NULL DEFAULT 0, unbilled_orders numeric(20,2) NOT NULL DEFAULT 0 CHECK(unbilled_orders>=0), available_advances numeric(20,2) NOT NULL DEFAULT 0 CHECK(available_advances>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,customer_id)
);
CREATE TABLE catalog.uoms (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE accounting.accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, kind text NOT NULL CHECK(kind IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')), control_kind text CHECK(control_kind IN ('AR','AP','INVENTORY','GRNI','BANK','GST')), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE accounting.tax_codes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, category text NOT NULL CHECK(category IN ('TAXABLE','GST_FREE','INPUT_TAXED','OUT_OF_SCOPE')), report_mapping text,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE accounting.tax_rates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 tax_code_id uuid NOT NULL, rate numeric(9,6) NOT NULL CHECK(rate BETWEEN 0 AND 1), effective_from date NOT NULL, effective_to date,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,CHECK(effective_to IS NULL OR effective_to>effective_from),UNIQUE(company_id,tax_code_id,effective_from)
);
CREATE TABLE accounting.tax_account_mappings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 tax_code_id uuid NOT NULL, output_account_id uuid, input_account_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,output_account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,input_account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,tax_code_id)
);
CREATE TABLE accounting.account_mappings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 purpose text NOT NULL, account_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,purpose)
);
CREATE TABLE catalog.products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 sku text NOT NULL, name text NOT NULL CHECK(length(name) BETWEEN 1 AND 200), item_type text NOT NULL DEFAULT 'STOCK' CHECK(item_type IN ('STOCK','NON_STOCK','SERVICE')), status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')), base_uom_id uuid NOT NULL, tax_code_id uuid NOT NULL, whole_packs boolean NOT NULL DEFAULT true, buy_enabled boolean NOT NULL DEFAULT true, sell_enabled boolean NOT NULL DEFAULT true, reorder_point numeric(20,6) NOT NULL DEFAULT 0 CHECK(reorder_point>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,base_uom_id) REFERENCES catalog.uoms(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,sku)
);
CREATE TABLE catalog.product_units (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 product_id uuid NOT NULL, uom_id uuid NOT NULL, conversion_to_base numeric(20,6) NOT NULL CHECK(conversion_to_base>0), quantity_step numeric(20,6) NOT NULL DEFAULT 1 CHECK(quantity_step>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,uom_id) REFERENCES catalog.uoms(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,product_id,uom_id)
);
CREATE TABLE pricing.price_lists (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, currency char(3) NOT NULL DEFAULT 'AUD', inclusive boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
);
CREATE TABLE pricing.price_list_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 price_list_id uuid NOT NULL, product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0), effective_from timestamptz NOT NULL, effective_to timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,price_list_id) REFERENCES pricing.price_lists(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,CHECK(effective_to IS NULL OR effective_to>effective_from)
);
CREATE TABLE pricing.customer_price_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, product_unit_id uuid NOT NULL, method text NOT NULL CHECK(method IN ('FIXED_PRICE','DISCOUNT_PERCENT')), fixed_price numeric(20,8), discount_percent numeric(9,6), effective_from timestamptz NOT NULL, effective_to timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,CHECK((method='FIXED_PRICE' AND fixed_price IS NOT NULL AND fixed_price>=0 AND discount_percent IS NULL) OR (method='DISCOUNT_PERCENT' AND fixed_price IS NULL AND discount_percent IS NOT NULL AND discount_percent BETWEEN 0 AND 100)),CHECK(effective_to IS NULL OR effective_to>effective_from)
);
CREATE TABLE pricing.promotions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 name text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),CHECK(ends_at>starts_at)
);
CREATE TABLE pricing.promotion_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 promotion_id uuid NOT NULL, product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,promotion_id) REFERENCES pricing.promotions(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,promotion_id,product_unit_id)
);
CREATE TABLE pricing.price_floor_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,product_unit_id)
);
CREATE TABLE accounting.fiscal_years (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 label text NOT NULL, starts_on date NOT NULL, ends_on date NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),CHECK(ends_on>starts_on),UNIQUE(company_id,label)
);
CREATE TABLE accounting.periods (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 fiscal_year_id uuid NOT NULL, starts_on date NOT NULL, ends_on date NOT NULL, state text NOT NULL DEFAULT 'OPEN' CHECK(state IN ('OPEN','CLOSED')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,fiscal_year_id) REFERENCES accounting.fiscal_years(company_id,id) ON DELETE RESTRICT,CHECK(ends_on>starts_on),UNIQUE(company_id,starts_on)
);
CREATE TABLE platform.documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_type text NOT NULL, number text, business_date date NOT NULL, state text NOT NULL DEFAULT 'DRAFT' CHECK(state IN ('DRAFT','CONFIRMED','POSTED','CANCELLED','REVERSED')), deleted_at timestamptz, deleted_by uuid REFERENCES identity.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,document_type,number)
);
CREATE TABLE platform.document_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_id uuid NOT NULL, line_no int NOT NULL CHECK(line_no>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,document_id,line_no)
);
CREATE TABLE platform.document_sequences (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_type text NOT NULL, prefix text NOT NULL, next_value bigint NOT NULL DEFAULT 1 CHECK(next_value>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,document_type)
);
CREATE TABLE accounting.posting_batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 source_document_id uuid NOT NULL, source_version bigint NOT NULL CHECK(source_version>0), posting_kind text NOT NULL, reverses_batch_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,reverses_batch_id) REFERENCES accounting.posting_batches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,source_document_id,source_version,posting_kind)
);
CREATE TABLE accounting.journal_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 posting_batch_id uuid NOT NULL, posting_date date NOT NULL, description text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,posting_batch_id) REFERENCES accounting.posting_batches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,posting_batch_id)
);
CREATE TABLE accounting.journal_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 journal_entry_id uuid NOT NULL, account_id uuid NOT NULL, party_id uuid, debit numeric(20,2) NOT NULL DEFAULT 0, credit numeric(20,2) NOT NULL DEFAULT 0, currency char(3) NOT NULL DEFAULT 'AUD' CHECK(currency='AUD'), source_line_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,source_line_id) REFERENCES platform.document_lines(company_id,id) ON DELETE RESTRICT,CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0))
);
CREATE TABLE platform.audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 actor_id uuid NOT NULL REFERENCES identity.users(id), action text NOT NULL, entity_type text NOT NULL, entity_id uuid NOT NULL, request_id text NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
);
CREATE TABLE platform.idempotency_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 actor_id uuid NOT NULL REFERENCES identity.users(id), route text NOT NULL, key text NOT NULL CHECK(length(key) BETWEEN 1 AND 128), request_hash text NOT NULL, response_json jsonb NOT NULL, status_code int NOT NULL CHECK(status_code BETWEEN 200 AND 299),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,actor_id,route,key)
);
CREATE TABLE platform.outbox_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 event_type text NOT NULL, payload jsonb NOT NULL, attempts int NOT NULL DEFAULT 0 CHECK(attempts>=0), available_at timestamptz NOT NULL DEFAULT now(), lease_token uuid, lease_until timestamptz, completed_at timestamptz, failed_at timestamptz, last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
);
CREATE TABLE platform.files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 object_key text NOT NULL, content_type text NOT NULL, size_bytes bigint NOT NULL CHECK(size_bytes>0), sha256 text, state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','VERIFIED','REJECTED')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,object_key)
);
CREATE TABLE platform.file_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 file_id uuid NOT NULL, document_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,file_id,document_id)
);

-- Reject overlapping effective rules under concurrency (GiST exclusion is database-enforced).
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE pricing.price_list_items ADD CONSTRAINT price_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,price_list_id WITH =,product_unit_id WITH =,tstzrange(effective_from,effective_to,'[)') WITH &&);
ALTER TABLE pricing.customer_price_rules ADD CONSTRAINT customer_price_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,customer_id WITH =,product_unit_id WITH =,tstzrange(effective_from,effective_to,'[)') WITH &&);
ALTER TABLE accounting.tax_rates ADD CONSTRAINT tax_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,tax_code_id WITH =,daterange(effective_from,effective_to,'[)') WITH &&);
ALTER TABLE accounting.periods ADD CONSTRAINT period_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,daterange(starts_on,ends_on,'[)') WITH &&);
ALTER TABLE accounting.fiscal_years ADD CONSTRAINT fiscal_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,daterange(starts_on,ends_on,'[)') WITH &&);

CREATE FUNCTION core.touch_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.version:=OLD.version+1; NEW.updated_at:=clock_timestamp(); RETURN NEW; END $$;
CREATE FUNCTION platform.reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Append-only record; post a reversal instead' USING ERRCODE='23514'; END $$;
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.memberships FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.memberships USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.memberships(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.roles FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.roles USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.roles(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.membership_roles FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.membership_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.membership_roles USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.membership_roles(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.role_permissions FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.role_permissions USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.role_permissions(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON core.company_branches FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE core.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.company_branches FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON core.company_branches USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON core.company_branches(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON core.regions FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE core.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.regions FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON core.regions USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON core.regions(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON catalog.warehouses FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE catalog.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.warehouses FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.warehouses USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON catalog.warehouses(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.warehouse_scopes FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.warehouse_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.warehouse_scopes USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.warehouse_scopes(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.parties FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.parties FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.parties USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.parties(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.customers FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.customers FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customers USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.customers(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.suppliers FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.suppliers FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.suppliers USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.suppliers(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.customer_branches FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.customer_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.customer_branches FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_branches USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.customer_branches(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.contacts FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.contacts FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.contacts USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.contacts(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.contact_branch_links FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.contact_branch_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.contact_branch_links FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.contact_branch_links USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.contact_branch_links(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.customer_assignments FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.customer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.customer_assignments USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.customer_assignments(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.customer_user_grants FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.customer_user_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.customer_user_grants USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.customer_user_grants(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON identity.customer_user_branch_scopes FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE identity.customer_user_branch_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_scope ON identity.customer_user_branch_scopes USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON identity.customer_user_branch_scopes(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON crm.customer_credit_exposures FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE crm.customer_credit_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.customer_credit_exposures FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_credit_exposures USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON crm.customer_credit_exposures(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON catalog.uoms FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE catalog.uoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.uoms FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.uoms USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON catalog.uoms(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.accounts FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.accounts USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.accounts(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.tax_codes FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.tax_codes FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.tax_codes USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.tax_codes(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.tax_rates FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.tax_rates FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.tax_rates USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.tax_rates(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.tax_account_mappings FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.tax_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.tax_account_mappings FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.tax_account_mappings USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.tax_account_mappings(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.account_mappings FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.account_mappings FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.account_mappings USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.account_mappings(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON catalog.products FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.products FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.products USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON catalog.products(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON catalog.product_units FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE catalog.product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_units FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.product_units USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON catalog.product_units(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.price_lists FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.price_lists FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.price_lists USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.price_lists(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.price_list_items FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.price_list_items FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.price_list_items USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.price_list_items(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.customer_price_rules FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.customer_price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.customer_price_rules FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.customer_price_rules USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.customer_price_rules(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.promotions FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.promotions FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.promotions USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.promotions(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.promotion_items FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.promotion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.promotion_items FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.promotion_items USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.promotion_items(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON pricing.price_floor_rules FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE pricing.price_floor_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing.price_floor_rules FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON pricing.price_floor_rules USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON pricing.price_floor_rules(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.fiscal_years FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.fiscal_years FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.fiscal_years USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.fiscal_years(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.periods FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.periods FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.periods USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.periods(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.documents FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.documents USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.documents(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.document_lines FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.document_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.document_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.document_lines USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.document_lines(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.document_sequences FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.document_sequences FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.document_sequences USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.document_sequences(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.posting_batches FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE accounting.posting_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.posting_batches FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.posting_batches USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.posting_batches(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.journal_entries FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE accounting.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.journal_entries FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.journal_entries USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.journal_entries(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.journal_lines FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE accounting.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.journal_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.journal_lines USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON accounting.journal_lines(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE platform.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.audit_events USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.audit_events(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON platform.idempotency_requests FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE platform.idempotency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.idempotency_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.idempotency_requests USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.idempotency_requests(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.outbox_events FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.outbox_events FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.outbox_events USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.outbox_events(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.files FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.files FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.files USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.files(company_id);
CREATE TRIGGER touch_version BEFORE UPDATE ON platform.file_links FOR EACH ROW EXECUTE FUNCTION core.touch_version();
ALTER TABLE platform.file_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.file_links FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.file_links USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.file_links(company_id);
ALTER TABLE core.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON core.companies USING(id=core.current_company()) WITH CHECK(id=core.current_company());

-- Every composite FK has a company-prefixed index, even where the UNIQUE index uses another ordering.
DO $$ DECLARE r record; column_names text; BEGIN
 FOR r IN SELECT c.conrelid::regclass AS relation,c.conname,c.conkey FROM pg_constraint c
 JOIN pg_namespace n ON n.oid=c.connamespace WHERE c.contype='f' AND n.nspname IN ('identity','core','crm','catalog','pricing','accounting','platform') LOOP
  SELECT string_agg(quote_ident(a.attname),',' ORDER BY u.ord) INTO column_names
  FROM unnest(r.conkey) WITH ORDINALITY u(num,ord) JOIN pg_attribute a ON a.attrelid=r.relation AND a.attnum=u.num;
  EXECUTE format('CREATE INDEX %I ON %s (%s)', 'fk_'||substr(md5(r.relation::text||r.conname),1,20),r.relation,column_names);
 END LOOP;
END $$;
CREATE INDEX customer_search ON crm.customers(company_id,code);
CREATE INDEX party_search ON crm.parties(company_id,lower(legal_name));
CREATE INDEX product_search ON catalog.products(company_id,sku);
CREATE INDEX outbox_pending ON platform.outbox_events(available_at,created_at) WHERE completed_at IS NULL AND failed_at IS NULL;
CREATE INDEX journal_report ON accounting.journal_entries(company_id,posting_date);
