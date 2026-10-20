# Financial recovery workbench — 2026-10-20

`/accounting/financial-recovery` now exposes the existing trusted Sales recovery lifecycle instead of only flagging operations for review. Entry points are the report library, finance controls and accounting periods. Schema 19 is unchanged; operation intents, reconciliation evidence and closure history remain in the existing durable operation journal and business backups.

## Workflow

The main process inspects unresolved operations and returns source invoice/payment/credit links, original and reversal journal links, supported status, live closure blockers and a review revision. Refresh reruns the checks. Search covers operation/result identity and evidence references. Reviewed closures appear separately from ordinary successful transactions.

An authorized operator records evidence reference, summary and confirmations for the business record, original/reversal journals and reconciled balances. The server binds the reviewer to the authenticated account. Evidence alone does not release financial writes. Another authorized account must independently verify and approve using a distinct reference; anyone who recorded evidence on that operation cannot approve it.

Approval rechecks the current business result, linked GL, all existing Sales restart blockers and financial consistency. It also verifies payment bank/deposit and AR account movements, exact original/reversal account offsets, and the current AR-to-GL reconciliation; equal journal totals alone are insufficient. It also requires the inspected review revision; a new review invalidates an old approval screen. On success only the interrupted operation is marked completed and approval history is appended. No receipt, invoice, allocation, journal or reversal is replayed or repaired. Other unresolved operations remain blocked. The existing write and period-close gates resume only when their corresponding blockers are resolved.

Finance controls now count the current unresolved-operation check. Pending operations or an unreadable operation journal produce Review Required even if all numerical accounting balances reconcile. This is a current global posting control, independent of the selected reporting date.

## Permissions and supported boundaries

`audit.read` allows read-only inspection (including ACCOUNTANT and AUDITOR). `accounting.recover` allows review and independent approval (ADMIN / FINANCE_ADMIN). Submitted operator/approver strings cannot impersonate another user. Existing main-process authorization, durable intent/outcome audit, atomic command rollback and uncertain-commit restart rules apply.

Verified closure supports the existing five Sales operation kinds: customer payment, invoice void, credit allocation, allocation reversal and payment reversal. It requires a durable bound result already in its final business/GL state. Missing/ambiguous records, duplicated journals, other Sales inconsistencies, unreadable storage and unsupported kinds stay blocked. Unsupported pending operations can be flagged for manual review; this workbench does not add bank/other-domain repair or verified closure procedures. It does not dismiss a missing result or provide an automatic retry button.

## Validation

Integration coverage includes actual source links, strict evidence confirmations, trusted identity binding, self-approval denial, second-account closure, stale evidence, repeated closure, missing results, unsupported operations, other pending intents, live-data changes, equal-total wrong-account journals, read-only roles, persisted history, financial-record immutability, post-closure failure rollback, corrupt storage and release of the resolved write/period blockers. Finance-summary tests cover unresolved counts and unreadable journals even at zero monetary difference.

Native desktop acceptance used two synthetic accounts and a separate disposable profile. The reviewer submitted evidence, self-approval remained unavailable, the second account approved the verified existing payment, unresolved count changed from one to zero, and closure history retained both authenticated identities and references. No production business profile or real transfer was used.

Bank receipt/payment and transfer recovery is now supported; see BANK-RECOVERY-ACCEPTANCE.md for exact proof requirements and remaining unsupported cases.

Completed bank reconciliation recovery and stable completion identities are covered in RECONCILIATION-RECOVERY-ACCEPTANCE.md.

Complex exception diagnostic guidance, case export and existing administrator restore navigation are documented in PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md. Guidance does not automatically repair missing financial effects.

Executable targeted bank repair now covers no-effect cancellation and isolated missing bank records/journals. See TARGETED-FINANCIAL-REPAIR.md. Other complex defects remain fail-closed.
