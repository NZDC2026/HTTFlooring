# Local recurring invoice and expense drafts — 2026-10-18

Recurring transactions now generate actual managed invoice or expense entry drafts from copied local templates. G05 subsequently adds opt-in desktop due scans, ordered catch-up, an error/retry queue and bank-transaction templates; automatic approval, posting, payment, email and an independent backend remain outside automation. See [G05 current behavior](G05-RECURRING-AUTOMATION.md).

## Workflow and calculation

Create a regular invoice/expense entry draft first, then select it as the source of a named recurring schedule. Existing approved/posted entry drafts are also usable; cancelled drafts and sales orders are rejected. The template copies the party, recipient references, lines and net prices at creation. Later source edits do not alter the template. Prices are stored exclusive of tax; generation uses current product/tax configuration and revalidates contacts, product/unit and expense-account eligibility. Changing tax configuration can change generated totals; review every draft before approval.

Select Weekly, Fortnightly, Monthly or Quarterly, a first generation date and an inclusive end date. Weekly schedules advance by calendar days. Monthly/quarterly schedules retain the first date's day number and clamp short months, preventing January 31 → February 28 → March 28 drift. Payment terms retain the source's calendar-day offset. Expense supplier references append the occurrence date.

Generate one due occurrence in order, using business today in the configured timezone. Successful generation advances the next date; reaching the end marks the schedule Ended. Pause and Resume are explicit. Name/end date are editable with optimistic revision checks. Extend an ended schedule, then Resume. Create a new schedule to change parties, lines or cadence. Each successful run links to the generated draft for the normal review/approve/post workflow; creating a draft does not affect journals, receivables, payables or inventory.

Template creation uses an operation ID. Generation uses schedule ID + occurrence date and a deterministic managed-draft operation ID. A successful retry returns the existing draft even after restart; it does not create another occurrence. Cancelling the generated draft preserves its history and does not automatically regenerate it. Validation/command failures leave the next date unchanged; the trusted business host rolls back draft/register changes together. Storage failures retain the existing restart/recovery requirements. Failed commands remain in the security audit; the run table contains successful generations.

## Permissions and storage

Separate recurringInvoices and recurringExpenses repositories preserve existing source read permissions. Invoice creation/generation requires sales.manage, matching managed invoice entry. Expense creation/generation requires purchases.bill, matching expense entry. Readers/auditors can inspect definitions/history without generating drafts; normal sales.write alone does not grant financial entry authority. Trusted main validates strict command inputs and records the actual actor. Callers cannot supply generated payloads or actor identity.

Schema 10 adds the two recurring registers. Older supported profiles/backups migrate with empty recurring registers; existing financial records remain intact. Main creates its existing pre-migration backup. Restore validates dates/cadence, payload schema, party/product/account references, occurrence sequence, run count and generated draft references. No actual business profile was used for UI acceptance.

## Validation

19 new automated cases cover monthly/leap-year/DST dates, inclusive ends, future and out-of-order protection, copied prices, current tax, idempotent creation/generation, pause/resume, revisions, permissions/redaction, failed-master-data retry, post-creation rollback, cancelled generated drafts, schema 9 migration, backup validation, audit, restart and reviewable draft integration.

Native Electron acceptance used a synthetic profile: Pause disabled generation, Resume restored it; generating the 2026-10-01 occurrence advanced next date to 2026-11-01, disabled future generation and created a DRAFT invoice for AUD 220.00 due 2026-10-02, reachable from run history. It was not posted.

## G05 update — 2026-10-22

Schema 26 adds role-scoped opt-in local due scanning for invoices, expenses and bank entry drafts while the desktop is running and an authorized user is signed in. It catches up original occurrence dates in order, up to 20 attempts per scan, with durable failures and explicit retries. Bank drafts require separate manual review/approval/posting through existing ledger rules. The original single-occurrence workflow and copied invoice/expense templates remain. Current scope and verification: [G05](G05-RECURRING-AUTOMATION.md).
