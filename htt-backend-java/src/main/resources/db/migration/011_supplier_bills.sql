-- Exact receipt matching: no implicit purchase price/tax variance or retrospective inventory repricing.
CREATE TABLE purchase.bills (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),supplier_id uuid NOT NULL,party_id uuid NOT NULL,
 supplier_invoice text NOT NULL CHECK(length(supplier_invoice) BETWEEN 1 AND 200),invoice_date date NOT NULL,due_on date NOT NULL CHECK(due_on>=invoice_date),
 tax_invoice_reference text, tax_invoice_held_on date,notes text NOT NULL, supplier_snapshot jsonb NOT NULL,
 gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),
 grni_amount numeric(20,2) NOT NULL CHECK(grni_amount>=0),recoverable_tax numeric(20,2) NOT NULL CHECK(recoverable_tax>=0 AND grni_amount+recoverable_tax=gross),
 journal_entry_id uuid,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id),
 CHECK((tax_invoice_reference IS NULL)=(tax_invoice_held_on IS NULL)),CHECK(recoverable_tax=0 OR tax_invoice_reference IS NOT NULL),CHECK(gross=0 OR journal_entry_id IS NOT NULL)
);
CREATE UNIQUE INDEX supplier_invoice_unique ON purchase.bills(company_id,supplier_id,lower(btrim(supplier_invoice)));
CREATE TABLE purchase.bill_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),bill_id uuid NOT NULL,receipt_line_id uuid NOT NULL,grni_item_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),grni_amount numeric(20,2) NOT NULL CHECK(grni_amount>=0),recoverable_tax numeric(20,2) NOT NULL CHECK(recoverable_tax>=0 AND grni_amount+recoverable_tax=net+tax),
 tax_code_id uuid NOT NULL,tax_rate numeric(9,6) NOT NULL,snapshot jsonb NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,bill_id,receipt_line_id),FOREIGN KEY(company_id,id,bill_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,bill_id) REFERENCES purchase.bills(company_id,id),FOREIGN KEY(company_id,receipt_line_id) REFERENCES purchase.receipt_lines(company_id,id),FOREIGN KEY(company_id,grni_item_id) REFERENCES accounting.grni_items(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id)
);
CREATE TABLE accounting.ap_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),bill_id uuid NOT NULL,supplier_id uuid NOT NULL,party_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>=0),due_on date NOT NULL,account_id uuid,journal_entry_id uuid,
 UNIQUE(company_id,id),UNIQUE(company_id,bill_id),FOREIGN KEY(company_id,bill_id) REFERENCES purchase.bills(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id),CHECK(amount=0 OR (account_id IS NOT NULL AND journal_entry_id IS NOT NULL))
);
CREATE TABLE accounting.purchase_gst_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),bill_line_id uuid NOT NULL,gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),tax_code_id uuid NOT NULL,tax_rate numeric(9,6) NOT NULL,net numeric(20,2) NOT NULL,tax numeric(20,2) NOT NULL CHECK(tax>=0),recoverable_tax numeric(20,2) NOT NULL CHECK(recoverable_tax BETWEEN 0 AND tax),input_account_id uuid,debit_account_id uuid,attribution_date date,
 UNIQUE(company_id,id),UNIQUE(company_id,bill_line_id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id),FOREIGN KEY(company_id,input_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,debit_account_id) REFERENCES accounting.accounts(company_id,id),CHECK(recoverable_tax=0 OR (input_account_id IS NOT NULL AND debit_account_id IS NOT NULL)),CHECK(gst_basis<>'CASH' OR attribution_date IS NULL),CHECK(recoverable_tax>0 OR attribution_date IS NULL)
);
DO $$ DECLARE sc text;tb text;BEGIN FOR sc,tb IN SELECT * FROM (VALUES('purchase','bills'),('purchase','bill_lines'),('accounting','ap_items'),('accounting','purchase_gst_entries')) v(s,t) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,tb);EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,tb);
 EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,tb);
 EXECUTE format('CREATE INDEX ON %I.%I(company_id)',sc,tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',sc,tb);
 END LOOP;END $$;
CREATE INDEX ON purchase.bill_lines(company_id,receipt_line_id);
CREATE INDEX ON purchase.bill_lines(company_id,grni_item_id);
CREATE INDEX ON purchase.bills(company_id,supplier_id,invoice_date);
CREATE INDEX ON accounting.ap_items(company_id,supplier_id,due_on);
CREATE INDEX ON accounting.purchase_gst_entries(company_id,attribution_date);
INSERT INTO identity.permissions(code,description) VALUES('purchase.bills.read','Read supplier invoices and receipt matches'),('purchase.bills.post','Post matched supplier invoices'),('purchase.ap.read','Read supplier AP subledger'),('purchase.input_gst.read','Read input GST attribution');
CREATE FUNCTION identity.seed_supplier_bill_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN ('ADMIN','FINANCE') AND p.code IN ('purchase.bills.read','purchase.bills.post','purchase.ap.read','purchase.input_gst.read') ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind,control_kind) VALUES(c,'1410','Input GST pending supplier payment','ASSET','GST') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,'GST_INPUT_DEFERRED',id FROM accounting.accounts WHERE company_id=c AND code='1410' ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SUPPLIER_BILL','SB-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_supplier_bill_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.post_bill(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();bid uuid:=gen_random_uuid();lid uuid;today date;company core.companies;supplier crm.suppliers;snapshot jsonb;
 entry jsonb;src record;prior_q numeric;prior_n numeric;prior_t numeric;qty numeric;n numeric;t numeric;v numeric;gst numeric;tn numeric:=0;tt numeric:=0;tv numeric:=0;tg numeric:=0;
 built jsonb:='[]';jl jsonb:='[]';ap uuid;input_account uuid;debit_account uuid;j uuid;seq bigint;prefix text;no int:=0;gid uuid;
BEGIN
 PERFORM purchase.require_access('purchase.bills.post');
 SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;
 IF p_invoice IS NULL OR length(btrim(p_invoice)) NOT BETWEEN 1 AND 200 OR p_invoice_date IS NULL OR p_invoice_date=date '0001-01-01' OR p_posting_date IS NULL OR p_invoice_date>p_posting_date OR p_posting_date>today OR p_due IS NULL OR p_due<p_invoice_date OR p_notes IS NULL OR length(p_notes)>2000 OR
 (p_evidence IS NULL)<>(p_held_on IS NULL) OR (p_evidence IS NOT NULL AND (length(btrim(p_evidence)) NOT BETWEEN 1 AND 500 OR p_held_on<p_invoice_date OR p_held_on>p_posting_date)) THEN RAISE EXCEPTION 'Invalid invoice number, dates, tax evidence or notes' USING ERRCODE='HP422';END IF;
 SELECT * INTO supplier FROM crm.suppliers WHERE company_id=c AND id=p_supplier AND status='ACTIVE' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 SELECT jsonb_build_object('supplierId',supplier.id,'partyId',supplier.party_id,'code',supplier.code,'legalName',p.legal_name,'abn',p.abn,'country',p.country,'paymentTermsDays',supplier.payment_terms_days) INTO snapshot FROM crm.parties p WHERE p.company_id=c AND p.id=supplier.party_id FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=p_posting_date AND ends_on>p_posting_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill requires an open posting period' USING ERRCODE='HP422';END IF;
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) x GROUP BY x->>'receiptLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supply 1..50 distinct receipt lines' USING ERRCODE='HP422';END IF;
 -- All bills lock the immutable GRNI source rows in the same order. Read matched totals only AFTER the lock.
 FOR gid IN SELECT g.id FROM jsonb_array_elements(items) x JOIN accounting.grni_items g ON g.company_id=c AND g.receipt_line_id=(x->>'receiptLineId')::uuid ORDER BY g.id LOOP
 PERFORM 1 FROM accounting.grni_items WHERE company_id=c AND id=gid FOR UPDATE;
 END LOOP;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) LOOP
 SELECT rl.*,ol.tax_code_id,ol.tax_rate,ol.recoverable_gst,ol.snapshot,po.gst_registered,g.id AS grni_id,g.grni_account_id,r.supplier_id,doc.business_date INTO src
 FROM purchase.receipt_lines rl JOIN purchase.order_lines ol ON ol.company_id=rl.company_id AND ol.id=rl.order_line_id JOIN purchase.orders po ON po.company_id=ol.company_id AND po.id=ol.order_id
 JOIN purchase.receipts r ON r.company_id=rl.company_id AND r.id=rl.receipt_id JOIN platform.documents doc ON doc.company_id=r.company_id AND doc.id=r.id AND doc.state='POSTED' JOIN accounting.grni_items g ON g.company_id=rl.company_id AND g.receipt_line_id=rl.id
 WHERE rl.company_id=c AND rl.id=(entry->>'receiptLineId')::uuid AND r.supplier_id=p_supplier;
 IF NOT FOUND THEN RAISE EXCEPTION 'Receipt line unavailable for supplier' USING ERRCODE='HT404';END IF;
 IF src.gst_registered<>company.gst_registered OR src.business_date>p_posting_date THEN RAISE EXCEPTION 'Registration policy changed or receipt follows posting date' USING ERRCODE='HP422';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,(src.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Positive quantity must respect the frozen purchase step' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(bl.quantity),0),coalesce(sum(bl.net),0),coalesce(sum(bl.tax),0) INTO prior_q,prior_n,prior_t FROM purchase.bill_lines bl WHERE bl.company_id=c AND bl.receipt_line_id=src.id;
 IF prior_q+qty>src.quantity THEN RAISE EXCEPTION 'Bill exceeds unmatched receipt quantity' USING ERRCODE='HP409';END IF;
 n:=round(src.net*(prior_q+qty)/src.quantity,2)-prior_n;t:=round(src.tax*(prior_q+qty)/src.quantity,2)-prior_t;
 IF (entry->>'net')::numeric IS DISTINCT FROM n OR (entry->>'tax')::numeric IS DISTINCT FROM t THEN RAISE EXCEPTION 'Supplier price/tax differs from receipt match; resolve variance before posting' USING ERRCODE='HP422';END IF;
 gst:=CASE WHEN src.recoverable_gst THEN t ELSE 0 END;v:=n+t-gst;input_account:=NULL;debit_account:=NULL;
 IF gst>0 THEN
 IF p_evidence IS NULL THEN RAISE EXCEPTION 'Recoverable GST requires verified tax invoice evidence and held date' USING ERRCODE='HP422';END IF;
 SELECT ac.id INTO input_account FROM accounting.tax_account_mappings tm JOIN accounting.accounts ac ON ac.company_id=tm.company_id AND ac.id=tm.input_account_id AND ac.active AND ac.kind='ASSET' AND ac.control_kind='GST' WHERE tm.company_id=c AND tm.tax_code_id=src.tax_code_id FOR SHARE OF tm,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active input GST account mapping required' USING ERRCODE='HP422';END IF;
 debit_account:=CASE WHEN company.gst_basis='CASH' THEN accounting.settlement_account('GST_INPUT_DEFERRED','ASSET','GST') ELSE input_account END;
 END IF;
 IF v>0 THEN PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.grni_account_id AND active AND kind='LIABILITY' AND control_kind='GRNI' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original receipt GRNI account is inactive' USING ERRCODE='HP422';END IF;END IF;
 lid:=gen_random_uuid();built:=built||jsonb_build_array(jsonb_build_object('id',lid,'receiptLineId',src.id,'grniItemId',src.grni_id,'quantity',qty,'net',n,'tax',t,'grniAmount',v,'recoverableTax',gst,'taxCodeId',src.tax_code_id,'taxRate',src.tax_rate,'snapshot',src.snapshot,'inputAccount',input_account,'debitAccount',debit_account));
 IF v>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.grni_account_id,'partyId',supplier.party_id,'debit',v,'sourceLineId',lid));END IF;
 IF gst>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',debit_account,'debit',gst,'sourceLineId',lid));END IF;
 tn:=tn+n;tt:=tt+t;tv:=tv+v;tg:=tg+gst;
 END LOOP;
 IF tn+tt>0 THEN ap:=accounting.settlement_account('AP','LIABILITY','AP');jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ap,'partyId',supplier.party_id,'credit',tn+tt));END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=c AND document_type='SUPPLIER_BILL' RETURNING next_value-1,document_sequences.prefix INTO seq,prefix;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill sequence missing' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(bid,c,'SUPPLIER_BILL',prefix||lpad(seq::text,greatest(6,length(seq::text)),'0'),p_posting_date,'CONFIRMED',a);
 -- Insert the parent after journal creation, but registry lines must exist for journal source validation.
 FOR entry IN SELECT * FROM jsonb_array_elements(built) LOOP no:=no+1;INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES((entry->>'id')::uuid,c,bid,no,a);END LOOP;
 IF tn+tt>0 THEN j:=accounting.post_journal(bid,1,'SUPPLIER_BILL',p_posting_date,'Matched supplier bill / GRNI clearance and AP',jl);END IF;
 INSERT INTO purchase.bills(id,company_id,supplier_id,party_id,supplier_invoice,invoice_date,due_on,tax_invoice_reference,tax_invoice_held_on,notes,supplier_snapshot,gst_basis,net,tax,gross,grni_amount,recoverable_tax,journal_entry_id,created_by)
 VALUES(bid,c,p_supplier,supplier.party_id,btrim(p_invoice),p_invoice_date,p_due,p_evidence,p_held_on,p_notes,snapshot,company.gst_basis,tn,tt,tn+tt,tv,tg,j,a);
 FOR entry IN SELECT * FROM jsonb_array_elements(built) LOOP
 lid:=(entry->>'id')::uuid;
 INSERT INTO purchase.bill_lines(id,company_id,bill_id,receipt_line_id,grni_item_id,quantity,net,tax,grni_amount,recoverable_tax,tax_code_id,tax_rate,snapshot)
 VALUES(lid,c,bid,(entry->>'receiptLineId')::uuid,(entry->>'grniItemId')::uuid,(entry->>'quantity')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,(entry->>'grniAmount')::numeric,(entry->>'recoverableTax')::numeric,(entry->>'taxCodeId')::uuid,(entry->>'taxRate')::numeric,entry->'snapshot');
 INSERT INTO accounting.purchase_gst_entries(company_id,bill_line_id,gst_basis,tax_code_id,tax_rate,net,tax,recoverable_tax,input_account_id,debit_account_id,attribution_date)
 VALUES(c,lid,company.gst_basis,(entry->>'taxCodeId')::uuid,(entry->>'taxRate')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,(entry->>'recoverableTax')::numeric,(entry->>'inputAccount')::uuid,(entry->>'debitAccount')::uuid,CASE WHEN company.gst_basis='NON_CASH' AND (entry->>'recoverableTax')::numeric>0 THEN greatest(p_invoice_date,p_held_on) ELSE NULL END);
 END LOOP;
 INSERT INTO accounting.ap_items(company_id,bill_id,supplier_id,party_id,amount,due_on,account_id,journal_entry_id) VALUES(c,bid,p_supplier,supplier.party_id,tn+tt,p_due,ap,j);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=bid;RETURN bid;
END $$;
CREATE FUNCTION purchase.guard_bill_document() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF OLD.document_type='SUPPLIER_BILL' AND OLD.state='POSTED' THEN RAISE EXCEPTION 'Posted supplier bill is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER supplier_bill_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_bill_document();
CREATE FUNCTION purchase.validate_bill() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE b purchase.bills;bid uuid;BEGIN
 IF TG_TABLE_NAME='bills' THEN bid:=NEW.id;ELSIF TG_TABLE_NAME='bill_lines' OR TG_TABLE_NAME='ap_items' THEN bid:=NEW.bill_id;ELSE SELECT bill_id INTO bid FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;END IF;
 SELECT * INTO b FROM purchase.bills WHERE company_id=NEW.company_id AND id=bid;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=b.company_id AND id=b.id AND document_type='SUPPLIER_BILL' AND state='POSTED') OR NOT EXISTS(SELECT 1 FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) OR
 (SELECT ROW(sum(net),sum(tax),sum(grni_amount),sum(recoverable_tax)) FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) IS DISTINCT FROM ROW(b.net,b.tax,b.grni_amount,b.recoverable_tax) OR
 NOT EXISTS(SELECT 1 FROM accounting.ap_items WHERE company_id=b.company_id AND bill_id=b.id AND supplier_id=b.supplier_id AND party_id=b.party_id AND amount=b.gross AND due_on=b.due_on AND journal_entry_id IS NOT DISTINCT FROM b.journal_entry_id) THEN RAISE EXCEPTION 'Supplier bill totals/state/AP mismatch' USING ERRCODE='23514';END IF;
 IF b.gross>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=b.company_id AND je.id=b.journal_entry_id AND pb.source_document_id=b.id AND pb.posting_kind='SUPPLIER_BILL') THEN RAISE EXCEPTION 'Supplier bill journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_lines bl JOIN purchase.receipt_lines rl ON rl.company_id=bl.company_id AND rl.id=bl.receipt_line_id JOIN accounting.grni_items gi ON gi.company_id=bl.company_id AND gi.id=bl.grni_item_id WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND
 (gi.receipt_line_id<>rl.id OR gi.supplier_id<>b.supplier_id OR gi.party_id<>b.party_id OR (SELECT sum(quantity) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>rl.quantity OR (SELECT sum(grni_amount) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>gi.amount OR NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_entries ge WHERE ge.company_id=bl.company_id AND ge.bill_line_id=bl.id AND ge.net=bl.net AND ge.tax=bl.tax AND ge.recoverable_tax=bl.recoverable_tax AND ge.gst_basis=b.gst_basis AND ge.tax_code_id=bl.tax_code_id AND ge.tax_rate=bl.tax_rate))) THEN RAISE EXCEPTION 'Supplier receipt match or GST ledger mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER supplier_bill_consistency AFTER INSERT ON purchase.bills DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_bill();
CREATE CONSTRAINT TRIGGER supplier_bill_consistency AFTER INSERT ON purchase.bill_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_bill();
CREATE CONSTRAINT TRIGGER supplier_bill_consistency AFTER INSERT ON accounting.ap_items DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_bill();
CREATE CONSTRAINT TRIGGER supplier_bill_consistency AFTER INSERT ON accounting.purchase_gst_entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_bill();
REVOKE ALL ON FUNCTION identity.seed_supplier_bill_roles(uuid),purchase.post_bill(uuid,text,date,date,date,text,date,text,jsonb),purchase.guard_bill_document(),purchase.validate_bill() FROM PUBLIC;
GRANT SELECT ON purchase.bills,purchase.bill_lines,accounting.ap_items,accounting.purchase_gst_entries TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.post_bill(uuid,text,date,date,date,text,date,text,jsonb) TO htt_app;
