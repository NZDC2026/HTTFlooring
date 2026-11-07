#!/bin/sh
# Run only trusted HTT source: mounting the Docker socket gives the runner Docker-level privileges.
set -eu
if [ "$#" -ne 1 ]; then echo "Usage: $0 /absolute/htt-management-api-checkout" >&2; exit 2; fi
workspace=$(realpath "$1")
test -f "$workspace/pom.xml"
test -f "$workspace/src/test-notification/java/com/htt/management/notification/NotificationPipelineIT.java"
if ! grep -q '<artifactId>htt-management-api</artifactId>' "$workspace/pom.xml"; then exit 2; fi
docker info >/dev/null
runner_image=${HTT_TEST_RUNNER_IMAGE:-maven:3.9.11-eclipse-temurin-21}
rabbit_image=${HTT_TEST_RABBIT_IMAGE:-rabbitmq:4.3-management-alpine}
docker pull "$runner_image"
runner_digest=$(docker image inspect --format '{{index .RepoDigests 0}}' "$runner_image")
docker volume create --label com.htt.managed-by=htt-management-api htt-notification-it-maven-cache >/dev/null
chmod +x "$workspace/mvnw"
docker run --rm --init --network host --cpus 2 --memory 2g --pids-limit 512 \
    --name "htt-notification-it-runner-$$" \
    --label com.htt.managed-by=htt-management-api \
    -e DOCKER_HOST=unix:///var/run/docker.sock \
    -e TESTCONTAINERS_HOST_OVERRIDE=127.0.0.1 \
    -e TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
    -e MAVEN_USER_HOME=/maven-cache/wrapper \
    -e MAVEN_OPTS=-Xmx512m \
    -e HTT_TEST_RABBIT_IMAGE="$rabbit_image" \
    --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
    --mount "type=bind,source=$workspace,target=/workspace" \
    --mount type=volume,source=htt-notification-it-maven-cache,target=/maven-cache \
    --workdir /workspace "$runner_digest" \
    sh -c './mvnw -B -ntp -Dmaven.repo.local=/maven-cache/repository "-DargLine=-Xmx768m -Djdk.attach.allowAttachSelf=true" -Pnotification-it "-Dhtt.test.rabbit-image=$HTT_TEST_RABBIT_IMAGE" test-compile failsafe:integration-test failsafe:verify'
