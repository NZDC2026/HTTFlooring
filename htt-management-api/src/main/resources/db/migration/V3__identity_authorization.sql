-- Additive only. This migration must be validated in an isolated PostgreSQL instance before deployment.
-- No external identity bindings, memberships, roles or business grants are seeded.
ALTER TABLE identity.user_account ADD COLUMN tokens_valid_after timestamptz NOT NULL DEFAULT '1970-01-01 UTC';
ALTER TABLE identity.company_member ADD COLUMN membership_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;
ALTER TABLE identity.company_member ADD COLUMN member_kind varchar(24) NOT NULL DEFAULT 'UNCLASSIFIED'
    CHECK (member_kind IN ('UNCLASSIFIED', 'CUSTOMER', 'SALES', 'MANAGEMENT', 'OPERATIONS'));

CREATE FUNCTION identity.revoke_disabled_user_tokens() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
    IF NEW.status = 'DISABLED' AND OLD.status <> 'DISABLED' THEN
        NEW.tokens_valid_after := greatest(NEW.tokens_valid_after, clock_timestamp());
    END IF;
    RETURN NEW;
END
$$;
CREATE TRIGGER revoke_disabled_user_tokens BEFORE UPDATE ON identity.user_account
    FOR EACH ROW EXECUTE FUNCTION identity.revoke_disabled_user_tokens();

CREATE TABLE identity.external_identity (
    issuer text NOT NULL CHECK (issuer LIKE 'https://%'),
    subject varchar(512) NOT NULL CHECK (btrim(subject) <> ''),
    user_id uuid NOT NULL REFERENCES identity.user_account(id),
    realm varchar(16) NOT NULL CHECK (realm IN ('STAFF', 'CUSTOMER')),
    enabled boolean NOT NULL DEFAULT true,
    PRIMARY KEY (issuer, subject)
);
CREATE INDEX external_identity_user_idx ON identity.external_identity(user_id);

CREATE TABLE identity.permission (
    code varchar(100) PRIMARY KEY CHECK (btrim(code) <> '')
);
INSERT INTO identity.permission(code) VALUES ('customer:read'), ('branch:read'), ('order:read'), ('order:create');

CREATE TABLE identity.role (
    company_id uuid NOT NULL REFERENCES identity.company(id),
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code varchar(100) NOT NULL CHECK (btrim(code) <> ''),
    PRIMARY KEY (company_id, id),
    UNIQUE (company_id, code)
);
CREATE TABLE identity.role_permission (
    company_id uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_code varchar(100) NOT NULL REFERENCES identity.permission(code),
    PRIMARY KEY (company_id, role_id, permission_code),
    FOREIGN KEY (company_id, role_id) REFERENCES identity.role(company_id, id)
);
CREATE TABLE identity.member_role (
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    PRIMARY KEY (company_id, user_id, role_id),
    FOREIGN KEY (company_id, user_id) REFERENCES identity.company_member(company_id, user_id),
    FOREIGN KEY (company_id, role_id) REFERENCES identity.role(company_id, id)
);

CREATE TABLE identity.resource_grant (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    scope varchar(16) NOT NULL CHECK (scope IN ('COMPANY', 'CUSTOMER', 'BRANCH')),
    customer_id uuid,
    enabled boolean NOT NULL DEFAULT true,
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    UNIQUE (id, company_id, customer_id),
    FOREIGN KEY (company_id, user_id) REFERENCES identity.company_member(company_id, user_id),
    FOREIGN KEY (company_id, customer_id) REFERENCES crm.customer(company_id, id),
    CHECK ((scope = 'COMPANY' AND customer_id IS NULL) OR (scope <> 'COMPANY' AND customer_id IS NOT NULL))
);
CREATE INDEX resource_grant_member_idx ON identity.resource_grant(company_id, user_id);
CREATE TABLE identity.grant_branch (
    grant_id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    PRIMARY KEY (grant_id, branch_id),
    FOREIGN KEY (grant_id, company_id, customer_id) REFERENCES identity.resource_grant(id, company_id, customer_id),
    FOREIGN KEY (company_id, customer_id, branch_id) REFERENCES crm.customer_branch(company_id, customer_id, id)
);

CREATE TABLE platform.access_audit (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    request_id uuid NOT NULL,
    actor_id uuid,
    selected_company_id uuid,
    action varchar(100) NOT NULL,
    resource_id uuid,
    outcome varchar(8) NOT NULL CHECK (outcome IN ('ALLOW', 'DENY'))
);
CREATE INDEX access_audit_actor_time_idx ON platform.access_audit(actor_id, occurred_at);

-- App has no direct access to new security tables (including audit). RLS is additional default-deny protection.
ALTER TABLE identity.external_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.member_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.resource_grant ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.grant_branch ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.access_audit ENABLE ROW LEVEL SECURITY;

-- This narrowly scoped bootstrap function is invoked only after issuer/signature/audience validation in Java.
-- Its owner must be the migration role, never the runtime role. No dynamic SQL or caller-controlled search_path.
CREATE FUNCTION identity.resolve_access(trusted_issuer text, trusted_subject text, requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object(
        'actorId', actor.id, 'displayName', actor.display_name, 'tokensValidAfter', actor.tokens_valid_after,
        'companies', coalesce((
            SELECT jsonb_agg(jsonb_build_object(
                'companyId', company.id, 'companyName', company.name, 'membershipId', member.membership_id,
                'memberKind', member.member_kind,
                'roles', coalesce((SELECT jsonb_agg(role.code ORDER BY role.code)
                    FROM identity.member_role assignment JOIN identity.role role
                        ON role.company_id = assignment.company_id AND role.id = assignment.role_id
                    WHERE assignment.company_id = company.id AND assignment.user_id = actor.id), '[]'::jsonb),
                'permissions', coalesce((SELECT jsonb_agg(DISTINCT permission.permission_code)
                    FROM identity.member_role assignment JOIN identity.role_permission permission
                        ON permission.company_id = assignment.company_id AND permission.role_id = assignment.role_id
                    WHERE assignment.company_id = company.id AND assignment.user_id = actor.id), '[]'::jsonb),
                'grants', coalesce((SELECT jsonb_agg(jsonb_build_object(
                    'id', grant_record.id, 'version', grant_record.version, 'scope', grant_record.scope,
                    'customerId', grant_record.customer_id, 'customerCode', customer.code, 'customerName', customer.business_name,
                    'branchIds', coalesce((SELECT jsonb_agg(branch.id ORDER BY branch.id)
                        FROM identity.grant_branch granted_branch JOIN crm.customer_branch branch
                            ON branch.company_id = granted_branch.company_id AND branch.id = granted_branch.branch_id
                        WHERE granted_branch.grant_id = grant_record.id AND branch.status = 'ACTIVE'), '[]'::jsonb))
                        ORDER BY grant_record.id)
                    FROM identity.resource_grant grant_record LEFT JOIN crm.customer customer
                        ON customer.company_id = grant_record.company_id AND customer.id = grant_record.customer_id
                    WHERE grant_record.company_id = company.id AND grant_record.user_id = actor.id AND grant_record.enabled
                        AND (grant_record.customer_id IS NULL OR customer.status = 'ACTIVE')
                        AND (requested_realm <> 'CUSTOMER' OR grant_record.scope <> 'COMPANY')
                        AND (grant_record.scope <> 'BRANCH' OR EXISTS (
                            SELECT 1 FROM identity.grant_branch gb JOIN crm.customer_branch branch
                                ON branch.company_id = gb.company_id AND branch.id = gb.branch_id
                            WHERE gb.grant_id = grant_record.id AND branch.status = 'ACTIVE'))), '[]'::jsonb)
                ) ORDER BY company.id)
            FROM identity.company_member member JOIN identity.company company ON company.id = member.company_id
            WHERE member.user_id = actor.id AND member.status = 'ACTIVE' AND company.status = 'ACTIVE'
                AND ((requested_realm = 'CUSTOMER' AND member.member_kind = 'CUSTOMER')
                    OR (requested_realm = 'STAFF' AND member.member_kind <> 'CUSTOMER'))
        ), '[]'::jsonb))
    FROM identity.external_identity binding JOIN identity.user_account actor ON actor.id = binding.user_id
    WHERE binding.issuer = trusted_issuer AND binding.subject = trusted_subject AND binding.realm = requested_realm
        AND binding.enabled AND actor.status = 'ACTIVE'
$$;

-- Ownership metadata only; no business payload. Java still checks membership, action and scope before returning data.
-- ORDER intentionally resolves to NULL until a reviewed order schema supplies authoritative ownership.
CREATE FUNCTION identity.resource_owner(resource_kind text, resource_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object('companyId', owner.company_id, 'customerId', owner.customer_id, 'branchId', owner.branch_id)
    FROM (
        SELECT customer.company_id, customer.id AS customer_id, NULL::uuid AS branch_id
        FROM crm.customer customer JOIN identity.company company ON company.id = customer.company_id
        WHERE resource_kind = 'CUSTOMER' AND customer.id = resource_id AND customer.status = 'ACTIVE' AND company.status = 'ACTIVE'
        UNION ALL
        SELECT branch.company_id, branch.customer_id, branch.id
        FROM crm.customer_branch branch JOIN crm.customer customer ON customer.company_id = branch.company_id AND customer.id = branch.customer_id
        JOIN identity.company company ON company.id = branch.company_id
        WHERE resource_kind = 'BRANCH' AND branch.id = resource_id
            AND branch.status = 'ACTIVE' AND customer.status = 'ACTIVE' AND company.status = 'ACTIVE'
    ) owner
$$;

CREATE FUNCTION identity.append_access_audit(audit_request_id text, audit_actor_id uuid, audit_company_id uuid,
        audit_action text, audit_resource_id uuid, audit_outcome text) RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog AS $$
    INSERT INTO platform.access_audit(request_id, actor_id, selected_company_id, action, resource_id, outcome)
    VALUES (audit_request_id::uuid, audit_actor_id, audit_company_id, audit_action, audit_resource_id, audit_outcome)
$$;

REVOKE ALL ON FUNCTION identity.revoke_disabled_user_tokens(), identity.resolve_access(text, text, text),
    identity.resource_owner(text, uuid), identity.append_access_audit(text, uuid, uuid, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.resolve_access(text, text, text), identity.resource_owner(text, uuid),
    identity.append_access_audit(text, uuid, uuid, text, uuid, text) TO "${runtime_role}";

COMMENT ON TABLE identity.user_account IS 'Unified internal user; trusted issuer + subject bindings are explicit. Tokens are rechecked against current access state on every request.';
COMMENT ON COLUMN identity.company_member.member_kind IS 'Order eligibility attribute. MANAGEMENT still requires order:create and explicit resource scope. Role names never establish this attribute.';
COMMENT ON TABLE platform.access_audit IS 'Authorization decisions, not proof that an action committed. No tokens or request payloads. Runtime can append only through the restricted function.';
