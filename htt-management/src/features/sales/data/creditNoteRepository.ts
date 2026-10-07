import type {
    CreditAllocation,
    CreditNote,
} from "../types/creditNote";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let creditNotes:
    CreditNote[] = [];

let allocations:
    CreditAllocation[] = [];

let creditNoteSnapshot:
    CreditNote[] = [];

let allocationSnapshot:
    CreditAllocation[] = [];

function emitChange() {
    creditNoteSnapshot = [
        ...creditNotes,
    ];

    allocationSnapshot = [
        ...allocations,
    ];

    listeners.forEach(
        (listener) =>
            listener(),
    );
}

export const creditNoteRepository = {
    subscribe(
        listener: Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        CreditNote[] {
        return creditNoteSnapshot;
    },

    getAllocationSnapshot():
        CreditAllocation[] {
        return allocationSnapshot;
    },

    getAll():
        CreditNote[] {
        return creditNoteSnapshot;
    },

    getAllAllocations():
        CreditAllocation[] {
        return allocationSnapshot;
    },

    getById(
        creditNoteId: string,
    ) {
        return creditNotes.find(
            (creditNote) =>
                creditNote.id ===
                creditNoteId,
        );
    },

    getByCustomer(
        customerId: string,
    ) {
        return creditNotes.filter(
            (creditNote) =>
                creditNote.customerId ===
                customerId,
        );
    },

    getByInvoice(
        invoiceId: string,
    ) {
        return creditNotes.filter(
            (creditNote) =>
                creditNote.sourceInvoiceId ===
                invoiceId,
        );
    },

    getAllocationsByInvoice(
        invoiceId: string,
    ) {
        return allocations.filter(
            (allocation) =>
                allocation.invoiceId ===
                invoiceId,
        );
    },

    getAllocationsByCreditNote(
        creditNoteId: string,
    ) {
        return allocations.filter(
            (allocation) =>
                allocation.creditNoteId ===
                creditNoteId,
        );
    },

    create(
        creditNote: CreditNote,
    ) {
        if (
            creditNotes.some(
                (item) =>
                    item.id ===
                    creditNote.id,
            )
        ) {
            throw new Error(
                `Credit note ${creditNote.id} already exists`,
            );
        }

        creditNotes = [
            creditNote,
            ...creditNotes,
        ];

        emitChange();

        return creditNote;
    },

    update(
        updated:
            CreditNote,
    ) {
        const exists =
            creditNotes.some(
                (item) =>
                    item.id ===
                    updated.id,
            );

        if (!exists) {
            throw new Error(
                `Credit note ${updated.id} was not found`,
            );
        }

        creditNotes =
            creditNotes.map(
                (item) =>
                    item.id ===
                        updated.id
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    createAllocation(
        allocation:
            CreditAllocation,
    ) {
        if (
            allocations.some(
                (item) =>
                    item.id ===
                    allocation.id,
            )
        ) {
            throw new Error(
                `Credit allocation ${allocation.id} already exists`,
            );
        }

        allocations = [
            allocation,
            ...allocations,
        ];

        emitChange();

        return allocation;
    },

    updateAllocation(
        updated:
            CreditAllocation,
    ) {
        const exists =
            allocations.some(
                (item) =>
                    item.id ===
                    updated.id,
            );

        if (!exists) {
            throw new Error(
                `Credit allocation ${updated.id} was not found`,
            );
        }

        allocations =
            allocations.map(
                (item) =>
                    item.id ===
                        updated.id
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    getAllocationById(
        allocationId: string,
    ) {
        return allocations.find(
            (allocation) =>
                allocation.id ===
                allocationId,
        );
    },
};