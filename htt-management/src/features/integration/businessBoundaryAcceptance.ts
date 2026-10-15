/** 8A cross-module acceptance: read-only, fail-closed, never replays financial writes. */
import { auditSalesConsistency, type SalesAuditInput } from '../sales/data/salesConsistencyAudit';
import { inspectSalesRestart } from '../sales/data/salesRestartRecoveryService';
import { auditFinancialConsistency, type FinancialConsistencyIssue } from '../../lib/persistence/financialConsistencyAudit';
import { calculatePurchaseAccountingReconciliation, type PurchaseAccountingReconciliationInput } from '../purchases/data/purchaseAccountingReconciliationService';
import type { FinancialOperation } from '../../lib/persistence/financialOperationJournal';
import type { BankTransaction, BankTransfer } from '../banking/types/bankTransaction';

export type BusinessBoundaryFinding = {
  area: 'SALES' | 'FINANCIAL' | 'PURCHASES_INVENTORY_GL' | 'RECOVERY';
  code: string;
  entityId: string;
  message: string;
  severity: 'BLOCK' | 'REVIEW';
};
export type BusinessBoundaryReport = {
  safeForFinancialWrites: boolean;
  findings: BusinessBoundaryFinding[];
  checkedAreas: readonly BusinessBoundaryFinding['area'][];
};
export type BusinessBoundaryInput = {
  sales: SalesAuditInput;
  operations: readonly FinancialOperation[];
  banking: { transactions: readonly BankTransaction[]; transfers: readonly BankTransfer[] };
  purchases: PurchaseAccountingReconciliationInput;
};

/** Missing/invalid inputs must block rather than report a false clean state. */
export function inspectBusinessBoundaries(input: BusinessBoundaryInput): BusinessBoundaryReport {
  const findings: BusinessBoundaryFinding[] = [];
  const add = (area: BusinessBoundaryFinding['area'], code: string, entityId: string, message: string, severity: 'BLOCK' | 'REVIEW' = 'BLOCK') =>
    findings.push({ area, code, entityId, message, severity });
  const guard = (area: BusinessBoundaryFinding['area'], check: () => void) => {
    try { check(); } catch (error) {
      add(area, 'AUDIT_UNAVAILABLE', area, error instanceof Error ? error.message : String(error));
    }
  };
  guard('SALES', () => {
    for (const issue of auditSalesConsistency(input.sales)) add('SALES', issue.code, issue.entityId, issue.message, issue.severity);
  });
  guard('FINANCIAL', () => {
    const issues: FinancialConsistencyIssue[] = auditFinancialConsistency({
      transactions: input.banking.transactions,
      transfers: input.banking.transfers,
      payments: input.sales.payments,
      journals: input.sales.journals,
    });
    for (const issue of issues) add('FINANCIAL', issue.code, issue.entityId, issue.message);
  });
  guard('PURCHASES_INVENTORY_GL', () => {
    const result = calculatePurchaseAccountingReconciliation(input.purchases);
    for (const row of [result.inventory, result.grni, result.ppv]) {
      if (row.status !== 'MATCHED') add('PURCHASES_INVENTORY_GL', 'SUBLEDGER_GL_DIFFERENCE', row.accountId,
        `${row.accountCode}: subledger ${row.subledger}, GL ${row.generalLedger}, difference ${row.difference}`);
    }
  });
  guard('RECOVERY', () => {
    for (const issue of inspectSalesRestart(input.sales, input.operations).findings)
      if (issue.code.startsWith('SALES_OPERATION_')) add('RECOVERY', issue.code, issue.entityId, issue.message, issue.severity);
  });
  return {
    safeForFinancialWrites: !findings.some(f => f.severity === 'BLOCK'),
    findings,
    checkedAreas: ['SALES', 'FINANCIAL', 'PURCHASES_INVENTORY_GL', 'RECOVERY'],
  };
}
