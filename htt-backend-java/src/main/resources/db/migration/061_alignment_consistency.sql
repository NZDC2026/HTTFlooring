-- Forward correction; never edit previously applied migration checksums.
DO $migration$ DECLARE body text; BEGIN
 body:=pg_get_functiondef('inventory.sync_stock_batches()'::regprocedure);
 body:=replace(body,'total_quantity numeric;BEGIN','total_quantity numeric;remaining_value numeric;BEGIN');
 body:=replace(body,'total_quantity:=tracked;remaining_adjustment:=vd;','total_quantity:=tracked;remaining_adjustment:=vd;SELECT coalesce(sum(value),0) INTO remaining_value FROM inventory.stock_batches WHERE company_id=b.company_id AND stock_balance_id=b.id AND quantity>0;');
 body:=replace(body,'part:=CASE WHEN l.quantity=total_quantity THEN remaining_adjustment ELSE round(vd*l.quantity/tracked,2) END;',
 'part:=CASE WHEN l.quantity=total_quantity THEN remaining_adjustment WHEN vd<0 THEN CASE WHEN remaining_value=0 THEN 0 ELSE greatest(-l.value,round(remaining_adjustment*l.value/remaining_value,2)) END ELSE round(vd*l.quantity/tracked,2) END;remaining_value:=remaining_value-coalesce(l.value,0);');
 EXECUTE body;
END $migration$;
CREATE FUNCTION inventory.lock_costing_product() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$BEGIN
 PERFORM 1 FROM catalog.products WHERE company_id=NEW.company_id AND id=NEW.product_id FOR KEY SHARE;RETURN NEW;END $$;
CREATE TRIGGER serialize_costing_balance BEFORE INSERT ON inventory.stock_balances FOR EACH ROW EXECUTE FUNCTION inventory.lock_costing_product();
REVOKE ALL ON FUNCTION inventory.lock_costing_product() FROM PUBLIC;
CREATE FUNCTION sales.quote_conversion_expired(doc uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE s sales.dispatch_schedules;deadline date;zone text;BEGIN
 PERFORM sales.require_dispatch_access(doc);
 SELECT * INTO s FROM sales.dispatch_schedules WHERE company_id=core.current_company() AND document_id=doc;
 IF NOT FOUND OR s.expected_date IS NULL THEN RETURN (SELECT expires_on<(now() AT TIME ZONE c.timezone)::date FROM sales.quotes q JOIN core.companies c ON c.id=q.company_id WHERE q.company_id=core.current_company() AND q.id=doc);END IF;
 SELECT timezone INTO zone FROM sales.dispatch_settings WHERE company_id=core.current_company();zone:=coalesce(zone,'Australia/Melbourne');
 SELECT min(expires_on) INTO deadline FROM sales.dispatch_cycles WHERE company_id=s.company_id AND document_id=doc AND active AND kind='CUSTOMER' AND state='ACCEPTED' AND expected_date=s.expected_date;
 RETURN s.expired_at IS NOT NULL OR deadline<=(now() AT TIME ZONE zone)::date;
END $$;
CREATE FUNCTION sales.guard_expired_conversion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 IF NEW.status='CONVERTED' AND OLD.status IS DISTINCT FROM NEW.status AND sales.quote_conversion_expired(NEW.id) THEN RAISE EXCEPTION 'Quote follow-up deadline has expired' USING ERRCODE='HI409';END IF;RETURN NEW;END $$;
CREATE TRIGGER guard_dispatch_expiry BEFORE UPDATE OF status ON sales.quotes FOR EACH ROW EXECUTE FUNCTION sales.guard_expired_conversion();
REVOKE ALL ON FUNCTION sales.quote_conversion_expired(uuid),sales.guard_expired_conversion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sales.quote_conversion_expired(uuid) TO htt_app;
