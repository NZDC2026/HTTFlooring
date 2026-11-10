-- Bank directory identities are the existing BANK GL account IDs; old cash documents retain their account FK.
CREATE TABLE accounting.bank_accounts(
 id uuid PRIMARY KEY,company_id uuid NOT NULL REFERENCES core.companies(id),name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 200),
 kind text NOT NULL CHECK(kind IN('LEGACY','BANK','CASH','CARD_CLEARING')),currency char(3) NOT NULL DEFAULT 'AUD' CHECK(currency='AUD'),
 bsb text,account_number text,account_holder text,active boolean NOT NULL DEFAULT true,
 version bigint NOT NULL DEFAULT 1,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),created_by uuid REFERENCES identity.users(id),
 UNIQUE(company_id,id),FOREIGN KEY(company_id,id) REFERENCES accounting.accounts(company_id,id),
 CHECK((kind='BANK' AND bsb~'^[0-9]{6}$' AND account_number~'^[0-9]{1,20}$' AND length(btrim(account_holder)) BETWEEN 1 AND 200 AND bsb IS NOT NULL AND account_number IS NOT NULL AND account_holder IS NOT NULL) OR(kind<>'BANK' AND bsb IS NULL AND account_number IS NULL AND account_holder IS NULL)));
ALTER TABLE accounting.bank_accounts ENABLE ROW LEVEL SECURITY;ALTER TABLE accounting.bank_accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY company_scope ON accounting.bank_accounts USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company());
CREATE UNIQUE INDEX bank_identity_unique ON accounting.bank_accounts(company_id,bsb,account_number) WHERE kind='BANK';
CREATE TRIGGER touch_version BEFORE UPDATE ON accounting.bank_accounts FOR EACH ROW EXECUTE FUNCTION core.touch_version();
INSERT INTO identity.permissions(code,description) VALUES('accounting.banks.read','Read bank directory and balances'),('accounting.banks.write','Maintain bank directory and default'),('accounting.banks.use','Select an active cash account'),('accounting.ledger.read','Read immutable GL, journals and trial balance');
CREATE FUNCTION identity.seed_bank_ledger_roles(c uuid) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND ((r.code IN('ADMIN','FINANCE') AND p.code IN('accounting.banks.read','accounting.banks.write','accounting.banks.use','accounting.ledger.read')) OR(r.code='OFFICE' AND p.code='accounting.banks.use')) ON CONFLICT DO NOTHING;
END $$;
CREATE FUNCTION accounting.sync_bank_directory() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 IF NEW.kind='ASSET' AND NEW.control_kind='BANK' THEN INSERT INTO accounting.bank_accounts(id,company_id,name,kind,created_by) VALUES(NEW.id,NEW.company_id,NEW.name,'LEGACY',core.current_actor()) ON CONFLICT DO NOTHING;
 ELSIF EXISTS(SELECT 1 FROM accounting.bank_accounts WHERE company_id=NEW.company_id AND id=NEW.id) THEN RAISE EXCEPTION 'Bank account GL classification is permanent' USING ERRCODE='HR409';END IF;RETURN NULL;END $$;
CREATE TRIGGER synchronize_bank_directory AFTER INSERT OR UPDATE ON accounting.accounts FOR EACH ROW EXECUTE FUNCTION accounting.sync_bank_directory();
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_bank_ledger_roles(c);INSERT INTO accounting.bank_accounts(id,company_id,name,kind) SELECT id,c,name,'LEGACY' FROM accounting.accounts WHERE company_id=c AND kind='ASSET' AND control_kind='BANK' ON CONFLICT DO NOTHING;END LOOP;PERFORM set_config('htt.company_id','',true);END $$;
CREATE FUNCTION accounting.configure_bank(bank uuid,expected bigint,p_code text,p_name text,p_kind text,p_bsb text,p_number text,p_holder text,p_active boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();b accounting.bank_accounts;chosen uuid:=bank;BEGIN
 PERFORM purchase.require_access('accounting.banks.write');
 IF p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 200 OR p_kind IS NULL OR p_kind NOT IN('BANK','CASH','CARD_CLEARING','LEGACY') OR p_active IS NULL OR (p_kind='BANK' AND(p_bsb IS NULL OR p_bsb!~'^[0-9]{6}$' OR p_number IS NULL OR p_number!~'^[0-9]{1,20}$' OR p_holder IS NULL OR length(btrim(p_holder)) NOT BETWEEN 1 AND 200)) OR(p_kind<>'BANK' AND num_nonnulls(p_bsb,p_number,p_holder)<>0) THEN RAISE EXCEPTION 'Invalid AUD cash-account identity' USING ERRCODE='HR422';END IF;
 IF bank IS NULL THEN
 IF p_kind='LEGACY' OR expected IS NOT NULL OR p_code IS NULL OR p_code!~'^[A-Z0-9][A-Z0-9_-]{0,39}$' THEN RAISE EXCEPTION 'Valid new GL code required' USING ERRCODE='HR422';END IF;
 chosen:=gen_random_uuid();INSERT INTO accounting.accounts(id,company_id,code,name,kind,control_kind,created_by) VALUES(chosen,c,p_code,btrim(p_name),'ASSET','BANK',core.current_actor());
 ELSE
 SELECT * INTO b FROM accounting.bank_accounts WHERE company_id=c AND id=bank FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Cash account unavailable' USING ERRCODE='HT404';END IF;
 IF p_code IS DISTINCT FROM(SELECT code FROM accounting.accounts WHERE company_id=c AND id=bank) THEN RAISE EXCEPTION 'GL code cannot be changed through bank maintenance' USING ERRCODE='HR409';END IF;
 IF expected IS NULL OR expected<>b.version THEN RAISE EXCEPTION 'Cash account changed' USING ERRCODE='HR409';END IF;
 IF b.kind<>'LEGACY' AND (b.kind,b.bsb,b.account_number) IS DISTINCT FROM(p_kind,p_bsb,p_number) THEN RAISE EXCEPTION 'Financial identity is immutable; create a new account' USING ERRCODE='HR409';END IF;
 END IF;
 UPDATE accounting.bank_accounts SET name=btrim(p_name),kind=p_kind,bsb=p_bsb,account_number=p_number,account_holder=p_holder,active=p_active WHERE company_id=c AND id=chosen;RETURN chosen;END $$;
CREATE FUNCTION accounting.resolve_bank(bank uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ DECLARE chosen uuid;BEGIN
 PERFORM purchase.require_access('accounting.banks.use');
 SELECT b.id INTO chosen FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id WHERE b.company_id=core.current_company() AND b.id=bank AND b.active AND a.active AND a.kind='ASSET' AND a.control_kind='BANK' FOR SHARE OF b,a;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active company cash account required' USING ERRCODE='HR422';END IF;RETURN chosen;END $$;
-- Default selection holds directory and mapping locks; existing default callers also validate directory activity.
CREATE OR REPLACE FUNCTION accounting.settlement_account(p_purpose text,p_kind text,p_control text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SET search_path=pg_catalog AS $$ DECLARE v uuid;BEGIN
 SELECT m.account_id INTO v FROM accounting.account_mappings m JOIN accounting.accounts a ON a.company_id=m.company_id AND a.id=m.account_id AND a.active AND a.kind=p_kind AND(p_control IS NULL OR a.control_kind=p_control) WHERE m.company_id=core.current_company() AND m.purpose=p_purpose FOR SHARE OF m,a;
 IF NOT FOUND THEN RAISE EXCEPTION 'Settlement account mapping missing or invalid: %',p_purpose USING ERRCODE='HR422';END IF;
 IF p_purpose='BANK' THEN PERFORM 1 FROM accounting.bank_accounts WHERE company_id=core.current_company() AND id=v AND active FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Default cash account inactive' USING ERRCODE='HR422';END IF;END IF;RETURN v;END $$;
CREATE FUNCTION accounting.set_default_bank(bank uuid,expected bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 PERFORM purchase.require_access('accounting.banks.write');PERFORM 1 FROM accounting.bank_accounts b JOIN accounting.accounts a ON a.company_id=b.company_id AND a.id=b.id WHERE b.company_id=core.current_company() AND b.id=bank AND b.active AND a.active FOR SHARE OF b,a;IF NOT FOUND THEN RAISE EXCEPTION 'Active cash account required' USING ERRCODE='HR422';END IF;
 PERFORM 1 FROM accounting.account_mappings WHERE company_id=core.current_company() AND purpose='BANK' AND version=expected FOR UPDATE;IF NOT FOUND OR expected IS NULL THEN RAISE EXCEPTION 'Default mapping changed' USING ERRCODE='HR409';END IF;
 UPDATE accounting.account_mappings SET account_id=bank WHERE company_id=core.current_company() AND purpose='BANK';END $$;
CREATE FUNCTION accounting.post_receipt_to_bank(cust uuid,amount numeric,method text,reference text,on_date date,items jsonb,advances jsonb,bank uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN accounting.post_receipt_core(cust,amount,method,reference,on_date,items,advances,accounting.resolve_bank(bank));END $$;
CREATE FUNCTION purchase.post_supplier_payment_to_bank(supplier uuid,amount numeric,advance numeric,method text,reference text,on_date date,notes text,items jsonb,bank uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN purchase.post_supplier_payment_core(supplier,amount,advance,method,reference,on_date,notes,items,accounting.resolve_bank(bank));END $$;
CREATE FUNCTION accounting.post_customer_refund_to_bank(credit uuid,advance uuid,amount numeric,reference text,reason text,cancel_order boolean,bank uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN accounting.post_customer_refund_core(credit,advance,amount,reference,reason,cancel_order,accounting.resolve_bank(bank));END $$;
CREATE FUNCTION purchase.receive_supplier_refund_to_bank(credit uuid,advance uuid,amount numeric,reference text,reason text,on_date date,bank uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN RETURN purchase.receive_supplier_refund_core(credit,advance,amount,reference,reason,on_date,accounting.resolve_bank(bank));END $$;
GRANT SELECT ON accounting.bank_accounts TO htt_app;
REVOKE ALL ON FUNCTION identity.seed_bank_ledger_roles(uuid),accounting.sync_bank_directory(),accounting.configure_bank(uuid,bigint,text,text,text,text,text,text,boolean),accounting.resolve_bank(uuid),accounting.set_default_bank(uuid,bigint),accounting.post_receipt_to_bank(uuid,numeric,text,text,date,jsonb,jsonb,uuid),purchase.post_supplier_payment_to_bank(uuid,numeric,numeric,text,text,date,text,jsonb,uuid),accounting.post_customer_refund_to_bank(uuid,uuid,numeric,text,text,boolean,uuid),purchase.receive_supplier_refund_to_bank(uuid,uuid,numeric,text,text,date,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accounting.configure_bank(uuid,bigint,text,text,text,text,text,text,boolean),accounting.set_default_bank(uuid,bigint),accounting.post_receipt_to_bank(uuid,numeric,text,text,date,jsonb,jsonb,uuid),purchase.post_supplier_payment_to_bank(uuid,numeric,numeric,text,text,date,text,jsonb,uuid),accounting.post_customer_refund_to_bank(uuid,uuid,numeric,text,text,boolean,uuid),purchase.receive_supplier_refund_to_bank(uuid,uuid,numeric,text,text,date,uuid) TO htt_app;
CREATE INDEX ON accounting.journal_entries(company_id,posting_date,id);
CREATE INDEX ON accounting.journal_lines(company_id,account_id,journal_entry_id,id);
