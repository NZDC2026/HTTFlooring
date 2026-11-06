CREATE SCHEMA crm;
CREATE SCHEMA catalog;
CREATE SCHEMA inventory;
REVOKE ALL ON SCHEMA crm, catalog, inventory FROM PUBLIC;

CREATE TABLE crm.customer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES identity.company(id),
    code varchar(64) NOT NULL CHECK (btrim(code) <> ''),
    business_name varchar(200) NOT NULL CHECK (btrim(business_name) <> ''),
    abn varchar(32),
    phone varchar(64),
    email varchar(320),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    UNIQUE (company_id, code)
);

CREATE TABLE crm.customer_branch (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    name varchar(200) NOT NULL CHECK (btrim(name) <> ''),
    address_line1 varchar(200),
    address_line2 varchar(200),
    city varchar(100),
    state varchar(100),
    postcode varchar(20),
    country_code varchar(2),
    latitude numeric(9,6),
    longitude numeric(10,6),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    UNIQUE (company_id, customer_id, id),
    FOREIGN KEY (company_id, customer_id) REFERENCES crm.customer(company_id, id),
    CHECK ((latitude IS NULL AND longitude IS NULL) OR
        (latitude IS NOT NULL AND longitude IS NOT NULL AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
);

CREATE TABLE crm.customer_contact (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid,
    name varchar(200) NOT NULL CHECK (btrim(name) <> ''),
    email varchar(320),
    phone varchar(64),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    FOREIGN KEY (company_id, customer_id) REFERENCES crm.customer(company_id, id),
    FOREIGN KEY (company_id, customer_id, branch_id) REFERENCES crm.customer_branch(company_id, customer_id, id)
);
CREATE INDEX customer_contact_customer_idx ON crm.customer_contact(company_id, customer_id);
CREATE INDEX customer_contact_branch_idx ON crm.customer_contact(company_id, customer_id, branch_id);

CREATE TABLE catalog.unit_of_measure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES identity.company(id),
    code varchar(32) NOT NULL CHECK (btrim(code) <> ''),
    name varchar(100) NOT NULL CHECK (btrim(name) <> ''),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    UNIQUE (company_id, code)
);

CREATE TABLE catalog.product (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES identity.company(id),
    sku varchar(64) NOT NULL CHECK (btrim(sku) <> ''),
    name varchar(200) NOT NULL CHECK (btrim(name) <> ''),
    description text,
    base_unit_id uuid NOT NULL,
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    UNIQUE (company_id, sku),
    FOREIGN KEY (company_id, base_unit_id) REFERENCES catalog.unit_of_measure(company_id, id)
);
CREATE INDEX product_base_unit_idx ON catalog.product(company_id, base_unit_id);

CREATE TABLE inventory.warehouse (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES identity.company(id),
    code varchar(64) NOT NULL CHECK (btrim(code) <> ''),
    name varchar(200) NOT NULL CHECK (btrim(name) <> ''),
    address_line1 varchar(200),
    address_line2 varchar(200),
    city varchar(100),
    state varchar(100),
    postcode varchar(20),
    country_code varchar(2),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, id),
    UNIQUE (company_id, code)
);

ALTER TABLE crm.customer ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer USING (identity.has_company_access(company_id));
ALTER TABLE crm.customer_branch ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_branch USING (identity.has_company_access(company_id));
ALTER TABLE crm.customer_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_contact USING (identity.has_company_access(company_id));
ALTER TABLE catalog.unit_of_measure ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.unit_of_measure USING (identity.has_company_access(company_id));
ALTER TABLE catalog.product ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.product USING (identity.has_company_access(company_id));
ALTER TABLE inventory.warehouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.warehouse USING (identity.has_company_access(company_id));

-- Stage-2 foundation is read-only for the API. Grant writes alongside reviewed business use cases.
GRANT USAGE ON SCHEMA crm, catalog, inventory TO "${runtime_role}";
GRANT SELECT ON ALL TABLES IN SCHEMA crm, catalog, inventory TO "${runtime_role}";
GRANT USAGE ON SCHEMA platform TO "${runtime_role}";
GRANT SELECT ON platform.flyway_schema_history TO "${runtime_role}";

COMMENT ON TABLE catalog.product IS 'Product master data only. Prices, stock, unit conversions and financial history belong to separate reviewed models.';
COMMENT ON TABLE inventory.warehouse IS 'Warehouse master data only; no stock balances or inventory valuation are stored here.';
