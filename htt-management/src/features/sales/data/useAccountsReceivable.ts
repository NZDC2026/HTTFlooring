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
    calculateCustomerAccountsReceivable,
} from "./accountsReceivableService";

export function useCustomerAccountsReceivable(
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

    const creditAllocations =
        useCreditAllocations();

    const allCreditNotes =
        useCreditNotes();

    const customerCreditNotes =
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

    return useMemo(
        () =>
            calculateCustomerAccountsReceivable(
                customer,
                documents,
                payments,
                creditAllocations,
                customerCreditNotes,
            ),
        [
            customer,
            documents,
            payments,
            creditAllocations,
            customerCreditNotes,
        ],
    );
}