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

    return useMemo(
        () =>
            calculateCustomerAccountsReceivable(
                customer,
                documents,
                payments,
            ),
        [
            customer,
            documents,
            payments,
        ],
    );
}