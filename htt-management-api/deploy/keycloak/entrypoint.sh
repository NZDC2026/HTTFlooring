#!/bin/bash
set -euo pipefail

fail() { printf '%s\n' "$1" >&2; exit 1; }
[[ "${KC_HOSTNAME:-}" == https://* ]] || fail 'A fixed HTTPS hostname is required.'
case "${KC_DB_URL:-}" in
  jdbc:postgresql://*/htt_keycloak|jdbc:postgresql://*/htt_keycloak\?*) ;;
  *) fail 'Only the dedicated htt_keycloak database is permitted.' ;;
esac
if [[ "${HTT_KEYCLOAK_DEVELOPMENT:-false}" == true ]]; then
  [[ "$KC_DB_URL" == 'jdbc:postgresql://keycloak-db:5432/htt_keycloak?sslmode=disable' ]] || fail 'Development DB must be the private dedicated container.'
else
  [[ "$KC_DB_URL" == *sslmode=verify-full* ]] || fail 'Verified PostgreSQL TLS is required.'
fi
[[ "${KC_DB_USERNAME:-}" != postgres && -n "${KC_DB_USERNAME:-}" ]] || fail 'Use a dedicated database account.'
required_secrets=(db_password bootstrap_password https_cert https_key)
if [[ "${HTT_KEYCLOAK_DEVELOPMENT:-false}" != true ]]; then required_secrets+=(pg_root_cert); fi
for secret in "${required_secrets[@]}"; do
  [[ -r "/run/secrets/$secret" && -s "/run/secrets/$secret" ]] || fail 'A required secret file is unreadable or empty.'
done
KC_DB_PASSWORD=$(</run/secrets/db_password)
KC_BOOTSTRAP_ADMIN_PASSWORD=$(</run/secrets/bootstrap_password)
[[ -n "$KC_DB_PASSWORD" && -n "$KC_BOOTSTRAP_ADMIN_PASSWORD" ]] || fail 'Secret values must not be empty.'
export KC_DB_PASSWORD KC_BOOTSTRAP_ADMIN_PASSWORD
exec /opt/keycloak/bin/kc.sh "$@"
