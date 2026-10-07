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
    useCreditNotes,
} from "./useCreditNotes";

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

    const allCreditNotes =
        useCreditNotes();

    const creditNotes =
        useMemo(
            () => {
                if (
                    !customerId
                ) {
                    return [];
                }

                return allCreditNotes.filter(
                    (creditNote) =>
                        creditNote.customerId ===
                        customerId,
                );
            },
            [
                allCreditNotes,
                customerId,
            ],
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

            creditNotes,

            fromDate,

            toDate,
        });
    }, [
        customerId,
        documents,
        payments,
        creditNotes,
        fromDate,
        toDate,
    ]);
}