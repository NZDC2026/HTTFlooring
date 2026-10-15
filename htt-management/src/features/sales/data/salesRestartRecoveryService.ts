/** Read-only restart inspection. Never retries, posts, reverses or mutates records. */
import type { FinancialOperation } from '../../../lib/persistence/financialOperationJournal';
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { inspectSalesRecovery, type SalesRecoveryFinding } from './salesRecoveryInspection';
import type { SalesAuditInput } from './salesConsistencyAudit';
import { salesRepository } from './salesRepository';
import { paymentRepository } from './paymentRepository';
import { creditNoteRepository } from './creditNoteRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import type { Invoice, Quote, SalesOrder } from '../types/salesDocument';

export type SalesRestartFinding = {
    code: string;
    entityId: string;
    operationId?: string;
    severity: 'BLOCK' | 'REVIEW';
    message: string;
    action: string;
    automaticRepairAllowed: false;
};
export type SalesRestartReport = {
    safeToResumeFinancialWrites: boolean;
    unresolvedOperations: number;
    findings: SalesRestartFinding[];
};
const salesKinds = new Set(['CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY', 'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL']);

/** Pure function for deterministic restart and crash-injection tests. */
export function inspectSalesRestart(input: SalesAuditInput, operations: readonly FinancialOperation[]): SalesRestartReport {
    const findings: SalesRestartFinding[] = inspectSalesRecovery(input).map((finding: SalesRecoveryFinding) => ({ ...finding }));
    const unresolved = operations.filter(op => salesKinds.has(op.kind) && op.state !== 'COMPLETED');
    const invoiceIds = new Set(input.invoices.map(v => v.id));
    const paymentIds = new Set(input.payments.map(v => v.id));
    const allocationIds = new Set(input.allocations.map(v => v.id));
    for (const op of unresolved) {
        const target = op.resultId ?? op.operationId;
        const known = op.kind === 'SALES_INVOICE_VOID' ? invoiceIds.has(target)
            : op.kind === 'SALES_PAYMENT_REVERSAL' || op.kind === 'CUSTOMER_PAYMENT' ? paymentIds.has(target)
            : allocationIds.has(target);
        findings.push({
            code: known ? 'SALES_OPERATION_UNRESOLVED' : 'SALES_OPERATION_RESULT_UNVERIFIED',
            entityId: target,
            operationId: op.operationId,
            severity: 'BLOCK',
            message: `${op.kind} is ${op.state}; ${known ? 'linked business record exists' : 'linked result is missing or not yet bound'}.`,
            action: 'Block retries and new financial writes for the affected document. Compare persisted business state, original/reversal GL journals and operation intent; resolve manually. Never replay automatically.',
            automaticRepairAllowed: false,
        });
    }
    // An operation ID must not appear twice, even when injected by a corrupt external source.
    const seen = new Set<string>();
    for (const op of operations.filter(op => salesKinds.has(op.kind))) {
        if (seen.has(op.operationId)) findings.push({
            code: 'SALES_OPERATION_DUPLICATE_ID', entityId: op.operationId, operationId: op.operationId,
            severity: 'BLOCK', message: 'Duplicate operation intent ID detected.',
            action: 'Do not retry. Inspect operation journal integrity and manually reconcile all affected records.',
            automaticRepairAllowed: false,
        });
        seen.add(op.operationId);
    }
    return { safeToResumeFinancialWrites: findings.every(f => f.severity !== 'BLOCK'), unresolvedOperations: unresolved.length, findings };
}

/** Live adapter: call explicitly after restart, before authorizing financial work. */
export function inspectCurrentSalesRestart(): SalesRestartReport {
    const documents = salesRepository.getAll();
    return inspectSalesRestart({
        quotes: documents.filter((d): d is Quote => d.type === 'QUOTE'),
        salesOrders: documents.filter((d): d is SalesOrder => d.type === 'SALES_ORDER'),
        invoices: documents.filter((d): d is Invoice => d.type === 'INVOICE'),
        payments: paymentRepository.getAll(),
        creditNotes: creditNoteRepository.getAll(),
        allocations: creditNoteRepository.getAllAllocations(),
        journals: journalEntryRepository.getAll(),
    }, financialOperationJournal.list());
}
