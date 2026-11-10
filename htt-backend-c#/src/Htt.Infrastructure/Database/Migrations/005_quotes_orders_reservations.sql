-- Stage B slice 1: no invoices, dispatch or GL effects are introduced here.
CREATE SCHEMA sales;
CREATE SCHEMA inventory;
REVOKE ALL ON SCHEMA sales,inventory FROM PUBLIC;
CREATE TABLE sales.quotes (
 id uuid PRIMARY KEY  ,
 company_id uuid NOT NULL REFERENCES core.companies(id),
 customer_id uuid NOT NULL,customer_branch_id uuid NOT NULL,warehouse_id uuid NOT NULL,status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED','CONVERTED')),expires_on date NOT NULL,notes text NOT NULL DEFAULT '',customer_snapshot jsonb NOT NULL,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),pricing_at timestamptz NOT NULL,submitted_by uuid REFERENCES identity.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,id,customer_id)
);
CREATE TABLE sales.quote_lines (
 id uuid PRIMARY KEY  ,
 company_id uuid NOT NULL REFERENCES core.companies(id),
 quote_id uuid NOT NULL,product_id uuid NOT NULL,product_unit_id uuid NOT NULL,item_type text NOT NULL CHECK(item_type IN ('STOCK','NON_STOCK','SERVICE')),quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),unit_price numeric(20,8) NOT NULL CHECK(unit_price>=0),tax_rate numeric(9,6) NOT NULL CHECK(tax_rate BETWEEN 0 AND 1),inclusive boolean NOT NULL,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),input jsonb NOT NULL,snapshot jsonb NOT NULL,pricing_signature text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.document_lines(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,quote_id) REFERENCES sales.quotes(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT
);
CREATE TABLE sales.quote_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 quote_id uuid NOT NULL,document_version bigint NOT NULL CHECK(document_version>0),snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,quote_id) REFERENCES sales.quotes(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,quote_id,document_version)
);
CREATE TABLE sales.orders (
 id uuid PRIMARY KEY  ,
 company_id uuid NOT NULL REFERENCES core.companies(id),
 source_quote_id uuid NOT NULL,approved_quote_version bigint NOT NULL,customer_id uuid NOT NULL,customer_branch_id uuid NOT NULL,warehouse_id uuid NOT NULL,customer_snapshot jsonb NOT NULL,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),approved_by uuid NOT NULL REFERENCES identity.users(id),cancelled_at timestamptz,cancel_reason text,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,source_quote_id) REFERENCES sales.quotes(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_branch_id) REFERENCES crm.customer_branches(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,source_quote_id),UNIQUE(company_id,id,customer_id)
);
CREATE TABLE sales.order_lines (
 id uuid PRIMARY KEY  ,
 company_id uuid NOT NULL REFERENCES core.companies(id),
 order_id uuid NOT NULL,source_quote_line_id uuid NOT NULL,product_id uuid NOT NULL,product_unit_id uuid NOT NULL,item_type text NOT NULL CHECK(item_type IN ('STOCK','NON_STOCK','SERVICE')),quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),unit_price numeric(20,8) NOT NULL CHECK(unit_price>=0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.document_lines(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,source_quote_line_id) REFERENCES sales.quote_lines(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,source_quote_line_id)
);
CREATE TABLE sales.credit_commitments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 order_id uuid NOT NULL,customer_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>=0),released_amount numeric(20,2) NOT NULL DEFAULT 0 CHECK(released_amount>=0 AND released_amount<=amount),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,order_id,customer_id) REFERENCES sales.orders(company_id,id,customer_id),UNIQUE(company_id,order_id)
);
CREATE TABLE sales.credit_decisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 order_id uuid NOT NULL,customer_id uuid NOT NULL,credit_limit numeric(20,2) NOT NULL,receivable numeric(20,2) NOT NULL,unbilled_before numeric(20,2) NOT NULL,advances numeric(20,2) NOT NULL,order_amount numeric(20,2) NOT NULL,exposure_after numeric(20,2) NOT NULL CHECK(exposure_after<=credit_limit),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,order_id)
);
CREATE TABLE inventory.stock_balances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 warehouse_id uuid NOT NULL,product_id uuid NOT NULL,on_hand numeric(20,6) NOT NULL DEFAULT 0 CHECK(on_hand>=0),reserved numeric(20,6) NOT NULL DEFAULT 0 CHECK(reserved>=0 AND reserved<=on_hand),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,warehouse_id,product_id)
);
CREATE TABLE inventory.stock_openings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 warehouse_id uuid NOT NULL,product_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>0),reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,warehouse_id,product_id)
);
CREATE TABLE inventory.stock_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES core.companies(id),
 order_line_id uuid NOT NULL,stock_balance_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>0),consumed_quantity numeric(20,6) NOT NULL DEFAULT 0,released_quantity numeric(20,6) NOT NULL DEFAULT 0,remaining_quantity numeric(20,6) GENERATED ALWAYS AS (quantity-consumed_quantity-released_quantity) STORED,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id) ON DELETE RESTRICT,FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id) ON DELETE RESTRICT,UNIQUE(company_id,order_line_id),CHECK(consumed_quantity>=0 AND released_quantity>=0 AND consumed_quantity+released_quantity<=quantity)
);
ALTER TABLE sales.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.quotes FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.quotes USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.quotes(company_id);
ALTER TABLE sales.quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.quote_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.quote_lines USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.quote_lines(company_id);
ALTER TABLE sales.quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.quote_submissions FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.quote_submissions USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.quote_submissions(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON sales.quote_submissions FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.orders FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.orders USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.orders(company_id);
ALTER TABLE sales.order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.order_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.order_lines USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.order_lines(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON sales.order_lines FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE sales.credit_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.credit_commitments FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.credit_commitments USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.credit_commitments(company_id);
ALTER TABLE sales.credit_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.credit_decisions FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON sales.credit_decisions USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON sales.credit_decisions(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON sales.credit_decisions FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE inventory.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_balances FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.stock_balances USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON inventory.stock_balances(company_id);
ALTER TABLE inventory.stock_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_openings FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.stock_openings USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON inventory.stock_openings(company_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.stock_openings FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
ALTER TABLE inventory.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.stock_reservations FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.stock_reservations USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON inventory.stock_reservations(company_id);

CREATE INDEX ON sales.quotes(company_id,customer_id,status);
CREATE INDEX ON sales.orders(company_id,customer_id);
CREATE INDEX ON sales.quote_lines(company_id,quote_id);
CREATE INDEX ON sales.order_lines(company_id,order_id);
CREATE INDEX ON inventory.stock_reservations(company_id,stock_balance_id);

ALTER TABLE platform.document_lines ADD CONSTRAINT line_document_identity UNIQUE(company_id,id,document_id);
ALTER TABLE sales.quote_lines ADD CONSTRAINT quote_registry_parent FOREIGN KEY(company_id,id,quote_id) REFERENCES platform.document_lines(company_id,id,document_id);
ALTER TABLE sales.order_lines ADD CONSTRAINT order_registry_parent FOREIGN KEY(company_id,id,order_id) REFERENCES platform.document_lines(company_id,id,document_id);

CREATE FUNCTION sales.validate_order() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE oid uuid; docstate text; o sales.orders; n bigint; net_total numeric; tax_total numeric; gross_total numeric;
BEGIN
 IF TG_TABLE_NAME='orders' THEN oid:=NEW.id;
 ELSIF TG_TABLE_NAME='stock_reservations' THEN SELECT order_id INTO oid FROM sales.order_lines WHERE company_id=NEW.company_id AND id=NEW.order_line_id;
 ELSE oid:=NEW.order_id;END IF;
 SELECT * INTO o FROM sales.orders WHERE company_id=NEW.company_id AND id=oid;
 SELECT state INTO docstate FROM platform.documents WHERE company_id=NEW.company_id AND id=oid;
 SELECT count(*),sum(net),sum(tax),sum(gross) INTO n,net_total,tax_total,gross_total FROM sales.order_lines WHERE company_id=NEW.company_id AND order_id=oid;
 IF n=0 OR net_total<>o.net OR tax_total<>o.tax OR gross_total<>o.gross THEN RAISE EXCEPTION 'Order totals do not match its lines' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM sales.credit_commitments WHERE company_id=NEW.company_id AND order_id=oid AND amount=o.gross AND (docstate<>'CANCELLED' OR released_amount=amount)) THEN RAISE EXCEPTION 'Order must have matching credit commitment' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.order_lines l WHERE l.company_id=NEW.company_id AND l.order_id=oid AND l.item_type='STOCK' AND NOT EXISTS(SELECT 1 FROM inventory.stock_reservations r WHERE r.company_id=l.company_id AND r.order_line_id=l.id AND r.quantity=l.base_quantity AND (docstate<>'CANCELLED' OR (r.remaining_quantity=0 AND r.consumed_quantity=0)))) THEN RAISE EXCEPTION 'Order requires matching stock reservations' USING ERRCODE='23514';END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER order_consistency AFTER INSERT OR UPDATE ON sales.orders DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_order();
CREATE CONSTRAINT TRIGGER order_consistency AFTER INSERT ON sales.order_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_order();
CREATE CONSTRAINT TRIGGER order_consistency AFTER INSERT OR UPDATE ON sales.credit_commitments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_order();
CREATE CONSTRAINT TRIGGER order_consistency AFTER INSERT OR UPDATE ON inventory.stock_reservations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_order();

CREATE FUNCTION sales.next_number(p_type text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE value bigint; p text;
BEGIN
 IF p_type NOT IN ('QUOTE','SALES_ORDER') THEN RAISE EXCEPTION 'Unsupported sequence'; END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=p_type
 RETURNING next_value-1,prefix INTO value,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Document sequence is missing' USING ERRCODE='23514'; END IF;
 RETURN p||lpad(value::text,GREATEST(6,length(value::text)),'0');
END $$;

CREATE FUNCTION sales.guard_quote() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status<>'DRAFT' AND (to_jsonb(NEW)-'status') IS DISTINCT FROM (to_jsonb(OLD)-'status') THEN
  RAISE EXCEPTION 'Submitted quote content is immutable' USING ERRCODE='23514'; END IF;
 IF NOT ((OLD.status='DRAFT' AND NEW.status IN ('DRAFT','SUBMITTED')) OR
         (OLD.status='SUBMITTED' AND NEW.status IN ('DRAFT','CONVERTED'))) THEN
  RAISE EXCEPTION 'Invalid quote transition' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM crm.customer_branches b WHERE b.company_id=NEW.company_id AND b.id=NEW.customer_branch_id AND b.customer_id=NEW.customer_id) THEN
  RAISE EXCEPTION 'Quote branch belongs to another customer' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER quote_update BEFORE UPDATE ON sales.quotes FOR EACH ROW EXECUTE FUNCTION sales.guard_quote();
CREATE FUNCTION sales.guard_quote_insert() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM crm.customer_branches b WHERE b.company_id=NEW.company_id AND b.id=NEW.customer_branch_id AND b.customer_id=NEW.customer_id) THEN
  RAISE EXCEPTION 'Quote branch belongs to another customer' USING ERRCODE='23514'; END IF; RETURN NEW;
END $$;
CREATE TRIGGER quote_insert BEFORE INSERT ON sales.quotes FOR EACH ROW EXECUTE FUNCTION sales.guard_quote_insert();
CREATE FUNCTION sales.guard_quote_lines() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c uuid; q uuid;
BEGIN
 IF TG_OP='DELETE' THEN c:=OLD.company_id;q:=OLD.quote_id;ELSE c:=NEW.company_id;q:=NEW.quote_id;END IF;
 IF NOT EXISTS(SELECT 1 FROM sales.quotes WHERE company_id=c AND id=q AND status='DRAFT') THEN
  RAISE EXCEPTION 'Only draft quote lines can change' USING ERRCODE='23514'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;END IF; RETURN NEW;
END $$;
CREATE TRIGGER draft_lines BEFORE INSERT OR UPDATE OR DELETE ON sales.quote_lines FOR EACH ROW EXECUTE FUNCTION sales.guard_quote_lines();

CREATE FUNCTION inventory.apply_reservation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE delta numeric; balance inventory.stock_balances; line sales.order_lines; wh uuid;
BEGIN
 IF NEW.company_id IS DISTINCT FROM core.current_company() THEN RAISE EXCEPTION 'Missing scope' USING ERRCODE='42501';END IF;
 IF TG_OP='UPDATE' AND (NEW.consumed_quantity<OLD.consumed_quantity OR NEW.released_quantity<OLD.released_quantity) THEN RAISE EXCEPTION 'Reservation consumption/release cannot decrease' USING ERRCODE='23514';END IF;
 IF TG_OP='UPDATE' AND (NEW.company_id,NEW.order_line_id,NEW.stock_balance_id,NEW.quantity,NEW.created_by) IS DISTINCT FROM (OLD.company_id,OLD.order_line_id,OLD.stock_balance_id,OLD.quantity,OLD.created_by) THEN
  RAISE EXCEPTION 'Reservation identity/quantity cannot change' USING ERRCODE='23514'; END IF;
 SELECT * INTO line FROM sales.order_lines WHERE company_id=NEW.company_id AND id=NEW.order_line_id;
 SELECT warehouse_id INTO wh FROM sales.orders WHERE company_id=line.company_id AND id=line.order_id;
 SELECT * INTO balance FROM inventory.stock_balances WHERE company_id=NEW.company_id AND id=NEW.stock_balance_id FOR UPDATE;
 IF line.item_type<>'STOCK' OR line.product_id<>balance.product_id OR wh<>balance.warehouse_id OR NEW.quantity<>line.base_quantity THEN
  RAISE EXCEPTION 'Reservation does not match order line/warehouse' USING ERRCODE='23514'; END IF;
 delta:=NEW.quantity-NEW.consumed_quantity-NEW.released_quantity;
 IF TG_OP='UPDATE' THEN delta:=delta-(OLD.quantity-OLD.consumed_quantity-OLD.released_quantity);END IF;
 UPDATE inventory.stock_balances SET reserved=reserved+delta WHERE company_id=NEW.company_id AND id=NEW.stock_balance_id;
 RETURN NEW;
END $$;
CREATE TRIGGER reserve_balance AFTER INSERT OR UPDATE ON inventory.stock_reservations FOR EACH ROW EXECUTE FUNCTION inventory.apply_reservation();
CREATE TRIGGER no_delete BEFORE DELETE ON inventory.stock_reservations FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();

-- Missing historical exposure is repaired as a zero projection, not represented as verified AR. Import AR before live use.
DO $$ DECLARE c uuid;BEGIN
 FOR c IN SELECT id FROM core.companies LOOP
  PERFORM set_config('htt.company_id',c::text,true);
  INSERT INTO crm.customer_credit_exposures(company_id,customer_id,created_by)
   SELECT company_id,id,created_by FROM crm.customers WHERE company_id=c ON CONFLICT(company_id,customer_id) DO NOTHING;
 END LOOP;PERFORM set_config('htt.company_id','',true);
END $$;
CREATE FUNCTION sales.apply_credit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE delta numeric; customer crm.customers; exposure crm.customer_credit_exposures;
BEGIN
 IF NEW.company_id IS DISTINCT FROM core.current_company() THEN RAISE EXCEPTION 'Missing scope' USING ERRCODE='42501';END IF;
 IF TG_OP='UPDATE' AND NEW.released_amount<OLD.released_amount THEN RAISE EXCEPTION 'Credit release cannot decrease' USING ERRCODE='23514';END IF;
 IF TG_OP='UPDATE' AND (NEW.company_id,NEW.order_id,NEW.customer_id,NEW.amount,NEW.created_by) IS DISTINCT FROM (OLD.company_id,OLD.order_id,OLD.customer_id,OLD.amount,OLD.created_by) THEN
  RAISE EXCEPTION 'Credit commitment identity/amount cannot change' USING ERRCODE='23514';END IF;
 SELECT * INTO customer FROM crm.customers WHERE company_id=NEW.company_id AND id=NEW.customer_id FOR UPDATE;
 SELECT * INTO exposure FROM crm.customer_credit_exposures WHERE company_id=NEW.company_id AND customer_id=NEW.customer_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit exposure must be initialized' USING ERRCODE='23514';END IF;
 delta:=NEW.amount-NEW.released_amount;
 IF TG_OP='UPDATE' THEN delta:=delta-(OLD.amount-OLD.released_amount);END IF;
 IF delta>0 AND (customer.status<>'ACTIVE' OR GREATEST(0,exposure.receivable+exposure.unbilled_orders+delta-exposure.available_advances)>customer.credit_limit) THEN
  RAISE EXCEPTION 'Credit limit exceeded or customer on hold' USING ERRCODE='23514';END IF;
 UPDATE crm.customer_credit_exposures SET unbilled_orders=unbilled_orders+delta WHERE company_id=NEW.company_id AND customer_id=NEW.customer_id;
 RETURN NEW;
END $$;
CREATE TRIGGER credit_exposure AFTER INSERT OR UPDATE ON sales.credit_commitments FOR EACH ROW EXECUTE FUNCTION sales.apply_credit();
CREATE TRIGGER no_delete BEFORE DELETE ON sales.credit_commitments FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();

INSERT INTO identity.permissions(code,description) VALUES
 ('sales.credit.read','Read authorized customer credit availability'),
 ('sales.quotes.read','Read quotes for authorized customers'),('sales.quotes.write','Create/edit/submit owned drafts'),
 ('sales.quotes.manage.all','Manage other employees quotes within customer scope'),('sales.quotes.approve','Office review/convert submitted quotes'),
 ('sales.quotes.price.override','Override quote price only within active floor'),('sales.orders.read','Read authorized customer orders'),
 ('sales.orders.cancel','Cancel unfulfilled orders and release commitments'),('inventory.read','Read assigned warehouse availability'),
 ('inventory.opening.write','Owner CLI initialize quantity-only opening stock');
CREATE FUNCTION identity.seed_sales_roles(p_company uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT p_company,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p
 WHERE r.company_id=p_company AND (
  (r.code='ADMIN' AND (p.code LIKE 'sales.%' OR p.code IN ('inventory.read','inventory.opening.write'))) OR
  (r.code='OFFICE' AND (p.code LIKE 'sales.%' OR p.code='inventory.read')) OR
  (r.code='SALES' AND p.code IN ('sales.quotes.read','sales.quotes.write','sales.quotes.price.override','sales.orders.read','inventory.read')) OR
  (r.code IN ('WAREHOUSE','PROCUREMENT') AND p.code='inventory.read') OR
  (r.code='FINANCE' AND p.code IN ('sales.orders.read','sales.credit.read')))
 ON CONFLICT(company_id,role_id,permission_code) DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN
 FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_sales_roles(c);END LOOP;
 PERFORM set_config('htt.company_id','',true);
END $$;
GRANT USAGE ON SCHEMA sales,inventory TO htt_app;
GRANT SELECT ON ALL TABLES IN SCHEMA sales,inventory TO htt_app;
GRANT INSERT,UPDATE ON sales.quotes TO htt_app;
GRANT INSERT,DELETE ON sales.quote_lines TO htt_app;
GRANT INSERT ON sales.quote_submissions,sales.orders,sales.order_lines,sales.credit_decisions TO htt_app;
GRANT UPDATE(cancelled_at,cancel_reason) ON sales.orders TO htt_app;
GRANT INSERT ON sales.credit_commitments,inventory.stock_reservations TO htt_app;
GRANT UPDATE(released_amount) ON sales.credit_commitments TO htt_app;
GRANT UPDATE(released_quantity) ON inventory.stock_reservations TO htt_app;
GRANT INSERT,UPDATE ON platform.documents TO htt_app;
GRANT INSERT,DELETE ON platform.document_lines TO htt_app;
GRANT SELECT,UPDATE ON platform.document_sequences TO htt_app;
GRANT SELECT,INSERT,UPDATE ON platform.approval_requests TO htt_app;
GRANT SELECT,INSERT ON platform.approval_actions TO htt_app;
CREATE FUNCTION inventory.lock_balance(p_warehouse uuid,p_product uuid) RETURNS SETOF inventory.stock_balances
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT * FROM inventory.stock_balances WHERE company_id=core.current_company() AND warehouse_id=p_warehouse AND product_id=p_product FOR UPDATE
$$;
CREATE FUNCTION sales.lock_credit(p_customer uuid) RETURNS SETOF crm.customer_credit_exposures
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT * FROM crm.customer_credit_exposures WHERE company_id=core.current_company() AND customer_id=p_customer FOR UPDATE
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA sales,inventory FROM PUBLIC;
REVOKE ALL ON FUNCTION identity.seed_sales_roles(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.next_number(text) TO htt_app;

GRANT EXECUTE ON FUNCTION inventory.lock_balance(uuid,uuid) TO htt_app;

REVOKE UPDATE ON crm.customer_credit_exposures FROM htt_app;
GRANT EXECUTE ON FUNCTION sales.lock_credit(uuid) TO htt_app;
