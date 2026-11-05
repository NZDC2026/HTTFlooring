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
END $$;
