-- Append-only correction events; original cash and allocation facts are retained.
CREATE TABLE accounting.receipt_reversals(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),receipt_id uuid NOT NULL,customer_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),journal_entry_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,receipt_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,receipt_id,customer_id) REFERENCES accounting.customer_receipts(company_id,id,customer_id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) DEFERRABLE INITIALLY DEFERRED);
CREATE UNIQUE INDEX receipt_reversal_reference ON accounting.receipt_reversals(company_id,lower(btrim(reference)));
CREATE TABLE accounting.advance_unapplications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),application_id uuid NOT NULL,advance_id uuid NOT NULL,receipt_id uuid NOT NULL,customer_id uuid NOT NULL,reference text NOT NULL CHECK(length(btrim(reference)) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),amount numeric(20,2) NOT NULL CHECK(amount>0),consumed_gst numeric(20,2) NOT NULL CHECK(consumed_gst>=0),journal_entry_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,application_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,application_id) REFERENCES accounting.advance_applications(company_id,id),FOREIGN KEY(company_id,advance_id,receipt_id) REFERENCES accounting.customer_advances(company_id,id,receipt_id),FOREIGN KEY(company_id,receipt_id,customer_id) REFERENCES accounting.customer_receipts(company_id,id,customer_id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id) DEFERRABLE INITIALLY DEFERRED);
CREATE UNIQUE INDEX advance_unapplication_reference ON accounting.advance_unapplications(company_id,lower(btrim(reference)));
CREATE INDEX ON accounting.advance_unapplications(company_id,advance_id);
CREATE TABLE accounting.receipt_reapplications(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),reversal_id uuid NOT NULL,original_receipt_id uuid NOT NULL,customer_id uuid NOT NULL,reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 1 AND 2000),created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),UNIQUE(company_id,id),UNIQUE(company_id,reversal_id),FOREIGN KEY(company_id,id,customer_id) REFERENCES accounting.customer_receipts(company_id,id,customer_id),FOREIGN KEY(company_id,reversal_id) REFERENCES accounting.receipt_reversals(company_id,id),FOREIGN KEY(company_id,original_receipt_id,customer_id) REFERENCES accounting.customer_receipts(company_id,id,customer_id));
DO $$ DECLARE tb text;BEGIN FOREACH tb IN ARRAY ARRAY['receipt_reversals','advance_unapplications','receipt_reapplications'] LOOP
 EXECUTE format('ALTER TABLE accounting.%I ENABLE ROW LEVEL SECURITY',tb);EXECUTE format('ALTER TABLE accounting.%I FORCE ROW LEVEL SECURITY',tb);EXECUTE format('CREATE POLICY company_scope ON accounting.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',tb);EXECUTE format('CREATE INDEX ON accounting.%I(company_id)',tb);EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON accounting.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',tb);
END LOOP;END $$;
CREATE VIEW accounting.active_customer_receipts WITH(security_invoker=true) AS SELECT r.* FROM accounting.customer_receipts r WHERE NOT EXISTS(SELECT 1 FROM accounting.receipt_reversals x WHERE x.company_id=r.company_id AND x.receipt_id=r.id);
CREATE VIEW accounting.active_customer_advances WITH(security_invoker=true) AS SELECT a.* FROM accounting.customer_advances a JOIN accounting.active_customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id;
CREATE VIEW accounting.active_advance_applications WITH(security_invoker=true) AS SELECT a.* FROM accounting.advance_applications a JOIN accounting.active_customer_receipts r ON r.company_id=a.company_id AND r.id=(SELECT ad.receipt_id FROM accounting.customer_advances ad WHERE ad.company_id=a.company_id AND ad.id=a.advance_id) WHERE NOT EXISTS(SELECT 1 FROM accounting.advance_unapplications x WHERE x.company_id=a.company_id AND x.application_id=a.id);
CREATE VIEW accounting.active_payment_allocations WITH(security_invoker=true) AS SELECT p.* FROM accounting.payment_allocations p JOIN accounting.active_customer_receipts r ON r.company_id=p.company_id AND r.id=p.receipt_id WHERE p.advance_id IS NULL OR EXISTS(SELECT 1 FROM accounting.active_advance_applications a WHERE a.company_id=p.company_id AND a.id=p.source_document_id);
CREATE VIEW accounting.customer_advance_balances WITH(security_invoker=true) AS SELECT a.*,r.customer_id,r.received_on,
 CASE WHEN x.id IS NULL THEN a.amount-accounting.advance_refunded(a.id)-coalesce(ap.amount,0) ELSE 0 END AS available,
 coalesce(ap.amount,0) AS applied_amount,coalesce(ap.gst,0) AS consumed_gst,accounting.advance_refunded(a.id) AS refunded_amount,x.id AS reversal_id
 FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id LEFT JOIN accounting.receipt_reversals x ON x.company_id=r.company_id AND x.receipt_id=r.id LEFT JOIN LATERAL(SELECT sum(amount) AS amount,sum(consumed_gst) AS gst FROM accounting.active_advance_applications WHERE company_id=a.company_id AND advance_id=a.id)ap ON true;
INSERT INTO identity.permissions(code,description) VALUES('accounting.receipts.reverse','Reverse an erroneous receipt with an immutable contra'),('accounting.receipts.reapply','Reapply a reversed receipt as a linked correction'),('accounting.advances.unapply','Unapply an advance application through an immutable contra');
CREATE FUNCTION identity.seed_settlement_reversal_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND r.code IN('ADMIN','FINANCE') AND p.code IN('accounting.receipts.reverse','accounting.receipts.reapply','accounting.advances.unapply') ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'RECEIPT_REVERSAL','RCR-'),(c,'ADVANCE_UNAPPLICATION','AAU-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_settlement_reversal_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.settlement_reversal_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE n bigint;p text;BEGIN
 IF t NOT IN('RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION') THEN RAISE EXCEPTION 'Invalid reversal sequence' USING ERRCODE='HR422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;IF NOT FOUND THEN RAISE EXCEPTION 'Settlement reversal sequence missing' USING ERRCODE='HR422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
ALTER TABLE accounting.gst_adjustments ADD COLUMN settlement_reversal_id uuid,ADD FOREIGN KEY(company_id,settlement_reversal_id) REFERENCES platform.documents(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE accounting.gst_adjustments DROP CONSTRAINT gst_adjustments_kind_check;
ALTER TABLE accounting.gst_adjustments ADD CONSTRAINT gst_adjustments_kind_check CHECK(kind IN('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','ADVANCE_REFUND','UNBILLED_RETURN','CREDIT_APPLICATION','CREDIT_UNAPPLICATION','RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION')),
 ADD CONSTRAINT settlement_gst_source CHECK((kind NOT IN('RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION') AND settlement_reversal_id IS NULL) OR(kind IN('RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION') AND settlement_reversal_id=source_document_id AND customer_credit_application_id IS NULL AND credit_line_id IS NULL AND return_line_id IS NULL AND ((invoice_line_id IS NOT NULL AND advance_id IS NULL AND gst_basis='CASH') OR(invoice_line_id IS NULL AND advance_id IS NOT NULL))));
CREATE FUNCTION accounting.settlement_changed_line(lid uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT EXISTS(SELECT 1 FROM accounting.payment_allocations p WHERE p.company_id=core.current_company() AND p.invoice_line_id=lid AND (EXISTS(SELECT 1 FROM accounting.receipt_reversals r WHERE r.company_id=p.company_id AND r.receipt_id=p.receipt_id) OR EXISTS(SELECT 1 FROM accounting.advance_unapplications u WHERE u.company_id=p.company_id AND u.application_id=p.source_document_id))) $$;
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
 LEFT JOIN LATERAL(SELECT sum(r.amount) AS amount FROM accounting.customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=l.company_id AND cl.invoice_line_id=l.id)rf ON true
 LEFT JOIN LATERAL(SELECT sum(gst_amount) AS gst FROM accounting.gst_adjustments WHERE company_id=l.company_id AND invoice_line_id=l.id AND gst_basis='CASH')ga ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND target_invoice_line_id=l.id)ci ON true
 LEFT JOIN LATERAL(SELECT sum(amount) AS amount FROM sales.active_credit_application_lines WHERE company_id=l.company_id AND source_invoice_line_id=l.id)co ON true;

CREATE OR REPLACE FUNCTION accounting.validate_settlement() RETURNS trigger LANGUAGE plpgsql AS $$
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
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id AND ad.amount-accounting.advance_refunded(ad.id)<coalesce((SELECT sum(amount) FROM accounting.active_advance_applications WHERE company_id=ad.company_id AND advance_id=ad.id),0)) THEN RAISE EXCEPTION 'Advance overallocated' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.payment_allocations pa JOIN sales.invoice_lines il ON il.company_id=pa.company_id AND il.id=pa.invoice_line_id WHERE pa.company_id=r.company_id AND pa.receipt_id=r.id AND il.gross<(SELECT sum(amount) FROM accounting.active_payment_allocations WHERE company_id=il.company_id AND invoice_line_id=il.id)) THEN RAISE EXCEPTION 'Invoice overallocated' USING ERRCODE='23514';END IF;
 FOR ap IN SELECT aa.* FROM accounting.advance_applications aa JOIN accounting.customer_advances ad ON ad.company_id=aa.company_id AND ad.id=aa.advance_id WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id LOOP
 SELECT coalesce(sum(amount),0) INTO v FROM accounting.payment_allocations WHERE company_id=ap.company_id AND source_document_id=ap.id AND advance_id=ap.advance_id;
 IF v<>ap.amount OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=ap.company_id AND id=ap.id AND state='POSTED') THEN RAISE EXCEPTION 'Application split/state mismatch' USING ERRCODE='23514';END IF;END LOOP;
 RETURN NULL;END $$;

CREATE OR REPLACE FUNCTION accounting.guard_settlement_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='POSTED' AND (EXISTS(SELECT 1 FROM accounting.customer_receipts WHERE company_id=OLD.company_id AND id=OLD.id) OR EXISTS(SELECT 1 FROM accounting.active_advance_applications WHERE company_id=OLD.company_id AND id=OLD.id)) THEN RAISE EXCEPTION 'Posted settlement document is immutable' USING ERRCODE='23514';END IF;
 IF NEW.state='CANCELLED' AND OLD.document_type='SALES_ORDER' AND EXISTS(SELECT 1 FROM accounting.active_customer_advances a JOIN sales.order_lines l ON l.company_id=a.company_id AND l.id=a.order_line_id WHERE l.company_id=OLD.company_id AND l.order_id=OLD.id AND a.amount-accounting.advance_refunded(a.id)>coalesce((SELECT sum(ap.amount) FROM accounting.active_advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)) THEN RAISE EXCEPTION 'Prepaid order requires an advance refund workflow' USING ERRCODE='HR409';END IF;RETURN NEW;END $$;

CREATE OR REPLACE FUNCTION accounting.invoice_gst_attribution() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;i sales.invoices;il sales.invoice_lines;ad record;remaining numeric;v numeric;cleared numeric:=0;posts jsonb:='[]';docversion bigint;
BEGIN
 SELECT * INTO il FROM sales.invoice_lines WHERE company_id=c AND id=NEW.invoice_line_id;
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=il.invoice_id;
 IF EXISTS(SELECT 1 FROM accounting.active_customer_advances WHERE company_id=c AND order_line_id=il.order_line_id AND gst_basis<>i.gst_basis) THEN RAISE EXCEPTION 'Prepayment tax basis transition requires review' USING ERRCODE='HR422';END IF;
 IF i.gst_basis='NON_CASH' THEN
 remaining:=NEW.tax;
 FOR ad IN SELECT a.*,a.gst_amount-accounting.advance_refund_tax(a.id)-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=a.company_id AND g.advance_id=a.id),0) AS pending FROM accounting.active_customer_advances a WHERE a.company_id=c AND a.order_line_id=il.order_line_id AND a.gst_basis='NON_CASH' ORDER BY a.receipt_id,a.id LOOP
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

CREATE OR REPLACE FUNCTION inventory.receive_sales_return(p_order uuid,p_warehouse uuid,p_disposition text,p_reason text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();rid uuid:=gen_random_uuid();lid uuid;o sales.orders;today date;whkind text;entry jsonb;l record;tax_advance record;
 qty numeric;bqty numeric;used numeric;used_cost numeric;cost numeric;shipped numeric;billed numeric;cancelled numeric;used_net numeric;used_tax numeric;n numeric;t numeric;release_amount numeric:=0;pending numeric;tax_left numeric;take_tax numeric;
 balance inventory.stock_balances;pool inventory.stock_values;inv uuid;cogs uuid;orig_batch uuid;j uuid;posts jsonb:='[]';no int:=0;
BEGIN
 SELECT * INTO o FROM sales.orders WHERE company_id=c AND id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('inventory.returns.write',o.warehouse_id);PERFORM inventory.require_access('inventory.returns.write',p_warehouse);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=p_order AND state='CONFIRMED' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return requires confirmed source order' USING ERRCODE='HR409';END IF;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=o.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(o.customer_id);
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return requires open accounting period' USING ERRCODE='HR422';END IF;
 SELECT kind INTO whkind FROM catalog.warehouses WHERE company_id=c AND id=p_warehouse AND active FOR SHARE;
 IF NOT FOUND OR p_disposition IS NULL OR NOT((p_disposition='RESTOCK' AND whkind='SELLABLE') OR (p_disposition='QUARANTINE' AND whkind='QUARANTINE')) THEN RAISE EXCEPTION 'Choose active sellable/restock or quarantine warehouse' USING ERRCODE='HR422';END IF;
 IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Return reason and 1..50 lines required' USING ERRCODE='HR422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(rid,c,'SALES_RETURN',accounting.return_number('SALES_RETURN'),today,'CONFIRMED',a);
 INSERT INTO inventory.sales_returns(id,company_id,order_id,warehouse_id,disposition,reason,created_by) VALUES(rid,c,p_order,p_warehouse,p_disposition,trim(p_reason),a);
 FOR entry IN SELECT v.value FROM jsonb_array_elements(items) v JOIN inventory.stock_movements m ON m.company_id=c AND m.id=(v.value->>'stockMovementId')::uuid JOIN inventory.stock_balances b ON b.company_id=m.company_id AND b.id=m.stock_balance_id ORDER BY b.product_id,m.id LOOP
 SELECT m.*,pl.quantity AS sales_quantity,pl.order_line_id,pl.pick_id,ol.quantity AS ordered_qty,ol.net AS ordered_net,ol.tax AS ordered_tax,ol.gross AS ordered_gross,ol.snapshot,ol.product_id,p.order_id
 INTO l FROM inventory.stock_movements m JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id AND p.state='DISPATCHED' JOIN sales.order_lines ol ON ol.company_id=pl.company_id AND ol.id=pl.order_line_id WHERE m.company_id=c AND m.id=(entry->>'stockMovementId')::uuid;
 IF NOT FOUND OR l.order_id<>p_order THEN RAISE EXCEPTION 'Return source movement unavailable' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Return quantity violates frozen sales unit step' USING ERRCODE='HR422';END IF;
 bqty:=qty*l.quantity/l.sales_quantity;
 IF bqty<>round(bqty,6) THEN RAISE EXCEPTION 'Return cannot be represented in base units' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum(base_quantity),0),coalesce(sum(rl.cost),0) INTO used,used_cost FROM inventory.sales_return_lines rl WHERE rl.company_id=c AND rl.stock_movement_id=l.id;
 IF bqty+used>l.quantity THEN RAISE EXCEPTION 'Return exceeds originally dispatched quantity' USING ERRCODE='HR409';END IF;
 cost:=round(l.cost*(used+bqty)/l.quantity,2)-used_cost;n:=0;t:=0;
 IF nullif(entry->>'invoiceLineId','') IS NOT NULL THEN
 SELECT il.quantity INTO billed FROM sales.invoice_lines il WHERE il.company_id=c AND il.id=(entry->>'invoiceLineId')::uuid AND il.order_line_id=l.order_line_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return invoice does not match dispatched order line' USING ERRCODE='HT404';END IF;
 SELECT coalesce(sum(quantity),0) INTO used FROM inventory.sales_return_lines WHERE company_id=c AND invoice_line_id=(entry->>'invoiceLineId')::uuid;
 IF qty+used>billed THEN RAISE EXCEPTION 'Return exceeds invoice quantity' USING ERRCODE='HR409';END IF;
 ELSE
 IF EXISTS(SELECT 1 FROM accounting.active_customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.order_line_id AND ad.amount-accounting.advance_refunded(ad.id)>coalesce((SELECT sum(amount) FROM accounting.active_advance_applications WHERE company_id=c AND advance_id=ad.id),0)) THEN RAISE EXCEPTION 'Refund unapplied advances before cancelling uninvoiced delivery' USING ERRCODE='HR409';END IF;
 SELECT coalesce(sum(pl.quantity),0) INTO shipped FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id WHERE pl.company_id=c AND pl.order_line_id=l.order_line_id AND p.state='DISPATCHED';
 SELECT coalesce(sum(quantity),0) INTO billed FROM sales.invoice_lines WHERE company_id=c AND order_line_id=l.order_line_id;
 SELECT coalesce(sum(quantity),0) INTO cancelled FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.order_line_id AND invoice_line_id IS NULL;
 IF qty>shipped-billed-cancelled THEN RAISE EXCEPTION 'Return must reference invoice for billed quantities' USING ERRCODE='HR409';END IF;
 SELECT coalesce(sum(q),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO used,used_net,used_tax FROM (SELECT quantity q,net,tax FROM sales.invoice_lines WHERE company_id=c AND order_line_id=l.order_line_id UNION ALL SELECT quantity,cancelled_net,cancelled_tax FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.order_line_id AND invoice_line_id IS NULL) v;
 n:=round(l.ordered_net*(used+qty)/l.ordered_qty,2)-used_net;t:=round(l.ordered_tax*(used+qty)/l.ordered_qty,2)-used_tax;release_amount:=release_amount+n+t;
 END IF;
 lid:=gen_random_uuid();no:=no+1;
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,rid,no,a);
 INSERT INTO inventory.sales_return_lines(id,company_id,return_id,stock_movement_id,order_line_id,invoice_line_id,quantity,base_quantity,cost,cancelled_net,cancelled_tax,cancelled_gross) VALUES(lid,c,rid,l.id,l.order_line_id,nullif(entry->>'invoiceLineId','')::uuid,qty,bqty,cost,n,t,n+t);
 INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,created_by) VALUES(c,p_warehouse,l.product_id,a) ON CONFLICT(company_id,warehouse_id,product_id) DO NOTHING;
 SELECT * INTO balance FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=p_warehouse AND product_id=l.product_id FOR UPDATE;
 SELECT * INTO pool FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=balance.id FOR UPDATE;
 IF NOT FOUND THEN
 IF balance.on_hand<>0 THEN RAISE EXCEPTION 'Value existing target stock before receiving return' USING ERRCODE='HR422';END IF;
 INSERT INTO inventory.stock_values(company_id,stock_balance_id,value,opening_document_id) VALUES(c,balance.id,0,rid) RETURNING * INTO pool;
 END IF;
 UPDATE inventory.stock_balances SET on_hand=on_hand+bqty WHERE company_id=c AND id=balance.id;
 UPDATE inventory.stock_values SET value=value+cost WHERE company_id=c AND id=pool.id;
 IF cost>0 THEN
 SELECT pb.id INTO orig_batch FROM accounting.posting_batches pb WHERE pb.company_id=c AND pb.source_document_id=l.pick_id AND pb.posting_kind='STOCK_ISSUE';
 SELECT jl.account_id INTO inv FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE je.company_id=c AND je.posting_batch_id=orig_batch AND ac.control_kind='INVENTORY' AND jl.credit>0 LIMIT 1;
 SELECT jl.account_id INTO cogs FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE je.company_id=c AND je.posting_batch_id=orig_batch AND ac.kind='EXPENSE' AND jl.debit>0 LIMIT 1;
 IF inv IS NULL OR cogs IS NULL THEN RAISE EXCEPTION 'Original stock cost journal missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',inv,'debit',cost,'sourceLineId',lid),jsonb_build_object('accountId',cogs,'credit',cost,'sourceLineId',lid));END IF;
 -- Cancel tax already attributed on an uninvoiced non-cash prepayment; cash changes only when funds are refunded.
 IF t>0 THEN
 tax_left:=t;
 FOR tax_advance IN SELECT av.*,av.gst_amount-accounting.advance_refund_tax(av.id)-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=c AND g.advance_id=av.id),0) AS pending FROM accounting.active_customer_advances av WHERE av.company_id=c AND av.order_line_id=l.order_line_id AND av.gst_basis='NON_CASH' ORDER BY av.receipt_id,av.id LOOP
 take_tax:=least(tax_left,tax_advance.pending);
 IF take_tax>0 THEN
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',tax_advance.output_account_id,'debit',take_tax),jsonb_build_object('accountId',tax_advance.clearing_account_id,'credit',take_tax));
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,return_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,rid,tax_advance.id,lid,'UNBILLED_RETURN','NON_CASH',today,tax_advance.tax_code_id,-n-t,-take_tax);
 tax_left:=tax_left-take_tax;END IF;END LOOP;END IF;
 END LOOP;
 IF no<>jsonb_array_length(items) THEN RAISE EXCEPTION 'Return contains unavailable movements' USING ERRCODE='HT404';END IF;
 IF release_amount>0 THEN UPDATE sales.credit_commitments SET released_amount=released_amount+release_amount WHERE company_id=c AND order_id=p_order;END IF;
 IF jsonb_array_length(posts)>0 THEN
 j:=accounting.post_journal(rid,1,'SALES_RETURN',today,'Sales return at original issue cost',posts);
 FOR orig_batch IN SELECT DISTINCT pb.id FROM inventory.sales_return_lines rl JOIN inventory.stock_movements m ON m.company_id=rl.company_id AND m.id=rl.stock_movement_id JOIN inventory.pick_lines pl ON pl.company_id=m.company_id AND pl.id=m.pick_line_id JOIN accounting.posting_batches pb ON pb.company_id=pl.company_id AND pb.source_document_id=pl.pick_id AND pb.posting_kind='STOCK_ISSUE' WHERE rl.company_id=c AND rl.return_id=rid AND rl.cost>0 LOOP PERFORM accounting.contra_link(orig_batch,j,'RETURN_COST');END LOOP;
 END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=rid;UPDATE platform.documents SET state=state WHERE company_id=c AND id=p_order;RETURN rid;
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
 t:=greatest(0,round(charge_tax*(paid+v)/charge,2)-CASE WHEN l.gst_basis='CASH' THEN accounting.cash_tax_balance(l.id) ELSE CASE WHEN accounting.settlement_changed_line(l.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND l.id IN(source_invoice_line_id,target_invoice_line_id)) THEN round(charge_tax*paid/charge,2) ELSE tax_paid END END);
 INSERT INTO accounting.payment_allocations(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,v,t);
 IF l.gst_basis='CASH' THEN
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,CASE WHEN aid IS NULL THEN 'CASH_RECEIPT' ELSE 'ADVANCE_APPLIED' END,'CASH',cash_date,l.tax_code_id,v,t);
 END IF;total_tax:=total_tax+t;
 END LOOP;RETURN total_tax;END $$;
CREATE OR REPLACE FUNCTION accounting.post_customer_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_cancel_order boolean DEFAULT false) RETURNS uuid
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
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Refund requires open period' USING ERRCODE='HR422';END IF;
 IF p_advance IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.active_customer_advances WHERE company_id=c AND id=p_advance) THEN RAISE EXCEPTION 'Receipt reversed; advance unavailable' USING ERRCODE='HR409';END IF;
 bank:=accounting.settlement_account('BANK','ASSET','BANK');posts:=jsonb_build_array(jsonb_build_object('accountId',bank,'credit',p_amount));
 IF p_credit_line IS NOT NULL THEN
 SELECT coalesce(sum(amount),0) INTO paid FROM accounting.active_payment_allocations WHERE company_id=c AND invoice_line_id=il.id;
 SELECT coalesce(sum(amount),0) INTO note_refunds FROM accounting.customer_refunds WHERE company_id=c AND credit_line_id=cl.id;old_refunds:=accounting.line_refunded(il.id);
 IF p_amount>(SELECT available_apply_amount FROM sales.customer_credit_line_balances WHERE company_id=c AND id=cl.id) OR p_amount>greatest(0,-ex.receivable) THEN RAISE EXCEPTION 'Refund exceeds source payments, credit or customer net credit balance' USING ERRCODE='HR409';END IF;
 IF greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund would remove required order/credit funding' USING ERRCODE='HR409';END IF;
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE pb.company_id=c AND pb.source_document_id=cl.credit_note_id AND pb.posting_kind='CREDIT_NOTE' AND ac.control_kind='AR' AND jl.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original credit AR journal missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',i.party_id,'debit',p_amount));
 IF i.gst_basis='CASH' THEN
 cash_tax:=accounting.cash_tax_balance(il.id);new_gross:=il.gross-accounting.line_credited(il.id);SELECT il.tax-coalesce(sum(v.tax),0) INTO new_tax FROM sales.credit_note_lines v WHERE v.company_id=c AND v.invoice_line_id=il.id;
 IF (accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) THEN SELECT net_paid_amount INTO paid FROM sales.invoice_line_balances WHERE company_id=c AND id=il.id;old_refunds:=0;END IF;
 IF paid-old_refunds-p_amount<=new_gross THEN desired:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-old_refunds-p_amount)/new_gross,2) END;
 ELSE desired:=greatest(0,cash_tax-(round(il.tax*(old_refunds+p_amount)/il.gross,2)-round(il.tax*old_refunds/il.gross,2)));END IF;
 IF (accounting.settlement_changed_line(il.id) OR EXISTS(SELECT 1 FROM sales.credit_application_lines WHERE company_id=c AND il.id IN(source_invoice_line_id,target_invoice_line_id))) AND paid-p_amount>new_gross THEN desired:=least(il.tax,new_tax+round((il.tax-new_tax)*(paid-p_amount-new_gross)/(il.gross-new_gross),2));END IF;
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
 tax_date:=CASE WHEN EXISTS(SELECT 1 FROM accounting.advance_unapplications WHERE company_id=c AND advance_id=ad.id) THEN today ELSE r.received_on END;
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
 PERFORM accounting.post_journal(application,1,'CASH_GST_ROUNDING',tax_date,'Advance GST rounding at original receipt date',adjustment);
 END IF;
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,application,r.id,ad.id,'ADVANCE_TRANSFER','CASH',tax_date,ad.tax_code_id,-v,-original_gst);
 IF target_gst>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.output_account_id,'debit',target_gst),jsonb_build_object('accountId',ad.clearing_account_id,'credit',target_gst));END IF;
 END IF;
 PERFORM accounting.post_journal(application,1,'ADVANCE_APPLICATION',today,'Apply customer advance',posts);
 UPDATE crm.customer_credit_exposures SET receivable=receivable-v,available_advances=available_advances-v WHERE company_id=c AND customer_id=r.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=application;RETURN application;
END $$;
CREATE OR REPLACE FUNCTION accounting.post_receipt_core(cust uuid,p_amount numeric,p_method text,p_reference text,p_date date,items jsonb,prepayments jsonb,original_bank uuid) RETURNS uuid
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
 bank:=coalesce(original_bank,accounting.settlement_account('BANK','ASSET','BANK'));IF NOT EXISTS(SELECT 1 FROM accounting.accounts WHERE company_id=c AND id=bank AND active AND kind='ASSET' AND control_kind='BANK') THEN RAISE EXCEPTION 'Original bank account unavailable' USING ERRCODE='HR422';END IF;IF allocated>0 THEN ar:=accounting.settlement_account('AR','ASSET','AR');END IF;
 IF prepaid>0 THEN adv_account:=accounting.settlement_account('CUSTOMER_ADVANCES','LIABILITY');clearing:=accounting.settlement_account('GST_ADVANCE_CLEARING','ASSET');END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(rid,c,'CUSTOMER_RECEIPT',accounting.settlement_number('CUSTOMER_RECEIPT'),actual,'CONFIRMED',a);
 INSERT INTO accounting.customer_receipts(id,company_id,customer_id,received_on,method,reference,amount,allocated_amount,advance_amount,bank_account_id,created_by) VALUES(rid,c,cust,actual,p_method,trim(p_reference),p_amount,allocated,prepaid,bank,a);
 postings:=jsonb_build_array(jsonb_build_object('accountId',bank,'debit',p_amount));
 IF allocated>0 THEN ignored:=accounting.allocate_payment(rid,rid,NULL,cust,items,actual);postings:=postings||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',customer.party_id,'credit',allocated));END IF;
 IF prepaid>0 THEN postings:=postings||jsonb_build_array(jsonb_build_object('accountId',adv_account,'credit',prepaid));END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(prepayments) ORDER BY value->>'orderLineId' LOOP
 SELECT ol.*,o.customer_id,d.state,CASE WHEN ol.source_quote_line_id IS NULL THEN (ol.snapshot->>'taxRate')::numeric ELSE ql.tax_rate END AS tax_rate,CASE WHEN ol.source_quote_line_id IS NULL THEN ol.snapshot->>'taxCode' ELSE ql.snapshot->>'taxCode' END AS tax_code FROM sales.order_lines ol JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id LEFT JOIN sales.quote_lines ql ON ql.company_id=ol.company_id AND ql.id=ol.source_quote_line_id WHERE ol.company_id=c AND ol.id=(x->>'orderLineId')::uuid INTO l;
 IF NOT FOUND OR l.customer_id<>cust THEN RAISE EXCEPTION 'Advance order line unavailable' USING ERRCODE='HT404';END IF;
 IF l.state<>'CONFIRMED' THEN RAISE EXCEPTION 'Advance requires a confirmed order' USING ERRCODE='HR409';END IF;
 v:=(x->>'amount')::numeric;
 SELECT coalesce(sum(il.gross),0),coalesce(sum(il.tax),0) INTO billed,billed_tax FROM sales.invoice_lines il WHERE il.company_id=c AND il.order_line_id=l.id;
 SELECT coalesce(sum(ad.amount-accounting.advance_refunded(ad.id)-coalesce((SELECT sum(ap.amount) FROM accounting.active_advance_applications ap WHERE ap.company_id=ad.company_id AND ap.advance_id=ad.id),0)),0),coalesce(sum(ad.amount-accounting.advance_refunded(ad.id)),0),coalesce(sum(ad.gst_amount-accounting.advance_refund_tax(ad.id)),0) INTO remaining,prior_amount,prior_tax FROM accounting.active_customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id;
 IF v>l.gross-billed-remaining-coalesce((SELECT sum(cancelled_gross) FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.id AND invoice_line_id IS NULL),0) THEN RAISE EXCEPTION 'Advance exceeds unfunded uninvoiced order balance' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM accounting.active_customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id AND ad.gst_basis<>company.gst_basis) THEN RAISE EXCEPTION 'GST basis transition requires tax review' USING ERRCODE='HR422';END IF;
 IF l.tax_rate>0 AND NOT company.gst_registered THEN RAISE EXCEPTION 'GST registration required for taxable advance' USING ERRCODE='HR422';END IF;
 SELECT tc.id INTO taxcode FROM accounting.tax_codes tc WHERE tc.company_id=c AND tc.code=l.tax_code;
 IF NOT FOUND THEN RAISE EXCEPTION 'Frozen order tax code missing' USING ERRCODE='HR422';END IF;
 basis:=company.gst_basis;
 IF basis='CASH' THEN t:=round(l.tax*(prior_amount+v)/l.gross,2)-round(l.tax*prior_amount/l.gross,2);
 ELSE
 SELECT coalesce(sum(g.gst_amount),0) INTO cleared FROM accounting.advance_gst_clearings g JOIN accounting.customer_advances ad ON ad.company_id=g.company_id AND ad.id=g.advance_id WHERE ad.company_id=c AND ad.order_line_id=l.id;
 t:=greatest(0,l.tax-billed_tax-coalesce((SELECT sum(cancelled_tax) FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.id AND invoice_line_id IS NULL),0)-(prior_tax-cleared));END IF;
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
CREATE OR REPLACE FUNCTION accounting.post_receipt(cust uuid,p_amount numeric,p_method text,p_reference text,p_date date,items jsonb,prepayments jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN accounting.post_receipt_core(cust,p_amount,p_method,p_reference,p_date,items,prepayments,NULL);END $$;
CREATE FUNCTION accounting.lock_receipt_correction(rid uuid,items jsonb DEFAULT '[]',prepayments jsonb DEFAULT '[]') RETURNS uuid LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();cust uuid;oid uuid;BEGIN
 SELECT customer_id INTO cust FROM accounting.customer_receipts WHERE company_id=c AND id=rid;IF NOT FOUND THEN RAISE EXCEPTION 'Receipt unavailable' USING ERRCODE='HT404';END IF;
 FOR oid IN SELECT DISTINCT order_id FROM(
 SELECT i.order_id FROM accounting.payment_allocations p JOIN sales.invoice_lines il ON il.company_id=p.company_id AND il.id=p.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE p.company_id=c AND p.receipt_id=rid
 UNION ALL SELECT ol.order_id FROM accounting.customer_advances a JOIN sales.order_lines ol ON ol.company_id=a.company_id AND ol.id=a.order_line_id WHERE a.company_id=c AND a.receipt_id=rid
 UNION ALL SELECT i.order_id FROM jsonb_array_elements(items)q JOIN sales.invoice_lines il ON il.company_id=c AND il.id=(q.value->>'invoiceLineId')::uuid JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE i.customer_id=cust
 UNION ALL SELECT ol.order_id FROM jsonb_array_elements(prepayments)q JOIN sales.order_lines ol ON ol.company_id=c AND ol.id=(q.value->>'orderLineId')::uuid JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id WHERE o.customer_id=cust)q ORDER BY order_id LOOP PERFORM 1 FROM platform.documents WHERE company_id=c AND id=oid FOR UPDATE;END LOOP;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=cust FOR UPDATE;PERFORM 1 FROM sales.lock_credit(cust);IF NOT FOUND THEN RAISE EXCEPTION 'Customer exposure missing' USING ERRCODE='HR422';END IF;RETURN cust;END $$;
CREATE FUNCTION accounting.correction_context(cust uuid,cap text,p_reference text,p_reason text) RETURNS date LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE today date;BEGIN
 PERFORM sales.require_customer_access(cap,cust);PERFORM sales.require_customer_access('accounting.receipts.read',cust);PERFORM sales.require_customer_access('accounting.receivables.read',cust);
 IF p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 1 AND 200 OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Correction reference and reason required' USING ERRCODE='HR422';END IF;
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=core.current_company() FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=core.current_company() AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Correction requires open current period' USING ERRCODE='HR422';END IF;RETURN today;END $$;
CREATE FUNCTION accounting.correct_invoice_gst(doc uuid,lid uuid,movement numeric,on_date date,correction_kind text,net_change numeric DEFAULT 0) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();b record;desired numeric;delta numeric;BEGIN
 SELECT * INTO b FROM sales.invoice_line_balances WHERE company_id=c AND id=lid;
 b.net_paid_amount:=b.net_paid_amount+net_change;IF b.net_paid_amount<0 THEN RAISE EXCEPTION 'Settlement funds already refunded or transferred; undo downstream use first' USING ERRCODE='HR409';END IF;
 IF b.gst_basis<>'CASH' THEN RETURN;END IF;
 IF b.net_paid_amount<=b.remaining_gross THEN desired:=CASE WHEN b.remaining_gross=0 THEN 0 ELSE round(b.remaining_tax*b.net_paid_amount/b.remaining_gross,2) END;
 ELSE desired:=least(b.tax,b.remaining_tax+round((b.tax-b.remaining_tax)*(b.net_paid_amount-b.remaining_gross)/(b.gross-b.remaining_gross),2));END IF;
 delta:=desired-b.cash_tax_balance;IF delta<>0 THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,settlement_reversal_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,lid,doc,correction_kind,'CASH',on_date,b.tax_code_id,movement,delta);END IF;END $$;
CREATE FUNCTION accounting.unapply_advance(application uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();ap accounting.advance_applications;ad accounting.customer_advances;r accounting.customer_receipts;today date;ar uuid;party uuid;j uuid;batch uuid;posts jsonb;x record;BEGIN
 PERFORM purchase.require_access('accounting.advances.unapply');SELECT * INTO ap FROM accounting.advance_applications WHERE company_id=c AND id=application;IF NOT FOUND THEN RAISE EXCEPTION 'Application unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO ad FROM accounting.customer_advances WHERE company_id=c AND id=ap.advance_id;SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=ad.receipt_id;
 today:=accounting.correction_context(r.customer_id,'accounting.advances.unapply',p_reference,p_reason);PERFORM accounting.lock_receipt_correction(r.id);
 IF NOT EXISTS(SELECT 1 FROM accounting.active_advance_applications WHERE company_id=c AND id=application) THEN RAISE EXCEPTION 'Application already unapplied or receipt reversed' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=application AND business_date>today) THEN RAISE EXCEPTION 'Correction cannot precede application' USING ERRCODE='HR422';END IF;
 SELECT b.id INTO batch FROM accounting.posting_batches b WHERE b.company_id=c AND b.source_document_id=application AND b.posting_kind='ADVANCE_APPLICATION';
 SELECT l.account_id,l.party_id INTO ar,party FROM accounting.journal_lines l JOIN accounting.journal_entries e ON e.company_id=l.company_id AND e.id=l.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND e.posting_batch_id=batch AND ac.control_kind='AR' AND l.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original application AR missing' USING ERRCODE='HR422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'ADVANCE_UNAPPLICATION',accounting.settlement_reversal_number('ADVANCE_UNAPPLICATION'),today,'CONFIRMED',a);
 FOR x IN SELECT invoice_line_id,amount FROM accounting.payment_allocations WHERE company_id=c AND source_document_id=application ORDER BY invoice_line_id LOOP PERFORM accounting.correct_invoice_gst(doc,x.invoice_line_id,-x.amount,today,'ADVANCE_UNAPPLICATION',-x.amount);END LOOP;
 posts:=jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',party,'debit',ap.amount),jsonb_build_object('accountId',ad.advance_account_id,'credit',ap.amount));
 IF ad.gst_basis='CASH' THEN
 IF ap.consumed_gst>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.clearing_account_id,'debit',ap.consumed_gst),jsonb_build_object('accountId',ad.output_account_id,'credit',ap.consumed_gst));END IF;
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,settlement_reversal_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,ad.id,doc,'ADVANCE_UNAPPLICATION','CASH',today,ad.tax_code_id,ap.amount,ap.consumed_gst);END IF;
 j:=accounting.post_journal(doc,1,'ADVANCE_UNAPPLICATION',today,'Unapply customer advance',posts);
INSERT INTO accounting.advance_unapplications(id,company_id,application_id,advance_id,receipt_id,customer_id,reference,reason,amount,consumed_gst,journal_entry_id,created_by) VALUES(doc,c,application,ad.id,r.id,r.customer_id,btrim(p_reference),btrim(p_reason),ap.amount,ap.consumed_gst,j,a);
 UPDATE crm.customer_credit_exposures SET receivable=receivable+ap.amount,available_advances=available_advances+ap.amount WHERE company_id=c AND customer_id=r.customer_id;
 PERFORM accounting.contra_link(batch,j,'ADVANCE_UNAPPLICATION');UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;END $$;
CREATE FUNCTION accounting.reverse_receipt(receipt uuid,p_reference text,p_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();doc uuid:=gen_random_uuid();r accounting.customer_receipts;today date;batch uuid;j uuid;ar uuid;party uuid;pending numeric;posts jsonb;x record;BEGIN
 PERFORM purchase.require_access('accounting.receipts.reverse');SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=receipt;IF NOT FOUND THEN RAISE EXCEPTION 'Receipt unavailable' USING ERRCODE='HT404';END IF;
 today:=accounting.correction_context(r.customer_id,'accounting.receipts.reverse',p_reference,p_reason);PERFORM accounting.lock_receipt_correction(receipt);
 IF NOT EXISTS(SELECT 1 FROM accounting.active_customer_receipts WHERE company_id=c AND id=receipt) THEN RAISE EXCEPTION 'Receipt already reversed' USING ERRCODE='HR409';END IF;
 IF r.received_on>today THEN RAISE EXCEPTION 'Correction cannot precede receipt' USING ERRCODE='HR422';END IF;
 IF EXISTS(SELECT 1 FROM accounting.active_advance_applications ap JOIN accounting.customer_advances ad ON ad.company_id=ap.company_id AND ad.id=ap.advance_id WHERE ad.company_id=c AND ad.receipt_id=receipt) THEN RAISE EXCEPTION 'Unapply advance applications before reversing receipt' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.receipt_id=receipt AND accounting.advance_refunded(ad.id)>0) THEN RAISE EXCEPTION 'Receipt advance already refunded; refund requires separate correction' USING ERRCODE='HR409';END IF;
 SELECT id INTO batch FROM accounting.posting_batches WHERE company_id=c AND source_document_id=receipt AND posting_kind='CUSTOMER_RECEIPT';
 posts:=jsonb_build_array(jsonb_build_object('accountId',r.bank_account_id,'credit',r.amount));
 IF r.allocated_amount>0 THEN
 SELECT l.account_id,l.party_id INTO ar,party FROM accounting.journal_lines l JOIN accounting.journal_entries e ON e.company_id=l.company_id AND e.id=l.journal_entry_id JOIN accounting.accounts ac ON ac.company_id=l.company_id AND ac.id=l.account_id WHERE l.company_id=c AND e.posting_batch_id=batch AND ac.control_kind='AR' AND l.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original receipt AR missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',party,'debit',r.allocated_amount));END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(doc,c,'RECEIPT_REVERSAL',accounting.settlement_reversal_number('RECEIPT_REVERSAL'),today,'CONFIRMED',a);
 FOR x IN SELECT invoice_line_id,amount FROM accounting.payment_allocations WHERE company_id=c AND source_document_id=receipt ORDER BY invoice_line_id LOOP PERFORM accounting.correct_invoice_gst(doc,x.invoice_line_id,-x.amount,today,'RECEIPT_REVERSAL',-x.amount);END LOOP;
 FOR x IN SELECT ad.* FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.receipt_id=receipt ORDER BY ad.id LOOP
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',x.advance_account_id,'debit',x.amount));
 pending:=greatest(0,x.gst_amount-accounting.advance_refund_tax(x.id)-CASE WHEN x.gst_basis='NON_CASH' THEN coalesce((SELECT sum(gst_amount) FROM accounting.advance_gst_clearings WHERE company_id=c AND advance_id=x.id),0) ELSE 0 END);
 IF pending>0 THEN posts:=posts||jsonb_build_array(jsonb_build_object('accountId',x.output_account_id,'debit',pending),jsonb_build_object('accountId',x.clearing_account_id,'credit',pending));END IF;
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,advance_id,settlement_reversal_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,doc,x.id,doc,'RECEIPT_REVERSAL',x.gst_basis,today,x.tax_code_id,-x.amount,-pending);
 END LOOP;
 j:=accounting.post_journal(doc,1,'RECEIPT_REVERSAL',today,'Reverse erroneous customer receipt',posts);
 INSERT INTO accounting.receipt_reversals(id,company_id,receipt_id,customer_id,reference,reason,amount,journal_entry_id,created_by) VALUES(doc,c,receipt,r.customer_id,btrim(p_reference),btrim(p_reason),r.amount,j,a);
 UPDATE crm.customer_credit_exposures SET receivable=receivable+r.allocated_amount,available_advances=available_advances-r.advance_amount WHERE company_id=c AND customer_id=r.customer_id;
 PERFORM accounting.contra_link(batch,j,'RECEIPT_REVERSAL');UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=doc;RETURN doc;END $$;
CREATE FUNCTION accounting.reapply_receipt(reversal uuid,p_reference text,p_reason text,items jsonb,prepayments jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();v accounting.receipt_reversals;r accounting.customer_receipts;today date;doc uuid;BEGIN
 PERFORM purchase.require_access('accounting.receipts.reapply');SELECT * INTO v FROM accounting.receipt_reversals WHERE company_id=c AND id=reversal;IF NOT FOUND THEN RAISE EXCEPTION 'Receipt reversal unavailable' USING ERRCODE='HT404';END IF;
 SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=v.receipt_id;
 today:=accounting.correction_context(r.customer_id,'accounting.receipts.reapply',p_reference,p_reason);PERFORM sales.require_customer_access('accounting.receipts.write',r.customer_id);
 PERFORM accounting.check_allocations(items,true);PERFORM accounting.check_allocations(prepayments,true);PERFORM accounting.lock_receipt_correction(r.id,items,prepayments);
 IF EXISTS(SELECT 1 FROM accounting.receipt_reapplications WHERE company_id=c AND reversal_id=reversal) THEN RAISE EXCEPTION 'Receipt reversal already reapplied' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=c AND id=reversal AND business_date>today) THEN RAISE EXCEPTION 'Reapplication cannot precede reversal' USING ERRCODE='HR422';END IF;
 doc:=accounting.post_receipt_core(r.customer_id,r.amount,r.method,p_reference,today,items,prepayments,r.bank_account_id);
 INSERT INTO accounting.receipt_reapplications(id,company_id,reversal_id,original_receipt_id,customer_id,reason,created_by) VALUES(doc,c,reversal,r.id,r.customer_id,btrim(p_reason),a);RETURN doc;END $$;
CREATE FUNCTION accounting.reallocate_receipt(receipt uuid,reversal_reference text,p_reference text,p_reason text,items jsonb,prepayments jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE c uuid:=core.current_company();cust uuid;v uuid;BEGIN
 PERFORM purchase.require_access('accounting.receipts.reverse');PERFORM purchase.require_access('accounting.receipts.reapply');SELECT customer_id INTO cust FROM accounting.customer_receipts WHERE company_id=c AND id=receipt;IF NOT FOUND THEN RAISE EXCEPTION 'Receipt unavailable' USING ERRCODE='HT404';END IF;
 PERFORM accounting.correction_context(cust,'accounting.receipts.reverse',reversal_reference,p_reason);PERFORM accounting.correction_context(cust,'accounting.receipts.reapply',p_reference,p_reason);PERFORM sales.require_customer_access('accounting.receipts.write',cust);
 PERFORM accounting.check_allocations(items,true);PERFORM accounting.check_allocations(prepayments,true);PERFORM accounting.lock_receipt_correction(receipt,items,prepayments);
 v:=accounting.reverse_receipt(receipt,reversal_reference,p_reason);RETURN accounting.reapply_receipt(v,p_reference,p_reason,items,prepayments);END $$;
ALTER TABLE accounting.reversal_links DROP CONSTRAINT reversal_links_kind_check;
ALTER TABLE accounting.reversal_links ADD CONSTRAINT reversal_links_kind_check CHECK(kind IN('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND','PURCHASE_RETURN','SUPPLIER_CREDIT','SUPPLIER_REFUND','SUPPLIER_CREDIT_UNAPPLICATION','CUSTOMER_CREDIT_UNAPPLICATION','RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION'));
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
   -coalesce((SELECT sum(f.amount) FROM accounting.customer_refunds f WHERE f.company_id=a.company_id AND f.advance_id=a.id),0) AS balance
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
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
CREATE FUNCTION accounting.guard_reversal_document() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF OLD.state='POSTED' AND OLD.document_type IN('RECEIPT_REVERSAL','ADVANCE_UNAPPLICATION') THEN RAISE EXCEPTION 'Posted settlement reversals are immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER customer_settlement_reversal_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION accounting.guard_reversal_document();
CREATE FUNCTION accounting.validate_reversal() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;doc uuid;cust uuid;j uuid;r accounting.customer_receipts;v accounting.receipt_reversals;u accounting.advance_unapplications;ap accounting.advance_applications;ad accounting.customer_advances;correction_type text;amount numeric;BEGIN
 IF TG_TABLE_NAME='gst_adjustments' THEN IF NEW.settlement_reversal_id IS NULL THEN RETURN NULL;END IF;doc:=NEW.settlement_reversal_id;
 ELSIF TG_TABLE_NAME='receipt_reapplications' THEN
 SELECT * INTO v FROM accounting.receipt_reversals WHERE company_id=c AND id=NEW.reversal_id;SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=NEW.id;
 IF v.receipt_id<>NEW.original_receipt_id OR v.customer_id<>NEW.customer_id OR r.customer_id<>NEW.customer_id OR r.amount<>v.amount OR r.bank_account_id<>(SELECT bank_account_id FROM accounting.customer_receipts WHERE company_id=c AND id=v.receipt_id) OR r.method<>(SELECT method FROM accounting.customer_receipts WHERE company_id=c AND id=v.receipt_id) THEN RAISE EXCEPTION 'Replacement receipt differs from original funds' USING ERRCODE='23514';END IF;RETURN NULL;
 ELSE doc:=NEW.id;END IF;
 SELECT * INTO v FROM accounting.receipt_reversals WHERE company_id=c AND id=doc;
 IF FOUND THEN
 cust:=v.customer_id;j:=v.journal_entry_id;correction_type:='RECEIPT_REVERSAL';amount:=v.amount;SELECT * INTO r FROM accounting.customer_receipts WHERE company_id=c AND id=v.receipt_id;
 IF r.amount<>amount OR r.customer_id<>cust OR EXISTS(SELECT 1 FROM accounting.active_advance_applications aa JOIN accounting.customer_advances av ON av.company_id=aa.company_id AND av.id=aa.advance_id WHERE av.company_id=c AND av.receipt_id=r.id) THEN RAISE EXCEPTION 'Receipt reversal source mismatch' USING ERRCODE='23514';END IF;
 IF (SELECT coalesce(sum(l.credit-l.debit),0) FROM accounting.journal_lines l WHERE l.company_id=c AND l.journal_entry_id=j AND l.account_id=r.bank_account_id)<>amount OR (SELECT coalesce(sum(l.debit-l.credit),0) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND a.control_kind='AR')<>r.allocated_amount THEN RAISE EXCEPTION 'Receipt reversal bank/AR mismatch' USING ERRCODE='23514';END IF;
 ELSE
 SELECT * INTO u FROM accounting.advance_unapplications WHERE company_id=c AND id=doc;IF NOT FOUND THEN RAISE EXCEPTION 'Reversal event missing' USING ERRCODE='23514';END IF;
 cust:=u.customer_id;j:=u.journal_entry_id;correction_type:='ADVANCE_UNAPPLICATION';amount:=u.amount;SELECT * INTO ap FROM accounting.advance_applications WHERE company_id=c AND id=u.application_id;SELECT * INTO ad FROM accounting.customer_advances WHERE company_id=c AND id=u.advance_id;
 IF ap.advance_id<>ad.id OR ap.amount<>amount OR ap.consumed_gst<>u.consumed_gst OR ad.receipt_id<>u.receipt_id OR (SELECT customer_id FROM accounting.customer_receipts WHERE company_id=c AND id=u.receipt_id)<>cust THEN RAISE EXCEPTION 'Advance unapplication source mismatch' USING ERRCODE='23514';END IF;
 IF (SELECT coalesce(sum(l.debit-l.credit),0) FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE l.company_id=c AND l.journal_entry_id=j AND a.control_kind='AR')<>amount OR (SELECT coalesce(sum(l.credit-l.debit),0) FROM accounting.journal_lines l WHERE l.company_id=c AND l.journal_entry_id=j AND l.account_id=ad.advance_account_id)<>amount THEN RAISE EXCEPTION 'Advance reversal AR/liability mismatch' USING ERRCODE='23514';END IF;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents d JOIN accounting.journal_entries e ON e.company_id=d.company_id AND e.id=j JOIN accounting.posting_batches b ON b.company_id=e.company_id AND b.id=e.posting_batch_id WHERE d.company_id=c AND d.id=doc AND d.document_type=correction_type AND d.state='POSTED' AND e.posting_date=d.business_date AND b.source_document_id=doc AND b.posting_kind=correction_type) THEN RAISE EXCEPTION 'Reversal registry/journal mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.invoice_line_balances WHERE company_id=c AND customer_id=cust AND net_paid_amount<0) OR EXISTS(SELECT 1 FROM accounting.customer_advance_balances WHERE company_id=c AND customer_id=cust AND available<0) THEN RAISE EXCEPTION 'Reversal creates unfunded settlement' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.gst_adjustments g JOIN platform.documents d ON d.company_id=g.company_id AND d.id=g.source_document_id WHERE g.company_id=c AND g.settlement_reversal_id=doc AND(g.source_document_id<>doc OR g.kind<>correction_type OR g.adjustment_date<>d.business_date OR
 (g.invoice_line_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.payment_allocations p JOIN sales.invoice_lines il ON il.company_id=p.company_id AND il.id=p.invoice_line_id JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE p.company_id=c AND p.invoice_line_id=g.invoice_line_id AND p.source_document_id=CASE WHEN correction_type='RECEIPT_REVERSAL' THEN v.receipt_id ELSE u.application_id END AND il.tax_code_id=g.tax_code_id AND i.gst_basis='CASH')) OR
 (g.advance_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM accounting.customer_advances a WHERE a.company_id=c AND a.id=g.advance_id AND a.tax_code_id=g.tax_code_id AND a.gst_basis=g.gst_basis AND a.receipt_id=CASE WHEN correction_type='RECEIPT_REVERSAL' THEN v.receipt_id ELSE u.receipt_id END AND(correction_type='RECEIPT_REVERSAL' OR a.id=u.advance_id))))) THEN RAISE EXCEPTION 'Reversal GST origin mismatch' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER receipt_reversal_consistency AFTER INSERT ON accounting.receipt_reversals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_reversal();
CREATE CONSTRAINT TRIGGER advance_unapplication_consistency AFTER INSERT ON accounting.advance_unapplications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_reversal();
CREATE CONSTRAINT TRIGGER receipt_reapplication_consistency AFTER INSERT ON accounting.receipt_reapplications DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_reversal();
CREATE CONSTRAINT TRIGGER settlement_reversal_gst_consistency AFTER INSERT ON accounting.gst_adjustments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_reversal();
REVOKE ALL ON FUNCTION identity.seed_settlement_reversal_roles(uuid),accounting.settlement_reversal_number(text),accounting.settlement_changed_line(uuid),accounting.post_receipt_core(uuid,numeric,text,text,date,jsonb,jsonb,uuid),accounting.lock_receipt_correction(uuid,jsonb,jsonb),accounting.correction_context(uuid,text,text,text),accounting.correct_invoice_gst(uuid,uuid,numeric,date,text,numeric),accounting.unapply_advance(uuid,text,text),accounting.reverse_receipt(uuid,text,text),accounting.reapply_receipt(uuid,text,text,jsonb,jsonb),accounting.reallocate_receipt(uuid,text,text,text,jsonb,jsonb),accounting.guard_reversal_document(),accounting.validate_reversal() FROM PUBLIC;
GRANT SELECT ON accounting.receipt_reversals,accounting.advance_unapplications,accounting.receipt_reapplications,accounting.active_customer_receipts,accounting.active_customer_advances,accounting.active_advance_applications,accounting.active_payment_allocations,accounting.customer_advance_balances TO htt_app;
GRANT EXECUTE ON FUNCTION accounting.unapply_advance(uuid,text,text),accounting.reverse_receipt(uuid,text,text),accounting.reapply_receipt(uuid,text,text,jsonb,jsonb),accounting.reallocate_receipt(uuid,text,text,text,jsonb,jsonb) TO htt_app;

CREATE INDEX payment_allocation_receipt_lookup ON accounting.payment_allocations(company_id,receipt_id);
CREATE INDEX settlement_gst_reversal_lookup ON accounting.gst_adjustments(company_id,settlement_reversal_id) WHERE settlement_reversal_id IS NOT NULL;
