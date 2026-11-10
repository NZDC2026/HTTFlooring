-- Independent operating expenses share AP/payment subledgers, never fake receipt/GRNI sources.
ALTER TABLE purchase.bills ADD COLUMN bill_type text NOT NULL DEFAULT 'RECEIPT' CHECK(bill_type IN('RECEIPT','EXPENSE')),
 ADD COLUMN expense_amount numeric(20,2) NOT NULL DEFAULT 0 CHECK(expense_amount>=0);
ALTER TABLE purchase.bill_lines ALTER COLUMN receipt_line_id DROP NOT NULL,ALTER COLUMN grni_item_id DROP NOT NULL;
ALTER TABLE purchase.bill_lines ADD COLUMN expense_account_id uuid,ADD COLUMN description text,ADD COLUMN expense_amount numeric(20,2) NOT NULL DEFAULT 0 CHECK(expense_amount>=0),
 ADD CONSTRAINT expense_account_company FOREIGN KEY(company_id,expense_account_id) REFERENCES accounting.accounts(company_id,id);
DO $$ DECLARE r record;BEGIN
 FOR r IN SELECT conname FROM pg_constraint WHERE conrelid='purchase.bills'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%grni_amount%' AND pg_get_constraintdef(oid) LIKE '%recoverable_tax%' LOOP EXECUTE format('ALTER TABLE purchase.bills DROP CONSTRAINT %I',r.conname);END LOOP;
 FOR r IN SELECT conname FROM pg_constraint WHERE conrelid='purchase.bill_lines'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%grni_amount%' AND pg_get_constraintdef(oid) LIKE '%recoverable_tax%' LOOP EXECUTE format('ALTER TABLE purchase.bill_lines DROP CONSTRAINT %I',r.conname);END LOOP;
END $$;
ALTER TABLE purchase.bills ADD CONSTRAINT bill_debit_allocation CHECK(recoverable_tax BETWEEN 0 AND tax AND grni_amount+expense_amount+recoverable_tax=gross AND ((bill_type='RECEIPT' AND expense_amount=0) OR(bill_type='EXPENSE' AND grni_amount=0)));
ALTER TABLE purchase.bill_lines ADD CONSTRAINT bill_line_debit_allocation CHECK(recoverable_tax BETWEEN 0 AND tax AND grni_amount+expense_amount+recoverable_tax=net+tax),
 ADD CONSTRAINT bill_line_source CHECK((receipt_line_id IS NOT NULL AND grni_item_id IS NOT NULL AND expense_account_id IS NULL AND description IS NULL AND expense_amount=0) OR(receipt_line_id IS NULL AND grni_item_id IS NULL AND expense_account_id IS NOT NULL AND description IS NOT NULL AND length(btrim(description)) BETWEEN 1 AND 2000 AND grni_amount=0 AND quantity=1));
INSERT INTO identity.permissions(code,description) VALUES('purchase.expense_bills.post','Post standalone supplier expense bills without procurement receipt matching');
CREATE FUNCTION identity.seed_expense_bill_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'purchase.expense_bills.post' FROM identity.roles WHERE company_id=c AND code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_expense_bill_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.guard_bill_source() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;BEGIN
 IF TG_TABLE_NAME='bills' THEN
  IF NEW.bill_type='EXPENSE' THEN PERFORM purchase.require_access('purchase.expense_bills.post');IF NEW.created_by<>core.current_actor() THEN RAISE EXCEPTION 'Expense bill actor mismatch' USING ERRCODE='23514';END IF;END IF;
 ELSE
  SELECT bill_type INTO typ FROM purchase.bills WHERE company_id=NEW.company_id AND id=NEW.bill_id;
  IF typ IS NULL OR (typ='RECEIPT' AND NEW.receipt_line_id IS NULL) OR(typ='EXPENSE' AND NEW.receipt_line_id IS NOT NULL) THEN RAISE EXCEPTION 'Bill line source must match bill type' USING ERRCODE='23514';END IF;
  IF typ='EXPENSE' THEN
   PERFORM purchase.require_access('purchase.expense_bills.post');
   IF NOT EXISTS(SELECT 1 FROM accounting.accounts WHERE company_id=NEW.company_id AND id=NEW.expense_account_id AND active AND kind='EXPENSE' AND control_kind IS NULL) THEN RAISE EXCEPTION 'Active non-control expense account required' USING ERRCODE='HP422';END IF;
  END IF;
 END IF;RETURN NEW;
END $$;
CREATE TRIGGER bill_source BEFORE INSERT ON purchase.bills FOR EACH ROW EXECUTE FUNCTION purchase.guard_bill_source();
CREATE TRIGGER bill_line_source BEFORE INSERT ON purchase.bill_lines FOR EACH ROW EXECUTE FUNCTION purchase.guard_bill_source();
CREATE FUNCTION purchase.post_expense_bill(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();bid uuid:=gen_random_uuid();company core.companies;supplier crm.suppliers;supplier_json jsonb;today date;
 x jsonb;v jsonb;tc accounting.tax_codes;ac accounting.accounts;rate numeric;n numeric;t numeric;expense numeric;gst numeric;recover boolean;lid uuid;no int:=0;
 tn numeric:=0;tt numeric:=0;te numeric:=0;tg numeric:=0;built jsonb:='[]';jl jsonb:='[]';input uuid;debit uuid;ap uuid;j uuid;seq bigint;prefix text;
BEGIN
 PERFORM purchase.require_access('purchase.expense_bills.post');PERFORM purchase.require_access('purchase.bills.read');
 SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;
 IF p_invoice IS NULL OR length(btrim(p_invoice)) NOT BETWEEN 1 AND 200 OR p_invoice_date IS NULL OR p_invoice_date=date '0001-01-01' OR p_posting_date IS NULL OR p_invoice_date>p_posting_date OR p_posting_date>today OR p_due IS NULL OR p_due<p_invoice_date OR p_notes IS NULL OR length(p_notes)>2000 OR
 (p_evidence IS NULL)<>(p_held_on IS NULL) OR(p_evidence IS NOT NULL AND (length(btrim(p_evidence)) NOT BETWEEN 1 AND 500 OR p_held_on<p_invoice_date OR p_held_on>p_posting_date)) THEN RAISE EXCEPTION 'Invalid expense invoice number, dates, evidence or notes' USING ERRCODE='HP422';END IF;
 SELECT * INTO supplier FROM crm.suppliers WHERE company_id=c AND id=p_supplier AND status='ACTIVE' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 SELECT jsonb_build_object('supplierId',supplier.id,'partyId',supplier.party_id,'code',supplier.code,'legalName',p.legal_name,'abn',p.abn,'country',p.country,'paymentTermsDays',supplier.payment_terms_days) INTO supplier_json FROM crm.parties p WHERE p.company_id=c AND p.id=supplier.party_id FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=p_posting_date AND ends_on>p_posting_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Expense bill requires an open posting period' USING ERRCODE='HP422';END IF;
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Supply 1..50 expense lines' USING ERRCODE='HP422';END IF;
 -- Stabilize account and tax facts in deterministic order across different invoices.
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id IN(SELECT (value->>'expenseAccountId')::uuid FROM jsonb_array_elements(items)) ORDER BY id FOR SHARE;
 PERFORM 1 FROM accounting.tax_codes WHERE company_id=c AND id IN(SELECT (value->>'taxCodeId')::uuid FROM jsonb_array_elements(items)) ORDER BY id FOR SHARE;
 FOR x IN SELECT * FROM jsonb_array_elements(items) LOOP
  SELECT * INTO ac FROM accounting.accounts WHERE company_id=c AND id=(x->>'expenseAccountId')::uuid AND active AND kind='EXPENSE' AND control_kind IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active non-control expense account required in this company' USING ERRCODE='HP422';END IF;
  SELECT * INTO tc FROM accounting.tax_codes WHERE company_id=c AND id=(x->>'taxCodeId')::uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Expense tax code unavailable' USING ERRCODE='HP422';END IF;
  SELECT tr.rate INTO rate FROM accounting.tax_rates tr WHERE tr.company_id=c AND tr.tax_code_id=tc.id AND tr.effective_from<=p_invoice_date AND(tr.effective_to IS NULL OR tr.effective_to>p_invoice_date) FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tax rate required for supplier invoice date' USING ERRCODE='HP422';END IF;
  n:=(x->>'net')::numeric;t:=(x->>'tax')::numeric;
  IF x->>'description' IS NULL OR length(btrim(x->>'description')) NOT BETWEEN 1 AND 2000 OR n IS NULL OR t IS NULL OR n<0 OR t<0 OR n<>round(n,2) OR t<>round(t,2) OR n>999999999999999999.99 OR t>999999999999999999.99 OR t<>round(n*rate,2) THEN RAISE EXCEPTION 'Explicit net/tax cents must match invoice-date tax policy' USING ERRCODE='HP422';END IF;
  recover:=coalesce((x->>'recoverableGst')::boolean,company.gst_registered AND tc.category='TAXABLE');
  IF recover AND (NOT company.gst_registered OR tc.category<>'TAXABLE') THEN RAISE EXCEPTION 'Recoverable GST requires registration and taxable code' USING ERRCODE='HP422';END IF;
  gst:=CASE WHEN recover THEN t ELSE 0 END;expense:=n+t-gst;input:=NULL;debit:=NULL;
  IF gst>0 THEN
   IF p_evidence IS NULL THEN RAISE EXCEPTION 'Recoverable GST requires verified tax invoice evidence and held date' USING ERRCODE='HP422';END IF;
   SELECT aa.id INTO input FROM accounting.tax_account_mappings tm JOIN accounting.accounts aa ON aa.company_id=tm.company_id AND aa.id=tm.input_account_id AND aa.active AND aa.kind='ASSET' AND aa.control_kind='GST' WHERE tm.company_id=c AND tm.tax_code_id=tc.id FOR SHARE OF tm,aa;
   IF NOT FOUND THEN RAISE EXCEPTION 'Active input GST mapping required' USING ERRCODE='HP422';END IF;
   debit:=CASE WHEN company.gst_basis='CASH' THEN accounting.settlement_account('GST_INPUT_DEFERRED','ASSET','GST') ELSE input END;
  END IF;
  lid:=gen_random_uuid();built:=built||jsonb_build_array(jsonb_build_object('id',lid,'expenseAccountId',ac.id,'description',btrim(x->>'description'),'net',n,'tax',t,'expenseAmount',expense,'recoverableTax',gst,'taxCodeId',tc.id,'taxRate',rate,'inputAccount',input,'debitAccount',debit,
   'snapshot',jsonb_build_object('billType','EXPENSE','description',btrim(x->>'description'),'expenseAccountId',ac.id,'expenseAccountCode',ac.code,'expenseAccountName',ac.name,'taxCode',tc.code,'taxCategory',tc.category,'taxRate',rate,'recoverableGst',recover,'gstRegistered',company.gst_registered,'net',n,'tax',t,'expenseAmount',expense,'recoverableTax',gst)));
  IF expense>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ac.id,'debit',expense,'sourceLineId',lid));END IF;
  IF gst>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',debit,'debit',gst,'sourceLineId',lid));END IF;
  tn:=tn+n;tt:=tt+t;te:=te+expense;tg:=tg+gst;
 END LOOP;
 IF tn+tt>999999999999999999.99 THEN RAISE EXCEPTION 'Expense invoice total exceeds storage limit' USING ERRCODE='HP422';END IF;
 IF tn+tt>0 THEN ap:=accounting.settlement_account('AP','LIABILITY','AP');jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ap,'partyId',supplier.party_id,'credit',tn+tt));END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=c AND document_type='SUPPLIER_BILL' RETURNING next_value-1,document_sequences.prefix INTO seq,prefix;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill sequence missing' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(bid,c,'SUPPLIER_BILL',prefix||lpad(seq::text,greatest(6,length(seq::text)),'0'),p_posting_date,'CONFIRMED',a);
 FOR v IN SELECT * FROM jsonb_array_elements(built) LOOP no:=no+1;INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES((v->>'id')::uuid,c,bid,no,a);END LOOP;
 IF tn+tt>0 THEN j:=accounting.post_journal(bid,1,'SUPPLIER_BILL',p_posting_date,'Standalone supplier expense and AP',jl);END IF;
 INSERT INTO purchase.bills(id,company_id,bill_type,expense_amount,supplier_id,party_id,supplier_invoice,invoice_date,due_on,tax_invoice_reference,tax_invoice_held_on,notes,supplier_snapshot,gst_basis,net,tax,gross,grni_amount,recoverable_tax,journal_entry_id,created_by)
 VALUES(bid,c,'EXPENSE',te,p_supplier,supplier.party_id,btrim(p_invoice),p_invoice_date,p_due,p_evidence,p_held_on,p_notes,supplier_json,company.gst_basis,tn,tt,tn+tt,0,tg,j,a);
 FOR v IN SELECT * FROM jsonb_array_elements(built) LOOP
  lid:=(v->>'id')::uuid;
  INSERT INTO purchase.bill_lines(id,company_id,bill_id,receipt_line_id,grni_item_id,quantity,net,tax,grni_amount,recoverable_tax,tax_code_id,tax_rate,snapshot,expense_account_id,description,expense_amount)
  VALUES(lid,c,bid,NULL,NULL,1,(v->>'net')::numeric,(v->>'tax')::numeric,0,(v->>'recoverableTax')::numeric,(v->>'taxCodeId')::uuid,(v->>'taxRate')::numeric,v->'snapshot',(v->>'expenseAccountId')::uuid,v->>'description',(v->>'expenseAmount')::numeric);
  INSERT INTO accounting.purchase_gst_entries(company_id,bill_line_id,gst_basis,tax_code_id,tax_rate,net,tax,recoverable_tax,input_account_id,debit_account_id,attribution_date)
  VALUES(c,lid,company.gst_basis,(v->>'taxCodeId')::uuid,(v->>'taxRate')::numeric,(v->>'net')::numeric,(v->>'tax')::numeric,(v->>'recoverableTax')::numeric,(v->>'inputAccount')::uuid,(v->>'debitAccount')::uuid,CASE WHEN company.gst_basis='NON_CASH' AND (v->>'recoverableTax')::numeric>0 THEN greatest(p_invoice_date,p_held_on) ELSE NULL END);
 END LOOP;
 INSERT INTO accounting.ap_items(company_id,bill_id,supplier_id,party_id,amount,due_on,account_id,journal_entry_id) VALUES(c,bid,p_supplier,supplier.party_id,tn+tt,p_due,ap,j);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=bid;RETURN bid;
END $$;
REVOKE ALL ON FUNCTION identity.seed_expense_bill_roles(uuid),purchase.guard_bill_source(),purchase.post_expense_bill(uuid,text,date,date,date,text,date,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purchase.post_expense_bill(uuid,text,date,date,date,text,date,text,jsonb) TO htt_app;

CREATE OR REPLACE FUNCTION purchase.validate_bill() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE b purchase.bills;bid uuid;BEGIN
 IF TG_TABLE_NAME='bills' THEN bid:=NEW.id;ELSIF TG_TABLE_NAME='bill_lines' OR TG_TABLE_NAME='ap_items' THEN bid:=NEW.bill_id;ELSE SELECT bill_id INTO bid FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;END IF;
 SELECT * INTO b FROM purchase.bills WHERE company_id=NEW.company_id AND id=bid;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=b.company_id AND id=b.id AND document_type='SUPPLIER_BILL' AND state='POSTED') OR NOT EXISTS(SELECT 1 FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) OR
 (SELECT ROW(sum(net),sum(tax),sum(grni_amount),sum(recoverable_tax),sum(expense_amount)) FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) IS DISTINCT FROM ROW(b.net,b.tax,b.grni_amount,b.recoverable_tax,b.expense_amount) OR
 NOT EXISTS(SELECT 1 FROM accounting.ap_items WHERE company_id=b.company_id AND bill_id=b.id AND supplier_id=b.supplier_id AND party_id=b.party_id AND amount=b.gross AND due_on=b.due_on AND journal_entry_id IS NOT DISTINCT FROM b.journal_entry_id) THEN RAISE EXCEPTION 'Supplier bill totals/state/AP mismatch' USING ERRCODE='23514';END IF;
 IF b.gross>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=b.company_id AND je.id=b.journal_entry_id AND pb.source_document_id=b.id AND pb.posting_kind='SUPPLIER_BILL') THEN RAISE EXCEPTION 'Supplier bill journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_lines bl JOIN purchase.receipt_lines rl ON rl.company_id=bl.company_id AND rl.id=bl.receipt_line_id JOIN accounting.grni_items gi ON gi.company_id=bl.company_id AND gi.id=bl.grni_item_id WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND
 (gi.receipt_line_id<>rl.id OR gi.supplier_id<>b.supplier_id OR gi.party_id<>b.party_id OR (SELECT sum(quantity) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>rl.quantity OR (SELECT sum(grni_amount) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>gi.amount OR NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_entries ge WHERE ge.company_id=bl.company_id AND ge.bill_line_id=bl.id AND ge.net=bl.net AND ge.tax=bl.tax AND ge.recoverable_tax=bl.recoverable_tax AND ge.gst_basis=b.gst_basis AND ge.tax_code_id=bl.tax_code_id AND ge.tax_rate=bl.tax_rate))) THEN RAISE EXCEPTION 'Supplier receipt match or GST ledger mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_lines bl WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_entries ge WHERE ge.company_id=bl.company_id AND ge.bill_line_id=bl.id AND ge.net=bl.net AND ge.tax=bl.tax AND ge.recoverable_tax=bl.recoverable_tax AND ge.gst_basis=b.gst_basis AND ge.tax_code_id=bl.tax_code_id AND ge.tax_rate=bl.tax_rate)) THEN RAISE EXCEPTION 'Supplier bill GST ledger mismatch' USING ERRCODE='23514';END IF;
 IF b.bill_type='EXPENSE' AND EXISTS(SELECT 1 FROM purchase.bill_lines bl WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND (bl.receipt_line_id IS NOT NULL OR bl.grni_item_id IS NOT NULL OR bl.expense_account_id IS NULL OR bl.grni_amount<>0 OR (bl.expense_amount>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_lines jl WHERE jl.company_id=bl.company_id AND jl.journal_entry_id=b.journal_entry_id AND jl.source_line_id=bl.id AND jl.account_id=bl.expense_account_id AND jl.debit=bl.expense_amount AND jl.credit=0)))) THEN RAISE EXCEPTION 'Expense bill source or expense journal mismatch' USING ERRCODE='23514';END IF;
 RETURN NULL;
END $$;
