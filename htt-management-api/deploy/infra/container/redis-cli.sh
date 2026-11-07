#!/bin/sh
set -eu
role=$1
shift
case "$role" in
    admin|app|health) ;;
    *) exit 2 ;;
esac
REDISCLI_AUTH=$(cat "/run/secrets/redis-${role}-password")
export REDISCLI_AUTH
if [ "$HTT_INFRA_MODE" = production ]; then
    exec redis-cli --no-auth-warning --user "htt_${role}" --tls \
        --cacert /run/htt-tls-source/ca.crt --cert /run/htt-tls-source/ops-client.crt \
        --key /run/htt-tls-source/ops-client.key --sni "$HTT_TLS_SERVER_NAME" "$@"
fi
exec redis-cli --no-auth-warning --user "htt_${role}" "$@"
