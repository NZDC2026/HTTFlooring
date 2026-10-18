## Business record search integration — 2026-10-18

Business record search now uses current permission-filtered local records across 11 categories, with literal search, type/status/date filters, pagination and source navigation with a return link. See [RECORD-SEARCH.md](RECORD-SEARCH.md) for supported fields, scope and verification.

## Saved report business integration — 2026-10-18

Saved & favourite reports now run real Sales, Purchases, Banking and General ledger datasets with structured filters, ordered columns and complete CSV exports. See [SAVED-REPORTS.md](SAVED-REPORTS.md) for scope, permissions, compatibility and validation.

> Follow-up: [Management report packs](REPORT-PACKS.md) generates selected current financial reports with ordered sections, CSV and printable HTML/PDF output.

> Follow-up: [Net document analysis](NET-DOCUMENT-ANALYSIS.md) includes sales/purchase credits and dated void reversals with contact summaries and filtered export.

> Follow-up: [Cash reports](CASH-REPORTS.md) replaces cash-flow sample figures and the limited banking analysis with dated local bank ledger reports. Historical preview notes below describe the earlier baseline.

# Requirements-driven static page completion

Date: 2026-10-16

## Scope and result

The gaps identified against 完整系统功能需求与开发周期评估.xlsx (管理财务端需求 rows 2–55, with 完整功能需求 and shared rules cross-checked) now have management/finance static interfaces. Added 103 route patterns, bringing the registered inventory from 90 to 193. List/detail/new/edit patterns reuse one configurable implementation and are not counted as independent business features.

Entry: sidebar → Page directory (`/workspace`). New payroll, documents and settings screens are also linked in their module navigation; report previews are linked from Report library. Existing quote and payment dialogs count as existing UI coverage.

## Added registers

| Workspace | Base path | Screens / contents |
|---|---|---|
| Products & services | `/inventory/products` | List, new, detail, edit; Overview, Units & conversion, Buying & selling, Reorder & stock. Maintain purchasing, selling, stock and packaging information. |
| Scheduled promotions | `/inventory/promotions` | List, new, detail, edit; Overview, Price comparison, History. Plan customer and product specials with explicit start and end times. |
| Tax codes | `/accounting/tax-codes` | List, new, detail, edit; Overview, Calculation preview, Reporting. Review GST codes, inclusive/exclusive calculation and reporting mappings. |
| Linked accounts | `/accounting/linked-accounts` | List, new, detail, edit; Overview, Posting example. Preview default general ledger mappings used by each business process. |
| Jobs & projects | `/accounting/jobs` | List, new, detail, edit; Overview, Transactions, Profitability. Track project budgets, assigned contacts and sample profitability. |
| Bank account setup | `/banking/setup/accounts` | List, new, detail, edit; Overview, Feed settings, Import history. Preview bank account details, ledger links and feed preferences. |
| Bank rules | `/banking/rules` | List, new, detail, edit; Overview, Test rule, History. Define matching conditions and resulting categorisation before testing a sample. |
| Electronic payment batches | `/banking/payment-batches` | List, new, detail, edit; Overview, Payments, Approval & export. Select sample supplier or wage payments, review approval and bank export layout. |
| Pay items | `/payroll/pay-items` | List, new, detail, edit; Overview, Employee assignments, Posting preview. Configure sample earnings, allowances, deductions, leave, tax and employer contributions. |
| Payroll filing | `/payroll/filing` | List, new, detail, edit; Overview, Employees & validation, Submission & response. Review a sample NZ Payday Filing submission and its response / correction workflow. |
| Recurring transactions | `/automation/recurring` | List, new, detail, edit; Overview, Template lines, Run history. Prepare templates, schedules, generated-item previews and failure recovery. |
| Tasks & action centre | `/tasks` | List, new, detail, edit; Overview, Notes & attachments, Status history. Review due and overdue work, assign owners and retain preview status history. |
| Sales visits & activity | `/sales/activity` | List, new, detail, edit; Overview, Notes & tasks, Audit trail. Inspect sales visits, check-in/out times, outcomes and follow-up tasks. |
| Customer & contact review | `/contacts/review` | List, new, detail, edit; Overview, Duplicate comparison, Sync & review history. Review incoming customer/contact drafts, field mapping, duplicates and sync exceptions. |
| PDF & email templates | `/documents/templates` | List, new, detail, edit; Overview, PDF preview, Email preview. Design sample invoice, quote, PO, statement and remittance layouts and email copy. |
| Saved & favourite reports | `/reports/saved` | List, new, detail, edit; Overview, Report preview. Choose datasets, columns and filters, then save a sample report or mark it as a favourite. |
| Report packs | `/reports/packs` | List, new, detail, edit; Overview, Cover & contents, Combined preview. Compose financial reports, order sections and preview a cover and table of contents. |

## Additional workflows

| Screen | Route |
|---|---|
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

## Settings

| Screen | Route |
|---|---|
| Financial year, GST & branding | `/settings/financial` |
| Sales settings | `/settings/sales` |
| Purchase settings | `/settings/purchases` |
| Payroll settings | `/settings/payroll` |
| Report settings | `/settings/reports` |

## Existing pages extended

- Employee form/detail: sample bank account, tax identifier, retirement contribution rate, annual leave hours and pay cycle.
- Timesheets: job and pay item selections plus register columns.
- Module/search navigation and Report library expose new screens.
- New registers support search, status filters, sorting, column selection, pagination, sample bulk archive, sample CSV export and empty states. This does not retrofit every existing financial table with every advanced table function.

## Preview boundaries

- All new records/settings use a separate in-memory preview store. Reload resets them. Existing Repository/Service/Mock and financial persistence remain unchanged; no independent backend was added. Preview routes have role checks; product cost controls are hidden for non-accounting preview roles; only ADMIN sees sample purge controls. These are frontend checks on sample data, not new server authorization.
- Cash flow and operational reports show fixed illustrative figures, not ledger-derived business reports. Date controls change the preview period label; display filters select sample rows. Existing financial reports remain unchanged.
- Bank import and CSV import read local CSV for preview only. Mapping, malformed CSV, duplicate/email/SKU validation and error/result screens are provided. No bank feed, repository import or business duplicate matching runs.
- Draft document lines show sample GST totals and unit quantities; saved samples do not create/fulfil/post financial documents. Receipts/refunds and batch payments do not move or allocate money.
- File attachments store sample metadata only. Capture displays illustrative extracted values, corrections and draft handoff; no OCR service runs. Templates, document/email previews, filing responses and report packs are presentation flows; there is no real email, tax submission or generated combined PDF. Printable output is explicitly sample HTML; bank batch export is explicitly a non-bank sample CSV. Existing statement PDF export is retained.
- Jobs, linked accounts, tax codes, promotions and payroll settings do not modify the existing posting, price or payroll engine. No automatic scheduler is started.
- The known supplier-credit inventory/GL $20 reconciliation finding is outside this static-page patch and remains unresolved.

## Scope excluded from this completion

Separate sales app and customer portal UI are not implemented by this management patch. The management app includes sales visit/activity and incoming customer/contact review layouts as its receiving surfaces. Maps, mobile check-in/out, business card scanning, phone contacts and offline sync UI still belong to those separate applications. Time Billing / Activity Billing and Fixed Assets are excluded from V1 in the requirements.

## Verification

- Build: successful; existing bundle size warning remains.
- Automated tests: 58 files / 629 tests passed (includes 103 route render cases, preview validation/CSV/allocation/math tests, and role/cost/purge visibility cases).
- Desktop: all 103 added patterns were opened via real Electron navigation and their accessibility content checked; 25 representative screenshots reviewed at default desktop size. List/new/detail/edit variants share layout components. This is not a claim of exhaustive screenshots of all 193 routes or all statuses.
- Narrow desktop: 1100×700 window checked for invoice header/lines, OCR stacked layout, employee bank/tax/retirement form and tax-code mappings. Fixed collapsed line selectors with minimum widths; wide line tables scroll within their own panel. Test-only window-size changes were restored and are absent from the patch.
- No real payment, financial posting, purge, tax submission, email or import was performed during UI checks.
