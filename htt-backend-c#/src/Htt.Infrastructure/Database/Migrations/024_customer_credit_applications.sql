-- Customer AR credit transfers preserve original collections, credit exposures and accrued GST GL.
CREATE TABLE sales.credit_applications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),credit_note_id uuid NOT NULL,customer_id uuid NOT NULL,party_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,credit_note_id) REFERENCES sales.credit_notes(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE INDEX ON sales.credit_applications(company_id,credit_note_id,created_at DESC,id);
CREATE UNIQUE INDEX credit_application_reference ON sales.credit_applications(company_id,customer_id,lower(btrim(reference)));
CREATE TABLE sales.credit_application_lines(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),application_id uuid NOT NULL,credit_line_id uuid NOT NULL,source_invoice_line_id uuid NOT NULL,target_invoice_line_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),source_ar_account_id uuid NOT NULL,target_ar_account_id uuid NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,application_id,credit_line_id,target_invoice_line_id),CHECK(source_invoice_line_id<>target_invoice_line_id),FOREIGN KEY(company_id,id,application_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,application_id) REFERENCES sales.credit_applications(company_id,id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,credit_line_id) REFERENCES sales.credit_note_lines(company_id,id),FOREIGN KEY(company_id,source_invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),FOREIGN KEY(company_id,target_invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),FOREIGN KEY(company_id,source_ar_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,target_ar_account_id) REFERENCES accounting.accounts(company_id,id)
);
CREATE INDEX ON sales.credit_application_lines(company_id,credit_line_id);CREATE INDEX ON sales.credit_application_lines(company_id,source_invoice_line_id);CREATE INDEX ON sales.credit_application_lines(company_id,target_invoice_line_id);
CREATE TABLE sales.credit_unapplications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),application_id uuid NOT NULL,customer_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,application_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,application_id) REFERENCES sales.credit_applications(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) DEFERRABLE INITIALLY DEFERRED
);
CREATE UNIQUE INDEX credit_unapplication_reference ON sales.credit_unapplications(company_id,customer_id,lower(btrim(reference)));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['credit_applications','credit_application_lines','credit_unapplications'] LOOP
 EXECUTE format('ALTER TABLE sales.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE sales.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON sales.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON sales.%I(company_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON sales.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
END LOOP;END $$;

CREATE VIEW sales.active_credit_application_lines WITH(security_invoker=true) AS SELECT l.* FROM sales.credit_application_lines l WHERE NOT EXISTS(SELECT 1 FROM sales.credit_unapplications u WHERE u.company_id=l.company_id AND u.application_id=l.application_id);
CREATE VIEW accounting.invoice_ar_accounts WITH(security_invoker=true) AS
 SELECT r.company_id,r.invoice_id,r.customer_id,r.party_id,a.account_id FROM accounting.receivable_items r
 LEFT JOIN LATERAL(SELECT l.account_id FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=r.company_id AND l.journal_entry_id=r.journal_entry_id AND ac.control_kind='AR' AND l.debit>0 ORDER BY l.id LIMIT 1)a ON true;
CREATE VIEW sales.invoice_line_balances WITH(security_invoker=true) AS
 SELECT l.*,i.customer_id,i.party_id,i.gst_basis,i.order_id,i.invoice_date,a.account_id AS ar_account_id,
 coalesce(cr.gross,0) AS credited_amount,coalesce(cr.tax,0) AS credited_tax,coalesce(pa.amount,0) AS paid_amount,coalesce(rf.amount,0) AS refunded_amount,
 l.gross-coalesce(cr.gross,0) AS remaining_gross,l.tax-coalesce(cr.tax,0) AS remaining_tax,
 coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0) AS net_paid_amount,
 greatest(0,l.gross-coalesce(cr.gross,0)-coalesce(pa.amount,0)+coalesce(rf.amount,0)-coalesce(ci.amount,0)+coalesce(co.amount,0)) AS outstanding_amount,
 greatest(0,coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0)-l.gross+coalesce(cr.gross,0)) AS refundable_amount,
 coalesce(pa.gst,0)+coalesce(ga.gst,0) AS cash_tax_balance,coalesce(ci.amount,0) AS credit_received_amount,coalesce(co.amount,0) AS credit_used_amount
 FROM sales.invoice_lines l JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id JOIN accounting.invoice_ar_accounts a ON a.company_id=i.company_id AND a.invoice_id=i.id
 LEFT JOIN LATERAL(SELECT sum(gross) AS gross,sum(tax) AS tax FROM sales.credit_note_lines WHERE company_id=l.company_id AND invoice_line_id=l.id)cr ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(gst_amount) AS gst FROM accounting.payment_allocations WHERE company_id=l.company_id AND invoice_line_id=l.id)pa ON true
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=l.company_id AND cl.invoice_line_id=l.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.gst_adjustments WHERE company_id=l.company_id AND invoice_line_id=l.id AND gst_basis='CASH')ga ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND target_invoice_line_id=l.id)ci ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND source_invoice_line_id=l.id)co ON true;
CREATE VIEW sales.customer_credit_line_balances WITH(security_invoker=true) AS
 SELECT cl.*,b.customer_id,b.party_id,coalesce(r.amount,0) AS refunded_amount,coalesce(a.amount,0) AS applied_amount,cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0) AS unallocated_amount,
 greatest(0,least(cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0),b.refundable_amount)) AS available_apply_amount
 FROM sales.credit_note_lines cl JOIN sales.invoice_line_balances b ON b.company_id=cl.company_id AND b.id=cl.invoice_line_id
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM accounting.customer_refunds WHERE company_id=cl.company_id AND credit_line_id=cl.id)r ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=cl.company_id AND credit_line_id=cl.id)a ON true;
ALTER TABLE accounting.gst_adjustments ADD COLUMN customer_credit_application_id uuid,
 ADD FOREIGN KEY(company_id,customer_credit_application_id) REFERENCES sales.credit_applications(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE accounting.gst_adjustments DROP CONSTRAINT gst_adjustments_kind_check;
ALTER TABLE accounting.gst_adjustments ADD CONSTRAINT gst_adjustments_kind_check CHECK(kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','ADVANCE_REFUND','UNBILLED_RETURN','CREDIT_APPLICATION','CREDIT_UNAPPLICATION')),
 ADD CONSTRAINT customer_credit_gst_source CHECK((kind NOT IN('CREDIT_APPLICATION','CREDIT_UNAPPLICATION') AND customer_credit_application_id IS NULL) OR(kind IN('CREDIT_APPLICATION','CREDIT_UNAPPLICATION') AND customer_credit_application_id IS NOT NULL AND invoice_line_id IS NOT NULL AND credit_line_id IS NULL AND advance_id IS NULL AND return_line_id IS NULL AND gst_basis='CASH'));
INSERT INTO identity.permissions(code,description) VALUES('sales.credits.apply','Apply available customer credit to another invoice'),('sales.credits.unapply','Unapply customer credit through a new contra document');
CREATE OR REPLACE FUNCTION identity.seed_sales_roles(p_company uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT p_company,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p
 WHERE r.company_id=p_company AND (
  (r.code='ADMIN' AND (p.code LIKE 'sales.%' OR p.code IN ('inventory.read','inventory.opening.write'))) OR
  (r.code='OFFICE' AND ((p.code LIKE 'sales.%' AND p.code NOT IN('sales.credits.apply','sales.credits.unapply')) OR p.code='inventory.read')) OR
  (r.code='SALES' AND p.code IN ('sales.quotes.read','sales.quotes.write','sales.quotes.price.override','sales.orders.read','inventory.read')) OR
  (r.code IN ('WAREHOUSE','PROCUREMENT') AND p.code='inventory.read') OR
  (r.code='FINANCE' AND p.code IN ('sales.orders.read','sales.credit.read')))
 ON CONFLICT(company_id,role_id,permission_code) DO NOTHING;
END $$;

CREATE FUNCTION identity.seed_customer_credit_application_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('sales.credits.apply','sales.credits.unapply') ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'CUSTOMER_CREDIT_APPLICATION','CCA-'),(c,'CUSTOMER_CREDIT_UNAPPLICATION','CCU-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_customer_credit_application_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION sales.customer_credit_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN
 IF t NOT IN('CUSTOMER_CREDIT_APPLICATION','CUSTOMER_CREDIT_UNAPPLICATION') THEN RAISE EXCEPTION 'Invalid customer credit sequence' USING ERRCODE='HR422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;IF NOT FOUND THEN RAISE EXCEPTION 'Customer credit sequence missing' USING ERRCODE='HR422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION sales.credit_movement_gst(doc uuid,app uuid,invoice_line uuid,movement numeric,on_date date,p_kind text,net_change numeric DEFAULT 0) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();b record;desired numeric;delta numeric;BEGIN
 SELECT * INTO b FROM sales.invoice_line_balances WHERE company_id=c AND id=invoice_line;
 b.net_paid_amount:=b.net_paid_amount+net_change;IF b.net_paid_amount<0 THEN RAISE EXCEPTION 'Target funds have been refunded or reused; insufficient settlement to unapply' USING ERRCODE='HR409';END IF;
 IF b.gst_basis<>'CASH' THEN RETURN;END IF;
 IF b.net_paid_amount<=b.remaining_gross THEN desired:=CASE WHEN b.remaining_gross=0 THEN 0 ELSE round(b.remaining_tax*b.net_paid_amount/b.remaining_gross,2) END;
 ELSE desired:=least(b.tax,b.remaining_tax+round((b.tax-b.remaining_tax)*(b.net_paid_amount-b.remaining_gross)/(b.gross-b.remaining_gross),2));END IF;
 delta:=desired-b.cash_tax_balance;IF delta<>0 THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,customer_credit_application_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,invoice_line,app,p_kind,'CASH',on_date,b.tax_code_id,movement,delta);END IF;
END $$;
CREATE FUNCTION sales.apply_customer_credit(note uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();cn record;today date;x jsonb;s record;t record;cb record;tb record;v numeric;total numeric:=0;lid uuid;no int:=0;aid uuid;j uuid;jl jsonb:='[]';m record;BEGIN
 PERFORM purchase.require_access('sales.credits.apply');PERFORM purchase.require_access('sales.credits.read');PERFORM purchase.require_access('accounting.receivables.read');
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT n.*,i.customer_id,i.party_id,i.order_id INTO cn FROM sales.credit_notes n JOIN sales.invoices i ON i.company_id=n.company_id AND i.id=n.invoice_id WHERE n.company_id=c AND n.id=note;IF NOT FOUND THEN RAISE EXCEPTION 'Customer credit unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.credits.apply',cn.customer_id);PERFORM sales.require_customer_access('sales.credits.read',cn.customer_id);PERFORM sales.require_customer_access('accounting.receivables.read',cn.customer_id);
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=note AND state='POSTED' AND business_date<=today) THEN RAISE EXCEPTION 'Credit must be posted no later than application date' USING ERRCODE='HR422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Credit application requires open accounting period' USING ERRCODE='HR422';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) q GROUP BY q.value->>'creditLineId',q.value->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Reference, reason and 1..50 distinct credit/target pairs required' USING ERRCODE='HR422';END IF;
 FOR aid IN SELECT DISTINCT i.order_id FROM sales.invoices i WHERE i.company_id=c AND(i.id=cn.invoice_id OR i.id IN(SELECT il.invoice_id FROM jsonb_array_elements(items) q JOIN sales.invoice_lines il ON il.company_id=c AND il.id=(q.value->>'invoiceLineId')::uuid)) ORDER BY i.order_id LOOP PERFORM 1 FROM platform.documents WHERE company_id=c AND id=aid FOR UPDATE;END LOOP;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=cn.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(cn.customer_id);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'CUSTOMER_CREDIT_APPLICATION',sales.customer_credit_number('CUSTOMER_CREDIT_APPLICATION'),today,'CONFIRMED',a);
 FOR x IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'creditLineId',value->>'invoiceLineId' LOOP
  SELECT cl.*,b.party_id,ap.account_id INTO s FROM sales.credit_note_lines cl JOIN sales.invoices b ON b.company_id=cl.company_id AND b.id=cn.invoice_id JOIN accounting.invoice_ar_accounts ap ON ap.company_id=b.company_id AND ap.invoice_id=b.id WHERE cl.company_id=c AND cl.credit_note_id=note AND cl.id=(x->>'creditLineId')::uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Credit line unavailable in this note' USING ERRCODE='HT404';END IF;
  SELECT bl.id,bl.invoice_id,b.party_id,ap.account_id INTO t FROM sales.invoice_lines bl JOIN sales.invoices b ON b.company_id=bl.company_id AND b.id=bl.invoice_id JOIN accounting.invoice_ar_accounts ap ON ap.company_id=b.company_id AND ap.invoice_id=b.id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id AND d.state='POSTED' AND d.business_date<=today WHERE bl.company_id=c AND bl.id=(x->>'invoiceLineId')::uuid AND b.customer_id=cn.customer_id AND b.party_id=s.party_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target invoice unavailable for customer/party' USING ERRCODE='HT404';END IF;
  IF t.invoice_id=cn.invoice_id THEN RAISE EXCEPTION 'Target must be another invoice' USING ERRCODE='HR422';END IF;
  v:=(x->>'amount')::numeric;IF v IS NULL OR v<=0 OR v<>round(v,2) OR v>999999999999999999.99 THEN RAISE EXCEPTION 'Positive gross credit amount required' USING ERRCODE='HR422';END IF;
  SELECT * INTO cb FROM sales.customer_credit_line_balances WHERE company_id=c AND id=s.id;SELECT * INTO tb FROM sales.invoice_line_balances WHERE company_id=c AND id=t.id;
  IF v>cb.available_apply_amount OR v>tb.outstanding_amount THEN RAISE EXCEPTION 'Insufficient available credit or target AR' USING ERRCODE='HR409';END IF;
  PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id IN(s.account_id,t.account_id) AND active AND kind='ASSET' AND control_kind='AR' FOR SHARE;
  IF (SELECT count(*) FROM accounting.accounts WHERE company_id=c AND id IN(s.account_id,t.account_id) AND active AND kind='ASSET' AND control_kind='AR')<>(CASE WHEN s.account_id=t.account_id THEN 1 ELSE 2 END) THEN RAISE EXCEPTION 'Original AR account inactive' USING ERRCODE='HR422';END IF;
  no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,doc,no,a);
  INSERT INTO sales.credit_application_lines(id,company_id,application_id,credit_line_id,source_invoice_line_id,target_invoice_line_id,amount,source_ar_account_id,target_ar_account_id) VALUES(lid,c,doc,s.id,s.invoice_line_id,t.id,v,s.account_id,t.account_id);
  jl:=jl||jsonb_build_array(jsonb_build_object('accountId',s.account_id,'partyId',s.party_id,'debit',v,'sourceLineId',lid),jsonb_build_object('accountId',t.account_id,'partyId',s.party_id,'credit',v,'sourceLineId',lid));total:=total+v;
 END LOOP;
 FOR m IN SELECT invoice_line_id,sum(amount) AS amount FROM(SELECT source_invoice_line_id AS invoice_line_id,-amount AS amount FROM sales.credit_application_lines WHERE company_id=c AND application_id=doc UNION ALL SELECT target_invoice_line_id,amount FROM sales.credit_application_lines WHERE company_id=c AND application_id=doc)q GROUP BY invoice_line_id ORDER BY invoice_line_id LOOP PERFORM sales.credit_movement_gst(doc,doc,m.invoice_line_id,m.amount,today,'CREDIT_APPLICATION');END LOOP;
 j:=accounting.post_journal(doc,1,'CUSTOMER_CREDIT_APPLICATION',today,'Apply customer credit to other AR',jl);
 INSERT INTO sales.credit_applications(id,company_id,credit_note_id,customer_id,party_id,reference,reason,amount,journal_entry_id,created_by) VALUES(doc,c,note,cn.customer_id,s.party_id,btrim(p_reference),btrim(p_reason),total,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;
END $$;
CREATE FUNCTION sales.unapply_customer_credit(app uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();ca sales.credit_applications;today date;aid uuid;m record;entry record;j uuid;jl jsonb:='[]';BEGIN
 PERFORM purchase.require_access('sales.credits.unapply');PERFORM purchase.require_access('sales.credits.read');PERFORM purchase.require_access('accounting.receivables.read');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO ca FROM sales.credit_applications WHERE company_id=c AND id=app;IF NOT FOUND THEN RAISE EXCEPTION 'Credit application unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.credits.unapply',ca.customer_id);PERFORM sales.require_customer_access('sales.credits.read',ca.customer_id);PERFORM sales.require_customer_access('accounting.receivables.read',ca.customer_id);
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=app AND business_date>today) THEN RAISE EXCEPTION 'Unapplication cannot precede original application' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_unapplications WHERE company_id=c AND application_id=app) THEN RAISE EXCEPTION 'Application already unapplied' USING ERRCODE='HR409';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Unapplication reference and reason required' USING ERRCODE='HR422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Unapplication requires open accounting period' USING ERRCODE='HR422';END IF;
 FOR aid IN SELECT DISTINCT i.order_id FROM sales.invoices i JOIN sales.invoice_lines il ON il.company_id=i.company_id AND il.invoice_id=i.id JOIN sales.credit_application_lines l ON l.company_id=il.company_id AND(il.id=l.source_invoice_line_id OR il.id=l.target_invoice_line_id) WHERE l.company_id=c AND l.application_id=app ORDER BY i.order_id LOOP PERFORM 1 FROM platform.documents WHERE company_id=c AND id=aid FOR UPDATE;END LOOP;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=ca.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(ca.customer_id);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_unapplications WHERE company_id=c AND application_id=app) THEN RAISE EXCEPTION 'Application already unapplied' USING ERRCODE='HR409';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'CUSTOMER_CREDIT_UNAPPLICATION',sales.customer_credit_number('CUSTOMER_CREDIT_UNAPPLICATION'),today,'CONFIRMED',a);
 FOR entry IN SELECT * FROM sales.credit_application_lines WHERE company_id=c AND application_id=app ORDER BY id LOOP
  IF EXISTS(SELECT 1 FROM sales.invoice_line_balances WHERE company_id=c AND id=entry.target_invoice_line_id AND net_paid_amount<0) THEN RAISE EXCEPTION 'Target settlement has been refunded or reused; insufficient funds to unapply' USING ERRCODE='HR409';END IF;
  PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id IN(entry.source_ar_account_id,entry.target_ar_account_id) AND active AND kind='ASSET' AND control_kind='AR' FOR SHARE;
  IF (SELECT count(*) FROM accounting.accounts WHERE company_id=c AND id IN(entry.source_ar_account_id,entry.target_ar_account_id) AND active AND kind='ASSET' AND control_kind='AR')<>(CASE WHEN entry.source_ar_account_id=entry.target_ar_account_id THEN 1 ELSE 2 END) THEN RAISE EXCEPTION 'Original AR account inactive' USING ERRCODE='HR422';END IF;
  jl:=jl||jsonb_build_array(jsonb_build_object('accountId',entry.source_ar_account_id,'partyId',ca.party_id,'credit',entry.amount),jsonb_build_object('accountId',entry.target_ar_account_id,'partyId',ca.party_id,'debit',entry.amount));
 END LOOP;
 FOR m IN SELECT invoice_line_id,sum(amount) AS amount FROM(SELECT source_invoice_line_id AS invoice_line_id,amount FROM sales.credit_application_lines WHERE company_id=c AND application_id=app UNION ALL SELECT target_invoice_line_id,-amount FROM sales.credit_application_lines WHERE company_id=c AND application_id=app)q GROUP BY invoice_line_id ORDER BY invoice_line_id LOOP PERFORM sales.credit_movement_gst(doc,app,m.invoice_line_id,m.amount,today,'CREDIT_UNAPPLICATION',m.amount);END LOOP;
 j:=accounting.post_journal(doc,1,'CUSTOMER_CREDIT_UNAPPLICATION',today,'Unapply customer credit; restore source and target AR',jl);
 INSERT INTO sales.credit_unapplications(id,company_id,application_id,customer_id,reference,reason,amount,journal_entry_id,created_by) VALUES(doc,c,app,ca.customer_id,btrim(p_reference),btrim(p_reason),ca.amount,j,a);
 PERFORM accounting.contra_link((SELECT posting_batch_id FROM accounting.journal_entries WHERE company_id=c AND id=ca.journal_entry_id),j,'CUSTOMER_CREDIT_UNAPPLICATION');
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;
END $$;


CREATE OR REPLACE FUNCTION accounting.allocate_payment(doc uuid,rid uuid,aid uuid,cust uuid,items jsonb,cash_date date,expected_order_line uuid DEFAULT NULL) RETURNS numeric
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();x jsonb;l record;paid numeric;tax_paid numeric;v numeric;t numeric;total_tax numeric:=0;charge numeric;charge_tax numeric;
BEGIN
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) z GROUP BY z->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate invoice line' USING ERRCODE='HR422';END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'invoiceLineId' LOOP
 SELECT il.*,i.customer_id,i.gst_basis,i.invoice_date FROM sales.invoice_lines il JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE il.company_id=c AND il.id=(x->>'invoiceLineId')::uuid INTO l;
 IF NOT FOUND OR l.customer_id<>cust THEN RAISE EXCEPTION 'Invoice line unavailable for this customer' USING ERRCODE='HT404';END IF;
 IF expected_order_line IS NOT NULL AND l.order_line_id<>expected_order_line THEN RAISE EXCEPTION 'Advance belongs to a different order line' USING ERRCODE='HR422';END IF;
 IF aid IS NULL AND l.gst_basis='NON_CASH' AND cash_date<l.invoice_date THEN RAISE EXCEPTION 'Earlier non-cash consideration requires a prepayment tax review' USING ERRCODE='HR422';END IF;
 v:=(x->>'amount')::numeric;
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO paid,tax_paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=l.id;
 SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=l.id;charge:=l.gross-accounting.line_credited(l.id);
 SELECT l.tax-coalesce(sum(cl.tax),0) INTO charge_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid+v>charge THEN RAISE EXCEPTION 'Allocation exceeds invoice balance' USING ERRCODE='HR409';END IF;
 t:=greatest(0,round(charge_tax*(paid+v)/charge,2)-CASE WHEN l.gst_basis='CASH' THEN accounting.cash_tax_balance(l.id) ELSE CASE WHEN EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND l.id IN(source_invoice_line_id,target_invoice_line_id)) THEN round(charge_tax*paid/charge,2) ELSE tax_paid END END);
 INSERT INTO accounting.payment_allocations(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,v,t);
 IF l.gst_basis='CASH' THEN
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,CASE WHEN aid IS NULL THEN 'CASH_RECEIPT' ELSE 'ADVANCE_APPLIED' END,'CASH',cash_date,l.tax_code_id,v,t);
 END IF;total_tax:=total_tax+t;
 END LOOP;RETURN total_tax;END $$;


CREATE OR REPLACE FUNCTION sales.post_credit_note(p_invoice uuid,p_reason text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();i sales.invoices;today date;entry jsonb;l record;ret inventory.sales_return_lines;
 qty numeric;used numeric;used_n numeric;used_t numeric;n numeric;t numeric;total_n numeric:=0;total_t numeric:=0;built jsonb:='[]';posts jsonb:='[]';no int:=0;lid uuid;ar uuid;revenue uuid;output uuid;orig_batch uuid;j uuid;paid numeric;refunded numeric;cash_tax numeric;target_tax numeric;new_gross numeric;new_tax numeric;
BEGIN
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=p_invoice;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.credits.write',i.customer_id);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=i.order_id FOR UPDATE;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=i.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(i.customer_id);
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit note requires open period' USING ERRCODE='HR422';END IF;
 IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) v GROUP BY v->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Credit requires reason and distinct invoice lines' USING ERRCODE='HR422';END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'invoiceLineId' LOOP
 SELECT il.*,ol.item_type INTO l FROM sales.invoice_lines il JOIN sales.order_lines ol ON ol.company_id=il.company_id AND ol.id=il.order_line_id WHERE il.company_id=c AND il.invoice_id=p_invoice AND il.id=(entry->>'invoiceLineId')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit invoice line unavailable' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Credit quantity violates frozen sales step' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO used,used_n,used_t FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=l.id;
 IF qty+used>l.quantity THEN RAISE EXCEPTION 'Credit exceeds invoice quantity' USING ERRCODE='HR409';END IF;
 IF l.item_type='STOCK' THEN
 SELECT * INTO ret FROM inventory.sales_return_lines WHERE company_id=c AND id=nullif(entry->>'returnLineId','')::uuid AND invoice_line_id=l.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock credit requires matching received return' USING ERRCODE='HR422';END IF;
 IF qty>ret.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=c AND return_line_id=ret.id),0) THEN RAISE EXCEPTION 'Return already credited or quantity exceeds return' USING ERRCODE='HR409';END IF;
 ELSIF nullif(entry->>'returnLineId','') IS NOT NULL THEN RAISE EXCEPTION 'Non-stock credit must not reference stock return' USING ERRCODE='HR422';END IF;
 n:=round(l.net*(used+qty)/l.quantity,2)-used_n;t:=round(l.tax*(used+qty)/l.quantity,2)-used_t;
 built:=built||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'invoiceLineId',l.id,'returnLineId',nullif(entry->>'returnLineId',''),'quantity',qty,'net',n,'tax',t));total_n:=total_n+n;total_t:=total_t+t;
 END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'CREDIT_NOTE',accounting.return_number('CREDIT_NOTE'),today,'CONFIRMED',a);
 INSERT INTO sales.credit_notes(id,company_id,invoice_id,reason,net,tax,gross,created_by) VALUES(cid,c,p_invoice,trim(p_reason),total_n,total_t,total_n+total_t,a);
 SELECT pb.id INTO orig_batch FROM accounting.posting_batches pb WHERE pb.company_id=c AND pb.source_document_id=p_invoice AND pb.posting_kind='SALES_INVOICE';
 IF total_n+total_t>0 THEN
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE je.company_id=c AND je.posting_batch_id=orig_batch AND ac.control_kind='AR' AND jl.debit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original invoice AR journal missing' USING ERRCODE='HR422';END IF;
 posts:=jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',i.party_id,'credit',total_n+total_t));END IF;
 IF total_n>0 THEN
 SELECT jl.account_id INTO revenue FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE je.company_id=c AND je.posting_batch_id=orig_batch AND ac.kind='REVENUE' AND jl.credit>0 LIMIT 1;
 IF revenue IS NULL THEN RAISE EXCEPTION 'Original invoice revenue journal missing' USING ERRCODE='HR422';END IF;posts:=posts||jsonb_build_array(jsonb_build_object('accountId',revenue,'debit',total_n));END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(built) LOOP
 no:=no+1;lid:=(entry->>'id')::uuid;n:=(entry->>'net')::numeric;t:=(entry->>'tax')::numeric;
 SELECT * INTO l FROM sales.invoice_lines WHERE company_id=c AND id=(entry->>'invoiceLineId')::uuid;
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,cid,no,a);
 INSERT INTO sales.credit_note_lines(id,company_id,credit_note_id,invoice_line_id,return_line_id,quantity,net,tax,gross) VALUES(lid,c,cid,l.id,(entry->>'returnLineId')::uuid,(entry->>'quantity')::numeric,n,t,n+t);
 IF t>0 THEN SELECT output_account_id INTO output FROM accounting.sales_gst_entries WHERE company_id=c AND invoice_line_id=l.id;
 IF output IS NULL THEN RAISE EXCEPTION 'Original GST journal mapping missing' USING ERRCODE='HR422';END IF;posts:=posts||jsonb_build_array(jsonb_build_object('accountId',output,'debit',t,'sourceLineId',lid));END IF;
 IF i.gst_basis='NON_CASH' THEN
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_NOTE','NON_CASH',today,l.tax_code_id,-n-t,-t);
 ELSE
 SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=l.id;refunded:=0;
 new_gross:=l.gross-accounting.line_credited(l.id);SELECT l.tax-coalesce(sum(cl.tax),0) INTO new_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid-refunded<=new_gross THEN
 cash_tax:=accounting.cash_tax_balance(l.id);target_tax:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-refunded)/new_gross,2) END;
 IF target_tax<>cash_tax THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_REBASE','CASH',today,l.tax_code_id,0,target_tax-cash_tax);END IF;
 END IF;END IF;
 END LOOP;
 IF total_n+total_t>0 THEN j:=accounting.post_journal(cid,1,'CREDIT_NOTE',today,'Sales credit / adjustment note',posts);PERFORM accounting.contra_link(orig_batch,j,'CREDIT_NOTE');END IF;
 UPDATE crm.customer_credit_exposures SET receivable=receivable-total_n-total_t WHERE company_id=c AND customer_id=i.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;UPDATE platform.documents SET state=state WHERE company_id=c AND id=i.order_id;RETURN cid;
END $$;

CREATE OR REPLACE FUNCTION accounting.post_customer_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_cancel_order boolean DEFAULT false) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();fid uuid:=gen_random_uuid();cl sales.credit_note_lines;il sales.invoice_lines;i sales.invoices;ad accounting.customer_advances;r accounting.customer_receipts;customer crm.customers;ex crm.customer_credit_exposures;other record;
 cust uuid;oid uuid;today date;paid numeric;old_refunds numeric;note_refunds numeric;available numeric;new_gross numeric;new_tax numeric;cash_tax numeric;desired numeric;tax_refund numeric:=0;used numeric;used_tax numeric;pending numeric;total_tax numeric:=0;bank uuid;ar uuid;posts jsonb;source_doc uuid;orig_batch uuid;j uuid;
BEGIN
 IF (p_credit_line IS NULL)=(p_advance IS NULL) OR p_amount IS NULL OR p_amount<=0 OR p_amount<>round(p_amount,2) OR p_amount>999999999999999999.99 OR p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 OR p_cancel_order IS NULL THEN RAISE EXCEPTION 'Refund needs one source, positive cents, reference and reason' USING ERRCODE='HR422';END IF;
 IF p_credit_line IS NOT NULL THEN
 SELECT * INTO cl FROM sales.credit_note_lines WHERE company_id=c AND id=p_credit_line;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit line unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO il FROM sales.invoice_lines WHERE company_id=c AND id=cl.invoice_line_id;SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=il.invoice_id;cust:=i.customer_id;oid:=i.order_id;source_doc:=cl.credit_note_id;
 IF p_cancel_order THEN RAISE EXCEPTION 'Invoiced orders cannot be cancelled by refund' USING ERRCODE='HR422';END IF;
 ELSE
 SELECT * INTO ad FROM accounting.customer_advances WHERE company_id=c AND id=p_advance;
 IF NOT FOUND THEN RAISE EXCEPTION 'Advance unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=ad.receipt_id;SELECT order_id INTO oid FROM sales.order_lines WHERE company_id=c AND id=ad.order_line_id;cust:=r.customer_id;source_doc:=r.id;
 END IF;
 PERFORM sales.require_customer_access('accounting.refunds.write',cust);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;
 SELECT * INTO customer FROM crm.customers WHERE company_id=c AND id=cust FOR UPDATE;SELECT * INTO ex FROM sales.lock_credit(cust);
 IF NOT FOUND THEN RAISE EXCEPTION 'Customer credit projection missing' USING ERRCODE='HR422';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Refund requires open period' USING ERRCODE='HR422';END IF;
 bank:=accounting.settlement_account('BANK','ASSET','BANK');posts:=jsonb_build_array(jsonb_build_object('accountId',bank,'credit',p_amount));
 IF p_credit_line IS NOT NULL THEN
 SELECT coalesce(sum(amount),0) INTO paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=il.id;
 SELECT coalesce(sum(amount),0) INTO note_refunds FROM accounting.customer_refunds WHERE company_id=c AND credit_line_id=cl.id;old_refunds:=accounting.line_refunded(il.id);
 IF p_amount>(SELECT available_apply_amount FROM sales.customer_credit_line_balances WHERE company_id=c AND id=cl.id) OR p_amount>greatest(0,-ex.receivable) THEN RAISE EXCEPTION 'Refund exceeds source payments, credit or customer net credit balance' USING ERRCODE='HR409';END IF;
 IF greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund would remove required order/credit funding' USING ERRCODE='HR409';END IF;
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE pb.company_id=c AND pb.source_document_id=cl.credit_note_id AND pb.posting_kind='CREDIT_NOTE' AND ac.control_kind='AR' AND jl.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original credit AR journal missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',i.party_id,'debit',p_amount));
 IF i.gst_basis='CASH' THEN
 cash_tax:=accounting.cash_tax_balance(il.id);new_gross:=il.gross-accounting.line_credited(il.id);SELECT il.tax-coalesce(sum(v.tax),0) INTO new_tax FROM sales.credit_note_lines v WHERE v.company_id=c AND v.invoice_line_id=il.id;
 IF EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id)) THEN SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=il.id;old_refunds:=0;END IF;
 IF paid-old_refunds-p_amount<=new_gross THEN desired:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-old_refunds-p_amount)/new_gross,2) END;
 ELSE desired:=greatest(0,cash_tax-(round(il.tax*(old_refunds+p_amount)/il.gross,2)-round(il.tax*old_refunds/il.gross,2)));END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id)) AND paid-p_amount>new_gross THEN desired:=least(il.tax,new_tax+round((il.tax-new_tax)*(paid-p_amount-new_gross)/(il.gross-new_gross),2));END IF;
 tax_refund:=greatest(0,cash_tax-desired);END IF;
 ELSE
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used,used_tax FROM accounting.advance_applications WHERE company_id=c AND advance_id=ad.id;
 old_refunds:=accounting.advance_refunded(ad.id);available:=ad.amount-used-old_refunds;
 IF p_amount>available THEN RAISE EXCEPTION 'Advance already applied/refunded or insufficient' USING ERRCODE='HR409';END IF;
 IF NOT p_cancel_order AND greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund removes required order funding; cancel unfulfilled order or resolve credit first' USING ERRCODE='HR409';END IF;
 IF p_cancel_order AND (EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=c AND order_id=oid) OR EXISTS(SELECT 1 FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND sr.consumed_quantity>0)) THEN RAISE EXCEPTION 'Only wholly unfulfilled uninvoiced order can be cancelled with advance refund' USING ERRCODE='HR409';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.advance_account_id,'debit',p_amount));
 IF ad.gst_basis='CASH' THEN tax_refund:=round(ad.gst_amount*(used+old_refunds+p_amount)/ad.amount,2)-used_tax-accounting.advance_refund_tax(ad.id);END IF;
 END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(fid,c,'CUSTOMER_REFUND',accounting.return_number('CUSTOMER_REFUND'),today,'CONFIRMED',a);
 IF p_credit_line IS NOT NULL THEN
 IF i.gst_basis='CASH' AND tax_refund>0 THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,fid,il.id,cl.id,'CREDIT_REFUND','CASH',today,il.tax_code_id,-p_amount,-tax_refund);END IF;
 total_tax:=tax_refund;UPDATE crm.customer_credit_exposures SET receivable=receivable+p_amount WHERE company_id=c AND customer_id=cust;
 ELSE
 IF ad.gst_basis='CASH' AND tax_refund>0 THEN
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',tax_refund),jsonb_build_object('accountId',ad.clearing_account_id,'credit',tax_refund));
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,fid,ad.id,'ADVANCE_REFUND','CASH',today,ad.tax_code_id,-p_amount,-tax_refund);total_tax:=tax_refund;
 ELSIF ad.gst_basis='NON_CASH' AND p_cancel_order THEN
 FOR other IN SELECT av.* FROM accounting.customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY av.id LOOP
 pending:=other.gst_amount-accounting.advance_refund_tax(other.id)-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=c AND g.advance_id=other.id),0);
 IF pending>0 THEN
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',other.output_account_id,'debit',pending),jsonb_build_object('accountId',other.clearing_account_id,'credit',pending));
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,fid,other.id,'ADVANCE_REFUND','NON_CASH',today,other.tax_code_id,CASE WHEN other.id=ad.id THEN -p_amount ELSE 0 END,-pending);total_tax:=total_tax+pending;END IF;
 END LOOP;END IF;
 UPDATE crm.customer_credit_exposures SET available_advances=available_advances-p_amount WHERE company_id=c AND customer_id=cust;
 END IF;
 INSERT INTO accounting.customer_refunds(id,company_id,customer_id,credit_line_id,advance_id,amount,gst_amount,reference,reason,created_by) VALUES(fid,c,cust,p_credit_line,p_advance,p_amount,total_tax,trim(p_reference),trim(p_reason),a);
 j:=accounting.post_journal(fid,1,'CUSTOMER_REFUND',today,'Recorded customer refund',posts);
 SELECT id INTO orig_batch FROM accounting.posting_batches WHERE company_id=c AND source_document_id=source_doc AND posting_kind=CASE WHEN p_advance IS NULL THEN 'CREDIT_NOTE' ELSE 'CUSTOMER_RECEIPT' END;
 IF orig_batch IS NOT NULL THEN PERFORM accounting.contra_link(orig_batch,j,CASE WHEN p_advance IS NULL THEN 'CREDIT_REFUND' ELSE 'ADVANCE_REFUND' END);END IF;
 IF p_cancel_order THEN
 IF EXISTS(SELECT 1 FROM accounting.customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND av.amount-accounting.advance_refunded(av.id)>coalesce((SELECT sum(amount) FROM accounting.advance_applications WHERE company_id=c AND advance_id=av.id),0)) THEN RAISE EXCEPTION 'Refund all remaining advances before cancelling order' USING ERRCODE='HR409';END IF;
 FOR other IN SELECT DISTINCT b.product_id,o.warehouse_id FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN inventory.stock_balances b ON b.company_id=sr.company_id AND b.id=sr.stock_balance_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY b.product_id LOOP PERFORM 1 FROM inventory.lock_balance(other.warehouse_id,other.product_id);END LOOP;
 UPDATE inventory.stock_reservations SET released_quantity=quantity WHERE company_id=c AND order_line_id IN(SELECT id FROM sales.order_lines WHERE company_id=c AND order_id=oid);
 UPDATE sales.credit_commitments SET released_amount=amount WHERE company_id=c AND order_id=oid;UPDATE sales.orders SET cancelled_at=now(),cancel_reason=trim(p_reason) WHERE company_id=c AND id=oid;
 UPDATE platform.documents SET state='CANCELLED' WHERE company_id=c AND id=oid;
 END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=fid;RETURN fid;
END $$;

CREATE FUNCTION sales.guard_credit_application_document() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF OLD.state='POSTED' AND OLD.document_type IN('CUSTOMER_CREDIT_APPLICATION','CUSTOMER_CREDIT_UNAPPLICATION') THEN RAISE EXCEPTION 'Posted customer credit applications are immutable' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER customer_credit_application_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION sales.guard_credit_application_document();
CREATE FUNCTION sales.validate_credit_application() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;app uuid;ca sales.credit_applications;cu sales.credit_unapplications;j uuid;typ text;party uuid;sign int:=-1;BEGIN
 IF TG_TABLE_NAME='credit_applications' OR TG_TABLE_NAME='credit_unapplications' THEN doc:=NEW.id;ELSIF TG_TABLE_NAME='credit_application_lines' THEN doc:=NEW.application_id;ELSE IF NEW.customer_credit_application_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.source_document_id;END IF;
 SELECT * INTO cu FROM sales.credit_unapplications WHERE company_id=c AND id=doc;
 app:=coalesce(cu.application_id,doc);SELECT * INTO ca FROM sales.credit_applications WHERE company_id=c AND id=app;
 j:=coalesce(cu.journal_entry_id,ca.journal_entry_id);typ:=CASE WHEN cu.id IS NULL THEN 'CUSTOMER_CREDIT_APPLICATION' ELSE 'CUSTOMER_CREDIT_UNAPPLICATION' END;party:=ca.party_id;IF cu.id IS NOT NULL THEN sign:=1;END IF;
 IF ca.id IS NULL OR NOT EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND application_id=app) OR ca.amount<>(SELECT sum(amount) FROM sales.credit_application_lines WHERE company_id=c AND application_id=app) OR
 NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries je ON je.company_id=d.company_id AND je.id=j JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.document_type=typ AND d.state='POSTED' AND pb.source_document_id=d.id AND pb.posting_kind=typ AND je.posting_date=d.business_date) OR
 (cu.id IS NOT NULL AND(cu.amount<>ca.amount OR cu.customer_id<>ca.customer_id)) THEN RAISE EXCEPTION 'Credit application totals/registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_application_lines l JOIN sales.credit_note_lines cl ON cl.company_id=l.company_id AND cl.id=l.credit_line_id JOIN sales.credit_notes cn ON cn.company_id=cl.company_id AND cn.id=cl.credit_note_id JOIN sales.invoices si ON si.company_id=cn.company_id AND si.id=cn.invoice_id JOIN sales.invoice_lines bl ON bl.company_id=l.company_id AND bl.id=l.target_invoice_line_id JOIN sales.invoices b ON b.company_id=bl.company_id AND b.id=bl.invoice_id JOIN accounting.invoice_ar_accounts ta ON ta.company_id=b.company_id AND ta.invoice_id=b.id JOIN accounting.invoice_ar_accounts sa ON sa.company_id=cl.company_id AND sa.invoice_id=cn.invoice_id
 WHERE l.company_id=c AND l.application_id=app AND(cl.credit_note_id<>ca.credit_note_id OR cl.invoice_line_id<>l.source_invoice_line_id OR si.customer_id<>ca.customer_id OR b.customer_id<>ca.customer_id OR sa.party_id<>party OR ta.party_id<>party OR b.id=cn.invoice_id OR l.source_ar_account_id<>sa.account_id OR l.target_ar_account_id<>ta.account_id)) OR
 EXISTS(SELECT 1 FROM sales.customer_credit_line_balances WHERE company_id=c AND id IN(SELECT credit_line_id FROM sales.credit_application_lines WHERE company_id=c AND application_id=app) AND unallocated_amount<0) OR
 EXISTS(SELECT 1 FROM sales.invoice_line_balances WHERE company_id=c AND id IN(SELECT source_invoice_line_id FROM sales.credit_application_lines WHERE company_id=c AND application_id=app UNION SELECT target_invoice_line_id FROM sales.credit_application_lines WHERE company_id=c AND application_id=app) AND(net_paid_amount<0 OR cash_tax_balance<0 OR cash_tax_balance>tax)) THEN RAISE EXCEPTION 'Credit allocation source or available balance mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH e AS(SELECT account_id,sum(dr) AS dr,sum(cr) AS cr FROM(
  SELECT source_ar_account_id AS account_id,CASE WHEN sign=-1 THEN amount ELSE 0 END AS dr,CASE WHEN sign=1 THEN amount ELSE 0 END AS cr FROM sales.credit_application_lines WHERE company_id=c AND application_id=app
  UNION ALL SELECT target_ar_account_id,CASE WHEN sign=1 THEN amount ELSE 0 END,CASE WHEN sign=-1 THEN amount ELSE 0 END FROM sales.credit_application_lines WHERE company_id=c AND application_id=app)q GROUP BY account_id),
  a AS(SELECT l.account_id,sum(l.debit) AS dr,sum(l.credit) AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND ac.control_kind='AR' AND l.party_id=party GROUP BY l.account_id)
  SELECT 1 FROM e FULL JOIN a USING(account_id) WHERE coalesce(e.dr,0)<>coalesce(a.dr,0) OR coalesce(e.cr,0)<>coalesce(a.cr,0)) THEN RAISE EXCEPTION 'Credit allocation AR postings mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.gst_adjustments ga JOIN sales.invoice_line_balances il ON il.company_id=ga.company_id AND il.id=ga.invoice_line_id JOIN platform.documents d ON d.company_id=ga.company_id AND d.id=doc WHERE ga.company_id=c AND ga.source_document_id=doc AND(ga.customer_credit_application_id IS DISTINCT FROM app OR ga.kind<>CASE WHEN cu.id IS NULL THEN 'CREDIT_APPLICATION' ELSE 'CREDIT_UNAPPLICATION' END OR ga.gst_basis<>'CASH' OR il.gst_basis<>'CASH' OR ga.tax_code_id<>il.tax_code_id OR ga.adjustment_date<>d.business_date OR NOT EXISTS(SELECT 1 FROM sales.credit_application_lines l WHERE l.company_id=c AND l.application_id=app AND ga.invoice_line_id IN(l.source_invoice_line_id,l.target_invoice_line_id)))) OR EXISTS(SELECT 1 FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND ac.control_kind IS DISTINCT FROM 'AR') THEN RAISE EXCEPTION 'Customer credit GST attribution or AR-only journal mismatch' USING ERRCODE='23514';END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER credit_application_consistency AFTER INSERT ON sales.credit_applications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_application_line_consistency AFTER INSERT ON sales.credit_application_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_unapplication_consistency AFTER INSERT ON sales.credit_unapplications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_credit_application();
CREATE CONSTRAINT TRIGGER credit_application_gst_consistency AFTER INSERT ON accounting.gst_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_credit_application();
REVOKE ALL ON FUNCTION identity.seed_customer_credit_application_roles(uuid),sales.customer_credit_number(text),sales.credit_movement_gst(uuid,uuid,uuid,numeric,date,text,numeric),sales.apply_customer_credit(uuid,text,text,jsonb),sales.unapply_customer_credit(uuid,text,text),sales.guard_credit_application_document(),sales.validate_credit_application() FROM PUBLIC;
GRANT SELECT ON sales.credit_applications,sales.credit_application_lines,sales.credit_unapplications,sales.active_credit_application_lines,sales.invoice_line_balances,sales.customer_credit_line_balances,accounting.invoice_ar_accounts TO htt_app;
GRANT EXECUTE ON FUNCTION sales.apply_customer_credit(uuid,text,text,jsonb),sales.unapply_customer_credit(uuid,text,text) TO htt_app;

ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND','SUPPLIER_CREDIT_UNAPPLICATION','CUSTOMER_CREDIT_UNAPPLICATION'));

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
 ), ar_lines AS (SELECT id,customer_id,party_id,remaining_gross-net_paid_amount AS balance FROM sales.invoice_line_balances WHERE company_id=core.current_company()
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

  UNION ALL SELECT 'customer_credit_application.total',a.id,a.amount,coalesce((SELECT sum(amount) FROM sales.credit_application_lines WHERE company_id=a.company_id AND application_id=a.id),0),'AUD' FROM sales.credit_applications a WHERE a.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_unapplication.total',u.id,a.amount,u.amount,'AUD' FROM sales.credit_unapplications u JOIN sales.credit_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_application.capacity',cl.id,0,greatest(0,-cl.unallocated_amount),'AUD' FROM sales.customer_credit_line_balances cl WHERE cl.company_id=core.current_company()
  UNION ALL SELECT 'customer_credit_application.funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM sales.invoice_line_balances b WHERE b.company_id=core.current_company() AND EXISTS(SELECT 1 FROM sales.credit_application_lines l WHERE l.company_id=b.company_id AND b.id IN(l.source_invoice_line_id,l.target_invoice_line_id))
 ) SELECT code,entity,e,a,u FROM checks;
END $$;

CREATE OR REPLACE FUNCTION platform.change_visibility(doc uuid,expected bigint,business_version bigint,restore boolean,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
   IF d.state<>'POSTED' OR EXISTS(SELECT 1 FROM sales.credit_notes n WHERE n.company_id=d.company_id AND n.invoice_id=doc AND (NOT EXISTS(SELECT 1 FROM platform.documents nd WHERE nd.company_id=n.company_id AND nd.id=n.id AND nd.state='POSTED') OR (n.gross>0 AND NOT EXISTS(SELECT 1 FROM accounting.reversal_links rl JOIN accounting.posting_batches cb ON cb.company_id=rl.company_id AND cb.id=rl.contra_batch_id JOIN accounting.posting_batches sb ON sb.company_id=rl.company_id AND sb.id=rl.source_batch_id WHERE rl.company_id=n.company_id AND cb.source_document_id=n.id AND sb.source_document_id=doc AND rl.kind='CREDIT_NOTE')))) OR NOT EXISTS(SELECT 1 FROM sales.invoice_lines WHERE company_id=d.company_id AND invoice_id=doc) OR EXISTS(SELECT 1 FROM sales.invoice_lines l WHERE l.company_id=d.company_id AND l.invoice_id=doc AND (l.quantity<>coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=l.company_id AND invoice_line_id=l.id),0) OR l.gross<>accounting.line_credited(l.id) OR (SELECT net_paid_amount FROM sales.invoice_line_balances WHERE company_id=l.company_id AND id=l.id)<>0 OR EXISTS(SELECT 1 FROM sales.active_credit_application_lines a WHERE a.company_id=l.company_id AND l.id IN(a.source_invoice_line_id,a.target_invoice_line_id)))) THEN RAISE EXCEPTION 'Invoice must be fully legally credited and all received amounts refunded before trash; payment alone is not reversal' USING ERRCODE='HX409';END IF;
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

