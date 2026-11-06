-- No seed users, companies, passwords or inferred roles. Provision the database separately.
CREATE SCHEMA identity;
REVOKE ALL ON SCHEMA identity FROM PUBLIC;

CREATE TABLE identity.company (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(64) NOT NULL UNIQUE CHECK (btrim(code) <> ''),
    name varchar(200) NOT NULL CHECK (btrim(name) <> ''),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.user_account (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name varchar(200) NOT NULL CHECK (btrim(display_name) <> ''),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.company_member (
    company_id uuid NOT NULL REFERENCES identity.company(id),
    user_id uuid NOT NULL REFERENCES identity.user_account(id),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (company_id, user_id)
);
CREATE INDEX company_member_user_idx ON identity.company_member(user_id, company_id);

-- These settings are set transaction-locally by trusted server code after identity verification.
-- A caller-supplied HTTP company ID is NOT sufficient to establish this context.
CREATE FUNCTION identity.current_company_id() RETURNS uuid
LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog
AS $$ SELECT nullif(current_setting('htt.company_id', true), '')::uuid $$;

CREATE FUNCTION identity.current_actor_id() RETURNS uuid
LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog
AS $$ SELECT nullif(current_setting('htt.actor_id', true), '')::uuid $$;

CREATE FUNCTION identity.has_company_access(target_company_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog
AS $$
    SELECT target_company_id = identity.current_company_id() AND EXISTS (
        SELECT 1 FROM identity.company_member member
        JOIN identity.user_account actor ON actor.id = member.user_id
        WHERE member.company_id = target_company_id
          AND member.user_id = identity.current_actor_id()
          AND member.status = 'ACTIVE' AND actor.status = 'ACTIVE'
    )
$$;

ALTER TABLE identity.user_account ENABLE ROW LEVEL SECURITY;
CREATE POLICY actor_scope ON identity.user_account
    USING (id = identity.current_actor_id());

ALTER TABLE identity.company_member ENABLE ROW LEVEL SECURITY;
CREATE POLICY membership_scope ON identity.company_member
    USING (company_id = identity.current_company_id() AND user_id = identity.current_actor_id());

ALTER TABLE identity.company ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON identity.company USING (identity.has_company_access(id));

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA identity FROM PUBLIC;
GRANT USAGE ON SCHEMA identity TO "${runtime_role}";
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO "${runtime_role}";
GRANT EXECUTE ON FUNCTION identity.current_company_id(), identity.current_actor_id(),
    identity.has_company_access(uuid) TO "${runtime_role}";

COMMENT ON TABLE identity.user_account IS 'Internal user ID only; external identity binding and authentication are not yet implemented.';
COMMENT ON TABLE identity.company_member IS 'Company membership does not grant a business permission or permission to create formal orders.';
