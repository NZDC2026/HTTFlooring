CREATE TABLE accounting.reminder_settings(company_id uuid PRIMARY KEY REFERENCES core.companies(id),version bigint NOT NULL DEFAULT 1,enabled boolean NOT NULL DEFAULT false,mail_from text NOT NULL DEFAULT '',worker_ready_at timestamptz);
CREATE TABLE accounting.reminder_batches(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),mode text NOT NULL CHECK(mode IN('INVOICE','STATEMENT')),invoice_ids uuid[] NOT NULL,from_date date NOT NULL,to_date date NOT NULL,source_hash text NOT NULL,created_by uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),queued_at timestamptz);
CREATE TABLE accounting.reminder_mails(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,batch_id uuid NOT NULL REFERENCES accounting.reminder_batches(id),recipient text NOT NULL,subject text NOT NULL,message text NOT NULL,pdf_snapshot jsonb NOT NULL,state text NOT NULL DEFAULT 'PREVIEW' CHECK(state IN('PREVIEW','QUEUED','PROCESSING','ACCEPTED','FAILED','UNKNOWN','SKIPPED')),lease uuid,lease_until timestamptz,last_error text,provider_id text,accepted_at timestamptz);
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['reminder_settings','reminder_batches','reminder_mails'] LOOP EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',t);EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);END LOOP;END $$;
CREATE FUNCTION accounting.reminder_rows(ids uuid[] DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE result jsonb;BEGIN
 PERFORM purchase.require_access('sales.invoices.read');PERFORM purchase.require_access('documents.email.send');
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',i.id,'customerId',i.customer_id,'number',d.number,'version',d.version,'customer',p.legal_name,'email',coalesce(contact.email,''),'dueDate',i.due_on,'invoiceDate',i.invoice_date,'amount',balances.amount::text,'days',i.due_on-(now() AT TIME ZONE c.timezone)::date,'status',CASE WHEN i.due_on IS NULL THEN 'Missing due date' WHEN i.due_on<(now() AT TIME ZONE c.timezone)::date THEN 'Overdue' WHEN i.due_on=(now() AT TIME ZONE c.timezone)::date THEN 'Due today' WHEN i.due_on<=(now() AT TIME ZONE c.timezone)::date+7 THEN 'Due soon' ELSE 'Later' END) ORDER BY i.id),'[]'::jsonb) INTO result
 FROM sales.invoices i JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id JOIN core.companies c ON c.id=i.company_id JOIN crm.customers cu ON cu.company_id=i.company_id AND cu.id=i.customer_id JOIN crm.parties p ON p.company_id=cu.company_id AND p.id=cu.party_id
 CROSS JOIN LATERAL(SELECT sum(outstanding_amount) AS amount FROM sales.invoice_line_balances WHERE company_id=i.company_id AND invoice_id=i.id) balances
 LEFT JOIN LATERAL(SELECT lower(btrim(email)) AS email FROM crm.contacts WHERE company_id=cu.company_id AND party_id=cu.party_id AND active AND is_accounting AND email IS NOT NULL ORDER BY id LIMIT 1) contact ON true
 WHERE i.company_id=core.current_company() AND (ids IS NULL OR i.id=ANY(ids)) AND d.state='POSTED' AND lower(d.number) NOT LIKE '%sample%' AND platform.document_visible(i.id) AND crm.mobile_customer_visible(i.customer_id) AND balances.amount>0;
 RETURN result;END $$;
CREATE FUNCTION accounting.reminder_invoice_pdf(doc uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE i sales.invoices;d platform.documents;lines jsonb;BEGIN
 PERFORM platform.require_document_access(doc,'PDF');PERFORM platform.require_document_access(doc,'EMAIL');
 SELECT * INTO i FROM sales.invoices WHERE company_id=core.current_company() AND id=doc;SELECT * INTO d FROM platform.documents WHERE company_id=core.current_company() AND id=doc;
 SELECT jsonb_agg(jsonb_build_object('snapshot',l.snapshot,'quantity',l.quantity::text,'unitPrice',l.snapshot->>'unitPrice','net',l.net::text,'tax',l.tax::text,'gross',l.gross::text,'taxRate',l.tax_rate::text) ORDER BY dl.line_no) INTO lines FROM sales.invoice_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=i.company_id AND l.invoice_id=i.id;
 RETURN jsonb_build_object('templateVersion',1,'filename',doc::text||'.pdf','title',CASE WHEN i.title='TAX_INVOICE' THEN 'TAX INVOICE' ELSE 'INVOICE' END,'number',d.number,'sourceVersion',d.version,'businessDate',d.business_date,'term',i.due_on,'termLabel','Due date','currency','AUD','issuer',i.issuer_snapshot,'party',i.customer_snapshot,'notes','','net',i.net::text,'tax',i.tax::text,'gross',i.gross::text,'lines',lines);
END $$;
CREATE FUNCTION accounting.reminder_fingerprint(kind text,ids uuid[],date_from date,date_to date) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE source jsonb;cust uuid;BEGIN
 source:=accounting.reminder_rows(ids);
 IF jsonb_array_length(source)<>cardinality(ids) THEN RAISE EXCEPTION 'Invoice no longer available; refresh preview' USING ERRCODE='HI409';END IF;
 IF kind='INVOICE' THEN FOR cust IN SELECT unnest(ids) LOOP source:=source||jsonb_build_array(accounting.reminder_invoice_pdf(cust));END LOOP;
 ELSIF kind='STATEMENT' THEN FOR cust IN SELECT DISTINCT (value->>'customerId')::uuid FROM jsonb_array_elements(source) ORDER BY 1 LOOP source:=source||jsonb_build_array(accounting.statement_snapshot(cust,date_from,date_to)-'snapshotAt');END LOOP;
 ELSE RAISE EXCEPTION 'Unknown reminder mode' USING ERRCODE='HI422';END IF;
 source:=source||jsonb_build_array((SELECT jsonb_build_object('from',mail_from,'version',version) FROM accounting.reminder_settings WHERE company_id=core.current_company()));
 RETURN encode(sha256(convert_to(source::text,'UTF8')),'hex');END $$;
CREATE FUNCTION accounting.prepare_reminders(kind text,ids uuid[],date_from date,date_to date) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE batch uuid:=gen_random_uuid();source jsonb;item jsonb;cust uuid;pdf jsonb;recipient text;subject text;body text;BEGIN
 IF ids IS NULL OR cardinality(ids) NOT BETWEEN 1 AND 100 OR array_position(ids,NULL) IS NOT NULL OR (SELECT count(DISTINCT value) FROM unnest(ids) value)<>cardinality(ids) THEN RAISE EXCEPTION 'Select 1..100 distinct invoice IDs' USING ERRCODE='HI422';END IF;
 PERFORM purchase.require_access('documents.pdf.request');
 INSERT INTO accounting.reminder_batches(id,company_id,mode,invoice_ids,from_date,to_date,source_hash,created_by) VALUES(batch,core.current_company(),kind,ids,date_from,date_to,accounting.reminder_fingerprint(kind,ids,date_from,date_to),core.current_actor());
 source:=accounting.reminder_rows(ids);
 FOR item IN SELECT value FROM jsonb_array_elements(source) LOOP
 recipient:=item->>'email';IF recipient!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Accounting recipient missing or invalid' USING ERRCODE='HI422';END IF;
 cust:=(item->>'customerId')::uuid;
 IF kind='STATEMENT' AND EXISTS(SELECT 1 FROM accounting.reminder_mails WHERE batch_id=batch AND pdf_snapshot->>'customerId'=cust::text) THEN CONTINUE;END IF;
 IF kind='INVOICE' THEN pdf:=accounting.reminder_invoice_pdf((item->>'id')::uuid);subject:='Payment reminder — '||(item->>'number');
 ELSE PERFORM purchase.require_access('accounting.statements.send');pdf:=accounting.statement_snapshot(cust,date_from,date_to)||jsonb_build_object('number','REMINDER-'||batch::text,'filename',cust::text||'-statement.pdf','customerId',cust);subject:='Customer statement — '||(item->>'customer');END IF;
 body:='Dear '||(item->>'customer')||E',\nPlease review the attached '||CASE WHEN kind='INVOICE' THEN 'invoice. Outstanding: AUD '||(item->>'amount')||'.' ELSE 'account statement.' END||E'\nIf payment has already been made, please provide the payment reference. Contact the HTT team with any questions.';
 INSERT INTO accounting.reminder_mails(company_id,batch_id,recipient,subject,message,pdf_snapshot) VALUES(core.current_company(),batch,recipient,subject,body,pdf);
 END LOOP;RETURN batch;
END $$;
CREATE FUNCTION accounting.queue_reminders(batch uuid,confirmed boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE b accounting.reminder_batches;cfg accounting.reminder_settings;BEGIN
 PERFORM purchase.require_access('documents.email.send');SELECT * INTO b FROM accounting.reminder_batches WHERE company_id=core.current_company() AND id=batch FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Preview unavailable' USING ERRCODE='HT404';END IF;
 IF confirmed IS DISTINCT FROM true THEN RAISE EXCEPTION 'Explicit confirmation required' USING ERRCODE='HI422';END IF;
 IF b.queued_at IS NOT NULL THEN RETURN jsonb_build_object('id',batch,'queued',true);END IF;
 SELECT * INTO cfg FROM accounting.reminder_settings WHERE company_id=b.company_id;
 IF NOT coalesce(cfg.enabled,false) OR cfg.worker_ready_at IS NULL OR cfg.worker_ready_at<now()-interval '2 minutes' OR cfg.mail_from='' THEN RAISE EXCEPTION 'Reminder worker and sender must be configured and enabled' USING ERRCODE='HI409';END IF;
 IF b.created_at<now()-interval '10 minutes' OR b.source_hash<>accounting.reminder_fingerprint(b.mode,b.invoice_ids,b.from_date,b.to_date) THEN RAISE EXCEPTION 'Invoice, customer, payment or credit changed; refresh preview' USING ERRCODE='HI409';END IF;
 UPDATE accounting.reminder_batches SET queued_at=now() WHERE id=batch;UPDATE accounting.reminder_mails SET state='QUEUED' WHERE batch_id=batch;RETURN jsonb_build_object('id',batch,'queued',true);
END $$;
CREATE FUNCTION accounting.reminder_batch_view(batch uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE b accounting.reminder_batches;items jsonb;BEGIN
 SELECT * INTO b FROM accounting.reminder_batches WHERE company_id=core.current_company() AND id=batch;
 IF NOT FOUND THEN RAISE EXCEPTION 'Batch unavailable' USING ERRCODE='HT404';END IF;
 PERFORM accounting.reminder_rows(b.invoice_ids);PERFORM purchase.require_access('documents.email.send');
 IF EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=b.company_id AND id=ANY(b.invoice_ids) AND NOT crm.mobile_customer_visible(customer_id)) THEN RAISE EXCEPTION 'Batch unavailable' USING ERRCODE='HT404';END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'to',recipient,'subject',subject,'status',state,'detail',last_error,'providerId',provider_id,'acceptedAt',accepted_at) ORDER BY id),'[]') INTO items FROM accounting.reminder_mails WHERE batch_id=batch;
 RETURN jsonb_build_object('id',b.id,'mode',b.mode,'ids',b.invoice_ids,'createdAt',b.created_at,'queuedAt',b.queued_at,'results',items);
END $$;
CREATE FUNCTION accounting.claim_reminder_mail() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE m accounting.reminder_mails;b accounting.reminder_batches;cfg accounting.reminder_settings;hash text;BEGIN
 UPDATE accounting.reminder_mails SET state='UNKNOWN',last_error='lease_expired',lease=NULL,lease_until=NULL WHERE state='PROCESSING' AND lease_until<now();
 FOR m IN SELECT x.* FROM accounting.reminder_mails x JOIN accounting.reminder_settings s ON s.company_id=x.company_id AND s.enabled WHERE x.state='QUEUED' ORDER BY x.id FOR UPDATE OF x SKIP LOCKED LIMIT 20 LOOP
 PERFORM set_config('htt.company_id',m.company_id::text,true);SELECT * INTO b FROM accounting.reminder_batches WHERE id=m.batch_id;PERFORM set_config('htt.actor_id',b.created_by::text,true);
 BEGIN hash:=accounting.reminder_fingerprint(b.mode,b.invoice_ids,b.from_date,b.to_date);EXCEPTION WHEN OTHERS THEN hash:=NULL;END;
 IF hash IS DISTINCT FROM b.source_hash THEN UPDATE accounting.reminder_mails SET state='SKIPPED',last_error='source_or_access_changed' WHERE id=m.id;CONTINUE;END IF;
 SELECT * INTO cfg FROM accounting.reminder_settings WHERE company_id=m.company_id;
 UPDATE accounting.reminder_mails SET state='PROCESSING',lease=gen_random_uuid(),lease_until=now()+interval '120 seconds' WHERE id=m.id RETURNING * INTO m;
 RETURN jsonb_build_object('id',m.id,'lease',m.lease,'pdf',m.pdf_snapshot,'payload',jsonb_build_object('from',cfg.mail_from,'to',jsonb_build_array(m.recipient),'subject',m.subject,'text',m.message));END LOOP;RETURN NULL;
END $$;
CREATE FUNCTION accounting.finish_reminder_mail(job uuid,fence uuid,outcome text,error_code text,provider text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 IF outcome NOT IN('ACCEPTED','FAILED','UNKNOWN') OR (outcome='ACCEPTED' AND nullif(provider,'') IS NULL) THEN RAISE EXCEPTION 'Invalid mail outcome' USING ERRCODE='HI422';END IF;
 UPDATE accounting.reminder_mails SET state=outcome,last_error=left(error_code,100),provider_id=left(provider,200),accepted_at=CASE WHEN outcome='ACCEPTED' THEN now() END,lease=NULL,lease_until=NULL WHERE id=job AND state='PROCESSING' AND lease=fence AND lease_until>now();RETURN FOUND;
END $$;
CREATE FUNCTION accounting.reminder_tick_ready() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$ UPDATE accounting.reminder_settings SET worker_ready_at=clock_timestamp() $$;
CREATE FUNCTION accounting.reminder_configuration(expected bigint DEFAULT NULL,enabled boolean DEFAULT NULL,sender text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE cfg accounting.reminder_settings;BEGIN
 PERFORM purchase.require_access('sales.followups.manage');IF expected IS NOT NULL THEN PERFORM 1 FROM core.companies WHERE id=core.current_company() FOR UPDATE;END IF;SELECT * INTO cfg FROM accounting.reminder_settings WHERE company_id=core.current_company() FOR UPDATE;
 IF expected IS NOT NULL THEN
 PERFORM 1 FROM core.companies WHERE id=core.current_company() FOR UPDATE;
 IF expected IS DISTINCT FROM coalesce(cfg.version,1) THEN RAISE EXCEPTION 'Configuration changed' USING ERRCODE='HI409';END IF;
 IF enabled IS NULL OR sender IS NULL OR (sender<>'' AND sender!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN RAISE EXCEPTION 'Valid sender and enabled flag required' USING ERRCODE='HI422';END IF;
 IF enabled AND (sender='' OR cfg.worker_ready_at IS NULL OR cfg.worker_ready_at<now()-interval '2 minutes') THEN RAISE EXCEPTION 'Configured reminder worker required before enabling mail' USING ERRCODE='HI409';END IF;
 INSERT INTO accounting.reminder_settings(company_id,version,enabled,mail_from) VALUES(core.current_company(),expected+1,enabled,sender) ON CONFLICT(company_id) DO UPDATE SET version=excluded.version,enabled=excluded.enabled,mail_from=excluded.mail_from RETURNING * INTO cfg;
 END IF;
 RETURN jsonb_build_object('version',coalesce(cfg.version,1),'enabled',coalesce(cfg.enabled,false),'from',coalesce(cfg.mail_from,''),'emailConfigured',coalesce(cfg.worker_ready_at>now()-interval '2 minutes',false));END $$;
REVOKE ALL ON FUNCTION accounting.reminder_rows(uuid[]),accounting.reminder_invoice_pdf(uuid),accounting.reminder_fingerprint(text,uuid[],date,date),accounting.prepare_reminders(text,uuid[],date,date),accounting.queue_reminders(uuid,boolean),accounting.reminder_batch_view(uuid),accounting.claim_reminder_mail(),accounting.finish_reminder_mail(uuid,uuid,text,text,text),accounting.reminder_tick_ready(),accounting.reminder_configuration(bigint,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accounting.reminder_rows(uuid[]),accounting.prepare_reminders(text,uuid[],date,date),accounting.queue_reminders(uuid,boolean),accounting.reminder_batch_view(uuid),accounting.reminder_configuration(bigint,boolean,text) TO htt_app;
GRANT EXECUTE ON FUNCTION accounting.claim_reminder_mail(),accounting.finish_reminder_mail(uuid,uuid,text,text,text),accounting.reminder_tick_ready() TO htt_worker;
