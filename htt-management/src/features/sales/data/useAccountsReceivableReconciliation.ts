import {
    useMemo,
} from "react";

import type {
    Customer,
} from "../../contacts/types/customer";

import {
    useCustomerSalesDocuments,
} from "./useSalesDocuments";

import {
    useCustomerPayments,
} from "./usePayments";

import {
    useCreditAllocations,
    useCreditNotes,
} from "./useCreditNotes";

import {
    reconcileAccountsReceivable,
} from "./accountsReceivableReconciliationService";

export function useAccountsReceivableReconciliation(
    customer: Customer,
) {
    const documents =
        useCustomerSalesDocuments(
            customer.id,
        );

    const payments =
        useCustomerPayments(
            customer.id,
        );

    const allCreditNotes =
        useCreditNotes();

    const allCreditAllocations =
        useCreditAllocations();

    const creditNotes =
        useMemo(
            () =>
                allCreditNotes.filter(
                    (creditNote) =>
                        creditNote.customerId ===
                        customer.id,
                ),
            [
                allCreditNotes,
                customer.id,
            ],
        );

    const creditAllocations =
        useMemo(
            () =>
                allCreditAllocations.filter(
                    (allocation) =>
                        allocation.customerId ===
                        customer.id,
                ),
            [
                allCreditAllocations,
                customer.id,
            ],
        );

    return useMemo(
        () =>
            reconcileAccountsReceivable({
                customer,

                documents,

                payments,

                creditNotes,

                creditAllocations,
            }),
        [
            customer,
            documents,
            payments,
            creditNotes,
            creditAllocations,
        ],
    );
}