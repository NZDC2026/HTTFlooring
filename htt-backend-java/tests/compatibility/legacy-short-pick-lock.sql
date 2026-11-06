-- Establish the original 55-migration privilege failure before applying the Java increment.
SET LOCAL ROLE htt_app;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);
DO $$ DECLARE denied boolean:=false; BEGIN
 IF has_column_privilege(current_user,'sales.order_lines','id','UPDATE') THEN RAISE EXCEPTION 'Legacy lock privilege unexpectedly changed'; END IF;
 BEGIN PERFORM id FROM sales.order_lines LIMIT 1 FOR UPDATE; EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Expected legacy short-pick row-lock privilege failure'; END IF;
 RAISE NOTICE 'Verified original short-pick row-lock failure: SQLSTATE 42501';
END $$;
RESET ROLE;
