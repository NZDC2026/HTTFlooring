> Latest follow-up: [Finance foundation](FINANCE-FOUNDATION.md) connects financial settings, tax account/report snapshots and reconciled opening-balance import. Older scope notes below describe their earlier baseline.

# Local finance closure — 2026-10-16

Implemented inventory cost read permissions and separate sales management authority; enforced in the trusted business host as well as UI. Supplier financial credits now post purchase price variance rather than reduce inventory valuation.

Customer receipts support multiple invoices, atomic posting, retry protection and grouped reversal. Customer and supplier refunds consume unused issued credits, support partial amounts and reversing journals, and update credit availability, as-of balances and statements. Supplier payment batches support draft, approval, local posting, cancellation and grouped reversal.

Bank account setup, CSV column mapping/date formats, duplicate protection, matching existing payments, tax-inclusive categorisation/splits, rule suggestions, reversal and zero-difference reconciliation now use persisted business repositories. Reconciled sources and backdated bank postings are protected. Schema 5 migrates old profiles/backups with empty new registers. Trusted permissions, atomic persistence, rollback and audit apply to these commands.

## Verification

Automated suite: 61 files, 676 tests. Production TypeScript/Vite/Electron build passes. Tests cover authorization, posting integrity, partial refunds, shared credit availability, legacy credit repair, closed periods, reconciliation locks, restart, retry and rollback.

Native Electron acceptance used an isolated synthetic profile: a 3.00 receipt allocated 1.00 and 2.00 to two invoices; CSV duplicate skip and matching without duplicate journals; an 11.00 inclusive-tax expense; reconciliation completed with balance 2932.00 and difference 0.00; a 1.00 customer refund and a 1.00 supplier batch approved and locally posted. No actual business profile was used for acceptance.

## Operating boundaries

- No independent backend, live bank feed or actual money transfer. Remittance CSV is a review register, not a bank-specific payment instruction.
- Supplier credits here represent financial price credits, without physical stock returns. Physical returns require their own inventory workflow.
- Existing historical supplier-credit journals are preserved. An authorized accountant can use the bank workbench legacy-credit repair with a reason and an open-period date. It posts an idempotent inventory/variance reclassification; historical real books are not silently rewritten.
- Refunds require unused issued credit; this does not add a separate customer deposit/overpayment engine.
- New bank accounts use the company base currency and zero opening balance. Used ledger/currency/opening date are locked.
- Other sample workspaces (including payroll and document delivery) remain outside this change.
