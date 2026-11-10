-- Append-only supplier refund reversals and replacements retain original procurement and settlement events.
CREATE TABLE accounting.supplier_refund_reversals(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),refund_id uuid NOT NULL,supplier_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>0),reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),journal_entry_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,refund_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,refund_id) REFERENCES accounting.supplier_refunds(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id));
CREATE TABLE accounting.supplier_refund_corrections(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),reversal_id uuid NOT NULL,original_refund_id uuid NOT NULL,supplier_id uuid NOT NULL,reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,reversal_id),FOREIGN KEY(company_id,id) REFERENCES accounting.supplier_refunds(company_id,id),FOREIGN KEY(company_id,reversal_id) REFERENCES accounting.supplier_refund_reversals(company_id,id),FOREIGN KEY(company_id,original_refund_id) REFERENCES accounting.supplier_refunds(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id));
CREATE UNIQUE INDEX supplier_refund_reversal_reference ON accounting.supplier_refund_reversals(company_id,lower(btrim(reference)));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['supplier_refund_reversals','supplier_refund_corrections'] LOOP
 EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON accounting.%I(company_id,supplier_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
END LOOP;END $$;
CREATE VIEW accounting.active_supplier_refunds WITH(security_invoker=true) AS SELECT r.* FROM accounting.supplier_refunds r WHERE NOT EXISTS(SELECT 1 FROM accounting.supplier_refund_reversals v WHERE v.company_id=r.company_id AND v.refund_id=r.id);
ALTER TABLE accounting.purchase_gst_adjustments ADD COLUMN refund_reversal_id uuid,ADD FOREIGN KEY(company_id,refund_reversal_id) REFERENCES platform.documents(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE accounting.purchase_gst_adjustments DROP CONSTRAINT purchase_gst_adjustments_kind_check,DROP CONSTRAINT purchase_gst_adjustment_source;
ALTER TABLE accounting.purchase_gst_adjustments ADD CONSTRAINT purchase_gst_adjustments_kind_check CHECK(kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','CREDIT_APPLICATION','CREDIT_UNAPPLICATION','SUPPLIER_PAYMENT_REVERSAL','SUPPLIER_ADVANCE_UNAPPLICATION','SUPPLIER_REFUND_REVERSAL')),
 ADD CONSTRAINT purchase_gst_adjustment_source CHECK((refund_reversal_id IS NULL AND ((kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND') AND credit_line_id IS NOT NULL AND credit_application_id IS NULL AND settlement_reversal_id IS NULL) OR(kind IN('CREDIT_APPLICATION','CREDIT_UNAPPLICATION') AND credit_line_id IS NULL AND credit_application_id IS NOT NULL AND settlement_reversal_id IS NULL) OR(kind IN('SUPPLIER_PAYMENT_REVERSAL','SUPPLIER_ADVANCE_UNAPPLICATION') AND credit_line_id IS NULL AND credit_application_id IS NULL AND settlement_reversal_id IS NOT NULL AND settlement_reversal_id=source_document_id AND gst_basis='CASH'))) OR(kind='SUPPLIER_REFUND_REVERSAL' AND refund_reversal_id IS NOT NULL AND refund_reversal_id=source_document_id AND credit_line_id IS NULL AND credit_application_id IS NULL AND settlement_reversal_id IS NULL AND gst_basis='CASH'));
CREATE INDEX supplier_refund_gst_reversal_lookup ON accounting.purchase_gst_adjustments(company_id,refund_reversal_id) WHERE refund_reversal_id IS NOT NULL;
CREATE OR REPLACE VIEW accounting.supplier_advance_balances WITH(security_invoker=true) AS SELECT a.*,CASE WHEN EXISTS(SELECT 1 FROM accounting.supplier_payment_reversals r WHERE r.company_id=a.company_id AND r.payment_id=a.payment_id) THEN 0 ELSE a.amount-coalesce((SELECT sum(amount) FROM accounting.active_supplier_advance_applications WHERE company_id=a.company_id AND advance_id=a.id),0)-coalesce((SELECT sum(amount) FROM accounting.active_supplier_refunds WHERE company_id=a.company_id AND advance_id=a.id),0) END AS available FROM accounting.supplier_advances a;
CREATE OR REPLACE VIEW purchase.bill_line_balances WITH(security_invoker=true) AS
 SELECT bl.id,bl.company_id,bl.bill_id,bl.receipt_line_id,bl.grni_item_id,bl.quantity,bl.net,bl.tax,bl.grni_amount,bl.recoverable_tax,bl.tax_code_id,bl.tax_rate,bl.snapshot,
 bl.net+bl.tax AS gross,coalesce(cr.quantity,0) AS credited_quantity,coalesce(cr.gross,0) AS credited_amount,coalesce(cr.recoverable_tax,0) AS credited_tax,coalesce(pa.amount,0) AS paid_amount,coalesce(rf.amount,0) AS refunded_amount,
 bl.net+bl.tax-coalesce(cr.gross,0) AS remaining_gross,bl.recoverable_tax-coalesce(cr.recoverable_tax,0) AS remaining_tax,
 coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0) AS net_paid_amount,
 greatest(0,bl.net+bl.tax-coalesce(cr.gross,0)-coalesce(pa.amount,0)+coalesce(rf.amount,0)-coalesce(ci.amount,0)+coalesce(co.amount,0)) AS outstanding_amount,
 greatest(0,coalesce(pa.amount,0)-coalesce(rf.amount,0)+coalesce(ci.amount,0)-coalesce(co.amount,0)-bl.net-bl.tax+coalesce(cr.gross,0)) AS refundable_amount,
 coalesce((SELECT sum(p.gst_amount) FROM accounting.supplier_payment_allocations p WHERE p.company_id=bl.company_id AND p.bill_line_id=bl.id),0)+coalesce(adj.gst,0) AS cash_tax_balance,coalesce(ci.amount,0) AS credit_received_amount,coalesce(co.amount,0) AS credit_used_amount
 FROM purchase.bill_lines bl
 LEFT JOIN LATERAL(SELECT sum(quantity) AS quantity,sum(gross) AS gross,sum(recoverable_tax) AS recoverable_tax FROM purchase.supplier_credit_lines WHERE company_id=bl.company_id AND bill_line_id=bl.id)cr ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(gst_amount) AS gst FROM accounting.active_supplier_payment_allocations WHERE company_id=bl.company_id AND bill_line_id=bl.id)pa ON true
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.active_supplier_refunds r JOIN purchase.supplier_credit_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=bl.company_id AND cl.bill_line_id=bl.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.purchase_gst_adjustments WHERE company_id=bl.company_id AND bill_line_id=bl.id AND gst_basis='CASH')adj ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=bl.company_id AND target_bill_line_id=bl.id)ci ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=bl.company_id AND source_bill_line_id=bl.id)co ON true;
CREATE OR REPLACE VIEW purchase.supplier_credit_line_balances WITH(security_invoker=true) AS
 SELECT cl.*,coalesce(r.amount,0) AS refunded_amount,coalesce(a.amount,0) AS applied_amount,cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0) AS unallocated_amount,
 greatest(0,least(cl.gross-coalesce(r.amount,0)-coalesce(a.amount,0),bl.refundable_amount)) AS refundable_amount
 FROM purchase.supplier_credit_lines cl JOIN purchase.bill_line_balances bl ON bl.company_id=cl.company_id AND bl.id=cl.bill_line_id
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM accounting.active_supplier_refunds WHERE company_id=cl.company_id AND credit_line_id=cl.id)r ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM purchase.active_credit_application_lines WHERE company_id=cl.company_id AND credit_line_id=cl.id)a ON true;
CREATE OR REPLACE FUNCTION purchase.apply_supplier_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();sid uuid;aid uuid:=gen_random_uuid();ad accounting.supplier_advances;payment accounting.supplier_payments;company core.companies;today date;total numeric;used numeric;j uuid;jl jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.advances.apply');SELECT * INTO company FROM core.companies WHERE id=c FOR SHARE;today:=(now() AT TIME ZONE company.timezone)::date;
 SELECT supplier_id INTO sid FROM accounting.active_supplier_advances WHERE company_id=c AND id=p_advance;
 IF NOT FOUND THEN RAISE EXCEPTION 'Supplier prepayment unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM crm.suppliers WHERE company_id=c AND id=sid AND status='ACTIVE' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 SELECT * INTO ad FROM accounting.active_supplier_advances WHERE company_id=c AND id=p_advance FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Prepayment payment reversed' USING ERRCODE='HP409';END IF;
 SELECT * INTO payment FROM accounting.supplier_payments WHERE company_id=c AND id=ad.payment_id;
 total:=purchase.check_supplier_allocations(items,false);
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Application reference required' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(amount),0) INTO used FROM accounting.active_supplier_advance_applications WHERE company_id=c AND advance_id=ad.id;
 used:=used+coalesce((SELECT sum(amount) FROM accounting.active_supplier_refunds WHERE company_id=c AND advance_id=ad.id),0);
 IF used+total>ad.amount THEN RAISE EXCEPTION 'Application exceeds available supplier prepayment' USING ERRCODE='HP409';END IF;
 IF ad.gst_basis<>company.gst_basis OR ad.gst_registered<>company.gst_registered OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) x JOIN purchase.bill_lines bl ON bl.company_id=c AND bl.id=(x->>'billLineId')::uuid JOIN purchase.bills b ON b.company_id=c AND b.id=bl.bill_id WHERE b.gst_basis<>ad.gst_basis) THEN RAISE EXCEPTION 'Prepayment GST policy requires controlled transition' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application requires open accounting period' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=ad.account_id AND active AND kind='ASSET' AND control_kind IS NULL FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Original supplier prepayment account is inactive' USING ERRCODE='HP422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(aid,c,'SUPPLIER_ADVANCE_APPLICATION',purchase.supplier_settlement_number('SUPPLIER_ADVANCE_APPLICATION'),today,'CONFIRMED',a);
 jl:=purchase.allocate_supplier_payment(aid,payment.id,ad.id,ad.supplier_id,items,CASE WHEN EXISTS(SELECT 1 FROM accounting.supplier_advance_unapplications WHERE company_id=c AND advance_id=ad.id) THEN today ELSE payment.paid_on END,today);
 jl:=jl||jsonb_build_array(jsonb_build_object('accountId',ad.account_id,'partyId',ad.party_id,'credit',total));
 j:=accounting.post_journal(aid,1,'SUPPLIER_ADVANCE_APPLICATION',today,'Apply supplier prepayment to AP',jl);
 INSERT INTO accounting.supplier_advance_applications(id,company_id,advance_id,reference,amount,journal_entry_id,created_by) VALUES(aid,c,ad.id,btrim(p_reference),total,j,a);
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=aid;RETURN aid;
END $$;
CREATE OR REPLACE FUNCTION purchase.reverse_supplier_payment(payment uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();actor uuid:=core.current_actor();doc uuid:=gen_random_uuid();p accounting.supplier_payments;today date;j uuid;posts jsonb;x record;BEGIN
 PERFORM purchase.require_access('purchase.payments.reverse');SELECT * INTO p FROM accounting.supplier_payments WHERE company_id=c AND id=payment;IF NOT FOUND THEN RAISE EXCEPTION 'Supplier payment unavailable' USING ERRCODE='HT404';END IF;
 today:=purchase.payment_correction_context(p.supplier_id,'purchase.payments.reverse',p_reference,p_reason);
 IF NOT EXISTS(SELECT 1 FROM accounting.active_supplier_payments WHERE company_id=c AND id=payment) THEN RAISE EXCEPTION 'Payment already reversed' USING ERRCODE='HP409';END IF;
 IF p.paid_on>today THEN RAISE EXCEPTION 'Correction cannot precede payment' USING ERRCODE='HP422';END IF;
 IF EXISTS(SELECT 1 FROM accounting.active_supplier_advance_applications a JOIN accounting.supplier_advances ad ON ad.company_id=a.company_id AND ad.id=a.advance_id WHERE ad.company_id=c AND ad.payment_id=payment) THEN RAISE EXCEPTION 'Unapply supplier advances first' USING ERRCODE='HP409';END IF;
 IF EXISTS(SELECT 1 FROM accounting.active_supplier_refunds r JOIN accounting.supplier_advances ad ON ad.company_id=r.company_id AND ad.id=r.advance_id WHERE ad.company_id=c AND ad.payment_id=payment) THEN RAISE EXCEPTION 'Supplier prepayment already refunded' USING ERRCODE='HP409';END IF;
 FOR x IN SELECT DISTINCT ap.id FROM accounting.supplier_payment_allocations pa JOIN purchase.bill_lines bl ON bl.company_id=pa.company_id AND bl.id=pa.bill_line_id JOIN accounting.ap_items ap ON ap.company_id=bl.company_id AND ap.bill_id=bl.bill_id WHERE pa.company_id=c AND pa.source_document_id=payment ORDER BY ap.id LOOP PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND id=x.id FOR UPDATE;END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'SUPPLIER_PAYMENT_REVERSAL',purchase.payment_reversal_number('SUPPLIER_PAYMENT_REVERSAL'),today,'CONFIRMED',actor);
 posts:=jsonb_build_array(jsonb_build_object('accountId',p.bank_account_id,'debit',p.amount));
 FOR x IN SELECT pa.bill_line_id,pa.amount,ap.account_id,b.party_id FROM accounting.supplier_payment_allocations pa JOIN purchase.bill_lines bl ON bl.company_id=pa.company_id AND bl.id=pa.bill_line_id JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id JOIN accounting.ap_items ap ON ap.company_id=b.company_id AND ap.bill_id=b.id WHERE pa.company_id=c AND pa.source_document_id=payment ORDER BY pa.bill_line_id LOOP
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',x.account_id,'partyId',x.party_id,'credit',x.amount))||purchase.payment_movement_gst(doc,x.bill_line_id,-x.amount,today,'SUPPLIER_PAYMENT_REVERSAL',-x.amount);END LOOP;
 FOR x IN SELECT * FROM accounting.supplier_advances WHERE company_id=c AND payment_id=payment ORDER BY id LOOP posts:=posts||jsonb_build_array(jsonb_build_object('accountId',x.account_id,'partyId',x.party_id,'credit',x.amount));END LOOP;
 j:=accounting.post_journal(doc,1,'SUPPLIER_PAYMENT_REVERSAL',today,'Reverse erroneous supplier payment',posts);
 INSERT INTO accounting.supplier_payment_reversals(id,company_id,payment_id,supplier_id,party_id,amount,reference,reason,journal_entry_id,created_by) VALUES(doc,c,p.id,p.supplier_id,p.party_id,p.amount,btrim(p_reference),btrim(p_reason),j,actor);
 PERFORM accounting.contra_link((SELECT posting_batch_id FROM accounting.journal_entries WHERE company_id=c AND id=p.journal_entry_id),j,'SUPPLIER_PAYMENT_REVERSAL');UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;END $$;
CREATE OR REPLACE FUNCTION purchase.validate_supplier_reversal() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;sid uuid;source_doc uuid;original_j uuid;j uuid;event_type text;v accounting.supplier_payment_reversals;u accounting.supplier_advance_unapplications;p accounting.supplier_payments;a accounting.supplier_advance_applications;ad accounting.supplier_advances;BEGIN
 IF TG_TABLE_NAME='purchase_gst_adjustments' THEN IF NEW.settlement_reversal_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.settlement_reversal_id;
 ELSIF TG_TABLE_NAME='supplier_payment_reapplications' THEN
 SELECT * INTO v FROM accounting.supplier_payment_reversals WHERE company_id=c AND id=NEW.reversal_id;SELECT * INTO p FROM accounting.supplier_payments WHERE company_id=c AND id=NEW.id;
 IF v.payment_id<>NEW.original_payment_id OR v.supplier_id<>NEW.supplier_id OR p.supplier_id<>NEW.supplier_id OR p.party_id<>v.party_id OR p.amount<>v.amount OR p.bank_account_id<>(SELECT bank_account_id FROM accounting.supplier_payments WHERE company_id=c AND id=v.payment_id) OR p.method<>(SELECT method FROM accounting.supplier_payments WHERE company_id=c AND id=v.payment_id) THEN RAISE EXCEPTION 'Replacement payment differs from original funds' USING ERRCODE='23514';END IF;RETURN NULL;
 ELSE doc:=NEW.id;END IF;
 SELECT * INTO v FROM accounting.supplier_payment_reversals WHERE company_id=c AND id=doc;
 IF FOUND THEN
 SELECT * INTO p FROM accounting.supplier_payments WHERE company_id=c AND id=v.payment_id;sid:=v.supplier_id;j:=v.journal_entry_id;source_doc:=p.id;original_j:=p.journal_entry_id;event_type:='SUPPLIER_PAYMENT_REVERSAL';
 IF p.amount<>v.amount OR p.supplier_id<>sid OR p.party_id<>v.party_id OR EXISTS(SELECT 1 FROM accounting.active_supplier_advance_applications ap JOIN accounting.supplier_advances av ON av.company_id=ap.company_id AND av.id=ap.advance_id WHERE av.company_id=c AND av.payment_id=p.id) OR EXISTS(SELECT 1 FROM accounting.active_supplier_refunds f JOIN accounting.supplier_advances av ON av.company_id=f.company_id AND av.id=f.advance_id WHERE av.company_id=c AND av.payment_id=p.id) THEN RAISE EXCEPTION 'Payment reversal source mismatch' USING ERRCODE='23514';END IF;
 ELSE
 SELECT * INTO u FROM accounting.supplier_advance_unapplications WHERE company_id=c AND id=doc;IF NOT FOUND THEN RAISE EXCEPTION 'Supplier reversal event missing' USING ERRCODE='23514';END IF;
 SELECT * INTO a FROM accounting.supplier_advance_applications WHERE company_id=c AND id=u.application_id;SELECT * INTO ad FROM accounting.supplier_advances WHERE company_id=c AND id=u.advance_id;sid:=u.supplier_id;j:=u.journal_entry_id;source_doc:=a.id;original_j:=a.journal_entry_id;event_type:='SUPPLIER_ADVANCE_UNAPPLICATION';
 IF a.advance_id<>ad.id OR a.amount<>u.amount OR ad.payment_id<>u.payment_id OR ad.supplier_id<>sid OR ad.party_id<>u.party_id THEN RAISE EXCEPTION 'Supplier advance unapplication source mismatch' USING ERRCODE='23514';END IF;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries e ON e.company_id=d.company_id AND e.id=j JOIN accounting.posting_batches b ON b.company_id=e.company_id AND b.id=e.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.state='POSTED' AND d.document_type=event_type AND e.posting_date=d.business_date AND b.source_document_id=doc AND b.posting_kind=event_type) THEN RAISE EXCEPTION 'Supplier reversal registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH expected AS(SELECT account_id,party_id,sum(dr) AS dr,sum(cr) AS cr FROM(
 SELECT l.account_id,l.party_id,l.credit AS dr,l.debit AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=original_j AND ac.control_kind IS DISTINCT FROM 'GST'
 UNION ALL SELECT ge.input_account_id,NULL::uuid,greatest(g.gst_amount,0),greatest(-g.gst_amount,0) FROM accounting.purchase_gst_adjustments g JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.settlement_reversal_id=doc
 UNION ALL SELECT ge.debit_account_id,NULL::uuid,greatest(-g.gst_amount,0),greatest(g.gst_amount,0) FROM accounting.purchase_gst_adjustments g JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.settlement_reversal_id=doc)q GROUP BY account_id,party_id),
 actual AS(SELECT account_id,party_id,sum(debit) AS dr,sum(credit) AS cr FROM accounting.journal_lines WHERE company_id=c AND journal_entry_id=j GROUP BY account_id,party_id)
 SELECT 1 FROM expected e FULL JOIN actual act ON act.account_id=e.account_id AND act.party_id IS NOT DISTINCT FROM e.party_id WHERE coalesce(e.dr,0)<>coalesce(act.dr,0) OR coalesce(e.cr,0)<>coalesce(act.cr,0)) THEN RAISE EXCEPTION 'Supplier reversal exact AP/bank/advance/GST journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id WHERE bl.company_id=c AND b.supplier_id=sid AND (bl.net_paid_amount<0 OR bl.cash_tax_balance<0 OR bl.cash_tax_balance>bl.recoverable_tax)) OR EXISTS(SELECT 1 FROM accounting.supplier_advance_balances WHERE company_id=c AND supplier_id=sid AND available<0) THEN RAISE EXCEPTION 'Supplier reversal creates unfunded balances' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.purchase_gst_adjustments g JOIN platform.documents d ON d.company_id=g.company_id AND d.id=g.source_document_id JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.settlement_reversal_id=doc AND(g.source_document_id<>doc OR g.kind<>event_type OR g.gst_basis<>'CASH' OR ge.gst_basis<>'CASH' OR g.adjustment_date<>greatest(d.business_date,(SELECT b.tax_invoice_held_on FROM purchase.bill_lines bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id WHERE bl.company_id=c AND bl.id=g.bill_line_id)) OR NOT EXISTS(SELECT 1 FROM accounting.supplier_payment_allocations pa WHERE pa.company_id=c AND pa.source_document_id=source_doc AND pa.bill_line_id=g.bill_line_id))) THEN RAISE EXCEPTION 'Supplier reversal GST origin mismatch' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE OR REPLACE FUNCTION purchase.validate_procurement_contra() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;ret purchase.returns;cn purchase.supplier_credit_notes;rf accounting.supplier_refunds;v numeric;n numeric;t numeric;original_line uuid;BEGIN
 IF TG_TABLE_NAME='purchase_gst_adjustments' THEN IF NEW.credit_application_id IS NOT NULL OR NEW.settlement_reversal_id IS NOT NULL OR NEW.refund_reversal_id IS NOT NULL THEN RETURN NULL;END IF;END IF;
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
 IF EXISTS(SELECT 1 FROM purchase.bill_line_balances WHERE company_id=c AND id=original_line AND(net_paid_amount<0 OR cash_tax_balance<0)) OR (SELECT coalesce(sum(amount),0) FROM accounting.active_supplier_refunds WHERE company_id=c AND credit_line_id=rf.credit_line_id)>(SELECT gross FROM purchase.supplier_credit_lines WHERE company_id=c AND id=rf.credit_line_id) THEN RAISE EXCEPTION 'Refund exceeds source paid credit' USING ERRCODE='23514';END IF;END IF;
 END IF;
 IF coalesce(ret.journal_entry_id,cn.journal_entry_id,rf.journal_entry_id) IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=c AND je.id=coalesce(ret.journal_entry_id,cn.journal_entry_id,rf.journal_entry_id) AND pb.source_document_id=doc) THEN RAISE EXCEPTION 'Procurement contra journal mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
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
 IF bal.net_paid_amount-p_amount>bal.remaining_gross AND (EXISTS(SELECT 1 FROM accounting.supplier_refund_reversals rv JOIN accounting.supplier_refunds rf ON rf.company_id=rv.company_id AND rf.id=rv.refund_id JOIN purchase.supplier_credit_lines cl ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id WHERE rv.company_id=c AND cl.bill_line_id=credit.bill_line_id) OR EXISTS(SELECT 1 FROM accounting.supplier_payment_allocations pa WHERE pa.company_id=c AND pa.bill_line_id=credit.bill_line_id AND(EXISTS(SELECT 1 FROM accounting.supplier_payment_reversals rv WHERE rv.company_id=pa.company_id AND rv.payment_id=pa.payment_id) OR EXISTS(SELECT 1 FROM accounting.supplier_advance_unapplications un WHERE un.company_id=pa.company_id AND un.application_id=pa.source_document_id)))) THEN desired:=least(ge.recoverable_tax,bal.remaining_tax+round((ge.recoverable_tax-bal.remaining_tax)*(bal.net_paid_amount-p_amount-bal.remaining_gross)/(bal.gross-bal.remaining_gross),2));END IF;
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
CREATE OR REPLACE FUNCTION purchase.receive_supplier_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_date date) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN purchase.receive_supplier_refund_core(p_credit_line,p_advance,p_amount,p_reference,p_reason,p_date,NULL);END $$;
CREATE OR REPLACE FUNCTION purchase.refund_movement_gst(doc uuid,bill_line uuid,movement numeric,on_date date,p_kind text,net_change numeric DEFAULT 0) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();b record;g accounting.purchase_gst_entries;desired numeric;delta numeric;BEGIN
 SELECT * INTO b FROM purchase.bill_line_balances WHERE company_id=c AND id=bill_line;
 SELECT * INTO g FROM accounting.purchase_gst_entries WHERE company_id=c AND bill_line_id=bill_line;
 b.net_paid_amount:=b.net_paid_amount+net_change;IF b.net_paid_amount<0 THEN RAISE EXCEPTION 'Target settlement has been refunded or reused; insufficient funds to unapply' USING ERRCODE='HP409';END IF;
 IF g.gst_basis<>'CASH' THEN RETURN '[]'::jsonb;END IF;
 IF b.net_paid_amount<=b.remaining_gross THEN desired:=CASE WHEN b.remaining_gross=0 THEN 0 ELSE round(b.remaining_tax*b.net_paid_amount/b.remaining_gross,2) END;
 ELSE desired:=least(g.recoverable_tax,b.remaining_tax+round((g.recoverable_tax-b.remaining_tax)*(b.net_paid_amount-b.remaining_gross)/(b.gross-b.remaining_gross),2));END IF;
 delta:=desired-b.cash_tax_balance;IF delta=0 THEN RETURN '[]'::jsonb;END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=g.input_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original input GST account inactive' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.accounts WHERE company_id=c AND id=g.debit_account_id AND active AND kind='ASSET' AND control_kind='GST' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Original deferred GST account inactive' USING ERRCODE='HP422';END IF;
 INSERT INTO accounting.purchase_gst_adjustments(company_id,source_document_id,bill_line_id,refund_reversal_id,kind,gst_basis,adjustment_date,amount,gst_amount) VALUES(c,doc,bill_line,doc,p_kind,'CASH',greatest(on_date,(SELECT tax_invoice_held_on FROM purchase.bills WHERE company_id=c AND id=b.bill_id)),movement,delta);
 RETURN jsonb_build_array(jsonb_build_object('accountId',g.input_account_id,'debit',greatest(delta,0),'credit',greatest(-delta,0)),jsonb_build_object('accountId',g.debit_account_id,'debit',greatest(-delta,0),'credit',greatest(delta,0)));
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

  UNION ALL SELECT 'supplier_refund_reversal.amount',v.id,r.amount,v.amount,'AUD' FROM accounting.supplier_refund_reversals v JOIN accounting.supplier_refunds r ON r.company_id=v.company_id AND r.id=v.refund_id WHERE v.company_id=core.current_company()
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
INSERT INTO identity.permissions(code,description) VALUES('purchase.refunds.reverse','Reverse erroneous supplier refund'),('purchase.refunds.correct','Correct supplier refund through linked replacement');
CREATE FUNCTION identity.seed_supplier_refund_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('purchase.refunds.reverse','purchase.refunds.correct') ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SUPPLIER_REFUND_REVERSAL','SFR-') ON CONFLICT DO NOTHING;END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_supplier_refund_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.refund_reversal_number() RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type='SUPPLIER_REFUND_REVERSAL' RETURNING next_value-1,prefix INTO n,p;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal sequence missing' USING ERRCODE='HP422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION purchase.refund_correction_context(sid uuid,cap text,p_reference text,p_reason text) RETURNS date LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE today date;BEGIN
 PERFORM purchase.require_access(cap);PERFORM purchase.require_access('purchase.refunds.read');PERFORM purchase.require_access('purchase.bills.read');
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Refund correction reference and reason required' USING ERRCODE='HP422';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=core.current_company() FOR SHARE;
 PERFORM 1 FROM crm.suppliers WHERE company_id=core.current_company() AND id=sid FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Supplier unavailable' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=core.current_company() AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Refund correction requires open current period' USING ERRCODE='HP422';END IF;RETURN today;END $$;
CREATE FUNCTION purchase.reverse_supplier_refund(refund uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();actor uuid:=core.current_actor();doc uuid:=gen_random_uuid();r accounting.supplier_refunds;today date;j uuid;posts jsonb;lid uuid;BEGIN
 PERFORM purchase.require_access('purchase.refunds.reverse');SELECT * INTO r FROM accounting.supplier_refunds WHERE company_id=c AND id=refund;IF NOT FOUND THEN RAISE EXCEPTION 'Supplier refund unavailable' USING ERRCODE='HT404';END IF;
 today:=purchase.refund_correction_context(r.supplier_id,'purchase.refunds.reverse',p_reference,p_reason);
 IF NOT EXISTS(SELECT 1 FROM accounting.active_supplier_refunds WHERE company_id=c AND id=refund) THEN RAISE EXCEPTION 'Refund already reversed' USING ERRCODE='HP409';END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=refund AND state='POSTED' AND business_date<=today) THEN RAISE EXCEPTION 'Correction cannot precede posted refund' USING ERRCODE='HP422';END IF;
 IF r.advance_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.active_supplier_advances WHERE company_id=c AND id=r.advance_id) THEN RAISE EXCEPTION 'Refund source payment reversed' USING ERRCODE='HP409';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'SUPPLIER_REFUND_REVERSAL',purchase.refund_reversal_number(),today,'CONFIRMED',actor);
 SELECT jsonb_agg(jsonb_build_object('accountId',l.account_id,'partyId',l.party_id,'debit',l.credit,'credit',l.debit)) INTO posts FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=r.journal_entry_id AND a.control_kind IS DISTINCT FROM 'GST';
 IF r.credit_line_id IS NOT NULL THEN
 SELECT cl.bill_line_id INTO lid FROM purchase.supplier_credit_lines cl WHERE cl.company_id=c AND cl.id=r.credit_line_id;
 PERFORM 1 FROM accounting.ap_items WHERE company_id=c AND bill_id=(SELECT bill_id FROM purchase.bill_lines WHERE company_id=c AND id=lid) FOR UPDATE;
 posts:=posts||purchase.refund_movement_gst(doc,lid,r.amount,today,'SUPPLIER_REFUND_REVERSAL',r.amount);
 END IF;
 j:=accounting.post_journal(doc,1,'SUPPLIER_REFUND_REVERSAL',today,'Reverse erroneous incoming supplier refund',posts);
 INSERT INTO accounting.supplier_refund_reversals(id,company_id,refund_id,supplier_id,amount,reference,reason,journal_entry_id,created_by) VALUES(doc,c,refund,r.supplier_id,r.amount,btrim(p_reference),btrim(p_reason),j,actor);
 PERFORM accounting.contra_link((SELECT posting_batch_id FROM accounting.journal_entries WHERE company_id=c AND id=r.journal_entry_id),j,'SUPPLIER_REFUND_REVERSAL');UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;END $$;
CREATE FUNCTION purchase.replace_supplier_refund(reversal uuid,credit_line uuid,advance uuid,amount numeric,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();v accounting.supplier_refund_reversals;r accounting.supplier_refunds;target_supplier uuid;today date;doc uuid;BEGIN
 PERFORM purchase.require_access('purchase.refunds.correct');PERFORM purchase.require_access('purchase.refunds.post');SELECT * INTO v FROM accounting.supplier_refund_reversals WHERE company_id=c AND id=reversal;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal unavailable' USING ERRCODE='HT404';END IF;
 today:=purchase.refund_correction_context(v.supplier_id,'purchase.refunds.correct',p_reference,p_reason);
 IF EXISTS(SELECT 1 FROM accounting.supplier_refund_corrections WHERE company_id=c AND reversal_id=reversal) THEN RAISE EXCEPTION 'Refund reversal already corrected' USING ERRCODE='HP409';END IF;
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=reversal AND business_date>today) THEN RAISE EXCEPTION 'Correction cannot precede reversal' USING ERRCODE='HP422';END IF;
 IF num_nonnulls(credit_line,advance)<>1 THEN RAISE EXCEPTION 'Select one refund source' USING ERRCODE='HP422';END IF;
 IF credit_line IS NOT NULL THEN SELECT n.supplier_id INTO target_supplier FROM purchase.supplier_credit_lines cl JOIN purchase.supplier_credit_notes n ON n.company_id=cl.company_id AND n.id=cl.credit_note_id WHERE cl.company_id=c AND cl.id=credit_line;
 ELSE SELECT supplier_id INTO target_supplier FROM accounting.supplier_advances WHERE company_id=c AND id=advance;END IF;
 IF target_supplier IS DISTINCT FROM v.supplier_id THEN RAISE EXCEPTION 'Refund source unavailable for original supplier' USING ERRCODE='HT404';END IF;
 SELECT * INTO r FROM accounting.supplier_refunds WHERE company_id=c AND id=v.refund_id;
 doc:=purchase.receive_supplier_refund_core(credit_line,advance,amount,p_reference,p_reason,today,r.bank_account_id);
 INSERT INTO accounting.supplier_refund_corrections(id,company_id,reversal_id,original_refund_id,supplier_id,reason,created_by) VALUES(doc,c,reversal,v.refund_id,v.supplier_id,btrim(p_reason),core.current_actor());RETURN doc;END $$;
CREATE FUNCTION purchase.correct_supplier_refund(refund uuid,reversal_reference text,credit_line uuid,advance uuid,amount numeric,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE rev uuid;BEGIN
 PERFORM purchase.require_access('purchase.refunds.reverse');PERFORM purchase.require_access('purchase.refunds.correct');PERFORM purchase.require_access('purchase.refunds.post');rev:=purchase.reverse_supplier_refund(refund,reversal_reference,p_reason);RETURN purchase.replace_supplier_refund(rev,credit_line,advance,amount,p_reference,p_reason);END $$;
CREATE FUNCTION purchase.validate_supplier_refund_reversal() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;sid uuid;source_doc uuid;original_j uuid;j uuid;event_type text:='SUPPLIER_REFUND_REVERSAL';v accounting.supplier_refund_reversals;r accounting.supplier_refunds;replacement accounting.supplier_refunds;BEGIN
 IF TG_TABLE_NAME='purchase_gst_adjustments' THEN IF NEW.refund_reversal_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.refund_reversal_id;
 ELSIF TG_TABLE_NAME='supplier_refund_corrections' THEN
 SELECT * INTO v FROM accounting.supplier_refund_reversals WHERE company_id=c AND id=NEW.reversal_id;SELECT * INTO replacement FROM accounting.supplier_refunds WHERE company_id=c AND id=NEW.id;SELECT * INTO r FROM accounting.supplier_refunds WHERE company_id=c AND id=v.refund_id;
 IF v.refund_id<>NEW.original_refund_id OR v.supplier_id<>NEW.supplier_id OR replacement.supplier_id<>v.supplier_id OR replacement.bank_account_id<>r.bank_account_id THEN RAISE EXCEPTION 'Refund replacement source/bank mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
 ELSE doc:=NEW.id;END IF;
 SELECT * INTO v FROM accounting.supplier_refund_reversals WHERE company_id=c AND id=doc;IF NOT FOUND THEN RAISE EXCEPTION 'Refund reversal event missing' USING ERRCODE='23514';END IF;
 SELECT * INTO r FROM accounting.supplier_refunds WHERE company_id=c AND id=v.refund_id;sid:=v.supplier_id;source_doc:=r.id;original_j:=r.journal_entry_id;j:=v.journal_entry_id;
 IF v.amount<>r.amount OR v.supplier_id<>r.supplier_id THEN RAISE EXCEPTION 'Refund reversal source mismatch' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries e ON e.company_id=d.company_id AND e.id=j JOIN accounting.posting_batches b ON b.company_id=e.company_id AND b.id=e.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.state='POSTED' AND d.document_type=event_type AND e.posting_date=d.business_date AND b.source_document_id=doc AND b.posting_kind=event_type) THEN RAISE EXCEPTION 'Supplier reversal registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(WITH expected AS(SELECT account_id,party_id,sum(dr) AS dr,sum(cr) AS cr FROM(
 SELECT l.account_id,l.party_id,l.credit AS dr,l.debit AS cr FROM accounting.journal_lines l JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=original_j AND ac.control_kind IS DISTINCT FROM 'GST'
 UNION ALL SELECT ge.input_account_id,NULL::uuid,greatest(g.gst_amount,0),greatest(-g.gst_amount,0) FROM accounting.purchase_gst_adjustments g JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.refund_reversal_id=doc
 UNION ALL SELECT ge.debit_account_id,NULL::uuid,greatest(-g.gst_amount,0),greatest(g.gst_amount,0) FROM accounting.purchase_gst_adjustments g JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.refund_reversal_id=doc)q GROUP BY account_id,party_id),
 actual AS(SELECT account_id,party_id,sum(debit) AS dr,sum(credit) AS cr FROM accounting.journal_lines WHERE company_id=c AND journal_entry_id=j GROUP BY account_id,party_id)
 SELECT 1 FROM expected e FULL JOIN actual act ON act.account_id=e.account_id AND act.party_id IS NOT DISTINCT FROM e.party_id WHERE coalesce(e.dr,0)<>coalesce(act.dr,0) OR coalesce(e.cr,0)<>coalesce(act.cr,0)) THEN RAISE EXCEPTION 'Supplier reversal exact AP/bank/advance/GST journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.bill_line_balances bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id WHERE bl.company_id=c AND b.supplier_id=sid AND (bl.net_paid_amount<0 OR bl.cash_tax_balance<0 OR bl.cash_tax_balance>bl.recoverable_tax)) OR EXISTS(SELECT 1 FROM accounting.supplier_advance_balances WHERE company_id=c AND supplier_id=sid AND available<0) THEN RAISE EXCEPTION 'Supplier reversal creates unfunded balances' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.purchase_gst_adjustments g JOIN platform.documents d ON d.company_id=g.company_id AND d.id=g.source_document_id JOIN accounting.purchase_gst_entries ge ON ge.company_id=g.company_id AND ge.bill_line_id=g.bill_line_id WHERE g.company_id=c AND g.refund_reversal_id=doc AND(g.source_document_id<>doc OR g.kind<>event_type OR g.gst_basis<>'CASH' OR ge.gst_basis<>'CASH' OR g.adjustment_date<>greatest(d.business_date,(SELECT b.tax_invoice_held_on FROM purchase.bill_lines bl JOIN purchase.bills b ON b.company_id=bl.company_id AND b.id=bl.bill_id WHERE bl.company_id=c AND bl.id=g.bill_line_id)) OR NOT EXISTS(SELECT 1 FROM purchase.supplier_credit_lines cl WHERE cl.company_id=c AND cl.id=r.credit_line_id AND cl.bill_line_id=g.bill_line_id))) THEN RAISE EXCEPTION 'Supplier reversal GST origin mismatch' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER supplier_refund_reversal_consistency AFTER INSERT ON accounting.supplier_refund_reversals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_supplier_refund_reversal();
CREATE CONSTRAINT TRIGGER supplier_refund_correction_consistency AFTER INSERT ON accounting.supplier_refund_corrections DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_supplier_refund_reversal();
CREATE CONSTRAINT TRIGGER supplier_refund_reversal_gst_consistency AFTER INSERT ON accounting.purchase_gst_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_supplier_refund_reversal();
CREATE OR REPLACE FUNCTION purchase.guard_refund_reversal_document() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN IF OLD.state='POSTED' AND OLD.document_type='SUPPLIER_REFUND_REVERSAL' THEN RAISE EXCEPTION 'Posted refund reversals are immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER supplier_refund_reversal_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_refund_reversal_document();
ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND','SUPPLIER_CREDIT_UNAPPLICATION','CUSTOMER_CREDIT_UNAPPLICATION','RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION','SUPPLIER_PAYMENT_REVERSAL','SUPPLIER_ADVANCE_UNAPPLICATION','CUSTOMER_REFUND_REVERSAL','SUPPLIER_REFUND_REVERSAL'));
REVOKE ALL ON FUNCTION identity.seed_supplier_refund_roles(uuid),purchase.refund_reversal_number(),purchase.refund_correction_context(uuid,text,text,text),purchase.refund_movement_gst(uuid,uuid,numeric,date,text,numeric),purchase.receive_supplier_refund_core(uuid,uuid,numeric,text,text,date,uuid),purchase.reverse_supplier_refund(uuid,text,text),purchase.replace_supplier_refund(uuid,uuid,uuid,numeric,text,text),purchase.correct_supplier_refund(uuid,text,uuid,uuid,numeric,text,text),purchase.validate_supplier_refund_reversal(),purchase.guard_refund_reversal_document() FROM PUBLIC;
GRANT SELECT ON accounting.supplier_refund_reversals,accounting.supplier_refund_corrections,accounting.active_supplier_refunds TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.reverse_supplier_refund(uuid,text,text),purchase.replace_supplier_refund(uuid,uuid,uuid,numeric,text,text),purchase.correct_supplier_refund(uuid,text,uuid,uuid,numeric,text,text) TO htt_app;
