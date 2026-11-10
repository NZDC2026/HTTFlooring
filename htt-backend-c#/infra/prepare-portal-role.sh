#!/bin/sh
# Existing installations: run as the PostgreSQL role administrator BEFORE migration 018.
# Supply normal libpq PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSWORD plus HTT_PORTAL_PASSWORD.
set -eu
: "${HTT_PORTAL_PASSWORD:?Set a dedicated portal login password}"
psql --set=ON_ERROR_STOP=1 --set=portal_password="$HTT_PORTAL_PASSWORD" <<'SQL'
SELECT 'CREATE ROLE htt_portal LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS'
 WHERE NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='htt_portal') \gexec
ALTER ROLE htt_portal LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
SELECT format('ALTER ROLE htt_portal PASSWORD %L', :'portal_password') \gexec
SQL
