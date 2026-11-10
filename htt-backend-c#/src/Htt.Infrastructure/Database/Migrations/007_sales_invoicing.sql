-- Explicit registration is required before issuing a GST tax invoice; existing quotes are not evidence of registration.
ALTER TABLE core.companies ADD COLUMN gst_registered boolean NOT NULL DEFAULT false;
ALTER TABLE core.companies ADD CONSTRAINT registered_company_abn CHECK(NOT gst_registered OR (abn IS NOT NULL AND core.valid_abn(abn)));
CREATE TABLE sales.invoices (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),order_id uuid NOT NULL,customer_id uuid NOT NULL,party_id uuid NOT NULL,
 invoice_date date NOT NULL,due_on date NOT NULL CHECK(due_on>=invoice_date),title text NOT NULL CHECK(title IN ('INVOICE','TAX_INVOICE')),
 issuer_snapshot jsonb NOT NULL,customer_snapshot jsonb NOT NULL,gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),
 fulfilment_reference text,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,id,customer_id),
 FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),
 FOREIGN KEY(company_id,order_id,customer_id) REFERENCES sales.orders(company_id,id,customer_id),
 FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id)
);
CREATE TABLE sales.invoice_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),invoice_id uuid NOT NULL,order_line_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),
 net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),
 tax_code_id uuid NOT NULL,tax_rate numeric(9,6) NOT NULL CHECK(tax_rate BETWEEN 0 AND 1),snapshot jsonb NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,invoice_id,order_line_id),
 FOREIGN KEY(company_id,id,invoice_id) REFERENCES platform.document_lines(company_id,id,document_id),
 FOREIGN KEY(company_id,invoice_id) REFERENCES sales.invoices(company_id,id),
 FOREIGN KEY(company_id,order_line_id) REFERENCES sales.order_lines(company_id,id),
 FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id)
);
CREATE TABLE accounting.receivable_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),invoice_id uuid NOT NULL,customer_id uuid NOT NULL,party_id uuid NOT NULL,
 amount numeric(20,2) NOT NULL CHECK(amount>=0),due_on date NOT NULL,journal_entry_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,invoice_id),
 FOREIGN KEY(company_id,invoice_id,customer_id) REFERENCES sales.invoices(company_id,id,customer_id),
 FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),
 FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id)
);
-- Invoice tax subledger, not a BAS attribution/return. CASH reporting requires future payment allocations.
CREATE TABLE accounting.sales_gst_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),invoice_line_id uuid NOT NULL,
 gst_basis text NOT NULL CHECK(gst_basis IN ('CASH','NON_CASH')),tax_code_id uuid NOT NULL,tax_rate numeric(9,6) NOT NULL,
 net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),output_account_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,invoice_line_id),
 FOREIGN KEY(company_id,invoice_line_id) REFERENCES sales.invoice_lines(company_id,id),
 FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id),
 FOREIGN KEY(company_id,output_account_id) REFERENCES accounting.accounts(company_id,id),CHECK(tax=0 OR output_account_id IS NOT NULL)
);
DO $$ DECLARE t text;sc text;BEGIN
 FOR sc,t IN SELECT * FROM (VALUES('sales','invoices'),('sales','invoice_lines'),('accounting','receivable_items'),('accounting','sales_gst_entries')) v(s,t) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,t);
 EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,t);
 EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,t);
 EXECUTE format('CREATE INDEX ON %I.%I(company_id)',sc,t);
 EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',sc,t);
 END LOOP;END $$;
CREATE INDEX ON sales.invoices(company_id,order_id);
CREATE INDEX ON sales.invoices(company_id,customer_id,invoice_date);
CREATE INDEX ON sales.invoice_lines(company_id,order_line_id);
CREATE INDEX ON accounting.receivable_items(company_id,customer_id,due_on);

INSERT INTO identity.permissions(code,description) VALUES
 ('sales.invoices.read','Read invoices for authorized customers'),('sales.invoices.write','Issue and post invoices for authorized customers'),
 ('accounting.receivables.read','Read authorized customer receivables and invoice GST'),('accounting.tax.configure','Owner CLI configure verified company GST registration');
CREATE FUNCTION identity.seed_invoicing_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code IN ('ADMIN','FINANCE') AND p.code IN ('sales.invoices.read','sales.invoices.write','accounting.receivables.read','accounting.tax.configure')) OR
 (r.code='OFFICE' AND p.code IN ('sales.invoices.read','sales.invoices.write','accounting.receivables.read')) OR
 (r.code='SALES' AND p.code='sales.invoices.read')) ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'INVOICE','INV-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP
 PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_invoicing_roles(c);
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION sales.require_customer_access(p_permission text,p_customer uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE m uuid;all_customers boolean;allowed boolean;
BEGIN
 SELECT mb.id,bool_or(rp.permission_code='customers.all'),bool_or(rp.permission_code=p_permission) INTO m,all_customers,allowed
 FROM identity.memberships mb JOIN identity.users u ON u.id=mb.user_id AND u.active
 JOIN identity.membership_roles mr ON mr.company_id=mb.company_id AND mr.membership_id=mb.id
 JOIN identity.role_permissions rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id
 WHERE mb.company_id=core.current_company() AND mb.user_id=core.current_actor() AND mb.active GROUP BY mb.id;
 IF NOT coalesce(allowed,false) OR (NOT coalesce(all_customers,false) AND NOT EXISTS(SELECT 1 FROM identity.customer_assignments WHERE company_id=core.current_company() AND membership_id=m AND customer_id=p_customer)) THEN
 RAISE EXCEPTION 'Customer permission denied' USING ERRCODE='42501';END IF;
END $$;

CREATE FUNCTION sales.post_invoice(p_order uuid,p_expected bigint,p_lines jsonb,p_reference text) RETURNS uuid
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
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO used_qty,used_net,used_tax FROM sales.invoice_lines WHERE company_id=c AND order_line_id=l.id;
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

CREATE FUNCTION sales.validate_invoice() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE i sales.invoices;n bigint;v numeric;t numeric;g numeric;
BEGIN
 IF TG_TABLE_NAME='invoices' THEN SELECT * INTO i FROM sales.invoices WHERE company_id=NEW.company_id AND id=NEW.id;
 ELSE SELECT * INTO i FROM sales.invoices WHERE company_id=NEW.company_id AND id=NEW.invoice_id;END IF;
 SELECT count(*),sum(net),sum(tax),sum(gross) INTO n,v,t,g FROM sales.invoice_lines WHERE company_id=i.company_id AND invoice_id=i.id;
 IF n=0 OR (i.net,i.tax,i.gross) IS DISTINCT FROM (v,t,g) OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=i.company_id AND id=i.id AND document_type='INVOICE' AND state='POSTED' AND business_date=i.invoice_date) THEN RAISE EXCEPTION 'Invoice totals or document state inconsistent' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT 1 FROM accounting.receivable_items r WHERE r.company_id=i.company_id AND r.invoice_id=i.id AND r.customer_id=i.customer_id AND r.party_id=i.party_id AND r.amount=i.gross AND r.due_on=i.due_on AND (i.gross=0 OR EXISTS(SELECT 1 FROM accounting.journal_entries j JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id WHERE j.company_id=r.company_id AND j.id=r.journal_entry_id AND b.source_document_id=i.id AND b.posting_kind='SALES_INVOICE'))) THEN RAISE EXCEPTION 'Invoice requires matching posted receivable' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM sales.invoice_lines l WHERE l.company_id=i.company_id AND l.invoice_id=i.id AND NOT EXISTS(SELECT 1 FROM accounting.sales_gst_entries ge WHERE ge.company_id=l.company_id AND ge.invoice_line_id=l.id AND ge.net=l.net AND ge.tax=l.tax AND ge.gst_basis=i.gst_basis AND ge.tax_code_id=l.tax_code_id AND ge.tax_rate=l.tax_rate)) THEN RAISE EXCEPTION 'Invoice GST subledger mismatch' USING ERRCODE='23514';END IF;
 RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER invoice_consistency AFTER INSERT ON sales.invoices DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_invoice();
CREATE CONSTRAINT TRIGGER invoice_consistency AFTER INSERT ON sales.invoice_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_invoice();
CREATE CONSTRAINT TRIGGER invoice_consistency AFTER INSERT ON accounting.receivable_items DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_invoice();
CREATE FUNCTION sales.validate_invoice_credit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE released numeric;invoiced numeric;docstate text;amount numeric;BEGIN
 SELECT d.state,cc.amount,cc.released_amount INTO docstate,amount,released FROM sales.credit_commitments cc JOIN platform.documents d ON d.company_id=cc.company_id AND d.id=cc.order_id WHERE cc.company_id=NEW.company_id AND cc.order_id=NEW.order_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order credit commitment is missing' USING ERRCODE='23514';END IF;
 SELECT coalesce(sum(gross),0) INTO invoiced FROM sales.invoices WHERE company_id=NEW.company_id AND order_id=NEW.order_id;
 IF (docstate='CANCELLED' AND (invoiced<>0 OR released<>amount)) OR (docstate<>'CANCELLED' AND released<>invoiced) THEN RAISE EXCEPTION 'Credit release must match invoicing or whole-order cancellation' USING ERRCODE='23514';END IF;RETURN NULL;END $$;
CREATE CONSTRAINT TRIGGER invoice_credit AFTER INSERT OR UPDATE ON sales.credit_commitments DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_invoice_credit();
CREATE CONSTRAINT TRIGGER invoice_credit AFTER INSERT ON sales.invoices DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_invoice_credit();
CREATE FUNCTION sales.guard_billed_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.document_type='INVOICE' AND EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=OLD.company_id AND id=OLD.id) AND OLD.state='POSTED' THEN
 RAISE EXCEPTION 'Posted invoice registry is immutable; use a future credit-note workflow' USING ERRCODE='23514';END IF;
 IF OLD.document_type='SALES_ORDER' AND NEW.state='CANCELLED' AND EXISTS(SELECT 1 FROM sales.invoices WHERE company_id=OLD.company_id AND order_id=OLD.id) THEN RAISE EXCEPTION 'Invoiced orders require credit notes' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER billed_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION sales.guard_billed_documents();
REVOKE ALL ON FUNCTION identity.seed_invoicing_roles(uuid),sales.require_customer_access(text,uuid),sales.post_invoice(uuid,bigint,jsonb,text),sales.validate_invoice(),sales.validate_invoice_credit(),sales.guard_billed_documents() FROM PUBLIC;
GRANT SELECT ON sales.invoices,sales.invoice_lines,accounting.receivable_items,accounting.sales_gst_entries TO htt_app;
GRANT EXECUTE ON FUNCTION sales.post_invoice(uuid,bigint,jsonb,text) TO htt_app;
