import { beforeEach, describe, expect, it, vi } from 'vitest';
import { financialOperationJournal as journal, type FinancialOperationKind } from './financialOperationJournal';
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  } });
});
const kinds: FinancialOperationKind[] = [
  'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY', 'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL',
];
describe('Sales financial operation restart protection', () => {
  for (const kind of kinds) {
    it(`${kind}: unresolved operation cannot be blindly replayed`, () => {
      const id = `op-${kind}`;
      expect(journal.begin(id, kind, 'same-payload').status).toBe('started');
      journal.bindResult(id, 'document-1');
      expect(journal.begin(id, kind, 'same-payload').status).toBe('needs_review');
      expect(journal.getUnresolved()).toHaveLength(1);
      journal.flagForReview(id, 'Partial write possible');
      expect(journal.begin(id, kind, 'same-payload').status).toBe('needs_review');
    });
    it(`${kind}: completion cannot be applied to another result`, () => {
      const id = `op-${kind}`;
      journal.begin(id, kind, 'same-payload');
      journal.bindResult(id, 'document-1');
      journal.complete(id, 'document-1');
      expect(journal.begin(id, kind, 'same-payload').status).toBe('already_completed');
      expect(() => journal.complete(id, 'document-2')).toThrow();
    });
  }
});
