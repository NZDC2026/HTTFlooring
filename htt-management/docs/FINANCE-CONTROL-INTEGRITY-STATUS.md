> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Finance control integrity status

The finance controls page now includes current posting-integrity audit results in the same control summary used for totals, overall status and badges. A posting issue or failed audit inspection makes the overall status require review even if all selected-date balances agree. This current integrity control remains independent of the reporting date, alongside the existing current recovery-operation control.

Bank register controls also require their dated register rows to have valid correction/reversal evidence. A zero bank-to-GL difference does not qualify a bank control as passed when evidence is marked for review. The page shows the number of affected ledger rows and retains the bank account link. Monetary balances and differences are unchanged; review counts are not fabricated accounting differences.

Checks are read-only and derived from existing data. Refreshing a clean audit removes only its own failure; other bank and recovery failures remain. No persistence schema, financial journal, saved reconciliation or recovery permission changes are introduced.

Regression coverage reproduces the previous zero-difference false pass and verifies review counts, earlier dated queries, restart persistence, valid later reversals, current audit failures on historical reports, audit inspection failures (including empty error messages), refreshed clean results, retained other failures and input validation.
