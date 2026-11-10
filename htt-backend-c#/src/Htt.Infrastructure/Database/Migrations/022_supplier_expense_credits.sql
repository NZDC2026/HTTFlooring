-- Financial adjustment of independent expenses; no stock/receipt/return clearing source is invented.
ALTER TABLE purchase.supplier_credit_notes ADD COLUMN credit_type text NOT NULL DEFAULT 'RECEIPT' CHECK(credit_type IN('RECEIPT','EXPENSE')),
 ADD COLUMN expense_amount numeric(20,2) NOT NULL DEFAULT 0 CHECK(expense_amount>=0),
 ADD CONSTRAINT credit_expense_total CHECK((credit_type='RECEIPT' AND expense_amount=0) OR(credit_type='EXPENSE' AND expense_amount<=gross));
ALTER TABLE purchase.supplier_credit_lines ALTER COLUMN return_line_id DROP NOT NULL,ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE purchase.supplier_credit_lines ADD COLUMN expense_account_id uuid,ADD COLUMN expense_amount numeric(20,2) NOT NULL DEFAULT 0 CHECK(expense_amount>=0),ADD COLUMN snapshot jsonb,
 ADD CONSTRAINT credit_expense_account_company FOREIGN KEY(company_id,expense_account_id) REFERENCES accounting.accounts(company_id,id),
 ADD CONSTRAINT credit_source_kind CHECK((return_line_id IS NOT NULL AND quantity IS NOT NULL AND expense_account_id IS NULL AND expense_amount=0 AND snapshot IS NULL) OR(return_line_id IS NULL AND quantity IS NULL AND expense_account_id IS NOT NULL AND expense_amount=gross-recoverable_tax AND snapshot IS NOT NULL AND jsonb_typeof(snapshot)='object'));
CREATE UNIQUE INDEX expense_credit_line_per_note ON purchase.supplier_credit_lines(company_id,credit_note_id,bill_line_id) WHERE return_line_id IS NULL;
INSERT INTO identity.permissions(code,description) VALUES('purchase.expense_credits.post','Post supplier adjustment notes against standalone expense bills');
CREATE FUNCTION identity.seed_expense_credit_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'purchase.expense_credits.post' FROM identity.roles WHERE company_id=c AND code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_expense_credit_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.guard_expense_credit_source() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;original purchase.bill_lines;BEGIN
 IF TG_TABLE_NAME='supplier_credit_notes' THEN
  SELECT bill_type INTO typ FROM purchase.bills WHERE company_id=NEW.company_id AND id=NEW.bill_id;
  IF typ IS DISTINCT FROM NEW.credit_type THEN RAISE EXCEPTION 'Credit type must match original bill' USING ERRCODE='23514';END IF;
  IF typ='EXPENSE' THEN PERFORM purchase.require_access('purchase.expense_credits.post');IF NEW.created_by<>core.current_actor() THEN RAISE EXCEPTION 'Expense credit actor mismatch' USING ERRCODE='23514';END IF;END IF;
 ELSE
  SELECT * INTO original FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;
  IF NOT FOUND OR(original.receipt_line_id IS NULL)<>(NEW.return_line_id IS NULL) THEN RAISE EXCEPTION 'Credit source must match original bill line' USING ERRCODE='23514';END IF;
  IF original.receipt_line_id IS NULL THEN
   PERFORM purchase.require_access('purchase.expense_credits.post');
   IF NEW.expense_account_id IS DISTINCT FROM original.expense_account_id THEN RAISE EXCEPTION 'Original expense account required' USING ERRCODE='23514';END IF;
  END IF;
 END IF;RETURN NEW;
END $$;
CREATE TRIGGER expense_credit_source BEFORE INSERT ON purchase.supplier_credit_notes FOR EACH ROW EXECUTE FUNCTION purchase.guard_expense_credit_source();
CREATE TRIGGER expense_credit_line_source BEFORE INSERT ON purchase.supplier_credit_lines FOR EACH ROW EXECUTE FUNCTION purchase.guard_expense_credit_source();
CREATE FUNCTION purchase.post_expense_credit(p_bill uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();lid uuid;bill purchase.bills;today date;entry jsonb;src record;bal record;qty numeric;used numeric;used_n numeric;used_t numeric;used_g numeric;n numeric;t numeric;gst numeric;val numeric;tn numeric:=0;tt numeric:=0;te numeric:=0;desired numeric;delta numeric;no int:=0;ap uuid;input uuid;deferred uuid;j uuid;jl jsonb:='[]';original uuid;
BEGIN
 PERFORM purchase.require_access('purchase.expense_credits.post');PERFORM purchase.require_access('purchase.credits.read');PERFORM purchase.require_access('purchase.bills.read');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO bill FROM purchase.bills WHERE company_id=c AND id=p_bill AND bill_type='EXPENSE' AND EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=p_bill AND state='POSTED');
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=bill.supplier_id FOR UPDATE;
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND bill_id=p_bill FOR UPDATE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x GROUP BY x->>'billLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supplier adjustment note reference, reason and distinct expense bill lines required' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'SUPPLIER_CREDIT',purchase.contra_number('SUPPLIER_CREDIT'),today,'CONFIRMED',a);
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'billLineId' LOOP
 SELECT bl.*,ge.input_account_id,ge.debit_account_id FROM purchase.bill_lines bl JOIN accounting.purchase_gst_entries ge ON ge.company_id=bl.company_id AND ge.bill_line_id=bl.id WHERE bl.company_id=c AND bl.id=(entry->>'billLineId')::uuid AND bl.bill_id=p_bill INTO src;
 IF NOT FOUND THEN RAISE EXCEPTION 'Expense bill line unavailable for credit' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'amount')::numeric;
 IF qty IS NULL OR qty<0 OR qty<>round(qty,2) OR qty>999999999999999999.99 OR(qty=0 AND src.net+src.tax>0) THEN RAISE EXCEPTION 'Explicit positive gross expense credit cents required; zero only for zero-valued source' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(gross),0),coalesce(sum(net),0),coalesce(sum(tax),0),coalesce(sum(recoverable_tax),0) INTO used,used_n,used_t,used_g FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=src.id;
 IF used+qty>src.net+src.tax OR(src.net+src.tax=0 AND EXISTS(SELECT 1 FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=src.id)) THEN RAISE EXCEPTION 'Credit exceeds original expense remainder' USING ERRCODE='HP409';END IF;
 n:=CASE WHEN src.net+src.tax=0 THEN 0 ELSE round(src.net*(used+qty)/(src.net+src.tax),2)-used_n END;t:=qty-n;gst:=CASE WHEN src.recoverable_tax>0 THEN t ELSE 0 END;val:=n+t-gst;
 IF n+t>0 THEN
 SELECT account_id INTO ap FROM accounting.ap_items WHERE company_id=c AND bill_id=p_bill;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ap AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original AP account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ap,'partyId',bill.party_id,'debit',n+t));END IF;
 IF val>0 THEN PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.expense_account_id AND active AND kind='EXPENSE' AND control_kind IS NULL FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original expense account inactive' USING ERRCODE='HP422';END IF;END IF;
 IF gst>0 THEN
 input:=src.input_account_id;deferred:=src.debit_account_id;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original credit GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END,'credit',gst));END IF;
 no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,cid,no,a);
 IF val>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.expense_account_id,'credit',val,'sourceLineId',lid));END IF;
 INSERT INTO purchase.supplier_credit_lines(id,company_id,credit_note_id,bill_line_id,return_line_id,quantity,net,tax,gross,recoverable_tax,expense_account_id,expense_amount,snapshot) VALUES(lid,c,cid,src.id,NULL,NULL,n,t,n+t,gst,src.expense_account_id,val,src.snapshot||jsonb_build_object('billLineId',src.id,'creditNet',n,'creditTax',t,'creditGross',n+t,'creditExpense',val,'creditRecoverableTax',gst));
 IF bill.gst_basis='NON_CASH' AND gst>0 THEN INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.id,lid,'CREDIT_NOTE','NON_CASH',today,-n-t,-gst);
 ELSIF bill.gst_basis='CASH' THEN
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=src.id;
 IF bal.net_paid_amount<=bal.remaining_gross THEN
 desired:=CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*bal.net_paid_amount/bal.remaining_gross,2) END;delta:=desired-bal.cash_tax_balance;
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',src.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.id,lid,'CREDIT_REBASE','CASH',today,0,delta);
 END IF;END IF;
 END IF;tn:=tn+n;tt:=tt+t;te:=te+val;
 END LOOP;
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(cid,1,'SUPPLIER_CREDIT',today,'Supplier expense credit / AP, original expense and GST',jl);END IF;
 INSERT INTO purchase.supplier_credit_notes(id,company_id,credit_type,expense_amount,bill_id,supplier_id,reference,reason,net,tax,gross,journal_entry_id,created_by) VALUES(cid,c,'EXPENSE',te,p_bill,bill.supplier_id,btrim(p_reference),btrim(p_reason),tn,tt,tn+tt,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;
 IF j IS NOT NULL AND bill.journal_entry_id IS NOT NULL THEN SELECT posting_batch_id INTO original FROM accounting.journal_entries WHERE company_id=c AND id=bill.journal_entry_id;PERFORM accounting.contra_link(original,j,'SUPPLIER_CREDIT');END IF;RETURN cid;
END $$;

-- Retain the existing physical-return and refund validators; add financial-source checks.
CREATE FUNCTION purchase.validate_expense_credit() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE cn purchase.supplier_credit_notes;b purchase.bills;cid uuid;c uuid:=NEW.company_id;BEGIN
 IF TG_TABLE_NAME='supplier_credit_notes' THEN cid:=NEW.id;ELSE cid:=NEW.credit_note_id;END IF;
 SELECT * INTO cn FROM purchase.supplier_credit_notes WHERE company_id=c AND id=cid;
 SELECT * INTO b FROM purchase.bills WHERE company_id=c AND id=cn.bill_id;
 IF cn.credit_type IS DISTINCT FROM b.bill_type THEN RAISE EXCEPTION 'Supplier credit bill source type mismatch' USING ERRCODE='23514';END IF;
 IF cn.credit_type='EXPENSE' THEN
  IF cn.supplier_id<>b.supplier_id OR cn.expense_amount<>(SELECT sum(expense_amount) FROM purchase.supplier_credit_lines WHERE company_id=c AND credit_note_id=cid) OR
   EXISTS(SELECT 1 FROM purchase.supplier_credit_lines cl JOIN purchase.bill_lines bl ON bl.company_id=cl.company_id AND bl.id=cl.bill_line_id WHERE cl.company_id=c AND cl.credit_note_id=cid AND
    (bl.bill_id<>b.id OR cl.return_line_id IS NOT NULL OR cl.quantity IS NOT NULL OR cl.expense_account_id IS DISTINCT FROM bl.expense_account_id OR
     (SELECT sum(gross) FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id)>bl.net+bl.tax OR
     (SELECT sum(net) FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id)>bl.net OR
     (SELECT sum(tax) FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id)>bl.tax OR
     (SELECT sum(recoverable_tax) FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id)>bl.recoverable_tax OR
     (bl.net+bl.tax=0 AND(SELECT count(*) FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id)>1) OR
     (cl.expense_amount>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_lines jl WHERE jl.company_id=c AND jl.journal_entry_id=cn.journal_entry_id AND jl.account_id=cl.expense_account_id AND jl.source_line_id=cl.id AND jl.credit=cl.expense_amount AND jl.debit=0)))) THEN RAISE EXCEPTION 'Expense credit totals/source/expense journal mismatch' USING ERRCODE='23514';END IF;
 END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER expense_credit_consistency AFTER INSERT ON purchase.supplier_credit_notes DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_expense_credit();
CREATE CONSTRAINT TRIGGER expense_credit_line_consistency AFTER INSERT ON purchase.supplier_credit_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_expense_credit();
REVOKE ALL ON FUNCTION identity.seed_expense_credit_roles(uuid),purchase.guard_expense_credit_source(),purchase.post_expense_credit(uuid,text,text,jsonb),purchase.validate_expense_credit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purchase.post_expense_credit(uuid,text,text,jsonb) TO htt_app;
