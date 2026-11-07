-- Run as the dedicated migration owner in a newly provisioned HTT database.
-- Database/roles and passwords are provisioned separately by the environment's DBA/secret manager.
BEGIN;
DO $$
BEGIN
    IF current_user = 'postgres' OR EXISTS (SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolsuper) THEN
        RAISE EXCEPTION 'Use the dedicated non-superuser migration owner';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='platform'
               AND nspowner<>(SELECT oid FROM pg_roles WHERE rolname=current_user)) THEN
        RAISE EXCEPTION 'Existing platform schema has another owner';
    END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS platform AUTHORIZATION CURRENT_USER;
REVOKE ALL ON SCHEMA platform FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
COMMIT;
