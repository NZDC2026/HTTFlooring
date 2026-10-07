import {
    useMemo,
} from "react";

import {
    useCustomerSalesDocuments,
} from "./useSalesDocuments";

import {
    useCustomerPayments,
} from "./usePayments";

import {
    buildCustomerStatement,
} from "./customerStatementService";

export function useCustomerStatement(
    customerId:
        | string
        | undefined,

    fromDate: string,

    toDate: string,
) {
    const documents =
        useCustomerSalesDocuments(
            customerId,
        );

    const payments =
        useCustomerPayments(
            customerId,
        );

    return useMemo(() => {
        if (
            !customerId ||
            !fromDate ||
            !toDate
        ) {
            return undefined;
        }

        return buildCustomerStatement({
            customerId,
            documents,
            payments,
            fromDate,
            toDate,
        });
    }, [
        customerId,
        documents,
        payments,
        fromDate,
        toDate,
    ]);
}