DO $$ BEGIN IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.amount_credit_posted')<>12 THEN RAISE EXCEPTION 'Supplier amount credit audit mismatch'; END IF; END $$;
-- Assertions against synthetic data only. A failure prevents PASSED creation.
DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.bill_posted' AND details->>'billType'='EXPENSE')<>6
    OR (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_credited' AND details->>'creditType'='EXPENSE')<>6
    OR (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000170')<>0 THEN
  RAISE EXCEPTION 'Expense bill/credit must execute once and restore expense balance';
 END IF;
 IF EXISTS(SELECT 1 FROM accounting.accounts WHERE id='00000000-0000-0000-0000-000000000160') THEN
  IF (SELECT count(*) FROM accounting.supplier_refunds WHERE bank_account_id='00000000-0000-0000-0000-000000000160')<>9
     OR (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000160')<>43.5 THEN
   RAISE EXCEPTION 'Supplier refund/correction did not retain selected alternate bank';
  END IF;
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_refund_reversed')<>12
    OR (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_refund_corrected')<>12 THEN
  RAISE EXCEPTION 'Supplier refund correction must execute once';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_refunded')<>6 THEN
  RAISE EXCEPTION 'Supplier credit/prepayment refund must execute once';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.goods_returned')<>8
    OR (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_credited')<>12 THEN
  RAISE EXCEPTION 'Purchase return and supplier credit must execute once';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_credit_applied')<>4
    OR (SELECT count(*) FROM platform.audit_events WHERE action='purchase.supplier_credit_unapplied')<>4 THEN
  RAISE EXCEPTION 'Supplier credit applications must execute once';
 END IF;
 IF EXISTS(SELECT document_id,filename FROM platform.file_assets WHERE filename LIKE 'visit-%'
           GROUP BY document_id,filename HAVING count(*)<>1) THEN
  RAISE EXCEPTION 'Concurrent upload produced duplicate synthetic attachment assets';
 END IF;
 IF EXISTS(SELECT journal_entry_id FROM accounting.journal_lines GROUP BY company_id,journal_entry_id HAVING sum(debit)<>sum(credit)) THEN
  RAISE EXCEPTION 'Synthetic journal is not balanced';
 END IF;
 IF EXISTS(SELECT 1 FROM sales.quotes q JOIN platform.approval_requests a ON a.company_id=q.company_id AND a.document_id=q.id WHERE q.status='DRAFT' AND a.state='PENDING') THEN
  RAISE EXCEPTION 'Returned synthetic quote retained a pending approval';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_returned')<>12 THEN
  RAISE EXCEPTION 'Quote return audit must appear exactly once per operation';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000054') <>
    (SELECT CASE WHEN gst_basis='CASH' THEN 0 ELSE 1.50 END FROM core.companies WHERE id='00000000-0000-0000-0000-000000000001') THEN
  RAISE EXCEPTION 'Synthetic input GST balance does not match final attribution';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000055') <>
    (SELECT CASE WHEN gst_basis='CASH' THEN 1.50 ELSE 0 END FROM core.companies WHERE id='00000000-0000-0000-0000-000000000001') THEN
  RAISE EXCEPTION 'Synthetic deferred GST balance does not match pending tax';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_receipt_reversed')<>11
    OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.advance_unapplied')<>4 THEN
  RAISE EXCEPTION 'Customer settlement correction audit must appear exactly once per operation';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000056')<>0 THEN
  RAISE EXCEPTION 'Synthetic customer advance liability was not restored after reversal';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_receipt_reapplied')<>4 THEN
  RAISE EXCEPTION 'Customer reapplication audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_refunded')<>12 THEN
  RAISE EXCEPTION 'Customer refund audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_refund_reversed')<>8 THEN
  RAISE EXCEPTION 'Customer refund reversal audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_refund_corrected')<>8 THEN
  RAISE EXCEPTION 'Customer refund correction audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.credit_posted')<>13 THEN
  RAISE EXCEPTION 'Sales credit audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.amount_credit_posted')<>2 THEN
  RAISE EXCEPTION 'Sales amount credit audit must appear exactly once per operation';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.sales_returned')<>4 THEN
  RAISE EXCEPTION 'Stock return audit must appear exactly once per operation';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000040')<>0 THEN
  RAISE EXCEPTION 'Returned stock did not restore COGS';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000075')<>0 THEN
  RAISE EXCEPTION 'Canceled synthetic taxable invoice did not clear output GST';
 END IF;
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.customer_credit_applied')<>4
    OR (SELECT count(*) FROM platform.audit_events WHERE action='sales.customer_credit_unapplied')<>4 THEN
  RAISE EXCEPTION 'Customer credit application audit must appear exactly once per operation';
 END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM inventory.purchase_value_adjustments a JOIN purchase.supplier_credit_notes c ON c.id=a.document_id AND c.company_id=a.company_id WHERE c.credit_mode='AMOUNT' AND c.credit_type='RECEIPT')<>6
 OR (SELECT coalesce(sum(a.amount),0) FROM inventory.purchase_value_adjustments a JOIN purchase.supplier_credit_notes c ON c.id=a.document_id AND c.company_id=a.company_id WHERE c.credit_mode='AMOUNT' AND c.credit_type='RECEIPT')<>-40
 OR EXISTS(SELECT 1 FROM inventory.purchase_value_adjustments a JOIN purchase.supplier_credit_notes c ON c.id=a.document_id AND c.company_id=a.company_id WHERE c.credit_mode='AMOUNT' AND c.credit_type='RECEIPT' AND (a.quantity<>1 OR a.inventory_delta NOT IN(-5,-10) OR a.expense_delta<>0)) THEN
 RAISE EXCEPTION 'Stock amount credits must reduce valuation once without physical return'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM accounting.supplier_payments WHERE reference LIKE 'Paid expense GST %')<>4
 OR (SELECT count(*) FROM accounting.supplier_payment_reversals r JOIN accounting.supplier_payments p ON p.company_id=r.company_id AND p.id=r.payment_id WHERE p.reference LIKE 'Paid expense GST %')<>4 THEN
 RAISE EXCEPTION 'Paid expense GST payments/reversals must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM accounting.supplier_payments WHERE reference LIKE 'Stock amount GST %')<>2
 OR (SELECT count(*) FROM accounting.supplier_payment_reversals r JOIN accounting.supplier_payments p ON p.company_id=r.company_id AND p.id=r.payment_id WHERE p.reference LIKE 'Stock amount GST %')<>2 THEN
 RAISE EXCEPTION 'Taxable stock amount payments/reversals must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_drafted')<>25
 OR (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_submitted')<>20
 OR (SELECT count(*) FROM sales.quote_submissions)<>20
 OR EXISTS(SELECT 1 FROM sales.quote_submissions ss JOIN sales.quotes q ON q.company_id=ss.company_id AND q.id=ss.quote_id WHERE q.notes='Updated café quote' AND (ss.document_version<>3 OR ss.snapshot->>'status'<>'SUBMITTED' OR (ss.snapshot->>'gross')::numeric<>135))
 OR EXISTS(SELECT quote_id,document_version FROM sales.quote_submissions GROUP BY company_id,quote_id,document_version HAVING count(*)<>1)
 OR (SELECT count(*) FROM platform.approval_requests a JOIN sales.quotes q ON q.company_id=a.company_id AND q.id=a.document_id WHERE a.document_version=3 AND a.state='STALE')<>2 THEN
 RAISE EXCEPTION 'Quote update/submit must create one matching submission and stale approval per version'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM sales.orders WHERE creation_reason LIKE 'Synthetic aggregate direct café %')<>2
 OR (SELECT count(*) FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id WHERE o.creation_reason LIKE 'Synthetic aggregate direct café %')<>4
 OR EXISTS(SELECT 1 FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id WHERE o.creation_reason LIKE 'Synthetic aggregate direct café %' AND (r.released_quantity<>r.quantity OR r.consumed_quantity<>0))
 OR (SELECT count(*) FROM sales.credit_decisions c JOIN sales.orders o ON o.company_id=c.company_id AND o.id=c.order_id WHERE o.creation_reason LIKE 'Synthetic aggregate direct café %')<>2
 OR (SELECT count(*) FROM sales.credit_commitments c JOIN sales.orders o ON o.company_id=c.company_id AND o.id=c.order_id WHERE o.creation_reason LIKE 'Synthetic aggregate direct café %' AND c.amount=135 AND c.released_amount=135)<>2 THEN
 RAISE EXCEPTION 'Direct aggregate orders must reserve/release and commit credit once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM sales.orders o JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id WHERE q.notes LIKE 'Conversion fixture café %' AND o.order_origin='QUOTE' AND o.approved_quote_version=2 AND q.status='CONVERTED')<>2
 OR (SELECT count(*) FROM platform.approval_actions a JOIN platform.approval_requests r ON r.company_id=a.company_id AND r.id=a.request_id JOIN sales.quotes q ON q.company_id=r.company_id AND q.id=r.document_id WHERE q.notes LIKE 'Conversion fixture café %' AND a.action='APPROVE' AND r.state='APPROVED' AND r.document_version=2)<>2
 OR EXISTS(SELECT 1 FROM sales.order_lines l JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id LEFT JOIN sales.quote_lines s ON s.company_id=l.company_id AND s.id=l.source_quote_line_id WHERE q.notes LIKE 'Conversion fixture café %' AND (s.id IS NULL OR l.snapshot<>s.snapshot OR l.net<>s.net OR l.tax<>s.tax OR l.gross<>s.gross))
 OR (SELECT count(*) FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id WHERE q.notes LIKE 'Conversion fixture café %' AND r.released_quantity=r.quantity AND r.consumed_quantity=0)<>4
 OR (SELECT count(*) FROM sales.credit_commitments c JOIN sales.orders o ON o.company_id=c.company_id AND o.id=c.order_id JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id WHERE q.notes LIKE 'Conversion fixture café %' AND c.amount=o.gross AND c.released_amount=c.amount)<>2 THEN
 RAISE EXCEPTION 'Quote conversion must preserve frozen source lines and approve/reserve/commit once'; END IF;
END $$;

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM sales.orders o JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id WHERE q.notes LIKE 'Failure conversion fixture %')
 OR (SELECT count(*) FROM sales.quotes WHERE notes LIKE 'Failure conversion fixture %' AND status='DRAFT')<>10
 OR (SELECT count(*) FROM platform.approval_requests r JOIN sales.quotes q ON q.company_id=r.company_id AND q.id=r.document_id WHERE q.notes LIKE 'Failure conversion fixture %' AND r.state='STALE' AND r.document_version=2)<>10
 OR EXISTS(SELECT 1 FROM platform.approval_actions a JOIN platform.approval_requests r ON r.company_id=a.company_id AND r.id=a.request_id JOIN sales.quotes q ON q.company_id=r.company_id AND q.id=r.document_id WHERE q.notes LIKE 'Failure conversion fixture %')
 OR EXISTS(SELECT 1 FROM sales.order_lines l JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id JOIN sales.quotes q ON q.company_id=o.company_id AND q.id=o.source_quote_id JOIN platform.document_lines od ON od.company_id=l.company_id AND od.id=l.id JOIN platform.document_lines sd ON sd.company_id=l.company_id AND sd.id=l.source_quote_line_id WHERE q.notes LIKE 'Conversion fixture café %' AND (od.line_no<>sd.line_no OR od.line_no NOT IN(10,20)))
 OR (SELECT timezone FROM core.companies WHERE id='00000000-0000-0000-0000-000000000001')<>'Australia/Sydney'
 OR (SELECT conversion_to_base FROM catalog.product_units WHERE id='00000000-0000-0000-0000-000000000184')<>2.25
 OR (SELECT amount FROM pricing.price_floor_rules WHERE id='00000000-0000-0000-0000-000000000187')<>45 THEN
 RAISE EXCEPTION 'Failed conversion must preserve approval/resources and restore fixture policy; historical line numbers must survive'; END IF;
END $$;

SELECT entity_type,jsonb_typeof(details->'after'->'Amount') AS after_amount_type,jsonb_typeof(details->'before'->'amount') AS before_amount_type,count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type IN('pricing.price_list_items','pricing.price_floor_rules') GROUP BY 1,2,3 ORDER BY 1,2,3;

DO $$ BEGIN
 IF (SELECT count(*) FROM pricing.price_list_items WHERE effective_from='2026-01-01T00:00:00.123456Z'::timestamptz AND NOT active AND amount=51)<>2
 OR (SELECT count(*) FROM pricing.price_floor_rules r JOIN catalog.product_units u ON u.company_id=r.company_id AND u.id=r.product_unit_id WHERE u.product_id IN('00000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000076') AND NOT r.active AND r.amount=11)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.price_list_items')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.price_floor_rules')<>8
 OR EXISTS(SELECT 1 FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type IN('pricing.price_list_items','pricing.price_floor_rules') AND (jsonb_typeof(details->'after'->'Amount') IS DISTINCT FROM 'number' OR (details->'before'<>'null'::jsonb AND jsonb_typeof(details->'before'->'amount') IS DISTINCT FROM 'number')))
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.price_list_items' AND details->'before'='null'::jsonb)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.price_floor_rules' AND details->'before'='null'::jsonb)<>2 THEN
 RAISE EXCEPTION 'Pricing rules must create/update once, preserve tick storage and original numeric PascalCase-body/camelCase-before audit'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM pricing.customer_price_rules WHERE customer_id='00000000-0000-0000-0000-000000000072' AND method='DISCOUNT_PERCENT' AND fixed_price IS NULL AND discount_percent=12.345678 AND NOT active AND version=2)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.customer_price_rules')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.customer_price_rules' AND details->'before'='null'::jsonb AND jsonb_typeof(details->'after'->'FixedPrice')='number')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.customer_price_rules' AND jsonb_typeof(details->'before'->'fixedPrice')='number' AND jsonb_typeof(details->'after'->'DiscountPercent')='number' AND details->'after'->'FixedPrice'='null'::jsonb)<>2 THEN
 RAISE EXCEPTION 'Customer prices must switch modes once and preserve original numeric/null audit snapshots'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM pricing.promotions WHERE name LIKE 'Closed promotion fixture café %' AND NOT active AND version=2)<>2
 OR (SELECT count(*) FROM pricing.promotion_items i JOIN pricing.promotions p ON p.company_id=i.company_id AND p.id=i.promotion_id WHERE p.name LIKE 'Closed promotion fixture café %' AND NOT i.active AND i.version=2)<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.promotions')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.promotions' AND details->'before'='null'::jsonb AND jsonb_array_length(details->'after'->'Items')=2 AND jsonb_typeof(details->'after'->'Items'->0->'Amount')='number')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='pricing.promotions' AND jsonb_array_length(details->'before'->'items')=2 AND jsonb_typeof(details->'before'->'items'->0->'amount')='number' AND jsonb_array_length(details->'after'->'Items')=0)<>2 THEN
 RAISE EXCEPTION 'Promotions must retain/deactivate items once and preserve nested original audit'; END IF;
END $$;

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['catalog.uoms','catalog.product_categories','core.regions'] LOOP
  IF (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type=t)<>4
   OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type=t AND details->'before'='null'::jsonb AND details->'after'->>'Active'='true')<>2
   OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type=t AND details->'before'->>'active'='true' AND details->'after'->>'Active'='false' AND details->>'version'='2')<>2 THEN
   RAISE EXCEPTION 'Lookup master audit mismatch: %',t;
  END IF;
 END LOOP;
 IF NOT (SELECT active FROM catalog.uoms WHERE id='00000000-0000-0000-0000-000000000015') THEN RAISE EXCEPTION 'Used UOM deactivated'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM catalog.warehouses WHERE name LIKE 'Closed warehouse fixture %' AND NOT active AND version=2 AND region_id IS NULL)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='catalog.warehouses')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='catalog.products' AND jsonb_typeof(details->'before'->'reorderPoint')='number' AND jsonb_typeof(details->'after'->'ReorderPoint')='number' AND details->'after'->>'ReorderPoint'='12.345678')<>2
 OR (SELECT count(*) FROM catalog.products WHERE name LIKE 'Closed product fixture %' AND item_type='SERVICE' AND status='INACTIVE' AND reorder_point=12.345678 AND version=2)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='catalog.product_units')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='catalog.product_units' AND jsonb_typeof(details->'before'->'conversionToBase')='number' AND jsonb_typeof(details->'after'->'ConversionToBase')='number')<>2
 OR (SELECT count(*) FROM catalog.product_units WHERE uom_id='00000000-0000-0000-0000-000000000219' AND NOT active AND conversion_to_base=3 AND quantity_step=.5 AND version=2)<>2 THEN RAISE EXCEPTION 'Catalog maintenance state/audit mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customers')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customers' AND jsonb_typeof(details->'before'->'creditLimit')='number' AND jsonb_typeof(details->'after'->'CreditLimit')='number' AND details->'before'->'party' ? 'legalName')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.suppliers')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.suppliers' AND details->'after'->'PaymentTermsDays'='null'::jsonb)<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.suppliers' AND details->'before'->'party' ? 'legalName')<>3
 OR (SELECT count(*) FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE p.legal_name LIKE 'Customer maintenance done %' AND c.credit_limit=11 AND c.payment_terms_days=31 AND c.status='ACTIVE' AND c.version=3)<>2
 OR (SELECT count(*) FROM crm.suppliers s JOIN crm.parties p ON p.company_id=s.company_id AND p.id=s.party_id WHERE p.legal_name LIKE 'Closed supplier fixture %' AND s.payment_terms_days=30 AND s.status='INACTIVE' AND s.version=2)<>2
 OR (SELECT legal_name FROM crm.parties WHERE id='00000000-0000-0000-0000-000000000250')<>'Shared customer maintenance done'
 THEN RAISE EXCEPTION 'CRM party maintenance audit/state mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches' AND details->'before'='null'::jsonb AND details->'after'->>'Country'='AU' AND details->'after'->>'State'='NSW' AND details->'after'->'Suburb'='null'::jsonb)<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches' AND details->'before'->>'country'='AU' AND details->'after'->>'Country'='NZ' AND details->'after'->>'Active'='false')<>2
 OR (SELECT count(*) FROM crm.customer_branches WHERE name LIKE 'Closed branch fixture %' AND customer_id='00000000-0000-0000-0000-000000000011' AND country='NZ' AND state IS NULL AND suburb IS NULL AND postcode='1010' AND NOT active AND version=2)<>2 THEN RAISE EXCEPTION 'CRM branch maintenance audit/state mismatch'; END IF;
END $$;
DO $$ BEGIN
 IF (SELECT count(*) FROM crm.collaboration_changes c JOIN crm.customer_branches b ON b.company_id=c.company_id AND b.id=c.entity_id WHERE c.entity_type='BRANCH_GEO' AND b.name LIKE 'Closed branch fixture %' AND c.version IN (1,2) AND c.snapshot->>'refreshRequired'='true')<>4
 OR (SELECT count(*) FROM crm.collaboration_changes c JOIN crm.customer_branches b ON b.company_id=c.company_id AND b.id=c.entity_id WHERE c.entity_type='BRANCH_GEO' AND b.name LIKE 'Closed branch fixture %' AND c.version=2 AND c.tombstone AND c.snapshot->>'branchVersion'='2')<>2 THEN RAISE EXCEPTION 'CRM branch mobile change feed must emit once per committed version'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.contacts')<>11
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.contacts' AND details->'before'='null'::jsonb)<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.contacts' AND jsonb_typeof(details->'before'->'branchIds')='array')<>6
 OR (SELECT count(*) FROM crm.contacts WHERE name LIKE 'Closed contact fixture %' AND NOT active AND is_accounting AND version=2 AND email='用户@例子.测试' AND phone IS NULL AND mobile IS NULL)<>4
 OR (SELECT count(*) FROM crm.contact_branch_links l JOIN crm.contacts c ON c.company_id=l.company_id AND c.id=l.contact_id WHERE c.name LIKE 'Closed contact fixture customers %' AND l.customer_branch_id='00000000-0000-0000-0000-000000000012')<>2
 OR EXISTS(SELECT 1 FROM crm.contact_branch_links l JOIN crm.contacts c ON c.company_id=l.company_id AND c.id=l.contact_id WHERE c.name IN ('Shared supplier contact final') OR c.name LIKE 'Closed contact fixture suppliers %')
 OR (SELECT count(*) FROM crm.contacts WHERE name='Shared supplier contact final' AND NOT active AND version=3)<>1 THEN RAISE EXCEPTION 'CRM contact audit/state/link mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transferred')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.written_off')<>2
 OR (SELECT count(*) FROM inventory.operations WHERE reference LIKE 'Denied control transfer %' OR reference LIKE 'Insufficient control stock %')<>0
 OR (SELECT count(*) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='TRANSFER')<>24
 OR (SELECT coalesce(sum(l.value_delta),0) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='TRANSFER')<>0
 OR (SELECT coalesce(sum(l.quantity_delta),0) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='TRANSFER')<>0
 OR (SELECT sum(l.value_delta) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='WRITE_OFF')<>-20
 OR (SELECT sum(l.quantity_delta) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='WRITE_OFF')<>-2
 OR (SELECT count(*) FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.warehouse_id='00000000-0000-0000-0000-000000000271' AND ((b.product_id='00000000-0000-0000-0000-000000000270' AND b.on_hand=98 AND v.value=980) OR (b.product_id='00000000-0000-0000-0000-000000000274' AND b.on_hand=50 AND v.value=500)))<>2
 OR EXISTS(SELECT 1 FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.warehouse_id='00000000-0000-0000-0000-000000000272' AND b.product_id IN('00000000-0000-0000-0000-000000000270','00000000-0000-0000-0000-000000000274') AND (b.on_hand<>0 OR v.value<>0))
 OR (SELECT sum(l.debit-l.credit) FROM accounting.journal_lines l JOIN accounting.account_mappings m ON m.company_id=l.company_id AND m.account_id=l.account_id WHERE m.purpose='STOCK_WRITEOFF')<>20 THEN RAISE EXCEPTION 'Inventory control exactly-once quantity/valuation/journal mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.count_started')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.count_submitted')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.count_posted')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.count_cancelled')<>4
 OR (SELECT count(*) FROM inventory.counts c WHERE state='POSTED' AND NOT EXISTS(SELECT 1 FROM inventory.bin_counts b WHERE b.company_id=c.company_id AND b.id=c.id))<>4
 OR (SELECT count(*) FROM inventory.counts c WHERE state='CANCELLED' AND NOT EXISTS(SELECT 1 FROM inventory.bin_counts b WHERE b.company_id=c.company_id AND b.id=c.id))<>4
 OR (SELECT count(*) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='COUNT' AND NOT EXISTS(SELECT 1 FROM inventory.bin_counts b WHERE b.company_id=o.company_id AND b.id=o.id))<>8
 OR (SELECT sum(l.value_delta) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='COUNT' AND NOT EXISTS(SELECT 1 FROM inventory.bin_counts b WHERE b.company_id=o.company_id AND b.id=o.id))<>0
 OR (SELECT sum(l.quantity_delta) FROM inventory.operation_lines l JOIN inventory.operations o ON o.company_id=l.company_id AND o.id=l.operation_id WHERE o.kind='COUNT' AND NOT EXISTS(SELECT 1 FROM inventory.bin_counts b WHERE b.company_id=o.company_id AND b.id=o.id))<>0
 OR EXISTS(SELECT 1 FROM inventory.operations o JOIN inventory.counts c ON c.company_id=o.company_id AND c.id=o.id WHERE c.reference LIKE 'Count stale ABA %')
 OR (SELECT sum(l.debit-l.credit) FROM accounting.journal_lines l JOIN accounting.account_mappings m ON m.company_id=l.company_id AND m.account_id=l.account_id WHERE m.purpose='STOCK_LOSS')<>64.68
 OR (SELECT sum(l.credit-l.debit) FROM accounting.journal_lines l JOIN accounting.account_mappings m ON m.company_id=l.company_id AND m.account_id=l.account_id WHERE m.purpose='STOCK_GAIN')<>64.68 THEN RAISE EXCEPTION 'Stock count exactly-once snapshot, quantity, valuation or journals mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_started')<>10
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_discover')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_submit')<>16
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_recount')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_approve')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_post')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_count_cancel')<>4
 OR (SELECT count(*) FROM inventory.bin_counts b JOIN inventory.counts c ON c.company_id=b.company_id AND c.id=b.id WHERE b.state='POSTED' AND b.version=7 AND b.current_round=2 AND b.approved_by='00000000-0000-0000-0000-000000000306' AND c.reference LIKE 'Blind variance fixture %')<>2
 OR (SELECT count(*) FROM inventory.bin_counts WHERE state='CANCELLED' AND version=2)<>2
 OR (SELECT count(*) FROM inventory.bin_count_rounds)<>18
 OR (SELECT count(*) FROM inventory.bin_count_decisions)<>24
 OR (SELECT count(*) FROM inventory.bin_count_readings)<>44
 OR EXISTS(SELECT 1 FROM inventory.bin_counts s JOIN inventory.operations o ON o.company_id=s.company_id AND o.id=s.id WHERE s.state='CANCELLED')
 OR (SELECT count(*) FROM inventory.operation_lines l JOIN inventory.bin_counts b ON b.company_id=l.company_id AND b.id=l.operation_id WHERE b.state='POSTED' AND l.product_id<>'00000000-0000-0000-0000-000000000360' AND l.quantity_delta=0 AND l.value_delta=0)<>4
 OR EXISTS(SELECT 1 FROM inventory.bin_counts b JOIN inventory.operations o ON o.company_id=b.company_id AND o.id=b.id JOIN inventory.counts c ON c.company_id=b.company_id AND c.id=b.id WHERE b.state='POSTED' AND c.reference LIKE 'Blind variance fixture %' AND o.journal_entry_id IS NOT NULL)
 OR EXISTS(SELECT 1 FROM inventory.stock_balances b WHERE b.warehouse_id='00000000-0000-0000-0000-000000000271' AND b.product_id IN('00000000-0000-0000-0000-000000000270','00000000-0000-0000-0000-000000000274') AND b.on_hand<>(SELECT sum(p.quantity) FROM inventory.positions p WHERE p.company_id=b.company_id AND p.stock_balance_id=b.id)) THEN RAISE EXCEPTION 'Blind bin count independent review, readings, position or economic proof mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM inventory.bin_counts b JOIN inventory.counts c ON c.company_id=b.company_id AND c.id=b.id WHERE c.reference LIKE 'Blind economic %' AND b.state='POSTED' AND b.current_round=2)<>4
 OR (SELECT count(*) FROM inventory.bin_counts b JOIN inventory.counts c ON c.company_id=b.company_id AND c.id=b.id WHERE c.reference LIKE 'Blind reserved guard %' AND b.state='CANCELLED')<>2
 OR (SELECT count(*) FROM inventory.operation_lines l JOIN inventory.bin_counts b ON b.company_id=l.company_id AND b.id=l.operation_id WHERE l.product_id='00000000-0000-0000-0000-000000000360' AND abs(l.quantity_delta)=2 AND abs(l.value_delta)=12.34)<>4
 OR (SELECT count(*) FROM inventory.operations o JOIN inventory.counts c ON c.company_id=o.company_id AND c.id=o.id WHERE c.reference LIKE 'Blind economic %' AND o.journal_entry_id IS NOT NULL)<>4
 OR (SELECT count(*) FROM inventory.position_movements m JOIN inventory.counts c ON c.company_id=m.company_id AND c.id=m.document_id WHERE c.reference LIKE 'Blind economic gain %' AND m.reason='BIN_COUNT_APPLIED' AND abs(m.quantity)=2)<>4
 OR EXISTS(SELECT 1 FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.product_id='00000000-0000-0000-0000-000000000360' AND (b.on_hand<>0 OR b.reserved<>0 OR v.value<>0))
 OR EXISTS(SELECT 1 FROM inventory.positions p JOIN inventory.stock_balances b ON b.company_id=p.company_id AND b.id=p.stock_balance_id WHERE b.product_id='00000000-0000-0000-0000-000000000360' AND p.quantity<>0)
 OR (SELECT count(*) FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id WHERE o.creation_reason LIKE 'Reserved blind inventory guard %' AND r.quantity=1 AND r.released_quantity=1 AND r.consumed_quantity=0)<>2 THEN RAISE EXCEPTION 'Blind economic cents, reservation, carrying value or position ledger mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_created')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_changed')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.location_moved')<>4
 OR (SELECT count(*) FROM inventory.location_moves WHERE reference LIKE 'Location %')<>4
 OR (SELECT count(*) FROM inventory.position_movements m JOIN inventory.location_moves l ON l.company_id=m.company_id AND l.id=m.document_id WHERE l.reference LIKE 'Location %' AND abs(m.quantity)=2)<>8
 OR (SELECT count(*) FROM inventory.bins WHERE code LIKE 'LOC_%' AND NOT active AND version=2 AND name='Closed synthetic bin')<>2
 OR EXISTS(SELECT 1 FROM inventory.positions p JOIN inventory.bins b ON b.company_id=p.company_id AND b.id=p.bin_id WHERE b.code LIKE 'LOC_%' AND p.quantity<>0)
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.short_pick_recorded')<>2
 OR (SELECT count(*) FROM inventory.pick_shortages s JOIN inventory.picks p ON p.company_id=s.company_id AND p.id=s.pick_id JOIN sales.orders o ON o.company_id=p.company_id AND o.id=p.order_id WHERE o.creation_reason LIKE 'Warehouse details partial pick %' AND s.missing_quantity=1 AND s.reason='Synthetic one unit shortage' AND p.state='CANCELLED')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.location_moved' AND jsonb_typeof(details->'BaseQuantity')='number' AND details->'CountId'='null'::jsonb)<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_created' AND details->>'WarehouseId'='00000000-0000-0000-0000-000000000271')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.bin_changed' AND details->'Active'='false'::jsonb)<>2
 THEN RAISE EXCEPTION 'Warehouse location conservation, exactly-once audit or short-pick reason mismatch'; END IF;
END $$;

-- Narrow locking privilege must not make immutable order lines editable.
SET LOCAL ROLE htt_app;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);
DO $$ DECLARE line_id uuid; rejected boolean:=false; BEGIN
 IF NOT has_column_privilege(current_user,'sales.order_lines','id','UPDATE')
 OR has_table_privilege(current_user,'sales.order_lines','UPDATE')
 OR has_column_privilege(current_user,'sales.order_lines','quantity','UPDATE')
 OR has_table_privilege(current_user,'sales.order_lines','DELETE') THEN RAISE EXCEPTION 'Short-pick lock privilege is broader than the immutable id column'; END IF;
 SELECT l.id INTO STRICT line_id FROM sales.order_lines l JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id WHERE o.creation_reason LIKE 'Warehouse details partial pick %' LIMIT 1 FOR UPDATE OF l;
 BEGIN UPDATE sales.order_lines SET id=id WHERE id=line_id;
 EXCEPTION WHEN check_violation THEN
  IF SQLERRM<>'Append-only record; post a reversal instead' THEN RAISE; END IF; rejected:=true;
 END;
 IF NOT rejected THEN RAISE EXCEPTION 'Order lines became mutable after row-lock grant'; END IF;
 RAISE NOTICE 'Short-pick row lock allowed; actual UPDATE still rejected by unchanged append_only trigger';
END $$;
RESET ROLE;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transit_dispatched')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transit_received')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transit_returned')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transit_shortage_posted')<>2
 OR (SELECT count(*) FROM inventory.transit_transfer_balances WHERE state='CLOSED' AND remaining_cost=0 AND remaining_line_count=0)<>3
 OR (SELECT count(*) FROM inventory.transit_transfer_lines)<>5
 OR (SELECT count(*) FROM inventory.transit_events)<>7
 OR (SELECT count(*) FROM inventory.transit_event_lines)<>13
 OR (SELECT count(*) FROM inventory.transit_transfer_lines WHERE quantity=3 AND cost=10.01)<>4
 OR (SELECT count(*) FROM inventory.transit_event_lines l JOIN inventory.transit_events e ON e.company_id=l.company_id AND e.id=l.event_id WHERE e.kind='RECEIPT' AND l.quantity=1 AND l.cost=3.34)<>4
 OR (SELECT count(*) FROM inventory.transit_event_lines l JOIN inventory.transit_events e ON e.company_id=l.company_id AND e.id=l.event_id WHERE e.kind='RETURN' AND l.quantity=1 AND l.cost=3.33)<>4
 OR (SELECT count(*) FROM inventory.transit_event_lines l JOIN inventory.transit_events e ON e.company_id=l.company_id AND e.id=l.event_id WHERE e.kind='SHORTAGE' AND l.quantity=1 AND l.cost=3.34 AND l.stock_balance_id IS NULL)<>4
 OR (SELECT count(*) FROM inventory.transit_transfers WHERE journal_entry_id IS NOT NULL)<>2
 OR (SELECT count(*) FROM inventory.transit_events WHERE journal_entry_id IS NOT NULL)<>6
 OR (SELECT sum(l.debit-l.credit) FROM accounting.journal_lines l JOIN accounting.account_mappings m ON m.company_id=l.company_id AND m.account_id=l.account_id WHERE m.purpose='INVENTORY_TRANSIT')<>0
 OR (SELECT sum(l.debit-l.credit) FROM accounting.journal_lines l JOIN accounting.account_mappings m ON m.company_id=l.company_id AND m.account_id=l.account_id WHERE m.purpose='TRANSIT_LOSS')<>13.36
 OR (SELECT count(*) FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.product_id IN('00000000-0000-0000-0000-000000000380','00000000-0000-0000-0000-000000000384') AND b.warehouse_id='00000000-0000-0000-0000-000000000271' AND b.on_hand=2 AND b.reserved=0 AND v.value=6.66)<>2
 OR (SELECT count(*) FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.product_id IN('00000000-0000-0000-0000-000000000380','00000000-0000-0000-0000-000000000384') AND b.warehouse_id='00000000-0000-0000-0000-000000000272' AND b.on_hand=2 AND b.reserved=0 AND v.value=6.68)<>2
 OR (SELECT count(*) FROM inventory.stock_balances b JOIN inventory.stock_values v ON v.company_id=b.company_id AND v.stock_balance_id=b.id WHERE b.product_id='00000000-0000-0000-0000-000000000388' AND b.warehouse_id='00000000-0000-0000-0000-000000000272' AND b.on_hand=1 AND v.value=0)<>1
 OR EXISTS(SELECT 1 FROM inventory.stock_balances b WHERE b.product_id IN('00000000-0000-0000-0000-000000000380','00000000-0000-0000-0000-000000000384','00000000-0000-0000-0000-000000000388') AND b.on_hand<>(SELECT sum(p.quantity) FROM inventory.positions p WHERE p.company_id=b.company_id AND p.stock_balance_id=b.id))
 OR (SELECT count(*) FROM platform.audit_events WHERE action='inventory.transit_dispatched' AND details->>'SourceWarehouseId'='00000000-0000-0000-0000-000000000271' AND details->>'DestinationWarehouseId'='00000000-0000-0000-0000-000000000272')<>3
 THEN RAISE EXCEPTION 'Transit frozen cost, warehouse valuation, exactly-once journals or position conservation mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_created')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_changed')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_default_changed')<>4
 OR (SELECT count(*) FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id WHERE a.code LIKE 'ZZBK_%' AND NOT b.active AND b.version=3 AND a.active AND a.kind='ASSET' AND a.control_kind='BANK')<>6
 OR (SELECT count(*) FROM accounting.bank_accounts WHERE id='00000000-0000-0000-0000-000000000410' AND kind='BANK' AND NOT active AND version=3 AND bsb='123457' AND account_number='0000000000410')<>1
 OR (SELECT count(*) FROM accounting.account_mappings WHERE company_id='00000000-0000-0000-0000-000000000001' AND purpose='BANK' AND account_id='00000000-0000-0000-0000-000000000038' AND version=5)<>1
 OR (SELECT count(*) FROM platform.audit_events WHERE action IN('accounting.bank_created','accounting.bank_changed') AND details ? 'Active' AND details ? 'accountHolder' AND NOT details ? 'bsb' AND NOT details ? 'accountNumber')<>14
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_default_changed' AND details ? 'BankAccountId')<>4
 OR EXISTS(SELECT 1 FROM accounting.journal_lines l JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id WHERE a.code LIKE 'ZZBK_%' OR a.code='ZZ_BANK_LEGACY')
 THEN RAISE EXCEPTION 'Bank directory identity/version/default/audit or unchanged GL mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action LIKE 'accounting.ledger%' OR action LIKE 'accounting.trial%' OR action LIKE 'accounting.journal_read%')<>0
 OR EXISTS(SELECT 1 FROM accounting.journal_lines WHERE company_id='00000000-0000-0000-0000-000000000021')
 OR (SELECT count(*) FROM accounting.accounts WHERE id='00000000-0000-0000-0000-000000000423' AND company_id='00000000-0000-0000-0000-000000000021' AND code='OTHER_LEDGER_TEST')<>1
 THEN RAISE EXCEPTION 'Ledger reads unexpectedly wrote data or crossed company scope'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM accounting.bank_transactions WHERE reference LIKE 'General %')<>10
 OR (SELECT count(*) FROM accounting.bank_transaction_reversals v JOIN accounting.bank_transactions h ON h.company_id=v.company_id AND h.id=v.original_id WHERE h.reference LIKE 'General %')<>10
 OR (SELECT count(*) FROM accounting.bank_transaction_lines l JOIN accounting.bank_transactions h ON h.company_id=l.company_id AND h.id=l.transaction_id WHERE h.reference LIKE 'General %')<>10
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.general_bank_posted')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_transferred')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_line_classified')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.general_bank_reversed')<>13
 OR (SELECT count(*) FROM accounting.bank_transaction_lines l JOIN accounting.bank_transactions h ON h.company_id=l.company_id AND h.id=l.transaction_id WHERE h.kind='PAY' AND h.reference LIKE 'General %' AND l.net=100 AND l.tax=10 AND l.recoverable_tax=7.5 AND l.input_taxed_percent=25)<>2
 OR EXISTS(SELECT 1 FROM accounting.journal_lines l WHERE l.account_id IN('00000000-0000-0000-0000-000000000430','00000000-0000-0000-0000-000000000431','00000000-0000-0000-0000-000000000432','00000000-0000-0000-0000-000000000433','00000000-0000-0000-0000-000000000434') GROUP BY l.account_id HAVING sum(l.debit)<>sum(l.credit))
 OR EXISTS(SELECT 1 FROM accounting.bank_transaction_events e JOIN accounting.bank_transactions h ON h.company_id=e.company_id AND h.id=e.original_id WHERE h.reference LIKE 'General %' GROUP BY e.kind HAVING sum(e.net)<>0 OR sum(e.tax)<>0 OR sum(e.recoverable_tax)<>0)
 OR (SELECT count(*) FROM accounting.bank_statements WHERE reference LIKE 'General classification statement %')<>2
 OR EXISTS(SELECT 1 FROM accounting.active_bank_matches m JOIN accounting.bank_statement_lines l ON l.company_id=m.company_id AND l.id=m.statement_line_id JOIN accounting.bank_statements s ON s.company_id=l.company_id AND s.id=l.statement_id WHERE s.reference LIKE 'General classification statement %')
 THEN RAISE EXCEPTION 'General banking source, reversal, GST, exactly-once or released match mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_matched')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_match_released')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_reconciled')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_reconciliation_reopened')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_statement_voided')<>2
 OR (SELECT count(*) FROM accounting.bank_statements s JOIN accounting.bank_statement_controls c ON c.company_id=s.company_id AND c.id=s.id WHERE s.reference LIKE 'General classification statement %' AND c.state='VOID')<>2
 THEN RAISE EXCEPTION 'Bank clearing exactly-once audits or void state mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_rule_saved')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_rule_previewed')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_rule_executed')<>2
 OR (SELECT count(*) FROM accounting.bank_rule_executions)<>2
 OR (SELECT count(*) FROM accounting.bank_rule_revisions)<>8
 OR EXISTS(SELECT 1 FROM accounting.bank_rule_executions e LEFT JOIN accounting.bank_transaction_reversals v ON v.company_id=e.company_id AND v.original_id=e.source_document_id WHERE v.id IS NULL)
 THEN RAISE EXCEPTION 'Bank rule execution/source/revision exactly-once mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM bankfeeds.connections WHERE environment='SANDBOX' AND state='REVOKING')<>2
 OR (SELECT count(*) FROM bankfeeds.jobs)<>8
 OR (SELECT count(*) FROM bankfeeds.jobs WHERE state='PENDING' AND kind='REVOKE')<>2
 OR (SELECT count(*) FROM bankfeeds.batches)<>0
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_feed_created')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_feed_queued')<>8
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bank_feed_completed')<>0
 OR EXISTS(SELECT 1 FROM accounting.journal_lines WHERE account_id IN('00000000-0000-0000-0000-000000000470','00000000-0000-0000-0000-000000000471'))
 THEN RAISE EXCEPTION 'Feed command, exactly-once queue or isolated/no-posting mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.cash_scope_changed')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.cash_flow_classified')<>6
 OR (SELECT count(*) FROM accounting.cash_flow_scopes WHERE bank_account_id IN('00000000-0000-0000-0000-000000000470','00000000-0000-0000-0000-000000000471') AND included AND NOT review_required)<>2
 THEN RAISE EXCEPTION 'Cash scope/classification exactly-once mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_period_created')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_method_changed')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_finalize')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_record_lodgement')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_reopen')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.bas_classified')<>2
 OR (SELECT count(*) FROM accounting.bas_period_controls WHERE state='OPEN')<>3
 OR (SELECT count(*) FROM accounting.bas_snapshots)<>3
 OR (SELECT count(*) FROM accounting.bas_period_events)<>8
 THEN RAISE EXCEPTION 'BAS local lifecycle/method/classification exactly-once mismatch'; END IF;
END $$;

DO $$ DECLARE mismatches jsonb; prior_actor uuid:=core.current_actor(); BEGIN
 PERFORM set_config('htt.actor_id','00000000-0000-0000-0000-000000000450',true);
 SELECT jsonb_agg(to_jsonb(x)) INTO mismatches FROM accounting.reconciliation_checks() x WHERE expected IS DISTINCT FROM actual;
 IF mismatches IS NOT NULL THEN RAISE EXCEPTION 'Global current reconciliation mismatch: %',mismatches; END IF;
 PERFORM set_config('htt.actor_id',prior_actor::text,true);
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.fiscal_year_created')<>1
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.retained_earnings_configured')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.period_close')<>25
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.period_reopen')<>25
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.year_close')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.year_reopen')<>2
 OR (SELECT count(*) FROM accounting.year_end_closings WHERE profit=0 AND journal_entry_id IS NULL)<>1
 OR (SELECT count(*) FROM accounting.year_end_reversals WHERE journal_entry_id IS NULL)<>1
 OR (SELECT count(*) FROM accounting.period_close_snapshots)<>25
 OR (SELECT count(*) FROM accounting.period_close_events)<>50
 THEN RAISE EXCEPTION 'Period/fiscal close exactly-once or zero-nominal evidence mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM accounting.year_end_closings WHERE profit=100 AND journal_entry_id IS NOT NULL)<>1
 OR (SELECT count(*) FROM accounting.year_end_reversals WHERE journal_entry_id IS NOT NULL)<>1
 OR EXISTS(SELECT 1 FROM accounting.year_end_closings c JOIN accounting.journal_lines l ON l.company_id=c.company_id AND l.journal_entry_id=c.journal_entry_id LEFT JOIN accounting.year_end_reversals r ON r.company_id=c.company_id AND r.closing_id=c.id LEFT JOIN accounting.journal_lines rev ON rev.company_id=r.company_id AND rev.journal_entry_id=r.journal_entry_id AND rev.account_id=l.account_id WHERE c.profit=100 AND (rev.id IS NULL OR rev.debit<>l.credit OR rev.credit<>l.debit))
 THEN RAISE EXCEPTION 'Nonzero year-end closing or exact reversal proof mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM accounting.customer_statements)<>2
 OR (SELECT count(*) FROM accounting.operating_report_runs)<>12
 OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.statement_captured')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='reports.operating_captured')<>10
 THEN RAISE EXCEPTION 'Frozen statement/operating report exactly-once mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.document_jobs j JOIN accounting.operating_report_runs r ON r.company_id=j.company_id AND r.id=j.document_id WHERE j.kind='EXPORT' AND j.source_version=1 AND j.state='QUEUED')<>10
 OR (SELECT count(*) FROM platform.audit_events WHERE action='reports.export_requested')<>10
 OR EXISTS(SELECT 1 FROM platform.document_jobs j JOIN accounting.operating_report_runs r ON r.company_id=j.company_id AND r.id=j.document_id WHERE j.kind='EXPORT' AND (j.payload->>'snapshotHash' IS DISTINCT FROM r.sha256 OR jsonb_array_length(j.payload->'columns')=0))
 THEN RAISE EXCEPTION 'Frozen report export uniqueness/payload binding or worker isolation mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.analytics_checkpoint')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='sales.attribution_assigned')<>4
 THEN RAISE EXCEPTION 'Analytics checkpoint or frozen attribution audit mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM sales.orders WHERE creation_reason LIKE 'Synthetic attribution service %' AND cancelled_at IS NOT NULL)<>2
 OR EXISTS(SELECT 1 FROM sales.invoices i JOIN sales.orders o ON o.company_id=i.company_id AND o.id=i.order_id WHERE o.creation_reason LIKE 'Synthetic attribution service %')
 OR EXISTS(SELECT 1 FROM sales.credit_commitments c JOIN sales.orders o ON o.company_id=c.company_id AND o.id=c.order_id WHERE o.creation_reason LIKE 'Synthetic attribution service %' AND c.amount<>c.released_amount)
 THEN RAISE EXCEPTION 'Synthetic attribution order freeze/credit restoration mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM reporting.saved_reports)<>2
 OR (SELECT count(*) FROM reporting.packs)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='reports.saved_changed')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='reports.pack_captured')<>2
 THEN RAISE EXCEPTION 'Saved report/pack read fixture or visibility mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM reporting.preferences WHERE user_id='00000000-0000-0000-0000-000000000500' AND version=2 AND format->>'header'='' AND format->>'footer'='')<>1
 THEN RAISE EXCEPTION 'Report formatting idempotency or restored defaults mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='settings.business_changed')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='settings.numbering_changed')<>4
 OR EXISTS(SELECT 1 FROM platform.audit_events WHERE action='settings.business_changed' AND NOT(details ?& ARRAY['SalesTermsDays','PurchaseTermsDays','QuoteValidDays','DefaultDispatchMode','Notes']))
 OR EXISTS(SELECT 1 FROM platform.audit_events WHERE action='settings.numbering_changed' AND NOT(details ?& ARRAY['type','prefix','NextValue']))
 OR (SELECT count(*) FROM core.business_preferences WHERE company_id='00000000-0000-0000-0000-000000000001' AND version=5 AND sales_terms_days=30 AND purchase_terms_days=30 AND quote_valid_days=30 AND default_dispatch_mode='PICKUP' AND notes='')<>1
 THEN RAISE EXCEPTION 'Business settings restoration or exact-once audit details mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM catalog.unit_barcodes WHERE barcode LIKE 'JV-COMPAT-BARCODE-%' AND NOT active AND version=2)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='catalog.barcode_created')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='catalog.barcode_changed')<>2
 OR EXISTS(SELECT 1 FROM platform.audit_events WHERE action='catalog.barcode_created' AND NOT(details ?& ARRAY['ProductUnitId','barcode']))
 OR EXISTS(SELECT 1 FROM platform.audit_events WHERE action='catalog.barcode_changed' AND details<> '{"Active":false}'::jsonb)
 THEN RAISE EXCEPTION 'Unit barcode exactly-once/audit/status mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.mobile_drafts WHERE owner_id='00000000-0000-0000-0000-000000000500' AND state='DELETED')<>5
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.create')<>9
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.DELETE')<>3
 THEN RAISE EXCEPTION 'Synthetic CRM draft read fixture or cleanup mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.mobile_drafts WHERE state='REJECTED')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.UPDATE')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.SUBMIT')<>6
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.review')<>6
 OR (SELECT count(*) FROM crm.mobile_drafts WHERE formal_id IS NOT NULL AND state='APPROVED')<>3
 THEN RAISE EXCEPTION 'CRM draft transitions and approved formal links must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM crm.mobile_drafts d WHERE d.state='APPROVED' AND d.kind='CUSTOMER' AND(
 NOT EXISTS(SELECT 1 FROM crm.customers c JOIN crm.customer_credit_exposures e ON e.company_id=c.company_id AND e.customer_id=c.id WHERE c.company_id=d.company_id AND c.id=d.formal_id AND c.credit_limit=0 AND c.payment_terms_days=30)
 OR NOT EXISTS(SELECT 1 FROM identity.customer_assignments a JOIN identity.memberships m ON m.company_id=a.company_id AND m.id=a.membership_id WHERE a.company_id=d.company_id AND a.customer_id=d.formal_id AND m.user_id=d.owner_id)))
 OR EXISTS(SELECT 1 FROM crm.mobile_drafts d WHERE d.state='APPROVED' AND d.kind='BRANCH' AND NOT EXISTS(SELECT 1 FROM crm.customer_branches b WHERE b.company_id=d.company_id AND b.id=d.formal_id AND b.customer_id=d.customer_id AND b.country='AU'))
 OR EXISTS(SELECT 1 FROM crm.mobile_drafts d WHERE d.state='APPROVED' AND d.kind='CONTACT' AND NOT EXISTS(SELECT 1 FROM crm.contacts c JOIN crm.contact_branch_links l ON l.company_id=c.company_id AND l.contact_id=c.id WHERE c.company_id=d.company_id AND c.id=d.formal_id AND c.phone='+61298765432' AND l.customer_branch_id=(d.data->'branchIds'->>0)::uuid))
 THEN RAISE EXCEPTION 'Approved CRM entity links, owner assignment or exposure mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.mobile_devices WHERE actor_id='00000000-0000-0000-0000-000000000500' AND NOT active AND last_sequence=7)<>2
 OR (SELECT count(*) FROM crm.mobile_operations WHERE request->>'domain' IS NULL)<>14
 OR (SELECT count(*) FROM crm.mobile_operations WHERE request->>'domain' IS NULL AND response->>'status'='CONFLICT')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.device' AND actor_id='00000000-0000-0000-0000-000000000500')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.device_revoke' AND actor_id='00000000-0000-0000-0000-000000000500')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.push')<>14
 THEN RAISE EXCEPTION 'Mobile device, operation sequence, conflict persistence or audit mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.contact_imports WHERE confirmed)<>2
 OR (SELECT count(*) FROM crm.mobile_drafts WHERE kind='CONTACT' AND state='DRAFT' AND data->>'name' LIKE 'Synthetic selected contact %')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.import_preview')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.import_confirm')<>2
 THEN RAISE EXCEPTION 'Selected contact import must create drafts exactly once without formal contact writes'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.card_jobs WHERE state='SUCCEEDED' AND attempts=1 AND draft_id IS NOT NULL)<>2
 OR (SELECT count(*) FROM crm.mobile_drafts WHERE state='DRAFT' AND kind='CONTACT' AND data->>'name' LIKE 'Synthetic card contact %')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.card_queue')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.card_retry')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.card_confirm')<>2
 THEN RAISE EXCEPTION 'Card API job retry/confirmation must create drafts exactly once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_update')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_delete')<>1
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_remove' AND actor_id='00000000-0000-0000-0000-000000000500')<>1
 THEN RAISE EXCEPTION 'Collaboration updates, deletion and removal must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_checkout' AND actor_id='00000000-0000-0000-0000-000000000500')<>1
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_cancel' AND actor_id='00000000-0000-0000-0000-000000000500')<>1
 THEN RAISE EXCEPTION 'Synthetic checkout and cancellation must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_coordinates' AND actor_id='00000000-0000-0000-0000-000000000500')<>2
 THEN RAISE EXCEPTION 'Synthetic manual coordinate writes must execute once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.geocode_jobs WHERE state='SUCCEEDED' AND attempts=1)<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_geocode' AND actor_id='00000000-0000-0000-0000-000000000500')<>3
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_geocode_retry' AND actor_id='00000000-0000-0000-0000-000000000500')<>2
 THEN RAISE EXCEPTION 'Synthetic geocode queue/retry/completion mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.customer_branches WHERE code LIKE 'JV_GEO_%' AND name LIKE 'Synthetic geocode branch %' AND country='AU' AND state='NSW' AND active AND version=1)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches' AND actor_id='00000000-0000-0000-0000-000000000500' AND details->'before'='null'::jsonb)<>2
 THEN RAISE EXCEPTION 'New synthetic geocode branches must be distinct audited creations'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.mobile_operations WHERE request->>'domain'='COLLABORATION')<>12
 OR (SELECT count(*) FROM crm.mobile_operations WHERE request->>'domain'='COLLABORATION' AND response->>'status'='CONFLICT')<>2
 OR (SELECT count(*) FROM crm.mobile_devices WHERE actor_id='00000000-0000-0000-0000-000000000503' AND NOT active AND last_sequence=6)<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.collaboration_push' AND actor_id='00000000-0000-0000-0000-000000000503')<>12
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.device' AND actor_id='00000000-0000-0000-0000-000000000503')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.device_revoke' AND actor_id='00000000-0000-0000-0000-000000000503')<>2
 THEN RAISE EXCEPTION 'Collaboration device/domain operations and audit mismatch'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM crm.tasks WHERE creator_id='00000000-0000-0000-0000-000000000500' AND state='DELETED')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_create')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_delete')<>2
 THEN RAISE EXCEPTION 'Task read fixtures and deletion must be auditable once'; END IF;
END $$;

DO $$ BEGIN
 IF (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_update')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_start')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_complete')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_cancel')<>2
 OR (SELECT count(*) FROM platform.audit_events WHERE action='crm.tasks_reopen')<>4
 THEN RAISE EXCEPTION 'Task state transitions must execute once across shared retries'; END IF;
END $$;
