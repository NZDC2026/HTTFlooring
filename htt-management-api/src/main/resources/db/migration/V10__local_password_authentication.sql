-- Passwords belong to identity, never customer/employee profiles. No seed credentials.
CREATE TABLE identity.employee (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id varchar(100) NOT NULL UNIQUE,
 company_id uuid NOT NULL REFERENCES identity.company(id),
 actor_id uuid NOT NULL REFERENCES identity.user_account(id),
 display_name varchar(200) NOT NULL, status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','DISABLED')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,actor_id)
);
CREATE TABLE identity.password_credential (
 actor_id uuid PRIMARY KEY REFERENCES identity.user_account(id),
 login_name varchar(320) NOT NULL UNIQUE CHECK(login_name=lower(btrim(login_name)) AND login_name<>''),
 realm varchar(16) NOT NULL CHECK(realm IN ('STAFF','CUSTOMER')),
 password_hash varchar(255) NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 issuer text NOT NULL, subject varchar(512) NOT NULL,
 changed_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(issuer,subject) REFERENCES identity.external_identity(issuer,subject)
);
CREATE TABLE identity.login_session (
 token_hash varchar(64) PRIMARY KEY CHECK(length(token_hash)=64),
 actor_id uuid NOT NULL REFERENCES identity.password_credential(actor_id),
 credential_version bigint NOT NULL, realm varchar(16) NOT NULL CHECK(realm IN ('STAFF','CUSTOMER')),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 revoked_at timestamptz, CHECK(expires_at>created_at)
);
CREATE INDEX login_session_actor ON identity.login_session(actor_id);
CREATE INDEX login_session_expiry ON identity.login_session(expires_at);
CREATE TABLE identity.login_rate_bucket (
 bucket_hash varchar(64) PRIMARY KEY, started_at timestamptz NOT NULL, attempts integer NOT NULL
);
REVOKE ALL ON identity.employee,identity.password_credential,identity.login_session,identity.login_rate_bucket FROM PUBLIC,"${runtime_role}";

CREATE FUNCTION identity.password_login_candidate(normalized_login text,requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('actor',p.actor_id,'passwordHash',p.password_hash,'version',p.version)
 FROM identity.password_credential p JOIN identity.user_account u ON u.id=p.actor_id
 WHERE p.login_name=normalized_login AND p.realm=requested_realm AND u.status='ACTIVE'
 AND (requested_realm<>'STAFF' OR EXISTS(SELECT 1 FROM identity.employee e JOIN identity.company c ON c.id=e.company_id
   WHERE e.actor_id=p.actor_id AND e.status='ACTIVE' AND c.status='ACTIVE'))
 AND NOT EXISTS(SELECT 1 FROM identity.customer_account a WHERE a.actor_id=p.actor_id AND (a.status<>'ACTIVE' OR a.sync_status<>'READY'))
$$;
CREATE FUNCTION identity.take_login_attempt(bucket text,maximum integer) RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE used integer;
BEGIN
 IF length(bucket)<>64 OR maximum NOT IN (6,40) THEN RETURN false; END IF;
 INSERT INTO identity.login_rate_bucket AS b(bucket_hash,started_at,attempts) VALUES(bucket,clock_timestamp(),1)
 ON CONFLICT(bucket_hash) DO UPDATE SET
 attempts=CASE WHEN b.started_at<clock_timestamp()-interval '1 minute' THEN 1 ELSE b.attempts+1 END,
 started_at=CASE WHEN b.started_at<clock_timestamp()-interval '1 minute' THEN clock_timestamp() ELSE b.started_at END
 RETURNING b.attempts INTO used;
 RETURN used<=maximum;
END $$;
CREATE FUNCTION identity.start_password_session(actor uuid,expected_version bigint,requested_realm text,digest text) RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p identity.password_credential%ROWTYPE;
BEGIN
 SELECT * INTO p FROM identity.password_credential WHERE actor_id=actor FOR UPDATE;
 IF NOT FOUND OR p.version<>expected_version OR p.realm<>requested_realm
 OR identity.password_login_candidate(p.login_name,requested_realm) IS NULL THEN RETURN false; END IF;
 -- Bound active sessions per account; expired rows are purged by an explicit maintenance task.
 UPDATE identity.login_session SET revoked_at=clock_timestamp() WHERE token_hash IN (
 SELECT token_hash FROM identity.login_session WHERE actor_id=actor AND revoked_at IS NULL AND expires_at>clock_timestamp()
 ORDER BY created_at DESC OFFSET 9);
 INSERT INTO identity.login_session(token_hash,actor_id,credential_version,realm,expires_at)
 VALUES(digest,actor,p.version,requested_realm,clock_timestamp()+interval '15 minutes');
 RETURN true;
END $$;
CREATE FUNCTION identity.password_session_access(digest text,requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('access',identity.resolve_access(p.issuer,p.subject,requested_realm),
 'issuedAt',s.created_at,'expiresAt',s.expires_at)
 FROM identity.login_session s JOIN identity.password_credential p ON p.actor_id=s.actor_id
 JOIN identity.user_account u ON u.id=p.actor_id
 WHERE s.token_hash=digest AND s.realm=requested_realm AND s.revoked_at IS NULL AND s.expires_at>statement_timestamp()
 AND s.credential_version=p.version AND s.created_at>=u.tokens_valid_after
 AND identity.password_login_candidate(p.login_name,requested_realm) IS NOT NULL
$$;
CREATE FUNCTION identity.end_password_session(digest text) RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
 UPDATE identity.login_session SET revoked_at=clock_timestamp() WHERE token_hash=digest AND revoked_at IS NULL
$$;
CREATE FUNCTION identity.password_session_candidate(digest text,requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT identity.password_login_candidate(p.login_name,p.realm)
 FROM identity.login_session s JOIN identity.password_credential p ON p.actor_id=s.actor_id
 WHERE s.token_hash=digest AND s.realm=requested_realm AND identity.password_session_access(digest,requested_realm) IS NOT NULL
$$;
CREATE FUNCTION identity.change_local_password(digest text,expected_version bigint,new_hash text) RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE actor uuid;
BEGIN
 SELECT s.actor_id INTO actor FROM identity.login_session s JOIN identity.password_credential p ON p.actor_id=s.actor_id
 WHERE s.token_hash=digest AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND s.credential_version=p.version;
 IF actor IS NULL THEN RETURN false; END IF;
 UPDATE identity.password_credential SET password_hash=new_hash,version=version+1,changed_at=clock_timestamp()
 WHERE actor_id=actor AND version=expected_version;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE identity.login_session SET revoked_at=clock_timestamp() WHERE actor_id=actor AND revoked_at IS NULL;
 RETURN true;
END $$;
CREATE FUNCTION identity.create_local_customer_credential(caller uuid,company uuid,target uuid,new_hash text) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a identity.customer_account%ROWTYPE;
BEGIN
 SELECT * INTO a FROM identity.customer_account WHERE actor_id=target AND company_id=company;
 IF NOT FOUND OR NOT identity.customer_account_authorized(caller,company,a.customer_id,'customer:account:create') THEN
 RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 INSERT INTO identity.password_credential(actor_id,login_name,realm,password_hash,issuer,subject)
 VALUES(target,a.login_name,'CUSTOMER',new_hash,a.issuer,a.subject);
END $$;
REVOKE ALL ON FUNCTION identity.password_login_candidate(text,text),identity.take_login_attempt(text,integer),
 identity.start_password_session(uuid,bigint,text,text),identity.password_session_access(text,text),identity.end_password_session(text),
 identity.change_local_password(text,bigint,text),identity.create_local_customer_credential(uuid,uuid,uuid,text),identity.password_session_candidate(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.password_login_candidate(text,text),identity.take_login_attempt(text,integer),
 identity.start_password_session(uuid,bigint,text,text),identity.password_session_access(text,text),identity.end_password_session(text),
 identity.change_local_password(text,bigint,text),identity.create_local_customer_credential(uuid,uuid,uuid,text),identity.password_session_candidate(text,text) TO "${runtime_role}";
