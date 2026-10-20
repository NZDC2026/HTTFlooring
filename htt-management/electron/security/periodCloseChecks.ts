import { calculatePrepaymentReconciliation } from '../../src/features/supplier-prepayments/prepaymentReconciliation';
import { calculateDepositReconciliation } from '../../src/features/customer-deposits/depositReconciliation';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { hasPermission } from '../../src/features/security/rbac';
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
    const add = (code: string, message: string, path?: string) => blockers.push({ code, message, ...(path ? { path } : {}) });
    if (period.endDate >= businessDateKey(new Date().toISOString())) add('PERIOD_NOT_ENDED', 'The entire period must have ended before closing.');
    // Recovery work has cross-module effects; unresolved work blocks all closes.
    for (const row of financialOperationJournal.getUnresolved()) add('UNRESOLVED_OPERATION', `Resolve financial operation ${row.operationId}.`);
    for (const row of s.purchaseOperations) if (row.status !== 'POSTED') add('UNRESOLVED_PURCHASE', `Resolve purchase posting ${row.key}.`);
    for (const issue of runFinancialConsistencyAudit()) add(issue.code, `${issue.entityId}: ${issue.message}`);
    const payrollAccess = hasPermission(trustedAuthorization.current(), 'payroll.read');
    for (const run of s.payroll?.runs ?? []) if (run.status === 'Approved' && run.payDate <= period.endDate) add('PAYROLL_NOT_POSTED', payrollAccess ? `Post, reopen or cancel approved payroll ${run.name} dated ${run.payDate}.` : 'An approved payroll run must be resolved by an authorized payroll user before closing.', payrollAccess ? '/payroll/pay-runs/' + encodeURIComponent(run.id) : undefined);
    for (const batch of s.paymentBatches?.batches ?? []) if (batch.status === 'APPROVED' && batch.paymentDate <= period.endDate) add('PAYMENT_BATCH_NOT_POSTED', `Post or cancel approved payment batch ${batch.reference || batch.id} dated ${batch.paymentDate}.`, '/banking/payment-batches/' + encodeURIComponent(batch.id));
    for (const [repository, kind, code, path] of [
        ['managedSalesDocuments', 'INVOICE', 'INVOICE_DRAFT_NOT_POSTED', '/sales/drafts/invoices/'],
        ['expenseBillDrafts', 'EXPENSE', 'EXPENSE_DRAFT_NOT_POSTED', '/purchases/expense-bills/'],
    ] as const) for (const draft of s[repository]?.drafts ?? []) {
        if (draft.kind === kind && draft.status === 'APPROVED' && draft.payload.documentDate <= period.endDate)
            add(code, `Post, reopen or cancel approved ${kind === 'INVOICE' ? 'invoice' : 'expense bill'} dated ${draft.payload.documentDate} (${draft.id}).`, path + encodeURIComponent(draft.id));
    }
    const completed = s.bankReconciliations.reconciliations.filter((r: any) => r.status === 'COMPLETED');
    const cleared = new Set<string>(completed.flatMap((r: any) => r.clearedTransactionIds));
    const journalRows = new Map<string, { status: string }>((s.journals.journalEntries as JournalEntry[]).flatMap(j => j.lines.map(l => [j.id + ':' + l.id, { status: j.status }] as [string, { status: string }])));
    for (const account of s.bankAccounts.bankAccounts) {
        const rows = (s.bankStatements?.lines ?? []).filter((l: any) => l.bankAccountId === account.id && l.date <= period.endDate);
        const unmatched = rows.filter((l: any) => l.status === 'UNMATCHED').length;
        const processed = rows.filter((l: any) => l.status === 'MATCHED' || l.status === 'POSTED');
        const stale = processed.filter((l: any) => l.ledgerIds.some((id: string) => journalRows.get(id)?.status !== 'POSTED')).length;
        const uncleared = processed.filter((l: any) => l.ledgerIds.some((id: string) => !cleared.has(id))).length;
        if (unmatched) add('BANK_STATEMENT_UNPROCESSED', `Process or exclude with a reason ${unmatched} imported statement lines for ${account.name ?? account.id} through ${period.endDate}.`, '/banking/workbench');
        if (stale) add('BANK_STATEMENT_STALE', `Repair ${stale} stale statement matches for ${account.name ?? account.id} before closing.`, '/banking/workbench');
        if (uncleared) add('BANK_STATEMENT_NOT_CLEARED', `Reconcile ${uncleared} processed statement lines for ${account.name ?? account.id} before closing.`, '/banking/workbench');
    }
    const common = { accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, asOfDate: period.endDate };
    const reconciliations = [
        ['AR', () => calculateAccountsReceivableGlReconciliation({ ...common, customers: s.customers.customers, documents: [...s.sales.quotes, ...s.sales.salesOrders, ...s.sales.invoices], payments: s.customerPayments.payments, creditNotes: s.customerCredits.creditNotes, creditAllocations: s.customerCredits.allocations })],
        ['AP', () => calculateAccountsPayableGlReconciliation({ ...common, suppliers: s.suppliers.suppliers, bills: s.supplierBills.supplierBills, payments: s.supplierPayments.supplierPayments, credits: s.supplierCredits.supplierCredits, creditAllocations: s.supplierCredits.allocations })],
        ['INVENTORY', () => calculateInventoryGlReconciliation({ ...common, costMovements: s.costMovements.movements })],
    ] as const;
    try { const deposits=calculateDepositReconciliation({deposits:s.customerDeposits,accounts:s.accounts.accounts,journals:s.journals.journalEntries,banks:s.bankAccounts.bankAccounts,customers:s.customers.customers,asOfDate:period.endDate});
      if(!deposits.reconciled)add('CUSTOMER_DEPOSIT_DIFFERENCE',`Customer deposits require review at ${period.endDate}: difference ${deposits.difference}; ${deposits.issues.length} integrity issue(s).`,'/accounting/reconciliation/deposits?asOf='+encodeURIComponent(period.endDate));
    }catch(error){add('CUSTOMER_DEPOSIT_CHECK_FAILED',error instanceof Error?error.message:String(error),'/accounting/reconciliation/deposits?asOf='+encodeURIComponent(period.endDate));}
    try {const r=calculatePrepaymentReconciliation({prepayments:s.supplierPrepayments,accounts:s.accounts.accounts,journals:s.journals.journalEntries,banks:s.bankAccounts.bankAccounts,suppliers:s.suppliers.suppliers,asOfDate:period.endDate});if(!r.reconciled)add('SUPPLIER_PREPAYMENT_DIFFERENCE',`Supplier prepayments require review at ${period.endDate}: difference ${r.difference}; ${r.issues.length} integrity issue(s).`,'/accounting/reconciliation/prepayments?asOf='+encodeURIComponent(period.endDate));}catch(error){add('SUPPLIER_PREPAYMENT_CHECK_FAILED',error instanceof Error?error.message:String(error),'/accounting/reconciliation/prepayments?asOf='+encodeURIComponent(period.endDate));}
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
