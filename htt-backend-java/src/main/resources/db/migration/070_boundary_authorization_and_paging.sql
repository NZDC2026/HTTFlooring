-- Forward-only repairs for quote deadlines, asynchronous authority and return list access.
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('sales.quote_conversion_expired(uuid)'::regprocedure);
 body:=replace(body,'RETURN s.expired_at IS NOT NULL OR deadline<=(now() AT TIME ZONE zone)::date;', 'RETURN coalesce(s.expired_at IS NOT NULL OR deadline<=(now() AT TIME ZONE zone)::date,false);');
 EXECUTE body;
 body:=pg_get_functiondef('sales.set_dispatch_schedule(uuid,bigint,date,boolean,boolean,text)'::regprocedure);
 body:=replace(body,'OR s.expired_at IS NOT NULL THEN', 'OR sales.dispatch_deadline_expired(doc) THEN');EXECUTE body;
END $migration$;

ALTER TABLE accounting.reminder_batches ADD COLUMN queued_by uuid REFERENCES identity.users(id),ADD COLUMN queued_by_inferred boolean NOT NULL DEFAULT false;
-- Old queues have no recorded confirmer: retain the original initiating authority conservatively.
UPDATE accounting.reminder_batches SET queued_by=created_by,queued_by_inferred=true WHERE queued_at IS NOT NULL;
CREATE FUNCTION accounting.require_reminder_authority(kind text,ids uuid[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;BEGIN
 PERFORM purchase.require_access('documents.email.send');PERFORM purchase.require_access('documents.pdf.request');PERFORM purchase.require_access('sales.invoices.read');
 IF kind='STATEMENT' THEN PERFORM purchase.require_access('accounting.statements.send');
 ELSIF kind='INVOICE' THEN PERFORM purchase.require_access('sales.invoices.send');
 ELSE RAISE EXCEPTION 'Unknown reminder mode' USING ERRCODE='HI422';END IF;
 FOR cust IN SELECT DISTINCT customer_id FROM sales.invoices WHERE company_id=core.current_company() AND id=ANY(ids) LOOP
 IF kind='STATEMENT' THEN PERFORM accounting.require_statement_customer(cust);ELSE PERFORM sales.require_customer_access('sales.invoices.read',cust);END IF;
 END LOOP;
END $$;
CREATE FUNCTION accounting.require_reminder_batch_authority(batch uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE b accounting.reminder_batches;prior text:=current_setting('htt.actor_id',true);BEGIN
 SELECT * INTO b FROM accounting.reminder_batches WHERE company_id=core.current_company() AND id=batch;
 IF NOT FOUND THEN RAISE EXCEPTION 'Batch unavailable' USING ERRCODE='HT404';END IF;
 PERFORM set_config('htt.actor_id',b.created_by::text,true);PERFORM accounting.require_reminder_authority(b.mode,b.invoice_ids);
 IF b.queued_by IS NOT NULL AND b.queued_by<>b.created_by THEN
 PERFORM set_config('htt.actor_id',b.queued_by::text,true);PERFORM accounting.require_reminder_authority(b.mode,b.invoice_ids);
 END IF;
 PERFORM set_config('htt.actor_id',coalesce(prior,''),true);
EXCEPTION WHEN OTHERS THEN PERFORM set_config('htt.actor_id',coalesce(prior,''),true);RAISE;
END $$;
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('accounting.reminder_fingerprint(text,uuid[],date,date)'::regprocedure);
 body:=replace(body,'source:=accounting.reminder_rows(ids);','PERFORM accounting.require_reminder_authority(kind,ids);source:=accounting.reminder_rows(ids);');EXECUTE body;
 body:=pg_get_functiondef('accounting.queue_reminders(uuid,boolean)'::regprocedure);
 body:=replace(body,$old$IF confirmed IS DISTINCT FROM true THEN$old$,$new$PERFORM accounting.require_reminder_authority(b.mode,b.invoice_ids);
 IF confirmed IS DISTINCT FROM true THEN$new$);
 body:=replace(body,'SET queued_at=now() WHERE id=batch','SET queued_at=now(),queued_by=core.current_actor(),queued_by_inferred=false WHERE id=batch');EXECUTE body;
 body:=pg_get_functiondef('accounting.claim_reminder_mail()'::regprocedure);
 body:=replace(body,'BEGIN hash:=accounting.reminder_fingerprint(', 'BEGIN PERFORM accounting.require_reminder_batch_authority(m.batch_id);hash:=accounting.reminder_fingerprint(');EXECUTE body;
 body:=pg_get_functiondef('accounting.load_reminder_mail(uuid,uuid)'::regprocedure);
 body:=replace(body,'BEGIN hash:=accounting.reminder_fingerprint(', 'BEGIN PERFORM accounting.require_reminder_batch_authority(m.batch_id);hash:=accounting.reminder_fingerprint(');EXECUTE body;
END $migration$;
REVOKE ALL ON FUNCTION accounting.require_reminder_authority(text,uuid[]),accounting.require_reminder_batch_authority(uuid) FROM PUBLIC;

CREATE FUNCTION inventory.return_request_list(warehouse uuid,p_page int,p_size int,p_status text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;BEGIN
 PERFORM inventory.require_access('inventory.returns.read',warehouse);
 IF p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000 OR p_size IS NULL OR p_size NOT BETWEEN 1 AND 100 OR (p_status IS NOT NULL AND p_status NOT IN('PENDING','PROCESSED','REJECTED')) THEN RAISE EXCEPTION 'Valid page, pageSize 1..100 and return status required' USING ERRCODE='HI422';END IF;
 WITH matching AS MATERIALIZED(SELECT id,order_id,warehouse_id,customer_id,version,status,created_at,return_id FROM inventory.return_requests WHERE company_id=core.current_company() AND warehouse_id=warehouse AND(p_status IS NULL OR status=p_status) AND platform.document_visible(order_id)),
 selected AS(SELECT * FROM matching ORDER BY created_at DESC,id LIMIT p_size OFFSET(p_page-1)*p_size)
 SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.created_at DESC,s.id) FROM selected s),'[]'::jsonb),'page',p_page,'pageSize',p_size,'limit',p_size,'totalCount',(SELECT count(*) FROM matching),'hasMore',(SELECT count(*) FROM matching)>p_page::bigint*p_size) INTO result;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION inventory.return_request_list(warehouse uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT inventory.return_request_list(warehouse,1,100,NULL) $$;
REVOKE ALL ON FUNCTION inventory.return_request_list(uuid,int,int,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.return_request_list(uuid,int,int,text) TO htt_app;
CREATE INDEX return_requests_worklist ON inventory.return_requests(company_id,warehouse_id,status,created_at DESC,id);
