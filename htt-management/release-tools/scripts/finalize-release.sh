#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Requires an explicit v<package version> tag, clean tree and native signing credentials.
# Produces verified artifacts only; never creates tags or publishes automatically.
node scripts/release-signed.mjs
