-- Assertions against synthetic data only. A failure prevents PASSED creation.
DO $$ BEGIN
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
 IF (SELECT count(*) FROM platform.audit_events WHERE action='accounting.customer_receipt_reversed')<>4
    OR (SELECT count(*) FROM platform.audit_events WHERE action='accounting.advance_unapplied')<>2 THEN
  RAISE EXCEPTION 'Customer settlement correction audit must appear exactly once per operation';
 END IF;
 IF (SELECT coalesce(sum(debit-credit),0) FROM accounting.journal_lines WHERE account_id='00000000-0000-0000-0000-000000000056')<>0 THEN
  RAISE EXCEPTION 'Synthetic customer advance liability was not restored after reversal';
 END IF;
END $$;
