-- Immutable settlement ledgers. Existing invoice/AR/credit projections remain intact.
CREATE TABLE accounting.customer_receipts (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),customer_id uuid NOT NULL,
 received_on date NOT NULL,method text NOT NULL CHECK(method IN ('BANK_TRANSFER','CARD','CASH')),reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),
 amount numeric(20,2) NOT NULL CHECK(amount>0),allocated_amount numeric(20,2) NOT NULL CHECK(allocated_amount>=0),advance_amount numeric(20,2) NOT NULL CHECK(advance_amount>=0 AND amount=allocated_amount+advance_amount),bank_account_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,id,customer_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,bank_account_id) REFERENCES accounting.accounts(company_id,id)
);
CREATE UNIQUE INDEX receipt_reference ON accounting.customer_receipts(company_id,lower(reference));
CREATE TABLE accounting.customer_advances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),receipt_id uuid NOT NULL,order_line_id uuid NOT NULL,
 amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0),gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),tax_code_id uuid NOT NULL,output_account_id uuid,clearing_account_id uuid NOT NULL,advance_account_id uuid NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,receipt_id,order_line_id),UNIQUE(company_id,id,receipt_id),
 FOREIGN KEY(company_id,receipt_id) REFERENCES accounting.customer_receipts(company_id,id),FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id),FOREIGN KEY(company_id,output_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,clearing_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,advance_account_id) REFERENCES accounting.accounts(company_id,id),CHECK(gst_amount=0 OR output_account_id IS NOT NULL)
);
CREATE TABLE accounting.advance_applications (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),advance_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),consumed_gst numeric(20,2) NOT NULL CHECK(consumed_gst>=0),reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.customer_advances(company_id,id)
);
CREATE UNIQUE INDEX application_reference ON accounting.advance_applications(company_id,lower(reference));
CREATE TABLE accounting.payment_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_document_id uuid NOT NULL,receipt_id uuid NOT NULL,advance_id uuid,invoice_line_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0),
 UNIQUE(company_id,id),UNIQUE(company_id,source_document_id,invoice_line_id),
 FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,receipt_id) REFERENCES accounting.customer_receipts(company_id,id),FOREIGN KEY(company_id,advance_id,receipt_id) REFERENCES accounting.customer_advances(company_id,id,receipt_id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id)
);
CREATE TABLE accounting.gst_attributions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_document_id uuid NOT NULL,receipt_id uuid,advance_id uuid,invoice_line_id uuid,
 kind text NOT NULL CHECK(kind IN ('CASH_RECEIPT','ADVANCE_RECEIPT','ADVANCE_TRANSFER','ADVANCE_APPLIED','NON_CASH_INVOICE')),gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),attribution_date date NOT NULL,tax_code_id uuid NOT NULL,amount numeric(20,2) NOT NULL,gst_amount numeric(20,2) NOT NULL,
 UNIQUE(company_id,id),UNIQUE NULLS NOT DISTINCT(company_id,source_document_id,kind,advance_id,invoice_line_id),
 FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,receipt_id) REFERENCES accounting.customer_receipts(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.customer_advances(company_id,id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id)
);
CREATE TABLE accounting.advance_gst_clearings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),advance_id uuid NOT NULL,invoice_line_id uuid NOT NULL,gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>0),
 UNIQUE(company_id,id),UNIQUE(company_id,advance_id,invoice_line_id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.customer_advances(company_id,id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id)
);
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['customer_receipts','customer_advances','advance_applications','payment_allocations','gst_attributions','advance_gst_clearings'] LOOP
 EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);
 EXECUTE format('CREATE INDEX ON accounting.%I(company_id)',t);
 EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',t);
 END LOOP;END $$;
CREATE INDEX ON accounting.customer_advances(company_id,order_line_id);
CREATE INDEX ON accounting.payment_allocations(company_id,invoice_line_id);
CREATE INDEX ON accounting.payment_allocations(company_id,advance_id);
CREATE INDEX ON accounting.advance_applications(company_id,advance_id);
CREATE INDEX ON accounting.gst_attributions(company_id,attribution_date);
CREATE INDEX ON accounting.advance_gst_clearings(company_id,advance_id);
INSERT INTO identity.permissions(code,description) VALUES('accounting.receipts.read','Read assigned customer receipts/advances'),('accounting.receipts.write','Record bank receipts for assigned customers'),('accounting.advances.apply','Apply advances to their order invoices'),('accounting.gst.read','Read GST attribution audit ledger');
CREATE FUNCTION identity.seed_receipt_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code IN ('ADMIN','FINANCE') AND p.code IN ('accounting.receipts.read','accounting.receipts.write','accounting.advances.apply','accounting.gst.read')) OR
 (r.code='OFFICE' AND p.code IN ('accounting.receipts.read','accounting.receipts.write','accounting.advances.apply'))) ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'2300','Customer advances','LIABILITY'),(c,'1400','GST on uninvoiced advances','ASSET') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,v.purpose,a.id FROM (VALUES('CUSTOMER_ADVANCES','2300'),('GST_ADVANCE_CLEARING','1400')) v(purpose,code) JOIN accounting.accounts a ON a.company_id=c AND a.code=v.code ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'CUSTOMER_RECEIPT','RC-'),(c,'ADVANCE_APPLICATION','AA-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_receipt_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.settlement_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE n bigint;p text;BEGIN
 IF t NOT IN ('CUSTOMER_RECEIPT','ADVANCE_APPLICATION') THEN RAISE EXCEPTION 'Invalid sequence' USING ERRCODE='HR422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Settlement sequence missing' USING ERRCODE='HR422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION accounting.settlement_account(p_purpose text,p_kind text,p_control text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE v uuid;BEGIN
 SELECT m.account_id INTO v FROM accounting.account_mappings m JOIN accounting.accounts a ON a.company_id=m.company_id AND a.id=m.account_id AND a.active AND a.kind=p_kind AND (p_control IS NULL OR a.control_kind=p_control) WHERE m.company_id=core.current_company() AND m.purpose=p_purpose FOR SHARE OF m,a;
 IF NOT FOUND THEN RAISE EXCEPTION 'Settlement account mapping missing or invalid: %',p_purpose USING ERRCODE='HR422';END IF;RETURN v;END $$;
CREATE FUNCTION accounting.check_allocations(items jsonb,allow_empty boolean) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items)>50 OR (NOT allow_empty AND jsonb_array_length(items)=0) THEN RAISE EXCEPTION 'Supply up to 50 distinct allocation lines' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) jrow WHERE (jrow->>'amount') IS NULL OR (jrow->>'amount')::numeric<=0 OR (jrow->>'amount')::numeric<>round((jrow->>'amount')::numeric,2) OR (jrow->>'amount')::numeric>999999999999999999.99) THEN RAISE EXCEPTION 'Allocation amounts must be positive AUD cents' USING ERRCODE='HR422';END IF;
END $$;
-- Shared immutable allocation primitive, callable only by the definer settlement commands.
CREATE FUNCTION accounting.allocate_payment(doc uuid,rid uuid,aid uuid,cust uuid,items jsonb,cash_date date,expected_order_line uuid DEFAULT NULL) RETURNS numeric
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();x jsonb;l record;paid numeric;tax_paid numeric;v numeric;t numeric;total_tax numeric:=0;
BEGIN
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) z GROUP BY z->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate invoice line' USING ERRCODE='HR422';END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'invoiceLineId' LOOP
 SELECT il.*,i.customer_id,i.gst_basis,i.invoice_date FROM sales.invoice_lines il JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE il.company_id=c AND il.id=(x->>'invoiceLineId')::uuid INTO l;
 IF NOT FOUND OR l.customer_id<>cust THEN RAISE EXCEPTION 'Invoice line unavailable for this customer' USING ERRCODE='HT404';END IF;
 IF expected_order_line IS NOT NULL AND l.order_line_id<>expected_order_line THEN RAISE EXCEPTION 'Advance belongs to a different order line' USING ERRCODE='HR422';END IF;
 IF aid IS NULL AND l.gst_basis='NON_CASH' AND cash_date<l.invoice_date THEN RAISE EXCEPTION 'Earlier non-cash consideration requires a prepayment tax review' USING ERRCODE='HR422';END IF;
 v:=(x->>'amount')::numeric;
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO paid,tax_paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=l.id;
 IF paid+v>l.gross THEN RAISE EXCEPTION 'Allocation exceeds invoice balance' USING ERRCODE='HR409';END IF;
 t:=round(l.tax*(paid+v)/l.gross,2)-tax_paid;
 INSERT INTO accounting.payment_allocations(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,v,t);
 IF l.gst_basis='CASH' THEN
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,CASE WHEN aid IS NULL THEN 'CASH_RECEIPT' ELSE 'ADVANCE_APPLIED' END,'CASH',cash_date,l.tax_code_id,v,t);
 END IF;total_tax:=total_tax+t;
 END LOOP;RETURN total_tax;END $$;

CREATE FUNCTION accounting.post_receipt(cust uuid,p_amount numeric,p_method text,p_reference text,p_date date,items jsonb,prepayments jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();rid uuid:=gen_random_uuid();aid uuid;customer crm.customers;company core.companies;
 oid uuid;today date;actual date;allocated numeric;prepaid numeric;bank uuid;ar uuid;adv_account uuid;clearing uuid;output uuid;taxcode uuid;
 x jsonb;l record;v numeric;t numeric;prior_amount numeric;prior_tax numeric;billed numeric;billed_tax numeric;cleared numeric;remaining numeric;basis text;
 postings jsonb:='[]';ignored numeric;
BEGIN
 PERFORM sales.require_customer_access('accounting.receipts.write',cust);
 PERFORM accounting.check_allocations(items,true);PERFORM accounting.check_allocations(prepayments,true);
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(prepayments) z GROUP BY z->>'orderLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate advance order line' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum((jrow->>'amount')::numeric),0) INTO allocated FROM jsonb_array_elements(items) jrow;
 SELECT coalesce(sum((jrow->>'amount')::numeric),0) INTO prepaid FROM jsonb_array_elements(prepayments) jrow;
 IF p_amount IS NULL OR p_amount<=0 OR p_amount<>round(p_amount,2) OR p_amount>999999999999999999.99 OR p_amount<>allocated+prepaid OR p_method IS NULL OR p_method NOT IN ('BANK_TRANSFER','CARD','CASH') OR p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Receipt amount, split, method or reference invalid' USING ERRCODE='HR422';END IF;
 -- Deterministic order locks precede the common customer/exposure lock, matching invoices/cancellations.
 FOR oid IN SELECT DISTINCT demand.order_id FROM (SELECT i.order_id FROM jsonb_array_elements(items) jrow JOIN sales.invoice_lines il ON il.company_id=c AND il.id=(jrow->>'invoiceLineId')::uuid JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id UNION ALL SELECT ol.order_id FROM jsonb_array_elements(prepayments) jrow JOIN sales.order_lines ol ON ol.company_id=c AND ol.id=(jrow->>'orderLineId')::uuid) demand ORDER BY demand.order_id LOOP
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;END LOOP;
 SELECT * INTO customer FROM crm.customers WHERE company_id=c AND id=cust FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Customer unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM sales.lock_credit(cust);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;
 SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;actual:=coalesce(p_date,today);
 IF actual>today THEN RAISE EXCEPTION 'Receipt date cannot be in the future' USING ERRCODE='HR422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=actual AND ends_on>actual AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Receipt date requires an open accounting period' USING ERRCODE='HR422';END IF;
 bank:=accounting.settlement_account('BANK','ASSET','BANK');IF allocated>0 THEN ar:=accounting.settlement_account('AR','ASSET','AR');END IF;
 IF prepaid>0 THEN adv_account:=accounting.settlement_account('CUSTOMER_ADVANCES','LIABILITY');clearing:=accounting.settlement_account('GST_ADVANCE_CLEARING','ASSET');END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(rid,c,'CUSTOMER_RECEIPT',accounting.settlement_number('CUSTOMER_RECEIPT'),actual,'CONFIRMED',a);
 INSERT INTO accounting.customer_receipts(id,company_id,customer_id,received_on,method,reference,amount,allocated_amount,advance_amount,bank_account_id,created_by) VALUES(rid,c,cust,actual,p_method,trim(p_reference),p_amount,allocated,prepaid,bank,a);
 postings:=jsonb_build_array(jsonb_build_object('accountId',bank,'debit',p_amount));
 IF allocated>0 THEN ignored:=accounting.allocate_payment(rid,rid,NULL,cust,items,actual);postings:=postings||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',customer.party_id,'credit',allocated));END IF;
 IF prepaid>0 THEN postings:=postings||jsonb_build_array(jsonb_build_object('accountId',adv_account,'credit',prepaid));END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(prepayments) ORDER BY value->>'orderLineId' LOOP
 SELECT ol.*,o.customer_id,d.state,ql.tax_rate,ql.snapshot->>'taxCode' AS tax_code FROM sales.order_lines ol JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id JOIN sales.quote_lines ql ON ql.company_id=ol.company_id AND ql.id=ol.source_quote_line_id WHERE ol.company_id=c AND ol.id=(x->>'orderLineId')::uuid INTO l;
 IF NOT FOUND OR l.customer_id<>cust THEN RAISE EXCEPTION 'Advance order line unavailable' USING ERRCODE='HT404';END IF;
 IF l.state<>'CONFIRMED' THEN RAISE EXCEPTION 'Advance requires a confirmed order' USING ERRCODE='HR409';END IF;
 v:=(x->>'amount')::numeric;
 SELECT coalesce(sum(il.gross),0),coalesce(sum(il.tax),0) INTO billed,billed_tax FROM sales.invoice_lines il WHERE il.company_id=c AND il.order_line_id=l.id;
 SELECT coalesce(sum(ad.amount-coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=ad.company_id AND ap.advance_id=ad.id),0)),0),coalesce(sum(ad.amount),0),coalesce(sum(ad.gst_amount),0) INTO remaining,prior_amount,prior_tax FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id;
 IF v>l.gross-billed-remaining THEN RAISE EXCEPTION 'Advance exceeds unfunded uninvoiced order balance' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id AND ad.gst_basis<>company.gst_basis) THEN RAISE EXCEPTION 'GST basis transition requires tax review' USING ERRCODE='HR422';END IF;
 IF l.tax_rate>0 AND NOT company.gst_registered THEN RAISE EXCEPTION 'GST registration required for taxable advance' USING ERRCODE='HR422';END IF;
 SELECT tc.id INTO taxcode FROM accounting.tax_codes tc WHERE tc.company_id=c AND tc.code=l.tax_code;
 IF NOT FOUND THEN RAISE EXCEPTION 'Frozen order tax code missing' USING ERRCODE='HR422';END IF;
 basis:=company.gst_basis;
 IF basis='CASH' THEN t:=round(l.tax*(prior_amount+v)/l.gross,2)-round(l.tax*prior_amount/l.gross,2);
 ELSE
 SELECT coalesce(sum(g.gst_amount),0) INTO cleared FROM accounting.advance_gst_clearings g JOIN accounting.customer_advances ad ON ad.company_id=g.company_id AND ad.id=g.advance_id WHERE ad.company_id=c AND ad.order_line_id=l.id;
 t:=greatest(0,l.tax-billed_tax-(prior_tax-cleared));END IF;
 output:=NULL;
 IF l.tax>0 THEN SELECT m.output_account_id INTO output FROM accounting.tax_account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.output_account_id AND ac.active AND ac.kind='LIABILITY' AND ac.control_kind='GST' WHERE m.company_id=c AND m.tax_code_id=taxcode FOR SHARE OF m,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'GST output mapping invalid' USING ERRCODE='HR422';END IF;
 END IF;
 IF t>0 THEN postings:=postings||jsonb_build_array(jsonb_build_object('accountId',clearing,'debit',t),jsonb_build_object('accountId',output,'credit',t));END IF;
 aid:=gen_random_uuid();INSERT INTO accounting.customer_advances(id,company_id,receipt_id,order_line_id,amount,gst_amount,gst_basis,tax_code_id,output_account_id,clearing_account_id,advance_account_id) VALUES(aid,c,rid,l.id,v,t,basis,taxcode,output,clearing,adv_account);
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,rid,rid,aid,'ADVANCE_RECEIPT',basis,actual,taxcode,v,t);
 END LOOP;
 PERFORM accounting.post_journal(rid,1,'CUSTOMER_RECEIPT',actual,'Customer receipt',postings);
 UPDATE crm.customer_credit_exposures SET receivable=receivable-allocated,available_advances=available_advances+prepaid WHERE company_id=c AND customer_id=cust;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=rid;RETURN rid;
END $$;
CREATE FUNCTION accounting.apply_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();application uuid:=gen_random_uuid();ad accounting.customer_advances;r accounting.customer_receipts;customer crm.customers;
 oid uuid;today date;v numeric;used numeric;previous_gst numeric;original_gst numeric;target_gst numeric;delta numeric;ar uuid;posts jsonb;adjustment jsonb;
BEGIN
 SELECT * INTO ad FROM accounting.customer_advances WHERE company_id=c AND id=p_advance;
 IF NOT FOUND THEN RAISE EXCEPTION 'Advance unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=ad.receipt_id;
 PERFORM sales.require_customer_access('accounting.advances.apply',r.customer_id);
 PERFORM accounting.check_allocations(items,false);
 IF p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Application reference required' USING ERRCODE='HR422';END IF;
 SELECT order_id INTO oid FROM sales.order_lines WHERE company_id=c AND id=ad.order_line_id;
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;
 SELECT * INTO customer FROM crm.customers WHERE company_id=c AND id=r.customer_id FOR UPDATE;
 PERFORM 1 FROM sales.lock_credit(r.customer_id);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application requires open period' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) jrow JOIN sales.invoice_lines il ON il.company_id=c AND il.id=(jrow->>'invoiceLineId')::uuid JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE i.gst_basis<>ad.gst_basis OR il.tax_code_id<>ad.tax_code_id) THEN RAISE EXCEPTION 'Advance tax basis/code differs from invoice' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum((jrow->>'amount')::numeric),0) INTO v FROM jsonb_array_elements(items) jrow;
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used,previous_gst FROM accounting.advance_applications WHERE company_id=c AND advance_id=ad.id;
 IF used+v>ad.amount THEN RAISE EXCEPTION 'Advance balance insufficient' USING ERRCODE='HR409';END IF;
 original_gst:=CASE WHEN ad.gst_basis='CASH' THEN round(ad.gst_amount*(used+v)/ad.amount,2)-previous_gst ELSE 0 END;
 ar:=accounting.settlement_account('AR','ASSET','AR');
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(application,c,'ADVANCE_APPLICATION',accounting.settlement_number('ADVANCE_APPLICATION'),today,'CONFIRMED',a);
 INSERT INTO accounting.advance_applications(id,company_id,advance_id,amount,consumed_gst,reference,created_by) VALUES(application,c,ad.id,v,original_gst,trim(p_reference),a);
 target_gst:=accounting.allocate_payment(application,r.id,ad.id,r.customer_id,items,r.received_on,ad.order_line_id);
 posts:=jsonb_build_array(jsonb_build_object('accountId',ad.advance_account_id,'debit',v),jsonb_build_object('accountId',ar,'partyId',customer.party_id,'credit',v));
 IF ad.gst_basis='CASH' THEN
 delta:=target_gst-original_gst;
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=r.received_on AND ends_on>r.received_on AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cash GST rounding adjustment requires original receipt period open' USING ERRCODE='HR422';END IF;
 adjustment:=CASE WHEN delta>0 THEN jsonb_build_array(jsonb_build_object('accountId',ad.clearing_account_id,'debit',delta),jsonb_build_object('accountId',ad.output_account_id,'credit',delta)) ELSE jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',-delta),jsonb_build_object('accountId',ad.clearing_account_id,'credit',-delta)) END;
 PERFORM accounting.post_journal(application,1,'CASH_GST_ROUNDING',r.received_on,'Advance GST rounding at original receipt date',adjustment);
 END IF;
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,application,r.id,ad.id,'ADVANCE_TRANSFER','CASH',r.received_on,ad.tax_code_id,-v,-original_gst);
 IF target_gst>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',target_gst),jsonb_build_object('accountId',ad.clearing_account_id,'credit',target_gst));END IF;
 END IF;
 PERFORM accounting.post_journal(application,1,'ADVANCE_APPLICATION',today,'Apply customer advance',posts);
 UPDATE crm.customer_credit_exposures SET receivable=receivable-v,available_advances=available_advances-v WHERE company_id=c AND customer_id=r.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=application;RETURN application;
END $$;
-- A non-cash prepayment attributes the still-uninvoiced supply's GST in full. Invoicing clears that earlier GL tax once.
CREATE FUNCTION accounting.invoice_gst_attribution() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;i sales.invoices;il sales.invoice_lines;ad record;remaining numeric;v numeric;cleared numeric:=0;posts jsonb:='[]';docversion bigint;
BEGIN
 SELECT * INTO il FROM sales.invoice_lines WHERE company_id=c AND id=NEW.invoice_line_id;
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=il.invoice_id;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances WHERE company_id=c AND order_line_id=il.order_line_id AND gst_basis<>i.gst_basis) THEN RAISE EXCEPTION 'Prepayment tax basis transition requires review' USING ERRCODE='HR422';END IF;
 IF i.gst_basis='NON_CASH' THEN
 remaining:=NEW.tax;
 FOR ad IN SELECT a.*,a.gst_amount-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=a.company_id AND g.advance_id=a.id),0) AS pending FROM accounting.customer_advances a WHERE a.company_id=c AND a.order_line_id=il.order_line_id AND a.gst_basis='NON_CASH' ORDER BY a.receipt_id,a.id LOOP
 v:=least(remaining,ad.pending);
 IF v>0 THEN
 INSERT INTO accounting.advance_gst_clearings(company_id,advance_id,invoice_line_id,gst_amount) VALUES(c,ad.id,il.id,v);
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.clearing_account_id,'credit',v));cleared:=cleared+v;remaining:=remaining-v;
 END IF;END LOOP;
 IF cleared>0 THEN
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',NEW.output_account_id,'debit',cleared));
 SELECT version INTO docversion FROM platform.documents WHERE company_id=c AND id=i.id;
 PERFORM accounting.post_journal(i.id,docversion,'ADVANCE_GST_CLEARING_'||il.id::text,i.invoice_date,'Clear previously attributed non-cash advance GST',posts);
 END IF;
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,i.id,il.id,'NON_CASH_INVOICE','NON_CASH',i.invoice_date,NEW.tax_code_id,il.gross,NEW.tax-cleared);
 END IF;RETURN NEW;
END $$;
CREATE TRIGGER invoice_tax_attribution AFTER INSERT ON accounting.sales_gst_entries FOR EACH ROW EXECUTE FUNCTION accounting.invoice_gst_attribution();
-- Historical non-cash invoice tax is identifiable; no cash receipts or historical advance origins are fabricated.
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount)
 SELECT c,i.id,l.id,'NON_CASH_INVOICE','NON_CASH',i.invoice_date,g.tax_code_id,l.gross,g.tax FROM accounting.sales_gst_entries g JOIN sales.invoice_lines l ON l.company_id=g.company_id AND l.id=g.invoice_line_id JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id WHERE i.company_id=c AND i.gst_basis='NON_CASH';
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.guard_settlement_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='POSTED' AND (EXISTS(SELECT 1 FROM accounting.customer_receipts WHERE company_id=OLD.company_id AND id=OLD.id) OR EXISTS(SELECT 1 FROM accounting.advance_applications WHERE company_id=OLD.company_id AND id=OLD.id)) THEN RAISE EXCEPTION 'Posted settlement document is immutable' USING ERRCODE='23514';END IF;
 IF NEW.state='CANCELLED' AND OLD.document_type='SALES_ORDER' AND EXISTS(SELECT 1 FROM accounting.customer_advances a JOIN sales.order_lines l ON l.company_id=a.company_id AND l.id=a.order_line_id WHERE l.company_id=OLD.company_id AND l.order_id=OLD.id AND a.amount>coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)) THEN RAISE EXCEPTION 'Prepaid order requires an advance refund workflow' USING ERRCODE='HR409';END IF;RETURN NEW;END $$;
CREATE TRIGGER settlement_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION accounting.guard_settlement_documents();
CREATE FUNCTION accounting.validate_settlement() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r accounting.customer_receipts;ap accounting.advance_applications;rid uuid;doc uuid;v numeric;pre numeric;
BEGIN
 IF TG_TABLE_NAME='customer_receipts' THEN rid:=NEW.id;ELSIF TG_TABLE_NAME='customer_advances' OR TG_TABLE_NAME='payment_allocations' THEN rid:=NEW.receipt_id;
 ELSE SELECT receipt_id INTO rid FROM accounting.customer_advances WHERE company_id=NEW.company_id AND id=NEW.advance_id;END IF;
 SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=NEW.company_id AND id=rid;
 SELECT coalesce(sum(amount),0) INTO v FROM accounting.payment_allocations WHERE company_id=r.company_id AND source_document_id=r.id;
 SELECT coalesce(sum(amount),0) INTO pre FROM accounting.customer_advances WHERE company_id=r.company_id AND receipt_id=r.id;
 IF v<>r.allocated_amount OR pre<>r.advance_amount THEN RAISE EXCEPTION 'Receipt split differs from settlement ledger' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=r.company_id AND id=r.id AND state='POSTED') THEN RAISE EXCEPTION 'Receipt must be posted' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.payment_allocations pa JOIN sales.invoice_lines il ON il.company_id=pa.company_id AND il.id=pa.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE pa.company_id=r.company_id AND pa.receipt_id=r.id AND i.customer_id<>r.customer_id) THEN RAISE EXCEPTION 'Receipt/invoice customer mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id AND ad.amount<coalesce((SELECT sum(amount) FROM accounting.advance_applications WHERE company_id=ad.company_id AND advance_id=ad.id),0)) THEN RAISE EXCEPTION 'Advance overallocated' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.payment_allocations pa JOIN sales.invoice_lines il ON il.company_id=pa.company_id AND il.id=pa.invoice_line_id WHERE pa.company_id=r.company_id AND pa.receipt_id=r.id AND il.gross<(SELECT sum(amount) FROM accounting.payment_allocations WHERE company_id=il.company_id AND invoice_line_id=il.id)) THEN RAISE EXCEPTION 'Invoice overallocated' USING ERRCODE='23514';END IF;
 FOR ap IN SELECT aa.* FROM accounting.advance_applications aa JOIN accounting.customer_advances ad ON ad.company_id=aa.company_id AND ad.id=aa.advance_id WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id LOOP
 SELECT coalesce(sum(amount),0) INTO v FROM accounting.payment_allocations WHERE company_id=ap.company_id AND source_document_id=ap.id AND advance_id=ap.advance_id;
 IF v<>ap.amount OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=ap.company_id AND id=ap.id AND state='POSTED') THEN RAISE EXCEPTION 'Application split/state mismatch' USING ERRCODE='23514';END IF;END LOOP;
 RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER settlement_consistency AFTER INSERT ON accounting.customer_receipts DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_settlement();
CREATE CONSTRAINT TRIGGER settlement_consistency AFTER INSERT ON accounting.customer_advances DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_settlement();
CREATE CONSTRAINT TRIGGER settlement_consistency AFTER INSERT ON accounting.payment_allocations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_settlement();
CREATE CONSTRAINT TRIGGER settlement_consistency AFTER INSERT ON accounting.advance_applications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_settlement();
REVOKE ALL ON FUNCTION identity.seed_receipt_roles(uuid),accounting.settlement_number(text),accounting.settlement_account(text,text,text),accounting.check_allocations(jsonb,boolean),accounting.allocate_payment(uuid,uuid,uuid,uuid,jsonb,date,uuid),accounting.post_receipt(uuid,numeric,text,text,date,jsonb,jsonb),accounting.apply_advance(uuid,text,jsonb),accounting.invoice_gst_attribution(),accounting.guard_settlement_documents(),accounting.validate_settlement() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accounting.post_receipt(uuid,numeric,text,text,date,jsonb,jsonb),accounting.apply_advance(uuid,text,jsonb) TO htt_app;
GRANT SELECT ON accounting.customer_receipts,accounting.customer_advances,accounting.advance_applications,accounting.payment_allocations,accounting.gst_attributions,accounting.advance_gst_clearings TO htt_app;
