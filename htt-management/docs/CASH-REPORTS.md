# Cash movements and banking summary

Entry: Report library → Cash flow · bank ledger / Banking summary.
Routes: `/reports/cash-flow` and `/reports/banking-summary`.

Both reports now read the authorized local bank and journal snapshots. Cash flow replaces the fixed illustrative table. Banking summary replaces the earlier manual money-in/money-out-only analysis. Receipts, supplier payments, customer/supplier refunds, manual bank journals, statement categorisations and dated reversals are included once through their bank GL lines. Noncash invoices and bills do not become cash flows.

Select valid inclusive dates, currency and all accounts or one account. Inactive accounts retain their history. Different currencies are never summed. Opening, period net change and closing reconcile to the existing bank register. Originals marked REVERSED remain in their original period; reversing entries affect their own posting dates. Account setup opening balances are dated adjustments, including negative balances; future opening balances do not leak into earlier periods. Opening-balance journals are identified separately from receipts. Pre-opening ledger activity follows the existing register exclusion and is flagged for setup review. Duplicate bank GL mappings block calculation rather than count cash twice.

Cash movement groups follow source types: customer receipts/refunds, supplier payments/refunds, opening adjustments, transfers and other movements requiring review. Internal transfers are netted per journal across selected accounts. Transfers crossing a selected boundary remain visible. Individual account and detail tables retain gross movements, including both transfer sides. Operating/investing/financing classifications are not inferred from arbitrary offset accounts. This is a reconciled bank ledger working paper, not a completed statutory cash flow statement; unconfigured cash equivalents and FX translation are outside its scope.

The detail table paginates at 50 lines and links to original journals. CSV contains the current period/currency/account context, reconciliation, source groups, account balances, all detail pages and review notes. Export reuses existing local file handling and spreadsheet formula protection. Report calculation does not modify books or introduce a new persistence schema, repository or backend. Existing trusted snapshot permissions continue to keep journals and bank data from sales/warehouse roles.

Automated tests: 14 focused calculation cases plus 5 real BusinessHost integration cases cover cents, date boundaries, both payment/refund directions, cross-period reversals, transfer elimination and selection, negative/future opening balances, multiple currencies, invalid/duplicate mappings, statement splits, noncash exclusion, original-register agreement, restart, unchanged persisted books and read-only role filtering.

Native Electron acceptance used a disposable synthetic profile: all-account closing 3220.00, operating-account closing 3215.00, a 5.00 transfer shown only across the selected boundary, zero reconciliation differences, report-library navigation, journal drill-down and successful CSV save/content verification. Both page layouts were visually reviewed at the default desktop size. Actual business profiles were not used. Narrow-window and exhaustive state visual acceptance were not part of this run.

See the delivery message for final production build and full-suite results in the actual project directory.
