> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Historical bank statement matching

Imported statement candidates, matching and reconciliation now use the same dated journal evidence as manual reconciliation, period close and recovery. An original journal reversed on a later financial date can match its genuine earlier cash movement only before that reversal date. Both sides must retain the exact linked reversal evidence; missing or inconsistent evidence does not qualify.

Reconciliation rechecks each imported match on its own transaction date. A subsequent statement can therefore clear the actual later reversal without invalidating the already-cleared earlier receipt. Existing clearing, internal correction exclusions, amounts, period restrictions and source journal write permissions remain enforced. No journals or historical reconciliation totals are rewritten.

Regression verification reproduces the previously rejected historical candidate, completes both imported statements, restarts persistence, checks period-close bank evidence, confirms journals are unchanged, and rejects reuse of the reversed original on its reversal date. Existing bank close and statement correction suites are also included in verification.
