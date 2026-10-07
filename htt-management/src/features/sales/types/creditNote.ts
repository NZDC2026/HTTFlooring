import type {
    SalesDocumentLine,
    SalesDocumentTotals,
} from "./salesDocument";

export type CreditNoteStatus =
    | "DRAFT"
    | "ISSUED"
    | "FULLY_APPLIED"
    | "VOID";

export interface CreditNote {
    id: string;

    creditNoteNumber: string;

    customerId: string;

    /**
     * The invoice that originally caused the credit.
     */
    sourceInvoiceId: string;

    creditDate: string;

    status: CreditNoteStatus;

    reason: string;

    /**
     * Snapshot credit lines.
     *
     * These are independent from the original
     * invoice after the credit note is created.
     */
    lines: SalesDocumentLine[];

    totals: SalesDocumentTotals;

    /**
     * Current allocation summary.
     *
     * Accounting history itself lives in
     * CreditAllocation records.
     */
    amountApplied: number;
    amountAvailable: number;

    issuedAt?: string;

    voidedAt?: string;
    voidReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreditAllocation {
    id: string;

    allocationNumber: string;

    customerId: string;

    creditNoteId: string;
    invoiceId: string;

    allocationDate: string;

    amount: number;

    status:
    | "APPLIED"
    | "REVERSED";

    reversedAt?: string;
    reversalReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateCreditNoteInput {
    invoiceId: string;

    creditDate: string;

    reason: string;

    /**
     * First implementation supports full invoice
     * line snapshots.
     *
     * Partial line editing will be added in the UI
     * stage without changing the accounting model.
     */
    lines: SalesDocumentLine[];
}