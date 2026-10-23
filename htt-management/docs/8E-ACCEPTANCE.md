> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

## Operator-led Sales recovery closure — 2026-10-20

The financial recovery workbench now makes the existing review/independent verified-closure path operable. Closing a verified operation removes its unresolved-intent close blocker without changing financial records. Other blockers remain. Current unresolved operations or a journal inspection failure also fail the finance dashboard's recovery control. See [FINANCIAL-RECOVERY-WORKBENCH.md](FINANCIAL-RECOVERY-WORKBENCH.md).

## Supplier prepayment asset control — 2026-10-20

Period close now runs the dated supplier-prepayment subledger/GL and source-integrity checks. Differences and integrity exceptions block closing, including exceptions with zero net difference. Review links retain period end. See [SUPPLIER-PREPAYMENTS.md](SUPPLIER-PREPAYMENTS.md).

## Customer deposit liability close control — 2026-10-20

Close preflight now compares customer deposit balances and each dedicated liability GL account at period end, using the same dated calculation as the deposit reconciliation report and finance-control dashboard. Source-integrity errors block closure even if the net monetary difference is zero. Error and review links preserve the period-end date. No schema change or automatic balancing entry is added.

## Cross-module close readiness follow-up — 2026-10-20

Close preflight now lists approved direct invoice/expense drafts dated through the period end, plus imported statement lines that are unprocessed, stale or not cleared. Unapproved drafts, sales orders, cancelled records and later-period documents do not add these blockers. Statement blockers are grouped by bank. Existing payroll/payment-batch blockers and the new document blockers include local review links; payroll names and links are withheld from users without payroll access.

The original bank reconciliation command also checks imported rows. It cannot bypass the workbench by completing with unprocessed rows or omitting processed entries from its cleared set. Previously cleared entries remain valid. Business storage schema is unchanged.

Automated acceptance covers approval, reopening, posting, cancellation, date boundaries, persisted state, zero-activity bank imports, direct reconciliation bypass, successful clearing and payroll privacy under the AUDITOR role.

# 8E — Accounting periods, closing and reopening

Implemented 2026-10-16, using the existing local main-process repository architecture. No independent backend.

## Delivered behavior

- Finance → Accounting periods (`/accounting/periods`) lists periods and history, creates open periods, runs close checks, and confirms close/reopen with a 10–2000 character reason.
- ADMIN and FINANCE_ADMIN can create, close and reopen. ACCOUNTANT and AUDITOR can inspect. Sales/warehouse/purchasing cannot invoke period commands directly. The acting identity comes from the authenticated main-process session; renderer actor fields are ignored.
- Ranges must be valid and nonoverlapping. Close earlier periods first; reopen later closed periods first. Dates through the latest closed period end are locked, including earlier gaps. Once any periods are configured, every posting date must belong to an open period. Before initial configuration, legacy posting remains available.
- A period must have fully ended in the Pacific/Auckland business timezone. Close checks run again inside the command, so a previous successful preview cannot bypass newly introduced issues.
- Blockers include unresolved financial/purchase operations, financial source/GL integrity issues, AR/AP and inventory-to-GL differences at period end, unbalanced journals, and missing completed bank reconciliation through period end. Bank activity includes customer/supplier payments through their journal lines, not only manually entered banking transactions. Integrity/recovery checks are conservative and inspect current global state, even for an earlier period.
- Unified journal posting/reversal checks enforce the date lock for every source service. Main-process checks additionally protect receipt, bill, credit, payment, allocation, fulfilment, transfer and reconciliation dates, including settlement actions that do not create a new journal. Nonfinancial quotations and purchase orders can still be prepared.
- An original closed-period journal can be reversed in a later open period. A reversal dated into the closed period is rejected. Reopening preserves every business record and adds history; it does not delete journals.
- Close history stores actual actor, time, reason and journal count/debit/credit evidence. Command intents/outcomes and early period denials use the existing persistent security audit. Business snapshot failures roll back the in-memory status/history and stop further writes until restart.
- Business snapshot schema v3 adds period records. Preceding v1/v2 snapshots migrate with pre-migration backups. Backup restore validates period history/status and retains locks across restart. Restoring an older business backup restores its corresponding period state; pre-8E backups have no configured periods. Security users/audit remain current.

## Verification

Actual project commands: `npm run build` and `npm test -- --reporter=dot` (same underlying scripts as pnpm).

Result: 56 test files, 507 tests passed. The existing Vite large-chunk advisory remains a warning.

30 new main-process integration tests cover period validation/order, genuine identity, six role scenarios, date coverage, current/future periods, pending operations, unbalanced journals/AR differences, bank reconciliation, nine cross-module closed-date boundaries, later-period reversal, v2 migration, snapshot-failure rollback, backup restore and restart.

A real business test creates a PO and confirmed sales order, rejects closed-period receipt/bill/payment/fulfilment dates without changing saved business bytes, commits the open-period workflow, creates its invoice, and compares the complete visible snapshot after restart. The sequence test completes actual bank reconciliations before closing the next period. Older 8D lifecycle tests now fix their synthetic clock so they remain valid after the calendar day changes.

## Scope and remaining acceptance

- This stage implements accounting period posting locks and close/reopen controls. It does not generate annual profit-to-retained-earnings journals, tax returns, payroll close or independent-approver workflows.
- Historical journals remain present. Source lifecycle links may be updated when a later-period reversal is posted; original amounts and posting dates are not rewritten.
- Automated main-process acceptance and production compilation passed. Full visual and packaged-desktop interaction acceptance for this new page has not been performed.

Next planned stage: 8F daily finance/report export workflows.
