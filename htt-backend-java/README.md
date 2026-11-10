# HTT Java backend

Acceptance results and rollback procedures: [迁移验收与回滚记录](docs/migration-acceptance-and-rollback.md).

Java 21 / Spring Boot implementation. Business operations retain the original PostgreSQL functions and restricted `htt_app`, `htt_portal`, and `htt_worker` logins. Migrations run explicitly as `htt_owner`; API and worker startup never run them.

## Build and CI

```sh
mvn --batch-mode verify
python3 tests/stage4/migrations.py
docker build --target api -t htt-java-stage4-api:local .
docker build --target worker -t htt-java-stage4-worker:local .
docker build --target migrations -t htt-java-stage4-migrations:local .
```

Set `JAVA_HOME` to JDK 21 and put Docker on PATH (or set `DOCKER`). The Java GitHub workflow executes these checks without publishing images or deploying. Its commands were verified locally; remote CI is not triggered by the migration acceptance process.

## Separate processes

`java -jar target/htt-backend-java-0.1.0-SNAPSHOT.jar` starts the API. `HTT_PROCESS_MODE=worker` starts only background executors; `HTT_PROCESS_MODE=migrate` runs migrations and exits. The worker uses `HTT_WORKER_DATABASE_URL` and `HTT_WORKER_DATABASE_PASSWORD`, always as `htt_worker`. The migration process uses `HTT_MIGRATION_DATABASE_URL` and `HTT_MIGRATION_DATABASE_PASSWORD`, always as `htt_owner`. All JDBC URLs are PostgreSQL URLs without query parameters.

Background executors cover document PDF/CSV/scan/email jobs, outbox diagnostics, recurring drafts, reminders, OCR, geocoding, push, and optional bank feeds. Claim/load/finish calls retain the original lease fences, access rechecks, retry limits and durable outcomes. Outbox consumption remains the legacy diagnostic sink. Recurring drafts still require the original independent approval; workers do not auto-approve financial entries. Worker shutdown stops new claims and allows up to 45 seconds for bounded in-flight completion.

PDF rendering reuses the original two Python templates byte-for-byte. The container pins ReportLab and its dependencies in `infra/pdf-requirements.txt`; older distribution ReportLab versions cannot render report packs. The worker uses a private temporary directory per render, disables bytecode caching, bounds process time and output, and removes the directory. CSV preserves native metadata escaping and decimal scale and protects text cells from spreadsheet formulas; a byte-exact native exporter oracle is committed under test resources.

Provider configuration is worker-only. Empty credentials fail durably without contacting providers; bank feeds default to disabled. Configured OCR/bank gateway endpoints require HTTPS, and redirects are never followed. Timeouts after potentially mutating sends retain `UNKNOWN` where the original worker does. Provider transport tests inject synthetic responses; deployment tests use an internal-only network.

## Isolated acceptance

The comprehensive API harness and focused batches are documented in `tests/compatibility/README.md`. Upload-only regression can be run with `--uploads-only --stalled-uploads`; its marker is `UPLOAD_PASSED`, not whole-suite `PASSED`.

Stage 4 scripts require an explicitly recorded **synthetic** PostgreSQL dump from an accepted full API run:

```sh
export HTT_SYNTHETIC_SNAPSHOT=/absolute/path/to/post-http.synthetic.pgdump
export HTT_PYTHON=/absolute/path/to/pdf-test-venv/bin/python3
export HTT_PDF_TEST_PYTHON="$HTT_PYTHON"
python3 tests/stage4/documents.py
python3 tests/stage4/deployment.py
```

Create the test virtual environment with `infra/stage4-test-requirements.txt`. The deployment runner also expects the local legacy acceptance image `htt-java-baseline-tests:latest` containing the original published API and migrations under `/output`, plus Python. It creates and removes only its own uniquely named test containers/network/volumes. The image is built from an isolated copy of the unchanged original backend, as in stage 0, not from live system configuration. No secrets or live database endpoints belong in these commands.

## Deployment and rollback paths

`compose.yaml` defines a separate Java stack and volume, with loopback bindings and required database passwords. Staff and portal authorities/audiences/modes and provider configuration are supplied externally. Java API, worker and migration targets are separate, unprivileged runtime images. `migrate` must complete before API/worker start. Port defaults differ from the legacy stack; no existing stack is switched by building or validating this project.

Original migrations 001–055 are unchanged copies. Their history names/checksums match .NET, so Java adds only 056 to a fully migrated legacy database; the acceptance runner checks this and a second no-op migration run. Migration 056 grants only `UPDATE(id)` on append-only `sales.order_lines` for row locks. Actual data updates remain rejected by the original trigger. For a controlled rollback, stop new shortage writes and Java workers, retain a database backup, restore the legacy API/worker configuration, and revoke only that extra column privilege if desired:

```sql
REVOKE UPDATE(id) ON sales.order_lines FROM htt_app;
```

No schema/data rollback is needed for 001–055. The acceptance runner verifies .NET startup against the same synthetic database, queue preservation, privilege revoke/regrant, and Java restart, without overlapping writers. PostgreSQL restores of the full schema use `max_locks_per_transaction=256`; preserve migration history in real backups. The synthetic runner separately tests cold migrations and legacy upgrades before replacing its own disposable database with its synthetic snapshot.

The preserved legacy directory is the literal `htt-backend-c#` after all acceptance gates. Quote this path in shell commands, for example `cd '../htt-backend-c#'`. Compatibility runners discover both the original and final literal directory names. Archived acceptance manifests retain their historical paths and hashes.
