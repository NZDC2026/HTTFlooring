> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Local notifications & action centre — 2026-10-18

The notifications page now shows current local business work rather than two illustrative messages. No separate backend, notification register or snapshot schema change is introduced.

## Current work

- Receivables: non-draft, non-void, unpaid invoices dated on or before business today, with a due date strictly before today and a positive remaining amount in cents.
- Payables: non-void, unpaid supplier bills with the same business-date and positive outstanding-balance rules.
- Tasks: open/in-progress tasks due today or earlier. Legacy Active tasks are treated as open; completed/inactive tasks are excluded.
- Data issues: visible candidate records with invalid dates or invalid/unsafe outstanding amounts become source-linked review items instead of hiding other work.

Business today uses the configured business timezone and refreshes every minute while the page is mounted. Overdue days are calendar-date differences, unaffected by daylight saving. Financial amounts are remaining balances in the company base currency, not original document totals. Settlements, credits, voids, reversals and task edits update subscribed data; a resolved action disappears and a qualifying reversed/reopened source reappears.

Type counts, literal text search, My tasks only and 50-row pagination are available. My tasks only filters task rows and leaves financial actions unchanged. Counts describe all current permitted actions; the matching count describes the selected filters. This shared current-work view has no separate read/unread inbox, stored dismissal, background delivery or OS push notification. Opening a source uses its existing business workflow.

## Task lifecycle integrity

New task writes accept Open, In progress and Completed; omitted status defaults to Open. Completion timestamps and actors are controlled in the trusted business host. Caller-supplied completion fields are stripped. Editing an already completed task retains the original trusted completion; reopening clears its current completion fields. A later completion records its new actor/time; previous completions remain in immutable edit history and the security audit. UI supports Start, Complete and Reopen, and displays completion metadata. Revision checks reject stale transitions. Legacy snapshots remain restorable.

Existing permissions remain in force: sales.read sees receivables/tasks; purchases.read sees payables. The pure projection rechecks these permissions on main-filtered repository copies. Completing or reopening still requires sales.write; auditors/accountants can inspect but cannot mutate tasks. Resolving a financial action still uses its original payment/credit permissions and posting controls.

## Verification

17 new automated tests cover due boundaries, partial/zero balances, statuses, roles, invalid sources, calendar-day ageing, literal filters, personal task filters, 121-row pagination, trusted completion metadata, reopen/restore, stale transitions, default/legacy status, audit, main-owned posting, receipt and supplier batch settlement, receipt reversal and restart.

Native Electron acceptance used an isolated synthetic profile: one overdue invoice, bill and task produced three actions. Completing the task reduced the list to two; reopening restored three. The task register displayed Completed after completion. No actual business profile was used for acceptance.
