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
    creditNoteRepository,
} from "../../sales/data/creditNoteRepository";

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

    const creditAllocations =
        useSyncExternalStore(
            creditNoteRepository.subscribe,
            creditNoteRepository.getAllocationSnapshot,
            creditNoteRepository.getAllocationSnapshot,
        );

    return useMemo(
        () =>
            buildAgedReceivablesReport({
                customers,
                documents,
                payments,
                creditAllocations,
                asOfDate,
            }),
        [
            customers,
            documents,
            payments,
            creditAllocations,
            asOfDate,
        ],
    );
}