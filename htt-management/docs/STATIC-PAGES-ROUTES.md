# Static page route inventory

Scope: currently registered HTT Management navigation and routes. Parameterized detail pages reuse the same layout for different records.

Total route patterns: 193 (including the root and 404 fallback).

103 added patterns are interactive static previews, separate from live local business workflows. See REQUIREMENTS-STATIC-COMPLETION.md for scope and limitations.

| Module | Route |
|---|---|
| Root | `/` |
| search | `/search` |
| help | `/help` |
| notifications | `/notifications` |
| payroll | `/payroll/employees` |
| payroll | `/payroll/employees/new` |
| payroll | `/payroll/employees/:employeeId` |
| payroll | `/payroll/employees/:employeeId/edit` |
| payroll | `/payroll/pay-runs` |
| payroll | `/payroll/pay-runs/new` |
| payroll | `/payroll/pay-runs/:runId` |
| payroll | `/payroll/pay-runs/:runId/payslips/:employeeId` |
| payroll | `/payroll/timesheets` |
| payroll | `/payroll/leave` |
| documents | `/documents/upload` |
| documents | `/documents/:documentId` |
| settings | `/settings/preferences` |
| settings | `/settings/roles` |
| settings | `/settings/integrations` |
| settings | `/settings/integrations/:integrationId` |
| reports | `/reports/library` |
| * | `/*` |
| settings | `/settings/security` |
| dashboard | `/dashboard` |
| demo | `/demo` |
| sales | `/sales` |
| sales | `/sales/quotes/:quoteId` |
| sales | `/sales/orders/:orderId` |
| sales | `/sales/invoices/:invoiceId` |
| sales | `/sales/credit-notes/:creditNoteId` |
| sales | `/sales/statements/:customerId` |
| purchases | `/purchases` |
| purchases | `/purchases/new` |
| purchases | `/purchases/bills/:supplierBillId` |
| purchases | `/purchases/credits/new` |
| purchases | `/purchases/credits/:supplierCreditId` |
| purchases | `/purchases/goods-receipts/:goodsReceiptId` |
| purchases | `/purchases/:purchaseOrderId/receive` |
| purchases | `/purchases/:purchaseOrderId/bill` |
| purchases | `/purchases/:purchaseOrderId/edit` |
| purchases | `/purchases/payments/new` |
| purchases | `/purchases/payments/:supplierPaymentId` |
| purchases | `/purchases/statements/:supplierId` |
| purchases | `/purchases/payables/reconciliation` |
| purchases | `/purchases/payables` |
| purchases | `/purchases/:purchaseOrderId` |
| inventory | `/inventory` |
| inventory | `/inventory/valuation` |
| inventory | `/inventory/reconciliation` |
| banking | `/banking` |
| banking | `/banking/accounts/:bankAccountId` |
| banking | `/banking/transactions/new` |
| banking | `/banking/transfers/new` |
| banking | `/banking/accounts/:bankAccountId/reconcile` |
| accounting | `/accounting/periods` |
| accounting | `/accounting` |
| accounting | `/accounting/accounts/new` |
| accounting | `/accounting/accounts/:accountId/edit` |
| accounting | `/accounting/journals` |
| accounting | `/accounting/journals/new` |
| accounting | `/accounting/journals/:journalEntryId` |
| accounting | `/accounting/trial-balance` |
| accounting | `/accounting/general-ledger` |
| accounting | `/accounting/profit-and-loss` |
| accounting | `/accounting/balance-sheet` |
| accounting | `/accounting/financial-recovery` |
| accounting | `/accounting/finance-controls` |
| accounting | `/accounting/reconciliation/ar` |
| accounting | `/accounting/reconciliation/ap` |
| payroll | `/payroll` |
| reports | `/reports` |
| reports | `/reports/purchase-accounting-reconciliation` |
| reports | `/reports/purchase-posting-audit` |
| reports | `/reports/grni-outstanding` |
| reports | `/reports/aged-payables` |
| contacts | `/contacts` |
| contacts | `/contacts/customers/new` |
| contacts | `/contacts/customers/:customerId/edit` |
| contacts | `/contacts/customers/:customerId` |
| contacts | `/contacts/customers/:customerId/locations` |
| contacts | `/contacts/customers/:customerId/contacts` |
| contacts | `/contacts/customers/:customerId/pricing` |
| contacts | `/contacts/customers/:customerId/sales` |
| contacts | `/contacts/customers/:customerId/activity` |
| contacts | `/contacts/suppliers` |
| contacts | `/contacts/suppliers/new` |
| contacts | `/contacts/suppliers/:supplierId/edit` |
| contacts | `/contacts/suppliers/:supplierId` |
| documents | `/documents` |
| settings | `/settings` |

## Requirement-driven static previews

| Workspace | Route |
|---|---|
| Directory | `/workspace` |
| Products & services | `/inventory/products` |
| Products & services | `/inventory/products/new` |
| Products & services | `/inventory/products/:previewId` |
| Products & services | `/inventory/products/:previewId/edit` |
| Scheduled promotions | `/inventory/promotions` |
| Scheduled promotions | `/inventory/promotions/new` |
| Scheduled promotions | `/inventory/promotions/:previewId` |
| Scheduled promotions | `/inventory/promotions/:previewId/edit` |
| Tax codes | `/accounting/tax-codes` |
| Tax codes | `/accounting/tax-codes/new` |
| Tax codes | `/accounting/tax-codes/:previewId` |
| Tax codes | `/accounting/tax-codes/:previewId/edit` |
| Linked accounts | `/accounting/linked-accounts` |
| Linked accounts | `/accounting/linked-accounts/new` |
| Linked accounts | `/accounting/linked-accounts/:previewId` |
| Linked accounts | `/accounting/linked-accounts/:previewId/edit` |
| Jobs & projects | `/accounting/jobs` |
| Jobs & projects | `/accounting/jobs/new` |
| Jobs & projects | `/accounting/jobs/:previewId` |
| Jobs & projects | `/accounting/jobs/:previewId/edit` |
| Bank account setup | `/banking/setup/accounts` |
| Bank account setup | `/banking/setup/accounts/new` |
| Bank account setup | `/banking/setup/accounts/:previewId` |
| Bank account setup | `/banking/setup/accounts/:previewId/edit` |
| Bank rules | `/banking/rules` |
| Bank rules | `/banking/rules/new` |
| Bank rules | `/banking/rules/:previewId` |
| Bank rules | `/banking/rules/:previewId/edit` |
| Electronic payment batches | `/banking/payment-batches` |
| Electronic payment batches | `/banking/payment-batches/new` |
| Electronic payment batches | `/banking/payment-batches/:previewId` |
| Electronic payment batches | `/banking/payment-batches/:previewId/edit` |
| Pay items | `/payroll/pay-items` |
| Pay items | `/payroll/pay-items/new` |
| Pay items | `/payroll/pay-items/:previewId` |
| Pay items | `/payroll/pay-items/:previewId/edit` |
| Payroll filing | `/payroll/filing` |
| Payroll filing | `/payroll/filing/new` |
| Payroll filing | `/payroll/filing/:previewId` |
| Payroll filing | `/payroll/filing/:previewId/edit` |
| Recurring transactions | `/automation/recurring` |
| Recurring transactions | `/automation/recurring/new` |
| Recurring transactions | `/automation/recurring/:previewId` |
| Recurring transactions | `/automation/recurring/:previewId/edit` |
| Tasks & action centre | `/tasks` |
| Tasks & action centre | `/tasks/new` |
| Tasks & action centre | `/tasks/:previewId` |
| Tasks & action centre | `/tasks/:previewId/edit` |
| Sales visits & activity | `/sales/activity` |
| Sales visits & activity | `/sales/activity/new` |
| Sales visits & activity | `/sales/activity/:previewId` |
| Sales visits & activity | `/sales/activity/:previewId/edit` |
| Customer & contact review | `/contacts/review` |
| Customer & contact review | `/contacts/review/new` |
| Customer & contact review | `/contacts/review/:previewId` |
| Customer & contact review | `/contacts/review/:previewId/edit` |
| PDF & email templates | `/documents/templates` |
| PDF & email templates | `/documents/templates/new` |
| PDF & email templates | `/documents/templates/:previewId` |
| PDF & email templates | `/documents/templates/:previewId/edit` |
| Saved & favourite reports | `/reports/saved` |
| Saved & favourite reports | `/reports/saved/new` |
| Saved & favourite reports | `/reports/saved/:previewId` |
| Saved & favourite reports | `/reports/saved/:previewId/edit` |
| Report packs | `/reports/packs` |
| Report packs | `/reports/packs/new` |
| Report packs | `/reports/packs/:previewId` |
| Report packs | `/reports/packs/:previewId/edit` |
| New sales order | `/sales/drafts/orders/new` |
| Edit sales order draft | `/sales/drafts/orders/:previewId/edit` |
| New invoice draft | `/sales/drafts/invoices/new` |
| Edit invoice draft | `/sales/drafts/invoices/:previewId/edit` |
| New expense / service bill | `/purchases/expense-bills/new` |
| Edit expense bill draft | `/purchases/expense-bills/:previewId/edit` |
| Customer receipts | `/sales/receipts` |
| Allocate customer receipt | `/sales/receipts/new` |
| Customer receipt detail | `/sales/receipts/:previewId` |
| Customer refunds | `/sales/refunds` |
| New customer refund | `/sales/refunds/new` |
| Customer refund detail | `/sales/refunds/:previewId` |
| Supplier refunds | `/purchases/refunds` |
| New supplier refund | `/purchases/refunds/new` |
| Supplier refund detail | `/purchases/refunds/:previewId` |
| Document recycle bin | `/sales/recycle-bin` |
| Import bank statement | `/banking/import` |
| Categorise, match & split | `/banking/workbench` |
| Opening balances | `/accounting/opening-balances` |
| Cash flow | `/reports/cash-flow` |
| Sales analysis | `/reports/sales-analysis` |
| Purchase analysis | `/reports/purchase-analysis` |
| Payroll summary | `/reports/payroll-summary` |
| Banking summary | `/reports/banking-summary` |
| Data import & export | `/tools/import-export` |
| Document preview & delivery | `/documents/delivery` |
| Business attachments | `/documents/attachments` |
| Document capture & review | `/documents/capture` |
| Business record search | `/search/records` |
| Financial year, GST & branding | `/settings/financial` |
| Sales settings | `/settings/sales` |
| Purchase settings | `/settings/purchases` |
| Payroll settings | `/settings/payroll` |
| Report settings | `/settings/reports` |
