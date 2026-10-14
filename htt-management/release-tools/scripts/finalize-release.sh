#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../" 2>/dev/null || true
# Run from project root with: bash release-tools/scripts/finalize-release.sh
if [[ ! -f package.json || ! -f electron-builder.yml ]]; then
  echo 'ERROR: run from htt-management project root (package.json and electron-builder.yml required).' >&2
  exit 1
fi
VERSION="$(node -p 'require("./package.json").version')"
if [[ "$VERSION" != '1.0.0' ]]; then
  echo "ERROR: package.json version is $VERSION, expected 1.0.0. Set it explicitly before release." >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'ERROR: git working tree is not clean. Commit changes before finalizing.' >&2
  exit 1
fi
if git rev-parse -q --verify refs/tags/v1.0.0 >/dev/null; then
  echo 'ERROR: tag v1.0.0 already exists. Do not overwrite a release tag.' >&2
  exit 1
fi
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm dist:mac
shopt -s nullglob
artifacts=(release/*.dmg)
if (( ${#artifacts[@]} == 0 )); then
  echo 'ERROR: no DMG produced in release/.' >&2
  exit 1
fi
mkdir -p release/v1.0.0
for artifact in "${artifacts[@]}"; do
  cp "$artifact" release/v1.0.0/
done
(cd release/v1.0.0 && shasum -a 256 ./*.dmg > SHA256SUMS.txt)
printf 'Version: %s\nGit commit: %s\nDate (UTC): %s\nSigning: unsigned internal demo\nBackend: Mock Data (no live API)\n' "$VERSION" "$(git rev-parse HEAD)" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > release/v1.0.0/RELEASE-MANIFEST.txt
echo 'PASS: DMG artifacts and SHA256SUMS saved in release/v1.0.0/'
echo 'Next: install-test the new DMG; only then create git tag v1.0.0.'
