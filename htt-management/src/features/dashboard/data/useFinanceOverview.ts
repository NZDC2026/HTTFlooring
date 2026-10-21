import {useStatementLines} from '../../finance-closure/bankStatementRepository';
import { paymentRepository } from "../../sales/data/paymentRepository";
import { creditNoteRepository } from "../../sales/data/creditNoteRepository";
import { supplierPaymentRepository } from "../../purchases/data/supplierPaymentRepository";
import { supplierCreditRepository } from "../../purchases/data/supplierCreditRepository";
import { useMemo, useSyncExternalStore } from "react";
import { salesRepository } from "../../sales/data/salesRepository";
import { supplierBillRepository } from "../../purchases/data/supplierBillRepository";
import { bankReconciliationRepository } from "../../banking/data/bankReconciliationRepository";
import { useBankAccounts } from "../../banking/data/useBanking";
import { useJournalEntries } from "../../accounting/data/useAccounting";
import { calculateFinanceOverview } from "./financeOverview";

export function useFinanceOverview(today: string) {
    const documents = useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    const bills = useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot);
    const reconciliations = useSyncExternalStore(bankReconciliationRepository.subscribe, bankReconciliationRepository.getSnapshot, bankReconciliationRepository.getSnapshot);
    const payments = useSyncExternalStore(paymentRepository.subscribe, paymentRepository.getSnapshot, paymentRepository.getSnapshot);
    const creditAllocations = useSyncExternalStore(creditNoteRepository.subscribe, creditNoteRepository.getAllocationSnapshot, creditNoteRepository.getAllocationSnapshot);
    const supplierPayments = useSyncExternalStore(supplierPaymentRepository.subscribe, supplierPaymentRepository.getSnapshot, supplierPaymentRepository.getSnapshot);
    const supplierCreditAllocations = useSyncExternalStore(supplierCreditRepository.subscribe, supplierCreditRepository.getAllocationSnapshot, supplierCreditRepository.getAllocationSnapshot);
    const statements = useStatementLines();
    const banks = useBankAccounts();
    const journals = useJournalEntries();
    return useMemo(() => calculateFinanceOverview(documents.filter(d => d.type === "INVOICE"), bills, banks, journals, reconciliations, today, { payments, creditAllocations, supplierPayments, supplierCreditAllocations }, statements), [statements, documents, bills, banks, journals, reconciliations, today, payments, creditAllocations, supplierPayments, supplierCreditAllocations]);
}
