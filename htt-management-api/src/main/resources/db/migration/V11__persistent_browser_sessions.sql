-- Fixed lifetime; consumed token digests remain for replay detection until retention cleanup.
CREATE TABLE identity.refresh_family (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL REFERENCES identity.password_credential(actor_id),
 realm varchar(16) NOT NULL CHECK(realm IN ('STAFF','CUSTOMER')), credential_version bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL,
 revoked_at timestamptz, CHECK(expires_at>created_at)
);
CREATE INDEX refresh_family_actor ON identity.refresh_family(actor_id);
CREATE INDEX refresh_family_expiry ON identity.refresh_family(expires_at);
CREATE TABLE identity.refresh_token (
 token_hash varchar(64) PRIMARY KEY CHECK(length(token_hash)=64),
 family_id uuid NOT NULL REFERENCES identity.refresh_family(id),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), consumed_at timestamptz
);
CREATE INDEX refresh_token_family ON identity.refresh_token(family_id);
ALTER TABLE identity.login_session ADD COLUMN refresh_family_id uuid REFERENCES identity.refresh_family(id);
CREATE INDEX login_session_family ON identity.login_session(refresh_family_id);
REVOKE ALL ON identity.refresh_family,identity.refresh_token FROM PUBLIC,"${runtime_role}";

CREATE FUNCTION identity.revoke_refresh_family(target uuid) RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
 UPDATE identity.refresh_family SET revoked_at=coalesce(revoked_at,clock_timestamp()) WHERE id=target;
 UPDATE identity.login_session SET revoked_at=coalesce(revoked_at,clock_timestamp()) WHERE refresh_family_id=target
$$;
CREATE FUNCTION identity.begin_browser_session(access_digest text,refresh_digest text,requested_realm text) RETURNS timestamptz
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE s identity.login_session%ROWTYPE; target uuid; deadline timestamptz;
BEGIN
 SELECT * INTO s FROM identity.login_session WHERE token_hash=access_digest AND realm=requested_realm;
 IF NOT FOUND OR identity.password_session_access(access_digest,requested_realm) IS NULL THEN RETURN NULL; END IF;
 PERFORM 1 FROM identity.password_credential WHERE actor_id=s.actor_id AND version=s.credential_version FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 PERFORM identity.revoke_refresh_family(id) FROM (
 SELECT id FROM identity.refresh_family WHERE actor_id=s.actor_id AND revoked_at IS NULL AND expires_at>clock_timestamp()
 ORDER BY created_at DESC OFFSET 9) old;
 deadline:=clock_timestamp()+interval '7 days';target:=gen_random_uuid();
 INSERT INTO identity.refresh_family(id,actor_id,realm,credential_version,expires_at)
 VALUES(target,s.actor_id,requested_realm,s.credential_version,deadline);
 INSERT INTO identity.refresh_token(token_hash,family_id) VALUES(refresh_digest,target);
 UPDATE identity.login_session SET refresh_family_id=target WHERE token_hash=access_digest;
 RETURN deadline;
END $$;
CREATE FUNCTION identity.rotate_browser_session(old_digest text,new_digest text,access_digest text,requested_realm text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE t identity.refresh_token%ROWTYPE; f identity.refresh_family%ROWTYPE; p identity.password_credential%ROWTYPE; u identity.user_account%ROWTYPE;
BEGIN
 SELECT * INTO t FROM identity.refresh_token WHERE token_hash=old_digest;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','INVALID'); END IF;
 SELECT * INTO f FROM identity.refresh_family WHERE id=t.family_id;
 IF f.realm<>requested_realm THEN RETURN jsonb_build_object('status','INVALID'); END IF;
 -- All password-changing flows lock the credential first; rotation follows the same order.
 SELECT * INTO p FROM identity.password_credential WHERE actor_id=f.actor_id FOR UPDATE;
 SELECT * INTO f FROM identity.refresh_family WHERE id=t.family_id FOR UPDATE;
 SELECT * INTO t FROM identity.refresh_token WHERE token_hash=old_digest;
 IF f.revoked_at IS NOT NULL OR f.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('status','INVALID'); END IF;
 IF t.consumed_at IS NOT NULL THEN
  PERFORM identity.revoke_refresh_family(f.id); RETURN jsonb_build_object('status','REUSED');
 END IF;
 SELECT * INTO u FROM identity.user_account WHERE id=f.actor_id;
 IF p.version<>f.credential_version OR f.created_at<u.tokens_valid_after
 OR identity.password_login_candidate(p.login_name,requested_realm) IS NULL THEN
  PERFORM identity.revoke_refresh_family(f.id); RETURN jsonb_build_object('status','INVALID');
 END IF;
 UPDATE identity.refresh_token SET consumed_at=clock_timestamp() WHERE token_hash=old_digest;
 INSERT INTO identity.refresh_token(token_hash,family_id) VALUES(new_digest,f.id);
 -- Replace the previous access token as well; all access tokens remain bounded by the fixed family deadline.
 UPDATE identity.login_session SET revoked_at=coalesce(revoked_at,clock_timestamp()) WHERE refresh_family_id=f.id;
 INSERT INTO identity.login_session(token_hash,actor_id,credential_version,realm,expires_at,refresh_family_id)
 VALUES(access_digest,f.actor_id,p.version,requested_realm,least(clock_timestamp()+interval '15 minutes',f.expires_at),f.id);
 RETURN jsonb_build_object('status','OK','expiresAt',f.expires_at);
END $$;
CREATE FUNCTION identity.logout_browser_session(refresh_digest text,requested_realm text) RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT identity.revoke_refresh_family(f.id) FROM identity.refresh_token t JOIN identity.refresh_family f ON f.id=t.family_id
 WHERE t.token_hash=refresh_digest AND f.realm=requested_realm
$$;
CREATE OR REPLACE FUNCTION identity.end_password_session(digest text) RETURNS void
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE target uuid;
BEGIN
 SELECT refresh_family_id INTO target FROM identity.login_session WHERE token_hash=digest;
 IF target IS NOT NULL THEN PERFORM identity.revoke_refresh_family(target); END IF;
 UPDATE identity.login_session SET revoked_at=coalesce(revoked_at,clock_timestamp()) WHERE token_hash=digest;
END $$;
CREATE OR REPLACE FUNCTION identity.password_session_access(digest text,requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('access',identity.resolve_access(p.issuer,p.subject,requested_realm),'issuedAt',s.created_at,'expiresAt',s.expires_at)
 FROM identity.login_session s JOIN identity.password_credential p ON p.actor_id=s.actor_id JOIN identity.user_account u ON u.id=p.actor_id
 WHERE s.token_hash=digest AND s.realm=requested_realm AND s.revoked_at IS NULL AND s.expires_at>statement_timestamp()
 AND s.credential_version=p.version AND s.created_at>=u.tokens_valid_after
 AND (s.refresh_family_id IS NULL OR EXISTS(SELECT 1 FROM identity.refresh_family f WHERE f.id=s.refresh_family_id
 AND f.revoked_at IS NULL AND f.expires_at>statement_timestamp() AND f.created_at>=u.tokens_valid_after))
 AND identity.password_login_candidate(p.login_name,requested_realm) IS NOT NULL
$$;
CREATE FUNCTION identity.revoke_changed_password_families() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.version<>OLD.version THEN
  PERFORM identity.revoke_refresh_family(id) FROM identity.refresh_family WHERE actor_id=NEW.actor_id AND revoked_at IS NULL;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER password_family_revocation AFTER UPDATE OF version ON identity.password_credential
 FOR EACH ROW EXECUTE FUNCTION identity.revoke_changed_password_families();
REVOKE ALL ON FUNCTION identity.revoke_refresh_family(uuid),identity.revoke_changed_password_families(),
 identity.begin_browser_session(text,text,text),identity.rotate_browser_session(text,text,text,text),identity.logout_browser_session(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.begin_browser_session(text,text,text),identity.rotate_browser_session(text,text,text,text),
 identity.logout_browser_session(text,text) TO "${runtime_role}";
