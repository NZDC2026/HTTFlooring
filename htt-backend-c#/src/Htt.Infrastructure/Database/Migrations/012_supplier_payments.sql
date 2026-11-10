-- Confirmed manual supplier payments. No bank execution or implicit overpayment.
CREATE TABLE accounting.supplier_payments (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),supplier_id uuid NOT NULL,party_id uuid NOT NULL,paid_on date NOT NULL,
 method text NOT NULL CHECK(method IN ('BANK_TRANSFER','CARD','CASH')),reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),notes text NOT NULL,
 amount numeric(20,2) NOT NULL CHECK(amount>0),allocated_amount numeric(20,2) NOT NULL CHECK(allocated_amount>=0),advance_amount numeric(20,2) NOT NULL CHECK(advance_amount>=0 AND amount=allocated_amount+advance_amount),
 bank_account_id uuid NOT NULL,journal_entry_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,bank_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE UNIQUE INDEX supplier_payment_reference ON accounting.supplier_payments(company_id,lower(btrim(reference)));
CREATE TABLE accounting.supplier_advances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),payment_id uuid NOT NULL,supplier_id uuid NOT NULL,party_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),account_id uuid NOT NULL,
 gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),gst_registered boolean NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,payment_id),FOREIGN KEY(company_id,payment_id) REFERENCES accounting.supplier_payments(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id)
);
CREATE TABLE accounting.supplier_advance_applications (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),advance_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.supplier_advances(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE UNIQUE INDEX supplier_application_reference ON accounting.supplier_advance_applications(company_id,advance_id,lower(btrim(reference)));
CREATE TABLE accounting.supplier_payment_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_document_id uuid NOT NULL,payment_id uuid NOT NULL,advance_id uuid,bill_line_id uuid NOT NULL,
 amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0 AND gst_amount<=amount),
 UNIQUE(company_id,id),UNIQUE(company_id,source_document_id,bill_line_id),FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),
 FOREIGN KEY(company_id,payment_id) REFERENCES accounting.supplier_payments(company_id,id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,advance_id) REFERENCES accounting.supplier_advances(company_id,id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id)
);
CREATE TABLE accounting.purchase_gst_attributions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),allocation_id uuid NOT NULL,source_document_id uuid NOT NULL,bill_line_id uuid NOT NULL,
 attribution_date date NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0),input_account_id uuid,deferred_account_id uuid,
 UNIQUE(company_id,id),UNIQUE(company_id,allocation_id),FOREIGN KEY(company_id,allocation_id) REFERENCES accounting.supplier_payment_allocations(company_id,id),FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,input_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,deferred_account_id) REFERENCES accounting.accounts(company_id,id),CHECK(gst_amount=0 OR (input_account_id IS NOT NULL AND deferred_account_id IS NOT NULL))
);
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['supplier_payments','supplier_advances','supplier_advance_applications','supplier_payment_allocations','purchase_gst_attributions'] LOOP
 EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',tb);
 EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);
 EXECUTE format('CREATE INDEX ON accounting.%I(company_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
 END LOOP;END $$;
CREATE INDEX ON accounting.supplier_payments(company_id,supplier_id,paid_on);
CREATE INDEX ON accounting.supplier_advances(company_id,supplier_id);
CREATE INDEX ON accounting.supplier_advance_applications(company_id,advance_id);
CREATE INDEX ON accounting.supplier_payment_allocations(company_id,bill_line_id);
CREATE INDEX ON accounting.supplier_payment_allocations(company_id,advance_id);
CREATE INDEX ON accounting.supplier_payment_allocations(company_id,payment_id);
CREATE INDEX ON accounting.purchase_gst_attributions(company_id,bill_line_id,attribution_date);
CREATE VIEW accounting.ap_balances WITH(security_invoker=true) AS
 SELECT a.*,coalesce(m.paid_amount,0) AS paid_amount,a.amount-coalesce(m.paid_amount,0) AS outstanding_amount FROM accounting.ap_items a
 LEFT JOIN LATERAL(SELECT sum(pa.amount) AS paid_amount FROM accounting.supplier_payment_allocations pa JOIN purchase.bill_lines bl ON bl.company_id=pa.company_id AND bl.id=pa.bill_line_id WHERE bl.company_id=a.company_id AND bl.bill_id=a.bill_id)m ON true;
CREATE VIEW accounting.supplier_advance_balances WITH(security_invoker=true) AS
 SELECT a.*,a.amount-coalesce((SELECT sum(amount) FROM accounting.supplier_advance_applications WHERE company_id=a.company_id AND advance_id=a.id),0) AS available FROM accounting.supplier_advances a;
INSERT INTO identity.permissions(code,description) VALUES('purchase.payments.read','Read supplier payments and advances'),('purchase.payments.post','Record confirmed supplier payments'),('purchase.advances.apply','Apply supplier prepayments to AP');
CREATE FUNCTION identity.seed_supplier_payment_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN ('ADMIN','FINANCE') AND p.code IN ('purchase.payments.read','purchase.payments.post','purchase.advances.apply') ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'1500','Supplier prepayments','ASSET') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,'SUPPLIER_ADVANCES',id FROM accounting.accounts WHERE company_id=c AND code='1500' ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SUPPLIER_PAYMENT','SP-'),(c,'SUPPLIER_ADVANCE_APPLICATION','SA-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_supplier_payment_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.supplier_settlement_number(p_type text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN
 IF p_type NOT IN ('SUPPLIER_PAYMENT','SUPPLIER_ADVANCE_APPLICATION') THEN RAISE EXCEPTION 'Invalid supplier settlement sequence' USING ERRCODE='HP422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=p_type RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier settlement sequence missing' USING ERRCODE='HP422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION purchase.check_supplier_allocations(items jsonb,allow_empty boolean) RETURNS numeric LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE total numeric;BEGIN
 PERFORM accounting.check_allocations(items,allow_empty);
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) x WHERE x->>'billLineId' IS NULL) OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) x GROUP BY x->>'billLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Distinct bill line IDs required' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum((x->>'amount')::numeric),0) INTO total FROM jsonb_array_elements(items) x;RETURN total;
END $$;
-- Caller owns the supplier row lock; also lock AP rows in stable order as the settlement source gate.
CREATE FUNCTION purchase.allocate_supplier_payment(p_doc uuid,p_payment uuid,p_advance uuid,p_supplier uuid,items jsonb,p_paid_on date,p_posting_on date) RETURNS jsonb
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();entry jsonb;src record;aid uuid;paid numeric;claimed numeric;v numeric;t numeric;allocation uuid;jl jsonb:='[]';tax_date date;
BEGIN
 FOR aid IN SELECT DISTINCT ap.id FROM jsonb_array_elements(items) x JOIN purchase.bill_lines bl ON bl.company_id=c AND bl.id=(x->>'billLineId')::uuid JOIN accounting.ap_items ap ON ap.company_id=bl.company_id AND ap.bill_id=bl.bill_id ORDER BY ap.id LOOP
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND id=aid FOR UPDATE;
 END LOOP;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'billLineId' LOOP
 SELECT bl.*,b.supplier_id,b.party_id,b.gst_basis,b.tax_invoice_held_on,d.business_date,ap.account_id,ge.input_account_id,ge.debit_account_id INTO src
 FROM purchase.bill_lines bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id JOIN platform.documents d ON d.company_id=b.company_id AND d.id=b.id AND d.state='POSTED'
 JOIN accounting.ap_items ap ON ap.company_id=b.company_id AND ap.bill_id=b.id JOIN accounting.purchase_gst_entries ge ON ge.company_id=bl.company_id AND ge.bill_line_id=bl.id WHERE bl.company_id=c AND bl.id=(entry->>'billLineId')::uuid AND b.supplier_id=p_supplier;
 IF NOT FOUND THEN RAISE EXCEPTION 'Bill line unavailable for supplier' USING ERRCODE='HT404';END IF;
 IF p_posting_on<src.business_date OR (p_advance IS NULL AND p_paid_on<src.business_date) THEN RAISE EXCEPTION 'Direct payment cannot precede posted bill; record a prepayment instead' USING ERRCODE='HP422';END IF;
 v:=(entry->>'amount')::numeric;
 SELECT coalesce(sum(pa.amount),0),coalesce(sum(pa.gst_amount),0) INTO paid,claimed FROM accounting.supplier_payment_allocations pa WHERE pa.company_id=c AND pa.bill_line_id=src.id;
 IF paid+v>src.net+src.tax THEN RAISE EXCEPTION 'Payment exceeds outstanding bill line balance' USING ERRCODE='HP409';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.account_id AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original bill AP account is inactive' USING ERRCODE='HP422';END IF;
 t:=CASE WHEN src.gst_basis='CASH' THEN round(src.recoverable_tax*(paid+v)/(src.net+src.tax),2)-claimed ELSE 0 END;
 allocation:=gen_random_uuid();INSERT INTO accounting.supplier_payment_allocations(id,company_id,source_document_id,payment_id,advance_id,bill_line_id,amount,gst_amount) VALUES(allocation,c,p_doc,p_payment,p_advance,src.id,v,t);
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.account_id,'partyId',src.party_id,'debit',v));
 IF src.gst_basis='CASH' THEN
 tax_date:=greatest(p_paid_on,coalesce(src.tax_invoice_held_on,p_paid_on));
 IF t>0 THEN
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account is inactive' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.debit_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original deferred GST account is inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.input_account_id,'debit',t),jsonb_build_object('accountId',src.debit_account_id,'credit',t));
 END IF;
 INSERT INTO accounting.purchase_gst_attributions(company_id,allocation_id,source_document_id,bill_line_id,attribution_date,amount,gst_amount,input_account_id,deferred_account_id) VALUES(c,allocation,p_doc,src.id,tax_date,v,t,src.input_account_id,src.debit_account_id);
 END IF;
 END LOOP;RETURN jl;
END $$;
CREATE FUNCTION purchase.post_supplier_payment(p_supplier uuid,p_amount numeric,p_advance_amount numeric,p_method text,p_reference text,p_paid_on date,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();pid uuid:=gen_random_uuid();company core.companies;supplier crm.suppliers;today date;on_date date;allocated numeric;bank uuid;adv_account uuid;j uuid;jl jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.payments.post');SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;on_date:=coalesce(p_paid_on,today);
 SELECT * INTO supplier FROM crm.suppliers WHERE company_id=c AND id=p_supplier AND status='ACTIVE' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HT404';END IF;
 allocated:=purchase.check_supplier_allocations(items,true);
 IF p_amount IS NULL OR p_amount<=0 OR p_amount<>round(p_amount,2) OR p_amount>999999999999999999.99 OR p_advance_amount IS NULL OR p_advance_amount<0 OR p_advance_amount<>round(p_advance_amount,2) OR p_amount<>allocated+p_advance_amount OR p_method IS NULL OR p_method NOT IN ('BANK_TRANSFER','CARD','CASH') OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_notes IS NULL OR length(p_notes)>2000 OR (p_advance_amount>0 AND length(btrim(p_notes))=0) OR on_date>today OR on_date=date '0001-01-01' THEN RAISE EXCEPTION 'Payment must equal explicit allocations plus prepayment; valid method, reference, date and prepayment purpose required' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=on_date AND ends_on>on_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment requires open accounting period' USING ERRCODE='HP422';END IF;
 bank:=accounting.settlement_account('BANK','ASSET','BANK');
 IF p_advance_amount>0 THEN adv_account:=accounting.settlement_account('SUPPLIER_ADVANCES','ASSET');
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=adv_account AND control_kind IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier prepayment requires a non-control asset account' USING ERRCODE='HP422';END IF;END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(pid,c,'SUPPLIER_PAYMENT',purchase.supplier_settlement_number('SUPPLIER_PAYMENT'),on_date,'CONFIRMED',a);
 jl:=purchase.allocate_supplier_payment(pid,pid,NULL,p_supplier,items,on_date,on_date);
 IF p_advance_amount>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',adv_account,'partyId',supplier.party_id,'debit',p_advance_amount));END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',bank,'credit',p_amount));
 j:=accounting.post_journal(pid,1,'SUPPLIER_PAYMENT',on_date,'Confirmed supplier payment',jl);
 INSERT INTO accounting.supplier_payments(id,company_id,supplier_id,party_id,paid_on,method,reference,notes,amount,allocated_amount,advance_amount,bank_account_id,journal_entry_id,created_by) VALUES(pid,c,p_supplier,supplier.party_id,on_date,p_method,btrim(p_reference),p_notes,p_amount,allocated,p_advance_amount,bank,j,a);
 IF p_advance_amount>0 THEN INSERT INTO accounting.supplier_advances(company_id,payment_id,supplier_id,party_id,amount,account_id,gst_basis,gst_registered) VALUES(c,pid,p_supplier,supplier.party_id,p_advance_amount,adv_account,company.gst_basis,company.gst_registered);END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=pid;RETURN pid;
END $$;
CREATE FUNCTION purchase.apply_supplier_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();sid uuid;aid uuid:=gen_random_uuid();ad accounting.supplier_advances;payment accounting.supplier_payments;company core.companies;today date;total numeric;used numeric;j uuid;jl jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.advances.apply');SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;
 SELECT supplier_id INTO sid FROM accounting.supplier_advances WHERE company_id=c AND id=p_advance;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier prepayment unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=sid AND status='ACTIVE' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 SELECT * INTO ad FROM accounting.supplier_advances WHERE company_id=c AND id=p_advance FOR UPDATE;
 SELECT * INTO payment FROM accounting.supplier_payments WHERE company_id=c AND id=ad.payment_id;
 total:=purchase.check_supplier_allocations(items,false);
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Application reference required' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(amount),0) INTO used FROM accounting.supplier_advance_applications WHERE company_id=c AND advance_id=ad.id;
 IF used+total>ad.amount THEN RAISE EXCEPTION 'Application exceeds available supplier prepayment' USING ERRCODE='HP409';END IF;
 IF ad.gst_basis<>company.gst_basis OR ad.gst_registered<>company.gst_registered OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) x JOIN purchase.bill_lines bl ON bl.company_id=c AND bl.id=(x->>'billLineId')::uuid JOIN purchase.bills b ON b.company_id=c AND b.id=bl.bill_id WHERE b.gst_basis<>ad.gst_basis) THEN RAISE EXCEPTION 'Prepayment GST policy requires controlled transition' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application requires open accounting period' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ad.account_id AND active AND kind='ASSET' AND control_kind IS NULL FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original supplier prepayment account is inactive' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(aid,c,'SUPPLIER_ADVANCE_APPLICATION',purchase.supplier_settlement_number('SUPPLIER_ADVANCE_APPLICATION'),today,'CONFIRMED',a);
 jl:=purchase.allocate_supplier_payment(aid,payment.id,ad.id,ad.supplier_id,items,payment.paid_on,today);
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ad.account_id,'partyId',ad.party_id,'credit',total));
 j:=accounting.post_journal(aid,1,'SUPPLIER_ADVANCE_APPLICATION',today,'Apply supplier prepayment to AP',jl);
 INSERT INTO accounting.supplier_advance_applications(id,company_id,advance_id,reference,amount,journal_entry_id,created_by) VALUES(aid,c,ad.id,btrim(p_reference),total,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=aid;RETURN aid;
END $$;
CREATE FUNCTION purchase.guard_supplier_settlement_document() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF OLD.state='POSTED' AND OLD.document_type IN ('SUPPLIER_PAYMENT','SUPPLIER_ADVANCE_APPLICATION') THEN RAISE EXCEPTION 'Posted supplier settlement is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER supplier_settlement_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_supplier_settlement_document();
CREATE FUNCTION purchase.validate_supplier_settlement() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;pay accounting.supplier_payments;app accounting.supplier_advance_applications;ad accounting.supplier_advances;v numeric;g numeric;
BEGIN
 IF TG_TABLE_NAME='supplier_payments' THEN doc:=NEW.id;ELSIF TG_TABLE_NAME='supplier_advances' THEN doc:=NEW.payment_id;ELSIF TG_TABLE_NAME='supplier_advance_applications' THEN doc:=NEW.id;ELSE doc:=NEW.source_document_id;END IF;
 SELECT * INTO pay FROM accounting.supplier_payments WHERE company_id=c AND id=doc;
 IF FOUND THEN
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=doc AND document_type='SUPPLIER_PAYMENT' AND state='POSTED' AND business_date=pay.paid_on) OR
 pay.allocated_amount<>(SELECT coalesce(sum(amount),0) FROM accounting.supplier_payment_allocations WHERE company_id=c AND source_document_id=doc AND payment_id=doc AND advance_id IS NULL) OR
 pay.advance_amount<>(SELECT coalesce(sum(amount),0) FROM accounting.supplier_advances WHERE company_id=c AND payment_id=doc AND supplier_id=pay.supplier_id AND party_id=pay.party_id) THEN RAISE EXCEPTION 'Supplier payment totals/state mismatch' USING ERRCODE='23514';END IF;
 ELSE
 SELECT * INTO app FROM accounting.supplier_advance_applications WHERE company_id=c AND id=doc;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier settlement source missing' USING ERRCODE='23514';END IF;
 SELECT * INTO ad FROM accounting.supplier_advances WHERE company_id=c AND id=app.advance_id;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=doc AND document_type='SUPPLIER_ADVANCE_APPLICATION' AND state='POSTED') OR
 app.amount<>(SELECT coalesce(sum(amount),0) FROM accounting.supplier_payment_allocations WHERE company_id=c AND source_document_id=doc AND advance_id=ad.id AND payment_id=ad.payment_id) OR
 (SELECT sum(amount) FROM accounting.supplier_advance_applications WHERE company_id=c AND advance_id=ad.id)>ad.amount THEN RAISE EXCEPTION 'Supplier application balance/state mismatch' USING ERRCODE='23514';END IF;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=c AND je.id=coalesce(pay.journal_entry_id,app.journal_entry_id) AND pb.source_document_id=doc AND pb.posting_kind=CASE WHEN pay.id IS NOT NULL THEN 'SUPPLIER_PAYMENT' ELSE 'SUPPLIER_ADVANCE_APPLICATION' END) THEN RAISE EXCEPTION 'Supplier settlement journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.supplier_payment_allocations pa JOIN purchase.bill_lines bl ON bl.company_id=pa.company_id AND bl.id=pa.bill_line_id JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id JOIN accounting.supplier_payments sp ON sp.company_id=pa.company_id AND sp.id=pa.payment_id
 WHERE pa.company_id=c AND pa.source_document_id=doc AND (sp.supplier_id<>b.supplier_id OR sp.party_id<>b.party_id OR (SELECT sum(amount) FROM accounting.supplier_payment_allocations WHERE company_id=c AND bill_line_id=bl.id)>bl.net+bl.tax OR (SELECT sum(gst_amount) FROM accounting.supplier_payment_allocations WHERE company_id=c AND bill_line_id=bl.id)>bl.recoverable_tax OR
 (b.gst_basis='CASH' AND NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_attributions ga WHERE ga.company_id=c AND ga.allocation_id=pa.id AND ga.source_document_id=doc AND ga.bill_line_id=bl.id AND ga.amount=pa.amount AND ga.gst_amount=pa.gst_amount AND ga.attribution_date=greatest(sp.paid_on,coalesce(b.tax_invoice_held_on,sp.paid_on)))) OR
 (b.gst_basis='NON_CASH' AND (pa.gst_amount<>0 OR EXISTS(SELECT 1 FROM accounting.purchase_gst_attributions WHERE company_id=c AND allocation_id=pa.id))))) THEN RAISE EXCEPTION 'Supplier allocation or cash GST mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['supplier_payments','supplier_advances','supplier_advance_applications','supplier_payment_allocations','purchase_gst_attributions'] LOOP
 EXECUTE format('CREATE CONSTRAINT TRIGGER supplier_settlement_consistency AFTER INSERT ON accounting.%I DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_supplier_settlement()',tb);END LOOP;END $$;
REVOKE ALL ON FUNCTION identity.seed_supplier_payment_roles(uuid),purchase.supplier_settlement_number(text),purchase.check_supplier_allocations(jsonb,boolean),purchase.allocate_supplier_payment(uuid,uuid,uuid,uuid,jsonb,date,date),purchase.post_supplier_payment(uuid,numeric,numeric,text,text,date,text,jsonb),purchase.apply_supplier_advance(uuid,text,jsonb),purchase.guard_supplier_settlement_document(),purchase.validate_supplier_settlement() FROM PUBLIC;
GRANT SELECT ON accounting.supplier_payments,accounting.supplier_advances,accounting.supplier_advance_applications,accounting.supplier_payment_allocations,accounting.purchase_gst_attributions,accounting.ap_balances,accounting.supplier_advance_balances TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.post_supplier_payment(uuid,numeric,numeric,text,text,date,text,jsonb),purchase.apply_supplier_advance(uuid,text,jsonb) TO htt_app;
