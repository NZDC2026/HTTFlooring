-- Physical stock fulfilment. Quantity-only legacy openings deliberately remain unvalued.
CREATE TABLE inventory.picks (
 id uuid PRIMARY KEY, company_id uuid NOT NULL REFERENCES core.companies(id), order_id uuid NOT NULL,
 state text NOT NULL DEFAULT 'PICKED' CHECK(state IN ('PICKED','DISPATCHED','CANCELLED')),
 mode text CHECK(mode IN ('PICKUP','DELIVERY')), recipient text, reference text, confirmed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id), FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),
 FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id)
);
CREATE TABLE inventory.pick_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),pick_id uuid NOT NULL,order_line_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),
 UNIQUE(company_id,id),UNIQUE(company_id,pick_id,order_line_id),
 FOREIGN KEY(company_id,pick_id) REFERENCES inventory.picks(company_id,id),
 FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id)
);
CREATE TABLE inventory.stock_values (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),stock_balance_id uuid NOT NULL,
 value numeric(20,2) NOT NULL CHECK(value>=0),opening_document_id uuid NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,stock_balance_id),
 FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),
 FOREIGN KEY(company_id,opening_document_id) REFERENCES platform.documents(company_id,id)
);
CREATE TABLE inventory.stock_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),pick_line_id uuid NOT NULL,
 stock_balance_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>0),cost numeric(20,2) NOT NULL CHECK(cost>=0),
 on_hand_after numeric(20,6) NOT NULL CHECK(on_hand_after>=0),value_after numeric(20,2) NOT NULL CHECK(value_after>=0),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,pick_line_id),
 FOREIGN KEY(company_id,pick_line_id) REFERENCES inventory.pick_lines(company_id,id),
 FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id)
);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['picks','pick_lines','stock_values','stock_movements'] LOOP
 EXECUTE format('ALTER TABLE inventory.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE inventory.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON inventory.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);
 EXECUTE format('CREATE INDEX ON inventory.%I(company_id)',t);
 END LOOP;
END $$;
CREATE INDEX ON inventory.picks(company_id,order_id,state);
CREATE INDEX ON inventory.pick_lines(company_id,order_line_id);
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.pick_lines FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.stock_movements FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();

INSERT INTO identity.permissions(code,description) VALUES
 ('inventory.picks.read','Read warehouse work without sales prices or costs'),
 ('inventory.picks.write','Record and cancel warehouse picking'),
 ('inventory.dispatch','Confirm pickup or dispatch and post stock cost'),
 ('inventory.cost.read','Read inventory valuation and cost movements') ON CONFLICT(code) DO NOTHING;
CREATE FUNCTION identity.seed_fulfilment_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code='ADMIN' AND p.code IN ('inventory.picks.read','inventory.picks.write','inventory.dispatch','inventory.cost.read')) OR
 (r.code IN ('WAREHOUSE','OFFICE') AND p.code IN ('inventory.picks.read','inventory.picks.write','inventory.dispatch')) OR
 (r.code='FINANCE' AND p.code='inventory.cost.read')) ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'PICK','PK-'),(c,'STOCK_VALUATION','SV-') ON CONFLICT DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,'OPENING_EQUITY',id FROM accounting.accounts WHERE company_id=c AND code='3000' ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid; BEGIN FOR c IN SELECT id FROM core.companies LOOP
 PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_fulfilment_roles(c);
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION inventory.next_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE n bigint;p text;BEGIN
 IF t NOT IN ('PICK','STOCK_VALUATION') THEN RAISE EXCEPTION 'Unsupported sequence' USING ERRCODE='23514';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Sequence missing' USING ERRCODE='23514';END IF;
 RETURN p||lpad(n::text,GREATEST(6,length(n::text)),'0');END $$;
-- This check is also applied inside the definer command; possession of the app DB login is insufficient.
CREATE FUNCTION inventory.require_access(p_permission text,p_warehouse uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE m uuid; all_wh boolean; allowed boolean;
BEGIN
 SELECT mb.id,bool_or(rp.permission_code='warehouses.all'),bool_or(rp.permission_code=p_permission)
 INTO m,all_wh,allowed FROM identity.memberships mb JOIN identity.users u ON u.id=mb.user_id AND u.active
 JOIN identity.membership_roles mr ON mr.company_id=mb.company_id AND mr.membership_id=mb.id
 JOIN identity.role_permissions rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id
 WHERE mb.company_id=core.current_company() AND mb.user_id=core.current_actor() AND mb.active GROUP BY mb.id;
 IF NOT coalesce(allowed,false) OR (NOT coalesce(all_wh,false) AND NOT EXISTS(SELECT 1 FROM identity.warehouse_scopes WHERE company_id=core.current_company() AND membership_id=m AND warehouse_id=p_warehouse)) THEN
 RAISE EXCEPTION 'Warehouse permission denied' USING ERRCODE='42501';END IF;
END $$;
-- Locks order first, then pick, then balances in product order for all warehouse commands.
CREATE FUNCTION inventory.guard_pick_line() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p inventory.picks;l sales.order_lines; used numeric;step numeric;BEGIN
 SELECT * INTO p FROM inventory.picks WHERE company_id=NEW.company_id AND id=NEW.pick_id;
 SELECT * INTO l FROM sales.order_lines WHERE company_id=NEW.company_id AND id=NEW.order_line_id;
 PERFORM 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=p.order_id AND state='CONFIRMED' FOR UPDATE;
 IF NOT FOUND OR p.state<>'PICKED' OR l.order_id<>p.order_id OR l.item_type<>'STOCK' OR NEW.base_quantity*l.quantity<>NEW.quantity*l.base_quantity THEN
 RAISE EXCEPTION 'Invalid pick/order line' USING ERRCODE='23514';END IF;
 step:=(l.snapshot->>'quantityStep')::numeric;
 IF step IS NULL OR mod(NEW.quantity,step)<>0 THEN RAISE EXCEPTION 'Invalid sales unit step' USING ERRCODE='23514';END IF;
 SELECT coalesce(sum(pl.base_quantity),0) INTO used FROM inventory.pick_lines pl JOIN inventory.picks pk ON pk.company_id=pl.company_id AND pk.id=pl.pick_id
 WHERE pl.company_id=NEW.company_id AND pl.order_line_id=l.id AND pk.state<>'CANCELLED';
 IF used+NEW.base_quantity>l.base_quantity THEN RAISE EXCEPTION 'Picked quantity exceeds order remainder' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_line BEFORE INSERT ON inventory.pick_lines FOR EACH ROW EXECUTE FUNCTION inventory.guard_pick_line();
CREATE FUNCTION inventory.guard_pick() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (to_jsonb(NEW)-ARRAY['state','mode','recipient','reference','confirmed_at']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['state','mode','recipient','reference','confirmed_at']) OR OLD.state<>'PICKED' OR NEW.state NOT IN ('DISPATCHED','CANCELLED') THEN
 RAISE EXCEPTION 'Invalid pick transition' USING ERRCODE='23514';END IF;
 IF NEW.state='DISPATCHED' AND (NEW.mode IS NULL OR length(trim(NEW.recipient)) NOT BETWEEN 1 AND 200 OR length(trim(NEW.reference)) NOT BETWEEN 1 AND 200 OR NEW.confirmed_at IS NULL) THEN
 RAISE EXCEPTION 'Handover evidence required' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER guard_update BEFORE UPDATE ON inventory.picks FOR EACH ROW EXECUTE FUNCTION inventory.guard_pick();
CREATE TRIGGER no_delete BEFORE DELETE ON inventory.picks FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();

CREATE FUNCTION inventory.confirm_pick(pid uuid,expected bigint,p_mode text,p_recipient text,p_reference text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();p inventory.picks;o sales.orders;d platform.documents;
 l record;b inventory.stock_balances;v inventory.stock_values;r inventory.stock_reservations;cost numeric;total numeric:=0;
 inv uuid;cogs uuid;j uuid;today date;
BEGIN
 SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pid;
 SELECT * INTO o FROM sales.orders WHERE company_id=c AND id=p.order_id;
 PERFORM inventory.require_access('inventory.dispatch',o.warehouse_id);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=o.id AND state='CONFIRMED' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order not confirmed' USING ERRCODE='23514';END IF;
 SELECT * INTO d FROM platform.documents WHERE company_id=c AND id=pid FOR UPDATE;
 SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pid FOR UPDATE;
 IF d.version<>expected OR p.state<>'PICKED' THEN RAISE EXCEPTION 'Pick changed or already confirmed' USING ERRCODE='40001';END IF;
 IF p_mode IS NULL OR p_mode NOT IN ('PICKUP','DELIVERY') OR p_recipient IS NULL OR length(trim(p_recipient)) NOT BETWEEN 1 AND 200 OR p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Handover evidence required' USING ERRCODE='23514';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c;
 -- Even zero-cost stock must respect closed periods.
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Accounting period closed or missing' USING ERRCODE='23514';END IF;
 PERFORM 1 FROM catalog.warehouses WHERE company_id=c AND id=o.warehouse_id AND active AND kind='SELLABLE' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Warehouse unavailable' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM inventory.pick_lines WHERE company_id=c AND pick_id=pid) THEN RAISE EXCEPTION 'Empty pick' USING ERRCODE='23514';END IF;
 FOR l IN SELECT pl.*,ol.product_id FROM inventory.pick_lines pl JOIN sales.order_lines ol ON ol.company_id=pl.company_id AND ol.id=pl.order_line_id WHERE pl.company_id=c AND pl.pick_id=pid ORDER BY ol.product_id,pl.id LOOP
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=o.warehouse_id AND product_id=l.product_id FOR UPDATE;
 SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock valuation not initialized' USING ERRCODE='23514';END IF;
 SELECT * INTO r FROM inventory.stock_reservations WHERE company_id=c AND order_line_id=l.order_line_id FOR UPDATE;
 IF NOT FOUND OR r.remaining_quantity<l.base_quantity OR b.on_hand<l.base_quantity THEN RAISE EXCEPTION 'Insufficient reserved stock' USING ERRCODE='23514';END IF;
 cost:=CASE WHEN b.on_hand=l.base_quantity THEN v.value ELSE round(v.value*l.base_quantity/b.on_hand,2) END;
 UPDATE inventory.stock_reservations SET consumed_quantity=consumed_quantity+l.base_quantity WHERE company_id=c AND id=r.id;
 UPDATE inventory.stock_balances SET on_hand=on_hand-l.base_quantity WHERE company_id=c AND id=b.id;
 UPDATE inventory.stock_values SET value=value-cost WHERE company_id=c AND id=v.id;
 INSERT INTO inventory.stock_movements(company_id,pick_line_id,stock_balance_id,quantity,cost,on_hand_after,value_after,created_by) VALUES(c,l.id,b.id,l.base_quantity,cost,b.on_hand-l.base_quantity,v.value-cost,a);
 total:=total+cost;
 END LOOP;
 IF total>0 THEN
 SELECT m.account_id INTO inv FROM accounting.account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.account_id AND ac.active AND ac.control_kind='INVENTORY' WHERE m.company_id=c AND m.purpose='INVENTORY' FOR SHARE OF m,ac;
 SELECT m.account_id INTO cogs FROM accounting.account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.account_id AND ac.active AND ac.kind='EXPENSE' WHERE m.company_id=c AND m.purpose='COGS' FOR SHARE OF m,ac;
 IF inv IS NULL OR cogs IS NULL THEN RAISE EXCEPTION 'Inventory/COGS mapping missing or invalid' USING ERRCODE='23514';END IF;
 j:=accounting.post_journal(pid,d.version,'STOCK_ISSUE',today,'Warehouse dispatch',jsonb_build_array(jsonb_build_object('accountId',cogs,'debit',total),jsonb_build_object('accountId',inv,'credit',total)));
 END IF;
 UPDATE inventory.picks SET state='DISPATCHED',mode=p_mode,recipient=trim(p_recipient),reference=trim(p_reference),confirmed_at=now() WHERE company_id=c AND id=pid;
 UPDATE platform.documents SET state='POSTED',business_date=today WHERE company_id=c AND id=pid;
 -- Advance order version so a pre-dispatch cancellation cannot succeed.
 UPDATE platform.documents SET state=state WHERE company_id=c AND id=o.id;
 RETURN j;
END $$;
GRANT SELECT ON inventory.picks,inventory.pick_lines TO htt_app;
GRANT INSERT ON inventory.picks,inventory.pick_lines TO htt_app;
-- No app role may mutate quantities, valuation, movements or dispatched evidence directly.
REVOKE ALL ON FUNCTION identity.seed_fulfilment_roles(uuid),inventory.next_number(text),inventory.require_access(text,uuid),inventory.guard_pick_line(),inventory.guard_pick(),inventory.confirm_pick(uuid,bigint,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.next_number(text),inventory.require_access(text,uuid),inventory.confirm_pick(uuid,bigint,text,text,text) TO htt_app;
CREATE TABLE inventory.valuation_openings (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),stock_balance_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),value numeric(20,2) NOT NULL CHECK(value>=0),reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,stock_balance_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id)
);
ALTER TABLE inventory.valuation_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.valuation_openings FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.valuation_openings USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.valuation_openings FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
GRANT SELECT ON inventory.stock_values,inventory.stock_movements,inventory.valuation_openings TO htt_app;
CREATE FUNCTION inventory.cancel_pick(pid uuid,expected bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();p inventory.picks;wh uuid;d platform.documents;BEGIN
 SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pid;
 SELECT warehouse_id INTO wh FROM sales.orders WHERE company_id=c AND id=p.order_id;
 PERFORM inventory.require_access('inventory.picks.write',wh);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=p.order_id FOR UPDATE;
 SELECT * INTO d FROM platform.documents WHERE company_id=c AND id=pid FOR UPDATE;
 SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pid FOR UPDATE;
 IF d.version<>expected OR p.state<>'PICKED' THEN RAISE EXCEPTION 'Pick changed or dispatched' USING ERRCODE='40001';END IF;
 UPDATE inventory.picks SET state='CANCELLED' WHERE company_id=c AND id=pid;
 UPDATE platform.documents SET state='CANCELLED' WHERE company_id=c AND id=pid;
END $$;
REVOKE ALL ON FUNCTION inventory.cancel_pick(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.cancel_pick(uuid,bigint) TO htt_app;
-- An office cancellation retires unconfirmed warehouse work under the same order lock.
CREATE FUNCTION inventory.cancel_order_picks() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.state='CANCELLED' AND OLD.document_type='SALES_ORDER' THEN
 IF EXISTS(SELECT 1 FROM inventory.picks WHERE company_id=NEW.company_id AND order_id=NEW.id AND state='DISPATCHED') THEN RAISE EXCEPTION 'Dispatched order requires returns' USING ERRCODE='23514';END IF;
 UPDATE inventory.picks SET state='CANCELLED' WHERE company_id=NEW.company_id AND order_id=NEW.id AND state='PICKED';
 UPDATE platform.documents SET state='CANCELLED' WHERE company_id=NEW.company_id AND id IN(SELECT id FROM inventory.picks WHERE company_id=NEW.company_id AND order_id=NEW.id AND state='CANCELLED') AND state<>'CANCELLED';
 END IF;RETURN NEW;END $$;
CREATE TRIGGER cancel_warehouse_work AFTER UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION inventory.cancel_order_picks();
REVOKE ALL ON FUNCTION inventory.cancel_order_picks() FROM PUBLIC;
CREATE FUNCTION inventory.guard_pick_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE wh uuid;BEGIN
 SELECT warehouse_id INTO wh FROM sales.orders WHERE company_id=NEW.company_id AND id=NEW.order_id;
 PERFORM inventory.require_access('inventory.picks.write',wh);
 PERFORM 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=NEW.order_id AND document_type='SALES_ORDER' AND state='CONFIRMED' FOR UPDATE;
 IF NOT FOUND OR NEW.state<>'PICKED' OR NEW.created_by<>core.current_actor() OR NEW.company_id IS DISTINCT FROM core.current_company() OR NEW.mode IS NOT NULL OR NEW.recipient IS NOT NULL OR NEW.reference IS NOT NULL OR NEW.confirmed_at IS NOT NULL OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=NEW.id AND document_type='PICK' AND state='CONFIRMED') THEN
 RAISE EXCEPTION 'Invalid new pick' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER validate_pick BEFORE INSERT ON inventory.picks FOR EACH ROW EXECUTE FUNCTION inventory.guard_pick_insert();
REVOKE ALL ON FUNCTION inventory.guard_pick_insert() FROM PUBLIC;
