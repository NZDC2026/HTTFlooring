import { describe, expect, it } from 'vitest';
import { assertCrossModuleWriteSafe } from './crossModuleWriteGate';
import type { FinancialOperation } from '../../lib/persistence/financialOperationJournal';
import type { PurchasePostingOperation } from '../purchases/data/purchasePostingOperationRepository';
const sales = (state: FinancialOperation['state'], id = 'sale-1') =>
  ({ kind: 'CUSTOMER_PAYMENT', state, operationId: id } as FinancialOperation);
const purchase = (status: PurchasePostingOperation['status'], key = 'GOODS_RECEIPT:1') =>
  ({ kind: 'GOODS_RECEIPT', status, key, sourceId: '1', completedSteps: [], updatedAt: '' } as PurchasePostingOperation);
describe('8A cross-module write entry gate', () => {
  it('allows reconciled completed operations', () => {
    expect(() => assertCrossModuleWriteSafe([sales('COMPLETED')], [purchase('POSTED')])).not.toThrow();
  });
  it.each(['PENDING', 'MANUAL_REVIEW'] as const)('blocks Sales %s intents before purchase posting', state => {
    expect(() => assertCrossModuleWriteSafe([sales(state)], [])).toThrow(/Sales operation/);
  });
  it.each(['PENDING', 'POSTING', 'FAILED', 'RECOVERY_REQUIRED'] as const)('blocks purchase %s before Sales posting', status => {
    expect(() => assertCrossModuleWriteSafe([], [purchase(status)])).toThrow(/purchase operation/);
  });
  it('blocks duplicate Sales and purchase intent identifiers', () => {
    expect(() => assertCrossModuleWriteSafe([sales('COMPLETED'), sales('COMPLETED')], [])).toThrow();
    expect(() => assertCrossModuleWriteSafe([], [purchase('POSTED'), purchase('POSTED')])).toThrow();
  });
  it('blocks restarted purchase operations even if incorrectly marked POSTED', () => {
    expect(() => assertCrossModuleWriteSafe([], [{ ...purchase('POSTED'), error: 'Restored after restart: interrupted' }])).toThrow();
  });
});
