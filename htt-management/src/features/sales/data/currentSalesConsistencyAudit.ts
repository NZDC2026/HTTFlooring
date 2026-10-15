/** Explicit, read-only diagnostic entry point. Never called automatically during posting. */
import { salesRepository } from "./salesRepository";
import { paymentRepository } from "./paymentRepository";
import { creditNoteRepository } from "./creditNoteRepository";
import { journalEntryRepository } from "../../accounting/data/journalEntryRepository";
import { auditSalesConsistency } from "./salesConsistencyAudit";
import type { Quote, SalesOrder, Invoice } from "../types/salesDocument";

export function inspectCurrentSalesConsistency() {
    const documents = salesRepository.getAll();
    return auditSalesConsistency({
        quotes: documents.filter((d): d is Quote => d.type === "QUOTE"),
        salesOrders: documents.filter((d): d is SalesOrder => d.type === "SALES_ORDER"),
        invoices: documents.filter((d): d is Invoice => d.type === "INVOICE"),
        payments: paymentRepository.getAll(),
        creditNotes: creditNoteRepository.getAll(),
        allocations: creditNoteRepository.getAllAllocations(),
        journals: journalEntryRepository.getAll(),
    });
}
