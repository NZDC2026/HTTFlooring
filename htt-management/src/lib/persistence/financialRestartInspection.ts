import { financialOperationJournal, type FinancialOperationKind } from './financialOperationJournal';
import { financialStateStorage, type FinancialSnapshot } from './financialStateStorage';

type Evidence = {
    businessRecordCount: number;
    journalCount: number;
    journalIds: string[];
    linkedJournalId?: string;
    resultId?: string;
};
export type FinancialRecoveryFinding = Evidence & {
    operationId: string;
    kind: FinancialOperationKind;
    state: 'PENDING' | 'MANUAL_REVIEW';
    createdAt: string;
    note?: string;
    requiresManualReview: true;
    finding: 'RESULT_ID_MISSING' | 'NO_MATCHING_RECORD' | 'MISSING_JOURNAL' | 'ORPHAN_JOURNAL' | 'JOURNAL_LINK_MISMATCH' | 'DUPLICATE_JOURNAL' | 'CONSISTENT_BUT_UNCONFIRMED' | 'UNSUPPORTED_OPERATION';
};

/** Read-only inspection against the durable financial snapshot, never replay or auto-complete. */
export function inspectFinancialOperationsAfterRestart(): FinancialRecoveryFinding[] {
    // Read both durable stores first. A damaged/unavailable store must fail closed.
    const operations = financialOperationJournal.getUnresolved();
    const snapshot = financialStateStorage.read();
    return operations.filter((operation): operation is typeof operation & { state: 'PENDING' | 'MANUAL_REVIEW' } =>
        operation.state === 'PENDING' || operation.state === 'MANUAL_REVIEW'
    ).map(operation => {
        const { kind, resultId } = operation;
        const supported = kind === 'CUSTOMER_PAYMENT' || kind === 'BANK_TRANSACTION' || kind === 'BANK_TRANSFER' || kind === 'BANK_RECONCILIATION';
        const businessRecordCount = resultId ? countBusiness(snapshot, kind, resultId) : 0;
        const journals = resultId && supported
            ? snapshot.journals.filter(j => j.sourceType === kind && j.sourceId === resultId)
            : [];
        const linkedJournalId = kind === 'BANK_TRANSACTION'
            ? snapshot.transactions.find(v => v.id === resultId)?.journalEntryId
            : kind === 'BANK_TRANSFER'
                ? snapshot.transfers.find(v => v.id === resultId)?.journalEntryId
                : undefined;
        const finding: FinancialRecoveryFinding['finding'] = !supported ? 'UNSUPPORTED_OPERATION'
            : !resultId ? 'RESULT_ID_MISSING'
                : businessRecordCount !== 1 ? (journals.length > 0 ? 'ORPHAN_JOURNAL' : 'NO_MATCHING_RECORD')
                    : kind === 'BANK_RECONCILIATION' ? 'CONSISTENT_BUT_UNCONFIRMED'
                    : journals.length === 0 ? 'MISSING_JOURNAL'
                        : journals.length > 1 ? 'DUPLICATE_JOURNAL'
                            : linkedJournalId !== undefined && linkedJournalId !== journals[0].id ? 'JOURNAL_LINK_MISMATCH'
                                : 'CONSISTENT_BUT_UNCONFIRMED';
        return {
            operationId: operation.operationId,
            kind, state: operation.state, createdAt: operation.createdAt,
            note: operation.note, resultId, linkedJournalId,
            businessRecordCount, journalCount: journals.length,
            journalIds: journals.map(j => j.id), finding,
            requiresManualReview: true as const,
        };
    });
}

function countBusiness(snapshot: FinancialSnapshot, kind: FinancialOperationKind, resultId: string): number {
    if (kind === 'CUSTOMER_PAYMENT') return snapshot.payments.filter(v => v.id === resultId).length;
    if (kind === 'BANK_TRANSACTION') return snapshot.transactions.filter(v => v.id === resultId).length;
    if (kind === 'BANK_TRANSFER') return snapshot.transfers.filter(v => v.id === resultId).length;
    if (kind === 'BANK_RECONCILIATION') return snapshot.reconciliations.filter(v => v.id === resultId).length;
    return 0;
}

/** Explicit reviewer action only. Never mark completed, replay or modify accounting records. */
export function markFinancialOperationForManualReview(operationId: string, reason: string): void {
    financialOperationJournal.flagForReview(operationId, reason);
}
