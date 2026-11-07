-- Existing rows remain uninitialized until their real legacy branch code is imported.
ALTER TABLE crm.customer_branch ADD COLUMN code text CHECK (code IS NULL OR btrim(code) <> '');
ALTER TABLE crm.customer_branch ADD CONSTRAINT customer_branch_code_key UNIQUE (company_id, customer_id, code);

-- Identity owns authorization metadata. CRM receives only the exact grant's branch IDs, not IAM tables.
CREATE FUNCTION identity.portal_branch_scope(actor uuid, company uuid, selected_grant uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object('actorId', actor, 'companyId', company, 'grantId', g.id, 'customerId', g.customer_id,
        'branchIds', coalesce((
            SELECT jsonb_agg(b.id ORDER BY b.id)
            FROM identity.grant_branch gb JOIN crm.customer_branch b
              ON b.company_id=gb.company_id AND b.customer_id=gb.customer_id AND b.id=gb.branch_id
            WHERE gb.grant_id=g.id AND b.status='ACTIVE'), '[]'::jsonb))
    FROM identity.resource_grant g
    JOIN identity.company_member m ON m.company_id=g.company_id AND m.user_id=g.user_id
    JOIN identity.user_account u ON u.id=m.user_id AND u.status='ACTIVE'
    JOIN identity.company c ON c.id=m.company_id AND c.status='ACTIVE'
    JOIN crm.customer customer ON customer.company_id=g.company_id AND customer.id=g.customer_id AND customer.status='ACTIVE'
    WHERE g.id=selected_grant AND g.company_id=company AND g.user_id=actor AND g.enabled
      AND g.scope IN ('CUSTOMER','BRANCH') AND m.status='ACTIVE' AND m.member_kind='CUSTOMER'
      AND EXISTS (SELECT 1 FROM identity.member_role mr JOIN identity.role_permission rp
          ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id
          WHERE mr.company_id=company AND mr.user_id=actor AND rp.permission_code='branch:read')
$$;
REVOKE ALL ON FUNCTION identity.portal_branch_scope(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.portal_branch_scope(uuid,uuid,uuid) TO "${runtime_role}";
COMMENT ON FUNCTION identity.portal_branch_scope(uuid,uuid,uuid) IS 'After verified CUSTOMER authentication only. Explicit branch IDs, including an empty set; never expands a customer grant to all branches.';
