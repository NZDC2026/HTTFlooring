import { describe, expect, it } from 'vitest';
import { assertNoUnresolvedSalesOperations } from './salesWriteSafetyGate';
import type { FinancialOperation } from '../../../lib/persistence/financialOperationJournal';
const base: FinancialOperation = {
    operationId: 'payment-1', kind: 'CUSTOMER_PAYMENT', fingerprint: 'invoice-1',
    state: 'PENDING', createdAt: '2026-01-01', updatedAt: '2026-01-01',
};
describe('Sales write preflight (no replay)', () => {
    it('allows empty operation journal', () => expect(() => assertNoUnresolvedSalesOperations([])).not.toThrow());
    it('allows completed Sales intents', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, state: 'COMPLETED' }])).not.toThrow());
    it('blocks pending customer payment', () => expect(() => assertNoUnresolvedSalesOperations([base])).toThrow(/blocked/));
    it('blocks manual-review invoice void', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, kind: 'SALES_INVOICE_VOID', state: 'MANUAL_REVIEW' }])).toThrow(/manual review/));
    it('blocks pending credit apply', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, kind: 'SALES_CREDIT_APPLY' }])).toThrow());
    it('blocks pending credit reversal', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, kind: 'SALES_CREDIT_REVERSAL' }])).toThrow());
    it('blocks pending payment reversal', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, kind: 'SALES_PAYMENT_REVERSAL' }])).toThrow());
    it('does not block unrelated purchase operation', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, kind: 'BANK_TRANSFER' }])).not.toThrow());
    it('blocks duplicate completed Sales intent IDs', () => expect(() => assertNoUnresolvedSalesOperations([{ ...base, state: 'COMPLETED' }, { ...base, state: 'COMPLETED' }])).toThrow(/duplicate/));
    it('does not mutate operations', () => { const records = [{ ...base }]; const before = JSON.stringify(records); expect(() => assertNoUnresolvedSalesOperations(records)).toThrow(); expect(JSON.stringify(records)).toBe(before); });
});
