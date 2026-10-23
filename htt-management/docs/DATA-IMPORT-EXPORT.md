> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Master-data CSV import and export — 2026-10-19

The Data import & export page now uses the local main-process repositories, persistence and audit host. It supports Customers, Suppliers, Customer branches, Customer contacts and Products. This phase does not import invoices, payments, journals, stock quantities or opening balances; their existing dedicated workflows remain authoritative. CSV is supported; XLSX is not.

## Workflow

1. Choose a dataset and Create or Update by ID. Download a create template or export current master records.
2. Load UTF-8 CSV, map the source columns and validate. Preview shows each row's proposed action, resolved fields and errors. Unmapped columns are reported; unmapped business fields use create defaults or preserve existing values on updates. Explicit mapped blanks clear optional strings, but fail where a valid number, boolean or required value is necessary.
3. Resolve every error, enter a reason, acknowledge the preview and commit the entire batch. Any failed row prevents the batch; a failure during commit restores all repositories and receipts through the existing atomic business host.
4. Review persistent history, before/after values, created IDs and the result CSV. Primary branch/contact changes also retain affected parent membership and primary-pointer snapshots.

Files are limited to 1 MB of UTF-8 bytes, 500 data rows, 64 unique non-empty columns and 100,000 characters per cell. Export includes all current records and may exceed import limits: split a large export into batches, preserving headers. The parser supports quoted commas, escaped quotes, multiline text, CRLF and a UTF-8 BOM; malformed widths, quotes and null bytes are rejected.

## Identity and updates

Create requires a stable externalId per dataset. Repeating the same mapped input skips its existing record rather than creating another; changed mapped input with that externalId is rejected. A skip preserves later manual/ID updates. ID updates require the current exported id and recordToken. External source IDs cannot be reassigned. The main process validates tokens against the pre-batch state, rejects concurrent master changes since preview and uses canonical SHA-256 values so object key order does not create false conflicts. The operation ID also permits safe retry of a committed request.

Duplicate names/contact identifiers are checked through existing master rules. Unrelated updates to previously accepted duplicates remain possible; newly introduced matches must be resolved. Child records require an existing non-inactive parent and cannot move between customers. Product updates preserve unit IDs, support repeated unit codes through those IDs and enforce existing restrictions on referenced units, base units, stock/service configuration and tax codes. In unitsJson, keep exported IDs for existing units; an explicit empty ID creates a new unit. Create assigns fresh unit IDs. An empty mapped product taxCode removes its optional override.

Exports tag their protocol as _format=HTT-CSV-1, include record tokens and escape formula-looking or leading-apostrophe cells for spreadsheet use. Keep the format tag when returning an exported file; the tagged parser reverses exactly one escape. Untrusted CSV never executes formulas. Exported identity columns are for Update by ID, not Create.

## Access, storage and recovery

The page requires inventory.read. Dataset reads also require sales.read, purchases.read or inventory.read. Writes additionally require contacts.write for customer/supplier/child records or inventory.adjust for products. The main process enforces these rules independently of UI controls; history is filtered by dataset read access. Preview restores its simulated state and writes no business records. Financial repositories remain unchanged.

Schema 15 adds dataTransfers and migrates schema 14 snapshots while retaining existing repositories. Backup preview/restore validates transfer receipts, row identities, parent snapshots and prior created-record references. Import history is included in normal local backups. No independent backend is used.

## Verification

34 focused tests cover all five datasets, mappings, per-row failures, no-write preview, stale tokens, batch rollback, source and operation retry, existing duplicate updates, Unicode/formula round trips, repeated unit codes, optional product fields, permissions, restart, schema migration, backup rejection and unchanged financial data.

Desktop acceptance uses a disposable Electron profile: invalid email blocked submission; two real customer records were created; all seven customers exported with IDs and tokens; an exported record was updated by ID with a persisted receipt. Final repeat-create acceptance committed 0 created / 0 updated / 2 skipped, preserving the later name and phone update; persisted masters remained at seven customers with three receipts. Final verification in the actual project directory passed TypeScript build, Vite production build and all 93 test files / 1,089 tests. The existing Vite large-chunk advisory remains. The six-role integration test uses a 30-second timeout for real password hashing under full-suite contention.
