-- Explicit direct provenance: never fabricate a quote/approval to satisfy a foreign key.
ALTER TABLE sales.orders ADD COLUMN order_origin text NOT NULL DEFAULT 'QUOTE' CHECK(order_origin IN('QUOTE','DIRECT')),
 ADD COLUMN creation_reason text,ADD COLUMN notes text NOT NULL DEFAULT '' CHECK(length(notes)<=2000),ADD COLUMN pricing_at timestamptz;
ALTER TABLE sales.orders ALTER COLUMN source_quote_id DROP NOT NULL,ALTER COLUMN approved_quote_version DROP NOT NULL;
ALTER TABLE sales.orders ADD CONSTRAINT order_provenance CHECK(
 (order_origin='QUOTE' AND source_quote_id IS NOT NULL AND approved_quote_version IS NOT NULL AND approved_quote_version>0 AND creation_reason IS NULL)
 OR(order_origin='DIRECT' AND source_quote_id IS NULL AND approved_quote_version IS NULL AND creation_reason IS NOT NULL AND length(btrim(creation_reason)) BETWEEN 1 AND 2000 AND pricing_at IS NOT NULL));
ALTER TABLE sales.order_lines ALTER COLUMN source_quote_line_id DROP NOT NULL;
INSERT INTO identity.permissions(code,description) VALUES('sales.orders.create','Office authority to create and immediately confirm direct sales orders');
CREATE FUNCTION identity.seed_direct_order_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'sales.orders.create' FROM identity.roles WHERE company_id=c AND code IN('ADMIN','OFFICE') ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_direct_order_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION sales.guard_order_provenance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE o sales.orders;BEGIN
 IF TG_TABLE_NAME='orders' THEN
  IF TG_OP='UPDATE' THEN
   IF (to_jsonb(NEW)-'cancelled_at'-'cancel_reason') IS DISTINCT FROM (to_jsonb(OLD)-'cancelled_at'-'cancel_reason') THEN RAISE EXCEPTION 'Confirmed order facts and provenance are immutable' USING ERRCODE='23514';END IF;RETURN NEW;
  END IF;
  IF NEW.order_origin='DIRECT' THEN
   PERFORM purchase.require_access('sales.orders.create');PERFORM sales.require_customer_access('sales.orders.read',NEW.customer_id);PERFORM inventory.require_access('sales.orders.create',NEW.warehouse_id);
   IF NEW.approved_by<>core.current_actor() OR NEW.created_by<>core.current_actor() OR NOT EXISTS(SELECT 1 FROM crm.customers WHERE company_id=NEW.company_id AND id=NEW.customer_id AND status='ACTIVE') OR NOT EXISTS(SELECT 1 FROM crm.customer_branches WHERE company_id=NEW.company_id AND id=NEW.customer_branch_id AND customer_id=NEW.customer_id AND active) OR NOT EXISTS(SELECT 1 FROM catalog.warehouses WHERE company_id=NEW.company_id AND id=NEW.warehouse_id AND active AND kind='SELLABLE') OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=NEW.company_id AND id=NEW.id AND document_type='SALES_ORDER' AND state='CONFIRMED') THEN RAISE EXCEPTION 'Invalid direct order authority, customer, branch or warehouse' USING ERRCODE='23514';END IF;
  END IF;
 ELSE
  SELECT * INTO o FROM sales.orders WHERE company_id=NEW.company_id AND id=NEW.order_id;
  IF NOT FOUND OR (o.order_origin='DIRECT' AND NEW.source_quote_line_id IS NOT NULL) OR (o.order_origin='QUOTE' AND (NEW.source_quote_line_id IS NULL OR NOT EXISTS(SELECT 1 FROM sales.quote_lines WHERE company_id=NEW.company_id AND id=NEW.source_quote_line_id AND quote_id=o.source_quote_id))) THEN RAISE EXCEPTION 'Order line provenance does not match its order' USING ERRCODE='23514';END IF;
  IF o.order_origin='DIRECT' AND (jsonb_typeof(NEW.snapshot)<>'object' OR NEW.snapshot->>'taxRate' IS NULL OR (NEW.snapshot->>'taxRate')::numeric NOT BETWEEN 0 AND 1 OR NEW.snapshot->>'taxCode' IS NULL OR NOT EXISTS(SELECT 1 FROM accounting.tax_codes WHERE company_id=NEW.company_id AND code=NEW.snapshot->>'taxCode') OR (NEW.snapshot->>'quantity')::numeric IS DISTINCT FROM NEW.quantity OR (NEW.snapshot->>'baseQuantity')::numeric IS DISTINCT FROM NEW.base_quantity OR (NEW.snapshot->>'unitPrice')::numeric IS DISTINCT FROM NEW.unit_price OR (NEW.snapshot->>'quantityStep')::numeric IS NULL OR (NEW.snapshot->>'quantityStep')::numeric<=0) THEN RAISE EXCEPTION 'Direct order requires frozen quantity, price, unit and tax facts' USING ERRCODE='23514';END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER order_provenance BEFORE INSERT OR UPDATE ON sales.orders FOR EACH ROW EXECUTE FUNCTION sales.guard_order_provenance();
CREATE TRIGGER line_provenance BEFORE INSERT ON sales.order_lines FOR EACH ROW EXECUTE FUNCTION sales.guard_order_provenance();
-- Retain all existing stock/commitment consistency checks; add an immutable credit decision for direct orders.
CREATE FUNCTION sales.validate_direct_decision() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.order_origin='DIRECT' AND NOT EXISTS(SELECT 1 FROM sales.credit_decisions WHERE company_id=NEW.company_id AND order_id=NEW.id AND customer_id=NEW.customer_id AND order_amount=NEW.gross) THEN RAISE EXCEPTION 'Direct order requires a matching credit decision' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER direct_order_decision AFTER INSERT ON sales.orders DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sales.validate_direct_decision();
REVOKE ALL ON FUNCTION identity.seed_direct_order_roles(uuid),sales.guard_order_provenance(),sales.validate_direct_decision() FROM PUBLIC;

-- Direct orders read their frozen tax facts; quoted orders retain the original quote-line authority.
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
 SELECT ol.*,CASE WHEN ol.source_quote_line_id IS NULL THEN (ol.snapshot->>'taxRate')::numeric ELSE ql.tax_rate END AS tax_rate,CASE WHEN ol.source_quote_line_id IS NULL THEN ol.snapshot->>'taxCode' ELSE ql.snapshot->>'taxCode' END AS tax_code FROM sales.order_lines ol LEFT JOIN sales.quote_lines ql ON ql.company_id=ol.company_id AND ql.id=ol.source_quote_line_id
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
 SELECT ol.*,o.customer_id,d.state,CASE WHEN ol.source_quote_line_id IS NULL THEN (ol.snapshot->>'taxRate')::numeric ELSE ql.tax_rate END AS tax_rate,CASE WHEN ol.source_quote_line_id IS NULL THEN ol.snapshot->>'taxCode' ELSE ql.snapshot->>'taxCode' END AS tax_code FROM sales.order_lines ol JOIN sales.orders o ON o.company_id=ol.company_id AND o.id=ol.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id LEFT JOIN sales.quote_lines ql ON ql.company_id=ol.company_id AND ql.id=ol.source_quote_line_id WHERE ol.company_id=c AND ol.id=(x->>'orderLineId')::uuid INTO l;
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
