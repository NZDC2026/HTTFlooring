-- Private, bounded database object storage and a durable document-work outbox.
CREATE TABLE platform.file_contents(
 company_id uuid NOT NULL,file_id uuid PRIMARY KEY,body bytea NOT NULL CHECK(octet_length(body) BETWEEN 1 AND 10485760),
 FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id)
);
CREATE TABLE platform.file_assets(
 company_id uuid NOT NULL,file_id uuid PRIMARY KEY,document_id uuid NOT NULL,source_version bigint NOT NULL CHECK(source_version>0),
 filename text NOT NULL CHECK(length(filename) BETWEEN 1 AND 180 AND position('/' IN filename)=0 AND position(chr(92) IN filename)=0 AND filename!~'[[:cntrl:]]'),
 kind text NOT NULL CHECK(kind IN('PDF','ATTACHMENT')),revoked_at timestamptz,revoked_by uuid REFERENCES identity.users(id),
 UNIQUE(company_id,file_id),FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id)
);
CREATE TABLE platform.document_jobs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),document_id uuid NOT NULL,
 source_version bigint NOT NULL CHECK(source_version>0),kind text NOT NULL CHECK(kind IN('PDF','EMAIL','SCAN')),payload jsonb NOT NULL,
 state text NOT NULL DEFAULT 'QUEUED' CHECK(state IN('QUEUED','PROCESSING','RETRY','SUCCEEDED','FAILED','UNKNOWN')),
 attempts int NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),total_attempts int NOT NULL DEFAULT 0,
 available_at timestamptz NOT NULL DEFAULT now(),lease_token uuid,lease_until timestamptz,first_started_at timestamptz,
 output_file_id uuid,provider_id text,last_error text,completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(),version bigint NOT NULL DEFAULT 1,
 UNIQUE(company_id,id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id),
 FOREIGN KEY(company_id,output_file_id) REFERENCES platform.files(company_id,id)
);
CREATE UNIQUE INDEX document_pdf_once ON platform.document_jobs(company_id,document_id,source_version) WHERE kind='PDF';
CREATE UNIQUE INDEX document_scan_once ON platform.document_jobs(company_id,(payload->>'fileId')) WHERE kind='SCAN';
CREATE INDEX document_work_queue ON platform.document_jobs(available_at,created_at,id) WHERE state IN('QUEUED','RETRY','PROCESSING');
CREATE INDEX ON platform.document_jobs(company_id,document_id,created_at);
CREATE TABLE platform.document_job_attempts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL,job_id uuid NOT NULL,attempt int NOT NULL,
 lease_token uuid NOT NULL,started_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz,result text,error_code text,
 UNIQUE(company_id,job_id,attempt),FOREIGN KEY(company_id,job_id) REFERENCES platform.document_jobs(company_id,id)
);
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['file_contents','file_assets','document_jobs','document_job_attempts'] LOOP
 EXECUTE format('ALTER TABLE platform.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE platform.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON platform.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);
 END LOOP;END $$;
-- Only the queue claim definer may enumerate pending work across companies, as with existing outbox.
ALTER TABLE platform.document_jobs NO FORCE ROW LEVEL SECURITY;
CREATE TRIGGER file_body_immutable BEFORE UPDATE OR DELETE ON platform.file_contents FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE TRIGGER document_job_version BEFORE UPDATE ON platform.document_jobs FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE FUNCTION platform.guard_document_job() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF (NEW.company_id,NEW.document_id,NEW.source_version,NEW.kind,NEW.payload,NEW.created_by) IS DISTINCT FROM
    (OLD.company_id,OLD.document_id,OLD.source_version,OLD.kind,OLD.payload,OLD.created_by) THEN
  RAISE EXCEPTION 'Document work payload is immutable' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER document_job_payload BEFORE UPDATE ON platform.document_jobs FOR EACH ROW EXECUTE FUNCTION platform.guard_document_job();
CREATE FUNCTION platform.validate_private_file() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid;f uuid;BEGIN c:=NEW.company_id;f:=coalesce(to_jsonb(NEW)->>'file_id',to_jsonb(NEW)->>'id')::uuid;
 PERFORM set_config('htt.company_id',c::text,true);
 IF EXISTS(SELECT 1 FROM platform.file_assets WHERE company_id=c AND file_id=f) AND NOT EXISTS(
  SELECT 1 FROM platform.files p JOIN platform.file_contents b ON b.company_id=p.company_id AND b.file_id=p.id
  JOIN platform.file_assets a ON a.company_id=p.company_id AND a.file_id=p.id
  JOIN platform.file_links l ON l.company_id=p.company_id AND l.file_id=p.id AND l.document_id=a.document_id
  WHERE p.company_id=c AND p.id=f AND p.size_bytes=octet_length(b.body) AND p.sha256=encode(sha256(b.body),'hex')) THEN
 RAISE EXCEPTION 'Private file bytes, checksum, size and document link must agree' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER private_file_consistency AFTER INSERT OR UPDATE ON platform.files DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION platform.validate_private_file();
CREATE CONSTRAINT TRIGGER private_file_consistency AFTER INSERT ON platform.file_contents DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION platform.validate_private_file();
CREATE CONSTRAINT TRIGGER private_file_consistency AFTER INSERT ON platform.file_assets DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION platform.validate_private_file();

INSERT INTO identity.permissions(code,description) VALUES
 ('documents.files.read','Read authorized document file metadata and verified bytes'),
 ('documents.attachments.write','Upload and revoke own authorized document attachments'),
 ('documents.files.manage','Revoke attachments uploaded by other staff'),
 ('documents.pdf.request','Request immutable-version document PDF generation'),
 ('documents.email.send','Queue document emails'),('documents.jobs.retry','Retry failed document work'),
 ('sales.quotes.send','Send authorized quotations'),('sales.invoices.send','Send authorized invoices'),('purchase.orders.send','Send purchase orders with cost access');
CREATE FUNCTION identity.seed_document_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND (
  (r.code IN('ADMIN','OFFICE','FINANCE','PROCUREMENT','SALES') AND p.code IN('documents.files.read','documents.attachments.write','documents.pdf.request','documents.email.send','documents.jobs.retry')) OR
  (r.code IN('ADMIN','OFFICE','FINANCE','PROCUREMENT') AND p.code='documents.files.manage') OR
  (r.code IN('ADMIN','OFFICE','FINANCE','SALES') AND p.code='sales.quotes.send') OR
  (r.code IN('ADMIN','OFFICE','FINANCE') AND p.code='sales.invoices.send') OR
  (r.code IN('ADMIN','FINANCE','PROCUREMENT') AND p.code='purchase.orders.send')) ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP
 PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_document_roles(c);
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;

CREATE FUNCTION platform.require_document_access(doc uuid,action text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;customer uuid;required text;BEGIN
 required:=CASE action WHEN 'READ' THEN 'documents.files.read' WHEN 'PDF' THEN 'documents.pdf.request' WHEN 'EMAIL' THEN 'documents.email.send' WHEN 'UPLOAD' THEN 'documents.attachments.write' ELSE NULL END;
 IF required IS NULL THEN RAISE EXCEPTION 'Invalid document action' USING ERRCODE='HD422';END IF;
 PERFORM purchase.require_access(required);
 SELECT document_type INTO typ FROM platform.documents WHERE company_id=core.current_company() AND id=doc AND deleted_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
 IF typ='QUOTE' THEN
  SELECT customer_id INTO customer FROM sales.quotes WHERE company_id=core.current_company() AND id=doc;
  PERFORM sales.require_customer_access('sales.quotes.read',customer);
  IF action='EMAIL' THEN PERFORM purchase.require_access('sales.quotes.send');END IF;
 ELSIF typ='INVOICE' THEN
  SELECT customer_id INTO customer FROM sales.invoices WHERE company_id=core.current_company() AND id=doc;
  PERFORM sales.require_customer_access('sales.invoices.read',customer);
  IF action='EMAIL' THEN PERFORM purchase.require_access('sales.invoices.send');END IF;
 ELSIF typ='PURCHASE_ORDER' THEN
  PERFORM purchase.require_access('purchase.orders.read');PERFORM purchase.require_access('purchase.cost.read');
  IF action='EMAIL' THEN PERFORM purchase.require_access('purchase.orders.send');END IF;
 ELSE RAISE EXCEPTION 'This document type has no file/output workflow yet' USING ERRCODE='HD422';END IF;
 RETURN typ;
END $$;
CREATE FUNCTION platform.read_private_file(fid uuid) RETURNS bytea LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE asset platform.file_assets;result bytea;BEGIN
 SELECT * INTO asset FROM platform.file_assets WHERE company_id=core.current_company() AND file_id=fid AND revoked_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'File unavailable' USING ERRCODE='HT404';END IF;
 PERFORM platform.require_document_access(asset.document_id,'READ');
 SELECT b.body INTO result FROM platform.file_contents b JOIN platform.files f ON f.company_id=b.company_id AND f.id=b.file_id
 WHERE b.company_id=core.current_company() AND b.file_id=fid AND f.state='VERIFIED' AND f.sha256=encode(sha256(b.body),'hex');
 IF result IS NULL THEN RAISE EXCEPTION 'File is not verified or has failed integrity checks' USING ERRCODE='HD409';END IF;RETURN result;
END $$;
CREATE FUNCTION platform.retry_document_job(jid uuid,expected bigint,reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j platform.document_jobs;BEGIN
 SELECT * INTO j FROM platform.document_jobs WHERE company_id=core.current_company() AND id=jid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Job unavailable' USING ERRCODE='HT404';END IF;
 PERFORM purchase.require_access('documents.jobs.retry');
 PERFORM platform.require_document_access(j.document_id,CASE j.kind WHEN 'SCAN' THEN 'UPLOAD' ELSE j.kind END);
 IF j.version<>expected OR j.state<>'FAILED' THEN RAISE EXCEPTION 'Only the current FAILED job can be retried; UNKNOWN mail needs provider investigation' USING ERRCODE='HD409';END IF;
 IF reason IS NULL OR length(btrim(reason)) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Retry reason required' USING ERRCODE='HD422';END IF;
 IF j.kind='EMAIL' AND j.first_started_at<now()-interval '12 hours' THEN RAISE EXCEPTION 'Mail idempotency safety window expired; verify provider outcome' USING ERRCODE='HD409';END IF;
 IF j.kind='SCAN' AND EXISTS(SELECT 1 FROM platform.files WHERE company_id=j.company_id AND id=(j.payload->>'fileId')::uuid AND state='REJECTED') THEN
  RAISE EXCEPTION 'Rejected malware cannot be made available by retrying a scan' USING ERRCODE='HD409';END IF;
 UPDATE platform.document_jobs SET state='QUEUED',attempts=0,available_at=now(),last_error=NULL,lease_token=NULL,lease_until=NULL WHERE id=jid;
END $$;
CREATE FUNCTION platform.revoke_attachment(fid uuid,expected bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a platform.file_assets;f platform.files;BEGIN
 SELECT * INTO a FROM platform.file_assets WHERE company_id=core.current_company() AND file_id=fid;
 IF NOT FOUND THEN RAISE EXCEPTION 'File unavailable' USING ERRCODE='HT404';END IF;
 PERFORM platform.require_document_access(a.document_id,'UPLOAD');
 SELECT * INTO f FROM platform.files WHERE company_id=a.company_id AND id=fid FOR UPDATE;
 IF f.created_by<>core.current_actor() THEN PERFORM purchase.require_access('documents.files.manage');END IF;
 IF a.kind<>'ATTACHMENT' OR f.version<>expected OR a.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Attachment changed, revoked or is a generated artifact' USING ERRCODE='HD409';END IF;
 UPDATE platform.file_assets SET revoked_at=now(),revoked_by=core.current_actor() WHERE company_id=a.company_id AND file_id=fid;
 UPDATE platform.files SET state=state WHERE company_id=a.company_id AND id=fid;
END $$;

-- Worker functions require a live per-job fencing token, never an arbitrary company selector.
CREATE FUNCTION platform.claim_document_job() RETURNS SETOF platform.document_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j platform.document_jobs;BEGIN
 FOR j IN SELECT * FROM platform.document_jobs WHERE state='PROCESSING' AND lease_until<now() FOR UPDATE SKIP LOCKED LOOP
  PERFORM set_config('htt.company_id',j.company_id::text,true);
  UPDATE platform.document_job_attempts SET finished_at=now(),result=CASE WHEN j.kind='EMAIL' THEN 'UNKNOWN' ELSE 'LEASE_EXPIRED' END,error_code='lease_expired' WHERE company_id=j.company_id AND job_id=j.id AND lease_token=j.lease_token AND finished_at IS NULL;
  UPDATE platform.document_jobs SET state=CASE WHEN kind='EMAIL' THEN 'UNKNOWN' WHEN attempts>=5 THEN 'FAILED' ELSE 'RETRY' END,last_error='lease_expired',lease_token=NULL,lease_until=NULL WHERE id=j.id;
 END LOOP;
 SELECT * INTO j FROM platform.document_jobs WHERE state IN('QUEUED','RETRY') AND available_at<=now() AND attempts<5 ORDER BY available_at,created_at,id FOR UPDATE SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN;END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);
 IF j.kind='EMAIL' AND j.first_started_at<now()-interval '12 hours' THEN
  UPDATE platform.document_jobs SET state='UNKNOWN',last_error='mail_window_expired' WHERE id=j.id;RETURN;
 END IF;
 UPDATE platform.document_jobs SET state='PROCESSING',attempts=attempts+1,total_attempts=total_attempts+1,
  first_started_at=coalesce(first_started_at,now()),lease_token=gen_random_uuid(),lease_until=now()+interval '2 minutes' WHERE id=j.id RETURNING * INTO j;
 INSERT INTO platform.document_job_attempts(company_id,job_id,attempt,lease_token) VALUES(j.company_id,j.id,j.total_attempts,j.lease_token);
 RETURN NEXT j;
END $$;
CREATE FUNCTION platform.load_document_work(jid uuid,fence uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j platform.document_jobs;f record;payload jsonb;attachments jsonb:='[]';BEGIN
 SELECT * INTO j FROM platform.document_jobs WHERE id=jid AND lease_token=fence AND lease_until>now() AND state='PROCESSING';
 IF NOT FOUND THEN RAISE EXCEPTION 'Lease unavailable' USING ERRCODE='HD409';END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);PERFORM set_config('htt.actor_id',j.created_by::text,true);
 IF j.kind<>'SCAN' THEN PERFORM platform.require_document_access(j.document_id,j.kind);END IF;
 payload:=j.payload;
 IF j.kind='EMAIL' THEN
  IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=j.company_id AND id=j.document_id AND version=j.source_version AND state IN('CONFIRMED','POSTED') AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Document version changed before email dispatch' USING ERRCODE='HD409';END IF;
  FOR f IN SELECT * FROM jsonb_array_elements_text(payload->'fileIds') LOOP
   attachments:=attachments||jsonb_build_array((SELECT jsonb_build_object('filename',a.filename,'content',replace(encode(b.body,'base64'),E'\n',''))
    FROM platform.file_assets a JOIN platform.files x ON x.company_id=a.company_id AND x.id=a.file_id JOIN platform.file_contents b ON b.company_id=x.company_id AND b.file_id=x.id
    WHERE a.company_id=j.company_id AND a.file_id=f.value::uuid AND a.document_id=j.document_id AND a.revoked_at IS NULL AND x.state='VERIFIED' AND x.sha256=encode(sha256(b.body),'hex')));
  END LOOP;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(attachments)x WHERE x='null'::jsonb) THEN RAISE EXCEPTION 'Mail attachment unavailable' USING ERRCODE='HD409';END IF;
  payload:=(payload-'fileIds')||jsonb_build_object('attachments',attachments);
 ELSIF j.kind='SCAN' THEN
  SELECT jsonb_build_object('content',replace(encode(b.body,'base64'),E'\n',''),'contentType',x.content_type) INTO payload
  FROM platform.file_assets a JOIN platform.files x ON x.company_id=a.company_id AND x.id=a.file_id JOIN platform.file_contents b ON b.company_id=x.company_id AND b.file_id=x.id
  WHERE a.company_id=j.company_id AND a.document_id=j.document_id AND a.file_id=(j.payload->>'fileId')::uuid AND a.revoked_at IS NULL AND x.state='PENDING' AND x.sha256=encode(sha256(b.body),'hex');
  IF payload IS NULL THEN RAISE EXCEPTION 'Pending file unavailable' USING ERRCODE='HD409';END IF;
 END IF;
 RETURN payload;
END $$;
CREATE FUNCTION platform.finish_document_work(jid uuid,fence uuid,result text,error_code text,pdf bytea DEFAULT NULL,provider text DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE j platform.document_jobs;fid uuid;filename text;BEGIN
 SELECT * INTO j FROM platform.document_jobs WHERE id=jid AND lease_token=fence AND lease_until>now() AND state='PROCESSING' FOR UPDATE;
 IF NOT FOUND THEN RETURN false;END IF;
 IF result NOT IN('SUCCEEDED','RETRY','FAILED','UNKNOWN','REJECTED') OR error_code IS NOT NULL AND error_code!~'^[a-z0-9_]{1,80}$' THEN RAISE EXCEPTION 'Invalid work result' USING ERRCODE='HD422';END IF;
 PERFORM set_config('htt.company_id',j.company_id::text,true);PERFORM set_config('htt.actor_id',j.created_by::text,true);
 IF result='SUCCEEDED' AND j.kind='PDF' THEN
  IF pdf IS NULL OR octet_length(pdf) NOT BETWEEN 8 AND 10485760 OR substring(pdf FROM 1 FOR 5)<>convert_to('%PDF-','UTF8') THEN RAISE EXCEPTION 'Invalid generated PDF' USING ERRCODE='HD422';END IF;
  fid:=gen_random_uuid();filename:=j.payload->>'filename';
  INSERT INTO platform.files(id,company_id,object_key,content_type,size_bytes,sha256,state,created_by) VALUES(fid,j.company_id,j.company_id::text||'/'||fid::text,'application/pdf',octet_length(pdf),encode(sha256(pdf),'hex'),'VERIFIED',j.created_by);
  INSERT INTO platform.file_contents(company_id,file_id,body) VALUES(j.company_id,fid,pdf);
  INSERT INTO platform.file_assets(company_id,file_id,document_id,source_version,filename,kind) VALUES(j.company_id,fid,j.document_id,j.source_version,filename,'PDF');
  INSERT INTO platform.file_links(company_id,file_id,document_id,created_by) VALUES(j.company_id,fid,j.document_id,j.created_by);
 ELSIF j.kind='SCAN' AND result IN('SUCCEEDED','REJECTED') THEN
  fid:=(j.payload->>'fileId')::uuid;
  UPDATE platform.files SET state=CASE WHEN result='SUCCEEDED' THEN 'VERIFIED' ELSE 'REJECTED' END WHERE company_id=j.company_id AND id=fid AND state='PENDING';
 ELSIF result='SUCCEEDED' AND j.kind='EMAIL' AND (provider IS NULL OR length(provider) NOT BETWEEN 1 AND 200) THEN RAISE EXCEPTION 'Provider receipt required' USING ERRCODE='HD422';
 END IF;
 UPDATE platform.document_job_attempts SET finished_at=now(),result=finish_document_work.result,error_code=finish_document_work.error_code WHERE company_id=j.company_id AND job_id=j.id AND lease_token=fence;
 UPDATE platform.document_jobs SET state=CASE WHEN result='REJECTED' THEN 'FAILED' WHEN result='RETRY' AND attempts>=5 THEN 'FAILED' ELSE result END,
  output_file_id=coalesce(fid,output_file_id),provider_id=provider,last_error=error_code,
  completed_at=CASE WHEN result='SUCCEEDED' THEN now() END,available_at=now()+make_interval(secs=>least(900,15*power(2,attempts)::int)),lease_token=NULL,lease_until=NULL WHERE id=j.id;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
  VALUES(j.company_id,j.created_by,'documents.work_finished','document_job',j.id,'document-worker',jsonb_build_object('kind',j.kind,'result',result,'errorCode',error_code,'attempt',j.total_attempts));
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION identity.seed_document_roles(uuid),platform.require_document_access(uuid,text),platform.read_private_file(uuid),platform.retry_document_job(uuid,bigint,text),platform.revoke_attachment(uuid,bigint),platform.claim_document_job(),platform.load_document_work(uuid,uuid),platform.finish_document_work(uuid,uuid,text,text,bytea,text) FROM PUBLIC;
GRANT SELECT ON platform.files,platform.file_assets,platform.file_links,platform.document_jobs,platform.document_job_attempts TO htt_app;
GRANT INSERT ON platform.files,platform.file_contents,platform.file_assets,platform.file_links,platform.document_jobs TO htt_app;
GRANT EXECUTE ON FUNCTION platform.require_document_access(uuid,text),platform.read_private_file(uuid),platform.retry_document_job(uuid,bigint,text),platform.revoke_attachment(uuid,bigint) TO htt_app;
GRANT EXECUTE ON FUNCTION platform.claim_document_job(),platform.load_document_work(uuid,uuid),platform.finish_document_work(uuid,uuid,text,text,bytea,text) TO htt_worker;
