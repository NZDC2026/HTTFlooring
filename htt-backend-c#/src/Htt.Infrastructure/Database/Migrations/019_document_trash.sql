-- Visibility has an independent version; immutable registry/source versions and ledgers never change here.
CREATE TABLE platform.document_visibility(
 company_id uuid NOT NULL,document_id uuid NOT NULL,version bigint NOT NULL CHECK(version>=2),
 trashed_at timestamptz,trashed_by uuid REFERENCES identity.users(id),reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 2000),
 changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),changed_by uuid NOT NULL REFERENCES identity.users(id),
 PRIMARY KEY(company_id,document_id),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id),
 CHECK((trashed_at IS NULL)=(trashed_by IS NULL))
);
ALTER TABLE platform.document_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.document_visibility FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON platform.document_visibility USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX ON platform.document_visibility(company_id,trashed_at DESC,document_id) WHERE trashed_at IS NOT NULL;
INSERT INTO identity.permissions(code,description) VALUES
 ('documents.trash.read','Read authorized document lifecycle and trash'),('documents.trash.write','Move eligible documents to trash'),('documents.trash.restore','Restore document visibility without changing business state');
CREATE FUNCTION identity.seed_trash_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','OFFICE','SALES','FINANCE','PROCUREMENT') AND p.code IN('documents.trash.read','documents.trash.write','documents.trash.restore') ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_trash_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION platform.document_visible(doc uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS(SELECT 1 FROM platform.documents d WHERE d.company_id=core.current_company() AND d.id=doc AND d.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM platform.document_visibility v WHERE v.company_id=d.company_id AND v.document_id=d.id AND v.trashed_at IS NOT NULL))
$$;
CREATE FUNCTION platform.require_visible_document(c uuid,doc uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=doc FOR UPDATE;
 IF NOT FOUND OR EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=doc AND deleted_at IS NOT NULL) OR EXISTS(SELECT 1 FROM platform.document_visibility WHERE company_id=c AND document_id=doc AND trashed_at IS NOT NULL) THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
END $$;
CREATE FUNCTION platform.guard_hidden_document() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r jsonb;prior jsonb;doc uuid;c uuid;BEGIN
 IF TG_OP='UPDATE' THEN
  prior:=to_jsonb(OLD);
  IF TG_TABLE_SCHEMA='platform' AND TG_TABLE_NAME='documents' AND (to_jsonb(NEW)->'deleted_at',to_jsonb(NEW)->'deleted_by') IS DISTINCT FROM (prior->'deleted_at',prior->'deleted_by') THEN RAISE EXCEPTION 'Use audited document lifecycle commands' USING ERRCODE='23514';END IF;
  PERFORM platform.require_visible_document((prior->>'company_id')::uuid,(prior->>TG_ARGV[0])::uuid);
 END IF;
 r:=CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;c:=(r->>'company_id')::uuid;doc:=(r->>TG_ARGV[0])::uuid;
 -- Registry inserts precede any visibility entry. Registry updates and business child writes serialize with trash.
 PERFORM platform.require_visible_document(c,doc);
 IF TG_OP='DELETE' THEN RETURN OLD;END IF;RETURN NEW;
END $$;
CREATE TRIGGER visible_document BEFORE UPDATE OR DELETE ON platform.documents FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('id');
CREATE TRIGGER visible_quote BEFORE UPDATE OR DELETE ON sales.quotes FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('id');
CREATE TRIGGER visible_quote_line BEFORE INSERT OR UPDATE OR DELETE ON sales.quote_lines FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('quote_id');
CREATE TRIGGER visible_purchase_order BEFORE UPDATE OR DELETE ON purchase.orders FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('id');
CREATE TRIGGER visible_purchase_line BEFORE INSERT OR UPDATE OR DELETE ON purchase.order_lines FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('order_id');
CREATE TRIGGER visible_document_line BEFORE INSERT OR UPDATE OR DELETE ON platform.document_lines FOR EACH ROW EXECUTE FUNCTION platform.guard_hidden_document('document_id');
CREATE FUNCTION platform.guard_visible_job() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 PERFORM 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=NEW.document_id FOR SHARE;
 IF NOT FOUND OR NOT platform.document_visible(NEW.document_id) THEN RAISE EXCEPTION 'Document unavailable for new work' USING ERRCODE='HT404';END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER visible_document_job BEFORE INSERT ON platform.document_jobs FOR EACH ROW EXECUTE FUNCTION platform.guard_visible_job();
CREATE FUNCTION platform.trash_access(doc uuid,action text) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE d platform.documents;cust uuid;wh uuid;owner uuid;BEGIN
 PERFORM purchase.require_access(CASE action WHEN 'READ' THEN 'documents.trash.read' WHEN 'TRASH' THEN 'documents.trash.write' WHEN 'RESTORE' THEN 'documents.trash.restore' ELSE 'invalid.trash.action' END);
 SELECT * INTO d FROM platform.documents WHERE company_id=core.current_company() AND id=doc;
 IF NOT FOUND THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
 CASE d.document_type
 WHEN 'QUOTE' THEN
  SELECT customer_id,created_by INTO cust,owner FROM sales.quotes WHERE company_id=d.company_id AND id=doc;
  IF cust IS NULL THEN RAISE EXCEPTION 'Quote unavailable' USING ERRCODE='HT404';END IF;
  PERFORM sales.require_customer_access('sales.quotes.read',cust);
  IF action<>'READ' THEN PERFORM purchase.require_access('sales.quotes.write');IF owner<>core.current_actor() AND NOT EXISTS(SELECT 1 FROM identity.memberships m JOIN identity.membership_roles mr ON mr.company_id=m.company_id AND mr.membership_id=m.id JOIN identity.role_permissions rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id WHERE m.company_id=d.company_id AND m.user_id=core.current_actor() AND m.active AND rp.permission_code='sales.quotes.manage.all') THEN RAISE EXCEPTION 'Only quote owner or office may change visibility' USING ERRCODE='42501';END IF;END IF;
 WHEN 'SALES_ORDER' THEN
  SELECT customer_id INTO cust FROM sales.orders WHERE company_id=d.company_id AND id=doc;IF cust IS NULL THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='HT404';END IF;
  PERFORM sales.require_customer_access('sales.orders.read',cust);IF action<>'READ' THEN PERFORM purchase.require_access('sales.orders.cancel');END IF;
 WHEN 'INVOICE' THEN
  SELECT customer_id INTO cust FROM sales.invoices WHERE company_id=d.company_id AND id=doc;IF cust IS NULL THEN RAISE EXCEPTION 'Invoice unavailable' USING ERRCODE='HT404';END IF;
  PERFORM sales.require_customer_access('sales.invoices.read',cust);IF action<>'READ' THEN PERFORM purchase.require_access('sales.invoices.write');END IF;
 WHEN 'CREDIT_NOTE' THEN
  SELECT i.customer_id INTO cust FROM sales.credit_notes n JOIN sales.invoices i ON i.company_id=n.company_id AND i.id=n.invoice_id WHERE n.company_id=d.company_id AND n.id=doc;IF cust IS NULL THEN RAISE EXCEPTION 'Credit unavailable' USING ERRCODE='HT404';END IF;
  PERFORM sales.require_customer_access('sales.credits.read',cust);IF action<>'READ' THEN PERFORM purchase.require_access('sales.credits.write');END IF;
 WHEN 'PURCHASE_ORDER' THEN
  SELECT warehouse_id INTO wh FROM purchase.orders WHERE company_id=d.company_id AND id=doc;IF wh IS NULL THEN RAISE EXCEPTION 'Purchase order unavailable' USING ERRCODE='HT404';END IF;
  PERFORM inventory.require_access('purchase.orders.read',wh);IF action<>'READ' THEN PERFORM purchase.require_access('purchase.orders.write');END IF;
 ELSE RAISE EXCEPTION 'Document type has no trash workflow' USING ERRCODE='HX422';END CASE;
 RETURN d.document_type;
END $$;
CREATE FUNCTION platform.trash_view(doc uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;BEGIN
 PERFORM platform.trash_access(doc,'READ');
 SELECT jsonb_build_object('id',d.id,'documentType',d.document_type,'number',d.number,'state',d.state,'documentVersion',d.version,'lifecycleVersion',coalesce(v.version,1),'isTrashed',v.trashed_at IS NOT NULL OR d.deleted_at IS NOT NULL,'trashedAt',coalesce(v.trashed_at,d.deleted_at),'trashedBy',coalesce(v.trashed_by,d.deleted_by),'reason',v.reason,'changedAt',v.changed_at)
 INTO result FROM platform.documents d LEFT JOIN platform.document_visibility v ON v.company_id=d.company_id AND v.document_id=d.id WHERE d.company_id=core.current_company() AND d.id=doc;RETURN result;
END $$;
CREATE FUNCTION platform.trash_can_read(doc uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 PERFORM platform.trash_access(doc,'READ');RETURN true;EXCEPTION WHEN insufficient_privilege OR SQLSTATE 'HT404' OR SQLSTATE 'HX422' THEN RETURN false;END $$;
CREATE FUNCTION platform.trash_items(typ text,p_page int,p_size int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;BEGIN PERFORM purchase.require_access('documents.trash.read');
 IF p_page IS NULL OR p_page NOT BETWEEN 1 AND 10000 OR p_size IS NULL OR p_size NOT BETWEEN 1 AND 100 OR (typ IS NOT NULL AND typ NOT IN('QUOTE','SALES_ORDER','INVOICE','CREDIT_NOTE','PURCHASE_ORDER')) THEN RAISE EXCEPTION 'Invalid trash filter or page' USING ERRCODE='HX422';END IF;
 WITH eligible AS MATERIALIZED(SELECT d.id,coalesce(v.trashed_at,d.deleted_at) AS trashed_at FROM platform.documents d LEFT JOIN platform.document_visibility v ON v.company_id=d.company_id AND v.document_id=d.id WHERE d.company_id=core.current_company() AND (v.trashed_at IS NOT NULL OR d.deleted_at IS NOT NULL) AND (typ IS NULL OR d.document_type=typ) AND platform.trash_can_read(d.id)),paged AS(SELECT * FROM eligible ORDER BY trashed_at DESC,id LIMIT p_size OFFSET (p_page-1)*p_size)
 SELECT jsonb_build_object('page',p_page,'pageSize',p_size,'totalItems',(SELECT count(*) FROM eligible),'items',coalesce((SELECT jsonb_agg(platform.trash_view(id) ORDER BY trashed_at DESC,id) FROM paged),'[]'::jsonb)) INTO result;RETURN result;
END $$;
CREATE FUNCTION platform.change_visibility(doc uuid,expected bigint,business_version bigint,restore boolean,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE d platform.documents;v platform.document_visibility;typ text;BEGIN
 typ:=platform.trash_access(doc,CASE WHEN restore THEN 'RESTORE' ELSE 'TRASH' END);
 IF expected IS NULL OR expected<1 OR business_version IS NULL OR business_version<1 OR restore IS NULL OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Versions and reason required' USING ERRCODE='HX422';END IF;
 SELECT * INTO d FROM platform.documents WHERE company_id=core.current_company() AND id=doc FOR UPDATE;
 SELECT * INTO v FROM platform.document_visibility WHERE company_id=d.company_id AND document_id=doc FOR UPDATE;
 IF d.version<>business_version OR coalesce(v.version,1)<>expected THEN RAISE EXCEPTION 'Document or visibility changed' USING ERRCODE='HX409';END IF;
 IF d.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Legacy deletion requires reviewed migration; cannot restore unknown historical intent' USING ERRCODE='HX409';END IF;
 IF restore THEN
  IF v.trashed_at IS NULL THEN RAISE EXCEPTION 'Document is not in trash' USING ERRCODE='HX409';END IF;
 ELSE
  IF v.trashed_at IS NOT NULL THEN RAISE EXCEPTION 'Document is already in trash' USING ERRCODE='HX409';END IF;
  -- A queued or in-flight email can have irreversible external effects; never race it with hiding.
  IF EXISTS(SELECT 1 FROM platform.document_jobs WHERE company_id=d.company_id AND document_id=doc AND kind IN('EMAIL','PDF') AND state IN('QUEUED','PROCESSING','RETRY','UNKNOWN')) THEN RAISE EXCEPTION 'Resolve outstanding document output before trash' USING ERRCODE='HX409';END IF;
  CASE typ
  WHEN 'QUOTE' THEN
   IF NOT EXISTS(SELECT 1 FROM sales.quotes WHERE company_id=d.company_id AND id=doc AND status='DRAFT') OR d.state<>'DRAFT' OR EXISTS(SELECT 1 FROM sales.orders WHERE company_id=d.company_id AND source_quote_id=doc) THEN RAISE EXCEPTION 'Only unconverted draft quotes may be trashed; office must first return submitted quotes' USING ERRCODE='HX409';END IF;
  WHEN 'PURCHASE_ORDER' THEN
   IF NOT EXISTS(SELECT 1 FROM purchase.orders WHERE company_id=d.company_id AND id=doc AND ((status='DRAFT' AND d.state='DRAFT') OR (status='CLOSED' AND d.state='CANCELLED'))) OR EXISTS(SELECT 1 FROM purchase.receipts WHERE company_id=d.company_id AND order_id=doc) THEN RAISE EXCEPTION 'Only draft or closed unreceived purchase orders may be trashed' USING ERRCODE='HX409';END IF;
  WHEN 'SALES_ORDER' THEN
   IF d.state<>'CANCELLED' OR EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=d.company_id AND order_id=doc) OR EXISTS(SELECT 1 FROM sales.credit_commitments WHERE company_id=d.company_id AND order_id=doc AND amount<>released_amount) OR EXISTS(SELECT 1 FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id WHERE l.company_id=d.company_id AND l.order_id=doc AND (r.consumed_quantity<>0 OR r.released_quantity<>r.quantity)) OR EXISTS(SELECT 1 FROM accounting.customer_advances a JOIN sales.order_lines l ON l.company_id=a.company_id AND l.id=a.order_line_id WHERE l.company_id=d.company_id AND l.order_id=doc AND a.amount<>accounting.advance_refunded(a.id)) THEN RAISE EXCEPTION 'Cancel unfulfilled order and release reservations, commitments and advances first' USING ERRCODE='HX409';END IF;
  WHEN 'INVOICE' THEN
   IF d.state<>'POSTED' OR EXISTS(SELECT 1 FROM sales.credit_notes n WHERE n.company_id=d.company_id AND n.invoice_id=doc AND (NOT EXISTS(SELECT 1 FROM platform.documents nd WHERE nd.company_id=n.company_id AND nd.id=n.id AND nd.state='POSTED') OR (n.gross>0 AND NOT EXISTS(SELECT 1 FROM accounting.reversal_links rl JOIN accounting.posting_batches cb ON cb.company_id=rl.company_id AND cb.id=rl.contra_batch_id JOIN accounting.posting_batches sb ON sb.company_id=rl.company_id AND sb.id=rl.source_batch_id WHERE rl.company_id=n.company_id AND cb.source_document_id=n.id AND sb.source_document_id=doc AND rl.kind='CREDIT_NOTE')))) OR NOT EXISTS(SELECT 1 FROM sales.invoice_lines WHERE company_id=d.company_id AND invoice_id=doc) OR EXISTS(SELECT 1 FROM sales.invoice_lines l WHERE l.company_id=d.company_id AND l.invoice_id=doc AND (l.quantity<>coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=l.company_id AND invoice_line_id=l.id),0) OR l.gross<>accounting.line_credited(l.id) OR accounting.line_refunded(l.id)<>coalesce((SELECT sum(amount) FROM accounting.payment_allocations WHERE company_id=l.company_id AND invoice_line_id=l.id),0))) THEN RAISE EXCEPTION 'Invoice must be fully legally credited and all received amounts refunded before trash; payment alone is not reversal' USING ERRCODE='HX409';END IF;
  WHEN 'CREDIT_NOTE' THEN
   -- Refund is settlement, not reversal of revenue/GST. No supported credit-note reversal exists yet.
   RAISE EXCEPTION 'Posted credit notes must be retained; refund does not reverse a credit note' USING ERRCODE='HX409';
  END CASE;
 END IF;
 INSERT INTO platform.document_visibility(company_id,document_id,version,trashed_at,trashed_by,reason,changed_by)
 VALUES(d.company_id,doc,expected+1,CASE WHEN restore THEN NULL ELSE clock_timestamp() END,CASE WHEN restore THEN NULL ELSE core.current_actor() END,btrim(reason),core.current_actor())
 ON CONFLICT(company_id,document_id) DO UPDATE SET version=EXCLUDED.version,trashed_at=EXCLUDED.trashed_at,trashed_by=EXCLUDED.trashed_by,reason=EXCLUDED.reason,changed_at=clock_timestamp(),changed_by=EXCLUDED.changed_by;
 RETURN platform.trash_view(doc);
END $$;
REVOKE ALL ON FUNCTION identity.seed_trash_roles(uuid),platform.document_visible(uuid),platform.require_visible_document(uuid,uuid),platform.guard_hidden_document(),platform.guard_visible_job(),platform.trash_access(uuid,text),platform.trash_view(uuid),platform.trash_can_read(uuid),platform.trash_items(text,int,int),platform.change_visibility(uuid,bigint,bigint,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.document_visible(uuid),platform.trash_access(uuid,text),platform.trash_view(uuid),platform.trash_items(text,int,int),platform.change_visibility(uuid,bigint,bigint,boolean,text) TO htt_app;

CREATE OR REPLACE FUNCTION platform.require_document_access(doc uuid,action text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;customer uuid;required text;BEGIN
 required:=CASE action WHEN 'READ' THEN 'documents.files.read' WHEN 'PDF' THEN 'documents.pdf.request' WHEN 'EMAIL' THEN 'documents.email.send' WHEN 'UPLOAD' THEN 'documents.attachments.write' ELSE NULL END;
 IF required IS NULL THEN RAISE EXCEPTION 'Invalid document action' USING ERRCODE='HD422';END IF;
 PERFORM purchase.require_access(required);
 SELECT document_type INTO typ FROM platform.documents WHERE company_id=core.current_company() AND id=doc AND deleted_at IS NULL AND platform.document_visible(doc);
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
