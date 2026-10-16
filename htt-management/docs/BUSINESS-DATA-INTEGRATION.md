> Latest follow-up: [Finance foundation](FINANCE-FOUNDATION.md) connects financial settings, tax account/report snapshots and reconciled opening-balance import. Older scope notes below describe their earlier baseline.

> Follow-up: [Finance closure](FINANCE-CLOSURE.md) implements receipts, refunds, bank statement processing and supplier payment batches, and corrects the permissions and supplier-credit posting described in the earlier baseline below. Historical credits use the controlled repair workflow.

# Local business data integration — 2026-10-16

This change follows the completed static-page baseline. It uses the existing Electron-main Repository/Service architecture and local checksummed snapshots. There is no independent backend or new external connection. It does **not** mean every preview workflow is now operational.

## Connected behavior

- Products: real catalogue list/detail/create/edit, unique SKU and base-unit validation, optimistic revisions, active-unit checks, buy/sell availability and whole-pack restrictions for box/roll/bucket units. New products receive costing policies without inventing stock. Referenced base units and conversions cannot be rewritten. Historical document snapshots remain unchanged.
- Promotions: persisted product/unit/customer scope, explicit timestamp offsets, start-inclusive/end-exclusive eligibility, deterministic priority, customer-price-first/promotion-first/lowest-price policies, and manual-price precedence. Date-only documents evaluate at 00:00 UTC on their document date. This is not a wall-clock timer that reprices existing documents.
- Tax codes: configured rates feed sales and purchase creation. Quote/PO previews use the same rates. PO rates are copied to supplier bills and inherited by supplier credits. Customer credits are recalculated in main from the original invoice line and its historical rate; supplied prices/totals cannot override those snapshots. Duplicate credit lines and quantities exceeding original quantities are rejected.
- Migration preserves the previous engine's GST 10% and ZERO 0% defaults; no statutory rate is inferred. Documents use tax-exclusive prices and global GST control accounts. Different tax codes do not yet support separate GL accounts.
- Linked accounts: actual system-role lookups use the saved mapping. Used posting accounts cannot be remapped without a ledger migration. Linked accounts retain control-account protections against deactivation/type changes.
- Tasks: real customer-linked records, due dates, owner IDs, priorities, notes, completion and change history. Completion actor/time come from the trusted main session. Due tasks appear in Dashboard alerts. Task ownership currently uses a user-ID field, not a user directory selector or per-owner access policy.
- Dashboard inventory health: actual active stocked products and summed stock quantities across sites replace the illustrative 100-SKU distribution. Reorder points determine low-stock counts. Target stock is stored metadata; it does not generate purchase orders.
- Sales invoice / supplier bill / manual bank transaction analysis: local source data, date/search filters, source links, filtered CSV, and explicit reporting scope. Invoice totals exclude credit notes. Bank analysis excludes settlements/transfers; existing account-ledger reports retain those entries. These screens are not new reconciled financial statements.
- Bank rules: persisted conditions and case-insensitive matching against posted bank transactions. Matching is a review suggestion; it does not rewrite journals or automatically post imported statement lines.

## Persistence and security

Database schema 4 adds products and workspace repositories. Existing schema 1/2/3 files migrate with a preserved pre-migration copy. Restoring an older backup uses original new-module defaults, not the current profile's newly entered configuration. New repository schemas/references are checked before backup replacement. Writes pass through the existing permission check, audit intent, rollback and atomic-commit boundary. Tests use disposable temporary profiles; user business records were not changed during acceptance.

## Registers that save data but have no execution engine yet

Jobs/projects, document/email templates, saved/custom report definitions and report-pack definitions save and restore actual records/history. They do not yet allocate transactions to jobs, render templates, deliver emails, execute arbitrary reports or assemble report-pack PDFs. The UI labels these limits. The settings repository contract is reserved; existing settings preview pages remain previews.

## Remaining preview workflows and known limitation

Direct sales-order/invoice draft creation, expense/service bills, the consolidated customer-receipt screen, customer/supplier refunds, opening-balance wizard, bank-account setup, statement import/splitting, electronic payment batches, recurring generation, visits/contact review, attachments/OCR/delivery, payroll pay-item/filing/summary, cash-flow statement and business settings still need integration. Existing invoice receipt/allocation, PO receiving/billing and bank-account-ledger workflows remain available in their original modules.

A previously identified supplier-credit limitation remains: supplier credit GL posting credits inventory, but has no corresponding inventory-cost movement. For example, a net 20 supplier credit can leave a 20 difference between inventory valuation and GL. Physical supplier returns and price-only cost adjustments need explicit inventory/cost treatment before that lifecycle can be accepted as reconciled. This patch fixes inherited credit tax rates; it does not resolve this pre-existing inventory-cost discrepancy.

## Verification

- `pnpm build`: passed (TypeScript + production renderer, Electron main and preload bundles).
- `pnpm test`: 60 files, 646 tests passed.
- With the shared dependency installation, checks ran using `pnpm_config_verify_deps_before_run=false`; no dependency installation or lockfile change was needed.
- New integration coverage exercises trusted-host product persistence/restart, stale writes, duplicate SKUs, used-unit protection, promotion windows/manual prices, tax changes and historical documents, PO/receipt/bill/credit rates, task completion/audit/restart, permission denial, failed-command rollback, malformed backup rejection, schema-3 migration and old-backup restore, actual bank reporting/rule matching, linked-account guards, pack/availability controls, credit quantity/price validation and new-product costing policy creation. Inventory-health tests cover multiple sites, reorder boundaries, inactive/service exclusions and empty data.
- Native Electron checks used a copied synthetic local profile: migration/login, product list/detail/edit layout and a sales analysis page showing actual local invoices. This is targeted desktop acceptance, not a new claim that every route was visually rechecked.

## Delivery

Changes are applied to the existing project directory. The increment ZIP contains only new/modified source, tests and this document relative to the business-integration starting baseline. It excludes dependencies, generated bundles, business profiles and unchanged project files.
