/** 8A preflight: prevent a new financial posting in one domain while another
 * domain has an unresolved durable intent. No automatic replay is attempted.
 * This is an intent-level guard, not an atomic multi-ledger transaction.
 */
import { financialOperationJournal, type FinancialOperation } from '../../lib/persistence/financialOperationJournal';
import { purchasePostingOperationRepository, type PurchasePostingOperation } from '../purchases/data/purchasePostingOperationRepository';

const salesKinds = new Set<FinancialOperation['kind']>([
  'CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY',
  'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL',
]);

export function assertCrossModuleWriteSafe(
  sales: readonly FinancialOperation[], purchases: readonly PurchasePostingOperation[],
): void {
  const operationIds = new Set<string>();
  for (const op of sales) {
    if (!op.operationId || operationIds.has(op.operationId) || op.state !== 'COMPLETED') {
      throw new Error(`Cross-module financial writes blocked: ${salesKinds.has(op.kind) ? "Sales" : "Financial"} operation ${op.operationId || '(missing ID)'} requires reconciliation.`);
    }
    operationIds.add(op.operationId);
  }
  const purchaseKeys = new Set<string>();
  for (const op of purchases) {
    if (!op.key || purchaseKeys.has(op.key) || op.status !== 'POSTED' ||
        (op.error?.startsWith('Restored after restart:') ?? false)) {
      throw new Error(`Cross-module financial writes blocked: purchase operation ${op.key || '(missing key)'} requires reconciliation.`);
    }
    purchaseKeys.add(op.key);
  }
}

export function assertCurrentCrossModuleWriteSafe(): void {
  // Reading the durable Sales journal can itself throw on corrupt storage: fail closed.
  assertCrossModuleWriteSafe(financialOperationJournal.list(), purchasePostingOperationRepository.getAll());
}
