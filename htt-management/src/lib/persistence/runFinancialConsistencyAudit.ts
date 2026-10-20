import { salesRepository } from '../../features/sales/data/salesRepository';
import { creditNoteRepository } from '../../features/sales/data/creditNoteRepository';
import { supplierBillRepository } from '../../features/purchases/data/supplierBillRepository';
import { supplierPaymentRepository } from '../../features/purchases/data/supplierPaymentRepository';
import { supplierCreditRepository } from '../../features/purchases/data/supplierCreditRepository';
import { auditFinancialConsistency } from './financialConsistencyAudit';
import { bankTransactionRepository } from '../../features/banking/data/bankTransactionRepository';
import { paymentRepository } from '../../features/sales/data/paymentRepository';
import { journalEntryRepository } from '../../features/accounting/data/journalEntryRepository';

/** Diagnostic only: never automatically re-post or erase entries. */
export function runFinancialConsistencyAudit(projected?:{transactions?:ReturnType<typeof bankTransactionRepository.getTransactions>;transfers?:ReturnType<typeof bankTransactionRepository.getTransfers>;journals?:ReturnType<typeof journalEntryRepository.getAll>}) {
  return auditFinancialConsistency({
    transactions: projected?.transactions??bankTransactionRepository.getTransactions(),
    transfers: projected?.transfers??bankTransactionRepository.getTransfers(),
    payments: paymentRepository.getAll(),
    journals: projected?.journals??journalEntryRepository.getAll(),
    invoices: salesRepository.getAll().filter(document => document.type === 'INVOICE'),
    creditNotes: creditNoteRepository.getAll(),
    supplierBills: supplierBillRepository.getAll(),
    supplierPayments: supplierPaymentRepository.getAll(),
    supplierCredits: supplierCreditRepository.getAll(),
  });
}
