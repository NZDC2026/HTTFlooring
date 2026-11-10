CREATE TABLE core.settings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 key text NOT NULL, value jsonb NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,key)
);
CREATE TABLE catalog.product_categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 code text NOT NULL, name text NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,code)
);
ALTER TABLE catalog.products ADD COLUMN category_id uuid;
ALTER TABLE catalog.products ADD CONSTRAINT product_category FOREIGN KEY(company_id,category_id) REFERENCES catalog.product_categories(company_id,id);
CREATE INDEX ON catalog.products(company_id,category_id);
CREATE TABLE catalog.product_media (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 product_id uuid NOT NULL, file_id uuid NOT NULL, sort_order int NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT false,
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id), UNIQUE(company_id,product_id,file_id),
 FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id),
 FOREIGN KEY(company_id,file_id) REFERENCES platform.files(company_id,id)
);
CREATE INDEX ON catalog.product_media(company_id,file_id);
CREATE TABLE platform.approval_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 document_id uuid NOT NULL, document_version bigint NOT NULL CHECK(document_version>0),
 requested_by uuid NOT NULL REFERENCES identity.users(id), reason text NOT NULL,
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','APPROVED','REJECTED','CANCELLED','STALE')),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES identity.users(id), UNIQUE(company_id,id),
 FOREIGN KEY(company_id,document_id) REFERENCES platform.documents(company_id,id)
);
CREATE UNIQUE INDEX one_pending_approval ON platform.approval_requests(company_id,document_id,document_version) WHERE state='PENDING';
CREATE TABLE platform.approval_actions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES core.companies(id),
 request_id uuid NOT NULL, actor_id uuid NOT NULL REFERENCES identity.users(id),
 action text NOT NULL CHECK(action IN ('APPROVE','REJECT','CANCEL')), reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,id),
 FOREIGN KEY(company_id,request_id) REFERENCES platform.approval_requests(company_id,id)
);
CREATE INDEX ON platform.approval_actions(company_id,request_id);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['core.settings','catalog.product_categories','catalog.product_media','platform.approval_requests','platform.approval_actions'] LOOP
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY company_scope ON %s USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',t);
  EXECUTE format('CREATE INDEX ON %s(company_id)',t);
  IF t<>'platform.approval_actions' THEN
   EXECUTE format('CREATE TRIGGER touch_version BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION core.touch_version()',t);
  END IF;
 END LOOP;
END $$;
CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON platform.approval_actions FOR EACH ROW EXECUTE FUNCTION platform.reject_mutation();
GRANT SELECT ON core.settings,catalog.product_categories,catalog.product_media TO htt_app;
-- No approval command grants yet: Stage B implements the version-bound office approval workflow.

CREATE FUNCTION accounting.validate_period_year() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM accounting.fiscal_years y WHERE y.company_id=NEW.company_id AND y.id=NEW.fiscal_year_id
 AND y.starts_on<=NEW.starts_on AND y.ends_on>=NEW.ends_on) THEN
  RAISE EXCEPTION 'Accounting period is outside its fiscal year' USING ERRCODE='23514';
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER period_year_bounds BEFORE INSERT OR UPDATE ON accounting.periods FOR EACH ROW EXECUTE FUNCTION accounting.validate_period_year();
REVOKE ALL ON FUNCTION accounting.validate_period_year() FROM PUBLIC;
