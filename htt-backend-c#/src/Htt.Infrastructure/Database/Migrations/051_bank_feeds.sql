-- D02 gateway/sandbox protocol. Feeds import bank evidence, never journals or settlements.
CREATE SCHEMA bankfeeds;REVOKE ALL ON SCHEMA bankfeeds FROM PUBLIC;GRANT USAGE ON SCHEMA bankfeeds TO htt_app,htt_worker;
CREATE TABLE bankfeeds.connections(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),bank_account_id uuid NOT NULL,
 grant_reference text NOT NULL UNIQUE CHECK(length(grant_reference)BETWEEN 1 AND 200),account_fingerprint text NOT NULL CHECK(account_fingerprint~'^[0-9a-f]{64}$'),
 environment text NOT NULL DEFAULT 'SANDBOX' CHECK(environment='SANDBOX'),state text NOT NULL DEFAULT 'PENDING' CHECK(state IN('PENDING','ACTIVE','EXPIRED','REVOKING','REVOKED')),
 remote_account_id text,consent_expires_at timestamptz,cursor text NOT NULL DEFAULT '' CHECK(length(cursor)<=2000),start_date date NOT NULL,last_to_date date,last_closing numeric(20,2),
 auto_sync boolean NOT NULL DEFAULT false,next_sync_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes',last_success_at timestamptz,
 version bigint NOT NULL DEFAULT 1,created_by uuid NOT NULL REFERENCES identity.users(id),sync_actor uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,bank_account_id)REFERENCES accounting.bank_accounts(company_id,id),CHECK((last_to_date IS NULL)=(last_closing IS NULL))
);
CREATE UNIQUE INDEX one_current_feed ON bankfeeds.connections(company_id,bank_account_id)WHERE state<>'REVOKED';
CREATE TABLE bankfeeds.jobs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,connection_id uuid NOT NULL,kind text NOT NULL CHECK(kind IN('VERIFY','SYNC','REVOKE')),
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN('PENDING','PROCESSING','RETRY','FAILED','UNKNOWN','SUCCEEDED','CANCELLED')),
 cursor_snapshot text NOT NULL DEFAULT '',attempts int NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),lease_token uuid,lease_until timestamptz,
 available_at timestamptz NOT NULL DEFAULT now(),error_code text,statement_id uuid,created_by uuid NOT NULL REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz,
 UNIQUE(company_id,id),FOREIGN KEY(company_id,connection_id)REFERENCES bankfeeds.connections(company_id,id),FOREIGN KEY(company_id,statement_id)REFERENCES accounting.bank_statements(company_id,id)
);
CREATE UNIQUE INDEX one_feed_work ON bankfeeds.jobs(company_id,connection_id)WHERE state IN('PENDING','PROCESSING','RETRY','UNKNOWN');
CREATE INDEX feed_due ON bankfeeds.jobs(available_at,created_at)WHERE state IN('PENDING','PROCESSING','RETRY');
CREATE TABLE bankfeeds.batches(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,connection_id uuid NOT NULL,batch_id text NOT NULL CHECK(length(batch_id)BETWEEN 1 AND 200),
 payload_hash text NOT NULL,statement_id uuid NOT NULL,job_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id,connection_id,batch_id),UNIQUE(company_id,statement_id),FOREIGN KEY(company_id,connection_id)REFERENCES bankfeeds.connections(company_id,id),
 FOREIGN KEY(company_id,statement_id)REFERENCES accounting.bank_statements(company_id,id),FOREIGN KEY(company_id,job_id)REFERENCES bankfeeds.jobs(company_id,id)
);
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['connections','jobs','batches']LOOP EXECUTE format('ALTER TABLE bankfeeds.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE bankfeeds.%I FORCE ROW LEVEL SECURITY',t);EXECUTE format('CREATE POLICY company_scope ON bankfeeds.%I USING(company_id=core.current_company())WITH CHECK(company_id=core.current_company())',t);END LOOP;END$$;
CREATE TRIGGER connection_version BEFORE UPDATE ON bankfeeds.connections FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE TRIGGER immutable_batch BEFORE UPDATE OR DELETE ON bankfeeds.batches FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
INSERT INTO identity.permissions(code,description)VALUES('accounting.bank_feeds.read','Read feed and job status'),('accounting.bank_feeds.manage','Verify and revoke bank consent bindings'),('accounting.bank_feeds.sync','Request feed synchronization');
CREATE FUNCTION identity.seed_bank_feed_roles(c uuid)RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$INSERT INTO identity.role_permissions(company_id,role_id,permission_code)SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE')AND p.code LIKE 'accounting.bank_feeds.%'ON CONFLICT DO NOTHING$$;
DO $$DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_bank_feed_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END$$;
CREATE FUNCTION bankfeeds.require_access(p text,bank uuid)RETURNS void LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$BEGIN PERFORM crm.require_mobile('accounting.bank_feeds.read');PERFORM accounting.require_bank_reconciliation_access('accounting.bank_statements.read',bank);IF p<>'accounting.bank_feeds.read'THEN PERFORM crm.require_mobile(p);END IF;END$$;
CREATE FUNCTION bankfeeds.view_connection(p_id uuid)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE c bankfeeds.connections;BEGIN
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=core.current_company()AND id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Feed unavailable' USING ERRCODE='HT404';END IF;PERFORM bankfeeds.require_access('accounting.bank_feeds.read',c.bank_account_id);
 RETURN jsonb_build_object('id',c.id,'bankAccountId',c.bank_account_id,'environment',c.environment,'state',CASE WHEN c.state='ACTIVE'AND c.consent_expires_at<=now()THEN'EXPIRED'ELSE c.state END,'version',c.version,'liveConnection',false,'consentExpiresAt',c.consent_expires_at,'autoSync',c.auto_sync,'automaticBlocked',EXISTS(SELECT 1 FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id AND state IN('FAILED','UNKNOWN')),'startDate',c.start_date,'lastToDate',c.last_to_date,'lastSuccessAt',c.last_success_at,'nextSyncAt',c.next_sync_at,
 'jobs',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',j.id,'kind',j.kind,'state',j.state,'attempts',j.attempts,'errorCode',j.error_code,'statementId',j.statement_id,'createdAt',j.created_at,'finishedAt',j.finished_at)ORDER BY j.created_at DESC,j.id),'[]')FROM(SELECT*FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id ORDER BY created_at DESC,id LIMIT 25)j));
END$$;
CREATE FUNCTION bankfeeds.create_connection(p_bank uuid,p_grant text,p_start date,p_auto boolean)RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE x uuid:=gen_random_uuid();b accounting.bank_accounts;BEGIN
 PERFORM bankfeeds.require_access('accounting.bank_feeds.manage',p_bank);PERFORM crm.require_mobile('accounting.bank_statements.import');PERFORM accounting.lock_bank_reconciliation(p_bank);
 SELECT*INTO b FROM accounting.bank_accounts WHERE company_id=core.current_company()AND id=p_bank FOR SHARE;
 IF b.kind<>'BANK'OR NOT b.active THEN RAISE EXCEPTION 'Active BANK account required' USING ERRCODE='HR422';END IF;
 IF p_grant IS NULL OR p_grant!~'^[A-Za-z0-9_-]{8,200}$'OR p_start IS NULL OR p_start<date '2000-01-01'OR p_start>(SELECT(now()AT TIME ZONE timezone)::date FROM core.companies WHERE id=core.current_company())OR p_auto IS NULL THEN RAISE EXCEPTION 'Invalid grant reference or start date' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM accounting.bank_statements s JOIN accounting.bank_statement_controls ctl ON ctl.company_id=s.company_id AND ctl.id=s.id WHERE s.company_id=b.company_id AND s.bank_account_id=b.id AND ctl.state<>'VOID'AND s.to_date>=p_start)THEN RAISE EXCEPTION 'Feed must start after existing active statements' USING ERRCODE='HR409';END IF;
 INSERT INTO bankfeeds.connections(id,company_id,bank_account_id,grant_reference,account_fingerprint,start_date,auto_sync,created_by,sync_actor)VALUES(x,b.company_id,b.id,p_grant,encode(sha256(convert_to(b.bsb||':'||b.account_number,'UTF8')),'hex'),p_start,p_auto,core.current_actor(),core.current_actor());
 INSERT INTO bankfeeds.jobs(company_id,connection_id,kind,created_by)VALUES(b.company_id,x,'VERIFY',core.current_actor());
 RETURN x;
END$$;
CREATE FUNCTION bankfeeds.command(p_id uuid,p_version bigint,p_action text,p_job uuid DEFAULT NULL,p_ack boolean DEFAULT false,p_reason text DEFAULT '')RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE c bankfeeds.connections;j bankfeeds.jobs;newjob uuid;BEGIN
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=core.current_company()AND id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Feed unavailable' USING ERRCODE='HT404';END IF;
 PERFORM bankfeeds.require_access(CASE WHEN p_action='SYNC'THEN'accounting.bank_feeds.sync'ELSE'accounting.bank_feeds.manage'END,c.bank_account_id);PERFORM accounting.lock_bank_reconciliation(c.bank_account_id);
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=core.current_company()AND id=p_id FOR UPDATE;
 IF p_version IS DISTINCT FROM c.version THEN RAISE EXCEPTION 'Feed changed' USING ERRCODE='HR409';END IF;
 IF p_action NOT IN('SYNC','VERIFY','REVOKE','RETRY')THEN RAISE EXCEPTION 'Invalid feed action' USING ERRCODE='HR422';END IF;
 IF p_action='RETRY'THEN
  IF p_reason IS NULL OR length(btrim(p_reason))NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Retry reason required' USING ERRCODE='HR422';END IF;
  SELECT*INTO j FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id AND id=p_job FOR UPDATE;
  IF NOT FOUND OR j.state NOT IN('FAILED','UNKNOWN')OR(j.state='UNKNOWN'AND NOT coalesce(p_ack,false))OR(c.state='REVOKING'AND j.kind<>'REVOKE')OR c.state='REVOKED'OR(j.kind='SYNC'AND c.cursor<>j.cursor_snapshot)THEN RAISE EXCEPTION 'Job is not eligible for controlled retry' USING ERRCODE='HR409';END IF;
  IF j.kind<>'REVOKE'THEN PERFORM crm.require_mobile('accounting.bank_statements.import');END IF;
  UPDATE bankfeeds.jobs SET state='PENDING',attempts=0,available_at=now(),lease_token=NULL,lease_until=NULL,error_code=NULL,finished_at=NULL,created_by=core.current_actor()WHERE id=j.id;
  UPDATE bankfeeds.connections SET sync_actor=core.current_actor()WHERE id=c.id;RETURN j.id;
 END IF;
 IF p_action='REVOKE'THEN
  IF c.state IN('REVOKING','REVOKED')THEN RAISE EXCEPTION 'Revocation already requested' USING ERRCODE='HR409';END IF;
  UPDATE bankfeeds.jobs SET state='CANCELLED',lease_token=NULL,lease_until=NULL,error_code='consent_revoking',finished_at=now()WHERE company_id=c.company_id AND connection_id=c.id AND state IN('PENDING','RETRY','PROCESSING','UNKNOWN');
  UPDATE bankfeeds.connections SET state='REVOKING',auto_sync=false WHERE id=c.id;
 ELSE
  PERFORM crm.require_mobile('accounting.bank_statements.import');
  IF(p_action='SYNC'AND(c.state<>'ACTIVE'OR c.consent_expires_at<=now()))OR(p_action='VERIFY'AND c.state NOT IN('PENDING','ACTIVE','EXPIRED'))THEN RAISE EXCEPTION 'Feed consent unavailable' USING ERRCODE='HR409';END IF;
  IF EXISTS(SELECT 1 FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id AND state IN('PENDING','PROCESSING','RETRY','UNKNOWN'))THEN RAISE EXCEPTION 'Feed work already active' USING ERRCODE='HR409';END IF;
  UPDATE bankfeeds.connections SET sync_actor=core.current_actor()WHERE id=c.id;
 END IF;
 INSERT INTO bankfeeds.jobs(company_id,connection_id,kind,cursor_snapshot,created_by)VALUES(c.company_id,c.id,p_action,c.cursor,core.current_actor())RETURNING id INTO newjob;RETURN newjob;
END$$;
CREATE FUNCTION bankfeeds.claim()RETURNS TABLE(job_id uuid,lease uuid)LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE j bankfeeds.jobs;tok uuid;BEGIN
 -- Automatic reads only; any unresolved failed/unknown work requires operator review.
 INSERT INTO bankfeeds.jobs(company_id,connection_id,kind,cursor_snapshot,created_by)
 SELECT c.company_id,c.id,'SYNC',c.cursor,c.sync_actor FROM bankfeeds.connections c WHERE c.state='ACTIVE'AND c.consent_expires_at>now()AND c.auto_sync AND c.next_sync_at<=now()AND NOT EXISTS(SELECT 1 FROM bankfeeds.jobs x WHERE x.connection_id=c.id AND x.state IN('PENDING','PROCESSING','RETRY','UNKNOWN','FAILED'))ORDER BY c.next_sync_at,c.id LIMIT 50 ON CONFLICT DO NOTHING;
 UPDATE bankfeeds.jobs SET state=CASE WHEN kind='REVOKE'THEN'UNKNOWN'ELSE'FAILED'END,error_code='lease_expired',lease_token=NULL,lease_until=NULL,finished_at=now()WHERE state='PROCESSING'AND lease_until<=now()AND(kind='REVOKE'OR attempts>=5);
 SELECT*INTO j FROM bankfeeds.jobs WHERE((state IN('PENDING','RETRY')AND available_at<=now())OR(state='PROCESSING'AND lease_until<=now()AND kind<>'REVOKE'))AND attempts<5 ORDER BY available_at,created_at,id FOR UPDATE SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN;END IF;tok:=gen_random_uuid();UPDATE bankfeeds.jobs SET state='PROCESSING',attempts=attempts+1,lease_token=tok,lease_until=now()+interval '90 seconds'WHERE id=j.id;RETURN QUERY SELECT j.id,tok;
END$$;
CREATE FUNCTION bankfeeds.load(p_id uuid,p_lease uuid)RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE j bankfeeds.jobs;c bankfeeds.connections;b accounting.bank_accounts;BEGIN
 SELECT*INTO j FROM bankfeeds.jobs WHERE id=p_id AND state='PROCESSING'AND lease_token=p_lease AND lease_until>now();IF NOT FOUND THEN RAISE EXCEPTION 'Feed lease unavailable' USING ERRCODE='HR409';END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);PERFORM set_config('htt.actor_id',j.created_by::text,true);SELECT*INTO c FROM bankfeeds.connections WHERE company_id=j.company_id AND id=j.connection_id;
 IF j.kind='REVOKE'THEN IF c.state<>'REVOKING'THEN RAISE EXCEPTION 'Revocation unavailable' USING ERRCODE='HR409';END IF;
 ELSE
  PERFORM bankfeeds.require_access(CASE WHEN j.kind='VERIFY'THEN'accounting.bank_feeds.manage'ELSE'accounting.bank_feeds.sync'END,c.bank_account_id);PERFORM crm.require_mobile('accounting.bank_statements.import');
  SELECT*INTO b FROM accounting.bank_accounts WHERE company_id=c.company_id AND id=c.bank_account_id;
  IF NOT b.active OR b.kind<>'BANK'OR c.account_fingerprint<>encode(sha256(convert_to(b.bsb||':'||b.account_number,'UTF8')),'hex')OR c.state IN('REVOKING','REVOKED')OR(j.kind='SYNC'AND(c.state<>'ACTIVE'OR c.consent_expires_at<=now()OR c.cursor<>j.cursor_snapshot))THEN RAISE EXCEPTION 'Consent or bank binding changed' USING ERRCODE='HR409';END IF;
 END IF;
 RETURN jsonb_build_object('operationId',j.id,'kind',j.kind,'companyId',c.company_id,'connectionId',c.id,'bankAccountId',c.bank_account_id,'grantReference',c.grant_reference,'environment',c.environment,'accountFingerprint',c.account_fingerprint,'remoteAccountId',c.remote_account_id,'cursor',j.cursor_snapshot,'fromDate',coalesce(c.last_to_date+1,c.start_date));
END$$;
CREATE FUNCTION bankfeeds.finish(p_id uuid,p_lease uuid,p_state text,p_error text,p_result jsonb)RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE j bankfeeds.jobs;c bankfeeds.connections;prior bankfeeds.batches;body jsonb;items jsonb;payload bytea;hash text;sid uuid;batch text;expires timestamptz;remote text;dt date;result_state text:=p_state;err text:=p_error;BEGIN
 SELECT*INTO j FROM bankfeeds.jobs WHERE id=p_id;IF NOT FOUND THEN RETURN false;END IF;PERFORM set_config('htt.company_id',j.company_id::text,true);PERFORM set_config('htt.actor_id',j.created_by::text,true);
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=j.company_id AND id=j.connection_id;PERFORM accounting.lock_bank_reconciliation(c.bank_account_id);SELECT*INTO c FROM bankfeeds.connections WHERE id=c.id FOR UPDATE;
 SELECT*INTO j FROM bankfeeds.jobs WHERE id=p_id FOR UPDATE;IF j.state<>'PROCESSING'OR j.lease_token IS DISTINCT FROM p_lease OR j.lease_until<=now()THEN RETURN false;END IF;
 IF p_state NOT IN('SUCCEEDED','RETRY','FAILED','UNKNOWN')OR(p_state='UNKNOWN'AND j.kind<>'REVOKE')OR(p_state<>'SUCCEEDED'AND(p_error IS NULL OR p_error!~'^[a-z0-9_]{1,80}$'))THEN RAISE EXCEPTION 'Invalid feed completion' USING ERRCODE='HR422';END IF;
 IF p_state='SUCCEEDED'THEN
  -- All validation/import/cursor changes are one subtransaction. Malformed batches leave no partial import.
  BEGIN
   PERFORM bankfeeds.load(p_id,p_lease);
   IF p_result IS NULL OR p_result->>'environment'IS DISTINCT FROM'SANDBOX'THEN RAISE EXCEPTION 'Environment mismatch' USING ERRCODE='HR422';END IF;
   IF j.kind='REVOKE'THEN
    IF p_result->'revoked'IS DISTINCT FROM'true'::jsonb THEN RAISE EXCEPTION 'Unconfirmed revocation' USING ERRCODE='HR422';END IF;
    UPDATE bankfeeds.connections SET state='REVOKED',auto_sync=false WHERE id=c.id;
   ELSE
    IF p_result->>'companyId'IS DISTINCT FROM c.company_id::text OR p_result->>'bankAccountId'IS DISTINCT FROM c.bank_account_id::text THEN RAISE EXCEPTION 'Consent tenant binding mismatch' USING ERRCODE='HR422';END IF;
    IF p_result->>'consentStatus'IN('EXPIRED','REVOKED')THEN
     UPDATE bankfeeds.connections SET state='EXPIRED',auto_sync=false WHERE id=c.id;result_state:='FAILED';err:='consent_inactive';
    ELSE
     IF p_result->>'consentExpiresAt'IS NULL OR(p_result->>'consentExpiresAt')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$'THEN RAISE EXCEPTION 'Explicit consent expiry timezone required' USING ERRCODE='HR422';END IF;
     expires:=(p_result->>'consentExpiresAt')::timestamptz;remote:=p_result->>'remoteAccountId';
     IF p_result->>'consentStatus'IS DISTINCT FROM'ACTIVE'OR expires IS NULL OR NOT isfinite(expires)OR expires<=now()OR p_result->>'accountFingerprint'IS DISTINCT FROM c.account_fingerprint OR remote IS NULL OR length(remote)NOT BETWEEN 1 AND 200 OR(c.remote_account_id IS NOT NULL AND c.remote_account_id<>remote)THEN RAISE EXCEPTION 'Consent binding mismatch' USING ERRCODE='HR422';END IF;
     IF j.kind='SYNC'THEN
      IF p_result->>'nextCursor'IS NULL OR length(p_result->>'nextCursor')>2000 THEN RAISE EXCEPTION 'Cursor required' USING ERRCODE='HR422';END IF;
      body:=p_result->'statement';
      IF body IS NOT NULL AND body<>'null'::jsonb THEN
       batch:=p_result->>'batchId';items:=body->'lines';
       IF batch IS NULL OR length(batch)NOT BETWEEN 1 AND 200 OR p_result->>'nextCursor'=j.cursor_snapshot OR jsonb_typeof(items)IS DISTINCT FROM'array'OR jsonb_array_length(items)>5000 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x WHERE x->>'status'IS DISTINCT FROM'BOOKED'OR nullif(btrim(x->>'externalId'),'')IS NULL)THEN RAISE EXCEPTION 'Immutable booked batch and stable IDs required' USING ERRCODE='HR422';END IF;
       payload:=convert_to(body::text,'UTF8');hash:=encode(sha256(payload),'hex');
       SELECT*INTO prior FROM bankfeeds.batches WHERE company_id=c.company_id AND connection_id=c.id AND batch_id=batch;
       IF FOUND THEN
        IF prior.payload_hash<>hash OR EXISTS(SELECT 1 FROM accounting.bank_statement_controls WHERE company_id=c.company_id AND id=prior.statement_id AND state='VOID')THEN RAISE EXCEPTION 'Changed or voided prior feed batch' USING ERRCODE='HR409';END IF;sid:=prior.statement_id;
       ELSE
        dt:=(body->>'fromDate')::date;
        IF dt IS DISTINCT FROM coalesce(c.last_to_date+1,c.start_date)OR(body->>'toDate')::date IS NULL OR(body->>'toDate')::date<dt OR(c.last_closing IS NOT NULL AND(body->>'openingBalance')::numeric IS DISTINCT FROM c.last_closing)THEN RAISE EXCEPTION 'Feed dates or balance chain gap' USING ERRCODE='HR422';END IF;
        IF EXISTS(SELECT 1 FROM accounting.bank_statements s JOIN accounting.bank_statement_controls ctl ON ctl.company_id=s.company_id AND ctl.id=s.id WHERE s.company_id=c.company_id AND s.bank_account_id=c.bank_account_id AND ctl.state<>'VOID'AND daterange(s.from_date,s.to_date,'[]')&&daterange(dt,(body->>'toDate')::date,'[]'))THEN RAISE EXCEPTION 'Feed overlaps existing statements' USING ERRCODE='HR409';END IF;
        SELECT x.id INTO sid FROM accounting.import_bank_statement(c.bank_account_id,'FEED-'||c.id::text||'-'||left(encode(sha256(convert_to(batch,'UTF8')),'hex'),32),dt,(body->>'toDate')::date,(body->>'openingBalance')::numeric,(body->>'closingBalance')::numeric,'JSON',hash,items,payload)x;
        INSERT INTO bankfeeds.batches(company_id,connection_id,batch_id,payload_hash,statement_id,job_id)VALUES(c.company_id,c.id,batch,hash,sid,j.id);
        UPDATE bankfeeds.connections SET last_to_date=(body->>'toDate')::date,last_closing=(body->>'closingBalance')::numeric WHERE id=c.id;
       END IF;
      END IF;
      UPDATE bankfeeds.connections SET cursor=p_result->>'nextCursor',last_success_at=now(),next_sync_at=now()+interval '15 minutes'WHERE id=c.id;
     END IF;
     UPDATE bankfeeds.connections SET state='ACTIVE',remote_account_id=remote,consent_expires_at=expires WHERE id=c.id;
    END IF;
   END IF;
  EXCEPTION WHEN insufficient_privilege THEN result_state:='FAILED';err:='feed_access_changed';WHEN SQLSTATE 'HR409' THEN result_state:='FAILED';err:='feed_conflict';WHEN OTHERS THEN
   IF SQLSTATE IN('57014','55P03','40001','40P01')THEN RAISE;END IF;
   result_state:=CASE WHEN j.kind='REVOKE'THEN'UNKNOWN'ELSE'FAILED'END;err:='feed_invalid_result';
  END;
 END IF;
 IF result_state='RETRY'AND j.attempts>=5 THEN result_state:='FAILED';err:='feed_attempts_exhausted';END IF;
 UPDATE bankfeeds.jobs SET state=result_state,error_code=err,statement_id=CASE WHEN result_state='SUCCEEDED'THEN sid ELSE NULL END,lease_token=NULL,lease_until=NULL,available_at=now()+make_interval(secs=>least(900,15*power(2,j.attempts)::int)),finished_at=CASE WHEN result_state='RETRY'THEN NULL ELSE now()END WHERE id=j.id;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)VALUES(j.company_id,j.created_by,'accounting.bank_feed_completed','bank_feed_job',j.id,'bank-feed:'||j.id::text,jsonb_build_object('kind',j.kind,'state',result_state,'errorCode',err,'statementId',CASE WHEN result_state='SUCCEEDED'THEN sid END));
 RETURN true;
END$$;
CREATE FUNCTION bankfeeds.authorize_retry(p_id uuid,p_job uuid)RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE c bankfeeds.connections;k text;BEGIN
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=core.current_company()AND id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Feed unavailable' USING ERRCODE='HT404';END IF;PERFORM bankfeeds.require_access('accounting.bank_feeds.manage',c.bank_account_id);
 SELECT kind INTO k FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id AND id=p_job;IF NOT FOUND THEN RAISE EXCEPTION 'Feed job unavailable' USING ERRCODE='HT404';END IF;IF k<>'REVOKE'THEN PERFORM crm.require_mobile('accounting.bank_statements.import');END IF;
END$$;
CREATE FUNCTION bankfeeds.job_list(p_id uuid,p_size int,p_offset int)RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE c bankfeeds.connections;BEGIN
 SELECT*INTO c FROM bankfeeds.connections WHERE company_id=core.current_company()AND id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Feed unavailable' USING ERRCODE='HT404';END IF;PERFORM bankfeeds.require_access('accounting.bank_feeds.read',c.bank_account_id);
 IF p_size IS NULL OR p_offset IS NULL OR p_size NOT BETWEEN 1 AND 100 OR p_offset NOT BETWEEN 0 AND 10000000 THEN RAISE EXCEPTION 'Invalid job page' USING ERRCODE='HR422';END IF;
 RETURN(SELECT jsonb_build_object('totalCount',count(*),'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',j.id,'kind',j.kind,'state',j.state,'attempts',j.attempts,'errorCode',j.error_code,'statementId',j.statement_id,'createdAt',j.created_at,'finishedAt',j.finished_at,'availableAt',j.available_at)ORDER BY j.created_at DESC,j.id),'[]')FROM(SELECT*FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id ORDER BY created_at DESC,id LIMIT p_size OFFSET p_offset)j))FROM bankfeeds.jobs WHERE company_id=c.company_id AND connection_id=c.id);
END$$;
-- Prevent manual re-imports over feed-owned windows. Both paths take the existing bank lock.
CREATE FUNCTION bankfeeds.guard_statement()RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 PERFORM accounting.lock_bank_reconciliation(NEW.bank_account_id);
 IF EXISTS(SELECT 1 FROM bankfeeds.batches b JOIN accounting.bank_statements s ON s.company_id=b.company_id AND s.id=b.statement_id JOIN accounting.bank_statement_controls ctl ON ctl.company_id=s.company_id AND ctl.id=s.id WHERE s.company_id=NEW.company_id AND s.bank_account_id=NEW.bank_account_id AND ctl.state<>'VOID'AND daterange(s.from_date,s.to_date,'[]')&&daterange(NEW.from_date,NEW.to_date,'[]'))THEN RAISE EXCEPTION 'Manual import overlaps immutable feed evidence' USING ERRCODE='HR409';END IF;RETURN NEW;
END$$;
CREATE TRIGGER feed_window BEFORE INSERT ON accounting.bank_statements FOR EACH ROW EXECUTE FUNCTION bankfeeds.guard_statement();
-- Use an additional wrapper instead of rewriting the signed C09 implementation.
ALTER FUNCTION workbench.bank_hub(date,integer,integer)RENAME TO bank_hub_before_feeds;
CREATE FUNCTION workbench.bank_hub(p_asof date,p_size int,p_offset int)RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$DECLARE b jsonb;BEGIN
 b:=workbench.bank_hub_before_feeds(p_asof,p_size,p_offset);
 IF NOT crm.mobile_permission('accounting.bank_feeds.read')THEN RETURN b||jsonb_build_object('feeds',jsonb_build_object('status','FORBIDDEN','liveConnection',false));END IF;
 RETURN b||jsonb_build_object('feeds',jsonb_build_object('status',CASE WHEN EXISTS(SELECT 1 FROM bankfeeds.connections WHERE company_id=core.current_company()AND state<>'REVOKED')THEN'SANDBOX_ONLY'ELSE'NOT_CONFIGURED'END,'source','GATEWAY_SANDBOX_OR_MANUAL_IMPORT','liveConnection',false),
 'items',(SELECT coalesce(jsonb_agg(e||jsonb_build_object('feed',(SELECT bankfeeds.view_connection(c.id)FROM bankfeeds.connections c WHERE c.company_id=core.current_company()AND c.bank_account_id=(e->>'id')::uuid ORDER BY c.created_at DESC,c.id LIMIT 1))ORDER BY ord),'[]')FROM jsonb_array_elements(b->'items')WITH ORDINALITY x(e,ord)));
END$$;
REVOKE ALL ON ALL TABLES IN SCHEMA bankfeeds FROM PUBLIC,htt_app,htt_worker,htt_portal;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bankfeeds FROM PUBLIC;
REVOKE ALL ON FUNCTION identity.seed_bank_feed_roles(uuid),workbench.bank_hub_before_feeds(date,integer,integer),workbench.bank_hub(date,integer,integer)FROM PUBLIC;
GRANT SELECT(company_id,id,bank_account_id,created_at)ON bankfeeds.connections TO htt_app;
GRANT EXECUTE ON FUNCTION bankfeeds.authorize_retry(uuid,uuid),bankfeeds.job_list(uuid,integer,integer),bankfeeds.require_access(text,uuid),bankfeeds.view_connection(uuid),bankfeeds.create_connection(uuid,text,date,boolean),bankfeeds.command(uuid,bigint,text,uuid,boolean,text)TO htt_app;
GRANT EXECUTE ON FUNCTION bankfeeds.claim(),bankfeeds.load(uuid,uuid),bankfeeds.finish(uuid,uuid,text,text,jsonb)TO htt_worker;
