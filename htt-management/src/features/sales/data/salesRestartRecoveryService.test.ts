import { describe, expect, it } from 'vitest';
import { inspectSalesRestart } from './salesRestartRecoveryService';
import type { SalesAuditInput } from './salesConsistencyAudit';
import type { FinancialOperation, FinancialOperationKind } from '../../../lib/persistence/financialOperationJournal';
const empty: SalesAuditInput = { quotes: [], salesOrders: [], invoices: [], payments: [], creditNotes: [], allocations: [], journals: [] };
const operation = (kind: FinancialOperationKind, state: FinancialOperation['state'], id = kind): FinancialOperation => ({
    operationId: id, kind, state, fingerprint: 'fingerprint', createdAt: '2026-01-01', updatedAt: '2026-01-01',
});
describe('Sales restart financial recovery / fault injection', () => {
    it('clean restart allows proceeding', () => {
        expect(inspectSalesRestart(empty, []).safeToResumeFinancialWrites).toBe(true);
    });
    it('completed operation is not replayed or blocked', () => {
        const report = inspectSalesRestart(empty, [operation('SALES_INVOICE_VOID', 'COMPLETED')]);
        expect(report.findings).toEqual([]);
        expect(report.unresolvedOperations).toBe(0);
    });
    for (const kind of ['CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY', 'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL'] as const) {
        for (const state of ['PENDING', 'MANUAL_REVIEW'] as const) {
            it(`${kind} ${state} after simulated crash is blocked without replay`, () => {
                const op = operation(kind, state);
                const before = JSON.stringify(op);
                const report = inspectSalesRestart(empty, [op]);
                expect(report.safeToResumeFinancialWrites).toBe(false);
                expect(report.unresolvedOperations).toBe(1);
                expect(report.findings).toEqual([expect.objectContaining({
                    code: 'SALES_OPERATION_RESULT_UNVERIFIED', operationId: op.operationId,
                    automaticRepairAllowed: false, severity: 'BLOCK',
                })]);
                expect(JSON.stringify(op)).toBe(before);
            });
        }
    }
    it('unresolved operation with linked result remains blocked', () => {
        const op = { ...operation('SALES_INVOICE_VOID', 'PENDING'), resultId: 'invoice-1' };
        const input: SalesAuditInput = { ...empty, invoices: [{ id: 'invoice-1', documentNumber: 'INV-1', customerId: 'customer-1', documentDate: '2026-01-01', dueDate: '2026-02-01', createdAt: '2026-01-01', updatedAt: '2026-01-01', type: 'INVOICE', status: 'VOID', lines: [], totals: { subtotal: 100, taxAmount: 15, total: 115 }, amountPaid: 0, amountDue: 0 }] as SalesAuditInput['invoices'] };
        const report = inspectSalesRestart(input, [op]);
        expect(report.findings.some(f => f.code === 'SALES_OPERATION_UNRESOLVED')).toBe(true);
        expect(report.safeToResumeFinancialWrites).toBe(false);
    });
    it('duplicate operation IDs block restart even if completed', () => {
        const op = operation('SALES_CREDIT_APPLY', 'COMPLETED');
        const report = inspectSalesRestart(empty, [op, op]);
        expect(report.findings.some(f => f.code === 'SALES_OPERATION_DUPLICATE_ID')).toBe(true);
    });
    it('non-sales pending operation is excluded from Sales-specific report', () => {
        const report = inspectSalesRestart(empty, [operation('BANK_TRANSFER', 'PENDING')]);
        expect(report.safeToResumeFinancialWrites).toBe(true);
    });
});
