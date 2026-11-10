-- Immutable same-supplier transfer of existing AP debit balances; never a synthetic bank payment.
CREATE TABLE purchase.credit_applications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),credit_note_id uuid NOT NULL,supplier_id uuid NOT NULL,party_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,credit_note_id) REFERENCES purchase.supplier_credit_notes(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE INDEX ON purchase.credit_applications(company_id,credit_note_id,created_at DESC,id);
CREATE UNIQUE INDEX credit_application_reference ON purchase.credit_applications(company_id,supplier_id,lower(btrim(reference)));
CREATE TABLE purchase.credit_application_lines(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),application_id uuid NOT NULL,credit_line_id uuid NOT NULL,source_bill_line_id uuid NOT NULL,target_bill_line_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),source_ap_account_id uuid NOT NULL,target_ap_account_id uuid NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,application_id,credit_line_id,target_bill_line_id),CHECK(source_bill_line_id<>target_bill_line_id),FOREIGN KEY(company_id,id,application_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,application_id) REFERENCES purchase.credit_applications(company_id,id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,credit_line_id) REFERENCES purchase.supplier_credit_lines(company_id,id),FOREIGN KEY(company_id,source_bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,target_bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,source_ap_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,target_ap_account_id) REFERENCES accounting.accounts(company_id,id)
);
CREATE INDEX ON purchase.credit_application_lines(company_id,credit_line_id);CREATE INDEX ON purchase.credit_application_lines(company_id,source_bill_line_id);CREATE INDEX ON purchase.credit_application_lines(company_id,target_bill_line_id);
CREATE TABLE purchase.credit_unapplications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),application_id uuid NOT NULL,supplier_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,application_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,application_id) REFERENCES purchase.credit_applications(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) DEFERRABLE INITIALLY DEFERRED
);
CREATE UNIQUE INDEX credit_unapplication_reference ON purchase.credit_unapplications(company_id,supplier_id,lower(btrim(reference)));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['credit_applications','credit_application_lines','credit_unapplications'] LOOP
 EXECUTE format('ALTER TABLE purchase.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE purchase.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON purchase.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON purchase.%I(company_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON purchase.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
END LOOP;END $$;
CREATE VIEW purchase.active_credit_application_lines WITH(security_invoker=true) AS SELECT l.* FROM purchase.credit_application_lines l WHERE NOT EXISTS(SELECT 1 FROM purchase.credit_unapplications u WHERE u.company_id=l.company_id AND u.application_id=l.application_id);
-- Explicit original columns preserve the pre-021 view expansion and every existing caller's column order.
CREATE OR REPLACE VIEW purchase.bill_line_balances WITH(security_invoker=true) AS
 SELECT bl.id,bl.company_id,bl.bill_id,bl.receipt_line_id,bl.grni_item_id,bl.quantity,bl.net,bl.tax,bl.grni_amount,bl.recoverable_tax,bl.tax_code_id,bl.tax_rate,bl.snapshot,
 bl.net+bl.tax AS gross,coalesce(cr.quantity,0) AS credited_quantity,coalesce(cr.gross,0) AS credited_amount,coalesce(cr.recoverable_tax,0) AS credited_tax,coalesce(pa.amount,0) AS paid_amount,coalesce(rf.amount,0) AS refunded_amount,
 bl.net+bl.tax-coalesce(cr.gross,0) AS remaining_gross,bl.recoverable_tax-coalesce(cr.recoverable_tax,0) AS remaining_tax,
 coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0) AS net_paid_amount,
 greatest(0,bl.net+bl.tax-coalesce(cr.gross,0)-coalesce(pa.amount,0)+coalesce(rf.amount,0)-coalesce(ci.amount,0)+coalesce(co.amount,0)) AS outstanding_amount,
 greatest(0,coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0)-bl.net-bl.tax+coalesce(cr.gross,0)) AS refundable_amount,
 coalesce(pa.gst,0)+coalesce(adj.gst,0) AS cash_tax_balance,coalesce(ci.amount,0) AS credit_received_amount,coalesce(co.amount,0) AS credit_used_amount
 FROM purchase.bill_lines bl
 LEFT JOIN LATERAL(SELECT sum(quantity) AS quantity,sum(gross) AS gross,sum(recoverable_tax) AS recoverable_tax FROM purchase.supplier_credit_lines WHERE company_id=bl.company_id AND bill_line_id=bl.id)cr ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(gst_amount) AS gst FROM accounting.supplier_payment_allocations WHERE company_id=bl.company_id AND bill_line_id=bl.id)pa ON true
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.supplier_refunds r JOIN purchase.supplier_credit_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=bl.company_id AND cl.bill_line_id=bl.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.purchase_gst_adjustments WHERE company_id=bl.company_id AND bill_line_id=bl.id AND gst_basis='CASH')adj ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=bl.company_id AND target_bill_line_id=bl.id)ci ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=bl.company_id AND source_bill_line_id=bl.id)co ON true;
CREATE VIEW purchase.supplier_credit_line_balances WITH(security_invoker=true) AS
 SELECT cl.*,coalesce(r.amount,0) AS refunded_amount,coalesce(a.amount,0) AS applied_amount,cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0) AS unallocated_amount,
 greatest(0,least(cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0),bl.refundable_amount)) AS refundable_amount
 FROM purchase.supplier_credit_lines cl JOIN purchase.bill_line_balances bl ON bl.company_id=cl.company_id AND bl.id=cl.bill_line_id
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM accounting.supplier_refunds WHERE company_id=cl.company_id AND credit_line_id=cl.id)r ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=cl.company_id AND credit_line_id=cl.id)a ON true;
ALTER TABLE accounting.purchase_gst_adjustments ALTER COLUMN credit_line_id DROP NOT NULL,ADD COLUMN credit_application_id uuid,
 ADD FOREIGN KEY(company_id,credit_application_id) REFERENCES purchase.credit_applications(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE accounting.purchase_gst_adjustments DROP CONSTRAINT purchase_gst_adjustments_kind_check;
ALTER TABLE accounting.purchase_gst_adjustments ADD CONSTRAINT purchase_gst_adjustments_kind_check CHECK(kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','CREDIT_APPLICATION','CREDIT_UNAPPLICATION')),
 ADD CONSTRAINT purchase_gst_adjustment_source CHECK((kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND') AND credit_line_id IS NOT NULL AND credit_application_id IS NULL) OR(kind IN('CREDIT_APPLICATION','CREDIT_UNAPPLICATION') AND credit_line_id IS NULL AND credit_application_id IS NOT NULL));
CREATE UNIQUE INDEX credit_application_gst_event ON accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id) WHERE credit_application_id IS NOT NULL;
INSERT INTO identity.permissions(code,description) VALUES('purchase.credits.apply','Apply available supplier credit to other bills'),('purchase.credits.unapply','Unapply a supplier credit application through a new contra document');
CREATE FUNCTION identity.seed_credit_application_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('purchase.credits.apply','purchase.credits.unapply') ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SUPPLIER_CREDIT_APPLICATION','SCA-'),(c,'SUPPLIER_CREDIT_UNAPPLICATION','SCU-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_credit_application_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.credit_application_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN
 IF t NOT IN('SUPPLIER_CREDIT_APPLICATION','SUPPLIER_CREDIT_UNAPPLICATION') THEN RAISE EXCEPTION 'Invalid credit application sequence' USING ERRCODE='HP422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;IF NOT FOUND THEN RAISE EXCEPTION 'Credit application sequence missing' USING ERRCODE='HP422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION purchase.credit_movement_gst(doc uuid,app uuid,bill_line uuid,movement numeric,on_date date,p_kind text,net_change numeric DEFAULT 0) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();b record;g accounting.purchase_gst_entries;desired numeric;delta numeric;BEGIN
 SELECT * INTO b FROM purchase.bill_line_balances WHERE company_id=c AND id=bill_line;
 SELECT * INTO g FROM accounting.purchase_gst_entries WHERE company_id=c AND bill_line_id=bill_line;
 b.net_paid_amount:=b.net_paid_amount+net_change;IF b.net_paid_amount<0 THEN RAISE EXCEPTION 'Target settlement has been refunded or reused; insufficient funds to unapply' USING ERRCODE='HP409';END IF;
 IF g.gst_basis<>'CASH' THEN RETURN '[]'::jsonb;END IF;
 IF b.net_paid_amount<=b.remaining_gross THEN desired:=CASE WHEN b.remaining_gross=0 THEN 0 ELSE round(b.remaining_tax*b.net_paid_amount/b.remaining_gross,2) END;
 ELSE desired:=least(g.recoverable_tax,b.remaining_tax+round((g.recoverable_tax-b.remaining_tax)*(b.net_paid_amount-b.remaining_gross)/(b.gross-b.remaining_gross),2));END IF;
 delta:=desired-b.cash_tax_balance;IF delta=0 THEN RETURN '[]'::jsonb;END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=g.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account inactive' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=g.debit_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original deferred GST account inactive' USING ERRCODE='HP422';END IF;
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_application_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,doc,bill_line,app,p_kind,'CASH',on_date,movement,delta);
 RETURN jsonb_build_array(jsonb_build_object('accountId',g.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',g.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
END $$;
CREATE FUNCTION purchase.apply_supplier_credit(note uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();cn purchase.supplier_credit_notes;today date;x jsonb;s record;t record;cb record;tb record;v numeric;total numeric:=0;lid uuid;no int:=0;aid uuid;j uuid;jl jsonb:='[]';m record;BEGIN
 PERFORM purchase.require_access('purchase.credits.apply');PERFORM purchase.require_access('purchase.credits.read');PERFORM purchase.require_access('purchase.bills.read');
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO cn FROM purchase.supplier_credit_notes WHERE company_id=c AND id=note;IF NOT FOUND THEN RAISE EXCEPTION 'Supplier credit unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=cn.supplier_id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=note AND state='POSTED' AND business_date<=today) THEN RAISE EXCEPTION 'Credit must be posted no later than application date' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Credit application requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) q GROUP BY q.value->>'creditLineId',q.value->>'billLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Reference, reason and 1..50 distinct credit/target pairs required' USING ERRCODE='HP422';END IF;
 FOR aid IN SELECT ap.id FROM accounting.ap_items ap WHERE ap.company_id=c AND(ap.bill_id=cn.bill_id OR ap.bill_id IN(SELECT bl.bill_id FROM jsonb_array_elements(items) q JOIN purchase.bill_lines bl ON bl.company_id=c AND bl.id=(q.value->>'billLineId')::uuid)) ORDER BY ap.id LOOP PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND id=aid FOR UPDATE;END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'SUPPLIER_CREDIT_APPLICATION',purchase.credit_application_number('SUPPLIER_CREDIT_APPLICATION'),today,'CONFIRMED',a);
 FOR x IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'creditLineId',value->>'billLineId' LOOP
  SELECT cl.*,b.party_id,ap.account_id INTO s FROM purchase.supplier_credit_lines cl JOIN purchase.bills b ON b.company_id=cl.company_id AND b.id=cn.bill_id JOIN accounting.ap_items ap ON ap.company_id=b.company_id AND ap.bill_id=b.id WHERE cl.company_id=c AND cl.credit_note_id=note AND cl.id=(x->>'creditLineId')::uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Credit line unavailable in this note' USING ERRCODE='HT404';END IF;
  SELECT bl.id,bl.bill_id,b.party_id,ap.account_id INTO t FROM purchase.bill_lines bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id JOIN accounting.ap_items ap ON ap.company_id=b.company_id AND ap.bill_id=b.id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id AND d.state='POSTED' AND d.business_date<=today WHERE bl.company_id=c AND bl.id=(x->>'billLineId')::uuid AND b.supplier_id=cn.supplier_id AND b.party_id=s.party_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target bill unavailable for supplier/party' USING ERRCODE='HT404';END IF;
  IF t.bill_id=cn.bill_id THEN RAISE EXCEPTION 'Target must be another bill' USING ERRCODE='HP422';END IF;
  v:=(x->>'amount')::numeric;IF v IS NULL OR v<=0 OR v<>round(v,2) OR v>999999999999999999.99 THEN RAISE EXCEPTION 'Positive gross credit amount required' USING ERRCODE='HP422';END IF;
  SELECT * INTO cb FROM purchase.supplier_credit_line_balances WHERE company_id=c AND id=s.id;SELECT * INTO tb FROM purchase.bill_line_balances WHERE company_id=c AND id=t.id;
  IF v>cb.refundable_amount OR v>tb.outstanding_amount THEN RAISE EXCEPTION 'Insufficient available credit or target AP' USING ERRCODE='HP409';END IF;
  PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id IN(s.account_id,t.account_id) AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;
  IF (SELECT count(*) FROM accounting.accounts WHERE company_id=c AND id IN(s.account_id,t.account_id) AND active AND kind='LIABILITY' AND control_kind='AP')<>(CASE WHEN s.account_id=t.account_id THEN 1 ELSE 2 END) THEN RAISE EXCEPTION 'Original AP account inactive' USING ERRCODE='HP422';END IF;
  no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,doc,no,a);
  INSERT INTO purchase.credit_application_lines(id,company_id,application_id,credit_line_id,source_bill_line_id,target_bill_line_id,amount,source_ap_account_id,target_ap_account_id) VALUES(lid,c,doc,s.id,s.bill_line_id,t.id,v,s.account_id,t.account_id);
  jl:=jl||jsonb_build_array(jsonb_build_object('accountId',s.account_id,'partyId',s.party_id,'credit',v,'sourceLineId',lid),jsonb_build_object('accountId',t.account_id,'partyId',s.party_id,'debit',v,'sourceLineId',lid));total:=total+v;
 END LOOP;
 FOR m IN SELECT bill_line_id,sum(amount) AS amount FROM(SELECT source_bill_line_id AS bill_line_id,-amount AS amount FROM purchase.credit_application_lines WHERE company_id=c AND application_id=doc UNION ALL SELECT target_bill_line_id,amount FROM purchase.credit_application_lines WHERE company_id=c AND application_id=doc)q GROUP BY bill_line_id ORDER BY bill_line_id LOOP jl:=jl||purchase.credit_movement_gst(doc,doc,m.bill_line_id,m.amount,today,'CREDIT_APPLICATION');END LOOP;
 j:=accounting.post_journal(doc,1,'SUPPLIER_CREDIT_APPLICATION',today,'Apply supplier credit to other AP',jl);
 INSERT INTO purchase.credit_applications(id,company_id,credit_note_id,supplier_id,party_id,reference,reason,amount,journal_entry_id,created_by) VALUES(doc,c,note,cn.supplier_id,s.party_id,btrim(p_reference),btrim(p_reason),total,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;
END $$;
CREATE FUNCTION purchase.unapply_supplier_credit(app uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();ca purchase.credit_applications;today date;aid uuid;m record;entry record;j uuid;jl jsonb:='[]';BEGIN
 PERFORM purchase.require_access('purchase.credits.unapply');PERFORM purchase.require_access('purchase.credits.read');PERFORM purchase.require_access('purchase.bills.read');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO ca FROM purchase.credit_applications WHERE company_id=c AND id=app;IF NOT FOUND THEN RAISE EXCEPTION 'Credit application unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=ca.supplier_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=app AND business_date>today) THEN RAISE EXCEPTION 'Unapplication cannot precede original application' USING ERRCODE='HP422';END IF;
 IF EXISTS(SELECT 1 FROM purchase.credit_unapplications WHERE company_id=c AND application_id=app) THEN RAISE EXCEPTION 'Application already unapplied' USING ERRCODE='HP409';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Unapplication reference and reason required' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Unapplication requires open accounting period' USING ERRCODE='HP422';END IF;
 FOR aid IN SELECT ap.id FROM accounting.ap_items ap WHERE ap.company_id=c AND ap.bill_id IN(SELECT bl.bill_id FROM purchase.bill_lines bl JOIN purchase.credit_application_lines l ON l.company_id=bl.company_id AND(bl.id=l.source_bill_line_id OR bl.id=l.target_bill_line_id) WHERE l.company_id=c AND l.application_id=app) ORDER BY ap.id LOOP PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND id=aid FOR UPDATE;END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'SUPPLIER_CREDIT_UNAPPLICATION',purchase.credit_application_number('SUPPLIER_CREDIT_UNAPPLICATION'),today,'CONFIRMED',a);
 FOR entry IN SELECT * FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app ORDER BY id LOOP
  IF EXISTS(SELECT 1 FROM purchase.bill_line_balances WHERE company_id=c AND id=entry.target_bill_line_id AND net_paid_amount<0) THEN RAISE EXCEPTION 'Target settlement has been refunded or reused; insufficient funds to unapply' USING ERRCODE='HP409';END IF;
  PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id IN(entry.source_ap_account_id,entry.target_ap_account_id) AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;
  IF (SELECT count(*) FROM accounting.accounts WHERE company_id=c AND id IN(entry.source_ap_account_id,entry.target_ap_account_id) AND active AND kind='LIABILITY' AND control_kind='AP')<>(CASE WHEN entry.source_ap_account_id=entry.target_ap_account_id THEN 1 ELSE 2 END) THEN RAISE EXCEPTION 'Original AP account inactive' USING ERRCODE='HP422';END IF;
  jl:=jl||jsonb_build_array(jsonb_build_object('accountId',entry.source_ap_account_id,'partyId',ca.party_id,'debit',entry.amount),jsonb_build_object('accountId',entry.target_ap_account_id,'partyId',ca.party_id,'credit',entry.amount));
 END LOOP;
 FOR m IN SELECT bill_line_id,sum(amount) AS amount FROM(SELECT source_bill_line_id AS bill_line_id,amount FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app UNION ALL SELECT target_bill_line_id,-amount FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app)q GROUP BY bill_line_id ORDER BY bill_line_id LOOP jl:=jl||purchase.credit_movement_gst(doc,app,m.bill_line_id,m.amount,today,'CREDIT_UNAPPLICATION',m.amount);END LOOP;
 j:=accounting.post_journal(doc,1,'SUPPLIER_CREDIT_UNAPPLICATION',today,'Unapply supplier credit; restore source and target AP',jl);
 INSERT INTO purchase.credit_unapplications(id,company_id,application_id,supplier_id,reference,reason,amount,journal_entry_id,created_by) VALUES(doc,c,app,ca.supplier_id,btrim(p_reference),btrim(p_reason),ca.amount,j,a);
 PERFORM accounting.contra_link((SELECT posting_batch_id FROM accounting.journal_entries WHERE company_id=c AND id=ca.journal_entry_id),j,'SUPPLIER_CREDIT_UNAPPLICATION');
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;
END $$;

CREATE OR REPLACE FUNCTION purchase.receive_supplier_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_date date) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();fid uuid:=gen_random_uuid();sid uuid;today date;on_date date;party uuid;account uuid;bank uuid;credit purchase.supplier_credit_lines;ad accounting.supplier_advances;bill purchase.bills;bal record;ge accounting.purchase_gst_entries;used numeric;available numeric;tax_used numeric;desired numeric;delta numeric:=0;source_date date;source_j uuid;original uuid;j uuid;jl jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.refunds.post');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;on_date:=coalesce(p_date,today);
 IF num_nonnulls(p_credit_line,p_advance)<>1 OR p_amount IS NULL OR p_amount<=0 OR p_amount<>round(p_amount,2) OR p_amount>999999999999999999.99 OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR on_date>today OR on_date=date '0001-01-01' THEN RAISE EXCEPTION 'One refund source, positive amount, bank reference, reason and valid date required' USING ERRCODE='HP422';END IF;
 IF p_credit_line IS NOT NULL THEN
 SELECT cn.supplier_id INTO sid FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes cn ON cn.company_id=cl.company_id AND cn.id=cl.credit_note_id WHERE cl.company_id=c AND cl.id=p_credit_line;
 ELSE SELECT supplier_id INTO sid FROM accounting.supplier_advances WHERE company_id=c AND id=p_advance;END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier refund source unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=sid FOR UPDATE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=on_date AND ends_on>on_date AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Refund requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_credit_line IS NOT NULL THEN
 SELECT * INTO credit FROM purchase.supplier_credit_lines WHERE company_id=c AND id=p_credit_line;
 SELECT * INTO bill FROM purchase.bills WHERE company_id=c AND id=(SELECT bill_id FROM purchase.bill_lines WHERE company_id=c AND id=credit.bill_line_id);
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND bill_id=bill.id FOR UPDATE;
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=credit.bill_line_id;
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO used,tax_used FROM accounting.supplier_refunds WHERE company_id=c AND credit_line_id=credit.id;
 used:=used+coalesce((SELECT sum(amount) FROM purchase.active_credit_application_lines WHERE company_id=c AND credit_line_id=credit.id),0);
 available:=least(credit.gross-used,bal.refundable_amount);
 SELECT d.business_date,cn.journal_entry_id INTO source_date,source_j FROM purchase.supplier_credit_notes cn JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=c AND cn.id=credit.credit_note_id;
 SELECT account_id INTO account FROM accounting.ap_items WHERE company_id=c AND bill_id=bill.id;party:=bill.party_id;
 IF bill.gst_basis='CASH' AND p_amount<=available THEN
 SELECT * INTO ge FROM accounting.purchase_gst_entries WHERE company_id=c AND bill_line_id=credit.bill_line_id;
 IF bal.net_paid_amount-p_amount<=bal.remaining_gross THEN desired:=CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*(bal.net_paid_amount-p_amount)/bal.remaining_gross,2) END;
 ELSE desired:=greatest(bal.remaining_tax,bal.cash_tax_balance-(round(credit.recoverable_tax*(used+p_amount)/credit.gross,2)-round(credit.recoverable_tax*used/credit.gross,2)));END IF;
 delta:=desired-bal.cash_tax_balance;
 END IF;
 ELSE
 SELECT * INTO ad FROM accounting.supplier_advances WHERE company_id=c AND id=p_advance FOR UPDATE;
 SELECT ab.available INTO available FROM accounting.supplier_advance_balances ab WHERE ab.company_id=c AND ab.id=ad.id;
 SELECT p.paid_on,p.journal_entry_id INTO source_date,source_j FROM accounting.supplier_payments p WHERE p.company_id=c AND p.id=ad.payment_id;party:=ad.party_id;account:=ad.account_id;
 END IF;
 IF p_amount>available THEN RAISE EXCEPTION 'Refund exceeds paid supplier credit or available prepayment' USING ERRCODE='HP409';END IF;
 IF on_date<source_date THEN RAISE EXCEPTION 'Refund cannot precede source credit/payment date' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=account AND active AND kind=CASE WHEN p_advance IS NULL THEN 'LIABILITY' ELSE 'ASSET' END FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund source account inactive' USING ERRCODE='HP422';END IF;
 bank:=accounting.settlement_account('BANK','ASSET','BANK');
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(fid,c,'SUPPLIER_REFUND',purchase.contra_number('SUPPLIER_REFUND'),on_date,'CONFIRMED',a);
 jl:=jsonb_build_array(jsonb_build_object('accountId',bank,'debit',p_amount),jsonb_build_object('accountId',account,'partyId',party,'credit',p_amount));
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ge.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund Input account inactive' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ge.debit_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund Deferred account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ge.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',ge.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,fid,credit.bill_line_id,credit.id,'CREDIT_REFUND','CASH',on_date,-p_amount,delta);
 END IF;
 j:=accounting.post_journal(fid,1,'SUPPLIER_REFUND',on_date,'Verified incoming supplier refund',jl);
 INSERT INTO accounting.supplier_refunds(id,company_id,supplier_id,credit_line_id,advance_id,amount,gst_amount,reference,reason,received_on,bank_account_id,journal_entry_id,created_by) VALUES(fid,c,sid,p_credit_line,p_advance,p_amount,greatest(-delta,0),btrim(p_reference),btrim(p_reason),on_date,bank,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=fid;
 SELECT posting_batch_id INTO original FROM accounting.journal_entries WHERE company_id=c AND id=source_j;PERFORM accounting.contra_link(original,j,'SUPPLIER_REFUND');RETURN fid;
END $$;


CREATE OR REPLACE FUNCTION purchase.validate_procurement_contra() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;ret purchase.returns;cn purchase.supplier_credit_notes;rf accounting.supplier_refunds;v numeric;n numeric;t numeric;original_line uuid;BEGIN
 IF TG_TABLE_NAME='purchase_gst_adjustments' THEN IF NEW.credit_application_id IS NOT NULL THEN RETURN NULL;END IF;END IF;
 IF TG_TABLE_NAME='returns' OR TG_TABLE_NAME='supplier_credit_notes' OR TG_TABLE_NAME='supplier_refunds' THEN doc:=NEW.id;ELSIF TG_TABLE_NAME='return_lines' THEN doc:=NEW.return_id;ELSIF TG_TABLE_NAME='supplier_credit_lines' THEN doc:=NEW.credit_note_id;ELSE doc:=NEW.source_document_id;END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=doc AND state='POSTED' AND document_type IN('PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND')) THEN RAISE EXCEPTION 'Procurement contra registry mismatch' USING ERRCODE='23514';END IF;
 SELECT * INTO ret FROM purchase.returns WHERE company_id=c AND id=doc;
 IF FOUND THEN
 IF NOT EXISTS(SELECT 1 FROM purchase.return_lines WHERE company_id=c AND return_id=ret.id) OR EXISTS(SELECT 1 FROM purchase.return_lines rl JOIN purchase.receipt_lines src ON src.company_id=rl.company_id AND src.id=rl.receipt_line_id WHERE rl.company_id=c AND rl.return_id=ret.id AND (src.receipt_id<>ret.receipt_id OR
 (SELECT coalesce(sum(quantity),0) FROM purchase.return_lines WHERE company_id=c AND receipt_line_id=src.id AND bill_line_id IS NULL)+(SELECT coalesce(sum(quantity),0) FROM purchase.bill_lines WHERE company_id=c AND receipt_line_id=src.id)>src.quantity OR
 (rl.bill_line_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM purchase.bill_lines bl WHERE bl.company_id=c AND bl.id=rl.bill_line_id AND bl.receipt_line_id=src.id AND bl.quantity>=(SELECT sum(quantity) FROM purchase.return_lines WHERE company_id=c AND bill_line_id=bl.id))))) THEN RAISE EXCEPTION 'Purchase return source/cap mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.return_lines WHERE company_id=c AND return_id=ret.id AND (valuation_amount>0 OR cost>0)) AND ret.journal_entry_id IS NULL THEN RAISE EXCEPTION 'Return journal missing' USING ERRCODE='23514';END IF;
 END IF;
 SELECT * INTO cn FROM purchase.supplier_credit_notes WHERE company_id=c AND id=doc;
 IF FOUND THEN
 SELECT count(*),sum(net),sum(tax) INTO v,n,t FROM purchase.supplier_credit_lines WHERE company_id=c AND credit_note_id=cn.id;
 IF v=0 OR(n,t) IS DISTINCT FROM(cn.net,cn.tax) OR (cn.gross>0 AND cn.journal_entry_id IS NULL) OR EXISTS(SELECT 1 FROM purchase.supplier_credit_lines cl JOIN purchase.return_lines rl ON rl.company_id=cl.company_id AND rl.id=cl.return_line_id JOIN purchase.bill_lines bl ON bl.company_id=cl.company_id AND bl.id=cl.bill_line_id WHERE cl.company_id=c AND cl.credit_note_id=cn.id AND (rl.bill_line_id<>bl.id OR bl.bill_id<>cn.bill_id OR (SELECT sum(quantity) FROM purchase.supplier_credit_lines WHERE company_id=c AND return_line_id=rl.id)>rl.quantity)) THEN RAISE EXCEPTION 'Supplier credit totals/source mismatch' USING ERRCODE='23514';END IF;
 END IF;
 SELECT * INTO rf FROM accounting.supplier_refunds WHERE company_id=c AND id=doc;
 IF FOUND THEN
 IF rf.advance_id IS NOT NULL AND EXISTS(SELECT 1 FROM accounting.supplier_advance_balances WHERE company_id=c AND id=rf.advance_id AND available<0) THEN RAISE EXCEPTION 'Refund overdraws prepayment' USING ERRCODE='23514';END IF;
 IF rf.credit_line_id IS NOT NULL THEN
 SELECT bill_line_id INTO original_line FROM purchase.supplier_credit_lines WHERE company_id=c AND id=rf.credit_line_id;
 IF EXISTS(SELECT 1 FROM purchase.bill_line_balances WHERE company_id=c AND id=original_line AND(net_paid_amount<0 OR cash_tax_balance<0)) OR (SELECT coalesce(sum(amount),0) FROM accounting.supplier_refunds WHERE company_id=c AND credit_line_id=rf.credit_line_id)>(SELECT gross FROM purchase.supplier_credit_lines WHERE company_id=c AND id=rf.credit_line_id) THEN RAISE EXCEPTION 'Refund exceeds source paid credit' USING ERRCODE='23514';END IF;END IF;
 END IF;
 IF coalesce(ret.journal_entry_id,cn.journal_entry_id,rf.journal_entry_id) IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=c AND je.id=coalesce(ret.journal_entry_id,cn.journal_entry_id,rf.journal_entry_id) AND pb.source_document_id=doc) THEN RAISE EXCEPTION 'Procurement contra journal mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;

ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND','SUPPLIER_CREDIT_UNAPPLICATION'));
CREATE FUNCTION purchase.guard_credit_application_document() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF OLD.state='POSTED' AND OLD.document_type IN('SUPPLIER_CREDIT_APPLICATION','SUPPLIER_CREDIT_UNAPPLICATION') THEN RAISE EXCEPTION 'Posted supplier credit applications are immutable' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER credit_application_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_credit_application_document();
CREATE FUNCTION purchase.validate_credit_application() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;app uuid;ca purchase.credit_applications;cu purchase.credit_unapplications;j uuid;typ text;party uuid;sign int:=1;BEGIN
 IF TG_TABLE_NAME='credit_applications' OR TG_TABLE_NAME='credit_unapplications' THEN doc:=NEW.id;ELSIF TG_TABLE_NAME='credit_application_lines' THEN doc:=NEW.application_id;ELSE IF NEW.credit_application_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.source_document_id;END IF;
 SELECT * INTO cu FROM purchase.credit_unapplications WHERE company_id=c AND id=doc;
 app:=coalesce(cu.application_id,doc);SELECT * INTO ca FROM purchase.credit_applications WHERE company_id=c AND id=app;
 j:=coalesce(cu.journal_entry_id,ca.journal_entry_id);typ:=CASE WHEN cu.id IS NULL THEN 'SUPPLIER_CREDIT_APPLICATION' ELSE 'SUPPLIER_CREDIT_UNAPPLICATION' END;party:=ca.party_id;IF cu.id IS NOT NULL THEN sign:=-1;END IF;
 IF ca.id IS NULL OR NOT EXISTS(SELECT 1 FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app) OR ca.amount<>(SELECT sum(amount) FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app) OR
 NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries je ON je.company_id=d.company_id AND je.id=j JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.document_type=typ AND d.state='POSTED' AND pb.source_document_id=d.id AND pb.posting_kind=typ AND je.posting_date=d.business_date) OR
 (cu.id IS NOT NULL AND(cu.amount<>ca.amount OR cu.supplier_id<>ca.supplier_id)) THEN RAISE EXCEPTION 'Credit application totals/registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.credit_application_lines l JOIN purchase.supplier_credit_lines cl ON cl.company_id=l.company_id AND cl.id=l.credit_line_id JOIN purchase.supplier_credit_notes cn ON cn.company_id=cl.company_id AND cn.id=cl.credit_note_id JOIN purchase.bill_lines bl ON bl.company_id=l.company_id AND bl.id=l.target_bill_line_id JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id JOIN accounting.ap_items ta ON ta.company_id=b.company_id AND ta.bill_id=b.id JOIN accounting.ap_items sa ON sa.company_id=cl.company_id AND sa.bill_id=cn.bill_id
 WHERE l.company_id=c AND l.application_id=app AND(cl.credit_note_id<>ca.credit_note_id OR cl.bill_line_id<>l.source_bill_line_id OR cn.supplier_id<>ca.supplier_id OR b.supplier_id<>ca.supplier_id OR sa.party_id<>party OR ta.party_id<>party OR b.id=cn.bill_id OR l.source_ap_account_id<>sa.account_id OR l.target_ap_account_id<>ta.account_id)) OR
 EXISTS(SELECT 1 FROM purchase.supplier_credit_line_balances WHERE company_id=c AND id IN(SELECT credit_line_id FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app) AND unallocated_amount<0) OR
 EXISTS(SELECT 1 FROM purchase.bill_line_balances WHERE company_id=c AND id IN(SELECT source_bill_line_id FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app UNION SELECT target_bill_line_id FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app) AND(net_paid_amount<0 OR cash_tax_balance<0 OR cash_tax_balance>recoverable_tax)) THEN RAISE EXCEPTION 'Credit allocation source or available balance mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH e AS(SELECT account_id,sum(dr) AS dr,sum(cr) AS cr FROM(
  SELECT source_ap_account_id AS account_id,CASE WHEN sign=-1 THEN amount ELSE 0 END AS dr,CASE WHEN sign=1 THEN amount ELSE 0 END AS cr FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app
  UNION ALL SELECT target_ap_account_id,CASE WHEN sign=1 THEN amount ELSE 0 END,CASE WHEN sign=-1 THEN amount ELSE 0 END FROM purchase.credit_application_lines WHERE company_id=c AND application_id=app)q GROUP BY account_id),
  a AS(SELECT l.account_id,sum(l.debit) AS dr,sum(l.credit) AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND ac.control_kind='AP' AND l.party_id=party GROUP BY l.account_id)
  SELECT 1 FROM e FULL JOIN a USING(account_id) WHERE coalesce(e.dr,0)<>coalesce(a.dr,0) OR coalesce(e.cr,0)<>coalesce(a.cr,0)) THEN RAISE EXCEPTION 'Credit allocation AP postings mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.purchase_gst_adjustments ga JOIN accounting.purchase_gst_entries ge ON ge.company_id=ga.company_id AND ge.bill_line_id=ga.bill_line_id JOIN platform.documents d ON d.company_id=ga.company_id AND d.id=doc WHERE ga.company_id=c AND ga.source_document_id=doc AND(ga.credit_application_id IS DISTINCT FROM app OR ga.kind<>CASE WHEN cu.id IS NULL THEN 'CREDIT_APPLICATION' ELSE 'CREDIT_UNAPPLICATION' END OR ga.gst_basis<>'CASH' OR ge.gst_basis<>'CASH' OR ga.adjustment_date<>d.business_date OR NOT EXISTS(SELECT 1 FROM purchase.credit_application_lines l WHERE l.company_id=c AND l.application_id=app AND ga.bill_line_id IN(l.source_bill_line_id,l.target_bill_line_id)))) THEN RAISE EXCEPTION 'Credit allocation GST source mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH e AS(SELECT account_id,sum(dr) AS dr,sum(cr) AS cr FROM(
  SELECT ge.input_account_id AS account_id,greatest(ga.gst_amount,0) AS dr,greatest(-ga.gst_amount,0) AS cr FROM accounting.purchase_gst_adjustments ga JOIN accounting.purchase_gst_entries ge ON ge.company_id=ga.company_id AND ge.bill_line_id=ga.bill_line_id WHERE ga.company_id=c AND ga.source_document_id=doc
  UNION ALL SELECT ge.debit_account_id,greatest(-ga.gst_amount,0),greatest(ga.gst_amount,0) FROM accounting.purchase_gst_adjustments ga JOIN accounting.purchase_gst_entries ge ON ge.company_id=ga.company_id AND ge.bill_line_id=ga.bill_line_id WHERE ga.company_id=c AND ga.source_document_id=doc)q GROUP BY account_id),
  a AS(SELECT l.account_id,sum(l.debit) AS dr,sum(l.credit) AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND ac.control_kind='GST' GROUP BY l.account_id)
  SELECT 1 FROM e FULL JOIN a USING(account_id) WHERE coalesce(e.dr,0)<>coalesce(a.dr,0) OR coalesce(e.cr,0)<>coalesce(a.cr,0)) THEN RAISE EXCEPTION 'Credit allocation GST postings mismatch' USING ERRCODE='23514';END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER credit_application_consistency AFTER INSERT ON purchase.credit_applications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_application_line_consistency AFTER INSERT ON purchase.credit_application_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_unapplication_consistency AFTER INSERT ON purchase.credit_unapplications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_application_gst_consistency AFTER INSERT ON accounting.purchase_gst_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_credit_application();
REVOKE ALL ON FUNCTION identity.seed_credit_application_roles(uuid),purchase.credit_application_number(text),purchase.credit_movement_gst(uuid,uuid,uuid,numeric,date,text,numeric),purchase.apply_supplier_credit(uuid,text,text,jsonb),purchase.unapply_supplier_credit(uuid,text,text),purchase.guard_credit_application_document(),purchase.validate_credit_application() FROM PUBLIC;
GRANT SELECT ON purchase.credit_applications,purchase.credit_application_lines,purchase.credit_unapplications,purchase.active_credit_application_lines,purchase.supplier_credit_line_balances TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.apply_supplier_credit(uuid,text,text,jsonb),purchase.unapply_supplier_credit(uuid,text,text) TO htt_app;

CREATE OR REPLACE FUNCTION accounting.reconciliation_checks()
RETURNS TABLE(check_code text,entity_id uuid,expected numeric,actual numeric,unit text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM accounting.require_reconciliation_access();
 RETURN QUERY
 WITH
 stock_deltas AS (
  SELECT b.id AS balance_id,o.quantity AS qty,0::numeric AS val
  FROM inventory.stock_openings o JOIN inventory.stock_balances b ON b.company_id=o.company_id AND b.warehouse_id=o.warehouse_id AND b.product_id=o.product_id WHERE o.company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,0,value FROM inventory.valuation_openings WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,base_quantity,valuation_amount FROM purchase.receipt_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
  UNION ALL SELECT stock_balance_id,-quantity,-cost FROM inventory.stock_movements WHERE company_id=core.current_company()
  UNION ALL SELECT b.id,l.base_quantity,l.cost FROM inventory.sales_return_lines l JOIN inventory.sales_returns r ON r.company_id=l.company_id AND r.id=l.return_id JOIN sales.order_lines ol ON ol.company_id=l.company_id AND ol.id=l.order_line_id JOIN inventory.stock_balances b ON b.company_id=r.company_id AND b.warehouse_id=r.warehouse_id AND b.product_id=ol.product_id WHERE l.company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,-base_quantity,-cost FROM purchase.return_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
  UNION ALL SELECT stock_balance_id,quantity_delta,value_delta FROM inventory.operation_lines WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,-quantity,-cost FROM inventory.transit_transfer_lines WHERE company_id=core.current_company()
  UNION ALL SELECT stock_balance_id,quantity,cost FROM inventory.transit_event_lines WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
 ), stock_totals AS (SELECT balance_id,sum(qty) AS qty,sum(val) AS val FROM stock_deltas GROUP BY balance_id),
 stock AS (
  SELECT b.*,v.value,coalesce(t.qty,0) AS ledger_qty,coalesce(t.val,0) AS ledger_val,
   coalesce((SELECT sum(r.remaining_quantity) FROM inventory.stock_reservations r WHERE r.company_id=b.company_id AND r.stock_balance_id=b.id),0) AS ledger_reserved
  FROM inventory.stock_balances b LEFT JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id LEFT JOIN stock_totals t ON t.balance_id=b.id WHERE b.company_id=core.current_company()
 ), gl AS (
  SELECT a.id,a.control_kind,l.party_id,sum(l.debit-l.credit) AS balance
  FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=core.current_company() GROUP BY a.id,a.control_kind,l.party_id
 ), ar_lines AS (
  SELECT il.id,i.customer_id,i.party_id,il.gross
   -coalesce((SELECT sum(p.amount) FROM accounting.payment_allocations p WHERE p.company_id=il.company_id AND p.invoice_line_id=il.id),0)
   -coalesce((SELECT sum(c.gross) FROM sales.credit_note_lines c WHERE c.company_id=il.company_id AND c.invoice_line_id=il.id),0)
   +coalesce((SELECT sum(f.amount) FROM accounting.customer_refunds f JOIN sales.credit_note_lines cl ON cl.company_id=f.company_id AND cl.id=f.credit_line_id WHERE cl.company_id=il.company_id AND cl.invoice_line_id=il.id),0) AS balance
  FROM sales.invoice_lines il JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE il.company_id=core.current_company()
 ), ar_customer AS (SELECT customer_id,sum(balance) AS balance FROM ar_lines GROUP BY customer_id),
 ar_party AS (SELECT party_id,sum(balance) AS balance FROM ar_lines GROUP BY party_id),
 customer_advances AS (
  SELECT a.id,r.customer_id,a.advance_account_id,a.clearing_account_id,a.amount
   -coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)
   -coalesce((SELECT sum(f.amount) FROM accounting.customer_refunds f WHERE f.company_id=a.company_id AND f.advance_id=a.id),0) AS balance
  FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=core.current_company()
 ), unbilled AS (SELECT customer_id,sum(amount-released_amount) AS balance FROM sales.credit_commitments WHERE company_id=core.current_company() GROUP BY customer_id),
 ap_party AS (SELECT party_id,sum(outstanding_amount-available_credit) AS balance FROM accounting.ap_balances WHERE company_id=core.current_company() GROUP BY party_id),
 transit_accounts AS (
  SELECT transit_account_id AS id FROM inventory.transit_transfers WHERE company_id=core.current_company() AND transit_account_id IS NOT NULL
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='INVENTORY_TRANSIT'
 ), advance_accounts AS (
  SELECT advance_account_id AS id FROM customer_advances
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='CUSTOMER_ADVANCES'
 ), supplier_advance_accounts AS (
  SELECT account_id AS id FROM accounting.supplier_advances WHERE company_id=core.current_company()
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='SUPPLIER_ADVANCES'
 ), return_accounts AS (
  SELECT contra_account_id AS id FROM purchase.return_lines WHERE company_id=core.current_company() AND bill_line_id IS NOT NULL AND contra_account_id IS NOT NULL
  UNION SELECT account_id FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='PURCHASE_RETURN_CLEARING'
 ), grni_party AS (
  SELECT g.party_id,sum(g.amount
   -coalesce((SELECT sum(b.grni_amount) FROM purchase.bill_lines b WHERE b.company_id=g.company_id AND b.grni_item_id=g.id),0)
   -coalesce((SELECT sum(r.valuation_amount) FROM purchase.return_lines r WHERE r.company_id=g.company_id AND r.receipt_line_id=g.receipt_line_id AND r.bill_line_id IS NULL),0)) AS balance
  FROM accounting.grni_items g WHERE g.company_id=core.current_company() GROUP BY g.party_id
 ), checks AS (
  SELECT 'stock.quantity'::text AS code,s.id AS entity,s.ledger_qty AS e,s.on_hand AS a,'BASE_QUANTITY'::text AS u FROM stock s
  UNION ALL SELECT 'stock.value',s.id,s.ledger_val,coalesce(s.value,0),'AUD' FROM stock s
  UNION ALL SELECT 'stock.valuation_missing',s.id,1,CASE WHEN s.value IS NULL THEN 0 ELSE 1 END,'COUNT' FROM stock s WHERE s.on_hand>0
  UNION ALL SELECT 'stock.reserved',s.id,s.ledger_reserved,s.reserved,'BASE_QUANTITY' FROM stock s
  UNION ALL SELECT 'reservation.consumed',r.id,coalesce((SELECT sum(m.quantity) FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id WHERE pl.company_id=r.company_id AND pl.order_line_id=r.order_line_id),0),r.consumed_quantity,'BASE_QUANTITY' FROM inventory.stock_reservations r WHERE r.company_id=core.current_company()
  UNION ALL SELECT 'credit.receivable',c.id,coalesce(a.balance,0),coalesce(x.receivable,0),'AUD' FROM crm.customers c LEFT JOIN ar_customer a ON a.customer_id=c.id LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.unbilled',c.id,coalesce(b.balance,0),coalesce(x.unbilled_orders,0),'AUD' FROM crm.customers c LEFT JOIN unbilled b ON b.customer_id=c.id LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.advances',c.id,coalesce((SELECT sum(balance) FROM customer_advances ad WHERE ad.customer_id=c.id),0),coalesce(x.available_advances,0),'AUD' FROM crm.customers c LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.projection_missing',c.id,1,CASE WHEN x.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM crm.customers c LEFT JOIN crm.customer_credit_exposures x ON x.company_id=c.company_id AND x.customer_id=c.id WHERE c.company_id=core.current_company()
  UNION ALL SELECT 'credit.commitment',co.id,CASE WHEN d.state='CANCELLED' THEN 0 ELSE o.gross-coalesce((SELECT sum(i.gross) FROM sales.invoices i WHERE i.company_id=co.company_id AND i.order_id=o.id),0)-coalesce((SELECT sum(r.cancelled_gross) FROM inventory.sales_return_lines r JOIN sales.order_lines ol ON ol.company_id=r.company_id AND ol.id=r.order_line_id WHERE ol.company_id=co.company_id AND ol.order_id=o.id AND r.invoice_line_id IS NULL),0) END,co.amount-co.released_amount,'AUD' FROM sales.credit_commitments co JOIN sales.orders o ON o.company_id=co.company_id AND o.id=co.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE co.company_id=core.current_company()
  UNION ALL SELECT 'invoice.lines',i.id,i.gross,coalesce((SELECT sum(l.gross) FROM sales.invoice_lines l WHERE l.company_id=i.company_id AND l.invoice_id=i.id),0),'AUD' FROM sales.invoices i WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'invoice.receivable',i.id,i.gross,coalesce(r.amount,0),'AUD' FROM sales.invoices i LEFT JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'invoice.receivable_missing',i.id,1,CASE WHEN r.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM sales.invoices i LEFT JOIN accounting.receivable_items r ON r.company_id=i.company_id AND r.invoice_id=i.id WHERE i.company_id=core.current_company()
  UNION ALL SELECT 'bill.lines',b.id,b.gross,coalesce((SELECT sum(l.net+l.tax) FROM purchase.bill_lines l WHERE l.company_id=b.company_id AND l.bill_id=b.id),0),'AUD' FROM purchase.bills b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'bill.payable',b.id,b.gross,coalesce(a.amount,0),'AUD' FROM purchase.bills b LEFT JOIN accounting.ap_items a ON a.company_id=b.company_id AND a.bill_id=b.id WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'bill.payable_missing',b.id,1,CASE WHEN a.id IS NULL THEN 0 ELSE 1 END,'COUNT' FROM purchase.bills b LEFT JOIN accounting.ap_items a ON a.company_id=b.company_id AND a.bill_id=b.id WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'gl.inventory',core.current_company(),coalesce((SELECT sum(value) FROM stock),0)+coalesce((SELECT sum(remaining_cost) FROM inventory.transit_line_balances WHERE company_id=core.current_company()),0),coalesce((SELECT sum(balance) FROM gl WHERE control_kind='INVENTORY'),0),'AUD'
  UNION ALL SELECT 'gl.transit',ta.id,coalesce((SELECT sum(b.remaining_cost) FROM inventory.transit_line_balances b JOIN inventory.transit_transfers t ON t.company_id=b.company_id AND t.id=b.transfer_id WHERE b.company_id=core.current_company() AND t.transit_account_id=ta.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=ta.id),0),'AUD' FROM transit_accounts ta
  UNION ALL SELECT 'gl.receivable',p.id,coalesce(a.balance,0),coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AR' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN ar_party a ON a.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.receivable_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AR' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.payable',p.id,coalesce(a.balance,0),-coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AP' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN ap_party a ON a.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.payable_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='AP' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.grni',p.id,coalesce(g.balance,0),-coalesce((SELECT sum(balance) FROM gl WHERE control_kind='GRNI' AND party_id=p.id),0),'AUD' FROM crm.parties p LEFT JOIN grni_party g ON g.party_id=p.id WHERE p.company_id=core.current_company()
  UNION ALL SELECT 'gl.grni_unassigned',core.current_company(),0,coalesce((SELECT sum(balance) FROM gl WHERE control_kind='GRNI' AND party_id IS NULL),0),'AUD'
  UNION ALL SELECT 'gl.customer_advances',aa.id,coalesce((SELECT sum(balance) FROM customer_advances WHERE advance_account_id=aa.id),0),-coalesce((SELECT sum(balance) FROM gl WHERE id=aa.id),0),'AUD' FROM advance_accounts aa
  UNION ALL SELECT 'gl.supplier_advances',aa.id,coalesce((SELECT sum(available) FROM accounting.supplier_advance_balances WHERE company_id=core.current_company() AND account_id=aa.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=aa.id),0),'AUD' FROM supplier_advance_accounts aa
  UNION ALL SELECT 'gl.purchase_return_clearing',ra.id,coalesce((SELECT sum(r.valuation_amount-coalesce((SELECT sum(cl.net+cl.tax-cl.recoverable_tax) FROM purchase.supplier_credit_lines cl WHERE cl.company_id=r.company_id AND cl.return_line_id=r.id),0)) FROM purchase.return_lines r WHERE r.company_id=core.current_company() AND r.bill_line_id IS NOT NULL AND r.contra_account_id=ra.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=ra.id),0),'AUD' FROM return_accounts ra
  UNION ALL SELECT 'journal.balance',j.id,0,coalesce(sum(l.debit-l.credit),0),'AUD' FROM accounting.journal_entries j LEFT JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id WHERE j.company_id=core.current_company() GROUP BY j.id
  UNION ALL SELECT 'journal.lines',j.id,1,CASE WHEN count(l.id)>=2 THEN 1 ELSE 0 END,'COUNT' FROM accounting.journal_entries j LEFT JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id WHERE j.company_id=core.current_company() GROUP BY j.id
  UNION ALL SELECT 'journal.batch_entry',b.id,1,count(j.id)::numeric,'COUNT' FROM accounting.posting_batches b LEFT JOIN accounting.journal_entries j ON j.company_id=b.company_id AND j.posting_batch_id=b.id WHERE b.company_id=core.current_company() GROUP BY b.id

  UNION ALL SELECT 'credit_application.total',a.id,a.amount,coalesce((SELECT sum(amount) FROM purchase.credit_application_lines WHERE company_id=a.company_id AND application_id=a.id),0),'AUD' FROM purchase.credit_applications a WHERE a.company_id=core.current_company()
  UNION ALL SELECT 'credit_unapplication.total',u.id,a.amount,u.amount,'AUD' FROM purchase.credit_unapplications u JOIN purchase.credit_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'credit_application.capacity',cl.id,0,greatest(0,-cl.unallocated_amount),'AUD' FROM purchase.supplier_credit_line_balances cl WHERE cl.company_id=core.current_company()
  UNION ALL SELECT 'credit_application.funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM purchase.bill_line_balances b WHERE b.company_id=core.current_company() AND EXISTS(SELECT 1 FROM purchase.credit_application_lines l WHERE l.company_id=b.company_id AND b.id IN(l.source_bill_line_id,l.target_bill_line_id))
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
