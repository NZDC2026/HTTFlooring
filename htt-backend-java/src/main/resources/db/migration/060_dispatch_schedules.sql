-- Operational metadata and commercial expiry never rewrite posted sales/stock/accounting records.
CREATE TABLE sales.dispatch_settings(
 company_id uuid PRIMARY KEY REFERENCES core.companies(id),version bigint NOT NULL DEFAULT 1,
 enabled boolean NOT NULL DEFAULT false,mail_from text NOT NULL DEFAULT '',notification_email text NOT NULL DEFAULT '',
 portal_origin text NOT NULL DEFAULT '',timezone text NOT NULL DEFAULT 'Australia/Melbourne',worker_ready_at timestamptz);
CREATE TABLE sales.dispatch_schedules(
 company_id uuid NOT NULL,document_id uuid NOT NULL,version bigint NOT NULL DEFAULT 1,
 expected_date date,delivery_booked boolean NOT NULL DEFAULT false,awaiting_collection boolean NOT NULL DEFAULT false,
 expired_at timestamptz,updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(company_id,document_id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id),
 CHECK(NOT delivery_booked OR expected_date IS NOT NULL));
CREATE TABLE sales.dispatch_history(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,document_id uuid NOT NULL,
 actor_id uuid REFERENCES identity.users(id),actor_label text NOT NULL,source text NOT NULL CHECK(source IN('MANAGEMENT','PORTAL','AUTOMATION')),
 action text NOT NULL,before_value text,after_value text,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id));
CREATE TABLE sales.dispatch_cycles(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,document_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN('CUSTOMER','NOTIFICATION')),history_id uuid REFERENCES sales.dispatch_history(id),
 expected_date date,token_hash text UNIQUE,recipient text NOT NULL,payload jsonb NOT NULL,
 state text NOT NULL DEFAULT 'QUEUED' CHECK(state IN('QUEUED','PROCESSING','RETRY','ACCEPTED','FAILED','UNKNOWN')),
 active boolean NOT NULL DEFAULT true,attempts int NOT NULL DEFAULT 0,available_at timestamptz NOT NULL DEFAULT now(),
 first_attempt_at timestamptz,lease uuid,lease_until timestamptz,accepted_at timestamptz,expires_on date,
 last_error text,provider_id text,completed_request jsonb,completed_response jsonb,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id),UNIQUE(history_id));
CREATE UNIQUE INDEX dispatch_active_customer ON sales.dispatch_cycles(company_id,document_id,expected_date) WHERE active AND kind='CUSTOMER';
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['dispatch_settings','dispatch_schedules','dispatch_history','dispatch_cycles'] LOOP
 EXECUTE format('ALTER TABLE sales.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE sales.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON sales.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);END LOOP;END $$;
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON sales.dispatch_history FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
INSERT INTO identity.permissions(code,description) VALUES('sales.followups.manage','Configure customer date follow-ups; worker activation remains explicit');
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'sales.followups.manage' FROM identity.roles WHERE company_id=c AND code='ADMIN' ON CONFLICT DO NOTHING;
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION sales.seed_followup_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.code='ADMIN' THEN INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(NEW.company_id,NEW.id,'sales.followups.manage') ON CONFLICT DO NOTHING;END IF;RETURN NEW;END $$;
CREATE TRIGGER new_followup_permission AFTER INSERT ON identity.roles FOR EACH ROW EXECUTE FUNCTION sales.seed_followup_role();
CREATE FUNCTION sales.require_dispatch_access(doc uuid,writing boolean DEFAULT false) RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;cust uuid;cap text;BEGIN
 IF NOT platform.document_visible(doc) THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
 SELECT document_type INTO typ FROM platform.documents WHERE company_id=core.current_company() AND id=doc;
 IF typ='QUOTE' THEN SELECT customer_id INTO cust FROM sales.quotes WHERE company_id=core.current_company() AND id=doc;cap:=CASE WHEN writing THEN 'sales.quotes.write' ELSE 'sales.quotes.read' END;
 ELSIF typ='SALES_ORDER' THEN SELECT customer_id INTO cust FROM sales.orders WHERE company_id=core.current_company() AND id=doc;cap:=CASE WHEN writing THEN 'sales.orders.create' ELSE 'sales.orders.read' END;
 ELSIF typ='INVOICE' THEN SELECT customer_id INTO cust FROM sales.invoices WHERE company_id=core.current_company() AND id=doc;cap:=CASE WHEN writing THEN 'sales.invoices.write' ELSE 'sales.invoices.read' END;
 ELSE RAISE EXCEPTION 'Only sales documents support dispatch scheduling' USING ERRCODE='HI422';END IF;
 PERFORM sales.require_customer_access(cap,cust);
END $$;
CREATE FUNCTION sales.dispatch_source(doc uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$
DECLARE d platform.documents;cust uuid;state text;eligible boolean:=false;recipient text;BEGIN
 SELECT * INTO d FROM platform.documents WHERE company_id=core.current_company() AND id=doc;
 IF NOT FOUND OR NOT platform.document_visible(doc) THEN RETURN NULL;END IF;
 IF d.document_type='QUOTE' THEN SELECT customer_id,status INTO cust,state FROM sales.quotes WHERE company_id=d.company_id AND id=doc;
 eligible:=state='SUBMITTED' AND NOT EXISTS(SELECT 1 FROM sales.orders WHERE company_id=d.company_id AND source_quote_id=doc);
 ELSIF d.document_type='SALES_ORDER' THEN SELECT customer_id INTO cust FROM sales.orders WHERE company_id=d.company_id AND id=doc;state:=d.state;
 eligible:=d.state NOT IN('DRAFT','CANCELLED') AND NOT EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=d.company_id AND order_id=doc)
 AND NOT(EXISTS(SELECT 1 FROM sales.order_lines WHERE company_id=d.company_id AND order_id=doc AND item_type='STOCK') AND NOT EXISTS(
 SELECT 1 FROM sales.order_lines l WHERE l.company_id=d.company_id AND l.order_id=doc AND l.item_type='STOCK' AND l.base_quantity>coalesce((SELECT sum(m.quantity) FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id WHERE pl.company_id=l.company_id AND pl.order_line_id=l.id),0)));
 ELSIF d.document_type='INVOICE' THEN SELECT customer_id INTO cust FROM sales.invoices WHERE company_id=d.company_id AND id=doc;state:=d.state;END IF;
 SELECT lower(btrim(x.email)) INTO recipient FROM crm.customers c JOIN crm.contacts x ON x.company_id=c.company_id AND x.party_id=c.party_id WHERE c.company_id=d.company_id AND c.id=cust AND x.active AND x.is_accounting AND x.email IS NOT NULL ORDER BY x.id LIMIT 1;
 RETURN jsonb_build_object('id',doc,'type',d.document_type,'number',d.number,'state',state,'customerId',cust,'recipient',recipient,'eligible',coalesce(eligible,false) AND lower(coalesce(d.number,'')) NOT LIKE '%sample%');
END $$;
CREATE FUNCTION sales.dispatch_view(doc uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE s sales.dispatch_schedules;src jsonb;history jsonb;BEGIN
 PERFORM sales.require_dispatch_access(doc);src:=sales.dispatch_source(doc);
 SELECT * INTO s FROM sales.dispatch_schedules WHERE company_id=core.current_company() AND document_id=doc;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',h.id,'actor',h.actor_label,'at',h.created_at,'source',h.source,'action',h.action,'before',h.before_value,'after',h.after_value,'reason',h.reason) ORDER BY h.created_at,h.id),'[]'::jsonb) INTO history FROM sales.dispatch_history h WHERE h.company_id=core.current_company() AND h.document_id=doc;
 RETURN jsonb_build_object('id',doc,'type',src->>'type','documentNumber',src->>'number','version',coalesce(s.version,1),'expectedDispatchDate',s.expected_date,'deliveryBooked',coalesce(s.delivery_booked,false),'awaitingCollection',coalesce(s.awaiting_collection,false),'expiredAt',s.expired_at,'eligibleForFollowup',coalesce((src->>'eligible')::boolean,false) AND s.expired_at IS NULL,'dispatchHistory',history);
END $$;
CREATE FUNCTION sales.set_dispatch_schedule(doc uuid,expected bigint,new_date date,booked boolean,collection boolean,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE s sales.dispatch_schedules;src jsonb;label text;BEGIN
 PERFORM sales.require_dispatch_access(doc,true);
 PERFORM 1 FROM platform.documents WHERE company_id=core.current_company() AND id=doc FOR UPDATE;
 SELECT * INTO s FROM sales.dispatch_schedules WHERE company_id=core.current_company() AND document_id=doc FOR UPDATE;
 IF coalesce(s.version,1) IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Dispatch schedule changed' USING ERRCODE='HI409';END IF;
 src:=sales.dispatch_source(doc);
 IF src->>'state' IN('VOID','CANCELLED','DECLINED','EXPIRED') OR s.expired_at IS NOT NULL THEN RAISE EXCEPTION 'Closed or expired document cannot be scheduled' USING ERRCODE='HI409';END IF;
 IF booked IS NULL OR collection IS NULL OR booked AND new_date IS NULL OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Valid dispatch flags, date and reason required' USING ERRCODE='HI422';END IF;
 INSERT INTO sales.dispatch_schedules(company_id,document_id,version,expected_date,delivery_booked,awaiting_collection)
 VALUES(core.current_company(),doc,coalesce(s.version,1)+1,new_date,booked,collection)
 ON CONFLICT(company_id,document_id) DO UPDATE SET version=excluded.version,expected_date=excluded.expected_date,delivery_booked=excluded.delivery_booked,awaiting_collection=excluded.awaiting_collection,updated_at=clock_timestamp();
 IF s.expected_date IS DISTINCT FROM new_date THEN
 UPDATE sales.dispatch_cycles SET active=false WHERE company_id=core.current_company() AND document_id=doc AND active;
 SELECT display_name INTO label FROM identity.users WHERE id=core.current_actor();
 INSERT INTO sales.dispatch_history(company_id,document_id,actor_id,actor_label,source,action,before_value,after_value,reason)
 VALUES(core.current_company(),doc,core.current_actor(),coalesce(label,'HTT team'),'MANAGEMENT','Expected dispatch date changed',s.expected_date::text,new_date::text,btrim(reason));
 END IF;
 RETURN sales.dispatch_view(doc);
END $$;
CREATE FUNCTION sales.followup_settings() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c sales.dispatch_settings;BEGIN
 PERFORM purchase.require_access('sales.followups.manage');SELECT * INTO c FROM sales.dispatch_settings WHERE company_id=core.current_company();
 RETURN jsonb_build_object('version',coalesce(c.version,1),'enabled',coalesce(c.enabled,false),'from',coalesce(c.mail_from,''),'notificationEmail',coalesce(c.notification_email,''),'portalOrigin',coalesce(c.portal_origin,''),'timezone',coalesce(c.timezone,'Australia/Melbourne'),'emailConfigured',coalesce(c.worker_ready_at>now()-interval '2 minutes',false),'activationRequiresWorker',true);
END $$;
CREATE FUNCTION sales.configure_followups(expected bigint,enabled boolean,sender text,notice text,origin text,zone text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c sales.dispatch_settings;BEGIN
 PERFORM purchase.require_access('sales.followups.manage');PERFORM 1 FROM core.companies WHERE id=core.current_company() FOR UPDATE;
 SELECT * INTO c FROM sales.dispatch_settings WHERE company_id=core.current_company() FOR UPDATE;
 IF coalesce(c.version,1) IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Follow-up settings changed' USING ERRCODE='HI409';END IF;
 IF enabled IS NULL OR sender IS NULL OR notice IS NULL OR origin IS NULL OR zone IS NULL OR NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=zone)
 OR(enabled AND(sender='' OR notice='' OR origin='')) OR(length(origin)>0 AND origin!~'^https://[^/@?# ]+(:[0-9]+)?/?$') THEN RAISE EXCEPTION 'Valid sender, notification recipient, HTTPS origin and timezone required' USING ERRCODE='HI422';END IF;
 INSERT INTO sales.dispatch_settings(company_id,version,enabled,mail_from,notification_email,portal_origin,timezone) VALUES(core.current_company(),coalesce(c.version,1)+1,enabled,sender,notice,rtrim(origin,'/'),zone)
 ON CONFLICT(company_id) DO UPDATE SET version=excluded.version,enabled=excluded.enabled,mail_from=excluded.mail_from,notification_email=excluded.notification_email,portal_origin=excluded.portal_origin,timezone=excluded.timezone;
 RETURN sales.followup_settings();
END $$;
-- Expired commercial holds are excluded without touching source quantities or journals.
DO $$ DECLARE body text;BEGIN body:=pg_get_functiondef('inventory.commercial_reservations()'::regprocedure);
 body:=replace(body,$find$q.status='SUBMITTED' AND qd.state='CONFIRMED'$find$,$replacement$q.status='SUBMITTED' AND qd.state='CONFIRMED' AND NOT EXISTS(SELECT 1 FROM sales.dispatch_schedules ds WHERE ds.company_id=q.company_id AND ds.document_id=q.id AND ds.expired_at IS NOT NULL)$replacement$);
 EXECUTE body;END $$;
REVOKE ALL ON FUNCTION sales.seed_followup_role(),sales.require_dispatch_access(uuid,boolean),sales.dispatch_source(uuid),sales.dispatch_view(uuid),sales.set_dispatch_schedule(uuid,bigint,date,boolean,boolean,text),sales.followup_settings(),sales.configure_followups(bigint,boolean,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.dispatch_view(uuid),sales.set_dispatch_schedule(uuid,bigint,date,boolean,boolean,text),sales.followup_settings(),sales.configure_followups(bigint,boolean,text,text,text,text) TO htt_app;
