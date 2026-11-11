-- Warehouse users may attach/read return evidence on assigned sales orders only.
ALTER FUNCTION platform.require_document_access(uuid,text) RENAME TO require_document_access_before_returns;
CREATE FUNCTION platform.require_document_access(doc uuid,action text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$DECLARE warehouse uuid;BEGIN
 IF EXISTS(SELECT 1 FROM platform.documents WHERE company_id=core.current_company() AND id=doc AND document_type='SALES_ORDER' AND platform.document_visible(doc)) THEN
 IF action IS NULL OR action NOT IN('READ','UPLOAD') THEN RAISE EXCEPTION 'Return evidence supports private attachments only' USING ERRCODE='HD422';END IF;
 PERFORM purchase.require_access(CASE WHEN action='READ' THEN 'documents.files.read' ELSE 'documents.attachments.write' END);
 SELECT warehouse_id INTO warehouse FROM sales.orders WHERE company_id=core.current_company() AND id=doc;
 PERFORM inventory.require_access(CASE WHEN action='READ' THEN 'inventory.returns.read' ELSE 'inventory.returns.write' END,warehouse);
 RETURN 'SALES_ORDER';END IF;
 RETURN platform.require_document_access_before_returns(doc,action);
END $$;
REVOKE ALL ON FUNCTION platform.require_document_access(uuid,text),platform.require_document_access_before_returns(uuid,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION platform.require_document_access_before_returns(uuid,text) FROM htt_app;
GRANT EXECUTE ON FUNCTION platform.require_document_access(uuid,text) TO htt_app;
DO $$DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p FROM identity.roles r CROSS JOIN unnest(ARRAY['documents.files.read','documents.attachments.write']) p WHERE r.company_id=c AND r.code='WAREHOUSE' ON CONFLICT DO NOTHING;END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION inventory.seed_return_file_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$BEGIN
 IF NEW.code='WAREHOUSE' THEN INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT NEW.company_id,NEW.id,p FROM unnest(ARRAY['documents.files.read','documents.attachments.write']) p ON CONFLICT DO NOTHING;END IF;RETURN NEW;END $$;
CREATE TRIGGER return_file_role AFTER INSERT ON identity.roles FOR EACH ROW EXECUTE FUNCTION inventory.seed_return_file_role();
REVOKE ALL ON FUNCTION inventory.seed_return_file_role() FROM PUBLIC;
