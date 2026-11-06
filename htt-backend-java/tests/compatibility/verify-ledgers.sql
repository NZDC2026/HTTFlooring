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
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_returned')<>2 THEN
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
 IF (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_drafted')<>13
 OR (SELECT count(*) FROM platform.audit_events WHERE action='sales.quote_submitted')<>8
 OR (SELECT count(*) FROM sales.quote_submissions)<>8
 OR EXISTS(SELECT 1 FROM sales.quote_submissions ss JOIN sales.quotes q ON q.company_id=ss.company_id AND q.id=ss.quote_id WHERE q.notes='Updated café quote' AND (ss.document_version<>3 OR ss.snapshot->>'status'<>'SUBMITTED' OR (ss.snapshot->>'gross')::numeric<>135))
 OR EXISTS(SELECT quote_id,document_version FROM sales.quote_submissions GROUP BY company_id,quote_id,document_version HAVING count(*)<>1)
 OR (SELECT count(*) FROM platform.approval_requests a JOIN sales.quotes q ON q.company_id=a.company_id AND q.id=a.document_id WHERE a.document_version=3 AND a.state='STALE')<>2 THEN
 RAISE EXCEPTION 'Quote update/submit must create one matching submission and stale approval per version'; END IF;
END $$;
