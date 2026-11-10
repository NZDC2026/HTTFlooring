-- D03 bounded local-calendar schedules produce review proposals, never automatic postings.
CREATE SCHEMA recurring;REVOKE ALL ON SCHEMA recurring FROM PUBLIC;GRANT USAGE ON SCHEMA recurring TO htt_app,htt_worker;
CREATE TABLE recurring.templates(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),name text NOT NULL CHECK(length(btrim(name))BETWEEN 1 AND 200),kind text NOT NULL CHECK(kind IN('INVOICE','EXPENSE_BILL','BANK_TRANSACTION')),frequency text NOT NULL CHECK(frequency IN('DAY','WEEK','MONTH')),every int NOT NULL CHECK(every BETWEEN 1 AND 120),starts_on date NOT NULL,ends_on date NOT NULL CHECK(ends_on>=starts_on),max_occurrences int NOT NULL CHECK(max_occurrences BETWEEN 1 AND 1200),next_index int NOT NULL DEFAULT 0 CHECK(next_index BETWEEN 0 AND 1200),revision int NOT NULL DEFAULT 1,state text NOT NULL DEFAULT 'PAUSED'CHECK(state IN('PAUSED','ACTIVE','COMPLETED','CANCELLED')),last_error text,version bigint NOT NULL DEFAULT 1,created_by uuid NOT NULL REFERENCES identity.users(id),schedule_actor uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id));
CREATE TABLE recurring.revisions(company_id uuid NOT NULL,template_id uuid NOT NULL,revision int NOT NULL,payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object'),created_by uuid NOT NULL REFERENCES identity.users(id),reason text NOT NULL CHECK(length(btrim(reason))BETWEEN 1 AND 1000),created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(company_id,template_id,revision),FOREIGN KEY(company_id,template_id)REFERENCES recurring.templates(company_id,id));
CREATE TABLE recurring.runs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,template_id uuid NOT NULL,revision int NOT NULL,occurrence_index int NOT NULL,due_on date NOT NULL,author_id uuid NOT NULL REFERENCES identity.users(id),state text NOT NULL DEFAULT 'DRAFT'CHECK(state IN('DRAFT','FAILED','APPROVED','REJECTED')),version bigint NOT NULL DEFAULT 1,document_id uuid,reviewed_by uuid REFERENCES identity.users(id),error_code text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(company_id,id),UNIQUE(company_id,template_id,occurrence_index),UNIQUE(company_id,document_id),FOREIGN KEY(company_id,template_id,revision)REFERENCES recurring.revisions(company_id,template_id,revision),FOREIGN KEY(company_id,document_id)REFERENCES platform.documents(company_id,id),CHECK((state='APPROVED')=(document_id IS NOT NULL)));
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['templates','revisions','runs']LOOP EXECUTE format('ALTER TABLE recurring.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE recurring.%I FORCE ROW LEVEL SECURITY',t);EXECUTE format('CREATE POLICY company_scope ON recurring.%I USING(company_id=core.current_company())WITH CHECK(company_id=core.current_company())',t);END LOOP;END$$;
CREATE TRIGGER revision_immutable BEFORE UPDATE OR DELETE ON recurring.revisions FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE TRIGGER template_version BEFORE UPDATE ON recurring.templates FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE TRIGGER run_version BEFORE UPDATE ON recurring.runs FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE INDEX recurring_due ON recurring.templates(state,starts_on,id)WHERE state='ACTIVE';
INSERT INTO identity.permissions(code,description)VALUES('recurring.read','Read authorized recurring templates and proposals'),('recurring.write','Maintain bounded recurring schedules'),('recurring.review','Independently review recurring proposals');
CREATE FUNCTION identity.seed_recurring_roles(c uuid)RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND((r.code IN('ADMIN','FINANCE')AND p.code LIKE'recurring.%')OR(r.code='OFFICE'AND p.code IN('recurring.read','recurring.write')))ON CONFLICT DO NOTHING$$;
DO $$DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_recurring_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END$$;
CREATE FUNCTION recurring.can_read(k text,p jsonb)RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE c uuid:=core.current_company();BEGIN
 IF NOT crm.mobile_permission('recurring.read')THEN RETURN false;END IF;
 IF k='INVOICE'THEN RETURN crm.mobile_permission('sales.invoices.read')AND EXISTS(SELECT 1 FROM sales.orders o WHERE o.company_id=c AND o.id=(p->>'orderId')::uuid AND platform.document_visible(o.id)AND crm.mobile_customer_visible(o.customer_id));
 ELSIF k='EXPENSE_BILL'THEN RETURN crm.mobile_permission('purchase.bills.read')AND crm.mobile_permission('purchase.cost.read')AND EXISTS(SELECT 1 FROM crm.suppliers WHERE company_id=c AND id=(p->>'supplierId')::uuid);
 ELSIF k='BANK_TRANSACTION'THEN RETURN crm.mobile_permission('accounting.bank_transactions.read')AND crm.mobile_permission('accounting.banks.read')AND crm.mobile_permission('accounting.ledger.read')AND crm.mobile_permission('accounting.gst.read')AND crm.mobile_permission('purchase.input_gst.read')AND EXISTS(SELECT 1 FROM accounting.bank_accounts WHERE company_id=c AND id=(p->>'bankAccountId')::uuid);
 END IF;RETURN false;
 EXCEPTION WHEN invalid_text_representation THEN RETURN false;
END$$;
CREATE FUNCTION recurring.validate_payload(k text,p jsonb)RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE x jsonb;BEGIN
 IF p IS NULL OR jsonb_typeof(p)<>'object'OR octet_length(p::text)>65536 OR NOT recurring.can_read(k,p)THEN RAISE EXCEPTION 'Recurring source unavailable' USING ERRCODE='42501';END IF;
 IF EXISTS(SELECT 1 FROM jsonb_object_keys(p)a WHERE a NOT IN('orderId','supplierId','bankAccountId','kind','lines'))OR jsonb_typeof(p->'lines')IS DISTINCT FROM'array'OR jsonb_array_length(p->'lines')NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Supply 1-50 bounded source lines' USING ERRCODE='HR422';END IF;
 FOR x IN SELECT*FROM jsonb_array_elements(p->'lines')LOOP
  IF jsonb_typeof(x)<>'object'THEN RAISE EXCEPTION 'Invalid recurring line' USING ERRCODE='HR422';END IF;
  IF k='INVOICE'THEN
   IF coalesce(x->>'quantity','')!~'^[0-9]{1,14}(\.[0-9]{1,6})?$'OR(x->>'quantity')::numeric IS NULL OR(x->>'quantity')::numeric<=0 OR(x->>'quantity')::numeric<>round((x->>'quantity')::numeric,6)OR NOT EXISTS(SELECT 1 FROM sales.order_lines WHERE company_id=core.current_company()AND order_id=(p->>'orderId')::uuid AND id=(x->>'orderLineId')::uuid)THEN RAISE EXCEPTION 'Invalid order line' USING ERRCODE='HR422';END IF;
  ELSE
   IF coalesce(x->>'net','')!~'^[0-9]{1,14}(\.[0-9]{1,2})?$'OR coalesce(x->>'tax','')!~'^[0-9]{1,14}(\.[0-9]{1,2})?$'OR x->>'net'IS NULL OR x->>'tax'IS NULL OR(x->>'net')::numeric<0 OR(x->>'tax')::numeric<0 OR(x->>'net')::numeric<>round((x->>'net')::numeric,2)OR(x->>'tax')::numeric<>round((x->>'tax')::numeric,2)OR length(btrim(coalesce(x->>'description','')))NOT BETWEEN 1 AND 2000 OR NOT EXISTS(SELECT 1 FROM accounting.tax_codes WHERE company_id=core.current_company()AND id=(x->>'taxCodeId')::uuid)THEN RAISE EXCEPTION 'Explicit valid net, tax and source account required' USING ERRCODE='HR422';END IF;
   IF NOT EXISTS(SELECT 1 FROM accounting.accounts WHERE company_id=core.current_company()AND id=(x->>CASE WHEN k='EXPENSE_BILL'THEN'expenseAccountId'ELSE'accountId'END)::uuid AND active AND(k<>'EXPENSE_BILL'OR kind='EXPENSE'))THEN RAISE EXCEPTION 'Account unavailable' USING ERRCODE='HR422';END IF;
  END IF;
 END LOOP;
 IF k='BANK_TRANSACTION'AND EXISTS(SELECT 1 FROM jsonb_array_elements(p->'lines')l WHERE(l->>'recoverableTax'IS NOT NULL AND(l->>'recoverableTax')!~'^[0-9]{1,14}(\.[0-9]{1,2})?$')OR(l->>'inputTaxedPercent'IS NOT NULL AND(l->>'inputTaxedPercent')!~'^[0-9]{1,3}(\.[0-9]{1,4})?$'))THEN RAISE EXCEPTION 'Invalid finite banking amounts' USING ERRCODE='HR422';END IF;
 IF k='BANK_TRANSACTION'AND(p->>'kind'IS NULL OR p->>'kind'NOT IN('RECEIVE','PAY'))THEN RAISE EXCEPTION 'Recurring bank kind required' USING ERRCODE='HR422';END IF;
 IF k='INVOICE'AND EXISTS(SELECT 1 FROM jsonb_array_elements(p->'lines')el(value) GROUP BY el.value->>'orderLineId' HAVING count(*)>1)THEN RAISE EXCEPTION 'Duplicate order lines' USING ERRCODE='HR422';END IF;
 EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN RAISE EXCEPTION 'Invalid recurring payload values' USING ERRCODE='HR422';
END$$;
CREATE FUNCTION recurring.due_date(start_day date,f text,n int,step int)RETURNS date LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$SELECT CASE f WHEN'MONTH'THEN(start_day+make_interval(months=>n*step))::date WHEN'WEEK'THEN start_day+n*step*7 ELSE start_day+n*step END$$;
CREATE FUNCTION recurring.create_template(p_name text,k text,f text,step int,first_day date,last_day date,maximum int,p jsonb)RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE x uuid:=gen_random_uuid();BEGIN
 PERFORM crm.require_mobile('recurring.write');PERFORM recurring.validate_payload(k,p);
 IF p_name IS NULL OR length(btrim(p_name))NOT BETWEEN 1 AND 200 OR f IS NULL OR f NOT IN('DAY','WEEK','MONTH')OR step IS NULL OR step NOT BETWEEN 1 AND 120 OR first_day IS NULL OR first_day<date '2000-01-01'OR last_day IS NULL OR last_day<first_day OR last_day>first_day+36525 OR maximum IS NULL OR maximum NOT BETWEEN 1 AND 1200 THEN RAISE EXCEPTION 'Invalid bounded recurring schedule' USING ERRCODE='HR422';END IF;
 INSERT INTO recurring.templates(id,company_id,name,kind,frequency,every,starts_on,ends_on,max_occurrences,created_by,schedule_actor)VALUES(x,core.current_company(),btrim(p_name),k,f,step,first_day,last_day,maximum,core.current_actor(),core.current_actor());
 INSERT INTO recurring.revisions(company_id,template_id,revision,payload,created_by,reason)VALUES(core.current_company(),x,1,p,core.current_actor(),'Initial version');RETURN x;
END$$;
CREATE FUNCTION recurring.template_view(p_id uuid)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE t recurring.templates;p jsonb;BEGIN
 SELECT*INTO t FROM recurring.templates WHERE company_id=core.current_company()AND id=p_id;SELECT payload INTO p FROM recurring.revisions WHERE company_id=t.company_id AND template_id=t.id AND revision=t.revision;
 IF NOT FOUND OR NOT recurring.can_read(t.kind,p)THEN RAISE EXCEPTION 'Recurring template unavailable' USING ERRCODE='HT404';END IF;
 RETURN jsonb_build_object('id',t.id,'name',t.name,'kind',t.kind,'frequency',t.frequency,'every',t.every,'startsOn',t.starts_on,'endsOn',t.ends_on,'maxOccurrences',t.max_occurrences,'nextIndex',t.next_index,'nextDueOn',CASE WHEN t.state NOT IN('COMPLETED','CANCELLED')THEN recurring.due_date(t.starts_on,t.frequency,t.next_index,t.every)END,'revision',t.revision,'version',t.version,'state',t.state,'lastError',t.last_error,'payload',p,'timezone',(SELECT timezone FROM core.companies WHERE id=t.company_id),'revisions',(SELECT jsonb_agg(jsonb_build_object('revision',revision,'createdAt',created_at,'reason',reason)ORDER BY revision)FROM recurring.revisions WHERE company_id=t.company_id AND template_id=t.id AND recurring.can_read(t.kind,payload)));
END$$;
CREATE FUNCTION recurring.change_template(p_id uuid,expected bigint,action text,p jsonb,p_reason text)RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE t recurring.templates;BEGIN
 PERFORM crm.require_mobile('recurring.write');PERFORM recurring.template_view(p_id);SELECT*INTO t FROM recurring.templates WHERE company_id=core.current_company()AND id=p_id FOR UPDATE;
 IF t.version IS DISTINCT FROM expected OR t.state IN('CANCELLED','COMPLETED')THEN RAISE EXCEPTION 'Recurring template changed or ended' USING ERRCODE='HR409';END IF;
 IF p_reason IS NULL OR length(btrim(p_reason))NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Reason required' USING ERRCODE='HR422';END IF;
 IF action='REVISE'THEN
  IF t.state<>'PAUSED'THEN RAISE EXCEPTION 'Pause before revising' USING ERRCODE='HR409';END IF;PERFORM recurring.validate_payload(t.kind,p);
  INSERT INTO recurring.revisions(company_id,template_id,revision,payload,created_by,reason)VALUES(t.company_id,t.id,t.revision+1,p,core.current_actor(),p_reason);UPDATE recurring.templates SET revision=revision+1,last_error=NULL WHERE id=t.id;
 ELSIF action IN('PAUSE','RESUME','CANCEL')THEN
  UPDATE recurring.templates SET state=CASE action WHEN'PAUSE'THEN'PAUSED'WHEN'RESUME'THEN'ACTIVE'ELSE'CANCELLED'END,schedule_actor=core.current_actor(),last_error=NULL WHERE id=t.id;
  IF action='CANCEL'THEN UPDATE recurring.runs SET state='REJECTED',error_code='template_cancelled',reviewed_by=core.current_actor()WHERE company_id=t.company_id AND template_id=t.id AND state IN('DRAFT','FAILED');END IF;
 ELSE RAISE EXCEPTION 'Invalid recurring action' USING ERRCODE='HR422';END IF;
END$$;
CREATE FUNCTION recurring.tick()RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE t recurring.templates;r recurring.revisions;today date;day date;made int:=0;n int;BEGIN
 SELECT x.*INTO t FROM recurring.templates x JOIN core.companies c ON c.id=x.company_id WHERE x.state='ACTIVE'AND recurring.due_date(x.starts_on,x.frequency,x.next_index,x.every)<=(now()AT TIME ZONE c.timezone)::date ORDER BY x.updated_at,x.id FOR UPDATE OF x SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN 0;END IF;PERFORM set_config('htt.company_id',t.company_id::text,true);PERFORM set_config('htt.actor_id',t.schedule_actor::text,true);SELECT(now()AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=t.company_id;SELECT*INTO r FROM recurring.revisions WHERE company_id=t.company_id AND template_id=t.id AND revision=t.revision;
 BEGIN PERFORM crm.require_mobile('recurring.write');PERFORM recurring.validate_payload(t.kind,r.payload);EXCEPTION WHEN OTHERS THEN
 IF SQLSTATE IN('57014','55P03','40001','40P01')THEN RAISE;END IF;
 UPDATE recurring.templates SET state='PAUSED',last_error='recurring_source_unavailable'WHERE id=t.id;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id)VALUES(t.company_id,t.schedule_actor,'recurring.scheduler_paused','recurring_template',t.id,'recurring-worker');RETURN 1;END;
 n:=t.next_index;
 WHILE made<25 LOOP
  day:=recurring.due_date(t.starts_on,t.frequency,n,t.every);EXIT WHEN n>=t.max_occurrences OR day>t.ends_on OR day>today;
  INSERT INTO recurring.runs(company_id,template_id,revision,occurrence_index,due_on,author_id)VALUES(t.company_id,t.id,r.revision,n,day,r.created_by);n:=n+1;made:=made+1;
 END LOOP;
 UPDATE recurring.templates SET next_index=n,state=CASE WHEN n>=t.max_occurrences OR recurring.due_date(t.starts_on,t.frequency,n,t.every)>t.ends_on THEN'COMPLETED'ELSE'ACTIVE'END WHERE id=t.id;
 IF made>0 THEN INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)VALUES(t.company_id,t.schedule_actor,'recurring.drafts_generated','recurring_template',t.id,'recurring-worker',jsonb_build_object('count',made,'revision',r.revision));END IF;
 RETURN made;
END$$;
CREATE FUNCTION recurring.run_view(p_id uuid)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE x recurring.runs;t recurring.templates;p jsonb;BEGIN
 SELECT*INTO x FROM recurring.runs WHERE company_id=core.current_company()AND id=p_id;SELECT*INTO t FROM recurring.templates WHERE company_id=x.company_id AND id=x.template_id;SELECT payload INTO p FROM recurring.revisions WHERE company_id=x.company_id AND template_id=x.template_id AND revision=x.revision;
 IF NOT FOUND OR NOT recurring.can_read(t.kind,p)THEN RAISE EXCEPTION 'Recurring proposal unavailable' USING ERRCODE='HT404';END IF;
 RETURN jsonb_build_object('id',x.id,'templateId',x.template_id,'revision',x.revision,'occurrenceIndex',x.occurrence_index,'dueOn',x.due_on,'authorId',x.author_id,'state',x.state,'version',x.version,'documentId',x.document_id,'reviewedBy',x.reviewed_by,'errorCode',x.error_code,'createdAt',x.created_at,'kind',t.kind,'payload',p,'readOnlyEconomicEffect',x.document_id IS NULL);
END$$;
CREATE FUNCTION recurring.review(p_id uuid,expected bigint,action text,evidence jsonb,p_reason text)RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE x recurring.runs;t recurring.templates;r recurring.revisions;doc uuid;err text;v text;BEGIN
 PERFORM crm.require_mobile('recurring.review');PERFORM recurring.run_view(p_id);SELECT*INTO x FROM recurring.runs WHERE company_id=core.current_company()AND id=p_id;SELECT*INTO t FROM recurring.templates WHERE company_id=x.company_id AND id=x.template_id FOR UPDATE;SELECT*INTO x FROM recurring.runs WHERE company_id=core.current_company()AND id=p_id FOR UPDATE;
 IF x.version IS DISTINCT FROM expected OR t.state='CANCELLED'THEN RAISE EXCEPTION 'Proposal changed or cancelled' USING ERRCODE='HR409';END IF;
 SELECT*INTO r FROM recurring.revisions WHERE company_id=x.company_id AND template_id=x.template_id AND revision=x.revision;
 IF core.current_actor()IN(x.author_id,t.created_by)THEN RAISE EXCEPTION 'Independent reviewer required' USING ERRCODE='42501';END IF;
 IF p_reason IS NULL OR length(btrim(p_reason))NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Review reason required' USING ERRCODE='HR422';END IF;
 IF action='RETRY'AND x.state='FAILED'THEN UPDATE recurring.runs SET state='DRAFT',error_code=NULL WHERE id=x.id;
 ELSIF action='REJECT'AND x.state IN('DRAFT','FAILED')THEN UPDATE recurring.runs SET state='REJECTED',reviewed_by=core.current_actor(),error_code=NULL WHERE id=x.id;
 ELSIF action='APPROVE'AND x.state='DRAFT'THEN
  -- Require original capabilities even when a source failure is recorded as a durable FAILED outcome.
  IF t.kind='INVOICE'THEN PERFORM crm.require_mobile('sales.invoices.write');
  ELSIF t.kind='EXPENSE_BILL'THEN PERFORM crm.require_mobile('purchase.expense_bills.post');
  ELSE PERFORM accounting.require_general_banking('accounting.bank_transactions.post');END IF;
  BEGIN
   PERFORM recurring.validate_payload(t.kind,r.payload);
   IF evidence IS NULL OR jsonb_typeof(evidence)<>'object'OR octet_length(evidence::text)>65536 THEN RAISE EXCEPTION 'Actual evidence required' USING ERRCODE='HR422';END IF;
   FOR v IN SELECT key FROM jsonb_each(evidence)WHERE key IN('occurredOn','invoiceDate','dueOn','postingDate','taxInvoiceHeldOn')LOOP IF evidence->>v IS NOT NULL AND(evidence->>v)!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$'THEN RAISE EXCEPTION 'Explicit finite ISO date required' USING ERRCODE='HR422';END IF;END LOOP;
   IF t.kind='INVOICE'THEN doc:=sales.post_invoice((r.payload->>'orderId')::uuid,(evidence->>'orderVersion')::bigint,r.payload->'lines',evidence->>'fulfilmentReference');
   ELSIF t.kind='EXPENSE_BILL'THEN doc:=purchase.post_expense_bill((r.payload->>'supplierId')::uuid,evidence->>'supplierInvoice',(evidence->>'invoiceDate')::date,(evidence->>'dueOn')::date,(evidence->>'postingDate')::date,evidence->>'taxInvoiceReference',(evidence->>'taxInvoiceHeldOn')::date,p_reason,r.payload->'lines');
   ELSE
    IF evidence->'settledConfirmed'IS DISTINCT FROM'true'::jsonb OR evidence->'noPriorPostingConfirmed'IS DISTINCT FROM'true'::jsonb THEN RAISE EXCEPTION 'Actual settlement and no prior posting must be confirmed' USING ERRCODE='HR422';END IF;
    doc:=accounting.post_general_banking(r.payload->>'kind',(r.payload->>'bankAccountId')::uuid,NULL,(evidence->>'occurredOn')::date,evidence->>'reference',p_reason,r.payload->'lines',NULL,NULL,true,evidence->>'taxInvoiceReference',(evidence->>'taxInvoiceHeldOn')::date);
   END IF;
   UPDATE recurring.runs SET state='APPROVED',document_id=doc,reviewed_by=core.current_actor(),error_code=NULL WHERE id=x.id;
   INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)VALUES(x.company_id,core.current_actor(),CASE t.kind WHEN'INVOICE'THEN'sales.invoice_posted'WHEN'EXPENSE_BILL'THEN'purchase.bill_posted'ELSE'accounting.general_bank_posted'END,CASE t.kind WHEN'INVOICE'THEN'sales_invoice'WHEN'EXPENSE_BILL'THEN'supplier_bill'ELSE'bank_transaction'END,doc,coalesce(current_setting('htt.request_id',true),'recurring-review'),jsonb_build_object('recurringRunId',x.id,'templateId',t.id));
   INSERT INTO platform.outbox_events(company_id,event_type,payload,created_by)VALUES(x.company_id,CASE t.kind WHEN'INVOICE'THEN'sales.invoice_posted'WHEN'EXPENSE_BILL'THEN'purchase.bill_posted'ELSE'accounting.general_bank_posted'END,jsonb_build_object('entityId',doc,'recurringRunId',x.id),core.current_actor());
  EXCEPTION WHEN OTHERS THEN
   IF SQLSTATE IN('57014','55P03','40001','40P01')THEN RAISE;END IF;
   UPDATE recurring.runs SET state='FAILED',reviewed_by=core.current_actor(),error_code='recurring_posting_rejected'WHERE id=x.id;
  END;
 ELSE RAISE EXCEPTION 'Proposal action unavailable' USING ERRCODE='HR409';END IF;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)VALUES(x.company_id,core.current_actor(),'recurring.reviewed','recurring_run',x.id,coalesce(current_setting('htt.request_id',true),'recurring-review'),jsonb_build_object('action',action,'reason',p_reason,'documentId',(SELECT document_id FROM recurring.runs WHERE company_id=x.company_id AND id=x.id)));
 RETURN recurring.run_view(x.id);
END$$;
CREATE FUNCTION recurring.list(p_kind text,p_id uuid,p_size int,p_offset int)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 PERFORM crm.require_mobile('recurring.read');IF p_size IS NULL OR p_offset IS NULL OR p_size NOT BETWEEN 1 AND 100 OR p_offset NOT BETWEEN 0 AND 10000000 THEN RAISE EXCEPTION 'Invalid recurring page' USING ERRCODE='HR422';END IF;
 IF p_kind='TEMPLATES'THEN RETURN(WITH visible AS MATERIALIZED(SELECT t.id,t.created_at FROM recurring.templates t JOIN recurring.revisions r ON r.company_id=t.company_id AND r.template_id=t.id AND r.revision=t.revision WHERE t.company_id=core.current_company()AND recurring.can_read(t.kind,r.payload))SELECT jsonb_build_object('totalCount',count(*),'items',(SELECT coalesce(jsonb_agg(recurring.template_view(id)ORDER BY created_at DESC,id),'[]')FROM(SELECT*FROM visible ORDER BY created_at DESC,id LIMIT p_size OFFSET p_offset)x))FROM visible);
 ELSIF p_kind='RUNS'THEN RETURN(WITH visible AS MATERIALIZED(SELECT x.id,x.created_at FROM recurring.runs x JOIN recurring.templates t ON t.company_id=x.company_id AND t.id=x.template_id JOIN recurring.revisions r ON r.company_id=x.company_id AND r.template_id=x.template_id AND r.revision=x.revision WHERE x.company_id=core.current_company()AND(p_id IS NULL OR x.template_id=p_id)AND recurring.can_read(t.kind,r.payload))SELECT jsonb_build_object('totalCount',count(*),'items',(SELECT coalesce(jsonb_agg(recurring.run_view(id)ORDER BY created_at DESC,id),'[]')FROM(SELECT*FROM visible ORDER BY created_at DESC,id LIMIT p_size OFFSET p_offset)x))FROM visible);END IF;RAISE EXCEPTION 'Invalid recurring list' USING ERRCODE='HR422';
END$$;
REVOKE ALL ON ALL TABLES IN SCHEMA recurring FROM PUBLIC,htt_app,htt_worker,htt_portal;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA recurring FROM PUBLIC;
REVOKE ALL ON FUNCTION identity.seed_recurring_roles(uuid)FROM PUBLIC;
GRANT EXECUTE ON FUNCTION recurring.validate_payload(text,jsonb),recurring.create_template(text,text,text,integer,date,date,integer,jsonb),recurring.template_view(uuid),recurring.change_template(uuid,bigint,text,jsonb,text),recurring.run_view(uuid),recurring.review(uuid,bigint,text,jsonb,text),recurring.list(text,uuid,integer,integer)TO htt_app;
GRANT EXECUTE ON FUNCTION recurring.tick()TO htt_worker;
