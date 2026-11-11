-- Physical evidence request workflow; submission has no inventory or financial side effects.
CREATE TABLE inventory.return_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,order_id uuid NOT NULL,warehouse_id uuid NOT NULL,
 customer_id uuid NOT NULL,version bigint NOT NULL DEFAULT 1,status text NOT NULL DEFAULT 'PENDING' CHECK(status IN('PENDING','PROCESSED','REJECTED')),
 reason text NOT NULL,handover jsonb NOT NULL,lines jsonb NOT NULL,return_id uuid,decision_reason text,
 created_by uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),decided_by uuid REFERENCES identity.users(id),decided_at timestamptz,
 FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,return_id) REFERENCES inventory.sales_returns(company_id,id));
ALTER TABLE inventory.return_requests ENABLE ROW LEVEL SECURITY;ALTER TABLE inventory.return_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.return_requests USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE FUNCTION inventory.require_return_photos(doc uuid,items jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE item jsonb;photo text;BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
 IF jsonb_typeof(item->'photoFileIds') IS DISTINCT FROM 'array' OR jsonb_array_length(item->'photoFileIds') NOT BETWEEN 2 AND 10 OR (SELECT count(DISTINCT value) FROM jsonb_array_elements(item->'photoFileIds'))<>jsonb_array_length(item->'photoFileIds') THEN RAISE EXCEPTION 'Each return item needs 2..10 distinct verified photos' USING ERRCODE='HI422';END IF;
 FOR photo IN SELECT jsonb_array_elements_text(item->'photoFileIds') LOOP
 IF NOT EXISTS(SELECT 1 FROM platform.file_assets a JOIN platform.files f ON f.company_id=a.company_id AND f.id=a.file_id WHERE a.company_id=core.current_company() AND a.document_id=doc AND a.file_id=photo::uuid AND a.kind='ATTACHMENT' AND a.revoked_at IS NULL AND f.state='VERIFIED' AND f.content_type IN('image/jpeg','image/png','image/webp')) THEN RAISE EXCEPTION 'Return photo unavailable or not verified' USING ERRCODE='HI422';END IF;
 END LOOP;END LOOP;
END $$;
CREATE FUNCTION inventory.submit_return_request(doc uuid,warehouse uuid,why text,proof jsonb,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE o sales.orders;id uuid:=gen_random_uuid();point jsonb;first_x numeric;first_y numeric;ink int:=0;moved boolean:=false;item jsonb;qty numeric;movement uuid;BEGIN
 SELECT * INTO o FROM sales.orders WHERE company_id=core.current_company() AND sales.orders.id=doc FOR UPDATE;
 IF NOT FOUND OR NOT platform.document_visible(doc) THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('inventory.returns.write',o.warehouse_id);PERFORM inventory.require_access('inventory.returns.write',warehouse);
 IF why IS NULL OR length(btrim(why)) NOT BETWEEN 3 AND 2000 OR jsonb_typeof(items) IS DISTINCT FROM 'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Reason and 1..50 return lines required' USING ERRCODE='HI422';END IF;
 IF jsonb_typeof(proof) IS DISTINCT FROM 'object' OR length(btrim(coalesce(proof->>'name',''))) NOT BETWEEN 1 AND 200 OR length(coalesce(proof->>'mobile',''))>40 OR jsonb_typeof(proof->'points') IS DISTINCT FROM 'array' OR jsonb_array_length(proof->'points') NOT BETWEEN 2 AND 2000 OR length(coalesce(proof->>'signedAt','')) NOT BETWEEN 10 AND 50 THEN RAISE EXCEPTION 'Named and dated handwritten handover proof required' USING ERRCODE='HI422';END IF;
 PERFORM (proof->>'signedAt')::timestamptz;
 FOR point IN SELECT value FROM jsonb_array_elements(proof->'points') LOOP
 IF jsonb_typeof(point) IS DISTINCT FROM 'array' OR jsonb_array_length(point) NOT IN(0,2) THEN RAISE EXCEPTION 'Invalid signature point' USING ERRCODE='HI422';END IF;
 IF jsonb_array_length(point)=2 THEN
 IF jsonb_typeof(point->0)<>'number' OR jsonb_typeof(point->1)<>'number' OR (point->>0)::numeric NOT BETWEEN 0 AND 1 OR (point->>1)::numeric NOT BETWEEN 0 AND 1 THEN RAISE EXCEPTION 'Invalid signature coordinates' USING ERRCODE='HI422';END IF;
 ink:=ink+1;IF ink=1 THEN first_x:=(point->>0)::numeric;first_y:=(point->>1)::numeric;ELSE moved:=moved OR abs(first_x-(point->>0)::numeric)+abs(first_y-(point->>1)::numeric)>0.01;END IF;END IF;END LOOP;
 IF ink<2 OR NOT moved THEN RAISE EXCEPTION 'Handwritten signature required' USING ERRCODE='HI422';END IF;
 IF (SELECT count(DISTINCT (value->>'stockMovementId',value->>'invoiceLineId')) FROM jsonb_array_elements(items))<>jsonb_array_length(items) THEN RAISE EXCEPTION 'Duplicate return line' USING ERRCODE='HI422';END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
 qty:=(item->>'quantity')::numeric;movement:=(item->>'stockMovementId')::uuid;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR NOT EXISTS(SELECT 1 FROM inventory.stock_movements m JOIN inventory.pick_lines p ON p.company_id=m.company_id AND p.id=m.pick_line_id JOIN sales.order_lines l ON l.company_id=p.company_id AND l.id=p.order_line_id WHERE m.company_id=o.company_id AND m.id=movement AND l.order_id=doc AND qty*m.quantity/p.quantity<=m.quantity-coalesce((SELECT sum(r.base_quantity) FROM inventory.sales_return_lines r WHERE r.company_id=m.company_id AND r.stock_movement_id=m.id),0)) THEN RAISE EXCEPTION 'Return quantity or movement unavailable' USING ERRCODE='HI422';END IF;
 END LOOP;
 PERFORM inventory.require_return_photos(doc,items);
 INSERT INTO inventory.return_requests(id,company_id,order_id,warehouse_id,customer_id,reason,handover,lines,created_by) VALUES(id,o.company_id,doc,warehouse,o.customer_id,btrim(why),proof,items,core.current_actor());
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details) VALUES(o.company_id,core.current_actor(),'inventory.return_requested','return_request',id,current_setting('htt.request_id',true),jsonb_build_object('orderId',doc,'lineCount',jsonb_array_length(items)));
 RETURN id;
END $$;
CREATE FUNCTION inventory.return_request_view(request uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE r inventory.return_requests;BEGIN
 SELECT * INTO r FROM inventory.return_requests WHERE company_id=core.current_company() AND id=request;
 IF NOT FOUND OR NOT platform.document_visible(r.order_id) THEN RAISE EXCEPTION 'Return request unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('inventory.returns.read',r.warehouse_id);RETURN to_jsonb(r);
END $$;
CREATE FUNCTION inventory.decide_return_request(request uuid,expected bigint,decision text,disposition text,why text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r inventory.return_requests;returned uuid;items jsonb;BEGIN
 SELECT * INTO r FROM inventory.return_requests WHERE company_id=core.current_company() AND id=request FOR UPDATE;
 IF NOT FOUND OR NOT platform.document_visible(r.order_id) THEN RAISE EXCEPTION 'Return request unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('inventory.returns.write',r.warehouse_id);
 IF r.version IS DISTINCT FROM expected OR r.status<>'PENDING' THEN RAISE EXCEPTION 'Return request changed' USING ERRCODE='HI409';END IF;
 IF decision IS NULL OR decision NOT IN('PROCESS','REJECT') OR why IS NULL OR length(btrim(why)) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'Decision and reason required' USING ERRCODE='HI422';END IF;
 IF decision='PROCESS' THEN
 IF disposition IS NULL OR disposition NOT IN('RESTOCK','QUARANTINE') THEN RAISE EXCEPTION 'Choose RESTOCK or QUARANTINE' USING ERRCODE='HI422';END IF;
 PERFORM inventory.require_return_photos(r.order_id,r.lines);
 SELECT jsonb_agg(value-'photoFileIds') INTO items FROM jsonb_array_elements(r.lines);
 returned:=inventory.receive_sales_return(r.order_id,r.warehouse_id,disposition,btrim(why),items);
 END IF;
 UPDATE inventory.return_requests SET status=CASE WHEN decision='PROCESS' THEN 'PROCESSED' ELSE 'REJECTED' END,return_id=returned,decision_reason=btrim(why),version=version+1,decided_by=core.current_actor(),decided_at=now() WHERE id=r.id;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details) VALUES(r.company_id,core.current_actor(),'inventory.return_decided','return_request',r.id,current_setting('htt.request_id',true),jsonb_build_object('decision',decision,'returnId',returned,'reason',btrim(why)));
 RETURN inventory.return_request_view(r.id);
END $$;
REVOKE ALL ON FUNCTION inventory.require_return_photos(uuid,jsonb),inventory.submit_return_request(uuid,uuid,text,jsonb,jsonb),inventory.return_request_view(uuid),inventory.decide_return_request(uuid,bigint,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.submit_return_request(uuid,uuid,text,jsonb,jsonb),inventory.return_request_view(uuid),inventory.decide_return_request(uuid,bigint,text,text,text) TO htt_app;

CREATE FUNCTION inventory.return_request_list(warehouse uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE result jsonb;BEGIN
 PERFORM inventory.require_access('inventory.returns.read',warehouse);SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.created_at DESC,r.id),'[]') INTO result FROM(SELECT id,order_id,warehouse_id,customer_id,version,status,created_at,return_id FROM inventory.return_requests WHERE company_id=core.current_company() AND warehouse_id=warehouse AND platform.document_visible(order_id) ORDER BY created_at DESC,id LIMIT 100)r;RETURN jsonb_build_object('items',result,'limit',100);END $$;
REVOKE ALL ON FUNCTION inventory.return_request_list(uuid) FROM PUBLIC;GRANT EXECUTE ON FUNCTION inventory.return_request_list(uuid) TO htt_app;
