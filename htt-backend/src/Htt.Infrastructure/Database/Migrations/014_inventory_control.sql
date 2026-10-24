-- Inventory change revision covers quantity, reservations AND value-only changes, including ABA movements.
ALTER TABLE inventory.stock_balances ADD COLUMN revision bigint NOT NULL DEFAULT 1 CHECK(revision>0);
CREATE FUNCTION inventory.advance_balance_revision() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN NEW.revision:=OLD.revision+1;RETURN NEW;END $$;
CREATE TRIGGER inventory_revision BEFORE UPDATE ON inventory.stock_balances FOR EACH ROW EXECUTE FUNCTION inventory.advance_balance_revision();
CREATE FUNCTION inventory.touch_value_revision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 UPDATE inventory.stock_balances SET revision=revision WHERE company_id=NEW.company_id AND id=NEW.stock_balance_id;RETURN NEW;END $$;
CREATE TRIGGER inventory_value_revision AFTER INSERT OR UPDATE ON inventory.stock_values FOR EACH ROW EXECUTE FUNCTION inventory.touch_value_revision();
CREATE TABLE inventory.counts(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),warehouse_id uuid NOT NULL,reference text NOT NULL,reason text NOT NULL,state text NOT NULL DEFAULT 'OPEN' CHECK(state IN('OPEN','SUBMITTED','POSTED','CANCELLED')),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id)
);
CREATE UNIQUE INDEX stock_count_reference ON inventory.counts(company_id,warehouse_id,lower(btrim(reference)));
CREATE TABLE inventory.count_lines(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),count_id uuid NOT NULL,stock_balance_id uuid NOT NULL,product_id uuid NOT NULL,
 snapshot_quantity numeric(20,6) NOT NULL CHECK(snapshot_quantity>=0),snapshot_reserved numeric(20,6) NOT NULL CHECK(snapshot_reserved BETWEEN 0 AND snapshot_quantity),snapshot_value numeric(20,2) NOT NULL CHECK(snapshot_value>=0),snapshot_revision bigint NOT NULL CHECK(snapshot_revision>0),snapshot jsonb NOT NULL,
 counted_quantity numeric(20,6) CHECK(counted_quantity>=0),gain_value numeric(20,2) CHECK(gain_value>=0),
 UNIQUE(company_id,id),UNIQUE(company_id,count_id,product_id),FOREIGN KEY(company_id,count_id) REFERENCES inventory.counts(company_id,id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id)
);
CREATE TABLE inventory.operations(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),kind text NOT NULL CHECK(kind IN('TRANSFER','COUNT','WRITE_OFF')),warehouse_id uuid NOT NULL,destination_id uuid,reference text NOT NULL,reason text NOT NULL,journal_entry_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,destination_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id),CHECK((kind='TRANSFER' AND destination_id IS NOT NULL AND destination_id<>warehouse_id) OR(kind<>'TRANSFER' AND destination_id IS NULL))
);
CREATE UNIQUE INDEX inventory_operation_reference ON inventory.operations(company_id,kind,lower(btrim(reference))) WHERE kind IN('TRANSFER','WRITE_OFF');
CREATE TABLE inventory.operation_lines(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),operation_id uuid NOT NULL,stock_balance_id uuid NOT NULL,warehouse_id uuid NOT NULL,product_id uuid NOT NULL,count_line_id uuid,
 quantity_delta numeric(20,6) NOT NULL,value_delta numeric(20,2) NOT NULL,quantity_before numeric(20,6) NOT NULL CHECK(quantity_before>=0),quantity_after numeric(20,6) NOT NULL CHECK(quantity_after>=0),value_before numeric(20,2) NOT NULL CHECK(value_before>=0),value_after numeric(20,2) NOT NULL CHECK(value_after>=0),reserved_after numeric(20,6) NOT NULL CHECK(reserved_after BETWEEN 0 AND quantity_after),revision_before bigint NOT NULL,revision_after bigint NOT NULL,snapshot jsonb NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,operation_id,warehouse_id,product_id),FOREIGN KEY(company_id,id,operation_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,operation_id) REFERENCES inventory.operations(company_id,id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id),FOREIGN KEY(company_id,count_line_id) REFERENCES inventory.count_lines(company_id,id),CHECK(quantity_after=quantity_before+quantity_delta AND value_after=value_before+value_delta AND revision_after>=revision_before)
);
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['counts','count_lines','operations','operation_lines'] LOOP
 EXECUTE format('ALTER TABLE inventory.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE inventory.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON inventory.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON inventory.%I(company_id)',tb);
 IF tb IN('operations','operation_lines') THEN EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);END IF;END LOOP;END $$;
CREATE INDEX ON inventory.counts(company_id,warehouse_id,state);CREATE INDEX ON inventory.count_lines(company_id,count_id);CREATE INDEX ON inventory.operation_lines(company_id,stock_balance_id);CREATE INDEX ON inventory.operations(company_id,warehouse_id,kind);
INSERT INTO identity.permissions(code,description) VALUES('inventory.transfers.read','Read transfers in assigned warehouses'),('inventory.transfers.post','Record confirmed handover between assigned warehouses'),('inventory.counts.read','Read assigned physical count sheets'),('inventory.counts.write','Capture, submit and withdraw physical counts'),('inventory.counts.post','Approve count differences and financial cost'),('inventory.writeoffs.post','Record evidenced stock damage/write-off'),('inventory.control.read','Read company financial inventory adjustments');
CREATE FUNCTION identity.seed_inventory_control_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND ((r.code='ADMIN' AND p.code IN('inventory.transfers.read','inventory.transfers.post','inventory.counts.read','inventory.counts.write','inventory.counts.post','inventory.writeoffs.post','inventory.control.read')) OR(r.code='WAREHOUSE' AND p.code IN('inventory.transfers.read','inventory.transfers.post','inventory.counts.read','inventory.counts.write')) OR(r.code='FINANCE' AND p.code IN('inventory.counts.post','inventory.writeoffs.post','inventory.control.read'))) ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'4100','Inventory count gains','REVENUE'),(c,'5300','Inventory count losses','EXPENSE'),(c,'5400','Stock damage and write-offs','EXPENSE') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,v.purpose,a.id FROM(VALUES('STOCK_GAIN','4100'),('STOCK_LOSS','5300'),('STOCK_WRITEOFF','5400'))v(purpose,code) JOIN accounting.accounts a ON a.company_id=c AND a.code=v.code ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'STOCK_TRANSFER','TR-'),(c,'STOCK_COUNT','CT-'),(c,'STOCK_WRITEOFF','WO-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_inventory_control_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION inventory.require_control_permission(p text) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM identity.memberships mb JOIN identity.users u ON u.id=mb.user_id AND u.active JOIN identity.membership_roles mr ON mr.company_id=mb.company_id AND mr.membership_id=mb.id JOIN identity.role_permissions rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id WHERE mb.company_id=core.current_company() AND mb.user_id=core.current_actor() AND mb.active AND rp.permission_code=p) THEN RAISE EXCEPTION 'Inventory control permission denied' USING ERRCODE='42501';END IF;END $$;
CREATE FUNCTION inventory.control_number(p text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;prefix text;BEGIN
 IF p NOT IN('STOCK_TRANSFER','STOCK_COUNT','STOCK_WRITEOFF') THEN RAISE EXCEPTION 'Invalid inventory sequence' USING ERRCODE='HI422';END IF;
 UPDATE platform.document_sequences s SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=p RETURNING next_value-1,s.prefix INTO n,prefix;
 IF NOT FOUND THEN RAISE EXCEPTION 'Inventory sequence missing' USING ERRCODE='HI422';END IF;RETURN prefix||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION inventory.control_today() RETURNS date LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE d date;BEGIN
 SELECT(now() AT TIME ZONE timezone)::date INTO d FROM core.companies WHERE id=core.current_company() FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=core.current_company() AND starts_on<=d AND ends_on>d AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Inventory operation requires open accounting period' USING ERRCODE='HI422';END IF;RETURN d;END $$;
CREATE FUNCTION inventory.control_warehouse(w uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 PERFORM 1 FROM catalog.warehouses WHERE company_id=core.current_company() AND id=w AND active AND kind IN('SELLABLE','QUARANTINE') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active sellable/quarantine warehouse required' USING ERRCODE='HI422';END IF;END $$;
CREATE FUNCTION inventory.control_product(p uuid) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE result jsonb;BEGIN
 SELECT jsonb_build_object('productId',pr.id,'sku',pr.sku,'name',pr.name,'baseUomId',u.id,'baseUom',u.code) INTO result FROM catalog.products pr JOIN catalog.uoms u ON u.company_id=pr.company_id AND u.id=pr.base_uom_id WHERE pr.company_id=core.current_company() AND pr.id=p AND pr.item_type='STOCK' FOR SHARE OF pr,u;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock product in current company required' USING ERRCODE='HI422';END IF;RETURN result;END $$;
-- Shared ordering: product first, warehouse second. Compatible with existing one-warehouse stock commands.
CREATE FUNCTION inventory.lock_control_balances(warehouses uuid[],products uuid[],origin uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();p uuid;w uuid;b inventory.stock_balances;v inventory.stock_values;BEGIN
 FOR p IN SELECT DISTINCT unnest(products) ORDER BY 1 LOOP
 PERFORM inventory.control_product(p);
 FOR w IN SELECT DISTINCT unnest(warehouses) ORDER BY 1 LOOP
 INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,created_by) VALUES(c,w,p,core.current_actor()) ON CONFLICT(company_id,warehouse_id,product_id) DO NOTHING;
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=w AND product_id=p FOR UPDATE;
 END LOOP;END LOOP;
 FOR p IN SELECT DISTINCT unnest(products) ORDER BY 1 LOOP FOR w IN SELECT DISTINCT unnest(warehouses) ORDER BY 1 LOOP
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=w AND product_id=p;
 SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id FOR UPDATE;
 IF NOT FOUND THEN IF b.on_hand<>0 THEN RAISE EXCEPTION 'Existing quantity requires controlled valuation before stock control' USING ERRCODE='HI422';END IF;
 INSERT INTO inventory.stock_values(company_id,stock_balance_id,value,opening_document_id) VALUES(c,b.id,0,origin) RETURNING * INTO v;END IF;
 IF b.on_hand=0 AND v.value<>0 THEN RAISE EXCEPTION 'Zero quantity has unexplained inventory value' USING ERRCODE='HI422';END IF;
 END LOOP;END LOOP;
END $$;
CREATE FUNCTION inventory.control_move(doc uuid,line_no int,w uuid,p uuid,qty numeric,val numeric,count_line uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();lid uuid:=gen_random_uuid();b inventory.stock_balances;v inventory.stock_values;after_revision bigint;snap jsonb;BEGIN
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=w AND product_id=p;
 SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id;
 IF b.on_hand+qty<b.reserved OR v.value+val<0 THEN RAISE EXCEPTION 'Adjustment would consume reserved stock or overdraw value' USING ERRCODE='HI409';END IF;
 snap:=inventory.control_product(p);
 IF qty<>0 OR val<>0 THEN UPDATE inventory.stock_balances SET on_hand=on_hand+qty WHERE company_id=c AND id=b.id;UPDATE inventory.stock_values SET value=value+val WHERE company_id=c AND id=v.id;END IF;
 SELECT revision INTO after_revision FROM inventory.stock_balances WHERE company_id=c AND id=b.id;
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,doc,line_no,core.current_actor());
 INSERT INTO inventory.operation_lines(id,company_id,operation_id,stock_balance_id,warehouse_id,product_id,count_line_id,quantity_delta,value_delta,quantity_before,quantity_after,value_before,value_after,reserved_after,revision_before,revision_after,snapshot) VALUES(lid,c,doc,b.id,w,p,count_line,qty,val,b.on_hand,b.on_hand+qty,v.value,v.value+val,b.reserved,b.revision,after_revision,snap);
END $$;
CREATE FUNCTION inventory.post_control(p_kind text,p_from uuid,p_to uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();oid uuid:=gen_random_uuid();today date;entry jsonb;prod uuid;products uuid[];qty numeric;cost numeric;total numeric:=0;b inventory.stock_balances;v inventory.stock_values;no int:=0;w uuid;inv uuid;expense uuid;j uuid;jl jsonb:='[]';dtype text;
BEGIN
 IF p_kind='TRANSFER' THEN PERFORM inventory.require_access('inventory.transfers.post',p_from);PERFORM inventory.require_access('inventory.transfers.post',p_to);IF p_from=p_to OR p_to IS NULL THEN RAISE EXCEPTION 'Distinct source and destination required' USING ERRCODE='HI422';END IF;dtype:='STOCK_TRANSFER';
 ELSIF p_kind='WRITE_OFF' THEN PERFORM inventory.require_control_permission('inventory.writeoffs.post');IF p_to IS NOT NULL THEN RAISE EXCEPTION 'Write-off has no destination' USING ERRCODE='HI422';END IF;dtype:='STOCK_WRITEOFF';ELSE RAISE EXCEPTION 'Unsupported stock operation' USING ERRCODE='HI422';END IF;
 today:=inventory.control_today();FOR w IN SELECT DISTINCT unnest(ARRAY[p_from,p_to]) ORDER BY 1 LOOP IF w IS NOT NULL THEN PERFORM inventory.control_warehouse(w);END IF;END LOOP;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x GROUP BY x->>'productId' HAVING count(*)>1) OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x WHERE x->>'productId' IS NULL OR x->>'quantity' IS NULL OR (x->>'quantity')::numeric<=0 OR (x->>'quantity')::numeric<>round((x->>'quantity')::numeric,6) OR (x->>'quantity')::numeric>99999999999999.999999) THEN RAISE EXCEPTION 'Reference, reason and 1..50 distinct positive base quantities required' USING ERRCODE='HI422';END IF;
 SELECT array_agg((x->>'productId')::uuid ORDER BY x->>'productId') INTO products FROM jsonb_array_elements(items)x;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(oid,c,dtype,inventory.control_number(dtype),today,'CONFIRMED',a);
 PERFORM inventory.lock_control_balances(CASE WHEN p_kind='TRANSFER' THEN ARRAY[p_from,p_to] ELSE ARRAY[p_from] END,products,oid);
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'productId' LOOP
 prod:=(entry->>'productId')::uuid;qty:=(entry->>'quantity')::numeric;
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=p_from AND product_id=prod;SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id;
 IF b.on_hand-b.reserved<qty THEN RAISE EXCEPTION 'Insufficient unreserved stock' USING ERRCODE='HI409';END IF;
 cost:=CASE WHEN qty=b.on_hand THEN v.value ELSE round(v.value*qty/b.on_hand,2) END;
 no:=no+1;PERFORM inventory.control_move(oid,no,p_from,prod,-qty,-cost);
 IF p_kind='TRANSFER' THEN no:=no+1;PERFORM inventory.control_move(oid,no,p_to,prod,qty,cost);END IF;total:=total+cost;
 END LOOP;
 IF total>0 THEN inv:=accounting.settlement_account('INVENTORY','ASSET','INVENTORY');IF p_kind='WRITE_OFF' THEN expense:=accounting.settlement_account('STOCK_WRITEOFF','EXPENSE');END IF;
 jl:=jsonb_build_array(jsonb_build_object('accountId',CASE WHEN p_kind='TRANSFER' THEN inv ELSE expense END,'debit',total),jsonb_build_object('accountId',inv,'credit',total));
 j:=accounting.post_journal(oid,1,p_kind,today,CASE WHEN p_kind='TRANSFER' THEN 'Interwarehouse inventory cost reclassification' ELSE 'Approved stock damage / write-off' END,jl);END IF;
 INSERT INTO inventory.operations(id,company_id,kind,warehouse_id,destination_id,reference,reason,journal_entry_id,created_by) VALUES(oid,c,p_kind,p_from,p_to,btrim(p_reference),btrim(p_reason),j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=oid;RETURN oid;
END $$;
CREATE FUNCTION inventory.start_count(w uuid,p_reference text,p_reason text,products uuid[]) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();today date;p uuid;b inventory.stock_balances;v inventory.stock_values;BEGIN
 PERFORM inventory.require_access('inventory.counts.write',w);today:=inventory.control_today();PERFORM inventory.control_warehouse(w);
 IF products IS NULL OR cardinality(products) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM unnest(products)x GROUP BY x HAVING count(*)>1) OR array_position(products,NULL) IS NOT NULL OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Reference, reason and 1..50 distinct stock products required' USING ERRCODE='HI422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'STOCK_COUNT',inventory.control_number('STOCK_COUNT'),today,'DRAFT',a);
 PERFORM inventory.lock_control_balances(ARRAY[w],products,cid);
 INSERT INTO inventory.counts(id,company_id,warehouse_id,reference,reason,created_by) VALUES(cid,c,w,btrim(p_reference),btrim(p_reason),a);
 FOR p IN SELECT unnest(products) ORDER BY 1 LOOP
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=w AND product_id=p;SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id;
 INSERT INTO inventory.count_lines(company_id,count_id,stock_balance_id,product_id,snapshot_quantity,snapshot_reserved,snapshot_value,snapshot_revision,snapshot) VALUES(c,cid,b.id,p,b.on_hand,b.reserved,v.value,b.revision,inventory.control_product(p));END LOOP;RETURN cid;
END $$;
CREATE FUNCTION inventory.submit_count(p_count uuid,p_expected bigint,items jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();sheet inventory.counts;doc platform.documents;entry jsonb;qty numeric;gv numeric;BEGIN
 SELECT * INTO sheet FROM inventory.counts WHERE company_id=c AND id=p_count;IF NOT FOUND THEN RAISE EXCEPTION 'Count unavailable' USING ERRCODE='HT404';END IF;PERFORM inventory.require_access('inventory.counts.write',sheet.warehouse_id);
 SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_count FOR UPDATE;SELECT * INTO sheet FROM inventory.counts WHERE company_id=c AND id=p_count;
 IF doc.version IS DISTINCT FROM p_expected OR sheet.state<>'OPEN' THEN RAISE EXCEPTION 'Only current open count can be submitted' USING ERRCODE='HI409';END IF;
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items)<>(SELECT count(*) FROM inventory.count_lines WHERE company_id=c AND count_id=p_count) OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x GROUP BY x->>'productId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supply every count product exactly once' USING ERRCODE='HI422';END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) LOOP
 qty:=(entry->>'countedQuantity')::numeric;gv:=(entry->>'gainValue')::numeric;
 IF qty IS NULL OR qty<0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR (gv IS NOT NULL AND(gv<0 OR gv<>round(gv,2) OR gv>999999999999999999.99)) THEN RAISE EXCEPTION 'Invalid counted base quantity or gain value' USING ERRCODE='HI422';END IF;
 UPDATE inventory.count_lines SET counted_quantity=qty,gain_value=gv WHERE company_id=c AND count_id=p_count AND product_id=(entry->>'productId')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Count product unavailable' USING ERRCODE='HT404';END IF;
 END LOOP;
 UPDATE inventory.counts SET state='SUBMITTED' WHERE company_id=c AND id=p_count;UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=c AND id=p_count;
END $$;
CREATE FUNCTION inventory.post_count(p_count uuid,p_expected bigint) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();sheet inventory.counts;doc platform.documents;today date;line inventory.count_lines;b inventory.stock_balances;v inventory.stock_values;products uuid[];delta numeric;cost numeric;no int:=0;inv uuid;contra uuid;j uuid;jl jsonb:='[]';BEGIN
 PERFORM inventory.require_control_permission('inventory.counts.post');SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_count FOR UPDATE;SELECT * INTO sheet FROM inventory.counts WHERE company_id=c AND id=p_count;
 IF NOT FOUND THEN RAISE EXCEPTION 'Count unavailable' USING ERRCODE='HT404';END IF;
 IF doc.version IS DISTINCT FROM p_expected OR sheet.state<>'SUBMITTED' THEN RAISE EXCEPTION 'Only current submitted count can post' USING ERRCODE='HI409';END IF;
 today:=inventory.control_today();PERFORM inventory.control_warehouse(sheet.warehouse_id);SELECT array_agg(product_id ORDER BY product_id) INTO products FROM inventory.count_lines WHERE company_id=c AND count_id=p_count;
 PERFORM inventory.lock_control_balances(ARRAY[sheet.warehouse_id],products,p_count);
 FOR line IN SELECT * FROM inventory.count_lines WHERE company_id=c AND count_id=p_count ORDER BY product_id LOOP
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND id=line.stock_balance_id;SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id;
 IF (b.revision,b.on_hand,b.reserved,v.value) IS DISTINCT FROM(line.snapshot_revision,line.snapshot_quantity,line.snapshot_reserved,line.snapshot_value) THEN RAISE EXCEPTION 'Stock changed after snapshot; cancel and recount' USING ERRCODE='HI409';END IF;
 delta:=line.counted_quantity-b.on_hand;
 IF delta<0 THEN IF line.gain_value IS NOT NULL THEN RAISE EXCEPTION 'Loss cannot override valuation' USING ERRCODE='HI422';END IF;cost:=CASE WHEN line.counted_quantity=0 THEN v.value ELSE round(v.value*(-delta)/b.on_hand,2) END;
 ELSIF delta>0 THEN
 IF b.on_hand>0 THEN IF line.gain_value IS NOT NULL THEN RAISE EXCEPTION 'Existing stock gain uses frozen average cost' USING ERRCODE='HI422';END IF;cost:=round(v.value*delta/b.on_hand,2);
 ELSE IF line.gain_value IS NULL THEN RAISE EXCEPTION 'Explicit gain value required for previously empty stock' USING ERRCODE='HI422';END IF;cost:=line.gain_value;END IF;
 ELSE IF line.gain_value IS NOT NULL THEN RAISE EXCEPTION 'No quantity difference permits no value override' USING ERRCODE='HI422';END IF;cost:=0;END IF;
 no:=no+1;PERFORM inventory.control_move(p_count,no,sheet.warehouse_id,line.product_id,delta,CASE WHEN delta<0 THEN -cost ELSE cost END,line.id);
 IF cost>0 THEN inv:=accounting.settlement_account('INVENTORY','ASSET','INVENTORY');contra:=CASE WHEN delta>0 THEN accounting.settlement_account('STOCK_GAIN','REVENUE') ELSE accounting.settlement_account('STOCK_LOSS','EXPENSE') END;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',inv,'debit',CASE WHEN delta>0 THEN cost ELSE 0 END,'credit',CASE WHEN delta<0 THEN cost ELSE 0 END),jsonb_build_object('accountId',contra,'debit',CASE WHEN delta<0 THEN cost ELSE 0 END,'credit',CASE WHEN delta>0 THEN cost ELSE 0 END));END IF;
 END LOOP;
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(p_count,doc.version,'STOCK_COUNT',today,'Approved physical inventory count difference',jl);END IF;
 INSERT INTO inventory.operations(id,company_id,kind,warehouse_id,reference,reason,journal_entry_id,created_by) VALUES(p_count,c,'COUNT',sheet.warehouse_id,sheet.reference,sheet.reason,j,a);
 UPDATE inventory.counts SET state='POSTED' WHERE company_id=c AND id=p_count;UPDATE platform.documents SET state='POSTED',business_date=today WHERE company_id=c AND id=p_count;RETURN p_count;
END $$;
CREATE FUNCTION inventory.cancel_count(p_count uuid,p_expected bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE sheet inventory.counts;doc platform.documents;BEGIN
 SELECT * INTO sheet FROM inventory.counts WHERE company_id=core.current_company() AND id=p_count;IF NOT FOUND THEN RAISE EXCEPTION 'Count unavailable' USING ERRCODE='HT404';END IF;PERFORM inventory.require_access('inventory.counts.write',sheet.warehouse_id);
 SELECT * INTO doc FROM platform.documents WHERE company_id=core.current_company() AND id=p_count FOR UPDATE;SELECT * INTO sheet FROM inventory.counts WHERE company_id=core.current_company() AND id=p_count;
 IF doc.version IS DISTINCT FROM p_expected OR sheet.state NOT IN('OPEN','SUBMITTED') THEN RAISE EXCEPTION 'Only current unposted count can cancel' USING ERRCODE='HI409';END IF;
 UPDATE inventory.counts SET state='CANCELLED' WHERE company_id=core.current_company() AND id=p_count;UPDATE platform.documents SET state='CANCELLED' WHERE company_id=core.current_company() AND id=p_count;END $$;
CREATE FUNCTION inventory.guard_count() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF(to_jsonb(NEW)-'state') IS DISTINCT FROM(to_jsonb(OLD)-'state') OR NOT((OLD.state='OPEN' AND NEW.state IN('SUBMITTED','CANCELLED')) OR(OLD.state='SUBMITTED' AND NEW.state IN('POSTED','CANCELLED'))) THEN RAISE EXCEPTION 'Invalid immutable count transition' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER count_transition BEFORE UPDATE ON inventory.counts FOR EACH ROW EXECUTE FUNCTION inventory.guard_count();CREATE TRIGGER count_no_delete BEFORE DELETE ON inventory.counts FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE FUNCTION inventory.guard_count_line() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF(to_jsonb(NEW)-ARRAY['counted_quantity','gain_value']) IS DISTINCT FROM(to_jsonb(OLD)-ARRAY['counted_quantity','gain_value']) OR NOT EXISTS(SELECT 1 FROM inventory.counts WHERE company_id=OLD.company_id AND id=OLD.count_id AND state='OPEN') THEN RAISE EXCEPTION 'Count snapshot is immutable; only open actual counts can change' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER count_line_update BEFORE UPDATE ON inventory.count_lines FOR EACH ROW EXECUTE FUNCTION inventory.guard_count_line();CREATE TRIGGER count_line_no_delete BEFORE DELETE ON inventory.count_lines FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE FUNCTION inventory.guard_control_document() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF OLD.document_type IN('STOCK_TRANSFER','STOCK_WRITEOFF','STOCK_COUNT') AND OLD.state IN('POSTED','CANCELLED') THEN RAISE EXCEPTION 'Final inventory control document is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER inventory_control_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION inventory.guard_control_document();
CREATE FUNCTION inventory.validate_control() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE c uuid:=NEW.company_id;oid uuid;op inventory.operations;sheet inventory.counts;BEGIN
 IF TG_TABLE_NAME='operations' OR TG_TABLE_NAME='counts' THEN oid:=NEW.id;ELSIF TG_TABLE_NAME='operation_lines' THEN oid:=NEW.operation_id;ELSE oid:=NEW.count_id;END IF;
 SELECT * INTO op FROM inventory.operations WHERE company_id=c AND id=oid;
 IF FOUND THEN
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=oid AND state='POSTED') OR NOT EXISTS(SELECT 1 FROM inventory.operation_lines WHERE company_id=c AND operation_id=oid) THEN RAISE EXCEPTION 'Inventory operation state/lines missing' USING ERRCODE='23514';END IF;
 IF op.kind='TRANSFER' AND EXISTS(SELECT product_id FROM inventory.operation_lines WHERE company_id=c AND operation_id=oid GROUP BY product_id HAVING count(*)<>2 OR sum(quantity_delta)<>0 OR sum(value_delta)<>0 OR count(DISTINCT warehouse_id)<>2) THEN RAISE EXCEPTION 'Transfer quantity/value not conserved' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM inventory.operation_lines WHERE company_id=c AND operation_id=oid AND warehouse_id<>op.warehouse_id AND warehouse_id IS DISTINCT FROM op.destination_id) THEN RAISE EXCEPTION 'Inventory movement warehouse mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM inventory.operation_lines WHERE company_id=c AND operation_id=oid AND value_delta<>0) AND op.journal_entry_id IS NULL THEN RAISE EXCEPTION 'Inventory operation journal missing' USING ERRCODE='23514';END IF;
 IF op.journal_entry_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=c AND je.id=op.journal_entry_id AND pb.source_document_id=oid) THEN RAISE EXCEPTION 'Inventory posting source mismatch' USING ERRCODE='23514';END IF;
 END IF;
 SELECT * INTO sheet FROM inventory.counts WHERE company_id=c AND id=oid;
 IF FOUND THEN
 IF NOT EXISTS(SELECT 1 FROM inventory.count_lines WHERE company_id=c AND count_id=oid) OR (sheet.state IN('SUBMITTED','POSTED') AND EXISTS(SELECT 1 FROM inventory.count_lines WHERE company_id=c AND count_id=oid AND counted_quantity IS NULL)) OR(sheet.state='POSTED' AND NOT EXISTS(SELECT 1 FROM inventory.operations WHERE company_id=c AND id=oid AND kind='COUNT')) THEN RAISE EXCEPTION 'Count state/snapshot mismatch' USING ERRCODE='23514';END IF;END IF;RETURN NULL;END $$;
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['operations','operation_lines','counts','count_lines'] LOOP EXECUTE format('CREATE CONSTRAINT TRIGGER inventory_control_consistency AFTER INSERT OR UPDATE ON inventory.%I DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inventory.validate_control()',tb);END LOOP;END $$;
REVOKE ALL ON FUNCTION identity.seed_inventory_control_roles(uuid),inventory.advance_balance_revision(),inventory.touch_value_revision(),inventory.require_control_permission(text),inventory.control_number(text),inventory.control_today(),inventory.control_warehouse(uuid),inventory.control_product(uuid),inventory.lock_control_balances(uuid[],uuid[],uuid),inventory.control_move(uuid,integer,uuid,uuid,numeric,numeric,uuid),inventory.post_control(text,uuid,uuid,text,text,jsonb),inventory.start_count(uuid,text,text,uuid[]),inventory.submit_count(uuid,bigint,jsonb),inventory.post_count(uuid,bigint),inventory.cancel_count(uuid,bigint),inventory.guard_count(),inventory.guard_count_line(),inventory.guard_control_document(),inventory.validate_control() FROM PUBLIC;
GRANT SELECT ON inventory.counts,inventory.count_lines,inventory.operations,inventory.operation_lines TO htt_app;
GRANT EXECUTE ON FUNCTION inventory.post_control(text,uuid,uuid,text,text,jsonb),inventory.start_count(uuid,text,text,uuid[]),inventory.submit_count(uuid,bigint,jsonb),inventory.post_count(uuid,bigint),inventory.cancel_count(uuid,bigint) TO htt_app;
