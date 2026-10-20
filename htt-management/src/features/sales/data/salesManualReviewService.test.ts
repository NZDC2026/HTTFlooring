import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { recordSalesManualReview, assertSalesReviewStillBlocked } from './salesManualReviewService';

const memory = new Map<string, string>();
const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
    removeItem: (key: string) => { memory.delete(key); },
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() { return memory.size; },
};
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const valid = { operationId: 'void-1', reference: 'CASE-001', operator: 'manager', summary: 'GL and invoice compared',
    businessRecordChecked: true, originalGlChecked: true, reversalGlChecked: true, balancesChecked: true };
function begin() { financialOperationJournal.begin('void-1', 'SALES_INVOICE_VOID', 'invoice-1'); }
beforeEach(() => { memory.clear(); Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: storage } }); });
afterEach(() => { if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window'); });

describe('Sales operator review / restart acceptance', () => {
    it('records durable review evidence and leaves operation blocked', () => {
        begin();
        const result = recordSalesManualReview(valid);
        expect(result.state).toBe('MANUAL_REVIEW');
        expect(result.reviewHistory?.[0].reference).toBe('CASE-001');
        expect(() => assertSalesReviewStillBlocked()).toThrow(/blocked/);
    });
    it('survives journal reload without replaying financial effects', () => {
        begin(); recordSalesManualReview(valid);
        const reloaded = financialOperationJournal.list()[0];
        expect(reloaded.reviewHistory).toHaveLength(1);
        expect(reloaded.state).toBe('MANUAL_REVIEW');
    });
    it('allows additional distinct audit notes without unblocking', () => {
        begin(); recordSalesManualReview(valid);
        recordSalesManualReview({ ...valid, reference: 'CASE-002' });
        expect(financialOperationJournal.list()[0].reviewHistory).toHaveLength(2);
        expect(() => assertSalesReviewStillBlocked()).toThrow();
    });
    it('rejects duplicate evidence reference', () => {
        begin(); recordSalesManualReview(valid);
        expect(() => recordSalesManualReview(valid)).toThrow(/already recorded/);
    });
    it('rejects missing checks', () => { begin(); expect(() => recordSalesManualReview({ ...valid, originalGlChecked: false })).toThrow(); });
    it('rejects missing operation', () => expect(() => recordSalesManualReview(valid)).toThrow(/not found/));
    it('rejects completed operation', () => {
        begin(); financialOperationJournal.complete('void-1', 'invoice-1');
        expect(() => recordSalesManualReview(valid)).toThrow(/Completed/);
    });
    it('rejects unsupported recovery operations', () => {
        financialOperationJournal.begin('void-1', 'PAYMENT_REVERSAL', 'bank-1');
        expect(() => recordSalesManualReview(valid)).toThrow(/Sales operation not found/);
    });
    it('requires named operator', () => { begin(); expect(() => recordSalesManualReview({ ...valid, operator: '' })).toThrow(); });
    it('requires reconciliation summary', () => { begin(); expect(() => recordSalesManualReview({ ...valid, summary: ' ' })).toThrow(); });
    it('rejects invalid durable journal without overwriting it', () => {
        memory.set('htt:financial-operations:v1', 'broken');
        expect(() => recordSalesManualReview(valid)).toThrow();
        expect(memory.get('htt:financial-operations:v1')).toBe('broken');
    });
    it('does not unblock payment/credit operations when manual evidence exists', () => {
        financialOperationJournal.begin('void-1', 'SALES_CREDIT_APPLY', 'allocation-1');
        recordSalesManualReview(valid);
        expect(() => assertSalesReviewStillBlocked()).toThrow();
    });
});
