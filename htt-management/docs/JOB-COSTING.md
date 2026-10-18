# Jobs and actual profitability

Entry: Page directory → Jobs & projects (`/accounting/jobs`). The existing project master, customer mapping, owner, dates, budgets, status and change history remain available, with a searchable/paginated project register. Create/edit use the existing local workspace commands.

## Actuals and allocation workflow

1. Create a project and enter full-project revenue and cost budgets.
2. Open the project or allocation register; refresh posted source lines and search by journal, source reference, description or account.
3. Select an original posted revenue/expense line, split its absolute amount across projects, and supply a reason. Splits may leave a residual unallocated amount. Save, then rerun profitability.
4. Inspect revenue, cost, profit, margin, full-project budgets and variances. Inspect transaction detail and open its journal. Export CSV includes all matching detail pages, not only the visible 50 rows.
5. Reclassify a source or remove all splits to return it to unallocated. Before/after splits, trusted actor/time, reason and revisions remain in allocation history. Project/budget changes retain existing workspace history.

Actuals come from posted GL REVENUE and EXPENSE accounts, including sales revenue, COGS, supplier expense bills, credit adjustments, manual journals and other posted expense/revenue transactions. Tax/control/bank/inventory balance-sheet lines and unposted drafts are excluded. Accrual profit is not cash flow: ordinary payment/receipt allocations do not create a second project income/cost entry.

Each project allocation is an explicit management classification of one original journal line; document/customer matching never silently assigns a project. Purchasing stock into inventory is not project cost until it reaches a posted expense account such as COGS. Purchase commitments, unposted labour/timesheets, overhead estimates and document-entry job defaults are not included in this release.

## Calculation rules and safeguards

- Positive split amounts, at most two decimal places; one split per project; total cannot exceed the line's absolute signed net. REVENUE uses credit minus debit; EXPENSE uses debit minus credit.
- Original entries remain included even after reversal. A reversal inherits the exact original splits with opposite signs on its own journal date. Editing a classification updates both original and reversal attribution; no independent reversal allocation is permitted. Mismatched reversal lines fail rather than guessing a mapping.
- Project totals plus explicit unallocated totals reconcile to the selected period's posted GL revenue and expense totals. Negative credit/expense corrections retain their signs. No approximate or fuzzy allocation is applied.
- Profit = revenue − cost. Margin = profit / revenue when net revenue is positive; otherwise blank. Revenue variance = actual − budget; cost saving = cost budget − actual cost; profit variance = actual profit − budget profit. Positive variances/savings are favourable.
- Date filters use journal dates inclusively. Budgets always cover the whole project, are not prorated, and are labelled accordingly. Existing fractional legacy budgets display at currency precision; new budget edits require cents.
- Inactive projects remain in historical reports. They cannot receive new or changed split amounts; unchanged historic splits can remain, and removal is allowed.
- Main-process authority: `accounting.read` for sources/reports; `accounting.post` for classification. ADMIN/FINANCE_ADMIN/ACCOUNTANT can maintain; AUDITOR reads; operational roles receive empty costing snapshots and cannot invoke commands.
- Revision and source signatures reject stale edits. Stable operation IDs make retries idempotent, including after restart and later reclassification. Commands update allocation and history atomically; failed commands roll back both.
- This is management metadata, not a journal adjustment. It may reclassify historical project reports with a reason while leaving GL, tax, AR/AP, inventory, bank and closed-period postings unchanged. Actual financial corrections continue through the existing source/period controls.
- Schema 12 migrates to 13 with empty allocations. Backups include allocations/history and validate source/project references, capacities, audit sequence and outcomes. Restart and normal backup restore retain project actuals.

## Verification

24 new tests cover exact cents, credits/reversals/date boundaries, residual reconciliation, project split/reclassification/clear, inactive projects, idempotent retries, permissions/redaction, stale editor/source rejection, malformed backups, migration, atomic rollback and normal restore. A real direct invoice plus expense bill scenario verifies net-of-tax revenue/cost and inherited void reversals. Full suite: 88 files / 1029 tests passed. Build passed; the existing large-chunk advisory remains.

Disposable Electron acceptance verified project selection, original-line allocation, required reason, saved revision/before-after audit, and recalculation to revenue 1000 / cost 600 / profit 400 / margin 40%, with company unallocated balances and GL reconciliation visible. A second launch verified the searchable project register, budget history and retained profit/margin. Desktop CSV export was saved and parsed: the project totals and both source detail rows matched the report. Acceptance used a separate temporary business profile.
