> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Sales services and non-stock catalogue items

Products support STOCK, NON_STOCK and SERVICE. Existing records without a type remain STOCK. Services support hour/job units and fractional quantities; non-stock material items retain normal unit conversions. The catalogue exposes item type and disables inventory purchasing for sales-only items.

Quote edits, order conversion, direct documents, invoices, credit notes and printable snapshots retain the authoritative product type. Customers, prices, tax, receipts, credits, refunds and reversals use the existing local services and ledger. Referenced items cannot change type. Restored line types must agree with the referenced catalogue item.

Only stock lines enter dispatch, inventory balances or inventory cost movements. Mixed orders are fulfilled when their stock lines are dispatched. Service-only orders require no warehouse dispatch; invoice posting remains explicit and does not assert operational service completion. Non-stock sales create no inventory cost or COGS posting. Supplier service costs use existing account/description expense bills, not inventory purchase orders. Time tracking, service scheduling and project costing are outside this phase.

All writes retain main-owned permissions, period controls, audit and atomic persistence. No independent backend or external payments are introduced. Restart and legacy stock compatibility are covered by repository integration tests.

Validation: salesServices.test.ts covers catalogue/units, mixed dispatch, direct documents, quote conversion, fractional tax totals, receipts, credit refunds and reversals, procurement/costing guards, type tampering, referenced type locks, printable persistence, financial reconciliation and role restrictions. Run pnpm build and pnpm test for the current verified totals. Desktop visual acceptance is not included in these automated checks.
