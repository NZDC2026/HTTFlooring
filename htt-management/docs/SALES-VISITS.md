> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Local sales visits & follow-ups — 2026-10-18

Sales visits & activity now uses a main-owned local salesVisits repository. It records visit plans, check-in/out, outcomes, append-only notes and a linked follow-up task. No backend, device location tracking, contact synchronization or external messaging is added.

## Workflow

Plan a named visit for a current customer and optional customer branch, with a business date and manually entered location note. The creator is recorded as owner. Only planned visits can be edited; edits use optimistic revisions. Customer and branch names are snapshots for historical display. A branch must exist at planning/check-in time; its historical name remains in the visit after later master-data changes.

Check in from a planned visit. Completion requires check-in and a non-empty outcome; it stores trusted check-out time and actor. Optionally create a follow-up with a name, due date, priority and instructions. The task is assigned to the completing user, retains the visit customer, and uses the existing task repository, notifications/action centre and completion workflow. The visit links to the task's current status. Task customer changes that would break this link are rejected.

Unfinished visits may be cancelled with a reason. Completed outcomes remain recorded; corrections are append-only notes. The register supports customer/name/date/outcome search, status and own-visit filters, plus 50-row pagination. Check-in/out and history timestamps display in the configured business timezone; planned/due dates are business date keys.

## Integrity and permissions

sales.read can inspect visits; sales.write is required for every mutation. The creator, check-in actor and completing actor are separate trusted identities. Shared authorized sales users may process another user's visit; the original creator remains the owner. Callers cannot set actors, timestamps or statuses through arbitrary fields. System-clock regressions are rejected.

Creation operation IDs and completion fingerprints protect retries. Repeating the same successful checkout returns the saved visit, including its existing follow-up; a changed outcome is rejected. The main business host atomically rolls back both task and visit changes if completion fails. Stale changes are rejected. These operations do not change financial balances or inventory.

Schema 11 adds the visit register. Older supported profiles/backups migrate with an empty register and preserve existing records; the main host retains its migration backup. Restore validates schema, timestamps/state, history counts/identities, completion fingerprint and customer/task relationships.

## Verification

15 new integration tests cover trusted metadata, create/check-in/checkout retries, task creation, cancellation, plan editing, stale revisions, invalid customers/branches/dates, immutable completed outcomes, append-only corrections, failure after task creation, seven roles, linked-customer protection, schema 10 migration, invalid backups, audit/restart and clock regressions.

Native Electron acceptance used an isolated synthetic profile: opened a planned showroom visit, checked in, entered an outcome, enabled a follow-up, then checked out. The saved Completed visit linked to an Open task named Confirm showroom quantities with the entered instructions. No actual business profile was used for acceptance.
