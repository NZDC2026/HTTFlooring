CREATE TABLE inventory.bins(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),warehouse_id uuid NOT NULL,code text NOT NULL CHECK(code~'^[A-Z0-9][A-Z0-9_-]{0,39}$'),name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 200),active boolean NOT NULL DEFAULT true,version bigint NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,warehouse_id,code),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id));
CREATE TABLE inventory.lots(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),product_id uuid NOT NULL,code text NOT NULL CHECK(length(btrim(code)) BETWEEN 1 AND 80),received_on date NOT NULL DEFAULT current_date,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,product_id,code),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id));
CREATE TABLE inventory.positions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),stock_balance_id uuid NOT NULL,bin_id uuid NOT NULL,lot_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>=0),version bigint NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,stock_balance_id,bin_id,lot_id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),FOREIGN KEY(company_id,bin_id) REFERENCES inventory.bins(company_id,id),FOREIGN KEY(company_id,lot_id) REFERENCES inventory.lots(company_id,id));
CREATE TABLE inventory.position_movements(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),position_id uuid NOT NULL,document_id uuid,quantity numeric(20,6) NOT NULL CHECK(quantity<>0),reason text NOT NULL,request_id text,transaction_id bigint NOT NULL DEFAULT txid_current(),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,position_id) REFERENCES inventory.positions(company_id,id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) DEFERRABLE INITIALLY DEFERRED);
CREATE TABLE inventory.location_moves(id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),warehouse_id uuid NOT NULL,source_position_id uuid NOT NULL,target_position_id uuid NOT NULL,count_id uuid,quantity numeric(20,6) NOT NULL CHECK(quantity>0),reference text NOT NULL,reason text NOT NULL,created_by uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,reference),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,count_id) REFERENCES inventory.counts(company_id,id),FOREIGN KEY(company_id,source_position_id) REFERENCES inventory.positions(company_id,id),FOREIGN KEY(company_id,target_position_id) REFERENCES inventory.positions(company_id,id));
CREATE TABLE inventory.pick_positions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),pick_line_id uuid NOT NULL,position_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>0),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,pick_line_id,position_id),FOREIGN KEY(company_id,pick_line_id) REFERENCES inventory.pick_lines(company_id,id),FOREIGN KEY(company_id,position_id) REFERENCES inventory.positions(company_id,id));
CREATE TABLE inventory.pick_shortages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),pick_id uuid NOT NULL,order_line_id uuid NOT NULL,missing_quantity numeric(20,6) NOT NULL CHECK(missing_quantity>0),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 500),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,pick_id) REFERENCES inventory.picks(company_id,id),FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['bins','lots','positions','position_movements','location_moves','pick_positions','pick_shortages'] LOOP EXECUTE format('ALTER TABLE inventory.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE inventory.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON inventory.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);IF tb IN('bins','positions') THEN EXECUTE format('CREATE TRIGGER touch_version BEFORE UPDATE ON inventory.%I FOR EACH ROW EXECUTE FUNCTION core.touch_version()',tb);ELSE EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);END IF;END LOOP;END $$;
CREATE INDEX ON inventory.position_movements(company_id,position_id,created_at);CREATE INDEX ON inventory.pick_positions(company_id,position_id);
INSERT INTO identity.permissions(code,description) VALUES('inventory.locations.read','Read warehouse bins and batch positions'),('inventory.locations.write','Allocate physical stock between bins/batches');
CREATE FUNCTION identity.seed_location_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND((r.code IN('ADMIN','WAREHOUSE','OFFICE','PROCUREMENT','FINANCE') AND p.code='inventory.locations.read') OR(r.code IN('ADMIN','WAREHOUSE') AND p.code='inventory.locations.write') OR(r.code='WAREHOUSE' AND p.code IN('documents.files.read','documents.attachments.write'))) ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'LOCATION_MOVE','LM-') ON CONFLICT DO NOTHING;END $$;
CREATE FUNCTION inventory.ensure_unassigned(bid uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE b inventory.stock_balances;bin uuid;lot uuid;pos uuid;BEGIN
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=core.current_company() AND id=bid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock balance unavailable' USING ERRCODE='HT404';END IF;
 INSERT INTO inventory.bins(company_id,warehouse_id,code,name) VALUES(b.company_id,b.warehouse_id,'UNASSIGNED','Unassigned / awaiting count allocation') ON CONFLICT(company_id,warehouse_id,code) DO NOTHING;SELECT id INTO bin FROM inventory.bins WHERE company_id=b.company_id AND warehouse_id=b.warehouse_id AND code='UNASSIGNED';
 INSERT INTO inventory.lots(company_id,product_id,code,received_on) SELECT b.company_id,b.product_id,'UNASSIGNED',(now() AT TIME ZONE timezone)::date FROM core.companies WHERE id=b.company_id ON CONFLICT(company_id,product_id,code) DO NOTHING;SELECT id INTO lot FROM inventory.lots WHERE company_id=b.company_id AND product_id=b.product_id AND code='UNASSIGNED';
 INSERT INTO inventory.positions(company_id,stock_balance_id,bin_id,lot_id,quantity) VALUES(b.company_id,b.id,bin,lot,0) ON CONFLICT DO NOTHING;SELECT id INTO pos FROM inventory.positions WHERE company_id=b.company_id AND stock_balance_id=b.id AND bin_id=bin AND lot_id=lot;RETURN pos;END $$;
DO $$ DECLARE c uuid;b record;p uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_location_roles(c);FOR b IN SELECT * FROM inventory.stock_balances WHERE company_id=c LOOP p:=inventory.ensure_unassigned(b.id);UPDATE inventory.positions SET quantity=b.on_hand WHERE company_id=c AND id=p;IF b.on_hand>0 THEN INSERT INTO inventory.position_movements(company_id,position_id,quantity,reason,request_id) VALUES(c,p,b.on_hand,'LEGACY_UNASSIGNED_OPENING','migration-032');END IF;END LOOP;END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
-- During one multi-line dispatch, movements already consumed must no longer occupy the position.
CREATE FUNCTION inventory.position_reserved(pos uuid,excluding_pick uuid DEFAULT NULL) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 WITH pending AS(SELECT p.id,sum(a.quantity) AS qty,coalesce(sum(a.quantity) FILTER(WHERE l.id=excluding_pick),0) AS excluded FROM inventory.pick_positions a JOIN inventory.pick_lines l ON l.company_id=a.company_id AND l.id=a.pick_line_id JOIN inventory.picks p ON p.company_id=l.company_id AND p.id=l.pick_id WHERE a.company_id=core.current_company() AND a.position_id=pos AND p.state='PICKED' GROUP BY p.id)
 SELECT coalesce(sum(greatest(0,p.qty-p.excluded+coalesce((SELECT sum(m.quantity) FROM inventory.position_movements m WHERE m.company_id=core.current_company() AND m.position_id=pos AND m.document_id=p.id AND m.reason='PICK_POSITION'),0))),0) FROM pending p $$;

CREATE FUNCTION inventory.sync_positions() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE delta numeric;pos uuid;left_qty numeric;take numeric;x record;pick uuid:=nullif(current_setting('htt.dispatch_pick',true),'')::uuid;pline uuid:=nullif(current_setting('htt.dispatch_line',true),'')::uuid;explicit boolean;BEGIN
 delta:=NEW.on_hand;IF TG_OP='UPDATE' THEN delta:=NEW.on_hand-OLD.on_hand;END IF;IF delta=0 THEN RETURN NULL;END IF;
 pos:=inventory.ensure_unassigned(NEW.id);
 IF delta>0 THEN UPDATE inventory.positions SET quantity=quantity+delta WHERE company_id=NEW.company_id AND id=pos;INSERT INTO inventory.position_movements(company_id,position_id,document_id,quantity,reason,request_id,created_by) VALUES(NEW.company_id,pos,pick,delta,'AUTOMATIC_STOCK_CHANGE',current_setting('htt.request_id',true),core.current_actor());
 ELSE left_qty:=-delta;explicit:=EXISTS(SELECT 1 FROM inventory.pick_positions a JOIN inventory.pick_lines l ON l.company_id=a.company_id AND l.id=a.pick_line_id JOIN inventory.positions p ON p.company_id=a.company_id AND p.id=a.position_id WHERE a.company_id=NEW.company_id AND l.pick_id=pick AND l.id=pline AND p.stock_balance_id=NEW.id);
 IF explicit THEN
 FOR x IN SELECT p.id,sum(a.quantity) AS qty FROM inventory.pick_positions a JOIN inventory.pick_lines l ON l.company_id=a.company_id AND l.id=a.pick_line_id JOIN inventory.positions p ON p.company_id=a.company_id AND p.id=a.position_id WHERE a.company_id=NEW.company_id AND l.pick_id=pick AND l.id=pline AND p.stock_balance_id=NEW.id GROUP BY p.id ORDER BY p.id LOOP
 PERFORM 1 FROM inventory.positions WHERE company_id=NEW.company_id AND id=x.id AND quantity-inventory.position_reserved(x.id,pline)>=x.qty FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Selected batch/bin stock unavailable' USING ERRCODE='HI409';END IF;
 UPDATE inventory.positions SET quantity=quantity-x.qty WHERE company_id=NEW.company_id AND id=x.id;INSERT INTO inventory.position_movements(company_id,position_id,document_id,quantity,reason,request_id,created_by) VALUES(NEW.company_id,x.id,pick,-x.qty,'PICK_POSITION',current_setting('htt.request_id',true),core.current_actor());left_qty:=left_qty-x.qty;
 END LOOP;
 ELSE
 FOR x IN SELECT p.id,p.quantity FROM inventory.positions p JOIN inventory.lots l ON l.company_id=p.company_id AND l.id=p.lot_id WHERE p.company_id=NEW.company_id AND p.stock_balance_id=NEW.id AND p.quantity>0 ORDER BY (p.id=pos) DESC,l.received_on,p.id FOR UPDATE OF p LOOP
 take:=least(left_qty,greatest(0,x.quantity-inventory.position_reserved(x.id,pline)));IF take>0 THEN UPDATE inventory.positions SET quantity=quantity-take WHERE company_id=NEW.company_id AND id=x.id;INSERT INTO inventory.position_movements(company_id,position_id,document_id,quantity,reason,request_id,created_by) VALUES(NEW.company_id,x.id,pick,-take,'AUTOMATIC_STOCK_CHANGE',current_setting('htt.request_id',true),core.current_actor());left_qty:=left_qty-take;END IF;EXIT WHEN left_qty=0;END LOOP;END IF;
 IF left_qty<>0 THEN RAISE EXCEPTION 'Batch/bin stock allocation does not cover physical movement' USING ERRCODE='HI409';END IF;END IF;RETURN NULL;END $$;
CREATE TRIGGER synchronize_positions AFTER INSERT OR UPDATE ON inventory.stock_balances FOR EACH ROW EXECUTE FUNCTION inventory.sync_positions();
CREATE FUNCTION inventory.validate_positions() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE bid uuid;qty numeric;c uuid:=NEW.company_id;BEGIN
 IF TG_TABLE_NAME='stock_balances' THEN bid:=NEW.id;ELSE bid:=NEW.stock_balance_id;END IF;
 IF EXISTS(SELECT 1 FROM inventory.positions p JOIN inventory.stock_balances b ON b.company_id=p.company_id AND b.id=p.stock_balance_id JOIN inventory.bins bn ON bn.company_id=p.company_id AND bn.id=p.bin_id JOIN inventory.lots l ON l.company_id=p.company_id AND l.id=p.lot_id WHERE p.company_id=c AND p.stock_balance_id=bid AND(b.warehouse_id<>bn.warehouse_id OR b.product_id<>l.product_id OR p.quantity<inventory.position_reserved(p.id) OR p.quantity<>(SELECT coalesce(sum(m.quantity),0) FROM inventory.position_movements m WHERE m.company_id=p.company_id AND m.position_id=p.id))) OR (SELECT on_hand FROM inventory.stock_balances WHERE company_id=c AND id=bid) IS DISTINCT FROM (SELECT coalesce(sum(quantity),0) FROM inventory.positions WHERE company_id=c AND stock_balance_id=bid) THEN RAISE EXCEPTION 'Position quantity, warehouse/product or allocation invariant failed' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER position_consistency AFTER INSERT OR UPDATE ON inventory.positions DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inventory.validate_positions();
CREATE CONSTRAINT TRIGGER stock_position_consistency AFTER INSERT OR UPDATE ON inventory.stock_balances DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inventory.validate_positions();
CREATE FUNCTION inventory.move_position(source uuid,target_bin uuid,target_lot text,qty numeric,p_reference text,p_reason text,p_count uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();p inventory.positions;b inventory.stock_balances;bin inventory.bins;lot uuid;dest uuid;doc uuid:=gen_random_uuid();n bigint;prefix text;BEGIN
 SELECT * INTO p FROM inventory.positions WHERE company_id=c AND id=source;IF NOT FOUND THEN RAISE EXCEPTION 'Position unavailable' USING ERRCODE='HT404';END IF;SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND id=p.stock_balance_id;PERFORM inventory.require_access('inventory.locations.write',b.warehouse_id);
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND id=b.id FOR UPDATE;SELECT * INTO p FROM inventory.positions WHERE company_id=c AND id=source FOR UPDATE;SELECT * INTO bin FROM inventory.bins WHERE company_id=c AND id=target_bin AND warehouse_id=b.warehouse_id AND active;
 IF NOT FOUND OR qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>p.quantity-inventory.position_reserved(p.id) OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR target_lot IS NULL OR length(btrim(target_lot)) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'Invalid/free stock quantity, target bin, lot or reason' USING ERRCODE='HI409';END IF;
 IF NOT EXISTS(SELECT 1 FROM catalog.warehouses WHERE company_id=c AND id=b.warehouse_id AND active AND kind<>'TRANSIT') THEN RAISE EXCEPTION 'Active physical warehouse required' USING ERRCODE='HI409';END IF;
 IF (p_count IS NOT NULL OR (SELECT coalesce(sum(CASE WHEN reason='LEGACY_UNASSIGNED_OPENING' OR quantity<0 THEN quantity ELSE 0 END),0) FROM inventory.position_movements WHERE company_id=c AND position_id=source)>0) AND NOT EXISTS(SELECT 1 FROM inventory.counts cn JOIN inventory.count_lines cl ON cl.company_id=cn.company_id AND cl.count_id=cn.id JOIN inventory.operation_lines ol ON ol.company_id=cl.company_id AND ol.count_line_id=cl.id WHERE cn.company_id=c AND cn.id=p_count AND cn.state='POSTED' AND cn.warehouse_id=b.warehouse_id AND cl.product_id=b.product_id AND cl.counted_quantity=b.on_hand AND ol.revision_after=b.revision) THEN RAISE EXCEPTION 'Legacy unassigned stock requires a current posted count before allocation' USING ERRCODE='HI409';END IF;
 INSERT INTO inventory.lots(company_id,product_id,code,received_on) SELECT c,b.product_id,btrim(target_lot),(now() AT TIME ZONE timezone)::date FROM core.companies WHERE id=c ON CONFLICT DO NOTHING;SELECT id INTO lot FROM inventory.lots WHERE company_id=c AND product_id=b.product_id AND code=btrim(target_lot);
 INSERT INTO inventory.positions(company_id,stock_balance_id,bin_id,lot_id,quantity) VALUES(c,b.id,bin.id,lot,0) ON CONFLICT DO NOTHING;SELECT id INTO dest FROM inventory.positions WHERE company_id=c AND stock_balance_id=b.id AND bin_id=bin.id AND lot_id=lot;IF dest=source THEN RAISE EXCEPTION 'Source equals target' USING ERRCODE='HI422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=c AND document_type='LOCATION_MOVE' RETURNING next_value-1,document_sequences.prefix INTO n,prefix;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) SELECT doc,c,'LOCATION_MOVE',prefix||lpad(n::text,greatest(6,length(n::text)),'0'),(now() AT TIME ZONE timezone)::date,'POSTED',core.current_actor() FROM core.companies WHERE id=c;
 UPDATE inventory.positions SET quantity=quantity-qty WHERE company_id=c AND id=source;UPDATE inventory.positions SET quantity=quantity+qty WHERE company_id=c AND id=dest;
 INSERT INTO inventory.location_moves(id,company_id,warehouse_id,source_position_id,target_position_id,count_id,quantity,reference,reason,created_by) VALUES(doc,c,b.warehouse_id,source,dest,p_count,qty,btrim(p_reference),btrim(p_reason),core.current_actor());
 INSERT INTO inventory.position_movements(company_id,position_id,document_id,quantity,reason,request_id,created_by) VALUES(c,source,doc,-qty,btrim(p_reason),current_setting('htt.request_id',true),core.current_actor()),(c,dest,doc,qty,btrim(p_reason),current_setting('htt.request_id',true),core.current_actor());RETURN doc;END $$;
CREATE FUNCTION inventory.assign_pick_positions(pick uuid,items jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();p inventory.picks;wh uuid;l inventory.pick_lines;x jsonb;y jsonb;pos inventory.positions;total numeric;qty numeric;BEGIN
 SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pick;IF NOT FOUND THEN RAISE EXCEPTION 'Pick unavailable' USING ERRCODE='HT404';END IF;SELECT warehouse_id INTO wh FROM sales.orders WHERE company_id=c AND id=p.order_id;PERFORM inventory.require_access('inventory.picks.write',wh);SELECT * INTO p FROM inventory.picks WHERE company_id=c AND id=pick FOR UPDATE;
 IF p.state<>'PICKED' THEN RAISE EXCEPTION 'Only open pick positions can be assigned' USING ERRCODE='HI409';END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(items) LOOP
 IF x->'positions' IS NULL OR x->'positions'='null'::jsonb THEN CONTINUE;END IF;
 SELECT * INTO l FROM inventory.pick_lines WHERE company_id=c AND pick_id=pick AND order_line_id=(x->>'orderLineId')::uuid;IF NOT FOUND THEN RAISE EXCEPTION 'Pick line unavailable' USING ERRCODE='HT404';END IF;IF EXISTS(SELECT 1 FROM inventory.pick_positions WHERE company_id=c AND pick_line_id=l.id) THEN RAISE EXCEPTION 'Pick positions already assigned; cancel and recreate the pick' USING ERRCODE='HI409';END IF;
 PERFORM 1 FROM inventory.stock_balances b JOIN inventory.positions z ON z.company_id=b.company_id AND z.stock_balance_id=b.id WHERE z.company_id=c AND z.id IN(SELECT (v->>'positionId')::uuid FROM jsonb_array_elements(x->'positions')v) ORDER BY b.warehouse_id,b.product_id FOR UPDATE OF b;
 total:=0;FOR y IN SELECT * FROM jsonb_array_elements(x->'positions') ORDER BY value->>'positionId' LOOP
 qty:=(y->>'baseQuantity')::numeric;SELECT * INTO pos FROM inventory.positions WHERE company_id=c AND id=(y->>'positionId')::uuid FOR UPDATE;
 IF NOT FOUND OR qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>pos.quantity-inventory.position_reserved(pos.id) OR NOT EXISTS(SELECT 1 FROM inventory.bins bn WHERE bn.company_id=c AND bn.id=pos.bin_id AND bn.active) OR NOT EXISTS(SELECT 1 FROM inventory.stock_balances b JOIN sales.order_lines ol ON ol.company_id=b.company_id AND ol.product_id=b.product_id WHERE b.company_id=c AND b.id=pos.stock_balance_id AND b.warehouse_id=wh AND ol.id=l.order_line_id) THEN RAISE EXCEPTION 'Pick position source/capacity invalid' USING ERRCODE='HI409';END IF;
 INSERT INTO inventory.pick_positions(company_id,pick_line_id,position_id,quantity) VALUES(c,l.id,pos.id,qty);total:=total+qty;END LOOP;
 IF total<>l.base_quantity THEN RAISE EXCEPTION 'Position total must equal full pick-line base quantity' USING ERRCODE='HI422';END IF;
 END LOOP;END $$;
ALTER FUNCTION inventory.confirm_pick(uuid,bigint,text,text,text) RENAME TO confirm_pick_without_positions;
CREATE OR REPLACE FUNCTION inventory.confirm_pick_without_positions(pid uuid,expected bigint,p_mode text,p_recipient text,p_reference text) RETURNS uuid
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
 PERFORM set_config('htt.dispatch_line',l.id::text,true);
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
CREATE FUNCTION inventory.confirm_pick(pick uuid,expected bigint,mode text,recipient text,reference text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE prior text:=current_setting('htt.dispatch_pick',true);prior_line text:=current_setting('htt.dispatch_line',true);j uuid;BEGIN PERFORM set_config('htt.dispatch_pick',pick::text,true);j:=inventory.confirm_pick_without_positions(pick,expected,mode,recipient,reference);PERFORM set_config('htt.dispatch_pick',coalesce(prior,''),true);PERFORM set_config('htt.dispatch_line',coalesce(prior_line,''),true);RETURN j;END $$;
REVOKE ALL ON FUNCTION identity.seed_location_roles(uuid),inventory.ensure_unassigned(uuid),inventory.position_reserved(uuid,uuid),inventory.sync_positions(),inventory.validate_positions(),inventory.move_position(uuid,uuid,text,numeric,text,text,uuid),inventory.assign_pick_positions(uuid,jsonb),inventory.confirm_pick_without_positions(uuid,bigint,text,text,text),inventory.confirm_pick(uuid,bigint,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION inventory.confirm_pick_without_positions(uuid,bigint,text,text,text) FROM htt_app;
GRANT EXECUTE ON FUNCTION inventory.move_position(uuid,uuid,text,numeric,text,text,uuid),inventory.assign_pick_positions(uuid,jsonb),inventory.confirm_pick(uuid,bigint,text,text,text),inventory.position_reserved(uuid,uuid) TO htt_app;
GRANT SELECT ON inventory.bins,inventory.lots,inventory.positions,inventory.position_movements,inventory.location_moves,inventory.pick_positions,inventory.pick_shortages TO htt_app;
GRANT INSERT ON inventory.bins,inventory.pick_shortages TO htt_app;
CREATE OR REPLACE FUNCTION platform.require_document_access(doc uuid,action text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;customer uuid;required text;BEGIN
 required:=CASE action WHEN 'READ' THEN 'documents.files.read' WHEN 'PDF' THEN 'documents.pdf.request' WHEN 'EMAIL' THEN 'documents.email.send' WHEN 'UPLOAD' THEN 'documents.attachments.write' ELSE NULL END;
 IF required IS NULL THEN RAISE EXCEPTION 'Invalid document action' USING ERRCODE='HD422';END IF;
 PERFORM purchase.require_access(required);
 SELECT document_type INTO typ FROM platform.documents WHERE company_id=core.current_company() AND id=doc AND deleted_at IS NULL AND platform.document_visible(doc);
 IF NOT FOUND THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
 IF typ='QUOTE' THEN
  SELECT customer_id INTO customer FROM sales.quotes WHERE company_id=core.current_company() AND id=doc;
  PERFORM sales.require_customer_access('sales.quotes.read',customer);
  IF action='EMAIL' THEN PERFORM purchase.require_access('sales.quotes.send');END IF;
 ELSIF typ='INVOICE' THEN
  SELECT customer_id INTO customer FROM sales.invoices WHERE company_id=core.current_company() AND id=doc;
  PERFORM sales.require_customer_access('sales.invoices.read',customer);
  IF action='EMAIL' THEN PERFORM purchase.require_access('sales.invoices.send');END IF;
 ELSIF typ='PURCHASE_ORDER' THEN
  PERFORM purchase.require_access('purchase.orders.read');PERFORM purchase.require_access('purchase.cost.read');
  IF action='EMAIL' THEN PERFORM purchase.require_access('purchase.orders.send');END IF;
 ELSIF typ='PICK' THEN
 IF action NOT IN('READ','UPLOAD') THEN RAISE EXCEPTION 'Warehouse handover supports private attachments only' USING ERRCODE='HD422';END IF;PERFORM inventory.require_access('inventory.picks.read',(SELECT o.warehouse_id FROM inventory.picks pk JOIN sales.orders o ON o.company_id=pk.company_id AND o.id=pk.order_id WHERE pk.company_id=core.current_company() AND pk.id=doc));
 ELSIF typ IN('SUPPLIER_BILL','SUPPLIER_CREDIT') THEN IF action NOT IN('READ','UPLOAD') THEN RAISE EXCEPTION 'Procurement document supports private attachments only' USING ERRCODE='HD422';END IF;PERFORM purchase.require_access(CASE WHEN typ='SUPPLIER_BILL' THEN 'purchase.bills.read' ELSE 'purchase.credits.read' END);
 ELSE RAISE EXCEPTION 'This document type has no file/output workflow yet' USING ERRCODE='HD422';END IF;
 RETURN typ;
END $$;

CREATE UNIQUE INDEX location_reference_ci ON inventory.location_moves(company_id,lower(btrim(reference)));
CREATE OR REPLACE FUNCTION accounting.reconciliation_checks()
RETURNS TABLE(check_code text,entity_id uuid,expected numeric,actual numeric,unit text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM accounting.require_reconciliation_access();
 RETURN QUERY
 WITH
 stock_deltas AS (
  SELECT b.id AS balance_id,o.quantity AS qty,0::numeric AS val
  FROM inventory.stock_openings o JOIN inventory.stock_balances b ON b.company_id=o.company_id AND b.warehouse_id=o.warehouse_id AND b.product_id=o.product_id WHERE o.company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,0,value FROM inventory.valuation_openings WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,base_quantity,valuation_amount FROM purchase.receipt_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
  UNION ALL SELECT stock_balance_id,-quantity,-cost FROM inventory.stock_movements WHERE company_id=core.current_company()
  UNION ALL SELECT b.id,l.base_quantity,l.cost FROM inventory.sales_return_lines l JOIN inventory.sales_returns r ON r.company_id=l.company_id AND r.id=l.return_id JOIN sales.order_lines ol ON ol.company_id=l.company_id AND ol.id=l.order_line_id JOIN inventory.stock_balances b ON b.company_id=r.company_id AND b.warehouse_id=r.warehouse_id AND b.product_id=ol.product_id WHERE l.company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,-base_quantity,-cost FROM purchase.return_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
  UNION ALL SELECT stock_balance_id,quantity_delta,value_delta FROM inventory.operation_lines WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,-quantity,-cost FROM inventory.transit_transfer_lines WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,quantity,cost FROM inventory.transit_event_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
 UNION ALL SELECT stock_balance_id,0,inventory_delta FROM inventory.purchase_value_adjustments WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
 ), stock_totals AS (SELECT balance_id,sum(qty) AS qty,sum(val) AS val FROM stock_deltas GROUP BY balance_id),
 stock AS (
  SELECT b.*,v.value,coalesce(t.qty,0) AS ledger_qty,coalesce(t.val,0) AS ledger_val,
   coalesce((SELECT sum(r.remaining_quantity) FROM inventory.stock_reservations r WHERE r.company_id=b.company_id AND r.stock_balance_id=b.id),0) AS ledger_reserved
  FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id LEFT JOIN stock_totals t ON t.balance_id=b.id WHERE b.company_id=core.current_company()
 ), gl AS (
  SELECT a.id,a.control_kind,l.party_id,sum(l.debit-l.credit) AS balance
  FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=core.current_company() GROUP BY a.id,a.control_kind,l.party_id
 ), ar_lines AS (SELECT id,customer_id,party_id,remaining_gross-net_paid_amount AS balance FROM sales.invoice_line_balances WHERE company_id=core.current_company()
 ), ar_customer AS (SELECT customer_id,sum(balance) AS balance FROM ar_lines GROUP BY customer_id),
 ar_party AS (SELECT party_id,sum(balance) AS balance FROM ar_lines GROUP BY party_id),
 customer_advances AS (
  SELECT a.id,r.customer_id,a.advance_account_id,a.clearing_account_id,a.amount
   -coalesce((SELECT sum(ap.amount) FROM accounting.active_advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)
   -coalesce((SELECT sum(f.amount) FROM accounting.active_customer_refunds f WHERE f.company_id=a.company_id AND f.advance_id=a.id),0) AS balance
  FROM accounting.active_customer_advances a JOIN accounting.active_customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=core.current_company()
 ), unbilled AS (SELECT customer_id,sum(amount-released_amount) AS balance FROM sales.credit_commitments WHERE company_id=core.current_company() GROUP BY customer_id),
 ap_party AS (SELECT party_id,sum(outstanding_amount-available_credit) AS balance FROM accounting.ap_balances WHERE company_id=core.current_company() GROUP BY party_id),
 transit_accounts AS (
  SELECT transit_account_id AS id FROM inventory.transit_transfers WHERE company_id=core.current_company() AND transit_account_id IS NOT NULL
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='INVENTORY_TRANSIT'
 ), advance_accounts AS (
  SELECT advance_account_id AS id FROM customer_advances
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='CUSTOMER_ADVANCES'
 ), supplier_advance_accounts AS (
  SELECT account_id AS id FROM accounting.supplier_advances WHERE company_id=core.current_company()
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='SUPPLIER_ADVANCES'
 ), return_accounts AS (
  SELECT contra_account_id AS id FROM purchase.return_lines WHERE company_id=core.current_company() AND bill_line_id IS NOT NULL AND contra_account_id IS NOT NULL
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='PURCHASE_RETURN_CLEARING'
 ), grni_party AS (
  SELECT g.party_id,sum(g.amount
   -coalesce((SELECT sum(b.grni_amount) FROM purchase.bill_lines b WHERE b.company_id=g.company_id AND b.grni_item_id=g.id),0)
   -coalesce((SELECT sum(r.valuation_amount) FROM purchase.return_lines r WHERE r.company_id=g.company_id AND r.receipt_line_id=g.receipt_line_id AND r.bill_line_id IS NULL),0)) AS balance
  FROM accounting.grni_items g WHERE g.company_id=core.current_company() GROUP BY g.party_id
 ), checks AS (
  SELECT 'stock.quantity'::text AS code,s.id AS entity,s.ledger_qty AS e,s.on_hand AS a,'BASE_QUANTITY'::text AS u FROM stock s
  UNION ALL SELECT 'stock.value',s.id,s.ledger_val,coalesce(s.value,0),'AUD' FROM stock s
  UNION ALL SELECT 'stock.valuation_missing',s.id,1,CASE WHEN s.value IS NULL THEN 0 ELSE 1 END,'COUNT' FROM stock s WHERE s.on_hand>0
  UNION ALL SELECT 'stock.reserved',s.id,s.ledger_reserved,s.reserved,'BASE_QUANTITY' FROM stock s
  UNION ALL SELECT 'reservation.consumed',r.id,coalesce((SELECT sum(m.quantity) FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id WHERE pl.company_id=r.company_id AND pl.order_line_id=r.order_line_id),0),r.consumed_quantity,'BASE_QUANTITY' FROM inventory.stock_reservations r WHERE r.company_id=core.current_company()
  UNION ALL SELECT 'credit.receivable',c.id,coalesce(a.balance,0),coalesce(x.receivable,0),'AUD' FROM crm.customers c LEFT JOIN ar_customer a ON a.customer_id=c.id LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.unbilled',c.id,coalesce(b.balance,0),coalesce(x.unbilled_orders,0),'AUD' FROM crm.customers c LEFT JOIN unbilled b ON b.customer_id=c.id LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.advances',c.id,coalesce((SELECT sum(balance) FROM customer_advances ad WHERE ad.customer_id=c.id),0),coalesce(x.available_advances,0),'AUD' FROM crm.customers c LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.projection_missing',c.id,1,CASE WHEN x.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM crm.customers c LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.commitment',co.id,CASE WHEN d.state='CANCELLED' THEN 0 ELSE o.gross-coalesce((SELECT sum(i.gross) FROM sales.invoices i WHERE i.company_id=co.company_id AND i.order_id=o.id),0)-coalesce((SELECT sum(r.cancelled_gross) FROM inventory.sales_return_lines r JOIN sales.order_lines ol ON ol.company_id=r.company_id AND ol.id=r.order_line_id WHERE ol.company_id=co.company_id AND ol.order_id=o.id AND r.invoice_line_id IS NULL),0) END,co.amount-co.released_amount,'AUD' FROM sales.credit_commitments co JOIN sales.orders o ON o.company_id=co.company_id AND o.id=co.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE co.company_id=core.current_company()
  UNION ALL SELECT 'invoice.lines',i.id,i.gross,coalesce((SELECT sum(l.gross) FROM sales.invoice_lines l WHERE l.company_id=i.company_id AND l.invoice_id=i.id),0),'AUD' FROM sales.invoices i WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'invoice.receivable',i.id,i.gross,coalesce(r.amount,0),'AUD' FROM sales.invoices i LEFT JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'invoice.receivable_missing',i.id,1,CASE WHEN r.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM sales.invoices i LEFT JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'bill.lines',b.id,b.gross,coalesce((SELECT sum(l.net+l.tax) FROM purchase.bill_lines l WHERE l.company_id=b.company_id AND l.bill_id=b.id),0),'AUD' FROM purchase.bills b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'bill.payable',b.id,b.gross,coalesce(a.amount,0),'AUD' FROM purchase.bills b LEFT JOIN accounting.ap_items a ON a.company_id=b.company_id AND a.bill_id=b.id WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'bill.payable_missing',b.id,1,CASE WHEN a.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM purchase.bills b LEFT JOIN accounting.ap_items a ON a.company_id=b.company_id AND a.bill_id=b.id WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'gl.inventory',core.current_company(),coalesce((SELECT sum(value) FROM stock),0)+coalesce((SELECT sum(remaining_cost) FROM inventory.transit_line_balances WHERE company_id=core.current_company()),0),coalesce((SELECT sum(balance) FROM gl WHERE control_kind='INVENTORY'),0),'AUD'
  UNION ALL SELECT 'gl.transit',ta.id,coalesce((SELECT sum(b.remaining_cost) FROM inventory.transit_line_balances b JOIN inventory.transit_transfers t ON t.company_id=b.company_id AND t.id=b.transfer_id WHERE b.company_id=core.current_company() AND t.transit_account_id=ta.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=ta.id),0),'AUD' FROM transit_accounts ta
  UNION ALL SELECT 'gl.receivable',p.id,coalesce(a.balance,0),coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AR' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN ar_party a ON a.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.receivable_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AR' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.payable',p.id,coalesce(a.balance,0),-coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AP' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN ap_party a ON a.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.payable_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AP' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.grni',p.id,coalesce(g.balance,0),-coalesce((SELECT sum(balance) FROM gl WHERE control_kind='GRNI' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN grni_party g ON g.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.grni_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='GRNI' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.customer_advances',aa.id,coalesce((SELECT sum(balance) FROM customer_advances WHERE advance_account_id=aa.id),0),-coalesce((SELECT sum(balance) FROM gl WHERE id=aa.id),0),'AUD' FROM advance_accounts aa
  UNION ALL SELECT 'gl.supplier_advances',aa.id,coalesce((SELECT sum(available) FROM accounting.supplier_advance_balances WHERE company_id=core.current_company() AND account_id=aa.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=aa.id),0),'AUD' FROM supplier_advance_accounts aa
  UNION ALL SELECT 'gl.purchase_return_clearing',ra.id,coalesce((SELECT sum(r.valuation_amount-coalesce((SELECT sum(cl.net+cl.tax-cl.recoverable_tax+cl.clearing_adjustment) FROM purchase.supplier_credit_lines cl WHERE cl.company_id=r.company_id AND cl.return_line_id=r.id),0)) FROM purchase.return_lines r WHERE r.company_id=core.current_company() AND r.bill_line_id IS NOT NULL AND r.contra_account_id=ra.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=ra.id),0),'AUD' FROM return_accounts ra
  UNION ALL SELECT 'journal.balance',j.id,0,coalesce(sum(l.debit-l.credit),0),'AUD' FROM accounting.journal_entries j LEFT JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id WHERE j.company_id=core.current_company() GROUP BY j.id
  UNION ALL SELECT 'journal.lines',j.id,1,CASE WHEN count(l.id)>=2 THEN 1 ELSE 0 END,'COUNT' FROM accounting.journal_entries j LEFT JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id WHERE j.company_id=core.current_company() GROUP BY j.id
  UNION ALL SELECT 'journal.batch_entry',b.id,1,count(j.id)::numeric,'COUNT' FROM accounting.posting_batches b LEFT JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id WHERE b.company_id=core.current_company() GROUP BY b.id

  UNION ALL SELECT 'credit_application.total',a.id,a.amount,coalesce((SELECT sum(amount) FROM purchase.credit_application_lines WHERE company_id=a.company_id AND application_id=a.id),0),'AUD' FROM purchase.credit_applications a WHERE a.company_id=core.current_company()
  UNION ALL SELECT 'credit_unapplication.total',u.id,a.amount,u.amount,'AUD' FROM purchase.credit_unapplications u JOIN purchase.credit_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'credit_application.capacity',cl.id,0,greatest(0,-cl.unallocated_amount),'AUD' FROM purchase.supplier_credit_line_balances cl WHERE cl.company_id=core.current_company()
  UNION ALL SELECT 'credit_application.funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM purchase.bill_line_balances b WHERE b.company_id=core.current_company() AND EXISTS(SELECT 1 FROM purchase.credit_application_lines l WHERE l.company_id=b.company_id AND b.id IN(l.source_bill_line_id,l.target_bill_line_id))

  UNION ALL SELECT 'customer_credit_application.total',a.id,a.amount,coalesce((SELECT sum(amount) FROM sales.credit_application_lines WHERE company_id=a.company_id AND application_id=a.id),0),'AUD' FROM sales.credit_applications a WHERE a.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_unapplication.total',u.id,a.amount,u.amount,'AUD' FROM sales.credit_unapplications u JOIN sales.credit_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_application.capacity',cl.id,0,greatest(0,-cl.unallocated_amount),'AUD' FROM sales.customer_credit_line_balances cl WHERE cl.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_application.funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM sales.invoice_line_balances b WHERE b.company_id=core.current_company() AND EXISTS(SELECT 1 FROM sales.credit_application_lines l WHERE l.company_id=b.company_id AND b.id IN(l.source_invoice_line_id,l.target_invoice_line_id))

  UNION ALL SELECT 'receipt_reversal.amount',x.id,r.amount,x.amount,'AUD' FROM accounting.receipt_reversals x JOIN accounting.customer_receipts r ON r.company_id=x.company_id AND r.id=x.receipt_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'advance_unapplication.amount',x.id,a.amount,x.amount,'AUD' FROM accounting.advance_unapplications x JOIN accounting.advance_applications a ON a.company_id=x.company_id AND a.id=x.application_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM sales.invoice_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'advance.negative_available',b.id,0,greatest(0,-b.available),'AUD' FROM accounting.customer_advance_balances b WHERE b.company_id=core.current_company()

  UNION ALL SELECT 'supplier_payment_reversal.amount',r.id,p.amount,r.amount,'AUD' FROM accounting.supplier_payment_reversals r JOIN accounting.supplier_payments p ON p.company_id=r.company_id AND p.id=r.payment_id WHERE r.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance_unapplication.amount',u.id,a.amount,u.amount,'AUD' FROM accounting.supplier_advance_unapplications u JOIN accounting.supplier_advance_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'supplier_settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM purchase.bill_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance.negative_available',a.id,0,greatest(0,-a.available),'AUD' FROM accounting.supplier_advance_balances a WHERE a.company_id=core.current_company()

  UNION ALL SELECT 'customer_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.customer_refund_reversals v JOIN accounting.customer_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()

  UNION ALL SELECT 'supplier_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.supplier_refund_reversals v JOIN accounting.supplier_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()

 UNION ALL SELECT 'stock.position_quantity',b.id,b.on_hand,coalesce((SELECT sum(quantity) FROM inventory.positions WHERE company_id=b.company_id AND stock_balance_id=b.id),0),'BASE_QUANTITY' FROM inventory.stock_balances b WHERE b.company_id=core.current_company()
 UNION ALL SELECT 'stock.position_ledger',p.id,p.quantity,coalesce((SELECT sum(quantity) FROM inventory.position_movements WHERE company_id=p.company_id AND position_id=p.id),0),'BASE_QUANTITY' FROM inventory.positions p WHERE p.company_id=core.current_company()
 ) SELECT code,entity,e,a,u FROM checks;
END $$;

CREATE FUNCTION inventory.validate_pick_positions() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE l inventory.pick_lines;BEGIN
 SELECT * INTO l FROM inventory.pick_lines WHERE company_id=NEW.company_id AND id=NEW.pick_line_id;
 IF l.base_quantity<>(SELECT sum(quantity) FROM inventory.pick_positions WHERE company_id=NEW.company_id AND pick_line_id=l.id) OR EXISTS(SELECT 1 FROM inventory.pick_positions a JOIN inventory.positions p ON p.company_id=a.company_id AND p.id=a.position_id JOIN inventory.stock_balances b ON b.company_id=p.company_id AND b.id=p.stock_balance_id JOIN inventory.picks pk ON pk.company_id=l.company_id AND pk.id=l.pick_id JOIN sales.orders o ON o.company_id=pk.company_id AND o.id=pk.order_id JOIN sales.order_lines ol ON ol.company_id=l.company_id AND ol.id=l.order_line_id WHERE a.company_id=NEW.company_id AND a.pick_line_id=l.id AND(b.warehouse_id<>o.warehouse_id OR b.product_id<>ol.product_id OR p.quantity<inventory.position_reserved(p.id))) THEN RAISE EXCEPTION 'Pick position source/quantity invariant failed' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER pick_position_consistency AFTER INSERT ON inventory.pick_positions DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inventory.validate_pick_positions();
REVOKE ALL ON FUNCTION inventory.validate_pick_positions() FROM PUBLIC;

CREATE FUNCTION inventory.configure_bin(bid uuid,expected bigint,p_name text,p_active boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE b inventory.bins;BEGIN
 SELECT * INTO b FROM inventory.bins WHERE company_id=core.current_company() AND id=bid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Bin unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('inventory.locations.write',b.warehouse_id);
 -- Same stock-first lock order as location movements and pick assignment.
 PERFORM 1 FROM inventory.stock_balances WHERE company_id=b.company_id AND warehouse_id=b.warehouse_id ORDER BY product_id FOR UPDATE;
 SELECT * INTO b FROM inventory.bins WHERE company_id=core.current_company() AND id=bid FOR UPDATE;
 IF b.version<>expected THEN RAISE EXCEPTION 'Bin changed' USING ERRCODE='HI409';END IF;
 IF p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 200 OR p_active IS NULL THEN RAISE EXCEPTION 'Valid name/status required' USING ERRCODE='HI422';END IF;
 IF NOT p_active AND(b.code='UNASSIGNED' OR EXISTS(SELECT 1 FROM inventory.positions WHERE company_id=b.company_id AND bin_id=b.id AND quantity>0)) THEN RAISE EXCEPTION 'Unassigned or occupied bin cannot be disabled' USING ERRCODE='HI409';END IF;
 UPDATE inventory.bins SET name=btrim(p_name),active=p_active WHERE company_id=b.company_id AND id=b.id;END $$;
REVOKE ALL ON FUNCTION inventory.configure_bin(uuid,bigint,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.configure_bin(uuid,bigint,text,boolean) TO htt_app;
