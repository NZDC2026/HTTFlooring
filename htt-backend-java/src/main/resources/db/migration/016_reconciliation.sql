-- Diagnostics only: never repair immutable ledgers or mutable projections from a report.
INSERT INTO identity.permissions(code,description) VALUES
 ('accounting.reconciliation.read','Read company-wide inventory, settlement and GL consistency checks');
CREATE FUNCTION identity.seed_reconciliation_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code)
 SELECT c,id,'accounting.reconciliation.read' FROM identity.roles
 WHERE company_id=c AND code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP
 PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_reconciliation_roles(c);
 END LOOP;PERFORM set_config('htt.company_id','',true);END $$;

-- One invocation observes one statement snapshot, including concurrent multi-table postings.
-- Entity IDs refer to stock balances, customers, parties, accounts or journal entries as documented.
CREATE FUNCTION accounting.require_reconciliation_access() RETURNS void
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT purchase.require_access('accounting.reconciliation.read')
$$;
CREATE FUNCTION accounting.reconciliation_checks()
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
 ), ar_lines AS (
  SELECT il.id,i.customer_id,i.party_id,il.gross
   -coalesce((SELECT sum(p.amount) FROM accounting.payment_allocations p WHERE p.company_id=il.company_id AND p.invoice_line_id=il.id),0)
   -coalesce((SELECT sum(c.gross) FROM sales.credit_note_lines c WHERE c.company_id=il.company_id AND c.invoice_line_id=il.id),0)
   +coalesce((SELECT sum(f.amount) FROM accounting.customer_refunds f JOIN sales.credit_note_lines cl ON cl.company_id=f.company_id AND cl.id=f.credit_line_id WHERE cl.company_id=il.company_id AND cl.invoice_line_id=il.id),0) AS balance
  FROM sales.invoice_lines il JOIN sales.invoices i ON i.company_id=il.company_id AND i.id=il.invoice_id WHERE il.company_id=core.current_company()
 ), ar_customer AS (SELECT customer_id,sum(balance) AS balance FROM ar_lines GROUP BY customer_id),
 ar_party AS (SELECT party_id,sum(balance) AS balance FROM ar_lines GROUP BY party_id),
 customer_advances AS (
  SELECT a.id,r.customer_id,a.advance_account_id,a.clearing_account_id,a.amount
   -coalesce((SELECT sum(ap.amount) FROM accounting.advance_applications ap WHERE ap.company_id=a.company_id AND ap.advance_id=a.id),0)
   -coalesce((SELECT sum(f.amount) FROM accounting.customer_refunds f WHERE f.company_id=a.company_id AND f.advance_id=a.id),0) AS balance
  FROM accounting.customer_advances a JOIN accounting.customer_receipts r ON r.company_id=a.company_id AND r.id=a.receipt_id WHERE a.company_id=core.current_company()
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
 ) SELECT code,entity,e,a,u FROM checks;
END $$;
REVOKE ALL ON FUNCTION identity.seed_reconciliation_roles(uuid),accounting.require_reconciliation_access(),accounting.reconciliation_checks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accounting.require_reconciliation_access(),accounting.reconciliation_checks() TO htt_app;
