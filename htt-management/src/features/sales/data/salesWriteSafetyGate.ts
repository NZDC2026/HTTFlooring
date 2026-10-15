/** Fail-closed preflight for Sales financial mutations.
 * An unresolved Sales intent is never automatically replayed or dismissed.
 * This is not an atomic transaction across business records and GL.
 */
import { financialOperationJournal, type FinancialOperation } from '../../../lib/persistence/financialOperationJournal';

const SALES_KINDS = new Set<FinancialOperation['kind']>([
    'CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY',
    'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL',
]);

export function assertNoUnresolvedSalesOperations(operations: readonly FinancialOperation[]): void {
    const sales = operations.filter(operation => SALES_KINDS.has(operation.kind));
    const ids = new Set<string>();
    for (const operation of sales) {
        if (ids.has(operation.operationId)) {
            throw new Error('Sales financial writes blocked: duplicate operation intent ID; manual review required.');
        }
        ids.add(operation.operationId);
        if (operation.state !== 'COMPLETED') {
            throw new Error(`Sales financial writes blocked: ${operation.kind} ${operation.operationId} is ${operation.state}; manual review required.`);
        }
    }
}

/** Call before beginning any new Sales financial operation. Corrupt or unavailable
 * durable journal storage also blocks writes via journal.list(). */
export function assertCurrentSalesWriteSafety(): void {
    assertNoUnresolvedSalesOperations(financialOperationJournal.list());
}
