#!/bin/sh
# Optional Java probe for the test-only TLS smoke state. Run notification tests once to populate Maven cache.
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test -f "$root/.state/production/.tls-smoke-only"
runner_image=${HTT_TEST_RUNNER_IMAGE:-maven:3.9.11-eclipse-temurin-21}
runner=$(docker image inspect --format '{{index .RepoDigests 0}}' "$runner_image")
port=$(sed -n 's/^RABBITMQ_PORT=//p' "$root/.state/production/.env")
docker run --rm --network host --cpus 1 --memory 512m --entrypoint /bin/sh \
    --mount type=volume,source=htt-notification-it-maven-cache,target=/maven-cache,readonly \
    --mount "type=bind,source=$root/tests/AmqpProbe.java,target=/AmqpProbe.java,readonly" \
    --mount "type=bind,source=$root/.state/production/tls,target=/probe-tls,readonly" \
    --mount "type=bind,source=$root/.state/production/secrets/rabbitmq-app-password,target=/probe-password,readonly" \
    "$runner" -c 'slf4j=$(find /maven-cache/repository/org/slf4j/slf4j-api -name "*.jar" | sort | tail -n 1); netty=$(find /maven-cache/repository/io/netty -name "*.jar" | sort | paste -sd : -); java -Xmx128m --class-path "/maven-cache/repository/com/rabbitmq/amqp-client/5.30.0/amqp-client-5.30.0.jar:$slf4j:$netty" /AmqpProbe.java "$1"' probe "$port"
