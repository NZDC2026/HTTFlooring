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
    calculateCustomerAccountsReceivable,
} from "./accountsReceivableService";

export function useCustomerAccountsReceivable(
    customer: Customer,
) {
    const documents =
        useCustomerSalesDocuments(
            customer.id,
        );

    return useMemo(
        () =>
            calculateCustomerAccountsReceivable(
                customer,
                documents,
            ),
        [
            customer,
            documents,
        ],
    );
}