-- Customer-owned document reads. No direct table privileges or financial writes for htt_portal.
CREATE FUNCTION portal.sales_documents(iss text,sub text,c uuid,g uuid,b uuid,k text,
 p_id uuid DEFAULT NULL,p_page int DEFAULT 1,p_size int DEFAULT 25) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;today date;result jsonb;BEGIN
 cust:=portal.require_branch(iss,sub,c,g,b);
 IF k NOT IN('QUOTE','SALES_ORDER','INVOICE','CREDIT_NOTE','SALES_RETURN') OR p_page IS NULL OR p_size IS NULL
 OR p_page NOT BETWEEN 1 AND 100000 OR p_size NOT BETWEEN 1 AND 100 THEN
 RAISE EXCEPTION 'Invalid document kind or pagination' USING ERRCODE='HC422';END IF;
 SELECT (statement_timestamp() AT TIME ZONE timezone)::date INTO today FROM core.companies WHERE id=c;
 WITH source AS (
 SELECT q.id,q.customer_id,q.customer_branch_id AS branch_id,q.warehouse_id,q.status AS source_state,
 q.net,q.tax,q.gross,NULL::date AS due_on,q.expires_on,NULL::numeric AS balance
 FROM sales.quotes q WHERE q.company_id=c AND k='QUOTE' AND q.status<>'DRAFT'
 UNION ALL
 SELECT o.id,o.customer_id,o.customer_branch_id,o.warehouse_id,d.state,o.net,o.tax,o.gross,NULL,NULL,NULL
 FROM sales.orders o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id
 WHERE o.company_id=c AND k='SALES_ORDER' AND d.state<>'DRAFT'
 UNION ALL
 SELECT i.id,i.customer_id,o.customer_branch_id,o.warehouse_id,d.state,i.net,i.tax,i.gross,i.due_on,NULL,
 coalesce((SELECT sum(x.outstanding_amount) FROM sales.invoice_line_balances x WHERE x.company_id=c AND x.invoice_id=i.id),0)
 FROM sales.invoices i JOIN sales.orders o ON o.company_id=i.company_id AND o.id=i.order_id
 JOIN platform.documents d ON d.company_id=i.company_id AND d.id=i.id
 WHERE i.company_id=c AND k='INVOICE' AND d.state='POSTED' AND platform.document_visible(o.id)
 UNION ALL
 SELECT n.id,i.customer_id,o.customer_branch_id,o.warehouse_id,d.state,n.net,n.tax,n.gross,NULL,NULL,NULL
 FROM sales.credit_notes n JOIN sales.invoices i ON i.company_id=n.company_id AND i.id=n.invoice_id
 JOIN sales.orders o ON o.company_id=i.company_id AND o.id=i.order_id
 JOIN platform.documents d ON d.company_id=n.company_id AND d.id=n.id
 WHERE n.company_id=c AND k='CREDIT_NOTE' AND d.state='POSTED' AND platform.document_visible(i.id) AND platform.document_visible(o.id)
 UNION ALL
 SELECT r.id,o.customer_id,o.customer_branch_id,r.warehouse_id,d.state,NULL,NULL,NULL,NULL,NULL,NULL
 FROM inventory.sales_returns r JOIN sales.orders o ON o.company_id=r.company_id AND o.id=r.order_id
 JOIN platform.documents d ON d.company_id=r.company_id AND d.id=r.id
 WHERE r.company_id=c AND k='SALES_RETURN' AND d.state<>'DRAFT' AND platform.document_visible(o.id)
 ), visible AS (
 SELECT s.*,d.number,d.version,d.business_date FROM source s
 JOIN platform.documents d ON d.company_id=c AND d.id=s.id
 WHERE s.customer_id=cust AND s.branch_id=b AND platform.document_visible(s.id)
 AND EXISTS(SELECT 1 FROM identity.customer_user_warehouse_scopes ws JOIN catalog.warehouses w ON w.company_id=ws.company_id AND w.id=ws.warehouse_id AND w.active AND w.kind='SELLABLE'
 WHERE ws.company_id=c AND ws.grant_id=g AND ws.customer_branch_id=b AND ws.warehouse_id=s.warehouse_id)
 AND (p_id IS NULL OR s.id=p_id)
 ), selected AS (SELECT * FROM visible ORDER BY business_date DESC,id LIMIT p_size OFFSET (p_page-1)*p_size)
 SELECT jsonb_build_object('items',coalesce(jsonb_agg(jsonb_build_object(
 'id',v.id,'type',k,'number',v.number,'documentNumber',v.number,'version',v.version,
 'state',v.source_state,'status',CASE WHEN k='INVOICE' THEN CASE WHEN v.balance=0 THEN 'Paid' WHEN v.due_on<today THEN 'Overdue' ELSE 'Outstanding' END ELSE v.source_state END,
 'documentDate',v.business_date,'dueDate',v.due_on,'expiresOn',v.expires_on,
 'subtotal',v.net::text,'gst',v.tax::text,'total',v.gross::text,'balance',v.balance::text,
 'branchId',v.branch_id,'warehouseId',v.warehouse_id,
 'items',CASE WHEN p_id IS NULL THEN NULL ELSE coalesce((
 SELECT jsonb_agg(jsonb_build_object('id',l.id,'productId',l.product_id,'quantity',l.quantity::text,
 'description',l.snapshot->>'name','sku',l.snapshot->>'sku','unitCode',l.snapshot->>'unitCode',
 'net',l.net::text,'tax',l.tax::text,'gross',l.gross::text) ORDER BY l.line_no) FROM (
 SELECT x.id,x.product_id,x.quantity,x.snapshot,x.net,x.tax,x.gross,dl.line_no
 FROM sales.quote_lines x JOIN platform.document_lines dl ON dl.company_id=x.company_id AND dl.id=x.id WHERE x.company_id=c AND x.quote_id=v.id AND k='QUOTE'
 UNION ALL SELECT x.id,x.product_id,x.quantity,x.snapshot,x.net,x.tax,x.gross,dl.line_no
 FROM sales.order_lines x JOIN platform.document_lines dl ON dl.company_id=x.company_id AND dl.id=x.id WHERE x.company_id=c AND x.order_id=v.id AND k='SALES_ORDER'
 UNION ALL SELECT x.id,ol.product_id,x.quantity,x.snapshot,x.net,x.tax,x.gross,dl.line_no
 FROM sales.invoice_lines x JOIN sales.order_lines ol ON ol.company_id=x.company_id AND ol.id=x.order_line_id JOIN platform.document_lines dl ON dl.company_id=x.company_id AND dl.id=x.id WHERE x.company_id=c AND x.invoice_id=v.id AND k='INVOICE'
 UNION ALL SELECT x.id,ol.product_id,x.quantity,il.snapshot,x.net,x.tax,x.gross,dl.line_no
 FROM sales.credit_note_lines x JOIN sales.invoice_lines il ON il.company_id=x.company_id AND il.id=x.invoice_line_id JOIN sales.order_lines ol ON ol.company_id=il.company_id AND ol.id=il.order_line_id JOIN platform.document_lines dl ON dl.company_id=x.company_id AND dl.id=x.id WHERE x.company_id=c AND x.credit_note_id=v.id AND k='CREDIT_NOTE'
 UNION ALL SELECT x.id,ol.product_id,x.quantity,ol.snapshot,NULL,NULL,NULL,dl.line_no
 FROM inventory.sales_return_lines x JOIN sales.order_lines ol ON ol.company_id=x.company_id AND ol.id=x.order_line_id JOIN platform.document_lines dl ON dl.company_id=x.company_id AND dl.id=x.id WHERE x.company_id=c AND x.return_id=v.id AND k='SALES_RETURN'
 )l),'[]'::jsonb) END
 ) ORDER BY v.business_date DESC,v.id),'[]'::jsonb),'page',p_page,'pageSize',p_size,
 'totalCount',(SELECT count(*) FROM visible),'currency','AUD','dataAsOf',statement_timestamp()) INTO result FROM selected v;
 IF p_id IS NOT NULL AND jsonb_array_length(result->'items')=0 THEN RAISE EXCEPTION 'Document unavailable' USING ERRCODE='HT404';END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION portal.sales_documents(text,text,uuid,uuid,uuid,text,uuid,int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION portal.sales_documents(text,text,uuid,uuid,uuid,text,uuid,int,int) TO htt_portal;
