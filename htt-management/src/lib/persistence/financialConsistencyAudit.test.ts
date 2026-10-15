import { describe, expect, it } from 'vitest';
import { auditFinancialConsistency } from './financialConsistencyAudit';
import type { BankTransaction } from '../../features/banking/types/bankTransaction';
import type { JournalEntry } from '../../features/accounting/types/journalEntry';
const transaction = { id: 'b1', journalEntryId: 'j1' } as BankTransaction;
const journal = { id: 'j1', sourceType: 'BANK_TRANSACTION', sourceId: 'b1' } as JournalEntry;
const base = { transactions: [transaction], transfers: [], payments: [], journals: [journal] };
describe('financial consistency diagnostic', () => {
  it('accepts linked bank transaction and journal', () => expect(auditFinancialConsistency(base)).toEqual([]));
  it('reports missing journal', () => expect(auditFinancialConsistency({ ...base, journals: [] })[0].code).toBe('MISSING_JOURNAL'));
  it('reports mismatched journal source', () => expect(auditFinancialConsistency({ ...base, journals: [{ ...journal, sourceId: 'other' }] })[0].code).toBe('SOURCE_MISMATCH'));
  it('reports duplicate journal source', () => expect(auditFinancialConsistency({ ...base, journals: [journal, { ...journal, id: 'j2' }] }).some(x => x.code === 'DUPLICATE_SOURCE')).toBe(true));
  it('reports received payment without journal', () => expect(auditFinancialConsistency({ ...base, payments: [{ id: 'p1', status: 'RECEIVED' }] as any }).some(x => x.code === 'MISSING_PAYMENT_JOURNAL')).toBe(true));
});
