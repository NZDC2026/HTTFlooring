-- Procurement commitments and accepted goods/services. Supplier invoices/AP/GST claims are separate future transactions.
CREATE SCHEMA purchase;
REVOKE ALL ON SCHEMA purchase FROM PUBLIC;
CREATE TABLE purchase.orders (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),supplier_id uuid NOT NULL,warehouse_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','CONFIRMED','CLOSED')),expected_on date,notes text NOT NULL DEFAULT '',supplier_snapshot jsonb NOT NULL,
 input jsonb NOT NULL,gst_registered boolean NOT NULL,net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),valuation_amount numeric(20,2) NOT NULL CHECK(valuation_amount>=0),
 closed_at timestamptz,close_reason text,created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),UNIQUE(company_id,id,supplier_id,warehouse_id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id)
);
CREATE TABLE purchase.order_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),order_id uuid NOT NULL,product_id uuid NOT NULL,product_unit_id uuid NOT NULL,item_type text NOT NULL CHECK(item_type IN ('STOCK','NON_STOCK','SERVICE')),
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),unit_cost numeric(20,8) NOT NULL CHECK(unit_cost>=0),tax_code_id uuid NOT NULL,tax_rate numeric(9,6) NOT NULL CHECK(tax_rate BETWEEN 0 AND 1),recoverable_gst boolean NOT NULL,
 net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),gross numeric(20,2) NOT NULL CHECK(gross=net+tax),valuation_amount numeric(20,2) NOT NULL CHECK(valuation_amount=net+CASE WHEN recoverable_gst THEN 0 ELSE tax END),snapshot jsonb NOT NULL,
 UNIQUE(company_id,id),UNIQUE(company_id,order_id,product_unit_id),FOREIGN KEY(company_id,id,order_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,order_id) REFERENCES purchase.orders(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id),FOREIGN KEY(company_id,product_unit_id) REFERENCES catalog.product_units(company_id,id),FOREIGN KEY(company_id,tax_code_id) REFERENCES accounting.tax_codes(company_id,id)
);
CREATE TABLE purchase.receipts (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),order_id uuid NOT NULL,supplier_id uuid NOT NULL,warehouse_id uuid NOT NULL,reference text NOT NULL CHECK(length(reference) BETWEEN 1 AND 200),notes text NOT NULL DEFAULT '',
 net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),valuation_amount numeric(20,2) NOT NULL CHECK(valuation_amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES platform.documents(company_id,id),FOREIGN KEY(company_id,order_id,supplier_id,warehouse_id) REFERENCES purchase.orders(company_id,id,supplier_id,warehouse_id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id)
);
CREATE UNIQUE INDEX supplier_delivery_reference ON purchase.receipts(company_id,supplier_id,lower(reference));
CREATE TABLE purchase.receipt_lines (
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),receipt_id uuid NOT NULL,order_line_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),base_quantity numeric(20,6) NOT NULL CHECK(base_quantity>0),net numeric(20,2) NOT NULL CHECK(net>=0),tax numeric(20,2) NOT NULL CHECK(tax>=0),valuation_amount numeric(20,2) NOT NULL CHECK(valuation_amount>=0),
 stock_balance_id uuid,on_hand_after numeric(20,6),value_after numeric(20,2),
 UNIQUE(company_id,id),UNIQUE(company_id,receipt_id,order_line_id),FOREIGN KEY(company_id,id,receipt_id) REFERENCES platform.document_lines(company_id,id,document_id),FOREIGN KEY(company_id,receipt_id) REFERENCES purchase.receipts(company_id,id),FOREIGN KEY(company_id,order_line_id) REFERENCES purchase.order_lines(company_id,id),FOREIGN KEY(company_id,stock_balance_id) REFERENCES inventory.stock_balances(company_id,id),CHECK((stock_balance_id IS NULL AND on_hand_after IS NULL AND value_after IS NULL) OR (stock_balance_id IS NOT NULL AND on_hand_after IS NOT NULL AND value_after IS NOT NULL AND on_hand_after>=0 AND value_after>=0))
);
CREATE TABLE accounting.grni_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),company_id uuid NOT NULL REFERENCES core.companies(id),receipt_line_id uuid NOT NULL,supplier_id uuid NOT NULL,party_id uuid NOT NULL,amount numeric(20,2) NOT NULL CHECK(amount>=0),debit_account_id uuid,grni_account_id uuid,journal_entry_id uuid,
 UNIQUE(company_id,id),UNIQUE(company_id,receipt_line_id),FOREIGN KEY(company_id,receipt_line_id) REFERENCES purchase.receipt_lines(company_id,id),FOREIGN KEY(company_id,supplier_id) REFERENCES crm.suppliers(company_id,id),FOREIGN KEY(company_id,party_id) REFERENCES crm.parties(company_id,id),FOREIGN KEY(company_id,debit_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,grni_account_id) REFERENCES accounting.accounts(company_id,id),FOREIGN KEY(company_id,journal_entry_id) REFERENCES accounting.journal_entries(company_id,id),CHECK(amount=0 OR (debit_account_id IS NOT NULL AND grni_account_id IS NOT NULL AND journal_entry_id IS NOT NULL))
);
DO $$ DECLARE sc text;t text;BEGIN FOR sc,t IN SELECT * FROM (VALUES('purchase','orders'),('purchase','order_lines'),('purchase','receipts'),('purchase','receipt_lines'),('accounting','grni_items')) v(s,t) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,t);EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,t);
 EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,t);
 EXECUTE format('CREATE INDEX ON %I.%I(company_id)',sc,t);
 IF t NOT IN ('orders','order_lines') THEN EXECUTE format('CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation()',sc,t);END IF;
 END LOOP;END $$;
CREATE INDEX ON purchase.orders(company_id,supplier_id,status);
CREATE INDEX ON purchase.orders(company_id,warehouse_id,status);
CREATE INDEX ON purchase.order_lines(company_id,order_id);
CREATE INDEX ON purchase.receipts(company_id,order_id);
CREATE INDEX ON purchase.receipt_lines(company_id,order_line_id);
CREATE INDEX ON accounting.grni_items(company_id,supplier_id);
INSERT INTO identity.permissions(code,description) VALUES
 ('purchase.orders.read','Read company purchase order quantities and suppliers'),('purchase.orders.write','Maintain purchase drafts'),('purchase.orders.confirm','Confirm and freeze purchase contracts'),('purchase.orders.close','Close outstanding unreceived purchase quantities'),
 ('purchase.cost.read','Read confidential purchase prices and values'),('purchase.receipts.read','Read assigned warehouse receiving work'),('purchase.receipts.write','Confirm goods/service acceptance in assigned warehouse'),('purchase.grni.read','Read GRNI accrual subledger');
CREATE FUNCTION identity.seed_purchasing_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code='ADMIN' AND p.code LIKE 'purchase.%') OR (r.code='PROCUREMENT' AND p.code IN ('purchase.orders.read','purchase.orders.write','purchase.orders.confirm','purchase.orders.close','purchase.cost.read','purchase.receipts.read','purchase.receipts.write')) OR
 (r.code='OFFICE' AND p.code IN ('purchase.orders.read','purchase.cost.read')) OR (r.code='FINANCE' AND p.code IN ('purchase.orders.read','purchase.cost.read','purchase.grni.read')) OR (r.code='WAREHOUSE' AND p.code IN ('purchase.receipts.read','purchase.receipts.write'))) ON CONFLICT DO NOTHING;
 INSERT INTO accounting.accounts(company_id,code,name,kind) VALUES(c,'5100','Purchased non-stock goods and services','EXPENSE') ON CONFLICT(company_id,code) DO NOTHING;
 INSERT INTO accounting.account_mappings(company_id,purpose,account_id) SELECT c,'PURCHASE_EXPENSE',id FROM accounting.accounts WHERE company_id=c AND code='5100' ON CONFLICT DO NOTHING;
 INSERT INTO platform.document_sequences(company_id,document_type,prefix) VALUES(c,'PURCHASE_ORDER','PO-'),(c,'PURCHASE_RECEIPT','PR-') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_purchasing_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION purchase.require_access(p_permission text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM identity.memberships mb JOIN identity.users u ON u.id=mb.user_id AND u.active JOIN identity.membership_roles mr ON mr.company_id=mb.company_id AND mr.membership_id=mb.id JOIN identity.role_permissions rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id WHERE mb.company_id=core.current_company() AND mb.user_id=core.current_actor() AND mb.active AND rp.permission_code=p_permission) THEN RAISE EXCEPTION 'Purchase permission denied' USING ERRCODE='42501';END IF;
END $$;
CREATE FUNCTION purchase.next_number(p_type text) RETURNS text LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE n bigint;p text;BEGIN
 IF p_type NOT IN ('PURCHASE_ORDER','PURCHASE_RECEIPT') THEN RAISE EXCEPTION 'Invalid purchase sequence' USING ERRCODE='HP422';END IF;
 UPDATE platform.document_sequences SET next_value=next_value+1 WHERE company_id=core.current_company() AND document_type=p_type RETURNING next_value-1,prefix INTO n,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase sequence missing' USING ERRCODE='HP422';END IF;RETURN p||lpad(n::text,greatest(6,length(n::text)),'0');END $$;
-- Private builder locks live master data and normalizes all authoritative amounts.
CREATE FUNCTION purchase.prepare_order(p_supplier uuid,p_warehouse uuid,p_expected_on date,items jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();registered boolean;today date;supplier_snapshot jsonb;entry jsonb;unit_id uuid;prod_id uuid;u record;tc record;rate numeric;qty numeric;cost numeric;base_qty numeric;recoverable boolean;n numeric;t numeric;val numeric;
 result_lines jsonb:='[]';total_n numeric:=0;total_t numeric:=0;total_val numeric:=0;
BEGIN
 SELECT gst_registered,(now() AT TIME ZONE timezone)::date INTO registered,today FROM core.companies WHERE id=c FOR SHARE;
 IF p_expected_on IS NOT NULL AND p_expected_on<today THEN RAISE EXCEPTION 'Expected delivery cannot precede order business date' USING ERRCODE='HP422';END IF;
 SELECT jsonb_build_object('supplierId',s.id,'partyId',s.party_id,'code',s.code,'legalName',p.legal_name,'abn',p.abn,'country',p.country,'paymentTermsDays',s.payment_terms_days) INTO supplier_snapshot FROM crm.suppliers s JOIN crm.parties p ON p.company_id=s.company_id AND p.id=s.party_id WHERE s.company_id=c AND s.id=p_supplier AND s.status='ACTIVE' FOR SHARE OF s,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active supplier required' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM catalog.warehouses WHERE company_id=c AND id=p_warehouse AND active AND kind IN ('SELLABLE','QUARANTINE') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active sellable/quarantine receiving warehouse required' USING ERRCODE='HP422';END IF;
 IF items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) v GROUP BY v->>'productUnitId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Supply 1..50 distinct product units' USING ERRCODE='HP422';END IF;
 FOR prod_id IN SELECT DISTINCT pu.product_id FROM jsonb_array_elements(items) v JOIN catalog.product_units pu ON pu.company_id=c AND pu.id=(v->>'productUnitId')::uuid ORDER BY pu.product_id LOOP PERFORM 1 FROM catalog.products WHERE company_id=c AND id=prod_id FOR SHARE;END LOOP;
 FOR unit_id IN SELECT DISTINCT (v->>'productUnitId')::uuid FROM jsonb_array_elements(items) v ORDER BY 1 LOOP PERFORM 1 FROM catalog.product_units WHERE company_id=c AND id=unit_id FOR SHARE;END LOOP;
 FOR entry IN SELECT * FROM jsonb_array_elements(items) LOOP
 SELECT pu.id AS product_unit_id,pu.product_id,pu.conversion_to_base,pu.quantity_step,p.item_type,p.whole_packs,p.tax_code_id,p.sku,p.name,m.code AS unit_code INTO u FROM catalog.product_units pu JOIN catalog.products p ON p.company_id=pu.company_id AND p.id=pu.product_id JOIN catalog.uoms m ON m.company_id=pu.company_id AND m.id=pu.uom_id WHERE pu.company_id=c AND pu.id=(entry->>'productUnitId')::uuid AND pu.active AND p.status='ACTIVE' AND p.buy_enabled AND m.active;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active buy-enabled product/unit required' USING ERRCODE='HP422';END IF;
 qty:=(entry->>'quantity')::numeric;cost:=(entry->>'unitCost')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,u.quantity_step)<>0 OR (u.whole_packs AND u.unit_code='BOX' AND trunc(qty)<>qty) OR cost IS NULL OR cost<0 OR cost<>round(cost,8) OR cost>999999999999.99999999 THEN RAISE EXCEPTION 'Positive quantity/step and explicit nonnegative net unit cost required' USING ERRCODE='HP422';END IF;
 base_qty:=qty*u.conversion_to_base;
 IF base_qty<>round(base_qty,6) OR base_qty>99999999999999.999999 THEN RAISE EXCEPTION 'Base quantity precision/storage limit exceeded' USING ERRCODE='HP422';END IF;
 SELECT * INTO tc FROM accounting.tax_codes WHERE company_id=c AND id=coalesce(nullif(entry->>'taxCodeId','')::uuid,u.tax_code_id) FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase tax code unavailable' USING ERRCODE='HP422';END IF;
 SELECT tr.rate INTO rate FROM accounting.tax_rates tr WHERE tr.company_id=c AND tr.tax_code_id=tc.id AND tr.effective_from<=today AND (tr.effective_to IS NULL OR tr.effective_to>today) FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Current purchase tax rate required' USING ERRCODE='HP422';END IF;
 recoverable:=coalesce((entry->>'recoverableGst')::boolean,registered AND tc.category='TAXABLE');
 IF recoverable AND (NOT registered OR tc.category<>'TAXABLE') THEN RAISE EXCEPTION 'Recoverable GST requires registered company and taxable code' USING ERRCODE='HP422';END IF;
 n:=round(qty*cost,2);t:=round(n*rate,2);val:=n+CASE WHEN recoverable THEN 0 ELSE t END;
 result_lines:=result_lines||jsonb_build_array(jsonb_build_object('productUnitId',u.product_unit_id,'productId',u.product_id,'itemType',u.item_type,'sku',u.sku,'name',u.name,'unitCode',u.unit_code,'quantity',qty,'baseQuantity',base_qty,'conversionToBase',u.conversion_to_base,'quantityStep',u.quantity_step,'unitCost',cost,'taxCodeId',tc.id,'taxCode',tc.code,'taxCategory',tc.category,'taxRate',rate,'recoverableGst',recoverable,'net',n,'tax',t,'gross',n+t,'valuationAmount',val));
 total_n:=total_n+n;total_t:=total_t+t;total_val:=total_val+val;
 END LOOP;
 RETURN jsonb_build_object('today',today,'supplier',supplier_snapshot,'gstRegistered',registered,'lines',result_lines,'net',total_n,'tax',total_t,'gross',total_n+total_t,'valuationAmount',total_val);
END $$;
CREATE FUNCTION purchase.store_lines(p_order uuid,prepared jsonb) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();entry jsonb;line_id uuid;no int:=0;old_ids jsonb;
BEGIN
 SELECT coalesce(jsonb_object_agg(product_unit_id::text,id),'{}'::jsonb) INTO old_ids FROM purchase.order_lines WHERE company_id=c AND order_id=p_order;
 DELETE FROM purchase.order_lines WHERE company_id=c AND order_id=p_order;
 DELETE FROM platform.document_lines WHERE company_id=c AND document_id=p_order;
 FOR entry IN SELECT * FROM jsonb_array_elements(prepared->'lines') LOOP
 no:=no+1;line_id:=coalesce((old_ids->>(entry->>'productUnitId'))::uuid,gen_random_uuid());
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(line_id,c,p_order,no,a);
 INSERT INTO purchase.order_lines(id,company_id,order_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_cost,tax_code_id,tax_rate,recoverable_gst,net,tax,gross,valuation_amount,snapshot)
 VALUES(line_id,c,p_order,(entry->>'productId')::uuid,(entry->>'productUnitId')::uuid,entry->>'itemType',(entry->>'quantity')::numeric,(entry->>'baseQuantity')::numeric,(entry->>'unitCost')::numeric,(entry->>'taxCodeId')::uuid,(entry->>'taxRate')::numeric,(entry->>'recoverableGst')::boolean,(entry->>'net')::numeric,(entry->>'tax')::numeric,(entry->>'gross')::numeric,(entry->>'valuationAmount')::numeric,entry);
 END LOOP;
END $$;
CREATE FUNCTION purchase.save_order(p_id uuid,p_expected bigint,p_supplier uuid,p_warehouse uuid,p_expected_on date,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();oid uuid:=coalesce(p_id,gen_random_uuid());doc platform.documents;prepared jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.orders.write');
 IF p_notes IS NULL OR length(p_notes)>2000 THEN RAISE EXCEPTION 'Notes must be at most 2000 characters' USING ERRCODE='HP422';END IF;
 IF p_id IS NOT NULL THEN
 SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_id FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM purchase.orders WHERE company_id=c AND id=p_id) THEN RAISE EXCEPTION 'Purchase order unavailable' USING ERRCODE='HT404';END IF;
 IF p_expected IS NULL OR doc.version<>p_expected OR doc.state<>'DRAFT' THEN RAISE EXCEPTION 'Only current draft version can be edited' USING ERRCODE='HP409';END IF;
 END IF;
 prepared:=purchase.prepare_order(p_supplier,p_warehouse,p_expected_on,items);
 IF p_id IS NULL THEN
 INSERT INTO platform.documents(id,company_id,document_type,business_date,state,created_by) VALUES(oid,c,'PURCHASE_ORDER',(prepared->>'today')::date,'DRAFT',a);
 INSERT INTO purchase.orders(id,company_id,supplier_id,warehouse_id,expected_on,notes,supplier_snapshot,input,gst_registered,net,tax,gross,valuation_amount,created_by)
 VALUES(oid,c,p_supplier,p_warehouse,p_expected_on,p_notes,prepared->'supplier',items,(prepared->>'gstRegistered')::boolean,(prepared->>'net')::numeric,(prepared->>'tax')::numeric,(prepared->>'gross')::numeric,(prepared->>'valuationAmount')::numeric,a);
 ELSE
 UPDATE purchase.orders SET supplier_id=p_supplier,warehouse_id=p_warehouse,expected_on=p_expected_on,notes=p_notes,supplier_snapshot=prepared->'supplier',input=items,gst_registered=(prepared->>'gstRegistered')::boolean,net=(prepared->>'net')::numeric,tax=(prepared->>'tax')::numeric,gross=(prepared->>'gross')::numeric,valuation_amount=(prepared->>'valuationAmount')::numeric WHERE company_id=c AND id=oid;
 UPDATE platform.documents SET business_date=(prepared->>'today')::date WHERE company_id=c AND id=oid;
 END IF;
 PERFORM purchase.store_lines(oid,prepared);RETURN oid;
END $$;
CREATE FUNCTION purchase.confirm_order(p_order uuid,p_expected bigint) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();o purchase.orders;doc platform.documents;prepared jsonb;
BEGIN
 PERFORM purchase.require_access('purchase.orders.confirm');
 SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_order FOR UPDATE;
 SELECT * INTO o FROM purchase.orders WHERE company_id=c AND id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order unavailable' USING ERRCODE='HT404';END IF;
 IF p_expected IS NULL OR doc.version<>p_expected OR o.status<>'DRAFT' OR doc.state<>'DRAFT' THEN RAISE EXCEPTION 'Only current draft can be confirmed' USING ERRCODE='HP409';END IF;
 prepared:=purchase.prepare_order(o.supplier_id,o.warehouse_id,o.expected_on,o.input);
 UPDATE purchase.orders SET supplier_snapshot=prepared->'supplier',gst_registered=(prepared->>'gstRegistered')::boolean,net=(prepared->>'net')::numeric,tax=(prepared->>'tax')::numeric,gross=(prepared->>'gross')::numeric,valuation_amount=(prepared->>'valuationAmount')::numeric WHERE company_id=c AND id=p_order;
 PERFORM purchase.store_lines(p_order,prepared);
 UPDATE purchase.orders SET status='CONFIRMED' WHERE company_id=c AND id=p_order;
 UPDATE platform.documents SET state='CONFIRMED',number=purchase.next_number('PURCHASE_ORDER'),business_date=(prepared->>'today')::date WHERE company_id=c AND id=p_order;RETURN p_order;
END $$;
CREATE FUNCTION purchase.close_order(p_order uuid,p_expected bigint,p_reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();o purchase.orders;doc platform.documents;received boolean;
BEGIN
 PERFORM purchase.require_access('purchase.orders.close');
 SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_order FOR UPDATE;
 SELECT * INTO o FROM purchase.orders WHERE company_id=c AND id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order unavailable' USING ERRCODE='HT404';END IF;
 IF p_expected IS NULL OR doc.version<>p_expected OR o.status='CLOSED' THEN RAISE EXCEPTION 'Purchase order changed or already closed' USING ERRCODE='HP409';END IF;
 IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Closure reason required' USING ERRCODE='HP422';END IF;
 SELECT EXISTS(SELECT 1 FROM purchase.receipts WHERE company_id=c AND order_id=p_order) INTO received;
 UPDATE purchase.orders SET status='CLOSED',closed_at=now(),close_reason=trim(p_reason) WHERE company_id=c AND id=p_order;
 UPDATE platform.documents SET state=CASE WHEN received THEN 'CONFIRMED' ELSE 'CANCELLED' END WHERE company_id=c AND id=p_order;
END $$;
CREATE FUNCTION purchase.receive_order(p_order uuid,p_expected bigint,p_reference text,p_notes text,items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();a uuid:=core.current_actor();rid uuid:=gen_random_uuid();o purchase.orders;doc platform.documents;today date;registered boolean;party uuid;
 entry jsonb;l record;qty numeric;bqty numeric;prior_qty numeric;prior_net numeric;prior_tax numeric;n numeric;t numeric;val numeric;no int:=0;lid uuid;
 built jsonb:='[]';journal_lines jsonb:='[]';grni_rows jsonb:='[]';total_n numeric:=0;total_t numeric:=0;total_val numeric:=0;grni uuid;debit_account uuid;j uuid;balance inventory.stock_balances;pool inventory.stock_values;
BEGIN
 SELECT * INTO o FROM purchase.orders WHERE company_id=c AND id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order unavailable' USING ERRCODE='HT404';END IF;
 PERFORM inventory.require_access('purchase.receipts.write',o.warehouse_id);
 SELECT * INTO doc FROM platform.documents WHERE company_id=c AND id=p_order FOR UPDATE;
 SELECT * INTO o FROM purchase.orders WHERE company_id=c AND id=p_order;
 IF p_expected IS NULL OR doc.version<>p_expected OR o.status<>'CONFIRMED' OR doc.state<>'CONFIRMED' THEN RAISE EXCEPTION 'Purchase order changed, closed or not confirmed' USING ERRCODE='HP409';END IF;
 SELECT gst_registered,(now() AT TIME ZONE timezone)::date INTO registered,today FROM core.companies WHERE id=c FOR SHARE;
 IF registered<>o.gst_registered THEN RAISE EXCEPTION 'GST registration changed; close remaining order and confirm current cost policy' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM accounting.periods WHERE company_id=c AND starts_on<=today AND ends_on>today AND state='OPEN' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Goods receipt requires open accounting period' USING ERRCODE='HP422';END IF;
 SELECT party_id INTO party FROM crm.suppliers WHERE company_id=c AND id=o.supplier_id AND status='ACTIVE' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Receiving supplier is inactive' USING ERRCODE='HP422';END IF;
 PERFORM 1 FROM catalog.warehouses WHERE company_id=c AND id=o.warehouse_id AND active AND kind IN ('SELLABLE','QUARANTINE') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Receiving warehouse is inactive or unavailable' USING ERRCODE='HP422';END IF;
 IF p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 1 AND 200 OR p_notes IS NULL OR length(p_notes)>2000 OR items IS NULL OR jsonb_typeof(items)<>'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 50 OR EXISTS(SELECT 1 FROM jsonb_array_elements(items) v GROUP BY v->>'orderLineId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Receipt reference and distinct order lines required' USING ERRCODE='HP422';END IF;
 FOR entry IN SELECT v.value FROM jsonb_array_elements(items) v JOIN purchase.order_lines ol ON ol.company_id=c AND ol.id=(v.value->>'orderLineId')::uuid ORDER BY ol.product_id,ol.id LOOP
 SELECT ol.* INTO l FROM purchase.order_lines ol WHERE ol.company_id=c AND ol.id=(entry->>'orderLineId')::uuid AND ol.order_id=p_order;
 IF NOT FOUND THEN RAISE EXCEPTION 'Purchase line belongs to another order' USING ERRCODE='HT404';END IF;
 PERFORM 1 FROM catalog.products WHERE company_id=c AND id=l.product_id AND status='ACTIVE' AND buy_enabled AND item_type=l.item_type FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable or item type changed' USING ERRCODE='HP422';END IF;
 qty:=(entry->>'quantity')::numeric;
 IF qty IS NULL OR qty<=0 OR qty<>round(qty,6) OR qty>99999999999999.999999 OR mod(qty,(l.snapshot->>'quantityStep')::numeric)<>0 THEN RAISE EXCEPTION 'Receipt quantity violates frozen purchase step' USING ERRCODE='HP422';END IF;
 SELECT coalesce(sum(quantity),0),coalesce(sum(net),0),coalesce(sum(tax),0) INTO prior_qty,prior_net,prior_tax FROM purchase.receipt_lines WHERE company_id=c AND order_line_id=l.id;
 IF qty+prior_qty>l.quantity THEN RAISE EXCEPTION 'Receipt exceeds remaining purchase quantity' USING ERRCODE='HP409';END IF;
 bqty:=qty*l.base_quantity/l.quantity;
 IF bqty<>round(bqty,6) THEN RAISE EXCEPTION 'Receipt base quantity precision exceeded' USING ERRCODE='HP422';END IF;
 n:=round(l.net*(prior_qty+qty)/l.quantity,2)-prior_net;t:=round(l.tax*(prior_qty+qty)/l.quantity,2)-prior_tax;val:=n+CASE WHEN l.recoverable_gst THEN 0 ELSE t END;
 built:=built||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'orderLineId',l.id,'productId',l.product_id,'itemType',l.item_type,'quantity',qty,'baseQuantity',bqty,'net',n,'tax',t,'valuationAmount',val));total_n:=total_n+n;total_t:=total_t+t;total_val:=total_val+val;
 END LOOP;
 IF jsonb_array_length(built)<>jsonb_array_length(items) THEN RAISE EXCEPTION 'Purchase line unavailable' USING ERRCODE='HT404';END IF;
 IF total_val>0 THEN grni:=accounting.settlement_account('GRNI','LIABILITY','GRNI');END IF;
 INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(rid,c,'PURCHASE_RECEIPT',purchase.next_number('PURCHASE_RECEIPT'),today,'CONFIRMED',a);
 INSERT INTO purchase.receipts(id,company_id,order_id,supplier_id,warehouse_id,reference,notes,net,tax,valuation_amount,created_by) VALUES(rid,c,p_order,o.supplier_id,o.warehouse_id,trim(p_reference),p_notes,total_n,total_t,total_val,a);
 FOR entry IN SELECT * FROM jsonb_array_elements(built) LOOP
 no:=no+1;lid:=(entry->>'id')::uuid;val:=(entry->>'valuationAmount')::numeric;debit_account:=NULL;
 INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(lid,c,rid,no,a);
 IF entry->>'itemType'='STOCK' THEN
 INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,created_by) VALUES(c,o.warehouse_id,(entry->>'productId')::uuid,a) ON CONFLICT(company_id,warehouse_id,product_id) DO NOTHING;
 SELECT * INTO balance FROM inventory.stock_balances WHERE company_id=c AND warehouse_id=o.warehouse_id AND product_id=(entry->>'productId')::uuid FOR UPDATE;
 SELECT * INTO pool FROM inventory.stock_values WHERE company_id=c AND stock_balance_id=balance.id FOR UPDATE;
 IF NOT FOUND THEN
 IF balance.on_hand<>0 THEN RAISE EXCEPTION 'Initialize existing stock valuation before purchase receipt' USING ERRCODE='HP422';END IF;
 INSERT INTO inventory.stock_values(company_id,stock_balance_id,value,opening_document_id) VALUES(c,balance.id,0,rid) RETURNING * INTO pool;
 END IF;
 IF balance.on_hand=0 AND pool.value<>0 THEN RAISE EXCEPTION 'Zero quantity has unexplained inventory value; reconcile first' USING ERRCODE='HP422';END IF;
 UPDATE inventory.stock_balances SET on_hand=on_hand+(entry->>'baseQuantity')::numeric WHERE company_id=c AND id=balance.id;
 UPDATE inventory.stock_values SET value=value+val WHERE company_id=c AND id=pool.id;
 INSERT INTO purchase.receipt_lines(id,company_id,receipt_id,order_line_id,quantity,base_quantity,net,tax,valuation_amount,stock_balance_id,on_hand_after,value_after) VALUES(lid,c,rid,(entry->>'orderLineId')::uuid,(entry->>'quantity')::numeric,(entry->>'baseQuantity')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,val,balance.id,balance.on_hand+(entry->>'baseQuantity')::numeric,pool.value+val);
 IF val>0 THEN debit_account:=accounting.settlement_account('INVENTORY','ASSET','INVENTORY');END IF;
 ELSE
 INSERT INTO purchase.receipt_lines(id,company_id,receipt_id,order_line_id,quantity,base_quantity,net,tax,valuation_amount) VALUES(lid,c,rid,(entry->>'orderLineId')::uuid,(entry->>'quantity')::numeric,(entry->>'baseQuantity')::numeric,(entry->>'net')::numeric,(entry->>'tax')::numeric,val);
 IF val>0 THEN debit_account:=accounting.settlement_account('PURCHASE_EXPENSE','EXPENSE');END IF;
 END IF;
 IF val>0 THEN journal_lines:=journal_lines||jsonb_build_array(jsonb_build_object('accountId',debit_account,'debit',val,'sourceLineId',lid),jsonb_build_object('accountId',grni,'partyId',party,'credit',val,'sourceLineId',lid));END IF;
 grni_rows:=grni_rows||jsonb_build_array(jsonb_build_object('lineId',lid,'amount',val,'debitAccountId',debit_account));
 END LOOP;
 IF total_val>0 THEN j:=accounting.post_journal(rid,1,'PURCHASE_RECEIPT',today,'Purchase receipt / GRNI accrual',journal_lines);END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(grni_rows) LOOP
 INSERT INTO accounting.grni_items(company_id,receipt_line_id,supplier_id,party_id,amount,debit_account_id,grni_account_id,journal_entry_id) VALUES(c,(entry->>'lineId')::uuid,o.supplier_id,party,(entry->>'amount')::numeric,(entry->>'debitAccountId')::uuid,grni,j);
 END LOOP;
 UPDATE platform.documents SET state='POSTED' WHERE company_id=c AND id=rid;UPDATE platform.documents SET state=state WHERE company_id=c AND id=p_order;RETURN rid;
END $$;
CREATE FUNCTION purchase.guard_order() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status<>'DRAFT' AND (to_jsonb(NEW)-ARRAY['status','closed_at','close_reason']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','closed_at','close_reason']) THEN RAISE EXCEPTION 'Confirmed purchase content is immutable' USING ERRCODE='23514';END IF;
 IF NOT((OLD.status='DRAFT' AND NEW.status IN ('DRAFT','CONFIRMED','CLOSED')) OR (OLD.status='CONFIRMED' AND NEW.status='CLOSED')) THEN RAISE EXCEPTION 'Invalid purchase state transition' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER purchase_update BEFORE UPDATE ON purchase.orders FOR EACH ROW EXECUTE FUNCTION purchase.guard_order();
CREATE TRIGGER no_delete BEFORE DELETE ON purchase.orders FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
CREATE FUNCTION purchase.guard_lines() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE oid uuid;cid uuid;BEGIN
 IF TG_OP='DELETE' THEN oid:=OLD.order_id;cid:=OLD.company_id;ELSE oid:=NEW.order_id;cid:=NEW.company_id;END IF;
 IF NOT EXISTS(SELECT 1 FROM purchase.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=cid AND o.id=oid AND o.status='DRAFT' AND d.state='DRAFT') THEN RAISE EXCEPTION 'Only draft purchase lines can change' USING ERRCODE='23514';END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;END IF;RETURN NEW;
END $$;
CREATE TRIGGER draft_lines BEFORE INSERT OR UPDATE OR DELETE ON purchase.order_lines FOR EACH ROW EXECUTE FUNCTION purchase.guard_lines();
CREATE FUNCTION purchase.guard_documents() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='POSTED' AND EXISTS(SELECT 1 FROM purchase.receipts WHERE company_id=OLD.company_id AND id=OLD.id) THEN RAISE EXCEPTION 'Posted purchase receipt is immutable' USING ERRCODE='23514';END IF;
 IF OLD.document_type='PURCHASE_ORDER' AND OLD.state<>'DRAFT' AND EXISTS(SELECT 1 FROM purchase.orders WHERE company_id=OLD.company_id AND id=OLD.id) THEN
 IF (NEW.number,NEW.document_type,NEW.business_date,NEW.company_id,NEW.id) IS DISTINCT FROM (OLD.number,OLD.document_type,OLD.business_date,OLD.company_id,OLD.id) THEN RAISE EXCEPTION 'Confirmed purchase registry identity is immutable' USING ERRCODE='23514';END IF;
 IF NEW.state<>OLD.state AND NOT(NEW.state='CANCELLED' AND EXISTS(SELECT 1 FROM purchase.orders WHERE company_id=OLD.company_id AND id=OLD.id AND status='CLOSED') AND NOT EXISTS(SELECT 1 FROM purchase.receipts WHERE company_id=OLD.company_id AND order_id=OLD.id)) THEN RAISE EXCEPTION 'Purchase registry state does not match closure' USING ERRCODE='23514';END IF;
 END IF;RETURN NEW;
END $$;
CREATE TRIGGER purchase_document BEFORE UPDATE ON platform.documents FOR EACH ROW EXECUTE FUNCTION purchase.guard_documents();
CREATE FUNCTION purchase.validate_order() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE o purchase.orders;v numeric;n numeric;t numeric;cost numeric;doc platform.documents;BEGIN
 SELECT * INTO o FROM purchase.orders WHERE company_id=NEW.company_id AND id=NEW.id;
 SELECT count(*),sum(net),sum(tax),sum(valuation_amount) INTO v,n,t,cost FROM purchase.order_lines WHERE company_id=o.company_id AND order_id=o.id;
 SELECT * INTO doc FROM platform.documents WHERE company_id=o.company_id AND id=o.id;
 IF v=0 OR (n,t,cost) IS DISTINCT FROM (o.net,o.tax,o.valuation_amount) OR doc.document_type<>'PURCHASE_ORDER' OR (o.status='DRAFT' AND (doc.state<>'DRAFT' OR doc.number IS NOT NULL)) OR (o.status='CONFIRMED' AND (doc.state<>'CONFIRMED' OR doc.number IS NULL)) THEN RAISE EXCEPTION 'Purchase document totals/state inconsistent' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER purchase_consistency AFTER INSERT OR UPDATE ON purchase.orders DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_order();
CREATE FUNCTION purchase.validate_receipt() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE rid uuid;r purchase.receipts;v numeric;n numeric;t numeric;cost numeric;BEGIN
 IF TG_TABLE_NAME='receipts' THEN rid:=NEW.id;ELSIF TG_TABLE_NAME='receipt_lines' THEN rid:=NEW.receipt_id;ELSE SELECT receipt_id INTO rid FROM purchase.receipt_lines WHERE company_id=NEW.company_id AND id=NEW.receipt_line_id;END IF;
 SELECT * INTO r FROM purchase.receipts WHERE company_id=NEW.company_id AND id=rid;
 SELECT count(*),sum(net),sum(tax),sum(valuation_amount) INTO v,n,t,cost FROM purchase.receipt_lines WHERE company_id=r.company_id AND receipt_id=r.id;
 IF v=0 OR (n,t,cost) IS DISTINCT FROM (r.net,r.tax,r.valuation_amount) OR NOT EXISTS(SELECT 1 FROM platform.documents WHERE company_id=r.company_id AND id=r.id AND document_type='PURCHASE_RECEIPT' AND state='POSTED') THEN RAISE EXCEPTION 'Receipt totals/state mismatch' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT 1 FROM purchase.receipt_lines rl JOIN purchase.order_lines ol ON ol.company_id=rl.company_id AND ol.id=rl.order_line_id WHERE rl.company_id=r.company_id AND rl.receipt_id=r.id AND (ol.order_id<>r.order_id OR (ol.item_type='STOCK')<>(rl.stock_balance_id IS NOT NULL) OR (SELECT sum(quantity) FROM purchase.receipt_lines WHERE company_id=ol.company_id AND order_line_id=ol.id)>ol.quantity OR NOT EXISTS(
 SELECT 1 FROM accounting.grni_items g WHERE g.company_id=rl.company_id AND g.receipt_line_id=rl.id AND g.supplier_id=r.supplier_id AND g.amount=rl.valuation_amount AND (g.amount=0 OR EXISTS(SELECT 1 FROM accounting.journal_entries je JOIN accounting.posting_batches pb ON pb.company_id=je.company_id AND pb.id=je.posting_batch_id WHERE je.company_id=g.company_id AND je.id=g.journal_entry_id AND pb.source_document_id=r.id AND pb.posting_kind='PURCHASE_RECEIPT'))))) THEN RAISE EXCEPTION 'Receipt source, stock or GRNI mismatch' USING ERRCODE='23514';END IF;RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER receipt_consistency AFTER INSERT ON purchase.receipts DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_receipt();
CREATE CONSTRAINT TRIGGER receipt_consistency AFTER INSERT ON purchase.receipt_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_receipt();
CREATE CONSTRAINT TRIGGER receipt_consistency AFTER INSERT ON accounting.grni_items DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION purchase.validate_receipt();
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA purchase FROM PUBLIC;
REVOKE ALL ON FUNCTION identity.seed_purchasing_roles(uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA purchase TO htt_app;
GRANT SELECT ON purchase.orders,purchase.order_lines,purchase.receipts,purchase.receipt_lines,accounting.grni_items TO htt_app;
GRANT EXECUTE ON FUNCTION purchase.save_order(uuid,bigint,uuid,uuid,date,text,jsonb),purchase.confirm_order(uuid,bigint),purchase.close_order(uuid,bigint,text),purchase.receive_order(uuid,bigint,text,text,jsonb) TO htt_app;
