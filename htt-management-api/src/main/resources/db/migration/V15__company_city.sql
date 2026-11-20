-- Company metadata, independent of customer/warehouse addresses and authorization boundaries.
ALTER TABLE identity.company ADD COLUMN city varchar(100)
 CHECK(city IS NULL OR (city=btrim(city) AND city<>''));
COMMENT ON COLUMN identity.company.city IS 'Operating company city, e.g. Sydney or Melbourne. Never used to derive permissions or company identity. Historical unknown values remain NULL.';

CREATE OR REPLACE FUNCTION identity.resolve_access(trusted_issuer text, trusted_subject text, requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object(
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


