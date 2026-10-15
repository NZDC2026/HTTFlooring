import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { financialOperationJournal } from './financialOperationJournal';
import { financialStateStorage } from './financialStateStorage';
import { inspectFinancialOperationsAfterRestart, markFinancialOperationForManualReview } from './financialRestartInspection';
let values: Map<string, string>;
beforeEach(() => {
    values = new Map();
    vi.stubGlobal('window', { localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { values.set(key, value); },
    } });
    financialStateStorage.resetCacheForTests();
});
afterEach(() => { vi.unstubAllGlobals(); financialStateStorage.resetCacheForTests(); });
describe('financial restart recovery is fail-closed and read-only', () => {
    it('identifies pending operations without a result ID, without mutating records', () => {
        financialOperationJournal.begin('restart-a', 'BANK_TRANSACTION', 'fingerprint-a');
        const before = new Map(values);
        const results = inspectFinancialOperationsAfterRestart();
        expect(results).toHaveLength(1);
        expect(results[0].finding).toBe('RESULT_ID_MISSING');
        expect(results[0].requiresManualReview).toBe(true);
        expect(values).toEqual(before);
    });
    it('allows explicit manual review but never auto-completes', () => {
        financialOperationJournal.begin('restart-b', 'BANK_TRANSFER', 'fingerprint-b');
        markFinancialOperationForManualReview('restart-b', 'Needs bank statement verification');
        expect(inspectFinancialOperationsAfterRestart()[0].state).toBe('MANUAL_REVIEW');
        expect(financialOperationJournal.list()[0].state).not.toBe('COMPLETED');
    });
    it('blocks inspection if the operation registry is corrupt', () => {
        values.set('htt:financial-operations:v1', '{broken');
        expect(() => inspectFinancialOperationsAfterRestart()).toThrow(/blocked/);
    });
    it('blocks inspection if the financial snapshot is corrupt', () => {
        financialOperationJournal.begin('restart-c', 'CUSTOMER_PAYMENT', 'fingerprint-c');
        values.set('htt:financial-snapshot:v1', '{broken');
        financialStateStorage.resetCacheForTests();
        expect(() => inspectFinancialOperationsAfterRestart()).toThrow(/blocked/);
    });
});

describe('durable result binding and partial failure evidence', () => {
    it('finds a bound result after simulated restart without replaying', () => {
        financialOperationJournal.begin('bind-a', 'BANK_TRANSACTION', 'fingerprint');
        financialOperationJournal.bindResult('bind-a', 'bank-a');
        financialStateStorage.resetCacheForTests();
        const before = new Map(values);
        const [finding] = inspectFinancialOperationsAfterRestart();
        expect(finding.resultId).toBe('bank-a');
        expect(finding.finding).toBe('NO_MATCHING_RECORD');
        expect(values).toEqual(before);
    });
    it('does not allow a bound result identity to change', () => {
        financialOperationJournal.begin('bind-b', 'BANK_TRANSFER', 'fingerprint');
        financialOperationJournal.bindResult('bind-b', 'transfer-a');
        expect(() => financialOperationJournal.bindResult('bind-b', 'transfer-b')).toThrow(/cannot be changed/);
        expect(() => financialOperationJournal.complete('bind-b', 'transfer-b')).toThrow(/cannot be changed/);
    });
    it('rejects binding after manual review', () => {
        financialOperationJournal.begin('bind-c', 'CUSTOMER_PAYMENT', 'fingerprint');
        financialOperationJournal.flagForReview('bind-c', 'Interrupted');
        expect(() => financialOperationJournal.bindResult('bind-c', 'payment-c')).toThrow(/pending/);
    });
    it('does not write a binding when local storage rejects the update', () => {
        financialOperationJournal.begin('bind-d', 'BANK_TRANSACTION', 'fingerprint');
        const before = new Map(values);
        vi.stubGlobal('window', { localStorage: {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: () => { throw new Error('quota exceeded'); },
        } });
        expect(() => financialOperationJournal.bindResult('bind-d', 'bank-d')).toThrow();
        expect(values).toEqual(before);
    });
});
