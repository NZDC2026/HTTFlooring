import { useMemo, useSyncExternalStore } from "react";
import { salesRepository } from "../../sales/data/salesRepository";
import { paymentRepository } from "../../sales/data/paymentRepository";
import { creditNoteRepository } from "../../sales/data/creditNoteRepository";
import { supplierBillRepository } from "../../purchases/data/supplierBillRepository";
import { supplierPaymentRepository } from "../../purchases/data/supplierPaymentRepository";
import { supplierCreditRepository } from "../../purchases/data/supplierCreditRepository";
import { calculateDashboardBasis, type DashboardBasisInput } from "./dashboardBasis";
export function useDashboardBasis(input: Omit<DashboardBasisInput, "documents" | "bills" | "payments" | "creditAllocations" | "supplierPayments" | "supplierCreditAllocations">) {
    const documents = useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    const bills = useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot);
    const payments = useSyncExternalStore(paymentRepository.subscribe, paymentRepository.getSnapshot, paymentRepository.getSnapshot);
    const creditAllocations = useSyncExternalStore(creditNoteRepository.subscribe, creditNoteRepository.getAllocationSnapshot, creditNoteRepository.getAllocationSnapshot);
    const supplierPayments = useSyncExternalStore(supplierPaymentRepository.subscribe, supplierPaymentRepository.getSnapshot, supplierPaymentRepository.getSnapshot);
    const supplierCreditAllocations = useSyncExternalStore(supplierCreditRepository.subscribe, supplierCreditRepository.getAllocationSnapshot, supplierCreditRepository.getAllocationSnapshot);
    const { accounts, journals, banks, date, from, basis, includeGst, currency } = input;
    return useMemo(() => calculateDashboardBasis({ accounts, journals, banks, date, from, basis, includeGst, currency, documents, bills, payments, creditAllocations, supplierPayments, supplierCreditAllocations }), [accounts, journals, banks, date, from, basis, includeGst, currency, documents, bills, payments, creditAllocations, supplierPayments, supplierCreditAllocations]);
}
