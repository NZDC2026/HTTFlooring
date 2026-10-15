import type { Invoice } from '../../features/sales/types/salesDocument';
import type { CreditNote } from '../../features/sales/types/creditNote';
import type { SupplierBill } from '../../features/purchases/types/supplierBill';
import type { SupplierPayment } from '../../features/purchases/types/supplierPayment';
import type { SupplierCredit } from '../../features/purchases/types/supplierCredit';
/** Read-only checks. Never mutate financial records during startup recovery. */
import type { BankTransaction, BankTransfer } from '../../features/banking/types/bankTransaction';
import type { JournalEntry } from '../../features/accounting/types/journalEntry';
import type { Payment } from '../../features/sales/types/payment';

export type FinancialConsistencyIssue = {
  code: 'MISSING_JOURNAL' | 'SOURCE_MISMATCH' | 'DUPLICATE_SOURCE' | 'MISSING_PAYMENT_JOURNAL' | 'ORPHAN_JOURNAL' | 'AMOUNT_MISMATCH' | 'REVERSAL_MISMATCH' | 'UNBALANCED_JOURNAL';
  entityId: string;
  message: string;
};

export function auditFinancialConsistency(input: {
  transactions: readonly BankTransaction[];
  transfers: readonly BankTransfer[];
  payments: readonly Payment[];
  journals: readonly JournalEntry[];
  invoices?: readonly Invoice[];
  creditNotes?: readonly CreditNote[];
  supplierBills?: readonly SupplierBill[];
  supplierPayments?: readonly SupplierPayment[];
  supplierCredits?: readonly SupplierCredit[];
}): FinancialConsistencyIssue[] {
  const issues: FinancialConsistencyIssue[] = [];
  const journalById = new Map(input.journals.map(entry => [entry.id, entry]));
  const seen = new Map<string, string>();
  for (const entry of input.journals) {
    if (!entry.sourceId) continue;
    const key = `${entry.sourceType}:${entry.sourceId}`;
    const prior = seen.get(key);
    if (prior) issues.push({ code: 'DUPLICATE_SOURCE', entityId: entry.id, message: `Journal source ${key} also used by ${prior}` });
    else seen.set(key, entry.id);
  }
  for (const [records, sourceType] of [
    [input.transactions, 'BANK_TRANSACTION'],
    [input.transfers, 'BANK_TRANSFER'],
  ] as const) {
    for (const record of records) {
      const journal = journalById.get(record.journalEntryId);
      if (!journal) issues.push({ code: 'MISSING_JOURNAL', entityId: record.id, message: `Missing journal ${record.journalEntryId}` });
      else if (journal.sourceType !== sourceType || journal.sourceId !== record.id)
        issues.push({ code: 'SOURCE_MISMATCH', entityId: record.id, message: `Journal ${journal.id} has a different source` });
    }
  }
  for (const payment of input.payments) {
    if (payment.status !== 'RECEIVED') continue;
    if (!input.journals.some(entry => entry.sourceType === 'CUSTOMER_PAYMENT' && entry.sourceId === payment.id))
      issues.push({ code: 'MISSING_PAYMENT_JOURNAL', entityId: payment.id, message: `Received payment ${payment.id} has no matching journal` });
  }
  const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  const checkSource = (id: string, type: JournalEntry['sourceType'], amount: number, reversed: boolean) => {
    const originals = input.journals.filter(j => j.sourceType === type && j.sourceId === id && !j.reversedJournalEntryId);
    if (!originals.length) { issues.push({ code: 'MISSING_JOURNAL', entityId: id, message: `${type} has no original GL journal` }); return; }
    const journal = originals[0];
    if (round(journal.totalDebit) !== round(amount) || round(journal.totalCredit) !== round(amount))
      issues.push({ code: 'AMOUNT_MISMATCH', entityId: id, message: `${type} total differs from GL` });
    const reversal = input.journals.find(j => j.id === journal.reversalJournalEntryId && j.reversedJournalEntryId === journal.id);
    if (reversed !== (journal.status === 'REVERSED') || reversed && !reversal)
      issues.push({ code: 'REVERSAL_MISMATCH', entityId: id, message: `${type} reversal differs from GL lifecycle` });
  };
  for (const journal of input.journals) {
    if (Array.isArray(journal.lines)) {
      const debit = round(journal.lines.reduce((n, line) => n + line.debit, 0));
      const credit = round(journal.lines.reduce((n, line) => n + line.credit, 0));
      if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit !== credit || debit !== round(journal.totalDebit) || credit !== round(journal.totalCredit))
        issues.push({ code: 'UNBALANCED_JOURNAL', entityId: journal.id, message: 'Journal lines and debit/credit totals do not balance' });
    }
    const records = journal.sourceType === 'CUSTOMER_INVOICE' ? input.invoices : journal.sourceType === 'CREDIT_NOTE' ? input.creditNotes : journal.sourceType === 'BANK_TRANSACTION' ? input.transactions : journal.sourceType === 'BANK_TRANSFER' ? input.transfers : journal.sourceType === 'CUSTOMER_PAYMENT' ? input.payments : journal.sourceType === 'SUPPLIER_BILL' ? input.supplierBills : journal.sourceType === 'SUPPLIER_PAYMENT' ? input.supplierPayments : journal.sourceType === 'SUPPLIER_CREDIT' ? input.supplierCredits : undefined;
    if (records && journal.sourceId && !records.some(v => v.id === journal.sourceId))
      issues.push({ code: 'ORPHAN_JOURNAL', entityId: journal.id, message: `GL source ${journal.sourceType}:${journal.sourceId} has no business record` });
  }
  for (const invoice of input.invoices ?? []) if (invoice.status !== 'DRAFT') checkSource(invoice.id, 'CUSTOMER_INVOICE', invoice.totals.total, invoice.status === 'VOID');
  for (const credit of input.creditNotes ?? []) if (credit.status !== 'DRAFT') checkSource(credit.id, 'CREDIT_NOTE', credit.totals.total, credit.status === 'VOID');
  for (const payment of input.payments) if (Number.isFinite(payment.amount)) checkSource(payment.id, 'CUSTOMER_PAYMENT', payment.amount, payment.status === 'REVERSED');
  for (const transaction of input.transactions) if (Number.isFinite(transaction.amount)) checkSource(transaction.id, 'BANK_TRANSACTION', transaction.amount, false);
  for (const transfer of input.transfers) if (Number.isFinite(transfer.amount)) checkSource(transfer.id, 'BANK_TRANSFER', transfer.amount, false);
  for (const bill of input.supplierBills ?? []) checkSource(bill.id, 'SUPPLIER_BILL', bill.totals.total, bill.status === 'VOID');
  for (const payment of input.supplierPayments ?? []) {
    checkSource(payment.id, 'SUPPLIER_PAYMENT', payment.amount, payment.status === 'REVERSED');
    if (round(payment.allocations.reduce((n, a) => n + a.amount, 0)) !== round(payment.amount))
      issues.push({ code: 'AMOUNT_MISMATCH', entityId: payment.id, message: 'Supplier payment allocations do not equal payment total' });
  }
  for (const credit of input.supplierCredits ?? []) checkSource(credit.id, 'SUPPLIER_CREDIT', credit.totals.total, credit.status === 'VOID');
  return issues;
}
