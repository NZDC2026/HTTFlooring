#!/bin/sh
set -eu
: "${HTT_TEST_OWNER_CONNECTION:?Use an isolated database whose name contains test}"
: "${HTT_TEST_APP_CONNECTION:?Use restricted htt_app login}"
: "${HTT_TEST_WORKER_CONNECTION:?Use restricted htt_worker login}"
: "${HTT_TEST_PORTAL_CONNECTION:?Use restricted htt_portal login}"
cd "$(dirname "$0")/.."
dotnet restore Htt.Backend.sln --locked-mode -m:1 -p:UseSharedCompilation=false
dotnet build Htt.Backend.sln -c Release --no-restore --disable-build-servers -m:1 -p:UseSharedCompilation=false
python3 scripts/verify-batches.py "$@"
