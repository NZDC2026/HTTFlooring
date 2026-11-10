-- Forward-only policy and physical batches. Existing products retain MWA and all historical ledgers.
CREATE TABLE inventory.costing_policies(
 company_id uuid NOT NULL,product_id uuid NOT NULL,method text NOT NULL CHECK(method IN('MOVING_WEIGHTED_AVERAGE','FIFO')),
 version bigint NOT NULL DEFAULT 1,updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_by uuid REFERENCES identity.users(id),
 PRIMARY KEY(company_id,product_id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id));
CREATE TABLE inventory.stock_batches(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sequence bigint GENERATED ALWAYS AS IDENTITY,
 company_id uuid NOT NULL,stock_balance_id uuid NOT NULL,source_document_id uuid,
 batch_number text NOT NULL,income_date date,quantity numeric(20,6) NOT NULL CHECK(quantity>=0),
 value numeric(20,2) CHECK(value>=0),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id));
CREATE TABLE inventory.batch_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,stock_balance_id uuid NOT NULL,source_document_id uuid,
 method text NOT NULL,quantity_delta numeric(20,6) NOT NULL,value_delta numeric(20,2) NOT NULL,
 allocations jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id));
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['costing_policies','stock_batches','batch_events'] LOOP
 EXECUTE format('ALTER TABLE inventory.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE inventory.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON inventory.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);
 END LOOP;END $$;
CREATE INDEX stock_batch_remaining ON inventory.stock_batches(company_id,stock_balance_id,sequence) WHERE quantity>0;
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.batch_events FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
INSERT INTO identity.permissions(code,description) VALUES('inventory.costing.configure','Change future costing method only with zero stock/value at every warehouse');
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP
 PERFORM set_config('htt.company_id',c::text,true);
 INSERT INTO inventory.costing_policies(company_id,product_id,method) SELECT c,id,'MOVING_WEIGHTED_AVERAGE' FROM catalog.products WHERE company_id=c AND item_type='STOCK';
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'inventory.costing.configure' FROM identity.roles WHERE company_id=c AND code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING;
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION inventory.new_product_costing() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.item_type='STOCK' THEN INSERT INTO inventory.costing_policies(company_id,product_id,method) VALUES(NEW.company_id,NEW.id,'FIFO');END IF;RETURN NEW;
END $$;
CREATE TRIGGER prospective_fifo AFTER INSERT ON catalog.products FOR EACH ROW EXECUTE FUNCTION inventory.new_product_costing();
CREATE FUNCTION inventory.costing_method(balance_id uuid) RETURNS text LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT coalesce(p.method,'MOVING_WEIGHTED_AVERAGE') FROM inventory.stock_balances b LEFT JOIN inventory.costing_policies p ON p.company_id=b.company_id AND p.product_id=b.product_id WHERE b.company_id=core.current_company() AND b.id=balance_id
$$;
CREATE FUNCTION inventory.set_costing_method(product uuid,expected bigint,new_method text,reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE old inventory.costing_policies;c uuid:=core.current_company();BEGIN
 PERFORM purchase.require_access('inventory.costing.configure');
 IF new_method IS NULL OR new_method NOT IN('MOVING_WEIGHTED_AVERAGE','FIFO') OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'Method and reason required' USING ERRCODE='HI422';END IF;
 PERFORM 1 FROM catalog.products WHERE company_id=c AND id=product AND item_type='STOCK' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock product unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO old FROM inventory.costing_policies WHERE company_id=c AND product_id=product FOR UPDATE;
 IF old.version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Costing policy changed' USING ERRCODE='HI409';END IF;
 IF old.method=new_method THEN RETURN;END IF;
 PERFORM 1 FROM inventory.stock_balances WHERE company_id=c AND product_id=product ORDER BY id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=c AND b.product_id=product AND (b.on_hand<>0 OR coalesce(v.value,0)<>0)) THEN RAISE EXCEPTION 'Clear stock and value at every warehouse before changing method' USING ERRCODE='HI409';END IF;
 UPDATE inventory.costing_policies SET method=new_method,version=version+1,updated_at=clock_timestamp(),updated_by=core.current_actor() WHERE company_id=c AND product_id=product;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
 VALUES(c,core.current_actor(),'inventory.costing_changed','product',product,coalesce(current_setting('htt.request_id',true),'costing'),jsonb_build_object('before',old.method,'after',new_method,'reason',btrim(reason)));
END $$;
CREATE FUNCTION inventory.issue_cost(balance_id uuid,qty numeric,on_hand numeric,pool_value numeric) RETURNS numeric
LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$ DECLARE l record;remaining numeric:=qty;take numeric;cost numeric:=0;BEGIN
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>on_hand THEN RAISE EXCEPTION 'Invalid inventory issue' USING ERRCODE='HI422';END IF;
 IF inventory.costing_method(balance_id)<>'FIFO' THEN RETURN CASE WHEN qty=on_hand THEN pool_value ELSE round(pool_value*qty/on_hand,2) END;END IF;
 IF (SELECT coalesce(sum(quantity),0) FROM inventory.stock_batches WHERE company_id=core.current_company() AND stock_balance_id=balance_id)<>on_hand OR (SELECT coalesce(sum(value),0) FROM inventory.stock_batches WHERE company_id=core.current_company() AND stock_balance_id=balance_id)<>pool_value THEN RAISE EXCEPTION 'FIFO layers differ from stock/value evidence' USING ERRCODE='HI409';END IF;
 FOR l IN SELECT * FROM inventory.stock_batches WHERE company_id=core.current_company() AND stock_balance_id=balance_id AND quantity>0 ORDER BY sequence LOOP
 take:=least(remaining,l.quantity);cost:=cost+CASE WHEN take=l.quantity THEN l.value ELSE round(l.value*take/l.quantity,2) END;remaining:=remaining-take;EXIT WHEN remaining=0;
 END LOOP;
 IF remaining<>0 THEN RAISE EXCEPTION 'FIFO layer unavailable' USING ERRCODE='HI409';END IF;RETURN cost;
END $$;
CREATE FUNCTION inventory.remember_quantity_before() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.on_hand<>OLD.on_hand THEN PERFORM set_config('htt.batch_before_'||replace(NEW.id::text,'-',''),OLD.on_hand::text,true);END IF;RETURN NEW;
END $$;
CREATE TRIGGER batch_before_quantity BEFORE UPDATE ON inventory.stock_balances FOR EACH ROW EXECUTE FUNCTION inventory.remember_quantity_before();
CREATE FUNCTION inventory.sync_stock_batches() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE b inventory.stock_balances;method text;before_qty numeric;tracked numeric;delta numeric;vd numeric;l record;take numeric;remaining numeric;spent numeric:=0;part numeric;doc uuid;income date;number text;alloc jsonb:='[]';new_layer uuid;remaining_adjustment numeric;total_quantity numeric;BEGIN
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=NEW.company_id AND id=NEW.stock_balance_id FOR UPDATE;
 method:=inventory.costing_method(b.id);
 before_qty:=CASE WHEN TG_OP='INSERT' THEN 0 ELSE coalesce(nullif(current_setting('htt.batch_before_'||replace(b.id::text,'-',''),true),'')::numeric,b.on_hand) END;
 vd:=NEW.value-CASE WHEN TG_OP='INSERT' THEN 0 ELSE OLD.value END;delta:=b.on_hand-before_qty;
 SELECT coalesce(sum(quantity),0) INTO tracked FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id;
 IF tracked=0 AND before_qty>0 AND method='MOVING_WEIGHTED_AVERAGE' THEN
 INSERT INTO inventory.stock_batches(company_id,stock_balance_id,batch_number,quantity) VALUES(b.company_id,b.id,'Not recorded',before_qty);tracked:=before_qty;
 END IF;
 IF tracked<>before_qty THEN RAISE EXCEPTION 'Physical batches differ from stock evidence' USING ERRCODE='HI409';END IF;
 doc:=nullif(current_setting('htt.stock_document_id',true),'')::uuid;
 IF TG_OP='INSERT' THEN doc:=NEW.opening_document_id;END IF;
 SELECT d.number,d.business_date INTO number,income FROM platform.documents d WHERE d.company_id=b.company_id AND d.id=doc;
 IF delta>0 THEN
 IF vd<0 THEN RAISE EXCEPTION 'Incoming stock cannot have negative value' USING ERRCODE='HI409';END IF;
 INSERT INTO inventory.stock_batches(company_id,stock_balance_id,source_document_id,batch_number,income_date,quantity,value)
 VALUES(b.company_id,b.id,doc,coalesce(number,'Not recorded'),income,delta,CASE WHEN method='FIFO' THEN vd END) RETURNING id INTO new_layer;
 alloc:=jsonb_build_array(jsonb_build_object('batchId',new_layer,'quantity',delta::text,'value',CASE WHEN method='FIFO' THEN vd::text END));
 ELSIF delta<0 THEN
 remaining:=-delta;
 FOR l IN SELECT * FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id AND quantity>0
 ORDER BY CASE WHEN method='MOVING_WEIGHTED_AVERAGE' THEN income_date END NULLS FIRST,sequence FOR UPDATE LOOP
 take:=least(remaining,l.quantity);part:=CASE WHEN method='FIFO' THEN CASE WHEN take=l.quantity THEN l.value ELSE round(l.value*take/l.quantity,2) END ELSE 0 END;
 UPDATE inventory.stock_batches SET quantity=quantity-take,value=CASE WHEN method='FIFO' THEN value-part ELSE NULL END WHERE id=l.id;
 alloc:=alloc||jsonb_build_array(jsonb_build_object('batchId',l.id,'batchNumber',l.batch_number,'incomeDate',l.income_date,'quantity',take::text,'value',CASE WHEN method='FIFO' THEN part::text END));
 spent:=spent+part;remaining:=remaining-take;EXIT WHEN remaining=0;
 END LOOP;
 IF remaining<>0 OR (method='FIFO' AND spent<>-vd) THEN RAISE EXCEPTION 'Issue cost differs from frozen FIFO allocation' USING ERRCODE='HI409';END IF;
 ELSIF vd<>0 AND method='FIFO' THEN
 -- A newly posted supplier variance changes remaining value, never past issue costs.
 total_quantity:=tracked;remaining_adjustment:=vd;
 IF total_quantity=0 THEN RAISE EXCEPTION 'Cannot revalue empty FIFO stock' USING ERRCODE='HI409';END IF;
 FOR l IN SELECT * FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id AND quantity>0 ORDER BY sequence FOR UPDATE LOOP
 part:=CASE WHEN l.quantity=total_quantity THEN remaining_adjustment ELSE round(vd*l.quantity/tracked,2) END;
 IF l.value+part<0 THEN RAISE EXCEPTION 'FIFO value adjustment would overdraw a layer' USING ERRCODE='HI409';END IF;
 UPDATE inventory.stock_batches SET value=value+part WHERE id=l.id;
 alloc:=alloc||jsonb_build_array(jsonb_build_object('batchId',l.id,'valueDelta',part::text));remaining_adjustment:=remaining_adjustment-part;total_quantity:=total_quantity-l.quantity;
 END LOOP;
 END IF;
 IF (SELECT coalesce(sum(quantity),0) FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id)<>b.on_hand OR (method='FIFO' AND ((SELECT coalesce(sum(value),0) FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id)<>NEW.value OR EXISTS(SELECT 1 FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id AND quantity>0 AND value IS NULL))) THEN RAISE EXCEPTION 'Resulting batches differ from stock/value evidence' USING ERRCODE='HI409';END IF;
 IF delta<>0 OR vd<>0 THEN INSERT INTO inventory.batch_events(company_id,stock_balance_id,source_document_id,method,quantity_delta,value_delta,allocations) VALUES(b.company_id,b.id,doc,method,delta,vd,alloc);END IF;
 PERFORM set_config('htt.batch_before_'||replace(b.id::text,'-',''),b.on_hand::text,true);PERFORM set_config('htt.stock_document_id','',true);RETURN NEW;
END $$;
CREATE TRIGGER forward_stock_batches AFTER INSERT OR UPDATE ON inventory.stock_values FOR EACH ROW EXECUTE FUNCTION inventory.sync_stock_batches();
-- Patch only the current authoritative functions. All unrelated validations/postings remain intact.
DO $$ DECLARE f record;body text;changed text;BEGIN
 FOR f IN SELECT p.oid,n.nspname,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE
 (n.nspname='inventory' AND p.proname IN('confirm_pick_without_positions','post_control','post_count','dispatch_transit','post_transit_event','control_move','receive_sales_return','purchase_value_change')) OR
 (n.nspname='purchase' AND p.proname IN('receive_order','return_goods')) LOOP
 body:=pg_get_functiondef(f.oid);changed:=body;
 changed:=replace(changed,'CASE WHEN b.on_hand=l.base_quantity THEN v.value ELSE round(v.value*l.base_quantity/b.on_hand,2) END','inventory.issue_cost(b.id,l.base_quantity,b.on_hand,v.value)');
 changed:=replace(changed,'CASE WHEN qty=b.on_hand THEN v.value ELSE round(v.value*qty/b.on_hand,2) END','inventory.issue_cost(b.id,qty,b.on_hand,v.value)');
 changed:=replace(changed,'CASE WHEN line.counted_quantity=0 THEN v.value ELSE round(v.value*(-delta)/b.on_hand,2) END','inventory.issue_cost(b.id,-delta,b.on_hand,v.value)');
 changed:=replace(changed,'CASE WHEN bqty=balance.on_hand THEN pool.value ELSE round(pool.value*bqty/balance.on_hand,2) END','inventory.issue_cost(balance.id,bqty,balance.on_hand,pool.value)');
 IF position('UPDATE inventory.stock_values' IN changed)>0 THEN
 changed:=replace(changed,'UPDATE inventory.stock_values','PERFORM set_config(''htt.stock_document_id'','||CASE WHEN f.proname IN('control_move','purchase_value_change') THEN 'doc' WHEN f.proname='confirm_pick_without_positions' THEN 'pid' ELSE 'rid' END||'::text,true);UPDATE inventory.stock_values');
 END IF;
 IF f.proname IN('confirm_pick_without_positions','post_control','post_count','dispatch_transit','return_goods') AND changed=body THEN RAISE EXCEPTION 'Costing migration source changed: %',f.proname;END IF;
 IF f.proname IN('dispatch_transit','post_transit_event') THEN
 changed:=replace(changed,'movement:=inventory.transit_delta(', 'PERFORM set_config(''htt.stock_document_id'','||CASE WHEN f.proname='dispatch_transit' THEN 'tid' ELSE 'eid' END||'::text,true);movement:=inventory.transit_delta(');
 END IF;
 IF changed<>body THEN EXECUTE changed;END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION inventory.new_product_costing(),inventory.costing_method(uuid),inventory.set_costing_method(uuid,bigint,text,text),inventory.issue_cost(uuid,numeric,numeric,numeric),inventory.remember_quantity_before(),inventory.sync_stock_batches() FROM PUBLIC;
GRANT SELECT ON inventory.costing_policies,inventory.stock_batches,inventory.batch_events TO htt_app;
GRANT EXECUTE ON FUNCTION inventory.set_costing_method(uuid,bigint,text,text) TO htt_app;
CREATE FUNCTION inventory.seed_new_costing_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.code IN('ADMIN','FINANCE') THEN INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(NEW.company_id,NEW.id,'inventory.costing.configure') ON CONFLICT DO NOTHING;END IF;RETURN NEW;
END $$;
CREATE TRIGGER new_costing_permission AFTER INSERT ON identity.roles FOR EACH ROW EXECUTE FUNCTION inventory.seed_new_costing_role();
REVOKE ALL ON FUNCTION inventory.seed_new_costing_role() FROM PUBLIC;
