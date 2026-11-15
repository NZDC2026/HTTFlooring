-- One identity for every customer company/contact; existing tables are typed detail extensions.
CREATE TABLE crm.customer_subject (
 id uuid PRIMARY KEY, company_id uuid NOT NULL REFERENCES identity.company(id),
 business_id varchar(100) NOT NULL UNIQUE,
 subject_type varchar(16) NOT NULL CHECK(subject_type IN ('COMPANY','CONTACT')),
 parent_customer_id uuid,
 parent_type varchar(16) GENERATED ALWAYS AS (CASE WHEN subject_type='CONTACT' THEN 'COMPANY'::varchar END) STORED,
 root_customer_id uuid GENERATED ALWAYS AS (coalesce(parent_customer_id,id)) STORED,
 CHECK((subject_type='COMPANY' AND parent_customer_id IS NULL) OR (subject_type='CONTACT' AND parent_customer_id IS NOT NULL AND parent_customer_id<>id)),
 UNIQUE(company_id,id), UNIQUE(company_id,id,subject_type), UNIQUE(company_id,id,root_customer_id,subject_type),
 FOREIGN KEY(company_id,parent_customer_id,parent_type) REFERENCES crm.customer_subject(company_id,id,subject_type)
);
CREATE INDEX customer_subject_parent ON crm.customer_subject(company_id,parent_customer_id);
INSERT INTO crm.customer_subject(id,company_id,business_id,subject_type)
 SELECT id,company_id,business_id,'COMPANY' FROM crm.customer;
INSERT INTO crm.customer_subject(id,company_id,business_id,subject_type,parent_customer_id)
 SELECT id,company_id,business_id,'CONTACT',customer_id FROM crm.customer_contact;

CREATE FUNCTION crm.protect_customer_subject_owner() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.id<>OLD.id OR NEW.company_id<>OLD.company_id OR NEW.subject_type<>OLD.subject_type
 OR NEW.parent_customer_id IS DISTINCT FROM OLD.parent_customer_id THEN
 RAISE EXCEPTION 'Customer subject ownership is immutable' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_subject_owner BEFORE UPDATE ON crm.customer_subject FOR EACH ROW EXECUTE FUNCTION crm.protect_customer_subject_owner();

CREATE FUNCTION crm.maintain_customer_subject() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE kind text; parent uuid;
BEGIN
 IF TG_OP='DELETE' THEN
  DELETE FROM crm.customer_subject WHERE id=OLD.id AND company_id=OLD.company_id;
  RETURN OLD;
 END IF;
 kind:=CASE WHEN TG_TABLE_NAME='customer' THEN 'COMPANY' ELSE 'CONTACT' END;
 IF kind='CONTACT' THEN parent:=NEW.customer_id; END IF;
 IF TG_OP='UPDATE' AND (NEW.id<>OLD.id OR NEW.company_id<>OLD.company_id) THEN
  RAISE EXCEPTION 'Customer ownership is immutable' USING ERRCODE='23514'; END IF;
 INSERT INTO crm.customer_subject AS s(id,company_id,business_id,subject_type,parent_customer_id)
 VALUES(NEW.id,NEW.company_id,NEW.business_id,kind,parent)
 ON CONFLICT(id) DO UPDATE SET business_id=excluded.business_id
 WHERE s.company_id=excluded.company_id AND s.subject_type=excluded.subject_type
 AND s.parent_customer_id IS NOT DISTINCT FROM excluded.parent_customer_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Customer subject mismatch' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER customer_subject_extension AFTER INSERT OR UPDATE OR DELETE ON crm.customer
 FOR EACH ROW EXECUTE FUNCTION crm.maintain_customer_subject();
CREATE TRIGGER contact_subject_extension AFTER INSERT OR UPDATE OR DELETE ON crm.customer_contact
 FOR EACH ROW EXECUTE FUNCTION crm.maintain_customer_subject();
ALTER TABLE crm.customer ADD CONSTRAINT customer_subject_extension_fk FOREIGN KEY(company_id,id)
 REFERENCES crm.customer_subject(company_id,id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE crm.customer_contact ADD CONSTRAINT contact_subject_extension_fk FOREIGN KEY(company_id,id)
 REFERENCES crm.customer_subject(company_id,id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE identity.customer_account
 ADD COLUMN customer_subject_id uuid GENERATED ALWAYS AS (coalesce(contact_id,customer_id)) STORED,
 ADD COLUMN customer_subject_type varchar(16) GENERATED ALWAYS AS (CASE WHEN account_type='CUSTOMER' THEN 'COMPANY'::varchar ELSE 'CONTACT'::varchar END) STORED,
 ADD CONSTRAINT account_subject_owner FOREIGN KEY(company_id,customer_subject_id,customer_id,customer_subject_type)
 REFERENCES crm.customer_subject(company_id,id,root_customer_id,subject_type);
CREATE UNIQUE INDEX customer_subject_account ON identity.customer_account(customer_subject_id);

CREATE OR REPLACE FUNCTION identity.current_customer_account(actor uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',a.business_id,'customerId',c.business_id,'contactId',contact.business_id,'accountType',a.account_type,
 'loginName',a.login_name,'status',a.status,'version',a.version,'subject',a.subject,'customerSubjectId',s.business_id)
 FROM identity.customer_account a JOIN crm.customer c ON c.company_id=a.company_id AND c.id=a.customer_id
 JOIN crm.customer_subject s ON s.company_id=a.company_id AND s.id=a.customer_subject_id
 LEFT JOIN crm.customer_contact contact ON contact.company_id=a.company_id AND contact.customer_id=a.customer_id AND contact.id=a.contact_id
 JOIN identity.user_account u ON u.id=a.actor_id AND u.status='ACTIVE'
 WHERE a.actor_id=actor AND a.status='ACTIVE' AND a.sync_status='READY'
$$;
ALTER TABLE crm.customer_subject ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON crm.customer_subject USING(identity.has_company_access(company_id));
REVOKE ALL ON crm.customer_subject FROM PUBLIC,"${runtime_role}";
GRANT SELECT ON crm.customer_subject TO "${runtime_role}";
REVOKE ALL ON FUNCTION crm.protect_customer_subject_owner(),crm.maintain_customer_subject() FROM PUBLIC;
