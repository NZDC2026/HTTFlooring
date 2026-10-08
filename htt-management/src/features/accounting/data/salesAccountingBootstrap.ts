import {
    salesRepository,
} from "../../sales/data/salesRepository";

import {
    paymentRepository,
} from "../../sales/data/paymentRepository";

import {
    creditNoteRepository,
} from "../../sales/data/creditNoteRepository";

import {
    salesAccountingPostingService,
} from "./salesAccountingPostingService";

let initialized =
    false;

export function initializeSalesAccounting() {
    if (initialized) {
        return;
    }

    initialized =
        true;

    const invoices =
        salesRepository
            .getAll()
            .filter(
                (document) =>
                    document.type ===
                    "INVOICE",
            );

    for (
        const invoice
        of invoices
    ) {
        salesAccountingPostingService
            .postInvoice(
                invoice,
            );

        if (
            invoice.status ===
            "VOID"
        ) {
            salesAccountingPostingService
                .reverseInvoice(
                    invoice,
                );
        }
    }

    const payments =
        paymentRepository
            .getAll();

    for (
        const payment
        of payments
    ) {
        salesAccountingPostingService
            .postPayment(
                payment,
            );

        if (
            payment.status ===
            "REVERSED"
        ) {
            salesAccountingPostingService
                .reversePayment(
                    payment,
                );
        }
    }

    const creditNotes =
        creditNoteRepository
            .getAll();

    for (
        const creditNote
        of creditNotes
    ) {
        if (
            creditNote.status ===
            "DRAFT"
        ) {
            continue;
        }

        salesAccountingPostingService
            .postCreditNote(
                creditNote,
            );

        if (
            creditNote.status ===
            "VOID"
        ) {
            salesAccountingPostingService
                .reverseCreditNote(
                    creditNote,
                );
        }
    }
}