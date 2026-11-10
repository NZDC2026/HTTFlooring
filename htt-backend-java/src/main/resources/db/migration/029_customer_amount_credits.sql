-- Monetary customer credit adjustments share invoice-backed balances and settlement history.
ALTER TABLE sales.credit_notes ADD COLUMN credit_type text NOT NULL DEFAULT 'QUANTITY' CHECK(credit_type IN('QUANTITY','AMOUNT'));
ALTER TABLE sales.credit_note_lines ALTER COLUMN quantity DROP NOT NULL,
 ADD COLUMN credit_type text NOT NULL DEFAULT 'QUANTITY',ADD COLUMN adjustment_snapshot jsonb,
 ADD CONSTRAINT credit_line_type CHECK((credit_type='QUANTITY' AND quantity IS NOT NULL AND quantity>0 AND adjustment_snapshot IS NULL) OR(credit_type='AMOUNT' AND quantity IS NULL AND return_line_id IS NULL AND gross>0 AND jsonb_typeof(adjustment_snapshot)='object' AND adjustment_snapshot IS NOT NULL));
CREATE OR REPLACE FUNCTION identity.seed_sales_roles(p_company uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT p_company,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p
 WHERE r.company_id=p_company AND (
  (r.code='ADMIN' AND (p.code LIKE 'sales.%' OR p.code IN ('inventory.read','inventory.opening.write'))) OR
  (r.code='OFFICE' AND ((p.code LIKE 'sales.%' AND p.code NOT IN('sales.credits.apply','sales.credits.unapply','sales.credits.adjust')) OR p.code='inventory.read')) OR
  (r.code='SALES' AND p.code IN ('sales.quotes.read','sales.quotes.write','sales.quotes.price.override','sales.orders.read','inventory.read')) OR
  (r.code IN ('WAREHOUSE','PROCUREMENT') AND p.code='inventory.read') OR
  (r.code='FINANCE' AND p.code IN ('sales.orders.read','sales.credit.read')))
 ON CONFLICT(company_id,role_id,permission_code) DO NOTHING;
END $$;
INSERT INTO identity.permissions(code,description) VALUES('sales.credits.adjust','Post independent customer credit net/tax adjustments');
CREATE FUNCTION identity.seed_amount_credit_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,'sales.credits.adjust' FROM identity.roles r WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING;END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_amount_credit_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.amount_credited_line(lid uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT EXISTS(SELECT 1 FROM sales.credit_note_lines WHERE company_id=core.current_company() AND invoice_line_id=lid AND credit_type='AMOUNT') $$;
CREATE OR REPLACE FUNCTION sales.post_credit_note_core(p_invoice uuid,p_reason text,items jsonb,amount_mode boolean DEFAULT false) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();i sales.invoices;today date;entry jsonb;l record;ret inventory.sales_return_lines;
 qty numeric;used numeric;used_n numeric;used_t numeric;qty_n numeric;qty_t numeric;line_snapshot jsonb;n numeric;t numeric;total_n numeric:=0;total_t numeric:=0;built jsonb:='[]';posts jsonb:='[]';no int:=0;lid uuid;ar uuid;revenue uuid;output uuid;orig_batch uuid;j uuid;paid numeric;refunded numeric;cash_tax numeric;target_tax numeric;new_gross numeric;new_tax numeric;
BEGIN
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=p_invoice;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.credits.write',i.customer_id);
 IF amount_mode THEN PERFORM sales.require_customer_access('sales.credits.adjust',i.customer_id);PERFORM sales.require_customer_access('sales.credits.read',i.customer_id);PERFORM sales.require_customer_access('sales.invoices.read',i.customer_id);END IF;
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=i.order_id FOR UPDATE;
 PERFORM platform.require_visible_document(c,p_invoice);
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=i.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(i.customer_id);
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit note requires open period' USING ERRCODE='HR422';END IF;
 IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) v GROUP BY v->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Credit requires reason and distinct invoice lines' USING ERRCODE='HR422';END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'invoiceLineId' LOOP
 SELECT il.*,ol.item_type INTO l FROM sales.invoice_lines il JOIN sales.order_lines ol ON ol.company_id=il.company_id AND ol.id=il.order_line_id WHERE il.company_id=c AND il.invoice_id=p_invoice AND il.id=(entry->>'invoiceLineId')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit invoice line unavailable' USING ERRCODE='HT404';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO used,used_n,used_t FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=l.id;
 line_snapshot:=NULL;
 IF amount_mode THEN
 n:=(entry->>'net')::numeric;t:=(entry->>'tax')::numeric;qty:=NULL;
 IF n IS NULL OR t IS NULL OR n<0 OR t<0 OR n<>round(n,2) OR t<>round(t,2) OR n+t<=0 OR n>999999999999999999.99 OR t>999999999999999999.99 OR nullif(btrim(entry->>'description'),'') IS NULL OR length(btrim(entry->>'description'))>500 OR entry ? 'quantity' OR entry ? 'returnLineId' THEN RAISE EXCEPTION 'Amount credit requires explicit nonnegative net/tax cents and description; no quantity or stock return' USING ERRCODE='HR422';END IF;
 IF n>l.net-used_n OR t>l.tax-used_t THEN RAISE EXCEPTION 'Amount credit exceeds remaining original net or tax' USING ERRCODE='HR409';END IF;
 line_snapshot:=jsonb_build_object('description',btrim(entry->>'description'),'invoiceLineId',l.id,'originalNet',l.net,'originalTax',l.tax,'originalGross',l.gross,'remainingNetBefore',l.net-used_n,'remainingTaxBefore',l.tax-used_t,'taxCodeId',l.tax_code_id,'gstBasis',i.gst_basis,'itemType',l.item_type);
 ELSE
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Credit quantity violates frozen sales step' USING ERRCODE='HR422';END IF;
 IF qty+used>l.quantity THEN RAISE EXCEPTION 'Credit exceeds invoice quantity' USING ERRCODE='HR409';END IF;
 IF l.item_type='STOCK' THEN
 SELECT * INTO ret FROM inventory.sales_return_lines WHERE company_id=c AND id=nullif(entry->>'returnLineId','')::uuid AND invoice_line_id=l.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock credit requires matching received return' USING ERRCODE='HR422';END IF;
 IF qty>ret.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=c AND return_line_id=ret.id),0) THEN RAISE EXCEPTION 'Return already credited or quantity exceeds return' USING ERRCODE='HR409';END IF;
 ELSIF nullif(entry->>'returnLineId','') IS NOT NULL THEN RAISE EXCEPTION 'Non-stock credit must not reference stock return' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum(net),0),coalesce(sum(tax),0) INTO qty_n,qty_t FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=l.id AND credit_type='QUANTITY';
 n:=least(l.net-used_n,round(l.net*(used+qty)/l.quantity,2)-qty_n);t:=least(l.tax-used_t,round(l.tax*(used+qty)/l.quantity,2)-qty_t);
 END IF;
 built:=built||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'invoiceLineId',l.id,'returnLineId',CASE WHEN amount_mode THEN NULL ELSE nullif(entry->>'returnLineId','') END,'quantity',qty,'net',n,'tax',t,'snapshot',line_snapshot));total_n:=total_n+n;total_t:=total_t+t;
 END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'CREDIT_NOTE',accounting.return_number('CREDIT_NOTE'),today,'CONFIRMED',a);
 INSERT INTO sales.credit_notes(id,company_id,invoice_id,reason,net,tax,gross,created_by,credit_type) VALUES(cid,c,p_invoice,trim(p_reason),total_n,total_t,total_n+total_t,a,CASE WHEN amount_mode THEN 'AMOUNT' ELSE 'QUANTITY' END);
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
 INSERT INTO sales.credit_note_lines(id,company_id,credit_note_id,invoice_line_id,return_line_id,quantity,net,tax,gross,credit_type,adjustment_snapshot) VALUES(lid,c,cid,l.id,(entry->>'returnLineId')::uuid,(entry->>'quantity')::numeric,n,t,n+t,CASE WHEN amount_mode THEN 'AMOUNT' ELSE 'QUANTITY' END,nullif(entry->'snapshot','null'::jsonb));
 IF t>0 THEN SELECT output_account_id INTO output FROM accounting.sales_gst_entries WHERE company_id=c AND invoice_line_id=l.id;
 IF output IS NULL THEN RAISE EXCEPTION 'Original GST journal mapping missing' USING ERRCODE='HR422';END IF;posts:=posts||jsonb_build_array(jsonb_build_object('accountId',output,'debit',t,'sourceLineId',lid));END IF;
 IF i.gst_basis='NON_CASH' THEN
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_NOTE','NON_CASH',today,l.tax_code_id,-n-t,-t);
 ELSE
 SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=l.id;refunded:=0;
 new_gross:=l.gross-accounting.line_credited(l.id);SELECT l.tax-coalesce(sum(cl.tax),0) INTO new_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid-refunded<=new_gross OR accounting.amount_credited_line(l.id) THEN
 cash_tax:=accounting.cash_tax_balance(l.id);target_tax:=CASE WHEN paid<=new_gross THEN CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*paid/new_gross,2) END ELSE least(l.tax,new_tax+round((l.tax-new_tax)*(paid-new_gross)/(l.gross-new_gross),2)) END;
 IF target_tax<>cash_tax THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_REBASE','CASH',today,l.tax_code_id,0,target_tax-cash_tax);END IF;
 END IF;END IF;
 END LOOP;
 IF total_n+total_t>0 THEN j:=accounting.post_journal(cid,1,'CREDIT_NOTE',today,'Sales credit / adjustment note',posts);PERFORM accounting.contra_link(orig_batch,j,'CREDIT_NOTE');END IF;
 UPDATE crm.customer_credit_exposures SET receivable=receivable-total_n-total_t WHERE company_id=c AND customer_id=i.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;UPDATE platform.documents SET state=state WHERE company_id=c AND id=i.order_id;RETURN cid;
END $$;
CREATE OR REPLACE FUNCTION sales.post_credit_note(p_invoice uuid,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN sales.post_credit_note_core(p_invoice,p_reason,items,false);END $$;
CREATE FUNCTION sales.post_amount_credit_note(p_invoice uuid,p_reason text,items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN sales.post_credit_note_core(p_invoice,p_reason,items,true);END $$;
CREATE OR REPLACE FUNCTION accounting.post_customer_refund_core(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_cancel_order boolean DEFAULT false,original_bank uuid DEFAULT NULL) RETURNS uuid
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
 SELECT * INTO ad FROM accounting.active_customer_advances WHERE company_id=c AND id=p_advance;
 IF NOT FOUND THEN RAISE EXCEPTION 'Advance unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=ad.receipt_id;SELECT order_id INTO oid FROM sales.order_lines WHERE company_id=c AND id=ad.order_line_id;cust:=r.customer_id;source_doc:=r.id;
 END IF;
 PERFORM sales.require_customer_access('accounting.refunds.write',cust);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;
 SELECT * INTO customer FROM crm.customers WHERE company_id=c AND id=cust FOR UPDATE;SELECT * INTO ex FROM sales.lock_credit(cust);
 IF NOT FOUND THEN RAISE EXCEPTION 'Customer credit projection missing' USING ERRCODE='HR422';END IF;
 IF p_cancel_order AND EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=oid AND state='CANCELLED') THEN p_cancel_order:=false;END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Refund requires open period' USING ERRCODE='HR422';END IF;
 IF p_advance IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.active_customer_advances WHERE company_id=c AND id=p_advance) THEN RAISE EXCEPTION 'Receipt reversed; advance unavailable' USING ERRCODE='HR409';END IF;
 bank:=coalesce(original_bank,accounting.settlement_account('BANK','ASSET','BANK'));PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=bank AND active AND kind='ASSET' AND control_kind='BANK' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original refund bank inactive' USING ERRCODE='HR422';END IF;posts:=jsonb_build_array(jsonb_build_object('accountId',bank,'credit',p_amount));
 IF p_credit_line IS NOT NULL THEN
 SELECT coalesce(sum(amount),0) INTO paid FROM accounting.active_payment_allocations WHERE company_id=c AND invoice_line_id=il.id;
 SELECT coalesce(sum(amount),0) INTO note_refunds FROM accounting.active_customer_refunds WHERE company_id=c AND credit_line_id=cl.id;old_refunds:=accounting.line_refunded(il.id);
 IF p_amount>(SELECT available_apply_amount FROM sales.customer_credit_line_balances WHERE company_id=c AND id=cl.id) OR p_amount>greatest(0,-ex.receivable) THEN RAISE EXCEPTION 'Refund exceeds source payments, credit or customer net credit balance' USING ERRCODE='HR409';END IF;
 IF greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund would remove required order/credit funding' USING ERRCODE='HR409';END IF;
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE pb.company_id=c AND pb.source_document_id=cl.credit_note_id AND pb.posting_kind='CREDIT_NOTE' AND ac.control_kind='AR' AND jl.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original credit AR journal missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',i.party_id,'debit',p_amount));
 IF i.gst_basis='CASH' THEN
 cash_tax:=accounting.cash_tax_balance(il.id);new_gross:=il.gross-accounting.line_credited(il.id);SELECT il.tax-coalesce(sum(v.tax),0) INTO new_tax FROM sales.credit_note_lines v WHERE v.company_id=c AND v.invoice_line_id=il.id;
 IF (accounting.amount_credited_line(il.id) OR accounting.refund_changed_line(il.id) OR accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) THEN SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=il.id;old_refunds:=0;END IF;
 IF paid-old_refunds-p_amount<=new_gross THEN desired:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-old_refunds-p_amount)/new_gross,2) END;
 ELSE desired:=greatest(0,cash_tax-(round(il.tax*(old_refunds+p_amount)/il.gross,2)-round(il.tax*old_refunds/il.gross,2)));END IF;
 IF (accounting.amount_credited_line(il.id) OR accounting.refund_changed_line(il.id) OR accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) AND paid-p_amount>new_gross THEN desired:=least(il.tax,new_tax+round((il.tax-new_tax)*(paid-p_amount-new_gross)/(il.gross-new_gross),2));END IF;
 tax_refund:=greatest(0,cash_tax-desired);END IF;
 ELSE
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used,used_tax FROM accounting.active_advance_applications WHERE company_id=c AND advance_id=ad.id;
 old_refunds:=accounting.advance_refunded(ad.id);available:=ad.amount-used-old_refunds;
 IF p_amount>available THEN RAISE EXCEPTION 'Advance already applied/refunded or insufficient' USING ERRCODE='HR409';END IF;
 IF NOT p_cancel_order AND greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund removes required order funding; cancel unfulfilled order or resolve credit first' USING ERRCODE='HR409';END IF;
 IF p_cancel_order AND (EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=c AND order_id=oid) OR EXISTS(SELECT 1 FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND sr.consumed_quantity>0)) THEN RAISE EXCEPTION 'Only wholly unfulfilled uninvoiced order can be cancelled with advance refund' USING ERRCODE='HR409';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.advance_account_id,'debit',p_amount));
 IF ad.gst_basis='CASH' THEN tax_refund:=greatest(0,least(ad.gst_amount-used_tax-accounting.advance_refund_tax(ad.id),round(ad.gst_amount*(used+old_refunds+p_amount)/ad.amount,2)-used_tax-accounting.advance_refund_tax(ad.id)));END IF;
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
 FOR other IN SELECT av.* FROM accounting.active_customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY av.id LOOP
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
 IF EXISTS(SELECT 1 FROM accounting.active_customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND av.amount-accounting.advance_refunded(av.id)>coalesce((SELECT sum(amount) FROM accounting.active_advance_applications WHERE company_id=c AND advance_id=av.id),0)) THEN RAISE EXCEPTION 'Refund all remaining advances before cancelling order' USING ERRCODE='HR409';END IF;
 FOR other IN SELECT DISTINCT b.product_id,o.warehouse_id FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN inventory.stock_balances b ON b.company_id=sr.company_id AND b.id=sr.stock_balance_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY b.product_id LOOP PERFORM 1 FROM inventory.lock_balance(other.warehouse_id,other.product_id);END LOOP;
 UPDATE inventory.stock_reservations SET released_quantity=quantity WHERE company_id=c AND order_line_id IN(SELECT id FROM sales.order_lines WHERE company_id=c AND order_id=oid);
 UPDATE sales.credit_commitments SET released_amount=amount WHERE company_id=c AND order_id=oid;UPDATE sales.orders SET cancelled_at=now(),cancel_reason=trim(p_reason) WHERE company_id=c AND id=oid;
 UPDATE platform.documents SET state='CANCELLED' WHERE company_id=c AND id=oid;
 END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=fid;RETURN fid;
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
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO paid,tax_paid FROM accounting.active_payment_allocations WHERE company_id=c AND invoice_line_id=l.id;
 SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=l.id;charge:=l.gross-accounting.line_credited(l.id);
 SELECT l.tax-coalesce(sum(cl.tax),0) INTO charge_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid+v>charge THEN RAISE EXCEPTION 'Allocation exceeds invoice balance' USING ERRCODE='HR409';END IF;
 t:=greatest(0,round(charge_tax*(paid+v)/charge,2)-CASE WHEN l.gst_basis='CASH' THEN accounting.cash_tax_balance(l.id) ELSE CASE WHEN accounting.amount_credited_line(l.id) OR accounting.settlement_changed_line(l.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND l.id IN(source_invoice_line_id,target_invoice_line_id)) THEN round(charge_tax*paid/charge,2) ELSE tax_paid END END);
 INSERT INTO accounting.payment_allocations(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,v,t);
 IF l.gst_basis='CASH' THEN
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,CASE WHEN aid IS NULL THEN 'CASH_RECEIPT' ELSE 'ADVANCE_APPLIED' END,'CASH',cash_date,l.tax_code_id,v,t);
 END IF;total_tax:=total_tax+t;
 END LOOP;RETURN total_tax;END $$;
CREATE OR REPLACE FUNCTION accounting.apply_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();application uuid:=gen_random_uuid();ad accounting.customer_advances;r accounting.customer_receipts;customer crm.customers;
 oid uuid;today date;v numeric;used numeric;previous_gst numeric;original_gst numeric;target_gst numeric;delta numeric;ar uuid;posts jsonb;adjustment jsonb;tax_date date;
BEGIN
 SELECT * INTO ad FROM accounting.active_customer_advances WHERE company_id=c AND id=p_advance;
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
 IF NOT EXISTS(SELECT 1 FROM accounting.active_customer_advances WHERE company_id=c AND id=p_advance) THEN RAISE EXCEPTION 'Receipt reversed; advance unavailable' USING ERRCODE='HR409';END IF;
 tax_date:=CASE WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(items) q WHERE accounting.amount_credited_line((q.value->>'invoiceLineId')::uuid)) OR EXISTS(SELECT 1 FROM accounting.advance_unapplications WHERE company_id=c AND advance_id=ad.id) THEN today ELSE r.received_on END;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application requires open period' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(items) jrow JOIN sales.invoice_lines il ON il.company_id=c AND il.id=(jrow->>'invoiceLineId')::uuid JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE i.gst_basis<>ad.gst_basis OR il.tax_code_id<>ad.tax_code_id) THEN RAISE EXCEPTION 'Advance tax basis/code differs from invoice' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum((jrow->>'amount')::numeric),0) INTO v FROM jsonb_array_elements(items) jrow;
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used,previous_gst FROM accounting.active_advance_applications WHERE company_id=c AND advance_id=ad.id;
 used:=used+accounting.advance_refunded(ad.id);previous_gst:=previous_gst+accounting.advance_refund_tax(ad.id);
 IF used+v>ad.amount THEN RAISE EXCEPTION 'Advance balance insufficient' USING ERRCODE='HR409';END IF;
 original_gst:=CASE WHEN ad.gst_basis='CASH' THEN greatest(0,least(ad.gst_amount-previous_gst,round(ad.gst_amount*(used+v)/ad.amount,2)-previous_gst)) ELSE 0 END;
 ar:=accounting.settlement_account('AR','ASSET','AR');
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(application,c,'ADVANCE_APPLICATION',accounting.settlement_number('ADVANCE_APPLICATION'),today,'CONFIRMED',a);
 INSERT INTO accounting.advance_applications(id,company_id,advance_id,amount,consumed_gst,reference,created_by) VALUES(application,c,ad.id,v,original_gst,trim(p_reference),a);
 target_gst:=accounting.allocate_payment(application,r.id,ad.id,r.customer_id,items,tax_date,ad.order_line_id);
 posts:=jsonb_build_array(jsonb_build_object('accountId',ad.advance_account_id,'debit',v),jsonb_build_object('accountId',ar,'partyId',customer.party_id,'credit',v));
 IF ad.gst_basis='CASH' THEN
 delta:=target_gst-original_gst;
 IF delta<>0 THEN
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=tax_date AND ends_on>tax_date AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cash GST rounding adjustment requires original receipt period open' USING ERRCODE='HR422';END IF;
 adjustment:=CASE WHEN delta>0 THEN jsonb_build_array(jsonb_build_object('accountId',ad.clearing_account_id,'debit',delta),jsonb_build_object('accountId',ad.output_account_id,'credit',delta)) ELSE jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',-delta),jsonb_build_object('accountId',ad.clearing_account_id,'credit',-delta)) END;
 PERFORM accounting.post_journal(application,1,'CASH_GST_ROUNDING',tax_date,'Advance GST reconciliation at attribution date',adjustment);
 END IF;
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,application,r.id,ad.id,'ADVANCE_TRANSFER','CASH',tax_date,ad.tax_code_id,-v,-original_gst);
 IF target_gst>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',target_gst),jsonb_build_object('accountId',ad.clearing_account_id,'credit',target_gst));END IF;
 END IF;
 PERFORM accounting.post_journal(application,1,'ADVANCE_APPLICATION',today,'Apply customer advance',posts);
 UPDATE crm.customer_credit_exposures SET receivable=receivable-v,available_advances=available_advances-v WHERE company_id=c AND customer_id=r.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=application;RETURN application;
END $$;
CREATE FUNCTION sales.validate_amount_credit() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;cn sales.credit_notes;i sales.invoices;j uuid;batch uuid;ar uuid;revenue uuid;BEGIN
 IF TG_TABLE_NAME='credit_notes' THEN doc:=NEW.id;ELSE doc:=NEW.credit_note_id;END IF;
 SELECT * INTO cn FROM sales.credit_notes WHERE company_id=c AND id=doc;SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=cn.invoice_id;
 IF EXISTS(SELECT 1 FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE cl.company_id=c AND cl.credit_note_id=doc AND(il.invoice_id<>cn.invoice_id OR cl.credit_type<>cn.credit_type OR (SELECT sum(net) FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=il.id)>il.net OR (SELECT sum(tax) FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=il.id)>il.tax OR coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=il.id),0)>il.quantity)) THEN RAISE EXCEPTION 'Credit source/type/net/tax/quantity capacity mismatch' USING ERRCODE='23514';END IF;
 IF cn.credit_type<>'AMOUNT' THEN RETURN NULL;END IF;
 IF cn.gross<=0 OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=doc AND document_type='CREDIT_NOTE' AND state='POSTED') THEN RAISE EXCEPTION 'Amount credit must be posted with positive gross' USING ERRCODE='23514';END IF;
 SELECT e.id INTO j FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id WHERE b.company_id=c AND b.source_document_id=doc AND b.posting_kind='CREDIT_NOTE';
 SELECT id INTO batch FROM accounting.posting_batches WHERE company_id=c AND source_document_id=i.id AND posting_kind='SALES_INVOICE';
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries e ON e.company_id=jl.company_id AND e.id=jl.journal_entry_id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE e.company_id=c AND e.posting_batch_id=batch AND a.control_kind='AR' AND jl.debit>0 LIMIT 1;
 SELECT jl.account_id INTO revenue FROM accounting.journal_lines jl JOIN accounting.journal_entries e ON e.company_id=jl.company_id AND e.id=jl.journal_entry_id JOIN accounting.accounts a ON a.company_id=jl.company_id AND a.id=jl.account_id WHERE e.company_id=c AND e.posting_batch_id=batch AND a.kind='REVENUE' AND jl.credit>0 LIMIT 1;
 IF j IS NULL OR EXISTS(WITH expected AS(SELECT account_id,party_id,sum(dr) AS dr,sum(cr) AS cr FROM(
 SELECT ar AS account_id,i.party_id AS party_id,0::numeric AS dr,cn.gross AS cr
 UNION ALL SELECT revenue,NULL::uuid,cn.net,0 WHERE cn.net>0
 UNION ALL SELECT ge.output_account_id,NULL::uuid,cl.tax,0 FROM sales.credit_note_lines cl JOIN accounting.sales_gst_entries ge ON ge.company_id=cl.company_id AND ge.invoice_line_id=cl.invoice_line_id WHERE cl.company_id=c AND cl.credit_note_id=doc AND cl.tax>0)q GROUP BY account_id,party_id),
 actual AS(SELECT account_id,party_id,sum(debit) AS dr,sum(credit) AS cr FROM accounting.journal_lines WHERE company_id=c AND journal_entry_id=j GROUP BY account_id,party_id)
 SELECT 1 FROM expected e FULL JOIN actual a ON a.account_id=e.account_id AND a.party_id IS NOT DISTINCT FROM e.party_id WHERE coalesce(e.dr,0)<>coalesce(a.dr,0) OR coalesce(e.cr,0)<>coalesce(a.cr,0)) THEN RAISE EXCEPTION 'Amount credit exact original AR/revenue/output journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE cl.company_id=c AND cl.credit_note_id=doc AND (cl.adjustment_snapshot->>'invoiceLineId' IS DISTINCT FROM il.id::text OR (cl.adjustment_snapshot->>'originalNet')::numeric IS DISTINCT FROM il.net OR (cl.adjustment_snapshot->>'originalTax')::numeric IS DISTINCT FROM il.tax OR cl.adjustment_snapshot->>'taxCodeId' IS DISTINCT FROM il.tax_code_id::text OR cl.adjustment_snapshot->>'gstBasis' IS DISTINCT FROM i.gst_basis)) THEN RAISE EXCEPTION 'Amount credit snapshot mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.credit_note_lines cl JOIN sales.invoice_line_balances b ON b.company_id=cl.company_id AND b.id=cl.invoice_line_id WHERE cl.company_id=c AND cl.credit_note_id=doc AND(b.net_paid_amount<0 OR b.cash_tax_balance<0 OR b.cash_tax_balance>b.tax)) THEN RAISE EXCEPTION 'Amount credit invalid effective settlement or GST' USING ERRCODE='23514';END IF;
 RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER amount_credit_consistency AFTER INSERT ON sales.credit_notes DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_amount_credit();
CREATE CONSTRAINT TRIGGER amount_credit_line_consistency AFTER INSERT ON sales.credit_note_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_amount_credit();
REVOKE ALL ON FUNCTION identity.seed_amount_credit_roles(uuid),accounting.amount_credited_line(uuid),sales.post_credit_note_core(uuid,text,jsonb,boolean),sales.post_amount_credit_note(uuid,text,jsonb),sales.validate_amount_credit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.post_amount_credit_note(uuid,text,jsonb) TO htt_app;
