# 数据库目录（阶段A及B增量）

SQL迁移是唯一权威；所有业务外键必须同company。身份目录/Outbox受限definer函数边界见stage-a.md。001/002基础部分为53张；后续增量至016共113张业务/基础表及16个迁移，另有public.htt_schema_history。以下保留基础目录及各批增量说明。

## 001_foundation.sql

### core.companies

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
 abn varchar(11), country char(2) NOT NULL DEFAULT 'AU' CHECK(country = 'AU'),
 base_currency char(3) NOT NULL DEFAULT 'AUD' CHECK(base_currency = 'AUD'),
 timezone text NOT NULL DEFAULT 'Australia/Sydney', financial_year_start_month int NOT NULL DEFAULT 7 CHECK(financial_year_start_month BETWEEN 1 AND 12),
 gst_basis text NOT NULL DEFAULT 'NON_CASH' CHECK(gst_basis IN ('CASH','NON_CASH')),
 created_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version > 0)
```

### identity.users

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issuer text NOT NULL, subject text NOT NULL,
 display_name text NOT NULL, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(issuer,subject)
```

### identity.permissions

```sql
code text PRIMARY KEY, description text NOT NULL);
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
```

### identity.roles

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### identity.membership_roles

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, role_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,role_id) REFERENCES identity.roles(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,role_id)
```

### identity.role_permissions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 role_id uuid NOT NULL, permission_code text NOT NULL REFERENCES identity.permissions(code),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,role_id) REFERENCES identity.roles(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,role_id,permission_code)
```

### core.company_branches

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, timezone text NOT NULL DEFAULT 'Australia/Sydney',
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### core.regions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### catalog.warehouses

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, region_id uuid, kind text NOT NULL DEFAULT 'SELLABLE' CHECK(kind IN ('SELLABLE','QUARANTINE','TRANSIT')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code),FOREIGN KEY(company_id,region_id) REFERENCES core.regions(company_id,id) ON DELETE RESTRICT
```

### identity.warehouse_scopes

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, warehouse_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,warehouse_id)
```

### crm.parties

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 legal_name text NOT NULL CHECK(length(legal_name) BETWEEN 1 AND 200), trading_name text, abn varchar(11) CHECK(core.valid_abn(abn)), country char(2) NOT NULL DEFAULT 'AU',
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
```

### crm.customers

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, code text NOT NULL, status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ON_HOLD','INACTIVE')), credit_limit numeric(20,2) NOT NULL DEFAULT 0 CHECK(credit_limit>=0), payment_terms_days int NOT NULL DEFAULT 30 CHECK(payment_terms_days BETWEEN 0 AND 365),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,code),UNIQUE(company_id,party_id)
```

### crm.suppliers

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, code text NOT NULL, payment_terms_days int NOT NULL DEFAULT 30 CHECK(payment_terms_days BETWEEN 0 AND 365),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,code),UNIQUE(company_id,party_id)
```

### crm.customer_branches

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, code text NOT NULL, name text NOT NULL, address_line1 text NOT NULL, suburb text, state text, postcode text, country char(2) NOT NULL DEFAULT 'AU', latitude numeric(10,7), longitude numeric(10,7),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,customer_id,code),CHECK(latitude BETWEEN -90 AND 90),CHECK(longitude BETWEEN -180 AND 180)
```

### crm.contacts

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 party_id uuid NOT NULL, name text NOT NULL, email text, phone text, job_title text, is_accounting boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT
```

### crm.contact_branch_links

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 contact_id uuid NOT NULL, customer_branch_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,contact_id) REFERENCES crm.contacts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,contact_id,customer_branch_id)
```

### identity.customer_assignments

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 membership_id uuid NOT NULL, customer_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,membership_id) REFERENCES identity.memberships(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,membership_id,customer_id)
```

### identity.customer_user_grants

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES identity.users(id), customer_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,user_id,customer_id)
```

### identity.customer_user_branch_scopes

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 grant_id uuid NOT NULL, customer_branch_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,grant_id) REFERENCES identity.customer_user_grants(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,grant_id,customer_branch_id)
```

### crm.customer_credit_exposures

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, receivable numeric(20,2) NOT NULL DEFAULT 0, unbilled_orders numeric(20,2) NOT NULL DEFAULT 0 CHECK(unbilled_orders>=0), available_advances numeric(20,2) NOT NULL DEFAULT 0 CHECK(available_advances>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,customer_id)
```

### catalog.uoms

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### accounting.accounts

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, kind text NOT NULL CHECK(kind IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')), control_kind text CHECK(control_kind IN ('AR','AP','INVENTORY','GRNI','BANK','GST')), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### accounting.tax_codes

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, name text NOT NULL, category text NOT NULL CHECK(category IN ('TAXABLE','GST_FREE','INPUT_TAXED','OUT_OF_SCOPE')), report_mapping text,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### accounting.tax_rates

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 tax_code_id uuid NOT NULL, rate numeric(9,6) NOT NULL CHECK(rate BETWEEN 0 AND 1), effective_from date NOT NULL, effective_to date,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,CHECK(effective_to IS NULL OR effective_to>effective_from),UNIQUE(company_id,tax_code_id,effective_from)
```

### accounting.tax_account_mappings

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 tax_code_id uuid NOT NULL, output_account_id uuid, input_account_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,output_account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,input_account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,tax_code_id)
```

### accounting.account_mappings

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 purpose text NOT NULL, account_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,purpose)
```

### catalog.products

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 sku text NOT NULL, name text NOT NULL CHECK(length(name) BETWEEN 1 AND 200), item_type text NOT NULL DEFAULT 'STOCK' CHECK(item_type IN ('STOCK','NON_STOCK','SERVICE')), status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')), base_uom_id uuid NOT NULL, tax_code_id uuid NOT NULL, whole_packs boolean NOT NULL DEFAULT true, buy_enabled boolean NOT NULL DEFAULT true, sell_enabled boolean NOT NULL DEFAULT true, reorder_point numeric(20,6) NOT NULL DEFAULT 0 CHECK(reorder_point>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,base_uom_id) REFERENCES catalog.uoms(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,sku)
```

### catalog.product_units

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 product_id uuid NOT NULL, uom_id uuid NOT NULL, conversion_to_base numeric(20,6) NOT NULL CHECK(conversion_to_base>0), quantity_step numeric(20,6) NOT NULL DEFAULT 1 CHECK(quantity_step>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,uom_id) REFERENCES catalog.uoms(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,product_id,uom_id)
```

### pricing.price_lists

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 code text NOT NULL, currency char(3) NOT NULL DEFAULT 'AUD', inclusive boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,code)
```

### pricing.price_list_items

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 price_list_id uuid NOT NULL, product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0), effective_from timestamptz NOT NULL, effective_to timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,price_list_id) REFERENCES pricing.price_lists(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,CHECK(effective_to IS NULL OR effective_to>effective_from)
```

### pricing.customer_price_rules

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 customer_id uuid NOT NULL, product_unit_id uuid NOT NULL, method text NOT NULL CHECK(method IN ('FIXED_PRICE','DISCOUNT_PERCENT')), fixed_price numeric(20,8), discount_percent numeric(9,6), effective_from timestamptz NOT NULL, effective_to timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,CHECK((method='FIXED_PRICE' AND fixed_price IS NOT NULL AND fixed_price>=0 AND discount_percent IS NULL) OR (method='DISCOUNT_PERCENT' AND fixed_price IS NULL AND discount_percent IS NOT NULL AND discount_percent BETWEEN 0 AND 100)),CHECK(effective_to IS NULL OR effective_to>effective_from)
```

### pricing.promotions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 name text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),CHECK(ends_at>starts_at)
```

### pricing.promotion_items

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 promotion_id uuid NOT NULL, product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,promotion_id) REFERENCES pricing.promotions(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,promotion_id,product_unit_id)
```

### pricing.price_floor_rules

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 product_unit_id uuid NOT NULL, amount numeric(20,8) NOT NULL CHECK(amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,product_unit_id)
```

### accounting.fiscal_years

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 label text NOT NULL, starts_on date NOT NULL, ends_on date NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),CHECK(ends_on>starts_on),UNIQUE(company_id,label)
```

### accounting.periods

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 fiscal_year_id uuid NOT NULL, starts_on date NOT NULL, ends_on date NOT NULL, state text NOT NULL DEFAULT 'OPEN' CHECK(state IN ('OPEN','CLOSED')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,fiscal_year_id) REFERENCES accounting.fiscal_years(company_id,id) ON DELETE RESTRICT,CHECK(ends_on>starts_on),UNIQUE(company_id,starts_on)
```

### platform.documents

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_type text NOT NULL, number text, business_date date NOT NULL, state text NOT NULL DEFAULT 'DRAFT' CHECK(state IN ('DRAFT','CONFIRMED','POSTED','CANCELLED','REVERSED')), deleted_at timestamptz, deleted_by uuid REFERENCES identity.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,document_type,number)
```

### platform.document_lines

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_id uuid NOT NULL, line_no int NOT NULL CHECK(line_no>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,document_id,line_no)
```

### platform.document_sequences

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 document_type text NOT NULL, prefix text NOT NULL, next_value bigint NOT NULL DEFAULT 1 CHECK(next_value>0),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,document_type)
```

### accounting.posting_batches

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 source_document_id uuid NOT NULL, source_version bigint NOT NULL CHECK(source_version>0), posting_kind text NOT NULL, reverses_batch_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,reverses_batch_id) REFERENCES accounting.posting_batches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,source_document_id,source_version,posting_kind)
```

### accounting.journal_entries

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 posting_batch_id uuid NOT NULL, posting_date date NOT NULL, description text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,posting_batch_id) REFERENCES accounting.posting_batches(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,posting_batch_id)
```

### accounting.journal_lines

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 journal_entry_id uuid NOT NULL, account_id uuid NOT NULL, party_id uuid, debit numeric(20,2) NOT NULL DEFAULT 0, credit numeric(20,2) NOT NULL DEFAULT 0, currency char(3) NOT NULL DEFAULT 'AUD' CHECK(currency='AUD'), source_line_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,source_line_id) REFERENCES platform.document_lines(company_id,id) ON DELETE RESTRICT,CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0))
```

### platform.audit_events

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 actor_id uuid NOT NULL REFERENCES identity.users(id), action text NOT NULL, entity_type text NOT NULL, entity_id uuid NOT NULL, request_id text NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
```

### platform.idempotency_requests

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 actor_id uuid NOT NULL REFERENCES identity.users(id), route text NOT NULL, key text NOT NULL CHECK(length(key) BETWEEN 1 AND 128), request_hash text NOT NULL, response_json jsonb NOT NULL, status_code int NOT NULL CHECK(status_code BETWEEN 200 AND 299),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,actor_id,route,key)
```

### platform.outbox_events

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 event_type text NOT NULL, payload jsonb NOT NULL, attempts int NOT NULL DEFAULT 0 CHECK(attempts>=0), available_at timestamptz NOT NULL DEFAULT now(), lease_token uuid, lease_until timestamptz, completed_at timestamptz, failed_at timestamptz, last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id)
```

### platform.files

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 object_key text NOT NULL, content_type text NOT NULL, size_bytes bigint NOT NULL CHECK(size_bytes>0), sha256 text, state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','VERIFIED','REJECTED')),
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),UNIQUE(company_id,object_key)
```

### platform.file_links

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id) ON DELETE RESTRICT,
 file_id uuid NOT NULL, document_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,file_id,document_id)
```

## 002_controlled_operations.sql

## 003_master_data_extensions.sql

### core.settings

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 key text NOT NULL, value jsonb NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,key)
```

### catalog.product_categories

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 code text NOT NULL, name text NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,code)
```

### catalog.product_media

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 product_id uuid NOT NULL, file_id uuid NOT NULL, sort_order int NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT false,
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,product_id,file_id),
 FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id),
 FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id)
```

### platform.approval_requests

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 document_id uuid NOT NULL, document_version bigint NOT NULL CHECK(document_version>0),
 requested_by uuid NOT NULL REFERENCES identity.users(id), reason text NOT NULL,
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','APPROVED','REJECTED','CANCELLED','STALE')),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id),
 FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id)
```

### platform.approval_actions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 request_id uuid NOT NULL, actor_id uuid NOT NULL REFERENCES identity.users(id),
 action text NOT NULL CHECK(action IN ('APPROVE','REJECT','CANCEL')), reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,id),
 FOREIGN KEY(company_id,request_id) REFERENCES platform.approval_requests(company_id,id)
```

## 004_master_data_maintenance.sql（增量变更）

本次不新增业务表，总数仍53。新增主数据active/status及联系人mobile字段；价格区间约束只限制active记录；保留原角色并补入OFFICE/PROCUREMENT/FINANCE/PRICING_MANAGER及细分权限；增加父级不可变、启用基础单位、AU地址及AUD价目表保护。

001—003的表定义是基线，完整当前结构应叠加004。可执行约束、授权与列清单以src/Htt.Infrastructure/Database/Migrations/004_master_data_maintenance.sql为准。

## 005_quotes_orders_reservations.sql（阶段B）

新增sales.quotes、quote_lines、quote_submissions、orders、order_lines、credit_commitments、credit_decisions，以及inventory.stock_balances、stock_openings、stock_reservations，共10张表；业务/基础表总数63。新增复合行来源约束、公司RLS、冻结快照/订单行、信用/库存投影触发器和订单提交一致性约束。完整可执行定义以005 SQL为准。

platform.documents是编号与版本锚点，报价/订单独立实体；quote_submissions保留每次正式提交内容。stock_balances数量为基础单位，remaining reservation与credit commitment均可追溯。普通API角色无两个余额投影的UPDATE权限，锁定由固定search_path的受限definer函数完成。


## 006_warehouse_fulfilment.sql（阶段B仓库）

新增inventory.picks、pick_lines、stock_values、stock_movements、valuation_openings，共5表；业务/基础表总数68。拣货通过platform.documents取得PK编号与版本；期初估值取得SV编号与版本。出库明细连接pick_line与stock_balance，记录成本及出库后数量/价值。所有新表强制公司RLS和复合公司外键。库存/成本余额仅受控definer命令修改；交接函数核验操作权限及仓库范围，按订单和商品次序加锁，与accounting.post_journal同事务。旧001—005保持不变，既有库存缺成本时保持未估值状态。完整可执行定义以006为准，接口及成本规则见stage-b-warehouse.md。


## 007_sales_invoicing.sql（阶段B开票）

新增sales.invoices、sales.invoice_lines、accounting.receivable_items、accounting.sales_gst_entries四表，总计72张业务/基础表。core.companies增加显式gst_registered（默认false，登记要求有效ABN），防止根据旧报价猜测GST登记。所有新表强制公司RLS、复合来源外键和不可变保护。sales.post_invoice按订单、客户、信用投影锁定，校验已发未开数量、冻结价格/税额累计分摊、同事务AR/收入/GST过账与信用承诺重分类。普通API无四表写权限，信用释放必须匹配已开票金额；已开票单据禁止整单取消。GST明细冻结核算basis，不表示BAS归属。完整定义以007 SQL为准，接口与边界见stage-b-invoicing.md。


## 008_customer_receipts.sql（客户收款与GST归属）

新增accounting.customer_receipts、customer_advances、advance_applications、payment_allocations、gst_attributions、advance_gst_clearings六表，业务/基础表总数78。RC/AA沿用单据注册表；交易、分配、税额归属和清算记录不可变、强制公司RLS及复合外键。发票余额及预收余额由原金额减累计分配得到；客户AR/预收信用投影同事务更新。收款参考号、核销参考号分别公司内不区分大小写唯一，避免跨键/员工重录。普通API只能调用固定search_path的受限命令，无直接写账表/投影权限。新增默认2300预收负债、1400未开票GST清算资产及映射。NON_CASH开票税额触发器清算此前预付GST；CASH核销保留原收款日期并处理分摊尾差。完整可执行定义以008为准，接口及税务边界见stage-b-receipts.md。


## 009_sales_returns.sql（退货、贷项与退款）

新增7表：inventory.sales_returns、sales_return_lines，sales.credit_notes、credit_note_lines，accounting.customer_refunds、gst_adjustments、reversal_links，总数85。强制公司RLS、复合来源外键和不可变保护，原/对冲过账批次显式关联。退库按原出库累计成本分摊；贷项按原发票分摊；退款验证实际已付/贷项/客户净贷方或未核销预收。009重定义相关开票/信用/收款/核销函数，纳入未开票退货、贷项和退款，旧001—008保持校验和。GST调整新增负向明细，不改原归属。完整定义与接口边界见009 SQL和stage-b-returns.md。


## 010_purchasing_receipts.sql（采购订单与收货暂估）

新增purchase.orders、order_lines、receipts、receipt_lines、accounting.grni_items五表，总数90。采购草稿可版本替换，确认后冻结；PO/PR编号与版本来自单据注册表。收货复合外键锁定原PO供应商/仓库，接收行与GRNI不可变并强制公司RLS。库存商品按冻结净成本或含不可抵扣税成本更新同一移动平均成本池，服务/非库存记费用，贷GRNI；无AP/进项GST入账。新增5100采购费用映射，其他科目沿用既有映射。库存/价值/暂估/审计/幂等同事务，原001—009不变。完整定义与边界见010 SQL及stage-b-purchasing.md。


## 011_supplier_bills.sql（供应商账单匹配与AP/GST）

新增purchase.bills、bill_lines、accounting.ap_items、purchase_gst_entries四表，总数94。账单按同供应商已入账收货行精确匹配，数量/净额/税额累计分摊，行关联不可变GRNI来源；锁来源后校验余量防超额。SB号、账单/匹配/GRNI冲减Journal/AP/GST/审计/幂等同事务。公司供应商发票号去空白且不区分大小写唯一，保存供应商快照及原票/持票/到期/过账日期。NON_CASH借Input并保存税务归属日，CASH借新增1410待付款GST且无申报归属；非可抵扣税不重复记账。四表强制公司RLS、复合外键、不可变，应用只有SELECT和受权限保护的post_bill命令。补种ADMIN/FINANCE权限、新公司bootstrap及就绪探针；001—010逐字节不变。接口及限制见stage-b-supplier-bills.md。


## 012_supplier_payments.sql（供应商付款、预付核销与现金制进项GST）

新增accounting.supplier_payments、supplier_advances、supplier_advance_applications、supplier_payment_allocations、purchase_gst_attributions五表，共99。新增security_invoker的ap_balances和supplier_advance_balances视图，以不可变分配明细派生未付/预付可用额。供应商锁及排序AP锁保护同源并发付款/核销，来源付款日、账单持票日和科目快照确保现金制GST不重复/不超额归属。付款Dr原AP/预付1500、CrBank；核销Dr原AP/Cr原预付；现金制已付份额Dr原Input/Cr原Deferred。SP/SA编号、Journal、分配、GST与审计/幂等同事务；所有新表强制RLS及公司复合FK、不可变、延迟一致性检查。新增ADMIN/FINANCE权限及SUPPLIER_ADVANCES映射，新旧公司同seed，001—011不变。接口、税票及结算边界见stage-b-supplier-payments.md。


## 013_purchase_returns.sql（采购退货、供应商贷项与退款）

新增purchase.returns、return_lines、supplier_credit_notes、supplier_credit_lines、accounting.supplier_refunds、purchase_gst_adjustments六表，总数105。新增bill_line_balances security_invoker视图并扩展AP/预付余额视图，保留原应付/付款，派生贷后净未付、可退款及净已付。退货锁GRNI来源和原仓库存/成本，未开票冲GRNI，已开票暂入1600，成本差额5200；贷项基于实际已退来源冲原AP/清算/GST，退款BankDr/原AP或预付Cr。现金制贷项/退款有符号调整与待退款税单独追溯，后续账单匹配、付款、核销同步扣除退/贷/退款余量。复用并扩展reversal_links类型，PRT/SC/SR编号、会计/库存/审计/幂等同事务。六表公司RLS、复合FK、不可变及延迟一致性约束，新旧公司同seed；001—012不变。具体接口与边界见stage-b-purchase-returns.md。


## 014_inventory_control.sql（仓间调拨、盘点与报损）

新增inventory.operations、operation_lines、counts、count_lines四表，总数109。operations保存TRANSFER/COUNT/WRITE_OFF不可变Journal来源，lines保存每仓SKU带符号数量/价值、变更前后余额及修订号；TRANSFER双边数量/成本守恒。counts按OPEN→SUBMITTED→POSTED/CANCELLED生命周期，快照不可改、实盘提交后冻结，过账锁后核验revision/数量/预留/价值。stock_balances新增revision，数量/预留及stock_values插入/价值更新都推动修订，捕捉ABA和纯成本变动。盘亏/报损保护预留，盘盈按冻结均价或空库存显式总成本估值；4100/5300/5400为新默认映射。全部新表强制RLS、公司复合FK、审计/幂等/编号/GL/成本同事务，默认仓库采集、财务过账分权。001—013保持原样，接口及直接调拨/在途边界见stage-b-inventory-control.md。


## 015_transit_transfers.sql（在途发运、分批收货及短收）

新增inventory.transit_transfers、transit_transfer_lines、transit_events、transit_event_lines四表，共113。新增transit_line_balances和transit_transfer_balances安全视图，按接收/实物退回/确认短收累计派生剩余量/成本及IN_TRANSIT/PARTIAL/CLOSED状态。源仓扣未预留库存，发运成本及原库存/在途控制账户冻结；后续按原成本累计分摊并清尾差，收货/退回增加对应实物池，短收只由财务确认并记费用。1250在途资产与5500在途损失为新默认映射，TT/TIR/TIA独立编号；每次新单据/新Journal，旧发运期可关闭。四表公司RLS、复合FK、不可变、延迟数量/成本守恒校验；父调拨锁＋排序库存锁保护并发，审计/幂等/库存/在途/GL同事务。源/目的单独操作授权，相关仓库读单据时不泄露另一仓库存池。001—014原文件不改。详见stage-b-transit-transfers.md。


## 016_reconciliation.sql（阶段B控制一致性）

不增加业务表或科目，维持113张。新增accounting.reconciliation.read权限、ADMIN/FINANCE新旧公司种子、固定search_path权限检查辅助函数，以及SECURITY INVOKER/STABLE的accounting.reconciliation_checks()。单语句读取不可变业务流水、可变余额与GL；覆盖库存/估值/预留/在途、客户信用投影、发票AR与账单AP来源、预收预付、GRNI、采购退货清算及Journal。API将逐实体比较结果聚合并限制每项20条差异样本，不自动补差或改写凭证。001—015摘要保持不变，ready要求016函数存在。公式/范围见[一致性API](stage-b-reconciliation.md)，验收与剩余事项见[阶段B收口](stage-b-acceptance.md)。
