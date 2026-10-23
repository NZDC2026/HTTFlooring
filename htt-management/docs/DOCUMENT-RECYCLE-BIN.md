> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [G04-RECYCLE-PURGE.md](G04-RECYCLE-PURGE.md).

# Business document recycle bin — 2026-10-19

The Document recycle bin at `/sales/recycle-bin` now operates on real local records: quotes, purchase orders, direct sales-order entry drafts, direct invoice entry drafts and expense-bill entry drafts. It replaces the sample-only restore/purge page. G04 adds ADMIN-only permanent purge of eligible recycled drafts; see [G04 scope, backup and recovery](G04-RECYCLE-PURGE.md).

## Workflow and scope

Switch between Active documents and Recycle bin, filter by type, party/reference, number, ID or date, and inspect original lines, quantities, amounts, notes and lifecycle history. Select up to 100 eligible records, provide a reason of at least three characters, acknowledge the selection and submit. Mixed-type batches are supported when the user has each type's authority. Every row is checked before any lifecycle event is appended; an invalid or stale row rejects the complete batch.

Only DRAFT records without a posted document link or other workflow references are eligible. Sent quotes, approved purchase orders, approved entry drafts, cancelled records, confirmed orders and financial documents cannot be recycled. Reopen an approved entry draft through its existing workflow before recycling. Posted business records retain their established void/reversal workflows. Drafts referenced by recurring schedules, generated occurrences, prepared outputs or other business records are retained for those workflows.

Recycling records a tombstone and immutable lifecycle receipt, preserving the complete original source document. Normal document lists, contact document lists, repository lookups and unified search exclude recycled records. Main-process commands independently reject attempts to edit, send, approve or post them from an old detail page. Entry-creation retries using a recycled source operation require recovery. Recovery keeps the same IDs, lines, totals, status and document numbers. Normal approval, active-party, stock and posting-period checks still apply afterwards. Number generation continues to include retained originals, preventing number reuse.

## Access and attachments

The page requires inventory.read. Each type also requires sales.read or purchases.read; list, details and history are scoped accordingly. Lifecycle writes require sales.write for quotes, purchases.write for purchase orders, sales.manage for sales order/invoice entry drafts, or purchases.bill for expense entry drafts. Read-only roles can inspect eligible records and history but cannot change them. Main verifies these requirements independently of disabled UI controls.

Attachments and their bytes/versions remain available under their existing object authority. Quote/PO attachment business links point to the document recycle bin while the source is recycled, then return to the original business page after recovery. Attachments have their own separate recoverable lifecycle.

## Persistence, concurrency and audit

Lifecycle requests carry a reason, an operation ID and per-record SHA-256 token covering current document content plus its latest lifecycle event. Changes to the source or a delete/recover/delete selection race require a fresh review. Replaying the same request under the same actor returns its original receipt without repeating deletion, even after later recovery and restart; reusing an operation ID for different input is rejected.

Events retain trusted actor/time, action, reason, source content token and request fingerprint. The existing main-owned business host persists lifecycle state with its normal intent/success/failure security audit and rollback behavior. Original sales/PO/entry repositories, financial balances and stock remain unchanged by recycle/recover. Reference checks exclude the mirrored financial cache and attachment links; actual business references remain authoritative.

Schema 16 adds documentRecycle and migrates schema 15 with empty lifecycle history. Normal local backups include all originals and lifecycle receipts. Restore checks IDs, record type, action ordering, operation fingerprints, current recycled content, eligibility and references. Recovered records may subsequently be edited or posted through their normal workflow; their earlier lifecycle history remains valid. No backend or cloud service is added.

## Verification

18 integration tests cover all five record types, unchanged financial repositories, hidden normal lists/lookups, stale-detail commands, approval/posting guards, content/lifecycle token races, atomic mixed batches, retry after restart/recovery, permissions/history redaction, recurring references, attachment byte retention and navigation, numbering, schema migration and normal/corrupt backup restore. The existing route test now verifies the connected recoverable page and absence of sample purge controls.

Final actual-project verification: TypeScript and Vite production builds passed; 94 test files / 1,107 tests passed. The existing Vite large-chunk advisory remains. Disposable Electron acceptance moved real quote QU-2026-0002 into the bin, inspected deletion metadata, restarted, verified retained deletion, then recovered it. Persisted evidence retained the same quote ID, content token, DRAFT status and total 220, together with both lifecycle events. No production business profile was used.

## G04 update — 2026-10-22

The original recycle/recover behavior above remains. Schema 25 adds permanent purge receipts and identity reservation. ADMIN must preview, provide a reason and type the exact confirmation. Every source must be already trashed, unapproved, unposted and free of business and attachment references, including deleted attachments. A verified complete business backup is mandatory before atomic batch removal. Purged drafts require whole-profile backup restore through Data protection and restart; they cannot be recovered individually in the bin. Posted financial documents remain subject to void/reversal. Details and current verification: [G04](G04-RECYCLE-PURGE.md).
