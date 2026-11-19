CREATE SCHEMA hr;
GRANT USAGE ON SCHEMA hr TO "${runtime_role}";

INSERT INTO identity.permission(code,business_read) VALUES
    ('payroll:read',true), ('payroll:manage',false), ('payroll:sensitive:read',false);

CREATE FUNCTION hr.permitted(target_company uuid, action text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
    SELECT target_company=identity.current_company_id()
      AND action IN ('payroll:read','payroll:manage','payroll:sensitive:read')
      AND EXISTS (
        SELECT 1 FROM identity.company_member m
        JOIN identity.user_account u ON u.id=m.user_id AND u.status='ACTIVE'
        JOIN identity.company c ON c.id=m.company_id AND c.status='ACTIVE'
        JOIN identity.member_role mr ON mr.company_id=m.company_id AND mr.user_id=m.user_id
        JOIN identity.role_permission rp ON rp.company_id=mr.company_id
            AND rp.role_id=mr.role_id AND rp.permission_code=action
        WHERE m.company_id=target_company AND m.user_id=identity.current_actor_id()
          AND m.status='ACTIVE' AND m.member_kind NOT IN ('CUSTOMER','SALES')
          AND (action='payroll:read' OR m.access_profile<>'GROUP_READER')
          AND (m.access_profile<>'COMPANY_OWNER' OR EXISTS (
              SELECT 1 FROM identity.employee e WHERE e.actor_id=m.user_id
                AND e.company_id=m.company_id AND e.status='ACTIVE'))
          AND EXISTS (SELECT 1 FROM identity.resource_grant g WHERE g.company_id=m.company_id
                AND g.user_id=m.user_id AND g.scope='COMPANY' AND g.enabled)
      )
$$;
REVOKE ALL ON FUNCTION hr.permitted(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hr.permitted(uuid,text) TO "${runtime_role}";

CREATE TABLE hr.employee (
    id uuid PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES identity.company(id),
    employee_code varchar(40) NOT NULL,
    full_name varchar(200) NOT NULL CHECK (btrim(full_name)<>''),
    position varchar(200),
    start_date date NOT NULL,
    end_date date CHECK (end_date>=start_date),
    employment_type varchar(20) NOT NULL CHECK (employment_type IN ('FULL_TIME','PART_TIME','CASUAL')),
    employment_category varchar(20) NOT NULL CHECK (employment_category IN ('PERMANENT','TEMPORARY','CASUAL')),
    status varchar(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','LEFT')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES identity.user_account(id),
    updated_by uuid NOT NULL REFERENCES identity.user_account(id),
    request_id uuid NOT NULL,
    request_hash char(64) NOT NULL,
    UNIQUE (company_id,id),
    UNIQUE (company_id,employee_code),
    UNIQUE (company_id,created_by,request_id)
);
CREATE INDEX employee_directory_status ON hr.employee(company_id,status,employee_code);

CREATE TABLE hr.employee_private (
    company_id uuid NOT NULL,
    employee_id uuid PRIMARY KEY,
    mobile varchar(40),
    address varchar(400),
    email varchar(254),
    emergency_contact varchar(300),
    pay_basis varchar(20) CHECK (pay_basis IN ('HOURLY','ANNUAL_SALARY')),
    pay_rate numeric(14,2) CHECK (pay_rate>=0),
    commission_percent numeric(5,2) CHECK (commission_percent BETWEEN 0 AND 100),
    CHECK ((pay_basis IS NULL)=(pay_rate IS NULL)),
    FOREIGN KEY(company_id,employee_id) REFERENCES hr.employee(company_id,id)
);

CREATE TABLE hr.employee_number (
    company_id uuid PRIMARY KEY REFERENCES identity.company(id),
    last_number bigint NOT NULL CHECK (last_number>0)
);

ALTER TABLE hr.employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employee_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employee_number ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_read ON hr.employee FOR SELECT USING
    (hr.permitted(company_id,'payroll:read') OR
      (created_by=identity.current_actor_id() AND hr.permitted(company_id,'payroll:manage')));
CREATE POLICY employee_create ON hr.employee FOR INSERT WITH CHECK
    (hr.permitted(company_id,'payroll:manage') AND created_by=identity.current_actor_id() AND updated_by=created_by);
CREATE POLICY employee_private_read ON hr.employee_private FOR SELECT USING
    (hr.permitted(company_id,'payroll:read') AND hr.permitted(company_id,'payroll:sensitive:read'));
CREATE POLICY employee_private_create ON hr.employee_private FOR INSERT WITH CHECK
    (hr.permitted(company_id,'payroll:manage') AND EXISTS (SELECT FROM hr.employee e
        WHERE e.company_id=employee_private.company_id AND e.id=employee_private.employee_id
          AND e.created_by=identity.current_actor_id()));
CREATE POLICY employee_number_manage ON hr.employee_number FOR ALL USING
    (hr.permitted(company_id,'payroll:manage')) WITH CHECK (hr.permitted(company_id,'payroll:manage'));

GRANT SELECT,INSERT ON hr.employee,hr.employee_private TO "${runtime_role}";
GRANT SELECT,INSERT,UPDATE ON hr.employee_number TO "${runtime_role}";
