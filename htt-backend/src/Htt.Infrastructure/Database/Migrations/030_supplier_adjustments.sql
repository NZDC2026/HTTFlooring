-- Approved invoice price/tax variances and independent supplier credits.
ALTER TABLE purchase.bills ADD COLUMN cost_variance numeric(20,2) NOT NULL DEFAULT 0,ADD COLUMN variance_reason text;
ALTER TABLE purchase.bill_lines ADD COLUMN cost_variance numeric(20,2) NOT NULL DEFAULT 0,ADD COLUMN receipt_net numeric(20,2),ADD COLUMN receipt_tax numeric(20,2);
ALTER TABLE purchase.bill_lines DISABLE TRIGGER append_only;
UPDATE purchase.bill_lines SET receipt_net=net,receipt_tax=tax WHERE receipt_line_id IS NOT NULL;
ALTER TABLE purchase.bill_lines ENABLE TRIGGER append_only;
ALTER TABLE purchase.bills DROP CONSTRAINT bill_debit_allocation;
ALTER TABLE purchase.bills ADD CONSTRAINT bill_debit_allocation CHECK(recoverable_tax BETWEEN 0 AND tax AND grni_amount+expense_amount+recoverable_tax+cost_variance=gross AND ((bill_type='RECEIPT' AND expense_amount=0) OR(bill_type='EXPENSE' AND grni_amount=0 AND cost_variance=0)));
ALTER TABLE purchase.bill_lines DROP CONSTRAINT bill_line_debit_allocation;
ALTER TABLE purchase.bill_lines ADD CONSTRAINT bill_line_debit_allocation CHECK(recoverable_tax BETWEEN 0 AND tax AND grni_amount+expense_amount+recoverable_tax+cost_variance=net+tax);
ALTER TABLE purchase.supplier_credit_notes ADD COLUMN credit_mode text NOT NULL DEFAULT 'ORIGINAL' CHECK(credit_mode IN('ORIGINAL','AMOUNT'));
ALTER TABLE purchase.supplier_credit_lines ADD COLUMN credit_mode text NOT NULL DEFAULT 'ORIGINAL' CHECK(credit_mode IN('ORIGINAL','AMOUNT')),ADD COLUMN clearing_adjustment numeric(20,2) NOT NULL DEFAULT 0 CHECK(clearing_adjustment>=0);
ALTER TABLE purchase.supplier_credit_lines DROP CONSTRAINT credit_source_kind;
ALTER TABLE purchase.supplier_credit_lines ADD CONSTRAINT credit_source_kind CHECK((credit_mode='ORIGINAL' AND return_line_id IS NOT NULL AND quantity IS NOT NULL AND expense_account_id IS NULL AND expense_amount=0 AND snapshot IS NULL) OR(return_line_id IS NULL AND quantity IS NULL AND expense_account_id IS NOT NULL AND expense_amount=gross-recoverable_tax AND snapshot IS NOT NULL AND jsonb_typeof(snapshot)='object') OR(credit_mode='AMOUNT' AND return_line_id IS NULL AND quantity IS NULL AND expense_account_id IS NULL AND expense_amount=0 AND gross>0 AND snapshot IS NOT NULL AND jsonb_typeof(snapshot)='object'));
CREATE TABLE inventory.purchase_value_adjustments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),document_id uuid NOT NULL,line_id uuid NOT NULL,stock_balance_id uuid,quantity numeric(20,6) NOT NULL CHECK(quantity>0),amount numeric(20,2) NOT NULL,inventory_delta numeric(20,2) NOT NULL,expense_delta numeric(20,2) NOT NULL,inventory_account_id uuid,expense_account_id uuid NOT NULL,on_hand_before numeric(20,6),value_before numeric(20,2),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,line_id),CHECK(inventory_delta+expense_delta=amount),CHECK(stock_balance_id IS NOT NULL OR inventory_delta=0),FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,line_id,document_id) REFERENCES platform.document_lines(company_id,id,document_id) DEFERRABLE INITIALLY DEFERRED,FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),FOREIGN KEY(company_id,inventory_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,expense_account_id) REFERENCES accounting.accounts(company_id,id));
ALTER TABLE inventory.purchase_value_adjustments ENABLE ROW LEVEL SECURITY;ALTER TABLE inventory.purchase_value_adjustments FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.purchase_value_adjustments USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON inventory.purchase_value_adjustments FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE INDEX ON inventory.purchase_value_adjustments(company_id,stock_balance_id);
INSERT INTO identity.permissions(code,description) VALUES('purchase.credits.adjust','Post independent supplier net/tax adjustment'),('purchase.bills.variance.post','Approve actual supplier price/tax variance');
CREATE FUNCTION identity.seed_purchase_adjustment_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('purchase.credits.adjust','purchase.bills.variance.post') ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'5120','Purchase price and tax cost variance','EXPENSE') ON CONFLICT DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,'PURCHASE_PRICE_VARIANCE',id FROM accounting.accounts WHERE company_id=c AND code='5120' ON CONFLICT DO NOTHING;END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_purchase_adjustment_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.amount_credited_line(lid uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT EXISTS(SELECT 1 FROM purchase.supplier_credit_lines WHERE company_id=core.current_company() AND bill_line_id=lid AND credit_mode='AMOUNT') $$;
CREATE FUNCTION inventory.purchase_value_change(doc uuid,lid uuid,balance_id uuid,bqty numeric,change numeric,expense uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();b inventory.stock_balances;v inventory.stock_values;iv numeric:=0;ev numeric;ia uuid;ea uuid;posts jsonb:='[]';BEGIN
 ea:=coalesce(expense,accounting.settlement_account('PURCHASE_PRICE_VARIANCE','EXPENSE'));
 IF balance_id IS NOT NULL THEN
 SELECT * INTO b FROM inventory.stock_balances WHERE company_id=c AND id=balance_id FOR UPDATE;SELECT * INTO v FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=b.id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock cost valuation required before purchase variance' USING ERRCODE='HP409';END IF;
 iv:=round(change*least(b.on_hand/bqty,1),2);IF iv<0 THEN iv:=-least(-iv,v.value);END IF;
 ia:=accounting.settlement_account('INVENTORY','ASSET','INVENTORY');UPDATE inventory.stock_values SET value=value+iv WHERE company_id=c AND id=v.id;
 END IF;ev:=change-iv;
 IF iv<>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ia,'sourceLineId',lid,'debit',greatest(iv,0),'credit',greatest(-iv,0)));END IF;
 IF ev<>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ea,'sourceLineId',lid,'debit',greatest(ev,0),'credit',greatest(-ev,0)));END IF;
 INSERT INTO inventory.purchase_value_adjustments(company_id,document_id,line_id,stock_balance_id,quantity,amount,inventory_delta,expense_delta,inventory_account_id,expense_account_id,on_hand_before,value_before,created_by) VALUES(c,doc,lid,b.id,bqty,change,iv,ev,ia,ea,b.on_hand,v.value,core.current_actor());RETURN posts;END $$;
CREATE OR REPLACE FUNCTION purchase.post_amount_credit(p_bill uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();lid uuid;bill purchase.bills;today date;entry jsonb;src record;bal record;qty numeric;used numeric;used_n numeric;used_t numeric;used_g numeric;n numeric;t numeric;gst numeric;val numeric;tn numeric:=0;tt numeric:=0;te numeric:=0;desired numeric;delta numeric;no int:=0;ap uuid;input uuid;deferred uuid;j uuid;jl jsonb:='[]';original uuid;cost_source record;
BEGIN
 PERFORM purchase.require_access('purchase.credits.adjust');PERFORM purchase.require_access('purchase.credits.read');PERFORM purchase.require_access('purchase.bills.read');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO bill FROM purchase.bills WHERE company_id=c AND id=p_bill AND EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=p_bill AND state='POSTED');
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
 SELECT coalesce(sum(gross),0),coalesce(sum(net),0),coalesce(sum(tax),0),coalesce(sum(recoverable_tax),0) INTO used,used_n,used_t,used_g FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=src.id;
 n:=(entry->>'net')::numeric;t:=(entry->>'tax')::numeric;
 IF n IS NULL OR t IS NULL OR n<0 OR t<0 OR n<>round(n,2) OR t<>round(t,2) OR n+t<=0 OR nullif(btrim(entry->>'description'),'') IS NULL OR length(btrim(entry->>'description'))>500 THEN RAISE EXCEPTION 'Explicit nonnegative net/tax cents and description required' USING ERRCODE='HP422';END IF;
 IF n>src.net-used_n OR t>src.tax-used_t THEN RAISE EXCEPTION 'Supplier credit exceeds remaining original net or tax' USING ERRCODE='HP409';END IF;
 gst:=CASE WHEN src.recoverable_tax>0 THEN t ELSE 0 END;val:=n+t-gst;
 IF n+t>0 THEN
 SELECT account_id INTO ap FROM accounting.ap_items WHERE company_id=c AND bill_id=p_bill;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ap AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original AP account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ap,'partyId',bill.party_id,'debit',n+t));END IF;
 IF bill.bill_type='EXPENSE' AND val>0 THEN PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.expense_account_id AND active AND kind='EXPENSE' AND control_kind IS NULL FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original expense account inactive' USING ERRCODE='HP422';END IF;END IF;
 IF gst>0 THEN
 input:=src.input_account_id;deferred:=src.debit_account_id;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original credit GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END,'credit',gst));END IF;
 no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,cid,no,a);
 IF bill.bill_type='EXPENSE' THEN IF val>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.expense_account_id,'credit',val,'sourceLineId',lid));END IF;ELSE SELECT rl.stock_balance_id,rl.base_quantity*src.quantity/rl.quantity AS base_qty,g.debit_account_id INTO cost_source FROM purchase.receipt_lines rl JOIN accounting.grni_items g ON g.company_id=rl.company_id AND g.receipt_line_id=rl.id WHERE rl.company_id=c AND rl.id=src.receipt_line_id;IF val<>0 THEN jl:=jl||inventory.purchase_value_change(cid,lid,cost_source.stock_balance_id,cost_source.base_qty,-val,CASE WHEN cost_source.stock_balance_id IS NULL THEN cost_source.debit_account_id ELSE NULL END);END IF;END IF;
 INSERT INTO purchase.supplier_credit_lines(id,company_id,credit_note_id,bill_line_id,return_line_id,quantity,net,tax,gross,recoverable_tax,expense_account_id,expense_amount,snapshot,credit_mode) VALUES(lid,c,cid,src.id,NULL,NULL,n,t,n+t,gst,CASE WHEN bill.bill_type='EXPENSE' THEN src.expense_account_id ELSE NULL END,CASE WHEN bill.bill_type='EXPENSE' THEN val ELSE 0 END,src.snapshot||jsonb_build_object('billLineId',src.id,'creditNet',n,'creditTax',t,'creditGross',n+t,'creditExpense',val,'creditRecoverableTax',gst,'description',btrim(entry->>'description')),'AMOUNT');
 IF bill.gst_basis='NON_CASH' AND gst>0 THEN INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.id,lid,'CREDIT_NOTE','NON_CASH',today,-n-t,-gst);
 ELSIF bill.gst_basis='CASH' THEN
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=src.id;
 IF true THEN
 desired:=CASE WHEN bal.net_paid_amount<=bal.remaining_gross THEN CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*bal.net_paid_amount/bal.remaining_gross,2) END ELSE least(src.recoverable_tax,bal.remaining_tax+round((src.recoverable_tax-bal.remaining_tax)*(bal.net_paid_amount-bal.remaining_gross)/(bal.gross-bal.remaining_gross),2)) END;delta:=desired-bal.cash_tax_balance;
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',src.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.id,lid,'CREDIT_REBASE','CASH',today,0,delta);
 END IF;END IF;
 END IF;tn:=tn+n;tt:=tt+t;te:=te+CASE WHEN bill.bill_type='EXPENSE' THEN val ELSE 0 END;
 END LOOP;
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(cid,1,'SUPPLIER_CREDIT',today,'Supplier expense credit / AP, original expense and GST',jl);END IF;
 INSERT INTO purchase.supplier_credit_notes(id,company_id,credit_type,expense_amount,bill_id,supplier_id,reference,reason,net,tax,gross,journal_entry_id,created_by,credit_mode) VALUES(cid,c,bill.bill_type,te,p_bill,bill.supplier_id,btrim(p_reference),btrim(p_reason),tn,tt,tn+tt,j,a,'AMOUNT');
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;
 IF j IS NOT NULL AND bill.journal_entry_id IS NOT NULL THEN SELECT posting_batch_id INTO original FROM accounting.journal_entries WHERE company_id=c AND id=bill.journal_entry_id;PERFORM accounting.contra_link(original,j,'SUPPLIER_CREDIT');END IF;RETURN cid;
END $$;
CREATE OR REPLACE FUNCTION purchase.guard_expense_credit_source() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE typ text;original purchase.bill_lines;BEGIN
 IF TG_TABLE_NAME='supplier_credit_notes' THEN
  SELECT bill_type INTO typ FROM purchase.bills WHERE company_id=NEW.company_id AND id=NEW.bill_id;
  IF typ IS DISTINCT FROM NEW.credit_type THEN RAISE EXCEPTION 'Credit type must match original bill' USING ERRCODE='23514';END IF;
  IF NEW.credit_mode='AMOUNT' THEN PERFORM purchase.require_access('purchase.credits.adjust');ELSIF typ='EXPENSE' THEN PERFORM purchase.require_access('purchase.expense_credits.post');IF NEW.created_by<>core.current_actor() THEN RAISE EXCEPTION 'Expense credit actor mismatch' USING ERRCODE='23514';END IF;END IF;
 ELSE
  SELECT * INTO original FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;
  IF NOT FOUND OR (NEW.credit_mode<>'AMOUNT' AND (original.receipt_line_id IS NULL)<>(NEW.return_line_id IS NULL)) THEN RAISE EXCEPTION 'Credit source must match original bill line' USING ERRCODE='23514';END IF;
  IF NEW.credit_mode='AMOUNT' THEN PERFORM purchase.require_access('purchase.credits.adjust');END IF;
  IF original.receipt_line_id IS NULL THEN
   IF NEW.credit_mode<>'AMOUNT' THEN PERFORM purchase.require_access('purchase.expense_credits.post');END IF;
   IF NEW.expense_account_id IS DISTINCT FROM original.expense_account_id THEN RAISE EXCEPTION 'Original expense account required' USING ERRCODE='23514';END IF;
  END IF;
 END IF;RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION purchase.post_expense_credit(p_bill uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
 n:=CASE WHEN src.net+src.tax=0 THEN 0 WHEN purchase.amount_credited_line(src.id) THEN round((src.net-used_n)*qty/(src.net+src.tax-used),2) ELSE round(src.net*(used+qty)/(src.net+src.tax),2)-used_n END;t:=qty-n;gst:=CASE WHEN src.recoverable_tax>0 THEN t ELSE 0 END;val:=n+t-gst;
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
CREATE OR REPLACE FUNCTION purchase.post_supplier_credit(p_bill uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();lid uuid;bill purchase.bills;today date;entry jsonb;src record;bal record;qty numeric;used numeric;used_n numeric;used_t numeric;used_g numeric;n numeric;t numeric;gst numeric;val numeric;tn numeric:=0;tt numeric:=0;desired numeric;delta numeric;no int:=0;ap uuid;input uuid;deferred uuid;j uuid;jl jsonb:='[]';original uuid;bl purchase.bill_lines;other_n numeric;other_t numeric;extra numeric;var_account uuid;
BEGIN
 PERFORM purchase.require_access('purchase.credits.post');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO bill FROM purchase.bills WHERE company_id=c AND id=p_bill;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=bill.supplier_id FOR UPDATE;
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND bill_id=p_bill FOR UPDATE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x GROUP BY x->>'returnLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supplier adjustment note reference, reason and distinct return lines required' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'SUPPLIER_CREDIT',purchase.contra_number('SUPPLIER_CREDIT'),today,'CONFIRMED',a);
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'returnLineId' LOOP
 SELECT rl.*,ge.input_account_id,ge.debit_account_id,(ol.snapshot->>'quantityStep')::numeric AS unit_step FROM purchase.return_lines rl JOIN purchase.receipt_lines prl ON prl.company_id=rl.company_id AND prl.id=rl.receipt_line_id JOIN purchase.order_lines ol ON ol.company_id=prl.company_id AND ol.id=prl.order_line_id JOIN purchase.bill_lines bill_src ON bill_src.company_id=rl.company_id AND bill_src.id=rl.bill_line_id JOIN accounting.purchase_gst_entries ge ON ge.company_id=bill_src.company_id AND ge.bill_line_id=bill_src.id WHERE rl.company_id=c AND rl.id=(entry->>'returnLineId')::uuid AND bill_src.bill_id=p_bill INTO src;
 IF NOT FOUND THEN RAISE EXCEPTION 'Billed return line unavailable for credit' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,src.unit_step)<>0 THEN RAISE EXCEPTION 'Positive credit quantity required' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0),coalesce(sum(recoverable_tax),0) INTO used,used_n,used_t,used_g FROM purchase.supplier_credit_lines WHERE company_id=c AND return_line_id=src.id;
 IF used+qty>src.quantity THEN RAISE EXCEPTION 'Credit exceeds returned quantity' USING ERRCODE='HP409';END IF;
 SELECT * INTO bl FROM purchase.bill_lines WHERE company_id=c AND id=src.bill_line_id;SELECT coalesce(sum(net),0),coalesce(sum(tax),0) INTO other_n,other_t FROM purchase.supplier_credit_lines WHERE company_id=c AND bill_line_id=bl.id;
 n:=least(bl.net-other_n,round(src.net*(used+qty)/src.quantity,2)-used_n);t:=least(bl.tax-other_t,round(src.tax*(used+qty)/src.quantity,2)-used_t);
 extra:=greatest(0,round((src.net+src.tax-src.recoverable_tax)*(used+qty)/src.quantity,2)-coalesce((SELECT sum(net+tax-recoverable_tax+clearing_adjustment) FROM purchase.supplier_credit_lines WHERE company_id=c AND return_line_id=src.id),0)-n-t+CASE WHEN src.recoverable_tax>0 THEN t ELSE 0 END);gst:=CASE WHEN purchase.amount_credited_line(bl.id) THEN CASE WHEN bl.recoverable_tax>0 THEN t ELSE 0 END ELSE round(src.recoverable_tax*(used+qty)/src.quantity,2)-used_g END;val:=n+t-gst;
 IF n+t>0 THEN
 SELECT account_id INTO ap FROM accounting.ap_items WHERE company_id=c AND bill_id=p_bill;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ap AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original AP account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ap,'partyId',bill.party_id,'debit',n+t));END IF;
 IF val>0 THEN PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.contra_account_id AND active AND kind='ASSET' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original return clearing account inactive' USING ERRCODE='HP422';END IF;jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.contra_account_id,'credit',val));END IF;
 IF gst>0 THEN
 input:=src.input_account_id;deferred:=src.debit_account_id;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original credit GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',CASE WHEN bill.gst_basis='CASH' THEN deferred ELSE input END,'credit',gst));END IF;
 no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,cid,no,a);
 INSERT INTO purchase.supplier_credit_lines(id,company_id,credit_note_id,bill_line_id,return_line_id,quantity,net,tax,gross,recoverable_tax,clearing_adjustment) VALUES(lid,c,cid,src.bill_line_id,src.id,qty,n,t,n+t,gst,extra);
 IF extra>0 THEN var_account:=accounting.settlement_account('PURCHASE_PRICE_VARIANCE','EXPENSE');jl:=jl||jsonb_build_array(jsonb_build_object('accountId',var_account,'debit',extra,'sourceLineId',lid),jsonb_build_object('accountId',src.contra_account_id,'partyId',bill.party_id,'credit',extra,'sourceLineId',lid));END IF;
 IF bill.gst_basis='NON_CASH' AND gst>0 THEN INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.bill_line_id,lid,'CREDIT_NOTE','NON_CASH',today,-n-t,-gst);
 ELSIF bill.gst_basis='CASH' THEN
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=src.bill_line_id;
 IF bal.net_paid_amount<=bal.remaining_gross OR purchase.amount_credited_line(src.bill_line_id) THEN
 desired:=CASE WHEN bal.net_paid_amount<=bal.remaining_gross THEN CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*bal.net_paid_amount/bal.remaining_gross,2) END ELSE least(bl.recoverable_tax,bal.remaining_tax+round((bl.recoverable_tax-bal.remaining_tax)*(bal.net_paid_amount-bal.remaining_gross)/(bal.gross-bal.remaining_gross),2)) END;delta:=desired-bal.cash_tax_balance;
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account inactive' USING ERRCODE='HP422';END IF;
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',src.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',src.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.bill_line_id,lid,'CREDIT_REBASE','CASH',today,0,delta);
 END IF;END IF;
 END IF;tn:=tn+n;tt:=tt+t;
 END LOOP;
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(cid,1,'SUPPLIER_CREDIT',today,'Supplier credit / AP and purchase return clearing',jl);END IF;
 INSERT INTO purchase.supplier_credit_notes(id,company_id,bill_id,supplier_id,reference,reason,net,tax,gross,journal_entry_id,created_by) VALUES(cid,c,p_bill,bill.supplier_id,btrim(p_reference),btrim(p_reason),tn,tt,tn+tt,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;
 IF j IS NOT NULL AND bill.journal_entry_id IS NOT NULL THEN SELECT posting_batch_id INTO original FROM accounting.journal_entries WHERE company_id=c AND id=bill.journal_entry_id;PERFORM accounting.contra_link(original,j,'SUPPLIER_CREDIT');END IF;RETURN cid;
END $$;
CREATE OR REPLACE FUNCTION purchase.receive_supplier_refund_core(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_date date,original_bank uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();fid uuid:=gen_random_uuid();sid uuid;today date;on_date date;party uuid;account uuid;bank uuid;credit purchase.supplier_credit_lines;ad accounting.supplier_advances;bill purchase.bills;bal record;ge accounting.purchase_gst_entries;used numeric;available numeric;tax_used numeric;desired numeric;delta numeric:=0;source_date date;source_j uuid;original uuid;j uuid;jl jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.refunds.post');SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;on_date:=coalesce(p_date,today);
 IF num_nonnulls(p_credit_line,p_advance)<>1 OR p_amount IS NULL OR p_amount<=0 OR p_amount<>round(p_amount,2) OR p_amount>999999999999999999.99 OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR on_date>today OR on_date=date '0001-01-01' THEN RAISE EXCEPTION 'One refund source, positive amount, bank reference, reason and valid date required' USING ERRCODE='HP422';END IF;
 IF p_credit_line IS NOT NULL THEN
 SELECT cn.supplier_id INTO sid FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes cn ON cn.company_id=cl.company_id AND cn.id=cl.credit_note_id WHERE cl.company_id=c AND cl.id=p_credit_line;
 ELSE SELECT supplier_id INTO sid FROM accounting.active_supplier_advances WHERE company_id=c AND id=p_advance;END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier refund source unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=sid FOR UPDATE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=on_date AND ends_on>on_date AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Refund requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_credit_line IS NOT NULL THEN
 SELECT * INTO credit FROM purchase.supplier_credit_lines WHERE company_id=c AND id=p_credit_line;
 SELECT * INTO bill FROM purchase.bills WHERE company_id=c AND id=(SELECT bill_id FROM purchase.bill_lines WHERE company_id=c AND id=credit.bill_line_id);
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND bill_id=bill.id FOR UPDATE;
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=credit.bill_line_id;
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO used,tax_used FROM accounting.active_supplier_refunds WHERE company_id=c AND credit_line_id=credit.id;
 used:=used+coalesce((SELECT sum(amount) FROM purchase.active_credit_application_lines WHERE company_id=c AND credit_line_id=credit.id),0);
 available:=least(credit.gross-used,bal.refundable_amount);
 SELECT d.business_date,cn.journal_entry_id INTO source_date,source_j FROM purchase.supplier_credit_notes cn JOIN platform.documents d ON d.company_id=cn.company_id AND d.id=cn.id WHERE cn.company_id=c AND cn.id=credit.credit_note_id;
 SELECT account_id INTO account FROM accounting.ap_items WHERE company_id=c AND bill_id=bill.id;party:=bill.party_id;
 IF bill.gst_basis='CASH' AND p_amount<=available THEN
 SELECT * INTO ge FROM accounting.purchase_gst_entries WHERE company_id=c AND bill_line_id=credit.bill_line_id;
 IF bal.net_paid_amount-p_amount<=bal.remaining_gross THEN desired:=CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*(bal.net_paid_amount-p_amount)/bal.remaining_gross,2) END;
 ELSE desired:=greatest(bal.remaining_tax,bal.cash_tax_balance-(round(credit.recoverable_tax*(used+p_amount)/credit.gross,2)-round(credit.recoverable_tax*used/credit.gross,2)));END IF;
 IF bal.net_paid_amount-p_amount>bal.remaining_gross AND (purchase.amount_credited_line(credit.bill_line_id) OR EXISTS(SELECT 1 FROM accounting.supplier_refund_reversals rv JOIN accounting.supplier_refunds rf ON rf.company_id=rv.company_id AND rf.id=rv.refund_id JOIN purchase.supplier_credit_lines cl ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id WHERE rv.company_id=c AND cl.bill_line_id=credit.bill_line_id) OR EXISTS(SELECT 1 FROM accounting.supplier_payment_allocations pa WHERE pa.company_id=c AND pa.bill_line_id=credit.bill_line_id AND(EXISTS(SELECT 1 FROM accounting.supplier_payment_reversals rv WHERE rv.company_id=pa.company_id AND rv.payment_id=pa.payment_id) OR EXISTS(SELECT 1 FROM accounting.supplier_advance_unapplications un WHERE un.company_id=pa.company_id AND un.application_id=pa.source_document_id)))) THEN desired:=least(ge.recoverable_tax,bal.remaining_tax+round((ge.recoverable_tax-bal.remaining_tax)*(bal.net_paid_amount-p_amount-bal.remaining_gross)/(bal.gross-bal.remaining_gross),2));END IF;
 delta:=desired-bal.cash_tax_balance;
 END IF;
 ELSE
 SELECT * INTO ad FROM accounting.active_supplier_advances WHERE company_id=c AND id=p_advance FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Prepayment payment reversed' USING ERRCODE='HP409';END IF;
 SELECT ab.available INTO available FROM accounting.supplier_advance_balances ab WHERE ab.company_id=c AND ab.id=ad.id;
 SELECT p.paid_on,p.journal_entry_id INTO source_date,source_j FROM accounting.supplier_payments p WHERE p.company_id=c AND p.id=ad.payment_id;party:=ad.party_id;account:=ad.account_id;
 END IF;
 IF p_amount>available THEN RAISE EXCEPTION 'Refund exceeds paid supplier credit or available prepayment' USING ERRCODE='HP409';END IF;
 IF on_date<source_date THEN RAISE EXCEPTION 'Refund cannot precede source credit/payment date' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=account AND active AND kind=CASE WHEN p_advance IS NULL THEN 'LIABILITY' ELSE 'ASSET' END FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund source account inactive' USING ERRCODE='HP422';END IF;
 bank:=coalesce(original_bank,accounting.settlement_account('BANK','ASSET','BANK'));PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=bank AND active AND kind='ASSET' AND control_kind='BANK' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund bank inactive' USING ERRCODE='HP422';END IF;
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
CREATE OR REPLACE FUNCTION purchase.post_bill_core(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb,p_variance_reason text DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();bid uuid:=gen_random_uuid();lid uuid;today date;company core.companies;supplier crm.suppliers;snapshot jsonb;
 entry jsonb;src record;prior_q numeric;prior_n numeric;prior_t numeric;returned_q numeric;returned_n numeric;returned_t numeric;qty numeric;n numeric;t numeric;v numeric;gst numeric;tn numeric:=0;tt numeric:=0;tv numeric:=0;tg numeric:=0;
 built jsonb:='[]';jl jsonb:='[]';ap uuid;input_account uuid;debit_account uuid;j uuid;seq bigint;prefix text;no int:=0;gid uuid;expected_n numeric;expected_t numeric;change numeric;variance_total numeric:=0;value_source record;variance_line uuid;
BEGIN
 PERFORM purchase.require_access('purchase.bills.post');IF p_variance_reason IS NOT NULL THEN PERFORM purchase.require_access('purchase.bills.variance.post');IF length(btrim(p_variance_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Variance reason required' USING ERRCODE='HP422';END IF;END IF;
 SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;
 IF p_invoice IS NULL OR length(btrim(p_invoice)) NOT BETWEEN 1 AND 200 OR p_invoice_date IS NULL OR p_invoice_date=date '0001-01-01' OR p_posting_date IS NULL OR p_invoice_date>p_posting_date OR p_posting_date>today OR p_due IS NULL OR p_due<p_invoice_date OR p_notes IS NULL OR length(p_notes)>2000 OR
 (p_evidence IS NULL)<>(p_held_on IS NULL) OR (p_evidence IS NOT NULL AND (length(btrim(p_evidence)) NOT BETWEEN 1 AND 500 OR p_held_on<p_invoice_date OR p_held_on>p_posting_date)) THEN RAISE EXCEPTION 'Invalid invoice number, dates, tax evidence or notes' USING ERRCODE='HP422';END IF;
 SELECT * INTO supplier FROM crm.suppliers WHERE company_id=c AND id=p_supplier AND status='ACTIVE' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 SELECT jsonb_build_object('supplierId',supplier.id,'partyId',supplier.party_id,'code',supplier.code,'legalName',p.legal_name,'abn',p.abn,'country',p.country,'paymentTermsDays',supplier.payment_terms_days) INTO snapshot FROM crm.parties p WHERE p.company_id=c AND p.id=supplier.party_id FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=p_posting_date AND ends_on>p_posting_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier bill requires an open posting period' USING ERRCODE='HP422';END IF;
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) x GROUP BY x->>'receiptLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supply 1..50 distinct receipt lines' USING ERRCODE='HP422';END IF;
 -- All bills lock the immutable GRNI source rows in the same order. Read matched totals only AFTER the lock.
 FOR gid IN SELECT g.id FROM jsonb_array_elements(items) x JOIN accounting.grni_items g ON g.company_id=c AND g.receipt_line_id=(x->>'receiptLineId')::uuid ORDER BY g.id LOOP
 PERFORM 1 FROM accounting.grni_items WHERE company_id=c AND id=gid FOR UPDATE;
 END LOOP;
 PERFORM 1 FROM inventory.stock_balances b WHERE b.company_id=c AND b.id IN(SELECT rl.stock_balance_id FROM purchase.receipt_lines rl JOIN jsonb_array_elements(items) x ON rl.id=(x->>'receiptLineId')::uuid WHERE rl.company_id=c) ORDER BY b.warehouse_id,b.product_id FOR UPDATE;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) LOOP
 SELECT rl.*,ol.tax_code_id,ol.tax_rate,ol.recoverable_gst,ol.snapshot,po.gst_registered,g.id AS grni_id,g.grni_account_id,r.supplier_id,doc.business_date INTO src
 FROM purchase.receipt_lines rl JOIN purchase.order_lines ol ON ol.company_id=rl.company_id AND ol.id=rl.order_line_id JOIN purchase.orders po ON po.company_id=ol.company_id AND po.id=ol.order_id
 JOIN purchase.receipts r ON r.company_id=rl.company_id AND r.id=rl.receipt_id JOIN platform.documents doc ON doc.company_id=r.company_id AND doc.id=r.id AND doc.state='POSTED' JOIN accounting.grni_items g ON g.company_id=rl.company_id AND g.receipt_line_id=rl.id
 WHERE rl.company_id=c AND rl.id=(entry->>'receiptLineId')::uuid AND r.supplier_id=p_supplier;
 IF NOT FOUND THEN RAISE EXCEPTION 'Receipt line unavailable for supplier' USING ERRCODE='HT404';END IF;
 IF src.gst_registered<>company.gst_registered OR src.business_date>p_posting_date THEN RAISE EXCEPTION 'Registration policy changed or receipt follows posting date' USING ERRCODE='HP422';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,(src.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Positive quantity must respect the frozen purchase step' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(bl.quantity),0),coalesce(sum(bl.receipt_net),0),coalesce(sum(bl.receipt_tax),0) INTO prior_q,prior_n,prior_t FROM purchase.bill_lines bl WHERE bl.company_id=c AND bl.receipt_line_id=src.id;
 SELECT coalesce(sum(rl.quantity),0),coalesce(sum(rl.net),0),coalesce(sum(rl.tax),0) INTO returned_q,returned_n,returned_t FROM purchase.return_lines rl WHERE rl.company_id=c AND rl.receipt_line_id=src.id AND rl.bill_line_id IS NULL;
 IF prior_q+qty+returned_q>src.quantity THEN RAISE EXCEPTION 'Bill exceeds unmatched receipt quantity' USING ERRCODE='HP409';END IF;
 IF returned_q=0 THEN n:=round(src.net*(prior_q+qty)/src.quantity,2)-prior_n;t:=round(src.tax*(prior_q+qty)/src.quantity,2)-prior_t;
 ELSE n:=round((src.net-returned_n-prior_n)*qty/(src.quantity-returned_q-prior_q),2);t:=round((src.tax-returned_t-prior_t)*qty/(src.quantity-returned_q-prior_q),2);END IF;
 expected_n:=n;expected_t:=t;v:=n+t-CASE WHEN src.recoverable_gst THEN t ELSE 0 END;
 IF p_variance_reason IS NULL THEN IF (entry->>'net')::numeric IS DISTINCT FROM n OR (entry->>'tax')::numeric IS DISTINCT FROM t THEN RAISE EXCEPTION 'Supplier price/tax differs from exact receipt match' USING ERRCODE='HP422';END IF;
 ELSE n:=(entry->>'net')::numeric;t:=(entry->>'tax')::numeric;IF n IS NULL OR t IS NULL OR n<0 OR t<0 OR n<>round(n,2) OR t<>round(t,2) OR n+t>999999999999999999.99 OR (src.tax_rate=0 AND t<>0) THEN RAISE EXCEPTION 'Actual invoice net/tax cents invalid for source tax code' USING ERRCODE='HP422';END IF;END IF;
 gst:=CASE WHEN src.recoverable_gst THEN t ELSE 0 END;change:=n+t-gst-v;
 input_account:=NULL;debit_account:=NULL;
 IF gst>0 THEN
 IF p_evidence IS NULL THEN RAISE EXCEPTION 'Recoverable GST requires verified tax invoice evidence and held date' USING ERRCODE='HP422';END IF;
 SELECT ac.id INTO input_account FROM accounting.tax_account_mappings tm JOIN accounting.accounts ac ON ac.company_id=tm.company_id AND ac.id=tm.input_account_id AND ac.active AND ac.kind='ASSET' AND ac.control_kind='GST' WHERE tm.company_id=c AND tm.tax_code_id=src.tax_code_id FOR SHARE OF tm,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active input GST account mapping required' USING ERRCODE='HP422';END IF;
 debit_account:=CASE WHEN company.gst_basis='CASH' THEN accounting.settlement_account('GST_INPUT_DEFERRED','ASSET','GST') ELSE input_account END;
 END IF;
 IF v>0 THEN PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.grni_account_id AND active AND kind='LIABILITY' AND control_kind='GRNI' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original receipt GRNI account is inactive' USING ERRCODE='HP422';END IF;END IF;
 lid:=gen_random_uuid();IF change<>0 THEN SELECT rl.stock_balance_id,rl.base_quantity*qty/rl.quantity AS bqty,g.debit_account_id INTO value_source FROM purchase.receipt_lines rl JOIN accounting.grni_items g ON g.company_id=rl.company_id AND g.receipt_line_id=rl.id WHERE rl.company_id=c AND rl.id=src.id;jl:=jl||inventory.purchase_value_change(bid,lid,value_source.stock_balance_id,value_source.bqty,change,CASE WHEN value_source.stock_balance_id IS NULL THEN value_source.debit_account_id ELSE NULL END);END IF;variance_total:=variance_total+change;built:=built||jsonb_build_array(jsonb_build_object('id',lid,'receiptLineId',src.id,'grniItemId',src.grni_id,'quantity',qty,'net',n,'tax',t,'grniAmount',v,'recoverableTax',gst,'taxCodeId',src.tax_code_id,'taxRate',src.tax_rate,'snapshot',src.snapshot||jsonb_build_object('receiptNet',expected_n,'receiptTax',expected_t,'costVariance',change,'varianceReason',p_variance_reason),'receiptNet',expected_n,'receiptTax',expected_t,'costVariance',change,'inputAccount',input_account,'debitAccount',debit_account));
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
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(bid,1,'SUPPLIER_BILL',p_posting_date,'Matched supplier bill / GRNI clearance and AP',jl);END IF;
 INSERT INTO purchase.bills(id,company_id,supplier_id,party_id,supplier_invoice,invoice_date,due_on,tax_invoice_reference,tax_invoice_held_on,notes,supplier_snapshot,gst_basis,net,tax,gross,grni_amount,recoverable_tax,journal_entry_id,created_by,cost_variance,variance_reason)
 VALUES(bid,c,p_supplier,supplier.party_id,btrim(p_invoice),p_invoice_date,p_due,p_evidence,p_held_on,p_notes,snapshot,company.gst_basis,tn,tt,tn+tt,tv,tg,j,a,variance_total,p_variance_reason);
 FOR entry IN SELECT * FROM jsonb_array_elements(built) LOOP
 lid:=(entry->>'id')::uuid;
 INSERT INTO purchase.bill_lines(id,company_id,bill_id,receipt_line_id,grni_item_id,quantity,net,tax,grni_amount,recoverable_tax,tax_code_id,tax_rate,snapshot,cost_variance,receipt_net,receipt_tax)
 VALUES(lid,c,bid,(entry->>'receiptLineId')::uuid,(entry->>'grniItemId')::uuid,(entry->>'quantity')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,(entry->>'grniAmount')::numeric,(entry->>'recoverableTax')::numeric,(entry->>'taxCodeId')::uuid,(entry->>'taxRate')::numeric,entry->'snapshot',(entry->>'costVariance')::numeric,(entry->>'receiptNet')::numeric,(entry->>'receiptTax')::numeric);
 INSERT INTO accounting.purchase_gst_entries(company_id,bill_line_id,gst_basis,tax_code_id,tax_rate,net,tax,recoverable_tax,input_account_id,debit_account_id,attribution_date)
 VALUES(c,lid,company.gst_basis,(entry->>'taxCodeId')::uuid,(entry->>'taxRate')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,(entry->>'recoverableTax')::numeric,(entry->>'inputAccount')::uuid,(entry->>'debitAccount')::uuid,CASE WHEN company.gst_basis='NON_CASH' AND (entry->>'recoverableTax')::numeric>0 THEN greatest(p_invoice_date,p_held_on) ELSE NULL END);
 END LOOP;
 INSERT INTO accounting.ap_items(company_id,bill_id,supplier_id,party_id,amount,due_on,account_id,journal_entry_id) VALUES(c,bid,p_supplier,supplier.party_id,tn+tt,p_due,ap,j);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=bid;RETURN bid;
END $$;
CREATE OR REPLACE FUNCTION purchase.post_bill(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN purchase.post_bill_core(p_supplier,p_invoice,p_invoice_date,p_due,p_posting_date,p_evidence,p_held_on,p_notes,items,NULL);END $$;
CREATE FUNCTION purchase.post_bill_with_variance(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb,reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN IF reason IS NULL THEN RAISE EXCEPTION 'Variance reason required' USING ERRCODE='HP422';END IF;RETURN purchase.post_bill_core(p_supplier,p_invoice,p_invoice_date,p_due,p_posting_date,p_evidence,p_held_on,p_notes,items,reason);END $$;
CREATE OR REPLACE FUNCTION purchase.return_goods(p_receipt uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();rid uuid:=gen_random_uuid();lid uuid;r purchase.receipts;today date;entry jsonb;src record;bl purchase.bill_lines;qty numeric;bqty numeric;prior_q numeric;prior_n numeric;prior_t numeric;available_q numeric;n numeric;t numeric;gst numeric;val numeric;cost numeric;no int:=0;balance inventory.stock_balances;pool inventory.stock_values;dr uuid;cr uuid;variance uuid;clearing uuid;j uuid;jl jsonb:='[]';built jsonb:='[]';gid uuid;
BEGIN
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 SELECT * INTO r FROM purchase.receipts WHERE company_id=c AND id=p_receipt;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase receipt unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('purchase.returns.post',r.warehouse_id);
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=r.supplier_id FOR UPDATE;
 PERFORM 1 FROM catalog.warehouses WHERE company_id=c AND id=r.warehouse_id AND active AND kind IN('SELLABLE','QUARANTINE') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return warehouse unavailable' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return requires open accounting period' USING ERRCODE='HP422';END IF;
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items)x GROUP BY x->>'receiptLineId',x->>'billLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Return reference, reason and distinct sources required' USING ERRCODE='HP422';END IF;
 FOR gid IN SELECT gi.id FROM jsonb_array_elements(items)x JOIN accounting.grni_items gi ON gi.company_id=c AND gi.receipt_line_id=(x->>'receiptLineId')::uuid ORDER BY gi.id LOOP PERFORM 1 FROM accounting.grni_items WHERE company_id=c AND id=gid FOR UPDATE;END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(rid,c,'PURCHASE_RETURN',purchase.contra_number('PURCHASE_RETURN'),today,'CONFIRMED',a);
 FOR entry IN SELECT x.value FROM jsonb_array_elements(items)x LEFT JOIN purchase.receipt_lines rl ON rl.company_id=c AND rl.id=(x.value->>'receiptLineId')::uuid LEFT JOIN purchase.order_lines ol ON ol.company_id=rl.company_id AND ol.id=rl.order_line_id ORDER BY ol.product_id,rl.id,x.value->>'billLineId' LOOP
 SELECT rl.*,ol.product_id,ol.item_type,ol.snapshot,ol.recoverable_gst,gi.grni_account_id,gi.debit_account_id,gi.journal_entry_id,gi.party_id INTO src FROM purchase.receipt_lines rl JOIN purchase.order_lines ol ON ol.company_id=rl.company_id AND ol.id=rl.order_line_id JOIN accounting.grni_items gi ON gi.company_id=rl.company_id AND gi.receipt_line_id=rl.id WHERE rl.company_id=c AND rl.receipt_id=p_receipt AND rl.id=(entry->>'receiptLineId')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return receipt line unavailable' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,(src.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Return quantity violates frozen purchase step' USING ERRCODE='HP422';END IF;
 bqty:=src.base_quantity*qty/src.quantity;IF bqty<>round(bqty,6) THEN RAISE EXCEPTION 'Return base quantity precision exceeded' USING ERRCODE='HP422';END IF;
 IF nullif(entry->>'billLineId','') IS NOT NULL THEN
 SELECT * INTO bl FROM purchase.bill_lines WHERE company_id=c AND id=(entry->>'billLineId')::uuid AND receipt_line_id=src.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Billed return source unavailable' USING ERRCODE='HT404';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO prior_q,prior_n,prior_t FROM purchase.return_lines WHERE company_id=c AND bill_line_id=bl.id;
 IF qty+prior_q>bl.quantity THEN RAISE EXCEPTION 'Return exceeds billed source quantity' USING ERRCODE='HP409';END IF;
 n:=round(bl.net*(prior_q+qty)/bl.quantity,2)-prior_n;t:=round(bl.tax*(prior_q+qty)/bl.quantity,2)-prior_t;gst:=CASE WHEN bl.recoverable_tax>0 THEN t ELSE 0 END;
 ELSE
 SELECT coalesce(sum(quantity),0),coalesce(sum(receipt_net),0),coalesce(sum(receipt_tax),0) INTO prior_q,prior_n,prior_t FROM purchase.bill_lines WHERE company_id=c AND receipt_line_id=src.id;
 SELECT prior_q+coalesce(sum(quantity),0),prior_n+coalesce(sum(net),0),prior_t+coalesce(sum(tax),0) INTO prior_q,prior_n,prior_t FROM purchase.return_lines WHERE company_id=c AND receipt_line_id=src.id AND bill_line_id IS NULL;
 available_q:=src.quantity-prior_q;IF qty>available_q THEN RAISE EXCEPTION 'Return exceeds unbilled receipt quantity' USING ERRCODE='HP409';END IF;
 n:=round((src.net-prior_n)*qty/available_q,2);t:=round((src.tax-prior_t)*qty/available_q,2);gst:=CASE WHEN src.recoverable_gst THEN t ELSE 0 END;
 END IF;
 val:=n+t-gst;cost:=val;dr:=NULL;cr:=NULL;balance:=NULL;pool:=NULL;
 IF val>0 THEN
 IF nullif(entry->>'billLineId','') IS NULL THEN dr:=src.grni_account_id;PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=dr AND active AND kind='LIABILITY' AND control_kind='GRNI' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original GRNI account inactive' USING ERRCODE='HP422';END IF;
 ELSE dr:=accounting.settlement_account('PURCHASE_RETURN_CLEARING','ASSET');PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=dr AND control_kind IS NULL;IF NOT FOUND THEN RAISE EXCEPTION 'Return clearing requires a non-control asset account' USING ERRCODE='HP422';END IF;END IF;
 END IF;
 IF src.item_type='STOCK' THEN
 SELECT * INTO balance FROM inventory.stock_balances WHERE company_id=c AND id=src.stock_balance_id FOR UPDATE;
 SELECT * INTO pool FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=balance.id FOR UPDATE;
 IF NOT FOUND OR balance.on_hand-balance.reserved<bqty THEN RAISE EXCEPTION 'Insufficient unreserved valued stock for purchase return' USING ERRCODE='HP409';END IF;
 cost:=CASE WHEN bqty=balance.on_hand THEN pool.value ELSE round(pool.value*bqty/balance.on_hand,2) END;
 UPDATE inventory.stock_balances SET on_hand=on_hand-bqty WHERE company_id=c AND id=balance.id;UPDATE inventory.stock_values SET value=value-cost WHERE company_id=c AND id=pool.id;
 IF cost>0 THEN cr:=accounting.settlement_account('INVENTORY','ASSET','INVENTORY');END IF;
 ELSE IF val>0 THEN cr:=src.debit_account_id;PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=cr AND active AND kind='EXPENSE' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original purchase expense inactive' USING ERRCODE='HP422';END IF;END IF;
 END IF;
 no:=no+1;lid:=gen_random_uuid();INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,rid,no,a);
 INSERT INTO purchase.return_lines(id,company_id,return_id,receipt_line_id,bill_line_id,quantity,base_quantity,net,tax,recoverable_tax,valuation_amount,cost,contra_account_id,stock_balance_id,on_hand_after,value_after) VALUES(lid,c,rid,src.id,nullif(entry->>'billLineId','')::uuid,qty,bqty,n,t,gst,val,cost,dr,balance.id,CASE WHEN balance.id IS NOT NULL THEN balance.on_hand-bqty END,CASE WHEN balance.id IS NOT NULL THEN pool.value-cost END);
 IF val>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',dr,'partyId',src.party_id,'debit',val,'sourceLineId',lid));END IF;
 IF cost>0 THEN jl:=jl||jsonb_build_array(jsonb_build_object('accountId',cr,'credit',cost,'sourceLineId',lid));END IF;
 IF cost<>val THEN variance:=accounting.settlement_account('PURCHASE_RETURN_VARIANCE','EXPENSE');jl:=jl||jsonb_build_array(jsonb_build_object('accountId',variance,'debit',greatest(cost-val,0),'credit',greatest(val-cost,0),'sourceLineId',lid));END IF;
 END LOOP;
 IF jsonb_array_length(jl)>0 THEN j:=accounting.post_journal(rid,1,'PURCHASE_RETURN',today,'Purchase return / stock and receipt contra',jl);END IF;
 INSERT INTO purchase.returns(id,company_id,receipt_id,supplier_id,warehouse_id,reference,reason,journal_entry_id,created_by) VALUES(rid,c,p_receipt,r.supplier_id,r.warehouse_id,btrim(p_reference),btrim(p_reason),j,a);
 -- Parent inserted after its immutable details; FK below is deferred for this command.
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=rid;
 IF j IS NOT NULL THEN PERFORM accounting.contra_link(je.posting_batch_id,j,'PURCHASE_RETURN') FROM accounting.journal_entries je JOIN accounting.grni_items gi ON gi.company_id=je.company_id AND gi.journal_entry_id=je.id JOIN purchase.receipt_lines rl ON rl.company_id=gi.company_id AND rl.id=gi.receipt_line_id WHERE rl.company_id=c AND rl.receipt_id=p_receipt;END IF;
 RETURN rid;
END $$;
CREATE OR REPLACE FUNCTION purchase.validate_bill() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE b purchase.bills;bid uuid;BEGIN
 IF TG_TABLE_NAME='bills' THEN bid:=NEW.id;ELSIF TG_TABLE_NAME='bill_lines' OR TG_TABLE_NAME='ap_items' THEN bid:=NEW.bill_id;ELSE SELECT bill_id INTO bid FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;END IF;
 SELECT * INTO b FROM purchase.bills WHERE company_id=NEW.company_id AND id=bid;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=b.company_id AND id=b.id AND document_type='SUPPLIER_BILL' AND state='POSTED') OR NOT EXISTS(SELECT 1 FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) OR
 (SELECT ROW(sum(net),sum(tax),sum(grni_amount),sum(recoverable_tax),sum(expense_amount),sum(cost_variance)) FROM purchase.bill_lines WHERE company_id=b.company_id AND bill_id=b.id) IS DISTINCT FROM ROW(b.net,b.tax,b.grni_amount,b.recoverable_tax,b.expense_amount,b.cost_variance) OR
 NOT EXISTS(SELECT 1 FROM accounting.ap_items WHERE company_id=b.company_id AND bill_id=b.id AND supplier_id=b.supplier_id AND party_id=b.party_id AND amount=b.gross AND due_on=b.due_on AND journal_entry_id IS NOT DISTINCT FROM b.journal_entry_id) THEN RAISE EXCEPTION 'Supplier bill totals/state/AP mismatch' USING ERRCODE='23514';END IF;
 IF b.gross>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=b.company_id AND je.id=b.journal_entry_id AND pb.source_document_id=b.id AND pb.posting_kind='SUPPLIER_BILL') THEN RAISE EXCEPTION 'Supplier bill journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_lines bl JOIN purchase.receipt_lines rl ON rl.company_id=bl.company_id AND rl.id=bl.receipt_line_id JOIN accounting.grni_items gi ON gi.company_id=bl.company_id AND gi.id=bl.grni_item_id WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND
 (gi.receipt_line_id<>rl.id OR gi.supplier_id<>b.supplier_id OR gi.party_id<>b.party_id OR (SELECT sum(quantity) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>rl.quantity OR (SELECT sum(grni_amount) FROM purchase.bill_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id)>gi.amount OR NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_entries ge WHERE ge.company_id=bl.company_id AND ge.bill_line_id=bl.id AND ge.net=bl.net AND ge.tax=bl.tax AND ge.recoverable_tax=bl.recoverable_tax AND ge.gst_basis=b.gst_basis AND ge.tax_code_id=bl.tax_code_id AND ge.tax_rate=bl.tax_rate))) THEN RAISE EXCEPTION 'Supplier receipt match or GST ledger mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_lines bl WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_entries ge WHERE ge.company_id=bl.company_id AND ge.bill_line_id=bl.id AND ge.net=bl.net AND ge.tax=bl.tax AND ge.recoverable_tax=bl.recoverable_tax AND ge.gst_basis=b.gst_basis AND ge.tax_code_id=bl.tax_code_id AND ge.tax_rate=bl.tax_rate)) THEN RAISE EXCEPTION 'Supplier bill GST ledger mismatch' USING ERRCODE='23514';END IF;
 IF b.bill_type='EXPENSE' AND EXISTS(SELECT 1 FROM purchase.bill_lines bl WHERE bl.company_id=b.company_id AND bl.bill_id=b.id AND (bl.receipt_line_id IS NOT NULL OR bl.grni_item_id IS NOT NULL OR bl.expense_account_id IS NULL OR bl.grni_amount<>0 OR (bl.expense_amount>0 AND NOT EXISTS(SELECT 1 FROM accounting.journal_lines jl WHERE jl.company_id=bl.company_id AND jl.journal_entry_id=b.journal_entry_id AND jl.source_line_id=bl.id AND jl.account_id=bl.expense_account_id AND jl.debit=bl.expense_amount AND jl.credit=0)))) THEN RAISE EXCEPTION 'Expense bill source or expense journal mismatch' USING ERRCODE='23514';END IF;
 RETURN NULL;
END $$;
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
 UNION ALL SELECT stock_balance_id,0,inventory_delta FROM inventory.purchase_value_adjustments WHERE company_id=core.current_company() AND stock_balance_id IS NOT NULL
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
   -coalesce((SELECT sum(ap.amount) FROM accounting.active_advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)
   -coalesce((SELECT sum(f.amount) FROM accounting.active_customer_refunds f WHERE f.company_id=a.company_id AND f.advance_id=a.id),0) AS balance
  FROM accounting.active_customer_advances a JOIN accounting.active_customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=core.current_company()
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
  UNION ALL SELECT 'gl.purchase_return_clearing',ra.id,coalesce((SELECT sum(r.valuation_amount-coalesce((SELECT sum(cl.net+cl.tax-cl.recoverable_tax+cl.clearing_adjustment) FROM purchase.supplier_credit_lines cl WHERE cl.company_id=r.company_id AND cl.return_line_id=r.id),0)) FROM purchase.return_lines r WHERE r.company_id=core.current_company() AND r.bill_line_id IS NOT NULL AND r.contra_account_id=ra.id),0),coalesce((SELECT sum(balance) FROM gl WHERE id=ra.id),0),'AUD' FROM return_accounts ra
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

  UNION ALL SELECT 'receipt_reversal.amount',x.id,r.amount,x.amount,'AUD' FROM accounting.receipt_reversals x JOIN accounting.customer_receipts r ON r.company_id=x.company_id AND r.id=x.receipt_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'advance_unapplication.amount',x.id,a.amount,x.amount,'AUD' FROM accounting.advance_unapplications x JOIN accounting.advance_applications a ON a.company_id=x.company_id AND a.id=x.application_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM sales.invoice_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'advance.negative_available',b.id,0,greatest(0,-b.available),'AUD' FROM accounting.customer_advance_balances b WHERE b.company_id=core.current_company()

  UNION ALL SELECT 'supplier_payment_reversal.amount',r.id,p.amount,r.amount,'AUD' FROM accounting.supplier_payment_reversals r JOIN accounting.supplier_payments p ON p.company_id=r.company_id AND p.id=r.payment_id WHERE r.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance_unapplication.amount',u.id,a.amount,u.amount,'AUD' FROM accounting.supplier_advance_unapplications u JOIN accounting.supplier_advance_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'supplier_settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM purchase.bill_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance.negative_available',a.id,0,greatest(0,-a.available),'AUD' FROM accounting.supplier_advance_balances a WHERE a.company_id=core.current_company()

  UNION ALL SELECT 'customer_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.customer_refund_reversals v JOIN accounting.customer_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()

  UNION ALL SELECT 'supplier_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.supplier_refund_reversals v JOIN accounting.supplier_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
REVOKE ALL ON FUNCTION identity.seed_purchase_adjustment_roles(uuid),purchase.amount_credited_line(uuid),inventory.purchase_value_change(uuid,uuid,uuid,numeric,numeric,uuid),purchase.post_amount_credit(uuid,text,text,jsonb),purchase.post_bill_core(uuid,text,date,date,date,text,date,text,jsonb,text),purchase.post_bill_with_variance(uuid,text,date,date,date,text,date,text,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purchase.post_amount_credit(uuid,text,text,jsonb),purchase.post_bill_with_variance(uuid,text,date,date,date,text,date,text,jsonb,text) TO htt_app;
GRANT SELECT ON inventory.purchase_value_adjustments TO htt_app;
CREATE FUNCTION inventory.validate_purchase_value_change() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE expected numeric;j uuid;typ text;BEGIN
 SELECT document_type INTO typ FROM platform.documents WHERE company_id=NEW.company_id AND id=NEW.document_id;
 IF typ='SUPPLIER_BILL' THEN SELECT cost_variance INTO expected FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.line_id AND bill_id=NEW.document_id;
 ELSIF typ='SUPPLIER_CREDIT' THEN SELECT -(net+tax-recoverable_tax) INTO expected FROM purchase.supplier_credit_lines WHERE company_id=NEW.company_id AND id=NEW.line_id AND credit_note_id=NEW.document_id AND credit_mode='AMOUNT';
 ELSE RAISE EXCEPTION 'Invalid purchase value source' USING ERRCODE='23514';END IF;
 IF expected IS DISTINCT FROM NEW.amount THEN RAISE EXCEPTION 'Purchase cost adjustment differs from source' USING ERRCODE='23514';END IF;
 SELECT e.id INTO j FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id WHERE b.company_id=NEW.company_id AND b.source_document_id=NEW.document_id AND b.posting_kind IN('SUPPLIER_BILL','SUPPLIER_CREDIT');
 IF j IS NULL OR NEW.inventory_delta<>coalesce((SELECT sum(debit-credit) FROM accounting.journal_lines WHERE company_id=NEW.company_id AND journal_entry_id=j AND source_line_id=NEW.line_id AND account_id=NEW.inventory_account_id),0) OR NEW.expense_delta<>coalesce((SELECT sum(debit-credit) FROM accounting.journal_lines WHERE company_id=NEW.company_id AND journal_entry_id=j AND source_line_id=NEW.line_id AND account_id=NEW.expense_account_id),0) THEN RAISE EXCEPTION 'Purchase cost adjustment journal mismatch' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER purchase_value_consistency AFTER INSERT ON inventory.purchase_value_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION inventory.validate_purchase_value_change();
REVOKE ALL ON FUNCTION inventory.validate_purchase_value_change() FROM PUBLIC;

CREATE FUNCTION purchase.validate_amount_credit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE src purchase.bill_lines;hdr purchase.supplier_credit_notes;BEGIN
 IF NEW.credit_mode<>'AMOUNT' THEN RETURN NULL;END IF;
 SELECT * INTO src FROM purchase.bill_lines WHERE company_id=NEW.company_id AND id=NEW.bill_line_id;
 SELECT * INTO hdr FROM purchase.supplier_credit_notes WHERE company_id=NEW.company_id AND id=NEW.credit_note_id;
 IF hdr.credit_mode<>'AMOUNT' OR hdr.bill_id<>src.bill_id OR NEW.return_line_id IS NOT NULL OR NEW.quantity IS NOT NULL OR NEW.recoverable_tax<>(CASE WHEN src.recoverable_tax>0 THEN NEW.tax ELSE 0 END) OR EXISTS(SELECT 1 FROM purchase.supplier_credit_lines WHERE company_id=NEW.company_id AND bill_line_id=src.id HAVING sum(net)>src.net OR sum(tax)>src.tax) THEN RAISE EXCEPTION 'Amount credit source/net/tax invariant failed' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER amount_credit_consistency AFTER INSERT ON purchase.supplier_credit_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_amount_credit();
REVOKE ALL ON FUNCTION purchase.validate_amount_credit() FROM PUBLIC;
