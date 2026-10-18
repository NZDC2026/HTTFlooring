# Saved & favourite reports — 2026-10-18

Saved report definitions now execute against current main-owned local books. No independent backend or snapshot schema change is required.

## Behaviour

- Sales and Purchases use the canonical net document activity, including dated credits and voids. Drafts and opening balances are excluded; settlement does not change recognised document amounts.
- Banking uses dated bank journal movements and opening adjustments, including inactive historical accounts. Currency and bank filters are explicit. Filtered movement totals are not closing balances.
- General ledger retains original and reversal lines on their respective dates, with account filtering.
- Explicit inclusive dates, literal text search, dataset-specific contact/bank/account filters, and ordered allowlisted columns are saved. Text search includes hidden source fields. No expressions or SQL are evaluated.
- Sales, Purchases and General ledger use accrual basis; Banking uses cash basis. Unsupported basis combinations are rejected.
- Favourites are shared business definitions. Definitions and edit history persist across restart. Old free-text filters remain restorable but must be reviewed and saved as structured filters before execution.
- Main-owned execution accepts only definition ID and expected revision, verifies accounting.read and active status, builds from authoritative repositories, and records the trusted actor in the audit log. Editing requires accounting.post; auditors may run and export.
- Results are copied previews with 50-row pagination and source links. Changed books or definitions display a stale-result notice. Refresh explicitly reruns the definition. Leaving the page discards the preview; export CSV to retain a run.
- CSV includes all pages, selected columns in saved order, context and totals. Numeric negative amounts remain numbers; formula-like user text is escaped.

## Verification

20 new tests cover dataset execution, credits, voids, reversals, hidden-field search, ordered columns, filtered bank transfers, invalid inputs, safe CSV, all-page export, role enforcement, stale revisions, persistence, audit and legacy restore compatibility. Build and full suite results are recorded with delivery. This phase does not claim a new native desktop visual acceptance pass.
