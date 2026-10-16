import { snapshotRepositories } from '../../src/features/security/repositoryHost';
import type { AccountingPeriod, CloseCheck, PeriodCheck } from '../../src/features/accounting/data/accountingPeriodRepository';
import { runFinancialConsistencyAudit } from '../../src/lib/persistence/runFinancialConsistencyAudit';
import { financialOperationJournal } from '../../src/lib/persistence/financialOperationJournal';
import { calculateAccountsReceivableGlReconciliation } from '../../src/features/accounting/data/accountsReceivableGlReconciliationService';
import { calculateAccountsPayableGlReconciliation } from '../../src/features/accounting/data/accountsPayableGlReconciliationService';
import { calculateInventoryGlReconciliation } from '../../src/features/inventory/data/inventoryGlReconciliationService';
import { businessDateKey } from '../../src/lib/businessDate';
import type { JournalEntry } from '../../src/features/accounting/types/journalEntry';
export function periodCloseChecks(period: AccountingPeriod): CloseCheck {
    const s = snapshotRepositories() as Record<string, any>, blockers: PeriodCheck[] = [];
    const add = (code: string, message: string) => blockers.push({ code, message });
    if (period.endDate >= businessDateKey(new Date().toISOString())) add('PERIOD_NOT_ENDED', 'The entire period must have ended before closing.');
    // Recovery work has cross-module effects; unresolved work blocks all closes.
    for (const row of financialOperationJournal.getUnresolved()) add('UNRESOLVED_OPERATION', `Resolve financial operation ${row.operationId}.`);
    for (const row of s.purchaseOperations) if (row.status !== 'POSTED') add('UNRESOLVED_PURCHASE', `Resolve purchase posting ${row.key}.`);
    for (const issue of runFinancialConsistencyAudit()) add(issue.code, `${issue.entityId}: ${issue.message}`);
    const common = { accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, asOfDate: period.endDate };
    const reconciliations = [
        ['AR', () => calculateAccountsReceivableGlReconciliation({ ...common, customers: s.customers.customers, documents: [...s.sales.quotes, ...s.sales.salesOrders, ...s.sales.invoices], payments: s.customerPayments.payments, creditNotes: s.customerCredits.creditNotes, creditAllocations: s.customerCredits.allocations })],
        ['AP', () => calculateAccountsPayableGlReconciliation({ ...common, suppliers: s.suppliers.suppliers, bills: s.supplierBills.supplierBills, payments: s.supplierPayments.supplierPayments, credits: s.supplierCredits.supplierCredits, creditAllocations: s.supplierCredits.allocations })],
        ['INVENTORY', () => calculateInventoryGlReconciliation({ ...common, costMovements: s.costMovements.movements })],
    ] as const;
    for (const [name, check] of reconciliations) {
        try { const result = check(); if (!result.reconciled || !Number.isFinite(result.difference)) add(`${name}_DIFFERENCE`, `${name} to GL difference at ${period.endDate}: ${result.difference}.`); }
        catch (error) { add(`${name}_CHECK_FAILED`, error instanceof Error ? error.message : String(error)); }
    }
    for (const account of s.bankAccounts.bankAccounts) {
        const activity = (s.journals.journalEntries as JournalEntry[]).some(j => j.journalDate <= period.endDate && j.lines.some(line => line.accountId === account.glAccountId)) || (account.openingBalance !== 0 && account.openingBalanceDate <= period.endDate);
        if (activity && !s.bankReconciliations.reconciliations.some((row: any) => row.bankAccountId === account.id && row.statementDate >= period.endDate && row.status === 'COMPLETED' && row.difference === 0)) add('BANK_NOT_RECONCILED', `Reconcile ${account.name ?? account.id} through ${period.endDate}.`);
    }
    const journals = (s.journals.journalEntries as JournalEntry[]).filter(j => j.journalDate >= period.startDate && j.journalDate <= period.endDate);
    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const debit = round(journals.reduce((n, j) => n + j.totalDebit, 0)), credit = round(journals.reduce((n, j) => n + j.totalCredit, 0));
    if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit !== credit) add('TRIAL_BALANCE', 'Period journal debits and credits do not balance.');
    return { blockers, journalCount: journals.length, debit, credit };
}
