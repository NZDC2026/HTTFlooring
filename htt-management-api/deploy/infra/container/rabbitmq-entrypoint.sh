#!/bin/sh
set -eu
export RABBITMQ_DEFAULT_USER=htt_ops
export RABBITMQ_DEFAULT_VHOST=htt-notifications
RABBITMQ_DEFAULT_PASS=$(cat /run/secrets/rabbitmq-admin-password)
export RABBITMQ_DEFAULT_PASS
if [ "$HTT_INFRA_MODE" = production ]; then
    mkdir -p /run/htt-tls
    cp /run/htt-tls-source/ca.crt /run/htt-tls/ca.crt
    cp /run/htt-tls-source/rabbitmq.crt /run/htt-tls/server.crt
    cp /run/htt-tls-source/rabbitmq.key /run/htt-tls/server.key
    chown -R rabbitmq:rabbitmq /run/htt-tls
    chmod 750 /run/htt-tls
    chmod 640 /run/htt-tls/server.key
fi
exec /usr/local/bin/docker-entrypoint.sh rabbitmq-server
