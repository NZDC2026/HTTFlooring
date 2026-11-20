INSERT INTO identity.permission(code,business_read) VALUES ('company:create',false);

-- This action belongs to platform maintenance, never to a company's role permissions.
CREATE TABLE identity.platform_grant (
 actor_id uuid NOT NULL REFERENCES identity.user_account(id),
 permission_code varchar(100) NOT NULL REFERENCES identity.permission(code) CHECK(permission_code='company:create'),
 enabled boolean NOT NULL DEFAULT true,
 version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 reason varchar(500) NOT NULL CHECK(btrim(reason)<>''),
 configured_by text NOT NULL DEFAULT session_user,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(actor_id,permission_code)
);
CREATE TABLE identity.company_creation (
 actor_id uuid NOT NULL REFERENCES identity.user_account(id),
 request_id uuid NOT NULL,
 request_hash varchar(64) NOT NULL CHECK(length(request_hash)=64),
 company_id uuid NOT NULL UNIQUE REFERENCES identity.company(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(actor_id,request_id)
);
REVOKE ALL ON identity.platform_grant,identity.company_creation FROM PUBLIC,"${runtime_role}";

CREATE FUNCTION identity.can_create_company(actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT EXISTS(SELECT 1 FROM identity.platform_grant g JOIN identity.user_account u ON u.id=g.actor_id
  WHERE g.actor_id=actor AND g.permission_code='company:create' AND g.enabled AND u.status='ACTIVE')
 AND EXISTS(SELECT 1 FROM identity.employee e JOIN identity.company c ON c.id=e.company_id
  WHERE e.actor_id=actor AND e.status='ACTIVE' AND c.status='ACTIVE')
 AND EXISTS(SELECT 1 FROM identity.company_member m JOIN identity.company c ON c.id=m.company_id
  WHERE m.user_id=actor AND m.status='ACTIVE' AND m.access_profile='GROUP_READER' AND c.status='ACTIVE')
 AND NOT EXISTS(SELECT 1 FROM identity.customer_account WHERE actor_id=actor)
$$;
REVOKE ALL ON FUNCTION identity.can_create_company(uuid) FROM PUBLIC,"${runtime_role}";

-- Transactionally creates metadata plus the immutable creation/idempotency record.
-- Does not assign memberships, employees, roles, business data or financial defaults.
CREATE FUNCTION identity.create_company(caller uuid,operation uuid,payload_hash text,
 requested_code text,requested_name text,requested_city text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result_id uuid; previous identity.company_creation%ROWTYPE;
BEGIN
 -- Lock order is actor then platform grant, avoiding lock upgrades between concurrent retries.
 PERFORM 1 FROM identity.user_account WHERE id=caller FOR UPDATE;
 PERFORM 1 FROM identity.platform_grant g JOIN identity.user_account u ON u.id=g.actor_id
  WHERE g.actor_id=caller AND g.permission_code='company:create' AND g.enabled AND u.status='ACTIVE' FOR SHARE OF g,u;
 IF NOT FOUND OR NOT identity.can_create_company(caller) THEN
  RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF operation IS NULL OR payload_hash IS NULL OR payload_hash !~ '^[0-9a-f]{64}$'
 OR requested_code IS NULL OR requested_code !~ '^[A-Z0-9][A-Z0-9_-]{0,63}$'
 OR requested_name IS NULL OR btrim(requested_name)='' OR requested_name<>btrim(requested_name) OR length(requested_name)>200
 OR requested_city IS NULL OR btrim(requested_city)='' OR requested_city<>btrim(requested_city) OR length(requested_city)>100 THEN
  RAISE EXCEPTION 'Invalid company' USING ERRCODE='23514'; END IF;
 -- Serialize retries for this actor; no advisory hash collision or unbounded lock key needed.
 SELECT * INTO previous FROM identity.company_creation WHERE actor_id=caller AND request_id=operation;
 IF FOUND THEN
  IF previous.request_hash<>payload_hash THEN RAISE EXCEPTION 'Idempotency conflict' USING ERRCODE='23505'; END IF;
  result_id:=previous.company_id;
 ELSE
  INSERT INTO identity.company(code,name,city) VALUES(requested_code,requested_name,requested_city) RETURNING id INTO result_id;
  INSERT INTO identity.company_creation(actor_id,request_id,request_hash,company_id) VALUES(caller,operation,payload_hash,result_id);
 END IF;
 RETURN (SELECT jsonb_build_object('id',id,'code',code,'name',name,'city',city,'status',status,
  'version',version,'createdAt',created_at,'updatedAt',updated_at) FROM identity.company WHERE id=result_id);
END $$;
REVOKE ALL ON FUNCTION identity.create_company(uuid,uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.create_company(uuid,uuid,text,text,text,text) TO "${runtime_role}";

CREATE OR REPLACE FUNCTION identity.resolve_access(trusted_issuer text, trusted_subject text, requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object(
        'globalPermissions', CASE WHEN requested_realm='STAFF' AND identity.can_create_company(actor.id)
            THEN jsonb_build_array('company:create') ELSE '[]'::jsonb END,
        'actorId', actor.id, 'displayName', actor.display_name, 'tokensValidAfter', actor.tokens_valid_after,
        'companies', coalesce((
            SELECT jsonb_agg(jsonb_build_object(
                'companyId', company.id, 'companyName', company.name, 'city', company.city, 'membershipId', member.membership_id,
                'memberKind', member.member_kind, 'accessProfile', member.access_profile,
                'roles', coalesce((SELECT jsonb_agg(role.code ORDER BY role.code)
                    FROM identity.member_role assignment JOIN identity.role role
                        ON role.company_id = assignment.company_id AND role.id = assignment.role_id
                    WHERE assignment.company_id = company.id AND assignment.user_id = actor.id), '[]'::jsonb),
                'permissions', coalesce((SELECT jsonb_agg(DISTINCT permission.permission_code)
                    FROM identity.member_role assignment JOIN identity.role_permission permission
                        ON permission.company_id = assignment.company_id AND permission.role_id = assignment.role_id
                    WHERE assignment.company_id = company.id AND assignment.user_id = actor.id
                        AND permission.permission_code<>'company:create'
                        AND (member.access_profile<>'GROUP_READER' OR EXISTS(SELECT 1 FROM identity.permission catalog
                            WHERE catalog.code=permission.permission_code AND catalog.business_read))), '[]'::jsonb),
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
                        AND (member.member_kind<>'SALES' OR grant_record.scope<>'COMPANY')
                        AND (grant_record.customer_id IS NULL OR customer.status = 'ACTIVE')
                        AND (requested_realm <> 'CUSTOMER' OR grant_record.scope <> 'COMPANY')
                        AND (grant_record.scope <> 'BRANCH' OR EXISTS (
                            SELECT 1 FROM identity.grant_branch gb JOIN crm.customer_branch branch
                                ON branch.company_id = gb.company_id AND branch.id = gb.branch_id
                            WHERE gb.grant_id = grant_record.id AND branch.status = 'ACTIVE'))), '[]'::jsonb)
                ) ORDER BY company.id)
            FROM identity.company_member member JOIN identity.company company ON company.id = member.company_id
            WHERE member.user_id = actor.id AND member.status = 'ACTIVE' AND company.status = 'ACTIVE'
                AND (member.access_profile NOT IN ('COMPANY_OWNER','SALES') OR EXISTS(SELECT 1 FROM identity.employee e
                    WHERE e.company_id=company.id AND e.actor_id=actor.id AND e.status='ACTIVE'))
                AND ((requested_realm = 'CUSTOMER' AND member.member_kind = 'CUSTOMER')
                    OR (requested_realm = 'STAFF' AND member.member_kind <> 'CUSTOMER'))
        ), '[]'::jsonb))
    FROM identity.external_identity binding JOIN identity.user_account actor ON actor.id = binding.user_id
    WHERE binding.issuer = trusted_issuer AND binding.subject = trusted_subject AND binding.realm = requested_realm
        AND binding.enabled AND actor.status = 'ACTIVE'
$$;


