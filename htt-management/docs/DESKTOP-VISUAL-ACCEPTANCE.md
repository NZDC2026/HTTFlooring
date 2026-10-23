> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [WORKFLOW-ACCEPTANCE-20261021.md](WORKFLOW-ACCEPTANCE-20261021.md).

# Desktop visual acceptance — 2026-10-16

All 90 registered route patterns were opened and visually inspected in the Electron desktop application, using an isolated synthetic local profile. Parameterized routes were checked with representative records, not every possible ID or business state. The normal business profile was not used. No live API or external backend was connected.

Primary pass: default 1440 × 900 window (macOS constrains the available screen height). Additional checks: 1100 × 700 minimum window on Dashboard, customers/activity, employees/form, journals, periods, supplier statement, AP, AR ageing, purchase audit, GRNI and security. This is desktop visual acceptance, not a mobile or exhaustive business certification.

## Corrections and verification

- Replaced the missed customer Notes & Activity placeholder with a document/payment/credit timeline and explicitly unsaved note preview.
- Distinguished stored customer profile balances from current financial balances; clarified gross open invoices, net payables and credits in labels.
- Corrected supplier-credit and reversal badges on supplier statements.
- Wrapped journal descriptions and long security audit fields; used fixed audit columns with horizontal scrolling where necessary.
- Matched default border colours to the design palette and aligned accounting-period controls with existing cards and inputs.
- Removed the body minimum-width conflict that caused whole-page horizontal scrolling at the minimum desktop window size. Wide financial tables retain their own horizontal scrolling.
- Added a GRNI empty result message, updated stale purchase-audit persistence wording and manual-journal helper text, added missing sales-status colours and the demo page title.
- Reopened the changed major views after rebuilding; checked search empty results, document Versions/Access tabs, supplier Account tab, period preflight, purchase audit inspector and admin/auditor security presentation.

## Remaining business finding

The synthetic supplier-credit example reveals a $20 difference between inventory valuation and the inventory GL control (valuation $160 versus GL $140 before the extra unbilled receipt). The inventory and purchase reconciliation screens correctly expose this difference. Supplier credits reduce inventory GL without a corresponding inventory cost movement in this scenario. This visual patch does not change posting or stock rules; that scenario remains a business acceptance failure requiring a separate inventory-credit integration fix. AR/AP-to-GL, trial balance and balance sheet were balanced in the fixture. The finance controls summary does not cover this inventory check, so its green status is not an all-module business certification.

Payroll, document uploads, company preferences and integration screens remain clearly labelled interactive samples. Preview notes are not persistent customer notes. No credential, permission, bank payment or accounting-period state was submitted through the desktop UI during this visual pass.

## Validation

- Production build: passed. Existing large-bundle warning remains.
- Test suite: 56 files, 507 tests passed.
- No temporary fixtures, test credentials, generated assets, dependencies or desktop test configuration are included in the patch.

## Route coverage

“Checked” means the representative page rendered and its visible desktop layout was reviewed. It does not certify every action, record, error state or financial rule.

| Route | Desktop visual result |
|---|---|
| `/` | Checked; root redirects to Dashboard |
| `/search` | Checked |
| `/help` | Checked |
| `/notifications` | Checked |
| `/payroll/employees` | Checked |
| `/payroll/employees/new` | Checked |
| `/payroll/employees/:employeeId` | Checked |
| `/payroll/employees/:employeeId/edit` | Checked |
| `/payroll/pay-runs` | Checked |
| `/payroll/pay-runs/new` | Checked |
| `/payroll/pay-runs/:runId` | Checked |
| `/payroll/pay-runs/:runId/payslips/:employeeId` | Checked |
| `/payroll/timesheets` | Checked |
| `/payroll/leave` | Checked |
| `/documents/upload` | Checked |
| `/documents/:documentId` | Checked |
| `/settings/preferences` | Checked |
| `/settings/roles` | Checked |
| `/settings/integrations` | Checked |
| `/settings/integrations/:integrationId` | Checked |
| `/reports/library` | Checked |
| `/*` | Checked; invalid address fallback |
| `/settings/security` | Checked; corrected view rechecked |
| `/dashboard` | Checked |
| `/demo` | Checked |
| `/sales` | Checked |
| `/sales/quotes/:quoteId` | Checked |
| `/sales/orders/:orderId` | Checked |
| `/sales/invoices/:invoiceId` | Checked |
| `/sales/credit-notes/:creditNoteId` | Checked |
| `/sales/statements/:customerId` | Checked |
| `/purchases` | Checked |
| `/purchases/new` | Checked |
| `/purchases/bills/:supplierBillId` | Checked |
| `/purchases/credits/new` | Checked |
| `/purchases/credits/:supplierCreditId` | Checked |
| `/purchases/goods-receipts/:goodsReceiptId` | Checked |
| `/purchases/:purchaseOrderId/receive` | Checked |
| `/purchases/:purchaseOrderId/bill` | Checked |
| `/purchases/:purchaseOrderId/edit` | Checked |
| `/purchases/payments/new` | Checked |
| `/purchases/payments/:supplierPaymentId` | Checked |
| `/purchases/statements/:supplierId` | Checked; corrected view rechecked |
| `/purchases/payables/reconciliation` | Checked |
| `/purchases/payables` | Checked; corrected view rechecked |
| `/purchases/:purchaseOrderId` | Checked |
| `/inventory` | Checked |
| `/inventory/valuation` | Checked |
| `/inventory/reconciliation` | Checked; business difference documented above |
| `/banking` | Checked |
| `/banking/accounts/:bankAccountId` | Checked |
| `/banking/transactions/new` | Checked |
| `/banking/transfers/new` | Checked |
| `/banking/accounts/:bankAccountId/reconcile` | Checked |
| `/accounting/periods` | Checked; corrected view rechecked |
| `/accounting` | Checked |
| `/accounting/accounts/new` | Checked |
| `/accounting/accounts/:accountId/edit` | Checked |
| `/accounting/journals` | Checked; corrected view rechecked |
| `/accounting/journals/new` | Checked |
| `/accounting/journals/:journalEntryId` | Checked |
| `/accounting/trial-balance` | Checked |
| `/accounting/general-ledger` | Checked |
| `/accounting/profit-and-loss` | Checked |
| `/accounting/balance-sheet` | Checked |
| `/accounting/financial-recovery` | Checked |
| `/accounting/finance-controls` | Checked |
| `/accounting/reconciliation/ar` | Checked |
| `/accounting/reconciliation/ap` | Checked |
| `/payroll` | Checked |
| `/reports` | Checked; corrected view rechecked |
| `/reports/purchase-accounting-reconciliation` | Checked; business difference documented above |
| `/reports/purchase-posting-audit` | Checked; corrected view rechecked |
| `/reports/grni-outstanding` | Checked; corrected view rechecked |
| `/reports/aged-payables` | Checked |
| `/contacts` | Checked |
| `/contacts/customers/new` | Checked |
| `/contacts/customers/:customerId/edit` | Checked |
| `/contacts/customers/:customerId` | Checked |
| `/contacts/customers/:customerId/locations` | Checked |
| `/contacts/customers/:customerId/contacts` | Checked |
| `/contacts/customers/:customerId/pricing` | Checked |
| `/contacts/customers/:customerId/sales` | Checked |
| `/contacts/customers/:customerId/activity` | Checked; corrected view rechecked |
| `/contacts/suppliers` | Checked |
| `/contacts/suppliers/new` | Checked |
| `/contacts/suppliers/:supplierId/edit` | Checked |
| `/contacts/suppliers/:supplierId` | Checked |
| `/documents` | Checked |
| `/settings` | Checked |
