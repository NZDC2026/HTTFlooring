import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    useCustomers,
} from "../../contacts/data/useCustomers";

import {
    useSalesDocuments,
} from "../../sales/data/useSalesDocuments";

import {
    paymentRepository,
} from "../../sales/data/paymentRepository";

import {
    buildAgedReceivablesReport,
} from "./agedReceivablesService";

export function useAgedReceivables(
    asOfDate: string,
) {
    const customers =
        useCustomers();

    const documents =
        useSalesDocuments();

    const payments =
        useSyncExternalStore(
            paymentRepository.subscribe,
            paymentRepository.getSnapshot,
            paymentRepository.getSnapshot,
        );

    return useMemo(
        () =>
            buildAgedReceivablesReport({
                customers,
                documents,
                payments,
                asOfDate,
            }),
        [
            customers,
            documents,
            payments,
            asOfDate,
        ],
    );
}