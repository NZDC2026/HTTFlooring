-- Recheck current recipient and sender immediately before invoking the external provider.
CREATE FUNCTION sales.load_dispatch_mail(job uuid,fence uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j sales.dispatch_cycles;cfg sales.dispatch_settings;src jsonb;valid boolean;BEGIN
 SELECT * INTO j FROM sales.dispatch_cycles WHERE id=job AND state='PROCESSING' AND lease=fence AND lease_until>now() FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL;END IF;PERFORM set_config('htt.company_id',j.company_id::text,true);
 SELECT * INTO cfg FROM sales.dispatch_settings WHERE company_id=j.company_id;src:=sales.dispatch_source(j.document_id);
 valid:=coalesce(cfg.enabled,false) AND j.active AND j.payload->>'from'=cfg.mail_from AND src IS NOT NULL;
 IF j.kind='CUSTOMER' THEN valid:=valid AND coalesce((src->>'eligible')::boolean,false) AND j.recipient IS NOT DISTINCT FROM(src->>'recipient') AND position(cfg.portal_origin||'/follow-up#' IN(j.payload->>'text'))>0 AND EXISTS(SELECT 1 FROM sales.dispatch_schedules WHERE company_id=j.company_id AND document_id=j.document_id AND expected_date=j.expected_date AND expired_at IS NULL);
 ELSE valid:=valid AND j.recipient=cfg.notification_email;END IF;
 IF NOT coalesce(valid,false) THEN UPDATE sales.dispatch_cycles SET state='FAILED',last_error='source_recipient_or_configuration_changed',lease=NULL,lease_until=NULL WHERE id=j.id;RETURN NULL;END IF;
 RETURN j.payload;
END $$;
REVOKE ALL ON FUNCTION sales.load_dispatch_mail(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.load_dispatch_mail(uuid,uuid) TO htt_worker;
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('sales.dispatch_view(uuid)'::regprocedure);
 body:=replace(body,$find$'dispatchHistory',history$find$,$replacement$'dispatchHistory',history,'followupDelivery',(SELECT jsonb_build_object('state',c.state,'attempts',c.attempts,'error',c.last_error,'acceptedAt',c.accepted_at,'expiresOn',c.expires_on) FROM sales.dispatch_cycles c WHERE c.company_id=core.current_company() AND c.document_id=doc AND c.kind='CUSTOMER' ORDER BY c.created_at DESC,c.id DESC LIMIT 1)$replacement$);EXECUTE body;
END $migration$;
