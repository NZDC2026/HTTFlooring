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
 IF (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches')<>4
 OR (SELECT count(*) FROM platform.audit_events WHERE action='foundation.master_data_changed' AND entity_type='crm.customer_branches' AND details->'before'='null'::jsonb AND details->'after'->>'Country'='AU' AND details->'after'->>'State'='NSW' AND details->'after'->'Suburb'='null'::jsonb)<>2
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
