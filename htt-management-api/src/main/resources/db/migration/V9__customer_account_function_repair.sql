-- V8 has been applied: repair parameter/table-row ambiguity without changing its checksum.
CREATE OR REPLACE FUNCTION identity.create_customer_account(caller uuid,company uuid,customer uuid,contact uuid,kind text,
 trusted_issuer text,trusted_subject text,normalized_login text,permissions text[],branches uuid[],operation uuid,payload_hash text)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE account uuid; actor uuid; role_id uuid; grant_id uuid; prior identity.customer_account%ROWTYPE;
BEGIN
 IF NOT identity.customer_account_authorized(caller,company,customer,'customer:account:create') THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM crm.customer c WHERE c.company_id=company AND c.id=create_customer_account.customer FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Missing customer' USING ERRCODE='23503'; END IF;
 SELECT * INTO prior FROM identity.customer_account WHERE creation_key=operation;
 IF FOUND THEN
  IF prior.company_id<>company OR prior.customer_id<>customer OR prior.request_hash<>payload_hash THEN RAISE EXCEPTION 'Idempotency conflict' USING ERRCODE='23505'; END IF;
  RETURN prior.id;
 END IF;
 IF kind NOT IN ('CUSTOMER','CONTACT') OR (kind='CUSTOMER' AND contact IS NOT NULL) OR (kind='CONTACT' AND contact IS NULL)
 OR normalized_login<>lower(btrim(normalized_login)) OR normalized_login='' THEN RAISE EXCEPTION 'Invalid account' USING ERRCODE='23514'; END IF;
 IF kind='CONTACT' AND NOT EXISTS(SELECT 1 FROM crm.customer_contact WHERE company_id=company AND customer_id=customer AND id=contact) THEN
  RAISE EXCEPTION 'Contact scope mismatch' USING ERRCODE='23503'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(permissions) p WHERE p NOT IN ('customer:read','branch:read','notification:read','notification:device','customer:account:manage'))
 OR (kind='CONTACT' AND 'customer:account:manage'=ANY(permissions)) THEN RAISE EXCEPTION 'Invalid permission' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(branches) b WHERE NOT EXISTS(SELECT 1 FROM crm.customer_branch cb WHERE cb.id=b AND cb.company_id=company AND cb.customer_id=customer AND cb.status='ACTIVE')) THEN
  RAISE EXCEPTION 'Branch scope mismatch' USING ERRCODE='23503'; END IF;
 account:=gen_random_uuid();actor:=gen_random_uuid();role_id:=gen_random_uuid();grant_id:=gen_random_uuid();
 INSERT INTO identity.user_account(id,display_name) VALUES(actor,normalized_login);
 INSERT INTO identity.external_identity(issuer,subject,user_id,realm) VALUES(trusted_issuer,trusted_subject,actor,'CUSTOMER');
 INSERT INTO identity.company_member(company_id,user_id,member_kind) VALUES(company,actor,'CUSTOMER');
 INSERT INTO identity.role(company_id,id,code) VALUES(company,role_id,'PORTAL-'||account::text);
 INSERT INTO identity.member_role(company_id,user_id,role_id) VALUES(company,actor,role_id);
 INSERT INTO identity.role_permission(company_id,role_id,permission_code) SELECT company,role_id,p FROM (SELECT DISTINCT unnest(permissions) p) ps;
 INSERT INTO identity.resource_grant(id,company_id,user_id,scope,customer_id) VALUES(grant_id,company,actor,'CUSTOMER',customer);
 INSERT INTO identity.grant_branch(grant_id,company_id,customer_id,branch_id) SELECT grant_id,company,customer,b FROM (SELECT DISTINCT unnest(branches) b) bs;
 INSERT INTO identity.customer_account(id,business_id,company_id,customer_id,contact_id,actor_id,account_type,issuer,subject,login_name,creation_key,request_hash)
 VALUES(account,'acc_'||account::text,company,customer,contact,actor,kind,trusted_issuer,trusted_subject,normalized_login,operation,payload_hash);
 INSERT INTO platform.customer_change_audit(company_id,customer_id,actor_id,action,version) VALUES(company,customer,caller,'customer:account:create',1);
 RETURN account;
END $$;
