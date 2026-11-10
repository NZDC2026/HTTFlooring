BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true),set_config('htt.request_id','synthetic-frontend-costing',true);
INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
SELECT core.current_company(),'00000000-0000-0000-0000-000000000004',code FROM identity.permissions ON CONFLICT DO NOTHING;
CREATE FUNCTION pg_temp.gain(w uuid,p uuid,q numeric,v numeric) RETURNS void LANGUAGE plpgsql AS $$DECLARE doc uuid;ver bigint;BEGIN
 doc:=inventory.start_count(w,'Synthetic FIFO gain','Isolated frontend costing verification',ARRAY[p]);
 SELECT version INTO ver FROM platform.documents WHERE id=doc;
 PERFORM inventory.submit_count(doc,ver,jsonb_build_array(jsonb_build_object('productId',p,'countedQuantity',q,'gainValue',v)));
 SELECT version INTO ver FROM platform.documents WHERE id=doc;PERFORM inventory.post_count(doc,ver);
END $$;
DO $$ DECLARE p uuid:='00000000-0000-0000-0000-000000009801';w uuid:='00000000-0000-0000-0000-000000000014';w2 uuid;prototype catalog.products;unit catalog.product_units;doc uuid;chosen_method text;val numeric;qty numeric;BEGIN
 SELECT * INTO prototype FROM catalog.products WHERE company_id=core.current_company() AND item_type='STOCK' AND status='ACTIVE' ORDER BY id LIMIT 1;
 INSERT INTO catalog.products SELECT (jsonb_populate_record(NULL::catalog.products,to_jsonb(prototype)||jsonb_build_object('id',p,'sku','FIFO-SYNTHETIC-9801','name','Synthetic prospective costing'))).*;
 FOR unit IN SELECT * FROM catalog.product_units WHERE company_id=prototype.company_id AND product_id=prototype.id LOOP
 INSERT INTO catalog.product_units SELECT (jsonb_populate_record(NULL::catalog.product_units,to_jsonb(unit)||jsonb_build_object('id',gen_random_uuid(),'product_id',p))).*;END LOOP;
 SELECT cp.method INTO chosen_method FROM inventory.costing_policies cp WHERE cp.company_id=core.current_company() AND cp.product_id=p;
 IF chosen_method IS DISTINCT FROM 'FIFO' THEN RAISE EXCEPTION 'New product did not default to FIFO';END IF;
 PERFORM inventory.set_costing_method(p,1,'MOVING_WEIGHTED_AVERAGE','Synthetic zero-stock policy switch');
 PERFORM inventory.set_costing_method(p,2,'FIFO','Synthetic zero-stock FIFO switch');
 BEGIN PERFORM inventory.set_costing_method(p,1,'MOVING_WEIGHTED_AVERAGE','Synthetic stale policy');RAISE EXCEPTION 'Stale policy accepted';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
 SELECT id INTO w2 FROM catalog.warehouses WHERE company_id=core.current_company() AND kind='SELLABLE' AND active AND id<>w ORDER BY id LIMIT 1;
 IF w2 IS NULL THEN RAISE EXCEPTION 'Second synthetic warehouse missing';END IF;
 PERFORM pg_temp.gain(w,p,10,100);PERFORM pg_temp.gain(w2,p,10,200);
 BEGIN PERFORM inventory.set_costing_method(p,3,'MOVING_WEIGHTED_AVERAGE','Synthetic forbidden stock switch');RAISE EXCEPTION 'Nonzero stock policy switch accepted';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
 doc:=inventory.post_control('TRANSFER',w2,w,'Synthetic FIFO second layer','Synthetic transfer at source FIFO cost',jsonb_build_array(jsonb_build_object('productId',p,'quantity',10)));
 doc:=inventory.post_control('WRITE_OFF',w,NULL,'Synthetic FIFO issue','Synthetic FIFO consumption',jsonb_build_array(jsonb_build_object('productId',p,'quantity',5)));
 SELECT value_delta INTO val FROM inventory.operation_lines WHERE company_id=core.current_company() AND operation_id=doc;
 IF val<>-50 THEN RAISE EXCEPTION 'FIFO issue should cost 50, not moving-average 75: %',val;END IF;
 SELECT b.on_hand,v.value INTO qty,val FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.company_id=core.current_company() AND b.product_id=p AND b.warehouse_id=w;
 IF qty<>15 OR val<>250 THEN RAISE EXCEPTION 'FIFO stock/value mismatch: %, %',qty,val;END IF;
 IF EXISTS(SELECT 1 FROM inventory.batch_events WHERE company_id=core.current_company() AND method='FIFO' AND quantity_delta<0 AND jsonb_array_length(allocations)=0) THEN RAISE EXCEPTION 'FIFO issue has no immutable allocations';END IF;
 IF EXISTS(SELECT 1 FROM accounting.reconciliation_checks() WHERE expected<>actual) THEN RAISE EXCEPTION 'FIFO postings broke stock or GL reconciliation';END IF;
END $$;
COMMIT;
