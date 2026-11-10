BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);
DO $$ DECLARE doc uuid;v jsonb;n bigint;BEGIN
 SELECT q.id INTO doc FROM sales.quotes q JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.id WHERE q.company_id=core.current_company() AND q.status='DRAFT' AND platform.document_visible(q.id) ORDER BY q.id LIMIT 1;
 IF doc IS NULL THEN RAISE EXCEPTION 'Synthetic quote missing';END IF;
 v:=sales.dispatch_view(doc);
 IF (v->>'version')::bigint<>1 OR v->>'expectedDispatchDate' IS NOT NULL THEN RAISE EXCEPTION 'Initial schedule incorrect';END IF;
 v:=sales.set_dispatch_schedule(doc,1,current_date+2,true,true,'Synthetic date selection');
 IF (v->>'version')::bigint<>2 OR jsonb_array_length(v->'dispatchHistory')<>1 THEN RAISE EXCEPTION 'Date change or audit missing';END IF;
 BEGIN PERFORM sales.set_dispatch_schedule(doc,1,current_date+3,false,false,'Synthetic stale update'); RAISE EXCEPTION 'Stale write accepted';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
 v:=sales.set_dispatch_schedule(doc,2,current_date+2,false,true,'Synthetic flags only');
 IF jsonb_array_length(v->'dispatchHistory')<>1 THEN RAISE EXCEPTION 'Flags-only change fabricated date history';END IF;
 BEGIN PERFORM sales.set_dispatch_schedule(doc,3,NULL,true,false,'Synthetic invalid booking'); RAISE EXCEPTION 'Booking without date accepted';EXCEPTION WHEN SQLSTATE 'HI422' THEN NULL;END;
 v:=sales.set_dispatch_schedule(doc,3,NULL,false,false,'Synthetic clear date');
 IF (v->>'version')::bigint<>4 OR v->>'expectedDispatchDate' IS NOT NULL OR jsonb_array_length(v->'dispatchHistory')<>2 THEN RAISE EXCEPTION 'Clear date failed';END IF;
 IF has_table_privilege('htt_portal','sales.dispatch_cycles','SELECT') OR has_table_privilege('htt_app','sales.dispatch_cycles','SELECT') THEN RAISE EXCEPTION 'Private email tokens exposed';END IF;
END $$;
ROLLBACK;
