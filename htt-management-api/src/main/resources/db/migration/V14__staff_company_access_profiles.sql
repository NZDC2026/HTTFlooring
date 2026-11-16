-- Profiles constrain company memberships; role names alone never grant authority.
ALTER TABLE identity.company_member ADD COLUMN access_profile varchar(24) NOT NULL DEFAULT 'STANDARD'
 CHECK(access_profile IN ('STANDARD','GROUP_READER','COMPANY_OWNER','SALES'));
ALTER TABLE identity.company_member ADD CONSTRAINT staff_profile_kind CHECK(
 (access_profile<>'COMPANY_OWNER' OR member_kind='MANAGEMENT')
 AND (access_profile<>'SALES' OR member_kind='SALES')
 AND (access_profile<>'GROUP_READER' OR member_kind<>'CUSTOMER'));

ALTER TABLE identity.permission ADD COLUMN business_read boolean NOT NULL DEFAULT false;
UPDATE identity.permission SET business_read=true WHERE code IN ('customer:read','branch:read','order:read','pricing:discount:read');

CREATE TABLE identity.staff_profile_role (
 company_id uuid NOT NULL REFERENCES identity.company(id),
 profile varchar(24) NOT NULL CHECK(profile IN ('GROUP_READER','COMPANY_OWNER','SALES')),
 role_id uuid NOT NULL,
 PRIMARY KEY(company_id,profile),
 FOREIGN KEY(company_id,role_id) REFERENCES identity.role(company_id,id)
);
CREATE TABLE platform.staff_access_change_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES identity.company(id),
 target_actor_id uuid NOT NULL REFERENCES identity.user_account(id),
 configured_by text NOT NULL DEFAULT session_user,
 profile varchar(24) NOT NULL,
 reason varchar(500) NOT NULL CHECK(btrim(reason)<>''),
 role_ids uuid[] NOT NULL,
 customer_ids uuid[] NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON identity.staff_profile_role,platform.staff_access_change_audit FROM PUBLIC,"${runtime_role}";

-- Maintenance-only configuration. No runtime grant and no HTTP self-promotion endpoint.
CREATE FUNCTION identity.configure_staff_access(target_actor uuid,target_company uuid,requested_profile text,
 assigned_customers uuid[],additional_roles uuid[],change_reason text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE profile_role uuid; customer uuid; actor_kind text;
BEGIN
 IF requested_profile IS NULL OR requested_profile NOT IN ('GROUP_READER','COMPANY_OWNER','SALES','REVOKED')
 OR change_reason IS NULL OR btrim(change_reason)='' OR length(change_reason)>500
 OR cardinality(assigned_customers)>200 OR cardinality(additional_roles)>50
 OR array_position(assigned_customers,NULL) IS NOT NULL OR array_position(additional_roles,NULL) IS NOT NULL THEN
  RAISE EXCEPTION 'Invalid access configuration' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM identity.user_account WHERE id=target_actor AND status='ACTIVE')
 OR NOT EXISTS(SELECT 1 FROM identity.company WHERE id=target_company AND status='ACTIVE') THEN
  RAISE EXCEPTION 'Unknown active actor or company' USING ERRCODE='23503'; END IF;
 -- Serialize edits of one employee across companies; do not create a second employee profile.
 PERFORM 1 FROM identity.user_account WHERE id=target_actor FOR UPDATE;
 PERFORM 1 FROM identity.company WHERE id=target_company FOR UPDATE;
 IF requested_profile='REVOKED' THEN
  UPDATE identity.company_member SET status='DISABLED',version=version+1 WHERE company_id=target_company AND user_id=target_actor;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown membership' USING ERRCODE='23503'; END IF;
 ELSE
  IF NOT EXISTS(SELECT 1 FROM identity.employee e JOIN identity.company c ON c.id=e.company_id
      WHERE e.actor_id=target_actor AND e.status='ACTIVE' AND c.status='ACTIVE'
      AND (requested_profile='GROUP_READER' OR e.company_id=target_company))
   OR EXISTS(SELECT 1 FROM identity.customer_account WHERE actor_id=target_actor)
   OR EXISTS(SELECT 1 FROM identity.password_credential WHERE actor_id=target_actor AND realm<>'STAFF') THEN
   RAISE EXCEPTION 'Active staff ownership required' USING ERRCODE='23514'; END IF;
  IF requested_profile<>'SALES' AND cardinality(assigned_customers)>0 THEN
   RAISE EXCEPTION 'Only sales accepts assigned customers' USING ERRCODE='23514'; END IF;
  IF EXISTS(SELECT 1 FROM unnest(assigned_customers) x WHERE NOT EXISTS(
    SELECT 1 FROM crm.customer c WHERE c.company_id=target_company AND c.id=x))
   OR EXISTS(SELECT 1 FROM unnest(additional_roles) x WHERE NOT EXISTS(
    SELECT 1 FROM identity.role r WHERE r.company_id=target_company AND r.id=x)) THEN
   RAISE EXCEPTION 'Cross-company assignment' USING ERRCODE='23503'; END IF;
  actor_kind:=CASE requested_profile WHEN 'COMPANY_OWNER' THEN 'MANAGEMENT' WHEN 'SALES' THEN 'SALES' ELSE 'OPERATIONS' END;
  INSERT INTO identity.company_member(company_id,user_id,member_kind,access_profile)
  VALUES(target_company,target_actor,actor_kind,requested_profile)
  ON CONFLICT(company_id,user_id) DO UPDATE SET member_kind=excluded.member_kind,access_profile=excluded.access_profile,status='ACTIVE',version=company_member.version+1;
  SELECT role_id INTO profile_role FROM identity.staff_profile_role WHERE company_id=target_company AND profile=requested_profile;
  IF profile_role IS NULL THEN
   profile_role:=gen_random_uuid();
   INSERT INTO identity.role(company_id,id,code) VALUES(target_company,profile_role,'HTT-'||requested_profile||'-'||profile_role::text);
   INSERT INTO identity.staff_profile_role(company_id,profile,role_id) VALUES(target_company,requested_profile,profile_role);
   INSERT INTO identity.role_permission(company_id,role_id,permission_code)
   SELECT target_company,profile_role,code FROM identity.permission
   WHERE (requested_profile='GROUP_READER' AND business_read)
     OR (requested_profile='COMPANY_OWNER' AND code IN ('customer:read','branch:read','order:read','customer:create','customer:update','customer:status',
       'customer:account:create','customer:account:status','customer:account:reset','pricing:discount:read','pricing:discount:write'))
     OR (requested_profile='SALES' AND code IN ('customer:read','branch:read','order:read'));
  END IF;
  DELETE FROM identity.member_role WHERE company_id=target_company AND user_id=target_actor
   AND (additional_roles IS NOT NULL OR role_id IN(SELECT role_id FROM identity.staff_profile_role WHERE company_id=target_company));
  INSERT INTO identity.member_role(company_id,user_id,role_id) VALUES(target_company,target_actor,profile_role) ON CONFLICT DO NOTHING;
  INSERT INTO identity.member_role(company_id,user_id,role_id)
   SELECT target_company,target_actor,x FROM unnest(additional_roles) x ON CONFLICT DO NOTHING;
  UPDATE identity.resource_grant SET enabled=false,version=version+1 WHERE company_id=target_company AND user_id=target_actor AND enabled;
  IF requested_profile='SALES' THEN
   FOR customer IN SELECT DISTINCT unnest(assigned_customers) LOOP
    INSERT INTO identity.resource_grant(company_id,user_id,scope,customer_id) VALUES(target_company,target_actor,'CUSTOMER',customer);
   END LOOP;
  ELSE
   INSERT INTO identity.resource_grant(company_id,user_id,scope) VALUES(target_company,target_actor,'COMPANY');
  END IF;
 END IF;
 INSERT INTO platform.staff_access_change_audit(company_id,target_actor_id,profile,reason,role_ids,customer_ids)
 VALUES(target_company,target_actor,requested_profile,change_reason,
   ARRAY(SELECT role_id FROM identity.member_role WHERE company_id=target_company AND user_id=target_actor ORDER BY role_id),
   ARRAY(SELECT DISTINCT customer_id FROM identity.resource_grant WHERE company_id=target_company AND user_id=target_actor AND enabled AND customer_id IS NOT NULL ORDER BY customer_id));
END $$;
REVOKE ALL ON FUNCTION identity.configure_staff_access(uuid,uuid,text,uuid[],uuid[],text) FROM PUBLIC,"${runtime_role}";

CREATE FUNCTION identity.can_write_company(target_company uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT identity.has_company_access(target_company) AND EXISTS(
  SELECT 1 FROM identity.company_member WHERE company_id=target_company AND user_id=identity.current_actor_id()
   AND status='ACTIVE' AND access_profile<>'GROUP_READER')
$$;
REVOKE ALL ON FUNCTION identity.can_write_company(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.can_write_company(uuid) TO "${runtime_role}";

-- Business writes are rejected by RLS even if a reader accidentally receives a write role.
DO $$ DECLARE relation text; BEGIN
 FOREACH relation IN ARRAY ARRAY['crm.customer','crm.customer_contact','crm.customer_location','crm.customer_billing_address','crm.customer_workspace','pricing.product_discount'] LOOP
  EXECUTE format('CREATE POLICY staff_write_insert ON %s AS RESTRICTIVE FOR INSERT WITH CHECK(identity.can_write_company(company_id))',relation);
  EXECUTE format('CREATE POLICY staff_write_update ON %s AS RESTRICTIVE FOR UPDATE USING(identity.can_write_company(company_id)) WITH CHECK(identity.can_write_company(company_id))',relation);
  EXECUTE format('CREATE POLICY staff_write_delete ON %s AS RESTRICTIVE FOR DELETE USING(identity.can_write_company(company_id))',relation);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION identity.resolve_access(trusted_issuer text, trusted_subject text, requested_realm text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
    SELECT jsonb_build_object(
        'actorId', actor.id, 'displayName', actor.display_name, 'tokensValidAfter', actor.tokens_valid_after,
        'companies', coalesce((
            SELECT jsonb_agg(jsonb_build_object(
                'companyId', company.id, 'companyName', company.name, 'membershipId', member.membership_id,
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


CREATE OR REPLACE FUNCTION identity.customer_account_authorized(actor uuid,company uuid,customer uuid,action text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT actor=identity.current_actor_id() AND company=identity.current_company_id() AND EXISTS (
 SELECT 1 FROM identity.company_member m JOIN identity.user_account u ON u.id=m.user_id AND u.status='ACTIVE'
 JOIN identity.company c ON c.id=m.company_id AND c.status='ACTIVE'
 JOIN identity.member_role mr ON mr.company_id=m.company_id AND mr.user_id=m.user_id
 JOIN identity.role_permission rp ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id AND rp.permission_code=action
 WHERE m.user_id=actor AND m.company_id=company AND m.member_kind='MANAGEMENT' AND m.status='ACTIVE' AND m.access_profile<>'GROUP_READER'
 AND EXISTS(SELECT 1 FROM identity.resource_grant g WHERE g.company_id=company AND g.user_id=actor AND g.enabled
 AND (g.scope='COMPANY' OR (g.scope='CUSTOMER' AND g.customer_id=customer))))
$$;

