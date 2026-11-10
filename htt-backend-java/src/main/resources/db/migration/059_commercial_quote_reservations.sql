-- Commercial holds are a separate forward-only projection, never a stock movement or journal.
CREATE TABLE inventory.quote_holds(
 company_id uuid NOT NULL,quote_id uuid NOT NULL,quote_line_id uuid NOT NULL,product_id uuid NOT NULL,
 quantity numeric(20,6) NOT NULL CHECK(quantity>0),active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(company_id,quote_line_id),FOREIGN KEY(company_id,quote_id) REFERENCES sales.quotes(company_id,id),
 FOREIGN KEY(company_id,quote_line_id) REFERENCES sales.quote_lines(company_id,id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id));
ALTER TABLE inventory.quote_holds ENABLE ROW LEVEL SECURITY;ALTER TABLE inventory.quote_holds FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON inventory.quote_holds USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE INDEX quote_holds_active ON inventory.quote_holds(company_id,product_id) WHERE active;
CREATE FUNCTION inventory.capture_quote_hold() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.status='SUBMITTED' AND OLD.status='DRAFT' AND EXISTS(SELECT 1 FROM platform.documents d WHERE d.company_id=NEW.company_id AND d.id=NEW.id AND lower(d.number) NOT LIKE '%sample%') THEN
 INSERT INTO inventory.quote_holds(company_id,quote_id,quote_line_id,product_id,quantity,active)
 SELECT NEW.company_id,NEW.id,l.id,l.product_id,l.base_quantity,true FROM sales.quote_lines l WHERE l.company_id=NEW.company_id AND l.quote_id=NEW.id AND l.item_type='STOCK'
 ON CONFLICT(company_id,quote_line_id) DO UPDATE SET quantity=excluded.quantity,active=true;
 ELSE UPDATE inventory.quote_holds SET active=false WHERE company_id=NEW.company_id AND quote_id=NEW.id;END IF;RETURN NEW;
END $$;
CREATE TRIGGER future_quote_holds AFTER UPDATE OF status ON sales.quotes FOR EACH ROW WHEN(OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION inventory.capture_quote_hold();
CREATE FUNCTION inventory.commercial_reservations() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE result jsonb;BEGIN
 PERFORM purchase.require_access('inventory.read');
 WITH holds AS (
 SELECT h.product_id,h.quantity FROM inventory.quote_holds h JOIN sales.quotes q ON q.company_id=h.company_id AND q.id=h.quote_id JOIN platform.documents qd ON qd.company_id=q.company_id AND qd.id=q.id
 WHERE h.company_id=core.current_company() AND h.active AND q.status='SUBMITTED' AND qd.state='CONFIRMED' AND platform.document_visible(q.id)
 AND NOT EXISTS(SELECT 1 FROM sales.orders o WHERE o.company_id=q.company_id AND o.source_quote_id=q.id)
 UNION ALL
 SELECT l.product_id,r.remaining_quantity FROM inventory.stock_reservations r JOIN sales.order_lines l ON l.company_id=r.company_id AND l.id=r.order_line_id
 JOIN sales.orders o ON o.company_id=l.company_id AND o.id=l.order_id JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id
 WHERE r.company_id=core.current_company() AND r.remaining_quantity>0 AND d.state<>'CANCELLED' AND lower(d.number) NOT LIKE '%sample%' AND platform.document_visible(o.id)
 ), totals AS (SELECT product_id,sum(quantity) AS quantity FROM holds GROUP BY product_id)
 SELECT jsonb_build_object('items',coalesce(jsonb_agg(jsonb_build_object('productId',p.id,'quantity',coalesce(t.quantity,0)::text) ORDER BY p.id),'[]'::jsonb),
 'scope','COMPANY','quantityUnit','BASE_UNIT','includes','QUOTE_AND_ORDER_HOLDS','changesOnHand',false)
 INTO result FROM catalog.products p LEFT JOIN totals t ON t.product_id=p.id WHERE p.company_id=core.current_company() AND p.item_type='STOCK';RETURN result;
END $$;
REVOKE ALL ON FUNCTION inventory.capture_quote_hold(),inventory.commercial_reservations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventory.commercial_reservations() TO htt_app;
-- No backfill: existing submitted quotations keep their historical pre-migration reservation behavior.
