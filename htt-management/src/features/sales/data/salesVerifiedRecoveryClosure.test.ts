import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { financialOperationJournal, type FinancialOperationKind } from '../../../lib/persistence/financialOperationJournal';
import { verifySalesClosureEvidence } from './salesVerifiedRecoveryClosure';
import type { SalesAuditInput } from './salesConsistencyAudit';

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
const empty: SalesAuditInput = { quotes: [], salesOrders: [], invoices: [], payments: [], creditNotes: [], allocations: [], journals: [] };
const invoice = { id: 'inv', type: 'INVOICE', status: 'VOID', amountPaid: 0, amountDue: 0,
    totals: { subtotal: 100, taxAmount: 0, total: 100 }, customerId: 'c' } as SalesAuditInput['invoices'][number];
const payment = { id: 'pay', invoiceId: 'inv', customerId: 'c', amount: 20, status: 'RECEIVED' } as SalesAuditInput['payments'][number];
const journal = (id: string, sourceType: 'CUSTOMER_INVOICE' | 'CUSTOMER_PAYMENT' | 'INVOICE_VOID' | 'CUSTOMER_PAYMENT_REVERSAL', sourceId: string,
    status: 'POSTED' | 'REVERSED', extra: Record<string, string> = {}) =>
    ({ id, sourceType, sourceId, status, ...extra }) as SalesAuditInput['journals'][number];
function prepare(kind: FinancialOperationKind, resultId: string) {
    financialOperationJournal.begin('op', kind, resultId);
    financialOperationJournal.bindResult('op', resultId);
    financialOperationJournal.recordManualReview('op', 'CASE-001', 'reviewer', 'Verified original and reversal GL');
    return financialOperationJournal.list();
}
beforeEach(() => { memory.clear(); Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: storage } }); });
afterEach(() => { if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window'); });

describe('7B-01 independently verified recovery closure', () => {
    it('rejects missing operation', () => expect(verifySalesClosureEvidence(empty, [], 'op')).toHaveLength(1));
    it('rejects unbound operation', () => {
        financialOperationJournal.begin('op', 'SALES_INVOICE_VOID', 'inv');
        financialOperationJournal.recordManualReview('op', 'CASE-001', 'reviewer', 'Inspected GL');
        expect(verifySalesClosureEvidence(empty, financialOperationJournal.list(), 'op')).toContain('Operation has no durable bound result; cannot infer effects.');
    });
    it('rejects an invoice without verified GL', () => {
        const ops = prepare('SALES_INVOICE_VOID', 'inv');
        expect(verifySalesClosureEvidence({ ...empty, invoices: [invoice] }, ops, 'op').join(' ')).toMatch(/GL/);
    });
    it('accepts fully voided invoice with unique linked posted reversal', () => {
        const ops = prepare('SALES_INVOICE_VOID', 'inv');
        const input = { ...empty, invoices: [invoice], journals: [
            journal('orig', 'CUSTOMER_INVOICE', 'inv', 'REVERSED', { reversalJournalEntryId: 'rev' }),
            { ...journal('rev', 'CUSTOMER_INVOICE', 'inv', 'POSTED', { reversedJournalEntryId: 'orig' }), sourceId: undefined },
        ] };
        expect(verifySalesClosureEvidence(input, ops, 'op')).toEqual([]);
    });
    it('rejects unrelated blocking financial inconsistency', () => {
        const ops = prepare('SALES_INVOICE_VOID', 'inv');
        const input = { ...empty, invoices: [invoice], journals: [
            journal('orig', 'CUSTOMER_INVOICE', 'inv', 'REVERSED', { reversalJournalEntryId: 'rev' }),
            { ...journal('rev', 'CUSTOMER_INVOICE', 'inv', 'POSTED', { reversedJournalEntryId: 'orig' }), sourceId: undefined },
            journal('orphan', 'CUSTOMER_PAYMENT', 'missing', 'POSTED'),
        ] };
        expect(verifySalesClosureEvidence(input, ops, 'op').join(' ')).toMatch(/ORPHAN_PAYMENT_GL/);
    });
    it('rejects pending second sales operation', () => {
        prepare('SALES_INVOICE_VOID', 'inv');
        financialOperationJournal.begin('other', 'SALES_CREDIT_APPLY', 'allocation');
        const input = { ...empty, invoices: [invoice], journals: [
            journal('orig', 'CUSTOMER_INVOICE', 'inv', 'REVERSED', { reversalJournalEntryId: 'rev' }),
            { ...journal('rev', 'CUSTOMER_INVOICE', 'inv', 'POSTED', { reversedJournalEntryId: 'orig' }), sourceId: undefined },
        ] };
        expect(verifySalesClosureEvidence(input, financialOperationJournal.list(), 'op').join(' ')).toMatch(/SALES_OPERATION_RESULT_UNVERIFIED/);
    });
    it('rejects payment lacking original GL', () => {
        const ops = prepare('CUSTOMER_PAYMENT', 'pay');
        expect(verifySalesClosureEvidence({ ...empty, payments: [payment] }, ops, 'op').join(' ')).toMatch(/GL/);
    });
    it('requires payment received and unique posted GL', () => {
        const ops = prepare('CUSTOMER_PAYMENT', 'pay');
        const input = { ...empty, invoices: [{ ...invoice, status: 'ISSUED', amountPaid: 20, amountDue: 80 } as typeof invoice],
            payments: [payment], journals: [journal('pgl', 'CUSTOMER_PAYMENT', 'pay', 'POSTED')] };
        expect(verifySalesClosureEvidence(input, ops, 'op')).toEqual([]);
    });
    it('rejects reversed payment without linked reversal GL', () => {
        const ops = prepare('SALES_PAYMENT_REVERSAL', 'pay');
        const input: SalesAuditInput = { ...empty, payments: [{ ...payment, status: 'REVERSED' }],
            journals: [journal('pgl', 'CUSTOMER_PAYMENT', 'pay', 'REVERSED')] };
        expect(verifySalesClosureEvidence(input, ops, 'op').join(' ')).toMatch(/reversal GL/);
    });
    it('rejects credit allocation with missing linked records', () => {
        const ops = prepare('SALES_CREDIT_APPLY', 'alloc');
        const input = { ...empty, allocations: [{ id: 'alloc', status: 'APPLIED', invoiceId: 'inv', creditNoteId: 'cn' } as SalesAuditInput['allocations'][number]] };
        expect(verifySalesClosureEvidence(input, ops, 'op').join(' ')).toMatch(/missing its invoice or credit note/);
    });
    it('requires a second operator and durable approval', () => {
        prepare('SALES_INVOICE_VOID', 'inv');
        expect(() => financialOperationJournal.closeReviewed('op', 'inv', 'APP-001', 'reviewer')).toThrow(/different operator/);
        expect(() => financialOperationJournal.closeReviewed('op', 'wrong', 'APP-001', 'manager')).toThrow(/differs/);
        const closed = financialOperationJournal.closeReviewed('op', 'inv', 'APP-001', 'manager');
        expect(closed.state).toBe('COMPLETED');
        expect(closed.reviewHistory).toHaveLength(2);
        expect(financialOperationJournal.getUnresolved()).toEqual([]);
        expect(() => financialOperationJournal.closeReviewed('op', 'inv', 'APP-002', 'manager')).toThrow(/Only manually reviewed/);
    });
    it('fails closed on corrupted durable journal', () => {
        prepare('SALES_INVOICE_VOID', 'inv');
        memory.set('htt:financial-operations:v1', '{invalid');
        expect(() => financialOperationJournal.closeReviewed('op', 'inv', 'APP-001', 'manager')).toThrow();
        expect(memory.get('htt:financial-operations:v1')).toBe('{invalid');
    });
});
