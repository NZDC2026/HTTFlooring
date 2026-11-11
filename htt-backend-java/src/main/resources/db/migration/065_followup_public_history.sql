-- Qualify history columns to keep the public reason parameter distinct from stored history.
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('portal.dispatch_link(text,text,date,text,boolean)'::regprocedure);
 body:=replace(body,$old$SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'actor',CASE WHEN source='PORTAL' THEN 'Customer' ELSE 'HTT team' END,'at',created_at,'action',action,'before',before_value,'after',after_value,'reason',reason) ORDER BY created_at,id),'[]'::jsonb) INTO history FROM sales.dispatch_history WHERE company_id=j.company_id AND document_id=j.document_id;$old$,
 $new$SELECT coalesce(jsonb_agg(jsonb_build_object('id',h.id,'actor',CASE WHEN h.source='PORTAL' THEN 'Customer' ELSE 'HTT team' END,'at',h.created_at,'action',h.action,'before',h.before_value,'after',h.after_value,'reason',h.reason) ORDER BY h.created_at,h.id),'[]'::jsonb) INTO history FROM sales.dispatch_history h WHERE h.company_id=j.company_id AND h.document_id=j.document_id;$new$);
 body:=replace(body,'new_date<(now() AT TIME ZONE cfg.timezone)::date','new_date<=(now() AT TIME ZONE cfg.timezone)::date');
 EXECUTE body;
END $migration$;

DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('sales.configure_followups(bigint,boolean,text,text,text,text)'::regprocedure);
 body:=replace(body,'INSERT INTO sales.dispatch_settings(company_id,version,enabled,mail_from,notification_email,portal_origin,timezone)',
 $guard$IF enabled AND(c.worker_ready_at IS NULL OR c.worker_ready_at<now()-interval '2 minutes') THEN RAISE EXCEPTION 'Configure an active follow-up worker before enabling mail' USING ERRCODE='HI409';END IF;
 INSERT INTO sales.dispatch_settings(company_id,version,enabled,mail_from,notification_email,portal_origin,timezone)$guard$);
 EXECUTE body;
END $migration$;
