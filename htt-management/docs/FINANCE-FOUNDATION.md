> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

> Latest follow-up: [Direct documents](DIRECT-DOCUMENTS.md) connects direct sales orders/invoices, expense/service bills and sales dispatch to the persisted local business engine.

# Finance foundation — company/tax settings and opening balances

## Connected settings

Company name/contact details, base-currency display, business timezone, financial year end, default tax code, manual inclusive/exclusive entry basis, invoice terms and document-number prefixes/minimum sequences now save through the trusted local business host. The company name appears in navigation, Dashboard and report context; currency formatting uses the configured base currency. New business dates use the configured timezone; P&L defaults to the configured financial-year start. Existing posted numbers are retained and new sequences scan existing numbers to avoid reuse. New invoice due dates use configured terms.

Existing financial profiles cannot simply change their base currency: bank accounts or postings lock that field. This patch does not perform FX conversion or create a separate currency profile. Catalogue prices and stored unit costs remain net. New manual quote prices and new PO costs use the selected inclusive/exclusive basis; existing PO edits use explicit net costs. Historical invoice/bill tax rates, accounts and report mappings are retained in line snapshots; credits use their original source amounts/rates rather than today's tax code. Inclusive cent rounding is preserved, including five-cent examples.

Tax codes can use dedicated active input/output tax accounts of the correct type. AR/AP, inventory, GRNI and bank control accounts cannot be used as tax mappings. Mapped accounts are protected against unsafe changes. Default tax codes cannot be deactivated and referenced codes cannot be renamed. Existing defaults retain GST 10% and ZERO 0%; no statutory rate is inferred or silently substituted.

The document tax summary groups invoices, bills, credits and dated void reversals by saved report mapping. It is an accrual document working paper; manual tax journals and bank categorisations must also be reviewed in GL. It is not a statutory tax return or electronic filing integration. Bank statement categorisations use the configured tax posting accounts.

## Opening-balance workflow

Entry: Settings → Opening balances, or `/accounting/opening-balances`.

1. Download the CSV header template and expand the column guide for actual account/contact/bank/product/site IDs.
2. Supply GL rows (balanced balance-sheet trial balance), AR/AP outstanding references, bank details and base-unit stock quantities/net costs. Negative AR/AP amounts create unused historical customer/supplier credits. The template accepts GL, AR, AP, BANK and STOCK row kinds, plain decimals and YYYY-MM-DD dates.
3. Choose a cutover date after existing ledger and inventory activity, enter a reason, and validate/preview before posting.
4. Posting revalidates all references and control totals in the main process. AR/AP detail must match their GL controls, stock value must match inventory GL, and bank details must match bank GL. Existing AR/AP/inventory differences and stock/cost quantity differences block import with an explanation.
5. The batch posts atomically. Historical outstanding invoices, bills and credits can then use normal receipt/payment, allocation and refund workflows. Original document dates/references are retained; ledger and subledger recognition starts at cutover, preserving original due dates for aging. Opening amounts do not recognize sales, purchases or GST again; historical tax balances belong in the imported GL rows. Opening invoices/bills are excluded from the operational sales/purchase analysis.

This is an additive migration of balances not already recorded, not an overwrite/reset tool. Do not import balances already represented by existing transactions. One active opening batch is permitted. Matching operation-ID retries return the original result; changed requests using the same ID are rejected. Duplicate references, invalid dates, mismatched details, closed periods, unknown rows and malformed CSV are rejected before partial state can survive. Failed posting rolls back documents, journals, stock and costing together.

An unused batch can be reversed as a whole with an open-period date and reason. Original records, reversing journals and dated stock/cost movements are retained. Subsequent accounting/inventory activity, active allocations or reconciled bank entries block that correction path; downstream corrections then use their ordinary workflows. Individual opening documents cannot bypass the batch correction boundary.

## Persistence, audit and acceptance

Schema 6 adds an opening-batch register; older snapshots migrate with an empty register and retain a pre-migration copy. The same registered-reference validation applies to backup/restore. Permissions, actor identity, audit intent/outcome, atomic persistence and restart recovery remain main-owned.

Native Electron acceptance used isolated synthetic profiles: real company/terms saving, rejection of an old sample with existing GL differences, then a balanced 16.00 trial balance with AR 10.00, AP 6.00, inventory 4.00 and bank 2.00 posted successfully in the UI with source journal links and history. Actual business profiles were not used for acceptance.

Automated coverage includes settings persistence/stale writes, numbering, terms, timezone boundaries, fiscal-year defaults, tax mappings and historical credits, inclusive rounding for sales/purchases, opening positive/negative balances, subsequent settlement, AR/AP/inventory reconciliation, bank/stock detail checks, retry protection, malformed CSV, failed-mid-batch rollback, dated reversal, closed periods, permissions, corrupt backup references and schema-5 migration.

Final validation: production build passes; 62 test files / 703 tests pass. See the delivery response for the actual project-run confirmation.
