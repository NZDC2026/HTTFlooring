> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Bank reversal evidence

Bank statement matching, manual reconciliation, saved-statement proof, recovery and period-close checks share the same read-only journal lifecycle validation. A posted offset is eligible only with a unique reversed original, reciprocal links, an exact balanced opposite posting, matching source type/reference, a valid shared reversal timestamp, and ordered financial dates. The original remains eligible only before its proven reversal date; the offset becomes eligible on that date.

Ambiguous, incomplete or inconsistent pairs remain visible in the bank register with a review message and remain included in cash movement totals. They cannot be cleared, used as internal correction exclusions, or bypassed at bank period close by leaving a zero-net pair outstanding. There is no automatic rewriting, redating or reversal of historical entries, and no new backend or persistence schema.

Regression coverage includes orphan offsets, missing/duplicate owners, conflicting forward claims, incorrect owner status, sources, references and timestamps, unbalanced/negative/fractional postings, duplicate line identities, same-date reversal eligibility, historical matching, retained cash visibility and restart/close controls. Existing backup rejection of a missing original is retained; other accepted legacy conflicts load for review and cannot be cleared. Previously valid historical and same-date categorisation corrections remain supported.
