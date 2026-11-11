-- All projections use the same calendar deadline, even before the next worker tick.
CREATE FUNCTION sales.dispatch_deadline_expired(doc uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS(SELECT 1 FROM sales.dispatch_schedules s LEFT JOIN sales.dispatch_settings cfg ON cfg.company_id=s.company_id WHERE s.company_id=core.current_company() AND s.document_id=doc AND(s.expired_at IS NOT NULL OR EXISTS(SELECT 1 FROM sales.dispatch_cycles c WHERE c.company_id=s.company_id AND c.document_id=s.document_id AND c.active AND c.kind='CUSTOMER' AND c.state='ACCEPTED' AND c.expected_date=s.expected_date AND c.expires_on<=(now() AT TIME ZONE coalesce(cfg.timezone,'Australia/Melbourne'))::date)))
$$;
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('inventory.commercial_reservations()'::regprocedure);
 body:=replace(body,'ds.expired_at IS NOT NULL','(ds.expired_at IS NOT NULL OR sales.dispatch_deadline_expired(ds.document_id))');EXECUTE body;
 body:=pg_get_functiondef('portal.sales_documents(text,text,uuid,uuid,uuid,text,uuid,integer,integer)'::regprocedure);
 body:=replace(body,'q.status AS source_state', $replacement$CASE WHEN sales.dispatch_deadline_expired(q.id) THEN 'EXPIRED' ELSE q.status END AS source_state$replacement$);EXECUTE body;
 body:=pg_get_functiondef('sales.dispatch_view(uuid)'::regprocedure);
 body:=replace(body,$old$'eligibleForFollowup',coalesce((src->>'eligible')::boolean,false) AND s.expired_at IS NULL$old$,$new$'followupExpired',sales.dispatch_deadline_expired(doc),'eligibleForFollowup',coalesce((src->>'eligible')::boolean,false) AND NOT sales.dispatch_deadline_expired(doc)$new$);EXECUTE body;
END $migration$;
CREATE FUNCTION accounting.load_reminder_mail(job uuid,fence uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE m accounting.reminder_mails;b accounting.reminder_batches;cfg accounting.reminder_settings;hash text;BEGIN
 SELECT * INTO m FROM accounting.reminder_mails WHERE id=job AND state='PROCESSING' AND lease=fence AND lease_until>now() FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL;END IF;
 PERFORM set_config('htt.company_id',m.company_id::text,true);SELECT * INTO b FROM accounting.reminder_batches WHERE id=m.batch_id;PERFORM set_config('htt.actor_id',b.created_by::text,true);
 SELECT * INTO cfg FROM accounting.reminder_settings WHERE company_id=m.company_id;
 BEGIN hash:=accounting.reminder_fingerprint(b.mode,b.invoice_ids,b.from_date,b.to_date);EXCEPTION WHEN OTHERS THEN hash:=NULL;END;
 IF NOT cfg.enabled OR hash IS DISTINCT FROM b.source_hash THEN UPDATE accounting.reminder_mails SET state='SKIPPED',last_error='source_or_access_changed_before_send',lease=NULL,lease_until=NULL WHERE id=m.id;RETURN NULL;END IF;
 RETURN jsonb_build_object('from',cfg.mail_from,'to',jsonb_build_array(m.recipient),'subject',m.subject,'text',m.message);
END $$;
REVOKE ALL ON FUNCTION sales.dispatch_deadline_expired(uuid),accounting.load_reminder_mail(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.dispatch_deadline_expired(uuid) TO htt_app;
GRANT EXECUTE ON FUNCTION accounting.load_reminder_mail(uuid,uuid) TO htt_worker;
GRANT USAGE ON SCHEMA sales,accounting TO htt_worker;
