## Executable targeted bank repair

The recovery workbench now supports reviewed no-effect cancellation and isolated missing bank record/journal repair, with saved proposals, independent execution, rollback and schema-21 evidence. See [TARGETED-FINANCIAL-REPAIR.md](TARGETED-FINANCIAL-REPAIR.md) for supported cases and remaining limits.

## Purchase document output and complex exception guidance

Purchase orders and supplier remittance advice now support immutable local versions, templates, HTML/print/PDF preparation and scoped access under schema 20. The recovery workbench includes diagnostic steps and existing administrator backup/restore navigation. See [PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md](PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md) for exact scope and limitations.

## Financial recovery workbench — 2026-10-20

The existing recovery page now connects trusted live inspection, Sales reconciliation evidence, independent approval, verified closure and persistent history. Unresolved operation counts also affect finance-control status. No financial replay, automatic repair or schema change is introduced. See [FINANCIAL-RECOVERY-WORKBENCH.md](FINANCIAL-RECOVERY-WORKBENCH.md) for supported operations and remaining boundaries.

## Supplier advances and prepayments — 2026-10-20

Added connected advance-payment, bill-application, unused-funds-return and reversal flows, with dated asset reconciliation, finance-control status, bank locks and period-close checks. Schema 19 migrates earlier profiles with an empty register. See [SUPPLIER-PREPAYMENTS.md](SUPPLIER-PREPAYMENTS.md).

## Customer deposit liability reconciliation — 2026-10-20

Added a connected dated report, per-receipt and liability-account balances, source integrity exceptions, finance-control totals and trusted period-close blockers. Report and close review links preserve the selected date. See [CUSTOMER-RETURNS-AND-DEPOSITS.md](CUSTOMER-RETURNS-AND-DEPOSITS.md).

## Customer physical returns and deposits — 2026-10-20

Both workflows now have connected local registers, receipt forms, details, reversal, accounting, audit and persistence under schema 18. Customer returns restore original dispatched stock and cost, with a new or linked credit. Deposits remain liabilities until applied to invoices or refunded; applications do not create duplicate bank cash. See [CUSTOMER-RETURNS-AND-DEPOSITS.md](CUSTOMER-RETURNS-AND-DEPOSITS.md) for controls and supported scope.

## Personal preferences and truthful settings — 2026-10-20

`/settings/preferences` now persists per-account device display choices: authorized sign-in home, table density and reduced CSS motion. Preferences survive application restarts, remain outside business backups and business-storage hydration, and do not alter financial dates, document exports or other users. A home page is rechecked against current roles on sign-in; explicit deep links remain intact. System reduced-motion settings take precedence. Unsupported preview language/theme/date controls and the sample-data reset button were removed.

Role policy now displays the actual enforced permissions without a prototype disclaimer. Integration routes describe local accounting, AU payroll/STP boundaries, local document storage and document preparation, with authorized links. They no longer collect fictitious connection labels or schedules. Sidebar, company settings, workspace search and help link to these live pages. Earlier preview descriptions below are historical.

## Live document centre — 2026-10-20

The main document library (`/documents`), upload (`/documents/upload`) and detail (`/documents/:documentId`) now use the existing local attachment repository. `/documents/attachments` remains an alias of the same register. Native file selection saves bytes, links files to authorized business records and opens the saved document. Details expose actual versions, exports, preview, rename, recycle/recovery and scoped audit history. Read-only access hides maintenance actions. Missing or inaccessible legacy IDs show a neutral missing state. No sample document records are migrated into business data.

Earlier static-preview descriptions below are historical; this update supersedes their document-library/upload/detail claims. File limits, object authority and backup behavior remain governed by the attachment repository. PDF/Office files can be exported for viewing; automatic OCR and external storage are outside this local workflow.

## Australian local payroll lifecycle — 2026-10-19

Payroll pages now operate on persisted employees, pay items, approved hours/leave, reviewed AU PAYG/SG, calculation snapshots, payroll journals, recorded bank payments and reversals. Payslips, payroll summary and external filing review use real saved data under schema 17 and payroll-specific permissions. See [AU-PAYROLL.md](AU-PAYROLL.md) for supported calculation cases and external STP/SuperStream boundaries.

## Recoverable business document lifecycle — 2026-10-19

The document recycle bin now handles five real draft types with scoped access, reference checks, batch recycle/recovery, original-data retention, stale-command protection and persistent audit under schema 16. See [DOCUMENT-RECYCLE-BIN.md](DOCUMENT-RECYCLE-BIN.md).

## Master-data CSV import and export — 2026-10-19

Five master datasets now support mapped CSV intake, resolved-field previews, atomic commits, external-ID retry protection, token-checked updates, complete export and persistent audit receipts under schema 15. See [DATA-IMPORT-EXPORT.md](DATA-IMPORT-EXPORT.md) for limits, permissions and verification.

## Business attachments and real file versions — 2026-10-18

Attachments now persist real local file contents with object-scoped access, immutable versions, old-version restore, preview/export, recoverable recycle lifecycle and schema 14 backup migration. See [BUSINESS-ATTACHMENTS.md](BUSINESS-ATTACHMENTS.md) for file limits, permission inheritance and acceptance evidence.

## Project allocation and actual profitability — 2026-10-18

Jobs now support posted GL revenue/expense splits, inherited reversals, unallocated reconciliation, actual profit/margin, budget variances and full-row CSV export, with audited revision controls and schema 13 migration. See [JOB-COSTING.md](JOB-COSTING.md) for calculation rules, workflow and scope.

## Customer, branch and contact review — 2026-10-18

Customer review now receives manual/JSON drafts, validates and compares real master data, approves or links all three record types, rejects/reopens with reasons, and persists main-controlled history with schema 12 migration. See [CONTACT-REVIEW.md](CONTACT-REVIEW.md) for intake fields, authority, safeguards and verification.

## Supplier document review integration — 2026-10-18

Supplier document capture now supports manual/CSV intake, main-calculated source-total verification, duplicate detection and real expense draft creation under existing purchasing authority. Automatic image/PDF OCR and file-byte storage are not connected. See [SUPPLIER-DOCUMENT-CAPTURE.md](SUPPLIER-DOCUMENT-CAPTURE.md).

## Sales visits and linked follow-ups — 2026-10-18

Sales activity now supports persisted plans, trusted check-in/out, outcomes, cancellation, append-only notes and atomic linked follow-up task creation. Schema 11 migration and permission checks apply. See [SALES-VISITS.md](SALES-VISITS.md).

## Recurring invoice and expense draft integration — 2026-10-18

Recurring transactions now copy existing entry drafts into saved templates, generate one due occurrence into a real reviewable draft, retain run history and support pause/resume, retry protection and schema 10 migration. See [RECURRING-TRANSACTIONS.md](RECURRING-TRANSACTIONS.md) for calculation rules and scope.

## Notifications and task lifecycle — 2026-10-18

Notifications now display current overdue AR/AP and due tasks from local repositories. Task completion metadata is main-controlled and reopening clears it; changes persist with audit/history. See [ACTION-CENTRE.md](ACTION-CENTRE.md).

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
