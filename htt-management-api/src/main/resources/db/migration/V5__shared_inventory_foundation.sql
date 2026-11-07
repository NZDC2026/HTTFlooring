-- One authoritative balance per company/product/warehouse; never one table per client.
-- No sample quantities, default warehouses, users, action grants or inferred ERPNext mapping.
ALTER TABLE catalog.product ADD CONSTRAINT product_base_unit_key UNIQUE (company_id, id, base_unit_id);
ALTER TABLE catalog.product ADD COLUMN category varchar(100);
ALTER TABLE catalog.product ADD COLUMN colour varchar(100);
ALTER TABLE catalog.product ADD COLUMN brand varchar(100);
ALTER TABLE catalog.product ADD COLUMN dimensions varchar(200);

CREATE TABLE catalog.product_unit (
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    unit_id uuid NOT NULL,
    base_unit_id uuid NOT NULL,
    conversion_to_base numeric(24,9) NOT NULL CHECK (conversion_to_base > 0),
    quantity_step numeric(24,9) NOT NULL CHECK (quantity_step > 0),
    PRIMARY KEY (company_id, product_id, unit_id),
    FOREIGN KEY (company_id, product_id, base_unit_id) REFERENCES catalog.product(company_id, id, base_unit_id),
    FOREIGN KEY (company_id, unit_id) REFERENCES catalog.unit_of_measure(company_id, id),
    CHECK (unit_id <> base_unit_id OR conversion_to_base = 1)
);

CREATE TABLE catalog.product_barcode (
    company_id uuid NOT NULL,
    barcode varchar(128) NOT NULL CHECK (btrim(barcode) <> ''),
    product_id uuid NOT NULL,
    unit_id uuid NOT NULL,
    PRIMARY KEY (company_id, barcode),
    FOREIGN KEY (company_id, product_id, unit_id) REFERENCES catalog.product_unit(company_id, product_id, unit_id)
);
CREATE INDEX product_barcode_product_idx ON catalog.product_barcode(company_id, product_id);

CREATE TABLE inventory.stock_balance (
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    warehouse_id uuid NOT NULL,
    base_unit_id uuid NOT NULL,
    on_hand numeric(24,6) NOT NULL CHECK (on_hand >= 0),
    reserved numeric(24,6) NOT NULL DEFAULT 0 CHECK (reserved >= 0),
    damaged numeric(24,6) NOT NULL DEFAULT 0 CHECK (damaged >= 0),
    available numeric(24,6) GENERATED ALWAYS AS (on_hand - reserved - damaged) STORED,
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (company_id, product_id, warehouse_id),
    FOREIGN KEY (company_id, product_id, base_unit_id) REFERENCES catalog.product(company_id, id, base_unit_id),
    FOREIGN KEY (company_id, warehouse_id) REFERENCES inventory.warehouse(company_id, id),
    CHECK (reserved + damaged <= on_hand)
);
CREATE INDEX stock_balance_warehouse_idx ON inventory.stock_balance(company_id, warehouse_id, product_id);

CREATE FUNCTION inventory.version_stock_balance() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
    IF (NEW.company_id, NEW.product_id, NEW.warehouse_id, NEW.base_unit_id)
            IS DISTINCT FROM (OLD.company_id, OLD.product_id, OLD.warehouse_id, OLD.base_unit_id) THEN
        RAISE EXCEPTION 'Stock identity and base unit are immutable' USING ERRCODE = '23514';
    END IF;
    NEW.version := OLD.version + 1;
    NEW.updated_at := clock_timestamp();
    RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION inventory.version_stock_balance() FROM PUBLIC;
CREATE TRIGGER version_stock_balance BEFORE UPDATE ON inventory.stock_balance
    FOR EACH ROW EXECUTE FUNCTION inventory.version_stock_balance();

-- Append-only for the future business writer. Runtime currently has no DML grant on either table.
-- The posting use case must write balance + movement + idempotency + business Outbox in one transaction.
CREATE TABLE inventory.stock_movement (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    warehouse_id uuid NOT NULL,
    base_unit_id uuid NOT NULL,
    base_unit_code varchar(32) NOT NULL CHECK (btrim(base_unit_code) <> ''),
    movement_type varchar(32) NOT NULL CHECK (btrim(movement_type) <> ''),
    on_hand_delta numeric(24,6) NOT NULL,
    reserved_delta numeric(24,6) NOT NULL DEFAULT 0,
    damaged_delta numeric(24,6) NOT NULL DEFAULT 0,
    on_hand_after numeric(24,6) NOT NULL CHECK (on_hand_after >= 0),
    reserved_after numeric(24,6) NOT NULL CHECK (reserved_after >= 0),
    damaged_after numeric(24,6) NOT NULL CHECK (damaged_after >= 0),
    balance_version bigint NOT NULL CHECK (balance_version > 0),
    source_type varchar(64) NOT NULL CHECK (btrim(source_type) <> ''),
    source_id uuid NOT NULL,
    source_line_id uuid NOT NULL,
    idempotency_key varchar(128) NOT NULL CHECK (btrim(idempotency_key) <> ''),
    actor_id uuid NOT NULL REFERENCES identity.user_account(id),
    reason varchar(500) NOT NULL CHECK (btrim(reason) <> ''),
    occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    UNIQUE (company_id, idempotency_key),
    UNIQUE (company_id, product_id, warehouse_id, balance_version),
    FOREIGN KEY (company_id, product_id, warehouse_id) REFERENCES inventory.stock_balance(company_id, product_id, warehouse_id),
    FOREIGN KEY (company_id, product_id, base_unit_id) REFERENCES catalog.product(company_id, id, base_unit_id),
    CHECK (on_hand_delta <> 0 OR reserved_delta <> 0 OR damaged_delta <> 0),
    CHECK (reserved_after + damaged_after <= on_hand_after)
);
CREATE INDEX stock_movement_source_idx ON inventory.stock_movement(company_id, source_type, source_id);

ALTER TABLE catalog.product_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_barcode ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_movement ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON catalog.product_unit USING (identity.has_company_access(company_id));
CREATE POLICY company_scope ON catalog.product_barcode USING (identity.has_company_access(company_id));
CREATE POLICY company_scope ON inventory.stock_balance USING (identity.has_company_access(company_id));
CREATE POLICY company_scope ON inventory.stock_movement USING (identity.has_company_access(company_id));
REVOKE ALL ON catalog.product_unit, catalog.product_barcode, inventory.stock_balance, inventory.stock_movement FROM PUBLIC;
GRANT SELECT ON catalog.product_unit, catalog.product_barcode, inventory.stock_balance TO "${runtime_role}";

COMMENT ON TABLE inventory.stock_balance IS 'HTT authoritative quantity in product base units; missing row means not initialized, never inferred zero. Warehouse/customer authorization must precede queries.';
COMMENT ON TABLE inventory.stock_movement IS 'Auditable stock changes, not invoices or GL postings. Runtime writes remain disabled pending authorized transactional posting use cases.';
COMMENT ON COLUMN inventory.stock_balance.available IS 'Conservative initial rule from mobile stockMetrics: on_hand - reserved - damaged; no negative inventory or implicit reservations.';
