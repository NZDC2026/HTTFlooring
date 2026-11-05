-- Preserved from the legacy purchasing endpoint.
SELECT rl.id AS receipt_line_id,rl.receipt_id,d.number AS receipt_number,r.order_id,r.warehouse_id,rl.order_line_id,rl.quantity,rl.net,rl.tax,rl.valuation_amount,
coalesce(m.quantity,0) AS matched_quantity,coalesce(ur.quantity,0) AS returned_unbilled_quantity,rl.quantity-coalesce(m.quantity,0)-coalesce(ur.quantity,0) AS unmatched_quantity,
rl.net-coalesce(m.net,0)-coalesce(ur.net,0) AS unmatched_net,rl.tax-coalesce(m.tax,0)-coalesce(ur.tax,0) AS unmatched_tax,gi.amount-coalesce(m.grni_amount,0)-coalesce(ur.val,0) AS outstanding_grni
FROM purchase.receipt_lines rl JOIN purchase.receipts r ON r.company_id=rl.company_id AND r.id=rl.receipt_id JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
JOIN accounting.grni_items gi ON gi.company_id=rl.company_id AND gi.receipt_line_id=rl.id
LEFT JOIN LATERAL(SELECT sum(bl.quantity) AS quantity,sum(bl.receipt_net) AS net,sum(bl.receipt_tax) AS tax,sum(bl.grni_amount) AS grni_amount FROM purchase.bill_lines bl WHERE bl.company_id=rl.company_id AND bl.receipt_line_id=rl.id)m ON true
LEFT JOIN LATERAL(SELECT sum(quantity) AS quantity,sum(net) AS net,sum(tax) AS tax,sum(valuation_amount) AS val FROM purchase.return_lines WHERE company_id=rl.company_id AND receipt_line_id=rl.id AND bill_line_id IS NULL)ur ON true
WHERE rl.company_id=:company AND r.supplier_id=:supplier AND rl.quantity>coalesce(m.quantity,0)+coalesce(ur.quantity,0) ORDER BY d.business_date,rl.id LIMIT :size OFFSET :offset
