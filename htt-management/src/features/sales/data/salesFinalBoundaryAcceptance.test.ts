import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { assertCurrentSalesWriteSafety } from './salesWriteSafetyGate';
import { inspectSalesRestart } from './salesRestartRecoveryService';
import { verifySalesClosureEvidence } from './salesVerifiedRecoveryClosure';
import type { SalesAuditInput } from './salesConsistencyAudit';

const data = new Map<string, string>();
const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
    removeItem: (k: string) => { data.delete(k); },
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
};
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const blank: SalesAuditInput = { quotes: [], salesOrders: [], invoices: [], payments: [], creditNotes: [], allocations: [], journals: [] };
const voidInvoice = { id: 'invoice-1', type: 'INVOICE', status: 'VOID', customerId: 'c', amountPaid: 0, amountDue: 0, totals: { subtotal: 50, taxAmount: 0, total: 50 } } as SalesAuditInput['invoices'][number];
const original = { id: 'gl-1', sourceType: 'CUSTOMER_INVOICE', sourceId: 'invoice-1', status: 'REVERSED', reversalJournalEntryId: 'gl-2' } as SalesAuditInput['journals'][number];
const reversal = { id: 'gl-2', sourceType: 'CUSTOMER_INVOICE', status: 'POSTED', reversedJournalEntryId: 'gl-1' } as SalesAuditInput['journals'][number];
const reconciled: SalesAuditInput = { ...blank, invoices: [voidInvoice], journals: [original, reversal] };

beforeEach(() => { data.clear(); Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: storage } }); });
afterEach(() => { if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow); else Reflect.deleteProperty(globalThis, 'window'); });

function interrupted() {
    financialOperationJournal.begin('void-op', 'SALES_INVOICE_VOID', 'invoice-1');
    financialOperationJournal.bindResult('void-op', 'invoice-1');
    financialOperationJournal.recordManualReview('void-op', 'REVIEW-001', 'operator-a', 'Reconciled invoice and reversal GL');
}

describe('7B Sales financial recovery boundary acceptance', () => {
    it('blocks financial writes after a simulated crash and reload', () => {
        interrupted();
        const persisted = data.get('htt:financial-operations:v1');
        expect(persisted).toBeTruthy();
        expect(() => assertCurrentSalesWriteSafety()).toThrow(/blocked/);
        expect(inspectSalesRestart(reconciled, financialOperationJournal.list()).safeToResumeFinancialWrites).toBe(false);
    });
    it('requires verified existing GL and independent approval before releasing the gate', () => {
        interrupted();
        expect(verifySalesClosureEvidence(reconciled, financialOperationJournal.list(), 'void-op')).toEqual([]);
        expect(() => financialOperationJournal.closeReviewed('void-op', 'invoice-1', 'APPROVE-001', 'operator-a')).toThrow(/different operator/);
        financialOperationJournal.closeReviewed('void-op', 'invoice-1', 'APPROVE-001', 'operator-b');
        expect(() => assertCurrentSalesWriteSafety()).not.toThrow();
        expect(inspectSalesRestart(reconciled, financialOperationJournal.list()).safeToResumeFinancialWrites).toBe(true);
    });
    it('rejects duplicate GL journal IDs even when a valid linked reversal exists', () => {
        interrupted();
        const duplicate = { ...reversal };
        expect(verifySalesClosureEvidence({ ...reconciled, journals: [original, reversal, duplicate] }, financialOperationJournal.list(), 'void-op').join(' ')).toMatch(/Duplicate GL/);
        expect(() => assertCurrentSalesWriteSafety()).toThrow(/blocked/);
    });
    it('refuses to release on missing posted reversal GL', () => {
        interrupted();
        expect(verifySalesClosureEvidence({ ...reconciled, journals: [original] }, financialOperationJournal.list(), 'void-op').join(' ')).toMatch(/reversal GL/);
    });
    it('rejects corrupted durable intent on restart rather than assuming empty history', () => {
        interrupted();
        data.set('htt:financial-operations:v1', '{broken');
        expect(() => assertCurrentSalesWriteSafety()).toThrow(/blocked/);
    });
    it('rejects repeat closure and does not replay financial work', () => {
        interrupted();
        financialOperationJournal.closeReviewed('void-op', 'invoice-1', 'APPROVE-001', 'operator-b');
        expect(() => financialOperationJournal.closeReviewed('void-op', 'invoice-1', 'APPROVE-002', 'operator-c')).toThrow(/Only manually reviewed/);
        expect(financialOperationJournal.list()).toHaveLength(1);
    });
});
