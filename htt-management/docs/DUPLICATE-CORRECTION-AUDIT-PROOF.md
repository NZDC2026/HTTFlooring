# Duplicate correction audit proof

The shared duplicate-correction recognizer now uses the same journal lifecycle evidence as bank matching and reconciliation. The canonical posting, reversed duplicate and offset must all have valid, unambiguous lifecycle ownership. Conflicting claims, an offset with duplicate line identities, invalid reversal timestamps, and invalid financial dates cannot qualify as an internal correction.

An invalid marked pair remains visible to duplicate-source and reversal auditing. This also makes the existing snapshot validator reject the pair even when its checksum, approval metadata and journal cache agree. Recovery preview cannot approve a no-local-effect cancellation while this financial inconsistency remains; the unresolved operation continues to block financial writes. No entries, completed approvals or reconciliation totals are automatically changed.

Regression tests first reproduce five previously unreported invalid pairs, then verify audit codes, read-only inspection, rejected backup previews without replacing the current file, blocked cancellation proposals, retained unresolved-operation guards, and normal independent duplicate repair/restart/idempotency compatibility. No persistence schema change or external service is required.
