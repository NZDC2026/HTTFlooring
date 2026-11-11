BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true),set_config('htt.request_id','synthetic-boundary-regression',true);
DO $$DECLARE q uuid;result jsonb;BEGIN
 SELECT x.id INTO q FROM sales.quotes x WHERE company_id=core.current_company() AND status='DRAFT' AND platform.document_visible(x.id) ORDER BY x.id LIMIT 1;
 IF q IS NULL THEN RAISE EXCEPTION 'Synthetic quote missing';END IF;
 UPDATE sales.quotes SET status='SUBMITTED' WHERE company_id=core.current_company() AND id=q;UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=core.current_company() AND id=q;
 PERFORM sales.set_dispatch_schedule(q,1,current_date-1,false,false,'Synthetic pending follow-up');
 IF sales.quote_conversion_expired(q) IS DISTINCT FROM false THEN RAISE EXCEPTION 'Pending follow-up must return false, never NULL';END IF;
 INSERT INTO sales.dispatch_settings(company_id,enabled,mail_from,notification_email,portal_origin,timezone) VALUES(core.current_company(),true,'sender@example.invalid','staff@example.invalid','https://portal.example.invalid','Australia/Melbourne');
 INSERT INTO sales.dispatch_cycles(company_id,document_id,kind,expected_date,token_hash,recipient,payload,state,accepted_at,expires_on) SELECT core.current_company(),q,'CUSTOMER',expected_date,repeat('f',64),'accounts@example.invalid','{}','ACCEPTED',now()-interval '8 days',current_date-1 FROM sales.dispatch_schedules WHERE company_id=core.current_company() AND document_id=q;
 IF NOT sales.dispatch_deadline_expired(q) OR NOT sales.quote_conversion_expired(q) THEN RAISE EXCEPTION 'Accepted deadline not expired';END IF;
 BEGIN PERFORM sales.set_dispatch_schedule(q,2,current_date+4,false,false,'Synthetic late reschedule');RAISE EXCEPTION 'Expired quote revived by date change';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
 BEGIN PERFORM sales.set_dispatch_schedule(q,2,NULL,false,false,'Synthetic clear deadline');RAISE EXCEPTION 'Expired quote revived by clearing date';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
 IF NOT sales.dispatch_deadline_expired(q) OR NOT EXISTS(SELECT 1 FROM sales.dispatch_cycles WHERE document_id=q AND active AND state='ACCEPTED') THEN RAISE EXCEPTION 'Rejected reschedule changed expiry evidence';END IF;
 BEGIN UPDATE sales.quotes SET status='CONVERTED' WHERE company_id=core.current_company() AND id=q;RAISE EXCEPTION 'Expired conversion bypassed database guard';EXCEPTION WHEN SQLSTATE 'HI409' THEN NULL;END;
END $$;
DO $$DECLARE ids uuid[];batch uuid;job jsonb;permission text;confirmer uuid:=gen_random_uuid();member uuid:=gen_random_uuid();role uuid:=gen_random_uuid();initiator uuid:=core.current_actor();BEGIN
 INSERT INTO crm.contacts(company_id,party_id,name,email,is_accounting,created_by) SELECT company_id,party_id,'Synthetic accounting','accounts@example.invalid',true,core.current_actor() FROM crm.customers c WHERE c.company_id=core.current_company() AND NOT EXISTS(SELECT 1 FROM crm.contacts x WHERE x.company_id=c.company_id AND x.party_id=c.party_id AND x.active AND x.is_accounting);
 UPDATE crm.contacts SET email='accounts@example.invalid',active=true WHERE company_id=core.current_company() AND is_accounting;
 INSERT INTO accounting.reminder_settings(company_id,enabled,mail_from,worker_ready_at) VALUES(core.current_company(),true,'sender@example.invalid',now());
 SELECT ARRAY[(value->>'id')::uuid] INTO ids FROM jsonb_array_elements(accounting.reminder_rows()) LIMIT 1;
 IF ids IS NULL THEN RAISE EXCEPTION 'Synthetic invoice missing';END IF;
 FOREACH permission IN ARRAY ARRAY['accounting.statements.send','documents.pdf.request'] LOOP
  batch:=accounting.prepare_reminders('STATEMENT',ids,current_date-365,current_date+1);
  DELETE FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id='00000000-0000-0000-0000-000000000004' AND permission_code=permission;
  BEGIN PERFORM accounting.queue_reminders(batch,true);RAISE EXCEPTION 'Revoked authority accepted at confirmation: %',permission;EXCEPTION WHEN insufficient_privilege THEN NULL;END;
  INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(core.current_company(),'00000000-0000-0000-0000-000000000004',permission);
  PERFORM accounting.queue_reminders(batch,true);
  IF NOT EXISTS(SELECT 1 FROM accounting.reminder_batches WHERE id=batch AND queued_by=initiator AND NOT queued_by_inferred) THEN RAISE EXCEPTION 'Confirmer not recorded';END IF;
  DELETE FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id='00000000-0000-0000-0000-000000000004' AND permission_code=permission;
  job:=accounting.claim_reminder_mail();IF job IS NOT NULL OR NOT EXISTS(SELECT 1 FROM accounting.reminder_mails WHERE batch_id=batch AND state='SKIPPED') THEN RAISE EXCEPTION 'Revoked authority accepted at claim: %, job %, states %',permission,job,(SELECT jsonb_agg(to_jsonb(x)) FROM accounting.reminder_mails x WHERE batch_id=batch);END IF;
  INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(core.current_company(),'00000000-0000-0000-0000-000000000004',permission);
  batch:=accounting.prepare_reminders('STATEMENT',ids,current_date-365,current_date+1);PERFORM accounting.queue_reminders(batch,true);job:=accounting.claim_reminder_mail();IF job IS NULL THEN RAISE EXCEPTION 'Valid statement not claimable';END IF;
  DELETE FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id='00000000-0000-0000-0000-000000000004' AND permission_code=permission;
  IF accounting.load_reminder_mail((job->>'id')::uuid,(job->>'lease')::uuid) IS NOT NULL THEN RAISE EXCEPTION 'Revoked authority accepted after rendering: %',permission;END IF;
  IF NOT EXISTS(SELECT 1 FROM accounting.reminder_mails WHERE id=(job->>'id')::uuid AND state='SKIPPED') THEN RAISE EXCEPTION 'Post-render authority denial not persisted';END IF;
  INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(core.current_company(),'00000000-0000-0000-0000-000000000004',permission);
 END LOOP;
 INSERT INTO identity.users(id,issuer,subject,display_name) VALUES(confirmer,'https://synthetic.example.invalid',confirmer::text,'Synthetic confirmer');
 INSERT INTO identity.memberships(id,company_id,user_id) VALUES(member,core.current_company(),confirmer);
 INSERT INTO identity.roles(id,company_id,code,name) VALUES(role,core.current_company(),role::text,'Synthetic confirming authority');
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT core.current_company(),role,permission_code FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id='00000000-0000-0000-0000-000000000004';
 INSERT INTO identity.membership_roles(company_id,membership_id,role_id) VALUES(core.current_company(),member,role);
 -- Revocation of a different confirmer also blocks a creator-authorized queue.
 batch:=accounting.prepare_reminders('STATEMENT',ids,current_date-365,current_date+1);PERFORM set_config('htt.actor_id',confirmer::text,true);PERFORM accounting.queue_reminders(batch,true);PERFORM set_config('htt.actor_id',initiator::text,true);
 DELETE FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id=role AND permission_code='accounting.statements.send';
 IF accounting.claim_reminder_mail() IS NOT NULL THEN RAISE EXCEPTION 'Revoked confirmer bypassed creator authority';END IF;
 IF core.current_actor()<>initiator THEN RAISE EXCEPTION 'Authority check leaked actor context';END IF;
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) VALUES(core.current_company(),role,'accounting.statements.send');
 batch:=accounting.prepare_reminders('STATEMENT',ids,current_date-365,current_date+1);PERFORM set_config('htt.actor_id',confirmer::text,true);PERFORM accounting.queue_reminders(batch,true);PERFORM set_config('htt.actor_id',initiator::text,true);job:=accounting.claim_reminder_mail();
 DELETE FROM identity.role_permissions WHERE company_id=core.current_company() AND role_id=role AND permission_code='documents.pdf.request';
 IF accounting.load_reminder_mail((job->>'id')::uuid,(job->>'lease')::uuid) IS NOT NULL THEN RAISE EXCEPTION 'Revoked confirmer accepted before delivery';END IF;
 IF core.current_actor()<>initiator THEN RAISE EXCEPTION 'Delivery check leaked actor context';END IF;
END $$;
DO $$DECLARE o sales.orders;old_request uuid:=gen_random_uuid();all_rows jsonb;pending jsonb;second_page jsonb;BEGIN
 SELECT x.* INTO o FROM sales.orders x WHERE company_id=core.current_company() AND platform.document_visible(x.id) ORDER BY id LIMIT 1;
 IF o.id IS NULL THEN RAISE EXCEPTION 'Synthetic order missing';END IF;
 -- Isolated list fixtures model an old pending request followed by 100 completed decisions.
 INSERT INTO inventory.return_requests(id,company_id,order_id,warehouse_id,customer_id,reason,handover,lines,created_by,created_at) VALUES(old_request,o.company_id,o.id,o.warehouse_id,o.customer_id,'Synthetic older pending','{}','[]',core.current_actor(),now()-interval '1 day');
 INSERT INTO inventory.return_requests(company_id,order_id,warehouse_id,customer_id,status,reason,handover,lines,created_by) SELECT o.company_id,o.id,o.warehouse_id,o.customer_id,'REJECTED','Synthetic newer decision','{}','[]',core.current_actor() FROM generate_series(1,100);
 all_rows:=inventory.return_request_list(o.warehouse_id,1,100,NULL);second_page:=inventory.return_request_list(o.warehouse_id,2,100,NULL);pending:=inventory.return_request_list(o.warehouse_id,1,100,'PENDING');
 IF (all_rows->>'totalCount')::int<>101 OR (all_rows->>'hasMore')::boolean IS DISTINCT FROM true OR jsonb_array_length(second_page->'items')<>1 OR (second_page->'items'->0->>'id')::uuid<>old_request THEN RAISE EXCEPTION 'Older request not reachable by paging';END IF;
 IF (pending->>'totalCount')::int<>1 OR (pending->'items'->0->>'id')::uuid<>old_request THEN RAISE EXCEPTION 'Pending filter lost old request';END IF;
 IF jsonb_array_length(inventory.return_request_list(o.warehouse_id)->'items')<>100 THEN RAISE EXCEPTION 'Legacy list wrapper changed default size';END IF;
 BEGIN PERFORM inventory.return_request_list(o.warehouse_id,0,100,NULL);RAISE EXCEPTION 'Invalid page accepted';EXCEPTION WHEN SQLSTATE 'HI422' THEN NULL;END;
 BEGIN PERFORM inventory.return_request_list(o.warehouse_id,1,100,'UNKNOWN');RAISE EXCEPTION 'Invalid status accepted';EXCEPTION WHEN SQLSTATE 'HI422' THEN NULL;END;
END $$;
ROLLBACK;
