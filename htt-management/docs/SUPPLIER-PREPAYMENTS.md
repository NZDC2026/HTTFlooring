# Supplier advances and prepayments — 2026-10-20

Purchases → Supplier prepayments (`/purchases/prepayments`) supports advances before a bill exists, applying funds to later bills for the same supplier, receiving unused funds back and explicitly dated reversals. Register, new payment, detail, event history and asset reconciliation pages use trusted local repositories, persistent audit and atomic snapshots. No live bank transfer or independent backend is added.

## Accounting and integration

One-time finance setup creates a dedicated non-manual ASSET account. Advance payment debits this account and credits an active bank. It creates no supplier bill, AP, inventory or expense. Application debits AP and credits the advance asset; it creates an owner-marked internal bill settlement and updates the normal bill paid/due amounts. This settlement participates in supplier statements, aged AP and AP-to-GL reconciliation without creating a second bank payment. Supplier payment details identify the prepayment owner and route reversal there. Remaining bill balances can still be paid through normal payments and payment batches.

An unused-funds return debits the receiving bank and credits the advance asset; it can use a different active bank. Cash reports include actual advances in supplier cash out and returned funds in supplier cash in. Noncash applications do not appear as bank cash. Existing bill/credit tax and expense recognition remains unchanged. Purchase-order earmarking, FX, forfeiture and special tax treatment are outside this implementation.

## Controls

Posting and reversal require `purchases.payment` (ADMIN / FINANCE_ADMIN); reads require `purchases.read`; setup requires `accounting.post`. Renderer IPC cannot call internal settlement helpers. Direct ordinary-payment reversal cannot bypass the prepayment owner. Source-owned journals retain the existing direct-post/reverse prohibition. Active supplier, bank opening dates, bill supplier/date/due amount, available advance balance, closed periods, bank statement matches and completed reconciliations are enforced.

Applications and fund returns must be reversed before their original advance. Historical dated-balance checks prevent spending funds that only became available after a later reversal. Stable operation IDs prevent duplicate payment, application or fund-return entries across restart. Injected posting and reversal failures roll back bills, payment records, journals and prepayment events together.

Schema 19 adds `supplierPrepayments`; schema 18 and earlier profiles migrate with an empty register and retained existing records. Backup validation checks request fingerprints, source ownership, dedicated account references, exact AP/payment allocation links, original and reversing journals, status metadata, unique operations and historical balances.

## Reconciliation and close

`/accounting/reconciliation/prepayments` compares dated receipt/application/return balances with each dedicated asset GL account. The report library and prepayment register link to it. It identifies wrong sources/accounts, orphan records/journals and reversal errors, including zero-total-difference exceptions. Finance-control totals and overall status include the result. Trusted period close runs the same check at period end; review links preserve that date. No balancing journal is generated automatically.

## Acceptance

Integration tests cover the full lifecycle, AP/GL history, restart retries, ownership and permission denials, closed periods, bank locks, rollback, backup corruption, schema-18 migration, payment-batch completion, cash reporting and close/dashboard failures. Native acceptance uses an isolated synthetic profile: a 200 advance, 150 bill application reducing due from 220 to 70, 50 unused-funds return, zero-difference asset reconciliation, then reversal of the fund return restoring 50 available. No production business profile is used.
