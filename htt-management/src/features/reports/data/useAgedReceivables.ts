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
    useCreditNotes,
} from "../../sales/data/useCreditNotes";

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

    const creditNotes =
        useCreditNotes();

    return useMemo(
        () => {
            const input = {
                customers,
                documents,
                payments,
                creditAllocations,
                creditNotes,
                asOfDate,
            };
            const trend = Array.from({length:6},(_,i)=>{const d=new Date(asOfDate+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-(5-i)+1);d.setUTCDate(0);const date=i===5?asOfDate:d.toISOString().slice(0,10);return {date,total:buildAgedReceivablesReport({...input,asOfDate:date}).totalOutstanding};});
            return {...buildAgedReceivablesReport(input),trend};
        },
        [
            customers,
            documents,
            payments,
            creditAllocations,
            creditNotes,
            asOfDate,
        ],
    );
}