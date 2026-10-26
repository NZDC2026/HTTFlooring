-- Customer refund corrections retain original financial and business cancellation events.
CREATE TABLE accounting.customer_refund_reversals(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),refund_id uuid NOT NULL,customer_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),journal_entry_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,refund_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,refund_id) REFERENCES accounting.customer_refunds(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id));
CREATE TABLE accounting.customer_refund_corrections(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),reversal_id uuid NOT NULL,original_refund_id uuid NOT NULL,customer_id uuid NOT NULL,reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,reversal_id),FOREIGN KEY(company_id,id) REFERENCES accounting.customer_refunds(company_id,id),FOREIGN KEY(company_id,reversal_id) REFERENCES accounting.customer_refund_reversals(company_id,id),FOREIGN KEY(company_id,original_refund_id) REFERENCES accounting.customer_refunds(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id));
CREATE UNIQUE INDEX customer_refund_reversal_reference ON accounting.customer_refund_reversals(company_id,lower(btrim(reference)));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['customer_refund_reversals','customer_refund_corrections'] LOOP
 EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON accounting.%I(company_id,customer_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
END LOOP;END $$;
CREATE VIEW accounting.active_customer_refunds WITH(security_invoker=true) AS SELECT r.* FROM accounting.customer_refunds r WHERE NOT EXISTS(SELECT 1 FROM accounting.customer_refund_reversals v WHERE v.company_id=r.company_id AND v.refund_id=r.id);
CREATE INDEX customer_refund_credit_lookup ON accounting.customer_refunds(company_id,credit_line_id) WHERE credit_line_id IS NOT NULL;
CREATE INDEX customer_refund_advance_lookup ON accounting.customer_refunds(company_id,advance_id) WHERE advance_id IS NOT NULL;
ALTER TABLE accounting.gst_adjustments ADD COLUMN refund_reversal_id uuid,ADD FOREIGN KEY(company_id,refund_reversal_id) REFERENCES platform.documents(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE accounting.gst_adjustments DROP CONSTRAINT gst_adjustments_kind_check;
ALTER TABLE accounting.gst_adjustments ADD CONSTRAINT gst_adjustments_kind_check CHECK(kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','ADVANCE_REFUND','UNBILLED_RETURN','CREDIT_APPLICATION','CREDIT_UNAPPLICATION','RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION','CUSTOMER_REFUND_REVERSAL')),
 ADD CONSTRAINT refund_gst_source CHECK((kind<>'CUSTOMER_REFUND_REVERSAL' AND refund_reversal_id IS NULL) OR(kind='CUSTOMER_REFUND_REVERSAL' AND refund_reversal_id IS NOT NULL AND refund_reversal_id=source_document_id AND gst_basis='CASH' AND credit_line_id IS NULL AND return_line_id IS NULL AND customer_credit_application_id IS NULL AND settlement_reversal_id IS NULL AND ((invoice_line_id IS NOT NULL AND advance_id IS NULL) OR(invoice_line_id IS NULL AND advance_id IS NOT NULL))));
CREATE INDEX customer_refund_gst_reversal_lookup ON accounting.gst_adjustments(company_id,refund_reversal_id) WHERE refund_reversal_id IS NOT NULL;
CREATE OR REPLACE FUNCTION accounting.line_refunded(lid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(sum(r.amount),0) FROM accounting.active_customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=core.current_company() AND cl.invoice_line_id=lid $$;
CREATE OR REPLACE FUNCTION accounting.advance_refunded(aid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(sum(amount),0) FROM accounting.active_customer_refunds WHERE company_id=core.current_company() AND advance_id=aid $$;
CREATE OR REPLACE FUNCTION accounting.advance_refund_tax(aid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(-sum(gst_amount),0) FROM accounting.gst_adjustments WHERE company_id=core.current_company() AND advance_id=aid AND kind IN('ADVANCE_REFUND','UNBILLED_RETURN','CUSTOMER_REFUND_REVERSAL') $$;
CREATE FUNCTION accounting.refund_changed_line(lid uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT EXISTS(SELECT 1 FROM accounting.customer_refund_reversals v JOIN accounting.customer_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id JOIN sales.credit_note_lines l ON l.company_id=r.company_id AND l.id=r.credit_line_id WHERE v.company_id=core.current_company() AND l.invoice_line_id=lid) $$;
CREATE OR REPLACE VIEW sales.invoice_line_balances WITH(security_invoker=true) AS
 SELECT l.*,i.customer_id,i.party_id,i.gst_basis,i.order_id,i.invoice_date,a.account_id AS ar_account_id,
 coalesce(cr.gross,0) AS credited_amount,coalesce(cr.tax,0) AS credited_tax,coalesce(pa.amount,0) AS paid_amount,coalesce(rf.amount,0) AS refunded_amount,
 l.gross-coalesce(cr.gross,0) AS remaining_gross,l.tax-coalesce(cr.tax,0) AS remaining_tax,
 coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0) AS net_paid_amount,
 greatest(0,l.gross-coalesce(cr.gross,0)-coalesce(pa.amount,0)+coalesce(rf.amount,0)-coalesce(ci.amount,0)+coalesce(co.amount,0)) AS outstanding_amount,
 greatest(0,coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0)-l.gross+coalesce(cr.gross,0)) AS refundable_amount,
 CASE WHEN i.gst_basis='CASH' THEN coalesce((SELECT sum(p.gst_amount) FROM accounting.payment_allocations p WHERE p.company_id=l.company_id AND p.invoice_line_id=l.id),0)+coalesce(ga.gst,0) ELSE coalesce(pa.gst,0)+coalesce(ga.gst,0) END AS cash_tax_balance,coalesce(ci.amount,0) AS credit_received_amount,coalesce(co.amount,0) AS credit_used_amount
 FROM sales.invoice_lines l JOIN sales.invoices i ON i.company_id=l.company_id AND i.id=l.invoice_id JOIN accounting.invoice_ar_accounts a ON a.company_id=i.company_id AND a.invoice_id=i.id
 LEFT JOIN LATERAL(SELECT sum(gross) AS gross,sum(tax) AS tax FROM sales.credit_note_lines WHERE company_id=l.company_id AND invoice_line_id=l.id)cr ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(gst_amount) AS gst FROM accounting.active_payment_allocations WHERE company_id=l.company_id AND invoice_line_id=l.id)pa ON true
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.active_customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=l.company_id AND cl.invoice_line_id=l.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.gst_adjustments WHERE company_id=l.company_id AND invoice_line_id=l.id AND gst_basis='CASH')ga ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND target_invoice_line_id=l.id)ci ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND source_invoice_line_id=l.id)co ON true;
CREATE OR REPLACE VIEW sales.customer_credit_line_balances WITH(security_invoker=true) AS
 SELECT cl.*,b.customer_id,b.party_id,coalesce(r.amount,0) AS refunded_amount,coalesce(a.amount,0) AS applied_amount,cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0) AS unallocated_amount,
 greatest(0,least(cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0),b.refundable_amount)) AS available_apply_amount
 FROM sales.credit_note_lines cl JOIN sales.invoice_line_balances b ON b.company_id=cl.company_id AND b.id=cl.invoice_line_id
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM accounting.active_customer_refunds WHERE company_id=cl.company_id AND credit_line_id=cl.id)r ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=cl.company_id AND credit_line_id=cl.id)a ON true;
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
 IF (accounting.refund_changed_line(il.id) OR accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) THEN SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=il.id;old_refunds:=0;END IF;
 IF paid-old_refunds-p_amount<=new_gross THEN desired:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-old_refunds-p_amount)/new_gross,2) END;
 ELSE desired:=greatest(0,cash_tax-(round(il.tax*(old_refunds+p_amount)/il.gross,2)-round(il.tax*old_refunds/il.gross,2)));END IF;
 IF (accounting.refund_changed_line(il.id) OR accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) AND paid-p_amount>new_gross THEN desired:=least(il.tax,new_tax+round((il.tax-new_tax)*(paid-p_amount-new_gross)/(il.gross-new_gross),2));END IF;
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
CREATE OR REPLACE FUNCTION accounting.post_customer_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_cancel_order boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN accounting.post_customer_refund_core(p_credit_line,p_advance,p_amount,p_reference,p_reason,p_cancel_order,NULL);END $$;
INSERT INTO identity.permissions(code,description) VALUES('accounting.refunds.reverse','Reverse an erroneous customer refund'),('accounting.refunds.correct','Correct a customer refund through linked reversal/replacement');
CREATE FUNCTION identity.seed_customer_refund_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('accounting.refunds.reverse','accounting.refunds.correct') ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'CUSTOMER_REFUND_REVERSAL','CFR-') ON CONFLICT DO NOTHING;END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_customer_refund_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.refund_reversal_number() RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type='CUSTOMER_REFUND_REVERSAL' RETURNING next_value-1,prefix INTO n,p;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal sequence missing' USING ERRCODE='HR422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION accounting.lock_refund_correction(rid uuid,credit_line uuid DEFAULT NULL,advance uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();cust uuid;oid uuid;BEGIN
 SELECT customer_id INTO cust FROM accounting.customer_refunds WHERE company_id=c AND id=rid;IF NOT FOUND THEN RAISE EXCEPTION 'Customer refund unavailable' USING ERRCODE='HT404';END IF;
 FOR oid IN SELECT DISTINCT order_id FROM(
 SELECT i.order_id FROM accounting.customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE r.company_id=c AND r.id=rid
 UNION ALL SELECT ol.order_id FROM accounting.customer_refunds r JOIN accounting.customer_advances a ON a.company_id=r.company_id AND a.id=r.advance_id JOIN sales.order_lines ol ON ol.company_id=a.company_id AND ol.id=a.order_line_id WHERE r.company_id=c AND r.id=rid
 UNION ALL SELECT i.order_id FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE cl.company_id=c AND cl.id=credit_line AND i.customer_id=cust
 UNION ALL SELECT ol.order_id FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id JOIN sales.order_lines ol ON ol.company_id=a.company_id AND ol.id=a.order_line_id WHERE a.company_id=c AND a.id=advance AND r.customer_id=cust)q ORDER BY order_id LOOP PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;END LOOP;
 FOR oid IN SELECT DISTINCT invoice_id FROM(
 SELECT il.invoice_id FROM accounting.customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE r.company_id=c AND r.id=rid
 UNION ALL SELECT il.invoice_id FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE cl.company_id=c AND cl.id=credit_line AND i.customer_id=cust)q ORDER BY invoice_id LOOP PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;END LOOP;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=cust FOR UPDATE;PERFORM 1 FROM sales.lock_credit(cust);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;RETURN cust;END $$;
CREATE FUNCTION accounting.refund_correction_context(cust uuid,cap text,p_reference text,p_reason text) RETURNS date LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE today date;BEGIN
 PERFORM sales.require_customer_access(cap,cust);PERFORM sales.require_customer_access('accounting.refunds.read',cust);PERFORM sales.require_customer_access('accounting.receivables.read',cust);
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Refund correction reference and reason required' USING ERRCODE='HR422';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=core.current_company() FOR SHARE;PERFORM 1 FROM accounting.periods WHERE company_id=core.current_company() AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Refund correction requires open current period' USING ERRCODE='HR422';END IF;RETURN today;END $$;
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

  UNION ALL SELECT 'receipt_reversal.amount',x.id,r.amount,x.amount,'AUD' FROM accounting.receipt_reversals x JOIN accounting.customer_receipts r ON r.company_id=x.company_id AND r.id=x.receipt_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'advance_unapplication.amount',x.id,a.amount,x.amount,'AUD' FROM accounting.advance_unapplications x JOIN accounting.advance_applications a ON a.company_id=x.company_id AND a.id=x.application_id WHERE x.company_id=core.current_company()
  UNION ALL SELECT 'settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM sales.invoice_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'advance.negative_available',b.id,0,greatest(0,-b.available),'AUD' FROM accounting.customer_advance_balances b WHERE b.company_id=core.current_company()

  UNION ALL SELECT 'supplier_payment_reversal.amount',r.id,p.amount,r.amount,'AUD' FROM accounting.supplier_payment_reversals r JOIN accounting.supplier_payments p ON p.company_id=r.company_id AND p.id=r.payment_id WHERE r.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance_unapplication.amount',u.id,a.amount,u.amount,'AUD' FROM accounting.supplier_advance_unapplications u JOIN accounting.supplier_advance_applications a ON a.company_id=u.company_id AND a.id=u.application_id WHERE u.company_id=core.current_company()
  UNION ALL SELECT 'supplier_settlement.negative_funds',b.id,0,greatest(0,-b.net_paid_amount),'AUD' FROM purchase.bill_line_balances b WHERE b.company_id=core.current_company()
  UNION ALL SELECT 'supplier_advance.negative_available',a.id,0,greatest(0,-a.available),'AUD' FROM accounting.supplier_advance_balances a WHERE a.company_id=core.current_company()

  UNION ALL SELECT 'customer_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.customer_refund_reversals v JOIN accounting.customer_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
CREATE FUNCTION accounting.refund_invoice_gst(doc uuid,lid uuid,movement numeric,on_date date,correction_kind text,net_change numeric DEFAULT 0) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();b record;desired numeric;delta numeric;BEGIN
 SELECT * INTO b FROM sales.invoice_line_balances WHERE company_id=c AND id=lid;
 b.net_paid_amount:=b.net_paid_amount+net_change;IF b.net_paid_amount<0 THEN RAISE EXCEPTION 'Settlement funds already refunded or transferred; undo downstream use first' USING ERRCODE='HR409';END IF;
 IF b.gst_basis<>'CASH' THEN RETURN;END IF;
 IF b.net_paid_amount<=b.remaining_gross THEN desired:=CASE WHEN b.remaining_gross=0 THEN 0 ELSE round(b.remaining_tax*b.net_paid_amount/b.remaining_gross,2) END;
 ELSE desired:=least(b.tax,b.remaining_tax+round((b.tax-b.remaining_tax)*(b.net_paid_amount-b.remaining_gross)/(b.gross-b.remaining_gross),2));END IF;
 delta:=desired-b.cash_tax_balance;IF delta<>0 THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,refund_reversal_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,lid,doc,correction_kind,'CASH',on_date,b.tax_code_id,movement,delta);END IF;END $$;
CREATE FUNCTION accounting.reverse_customer_refund(refund uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();actor uuid:=core.current_actor();doc uuid:=gen_random_uuid();rf accounting.customer_refunds;ad accounting.customer_advances;today date;j uuid;original_j uuid;batch uuid;posts jsonb;entry record;lid uuid;used_amount numeric;used_tax numeric;remaining_refunds numeric;prior_tax numeric;desired_tax numeric;delta numeric;BEGIN
 PERFORM purchase.require_access('accounting.refunds.reverse');SELECT * INTO rf FROM accounting.customer_refunds WHERE company_id=c AND id=refund;IF NOT FOUND THEN RAISE EXCEPTION 'Customer refund unavailable' USING ERRCODE='HT404';END IF;
 today:=accounting.refund_correction_context(rf.customer_id,'accounting.refunds.reverse',p_reference,p_reason);PERFORM accounting.lock_refund_correction(refund);
 IF rf.credit_line_id IS NOT NULL THEN
 SELECT il.invoice_id INTO lid FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id WHERE cl.company_id=c AND cl.id=rf.credit_line_id;
 ELSE SELECT ol.order_id INTO lid FROM accounting.customer_advances a JOIN sales.order_lines ol ON ol.company_id=a.company_id AND ol.id=a.order_line_id WHERE a.company_id=c AND a.id=rf.advance_id;END IF;
 IF NOT platform.document_visible(lid) THEN RAISE EXCEPTION 'Restore original invoice/order visibility before correcting its refund' USING ERRCODE='HR409';END IF;
 IF NOT EXISTS(SELECT 1 FROM accounting.active_customer_refunds WHERE company_id=c AND id=refund) THEN RAISE EXCEPTION 'Refund already reversed' USING ERRCODE='HR409';END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=refund AND state='POSTED' AND business_date<=today) THEN RAISE EXCEPTION 'Correction cannot precede posted refund' USING ERRCODE='HR422';END IF;
 SELECT b.id,e.id INTO batch,original_j FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id WHERE b.company_id=c AND b.source_document_id=refund AND b.posting_kind='CUSTOMER_REFUND';IF original_j IS NULL THEN RAISE EXCEPTION 'Original refund journal missing' USING ERRCODE='HR422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'CUSTOMER_REFUND_REVERSAL',accounting.refund_reversal_number(),today,'CONFIRMED',actor);
 -- Reverse original bank and AR/prepayment lines; GST clearing is recalculated separately.
 SELECT coalesce(jsonb_agg(jsonb_build_object('accountId',l.account_id,'partyId',l.party_id,'debit',l.credit,'credit',l.debit)),'[]'::jsonb) INTO posts FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id
 WHERE l.company_id=c AND l.journal_entry_id=original_j AND ac.control_kind IS DISTINCT FROM 'GST' AND NOT EXISTS(SELECT 1 FROM accounting.gst_adjustments ga JOIN accounting.customer_advances a ON a.company_id=ga.company_id AND a.id=ga.advance_id WHERE ga.company_id=c AND ga.source_document_id=refund AND l.account_id IN(a.output_account_id,a.clearing_account_id));
 IF rf.credit_line_id IS NOT NULL THEN
 SELECT invoice_line_id INTO lid FROM sales.credit_note_lines WHERE company_id=c AND id=rf.credit_line_id;
 PERFORM accounting.refund_invoice_gst(doc,lid,rf.amount,today,'CUSTOMER_REFUND_REVERSAL',rf.amount);
 UPDATE crm.customer_credit_exposures SET receivable=receivable-rf.amount WHERE company_id=c AND customer_id=rf.customer_id;
 ELSE
 SELECT * INTO ad FROM accounting.active_customer_advances WHERE company_id=c AND id=rf.advance_id;IF NOT FOUND THEN RAISE EXCEPTION 'Refund source receipt has been reversed' USING ERRCODE='HR409';END IF;
 IF ad.gst_basis='CASH' THEN
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used_amount,used_tax FROM accounting.active_advance_applications WHERE company_id=c AND advance_id=ad.id;
 remaining_refunds:=accounting.advance_refunded(ad.id)-rf.amount;prior_tax:=accounting.advance_refund_tax(ad.id);
 desired_tax:=greatest(0,least(ad.gst_amount-used_tax,round(ad.gst_amount*(used_amount+remaining_refunds)/ad.amount,2)-used_tax));delta:=prior_tax-desired_tax;
 IF delta<>0 THEN
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,refund_reversal_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,ad.id,doc,'CUSTOMER_REFUND_REVERSAL','CASH',today,ad.tax_code_id,rf.amount,delta);
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.clearing_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',ad.output_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
 END IF;END IF;
 -- NON_CASH cancellation GST remains valid because the order cancellation is retained.
 UPDATE crm.customer_credit_exposures SET available_advances=available_advances+rf.amount WHERE company_id=c AND customer_id=rf.customer_id;
 END IF;
 j:=accounting.post_journal(doc,1,'CUSTOMER_REFUND_REVERSAL',today,'Reverse erroneous customer refund',posts);
 INSERT INTO accounting.customer_refund_reversals(id,company_id,refund_id,customer_id,amount,reference,reason,journal_entry_id,created_by) VALUES(doc,c,refund,rf.customer_id,rf.amount,btrim(p_reference),btrim(p_reason),j,actor);
 PERFORM accounting.contra_link(batch,j,'CUSTOMER_REFUND_REVERSAL');UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;END $$;
CREATE FUNCTION accounting.replace_customer_refund(reversal uuid,credit_line uuid,advance uuid,amount numeric,p_reference text,p_reason text,cancel_order boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();v accounting.customer_refund_reversals;target_customer uuid;today date;bank uuid;doc uuid;BEGIN
 PERFORM purchase.require_access('accounting.refunds.correct');SELECT * INTO v FROM accounting.customer_refund_reversals WHERE company_id=c AND id=reversal;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal unavailable' USING ERRCODE='HT404';END IF;
 today:=accounting.refund_correction_context(v.customer_id,'accounting.refunds.correct',p_reference,p_reason);PERFORM sales.require_customer_access('accounting.refunds.write',v.customer_id);PERFORM accounting.lock_refund_correction(v.refund_id,credit_line,advance);
 IF EXISTS(SELECT 1 FROM accounting.customer_refund_corrections WHERE company_id=c AND reversal_id=reversal) THEN RAISE EXCEPTION 'Refund reversal already corrected' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=reversal AND business_date>today) THEN RAISE EXCEPTION 'Correction cannot precede reversal' USING ERRCODE='HR422';END IF;
 IF num_nonnulls(credit_line,advance)<>1 THEN RAISE EXCEPTION 'Select one refund source' USING ERRCODE='HR422';END IF;
 IF credit_line IS NOT NULL THEN SELECT i.customer_id INTO target_customer FROM sales.credit_note_lines l JOIN sales.invoice_lines il ON il.company_id=l.company_id AND il.id=l.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE l.company_id=c AND l.id=credit_line;
 ELSE SELECT r.customer_id INTO target_customer FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=c AND a.id=advance;END IF;
 IF target_customer IS DISTINCT FROM v.customer_id THEN RAISE EXCEPTION 'Refund source unavailable for original customer' USING ERRCODE='HT404';END IF;
 SELECT l.account_id INTO bank FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=e.company_id AND l.journal_entry_id=e.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=c AND b.source_document_id=v.refund_id AND b.posting_kind='CUSTOMER_REFUND' AND a.control_kind='BANK' AND l.credit>0 LIMIT 1;
 IF bank IS NULL THEN RAISE EXCEPTION 'Original refund bank missing' USING ERRCODE='HR422';END IF;
 doc:=accounting.post_customer_refund_core(credit_line,advance,amount,p_reference,p_reason,cancel_order,bank);
 INSERT INTO accounting.customer_refund_corrections(id,company_id,reversal_id,original_refund_id,customer_id,reason,created_by) VALUES(doc,c,reversal,v.refund_id,v.customer_id,btrim(p_reason),core.current_actor());RETURN doc;END $$;
CREATE FUNCTION accounting.correct_customer_refund(refund uuid,reversal_reference text,credit_line uuid,advance uuid,amount numeric,p_reference text,p_reason text,cancel_order boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();cust uuid;rev uuid;BEGIN
 PERFORM purchase.require_access('accounting.refunds.reverse');PERFORM purchase.require_access('accounting.refunds.correct');SELECT customer_id INTO cust FROM accounting.customer_refunds WHERE company_id=c AND id=refund;IF NOT FOUND THEN RAISE EXCEPTION 'Customer refund unavailable' USING ERRCODE='HT404';END IF;
 PERFORM accounting.refund_correction_context(cust,'accounting.refunds.reverse',reversal_reference,p_reason);PERFORM accounting.refund_correction_context(cust,'accounting.refunds.correct',p_reference,p_reason);PERFORM sales.require_customer_access('accounting.refunds.write',cust);
 PERFORM accounting.lock_refund_correction(refund,credit_line,advance);rev:=accounting.reverse_customer_refund(refund,reversal_reference,p_reason);RETURN accounting.replace_customer_refund(rev,credit_line,advance,amount,p_reference,p_reason,cancel_order);END $$;
ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND','SUPPLIER_CREDIT_UNAPPLICATION','CUSTOMER_CREDIT_UNAPPLICATION','RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION','SUPPLIER_PAYMENT_REVERSAL','SUPPLIER_ADVANCE_UNAPPLICATION','CUSTOMER_REFUND_REVERSAL'));
CREATE FUNCTION accounting.guard_refund_reversal_document() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN IF OLD.state='POSTED' AND OLD.document_type='CUSTOMER_REFUND_REVERSAL' THEN RAISE EXCEPTION 'Posted refund reversals are immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER customer_refund_reversal_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION accounting.guard_refund_reversal_document();
CREATE FUNCTION accounting.validate_refund_reversal() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;v accounting.customer_refund_reversals;r accounting.customer_refunds;ad accounting.customer_advances;j uuid;original_j uuid;BEGIN
 IF TG_TABLE_NAME='gst_adjustments' THEN IF NEW.refund_reversal_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.refund_reversal_id;
 ELSIF TG_TABLE_NAME='customer_refund_corrections' THEN
 SELECT * INTO v FROM accounting.customer_refund_reversals WHERE company_id=c AND id=NEW.reversal_id;SELECT * INTO r FROM accounting.customer_refunds WHERE company_id=c AND id=NEW.id;
 IF v.refund_id<>NEW.original_refund_id OR v.customer_id<>NEW.customer_id OR r.customer_id<>NEW.customer_id THEN RAISE EXCEPTION 'Refund correction source mismatch' USING ERRCODE='23514';END IF;
 IF (SELECT l.account_id FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=e.company_id AND l.journal_entry_id=e.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=c AND b.source_document_id=r.id AND b.posting_kind='CUSTOMER_REFUND' AND a.control_kind='BANK' AND l.credit>0 LIMIT 1) IS DISTINCT FROM
 (SELECT l.account_id FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id JOIN accounting.journal_lines l ON l.company_id=e.company_id AND l.journal_entry_id=e.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE b.company_id=c AND b.source_document_id=v.refund_id AND b.posting_kind='CUSTOMER_REFUND' AND a.control_kind='BANK' AND l.credit>0 LIMIT 1) THEN RAISE EXCEPTION 'Corrected refund bank differs from original' USING ERRCODE='23514';END IF;RETURN NULL;
 ELSE doc:=NEW.id;END IF;
 SELECT * INTO v FROM accounting.customer_refund_reversals WHERE company_id=c AND id=doc;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal event missing' USING ERRCODE='23514';END IF;SELECT * INTO r FROM accounting.customer_refunds WHERE company_id=c AND id=v.refund_id;j:=v.journal_entry_id;
 SELECT e.id INTO original_j FROM accounting.posting_batches b JOIN accounting.journal_entries e ON e.company_id=b.company_id AND e.posting_batch_id=b.id WHERE b.company_id=c AND b.source_document_id=r.id AND b.posting_kind='CUSTOMER_REFUND';
 IF v.amount<>r.amount OR v.customer_id<>r.customer_id OR NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries e ON e.company_id=d.company_id AND e.id=j JOIN accounting.posting_batches b ON b.company_id=e.company_id AND b.id=e.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.state='POSTED' AND d.document_type='CUSTOMER_REFUND_REVERSAL' AND e.posting_date=d.business_date AND b.source_document_id=doc AND b.posting_kind='CUSTOMER_REFUND_REVERSAL') THEN RAISE EXCEPTION 'Refund reversal amount/registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH expected AS(SELECT account_id,party_id,sum(dr) AS dr,sum(cr) AS cr FROM(
 SELECT l.account_id,l.party_id,l.credit AS dr,l.debit AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=original_j AND ac.control_kind IS DISTINCT FROM 'GST' AND NOT EXISTS(SELECT 1 FROM accounting.gst_adjustments ga JOIN accounting.customer_advances a ON a.company_id=ga.company_id AND a.id=ga.advance_id WHERE ga.company_id=c AND ga.source_document_id=r.id AND l.account_id IN(a.output_account_id,a.clearing_account_id))
 UNION ALL SELECT a.clearing_account_id,NULL::uuid,greatest(g.gst_amount,0),greatest(-g.gst_amount,0) FROM accounting.gst_adjustments g JOIN accounting.customer_advances a ON a.company_id=g.company_id AND a.id=g.advance_id WHERE g.company_id=c AND g.refund_reversal_id=doc
 UNION ALL SELECT a.output_account_id,NULL::uuid,greatest(-g.gst_amount,0),greatest(g.gst_amount,0) FROM accounting.gst_adjustments g JOIN accounting.customer_advances a ON a.company_id=g.company_id AND a.id=g.advance_id WHERE g.company_id=c AND g.refund_reversal_id=doc)q GROUP BY account_id,party_id),actual AS(SELECT account_id,party_id,sum(debit) AS dr,sum(credit) AS cr FROM accounting.journal_lines WHERE company_id=c AND journal_entry_id=j GROUP BY account_id,party_id)
 SELECT 1 FROM expected exp FULL JOIN actual act ON act.account_id=exp.account_id AND act.party_id IS NOT DISTINCT FROM exp.party_id WHERE coalesce(exp.dr,0)<>coalesce(act.dr,0) OR coalesce(exp.cr,0)<>coalesce(act.cr,0)) THEN RAISE EXCEPTION 'Refund reversal exact bank/AR/advance/GST journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.invoice_line_balances WHERE company_id=c AND customer_id=r.customer_id AND(net_paid_amount<0 OR cash_tax_balance<0 OR cash_tax_balance>tax)) OR EXISTS(SELECT 1 FROM accounting.customer_advance_balances WHERE company_id=c AND customer_id=r.customer_id AND available<0) THEN RAISE EXCEPTION 'Refund reversal invalid source balances' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.gst_adjustments g JOIN platform.documents d ON d.company_id=g.company_id AND d.id=g.source_document_id WHERE g.company_id=c AND g.refund_reversal_id=doc AND(g.kind<>'CUSTOMER_REFUND_REVERSAL' OR g.adjustment_date<>d.business_date OR
 (g.invoice_line_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM sales.credit_note_lines cl JOIN sales.invoice_lines il ON il.company_id=cl.company_id AND il.id=cl.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE cl.company_id=c AND cl.id=r.credit_line_id AND il.id=g.invoice_line_id AND il.tax_code_id=g.tax_code_id AND i.gst_basis='CASH')) OR
 (g.advance_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.customer_advances a WHERE a.company_id=c AND a.id=r.advance_id AND a.id=g.advance_id AND a.tax_code_id=g.tax_code_id AND a.gst_basis='CASH')))) THEN RAISE EXCEPTION 'Refund reversal GST origin mismatch' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER customer_refund_reversal_consistency AFTER INSERT ON accounting.customer_refund_reversals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_refund_reversal();
CREATE CONSTRAINT TRIGGER customer_refund_correction_consistency AFTER INSERT ON accounting.customer_refund_corrections DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_refund_reversal();
CREATE CONSTRAINT TRIGGER customer_refund_reversal_gst_consistency AFTER INSERT ON accounting.gst_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_refund_reversal();
REVOKE ALL ON FUNCTION identity.seed_customer_refund_roles(uuid),accounting.refund_reversal_number(),accounting.refund_changed_line(uuid),accounting.post_customer_refund_core(uuid,uuid,numeric,text,text,boolean,uuid),accounting.lock_refund_correction(uuid,uuid,uuid),accounting.refund_correction_context(uuid,text,text,text),accounting.refund_invoice_gst(uuid,uuid,numeric,date,text,numeric),accounting.reverse_customer_refund(uuid,text,text),accounting.replace_customer_refund(uuid,uuid,uuid,numeric,text,text,boolean),accounting.correct_customer_refund(uuid,text,uuid,uuid,numeric,text,text,boolean),accounting.guard_refund_reversal_document(),accounting.validate_refund_reversal() FROM PUBLIC;
GRANT SELECT ON accounting.customer_refund_reversals,accounting.customer_refund_corrections,accounting.active_customer_refunds TO htt_app;
GRANT EXECUTE ON FUNCTION accounting.reverse_customer_refund(uuid,text,text),accounting.replace_customer_refund(uuid,uuid,uuid,numeric,text,text,boolean),accounting.correct_customer_refund(uuid,text,uuid,uuid,numeric,text,text,boolean) TO htt_app;
