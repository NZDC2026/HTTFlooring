> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

> Follow-up: [Physical supplier returns](SUPPLIER-RETURNS.md) now connects confirmed credits to inventory dispatch and atomic reversal.

> Follow-up: customer store/accounting-contact snapshots and area-to-pack entry are connected. [Sales document output](DOCUMENT-OUTPUT.md) now provides immutable local printable versions and email preparation.

# Direct sales and expense documents — 2026-10-17

## Delivered workflow

Direct order/invoice and expense/service bill pages now use trusted, persisted local repositories. Sales and Purchases overview pages expose their draft registers and new-document entries; Inventory exposes sales dispatch. The page directory marks these connected workflows as local business data.

Drafts save independently of posted ledgers. They support revisions, editing, approval, reasoned reopening and cancellation. Approved drafts are immutable until reopened. Confirming a direct order creates a canonical sales order without requiring a quote. Issuing a direct invoice creates a linked canonical order and invoice with one AR/revenue/tax journal. Existing order-to-invoice conversion also preserves the managed origin. Posted documents are corrected through the ordinary source reversal workflow, rather than edited in place.

Draft prices, tax rates, posting-account IDs and tax-report labels are snapshotted. Posting does not reprice from today's tax master. Default terms, numbering and inclusive/exclusive pricing use financial settings. References, active parties, active products/units and posting accounts are revalidated before posting. Duplicate creation operation IDs cannot create another draft; conflicting requests are rejected. Repeated posting returns the original posted document. Stale revisions and duplicate supplier invoice references are rejected.

## Inventory dispatch

Issuing a stock invoice alone does not move stock. Its linked order appears in Inventory → Sales dispatch & fulfilments. Dispatch records stock quantity, inventory valuation and COGS together. Already-invoiced orders remain INVOICED while retaining their fulfilment progress. Partial dispatch, insufficient-stock protection, retry protection and reasoned reversal use the existing costing engine.

Warehouse users receive only order numbers, SKUs, descriptions, units and quantities in the dispatch projection. They can record dispatch under inventory permissions without receiving selling prices, tax totals or inventory cost snapshots. Reverse an active invoice before reversing its dispatch; an order cannot be cancelled while active invoices or fulfilments remain. The legacy quote conversion and fulfilment workflows remain available.

## Expense/service bills

Expense lines use descriptions, positive quantities, net or inclusive costs, configured tax codes and active manual expense accounts. They post Dr expense / Dr input tax / Cr AP. They neither receive inventory nor clear GRNI. The posted bill appears in the existing AP, supplier statement, payment/batch and report flows. Source credits reverse the original expense account and original tax snapshot, rather than inventory or purchase price variance; unused credits can be refunded through the supplier refund workflow.

Purchasing users can save expense drafts and post them after accounting approval; they cannot approve their own work using purchasing permission alone. Accountants and finance administrators use the existing accounting approval permissions. Approved drafts cannot be changed by the posting user. Paid or credited bills must have their downstream transactions reversed before source voiding. Actual payments remain local ledger records; no external transfer, bank feed, email or backend connection is introduced.

## Persistence, security and validation

Schema 7 adds managed sales drafts, expense drafts and dispatch requests. Old profiles/backups migrate with empty new registers; pre-migration snapshots are preserved. New snapshot validation checks totals, party/product/account references and canonical posted-source links. Internal canonical insertion methods are not exposed as desktop commands. Trusted actor IDs, audit intent/outcome, period controls and the main host's atomic commit/rollback/restart handling cover all new mutations.

Isolated automated acceptance covers draft editing/reopening/cancellation, sales and expense approvals, direct invoice/order links, immutable tax snapshots, normal receipts/payments and reversal guards, expense credits/refunds, dispatch/COGS and restoration, warehouse data filtering, insufficient stock, closed periods, stale writes, duplicate references, failed GL rollback, restart, invalid backups and schema-6 migration. A combined lifecycle reconciles AR, AP and inventory to GL and passes the financial consistency audit.

Native Electron acceptance used disposable synthetic data: a 110.00 direct invoice was saved, approved, issued and dispatched for one base unit; a 55.00 service bill (50.00 net + 5.00 tax) was saved, approved, posted and opened in the canonical AP detail page. No actual business profile was used for acceptance.

Production build passes. Full suite: 63 test files, 738 tests passed. The delivery response confirms the final run in the actual project directory.

## Boundaries

This completes the local direct-document workflow. It does not add non-stock sales catalogue types, physical supplier returns, physical multi-company customer hierarchy or external integrations. Those remain separate development items. Draft cancellation preserves history; posted invoice/bill corrections preserve originals and reversing journals.
