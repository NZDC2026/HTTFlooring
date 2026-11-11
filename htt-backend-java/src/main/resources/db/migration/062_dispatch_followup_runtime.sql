-- Disabled by default. Only the explicit worker feature flag can process mail.
CREATE FUNCTION sales.dispatch_tick_ready() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 UPDATE sales.dispatch_settings SET worker_ready_at=clock_timestamp();
END $$;
CREATE FUNCTION sales.expire_dispatch_quotes() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE x record;n int:=0;BEGIN
 FOR x IN SELECT s.company_id,s.document_id FROM sales.dispatch_schedules s JOIN sales.dispatch_settings cfg ON cfg.company_id=s.company_id AND cfg.enabled JOIN sales.dispatch_cycles c ON c.company_id=s.company_id AND c.document_id=s.document_id AND c.active AND c.kind='CUSTOMER' AND c.state='ACCEPTED' AND c.expected_date=s.expected_date JOIN sales.quotes q ON q.company_id=s.company_id AND q.id=s.document_id AND q.status='SUBMITTED' WHERE s.expired_at IS NULL AND c.expires_on<=(now() AT TIME ZONE cfg.timezone)::date ORDER BY s.company_id,s.document_id FOR UPDATE OF s SKIP LOCKED LIMIT 50 LOOP
 PERFORM set_config('htt.company_id',x.company_id::text,true);
 IF coalesce((sales.dispatch_source(x.document_id)->>'eligible')::boolean,false) THEN
 UPDATE sales.dispatch_schedules SET expired_at=clock_timestamp(),version=version+1 WHERE company_id=x.company_id AND document_id=x.document_id;
 INSERT INTO sales.dispatch_history(company_id,document_id,actor_label,source,action,reason) VALUES(x.company_id,x.document_id,'HTT team','AUTOMATION','Quote expired','Seven calendar days after confirmed follow-up acceptance');n:=n+1;
 END IF;END LOOP;RETURN n;
END $$;
CREATE FUNCTION sales.claim_dispatch_mail(raw_token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cfg sales.dispatch_settings;s sales.dispatch_schedules;src jsonb;j sales.dispatch_cycles;today date;h record;BEGIN
 IF raw_token IS NULL OR raw_token!~'^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid worker token' USING ERRCODE='HI422';END IF;
 -- Expired leases have uncertain outcomes and are never silently resent.
 UPDATE sales.dispatch_cycles SET state='UNKNOWN',last_error='lease_expired',lease=NULL,lease_until=NULL WHERE state='PROCESSING' AND lease_until<now();
 FOR cfg IN SELECT * FROM sales.dispatch_settings WHERE enabled ORDER BY company_id LOOP
 PERFORM set_config('htt.company_id',cfg.company_id::text,true);today:=(now() AT TIME ZONE cfg.timezone)::date;
 UPDATE sales.dispatch_cycles c SET active=false WHERE c.company_id=cfg.company_id AND active AND kind='CUSTOMER' AND (NOT EXISTS(SELECT 1 FROM sales.dispatch_schedules ds WHERE ds.company_id=c.company_id AND ds.document_id=c.document_id AND ds.expected_date=c.expected_date AND ds.expired_at IS NULL) OR NOT coalesce((sales.dispatch_source(c.document_id)->>'eligible')::boolean,false));
 FOR s IN SELECT * FROM sales.dispatch_schedules WHERE company_id=cfg.company_id AND expired_at IS NULL AND expected_date<today ORDER BY document_id FOR UPDATE SKIP LOCKED LOOP
 src:=sales.dispatch_source(s.document_id);
 IF coalesce((src->>'eligible')::boolean,false) AND NOT EXISTS(SELECT 1 FROM sales.dispatch_cycles WHERE company_id=s.company_id AND document_id=s.document_id AND expected_date=s.expected_date AND kind='CUSTOMER' AND active) THEN
 INSERT INTO sales.dispatch_cycles(company_id,document_id,kind,expected_date,token_hash,recipient,payload)
 VALUES(s.company_id,s.document_id,'CUSTOMER',s.expected_date,encode(sha256(convert_to(raw_token,'UTF8')),'hex'),coalesce(src->>'recipient',''),jsonb_build_object('from',cfg.mail_from,'to',jsonb_build_array(coalesce(src->>'recipient','')),'subject','Expected delivery date — '||(src->>'number'),'text','Please update your expected collection or delivery date: '||cfg.portal_origin||'/follow-up#'||raw_token||CASE WHEN src->>'type'='QUOTE' THEN E'\nThis quote expires seven calendar days after this follow-up is accepted.' ELSE E'\nYour order will not be automatically cancelled.' END));
 EXIT;END IF;END LOOP;
 FOR h IN SELECT dh.* FROM sales.dispatch_history dh WHERE dh.company_id=cfg.company_id AND dh.source='PORTAL' AND NOT EXISTS(SELECT 1 FROM sales.dispatch_cycles c WHERE c.history_id=dh.id) ORDER BY dh.created_at LIMIT 10 LOOP
 INSERT INTO sales.dispatch_cycles(company_id,document_id,kind,history_id,recipient,payload) VALUES(h.company_id,h.document_id,'NOTIFICATION',h.id,cfg.notification_email,jsonb_build_object('from',cfg.mail_from,'to',jsonb_build_array(cfg.notification_email),'subject','Customer updated expected date','text','Document '||h.document_id||E'\nNew date: '||coalesce(h.after_value,'')||E'\nReason: '||h.reason));END LOOP;
 SELECT * INTO j FROM sales.dispatch_cycles WHERE company_id=cfg.company_id AND active AND state IN('QUEUED','RETRY') AND available_at<=now() ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1;
 IF FOUND THEN
 IF j.first_attempt_at<now()-interval '23 hours' THEN UPDATE sales.dispatch_cycles SET state='UNKNOWN',last_error='idempotency_window_elapsed' WHERE id=j.id;CONTINUE;END IF;
 IF j.recipient!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN UPDATE sales.dispatch_cycles SET state='FAILED',last_error='recipient_missing_or_invalid' WHERE id=j.id;CONTINUE;END IF;
 UPDATE sales.dispatch_cycles SET state='PROCESSING',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease=gen_random_uuid(),lease_until=now()+interval '90 seconds' WHERE id=j.id RETURNING * INTO j;
 RETURN jsonb_build_object('id',j.id,'lease',j.lease,'payload',j.payload);END IF;
 END LOOP;RETURN NULL;
END $$;
CREATE FUNCTION sales.finish_dispatch_mail(job uuid,fence uuid,outcome text,error_code text,provider text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j sales.dispatch_cycles;zone text;BEGIN
 SELECT * INTO j FROM sales.dispatch_cycles WHERE id=job AND state='PROCESSING' AND lease=fence AND lease_until>now() FOR UPDATE;IF NOT FOUND THEN RETURN false;END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);
 IF outcome NOT IN('ACCEPTED','RETRY','FAILED','UNKNOWN') OR (outcome='ACCEPTED' AND nullif(provider,'') IS NULL) THEN RAISE EXCEPTION 'Invalid delivery result' USING ERRCODE='HI422';END IF;
 SELECT timezone INTO zone FROM sales.dispatch_settings WHERE company_id=j.company_id;
 UPDATE sales.dispatch_cycles SET state=CASE WHEN outcome='RETRY' AND (attempts>=8 OR first_attempt_at<now()-interval '23 hours') THEN 'UNKNOWN' ELSE outcome END,last_error=left(error_code,100),provider_id=left(provider,200),accepted_at=CASE WHEN outcome='ACCEPTED' THEN now() END,expires_on=CASE WHEN outcome='ACCEPTED' AND kind='CUSTOMER' AND EXISTS(SELECT 1 FROM sales.quotes WHERE company_id=j.company_id AND id=j.document_id) THEN (now() AT TIME ZONE zone)::date+7 END,available_at=now()+least(3600,power(2,least(attempts,10))::int*30)*interval '1 second',lease=NULL,lease_until=NULL WHERE id=job;
 RETURN true;
END $$;
CREATE FUNCTION portal.dispatch_origin(origin text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT origin IS NOT NULL AND EXISTS(SELECT 1 FROM sales.dispatch_settings WHERE enabled AND portal_origin=origin) $$;
CREATE FUNCTION portal.dispatch_link(raw_token text,origin text,new_date date DEFAULT NULL,reason text DEFAULT NULL,updating boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j sales.dispatch_cycles;s sales.dispatch_schedules;cfg sales.dispatch_settings;src jsonb;history jsonb;result jsonb;BEGIN
 IF raw_token IS NULL OR raw_token!~'^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Link unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO j FROM sales.dispatch_cycles WHERE token_hash=encode(sha256(convert_to(raw_token,'UTF8')),'hex');
 IF NOT FOUND THEN RAISE EXCEPTION 'Link unavailable' USING ERRCODE='HT404';END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);
 SELECT * INTO cfg FROM sales.dispatch_settings WHERE company_id=j.company_id;
 IF NOT cfg.enabled OR origin IS DISTINCT FROM cfg.portal_origin THEN RAISE EXCEPTION 'Link unavailable' USING ERRCODE='HT404';END IF;
 -- Same lock order as staff updates: document, schedule, then cycle.
 PERFORM 1 FROM platform.documents WHERE company_id=j.company_id AND id=j.document_id FOR UPDATE;
 SELECT * INTO s FROM sales.dispatch_schedules WHERE company_id=j.company_id AND document_id=j.document_id FOR UPDATE;
 SELECT * INTO j FROM sales.dispatch_cycles WHERE id=j.id FOR UPDATE;
 IF updating AND j.completed_request IS NOT NULL THEN
 IF j.completed_request=jsonb_build_object('date',new_date,'reason',btrim(reason)) THEN RETURN j.completed_response;END IF;
 RAISE EXCEPTION 'This link has already been used' USING ERRCODE='HI409';END IF;
 src:=sales.dispatch_source(j.document_id);
 IF NOT j.active OR j.state<>'ACCEPTED' OR j.accepted_at<now()-interval '30 days' OR j.expected_date IS DISTINCT FROM s.expected_date OR s.expired_at IS NOT NULL OR NOT coalesce((src->>'eligible')::boolean,false) OR j.expires_on<=(now() AT TIME ZONE cfg.timezone)::date THEN RAISE EXCEPTION 'Link unavailable' USING ERRCODE='HT404';END IF;
 IF updating THEN
 IF new_date IS NULL OR new_date<(now() AT TIME ZONE cfg.timezone)::date OR new_date=s.expected_date OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Choose a new current/future date and a reason of 3..1000 characters' USING ERRCODE='HI422';END IF;
 UPDATE sales.dispatch_schedules SET expected_date=new_date,version=version+1,updated_at=now() WHERE company_id=j.company_id AND document_id=j.document_id;
 UPDATE sales.dispatch_cycles SET active=false WHERE company_id=j.company_id AND document_id=j.document_id AND kind='CUSTOMER' AND active;
 INSERT INTO sales.dispatch_history(company_id,document_id,actor_label,source,action,before_value,after_value,reason) VALUES(j.company_id,j.document_id,'Customer','PORTAL','Customer updated expected dispatch date',s.expected_date::text,new_date::text,btrim(reason));
 s.expected_date:=new_date;END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'actor',CASE WHEN source='PORTAL' THEN 'Customer' ELSE 'HTT team' END,'at',created_at,'action',action,'before',before_value,'after',after_value,'reason',reason) ORDER BY created_at,id),'[]'::jsonb) INTO history FROM sales.dispatch_history WHERE company_id=j.company_id AND document_id=j.document_id;
 result:=jsonb_build_object('documentNumber',src->>'number','type',src->>'type','expectedDate',s.expected_date,'expiresOn',CASE WHEN NOT updating THEN j.expires_on END,'history',history);
 IF updating THEN UPDATE sales.dispatch_cycles SET completed_request=jsonb_build_object('date',new_date,'reason',btrim(reason)),completed_response=result WHERE id=j.id;END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION sales.dispatch_tick_ready(),sales.expire_dispatch_quotes(),sales.claim_dispatch_mail(text),sales.finish_dispatch_mail(uuid,uuid,text,text,text),portal.dispatch_origin(text),portal.dispatch_link(text,text,date,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.dispatch_tick_ready(),sales.expire_dispatch_quotes(),sales.claim_dispatch_mail(text),sales.finish_dispatch_mail(uuid,uuid,text,text,text) TO htt_worker;
GRANT EXECUTE ON FUNCTION portal.dispatch_origin(text),portal.dispatch_link(text,text,date,text,boolean) TO htt_portal;
