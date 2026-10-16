# 8D — Local business persistence and recovery

Implemented 2026-10-15. No independent backend.

## Delivered

- Main-process snapshots use schema v2, saved-at metadata and SHA-256 integrity checking. Existing v1 databases migrate with a separate pre-migration snapshot. Unknown versions, invalid collection shapes and duplicate record IDs fail closed.
- The existing repository registry atomically persists sales/AR, purchases/AP, GL, banking/reconciliations, contacts/prices, physical stock, cost balances/movements, fulfilments and business recovery records.
- Settings → Local access & audit now provides administrator-only backup/restore through native Electron file dialogs. Renderer-supplied paths are ignored. Exports cannot overwrite files inside the active data directory, including through a parent-directory symlink.
- Restore previews show version, timestamp and repository counts. One-use previews expire after five minutes and are invalidated by intervening business writes or a different acting user. Confirmation replaces business data while retaining current accounts, passwords and security audit history.
- The current file is copied and synced under `local-security/recovery-backups/` before restoration, including exact damaged bytes. Restore uses an audited atomic commit, blocks further business writes and displays a mandatory quit/reopen screen.
- Administrators also have a recovery selector on bootstrap failure. Interrupted commands are resolved against the saved command ID without replay. Pending intents are reconciled before restore replaces that evidence.

## Verification

`npm run build` and `npm test -- --reporter=dot`: 55 test files, 477 tests passed. These npm scripts execute the same build/test tasks as the project's pnpm scripts.

21 new tests cover migration and write failure, corruption, unknown versions, duplicate rows, six unauthorized roles, preview expiry/invalidation, native dialogs, protected paths, preserved accounts/audit, pre-restore backups, corrupt startup, failed audit intent and uncertain restore commits.

A main-process lifecycle test creates a real PO, receipt, supplier bill/payment, quote/order, stock fulfilment, invoice and customer payment. It compares every visible repository and recovery-storage entry after restart and after backup restore, then rejects a duplicate payment operation. Existing storage/audit fault tests remain passing.

## Boundaries

- Costing remains MOVING_WEIGHTED_AVERAGE. FIFO is not implemented and is not an 8D acceptance claim; it requires a separate functional phase.
- Checksums detect accidental changes, not an OS administrator. Backups are plaintext business data and exclude local security credentials.
- Migration supports the preceding v1 schema. Validation checks repository collection contracts and document identities, not every possible accounting inconsistency in manually edited legacy records.
- Restore stops if pending audited commands coexist with a corrupt current file, because their outcomes cannot be inferred safely.
- Tests cover main-process workflows and native-dialog IPC boundaries. A full interactive packaged-desktop restore rehearsal has not been performed.

Next planned stage: 8E accounting periods, closing and reopening.
