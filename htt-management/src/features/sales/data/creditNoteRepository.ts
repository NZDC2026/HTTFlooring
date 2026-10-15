import { registerRepository } from "../../security/repositoryHost";
import { loadCreditNoteState, persistCreditNoteState } from "./creditNoteStorage";
import type {
    CreditAllocation,
    CreditNote,
} from "../types/creditNote";

type Listener = () => void;

const listeners =
    new Set<Listener>();

const initialCreditState = loadCreditNoteState();
let creditNotes: CreditNote[] = initialCreditState.status === "ok" ? structuredClone(initialCreditState.data.creditNotes) : [];

let allocations: CreditAllocation[] = initialCreditState.status === "ok" ? structuredClone(initialCreditState.data.allocations) : [];

let creditNoteSnapshot: CreditNote[] = [...creditNotes];

let allocationSnapshot: CreditAllocation[] = [...allocations];

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

function commitState(nextNotes: CreditNote[], nextAllocations: CreditAllocation[]): void {
    persistCreditNoteState({ creditNotes: nextNotes, allocations: nextAllocations });
    creditNotes = nextNotes;
    allocations = nextAllocations;
    emitChange();
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

        commitState([creditNote, ...creditNotes], allocations);

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

        commitState(creditNotes.map(item => item.id === updated.id ? updated : item), allocations);

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

        commitState(creditNotes, [allocation, ...allocations]);

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

        commitState(creditNotes, allocations.map(item => item.id === updated.id ? updated : item));

        return updated;
    },

    /** Persist allocation and updated credit summary in one localStorage write. */
    commitAllocationAndCredit(allocation: CreditAllocation, updated: CreditNote): void {
        if (!creditNotes.some(n => n.id === updated.id) || allocation.creditNoteId !== updated.id)
            throw new Error("Credit note/allocation relationship is invalid");
        const nextAllocations = allocations.some(a => a.id === allocation.id)
            ? allocations.map(a => a.id === allocation.id ? allocation : a)
            : [allocation, ...allocations];
        commitState(creditNotes.map(n => n.id === updated.id ? updated : n), nextAllocations);
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
registerRepository("customerCredits", {
    repository: creditNoteRepository, read: "sales.read",
    commands: {"persistCreditNoteState": null, "emitChange": null, "create": null, "update": null, "createAllocation": null, "updateAllocation": null, "commitAllocationAndCredit": null},
    snapshot: () => ({ creditNotes, allocations }),
    restore: value => { creditNotes = value.creditNotes; allocations = value.allocations; creditNoteSnapshot = [...creditNotes]; allocationSnapshot = [...allocations]; },
    publish: () => listeners.forEach(listener => listener()),
});
