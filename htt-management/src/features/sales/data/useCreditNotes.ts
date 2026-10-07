import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    creditNoteRepository,
} from "./creditNoteRepository";

export function useCreditNotes() {
    return useSyncExternalStore(
        creditNoteRepository.subscribe,
        creditNoteRepository.getSnapshot,
        creditNoteRepository.getSnapshot,
    );
}

export function useCreditAllocations() {
    return useSyncExternalStore(
        creditNoteRepository.subscribe,
        creditNoteRepository.getAllocationSnapshot,
        creditNoteRepository.getAllocationSnapshot,
    );
}

export function useInvoiceCreditNotes(
    invoiceId:
        | string
        | undefined,
) {
    const creditNotes =
        useCreditNotes();

    return useMemo(() => {
        if (!invoiceId) {
            return [];
        }

        return creditNotes.filter(
            (creditNote) =>
                creditNote.sourceInvoiceId ===
                invoiceId,
        );
    }, [
        creditNotes,
        invoiceId,
    ]);
}

export function useInvoiceCreditAllocations(
    invoiceId:
        | string
        | undefined,
) {
    const allocations =
        useCreditAllocations();

    return useMemo(() => {
        if (!invoiceId) {
            return [];
        }

        return allocations.filter(
            (allocation) =>
                allocation.invoiceId ===
                invoiceId,
        );
    }, [
        allocations,
        invoiceId,
    ]);
}