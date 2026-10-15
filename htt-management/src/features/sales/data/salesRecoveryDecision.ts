/** Pure, read-only decision gate for operator-led Sales recovery.
 * This module never completes a financial operation or changes business/GL state.
 */
import type { FinancialOperation } from '../../../lib/persistence/financialOperationJournal';
import type { SalesAuditInput } from './salesConsistencyAudit';
import { inspectSalesRestart, type SalesRestartFinding } from './salesRestartRecoveryService';

export type RecoveryEvidence = {
    operationId: string;
    businessRecordChecked: boolean;
    originalGlChecked: boolean;
    reversalGlChecked: boolean;
    balancesChecked: boolean;
    operatorReference: string;
};
export type RecoveryDecision = {
    operationId: string;
    canCloseReview: boolean;
    reasons: string[];
    blockingFindings: SalesRestartFinding[];
    automaticRepairAllowed: false;
};

/** Evidence alone never authorizes closure: an unresolved operation remains blocked.
 * The operator must use a separate, audited recovery procedure after reconciliation.
 */
export function assessSalesRecovery(
    input: SalesAuditInput,
    operations: readonly FinancialOperation[],
    evidence: RecoveryEvidence,
): RecoveryDecision {
    const report = inspectSalesRestart(input, operations);
    const operation = operations.find(op => op.operationId === evidence.operationId);
    const reasons: string[] = [];
    if (!operation) reasons.push('Operation not found in durable journal.');
    if (operations.filter(op => op.operationId === evidence.operationId).length !== 1)
        reasons.push('Operation ID is missing or duplicated.');
    if (operation?.state === 'COMPLETED') reasons.push('Operation is already completed; do not close it again.');
    if (!evidence.businessRecordChecked) reasons.push('Business record has not been verified.');
    if (!evidence.originalGlChecked) reasons.push('Original GL has not been verified.');
    if (!evidence.reversalGlChecked) reasons.push('Reversal GL has not been verified.');
    if (!evidence.balancesChecked) reasons.push('Balances and allocations have not been reconciled.');
    if (evidence.operatorReference.trim().length < 3) reasons.push('Operator evidence reference is required.');
    const blockingFindings = report.findings.filter(f => f.severity === 'BLOCK' &&
        (f.operationId === evidence.operationId || f.operationId === undefined));
    if (blockingFindings.length) reasons.push('Unresolved financial findings require manual reconciliation.');
    // Intentionally fail closed even with all checkboxes ticked: no trusted atomic
    // proof exists that business records and GL were corrected together.
    reasons.push('Manual recovery approval and durable audited closure are not implemented.');
    return { operationId: evidence.operationId, canCloseReview: false, reasons, blockingFindings, automaticRepairAllowed: false };
}

/** Determine whether a proposed Sales financial write is allowed after restart.
 * Conservatively blocks ALL Sales financial writes while any Sales BLOCK exists.
 */
export function assertSalesFinancialWritesSafe(input: SalesAuditInput, operations: readonly FinancialOperation[]): void {
    const report = inspectSalesRestart(input, operations);
    if (!report.safeToResumeFinancialWrites)
        throw new Error(`Sales financial writes blocked: ${report.findings.filter(f => f.severity === 'BLOCK').map(f => f.code).join(', ')}`);
}
