export type StatementEntryType =
    | "INVOICE"
    | "INVOICE_VOID"
    | "PAYMENT"
    | "PAYMENT_REVERSAL"
    | "CREDIT_NOTE"
    | "CREDIT_NOTE_VOID";

export interface StatementEntry {
    id: string;

    date: string;

    type: StatementEntryType;

    reference: string;

    description: string;

    invoiceId?: string;
    paymentId?: string;
    creditNoteId?: string;

    debit: number;
    credit: number;

    balance: number;
}

export interface CustomerStatement {
    customerId: string;

    fromDate: string;
    toDate: string;

    openingBalance: number;

    totalDebits: number;
    totalCredits: number;

    closingBalance: number;

    entries: StatementEntry[];
}