CREATE TABLE identity.customer_account (
 id uuid PRIMARY KEY, business_id varchar(100) NOT NULL UNIQUE,
 company_id uuid NOT NULL, customer_id uuid NOT NULL, contact_id uuid,
 actor_id uuid NOT NULL UNIQUE REFERENCES identity.user_account(id),
 account_type varchar(16) NOT NULL CHECK(account_type IN ('CUSTOMER','CONTACT')),
 issuer text NOT NULL CHECK(issuer LIKE 'https://%'), subject varchar(512) NOT NULL,
 login_name varchar(320) NOT NULL UNIQUE CHECK(login_name=lower(btrim(login_name)) AND btrim(login_name)<>''),
 status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','DISABLED')),
 sync_status varchar(16) NOT NULL DEFAULT 'READY' CHECK(sync_status IN ('READY','PENDING')),
 creation_key uuid NOT NULL UNIQUE, request_hash varchar(64) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 CHECK((account_type='CUSTOMER' AND contact_id IS NULL) OR (account_type='CONTACT' AND contact_id IS NOT NULL)),
 FOREIGN KEY(company_id,customer_id) REFERENCES crm.customer(company_id,id),
 FOREIGN KEY(company_id,customer_id,contact_id) REFERENCES crm.customer_contact(company_id,customer_id,id),
 FOREIGN KEY(issuer,subject) REFERENCES identity.external_identity(issuer,subject),
 UNIQUE(issuer,subject)
);
CREATE UNIQUE INDEX customer_main_account ON identity.customer_account(customer_id) WHERE account_type='CUSTOMER';
CREATE UNIQUE INDEX customer_contact_account ON identity.customer_account(contact_id) WHERE contact_id IS NOT NULL;
ALTER TABLE identity.customer_account ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON identity.customer_account USING(identity.has_company_access(company_id));
GRANT SELECT ON identity.customer_account TO "${runtime_role}";
INSERT INTO identity.permission(code) VALUES ('customer:account:manage');

CREATE FUNCTION identity.customer_account_authorized(actor uuid,company uuid,customer uuid,action text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT actor=identity.current_actor_id() AND company=identity.current_company_id() AND EXISTS (
 SELECT 1 FROM identity.company_member m JOIN identity.user_account u ON u.id=m.user_id AND u.status='ACTIVE'
 JOIN identity.company c ON c.id=m.company_id AND c.status='ACTIVE'
 JOIN identity.member_role mr ON mr.company_id=m.company_id AND mr.user_id=m.user_id
 JOIN identity.role_permission rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id AND rp.permission_code=action
 WHERE m.user_id=actor AND m.company_id=company AND m.member_kind='MANAGEMENT' AND m.status='ACTIVE'
 AND EXISTS(SELECT 1 FROM identity.resource_grant g WHERE g.company_id=company AND g.user_id=actor AND g.enabled
 AND (g.scope='COMPANY' OR g.customer_id=customer)))
$$;

CREATE FUNCTION identity.create_customer_account(caller uuid,company uuid,customer uuid,contact uuid,kind text,
 trusted_issuer text,trusted_subject text,normalized_login text,permissions text[],branches uuid[],operation uuid,payload_hash text)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE account uuid; actor uuid; role_id uuid; grant_id uuid; prior identity.customer_account%ROWTYPE;
BEGIN
 IF NOT identity.customer_account_authorized(caller,company,customer,'customer:account:create') THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM crm.customer WHERE company_id=company AND id=customer FOR UPDATE;
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

CREATE FUNCTION identity.set_customer_account_status(caller uuid,company uuid,account uuid,expected bigint,new_status text) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a identity.customer_account%ROWTYPE;
BEGIN
 SELECT * INTO a FROM identity.customer_account WHERE id=account AND company_id=company FOR UPDATE;
 IF NOT FOUND OR NOT identity.customer_account_authorized(caller,company,a.customer_id,'customer:account:status') THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF a.version<>expected THEN RAISE EXCEPTION 'Version conflict' USING ERRCODE='40001'; END IF;
 IF new_status NOT IN ('ACTIVE','DISABLED') THEN RAISE EXCEPTION 'Invalid status' USING ERRCODE='23514'; END IF;
 -- Fail closed for enable as well: actor becomes ACTIVE only after remote operation is confirmed.
 UPDATE identity.user_account SET status='DISABLED',
 tokens_valid_after=greatest(tokens_valid_after,clock_timestamp()),version=version+1,updated_at=clock_timestamp() WHERE id=a.actor_id;
 UPDATE identity.customer_account SET status=new_status,sync_status='PENDING',version=version+1,updated_at=clock_timestamp() WHERE id=account;
 INSERT INTO platform.customer_change_audit(company_id,customer_id,actor_id,action,version) VALUES(company,a.customer_id,caller,'customer:account:status',a.version+1);
END $$;

CREATE FUNCTION identity.confirm_customer_account_status(caller uuid,company uuid,account uuid,expected bigint) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a identity.customer_account%ROWTYPE;
BEGIN
 SELECT * INTO a FROM identity.customer_account WHERE id=account AND company_id=company FOR UPDATE;
 IF NOT FOUND OR NOT identity.customer_account_authorized(caller,company,a.customer_id,'customer:account:status') THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF a.version<>expected THEN RAISE EXCEPTION 'Version conflict' USING ERRCODE='40001'; END IF;
 UPDATE identity.user_account SET status=a.status,tokens_valid_after=greatest(tokens_valid_after,clock_timestamp()),updated_at=clock_timestamp() WHERE id=a.actor_id;
 UPDATE identity.customer_account SET sync_status='READY' WHERE id=account;
END $$;

CREATE FUNCTION identity.revoke_customer_portal_tokens(actor uuid) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF actor<>identity.current_actor_id() OR NOT EXISTS(SELECT 1 FROM identity.customer_account WHERE actor_id=actor) THEN
  RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 UPDATE identity.user_account SET tokens_valid_after=greatest(tokens_valid_after,clock_timestamp()),version=version+1,updated_at=clock_timestamp() WHERE id=actor;
END $$;

CREATE FUNCTION identity.current_customer_account(actor uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',a.business_id,'customerId',c.business_id,'contactId',contact.business_id,'accountType',a.account_type,
 'loginName',a.login_name,'status',a.status,'version',a.version,'subject',a.subject)
 FROM identity.customer_account a JOIN crm.customer c ON c.company_id=a.company_id AND c.id=a.customer_id
 LEFT JOIN crm.customer_contact contact ON contact.company_id=a.company_id AND contact.customer_id=a.customer_id AND contact.id=a.contact_id
 JOIN identity.user_account u ON u.id=a.actor_id AND u.status='ACTIVE'
 WHERE a.actor_id=actor AND a.status='ACTIVE' AND a.sync_status='READY'
$$;
CREATE FUNCTION identity.is_managed_customer_account(actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS(SELECT 1 FROM identity.customer_account WHERE actor_id=actor)
$$;
REVOKE ALL ON FUNCTION identity.customer_account_authorized(uuid,uuid,uuid,text),
 identity.create_customer_account(uuid,uuid,uuid,uuid,text,text,text,text,text[],uuid[],uuid,text),
 identity.set_customer_account_status(uuid,uuid,uuid,bigint,text),identity.revoke_customer_portal_tokens(uuid),
 identity.confirm_customer_account_status(uuid,uuid,uuid,bigint),identity.current_customer_account(uuid),identity.is_managed_customer_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.create_customer_account(uuid,uuid,uuid,uuid,text,text,text,text,text[],uuid[],uuid,text),
 identity.set_customer_account_status(uuid,uuid,uuid,bigint,text),identity.revoke_customer_portal_tokens(uuid),
 identity.confirm_customer_account_status(uuid,uuid,uuid,bigint),identity.current_customer_account(uuid),identity.is_managed_customer_account(uuid) TO "${runtime_role}";
