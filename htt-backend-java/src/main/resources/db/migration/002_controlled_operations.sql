-- Bootstrap roles must exist before migrations (infra/init-db.sh).
CREATE FUNCTION identity.resolve_access(p_issuer text,p_subject text)
RETURNS TABLE(user_id uuid,company_id uuid,company_name text,membership_id uuid,permissions text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT u.id,c.id,c.name,m.id,
  COALESCE(array_agg(DISTINCT rp.permission_code) FILTER(WHERE rp.permission_code IS NOT NULL),ARRAY[]::text[])
 FROM identity.users u JOIN identity.memberships m ON m.user_id=u.id AND m.active
 JOIN core.companies c ON c.id=m.company_id
 LEFT JOIN identity.membership_roles mr ON mr.membership_id=m.id AND mr.company_id=m.company_id
 LEFT JOIN identity.role_permissions rp ON rp.role_id=mr.role_id AND rp.company_id=mr.company_id
 WHERE u.issuer=p_issuer AND u.subject=p_subject AND u.active
 GROUP BY u.id,c.id,c.name,m.id
$$;

CREATE FUNCTION crm.validate_contact_branch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM crm.contacts co JOIN crm.customers cu ON cu.company_id=co.company_id AND cu.party_id=co.party_id
 JOIN crm.customer_branches b ON b.company_id=cu.company_id AND b.customer_id=cu.id
 WHERE co.company_id=NEW.company_id AND co.id=NEW.contact_id AND b.id=NEW.customer_branch_id) THEN
  RAISE EXCEPTION 'Contact and branch must belong to the same customer' USING ERRCODE='23514';
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER contact_customer_check BEFORE INSERT OR UPDATE ON crm.contact_branch_links FOR EACH ROW EXECUTE FUNCTION crm.validate_contact_branch();

CREATE FUNCTION identity.validate_branch_grant() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM identity.customer_user_grants g JOIN crm.customer_branches b
 ON b.company_id=g.company_id AND b.customer_id=g.customer_id
 WHERE g.company_id=NEW.company_id AND g.id=NEW.grant_id AND b.id=NEW.customer_branch_id) THEN
  RAISE EXCEPTION 'Branch must belong to the granted customer' USING ERRCODE='23514';
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER grant_customer_check BEFORE INSERT OR UPDATE ON identity.customer_user_branch_scopes FOR EACH ROW EXECUTE FUNCTION identity.validate_branch_grant();

CREATE FUNCTION catalog.validate_product_base_unit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p_id uuid; c_id uuid;
BEGIN
 IF TG_TABLE_NAME='products' THEN p_id:=NEW.id; ELSE p_id:=NEW.product_id; END IF;
 c_id:=NEW.company_id;
 IF NOT EXISTS(SELECT 1 FROM catalog.products p JOIN catalog.product_units u
 ON u.company_id=p.company_id AND u.product_id=p.id AND u.uom_id=p.base_uom_id AND u.conversion_to_base=1
 WHERE p.id=p_id AND p.company_id=c_id) THEN
  RAISE EXCEPTION 'Product requires a base unit with conversion 1' USING ERRCODE='23514';
 END IF; RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER product_base_unit AFTER INSERT OR UPDATE ON catalog.products DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION catalog.validate_product_base_unit();
CREATE CONSTRAINT TRIGGER unit_base_unit AFTER INSERT OR UPDATE ON catalog.product_units DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION catalog.validate_product_base_unit();

CREATE FUNCTION accounting.validate_journal() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE j_id uuid; c_id uuid; n int; d numeric; c numeric;
BEGIN
 IF TG_TABLE_NAME='journal_entries' THEN j_id:=NEW.id; ELSE j_id:=NEW.journal_entry_id; END IF;
 c_id:=NEW.company_id;
 SELECT count(*),COALESCE(sum(debit),0),COALESCE(sum(credit),0) INTO n,d,c
 FROM accounting.journal_lines WHERE company_id=c_id AND journal_entry_id=j_id;
 IF n<2 OR d<>c THEN RAISE EXCEPTION 'Journal must have at least two lines and balance exactly' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM accounting.journal_entries j JOIN accounting.periods p
 ON p.company_id=j.company_id AND j.posting_date>=p.starts_on AND j.posting_date<p.ends_on AND p.state='OPEN'
 WHERE j.company_id=c_id AND j.id=j_id) THEN
  RAISE EXCEPTION 'Posting date is outside an open accounting period' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER journal_balance AFTER INSERT ON accounting.journal_entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_journal();
CREATE CONSTRAINT TRIGGER journal_balance AFTER INSERT ON accounting.journal_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_journal();
CREATE TRIGGER posting_append_only BEFORE UPDATE OR DELETE ON accounting.posting_batches FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();

-- Internal application primitive, NOT exposed as a manual journal API. All dates use half-open periods.
CREATE FUNCTION accounting.post_journal(p_source uuid,p_version bigint,p_kind text,p_date date,p_description text,p_lines jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c_id uuid:=core.current_company(); actor uuid:=core.current_actor(); b_id uuid; j_id uuid:=gen_random_uuid(); doc platform.documents;
BEGIN
 IF c_id IS NULL OR actor IS NULL THEN RAISE EXCEPTION 'Company and actor context required' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines)<2 THEN
  RAISE EXCEPTION 'Two or more posting lines required' USING ERRCODE='23514'; END IF;
 SELECT * INTO doc FROM platform.documents WHERE company_id=c_id AND id=p_source FOR UPDATE;
 IF NOT FOUND OR doc.version<>p_version OR doc.state IN ('CANCELLED','REVERSED') THEN
  RAISE EXCEPTION 'Source missing, cancelled, or version conflict' USING ERRCODE='23514'; END IF;
 -- Locks prevent closing a period concurrently with posting.
 PERFORM 1 FROM accounting.periods WHERE company_id=c_id AND starts_on<=p_date AND ends_on>p_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Accounting period is closed or missing' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x LEFT JOIN accounting.accounts a
 ON a.company_id=c_id AND a.id=(x->>'accountId')::uuid
 WHERE a.id IS NULL OR NOT a.active OR (a.control_kind IN ('AR','AP') AND nullif(x->>'partyId','') IS NULL)) THEN
  RAISE EXCEPTION 'Invalid account or missing control-account party' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x WHERE
  COALESCE((x->>'debit')::numeric,0)<>round(COALESCE((x->>'debit')::numeric,0),2) OR
  COALESCE((x->>'credit')::numeric,0)<>round(COALESCE((x->>'credit')::numeric,0),2)) THEN
  RAISE EXCEPTION 'Posting amounts must have at most two decimal places' USING ERRCODE='23514'; END IF;
 INSERT INTO accounting.posting_batches(company_id,source_document_id,source_version,posting_kind,created_by)
 VALUES(c_id,p_source,p_version,p_kind,actor) RETURNING id INTO b_id;
 INSERT INTO accounting.journal_entries(id,company_id,posting_batch_id,posting_date,description,created_by)
 VALUES(j_id,c_id,b_id,p_date,p_description,actor);
 INSERT INTO accounting.journal_lines(company_id,journal_entry_id,account_id,party_id,debit,credit,source_line_id,created_by)
 SELECT c_id,j_id,(x->>'accountId')::uuid,nullif(x->>'partyId','')::uuid,
 COALESCE((x->>'debit')::numeric,0),COALESCE((x->>'credit')::numeric,0),nullif(x->>'sourceLineId','')::uuid,actor
 FROM jsonb_array_elements(p_lines) x;
 IF EXISTS(SELECT 1 FROM accounting.journal_lines l JOIN platform.document_lines d ON d.company_id=l.company_id AND d.id=l.source_line_id
 WHERE l.company_id=c_id AND l.journal_entry_id=j_id AND d.document_id<>p_source) THEN
  RAISE EXCEPTION 'Source line belongs to a different document' USING ERRCODE='23514'; END IF;
 INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
 VALUES(c_id,actor,'journal.posted','journal',j_id,COALESCE(nullif(current_setting('htt.request_id',true),''),'internal'),jsonb_build_object('sourceDocumentId',p_source));
 RETURN j_id;
END $$;

CREATE FUNCTION platform.claim_outbox(p_limit int) RETURNS SETOF platform.outbox_events
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF p_limit NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Batch size must be 1..100'; END IF;
 RETURN QUERY UPDATE platform.outbox_events o SET lease_token=gen_random_uuid(),lease_until=now()+interval '60 seconds',attempts=o.attempts+1
 FROM (SELECT id FROM platform.outbox_events WHERE completed_at IS NULL AND failed_at IS NULL AND available_at<=now()
 AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT p_limit) picked
 WHERE o.id=picked.id RETURNING o.*;
END $$;
CREATE FUNCTION platform.finish_outbox(p_id uuid,p_token uuid,p_error text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 UPDATE platform.outbox_events SET completed_at=CASE WHEN p_error IS NULL THEN now() END,
 failed_at=CASE WHEN p_error IS NOT NULL AND attempts>=5 THEN now() END,
 available_at=now()+make_interval(secs=>LEAST(300,power(2,attempts)::int)),
 lease_until=NULL,lease_token=NULL,last_error=left(p_error,1000)
 WHERE id=p_id AND lease_token=p_token AND completed_at IS NULL AND lease_until>now();
 RETURN FOUND;
END $$;

-- Owner-only bootstrap function scope for worker across companies; no table access is granted to worker.
-- Identity and outbox tables intentionally do not FORCE RLS on their owner, so narrowly-defined definer functions work.
ALTER TABLE platform.outbox_events NO FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA core,identity,crm,catalog,pricing,accounting,platform FROM PUBLIC;
GRANT USAGE ON SCHEMA core,identity,crm,catalog,pricing,accounting,platform TO htt_app;
GRANT EXECUTE ON FUNCTION core.current_company(),core.current_actor(),core.valid_abn(text) TO htt_app;
GRANT EXECUTE ON FUNCTION identity.resolve_access(text,text) TO htt_app;
GRANT SELECT ON core.companies,identity.permissions,identity.memberships,identity.roles,identity.membership_roles,identity.role_permissions,identity.customer_assignments,identity.warehouse_scopes TO htt_app;
GRANT SELECT ON ALL TABLES IN SCHEMA crm,catalog,pricing,accounting TO htt_app;
GRANT INSERT,UPDATE ON crm.parties,crm.customers,crm.customer_branches,crm.contacts,crm.contact_branch_links,crm.customer_credit_exposures,catalog.products,catalog.product_units TO htt_app;
GRANT SELECT,INSERT ON platform.audit_events,platform.idempotency_requests,platform.outbox_events TO htt_app;
GRANT SELECT ON platform.documents,platform.document_lines TO htt_app;
GRANT EXECUTE ON FUNCTION accounting.post_journal(uuid,bigint,text,date,text,jsonb) TO htt_app;
GRANT USAGE ON SCHEMA platform TO htt_worker;
GRANT EXECUTE ON FUNCTION platform.claim_outbox(int),platform.finish_outbox(uuid,uuid,text) TO htt_worker;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
