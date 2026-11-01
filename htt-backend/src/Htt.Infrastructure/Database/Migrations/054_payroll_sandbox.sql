-- D05: private AU payroll gateway sandbox. Never posts, pays or lodges with the ATO.
CREATE SCHEMA payroll;
REVOKE ALL ON SCHEMA payroll FROM PUBLIC;
GRANT USAGE ON SCHEMA payroll TO htt_app;
CREATE TABLE payroll.records(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),
 kind text NOT NULL CHECK(kind IN('EMPLOYEE','SETTINGS','TIMESHEET','RUN')),body jsonb NOT NULL,
 state text NOT NULL DEFAULT 'DRAFT',version bigint NOT NULL DEFAULT 1,
 created_by uuid NOT NULL REFERENCES identity.users(id),reviewed_by uuid REFERENCES identity.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id,id),CHECK(reviewed_by IS NULL OR reviewed_by<>created_by));
CREATE UNIQUE INDEX payroll_one_settings ON payroll.records(company_id)WHERE kind='SETTINGS';
CREATE TABLE payroll.history(company_id uuid NOT NULL,record_id uuid NOT NULL,version bigint NOT NULL,body jsonb NOT NULL,state text NOT NULL,actor_id uuid NOT NULL REFERENCES identity.users(id),recorded_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(company_id,record_id,version),FOREIGN KEY(company_id,record_id)REFERENCES payroll.records(company_id,id));
CREATE TABLE payroll.run_timesheets(company_id uuid NOT NULL,run_id uuid NOT NULL,timesheet_id uuid NOT NULL,PRIMARY KEY(company_id,timesheet_id),FOREIGN KEY(company_id,run_id)REFERENCES payroll.records(company_id,id),FOREIGN KEY(company_id,timesheet_id)REFERENCES payroll.records(company_id,id));
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['records','history','run_timesheets'] LOOP
 EXECUTE format('ALTER TABLE payroll.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE payroll.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON payroll.%I USING(company_id=core.current_company())WITH CHECK(company_id=core.current_company())',t);END LOOP;END$$;
CREATE TRIGGER payroll_version BEFORE UPDATE ON payroll.records FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE TRIGGER payroll_history_immutable BEFORE UPDATE OR DELETE ON payroll.history FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE TRIGGER payroll_timesheets_immutable BEFORE UPDATE OR DELETE ON payroll.run_timesheets FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
INSERT INTO identity.permissions(code,description)VALUES('payroll.read','Read confidential payroll sandbox'),('payroll.write','Maintain payroll sandbox inputs'),('payroll.review','Independently review payroll sandbox');
-- Payroll access is explicit: ordinary FINANCE, sales, warehouse and portal roles do not inherit it.
CREATE FUNCTION identity.seed_payroll_roles(c uuid)RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code='ADMIN' AND p.code IN('payroll.read','payroll.write','payroll.review')ON CONFLICT DO NOTHING$$;
DO $$DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_payroll_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END$$;
CREATE FUNCTION payroll.view(p_id uuid)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r payroll.records;BEGIN PERFORM crm.require_mobile('payroll.read');SELECT * INTO r FROM payroll.records WHERE company_id=core.current_company()AND id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payroll record not found' USING ERRCODE='HT404';END IF;
 RETURN to_jsonb(r)||jsonb_build_object('mode','SANDBOX','currency','AUD','legalPayroll',false,'paid',false,'atoLodged',false);END$$;
CREATE FUNCTION payroll.list(p_kind text,p_limit integer,p_offset integer)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN PERFORM crm.require_mobile('payroll.read');IF p_kind NOT IN('EMPLOYEE','SETTINGS','TIMESHEET','RUN')OR p_kind IS NULL OR p_limit NOT BETWEEN 1 AND 100 OR p_offset<0 THEN RAISE EXCEPTION 'Invalid payroll query' USING ERRCODE='HR422';END IF;
 RETURN jsonb_build_object('mode','SANDBOX','items',coalesce((SELECT jsonb_agg(payroll.view(id))FROM(SELECT id FROM payroll.records WHERE company_id=core.current_company()AND kind=p_kind ORDER BY created_at,id LIMIT p_limit OFFSET p_offset)x),'[]'::jsonb));END$$;
CREATE FUNCTION payroll.save(p_id uuid,p_kind text,p_version bigint,p_body jsonb)RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r payroll.records;e payroll.records;v_id uuid:=coalesce(p_id,gen_random_uuid());k text;BEGIN
 PERFORM crm.require_mobile('payroll.write');PERFORM crm.require_mobile('payroll.read');
 IF p_kind IS NULL OR p_kind NOT IN('EMPLOYEE','SETTINGS','TIMESHEET','RUN')OR p_body IS NULL OR jsonb_typeof(p_body)<>'object' OR octet_length(p_body::text)>32768 THEN RAISE EXCEPTION 'Invalid payroll input' USING ERRCODE='HR422';END IF;
 -- Serialize all payroll mutations per tenant, including revisions captured by pay runs.
 PERFORM pg_advisory_xact_lock(hashtextextended(core.current_company()::text||':payroll',0));
 IF p_id IS NOT NULL THEN SELECT * INTO r FROM payroll.records WHERE company_id=core.current_company()AND id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payroll record not found' USING ERRCODE='HT404';END IF;
 IF r.version<>p_version OR r.kind<>p_kind OR r.state<>'DRAFT' OR p_kind='RUN' THEN RAISE EXCEPTION 'Stale or locked payroll record' USING ERRCODE='HR409';END IF;END IF;
 FOR k IN SELECT jsonb_object_keys(p_body) LOOP
 IF k<>'timesheetIds' AND jsonb_typeof(p_body->k) IS DISTINCT FROM (CASE WHEN k IN('minutes','fixtureHourlyCents','fixturePaygCents','fixtureSuperCents')THEN 'number' ELSE 'string' END) THEN RAISE EXCEPTION 'Invalid payroll field type' USING ERRCODE='HR422';END IF;
 IF (p_body->>k)~'[[:cntrl:]]' THEN RAISE EXCEPTION 'Control characters are unsupported' USING ERRCODE='HR422';END IF;
 IF NOT(k=ANY(CASE p_kind WHEN 'EMPLOYEE' THEN ARRAY['code','name','employmentType','startDate','endDate','providerEmployeeRef'] WHEN 'SETTINGS' THEN ARRAY['provider','rulesVersion','fixtureHourlyCents','fixturePaygCents','fixtureSuperCents'] WHEN 'TIMESHEET' THEN ARRAY['employeeId','date','minutes','category'] ELSE ARRAY['from','to','payDate','timesheetIds'] END))THEN RAISE EXCEPTION 'Unsupported field; no TFN, bank, medical or tax secrets are accepted' USING ERRCODE='HR422';END IF;END LOOP;
 IF p_kind='EMPLOYEE' THEN
 IF length(btrim(coalesce(p_body->>'code','')))NOT BETWEEN 1 AND 40 OR length(btrim(coalesce(p_body->>'name','')))NOT BETWEEN 1 AND 120 OR coalesce(p_body->>'employmentType','')NOT IN('FULL_TIME','PART_TIME','CASUAL') OR coalesce(p_body->>'startDate','')!~'^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Invalid employee profile' USING ERRCODE='HR422';END IF;
 PERFORM (p_body->>'startDate')::date;IF p_body ? 'endDate' AND coalesce(p_body->>'endDate','')!~'^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Invalid end date' USING ERRCODE='HR422';END IF;IF p_body ? 'endDate' AND (p_body->>'endDate')::date<(p_body->>'startDate')::date THEN RAISE EXCEPTION 'Invalid employment dates' USING ERRCODE='HR422';END IF;
 IF length(coalesce(p_body->>'providerEmployeeRef',''))>120 THEN RAISE EXCEPTION 'Invalid opaque provider reference' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM payroll.records WHERE company_id=core.current_company()AND kind='EMPLOYEE'AND id<>v_id AND lower(btrim(body->>'code'))=lower(btrim(p_body->>'code')))THEN RAISE EXCEPTION 'Employee code already exists' USING ERRCODE='HR409';END IF;
 ELSIF p_kind='SETTINGS' THEN
 IF coalesce(p_body->>'provider','')<>'SANDBOX' OR length(btrim(coalesce(p_body->>'rulesVersion','')))NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'Only versioned SANDBOX fixture rules are supported' USING ERRCODE='HR422';END IF;
 FOREACH k IN ARRAY ARRAY['fixtureHourlyCents','fixturePaygCents','fixtureSuperCents']LOOP IF coalesce(p_body->>k,'')!~'^\d{1,8}$' THEN RAISE EXCEPTION 'Fixture amounts must be nonnegative integer AUD cents' USING ERRCODE='HR422';END IF;END LOOP;
 IF EXISTS(SELECT 1 FROM payroll.records WHERE company_id=core.current_company()AND kind='SETTINGS'AND id<>v_id)THEN RAISE EXCEPTION 'Settings already exist' USING ERRCODE='HR409';END IF;
 ELSIF p_kind='TIMESHEET' THEN
 SELECT * INTO e FROM payroll.records WHERE company_id=core.current_company()AND id=(p_body->>'employeeId')::uuid AND kind='EMPLOYEE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Employee not found' USING ERRCODE='HT404';END IF;
 IF coalesce(p_body->>'date','')!~'^\d{4}-\d{2}-\d{2}$' OR coalesce(p_body->>'minutes','')!~'^\d{1,4}$' OR (p_body->>'minutes')::int NOT BETWEEN 1 AND 1440 OR coalesce(p_body->>'category','')NOT IN('ORDINARY','OVERTIME','LEAVE')THEN RAISE EXCEPTION 'Invalid timesheet' USING ERRCODE='HR422';END IF;
 IF (SELECT coalesce(sum((body->>'minutes')::int),0)FROM payroll.records WHERE company_id=core.current_company()AND kind='TIMESHEET'AND id<>v_id AND (body->>'employeeId')::uuid=e.id AND body->>'date'=p_body->>'date')+(p_body->>'minutes')::int>1440 THEN RAISE EXCEPTION 'Employee day exceeds 1440 minutes' USING ERRCODE='HR422';END IF;
 IF (p_body->>'date')::date<(e.body->>'startDate')::date OR (e.body->>'endDate' IS NOT NULL AND (p_body->>'date')::date>(e.body->>'endDate')::date)THEN RAISE EXCEPTION 'Outside employment dates' USING ERRCODE='HR422';END IF;
 ELSE
 IF p_id IS NOT NULL OR coalesce(p_body->>'from','')!~'^\d{4}-\d{2}-\d{2}$'OR coalesce(p_body->>'to','')!~'^\d{4}-\d{2}-\d{2}$'OR coalesce(p_body->>'payDate','')!~'^\d{4}-\d{2}-\d{2}$'OR(p_body->>'to')::date<(p_body->>'from')::date OR (p_body->>'to')::date-(p_body->>'from')::date>31 OR jsonb_typeof(p_body->'timesheetIds')IS DISTINCT FROM'array' OR jsonb_array_length(p_body->'timesheetIds')NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid sandbox pay run' USING ERRCODE='HR422';END IF;
 FOR k IN SELECT jsonb_array_elements_text(p_body->'timesheetIds') LOOP PERFORM k::uuid;IF k IS NULL THEN RAISE EXCEPTION 'Invalid timesheet reference' USING ERRCODE='HR422';END IF;END LOOP;
 PERFORM (p_body->>'payDate')::date;IF (p_body->>'payDate')::date<(p_body->>'to')::date THEN RAISE EXCEPTION 'Pay date precedes period end' USING ERRCODE='HR422';END IF;
 IF (SELECT count(DISTINCT value)FROM jsonb_array_elements_text(p_body->'timesheetIds'))<>jsonb_array_length(p_body->'timesheetIds')THEN RAISE EXCEPTION 'Duplicate timesheets' USING ERRCODE='HR422';END IF;
 END IF;
 IF p_id IS NULL THEN INSERT INTO payroll.records(id,company_id,kind,body,created_by)VALUES(v_id,core.current_company(),p_kind,p_body,core.current_actor());ELSE UPDATE payroll.records SET body=p_body WHERE id=v_id AND company_id=core.current_company();END IF;
 INSERT INTO payroll.history SELECT company_id,id,version,body,state,core.current_actor(),now()FROM payroll.records WHERE company_id=core.current_company()AND id=v_id;
 RETURN v_id;
 EXCEPTION WHEN invalid_text_representation OR datetime_field_overflow OR invalid_datetime_format OR numeric_value_out_of_range THEN RAISE EXCEPTION 'Invalid payroll value' USING ERRCODE='HR422';END$$;
CREATE FUNCTION payroll.transition(p_id uuid,p_version bigint,p_action text)RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r payroll.records;t payroll.records;cfg payroll.records;item jsonb;items jsonb:='[]';gross bigint;payg bigint;super_amount bigint;BEGIN
 PERFORM crm.require_mobile('payroll.read');PERFORM crm.require_mobile(CASE WHEN p_action='APPROVE' THEN 'payroll.review' ELSE 'payroll.write' END);
 PERFORM pg_advisory_xact_lock(hashtextextended(core.current_company()::text||':payroll',0));
 SELECT * INTO r FROM payroll.records WHERE company_id=core.current_company()AND id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payroll record not found' USING ERRCODE='HT404';END IF;
 IF r.version<>p_version THEN RAISE EXCEPTION 'Stale payroll version' USING ERRCODE='HR409';END IF;
 IF p_action='SUBMIT'AND r.kind='TIMESHEET'AND r.state='DRAFT' THEN UPDATE payroll.records SET state='SUBMITTED'WHERE id=p_id;
 ELSIF p_action='APPROVE'AND r.state IN('SUBMITTED','CALCULATED')AND r.kind IN('TIMESHEET','RUN')THEN
 IF r.created_by=core.current_actor()THEN RAISE EXCEPTION 'Independent reviewer required' USING ERRCODE='42501';END IF;
 UPDATE payroll.records SET state='APPROVED',reviewed_by=core.current_actor()WHERE id=p_id;
 ELSIF p_action='CALCULATE'AND r.kind='RUN'AND r.state='DRAFT' THEN
 SELECT * INTO cfg FROM payroll.records WHERE company_id=core.current_company()AND kind='SETTINGS';IF NOT FOUND THEN RAISE EXCEPTION 'Configure sandbox first' USING ERRCODE='HR422';END IF;
 -- Fixture only: ordinary hours, explicit flat test amounts; never an Award/PAYG/super engine.
 FOR item IN SELECT value FROM jsonb_array_elements(r.body->'timesheetIds') LOOP
 SELECT * INTO t FROM payroll.records WHERE company_id=core.current_company()AND id=(item#>>'{}')::uuid AND kind='TIMESHEET'AND state='APPROVED';
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved timesheet not found' USING ERRCODE='HR422';END IF;
 IF t.body->>'category'<>'ORDINARY'OR(t.body->>'date')::date NOT BETWEEN(r.body->>'from')::date AND(r.body->>'to')::date THEN RAISE EXCEPTION 'Fixture supports ordinary timesheets in period only' USING ERRCODE='HR422';END IF;
 INSERT INTO payroll.run_timesheets VALUES(core.current_company(),p_id,t.id);
 gross:=round((t.body->>'minutes')::numeric*(cfg.body->>'fixtureHourlyCents')::bigint/60);payg:=(cfg.body->>'fixturePaygCents')::bigint;super_amount:=(cfg.body->>'fixtureSuperCents')::bigint;
 IF payg>gross THEN RAISE EXCEPTION 'Fixture withholding exceeds gross' USING ERRCODE='HR422';END IF;
 items:=items||jsonb_build_array(jsonb_build_object('timesheetId',t.id,'timesheetVersion',t.version,'employeeId',t.body->>'employeeId','employeeSnapshot',(SELECT body FROM payroll.records WHERE company_id=core.current_company()AND id=(t.body->>'employeeId')::uuid),'grossCents',gross,'paygCents',payg,'netCents',gross-payg,'superCents',super_amount));END LOOP;
 UPDATE payroll.records SET state='CALCULATED',body=body||jsonb_build_object('gatewayContract','htt.payroll.sandbox.v1','settingsVersion',cfg.version,'rulesSnapshot',cfg.body,'results',items)WHERE id=p_id;
 ELSIF p_action='LOCK'AND r.kind='RUN'AND r.state='APPROVED'THEN UPDATE payroll.records SET state='LOCKED'WHERE id=p_id;
 ELSIF p_action='STP_PREVIEW'AND r.kind='RUN'AND r.state='LOCKED'THEN
 UPDATE payroll.records SET state='SANDBOX_ACKNOWLEDGED',body=body||jsonb_build_object('stp',jsonb_build_object('contract','htt.stp.sandbox.v1','correlationId',p_id,'status','SANDBOX_ACKNOWLEDGED','atoLodged',false))WHERE id=p_id;
 ELSE RAISE EXCEPTION 'Unsupported action or locked payroll state' USING ERRCODE='HR409';END IF;
 INSERT INTO payroll.history SELECT company_id,id,version,body,state,core.current_actor(),now()FROM payroll.records WHERE company_id=core.current_company()AND id=p_id;
 RETURN payroll.view(p_id);
 EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'Timesheet already belongs to a sandbox run' USING ERRCODE='HR409';END$$;
REVOKE ALL ON ALL TABLES IN SCHEMA payroll FROM PUBLIC,htt_app,htt_worker,htt_portal;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA payroll FROM PUBLIC,htt_app,htt_worker,htt_portal;
GRANT EXECUTE ON FUNCTION payroll.view(uuid),payroll.list(text,integer,integer),payroll.save(uuid,text,bigint,jsonb),payroll.transition(uuid,bigint,text) TO htt_app;
CREATE FUNCTION payroll.report(p_from date,p_to date)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN PERFORM crm.require_mobile('payroll.read');
 IF p_from IS NULL OR p_to IS NULL OR NOT isfinite(p_from)OR NOT isfinite(p_to)OR p_to<p_from OR p_to-p_from>366 THEN RAISE EXCEPTION 'Invalid payroll reporting period' USING ERRCODE='HR422';END IF;
 RETURN(SELECT jsonb_build_object('mode','SANDBOX','currency','AUD','atoLodged',false,'ledgerPosted',false,'from',p_from,'to',p_to,'runCount',count(DISTINCT r.id),'grossCents',coalesce(sum((x->>'grossCents')::bigint),0),'paygCents',coalesce(sum((x->>'paygCents')::bigint),0),'netCents',coalesce(sum((x->>'netCents')::bigint),0),'superCents',coalesce(sum((x->>'superCents')::bigint),0),'balanceDifferenceCents',coalesce(sum((x->>'grossCents')::bigint-(x->>'paygCents')::bigint-(x->>'netCents')::bigint),0))FROM payroll.records r CROSS JOIN LATERAL jsonb_array_elements(r.body->'results')x WHERE r.company_id=core.current_company()AND r.kind='RUN'AND r.state IN('LOCKED','SANDBOX_ACKNOWLEDGED')AND(r.body->>'payDate')::date BETWEEN p_from AND p_to);
END$$;
REVOKE ALL ON FUNCTION payroll.report(date,date) FROM PUBLIC,htt_worker,htt_portal;
GRANT EXECUTE ON FUNCTION payroll.report(date,date)TO htt_app;
