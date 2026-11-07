#!/bin/sh
set -eu
if [ "$HTT_INFRA_MODE" = production ]; then
    mkdir -p /run/htt-tls
    cp /run/htt-tls-source/ca.crt /run/htt-tls/ca.crt
    cp /run/htt-tls-source/redis.crt /run/htt-tls/server.crt
    cp /run/htt-tls-source/redis.key /run/htt-tls/server.key
    chown -R redis:redis /run/htt-tls
    chmod 750 /run/htt-tls
    chmod 640 /run/htt-tls/server.key
fi
exec /usr/local/bin/docker-entrypoint.sh redis-server /etc/redis/redis.conf
