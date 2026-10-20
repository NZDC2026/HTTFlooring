import { nativeRequest, hydrateBusiness } from "../../security/repositoryHost";
import type { BusinessView } from "../../security/securityContract";
/** Operator evidence collection for supported interrupted financial operations.
 * Does not post, reverse, repair or release the financial write gate.
 */
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { assertNoUnresolvedSalesOperations } from './salesWriteSafetyGate';

const REVIEW_KINDS = new Set([
    'CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY',
    'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL', 'BANK_TRANSACTION', 'BANK_TRANSFER', 'BANK_RECONCILIATION',
]);

export type SalesReviewSubmission = {
    operationId: string;
    reference: string;
    operator: string;
    summary: string;
    businessRecordChecked: boolean;
    originalGlChecked: boolean;
    reversalGlChecked: boolean;
    balancesChecked: boolean;
};

/** Store a durable operator reconciliation note. The operation stays MANUAL_REVIEW.
 * All checkboxes are mandatory, but they do not constitute proof of atomic repair.
 */
export function recordSalesManualReview(input: SalesReviewSubmission) {
    if ((globalThis as Record<string, unknown>).__HTT_MAIN_HOST__ !== true && import.meta.env?.MODE !== 'test') {
        const reply = nativeRequest<{ result: any; view: BusinessView }>('business.command', { repository: 'salesRecovery', method: 'recordSalesManualReview', args: [input] });
        hydrateBusiness(reply.view); return reply.result;
    }

    if (input.businessRecordChecked !== true || input.originalGlChecked !== true ||
        input.reversalGlChecked !== true || input.balancesChecked !== true)
        throw new Error('Business, original/reversal GL and balances must all be inspected.');
    if(typeof input.reference!=='string'||input.reference.length>500||typeof input.summary!=='string'||input.summary.length>4000)throw new Error('Recovery evidence reference or summary exceeds the allowed length.');
    const operations = financialOperationJournal.list();
    const operation = operations.find(v => v.operationId === input.operationId);
    if (!operation || !REVIEW_KINDS.has(operation.kind))
        throw new Error('Sales operation not found.');
    if (operation.state === 'COMPLETED')
        throw new Error('Completed operation cannot be reviewed again.');
    return financialOperationJournal.recordManualReview(
        input.operationId, input.reference, input.operator, input.summary,
    );
}

/** Always fail closed after evidence is recorded; no automatic unblocking. */
export function assertSalesReviewStillBlocked(): void {
    assertNoUnresolvedSalesOperations(financialOperationJournal.list());
}
