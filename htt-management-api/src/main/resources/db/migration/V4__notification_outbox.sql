CREATE SCHEMA notification;
REVOKE ALL ON SCHEMA notification FROM PUBLIC;
INSERT INTO identity.permission(code) VALUES ('notification:read'), ('notification:device');

CREATE TABLE platform.domain_outbox (
    id uuid PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES identity.company(id),
    event_type varchar(100) NOT NULL,
    payload jsonb NOT NULL,
    state varchar(16) NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','IN_FLIGHT','PUBLISHED','DEAD')),
    attempts integer NOT NULL DEFAULT 0,
    available_at timestamptz NOT NULL DEFAULT now(),
    lease_id uuid, lease_until timestamptz,
    last_error varchar(100), created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);
CREATE INDEX domain_outbox_pending_idx ON platform.domain_outbox(available_at) WHERE state <> 'PUBLISHED';
CREATE TABLE notification.inbox (
    event_id uuid PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES identity.company(id),
    payload_hash varchar(64) NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now()
);
-- Lock this row until commit when allocating a cursor. A sequence alone does not preserve commit order.
CREATE TABLE notification.recipient_cursor (
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    last_cursor bigint NOT NULL DEFAULT 0,
    PRIMARY KEY(company_id,user_id),
    FOREIGN KEY(company_id,user_id) REFERENCES identity.company_member(company_id,user_id)
);
CREATE TABLE notification.message (
    id uuid PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES notification.inbox(event_id),
    company_id uuid NOT NULL, user_id uuid NOT NULL,
    customer_id uuid, branch_id uuid,
    cursor bigint NOT NULL CHECK(cursor > 0),
    event_type varchar(100) NOT NULL,
    title varchar(200) NOT NULL, body varchar(1000) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz,
    UNIQUE(event_id,user_id), UNIQUE(company_id,user_id,cursor),
    FOREIGN KEY(company_id,user_id) REFERENCES identity.company_member(company_id,user_id),
    FOREIGN KEY(company_id,customer_id) REFERENCES crm.customer(company_id,id),
    FOREIGN KEY(company_id,customer_id,branch_id) REFERENCES crm.customer_branch(company_id,customer_id,id),
    CHECK(branch_id IS NULL OR customer_id IS NOT NULL)
);
CREATE TABLE notification.device (
    id uuid PRIMARY KEY,
    company_id uuid NOT NULL, user_id uuid NOT NULL,
    platform varchar(8) NOT NULL CHECK(platform IN ('ANDROID','IOS')),
    token text NOT NULL CHECK(length(token) BETWEEN 1 AND 4096),
    token_hash varchar(64) NOT NULL,
    enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(company_id,user_id,token_hash),
    FOREIGN KEY(company_id,user_id) REFERENCES identity.company_member(company_id,user_id)
);
CREATE TABLE notification.delivery (
    id uuid PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES notification.message(id),
    channel varchar(8) NOT NULL CHECK(channel IN ('SSE','FCM')),
    target_id uuid NOT NULL,
    state varchar(16) NOT NULL DEFAULT 'PENDING'
        CHECK(state IN ('PENDING','IN_FLIGHT','SENT','SIMULATED','SKIPPED','DEAD')),
    attempts integer NOT NULL DEFAULT 0,
    available_at timestamptz NOT NULL DEFAULT now(), lease_id uuid, lease_until timestamptz,
    last_error varchar(100), updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(message_id,channel,target_id)
);
CREATE INDEX notification_delivery_pending_idx ON notification.delivery(available_at) WHERE state IN ('PENDING','IN_FLIGHT');
CREATE TABLE notification.audit (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id uuid, event_id uuid, message_id uuid,
    action varchar(64) NOT NULL, outcome varchar(32) NOT NULL, attempt integer NOT NULL DEFAULT 0,
    error_code varchar(100), occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX notification_audit_event_idx ON notification.audit(event_id,occurred_at);

-- Internal worker context is set transaction-locally by trusted service code, never from HTTP headers.
CREATE FUNCTION notification.is_worker() RETURNS boolean
LANGUAGE sql STABLE SET search_path=pg_catalog
AS $$ SELECT coalesce(current_setting('htt.notification_worker',true),'') = 'true' $$;

CREATE FUNCTION notification.can_receive(actor uuid, company uuid, customer uuid, branch uuid, selected_grant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
    SELECT EXISTS (
        SELECT 1 FROM identity.user_account u
        JOIN identity.company_member m ON m.user_id=u.id
        JOIN identity.company c ON c.id=m.company_id
        WHERE u.id=actor AND m.company_id=company AND u.status='ACTIVE' AND m.status='ACTIVE' AND c.status='ACTIVE'
        AND EXISTS (SELECT 1 FROM identity.member_role mr JOIN identity.role_permission rp
            ON rp.company_id=mr.company_id AND rp.role_id=mr.role_id
            WHERE mr.company_id=company AND mr.user_id=actor AND rp.permission_code='notification:read')
        AND (customer IS NULL OR EXISTS(SELECT 1 FROM crm.customer x WHERE x.company_id=company AND x.id=customer AND x.status='ACTIVE'))
        AND (branch IS NULL OR EXISTS(SELECT 1 FROM crm.customer_branch b WHERE b.company_id=company AND b.customer_id=customer AND b.id=branch AND b.status='ACTIVE'))
        AND EXISTS (SELECT 1 FROM identity.resource_grant g WHERE g.company_id=company AND g.user_id=actor AND g.enabled
            AND (selected_grant IS NULL OR g.id=selected_grant)
            AND (m.member_kind <> 'CUSTOMER' OR (g.scope <> 'COMPANY' AND customer IS NOT NULL))
            AND (g.scope='COMPANY' OR (g.customer_id=customer AND
                (g.scope='CUSTOMER' OR (g.scope='BRANCH' AND EXISTS(SELECT 1 FROM identity.grant_branch gb
                    JOIN crm.customer_branch b ON b.company_id=gb.company_id AND b.id=gb.branch_id AND b.status='ACTIVE'
                    WHERE gb.grant_id=g.id AND (branch IS NULL OR gb.branch_id=branch)))))))
    )
$$;

ALTER TABLE platform.domain_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY outbox_scope ON platform.domain_outbox
    USING(notification.is_worker() OR identity.has_company_access(company_id));
ALTER TABLE notification.inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY worker_scope ON notification.inbox USING(notification.is_worker());
ALTER TABLE notification.recipient_cursor ENABLE ROW LEVEL SECURITY;
CREATE POLICY cursor_read ON notification.recipient_cursor FOR SELECT
    USING(notification.is_worker() OR (company_id=identity.current_company_id() AND user_id=identity.current_actor_id()));
CREATE POLICY cursor_write ON notification.recipient_cursor FOR ALL USING(notification.is_worker());
ALTER TABLE notification.message ENABLE ROW LEVEL SECURITY;
CREATE POLICY message_scope ON notification.message USING(notification.is_worker() OR
    (company_id=identity.current_company_id() AND user_id=identity.current_actor_id()
     AND notification.can_receive(user_id,company_id,customer_id,branch_id,
        nullif(current_setting('htt.portal_grant_id',true),'')::uuid)));
ALTER TABLE notification.device ENABLE ROW LEVEL SECURITY;
CREATE POLICY device_scope ON notification.device USING(notification.is_worker() OR
    (company_id=identity.current_company_id() AND user_id=identity.current_actor_id() AND identity.has_company_access(company_id)));
ALTER TABLE notification.delivery ENABLE ROW LEVEL SECURITY;
CREATE POLICY worker_scope ON notification.delivery USING(notification.is_worker());
ALTER TABLE notification.audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY worker_scope ON notification.audit USING(notification.is_worker());

REVOKE ALL ON FUNCTION notification.is_worker(), notification.can_receive(uuid,uuid,uuid,uuid,uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA notification TO "${runtime_role}";
GRANT EXECUTE ON FUNCTION notification.is_worker(), notification.can_receive(uuid,uuid,uuid,uuid,uuid) TO "${runtime_role}";
GRANT SELECT,INSERT,UPDATE ON platform.domain_outbox TO "${runtime_role}";
GRANT SELECT,INSERT ON notification.inbox TO "${runtime_role}";
GRANT SELECT,INSERT,UPDATE ON notification.recipient_cursor,notification.message,notification.device,notification.delivery TO "${runtime_role}";
GRANT SELECT,INSERT ON notification.audit TO "${runtime_role}";
GRANT USAGE ON SEQUENCE notification.audit_id_seq TO "${runtime_role}";
COMMENT ON TABLE notification.delivery IS 'At-least-once channel attempts. SENT for SSE means wake-up published, not browser receipt. SIMULATED is never real push delivery.';
