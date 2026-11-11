-- Forward repairs; historical ledgers and existing migration checksums are preserved.
DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('sales.quote_conversion_expired(uuid)'::regprocedure);
 body:=replace(body,'IF NOT FOUND OR s.expected_date IS NULL THEN RETURN', 'IF (SELECT expires_on<(now() AT TIME ZONE c.timezone)::date FROM sales.quotes q JOIN core.companies c ON c.id=q.company_id WHERE q.company_id=core.current_company() AND q.id=doc) THEN RETURN true;END IF; IF NOT FOUND OR s.expected_date IS NULL THEN RETURN');EXECUTE body;
 body:=pg_get_functiondef('accounting.reminder_batch_view(uuid)'::regprocedure);
 body:=replace(body,'PERFORM accounting.reminder_rows(b.invoice_ids);','PERFORM accounting.require_reminder_authority(b.mode,b.invoice_ids);PERFORM accounting.reminder_rows(b.invoice_ids);');EXECUTE body;
END $m$;
-- Quote holds are warehouse-specific commercial quantities, never physical stock or journals.
CREATE FUNCTION inventory.quote_hold_quantity(c uuid,w uuid,p uuid) RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT coalesce(sum(h.quantity),0) FROM inventory.quote_holds h JOIN sales.quotes q ON q.company_id=h.company_id AND q.id=h.quote_id
 JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.id JOIN core.companies co ON co.id=q.company_id
 LEFT JOIN sales.dispatch_schedules ds ON ds.company_id=q.company_id AND ds.document_id=q.id LEFT JOIN sales.dispatch_settings cfg ON cfg.company_id=q.company_id
 WHERE h.company_id=c AND q.warehouse_id=w AND h.product_id=p AND h.active AND q.status='SUBMITTED' AND d.state='CONFIRMED' AND d.deleted_at IS NULL
 AND NOT EXISTS(SELECT 1 FROM platform.document_visibility v WHERE v.company_id=c AND v.document_id=q.id AND v.trashed_at IS NOT NULL)
 AND q.expires_on>=(now() AT TIME ZONE co.timezone)::date AND ds.expired_at IS NULL
 AND NOT EXISTS(SELECT 1 FROM sales.dispatch_cycles x WHERE x.company_id=c AND x.document_id=q.id AND x.active AND x.kind='CUSTOMER' AND x.state='ACCEPTED' AND x.expected_date=ds.expected_date AND x.expires_on<=(now() AT TIME ZONE coalesce(cfg.timezone,co.timezone))::date)
 AND NOT EXISTS(SELECT 1 FROM sales.orders o WHERE o.company_id=c AND o.source_quote_id=q.id)
$$;
CREATE FUNCTION inventory.quote_reserved(w uuid,p uuid) RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 PERFORM inventory.require_access('inventory.read',w);RETURN inventory.quote_hold_quantity(core.current_company(),w,p);END $$;
REVOKE ALL ON FUNCTION inventory.quote_hold_quantity(uuid,uuid,uuid),inventory.quote_reserved(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.quote_reserved(uuid,uuid) TO htt_app;
CREATE OR REPLACE FUNCTION portal.scoped_stock(c uuid,g uuid,b uuid,p uuid) RETURNS TABLE(id uuid,code text,name text,available numeric) LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT w.id,w.code,w.name,greatest(0,coalesce(x.on_hand-x.reserved,0)-inventory.quote_hold_quantity(c,w.id,p)) FROM identity.customer_user_warehouse_scopes s JOIN catalog.warehouses w ON w.company_id=s.company_id AND w.id=s.warehouse_id AND w.active AND w.kind='SELLABLE'
 LEFT JOIN inventory.stock_balances x ON x.company_id=w.company_id AND x.warehouse_id=w.id AND x.product_id=p WHERE s.company_id=c AND s.grant_id=g AND s.customer_branch_id=b
$$;
DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('inventory.commercial_reservations()'::regprocedure);
 body:=replace(body,'SELECT h.product_id,h.quantity FROM inventory.quote_holds h', 'SELECT h.product_id,inventory.quote_hold_quantity(h.company_id,q.warehouse_id,h.product_id) AS quantity FROM inventory.quote_holds h');
 -- A per-line replacement would repeat product totals; use one row per warehouse/product.
 body:=replace(body,'SELECT h.product_id,inventory.quote_hold_quantity(h.company_id,q.warehouse_id,h.product_id) AS quantity', 'SELECT DISTINCT h.product_id,q.warehouse_id AS hold_warehouse,inventory.quote_hold_quantity(h.company_id,q.warehouse_id,h.product_id) AS quantity');
 body:=replace(body,'SELECT l.product_id,r.remaining_quantity', 'SELECT l.product_id,o.warehouse_id AS hold_warehouse,r.remaining_quantity');EXECUTE body;
END $m$;
-- Order discovery uses warehouse return authority, not sales/financial read permissions.
CREATE FUNCTION inventory.return_order_list(w uuid,p_page int,p_size int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE result jsonb;BEGIN
 PERFORM inventory.require_access('inventory.returns.read',w);
 IF p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000 OR p_size IS NULL OR p_size NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Valid pagination required' USING ERRCODE='HI422';END IF;
 WITH matching AS MATERIALIZED(SELECT o.id,o.customer_id,o.warehouse_id,d.version,d.number,p.legal_name AS customer_name FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id JOIN crm.customers c ON c.company_id=o.company_id AND c.id=o.customer_id JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE o.company_id=core.current_company() AND o.warehouse_id=w AND platform.document_visible(o.id) AND EXISTS(SELECT 1 FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id JOIN sales.order_lines l ON l.company_id=pl.company_id AND l.id=pl.order_line_id WHERE l.company_id=o.company_id AND l.order_id=o.id)), selected AS(SELECT * FROM matching ORDER BY number,id LIMIT p_size OFFSET(p_page-1)*p_size)
 SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY number,id) FROM selected x),'[]'::jsonb),'page',p_page,'pageSize',p_size,'hasMore',(SELECT count(*) FROM matching)>p_page::bigint*p_size) INTO result;RETURN result;END $$;
REVOKE ALL ON FUNCTION inventory.return_order_list(uuid,int,int) FROM PUBLIC;GRANT EXECUTE ON FUNCTION inventory.return_order_list(uuid,int,int) TO htt_app;
DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('inventory.submit_return_request(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
 body:=replace(body,'qty:=(item->>''quantity'')::numeric;', $new$IF item->>'condition' IS NOT NULL AND item->>'condition' NOT IN('good','damaged') OR item->>'reason' IS NOT NULL AND length(btrim(item->>'reason')) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'Valid item condition and reason required' USING ERRCODE='HI422';END IF;qty:=(item->>'quantity')::numeric;$new$);EXECUTE body;
END $m$;
-- Authorization precedes idempotency replay, so old responses cannot bypass revocation.
CREATE FUNCTION accounting.reminder_preview_access(kind text,ids uuid[]) RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 IF ids IS NULL OR cardinality(ids) NOT BETWEEN 1 AND 100 OR array_position(ids,NULL) IS NOT NULL OR (SELECT count(DISTINCT value) FROM unnest(ids) value)<>cardinality(ids) THEN RAISE EXCEPTION 'Select distinct invoices' USING ERRCODE='HI422';END IF;
 PERFORM accounting.require_reminder_authority(kind,ids);IF jsonb_array_length(accounting.reminder_rows(ids))<>cardinality(ids) THEN RAISE EXCEPTION 'Invoice unavailable; refresh preview' USING ERRCODE='HI409';END IF;END $$;
REVOKE ALL ON FUNCTION accounting.reminder_preview_access(text,uuid[]) FROM PUBLIC;GRANT EXECUTE ON FUNCTION accounting.reminder_preview_access(text,uuid[]) TO htt_app;
-- Review may route damaged goods to an authorized quarantine warehouse without
-- changing the original request's warehouse visibility or losing its evidence.
ALTER TABLE inventory.return_requests ADD COLUMN received_warehouse_id uuid,ADD FOREIGN KEY(company_id,received_warehouse_id) REFERENCES catalog.warehouses(company_id,id);
DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('inventory.decide_return_request(uuid,bigint,text,text,text)'::regprocedure);
 body:=replace(body,'why text)','why text, receiving_warehouse uuid)');
 body:=replace(body,'returned uuid;items jsonb;BEGIN','returned uuid;items jsonb;target uuid;BEGIN');
 body:=replace(body,$old$IF decision='PROCESS' THEN$old$,$new$IF decision='REJECT' AND receiving_warehouse IS NOT NULL THEN RAISE EXCEPTION 'Receiving warehouse is only valid when processing' USING ERRCODE='HI422';END IF;
 IF decision='PROCESS' THEN target:=coalesce(receiving_warehouse,r.warehouse_id);PERFORM inventory.require_access('inventory.returns.write',target);$new$);
 body:=replace(body,'inventory.receive_sales_return(r.order_id,r.warehouse_id,','inventory.receive_sales_return(r.order_id,target,');
 body:=replace(body,'return_id=returned,decision_reason=', $new$return_id=returned,received_warehouse_id=CASE WHEN decision='PROCESS' THEN target ELSE NULL END,decision_reason=$new$);EXECUTE body;
END $m$;
CREATE OR REPLACE FUNCTION inventory.decide_return_request(request uuid,expected bigint,decision text,disposition text,why text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$SELECT inventory.decide_return_request(request,expected,decision,disposition,why,NULL)$$;
REVOKE ALL ON FUNCTION inventory.decide_return_request(uuid,bigint,text,text,text,uuid) FROM PUBLIC;GRANT EXECUTE ON FUNCTION inventory.decide_return_request(uuid,bigint,text,text,text,uuid) TO htt_app;

DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('sales.dispatch_source(uuid)'::regprocedure);
 body:=replace(body,$old$eligible:=state='SUBMITTED'$old$,$new$IF EXISTS(SELECT 1 FROM sales.quotes q JOIN core.companies c ON c.id=q.company_id WHERE q.company_id=d.company_id AND q.id=doc AND q.expires_on<(now() AT TIME ZONE c.timezone)::date) THEN state:='EXPIRED';END IF;
 eligible:=state='SUBMITTED'$new$);EXECUTE body;
END $m$;
DO $m$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('portal.sales_documents(text,text,uuid,uuid,uuid,text,uuid,integer,integer)'::regprocedure);
 body:=replace(body,$old$CASE WHEN sales.dispatch_deadline_expired(q.id) THEN 'EXPIRED' ELSE q.status END AS source_state$old$,$new$CASE WHEN q.status='SUBMITTED' AND (q.expires_on<today OR sales.dispatch_deadline_expired(q.id)) THEN 'EXPIRED' ELSE q.status END AS source_state$new$);EXECUTE body;
END $m$;
