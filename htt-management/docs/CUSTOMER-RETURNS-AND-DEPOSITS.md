> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Customer physical returns and deposits — 2026-10-20

Both workflows use the existing trusted local repository, atomic business snapshot, journal, inventory, audit and backup architecture. No external service or live payment execution is added. Schema 18 migrates earlier profiles with empty new registers.

## Customer physical returns

Sales → Physical customer returns (`/sales/customer-returns`) offers register, receipt and detail/reversal pages. A finance administrator selects an issued invoice, its actual active dispatch lines, quantities, receipt date and reason. Stock returns to the original site with original dispatch cost; partial receipts retain exact total cents. Whole-pack restrictions remain enforced. Opening-balance and undispatched invoices are excluded.

A receipt creates a credit at original invoice pricing/tax, or links an already issued credit for the same invoice without duplicating it. Active receipts cannot exceed original dispatched quantities or linked credit quantities. Inventory accounting debits inventory and credits COGS. Financial allocations and cash refunds use the linked existing credit workflow.

Reversal removes available returned goods and reverses cost accounting. A credit created by this return is voided too, after its settlements have been reversed. A pre-existing linked credit is retained. Direct voiding of a linked credit or original dispatch is blocked while the physical receipt is active. Dates cannot precede original dispatch or later inventory activity. Failed financial or stock operations roll back the entire command.

## Deposits / prepayments

Sales → Customer deposits (`/sales/customer-deposits`) offers receipt, register, per-customer historical funds held, application, unused-funds refund and reversal. Customer details link to deposits and display funds held separately from invoice receivables.

Finance configures a dedicated non-manual liability account once. Receipt debits the selected bank and credits this liability, without issuing an invoice or recognizing sales. Application to an issued invoice for the same customer debits liability and credits AR. Its marked internal settlement participates in invoice balances, customer statements and AR/GL reconciliation; it creates no bank movement. Invoice payment history links to its deposit owner. The bank receipt register excludes these noncash applications. Cash reports classify real deposit receipts and refunds with customer cash movements.

Unused funds can be refunded from an active bank. Applications, refunds and original receipts have explicit dated, reasoned reversals. Receipt reversal requires earlier consumption to be reversed first. Reconciled or statement-matched journals are protected. Historical balance validation prevents backdating from spending funds that were unavailable on the chosen date. Deposit balances never offset AR silently. Sales/tax calculation remains in the existing invoice/credit workflow; separate security-bond, trust-account, forfeiture and specialized tax treatments are outside this implementation.

## Controls and verification

Writes require `sales.payment` (ADMIN / FINANCE_ADMIN). Return cost reads require `inventory.cost.read`; deposit reads require `sales.read`; liability setup requires `accounting.post`. Internal settlement helpers cannot be called through renderer IPC. System journals cannot be posted or reversed directly. Closed periods, source dates, idempotent operation IDs, persistent audit, atomic failure recovery and backup reference/journal validation apply.

Automated coverage includes source limits, partial/fractional costs, original-cost reversal, existing credits, settlement locks, failure rollback, combined deposit-funded sale/return/refund, historical liability balances, no duplicate cash receipts, permissions, closed periods, bank reconciliation locks, restart retries, schema-17 migration and corrupted backup rejection.

Native desktop acceptance uses a separate synthetic profile: return register/detail, new return submission and reversal, deposit register/detail, invoice application and unused-funds refund. No production business data is used in these UI checks.

## Deposit liability control follow-up — 2026-10-20

The report library, deposit register and finance controls now link to `/accounting/reconciliation/deposits`. This read-only, date-selectable report compares each dedicated liability account with receipt/application/refund balances, preserves dated reversals and provides receipt/source drill-downs. It checks original and reversing journal identity, account movements, source ownership, missing receipts/configuration/customers and historical overdrafts. Unexpected offsetting liability entries cannot pass merely because their net difference is zero.

Finance-control totals and overall status include this check. Period close runs the same calculation in the trusted process at period end and blocks on either a monetary difference or source-integrity exceptions. Review links retain the reporting date. No balancing journal or automatic correction is generated, and schema 18 remains unchanged.

Focused tests cover dated originals/reversals, no-activity profiles, equal-total wrong accounts, zero-difference source corruption, missing configuration, orphan events/journals, historical overdrafts, non-finite inputs and the close/dashboard failure paths. Native acceptance used an isolated synthetic profile: report-library navigation, matching 75.00 balances, historical 200.00 balances, receipt detail and dated finance-control review links.
