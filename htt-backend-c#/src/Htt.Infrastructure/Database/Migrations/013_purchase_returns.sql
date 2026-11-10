-- Immutable procurement contra documents; original receipts, bills and settlements remain intact.
ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND'));
CREATE TABLE purchase.returns(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),receipt_id uuid NOT NULL,supplier_id uuid NOT NULL,warehouse_id uuid NOT NULL,reference text NOT NULL,reason text NOT NULL,journal_entry_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,receipt_id) REFERENCES purchase.receipts(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE UNIQUE INDEX purchase_return_reference ON purchase.returns(company_id,supplier_id,lower(btrim(reference)));
CREATE TABLE purchase.return_lines(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),return_id uuid NOT NULL,receipt_line_id uuid NOT NULL,bill_line_id uuid,quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),recoverable_tax numeric(20,2) NOT NULL CHECK(recoverable_tax BETWEEN 0 AND tax),valuation_amount numeric(20,2) NOT NULL CHECK(valuation_amount=net+tax-recoverable_tax),cost numeric(20,2) NOT NULL CHECK(cost>=0),contra_account_id uuid,stock_balance_id uuid,on_hand_after numeric(20,6),value_after numeric(20,2),
 UNIQUE(company_id,id),UNIQUE NULLS NOT DISTINCT(company_id,return_id,receipt_line_id,bill_line_id),FOREIGN KEY(company_id,id,return_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,return_id) REFERENCES purchase.returns(company_id,id),FOREIGN KEY(company_id,receipt_line_id) REFERENCES purchase.receipt_lines(company_id,id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,contra_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),CHECK((stock_balance_id IS NULL AND on_hand_after IS NULL AND value_after IS NULL) OR(stock_balance_id IS NOT NULL AND on_hand_after>=0 AND value_after>=0))
);
CREATE TABLE purchase.supplier_credit_notes(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),bill_id uuid NOT NULL,supplier_id uuid NOT NULL,reference text NOT NULL,reason text NOT NULL,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),journal_entry_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,bill_id) REFERENCES purchase.bills(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
CREATE UNIQUE INDEX supplier_credit_reference ON purchase.supplier_credit_notes(company_id,supplier_id,lower(btrim(reference)));
CREATE TABLE purchase.supplier_credit_lines(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),credit_note_id uuid NOT NULL,bill_line_id uuid NOT NULL,return_line_id uuid NOT NULL,quantity numeric(20,6) NOT NULL CHECK(quantity>0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),recoverable_tax numeric(20,2) NOT NULL CHECK(recoverable_tax BETWEEN 0 AND tax),
 UNIQUE(company_id,id),UNIQUE(company_id,credit_note_id,return_line_id),FOREIGN KEY(company_id,id,credit_note_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,credit_note_id) REFERENCES purchase.supplier_credit_notes(company_id,id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,return_line_id) REFERENCES purchase.return_lines(company_id,id)
);
CREATE TABLE accounting.supplier_refunds(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),supplier_id uuid NOT NULL,credit_line_id uuid,advance_id uuid,amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0),reference text NOT NULL,reason text NOT NULL,received_on date NOT NULL,bank_account_id uuid NOT NULL,journal_entry_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,credit_line_id) REFERENCES purchase.supplier_credit_lines(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.supplier_advances(company_id,id),FOREIGN KEY(company_id,bank_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id),CHECK(num_nonnulls(credit_line_id,advance_id)=1)
);
CREATE UNIQUE INDEX supplier_refund_reference ON accounting.supplier_refunds(company_id,lower(btrim(reference)));
CREATE TABLE accounting.purchase_gst_adjustments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_document_id uuid NOT NULL,bill_line_id uuid NOT NULL,credit_line_id uuid NOT NULL,kind text NOT NULL CHECK(kind IN ('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND')),gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),adjustment_date date NOT NULL,amount numeric(20,2) NOT NULL,gst_amount numeric(20,2) NOT NULL,
 UNIQUE(company_id,id),FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,bill_line_id) REFERENCES purchase.bill_lines(company_id,id),FOREIGN KEY(company_id,credit_line_id) REFERENCES purchase.supplier_credit_lines(company_id,id)
);
DO $$ DECLARE sc text;tb text;BEGIN FOR sc,tb IN SELECT * FROM(VALUES('purchase','returns'),('purchase','return_lines'),('purchase','supplier_credit_notes'),('purchase','supplier_credit_lines'),('accounting','supplier_refunds'),('accounting','purchase_gst_adjustments'))v(s,t) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,tb);EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,tb);EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,tb);EXECUTE format('CREATE INDEX ON %I.%I(company_id)',sc,tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',sc,tb);
 END LOOP;END $$;
CREATE INDEX ON purchase.returns(company_id,receipt_id);CREATE INDEX ON purchase.return_lines(company_id,receipt_line_id);CREATE INDEX ON purchase.return_lines(company_id,bill_line_id);CREATE INDEX ON purchase.supplier_credit_notes(company_id,bill_id);CREATE INDEX ON purchase.supplier_credit_lines(company_id,bill_line_id);CREATE INDEX ON purchase.supplier_credit_lines(company_id,return_line_id);CREATE INDEX ON accounting.supplier_refunds(company_id,credit_line_id);CREATE INDEX ON accounting.supplier_refunds(company_id,advance_id);CREATE INDEX ON accounting.purchase_gst_adjustments(company_id,bill_line_id,adjustment_date);
CREATE VIEW purchase.bill_line_balances WITH(security_invoker=true) AS
 SELECT bl.*,bl.net+bl.tax AS gross,coalesce(cr.quantity,0) AS credited_quantity,coalesce(cr.gross,0) AS credited_amount,coalesce(cr.recoverable_tax,0) AS credited_tax,coalesce(pa.amount,0) AS paid_amount,coalesce(rf.amount,0) AS refunded_amount,
 bl.net+bl.tax-coalesce(cr.gross,0) AS remaining_gross,bl.recoverable_tax-coalesce(cr.recoverable_tax,0) AS remaining_tax,coalesce(pa.amount,0)-coalesce(rf.amount,0) AS net_paid_amount,
 greatest(0,bl.net+bl.tax-coalesce(cr.gross,0)-coalesce(pa.amount,0)+coalesce(rf.amount,0)) AS outstanding_amount,greatest(0,coalesce(pa.amount,0)-coalesce(rf.amount,0)-bl.net-bl.tax+coalesce(cr.gross,0)) AS refundable_amount,
 coalesce(pa.gst,0)+coalesce(adj.gst,0) AS cash_tax_balance
 FROM purchase.bill_lines bl
 LEFT JOIN LATERAL(SELECT sum(quantity) AS quantity,sum(gross) AS gross,sum(recoverable_tax) AS recoverable_tax FROM purchase.supplier_credit_lines WHERE company_id=bl.company_id AND bill_line_id=bl.id)cr ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(gst_amount) AS gst FROM accounting.supplier_payment_allocations WHERE company_id=bl.company_id AND bill_line_id=bl.id)pa ON true
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.supplier_refunds r JOIN purchase.supplier_credit_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=bl.company_id AND cl.bill_line_id=bl.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.purchase_gst_adjustments WHERE company_id=bl.company_id AND bill_line_id=bl.id AND gst_basis='CASH')adj ON true;
-- Preserve the existing view column order; append contra details for current callers.
CREATE OR REPLACE VIEW accounting.ap_balances WITH(security_invoker=true) AS
 SELECT a.*,coalesce(m.paid,0) AS paid_amount,coalesce(m.outstanding,0) AS outstanding_amount,coalesce(m.credited,0) AS credited_amount,coalesce(m.refunded,0) AS refunded_amount,coalesce(m.net_paid,0) AS net_paid_amount,coalesce(m.remaining,0) AS net_amount,coalesce(m.refundable,0) AS available_credit
 FROM accounting.ap_items a LEFT JOIN LATERAL(SELECT sum(paid_amount) AS paid,sum(outstanding_amount) AS outstanding,sum(credited_amount) AS credited,sum(refunded_amount) AS refunded,sum(net_paid_amount) AS net_paid,sum(remaining_gross) AS remaining,sum(refundable_amount) AS refundable FROM purchase.bill_line_balances WHERE company_id=a.company_id AND bill_id=a.bill_id)m ON true;
CREATE OR REPLACE VIEW accounting.supplier_advance_balances WITH(security_invoker=true) AS
 SELECT a.*,a.amount-coalesce((SELECT sum(amount) FROM accounting.supplier_advance_applications WHERE company_id=a.company_id AND advance_id=a.id),0)-coalesce((SELECT sum(amount) FROM accounting.supplier_refunds WHERE company_id=a.company_id AND advance_id=a.id),0) AS available FROM accounting.supplier_advances a;
INSERT INTO identity.permissions(code,description) VALUES('purchase.returns.read','Read purchase returns in assigned warehouses'),('purchase.returns.post','Dispatch purchase returns in assigned warehouses'),('purchase.credits.read','Read supplier credit notes'),('purchase.credits.post','Post supplier adjustment notes'),('purchase.refunds.read','Read supplier refunds'),('purchase.refunds.post','Record verified incoming supplier refunds');
CREATE FUNCTION identity.seed_purchase_return_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND ((r.code IN ('ADMIN','FINANCE') AND p.code IN('purchase.credits.read','purchase.credits.post','purchase.refunds.read','purchase.refunds.post')) OR (r.code IN ('ADMIN','PROCUREMENT','WAREHOUSE') AND p.code IN('purchase.returns.read','purchase.returns.post'))) ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'1600','Purchase returns awaiting supplier credit','ASSET'),(c,'5200','Purchase return cost variance','EXPENSE') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,v.purpose,a.id FROM(VALUES('PURCHASE_RETURN_CLEARING','1600'),('PURCHASE_RETURN_VARIANCE','5200'))v(purpose,code) JOIN accounting.accounts a ON a.company_id=c AND a.code=v.code ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'PURCHASE_RETURN','PRT-'),(c,'SUPPLIER_CREDIT','SC-'),(c,'SUPPLIER_REFUND','SR-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_purchase_return_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.contra_number(p_type text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN
 IF p_type NOT IN ('PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND') THEN RAISE EXCEPTION 'Invalid procurement contra sequence' USING ERRCODE='HP422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=p_type RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Procurement contra sequence missing' USING ERRCODE='HP422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION purchase.return_goods(p_receipt uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO prior_q,prior_n,prior_t FROM purchase.bill_lines WHERE company_id=c AND receipt_line_id=src.id;
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
ALTER TABLE purchase.return_lines DROP CONSTRAINT return_lines_company_id_return_id_fkey;
ALTER TABLE purchase.return_lines ADD FOREIGN KEY(company_id,return_id) REFERENCES purchase.returns(company_id,id) DEFERRABLE INITIALLY DEFERRED;
CREATE FUNCTION purchase.post_supplier_credit(p_bill uuid,p_reference text,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();lid uuid;bill purchase.bills;today date;entry jsonb;src record;bal record;qty numeric;used numeric;used_n numeric;used_t numeric;used_g numeric;n numeric;t numeric;gst numeric;val numeric;tn numeric:=0;tt numeric:=0;desired numeric;delta numeric;no int:=0;ap uuid;input uuid;deferred uuid;j uuid;jl jsonb:='[]';original uuid;
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
 SELECT rl.*,ge.input_account_id,ge.debit_account_id,(ol.snapshot->>'quantityStep')::numeric AS unit_step FROM purchase.return_lines rl JOIN purchase.receipt_lines prl ON prl.company_id=rl.company_id AND prl.id=rl.receipt_line_id JOIN purchase.order_lines ol ON ol.company_id=prl.company_id AND ol.id=prl.order_line_id JOIN purchase.bill_lines bl ON bl.company_id=rl.company_id AND bl.id=rl.bill_line_id JOIN accounting.purchase_gst_entries ge ON ge.company_id=bl.company_id AND ge.bill_line_id=bl.id WHERE rl.company_id=c AND rl.id=(entry->>'returnLineId')::uuid AND bl.bill_id=p_bill INTO src;
 IF NOT FOUND THEN RAISE EXCEPTION 'Billed return line unavailable for credit' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,src.unit_step)<>0 THEN RAISE EXCEPTION 'Positive credit quantity required' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0),coalesce(sum(recoverable_tax),0) INTO used,used_n,used_t,used_g FROM purchase.supplier_credit_lines WHERE company_id=c AND return_line_id=src.id;
 IF used+qty>src.quantity THEN RAISE EXCEPTION 'Credit exceeds returned quantity' USING ERRCODE='HP409';END IF;
 n:=round(src.net*(used+qty)/src.quantity,2)-used_n;t:=round(src.tax*(used+qty)/src.quantity,2)-used_t;gst:=round(src.recoverable_tax*(used+qty)/src.quantity,2)-used_g;val:=n+t-gst;
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
 INSERT INTO purchase.supplier_credit_lines(id,company_id,credit_note_id,bill_line_id,return_line_id,quantity,net,tax,gross,recoverable_tax) VALUES(lid,c,cid,src.bill_line_id,src.id,qty,n,t,n+t,gst);
 IF bill.gst_basis='NON_CASH' AND gst>0 THEN INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,credit_line_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,cid,src.bill_line_id,lid,'CREDIT_NOTE','NON_CASH',today,-n-t,-gst);
 ELSIF bill.gst_basis='CASH' THEN
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=src.bill_line_id;
 IF bal.net_paid_amount<=bal.remaining_gross THEN
 desired:=CASE WHEN bal.remaining_gross=0 THEN 0 ELSE round(bal.remaining_tax*bal.net_paid_amount/bal.remaining_gross,2) END;delta:=desired-bal.cash_tax_balance;
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
ALTER TABLE purchase.supplier_credit_lines DROP CONSTRAINT supplier_credit_lines_company_id_credit_note_id_fkey;
ALTER TABLE purchase.supplier_credit_lines ADD FOREIGN KEY(company_id,credit_note_id) REFERENCES purchase.supplier_credit_notes(company_id,id) DEFERRABLE INITIALLY DEFERRED;
CREATE FUNCTION purchase.receive_supplier_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_date date) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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

-- Preserve existing command entry points while including returned, credited and refunded remainders.
CREATE OR REPLACE FUNCTION purchase.post_bill(p_supplier uuid,p_invoice text,p_invoice_date date,p_due date,p_posting_date date,p_evidence text,p_held_on date,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();bid uuid:=gen_random_uuid();lid uuid;today date;company core.companies;supplier crm.suppliers;snapshot jsonb;
 entry jsonb;src record;prior_q numeric;prior_n numeric;prior_t numeric;returned_q numeric;returned_n numeric;returned_t numeric;qty numeric;n numeric;t numeric;v numeric;gst numeric;tn numeric:=0;tt numeric:=0;tv numeric:=0;tg numeric:=0;
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
 SELECT coalesce(sum(rl.quantity),0),coalesce(sum(rl.net),0),coalesce(sum(rl.tax),0) INTO returned_q,returned_n,returned_t FROM purchase.return_lines rl WHERE rl.company_id=c AND rl.receipt_line_id=src.id AND rl.bill_line_id IS NULL;
 IF prior_q+qty+returned_q>src.quantity THEN RAISE EXCEPTION 'Bill exceeds unmatched receipt quantity' USING ERRCODE='HP409';END IF;
 IF returned_q=0 THEN n:=round(src.net*(prior_q+qty)/src.quantity,2)-prior_n;t:=round(src.tax*(prior_q+qty)/src.quantity,2)-prior_t;
 ELSE n:=round((src.net-returned_n-prior_n)*qty/(src.quantity-returned_q-prior_q),2);t:=round((src.tax-returned_t-prior_t)*qty/(src.quantity-returned_q-prior_q),2);END IF;
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
CREATE OR REPLACE FUNCTION purchase.allocate_supplier_payment(p_doc uuid,p_payment uuid,p_advance uuid,p_supplier uuid,items jsonb,p_paid_on date,p_posting_on date) RETURNS jsonb
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();entry jsonb;src record;bal record;aid uuid;paid numeric;claimed numeric;v numeric;t numeric;allocation uuid;jl jsonb:='[]';tax_date date;
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
 SELECT * INTO bal FROM purchase.bill_line_balances WHERE company_id=c AND id=src.id;
 paid:=bal.net_paid_amount;claimed:=bal.cash_tax_balance;
 IF paid+v>bal.remaining_gross THEN RAISE EXCEPTION 'Payment exceeds outstanding bill line balance' USING ERRCODE='HP409';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=src.account_id AND active AND kind='LIABILITY' AND control_kind='AP' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original bill AP account is inactive' USING ERRCODE='HP422';END IF;
 t:=CASE WHEN src.gst_basis='CASH' THEN greatest(0,round(bal.remaining_tax*(paid+v)/bal.remaining_gross,2)-claimed) ELSE 0 END;
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
CREATE OR REPLACE FUNCTION purchase.apply_supplier_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
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
 used:=used+coalesce((SELECT sum(amount) FROM accounting.supplier_refunds WHERE company_id=c AND advance_id=ad.id),0);
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
CREATE OR REPLACE FUNCTION purchase.validate_supplier_settlement() RETURNS trigger LANGUAGE plpgsql AS $$
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
 WHERE pa.company_id=c AND pa.source_document_id=doc AND (sp.supplier_id<>b.supplier_id OR sp.party_id<>b.party_id OR (SELECT sum(amount) FROM accounting.supplier_payment_allocations WHERE company_id=c AND bill_line_id=bl.id)>bl.net+bl.tax OR (SELECT cash_tax_balance FROM purchase.bill_line_balances WHERE company_id=c AND id=bl.id)>bl.recoverable_tax OR
 (b.gst_basis='CASH' AND NOT EXISTS(SELECT 1 FROM accounting.purchase_gst_attributions ga WHERE ga.company_id=c AND ga.allocation_id=pa.id AND ga.source_document_id=doc AND ga.bill_line_id=bl.id AND ga.amount=pa.amount AND ga.gst_amount=pa.gst_amount AND ga.attribution_date=greatest(sp.paid_on,coalesce(b.tax_invoice_held_on,sp.paid_on)))) OR
 (b.gst_basis='NON_CASH' AND (pa.gst_amount<>0 OR EXISTS(SELECT 1 FROM accounting.purchase_gst_attributions WHERE company_id=c AND allocation_id=pa.id))))) THEN RAISE EXCEPTION 'Supplier allocation or cash GST mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE FUNCTION purchase.guard_procurement_contra() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF OLD.state='POSTED' AND OLD.document_type IN('PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND') THEN RAISE EXCEPTION 'Posted procurement contra is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER procurement_contra_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_procurement_contra();
CREATE FUNCTION purchase.validate_procurement_contra() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;ret purchase.returns;cn purchase.supplier_credit_notes;rf accounting.supplier_refunds;v numeric;n numeric;t numeric;original_line uuid;BEGIN
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
DO $$ DECLARE sc text;tb text;BEGIN FOR sc,tb IN SELECT * FROM(VALUES('purchase','returns'),('purchase','return_lines'),('purchase','supplier_credit_notes'),('purchase','supplier_credit_lines'),('accounting','supplier_refunds'),('accounting','purchase_gst_adjustments'))v(s,t) LOOP
 EXECUTE format('CREATE CONSTRAINT TRIGGER procurement_contra_consistency AFTER INSERT ON %I.%I DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_procurement_contra()',sc,tb);END LOOP;END $$;
REVOKE ALL ON FUNCTION identity.seed_purchase_return_roles(uuid),purchase.contra_number(text),purchase.return_goods(uuid,text,text,jsonb),purchase.post_supplier_credit(uuid,text,text,jsonb),purchase.receive_supplier_refund(uuid,uuid,numeric,text,text,date),purchase.guard_procurement_contra(),purchase.validate_procurement_contra() FROM PUBLIC;
GRANT SELECT ON purchase.returns,purchase.return_lines,purchase.supplier_credit_notes,purchase.supplier_credit_lines,purchase.bill_line_balances,accounting.supplier_refunds,accounting.purchase_gst_adjustments TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.return_goods(uuid,text,text,jsonb),purchase.post_supplier_credit(uuid,text,text,jsonb),purchase.receive_supplier_refund(uuid,uuid,numeric,text,text,date) TO htt_app;
