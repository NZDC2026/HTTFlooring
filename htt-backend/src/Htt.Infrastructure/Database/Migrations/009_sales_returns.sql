-- New contra transactions preserve original documents, quantities, costs and tax records.
CREATE TABLE inventory.sales_returns (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),order_id uuid NOT NULL,warehouse_id uuid NOT NULL,
 disposition text NOT NULL CHECK(disposition IN ('RESTOCK','QUARANTINE')),reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,order_id) REFERENCES sales.orders(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id)
);
CREATE TABLE inventory.sales_return_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),return_id uuid NOT NULL,stock_movement_id uuid NOT NULL,order_line_id uuid NOT NULL,invoice_line_id uuid,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),cost numeric(20,2) NOT NULL CHECK(cost>=0),
 cancelled_net numeric(20,2) NOT NULL CHECK(cancelled_net>=0),cancelled_tax numeric(20,2) NOT NULL CHECK(cancelled_tax>=0),cancelled_gross numeric(20,2) NOT NULL CHECK(cancelled_gross=cancelled_net+cancelled_tax),
 UNIQUE(company_id,id),UNIQUE NULLS NOT DISTINCT(company_id,return_id,stock_movement_id,invoice_line_id),
 FOREIGN KEY(company_id,id,return_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,return_id) REFERENCES inventory.sales_returns(company_id,id),FOREIGN KEY(company_id,stock_movement_id) REFERENCES inventory.stock_movements(company_id,id),FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),CHECK(invoice_line_id IS NULL OR cancelled_gross=0)
);
CREATE TABLE sales.credit_notes (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),invoice_id uuid NOT NULL,reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 2000),
 net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,invoice_id) REFERENCES sales.invoices(company_id,id)
);
CREATE TABLE sales.credit_note_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),credit_note_id uuid NOT NULL,invoice_line_id uuid NOT NULL,return_line_id uuid,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),
 UNIQUE(company_id,id),UNIQUE NULLS NOT DISTINCT(company_id,credit_note_id,invoice_line_id,return_line_id),
 FOREIGN KEY(company_id,id,credit_note_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,credit_note_id) REFERENCES sales.credit_notes(company_id,id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),FOREIGN KEY(company_id,return_line_id) REFERENCES inventory.sales_return_lines(company_id,id)
);
CREATE TABLE accounting.customer_refunds (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),customer_id uuid NOT NULL,credit_line_id uuid,advance_id uuid,
 amount numeric(20,2) NOT NULL CHECK(amount>0),gst_amount numeric(20,2) NOT NULL CHECK(gst_amount>=0),reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id),FOREIGN KEY(company_id,credit_line_id) REFERENCES sales.credit_note_lines(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.customer_advances(company_id,id),CHECK((credit_line_id IS NULL)<>(advance_id IS NULL))
);
CREATE UNIQUE INDEX refund_reference ON accounting.customer_refunds(company_id,lower(reference));
CREATE TABLE accounting.gst_adjustments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_document_id uuid NOT NULL,invoice_line_id uuid,advance_id uuid,return_line_id uuid,credit_line_id uuid,
 kind text NOT NULL CHECK(kind IN ('CREDIT_NOTE','CREDIT_REBASE','CREDIT_REFUND','ADVANCE_REFUND','UNBILLED_RETURN')),gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),adjustment_date date NOT NULL,tax_code_id uuid NOT NULL,amount numeric(20,2) NOT NULL,gst_amount numeric(20,2) NOT NULL,
 UNIQUE(company_id,id),UNIQUE NULLS NOT DISTINCT(company_id,source_document_id,kind,invoice_line_id,advance_id,return_line_id,credit_line_id),
 FOREIGN KEY(company_id,source_document_id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),FOREIGN KEY(company_id,advance_id) REFERENCES accounting.customer_advances(company_id,id),FOREIGN KEY(company_id,return_line_id) REFERENCES inventory.sales_return_lines(company_id,id),FOREIGN KEY(company_id,credit_line_id) REFERENCES sales.credit_note_lines(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id)
);
CREATE TABLE accounting.reversal_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),source_batch_id uuid NOT NULL,contra_batch_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('RETURN_COST','CREDIT_NOTE','CREDIT_REFUND','ADVANCE_REFUND')),
 UNIQUE(company_id,id),UNIQUE(company_id,source_batch_id,contra_batch_id,kind),FOREIGN KEY(company_id,source_batch_id) REFERENCES accounting.posting_batches(company_id,id),FOREIGN KEY(company_id,contra_batch_id) REFERENCES accounting.posting_batches(company_id,id)
);
DO $$ DECLARE sc text;t text;BEGIN FOR sc,t IN SELECT * FROM (VALUES('inventory','sales_returns'),('inventory','sales_return_lines'),('sales','credit_notes'),('sales','credit_note_lines'),('accounting','customer_refunds'),('accounting','gst_adjustments'),('accounting','reversal_links')) v(s,t) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,t);EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,t);
 EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,t);
 EXECUTE format('CREATE INDEX ON %I.%I(company_id)',sc,t);
 EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',sc,t);
 END LOOP;END $$;
CREATE INDEX ON inventory.sales_return_lines(company_id,order_line_id);
CREATE INDEX ON inventory.sales_return_lines(company_id,stock_movement_id);
CREATE INDEX ON inventory.sales_return_lines(company_id,invoice_line_id);
CREATE INDEX ON sales.credit_note_lines(company_id,invoice_line_id);
CREATE INDEX ON sales.credit_note_lines(company_id,return_line_id);
CREATE INDEX ON accounting.customer_refunds(company_id,credit_line_id);
CREATE INDEX ON accounting.customer_refunds(company_id,advance_id);
CREATE INDEX ON accounting.gst_adjustments(company_id,invoice_line_id);
CREATE INDEX ON accounting.gst_adjustments(company_id,advance_id);
CREATE INDEX ON accounting.gst_adjustments(company_id,adjustment_date);
INSERT INTO identity.permissions(code,description) VALUES('inventory.returns.read','Read returns in assigned warehouses'),('inventory.returns.write','Receive returned stock and cancel uninvoiced delivered quantities'),('sales.credits.read','Read assigned customer credit notes'),('sales.credits.write','Post assigned customer credit notes'),('accounting.refunds.read','Read assigned customer refunds'),('accounting.refunds.write','Record verified outgoing customer refunds');
CREATE FUNCTION identity.seed_return_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code='ADMIN' AND p.code IN ('inventory.returns.read','inventory.returns.write','sales.credits.read','sales.credits.write','accounting.refunds.read','accounting.refunds.write')) OR
 (r.code='WAREHOUSE' AND p.code IN ('inventory.returns.read','inventory.returns.write')) OR
 (r.code='OFFICE' AND p.code IN ('inventory.returns.read','inventory.returns.write','sales.credits.read','sales.credits.write','accounting.refunds.read')) OR
 (r.code='FINANCE' AND p.code IN ('sales.credits.read','sales.credits.write','accounting.refunds.read','accounting.refunds.write')) OR
 (r.code='SALES' AND p.code='sales.credits.read')) ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'SALES_RETURN','RT-'),(c,'CREDIT_NOTE','CN-'),(c,'CUSTOMER_REFUND','RF-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_return_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.return_number(t text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE n bigint;p text;BEGIN IF t NOT IN ('SALES_RETURN','CREDIT_NOTE','CUSTOMER_REFUND') THEN RAISE EXCEPTION 'Invalid return sequence' USING ERRCODE='HR422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=t RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Return sequence missing' USING ERRCODE='HR422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
CREATE FUNCTION accounting.contra_link(p_original uuid,p_journal uuid,p_kind text) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO accounting.reversal_links(company_id,source_batch_id,contra_batch_id,kind)
 SELECT core.current_company(),p_original,posting_batch_id,p_kind FROM accounting.journal_entries WHERE company_id=core.current_company() AND id=p_journal ON CONFLICT DO NOTHING
$$;
CREATE FUNCTION accounting.line_credited(lid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(sum(gross),0) FROM sales.credit_note_lines WHERE company_id=core.current_company() AND invoice_line_id=lid $$;
CREATE FUNCTION accounting.line_refunded(lid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(sum(r.amount),0) FROM accounting.customer_refunds r JOIN sales.credit_note_lines cl ON cl.company_id=r.company_id AND cl.id=r.credit_line_id WHERE cl.company_id=core.current_company() AND cl.invoice_line_id=lid $$;
CREATE FUNCTION accounting.advance_refunded(aid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(sum(amount),0) FROM accounting.customer_refunds WHERE company_id=core.current_company() AND advance_id=aid $$;
CREATE FUNCTION accounting.advance_refund_tax(aid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT coalesce(-sum(gst_amount),0) FROM accounting.gst_adjustments WHERE company_id=core.current_company() AND advance_id=aid AND kind IN ('ADVANCE_REFUND','UNBILLED_RETURN') $$;
CREATE FUNCTION accounting.cash_tax_balance(lid uuid) RETURNS numeric LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT coalesce((SELECT sum(gst_amount) FROM accounting.payment_allocations WHERE company_id=core.current_company() AND invoice_line_id=lid),0)+coalesce((SELECT sum(gst_amount) FROM accounting.gst_adjustments WHERE company_id=core.current_company() AND invoice_line_id=lid AND gst_basis='CASH'),0)
$$;
CREATE FUNCTION inventory.receive_sales_return(p_order uuid,p_warehouse uuid,p_disposition text,p_reason text,items jsonb) RETURNS uuid
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
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.order_line_id AND ad.amount-accounting.advance_refunded(ad.id)>coalesce((SELECT sum(amount) FROM accounting.advance_applications WHERE company_id=c AND advance_id=ad.id),0)) THEN RAISE EXCEPTION 'Refund unapplied advances before cancelling uninvoiced delivery' USING ERRCODE='HR409';END IF;
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
 FOR tax_advance IN SELECT av.*,av.gst_amount-accounting.advance_refund_tax(av.id)-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=c AND g.advance_id=av.id),0) AS pending FROM accounting.customer_advances av WHERE av.company_id=c AND av.order_line_id=l.order_line_id AND av.gst_basis='NON_CASH' ORDER BY av.receipt_id,av.id LOOP
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
CREATE FUNCTION sales.post_credit_note(p_invoice uuid,p_reason text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();cid uuid:=gen_random_uuid();i sales.invoices;today date;entry jsonb;l record;ret inventory.sales_return_lines;
 qty numeric;used numeric;used_n numeric;used_t numeric;n numeric;t numeric;total_n numeric:=0;total_t numeric:=0;built jsonb:='[]';posts jsonb:='[]';no int:=0;lid uuid;ar uuid;revenue uuid;output uuid;orig_batch uuid;j uuid;paid numeric;refunded numeric;cash_tax numeric;target_tax numeric;new_gross numeric;new_tax numeric;
BEGIN
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=p_invoice;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.credits.write',i.customer_id);
 PERFORM 1 FROM platform.documents WHERE company_id=c AND id=i.order_id FOR UPDATE;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=i.customer_id FOR UPDATE;PERFORM 1 FROM sales.lock_credit(i.customer_id);
 SELECT (now() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c FOR SHARE;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit note requires open period' USING ERRCODE='HR422';END IF;
 IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) v GROUP BY v->>'invoiceLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Credit requires reason and distinct invoice lines' USING ERRCODE='HR422';END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) ORDER BY value->>'invoiceLineId' LOOP
 SELECT il.*,ol.item_type INTO l FROM sales.invoice_lines il JOIN sales.order_lines ol ON ol.company_id=il.company_id AND ol.id=il.order_line_id WHERE il.company_id=c AND il.invoice_id=p_invoice AND il.id=(entry->>'invoiceLineId')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Credit invoice line unavailable' USING ERRCODE='HT404';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Credit quantity violates frozen sales step' USING ERRCODE='HR422';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO used,used_n,used_t FROM sales.credit_note_lines WHERE company_id=c AND invoice_line_id=l.id;
 IF qty+used>l.quantity THEN RAISE EXCEPTION 'Credit exceeds invoice quantity' USING ERRCODE='HR409';END IF;
 IF l.item_type='STOCK' THEN
 SELECT * INTO ret FROM inventory.sales_return_lines WHERE company_id=c AND id=nullif(entry->>'returnLineId','')::uuid AND invoice_line_id=l.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock credit requires matching received return' USING ERRCODE='HR422';END IF;
 IF qty>ret.quantity-coalesce((SELECT sum(quantity) FROM sales.credit_note_lines WHERE company_id=c AND return_line_id=ret.id),0) THEN RAISE EXCEPTION 'Return already credited or quantity exceeds return' USING ERRCODE='HR409';END IF;
 ELSIF nullif(entry->>'returnLineId','') IS NOT NULL THEN RAISE EXCEPTION 'Non-stock credit must not reference stock return' USING ERRCODE='HR422';END IF;
 n:=round(l.net*(used+qty)/l.quantity,2)-used_n;t:=round(l.tax*(used+qty)/l.quantity,2)-used_t;
 built:=built||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'invoiceLineId',l.id,'returnLineId',nullif(entry->>'returnLineId',''),'quantity',qty,'net',n,'tax',t));total_n:=total_n+n;total_t:=total_t+t;
 END LOOP;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(cid,c,'CREDIT_NOTE',accounting.return_number('CREDIT_NOTE'),today,'CONFIRMED',a);
 INSERT INTO sales.credit_notes(id,company_id,invoice_id,reason,net,tax,gross,created_by) VALUES(cid,c,p_invoice,trim(p_reason),total_n,total_t,total_n+total_t,a);
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
 INSERT INTO sales.credit_note_lines(id,company_id,credit_note_id,invoice_line_id,return_line_id,quantity,net,tax,gross) VALUES(lid,c,cid,l.id,(entry->>'returnLineId')::uuid,(entry->>'quantity')::numeric,n,t,n+t);
 IF t>0 THEN SELECT output_account_id INTO output FROM accounting.sales_gst_entries WHERE company_id=c AND invoice_line_id=l.id;
 IF output IS NULL THEN RAISE EXCEPTION 'Original GST journal mapping missing' USING ERRCODE='HR422';END IF;posts:=posts||jsonb_build_array(jsonb_build_object('accountId',output,'debit',t,'sourceLineId',lid));END IF;
 IF i.gst_basis='NON_CASH' THEN
 INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_NOTE','NON_CASH',today,l.tax_code_id,-n-t,-t);
 ELSE
 SELECT coalesce(sum(amount),0) INTO paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=l.id;refunded:=accounting.line_refunded(l.id);
 new_gross:=l.gross-accounting.line_credited(l.id);SELECT l.tax-coalesce(sum(cl.tax),0) INTO new_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid-refunded<=new_gross THEN
 cash_tax:=accounting.cash_tax_balance(l.id);target_tax:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-refunded)/new_gross,2) END;
 IF target_tax<>cash_tax THEN INSERT INTO accounting.gst_adjustments(company_id,source_document_id,invoice_line_id,credit_line_id,kind,gst_basis,adjustment_date,tax_code_id,amount,gst_amount) VALUES(c,cid,l.id,lid,'CREDIT_REBASE','CASH',today,l.tax_code_id,0,target_tax-cash_tax);END IF;
 END IF;END IF;
 END LOOP;
 IF total_n+total_t>0 THEN j:=accounting.post_journal(cid,1,'CREDIT_NOTE',today,'Sales credit / adjustment note',posts);PERFORM accounting.contra_link(orig_batch,j,'CREDIT_NOTE');END IF;
 UPDATE crm.customer_credit_exposures SET receivable=receivable-total_n-total_t WHERE company_id=c AND customer_id=i.customer_id;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=cid;UPDATE platform.documents SET state=state WHERE company_id=c AND id=i.order_id;RETURN cid;
END $$;
CREATE FUNCTION accounting.post_customer_refund(p_credit_line uuid,p_advance uuid,p_amount numeric,p_reference text,p_reason text,p_cancel_order boolean DEFAULT false) RETURNS uuid
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
 SELECT * INTO ad FROM accounting.customer_advances WHERE company_id=c AND id=p_advance;
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
 bank:=accounting.settlement_account('BANK','ASSET','BANK');posts:=jsonb_build_array(jsonb_build_object('accountId',bank,'credit',p_amount));
 IF p_credit_line IS NOT NULL THEN
 SELECT coalesce(sum(amount),0) INTO paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=il.id;
 SELECT coalesce(sum(amount),0) INTO note_refunds FROM accounting.customer_refunds WHERE company_id=c AND credit_line_id=cl.id;old_refunds:=accounting.line_refunded(il.id);
 IF p_amount>cl.gross-note_refunds OR p_amount>paid+accounting.line_credited(il.id)-il.gross-old_refunds OR p_amount>greatest(0,-ex.receivable) THEN RAISE EXCEPTION 'Refund exceeds source payments, credit or customer net credit balance' USING ERRCODE='HR409';END IF;
 SELECT jl.account_id INTO ar FROM accounting.journal_lines jl JOIN accounting.journal_entries je ON je.company_id=jl.company_id AND je.id=jl.journal_entry_id JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id JOIN accounting.accounts ac ON ac.company_id=jl.company_id AND ac.id=jl.account_id WHERE pb.company_id=c AND pb.source_document_id=cl.credit_note_id AND pb.posting_kind='CREDIT_NOTE' AND ac.control_kind='AR' AND jl.credit>0 LIMIT 1;
 IF ar IS NULL THEN RAISE EXCEPTION 'Original credit AR journal missing' USING ERRCODE='HR422';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',i.party_id,'debit',p_amount));
 IF i.gst_basis='CASH' THEN
 cash_tax:=accounting.cash_tax_balance(il.id);new_gross:=il.gross-accounting.line_credited(il.id);SELECT il.tax-coalesce(sum(v.tax),0) INTO new_tax FROM sales.credit_note_lines v WHERE v.company_id=c AND v.invoice_line_id=il.id;
 IF paid-old_refunds-p_amount<=new_gross THEN desired:=CASE WHEN new_gross=0 THEN 0 ELSE round(new_tax*(paid-old_refunds-p_amount)/new_gross,2) END;
 ELSE desired:=greatest(0,cash_tax-(round(il.tax*(old_refunds+p_amount)/il.gross,2)-round(il.tax*old_refunds/il.gross,2)));END IF;
 tax_refund:=greatest(0,cash_tax-desired);END IF;
 ELSE
 SELECT coalesce(sum(amount),0),coalesce(sum(consumed_gst),0) INTO used,used_tax FROM accounting.advance_applications WHERE company_id=c AND advance_id=ad.id;
 old_refunds:=accounting.advance_refunded(ad.id);available:=ad.amount-used-old_refunds;
 IF p_amount>available THEN RAISE EXCEPTION 'Advance already applied/refunded or insufficient' USING ERRCODE='HR409';END IF;
 IF NOT p_cancel_order AND greatest(0,ex.receivable+ex.unbilled_orders-ex.available_advances+p_amount)>customer.credit_limit THEN RAISE EXCEPTION 'Refund removes required order funding; cancel unfulfilled order or resolve credit first' USING ERRCODE='HR409';END IF;
 IF p_cancel_order AND (EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=c AND order_id=oid) OR EXISTS(SELECT 1 FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND sr.consumed_quantity>0)) THEN RAISE EXCEPTION 'Only wholly unfulfilled uninvoiced order can be cancelled with advance refund' USING ERRCODE='HR409';END IF;
 posts:=posts||jsonb_build_array(jsonb_build_object('accountId',ad.advance_account_id,'debit',p_amount));
 IF ad.gst_basis='CASH' THEN tax_refund:=round(ad.gst_amount*(used+old_refunds+p_amount)/ad.amount,2)-used_tax-accounting.advance_refund_tax(ad.id);END IF;
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
 FOR other IN SELECT av.* FROM accounting.customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY av.id LOOP
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
 IF EXISTS(SELECT 1 FROM accounting.customer_advances av JOIN sales.order_lines ol ON ol.company_id=av.company_id AND ol.id=av.order_line_id WHERE ol.company_id=c AND ol.order_id=oid AND av.amount-accounting.advance_refunded(av.id)>coalesce((SELECT sum(amount) FROM accounting.advance_applications WHERE company_id=c AND advance_id=av.id),0)) THEN RAISE EXCEPTION 'Refund all remaining advances before cancelling order' USING ERRCODE='HR409';END IF;
 FOR other IN SELECT DISTINCT b.product_id,o.warehouse_id FROM inventory.stock_reservations sr JOIN sales.order_lines ol ON ol.company_id=sr.company_id AND ol.id=sr.order_line_id JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN inventory.stock_balances b ON b.company_id=sr.company_id AND b.id=sr.stock_balance_id WHERE ol.company_id=c AND ol.order_id=oid ORDER BY b.product_id LOOP PERFORM 1 FROM inventory.lock_balance(other.warehouse_id,other.product_id);END LOOP;
 UPDATE inventory.stock_reservations SET released_quantity=quantity WHERE company_id=c AND order_line_id IN(SELECT id FROM sales.order_lines WHERE company_id=c AND order_id=oid);
 UPDATE sales.credit_commitments SET released_amount=amount WHERE company_id=c AND order_id=oid;UPDATE sales.orders SET cancelled_at=now(),cancel_reason=trim(p_reason) WHERE company_id=c AND id=oid;
 UPDATE platform.documents SET state='CANCELLED' WHERE company_id=c AND id=oid;
 END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=fid;RETURN fid;
END $$;

-- Upgrade existing business primitives without changing historical migration files.


CREATE OR REPLACE FUNCTION sales.post_invoice(p_order uuid,p_expected bigint,p_lines jsonb,p_reference text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();o sales.orders;d platform.documents;customer crm.customers;company core.companies;
 iid uuid:=gen_random_uuid();line_id uuid;today date;num bigint;prefix text;l record;x jsonb;built jsonb:='[]';postings jsonb:='[]';
 qty numeric;base_qty numeric;used_qty numeric;used_net numeric;used_tax numeric;delivered numeric;n numeric;t numeric;
 total_net numeric:=0;total_tax numeric:=0;total_gross numeric;taxcode uuid;ar uuid;revenue uuid;output uuid;j uuid;line_no int:=0;
BEGIN
 SELECT * INTO o FROM sales.orders WHERE company_id=c AND sales.orders.id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order missing' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('sales.invoices.write',o.customer_id);
 -- Same lock order as dispatch/cancellation, then the shared customer exposure lock.
 SELECT * INTO d FROM platform.documents WHERE company_id=c AND platform.documents.id=p_order FOR UPDATE;
 IF p_expected IS NULL OR p_expected<1 OR d.version<>p_expected THEN RAISE EXCEPTION 'Order version changed' USING ERRCODE='HT409';END IF;
 IF d.state<>'CONFIRMED' THEN RAISE EXCEPTION 'Only confirmed orders can be invoiced' USING ERRCODE='HT409';END IF;
 SELECT * INTO customer FROM crm.customers WHERE company_id=c AND crm.customers.id=o.customer_id FOR UPDATE;
 PERFORM 1 FROM sales.lock_credit(o.customer_id);
 IF NOT FOUND THEN RAISE EXCEPTION 'Customer credit projection is missing' USING ERRCODE='HT422';END IF;
 SELECT * INTO company FROM core.companies WHERE core.companies.id=c FOR SHARE;
 today:=(now() AT TIME ZONE company.timezone)::date;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice date requires an open accounting period' USING ERRCODE='HT422';END IF;
 IF p_lines IS NULL OR jsonb_typeof(p_lines)<>'array' OR jsonb_array_length(p_lines) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Supply 1..50 distinct order lines' USING ERRCODE='HT422';END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) z GROUP BY z->>'orderLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate invoice order line' USING ERRCODE='HT422';END IF;
 IF p_reference IS NOT NULL AND length(trim(p_reference)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid fulfilment reference' USING ERRCODE='HT422';END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(p_lines) ORDER BY value->>'orderLineId' LOOP
 SELECT ol.*,ql.tax_rate,ql.snapshot->>'taxCode' AS tax_code FROM sales.order_lines ol JOIN sales.quote_lines ql ON ql.company_id=ol.company_id AND ql.id=ol.source_quote_line_id
 WHERE ol.company_id=c AND ol.order_id=p_order AND ol.id=(x->>'orderLineId')::uuid INTO l;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order line unavailable' USING ERRCODE='HT404';END IF;
 qty:=(x->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Invalid invoice quantity or step' USING ERRCODE='HT422';END IF;
 SELECT coalesce(sum(consumed.q),0),coalesce(sum(consumed.n),0),coalesce(sum(consumed.t),0) INTO used_qty,used_net,used_tax FROM (
 SELECT quantity q,net n,tax t FROM sales.invoice_lines WHERE company_id=c AND order_line_id=l.id UNION ALL
 SELECT quantity,cancelled_net,cancelled_tax FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.id AND invoice_line_id IS NULL) consumed;
 IF l.item_type='STOCK' THEN
 SELECT coalesce(sum(pl.quantity),0) INTO delivered FROM inventory.pick_lines pl JOIN inventory.picks p ON p.company_id=pl.company_id AND p.id=pl.pick_id WHERE pl.company_id=c AND pl.order_line_id=l.id AND p.state='DISPATCHED';
 ELSE
 IF p_reference IS NULL THEN RAISE EXCEPTION 'Non-stock/service invoicing requires office fulfilment reference' USING ERRCODE='HT422';END IF;
 delivered:=l.quantity;
 END IF;
 IF qty+used_qty>least(delivered,l.quantity) THEN RAISE EXCEPTION 'Quantity exceeds delivered uninvoiced remainder' USING ERRCODE='HT409';END IF;
 base_qty:=qty*l.base_quantity/l.quantity;
 IF base_qty<>round(base_qty,6) THEN RAISE EXCEPTION 'Quantity cannot be represented in base units' USING ERRCODE='HT422';END IF;
 -- Cumulative allocation preserves exact approved net/tax, including the final cent.
 n:=round(l.net*(used_qty+qty)/l.quantity,2)-used_net;t:=round(l.tax*(used_qty+qty)/l.quantity,2)-used_tax;
 IF l.tax_rate>0 AND NOT company.gst_registered THEN RAISE EXCEPTION 'Verify company GST registration before taxable invoicing' USING ERRCODE='HT422';END IF;
 SELECT tc.id INTO taxcode FROM accounting.tax_codes tc WHERE tc.company_id=c AND tc.code=l.tax_code;
 IF NOT FOUND THEN RAISE EXCEPTION 'Frozen order tax code is missing' USING ERRCODE='HT422';END IF;
 output:=NULL;
 IF t>0 THEN
 SELECT m.output_account_id INTO output FROM accounting.tax_account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.output_account_id AND ac.active AND ac.kind='LIABILITY' AND ac.control_kind='GST'
 WHERE m.company_id=c AND m.tax_code_id=taxcode FOR SHARE OF m,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'GST output account mapping is invalid' USING ERRCODE='HT422';END IF;
 END IF;
 built:=built||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'orderLineId',l.id,'quantity',qty,'baseQuantity',base_qty,'net',n,'tax',t,'taxCodeId',taxcode,'taxRate',l.tax_rate,'outputAccountId',output,'snapshot',l.snapshot));
 total_net:=total_net+n;total_tax:=total_tax+t;
 END LOOP;
 total_gross:=total_net+total_tax;
 IF total_gross>0 THEN
 SELECT m.account_id INTO ar FROM accounting.account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.account_id AND ac.active AND ac.kind='ASSET' AND ac.control_kind='AR' WHERE m.company_id=c AND m.purpose='AR' FOR SHARE OF m,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'AR mapping is invalid' USING ERRCODE='HT422';END IF;
 END IF;
 IF total_net>0 THEN
 SELECT m.account_id INTO revenue FROM accounting.account_mappings m JOIN accounting.accounts ac ON ac.company_id=m.company_id AND ac.id=m.account_id AND ac.active AND ac.kind='REVENUE' WHERE m.company_id=c AND m.purpose='REVENUE' FOR SHARE OF m,ac;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revenue mapping is invalid' USING ERRCODE='HT422';END IF;
 END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=c AND document_type='INVOICE' RETURNING next_value-1,platform.document_sequences.prefix INTO num,prefix;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice sequence missing' USING ERRCODE='HT422';END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(iid,c,'INVOICE',prefix||lpad(num::text,greatest(6,length(num::text)),'0'),today,'CONFIRMED',a);
 INSERT INTO sales.invoices(id,company_id,order_id,customer_id,party_id,invoice_date,due_on,title,issuer_snapshot,customer_snapshot,gst_basis,fulfilment_reference,net,tax,gross,created_by)
 VALUES(iid,c,p_order,o.customer_id,customer.party_id,today,today+customer.payment_terms_days,CASE WHEN company.gst_registered THEN 'TAX_INVOICE' ELSE 'INVOICE' END,jsonb_build_object('name',company.name,'abn',company.abn,'country',company.country,'currency',company.base_currency,'gstRegistered',company.gst_registered),o.customer_snapshot,company.gst_basis,p_reference,total_net,total_tax,total_gross,a);
 IF total_gross>0 THEN postings:=jsonb_build_array(jsonb_build_object('accountId',ar,'partyId',customer.party_id,'debit',total_gross));END IF;
 IF total_net>0 THEN postings:=postings||jsonb_build_array(jsonb_build_object('accountId',revenue,'credit',total_net));END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(built) LOOP
 line_id:=(x->>'id')::uuid;line_no:=line_no+1;
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(line_id,c,iid,line_no,a);
 INSERT INTO sales.invoice_lines(id,company_id,invoice_id,order_line_id,quantity,base_quantity,net,tax,gross,tax_code_id,tax_rate,snapshot)
 VALUES(line_id,c,iid,(x->>'orderLineId')::uuid,(x->>'quantity')::numeric,(x->>'baseQuantity')::numeric,(x->>'net')::numeric,(x->>'tax')::numeric,(x->>'net')::numeric+(x->>'tax')::numeric,(x->>'taxCodeId')::uuid,(x->>'taxRate')::numeric,x->'snapshot');
 INSERT INTO accounting.sales_gst_entries(company_id,invoice_line_id,gst_basis,tax_code_id,tax_rate,net,tax,output_account_id,created_by)
 VALUES(c,line_id,company.gst_basis,(x->>'taxCodeId')::uuid,(x->>'taxRate')::numeric,(x->>'net')::numeric,(x->>'tax')::numeric,(x->>'outputAccountId')::uuid,a);
 IF (x->>'tax')::numeric>0 THEN postings:=postings||jsonb_build_array(jsonb_build_object('accountId',(x->>'outputAccountId')::uuid,'credit',(x->>'tax')::numeric,'sourceLineId',line_id));END IF;
 END LOOP;
 IF total_gross>0 THEN j:=accounting.post_journal(iid,1,'SALES_INVOICE',today,'Sales invoice',postings);END IF;
 INSERT INTO accounting.receivable_items(company_id,invoice_id,customer_id,party_id,amount,due_on,journal_entry_id,created_by) VALUES(c,iid,o.customer_id,customer.party_id,total_gross,today+customer.payment_terms_days,j,a);
 UPDATE crm.customer_credit_exposures SET receivable=receivable+total_gross WHERE company_id=c AND customer_id=o.customer_id;
 UPDATE sales.credit_commitments SET released_amount=released_amount+total_gross WHERE company_id=c AND order_id=p_order AND amount-released_amount>=total_gross;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order credit commitment is missing or insufficient' USING ERRCODE='HT422';END IF;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND platform.documents.id=iid;
 UPDATE platform.documents SET state=state WHERE company_id=c AND platform.documents.id=p_order;
 RETURN iid;
END $$;

CREATE OR REPLACE FUNCTION sales.validate_invoice_credit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE released numeric;invoiced numeric;docstate text;amount numeric;BEGIN
 SELECT d.state,cc.amount,cc.released_amount INTO docstate,amount,released FROM sales.credit_commitments cc JOIN platform.documents d ON d.company_id=cc.company_id AND d.id=cc.order_id WHERE cc.company_id=NEW.company_id AND cc.order_id=NEW.order_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order credit commitment is missing' USING ERRCODE='23514';END IF;
 SELECT coalesce(sum(v),0) INTO invoiced FROM (
 SELECT gross v FROM sales.invoices WHERE company_id=NEW.company_id AND order_id=NEW.order_id UNION ALL
 SELECT rl.cancelled_gross FROM inventory.sales_return_lines rl JOIN inventory.sales_returns r ON r.company_id=rl.company_id AND r.id=rl.return_id WHERE r.company_id=NEW.company_id AND r.order_id=NEW.order_id AND rl.invoice_line_id IS NULL) consumed;
 IF (docstate='CANCELLED' AND (invoiced<>0 OR released<>amount)) OR (docstate<>'CANCELLED' AND released<>invoiced) THEN RAISE EXCEPTION 'Credit release must match invoicing or whole-order cancellation' USING ERRCODE='23514';END IF;RETURN NULL;END $$;

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
 SELECT coalesce(sum(amount),0),coalesce(sum(gst_amount),0) INTO paid,tax_paid FROM accounting.payment_allocations WHERE company_id=c AND invoice_line_id=l.id;
 paid:=paid-accounting.line_refunded(l.id);charge:=l.gross-accounting.line_credited(l.id);
 SELECT l.tax-coalesce(sum(cl.tax),0) INTO charge_tax FROM sales.credit_note_lines cl WHERE cl.company_id=c AND cl.invoice_line_id=l.id;
 IF paid+v>charge THEN RAISE EXCEPTION 'Allocation exceeds invoice balance' USING ERRCODE='HR409';END IF;
 t:=greatest(0,round(charge_tax*(paid+v)/charge,2)-CASE WHEN l.gst_basis='CASH' THEN accounting.cash_tax_balance(l.id) ELSE tax_paid END);
 INSERT INTO accounting.payment_allocations(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,v,t);
 IF l.gst_basis='CASH' THEN
 INSERT INTO accounting.gst_attributions(company_id,source_document_id,receipt_id,advance_id,invoice_line_id,kind,gst_basis,attribution_date,tax_code_id,amount,gst_amount) VALUES(c,doc,rid,aid,l.id,CASE WHEN aid IS NULL THEN 'CASH_RECEIPT' ELSE 'ADVANCE_APPLIED' END,'CASH',cash_date,l.tax_code_id,v,t);
 END IF;total_tax:=total_tax+t;
 END LOOP;RETURN total_tax;END $$;

CREATE OR REPLACE FUNCTION accounting.post_receipt(cust uuid,p_amount numeric,p_method text,p_reference text,p_date date,items jsonb,prepayments jsonb) RETURNS uuid
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
 SELECT coalesce(sum(ad.amount-accounting.advance_refunded(ad.id)-coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=ad.company_id AND ap.advance_id=ad.id),0)),0),coalesce(sum(ad.amount-accounting.advance_refunded(ad.id)),0),coalesce(sum(ad.gst_amount-accounting.advance_refund_tax(ad.id)),0) INTO remaining,prior_amount,prior_tax FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id;
 IF v>l.gross-billed-remaining-coalesce((SELECT sum(cancelled_gross) FROM inventory.sales_return_lines WHERE company_id=c AND order_line_id=l.id AND invoice_line_id IS NULL),0) THEN RAISE EXCEPTION 'Advance exceeds unfunded uninvoiced order balance' USING ERRCODE='HR409';END IF;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=c AND ad.order_line_id=l.id AND ad.gst_basis<>company.gst_basis) THEN RAISE EXCEPTION 'GST basis transition requires tax review' USING ERRCODE='HR422';END IF;
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

CREATE OR REPLACE FUNCTION accounting.apply_advance(p_advance uuid,p_reference text,items jsonb) RETURNS uuid
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
 used:=used+accounting.advance_refunded(ad.id);previous_gst:=previous_gst+accounting.advance_refund_tax(ad.id);
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

CREATE OR REPLACE FUNCTION accounting.invoice_gst_attribution() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=NEW.company_id;i sales.invoices;il sales.invoice_lines;ad record;remaining numeric;v numeric;cleared numeric:=0;posts jsonb:='[]';docversion bigint;
BEGIN
 SELECT * INTO il FROM sales.invoice_lines WHERE company_id=c AND id=NEW.invoice_line_id;
 SELECT * INTO i FROM sales.invoices WHERE company_id=c AND id=il.invoice_id;
 IF EXISTS(SELECT 1 FROM accounting.customer_advances WHERE company_id=c AND order_line_id=il.order_line_id AND gst_basis<>i.gst_basis) THEN RAISE EXCEPTION 'Prepayment tax basis transition requires review' USING ERRCODE='HR422';END IF;
 IF i.gst_basis='NON_CASH' THEN
 remaining:=NEW.tax;
 FOR ad IN SELECT a.*,a.gst_amount-accounting.advance_refund_tax(a.id)-coalesce((SELECT sum(g.gst_amount) FROM accounting.advance_gst_clearings g WHERE g.company_id=a.company_id AND g.advance_id=a.id),0) AS pending FROM accounting.customer_advances a WHERE a.company_id=c AND a.order_line_id=il.order_line_id AND a.gst_basis='NON_CASH' ORDER BY a.receipt_id,a.id LOOP
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

CREATE OR REPLACE FUNCTION accounting.guard_settlement_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='POSTED' AND (EXISTS(SELECT 1 FROM accounting.customer_receipts WHERE company_id=OLD.company_id AND id=OLD.id) OR EXISTS(SELECT 1 FROM accounting.advance_applications WHERE company_id=OLD.company_id AND id=OLD.id)) THEN RAISE EXCEPTION 'Posted settlement document is immutable' USING ERRCODE='23514';END IF;
 IF NEW.state='CANCELLED' AND OLD.document_type='SALES_ORDER' AND EXISTS(SELECT 1 FROM accounting.customer_advances a JOIN sales.order_lines l ON l.company_id=a.company_id AND l.id=a.order_line_id WHERE l.company_id=OLD.company_id AND l.order_id=OLD.id AND a.amount-accounting.advance_refunded(a.id)>coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)) THEN RAISE EXCEPTION 'Prepaid order requires an advance refund workflow' USING ERRCODE='HR409';END IF;RETURN NEW;END $$;

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
 IF EXISTS(SELECT 1 FROM accounting.customer_advances ad WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id AND ad.amount-accounting.advance_refunded(ad.id)<coalesce((SELECT sum(amount) FROM accounting.advance_applications WHERE company_id=ad.company_id AND advance_id=ad.id),0)) THEN RAISE EXCEPTION 'Advance overallocated' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM accounting.payment_allocations pa JOIN sales.invoice_lines il ON il.company_id=pa.company_id AND il.id=pa.invoice_line_id WHERE pa.company_id=r.company_id AND pa.receipt_id=r.id AND il.gross<(SELECT sum(amount) FROM accounting.payment_allocations WHERE company_id=il.company_id AND invoice_line_id=il.id)) THEN RAISE EXCEPTION 'Invoice overallocated' USING ERRCODE='23514';END IF;
 FOR ap IN SELECT aa.* FROM accounting.advance_applications aa JOIN accounting.customer_advances ad ON ad.company_id=aa.company_id AND ad.id=aa.advance_id WHERE ad.company_id=r.company_id AND ad.receipt_id=r.id LOOP
 SELECT coalesce(sum(amount),0) INTO v FROM accounting.payment_allocations WHERE company_id=ap.company_id AND source_document_id=ap.id AND advance_id=ap.advance_id;
 IF v<>ap.amount OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=ap.company_id AND id=ap.id AND state='POSTED') THEN RAISE EXCEPTION 'Application split/state mismatch' USING ERRCODE='23514';END IF;END LOOP;
 RETURN NULL;END $$;
CREATE FUNCTION accounting.guard_contra_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='POSTED' AND (EXISTS(SELECT 1 FROM inventory.sales_returns WHERE company_id=OLD.company_id AND id=OLD.id) OR EXISTS(SELECT 1 FROM sales.credit_notes WHERE company_id=OLD.company_id AND id=OLD.id) OR EXISTS(SELECT 1 FROM accounting.customer_refunds WHERE company_id=OLD.company_id AND id=OLD.id)) THEN RAISE EXCEPTION 'Posted contra document is immutable' USING ERRCODE='23514';END IF;RETURN NEW;END $$;
CREATE TRIGGER contra_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION accounting.guard_contra_documents();
CREATE FUNCTION accounting.validate_contra_document() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v numeric;n numeric;t numeric;doc uuid;BEGIN
 IF TG_TABLE_NAME='credit_notes' THEN
 doc:=NEW.id;SELECT coalesce(sum(net),0),coalesce(sum(tax),0),count(*) INTO n,t,v FROM sales.credit_note_lines WHERE company_id=NEW.company_id AND credit_note_id=doc;
 IF v=0 OR (n,t) IS DISTINCT FROM (NEW.net,NEW.tax) THEN RAISE EXCEPTION 'Credit note line totals mismatch' USING ERRCODE='23514';END IF;
 ELSIF TG_TABLE_NAME='sales_returns' THEN doc:=NEW.id;
 IF NOT EXISTS(SELECT 1 FROM inventory.sales_return_lines WHERE company_id=NEW.company_id AND return_id=doc) THEN RAISE EXCEPTION 'Return requires lines' USING ERRCODE='23514';END IF;
 ELSE doc:=NEW.id;END IF;
 IF NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=doc AND state='POSTED') THEN RAISE EXCEPTION 'Contra transaction must be posted atomically' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER contra_consistency AFTER INSERT ON sales.credit_notes DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_contra_document();
CREATE CONSTRAINT TRIGGER contra_consistency AFTER INSERT ON inventory.sales_returns DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_contra_document();
CREATE CONSTRAINT TRIGGER contra_consistency AFTER INSERT ON accounting.customer_refunds DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION accounting.validate_contra_document();
REVOKE ALL ON FUNCTION identity.seed_return_roles(uuid),accounting.return_number(text),accounting.contra_link(uuid,uuid,text),accounting.line_credited(uuid),accounting.line_refunded(uuid),accounting.advance_refunded(uuid),accounting.advance_refund_tax(uuid),accounting.cash_tax_balance(uuid),inventory.receive_sales_return(uuid,uuid,text,text,jsonb),sales.post_credit_note(uuid,text,jsonb),accounting.post_customer_refund(uuid,uuid,numeric,text,text,boolean),accounting.guard_contra_documents(),accounting.validate_contra_document() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.receive_sales_return(uuid,uuid,text,text,jsonb),sales.post_credit_note(uuid,text,jsonb),accounting.post_customer_refund(uuid,uuid,numeric,text,text,boolean),accounting.line_credited(uuid),accounting.line_refunded(uuid),accounting.advance_refunded(uuid) TO htt_app;
GRANT SELECT ON inventory.sales_returns,inventory.sales_return_lines,sales.credit_notes,sales.credit_note_lines,accounting.customer_refunds,accounting.gst_adjustments,accounting.reversal_links TO htt_app;
