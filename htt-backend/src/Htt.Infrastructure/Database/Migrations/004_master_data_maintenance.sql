-- Additive migration: never rewrite 001..003 (they may already be deployed).
INSERT INTO identity.permissions(code,description) VALUES
 ('customers.credit.write','Maintain credit limits, terms and release customer holds'),
 ('suppliers.read','Read supplier master data'),('suppliers.write','Maintain suppliers and supplier contacts'),
 ('warehouses.read','Read assigned warehouses'),('warehouses.write','Maintain warehouses and regions'),
 ('warehouses.all','Read every warehouse in company'),('pricing.manage.read','Read pricing maintenance rules'),
 ('pricing.floor.read','Read confidential floor prices'),('pricing.floor.write','Maintain floor prices');

-- Extend existing companies and seed future companies with the same reusable policy (bootstrap calls this function).
CREATE FUNCTION identity.seed_master_data_roles(p_company uuid) RETURNS void
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.roles(company_id,code,name) VALUES
  (p_company,'OFFICE','Office operations'),(p_company,'PROCUREMENT','Procurement'),
  (p_company,'FINANCE','Finance'),(p_company,'PRICING_MANAGER','Pricing manager')
 ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT p_company,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p
 WHERE r.company_id=p_company AND (
  r.code='ADMIN' OR
  (r.code='OFFICE' AND p.code IN ('foundation.read','customers.read','customers.write','customers.all','catalog.read','catalog.write','suppliers.read','warehouses.read','warehouses.all','pricing.read','pricing.manage.read','pricing.write')) OR
  (r.code='PROCUREMENT' AND p.code IN ('foundation.read','catalog.read','catalog.write','suppliers.read','suppliers.write','warehouses.read','warehouses.write','warehouses.all')) OR
  (r.code='FINANCE' AND p.code IN ('foundation.read','customers.read','customers.write','customers.all','customers.credit.write','suppliers.read','accounting.read','audit.read')) OR
  (r.code='PRICING_MANAGER' AND p.code IN ('foundation.read','customers.read','customers.all','catalog.read','pricing.read','pricing.manage.read','pricing.write','pricing.floor.read','pricing.floor.write')) OR
  (r.code='WAREHOUSE' AND p.code='warehouses.read'))
 ON CONFLICT(company_id,role_id,permission_code) DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION identity.seed_master_data_roles(uuid) FROM PUBLIC;
DO $$ DECLARE c uuid; BEGIN
 FOR c IN SELECT id FROM core.companies LOOP
  PERFORM set_config('htt.company_id',c::text,true);
  PERFORM identity.seed_master_data_roles(c);
 END LOOP;
 PERFORM set_config('htt.company_id','',true);
END $$;

ALTER TABLE crm.suppliers ADD COLUMN status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE'));
ALTER TABLE crm.customer_branches ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE crm.contacts ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE crm.contacts ADD COLUMN mobile text;
ALTER TABLE catalog.warehouses ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE core.regions ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE catalog.uoms ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE catalog.product_categories ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE catalog.product_units ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE pricing.price_list_items ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE pricing.customer_price_rules ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE pricing.promotion_items ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE pricing.price_floor_rules ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE pricing.price_list_items DROP CONSTRAINT price_intervals_no_overlap;
ALTER TABLE pricing.price_list_items ADD CONSTRAINT price_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,price_list_id WITH =,product_unit_id WITH =,tstzrange(effective_from,effective_to,'[)') WITH &&) WHERE(active);
ALTER TABLE pricing.customer_price_rules DROP CONSTRAINT customer_price_intervals_no_overlap;
ALTER TABLE pricing.customer_price_rules ADD CONSTRAINT customer_price_intervals_no_overlap EXCLUDE USING gist
 (company_id WITH =,customer_id WITH =,product_unit_id WITH =,tstzrange(effective_from,effective_to,'[)') WITH &&) WHERE(active);

-- Parent ownership is immutable, preventing existing contact links / portal grants becoming invalid on retargeting.
CREATE FUNCTION core.reject_reparenting() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF to_jsonb(OLD)->TG_ARGV[0] IS DISTINCT FROM to_jsonb(NEW)->TG_ARGV[0] THEN
  RAISE EXCEPTION 'Master-data parent cannot be changed' USING ERRCODE='23514';
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER immutable_contact_party BEFORE UPDATE ON crm.contacts FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('party_id');
CREATE TRIGGER immutable_branch_customer BEFORE UPDATE ON crm.customer_branches FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('customer_id');
CREATE TRIGGER immutable_customer_party BEFORE UPDATE ON crm.customers FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('party_id');
CREATE TRIGGER immutable_supplier_party BEFORE UPDATE ON crm.suppliers FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('party_id');
CREATE TRIGGER immutable_portal_customer BEFORE UPDATE ON identity.customer_user_grants FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('customer_id');
CREATE TRIGGER immutable_product_base BEFORE UPDATE ON catalog.products FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('base_uom_id');

-- Base unit remains active with conversion exactly one. Existing deferred constraints call the replaced function.
CREATE OR REPLACE FUNCTION catalog.validate_product_base_unit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p_id uuid; c_id uuid;
BEGIN
 IF TG_TABLE_NAME='products' THEN p_id:=NEW.id; ELSE p_id:=NEW.product_id; END IF;
 c_id:=NEW.company_id;
 IF NOT EXISTS(SELECT 1 FROM catalog.products p JOIN catalog.product_units u
 ON u.company_id=p.company_id AND u.product_id=p.id AND u.uom_id=p.base_uom_id AND u.conversion_to_base=1 AND u.active
 WHERE p.id=p_id AND p.company_id=c_id) THEN
  RAISE EXCEPTION 'Product requires an active base unit with conversion 1' USING ERRCODE='23514';
 END IF; RETURN NULL;
END $$;
CREATE TRIGGER immutable_unit_product BEFORE UPDATE ON catalog.product_units FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('product_id');
CREATE TRIGGER immutable_unit_uom BEFORE UPDATE ON catalog.product_units FOR EACH ROW EXECUTE FUNCTION core.reject_reparenting('uom_id');

ALTER TABLE crm.customer_branches ADD CONSTRAINT au_branch_address CHECK
 (country<>'AU' OR (state IS NOT NULL AND postcode IS NOT NULL AND state IN ('ACT','NSW','NT','QLD','SA','TAS','VIC','WA') AND postcode ~ '^[0-9]{4}$')) NOT VALID;
-- NOT VALID preserves older incomplete rows; every new or edited AU address must satisfy the constraint.
ALTER TABLE pricing.price_lists ADD CONSTRAINT aud_price_lists CHECK(currency='AUD') NOT VALID;

GRANT SELECT ON core.regions TO htt_app;
GRANT INSERT,UPDATE ON crm.suppliers,core.regions,catalog.warehouses,catalog.uoms,catalog.product_categories,
 pricing.price_list_items,pricing.customer_price_rules,pricing.promotions,pricing.promotion_items,pricing.price_floor_rules TO htt_app;
GRANT DELETE ON crm.contact_branch_links TO htt_app;
REVOKE ALL ON FUNCTION core.reject_reparenting() FROM PUBLIC;
