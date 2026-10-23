> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Verified bank operation recovery

The financial recovery workbench now supports BANK_TRANSACTION (money in/out) and BANK_TRANSFER alongside existing Sales cases. The main process owns inspection, evidence and independent approval through the existing salesRecovery command boundary. Authenticated actor substitution, accounting.recover permission and command rollback remain shared with Sales recovery; internal command names are preserved for compatibility.

Closure requires an existing unique bank result and exactly one linked POSTED source journal. The saved intent must match the result's accounts, direction, amount, date, description and reference. Journal accounts, two exact debit/credit lines, totals, date and metadata must match. Transfers require distinct banks and GL accounts, matching currency and valid opening dates. Duplicate identity, another operation claiming the result, missing result, unreadable intent and reversed effects remain blocked. Current financial consistency checks run again on approval.

The reviewer must provide all four evidence confirmations. A different authorized account approves the current revision; submitted actor names cannot override the authenticated identity. Closure updates only the operation journal and audit history. It never posts, reverses or replays financial transactions. Other unresolved operations retain their own write/period-close blockers. BANK_RECONCILIATION is now supported with its own clearing and statement proof; see RECONCILIATION-RECOVERY-ACCEPTANCE.md. Legacy PAYMENT_REVERSAL remains unsupported.

Automated acceptance covers money in, money out, transfer, independent identity, stale/repeated approval, incomplete evidence, wrong accounts/direction/amount/date/link, missing/duplicate/reversed journals, mismatched intent, role access, rollback, corrupt storage, restart durability and release of the resolved write/close blocker. Existing Sales recovery acceptance remains applicable.

Desktop acceptance used a disposable local profile: a FINANCE_ADMIN independently approved an existing BANK_TRANSFER result, the unresolved count fell from 1 to 0, and history displayed COMPLETED with distinct reviewer/approver identities and approval reference NATIVE-BANK-APP-001. No production business profile was used.
