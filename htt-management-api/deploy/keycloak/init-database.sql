-- Runs only inside the new dedicated identity container, on its first initialization.
DO $$
BEGIN
    IF current_database() <> 'htt_keycloak' THEN RAISE EXCEPTION 'Wrong database'; END IF;
    EXECUTE format('CREATE ROLE htt_keycloak LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L',
        btrim(pg_read_file('/run/secrets/db_password'), E'\r\n '));
END
$$;
ALTER DATABASE htt_keycloak OWNER TO htt_keycloak;
REVOKE ALL ON DATABASE htt_keycloak FROM PUBLIC;
GRANT CONNECT ON DATABASE htt_keycloak TO htt_keycloak;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO htt_keycloak;
