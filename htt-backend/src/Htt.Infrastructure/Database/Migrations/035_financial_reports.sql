-- Read-only reports derive historical balances from immutable business movements and GL posting dates.
INSERT INTO identity.permissions(code,description) VALUES('accounting.reports.read','Read financial statements and historical AR/AP aging');
CREATE FUNCTION identity.seed_financial_report_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,id,'accounting.reports.read' FROM identity.roles WHERE company_id=c AND code IN('ADMIN','FINANCE') ON CONFLICT DO NOTHING;
END $$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_financial_report_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE VIEW accounting.report_open_item_movements WITH(security_invoker=true) AS
SELECT x.company_id,'AR'::text AS side,x.invoice_id AS source_document_id,x.id AS item_line_id,x.gross AS amount FROM sales.invoice_lines x
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.credit_note_id AS source_document_id,x.invoice_line_id AS item_line_id,-x.gross AS amount FROM sales.credit_note_lines x
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.source_document_id AS source_document_id,x.invoice_line_id AS item_line_id,-x.amount AS amount FROM accounting.payment_allocations x
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,a.invoice_line_id AS item_line_id,a.amount AS amount FROM accounting.receipt_reversals x JOIN accounting.payment_allocations a ON a.company_id=x.company_id AND a.receipt_id=x.receipt_id AND a.advance_id IS NULL
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,a.invoice_line_id AS item_line_id,a.amount AS amount FROM accounting.advance_unapplications x JOIN accounting.payment_allocations a ON a.company_id=x.company_id AND a.source_document_id=x.application_id
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,cl.invoice_line_id AS item_line_id,x.amount AS amount FROM accounting.customer_refunds x JOIN sales.credit_note_lines cl ON cl.company_id=x.company_id AND cl.id=x.credit_line_id
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,cl.invoice_line_id AS item_line_id,-rf.amount AS amount FROM accounting.customer_refund_reversals x JOIN accounting.customer_refunds rf ON rf.company_id=x.company_id AND rf.id=x.refund_id JOIN sales.credit_note_lines cl ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.application_id AS source_document_id,x.source_invoice_line_id AS item_line_id,x.amount AS amount FROM sales.credit_application_lines x
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,a.source_invoice_line_id AS item_line_id,-a.amount AS amount FROM sales.credit_unapplications x JOIN sales.credit_application_lines a ON a.company_id=x.company_id AND a.application_id=x.application_id
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.application_id AS source_document_id,x.target_invoice_line_id AS item_line_id,-x.amount AS amount FROM sales.credit_application_lines x
UNION ALL
SELECT x.company_id,'AR'::text AS side,x.id AS source_document_id,a.target_invoice_line_id AS item_line_id,a.amount AS amount FROM sales.credit_unapplications x JOIN sales.credit_application_lines a ON a.company_id=x.company_id AND a.application_id=x.application_id
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.bill_id AS source_document_id,x.id AS item_line_id,x.net+x.tax AS amount FROM purchase.bill_lines x
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.credit_note_id AS source_document_id,x.bill_line_id AS item_line_id,-x.gross AS amount FROM purchase.supplier_credit_lines x
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.source_document_id AS source_document_id,x.bill_line_id AS item_line_id,-x.amount AS amount FROM accounting.supplier_payment_allocations x
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,a.bill_line_id AS item_line_id,a.amount AS amount FROM accounting.supplier_payment_reversals x JOIN accounting.supplier_payment_allocations a ON a.company_id=x.company_id AND a.payment_id=x.payment_id AND a.advance_id IS NULL
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,a.bill_line_id AS item_line_id,a.amount AS amount FROM accounting.supplier_advance_unapplications x JOIN accounting.supplier_payment_allocations a ON a.company_id=x.company_id AND a.source_document_id=x.application_id
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,cl.bill_line_id AS item_line_id,x.amount AS amount FROM accounting.supplier_refunds x JOIN purchase.supplier_credit_lines cl ON cl.company_id=x.company_id AND cl.id=x.credit_line_id
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,cl.bill_line_id AS item_line_id,-rf.amount AS amount FROM accounting.supplier_refund_reversals x JOIN accounting.supplier_refunds rf ON rf.company_id=x.company_id AND rf.id=x.refund_id JOIN purchase.supplier_credit_lines cl ON cl.company_id=rf.company_id AND cl.id=rf.credit_line_id
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.application_id AS source_document_id,x.source_bill_line_id AS item_line_id,x.amount AS amount FROM purchase.credit_application_lines x
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,a.source_bill_line_id AS item_line_id,-a.amount AS amount FROM purchase.credit_unapplications x JOIN purchase.credit_application_lines a ON a.company_id=x.company_id AND a.application_id=x.application_id
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.application_id AS source_document_id,x.target_bill_line_id AS item_line_id,-x.amount AS amount FROM purchase.credit_application_lines x
UNION ALL
SELECT x.company_id,'AP'::text AS side,x.id AS source_document_id,a.target_bill_line_id AS item_line_id,a.amount AS amount FROM purchase.credit_unapplications x JOIN purchase.credit_application_lines a ON a.company_id=x.company_id AND a.application_id=x.application_id;
CREATE VIEW accounting.report_control_dates WITH(security_invoker=true) AS
 SELECT j.company_id,b.source_document_id,a.control_kind AS side,min(j.posting_date) AS posting_date
 FROM accounting.journal_entries j JOIN accounting.posting_batches b ON b.company_id=j.company_id AND b.id=j.posting_batch_id JOIN accounting.journal_lines l ON l.company_id=j.company_id AND l.journal_entry_id=j.id JOIN accounting.accounts a ON a.company_id=l.company_id AND a.id=l.account_id
 WHERE a.control_kind IN('AR','AP') GROUP BY j.company_id,b.source_document_id,a.control_kind;
GRANT SELECT ON accounting.report_open_item_movements,accounting.report_control_dates TO htt_app;
REVOKE ALL ON FUNCTION identity.seed_financial_report_roles(uuid) FROM PUBLIC;
